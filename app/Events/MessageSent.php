<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Message $message) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('chat.' . $this->message->match_id)];
    }

    public function broadcastWith(): array
    {
        return [
            'id'        => $this->message->id,
            'body'      => $this->message->body,
            'type'      => $this->message->type ?? 'text',
            'sender_id' => $this->message->sender_id,
            'time'      => $this->message->created_at->format('H:i'),
        ];
    }
}
