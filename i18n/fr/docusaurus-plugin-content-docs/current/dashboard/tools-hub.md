---
slug: /dashboard/tools-hub
title: Tools Hub
sidebar_label: Tools Hub
sidebar_position: 11
---

# Tools Hub

La page **Tools** rassemble en un seul endroit l'outillage de QoreChain destiné aux opérateurs et aux développeurs, en six onglets, dans cet ordre : **Validator Program**, **Validator Application**, **Light Node**, **Node Registration**, **Rollups** et **SDK**. La page suit le sélecteur de réseau de l'en-tête : les vérifications de la chaîne, les téléchargements et le statut des nœuds sont lus sur le réseau que vous avez sélectionné. Les licences sont vendues **sur le mainnet uniquement** (voir [Light Node](#light-node)).

Connectez-vous pour utiliser les outils qui enregistrent des inscriptions, soumettent des candidatures ou encaissent un paiement — voir [Se connecter](/dashboard/overview#sign-in).

## Validator Program

Une vue d'ensemble en lecture seule du **QoreChain Validator Program**, la voie par laquelle les validateurs rejoignent le réseau : ce que le programme apporte (l'octroi opérateur on-chain, une délégation issue du stake contrôlé par l'Association et une allocation en QOR pour les opérateurs indépendants qui respectent les niveaux de service), ce qu'il exige, le processus de sélection et une FAQ. Les paramètres de protocole de cet onglet (durée de déliaison, slashing, nombre maximal de validateurs) sont lus en direct sur la chaîne ; les règles du programme (l'auto-stake de 100,000 QOR, la fourchette de commission, l'allocation) relèvent de l'Association et sont signalées comme telles. Les validateurs n'achètent pas de formule : ils candidatent, et ne paient des **frais de programme de $1,000** qu'une fois sélectionnés.

## Validator Application {#validator-application}

Candidatez au Validator Program :

1. **Remplissez la candidature.** Nom de l'entité, juridiction et e-mail de contact ; l'**adresse d'opérateur** (`qor1…`, le compte depuis lequel vous exécuterez `create-validator` : l'octroi opérateur on-chain est émis pour cette adresse) ; l'hébergeur, la région et le type d'hébergement ; les réseaux que vous exploitez déjà ; éventuellement votre adresse de validateur testnet et l'infrastructure publique que vous proposez (RPC public, snapshots, archive) ; la filière (standard, ou globale pour les places réservées) ; et l'acceptation des conditions du programme. Candidater est gratuit.
2. **Examen et période d'essai sur le testnet.** La candidature s'affiche comme **Submitted** pendant son examen. Les candidatures retenues pour la suite font tourner un validateur sur le testnet diana pendant une période d'essai de 14 jours, affichée comme **Testnet trial**.
3. **Sélection et frais de programme.** Une candidature sélectionnée affiche **Selected** avec un bouton **Pay $1,000**. L'étape de paiement fonctionne comme pour une licence de nœud léger (USDT sur ERC-20, BEP-20 ou TRC-20, vérifié on-chain). Les frais sont liés à l'adresse d'opérateur de votre candidature ; ils ne peuvent pas être payés pour une autre adresse. Approbation et paiement sont toujours affichés séparément : une candidature peut être sélectionnée et rester impayée.
4. **L'octroi opérateur on-chain.** Après le paiement, l'Association émet l'octroi `validator_operator` on-chain pour votre adresse d'opérateur. Les octrois sont signés manuellement, par lots, et ne sont donc pas instantanés. L'onglet affiche **Operator grant on chain** dès que la chaîne l'a enregistré, et **In the active set** une fois votre validateur bondé.

Dès qu'une candidature est déposée, un panneau **Validator Readiness** vérifie directement sur la chaîne, pour l'adresse d'opérateur : une clé post-quantique enregistrée, suffisamment de QOR disponibles pour l'auto-stake, l'octroi opérateur et si le validateur est bondé. Effectuez tôt l'[enregistrement de la clé PQC](/developer-guide/running-a-validator#pqc-key-registration) sur votre propre nœud : personne n'enregistre cette clé à votre place.

Les candidatures approuvées dans le cadre de l'ancienne offre validateur (avant octobre 2026) s'affichent comme **Earlier application** ; l'Association contacte directement ces candidats.

## Light Node {#light-node}

Tout ce dont un opérateur de nœud léger a besoin, de la licence jusqu'à un nœud enregistré on-chain.

1. **Achetez la licence (mainnet).** Une licence de nœud léger coûte **$50**, payée en USDT sur ERC-20, BEP-20 ou TRC-20 et vérifiée on-chain. Saisissez avant de payer l'adresse `qor1…` à laquelle la licence doit être accordée ; utilisez un compte dont vous détenez les mots de récupération (vos propres mots, Keplr ou `qorechaind`), idéalement un compte utilisé uniquement pour le nœud. Lorsque l'en-tête est réglé sur **testnet**, rien n'est en vente : les licences de nœud léger testnet sont gratuites et accordées par l'équipe QoreChain.
2. **Attendez l'octroi on-chain.** Après le paiement, la licence affiche **Paid, awaiting on-chain grant** ; elle ne passe à **Active on chain** que lorsque la chaîne confirme l'octroi `lightnode_operator`. Les octrois sont signés manuellement, par lots.
3. **Installez et enregistrez le nœud.** L'onglet liste les versions publiées pour votre réseau avec leurs sommes de contrôle (édition serveur `lightnode-sx`, édition desktop `lightnode-ux`, sous Linux, macOS et Windows) et les étapes de la version actuelle : définir une phrase de passe pour le trousseau (keyring), `lightnode-sx onboard`, `lightnode-sx keys add-operator --recover` (ajoute le compte auquel la licence est destinée), `lightnode-sx register` (rattache la clé post-quantique du nœud et l'enregistre, en ajoutant `--delegate-to <qorvaloper…>` si l'adresse n'a pas le stake requis), puis `lightnode-sx start` et `lightnode-sx status`. Les étapes ne sont présentées comme actuelles que lorsque le manifeste de version du réseau publie une version qui les prend en charge, et l'onglet indique si l'enregistrement est ouvert sur ce réseau.
4. **Avertissements concernant votre adresse.** L'onglet vous avertit lorsque l'adresse de la licence est l'un de vos propres portefeuilles conservés (custodial) du Dashboard (le Dashboard détient cette clé, un nœud ne peut donc pas signer avec), et signale lorsque l'adresse possède déjà une clé post-quantique on-chain (le nœud la réutilise lorsqu'elle a été dérivée de vos mots de récupération, et sinon refuse et recommande un compte dédié).
5. **Statut.** Un panneau lit la chaîne : les exigences en vigueur (frais d'enregistrement, stake délégué, disponibilité, fenêtre de heartbeat, nombre maximal de nœuds légers) et, pour une adresse, si un nœud léger est enregistré et rapporte à temps.

Voir [Vue d'ensemble du nœud léger](/light-node/overview) et [Enregistrement et licences](/light-node/registration-and-licensing).

:::note Licences achetées avant que l'adresse ne soit obligatoire
Si vous avez acheté une licence avant que l'adresse ne soit collectée, l'onglet s'ouvre sur **This licence needs a QoreChain address** : saisissez l'adresse et sélectionnez **Save address**. Tant qu'elle n'est pas enregistrée, la licence ne peut pas être accordée.
:::

## Node Registration

Consigne les informations de votre validateur auprès de l'Association. Cela ne crée pas le validateur on-chain ; vous le faites depuis votre propre nœud avec `create-validator`.

Le formulaire s'ouvre dès que la chaîne affiche un octroi `validator_operator` actif pour votre adresse d'opérateur et que vous détenez une candidature au Validator Program sélectionnée (ou une licence de validateur antérieure au programme). Indiquez votre adresse d'opérateur de validateur, un moniker, un taux de commission compris entre 5% et 20% et un point d'accès (endpoint) public facultatif, puis confirmez l'auto-stake de 100,000 QOR, la période de déliaison (unbonding) de 21 jours et le slashing.

Les étapes on-chain sont décrites dans [Exécuter un validateur](/developer-guide/running-a-validator) : enregistrez votre clé PQC, puis soumettez `create-validator` avec au moins 100,000 QOR d'auto-stake, cosigné en PQC comme toute transaction QoreChain. Le staking et la création de validateur ne s'effectuent que sur la voie de transaction native de QoreChain ; il n'existe aucun moyen d'enregistrer ou de bonder un validateur via un portefeuille EVM lié tel que MetaMask. Sous le formulaire, l'onglet liste aussi ce dont un nœud complet a besoin (binaire de version, genesis, pairs), d'après le manifeste de version du réseau.

Voir [Staking et validateurs](/dashboard/staking-and-validators).

## Rollups

Demandez un rollup propulsé par QoreChain. Le formulaire vous permet de nommer le rollup et d'indiquer la machine virtuelle (EVM, QoreChain Native ou SVM), la couche de disponibilité des données (data-availability), le jeton de gas, le modèle de séquenceur et la cible de règlement (settlement) souhaités. Sa soumission consigne une demande de provisionnement qui est ensuite examinée ; elle ne crée pas le rollup on-chain. Les options sont plus larges que ce que le module de rollup on-chain prend actuellement en charge. Pour enregistrer vous-même un rollup on-chain, voir [Déployer un rollup](/rollups/deploying-a-rollup) ; pour les concepts, voir [Présentation des Rollups](/rollups/overview).

## SDK

Un hub de démarrage rapide et de référence pour développer sur QoreChain en code. La section présente les étapes d'installation et des extraits prêts à copier pour se connecter, dériver des comptes à travers les trois runtimes, lire l'état, envoyer des transferts et signer de manière résistante au quantique (quantum-safe), ainsi qu'un tableau des packages par langage et des liens vers le dépôt, les exemples et l'explorer. Voir [Présentation du SDK QoreChain](/sdk/overview) et [Installation](/sdk/install).

Pour comprendre le fonctionnement des licences à travers le réseau, voir [Licences de chaîne](/architecture/chain-licensing).
