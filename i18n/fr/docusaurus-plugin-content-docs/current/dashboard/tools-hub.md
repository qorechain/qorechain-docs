---
slug: /dashboard/tools-hub
title: Tools Hub
sidebar_label: Tools Hub
sidebar_position: 11
---

# Tools Hub

La page **Tools** rassemble en un seul endroit l'outillage de QoreChain destiné aux opérateurs et aux développeurs, organisé en onglets. À partir d'ici, vous pouvez enregistrer une infrastructure, déployer un rollup, accéder au SDK, candidater pour devenir validateur et acquérir les licences requises par ces rôles. Chaque section est résumée ci-dessous, avec l'endroit où elle mène pour la documentation complète.

Connectez votre portefeuille pour utiliser les outils qui enregistrent une infrastructure ou soumettent des candidatures — voir [Présentation et prise en main](/dashboard/overview#connect-your-wallet).

## Light Node

Faire tourner un nœud léger et rejoindre son programme de récompenses sont deux choses différentes, et l'onglet **Light Node** les garde séparées plutôt que de proposer un seul flux d'inscription :

1. **Mettez votre nœud en route — fonctionne dès aujourd'hui.** Aucune licence, aucune vérification on-chain et aucune approbation requises ; cette étape est affichée en premier, quel que soit le statut de votre licence. Elle lit le manifeste réseau en direct et vous fournit des commandes prêtes à copier pour télécharger et vérifier le binaire, initialiser le nœud avec le genesis, le pointer vers les pairs du réseau, et effectuer une synchronisation d'état (state-sync) plutôt qu'une synchronisation depuis le genesis.
2. **Vérifiez le statut de votre programme de récompenses.** Rejoindre le partage des récompenses des nœuds légers est une étape distincte, conditionnée on-chain : une licence `lightnode_operator` active accordée on-chain, un montant minimum de QOR délégué — votre total sur l'ensemble des validateurs auprès desquels vous déléguez, pas par validateur, lu en direct depuis le staking — et de faibles frais d'enregistrement on-chain. **L'inscription n'est pas encore ouverte**, et l'achat d'une licence ne l'ouvre pas par anticipation ; il n'y a donc rien à quoi s'inscrire aujourd'hui. Cet onglet affiche l'exigence comme un statut à vérifier plutôt que comme un formulaire à soumettre, jusqu'à son ouverture.
3. **Enregistrez-vous une fois votre licence accordée on-chain.** Une licence achetée via **Buy License** est d'abord enregistrée de notre côté — l'octroi on-chain est une étape distincte, et l'enregistrement est refusé tant que cet octroi n'a pas eu lieu (voir la remarque sur Buy License ci-dessous). Une fois qu'il a eu lieu, cet onglet remplace le panneau de statut par un formulaire d'enregistrement : votre adresse d'opérateur (`qor1…`), un moniker et une URL de point d'accès (endpoint) public, ainsi qu'une confirmation de l'engagement de stake.
4. **Confirmez et bondez le stake.** Après soumission, un panneau récapitulatif confirme l'enregistrement (moniker, adresse d'opérateur, endpoint, intention de stake, statut) et vous invite à bonder le stake confirmé depuis votre adresse d'opérateur une fois l'éligibilité ouverte.

Pour la vue d'ensemble complète, voir [Vue d'ensemble du nœud léger](/light-node/overview) et [Enregistrement et licences](/light-node/registration-and-licensing).

## Node Registration

L'onglet **Node Registration** enregistre un nœud validateur on-chain :

1. **Enregistrez d'abord votre clé PQC — depuis le CLI, sur votre propre nœud validateur.** Ce n'est pas automatique comme pour la première transaction d'un compte ordinaire : un validateur doit lui-même exécuter l'enregistrement de la clé PQC, avant de candidater pour une licence ou de l'utiliser, et avant de créer le validateur. Voir [Exécuter un validateur](/developer-guide/running-a-validator#pqc-key-registration) pour la commande CLI.
2. **Confirmez que vous êtes licencié.** Une licence de validateur active est requise avant de pouvoir vous enregistrer ici. Une licence achetée via **Buy License** est enregistrée de notre côté ; l'octroi on-chain est une étape distincte, et l'enregistrement est refusé tant que cet octroi n'a pas eu lieu. Si vous n'êtes pas encore licencié, cet onglet renvoie vers **Buy License** — les licences de validateur nécessitent d'abord une [candidature de validateur](#validator-application) approuvée.
3. **Remplissez le formulaire d'enregistrement.** Indiquez votre adresse de validateur ou votre clé publique de consensus, un moniker, un taux de commission (dans la plage autorisée par votre licence) et un point d'accès (endpoint) public facultatif. Si vos licences incluent des chaînes inter-réseaux, sélectionnez celles que ce validateur desservira.
4. **Confirmez l'exigence d'auto-stake.** Le plancher d'auto-stake du validateur est fixé à 100,000 QOR — une constante au niveau du protocole, pas un paramètre ajustable — soumis à une période de déliaison (unbonding), avec un slashing en cas d'indisponibilité (downtime) ou de double signature. Confirmez-le, puis soumettez pour vous enregistrer.
5. **Synchronisez et créez le validateur.** L'enregistrement ici consigne votre validateur ; vous devez tout de même amener votre nœud au sommet actuel de la chaîne et soumettre vous-même `create-validator`, cosigné en PQC hybride comme toute transaction QoreChain — c'est la clé de l'étape 1 qui rend cette signature valide.
6. **Confirmez et bondez le stake.** Un panneau récapitulatif affiche l'enregistrement (moniker, adresse du validateur, commission, intention d'auto-stake, chaînes inter-réseaux, statut) et vous invite à bonder votre auto-stake pour entrer dans l'ensemble actif des validateurs.

Le staking et la création de validateur ne s'effectuent que sur la voie de transaction native de QoreChain — il n'existe aucun moyen d'enregistrer ou de bonder un validateur via un portefeuille EVM lié tel que MetaMask.

Voir [Exécuter un validateur](/developer-guide/running-a-validator) et [Staking et validateurs](/dashboard/staking-and-validators).

## Rollups

Déployez votre propre rollup propulsé par QoreChain. Le formulaire de configuration vous permet de nommer le rollup et de choisir sa machine virtuelle (EVM, CosmWasm ou SVM), sa couche de disponibilité des données (data-availability), son jeton de gas, son modèle de séquenceur et sa cible de règlement (settlement). Après votre soumission, le rollup est provisionné à la suite d'un examen avant sa mise en service. Voir [Présentation des Rollups](/rollups/overview) et [Déployer un rollup](/rollups/deploying-a-rollup).

## SDK

Un hub de démarrage rapide et de référence pour développer sur QoreChain en code. La section présente les étapes d'installation et des extraits prêts à copier pour se connecter, dériver des comptes à travers les trois runtimes, lire l'état, envoyer des transferts et signer de manière résistante au quantique (quantum-safe), ainsi qu'un tableau des packages par langage et des liens vers le dépôt, les exemples et l'explorer. Voir [Présentation du SDK QoreChain](/sdk/overview) et [Installation](/sdk/install).

## Validator Application {#validator-application}

Candidatez pour devenir Genesis Validator :

1. **Renseignez les informations de votre entité.** Nom légal de l'entité, pays/juridiction et une adresse e-mail de contact.
2. **Choisissez le niveau (tier) souhaité.** Sélectionnez dans le catalogue des niveaux de validateur (chaque niveau indique son nombre de places et son ensemble de fonctionnalités) — il s'agit du niveau que vous comptez licencier une fois approuvé, pas encore d'un achat.
3. **Décrivez votre infrastructure.** La région de votre infrastructure et les détails matériels/datacenter.
4. **Expliquez votre motivation.** Une brève description de l'expérience de votre équipe en matière de validateurs/infrastructure et des raisons pour lesquelles vous souhaitez exploiter un Genesis Validator QoreChain.
5. **Confirmez la conformité et soumettez.** Confirmez qu'une vérification KYC/AML de l'entité candidate et de ses bénéficiaires effectifs est requise avant qu'une licence ne soit accordée, puis soumettez.
6. **Suivez votre statut.** L'onglet affiche votre candidature comme en cours d'examen, approuvée, ou non approuvée avec un motif (avec la possibilité de la réviser et de la resoumettre). Une fois votre candidature en attente ou approuvée, un panneau **Validator Readiness** en direct vérifie trois éléments directement auprès de la chaîne, et non par rapport à ce que vous avez acheté : l'enregistrement de votre clé PQC, votre auto-bond (100,000 QOR fixes — solde disponible uniquement, les fonds en vesting ne comptent pas), et si votre licence d'opérateur a réellement été accordée on-chain. Chaque vérification indique l'un de trois états — rempli, pas encore rempli, ou *impossible à vérifier* lorsque la chaîne est inaccessible — et une lecture en échec n'est jamais affichée comme « vous ne l'avez pas », car cela vous enverrait refaire quelque chose que vous possédez déjà. Une fois approuvé, vous pouvez passer à **Buy License** pour acquérir une licence de validateur.

Voir [Exécuter un validateur](/developer-guide/running-a-validator).

## Buy License

Acquérez les licences requises pour exploiter une infrastructure réseau :

1. **Indiquez l'adresse à licencier.** Fournissez l'adresse `qor1…` à laquelle la licence doit être accordée on-chain — utilisez l'adresse avec laquelle vous exploiterez réellement le nœud, car c'est celle que le réseau vérifie.
2. **Choisissez un réseau de paiement.** Sélectionnez USDT sur ERC-20, BEP-20 ou TRC-20.
3. **Choisissez ce que vous achetez.** Une licence de nœud léger est disponible pour tout le monde. Les licences de validateur (dans l'ensemble du catalogue de niveaux) ne se débloquent qu'une fois votre [candidature de validateur](#validator-application) approuvée. Les compléments inter-réseaux étendent une licence de validateur à des chaînes supplémentaires, facturés par chaîne et par an — sélectionnez les chaînes souhaitées, puis achetez.
4. **Finalisez le paiement.** Chaque achat vous amène à une étape de paiement qui confirme le montant et le réseau, et vérifie le paiement on-chain avant que la licence ne soit marquée active dans nos registres.
5. **Attendez l'octroi on-chain, puis enregistrez-vous.** Une licence affichée comme active ici a été enregistrée de notre côté — l'octroi qui la rend reconnue on-chain est une étape distincte. L'enregistrement vérifie la chaîne, pas nos registres ; s'enregistrer avant que l'octroi n'ait eu lieu sera donc refusé. Une fois l'octroi confirmé, retournez à **Light Node** ou **Node Registration** pour finaliser l'enregistrement on-chain correspondant.

Pour comprendre le fonctionnement des licences à travers le réseau, voir [Licences de chaîne](/architecture/chain-licensing).
