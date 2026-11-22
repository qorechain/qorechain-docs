---
slug: /developer-guide/svm-testnet-v329
title: "Test Ağında SVM: Program Dağıtın ve Solana İşlemleri Gönderin (v3.2.9)"
sidebar_label: SVM Test Ağı (v3.2.9)
sidebar_position: 11
---

# Test Ağında SVM: Program Dağıtın ve Solana İşlemleri Gönderin (v3.2.9)

**v3.2.9** sürümü, standart Solana komut satırının QoreChain ile konuşmasını sağlar. Test ağına karşı `solana transfer`, `solana program deploy`, `anchor deploy` ve bir web3.js betiği çalıştırabilirsiniz; zincir her Solana imzasını kendisi kontrol eder. Bir Solana anahtarı tek başına QoreChain hesabınıza dokunamaz: önce **kuantum sonrası anahtarınızla** imzalanmış bir işlemle küçük, sınırlı bir **yetkilendirme penceresi** açarsınız ve pencere ancak Solana anahtarı kendi imzasıyla ona sahip olduğunuzu kanıtlarsa kabul edilir. Pencere bittiğinde anahtar yeniden sıradan bir Solana hesabıdır.

Bu sayfa bir geliştiriciyi boş bir makineden test ağında dağıtılmış ve çağrılmış bir programa götürür: yeni olanlar, araçlar, anahtar kanıtını elle oluşturma, pencereyi açma ve kapatma, bir dağıtıcı anahtarı fonlama, `solana` veya `anchor` ile dağıtma, programı çağırma, sonucu okuma ve gerçek hata metinlerinin bir tablosu.

:::note Yalnızca test ağı, 22 Kasım 2026'da kontrol edildi
Buradaki her şey, 20 Kasım 2026'dan beri v3.2.9 çalıştıran **`qorechain-diana`** test ağında çalışır (yönetişim önerisi 39, yükseklik 10.424.000). Solana uyumlu (SVM) şerit orada yönetişim önerisi 37'den beri açıktır. **Bunların hiçbiri ana ağda çalışmaz:** SVM şeridi `qorechain-vladi` üzerinde kapalıdır, VM'ler arası çağrılar duraklatılmış kalır ve CosmWasm sözleşme yüklemesi yalnızca yönetişimle yapılır. Yalnızca test ağına karşı geliştirin. Test QOR'un değeri yoktur. Atılabilir anahtarlar kullanın.

Bu sayfadaki okuma çağrıları, ücret teklifi, nonce rotası ve anahtar kanıtı örneği 22 Kasım 2026'da canlı test ağına karşı çalıştırıldı. Tam akış (pencere, fonlama, dağıtım, çağrı, yükseltme, kapatma) yayından önce, değiştirilmemiş `solana-cli` 4.0.2 ve `anchor-cli` 1.2.2 ile yerel bir test ağında çalıştırıldı. Kesin ayrım için bkz. [Neler kontrol edildi](#tested).
:::

:::caution Herkese açık ağ geçidi henüz işlem aktarmıyor
22 Kasım 2026'da `https://svm-testnet.qore.host`, iyi biçimlendirilmiş her `sendTransaction` çağrısına `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)` yanıtını verdi. Okumalar çalışır, ücret teklifleri çalışır; bu ağ geçidinin operatörleri bir aktarıcı hesap ayarlayana kadar yazmalar reddedilir. Pencereye kadar (pencere dahil) olan adımlar için ağ geçidi gerekmez. Gönderen adımlar için bkz. [Herkese açık ağ geçidi olmadan göndermek](#relay); başlamadan önce uç noktayı yeniden kontrol edin: [Adım 1](#step-config) içindeki komutu, ardından [Adım 6](#step-fund) içindeki gibi bir `solana transfer` çalıştırın.
:::

## v3.2.9'da SVM için yeni olanlar {#whats-new}

* **Zincir üzerinde Solana kablo işlemleri.** Bir Solana cüzdanının veya aracının imzaladığı işlem, Native mesaj `MsgSolanaTransaction` içinde bayt bayt taşınır. Zincir her ed25519 imzasını, yakın blok özetini ve ücret ödeyeni doğrular, talimatları tek atomik adım olarak sırayla çalıştırır ve daha önce gördüğü bir imzayı reddeder. Mesaj yalnızca kendi taşıyıcı işleminin üst düzey mesajı olarak çalışır: authz altında ve bir sözleşme onu gönderdiğinde reddedilir.
* **Çalıştırmak yerine aktaran bir ağ geçidi.** Düğümün Solana JSON-RPC yöntemi `sendTransaction` artık düğümde hiçbir şey çalıştırmaz. İşlemi çözer, durumun atılan bir kopyasında simüle eder ve taşıyıcı işlemi iki anahtarla imzalayıp mempool'a gönderen bir aktarıcı hesaba verir. Yalnızca bir bloktan geçen şey durumu değiştirir. Ed25519 imzalarınız zincir üzerinde doğrulandığı için aktarıcı işleminiz üzerinde hiçbir yetki kazanmaz.
* **Solana anahtarları için kuantum sonrası yetkilendirme penceresi.** `MsgOpenSVMWindow` bir ed25519 anahtarını adlandırır ve onu blok sayısı, işlem sayısı ve QOR değeriyle, isteğe bağlı olarak listelenen programlarla sınırlar. Pencere açıkken bu anahtarın imzaladığı işlemler hesabınız adına işlem yapar. Pencereyi açmak **ML-DSA-87 imzanızı** gerektirir; bu yüzden sızmış bir Solana anahtarı tek başına asla pencere açamaz.
* **Bir anahtar kanıtı.** Pencere açmak `svm_key_proof` (alan 7) ister: Solana anahtarının kendisinin, zinciri, hesabınızı ve anahtarı adlandıran kısa bir metin üzerinde attığı 64 baytlık Ed25519 imzası. Açık anahtar herkese açıktır; pencereyi açan kişinin anahtara sahip olduğunu gösteren şey kanıttır.
* **Bir kanıt bir pencere açar.** Metin, o anahtar için açılan her pencerede artan bir sayaç (nonce) taşır; bu yüzden eski bir kanıt yeniden oynatılamaz.
* **Bir program yükleyici.** Yükseltilebilir yükleyici kullanılabilir; böylece `solana program deploy`, `write-buffer`, `extend`, `set-upgrade-authority`, `close` ve `anchor deploy` çalışır ve programlar yetkilileri tarafından yükseltilebilir ve kirayı geri almak için kapatılabilir.
* **Solana araçlarının anladığı ücretler.** `getFeeForMessage` ve `simulateTransaction` gerçek ücreti bildirir; bu yüzden varsayılan `solana` ve web3.js ücret kontrolleri ek bayrak olmadan doğrudur. Bir işlem çok ucuz olduğunda hata, ayarlanacak tam fiyatı taşır.
* **Authz izinleri için bütçeler.** Başka biri tarafından bir authz izni altında sizin adınıza gönderilen `MsgExecuteProgram`, `MsgCreateAccount` ve `MsgDeployProgram` yalnızca bir pencere ve onun ayrı, adına yapılan işlem bütçesi içinde çalışır.

### İşlem yolu {#path}

```text
solana CLI / web3.js / anchor
        |  sendTransaction (signed wire transaction)
        v
SVM gateway on a node: decode, verify, simulate on a copy, check the price
        |  relayer signs MsgSolanaTransaction with the classical key and ML-DSA-87
        v
mempool, then a block: ante checks every Solana signature, blockhash, fee payer, window
        v
instructions run in order; they all succeed or none does
```

Solana ücreti aktarıcıya gider; dolayısıyla aktarıcı hiçbir zaman zarar etmez. Ağ geçidinin her yanıtı kesindir: bir blok yalnızca bir kez işlenir, bu yüzden `processed`, `confirmed` ve `finalized` aynı veriyi döndürür.

### Pencere: neyi sınırlar {#window}

| Sınır | Anlamı | Limit |
| ----- | ------ | ----- |
| Bloklar | Pencere bu kadar blok sonra sona erer. Test ağında bir blok yaklaşık 1,4 saniye sürer (22 Kasım 2026'da kontrol edildi); bu yüzden 3.600 blok yaklaşık 85 dakikadır | 1 ile 17.280 arası |
| İşlemler | Kabul edilen her Solana işlemi, başarısız olsa bile bir sayılır | 1 ile 1.000 arası |
| Değer | Kabul edilen işlemlerin neden olduğu, hesabın yerel QOR'undaki her azalma, ücretler dahil, sayılır. Değeri aşacak bir işlem reddedilir ve geri alınır. Değer uqor veya QOR olarak verilir, örneğin `25qor` | 0'dan büyük |
| Programlar (isteğe bağlı) | Kabul edilen bir işlemin her talimatı listelenen programlardan birini çağırmalıdır | en fazla 16 |

Tasarımdan çıkan kurallar:

* Pencere yalnızca **kendi kuantum sonrası imzanızla**, üst düzey mesaj olarak açılır ve kapatılır. Authz, grup veya bir sözleşme altında reddedilir.
* Pencere açabilmek için **kayıtlı bir kuantum sonrası anahtarına** ihtiyacınız vardır.
* **Bir Solana anahtarı aynı anda tek bir hesabı yetkilendirir.** Pencereyi yeniden açmak eskisinin yerine geçer ve anahtarını serbest bırakır.
* **Kuantum sonrası anahtarınızı değiştirmek veya taşımak pencereyi sonlandırır.**
* Yerel bakiyenin yanında değer limiti, imzanızın başka yerlerde denetlediği QOR'u da sayar: sizinkinden bir tohumla türetilen hesaplar, kapatabileceğiniz token hesapları, yetkilisi olduğunuz arama tabloları ve yükleyici hesapları. Harcanan veya başkasına verilen miktar sayılır. Bir pencere anahtarı, hesabınızın kendi adresini cüzdan durumundan asla çıkaramaz.
* Pencere açıkken `getBalance` veya `getAccountInfo` okumak, pencere anahtarı için yerel bakiyenizi gösterir.

### Pencerenin bilinen limitleri {#window-limits}

Token tutan bir cüzdan için pencere açmadan önce bunları okuyun.

* **Token miktarları değer limitinde sayılmaz.** Limit yalnızca yerel QOR'u sayar. Varsayılan kapsamla (program listesi yok), Solana anahtarı hesabın SPL token'larını yalnızca işlem ücretine karşılık transfer edebilir ve yakabilir; hesabın tuttuğu bir mint yetkisiyle de mint edebilir.
* **Varsayılan kapsam kalıcı izinleri reddeder.** Varsayılan kapsamlı bir pencere üzerinden işlem yapan bir anahtar, bir delege onaylayamaz, bir token hesabının sahibini veya kapatma yetkisini değiştiremez, bir mint veya dondurma yetkisini değiştiremez. Bu, aynı işlemde oluşturulan bir token hesabı veya mint için de geçerlidir. Bunlar kendi kuantum sonrası imzanızı veya program listesi token programını adlandıran bir pencere gerektirir.
* **Ortak imzalayanın ödemesi pencereye karşı sayılır.** Başka bir anahtar aynı Solana işlemini imzalar ve içinde bir şey öderse, bu ödeme de değer limitinize karşı sayılır. Bir sponsorun ayrı bir işlemde ödemesine izin verin veya değer limiti işlemin taşıdığı her şeyi karşılayan bir pencere açın.
* **Açık bir token kapsamı altında verilen izinler pencereden uzun yaşar.** Program listesi token programını adlandırıyorsa, pencere üzerinden yapılan delegeler ve yetki değişiklikleri pencere kapandıktan, sona erdikten veya kuantum sonrası anahtarınız döndürüldükten sonra da yerinde kalır. Onları kendi imzanızla geri alın.
* **Token eylemlerini tamamen dışlamak için** pencereyi token programını adlandırmayan bir program listesiyle açın.

### Ücretler {#fees}

| Öğe | Değer (test ağı, 22 Kasım 2026) |
| --- | ------------------------------- |
| İmza başına temel ücret | 0,045 QOR (45.000 uqor, 45.000.000 lamport). Zincirin gaz başına asgari 0,1 uqor gaz fiyatında 450.000 gazın fiyatıdır ve `getFeeForMessage` bunu bildirir |
| Ekrandaki birimler | `solana` tutarları **SOL** olarak etiketler. QoreChain'de 1 "SOL", 1 QOR'dur, çünkü 1 uqor 1.000 lamport ve 1 QOR 1.000.000 uqor'dur. "0,045 SOL" ifadesini 0,045 QOR diye okuyun |
| Öncelik ücreti | Yalnızca işlem, temel ücretin karşıladığından fazla gaza ihtiyaç duyduğunda. ComputeBudget fiyatı çarpı birim limitidir |
| Bir dağıtım | Yazma işlemi başına bir temel ücret, artı programı kapattığınızda geri gelen kira |

Ödediğiniz tutar, imzaladığınız tutarla sınırlıdır: taşıyıcı işlemin maliyetini, en az temel ücreti ve en fazla kendi imzanızın vaat ettiği ücreti ödersiniz. Bir aktarıcı sizi daha fazla ödemeye zorlayamaz.

Bir işlem, taşıyıcısının maliyetinden az ödediğinde ağ geçidi onu `-32002` koduyla reddeder ve size tam düzeltmeyi söyler. Aynı sayılar hata `data` alanındadır:

```json
{
  "code": -32002,
  "message": "Transaction simulation failed: insufficient priority fee: the transaction pays 45000000 lamports, its carrier costs ... uqor ... set ComputeBudget SetComputeUnitPrice to <price> micro-lamports per compute unit, which covers it for a compute unit limit of <limit> or more ...",
  "data": {
    "computeUnitPrice": 0,
    "computeUnitLimit": 0,
    "transactionComputeUnitLimit": 0,
    "carrierFeeLamports": 0,
    "feeLamports": 0
  }
}
```

Sıfırlar, işleminizin sayılarının yerini tutar. `SetComputeUnitPrice` değerini `data.computeUnitPrice` olarak ve birim limitini en az `data.computeUnitLimit` olarak ayarlayın; bir mikro-lamport eksik olursa yine reddedilir. `solana program deploy` ile `--with-compute-unit-price <data.computeUnitPrice>` kullanın. Yayın öncesi çalıştırmalarda normal bir program dağıtımının, yükseltmesinin, genişletmesinin, kapatmasının ve yetki değişikliğinin her adımı temel ücrete sığdı; dolayısıyla bu hatayla çoğunlukla alışılmadık büyüklükte bir `--max-len` ile karşılaşırsınız.

### Adına yapılan işlem bütçeleri {#on-behalf}

Sizin adınıza `MsgExecuteProgram`, `MsgCreateAccount` veya `MsgDeployProgram` gönderen bir authz alıcısı yalnızca pencereniz ve onun **ayrı, adına yapılan işlem bütçesi** içinde hareket eder: `on_behalf_max_txs` ve `on_behalf_max_value`. Anahtarın kendi limitleri ile adına yapılan işlem bütçesi birbirini tüketemez. Adına yapılan işlem bütçesi yoksa (varsayılan) bu tür izinler reddedilir ve hiçbir şey hareket etmez. Hesabın kendisinin alıcı olduğu bir authz yürütmesine sarılmış `MsgExecuteProgram` da sizin adınıza gönderilmiş sayılır; bu yüzden kendi SVM mesajlarınızı üst düzey mesaj olarak gönderin.

İç içe her yürütme veya dağıtım ayrıca hesabınıza SVM sabit ücretini ödetir: `max(1, compute_budget_max / 1000)` uqor; canlı parametre değeri olan 1.400.000'de bu 1.400 uqor'dur. Bu ücret adına yapılan işlem değer limitine karşı sayılır. `--on-behalf-max-value` değerini en az `on_behalf_max_txs` çarpı sabit ücret artı alıcının hareket ettirmesi beklenen değer olarak ayarlayın. 0 değeri, adına yapılan her yürütmeyi reddeder.

### Yükleyici {#loader}

| Çalıştırdığınız | Zincir üzerinde yaptığı |
| --------------- | ----------------------- |
| `solana program deploy x.so` | Programı birçok küçük işlemle bir tampona yazar, sonra dağıtır. Program kimliği `--program-id` içindeki veya yeni bir kimliktir |
| Var olan bir program için `solana program deploy --program-id <id> x.so` | Onu yükseltir. Bunu yalnızca yükseltme yetkilisi yapabilir |
| `solana program write-buffer` / `show --buffers` / `close <buffer>` | Dağıtmadan bir tampon yazar, listeler ve kapatır |
| `solana program extend <id> <bytes>` | Programın veri alanını büyütür |
| `solana program set-upgrade-authority <id> --new-upgrade-authority <key>` | Yükseltmeleri başka bir anahtara verir. `--final` programı kalıcı yapar |
| `solana program close <id>` | Programı kapatır ve kirayı iade eder |
| `anchor deploy` | Anchor ile derlenen program için aynısını yapar |

Bir program en fazla 10 MiB olabilir (canlı `max_program_size`). Programlar birbirini en fazla 4 düzey derinlikte çağırır (`max_cpi`). Varsayılan hesaplama bütçesi talimat başına 1.400.000 birime kadardır.

## Bu kılavuzda kullanılan sözcükler {#words}

| Sözcük | Sade anlamı |
| ------ | ----------- |
| SVM | QoreChain'deki Solana uyumlu sanal makine. Solana ile aynı derlenmiş programları (SBF) çalıştırır |
| Lamport | Solana araçlarındaki en küçük birim. 1 uqor 1.000 lamport, 1 QOR ise 1.000.000.000 lamporttur |
| Pencere | Bir Solana anahtarının hesabınız adına işlem yapması için kısa, sınırlı bir izin. Açmak, kuantum sonrası anahtarınızla imzalanmış bir işlem gerektirir |
| Anahtar kanıtı | Solana anahtarının kısa bir metin üzerindeki kendi imzası. Adlandırdığınız anahtara sahip olduğunuzu kanıtlar |
| Nonce | Solana anahtarı başına bir sayaç; bir kanıtla açılan her pencerede artar. Sonraki kanıtın güncel değeri imzalaması gerekir |
| Taşıyıcı | Bir Solana işlemini bir bloktan geçiren Native işlem |
| Aktarıcı | Taşıyıcıyı imzalayıp gönderen hesap. Solana ücreti ona geri ödenir |
| Blockhash (blok özeti) | Bir Solana işleminin dayandığı yakın blok özeti. 150 slot, burada yaklaşık 3,5 dakika geçerlidir |

## Başlamadan önce {#prerequisites}

macOS veya Linux üzerinde bir terminale, yaklaşık 10 QOR test QOR'a ve şu araçlara ihtiyacınız var (sağ sütundaki sürümler bu sayfa için kullanılanlardır):

| Araç | Ne için | Kullanılan sürüm |
| ---- | ------- | ---------------- |
| Solana komut satırı (Agave) | `solana`, `solana-keygen` | `solana-cli` 4.0.2 |
| Rust ve `cargo build-sbf` | Program derlemek | `cargo-build-sbf` 4.0.0, platform tools v1.53, `rustc` 1.89 |
| Anchor (isteğe bağlı) | `anchor build`, `anchor deploy` | `anchor-cli` 1.2.2 |
| Node.js 18 veya üzeri | Anahtar kanıtı betiği ve çağrı betiği | herhangi bir güncel LTS |
| `@solana/web3.js` 1.x | Programı çağırmak | 1.99 |
| `qorechaind` v3.2.9 | Kuantum sonrası anahtarınızı kaydetmek, pencereyi açmak ve kapatmak | sürüm ikili dosyası, aşağıya bakın |

Elinizde ne olduğunu kontrol edin:

```bash
solana --version
cargo build-sbf --version
anchor --version
node -v
```

**`qorechaind` hakkında.** Pencere açmak, ML-DSA-87 imzanızı gerektiren bir Native mesajdır ve `tx pqc open-svm-window` komutu v3.2.9'un parçasıdır. 22 Kasım 2026'da test ağı sürüm bildirimi (`https://download.qore.host/testnet/latest.json`) hâlâ 3.2.8 sürümünü listeliyordu; bu yüzden v3.2.9 paketi, yönetişim önerisi 39'un metninde adı geçen pakettir (`GET https://api-testnet.qore.host/cosmos/gov/v1/proposals/39`). Sürüm ikili dosyası Linux için derlenmiştir; paketlenmiş bir macOS ikili dosyası yoktur. Pencere için bir SDK yardımcısı henüz yayımlanmadı. Bu kılavuzdaki geri kalan her şey bir düğüm gerektirmez.

Ayrıca test QOR'u olan bir QoreChain hesabına ([musluktan](/dashboard/faucet) alın) ve kayıtlı bir kuantum sonrası anahtarına ihtiyacınız var. Bunu yapmadıysanız önce [Anahtarınızı kaydetme](/developer-guide/post-quantum-signing#pqc-key-registration) bölümünü izleyin. Aşağıdaki komutlar hesap anahtarına `mykey`, kuantum sonrası anahtarına `mykey-mldsa` der.

:::caution Yalnızca atılabilir test ağı anahtarları
Aşağıda oluşturduğunuz iki Solana anahtar çifti, içinde gizli anahtar bulunan dosyalardır. Başka bir ağda gerçek fon tutan bir anahtar çiftini asla kullanmayın ve gizli bir anahtarı asla bir komuta, sohbete veya depoya yapıştırmayın.
:::

## Adım adım {#steps}

Normal `solana` ayarlarınıza dokunulmaması için bir çalışma klasörü ve ayrı bir Solana yapılandırması oluşturun:

```bash
mkdir -p ~/qore-svm && cd ~/qore-svm
alias qsol='solana -C ~/qore-svm/solana-config.yml'
```

Takma ad `solana` komutunu kendi yapılandırma dosyasıyla çalıştırır. Aynı terminali kullanmaya devam edin veya yeni birinde takma adı yineleyin.

### Adım 1: Solana araçlarını test ağına yönlendirin {#step-config}

```bash
qsol config set --url https://svm-testnet.qore.host
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
qsol epoch-info
```

İlk satır RPC adresini `solana-config.yml` içine kaydeder. İkincisi düğümden sürümünü ister. `solana-core` `1.18.0-qorechain`, zincir kimliği `qorechain-diana` ve genesis özeti `6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj` değerlerini görmelisiniz (HTTP 200). Üçüncüsü, blok yüksekliğine eşit olan güncel slotu yazdırır (22 Kasım 2026'da yaklaşık 10,57 milyon).

Şerit parametreleri neyin sığacağını belirler. Bir kez okuyun:

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

`"enabled":true` değerini ve canlı test ağının limitlerini görmelisiniz: `max_program_size` 10.485.760, `compute_budget_max` 1.400.000, `lamports_per_byte` 3.480, `max_cpi` 4. `enabled` değeri `false` ise şerit kapalıdır ve aşağıdakilerin hiçbiri çalışamaz.

Herkese açık uç nokta websocket sunmaz (22 Kasım 2026'da bir websocket yükseltmesi HTTP 405 yanıtı verdi); bu yüzden bir işlemi onaylayan komutlara (`solana program deploy`, `write-buffer`) `--use-rpc` verin ve aracın düz HTTP üzerinden yoklamasına izin verin. Anchor bunu çift tireden sonra kabul eder.

### Adım 2: İki Solana anahtar çifti oluşturun {#step-keys}

```bash
solana-keygen new --no-bip39-passphrase --outfile window.json
solana-keygen new --no-bip39-passphrase --outfile deployer.json
solana-keygen pubkey window.json
solana-keygen pubkey deployer.json
```

İlk iki komut birer anahtar çifti dosyası yazar (64 sayıdan oluşan bir JSON dizisi: 32 baytlık gizli tohum, sonra açık anahtar). Son ikisi açık anahtarları base58 metni olarak yazdırır. 32 ile 44 karakter arası iki farklı adres görmelisiniz. Bunlara `WINDOW_PUBKEY` ve `DEPLOYER_PUBKEY` deyin.

Neden iki anahtar. **Pencere anahtarı** kısa bir süre Native hesabınız adına işlem yapacaktır. Kendisi hiçbir şey tutmaz; pencerenin içinde sizin QOR'unuzu harcar. **Dağıtıcı anahtarı** sıradan bir Solana anahtarıdır. Onu pencereden fonlarsınız ve bundan sonra pencere olmadan programı dağıtır, yükseltir ve sahiplenir. Pencere anahtarını yükseltme yetkilisi olarak kullanmayın: program yetkili olarak Native hesabınızı kaydeder ve `solana`, kayıtlı yetkili olmayan bir anahtarın imzaladığı yükseltmeyi reddeder.

Dağıtıcı anahtarını Solana yapılandırmanızın varsayılan imzalayanı yapın:

```bash
qsol config set --keypair ~/qore-svm/deployer.json
```

### Adım 3: Kuantum sonrası anahtarınızı kaydedin {#step-pqc}

`qorechaind query pqc account <your qor address>` zaten bir anahtar gösteriyorsa bu adımı atlayın. Aksi halde, sürüm `qorechaind` ikili dosyasının bulunduğu bir makinede:

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

qorechaind tx pqc gen-key mykey-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mykey-mldsa \
  --from mykey --chain-id $QCHAIN --node $QNODE --gas 600000 --fees 60000uqor -y
qorechaind query pqc account <your qor address> --node $QNODE
```

`gen-key` ML-DSA-87 anahtarını oluşturur ve açık anahtarını onaltılık olarak yazdırır. `register-key-v2` onu sahiplik kanıtıyla birlikte hesabınıza ekler. Sorgu kayıtlı anahtarı göstermelidir. Bu, yeni bir hesabın yalnızca klasik anahtarla imzalayabileceği tek işlemdir. Anahtarı nasıl yedekleyeceğiniz dahil tam açıklama [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing#pqc-key-registration) sayfasındadır.

### Adım 4: Anahtar kanıtını oluşturun {#step-proof}

Kanıt, pencere anahtarının şu tam metin üzerindeki Ed25519 imzasıdır; metin UTF-8 olarak, boşluksuz ve sonunda satır sonu olmadan kodlanır:

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>
```

Daha önce bir veya daha fazla pencere açmış bir anahtar için nonce `N`, bir `|` daha eklenerek sona gelir:

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>|<N>
```

`N`, o anahtar için bir kanıtla açılmış pencere sayısıdır; ondalık olarak, işaretsiz ve baştaki sıfırlar olmadan yazılır. Yeni bir anahtar için `N` 0'dır ve sonek yoktur. İmza düz Ed25519'dur (RFC 8032): ön özet yok, bağlam yok ve Solana zincir dışı mesaj başlığı yok; dolayısıyla bir cüzdan ham UTF-8 baytlarını imzalamalıdır.

Metni elle oluşturmayın. Zincirden isteyin:

```bash
curl -s "https://api-testnet.qore.host/qorechain/pqc/v1/svm_window_key_proof/<WINDOW_PUBKEY>?sender=<your qor address>"
```

Yanıt nonce'u ve tam metni taşır:

```json
{"svm_pubkey":"9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","nonce":"0","key_proof_required":true,"sign_bytes":"qorechain-svm-window-key-v1|qorechain-diana|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","chain_id":"qorechain-diana"}
```

Bu, örnek bir adres için 22 Kasım 2026'daki canlı yanıttır. `sign_bytes` değerini pencere anahtarıyla imzalayın. Aşağıdaki betik, yalnızca Node.js kullanarak her iki adımı da yapar (`keyproof.mjs` olarak kaydedin):

```js
// node keyproof.mjs <solana-keypair.json> <your qor address>
import { readFileSync } from "node:fs";
import { createPrivateKey, sign } from "node:crypto";

const REST = "https://api-testnet.qore.host";
const [keypairPath, sender] = process.argv.slice(2);

// A solana-cli keypair file: JSON array of 64 bytes, the 32-byte seed first, then the public key.
const bytes = Uint8Array.from(JSON.parse(readFileSync(keypairPath, "utf8")));
const seed = bytes.slice(0, 32);

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58(buf) {
  let n = 0n;
  for (const b of buf) n = n * 256n + BigInt(b);
  let out = "";
  while (n > 0n) { out = ALPHABET[Number(n % 58n)] + out; n /= 58n; }
  for (const b of buf) { if (b === 0) out = "1" + out; else break; }
  return out;
}
const pubkey = base58(bytes.slice(32));

// The chain knows its id and the key's nonce, so it gives the exact text.
const url = `${REST}/qorechain/pqc/v1/svm_window_key_proof/${pubkey}?sender=${sender}`;
const info = await (await fetch(url)).json();
console.log("nonce:", info.nonce);
console.log("text to sign:", info.sign_bytes);

// Pure Ed25519 over the UTF-8 bytes of the text.
const pkcs8 = Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), Buffer.from(seed)]);
const key = createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" });
const proof = sign(null, Buffer.from(info.sign_bytes, "utf8"), key);
console.log("svm_key_proof (hex):", proof.toString("hex"));
```

```bash
node keyproof.mjs window.json <your qor address>
```

`nonce: 0`, metni ve 128 karakterlik bir onaltılık dize görmelisiniz. Onaltılık dizeyi saklayın. **Bir pencere** için ve yalnızca bu gönderen, anahtar ve zincir için geçerlidir.

**Kodunuzu yayımlanmış bir örnekle kontrol edin.** Zincir kimliği `qorechain-diana`, gönderen `qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d` (`0x11` değerinin 20 baytı), nonce 0:

| Alan | Değer |
| ---- | ----- |
| Açık anahtar (base58) | `9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| Açık anahtar (onaltılık) | `79b5562e8fe654f94078b112e8a98ba7901f853ae695bed7e0e3910bad049664` |
| Mesaj (131 bayt) | `qorechain-svm-window-key-v1\|qorechain-diana\|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d\|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| İmza (onaltılık) | `786b449dcd4b85c2225819c9ac993fbe97a2cfdce7f9ffba07e6895fad0b9b8d3a0634aae5b21d28d366590b3858c7085c8c856a90770fd919ee1bff728b0801` |

Nonce 1 ile mesaj 133 bayttır ve `|1` ile biter. Yukarıdaki betik bu imzayı 22 Kasım 2026'da eşleşen anahtardan yeniden üretti. Kodunuz aynı girdiler için başka baytlar üretirse olağan nedenler sondaki satır sonu, bir ön özet, Solana zincir dışı başlığı veya yanlış değerde bir nonce'tur.

Betiği çalıştırmanız gerekmez: sonraki adımdaki komut anahtar çifti dosyasıyla kendi başına imzalayabilir (`--svm-keypair`). Anahtar başka bir yerde, örneğin düz bir mesaj imzalayabilen bir cüzdanda duruyorsa betiği kullanın ve sonucunu `--svm-key-proof` ile verin.

### Adım 5: Pencereyi açın {#step-open}

İşlemi oluşturun, sonra kuantum sonrası imzayı ekleyin. Bu örnek 3.600 blokluk (yaklaşık 85 dakika), en fazla 10 işlemlik ve toplamda 10 QOR'luk (değer artı ücretler) bir pencere açar; System programı (transferler) ve yükleyici (dağıtımlar) ile sınırlıdır:

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana
SYS=11111111111111111111111111111111
LOADER=BPFLoaderUpgradeab1e11111111111111111111111

qorechaind tx pqc open-svm-window <WINDOW_PUBKEY> 3600 10 10qor \
  --allowed-programs $SYS,$LOADER \
  --svm-keypair ~/qore-svm/window.json \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-open.json

qorechaind tx pqc cosign window-open.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

İlk komut `window-open.json` dosyasını oluşturur. Konumsal bağımsız değişkenler Solana açık anahtarı, blok sayısı, işlem sayısı ve değerdir. Nonce'u zincirden okur ve anahtar kanıtını `window.json` ile imzalar. İkinci komut ML-DSA-87 imzanızı ekler ve işlemi gönderir. Bir işlem özeti ve kod 0 görmelisiniz.

Kanıtı betikten kullanmak için `--svm-keypair ...` yerine `--svm-key-proof <hex from Step 4>` yazın. İkisini de vermezseniz komut reddeder ve imzalanacak tam metni yazdırır. Anahtar daha önce pencere açtıysa komut nonce'u kendisi okur; `--svm-key-proof` ile onu `--svm-key-nonce <N>` ile sabitleyebilirsiniz.

Pencereyi geri okuyun:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/svm_window/<your qor address>
qorechaind query pqc svm-window <your qor address> --node $QNODE
```

`"found":true` ve `"live":true` değerlerini; ayrıca `max_txs`, `used_txs`, `max_value`, `used_value`, `remaining_blocks`, `remaining_txs`, `remaining_value`, `allowed_programs` ve `true` olan `key_proven` alanlarını görmelisiniz. Pencereyi Solana anahtarıyla da okuyabilirsiniz: `GET /qorechain/pqc/v1/svm_window_by_key/<WINDOW_PUBKEY>`. `key_proof_required`, `key_usable` ve `key_proof_nonce` (imzalanacak sonraki değer) alanları da oradadır.

Program listesi System programını ve yükleyiciyi adlandırır, çünkü test edilen birleşim budur. Bu kılavuzda pencere anahtarı yalnızca transfer yapar ve dağıtımı dağıtıcı yapar. Pencere anahtarının bir dağıtımı doğrudan ödemesine bir gün izin verirseniz liste iki programı da adlandırmalıdır.

### Adım 6: Dağıtıcıyı fonlayın {#step-fund}

Pencere açıkken pencere anahtarı sizin QOR'unuzu harcar. Dağıtıcıya 5 QOR gönderin:

```bash
qsol balance <WINDOW_PUBKEY>
qsol transfer <DEPLOYER_PUBKEY> 5 --keypair ~/qore-svm/window.json --allow-unfunded-recipient
qsol balance <DEPLOYER_PUBKEY>
```

İlk satır, pencere anahtarının gördüğü şekliyle yerel bakiyenizi gösterir ("SOL" olarak, QOR diye okuyun). İkincisi 5 QOR gönderir; `--keypair` bayrağı bu tek komut için pencere anahtarını imzalayan yapar ve `--allow-unfunded-recipient` gereklidir, çünkü dağıtıcı henüz hiçbir şey tutmuyor. Üçüncüsü `5 SOL`, yani 5 QOR göstermelidir. Transfer hesabınıza toplamda 5,045 QOR'a mal olur: 5 QOR artı 0,045 QOR temel ücret; pencere sayaçları (`used_txs` 1, `used_value` 5.045.000) bunu gösterir.

Bu `this node relays no Solana transactions` ile reddedilirse bkz. [Herkese açık ağ geçidi olmadan göndermek](#relay).

### Adım 7: Küçük bir program derleyin {#step-build}

```bash
cargo init --lib hello
cd hello
```

`Cargo.toml` dosyasını şununla değiştirin:

```toml
[package]
name = "hello"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
solana-program = "2.2"
```

`src/lib.rs` dosyasını şununla değiştirin:

```rust
use solana_program::{account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg, pubkey::Pubkey};

entrypoint!(process_instruction);

fn process_instruction(_program_id: &Pubkey, _accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    msg!("hello from QoreChain, {} data bytes", data.len());
    Ok(())
}
```

```bash
cargo build-sbf
ls -l target/deploy
```

Bu, programı SBF için derler. `hello.so` (yaklaşık 19 KB) ve `hello-keypair.json` dosyalarını görmelisiniz; ikincisi, adresi program kimliği olan anahtardır. `unexpected cfg` ile ilgili derleyici uyarıları zararsızdır. Program bir günlük satırı yazar ve başka hiçbir şey yapmaz.

### Adım 8: Dağıtın {#step-deploy}

```bash
qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc
```

Bu, programı yaklaşık 20 küçük işlemle yazar ve sonra dağıtır. `solana` önce maliyeti tahmin eder ve bakiyenizi kontrol eder: 18.896 baytlık derleme için 22 Kasım 2026'da 0,133 QOR harcama (kira) ve 1,035 QOR ücret yazdırdı; bu, 0,045 QOR'dan 23 işlemdir. `Program Id: <address>` ile bitmelisiniz. Kontrol edin:

```bash
qsol program show <program id>
```

Program kimliğini, yükleyiciyi (`BPFLoaderUpgradeab1e11111111111111111111111`), bir ProgramData adresini, **yetkiliyi** (dağıtıcı anahtarınız), dağıtım slotunu ve veri uzunluğunu görmelisiniz. Dağıtımı başlatıp yarıda kalırsa `solana`, geçici tampon anahtarı için 12 kelimelik bir kurtarma ifadesi yazdırır. Dağıtım bitene kadar saklayın: onunla, kurtarılan anahtar çiftini sonraki `program deploy` veya `write-buffer` komutuna vererek aynı tampondan devam edersiniz ve tamponu kapatıp kirasını geri alabilirsiniz.

Anchor ile derlenmiş bir program için, yayın öncesi çalıştırmalarda olduğu gibi `solana program deploy` komutuna `--skip-feature-verify` ekleyin.

#### Anchor ile {#anchor}

```bash
anchor init counter
cd counter
anchor build
anchor deploy --provider.cluster https://svm-testnet.qore.host \
  --provider.wallet ~/qore-svm/deployer.json -- --use-rpc
```

`anchor build` şablon programı derler ve `anchor deploy` onu `declare_id!` içindeki program kimliğine dağıtır. Bir şablon program yaklaşık 130 KB'tır; bu, 0,045 QOR'dan yaklaşık 130 yazma işlemidir, bu yüzden önce dağıtıcıyı en az 10 QOR ile fonlayın. Yayın öncesi çalıştırmada 128 KB'lık bir program yaklaşık 6,8 QOR'a mal oldu; çoğu yazma ücretiydi ve kira kapatmada geri geldi. Kod değişikliğinden sonra ikinci bir `anchor deploy` programı yükseltir. Anchor, yerel bir adres için IDL yüklemesini atlar; test ağına IDL yüklemesi test edilmedi.

### Adım 9: Programı çağırın {#step-call}

`solana` rastgele bir programı çağıramaz; bu yüzden kısa bir web3.js betiği kullanın. Boş bir klasörde:

```bash
npm init -y
npm install @solana/web3.js@1
```

`call.cjs` olarak kaydedin:

```js
// node call.cjs <payer keypair.json> <program id> [data as text]
const fs = require("fs");
const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");

const RPC = "https://svm-testnet.qore.host";
const [payerPath, programId, text = "hi"] = process.argv.slice(2);
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(payerPath, "utf8"))));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const conn = new Connection(RPC, "confirmed");
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash }).add(
    new TransactionInstruction({ programId: new PublicKey(programId), keys: [], data: Buffer.from(text) }),
  );
  tx.sign(payer);

  const signature = await conn.sendRawTransaction(tx.serialize()); // preflight runs on the gateway
  console.log("signature:", signature);

  // The public endpoint serves no websocket, so poll instead of confirmTransaction.
  for (;;) {
    const { value } = await conn.getSignatureStatuses([signature]);
    if (value[0]) { console.log("status:", value[0].confirmationStatus, "err:", JSON.stringify(value[0].err)); break; }
    if ((await conn.getBlockHeight()) > lastValidBlockHeight) throw new Error("blockhash expired, build and send again");
    await sleep(1500);
  }
  const t = await conn.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
  console.log("fee (lamports):", t.meta.fee);
  console.log((t.meta.logMessages || []).join("\n"));
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
```

```bash
node call.cjs ~/qore-svm/deployer.json <program id> "hello"
```

Betik programınız için bir talimat oluşturur, dağıtıcı anahtarıyla imzalar, gönderir, imzanın bir durumu olana kadar yoklar ve programın günlüğünü yazdırır. Ücret ödeyen dağıtıcıdır; bu yüzden pencere gerekmez. Bir imza, `status: finalized err: null`, `fee (lamports): 45000000` ve şuna benzer günlükler görmelisiniz (biçim yayın öncesi çalıştırmadan; mesaj programınızın kendisine aittir):

```text
Program <program id> invoke [1]
Program log: hello from QoreChain, 5 data bytes
Program <program id> consumed ... compute units
Program <program id> success
```

### Adım 10: Sonucu okuyun {#step-read}

| İstediğiniz | Komut veya çağrı |
| ----------- | ---------------- |
| Bir işlemin durumu | `qsol confirm -v <signature>` veya `getSignatureStatuses` |
| Günlükleri, ücreti ve bakiye değişiklikleri | `maxSupportedTransactionVersion: 0` ile `getTransaction` (yukarıdaki betik) |
| Program ve yetkilisi | `qsol program show <program id>` |
| Dağıtıcının tüm programları | `qsol program show --programs` |
| Bir veri hesabı | `qsol account <address>` veya `getAccountInfo` |
| Pencereniz, hesaba veya anahtara göre | `GET /qorechain/pqc/v1/svm_window/<address>` ve `.../svm_window_by_key/<pubkey>` |

Bir blok içinde başarısız olan bir işlem (örneğin ağ geçidinin ön kontrolünü `--skip-preflight` ile atladığınız için) yine de imzasını korur ve ücretini öder; etkileri geri alınır. Yayın öncesi çalıştırmada pencerenin değer limitini aşan ve `--skip-preflight` ile gönderilen bir transfer bloğa girdi ve `Error processing Instruction 0: generic instruction error` ile başarısız oldu, transfer geri alındı. `--skip-preflight` olmadan daha önce, ağ geçidinde `-32002 ... SVM authorisation window exhausted` ile reddedilir.

### Adım 11: Yükseltin, devredin, genişletin ve kapatın {#step-admin}

Bunların hepsi imzalayan olarak dağıtıcı anahtarını kullanır ve pencere gerektirmez.

| Görev | Komut |
| ----- | ----- |
| Kod değişikliğinden sonra yükseltme | `qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc` |
| Veri alanını N bayt büyütme | `qsol program extend <program id> N` |
| Yükseltmeleri başka bir anahtara verme | `qsol program set-upgrade-authority <program id> --new-upgrade-authority <new.json>` |
| Programı kalıcı yapma | `qsol program set-upgrade-authority <program id> --final` |
| Dağıtmadan tampon yazma, tamponları listeleme | `qsol program write-buffer x.so --use-rpc`, sonra `qsol program show --buffers` |
| Bir tamponu kapatma veya programı kapatıp kirayı geri alma | `qsol program close <buffer or program id>` (bir program ayrıca `--bypass-warning` ister) |

Yetkili olmayan herhangi bir anahtarın yaptığı yükseltme reddedilir. `set-upgrade-authority` sonrasında eski yetkili reddedilir ve yenisi yükseltebilir. `--final` sonrasında yükseltme, programın artık yükseltilemez olduğunu söyleyen bir mesajla reddedilir. Kapatılmış bir program yeniden çağrılamaz ve `program show` kapatıldığını söyler.

### Adım 12: Pencereyi kapatın {#step-close}

İşiniz bittiğinde pencereyi kapatabilirsiniz ve Solana anahtarının açığa çıktığını düşünüyorsanız hemen kapatmalısınız. Pencerenin hâlâ kabul edeceği her şey bir sonraki bloktan itibaren reddedilir:

```bash
qorechaind tx pqc close-svm-window --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-close.json
qorechaind tx pqc cosign window-close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Pencereyi yeniden okuyun: artık canlı olmamalı ve `qsol balance <WINDOW_PUBKEY>` yine 0 göstermelidir. Pencere anahtarı artık QOR'unuzu hareket ettiremez. Pencere üzerinden oluşturduğunuz dağıtıcı anahtarı, program ve fonlar sizin olarak kalır.

Aynı anahtar için yeni bir pencere açmak üzere Adım 4'ü yeniden çalıştırın: nonce artık daha yüksektir ve eski pencere için yapılmış bir kanıt `expected_nonce` ile reddedilir.

## Herkese açık ağ geçidi olmadan göndermek {#relay}

`svm-testnet.qore.host` adresindeki herkese açık ağ geçidi 22 Kasım 2026'da aktarmayı reddetti (üstteki kutuya bakın). Aktarana kadar göndermenin iki yolu vardır.

**Komut satırı üzerinden tek bir işlem.** QOR tutan ve kayıtlı bir kuantum sonrası anahtarı olan herhangi bir yerel hesap, imzaladığınız bir Solana işlemini taşıyabilir. Önce Solana işlemini, örneğin web3.js ile oluşturun ve imzalayın, sonra base64 olarak yazdırın (`tx.serialize().toString("base64")`). Bir işlem, kullandığı blok özetinden sonra yaklaşık 3,5 dakika geçerlidir. Sonra:

```bash
qorechaind tx svm solana-tx <base64 transaction> --from mykey \
  --chain-id $QCHAIN --node $QNODE --gas <GAS> --fees <FEES>uqor --generate-only > relay.json
qorechaind tx pqc cosign relay.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

`--gas` ve `--fees` değerlerini bir deneme çalıştırmasıyla belirleyin: önce `tx pqc cosign` komutunu `--dry-run` ile çalıştırın (gaz tahmini yazdırır, hiçbir şey göndermez), sonra tahmini artı %30 değerini `<GAS>`, en az `<GAS>` çarpı 0,1 uqor tutarını `<FEES>` olarak kullanın. Basit bir transfer yaklaşık 300.000 ile 400.000 gaz tutar; bir deploy veya kod taşıyan bir öneri çok daha fazlasına ihtiyaç duyar.

Test ağında ölçüldü: bu şekilde aktarılan basit bir transfer 327.570 gaz kullandı, bu yüzden `--gas 400000 --fees 40000uqor` kullanın; 300.000 ile gaz biter. Ödeyene ayrıca imzaladığı Solana ücreti de yansıtılır (45.000.000 lamport, 0,045 QOR).

`--from` içindeki hesap aktarıcıdır. Taşıyıcıyı imzalar ve gazını öder; Solana ücret ödeyeni ona geri öder. Aktarıcı Solana işlemi üzerinde hiçbir yetki kazanmaz. Taşıyıcının ücreti, Solana işleminin ödediği tutarla karşılanmalıdır: bir imza için 45.000 uqor. Bu, bir transfer veya çağrı için pratiktir; çok sayıda yazma işleminden oluşan bir dağıtım için değil. Bu yol bu sayfa için canlı test ağında çalıştırılmadı.

**Kendi ağ geçidiniz.** Test ağını izleyen ve v3.2.9 ikili dosyasını çalıştıran bir düğüm, Solana JSON-RPC'yi 8899 portunda sunar ve `app.toml` dosyasındaki `[svm-rpc]` bölümü bir aktarıcı adlandırdığında aktarır: `relayer-key` (düğümün anahtar halkasındaki fonlu bir hesap, veya virgülle ayrılmış birkaçı), `relayer-pqc-key` (bunların düğümün `pqc` klasörü altındaki ML-DSA-87 anahtarları) ve `relayer-keyring-backend`. `relayer-key` boşken `sendTransaction`, bugün herkese açık uç noktada olduğu gibi reddedilir. `relayer-fee` alanını boş bırakın: aktarıcı o zaman her taşıyıcıyı Solana işleminin ödediği tutardan fiyatlar ve hiçbir zaman zarar etmez. Sürüm paketinin `lib/` klasörünün tamamını kopyalayın. Bu kurulum bu sayfa için çalıştırılmadı; düğümün kendisi için bkz. [Bir Düğüm Çalıştırma](/developer-guide/running-a-node).

## Planlanacak limitler {#limits}

* **Aktarma kotası.** Bir ağ geçidi üzerinden gönderilen Solana işlemi ücret ödeyenine karşı sayılır: varsayılanda 30 blokta 600, yani bir dakikanın epey altında. Tek bir anahtardan büyük bir dağıtım bunu aşabilir (1 MB'lık bir program yaklaşık 1.100 yazmadır). Reddedilen yazmalar bir şeye mal olmaz. Önce tamponu `qsol program write-buffer` ile yazın, bir dakika bekleyin ve durursa aynı tamponla yeniden çalıştırın; sonra `--buffer` ile tampondan dağıtın veya tampon yazmalarını ve dağıtımı farklı ücret ödeyenlerle ödeyin.
* **Ağ geçidi adil payı.** Bir ağ geçidi kapasitesinin bir kısmını az işlem göndermiş istemciler için ayırır ve gerisini etkin istemci ağları arasında eşit paylaştırır. Adil pay mesajıyla (kod `-32005`) reddedilirseniz bir dakika bekleyin veya başka bir ağ geçidi kullanın.
* **İşlem, blok özeti süresi dolmadan önce bloğa girmelidir** (150 slot). `solana` sizin için yeniden gönderir; bir betik de aynısını yapmalıdır.
* **Bir işlem en fazla 1.232 bayttır ve en fazla 64 hesap içerir,** Solana'da olduğu gibi. Eski ve sürüm 0 mesajları kabul edilir.
* **Programlar ve hesaplar:** her biri 10 MiB; çerçeve başına 32 KiB yığın (stack) ve 256 KiB öbek (heap).
* [SVM Şeridi (v3.2.8)](/developer-guide/svm-lane-v328#custody) sayfasındaki **saklama limitleri** hâlâ geçerlidir: SVM havuzu üst sınırdayken bir yatırma `svm custody cap exceeded` (kod 23) ile reddedilebilir.
* **Pencere listesindeki adlar.** `--allowed-programs` base58 program kimlikleri alır, en fazla 16, her biri yalnızca bir kez. Kapsam, işlemin üst düzey talimatlarına uygulanır: başka programları çağıran listelenmiş bir program imzanızı da yanında taşır; bu yüzden yalnızca bütün olarak güvendiğiniz programları listeleyin.
* **Adresler.** Yeni bir v3.2.9 mesajı, kanonik küçük harf biçiminde olmayan bir bech32 adresini reddeder. `toBech32` ürettiği biçimi gönderin.

## Sorun giderme {#troubleshooting}

"Canlı" işaretli metinler 22 Kasım 2026'da canlı test ağında görüldü. Diğerleri, yayın öncesi çalıştırmalarda görüldüğü şekliyle zincirin ve ağ geçidinin kendi mesajlarıdır.

| Gördüğünüz | Ne anlama gelir | Ne yapmalı |
| ---------- | --------------- | ---------- |
| `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)` (JSON-RPC kodu `-32603`, canlı) | Ağ geçidinin aktarıcı hesabı yok | [Kendi ağ geçidinizi veya komut satırı aktarımını](#relay) kullanın ya da operatörleri bekleyin |
| `Error: Account <key> has insufficient funds for spend (X SOL) + fee (Y SOL)` (canlı, `solana` çıktısı) | Anahtar hiçbir şey tutmuyor. SOL'u QOR diye okuyun | Pencereyi açıp anahtarı fonlayın veya pencereyi açıp pencere anahtarını imzalayan olarak kullanın |
| Simülasyon `InsufficientFundsForFee`, günlük `fee payer ... has no account: insufficient fee` (canlı) | Aynı neden, bir simülasyondan görülmüş hali | Aynı çözüm |
| `invalid solana transaction: no signatures`, `truncated: need 2 bytes at 1` (kod `-32602`, canlı) | Baytlar imzalı bir Solana işlemi değil | Tam imzalı kablo işlemini, base64 veya base58 olarak gönderin |
| Bir websocket yükseltmesinde HTTP 405 (canlı) | Herkese açık uç nokta websocket sunmaz | `solana program deploy` ve `write-buffer` komutlarına `--use-rpc` ekleyin; betiklerde `getSignatureStatuses` ile yoklayın |
| `-32002 ... insufficient priority fee ...` | İşlem, taşıyıcısının maliyetinden az ödüyor | ComputeBudget fiyatını ve birim limitini hata `data` alanından ayarlayın; bkz. [Ücretler](#fees) |
| `-32002 ... SVM authorisation window exhausted` | Pencerenin blokları, işlemleri veya değeri tükendi ya da işlem değeri aşacak | Pencereyi okuyun, daha yüksek değer veya daha fazla işlemle yenisini açın |
| `no open SVM authorisation window` (codespace `pqc`, kod 341) | Anahtarın canlı penceresi yok | Bir tane açın (Adım 5) |
| Açma, kod 343 ve `expected_nonce=<N>` ile reddedilir | Kanıt başka bir nonce üzerinden imzalandı, örneğin eski bir kanıt | Nonce rotasını yeniden okuyun (Adım 4), yeniden imzalayın |
| `the key proof does not verify for <key>, sender <qor address>, chain <id>` (CLI) | İmza metinle eşleşmiyor | Nonce rotasındaki `sign_bytes` değerini, doğru anahtar ve gönderenle aynen imzalayın |
| `--svm-keypair holds the key X, not Y` (CLI) | Anahtar çifti dosyası adlandırdığınız anahtar değil | Base58 anahtarla eşleşen anahtar çiftini kullanın |
| `the window needs the proof that you hold the Solana key` (CLI) | `--svm-keypair` ve `--svm-key-proof` bayraklarından hiçbirini vermediniz | Birini verin; mesaj imzalanacak metni yazdırır |
| `blocks must be between 1 and 17280`, `max_txs must be between 1 and 1000`, `max_value must be positive`, `allowed_programs lists N programs, the maximum is 16` | Bir pencere sınırı aralığın dışında | [Pencere](#window) bölümündeki tablodaki değerleri kullanın |
| `svm_pubkey ... is not a valid ed25519 public key` veya `... is a native account address, not an ed25519 key` | Anahtar bir program adresi veya QoreChain adreslerinizden biri | `solana-keygen` ile üretilmiş bir anahtar çifti kullanın |
| `sender sol:<payer> has sent 600 transactions in the last 30 blocks` | Bir ücret ödeyenin aktarma kotası | Bir dakika bekleyin, aynı tamponla devam edin; bkz. [Limitler](#limits) |
| `fair share of the relayer quota` ile `-32005` | Ağ geçidi kapasitesini paylaştırıyor | Bir dakika sonra yeniden deneyin |
| `-32020 node is starting, no committed state` | Düğümün henüz durumu yok | Birkaç saniye sonra yeniden deneyin |
| `node busy: the carrier could not be measured now, retry` | Ağ geçidi taşıyıcıyı şu anda fiyatlayamadı | Yeniden deneyin |
| `Transaction simulation failed: Blockhash not found` | Blok özeti 150 slottan eski veya bilinmiyor | Yeni bir blok özeti alın, imzalayın ve yeniden gönderin |
| `Transaction simulation failed: This transaction has already been processed` | Aynı imzalı işlem daha önce görüldü | `getSignatureStatuses` kontrol edin; yeniden göndermeyin |
| Bir Solana işlemi `cannot approve a delegate`, `cannot hand over the ownership`, `cannot hand over the close authority` veya `cannot change the mint or freeze authority` ile, `the grant would outlive the window` mesajıyla reddedilir | Varsayılan kapsamlı bir pencere kalıcı token izinlerini reddeder | Bu eylemi Native şeritte kendi kuantum sonrası anahtarınızla imzalayın veya program listesi token programını adlandıran bir pencere açın (bkz. [Bilinen limitler](#window-limits)) |
| `SVM module is disabled` (kod 11) | Şerit kapalı. Bu, ana ağ durumudur | Test ağını kullanın |
| `svm custody cap exceeded` (kod 23) | SVM havuzu üst sınırda | Daha sonra veya daha küçük bir tutarla yeniden deneyin |
| Anchor ile derlenmiş bir programın `solana program deploy` komutu, programın özellikleri yüzünden istemci tarafında reddedilir | Araç ELF özelliklerini kontrol eder | `--skip-feature-verify` ekleyin |
| Pencere anahtarının yaptığı yükseltme `solana` tarafından reddedilir | Kayıtlı yetkili anahtar değil, Native hesabınızdır | Bu kılavuzdaki gibi ayrı bir dağıtıcı anahtarıyla dağıtın |
| Pencere açma veya kapatma authz, grup veya bir sözleşme altında reddedilir | Pencereler yalnızca kendi imzanızla açılır ve kapatılır | Mesajı hesabınızdan üst düzey mesaj olarak gönderin |

## Neler kontrol edildi {#tested}

| Kontrol | Nerede ve ne zaman | Sonuç |
| ------- | ------------------ | ----- |
| `GET /qorechain/svm/v1/params` ve `/cluster_info` | canlı test ağı, 22 Kasım 2026 | `enabled` ve `execution_enabled` ikisi de `true` |
| `getHealth`, `getVersion`, `getGenesisHash`, `getLatestBlockhash` (base58), `getMinimumBalanceForRentExemption(1024)` | canlı test ağı, 22 Kasım 2026 | `ok`; `1.18.0-qorechain`; genesis özeti yukarıdaki gibi; 44 karakterlik base58 blok özeti; 8.017.920 lamport |
| Bir imzalı transfer için `getFeeForMessage` ve `simulateTransaction` | canlı test ağı, 22 Kasım 2026 | ücret 45.000.000 lamport (0,045 QOR); fonsuz bir ödeyen `InsufficientFundsForFee` verir |
| Anahtar kanıtı nonce rotası ve pencere rotaları | canlı test ağı, 22 Kasım 2026 | nonce 0, `sign_bytes` Adım 4'teki gibi; penceresi olmayan bir adres için `found` `false` |
| Adım 4 anahtar kanıtı betiği, yayımlanmış örneğe karşı | canlı test ağı rotası, 22 Kasım 2026 | imza tablodakiyle aynı |
| `cargo build-sbf` ile program derlemesi (4.0.0, platform tools v1.53) | yerel makine, 22 Kasım 2026 | 18.896 baytlık `hello.so` |
| Fonsuz bir anahtardan `solana program deploy` maliyet tahmini | canlı test ağı, 22 Kasım 2026 | istemci tarafında 0,133 QOR harcama ve 1,035 QOR ücretle reddedildi |
| İyi biçimlendirilmiş bir transferin `sendTransaction` çağrısı | canlı test ağı, 22 Kasım 2026 | reddedildi: `this node relays no Solana transactions` |
| Herkese açık uç noktada websocket yükseltmesi | canlı test ağı, 22 Kasım 2026 | HTTP 405 |
| Pencere açma, pencere anahtarından `solana transfer`, dağıtım, çağrı, yükseltme, yetki ayarlama, genişletme, kapatma, `anchor deploy` ve yükseltme | yayından önce yerel test ağı, `solana-cli` 4.0.2, `anchor-cli` 1.2.2, `@solana/web3.js` 1.99 | geçti |
| Aynı adımlar canlı test ağında | çalıştırılmadı: herkese açık ağ geçidi 22 Kasım 2026'da hiçbir şey aktarmadı ve bu sayfa için test QOR harcanmadı | çalıştırılmadı |

## Ana ağ {#mainnet}

Ana ağ bunların hiçbirini içermeyen bir sürüm çalıştırır: SVM şeridi orada kapalıdır, herkese açık SVM uç noktaları salt okunurdur, VM'ler arası çağrılar duraklatılmış kalır ve sözleşme yüklemesi yalnızca yönetişimle yapılır. Ana ağa karşı pencere açmayın, dağıtım yapmayın veya Solana işlemleri göndermeyin; yalnızca test ağına göre plan yapın.

## Ayrıca bakın {#see-also}

* [SVM Şeridi (v3.2.8)](/developer-guide/svm-lane-v328): şerit durumu, kira, saklama limitleri ve bir SVM cüzdanının kuantum sonrası anahtarı.
* [SVM Geliştirme](/developer-guide/svm-development): şeride genel bakış ve JSON-RPC sunucusu.
* [Solana Uyumlu JSON-RPC](/api-reference/json-rpc-solana-compatible): yöntem listesi.
* [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing): ML-DSA-87 anahtarınızı kaydetme ve kullanma.
* [EVM Yetkilendirme Penceresi Başvurusu](/developer-guide/evm-window-reference): Ethereum tarzı anahtarlar için aynı fikir.
* [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability): SVM, EVM ve QoreChain Native arasındaki çağrılar.
* [Sürüm Geçmişi](/appendix/version-history#v329): v3.2.9'un neleri değiştirdiği.
