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

        $memberPermissions = [
            'member.dashboard.view',
        ];

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
            'members.view',
            'members.suspend',
            'members.deactivate',
        ];

        $adminPermissions = [
            'admin.dashboard.view',
            'members.reactivate',
            'users.view',
            'users.roles.update',
        ];

        foreach ([...$memberPermissions, ...$staffPermissions, ...$adminPermissions] as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        Role::findOrCreate('member', 'web')
            ->syncPermissions($memberPermissions);

        Role::findOrCreate('librarian', 'web')
            ->syncPermissions($staffPermissions);

        Role::findOrCreate('admin', 'web')
            ->syncPermissions([...$staffPermissions, ...$adminPermissions]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
