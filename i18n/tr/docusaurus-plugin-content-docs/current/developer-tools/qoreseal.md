---
slug: /developer-tools/qoreseal
title: QoreSeal
sidebar_label: QoreSeal
sidebar_position: 30
---

# QoreSeal (`qoreseal`)

QoreSeal, verileri QoreChain hesaplarına ML-KEM-1024 (FIPS 203) ile şifreleyen açık kaynaklı bir kütüphanedir. Bir hesap ML-KEM-1024 genel anahtarını zincirde yayımlar; ardından herkes, o hesabın ve gönderenin eklediği diğer alıcıların okuyabileceği bir yük (payload) şifreleyebilir. Gizli yükler (notlar, faturalar, belgeler, teklifler) gerektiren dApp geliştiricileri, görüntüleme erişimine ihtiyaç duyan denetçiler ve özel grupların ve yan zincirlerin operatörleri için tasarlanmıştır. Standart ilkelleri bir araya getirir ve kendisi hiçbirini uygulamaz. Sürüm **0.1.0**, Apache-2.0, bakımını QoreChain Association yapar.

27 Ekim 2026 itibarıyla durumu: şifrelemenin kendisi ağ ve hesap olmadan, her yerde çevrimdışı çalışır. Zincirden okunan bir adrese şifrelemek için KEM anahtar kayıt defteri gerekir; bu kayıt defteri **test ağında canlıdır** (`qorechain-diana`) ve **v3.2.5 yükseltmesinden sonra ana ağa (`qorechain-vladi`) gelir**, tarih verilmemiştir. Paket Rust, Go, Python, Swift, Kotlin/JVM ve Android için yayımlanmıştır. TypeScript paketi `@qorechain/qoreseal` **yakında** gelecektir ve henüz npm'de değildir. Yapı, 1.0 öncesinde harici bir incelemeyi bekleyen bir taslaktır.

QoreSeal yalnızca bir yükün içeriğini korur, başka bir şeyi değil. Adresler, işlem zamanlaması, transfer tutarları, zarf (envelope) boyutları ve alıcı sayısı zincirde herkese açık kalır. İşlemleri gizli yapmanın bir yolu değildir.

## Yenilikler {#innovations}

- **Tek zarf, 1 ila 1.024 alıcı.** Yük, rastgele bir AES-256-GCM veri anahtarıyla bir kez şifrelenir; veri anahtarı her alıcı için ayrı ayrı sarılır (wrap), böylece bir okuyucu eklemek yükün başka bir kopyasına değil, yaklaşık 1,6 KB'a mal olur.
- **Varsayılan olarak hibrit, sessizce asla düşürülmez.** `hybrid` modunda her alıcı girdisi, bir ML-KEM-1024 kapsüllemesini (encapsulation) bir X25519 anlaşmasıyla SHA3-256 birleştiricisi (combiner) üzerinden birleştirir; böylece ikisinden biri geçerli kaldığı sürece veri korunur. `mlkem` modu (yalnızca ML-KEM-1024) açıkça seçilmelidir; kütüphane kendiliğinden buna asla geri dönmez.
- **Bağlam bağlama.** Her zarf, anahtar türetme yoluyla (HKDF-SHA-256, info `"qorechain-kem-v1|" + chainId + "|" + purpose`) bir zincir kimliğine ve bir amaca, ayrıca isteğe bağlı ilişkili verilere bağlıdır. Bir amaç için mühürlenmiş bir zarf başka bir amaç altında açılmaz.
- **Zincirde yayımlanan ve zincir tarafından denetlenen anahtarlar.** Bir hesap ML-KEM-1024 anahtarını işlemin hibrit imzasıyla doğrulanan `MsgRegisterKEMKey` ile kaydeder. `validateMlkemPublicKey`, zincirin kayıt sırasında uyguladığı aynı denetimleri uygular.
- **Alıcı kartları.** Kayıt defteri yalnızca ML-KEM anahtarını tutar. Hibrit mod için X25519 anahtarı, hesabın [QoreSign](/qoresign/overview) mesaj imzalama ile imzaladığı ve zincirdeki ML-KEM anahtarına bağladığı bir kartta taşınır. Göndericiler kartı zincirdeki her iki anahtara karşı doğrular; böylece kart herhangi bir kanaldan gelebilir. Sahte veya eski bir kart bir zarfı en fazla ML-KEM-1024 gücüne indirebilir, çünkü ML-KEM kısmı her zaman zincirdeki anahtarı kullanır.
- **Özel gruplar için dönem (epoch) anahtarları.** `EpochKeyManager`, her üyelik değişikliğinde yeni bir dönem anahtarı oluşturur ve onu mevcut üyelere mühürler. Çıkarılan bir üye ait olduğu dönemlerin anahtarlarını saklar ve sonraki dönemleri okuyamaz.
- **Taahhütlü şifreli toplu işlemler (batch).** Batch kodeği, bir şifreli metin taahhüdü (commitment) ve tuzlanmış bir düz metin taahhüdü olan şifreli bir blob üretir; [RDK](/rollups/overview) ile QoreChain'de demirlemeye (anchor) hazırdır.
- **Her dilde aynı baytlar.** TypeScript ve Go yerel uygulamalardır; Rust, Swift, Kotlin ve Python'ın altındaki çekirdektir. Paylaşılan test vektörleri her dilde bayt bayt denetlenir ve hatalar sabit kodlar taşır (örneğin `NOT_A_RECIPIENT`, `DECRYPTION_FAILED`, `CARD_INVALID`, `RECIPIENT_NEEDS_X25519`, `UNKNOWN_EPOCH`, `MALFORMED_ENVELOPE`).

## Kullanım alanları {#use-cases}

1. **Bir dApp kullanıcılar arasında notları veya mesajları şifreler.** Bir sohbet veya ödeme dApp'i her notu `sealToAddresses` ile alıcının adresine mühürler ve `qoreseal:` metnini bir notta (memo), bir sözleşmede veya kendi veritabanında saklar. Yalnızca alıcının anahtarı onu açar.
2. **Denetçi (görüntüleme) anahtarlı faturalar ve belgeler.** Bir işletme bir faturayı, fatura numarası ilişkili veri olarak, tek zarfta alıcıya, satıcıya ve bir denetçi anahtarına mühürler. Denetçi anahtarı, yapılandırmada tutulan sıradan bir QoreSeal anahtar çiftidir; çeyrek başına bir anahtar (yeni bir indeksle `deriveSealKeys`), işletmenin denetçiye yalnızca incelenen dönemleri vermesini sağlar.
3. **Mühürlü teklifler ve commit-reveal.** Bir müzayede, teklifleri `purpose: "bid:<auction id>"` ve teklif veren adresi ilişkili veri olarak kullanarak müzayede anahtarına mühürler, zarfları saklar ve son tarihten sonra açar.
4. **Konsorsiyum veya özel yan zincirler.** Özel bir rollup'ın operatörü, bir dönem anahtarını üyelerle paylaşmak için `EpochKeyManager` kullanır, her batch'i `PrivateBatchCodec` ile şifreler ve şifreli blob'u ve taahhütlerini RDK ile QoreChain'de demirler.
5. **"Şifreli veri al" sunan cüzdanlar.** Bir cüzdan, QoreSeal anahtarlarını hesap anımsatıcı ifadesinden (indeks 0) türetir, ML-KEM anahtarını hibrit imzalı bir `MsgRegisterKEMKey` ile yayımlar ve imzalanacak alıcı kartını düz metin olarak gösterir.
6. **Kurtarma veya emanet (escrow) alıcıları.** Bir saklama veya uyum ekibi her zarfa çevrimdışı bir kurtarma anahtarı ekler; böylece veri bir kullanıcının anahtarının kaybından sağ çıkar.
7. **Python veya Go arka uçları.** Bir hizmet raporları veya dışa aktarımları bir hesap listesine mühürler; her diğer dille bayt uyumludur.

## Nasıl çalışır {#how-it-works}

İlkeller (QoreSeal bunların hiçbirini uygulamaz): ML-KEM-1024 (FIPS 203; kapsülleme anahtarı 1.568 bayt, kapsül açma anahtarı 3.168 bayt, şifreli metin 1.568 bayt), X25519 (RFC 7748), bir SHA3-256 birleştirici, HKDF-SHA-256 ve AES-256-GCM (96 bit nonce, 128 bit etiket).

**Mühürleme**, kısaca:

1. Rastgele 16 baytlık bir tuz ve rastgele 32 baytlık bir veri anahtarı çekilir.
2. Her alıcı için, alıcının anahtarına bir ML-KEM-1024 kapsüllemesi yapılır; hibrit modda ayrıca alıcının X25519 anahtarıyla geçici bir X25519 anlaşması yapılır ve iki sır SHA3-256 ile birleştirilir. HKDF-SHA-256 ile (tuz, info `"qorechain-kem-v1|" + chainId + "|" + purpose`) bir anahtar şifreleme anahtarı türetilir ve veri anahtarını AES-256-GCM ile sarar.
3. Yük, veri anahtarıyla bir kez şifrelenir; tüm başlık ve isteğe bağlı ilişkili veri doğrulanır.

**Zarf düzeni:** sihirli değer `QSEL`, sürüm 1, mod, algoritma baytları, bayraklar, tuz, alıcı sayısı, her alıcı için bir girdi (ipucu, ML-KEM şifreli metni, hibrit modda X25519 geçici anahtarı, sarılmış veri anahtarı), nonce, şifreli metin. Boyut: hibrit modda `56 + 1,664 x recipients + plaintext` bayt ve `mlkem` modunda `56 + 1,632 x recipients + plaintext`. Spesifikasyondan: 1 alıcı ve 1 KB düz metin 2.744 bayttır (hibrit); 10 alıcı ve 1 KB 17.720 bayttır.

Zincir kimliği ve amaç zarfa yazılmaz: alıcı aynı değerleri vermelidir. Yanlış bir zincir kimliği, amaç veya ilişkili veri ya da baytlarda herhangi bir değişiklik `DECRYPTION_FAILED` sonucunu verir.

**İpuçları.** Tuzlanmış ipuçları, bir alıcının kendi girdisini hızla bulmasını sağlar. `anonymous: true` ile ipuçları sıfırlanır ve alıcılar her girdiyi dener.

**Metin biçimi.** `envelopeToText` ve `envelopeFromText`, `"qoreseal:" + base64url` biçimine ve biçiminden dönüştürür.

**Zincirde olanlar**

- `qorechain.pqc.v1` modülündeki KEM anahtar kayıt defteri: `sender`, `algorithm_id = 2` (ML-KEM-1024) ve `public_key` alanlı `MsgRegisterKEMKey` ile `sender` alanlı `MsgRemoveKEMKey`. Tip URL'leri: `/qorechain.pqc.v1.MsgRegisterKEMKey` ve `/qorechain.pqc.v1.MsgRemoveKEMKey`.
- Sorgu: `GET /qorechain/pqc/v1/kem/{address}` (`qor1` veya `0x` biçimini kabul eder); `found` değerini ve bulunduğunda `address`, `algorithm_id`, `algorithm_name`, `public_key` ve `registered_height` içeren `key` değerini döndürür.
- Kayıt, işlemin hibrit imzasıyla doğrulanır. Gönderenin zaten kayıtlı bir ML-DSA-87 anahtarı olmalıdır ve işlem QoreSign `signHybrid` ile imzalanır. Hesap başına bir anahtar; yeniden kayıt onu değiştirir.
- Reddetmeler (codespace `pqc`): 250 kayıt defteri bu zincirde henüz etkin değil, 251 geçersiz KEM genel anahtarı, 252 bu hesap için yayımlanmış KEM anahtarı yok, 253 bu anahtar bu hesap için zaten yayımlanmış, 254 bir KEM anahtarı yayımlamak kayıtlı bir post-kuantum imza anahtarı gerektirir. `describeKemRegistryError` bunları açıklar.
- Zarfların kendisi uygulamanın koyduğu her yere gider (notlar, sözleşmeler, dosyalar, API'ler). Zincir hiçbir zaman bir gizli anahtar görmez.

**Alıcı kartı.** Yaklaşık 6,7 KB'lık JSON; çoğunluğu ML-DSA-87 imzasıdır. Hesap sabit bir metni (`QoreSeal recipient card v1`, zincir kimliği, adres, ML-KEM anahtarının SHA3-256 değeri, X25519 anahtarı, düzenlenme zamanı) QoreSign mesaj imzalama ile imzalar. Yeni bir ML-KEM anahtarı kaydetmek, eski anahtar için yapılmış tüm kartları emekliye ayırır.

**Özel gruplar.** Bir dönem anahtarı yükü (`QSEK`, dönem numarası, 32 baytlık anahtar), sıradan bir zarfta mevcut üyelere mühürlenir. Bir batch blob'u (`QSBT`, dönem, batch indeksi, rollup kimliği gibi bağlam, nonce, AES-256-GCM şifreli metni) `83 + context length + data length` bayttır. Taahhütler: `ciphertextCommitment = SHA3-256(blob)` ve `plaintextCommitment = SHA3-256("qorechain-qoreseal-batch-v1" || commitSalt || data)`; dışarıdakilerin düşük entropili içerikleri tahmin edememesi için tuzlanmıştır.

Spesifikasyon, depodaki `spec/qoreseal-v1.md` dosyasıdır (durum: taslak, inceleme sürüyor); paylaşılan vektörler `vectors/qoreseal-v1.json` dosyasındadır.

## Nasıl kullanılır {#how-to-use}

### Kurulum {#install}

| Dil | Kurulum | Asgari platform |
|---|---|---|
| Rust | `cargo add qorechain-qoreseal` (kütüphane adı `qoreseal`) | kararlı Rust |
| Go | `go get github.com/qorechain/qoreseal/go@v0.1.0` | Go 1.25 |
| Python | `pip install qorechain-qoreseal` (içe aktarma `qoreseal`) | Python 3.9 veya üstü; macOS 11+ (arm64, x86_64) ve Linux manylinux2014 (x86_64, aarch64) için wheel'ler; henüz Windows wheel'i yok |
| Swift | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`, ürün `QoreSeal` | iOS 16, macOS 13 |
| Kotlin / JVM | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Java 17; Kotlin 2.3 veya üstü derleyici (Kotlin 2.1 ile derleme başarısız olur) |
| Android | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | API 24; R8 koruma kuralları dahil; Kotlin 2.3 veya üstü derleyici |
| TypeScript | **yakında**: `@qorechain/qoreseal` henüz npm'de değil, bu yüzden kurulum komutu yok | |

TypeScript kaynağı, örnekleri ve ağ yardımcıları depodadır ve `pnpm install && pnpm build` sonrasında oradan çalışır. npm paketi yayımlanana kadar TypeScript için depoyu kullanma yolu olarak kabul edin ve yukarıdaki paket adını bekleyin.

### Hızlı başlangıç 1: çevrimdışı mühürleme ve açma (Python) {#quickstart-python}

27 Ekim 2026'da yayımlanmış 0.1.0 wheel'ine karşı çalıştırıldı. Ağ yok, hesap yok. İki alıcı, ilişkili veri ve başka bir amacın zarfı açmadığının denetimi.

```python
import qoreseal as qs

alice = qs.generate_seal_keys()
bob = qs.generate_seal_keys()

envelope = qs.seal_envelope(
    "qorechain-diana", "invoice",
    [qs.recipient_of(alice), qs.recipient_of(bob)],
    b"amount due: 120 QOR",
    aad=b"invoice-42",
)
text = qs.envelope_to_text(envelope)  # "qoreseal:..."

plaintext = qs.open_envelope("qorechain-diana", "invoice", envelope, bob, aad=b"invoice-42")
assert plaintext == b"amount due: 120 QOR"
print(len(envelope), text[:20], plaintext)

# A different purpose never opens the envelope.
try:
    qs.open_envelope("qorechain-diana", "chat", envelope, bob, aad=b"invoice-42")
except qs.QoreSealError.Failure as e:
    print("other purpose:", e.code)
```

Çıktı olarak `3403 qoreseal:UVNFTAEBAgE b'amount due: 120 QOR'` ve ardından `other purpose: DECRYPTION_FAILED` yazdırdı. Uzunluk 56 + 2 x 1.664 + 19 = 3.403 bayttır.

### Hızlı başlangıç 2: çevrimdışı mühürleme ve açma (Go) {#quickstart-go}

Go modül proxy'sinden v0.1.0'a karşı çalıştırıldı.

```go
package main

import (
	"fmt"

	qoreseal "github.com/qorechain/qoreseal/go"
)

func main() {
	alice, _ := qoreseal.GenerateSealKeys()
	auditor, _ := qoreseal.GenerateSealKeys()

	envelope, err := qoreseal.Seal(qoreseal.SealArgs{
		ChainID:    "qorechain-diana",
		Purpose:    "invoice",
		Recipients: []qoreseal.SealRecipient{qoreseal.RecipientOf(alice), qoreseal.RecipientOf(auditor)},
		Plaintext:  []byte("120 QOR due on 2026-11-30"),
		AAD:        []byte("invoice-42"),
	})
	if err != nil {
		panic(err)
	}
	plaintext, err := qoreseal.Open(qoreseal.OpenArgs{
		ChainID: "qorechain-diana", Purpose: "invoice", Envelope: envelope, Keys: auditor, AAD: []byte("invoice-42"),
	})
	fmt.Println(len(envelope), string(plaintext), err)
}
```

Çıktı olarak `3409 120 QOR due on 2026-11-30 <nil>` yazdırdı.

Rust, Swift ve Kotlin aynı çağrıları kullanır (`seal`, `open`, `generate_seal_keys` vb., dilin harf biçimiyle). Örnekleri bu sayfa için çalıştırılmadı.

### Hızlı başlangıç 3: dönemli özel bir grup (Python, çevrimdışı) {#quickstart-group}

Depo örneği `examples/private-rollup` örneğini izler. Alice ve bob dönem 1'de başlar, carol katılır (dönem 2), bob çıkarılır (dönem 3). Bob dönem 1'i okuyabilir ama dönem 3'ü okuyamaz.

```python
import qoreseal as qs

chain_id, rollup_id = "qorechain-diana", "demo-private-rollup"
purpose = f"epoch-key:{rollup_id}"
alice, bob, carol = qs.generate_seal_keys(), qs.generate_seal_keys(), qs.generate_seal_keys()

mgr = qs.EpochKeyManager(chain_id, purpose, [
    qs.GroupMember(id="alice", recipient=qs.recipient_of(alice)),
    qs.GroupMember(id="bob", recipient=qs.recipient_of(bob)),
])
bob_keys = [qs.open_epoch_key(chain_id, purpose, mgr.distribution(), bob)]  # epoch 1

b1 = mgr.seal_batch(rollup_id, 1, b'{"txs":["alice pays bob 5"]}')
mgr.add_member("carol", qs.recipient_of(carol))   # epoch 2
mgr.remove_member("bob")                          # epoch 3
b3 = mgr.seal_batch(rollup_id, 3, b'{"txs":["alice pays carol 1"]}')

print(qs.open_batch(b1.blob, bob_keys).data)      # bob read epoch 1
try:
    qs.open_batch(b3.blob, bob_keys)              # bob was removed before epoch 3
except qs.QoreSealError.Failure as e:
    print("bob, epoch 3:", e.code)
print(b3.ciphertext_commitment.hex(), b3.plaintext_commitment.hex())
```

Çıktı olarak bob'un dönem 1 batch'ini, ardından `bob, epoch 3: UNKNOWN_EPOCH` satırını, sonra iki taahhüdü yazdırdı (her çalıştırmada rastgele).

Mühürlü bir batch'i [RDK](/rollups/overview) ile demirlemek için şifreli blob yerel veri erişilebilirliği (data-availability) blob'udur ve SHA-256 değeri batch `data_hash` alanıdır (TypeScript, depo kılavuzundan; bu sayfa için çalıştırılmadı):

```ts
import { buildDaBlob, submitBatchMsg } from "@qorechain/rdk";

const codec = new PrivateBatchCodec("my-rollup", mgr);
const sealed = codec.seal(batchIndex, batchBytes);
const blob = buildDaBlob({ data: sealed.blob, maxBlobSize: params.maxDaBlobSize });
const msg = submitBatchMsg({ sequencer, rollupId: "my-rollup", batchIndex, stateRoot, txCount, dataHash: blob.dataHash });
```

Rollup batch'lerinin nasıl gönderildiği için [Veri erişilebilirliği](/rollups/data-availability) sayfasına bakın.

### Test ağında bir adrese şifreleme {#encrypt-to-address}

Kontrol ettiğiniz, biraz test ağı QOR'u olan ve kayıtlı bir ML-DSA-87 anahtarı bulunan bir `qorechain-diana` hesabına ihtiyacınız var (QoreSign örneği `register-and-send` bir tane kaydeder). Bir test ağı anımsatıcı ifadesi kullanın; asla bir ana ağ ifadesi ve asla fon içeren herkese açık test ifadesi kullanmayın. Bu akış depo kılavuzundan aktarılmıştır ve bu sayfa için çalıştırılmadı.

1. Anahtarları hesap anımsatıcı ifadesinden türetin: `deriveSealKeys({ mnemonic })` (indeks 0). Anımsatıcı ifade aynı zamanda yedekleridir.
2. ML-KEM-1024 anahtarını yayımlayın: `buildRegisterKemKeyMessage({ sender: address, mlkemPublicKey: sealKeys.mlkemPublicKey })`, bunu bir işlem gövdesine koyun, QoreSign `signHybrid` ile imzalayın, `simulateTx` ile simüle edin ve `submitWithSignBytesFallback` ile gönderin. Bir reddetmede `describeKemRegistryError(res.codespace, res.code)` bunu açıklar.
3. Kontrol edin: `GET https://api-testnet.qore.host/qorechain/pqc/v1/kem/<address>`. Anahtar yayımlamamış bir hesap için `{"found":false,"key":null}` yanıtını verir.
4. Bir alıcı kartı imzalayın: `signRecipientCard({ chainId: "qorechain-diana", address, keys: sealKeys, classicalKey, pqKey })` ve göndericilerin alabileceği bir yerde yayımlayın.
5. Gönderici tarafı: `sealToAddresses({ rest: "https://api-testnet.qore.host", chainId: "qorechain-diana", purpose: "note", recipients: [{ address, card }], plaintext })`. Kart yoksa `mode: "mlkem"` verin.
6. Alıcı tarafı: `open({ chainId: "qorechain-diana", purpose: "note", envelope, keys: sealKeys })`.

Eksiksiz çalıştırılabilir akış, depo örneği `examples/register-and-encrypt` örneğidir. Bu ağ v3.2.5'i uygulayana kadar ana ağı reddeder. Go aynı gönderici tarafını `network.NewClient(rest).SealToAddresses(ctx, network.SealToArgs{...})` ile sunar. Rust, Swift, Kotlin ve Python çevrimdışıdır: `/qorechain/pqc/v1/kem/{address}` ve `/qorechain/pqc/v1/account/{address}` adreslerini kendiniz okuyun, kartı doğrulayın (`verify_recipient_card`), sonra mühürleyin.

### Ana API {#api}

Adlar TypeScript biçimindedir. Go, Go harf biçimini kullanır (`Seal`, `Open`, `NewEpochKeyManager`), Rust ve Python snake_case kullanır. Python, Swift ve Kotlin'de `seal` ve `open`, `seal_envelope` / `sealEnvelope` ve `open_envelope` / `openEnvelope` olarak adlandırılır.

| Ad | Ne yapar | Nerede |
|---|---|---|
| `generateSealKeys` | rastgele anahtar çifti (ML-KEM-1024 + X25519) | tümü |
| `deriveSealKeys` | BIP-39 anımsatıcı ifadesinden, isteğe bağlı parola ve indeksle anahtar çifti | tümü |
| `sealKeysFromSeed`, `sealSeedFromMnemonic` | 32 baytlık tohumdan geri yükleme; anımsatıcı ifadeden tohum | tümü |
| `recipientOf` | bir anahtar çiftinden genel alıcı | tümü |
| `validateMlkemPublicKey`, `validateX25519PublicKey` | girdi denetimleri (zincir aynı ML-KEM denetimini uygular) | tümü |
| `seal` | 1 ila 1.024 alıcıya şifreleme (`mode`, `aad`, `anonymous`) | tümü |
| `open` | bir anahtar çiftiyle şifre çözme | tümü |
| `parseEnvelope`, `envelopeSize` | bir zarfı incelemek; boyutunu hesaplamak | tümü |
| `envelopeToText`, `envelopeFromText` | `qoreseal:` metin biçimi | tümü |
| `signRecipientCard`, `verifyRecipientCard` | alıcı kartını oluşturma ve denetleme | tümü |
| `recipientCardText`, `recipientCardFields`, `assembleRecipientCard` | başka yerde imzalanırken, örneğin bir cüzdan arayüzünde, kart oluşturma | tümü |
| `buildRegisterKemKeyMessage`, `buildRemoveKemKeyMessage` | QoreSign ile hibrit imzalanacak kayıt defteri mesajları | tümü |
| `describeKemRegistryError` | codespace `pqc` kodları 250 ila 254'ü açıklar | tümü |
| `EpochKeyManager` | bir grup için dönem anahtarları: `addMember`, `removeMember`, `rotate`, `distribution`, `exportKeys`, `keyFor`, `members`, `epoch` | tümü |
| `sealEpochKey`, `openEpochKey` | bir dönem anahtarını gönderme veya alma (örneğin yeni gelen için geçmiş) | tümü |
| `PrivateBatchCodec`, `sealBatch`, `openBatch`, `parseBatchHeader`, `batchSize` | taahhütlü şifreli batch'ler | tümü |
| `fetchKemKey`, `fetchMlkemPublicKey` | bir hesabın ML-KEM anahtarını REST'ten okur | TypeScript, Go ağ paketi |
| `resolveRecipient` | zincirdeki anahtarlar artı kart, doğrulanmış olarak bir alıcı | TypeScript, Go ağ paketi |
| `sealToAddresses` | hesaplara adresle mühürleme | TypeScript, Go ağ paketi |

Ağ yardımcıları TypeScript'te `@qorechain/qoreseal/network`, Go'da `github.com/qorechain/qoreseal/go/network` paketidir. Daha alt düzey yapı taşları da dışa aktarılır (`mlkemEncapsulate`, `mlkemDecapsulate`, `x25519Agree`, `hybridSharedSecret`, `deriveKey`, `kdfInfo`, `recipientHint`). Test için adlandırılmış işlevler (`sealWithEntropy`, `testing_*`) test vektörlerini yeniden üretmek için vardır ve gerçek verilerle asla kullanılmamalıdır.

Python hataları sabit bir `code` ile `QoreSealError.Failure` fırlatır; Go hataları `qoreseal.IsCode` ile karşılaştırılır.

## Nasıl erişilir {#how-to-access}

| | Ana ağ `qorechain-vladi` | Test ağı `qorechain-diana` |
|---|---|---|
| KEM anahtar kayıt defteri | v3.2.5 yükseltmesinden sonra (henüz uygulanmadı, tarih yok) | canlı |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` (zincir kimliği 9801) | `https://evm-testnet.qore.host` (zincir kimliği 9800) |

27 Ekim 2026'da test ağı kayıt defteri sorgusu, anahtarı olmayan bir hesap için `{"found":false,"key":null}` yanıtını verdi; ana ağda aynı sorgu "Not Implemented" yanıtını verdi.

- Doğrudan geçirilen denetçi anahtarları dahil çevrimdışı mühürleme ve açma, özel gruplar ve batch'ler ağ veya hesap gerektirmez.
- Bir adrese şifrelemek için alıcının kayıt defterine bir ML-KEM-1024 anahtarı yayımlamış olması ve hibrit mod için bir alıcı kartı bulunması gerekir.
- Bir anahtar yayımlamak için test ağı QOR'u olan bir hesap (ana ağda yükseltmeden sonra QOR), kayıtlı bir ML-DSA-87 anahtarı ve işlemi hibrit imzalamak için QoreSign gerekir. Ücret tabanı gas başına 0,1 uqor'dur. Test ağı QOR'unu [Musluk](/dashboard/faucet) üzerinden alın.
- Ana ağ v3.2.5'i uygulayana kadar ana ağdaki kayıt defteri sorgusu kullanılamaz ve kayıt reddedilir (kod 250).

## Nerede yayımlanır {#where-published}

27 Ekim 2026'da her kayıt defterine karşı denetlendi.

| Kayıt defteri | Paket | Sürüm | Bağlantı |
|---|---|---|---|
| crates.io | `qorechain-qoreseal` | 0.1.0 | [crates.io/crates/qorechain-qoreseal](https://crates.io/crates/qorechain-qoreseal) |
| Go modül proxy'si | `github.com/qorechain/qoreseal/go` | v0.1.0 (etiket `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoreseal/go) |
| PyPI | `qorechain-qoreseal` | 0.1.0 (macOS arm64 ve x86_64, Linux x86_64 ve aarch64 için wheel'ler, artı kaynak) | [pypi.org/project/qorechain-qoreseal](https://pypi.org/project/qorechain-qoreseal/) |
| Swift Package Manager | `github.com/qorechain/qoreseal` içinden `QoreSeal` | 0.1.0 (GitHub sürümünde ikili `QoreSealFFI.xcframework.zip`) | [release v0.1.0](https://github.com/qorechain/qoreseal/releases/tag/v0.1.0) |
| Maven Central | `io.github.qorechain:qoreseal` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) |
| Maven Central | `io.github.qorechain:qoreseal-android` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) |
| npm | `@qorechain/qoreseal` | henüz yayımlanmadı (yakında) | |

Her iki Maven yapıtını kullanan projeler Kotlin 2.3 veya üstü derleyici gerektirir. Kotlin/JVM yapıtı macOS (arm64, x86_64), Linux (x86_64, arm64) ve Windows (x86_64) için yerel kütüphaneleri paketler; Android yapıtı arm64-v8a, armeabi-v7a ve x86_64'ü kapsar.

Kaynak: [github.com/qorechain/qoreseal](https://github.com/qorechain/qoreseal) (sürüm v0.1.0). Lisans Apache-2.0.

## Sınırlar ve bilinen sorunlar {#limits}

- **Korunan, yükün içeriğidir.** Gönderen ve alıcı adresleri, banka transfer tutarları, işlem zamanlaması, zarf boyutları ve alıcı sayısı zincirde herkese açık kalır.
- **Özel işlemler değildir.** QoreSeal kimin kiminle işlem yaptığını veya ne kadar olduğunu gizlemez.
- **Sıfır bilgi ispatı yok.** Hiçbir şey şifreli veri hakkında bir şey kanıtlamaz; özel bir yan zincirde, grup dışındaki doğrulayıcılar bir batch'in içinde ne olduğunu denetleyemez.
- **Zarflar imzalı değildir.** Herkes bir adrese şifreleyebilir ve çok alıcılı bir zarfın herhangi bir alıcısı diğerleri için farklı bir zarf oluşturabilir. Gönderenin doğrulanması gerekiyorsa içeriği veya zarfı imzalayın (QoreSign `signMessage`).
- **Her alıcı yükün tamamını okur.** Alıcıya özel karartma yoktur; farklı okuyucular için ayrı zarflar mühürleyin.
- **İpuçları anonimlik değildir.** Bir adayın genel anahtarını bilen herkes (zincirde bulunur) o anahtarın bir alıcı olup olmadığını sınayabilir. `anonymous: true` ipuçlarını sıfırlar; alıcılar bu durumda her girdiyi dener.
- **Anahtar kaybı veri kaybı demektir.** Zincirde kurtarma yoktur. Tohumu veya anımsatıcı ifadeyi kaybetmek, o anahtara mühürlenen her şeyi kaybettirir.
- **Bir anahtarı kaldırmak veya döndürmek hiçbir şeyi silmez veya yeniden şifrelemez.** Eski bir anahtara mühürlenen veri, onu elinde tutan herkes tarafından okunabilir kalır; eski tohumları veya indeksleri saklayın.
- **Çıkarılan grup üyeleri** ait oldukları dönemlerin anahtarlarını saklar. Yeni üyeler, kendilerine daha eski anahtarlar mühürlenmedikçe katıldıkları dönemden itibaren okur.
- **Zincir kimliği ve amaç zarfta değildir;** alıcı bunları bilmelidir.
- **Ana ağ kayıt defteri:** ana ağ v3.2.5'i uygulayana kadar kullanılamaz.
- **1.0 öncesi, yapı harici incelemeyi bekliyor.** Küçük sürümler API'yi değiştirebilir. Güvenmeden önce spesifikasyonu okuyun.
- **Henüz npm paketi yok** ve henüz Windows için Python wheel'i yok.

## Güvenlik notları {#security}

- Gizli anahtarlar, QoreSeal'i çalıştıran cihazı veya sunucuyu asla terk etmez. Zincir yalnızca ML-KEM-1024 genel anahtarını saklar; kart X25519 genel anahtarını taşır.
- Hesap anımsatıcı ifadesini, ayrılmış bir anımsatıcı ifadeyi veya 32 baytlık tohumu (`keys.seed`) bekleme durumunda şifrelenmiş olarak yedekleyin. ML-KEM gizli anahtarını tek başına asla dışa aktarmayın; tohumu veya anımsatıcı ifadeyi dışa aktarın.
- Döndürme: sonraki indekse geçin, yeni ML-KEM anahtarını kaydedin, yeni bir kart imzalayın. Eski kartlar otomatik olarak doğrulanmayı bırakır.
- Bir kullanıcının anahtarının kaybından sağ çıkması gereken verilere bir kurtarma alıcısı (çevrimdışı bir anahtar) ekleyin. Eklendiği her şeyi okuduğu için onu bir denetçi anahtarı gibi ele alın.
- Gruplar için `exportKeys()` her dönem anahtarını tutar. Bu dışa aktarımı operatörün kendi anahtarına ve çevrimdışı bir kurtarma anahtarına mühürleyin ve sıralayıcı (sequencer) makinesinden uzak tutun. Dönem anahtarlarını bir takvime göre döndürün.
- `mlkem` modu açıkça seçilmelidir; hibrit mod sessizce asla düşmez.
- İlkeller [`qorechain-pqc`](/developer-tools/pqc-library) bağlamalarından ve yerleşik kütüphanelerden gelir (TypeScript için noble, RustCrypto crate'leri, Go standart kütüphanesi); hesap imzaları [QoreSign](/qoresign/overview) tarafından sağlanır.
- Güvenlik açıklarını özel olarak security@qore.network adresine bildirin. Zincir üstü meta verilerin herkese açık olması tasarım gereğidir ve bir belge konusudur, açık değildir.

## İlgili sayfalar {#related}

- [QoreSign](/qoresign/overview): kayıt işlemi için hibrit imzalama ve alıcı kartlarının ve imzalı zarfların arkasındaki mesaj imzalama.
- [RDK'ya genel bakış](/rollups/overview) ve [Veri erişilebilirliği](/rollups/data-availability): özel bir yan zincirin şifreli batch'lerini demirleme.
- [PQC kütüphanesi](/developer-tools/pqc-library): QoreSeal'in altındaki ML-KEM-1024 bağlamaları.
- [Post-kuantum güvenlik](/architecture/post-quantum-security) ve [Post-kuantum imzalama](/developer-guide/post-quantum-signing): hesapların ve anahtarların zincirde nasıl çalıştığı.
- [Geliştirici paketlerine genel bakış](/developer-tools/overview).
