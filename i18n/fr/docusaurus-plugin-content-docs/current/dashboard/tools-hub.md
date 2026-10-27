---
slug: /dashboard/tools-hub
title: Nodes & Validators
sidebar_label: Nodes & Validators
sidebar_position: 11
---

# Nodes & Validators

La page **Nodes & Validators** (groupe **Build** de la barre latérale, adresse `/tools` ; elle s'appelait Tools et Tools Hub avant le 27 octobre 2026) est la page d'exploitation du Dashboard. Elle comporte cinq onglets, dans cet ordre : **Validator Program**, **Validator Application**, **Light Node**, **Node Registration** et **Rollups**. Elle s'adresse aux personnes qui veulent exploiter un validateur ou un nœud léger, ou demander un rollup applicatif. L'onglet SDK a été déplacé vers la page publique [Développeurs](/dashboard/developers), qui contient aussi les outils pour les développeurs (état des clés PQC, simulateur, signing playground, QoreX test wallet).

## Innovations {#innovations}

- **Les vérifications viennent de la chaîne.** Le panneau **Validator Readiness** contrôle quatre éléments sur le réseau sélectionné : une clé ML-DSA-87 enregistrée, des QOR disponibles pour l'auto-stake (vesting exclu), l'octroi opérateur on-chain, et si le validateur est bondé. Le panneau **Light node status** lit les exigences en vigueur (frais d'enregistrement, stake délégué, disponibilité, fenêtre de heartbeat, nombre maximal de nœuds légers) ainsi que l'état d'enregistrement et de heartbeat de l'adresse.
- **« Payée » et « accordée on-chain » sont deux faits distincts.** Une licence payée affiche **Paid, awaiting on-chain grant** jusqu'à ce que la chaîne confirme l'octroi, puis **Active on chain**. L'onglet n'affiche jamais une licence comme active avant que la chaîne n'ait l'octroi.
- **Règles du protocole et règles du programme sont étiquetées séparément.** Chaque ligne de paramètre indique si elle vient du protocole (lue sur la chaîne) ou du programme (appliquée par l'Association).
- **Une licence de nœud léger testnet en libre-service.** Saisissez une adresse `qor1...` sous **Free testnet licence** et sélectionnez **Request licence** ; l'octroi est signé automatiquement, en général en quelques minutes. Les octrois du mainnet restent manuels.
- **Les étapes du nœud suivent le manifeste de version du réseau.** Les téléchargements (édition serveur `lightnode-sx`, édition desktop `lightnode-ux`, par plateforme, avec sommes de contrôle SHA-256), l'ouverture ou non de l'enregistrement, et le fait que les étapes soient à jour viennent tous du manifeste.

## Comment l'utiliser {#how-to-use}

Prérequis pour chaque onglet : se connecter. Les onglets suivent le sélecteur de réseau de l'en-tête (les vérifications de la chaîne, les téléchargements et le statut des nœuds sont lus sur le réseau sélectionné). Déconnecté, la page affiche « Authentication Required ». Voir [Se connecter](/dashboard/overview#sign-in).

### Validator Program {#validator-program}

Une vue d'ensemble en lecture seule du **QoreChain Validator Program**, la voie par laquelle les validateurs rejoignent le réseau : ce que le programme apporte (l'octroi opérateur on-chain, une délégation issue du stake contrôlé par l'Association et une allocation en QOR pour les opérateurs indépendants qui respectent les niveaux de service), ce qu'il exige, le processus de sélection et une FAQ. Il comporte les boutons **Apply** et **Ask a question**. Les paramètres de protocole (durée de déliaison, slashing, nombre maximal de validateurs) sont lus en direct sur la chaîne ; les règles du programme (l'auto-stake de 100,000 QOR, la fourchette de commission, l'allocation) relèvent de l'Association et sont signalées comme telles. Les validateurs n'achètent pas de formule : ils candidatent, et ne paient des **frais de programme de $1,000** qu'une fois sélectionnés. Pour les montants de l'allocation, voir l'onglet lui-même.

### Validator Application {#validator-application}

1. **Remplissez la candidature.** Nom de l'entité, juridiction et e-mail de contact ; l'**adresse d'opérateur** (`qor1...`, le compte depuis lequel vous exécuterez `create-validator` ; l'octroi opérateur on-chain est émis pour cette adresse) ; l'hébergeur, la région et le type d'hébergement ; les réseaux que vous exploitez déjà ; éventuellement votre adresse de validateur testnet (`qorvaloper1...`) et l'infrastructure publique que vous proposez (RPC public, snapshots, archive) ; la filière (Standard, ou Global pour les places réservées) ; et l'acceptation des conditions du programme. Sélectionnez **Submit application**. Candidater est gratuit.
2. **Examen et période d'essai sur le testnet.** La candidature s'affiche comme **Application submitted**, puis, pour les candidatures retenues pour la suite, **Testnet trial** (une période d'essai de 14 jours avec un validateur sur `qorechain-diana`). Une candidature refusée affiche **Not selected**, avec **Apply again**.
3. **Sélection et frais de programme.** Une candidature sélectionnée affiche **Selected** avec un bouton **Pay the $1,000 programme fee**. Choisissez le réseau (USDT sur ERC-20, BEP-20 ou TRC-20), payez le montant exact affiché, collez le hash de la transaction et sélectionnez **Verify payment** ; le paiement est vérifié on-chain. Les frais sont liés à l'adresse d'opérateur de votre candidature ; ils ne peuvent pas être payés pour une autre adresse. Approbation et paiement sont affichés séparément : une candidature peut être sélectionnée et rester impayée. Après le paiement, la carte affiche « Programme fee paid ».
4. **L'octroi opérateur on-chain.** Après le paiement, l'Association émet l'octroi `validator_operator` on-chain pour votre adresse d'opérateur. Les octrois du mainnet sont signés manuellement, par lots, et ne sont donc pas instantanés. L'onglet affiche **Operator grant on chain** dès que la chaîne l'a enregistré, et **In the active set** une fois votre validateur bondé.
5. **Préparation.** Pour les candidatures soumises, en période d'essai, sélectionnées et accordées, le panneau **Validator Readiness** (avec un champ d'adresse) vérifie la chaîne pour l'adresse d'opérateur. Effectuez tôt l'[enregistrement de la clé PQC](/developer-guide/running-a-validator#pqc-key-registration) sur votre propre nœud : personne n'enregistre cette clé à votre place.

Les candidatures approuvées dans le cadre de l'ancienne offre validateur (avant octobre 2026) s'affichent comme **Earlier application** ; l'Association contacte directement ces candidats.

### Light Node {#light-node}

Tout ce dont un opérateur de nœud léger a besoin, de la licence jusqu'à un nœud enregistré.

1. **Achetez la licence (mainnet).** Une licence de nœud léger coûte **$50**, payée en USDT sur ERC-20, BEP-20 ou TRC-20 et vérifiée on-chain. Saisissez l'adresse `qor1...` à laquelle la licence doit être accordée, choisissez le réseau USDT et sélectionnez **Buy for $50** ; utilisez un compte dont vous détenez les mots de récupération (vos propres mots, Keplr ou `qorechaind`), idéalement un compte utilisé uniquement pour le nœud. Après le paiement, la carte affiche **Payment received** et l'octroi on-chain suit. **Your past orders** sont listées en dessous.
2. **Attendez l'octroi on-chain.** La licence affiche **Paid, awaiting on-chain grant**, puis **Active on chain** lorsque la chaîne confirme l'octroi `lightnode_operator`. Les octrois du mainnet sont signés manuellement, par lots.
3. **Installez et enregistrez le nœud.** L'onglet liste les versions publiées pour votre réseau avec leurs sommes de contrôle et les étapes de la version actuelle : définir une phrase de passe pour le trousseau (keyring), `lightnode-sx onboard`, `lightnode-sx keys add-operator --recover` (ajoute le compte auquel la licence est destinée), `lightnode-sx register` (rattache la clé post-quantique du nœud et l'enregistre ; ajoutez `--delegate-to <qorvaloper...>` si l'adresse n'a pas le stake requis), puis `lightnode-sx start` et `lightnode-sx status`. Les étapes ne sont présentées comme actuelles que lorsque le manifeste de version du réseau publie une version qui les prend en charge, et l'onglet indique si l'enregistrement est ouvert.
4. **Avertissements concernant votre adresse.** L'onglet vous avertit lorsque l'adresse de la licence est l'un de vos propres portefeuilles conservés (custodial) du Dashboard (« This address cannot run a node » : le Dashboard détient cette clé), et signale lorsque l'adresse possède déjà une clé post-quantique on-chain (le nœud la réutilise lorsqu'elle a été dérivée de vos mots de récupération, et sinon refuse et recommande un compte dédié).
5. **Statut.** Un panneau affiche les exigences en vigueur et indique si un nœud léger est enregistré et rapporte à temps. Ses états comprennent « Registered, waiting for its first heartbeat », « Rewards accrued » et un avis lorsque le nœud a été marqué inactif.

#### Licence testnet gratuite {#testnet-licence}

Sur le testnet (`qorechain-diana`), rien n'est vendu (« Nothing is sold on testnet ») et une licence de nœud léger est gratuite et en libre-service :

1. Réglez l'en-tête sur **Testnet** et ouvrez l'onglet **Light Node**.
2. Sous **Free testnet licence**, saisissez votre adresse `qor1...` et sélectionnez **Request licence**.
3. La demande s'affiche comme « Requested for ... », puis « Granted to ... You can register your node now. » Si l'octroi n'a pas pu être signé, l'onglet l'indique et vous pouvez refaire la demande.

Les octrois sont signés automatiquement, en général en quelques minutes. Il y a une demande par compte et une par adresse. **Exemple minimal :** Testnet, **Light Node**, **Request licence**, attendez « Granted to ... », puis exécutez `lightnode-sx onboard` jusqu'à `register`.

Voir [Vue d'ensemble du nœud léger](/light-node/overview) et [Enregistrement et licences](/light-node/registration-and-licensing).

:::note Licences achetées avant que l'adresse ne soit obligatoire
Si vous avez acheté une licence avant que l'adresse ne soit collectée, l'onglet s'ouvre sur **This licence needs a QoreChain address** : saisissez l'adresse et sélectionnez **Save address**. Tant qu'elle n'est pas enregistrée, la licence ne peut pas être accordée.
:::

### Node Registration {#node-registration}

Consigne les informations de votre validateur auprès de l'Association. Cela ne crée pas le validateur on-chain ; vous le faites depuis votre propre nœud avec `create-validator`. L'onglet est verrouillé tant que l'octroi n'est pas on-chain.

Le formulaire s'ouvre dès que la chaîne affiche un octroi `validator_operator` actif pour votre adresse d'opérateur et que vous détenez une candidature au Validator Program sélectionnée (ou une licence de validateur antérieure au programme). Indiquez l'adresse d'opérateur, un **Moniker**, une **Commission** comprise entre 5% et 20% et un point d'accès (endpoint) facultatif, cochez la confirmation (l'auto-stake de 100,000 QOR, la période de déliaison de 21 jours et le slashing), puis sélectionnez **Register validator**.

Les étapes on-chain sont décrites dans [Exécuter un validateur](/developer-guide/running-a-validator) : enregistrez votre clé PQC, puis soumettez `create-validator` avec au moins 100,000 QOR d'auto-stake, cosigné en PQC comme toute transaction QoreChain. Le staking et la création de validateur ne s'effectuent que sur la voie de transaction native ; il n'existe aucun moyen d'enregistrer ou de bonder un validateur via un portefeuille EVM lié tel que MetaMask. Sous le formulaire, l'onglet liste ce dont un nœud complet a besoin (binaire de version, genesis, pairs), d'après le manifeste de version, et peut afficher une bannière « Joining is temporarily suspended » lorsque le réseau n'accepte pas de nouveaux validateurs. Voir [Staking et validateurs](/dashboard/staking-and-validators).

### Rollups {#rollups}

L'onglet s'intitule **Request a Rollup**. Remplissez le formulaire : un nom, la machine virtuelle (EVM, QoreChain Native ou SVM), la couche de disponibilité des données (QoreChain DA, Celestia ou EigenDA), le jeton de gas, le séquenceur (Shared sequencer, Dedicated (single) ou Decentralized) et la cible de règlement (QoreChain mainnet ou Ethereum), puis sélectionnez **Request deployment**. Cela consigne seulement une demande, listée sous le formulaire avec son statut ; rien n'est créé on-chain à cette étape. Les options sont plus larges que ce que le module de rollup on-chain prend actuellement en charge. Pour enregistrer vous-même un rollup on-chain, voir [Déployer un rollup](/rollups/deploying-a-rollup) ; pour les concepts, voir [Présentation des Rollups](/rollups/overview).

## Comment y accéder {#how-to-access}

- **URL :** [dashboard.qorechain.io/tools](https://dashboard.qorechain.io/tools), ou **Nodes & Validators** dans le groupe **Build** de la barre latérale.
- **Connexion :** requise pour toute la page, sur les deux réseaux.
- **Réseau :** suit l'en-tête. L'achat de la licence à $50 n'est possible que sur le mainnet ; la licence gratuite n'existe que sur le testnet.
- **Coûts :** candidater est gratuit ; les frais du programme validateur sont de $1,000 et ne sont payés qu'après la sélection ; une licence de nœud léger mainnet coûte $50 ; la licence testnet est gratuite.
- **Portefeuille :** un compte dont vous détenez les mots de récupération pour le nœud ; aucun portefeuille n'est nécessaire pour lire les onglets.

## Où c'est publié {#where-published}

| Surface | Adresse | Réseaux |
| --- | --- | --- |
| Nodes & Validators | `dashboard.qorechain.io/tools` | Mainnet et testnet, commutateur de l'en-tête |
| Téléchargements des nœuds et sommes de contrôle | L'onglet Light Node | Selon le manifeste de version de chaque réseau |
| SDK et outils pour développeurs | [Développeurs](/dashboard/developers) | Les deux |

## Limites et problèmes connus {#limits}

- **Les octrois du mainnet sont manuels,** signés par lots ; une licence payée attend donc à l'état « Paid, awaiting on-chain grant ». Les octrois du testnet sont automatiques.
- **Une seule demande gratuite sur le testnet** par compte et par adresse.
- **Rollups est un formulaire de demande sur les deux réseaux ;** il ne crée rien on-chain.
- **L'entrée comme validateur peut être suspendue** (la bannière « Joining is temporarily suspended »).
- **Les coordonnées de réception USDT et les montants de l'allocation** ne sont affichés qu'à l'intérieur des onglets, au moment du paiement ou de la candidature.

Pour comprendre le fonctionnement des licences à travers le réseau, voir [Licences de chaîne](/architecture/chain-licensing).
