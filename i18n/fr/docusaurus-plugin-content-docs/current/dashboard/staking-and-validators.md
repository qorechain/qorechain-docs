---
slug: /dashboard/staking-and-validators
title: Staking et validateurs
sidebar_label: Staking et validateurs
sidebar_position: 8
---

# Staking et validateurs

La page **Validateurs** (`/validators`) vous permet de consulter les validateurs du réseau — c'est un espace de consultation en lecture seule, sans connexion de portefeuille ni bouton de délégation. Les actions de staking à proprement parler (déléguer, annuler une délégation, réclamer) se trouvent en revanche sur la page **Portefeuille**, sous ses onglets **Stake / Delegate** et **Rewards**, une fois votre portefeuille QoreX connecté. La délégation contribue à sécuriser le réseau et génère des récompenses de staking. Pour les concepts qui sous-tendent la délégation et les récompenses, voir [Staking et délégation](/user-guide/staking-and-delegation).

Le staking QoreChain est signé de façon post-quantique, si bien que le dashboard ne détient jamais de clé capable de signer une délégation. Chacune des actions de staking décrites ci-dessous fonctionne de la même manière : vous composez la demande sur le dashboard (quel validateur, quel montant), puis vous l'approuvez et la signez **dans votre portefeuille QoreX connecté** — l'application ou l'extension de navigateur (voir [quelle version est disponible où](/qorex/overview#platform-availability)) — exactement comme pour le [flux d'envoi](/dashboard/wallet#mainnet). Le dashboard ne transmet que les paramètres via un lien `qorex://tx?...` ; c'est QoreX qui reconstruit, signe et diffuse (broadcast) la transaction proprement dite. Connectez d'abord votre portefeuille — voir [Utiliser le Portefeuille sur le mainnet](/dashboard/wallet#mainnet).

Le staking, la délégation et la validation s'effectuent exclusivement sur le rail natif (Cosmos), avec la signature hybride post-quantique — jamais via un précompilé EVM. Il s'agit d'une propriété de sécurité permanente, et non d'une lacune temporaire : le rail EVM ne fait tourner qu'un seul décorateur ante (ante decorator), de sorte que les contrôles de licence de validateur, de self-bond minimum et de PQC qui existent dans l'ante du rail natif seraient tous contournés si le staking y était exposé. Une adresse liée à MetaMask peut recevoir des QOR et, avec une fenêtre EVM ouverte, en envoyer (voir [Envoyer avec MetaMask](/dashboard/wallet#send-metamask)), mais elle ne peut pas staker — seule une adresse connectée via QoreX le peut.

## Examiner les validateurs

:::caution Sur le mainnet, cette page affiche actuellement les validateurs du testnet
La page **Validateurs** (`/validators`) affiche l'ensemble des validateurs du **testnet** alors que le Dashboard est sur le mainnet — un problème côté données du backend, et non un souci de votre connexion ou de votre compte. Les chiffres des cartes récapitulatives (validateurs actifs, QOR liés, hauteur de bloc) sont eux aussi ceux du testnet. N'utilisez pas cette page pour déterminer qui sont les validateurs du mainnet ; utilisez plutôt l'[explorateur de blocs](https://explore.qore.network) ou une requête directe sur la chaîne (`qorechaind query staking validators`). Il s'agit toutefois d'une simple divergence informative : le sélecteur de validateur du panneau **Delegate**, sur l'[onglet Stake de la page Portefeuille](/dashboard/wallet#mainnet), lit une route différente et correcte, directement depuis la chaîne — vous ne pouvez donc pas réellement choisir ou déléguer à un validateur qui n'existe pas sur le mainnet : vous y verrez simplement une liste différente (et correcte) une fois arrivé là-bas.
:::

La page s'ouvre sur des cartes récapitulatives indiquant le nombre de validateurs actifs, le total de QOR liés (bonded), la commission moyenne et la disponibilité (uptime) moyenne. En dessous se trouve la liste des validateurs. Chaque ligne de validateur affiche :

- Un **rang** et le **moniker** (nom) du validateur, avec son adresse et un bouton de copie.
- Le **pouvoir de vote** (voting power) — le stake lié du validateur et sa part du total.
- La **commission** — le pourcentage que le validateur conserve sur les récompenses.
- L'**APY** — affiché sous forme d'un tiret cadratin (—) : le Dashboard ne publie pas de rendement de staking calculé ; considérez donc tout pourcentage cité ailleurs comme non vérifié.
- Le **statut** — par exemple actif ou jailed.
- Des détails opérationnels : région, disponibilité (uptime), blocs proposés, version du logiciel et dernière activité.

Un champ de recherche filtre la liste par nom ou adresse de validateur.

Cette page sert uniquement à comparer les validateurs. Pour déléguer réellement à l'un d'eux, rendez-vous sur la page **Portefeuille** — voir ci-dessous.

## Choisir un validateur

Lorsque vous choisissez un validateur auquel déléguer, tenez compte des éléments suivants :

- **Commission** — un taux plus bas vous laisse davantage de récompenses, mais des opérateurs pérennes ont besoin d'une part raisonnable.
- **Disponibilité et statut** — privilégiez les validateurs actifs avec une bonne disponibilité (uptime) ; un validateur jailed ne gagne rien. Un validateur est jailed lorsqu'il signe moins de 5 % des blocs sur une fenêtre de 10 000 blocs — autrement dit, lorsqu'il en a manqué plus de 95 %, ce qui correspond à environ 8,5 heures d'indisponibilité sur le mainnet (environ 3,2 secondes par bloc ; les temps de bloc diffèrent sur le testnet) — il ne gagne alors plus rien, ni pour vous ni pour lui-même, tant qu'il n'est pas sorti de cet état (unjail). Une mise en jail pour indisponibilité dure une durée fixe de **600 secondes (10 minutes)** et coûte au validateur **1 % de son stake** ; le double-signing est une infraction distincte, plus grave, qui entraîne un slashing de **5 %**. Ces chiffres sont les paramètres actuels et en vigueur de la chaîne — tout chiffre plus ancien rencontré ailleurs doit être considéré comme obsolète.
- **Pouvoir de vote** (voting power) — répartir votre stake entre plusieurs validateurs favorise la décentralisation. Sur le panneau Delegate, la première place est occupée à tour de rôle par l'un des validateurs de la moitié la plus petite — le plus grand ne peut jamais l'obtenir — et les autres sont classés du plus petit au plus grand, précisément pour cette raison.

## Déléguer, redéléguer, annuler une délégation et réclamer les récompenses

Ces quatre actions se trouvent toutes sur la page **Portefeuille** (`/wallet`), et non sur la page Validateurs. Ouvrez le portefeuille, connectez QoreX si ce n'est pas déjà fait (voir [Utiliser le Portefeuille sur le mainnet](/dashboard/wallet#mainnet)), puis utilisez l'onglet **Stake / Delegate** pour déléguer et annuler une délégation, et l'onglet **Rewards** pour réclamer.

### Déléguer {#delegate}

1. Sur la page **Portefeuille**, sélectionnez l'onglet **Stake / Delegate**.
2. Dans le panneau **Delegate QOR**, vérifiez l'encart d'information en haut — il indique votre total actuellement lié (bonded) par rapport au seuil de stake pour un nœud léger (light node), et si vous atteignez déjà ce seuil. Ce seuil est vérifié par rapport à votre **stake total délégué, tous validateurs confondus**, et non par validateur : un manque peut donc être réparti entre plusieurs délégations — il n'existe aucun moyen de « déléguer à un nœud léger » directement, puisque la délégation vise toujours un validateur et que l'éligibilité au nœud léger est un contrôle distinct portant sur votre total.
3. Ouvrez le menu déroulant **Validator** et choisissez-en un. La première entrée est tirée au hasard parmi la moitié la plus petite des validateurs et peut changer à chaque rechargement ; les autres sont classées du plus petit stake au plus grand. Les validateurs jailed ne sont pas proposés.
4. Saisissez un **Amount (QOR)**.
5. Lisez la remarque sous le champ de montant : la déliaison (unbonding) prend 21 jours, et une fois liés (bonded), les QOR ne peuvent être ni déplacés ni vendus tant que cette période n'est pas écoulée.
6. Si le panneau affiche un avertissement indiquant que cette adresse ne dispose pas d'assez de QOR disponibles (spendable) pour couvrir les frais, envoyez-lui d'abord un peu de QOR disponible — les jetons en vesting ou liés (bonded) ne peuvent pas payer les frais. Le bouton **Continue in QoreX** reste désactivé tant que ce n'est pas résolu.
7. Cliquez sur **Continue in QoreX** (il affiche **Preparing…** pendant la création de la demande).
8. Le panneau affiche alors **Approve it in QoreX** avec un lien **Open QoreX** et un identifiant de demande. QoreX vous montrera le validateur et le montant avant la signature — rien n'est envoyé tant que vous ne l'approuvez pas là-bas. Si l'extension de navigateur QoreX est détectée, un bouton **Approve in the browser extension** est également proposé.
9. Ouvrez QoreX (le lien/deeplink s'en charge) et approuvez la délégation. QoreX construit, signe et diffuse (broadcast) la transaction ; le dashboard ne voit jamais votre clé.

### Redéléguer {#redelegate}

Le dashboard lui-même ne dispose pas d'un panneau Redelegate dédié — mais ce n'est plus nécessaire. **QoreX déplace désormais lui-même le stake directement d'un validateur à un autre** (application 1.0.8+ et extension 0.2.6+) : pas d'attente de déliaison de 21 jours, pas de récompenses perdues, et il peut même répartir un déplacement sur plusieurs validateurs de destination en une seule transaction. Ouvrez **Stake** dans QoreX, appuyez sur le validateur que vous souhaitez quitter, et choisissez la destination du stake — voir [Déplacer un stake entre validateurs](/qorex/portfolio-and-staking#move-stake) pour le déroulé complet. C'est une meilleure solution que tout ce que le contrat de requête propre au dashboard pourrait offrir : utilisez donc directement QoreX pour cela plutôt que le contournement ci-dessous.

Si vous utilisez encore une version de QoreX plus ancienne, sans cette fonctionnalité, déplacez un stake vers un autre validateur en deux étapes, à l'aide des flux de cette page :

1. **[Annulez la délégation](#undelegate)** du montant depuis le validateur que vous souhaitez quitter.
2. Patientez pendant la période de déliaison (unbonding) indiquée dans ce flux — les QOR ne sont ni déplaçables ni rémunérateurs pendant ce temps.
3. Une fois les QOR déliés (unbonded) à nouveau disponibles (spendable), **[déléguez-les](#delegate)** au nouveau validateur.

Ce contournement coûte 21 jours de récompenses perdues et davantage de frais qu'un déplacement direct — mettez donc à jour QoreX plutôt que de vous appuyer dessus si vous le pouvez.

### Annuler une délégation {#undelegate}

Sortir d'une délégation est désormais possible depuis le dashboard — pendant un certain temps, il était possible de déléguer mais pas du tout de délier (unbond) depuis ici ; si vous vous souvenez que cette fonction était absente, c'est la raison.

:::caution Période de déliaison de 21 jours
Les QOR dont la délégation est annulée n'arrivent pas aujourd'hui. Ils passent d'abord par une **période de déliaison de 21 jours**, durant laquelle ils ne génèrent aucune récompense et ne peuvent être ni déplacés ni vendus. Le panneau l'indique deux fois, volontairement — une première fois en sous-titre, une seconde fois juste au-dessus du bouton de confirmation — parce que la personne qui arrive sur cet écran dans la précipitation (un marché en chute, un validateur jailed) est précisément celle qui a le plus besoin de le voir avant de signer.
:::

1. Sur la page **Portefeuille**, sélectionnez l'onglet **Stake / Delegate** et faites défiler jusqu'au panneau **Unbond QOR**, sous Delegate. Son sous-titre reformule déjà l'avertissement des 21 jours de déliaison ci-dessus.
2. Si cette adresse n'a aucune délégation active, le panneau l'indique et s'arrête là.
3. Ouvrez le menu déroulant **Unbond from** et choisissez la délégation à réduire — il ne liste que les validateurs auxquels vous déléguez réellement, chacun avec le montant lié (bonded) affiché.
4. Saisissez un **Amount (QOR)** à délier, ou cliquez sur **Unbond all `<amount>` QOR** pour renseigner automatiquement le montant total lié pour ce validateur.
5. Si vous saisissez un montant supérieur à celui lié à ce validateur, le panneau vous le signale et bloque l'envoi.
6. Juste au-dessus du bouton de confirmation, l'avertissement apparaît une seconde fois : les QOR arrivent dans 21 jours, pas aujourd'hui, et ne rapportent rien jusque-là. Il s'agit d'une répétition volontaire, pas d'une erreur de rédaction — relisez-la avant de continuer.
7. Si l'adresse ne peut pas couvrir les frais (les jetons liés ne peuvent pas les payer — il vous faut d'abord un peu de QOR disponible ici), le panneau vous avertit et désactive le bouton.
8. Cliquez sur **Continue in QoreX** (**Preparing…** pendant la création de la demande).
9. Le panneau affiche **Approve it in QoreX** avec un lien **Open QoreX** et un identifiant de demande — QoreX affiche le validateur et le montant avant que vous signiez. Si l'extension de navigateur QoreX est détectée, un bouton **Approve in the browser extension** est également proposé.
10. Ouvrez QoreX et approuvez. Il signe et diffuse (broadcast) l'annulation de délégation ; les QOR ne redeviennent disponibles qu'à l'issue de la période de déliaison de 21 jours.

### Réclamer les récompenses {#claim}

1. Sur la page **Portefeuille**, sélectionnez l'onglet **Rewards**.
2. Le panneau **Staking rewards** affiche les récompenses accumulées auprès de chaque validateur auquel vous déléguez. Si rien n'est staké depuis cette adresse, il l'indique et il n'y a rien à réclamer.
3. Sinon, il affiche le total en attente de réclamation, ainsi qu'une ligne par validateur avec le montant qui y est accumulé. Les récompenses s'accumulent en continu et ne sont jamais perdues en attendant — il n'y a pas de délai limite.
4. Cliquez sur **Claim in QoreX**. Il s'agit d'une réclamation globale (claim-all) : elle réclame les récompenses accumulées de tous les validateurs affichés, en une seule demande — il n'existe pas de bouton de réclamation par validateur.
5. Approuvez la réclamation dans QoreX (via le lien **Open QoreX**) pour la signer et la diffuser (broadcast). Si l'extension de navigateur QoreX est détectée, un bouton **Approve in the browser extension** est également proposé.

:::note Période de déliaison
Les QOR dont la délégation est annulée passent par une période de déliaison de 21 jours avant de redevenir disponibles ; pendant cette période, ils ne génèrent aucune récompense. Voir [Staking et délégation](/user-guide/staking-and-delegation) pour plus de détails.
:::

## Pages associées

- [Staking et délégation](/user-guide/staking-and-delegation) — concepts complets du staking.
- [Utiliser le Portefeuille sur le mainnet](/dashboard/wallet#mainnet) — connectez QoreX avant de staker.
- [Validateurs de l'Explorer](/dashboard/explorer#validators) — parcourez les validateurs sans portefeuille.
- [Tools Hub](/dashboard/tools-hub) — candidatez pour exploiter votre propre validateur.
