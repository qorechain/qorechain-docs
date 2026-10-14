---
slug: /light-node/registration-and-licensing
title: Kayıt ve Lisanslama
sidebar_label: Kayıt ve Lisanslama
sidebar_position: 4
---

# Kayıt ve Lisanslama

[%3 hafif düğüm ödül payına](/light-node/rewards-and-monitoring) katılmak için bir hafif düğümün **zincir üzerinde kayıtlı** olması ve canlı olduğunu kanıtlamaya devam etmesi gerekir. Bu sayfa kaydın nasıl işlediğini, düğümün canlılığını nasıl kanıtladığını ve Dashboard üzerinden bir düğümü nasıl lisanslayıp zincir üzerinde kaydedeceğinizi ele alır.

:::note Ödül programı kaydı henüz açık değil
Her iki ağda da hiçbir `lightnode_operator` lisansı verilmedi ve hiçbir düğüm kayıtlı değil; bu yüzden zincir bugün her kaydı reddediyor. Bir düğümü çalıştırmak ve senkronize etmek lisans gerektirmez. Güncel durumu nasıl kontrol edeceğiniz için [Ödül programının durumu](/light-node/overview#reward-program-status) sayfasına bakın.
:::

## Zincir üzerinde kayıt

Kayıt işlemi, hafif düğümünüzü zincire yazarak protokolün onun varlığından, türünden (`sx` veya `ux`) ve hangi operatör anahtarı tarafından kontrol edildiğinden haberdar olmasını sağlar. Kaydedildikten ve canlı hale geldikten sonra düğüm, hafif düğüm ödül payı için uygun hale gelir.

### Gereksinimler {#requirements}

Kayıt işleminiz yürütülürken zincir bunların hepsini kontrol eder:

1. Operatör adresinde aktif bir `lightnode_operator` lisansı.
2. Aynı adresten doğrulayıcılara en az **1.000 QOR bağlanmış (bonded)** olması (tüm doğrulayıcılar genelindeki toplamınız). Kayıttan **önce** delege edin: Dashboard'un staking sayfasından veya `qorechaind tx staking delegate` ile (ve her işlemde olduğu gibi kuantum-sonrası ortak imzayla).
3. **1 QOR** kayıt ücretini ve işlem ücretlerini ödemek için operatör hesabında bakiye. Daemon her kalp atışı için bu hesaptan ücret öder (varsayılan olarak kalp atışı başına `50000uqor`, `[heartbeat] fees`).
4. Ağ genelinde kayıtlı 10.000'den az hafif düğüm.

### Kayıt komutlarını oluşturma

Kayıt, **operatör adresinizden** yapılır: `qorechaind` (veya herhangi bir Cosmos cüzdanı) ile oluşturulmuş, fonlanmış bir `qor1…` hesabı; ödüller de bu hesaba gelir. Düğümün kendi Dilithium-5 anahtarının adresi yoktur; hesabın kuantum-sonrası anahtarı olur. Adresi `config.toml` içine `operator_address` olarak yazın ve `key_name` ile `chain_id` değerlerinin [İlk çalıştırma](/light-node/sx-edition#first-run-onboard) bölümünde anlatıldığı gibi ayarlandığından emin olun (`onboard` bunları sizin için doğru ayarlamaz). Ardından şunu çalıştırın:

```bash
lightnode-sx register
```

Herhangi bir şey yazdırmadan önce komut, zincire `operator_address` adresinin aktif bir `lightnode_operator` lisansı taşıyıp taşımadığını sorar. Bunu, zincirin lisanssız bir kaydı reddetmesi ve reddedilecek komutları elinize vermenin anlamsız olması nedeniyle yapar. Lisans yoksa şu çıktıyla durur:

```text
operator address qor1... has no lightnode_operator licence. Buy one at
https://dashboard.qorechain.io -> Tools -> Buy License, and enter this operator
address there; the on-chain grant follows and register works once it lands.
```

Dashboard'dan satın alınan lisans, ayrı bir adımda zincir üzerinde verilir; bu yüzden `register`, satın almanın ardından bir süre hâlâ "no licence" diyebilir. `lightnode-sx status` aynı `Licence:` satırını gösterir ve verme işlemi gerçekleştiğinde `active` olarak değişir. Zaten kayıtlı olan bir düğüm iki kez kaydedilmez, bunun yerine kayıtlı olarak bildirilir.

Aktif bir lisansla komut, düğüm anahtarını keyring'den okur ve sizin değerlerinizle doldurulmuş olarak şunları yazdırır:

1. **Yalnızca bir kez**, düğüm anahtarını operatör hesabına kuantum-sonrası anahtarı olarak bağlayan komut (`qorechaind tx pqc register-key-v2 dilithium5 <pubkey> hybrid --from operator …`); bundan önce anahtar, `lightnode-sx keys export` ile `qorechaind`'ın anahtar dizinine aktarılır. Hesabın zaten bir kuantum-sonrası anahtarı varsa atlayın (`GET /qorechain/pqc/v1/account/<address>` `found: true` döner). Yazdırılan gaz sınırı yetmezse, `--gas 600000 --fees 60000uqor` ile tekrarlayın.
2. Kaydın kendisi: `qorechaind tx lightnode register <type> <version> --from operator --generate-only > register.json`, ardından `qorechaind tx pqc cosign register.json --from operator --pqc-key <key>`. Zincir her işlemde kuantum-sonrası ortak imza gerektirir, bu yüzden kayıt bir oluştur-sonra-ortak-imzala çiftidir.

Komut iki isteğe bağlı bayrak alır:

- `--type` — düğüm türü, `sx` veya `ux` (varsayılan `sx`).
- `--version` — kaydedilecek düğüm sürümü (varsayılan olarak ikili dosyanın kendi sürümü).

Katıldığınız ağda (testnet `qorechain-diana` veya mainnet `qorechain-vladi`) gönderin. Kayıt, operatör adresine verilmiş aktif bir `lightnode_operator` lisansı gerektirir; aksi halde zincir bunu reddeder.

:::note
`lightnode-sx register`, komutları incelemeniz ve çalıştırmanız için **yazdırır** — kendiliğinden yayınlamaz. Bu, düğümün ne zaman ve nasıl kaydedileceği konusunda kontrolü sizde tutar.
:::

## Kalp atışı canlılık kanıtları

Kayıt tek başına uygunluğu sürdürmek için yeterli değildir. Kayıtlı bir hafif düğüm, **kalp atışı canlılık kanıtları** göndererek çevrimiçi olduğunu sürekli kanıtlamalıdır. Bu kalp atışları, zincirin aktif düğümleri — ödül payı için uygun olanları — kayıtlı ama çevrimdışı düğümlerden ayırt etmesinin yoludur.

Pratikte bu, kayıtlı ve çalışır (ve senkronize) durumda tutulan bir düğümün uygunluğunu koruduğu, çevrimdışı kalan bir düğümün ise canlılık kanıtlamayı durdurup geri dönene kadar uygunluğunu kaybettiği anlamına gelir. Bu yüzden daemon'u çalışır ve sağlıklı tutmak, ödül kazanmanın bir parçasıdır — kalp atışı ve senkron sağlığını nasıl izleyeceğiniz için [Ödüller ve İzleme](/light-node/rewards-and-monitoring) sayfasına bakın.

### PQC ortak imzalı kalp atışı hattı {#pqc-cosigned-heartbeat-pipeline}

QoreChain **varsayılan olarak PQC gerektirir**, bu yüzden kalp atışı canlılık işlemi klasik-yalnız bir imza yerine kuantum-sonrası ortak imzalı bir hat üzerinden üretilir. Daemon, imzasız kalp atışını oluşturur, ardından yayından önce onu **hibrit Dilithium-5 (ML-DSA-87)** imzasıyla ortak imzalar — bu, zincirin her işlem için uyguladığı aynı kuantum-sonrası duruştur. Düğüm, her `interval_blocks` penceresi başına bir kalp atışı gönderir (zincirin `heartbeat_interval` parametresiyle eşleşir) ve erken gönderim reddedilmelerinden kaçınmak için kendini blok yüksekliğine göre hızlandırır.

Zincir üzerinde kalp atışları varsayılan olarak açıktır. Daemon'un şunlara ihtiyacı vardır: yapılandırmada `operator_address`; **v3.2.0 veya daha yeni** bir `qorechaind` ikili dosyası (`PATH` içinde ya da `[heartbeat] qorechaind_path` konumunda; `v3.1.4` etiketinden derlenen SX Docker imajı bir tane içerir — daha eski imzalayıcılar zincir tarafından reddedilir); ve operatör anahtarını ile aktarılmış düğüm anahtarını tutan `qorechaind` home dizini (`qorechaind_home`, varsayılan `~/.qorechaind`). İki keyring parolası ortam değişkenlerinde bulunmalıdır: düğüm keyring'i için `QORE_LIGHTNODE_KEYRING_PASSPHRASE` ve `qorechaind` keyring'i için `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` (ikincisi stdin üzerinden `qorechaind`'a aktarılır, asla komut satırına yazılmaz). `qorechaind` **yalnızca Linux amd64 için** yayımlanır (bkz. `https://download.qore.host/mainnet/latest.json` içindeki `binary` girdisi), bu yüzden macOS, Windows veya ARM ana makinelerinde düğüm çalışır ve senkronize olur ama kalp atışlarını yerel olarak imzalayamaz; kayıtlı bir düğüm, Linux amd64 üzerinde SX sürümünü ya da bir amd64 ana makinede Docker imajını çalıştırmalıdır. Düğüm, zincirin o düğüm için tuttuğu `last_heartbeat` değerine göre kendini hızlandırır; bu yüzden yeniden başlatma ne yinelenen bir gönderim yapar ne de bir aralığın tamamını bekler. Düğüm kaydedilene kadar kalp atışı göndermez; bunun yerine nedenini her durum değişikliğinde bir kez günlüğe yazar: lisans yok (nereden satın alınacağıyla birlikte) ya da lisans aktif ama kayıtlı değil (`lightnode-sx register` çalıştırın). `lightnode-sx status`, nedeni günlükleri okumadan görebilmeniz için `Signer:`, `Licence:` ve `Registration:` satırlarını gösterir. İmzalayıcı eksik olduğunda düğüm yine de çalışır ve senkronize olur; yalnızca zincirde aktif kalamaz ve `status` bunu söyler.

## Dashboard üzerinden kayıt ve lisanslama

Lisanslama durumunuzu kontrol edebilir ve düğüm bilgilerinizi QoreChain Dashboard'un **Araçlar → Hafif Düğüm** sekmesinde tutabilirsiniz. Bir düğümü çalıştırmak ile ödül programına katılmak iki farklı şeydir ve Dashboard bu ikisini ayrı tutar:

1. **Yazılımı edinin (lisans gerekmez).** Sekme, seçili ağ için hafif düğüm ikili dosyalarına (sha256 sağlama toplamlarıyla birlikte `https://download.qore.host/<net>/lightnode/latest.json` ile aynı dosyalar) bağlantı verir ve tam bir QoreChain düğümü için bir ayağa kaldırma paketi gösterir. Bir hafif düğümün yalnızca `lightnode-sx` veya `lightnode-ux` ikili dosyasına ve bir RPC uç noktasına ihtiyacı vardır; [SX Sürümü](/light-node/sx-edition) sayfasını izleyin.
2. **Ödül programı durumunuzu kontrol edin.** Hafif düğüm ödül payına katılmak, ayrı ve zincir üzeri koşula bağlı bir adımdır: zincir üzerinde verilmiş aktif bir `lightnode_operator` lisansı, en az 1.000 QOR bağlanmış olması (tüm doğrulayıcılar genelindeki toplamınız, staking'den canlı okunur) ve 1 QOR kayıt ücreti. **Kayıt henüz açık değildir** ([Ödül programının durumu](/light-node/overview#reward-program-status) sayfasına bakın) ve lisans satın almak bunu erken açmaz. Çalışma süresi, düğümünüzün zincir üzerinde kaydolduğu bloktan itibaren sayılır, öncesinden değil.
3. **Lisans.** **Lisans Satın Al** üzerinden satın alınan bir lisans önce bizim tarafımızda kaydedilir; onu zincir üzerinde tanınır kılan verme (grant) işlemi ayrı bir adımdır ve bu gerçekleşene kadar zincir kaydı reddeder. Satın alma, lisansın verileceği `qor1…` adresini gerektirir ve zincir onaylayana kadar **Paid — awaiting on-chain grant** gösterir. `lightnode-sx status`, zincir üzerindeki `Licence:` satırını gösterir.
4. **Kayıt kaydı.** Hesabınızda aktif olarak kaydedilmiş bir lisans varsa, sekme ayrıca kısa bir form (operatör adresi, moniker, genel uç nokta URL'si ve stake taahhüdünün bir onayı) ve ardından gönderdiklerinizin bir özetini gösterir. Bu, talebinizi Dashboard'a kaydeder; zincir üzerindeki kayıt işlemini **göndermez**.
5. **Zincir üzerinde kaydolun.** Lisans verildikten ve operatör adresinizden 1.000 QOR bağlandıktan sonra, `lightnode-sx register` ve yazdırdığı `qorechaind` komutlarıyla kaydolun (yukarıya bakın).

Dashboard; düğümü indirmek, zincirin gereksinimlerini ve düğümünüzün sağlığını kontrol etmek ve lisans satın almak için kullanışlıdır. Zincir üzerindeki kaydın kendisi her zaman `lightnode-sx register` işlemidir.

## Sırada ne var

- [Ödüller ve İzleme](/light-node/rewards-and-monitoring) — %3 payın nasıl kredilendirildiği, talep edildiği ve izlendiği.
- [SX Sürümü](/light-node/sx-edition) — `register` komutu ve tam CLI referansı.
