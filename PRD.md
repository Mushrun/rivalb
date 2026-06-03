# PRD - RIVALBET (P2P Shadow Fight Betting)

## 1. Vision
Un SaaS P2P permettant aux joueurs de Shadow Fight de parier des tokens/FCFA sur des combats 1v1 ou 3v3 avec un système de séquestre (Escrow) sécurisé et une interface sociale.

## 2. Spécifications des Onglets (Bottom Bar)
1. **Battle (Accueil) :** Feed des défis disponibles (style Binance P2P) avec accès au solde et bouton "Lancer un défi".
2. **Historique :** Liste des combats passés avec statut Gagné/Perdu et montants associés.
3. **Ads :** Gestion des défis créés par l'utilisateur (Annulation possible si non acceptés).
4. **Chat :** Discussions actives avec les pairs et support, incluant le module de validation de résultat.
5. **Profil :** Stats complètes, score de fiabilité (%), historique de transactions et paramètres.

## 3. Logique de Combat & Pari
- **Modes :** 1v1 Classic et 3v3 Team.
- **Paramétrage :** Sélection du roster (29 persos), choix des persos adverses autorisés, règles (BO3, temps, arène).
- **Escrow :** Débit du "Solde actuel" vers "Mise en cours" dès le lancement/acceptation.
- **Validation :** Système "J'ai gagné / J'ai perdu" avec preuve image obligatoire pour le gagnant. 
- **Litiges :** Si les deux déclarent avoir gagné, les fonds sont gelés et l'admin est notifié.