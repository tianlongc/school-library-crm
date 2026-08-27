<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('roles')
            ->where('name', 'user')
            ->where('guard_name', 'web')
            ->update(['name' => 'member']);

        DB::table('permissions')
            ->where('name', 'student.dashboard.view')
            ->where('guard_name', 'web')
            ->update(['name' => 'member.dashboard.view']);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('roles')
            ->where('name', 'member')
            ->where('guard_name', 'web')
            ->update(['name' => 'user']);

        DB::table('permissions')
            ->where('name', 'member.dashboard.view')
            ->where('guard_name', 'web')
            ->update(['name' => 'student.dashboard.view']);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
