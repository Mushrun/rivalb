<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dispute;
use App\Services\DisputeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DisputeController extends Controller
{
    public function __construct(private DisputeService $disputeService) {}

    public function index()
    {
        $disputes = Dispute::with([
            'gameMatch.challenge',
            'gameMatch.player1',
            'gameMatch.player2',
            'gameMatch.results',
        ])->latest()->get()->map(function ($d) {
            $match    = $d->gameMatch;
            $p1Result = $match->results->firstWhere('player_id', $match->player1_id);
            $p2Result = $match->results->firstWhere('player_id', $match->player2_id);

            return [
                'id'         => $d->id,
                'status'     => $d->status,
                'created_at' => $d->created_at->diffForHumans(),
                'bet_amount' => $match->challenge->bet_amount,
                'game'       => $match->challenge->game,
                'match_id'   => $match->id,
                'has_video'  => !empty($d->video_path),
                'admin_note' => $d->admin_note,
                'player1'    => [
                    'id'             => $match->player1->id,
                    'username'       => $match->player1->username,
                    'result'         => $p1Result?->claimed_result,
                    'has_screenshot' => !empty($p1Result?->screenshot_path),
                    'screenshot_url' => $p1Result?->screenshot_path
                        ? '/storage/' . $p1Result->screenshot_path
                        : null,
                ],
                'player2'    => [
                    'id'             => $match->player2->id,
                    'username'       => $match->player2->username,
                    'result'         => $p2Result?->claimed_result,
                    'has_screenshot' => !empty($p2Result?->screenshot_path),
                    'screenshot_url' => $p2Result?->screenshot_path
                        ? '/storage/' . $p2Result->screenshot_path
                        : null,
                ],
                'winner_id'  => $d->decision_player_id,
            ];
        });

        return Inertia::render('Admin/Litiges', [
            'disputes' => $disputes,
        ]);
    }

    public function resolve(Request $request, int $id)
    {
        $validated = $request->validate([
            'winner_id' => ['nullable', 'integer'],
            'note'      => ['nullable', 'string', 'max:500'],
            'cancel'    => ['nullable', 'boolean'],
        ]);

        $dispute = Dispute::with('gameMatch.challenge', 'gameMatch.player1', 'gameMatch.player2')
            ->findOrFail($id);

        if ($dispute->status !== 'ouvert') {
            return back()->withErrors(['dispute' => 'Ce litige est déjà résolu.']);
        }

        if ($validated['cancel'] ?? false) {
            $this->disputeService->cancelMatch($dispute);
        } else {
            $this->disputeService->resolve($dispute, (int) $validated['winner_id'], $validated['note'] ?? '');
        }

        return back();
    }
}
