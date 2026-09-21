<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('community_posts', function (Blueprint $table): void {
            $table->unsignedInteger('shares_count')
                ->default(0)
                ->after('status');
        });

        Schema::create('community_post_comments', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('community_post_id')
                ->constrained('community_posts')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->text('body');
            $table->timestamps();

            $table->index([
                'community_post_id',
                'created_at',
            ]);
        });

        Schema::create('community_post_likes', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('community_post_id')
                ->constrained('community_posts')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique([
                'community_post_id',
                'user_id',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('community_post_likes');
        Schema::dropIfExists('community_post_comments');

        Schema::table('community_posts', function (Blueprint $table): void {
            $table->dropColumn('shares_count');
        });
    }
};
