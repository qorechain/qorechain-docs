---
slug: /qorex/portfolio-and-staking
title: Portefeuille et Staking
sidebar_label: Portefeuille et Staking
sidebar_position: 4
---

# Portefeuille et Staking

## Portefeuille

La vue **Portfolio** (protégée par la biométrie la première fois que vous l'ouvrez à chaque session) affiche un **anneau de répartition** — vos QOR unifiés à travers leurs trois voies (Native, EVM, SVM) — avec une légende sous l'anneau, plus une ligne pour chaque actif. Les pourcentages apparaissent une fois que le flux de prix est actif, et chaque solde affiche sa valeur estimée en USD à côté du montant en QOR.

**D'où vient le prix.** QoreX le lit depuis `GET https://api.qore.network/v1/price/{symbol}` — un endpoint public qui nous appartient, et non un appel direct à un quelconque échange. Rien sur votre appareil ne communique avec une source de prix extérieure à l'infrastructure de QoreChain, si bien que votre adresse IP n'est jamais exposée à une telle source. Si un prix fiable n'est réellement pas disponible, l'endpoint répond par une erreur plutôt que de deviner — QoreX affiche le prix comme indisponible plutôt que de jamais présenter un zéro fabriqué ou un chiffre obsolète comme s'il était actuel.

Touchez n'importe quel actif pour ouvrir le **Détail de l'actif**, qui affiche :

- **Historique du solde** — une véritable tendance construite à partir de vos transferts on-chain.
- **Activité récente** — des lignes de transactions avec recherche inversée de **@handle**, afin que les contreparties s'affichent par nom lorsque c'est possible. Touchez n'importe quelle ligne pour ouvrir son détail complet : montant, contrepartie, bloc, hash de transaction et signature.

## Staking et Earn

Le staking de QOR contribue à sécuriser QoreChain et vous rapporte des récompenses. Toutes les opérations de staking sont de véritables transactions on-chain portant votre signature post-quantique.

### Staker avec un validateur

1. Ouvrez **Stake**.
2. Choisissez un validateur dans la liste (chargée en direct depuis la chaîne, la plus petite mise affichée en premier, tout validateur actuellement emprisonné (jailed) étant exclu — lui déléguer n'est jamais ce que vous voulez).
3. Saisissez un montant et **déléguez** avec confirmation biométrique.
4. Réclamez vos récompenses depuis le même écran dès qu'elles s'accumulent.

:::note Aucune période de blocage aujourd'hui — l'attente ne concerne que la sortie
Il n'y a pas de durée fixe à choisir, car il n'y en a aucune pour l'instant : la délégation reste active, avec des récompenses qui affluent dès le bloc suivant, jusqu'à ce que vous demandiez à annuler la délégation — il n'y a pas d'échéance à renouveler ni de durée minimale de staking. La seule période d'attente concerne la sortie : une fois la délégation annulée, ces QOR entrent dans une période de déblocage (unbonding) de 21 jours, sans rien rapporter et immobilisés, avant de revenir dans votre solde disponible. Déplacer une délégation vers un autre validateur (redelegate) permet en revanche d'éviter entièrement cette attente. Cela décrit le comportement actuel de la chaîne, pas une garantie permanente — voir [Y a-t-il une période de blocage ?](/user-guide/staking-and-delegation#lock-in-period) pour en savoir plus.
:::

### Déplacer sa mise entre validateurs (redelegate) {#move-stake}

Déplacez le QOR que vous avez déjà mis en staking vers un autre validateur — ou répartissez-le entre plusieurs — sans toucher du tout à la file d'attente de déblocage de 21 jours. La mise continue de rapporter des récompenses pendant tout le trajet.

1. Ouvrez **Stake**, et touchez le validateur avec lequel votre QOR est actuellement.
2. Choisissez où il doit aller — sélectionnez une seule destination, ou plusieurs à la fois. Répartir sur plusieurs validateurs divise le montant à parts égales, et le chiffre exact revenant à chacun est affiché avant confirmation.
3. Confirmez avec l'approbation biométrique. Chaque destination est déplacée en une **seule transaction** — des frais uniques, et soit l'intégralité du mouvement aboutit, soit rien n'aboutit.

C'est le mouvement à effectuer lorsqu'un validateur auquel vous déléguez est emprisonné (jailed) ou augmente sa commission — avant l'existence de cette fonctionnalité, la seule issue était de retirer sa mise (unstake) et d'attendre 21 jours sans rien gagner ; déplacer sa mise à la place ne coûte ni attente ni récompenses perdues.

:::caution Une limite par paire existe, et les frais sont dépensés même si vous l'atteignez
La chaîne autorise au maximum **7 redélégations en cours simultanément pour une même paire de validateurs (source, destination)** — un usage normal n'en approchera pas, mais QoreX vérifie cette limite avant que vous ne signiez et vous avertit si vous l'avez atteinte. Au-delà de cette limite, la transaction échoue on-chain et les frais réseau sont tout de même dépensés — ne retentez donc pas un mouvement déjà refusé pour cette raison sans attendre qu'un mouvement existant se libère d'abord.
:::

### Annuler une délégation (undelegate)

1. Ouvrez **Stake**, touchez le validateur, et choisissez d'annuler la délégation plutôt que de déplacer votre mise.
2. Saisissez le montant — l'écran affiche la **période de déblocage de 21 jours** et la **commission exacte** que vous paierez, les deux avant confirmation.
3. Confirmez avec l'approbation biométrique. Le QOR cesse immédiatement de rapporter des récompenses et redevient disponible une fois la période de déblocage terminée.

### Earn

La vue **Earn** récapitule vos positions actives et votre rendement au même endroit.

## Étapes suivantes

- [Envoyer et Recevoir](/qorex/send-and-receive) — déplacez des QOR et des actifs externes.
- [Sécurité et Récupération](/qorex/security-and-recovery) — gardiens, héritage Legacy et association d'appareils.
