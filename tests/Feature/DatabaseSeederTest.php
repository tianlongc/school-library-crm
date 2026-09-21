<?php

use Database\Seeders\DatabaseSeeder;
use Spatie\Permission\Models\Permission;

it('seeds community permissions before assigning roles', function () {
    $this->seed(DatabaseSeeder::class);

    expect(Permission::where('name', 'community.posts.create')
        ->where('guard_name', 'web')
        ->exists())->toBeTrue();
});
