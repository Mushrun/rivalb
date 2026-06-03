<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\GameMatch;
use App\Models\MatchResult;
use App\Models\Message;
use App\Services\AI\ChatModerationService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function __construct(
        private ChatModerationService $moderationService,
        private NotificationService   $notifService,
    ) {}
    public function index()
    {
        $user = Auth::user();

        $conversations = GameMatch::with([
            'challenge',
            'player1',
            'player2',
            'messages' => fn($q) => $q->latest()->limit(1),
        ])
        ->where(function ($q) use ($user) {
            $q->where('player1_id', $user->id)
              ->orWhere('player2_id', $user->id);
        })
        ->get()
        ->map(function ($match) use ($user) {
            $opponent  = $match->player1_id === $user->id ? $match->player2 : $match->player1;
            $lastMsg   = $match->messages->first();
            $unread    = Message::where('match_id', $match->id)
                ->where('sender_id', '!=', $user->id)
                ->whereNull('read_at')
                ->count();

            $myOutcome = null;
            if ($match->status === 'termine' && $match->winner_id) {
                $myOutcome = $match->winner_id === $user->id ? 'win' : 'loss';
            }

            return [
                'match_id'     => $match->id,
                'status'       => $match->status,
                'my_outcome'   => $myOutcome,
                'opponent'     => ['id' => $opponent->id, 'username' => $opponent->username],
                'game'         => $match->challenge->game,
                'bet_amount'   => $match->challenge->bet_amount,
                'last_message' => $lastMsg ? [
                    'body'    => $lastMsg->type === 'result'
                        ? (json_decode($lastMsg->body, true)['result'] === 'win' ? '🏆 A déclaré victoire' : '💀 A déclaré défaite')
                        : $lastMsg->body,
                    'time'    => $lastMsg->created_at->format('H:i'),
                    'is_mine' => $lastMsg->sender_id === $user->id,
                ] : null,
                'unread_count' => $unread,
                'updated_at'   => $lastMsg ? $lastMsg->created_at->timestamp : $match->created_at->timestamp,
            ];
        })
        ->sortByDesc('updated_at')
        ->values();

        return Inertia::render('Chat/Index', [
            'conversations' => $conversations,
        ]);
    }

    public function show(int $matchId)
    {
        $user  = Auth::user();
        $match = GameMatch::with(['challenge.fighters', 'player1', 'player2'])->findOrFail($matchId);

        if ($match->player1_id !== $user->id && $match->player2_id !== $user->id) {
            abort(403);
        }

        Message::where('match_id', $matchId)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = Message::where('match_id', $matchId)
            ->oldest()
            ->get()
            ->map(function ($m) use ($user) {
                $base = [
                    'id'      => $m->id,
                    'type'    => $m->type,
                    'is_mine' => $m->sender_id === $user->id,
                    'time'    => $m->created_at->format('H:i'),
                ];

                if ($m->type === 'result') {
                    $data = json_decode($m->body, true);
                    return array_merge($base, [
                        'result'     => $data['result'] ?? null,
                        'screenshot' => $data['screenshot'] ? asset('storage/' . $data['screenshot']) : null,
                    ]);
                }

                return array_merge($base, ['body' => $m->body]);
            });

        $opponent = $match->player1_id === $user->id ? $match->player2 : $match->player1;

        $isPlayer1  = $match->player1_id === $user->id;
        $myResult   = MatchResult::where('match_id', $matchId)->where('player_id', $user->id)->first();
        $oppResult  = MatchResult::where('match_id', $matchId)->where('player_id', $opponent->id)->first();

        $screenshotUrl = fn($path) => $path ? asset('storage/' . $path) : null;

        $rules         = $match->challenge->rules ?? [];
        $p1FighterName = isset($rules['fighter']) && $rules['fighter'] !== '' ? $rules['fighter'] : null;
        $p2FighterRaw  = $match->player2_fighter;
        $p2FighterName = ($p2FighterRaw && $p2FighterRaw !== 'Libre') ? $p2FighterRaw : null;

        return Inertia::render('Chat/Show', [
            'match'    => [
                'id'              => $match->id,
                'game'            => $match->challenge->game,
                'bet_amount'      => $match->challenge->bet_amount,
                'status'          => $match->status,
                'player1_ready'   => $match->player1_ready,
                'player2_ready'   => $match->player2_ready,
                'is_player1'      => $isPlayer1,
                'my_ready'        => $isPlayer1 ? $match->player1_ready : $match->player2_ready,
                'my_username'     => $user->username,
                'my_result'       => $myResult?->claimed_result,
                'my_screenshot'   => $screenshotUrl($myResult?->screenshot_path),
                'opp_result'      => $oppResult?->claimed_result,
                'opp_screenshot'  => $screenshotUrl($oppResult?->screenshot_path),
                'winner_id'       => $match->winner_id,
                'my_fighter'      => $isPlayer1 ? $p1FighterName : $p2FighterName,
                'opp_fighter'     => $isPlayer1 ? $p2FighterName : $p1FighterName,
            ],
            'opponent' => ['id' => $opponent->id, 'username' => $opponent->username],
            'messages' => $messages,
        ]);
    }

    public function poll(Request $request, int $matchId)
    {
        $user  = Auth::user();
        $match = GameMatch::findOrFail($matchId);

        if ($match->player1_id !== $user->id && $match->player2_id !== $user->id) {
            abort(403);
        }

        $afterId = (int) $request->query('after', 0);

        $messages = Message::where('match_id', $matchId)
            ->where('id', '>', $afterId)
            ->oldest()
            ->get()
            ->map(function ($m) use ($user) {
                $base = [
                    'id'      => $m->id,
                    'type'    => $m->type,
                    'is_mine' => $m->sender_id === $user->id,
                    'time'    => $m->created_at->format('H:i'),
                ];

                if ($m->type === 'result') {
                    $data = json_decode($m->body, true);
                    return array_merge($base, [
                        'result'     => $data['result'] ?? null,
                        'screenshot' => $data['screenshot'] ? asset('storage/' . $data['screenshot']) : null,
                    ]);
                }

                return array_merge($base, ['body' => $m->body]);
            });

        // Marquer les messages reçus comme lus
        Message::where('match_id', $matchId)
            ->where('sender_id', '!=', $user->id)
            ->where('id', '>', $afterId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['messages' => $messages]);
    }

    public function store(Request $request, int $matchId)
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:500'],
        ]);

        $user  = Auth::user();
        $match = GameMatch::findOrFail($matchId);

        if ($match->player1_id !== $user->id && $match->player2_id !== $user->id) {
            abort(403);
        }

        $allowed = $this->moderationService->moderate($validated['body'], $matchId, $user->id);

        if (!$allowed) {
            return back()->withErrors(['body' => 'Ce message a été bloqué par la modération.']);
        }

        $message = Message::create([
            'match_id'  => $matchId,
            'sender_id' => $user->id,
            'body'      => $validated['body'],
            'type'      => 'text',
        ]);

        broadcast(new MessageSent($message))->toOthers();

        // Notifier l'adversaire
        $match->load('player1', 'player2');
        $opponent = $match->player1_id === $user->id ? $match->player2 : $match->player1;
        $this->notifService->nouveauMessage($opponent, $matchId, $user->username);

        return response()->json([
            'message' => [
                'id'      => $message->id,
                'body'    => $message->body,
                'type'    => $message->type,
                'is_mine' => true,
                'time'    => $message->created_at->format('H:i'),
            ],
        ]);
    }
}
