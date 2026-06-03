# Déploiement du token RB (BEP-20) sur BSC

## Ce qu'il te faut avant de commencer
- MetaMask installé dans ton navigateur
- Réseau **BSC Mainnet** ajouté à MetaMask :
  - RPC : `https://bsc-dataseed.binance.org/`
  - Chain ID : `56`
  - Symbole : `BNB`
  - Explorer : `https://bscscan.com`
- Minimum **0.05 BNB** dans ton wallet pour les frais de gas
- Ton adresse treasury (peut être la même que ton wallet deployer)

---

## Étape 1 — Ouvrir Remix IDE

Va sur https://remix.ethereum.org

---

## Étape 2 — Créer le fichier Solidity

1. Dans le panneau gauche, clique sur l'icône **"File explorers"**
2. Clique sur **"New File"**
3. Nomme le fichier : `RivalBetToken.sol`
4. Colle tout le contenu du fichier `RivalBetToken.sol` dedans

---

## Étape 3 — Compiler le contrat

1. Clique sur l'icône **"Solidity Compiler"** (panneau gauche)
2. Sélectionne la version : **0.8.20**
3. Coche **"Optimization"** → mettre à **200**
4. Clique **"Compile RivalBetToken.sol"**
5. ✅ Pas d'erreur = prêt à déployer

---

## Étape 4 — Connecter MetaMask (BSC Mainnet)

1. Clique sur l'icône **"Deploy & Run Transactions"** (panneau gauche)
2. Dans **"Environment"**, choisis : **"Injected Provider - MetaMask"**
3. MetaMask s'ouvre → accepte la connexion
4. Vérifie que tu es bien sur **BSC Mainnet** (Chain ID 56)

---

## Étape 5 — Déployer le contrat

1. Dans **"Contract"**, sélectionne `RivalBetToken`
2. À côté du bouton **"Deploy"**, clique sur la flèche pour ouvrir les paramètres
3. Dans le champ `_treasury`, colle **ton adresse wallet** (celle qui recevra les taxes)
4. Clique **"Deploy"**
5. MetaMask demande confirmation → accepte
6. Attends ~5 secondes → le contrat est déployé
7. ✅ Copie l'adresse du contrat depuis Remix (section "Deployed Contracts")

---

## Étape 6 — Vérifier le contrat sur BSCScan

1. Va sur https://bscscan.com
2. Recherche ton adresse de contrat
3. Clique sur **"Verify and Publish"**
4. Choisis :
   - Compiler type : `Solidity (Single file)`
   - Version : `0.8.20`
   - License : `MIT`
5. Colle le code source → **Submit**
6. ✅ Le contrat est vérifié (badge vert sur BSCScan)

---

## Étape 7 — Ajouter la liquidité sur PancakeSwap

1. Va sur https://pancakeswap.finance/add
2. Connecte ton MetaMask
3. Sélectionne la paire : **BNB / RB**
   - Pour RB : colle l'adresse de ton contrat
4. Choisis combien de BNB et de RB tu mets en liquidité initiale
   - Exemple : 1 BNB + 500 000 RB → prix initial = 0.000002 BNB par RB
5. Clique **"Add Liquidity"** → confirme dans MetaMask
6. ✅ Copie l'adresse de la pool créée (visible dans l'URL ou sur BSCScan)

---

## Étape 8 — Ouvrir le trading (anti-bot)

Sur BSCScan (ou dans Remix), appelle la fonction `openTrading` :

1. Va sur BSCScan → ton contrat → **"Write Contract"**
2. Connecte ton MetaMask (bouton "Connect to Web3")
3. Cherche la fonction **`openTrading`**
4. Dans `_pair`, colle **l'adresse de la pool PancakeSwap** (étape 7)
5. Clique **"Write"** → confirme MetaMask
6. ✅ Le trading est ouvert, les bots ne peuvent plus frontrun

---

## Étape 9 — Supprimer les limites (optionnel, après lancement)

Quand le token est stable et que tu veux enlever la limite de 2% max wallet :

1. BSCScan → ton contrat → **"Write Contract"**
2. Fonction **`removeLimits`** → clic → confirme
3. ✅ Limite supprimée, les wallets peuvent détenir autant qu'ils veulent

---

## Récapitulatif des fonctions owner

| Fonction | Paramètre | Usage |
|---|---|---|
| `openTrading(pair)` | adresse pool PancakeSwap | Ouvre le trading après liquidité |
| `removeLimits()` | — | Supprime la limite max wallet 2% |
| `setTax(buy, sell)` | ex: 300, 300 = 3% | Modifier les taxes (max 10%) |
| `setTreasury(addr)` | nouvelle adresse | Changer le wallet qui reçoit les taxes |
| `setExempt(addr, true)` | adresse | Exempter un wallet (CEX, bridge) |
| `transferOwnership(addr)` | nouvelle adresse | Transférer la propriété |

---

## Notes importantes

- **Ne jamais appeler `renounceOwnership`** si tu veux garder le contrôle
- Les taxes vont directement à ton `treasury` à chaque transaction
- Le contrat est **sans mint** : les 10M tokens sont définitifs
- Le contrat est **sans blacklist** : personne ne peut être bloqué
