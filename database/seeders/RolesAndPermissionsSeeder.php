<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $staffPermissions = [
            'workspace.access',
            'books.view',
            'books.create',
            'books.update',
            'books.delete',
            'categories.view',
            'categories.create',
            'categories.update',
            'categories.delete',
        ];

        $dashboardPermissions = [
            'student.dashboard.view',
            'admin.dashboard.view',
        ];

        foreach ([...$staffPermissions, ...$dashboardPermissions] as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        Role::findOrCreate('user', 'web')
            ->syncPermissions(['student.dashboard.view']);

        Role::findOrCreate('librarian', 'web')
            ->syncPermissions($staffPermissions);

        Role::findOrCreate('admin', 'web')
            ->syncPermissions([...$staffPermissions, 'admin.dashboard.view']);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
