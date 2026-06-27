---
slug: /sdk/reference/api
title: API Referansı
sidebar_label: API
sidebar_position: 3
---

# API referansı

## TypeScript (`@qorechain/sdk`)

TypeScript paketleri, genel yüzeylerinde eksiksiz TSDoc ile gelir ve çekirdek
pakete bir [TypeDoc](https://typedoc.org) yapılandırması bağlanmıştır.
`@qorechain/sdk` için HTML API referansını oluşturmak üzere:

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

Bu, `packages/ts` içinde tanımlanan `docs:api` betiğini (`typedoc`) çalıştırır ve
API sitesini o paketin `docs/` çıktı dizini altında üretir. Üretilen çıktı
commit edilmez — komutu yerel olarak çalıştırın veya kendi dokümantasyon
boru hattınıza bağlayın.

Dokümantasyon sitesinin kendi TypeDoc yapılandırması `docs/typedoc.json`
konumunda bulunur; çekirdek paketin giriş noktasına işaret eder, böylece
dokümantasyon projesinden de yeniden üretebilirsiniz.

### Genel yüzeye bir bakış

`@qorechain/sdk`'nın kasıtlı, desteklenen dışa aktarımları (export'lar):

- **İstemci:** `createClient`, `QoreChainClient`, `CreateClientOptions`,
  `ConnectTxOptions`, `ClientFees` tipleri.
- **Ağlar:** ön ayarlar, arama/listeleme yardımcıları ve yapılandırma tipleri
  (networks modülü).
- **Yardımcılar:** `toBase` / `fromBase` (denom), adres kodlama/doğrulama.
- **Hesaplar:** `generateMnemonic`, `validateMnemonic`, `deriveNativeAccount`,
  `deriveEvmAccount`, `deriveSvmAccount`; hesap tipleri.
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, uzunluk sabitleri,
  algoritma kimlikleri/yardımcıları, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **Okuma istemcileri:** `RestClient`, `JsonRpcClient`, `QorClient`, HTTP
  yardımcıları (`getJson`, `postJsonRpc`, `buildUrl`, `joinUrl`, `QoreHttpError`).
- **VM'ler arası:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **CosmWasm:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **İşlemler:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient`,
  `MSG_SEND_TYPE_URL`, hibrit yardımcılar (`encodeHybridExtension`,
  `attachHybridExtension`, `buildHybridTx`, `signAndBroadcastHybrid`).

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, `erc20` yardımcıları, sözleşme
sarmalayıcıları (`deployContract`, `readContract`, `writeContract`),
`precompiles` bağlantıları, `PRECOMPILE_ADDRESSES` ve ABI'ler (`ERC20_ABI`,
`IQORE_PQC_ABI`, `IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, program oluşturucuları (`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`) ve program kimliği
(program-id) sabitleri.

## Diğer diller

| Dil | Üretilen dokümantasyon | Kurulum |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — genel API'de docstring'ler | `pip install qorechain-sdk` (`qorsdk` olarak import edilir) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...` |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` |

Her paket aynı yüzeyi yansıtır (ağ ön ayarları, denom/adres yardımcıları, HD
türetme, PQC ilkelleri, REST + `qor_` JSON-RPC okuma istemcileri), kaynak içinde
satır içi olarak belgelenmiştir, böylece dile özgü dokümantasyon araçları bunu
işler.
