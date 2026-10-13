<?php

use App\Http\Controllers\Api\SidebarApiController;
use App\Http\Controllers\OpmlController;
use App\Http\Controllers\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// /sw.js and /manifest.webmanifest are static files at the public root (lifted
// there from public/build by scripts/pwa-root-assets.mjs). They must not go
// through Laravel: routed here they carried session cookies and `Vary:
// X-Inertia` and never returned 304, which defeated Safari's service-worker
// update byte-comparison and looped reloads on deploy.

Route::get('/', function () {
    if (auth()->check()) {
        return redirect('/articles');
    }

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register') && config('app.registration_enabled'),
    ]);
});

Route::get('/dashboard', function () {
    return redirect('/articles');
})->middleware(['auth', 'verified'])->name('dashboard');

// Auth routes MUST be registered before the SPA catch-all
require __DIR__.'/auth.php';

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // OPML export (direct file download, not JSON API)
    Route::get('/opml/export', [OpmlController::class, 'export'])->name('opml.export');

    // SPA catch-all — must be last. Missing build assets must 404 rather than fall
    // through to the HTML shell, or the service worker precaches HTML under .js/.css URLs.
    Route::get('/{any}', function (Request $request) {
        $user = $request->user();
        $sidebarData = SidebarApiController::buildSidebarData($user);

        return Inertia::render('AppShell', [
            'initialSidebar' => $sidebarData,
            'user' => $user,
        ]);
    })->where('any', '^(?!api/|build/|sw\.js$|manifest\.webmanifest$).*$')->name('spa');
});
