<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    private const DEFAULTS = [
        'theme' => 'dark',
        'article_view' => 'full',
        'font_size' => 'medium',
        'refresh_interval' => 30,
        'mark_read_on_scroll' => false,
    ];

    public function index(Request $request): Response
    {
        $user = $request->user();
        $settings = array_merge(self::DEFAULTS, $user->settings ?? []);

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'status' => session('status'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'theme' => ['sometimes', 'in:dark,light,system'],
            'article_view' => ['sometimes', 'in:full,summary'],
            'font_size' => ['sometimes', 'in:small,medium,large'],
            'refresh_interval' => ['sometimes', 'integer', 'min:5', 'max:1440'],
            'mark_read_on_scroll' => ['sometimes', 'boolean'],
        ]);

        $user = $request->user();
        $current = $user->settings ?? [];
        $user->settings = array_merge($current, $validated);
        $user->save();

        return back()->with('status', 'Settings saved.');
    }

    public function updateAccount(Request $request): RedirectResponse
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

        return back()->with('status', 'Account updated.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('status', 'Password updated.');
    }

}
