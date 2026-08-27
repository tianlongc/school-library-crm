<?php

use App\Domain\Book\Models\Book;
use App\Domain\Category\Models\Category;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
    $this->seed(RolesAndPermissionsSeeder::class);
});

it('redirects guests away from category management', function () {
    $this->get(route('staff.categories.index'))
        ->assertRedirect(route('login'));
});

it('forbids members from the staff category workspace', function () {
    $member = User::factory()->create();
    $member->assignRole('member');

    $this->actingAs($member)
        ->get(route('staff.categories.index'))
        ->assertForbidden();
});

it('allows admins to access the shared category workspace', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('staff.categories.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Staff/Categories/Index')
        );
});

describe('authenticated category management', function () {
    beforeEach(function () {
        $librarian = User::factory()->create();
        $librarian->assignRole('librarian');

        $this->actingAs($librarian);
    });

    it('renders categories with their book counts', function () {
        $category = Category::factory()->create(['name' => 'Science']);

        Book::factory()->count(2)->create()->each(function (Book $book) use ($category) {
            $book->forceFill(['category_id' => $category->id])->save();
        });

        $this->get(route('staff.categories.index'))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Staff/Categories/Index')
                ->has('categories.data', 1)
                ->where('categories.data.0.id', $category->id)
                ->where('categories.data.0.name', 'Science')
                ->where('categories.data.0.books_count', 2)
                ->where('filters.search', '')
            );
    });

    it('returns twelve categories per page', function () {
        Category::factory()->count(13)->create();

        $this->get(route('staff.categories.index'))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->has('categories.data', 12)
                ->where('categories.meta.current_page', 1)
                ->where('categories.meta.per_page', 12)
                ->where('categories.meta.total', 13)
            );
    });

    it('searches categories by name and preserves the filter', function () {
        $matchingCategory = Category::factory()->create(['name' => 'Computer Science']);
        Category::factory()->create(['name' => 'History']);

        $this->get(route('staff.categories.index', ['search' => 'Computer']))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->has('categories.data', 1)
                ->where('categories.data.0.id', $matchingCategory->id)
                ->where('filters.search', 'Computer')
            );
    });

    it('renders the category create page', function () {
        $this->get(route('staff.categories.create'))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Staff/Categories/Create')
            );
    });

    it('renders the category edit page', function () {
        $category = Category::factory()->create();

        $this->get(route('staff.categories.edit', $category))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Staff/Categories/Edit')
                ->where('category.id', $category->id)
                ->where('category.name', $category->name)
            );
    });

    it('creates a category from valid json', function () {
        $this->postJson(route('staff.categories.store'), [
            'name' => 'Young Adult',
        ])
            ->assertCreated()
            ->assertJsonPath('message', 'Category created successfully')
            ->assertJsonPath('category.name', 'Young Adult');

        $this->assertDatabaseHas('categories', [
            'name' => 'Young Adult',
        ]);
    });

    it('rejects an invalid category name', function (array $data) {
        $this->postJson(route('staff.categories.store'), $data)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    })->with([
        'missing' => [[]],
        'empty' => [['name' => '']],
        'longer than 255 characters' => [['name' => str_repeat('a', 256)]],
    ]);

    it('rejects a duplicate category name when creating', function () {
        Category::factory()->create(['name' => 'Reference']);

        $this->postJson(route('staff.categories.store'), [
            'name' => 'Reference',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    });

    it('updates a category and allows it to retain its name', function () {
        $category = Category::factory()->create(['name' => 'Literature']);

        $this->postJson(route('staff.categories.update', $category), [
            'name' => 'Literature',
        ])
            ->assertSuccessful()
            ->assertJsonPath('category.id', $category->id)
            ->assertJsonPath('category.name', 'Literature');

        expect($category->refresh()->name)->toBe('Literature');
    });

    it('persists a valid category update', function () {
        $category = Category::factory()->create(['name' => 'Old Name']);

        $this->postJson(route('staff.categories.update', $category), [
            'name' => 'New Name',
        ])
            ->assertSuccessful()
            ->assertJsonPath('message', 'Category updated successfully')
            ->assertJsonPath('category.name', 'New Name');

        expect($category->refresh()->name)->toBe('New Name');
    });

    it('rejects another categories name when updating', function () {
        $category = Category::factory()->create(['name' => 'Biography']);
        Category::factory()->create(['name' => 'Poetry']);

        $this->postJson(route('staff.categories.update', $category), [
            'name' => 'Poetry',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    });

    it('deletes a category and clears its books category reference', function () {
        $category = Category::factory()->create();
        $book = Book::factory()->create();
        $book->forceFill(['category_id' => $category->id])->save();

        $this->deleteJson(route('staff.categories.destroy', $category))
            ->assertSuccessful()
            ->assertJsonPath('message', 'Category deleted successfully');

        $this->assertModelMissing($category);
        expect($book->refresh()->category_id)->toBeNull();
    });

    it('returns not found for an unknown category', function () {
        $this->get(route('staff.categories.edit', 999999))
            ->assertNotFound();
    });
});
