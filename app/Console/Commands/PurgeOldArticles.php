<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\User;
use Illuminate\Console\Command;

class PurgeOldArticles extends Command
{
    protected $signature = 'articles:purge';

    protected $description = 'Enforce article retention: 1000 per user, auto-read articles older than 1 year';

    public function handle()
    {
        User::chunk(50, function ($users) {
            foreach ($users as $user) {
                $feedIds = $user->feeds()->pluck('feeds.id');

                // Auto-mark articles older than 1 year as read
                $oldArticleIds = Article::whereIn('feed_id', $feedIds)
                    ->where('published_at', '<', now()->subYear())
                    ->whereDoesntHave('users', fn ($q) => $q->where('user_id', $user->id)->where('is_read', true)
                    )
                    ->pluck('id');

                if ($oldArticleIds->isNotEmpty()) {
                    $records = $oldArticleIds->mapWithKeys(fn ($id) => [
                        $id => ['is_read' => true, 'read_at' => now()],
                    ])->all();
                    $user->articles()->syncWithoutDetaching($records);
                }

                // Purge beyond 1000: delete oldest articles per user's feeds
                $totalCount = Article::whereIn('feed_id', $feedIds)->count();
                if ($totalCount > 1000) {
                    $excess = $totalCount - 1000;
                    $toDelete = Article::whereIn('feed_id', $feedIds)
                        ->orderBy('published_at', 'asc')
                        ->limit($excess)
                        ->pluck('id');

                    Article::whereIn('id', $toDelete)->delete();
                }
            }
        });

        $this->info('Article retention enforced.');
    }
}
