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
        public string $messageBody = '',
    ) {}

    public function envelope(): Envelope
    {
        app()->setLocale($this->recipient->locale ?? 'fr');
        return new Envelope(
            subject: __('email_message_subject', ['sender' => $this->senderUsername]),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.nouveau-message',
            with: [
                'recipient'      => $this->recipient,
                'senderUsername' => $this->senderUsername,
                'matchId'        => $this->matchId,
                'messageBody'    => $this->messageBody,
                'chatUrl'        => url("/chat/{$this->matchId}"),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
