<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NouveauMessageMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User   $recipient,
        public string $senderUsername,
        public int    $matchId,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "💬 Nouveau message de {$this->senderUsername} — RIVALBET",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.nouveau-message',
            with: [
                'recipient'       => $this->recipient,
                'senderUsername'  => $this->senderUsername,
                'matchId'         => $this->matchId,
                'chatUrl'         => url("/chat/{$this->matchId}"),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
