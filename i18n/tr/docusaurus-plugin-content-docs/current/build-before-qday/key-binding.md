---
slug: /build-before-qday/key-binding
title: Post-kuantum anahtarınız hesabınıza nasıl bağlanır
sidebar_label: Anahtar bağlama
sidebar_position: 3
---

# Post-kuantum anahtarınız hesabınıza nasıl bağlanır

Bu bölümdeki her eğitim, normal hesap anahtarınızın yanında bir **post-kuantum anahtar** kullanır. Bu sayfa, bu anahtarın nereden geldiğini, zincirin onun hesabınıza ait olduğunu nasıl öğrendiğini ve bunu kendi başınıza nasıl kontrol edebileceğinizi sade bir dille anlatır. Okumak için hiçbir şey çalıştırmanız gerekmez. [Kendiniz kontrol edin](#check) bölümündeki kontroller yaklaşık 5 dakika sürer.

## Tek resimde fikir {#picture}

```text
kurtarma ifadesi (veya kurtarma kodu)
        |
        v
her iki anahtarı türet
  - klasik anahtar (secp256k1)
  - post-kuantum anahtar (ML-DSA-87), hesap adresinize bağlı
        |
        v
bir kez kaydet, sahiplik kanıtıyla
        |
        v
her işlem hibrit imzalanır (iki anahtarla)
        |
        v
validatörler iki imzayı da doğrular
```

## Bu sayfada kullanılan sözcükler {#words}

| Sözcük | Ne anlama gelir |
| --- | --- |
| Klasik anahtar | Normal hesap anahtarınız (secp256k1). Bu türdeki her blokzincirde her işlemi o imzalar. |
| ML-DSA-87 anahtarı | Post-kuantum imza anahtarı. Gelecekteki bir kuantum bilgisayarın bunu kırması beklenmez. |
| Kurtarma ifadesi (mnemonic) | Bir hesabı geri getiren 12 veya 24 kelime. |
| Kurtarma kodu | `QRC1` ile başlayan bir satır. Hesabınız ham bir özel anahtardan geliyorsa, post-kuantum anahtar için kurtarma ifadesinin yerini tutar. |
| Kaydetme | Zincire hangi ML-DSA-87 anahtarının hesabınıza ait olduğunu söyleyen tek bir işlem. |
| Sahiplik kanıtı | Kaydettiğiniz anahtarın gizli yarısına gerçekten sahip olduğunuzu gösteren bir imza. |
| Hibrit imza | Tek bir işlem üzerinde iki imzanın birlikte bulunması. |

## 1. Üretmeyin, türetin {#derive}

Post-kuantum anahtar rastgele seçilip kaybedebileceğiniz bir dosyada saklanmaz. **Türetilir**: aynı girdi her zaman aynı anahtarı verir.

- **Kurtarma ifadesiyle.** ML-DSA-87 anahtarı, hesap adresinizle birlikte klasik anahtarla **aynı kurtarma ifadesinden** gelir. Klasik anahtar ve post-kuantum anahtar ikisi de ifadeden yeniden kurulur; yani **tek bir yedek ikisini de geri getirir**. QoreX ve SDK'nın birleşik hesabı böyle çalışır.
- **Ham özel anahtarla.** Tek başına bir özel anahtar ikinci bir anahtar veremez. Bu durumda post-kuantum anahtar, `QRC1` ile başlayan ayrı bir **kurtarma kodundan** üretilir. Workshop 1 projesinde bunu `pnpm window recovery-code` ile oluşturursunuz. SDK'da karşılığı `generatePqcRecoveryCode()` işlevidir.

Kurtarma kodu için üç kural:

1. Onu özel anahtardan **ayrı** tutun. İkisi aynı yerdeyse tek bir hırsızlık ikisini birden götürür.
2. Aynı hesap için her zaman **aynı** kodu kullanın.
3. **Farklı bir kod farklı bir anahtar verir.** Zincir o zaman, kaydettiğinizle eşleşmeyen bir anahtar görür.

:::caution Bir kurtarma kodu yeniden oluşturulamaz
Kaybolan bir kurtarma kodunu geri getirmenin yolu yoktur. Oluşturduğunuzda kâğıda yazın. Tek istisna, atılabilir testnet hesaplarıdır: bir dakikada yeni bir hesap oluşturabilirsiniz.
:::

## 2. Bir kez bağlayın, sahiplik kanıtıyla {#bind}

Bağlama, hesap başına bir kez gönderilen ve `MsgRegisterPQCKeyV2` adını taşıyan tek bir işlemdir. İçinde şunlar bulunur:

- ML-DSA-87 **açık anahtarınız** (2.592 bayt) ve
- bir **sahiplik kanıtı**: anahtar, zinciri ve hesabınızı adlandıran kısa bir metni imzalar. Kimse sahip olmadığı bir anahtarı bağlayamaz ve kimse bir bağlamayı başka bir zincirden kopyalayamaz.

Bu, zincirin **yalnızca klasik imzayla** kabul ettiği tek mesajdır. Nedeni basittir: bundan önce zincirin hesabınız için kayıtlı bir post-kuantum anahtarı yoktur, bu yüzden ikinci bir imzanın karşılaştırılacağı bir şey de yoktur.

Bunu nasıl yaparsınız:

| Nerede | Nasıl |
| --- | --- |
| QoreX | İlk gönderiminizde otomatik. Tek seferlik yaklaşık 0,09 QOR ücreti vardır. |
| Workshop 1 ve örnek uygulamalar | `pnpm window register` ([Workshop 1 kılavuzunun](/build-before-qday/workshop-1#step-5) 5. adımı). |
| Kendi kodunuz | SDK'nın `ensurePqcRegistered` işlevi. |

`ensurePqcRegistered` işlevini yeniden çağırmak güvenlidir. Önce hesabınızı okur. Anahtarınız zaten bağlıysa hiçbir şey göndermez. **Farklı** bir anahtar bağlıysa `PqcKeyMismatchError` ile durur ve hiçbir şey göndermez. İkinci bir kaydı elle gönderirseniz zincir onu reddeder ve **yine de ücreti alır**; bu yüzden kontrolü yardımcı işleve bırakın.

:::note Zincir bugün neyi şart koşuyor
Zincir, bir sahiplik kanıtı varsa her zaman onu kontrol eder ve doğrulanmazsa kaydı reddeder. SDK ve QoreX kendiliğinden bir kanıt ekler. Mainnet'te kanıtsız bir kayıt hâlâ kabul edilir. Testnet'te, v3.2.8 sürümünden itibaren, yeni bir hesabın ilk işlemi bu kayıt olmalıdır. Ayrıntılar: [Post-kuantum imzalama](/developer-guide/post-quantum-signing#proof-of-possession).
:::

## 3. Bağlamadan sonra her şey hibrittir {#hybrid}

O andan itibaren her yerel işlem iki imza taşır:

- klasik secp256k1 imzası (64 bayt) ve
- `PQCHybridSignature` adlı bir uzantıdaki ML-DSA-87 imzası (4.627 bayt).

Validatörler **ikisini de** doğrular. Bunu yaptıklarında zincir, durumu `verified` olan bir `pqc_hybrid_verify` olayı kaydeder.

Kayıtlı anahtarı olmayan bir işlem `account has no PQC key and classical fallback is disabled` hatasıyla reddedilir.

EVM şeridindeki işlemler (örneğin bir kontrat dağıtımı) bir şey daha ister: hibrit imzalı bir mesajla açılan bir EVM yetkilendirme penceresi. [EVM pencere başvurusuna](/developer-guide/evm-window-reference) bakın.

## Kendiniz kontrol edin {#check}

`curl` gerekir. `jq` isteğe bağlıdır. İkisi de [Başlamadan önce](/build-before-qday/prerequisites#curl-jq) sayfasında anlatılır.

### Anahtarım kayıtlı mı? {#check-account}

1. `qor1...` yerine kendi adresinizi yazın ve çalıştırın:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/account/qor1...
```

Ne yapar: herkese açık testnet sunucusundan hesabınızın anahtar kaydını ister.

Parametreler:

- `curl`: bir web adresini getiren program.
- `-s`: sessiz; ilerleme çubuğunu gizler ve yalnızca yanıtı gösterir.
- `https://api-testnet.qore.host/qorechain/pqc/v1/account/qor1...`: testnet REST adresi ve ardından hesabınız.

**Göreceğiniz şey:** kayıtlı bir hesap için şuna benzer bir yanıt (yer tutucular gösterilmiştir, sizinkinde gerçek değerler olur):

```json
{
  "found": true,
  "account": {
    "address": "qor1...",
    "public_key": "<base64 ML-DSA-87 public key>",
    "algorithm_id": 1,
    "algorithm_name": "dilithium5",
    "ecdsa_pubkey": "<your classical public key>",
    "key_type": "hybrid",
    "created_at_height": "<block height>",
    "migration_public_key": null,
    "migration_algorithm_id": 0,
    "classical_key_source": "auth_account",
    "possession_proven": true
  }
}
```

Bir anahtar bağlıysa `found` değeri `true`, bağlı değilse `false` olur. Anahtar doğrulanmış bir sahiplik kanıtıyla kaydedildiyse `possession_proven` değeri `true` olur.

### İşlemim hibrit imzalandı mı? {#check-tx}

Workshop 1, 6. adımdaki kontrol.

1. `<HASH>` yerine kendi işleminizin özetini yazın (`<` ve `>` olmadan) ve çalıştırın:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Ne yapar: herkese açık testnet sunucusundan işleminizin tam kaydını ister.

**Göreceğiniz şey:** uzun bir metin bloğu. Üç şeye bakın:

1. `tx_response` içinde `"code": 0`. Kod 0 başarı demektir.
2. ML-DSA-87 imzasını taşıyan `PQCHybridSignature` uzantısı: 64 baytlık secp256k1 imzasının yanında **4.627 bayt**.
3. `events` içinde, `status` özniteliği `verified` olan `pqc_hybrid_verify` türünde bir olay.

2. Yalnızca o olayı yazdırmak için (`jq` gerekir):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Ne yapar: aynı kaydı getirir ve `jq` üzerinden geçirir; `jq` yalnızca doğrulama olayını tutar.

**Göreceğiniz şey:** `status` özniteliği `verified` olan tek bir olay.

## İlgili anahtarlar ve değişiklikler {#related}

- **Şifreleme anahtarları.** Verileri bir hesaba şifrelemek için [QoreSeal](/developer-tools/qoreseal) tarafından kullanılan ML-KEM-1024 anahtarları **ayrı bir kayıt defterinde** durur. Birini hibrit imzalı bir işlemde `MsgRegisterKEMKey` ile yayımlarsınız; bu yüzden hesabın ML-DSA-87 anahtarı önceden olmalıdır.
- **İmza anahtarını değiştirme.** `MsgRotatePQCKey`, ML-DSA-87 anahtarını aynı türden yeni bir anahtarla değiştirir; örneğin ele geçirilmiş bir anahtarı emekliye ayırmak için. `MsgMigratePQCKey` algoritmalar arasında geçiş yapar. İkisi de eski ve yeni anahtarın imzalarını ister ve zincir, hesabın daha önce kullandığı bir anahtarı reddeder. İkisi de mainnet'te ve testnet'te canlıdır. Tüm kurallar: [Post-kuantum imzalama](/developer-guide/post-quantum-signing).

## Sorun giderme {#troubleshooting}

| Gördüğünüz | Neden | Ne yapmalı |
| --- | --- | --- |
| `account has no PQC key and classical fallback is disabled` | Hesap ML-DSA-87 anahtarını henüz kaydetmedi. | Önce kaydedin (`pnpm window register`, QoreX ilk gönderim veya `ensurePqcRegistered`), sonra yeniden gönderin. Yukarıdaki hesap sorgusuyla kontrol edin. |
| `PqcKeyMismatchError` veya `pnpm window status` içinde `registered, but NOT this key` | Farklı bir anahtar zaten bağlı. İlk seferdekinden başka bir kurtarma kodu veya ifadesi kullandınız. | Özgün kurtarma kodunu veya ifadesini geri koyun. Atılabilir bir hesapsa yeni bir hesapla baştan başlayın. |
| Kayıt, zaten kayıtlı olduğu için reddedildi | Hesap zaten bir anahtar taşıyor. Ham bir ikinci kayıt yine de ücreti alır. | Hiçbir şey yapmayın. Hesabı yukarıdaki sorguyla okuyun veya önce kontrol eden `ensurePqcRegistered` işlevini kullanın. |
| Kurtarma kodunuzu kaybettiniz | Özel anahtardan yeniden oluşturulamaz. | Hesap bir kurtarma ifadesinden geldiyse aynı ifadeyi kullanın: aynı anahtarı verir. Aksi halde yeni bir hesap kullanın. Testnet'te bunun maliyeti yoktur. |
| Kayıt, ücret veya bakiye mesajıyla başarısız oluyor | Hesapta ücret için çok az QOR var (yaklaşık 0,09 QOR) veya ücret, gaz birimi başına 0,1 uqor olan ağ tabanının altında. | [Faucet](https://dashboard.qorechain.io/faucet) üzerinden QOR alın, elle kayıt için gazı yaklaşık 600.000'e ayarlayın ve yeniden deneyin. |
| Kayıt yaptığınız halde `found` değeri `false` | Yanlış ağı veya yanlış adresi soruyorsunuz. | Testnet için `api-testnet.qore.host` ve kendi `qor1...` adresinizi kullandığınızı kontrol edin. Bir cüzdan, projenizden farklı bir ağı gösteriyor olabilir. |
| Hesap `found: true` yanıtı veriyor ama işlemleriniz başarısız | Zincirdeki anahtar, projenizin türettiği anahtar değil. | `pnpm window status` çalıştırın ve sonucu `.env` içindeki kurtarma koduyla karşılaştırın. |

## Sonraki adım {#next}

[Workshop 1 kılavuzuna](/build-before-qday/workshop-1#step-5) dönün ve anahtarınızı kaydedin, ya da [genel bakışı](/build-before-qday/overview) okuyun.
