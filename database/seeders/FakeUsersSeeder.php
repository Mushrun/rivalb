<?php

namespace Database\Seeders;

use App\Models\Challenge;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FakeUsersSeeder extends Seeder
{
    public function run(): void
    {
        $bots = [
            ['username' => 'ShadowKing99',  'name' => 'Shadow King'],
            ['username' => 'IronFist_X',    'name' => 'Iron Fist'],
            ['username' => 'DragonSlayer7', 'name' => 'Dragon Slayer'],
            ['username' => 'NightWolf_Z',   'name' => 'Night Wolf'],
            ['username' => 'BlazeMaster',   'name' => 'Blaze Master'],
            ['username' => 'StrikeForce1',  'name' => 'Strike Force'],
            ['username' => 'PhantomBlade',  'name' => 'Phantom Blade'],
            ['username' => 'ThunderClaw',   'name' => 'Thunder Claw'],
            ['username' => 'GhostFighter',  'name' => 'Ghost Fighter'],
            ['username' => 'VenomStrike',   'name' => 'Venom Strike'],
            ['username' => 'CrimsonFang',   'name' => 'Crimson Fang'],
            ['username' => 'StormBreaker9', 'name' => 'Storm Breaker'],
            ['username' => 'IceKing_Pro',   'name' => 'Ice King'],
            ['username' => 'LavaWarrior',   'name' => 'Lava Warrior'],
            ['username' => 'SteelShadow',   'name' => 'Steel Shadow'],
            ['username' => 'RavenFist',     'name' => 'Raven Fist'],
            ['username' => 'CobaltRush',    'name' => 'Cobalt Rush'],
            ['username' => 'SilverFang_X',  'name' => 'Silver Fang'],
            ['username' => 'DarkVortex',    'name' => 'Dark Vortex'],
            ['username' => 'FireStrike99',  'name' => 'Fire Strike'],
        ];

        $challenges = [
            ['type' => '1v1', 'currency' => 'rb',   'bet_amount' => 100],
            ['type' => '1v1', 'currency' => 'rb',   'bet_amount' => 200],
            ['type' => '1v1', 'currency' => 'rb',   'bet_amount' => 300],
            ['type' => '1v1', 'currency' => 'rb',   'bet_amount' => 500],
            ['type' => '1v1', 'currency' => 'rb',   'bet_amount' => 750],
            ['type' => '1v1', 'currency' => 'rb',   'bet_amount' => 1000],
            ['type' => '3v3', 'currency' => 'rb',   'bet_amount' => 200],
            ['type' => '3v3', 'currency' => 'rb',   'bet_amount' => 500],
            ['type' => '3v3', 'currency' => 'rb',   'bet_amount' => 1000],
            ['type' => '1v1', 'currency' => 'usdt', 'bet_amount' => 1],
            ['type' => '1v1', 'currency' => 'usdt', 'bet_amount' => 2],
            ['type' => '1v1', 'currency' => 'usdt', 'bet_amount' => 3],
            ['type' => '1v1', 'currency' => 'usdt', 'bet_amount' => 5],
            ['type' => '1v1', 'currency' => 'usdt', 'bet_amount' => 8],
            ['type' => '1v1', 'currency' => 'usdt', 'bet_amount' => 10],
            ['type' => '1v1', 'currency' => 'usdt', 'bet_amount' => 15],
            ['type' => '3v3', 'currency' => 'usdt', 'bet_amount' => 3],
            ['type' => '3v3', 'currency' => 'usdt', 'bet_amount' => 5],
            ['type' => '3v3', 'currency' => 'usdt', 'bet_amount' => 10],
            ['type' => '1v1', 'currency' => 'rb',   'bet_amount' => 400],
        ];

        foreach ($bots as $i => $botData) {
            $existing = User::where('username', $botData['username'])->first();
            if ($existing) {
                $user = $existing;
            } else {
                $user = User::create([
                    'name'       => $botData['name'],
                    'username'   => $botData['username'],
                    'email'      => strtolower(str_replace(['_', ' '], '', $botData['username'])) . '@rivalbet.bot',
                    'password'   => Hash::make('bot_password_' . $i),
                    'balance_rb' => 10000,
                    'reliability_score' => rand(75, 100),
                ]);
            }

            $alreadyHasChallenge = Challenge::where('creator_id', $user->id)
                ->where('status', 'ouvert')
                ->exists();

            if (!$alreadyHasChallenge && isset($challenges[$i])) {
                Challenge::create([
                    'creator_id' => $user->id,
                    'type'       => $challenges[$i]['type'],
                    'game'       => 'Shadow Fight',
                    'bet_amount' => $challenges[$i]['bet_amount'],
                    'currency'   => $challenges[$i]['currency'],
                    'status'     => 'ouvert',
                    'visibility' => 'public',
                ]);
            }
        }
    }
}
