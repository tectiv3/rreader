<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SidebarApiController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $categories = $user->categories()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->with(['feeds' => fn ($q) => $q->orderBy('title')])
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'feeds' => $cat->feeds->map(fn ($f) => [
                    'id' => $f->id,
                    'title' => $f->title,
                    'favicon_url' => $f->favicon_url,
                    'disabled_at' => $f->disabled_at,
                ])->values()->all(),
            ]);

        $uncategorizedFeeds = $user->feeds()
            ->whereNull('category_id')
            ->orderBy('title')
            ->get()
            ->map(fn ($f) => [
                'id' => $f->id,
                'title' => $f->title,
                'favicon_url' => $f->favicon_url,
                'disabled_at' => $f->disabled_at,
            ])
            ->values()
            ->all();

        return response()->json([
            'categories' => $categories->values()->all(),
            'uncategorizedFeeds' => $uncategorizedFeeds,
        ]);
    }
}
