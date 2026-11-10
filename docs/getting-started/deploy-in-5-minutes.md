---
slug: /getting-started/deploy-in-5-minutes
title: Deploy on QoreChain in 5 Minutes
sidebar_label: Deploy in 5 Minutes
sidebar_position: 6
---

# Deploy on QoreChain in 5 Minutes

This page is for a Solidity developer who has never used QoreChain. You keep Foundry or Hardhat and the same recovery phrase you use for MetaMask. The one new thing is a short **authorisation window**: QoreChain protects every account with a post-quantum key, an Ethereum transaction cannot carry one, so you open a bounded window first and your normal EVM transactions are admitted while it is open. The steps below use the **testnet** (`qorechain-diana`, EVM chain ID 9800), where nothing costs real money.

:::note
This path was run on the testnet: a window opened in QoreX, then a contract created and called with Foundry `cast` from the same recovery phrase. `forge create` and Hardhat send the same kind of EVM transaction, but they were not part of that run. A window opened from the `qorechaind` command line is also confirmed; see [Alternative: the command line](#cli).
:::

## What you need {#what-you-need}

- The recovery phrase of the account you want to deploy from. QoreX cannot import a raw private key. If you only have a private key, use the [command line](#cli) instead.
- [QoreX](/qorex/overview), the QoreChain wallet (app or browser extension).
- Foundry or Hardhat already installed.

## 1. Add a coin-60 account to QoreX {#step-import}

The EVM lane works only with an `eth_secp256k1` key (coin type 60). A standard secp256k1 Cosmos key (coin type 118, the QoreX default) cannot sign for its EVM address, so a window opened on a coin-118 account is useless for EVM tools. You need an **Ethereum account (coin 60)**. In QoreX open **Your accounts** and tap **Add an Ethereum account (coin 60)**. QoreX derives it from the wallet's **own recovery phrase** with the Ethereum path `m/44'/60'`. Its `0x…` address is the same as in MetaMask or Foundry only when they use that same phrase (for Foundry, derivation path `m/44'/60'/0'/0/0`, index 0). If your MetaMask account comes from a different phrase, QoreX shows a different address, and a window opened there does not cover the key you deploy with. The `0x…` address is the same key as a `qor1…` address on QoreChain.

The account has its own address, so fund it and select it in QoreX before the next steps. See [Restore a phrase from MetaMask or the Dashboard](/qorex/getting-started#restore-dashboard).

:::caution Never paste a production phrase into development tools
Use a recovery phrase made for testing, with test QOR only. Do not type the phrase of an account that holds real funds into Foundry, Hardhat or a script.
:::

## 2. Switch QoreX to the testnet {#step-testnet}

- **App:** Settings → **Use testnet (developers)**.
- **Browser extension:** unlock it, tap the version number at the bottom seven times, then choose **Switch to testnet (diana)**.

The network badge on Home changes to TESTNET.

## 3. Get testnet QOR {#step-faucet}

Request testnet QOR for your `0x…` or `qor1…` address from the [Dashboard Faucet](/dashboard/faucet). It is the same balance on both forms of the address.

## 4. Open the EVM window in QoreX {#step-window}

- **Extension and app:** the card titled **MetaMask on QoreChain** (with a **0x** mark) on the main popup or on Home. It opens the **EVM access window** screen.
- **App:** also Settings → Security → **EVM access window**.

If this account has no post-quantum key yet, QoreX registers it for you at this step. Registration costs 0.09 QOR, once per account, and the window transaction pays its own network fee on top. You then choose three limits:

| Field | Range | QoreX default |
|---|---|---|
| Blocks (how long the window stays open) | 1 to 17,280 | 300 |
| Max transactions | 1 to 1,000 | 5 |
| Spending cap, in QOR | above 0 | 1 |

The spending cap counts the value of each transaction **plus its maximum fee** (gas limit times the fee cap), not only what it transfers. A contract deploy moves no QOR but still counts its maximum fee: a 3,000,000 gas deploy sent by Hardhat counts about 0.64 QOR.

For a deploy session the defaults are too small. A reasonable choice is 3,000 blocks (about an hour on the testnet), 20 transactions and a cap of 10 QOR. Keep them as small as your session allows, and close the window when you are done.

:::caution Open the window first
Opening a window advances the account nonce. Open it **before** you deploy: a transaction signed earlier is refused with "nonce too low".
:::

## 5. Deploy with Foundry or Hardhat {#step-deploy}

Use the key of the **same funded coin-60 account**. QoreX cannot act as a Foundry signer, so give Foundry or Hardhat the key from the same recovery phrase, for example `--mnemonic` with index 0 in Foundry. The network settings:

| Setting | Value |
|---|---|
| RPC URL | `https://evm-testnet.qore.host` |
| Chain ID | `9800` |
| Currency | QOR, 18 decimals |

**Foundry**

```bash
export ETH_RPC_URL=https://evm-testnet.qore.host

forge create src/Counter.sol:Counter --private-key $DEPLOYER_KEY --broadcast
cast send <contract> "increment()" --private-key $DEPLOYER_KEY
cast call <contract> "number()(uint256)"
```

**Hardhat**

```js
// hardhat.config.js
module.exports = {
  solidity: "0.8.24",
  networks: {
    diana: {
      url: "https://evm-testnet.qore.host",
      chainId: 9800,
      accounts: [process.env.DEPLOYER_KEY],
    },
  },
};
```

```bash
DEPLOYER_KEY=0x... npx hardhat run scripts/deploy.js --network diana
```

Every transaction you send (deploy or call) uses one of the window's transactions. Reads (`cast call`, view functions, gas estimation) need no window and use none of it.

## Check the window and handle expiry {#check-and-expiry}

A window **expires**: when its blocks, its transactions or its spending cap run out, the EVM lane refuses your next transaction with `no open EVM authorisation window` or `EVM authorisation window exhausted`. Open a new one in QoreX; a new window replaces the old one.

To see its state, use the **PQ key status** tab of [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers) (see [Developers](/dashboard/developers)), or the REST route:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

`live: true` with `remaining_blocks`, `remaining_txs` and `remaining_value` (in `uqor`) means it is open.

## Alternative: the command line {#cli}

With the `qorechaind` release binary you can import a raw private key, register its post-quantum key and open the window without QoreX. This is the route for a developer who has only a private key. `gen-key` and `cosign` are not in a community build, so this needs the release binary. The window rules are in the [EVM authorisation window](/developer-guide/evm-development#evm-window) section of [EVM Development](/developer-guide/evm-development). A window opened this way, followed by a transaction sent with `cast`, is confirmed on the testnet.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# import the private key as an eth_secp256k1 key: the qor1... and 0x... addresses are one account
qorechaind keys import-hex deployer <private-key-hex-without-0x> --key-type eth_secp256k1

# register a post-quantum key once per account (back up the .dilithium file)
qorechaind tx pqc gen-key deployer-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --pqc-key deployer-mldsa \
  --from deployer --chain-id $QCHAIN --node $QNODE --gas auto --gas-adjustment 1.3 --gas-prices 0.2uqor

# open the window

qorechaind tx pqc open-evm-window 3000 20 10qor --from deployer \
  --chain-id $QCHAIN --node $QNODE --gas 400000 --fees 80000uqor --generate-only > window.json
qorechaind tx pqc cosign window.json --from deployer --pqc-key deployer-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Do not narrow a deploy window with `--native-only` or `--allowed-targets`: both refuse contract creation. They are for later sessions, once the contract exists.

## What is different on the testnet {#diana-notes}

- **CosmWasm** accepts only governance-approved codes on the testnet, so you cannot upload your own contract there. Solidity is the open path.
- **SVM** is not available.
- Mainnet works the same way with chain ID 9801 and `https://evm.qore.host`, but start on the testnet.

## Common errors {#errors}

| Message | Cause | Fix |
|---|---|---|
| `account ... has no registered post-quantum key` | the account has no ML-DSA-87 key | open a window in QoreX, which registers it, or register it from the command line |
| `no open EVM authorisation window` | no window, or it expired | open a window |
| `EVM authorisation window exhausted` | transactions or spending cap used up | open a new window with larger limits |
| `nonce too low` | the window was opened after you signed | open the window first, then send |
| `only replay-protected (EIP-155) Ethereum transactions are accepted` | a transaction signed without a chain ID | set `chainId` in your network config |

Next: [EVM Development](/developer-guide/evm-development), [QoreX security and recovery](/qorex/security-and-recovery#evm-window), [Developers](/dashboard/developers).
