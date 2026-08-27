<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('model_has_roles')
            ->where('model_type', 'App\\Models\\User')
            ->update(['model_type' => 'user']);

        DB::table('model_has_permissions')
            ->where('model_type', 'App\\Models\\User')
            ->update(['model_type' => 'user']);
    }

    public function down(): void
    {
        // Morph alias normalization cannot be reversed safely because existing
        // aliases cannot be distinguished from rows updated by this migration.
    }
};
