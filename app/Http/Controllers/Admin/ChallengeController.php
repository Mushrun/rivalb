<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use App\Services\ChallengeService;
use Inertia\Inertia;

class ChallengeController extends Controller
{
    public function __construct(private ChallengeService $service) {}

    public function index()
    {
        $defis = Challenge::with('creator')
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn($c) => [
                'id'      => $c->id,
                'creator' => $c->creator->username ?? $c->creator->name ?? '?',
                'type'    => strtoupper($c->type),
                'game'    => $c->game,
                'bet'     => $c->bet_amount,
                'status'  => $c->status,
                'date'    => $c->created_at->diffForHumans(),
            ]);

        return Inertia::render('Admin/Defis', ['defis' => $defis]);
    }

    public function cancel(int $id)
    {
        $challenge = Challenge::findOrFail($id);

        if ($challenge->status === 'ouvert') {
            $this->service->cancel($challenge->creator, $challenge);
        }

        return back()->with('flash', ['success' => 'Défi annulé.']);
    }
}
