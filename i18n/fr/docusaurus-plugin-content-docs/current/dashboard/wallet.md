---
slug: /dashboard/wallet
title: Portefeuille
sidebar_label: Portefeuille
sidebar_position: 3
---

# Portefeuille

La page **Portefeuille** est l'endroit où vous consultez votre solde, envoyez et recevez des QOR, et gérez vos adresses. Vos comptes QoreChain sont protégés par une cryptographie résistante au quantique, et chaque adresse utilise le préfixe bech32 `qor` (`qor1...`).

Connectez d'abord votre portefeuille — voir [Aperçu et premiers pas](/dashboard/overview#connect-your-wallet).

## Ce que la page affiche

- L'étiquette de votre portefeuille et l'adresse active, sous forme abrégée, avec un bouton de copie en un clic.
- Votre **solde total** en QOR.
- Un panneau de sécurité indiquant le chiffrement résistant au quantique et le réseau connecté.
- Un indicateur de dernière mise à jour avec une commande d'actualisation.
- Des onglets **Actifs** et **Activité** affichant vos avoirs et votre historique de transactions.

Utilisez la commande d'actualisation à tout moment pour récupérer votre solde actuel et votre dernière activité depuis la chaîne.

## Envoyer des QOR

1. Sélectionnez **Envoyer**.
2. Saisissez l'adresse du destinataire (`qor1...`).
3. Saisissez le montant, et un mémo facultatif.
4. Vérifiez les détails et les frais estimés, puis confirmez.

À mesure que vous saisissez un destinataire, les contacts enregistrés et les adresses récentes sont suggérés pour vous aider à éviter les erreurs. Une fois le transfert soumis, vous recevez une confirmation avec le hash de la transaction, que vous pouvez ouvrir dans l'[Explorateur](/dashboard/explorer).

:::caution Vérifiez bien l'adresse
Les transferts blockchain sont irréversibles. Confirmez toujours l'adresse du destinataire avant d'envoyer.
:::

## Recevoir des QOR

1. Sélectionnez **Recevoir**.
2. Partagez votre adresse ou son QR code avec l'expéditeur, ou copiez l'adresse en un clic.
3. Saisissez éventuellement un montant demandé et un mémo pour générer un lien de paiement et un QR code téléchargeable.

## Gérer vos portefeuilles

Sélectionnez **Mes portefeuilles** pour ouvrir votre liste d'adresses. De là, vous pouvez basculer entre les portefeuilles, créer un nouveau portefeuille, en importer un existant, ou supprimer un portefeuille dont vous n'avez plus besoin. Le portefeuille actif est celui utilisé pour l'envoi, l'échange, le staking et autres actions signées dans le Tableau de bord.

## Voir aussi

- [Opérations sur les jetons](/user-guide/token-operations) — concepts derrière les transferts de QOR et les dénominations.
- [Trade](/dashboard/trade) — échangez vos jetons sur l'AMM on-chain.
- [Bridge](/dashboard/bridge) — déplacez des actifs vers et depuis d'autres chaînes.
