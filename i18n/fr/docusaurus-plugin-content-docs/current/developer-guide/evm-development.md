---
slug: /developer-guide/evm-development
title: Développement EVM
sidebar_label: Développement EVM
sidebar_position: 2
---

# Développement EVM

QoreChain exécute un environnement d'exécution entièrement compatible EVM sur le QoreChain EVM Engine, ce qui vous permet de déployer des contrats intelligents Solidity et d'interagir avec eux à l'aide d'outils familiers. Le module EVM expose une interface JSON-RPC sur le **port 8545** (WebSocket sur le **8546**) qui prend en charge les flux de travail de développement Ethereum standard.

:::note
Les exemples ci-dessous ciblent le mainnet **`qorechain-vladi`** (EVM chain ID **9801**), en service depuis le 7 juin 2026 et exécutant la version de chaîne **v3.1.77**. Pour le testnet **`qorechain-diana`**, utilisez l'EVM chain ID **9800**.
:::

---

## Point de terminaison JSON-RPC

| Propriété             | Valeur                                     |
| -------------------- | ------------------------------------------ |
| URL par défaut       | `http://localhost:8545`                    |
| URL WebSocket        | `ws://localhost:8546`                      |
| Espaces de noms pris en charge | `eth_`, `web3_`, `net_`, `txpool_`, `qor_` |
| Chain ID (mainnet)   | `9801` (`qorechain-vladi`)                 |
| Chain ID (testnet)   | `9800` (`qorechain-diana`)                 |
| Symbole de la devise | `QOR`                                      |

L'espace de noms `qor_` fournit des méthodes spécifiques à QoreChain. Voir [Espace de noms personnalisé](#custom-qor_-namespace) ci-dessous.

---

## Configuration du portefeuille (MetaMask)

Ajoutez QoreChain comme réseau personnalisé dans MetaMask :

| Champ              | Valeur mainnet            | Valeur testnet          |
| ------------------ | ------------------------- | ----------------------- |
| Nom du réseau      | QoreChain (qorechain-vladi) | QoreChain Diana       |
| URL RPC            | `http://localhost:8545`   | `http://localhost:8545` |
| Chain ID           | `9801`                    | `9800`                  |
| Symbole de la devise | `QOR`                   | `QOR`                   |
| URL de l'explorateur de blocs | *(utilisez l'explorateur officiel du mainnet)* | *(laisser vide pour un testnet local)* |

---

## Hardhat

Installez Hardhat et configurez votre `hardhat.config.js` :

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    qorechain: {
      url: "http://localhost:8545",
      accounts: ["0xYOUR_PRIVATE_KEY_HEX"],
      chainId: 9801, // mainnet qorechain-vladi (use 9800 for qorechain-diana testnet)
    },
  },
};
```

Déployez un contrat :

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

Exécutez les tests sur l'EVM de QoreChain :

```bash
npx hardhat test --network qorechain
```

---

## Foundry

Créez et déployez un contrat avec Foundry :

```bash
# Create a new project
forge init my-project && cd my-project

# Build
forge build

# Deploy
forge create --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX \
  src/MyContract.sol:MyContract

# Interact
cast call <contract-address> "myFunction()" --rpc-url http://localhost:8545
cast send <contract-address> "setValue(uint256)" 42 \
  --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX
```

---

## Ethers.js

```javascript
import { ethers } from "ethers";

// Connect to QoreChain EVM
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get chain info
const network = await provider.getNetwork();
console.log("Chain ID:", network.chainId); // 9801n on mainnet (9800n on testnet)

// Read balance
const balance = await provider.getBalance("0xYourAddress");
console.log("Balance:", ethers.formatEther(balance), "QOR");

// Send transaction
const wallet = new ethers.Wallet("0xYOUR_PRIVATE_KEY_HEX", provider);
const tx = await wallet.sendTransaction({
  to: "0xRecipientAddress",
  value: ethers.parseEther("1.0"),
});
await tx.wait();
```

---

## Modèle de gas

QoreChain utilise un modèle de **frais de base dynamiques EIP-1559** pour les transactions EVM :

* Le frais de base s'ajuste à chaque bloc en fonction de l'utilisation
* Les utilisateurs peuvent définir `maxFeePerGas` et `maxPriorityFeePerGas`
* Les frais de priorité reviennent au proposeur du bloc

### Pont de dénomination

Le jeton natif QOR possède **6 décimales** (`uqor`), tandis que l'EVM attend **18 décimales**. Le module `x/precisebank` gère une conversion transparente :

| Contexte     | Dénomination | Décimales | Exemple                |
| ------------ | ------------ | -------- | ---------------------- |
| Chaîne native | `uqor`       | 6        | `1000000 uqor = 1 QOR` |
| EVM          | wei          | 18       | `1e18 wei = 1 QOR`     |

Cette conversion est transparente : lorsque vous vérifiez un solde via `eth_getBalance`, la réponse est libellée en wei à 18 décimales. Lorsque le même compte est interrogé via le module bank natif, le solde apparaît en `uqor` à 6 décimales.

---

## Paires de jetons ERC-20

Le module `x/erc20` assure l'enregistrement automatique de **paires de jetons** entre les dénominations natives Cosmos SDK et les contrats ERC-20 :

* Les jetons natifs peuvent être utilisés au sein des contrats EVM en tant qu'ERC-20
* Les jetons ERC-20 déployés sur l'EVM peuvent être convertis en dénominations natives
* La conversion est bidirectionnelle et gérée au niveau du protocole

```bash
# Register a new token pair (governance proposal)
qorechaind tx erc20 register-coin <denom> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey
```

---

## PQC et compatibilité EVM

Les transactions EVM utilisent des signatures **ECDSA classiques (secp256k1)** pour une compatibilité totale avec les outils, portefeuilles et bibliothèques Ethereum existants. Cela garantit que MetaMask, Hardhat, Foundry, ethers.js et tous les outils EVM standard fonctionnent sans modification.

Pour la sécurité post-quantique au sein de l'EVM :

* Utilisez le **précompilé PQC Verify** (`0x0000...0A01`) pour vérifier des signatures ML-DSA-87 on-chain depuis Solidity. Voir [Précompilés EVM](/developer-guide/evm-precompiles).
* Les **messages cross-VM** de l'EVM vers CosmWasm ou la SVM peuvent être signés en PQC au niveau de la couche de transaction Cosmos SDK.
* Les comptes peuvent éventuellement enregistrer des clés publiques PQC via `x/pqc` pour une sécurité hybride.

---

## Espace de noms personnalisé `qor_` {#custom-qor_-namespace}

QoreChain étend le JSON-RPC avec un espace de noms `qor_` pour les requêtes spécifiques à la chaîne :

| Méthode                     | Description                                                       |
| --------------------------- | ----------------------------------------------------------------- |
| `qor_getPQCKeyStatus`       | Vérifie si un compte possède une clé publique PQC enregistrée     |
| `qor_getAIStats`            | Récupère les statistiques du moteur d'IA (nombre d'anomalies, distribution des risques) |
| `qor_getCrossVMMessage`     | Interroge le statut d'un message cross-VM par ID                  |
| `qor_getPoolClassification` | Obtient la classification du pool de validateurs (RPoS/DPoS/PoS)  |
| `qor_getReputationScore`    | Interroge le score de réputation d'un validateur                  |
| `qor_getAbstractAccount`    | Récupère la configuration d'un compte abstrait                    |

Exemple avec `curl` :

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPQCKeyStatus",
    "params": ["0xYourAddress"],
    "id": 1
  }'
```

---

## Étapes suivantes

* [Précompilés EVM](/developer-guide/evm-precompiles) — Accédez aux fonctionnalités PQC, IA et cross-VM depuis Solidity
* [Interopérabilité cross-VM](/developer-guide/cross-vm-interoperability) — Appelez des contrats CosmWasm et SVM depuis l'EVM
* [Abstraction de compte](/developer-guide/account-abstraction) — Comptes programmables avec clés de session
