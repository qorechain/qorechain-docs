---
slug: /sdk/reference/api
title: Riferimento API
sidebar_label: API
sidebar_position: 3
---

# Riferimento API

## TypeScript (`@qorechain/sdk`)

I pacchetti TypeScript includono TSDoc completo sulla loro superficie pubblica, e una
configurazione [TypeDoc](https://typedoc.org) è integrata nel pacchetto core. Per
generare il riferimento API HTML per `@qorechain/sdk`:

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

Questo esegue lo script `docs:api` (`typedoc`) definito in `packages/ts`, producendo
il sito API nella directory di output `docs/` di quel pacchetto. L'output generato
non viene committato — esegui il comando localmente oppure integralo nella tua pipeline
di documentazione.

La configurazione TypeDoc del sito di documentazione si trova in `docs/typedoc.json`;
punta all'entry point del pacchetto core così da poter rigenerare anche dal progetto
di documentazione.

### Superficie pubblica in sintesi

Gli export deliberati e supportati di `@qorechain/sdk`:

- **Client:** `createClient`, tipi `QoreChainClient`, `CreateClientOptions`,
  `ConnectTxOptions`, `ClientFees`.
- **Reti:** preset, helper di lookup/list e tipi di configurazione (modulo
  networks).
- **Utilità:** `toBase` / `fromBase` (denom), codifica/validazione degli indirizzi.
- **Account:** `generateMnemonic`, `validateMnemonic`, `deriveNativeAccount`,
  `deriveEvmAccount`, `deriveSvmAccount`; tipi di account.
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, costanti di lunghezza,
  ID/helper di algoritmo, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **Client di lettura:** `RestClient`, `JsonRpcClient`, `QorClient`, helper HTTP
  (`getJson`, `postJsonRpc`, `buildUrl`, `joinUrl`, `QoreHttpError`).
- **Cross-VM:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **CosmWasm:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **Transazioni:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient`,
  `MSG_SEND_TYPE_URL`, helper ibridi (`encodeHybridExtension`,
  `attachHybridExtension`, `buildHybridTx`, `signAndBroadcastHybrid`).

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, gli helper `erc20`, i wrapper dei
contratti (`deployContract`, `readContract`, `writeContract`), i binding `precompiles`,
`PRECOMPILE_ADDRESSES` e le ABI (`ERC20_ABI`, `IQORE_PQC_ABI`,
`IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, i builder dei programmi (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`) e le costanti program-id.

## Altri linguaggi

| Linguaggio | Documentazione generata | Installazione |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — docstring sull'API pubblica | `pip install qorechain-sdk` (importa `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...` |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` |

Ogni pacchetto rispecchia la stessa superficie (preset di rete, utilità
denom/indirizzi, derivazione HD, primitive PQC, client di lettura REST + `qor_`
JSON-RPC), documentata inline nel sorgente così che gli strumenti di documentazione
nativi del linguaggio la rendano.
