---
slug: /sdk/reference/api
title: Référence de l'API
sidebar_label: API
sidebar_position: 3
---

# Référence de l'API

## TypeScript (`@qorechain/sdk`)

Les packages TypeScript sont livrés avec une documentation TSDoc complète sur
leur surface publique, et une configuration [TypeDoc](https://typedoc.org) est
intégrée au package cœur. Pour générer la référence API HTML de
`@qorechain/sdk` :

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

Cette commande exécute le script `docs:api` (`typedoc`) défini dans
`packages/ts`, ce qui produit le site API dans le répertoire de sortie `docs/`
de ce package. La sortie générée n'est pas commitée — exécutez la commande en
local ou intégrez-la à votre propre pipeline de documentation.

La configuration TypeDoc propre au site de documentation se trouve dans
`docs/typedoc.json` ; elle pointe vers le point d'entrée du package cœur, de
sorte que vous pouvez également régénérer la référence depuis le projet de
documentation.

### La surface publique en un coup d'œil

Les exports délibérés et pris en charge de `@qorechain/sdk` :

- **Client :** `createClient`, types `QoreChainClient`, `CreateClientOptions`,
  `ConnectTxOptions`, `ClientFees`.
- **Réseaux :** préréglages, assistants de recherche/liste et types de
  configuration (module networks).
- **Utilitaires :** `toBase` / `fromBase` (denom), encodage/validation
  d'adresses.
- **Comptes :** `generateMnemonic`, `validateMnemonic`, `deriveNativeAccount`,
  `deriveEvmAccount`, `deriveSvmAccount` ; types de comptes.
- **Comptes unifiés (0.6.0) :** `deriveUnifiedAccount`,
  `unifiedAccountFromSeed`, `addressesFrom20`, `qoreAddresses`,
  `unifiedAccountFromPhantomSignature`, `connectPhantomUnified`.
- **PQC :** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, constantes de
  longueur, identifiants/assistants d'algorithmes, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **Clients de lecture :** `RestClient` (y compris `getPermissionSchema`),
  `JsonRpcClient`, `QorClient`, assistants HTTP (`getJson`, `postJsonRpc`,
  `buildUrl`, `joinUrl`, `QoreHttpError`) ; clients de requête typés pour
  chaque module, y compris `amm`, `license`, `abstractaccount`
  (`permissionSchema`), ainsi que les requêtes d'ancrage d'état
  `Anchor`/`Anchors` du module `multilayer`.
- **Cross-VM :** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **CosmWasm :** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **Transactions :** `estimateFee`, `directSignerFromPrivateKey`, `TxClient`,
  `MSG_SEND_TYPE_URL`, assistants hybrides (`encodeHybridExtension`,
  `attachHybridExtension`, `buildHybridTx`, `signAndBroadcastHybrid`) ;
  décodage structuré des erreurs via `decodeTxError` (y compris les codes
  `abstractaccount` 5/6/10/11 et le code `pqc` 21).
- **Signature eth-native (0.6.0) :** `signClassicalEth`, `signHybridEth`
  (secp256k1 sur `keccak256(SignDoc)`, type de clé publique
  `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`, plus l'extension hybride
  ML-DSA-87), `EthNativeSigner`, `accountAuthInfo`.
- **Voies d'authentificateurs (0.7.0) :** compositeurs de messages
  `msg.abstractaccount.registerAuthenticator` / `revokeAuthenticator` /
  `executeEvm` / `executeCosmos` et rotation `msg.pqc` (également exportés en
  autonome sous les noms `executeEvmMsg`, `executeCosmosMsg`,
  `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`,
  `rotatePqcKeyMsg`) ; sign-bytes exacts à l'octet près `evmAuthSignBytes`,
  `cosmosAuthSignBytes`, `rotationSignBytes` ; constructeurs pour portefeuilles
  `buildPhantomExecuteEvm` / `buildPhantomExecuteCosmos` (`signMessage`
  ed25519) et `buildMetaMaskExecuteEvm` / `buildMetaMaskExecuteCosmos`
  (`personal_sign` EIP-191) ; rotation de clé `rotatePqcKeyMsgFromMnemonic`,
  `derivePqcLegacy`. Voir le
  [guide des authentificateurs](/sdk/guides/authenticators).

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, les assistants `erc20`, les
wrappers de contrats (`deployContract`, `readContract`, `writeContract`), les
liaisons `precompiles`, `PRECOMPILE_ADDRESSES`, ainsi que les ABI (`ERC20_ABI`,
`IQORE_PQC_ABI`, `IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, les constructeurs de programmes (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`), ainsi que les
constantes d'identifiants de programmes.

## Autres langages

| Langage | Documentation générée | Installation |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — docstrings sur l'API publique | `pip install qorechain-sdk` en `0.7.0` (import `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...` (tag `packages/go/v0.7.0`) |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` — dernière crate publiée (0.7.0 depuis le dépôt ; import `qorechain`) |
| Java | Javadoc sur Maven Central | `io.github.qorechain:qorechain-sdk:0.7.0` |

Chaque package reflète la même surface (préréglages réseau, utilitaires
denom/adresses, dérivation HD — y compris les comptes unifiés eth-native —
primitives PQC et signature hybride, messages et requêtes typés, les voies
d'authentificateurs, et les clients de lecture REST + JSON-RPC `qor_`),
documentée directement dans le code source afin que l'outillage de
documentation natif de chaque langage puisse la rendre. Les constructeurs pour
portefeuilles TypeScript (`buildPhantom*` / `buildMetaMask*`) et les
adaptateurs de portefeuilles navigateur sont réservés à TypeScript.
