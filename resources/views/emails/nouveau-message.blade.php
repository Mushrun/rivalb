<x-mail::message>
# 💬 Tu as un nouveau message !

Bonjour **{{ $recipient->username }}**,

**{{ $senderUsername }}** t'a envoyé un message dans le **Match #{{ $matchId }}**.

Ouvre le chat pour lire et répondre.

<x-mail::button :url="$chatUrl" color="red">
Voir le message
</x-mail::button>

**L'équipe RIVALBET**
</x-mail::message>
