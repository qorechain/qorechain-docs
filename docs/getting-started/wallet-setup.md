---
slug: /getting-started/wallet-setup
title: Wallet Setup
sidebar_label: Wallet Setup
sidebar_position: 2
---

# Wallet Setup

QoreChain supports multiple wallet types across its native, EVM, and SVM execution environments. Choose the wallet that matches your use case.

:::note
The chain IDs and RPC endpoints below target the **`qorechain-diana`** testnet (EVM chain ID **9800**). Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) has been live since 7 June 2026; its wallet connection values are documented on the separate **Connecting to Mainnet** page.
:::

## Keplr Wallet

Keplr is the recommended wallet for native QoreChain transactions, staking, and governance.

### Add QoreChain as a Custom Chain

Open Keplr and navigate to **Settings > Add Custom Chain**, then enter:

| Field              | Value                     |
| ------------------ | ------------------------- |
| Chain Name         | `QoreChain Diana Testnet` |
| Chain ID           | `qorechain-diana`         |
| RPC URL            | `http://localhost:26657`  |
| REST URL           | `http://localhost:1317`   |
| Bech32 Prefix      | `qor`                     |
| Coin Denom         | `QOR`                     |
| Coin Minimal Denom | `uqor`                    |
| Decimals           | `6`                       |

After adding the chain, Keplr generates a `qor1...` address for your account. Use this address to receive testnet QOR tokens.

## MetaMask (EVM)

MetaMask enables interaction with QoreChain's EVM execution environment — deploy Solidity contracts, manage ERC-20 tokens, and use familiar Ethereum tooling.

### Add QoreChain as a Custom Network

Open MetaMask and navigate to **Settings > Networks > Add Network**, then enter:

| Field           | Value                   |
| --------------- | ----------------------- |
| Network Name    | `QoreChain EVM`         |
| RPC URL         | `http://localhost:8545` |
| Chain ID        | `9800`                  |
| Currency Symbol | `QOR`                   |

Once connected, you can use MetaMask to sign EVM transactions, interact with deployed smart contracts, and manage ERC-20 tokens on QoreChain.

## Solana Wallets (SVM)

QoreChain's SVM execution environment is compatible with standard Solana tooling. Connect any Solana-compatible wallet or library to interact with SVM programs.

### Using @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

const connection = new Connection("http://localhost:8899");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

This enables deployment and interaction with SVM programs running on QoreChain.

## PQC-Enabled Wallets (Required on the Cosmos Path)

QoreChain requires hybrid post-quantum cryptography (PQC) on the cosmos transaction path. As of the current chain version (**v3.1.77**), the network default is `hybrid_signature_mode = required` with `allow_classical_fallback = false` — so **every cosmos-path transaction must carry an ML-DSA-87 (Dilithium-5) signature alongside the standard secp256k1 (ECDSA) signature**. Classical-only cosmos transactions from a PQC account are rejected.

:::caution Cosmos txs require the hybrid PQC extension
Sending a plain classical transaction on the cosmos path will be rejected. You must attach the Dilithium-5 signature as a `PQCHybridSignature` transaction extension. Standard CosmJS / Keplr tooling does not produce this extension by itself — use the `qorechaind tx pqc cosign` CLI command or the QoreChain SDK's hybrid signing (see below). The only exemptions are genesis gentxs and PQC key registration/migration transactions.
:::

### How It Works

Wallets attach an ML-DSA-87 PQC signature as a transaction extension alongside the standard secp256k1 (ECDSA) signature. The classical signature is computed over sign bytes that exclude the extension, so it stays valid for classical verification while the PQC signature provides quantum resistance.

### Generate a Dilithium-5 Key

Generate a post-quantum key for hybrid signing:

```bash
qorechaind tx pqc gen-key
```

### Auto-Registration

When you include a PQC public key in your first transaction, QoreChain automatically registers it on-chain. No separate registration step is needed. (PQC key registration/migration transactions are themselves exempt from the hybrid requirement, so an account can bootstrap its first key.)

### Hybrid Signing with the SDK

The QoreChain SDK produces compliant cosmos transactions via `buildHybridTx` with `includePqcPublicKey: true`, which attaches the Dilithium-5 extension and embeds the public key for auto-registration. See [SDK Accounts & PQC signing](/sdk/concepts/accounts-pqc).

### PQC Modes

The three enforcement modes remain governance-controlled; the **current network default is Required**:

| Mode                   | Description                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| **Disabled**           | PQC verification is turned off. Standard signatures only.               |
| **Optional**           | Transactions may include PQC signatures. If present, they are verified. |
| **Required** (default) | All cosmos-path transactions must include a valid PQC signature.        |

The active mode is configured at the chain level and can be updated through governance.

:::note EVM / MetaMask unaffected
The MetaMask (EVM) flow above is **not** affected by the hybrid requirement. EVM transactions use a separate `eth_secp256k1` ante path and never need the PQC extension.
:::

## CLI Wallet

The `qorechaind` binary includes a built-in key management system for command-line usage.

### Create a New Key

```bash
qorechaind keys add mykey
```

This generates a new key pair and displays the mnemonic phrase. **Store the mnemonic securely** — it is the only way to recover this key.

### View Your Address

```bash
qorechaind keys show mykey -a
```

This outputs your `qor1...` bech32 address.

### List All Keys

```bash
qorechaind keys list
```

### Import an Existing Key

```bash
qorechaind keys add mykey --recover
```

You will be prompted to enter your mnemonic phrase.

## Next Steps

* [Your First Transaction](/getting-started/first-transaction) — Send QOR tokens using your new wallet
* [Connecting to Testnet](/getting-started/connecting-to-testnet) — Join the live Diana testnet
