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
  `unifiedAccountFromSeed`, `addressesFrom20`, `qoreAddresses`,
  `unifiedAccountFromPhantomSignature`, `connectPhantomUnified`.
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, costanti di lunghezza,
  ID/helper degli algoritmi, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **Client di lettura:** `RestClient` (incl. `getPermissionSchema`),
  `JsonRpcClient`, `QorClient`, helper HTTP (`getJson`, `postJsonRpc`,
  `buildUrl`, `joinUrl`, `QoreHttpError`); client di query tipizzati per ogni
  modulo, inclusi `amm`, `license`, `abstractaccount`
  (`permissionSchema`) e le query di state-anchor `Anchor`/`Anchors` del
  modulo `multilayer`.
- **Cross-VM:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **CosmWasm:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **Transazioni:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient`,
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
  [guida agli Authenticator](/sdk/guides/authenticators).

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, gli helper `erc20`, i wrapper
per contratti (`deployContract`, `readContract`, `writeContract`), i binding
`precompiles`, `PRECOMPILE_ADDRESSES` e le ABI (`ERC20_ABI`, `IQORE_PQC_ABI`,
`IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, i builder di programmi (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`) e le costanti dei
program-id.

## Altri linguaggi

| Linguaggio | Documentazione generata | Installazione |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — docstring sull'API pubblica | `pip install qorechain-sdk` alla `0.7.0` (import `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...` (tag `packages/go/v0.7.0`) |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` — ultimo crate pubblicato (0.7.0 dal repo; import `qorechain`) |
| Java | Javadoc su Maven Central | `io.github.qorechain:qorechain-sdk:0.7.0` |

Ogni pacchetto rispecchia la stessa superficie (preset di rete, utility per
denom/indirizzi, derivazione HD — inclusi gli account unificati eth-native —
primitive PQC e firma ibrida, messaggi e query tipizzati, le corsie
authenticator e client di lettura REST + JSON-RPC `qor_`), documentata inline
nel sorgente così che il tooling di documentazione nativo di ciascun linguaggio
possa renderizzarla. I builder per wallet TypeScript (`buildPhantom*` /
`buildMetaMask*`) e gli adapter per browser-wallet sono disponibili solo in
TypeScript.
