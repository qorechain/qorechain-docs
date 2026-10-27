---
slug: /dashboard/staking-and-validators
title: Staking et validateurs
sidebar_label: Staking et validateurs
sidebar_position: 8
---

# Staking et validateurs

Cette page présente le staking depuis le Dashboard : déléguer vos QOR à un validateur, annuler la délégation (unbonding) et réclamer les récompenses. Les actions se trouvent sur la page **Portefeuille** (onglets **Stake / Delegate** et **Rewards**) sur le **mainnet**, avec votre portefeuille QoreX connecté. Pour comparer d'abord les validateurs, utilisez la page en lecture seule [Validateurs](/dashboard/validators). Pour les concepts qui sous-tendent la délégation et les récompenses, voir [Staking et délégation](/user-guide/staking-and-delegation).

## Innovations {#innovations}

- **Le Dashboard ne détient jamais de clé de staking.** Vous composez la demande (quel validateur, quel montant) sur le Dashboard, puis QoreX la reconstruit, l'affiche, la signe avec la signature hybride ML-DSA-87 et la diffuse (broadcast). Le Dashboard ne transmet que les paramètres via un lien `qorex://tx?...` et ne connaît que le hash de la transaction. Le flux est le même que le [flux d'envoi](/dashboard/wallet#send-mainnet).
- **Voie native uniquement, de façon permanente.** Le staking, la délégation et les opérations de validateur ont lieu uniquement sur la voie native (Cosmos) avec la signature hybride post-quantique, jamais via un précompilé EVM. Une adresse liée à MetaMask peut recevoir et, avec une fenêtre EVM ouverte, envoyer des QOR, mais elle ne peut pas staker. Seule une adresse connectée via QoreX le peut.
- **L'ordre des validateurs répartit le stake.** Seuls les validateurs bondés et non jailed sont listés, du plus petit au plus grand. La première place est tirée au hasard côté serveur parmi la moitié la plus petite, de sorte que le plus grand validateur n'est jamais celui proposé par défaut.
- **Le seuil du nœud léger est un total unique.** « Currently bonded » est affiché par rapport au seuil de stake du nœud léger, compté sur l'ensemble de vos validateurs, de sorte qu'un manque peut être réparti entre validateurs.
- **La durée de déliaison est affichée là où elle compte.** La période de déliaison (unbonding) de 21 jours est lue sur la chaîne et affichée une fois sur Delegate et deux fois sur Unbond, volontairement, car c'est là que les gens en ont besoin.
- **Contrôle des frais avant de signer.** Le panneau lit vos QOR disponibles (les coins en vesting et bondés sont exclus) et garde **Continue in QoreX** désactivé tant que les frais ne peuvent pas être payés.

## Comment l'utiliser {#how-to-use}

Prérequis : être connecté, l'en-tête sur **Mainnet**, la [confirmation](/dashboard/overview#risk-acknowledgement) acceptée et un portefeuille QoreX connecté comme décrit dans [Utiliser le Portefeuille sur le mainnet](/dashboard/wallet#mainnet).

### Choisir un validateur

Ouvrez [Validateurs](/dashboard/validators) pour comparer la commission, le pouvoir de vote et le statut. La page se trouve à `/validators` sur le Dashboard : elle exige que vous soyez connecté, n'a pas de lien dans la barre latérale (saisissez l'adresse ou suivez le lien ici) et suit le réseau sélectionné dans l'en-tête. Sa colonne APY est lue sur la chaîne et porte la mention « variable, not guaranteed, lock bonuses not included » (ou indique « From fees ») ; aucun chiffre n'est promis. Lorsque vous en choisissez un, tenez compte des éléments suivants :

- **Commission :** un taux plus bas vous laisse davantage de récompenses, mais des opérateurs pérennes ont besoin d'une part raisonnable.
- **Statut :** un validateur est jailed lorsqu'il signe moins de 5 % des blocs sur une fenêtre de 10 000 blocs, soit environ 8,3 heures de blocs manqués sur le mainnet à environ 3,1 secondes par bloc. Une mise en jail pour indisponibilité dure une durée fixe de **600 secondes** et coûte au validateur **1 % de son stake** ; le double-signing est une infraction distincte, plus grave, qui entraîne un slashing de **5 %**. Ce sont les paramètres en vigueur de la chaîne (vérifiés le 27 octobre 2026).
- **Pouvoir de vote :** répartir votre stake entre plusieurs validateurs favorise la décentralisation. L'ordre du panneau Delegate y contribue.

### Déléguer {#delegate}

1. Sur **Portefeuille**, ouvrez l'onglet **Stake / Delegate** et repérez le panneau **Delegate QOR**.
2. Lisez l'encart d'information : **Currently bonded** par rapport au **Light-node threshold**, et si vous l'atteignez. Le seuil est vérifié sur votre stake total délégué, tous validateurs confondus. Il n'existe aucun moyen de « déléguer à un nœud léger » directement : la délégation vise toujours un validateur, et l'éligibilité au nœud léger est un contrôle distinct portant sur votre total.
3. Ouvrez le menu déroulant **Validator** et choisissez-en un. La première entrée est tirée au hasard parmi la moitié la plus petite des validateurs et peut changer à chaque rechargement ; les autres sont classées du plus petit stake au plus grand. Les validateurs jailed ne sont pas proposés.
4. Saisissez un **Amount (QOR)**.
5. Lisez la remarque sous le montant : la déliaison (unbonding) prend 21 jours, et les QOR bondés ne peuvent être ni déplacés ni vendus tant que cette période n'est pas écoulée.
6. Si le panneau avertit que l'adresse ne dispose pas d'assez de QOR disponibles pour les frais, envoyez-lui d'abord un peu de QOR disponible. **Continue in QoreX** reste désactivé tant que ce n'est pas résolu.
7. Sélectionnez **Continue in QoreX** (il affiche **Preparing...** pendant la création de la demande).
8. Le panneau affiche « Approve it in QoreX » avec **Open QoreX**, l'identifiant de la demande, et **Approve in the browser extension** lorsque l'extension est détectée. QoreX affiche le validateur et le montant avant la signature ; rien n'est envoyé tant que vous n'approuvez pas.
9. Approuvez dans QoreX. Il construit, signe et diffuse la délégation.

**Exemple minimal :** déléguez 10 QOR au premier validateur de la liste et approuvez dans QoreX.

:::note Le staking à verrouillage temporel ne fait pas partie du Dashboard
La version v3.2.4 ajoute un module facultatif de staking à verrouillage temporel (sur le mainnet depuis le 23 octobre 2026, sur le testnet depuis le 19 octobre 2026) ; voir [Staking à verrouillage temporel](/user-guide/staking-and-delegation#time-locked-staking). Ni le Dashboard ni QoreX n'ont d'écran pour lui. Les délégations effectuées ici sont des délégations ordinaires, sans période de blocage ; la seule attente est la déliaison de 21 jours à la sortie.
:::

### Redéléguer {#redelegate}

Le Dashboard n'a pas de panneau Redelegate. **QoreX déplace directement le stake d'un validateur à un autre** (application 1.0.8+ et extension 0.2.6+) : pas d'attente de déliaison de 21 jours, pas de récompenses perdues, et il peut répartir un déplacement sur plusieurs validateurs de destination en une seule transaction. Ouvrez **Stake** dans QoreX, appuyez sur le validateur que vous souhaitez quitter et choisissez la destination du stake ; voir [Déplacer sa mise entre validateurs](/qorex/portfolio-and-staking#move-stake).

Sur une version plus ancienne de QoreX sans cette fonctionnalité, déplacez le stake en deux étapes : [annulez la délégation](#undelegate), attendez la fin de la période de déliaison (les QOR ne sont ni déplaçables ni rémunérateurs pendant ce temps), puis [déléguez](#delegate) au nouveau validateur. Ce contournement coûte 21 jours de récompenses et davantage de frais ; mettez donc à jour QoreX si vous le pouvez.

### Annuler une délégation {#undelegate}

:::caution Période de déliaison de 21 jours
Les QOR dont la délégation est annulée n'arrivent pas aujourd'hui. Ils passent d'abord par une **période de déliaison de 21 jours**, durant laquelle ils ne génèrent aucune récompense et ne peuvent être ni déplacés ni vendus. Le panneau l'indique deux fois, volontairement, une première fois en sous-titre et une seconde fois juste au-dessus du bouton de confirmation.
:::

1. Sur **Portefeuille**, ouvrez **Stake / Delegate** et faites défiler jusqu'au panneau **Unbond QOR**, sous Delegate.
2. Si cette adresse n'a aucune délégation active, le panneau l'indique et s'arrête là.
3. Ouvrez **Unbond from** et choisissez la délégation à réduire. Il ne liste que les validateurs auxquels vous déléguez, avec le montant bondé.
4. Saisissez un montant, ou sélectionnez **Unbond all X QOR** pour renseigner le montant bondé total.
5. Saisir plus que le montant bondé bloque l'envoi.
6. Lisez le second avertissement au-dessus du bouton de confirmation : les QOR arrivent dans 21 jours, pas aujourd'hui.
7. Si l'adresse ne peut pas couvrir les frais (les coins bondés ne peuvent pas les payer), le panneau avertit et désactive le bouton.
8. Sélectionnez **Continue in QoreX** (**Preparing...** pendant la création de la demande), puis approuvez dans QoreX via **Open QoreX**, ou **Approve in the browser extension**.

Les QOR ne redeviennent disponibles qu'à la fin de la période de déliaison de 21 jours.

### Réclamer les récompenses {#claim}

1. Sur **Portefeuille**, ouvrez l'onglet **Rewards**.
2. Le panneau **Staking rewards** affiche les récompenses accumulées auprès de chaque validateur auquel vous déléguez. Si rien n'est staké depuis cette adresse, il l'indique.
3. Sinon, il affiche le total en attente ainsi qu'une ligne par validateur. Les récompenses s'accumulent en continu et ne sont pas perdues en attendant.
4. Sélectionnez **Claim in QoreX**. Cela réclame auprès de **tous** les validateurs à la fois ; il n'existe pas de réclamation par validateur.
5. Approuvez la réclamation dans QoreX (**Open QoreX**, ou **Approve in the browser extension**).

## Comment y accéder {#how-to-access}

- **Où :** [dashboard.qorechain.io/wallet](https://dashboard.qorechain.io/wallet), onglets **Stake / Delegate** et **Rewards**. La connexion est requise.
- **Réseau :** mainnet uniquement, avec un portefeuille QoreX lié. Les portefeuilles testnet n'ont pas d'écran de staking.
- **Portefeuille :** QoreX (application ou extension). Keplr et MetaMask ne peuvent pas staker depuis le Dashboard.
- **Coûts :** les frais de réseau, payés en QOR disponibles (plancher de 0.1 uqor par gas). Le Dashboard ne facture rien.
- **Fonds :** les soldes en vesting comptent dans ce que vous pouvez déléguer mais ne peuvent pas payer les frais.

## Où c'est publié {#where-published}

| Surface | Adresse | Réseau |
| --- | --- | --- |
| Delegate, Unbond, Rewards | `dashboard.qorechain.io/wallet` | Mainnet |
| Comparer les validateurs | `dashboard.qorechain.io/validators`, voir [Validateurs](/dashboard/validators) | Suit le réseau de l'en-tête |
| Déplacer sa mise entre validateurs | QoreX, voir [Portefeuille et Staking](/qorex/portfolio-and-staking#move-stake) | Mainnet |

## Limites et problèmes connus {#limits}

- **Absents du Dashboard :** la redélégation (utilisez QoreX) et le staking à verrouillage temporel.
- **Pas de staking sur les portefeuilles testnet** dans le Dashboard.
- **Les estimations sont approximatives :** l'estimation des frais et le seuil du nœud léger affichés sur le panneau sont des valeurs intégrées au Dashboard, et non lues sur la chaîne à cet instant. QoreX affiche les frais exacts avant que vous ne signiez.
- **La déliaison dure 21 jours** et ne peut pas être raccourcie.
- **La réclamation est globale (claim-all).**

## Pages associées

- [Validateurs](/dashboard/validators) - comparez les validateurs, la commission et le rendement variable.
- [Staking et délégation](/user-guide/staking-and-delegation) - concepts complets du staking.
- [Utiliser le Portefeuille sur le mainnet](/dashboard/wallet#mainnet) - connectez QoreX avant de staker.
- [Validateurs de l'Explorer](/dashboard/explorer#validators) - parcourez les validateurs sans portefeuille.
- [Nodes & Validators](/dashboard/tools-hub) - candidatez pour exploiter votre propre validateur.
