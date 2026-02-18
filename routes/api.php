<?php

use App\Http\Controllers\Api\ArticleApiController;
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
});
