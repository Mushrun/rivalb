<?php

namespace App\Http\Controllers;

use App\Models\Dispute;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DisputeController extends Controller
{
    public function show(int $id)
    {
        $user = auth()->user();

        // Vérification d'accès avant tout chargement de données sensibles
        $dispute = Dispute::with('gameMatch')->findOrFail($id);
        $match   = $dispute->gameMatch;

        if ($match->player1_id !== $user->id && $match->player2_id !== $user->id) {
            abort(403);
        }

        // Chargement complet uniquement si autorisé
        $dispute->load([
            'gameMatch.challenge',
            'gameMatch.player1',
            'gameMatch.player2',
            'gameMatch.results',
        ]);

        $p1Result = $match->results->firstWhere('player_id', $match->player1_id);
        $p2Result = $match->results->firstWhere('player_id', $match->player2_id);
        $myResult = $match->results->firstWhere('player_id', $user->id);

        return Inertia::render('Dispute/Show', [
            'dispute' => [
                'id'          => $dispute->id,
                'status'      => $dispute->status,
                'video_path'  => $dispute->video_path,
                'admin_note'  => $dispute->admin_note,
                'created_at'  => $dispute->created_at->diffForHumans(),
                'resolved_at' => $dispute->resolved_at?->format('d/m/Y H:i'),
                'winner'      => $dispute->decision_player_id
                    ? ['id' => $dispute->decision_player_id]
                    : null,
            ],
            'match' => [
                'id'         => $match->id,
                'bet_amount' => $match->challenge->bet_amount,
                'game'       => $match->challenge->game,
                'player1'    => ['id' => $match->player1->id, 'username' => $match->player1->username],
                'player2'    => ['id' => $match->player2->id, 'username' => $match->player2->username],
                'p1_result'  => $p1Result?->claimed_result,
                'p2_result'  => $p2Result?->claimed_result,
            ],
            'my_result' => $myResult?->claimed_result,
            'has_video' => !empty($dispute->video_path),
        ]);
    }

    public function uploadVideo(Request $request, int $id)
    {
        $request->validate([
            'video' => ['required', 'file', 'mimes:mp4,mov,avi', 'max:102400'],
        ]);

        $dispute = Dispute::with('gameMatch')->findOrFail($id);
        $match   = $dispute->gameMatch;
        $user    = auth()->user();

        if ($match->player1_id !== $user->id && $match->player2_id !== $user->id) {
            abort(403);
        }

        if ($dispute->status !== 'ouvert') {
            return back()->withErrors(['video' => 'Ce litige est déjà résolu.']);
        }

        $path = $request->file('video')->store('dispute-videos', 'public');
        $dispute->update(['video_path' => $path]);

        return back();
    }
}
