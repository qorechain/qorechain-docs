---
slug: /dashboard/wallet
title: Portefeuille
sidebar_label: Portefeuille
sidebar_position: 3
---

# Portefeuille

La page **Portefeuille** est l'endroit où vous consultez votre solde et votre historique de transactions, recevez des QOR et en envoyez. Le fonctionnement de la page dépend du réseau :

- **Mainnet — non custodial.** Le Dashboard ne détient pas les clés mainnet. Vous connectez votre propre portefeuille (**Keplr** pour le rail Native, **MetaMask** pour le rail EVM), votre solde réel et votre historique sont lus directement depuis la chaîne, et vous pouvez recevoir des fonds sur n'importe quel rail. Les envois s'effectuent depuis votre propre portefeuille connecté.
- **Testnet — custodial.** Le Dashboard gère un portefeuille de test pour vous, afin que vous puissiez essayer les transferts, les échanges et le staking sans aucune configuration. Alimentez-le depuis le [Faucet](/dashboard/faucet).

Les comptes sont protégés par une cryptographie résistante au quantique, et l'encodage Native de chaque adresse utilise le préfixe bech32 `qor` (`qor1...`).

## Un compte, trois encodages {#one-account-three-encodings}

Un compte QoreChain est une identité unique qui peut s'écrire de trois façons — une par rail d'exécution :

| Rail | Encodage | Ressemble à |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | p. ex. `5Gv7...` |

Les trois encodages pointent vers le **même compte et le même solde**. Les fonds reçus sur n'importe quel rail arrivent dans votre solde unique, et le Dashboard indexe le solde et l'historique via l'encodage `qor1` (Native), de sorte que l'activité de tous les rails s'affiche ensemble.

## Utiliser le Portefeuille sur le mainnet {#mainnet}

1. Basculez l'en-tête du Dashboard sur **Mainnet**.
2. Si vous y êtes invité, acceptez la [reconnaissance des risques unique](/dashboard/overview#risk-acknowledgement) — le mainnet déplace des fonds réels, le Dashboard est non custodial et les transactions sont irréversibles.
3. Sélectionnez **Connect Wallet** et choisissez **Keplr** (rail Native) ou **MetaMask** (rail EVM), puis approuvez la connexion dans votre portefeuille.
4. La page charge votre solde réel et votre historique de transactions depuis la chaîne.

Si votre portefeuille n'a pas encore QoreChain configuré, ajoutez-le d'abord — voir [Ajouter QoreChain à votre portefeuille](#add-network).

### Envoyer sur le mainnet {#send-mainnet}

Comme le Dashboard ne détient jamais vos clés mainnet, les envois s'effectuent depuis votre propre portefeuille connecté : créez le transfert dans Keplr (rail Native) ou MetaMask (rail EVM) comme vous le feriez sur n'importe quel réseau, et signez-le à cet endroit. Le Dashboard affiche la transaction dans votre historique dès qu'elle est sur la chaîne.

:::caution Fonds réels, transferts irréversibles
Les transactions mainnet sont irréversibles. Vérifiez toujours deux fois l'adresse du destinataire dans votre portefeuille avant de signer.
:::

### Recevoir sur un rail spécifique {#receive-mainnet}

1. Sélectionnez **Receive**.
2. Dans la fenêtre de réception, choisissez un rail avec le sélecteur : **Native QOR**, **EVM** ou **SVM**.
3. La fenêtre affiche votre adresse dans l'encodage de ce rail (`qor1...`, `0x...` ou base58) avec un code QR et un bouton de copie.
4. Copiez l'adresse, ou laissez l'expéditeur scanner le code QR.

Quel que soit le rail utilisé par l'expéditeur, les fonds arrivent sur le même compte — un compte, trois encodages, un solde.

### Lire votre historique de transactions {#history}

Sur le mainnet, chaque ligne de votre historique affiche :

- Un **badge de rail** — Native, EVM ou SVM — indiquant quel rail la transaction a utilisé.
- Un **libellé du type réel de transaction**, comme *Send*, *PQC key registration* ou *contract deploy*, au lieu d'un libellé générique.
- Le montant, l'heure et le statut, avec le hash de transaction que vous pouvez ouvrir dans l'[Explorateur](/dashboard/explorer).

## Utiliser le Portefeuille sur le testnet {#testnet}

Sur le testnet (`qorechain-diana`), le Dashboard gère un portefeuille de test pour vous, afin que vous puissiez tester les flux de bout en bout sans rien connecter.

### Ce que la page affiche

- L'étiquette de votre portefeuille et l'adresse active, sous forme abrégée, avec un bouton de copie en un clic.
- Votre **solde total** en QOR.
- Un panneau de sécurité indiquant le chiffrement résistant au quantique et le réseau connecté.
- Un indicateur de dernière mise à jour avec une commande d'actualisation.
- Des onglets **Assets** et **Activity** affichant vos avoirs et votre historique de transactions.

Utilisez la commande d'actualisation à tout moment pour récupérer votre solde actuel et votre dernière activité depuis la chaîne.

### Envoyer des QOR (testnet)

1. Sélectionnez **Send**.
2. Saisissez l'adresse du destinataire (`qor1...`).
3. Saisissez le montant, et un mémo facultatif.
4. Vérifiez les détails et les frais estimés, puis confirmez.

Pendant que vous saisissez un destinataire, les contacts enregistrés et les adresses récentes vous sont suggérés pour vous aider à éviter les erreurs. Une fois le transfert soumis, vous recevez une confirmation avec le hash de transaction, que vous pouvez ouvrir dans l'[Explorateur](/dashboard/explorer).

### Recevoir des QOR (testnet)

1. Sélectionnez **Receive**.
2. Partagez votre adresse ou son code QR avec l'expéditeur, ou copiez l'adresse en un clic.
3. Saisissez éventuellement un montant demandé et un mémo pour générer un lien de paiement et un code QR téléchargeable.

### Gérer vos portefeuilles de test

Sélectionnez **My Wallets** pour ouvrir votre liste d'adresses. De là, vous pouvez basculer entre les portefeuilles, créer un nouveau portefeuille, importer un portefeuille existant ou supprimer un portefeuille dont vous n'avez plus besoin. Le portefeuille actif est celui utilisé pour les envois, les échanges, le staking et les autres actions signées dans tout le Dashboard sur le testnet.

## Ajouter QoreChain à votre portefeuille {#add-network}

La page **Add Network** affiche quatre cartes côte à côte — une par méthode de connexion — pour que vous puissiez ajouter QoreChain à votre propre portefeuille en un clic :

| Carte | Ce qu'elle vous apporte |
| --- | --- |
| **Native** | Les points de terminaison RPC et REST ainsi que l'ID de chaîne, chacun avec un bouton de copie — pour Keplr et les autres portefeuilles du rail Native. |
| **EVM** | Des paramètres réseau EIP-3085 prêts à l'emploi — un clic ajoute QoreChain à MetaMask et aux autres portefeuilles EVM. |
| **SVM** | L'URL RPC SVM pour les portefeuilles et outils compatibles SVM. |
| **WalletConnect** | Un appairage WalletConnect pour relier n'importe quel portefeuille compatible WalletConnect. |

Pour ajouter QoreChain :

1. Ouvrez la page **Add Network** depuis le Dashboard.
2. Choisissez la carte qui correspond au rail de votre portefeuille.
3. Sélectionnez le bouton d'ajout (EVM, WalletConnect), ou copiez les points de terminaison et l'ID de chaîne dans le formulaire d'ajout de réseau de votre portefeuille (Native, SVM).
4. Approuvez le nouveau réseau dans votre portefeuille.

Les points de terminaison publics sont `rpc.qore.host` (RPC Native), `api.qore.host` (REST), `evm.qore.host` (JSON-RPC EVM) et `svm.qore.host` (RPC SVM), avec des variantes `*-testnet` (par exemple `rpc-testnet.qore.host`) pour le testnet. IDs de chaîne : mainnet `qorechain-vladi` (ID de chaîne EVM `9801`), testnet `qorechain-diana` (ID de chaîne EVM `9800`).

## Pages associées

- [Token Operations](/user-guide/token-operations) — les concepts derrière les transferts de QOR et les dénominations.
- [Trade](/dashboard/trade) — échangez vos jetons sur l'AMM on-chain.
- [Bridge](/dashboard/bridge) — déplacez des actifs vers et depuis d'autres chaînes.
