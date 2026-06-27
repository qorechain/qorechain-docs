---
slug: /sdk/faq
title: SSS ve Sorun Giderme
sidebar_label: SSS
sidebar_position: 8
---

# SSS ve sorun giderme

## Mainnet yayında mı?

Evet. Mainnet **yayında** (zincir kimliği `qorechain-vladi`). Testnet hazır ayarı
(`qorechain-diana`) da kullanılabilir durumda kalmaya devam eder. Her iki hazır
ayar da localhost uç nokta varsayılanlarıyla gelir; ağı
`createClient({ network: "mainnet" })` ile seçin ve `endpoints`'i kendi düğüm
URL'lerinizle geçersiz kılın.
[Ağ ve uç noktalar](/sdk/reference/network) bölümüne bakın.

## Neden çağrılarım localhost'a gidiyor?

`createClient()`, varsayılan olarak **localhost** uç noktalarını kullanır.
Gerçek bir düğümle iletişim kurmak için bir `endpoints` nesnesi geçirin:

```ts
const client = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    rpc: "https://rpc.testnet.example",
    evmRpc: "https://evm.testnet.example",
  },
});
```

İmzalama yolu (`connectTx`), konsensüs **`rpc`** uç noktasına ihtiyaç duyar;
CosmWasm okumaları da onu kullanır. REST okumaları `rest`'i kullanır; EVM ve
`qor_` çağrıları `evmRpc`'yi kullanır.

## "Cannot find module 'viem'" / "'@solana/web3.js'"

Bunlar sırasıyla `@qorechain/evm` ve `@qorechain/svm`'nin **peer bağımlılıklarıdır**.
Bunları projenize kurun:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Bir precompile çağrısı "feature not present" hatası fırlatıyor

EVM precompile'ları yalnızca QoreChain EVM Engine çalıştıran düğümlerde bulunur.
Düz bir EVM düğümünde bu çağrılar başarısız olur. Heterojen düğümleri
hedefliyorsanız, her precompile çağrısını sarın ve hatayı çağrı başına işleyin.

## Miktarlarım bir milyon kat sapıyor

QOR'un **10^6** temel `uqor` birimi vardır. `toBase` / `fromBase` kullanın ve tüm
hesaplamaları temel birimlerde yapın:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

EVM çalışma zamanının QOR'u **18** ondalık basamakla (EVM kuralı) temsil ettiğini
unutmayın; bu, 10^6'lık Cosmos `uqor` tabanından farklıdır.

## Hangi paketler yayınlandı ve nerede?

Hepsi. TypeScript çekirdeği (`@qorechain/sdk`) ve EVM/SVM adaptörleri
(`@qorechain/evm`, `@qorechain/svm`) npm'de `0.3.0` sürümündedir; Python istemcisi
PyPI'dadır (`pip install qorechain-sdk`, `0.3.1` sürümünde, import `qorsdk`); Rust
istemcisi crates.io'dadır (`cargo add qorechain-sdk`, `0.3.0` sürümünde); ve Go
istemcisi modül proxy'sindedir (`go get github.com/qorechain/qorechain-sdk/packages/go/...`).
Tam dile özgü komutlar için [Kurulum](/sdk/install) bölümüne bakın.

## Mnemonic'im reddediliyor

SDK, herhangi bir anahtar türetmeden önce hem BIP-39 kelime listesini **hem de**
sağlama toplamını doğrular, böylece yazım hatası olan bir ifade, sessizce yanlış
hesabı üretmek yerine hata fırlatır. Kelimeleri tekrar kontrol edin; bir ifadeyi
test etmek için `validateMnemonic` kullanın.

## Hibrit (PQC) işlemler

Yerel ML-DSA-87 imzala/doğrula ve hibrit işlem oluşturma yardımcıları bugün
kullanılabilir durumdadır. Bir hibrit işlem zincir üzerinde PQC ile doğrulanmadan
önce, imzalayanın PQC ortak anahtarı kaydedilmelidir (`MsgRegisterPQCKey`) ya da
otomatik kayıt için onu gömmek üzere `includePqcPublicKey: true` ayarını
yapmalısınız. Tam hibrit gönderim, canlı ağ için sonlandırılma aşamasındadır.
[Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc) bölümüne bakın.
