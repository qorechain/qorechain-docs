---
slug: /sdk/reference/api
title: API-Referenz
sidebar_label: API
sidebar_position: 3
---

# API-Referenz

## TypeScript (`@qorechain/sdk`)

Die TypeScript-Pakete liefern vollständige TSDoc-Kommentare auf ihrer öffentlichen
Oberfläche mit, und eine [TypeDoc](https://typedoc.org)-Konfiguration ist im
Core-Paket eingerichtet. So generieren Sie die HTML-API-Referenz für
`@qorechain/sdk`:

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

Dies führt das in `packages/ts` definierte Skript `docs:api` (`typedoc`) aus und
erzeugt die API-Site im `docs/`-Ausgabeverzeichnis dieses Pakets. Die generierte
Ausgabe wird nicht eingecheckt — führen Sie den Befehl lokal aus oder binden Sie
ihn in Ihre eigene Dokumentations-Pipeline ein.

Die eigene TypeDoc-Konfiguration der Dokumentationsseite liegt unter
`docs/typedoc.json`; sie verweist auf den Einstiegspunkt des Core-Pakets, sodass
Sie die Referenz auch aus dem Docs-Projekt heraus neu generieren können.

### Die öffentliche Oberfläche im Überblick

Die bewusst gewählten, unterstützten Exporte von `@qorechain/sdk`:

- **Client:** `createClient`, Typen `QoreChainClient`, `CreateClientOptions`,
  `ConnectTxOptions`, `ClientFees`.
- **Netzwerke:** Presets, Lookup-/Listen-Helfer und Konfigurationstypen
  (Networks-Modul).
- **Hilfsfunktionen:** `toBase` / `fromBase` (Denom), Adress-Kodierung und
  -Validierung.
- **Konten:** `generateMnemonic`, `validateMnemonic`, `deriveNativeAccount`,
  `deriveEvmAccount`, `deriveSvmAccount`; Kontotypen.
- **Unified Accounts (0.6.0):** `deriveUnifiedAccount`,
  `unifiedAccountFromSeed`, `addressesFrom20`, `qoreAddresses`. (`unifiedAccountFromPhantomSignature` und `connectPhantomUnified` wurden in 0.8.0 entfernt und werfen einen Fehler.)
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, Längenkonstanten,
  Algorithmus-IDs/-Helfer, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **PQC-Schlüssel-Lebenszyklus (0.9.0):** `ensurePqcRegistered` (liest den Status über REST,
  `PqcKeyMismatchError`), `fetchPqcStatus`, `isRegisteredPqcKey`,
  `buildRegisterPqcKeyMsg`, `signProofOfPossession` / `verifyProofOfPossession`
  (`PROOF_OF_POSSESSION_DOMAIN`), `validateRegisteredPqcKey`,
  `isDegeneratePqcPublicKey`, `migrateToHybrid`, `migratePqcKeyHybrid`,
  `isUpgradeApplied` / `requireUpgradeApplied` (`CHAIN_UPGRADE_V3_2_2`,
  `CHAIN_UPGRADE_V3_2_3`).
- **Read-Clients:** `RestClient` (inkl. `getPermissionSchema`),
  `JsonRpcClient`, `QorClient`, HTTP-Helfer (`getJson`, `postJsonRpc`,
  `buildUrl`, `joinUrl`, `QoreHttpError`); typisierte Query-Clients für jedes
  Modul, einschließlich `amm`, `license`, `abstractaccount`
  (`permissionSchema`) sowie der `multilayer`-State-Anchor-Abfragen
  `Anchor`/`Anchors`. Auf den öffentlichen Endpunkten rufen einige typisierte
  REST-Helfer Routen auf, die das Gateway nicht bereitstellt: `getAiStats`,
  `getFeeEstimate`, `getXqorePosition`, `getInflationRate` und `getReputation`.
  `getBurnStats`, `getAllBalances`, `getBridgeChains`, `getPermissionSchema` und (seit
  0.9.0, das seinen Pfad mit Plural `accounts` auf die bereitgestellte Singular-Route
  `/qorechain/pqc/v1/account/{address}` korrigiert hat) `getPqcAccount`
  funktionieren.
- **Cross-VM:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **QoreChain Native:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **Transaktionen:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient` (hybrid,
  wenn mit `pqcKeypair` verbunden, 0.9.0; `HYBRID_VERIFY_GAS`),
  `MSG_SEND_TYPE_URL`, Hybrid-Helfer (`encodeHybridExtension`,
  `attachHybridExtension`, `buildHybridTx`, `signAndBroadcastHybrid`);
  strukturierte Fehlerdekodierung über `decodeTxError` (inkl. der
  `abstractaccount`-Codes 5/6/10/11 und des `pqc`-Codes 21).
- **eth-natives Signieren (0.6.0):** `signClassicalEth`, `signHybridEth`
  (secp256k1 über `keccak256(SignDoc)`, Pubkey-Typ
  `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`, plus die
  ML-DSA-87-Hybrid-Extension), `EthNativeSigner`, `accountAuthInfo`.
- **Authenticator-Lanes (0.7.0):** Message-Composer
  `msg.abstractaccount.registerAuthenticator` / `revokeAuthenticator` /
  `executeEvm` / `executeCosmos` und die `msg.pqc`-Rotation (auch eigenständig
  exportiert als `executeEvmMsg`, `executeCosmosMsg`,
  `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`,
  `rotatePqcKeyMsg`); byte-exakte Sign-Bytes `evmAuthSignBytes`,
  `cosmosAuthSignBytes`, `rotationSignBytes`; Wallet-Builder
  `buildPhantomExecuteEvm` / `buildPhantomExecuteCosmos` (ed25519
  `signMessage`) und `buildMetaMaskExecuteEvm` / `buildMetaMaskExecuteCosmos`
  (EIP-191 `personal_sign`); Schlüsselrotation `rotatePqcKeyMsgFromMnemonic`,
  `derivePqcLegacy`. Siehe den
  [Authenticators-Leitfaden](/sdk/guides/authenticators) (das Modul hinter
  diesen Lanes ist derzeit auf beiden Netzwerken abgeschaltet).
- **Hybride Sign-Bytes (0.8.0+):** die Option `signBytesVersion`
  (`"auto" | "v1" | "v2"`) bei `buildHybridTx`, `signAndBroadcastHybrid`,
  `signHybridEth` und `EthNativeSigner`; `resolveSignBytesVersion`,
  `SIGN_BYTES_V2_UPGRADES`, `isHybridSignBytesRejection`, `hybridSignBytesV1` /
  `hybridSignBytesV2`, `migrationSignBytes`, `bridgeAttestationSignBytes`.
- **EVM-Autorisierungsfenster (0.8.2+):** `openEvmWindowMsg` (`nativeOnly` und
  `allowedTargets` ab 0.9.0), `closeEvmWindowMsg`, `fetchEvmWindow`,
  `classifyEvmWindowRejection`, `isEvmWindowRejection`, `MAX_EVM_WINDOW_BLOCKS`,
  `MAX_EVM_WINDOW_TXS`, `MAX_EVM_WINDOW_TARGETS`. Siehe
  [EVM-Autorisierungsfenster](/sdk/guides/evm#evm-window).
- **EIP-7702-Zustimmung (0.9.0):** `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`,
  `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`,
  `classifyEvmDelegationRejection`, `EVM_DELEGATION_CLEAR`,
  `MAX_EVM_DELEGATION_CONSENT_BLOCKS`.
- **Abstract-Account-Digest v2 (0.9.0):** `evmAuthSignBytesV2`,
  `resolveEvmAuthDigestVersion`; `validateSpendingRules`.
- **Kanonische PQC-Ableitung (0.8.3+):** `derivePqcCanonical(account, mnemonic)`,
  `canonicalAccount(account)`; die PQC-Registrierungsnachricht ist
  `buildRegisterPqcKeyMsg` (verwendet von `ensurePqcRegistered`). `derivePqcLegacy` ist
  für neue Schlüssel veraltet.

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, die `erc20`-Helfer,
Contract-Wrapper (`deployContract`, `readContract`, `writeContract`), die
`precompiles`-Bindings, die Precompile-gestützten Helfer `simulateWithRiskScore`,
`aiRiskScore` und `aiAnomalyCheck`, `PRECOMPILE_ADDRESSES` und die ABIs
(`ERC20_ABI`, `IQORE_PQC_ABI`, `IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`). Die
Precompile-gestützten Bindings und Helfer sind auf den öffentlichen Netzwerken
nicht aktiv (siehe
[EVM-Precompiles](/developer-guide/evm-precompiles#network-status)).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, die Program-Builder (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`) sowie die
Program-ID-Konstanten.

## Weitere Sprachen

| Sprache | Generierte Dokumentation | Installation |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — Docstrings auf der öffentlichen API | `pip install qorechain-sdk` in Version `0.9.0` (Import `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...@v0.9.0` (Tag `packages/go/v0.9.0`) |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` (0.9.0; Import `qorechain`) |
| Java | Maven-Central-Javadoc | `io.github.qorechain:qorechain-sdk:0.9.1` (die anderen Sprachen sind 0.9.0) |

Jedes Paket spiegelt dieselbe Oberfläche wider (Netzwerk-Presets,
Denom-/Adress-Hilfsfunktionen, HD-Ableitung — einschließlich unified
eth-nativer Konten — PQC-Primitive und Hybrid-Signieren, typisierte Messages
und Queries, die Authenticator-Lanes sowie REST- und
`qor_`-JSON-RPC-Read-Clients), dokumentiert direkt im Quellcode, sodass das
sprachspezifische Dokumentations-Tooling sie rendert. Die
TypeScript-Wallet-Builder (`buildPhantom*` / `buildMetaMask*`) und die
Browser-Wallet-Adapter gibt es nur in TypeScript.
