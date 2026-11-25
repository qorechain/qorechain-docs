---
slug: /qorex/portfolio-and-staking
title: Portefeuille et Staking
sidebar_label: Portefeuille et Staking
sidebar_position: 4
---

# Portefeuille et Staking

Cette page couvre la vue Portefeuille d'actifs et le staking dans QoreX : déléguer des QOR à des validateurs, réclamer des récompenses, déplacer une mise, retirer du staking et le staking verrouillé dans le temps. Elle s'adresse à toute personne qui détient des QOR dans l'application mobile, l'extension de navigateur ou l'extension Safari.

## Innovations {#innovations}

- **Des chiffres lus sur la chaîne.** La période de déliaison et le rendement de base sont lus sur le réseau, ils ne sont pas figés dans le portefeuille.
- **Les déplacements que le réseau refuserait sont interceptés avant.** Déplacer la mise grise ce qui ne peut pas être déplacé et explique pourquoi, avant que des frais ne soient dépensés.
- **Les récompenses peuvent aller vers un autre compte du même portefeuille,** et uniquement là.
- **Aucun zéro inventé.** Quand le réseau ne répond pas, QoreX affiche les dernières valeurs reçues, avec leur heure, ou un tiret.

## Portefeuille

La vue **Portfolio** (protégée par la biométrie la première fois que vous l'ouvrez à chaque session) affiche un **anneau de répartition** - vos QOR unifiés à travers leurs trois voies (Native, EVM, SVM) - avec une légende sous l'anneau, plus une ligne pour chaque actif. Les pourcentages apparaissent une fois que le flux de prix est actif, et chaque solde affiche sa valeur estimée en USD à côté du montant en QOR. Sur le **testnet**, les QOR sont affichés **sans valeur en USD** - les tokens de test n'en ont aucune.

Utilisez **+ Coin or token** pour ajouter des coins et des tokens avant d'en détenir, et **Receive** pour obtenir leurs adresses - voir [Coins et tokens](/qorex/send-and-receive#coins-and-tokens).

**D'où vient le prix.** QoreX le lit depuis `GET https://api.qore.network/v1/price/{symbol}` - un endpoint public qui nous appartient, et non un appel direct à un quelconque échange. Rien sur votre appareil ne communique avec une source de prix extérieure à l'infrastructure de QoreChain, si bien que votre adresse IP n'est jamais exposée à une telle source. Si un prix fiable n'est réellement pas disponible, l'endpoint répond par une erreur plutôt que de deviner - QoreX affiche le prix comme indisponible plutôt que de jamais présenter un zéro fabriqué ou un chiffre obsolète comme s'il était actuel.

Touchez n'importe quel actif pour ouvrir le **Détail de l'actif**, qui affiche :

- **Historique du solde** - une véritable tendance construite à partir de vos transferts on-chain.
- **Activité récente** - des lignes de transactions avec recherche inversée de **@handle**, afin que les contreparties s'affichent par nom lorsque c'est possible. Touchez n'importe quelle ligne pour ouvrir son détail complet : montant, contrepartie, bloc, hash de transaction et signature.

La page **QOR** liste toutes les transactions du compte, entrantes et sortantes, avec **Afficher plus** en bas. Pour tous les types de transaction, les états en attente et échoué et l'export CSV, voir [Historique](/qorex/send-and-receive#history). Sur le testnet, les QOR n'ont aucune valeur en dollars sur l'accueil ni dans le Portefeuille d'actifs.

## Quand le réseau est lent ou ne répond pas {#network-status}

- **Bannière d'état du réseau.** QoreX vérifie l'heure du dernier bloc de la chaîne. S'il date de plus d'une minute, une bannière indique *"The network is slow: the latest block is \{seconds\} seconds old. Transactions may take longer."* (le réseau est lent, les transactions peuvent prendre plus de temps). Si aucun nœud ne répond, elle indique *"Cannot reach the network right now. Balances may be out of date."* (réseau injoignable pour le moment, les soldes ne sont peut-être pas à jour). Il s'agit de l'heure de bloc de la chaîne elle-même, pas d'une page d'état.
- **Dernières valeurs connues.** Quand le réseau ne répond pas (par exemple pendant la réindexation d'un nœud ou après une mise à jour), la carte du compte dans l'extension ainsi que les écrans Accueil et Staking de l'application continuent d'afficher le dernier solde et les dernières délégations que le réseau a donnés pour ce compte, et le précisent : *"The network is not answering. These are the last known values, from \{time\}."* (le réseau ne répond pas ; voici les dernières valeurs connues). Aucune valeur en dollars n'est attribuée à un ancien solde.
- **Les récompenses qui n'ont pas pu être lues** affichent un tiret, et non 0 QOR, et **Réclamer** n'est pas proposé pour elles.

## Staking et Gagner {#staking}

Le staking de QOR contribue à sécuriser QoreChain et vous rapporte des récompenses, qui ne sont pas garanties. Toutes les opérations de staking sont de véritables transactions on-chain sur la voie native à signature hybride : chacune est signée deux fois, avec une clé classique et avec ML-DSA-87 (FIPS 204). Le staking ne passe jamais par un precompile EVM.

### Où se trouve le staking {#staking-screens}

- **Application :** l'écran **Staker** affiche votre total, vos récompenses avec **Réclamer** et, en dessous, les validateurs. Les commandes supplémentaires, comme réclamer et redéléguer, l'adresse des récompenses et les verrous, défilent avec la liste. Le tableau des paliers de staking est replié sur une ligne : touchez-la pour l'ouvrir.
- **Extension et Safari :** **Staking** est un menu, et chaque action ouvre son propre écran avec une ligne d'explication, ses propres messages d'erreur et **Retour au staking** : **Staker des QOR**, **Retirer du staking**, **Déplacer la mise**, **Réclamer**, **Réclamer et redéléguer**, **Verrouiller pour un bonus** et **Les récompenses vont à**. **Réclamer** est toujours listé. Un sélecteur de compte apparaît quand vous avez plusieurs comptes.

### Staker avec un validateur

1. Ouvrez **Stake**.
2. Choisissez un validateur dans la liste (chargée en direct depuis la chaîne, la plus petite mise affichée en premier, tout validateur actuellement emprisonné (jailed) étant exclu - lui déléguer n'est jamais ce que vous voulez). Les validateurs auprès desquels vous avez déjà des QOR portent un badge *staked*.
3. Saisissez un montant. Pendant la saisie, QoreX vous avertit si ce qui resterait ne couvrirait pas les prochains frais de réseau : *« Il ne restera que \{remaining\} QOR - moins que les \{fee\} QOR que coûte une transaction. Vous ne pourriez pas retirer votre mise (unstake) ni réclamer de récompenses tant que ce compte ne détiendra pas de nouveau des QOR pour les frais. »* C'est un avertissement, pas un blocage - c'est votre argent - mais le retrait de mise (unstake) et la réclamation coûtent tous deux des frais prélevés sur votre solde **liquide** ; staker jusqu'à presque plus rien verrouille donc la mise tant que quelqu'un n'envoie pas de QOR.
4. **Confirmez** (biométrie sur mobile). Vous pouvez staker des QOR en vesting, jusqu'à votre total, mais les frais de réseau doivent provenir de vos QOR **déverrouillés** - les QOR en vesting ne peuvent pas payer de frais.
5. Réclamez les récompenses à mesure qu'elles s'accumulent - voir ci-dessous.

Lors de la première transaction d'un compte, les écrans de staking indiquent qu'elle enregistre aussi la clé ML-DSA-87 du compte (des frais de réseau uniques).

:::note Une délégation ordinaire n'a pas de période de blocage ; l'attente ne concerne que la sortie
Une délégation ordinaire n'a pas de durée fixe : elle reste active, avec des récompenses dès le bloc suivant, jusqu'à ce que vous demandiez à la retirer. Il n'y a aucune expiration à renouveler ni de durée minimale de staking. La seule période d'attente se situe à la sortie : une fois la délégation retirée, ces QOR restent en **période de déliaison**, sans rien rapporter et sans pouvoir être déplacés, avant de revenir dans votre solde disponible. QoreX lit la durée de cette période sur le réseau et l'affiche avant que vous confirmiez (21 jours sur QoreChain au moment de la rédaction ; si elle ne peut pas être lue, QoreX dit *the period the network sets*, la période fixée par le réseau). Déplacer plutôt une délégation vers un autre validateur (redélégation) évite entièrement cette attente. Le staking verrouillé dans le temps est facultatif, voir [Verrous de staking](#staking-locks) ci-dessous. Voir aussi [Existe-t-il une période de blocage ?](/user-guide/staking-and-delegation#lock-in-period).
:::


### Verrouillages de staking {#staking-locks}

Les verrous de staking se trouvent dans l'application et les extensions, y compris Safari. Un verrou est facultatif. Il engage une partie de votre mise pour 3, 6 ou 12 mois en échange d'un bonus.

- **Le bonus affiché est celui que le verrouillage rapporte aujourd'hui**, sous le plafond fixé par le réseau. Il peut évoluer avec les conditions du réseau, et il n'est pas garanti.
- **Le barème des paliers est libellé « up to »** (jusqu'à), avec le chiffre d'aujourd'hui affiché à côté.
- **Le déverrouillage anticipé** est protégé par une seconde confirmation qui indique le coût avant que vous ne signiez.
- **Unstake et Move stake sont limités à la partie déverrouillée** de votre mise.

Pour le fonctionnement du module on-chain, voir [Staking à verrouillage temporel](/user-guide/staking-and-delegation#time-locked-staking).

### Déplacer sa mise entre validateurs (redelegate) {#move-stake}

Déplacez des QOR déjà stakés vers un autre validateur - ou répartissez-les entre plusieurs - sans jamais passer par la file de déliaison. La mise continue de générer des récompenses pendant tout le trajet.

**L'extension et Safari** (Staking → **Déplacer la mise**) vous guident en trois étapes :

1. **Déplacer depuis.** Choisissez le validateur que votre mise quitte. Chacun affiche *Staked \{held\} QOR · can move \{free\} QOR* (montant staké et montant déplaçable, ainsi que tout montant verrouillé). Un validateur dont vous ne pouvez pas encore sortir est grisé avec la date : *"Can move from here again after \{date\}: stake you moved here must arrive first."* (vous pourrez de nouveau déplacer depuis ce validateur après cette date, la mise déplacée ici doit d'abord arriver).
2. **Déplacer vers.** Choisissez une ou plusieurs destinations. Une paire qui a déjà atteint le nombre maximal de déplacements en cours est désactivée (*"\{n\} moves in progress, the chain allows \{max\}"*).
3. **Combien.** Saisissez le montant ou touchez **Max** (le montant libre, non verrouillé, à la source). Le trajet (*From ... to ...*) et, pour plusieurs destinations, la répartition (*\{amount\} QOR to each of \{n\} validators*) sont affichés avant le bouton. Toute erreur et la réponse du réseau apparaissent à côté du bouton.

**Application :** ouvrez **Staker**, touchez le validateur auprès duquel se trouvent vos QOR et choisissez **Déplacer la mise**. Les mêmes contrôles s'exécutent sur le validateur que vous ouvrez. Choisissez une ou plusieurs destinations, saisissez le montant (il a son propre champ et **Max**), vérifiez la répartition et confirmez par biométrie.

La répartition entre plusieurs destinations divise le montant à parts égales, et toutes les destinations sont servies en **une seule transaction** - des frais uniques, et soit tout le déplacement aboutit, soit rien.

C'est le déplacement à effectuer quand un validateur auquel vous déléguez est emprisonné (jailed) ou augmente sa commission : déplacer ne coûte ni attente ni récompenses perdues.

:::caution Règles de la chaîne pouvant refuser un déplacement
- **7 déplacements en cours par paire.** La chaîne autorise au plus 7 redélégations en cours à la fois pour la même paire de validateurs (source, destination).
- **Une mise déplacée ne peut pas repartir immédiatement.** La mise que vous venez de déplacer **vers** un validateur ne peut pas être déplacée **plus loin** depuis ce validateur tant que le déplacement qui l'y a amenée n'est pas terminé (la période de déliaison du réseau). Vous pouvez toujours la retirer du staking, ou déplacer la mise qui était déjà auprès de ce validateur.

QoreX vérifie ces deux règles avant la signature. Si le réseau refuse tout de même un déplacement, QoreX explique pourquoi avec des mots plutôt qu'avec un code ; un déplacement refusé on-chain a tout de même payé les frais de réseau ; ne réessayez donc pas sans attendre.
:::

### Claim et Claim & restake {#claim}

- **Claim** collecte vos récompenses dans votre solde. QoreX ne réclame qu'auprès des validateurs qui ont réellement des récompenses en attente.
- **Une réclamation qui coûte plus qu'elle ne rapporte.** Si les frais de réclamation dépassent vos récompenses, le premier toucher vous avertit et le bouton devient **Réclamer quand même**. Les récompenses continuent de croître si vous attendez.
- **Réclamer et redéléguer** (bouton *Réclamer et redéléguer* : « Compound \{amount\} QOR back to the same validators, in one transaction. », réinvestir ce montant auprès des mêmes validateurs en une seule transaction) réclame les récompenses et les redélègue directement aux validateurs qui les ont générées - une transaction, des frais uniques. Ce n'est proposé que lorsque QoreX peut lire la répartition par validateur. Une transaction peut couvrir **au plus 127 validateurs** ; au-delà, QoreX le dit et ne signe rien.
- **Vérification des frais.** Les frais sont payés *avant* l'arrivée des récompenses. Si vos QOR déverrouillés ne peuvent pas les couvrir, QoreX s'arrête avant que vous ne signiez et indique le montant nécessaire (« Réclamer nécessite environ \{fee\} QOR déverrouillés pour les frais de réseau - ils sont payés avant l'arrivée des récompenses. ») ; envoyez un peu de QOR à cette adresse et réessayez. Les QOR en vesting ne peuvent pas payer de frais.

### Choisir la destination des récompenses {#rewards-address}

Par défaut, les récompenses vont au compte qui les a gagnées. Vous pouvez envoyer les **futures** récompenses vers **un autre compte du même portefeuille**, et uniquement là.

1. Application : dans **Staker**, ouvrez **Les récompenses vont à**. Extension et Safari : **Staking → Les récompenses vont à**. Vous voyez où vont les récompenses actuellement.
2. Choisissez **Changer la destination des récompenses** et sélectionnez l'un de vos comptes.
3. Le premier toucher nomme le compte en entier (*"Future rewards go to \{name\}. Tap again to sign."*, les futures récompenses iront à ce compte, touchez à nouveau pour signer) ; le second signe (signature hybride, frais de réseau normaux ; biométrie dans l'application).

Votre mise ne bouge pas. QoreX détermine vos propres adresses à partir de votre phrase de récupération ; il ne peut donc pas être dirigé vers une adresse extérieure au portefeuille, et les sites web ne peuvent pas demander ce changement. Si les récompenses vont déjà vers une adresse extérieure à votre portefeuille, QoreX le signale et propose de les envoyer plutôt vers l'un de vos comptes.

### Prix du gaz et taille des transactions {#gas}

QoreX lit le prix minimal actuel du gaz sur le réseau. Si le réseau le relève, QoreX paie au-dessus du nouveau minimum ; les prix intégrés au portefeuille restent le plancher. Les frais affichés dans une vérification sont ceux qui sont signés. QoreChain accepte au plus **50,000,000 de gaz** par transaction : une transaction plus grosse est refusée avant toute signature et aucuns frais ne sont prélevés ; divisez-la donc en parties plus petites (par exemple, réclamez auprès de moins de validateurs à la fois).

### Annuler une délégation (undelegate)

1. Ouvrez **Stake** et touchez le validateur. Si vous avez des QOR auprès de lui, le panneau propose **Unstake** (et **Move stake**).
2. Saisissez le montant. Le panneau affiche ce que vous avez auprès de ce validateur et, au-dessus du bouton **Retirer du staking**, la durée du retrait (*"Unstaking takes \{days\} before the QOR is yours to move."*, délai avant que les QOR soient à votre disposition, avec la période lue sur le réseau) - vous voyez l'attente avant de confirmer.
3. Confirmez avec l'approbation biométrique. Le QOR cesse immédiatement de rapporter des récompenses et redevient disponible une fois la période de déblocage terminée.

### Retrait de mise en cours (Unstaking in progress) {#unbonding}

Les QOR retirés du staking sortent à la fois de votre délégation et de votre solde disponible pendant la période de déliaison du réseau. QoreX les liste sous **Retraits de staking en cours** - *"\{amount\} QOR unstaking"*, chaque entrée avec le temps restant (*\{days\}d \{hours\}h \{minutes\}m left*, ou *Less than a minute left*, ou *The wait is over - this should be back in your balance.*). Si QoreX ne peut pas lire quand une entrée se termine, il le dit et conserve le montant dans le total. Si votre nœud est injoignable, la liste reste telle quelle - elle n'indique jamais qu'aucun retrait n'est en cours.

:::note Retirer sa mise lorsque vous exploitez un validateur
Si votre portefeuille est celui d'un opérateur de validateur, le retrait de mise est refusé lorsqu'il ferait passer votre auto-délégation (self-bond) sous les 100 000 QOR requis : *« Retirer une telle somme ferait passer le self-bond de votre validateur sous les 100 000 QOR requis. Ce plancher s'applique tant que le validateur est en activité. »*
:::

### Earn

La vue **Gagner** résume votre staking en un seul endroit : vos QOR stakés, vos récompenses réclamables, le nombre de validateurs auprès desquels vous êtes, et la part de tous les QOR qui est stakée à l'échelle du réseau.

**Rendement.** Le taux annuel de base provient **du chiffre de la chaîne elle-même**. Il est affiché *avant la commission du validateur*, et il est **variable et non garanti**. Si la chaîne indique que les récompenses proviennent désormais uniquement des frais, QoreX indique *rewards from fees* (récompenses issues des frais) au lieu d'un pourcentage. Si le chiffre ne peut pas être lu, QoreX affiche *Not available* (non disponible) plutôt qu'un nombre qu'il ne peut pas étayer. Le bonus d'un verrou temporel est un chiffre distinct, voir [Verrous de staking](#staking-locks).

L'extension et Safari placent les éléments du staking sur des écrans séparés, voir [Où se trouve le staking](#staking-screens).

## Étapes suivantes

- [Envoyer et Recevoir](/qorex/send-and-receive) - déplacez des QOR et des actifs externes.
- [Sécurité et Récupération](/qorex/security-and-recovery) - gardiens, héritage Legacy et association d'appareils.

## Limites et problèmes connus {#limits}

- Les récompenses ne sont pas garanties, et le rendement affiché est variable et avant commission.
- Les QOR retirés du staking ne reviennent qu'après la période de déliaison du réseau (21 jours au moment de la rédaction) ; déplacer une mise entre validateurs n'impose aucune attente mais est limité à 7 déplacements en cours pour la même paire de validateurs, et une mise déplacée ne peut pas repartir avant la fin de son déplacement.
- Les récompenses ne peuvent être redirigées que vers un autre compte du même portefeuille.
- Réclamer et redéléguer couvre au plus 127 validateurs par transaction, et aucune transaction ne peut dépasser 50,000,000 de gaz.
- Les QOR en vesting peuvent être stakés mais ne peuvent pas payer de frais ; les frais doivent provenir de QOR déverrouillés.
- Le Portfolio est réservé au mobile. Sur le testnet, les QOR n'ont pas de valeur en USD.
