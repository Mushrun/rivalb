<?php

namespace App\Jobs;

use App\Mail\MatchResultMail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendMatchResultNotificationJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 30;

    public function __construct(
        public readonly User $recipient,
        public readonly int  $matchId,
        public readonly bool $won,
        public readonly int  $prize,
    ) {}

    public function handle(): void
    {
        Mail::to($this->recipient->email)
            ->send(new MatchResultMail($this->recipient, $this->matchId, $this->won, $this->prize));
    }
}
