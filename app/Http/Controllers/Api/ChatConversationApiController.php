<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Chat\ChatService;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Feed;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

final class ChatConversationApiController extends Controller
{
    public function index(Request $request, ChatService $service): JsonResponse
    {
        return response()->json([
            'conversations' => $service->hub($request->user()),
        ]);
    }

    public function store(Request $request, ChatService $service): JsonResponse
    {
        $validated = $request->validate([
            'article_id' => [
                'required',
                'integer',
                Rule::exists('articles', 'id')->whereIn(
                    'feed_id',
                    Feed::where('user_id', $request->user()->id)->pluck('id')
                ),
            ],
            'provider' => ['nullable', 'string'],
            'model' => ['nullable', 'string'],
        ]);

        $conversation = $service->findOrCreate(
            $request->user(),
            Article::findOrFail($validated['article_id']),
            $validated['provider'] ?? null,
            $validated['model'] ?? null,
        );

        // Upsert semantics: 201 whether a row was inserted or an existing
        // conversation was returned — the SPA navigates on the body either way.
        return response()->json($service->conversationData($conversation), 201);
    }

    public function show(Request $request, ChatService $service, string $id): JsonResponse
    {
        return response()->json($service->detail($request->user(), $id));
    }

    public function update(Request $request, ChatService $service, string $id): JsonResponse
    {
        $validated = $request->validate([
            'provider' => ['required', 'string'],
            'model' => ['required', 'string'],
        ]);

        $conversation = $service->switchRouting(
            $request->user(),
            $id,
            $validated['provider'],
            $validated['model'],
        );

        return response()->json($service->conversationData($conversation));
    }

    public function destroy(Request $request, ChatService $service, string $id): JsonResponse
    {
        $service->delete($request->user(), $id);

        return response()->json(null, 204);
    }
}
