---
slug: /dashboard/validators
title: Validators
sidebar_label: Validators
sidebar_position: 12
---

# Validators

La page **Validators** liste les validateurs du réseau que vous avez sélectionné, avec des cartes récapitulatives, une zone de recherche et, pour chaque validateur, son rang, son pouvoir de vote, sa commission, son statut et un chiffre de rendement variable lu sur la chaîne. C'est un outil de comparaison en lecture seule pour les personnes qui décident où déléguer. Il n'y a pas de bouton de délégation : le staking se fait sur la page Portefeuille, voir [Staking et validateurs](/dashboard/staking-and-validators).

## Innovations {#innovations}

- **La liste suit le réseau sélectionné.** La page demande l'ensemble de validateurs du réseau choisi dans l'en-tête : les visiteurs du mainnet voient les validateurs du mainnet et ceux du testnet voient ceux du testnet.
- **Un rendement lu sur la chaîne, avec ses limites affichées.** La colonne APY est le taux de base du palier de staking de la chaîne multiplié par (1 moins la commission du validateur). Elle est affichée avec un astérisque et la mention « variable, not guaranteed, lock bonuses not included ». Le chiffre est une lecture en direct d'un taux de protocole variable, ni une promesse ni une prévision.
- **« From fees » au-delà du plafond d'émission.** Un réseau qui a dépassé son plafond d'émission affiche **From fees** au lieu d'un pourcentage, car aucun nouveau QOR n'est frappé et le staking ne rapporte alors qu'à partir des frais de transaction. Sur le testnet, la colonne affiche actuellement **From fees**. Une valeur inconnue affiche un tiret, jamais 0.00%.
- **Rang selon le pouvoir de vote.** Le rang est calculé à partir du pouvoir de vote : le rang 1 est donc le validateur ayant le plus de stake.
- **Des chiffres réels, des lacunes assumées.** La commission est la commission réelle du validateur, et un validateur emprisonné (jailed) est affiché comme **Jailed**. La région, les blocs proposés, la version du logiciel et la dernière activité ne sont affichés que lorsque le réseau les communique, ce qui n'est pas le cas aujourd'hui ; une disponibilité inconnue affiche **N/A** plutôt que 0 %.

## Comment l'utiliser {#how-to-use}

1. Connectez-vous et ouvrez la page par son adresse, `dashboard.qorechain.io/validators`. Il n'y a pas de lien dans la barre latérale.
2. Choisissez le réseau dans l'en-tête (**Mainnet** ou **Testnet**) ; la page se recharge avec les validateurs de ce réseau.
3. Lisez les cartes récapitulatives : **Active Validators**, **Total Bonded**, **Avg Commission** et **Avg Uptime**.
4. Recherchez avec la zone « Search by moniker or address ».
5. Lisez chaque ligne : le rang et le moniker avec l'adresse (et un bouton de copie), **Voting power** (stake et part du total), **Commission**, **APY** et **Status** (active, jailed ou inactive), puis la disponibilité et les éventuels détails facultatifs.
6. Pour déléguer, allez à l'onglet **Stake / Delegate** de la page Portefeuille ([Déléguer](/dashboard/staking-and-validators#delegate)). Pour examiner un validateur plus en détail, ouvrez sa page d'adresse dans l'[Explorer](/dashboard/explorer#validators).

:::caution Lisez la note sur l'APY
Le pourcentage dépend d'un taux de protocole susceptible de changer et de la commission du validateur. Les bonus de verrouillage du module de staking à durée verrouillée facultatif ne sont pas inclus. Ne le considérez pas comme un revenu garanti.
:::

## Comment y accéder {#how-to-access}

- **URL :** [dashboard.qorechain.io/validators](https://dashboard.qorechain.io/validators). Elle n'est accessible que par son adresse ; la barre latérale ne la liste pas.
- **Connexion :** obligatoire. Déconnecté, la page affiche « Authentication Required ».
- **Réseau :** suit le sélecteur de l'en-tête.
- **Portefeuille :** aucun n'est nécessaire pour lire la page.
- **Coût :** gratuit.

## Où il est publié {#where-published}

| Surface | Adresse | Réseaux | Connexion |
| --- | --- | --- | --- |
| Page Validators | `dashboard.qorechain.io/validators` | Mainnet et testnet, sélecteur de l'en-tête | Obligatoire |
| Tableau des validateurs de l'Explorer | `dashboard.qorechain.io/explorer/validators` | Mainnet et testnet | Non requise |
| Données de la chaîne | `GET /cosmos/staking/v1beta1/validators` sur `api.qore.host` et `api-testnet.qore.host` | Mainnet et testnet | Aucune |

## Limites et problèmes connus {#limits}

- **La page est en lecture seule** et n'est pas liée depuis la barre latérale.
- **L'APY est variable et non garanti.** Il exclut les bonus de verrouillage, et affiche **From fees** lorsque le plafond d'émission est atteint.
- **Moins de champs de données qu'un tableau de bord de nœud :** la région, les blocs proposés, la version du logiciel et la dernière activité ne sont affichés que lorsqu'ils sont disponibles, et la disponibilité peut afficher N/A.
- **Les validateurs jailed** s'affichent comme jailed et ne sont pas proposés dans le panneau Delegate.
- **Les données sont mises en cache brièvement** (environ 30 secondes), si bien qu'un changement sur la chaîne peut mettre un instant à apparaître.
