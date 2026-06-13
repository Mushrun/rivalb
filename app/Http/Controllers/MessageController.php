<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\GameMatch;
use App\Models\MatchResult;
use App\Models\Message;
use App\Models\User;
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

    // ── Liste des conversations (une par adversaire) ──────────────────────────
    public function index()
    {
        $user = Auth::user();

        $matches = GameMatch::with(['challenge', 'player1', 'player2'])
            ->where(fn($q) => $q->where('player1_id', $user->id)->orWhere('player2_id', $user->id))
            ->get();

        $byOpponent = [];

        foreach ($matches as $match) {
            $opponent = $match->player1_id === $user->id ? $match->player2 : $match->player1;
            if (!$opponent) continue;

            $matchIds = [$match->id];

            $lastMsg = Message::where(fn($q) => $q
                    ->whereIn('match_id', $matchIds)
                    ->orWhere(fn($q2) => $q2->where('sender_id', $user->id)->where('receiver_id', $opponent->id))
                    ->orWhere(fn($q2) => $q2->where('sender_id', $opponent->id)->where('receiver_id', $user->id))
                )
                ->latest()
                ->first();

            $unread = Message::where(fn($q) => $q
                    ->where(fn($q2) => $q2->where('sender_id', $opponent->id)->where('receiver_id', $user->id))
                    ->orWhere(fn($q2) => $q2->whereIn('match_id', $matchIds)->where('sender_id', $opponent->id))
                )
                ->whereNull('read_at')
                ->count();

            $ts = $lastMsg ? $lastMsg->created_at->timestamp : $match->created_at->timestamp;

            if (!isset($byOpponent[$opponent->id]) || $ts > $byOpponent[$opponent->id]['updated_at']) {
                $myOutcome = null;
                if ($match->status === 'termine' && $match->winner_id) {
                    $myOutcome = $match->winner_id === $user->id ? 'win' : 'loss';
                }

                $byOpponent[$opponent->id] = [
                    'opponent_id'  => $opponent->id,
                    'match_id'     => $match->id,
                    'status'       => $match->status,
                    'my_outcome'   => $myOutcome,
                    'opponent'     => ['id' => $opponent->id, 'username' => $opponent->username, 'avatar_path' => $opponent->avatar_path],
                    'game'         => $match->challenge->game ?? 'Shadow Fight',
                    'bet_amount'   => $match->challenge->bet_amount ?? 0,
                    'last_message' => $lastMsg ? [
                        'body'    => $lastMsg->type === 'result'
                            ? (json_decode($lastMsg->body, true)['result'] === 'win' ? '🏆 A déclaré victoire' : '💀 A déclaré défaite')
                            : $lastMsg->body,
                        'time'    => $lastMsg->created_at->format('H:i'),
                        'is_mine' => $lastMsg->sender_id === $user->id,
                    ] : null,
                    'unread_count' => $unread,
                    'updated_at'   => $ts,
                ];
            }
        }

        $conversations = collect(array_values($byOpponent))->sortByDesc('updated_at')->values();

        return Inertia::render('Chat/Index', [
            'conversations' => $conversations,
        ]);
    }

    // ── Conversation avec un adversaire (tous leurs matchs ensemble) ──────────
    public function showConversation(int $opponentId)
    {
        $user     = Auth::user();
        $opponent = User::findOrFail($opponentId);

        $matchIds = GameMatch::where(fn($q) => $q
                ->where('player1_id', $user->id)->where('player2_id', $opponentId)
            )
            ->orWhere(fn($q) => $q
                ->where('player1_id', $opponentId)->where('player2_id', $user->id)
            )
            ->pluck('id');

        $messages = Message::where(fn($q) => $q
                ->whereIn('match_id', $matchIds)
                ->orWhere(fn($q2) => $q2->where('sender_id', $user->id)->where('receiver_id', $opponentId))
                ->orWhere(fn($q2) => $q2->where('sender_id', $opponentId)->where('receiver_id', $user->id))
            )
            ->oldest()
            ->get()
            ->map(function ($m) use ($user) {
                $base = [
                    'id'       => $m->id,
                    'type'     => $m->type,
                    'is_mine'  => $m->sender_id === $user->id,
                    'time'     => $m->created_at->format('H:i'),
                    'match_id' => $m->match_id,
                ];

                if ($m->type === 'result') {
                    $data = json_decode($m->body, true);
                    return array_merge($base, [
                        'result'     => $data['result'] ?? null,
                        'screenshot' => isset($data['screenshot']) ? asset('storage/' . $data['screenshot']) : null,
                    ]);
                }

                return array_merge($base, ['body' => $m->body]);
            });

        Message::where(fn($q) => $q
                ->whereIn('match_id', $matchIds)
                ->orWhere(fn($q2) => $q2->where('sender_id', $opponentId)->where('receiver_id', $user->id))
            )
            ->where('sender_id', $opponentId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $latestMatch = GameMatch::with(['challenge'])
            ->whereIn('id', $matchIds)
            ->latest()
            ->first();

        $matchInfo = null;
        if ($latestMatch) {
            $isPlayer1 = $latestMatch->player1_id === $user->id;
            $myResult  = MatchResult::where('match_id', $latestMatch->id)->where('player_id', $user->id)->first();
            $oppResult = MatchResult::where('match_id', $latestMatch->id)->where('player_id', $opponentId)->first();

            $rules         = $latestMatch->challenge->rules ?? [];
            $p1FighterName = isset($rules['fighter']) && $rules['fighter'] !== '' ? $rules['fighter'] : null;
            $p2FighterRaw  = $latestMatch->player2_fighter;
            $p2FighterName = ($p2FighterRaw && $p2FighterRaw !== 'Libre') ? $p2FighterRaw : null;

            $matchInfo = [
                'id'            => $latestMatch->id,
                'game'          => $latestMatch->challenge->game ?? 'Shadow Fight',
                'bet_amount'    => $latestMatch->challenge->bet_amount,
                'currency'      => $latestMatch->challenge->currency ?? 'rb',
                'status'        => $latestMatch->status,
                'player1_ready' => $latestMatch->player1_ready,
                'player2_ready' => $latestMatch->player2_ready,
                'is_player1'    => $isPlayer1,
                'my_ready'      => $isPlayer1 ? $latestMatch->player1_ready : $latestMatch->player2_ready,
                'my_username'   => $user->username,
                'my_result'     => $myResult?->claimed_result,
                'opp_result'    => $oppResult?->claimed_result,
                'winner_id'     => $latestMatch->winner_id,
                'my_fighter'    => $isPlayer1 ? $p1FighterName : $p2FighterName,
                'opp_fighter'   => $isPlayer1 ? $p2FighterName : $p1FighterName,
                'has_reviewed'  => \App\Models\Review::where('reviewer_id', $user->id)->where('match_id', $latestMatch->id)->exists(),
            ];
        }

        return Inertia::render('Chat/Show', [
            'match'       => $matchInfo,
            'opponent'    => ['id' => $opponent->id, 'username' => $opponent->username],
            'messages'    => $messages,
            'opponent_id' => $opponentId,
        ]);
    }

    // ── Ancien show par match → redirige vers conversation par adversaire ─────
    public function show(int $matchId)
    {
        $user  = Auth::user();
        $match = GameMatch::findOrFail($matchId);

        if ($match->player1_id !== $user->id && $match->player2_id !== $user->id) {
            abort(403);
        }

        $opponentId = $match->player1_id === $user->id ? $match->player2_id : $match->player1_id;

        return redirect("/chat/user/{$opponentId}");
    }

    // ── Envoyer un message dans une conversation ──────────────────────────────
    public function storeToUser(Request $request, int $opponentId)
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:500'],
        ]);

        $user     = Auth::user();
        $opponent = User::findOrFail($opponentId);

        $latestMatch = GameMatch::where(fn($q) => $q
                ->where('player1_id', $user->id)->where('player2_id', $opponentId)
            )
            ->orWhere(fn($q) => $q
                ->where('player1_id', $opponentId)->where('player2_id', $user->id)
            )
            ->latest()
            ->first();

        $allowed = $this->moderationService->moderate($validated['body'], $latestMatch?->id, $user->id);

        if (!$allowed) {
            return back()->withErrors(['body' => 'Ce message a été bloqué par la modération.']);
        }

        $message = Message::create([
            'match_id'    => $latestMatch?->id,
            'sender_id'   => $user->id,
            'receiver_id' => $opponentId,
            'body'        => $validated['body'],
            'type'        => 'text',
        ]);

        broadcast(new MessageSent($message))->toOthers();

        $this->notifService->nouveauMessage($opponent, $latestMatch?->id ?? 0, $user->username, $validated['body']);

        return response()->json([
            'message' => [
                'id'       => $message->id,
                'body'     => $message->body,
                'type'     => $message->type,
                'is_mine'  => true,
                'time'     => $message->created_at->format('H:i'),
                'match_id' => $message->match_id,
            ],
        ]);
    }

    // ── Polling des nouveaux messages d'une conversation ──────────────────────
    public function pollUser(Request $request, int $opponentId)
    {
        $user    = Auth::user();
        $afterId = (int) $request->query('after', 0);

        $matchIds = GameMatch::where(fn($q) => $q
                ->where('player1_id', $user->id)->where('player2_id', $opponentId)
            )
            ->orWhere(fn($q) => $q
                ->where('player1_id', $opponentId)->where('player2_id', $user->id)
            )
            ->pluck('id');

        $messages = Message::where(fn($q) => $q
                ->whereIn('match_id', $matchIds)
                ->orWhere(fn($q2) => $q2->where('sender_id', $user->id)->where('receiver_id', $opponentId))
                ->orWhere(fn($q2) => $q2->where('sender_id', $opponentId)->where('receiver_id', $user->id))
            )
            ->where('id', '>', $afterId)
            ->oldest()
            ->get()
            ->map(function ($m) use ($user) {
                $base = ['id' => $m->id, 'type' => $m->type, 'is_mine' => $m->sender_id === $user->id, 'time' => $m->created_at->format('H:i'), 'match_id' => $m->match_id];
                if ($m->type === 'result') {
                    $data = json_decode($m->body, true);
                    return array_merge($base, ['result' => $data['result'] ?? null, 'screenshot' => isset($data['screenshot']) ? asset('storage/' . $data['screenshot']) : null]);
                }
                return array_merge($base, ['body' => $m->body]);
            });

        Message::where(fn($q) => $q
                ->where(fn($q2) => $q2->where('sender_id', $opponentId)->where('receiver_id', $user->id))
                ->orWhere(fn($q2) => $q2->whereIn('match_id', $matchIds)->where('sender_id', $opponentId))
            )
            ->where('id', '>', $afterId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['messages' => $messages]);
    }

    // ── Ancien store par match (compatibilité Battle page) ────────────────────
    public function store(Request $request, int $matchId)
    {
        $user  = Auth::user();
        $match = GameMatch::findOrFail($matchId);

        if ($match->player1_id !== $user->id && $match->player2_id !== $user->id) {
            abort(403);
        }

        $opponentId = $match->player1_id === $user->id ? $match->player2_id : $match->player1_id;

        return $this->storeToUser($request, $opponentId);
    }

    // ── Ancien poll par match (compatibilité Battle page) ─────────────────────
    public function poll(Request $request, int $matchId)
    {
        $user  = Auth::user();
        $match = GameMatch::findOrFail($matchId);

        if ($match->player1_id !== $user->id && $match->player2_id !== $user->id) {
            abort(403);
        }

        $opponentId = $match->player1_id === $user->id ? $match->player2_id : $match->player1_id;

        return $this->pollUser($request, $opponentId);
    }
}
