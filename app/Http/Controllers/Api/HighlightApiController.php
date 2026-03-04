<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feed;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HighlightApiController extends Controller
{
    public function index(Request $request)
    {
        $highlights = $request->user()
            ->highlights()
            ->with('article:id,title,url,feed_id', 'article.feed:id,title,favicon_url')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($highlights);
    }

    public function store(Request $request)
    {
        $userId = $request->user()->id;
        $validated = $request->validate([
            'article_id' => [
                'required',
                'integer',
                Rule::exists('articles', 'id')->whereIn(
                    'feed_id',
                    Feed::where('user_id', $userId)->select('id')
                ),
            ],
            'text' => 'required|string|max:5000',
            'note' => 'nullable|string|max:1000',
        ]);

        $highlight = $request->user()->highlights()->create($validated);

        return response()->json($highlight, 201);
    }

    public function destroy(Request $request, int $id)
    {
        $highlight = $request->user()->highlights()->findOrFail($id);
        $highlight->delete();

        return response()->json(null, 204);
    }
}
