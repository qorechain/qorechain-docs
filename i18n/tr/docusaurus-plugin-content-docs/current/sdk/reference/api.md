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
  `unifiedAccountFromSeed`, `addressesFrom20`, `qoreAddresses`,
  `unifiedAccountFromPhantomSignature`, `connectPhantomUnified`.
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, uzunluk sabitleri,
  algoritma kimlikleri/yardımcıları, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **Okuma istemcileri:** `RestClient` (`getPermissionSchema` dahil),
  `JsonRpcClient`, `QorClient`, HTTP yardımcıları (`getJson`, `postJsonRpc`,
  `buildUrl`, `joinUrl`, `QoreHttpError`); `amm`, `license`, `abstractaccount`
  (`permissionSchema`) ve `multilayer` `Anchor`/`Anchors` durum-çapa
  sorguları dahil olmak üzere her modül için tipli sorgu istemcileri.
- **Cross-VM:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **CosmWasm:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **İşlemler:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient`,
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
  [Authenticator kılavuzu](/sdk/guides/authenticators).

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, `erc20` yardımcıları, sözleşme
sarmalayıcıları (`deployContract`, `readContract`, `writeContract`), `precompiles`
bağlamaları, `PRECOMPILE_ADDRESSES` ve ABI'ler (`ERC20_ABI`, `IQORE_PQC_ABI`,
`IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, program oluşturucular (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`) ve program kimliği
sabitleri.

## Diğer diller

| Dil | Oluşturulan dokümanlar | Kurulum |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — herkese açık API üzerinde docstring'ler | `0.7.0` sürümünde `pip install qorechain-sdk` (`qorsdk` olarak içe aktarılır) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...` (etiket `packages/go/v0.7.0`) |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` — yayımlanmış en güncel crate (depodan 0.7.0; `qorechain` olarak içe aktarılır) |
| Java | Maven Central javadoc | `io.github.qorechain:qorechain-sdk:0.7.0` |

Her paket aynı yüzeyi yansıtır (ağ hazır ayarları, denom/adres yardımcıları,
HD türetme — birleşik eth-native hesaplar dahil — PQC temel bileşenleri ve
hibrit imzalama, tipli mesajlar ve sorgular, authenticator hatları ve
REST + `qor_` JSON-RPC okuma istemcileri) ve dile özgü dokümantasyon
araçlarının işleyebilmesi için kaynak kodda satır içi belgelenmiştir.
TypeScript cüzdan oluşturucuları (`buildPhantom*` / `buildMetaMask*`) ve
tarayıcı cüzdanı bağdaştırıcıları yalnızca TypeScript'te mevcuttur.
