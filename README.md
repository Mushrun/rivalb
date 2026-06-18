# RivalBet — Documentation Technique

> Plateforme de paris P2P sur jeux de combat (Shadow Fight 4 Arena).  
> Deux joueurs misent des tokens (RB ou USDT), s'affrontent, le gagnant empoche la cagnotte.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Installation locale](#3-installation-locale)
4. [Architecture](#4-architecture)
5. [Base de données](#5-base-de-données)
6. [Flux métier](#6-flux-métier)
7. [Système de devises](#7-système-de-devises)
8. [Services backend](#8-services-backend)
9. [Routes API](#9-routes-api)
10. [Frontend React](#10-frontend-react)
11. [Notifications & Emails](#11-notifications--emails)
12. [Gestion des litiges](#12-gestion-des-litiges)
13. [Authentification](#13-authentification)
14. [Administration](#14-administration)
15. [Déploiement (DigitalOcean)](#15-déploiement-digitalocean)
16. [Variables d'environnement](#16-variables-denvironnement)

---

## 1. Vue d'ensemble

RivalBet permet à deux joueurs de :

1. **Créer un défi** : choisir un jeu, un type (1v1 ou 3v3), un montant de mise (RB ou USDT)
2. **Rejoindre un défi** : un adversaire accepte et mise la même somme
3. **Jouer le match** : dans Shadow Fight 4 Arena, chacun déclare son résultat
4. **Recevoir le gain** : si les deux joueurs sont d'accord → le gagnant reçoit 95% de la cagnotte (5% plateforme)
5. **Arbitrage** : en cas de désaccord → litige Telegram + décision admin

```
Créateur ──mise──► Challenge [ouvert]
                        │
Adversaire ──mise──► Match [en_attente]
                        │
              Les deux marquent Prêt
                        │
                   Match [en_cours]
                        │
             Soumission résultats (win/loss)
                   ┌───┴───┐
              Accord    Désaccord
                │            │
          Paiement      Litige → Admin
           gagnant
```

---

## 2. Stack technique

### Backend

| Outil | Version | Rôle |
|-------|---------|------|
| PHP | >= 8.2 | Langage serveur |
| Laravel | 13 | Framework MVC |
| Inertia.js | 3 | Pont Laravel <-> React (pas d'API REST séparée) |
| MySQL / SQLite | — | Base de données |
| Laravel Queue | database | File de jobs async (emails, etc.) |
| Laravel Reverb | 1.x | Serveur WebSocket (temps réel) |
| Supervisor | — | Garde le worker de queue actif en production |
| Resend | — | Service d'envoi d'emails transactionnels |

### Frontend

| Outil | Version | Rôle |
|-------|---------|------|
| React | 19 | UI |
| Vite | 8 | Bundler |
| Tailwind CSS | 4 | Styles utilitaires |
| i18next | 26 | Internationalisation (EN/FR) |
| Axios | 1.x | Requêtes HTTP |
| Laravel Echo + Pusher-js | — | WebSocket client |

### Intégrations externes

| Service | Usage |
|---------|-------|
| MetaMask / Web3 | Authentification wallet + dépôts crypto |
| BSC (BEP-20) | Tokens RB et USDT on-chain |
| Telegram Bot | Votes communautaires pour les litiges |
| Resend | Emails transactionnels |

---

## 3. Installation locale

```bash
# 1. Cloner le dépôt
git clone https://github.com/Mushrun/rivalb.git
cd rivalb

# 2. Dépendances PHP
composer install

# 3. Dépendances JS
npm install

# 4. Environnement
cp .env.example .env
php artisan key:generate

# 5. Base de données
php artisan migrate --seed

# 6. Lancer
php artisan serve          # http://localhost:8000
npm run dev                # Vite HMR

# 7. Worker de queue (emails, notifications)
php artisan queue:work
```

---

## 4. Architecture

```
app/
├── Http/
│   ├── Controllers/         # Logique HTTP (réception requête -> réponse Inertia)
│   │   └── Admin/           # Contrôleurs du panel admin
│   ├── Requests/            # Validation des formulaires
│   └── Middleware/          # HandleInertiaRequests (partage auth.user global)
├── Models/                  # Eloquent ORM
├── Services/                # Logique métier pure (pas de HTTP ici)
├── Jobs/                    # Tâches asynchrones (ValidateResultJob, etc.)
├── Mail/                    # Maillables (NouveauDefiMail, NouveauMessageMail)
└── Events/                  # Événements broadcast (MatchTermine)

resources/
├── js/
│   ├── Pages/               # Composants React = vues Inertia
│   ├── Components/          # Composants réutilisables (BottomNav, etc.)
│   ├── locales/             # Traductions JSON (en.json, fr.json)
│   └── data/                # Données statiques (fighters.js)
└── views/
    ├── app.blade.php              # Template racine Inertia
    ├── victoire-share.blade.php   # Page partage victoire (OG tags WhatsApp/Telegram)
    └── emails/                    # Templates emails HTML

routes/
└── web.php                  # Toutes les routes (public, auth, admin)
```

### Principe Inertia

Il n'y a **pas d'API REST** classique. Laravel retourne des composants React via Inertia :

```
Navigateur  ──GET /battle──►  Laravel Controller
                              └─ Inertia::render('Battle', ['challenges' => ...])
                              ◄── JSON {component: 'Battle', props: {...}}
React       rehydrate Battle.jsx avec les props
```

---

## 5. Base de données

### Schéma principal

```
users
 ├── id, username, email, password
 ├── wallet_address, auth_nonce        <- MetaMask
 ├── balance_rb, balance_usdt          <- Soldes (TOUJOURS modifiés via ShadowCoinService)
 ├── reliability_score                 <- Score de fiabilité (0-100)
 ├── status (actif / suspendu / banni)
 ├── referral_code, referred_by        <- Parrainage
 └── locale                           <- Langue préférée (en/fr)

challenges
 ├── id, creator_id (FK users)
 ├── type (1v1 / 3v3)
 ├── game                              <- ex: "Shadow Fight 4: Arena"
 ├── bet_amount, currency (rb / usdt)
 ├── status (ouvert / en_cours / termine / annule)
 ├── rules (JSON)                      <- Règles personnalisées
 └── visibility (public / prive)

matches  (modèle: GameMatch)
 ├── id, challenge_id (FK challenges)
 ├── player1_id, player2_id (FK users)
 ├── status (en_attente / en_cours / litige / termine / annule)
 ├── player1_ready, player2_ready      <- Confirmation de départ
 ├── player2_fighter                   <- Personnage choisi
 ├── room_link                         <- ID de salle SF4
 └── winner_id (FK users)

match_results
 ├── match_id, player_id
 ├── claimed_result (win / loss)       <- Ce que le joueur déclare
 └── screenshot_path                  <- Capture d'écran optionnelle

transactions
 ├── user_id, type (depot / retrait / match_gain / match_perte /
 │                  remboursement / bonus_bienvenue / transfer)
 ├── amount_rb, amount_usdt
 ├── currency (rb / usdt)
 ├── status (en_attente / valide / refuse)
 └── note                             <- ex: "To: username" / "From: username"

messages
 ├── match_id (nullable), sender_id, receiver_id
 ├── type (text / system / result / transfer)
 └── body                             <- Texte ou JSON encodé (pour résultats)

disputes
 ├── match_id, opened_by
 ├── status (ouvert / resolu / annule)
 ├── video_path                       <- Preuve vidéo uploadée
 └── telegram_message_id              <- Référence au sondage Telegram

notifications
 ├── user_id, type, title, body
 ├── data (JSON)                      <- Données supplémentaires
 └── read_at                          <- NULL = non lue

follows
 └── follower_id, followed_id         <- Relations sociales

fighters
 ├── name, game
 ├── image_path
 └── is_active                        <- Actif/inactif (géré par admin)
```

---

## 6. Flux métier

### Créer un défi

```
POST /challenges
  └─ ChallengeService::create()
       ├── Vérifie le solde (ShadowCoinService::hasEnough)
       ├── Débite la mise (ShadowCoinService::debit)
       ├── Crée Challenge [status: ouvert]
       └── Notifie TOUS les utilisateurs (notification + email)
```

### Rejoindre un défi

```
POST /challenges/{id}/join
  └─ ChallengeService::join()
       ├── Vérifie status = ouvert
       ├── Vérifie que ce n'est pas son propre défi
       ├── Débite la mise de l'adversaire
       ├── Challenge -> [en_cours]
       ├── Crée GameMatch [status: en_attente]
       └── Notifie le créateur (notification + email)
```

### Démarrer le match

```
POST /match/{id}/ready
  └─ MatchService::setReady()
       ├── Marque player_ready = true
       └── Si les deux sont prêts -> Match [en_cours]
```

Le joueur 1 (créateur) partage l'**ID de la salle SF4** dans ce formulaire.

### Soumettre le résultat

```
POST /match/{id}/result  {claimed_result: "win"|"loss"}
  └─ MatchService::submitResult()
       └─ ValidateResultJob::dispatch()
            └─ MatchService::checkResults()
                 ├── Accord (win + loss ou loss + win)
                 │     └─ confirmResult() -> paye le gagnant (95%), MAJ score fiabilité
                 └── Désaccord (win + win ou loss + loss)
                       └─ DisputeService::open() -> Sondage Telegram
```

### Quitter un match (player2 uniquement)

```
POST /match/{id}/quit
  └─ MatchController::quit()
       ├── Vérifie player2_id = auth user
       ├── Vérifie status = en_attente
       ├── Rembourse player2
       ├── Challenge -> [ouvert]  (disponible pour un autre adversaire)
       ├── Supprime le match
       └── Notifie le créateur
```

### Annuler un défi (créateur uniquement)

```
POST /challenges/{id}/cancel
  └─ ChallengeService::cancel()
       ├── Vérifie creator_id = auth user
       ├── Vérifie status = ouvert
       ├── Rembourse le créateur
       └── Challenge -> [annule]
```

---

## 7. Système de devises

Deux devises coexistent :

| Devise | Colonne | Description |
|--------|---------|-------------|
| **RB** | `balance_rb` | Token interne de la plateforme |
| **USDT** | `balance_usdt` | Stablecoin (1 USDT = 1 $) |

**Règle absolue** : les balances ne sont **jamais modifiées directement** sur le modèle User. Tout passe par `ShadowCoinService` qui :
- Utilise `lockForUpdate()` (verrou pessimiste) pour éviter les race conditions
- Crée une `Transaction` de traçabilité à chaque opération
- Vérifie le solde avant tout débit

```php
// Correct
$coinService->debit($user, 100, 'match_perte');

// INTERDIT — contourne le verrou et la traçabilité
$user->update(['balance_rb' => $user->balance_rb - 100]);
```

### Calcul du gain

```
Gain = (mise x 2) x 0.95    <- 5% de commission plateforme
```

Exemple : mise de 100 RB -> gagnant reçoit 190 RB.

---

## 8. Services backend

### ShadowCoinService

Gestionnaire unique des balances. Toutes les opérations financières passent par lui.

```php
$coinService->hasEnough($user, 100);         // Vérifie solde RB
$coinService->debit($user, 100, 'type');     // Débite RB + log transaction
$coinService->credit($user, 190, 'type');    // Crédite RB + log transaction
$coinService->hasEnoughUsdt($user, 1.5);     // Vérifie solde USDT
$coinService->debitUsdt($user, 1.5, 'type');
$coinService->creditUsdt($user, 2.85, 'type');
```

### ChallengeService

Orchestrateur des défis. Gère `create()`, `join()`, `cancel()`, `reactivate()`.

### MatchService

Orchestrateur des matchs. Gère `setReady()`, `submitResult()`, `checkResults()`, `confirmResult()`.

### DisputeService

Gère les litiges :
- Ouvre un sondage Telegram pour vote communautaire
- `resolve()` : exécute le paiement selon décision admin, met à jour les scores

### NotificationService

Crée des notifications en base + envoie des emails via queue.

Méthodes disponibles :

| Méthode | Déclencheur |
|---------|-------------|
| `defiRecu()` | Défi privé reçu |
| `defiRejoint()` | Défi accepté par un adversaire |
| `matchDemarre()` | Match créé |
| `joueurPret()` | Adversaire a confirmé Prêt |
| `resultatConfirme()` | Résultat validé (win/loss) |
| `litigeOuvert()` | Litige ouvert |
| `litigeResolu()` | Litige résolu |
| `depotValide()` | Dépôt approuvé |
| `depotRefuse()` | Dépôt rejeté |
| `nouveauDefiAbonnement()` | Nouveau défi public (email à TOUS) |
| `matchQuitte()` | Adversaire a quitté le match |
| `nouveauMessage()` | Nouveau message direct |

### TelegramService

Intégration Telegram Bot API pour les votes de litiges communautaires.

```php
$telegramService->sendDisputePoll($matchId, $player1, $player2, $game, $amount);
```

---

## 9. Routes API

Toutes les routes sont dans `routes/web.php`. Il n'y a pas de fichier `api.php` — Inertia remplace l'API REST.

### Routes publiques

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/` | Page d'accueil (landing) |
| GET | `/victoire/{match}` | Page de partage de victoire (OG tags WhatsApp) |
| GET | `/wallet/nonce/{address}` | Nonce pour authentification MetaMask |
| POST | `/wallet/verify` | Vérification signature Web3 |

### Authentification (guest)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET/POST | `/login` | Connexion |
| GET/POST | `/register` | Inscription |
| GET/POST | `/forgot-password` | Mot de passe oublié |
| GET/POST | `/reset-password/{token}` | Réinitialisation |
| POST | `/logout` | Déconnexion |

### Utilisateur connecté (auth)

#### Défis
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/battle` | Liste des défis ouverts |
| GET | `/ads` | Mes défis |
| GET | `/defis/{id}` | Détail d'un défi |
| POST | `/challenges` | Créer un défi |
| POST | `/challenges/{id}/join` | Rejoindre un défi |
| POST | `/challenges/{id}/cancel` | Annuler (créateur) |
| POST | `/challenges/{id}/reactivate` | Réactiver |
| DELETE | `/challenges/{id}` | Supprimer |

#### Matchs
| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/match/{id}/ready` | Marquer prêt |
| POST | `/match/{id}/result` | Soumettre résultat win/loss |
| POST | `/match/{id}/quit` | Quitter (player2 uniquement, status en_attente) |
| POST | `/match/{id}/review` | Laisser un avis post-match |

#### Chat
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/chat` | Liste des conversations |
| GET | `/chat/{id}` | Chat d'un match |
| POST | `/chat/{id}` | Envoyer un message dans le match |
| GET | `/chat/{id}/poll` | Polling nouveaux messages match |
| GET | `/chat/user/{id}` | Conversation directe avec un utilisateur |
| POST | `/chat/user/{id}` | Envoyer message direct |
| GET | `/chat/user/{id}/poll` | Polling messages directs |

#### Finances
| Méthode | URL | Description |
|---------|-----|-------------|
| GET/POST | `/recharge` | Dépôt RB/USDT |
| GET/POST | `/retrait` | Retrait |
| GET | `/historique` | Historique des transactions |
| POST | `/transfer/{userId}` | Transfert de fonds vers un ami |

#### Profil & Social
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/profil` | Mon profil |
| GET | `/profil/{id}` | Profil public d'un joueur |
| POST | `/profil/update` | Modifier le profil |
| POST | `/profil/avatar` | Changer l'avatar |
| POST | `/profil/{id}/follow` | Suivre un joueur |
| DELETE | `/profil/{id}/follow` | Ne plus suivre |
| GET | `/parrainage` | Programme de parrainage |
| GET | `/notifications` | Centre de notifications |

#### Création d'un défi (wizard 6 étapes)

| URL | Étape |
|-----|-------|
| `/challenge/create/1` | Type (1v1 / 3v3) |
| `/challenge/create/2` | Sélection du personnage |
| `/challenge/create/3` | Règles de combat |
| `/challenge/create/4` | Jeu |
| `/challenge/create/5` | Mise (vérification solde) |
| `/challenge/create/6` | Confirmation |

### Routes admin (`/admin/*`, middleware: auth:admin)

| URL | Description |
|-----|-------------|
| GET `/admin` | Tableau de bord |
| GET/POST `/admin/users` | Gestion utilisateurs |
| GET/POST `/admin/defis` | Gestion défis |
| GET/POST `/admin/matchs` | Gestion matchs |
| GET/POST `/admin/litiges` | Résolution litiges |
| GET/POST `/admin/transactions` | Approbation dépôts/retraits |
| GET/POST `/admin/combattants` | Gestion des fighters |
| GET/POST `/admin/admins` | Gestion des comptes admin |

---

## 10. Frontend React

### Pages principales

| Fichier | Route | Description |
|---------|-------|-------------|
| `Battle.jsx` | `/battle` | Marketplace des défis. Les défis des joueurs suivis apparaissent en premier. |
| `Ads.jsx` | `/ads` | Mes défis créés. Bouton Partager sur chaque défi ouvert. |
| `DefiDetail.jsx` | `/defis/{id}` | Détail d'un défi. Rejoindre ou "en attente d'adversaire" pour le créateur. |
| `Chat/Show.jsx` | `/chat/{id}` | Chat du match avec accordéons : Combattants, Match (actions), Conditions. |
| `Historique.jsx` | `/historique` | Historique transactions avec +/- et info To/From pour les transferts. |
| `Parrainage.jsx` | `/parrainage` | Code de parrainage et lien de partage. |
| `Profil/Show.jsx` | `/profil/{id}` | Profil public d'un joueur. Stats, défis récents, avis. |

### Logique de chat (`Chat/Show.jsx`)

Le chat utilise un **polling toutes les 2 secondes** :

```javascript
const poll = async () => {
    const res = await axios.get(`/chat/user/${opponent_id}/poll?after=${lastIdRef.current}`);
    // Ajoute les nouveaux messages au state
};
const interval = setInterval(poll, 2000);
```

Types de messages affichés :

| Type | Rendu |
|------|-------|
| `text` | Bulle de chat normale |
| `system` | Message système centré (ex: "Match démarré") |
| `result` | Carte résultat Victoire/Défaite avec lightbox screenshot |
| `transfer` | Carte de transfert de fonds |

### Actions disponibles dans le chat selon le statut

| Statut match | Player 1 (créateur) | Player 2 (adversaire) |
|---|---|---|
| `en_attente` | Saisir ID salle + Marquer prêt | Marquer prêt OU Quitter le match |
| `en_cours` | Déclarer résultat (win/loss) | Déclarer résultat (win/loss) |
| `litige` | Upload vidéo preuve | Upload vidéo preuve |
| `termine` | Partager victoire (si gagnant) | Partager victoire (si gagnant) |

### Internationalisation

Fichiers : `resources/js/locales/en.json` et `fr.json`

La langue est détectée automatiquement depuis le navigateur, ou forcée via `POST /user/locale`.

```javascript
const { t } = useTranslation();
t('chat.ready_btn')  // "✓ I'm ready" ou "✓ Je suis prêt"
```

---

## 11. Notifications & Emails

### Notifications in-app

Créées via `NotificationService::send()`, stockées dans la table `notifications`. Le badge de notifications non lues est calculé dans `HandleInertiaRequests` et partagé globalement via `auth.user`.

### Emails (queués)

Tous les emails sont **asynchrones** via `Mail::to()->queue()`.

| Mailable | Déclencheur | Template |
|----------|-------------|---------|
| `NouveauDefiMail` | Création d'un défi public | `emails/nouveau-defi.blade.php` |
| `NouveauMessageMail` | Nouveau message direct | `emails/nouveau-message.blade.php` |

Thème : dark avec bouton CTA rouge.

### Worker de queue

En production, Supervisor maintient le worker actif :

```ini
# /etc/supervisor/conf.d/rivalbet-worker.conf
[program:rivalbet-worker]
command=php /var/www/rivalbet/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
```

```bash
supervisorctl status rivalbet-worker    # Vérifier l'état
supervisorctl restart rivalbet-worker   # Redémarrer
```

---

## 12. Gestion des litiges

Quand deux joueurs déclarent tous les deux avoir gagné (ou perdu) :

```
1. DisputeService::open()
   └── Crée Dispute [status: ouvert]
   └── TelegramService::sendDisputePoll()
         └── Envoie un sondage dans le groupe Telegram
               -> La communauté vote pour Player 1 ou Player 2

2. Admin panel (/admin/litiges)
   └── L'admin voit le sondage + la vidéo si uploadée
   └── AdminDisputeController::resolve()
         └── DisputeService::resolve()
               ├── Crédite le gagnant (95% de la cagnotte)
               ├── Met à jour les scores de fiabilité
               ├── Match -> [termine]
               └── Notifie les deux joueurs
```

Un joueur peut uploader une vidéo de preuve via `POST /litiges/{id}/video`.

---

## 13. Authentification

Deux guards distincts :

| Guard | Modèle | Accès |
|-------|--------|-------|
| `web` (défaut) | `User` | Application principale |
| `admin` | `Admin` | Panel admin `/admin/*` |

### Authentification standard

Email + mot de passe via `LoginController`. Sessions Laravel classiques.

### Authentification Web3 (MetaMask)

```
1. Navigateur -> GET /wallet/nonce/{address}
   └── Serveur génère un nonce et le stocke dans users.auth_nonce

2. MetaMask signe le nonce localement (côté client)

3. Navigateur -> POST /wallet/verify {address, signature}
   └── Serveur vérifie la signature (web3p/web3.php)
   └── Si valide -> connexion ou création de compte automatique
```

---

## 14. Administration

Panel accessible à `/admin/login` puis `/admin`.

### Fonctionnalités

- **Dashboard** : stats globales (utilisateurs actifs, défis ouverts, transactions en attente)
- **Utilisateurs** : liste complète, suspension/bannissement
- **Défis** : liste, annulation forcée
- **Matchs** : liste, annulation forcée
- **Litiges** : résolution avec désignation du gagnant + note admin
- **Transactions** : approbation/rejet des dépôts et retraits en attente
- **Combattants** : ajouter des personnages, activer/désactiver
- **Admins** : créer des comptes admin, activer/désactiver

### Score de fiabilité

Chaque utilisateur a un `reliability_score` (0-100) qui évolue après chaque match :
- Victoire confirmée sans litige : score augmente
- Litige perdu : score diminue
- Affiché dans le chat du match pour jauger la confiance entre joueurs

---

## 15. Déploiement (DigitalOcean)

### Stack serveur

```
DigitalOcean Droplet (Ubuntu)
├── Nginx                    <- Reverse proxy
├── PHP-FPM 8.2              <- Application Laravel
├── MySQL                    <- Base de données
├── Node.js / npm            <- Build assets
└── Supervisor               <- Worker de queue (emails)
```

### Déployer une mise à jour

```bash
cd /var/www/rivalbet

# 1. Récupérer le code
git pull

# 2. Si nouvelles migrations
php artisan migrate --force

# 3. Si routes modifiées
php artisan route:clear

# 4. Si config modifiée
php artisan config:clear

# 5. Rebuilder le frontend
npm run build

# 6. Redémarrer le worker si services modifiés
supervisorctl restart rivalbet-worker
```

### Checklist déploiement

- [ ] `git pull` effectué
- [ ] `php artisan migrate --force` (si nouvelles migrations)
- [ ] `php artisan route:clear` (si routes modifiées)
- [ ] `npm run build` (si frontend modifié)
- [ ] Supervisor worker actif : `supervisorctl status`

---

## 16. Variables d'environnement

Copier `.env.example` en `.env` et remplir :

```env
# Application
APP_NAME=RivalBet
APP_ENV=production
APP_DEBUG=false
APP_URL=https://ton-domaine.com

# Base de données
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rivalbet
DB_USERNAME=root
DB_PASSWORD=

# Queue (emails async)
QUEUE_CONNECTION=database

# Mail (Resend)
MAIL_MAILER=resend
RESEND_KEY=re_xxxxx
MAIL_FROM_ADDRESS=noreply@ton-domaine.com
MAIL_FROM_NAME=RivalBet

# Telegram Bot (litiges)
TELEGRAM_BOT_TOKEN=bot123456:ABCdef...
TELEGRAM_GROUP_ID=-1001234567890

# Web3 / Blockchain (BSC BEP-20)
BSC_RPC_URL=https://bsc-dataseed.binance.org/
RB_TOKEN_ADDRESS=0x...
USDT_TOKEN_ADDRESS=0x...
PLATFORM_WALLET=0x...

# WebSocket (Laravel Reverb)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=
REVERB_APP_KEY=
REVERB_APP_SECRET=
REVERB_HOST=localhost
REVERB_PORT=8080
```

---

## Glossaire

| Terme | Signification |
|-------|---------------|
| **RB** | Token interne de RivalBet (RivalBet Coin) |
| **Défi / Challenge** | Une offre de pari publiée par un créateur |
| **Match** | Instance de jeu entre deux joueurs sur un défi accepté |
| **en_attente** | Match créé, les joueurs n'ont pas encore confirmé Prêt |
| **en_cours** | Les deux joueurs ont confirmé Prêt, le match est en jeu |
| **litige** | Résultats contradictoires — arbitrage communauté/admin |
| **player1** | Le créateur du défi |
| **player2** | L'adversaire qui a rejoint le défi |
| **Fiabilité** | Score (0-100) reflétant l'honnêteté d'un joueur |
| **Inertia** | Protocole permettant à Laravel de retourner des composants React comme des vues |
| **ShadowCoinService** | Service unique autorisé à modifier les balances des utilisateurs |

---

*Documentation — branche `main` — mis à jour le 2026-06-18*
