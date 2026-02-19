<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\User;
use Illuminate\Console\Command;

class PurgeOldArticles extends Command
{
    protected $signature = 'articles:purge';

    protected $description = 'Enforce article retention: mark as read articles older than 1 year and beyond 1000 per user';

    public function handle()
    {
        User::chunk(50, function ($users) {
            foreach ($users as $user) {
                $userArticles = fn () => Article::whereHas('feed', fn ($q) => $q->where('user_id', $user->id));

                $unread = fn () => $userArticles()
                    ->whereDoesntHave('users', fn ($q) => $q->where('user_id', $user->id)->where('is_read', true));

                // Articles older than 1 year
                $oldIds = $unread()
                    ->where('published_at', '<', now()->subYear())
                    ->pluck('id');

                // Oldest unread beyond 1000 total
                $excessIds = collect();
                $totalCount = $userArticles()->count();
                if ($totalCount > 1000) {
                    $excessIds = $unread()
                        ->orderBy('published_at', 'asc')
                        ->limit($totalCount - 1000)
                        ->pluck('id');
                }

                $toMark = $oldIds->merge($excessIds)->unique();
                if ($toMark->isNotEmpty()) {
                    $records = $toMark->mapWithKeys(fn ($id) => [
                        $id => ['is_read' => true, 'read_at' => now()],
                    ])->all();
                    $user->articles()->syncWithoutDetaching($records);
                }
            }
        });

        $this->info('Article retention enforced.');
    }
}
