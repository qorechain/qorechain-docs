---
slug: /sdk/reference/api
title: Referință API
sidebar_label: API
sidebar_position: 3
---

# Referință API

## TypeScript (`@qorechain/sdk`)

Pachetele TypeScript sunt livrate cu TSDoc complet pe suprafața lor publică, iar
o configurație [TypeDoc](https://typedoc.org) este integrată în pachetul core.
Pentru a genera referința API în format HTML pentru `@qorechain/sdk`:

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

Aceasta rulează scriptul `docs:api` (`typedoc`) definit în `packages/ts`,
producând site-ul API în directorul de ieșire `docs/` al acelui pachet.
Rezultatul generat nu este comis în repo — rulați comanda local sau
integrați-o în propriul vostru pipeline de documentație.

Configurația TypeDoc proprie a site-ului de documentație se află la
`docs/typedoc.json`; aceasta indică spre punctul de intrare al pachetului core,
astfel încât puteți regenera și din proiectul de documentație.

### Suprafața publică pe scurt

Exporturile deliberate, suportate, ale `@qorechain/sdk`:

- **Client:** `createClient`, tipurile `QoreChainClient`, `CreateClientOptions`,
  `ConnectTxOptions`, `ClientFees`.
- **Rețele:** preseturi, funcții ajutătoare de căutare/listare și tipuri de
  configurare (modulul networks).
- **Utilitare:** `toBase` / `fromBase` (denom), codificare/validare de adrese.
- **Conturi:** `generateMnemonic`, `validateMnemonic`, `deriveNativeAccount`,
  `deriveEvmAccount`, `deriveSvmAccount`; tipuri de conturi.
- **Conturi unificate (0.6.0):** `deriveUnifiedAccount`,
  `unifiedAccountFromSeed`, `addressesFrom20`, `qoreAddresses`,
  `unifiedAccountFromPhantomSignature`, `connectPhantomUnified`.
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, constante de lungime,
  ID-uri de algoritmi/funcții ajutătoare, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **Clienți de citire:** `RestClient` (incl. `getPermissionSchema`),
  `JsonRpcClient`, `QorClient`, funcții ajutătoare HTTP (`getJson`,
  `postJsonRpc`, `buildUrl`, `joinUrl`, `QoreHttpError`); clienți de
  interogare tipizați pentru fiecare modul, inclusiv `amm`, `license`,
  `abstractaccount` (`permissionSchema`) și interogările de ancore de stare
  `Anchor`/`Anchors` din modulul `multilayer`.
- **Cross-VM:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **CosmWasm:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **Tranzacții:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient`,
  `MSG_SEND_TYPE_URL`, funcții ajutătoare hibride (`encodeHybridExtension`,
  `attachHybridExtension`, `buildHybridTx`, `signAndBroadcastHybrid`);
  decodare structurată a erorilor prin `decodeTxError` (incl. codurile
  5/6/10/11 pentru `abstractaccount` și codul 21 pentru `pqc`).
- **Semnare eth-native (0.6.0):** `signClassicalEth`, `signHybridEth`
  (secp256k1 peste `keccak256(SignDoc)`, tipul de cheie publică
  `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`, plus extensia hibridă
  ML-DSA-87), `EthNativeSigner`, `accountAuthInfo`.
- **Benzi de autentificatori (0.7.0):** compozitori de mesaje
  `msg.abstractaccount.registerAuthenticator` / `revokeAuthenticator` /
  `executeEvm` / `executeCosmos` și rotația `msg.pqc` (exportate și
  independent ca `executeEvmMsg`, `executeCosmosMsg`,
  `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`,
  `rotatePqcKeyMsg`); octeți de semnare exacți la nivel de byte
  `evmAuthSignBytes`, `cosmosAuthSignBytes`, `rotationSignBytes`;
  constructori pentru portofele `buildPhantomExecuteEvm` /
  `buildPhantomExecuteCosmos` (`signMessage` ed25519) și
  `buildMetaMaskExecuteEvm` / `buildMetaMaskExecuteCosmos`
  (`personal_sign` EIP-191); rotația cheilor `rotatePqcKeyMsgFromMnemonic`,
  `derivePqcLegacy`. Consultați
  [ghidul Authenticators](/sdk/guides/authenticators).

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, funcțiile ajutătoare `erc20`,
wrapper-ele de contracte (`deployContract`, `readContract`, `writeContract`),
bindingurile `precompiles`, `PRECOMPILE_ADDRESSES` și ABI-urile (`ERC20_ABI`,
`IQORE_PQC_ABI`, `IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, constructorii de programe (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`) și constantele
program-id.

## Alte limbaje

| Limbaj | Documentație generată | Instalare |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — docstring-uri pe API-ul public | `pip install qorechain-sdk` la `0.7.0` (import `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...` (tag `packages/go/v0.7.0`) |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` — cel mai recent crate publicat (0.7.0 din repo; import `qorechain`) |
| Java | Javadoc pe Maven Central | `io.github.qorechain:qorechain-sdk:0.7.0` |

Fiecare pachet oglindește aceeași suprafață (preseturi de rețea, utilitare
denom/adrese, derivare HD — inclusiv conturi unificate eth-native — primitive
PQC și semnare hibridă, mesaje și interogări tipizate, benzile de
autentificatori și clienți de citire REST + JSON-RPC `qor_`), documentată
inline în sursă, astfel încât instrumentele de documentare native fiecărui
limbaj să o poată reda. Constructorii de portofele din TypeScript
(`buildPhantom*` / `buildMetaMask*`) și adaptoarele pentru portofele de
browser sunt disponibile doar în TypeScript.
