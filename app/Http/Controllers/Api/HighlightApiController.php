<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Highlight;
use Illuminate\Http\Request;

class HighlightApiController extends Controller
{
    public function index(Request $request)
    {
        $highlights = $request->user()
            ->highlights()
            ->with('article:id,title,url,feed_id', 'article.feed:id,title,favicon_url')
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json($highlights);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'article_id' => 'required|integer|exists:articles,id',
            'text' => 'required|string|max:5000',
            'note' => 'nullable|string|max:1000',
        ]);

        $highlight = $request->user()->highlights()->create($validated);

        return response()->json($highlight, 201);
    }

    public function destroy(Request $request, Highlight $highlight)
    {
        if ($highlight->user_id !== $request->user()->id) {
            abort(403);
        }

        $highlight->delete();

        return response()->json(null, 204);
    }
}
