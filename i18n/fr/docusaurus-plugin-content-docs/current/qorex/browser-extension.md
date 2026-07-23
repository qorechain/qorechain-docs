---
slug: /qorex/browser-extension
title: Extension de navigateur
sidebar_label: Extension de navigateur
sidebar_position: 8
---

# Extension de navigateur

L'**extension de navigateur** QoreX est le **connecteur dApp** pour ordinateur de bureau. Elle fonctionne sur **Chrome et Firefox**, et une version **Safari** est livrée à partir de la même base de code (empaquetée avec l'enveloppe d'extension web Safari d'Apple — sur Safari, les approbations s'ouvrent dans un onglet du navigateur plutôt que dans une fenêtre contextuelle). Elle permet aux sites web de détecter votre portefeuille et transforme chaque requête en une approbation explicite. Elle s'associe conceptuellement à l'application mobile et n'inclut **pas** les fonctionnalités de staking, de portefeuille ou de compte — celles-ci résident dans l'application.

## Configuration

L'extension s'associe à un portefeuille créé dans l'**application mobile QoreX**. Si vous ouvrez la fenêtre contextuelle avant l'association, elle affiche **« Pas encore de portefeuille — créez-en un dans l'application QoreX. »**

## Déverrouillage

La fenêtre contextuelle demande votre **mot de passe de coffre** (ou une clé d'accès lorsque le navigateur prend en charge les clés dérivées de passkey). Le coffre est chiffré en AES-256-GCM dans le stockage de l'extension, il se verrouille automatiquement, et chaque déverrouillage est explicite.

## Connexion aux dApps

Les sites web détectent QoreX via **EIP-6963** (le standard multi-portefeuilles) et le contrat de connexion QoreChain. QoreX **n'écrase jamais** `window.ethereum` ni `window.keplr` — il apparaît **à côté** des autres portefeuilles, et vous choisissez quel portefeuille utiliser pour chaque site.

1. Un site demande une connexion ; la fenêtre contextuelle d'approbation affiche l'**origine**.
2. L'approbation ne révèle que votre **adresse publique** à cette origine.
3. Les approbations sont **par origine**, persistent au redémarrage du navigateur, et l'approbation d'un site n'accorde rien à un autre.

## Signature

Chaque demande de signature ouvre une fenêtre d'approbation affichant la **charge utile décodée** — destinataire, montant, réseau — jamais un simple hachage.

- Pour les transactions QoreChain sur la voie Native, l'extension signale que la **dApp fournit la couche post-quantique** (le portefeuille signe la moitié classique — le même schéma qu'utilisent les portefeuilles établis).
- Si une requête est **classique uniquement**, la fenêtre contextuelle affiche un avertissement explicite : **« ⚠ Cette requête est une signature classique — l'application n'a pas ajouté de couche résistante au quantique. »**
- **Rejeter** ne demande toujours qu'un seul clic, et les requêtes expirent d'elles-mêmes.

## Envoi sur des réseaux externes

Depuis la fenêtre contextuelle, vous pouvez envoyer des jetons **ETH / BNB / POL / ARB / SOL** ainsi que **ERC-20 / SPL** (les mêmes dérivations de graine que l'application). Vous devez accepter la note relative à la signature classique avant l'envoi ; un lien de résultat ouvre l'explorateur de blocs.

## Réseaux et posture de sécurité

- **Réseau actif** — QoreChain **mainnet** par défaut (chaîne `0x2649` sur la voie EVM). Le testnet reste pris en charge pour les dApps qui le demandent, et les demandes de signature inter-réseaux sont refusées.
- **Autorisations** — l'extension ne demande que **`storage`**. Le script de contenu n'injecte que les API du fournisseur ; il ne lit pas le contenu de la page au-delà des requêtes du portefeuille, et il n'y a ni analytique ni code distant.
