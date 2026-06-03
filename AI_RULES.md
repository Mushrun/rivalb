# Règles AI - RIVALBET

1. **Intégrité Financière :** Toute modification de solde doit être enregistrée dans une table `transactions` et exécutée via une `DB::transaction()`.
2. **Fidélité UI :** Respecter strictement les maquettes fournies (Glow effect, coins arrondis 16px, espacement standard).
3. **UX :** Toujours demander une confirmation avant de prélever une mise ("Tu peux perdre ce montant").
4. **Preuves :** Le bouton "J'ai gagné" doit impérativement déclencher l'ouverture du champ d'upload d'image.