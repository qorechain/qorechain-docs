---
slug: /getting-started/wallet-setup
title: Configuration du portefeuille
sidebar_label: Configuration du portefeuille
sidebar_position: 2
---

# Configuration du portefeuille

QoreChain prend en charge plusieurs types de portefeuilles à travers ses environnements d'exécution natif, EVM et SVM. Choisissez le portefeuille qui correspond à votre cas d'usage.

:::note
Les valeurs ci-dessous couvrent à la fois le mainnet **`qorechain-vladi`** (ID de chaîne EVM **9801**, en production depuis le 7 juin 2026) et le testnet **`qorechain-diana`** (ID de chaîne EVM **9800**). Les points de terminaison publics des deux réseaux sont listés dans [Réseaux](/appendix/networks#public-endpoints).
:::

## Portefeuille Keplr

Keplr est le portefeuille recommandé pour les transactions natives QoreChain, le staking et la gouvernance.

### Ajouter QoreChain comme chaîne personnalisée

Ouvrez Keplr et rendez-vous dans **Settings > Add Custom Chain**, puis saisissez :

| Champ                    | Mainnet                    | Testnet                          |
| ------------------------ | -------------------------- | -------------------------------- |
| Nom de la chaîne         | `QoreChain`                | `QoreChain Diana Testnet`        |
| ID de chaîne             | `qorechain-vladi`          | `qorechain-diana`                |
| URL RPC                  | `https://rpc.qore.host`    | `https://rpc-testnet.qore.host`  |
| URL REST                 | `https://api.qore.host`    | `https://api-testnet.qore.host`  |
| Préfixe Bech32           | `qor`                      | `qor`                            |
| Dénomination du jeton    | `QOR`                      | `QOR`                            |
| Dénomination minimale    | `uqor`                     | `uqor`                           |
| Décimales                | `6`                        | `6`                              |
| Coin Type (BIP-44)       | `118`                      | `118`                            |

Une fois la chaîne ajoutée, Keplr génère une adresse `qor1...` pour votre compte.

:::caution Prix du gaz minimum
Le prix du gaz minimum du réseau est de **0.1uqor**. Si vous configurez les paliers de prix du gaz de Keplr (par exemple via `suggestChain`), utilisez des valeurs **supérieures ou égales à 0.1** (valeurs basse/moyenne/haute suggérées : `0.1 / 0.15 / 0.25`) — les transactions signées en dessous de ce seuil sont rejetées.
:::

## MetaMask (EVM)

MetaMask permet d'interagir avec l'environnement d'exécution EVM de QoreChain — déployer des contrats Solidity, gérer des jetons ERC-20 et utiliser l'outillage Ethereum habituel.

### Ajouter QoreChain comme réseau personnalisé

Ouvrez MetaMask et rendez-vous dans **Settings > Networks > Add Network**, puis saisissez :

| Champ                      | Mainnet                   | Testnet                          |
| -------------------------- | ------------------------- | -------------------------------- |
| Nom du réseau              | `QoreChain`               | `QoreChain Diana Testnet`        |
| URL RPC                    | `https://evm.qore.host`   | `https://evm-testnet.qore.host`  |
| ID de chaîne               | `9801`                    | `9800`                           |
| Symbole de la devise       | `QOR`                     | `QOR`                            |
| URL de l'explorateur de blocs | `https://explore.qore.network` | `https://explore.qore.network` |

Le QOR natif possède **18 décimales** sur l'interface EVM (à la manière du wei). Une fois connecté, vous pouvez utiliser MetaMask pour signer des transactions EVM, interagir avec des contrats intelligents déployés et gérer des jetons ERC-20 sur QoreChain.

### Enregistrement du réseau en un seul appel

Pour les dApps, les paquets **`@qorechain/wallet-adapter`** et **`@qorechain/connect`** (publiés sur npm) enregistrent QoreChain auprès du portefeuille de l'utilisateur en un seul appel — en invitant MetaMask à ajouter le réseau via EIP-3085 (avec le QOR natif à **18 décimales** correct sur le rail EVM) et en configurant le palier de prix du gaz de Keplr :

```bash
npm install @qorechain/wallet-adapter @qorechain/connect
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

await addQoreEvmToWallet(); // prompts MetaMask with QoreChain's EVM network params
```

## Un compte, trois adresses (comptes unifiés) {#unified-accounts}

Depuis la version de chaîne **v3.1.83**, un compte QoreChain est **une identité unique de 20 octets avec trois encodages** : `qor1…` (Native), `0x…` (EVM) et une forme base58 (SVM). Il détient **un solde unique** et — pour les comptes eth-natifs — **signe sur les trois voies avec une seule clé**, y compris la signature hybride post-quantique requise sur le chemin Native.

Générez un portefeuille unifié en code avec `@qorechain/wallet-adapter` :

```js
import { generateQoreWallet } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();          // or walletFromMnemonic(mnemonic)
console.log(w.addresses.cosmos);               // qor1...
console.log(w.addresses.evm);                  // 0x... (same identity)
console.log(w.addresses.svm);                  // base58 (same identity)
// Native-lane sends use signHybridEth (classical eth_secp256k1 + ML-DSA-87 hybrid).
```

Les fonds envoyés vers n'importe laquelle des trois formes arrivent sur le même solde.

## Portefeuilles liés : Phantom et MetaMask comme clés de dépense {#linked-wallets}

Depuis la version de chaîne **v3.1.85**, vous n'avez plus besoin d'exposer votre clé racine pour dépenser depuis un compte QoreChain dans une dApp. Une clé **Phantom** (ed25519) ou **MetaMask** (par son adresse Ethereum, via `personal_sign`) peut être **enregistrée comme authentificateur** sur votre compte — avec des permissions à portée limitée, des plafonds de dépense, une date d'expiration et une révocation instantanée — puis autoriser des transferts relayés par le backend de la dApp. Consultez [Authentificateurs de portefeuilles liés](/developer-guide/account-abstraction#authenticators) pour le modèle complet et le code, ainsi que le [guide Authentificateurs du SDK](/sdk/guides/authenticators) pour des exemples de bout en bout.

## Portefeuilles Solana (SVM)

L'environnement d'exécution SVM de QoreChain est compatible avec l'outillage Solana standard, et le **solde de QOR natif du compte est visible directement sur l'interface SVM** (en lamports, 9 décimales ; 1 uqor = 1 000 lamports). Connectez n'importe quel portefeuille ou bibliothèque compatible Solana.

### Utiliser @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Les points de terminaison SVM publics sont **en lecture seule** ; la soumission de transactions nécessite votre propre nœud. Consultez [Développement SVM](/developer-guide/svm-development) pour plus de détails.

## Portefeuilles compatibles PQC (obligatoires sur le chemin Cosmos)

QoreChain exige la cryptographie post-quantique (PQC) hybride sur le chemin de transaction cosmos. Depuis la version de chaîne actuelle (**v3.1.82**), le paramètre par défaut du réseau est `hybrid_signature_mode = required` avec `allow_classical_fallback = false` — ainsi, **chaque transaction sur le chemin cosmos doit porter une signature ML-DSA-87 (Dilithium-5) en plus de la signature secp256k1 (ECDSA) standard**. Les transactions cosmos uniquement classiques provenant d'un compte PQC sont rejetées.

:::caution Les transactions Cosmos exigent l'extension PQC hybride
L'envoi d'une transaction classique simple sur le chemin cosmos sera rejeté. Vous devez joindre la signature Dilithium-5 en tant qu'extension de transaction `PQCHybridSignature`. L'outillage standard CosmJS / Keplr ne produit pas cette extension par lui-même — utilisez la commande CLI `qorechaind tx pqc cosign`, la signature hybride du SDK QoreChain (voir ci-dessous) ou, pour la construire vous-même en code, la bibliothèque open source [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`). Les seules exemptions sont les gentxs de genèse et les transactions d'enregistrement/de migration de clé PQC.
:::

### Fonctionnement

Les portefeuilles joignent une signature PQC ML-DSA-87 en tant qu'extension de transaction, en plus de la signature secp256k1 (ECDSA) standard. La signature classique est calculée sur des octets de signature qui excluent l'extension, de sorte qu'elle reste valide pour la vérification classique tandis que la signature PQC apporte la résistance quantique.

### Générer une clé Dilithium-5

Générez une clé post-quantique pour la signature hybride :

```bash
qorechaind tx pqc gen-key
```

### Enregistrement automatique

Lorsque vous incluez une clé publique PQC dans votre première transaction, QoreChain l'enregistre automatiquement sur la chaîne. Aucune étape d'enregistrement séparée n'est nécessaire. (Les transactions d'enregistrement/de migration de clé PQC sont elles-mêmes exemptées de l'exigence hybride, ce qui permet à un compte d'amorcer sa première clé.)

### Signature hybride avec le SDK

Le SDK QoreChain produit des transactions cosmos conformes via `buildHybridTx` avec `includePqcPublicKey: true`, qui joint l'extension Dilithium-5 et embarque la clé publique pour l'enregistrement automatique. Consultez [SDK Accounts & PQC signing](/sdk/concepts/accounts-pqc).

### Modes PQC

Les trois modes d'application restent contrôlés par la gouvernance ; le **paramètre par défaut actuel du réseau est Required** :

| Mode                       | Description                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------- |
| **Disabled**               | La vérification PQC est désactivée. Signatures standard uniquement.                |
| **Optional**               | Les transactions peuvent inclure des signatures PQC. Si présentes, elles sont vérifiées. |
| **Required** (par défaut)  | Toutes les transactions du chemin cosmos doivent inclure une signature PQC valide. |

Le mode actif est configuré au niveau de la chaîne et peut être mis à jour via la gouvernance.

:::note EVM / MetaMask non concernés
Le flux MetaMask (EVM) ci-dessus n'est **pas** concerné par l'exigence hybride. Les transactions EVM utilisent un chemin ante `eth_secp256k1` distinct et n'ont jamais besoin de l'extension PQC.
:::

## Portefeuille CLI

Le binaire `qorechaind` inclut un système de gestion de clés intégré pour un usage en ligne de commande.

### Créer une nouvelle clé

```bash
qorechaind keys add mykey
```

Cette commande génère une nouvelle paire de clés et affiche la phrase mnémonique. **Conservez la mnémonique en lieu sûr** — c'est le seul moyen de récupérer cette clé.

### Afficher votre adresse

```bash
qorechaind keys show mykey -a
```

Cette commande affiche votre adresse bech32 `qor1...`.

### Lister toutes les clés

```bash
qorechaind keys list
```

### Importer une clé existante

```bash
qorechaind keys add mykey --recover
```

Vous serez invité à saisir votre phrase mnémonique.

## Prochaines étapes

* [Votre première transaction](/getting-started/first-transaction) — Envoyez des jetons QOR avec votre nouveau portefeuille
* [Se connecter au testnet](/getting-started/connecting-to-testnet) — Rejoignez le testnet Diana en production
