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
reads also use it. REST reads use `rest`; EVM and `qor_` calls use `evmRpc`.

## "Cannot find module 'viem'" / "'@solana/web3.js'"

These are **peer dependencies** of `@qorechain/evm` and `@qorechain/svm`
respectively. Install them in your project:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## A precompile call throws "feature not present"

The EVM precompiles exist only on nodes running the QoreChain EVM Engine. On a
plain EVM node those calls fail. If you target heterogeneous nodes, wrap each
precompile call and handle the error per-call.

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

All of them. The TypeScript core (`@qorechain/sdk`), the EVM/SVM adapters
(`@qorechain/evm`, `@qorechain/svm`), the React kit (`@qorechain/react`), and
the `create-qorechain-dapp` scaffolder are on npm at `0.7.0`; the Python client
is on PyPI (`pip install qorechain-sdk` at `0.7.0`, import `qorsdk`); the Go
client is on the module proxy
(`go get github.com/qorechain/qorechain-sdk/packages/go/...`, tag
`packages/go/v0.7.0`); and the Java client is on Maven Central
(`io.github.qorechain:qorechain-sdk:0.7.0`). The Rust client is on crates.io
(`cargo add qorechain-sdk`) at the **latest published crate version**, which
currently lags 0.7.0 — install from crates.io or from the repo. See
[Install](/sdk/install) for the full per-language commands.

## My mnemonic is rejected

The SDK validates both the BIP-39 wordlist **and** the checksum before deriving
any key, so a typo'd phrase raises instead of silently producing the wrong
account. Re-check the words; use `validateMnemonic` to test a phrase.

## Hybrid (PQC) transactions

Hybrid (classical + ML-DSA-87) submission is **live and required** on the
Native path — classical-only Native transactions are rejected on-chain (chain
v3.1.95). Before a hybrid tx PQC-verifies, the signer's PQC public key must be
registered (`MsgRegisterPQCKeyV2`), or you can set
`includePqcPublicKey: true` to embed it for auto-registration on first use.
The chain accepts **only deterministic** ML-DSA-87 signatures (the SDK signs
deterministically by default since 0.5.1); hedged signatures fail with `pqc`
code 21 (`hybrid_verify_failed`). See
[Accounts & PQC signing](/sdk/concepts/accounts-pqc).

## My hybrid transactions fail at CheckTx with a tx parse error

Upgrade the SDK. Versions **0.6.0 and earlier** JSON-serialized the
`/qorechain.pqc.v1.PQCHybridSignature` tx-body extension, which the chain's tx
decoder rejects at CheckTx. Since **0.6.1** the extension is protobuf-encoded
(the value begins with `0x08`) in all five languages — hybrid transactions
built with older versions are rejected on-chain, in every lane (including
eth-native).

## My authenticator spend is rejected with `authenticator_replay`

The nonce is wrong. `MsgExecuteEVM.nonce` must be the account's **current** EVM
nonce (the relayer is a different account, so do **not** add 1);
`MsgExecuteCosmos.nonce` is the **per-authenticator sequence** for
`(account, pubkey)`, a separate store counter. Refetch the value and re-sign.
Other authenticator failures decode via `decodeTxError`: `abstractaccount`
codes 5 (`spending_limit_exceeded`), 6 (`session_key_expired`), and
10 (`permission_denied`). See
[Authenticators & delegated spending](/sdk/guides/authenticators).
