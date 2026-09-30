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

        [$conversation, $created] = $service->resolveConversation(
            $request->user(),
            Article::findOrFail($validated['article_id']),
            $validated['provider'] ?? null,
            $validated['model'] ?? null,
        );

        // Get-or-create is idempotent: 200 when the row already existed, 201
        // only when a conversation was inserted.
        return response()->json($service->conversationData($conversation), $created ? 201 : 200);
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
