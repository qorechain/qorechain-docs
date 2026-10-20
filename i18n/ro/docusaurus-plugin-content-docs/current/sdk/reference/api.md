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
  `unifiedAccountFromSeed`, `addressesFrom20`, `qoreAddresses`. (`unifiedAccountFromPhantomSignature` și `connectPhantomUnified` au fost eliminate în 0.8.0 și aruncă o eroare.)
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, constante de lungime,
  ID-uri de algoritmi/funcții ajutătoare, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **Ciclul de viață al cheii PQC (0.9.0):** `ensurePqcRegistered` (citește starea
  prin REST, `PqcKeyMismatchError`), `fetchPqcStatus`, `isRegisteredPqcKey`,
  `buildRegisterPqcKeyMsg`, `signProofOfPossession` / `verifyProofOfPossession`
  (`PROOF_OF_POSSESSION_DOMAIN`), `validateRegisteredPqcKey`,
  `isDegeneratePqcPublicKey`, `migrateToHybrid`, `migratePqcKeyHybrid`,
  `isUpgradeApplied` / `requireUpgradeApplied` (`CHAIN_UPGRADE_V3_2_2`,
  `CHAIN_UPGRADE_V3_2_3`).
- **Clienți de citire:** `RestClient` (incl. `getPermissionSchema`),
  `JsonRpcClient`, `QorClient`, funcții ajutătoare HTTP (`getJson`,
  `postJsonRpc`, `buildUrl`, `joinUrl`, `QoreHttpError`); clienți de
  interogare tipizați pentru fiecare modul, inclusiv `amm`, `license`,
  `abstractaccount` (`permissionSchema`) și interogările de ancore de stare
  `Anchor`/`Anchors` din modulul `multilayer`. Pe endpoint-urile publice,
  unele funcții REST tipizate apelează rute pe care gateway-ul nu le servește:
  `getAiStats`, `getFeeEstimate`, `getXqorePosition`, `getInflationRate` și
  `getReputation`. `getBurnStats`, `getAllBalances`, `getBridgeChains`,
  `getPermissionSchema` și (începând cu 0.9.0, care a corectat calea sa `accounts`
  la plural în ruta servită, la singular,
  `/qorechain/pqc/v1/account/{address}`) `getPqcAccount` funcționează.
- **Cross-VM:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **QoreChain Native:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **Tranzacții:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient` (hibrid
  când este conectat cu `pqcKeypair`, 0.9.0; `HYBRID_VERIFY_GAS`),
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
  [ghidul Authenticators](/sdk/guides/authenticators) (modulul din spatele
  acestor benzi este dezactivat astăzi pe ambele rețele).
- **Octeți de semnare hibrizi (0.8.0+):** opțiunea `signBytesVersion`
  (`"auto" | "v1" | "v2"`) la `buildHybridTx`, `signAndBroadcastHybrid`,
  `signHybridEth` și `EthNativeSigner`; `resolveSignBytesVersion`,
  `SIGN_BYTES_V2_UPGRADES`, `isHybridSignBytesRejection`, `hybridSignBytesV1` /
  `hybridSignBytesV2`, `migrationSignBytes`, `bridgeAttestationSignBytes`.
- **Fereastra de autorizare EVM (0.8.2+):** `openEvmWindowMsg` (`nativeOnly` și
  `allowedTargets` începând cu 0.9.0), `closeEvmWindowMsg`, `fetchEvmWindow`,
  `classifyEvmWindowRejection`, `isEvmWindowRejection`, `MAX_EVM_WINDOW_BLOCKS`,
  `MAX_EVM_WINDOW_TXS`, `MAX_EVM_WINDOW_TARGETS`. Vezi
  [Fereastra de autorizare EVM](/sdk/guides/evm#evm-window).
- **Consimțământ EIP-7702 (0.9.0):** `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`,
  `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`,
  `classifyEvmDelegationRejection`, `EVM_DELEGATION_CLEAR`,
  `MAX_EVM_DELEGATION_CONSENT_BLOCKS`.
- **Digest v2 pentru abstract account (0.9.0):** `evmAuthSignBytesV2`,
  `resolveEvmAuthDigestVersion`; `validateSpendingRules`.
- **Derivare PQC canonică (0.8.3+):** `derivePqcCanonical(account, mnemonic)`,
  `canonicalAccount(account)`; mesajul de înregistrare PQC este
  `buildRegisterPqcKeyMsg` (folosit de `ensurePqcRegistered`). `derivePqcLegacy`
  este depreciat pentru chei noi.

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, funcțiile ajutătoare `erc20`,
wrapper-ele de contracte (`deployContract`, `readContract`, `writeContract`),
bindingurile `precompiles`, funcțiile ajutătoare bazate pe precompile
`simulateWithRiskScore`, `aiRiskScore` și `aiAnomalyCheck`,
`PRECOMPILE_ADDRESSES` și ABI-urile (`ERC20_ABI`, `IQORE_PQC_ABI`,
`IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`). Bindingurile și funcțiile ajutătoare
bazate pe precompile nu sunt active pe rețelele publice (vezi
[Precompile-uri EVM](/developer-guide/evm-precompiles#network-status)).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, constructorii de programe (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`) și constantele
program-id.

## Alte limbaje

| Limbaj | Documentație generată | Instalare |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — docstring-uri pe API-ul public | `pip install qorechain-sdk` la `0.9.0` (import `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...@v0.9.0` (tag `packages/go/v0.9.0`) |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` (0.9.0; import `qorechain`) |
| Java | Javadoc pe Maven Central | `io.github.qorechain:qorechain-sdk:0.9.1` (celelalte limbaje sunt 0.9.0) |

Fiecare pachet oglindește aceeași suprafață (preseturi de rețea, utilitare
denom/adrese, derivare HD — inclusiv conturi unificate eth-native — primitive
PQC și semnare hibridă, mesaje și interogări tipizate, benzile de
autentificatori și clienți de citire REST + JSON-RPC `qor_`), documentată
inline în sursă, astfel încât instrumentele de documentare native fiecărui
limbaj să o poată reda. Constructorii de portofele din TypeScript
(`buildPhantom*` / `buildMetaMask*`) și adaptoarele pentru portofele de
browser sunt disponibile doar în TypeScript.
