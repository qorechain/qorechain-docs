---
slug: /developer-tools/custody-kit
title: QoreChain Saklama Kiti
sidebar_label: Saklama Kiti
sidebar_position: 32
---

# QoreChain saklama kiti

QoreChain saklama kiti, QoreChain üzerinde müşteri fonlarını tutan saklama kuruluşları ve borsalar için yazılı bir entegrasyon kılavuzu, bir test vektörü kümesi ve küçük referans koddur. Ağın her yürütme rayında ne istediğini açıklar ve bir entegrasyonun yanlış yapılması kolay olan kısımlarını okunabilir kodla gösterir: bir adresi kontrol etmek, imzalı bir işlemi yayınlanmadan önce çözmek ve doğrulamak, ve hangi gelen transferlerin hesaba kaydedileceğine karar vermek.

Saklama kuruluşları, borsalar, ödeme işleyicileri ve cüzdan arka uçları ile bu entegrasyonları inceleyen mühendisler ve denetçiler içindir. Sürüm **0.1.0**, 27 Ekim 2026'da yayınlandı, Apache-2.0. Mainnet (`qorechain-vladi`) ve testnet (`qorechain-diana`) ile çalışır; birlikte gelen canlı kontroller testnet üzerinde çalışır ve yalnızca okur.

**Önce bunu okuyun: kit örnek koddur, bir kütüphane değildir.** Depoyu klonlar ve dilinize ait klasörü okur, kopyalar veya projenize eklersiniz. Kitin npm, PyPI, crates.io veya Maven Central paketi yoktur, tasarım gereği. Biçimce tek istisna Go'dur: Go klasörü etiketli bir sürümü olan bir Go modülüdür, dolayısıyla `go get` onu getirebilir, ancak yine de kararlı bir API sözü olmayan örnek koddur (bkz. [Kütüphane nedir, örnek kod nedir](#library-vs-example)). İmzalama ve kriptografik doğrulama, yayınlanmış bir kütüphane olan [QoreSign](/qoresign/overview)'dan gelir.

## Yenilikler {#innovations}

- **Tek bir davranış, beş dilde, tek bir dosyayla kanıtlanmış.** TypeScript, Python, Go, Rust ve Java aynı dört işlevi aynı sonuçlar ve aynı hata kodlarıyla uygular. Her dil, ortak test vektörü dosyası `vectors/custody-v1.json` üzerinde çalışır; böylece kiti başka bir dile taşıyan bir ekip eşleştiğini kanıtlayabilir.
- **Adresler için kararlı hata kodları.** `validateAddress` asla hata fırlatmaz. Başarıda adresin iki yazımını, aksi halde on bir kararlı koddan birini (`EMPTY`, `WHITESPACE`, `BAD_HEX`, `BAD_EIP55`, `NO_CHECKSUM`, `MIXED_CASE`, `BAD_BECH32`, `BAD_CHECKSUM`, `WRONG_PREFIX`, `BAD_LENGTH`, `KIND_NOT_ALLOWED`) döndürür; böylece bir çekim formu kesin nedeni gösterebilir.
- **Yayın öncesi iki imzanın da kontrolü.** `verifyTx`, `SignDoc` üzerindeki secp256k1 imzasını, ML-DSA-87 katmanını sizin verdiğiniz bir anahtara karşı ve işlemin içindeki açık anahtarın beklediğiniz anahtar olup olmadığını kontrol eder. `{ valid, classical, signerKey, pq }` döndürür ve yalnızca hatalı biçimlendirilmiş girdide hata fırlatır, kötü bir imzada asla. İkinci bir süreç, hiçbir şey gönderilmeden önce imzalanmış her çekim üzerinde bunu çalıştırabilir.
- **Gerekçeli para yatırma kararları.** `extractDeposits`, bir işlemin gelen her transferini bir `creditable` bayrağı ve bir `reason` ile (`evm_failed`, `fee_refund`, `unsupported_message` veya `null`) döndürür. EVM entegratörlerini şaşırtan durumu yakalar: başarısız bir EVM yürütmesi native düzeyde yine 0 sonuç kodu bildirir.
- **Düğümle eşleşen bir sorgu oluşturucu.** `buildDepositQuery`, bir adrese gelen transferler için tam olarak yüzde kodlanmış REST yolunu üretir (limit 1 ile 100, yükseklik sınırları, artan sıralama) ve `0x` girdisini `qor1` biçimine çevirir.
- **Ray başına yazılmış rehberlik.** Kılavuz native rayı, EVM rayını yetkilendirme pencereleriyle birlikte kapsar ve SVM rayının işlemlere açık olmadığını, dolayısıyla onun üzerine hiçbir para yatırma veya çekim akışı kurulmaması gerektiğini belirtir.

## Kullanım senaryoları {#use-cases}

1. **Bir borsa için para yatırma tarayıcısı.** Bir yükseklik imleci tutun, kendi düğümünüze karşı `buildDepositQuery({ address, minHeight, maxHeight })` çağırın, ardından başarılı `MsgSend`, `MsgMultiSend` ve EVM transferlerini `uqor` olarak hesaba kaydetmek için `extractDeposits(txResponse, address)` çağırın. Başarısız EVM yürütmeleri, gaz iadeleri ve diğer mesajlar dışarıda bırakılır veya inceleme için işaretlenir.
2. **İkinci onaylayıcılı çekim hattı.** İmzalayıcı hibrit imzalı bir çekim ürettikten sonra, bağımsız bir süreç işlem yayınlanmadan önce `decodeTx` (alıcı, tutar, ücret, memo) ve `verifyTx` (iki imza, beklenen anahtarlar) çalıştırır.
3. **Adres girişi.** Kullanıcının verdiği her çekim adresini `validateAddress` ile doğrulayın, `qorvaloper` adreslerini ödeme hedefi olarak reddedin ve isteğe bağlı olarak hex girdi için EIP-55 sağlama toplamlarını zorunlu kılın.
4. **HSM planlaması.** Bir güvenlik ekibi, HSM tarafından üretilen ML-DSA-87 anahtarları ile mnemonic tabanlı kanonik türetme arasında seçim yapmak, boş bağlamla saf ML-DSA-87 imzalaması için PKCS #11 v3.2 desteğini kontrol etmek ve rotasyon ile yedeklemeleri tasarlamak için anahtar yönetimi kılavuzunu kullanır.
5. **EVM ödeme hattı.** EVM rayında ödeme yapan bir borsa ML-DSA-87 anahtarını bir kez kaydeder, tek bir hibrit native ray işlemiyle toplu iş başına kapsamlı bir yetkilendirme penceresi açar, ardından mevcut secp256k1 yığınıyla sıradan EIP-1559 işlemlerini imzalar.
6. **Müşteriler için staking.** Staking sunan bir saklama kuruluşu staking kılavuzunu izler (delege etme, delegasyonu geri alma, yeniden delege etme, ödüller, staking kademe kilitleri) ve imzalamadan önce her staking mesajını `decodeTx` ile çözer.
7. **Başka bir dile taşıma veya denetim.** Kendi uygulamasını yazan bir ekip, referans sonuçlar ve hata kodlarıyla eşleştiğini göstermek için onu `vectors/custody-v1.json` üzerinde çalıştırır.
8. **Mainnet öncesi prova.** Bir entegrasyon ekibi testnet provasını (anahtar kaydı, hibrit gönderim, para yatırma taraması, staking, EVM penceresi, anahtar rotasyonu) ve entegrasyon kontrol listesini izler.

## Nasıl çalışır {#how-it-works}

### Kitin içeriği {#contents}

| Parça | Nedir |
|---|---|
| `docs/` | On kılavuz sayfası: ray başına imzalama, adresler ve türetme, para yatırmalar, çekimler, staking, hatalar, anahtar yönetimi, test ortamı, entegrasyon kontrol listesi, SSS. |
| `code/ts`, `code/python`, `code/go`, `code/rust`, `code/java` | Aynı dört işleve ve dil başına küçük bir örnek komut satırına sahip referans kod. |
| `vectors/custody-v1.json` | Test vektörleri: her hata kodu için bir iyi ve bir kötü adres, hibrit imzalı bir `MsgDelegate`, bir eth-native hesaptan hibrit imzalı bir `MsgOpenEVMWindow`, staking ve pencere mesajları, hatalı biçimlendirilmiş işlemler, para yatırma sorguları ve para yatırma çıkarma durumları. QoreSign vektörleri referansla yeniden kullanılır ve SHA-256 ile kontrol edilir. |
| Canlı kontroller | `QORE_LIVE_TEST=1` ile açılan, testnet'e karşı yalnızca okuma kontrolleri: staking parametreleri, yakın tarihli bir transfer için para yatırma sorgusu ve kaydedilmiş bir hibrit işlemin doğrulanması. |

### Kütüphane nedir, örnek kod nedir {#library-vs-example}

| Parça | Tür | Nereden alınır |
|---|---|---|
| QoreSign (imzalama, ML-DSA-87 ve secp256k1 doğrulaması, anahtar kayıt mesajı) | Yayınlanmış kütüphane | npm, PyPI, crates.io, Go, Maven Central. Bkz. [QoreSign](/qoresign/overview). |
| Kitin TypeScript, Python, Rust ve Java kodu | Örnek kod, hiçbir kayıt defterinde yayınlanmaz | `qorechain/qorechain-custody-kit` deposunu klonlayın ve klasörü kopyalayın veya projenize ekleyin. |
| Kitin Go kodu (paket `custodykit`) | Örnek kod. Etiketli bir sürümde Go modülü olarak getirilebilir, kararlı API sözü yoktur | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` veya klonlayın ve projenize ekleyin. |
| Kılavuz sayfaları, vektörler ve kontrol listesi | Belgeler ve veri | Depo. |

Kit hiçbir imza şeması uygulamaz. ML-DSA-87 ve secp256k1 doğrulaması QoreSign'dan gelir. Python kodu, EIP-55 sağlama toplamı için kullanılan küçük bir Keccak-256 içerir ve başka hiçbir şey içermez.

### Raylar {#lanes}

| Ray | Saklama kuruluşu neyi imzalar | Durum |
|---|---|---|
| Native (Cosmos SDK) | secp256k1 `SIGN_MODE_DIRECT` artı bir ML-DSA-87 (FIPS 204) katmanı. Kayıtlı anahtarı olan bir hesabın klasik yolu yoktur; anahtarsız bir hesap yalnızca anahtarını kaydetmek (veya jail'den çıkmak) için klasik gönderebilir. | açık |
| EVM | Sıradan secp256k1 Ethereum işlemleri (EIP-155 ve EIP-1559); kayıtlı bir ML-DSA-87 anahtarı ve canlı bir yetkilendirme penceresi olan gönderici için kabul edilir, pencere hibrit bir native ray işlemiyle açılır: pencere başına bir ML-DSA-87 imzası. | açık |
| SVM | Uygulanamaz | işlemlere açık değil |

### Hibrit native ray işlemleri {#hybrid}

- Hibrit bir işlem, aynı hesap tarafından iki kez imzalanmış sıradan bir `TxRaw`'dır. ML-DSA-87 imzası gövdede `/qorechain.pqc.v1.PQCHybridSignature` uzantı seçeneği olarak taşınır (`algorithm_id = 1`, 4.627 baytlık bir imza, isteğe bağlı olarak 2.592 baytlık açık anahtar). secp256k1 imzası, uzantı dahil nihai gövde üzerindeki olağan `SIGN_MODE_DIRECT` imzasıdır.
- ML-DSA-87 imzası, uzantıyı dışarıda bırakan imzalanacak baytları kapsar. Her iki genel ağ da v2 imzalanacak baytlarını doğrular (bir alan dizesi, zincir kimliği, ardından gövde ve auth info baytları). Hedged ve deterministik FIPS 204 imzalarının ikisi de kabul edilir. Normatif biçim [QoreSign hibrit imzalama şartnamesi](/qoresign/spec/hybrid-signing-v1)'dir.
- İşlem sırası: gövdeyi ve auth info'yu kodlayın (ücret ve gaz sabit), v2 imzalanacak baytlarını hesaplayın, ML-DSA-87 ile imzalayın, uzantıyı ekleyin, `SignDoc`'u secp256k1 ile imzalayın, yayınlayın.
- Anahtar kaydı: `MsgRegisterPQCKeyV2` (`key_type = "hybrid"`, isteğe bağlı ve önerilen bir sahiplik kanıtıyla), anahtarsız hesaptan klasik olarak imzalanır, sıcak adres başına bir kez. QoreSign mesajın tamamını oluşturur.
- Hibrit bir işlem klasik bir işlemden yaklaşık 4,7 KB daha büyüktür ve daha fazla gaz kullanır, bu yüzden her zaman simüle edin.

### Adresler {#addresses}

- `qor1...` ve `0x...`, aynı 20 baytın iki yazımıdır. İkisinden birine gönderilen fonlar aynı bakiyeye ulaşır. `qorvaloper1...` bir doğrulayıcı operatör adresidir ve asla bir ödeme adresi değildir.
- İki hesap türü vardır: `secp256k1` (coin type 118, yol `m/44'/118'/0'/0/i`) ve eth-native `eth_secp256k1` (coin type 60, yol `m/44'/60'/0'/0/i`). Aynı mnemonic iki farklı hesap verir. Eth-native hesaplar tek bir anahtarın hem native rayı hem EVM rayını işletmesine olanak tanır.
- ML-DSA-87 anahtarı kanonik türetmeden (QoreChain cüzdanlarının ve SDK'nın kaydettiği, `qor1` adresine ve mnemonic'e bağlı), taslak bir hiyerarşik türetmeden veya bir HSM'de üretilen rastgele bir anahtardan gelebilir. Kaydedildikten sonra geçerli her anahtar çalışır. Bkz. [anahtar türetme](/qoresign/guides/key-derivation).

### Para yatırmalar {#deposits}

- QoreChain bir bloğu kaydedildiğinde kesinleştirir. Yeniden düzenleme (reorg) yoktur, dolayısıyla kaydedilmiş bir bloktaki işlem bir blok sonra nihaidir. Ek onaylar operasyonel bir tercihtir.
- Native ray para yatırmaları `GET /cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...' AND tx.height>=H1 AND tx.height<=H2&order_by=ORDER_BY_ASC` ile bulunur. `buildDepositQuery` tam olarak bu yolu oluşturur.
- `extractDeposits` içindeki kayıt kuralları: `code != 0` olan bir işlem hiçbir şey taşımamıştır; `msg_index` olmayan bir `transfer` ücret ödemesidir; tutarlar denom'a göre süzülür (varsayılan olarak `uqor`); `MsgSend` ve `MsgMultiSend` çıktıları hesaba kaydedilebilir; `MsgEthereumTx`, EVM yürütmesi başarısız olmadıkça veya transfer ücret toplayıcıdan bir gaz iadesi olmadıkça hesaba kaydedilebilir; geri kalan her şey inceleme için `reason: "unsupported_message"` ile döner.

### Çekimler ve gaz {#withdrawals}

- Ücret = `uqor` cinsinden ceil(gaz limiti x gaz fiyatı). Asgari gaz fiyatı 0,1 uqor'dur ve gaz limiti üzerinden alınır.
- Gaz limitini, tamamen imzalanmış işlemin bir simülasyonundan alın. v3.2.5 yükseltmesini uygulamış düğümlerde (şimdi testnet, uygulandıktan sonra mainnet) `ceil(gas_used x 1.02) + 2000` kullanın, çünkü simülasyon ML-DSA-87 doğrulamasını içerir. Bundan önce `ceil((gas_used + 40000) x 1.4)` kullanın. Hangisinin geçerli olduğunu tarihe göre değil, `GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.5` ile tespit edin.
- Gaz limitini seçtikten sonra `AuthInfo`'yu yeniden oluşturun ve yeniden imzalayın: her iki imza da ücreti kapsar.
- Sıra numaraları: sıcak adres başına bir imzalayıcı kuyruğu çalıştırın veya paralel ödemeler için birkaç sıcak adres kullanın.

### EVM yetkilendirme pencereleri {#evm-windows}

- Bir pencere `/qorechain.pqc.v1.MsgOpenEVMWindow` ile açılır (`blocks` 1 ile 17.280, `max_txs` 1 ile 1.000, `uqor` cinsinden `max_value` değer artı azami ücreti sayar, isteğe bağlı `native_only`, en fazla 16 adreslik isteğe bağlı `allowed_targets`) ve `MsgCloseEVMWindow` ile kapatılır. Durum `GET /qorechain/pqc/v1/evm_window/{address}` adresindedir.
- Bir pencere açmak mevcut pencerenin yerini alır ve hesabın EVM nonce'u olan sıra numarasını ilerletir: önce pencereyi açın, sonra nonce'u okuyun.
- `eth_call` ve `eth_estimateGas` pencere gerektirmez.

## Nasıl kullanılır {#how-to-use}

### Kodu alın {#install}

Kit referans koddur: bir paket kurmak yerine depoyu klonlayın veya dilinize ait klasörü projenize ekleyin.

| Dil | Nasıl alınır | Bağımlılık | Asgari platform |
|---|---|---|---|
| TypeScript | `git clone https://github.com/qorechain/qorechain-custody-kit`, ardından `cd code/ts && pnpm install && pnpm build` | `@qorechain/qoresign` 0.1.0 (npm) | Node.js 20 |
| Python | klonlayın, ardından `cd code/python && pip install -r requirements-dev.txt`. `verify_tx` için ayrıca `pip install qorechain-qoresign==0.1.1` | çalışma zamanında hiçbiri; `verify_tx` için `qorechain-qoresign` 0.1.1 (PyPI) | Python 3.9 |
| Go | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` (paket `custodykit`) veya klonlayın | `github.com/qorechain/qoresign/go` v0.1.0 | Go 1.25 |
| Rust | klonlayın, ardından `cd code/rust && cargo build` (crates.io'da değil) | `qorechain-qoresign` 0.1.0 (crates.io) | Rust 2021 edition |
| Java | klonlayın, ardından `cd code/java && mvn test` (Maven Central'da değil) | `io.github.qorechain:qoresign:0.1.0` (Maven Central), Gson | Java 17 |

QoreSign, Python dahil kitin kullandığı her dil için yayınlanmıştır. Python kodundaki `verify_tx`, PyPI'den `qorechain-qoresign` 0.1.1 gerektirir (macOS ve Linux). TypeScript, Go, Rust ve Java kodu QoreSign 0.1.0'a sabitlenmiştir; bu sürüm 0.1.1'in yanında hâlâ yayındadır.

### Hızlı başlangıç {#quickstart}

Zinciri okuyan her şey için hedef ağ: testnet (`qorechain-diana`). `QORE_REST` ortam değişkeni örnekleri ve canlı kontrolleri başka bir REST uç noktasına yönlendirir; üretimde bu sizin kendi düğümünüzdür. Aşağıdaki adresler genel BIP-39 test ifadesinden gelir ve asla fon tutmamalıdır.

**1. Bir adresi doğrulayın (Go, çevrimdışı).** 27 Ekim 2026'da `v0.1.0` etiketinin bir klonundan çalıştırıldı:

```bash
cd code/go
go run ./cmd/custody-kit validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94
```

Şunu yazdırdı (çıkış kodu 0):

```json
{
  "valid": true,
  "kind": "account",
  "format": "hex",
  "checksum": "eip55",
  "bech32": "qor1npvwllfr9dqr8erajqqr6s0vxnk2ak55am9g2c",
  "hex": "0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
}
```

Bir doğrulayıcı adresi, `--allow-validator` ile izin vermediğiniz sürece reddedilir:

```bash
go run ./cmd/custody-kit validate qorvaloper19rl4cm2hmr8afy4kldpxz3fka4jguq0a5ws5he
```

`"valid": false` ile birlikte `"error": "KIND_NOT_ALLOWED"` ve `a validator address is not accepted here` ayrıntısını yazdırdı ve 1 koduyla çıktı. Go test paketi (`go test ./...`) de aynı checkout üzerinde geçti.

**2. İmzalı bir işlemi yayınlamadan önce çözün ve doğrulayın.**

```bash
go run ./cmd/custody-kit decode <tx hex or base64>
go run ./cmd/custody-kit verify <tx> --chain-id qorechain-diana --account-number <n> \
  --pubkey <33-byte hex> --pq-pubkey <2592-byte hex>
```

Bir eth-native hesap için `--eth` ekleyin. Hesap numarasını `GET /cosmos/auth/v1beta1/account_info/{address}` adresinden, kayıtlı ML-DSA-87 anahtarını ise `GET /qorechain/pqc/v1/account/{address}` adresinden okuyun.

Aynısı TypeScript'te, kitin örnek komut satırından (`code/ts/src/cli.ts`):

```ts
import { decodeTx, fromHex, verifyTx } from "./index.js";

console.log(JSON.stringify(decodeTx(txBytes), null, 2)); // messages, memo, fee, signers, pqcLayers, txHash

const r = verifyTx({
  txBytes,
  chainId: "qorechain-diana",
  accountNumber: BigInt(accountNumber),
  classicalPublicKey: fromHex(secp256k1PubKeyHex),
  classicalKeyType: "secp256k1", // or "eth_secp256k1" for eth-native accounts
  pqPublicKey: fromHex(registeredMlDsa87KeyHex),
});
// r.valid, r.classical, r.signerKey ("match" | "absent" | "mismatch"), r.pq
```

**3. Para yatırmaları tarayın (testnet üzerinde okumalar).**

```bash
go run ./cmd/custody-kit deposits qor1... --from-height 8976000 --to-height 8976400
```

27 Ekim 2026'da genel test adresi için testnet yükseklikleri 8976000 ile 8983000 arasında çalıştırıldığında boş bir liste döndürdü; bu, hiçbir şey almamış bir adres için beklenen sonuçtur.

TypeScript (`code/ts/src/cli.ts` içinden):

```ts
import { DEFAULT_TESTNET_REST, buildDepositQuery, extractDeposits, getJson } from "./index.js";

const restUrl = process.env.QORE_REST ?? DEFAULT_TESTNET_REST;
const path = buildDepositQuery({ address, minHeight: BigInt(from), maxHeight: BigInt(to) });
const body = await getJson(restUrl, path);
const responses = (body.tx_responses ?? []) as Record<string, unknown>[];
const entries = responses.flatMap((r) => extractDeposits(r, address));
// each entry: txhash, height, msgIndex, messageType, sender, amount, denom, memo, creditable, reason
```

Go (`code/go/cmd/custody-kit/main.go` içinden):

```go
opts := custodykit.DepositQueryOptions{Address: addr, MinHeight: &from, MaxHeight: &to}
path, err := custodykit.BuildDepositQuery(opts)
// GET restURL + path, then for each tx_response:
r, err := custodykit.ParseTxResponse(raw)
entries, err := custodykit.ExtractDeposits(r, addr, "") // "" = uqor
```

**4. Diğer diller.**

```bash
# Python (from code/python/src)
python -m qorechain_custody_kit validate qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h
python -m qorechain_custody_kit deposits <address> --from-height H --to-height H

# Rust
cargo run --example custody-kit -- validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94

# Java
mvn -q compile exec:java -Dexec.args="validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
```

**5. Vektörleri ve canlı kontrolleri çalıştırın.**

```bash
scripts/fetch-qoresign-vectors.sh            # optional: also check the QoreSign hybrid vectors
cd code/go && go test ./...                  # vectors
QORE_LIVE_TEST=1 go test -run Live ./...     # live reads against testnet
```

Her dilin eşdeğeri vardır (`pnpm test`, `pytest`, `cargo test`, `mvn test`). Canlı kontroller fon gerektirmez. Bu sayfa yazılırken yalnızca Go `validate` ve `deposits` komutları ile Go test paketi çalıştırıldı; diğer diller depodan tarif edilmiştir.

### Ana işlevler ve komutlar {#api}

| TypeScript | Go | Python ve Rust | Java | Ne yapar |
|---|---|---|---|---|
| `validateAddress(input, { allow, requireEip55 })` | `ValidateAddress(input, ValidateAddressOptions{Allow, RequireEIP55})` | `validate_address` | `Addresses.validateAddress` | `{ valid, kind, format, checksum, bech32, hex }` veya `{ valid: false, error }` döndürür. |
| `decodeTx(txBytes)`, `decodeMessage(typeUrl, value)` | `DecodeTx`, `DecodeMessage` | `decode_tx`, `decode_message` | `TxDecoder.decodeTx`, `decodeMessage` | Mesajlar, memo, ücret, imzalayanlar, ML-DSA-87 katmanları ve işlem hash'i. |
| `verifyTx({ txBytes, chainId, accountNumber, classicalPublicKey, classicalKeyType, pqPublicKey, signBytesVersion })` | `VerifyTx(VerifyTxArgs{...})` | `verify_tx` | `TxVerifier.verifyTx` | `{ valid, classical, signerKey, pq }` döndürür. İmzalanacak bayt sürümü v1, v2 veya ikisinden biri. |
| `buildDepositQuery({ address, minHeight, maxHeight, event, page, limit, orderBy })` | `BuildDepositQuery` | `build_deposit_query` | `Deposits.buildDepositQuery` | Gelen transferler için REST yolu. `event` `transfer` (varsayılan) veya `coin_received`'dir; `limit` 1 ile 100, varsayılan 50; varsayılan olarak artan sıralama. |
| `extractDeposits(txResponse, address, { denom })` | `ExtractDeposits(resp, address, denom)` | `extract_deposits` | `Deposits.extractDeposits` | `creditable` ve `reason` içeren para yatırma girdileri. |
| `depositEventQuery`, `percentEncode`, `getJson`, `toHex`, `fromHex` | `DepositEventQuery`, `PercentEncode`, `GetJSON`, `ToHex`, `FromHex`, `ParseTxResponse` | `deposit_event_query`, `get_json`, `from_hex` | `CustodyKit`, `Rest` | Yardımcılar. |

Ayrıca dışa aktarılanlar: `FEE_COLLECTOR`, `MSG_SEND`, `MSG_MULTI_SEND`, `MSG_ETHEREUM_TX`, `KNOWN_MESSAGES`, `PQC_HYBRID_TYPE_URL` ve `DEFAULT_TESTNET_REST` sabitleri.

Her dildeki örnek komut satırı:

- `validate <address> [--allow-validator] [--require-eip55]`
- `decode <tx hex or base64>`
- `verify <tx> --chain-id ID --account-number N --pubkey HEX [--eth] [--pq-pubkey HEX]`
- `deposits <address> [--from-height H] [--to-height H] [--rest URL]`

Her dilde aynı olan hata kodları:

- Kit: `MALFORMED_TX` (baytlar iyi biçimlendirilmiş bir işlem değildir), `UNKNOWN_FIELD` (kod çözücünün tanımadığı bir alan, ki ağ da bunu reddederdi), `INVALID_ARGUMENT`.
- `validateAddress`: [Yenilikler](#innovations) altında listelenen on bir kod.

Bir saklama kuruluşunun en sık karşılaştığı zincir retleri, codespace ve kod olarak (tam tablo kitin `docs/errors.md` dosyasındadır):

| Codespace | Kodlar |
|---|---|
| `sdk` | 3 sıra numarası uyuşmazlığı, 4 yetkisiz, 5 yetersiz fon, 11 gaz yetersiz, 12 memo çok büyük, 13 yetersiz ücret, 19 mempool'da zaten var |
| `pqc` | 20 hibrit imza gerekli, 21 hibrit doğrulama başarısız, 7 anahtar zaten kayıtlı, 26 EVM penceresi yok (veya kayıtlı anahtar yok), 27 pencere tükendi veya kapsam dışı, 28 geçersiz pencere parametreleri |
| `stakingtier` | 13 stake kilitli |

Codespace ve kod üzerinden birlikte dallanın ve ham günlüğü saklayın.

## Nasıl erişilir {#how-to-access}

| | Mainnet | Testnet |
|---|---|---|
| Zincir kimliği | `qorechain-vladi` | `qorechain-diana` |
| EVM zincir kimliği | 9801 | 9800 |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Düğüm sürümü | v3.2.4 (v3.2.5 henüz uygulanmadı) | v3.2.6 (v3.2.5 uygulandı) |

- Birim `uqor`'dur (1 QOR = 10^6 uqor; EVM rayında 1 uqor = 10^12 wei). Asgari gaz fiyatı 0,1 uqor, unbonding süresi 21 gün ve memo sınırı 256 karakterdir. Bu değerler 27 Ekim 2026'da her iki ağdan okundu ve yönetişimle değişebilir; bu yüzden üretimde bunları zincirden okuyun.
- Para yatırmalar anahtar veya kayıt gerektirmez. Göndermek, sıcak adres başına kayıtlı bir ML-DSA-87 anahtarı gerektirir.
- Üretim için kendi tam düğümlerinizi çalıştırın. Genel uç noktalar hız sınırlıdır ve geliştirme içindir. Bir betik `403 Forbidden` alırsa açık bir `User-Agent` başlığı ayarlayın. Bkz. [düğüm çalıştırma](/developer-guide/running-a-node) ve [mainnet'e bağlanma](/getting-started/connecting-to-mainnet).
- Testnet her düğüm sürümünü mainnet'ten önce alır. Gaz kurallarını tarihe göre değil, uygulanmış yükseltmeyi kontrol ederek değiştirin.
- Testnet üzerindeki test token'ları (`erc20:0x...` biçimindeki bank denom'ları, bir IBC token'ı) mainnet'te yoktur. Her iki ağda da `uqor` kaydedin.
- Testnet QOR'u QoreChain dashboard faucet'inden gelir ve değeri yoktur. Bkz. [testnet'e bağlanma](/getting-started/connecting-to-testnet).

## Güvenlik notları {#security}

- Bir sıcak adresin iki anahtarı da (secp256k1 ve ML-DSA-87) her native ray işlemini imzalar. Bunları aynı saklama çevresinde, aynı kuorum ve denetim izi altında tutun.
- 32 baytlık ML-DSA-87 tohumunu (yazılım anahtarları) yedekleyin veya HSM'nin anahtar yedeğini kullanın. Kayıtlı anahtarı olan bir hesabın klasik yolu yoktur; bu yüzden ML-DSA-87 anahtarını kaybetmek hesabın artık imzalayamaması demektir. Geri yüklemeyi testnet üzerinde `verifyTx` ile test edin.
- HSM'ler, boş bağlamla imzalanacak baytlar üzerinde saf ML-DSA-87 imzalamayı (PKCS #11 v3.2'de `CKM_ML_DSA`) desteklemelidir. `HashML-DSA` kabul edilmez.
- İmzalanmış her işlem üzerinde, onu oluşturmayan bir süreçte, yayından önce `decodeTx` ve `verifyTx` çalıştırın.
- Rotasyon `MsgRotatePQCKey` kullanır: iki anahtar da imzalar, işlemin kendi katmanı mevcut anahtarı kullanır ve önceki bir anahtarın yeniden kullanımı reddedilir. secp256k1 anahtarı açığa çıkarsa, fonları iki anahtarı da yeni olan bir adrese taşıyın ve açık olan her EVM penceresini kapatın.
- EVM pencereleri: `native_only` veya `allowed_targets` kullanın, toplu işi kapsayan en küçük `max_value` ve `blocks` değerlerini seçin ve toplu işten sonra pencereyi kapatın. `MsgSetWithdrawAddress`, `MsgRotatePQCKey`, `MsgOpenEVMWindow` ve `MsgAuthorizeEVMDelegation` işlemlerini ayrıcalıklı işlemler olarak ele alın.
- `ethereum_tx` olayı bir başarısızlık bildiren bir EVM işlemini, native sonucu `code == 0` olsa bile asla hesaba kaydetmeyin.
- Bu, 0.1.0 sürümünde referans koddur. Üretimde kullanmadan önce inceleyin. Güvenlik açıklarını, yanlış bir hesaba kaydetmeye veya istenmeyen bir imzaya yol açabilecek belge hataları dahil, security@qore.network adresine özel olarak bildirin.

## Nerede yayınlanıyor {#where-published}

27 Ekim 2026'da kayıt defterlerine karşı kontrol edildi.

| Kayıt defteri | Paket | Sürüm | Bağlantı |
|---|---|---|---|
| GitHub | `qorechain/qorechain-custody-kit` (beş dilin tamamı, kılavuz sayfaları, vektörler) | sürüm `v0.1.0`, 27 Ekim 2026'da yayınlandı | https://github.com/qorechain/qorechain-custody-kit |
| Go modül proxy'si | `github.com/qorechain/qorechain-custody-kit/code/go` (örnek kod, getirilebilir) | v0.1.0 (etiket `code/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go |
| npm, PyPI, crates.io, Maven Central | yayınlanmadı: kit, kopyalanacak veya projeye eklenecek örnek koddur | uygulanamaz | uygulanamaz |

GitHub sürümünde ekli dosya yoktur; sürüm, deponun etiketidir. Kitin üzerine kurulduğu bağımlılıkların hepsi yayınlanmıştır: npm üzerinde `@qorechain/qoresign` (en son 0.1.1, kit 0.1.0'a sabitler), PyPI üzerinde `qorechain-qoresign` (0.1.1), crates.io üzerinde `qorechain-qoresign` (en son 0.1.1, kit 0.1.0'a sabitler), `github.com/qorechain/qoresign/go` (v0.1.0 ve v0.1.1) ve Maven Central üzerinde `io.github.qorechain:qoresign` (0.1.0 ve 0.1.1).

Lisans Apache-2.0. Bakımcı: QoreChain Association.

## Sınırlar ve bilinen sorunlar {#limits}

- Kit anahtar tutmaz, işlem imzalamaz, yayınlamaz ve eşik veya MPC imzalaması sağlamaz. İmzalamayı QoreSign veya HSM'iniz yapar. Bugün ML-DSA için standartlaştırılmış bir eşik şeması yoktur; kılavuz, bir eşik secp256k1 anahtarının ayrı olarak tutulan bir ML-DSA-87 anahtarıyla nasıl birleştirileceğini belgeler.
- Hiçbir saklama kuruluşunun iç süreçleri hakkında bir beyanda bulunmaz. Kontrol listesi yalnızca ağ gereksinimlerini tanımlar.
- `validateAddress` 20 baytlık adresleri kabul eder. Daha uzun modül ve sözleşme hesap adresleri, para yatırma ve ödeme adresleri için olması gerektiği gibi reddedilir.
- `extractDeposits`, `MsgSend`, `MsgMultiSend` ve başarılı `MsgEthereumTx` işlemlerini otomatik olarak hesaba kaydeder. Diğer mesajlar (ödül çekimleri, sözleşme çağrıları, IBC transferleri) hesaba kaydedilmez, inceleme için döndürülür.
- `verifyTx` tek imzalayıcılı işlemleri doğrular.
- SVM rayı işlemlere açık değildir. Onun üzerine para yatırma veya çekim akışları kurmayın.
- Kitin kendi kodu 0.1.0 sürümünde örnek koddur. İşlev adları ve imzaları sürümler arasında değişebilir ve Go modülü etiketi kararlı bir API sözü vermez.
- Bu sayfa yazılırken yalnızca Go örnekleri ve test paketi çalıştırıldı. Diğer dört dildeki canlı kontroller ve vektör kontrolleri yeniden çalıştırılmadı.
- Deponun Python README dosyası, `qorechain-qoresign` 0.1.1 PyPI'de olana kadar `verify_tx` işlevinin bir içe aktarma hatası verdiğini hâlâ söylüyor olabilir. Bu sürüm yayınlanmıştır, dolayısıyla bu not güncel değildir.
- Kitin kılavuzu 27 Ekim 2026'da okunan parametreleri (gaz rakamları, staking kademe değerleri) aktarır. Üretimde bunları zincirden okuyun.

## İlgili sayfalar {#related}

- [QoreSign](/qoresign/overview): hibrit imzalama, doğrulama, anahtar kayıt mesajı ve `suggestGasLimit` ile `simulateTx` gaz yardımcıları.
- [QoreChain SDK](/sdk/overview): `decodeTxError` ile hata çözme, EVM pencere oluşturucuları ve ret sınıflandırıcısı.
- [Kuantum sonrası imzalama](/developer-guide/post-quantum-signing): hibrit imzalar, v2 imzalanacak baytlar ve anahtar kaydı.
- [Borsa ve entegratör kılavuzu](/developer-guide/exchange-integration): native, EVM ve SVM yolları arasında seçim yapmak.
- [EVM precompile'ları](/developer-guide/evm-precompiles) ve EVM rayı.
- [Staking ve delegasyon](/user-guide/staking-and-delegation).
- [Düğüm çalıştırma](/developer-guide/running-a-node) ve [mainnet'e bağlanma](/getting-started/connecting-to-mainnet).
- [QoreChain MCP sunucusu](/developer-tools/mcp): hızlı kontroller için `get_pq_status` ve `simulate_tx`.
- [QoreScan](/developer-tools/qorescan): düğümünüzün, uç noktalarınızın ve hesaplarınızın kriptografisini envantere alın.
