---
slug: /sdk/faq
title: FAQ & Troubleshooting
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ & troubleshooting

## Is mainnet live?

Yes. Mainnet is **live** (chain id `qorechain-vladi`). The testnet preset
(`qorechain-diana`) also remains available. Both presets ship localhost endpoint
defaults; select the network with `createClient({ network: "mainnet" })` and
override `endpoints` with your node URLs. See
[Network & endpoints](/sdk/reference/network).

## Why do my calls hit localhost?

`createClient()` defaults to **localhost** endpoints. To talk to a real node,
pass an `endpoints` object:

```ts
const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",
    rpc: "https://rpc-testnet.qore.host",
    evmRpc: "https://evm-testnet.qore.host",
  },
});
```

The signing path (`connectTx`) needs the consensus **`rpc`** endpoint; CosmWasm
reads also use it. REST reads use `rest`; EVM calls use `evmRpc` (and `qor_` calls
too, on a node that serves that namespace). The mainnet URLs are in the
[network reference](/sdk/reference/network#public-endpoints).

## "Cannot find module 'viem'" / "'@solana/web3.js'"

These are **peer dependencies** of `@qorechain/evm` and `@qorechain/svm`
respectively. Install them in your project:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## A precompile call throws "returned no data" / "feature not present"

The QoreChain EVM precompiles are compiled into the node but are **not yet
active** on mainnet or testnet: they answer only where their addresses are listed
in the EVM module's `active_static_precompiles` parameter, and that list is empty
on both networks. Today the call returns empty data, so viem reports
`returned no data ("0x")` and the helper throws on the public networks too (see
[EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status)).
On a plain EVM node the calls fail the same way. Check
`GET /cosmos/evm/vm/v1/params` and wrap each precompile call so the error is handled
per call.

## My `client.qor` call fails with -32601

`client.qor` calls the `qor_` JSON-RPC namespace, which no released node build
serves; `rpc_modules` on the public EVM endpoints lists only `eth`, `net`, `rpc`,
`txpool` and `web3`. Use a REST route instead, for example
`GET /qorechain/pqc/v1/account/{address}` (PQC key status) or
`GET /qorechain/burn/v1/stats`, through `client.rest.get(...)`. See
[the `qor_` namespace](/api-reference/json-rpc-qor_-namespace).

## My amounts are off by a factor of a million

QOR has **10^6** base `uqor` units. Use `toBase` / `fromBase` and do all math in
base units:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

Note the EVM runtime represents QOR with **18** decimals (EVM convention), which
is distinct from the Native `uqor` base of 10^6.

## Which packages are published, and where?

All of them. The TypeScript core (`@qorechain/sdk`, 0.8.3), the EVM/SVM adapters
(`@qorechain/evm`, `@qorechain/svm`, 0.8.0), the React kit (`@qorechain/react`,
0.8.3) and the `create-qorechain-dapp` scaffolder (0.8.0) are on npm; the Python
client is on PyPI (`pip install qorechain-sdk` at 0.8.3, import `qorsdk`); the Go
client is on the module proxy
(`go get github.com/qorechain/qorechain-sdk/packages/go/...`, tag
`packages/go/v0.8.4`); the Rust client is on crates.io (`cargo add qorechain-sdk`,
0.8.3); and the Java client is on Maven Central
(`io.github.qorechain:qorechain-sdk:0.8.3`). See [Install](/sdk/install) for the
full per-language commands.

## My mnemonic is rejected

The SDK validates both the BIP-39 wordlist **and** the checksum before deriving
any key, so a typo'd phrase raises instead of silently producing the wrong
account. Re-check the words; use `validateMnemonic` to test a phrase.

## Hybrid (PQC) transactions

Hybrid (classical + ML-DSA-87) submission is **live and required** on the Native
path: classical-only Native transactions are rejected on-chain (chain v3.2.0).
Before a hybrid tx PQC-verifies, the signer's PQC public key must be **registered
explicitly** with `MsgRegisterPQCKeyV2` (a classical-signed, hybrid-exempt
transaction); embedding the public key in the extension
(`includePqcPublicKey: true`) does **not** register it, and the chain does not
register a key on first use.
The chain accepts any valid FIPS-204 ML-DSA-87 signature, hedged or
deterministic. The SDK signs deterministically by default (since 0.5.1) so a
transaction always has the same signature and tx hash. If a hybrid tx fails with
`pqc` code 21 (`hybrid_verify_failed`), the cause is the sign-bytes version,
the chain-id, a stale PQC library or an unregistered key, never hedged signing.
Both networks verify the v2 sign-bytes form, so use SDK **0.8.1 or later** and
pass `rest` (or `signBytesVersion`): the builders throw on `qorechain-vladi` /
`qorechain-diana` without one of them. See
[Troubleshooting code 21](/developer-guide/post-quantum-signing#code-21) and
[Accounts & PQC signing](/sdk/concepts/accounts-pqc).

## My EVM transaction is refused with "no open EVM authorisation window"

Since chain v3.2.0 the EVM lane admits a transaction only from an account that has
a registered PQC key and an open authorization window. Register a key, open a
window, then send. See [EVM authorization window](/sdk/guides/evm#evm-window). With
the SDK, `classifyEvmWindowRejection(err)` returns `"no-pqc-key"`, `"no-window"`,
`"exhausted"` or `"invalid"`.

## My hybrid transactions fail at CheckTx with a tx parse error

Upgrade the SDK. Versions **0.6.0 and earlier** JSON-serialized the
`/qorechain.pqc.v1.PQCHybridSignature` tx-body extension, which the chain's tx
decoder rejects at CheckTx. Since **0.6.1** the extension is protobuf-encoded
(the value begins with `0x08`) in all five languages — hybrid transactions
built with older versions are rejected on-chain, in every lane (including
eth-native).

## My authenticator spend is rejected with `authenticator_replay`

(The `abstractaccount` module is switched off on both networks today; a spend is
refused with `abstract account module is disabled` before any nonce is checked.
See [Authenticators & delegated spending](/sdk/guides/authenticators). The
guidance below applies once the module is enabled.)

The nonce is wrong. `MsgExecuteEVM.nonce` must be the account's **current** EVM
nonce (the relayer is a different account, so do **not** add 1);
`MsgExecuteCosmos.nonce` is the **per-authenticator sequence** for
`(account, pubkey)`, a separate store counter. Refetch the value and re-sign.
Other authenticator failures decode via `decodeTxError`: `abstractaccount`
codes 5 (`spending_limit_exceeded`), 6 (`session_key_expired`), and
10 (`permission_denied`). See
[Authenticators & delegated spending](/sdk/guides/authenticators).
