---
slug: /sdk/reference/api
title: API-Referenz
sidebar_label: API
sidebar_position: 3
---

# API-Referenz

## TypeScript (`@qorechain/sdk`)

Die TypeScript-Pakete liefern vollständige TSDoc-Kommentare auf ihrer öffentlichen
Oberfläche mit, und eine [TypeDoc](https://typedoc.org)-Konfiguration ist im
Core-Paket eingerichtet. So generieren Sie die HTML-API-Referenz für
`@qorechain/sdk`:

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

Dies führt das in `packages/ts` definierte Skript `docs:api` (`typedoc`) aus und
erzeugt die API-Site im `docs/`-Ausgabeverzeichnis dieses Pakets. Die generierte
Ausgabe wird nicht eingecheckt — führen Sie den Befehl lokal aus oder binden Sie
ihn in Ihre eigene Dokumentations-Pipeline ein.

Die eigene TypeDoc-Konfiguration der Dokumentationsseite liegt unter
`docs/typedoc.json`; sie verweist auf den Einstiegspunkt des Core-Pakets, sodass
Sie die Referenz auch aus dem Docs-Projekt heraus neu generieren können.

### Die öffentliche Oberfläche im Überblick

Die bewusst gewählten, unterstützten Exporte von `@qorechain/sdk`:

- **Client:** `createClient`, Typen `QoreChainClient`, `CreateClientOptions`,
  `ConnectTxOptions`, `ClientFees`.
- **Netzwerke:** Presets, Lookup-/Listen-Helfer und Konfigurationstypen
  (Networks-Modul).
- **Hilfsfunktionen:** `toBase` / `fromBase` (Denom), Adress-Kodierung und
  -Validierung.
- **Konten:** `generateMnemonic`, `validateMnemonic`, `deriveNativeAccount`,
  `deriveEvmAccount`, `deriveSvmAccount`; Kontotypen.
- **Unified Accounts (0.6.0):** `deriveUnifiedAccount`,
  `unifiedAccountFromSeed`, `addressesFrom20`, `qoreAddresses`,
  `unifiedAccountFromPhantomSignature`, `connectPhantomUnified`.
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, Längenkonstanten,
  Algorithmus-IDs/-Helfer, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **Read-Clients:** `RestClient` (inkl. `getPermissionSchema`),
  `JsonRpcClient`, `QorClient`, HTTP-Helfer (`getJson`, `postJsonRpc`,
  `buildUrl`, `joinUrl`, `QoreHttpError`); typisierte Query-Clients für jedes
  Modul, einschließlich `amm`, `license`, `abstractaccount`
  (`permissionSchema`) sowie der `multilayer`-State-Anchor-Abfragen
  `Anchor`/`Anchors`.
- **Cross-VM:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **CosmWasm:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **Transaktionen:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient`,
  `MSG_SEND_TYPE_URL`, Hybrid-Helfer (`encodeHybridExtension`,
  `attachHybridExtension`, `buildHybridTx`, `signAndBroadcastHybrid`);
  strukturierte Fehlerdekodierung über `decodeTxError` (inkl. der
  `abstractaccount`-Codes 5/6/10/11 und des `pqc`-Codes 21).
- **eth-natives Signieren (0.6.0):** `signClassicalEth`, `signHybridEth`
  (secp256k1 über `keccak256(SignDoc)`, Pubkey-Typ
  `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`, plus die
  ML-DSA-87-Hybrid-Extension), `EthNativeSigner`, `accountAuthInfo`.
- **Authenticator-Lanes (0.7.0):** Message-Composer
  `msg.abstractaccount.registerAuthenticator` / `revokeAuthenticator` /
  `executeEvm` / `executeCosmos` und die `msg.pqc`-Rotation (auch eigenständig
  exportiert als `executeEvmMsg`, `executeCosmosMsg`,
  `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`,
  `rotatePqcKeyMsg`); byte-exakte Sign-Bytes `evmAuthSignBytes`,
  `cosmosAuthSignBytes`, `rotationSignBytes`; Wallet-Builder
  `buildPhantomExecuteEvm` / `buildPhantomExecuteCosmos` (ed25519
  `signMessage`) und `buildMetaMaskExecuteEvm` / `buildMetaMaskExecuteCosmos`
  (EIP-191 `personal_sign`); Schlüsselrotation `rotatePqcKeyMsgFromMnemonic`,
  `derivePqcLegacy`. Siehe den
  [Authenticators-Leitfaden](/sdk/guides/authenticators).

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, die `erc20`-Helfer,
Contract-Wrapper (`deployContract`, `readContract`, `writeContract`), die
`precompiles`-Bindings, `PRECOMPILE_ADDRESSES` und die ABIs (`ERC20_ABI`,
`IQORE_PQC_ABI`, `IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, die Program-Builder (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`) sowie die
Program-ID-Konstanten.

## Weitere Sprachen

| Sprache | Generierte Dokumentation | Installation |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — Docstrings auf der öffentlichen API | `pip install qorechain-sdk` in Version `0.7.0` (Import `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...` (Tag `packages/go/v0.7.0`) |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` — neueste veröffentlichte Crate (0.7.0 aus dem Repo; Import `qorechain`) |
| Java | Maven-Central-Javadoc | `io.github.qorechain:qorechain-sdk:0.7.0` |

Jedes Paket spiegelt dieselbe Oberfläche wider (Netzwerk-Presets,
Denom-/Adress-Hilfsfunktionen, HD-Ableitung — einschließlich unified
eth-nativer Konten — PQC-Primitive und Hybrid-Signieren, typisierte Messages
und Queries, die Authenticator-Lanes sowie REST- und
`qor_`-JSON-RPC-Read-Clients), dokumentiert direkt im Quellcode, sodass das
sprachspezifische Dokumentations-Tooling sie rendert. Die
TypeScript-Wallet-Builder (`buildPhantom*` / `buildMetaMask*`) und die
Browser-Wallet-Adapter gibt es nur in TypeScript.
