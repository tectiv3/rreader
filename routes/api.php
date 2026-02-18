<?php

use App\Http\Controllers\Api\ArticleApiController;
use App\Http\Controllers\Api\CategoryApiController;
use App\Http\Controllers\Api\FeedApiController;
use App\Http\Controllers\Api\SidebarApiController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Articles
    Route::get('/articles', [ArticleApiController::class, 'index']);
    Route::get('/articles/search', [ArticleApiController::class, 'search']);
    Route::get('/articles/{article}', [ArticleApiController::class, 'show']);
    Route::patch('/articles/{article}', [ArticleApiController::class, 'update']);
    Route::post('/articles/mark-all-read', [ArticleApiController::class, 'markAllRead']);

    // Sidebar
    Route::get('/sidebar', [SidebarApiController::class, 'index']);

    // Feeds
    Route::post('/feeds/preview', [FeedApiController::class, 'preview']);
    Route::post('/feeds', [FeedApiController::class, 'store']);
    Route::put('/feeds/{feed}', [FeedApiController::class, 'update']);
    Route::delete('/feeds/{feed}', [FeedApiController::class, 'destroy']);
    Route::post('/feeds/{feed}/reenable', [FeedApiController::class, 'reenable']);

    // Categories
    Route::post('/categories', [CategoryApiController::class, 'store']);
    Route::put('/categories/{category}', [CategoryApiController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryApiController::class, 'destroy']);
    Route::post('/categories/reorder', [CategoryApiController::class, 'reorder']);
});
