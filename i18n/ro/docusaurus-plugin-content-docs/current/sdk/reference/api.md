---
slug: /sdk/reference/api
title: Referință API
sidebar_label: API
sidebar_position: 3
---

# Referință API

## TypeScript (`@qorechain/sdk`)

Pachetele TypeScript livrează TSDoc complet pe suprafața lor publică, iar o
configurație [TypeDoc](https://typedoc.org) este integrată în pachetul de bază.
Pentru a genera referința API HTML pentru `@qorechain/sdk`:

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

Aceasta rulează scriptul `docs:api` (`typedoc`) definit în `packages/ts`,
producând site-ul API în directorul de ieșire `docs/` al acelui pachet. Ieșirea
generată nu este comisă — rulează comanda local sau integreaz-o în propriul tău
pipeline de documentație.

Configurația TypeDoc proprie a site-ului de documentație se află la
`docs/typedoc.json`; aceasta indică spre punctul de intrare al pachetului de
bază, astfel încât poți regenera și din proiectul de documentație.

### Suprafața publică pe scurt

Exporturile deliberate și suportate ale `@qorechain/sdk`:

- **Client:** `createClient`, tipurile `QoreChainClient`, `CreateClientOptions`,
  `ConnectTxOptions`, `ClientFees`.
- **Rețele:** presetări, helperi de căutare/listare și tipuri de configurație
  (modulul networks).
- **Utilitare:** `toBase` / `fromBase` (denom), codare/validare de adrese.
- **Conturi:** `generateMnemonic`, `validateMnemonic`, `deriveNativeAccount`,
  `deriveEvmAccount`, `deriveSvmAccount`; tipurile de conturi.
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, constante de lungime,
  ID-uri/helperi de algoritm, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **Clienți de citire:** `RestClient`, `JsonRpcClient`, `QorClient`, helperi HTTP
  (`getJson`, `postJsonRpc`, `buildUrl`, `joinUrl`, `QoreHttpError`).
- **Cross-VM:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **CosmWasm:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **Tranzacții:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient`,
  `MSG_SEND_TYPE_URL`, helperi hibrizi (`encodeHybridExtension`,
  `attachHybridExtension`, `buildHybridTx`, `signAndBroadcastHybrid`).

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, helperii `erc20`, wrapperele de
contract (`deployContract`, `readContract`, `writeContract`), legăturile
`precompiles`, `PRECOMPILE_ADDRESSES` și ABI-urile (`ERC20_ABI`, `IQORE_PQC_ABI`,
`IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, constructorii de program (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`) și constantele de
program-id.

## Alte limbaje

| Limbaj | Documentație generată | Instalare |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — docstrings pe API-ul public | `pip install qorechain-sdk` (import `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...` |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` |

Fiecare pachet reflectă aceeași suprafață (presetări de rețea, utilitare
denom/adresă, derivare HD, primitive PQC, clienți de citire REST + `qor_`
JSON-RPC), documentată inline în sursă, astfel încât instrumentele native de
documentație ale limbajului o redau.
