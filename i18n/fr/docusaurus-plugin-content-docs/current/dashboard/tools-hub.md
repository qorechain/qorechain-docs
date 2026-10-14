---
slug: /dashboard/tools-hub
title: Tools Hub
sidebar_label: Tools Hub
sidebar_position: 11
---

# Tools Hub

La page **Tools** rassemble en un seul endroit l'outillage de QoreChain destiné aux opérateurs et aux développeurs, organisé en sept onglets, dans cet ordre : **Information**, **Validator Application**, **Buy License**, **Light Node**, **Node Registration**, **Rollups** et **SDK**. L'onglet **Information** est une vue d'ensemble en lecture seule des programmes de validateurs et de nœuds légers — les trois façons de participer (validateur de genesis, nœud léger, délégateur), les niveaux de licence, les notions de base du staking et du slashing, la configuration matérielle requise, qui exploite le programme, et une FAQ. Les autres onglets sont résumés ci-dessous, avec l'endroit où ils mènent pour la documentation complète. La page Tools suit le sélecteur de réseau de l'en-tête, car les versions publiées peuvent différer d'un réseau à l'autre.

Connectez-vous pour utiliser les outils qui enregistrent des inscriptions ou soumettent des candidatures — voir [Se connecter](/dashboard/overview#sign-in).

## Light Node

Faire tourner un nœud léger et rejoindre son programme de récompenses sont deux choses différentes, et l'onglet Light Node les garde séparées plutôt que de proposer un seul flux d'inscription :

1. **Obtenez le logiciel — fonctionne dès aujourd'hui.** Aucune licence, aucune vérification on-chain et aucune approbation requises ; cette étape est affichée en premier, quel que soit le statut de votre licence. L'onglet lit le manifeste réseau en direct et vous fournit des commandes prêtes à copier pour un nœud QoreChain complet (télécharger et vérifier le binaire, initialiser le nœud avec le genesis, le pointer vers les pairs du réseau, et effectuer une synchronisation d'état (state-sync) plutôt qu'une synchronisation depuis le genesis). Un nœud léger n'a lui-même besoin que du binaire `lightnode-sx` ou `lightnode-ux` — voir [Vue d'ensemble du nœud léger](/light-node/overview). Sous les commandes, **Download the light node** liste les versions publiées avec leurs sommes de contrôle sha256 — une **Desktop edition** (incluant le tableau de bord web) et une **Server edition** (sans interface, en ligne de commande) sur six plateformes ; vérifiez le fichier par rapport à sa somme de contrôle avant de l'exécuter. Si aucune version n'est publiée pour le réseau sélectionné, le panneau l'indique.
2. **Vérifiez les exigences de la chaîne — Light node status.** Ce panneau lit les paramètres de la chaîne en direct (ce sont des paramètres de gouvernance et ils peuvent changer sans que cette page ne soit modifiée) : le stake délégué requis — votre total sur l'ensemble des validateurs auprès desquels vous déléguez, pas par validateur (actuellement 1,000 QOR) —, les frais d'enregistrement (actuellement 1 QOR), la disponibilité requise pour les récompenses, la fréquence à laquelle un battement de cœur (heartbeat) est attendu (et le délai de grâce accordé), et le nombre maximal de nœuds légers. Vous pouvez éventuellement saisir une adresse d'opérateur pour voir si un nœud léger y est enregistré, s'il rapporte à temps, et ses récompenses accumulées.
3. **L'inscription aux récompenses n'est pas encore ouverte.** Rejoindre le partage des récompenses des nœuds légers nécessite une licence `lightnode_operator` active accordée on-chain, le stake délégué minimal et les frais d'enregistrement. L'inscription elle-même n'est pas ouverte (voir [Statut du programme de récompenses](/light-node/overview#reward-program-status)), et l'achat d'une licence ne l'ouvre pas par anticipation ; il n'y a donc rien à quoi s'inscrire aujourd'hui ; faites en attendant tourner et synchroniser votre nœud. La disponibilité est comptée à partir du bloc où votre nœud s'enregistre on-chain, pas avant.
4. **Enregistrement consigné.** Si votre compte détient une licence enregistrée comme active, cet onglet affiche aussi un court formulaire — adresse d'opérateur (`qor1…`), moniker, URL de point d'accès (endpoint) public et confirmation de l'engagement de stake — puis un récapitulatif de ce que vous avez soumis. Ce formulaire consigne votre demande d'enregistrement auprès de The Qore Trust sur le Dashboard ; il **n'envoie pas** la transaction d'enregistrement on-chain et il ne vérifie pas la chaîne. L'enregistrement on-chain s'effectue depuis le nœud lui-même avec `lightnode-sx register` (voir [Enregistrement et licences](/light-node/registration-and-licensing)) et n'aboutit que lorsque la chaîne affiche un octroi actif, que le stake est déjà bondé depuis votre adresse d'opérateur et que l'inscription est ouverte.

Pour la vue d'ensemble complète, voir [Vue d'ensemble du nœud léger](/light-node/overview) et [Enregistrement et licences](/light-node/registration-and-licensing).

## Node Registration

L'onglet Node Registration consigne un enregistrement de validateur auprès de The Qore Trust sur le Dashboard. Il ne crée pas lui-même le validateur sur la chaîne ; cela se fait depuis votre propre nœud (étapes 1 et 5 ci-dessous). Prérequis et étapes :

1. **Enregistrez d'abord votre clé PQC — depuis le CLI, sur votre propre nœud validateur.** Un validateur doit lui-même exécuter l'enregistrement de la clé PQC — cela ne se fait pas automatiquement — avant de candidater pour une licence ou de l'utiliser, et avant de créer le validateur. Voir [Exécuter un validateur](/developer-guide/running-a-validator#pqc-key-registration) pour la commande CLI.
2. **Confirmez que vous êtes licencié.** Le formulaire exige une licence de validateur enregistrée comme active dans votre compte. C'est la **chaîne** qui décide si `create-validator` est accepté, et elle exige l'octroi opérateur on-chain : une licence achetée via **Buy License** est enregistrée de notre côté, et l'octroi on-chain est une étape distincte, manuelle, qui suit. Consultez **Validator Readiness** (dans l'onglet Validator Application) pour voir ce que la chaîne reconnaît actuellement. Si vous n'êtes pas encore licencié, cet onglet renvoie vers **Buy License** — les licences de validateur nécessitent d'abord une [candidature de validateur](#validator-application) approuvée.
3. **Remplissez le formulaire d'enregistrement.** Indiquez votre adresse de validateur ou votre clé publique de consensus, un moniker, un taux de commission (dans la plage autorisée par votre licence) et un point d'accès (endpoint) public facultatif. Si vos licences incluent des chaînes inter-réseaux, sélectionnez celles que ce validateur desservira.
4. **Confirmez l'exigence d'auto-stake.** Le plancher d'auto-stake du validateur est fixé à 100,000 QOR — une constante au niveau du protocole, pas un paramètre ajustable — soumis à une période de déliaison (unbonding), avec un slashing en cas d'indisponibilité (downtime) ou de double signature. Confirmez-le, puis soumettez pour vous enregistrer.
5. **Synchronisez et créez le validateur.** L'enregistrement ici consigne votre validateur ; vous devez tout de même amener votre nœud au sommet actuel de la chaîne et soumettre vous-même `create-validator`, cosigné en PQC hybride comme toute transaction QoreChain — c'est la clé de l'étape 1 qui rend cette signature valide.
6. **Confirmez et bondez le stake.** Un panneau récapitulatif affiche l'enregistrement (moniker, adresse du validateur, commission, intention d'auto-stake, chaînes inter-réseaux, statut) et vous invite à bonder votre auto-stake pour entrer dans l'ensemble actif des validateurs. Le bonding lui-même s'effectue sur votre nœud avec la transaction cosignée en post-quantique, pas dans le Dashboard.

Le staking et la création de validateur ne s'effectuent que sur la voie de transaction native de QoreChain — il n'existe aucun moyen d'enregistrer ou de bonder un validateur via un portefeuille EVM lié tel que MetaMask.

Voir [Exécuter un validateur](/developer-guide/running-a-validator) et [Staking et validateurs](/dashboard/staking-and-validators).

## Rollups

Demandez un rollup propulsé par QoreChain. Le formulaire vous permet de nommer le rollup et d'indiquer la machine virtuelle (EVM, CosmWasm ou SVM), la couche de disponibilité des données (data-availability), le jeton de gas, le modèle de séquenceur et la cible de règlement (settlement) souhaités. Sa soumission consigne une demande de provisionnement que The Qore Trust examine ; elle ne crée pas le rollup on-chain. Les options sont plus larges que ce que le module de rollup on-chain prend actuellement en charge. Pour enregistrer vous-même un rollup on-chain, voir [Déployer un rollup](/rollups/deploying-a-rollup) ; pour les concepts, voir [Présentation des Rollups](/rollups/overview).

## SDK

Un hub de démarrage rapide et de référence pour développer sur QoreChain en code. La section présente les étapes d'installation et des extraits prêts à copier pour se connecter, dériver des comptes à travers les trois runtimes, lire l'état, envoyer des transferts et signer de manière résistante au quantique (quantum-safe), ainsi qu'un tableau des packages par langage et des liens vers le dépôt, les exemples et l'explorer. Voir [Présentation du SDK QoreChain](/sdk/overview) et [Installation](/sdk/install).

## Validator Application {#validator-application}

Candidatez pour devenir Genesis Validator :

1. **Renseignez les informations de votre entité.** Nom légal de l'entité, pays/juridiction et une adresse e-mail de contact.
2. **Choisissez le niveau (tier) souhaité.** Sélectionnez dans le catalogue des niveaux de validateur (chaque niveau indique son nombre de places et son ensemble de fonctionnalités) — il s'agit du niveau que vous comptez licencier une fois approuvé, pas encore d'un achat.
3. **Décrivez votre infrastructure.** La région de votre infrastructure et les détails matériels/datacenter.
4. **Expliquez votre motivation.** Une brève description de l'expérience de votre équipe en matière de validateurs/infrastructure et des raisons pour lesquelles vous souhaitez exploiter un Genesis Validator QoreChain.
5. **Confirmez la conformité et soumettez.** Confirmez qu'une vérification KYC/AML de l'entité candidate et de ses bénéficiaires effectifs est requise avant qu'une licence ne soit accordée, puis soumettez.
6. **Suivez votre statut.** L'onglet affiche votre candidature comme en cours d'examen, approuvée, ou non approuvée avec un motif (avec la possibilité de la réviser et de la resoumettre). Une fois votre candidature en attente ou approuvée, un panneau **Validator Readiness** en direct vérifie trois éléments directement auprès de la chaîne, et non par rapport à ce que vous avez acheté : l'enregistrement de votre clé PQC, votre auto-bond (100,000 QOR fixes — solde disponible uniquement, les fonds en vesting ne comptent pas), et si votre licence d'opérateur a réellement été accordée on-chain et est actuellement valide (non suspendue et non expirée — les licences expirent à une hauteur de bloc, et si le sommet de la chaîne ne peut pas être lu, une licence arrivant à expiration est signalée comme *impossible à vérifier* plutôt que comme valide). Chaque vérification indique l'un de trois états — rempli, pas encore rempli, ou *impossible à vérifier* lorsque la chaîne est inaccessible — et une lecture en échec n'est jamais affichée comme « vous ne l'avez pas », car cela vous enverrait refaire quelque chose que vous possédez déjà. Une fois approuvé, vous pouvez passer à **Buy License** pour acquérir une licence de validateur.

Voir [Exécuter un validateur](/developer-guide/running-a-validator).

## Buy License

Acquérez les licences requises pour exploiter une infrastructure réseau :

1. **Indiquez l'adresse à licencier.** Le champ **QoreChain address** en haut est obligatoire pour chaque achat : saisissez l'adresse `qor1…` à laquelle la licence doit être accordée on-chain. Utilisez une adresse que vous contrôlez et que vous conserverez — l'octroi lui est lié, et la modifier plus tard nécessite l'intervention du support. Une licence ne peut pas être commandée sans adresse.
2. **Choisissez un réseau de paiement.** Sous **Pay with USDT on:**, sélectionnez ERC-20, BEP-20 ou TRC-20.
3. **Choisissez ce que vous achetez.** Une licence de nœud léger est disponible pour tout le monde. Les licences de validateur (dans l'ensemble du catalogue de niveaux) ne se débloquent qu'une fois votre [candidature de validateur](#validator-application) approuvée. Les compléments inter-réseaux étendent une licence de validateur à des chaînes supplémentaires, facturés par chaîne et par an — sélectionnez les chaînes souhaitées, puis achetez.
4. **Finalisez le paiement.** Chaque achat vous amène à une étape de paiement qui confirme le montant et le réseau, et vérifie le paiement on-chain avant que la licence ne soit enregistrée comme payée.
5. **Attendez l'octroi on-chain, puis enregistrez-vous.** Après le paiement, la licence affiche **Paid — awaiting on-chain grant**. Les octrois sont émis manuellement, par lots, et ne sont donc pas instantanés. Le statut ne passe à **Active** qu'une fois que la chaîne elle-même a confirmé l'octroi. L'enregistrement sur la chaîne vérifie la chaîne, pas nos registres ; s'enregistrer avant que l'octroi n'ait eu lieu sera donc refusé. Une fois que le badge affiche **Active**, retournez à **Light Node** ou **Node Registration** pour l'enregistrement correspondant.

:::note Licences achetées avant que l'adresse ne soit obligatoire
Si vous avez acheté une licence avant que l'adresse ne soit collectée, l'onglet Buy License s'ouvre sur **This licence needs a QoreChain address** — saisissez l'adresse et sélectionnez **Save address**. Tant qu'elle n'est pas enregistrée, la licence ne peut pas être accordée.
:::

Pour comprendre le fonctionnement des licences à travers le réseau, voir [Licences de chaîne](/architecture/chain-licensing).
