<?php

namespace App\Listeners;

use App\Events\MatchTermine;
use App\Jobs\SendMatchResultNotificationJob;
use App\Services\NotificationService;

class EnvoyerNotificationsMatch
{
    public function __construct(private NotificationService $notifService) {}

    public function handle(MatchTermine $event): void
    {
        $this->notifService->resultatConfirme(
            $event->winner, $event->match->id, true, $event->prize
        );

        $this->notifService->resultatConfirme(
            $event->loser, $event->match->id, false, 0
        );

        SendMatchResultNotificationJob::dispatch($event->winner, $event->match->id, true,  $event->prize);
        SendMatchResultNotificationJob::dispatch($event->loser,  $event->match->id, false, 0);
    }
}
