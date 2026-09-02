<?php

use App\Domain\Book\Models\Book;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
    $this->seed(RolesAndPermissionsSeeder::class);
});

it('preserves member catalogue search across pagination', function () {
    $user = User::factory()->create();
    Member::factory()->for($user)->create();
    $user->assignRole('member');

    Book::factory()->count(13)->create([
        'title' => 'Debounced Search Result',
    ]);

    $this->actingAs($user)
        ->get(route('member.books.index', ['search' => 'Debounced']))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Member/Books/Index')
            ->has('books.data', 12)
            ->where('books.meta.total', 13)
            ->where('filters.search', 'Debounced')
            ->where(
                'books.links.next',
                fn (?string $url) => $url !== null
                    && str_contains($url, 'search=Debounced'),
            )
        );
});
