<?php

use App\Domain\Book\Models\Book;
use App\Domain\Cms\Models\CmsPage;
use App\Domain\User\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
            ->where('bookOptions.0.cover_url', null)
        );
});

it('includes book cover urls in page builder options', function () {
    Storage::fake('public');

    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $book = Book::factory()->create([
        'title' => 'The Left Hand of Darkness',
        'author' => 'Ursula K. Le Guin',
    ]);
    $cover = $book
        ->addMedia(UploadedFile::fake()->image('left-hand-of-darkness.jpg'))
        ->toMediaCollection('cover');

    createCmsPageForControllerTest();

    $this->actingAs($admin)
        ->get(route('admin.cms.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $inertia) => $inertia
            ->where('bookOptions.0.id', $book->id)
            ->where('bookOptions.0.cover_url', $cover->getUrl())
        );
});

it('uploads a page builder image for administrators', function () {
    Storage::fake('public');

    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $page = createCmsPageForControllerTest();

    $response = $this->actingAs($admin)
        ->post(route('admin.cms.media.store'), [
            'image' => UploadedFile::fake()->image('library.webp', 1200, 800),
        ]);

    $response
        ->assertCreated()
        ->assertJsonPath('media.uuid', fn (mixed $uuid): bool => is_string($uuid) && $uuid !== '')
        ->assertJsonPath('media.url', fn (mixed $url): bool => is_string($url) && $url !== '');

    $media = $page->refresh()->getFirstMedia('builder_images');

    expect($media)->not->toBeNull()
        ->and($media->file_name)->toBe('library.webp');
    Storage::disk('public')->assertExists($media->getPathRelativeToRoot());
});

it('rejects an invalid page builder image', function () {
    Storage::fake('public');

    $admin = User::factory()->create();
    $admin->assignRole('admin');
    createCmsPageForControllerTest();

    $this->actingAs($admin)
        ->withHeader('Accept', 'application/json')
        ->post(route('admin.cms.media.store'), [
            'image' => UploadedFile::fake()->create('script.svg', 10, 'image/svg+xml'),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('image');
});

it('rejects a page builder image larger than five megabytes', function () {
    Storage::fake('public');

    $admin = User::factory()->create();
    $admin->assignRole('admin');
    createCmsPageForControllerTest();

    $this->actingAs($admin)
        ->withHeader('Accept', 'application/json')
        ->post(route('admin.cms.media.store'), [
            'image' => UploadedFile::fake()->image('library.jpg')->size(5121),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('image');
});

it('forbids librarians from uploading page builder images', function () {
    $librarian = User::factory()->create();
    $librarian->assignRole('librarian');
    createCmsPageForControllerTest();

    $this->actingAs($librarian)
        ->post(route('admin.cms.media.store'), [
            'image' => UploadedFile::fake()->image('library.jpg'),
        ])
        ->assertForbidden();
});

it('rejects page builder media that belongs to another cms page', function () {
    Storage::fake('public');

    $admin = User::factory()->create();
    $admin->assignRole('admin');
    createCmsPageForControllerTest();
    $otherPage = CmsPage::factory()->create([
        'key' => 'other-page',
    ]);
    $foreignMedia = $otherPage
        ->addMedia(UploadedFile::fake()->image('foreign.jpg'))
        ->toMediaCollection('builder_images');

    $this->actingAs($admin)
        ->postJson(route('admin.cms.content.update'), [
            'content' => cmsPageDocument([
                [
                    'id' => 'foreign-image',
                    'type' => 'image',
                    'is_visible' => true,
                    'data' => [
                        'media_uuid' => $foreignMedia->uuid,
                        'alt' => 'Foreign image',
                    ],
                ],
            ]),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('content.blocks.0.data.media_uuid');
});

it('resolves page builder media urls for draft preview', function () {
    Storage::fake('public');

    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $page = createCmsPageForControllerTest();
    $media = $page
        ->addMedia(UploadedFile::fake()->image('reading-room.jpg'))
        ->toMediaCollection('builder_images');
    $page->update([
        'draft_content' => cmsPageDocument([
            [
                'id' => 'reading-room',
                'type' => 'image',
                'is_visible' => true,
                'data' => [
                    'media_uuid' => $media->uuid,
                    'alt' => 'School reading room',
                ],
            ],
        ]),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.cms.preview'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $inertia) => $inertia
            ->where('content.blocks.0.data.media_uuid', $media->uuid)
            ->where('content.blocks.0.data.media_url', $media->getUrl())
        );
});

it('keeps published builder media until a draft without it is published', function () {
    Storage::fake('public');

    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $page = createCmsPageForControllerTest();
    $media = $page
        ->addMedia(UploadedFile::fake()->image('published-hero.jpg'))
        ->toMediaCollection('builder_images');
    $publishedContent = cmsPageDocument([
        [
            'id' => 'published-hero',
            'type' => 'hero',
            'is_visible' => true,
            'data' => [
                'eyebrow' => 'School library',
                'heading' => 'Published hero',
                'body' => 'Students can still see this image.',
                'media_uuid' => $media->uuid,
            ],
        ],
    ]);
    $page->update([
        'draft_content' => $publishedContent,
        'published_content' => $publishedContent,
    ]);

    $this->actingAs($admin)
        ->postJson(route('admin.cms.content.update'), [
            'content' => cmsPageDocument(),
        ])
        ->assertSuccessful();

    expect($page->refresh()->getMedia('builder_images')->contains('uuid', $media->uuid))->toBeTrue();
    Storage::disk('public')->assertExists($media->getPathRelativeToRoot());

    $this->actingAs($admin)
        ->postJson(route('admin.cms.publish'))
        ->assertSuccessful();

    expect($page->refresh()->getMedia('builder_images')->contains('uuid', $media->uuid))->toBeFalse();
    Storage::disk('public')->assertMissing($media->getPathRelativeToRoot());
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
