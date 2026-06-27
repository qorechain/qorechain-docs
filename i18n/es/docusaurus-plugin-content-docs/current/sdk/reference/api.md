---
slug: /sdk/reference/api
title: Referencia de la API
sidebar_label: API
sidebar_position: 3
---

# Referencia de la API

## TypeScript (`@qorechain/sdk`)

Los paquetes de TypeScript incluyen TSDoc completo en su superficie pública, y una
configuración de [TypeDoc](https://typedoc.org) está integrada en el paquete del núcleo. Para
generar la referencia HTML de la API de `@qorechain/sdk`:

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

Esto ejecuta el script `docs:api` (`typedoc`) definido en `packages/ts`, produciendo
el sitio de la API en el directorio de salida `docs/` de ese paquete. La salida generada
no se incluye en el control de versiones: ejecuta el comando localmente o intégralo en tu propia
canalización de documentación.

La propia configuración de TypeDoc del sitio de documentación se encuentra en `docs/typedoc.json`; apunta
al punto de entrada del paquete del núcleo para que también puedas regenerarla desde el proyecto de
documentación.

### La superficie pública de un vistazo

Las exportaciones deliberadas y compatibles de `@qorechain/sdk`:

- **Client:** `createClient`, tipos `QoreChainClient`, `CreateClientOptions`,
  `ConnectTxOptions`, `ClientFees`.
- **Networks:** preajustes, helpers de búsqueda/listado, y tipos de configuración (módulo
  networks).
- **Utilities:** `toBase` / `fromBase` (denominación), codificación/validación de direcciones.
- **Accounts:** `generateMnemonic`, `validateMnemonic`, `deriveNativeAccount`,
  `deriveEvmAccount`, `deriveSvmAccount`; tipos de cuenta.
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, constantes de longitud,
  IDs/helpers de algoritmo, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **Read clients:** `RestClient`, `JsonRpcClient`, `QorClient`, helpers HTTP
  (`getJson`, `postJsonRpc`, `buildUrl`, `joinUrl`, `QoreHttpError`).
- **Cross-VM:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **CosmWasm:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **Transactions:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient`,
  `MSG_SEND_TYPE_URL`, helpers híbridos (`encodeHybridExtension`,
  `attachHybridExtension`, `buildHybridTx`, `signAndBroadcastHybrid`).

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, los helpers `erc20`, wrappers de contrato
(`deployContract`, `readContract`, `writeContract`), los bindings `precompiles`,
`PRECOMPILE_ADDRESSES`, y las ABIs (`ERC20_ABI`, `IQORE_PQC_ABI`,
`IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, los constructores de programa (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`), y las constantes de program-id.

## Otros lenguajes

| Lenguaje | Documentación generada | Instalación |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — docstrings en la API pública | `pip install qorechain-sdk` (import `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...` |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` |

Cada paquete refleja la misma superficie (preajustes de red, utilidades de denominación/dirección,
derivación HD, primitivas PQC, clientes de lectura REST + `qor_` JSON-RPC),
documentada en línea en el código fuente para que la herramienta de documentación nativa del lenguaje la renderice.
