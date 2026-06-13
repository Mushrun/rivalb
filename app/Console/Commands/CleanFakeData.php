<?php

namespace App\Console\Commands;

use App\Models\Challenge;
use App\Models\User;
use Illuminate\Console\Command;

class CleanFakeData extends Command
{
    protected $signature   = 'app:clean-fake-data';
    protected $description = 'Supprime les utilisateurs bots et leurs défis fictifs';

    public function handle(): void
    {
        $bots = User::where('email', 'like', '%@rivalbet.bot')->get();

        if ($bots->isEmpty()) {
            $this->info('Aucune donnée fictive trouvée.');
            return;
        }

        $botIds = $bots->pluck('id');

        $challengesDeleted = Challenge::whereIn('creator_id', $botIds)->delete();
        $usersDeleted      = User::whereIn('id', $botIds)->delete();

        $this->info("✓ {$usersDeleted} utilisateurs fictifs supprimés.");
        $this->info("✓ {$challengesDeleted} défis fictifs supprimés.");
    }
}
