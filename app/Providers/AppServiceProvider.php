<?php

namespace App\Providers;

use App\Domain\Book\Models\Book;
use App\Domain\Cms\Models\CmsPage;
use App\Domain\User\Models\User;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Relation::enforceMorphMap([
            'book' => Book::class,
            'cms_page' => CmsPage::class,
            'user' => User::class,
        ]);

        Vite::prefetch(concurrency: 3);
    }
}
