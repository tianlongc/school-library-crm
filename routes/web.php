<?php

use App\Http\Controllers\BookController;
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
    if ($request->user()->can('admin.dashboard.view')) {
        return redirect()->route('admin.dashboard', $request->query());
    }

    if ($request->user()->can('workspace.access')) {
        return redirect()->route('staff.dashboard', $request->query());
    }

    return redirect()->route('student.dashboard', $request->query());
})->middleware(['auth'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

// Student
Route::middleware(['auth', 'can:student.dashboard.view'])
    ->prefix('student')
    ->name('student.')
    ->group(function () {
        Route::get('/', function () {
            return Inertia::render('Student/Dashboard');
        })->name('dashboard');
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
    });
