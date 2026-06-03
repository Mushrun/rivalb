<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChallengeRequest;
use App\Models\Challenge;
use App\Models\GameMatch;
use App\Services\ChallengeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChallengeController extends Controller
{
    public function __construct(private ChallengeService $challengeService) {}

    public function index()
    {
        $userId = auth()->id();

        $challenges = Challenge::with('creator')
            ->where('status', 'ouvert')
            ->where('visibility', 'public')
            ->where('creator_id', '!=', $userId)
            ->latest()
            ->get()
            ->map(fn($c) => [
                'id'         => $c->id,
                'type'       => $c->type,
                'game'       => $c->game,
                'bet_amount' => $c->bet_amount,
                'currency'   => $c->currency ?? 'rb',
                'created_at' => $c->created_at->diffForHumans(),
                'creator'    => [
                    'id'                => $c->creator->id,
                    'username'          => $c->creator->username,
                    'reliability_score' => $c->creator->reliability_score,
                    'avatar_path'       => $c->creator->avatar_path,
                ],
            ]);

        return Inertia::render('Battle', [
            'challenges' => $challenges,
        ]);
    }

    public function store(StoreChallengeRequest $request)
    {
        try {
            $this->challengeService->create(auth()->user(), $request->validated());
        } catch (\RuntimeException $e) {
            return back()->withErrors(['bet_amount' => $e->getMessage()]);
        }

        return redirect('/ads')->with('success', 'Défi créé avec succès !');
    }

    public function show(Challenge $challenge)
    {
        $user      = auth()->user();
        $creatorId = $challenge->creator_id;

        $wins  = GameMatch::where('winner_id', $creatorId)->where('status', 'termine')->count();
        $total = GameMatch::where(function ($q) use ($creatorId) {
            $q->where('player1_id', $creatorId)->orWhere('player2_id', $creatorId);
        })->where('status', 'termine')->count();

        $challenge->load('creator');

        return Inertia::render('DefiDetail', [
            'challenge' => [
                'id'         => $challenge->id,
                'type'       => strtoupper($challenge->type),
                'game'       => $challenge->game,
                'bet_amount' => $challenge->bet_amount,
                'currency'   => $challenge->currency ?? 'rb',
                'visibility' => $challenge->visibility === 'public' ? 'Publique' : 'Privée',
                'rules'      => $challenge->rules ?? [],
                'created_at' => $challenge->created_at->diffForHumans(),
                'status'     => $challenge->status,
                'creator'    => [
                    'id'                => $challenge->creator->id,
                    'username'          => $challenge->creator->username,
                    'reliability_score' => $challenge->creator->reliability_score,
                    'avatar_path'       => $challenge->creator->avatar_path,
                    'wins'              => $wins,
                    'losses'            => $total - $wins,
                ],
            ],
            'canJoin' => $challenge->status === 'ouvert'
                && $challenge->creator_id !== $user->id
                && (
                    ($challenge->currency === 'usdt' && $user->balance_usdt >= $challenge->bet_amount)
                    || ($challenge->currency !== 'usdt' && $user->balance_rb >= $challenge->bet_amount)
                ),
        ]);
    }

    public function join(Request $request, Challenge $challenge)
    {
        $validated = $request->validate([
            'fighter' => ['nullable', 'string', 'max:100'],
        ]);

        try {
            $match = $this->challengeService->join(auth()->user(), $challenge, $validated['fighter'] ?? '');
        } catch (\RuntimeException $e) {
            return back()->withErrors(['join' => $e->getMessage()]);
        }

        return redirect("/chat/{$match->id}");
    }

    public function cancel(Challenge $challenge)
    {
        try {
            $this->challengeService->cancel(auth()->user(), $challenge);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['cancel' => $e->getMessage()]);
        }

        return redirect('/ads')->with('success', 'Défi annulé. Mise remboursée.');
    }

    public function reactivate(Challenge $challenge)
    {
        $user = auth()->user();

        if ($challenge->creator_id !== $user->id) {
            return back()->withErrors(['reactivate' => 'Action non autorisée.']);
        }

        if ($challenge->status !== 'annule') {
            return back()->withErrors(['reactivate' => 'Seul un défi annulé peut être réactivé.']);
        }

        try {
            $this->challengeService->reactivate($user, $challenge);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['reactivate' => $e->getMessage()]);
        }

        return back()->with('success', 'Défi réactivé avec succès.');
    }

    public function destroy(Challenge $challenge)
    {
        $user = auth()->user();

        if ($challenge->creator_id !== $user->id) {
            return back()->withErrors(['delete' => 'Action non autorisée.']);
        }

        if ($challenge->status !== 'annule') {
            return back()->withErrors(['delete' => 'Seul un défi annulé peut être supprimé.']);
        }

        $challenge->delete();

        return back()->with('success', 'Défi supprimé.');
    }

    public function myDefis()
    {
        $challenges = Challenge::where('creator_id', auth()->id())
            ->with('gameMatch')
            ->latest()
            ->get()
            ->map(fn($c) => [
                'id'         => $c->id,
                'type'       => $c->type,
                'game'       => $c->game,
                'bet_amount' => $c->bet_amount,
                'status'     => $c->status,
                'created_at' => $c->created_at->format('d M, H:i'),
                'can_cancel' => $c->status === 'ouvert',
                'match_id'   => $c->gameMatch?->id,
            ]);

        return Inertia::render('Ads', [
            'myDefis' => $challenges,
        ]);
    }
}
