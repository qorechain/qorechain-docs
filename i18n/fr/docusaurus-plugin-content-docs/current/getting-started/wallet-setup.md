---
slug: /getting-started/wallet-setup
title: Configuration du portefeuille
sidebar_label: Configuration du portefeuille
sidebar_position: 2
---

# Configuration du portefeuille

QoreChain prend en charge plusieurs types de portefeuilles dans ses environnements d'exécution natif, EVM et SVM. Choisissez le portefeuille qui correspond à votre cas d'usage.

:::note
Les identifiants de chaîne et les points de terminaison RPC ci-dessous ciblent le testnet **`qorechain-diana`** (EVM chain ID **9800**). Le mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) est en service depuis le 7 juin 2026 ; ses valeurs de connexion de portefeuille sont documentées sur la page distincte **Connexion au mainnet**.
:::

## Portefeuille Keplr

Keplr est le portefeuille recommandé pour les transactions natives QoreChain, le staking et la gouvernance.

### Ajouter QoreChain en tant que chaîne personnalisée

Ouvrez Keplr et accédez à **Settings > Add Custom Chain**, puis saisissez :

| Champ              | Valeur                    |
| ------------------ | ------------------------- |
| Chain Name         | `QoreChain Diana Testnet` |
| Chain ID           | `qorechain-diana`         |
| RPC URL            | `http://localhost:26657`  |
| REST URL           | `http://localhost:1317`   |
| Bech32 Prefix      | `qor`                     |
| Coin Denom         | `QOR`                     |
| Coin Minimal Denom | `uqor`                    |
| Decimals           | `6`                       |

Après avoir ajouté la chaîne, Keplr génère une adresse `qor1...` pour votre compte. Utilisez cette adresse pour recevoir des jetons QOR de testnet.

## MetaMask (EVM)

MetaMask permet d'interagir avec l'environnement d'exécution EVM de QoreChain — déployer des contrats Solidity, gérer des jetons ERC-20 et utiliser l'outillage Ethereum familier.

### Ajouter QoreChain en tant que réseau personnalisé

Ouvrez MetaMask et accédez à **Settings > Networks > Add Network**, puis saisissez :

| Champ           | Valeur                  |
| --------------- | ----------------------- |
| Network Name    | `QoreChain EVM`         |
| RPC URL         | `http://localhost:8545` |
| Chain ID        | `9800`                  |
| Currency Symbol | `QOR`                   |

Une fois connecté, vous pouvez utiliser MetaMask pour signer des transactions EVM, interagir avec des contrats intelligents déployés et gérer des jetons ERC-20 sur QoreChain.

## Portefeuilles Solana (SVM)

L'environnement d'exécution SVM de QoreChain est compatible avec l'outillage Solana standard. Connectez n'importe quel portefeuille ou bibliothèque compatible Solana pour interagir avec les programmes SVM.

### Utilisation de @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

const connection = new Connection("http://localhost:8899");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Cela permet le déploiement et l'interaction avec les programmes SVM s'exécutant sur QoreChain.

## Portefeuilles compatibles PQC (requis sur le chemin Cosmos)

QoreChain exige une cryptographie post-quantique (PQC) hybride sur le chemin de transaction Cosmos. À partir de la version actuelle de la chaîne (**v3.1.77**), la valeur par défaut du réseau est `hybrid_signature_mode = required` avec `allow_classical_fallback = false` — ainsi, **chaque transaction du chemin Cosmos doit comporter une signature ML-DSA-87 (Dilithium-5) en plus de la signature secp256k1 (ECDSA) standard**. Les transactions Cosmos uniquement classiques provenant d'un compte PQC sont rejetées.

:::caution Les transactions Cosmos requièrent l'extension hybride PQC
L'envoi d'une transaction purement classique sur le chemin Cosmos sera rejeté. Vous devez joindre la signature Dilithium-5 en tant qu'extension de transaction `PQCHybridSignature`. L'outillage standard CosmJS / Keplr ne produit pas cette extension par lui-même — utilisez la commande CLI `qorechaind tx pqc cosign`, la signature hybride du QoreChain SDK (voir ci-dessous), ou, pour la construire vous-même dans le code, la bibliothèque open source [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`). Les seules exemptions sont les gentxs de genesis et les transactions d'enregistrement/migration de clé PQC.
:::

### Comment ça fonctionne

Les portefeuilles joignent une signature PQC ML-DSA-87 en tant qu'extension de transaction, aux côtés de la signature secp256k1 (ECDSA) standard. La signature classique est calculée sur des octets à signer qui excluent l'extension, de sorte qu'elle reste valide pour la vérification classique tandis que la signature PQC assure la résistance quantique.

### Générer une clé Dilithium-5

Générez une clé post-quantique pour la signature hybride :

```bash
qorechaind tx pqc gen-key
```

### Enregistrement automatique

Lorsque vous incluez une clé publique PQC dans votre première transaction, QoreChain l'enregistre automatiquement on-chain. Aucune étape d'enregistrement distincte n'est nécessaire. (Les transactions d'enregistrement/migration de clé PQC sont elles-mêmes exemptées de l'exigence hybride, de sorte qu'un compte peut amorcer sa première clé.)

### Signature hybride avec le SDK

Le QoreChain SDK produit des transactions Cosmos conformes via `buildHybridTx` avec `includePqcPublicKey: true`, qui joint l'extension Dilithium-5 et intègre la clé publique pour l'enregistrement automatique. Voir [Comptes SDK et signature PQC](/sdk/concepts/accounts-pqc).

### Modes PQC

Les trois modes d'application restent contrôlés par la gouvernance ; la **valeur par défaut actuelle du réseau est Required** :

| Mode                   | Description                                                                       |
| ---------------------- | -------------------------------------------------------------------------------- |
| **Disabled**           | La vérification PQC est désactivée. Signatures standard uniquement.              |
| **Optional**           | Les transactions peuvent inclure des signatures PQC. Si présentes, elles sont vérifiées. |
| **Required** (par défaut) | Toutes les transactions du chemin Cosmos doivent inclure une signature PQC valide. |

Le mode actif est configuré au niveau de la chaîne et peut être mis à jour via la gouvernance.

:::note EVM / MetaMask non affecté
Le flux MetaMask (EVM) ci-dessus n'est **pas** affecté par l'exigence hybride. Les transactions EVM utilisent un chemin ante `eth_secp256k1` distinct et n'ont jamais besoin de l'extension PQC.
:::

## Portefeuille CLI

Le binaire `qorechaind` inclut un système intégré de gestion de clés pour l'usage en ligne de commande.

### Créer une nouvelle clé

```bash
qorechaind keys add mykey
```

Cela génère une nouvelle paire de clés et affiche la phrase mnémonique. **Conservez la phrase mnémonique en lieu sûr** — c'est le seul moyen de récupérer cette clé.

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

Vous serez invité à saisir votre phrase mnémonique.

## Étapes suivantes

* [Votre première transaction](/getting-started/first-transaction) — Envoyez des jetons QOR avec votre nouveau portefeuille
* [Connexion au testnet](/getting-started/connecting-to-testnet) — Rejoignez le testnet Diana en service
