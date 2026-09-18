<?php

use App\Domain\Book\Models\Book;
use App\Domain\Community\Models\CommunityPost;
use App\Domain\User\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

describe('community post creation', function () {
    beforeEach(function () {
        $this->student = User::factory()->create();
        $this->student->assignRole('member');

        $this->actingAs($this->student);
    });

    it('allows a student to publish a community post', function () {
        $book = Book::factory()->create();

        $this->postJson(
            route('member.community.posts.store'),
            [
                'body' => 'I really enjoyed this book.',
                'book_id' => $book->id,
            ],
        )
            ->assertCreated()
            ->assertJsonPath(
                'post.body',
                'I really enjoyed this book.',
            )
            ->assertJsonPath(
                'post.book.id',
                $book->id,
            );

        $this->assertDatabaseHas('community_posts', [
            'user_id' => $this->student->id,
            'book_id' => $book->id,
            'body' => 'I really enjoyed this book.',
            'status' => 'published',
        ]);
    });

    it('allows publishing without a book attachment', function () {
        $this->postJson(
            route('member.community.posts.store'),
            [
                'body' => 'Any fantasy recommendations?',
            ],
        )
            ->assertCreated()
            ->assertJsonPath(
                'post.body',
                'Any fantasy recommendations?',
            );

        $this->assertDatabaseHas('community_posts', [
            'user_id' => $this->student->id,
            'book_id' => null,
            'body' => 'Any fantasy recommendations?',
            'status' => 'published',
        ]);
    });

    it('does not allow a student to spoof the post author', function () {
        $otherUser = User::factory()->create();

        $this->postJson(
            route('member.community.posts.store'),
            [
                'body' => 'Hello',
                'user_id' => $otherUser->id,
            ],
        )
            ->assertCreated();

        $this->assertDatabaseHas('community_posts', [
            'user_id' => $this->student->id,
            'body' => 'Hello',
        ]);

        $this->assertDatabaseMissing('community_posts', [
            'user_id' => $otherUser->id,
            'body' => 'Hello',
        ]);
    });
});

describe('community post update', function () {
    beforeEach(function () {
        $this->student = User::factory()->create();
        $this->student->assignRole('member');

        $this->actingAs($this->student);
    });

    it('allows a student to update their own community post', function () {
        $post = CommunityPost::factory()->create([
            'user_id' => $this->student->id,
            'body' => 'Original body',
        ]);

        $book = Book::factory()->create();

        $this->postJson(
            route('member.community.posts.update', $post),
            [
                'body' => 'Updated body',
                'book_id' => $book->id,
            ],
        )
            ->assertSuccessful()
            ->assertJsonPath(
                'post.body',
                'Updated body',
            )
            ->assertJsonPath(
                'post.book.id',
                $book->id,
            );

        $this->assertDatabaseHas('community_posts', [
            'id' => $post->id,
            'user_id' => $this->student->id,
            'book_id' => $book->id,
            'body' => 'Updated body',
        ]);
    });

    it("does not allow a student to update another student's post", function () {
        $otherStudent = User::factory()->create();

        $post = CommunityPost::factory()->create([
            'user_id' => $otherStudent->id,
            'body' => 'Original body',
        ]);

        $this->postJson(
            route('member.community.posts.update', $post),
            [
                'body' => 'Hacked body',
                'book_id' => null,
            ],
        )
            ->assertForbidden();

        $this->assertDatabaseHas('community_posts', [
            'id' => $post->id,
            'user_id' => $otherStudent->id,
            'body' => 'Original body',
        ]);
    });

    it('allows a student to remove the attached book when updating', function () {
        $book = Book::factory()->create();

        $post = CommunityPost::factory()->create([
            'user_id' => $this->student->id,
            'book_id' => $book->id,
            'body' => 'Original body',
        ]);

        $this->postJson(
            route('member.community.posts.update', $post),
            [
                'body' => 'Updated body',
                'book_id' => null,
            ],
        )
            ->assertSuccessful();

        $this->assertDatabaseHas('community_posts', [
            'id' => $post->id,
            'user_id' => $this->student->id,
            'book_id' => null,
            'body' => 'Updated body',
        ]);
    });
});

describe('community feed', function () {
    beforeEach(function () {
        $this->student = User::factory()->create();

        $this->actingAs($this->student);
    });

    it('excludes hidden posts from the feed', function () {
        $visiblePost = CommunityPost::factory()->create([
            'body' => 'Visible post',
        ]);

        CommunityPost::factory()
            ->hidden()
            ->create([
                'body' => 'Hidden post',
            ]);

        $this->postJson(
            route('member.community.feed'),
            [
                'page' => 1,
                'per_page' => 10,
            ],
        )
            ->assertSuccessful()
            ->assertJsonFragment([
                'id' => $visiblePost->id,
                'body' => 'Visible post',
            ])
            ->assertJsonMissing([
                'body' => 'Hidden post',
            ]);
    });
});
