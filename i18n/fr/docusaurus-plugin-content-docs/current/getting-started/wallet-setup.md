---
slug: /getting-started/wallet-setup
title: Configuration du portefeuille
sidebar_label: Configuration du portefeuille
sidebar_position: 2
---

# Configuration du portefeuille

QoreChain prend en charge plusieurs types de portefeuilles dans ses environnements d'exécution natif, EVM et SVM. Choisissez le portefeuille adapté à votre cas d'usage.

:::note
Les valeurs ci-dessous couvrent à la fois le mainnet **`qorechain-vladi`** (ID de chaîne EVM **9801**, actif depuis le 7 juin 2026, version v3.2.5 depuis le 29 octobre 2026) et le testnet **`qorechain-diana`** (ID de chaîne EVM **9800**, version v3.2.6 depuis le 27 octobre 2026). Les points de terminaison publics des deux réseaux sont répertoriés dans [Réseaux](/appendix/networks#public-endpoints).
:::

## QoreX (recommandé) {#qorex}

**QoreX** est le portefeuille QoreChain officiel et non custodial — une application mobile (Android, iOS) et une extension de navigateur (Chrome, Firefox, Safari sur macOS). Il signe chaque transfert de la voie native avec la signature post-quantique hybride obligatoire, enregistre votre clé post-quantique pour vous, prend en charge le staking, les @handles et les réseaux externes, et s'associe au Dashboard. Il ouvre également la [fenêtre d'autorisation EVM](/getting-started/first-transaction#evm-window) dont ont besoin les transactions MetaMask. Commencez par le [guide QoreX](/qorex/overview) et [Premiers pas](/qorex/getting-started).

## Portefeuille Keplr

Keplr peut ajouter QoreChain comme chaîne personnalisée (ci-dessous) afin de consulter les soldes et de recevoir des fonds sur la voie native. Comme QoreChain exige une co-signature post-quantique sur la voie native, envoyez, stakez et votez avec un portefeuille compatible PQC tel que [QoreX](/qorex/overview) plutôt qu'avec Keplr seul.

### Ajouter QoreChain comme chaîne personnalisée

Ouvrez Keplr, accédez à **Settings > Add Custom Chain** (Paramètres > Ajouter une chaîne personnalisée), puis saisissez :

| Champ              | Mainnet                    | Testnet                          |
| ------------------ | -------------------------- | -------------------------------- |
| Nom de la chaîne         | `QoreChain`                | `QoreChain Diana Testnet`        |
| ID de la chaîne           | `qorechain-vladi`          | `qorechain-diana`                |
| URL RPC            | `https://rpc.qore.host`    | `https://rpc-testnet.qore.host`  |
| URL REST           | `https://api.qore.host`    | `https://api-testnet.qore.host`  |
| Préfixe Bech32      | `qor`                      | `qor`                            |
| Dénomination de la devise         | `QOR`                      | `QOR`                            |
| Dénomination minimale de la devise | `uqor`                     | `uqor`                           |
| Décimales           | `6`                        | `6`                              |
| Type de devise (BIP-44) | `118`                      | `118`                            |

Une fois la chaîne ajoutée, Keplr génère une adresse `qor1...` pour votre compte.

:::caution Seuil minimal du prix du gas
Le prix de gas minimum du réseau est de **0.1uqor**. Si vous configurez les paliers de prix de gas de Keplr (par exemple via `suggestChain`), utilisez des valeurs **égales ou supérieures à 0.1** (bas/moyen/élevé suggérés : `0.1 / 0.15 / 0.25`) — les transactions signées en dessous de ce seuil sont rejetées.
:::

## MetaMask (EVM)

MetaMask permet d'interagir avec l'environnement d'exécution EVM de QoreChain — déployez des contrats Solidity, gérez des tokens ERC-20 et utilisez les outils Ethereum habituels.

### Ajouter QoreChain comme réseau personnalisé

Ouvrez MetaMask, accédez à **Settings > Networks > Add Network** (Paramètres > Réseaux > Ajouter un réseau), puis saisissez :

| Champ              | Mainnet                   | Testnet                          |
| ------------------ | ------------------------- | -------------------------------- |
| Nom du réseau       | `QoreChain`               | `QoreChain Diana Testnet`        |
| URL RPC            | `https://evm.qore.host`   | `https://evm-testnet.qore.host`  |
| ID de la chaîne           | `9801`                    | `9800`                           |
| Symbole de la devise    | `QOR`                     | `QOR`                            |
| URL de l'explorateur de blocs | `https://explore.qore.network` | `https://explore.qore.network` |

Le QOR natif possède **18 décimales** sur l'interface EVM (façon wei). Une fois connecté, vous pouvez utiliser MetaMask pour signer des transactions EVM, interagir avec des contrats intelligents déployés et gérer des tokens ERC-20 sur QoreChain.

:::caution EVM / MetaMask nécessite une clé PQC et une fenêtre ouverte
MetaMask signe toujours normalement, mais la voie EVM n'admet des transactions que depuis un compte disposant d'une clé post-quantique enregistrée et d'une **fenêtre d'autorisation EVM** ouverte (v3.2.0 et versions ultérieures). Enregistrez votre clé une seule fois, puis ouvrez une fenêtre avant une session d'activité EVM — consultez [Fenêtre d'autorisation EVM](/getting-started/first-transaction#evm-window). MetaMask ne peut pas ouvrir la fenêtre lui-même ; ouvrez-la dans [QoreX](/qorex/security-and-recovery#evm-window) ou avec la CLI. L'ajout du réseau à MetaMask (ci-dessus) reste inchangé.
:::

### Enregistrement du réseau en un seul appel

Pour les dApps, le paquet **`@qorechain/wallet-adapter`** (publié sur npm) enregistre QoreChain auprès du portefeuille de l'utilisateur en un seul appel — en invitant MetaMask à ajouter le réseau via EIP-3085 (avec le QOR natif à **18 décimales** correct sur le rail EVM) — et fournit `qoreChainInfo` pour la suggestion de chaîne Keplr (y compris le palier de prix de gas) :

```bash
npm install @qorechain/wallet-adapter
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

// pass the EIP-1193 provider and the network parameters (rpcUrl is required)
await addQoreEvmToWallet(window.ethereum, {
  evmChainId: 9801,                       // 9800 for the testnet
  rpcUrl: "https://evm.qore.host",        // https://evm-testnet.qore.host for the testnet
  explorerUrl: "https://explore.qore.network",
  testnet: false,                         // true for the testnet
});
```

## Un compte, trois adresses (comptes unifiés) {#unified-accounts}

Depuis la version de chaîne **v3.1.83**, un compte QoreChain est **une identité unique de 20 octets avec trois encodages** : `qor1…` (Natif), `0x…` (EVM) et une forme base58 (SVM). Il possède **un seul solde** et — pour les comptes eth-natifs — **signe sur les trois voies avec une seule clé**, y compris la signature hybride post-quantique requise sur la voie native.

Générez un portefeuille unifié en code avec `@qorechain/wallet-adapter` :

```js
import { generateQoreWallet } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();          // or walletFromMnemonic(mnemonic)
console.log(w.cosmos);                         // qor1...
console.log(w.evm);                            // 0x... (same identity)
console.log(w.svm);                            // base58 (same identity)
// Native-lane sends use signHybridEth (classical eth_secp256k1 + ML-DSA-87 hybrid); pass `rest` so the sign-bytes form is resolved.
```

Les fonds envoyés vers l'une des trois formes atterrissent dans le même solde.

## Portefeuilles liés : Phantom et MetaMask comme clés de dépense {#linked-wallets}

:::caution Désactivé sur le mainnet, activé sur le testnet
Les fonctionnalités de compte intelligent et de portefeuille lié sont implémentées mais **désactivées sur le mainnet** (`abstractaccount.enabled = false`) : l'enregistrement d'un authentificateur et l'exécution via l'un d'eux y sont refusés tant que l'indicateur est désactivé. Elles sont **activées sur le testnet** (`enabled = true`, vérifié le 27 octobre 2026) ; vous pouvez donc y essayer un flux de liaison. Vérifiez `GET /qorechain/abstractaccount/v1/config` sur le réseau visé avant de proposer un flux de liaison. La section ci-dessous décrit le comportement prévu.
:::

Conçu pour que vous n'ayez pas à exposer votre clé racine pour dépenser depuis un compte QoreChain dans une dApp (introduit dans la version de chaîne **v3.1.85**) : une clé **Phantom** (ed25519) ou **MetaMask** (via son adresse Ethereum, par `personal_sign`) peut être **enregistrée comme authentificateur** sur votre compte — avec des permissions limitées, des plafonds de dépense, une expiration et une révocation instantanée — puis autoriser des transferts relayés par le backend de la dApp. Consultez [Authentificateurs de portefeuilles liés](/developer-guide/account-abstraction#authenticators) pour le modèle complet et le code, ainsi que le [guide des authentificateurs du SDK](/sdk/guides/authenticators) pour des exemples de bout en bout.

## Portefeuilles Solana (SVM)

:::caution La soumission de transactions SVM est actuellement désactivée
La voie d'exécution SVM est **actuellement désactivée à l'échelle du réseau pour la soumission de transactions** — n'envoyez pas de transactions via un portefeuille compatible Solana vers QoreChain pour le moment. La lecture des soldes/slots peut encore fonctionner ; consultez [Développement SVM](/developer-guide/svm-development) pour le statut actuel.
:::

L'environnement d'exécution SVM de QoreChain est compatible avec les outils Solana standard, et le **solde en QOR natif du compte est visible directement sur l'interface SVM** (en lamports, 9 décimales ; 1 uqor = 1 000 lamports). Connectez n'importe quel portefeuille ou bibliothèque compatible Solana.

### Utilisation de @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Les points de terminaison SVM publics sont **en lecture seule** ; la soumission de transactions nécessite votre propre nœud. Consultez [Développement SVM](/developer-guide/svm-development) pour plus de détails.

## Portefeuilles compatibles PQC (requis sur la voie Cosmos)

QoreChain exige une cryptographie post-quantique (PQC) hybride sur la voie de transaction cosmos. Sur les réseaux en production (v3.2.x), la valeur par défaut du réseau est `hybrid_signature_mode = required` avec `allow_classical_fallback = false` — ainsi **chaque transaction sur la voie cosmos doit porter une signature ML-DSA-87 (Dilithium-5) en plus de la signature secp256k1 (ECDSA) standard**. Les transactions cosmos purement classiques provenant d'un compte PQC sont rejetées.

:::caution Les transactions Cosmos nécessitent l'extension PQC hybride
L'envoi d'une transaction purement classique sur la voie cosmos sera rejeté. Vous devez joindre la signature Dilithium-5 en tant qu'extension de transaction `PQCHybridSignature`. Les outils CosmJS / Keplr standard ne produisent pas cette extension par eux-mêmes — utilisez la commande CLI `qorechaind tx pqc cosign`, la signature hybride du SDK QoreChain (voir ci-dessous), ou, pour la construire vous-même en code, la bibliothèque open source [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`). Les seules exemptions sont les gentxs de genèse, les transactions d'enregistrement/migration de clé PQC, et un unjail depuis un compte opérateur qui n'a aucune clé enregistrée.
:::

### Fonctionnement

Les portefeuilles joignent une signature PQC ML-DSA-87 en tant qu'extension de transaction, en plus de la signature secp256k1 (ECDSA) standard. La signature classique est calculée sur des octets de signature qui excluent l'extension, de sorte qu'elle reste valide pour la vérification classique tandis que la signature PQC apporte la résistance quantique.

### Générer une clé Dilithium-5

Générez une clé post-quantique pour la signature hybride :

```bash
qorechaind tx pqc gen-key mypqc
```

La commande prend un nom de clé et stocke la clé sous `~/.qorechaind/pqc/<name>.dilithium` (mode `0600`, non chiffrée). Elle nécessite le binaire de version officiel `qorechaind`.

### Enregistrer votre clé (une seule fois) {#register-your-key}

Une clé post-quantique est **enregistrée explicitement**, une seule fois par compte, au moyen d'une transaction d'enregistrement de clé. Cette unique transaction (ainsi que la migration de clé) peut être signée de manière classique afin qu'un tout nouveau compte puisse s'amorcer ; ensuite, chaque transaction de la voie Cosmos doit porter la signature hybride.

```bash
# register the public key printed by gen-key for your account
qorechaind tx pqc register-key <public_key_hex> hybrid --from mykey \
  --chain-id qorechain-vladi --gas 600000 --fees 60000uqor
```

Depuis la v3.2.3, vous pouvez joindre une preuve de possession facultative en enregistrant avec `qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --pqc-key mypqc --from mykey ...` ; la chaîne refuse aussi les clés faibles, dégénérées ou déjà utilisées. Sauvegardez le fichier de clé PQC aussi soigneusement que votre phrase mnémotechnique. (Une clé peut être re-dérivée à partir de la phrase mnémotechnique avec `qorechaind tx pqc recover-key`, et remplacée avec `tx pqc rotate-key`.) QoreX et le SDK QoreChain enregistrent la clé pour vous. Consultez [Première transaction](/getting-started/first-transaction#register-pqc-key) pour un envoi signé complet.

### Signature hybride avec le SDK

Le SDK QoreChain produit des transactions de la voie Cosmos conformes via `buildHybridTx`, qui joint l'extension Dilithium-5. La clé du compte doit déjà être enregistrée (voir ci-dessus). Consultez [Comptes SDK et signature PQC](/sdk/concepts/accounts-pqc).

### Modes PQC

Les trois modes d'application restent contrôlés par la gouvernance ; **le mode par défaut actuel du réseau est Required** :

| Mode                   | Description                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| **Disabled**           | La vérification PQC est désactivée. Signatures standard uniquement.               |
| **Optional**           | Les transactions peuvent inclure des signatures PQC. Si elles sont présentes, elles sont vérifiées. |
| **Required** (par défaut) | Toutes les transactions sur la voie cosmos doivent inclure une signature PQC valide.        |

Le mode actif est configuré au niveau de la chaîne et peut être mis à jour par la gouvernance.

:::caution EVM / MetaMask nécessite une clé PQC et une fenêtre ouverte
Le flux MetaMask (EVM) ci-dessus ne porte pas l'extension hybride, mais depuis la v3.2.0, la voie EVM n'admet des transactions que depuis un compte disposant d'une clé post-quantique enregistrée et d'une **fenêtre d'autorisation EVM** ouverte. Consultez [Fenêtre d'autorisation EVM](/getting-started/first-transaction#evm-window).
:::

## Portefeuille CLI

Le binaire `qorechaind` inclut un système de gestion de clés intégré pour une utilisation en ligne de commande.

### Créer une nouvelle clé

```bash
qorechaind keys add mykey
```

Cela génère une nouvelle paire de clés et affiche la phrase mnémotechnique. **Conservez la phrase mnémotechnique en lieu sûr** — c'est le seul moyen de récupérer cette clé.

### Afficher votre adresse

```bash
qorechaind keys show mykey -a
```

Cela affiche votre adresse bech32 `qor1...`.

### Lister toutes les clés

```bash
qorechaind keys list
```

### Importer une clé existante

```bash
qorechaind keys add mykey --recover
```

Vous serez invité à saisir votre phrase mnémotechnique.

## Prochaines étapes

* [Votre première transaction](/getting-started/first-transaction) — Envoyez des tokens QOR avec votre nouveau portefeuille
* [Connexion au testnet](/getting-started/connecting-to-testnet) — Rejoignez le testnet Diana en direct
