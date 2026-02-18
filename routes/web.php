<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\OpmlController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::get('/dashboard', function () {
    return redirect()->route('articles.index');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Feed management
    Route::get('/feeds/manage', [FeedController::class, 'manage'])->name('feeds.manage');
    Route::get('/feeds/create', [FeedController::class, 'create'])->name('feeds.create');
    Route::post('/feeds/preview', [FeedController::class, 'preview'])->name('feeds.preview');
    Route::post('/feeds', [FeedController::class, 'store'])->name('feeds.store');
    Route::post('/feeds/refresh', [FeedController::class, 'refresh'])->name('feeds.refresh');
    Route::put('/feeds/{feed}', [FeedController::class, 'update'])->name('feeds.update');
    Route::delete('/feeds/{feed}', [FeedController::class, 'destroy'])->name('feeds.destroy');
    Route::post('/feeds/{feed}/reenable', [FeedController::class, 'reenable'])->name('feeds.reenable');

    // Categories
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
    Route::post('/categories/reorder', [CategoryController::class, 'reorder'])->name('categories.reorder');

    // OPML Import/Export
    Route::get('/opml/import', [OpmlController::class, 'index'])->name('opml.index');
    Route::post('/opml/preview', [OpmlController::class, 'preview'])->name('opml.preview');
    Route::post('/opml/import', [OpmlController::class, 'import'])->name('opml.import');
    Route::get('/opml/export', [OpmlController::class, 'export'])->name('opml.export');

    // Settings
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::patch('/settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::patch('/settings/account', [SettingsController::class, 'updateAccount'])->name('settings.updateAccount');
    Route::patch('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.updatePassword');

    // Articles
    Route::get('/articles/search', [ArticleController::class, 'search'])->name('articles.search');
    Route::get('/articles', [ArticleController::class, 'index'])->name('articles.index');
    Route::get('/articles/{article}', [ArticleController::class, 'show'])->name('articles.show');
    Route::post('/articles/mark-read', [ArticleController::class, 'markAsRead'])->name('articles.markAsRead');
    Route::post('/articles/mark-all-read', [ArticleController::class, 'markAllAsRead'])->name('articles.markAllAsRead');
    Route::post('/articles/{article}/toggle-read-later', [ArticleController::class, 'toggleReadLater'])->name('articles.toggleReadLater');
    Route::post('/articles/{article}/mark-unread', [ArticleController::class, 'markAsUnread'])->name('articles.markAsUnread');

    // SPA catch-all — must be last in the auth group
    Route::get('/{any}', function (Request $request) {
        $user = $request->user();
        $allFeedIds = $user->feeds()->pluck('feeds.id');
        $sidebarData = app(ArticleController::class)->getSidebarData($user, $allFeedIds);

        return Inertia::render('AppShell', [
            'initialSidebar' => $sidebarData,
            'user' => $user,
        ]);
    })->where('any', '^(?!api/).*$')->name('spa');
});

require __DIR__.'/auth.php';
