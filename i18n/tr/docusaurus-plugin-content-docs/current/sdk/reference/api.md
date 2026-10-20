---
slug: /sdk/reference/api
title: API Referansı
sidebar_label: API
sidebar_position: 3
---

# API referansı

## TypeScript (`@qorechain/sdk`)

TypeScript paketleri, herkese açık yüzeylerinde eksiksiz TSDoc ile birlikte gelir
ve çekirdek pakete bir [TypeDoc](https://typedoc.org) yapılandırması bağlanmıştır.
`@qorechain/sdk` için HTML API referansını oluşturmak üzere:

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

Bu komut, `packages/ts` içinde tanımlı `docs:api` betiğini (`typedoc`) çalıştırır
ve API sitesini o paketin `docs/` çıktı dizini altında üretir. Oluşturulan çıktı
depoya eklenmez — komutu yerelde çalıştırın veya kendi dokümantasyon hattınıza
bağlayın.

Dokümantasyon sitesinin kendi TypeDoc yapılandırması `docs/typedoc.json`
konumundadır; çekirdek paketin giriş noktasına işaret eder, böylece docs
projesinden de yeniden üretebilirsiniz.

### Bir bakışta herkese açık yüzey

`@qorechain/sdk` paketinin bilinçli olarak desteklenen dışa aktarımları:

- **İstemci:** `createClient`, tipler `QoreChainClient`, `CreateClientOptions`,
  `ConnectTxOptions`, `ClientFees`.
- **Ağlar:** hazır ayarlar, arama/listeleme yardımcıları ve yapılandırma tipleri
  (networks modülü).
- **Yardımcılar:** `toBase` / `fromBase` (denom), adres kodlama/doğrulama.
- **Hesaplar:** `generateMnemonic`, `validateMnemonic`, `deriveNativeAccount`,
  `deriveEvmAccount`, `deriveSvmAccount`; hesap tipleri.
- **Birleşik hesaplar (0.6.0):** `deriveUnifiedAccount`,
  `unifiedAccountFromSeed`, `addressesFrom20`, `qoreAddresses`. (`unifiedAccountFromPhantomSignature` ve `connectPhantomUnified` 0.8.0'da kaldırıldı ve hata fırlatır.)
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, uzunluk sabitleri,
  algoritma kimlikleri/yardımcıları, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **PQC anahtar yaşam döngüsü (0.9.0):** `ensurePqcRegistered` (durumu REST
  üzerinden okur, `PqcKeyMismatchError`), `fetchPqcStatus`, `isRegisteredPqcKey`,
  `buildRegisterPqcKeyMsg`, `signProofOfPossession` / `verifyProofOfPossession`
  (`PROOF_OF_POSSESSION_DOMAIN`), `validateRegisteredPqcKey`,
  `isDegeneratePqcPublicKey`, `migrateToHybrid`, `migratePqcKeyHybrid`,
  `isUpgradeApplied` / `requireUpgradeApplied` (`CHAIN_UPGRADE_V3_2_2`,
  `CHAIN_UPGRADE_V3_2_3`).
- **Okuma istemcileri:** `RestClient` (`getPermissionSchema` dahil),
  `JsonRpcClient`, `QorClient`, HTTP yardımcıları (`getJson`, `postJsonRpc`,
  `buildUrl`, `joinUrl`, `QoreHttpError`); `amm`, `license`, `abstractaccount`
  (`permissionSchema`) ve `multilayer` `Anchor`/`Anchors` durum-çapa
  sorguları dahil olmak üzere her modül için tipli sorgu istemcileri.
  Genel uç noktalarda bazı tipli REST yardımcıları, ağ geçidinin sunmadığı
  rotaları çağırır: `getAiStats`, `getFeeEstimate`, `getXqorePosition`,
  `getInflationRate` ve `getReputation`.
  `getBurnStats`, `getAllBalances`, `getBridgeChains`, `getPermissionSchema` ve
  (çoğul `accounts` yolunu sunulan tekil
  `/qorechain/pqc/v1/account/{address}` rotasına düzelten 0.9.0'dan beri)
  `getPqcAccount` çalışır.
- **Cross-VM:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **CosmWasm:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **İşlemler:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient`
  (`pqcKeypair` ile bağlanıldığında hibrit, 0.9.0; `HYBRID_VERIFY_GAS`),
  `MSG_SEND_TYPE_URL`, hibrit yardımcılar (`encodeHybridExtension`,
  `attachHybridExtension`, `buildHybridTx`, `signAndBroadcastHybrid`);
  `decodeTxError` ile yapılandırılmış hata çözümleme (`abstractaccount`
  kodları 5/6/10/11 ve `pqc` kodu 21 dahil).
- **eth-native imzalama (0.6.0):** `signClassicalEth`, `signHybridEth`
  (`keccak256(SignDoc)` üzerinde secp256k1, pubkey tipi
  `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`, ayrıca ML-DSA-87 hibrit
  uzantısı), `EthNativeSigner`, `accountAuthInfo`.
- **Authenticator hatları (0.7.0):** mesaj oluşturucular
  `msg.abstractaccount.registerAuthenticator` / `revokeAuthenticator` /
  `executeEvm` / `executeCosmos` ve `msg.pqc` rotasyonu (ayrıca bağımsız olarak
  `executeEvmMsg`, `executeCosmosMsg`,
  `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`,
  `rotatePqcKeyMsg` adlarıyla dışa aktarılır); bayt düzeyinde birebir
  imza baytları `evmAuthSignBytes`,
  `cosmosAuthSignBytes`, `rotationSignBytes`; cüzdan oluşturucular
  `buildPhantomExecuteEvm` / `buildPhantomExecuteCosmos` (ed25519
  `signMessage`) ve `buildMetaMaskExecuteEvm` / `buildMetaMaskExecuteCosmos`
  (EIP-191 `personal_sign`); anahtar rotasyonu `rotatePqcKeyMsgFromMnemonic`,
  `derivePqcLegacy`. Bkz.
  [Authenticator kılavuzu](/sdk/guides/authenticators) (bu hatların arkasındaki
  modül bugün her iki ağda da kapalıdır).
- **Hibrit imza baytları (0.8.0+):** `buildHybridTx`, `signAndBroadcastHybrid`,
  `signHybridEth` ve `EthNativeSigner` üzerindeki `signBytesVersion` seçeneği
  (`"auto" | "v1" | "v2"`); `resolveSignBytesVersion`,
  `SIGN_BYTES_V2_UPGRADES`, `isHybridSignBytesRejection`, `hybridSignBytesV1` /
  `hybridSignBytesV2`, `migrationSignBytes`, `bridgeAttestationSignBytes`.
- **EVM yetkilendirme penceresi (0.8.2+):** `openEvmWindowMsg` (`nativeOnly` ve
  `allowedTargets` 0.9.0'dan itibaren), `closeEvmWindowMsg`, `fetchEvmWindow`,
  `classifyEvmWindowRejection`, `isEvmWindowRejection`, `MAX_EVM_WINDOW_BLOCKS`,
  `MAX_EVM_WINDOW_TXS`, `MAX_EVM_WINDOW_TARGETS`. Bkz.
  [EVM yetkilendirme penceresi](/sdk/guides/evm#evm-window).
- **EIP-7702 onayı (0.9.0):** `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`,
  `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`,
  `classifyEvmDelegationRejection`, `EVM_DELEGATION_CLEAR`,
  `MAX_EVM_DELEGATION_CONSENT_BLOCKS`.
- **Abstract-account özeti v2 (0.9.0):** `evmAuthSignBytesV2`,
  `resolveEvmAuthDigestVersion`; `validateSpendingRules`.
- **Kanonik PQC türetme (0.8.3+):** `derivePqcCanonical(account, mnemonic)`,
  `canonicalAccount(account)`; PQC kayıt mesajı
  `buildRegisterPqcKeyMsg`'dir (`ensurePqcRegistered` tarafından kullanılır).
  `derivePqcLegacy` yeni anahtarlar için kullanımdan kaldırılmıştır.

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, `erc20` yardımcıları, sözleşme
sarmalayıcıları (`deployContract`, `readContract`, `writeContract`), `precompiles`
bağlamaları, precompile destekli yardımcılar `simulateWithRiskScore`,
`aiRiskScore` ve `aiAnomalyCheck`, `PRECOMPILE_ADDRESSES` ve ABI'ler
(`ERC20_ABI`, `IQORE_PQC_ABI`, `IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`).
Precompile destekli bağlamalar ve yardımcılar genel ağlarda etkin değildir
(bkz. [EVM Precompile'ları](/developer-guide/evm-precompiles#network-status)).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, program oluşturucular (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`) ve program kimliği
sabitleri.

## Diğer diller

| Dil | Oluşturulan dokümanlar | Kurulum |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — herkese açık API üzerinde docstring'ler | `0.9.0` sürümünde `pip install qorechain-sdk` (`qorsdk` olarak içe aktarılır) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...@v0.9.0` (etiket `packages/go/v0.9.0`) |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` (0.9.0; `qorechain` olarak içe aktarılır) |
| Java | Maven Central javadoc | `io.github.qorechain:qorechain-sdk:0.9.0` |

Her paket aynı yüzeyi yansıtır (ağ hazır ayarları, denom/adres yardımcıları,
HD türetme — birleşik eth-native hesaplar dahil — PQC temel bileşenleri ve
hibrit imzalama, tipli mesajlar ve sorgular, authenticator hatları ve
REST + `qor_` JSON-RPC okuma istemcileri) ve dile özgü dokümantasyon
araçlarının işleyebilmesi için kaynak kodda satır içi belgelenmiştir.
TypeScript cüzdan oluşturucuları (`buildPhantom*` / `buildMetaMask*`) ve
tarayıcı cüzdanı bağdaştırıcıları yalnızca TypeScript'te mevcuttur.
