<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MatchResultMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $recipient,
        public readonly int  $matchId,
        public readonly bool $won,
        public readonly int  $prize,
    ) {}

    public function envelope(): Envelope
    {
        app()->setLocale($this->recipient->locale ?? 'fr');
        $subject = $this->won
            ? __('email_match_won_subject', ['prize' => $this->prize])
            : __('email_match_lost_subject');

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.match_result');
    }
}
