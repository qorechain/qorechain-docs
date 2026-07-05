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

`createClient()` varsayılan olarak **localhost** uç noktalarını kullanır. Gerçek
bir düğümle konuşmak için bir `endpoints` nesnesi geçirin:

```ts
const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",
    rpc: "https://rpc-testnet.qore.host",
    evmRpc: "https://evm-testnet.qore.host",
  },
});
```

İmzalama yolu (`connectTx`) konsensüs **`rpc`** uç noktasına ihtiyaç duyar;
CosmWasm okumaları da onu kullanır. REST okumaları `rest` kullanır; EVM ve
`qor_` çağrıları `evmRpc` kullanır.

## "Cannot find module 'viem'" / "'@solana/web3.js'"

Bunlar sırasıyla `@qorechain/evm` ve `@qorechain/svm` paketlerinin **eş
bağımlılıklarıdır** (peer dependency). Bunları projenize kurun:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Bir precompile çağrısı "feature not present" hatası veriyor

EVM precompile'ları yalnızca QoreChain EVM Engine çalıştıran düğümlerde
bulunur. Düz bir EVM düğümünde bu çağrılar başarısız olur. Heterojen düğümleri
hedefliyorsanız her precompile çağrısını sarmalayın ve hatayı çağrı bazında ele
alın.

## Tutarlarım bir milyon kat sapıyor

QOR'un temel birimi **10^6** `uqor`'dur. `toBase` / `fromBase` kullanın ve tüm
hesaplamaları temel birimlerde yapın:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

EVM çalışma zamanının QOR'u **18** ondalık basamakla temsil ettiğini unutmayın
(EVM geleneği); bu, Native tarafındaki 10^6'lık `uqor` tabanından farklıdır.

## Hangi paketler yayımlandı ve nerede?

Hepsi. TypeScript çekirdeği (`@qorechain/sdk`), EVM/SVM adaptörleri
(`@qorechain/evm`, `@qorechain/svm`), React kiti (`@qorechain/react`) ve
`create-qorechain-dapp` iskele aracı npm'de `0.7.0` sürümünde; Python istemcisi
PyPI'da (`pip install qorechain-sdk`, sürüm `0.7.0`, import `qorsdk`); Go
istemcisi modül proxy'sinde
(`go get github.com/qorechain/qorechain-sdk/packages/go/...`, etiket
`packages/go/v0.7.0`); Java istemcisi ise Maven Central'da
(`io.github.qorechain:qorechain-sdk:0.7.0`). Rust istemcisi crates.io'da
(`cargo add qorechain-sdk`) **yayımlanmış en son crate sürümündedir**; bu sürüm
şu anda 0.7.0'ın gerisindedir — crates.io'dan veya depodan kurun. Dil başına
tüm komutlar için [Kurulum](/sdk/install) bölümüne bakın.

## Anımsatıcı ifadem (mnemonic) reddediliyor

SDK, herhangi bir anahtar türetmeden önce hem BIP-39 kelime listesini **hem
de** sağlama toplamını doğrular; böylece yazım hatası içeren bir ifade sessizce
yanlış hesabı üretmek yerine hata fırlatır. Kelimeleri yeniden kontrol edin;
bir ifadeyi test etmek için `validateMnemonic` kullanın.

## Hibrit (PQC) işlemler

Hibrit (klasik + ML-DSA-87) gönderim Native yolunda **yayında ve zorunludur** —
yalnızca klasik imzalı Native işlemler zincir üzerinde reddedilir (zincir
v3.1.85). Bir hibrit işlemin PQC doğrulamasından geçebilmesi için imzalayanın
PQC açık anahtarının kayıtlı olması gerekir (`MsgRegisterPQCKeyV2`); ya da ilk
kullanımda otomatik kayıt için anahtarı gömmek üzere
`includePqcPublicKey: true` ayarlayabilirsiniz.
Zincir **yalnızca deterministik** ML-DSA-87 imzalarını kabul eder (SDK, 0.5.1
sürümünden beri varsayılan olarak deterministik imzalar); hedged imzalar `pqc`
kodu 21 (`hybrid_verify_failed`) ile başarısız olur.
[Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc) bölümüne bakın.

## Hibrit işlemlerim CheckTx aşamasında tx ayrıştırma hatasıyla başarısız oluyor

SDK'yı yükseltin. **0.6.0 ve önceki** sürümler
`/qorechain.pqc.v1.PQCHybridSignature` tx gövdesi uzantısını JSON olarak
serileştiriyordu ve zincirin tx kod çözücüsü bunu CheckTx aşamasında reddeder.
**0.6.1** sürümünden itibaren uzantı beş dilin tümünde protobuf ile kodlanır
(değer `0x08` ile başlar) — eski sürümlerle oluşturulan hibrit işlemler, her
şeritte (eth-native dahil) zincir üzerinde reddedilir.

## Authenticator harcamam `authenticator_replay` ile reddediliyor

Nonce yanlış. `MsgExecuteEVM.nonce`, hesabın **güncel** EVM nonce'u olmalıdır
(relayer farklı bir hesaptır, bu yüzden 1 **eklemeyin**);
`MsgExecuteCosmos.nonce` ise `(account, pubkey)` için **authenticator başına
sıra numarasıdır** ve ayrı bir depo sayacıdır. Değeri yeniden alın ve yeniden
imzalayın. Diğer authenticator hataları `decodeTxError` ile çözümlenir:
`abstractaccount` kodları 5 (`spending_limit_exceeded`), 6
(`session_key_expired`) ve 10 (`permission_denied`).
[Authenticator'lar ve yetkilendirilmiş harcama](/sdk/guides/authenticators)
bölümüne bakın.
