---
slug: /qorex/portfolio-and-staking
title: Portefeuille et Staking
sidebar_label: Portefeuille et Staking
sidebar_position: 4
---

# Portefeuille et Staking

## Portefeuille

La vue **Portfolio** (protégée par la biométrie la première fois que vous l'ouvrez à chaque session) affiche un **anneau de répartition** — vos QOR unifiés à travers leurs trois voies (Native, EVM, SVM) — avec une légende sous l'anneau, plus une ligne pour chaque actif. Les pourcentages apparaissent une fois que le flux de prix est actif.

Touchez n'importe quel actif pour ouvrir le **Détail de l'actif**, qui affiche :

- **Historique du solde** — une véritable tendance construite à partir de vos transferts on-chain.
- **Activité récente** — des lignes de transactions avec recherche inversée de **@handle**, afin que les contreparties s'affichent par nom lorsque c'est possible.

## Staking et Earn

Le staking de QOR contribue à sécuriser QoreChain et vous rapporte des récompenses. Toutes les opérations de staking sont de véritables transactions on-chain portant votre signature post-quantique.

### Staker avec un validateur

1. Ouvrez **Stake**.
2. Choisissez un validateur dans la liste (chargée en direct depuis la chaîne).
3. Saisissez un montant et **déléguez** avec confirmation biométrique.
4. Réclamez vos récompenses depuis le même écran dès qu'elles s'accumulent.

:::note Aucune période de blocage aujourd'hui — l'attente ne concerne que la sortie
Il n'y a pas de durée fixe à choisir, car il n'y en a aucune pour l'instant : la délégation reste active, avec des récompenses qui affluent dès le bloc suivant, jusqu'à ce que vous demandiez à annuler la délégation — il n'y a pas d'échéance à renouveler ni de durée minimale de staking. La seule période d'attente concerne la sortie : une fois la délégation annulée, ces QOR entrent dans une période de déblocage (unbonding) de 21 jours, sans rien rapporter et immobilisés, avant de revenir dans votre solde disponible. Déplacer une délégation vers un autre validateur (redelegate) permet en revanche d'éviter entièrement cette attente. Cela décrit le comportement actuel de la chaîne, pas une garantie permanente — voir [Y a-t-il une période de blocage ?](/user-guide/staking-and-delegation#lock-in-period) pour en savoir plus.
:::

:::note Cet écran n'a pas encore son propre bouton Annuler la délégation
Cet écran Stake couvre uniquement la délégation et la réclamation des récompenses. Pour annuler une délégation directement depuis un écran QoreX, utilisez plutôt l'[écran Stake de l'extension de navigateur](/qorex/browser-extension#stake) — ou annulez la délégation via le [Dashboard](/dashboard/staking-and-validators#delegate), qui envoie la demande au QoreX que vous avez connecté, y compris l'application, pour que vous l'approuviez.
:::

### Earn

La vue **Earn** récapitule vos positions actives et votre rendement au même endroit.

## Étapes suivantes

- [Envoyer et Recevoir](/qorex/send-and-receive) — déplacez des QOR et des actifs externes.
- [Sécurité et Récupération](/qorex/security-and-recovery) — gardiens, héritage Legacy et association d'appareils.
