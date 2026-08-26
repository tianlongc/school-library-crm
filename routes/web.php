<?php

use App\Http\Controllers\BookController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\MemberDashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function (Request $request) {
    if ($request->user()->can('workspace.access')) {
        return redirect()->route('staff.dashboard', $request->query());
    }

    return redirect()->route('member.dashboard', $request->query());
})->middleware(['auth'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

// Member
Route::middleware('auth')
    ->prefix('member')
    ->name('member.')
    ->group(function (): void {
        Route::get('/', MemberDashboardController::class)->name('dashboard');
    });

// Admin
Route::middleware(['auth', 'can:admin.dashboard.view'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('dashboard');
    });

// Staff: Librarian + Admin
Route::middleware(['auth', 'can:workspace.access'])
    ->prefix('staff')
    ->name('staff.')
    ->group(function () {
        Route::get('/', function () {
            return Inertia::render('Staff/Dashboard');
        })->name('dashboard');

        Route::controller(BookController::class)
            ->prefix('books')
            ->name('books.')
            ->group(function () {
                Route::get('/', 'index')->middleware('can:books.view')->name('index');
                Route::get('/create', 'create')->middleware('can:books.create')->name('create');
                Route::post('/', 'store')->middleware('can:books.create')->name('store');
                Route::get('/{book}/edit', 'edit')->middleware('can:books.update')->name('edit');
                Route::post('/{book}', 'update')->middleware('can:books.update')->name('update');
                Route::delete('/{book}', 'destroy')->middleware('can:books.delete')->name('destroy');
                Route::get('/{book}', 'show')->middleware('can:books.view')->name('show');
            });

        Route::controller(CategoryController::class)
            ->prefix('categories')
            ->name('categories.')
            ->group(function () {
                Route::get('/', 'index')->middleware('can:categories.view')->name('index');
                Route::get('/create', 'create')->middleware('can:categories.create')->name('create');
                Route::post('/', 'store')->middleware('can:categories.create')->name('store');
                Route::get('/{category}/edit', 'edit')->middleware('can:categories.update')->name('edit');
                Route::post('/{category}', 'update')->middleware('can:categories.update')->name('update');
                Route::delete('/{category}', 'destroy')->middleware('can:categories.delete')->name('destroy');
            });

        Route::controller(MemberController::class)
            ->prefix('members')
            ->name('members.')
            ->group(function (): void {
                Route::get('/', 'index')->name('index');
                Route::post('/{member}/suspend', 'suspend')->name('suspend');
                Route::post('/{member}/reactivate', 'reactivate')->name('reactivate');
                Route::post('/{member}/deactivate', 'deactivate')->name('deactivate');
            });
    });
