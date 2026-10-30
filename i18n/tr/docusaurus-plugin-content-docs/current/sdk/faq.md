---
slug: /sdk/faq
title: SSS ve Sorun Giderme
sidebar_label: SSS
sidebar_position: 8
---

# SSS ve sorun giderme

## Mainnet yayında mı?

Evet. Mainnet **yayında** (zincir kimliği `qorechain-vladi`, 7 Haziran 2026'dan beri
canlı) zincir sürümü v3.2.5'i çalıştırıyor (29 Ekim 2026'da 3.906.833 yüksekliğinde uygulandı, yönetişim önerisi 14; v3.2.4, 23 Ekim 2026'da 3.742.566 yüksekliğinde uygulanmıştı); testnet v3.2.6'yı çalıştırıyor (27 Ekim 2026'da uygulandı). Testnet hazır
ayarı (`qorechain-diana`) da kullanılabilir durumda kalmaya devam eder. Her iki hazır
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
QoreChain Native okumaları da onu kullanır. REST okumaları `rest` kullanır; EVM çağrıları
`evmRpc` kullanır (bu ad alanını sunan bir düğümde `qor_` çağrıları da). Mainnet
URL'leri [ağ referansında](/sdk/reference/network#public-endpoints) yer alır.

## "Cannot find module 'viem'" / "'@solana/web3.js'"

Bunlar sırasıyla `@qorechain/evm` ve `@qorechain/svm` paketlerinin **eş
bağımlılıklarıdır** (peer dependency). Bunları projenize kurun:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Bir precompile çağrısı "returned no data" / "feature not present" hatası veriyor

QoreChain EVM precompile'ları düğüme derlenmiştir ancak **mainnet'te etkin
değildir** ve testnet'te yalnızca üçü etkindir: yalnızca adresleri EVM modülünün
`active_static_precompiles` parametresinde listelenmiş olduğu yerlerde yanıt
verirler. Bu liste mainnet'te boştur; testnet'te PQC doğrulama (`0x…0A01`), PQC
anahtar durumu (`0x…0A02`) ve konsensüs parametreleri (`0x…0C01`) precompile'larını
içerir (27 Ekim 2026'da kontrol edildi); dolayısıyla AI çifti ve VM'ler arası köprü
orada hâlâ hiçbir şey yanıtlamaz. Bir precompile etkin olmadığında çağrı boş veri
döndürür; bu yüzden viem `returned no data ("0x")` bildirir ve yardımcı fonksiyon
hata fırlatır (bkz.
[EVM Precompile'ları: Ağ durumu](/developer-guide/evm-precompiles#network-status)).
Düz bir EVM düğümünde çağrılar aynı şekilde başarısız olur.
`GET /cosmos/evm/vm/v1/params` adresini kontrol edin ve hatanın çağrı bazında ele
alınması için her precompile çağrısını sarmalayın.

## `client.qor` çağrım -32601 ile başarısız oluyor

`client.qor`, yayımlanmış hiçbir düğüm sürümünün sunmadığı `qor_` JSON-RPC ad
alanını çağırır; genel EVM uç noktalarındaki `rpc_modules` yalnızca `eth`, `net`,
`rpc`, `txpool` ve `web3` listeler. Bunun yerine bir REST rotası kullanın; örneğin
`client.rest.get(...)` üzerinden `GET /qorechain/pqc/v1/account/{address}` (PQC
anahtar durumu) veya `GET /qorechain/burn/v1/stats`. Bkz.
[`qor_` ad alanı](/api-reference/json-rpc-qor_-namespace).

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

Hepsi (27 Ekim 2026'da kontrol edildi). TypeScript çekirdeği (`@qorechain/sdk`, 0.10.0),
React kiti (`@qorechain/react`, 0.10.0), `create-qorechain-dapp` iskele aracı
(0.10.0) ve EVM/SVM adaptörleri (`@qorechain/evm`, `@qorechain/svm`, 0.8.0) npm'de;
Python istemcisi PyPI'da (`pip install qorechain-sdk`, sürüm 0.10.0, import
`qorsdk`); Go istemcisi modül proxy'sinde
(`go get github.com/qorechain/qorechain-sdk/packages/go@v0.10.0`); Rust istemcisi
crates.io'da (`cargo add qorechain-sdk`, 0.10.0); Java istemcisi ise Maven
Central'da (`io.github.qorechain:qorechain-sdk:0.10.0`). Dil başına tüm komutlar için
[Kurulum](/sdk/install) bölümüne bakın.

## Anımsatıcı ifadem (mnemonic) reddediliyor

SDK, herhangi bir anahtar türetmeden önce hem BIP-39 kelime listesini **hem
de** sağlama toplamını doğrular; böylece yazım hatası içeren bir ifade sessizce
yanlış hesabı üretmek yerine hata fırlatır. Kelimeleri yeniden kontrol edin;
bir ifadeyi test etmek için `validateMnemonic` kullanın.

## Hibrit (PQC) işlemler

Hibrit (klasik + ML-DSA-87) gönderim Native yolunda **yayında ve zorunludur** —
yalnızca klasik imzalı Native işlemler zincir üzerinde reddedilir (zincir
v3.2.0). Bir hibrit işlemin PQC doğrulamasından geçebilmesi için imzalayanın
PQC açık anahtarının `MsgRegisterPQCKeyV2` ile (klasik imzalı, hibritten muaf bir
işlem) **açıkça kaydedilmiş** olması gerekir; açık anahtarı uzantıya gömmek
(`includePqcPublicKey: true`) anahtarı kaydetmez ve zincir ilk kullanımda bir
anahtarı kaydetmez. TypeScript'te istemciye anahtar çiftini verin
(`client.connectTx(signer, { pqcKeypair })`, SDK 0.9.0 veya sonrası); gönderdiği her işlem
hibrit olarak imzalanır.
Zincir, hedged veya deterministik, FIPS-204'e uygun her geçerli ML-DSA-87
imzasını kabul eder. SDK, bir işlemin her zaman aynı imzaya ve tx hash'ine sahip
olması için (0.5.1 sürümünden beri) varsayılan olarak deterministik imzalar.
Hibrit bir tx `pqc` kodu 21 (`hybrid_verify_failed`) ile başarısız olursa neden
sign-bytes sürümü, chain-id, eski bir PQC kütüphanesi veya kayıtlı olmayan ya da
farklı bir anahtardır; hedged imzalama asla neden değildir.
Her iki ağ da v2 sign-bytes biçimini doğrular; bu yüzden SDK **0.8.1 veya daha
yenisini** kullanın (güncel sürüm 0.10.0) ve `rest` (veya `signBytesVersion`) geçirin:
bunlardan biri yoksa oluşturucular `qorechain-vladi` / `qorechain-diana` üzerinde
hata fırlatır.
[Kod 21 sorun giderme](/developer-guide/post-quantum-signing#code-21) ve
[Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc) bölümlerine bakın.

## EVM işlemim "no open EVM authorisation window" ile reddediliyor

Zincir v3.2.0'dan beri EVM şeridi, bir işlemi yalnızca kayıtlı bir PQC anahtarı
ve açık bir yetkilendirme penceresi olan hesaptan kabul eder. Bir anahtar
kaydedin, bir pencere açın, ardından gönderin. Bkz.
[EVM yetkilendirme penceresi](/sdk/guides/evm#evm-window). SDK ile
`classifyEvmWindowRejection(err)` `"no-pqc-key"`, `"no-window"`,
`"exhausted"` veya `"invalid"` döndürür.

## Hibrit işlemlerim CheckTx aşamasında tx ayrıştırma hatasıyla başarısız oluyor

SDK'yı yükseltin. **0.6.0 ve önceki** sürümler
`/qorechain.pqc.v1.PQCHybridSignature` tx gövdesi uzantısını JSON olarak
serileştiriyordu ve zincirin tx kod çözücüsü bunu CheckTx aşamasında reddeder.
**0.6.1** sürümünden itibaren uzantı beş dilin tümünde protobuf ile kodlanır
(değer `0x08` ile başlar) — eski sürümlerle oluşturulan hibrit işlemler, her
şeritte (eth-native dahil) zincir üzerinde reddedilir.

## SDK hangi zincir sürümleriyle çalışır?

SDK **0.10.0**, zincir **v3.2.4** için istemci sürümüdür (mainnet'te 23 Ekim 2026'dan beri,
3.742.566 yüksekliğinde, yönetişim önerisi 13; testnet'te 19 Ekim'den beri). Mainnet 29 Ekim 2026'dan beri v3.2.5 çalıştırıyor; imzalama biçimi değişmedi, bu yüzden 0.10.0 orada çalışmaya devam eder. Staking katmanı
oluşturucularını ve okumalarını, `fetchAuthNonce` işlevini ve protokol özelliği okumalarını
ekler ([0.10.0'ın ekledikleri](/sdk/install#whats-new-0100) bölümüne bakın); bunlar, 0.9.0'ın
v3.2.2 ve v3.2.3 için eklediklerinin üzerine gelir: kayıt sırasında isteğe bağlı sahiplik
kanıtı (proof of possession; ağ v3.2.3'ü uyguladıktan sonra `ensurePqcRegistered`
tarafından otomatik eklenir) için oluşturucular, kapsamlı EVM pencereleri ve EIP-7702 onay mesajları.
SDK **0.8.1 veya daha yenisi** de her iki ağda işlem
yapar (v2 hibrit sign-bytes biçimi, kayıt, hibrit gönderimler ve EVM penceresi
değişmeden çalışır), ancak bu oluşturucuların hiçbirine sahip değildir: bunlar için
CLI'yı kullanın (bkz. [0.9.0 öncesi sürümler](/sdk/install#before-090)). İmzalama biçimi
v3.2.4 veya v3.2.5'te değişmedi. Testnet v3.2.6'yı çalıştırır (v3.2.5 orada 26 Ekim 2026'da, v3.2.6 ise
27 Ekim'de uygulandı); SDK'nın v3.2.4'ten sonra getirilen hiçbir şey için oluşturucusu yoktur;
bu yüzden v3.2.5 eklerinin (örneğin ML-KEM anahtar kayıt defteri ile yönetişimle yönetilen cross-VM ve sözleşme yolları) henüz bir SDK oluşturucusu yoktur ve bunlara CLI ile ulaşılır.

## PQC anahtar kaydım reddedildi ama ücret alındı

Zaten bir anahtara sahip olan bir hesap için yapılan kayıt, ücret düşüldükten sonra
zincir tarafından reddedilir. 0.9.0 ve sonrasındaki `ensurePqcRegistered` önce
`GET /qorechain/pqc/v1/account/{address}` adresini okur (`rest` geçirin), bu anahtar
çiftinin anahtarı kayıtlıysa kaydı atlar ve farklı bir anahtar kayıtlıysa
`PqcKeyMismatchError` fırlatır. Önceki sürümler, siz kendiniz
`status: { registered: found }` geçirmedikçe önce bakmazdı; burada `found` o rotadan
gelir. v3.2.3'ten beri zincir ayrıca zayıf, dejenere ve yeniden kullanılmış
anahtarları da reddeder; `derivePqcCanonical` veya `tx pqc gen-key` ile elde edilen
anahtarlar sorunsuzdur.

## `create-qorechain-dapp` imzalayamayan bir SDK kuruyor

Yalnızca iskele aracının 0.8.0 sürümü böyleydi: `@qorechain/sdk` ve
`@qorechain/evm` için `^0.3.0` aralıkları yazıyordu ve 0.x bir sürümde şapka işaretli
aralık 0.3 içinde kalır. 0.9.0 ve sonraki sürümler güncel SDK üzerinde iskeleler; 0.8.0'ı
kullandıysanız iskelelemeden sonra `npm i @qorechain/sdk@latest` (ve
`@qorechain/evm@latest`) komutunu çalıştırın.

## `VERSION` 0.8.0 diyor ama ben 0.8.3'ü kurdum

0.8.3'ün dışa aktarılan `VERSION` sabiti güncellenmemişti ve `0.8.0` bildiriyor;
0.9.0'dan itibaren paketle eşleşir. Daha önceki sürümlerde kurulu sürümü
`package.json` dosyasından okuyun.

## Authenticator harcamam `authenticator_replay` ile reddediliyor

(`abstractaccount` modülü mainnet'te kapalıdır; orada bir harcama, herhangi
bir nonce kontrol edilmeden önce `abstract account module is disabled` ile
reddedilir. Testnet'te etkindir. Bkz. [Authenticator'lar ve yetkilendirilmiş harcama](/sdk/guides/authenticators).
Aşağıdaki yönergeler modülün etkin olduğu her yerde geçerlidir.)

Nonce yanlış. Hem `MsgExecuteEVM.nonce` hem de `MsgExecuteCosmos.nonce`, `(account, pubkey)`
için bağlı anahtarın **authenticator sıra numarasıdır**: zincirin bağlı anahtar başına
tuttuğu, 0'dan başlayan ve her başarılı yürütmede artan bir sayaç. Bu, hesabın EVM
nonce'u **değildir**. Onu `fetchAuthNonce` ile okuyun (SDK 0.10.0, zincir v3.2.4 veya
sonrası) ya da eski sürümlerde bağlı anahtar başına kendiniz takip edin. v3.2.3'ten beri EVM şeridi ayrıca çağrının gas sınırını
bağlayan `evmAuthSignBytesV2`'yi imzalar (`resolveEvmAuthDigestVersion` biçimi
seçer). O anahtar için okuduğunuz (veya takip ettiğiniz) sayacı kullanın ve yeniden imzalayın.

Diğer authenticator hataları `decodeTxError` ile çözümlenir: `abstractaccount`
kodları 5 (`spending_limit_exceeded`), 6 (`session_key_expired`) ve
10 (`permission_denied`). Bkz.
[Authenticator'lar ve yetkilendirilmiş harcama](/sdk/guides/authenticators).
