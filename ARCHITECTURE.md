# Architecture Technique - RIVALBET

## 1. Stack
- **Backend :** Laravel 12 + MySQL.
- **Frontend :** React + Inertia.js + Tailwind CSS.
- **State Management :** Utilisation intensive des DB Transactions pour la sécurité financière.

## 2. Design System (D'après images)
- **Couleurs :** Fond `#0D0D0D`, Accents Rouge `#FF3B30`, Succès `#4CD964`.
- **Composants :** 
    - Cartes avec bordures "Glow".
    - Progress bars de fiabilité (Gradient Rouge/Vert).
    - Stepper (1/6) pour la création de défi.

## 3. Schéma de Base de Données (Clé)
- `users` : balance, escrow_balance, win_count, loss_count, reliability_score.
- `challenges` : creator_id, opponent_id, amount, mode (1v1/3v3), settings (json), status (pending, active, verification, disputed, completed).
- `characters` : name, image_path, is_active.
- `feedbacks` : sender_id, receiver_id, rating (like/dislike), comment.