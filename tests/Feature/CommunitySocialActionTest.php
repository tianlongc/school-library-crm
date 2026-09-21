<?php

use App\Domain\Community\Models\CommunityPost;
use App\Domain\Community\Models\CommunityPostComment;
use App\Domain\Community\Models\CommunityPostLike;
use App\Domain\User\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

beforeEach(function (): void {
    $this->seed(RolesAndPermissionsSeeder::class);

    $this->student = User::factory()->create();
    $this->student->assignRole('member');

    $this->actingAs($this->student);
});

it('allows a member to comment on a published post', function (): void {
    $post = CommunityPost::factory()->create();

    $this->postJson(
        route('member.community.posts.comments.store', $post),
        ['body' => 'This is a useful recommendation.'],
    )
        ->assertCreated()
        ->assertJsonPath(
            'comment.body',
            'This is a useful recommendation.',
        )
        ->assertJsonPath('comments_count', 1);

    expect(
        CommunityPostComment::query()
            ->where('community_post_id', $post->id)
            ->where('user_id', $this->student->id)
            ->exists(),
    )->toBeTrue();
});

it('toggles a post like', function (): void {
    $post = CommunityPost::factory()->create();

    $this->postJson(
        route('member.community.posts.like', $post),
    )
        ->assertSuccessful()
        ->assertJsonPath('liked', true)
        ->assertJsonPath('likes_count', 1);

    $this->postJson(
        route('member.community.posts.like', $post),
    )
        ->assertSuccessful()
        ->assertJsonPath('liked', false)
        ->assertJsonPath('likes_count', 0);

    expect(
        CommunityPostLike::query()
            ->where('community_post_id', $post->id)
            ->where('user_id', $this->student->id)
            ->exists(),
    )->toBeFalse();
});

it('increments the share count', function (): void {
    $post = CommunityPost::factory()->create();

    $this->postJson(
        route('member.community.posts.share', $post),
    )
        ->assertSuccessful()
        ->assertJsonPath('shares_count', 1);

    $this->assertDatabaseHas('community_posts', [
        'id' => $post->id,
        'shares_count' => 1,
    ]);
});

it('returns social metadata in the feed', function (): void {
    $post = CommunityPost::factory()->create();

    CommunityPostComment::factory()->create([
        'community_post_id' => $post->id,
    ]);

    CommunityPostLike::create([
        'community_post_id' => $post->id,
        'user_id' => $this->student->id,
    ]);

    $this->postJson(
        route('member.community.feed'),
        [
            'page' => 1,
            'per_page' => 10,
        ],
    )
        ->assertSuccessful()
        ->assertJsonPath('data.0.comments_count', 1)
        ->assertJsonPath('data.0.likes_count', 1)
        ->assertJsonPath('data.0.liked_by_me', true)
        ->assertJsonPath('data.0.can.comment', true);
});

it('returns edit and delete permissions for the post owner', function (): void {
    $post = CommunityPost::factory()->create([
        'user_id' => $this->student->id,
    ]);

    $otherPost = CommunityPost::factory()->create();

    $response = $this->postJson(
        route('member.community.feed'),
        [
            'page' => 1,
            'per_page' => 10,
        ],
    )->assertSuccessful();

    $posts = collect($response->json('data'));

    expect($posts->firstWhere('id', $post->id)['can']['update'])
        ->toBeTrue()
        ->and($posts->firstWhere('id', $post->id)['can']['delete'])
        ->toBeTrue()
        ->and($posts->firstWhere('id', $otherPost->id)['can']['update'])
        ->toBeFalse()
        ->and($posts->firstWhere('id', $otherPost->id)['can']['delete'])
        ->toBeFalse();
});
