---
slug: /sdk/reference/api
title: API Reference
sidebar_label: API
sidebar_position: 3
---

# API reference

## TypeScript (`@qorechain/sdk`)

The TypeScript packages ship full TSDoc on their public surface, and a
[TypeDoc](https://typedoc.org) configuration is wired into the core package. To
generate the HTML API reference for `@qorechain/sdk`:

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

This runs the `docs:api` script (`typedoc`) defined in `packages/ts`, producing
the API site under that package's `docs/` output directory. The generated output
is not committed — run the command locally or wire it into your own docs
pipeline.

The documentation site's own TypeDoc config lives at `docs/typedoc.json`; it
points at the core package's entry point so you can regenerate from the docs
project as well.

### Public surface at a glance

The deliberate, supported exports of `@qorechain/sdk`:

- **Client:** `createClient`, types `QoreChainClient`, `CreateClientOptions`,
  `ConnectTxOptions`, `ClientFees`.
- **Networks:** presets, lookup/list helpers, and config types (networks
  module).
- **Utilities:** `toBase` / `fromBase` (denom), address encoding/validation.
- **Accounts:** `generateMnemonic`, `validateMnemonic`, `deriveNativeAccount`,
  `deriveEvmAccount`, `deriveSvmAccount`; account types.
- **Unified accounts (0.6.0):** `deriveUnifiedAccount`,
  `unifiedAccountFromSeed`, `addressesFrom20`, `qoreAddresses`. (`unifiedAccountFromPhantomSignature` and `connectPhantomUnified` were removed in 0.8.0 and throw.)
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, length constants,
  algorithm IDs/helpers, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **Read clients:** `RestClient` (incl. `getPermissionSchema`),
  `JsonRpcClient`, `QorClient`, HTTP helpers (`getJson`, `postJsonRpc`,
  `buildUrl`, `joinUrl`, `QoreHttpError`); typed query clients for every
  module, including `amm`, `license`, `abstractaccount`
  (`permissionSchema`), and the `multilayer` `Anchor`/`Anchors` state-anchor
  queries. On the public endpoints some typed REST helpers call routes the
  gateway does not serve: `getAiStats`, `getFeeEstimate`, `getXqorePosition`,
  `getInflationRate`, `getReputation` and `getPqcAccount` (which calls a plural `accounts`
  path; the served route is the singular `/qorechain/pqc/v1/account/{address}`,
  reachable with `rest.get(...)`).
  `getBurnStats`, `getAllBalances`, `getBridgeChains` and `getPermissionSchema`
  work.
- **Cross-VM:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **CosmWasm:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **Transactions:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient`,
  `MSG_SEND_TYPE_URL`, hybrid helpers (`encodeHybridExtension`,
  `attachHybridExtension`, `buildHybridTx`, `signAndBroadcastHybrid`);
  structured error decoding via `decodeTxError` (incl. `abstractaccount`
  codes 5/6/10/11 and `pqc` code 21).
- **eth-native signing (0.6.0):** `signClassicalEth`, `signHybridEth`
  (secp256k1 over `keccak256(SignDoc)`, pubkey type
  `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`, plus the ML-DSA-87 hybrid
  extension), `EthNativeSigner`, `accountAuthInfo`.
- **Authenticator lanes (0.7.0):** message composers
  `msg.abstractaccount.registerAuthenticator` / `revokeAuthenticator` /
  `executeEvm` / `executeCosmos` and `msg.pqc` rotation (also exported
  standalone as `executeEvmMsg`, `executeCosmosMsg`,
  `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`,
  `rotatePqcKeyMsg`); byte-exact sign-bytes `evmAuthSignBytes`,
  `cosmosAuthSignBytes`, `rotationSignBytes`; wallet builders
  `buildPhantomExecuteEvm` / `buildPhantomExecuteCosmos` (ed25519
  `signMessage`) and `buildMetaMaskExecuteEvm` / `buildMetaMaskExecuteCosmos`
  (EIP-191 `personal_sign`); key rotation `rotatePqcKeyMsgFromMnemonic`,
  `derivePqcLegacy`. See the
  [Authenticators guide](/sdk/guides/authenticators) (the module behind these
  lanes is switched off on both networks today).
- **Hybrid sign-bytes (0.8.0+):** the `signBytesVersion` option
  (`"auto" | "v1" | "v2"`) on `buildHybridTx`, `signAndBroadcastHybrid`,
  `signHybridEth` and `EthNativeSigner`; `resolveSignBytesVersion`,
  `SIGN_BYTES_V2_UPGRADES`, `isHybridSignBytesRejection`, `hybridSignBytesV1` /
  `hybridSignBytesV2`, `migrationSignBytes`, `bridgeAttestationSignBytes`.
- **EVM authorization window (0.8.2+):** `openEvmWindowMsg`, `closeEvmWindowMsg`,
  `fetchEvmWindow`, `classifyEvmWindowRejection`, `isEvmWindowRejection`,
  `MAX_EVM_WINDOW_BLOCKS`, `MAX_EVM_WINDOW_TXS`. See
  [EVM authorization window](/sdk/guides/evm#evm-window).
- **Canonical PQC derivation (0.8.3+):** `derivePqcCanonical(account, mnemonic)`,
  `canonicalAccount(account)`; the PQC registration message is
  `buildRegisterPqcKeyMsg` (used by `ensurePqcRegistered`).

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, the `erc20` helpers, contract
wrappers (`deployContract`, `readContract`, `writeContract`), the `precompiles`
bindings, the precompile-backed helpers `simulateWithRiskScore`, `aiRiskScore` and
`aiAnomalyCheck`, `PRECOMPILE_ADDRESSES`, and the ABIs (`ERC20_ABI`,
`IQORE_PQC_ABI`, `IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`). The precompile-backed
bindings and helpers are not active on the public networks (see
[EVM Precompiles](/developer-guide/evm-precompiles#network-status)).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, the program builders (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`), and the program-id
constants.

## Other languages

| Language | Generated docs | Install |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — docstrings on the public API | `pip install qorechain-sdk` at `0.8.3` (import `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...` (tag `packages/go/v0.8.4`) |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` (0.8.3; import `qorechain`) |
| Java | Maven Central javadoc | `io.github.qorechain:qorechain-sdk:0.8.3` |

Each package mirrors the same surface (network presets, denom/address
utilities, HD derivation — including unified eth-native accounts — PQC
primitives and hybrid signing, typed messages and queries, the authenticator
lanes, and REST + `qor_` JSON-RPC read clients), documented inline in the
source so the language-native doc tooling renders it. The TypeScript wallet
builders (`buildPhantom*` / `buildMetaMask*`) and the browser-wallet adapters
are TypeScript-only.
