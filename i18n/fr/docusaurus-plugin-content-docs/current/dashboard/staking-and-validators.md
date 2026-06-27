---
slug: /dashboard/staking-and-validators
title: Staking et validateurs
sidebar_label: Staking et validateurs
sidebar_position: 8
---

# Staking et validateurs

La page **Validateurs** vous permet d'examiner les validateurs du réseau et de staker vos QOR en les leur déléguant. La délégation contribue à sécuriser le réseau et génère des récompenses de staking. Pour les concepts qui sous-tendent la délégation et les récompenses, voir [Staking et délégation](/user-guide/staking-and-delegation).

Connectez votre portefeuille pour staker — voir [Présentation et premiers pas](/dashboard/overview#connect-your-wallet).

## Examiner les validateurs

La page s'ouvre sur des cartes récapitulatives indiquant le nombre de validateurs actifs, le total de QOR liés (bonded), la commission moyenne et la disponibilité (uptime) moyenne. En dessous se trouve la liste des validateurs. Chaque validateur affiche :

- Un **rang** et le **moniker** (nom) du validateur, avec son adresse et un bouton de copie.
- Le **pouvoir de vote** (voting power) — le stake lié du validateur et sa part du total.
- La **commission** — le pourcentage que le validateur conserve sur les récompenses.
- L'**APY** — l'estimation du rendement annuel de la délégation.
- Le **statut** — par exemple actif ou jailed (emprisonné).
- Des détails opérationnels tels que la région, la disponibilité, les blocs proposés, la version du logiciel et la dernière activité.

Un champ de recherche filtre la liste par nom ou adresse de validateur.

## Choisir un validateur

Lorsque vous choisissez un validateur auquel déléguer, tenez compte de :

- La **commission** — un taux plus bas vous laisse davantage de récompenses, mais des opérateurs pérennes ont besoin d'une part raisonnable.
- La **disponibilité et le statut** — privilégiez les validateurs actifs avec une bonne disponibilité ; un validateur jailed ne gagne rien.
- Le **pouvoir de vote** — répartir votre stake entre plusieurs validateurs favorise la décentralisation.

## Déléguer, redéléguer et réclamer

Avec un portefeuille connecté, vous pouvez :

- **Déléguer** des QOR à un validateur pour commencer à gagner des récompenses.
- **Redéléguer** votre stake d'un validateur à un autre.
- **Annuler la délégation** (undelegate) pour commencer à retirer votre stake.
- **Réclamer les récompenses** accumulées grâce à vos délégations.

:::note Période de déliaison
Les QOR dont la délégation est annulée passent par une période de déliaison (unbonding) avant de redevenir dépensables ; pendant cette période, ils ne génèrent pas de récompenses. Voir [Staking et délégation](/user-guide/staking-and-delegation) pour plus de détails.
:::

## Liens connexes

- [Staking et délégation](/user-guide/staking-and-delegation) — concepts complets du staking.
- [Validateurs de l'Explorer](/dashboard/explorer#validators) — parcourez les validateurs sans portefeuille.
- [Tools Hub](/dashboard/tools-hub) — candidatez pour exploiter votre propre validateur.
