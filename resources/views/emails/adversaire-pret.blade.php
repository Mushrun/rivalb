<x-mail::message>
# ⚔️ {{ $opponentUsername }} est prêt !

Bonjour **{{ $creator->username }}**,

**{{ $opponentUsername }}** a marqué **Je suis prêt** pour le **Match #{{ $matchId }}**.

Ouvre le chat pour marquer ton tour et lancer le match.

<x-mail::button :url="$chatUrl" color="red">
Ouvrir le chat — Match #{{ $matchId }}
</x-mail::button>

Bonne chance et que le meilleur gagne ! 🏆

**L'équipe RIVALBET**
</x-mail::message>
