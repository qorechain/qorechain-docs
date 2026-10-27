---
slug: /qorel/signing-from-any-language
title: QoreChain işlemlerini her dilden imzalama
sidebar_label: Her dilden imzalama
sidebar_position: 8
---

# QoreChain işlemlerini her dilden imzalama

QORel, Rust'ta `qorel-signer` crate'i ile imzalar. Diğer relayer'lar, botlar ve araçlar, QoreChain SDK'sı ve kuantum sonrası kütüphanelerle aynı hibrit kuantum sonrası imzayı başka dillerde üretebilir. Bu sayfa hepsinin izlediği sözleşmeyi belirtir ve Rust, TypeScript, Go, Python ve Java için kullanılacak kütüphaneyi listeler. QoreChain'e işlem gönderen bir relayer, bot veya arka uç geliştiren geliştiriciler içindir.

## Yenilikler {#innovations}

- **Tek sözleşme, tek test vektörü kümesi.** Her dil aynı sign bytes'ı ve aynı uzantıyı oluşturur. QORel deposu, zincirin kabul ettiği işlemlerden bayt bayt yeniden oluşturulmuş vektörler yayımlar; böylece bir uygulamayı bir ağa dokunmadan önce kontrol edebilirsiniz.
- **Tek ek, uzantıdır.** Kuantum sonrası imza, işlem gövdesinin tek bir uzantı seçeneğinde taşınır; mesajlar, ücretler ve klasik imza olağan biçimlerini korur.
- **Bağlantı noktası dardır.** İmza, auth info kesinleştikten sonra ve klasik imza belgesi oluşturulmadan önce eklenir. Bir relayer'ın o noktada tek bir değişikliğe ihtiyacı vardır, baştan yazmaya değil.
- **Her yerde aynı anahtar.** ML-DSA-87 anahtarı hesabın mnemonic'inden QoreChain cüzdan türetmesiyle türetilir; böylece mnemonic'i içe aktaran her cüzdan veya relayer aynı kuantum sonrası anahtarı elde eder.

## Nasıl kullanılır {#how-to-use}

### Sözleşme {#contract}

QoreChain bir yerel hat işlemini yalnızca her iki imzayı da taşıyorsa kabul eder:

- **Klasik secp256k1 imzası**, olağan `SIGN_MODE_DIRECT` biçiminde. Uzantı dahil son gövdeyi kapsar.
- Gövdenin bir uzantı seçeneğinde **bir ML-DSA-87 (FIPS 204) imzası**; türü `/qorechain.pqc.v1.PQCHybridSignature`, `algorithm_id = 1`, `pqc_signature` (4.627 bayt) ve isteğe bağlı bir `pqc_public_key` (2.592 bayt) ile. İşlemin tek kritik uzantı seçeneği (`extension_options` içinde) olmalıdır.

ML-DSA imzası sign bytes'ı kapsar (sürüm 2, her iki ağda da güncel):

```
"qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id
                          || BE32(len(B0)) || B0
                          || BE32(len(A))  || A
```

- `B0`, PQC uzantısı olmayan `TxBody`'dir ve kurallı biçimde yeniden kodlanmıştır.
- `A`, değiştirilmemiş `AuthInfo` baytlarıdır.

İşlem sırası:

1. Gövdeyi ve auth info'yu oluşturun.
2. Sign bytes'ı ML-DSA-87 ile imzalayın.
3. Uzantıyı gövdeye ekleyin.
4. Son gövdeyi secp256k1 ile imzalayın.
5. Yayınlayın.

Yanlış yapılması kolay kurallar:

- `B0` kurallı olmalıdır, çünkü zincir onu gövdeyi çözerek, hibrit seçeneği çıkararak ve yeniden kodlayarak yeniden türetir. Kendi uzantı seçenekleri, `unordered` bayrağı, bilinmeyen alanlar veya kurallı olmayan bir kodlama içeren gövdeler göndermeyin.
- `pqc` codespace'i code 21 ile bir red, hibrit imzanın doğrulanmadığı anlamına gelir. Yeniden denemeden önce sign-bytes sürümünü ve hesabın kaydını yeniden okuyun; bkz. [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing#code-21).
- Gas: doğrulama anahtarlı imzalayıcı başına 2.000 gas'a ve yaklaşık 4,7 KB uzantının boyut maliyetine mal olur. İkisinin de sayılması için aynı yoldan simüle edin.

### Anahtarı kaydetme ve türetme {#keys}

Hesap, ML-DSA açık anahtarını `MsgRegisterPQCKeyV2` ile, bir sahiplik kanıtı da dahil olmak üzere, bir kez kaydeder. Bu, QoreChain'in yalnızca klasik imzayla kabul ettiği tek işlemdir. Bkz. [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing#pqc-key-registration).

ML-DSA anahtarı hesapla aynı mnemonic'ten türetilir:

```
seed = SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)[:32]
```

ardından `ML-DSA-87.KeyGen_internal(seed)`. Gizli veriler sıfırlanır ve asla yazdırılmaz. Aynı türetme [Anahtar türetme](/qoresign/guides/key-derivation) sayfasında anlatılır.

### QORel'deki imzalayıcı katmanı {#signer-layer}

`qorel-signer` crate'i işi üç arayüze böler:

- `PqSigner`: bir kuantum sonrası ilkel (`algorithm_id`, `public_key`, `sign`). `MlDsa87Signer` sağlanır; varsayılan olarak hedged imzalama, test vektörleri için deterministik imzalama ile; her imza kullanılmadan önce doğrulanır.
- `SignBytesFramer`: bir zincirin kuralları (`check_body`, `frame`, `pack`).
- `TxExtensionSigner`: relayer'ın çağırdığı şey. `PqExtensionSigner` bir ilkeli ve bir framer'ı birleştirir.

Relayer bir işlemi şu sırayla oluşturur: gövdeyi hiçbir ortak imzalayıcı uzantısı olmadan kodlar (`B0`); son auth info'yu kodlar (`A`); ortak imzalayıcıdan eklenecek uzantı seçeneklerini ister; gövdeyi bunlarla yeniden kodlar; son gövdenin imza belgesi üzerinden klasik imzayı oluşturur. Crate'i Rust'tan kullanmak için ona depodan bağlanın (crates.io'da değildir):

```toml
[dependencies]
qorel-signer = { git = "https://github.com/qorechain/QORel", tag = "qorel-v0.1.0" }
```

Bir zincir için hibrit imzalayıcıyı oluşturan ve ondan uzantı seçeneklerini isteyen eksiksiz bir çağrı, depodaki `crates/qorel-signer/README.md` dosyasındadır. Crate ham protobuf baytları üzerinde çalışır, zincirin reddedeceği gövdeleri reddeder (mevcut bir kritik uzantı seçeneği, `unordered`, bilinmeyen alanlar), sürüm bilinmeden önce QoreChain ağlarında asla v1 sign bytes'a geri dönmez, ürettiği her imzayı doğrular ve gizli verileri sıfırlar, `Debug` çıktısında da gizler. Testleri, zincirin ante handler'ının kabul ettiği işlemleri bayt bayt yeniden oluşturur. Ayrıca bkz. [genel bakışta qorel-signer](/qorel/overview#qorel-signer).

Farklı bir ek imzaya ihtiyaç duyan bir zincir bir framer uygular, algoritma farklıysa yeni bir ilkel de; relayer'daki başka hiçbir şey değişmez.

### Kütüphaneler {#libraries}

| Dil | Paket | Hibrit imzalama |
|---|---|---|
| Rust | `qorechain-sdk` (crates.io) veya [QORel deposundan](https://github.com/qorechain/QORel) `qorel-signer` (`crates/qorel-signer`) | `PqExtensionSigner` ile `qorel_signer::qorechain::qorechain_hybrid_signer`; `qorechain::tx::build_hybrid_tx` |
| TypeScript ve JavaScript | `npm install @qorechain/sdk` | `TxClient` bir `pqcKeypair` ile hibrit imzalar; `ensurePqcRegistered` |
| Go | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | `qorechain/tx` (hibrit oluşturma ve imzalama), `qorechain/signbytes`, `qorechain/pqcdx` |
| Python | `pip install qorechain-sdk` | `build_hybrid_tx`, `build_hybrid_signature_extension` |
| Java ve Kotlin | `io.github.qorechain:qorechain-sdk` (Maven Central) | `PqcDx` (kayıt, hibrit gönderim yolu) ve hibrit işlem oluşturucu |
| C ve diğerleri | [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) | ML-DSA-87 anahtar üretme, imzalama ve doğrulama bağlayıcıları; sign bytes'ı yukarıdaki gibi çerçeveleyin |

Her paketin güncel sürümü için [Geliştirici Paketleri](/developer-tools/overview), bir cüzdanda veya arka uçta imzalama için [QoreSign](/qoresign/overview) sayfasına bakın. Bazı paketlerdeki yalnızca klasik istemciler yerel hat işlemleri gönderemez; yazma için birini kullanmadan önce paket sayfasını kontrol edin.

### Test vektörleri {#test-vectors}

QORel deposundaki `crates/qorel-signer/tests/vectors/` şunları içerir:

- bir sign-bytes bilinen yanıt dosyası;
- röle işlemi vektörleri: uzantısız gövde, sign bytes, uzantı baytları ve tam imzalı işlem; zincirin kabul ettiği işlemlerden bayt bayt yeniden oluşturulmuştur;
- SDK'lar arası anahtar türetme vektörü.

Canlı bir ağa bir şey göndermeden önce bunları kendi dilinizde çalıştırın. QoreSign vektörleri [Test Vektörleri](/qoresign/vectors) sayfasındadır.

### Başka bir relayer'a kuantum sonrası imzalama ekleme {#other-relayers}

Bağlantı noktası, "auth info kesinleştikten sonra ve klasik imza belgesi oluşturulmadan önce"dir. Uzantıyı oraya takın:

- Hermes tabanlı relayer'larda bu, `crates/relayer/src/chain/cosmos/encode.rs::sign_tx` konumudur. QORel'in oradaki değişikliği geneldir: herhangi bir `TxExtensionSigner` uzantı seçenekleri ekleyebilir.
- Cosmos SDK `client/tx` paketi üzerine kurulu Go relayer'larında, `SetSignatures` öncesinde `TxBuilder`'ı sarmalayın.

## Nasıl erişilir {#how-to-access}

- **Ağ.** Sözleşme her iki QoreChain ağında aynıdır; QORel'in kendisi yalnızca testnet'te test edilmiştir.
- **Anahtar ve hesap.** Kayıtlı bir ML-DSA-87 anahtarı olan fonlanmış bir hesap; testnet QOR'u [Dashboard Musluğu](/dashboard/faucet)'ndan.
- **Maliyet.** Kütüphaneler ücretsizdir (Apache-2.0). İşlemler gas'ı gas başına 0,1 uqor tabanıyla öder.

## Nerede yayımlanır {#where-published}

| Paket | Kayıt defteri | Kaynak |
|---|---|---|
| `qorel-signer` | Depoda (`crates/qorel-signer`); crates.io'da yok, yukarıdaki git bağımlılığını kullanın | [qorechain/QORel](https://github.com/qorechain/QORel) |
| `qorechain-sdk`, `@qorechain/sdk`, Go modülü, Maven artifact'ı | crates.io, npm, Go proxy, Maven Central, PyPI | [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk) |
| `qorechain-pqc` | npm, PyPI, crates.io, Go, Maven | [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc) |

## Sınırlar ve bilinen sorunlar {#limits}

- **Yalnızca ML-DSA-87 (algoritma kimliği 1).** QORel'in ve yukarıdaki kütüphanelerin imzaladığı tek algoritma budur.
- **Sign-bytes sürümü.** Bu sayfa, her iki ağın doğruladığı sürüm 2'yi belgeler. Bir araç yine de sürümü varsaymak yerine zincirden (uygulanmış yükseltme kayıtlarından) okumalıdır; QORel bunu yapar.
- **İmzalama yereldir.** Bu kütüphanelerin hiçbiri sizin için bir anahtar tutmaz veya bir donanım cüzdanı üzerinden imzalamaz.
- **Dil örnekleri burada tekrarlanmaz.** Her paketin kendi hızlı başlangıcını kullanın; bu kılavuz her dilin QORel test vektörlerine karşı çalıştırıldığını iddia etmez.
