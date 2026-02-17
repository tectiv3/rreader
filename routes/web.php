<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\ProfileController;
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

    // Feed subscription
    Route::get('/feeds/create', [FeedController::class, 'create'])->name('feeds.create');
    Route::post('/feeds/preview', [FeedController::class, 'preview'])->name('feeds.preview');
    Route::post('/feeds', [FeedController::class, 'store'])->name('feeds.store');
    Route::post('/feeds/refresh', [FeedController::class, 'refresh'])->name('feeds.refresh');

    // Articles
    Route::get('/articles', [ArticleController::class, 'index'])->name('articles.index');
    Route::post('/articles/mark-read', [ArticleController::class, 'markAsRead'])->name('articles.markAsRead');
    Route::post('/articles/mark-all-read', [ArticleController::class, 'markAllAsRead'])->name('articles.markAllAsRead');
});

require __DIR__.'/auth.php';
