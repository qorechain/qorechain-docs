---
slug: /qorex/portfolio-and-staking
title: Portefeuille et Staking
sidebar_label: Portefeuille et Staking
sidebar_position: 4
---

# Portefeuille et Staking

## Portefeuille

La vue **Portfolio** (protégée par la biométrie la première fois que vous l'ouvrez à chaque session) affiche un **anneau de répartition** — vos QOR unifiés à travers leurs trois voies (Native, EVM, SVM) — avec une légende sous l'anneau, plus une ligne pour chaque actif. Les pourcentages apparaissent une fois que le flux de prix est actif, et chaque solde affiche sa valeur estimée en USD à côté du montant en QOR. Sur le **testnet**, les QOR sont affichés **sans valeur en USD** — les tokens de test n'en ont aucune.

Utilisez **+ Coin or token** pour ajouter des coins et des tokens avant d'en détenir, et **Receive** pour obtenir leurs adresses — voir [Coins et tokens](/qorex/send-and-receive#coins-and-tokens).

**D'où vient le prix.** QoreX le lit depuis `GET https://api.qore.network/v1/price/{symbol}` — un endpoint public qui nous appartient, et non un appel direct à un quelconque échange. Rien sur votre appareil ne communique avec une source de prix extérieure à l'infrastructure de QoreChain, si bien que votre adresse IP n'est jamais exposée à une telle source. Si un prix fiable n'est réellement pas disponible, l'endpoint répond par une erreur plutôt que de deviner — QoreX affiche le prix comme indisponible plutôt que de jamais présenter un zéro fabriqué ou un chiffre obsolète comme s'il était actuel.

Touchez n'importe quel actif pour ouvrir le **Détail de l'actif**, qui affiche :

- **Historique du solde** — une véritable tendance construite à partir de vos transferts on-chain.
- **Activité récente** — des lignes de transactions avec recherche inversée de **@handle**, afin que les contreparties s'affichent par nom lorsque c'est possible. Touchez n'importe quelle ligne pour ouvrir son détail complet : montant, contrepartie, bloc, hash de transaction et signature.

## Staking et Earn

Le staking de QOR contribue à sécuriser QoreChain et vous rapporte des récompenses, qui ne sont pas garanties. Toutes les opérations de staking sont de véritables transactions on-chain portant votre signature post-quantique.

### Staker avec un validateur

1. Ouvrez **Stake**.
2. Choisissez un validateur dans la liste (chargée en direct depuis la chaîne, la plus petite mise affichée en premier, tout validateur actuellement emprisonné (jailed) étant exclu — lui déléguer n'est jamais ce que vous voulez). Les validateurs auprès desquels vous avez déjà des QOR portent un badge *staked*.
3. Saisissez un montant. Pendant la saisie, QoreX vous avertit si ce qui resterait ne couvrirait pas les prochains frais de réseau : *« Il ne restera que \{remaining\} QOR — moins que les \{fee\} QOR que coûte une transaction. Vous ne pourriez pas retirer votre mise (unstake) ni réclamer de récompenses tant que ce compte ne détiendra pas de nouveau des QOR pour les frais. »* C'est un avertissement, pas un blocage — c'est votre argent — mais le retrait de mise (unstake) et la réclamation coûtent tous deux des frais prélevés sur votre solde **liquide** ; staker jusqu'à presque plus rien verrouille donc la mise tant que quelqu'un n'envoie pas de QOR.
4. **Confirmez** (biométrie sur mobile). Vous pouvez staker des QOR en vesting, jusqu'à votre total, mais les frais de réseau doivent provenir de vos QOR **déverrouillés** — les QOR en vesting ne peuvent pas payer de frais.
5. Réclamez vos récompenses depuis le même écran dès qu'elles s'accumulent — voir ci-dessous.

:::note Aucune période de blocage aujourd'hui — l'attente ne concerne que la sortie
Il n'y a pas de durée fixe à choisir, car il n'y en a aucune pour l'instant : la délégation reste active, avec des récompenses qui affluent dès le bloc suivant, jusqu'à ce que vous demandiez à annuler la délégation — il n'y a pas d'échéance à renouveler ni de durée minimale de staking. La seule période d'attente concerne la sortie : une fois la délégation annulée, ces QOR entrent dans une période de déblocage (unbonding) de 21 jours, sans rien rapporter et immobilisés, avant de revenir dans votre solde disponible. Déplacer une délégation vers un autre validateur (redelegate) permet en revanche d'éviter entièrement cette attente. Cela décrit le comportement actuel de la chaîne, pas une garantie permanente — voir [Y a-t-il une période de blocage ?](/user-guide/staking-and-delegation#lock-in-period) pour en savoir plus.
:::

### Déplacer sa mise entre validateurs (redelegate) {#move-stake}

Déplacez le QOR que vous avez déjà mis en staking vers un autre validateur — ou répartissez-le entre plusieurs — sans toucher du tout à la file d'attente de déblocage de 21 jours. La mise continue de rapporter des récompenses pendant tout le trajet.

1. Ouvrez **Stake**, et touchez le validateur avec lequel votre QOR est actuellement ; le panneau propose **Move stake**.
2. Choisissez où il doit aller — sélectionnez une seule destination, ou plusieurs à la fois. Répartir sur plusieurs validateurs divise le montant à parts égales, et le chiffre exact revenant à chacun est affiché avant confirmation.
3. Confirmez avec l'approbation biométrique. Chaque destination est déplacée en une **seule transaction** — des frais uniques, et soit l'intégralité du mouvement aboutit, soit rien n'aboutit.

C'est le mouvement à effectuer lorsqu'un validateur auquel vous déléguez est emprisonné (jailed) ou augmente sa commission — avant l'existence de cette fonctionnalité, la seule issue était de retirer sa mise (unstake) et d'attendre 21 jours sans rien gagner ; déplacer sa mise à la place ne coûte ni attente ni récompenses perdues.

:::caution Une limite par paire existe, et les frais sont dépensés même si vous l'atteignez
La chaîne autorise au maximum **7 redélégations en cours simultanément pour une même paire de validateurs (source, destination)** — un usage normal n'en approchera pas, mais QoreX vérifie cette limite avant que vous ne signiez et vous avertit si vous l'avez atteinte. Au-delà de cette limite, la transaction échoue on-chain et les frais réseau sont tout de même dépensés — ne retentez donc pas un mouvement déjà refusé pour cette raison sans attendre qu'un mouvement existant se libère d'abord.

Une autre règle de la chaîne : une mise que vous venez de déplacer **vers** un validateur ne peut pas être déplacée **plus loin** depuis ce validateur tant que le mouvement qui l'y a amenée n'est pas terminé (21 jours) — QoreX vous indique lorsqu'un mouvement est refusé pour cette raison. Vous pouvez toujours la retirer (unstake), ou déplacer une mise qui se trouvait déjà auprès de ce validateur.
:::

### Claim et Claim & restake {#claim}

- **Claim** collecte vos récompenses dans votre solde. QoreX ne réclame qu'auprès des validateurs qui ont réellement des récompenses en attente.
- **Claim & restake** (bouton *Claim & restake* : « Réinvestir \{amount\} QOR vers les mêmes validateurs, en une seule transaction. ») réclame les récompenses et les redélègue directement aux validateurs qui les ont générées — une transaction, des frais uniques. Cette option n'est proposée que lorsque QoreX peut lire le détail par validateur.
- **Vérification des frais.** Les frais sont payés *avant* l'arrivée des récompenses. Si vos QOR déverrouillés ne peuvent pas les couvrir, QoreX s'arrête avant que vous ne signiez et indique le montant nécessaire (« Réclamer nécessite environ \{fee\} QOR déverrouillés pour les frais de réseau — ils sont payés avant l'arrivée des récompenses. ») ; envoyez un peu de QOR à cette adresse et réessayez. Les QOR en vesting ne peuvent pas payer de frais.

### Annuler une délégation (undelegate)

1. Ouvrez **Stake** et touchez le validateur. Si vous avez des QOR auprès de lui, le panneau propose **Unstake** (et **Move stake**).
2. Saisissez le montant. Le panneau affiche le montant dont vous disposez auprès de ce validateur et, au-dessus du bouton **Unstake**, « Le retrait de mise prend 21 jours avant que les QOR ne soient à vous pour les déplacer » — vous voyez l'attente de 21 jours avant de confirmer.
3. Confirmez avec l'approbation biométrique. Le QOR cesse immédiatement de rapporter des récompenses et redevient disponible une fois la période de déblocage terminée.

### Retrait de mise en cours (Unstaking in progress) {#unbonding}

Les QOR retirés (unstaked) quittent à la fois votre délégation et votre solde disponible pendant 21 jours. QoreX les liste sous **Unstaking in progress** — *« \{amount\} QOR en cours de retrait »*, chaque entrée avec le temps restant (*\{days\}j \{hours\}h \{minutes\}min restantes*, ou *Moins d'une minute restante*, ou *L'attente est terminée — cela devrait être de retour dans votre solde.*). Si QoreX ne peut pas lire quand une entrée se termine, il l'indique et conserve le montant dans le total. Si votre nœud est injoignable, la liste reste telle qu'elle était — elle n'est jamais affichée comme « rien en cours de retrait ».

:::note Retirer sa mise lorsque vous exploitez un validateur
Si votre portefeuille est celui d'un opérateur de validateur, le retrait de mise est refusé lorsqu'il ferait passer votre auto-délégation (self-bond) sous les 100 000 QOR requis : *« Retirer une telle somme ferait passer le self-bond de votre validateur sous les 100 000 QOR requis. Ce plancher s'applique tant que le validateur est en activité. »*
:::

### Earn

La vue **Earn** récapitule votre staking au même endroit : vos QOR stakés, vos récompenses réclamables, le nombre de validateurs auprès desquels vous êtes, et la part de tous les QOR qui est stakée à l'échelle du réseau. Elle n'affiche aucun taux de staking — la chaîne ne publie pas de chiffre d'émission dont un taux pourrait être dérivé ; QoreX affiche donc *Not available* plutôt qu'un nombre qu'il ne peut pas justifier.

Dans l'extension, l'écran Stake comporte les mêmes éléments (total staké, récompenses, **Claim**, **Claim & restake**, **Unstake**, **Move stake**, un sélecteur de compte lorsque vous avez plusieurs comptes, et l'avertissement de retrait de mise).

## Étapes suivantes

- [Envoyer et Recevoir](/qorex/send-and-receive) — déplacez des QOR et des actifs externes.
- [Sécurité et Récupération](/qorex/security-and-recovery) — gardiens, héritage Legacy et association d'appareils.
