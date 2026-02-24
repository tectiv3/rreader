<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\User;
use Illuminate\Console\Command;

class PurgeOldArticles extends Command
{
    protected $signature = 'articles:purge';

    protected $description = 'Enforce article retention: mark as read articles older than 1 year';

    public function handle()
    {
        User::chunk(50, function ($users) {
            foreach ($users as $user) {
                // $user->articles()->
                $userArticles = Article::whereHas(
                    'feed',
                    fn($q) => $q->where('user_id', $user->id)
                );

                $unread = $userArticles->whereDoesntHave(
                    'users',
                    fn($q) => $q->where('user_id', $user->id)->where('is_read', true)
                );

                // Articles older than 1 year
                $oldIds = $unread()
                    ->where('published_at', '<', now()->subYear())
                    ->pluck('id');

                if ($toMark->isNotEmpty()) {
                    $records = $toMark
                        ->mapWithKeys(fn($id) => [$id => ['read_at' => now()]])
                        ->all();
                    $user->articles()->syncWithoutDetaching($records);
                }
            }
        });

        $this->info('Article retention enforced.');
    }
}
