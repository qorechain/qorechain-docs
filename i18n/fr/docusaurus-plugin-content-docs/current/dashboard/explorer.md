---
slug: /dashboard/explorer
title: Explorer
sidebar_label: Explorer
sidebar_position: 2
---

# Explorer

L'**Explorer** est la fenêtre du Dashboard sur la chaîne. Utilisez-le pour rechercher des blocs, des transactions, des adresses et des validateurs, et pour observer l'activité du réseau en temps réel. L'Explorer est en lecture seule — aucune connexion de portefeuille n'est nécessaire pour le parcourir. Dans le Dashboard, consulter le mainnet exige d'être connecté ; un explorateur public distinct, qui ne nécessite aucun compte, est disponible sur [explore.qore.network](https://explore.qore.network) (c'est une application différente, avec son propre sélecteur Mainnet/Testnet).

## La page de présentation

Ouvrez l'**Explorer** depuis le Dashboard pour voir un instantané en direct du réseau :

- **État du réseau** — ID de la chaîne, état actuel et pastille d'état de sécurité.
- **Activité des blocs** — la hauteur du dernier bloc, le temps moyen entre blocs et les blocs produits aujourd'hui.
- **Offre** — total de QOR mis en jeu (bonded), le ratio de mise en jeu et l'offre en circulation.
- **Statistiques principales** — total des transactions, validateurs actifs et totaux, et total des adresses.
- **Derniers blocs** — une liste en direct indiquant pour chaque bloc sa hauteur, son heure, son nombre de transactions et son proposant.
- **Dernières transactions** — une liste en direct indiquant pour chaque transaction son hash, son type, son bloc, son montant et son expéditeur.

Cliquez sur une ligne de bloc ou de transaction pour ouvrir sa page de détails. Une commande de rafraîchissement sur chaque liste récupère les entrées les plus récentes.

## Recherche

La zone de recherche en haut de l'Explorer accepte l'un quelconque des éléments suivants et vous dirige automatiquement vers la bonne page :

- Une **adresse** (`qor1...`)
- Un **hash de transaction**
- Une **hauteur de bloc** (un nombre)

## Détails d'une transaction

Une page de transaction affiche son hash, son statut, son montant, l'expéditeur et le destinataire (tous deux cliquables), les frais, la hauteur du bloc, le type de transaction et le mémo s'il est présent. Vous pouvez copier le hash et basculer vers une vue brute de la transaction complète pour une inspection plus approfondie.

La page indique aussi ce qui a protégé la transaction, et elle n'avance une affirmation que si la chaîne la confirme :

* **PQC Verified.** Une transaction de la voie native n'affiche cette carte que si elle a réussi **et** si la chaîne elle-même a vérifié sa signature hybride, y compris la partie ML-DSA-87 (la chaîne enregistre un événement de vérification pour elle). Une transaction échouée, ou sans signature hybride vérifiée, affiche à la place une sécurité standard ; l'Explorer ne suppose pas qu'une signature est post-quantique.
* **Autorisée par une fenêtre PQC.** Une transaction envoyée depuis un portefeuille EVM porte une signature secp256k1 ordinaire ; elle n'est donc jamais étiquetée « PQC Verified ». Si l'expéditeur avait une [fenêtre d'autorisation EVM](/developer-guide/evm-development#evm-window) ouverte au moment de l'envoi, la page indique qu'elle a été **autorisée par une fenêtre PQC** et affiche un lien **Window opened by** vers la transaction signée en post-quantique qui a ouvert la fenêtre. Cela s'applique à partir des hauteurs d'activation de la fonctionnalité de fenêtre (testnet 5,920,000 ; mainnet 2,981,742).

Ces libellés sont propres à l'Explorer du Dashboard sur dashboard.qorechain.io/explorer. L'explorateur distinct sur explore.qore.network est une application différente et n'applique pas ces règles.

## Détails d'un bloc

Une page de bloc affiche sa hauteur, son horodatage, son proposant, son hash, son nombre de transactions, le gas utilisé et la liste des transactions qu'il contient, ainsi que son nombre de signatures. Les blocs ne portent aucun libellé post-quantique : ils sont signés par les clés de consensus des validateurs, et la protection post-quantique est indiquée par transaction, pas par bloc. Les commandes Précédent et Suivant vous permettent de parcourir la chaîne bloc par bloc.

## Détails d'une adresse

Une adresse QoreChain est un compte unique doté de trois encodages — Native (`qor1...`), EVM (`0x...`) et SVM (base58) — et la page d'adresse fusionne l'activité de ces trois rails en une vue unique de cette même identité.

La page affiche l'adresse avec un code QR scannable, son solde en QOR, son nombre de transactions et les totaux des transferts entrants et sortants. En dessous se trouve l'historique combiné des transactions de l'adresse sur les rails Native, EVM et SVM — transferts, déploiements de contrats, enregistrements de clés PQC, swaps, demandes au faucet, et plus — chacune avec son montant, son heure et son statut. Vous pouvez copier l'adresse, télécharger son code QR et ouvrir toute transaction pour en voir les détails.

## Validateurs {#validators}

La vue des validateurs liste les validateurs du réseau avec des cartes récapitulatives pour le nombre de validateurs actifs, le total de QOR mis en jeu et la santé du consensus. Le tableau affiche pour chaque validateur son rang, son moniker, son pouvoir de vote, sa commission et son statut (par exemple actif ou jailed), ainsi qu'un indicateur post-quantique. Une zone de recherche filtre par nom ou adresse de validateur. Pour déléguer à un validateur, consultez [Staking et validateurs](/dashboard/staking-and-validators).

:::note La liste des validateurs du Dashboard peut afficher l'ensemble de l'autre réseau
Utilisez [explore.qore.network](https://explore.qore.network) pour la liste des validateurs de chaque réseau faisant autorité.
:::

## Explorer autonome {#standalone-explorer}

Le même Explorer est servi sans le Dashboard sur [explore.qore.network](https://explore.qore.network) : anonyme, réservé à l'exploration, avec des liens courts tels que `/tx/…`, `/block/…`, `/address/…` et `/validators`. Il s'ouvre par défaut sur le mainnet.
