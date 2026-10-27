---
slug: /qoresign/guides/keplr-compatible-wallets
title: Keplr uyumlu bir cüzdana hibrit imzalama ekleyin
sidebar_label: Keplr uyumlu cüzdanlar
sidebar_position: 1
---

# Keplr uyumlu bir cüzdana hibrit imzalama ekleyin

QoreChain'in yerel hattı, kayıtlı bir ML-DSA-87 anahtarı olan bir hesaptan gelen
işlemi, işlem o anahtarın imzasını da taşımadıkça reddeder. Keplr uyumlu bir
cüzdan (Keplr, Leap, Cosmostation ve `signDirect` uygulayan diğerleri)
secp256k1 kısmını üretir; ML-DSA-87 kısmı ise kuantum sonrası anahtarı tutan
tarafça sağlanmalıdır.

Bunu eklemenin iki yolu vardır.

## Seçenek A: cüzdan iki anahtarı da tutar (QoreSign) {#option-a}

Cüzdan, ML-DSA-87 anahtarını secp256k1 anahtarının yanında türetir ve imzalamadan
önce katmanı ekler.

```ts
import { deriveCanonicalPqKey, signPqLayer } from "@qorechain/qoresign";

// at account creation or import, from the same mnemonic and address
const pqKey = deriveCanonicalPqKey({ mnemonic, address });

// inside signDirect(signerAddress, signDoc):
const { bodyBytes } = signPqLayer({
  chainId: signDoc.chainId,
  bodyBytes: signDoc.bodyBytes,
  authInfoBytes: signDoc.authInfoBytes,
  pqKey,
});
const finalDoc = { ...signDoc, bodyBytes }; // sign this with the secp256k1 key, as for any Cosmos SDK chain
```

Kullanıcıyı güvende tutan kurallar:

- İmzalamadan önce kullanıcıya `bodyBytes` / `authInfoBytes` içindeki mesajları
  ve ücreti gösterin; her `signDirect` isteğinde olduğu gibi. ML-DSA-87 imzası
  ücreti de kapsar.
- Bir dApp zaten bir PQC katmanı taşıyan bir gövde gönderdiğinde, klasik imzanızı
  eklemeden önce `assertPqLayerMatchesRegisteredKey` ile
  (`@qorechain/qoresign/network` içinden) kontrol edin; doğrulanmayan bir katman
  hiçbir şeyi korumaz.
- Anahtarı hesap başına bir kez, `classicalOnly` modunda imzalanan
  `buildRegisterPqKeyMessage` ile kaydedin (bkz.
  [`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
  ve [Kayıt](/qoresign/spec/hybrid-signing-v1#registration)).
- Yayından sonra, onaylanmış işlemi geri okuyun ve `evaluateLayerState`
  çağırın; `downgraded` katmanın zincire ulaşmadığı anlamına gelir.

## Seçenek B: kuantum sonrası anahtarı dApp tutar (`@qorechain/wallet-adapter`) {#option-b}

Cüzdan değiştirilemediğinde bir dApp
[`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter)
kullanabilir: gövdeye ML-DSA-87 katmanını ekler ve ardından değiştirilmemiş
cüzdandan sıradan bir `signDirect` imzası ister. Böylece kuantum sonrası anahtar
cüzdanda değil, dApp'te veya yardımcı bir imzalayıcıda durur. QoreSign ve adapter,
aynı anahtarlar için aynı baytları üretir.

## Keplr için zincir kaydı {#chain-registration}

Zinciri, yayımlanmış zincir tanımlayıcılarıyla `experimentalSuggestChain` ile
önerin: zincir kimlikleri `qorechain-vladi` (mainnet) ve `qorechain-diana`
(testnet), bech32 öneki `qor`, coin türü `118`, ücret birimi 6 ondalıklı `uqor`
ve asgari gas fiyatı `0.1`. Herkese açık uç noktalar:
`https://rpc.qore.host` ve `https://api.qore.host` (mainnet),
`https://rpc-testnet.qore.host` ve `https://api-testnet.qore.host` (testnet).
