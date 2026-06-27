---
slug: /sdk/reference/api
title: API-Referenz
sidebar_label: API
sidebar_position: 3
---

# API-Referenz

## TypeScript (`@qorechain/sdk`)

Die TypeScript-Pakete liefern vollständige TSDoc auf ihrer öffentlichen Fläche, und
eine [TypeDoc](https://typedoc.org)-Konfiguration ist in das Kernpaket eingebunden. Um
die HTML-API-Referenz für `@qorechain/sdk` zu generieren:

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

Dies führt das in `packages/ts` definierte `docs:api`-Skript (`typedoc`) aus und
erzeugt die API-Site im `docs/`-Ausgabeverzeichnis dieses Pakets. Die generierte
Ausgabe wird nicht eingecheckt – führen Sie den Befehl lokal aus oder binden Sie ihn in
Ihre eigene Docs-Pipeline ein.

Die eigene TypeDoc-Konfiguration der Dokumentations-Site liegt unter
`docs/typedoc.json`; sie zeigt auf den Einstiegspunkt des Kernpakets, sodass Sie auch
vom Docs-Projekt aus neu generieren können.

### Die öffentliche Fläche auf einen Blick

Die bewussten, unterstützten Exporte von `@qorechain/sdk`:

- **Client:** `createClient`, Typen `QoreChainClient`, `CreateClientOptions`,
  `ConnectTxOptions`, `ClientFees`.
- **Netzwerke:** Voreinstellungen, Lookup-/Listen-Helfer und Konfigurationstypen
  (networks-Modul).
- **Hilfsfunktionen:** `toBase` / `fromBase` (Denom), Adresskodierung/-validierung.
- **Konten:** `generateMnemonic`, `validateMnemonic`, `deriveNativeAccount`,
  `deriveEvmAccount`, `deriveSvmAccount`; Kontotypen.
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, Längenkonstanten,
  Algorithmus-IDs/-Helfer, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **Read-Clients:** `RestClient`, `JsonRpcClient`, `QorClient`, HTTP-Helfer
  (`getJson`, `postJsonRpc`, `buildUrl`, `joinUrl`, `QoreHttpError`).
- **VM-übergreifend:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **CosmWasm:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **Transaktionen:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient`,
  `MSG_SEND_TYPE_URL`, Hybrid-Helfer (`encodeHybridExtension`,
  `attachHybridExtension`, `buildHybridTx`, `signAndBroadcastHybrid`).

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, die `erc20`-Helfer, Contract-
Wrapper (`deployContract`, `readContract`, `writeContract`), die `precompiles`-
Bindings, `PRECOMPILE_ADDRESSES` und die ABIs (`ERC20_ABI`, `IQORE_PQC_ABI`,
`IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, die Programm-Builder (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`) und die Programm-ID-
Konstanten.

## Andere Sprachen

| Sprache | Generierte Docs | Installation |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — Docstrings auf der öffentlichen API | `pip install qorechain-sdk` (Import `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...` |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` |

Jedes Paket spiegelt dieselbe Fläche wider (Netzwerk-Voreinstellungen, Denom-/Adress-
Hilfsfunktionen, HD-Ableitung, PQC-Primitive, REST- + `qor_`-JSON-RPC-Read-Clients),
inline im Quellcode dokumentiert, sodass die sprachnative Doku-Tooling sie rendert.
