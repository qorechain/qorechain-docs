---
slug: /sdk/faq
title: FAQ & Troubleshooting
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ & troubleshooting

## Is mainnet live?

Yes. Mainnet is **live** (chain id `qorechain-vladi`, live since 7 June 2026) and
runs chain version v3.2.4 (applied at height 3,742,566 on 23 October 2026, governance proposal 13); the testnet runs v3.2.6 (applied on 27 October 2026). The testnet preset
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

The signing path (`connectTx`) needs the consensus **`rpc`** endpoint; QoreChain Native
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

The QoreChain EVM precompiles are compiled into the node but are **not active
on mainnet**, and only three are active on the testnet: they answer only where
their addresses are listed in the EVM module's `active_static_precompiles`
parameter. That list is empty on mainnet; on the testnet it holds the PQC verify
(`0x…0A01`), PQC key status (`0x…0A02`) and consensus-parameters (`0x…0C01`)
precompiles (checked 27 October 2026), so the AI pair and the cross-VM bridge still
answer nothing there. Where a precompile is inactive the call returns empty data,
so viem reports `returned no data ("0x")` and the helper throws (see
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

All of them (checked 27 October 2026). The TypeScript core (`@qorechain/sdk`, 0.10.0),
the React kit (`@qorechain/react`, 0.10.0), the `create-qorechain-dapp` scaffolder
(0.10.0) and the EVM/SVM adapters (`@qorechain/evm`, `@qorechain/svm`, 0.8.0) are on
npm; the Python client is on PyPI (`pip install qorechain-sdk` at 0.10.0, import
`qorsdk`); the Go client is on the module proxy
(`go get github.com/qorechain/qorechain-sdk/packages/go@v0.10.0`); the Rust client is
on crates.io (`cargo add qorechain-sdk`, 0.10.0); and the Java client is on Maven
Central (`io.github.qorechain:qorechain-sdk:0.10.0`). See [Install](/sdk/install) for the full
per-language commands.

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
register a key on first use. In TypeScript, give the client the keypair
(`client.connectTx(signer, { pqcKeypair })`, SDK 0.9.0 or later) and every transaction it
sends is signed hybrid.
The chain accepts any valid FIPS-204 ML-DSA-87 signature, hedged or
deterministic. The SDK signs deterministically by default (since 0.5.1) so a
transaction always has the same signature and tx hash. If a hybrid tx fails with
`pqc` code 21 (`hybrid_verify_failed`), the cause is the sign-bytes version,
the chain-id, a stale PQC library or an unregistered or different key, never hedged
signing.
Both networks verify the v2 sign-bytes form, so use SDK **0.8.1 or later** (0.10.0
is current) and pass `rest` (or `signBytesVersion`): the builders throw on
`qorechain-vladi` / `qorechain-diana` without one of them. See
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

## Which chain versions does the SDK work with?

SDK **0.10.0** is the client release for chain **v3.2.4** (mainnet since 23 October
2026 at height 3,742,566, governance proposal 13; the testnet since 19 October). It
adds the staking-tier builders and reads, `fetchAuthNonce` and the protocol-feature
reads (see [What 0.10.0 adds](/sdk/install#whats-new-0100)), on top of what 0.9.0
added for v3.2.2 and v3.2.3: builders for the optional proof of
possession on registration (attached automatically by `ensurePqcRegistered` once the
network has applied v3.2.3), scoped EVM windows and the EIP-7702 consent messages.
SDK **0.8.1 or later** also transacts on both networks (the v2 hybrid sign-bytes
form, registration, hybrid sends and the EVM window work unchanged), but it has none
of those builders: use the CLI for them (see
[Versions before 0.9.0](/sdk/install#before-090)). The signing format did not change
in v3.2.4. The testnet runs v3.2.6 (v3.2.5 was applied there on 26 October 2026 and
v3.2.6 on 27 October); the SDK has no builder for anything introduced after v3.2.4,
and the features of the next mainnet release are documented the day mainnet applies it.

## My PQC key registration was refused but the fee was taken

A registration for an account that already holds a key is refused by the chain
after the fee is deducted. `ensurePqcRegistered` in 0.9.0 and later reads
`GET /qorechain/pqc/v1/account/{address}` first (pass `rest`), skips the registration
when this keypair's key is registered, and throws `PqcKeyMismatchError` when a
different one is. Earlier releases did not look first unless you passed
`status: { registered: found }` yourself, where `found` comes from that route. Since
v3.2.3 the chain also refuses weak, degenerate and reused keys; keys from
`derivePqcCanonical` or `tx pqc gen-key` are fine.

## `create-qorechain-dapp` installs an SDK that cannot sign

Only version 0.8.0 of the scaffolder did: it wrote `^0.3.0` ranges for
`@qorechain/sdk` and `@qorechain/evm`, and a caret range on a 0.x version stays
inside 0.3. Version 0.9.0 and later scaffold on the current SDK; if you used 0.8.0, run
`npm i @qorechain/sdk@latest` (and `@qorechain/evm@latest`) after scaffolding.

## `VERSION` says 0.8.0 but I installed 0.8.3

The exported `VERSION` constant of 0.8.3 was not updated and reports `0.8.0`; from
0.9.0 it matches the package. Read the installed version from `package.json` on
earlier releases.

## My authenticator spend is rejected with `authenticator_replay`

(The `abstractaccount` module is switched off on mainnet; a spend there is
refused with `abstract account module is disabled` before any nonce is checked. It
is enabled on the testnet. See
[Authenticators & delegated spending](/sdk/guides/authenticators). The
guidance below applies wherever the module is enabled.)

The nonce is wrong. Both `MsgExecuteEVM.nonce` and `MsgExecuteCosmos.nonce` are the
linked key's **authenticator sequence** for `(account, pubkey)`: a counter the chain
keeps per linked key, starting at 0 and incremented by each successful execution. It
is **not** the account's EVM nonce. Read it with `fetchAuthNonce` (SDK 0.10.0, chain
v3.2.4 or later), or track it per linked key on older versions. Since v3.2.3 the EVM lane also signs `evmAuthSignBytesV2`, which binds the
call's gas limit (`resolveEvmAuthDigestVersion` picks the form). Use the counter
you read (or track) for that key and re-sign.

Other authenticator failures decode via `decodeTxError`: `abstractaccount`
codes 5 (`spending_limit_exceeded`), 6 (`session_key_expired`), and
10 (`permission_denied`). See
[Authenticators & delegated spending](/sdk/guides/authenticators).
