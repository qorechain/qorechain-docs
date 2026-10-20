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
  `unifiedAccountFromSeed`, `addressesFrom20`, `qoreAddresses`. (`unifiedAccountFromPhantomSignature` et `connectPhantomUnified` ont été supprimées en 0.8.0 et lèvent une erreur.)
- **PQC :** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, constantes de
  longueur, identifiants/assistants d'algorithmes, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **Cycle de vie des clés PQC (0.9.0) :** `ensurePqcRegistered` (lit l'état via REST,
  `PqcKeyMismatchError`), `fetchPqcStatus`, `isRegisteredPqcKey`,
  `buildRegisterPqcKeyMsg`, `signProofOfPossession` / `verifyProofOfPossession`
  (`PROOF_OF_POSSESSION_DOMAIN`), `validateRegisteredPqcKey`,
  `isDegeneratePqcPublicKey`, `migrateToHybrid`, `migratePqcKeyHybrid`,
  `isUpgradeApplied` / `requireUpgradeApplied` (`CHAIN_UPGRADE_V3_2_2`,
  `CHAIN_UPGRADE_V3_2_3`).
- **Clients de lecture :** `RestClient` (y compris `getPermissionSchema`),
  `JsonRpcClient`, `QorClient`, assistants HTTP (`getJson`, `postJsonRpc`,
  `buildUrl`, `joinUrl`, `QoreHttpError`) ; clients de requête typés pour
  chaque module, y compris `amm`, `license`, `abstractaccount`
  (`permissionSchema`), ainsi que les requêtes d'ancrage d'état
  `Anchor`/`Anchors` du module `multilayer`. Sur les points de terminaison
  publics, certains assistants REST typés appellent des routes que la passerelle
  ne sert pas : `getAiStats`, `getFeeEstimate`, `getXqorePosition`,
  `getInflationRate` et `getReputation`.
  `getBurnStats`, `getAllBalances`, `getBridgeChains`, `getPermissionSchema` et (depuis
  la 0.9.0, qui a corrigé son chemin `accounts` au pluriel vers la route servie au singulier
  `/qorechain/pqc/v1/account/{address}`) `getPqcAccount` fonctionnent.
- **Cross-VM :** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **CosmWasm :** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **Transactions :** `estimateFee`, `directSignerFromPrivateKey`, `TxClient` (hybride
  lorsqu'il est connecté avec `pqcKeypair`, 0.9.0 ; `HYBRID_VERIFY_GAS`),
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
  [guide des authentificateurs](/sdk/guides/authenticators) (le module derrière
  ces voies est désactivé sur les deux réseaux aujourd'hui).
- **Sign-bytes hybrides (0.8.0+) :** l'option `signBytesVersion`
  (`"auto" | "v1" | "v2"`) sur `buildHybridTx`, `signAndBroadcastHybrid`,
  `signHybridEth` et `EthNativeSigner` ; `resolveSignBytesVersion`,
  `SIGN_BYTES_V2_UPGRADES`, `isHybridSignBytesRejection`, `hybridSignBytesV1` /
  `hybridSignBytesV2`, `migrationSignBytes`, `bridgeAttestationSignBytes`.
- **Fenêtre d'autorisation EVM (0.8.2+) :** `openEvmWindowMsg` (`nativeOnly` et
  `allowedTargets` depuis la 0.9.0), `closeEvmWindowMsg`, `fetchEvmWindow`,
  `classifyEvmWindowRejection`, `isEvmWindowRejection`, `MAX_EVM_WINDOW_BLOCKS`,
  `MAX_EVM_WINDOW_TXS`, `MAX_EVM_WINDOW_TARGETS`. Voir
  [Fenêtre d'autorisation EVM](/sdk/guides/evm#evm-window).
- **Consentement EIP-7702 (0.9.0) :** `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`,
  `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`,
  `classifyEvmDelegationRejection`, `EVM_DELEGATION_CLEAR`,
  `MAX_EVM_DELEGATION_CONSENT_BLOCKS`.
- **Condensat de compte abstrait v2 (0.9.0) :** `evmAuthSignBytesV2`,
  `resolveEvmAuthDigestVersion` ; `validateSpendingRules`.
- **Dérivation PQC canonique (0.8.3+) :** `derivePqcCanonical(account, mnemonic)`,
  `canonicalAccount(account)` ; le message d'enregistrement PQC est
  `buildRegisterPqcKeyMsg` (utilisé par `ensurePqcRegistered`). `derivePqcLegacy` est
  dépréciée pour les nouvelles clés.

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, les assistants `erc20`, les
wrappers de contrats (`deployContract`, `readContract`, `writeContract`), les
liaisons `precompiles`, les assistants adossés aux précompilations
`simulateWithRiskScore`, `aiRiskScore` et `aiAnomalyCheck`,
`PRECOMPILE_ADDRESSES`, ainsi que les ABI (`ERC20_ABI`, `IQORE_PQC_ABI`,
`IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`). Les liaisons et assistants adossés aux
précompilations ne sont pas actifs sur les réseaux publics (voir
[Précompilations EVM](/developer-guide/evm-precompiles#network-status)).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, les constructeurs de programmes (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`), ainsi que les
constantes d'identifiants de programmes.

## Autres langages

| Langage | Documentation générée | Installation |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — docstrings sur l'API publique | `pip install qorechain-sdk` en `0.9.0` (import `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...@v0.9.0` (tag `packages/go/v0.9.0`) |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` (0.9.0 ; import `qorechain`) |
| Java | Javadoc sur Maven Central | `io.github.qorechain:qorechain-sdk:0.9.0` |

Chaque package reflète la même surface (préréglages réseau, utilitaires
denom/adresses, dérivation HD — y compris les comptes unifiés eth-native —
primitives PQC et signature hybride, messages et requêtes typés, les voies
d'authentificateurs, et les clients de lecture REST + JSON-RPC `qor_`),
documentée directement dans le code source afin que l'outillage de
documentation natif de chaque langage puisse la rendre. Les constructeurs pour
portefeuilles TypeScript (`buildPhantom*` / `buildMetaMask*`) et les
adaptateurs de portefeuilles navigateur sont réservés à TypeScript.
