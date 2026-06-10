<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $notifications = Notification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn($n) => [
                'id'       => $n->id,
                'type'     => $n->type,
                'title'    => $n->title,
                'body'     => $n->body,
                'data'     => $n->data ?? [],
                'link'     => $this->deriveLink($n->type, $n->data),
                'read'     => !is_null($n->read_at),
                'date'     => $this->formatDate($n->created_at),
                'date_key' => $this->dateKey($n->created_at),
                'time'     => $n->created_at->diffForHumans(),
            ]);

        return Inertia::render('Notifications', [
            'notifications' => $notifications,
        ]);
    }

    public function markRead(int $id)
    {
        $notif = Notification::where('user_id', Auth::id())->findOrFail($id);

        if (is_null($notif->read_at)) {
            $notif->update(['read_at' => now()]);
        }

        return redirect($this->deriveLink($notif->type, $notif->data));
    }

    public function markAllRead()
    {
        Notification::where('user_id', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return back();
    }

    private function deriveLink(string $type, ?array $data): string
    {
        return match(true) {
            in_array($type, ['defi_recu', 'defi_rejoint', 'defi_annule'])
                => '/defis/'   . ($data['challenge_id'] ?? ''),
            in_array($type, ['match_demarre', 'match_gagne', 'match_perdu', 'joueur_pret', 'nouveau_message'])
                => '/chat/'    . ($data['match_id'] ?? ''),
            in_array($type, ['litige_ouvert', 'litige_gagne', 'litige_perdu'])
                => '/litiges/' . ($data['dispute_id'] ?? ''),
            default => '/historique',
        };
    }

    private function formatDate(\Carbon\Carbon $date): string
    {
        if ($date->isToday())     return "Aujourd'hui";
        if ($date->isYesterday()) return 'Hier';
        return $date->format('d/m/Y');
    }

    private function dateKey(\Carbon\Carbon $date): ?string
    {
        if ($date->isToday())     return 'today';
        if ($date->isYesterday()) return 'yesterday';
        return null;
    }
}
