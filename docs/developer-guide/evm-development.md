---
slug: /developer-guide/evm-development
title: EVM Development
sidebar_label: EVM Development
sidebar_position: 2
---

# EVM Development

QoreChain runs a fully EVM-compatible execution environment on the QoreChain EVM Engine, allowing you to deploy and interact with Solidity smart contracts using familiar tooling. The EVM module exposes a JSON-RPC interface on **port 8545** (WebSocket on **8546**) that supports standard Ethereum development workflows.

:::note
The examples below target the **`qorechain-vladi`** mainnet (EVM chain ID **9801**), live since 7 June 2026 running chain version **v3.1.82**. For the **`qorechain-diana`** testnet, use EVM chain ID **9800**.
:::

---

## JSON-RPC Endpoint

| Property             | Value                                      |
| -------------------- | ------------------------------------------ |
| Default URL          | `http://localhost:8545`                    |
| WebSocket URL        | `ws://localhost:8546`                      |
| Supported namespaces | `eth_`, `web3_`, `net_`, `txpool_`, `qor_` |
| Chain ID (mainnet)   | `9801` (`qorechain-vladi`)                 |
| Chain ID (testnet)   | `9800` (`qorechain-diana`)                 |
| Currency symbol      | `QOR`                                      |

The `qor_` namespace provides QoreChain-specific methods. See [Custom Namespace](#custom-qor_-namespace) below.

---

## Wallet Configuration (MetaMask)

Add QoreChain as a custom network in MetaMask:

| Field              | Mainnet Value             | Testnet Value           |
| ------------------ | ------------------------- | ----------------------- |
| Network Name       | QoreChain (qorechain-vladi) | QoreChain Diana       |
| RPC URL            | `http://localhost:8545`   | `http://localhost:8545` |
| Chain ID           | `9801`                    | `9800`                  |
| Currency Symbol    | `QOR`                     | `QOR`                   |
| Block Explorer URL | *(use the official mainnet explorer)* | *(leave blank for local testnet)* |

---

## Hardhat

Install Hardhat and configure your `hardhat.config.js`:

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

Deploy a contract:

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

Run tests against the QoreChain EVM:

```bash
npx hardhat test --network qorechain
```

---

## Foundry

Create and deploy a contract with Foundry:

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

## Gas Model

QoreChain uses an **EIP-1559 dynamic base fee** model for EVM transactions:

* Base fee adjusts per block based on utilization
* Users can set `maxFeePerGas` and `maxPriorityFeePerGas`
* Priority fees go to the block proposer

### Denomination Bridge

The native QOR token has **6 decimal places** (`uqor`), while the EVM expects **18 decimal places**. The `x/precisebank` module handles seamless conversion:

| Context      | Denomination | Decimals | Example                |
| ------------ | ------------ | -------- | ---------------------- |
| Native chain | `uqor`       | 6        | `1000000 uqor = 1 QOR` |
| EVM          | wei          | 18       | `1e18 wei = 1 QOR`     |

This conversion is transparent — when you check a balance via `eth_getBalance`, the response is denominated in 18-decimal wei. When the same account is queried via the native bank module, the balance appears in 6-decimal `uqor`.

---

## ERC-20 Token Pairs

The `x/erc20` module provides automatic registration of **token pairs** between native Cosmos SDK denominations and ERC-20 contracts:

* Native tokens can be used within EVM contracts as ERC-20s
* ERC-20 tokens deployed on the EVM can be converted to native denominations
* Conversion is bidirectional and handled at the protocol level

```bash
# Register a new token pair (governance proposal)
qorechaind tx erc20 register-coin <denom> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey
```

---

## PQC and EVM Compatibility

EVM transactions use **classical ECDSA (secp256k1)** signatures for full compatibility with existing Ethereum tooling, wallets, and libraries. This ensures that MetaMask, Hardhat, Foundry, ethers.js, and all standard EVM tools work without modification.

For post-quantum security within the EVM:

* Use the **PQC Verify precompile** (`0x0000...0A01`) to verify ML-DSA-87 signatures on-chain from Solidity. See [EVM Precompiles](/developer-guide/evm-precompiles).
* **Cross-VM messages** from EVM to CosmWasm or SVM can be PQC-signed at the Cosmos SDK transaction layer.
* Accounts can optionally register PQC public keys via `x/pqc` for hybrid security.

---

## Custom `qor_` Namespace {#custom-qor_-namespace}

QoreChain extends the JSON-RPC with a `qor_` namespace for chain-specific queries:

| Method                      | Description                                                       |
| --------------------------- | ----------------------------------------------------------------- |
| `qor_getPQCKeyStatus`       | Check if an account has a registered PQC public key               |
| `qor_getAIStats`            | Retrieve AI engine statistics (anomaly counts, risk distribution) |
| `qor_getCrossVMMessage`     | Query the status of a cross-VM message by ID                      |
| `qor_getPoolClassification` | Get validator pool classification (RPoS/DPoS/PoS)                 |
| `qor_getReputationScore`    | Query a validator's reputation score                              |
| `qor_getAbstractAccount`    | Retrieve abstract account configuration                           |

Example with `curl`:

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

## Next Steps

* [EVM Precompiles](/developer-guide/evm-precompiles) — Access PQC, AI, and cross-VM features from Solidity
* [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability) — Call CosmWasm and SVM contracts from the EVM
* [Account Abstraction](/developer-guide/account-abstraction) — Programmable accounts with session keys
