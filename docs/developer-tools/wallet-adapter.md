---
slug: /developer-tools/wallet-adapter
title: Wallet Adapter
sidebar_label: Wallet adapter
sidebar_position: 2
---

# Wallet adapter (`@qorechain/wallet-adapter`)

`@qorechain/wallet-adapter` adds QoreChain to Cosmos wallets that expose `signDirect` (Keplr, Leap, Cosmostation) and builds the transactions the chain requires: a native-lane transaction must carry an ML-DSA-87 (FIPS 204) signature next to the account's classical secp256k1 signature, and a stock wallet cannot make the ML-DSA-87 one. The adapter makes it, places it in the transaction body, and then asks the unchanged wallet for an ordinary signature. It is for dApp and wallet developers, and for tool builders who need unified QoreChain wallets, EVM authorization window messages or linked-key (authenticator) messages in JavaScript. The current version is 0.4.0.

If you only need a dApp to send a transaction from a user's QoreX wallet, the shortest path is [`qorexSignAndBroadcast`](#qorex) in this package, or the QoreX packages listed in the [Developer packages](/developer-tools/overview#group-qorex) index. If you are writing a wallet and want a full signing library in five languages, read [QoreSign](/qoresign/overview) first.

## Innovations {#innovations}

- **The wallet signs an ordinary body.** The adapter builds the body without the extension, signs the ML-DSA-87 layer over the sign-bytes, puts it into the body as the `/qorechain.pqc.v1.PQCHybridSignature` extension option (algorithm id 1), and only then calls `wallet.signDirect` on the finished `SignDoc`. The wallet produces a standard `SIGN_MODE_DIRECT` signature and needs no QoreChain-specific code. The result is the usual `TxRaw` bytes.
- **Per-network sign-bytes selector.** The ML-DSA-87 key signs one of two byte forms and a network verifies exactly one at any height. With `signBytesVersion: "auto"` (the default) the signer asks the node `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` for `v3.2.0` and then `v3.1.98`, signs the v2 form (domain tag `qorechain-pqc-hybrid-v2` plus the chain ID) if either height is above zero, caches the answer for 60 seconds per REST URL and chain ID, and throws instead of guessing when it cannot ask. Checked on 27 October 2026 against the live nodes: mainnet and testnet both resolve to `v2`, and a call for `qorechain-vladi` without `rest` throws. `refreshSignBytesVersion()` bypasses the cache and `isHybridSignBytesRejection()` recognizes the `pqc` code 21 refusal, so a caller can re-resolve and retry once when a network upgrades while a wallet is open.
- **One ML-DSA-87 key per mnemonic, shared across tools.** `walletFromMnemonic` derives the key as `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` fed to ML-DSA-87 key generation. It is bound to the account address and is the same derivation the SDK, `@qorechain/chain-bridge`, QoreX and the `qorechaind tx pqc recover-key` command use, so one mnemonic gives one key whichever tool signs. See [Deterministic key derivation and recovery](/developer-guide/post-quantum-signing#key-derivation).
- **One account, three address forms, one signing key.** `generateQoreWallet` and `walletFromMnemonic` return the `qor1`, `0x` (EIP-55) and SVM base58 forms of the same 20-byte identity together with the ML-DSA-87 keypair. `signClassicalEth` and `signHybridEth` sign Cosmos-lane transactions with that eth-native key (`eth_secp256k1`), so the same key also signs EVM transactions elsewhere.
- **PQC recovery codes.** `generatePqcRecoveryCode` returns a random 256-bit secret formatted `QRC1-` plus Crockford base32 with a 24-bit checksum. `pqcKeyFromRecoveryCode(code, address)` derives the ML-DSA-87 key from it, bound to the address. A mistyped character is refused with a message instead of silently deriving a key that matches nothing, and the code is deliberately not a seed phrase.
- **QoreX as the signer.** `qorexSignAndBroadcast` sends protobuf-encoded messages (1 to 32 per call, memo up to 256 bytes, gas limit 100,000 to 5,000,000) to the user's QoreX wallet, which shows them decoded, adds the ML-DSA-87 layer that only the wallet can make, signs and broadcasts. The adapter checks the bounds locally and refuses PQC key-management messages (`MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`, `MsgMigratePQCKey`, `MsgRotatePQCKey`), including inside an authz `MsgExec` at any depth. A `MsgExec` it cannot decode is refused.
- **Building blocks for the EVM authorization window, never an automatic one.** `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow`, `parseEvmWindow` and `isEvmWindowRejection` cover the window that must be open before an EVM send. Every bound (`blocks` 1 to 17,280, `maxTxs` 1 to 1,000, `maxValue` above zero) is required and checked client side with no default, window status fields are BigInt, and the package never opens a window by itself: the user is meant to see an explicit authorization step.
- **Linked-key (authenticator) messages with chain-exact digests.** `registerAuthenticatorMsg`, `registerEthAuthenticatorMsg`, `buildPhantomExecuteEvm`, `buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm` and `buildMetaMaskExecuteCosmos` build the messages that let a Phantom or MetaMask key spend from a QoreChain account under a permission set and spending rule. `evmAuthSignBytesV2` is the digest from chain v3.2.3, which also binds the call's gas limit (it must be non-zero). The nonce is the linked key's authenticator sequence, not the account's EVM nonce. See [Authenticators and delegated spending](/sdk/guides/authenticators).
- **Safe key rotation.** `rotateFromLegacyWalletKey` builds a `MsgRotatePQCKey` away from a key made by the withdrawn wallet-signature derivation, and refuses unless the key it re-derives equals the registered one. `rotatePqcKeyMsgFromMnemonic` moves a legacy `SHAKE-256(mnemonic)` key to the canonical address-bound key, and refuses the legacy derivation as the new key.

## How to use {#how-to-use}

Install the adapter with the two cosmjs peers (version 0.32):

```bash
npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing
```

The package is an ES module of plain JavaScript with TypeScript typings. The manifest has no tested quickstart for it. The snippets below come from the package typings and source; on 27 October 2026 the wallet generation, the sign-bytes resolver, the EVM window status read, `openEvmWindowMsg` and the withdrawn-function error were run against the published 0.4.0 package and the live testnet and mainnet REST endpoints, and the package's own 102 tests pass. The signing and QoreX snippets were not run end to end.

### Generate a unified wallet {#unified-wallet}

```js
import { generateQoreWallet, walletFromMnemonic } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();           // random 24-word mnemonic
// const w = await walletFromMnemonic(mnemonic); // or recover one
console.log(w.cosmos); // qor1...   (bech32)
console.log(w.evm);    // 0x...     (EIP-55)
console.log(w.svm);    // base58 form of the same 20 bytes
// w.privateKey, w.pubkey, w.pqc = { publicKey (2592 bytes), secretKey }
```

`walletFromSeed(seed32)` builds the same wallet from 32 secret bytes: the seed becomes the secp256k1 private key, so it must come from a secure random source or a key-derivation function over material only the user holds. Never derive it from a signature a website can ask a wallet to produce.

### Register the chain in the user's wallets {#register-chain}

```js
import { qoreChainInfo, addQoreEvmToWallet } from "@qorechain/wallet-adapter";

// Keplr and other Cosmos wallets. chainId defaults to the testnet, so pass it for mainnet.
await window.keplr.experimentalSuggestChain(
  qoreChainInfo({ chainId: "qorechain-vladi", rpc: "https://rpc.qore.host", rest: "https://api.qore.host" }),
);
await window.keplr.enable("qorechain-vladi");

// MetaMask and other EIP-1193 wallets (18-decimal native currency on the EVM lane).
await addQoreEvmToWallet(window.ethereum, {
  evmChainId: 9801, testnet: false, rpcUrl: "https://evm.qore.host",
});
```

`qoreChainInfo` uses coin type 118, bech32 prefix `qor`, denom `uqor` with 6 decimals and a gas price step of 0.1, 0.15 and 0.25 uqor per gas, which respects the 0.1 uqor per gas fee floor. `addQoreEvmToWallet` needs `rpcUrl`.

### Sign a hybrid transaction with a Cosmos wallet {#sign-hybrid}

```js
import { QoreChainSigner, pqcKeyFromRecoveryCode } from "@qorechain/wallet-adapter";

const signer = window.keplr.getOfflineSigner("qorechain-vladi");
const [account] = await signer.getAccounts();

// The account's ML-DSA-87 keypair, from a recovery code. Use this in a wallet or tool that
// legitimately owns the key; a web page should send its messages to QoreX instead (see below).
const pqc = await pqcKeyFromRecoveryCode(userRecoveryCode, account.address);

const adapter = new QoreChainSigner({
  wallet: window.keplr,
  chainId: "qorechain-vladi",
  address: account.address,
  pubkeySecp256k1: account.pubkey,
  accountNumber,                 // from GET /cosmos/auth/v1beta1/accounts/{address}
  pqc,
  rest: "https://api.qore.host", // lets the signer pick the sign-bytes form this network verifies
});

const txRaw = await adapter.signHybrid({ messages, fee, sequence }); // TxRaw bytes, with .signBytesVersion
// broadcast txRaw yourself (RPC broadcast_tx_sync or REST /cosmos/tx/v1beta1/txs)
```

Things to know:

- The adapter signs; you broadcast. It does not build the key registration message. Register the account's ML-DSA-87 key once with [QoreSign](/qoresign/quickstart) (`buildRegisterPqKeyMessage`), the SDK or the CLI (see [Registering your key](/developer-guide/post-quantum-signing#pqc-key-registration)); that first transaction is the one that may be signed classically.
- A web page that holds the account's ML-DSA-87 key is a design to avoid. `derivePqcKeyFromWallet`, which used to derive it from a wallet signature, was withdrawn in 0.3.0 and always throws. A dApp should send messages to QoreX (below) and let the wallet sign.
- If a broadcast is refused with `pqc` code 21 and you used `"auto"`, call `adapter.refreshSignBytesVersion()` and sign once more; do not retry when you passed an explicit `"v1"` or `"v2"`. See [Troubleshooting code 21](/developer-guide/post-quantum-signing#code-21).

### Send through QoreX {#qorex}

```js
import {
  hasQorexSignAndBroadcast, qorexSignAndBroadcast, isQorexRejection,
} from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

if (!hasQorexSignAndBroadcast()) throw new Error("Install or update QoreX");

try {
  const { txHash, code } = await qorexSignAndBroadcast({
    chainId: "qorechain-vladi",   // must equal the wallet's active network
    messages: [{
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress, amount })).finish(),
    }],
    gasLimit: 300_000,            // optional, 100,000 to 5,000,000
  });
  if (code !== 0) throw new Error(`rejected by the chain with code ${code}`);
} catch (err) {
  if (isQorexRejection(err)) return; // the user declined; not a failure
  throw err;
}
```

`value` is protobuf bytes (a `Uint8Array`, a number array or base64), signed exactly as given. A dApp cannot switch the wallet's network. It needs QoreX extension 0.3.5 or app 1.1.5 or later; test with `hasQorexSignAndBroadcast()` instead of a version check. The wire-level contract is in [QoreX Browser Extension](/qorex/browser-extension#sign-and-broadcast).

### Build an EVM window message {#evm-window}

```js
import { openEvmWindowMsg, fetchEvmWindow } from "@qorechain/wallet-adapter";

const status = await fetchEvmWindow({ rest: "https://api.qore.host", address: qor1 });
if (!status.live) {
  const msg = openEvmWindowMsg({
    sender: qor1,
    blocks: 300,        // 1 to 17280
    maxTxs: 3,          // 1 to 1000
    maxValue: "250000", // uqor: value plus the maximum fee of each admitted transaction
  });
  // sign it with signHybrid (or signHybridEth) and broadcast: it is an ordinary Cosmos-lane message
}
```

Order matters: open the window, then read the EVM nonce, then sign the EVM transaction, because opening a window advances the account's sequence, which is also its EVM nonce. `openEvmWindowMsg` builds the unscoped form of the window only; a scoped window (`native_only`, `allowed_targets`) needs the SDK. Background: [EVM authorization window](/sdk/guides/evm#evm-window) and [Your First Transaction](/getting-started/first-transaction#evm-window).

### Other entry points

| Task | Functions |
|---|---|
| Recover or rotate a PQC key | `generatePqcRecoveryCode`, `pqcKeyFromRecoveryCode`, `isValidRecoveryCode`, `rotatePqcKeyMsgFromMnemonic`, `rotateFromLegacyWalletKey`, `rotatePqcKeyMsg` |
| Sign with the eth-native key | `signClassicalEth` (the classical key registration), `signHybridEth` |
| Sign-bytes helpers | `hybridSignBytes(version, chainId, body, authInfo)`, `resolveSignBytesVersion`, `signBytesVersionFor`, `SIGN_BYTES_V2_UPGRADES` |
| Link and spend with an external key | `registerAuthenticatorMsg`, `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`, the `buildPhantom*` and `buildMetaMask*` functions |

## How to access {#how-to-access}

- **Networks:** mainnet `qorechain-vladi` and testnet `qorechain-diana`. Pass `chainId` and the matching `rest` URL ([endpoints](/developer-tools/overview#how-to-access)).
- **Wallets:** Keplr is the wallet the QoreSign guide and the examples use ([Keplr-compatible wallets](/qoresign/guides/keplr-compatible-wallets)). Leap and Cosmostation expose the same `signDirect` interface and the package is written for any such wallet; it was not checked against them for this page. MetaMask uses the EVM lane, not the adapter's signer, and needs an open EVM window for every send ([Developer packages](/developer-tools/overview#how-to-access)). Phantom links as an authenticator.
- **Account and key:** an account funded with QOR for the fee, and the account's ML-DSA-87 key registered on chain before the first hybrid transaction.
- **Prerequisites:** Node.js with ES modules, or a bundler for the browser. Peer dependencies `@cosmjs/stargate` and `@cosmjs/proto-signing` `^0.32`. Runtime dependencies: `@qorechain/pqc` `^0.2.1`, `cosmjs-types` `^0.9.0`, `@cosmjs/crypto` and `@cosmjs/encoding` `^0.32`.
- **Cost:** the package is free; transactions pay the network fee at 0.1 uqor per gas or more. Registering a key uses a large gas limit because the ML-DSA-87 public key is 2,592 bytes.

## Where it is published {#where-published}

| Registry | Package | Version | Link |
|---|---|---|---|
| npm | `@qorechain/wallet-adapter` | 0.4.0 (published 20 October 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/wallet-adapter) |

Source: [github.com/qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter) (public, tag `v0.4.0`, Apache-2.0). It is not published on PyPI, crates.io, Maven Central or the Go proxy. Related: [Developer packages](/developer-tools/overview), [QoreSign](/qoresign/overview), [Post-Quantum Signing](/developer-guide/post-quantum-signing), [Exchange integration](/developer-guide/exchange-integration).

## Limits and known issues {#limits}

- **It signs; it does not broadcast, register keys or open windows.** There is no function that registers the ML-DSA-87 key, and nothing opens an EVM window for you.
- **No proof of possession.** A key registration made with tooling that only uses this package carries none. The chain still accepts it, and verifies the proof when one is present ([Proof of possession](/developer-guide/post-quantum-signing#proof-of-possession)).
- **`derivePqcKeyFromWallet` is withdrawn** (0.3.0) and always throws. Accounts that registered a key with it should rotate it with `rotateFromLegacyWalletKey`.
- **Unscoped windows only.** `openEvmWindowMsg` has no scope fields.
- **`qoreChainInfo` defaults to the testnet.** Always pass `chainId` for mainnet.
- **Authenticator nonces.** No query exposes the linked key's authenticator sequence yet, so you must track it; the chain answers `abstractaccount` code 11 when the value is wrong. The authenticator module is enabled on testnet and switched off on mainnet (see the [SDK overview](/sdk/overview)).
- **cosmjs 0.32 peers.** The SDK uses cosmjs 0.39; installing both in one project gives an `ERESOLVE` error, so keep them apart or pass `--legacy-peer-deps`.
- **Do not copy from the package README.** It still says mainnet verifies the first sign-bytes form and that a MetaMask send needs no extra step. Both are out of date: both networks verify v2, and an EVM send needs a registered key and an open window.
- **No tested quickstart** is recorded for this package, and the QoreX path needs the wallet installed, so it cannot run in a script.
