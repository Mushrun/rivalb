<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use Inertia\Inertia;

class LandingController extends Controller
{
    public function index()
    {
        $challenges = Challenge::with('creator')
            ->where('status', 'ouvert')
            ->where('visibility', 'public')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn($c) => [
                'id'         => $c->id,
                'type'       => $c->type,
                'bet_amount' => $c->bet_amount,
                'currency'   => $c->currency,
                'creator'    => [
                    'username'          => $c->creator->username,
                    'avatar_path'       => $c->creator->avatar_path,
                    'reliability_score' => $c->creator->reliability_score ?? 80,
                ],
                'created_at' => $c->created_at->diffForHumans(),
            ]);

        return Inertia::render('Welcome', [
            'challenges' => $challenges,
            'isAuth'     => auth()->check(),
        ]);
    }
}
