<?php

namespace App\Console\Commands;

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
                $oldArticleIds = $user->feedArticles()
                    ->where('articles.published_at', '<', now()->subYear())
                    ->unreadForUser($user->id)
                    ->pluck('articles.id');

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
