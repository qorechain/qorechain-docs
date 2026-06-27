---
slug: /dashboard/bridge
title: Bridge
sidebar_label: Bridge
sidebar_position: 5
---

# Bridge

Le **Bridge** vous permet de déplacer des actifs entre QoreChain et d'autres chaînes depuis un seul écran. Chaque opération de bridge est sécurisée par de la cryptographie post-quantique. Pour la conception qui sous-tend les transferts inter-chaînes, consultez [Architecture du Bridge](/architecture/bridge-architecture).

:::caution Statut qualifié
Le bridge inter-chaînes est actuellement en testnet et déployé progressivement — ce n'est pas encore un système de production sur mainnet. Considérez les routes disponibles comme un travail en cours plutôt que comme une connectivité garantie en direct, et commencez sur le testnet.
:::

Connectez votre portefeuille pour utiliser le Bridge — consultez [Présentation et prise en main](/dashboard/overview#connect-your-wallet).

## Comment faire le bridge d'un actif

1. Choisissez la chaîne **source** et le jeton dans le sélecteur supérieur. Le sélecteur affiche le jeton, son réseau et votre solde.
2. Choisissez la chaîne de **destination** et le jeton dans le sélecteur inférieur.
3. Saisissez le montant à transférer. Le montant que vous recevrez est affiché côté destination.
4. Pour envoyer les actifs à une adresse différente de la vôtre, activez **Send to another** et saisissez le destinataire.
5. Vérifiez les **frais** et le **temps estimé** de règlement affichés en bas.
6. Confirmez le transfert dans votre portefeuille.

Une commande d'échange entre les deux sélecteurs vous permet d'inverser la source et la destination d'un seul geste.

## Conseils

- Vérifiez les deux chaînes et l'adresse de destination avant de soumettre — les transferts inter-chaînes ne peuvent pas être annulés.
- Le temps de règlement varie selon la route ; l'estimation se met à jour à mesure que vous changez de chaîne et de montant.
- Pour des informations sur la manière dont les transferts sont validés entre les chaînes, consultez [Transfert d'actifs (bridging)](/user-guide/bridging-assets) et [Architecture du Bridge](/architecture/bridge-architecture).
