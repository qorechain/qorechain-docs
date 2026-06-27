---
slug: /dashboard/explorer
title: Explorer
sidebar_label: Explorer
sidebar_position: 2
---

# Explorer

L'**Explorer** est la fenêtre du Dashboard sur la chaîne. Utilisez-le pour rechercher des blocs, des transactions, des adresses et des validateurs, et pour observer l'activité du réseau en temps réel. L'Explorer est en lecture seule — aucune connexion de portefeuille n'est nécessaire pour le parcourir.

## La page de présentation

Ouvrez l'**Explorer** depuis le Dashboard pour voir un instantané en direct du réseau :

- **État du réseau** — ID de la chaîne, état actuel et indicateur de résistance quantique.
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

## Détails d'un bloc

Une page de bloc affiche sa hauteur, son horodatage, son proposant, son hash, son nombre de transactions, le gas utilisé et la liste des transactions qu'il contient, ainsi que des informations sur le consensus et la signature post-quantique. Les commandes Précédent et Suivant vous permettent de parcourir la chaîne bloc par bloc.

## Détails d'une adresse

Une page d'adresse affiche l'adresse avec un code QR scannable, son solde en QOR, son nombre de transactions et les totaux des transferts entrants et sortants. En dessous se trouve l'historique complet des transactions de l'adresse — transferts, swaps, demandes au faucet, et plus — chacune avec son montant, son heure et son statut. Vous pouvez copier l'adresse, télécharger son code QR et ouvrir toute transaction pour en voir les détails.

## Validateurs {#validators}

La vue des validateurs liste les validateurs du réseau avec des cartes récapitulatives pour le nombre de validateurs actifs, le total de QOR mis en jeu et la santé du consensus. Le tableau affiche pour chaque validateur son rang, son moniker, son pouvoir de vote, sa commission et son statut (par exemple actif ou jailed), ainsi qu'un indicateur post-quantique. Une zone de recherche filtre par nom ou adresse de validateur. Pour déléguer à un validateur, consultez [Staking et validateurs](/dashboard/staking-and-validators).
