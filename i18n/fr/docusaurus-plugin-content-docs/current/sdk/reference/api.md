---
slug: /sdk/reference/api
title: Référence de l'API
sidebar_label: API
sidebar_position: 3
---

# Référence de l'API

## TypeScript (`@qorechain/sdk`)

Les packages TypeScript fournissent une documentation TSDoc complète sur leur
surface publique, et une configuration [TypeDoc](https://typedoc.org) est câblée
dans le package cœur. Pour générer la référence d'API HTML de `@qorechain/sdk` :

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

Cela exécute le script `docs:api` (`typedoc`) défini dans `packages/ts`,
produisant le site d'API dans le répertoire de sortie `docs/` de ce package. La
sortie générée n'est pas commitée — exécutez la commande localement ou
intégrez-la dans votre propre pipeline de documentation.

La configuration TypeDoc propre au site de documentation se trouve dans
`docs/typedoc.json` ; elle pointe vers le point d'entrée du package cœur afin
que vous puissiez aussi régénérer depuis le projet de documentation.

### La surface publique en un coup d'œil

Les exports délibérés et pris en charge de `@qorechain/sdk` :

- **Client :** `createClient`, types `QoreChainClient`, `CreateClientOptions`,
  `ConnectTxOptions`, `ClientFees`.
- **Réseaux :** préréglages, helpers de recherche/liste, et types de config
  (module networks).
- **Utilitaires :** `toBase` / `fromBase` (denom), encodage/validation
  d'adresses.
- **Comptes :** `generateMnemonic`, `validateMnemonic`, `deriveNativeAccount`,
  `deriveEvmAccount`, `deriveSvmAccount` ; types de comptes.
- **PQC :** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, constantes de longueur,
  IDs/helpers d'algorithme, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **Clients de lecture :** `RestClient`, `JsonRpcClient`, `QorClient`, helpers
  HTTP (`getJson`, `postJsonRpc`, `buildUrl`, `joinUrl`, `QoreHttpError`).
- **Cross-VM :** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **CosmWasm :** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **Transactions :** `estimateFee`, `directSignerFromPrivateKey`, `TxClient`,
  `MSG_SEND_TYPE_URL`, helpers hybrides (`encodeHybridExtension`,
  `attachHybridExtension`, `buildHybridTx`, `signAndBroadcastHybrid`).

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, les helpers `erc20`, les wrappers
de contrats (`deployContract`, `readContract`, `writeContract`), les bindings
`precompiles`, `PRECOMPILE_ADDRESSES`, et les ABI (`ERC20_ABI`, `IQORE_PQC_ABI`,
`IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, les builders de programmes (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`), et les constantes
d'ID de programme.

## Autres langages

| Langage | Documentation générée | Installation |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — docstrings sur l'API publique | `pip install qorechain-sdk` (import `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...` |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` |

Chaque package reflète la même surface (préréglages réseau, utilitaires de
denom/adresse, dérivation HD, primitives PQC, clients de lecture REST + `qor_`
JSON-RPC), documentée en ligne dans le code source afin que les outils de
documentation natifs au langage la rendent.
