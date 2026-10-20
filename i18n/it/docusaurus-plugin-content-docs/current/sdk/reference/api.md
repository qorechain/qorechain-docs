---
slug: /sdk/reference/api
title: Riferimento API
sidebar_label: API
sidebar_position: 3
---

# Riferimento API

## TypeScript (`@qorechain/sdk`)

I pacchetti TypeScript includono TSDoc completo su tutta la loro superficie
pubblica, e una configurazione [TypeDoc](https://typedoc.org) è integrata nel
pacchetto core. Per generare il riferimento API in HTML per `@qorechain/sdk`:

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

Questo esegue lo script `docs:api` (`typedoc`) definito in `packages/ts`,
producendo il sito API nella directory di output `docs/` di quel pacchetto.
L'output generato non viene committato — esegui il comando in locale oppure
integralo nella tua pipeline di documentazione.

La configurazione TypeDoc del sito di documentazione stesso si trova in
`docs/typedoc.json`; punta all'entry point del pacchetto core, quindi puoi
rigenerare anche dal progetto docs.

### La superficie pubblica in sintesi

Gli export deliberati e supportati di `@qorechain/sdk`:

- **Client:** `createClient`, i tipi `QoreChainClient`, `CreateClientOptions`,
  `ConnectTxOptions`, `ClientFees`.
- **Reti:** preset, helper di ricerca/elenco e tipi di configurazione (modulo
  networks).
- **Utility:** `toBase` / `fromBase` (denom), codifica/validazione degli
  indirizzi.
- **Account:** `generateMnemonic`, `validateMnemonic`, `deriveNativeAccount`,
  `deriveEvmAccount`, `deriveSvmAccount`; tipi di account.
- **Account unificati (0.6.0):** `deriveUnifiedAccount`,
  `unifiedAccountFromSeed`, `addressesFrom20`, `qoreAddresses`. (`unifiedAccountFromPhantomSignature` e `connectPhantomUnified` sono state rimosse nella 0.8.0 e lanciano un errore.)
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, costanti di lunghezza,
  ID/helper degli algoritmi, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **Ciclo di vita della chiave PQC (0.9.0):** `ensurePqcRegistered` (legge lo stato via REST,
  `PqcKeyMismatchError`), `fetchPqcStatus`, `isRegisteredPqcKey`,
  `buildRegisterPqcKeyMsg`, `signProofOfPossession` / `verifyProofOfPossession`
  (`PROOF_OF_POSSESSION_DOMAIN`), `validateRegisteredPqcKey`,
  `isDegeneratePqcPublicKey`, `migrateToHybrid`, `migratePqcKeyHybrid`,
  `isUpgradeApplied` / `requireUpgradeApplied` (`CHAIN_UPGRADE_V3_2_2`,
  `CHAIN_UPGRADE_V3_2_3`).
- **Client di lettura:** `RestClient` (incl. `getPermissionSchema`),
  `JsonRpcClient`, `QorClient`, helper HTTP (`getJson`, `postJsonRpc`,
  `buildUrl`, `joinUrl`, `QoreHttpError`); client di query tipizzati per ogni
  modulo, inclusi `amm`, `license`, `abstractaccount`
  (`permissionSchema`) e le query di state-anchor `Anchor`/`Anchors` del
  modulo `multilayer`. Sugli endpoint pubblici alcuni helper REST tipizzati
  chiamano route che il gateway non serve: `getAiStats`, `getFeeEstimate`,
  `getXqorePosition`, `getInflationRate` e `getReputation`.
  `getBurnStats`, `getAllBalances`, `getBridgeChains`, `getPermissionSchema` e (dalla
  0.9.0, che ha corretto il suo percorso `accounts` al plurale nel percorso singolare servito
  `/qorechain/pqc/v1/account/{address}`) `getPqcAccount` funzionano.
- **Cross-VM:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **QoreChain Native:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **Transazioni:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient` (ibrido
  quando connesso con `pqcKeypair`, 0.9.0; `HYBRID_VERIFY_GAS`),
  `MSG_SEND_TYPE_URL`, helper ibridi (`encodeHybridExtension`,
  `attachHybridExtension`, `buildHybridTx`, `signAndBroadcastHybrid`);
  decodifica strutturata degli errori tramite `decodeTxError` (incl. i codici
  `abstractaccount` 5/6/10/11 e il codice `pqc` 21).
- **Firma eth-native (0.6.0):** `signClassicalEth`, `signHybridEth`
  (secp256k1 su `keccak256(SignDoc)`, tipo di pubkey
  `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`, più l'estensione ibrida
  ML-DSA-87), `EthNativeSigner`, `accountAuthInfo`.
- **Corsie authenticator (0.7.0):** compositori di messaggi
  `msg.abstractaccount.registerAuthenticator` / `revokeAuthenticator` /
  `executeEvm` / `executeCosmos` e la rotazione `msg.pqc` (esportati anche
  in forma standalone come `executeEvmMsg`, `executeCosmosMsg`,
  `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`,
  `rotatePqcKeyMsg`); sign-bytes byte-esatti `evmAuthSignBytes`,
  `cosmosAuthSignBytes`, `rotationSignBytes`; builder per wallet
  `buildPhantomExecuteEvm` / `buildPhantomExecuteCosmos` (`signMessage`
  ed25519) e `buildMetaMaskExecuteEvm` / `buildMetaMaskExecuteCosmos`
  (`personal_sign` EIP-191); rotazione delle chiavi
  `rotatePqcKeyMsgFromMnemonic`, `derivePqcLegacy`. Vedi la
  [guida agli Authenticator](/sdk/guides/authenticators) (il modulo alla base
  di queste corsie oggi è disattivato su entrambe le reti).
- **Sign-bytes ibridi (0.8.0+):** l'opzione `signBytesVersion`
  (`"auto" | "v1" | "v2"`) su `buildHybridTx`, `signAndBroadcastHybrid`,
  `signHybridEth` e `EthNativeSigner`; `resolveSignBytesVersion`,
  `SIGN_BYTES_V2_UPGRADES`, `isHybridSignBytesRejection`, `hybridSignBytesV1` /
  `hybridSignBytesV2`, `migrationSignBytes`, `bridgeAttestationSignBytes`.
- **Finestra di autorizzazione EVM (0.8.2+):** `openEvmWindowMsg` (`nativeOnly` e
  `allowedTargets` dalla 0.9.0), `closeEvmWindowMsg`, `fetchEvmWindow`,
  `classifyEvmWindowRejection`, `isEvmWindowRejection`, `MAX_EVM_WINDOW_BLOCKS`,
  `MAX_EVM_WINDOW_TXS`, `MAX_EVM_WINDOW_TARGETS`. Vedi
  [Finestra di autorizzazione EVM](/sdk/guides/evm#evm-window).
- **Consenso EIP-7702 (0.9.0):** `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`,
  `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`,
  `classifyEvmDelegationRejection`, `EVM_DELEGATION_CLEAR`,
  `MAX_EVM_DELEGATION_CONSENT_BLOCKS`.
- **Digest v2 dell'abstract account (0.9.0):** `evmAuthSignBytesV2`,
  `resolveEvmAuthDigestVersion`; `validateSpendingRules`.
- **Derivazione PQC canonica (0.8.3+):** `derivePqcCanonical(account, mnemonic)`,
  `canonicalAccount(account)`; il messaggio di registrazione PQC è
  `buildRegisterPqcKeyMsg` (usato da `ensurePqcRegistered`). `derivePqcLegacy` è
  deprecata per le nuove chiavi.

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, gli helper `erc20`, i wrapper
per contratti (`deployContract`, `readContract`, `writeContract`), i binding
`precompiles`, gli helper basati sui precompile `simulateWithRiskScore`,
`aiRiskScore` e `aiAnomalyCheck`, `PRECOMPILE_ADDRESSES` e le ABI
(`ERC20_ABI`, `IQORE_PQC_ABI`, `IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`). I
binding e gli helper basati sui precompile non sono attivi sulle reti
pubbliche (vedi
[Precompile EVM](/developer-guide/evm-precompiles#network-status)).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, i builder di programmi (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`) e le costanti dei
program-id.

## Altri linguaggi

| Linguaggio | Documentazione generata | Installazione |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — docstring sull'API pubblica | `pip install qorechain-sdk` alla `0.9.0` (import `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...@v0.9.0` (tag `packages/go/v0.9.0`) |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` (0.9.0; import `qorechain`) |
| Java | Javadoc su Maven Central | `io.github.qorechain:qorechain-sdk:0.9.1` (gli altri linguaggi sono alla 0.9.0) |

Ogni pacchetto rispecchia la stessa superficie (preset di rete, utility per
denom/indirizzi, derivazione HD — inclusi gli account unificati eth-native —
primitive PQC e firma ibrida, messaggi e query tipizzati, le corsie
authenticator e client di lettura REST + JSON-RPC `qor_`), documentata inline
nel sorgente così che il tooling di documentazione nativo di ciascun linguaggio
possa renderizzarla. I builder per wallet TypeScript (`buildPhantom*` /
`buildMetaMask*`) e gli adapter per browser-wallet sono disponibili solo in
TypeScript.
