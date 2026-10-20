---
slug: /getting-started/wallet-setup
title: Wallet Setup
sidebar_label: Wallet Setup
sidebar_position: 2
---

# Wallet Setup

QoreChain supports multiple wallet types across its native, EVM, and SVM execution environments. Choose the wallet that matches your use case.

:::note
The values below cover both the **`qorechain-vladi`** mainnet (EVM chain ID **9801**, live since 7 June 2026, release v3.2.3 until height 3,742,566 and v3.2.4 from that block) and the **`qorechain-diana`** testnet (EVM chain ID **9800**, release v3.2.4 since 19 October 2026). Public endpoints for both networks are listed in [Networks](/appendix/networks#public-endpoints).
:::

## QoreX (recommended) {#qorex}

**QoreX** is the official, non-custodial QoreChain wallet — a mobile app (Android, iOS) and a browser extension (Chrome, Firefox, Safari on macOS). It signs every Native-lane transfer with the mandatory hybrid post-quantum signature, registers your post-quantum key for you, supports staking, @handles and external networks, and pairs with the Dashboard. It also opens the [EVM authorisation window](/getting-started/first-transaction#evm-window) that MetaMask transactions need. Start with the [QoreX guide](/qorex/overview) and [Getting Started](/qorex/getting-started).

## Keplr Wallet

Keplr can add QoreChain as a custom chain (below) to view balances and receive on the Native lane. Because QoreChain requires a post-quantum co-signature on the Native lane, send, stake and vote with a PQC-capable wallet such as [QoreX](/qorex/overview) rather than with Keplr alone.

### Add QoreChain as a Custom Chain

Open Keplr and navigate to **Settings > Add Custom Chain**, then enter:

| Field              | Mainnet                    | Testnet                          |
| ------------------ | -------------------------- | -------------------------------- |
| Chain Name         | `QoreChain`                | `QoreChain Diana Testnet`        |
| Chain ID           | `qorechain-vladi`          | `qorechain-diana`                |
| RPC URL            | `https://rpc.qore.host`    | `https://rpc-testnet.qore.host`  |
| REST URL           | `https://api.qore.host`    | `https://api-testnet.qore.host`  |
| Bech32 Prefix      | `qor`                      | `qor`                            |
| Coin Denom         | `QOR`                      | `QOR`                            |
| Coin Minimal Denom | `uqor`                     | `uqor`                           |
| Decimals           | `6`                        | `6`                              |
| Coin Type (BIP-44) | `118`                      | `118`                            |

After adding the chain, Keplr generates a `qor1...` address for your account.

:::caution Gas price floor
The network minimum gas price is **0.1uqor**. If you configure Keplr's gas-price steps (e.g. via `suggestChain`), use values **at or above 0.1** (suggested low/average/high: `0.1 / 0.15 / 0.25`) — transactions signed below the floor are rejected.
:::

## MetaMask (EVM)

MetaMask enables interaction with QoreChain's EVM execution environment — deploy Solidity contracts, manage ERC-20 tokens, and use familiar Ethereum tooling.

### Add QoreChain as a Custom Network

Open MetaMask and navigate to **Settings > Networks > Add Network**, then enter:

| Field              | Mainnet                   | Testnet                          |
| ------------------ | ------------------------- | -------------------------------- |
| Network Name       | `QoreChain`               | `QoreChain Diana Testnet`        |
| RPC URL            | `https://evm.qore.host`   | `https://evm-testnet.qore.host`  |
| Chain ID           | `9801`                    | `9800`                           |
| Currency Symbol    | `QOR`                     | `QOR`                            |
| Block Explorer URL | `https://explore.qore.network` | `https://explore.qore.network` |

Native QOR has **18 decimals** on the EVM interface (wei-style). Once connected, you can use MetaMask to sign EVM transactions, interact with deployed smart contracts, and manage ERC-20 tokens on QoreChain.

:::caution EVM / MetaMask needs a PQC key and an open window
MetaMask still signs normally, but the EVM lane admits transactions only from an account that has a registered post-quantum key and an open **EVM authorisation window** (v3.2.0 and later). Register your key once, then open a window before a session of EVM activity — see [EVM authorisation window](/getting-started/first-transaction#evm-window). MetaMask cannot open the window itself; open it in [QoreX](/qorex/security-and-recovery#evm-window) or with the CLI. Adding the network to MetaMask (above) is unchanged.
:::

### One-call network registration

For dApps, the **`@qorechain/wallet-adapter`** package (published to npm) registers QoreChain with the user's wallet in one call — prompting MetaMask to add the network via EIP-3085 (with the correct **18-decimal** native QOR on the EVM rail) — and provides `qoreChainInfo` for the Keplr chain suggestion (including the gas-price step):

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

## One Account, Three Addresses (Unified Accounts) {#unified-accounts}

As of chain version **v3.1.83**, a QoreChain account is **one 20-byte identity with three encodings**: `qor1…` (Native), `0x…` (EVM), and a base58 form (SVM). It holds **one balance** and — for eth-native accounts — **signs on all three lanes with one key**, including the required post-quantum hybrid signature on the Native path.

Generate a unified wallet in code with `@qorechain/wallet-adapter`:

```js
import { generateQoreWallet } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();          // or walletFromMnemonic(mnemonic)
console.log(w.cosmos);                         // qor1...
console.log(w.evm);                            // 0x... (same identity)
console.log(w.svm);                            // base58 (same identity)
// Native-lane sends use signHybridEth (classical eth_secp256k1 + ML-DSA-87 hybrid); pass `rest` so the sign-bytes form is resolved.
```

Funds sent to any of the three forms land in the same balance.

## Linked Wallets: Phantom & MetaMask as Spending Keys {#linked-wallets}

:::caution Currently switched off on both networks
Smart-account and linked-wallet features are implemented but **switched off** on both networks (`abstractaccount.enabled = false`): registering an authenticator and executing through one are refused while the flag is off. Check `GET /qorechain/abstractaccount/v1/config` before offering a linking flow. The section below describes the designed behaviour.
:::

Designed so that you don't have to expose your root key to spend from a QoreChain account in a dApp (introduced in chain version **v3.1.85**): a **Phantom** (ed25519) or **MetaMask** (by its Ethereum address, via `personal_sign`) key can be **registered as an authenticator** on your account — with scoped permissions, spending limits, an expiry, and instant revocation — and then authorize transfers relayed by the dApp's backend. See [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators) for the full model and code, and the [SDK Authenticators guide](/sdk/guides/authenticators) for end-to-end examples.

## Solana Wallets (SVM)

:::caution SVM transaction submission is currently disabled
The SVM execution lane is **currently disabled network-wide for transaction submission** — do not send transactions through a Solana-compatible wallet against QoreChain right now. Reading balances/slots may still work; see [SVM Development](/developer-guide/svm-development) for the current status.
:::

QoreChain's SVM execution environment is compatible with standard Solana tooling, and the account's **native QOR balance is visible directly on the SVM interface** (in lamports, 9 decimals; 1 uqor = 1,000 lamports). Connect any Solana-compatible wallet or library.

### Using @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

The public SVM endpoints are **read-only**; transaction submission requires your own node. See [SVM Development](/developer-guide/svm-development) for details.

## PQC-Enabled Wallets (Required on the Cosmos Path)

QoreChain requires hybrid post-quantum cryptography (PQC) on the cosmos transaction path. On the live networks (v3.2.x) the network default is `hybrid_signature_mode = required` with `allow_classical_fallback = false` — so **every cosmos-path transaction must carry an ML-DSA-87 (Dilithium-5) signature alongside the standard secp256k1 (ECDSA) signature**. Classical-only cosmos transactions from a PQC account are rejected.

:::caution Cosmos txs require the hybrid PQC extension
Sending a plain classical transaction on the cosmos path will be rejected. You must attach the Dilithium-5 signature as a `PQCHybridSignature` transaction extension. Standard CosmJS / Keplr tooling does not produce this extension by itself — use the `qorechaind tx pqc cosign` CLI command, the QoreChain SDK's hybrid signing (see below), or, to build it yourself in code, the open-source [**qorechain-pqc**](/developer-guide/post-quantum-signing) library (`hybridSignBytes`). The only exemptions are genesis gentxs, PQC key registration/migration transactions, and an unjail from an operator account that has no registered key.
:::

### How It Works

Wallets attach an ML-DSA-87 PQC signature as a transaction extension alongside the standard secp256k1 (ECDSA) signature. The classical signature is computed over sign bytes that exclude the extension, so it stays valid for classical verification while the PQC signature provides quantum resistance.

### Generate a Dilithium-5 Key

Generate a post-quantum key for hybrid signing:

```bash
qorechaind tx pqc gen-key mypqc
```

The command takes a key name and stores the key under `~/.qorechaind/pqc/<name>.dilithium` (mode `0600`, not encrypted). It requires the official `qorechaind` release binary.

### Register your key (once) {#register-your-key}

A post-quantum key is **registered explicitly**, once per account, with a key-registration transaction. That one transaction (and key migration) may be signed classically so a brand-new account can bootstrap; after it, every Cosmos-lane transaction must carry the hybrid signature.

```bash
# register the public key printed by gen-key for your account
qorechaind tx pqc register-key <public_key_hex> hybrid --from mykey \
  --chain-id qorechain-vladi --gas 600000 --fees 60000uqor
```

Since v3.2.3 you can attach an optional proof of possession by registering with `qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --pqc-key mypqc --from mykey ...`; the chain also refuses weak, degenerate or already-used keys. Back up the PQC key file as carefully as your mnemonic. (A key can be re-derived from the mnemonic with `qorechaind tx pqc recover-key`, and replaced with `tx pqc rotate-key`.) QoreX and the QoreChain SDK register the key for you. See [First Transaction](/getting-started/first-transaction#register-pqc-key) for a complete signed send.

### Hybrid Signing with the SDK

The QoreChain SDK builds compliant Cosmos-lane transactions with `buildHybridTx`, which attaches the Dilithium-5 extension. The account's key must already be registered (see above). See [SDK Accounts & PQC signing](/sdk/concepts/accounts-pqc).

### PQC Modes

The three enforcement modes remain governance-controlled; the **current network default is Required**:

| Mode                   | Description                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| **Disabled**           | PQC verification is turned off. Standard signatures only.               |
| **Optional**           | Transactions may include PQC signatures. If present, they are verified. |
| **Required** (default) | All cosmos-path transactions must include a valid PQC signature.        |

The active mode is configured at the chain level and can be updated through governance.

:::caution EVM / MetaMask needs a PQC key and an open window
The MetaMask (EVM) flow above does not carry the hybrid extension, but since v3.2.0 the EVM lane admits transactions only from an account with a registered post-quantum key and an open **EVM authorisation window**. See [EVM authorisation window](/getting-started/first-transaction#evm-window).
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
