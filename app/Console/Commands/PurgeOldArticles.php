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
                $oldArticleIds = Article::whereHas(
                    'feed',
                    fn ($q) => $q->where('user_id', $user->id)
                )
                    ->where('published_at', '<', now()->subYear())
                    ->whereDoesntHave(
                        'users',
                        fn ($q) => $q->where('user_id', $user->id)->whereNotNull('read_at')
                    )
                    ->pluck('id');

                if ($oldArticleIds->isEmpty()) {
                    continue;
                }

                $pivotData = $oldArticleIds->mapWithKeys(fn ($id) => [
                    $id => ['read_at' => now()],
                ])->all();

                $user->articles()->syncWithoutDetaching($pivotData);
            }
        });

        $this->info('Article retention enforced.');
    }
}
