---
slug: /developer-guide/evm-development
title: Développement EVM
sidebar_label: Développement EVM
sidebar_position: 2
---

# Développement EVM

QoreChain exécute un environnement d'exécution entièrement compatible EVM sur le QoreChain EVM Engine, ce qui vous permet de déployer des contrats intelligents Solidity et d'interagir avec eux à l'aide d'outils familiers. Le module EVM expose une interface JSON-RPC sur le **port 8545** (WebSocket sur le **8546**) qui prend en charge les flux de travail de développement Ethereum standard.

:::note
Les exemples ci-dessous ciblent le mainnet **`qorechain-vladi`** (EVM chain ID **9801**), actif depuis le 29 juin 2026, qui exécute la version de nœud **v3.2.1** (règles de consensus issues de la mise à niveau v3.2.0). Pour le testnet **`qorechain-diana`** (v3.2.2), utilisez l'EVM chain ID **9800**. Les exemples de code utilisent `http://localhost:8545` pour un nœud que vous exploitez vous-même ; le point de terminaison public du mainnet est `https://evm.qore.host` et celui du testnet est `https://evm-testnet.qore.host`.
:::

:::caution Une transaction EVM exige une clé PQC enregistrée et une fenêtre d'autorisation ouverte
Depuis la mise à niveau v3.2.0 (hauteur 2,981,742 sur le mainnet, hauteur 5,920,000 sur le testnet), la voie EVM n'admet une transaction que d'un compte qui possède **(1) une clé post-quantique ML-DSA-87 enregistrée** et **(2) une fenêtre d'autorisation EVM ouverte** disposant encore de place pour elle. Vous signez avec des outils ordinaires (MetaMask, ethers.js, Hardhat, Foundry), mais sans clé enregistrée ni fenêtre ouverte, `eth_sendRawTransaction` est refusé (codespace `pqc`, codes 26, 27 ou 28). Les lectures, `eth_call` et l'estimation du gas n'ont besoin ni de l'une ni de l'autre. Voir [Fenêtre d'autorisation EVM](#evm-window) ci-dessous et le guide pas à pas dans [Votre première transaction](/getting-started/first-transaction#evm-window).
:::

---

## Point de terminaison JSON-RPC

| Propriété             | Valeur                                     |
| -------------------- | ------------------------------------------ |
| URL par défaut       | `http://localhost:8545`                    |
| URL WebSocket        | `ws://localhost:8546`                      |
| Espaces de noms pris en charge | `eth_`, `web3_`, `net_`, `txpool_`          |
| Chain ID (mainnet)   | `9801` (`qorechain-vladi`)                 |
| Chain ID (testnet)   | `9800` (`qorechain-diana`)                 |
| Symbole de la devise | `QOR`                                      |

Les lectures propres à QoreChain sont servies via REST (`api.qore.host`) ; l'espace de noms JSON-RPC `qor_` décrit [ci-dessous](#custom-qor_-namespace) n'est **pas activé** sur les points de terminaison publics ni dans la configuration par défaut d'un nœud.

---

## Configuration du portefeuille (MetaMask)

Ajoutez QoreChain comme réseau personnalisé dans MetaMask :

| Champ              | Valeur mainnet            | Valeur testnet          |
| ------------------ | ------------------------- | ----------------------- |
| Nom du réseau      | QoreChain (qorechain-vladi) | QoreChain Diana       |
| URL RPC            | `https://evm.qore.host`   | `https://evm-testnet.qore.host` |
| Chain ID           | `9801`                    | `9800`                  |
| Symbole de la devise | `QOR`                   | `QOR`                   |
| URL de l'explorateur de blocs | `https://explore.qore.network` | *(facultatif)* |

L'envoi depuis MetaMask exige en plus une clé PQC enregistrée et une [fenêtre d'autorisation EVM](#evm-window) ouverte sur le compte.

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

Déployez un contrat (le compte qui déploie a besoin d'une clé PQC enregistrée et d'une [fenêtre d'autorisation](#evm-window) ouverte ; un déploiement compte pour une transaction EVM dans la fenêtre) :

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

Le module `x/erc20` fournit des **paires de jetons** entre les dénominations natives Cosmos SDK et les contrats ERC-20 :

* Les jetons natifs peuvent être utilisés au sein des contrats EVM en tant qu'ERC-20
* Les jetons ERC-20 déployés sur l'EVM peuvent être convertis en dénominations natives
* La conversion est bidirectionnelle et gérée au niveau du protocole

```bash
# Register a native ERC-20 contract as a token pair (permissioned: `permissionless_registration` is false)
qorechaind tx erc20 register-erc20 <contract-addr> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey --gas 400000 --fees 40000uqor

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey --gas 400000 --fees 40000uqor
```

Ce sont des transactions de la voie Cosmos : sur les réseaux en production, elles nécessitent aussi la cosignature post-quantique hybride (construisez avec `--generate-only`, puis `qorechaind tx pqc cosign` ; voir [Signature post-quantique](/developer-guide/post-quantum-signing)). Les paires de jetons sont enregistrées selon une politique avec permissions, et aucune n'existe encore sur le mainnet.

---

## PQC et compatibilité EVM

Les transactions EVM sont signées avec **ECDSA classique (secp256k1)** ; MetaMask, Hardhat, Foundry, ethers.js et les autres outils standard les construisent et les signent donc sans modification. Ce qui a changé avec la **v3.2.0**, c'est l'*admission* : une transaction n'est acceptée que si son expéditeur possède une clé post-quantique enregistrée et une fenêtre d'autorisation active (section suivante). L'enregistrement d'une clé et l'ouverture d'une fenêtre sont des transactions de la voie Cosmos et exigent la signature hybride (ML-DSA-87 + secp256k1).

Pour la sécurité post-quantique au sein des contrats :

* Le **précompilé PQC Verify** (`0x0000...0A01`) vérifiera les signatures ML-DSA-87 on-chain depuis Solidity une fois activé ; il n'est **pas encore actif** sur le mainnet ni sur le testnet. Voir [Précompilés EVM : état du réseau](/developer-guide/evm-precompiles#network-status).
* Les **messages cross-VM** de l'EVM vers CosmWasm ou la SVM sont des transactions de la voie Cosmos et portent la signature hybride comme toutes les autres ; voir [Interopérabilité cross-VM](/developer-guide/cross-vm-interoperability) pour leur disponibilité actuelle.

---

## Fenêtre d'autorisation EVM {#evm-window}

Une signature post-quantique ne peut pas voyager *avec* une transaction Ethereum (des portefeuilles comme MetaMask ne peuvent pas joindre une seconde signature) ; elle voyage donc *en amont*. Le compte ouvre une fenêtre bornée avec le message de la voie Cosmos `MsgOpenEVMWindow` ; la voie EVM n'admet ensuite que les transactions couvertes par une fenêtre active. Une clé classique volée ne peut pas, à elle seule, ouvrir une fenêtre : elle ne peut donc déplacer que ce qu'une fenêtre déjà ouverte autorise.

| Borne       | Plage              | Signification |
| ----------- | ------------------ | ------- |
| `blocks`    | 1 – 17,280         | Durée pendant laquelle la fenêtre reste ouverte, comptée en blocs à partir du bloc qui l'ouvre |
| `max-txs`   | 1 – 1,000          | Nombre de transactions EVM qu'elle admet |
| `max-value` | supérieur à 0, en `uqor` | Sortie totale qu'elle admet : valeur transférée **plus** les frais maximaux que chaque transaction pourrait payer (limite de gas × frais max par gas), convertis en `uqor` et arrondis à l'unité supérieure |

La première borne atteinte ferme la fenêtre. Tous les champs sont obligatoires ; ouvrir une fenêtre remplace celle qui existe ; une transaction admise puis en échec consomme tout de même son emplacement et son budget de valeur ; les déploiements de contrat comptent comme n'importe quelle autre transaction. `blocks` est un nombre de blocs, pas une durée : 17,280 blocs représentent environ 15 heures sur le mainnet (environ 3,2 s par bloc) et environ 5 heures sur le testnet (environ 1,0 s par bloc).

**Étapes** (le pas-à-pas complet se trouve dans [Votre première transaction](/getting-started/first-transaction#evm-window)) :

1. Enregistrez une fois votre clé ML-DSA-87 (`tx pqc register-key-v2` ou `register-key`, avec `--gas 600000 --fees 60000uqor` ; cette transaction est exemptée de l'exigence hybride, de sorte qu'un nouveau compte puisse démarrer). Voir [Signature post-quantique](/developer-guide/post-quantum-signing#pqc-key-registration).
2. Ouvrez une fenêtre. C'est une transaction de la voie Cosmos : produisez-la non signée et cosignez-la avec votre clé ML-DSA (`max-value` accepte `uqor` ou `qor` ; `1000qor` correspond à 1 000 QOR) :

   ```bash
   qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
   ```

3. Vérifiez ce qu'il reste : `qorechaind query pqc evm-window <address>` ou `GET /qorechain/pqc/v1/evm_window/{address}` (répond `found: false` lorsqu'il n'y en a pas).
4. Envoyez vos transactions EVM normalement. L'ouverture d'une fenêtre est une transaction de la voie Cosmos et fait avancer la séquence du compte, qui est aussi son nonce EVM ; lisez donc le nonce **après** l'ouverture de la fenêtre et signez à ce moment-là.

Fermez une fenêtre de façon anticipée avec `qorechaind tx pqc close-evm-window` (même schéma `--generate-only` et `cosign`), par exemple si vous soupçonnez que la clé classique est exposée : tout ce que la fenêtre admettait encore est refusé à partir du bloc suivant.

| Refus (codespace `pqc`) | Signification |
| ------------------------- | ------- |
| code 26 | Aucune fenêtre ouverte pour l'expéditeur, ou l'expéditeur n'a pas de clé PQC enregistrée |
| code 27 | La fenêtre est expirée ou épuisée (le message indique quelle borne) |
| code 28 | Bornes de fenêtre invalides à l'ouverture, ou aucune clé enregistrée à ce moment |

Avec le SDK TypeScript (0.8.2 et versions ultérieures) : `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow({ rest, address })` et `classifyEvmWindowRejection(err)` (`"no-pqc-key" | "no-window" | "exhausted" | "invalid"`).

---

## Espace de noms personnalisé `qor_` {#custom-qor_-namespace}

QoreChain étend le JSON-RPC avec un espace de noms `qor_` pour les requêtes spécifiques à la chaîne :

:::warning Pas encore servi
Aucune version publiée du nœud ne sert encore l'espace de noms `qor_` : `rpc_modules` sur les points de terminaison publics ne liste que `eth`, `net`, `rpc`, `txpool` et `web3`, et chaque méthode ci-dessous renvoie `-32601` (méthode introuvable) sur le mainnet, le testnet et les nœuds auto-hébergés avec la configuration par défaut (`eth`, `net`, `web3`, `txpool`). Voir [l'espace de noms `qor_`](/api-reference/json-rpc-qor_-namespace) pour l'état d'avancement et les alternatives REST (par exemple `GET /qorechain/pqc/v1/account/{address}` pour l'état de la clé PQC).
:::

| Méthode                     | Description                                                       |
| --------------------------- | ------------------------------------------------------------------- |
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

* [Précompilés EVM](/developer-guide/evm-precompiles) — Référence des interfaces de précompilés réservées (pas encore actives sur les réseaux publics)
* [Interopérabilité cross-VM](/developer-guide/cross-vm-interoperability) — Appels cross-VM et leur disponibilité actuelle
* [Abstraction de compte](/developer-guide/account-abstraction) — Authentificateurs de portefeuilles liés et règles de dépense (module actuellement désactivé)
