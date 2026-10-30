---
slug: /developer-guide/evm-development
title: EVM Development
sidebar_label: EVM Development
sidebar_position: 2
---

# EVM Development

QoreChain runs a fully EVM-compatible execution environment on the QoreChain EVM Engine, allowing you to deploy and interact with Solidity smart contracts using familiar tooling. The EVM module exposes a JSON-RPC interface on **port 8545** (WebSocket on **8546**) that supports standard Ethereum development workflows.

:::note
The examples below target the **`qorechain-vladi`** mainnet (EVM chain ID **9801**), live since 7 June 2026, which runs node release **v3.2.5** at the time of writing (applied by governance proposal 14 at height 3,906,833 on 29 October 2026; v3.2.4 had been applied at height 3,742,566 on 23 October 2026 and v3.2.3 at height 3,662,051 on 20 October 2026). The **`qorechain-diana`** testnet runs **v3.2.6** (v3.2.4 since height 8,337,253 on 19 October 2026, v3.2.5 at height 8,890,800 on 26 October, v3.2.6 at height 8,970,638 on 27 October); use EVM chain ID **9800** there. Where this page describes something that differs between the networks (the testnet precompiles, the Fest test tokens), it says so. The code samples use `http://localhost:8545` for a node you run yourself; the public mainnet endpoint is `https://evm.qore.host` and the testnet endpoint is `https://evm-testnet.qore.host`.
:::

:::caution An EVM transaction needs a registered PQC key and an open authorisation window
Since the v3.2.0 upgrade (mainnet height 2,981,742, testnet height 5,920,000) the EVM lane admits a transaction only from an account that has **(1) a registered ML-DSA-87 post-quantum key** and **(2) an open EVM authorisation window** that still has room for it. You sign with ordinary tools (MetaMask, ethers.js, Hardhat, Foundry), but without a registered key and an open window `eth_sendRawTransaction` is refused (codespace `pqc`, codes 26, 27 or 28). Reads, `eth_call` and gas estimation need neither. See [EVM authorisation window](#evm-window) below and the step-by-step how-to in [Your First Transaction](/getting-started/first-transaction#evm-window).

Two more rules apply on mainnet since v3.2.2: **unprotected (pre-EIP-155) transactions are refused**, both by the node's mempool and in block execution, so sign with a chain id (every current wallet and library does); and **module accounts cannot be claimed through the EVM**.
:::

---

## JSON-RPC Endpoint

| Property             | Value                                      |
| -------------------- | ------------------------------------------ |
| Default URL          | `http://localhost:8545`                    |
| WebSocket URL        | `ws://localhost:8546`                      |
| Supported namespaces | `eth_`, `web3_`, `net_`, `txpool_`          |
| Chain ID (mainnet)   | `9801` (`qorechain-vladi`)                 |
| Chain ID (testnet)   | `9800` (`qorechain-diana`)                 |
| Currency symbol      | `QOR`                                      |

QoreChain-specific reads are served over REST (`api.qore.host`); the `qor_` JSON-RPC namespace described [below](#custom-qor_-namespace) is **not enabled** on the public endpoints or in the default node configuration. The default `api` list of a freshly initialised node (v3.2.3 and later) is `eth,net,web3`; `txpool` is opt-in, because it publishes the node's pending transactions.

From node release v3.2.4 (mainnet since 23 October 2026, testnet since 19 October 2026) a node bounds its own JSON-RPC server: request bodies over 256 KiB are refused (HTTP 413), no more than 256 requests are served at once (HTTP 503 beyond that), and an `eth_getLogs` or `eth_newFilter` filter with more than 4 topic positions, 1000 alternatives in one position or 1000 addresses is refused. The limits are node-local settings in the `[json-rpc]` section of `app.toml`; see [Running a Node](/developer-guide/running-a-node#exposing-endpoints-for-integration).

---

## Wallet Configuration (MetaMask)

Add QoreChain as a custom network in MetaMask:

| Field              | Mainnet Value             | Testnet Value           |
| ------------------ | ------------------------- | ----------------------- |
| Network Name       | QoreChain (qorechain-vladi) | QoreChain Diana       |
| RPC URL            | `https://evm.qore.host`   | `https://evm-testnet.qore.host` |
| Chain ID           | `9801`                    | `9800`                  |
| Currency Symbol    | `QOR`                     | `QOR`                   |
| Block Explorer URL | `https://explore.qore.network` | *(optional)* |

Sending from MetaMask additionally requires a registered PQC key and an open [EVM authorisation window](#evm-window) on the account.

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

Deploy a contract (the deploying account needs a registered PQC key and an open [authorisation window](#evm-window); a deployment counts as one EVM transaction in the window):

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

## ERC-20 Token Pairs {#erc20-token-pairs}

The `x/erc20` module provides **token pairs** between native Cosmos SDK denominations and ERC-20 contracts:

* Native tokens can be used within EVM contracts as ERC-20s
* ERC-20 tokens deployed on the EVM can be converted to native denominations
* Conversion is bidirectional and handled at the protocol level

```bash
# Register a native ERC-20 contract as a token pair (permissioned: `permissionless_registration` is false)
qorechaind tx erc20 register-erc20 <contract-addr> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey --gas 400000 --fees 40000uqor

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey --gas 400000 --fees 40000uqor
```

These are Cosmos-lane transactions: on the live networks they also need the hybrid post-quantum cosign (build with `--generate-only`, then `qorechaind tx pqc cosign`; see [Post-Quantum Signing](/developer-guide/post-quantum-signing)). The plain `convert-erc20` command above is refused on node release v3.2.6 because the CLI writes a `0x` sender; see [Converting between the two forms](#fest-convert) for the working form. Token pairs are registered under a permissioned policy (governance registers them). None exist on mainnet at the time of writing; the testnet has the Fest test tokens in [the next section](#fest-tokens).

## Fest test tokens and ERC20 conversion {#fest-tokens}

:::note Testnet only, no value
The tokens in this section exist only on the `qorechain-diana` testnet (EVM chain ID 9800). They are test tokens for builders and have no value. Mainnet has no ERC-20 token pair (checked 27 October 2026), so none of the denoms below exists there.
:::

On 27 October 2026 testnet governance (proposal 26) registered three ERC-20 contracts as token pairs. They give builders a second token to pair with QOR in an [AMM pool](/api-reference/rest-grpc-endpoints#amm-module):

| Token | ERC-20 contract (EIP-55) | Decimals | Bank denom |
| ----- | ------------------------ | -------- | ---------- |
| fUSD (FestUSD) | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | 6  | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH (FestETH) | `0x02292293c13880a26242690eb70a0e42B8E91c28` | 18 | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC (FestBTC) | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | 8  | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

* **The bank denom is `erc20:<address>` with a colon, and the address must be in the exact EIP-55 mixed-case spelling shown.** Denoms are case-sensitive: `erc20:0x97143b771d34...` (lowercase) is a different string, and a query for it answers `404`. Copy the denom from `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata`, which lists the three tokens with their `symbol` (`fUSD`, `fETH`, `fBTC`), `display` name (`FestUSD`, `FestETH`, `FestBTC`) and decimals.
* **The faucet pays bank coins.** To use a Fest token from EVM (MetaMask, Solidity), convert the bank coin to its ERC-20 form first with `MsgConvertCoin`; to put an ERC-20 balance back into bank form (for example to pair it in the AMM), use `MsgConvertERC20`. Both are described next.
* **Tokens exist in two forms.** An ERC-20 balance is read with the contract's `balanceOf` over EVM JSON-RPC; the converted balance is a bank coin, read with `GET /cosmos/bank/v1beta1/balances/{address}`. Only the bank-coin form can be paired in the AMM. Converting moves value between the two forms; it does not create it.
* **Amounts use the token's own decimals** (6, 18 and 8 for fUSD, fETH and fBTC), not the 6 decimals of `uqor`.

```bash
curl -s https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs
curl -s "https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs/0x97143B771D34ddb9130b807b135Ae675A5a963CA"
```

### Converting between the two forms {#fest-convert}

Both conversion messages are Cosmos-lane transactions: they need your registered post-quantum key and the hybrid cosign, like any other native transaction (build, then `qorechaind tx pqc cosign`; see [Post-Quantum Signing](/developer-guide/post-quantum-signing)). Fees must be at least gas × 0.1 uqor.

:::note What has been run
The REST reads on this page (`token_pairs`, `denoms_metadata`) were run against the testnet on 27 October 2026. The two conversion commands below were **not** run end to end for this page: their message shapes and the sender rule come from the v3.2.6 node source and the chain team's reference. Treat them as the documented shape and confirm with a small amount first.
:::

**Bank coin to ERC-20: `MsgConvertCoin`.** The `coin` is the exact, case-sensitive bank denom (`erc20:<EIP-55 address>`), the `sender` is your `qor1...` address (the signer), and the `receiver` is a `0x...` address that will hold the ERC-20. It uses about 432,000 gas; set a gas limit of 600,000.

```bash
# Write the message by hand (not run for this page)
cat > convert-coin.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertCoin",
      "coin": { "denom": "erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA", "amount": "1000000" },
      "receiver": "0xYOUR_EVM_ADDRESS",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-coin.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**ERC-20 to bank coin: `MsgConvertERC20`.** Its `sender` field must also be the account's `qor1...` bech32 address. A `0x` sender is refused with `decoding bech32 failed`. In node release v3.2.6 the CLI command `qorechaind tx erc20 convert-erc20` (the plain example in [ERC-20 Token Pairs](#erc20-token-pairs)) writes the sender in `0x` form, so it is refused for that reason: do not use it. Build the message yourself with the `qor1` address as the sender, the same way as above:

```bash
# Workaround: write the message with a qor1 sender (not run for this page)
cat > convert-erc20.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertERC20",
      "contract_address": "0x97143B771D34ddb9130b807b135Ae675A5a963CA",
      "amount": "1000000",
      "receiver": "qor1youraddr...",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-erc20.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Here `receiver` is the `qor1...` account that receives the bank coin (the module accepts the bech32 form for the receiver of a conversion to a bank coin). The amount is in the token's own base units (6, 18 or 8 decimals). Copy the denom for `MsgConvertCoin` only from `denoms_metadata`; the lowercase form is refused with `token pair not found`.

---

## PQC and EVM Compatibility

EVM transactions are signed with **classical ECDSA (secp256k1)**, so MetaMask, Hardhat, Foundry, ethers.js and other standard tools build and sign them without modification. What changed in **v3.2.0** is *admission*: a transaction is accepted only if its sender holds a registered post-quantum key and a live authorisation window (next section). Registering a key and opening a window are Cosmos-lane transactions and need the hybrid (ML-DSA-87 + secp256k1) signature.

For post-quantum security inside contracts:

* The **PQC Verify precompile** (`0x0000...0A01`) verifies ML-DSA-87 signatures on-chain from Solidity. It is **active on the testnet** (activated by governance proposal 21, passed 27 October 2026) and **not active on mainnet** at the time of writing. See [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
* **Cross-VM messages** from EVM to QoreChain Native or SVM are Cosmos-lane transactions and carry the hybrid signature like any other; see [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability) for their current availability.

---

## EVM authorisation window {#evm-window}

A post-quantum signature cannot travel *with* an Ethereum transaction (wallets such as MetaMask cannot attach a second signature), so it travels *ahead* of it. The account opens a bounded window with the Cosmos-lane message `MsgOpenEVMWindow`; the EVM lane then admits only transactions covered by a live window. A stolen classical key alone cannot open a window, so it can move only what an already-open window allows.

| Bound       | Range              | Meaning |
| ----------- | ------------------ | ------- |
| `blocks`    | 1 – 17,280         | How long the window stays open, counted in blocks from the block that opens it |
| `max-txs`   | 1 – 1,000          | How many EVM transactions it admits |
| `max-value` | above 0, in `uqor` | Total outflow it admits: transferred value **plus** the maximum fee each transaction could pay (gas limit × max fee per gas), converted to `uqor` and rounded up |

Whichever bound runs out first closes the window. The three bounds are required; opening a window replaces an existing one; a transaction that is admitted and then fails still uses its slot and its value budget; contract deployments count like any other transaction. `blocks` is a block count, not a duration: 17,280 blocks is about 15 hours on mainnet (about 3.1 s per block) and about 6 hours on the testnet (about 1.3 s per block on 27 October 2026; the testnet block time varies).

**The value bound counts native QOR only.** A token transfer, an approval or any other contract call carries value zero, so it is not counted against `max-value` (only its maximum fee is). To bound those as well, narrow the window's **scope** (mainnet v3.2.3 and later):

| Scope option (CLI flag) | Message field | What the window admits |
| ----------------------- | ------------- | ---------------------- |
| `--native-only`         | `native_only` | Plain transfers of native QOR only: no calldata, no contract creation, no recipient that carries code, no EIP-7702 authorisation |
| `--allowed-targets 0xA,0xB` | `allowed_targets` | Only transactions whose recipient is one of the listed 20-byte addresses; contract creation is refused |

A window opened without a scope behaves exactly as before. A transaction outside the scope is refused with code 27 (the message says the window "does not admit this transaction"). `GET /qorechain/pqc/v1/evm_window/{address}` and `qorechaind query pqc evm-window` report `native_only` and `allowed_targets`, and the `pqc_evm_window_opened` event carries them when set.

**Steps** (the full walkthrough is in [Your First Transaction](/getting-started/first-transaction#evm-window)):

1. Register your ML-DSA-87 key once (`tx pqc register-key-v2` or `register-key`, with `--gas 600000 --fees 60000uqor`; this one transaction is exempt from the hybrid requirement, so a new account can bootstrap). See [Post-Quantum Signing](/developer-guide/post-quantum-signing#pqc-key-registration).
2. Open a window. It is a Cosmos-lane transaction, so produce it unsigned and cosign it with your ML-DSA key (`max-value` accepts `uqor` or `qor`; `1000qor` is 1,000 QOR):

   ```bash
   qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi

   # the same window narrowed to plain QOR transfers (mainnet v3.2.3 and later):
   qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   ```

3. Check what is left: `qorechaind query pqc evm-window <address>` or `GET /qorechain/pqc/v1/evm_window/{address}` (answers `found: false` when there is none).
4. Send your EVM transactions normally. Opening a window is a Cosmos-lane transaction and advances the account's sequence, which is also its EVM nonce, so read the nonce **after** the window is open and sign then.

Close a window early with `qorechaind tx pqc close-evm-window` (same `--generate-only` and `cosign` pattern), for example if you suspect the classical key is exposed: whatever the window still admitted is refused from the next block.

### EIP-7702 delegations {#eip-7702}

An EIP-7702 delegation of your account (a type-4 transaction) takes effect only with your account's own post-quantum consent, since v3.2.2. Record the consent first with the hybrid-signed Cosmos-lane message `MsgAuthorizeEVMDelegation` (`qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>`); it is single-use, expires after the given number of blocks and is revoked by `close-evm-window`. Value that leaves a delegated account is charged to **that** account's own window, a failed type-4 transaction keeps the authorisations it applied, and `qorechaind tx pqc clear-evm-delegation` removes a delegation. A refused delegation answers with codes 60 to 63. Read the consent with `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.

| Refusal (codespace `pqc`) | Meaning |
| ------------------------- | ------- |
| code 26 | No open window for the sender, or the sender has no registered PQC key |
| code 27 | The window is expired or exhausted (the message shows which bound), or the transaction is outside the window's scope |
| code 28 | Invalid window bounds when opening one, or no registered key at that point |

With the TypeScript SDK (0.8.2 and later): `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow({ rest, address })` and `classifyEvmWindowRejection(err)` (`"no-pqc-key" | "no-window" | "exhausted" | "invalid"`). SDK 0.9.0 adds the scope options (`nativeOnly`, `allowedTargets`) to `openEvmWindowMsg` and the EIP-7702 consent builders (`authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`); releases before 0.9.0 build only the unscoped window, so use `qorechaind` for the rest (see the [SDK EVM guide](/sdk/guides/evm#evm-window-scope)).

---

## Custom `qor_` Namespace {#custom-qor_-namespace}

QoreChain extends the JSON-RPC with a `qor_` namespace for chain-specific queries:

:::warning Not served yet
No released node build serves the `qor_` namespace yet: `rpc_modules` on the public endpoints lists only `eth`, `net`, `rpc`, `txpool` and `web3`, and every method below returns `-32601` (method not found) on mainnet, testnet and self-run nodes with the default configuration (`eth`, `net`, `web3`). See [the `qor_` namespace](/api-reference/json-rpc-qor_-namespace) for the status and the REST alternatives (for example `GET /qorechain/pqc/v1/account/{address}` for PQC key status).
:::

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

* [EVM Precompiles](/developer-guide/evm-precompiles) — Reference for the QoreChain precompile interfaces (three active on the testnet, none on mainnet)
* [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability) — Cross-VM calls and their current availability
* [Account Abstraction](/developer-guide/account-abstraction) — Linked-wallet authenticators and spending rules (enabled on the testnet, disabled on mainnet)
