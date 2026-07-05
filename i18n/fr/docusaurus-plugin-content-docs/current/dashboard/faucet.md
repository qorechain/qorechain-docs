---
slug: /dashboard/faucet
title: Faucet
sidebar_label: Faucet
sidebar_position: 9
---

# Faucet

Le **Faucet** vous fournit gratuitement des jetons de test afin que vous puissiez essayer le Dashboard sans rien dépenser de valeur. C'est un outil **réservé au testnet** — utilisez-le sur le testnet (`qorechain-diana`) pour approvisionner votre adresse avant de tester les transferts, les swaps, le staking et le déploiement de contrats.

:::caution Testnet uniquement — aucune valeur réelle
Le QOR de testnet n'a **aucune valeur réelle**. Le Faucet ne touche jamais au mainnet : il n'existe pas de faucet pour le QOR de mainnet, et rien de ce que vous réclamez ici ne peut être transféré vers le mainnet.
:::

## Demander des jetons de test

1. Connectez-vous au **testnet** et ouvrez le **Faucet**.
2. Saisissez l'adresse à approvisionner (`qor1...`). Si votre portefeuille est connecté, sélectionnez **Utiliser mon adresse** pour la remplir automatiquement. Le formulaire vérifie que l'adresse est valide avant de vous laisser continuer.
3. Sélectionnez le bouton de demande. L'approvisionnement est traité en quelques secondes.

Lorsque la demande réussit, une carte de confirmation affiche le montant envoyé et le hash de la transaction, avec un bouton de copie et un lien pour ouvrir la transaction dans l'[Explorer](/dashboard/explorer).

## Limites

Chaque adresse peut faire une demande au Faucet une fois par période de temporisation. La page indique le montant exact par demande et le délai d'attente avant de pouvoir réclamer à nouveau. Si vous refaites une demande trop tôt, le Faucet vous indique quand vous serez à nouveau éligible.

## Que faire avec les jetons de test

Les jetons de test vous permettent d'exercer le réseau de bout en bout sur le testnet :

- Envoyer et recevoir sur la page [Wallet](/dashboard/wallet).
- Essayer un [swap](/dashboard/trade) sur l'AMM.
- [Déléguer](/dashboard/staking-and-validators) à un validateur.
- Déployer et tester des contrats avant de passer au mainnet.

:::note Valeur de test uniquement
Les jetons du Faucet existent sur le testnet et n'ont aucune valeur réelle. Lorsque vous êtes prêt pour une utilisation en production, basculez vers le mainnet (`qorechain-vladi`).
:::
