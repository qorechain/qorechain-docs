---
slug: /dashboard/trade
title: Trade (DEX)
sidebar_label: Trade (DEX)
sidebar_position: 4
---

# Trade (DEX)

La page **Trade** (intitulée « QoreChain DEX ») est un écran d'échange de jetons de test, avec quatre onglets : **Swap**, **Pools**, **Add Liquidity** et **My Positions**. Elle sert à essayer un flux d'échange de bout en bout avec des jetons de test avant que de vrais pools n'existent. Pour la conception du teneur de marché automatisé (AMM) natif de QoreChain, voir [AMM et liquidité on-chain](/architecture/amm).

:::caution Jetons de test uniquement, pour le moment
Tout ce qui se trouve sur cette page s'exécute sur le **testnet**, quel que soit le réseau affiché dans l'en-tête. Sur le mainnet, la page reste protégée par la connexion et la reconnaissance, mais elle affiche `qorechain-diana` et des jetons de testnet. Seuls cinq jetons de test QoreSwap sont réglés on-chain ; tout le reste ici est un espace d'entraînement. Le module AMM natif de QoreChain est actif, mais aucun pool n'a encore été créé sur l'un ou l'autre réseau (`GET /qorechain/amm/v1/pools` renvoie une liste vide sur les deux, vérifié le 27 octobre 2026).
:::

## Innovations {#innovations}

- **Échanges on-chain pour cinq jetons de test.** Les échanges entre WQOR, QUSDC, QUSDT, QWETH et QWBTC s'exécutent contre le contrat AMM QoreSwap sur l'EVM du testnet (chain ID 9800). La cotation provient de `getAmountOut` du contrat.
- **Slippage appliqué dans la transaction.** L'échange s'exécute comme une approbation suivie de `swapExactTokensForTokens`, avec une sortie minimale dérivée de votre réglage de slippage, signée par la clé EVM du portefeuille de test. Si le prix dépasse votre tolérance, l'échange est annulé au lieu d'être exécuté à un prix moins favorable.
- **Jetons de test à la demande.** **Get test tokens** réclame les cinq jetons, une fois toutes les 12 heures par jeton.
- **Séparation honnête entre réel et entraînement.** Les autres paires, la liste Pools, Add Liquidity et My Positions forment un espace d'entraînement du testnet et ne sont pas on-chain.

## Comment l'utiliser {#how-to-use}

Prérequis : être connecté et disposer d'un portefeuille de test (voir [Portefeuille](/dashboard/wallet#testnet)). Sans portefeuille, la page affiche « Wallet Required for Trading ».

### Swap

1. La bannière propose **Get test tokens** ; utilisez-le en premier.
2. Choisissez le jeton avec lequel vous payez et saisissez un montant. La paire par défaut, QOR vers USDC, est une paire d'**entraînement** qui n'est pas réglée on-chain. Choisissez **WQOR** et **QUSDC** (ou toute paire parmi les cinq) pour un échange on-chain.
3. Choisissez le jeton à recevoir ; la sortie est cotée automatiquement.
4. Ajustez éventuellement la **tolérance de slippage** (la page propose une valeur par défaut).
5. Sélectionnez **Swap Now**, puis **Confirm Swap**. Le résultat affiche « Swap Confirmed » avec **View Transaction**.

**Recent Swaps** liste les échanges de tous les utilisateurs ; **Show My History** le filtre sur les vôtres.

**Exemple minimal :** sur le testnet, sélectionnez **Get test tokens**, vendez un peu de WQOR contre du QUSDC, **Swap Now**, **Confirm Swap**.

:::tip Slippage
Une tolérance plus élevée augmente les chances qu'un échange aboutisse dans des marchés à évolution rapide, mais vous pourriez recevoir un prix moins favorable. La valeur par défaut convient à la plupart des paires.
:::

### Pools

Parcourez les cartes de pool pour voir la paire de trading et ses détails. Un champ de recherche filtre par symbole de jeton. Ces pools sont une zone d'entraînement, pas de la liquidité on-chain, et les chiffres qu'ils affichent ne sont pas des données de marché.

### Add Liquidity

1. Sélectionnez deux jetons à apparier (l'un est QOR par défaut). Utilisez **Create Pool** pour une nouvelle paire.
2. Saisissez un montant pour le premier jeton ; le second se remplit pour correspondre au ratio du pool. La page indique un minimum pour créer un pool.
3. Examinez votre part, puis confirmez.

### My Positions

Chaque entrée affiche la paire de jetons, le montant de chaque jeton, votre part et les frais gagnés. Pour quitter une position, sélectionnez **Withdraw**, puis **Request Withdrawal (x%)** ; après un délai de refroidissement, sélectionnez **Confirm Withdraw** (ou **Cancel Withdrawal**). Il n'existe pas de bouton unique « Remove Liquidity ».

## Comment y accéder {#how-to-access}

- **URL :** [dashboard.qorechain.io/trade](https://dashboard.qorechain.io/trade).
- **Compte :** la connexion est requise. Un portefeuille de test est nécessaire pour échanger. Sur le mainnet, la [reconnaissance](/dashboard/overview#risk-acknowledgement) unique est aussi requise avant l'ouverture de la page.
- **Réseau :** contenu du testnet uniquement ; le sélecteur de l'en-tête ne le modifie pas.
- **Coût :** gratuit. Les jetons de test proviennent de **Get test tokens** ; le portefeuille de test paie le gaz en QOR de test depuis le [Faucet](/dashboard/faucet).

## Où il est publié {#where-published}

| Surface | Adresse | Réseau | Réglé on-chain ? |
| --- | --- | --- | --- |
| Échange de WQOR, QUSDC, QUSDT, QWETH, QWBTC | `dashboard.qorechain.io/trade` | EVM du testnet, chain ID 9800 | Oui |
| Autres paires, Pools, Add Liquidity, My Positions | `dashboard.qorechain.io/trade` | Testnet | Non, registre d'entraînement |
| AMM natif | Voir [AMM](/architecture/amm) | Les deux réseaux | Aucun pool n'existe encore |

## Limites et problèmes connus {#limits}

- **Pas de trading sur le mainnet.** La page ignore le sélecteur de réseau et affiche aussi le contenu du testnet sur le mainnet.
- **Seuls cinq jetons sont réglés on-chain.** Les jetons du fest du [Faucet](/dashboard/faucet#fest-tokens) ne figurent pas sur cette page.
- **L'AMM natif n'a aucun pool** sur l'un ou l'autre réseau. Les vrais pools seront décrits lorsqu'ils existeront.
- **Les chiffres des pools** sont des données d'entraînement, pas des données de marché.
- **Les jetons de testnet n'ont aucune valeur** et ne peuvent être échangés contre rien.

## Liens connexes

- [AMM et liquidité on-chain](/architecture/amm) - types de pools et courbes de prix.
- [Portefeuille](/dashboard/wallet) - vérifiez les soldes avant et après un échange.
