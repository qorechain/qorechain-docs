---
slug: /user-guide/deploying-rollups
title: Déploiement de rollups
sidebar_label: Déploiement de rollups
sidebar_position: 6
---

# Déploiement de rollups

Ce guide est une courte présentation du lancement d'un rollup spécifique à une application qui se règle sur QoreChain à l'aide du Rollup Development Kit (RDK). Les commandes pas à pas se trouvent dans **[Déployer un rollup](/rollups/deploying-a-rollup)** ; cette page couvre ce dont vous avez besoin avant de commencer.

:::caution Capacité à un stade précoce
Aucun rollup n'a encore été créé sur l'un ou l'autre réseau (vérifié le 20 octobre 2026). Le mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) exécute la version de chaîne **v3.2.3** ; le testnet (**`qorechain-diana`**, EVM chain ID **9800**) exécute une version plus récente (**v3.2.4**). Validez d'abord sur le testnet ; un comportement diffère entre les deux (voir la note sur la fenêtre de contestation dans [Rollup Development Kit](/architecture/rollup-development-kit#optimistic-settlement)).
:::

---

## Ce qu'est un rollup ici {#what-a-rollup-is-here}

Un rollup QoreChain est une chaîne spécifique à une application qui **s'exécute hors chaîne** et utilise QoreChain pour le **règlement** : vous enregistrez le rollup on-chain, publiez des lots de racines d'état et (facultativement) des blobs de données et des engagements de retrait. L'enregistrement on-chain contient un profil, un mode de règlement, un mode de séquenceur, un backend de disponibilité des données, un modèle de gas et un label de VM ; la chaîne hôte n'exécute pas les transactions de votre rollup.

---

## Profils prédéfinis {#preset-profiles}

Le RDK est livré avec cinq profils prédéfinis, chacun réglé pour une catégorie d'application courante :

| Profil        | Règlement (preuve)  | Séquenceur | DA              | Modèle de gas | VM       | Cas d'usage prévu |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dédié | natif          | EIP-1559     | EVM      | Applications DeFi/AMM (prêt, DEX, dérivés) |
| **gaming**     | based               | based     | natif           | forfaitaire         | custom   | État de jeu à haut débit et expériences en temps réel |
| **nft**        | optimistic (fraude)  | dédié | natif (DA Celestia prévue) | standard | CosmWasm | Charges de travail de frappe et de place de marché NFT |
| **enterprise** | based               | based     | natif          | subventionné   | EVM      | Déploiements avec permissions et consortiums, avec frais sponsorisés |
| **custom**     | valeurs par défaut : optimistic (fraude) | dédié | natif | standard | EVM | Valeurs par défaut de départ ; ajustez ce que le message permet |

Voir [Profils prédéfinis](/rollups/preset-profiles) pour les détails et les notes de maturité (par exemple, un rollup `defi` créé via la CLI ne peut pas encore finaliser de lots ZK, et le séquençage `based` signifie actuellement que le créateur soumet).

---

## Prérequis {#requirements}

| Prérequis | Détails |
| ----------- | ------- |
| **Mise du rollup** | Au moins 10 000 QOR (`min_stake_for_rollup`, 10 000 000 000 uqor). Lisez la valeur en vigueur : `qorechaind query rdk config` |
| **Brûlage à la création** | 1 % de la mise que vous fournissez est brûlé à la création ; le reste est placé sous séquestre dans un registre propre à chaque rollup. Lorsque vous arrêtez le rollup, vous récupérez ce qu'il en reste (les retraits et les récompenses de preuve de fraude payés sur ce registre réduisent le remboursement) |
| **Id du rollup** | 3 à 64 caractères : lettres minuscules, chiffres, `.`, `_` et `-`, commençant par une lettre ou un chiffre. Un id qui enfreint ces règles est refusé une fois les frais payés ; vérifiez-le donc d'abord |
| **Mise d'enregistrement de la couche** | La création d'un rollup enregistre aussi une couche auprès du module multilayer, ce qui verrouille 1 000 QOR supplémentaires du créateur (restitués à l'arrêt du rollup). Sans ce solde, la couche n'est pas créée et le rollup ne peut pas être ancré |
| **Compte** | Un compte approvisionné avec une clé post-quantique enregistrée (chaque transaction du lane natif est signée en hybride) |

---

## Astuces {#tips}

* Commencez par un profil prédéfini. Les profils prédéfinis fixent le mode de règlement, le séquenceur, le backend de disponibilité des données et la VM ; `create-rollup` ne prend que l'id, le profil, la mise et un `--vm` facultatif.
* Le brûlage à la création de 1 % s'applique à la mise que vous fournissez.
* Les lots se règlent sans ancrage, sauf si vous leur joignez la signature post-quantique du créateur (`--anchor-signature` sur `tx rdk submit-batch`, disponible depuis la v3.2.2). Voir [Ancrage d'état](/architecture/rollup-development-kit#state-anchoring).
* Les retraits vers L1 (`tx rdk execute-withdrawal`) sont payés depuis le registre de séquestre de votre rollup et fonctionnent sur le mainnet depuis la v3.2.3 ; ils nécessitent un lot finalisé avec une racine de retraits et n'utilisent que `uqor`.
* Le créateur du rollup est aujourd'hui celui qui soumet les lots (aucun profil prédéfini ne définit d'adresse de séquenceur) ; gardez donc la clé du créateur en sécurité : seul le créateur peut mettre en pause, reprendre ou arrêter le rollup.
* L'assistant `suggest-profile` renvoie actuellement un repli fixe `defi` sur les points de terminaison publics ; choisissez donc dans le tableau des profils.

---

## Prochaines étapes {#next-steps}

* [Déployer un rollup](/rollups/deploying-a-rollup) — créer, exploiter et arrêter un rollup depuis la CLI ou TypeScript.
* [Présentation des rollups](/rollups/overview) — modes de règlement, séquenceurs, systèmes de preuve.
* [Disponibilité des données](/rollups/data-availability) et [ZK / STARK et retraits](/rollups/zk-stark-withdrawals).
