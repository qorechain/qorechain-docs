---
slug: /light-node/registration-and-licensing
title: Kayıt ve Lisanslama
sidebar_label: Kayıt ve Lisanslama
sidebar_position: 4
---

# Kayıt ve Lisanslama

[%3 hafif düğüm ödül payına](/light-node/rewards-and-monitoring) katılmak için bir hafif düğümün **zincir üzerinde kayıtlı** olması ve canlı olduğunu kanıtlamaya devam etmesi gerekir. Bu sayfa zincirin neler gerektirdiğini, nasıl lisans alınacağını, düğümün kendini nasıl kaydettiğini ve canlılığını nasıl kanıtladığını ele alır.

:::note Kayıt açık
Kayıt ana ağda (`qorechain-vladi`) ve test ağında (`qorechain-diana`) açıktır. Bir düğümü çalıştırmak ve senkronize etmek lisans gerektirmez. Güncel durumu nasıl kontrol edeceğiniz için [Ödül programının durumu](/light-node/overview#reward-program-status) sayfasına bakın.
:::

## Zincir üzerinde kayıt

Kayıt işlemi, hafif düğümünüzü zincire yazarak protokolün onun varlığından, türünden (`sx` veya `ux`) ve hangi operatör hesabı tarafından kontrol edildiğinden haberdar olmasını sağlar. Kaydedildikten ve canlı hale geldikten sonra düğüm, hafif düğüm ödül payı için uygun hale gelir.

### Gereksinimler {#requirements}

Kayıt işleminiz yürütülürken zincir bunların hepsini kontrol eder:

1. Operatör adresinde aktif bir `lightnode_operator` lisansı.
2. Aynı adresten **bağlı (bonded)** doğrulayıcılara en az **1.000 QOR delege edilmiş** olması (herhangi bir sayıda doğrulayıcı genelindeki toplamınız; hapsedilmiş (jailed) veya bağı çözülmüş (unbonded) doğrulayıcılara yapılan delegasyonlar sayılmaz).
3. **1 QOR** kayıt ücretini ve işlem ücretlerini ödemek için operatör hesabında bakiye. Düğüm ayrıca her kalp atışı için bu hesaptan ücret öder: yerel imzalamada ücret gaz birimi başına 0,25 uqor'dur; dolayısıyla varsayılan 300.000 `[heartbeat] gas` değerinde 75.000 uqor (0,075 QOR) eder; günde yaklaşık 25 kalp atışıyla bu, ayda yaklaşık 1,9 QOR'dur.
4. Ağ genelinde kayıtlı 10.000'den az hafif düğüm.

Kayıttan sonra düğümün ödeme alabilmesi için her **1.000 blokta** bir kalp atışı göndermesi (100 blokluk tolerans payıyla) ve en az **%80 çalışma süresini** koruması gerekir. Canlı değerleri `GET https://api.qore.host/qorechain/lightnode/v1/params` ile okuyun (test ağı: `https://api-testnet.qore.host`).

### Operatör hesabı {#operator-account}

Kayıt, **operatör adresinizden** yapılır: lisansı ve stake'i tutan, ücretleri ödeyen ve ödülleri alan sıradan bir `qor1…` hesabı. Düğümün bu hesap adına imza atabilmesi gerekir; bu nedenle **kurtarma kelimelerine sahip olduğunuz** bir hesap olmalıdır: kendiniz not ettiğiniz kelimeler, Keplr'deki bir hesap veya bir `qorechaind` anahtarı (türetme yolu `m/44'/118'/0'/0/0`). En iyi seçim, yalnızca düğüm için kullanılan özel bir hesaptır.

Dashboard'daki emanetçi (custodial) bir cüzdan (seed'ini Dashboard'un sizin için sakladığı bir cüzdan), seed'ini önce dışa aktarmadığınız sürece düğüm çalıştıramaz.

Düğümün Dilithium-5 anahtarının kendine ait bir adresi yoktur: QoreChain'de kuantum-sonrası bir anahtar bir hesaba bağlanır, yeni bir hesap oluşturmaz. Düğüm, hesabın zaten bir anahtarı yoksa, kendi anahtarını operatör hesabına o hesabın kuantum-sonrası anahtarı olarak bağlar (bkz. [Zaten kuantum-sonrası anahtarı olan hesaplar](#accounts-with-a-pqc-key)).

## Lisans edinme

### Ana ağ: Dashboard'dan satın alma

Lisanslar QoreChain Dashboard'da **Araçlar → Hafif Düğüm** bölümünden satın alınır. Bir lisans **50 $**'dır ve ERC-20, BEP-20 veya TRC-20 üzerinde USDT ile ödenir; ödeme kendi zincirinde doğrulanır. Lisansın verileceği `qor1…` adresini ödeme yapmadan **önce** girmeniz gerekir; yukarıda açıklanan operatör adresini kullanın.

Verme (grant) işlemi, elle imzalanan ve toplu olarak gönderilen ayrı bir zincir üzeri adımdır. Zincir bunu onaylayana kadar sekme **Paid, awaiting on-chain grant** gösterir ve düğüm adresin lisansı olmadığını bildirmeye devam eder. `lightnode-sx status`, verme işlemi gerçekleştiğinde `active` olarak değişen bir `Licence:` satırı gösterir. Bunu doğrudan da kontrol edebilirsiniz:

```bash
curl -s https://api.qore.host/qorechain/license/v1/check/<operator-address>/lightnode_operator
```

### Test ağı: talep üzerine

Test ağında hiçbir şey satılmaz. Test ağı lisansları ücretsizdir ve test ağı lisans yetkilisi tarafından talep üzerine verilir: test ağı `qor1…` adresinizle birlikte nodes@qorechain.io adresine yazın.

## Düğümü kaydetme

Aşağıdaki adımlar düğümün kendi kurulum akışıdır. Her iki sürüm için de aynıdır: `lightnode-ux`, `lightnode-sx` ile aynı komutlara sahiptir ve aynı ana dizini (`~/.qorechain-lightnode`) kullanır. Her komutun ayrıntıları için bkz. [SX Sürümü](/light-node/sx-edition#first-run-onboard).

```bash
# 1. Keys are stored encrypted. Keep this set for every command below and for start.
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

# 2. Self-test, RPC endpoint (mainnet: https://rpc.qore.host), node key
lightnode-sx onboard

# 3. The operator account: the one the licence is for. --recover reads its
#    recovery words from standard input.
lightnode-sx keys add-operator --recover

# 4. Post-quantum key, missing stake (only if you name a validator), registration
lightnode-sx register --delegate-to qorvaloper1...

# 5. Run the node; it sends heartbeats on its own
lightnode-sx start
lightnode-sx status
```

Parola, düğümün keyring'indeki iki anahtarı da korur: düğümün kuantum-sonrası anahtarını ve operatör hesabı anahtarını.

### `register` ne yapar

`register`, `operator_address` değerini ve anahtarları keyring'den okur, ardından:

1. **Lisansı kontrol eder.** Zincire `operator_address` adresinin aktif bir `lightnode_operator` lisansı taşıyıp taşımadığını sorar. Lisans yoksa durur ve nereden alınacağını söyler. 3.1.10'dan itibaren mesaj ana ağda **Araçlar → Hafif Düğüm** bölümüne, test ağında ise nodes@qorechain.io adresinden talep üzerine verilen ücretsiz lisansa yönlendirir (3.1.9 hâlâ Dashboard'un eski sekmesini anıyordu). Süresi dolmuş veya askıya alınmış bir lisans bu şekilde bildirilir. Zaten kayıtlı olan bir düğüm bu şekilde bildirilir ve hiçbir şey gönderilmez.
2. **Kuantum-sonrası anahtarı bağlar**, hesabın zaten bir anahtarı yoksa. Kuantum-sonrası anahtarı olmayan bir hesap yalnızca bu tek mesajı, klasik olarak imzalanmış şekilde (hibrit uzantı olmadan) gönderebilir; düğüm mesajı bu şekilde gönderir ve zincirin desteklediği yerlerde anahtara sahip olduğuna dair bir kanıt (proof of possession) ekler.
3. **Eksik stake'i delege eder**, yalnızca `--delegate-to qorvaloper1...` ile bir doğrulayıcı belirtirseniz. `--delegate-to` olmadan, hesap minimumun altındaysa durur ve ne kadar eksik olduğunu söyler. 3.1.10'dan itibaren, zincirin yaptığı gibi yalnızca **bağlı (bonded)** doğrulayıcılara delege edilen stake'i sayar; 3.1.9 hapsedilmiş (jailed) veya bağı çözülmüş (unbonded) doğrulayıcıları da sayıyordu ve bu durumda zincirde reddedilebiliyordu, bu yüzden 3.1.9 çalıştırıyorsanız aktif bir doğrulayıcıya delege edin.
4. **Düğümü kaydeder**, 1 QOR ücretle.

Her adım düğümün kendisi tarafından imzalanır ve bir sonraki gönderilmeden önce bir blokta onaylanır. Anahtar kaydından sonraki her işlem, zincirin gerektirdiği hibrit ML-DSA-87 + secp256k1 imzasını taşır.

Komut şu bayrakları alır:

- `--delegate-to` — eksik stake'in delege edileceği `qorvaloper1…` doğrulayıcısı.
- `--type` — düğüm türü, `sx` veya `ux` (varsayılan olarak ikili dosyanın sürümü).
- `--version` — kaydedilecek düğüm sürümü (varsayılan olarak ikili dosyanın kendi sürümü).
- `--print` — imzalamak yerine eşdeğer `qorechaind` komutlarını yazdırır (aşağıya bakın).

`register` hesap adına imza atabilmeden önce hesabın zincirde zaten var olması (fon almış olması) gerekir.

### Zaten kuantum-sonrası anahtarı olan hesaplar {#accounts-with-a-pqc-key}

Bir cüzdanda kurulmuş bir hesabın çoğu zaman aynı kurtarma kelimelerinden türetilmiş bir kuantum-sonrası anahtarı zaten vardır. Zincirin v3.2.3 kurallarına göre zincir yalnızca hesaba kayıtlı anahtarı kabul eder ve `classical_only` türündeki anahtarları veya boş bir anahtarı reddeder.

3.1.9'dan beri `keys add-operator --recover` bu durumu ele alır: hesabın zaten bir kuantum-sonrası anahtarı varsa, bu anahtarı wallet-adapter ve Dashboard ile aynı türetmeyi (`qorechaind tx pqc recover-key` ile aynı) kullanarak kelimelerden yeniden oluşturur ve düğüm onunla imzalar. Hesabın anahtarı yoksa düğüm kelimelerden bir anahtar türetir; böylece kelimeler düğümün anahtarını da geri yükler. Hesabın, kelimelerin yeniden üretemeyeceği bir kuantum-sonrası anahtarı varsa (kendi anahtarını üretip saklayan bir cüzdan), komut reddeder ve özel bir operatör hesabı önerir.

### Alternatif: operatör anahtarı bir `qorechaind` keyring'inde

Operatör hesabı anahtarını bir `qorechaind` keyring'inde tutuyorsanız ve düğümde saklamak istemiyorsanız, 3. adımı atlayın ve şunu çalıştırın:

```bash
lightnode-sx register --print
```

Aynı lisans ve kayıt kontrollerini çalıştırır ve sizin değerlerinizle doldurulmuş olarak her adım için `qorechaind` komutlarını yazdırır: düğüm anahtarının `qorechaind`'ın anahtar dizinine aktarılması (`keys export <name> --out ~/.qorechaind/pqc/<name>.dilithium`), `tx pqc register-key-v2 … hybrid`, stake yetersizse bir `tx staking delegate` ve oluştur-sonra-`tx pqc cosign` çifti olarak `tx lightnode register`. Bu yolda daemon kalp atışları için de `qorechaind` kullanır; bkz. [`[heartbeat]` ayarları](/light-node/sx-edition#configure).

## Kalp atışı canlılık kanıtları

Kayıt tek başına uygunluğu sürdürmek için yeterli değildir. Kayıtlı bir hafif düğüm, **kalp atışı canlılık kanıtları** göndererek çevrimiçi olduğunu sürekli kanıtlamalıdır. Bu kalp atışları, zincirin aktif düğümleri — ödül payı için uygun olanları — kayıtlı ama çevrimdışı düğümlerden ayırt etmesinin yoludur.

Pratikte bu, kayıtlı ve çalışır (ve senkronize) durumda tutulan bir düğümün uygunluğunu koruduğu, çevrimdışı kalan bir düğümün ise canlılık kanıtlamayı durdurup geri dönene kadar uygunluğunu kaybettiği anlamına gelir. Bu yüzden daemon'u çalışır ve sağlıklı tutmak, ödül kazanmanın bir parçasıdır — kalp atışı ve senkron sağlığını nasıl izleyeceğiniz için [Ödüller ve İzleme](/light-node/rewards-and-monitoring) sayfasına bakın.

### PQC ortak imzalı kalp atışı hattı {#pqc-cosigned-heartbeat-pipeline}

QoreChain **varsayılan olarak PQC gerektirir**, bu yüzden her kalp atışı bir **hibrit imza** taşır: hesabın kuantum-sonrası anahtarıyla ML-DSA-87 (Dilithium-5) ve operatör hesabı anahtarıyla secp256k1. Düğüm işlemi Linux, macOS ve Windows üzerinde kendisi oluşturur ve imzalar; `qorechaind` gerekmez. Hangi sign-bytes sürümünün kullanılacağını ağdan okur.

Zincir üzerinde kalp atışları varsayılan olarak açıktır. Daemon, zincirin düğüm için tuttuğu `last_heartbeat` değerinden bu yana 1.000 blok (`[heartbeat] interval_blocks`, zincirin `heartbeat_interval` değeriyle eşleşir) geçtiğinde bir kalp atışı gönderir ve bunu her 60 saniyede bir kontrol eder; bu yüzden yeniden başlatma ne yinelenen bir gönderim yapar ne de bir aralığın tamamını bekler. Her kalp atışı ancak bir bloğa girdikten sonra bildirilir.

Daemon, imzalayıcısını başlangıçta seçer:

- **Yerel** — keyring operatör anahtarını tutar (`keys add-operator` ile) ve bu anahtar `operator_address` ile eşleşir. Normal durum budur.
- **`qorechaind` alternatifi** — aksi halde, `PATH` içinde veya `[heartbeat] qorechaind_path` konumunda bir `qorechaind` ikili dosyası varsa. `qorechaind` keyring'indeki operatör anahtarını (`[heartbeat] key_name`, home `qorechaind_home`, varsayılan `~/.qorechaind`) ve `pqc/<key_name>.dilithium` altındaki dışa aktarılmış düğüm anahtarını kullanır. `qorechaind` keyring parolası `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` içine konur; stdin üzerinden `qorechaind`'a aktarılır, asla komut satırına yazılmaz.

Düğüm kaydedilene kadar kalp atışı göndermez; bunun yerine nedenini her durum değişikliğinde bir kez günlüğe yazar: lisans yok ya da lisans aktif ama kayıtlı değil (`register` çalıştırın). `lightnode-sx status`, nedeni günlükleri okumadan görebilmeniz için `Signer:`, `Licence:` ve `Registration:` satırlarını gösterir. İmzalayıcı olmadığında düğüm yine de çalışır ve senkronize olur, ancak zincirde aktif kalamaz ve `status` bunu söyler.

## Dashboard'un Hafif Düğüm sekmesi

QoreChain Dashboard'un **Araçlar → Hafif Düğüm** sekmesi adımları bir araya getirir:

1. **İndirmeler.** Seçili ağ için hafif düğüm ikili dosyalarına (sha256 sağlama toplamlarıyla birlikte `https://download.qore.host/<net>/lightnode/latest.json` ile aynı dosyalar) bağlantı verir.
2. **Kurulum adımları.** Yukarıdaki beş adımı sürüm manifestindeki sürüme göre gösterir ve kaydın açık olup olmadığını manifestin `registration` alanından okuyarak belirtir.
3. **Lisans satın alma** (yalnızca ana ağ). Ödemeden önce lisans adresini alır ve zincir verme işlemini onaylayana kadar **Paid, awaiting on-chain grant** gösterir. Girdiğiniz adres kendi emanetçi Dashboard cüzdanınızsa sizi uyarır ve adresin zaten bir kuantum-sonrası anahtarı varsa bilgi amaçlı olarak belirtir.
4. **Durum.** Bir durum paneli, düğümün zincirden okunan durumunu gösterir.

Kaydın kendisi her zaman `lightnode-sx register` (veya `lightnode-ux register`) tarafından gönderilen işlemdir. Dashboard düğüm kaydetmez; yalnızca bir kayıt tutan eski kayıt formu kaldırılmıştır.

## Sırada ne var

- [Ödüller ve İzleme](/light-node/rewards-and-monitoring) — %3 payın nasıl kredilendirildiği, talep edildiği ve izlendiği.
- [SX Sürümü](/light-node/sx-edition) — `register` komutu ve tam CLI referansı.
