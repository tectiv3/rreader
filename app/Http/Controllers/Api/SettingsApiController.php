<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

final class SettingsApiController extends Controller
{
    private const DEFAULTS = [
        'theme' => 'dark',
        'article_view' => 'full',
        'font_size' => 'medium',
        'refresh_interval' => 30,
        'mark_read_on_scroll' => false,
        'hide_read_articles' => false,
    ];

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $settings = array_merge(self::DEFAULTS, $user->settings ?? []);

        return response()->json([
            'settings' => $settings,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function update(Request $request): Response
    {
        $validated = $request->validate([
            'theme' => ['sometimes', 'in:dark,light,system'],
            'article_view' => ['sometimes', 'in:full,summary'],
            'font_size' => ['sometimes', 'in:small,medium,large'],
            'refresh_interval' => ['sometimes', 'integer', 'min:5', 'max:1440'],
            'mark_read_on_scroll' => ['sometimes', 'boolean'],
            'hide_read_articles' => ['sometimes', 'boolean'],
        ]);

        $user = $request->user();
        $current = $user->settings ?? [];
        $user->settings = array_merge($current, $validated);
        $user->save();

        return response()->noContent();
    }

    public function updateAccount(Request $request): Response
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $request->user()->id],
        ]);

        $user = $request->user();
        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return response()->noContent();
    }

    public function updatePassword(Request $request): Response
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->noContent();
    }
}
