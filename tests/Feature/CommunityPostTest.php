<?php

use App\Domain\Book\Models\Book;
use App\Domain\Community\Models\CommunityPost;
use App\Domain\User\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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
            )
            ->assertJsonPath('post.images', []);

        $this->assertDatabaseHas('community_posts', [
            'user_id' => $this->student->id,
            'book_id' => null,
            'body' => 'Any fantasy recommendations?',
            'status' => 'published',
        ]);
    });

    it('allows a student to publish a post with four images', function () {
        Storage::fake('public');

        $images = collect(range(1, 4))
            ->map(fn (int $number) => UploadedFile::fake()->image("gallery-{$number}.jpg"))
            ->all();

        $response = $this->withHeader('Accept', 'application/json')
            ->post(
                route('member.community.posts.store'),
                [
                    'body' => 'A four-image gallery.',
                    'images' => $images,
                ],
            );

        $response
            ->assertCreated()
            ->assertJsonCount(4, 'post.images')
            ->assertJsonPath('post.images.0.url', fn (mixed $url): bool => is_string($url) && $url !== '');

        $post = CommunityPost::query()->latest('id')->firstOrFail();

        expect($post->getMedia('images'))->toHaveCount(4);
    });

    it('rejects more than four images', function () {
        $images = collect(range(1, 5))
            ->map(fn (int $number) => UploadedFile::fake()->image("gallery-{$number}.jpg"))
            ->all();

        $this->withHeader('Accept', 'application/json')
            ->post(
                route('member.community.posts.store'),
                [
                    'body' => 'Too many images.',
                    'images' => $images,
                ],
            )
            ->assertUnprocessable()
            ->assertJsonValidationErrors('images');
    });

    it('rejects non-image gallery files', function () {
        $this->withHeader('Accept', 'application/json')
            ->post(
                route('member.community.posts.store'),
                [
                    'body' => 'An invalid image.',
                    'images' => [UploadedFile::fake()->create('gallery.svg', 10, 'image/svg+xml')],
                ],
            )
            ->assertUnprocessable()
            ->assertJsonValidationErrors('images.0');
    });

    it('rejects a gallery image larger than five megabytes', function () {
        $this->withHeader('Accept', 'application/json')
            ->post(
                route('member.community.posts.store'),
                [
                    'body' => 'An oversized image.',
                    'images' => [UploadedFile::fake()->image('gallery.jpg')->size(5121)],
                ],
            )
            ->assertUnprocessable()
            ->assertJsonValidationErrors('images.0');
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

describe('community post deletion', function () {
    beforeEach(function () {
        $this->student = User::factory()->create();
        $this->student->assignRole('member');

        $this->actingAs($this->student);
    });

    it('removes attached gallery images when a student deletes their post', function () {
        Storage::fake('public');

        $post = CommunityPost::factory()->create([
            'user_id' => $this->student->id,
        ]);
        $media = $post
            ->addMedia(UploadedFile::fake()->image('gallery.jpg'))
            ->toMediaCollection('images');

        $this->postJson(
            route('member.community.posts.destroy', $post),
        )
            ->assertSuccessful();

        $this->assertDatabaseMissing('media', [
            'id' => $media->id,
        ]);
        Storage::disk('public')->assertMissing($media->getPathRelativeToRoot());
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
            )
            ->assertJsonPath(
                'post.updated_at',
                fn (mixed $value): bool => is_string($value) && $value !== '',
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

    it('updates the gallery by removing selected images and adding replacements', function () {
        Storage::fake('public');

        $post = CommunityPost::factory()->create([
            'user_id' => $this->student->id,
        ]);
        $removedImage = $post
            ->addMedia(UploadedFile::fake()->image('removed.jpg'))
            ->toMediaCollection('images');
        $retainedImage = $post
            ->addMedia(UploadedFile::fake()->image('retained.jpg'))
            ->toMediaCollection('images');

        $this->post(
            route('member.community.posts.update', $post),
            [
                'body' => 'Updated with a new gallery.',
                'book_id' => '',
                'remove_image_uuids' => [$removedImage->uuid],
                'images' => [UploadedFile::fake()->image('replacement.webp')],
            ],
        )
            ->assertSuccessful()
            ->assertJsonCount(2, 'post.images');

        expect($post->refresh()->getMedia('images')->pluck('uuid')->all())
            ->toContain($retainedImage->uuid)
            ->not->toContain($removedImage->uuid);

        Storage::disk('public')->assertMissing(
            $removedImage->getPathRelativeToRoot(),
        );
    });

    it('allows a student to remove every image from a post', function () {
        Storage::fake('public');

        $post = CommunityPost::factory()->create([
            'user_id' => $this->student->id,
        ]);
        $firstImage = $post
            ->addMedia(UploadedFile::fake()->image('first.jpg'))
            ->toMediaCollection('images');
        $secondImage = $post
            ->addMedia(UploadedFile::fake()->image('second.jpg'))
            ->toMediaCollection('images');

        $this->post(
            route('member.community.posts.update', $post),
            [
                'body' => $post->body,
                'book_id' => '',
                'remove_image_uuids' => [
                    $firstImage->uuid,
                    $secondImage->uuid,
                ],
            ],
        )
            ->assertSuccessful()
            ->assertJsonCount(0, 'post.images');

        expect($post->refresh()->getMedia('images'))->toHaveCount(0);
    });

    it('rejects an update that would create more than four images', function () {
        Storage::fake('public');

        $post = CommunityPost::factory()->create([
            'user_id' => $this->student->id,
        ]);
        $images = collect(range(1, 4))
            ->map(fn (int $number) => $post
                ->addMedia(UploadedFile::fake()->image("existing-{$number}.jpg"))
                ->toMediaCollection('images'));

        $this->withHeaders(['Accept' => 'application/json'])
            ->post(
                route('member.community.posts.update', $post),
                [
                    'body' => $post->body,
                    'remove_image_uuids' => [$images->first()->uuid],
                    'images' => [
                        UploadedFile::fake()->image('new-one.jpg'),
                        UploadedFile::fake()->image('new-two.jpg'),
                    ],
                ],
            )
            ->assertUnprocessable()
            ->assertJsonValidationErrors('images');

        expect($post->refresh()->getMedia('images'))->toHaveCount(4);
    });

    it('rejects image UUIDs that do not belong to the post', function () {
        Storage::fake('public');

        $post = CommunityPost::factory()->create([
            'user_id' => $this->student->id,
        ]);
        $foreignPost = CommunityPost::factory()->create();
        $foreignImage = $foreignPost
            ->addMedia(UploadedFile::fake()->image('foreign.jpg'))
            ->toMediaCollection('images');

        $this->withHeaders(['Accept' => 'application/json'])
            ->post(
                route('member.community.posts.update', $post),
                [
                    'body' => $post->body,
                    'remove_image_uuids' => [$foreignImage->uuid],
                ],
            )
            ->assertUnprocessable()
            ->assertJsonValidationErrors('remove_image_uuids');
    });

    it('validates update images with the same file rules as creation', function () {
        $post = CommunityPost::factory()->create([
            'user_id' => $this->student->id,
        ]);

        $this->withHeaders(['Accept' => 'application/json'])
            ->post(
                route('member.community.posts.update', $post),
                [
                    'body' => $post->body,
                    'images' => [
                        UploadedFile::fake()->create(
                            'not-an-image.svg',
                            10,
                            'image/svg+xml',
                        ),
                    ],
                ],
            )
            ->assertUnprocessable()
            ->assertJsonValidationErrors('images.0');
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
