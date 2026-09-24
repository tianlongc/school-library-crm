<?php

use App\Domain\Community\Models\CommunityPost;
use App\Domain\Community\Models\CommunityPostComment;
use App\Domain\User\Models\User;
use Database\Seeders\DatabaseSeeder;
use Spatie\Permission\Models\Permission;

it('seeds community permissions before assigning roles', function () {
    $this->seed(DatabaseSeeder::class);

    expect(Permission::where('name', 'community.posts.create')
        ->where('guard_name', 'web')
        ->exists())->toBeTrue();
});

it('seeds a cursor-paginated community feed with comments', function (): void {
    $this->seed(DatabaseSeeder::class);

    $viewer = User::query()
        ->where('email', 'community.reader@example.test')
        ->firstOrFail();

    $response = $this->actingAs($viewer)
        ->postJson(
            route('member.community.feed'),
            [
                'per_page' => 10,
            ],
        )
        ->assertSuccessful()
        ->assertJsonPath('meta.per_page', 10)
        ->assertJsonPath('meta.prev_cursor', null)
        ->assertJsonCount(10, 'data')
        ->assertJsonPath('data.0.comments_count', 3);

    expect($response->json('meta.next_cursor'))
        ->toBeString()
        ->not->toBeEmpty();

    $post = CommunityPost::query()
        ->where('body', 'What book helped you see a familiar place differently?')
        ->firstOrFail();

    $this->actingAs($viewer)
        ->postJson(route('member.community.posts.comments.index', $post))
        ->assertSuccessful()
        ->assertJsonCount(3, 'data');
});

it('does not duplicate community demo data when seeded twice', function (): void {
    $this->seed(DatabaseSeeder::class);
    $this->seed(DatabaseSeeder::class);

    expect(CommunityPost::query()->count())->toBe(25)
        ->and(CommunityPostComment::query()->count())->toBe(75);
});
