---
slug: /dashboard/trade
title: Trade (DEX)
sidebar_label: Trade (DEX)
sidebar_position: 4
---

# Trade (DEX)

La page **Trade** est la plateforme d'échange décentralisée du Dashboard. Elle vous permet d'échanger des jetons et de fournir de la liquidité directement sur le teneur de marché automatisé (AMM) natif et on-chain de QoreChain — sans carnet d'ordres off-chain ni smart contract externe requis. Les échanges et les actions de liquidité sont réglés au niveau du protocole. Pour la conception sous-jacente, voir [AMM et liquidité on-chain](/architecture/amm).

Connectez votre portefeuille pour trader — voir [Présentation et premiers pas](/dashboard/overview#connect-your-wallet).

La page comporte quatre onglets : **Swap**, **Pools**, **Add Liquidity** et **My Positions**.

## Swap

Échangez un jeton contre un autre :

1. Choisissez le jeton avec lequel vous payez et saisissez un montant.
2. Choisissez le jeton que vous souhaitez recevoir — le montant de sortie est coté automatiquement.
3. Ajustez éventuellement votre **tolérance de slippage** (le mouvement de prix maximal que vous accepterez ; par défaut 0,5 %).
4. Sélectionnez **Swap** et confirmez.

Un panneau d'historique des swaps répertorie vos échanges passés avec les jetons, les montants, le taux, l'heure et le statut.

:::tip Slippage
Une tolérance de slippage plus élevée augmente les chances qu'un échange aboutisse dans des marchés à évolution rapide, mais vous pourriez recevoir un prix moins favorable. La valeur par défaut convient à la plupart des paires.
:::

## Pools

Parcourez les pools de liquidité disponibles. Chaque carte de pool affiche la paire de trading, la liquidité totale, le volume sur 24 heures, l'APR et le nombre de fournisseurs. Un champ de recherche filtre les pools par symbole de jeton.

## Add Liquidity

Fournissez de la liquidité pour gagner une part des frais d'échange :

1. Sélectionnez les deux jetons à apparier (l'un est QOR par défaut).
2. Saisissez un montant pour le premier jeton — le second montant se remplit automatiquement pour correspondre au ratio actuel du pool.
3. Examinez votre part projetée du pool, puis sélectionnez **Add Liquidity** et confirmez.

Vous recevez des jetons de fournisseur de liquidité (LP) représentant votre position.

## My Positions

Consultez les positions de liquidité que vous détenez. Chaque entrée affiche la paire de jetons, le montant dans chaque jeton, votre part du pool, les frais gagnés et l'APR. Sélectionnez **Remove Liquidity** sur une position pour prévisualiser les jetons que vous recevriez et retirer votre part.

## Liens connexes

- [AMM et liquidité on-chain](/architecture/amm) — types de pools et courbes de prix.
- [Portefeuille](/dashboard/wallet) — vérifiez les soldes avant et après un échange.
