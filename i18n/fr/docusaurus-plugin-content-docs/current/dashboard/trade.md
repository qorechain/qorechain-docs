---
slug: /dashboard/trade
title: Trade (DEX)
sidebar_label: Trade (DEX)
sidebar_position: 4
---

# Trade (DEX)

La page **Trade** est l'écran d'échange de jetons du Dashboard : échangez un jeton contre un autre et fournissez de la liquidité à un pool, sans carnet d'ordres off-chain. Pour la conception du teneur de marché automatisé (AMM) natif de QoreChain, voir [AMM et liquidité on-chain](/architecture/amm).

:::caution Jetons de test uniquement, pour le moment
Les pools et les jetons de cette page sont des jetons de test : les échanges s'exécutent sur un contrat de swap déployé sur l'EVM du testnet, et la page comporte un bouton **Get test tokens** pour les obtenir. Ne considérez rien de ce qui est affiché ici comme de la liquidité de valeur réelle ni comme un prix de marché. Le module AMM natif de QoreChain est actif, mais aucun pool n'a encore été créé sur l'un ou l'autre réseau. Cette page sera mise à jour lorsque de vrais pools seront disponibles.
:::

Trader nécessite un compte connecté et un portefeuille — voir [Se connecter](/dashboard/overview#sign-in) et [Connecter votre portefeuille](/dashboard/overview#connect-your-wallet).

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

Parcourez les pools de liquidité disponibles. Chaque carte de pool affiche la paire de trading, la liquidité totale, le volume sur 24 heures et le nombre de fournisseurs. Un champ de recherche filtre les pools par symbole de jeton.

## Add Liquidity

Fournissez de la liquidité à un pool et recevez une part de ses frais d'échange :

1. Sélectionnez les deux jetons à apparier (l'un est QOR par défaut).
2. Saisissez un montant pour le premier jeton — le second montant se remplit automatiquement pour correspondre au ratio actuel du pool.
3. Examinez votre part projetée du pool, puis sélectionnez **Add Liquidity** et confirmez.

Vous recevez des jetons de fournisseur de liquidité (LP) représentant votre position.

## My Positions

Consultez les positions de liquidité que vous détenez. Chaque entrée affiche la paire de jetons, le montant dans chaque jeton, votre part du pool et les frais gagnés. Sélectionnez **Remove Liquidity** sur une position pour prévisualiser les jetons que vous recevriez et retirer votre part.

## Liens connexes

- [AMM et liquidité on-chain](/architecture/amm) — types de pools et courbes de prix.
- [Portefeuille](/dashboard/wallet) — vérifiez les soldes avant et après un échange.
