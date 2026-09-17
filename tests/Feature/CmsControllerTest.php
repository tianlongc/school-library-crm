<?php

use App\Domain\Book\Models\Book;
use App\Domain\Cms\Models\CmsPage;
use App\Domain\User\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

function cmsPageDocument(array $blocks = []): array
{
    return [
        'schema_version' => 1,
        'blocks' => $blocks,
    ];
}

function createCmsPageForControllerTest(array $attributes = []): CmsPage
{
    $page = CmsPage::query()->where('key', 'student_portal_homepage')->firstOrFail();
    $page->update(array_merge([
        'draft_content' => cmsPageDocument(),
        'published_content' => cmsPageDocument(),
        'published_at' => now(),
    ], $attributes));

    return $page->refresh();
}

beforeEach(function () {
    $this->withoutVite();
    $this->seed(RolesAndPermissionsSeeder::class);
});

it('redirects guests away from cms management', function (string $routeName) {
    $this->get(route($routeName))
        ->assertRedirect(route('login'));
})->with([
    'builder' => 'admin.cms.index',
    'preview' => 'admin.cms.preview',
]);

it('forbids non-administrators from cms management', function (string $role) {
    $user = User::factory()->create();
    $user->assignRole($role);

    $this->actingAs($user)
        ->get(route('admin.cms.index'))
        ->assertForbidden();
})->with([
    'member' => 'member',
    'librarian' => 'librarian',
]);

it('renders the student portal page builder for administrators', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $book = Book::factory()->create([
        'title' => 'The Hobbit',
        'author' => 'J. R. R. Tolkien',
    ]);
    $page = createCmsPageForControllerTest([
        'draft_content' => cmsPageDocument([
            [
                'id' => 'hero-one',
                'type' => 'hero',
                'is_visible' => true,
                'data' => [
                    'eyebrow' => 'School library',
                    'heading' => 'Find your next story',
                    'body' => 'Explore books selected for students.',
                ],
            ],
        ]),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.cms.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $inertia) => $inertia
            ->component('Admin/Cms/Builder')
            ->where('page.id', $page->id)
            ->where('page.key', 'student_portal_homepage')
            ->where('page.draft_content.blocks.0.type', 'hero')
            ->where('bookOptions.0.value', $book->id)
            ->where('bookOptions.0.label', 'The Hobbit - J. R. R. Tolkien')
        );
});

it('autosaves a private draft without changing published content', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $publishedContent = cmsPageDocument([
        [
            'id' => 'published-announcement',
            'type' => 'announcement',
            'is_visible' => true,
            'data' => [
                'heading' => 'Published announcement',
                'body' => 'Students can see this.',
            ],
        ],
    ]);
    $page = createCmsPageForControllerTest([
        'published_content' => $publishedContent,
    ]);
    $draftContent = cmsPageDocument([
        [
            'id' => 'draft-announcement',
            'type' => 'announcement',
            'is_visible' => true,
            'data' => [
                'heading' => 'Draft announcement',
                'body' => 'Only administrators can preview this.',
            ],
        ],
    ]);

    $this->actingAs($admin)
        ->postJson(route('admin.cms.content.update'), [
            'content' => $draftContent,
        ])
        ->assertSuccessful()
        ->assertJsonPath('page.draft_content.blocks.0.id', 'draft-announcement')
        ->assertJsonPath('page.published_content.blocks.0.id', 'published-announcement');

    $page->refresh();

    expect($page->draft_content)->toBe($draftContent)
        ->and($page->published_content)->toBe($publishedContent)
        ->and($page->updated_by_user_id)->toEqual($admin->id);
});

it('rejects unknown page builder blocks and data fields', function (array $block) {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    createCmsPageForControllerTest();

    $this->actingAs($admin)
        ->postJson(route('admin.cms.content.update'), [
            'content' => cmsPageDocument([$block]),
        ])
        ->assertUnprocessable();
})->with([
    'unknown block type' => [[
        'id' => 'unknown-one',
        'type' => 'video',
        'is_visible' => true,
        'data' => ['heading' => 'Unknown'],
    ]],
    'unknown block data field' => [[
        'id' => 'hero-one',
        'type' => 'hero',
        'is_visible' => true,
        'data' => [
            'heading' => 'Welcome',
            'script' => '<script>alert(1)</script>',
        ],
    ]],
]);

it('renders an authenticated preview from the private draft', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $page = createCmsPageForControllerTest([
        'draft_content' => cmsPageDocument([
            [
                'id' => 'draft-copy',
                'type' => 'rich_text',
                'is_visible' => true,
                'data' => [
                    'heading' => 'Draft reading guide',
                    'body' => 'This has not been published.',
                ],
            ],
        ]),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.cms.preview'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $inertia) => $inertia
            ->component('Admin/Cms/Preview')
            ->where('page.id', $page->id)
            ->where('content.blocks.0.id', 'draft-copy')
            ->where('isDraftPreview', true)
        );
});

it('publishes an immutable snapshot of the current draft', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $draftContent = cmsPageDocument([
        [
            'id' => 'ready-to-publish',
            'type' => 'call_to_action',
            'is_visible' => true,
            'data' => [
                'heading' => 'Visit the catalogue',
                'body' => 'Find a book that interests you.',
                'label' => 'Browse books',
                'target' => 'catalogue',
            ],
        ],
    ]);
    $page = createCmsPageForControllerTest([
        'draft_content' => $draftContent,
        'published_content' => cmsPageDocument(),
        'published_at' => null,
    ]);

    $this->actingAs($admin)
        ->postJson(route('admin.cms.publish'))
        ->assertSuccessful()
        ->assertJsonPath('page.published_content.blocks.0.id', 'ready-to-publish');

    $page->refresh();

    expect($page->published_content)->toBe($draftContent)
        ->and($page->published_at)->not->toBeNull()
        ->and($page->updated_by_user_id)->toEqual($admin->id);
});

it('forbids librarians from changing or previewing cms content', function (string $method, string $routeName) {
    $librarian = User::factory()->create();
    $librarian->assignRole('librarian');
    createCmsPageForControllerTest();

    $response = $method === 'get'
        ? $this->actingAs($librarian)->get(route($routeName))
        : $this->actingAs($librarian)->postJson(route($routeName), [
            'content' => cmsPageDocument(),
        ]);

    $response->assertForbidden();
})->with([
    'autosave' => ['post', 'admin.cms.content.update'],
    'publish' => ['post', 'admin.cms.publish'],
    'preview' => ['get', 'admin.cms.preview'],
]);
