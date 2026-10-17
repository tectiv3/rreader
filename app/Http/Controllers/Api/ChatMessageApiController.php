<?php

namespace App\Http\Controllers\Api;

use App\Chat\ChatService;
use App\Chat\ChatTurnService;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class ChatMessageApiController extends Controller
{
    /**
     * Execute one chat turn and stream it as SSE.
     */
    public function store(
        Request $request,
        ChatService $chat,
        ChatTurnService $turns,
        string $id
    ): StreamedResponse {
        $validated = $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        // Everything session-dependent is resolved before the stream starts:
        // once the response begins, Laravel writes and closes the session, so
        // the callback must not touch the request again.
        /** @var User $user */
        $user = $request->user();
        $content = (string) $validated['content'];

        $conversation = $chat->findForUser($user, $id);

        $turn = $turns->begin($user, $conversation, $content);

        return response()->stream(
            function () use ($turn): void {
                // The per-step timeout budget is enforced by the package's HTTP
                // client; PHP's own 30s timer must not cut a long turn short, and
                // FPM request_terminate_timeout stays the outer hard kill.
                set_time_limit(0);

                // Frames must pass through every buffer level that existed when
                // the stream began (FPM's php.ini output_buffering); anything
                // stacked mid-turn is drained. The entry-level buffers themselves
                // are flushed onward rather than popped — popping them would break
                // the test harness's capture buffer to no extra effect.
                $baseLevel = ob_get_level();

                $turn->run(function (string $frame) use ($baseLevel): bool {
                    echo $frame;

                    while (ob_get_level() > $baseLevel) {
                        ob_end_flush();
                    }

                    if (ob_get_level() > 0) {
                        ob_flush();
                    }

                    flush();

                    return connection_aborted() !== 1;
                });
            },
            200,
            [
                'Content-Type' => 'text/event-stream',
                'Cache-Control' => 'no-cache',
                'X-Accel-Buffering' => 'no',
                'Connection' => 'keep-alive',
            ]
        );
    }
}
