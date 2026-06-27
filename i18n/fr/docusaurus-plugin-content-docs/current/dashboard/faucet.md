---
slug: /dashboard/faucet
title: Faucet
sidebar_label: Faucet
sidebar_position: 9
---

# Faucet

Le **Faucet** vous fournit des jetons de test gratuits afin que vous puissiez essayer le Dashboard sans dépenser quoi que ce soit de valeur. C'est un outil **réservé au testnet** — utilisez-le sur le testnet (`qorechain-diana`) pour approvisionner votre adresse avant de tester les transferts, les swaps, le staking et le déploiement de contrats.

## Demander des jetons de test

1. Connectez-vous au **testnet** et ouvrez le **Faucet**.
2. Saisissez l'adresse à approvisionner (`qor1...`). Si votre portefeuille est connecté, sélectionnez **Use my address** pour la remplir automatiquement. Le formulaire confirme que l'adresse est valide avant que vous puissiez continuer.
3. Sélectionnez le bouton de demande. L'approvisionnement est traité en quelques secondes.

Lorsque la demande aboutit, une carte de confirmation affiche le montant envoyé et le hash de la transaction, avec un bouton de copie et un lien pour ouvrir la transaction dans l'[Explorer](/dashboard/explorer).

## Limites

Chaque adresse peut faire une demande au Faucet une fois par période d'attente. La page affiche le montant exact par demande et le délai d'attente avant de pouvoir réclamer à nouveau. Si vous faites une nouvelle demande trop tôt, le Faucet vous indique quand vous serez à nouveau éligible.

## Que faire avec les jetons de test

Les jetons de test vous permettent d'utiliser le réseau de bout en bout sur le testnet :

- Envoyer et recevoir sur la page [Wallet](/dashboard/wallet).
- Essayer un [swap](/dashboard/trade) sur l'AMM.
- [Déléguer](/dashboard/staking-and-validators) à un validateur.
- Déployer et tester des contrats avant de passer au mainnet.

:::note Valeur de test uniquement
Les jetons du Faucet existent sur le testnet et n'ont aucune valeur réelle. Lorsque vous êtes prêt pour une utilisation en production, passez au mainnet (`qorechain-vladi`).
:::
