---
slug: /sdk/reference/api
title: Referencia de la API
sidebar_label: API
sidebar_position: 3
---

# Referencia de la API

## TypeScript (`@qorechain/sdk`)

Los paquetes de TypeScript incluyen TSDoc completo en su superficie pública, y el
paquete principal trae integrada una configuración de
[TypeDoc](https://typedoc.org). Para generar la referencia HTML de la API de
`@qorechain/sdk`:

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

Esto ejecuta el script `docs:api` (`typedoc`) definido en `packages/ts`, y
produce el sitio de la API bajo el directorio de salida `docs/` de ese paquete.
La salida generada no se versiona en el repositorio: ejecuta el comando en local
o intégralo en tu propio pipeline de documentación.

La configuración de TypeDoc propia del sitio de documentación vive en
`docs/typedoc.json`; apunta al punto de entrada del paquete principal, de modo
que también puedes regenerarla desde el proyecto de documentación.

### La superficie pública de un vistazo

Las exportaciones deliberadas y soportadas de `@qorechain/sdk`:

- **Cliente:** `createClient`, tipos `QoreChainClient`, `CreateClientOptions`,
  `ConnectTxOptions`, `ClientFees`.
- **Redes:** presets, helpers de búsqueda/listado y tipos de configuración
  (módulo de redes).
- **Utilidades:** `toBase` / `fromBase` (denom), codificación/validación de
  direcciones.
- **Cuentas:** `generateMnemonic`, `validateMnemonic`, `deriveNativeAccount`,
  `deriveEvmAccount`, `deriveSvmAccount`; tipos de cuenta.
- **Cuentas unificadas (0.6.0):** `deriveUnifiedAccount`,
  `unifiedAccountFromSeed`, `addressesFrom20`, `qoreAddresses`,
  `unifiedAccountFromPhantomSignature`, `connectPhantomUnified`.
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, constantes de longitud,
  IDs/helpers de algoritmos, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **Clientes de lectura:** `RestClient` (incl. `getPermissionSchema`),
  `JsonRpcClient`, `QorClient`, helpers HTTP (`getJson`, `postJsonRpc`,
  `buildUrl`, `joinUrl`, `QoreHttpError`); clientes de consulta tipados para
  cada módulo, incluidos `amm`, `license`, `abstractaccount`
  (`permissionSchema`) y las consultas de anclaje de estado `Anchor`/`Anchors`
  del módulo `multilayer`.
- **Cross-VM:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **CosmWasm:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **Transacciones:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient`,
  `MSG_SEND_TYPE_URL`, helpers híbridos (`encodeHybridExtension`,
  `attachHybridExtension`, `buildHybridTx`, `signAndBroadcastHybrid`);
  decodificación estructurada de errores mediante `decodeTxError` (incl. los
  códigos 5/6/10/11 de `abstractaccount` y el código 21 de `pqc`).
- **Firma eth-native (0.6.0):** `signClassicalEth`, `signHybridEth`
  (secp256k1 sobre `keccak256(SignDoc)`, tipo de pubkey
  `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`, más la extensión híbrida
  ML-DSA-87), `EthNativeSigner`, `accountAuthInfo`.
- **Lanes de autenticadores (0.7.0):** compositores de mensajes
  `msg.abstractaccount.registerAuthenticator` / `revokeAuthenticator` /
  `executeEvm` / `executeCosmos` y la rotación `msg.pqc` (también exportados
  de forma independiente como `executeEvmMsg`, `executeCosmosMsg`,
  `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`,
  `rotatePqcKeyMsg`); sign-bytes exactos a nivel de byte `evmAuthSignBytes`,
  `cosmosAuthSignBytes`, `rotationSignBytes`; builders de wallet
  `buildPhantomExecuteEvm` / `buildPhantomExecuteCosmos` (`signMessage`
  ed25519) y `buildMetaMaskExecuteEvm` / `buildMetaMaskExecuteCosmos`
  (`personal_sign` EIP-191); rotación de claves `rotatePqcKeyMsgFromMnemonic`,
  `derivePqcLegacy`. Consulta la
  [guía de Authenticators](/sdk/guides/authenticators).

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, los helpers `erc20`, los
wrappers de contratos (`deployContract`, `readContract`, `writeContract`), los
bindings de `precompiles`, `PRECOMPILE_ADDRESSES` y las ABIs (`ERC20_ABI`,
`IQORE_PQC_ABI`, `IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, los builders de programas (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`) y las constantes de
program-id.

## Otros lenguajes

| Lenguaje | Documentación generada | Instalación |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — docstrings en la API pública | `pip install qorechain-sdk` en `0.7.0` (importa `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...` (tag `packages/go/v0.7.0`) |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` — último crate publicado (0.7.0 desde el repositorio; importa `qorechain`) |
| Java | Javadoc en Maven Central | `io.github.qorechain:qorechain-sdk:0.7.0` |

Cada paquete replica la misma superficie (presets de red, utilidades de
denom/direcciones, derivación HD — incluidas las cuentas unificadas
eth-native —, primitivas PQC y firma híbrida, mensajes y consultas tipados,
las lanes de autenticadores, y clientes de lectura REST + JSON-RPC `qor_`),
documentada de forma inline en el código fuente para que las herramientas de
documentación nativas de cada lenguaje la rendericen. Los builders de wallet de
TypeScript (`buildPhantom*` / `buildMetaMask*`) y los adaptadores de wallets de
navegador son exclusivos de TypeScript.
