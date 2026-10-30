---
slug: /rollups/deploying-a-rollup
title: Bir Rollup Dağıtma
sidebar_label: Bir Rollup Dağıtma
sidebar_position: 3
---

# Bir Rollup Dağıtma

Uygulamaya özel bir rollup'ı üç şekilde kurabilirsiniz: **Dashboard** üzerinden (bir talep formu, zincir üstü bir işlem değil), zincir **CLI**'si üzerinden (`qorechaind`, zincir üstü işlem üzerinde tam kontrol) veya **TypeScript RDK** ile (`@qorechain/rdk` artı `create-qorechain-rollup` iskelet oluşturucu); RDK yapılandırmayı, okumaları ve kuantum sonrası bir anahtar verdiğinizde hibrit imzalı işlemleri kapsar (bkz. [RDK 0.7.0: değişiklikler ve sınırlar](#rdk-050-limits)). Bu sayfa her üçünü de, operatör yaşam döngüsünü ve toplu (batch) komutları kapsar.

:::caution Erken aşama yetenek
Henüz her iki ağda da herhangi bir rollup oluşturulmadı (30 Ekim 2026 itibarıyla kontrol edildi). Aşağıdaki komutlar **`qorechain-diana`** test ağını kullanır (EVM zincir ID **9800**, zincir sürümü **v3.2.6**: v3.2.4 orada 19 Ekim 2026'da, v3.2.5 26 Ekim'de 8.890.800 yüksekliğinde ve v3.2.6 27 Ekim'de 8.970.638 yüksekliğinde uygulandı). Mainnet (**`qorechain-vladi`**, EVM zincir ID **9801**, 7 Haziran 2026'dan beri canlı) 29 Ekim 2026'dan beri **v3.2.5** zincir sürümünü çalıştırır (3.906.833 yüksekliğinde yönetişim önerisi 14 ile uygulandı; v3.2.4, öneri 13 ile 23 Ekim 2026'da 3.742.566 yüksekliğinde uygulanmıştı), bu yüzden v3.2.5'in rollup'lar için neyi değiştirdiği "v3.2.5'ten itibaren" olarak işaretlenir ve her iki ağda da geçerlidir (özet tablo [Rollup'lara Genel Bakış](/rollups/overview#v325) sayfasındadır). Önceki sürümler birkaç ayrıntıda farklılık gösterir ve bu sayfa bunları "v3.2.4'ten itibaren" olarak işaretler. Test ağı, kendi modül parametrelerine sahip bir hazırlık (staging) ağıdır (örneğin varsayılan itiraz penceresi mainnet'te 604.800 iken 3.600 saniyedir ve en fazla rollup sayısı 100 yerine 200'dür); hedeflediğiniz ağda `GET /qorechain/rdk/v1/params` adresini okuyun. Her dağıtımı önce test ağında doğrulayın.
:::

:::note Ücretler ve imzalama
Ağ, `0.1uqor` minimum gaz fiyatını zorunlu kılar; bu yüzden yalın bir `--fees 500uqor` reddedilir ve her native hat işlemi hibrit kuantum sonrası ortak imzaya ihtiyaç duyar. Bu sayfadaki CLI örnekleri bu nedenle işlemi `--generate-only` ile oluşturur ve `qorechaind tx pqc cosign` ile ortak imzalar; bu komut işlemi imzalar ve yayınlar (anahtarı bir kez `qorechaind tx pqc gen-key` ile oluşturun ve zincir üstünde bir kez `qorechaind tx pqc register-key` ile kaydedin veya bunu sizin için yapan QoreX ya da SDK'yı kullanın). Ücret, imzasız dosya oluşturulduğunda sabitlenir; bu yüzden gaz limitini ve ücreti birlikte ayarlayın: ücret en az gaz limiti × 0.1 uqor olmalıdır. Aşağıdaki gaz limitleri yaklaşık değerlerdir — güvenmeden önce simüle edin. Bkz. [İlk İşlem](/getting-started/first-transaction) ve [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing).
:::

---

## Gereksinimler

| Gereksinim | Detaylar |
| ----------- | ------- |
| **Minimum stake** | En az 10,000 QOR (`min_stake_for_rollup`); stake, rollup oluşturulduğunda emanete alınır |
| **Oluşturma yakımı (burn)** | Sağladığınız stake'in %1'i oluşturma sırasında kalıcı olarak yakılır (yakımı uygulayamayan bir oluşturma reddedilir); kalan tutar emanette tutulur ve rollup durdurulduğunda iade edilir |
| **Katman kayıt stake'i** | Oluşturma, rollup'ın katmanını multilayer modülüne de kaydeder; bu, oluşturucudan **1,000 QOR** (`min_sidechain_stake`) daha kilitler ve katman durdurma sırasında devre dışı bırakıldığında iade edilir. Katman kaydedilemezse (bakiye çok düşük veya multilayer sidechain sınırı olan 10'a ulaşıldı) rollup yine de oluşturulur ancak katmanı olmaz, dolayısıyla toplu işleri (batch) demirlenemez |
| **Rollup ID'si** | 3–64 karakter kullanın: küçük harfler, rakamlar, `.`, `_` ve `-`; bir harf veya rakamla başlamalıdır. Zincir bu kuralı v3.2.2'den beri her iki ağda da zorunlu kılar (CLI, işlemi oluşturmadan önce bunu denetler), bu yüzden kurala uymayan bir ID reddedilir |
| **Hesap** | Kayıtlı bir kuantum sonrası anahtara sahip, stake, katman stake'i ve işlem ücretleri için yeterli bakiyesi olan, fonlanmış bir QoreChain hesabı |

Dağıtımdan önce güncel minimum stake ve yakım oranı için canlı modül parametrelerini sorgulayın:

```bash
qorechaind query rdk config
```

---

## Dashboard üzerinden dağıtım (Tools → Rollups)

Dashboard, **Tools → Rollups** altında bir **Deploy a Rollup** formu sunar. Bu bir **talep formudur**: gönderdiğinizde hesabınız için, **The Qore Trust** tarafından incelenen bir provizyon talebi kaydedilir ve yeni bir talep **provisioning** durumunu gösterir. Zincir üstü bir `create-rollup` işlemi yayınlamaz — bir rollup'ı zincir üstünde kaydetmek için aşağıdaki CLI'yi kullanın.

### Adımlar

1. **Oturum açın.** Bir talep göndermek ve mevcut taleplerinizi listelemek için form, kimlik doğrulanmış bir oturum gerektirir.
2. **Rollup'ınıza bir isim verin.** Bir rollup adı girin (2–41 karakter: harfler, rakamlar, boşluklar, tireler veya alt çizgiler).
3. **Bir sanal makine seçin.** Zincir üstü kayıt bir VM etiketi saklar. Rollup'ınız kendi çalışma zamanında zincir dışında yürütülür; bu seçim QoreChain'in kendi EVM, QoreChain Native veya SVM hatlarında çalışmaz:
   * **EVM** — tam Ethereum araç setiyle (Hardhat, Foundry, MetaMask) Solidity / Vyper sözleşmeleri
   * **QoreChain Native** — Cosmos SDK çalışma zamanında (CosmWasm çalışma zamanı), yerel IBC ile Rust akıllı sözleşmeleri
   * **SVM** — paralel yürütmeli, yüksek verimli uygulamalar için Solana Virtual Machine
4. **Bir veri kullanılabilirliği (DA) katmanı seçin.** Rollup'ınızın, herkesin durumu yeniden oluşturabilmesi için işlem verisini yayınladığı yer: **QoreChain DA**, **Celestia** veya **EigenDA**. EigenDA'nın bir Dashboard seviyesi seçenek olduğunu, zincir üstü `x/rdk` DA arka uçlarının ise native, Celestia veya her ikisi olduğunu unutmayın — bkz. [Veri Kullanılabilirliği](/rollups/data-availability).
5. **Bir gaz tokeni belirleyin.** Rollup'ınızda yürütme için ödeme yapmakta kullanılan token. Varsayılan olarak **QOR**'dur; kendi native tokeninizi kullanmak için özel bir sembol girin.
6. **Bir sıralayıcı (sequencer) seçin.** İşlemleri yerleşim (settlement) öncesinde kimin sıraladığı: **Shared sequencer** (QoreChain'in paylaşımlı seti), **Dedicated (single)** (kendi tek sıralayıcınızı çalıştırın) veya **Decentralized** (izinsiz bir sıralayıcı seti).
7. **Bir yerleşim (settlement) hedefi seçin.** Rollup'ın durum köklerini (state root) ve geçerlilik kanıtlarını nereye demirlediği: **QoreChain mainnet** veya **Ethereum**.
8. **Talebi gönderin.** Provizyon **The Qore Trust** tarafından incelenir; bu yüzden yeni gönderilmiş bir talep, inceleme tamamlanana kadar **provisioning** durumunda görünür.

Gönderdiğiniz talepler, VM'leri, DA katmanları, gaz tokenleri, sıralayıcıları, yerleşim hedefleri ve güncel durumlarıyla birlikte **Your rollups** listesinde görünür.

:::note
Formun seçenekleri (sanal makine, veri kullanılabilirliği katmanı, gaz tokeni, sıralayıcı, yerleşim hedefi) ne talep ettiğinizi tanımlar; zincir üstü `x/rdk` modülünün şu anda desteklediğinden daha geniştir. Zincir üstünde veri kullanılabilirliği `native`'dir (Celestia etkin değildir) ve sıralama, rollup oluşturucusu veya yapılandırılmış bir sıralayıcı adresi tarafından yapılır. Bkz. [Veri Kullanılabilirliği](/rollups/data-availability).
:::

---

## CLI üzerinden dağıtım

CLI, rollup'ı doğrudan zincir üstünde oluşturur. `create-rollup`, üç konumsal argüman alır — rollup ID'si, bir profil ve stake miktarı (`uqor` cinsinden) — artı isteğe bağlı bir `--vm` bayrağı.

:::tip
Zincir sürümü **v3.1.74** itibarıyla, `create-rollup` **seçilen profilin ön ayarını otomatik olarak uygular** — yerleşim modu, sıralayıcı, DA, gaz modeli ve VM'nin tamamı ön ayardan alınır. Artık bunları elle ayarlamanıza gerek yok (daha önce mesaj sabit kodlanmış bir egemen (sovereign) yapılandırma kullanıyordu). `--vm` bayrağı artık **varsayılan olarak boştur**, dolayısıyla siz açıkça geçersiz kılmadığınız sürece profilin VM'si geçerli olur.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json
```

**Örnek** — `defi` ön ayarından bir rollup oluşturma (yerleşim, sıralayıcı, DA ve VM'nin tamamı ön ayardan gelir; `defi`, EVM üzerinde zk yerleşimine karşılık gelir). İmzasız işlemi oluşturun, ardından kuantum sonrası ortak imzayı ekleyip yayınlayın:

```bash
# 1. Build the unsigned transaction (10,000 QOR stake)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json

# 2. Cosign with your post-quantum key and broadcast
qorechaind tx pqc cosign create-rollup.json \
  --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

**Henüz bir `defi` (ZK) rollup'ı oluşturmayın.** Zincir oluşturmayı kabul eder ve stake'i emanete alır, ancak bir doğrulama anahtarı kaydetmenin yolu yoktur; bu yüzden her ZK toplu işi, ücreti ödendikten sonra reddedilir. Anahtar kaydı zincir v3.2.7 için planlanmıştır. Şimdilik `nft` veya `custom` gibi bir `optimistic` profil seçin (bkz. [ZK / STARK ve Çekimler](/rollups/zk-stark-withdrawals)).

**Bayraklar:**

| Bayrak | Varsayılan | Açıklama |
| ---- | ------- | ----------- |
| `--vm` | *(boş — profilin VM'sini kullanır)* | Rollup VM türünü geçersiz kılar: `evm`, `cosmwasm`, `svm` veya `custom`. Ön ayarın VM'sini uygulamak için ayarlamadan bırakın. (RDK istemcilerinde Wasm çalışma zamanı **`native`** VM türüdür — QoreChain Native — `cosmwasm` ise eski (legacy) bir takma ad olarak korunur; `cosmwasm` tel üzerindeki (on-wire) değerdir ve bu zincir seviyesi bayrağın aldığı değer de budur.) |

:::note VM etiketi bir üst veridir
`--vm`, rollup'ınızın hangi çalışma zamanını kullandığını kaydeder. Ana zincir yalnızca rollup'ı yerleştirir (settle); sözleşmelerini yürütmez. Ana zincirin kendi QoreChain Native yüklemesi şu anda kapalıdır ve SVM işlem hattı ağ genelinde devre dışıdır; bu, zincir dışı bir rollup'ın yerleşimini etkilemez, ancak bir rollup için sözleşmeleri bu ana zincir hatlarına dağıtamayacağınız anlamına gelir.
:::

`[profile]` argümanı, otomatik olarak uygulanan bir ön ayar yapılandırması seçer — bkz. **[Ön Ayar Profilleri](/rollups/preset-profiles)**. `[stake-amount]`, `uqor` cinsinden bağdır; oluşturma yakımı bunun %1'idir.

### Dağıttığınızı inceleyin

```bash
# Belirli bir rollup'ı ID ile sorgula
qorechaind query rdk rollup my-defi-rollup

# Kayıtlı tüm rollup'ları listele
qorechaind query rdk list-rollups
```

---

## TypeScript RDK (`@qorechain/rdk`) ile dağıtım {#deploy-with-the-typescript-rdk-qorechainrdk}

Rollup Development Kit, CLI ile aynı zincir üstü `x/rdk` modülü için iki herkese açık npm paketi olarak sunulur. Henüz her iki ağda da rollup bulunmadığından, kitin hiçbir işlem yolu canlı bir rollup üzerinde denenmemiştir; işlem göndermek için ona güvenmeden önce [RDK 0.7.0: değişiklikler ve sınırlar](#rdk-050-limits) bölümünü okuyun:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.7.0`) — TypeScript SDK'sı: ön ayar profilleriyle bir yapılandırma oluşturucu, rollup ve yerleşim toplu iş (settlement-batch) yaşam döngüleri için işlem yardımcıları, native DA, tipli okuma istemcileri, ML-DSA-87 imzalı yerleşim makbuzları, QCAI Rollup Copilot, VM'ler arası calldata yardımcıları ve watchtower. `@qorechain/sdk` `^0.10.0` (0.7.0'dan itibaren; 0.6.x `^0.9.0` kullanıyordu) ve `@qorechain/evm` `^0.8.0` sürümlerine bağımlıdır.
* **`create-qorechain-rollup`** (`v0.7.0`) — profil başına bir çalıştırılabilir başlangıç şablonunu (`multivm-rollup` şablonu dahil) klonlayan bir iskelet oluşturucu.

Bunlar npm'e yayınlanmıştır. Depo ayrıca yayınlanmış bir operatör CLI'si olan **`@qorechain/rdk-cli`**'yi (`qorollup`, `v0.7.0`) sunar; bu, `doctor`, `create`, `status`, `watch`, `params`, `suggest`, yaşam döngüsü komutları (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` ve `faucet` komutlarına, artı `receipt`, `advise` ve `watchtower` komutlarına sahiptir. İşlem komutları yalnızca klasik imzalar (aşağıdaki sınırlara bakın).

Sürümlere göre öne çıkanlar:

* **v0.4.2 — kutudan çıktığı gibi canlı ağa karşı çalışır.** `mainnet` ve `testnet` ön ayarları artık herkese açık `qore.host` uç noktalarını (`api.qore.host` / `api-testnet.qore.host` adresindeki REST) barındırıyor, böylece `createRdkClient({ network })` elle bir `endpoints` yapılandırması olmadan zincire ulaşır — yalnızca kendi düğümünüzü hedeflemek için geçersiz kılın. Aynı sürüm, Wasm rollup VM tanımlayıcısını **`native`** (QoreChain Native) olarak yeniden adlandırdı; `cosmwasm` kabul edilen eski bir takma ad olarak kalır ve ikisi de tel üzerinde `cosmwasm`'a eşlenir — zincir, gezgin (explorer) ve Dashboard değişmedi.
* **v0.4.3 — SDK'nın hibrit imza kodlama düzeltmesi için bağımlılık güncellemesi.** RDK işlem istemcisinin kendisi hâlâ yalnızca klasik imzalama yapıyordu.
* **v0.4.4 — `@qorechain/sdk` `^0.7.0`'ı izler**, zincir **v3.1.85** yetkilendirici (authenticator) hatları için olan SDK sürümü. RDK API'sinde değişiklik yok.
* **v0.5.0 (18 Ekim 2026)** — yerleşim makbuzu doğrulaması zincir durumuna karşı denetler ve bir makbuzu hiçbir zaman kendi alanlarına dayanarak geçerli bildirmez; TypeScript işlem istemcisi bir `pqcKeypair` verildiğinde hibrit imzalar. `@qorechain/sdk` `^0.8.0` sürümüne bağımlıdır.
* **v0.6.0 (20 Ekim 2026 tarihli GitHub sürümü)** — zincir v3.2.2'den v3.2.4'e uyumluluk sürümü: demirlenmiş (anchored) toplu işler, doğrulanabilen yerleşim makbuzları, zincirin ölçtüğü gibi ölçülen itiraz pencereleri, zincirin VM'ler arası düzenine uyan bir kodlayıcı, hibrit imzalayan şablonlar ve `@qorechain/sdk` `^0.9.0`. Ayrıntılar aşağıdadır.
* **v0.6.1 (25 Ekim 2026 tarihli GitHub sürümü)** — zincir v3.2.3 ve sonrası için, beş dilin hepsinde bir güvenlik ve şablon düzeltme sürümü: yerleşim makbuzu doğrulaması, makbuzun belirttiği her alanı zincirin çıpasıyla karşılaştırır, altı başlangıç şablonu artık zincirin reddettiği toplu işleri göndermez (`dataHash` alanını boş bırakırlar) ve optimistic şablonlar yer tutucu yerine zincirin kanonik durum kökünü yayınlar. `@qorechain/sdk` `^0.9.0` ve `@qorechain/evm` `^0.8.0` aralıklarını korur. Ayrıntılar aşağıdadır.
* **v0.6.2 (27 Ekim 2026 tarihli GitHub sürümü)**: kütüphane değişikliği olmayan bir CLI acil düzeltmesi: npm'den kurulan `qorollup` (yerel, genel veya `npx`) yeniden çalışır ve `qorollup --version` ile `create-qorechain-rollup --version` gerçek sürümlerini yazdırır. Diğer paketler, her kayıt defteri tek bir sürümde kalsın diye 0.6.2 olarak yeniden yayınlandı.
* **v0.7.0 (27 Ekim 2026 tarihli GitHub sürümü; güncel)**: beş dilin hepsinde zincir v3.2.5'e hazırdır (her iki ağ da onu çalıştırır: mainnet 29 Ekim 2026'dan, test ağı 26 Ekim'den beri) ve çekimlerin ile veri kullanılabilirliği blob'larının nasıl karmalandığını düzeltir: 0.6.x varsayılanlarıyla oluşturulan çekim kanıtları zincirde hiç doğrulanmıyordu, 0.7.0 ise zincirin tam ağacını oluşturur. `@qorechain/sdk` `^0.10.0` sürümüne geçer ve şablonlar `@qorechain/rdk` `^0.7.0` sürümünü sabitler. Ayrıntılar aşağıdadır.

**Yayınlanmış sürümler (27 Ekim 2026'da her kayıt defterinde kontrol edildi).** npm `@qorechain/rdk`, `@qorechain/rdk-cli` ve `create-qorechain-rollup`: **0.7.0** (`latest`); PyPI `qorechain-rdk`: 0.7.0; crates.io `qorechain-rdk`: 0.7.0; Maven Central `io.github.qorechain:qorechain-rdk`: 0.7.0 (`maven-metadata.xml` dosyası daha önceki sürümlerin yanı sıra 0.6.2 ve 0.7.0'ı da listeler); Go modülü `github.com/qorechain/qorechain-rdk/packages/go`: `v0.7.0` (etiket `packages/go/v0.7.0`; modül proxy'sinin `@latest` değeri yeni bir etiketin gerisinde kalabilir, bu yüzden `@v0.7.0` sürümünü açıkça sabitleyin). GitHub sürümü [v0.7.0](https://github.com/qorechain/qorechain-rdk/releases/tag/v0.7.0) sürümüdür.

#### RDK 0.7.0: değişiklikler ve sınırlar {#rdk-050-limits}

Bu bölüm, yayınlanmış 0.7.0 paketlerinin ne yaptığını (ve onlardan önce 0.6.2, 0.6.1 ve 0.6.0'ın neyi değiştirdiğini) (paket içerikleri ve GitHub sürüm notlarına karşı denetlenmiş olarak) ve hâlâ neleri yapamadığını belirtir. Bu maddelerin hiçbiri bir zincir davranışı değildir. Bir ifade "canlıda denenmedi" diyorsa, hiçbir ağda rollup bulunmaz; yani yol yalnızca koda karşı ve çevrimdışı denetlenmiştir.

**0.7.0'da neler değişti** (bir satır aksini söylemedikçe beş dilin hepsinde; tam liste [sürüm notlarında](https://github.com/qorechain/qorechain-rdk/releases/tag/v0.7.0) yer alır). Zincir v3.2.5'e ait davranış, ait olduğu ağla etiketlenmiştir: **her iki ağ da v3.2.5 veya sonrasını çalıştırır (mainnet 29 Ekim 2026'dan beri, test ağı v3.2.6 çalıştırır)**.

* **Çekim kanıtları zincirde doğrulanır.** Merkle ve çekim yardımcıları varsayılan olarak SHA-256 kullanıyor ve her yaprağı yeniden karmalıyordu; oysa zincir düğümleri SHAKE-256 ile karmalar ve yapraklarını çekimin kendisinden oluşturur, bu yüzden 0.6.x varsayılanlarıyla oluşturulan bir kanıt hiç doğrulanmıyordu. `withdrawalsTree` artık bir toplu işin çekim kökünü ve her kanıtı tam olarak zincirin yaptığı gibi oluşturur (yaprak konumu çekim dizinidir): birinci biçim yapraklarla veya zincir kimliğini de adlandıran ikinci biçim yapraklarla; zincir, v3.2.5'ten itibaren toplu işler için bunu kullanır (her iki ağ). `withdrawalLeafV1` ve `withdrawalLeafV2` tek bir yaprak oluşturur, `assembleWithdrawalProof` varsayılan olarak zincirin ağacını oluşturur ve genel Merkle yardımcıları varsayılan olarak SHAKE-256 kullanır. Bu, SHA-256 varsayılanlarına güvenen kod için geriye dönük uyumsuzdur (onları korumak için `hash` değerini açıkça geçirin). Yeni bayt biçimleri zincirin kendi koduyla üretilen vektörlere karşı test edildi ve bu vektörlerdeki her çekim kanıtı zincirin doğrulayıcısı tarafından kabul edilir. Bkz. [Yaprak ve düğüm kodlaması](/rollups/zk-stark-withdrawals#leaf-and-node-encoding).
* **`qorollup withdraw` ödemeden önce denetler.** Toplu işin çekimlerini alır (`qorollup withdraw --file withdrawal.json [--dry-run]`), kanıtı toplu işin kendi bağlamasıyla oluşturur ve sonuç toplu işin zincir üstündeki `withdrawals_root` değeri değilse ücret ödemeden önce reddeder.
* **`buildDaBlob` zincirin yaptığı gibi taahhüt eder.** Taahhüdü SHA-256 değil SHAKE-256'dır (hiçbir işlem blob yayınlamaz, bu yüzden `dataHash` hâlâ boş bırakılır).
* **Watchtower.** Watchtower toplu işleri yalnızca dizine göre ayırt ediyordu; bu yüzden reddedilmiş bir dizinde yeniden gönderilen bir toplu işi kaçırıyordu. Zincir v3.2.5'ten itibaren (her iki ağ) onaylanan bir hile, o toplu işi ve henüz sonlandırılmamış sonraki her toplu işi reddeder ve sıralayıcı aynı dizinler altında yeniden gönderir; Watchtower artık toplu işleri dizin ve durum köküne göre ayırt eder ve reddedilmiş bir toplu işi asla doğrulamaz. Yeni yardımcılar `transitionRootValidator` (zincirin hile kuralını uygulayan bir `validate` koşulu) ve `fraudProofForBatch` (kazanan kanıt veya dürüst bir toplu iş için hiçbiri) ile bir itirazın kazanacağı toplu işleri bildiren `qorollup watchtower --canonical`.
* **Zincir v3.2.5 yerleşim yardımcıları** (her iki ağ): son toplu iş kendi penceresinde sonlanabilecekken daha önceki bir toplu iş hâlâ gönderilmiş veya itiraz edilmiş durumdaysa `getRollupHealth` `heldBackBy` bildirir (toplu işler sırayla sonlanır) ve `qorollup status` bunu yazdırır; `stopRollupError` ve `stopRollup` içinde bir ön kontrol (TypeScript ve Rust), çünkü son toplu işi gönderilmiş veya itiraz edilmiş durumdaki bir rollup durdurulamaz; `MAX_PENDING_OPTIMISTIC_BATCHES` (4,096); `withdrawalsRootError` (bir çekim kökü boştur veya tam olarak 32 bayttır), beş dilin hepsinde her toplu iş gönderiminden önce denetlenir.
* **Zincir v3.2.5 için VM'ler arası yardımcılar** (her iki ağ): `getCrossVmParams` (izin listesi, `/qorechain/crossvm/v1/params` adresinde), `crossVmTargetReady` (precompile etkin, köprü etkin ve hedef izin listesinde, engelleyen nedenle birlikte), `decodeCrossVmResult` (yanıt `abi.encode(bytes)` biçimindedir) ve `decodeRevertReason` (bir ret `Error(string)` biçimindedir); Solidity'nin ürettiği kodlamalara karşı denetlenmiştir. Bkz. [Multi-VM](/rollups/multi-vm).
* **Hata çözme ve küçük eklemeler.** `decodeRdkTxError` ve `RDK_ERRORS`, `rdk` modülünün hata kodlarını (2 ila 36) ve bir operatörün karşılaştıklarında ne yapılacağını adlandırır; `qorehash` (SHAKE-256, 32 bayt) beş dilin hepsinde dışa aktarılır; `FEATURE_RDK_CHALLENGE_SETTLEMENT` zincir özellik bayrağını adlandırır.
* **`defi` şablonu, ücreti boşa harcamadan önce durur.** v3.2.5'e kadar hiçbir zincir sürümü bir ZK doğrulama anahtarı kaydedemez, bu yüzden her ZK toplu işi reddedilir. Şablon artık göndermeden önce durur ve `RollupView.hasVerificationKey`, zincir v3.2.7'nin ekleyeceği planlanan alanı okur.
* **Bağımlılıklar.** `@qorechain/sdk` `^0.10.0` (önceden `^0.9.0`), böylece SDK 0.10.0 üzerindeki bir uygulama artık kitle tek bir SDK kopyasını paylaşır; şablonlar `@qorechain/rdk` `^0.7.0` sürümünü sabitler.

**0.6.2'de neler değişti** (yalnızca CLI ve iskelet oluşturucu; kütüphane paketleri değişmedi):

* **`qorollup` npm'den kurulduğunda çalışır.** CLI yalnızca `process.argv[1]` kendi dosya yoluna eşit olduğunda başlıyordu; ancak npm bir paketin bin dosyasını `node_modules/.bin` içindeki bir sembolik bağ üzerinden başlatır; bu yüzden 0.6.1 ve öncesi, yerel veya genel kurulduğunda ya da `npx` ile çalıştırıldığında, 0 koduyla çıkıp hiçbir şey yazdırmıyordu; yalnızca `node .../dist/index.js` çalışıyordu. 0.6.2 gerçek yolları karşılaştırır. `npm i -g @qorechain/rdk-cli` sonrasında `qorollup ...` çalışır.
* **Sürümler doğru yazdırılır.** Önceki sürümlerde `qorollup --version` `0.4.1`, `create-qorechain-rollup --version` ise `0.2.0` yazdırıyordu; ikisi de artık kendi `package.json` dosyasını okur (27 Ekim 2026'da kontrol edildi: `qorollup --version` `0.6.2` yazdırır).

**0.6.1'de neler değişti** (bir satır aksini söylemedikçe beş dilin hepsinde; tam liste [sürüm notlarında](https://github.com/qorechain/qorechain-rdk/releases/tag/v0.6.1) yer alır):

* **Makbuz doğrulaması her alanı karşılaştırır.** `verifySettlementReceipt` artık makbuzun belirttiği her çıpa alanının zincirin çıpasına eşit olmasını (uyuşmazlık alanı adıyla bildirir), `batchStateRoot` değerinin zincirin toplu iş köküne eşit olmasını ister ve zincirden herhangi bir şey okunmadan önce bilinmeyen bir `version` taşıyan veya `ML-DSA-87` dışında bir `algorithm` taşıyan makbuzu reddeder. Sonuç, zincirin eşleşen `anchor` değerini ve geçerliyse zincir durumundan yeniden oluşturulmuş bir `verifiedReceipt` taşır; `qorollup receipt verify --json` bu zincirden okunan makbuzu `receipt` olarak döndürür. Bkz. [Yerleşim makbuzları](/rollups/settlement-receipts#what-060-verifies).
* **Native veri erişilebilirliği: `dataHash` alanını boş bırakın.** Her rollup profili `native` veri erişilebilirliğini kullanır; burada zincir, boş olmayan bir `data_hash` değerini yalnızca eşleşen bir blob zincir üstünde saklanmışsa kabul eder ve hiçbir işlem bir blob saklayamaz (bkz. [Veri Kullanılabilirliği](/rollups/data-availability)). Altı başlangıç şablonu, 0.6.0 ve öncesinde toplu işlerine bir veri karması koyuyordu; bu yüzden zincir, ücret ödendikten sonra her şablon toplu işini reddediyordu. Artık bunu boş bırakıyorlar; `SubmitBatchInput.dataHash` TypeScript'te isteğe bağlıdır (atlanması boş anlamına gelir), `dataHashError` (`data_hash_error`, `DataHashError`, `Rules.dataHashError`) kuralı sunar ve `RdkTxClient.submitBatch`, rollup'ı okuyabildiğinde (REST uç noktası olan bir hibrit istemci) böyle bir toplu işi yayınlamadan önce reddeder.
* **Optimistic şablonlar kanonik durum kökünü yayınlar.** Zincir, optimistic bir toplu işi kanonik geçiş köküne göre yargılar; bu, toplu işin önceki durum kökünün, veri karmasının ve işlem sayısının SHAKE-256 taahhüdüdür (RDK'da `batchTransitionRoot`; `transitionRootVersionFor` bağlı ağın uyguladığı bağlamayı seçer). `custom`, `multivm` ve `nft` şablonları eskiden sabit bir yer tutucu kök gönderiyordu; bu, zincirin denetlediği kanonik kökle eşleşmez. Artık kanonik kökü yayınlıyorlar ve yer tutucu kanıt göndermiyorlar. `nft` şablonunun `challenge.ts` dosyası toplu işi zincirden okur ve yalnızca kökü kanıtlanabilir biçimde yanlış olan bir toplu işe itiraz eder. Formülü elle yazmayın: bağlamanın gönderdiğiniz ağla eşleşmesi için `batchTransitionRoot` kullanın. Zincirin kendi denetimi her istemci için aynıdır; dolayısıyla durum kökü kanonik kök olmayan optimistic bir toplu işe, onu hangi istemci gönderirse göndersin başarıyla itiraz edilebilir.
* **Yeni yardımcılar.** `fraudProof`, `transitionRootVersionForBatch`, `SUPPORTED_RECEIPT_VERSIONS` ile `receiptSchemaError`, `RestClient.getProtocolFeatures` / `isProtocolFeatureEnabled` (rotası olmayan bir zincir "etkin değil" olarak okunur) ve `getAppliedPlanHeight`. `@qorechain/rdk` artık `@noble/hashes` paketine doğrudan bağımlıdır (geçiş kökü için SHAKE-256; zaten `@qorechain/sdk` üzerinden kurulmuştu). Şablonlar `@qorechain/rdk` `^0.6.1` sürümünü sabitler.

**0.6.0'da neler değişti** (bir satır aksini söylemedikçe TypeScript):

* **İmzalama.** `RdkClient.connectTx(signer, { pqcKeypair, rest })`, bir anahtar çifti verdiğinizde hibrit (secp256k1 + ML-DSA-87) imzalar; vermezseniz yalnızca klasik imzalar ve ağlar işlemi reddeder. `signer` bir `OfflineDirectSigner` olmalıdır ve ücret açık olmalıdır (bir `fee` veya bağlanırken bir `gasPrice`). Yeni `resolvePqcKeypair` ve `pqcKeypairFromEnv` yardımcıları, bir mnemonikten hem kanonik hem de eski (legacy) ML-DSA-87 anahtarını türetir ve hesabın zincir üstünde kaydettirdiği hangisiyse onu kullanır; hesap farklı bir anahtar tutuyorsa tahmin etmek yerine reddederler. `QORE_PQC_SEED_HEX`, ham bir özel anahtarla imzalayan bir operatör için bir tohum (seed) sağlar. Kit artık `@qorechain/sdk` `^0.9.0` sürümüne bağımlıdır; bu yüzden yeni bir kurulum tek bir SDK kopyası (0.9.0) tutar; 0.5.0 ile npm, SDK 0.8.3'ü kitin altına iç içe kurmuştu.
* **Demirlenmiş toplu işler.** `MsgSubmitBatch`, `anchor_signature` ve `validator_set_hash` taşır. `RdkTxClient.submitBatch`, çıpayı yalnızca istemci hibrit imzalıyorsa, bir REST uç noktası varsa ve **rollup'ın oluşturucusuysa** kendisi imzalar (zincir çıpayı oluşturucunun kayıtlı anahtarına karşı denetler); diğer her durumda eskisi gibi demirlenmemiş olarak gönderir. Demirlenmemiş göndermek yerine reddetmesi için `anchor: "require"`, hiç imzalamaması için `anchor: "off"` veya kendi edindiğiniz bir imzayı göndermek için `anchorSignature` geçirin. `anchorSignBytesForBatch`, bant dışında imzalayan bir oluşturucu için v2 baytlarını oluşturur; ayrı bir sıralayıcıya sahip bir rollup buna ihtiyaç duyar. Canlıda denenmedi.
* **Yerleşim makbuzları.** PQC hesap sorgusu tekil `/qorechain/pqc/v1/account/{address}` rotasını kullanır (0.5.0, ağların sunmadığı çoğul bir yol kullanıyordu). Doğrulama her iki çıpa imzalama baytı biçimini de destekler ve birini çıpanın yüksekliğine göre seçer, asla ikisini de denemez: v3.2.2 geçişinin altında v1, geçişten itibaren v2. Makbuz şeması v2 `chainId` kaydeder; doğrulama, başka bir zincirin düğümüne karşı denetlenen bir makbuzu reddeder ve bir `signBytesVersion` ile bir `chainBinding` denetimi bildirir. Sürüm 1 makbuzları hâlâ doğrulanır. Bkz. [Yerleşim makbuzları](/rollups/settlement-receipts).
* **Okumalar.** `getLatestBatch`, `/qorechain/rdk/v1/latest_batch/{rollup_id}` adresini çağırır (0.5.0, zincirin sunmadığı bir biçimi çağırıyordu) ve `listBatches` her sayfayı izler (`listBatchesPage` tek bir sayfayı okur). `RollupView`, `escrowBalance` taşır ve düğüm bildirdiğinde `challengeWindowSec`, `challengeBond` ve `proofSystem` taşır; `BatchView`, `submittedTime` taşır.
* **İtiraz pencereleri.** `batchChallengeWindow`, bir toplu işin penceresini zincirin hesapladığı gibi hesaplar ve yerel saate göre değil zincir ucuna (`getChainTip`) göre değerlendirir: kayıtlı bir gönderim zamanı olan toplu iş için blok süresinin saniyesi cinsinden (v3.2.4 kuralı: testnet'te 8.337.253 yüksekliğinden beri, mainnet'te 3.742.566 yüksekliğinden beri), aksi halde gönderim yüksekliğinden itibaren sayılan `window / 6` blok (yükseltme yüksekliğinden önce gönderilen toplu işler için kural). `qorollup status` komutunun arkasındaki sağlık kontrolü ve watchtower bunu kullanır (bkz. [Watchtower](/rollups/watchtower)).
* **VM'ler arası.** `encodeCrossVmCalldata` artık `executeCrossVMCall(uint8,string,bytes)` işlevini kodlar (düğümün çözdüğü düzen) ve bir `targetVm` alır. `isCrossVmPrecompileActive`, etkin precompile'ların canlı listesini okur (bkz. [Multi-VM](/rollups/multi-vm)).
* **Bir ücret ödenmeden önce denetlenen kurallar.** `rollupIdError`, bir yapılandırmayı doğrularken ve `createRollup` yayınlamadan önce ID dilbilgisini denetler; `withdrawalErrors`, `executeWithdrawal` yayınlamadan önce bir çekimi denetler.
* **Şablonlar.** İskeletlenmiş şablonlar `pqcKeypairFromEnv` üzerinden bağlanır; bu yüzden `create` ve `submit-batch` betikleri hibrit imzalar ve `@qorechain/rdk` `^0.6.0` sürümüne bağımlıydı (0.6.1 iskelet oluşturucusundan beri `^0.6.1`). `multivm-rollup` şablonu, precompile'ın canlı olduğunu denetler ve hedeften boş olmayan bir yanıt zorunlu kılar.
* **Python, Go, Rust ve Java.** Yukarıdaki okuma tarafı düzeltmeleri (tekil PQC rotası, `latest_batch`, çıpa imzalama baytları v2, itiraz penceresi kuralları, ID ve çekim denetimleri) diğer dört dilin yayınlanmış paketlerinde de bulunur.
* **Geriye dönük uyumsuz değişiklikler.** `encodeCrossVmCalldata` bir `targetVm` alır ve `CROSS_VM_DEFAULT_SIGNATURE` değişti. `RollupHealth` ve `BatchDeadline`, eski saniye tabanlı son tarih yerine bir `challengeWindow` taşır.

**0.7.0'da kalan sınırlar:**

* **ZK yerleşimi henüz hiçbir ağda kullanılamaz.** `defi` profili, `defi-rollup` şablonu ve `zk` yerleşimiyle oluşturulan her rollup etkilenir: zincirin henüz bir rollup için doğrulama anahtarı kaydetmenin yolu yoktur; bu yüzden her ZK toplu işi, ücreti ödendikten sonra reddedilir. Anahtar kaydı zincir v3.2.7 için planlanmıştır. O zamana kadar `optimistic` yerleşimi kullanın (bkz. [ZK / STARK ve Çekimler](/rollups/zk-stark-withdrawals)).
* **`defi` şablonunun demo devresi doğrulanamaz.** Bu bir `snarkjs` çarpıcı (multiplier) devresidir; oysa zincir, üç herkese açık girdiyle (önceki durum kökü, yeni durum kökü ve veri karması) BLS12-381 üzerinde Groth16 denetler. Anahtar kaydı var olduğunda bile demo devresinden gelen bir kanıt geçmez; devreyi kendi durum geçişi devrenizle değiştirin.
* **0.7.0'da düzeltildi: çekim Merkle yardımcıları.** 0.6.2 ve öncesinde yardımcılar varsayılan olarak SHA-256 kullanıyordu ve varsayılanlarla oluşturulmuş bir kanıt zincirde hiç doğrulanmıyordu; 0.7.0'dan itibaren `withdrawalsTree` / `assembleWithdrawalProof` kullanın (bkz. [Yaprak ve düğüm kodlaması](/rollups/zk-stark-withdrawals#leaf-and-node-encoding)).

* **Yalnızca TypeScript istemcisi hibrit imzalar.** `qorollup` CLI'si (`create`, `pause`, `resume`, `stop` ve `withdraw` komutları kuantum sonrası bir anahtar olmadan bağlanır) ve **Python, Go, Rust ve Java** istemcileri yalnızca klasik imzalar; bunu her iki ağ da native hatta reddeder; README'leri hâlâ bunu söyler. Mesaj oluşturucularında `anchor_signature` veya `validator_set_hash` alanı yoktur. Bunlardan işlem göndermek için zincir CLI'siyle oluşturup imzalayın (`--generate-only`, ardından `qorechaind tx pqc cosign`) veya TypeScript istemcisini bir `pqcKeypair` ile kullanın.
* **Hiçbir hibrit rollup oluşturma canlıda denenmedi,** çünkü hiçbir ağda rollup yoktur. Aynısı demirlenmiş toplu işler, çekimler ve makbuz akışının tamamı için de geçerlidir.
* **Demirleme oluşturucuyu gerektirir.** Bir toplu iş, aynı işlemde yalnızca oluşturucunun imzası içindeyse demirlenir. Sıralayıcı başka bir adresse, oluşturucunun v2 baytlarını bant dışında imzalaması ve sıralayıcının sonucu göndermesi gerekir.
* **`0x…0901` adresindeki VM'ler arası precompile hâlâ hiçbir ağda etkin değildir**, bu yüzden bir sözleşmeden yapılan çağrı mainnet'te hiçbir şey yapmaz ve test ağında da henüz kullanılabilir değildir (bkz. [Multi-VM](/rollups/multi-vm)).
* **İtiraz penceresi uzunluğu.** Kit, bir rollup'ın kendi penceresini yalnızca düğüm bildirdiğinde okur (paket bunu v3.2.4 ve sonrası olarak belgeler; her iki ağ da bunu çalıştırır). Aksi halde modülün varsayılan penceresini kullanır; kendi penceresini yapılandırmış bir rollup için `challengeWindowSecs` geçirin. Daha eski `challengeWindowDeadline` ve `isChallengeWindowClosed` yardımcıları hâlâ dışa aktarılır ve hâlâ saniye alır; bu yüzden onlara bir blok yüksekliği vermeyin.
* **Veri kullanılabilirliği.** Hiçbir işlem blob yayınlamaz; bu yüzden `native` veya `both` bir rollup'taki bir toplu iş `dataHash` alanını boş bırakmalıdır (bkz. [Veri Kullanılabilirliği](/rollups/data-availability)). `buildDaBlob`, 0.6.2 ve öncesinde SHA-256 ile karmalıyordu; 0.7.0'dan itibaren taahhüdü zincirin SHAKE-256 değeridir.

**0.7.0 öncesi sürümler.** 0.6.2 ve öncesi, zincirde hiç doğrulanmayan çekim kanıtları oluşturur ve `buildDaBlob` değerini SHA-256 ile karmalar; 0.7.0'ı kullanın. 0.6.1 ve öncesi, `qorollup` CLI'sini npm'den hiçbir şey yazdırmayan ve 0 koduyla çıkan bir durumda kuruyordu (0.6.2'de düzeltildi). 0.6.0, makbuz doğrulamasında 0.6.1'den daha az alanı karşılaştırır ve zincirin reddettiği toplu işleri gönderen şablonlar sunar (native DA'lı bir rollup'ta bir veri karması, optimistic olanlarda bir yer tutucu durum kökü). 0.5.0 ve öncesi yerleşim makbuzları, watchtower veya VM'ler arası calldata için kullanılmamalıdır: 0.5.0, oluşturucunun anahtarını ağların sunmadığı bir rotada arıyordu (bu yüzden makbuz doğrulaması her gerçek makbuzda kapalı başarısız oldu), yalnızca v1 çıpa mesajını yeniden oluşturuyordu, bir blok yüksekliğini zaman damgası olarak okuyordu (her toplu iş yaşı ve itiraz son tarihi yanlıştı ve watchtower her toplu iş için son tarih uyarısını hemen veriyordu), zincirin sunmadığı bir latest-batch rotasını çağırıyordu, yalnızca ilk 50 toplu işi okuyordu, precompile'ın çözmediği bir işlevi kodluyordu ve yalnızca klasik imzalayan şablonlar gönderiyordu. 0.4.x işlem istemcisinde hibrit imzalama yoktu.

#### Python, Go, Rust ve Java istemcileri

TypeScript paketinin yanı sıra RDK, TypeScript yüzeyini yansıtan tam **Python**, **Go**, **Rust** ve **Java** istemcileri sunar: doğrulamalı yapılandırma oluşturucu, beş ön ayar profili, denom/ekonomi/bech32 yardımcı programları, ikili-Merkle ve çekim (withdrawal) kanıtı yardımcıları, rollup manifestleri, REST ve `qor_` JSON-RPC okuma istemcileri, ön kontrol/sağlık kontrolleri, hesaplar (mnemonik → `qor` adresi) ve klasik işlem imzalama + yayınlama (`SIGN_MODE_DIRECT`, hibrit imzalı ağlarda kabul edilmez — bkz. [RDK 0.7.0: değişiklikler ve sınırlar](#rdk-050-limits)). Hepsi paylaşılan diller arası altın (golden) vektörlere karşı doğrulanmıştır ve kendi kayıt defterlerine **yayınlanmıştır**:

```bash
# Python — qorechain-rdk olarak kurulur, qorrdk olarak içe aktarılır
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go (sürümü sabitleyin)
go get github.com/qorechain/qorechain-rdk/packages/go@v0.7.0

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.7.0
```

```python
import qorrdk
```

Güncel yayınlanmış sürümlerin hepsi **0.7.0**'dır (27 Ekim 2026'da kontrol edildi): Python `qorechain-rdk` (PyPI, `qorrdk` olarak içe aktarılır), Go modülü `github.com/qorechain/qorechain-rdk/packages/go` (`v0.7.0`), Rust `qorechain-rdk` (crates.io) ve Java `io.github.qorechain:qorechain-rdk` (Maven Central). Bu istemciler zincir durumunu okur; ağların gerektirdiği hibrit imzayı hâlâ üretmezler ve mesaj oluşturucularında çıpa alanları yoktur (bkz. [RDK 0.7.0: değişiklikler ve sınırlar](#rdk-050-limits)).

:::note
TypeScript RDK ve şablonları varsayılan olarak **`qorechain-diana`** test ağını kullanır ve ön ayarlar kutudan çıktığı gibi herkese açık canlı uç noktalara ulaşır. Sürümleri sabitleyin ve mainnet öncesinde test ağında doğrulayın.
:::

### `create-qorechain-rollup` ile bir proje iskeleti oluşturma {#scaffold-a-project-with-create-qorechain-rollup}

Her profilin eşleşen bir başlangıç şablonu vardır (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Şu iki formdan biriyle bir iskelet oluşturun:

```bash
npm create qorechain-rollup my-rollup
# veya
npx create-qorechain-rollup my-rollup
```

Etkileşimsiz / CI kullanımı için şablonu ve ağı açıkça belirtin:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

İskelet oluşturucu, belgelenmiş stake ve oluşturma yakımı (creation-burn) maliyetini ve rollup'ınızı oluşturmak ve durumunu okumak için sonraki adımları yazdırır.

:::caution İskeletlenmiş betikler neler yapabilir
`create-qorechain-rollup` 0.7.0 şablonları `@qorechain/rdk` `^0.7.0` sürümüne bağımlıdır. `create` ve `submit-batch` betikleri, kuantum sonrası anahtarınızı `QORE_MNEMONIC` değerinden (veya `QORE_OPERATOR_PRIVATE_KEY_HEX` ile imzalıyorsanız `QORE_PQC_SEED_HEX` değerinden) çözen, zincire karşı denetleyen ve hibrit imzalayan `src/signer.ts` içindeki `connectOperator()` üzerinden bağlanır; ikisi de ayarlı değilse betik uyarı verir ve yalnızca klasik imzalar; bunu her iki ağ da reddeder. Hiçbir ağda bir şablon aracılığıyla rollup oluşturulmamıştır; bu yüzden bu yol canlıda denenmemiştir. Başlangıç şablonunun `submit-batch` betiği yalnızca bir referans akıştır: 0.6.1'den beri `dataHash` alanını boş bırakır (zincir, native DA'lı bir rollup'ta veri karmasını reddeder) ve optimistic şablonlar yer tutucu yerine kanonik durum kökünü yayınlar; geri kalanı için hâlâ örnek değerler kullanır ve canlı bir ağda bir toplu işi sonlandırması beklenmez. `defi-rollup` şablonu (ZK), 0.7.0'dan itibaren bir toplu iş göndermeden önce durur, çünkü zincir onu reddederdi (bkz. [ZK / STARK ve Çekimler](/rollups/zk-stark-withdrawals)).
:::

### Koddan bir rollup yapılandırması oluşturma

Bir ön ayardan bir yapılandırma oluşturun, zincirden güncel stake ve yakım oranını okuyun ve oluşturma mesajını üretin. Yapılandırma oluşturucu, yerleşim → kanıt uyumluluk matrisini `validate()` / `build()` üzerinde zorunlu kılar. Ortaya çıkan değerleri yukarıdaki CLI ile veya bir `pqcKeypair` verilmiş TypeScript istemcisiyle gönderin — bkz. [RDK 0.7.0: değişiklikler ve sınırlar](#rdk-050-limits).

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read of /qorechain/rdk/v1/params, served on both networks.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// The values to pass to `qorechaind tx rdk create-rollup`.
const msg = config.toCreateMsg("<your qor address>", { stakeAmount: params.minStakeForRollup });
console.log(msg.rollupId, msg.profile, msg.vmType, msg.stakeAmount);
```

Hangi profilin uygun olduğundan emin değil misiniz? `rdk.suggestProfile(...)`'ın QCAI destekli bir öneri döndürmesi amaçlanmıştır; mevcut herkese açık uç noktalarda her zaman `defi` yedeğini (`source: "fallback"`) döndürür, bu yüzden [profil tablosundan](/rollups/preset-profiles) seçin.

### Koddan durumu okuma

Tipli REST istemcisi bir imzalayana ihtiyaç duymaz ve her iki ağı da okur:

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

Toplu işler için `rdk.rest.getBatch(rollupId, index)` veya `qorechaind query rdk batch [rollup-id]` komutunu kullanın (aşağıda); `getLatestBatch` ve `listBatches`, 0.6.0'dan beri zincirin `latest_batch` rotasını ve toplu iş listesinin her sayfasını okur (bkz. [RDK 0.7.0: değişiklikler ve sınırlar](#rdk-050-limits)).

---

## Yaşam döngüsü yönetimi

Bir rollup `pending`, `active`, `paused` ve `stopped` durumları arasında ilerler; yeni bir rollup hemen `active` olarak başlar. Yalnızca oluşturucu onu duraklatabilir, devam ettirebilir veya durdurabilir (zincir sürümü v3.2.0'dan itibaren zorunlu kılınır). Aşağıdaki her komut, oluşturmayla aynı iki adımlı kalıbı izler: imzasız işlemi oluşturun, ardından ortak imzalayın.

### Duraklat

Rollup'ı geçici olarak durdurun. Durum korunur ve rollup devam ettirilebilir. Bir neden dizesi gereklidir.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > pause.json
qorechaind tx pqc cosign pause.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Devam ettir

Daha önce duraklatılmış bir rollup'ı devam ettirin.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > resume.json
qorechaind tx pqc cosign resume.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Durdur

Rollup'ı kalıcı olarak devre dışı bırakın ve stake'ini serbest bırakın. Stake edilen QOR — tek seferlik oluşturma yakımı düşülerek ve rollup'ın emanetinden çekimler veya hile kanıtı ödülleri yoluyla zaten ödenmiş olan her şey düşülerek — oluşturucuya iade edilir: v3.2.3'ten beri rollup başına bir emanet defteri her rollup'ın hâlâ ne tuttuğunu kaydeder, `stop-rollup` tam olarak o bakiyeyi iade eder ve durdurulmuş bir rollup artık çekim ödemez. 1,000 QOR'luk katman kayıt stake'i, rollup'ın katmanı devre dışı bırakıldığında ayrıca iade edilir.

**Zincir v3.2.5'ten itibaren (her iki ağ):** son toplu işi `submitted` veya `challenged` durumundaki bir rollup durdurulamaz; bu yüzden önce onu yerleştirin veya sonlandırın; durdurulmuş bir rollup, modülün rollup sınırı altındaki yuvasını boşaltır. v3.2.5'ten önce bu kuralların hiçbiri geçerli değildi. TypeScript'ten `stopRollupError` ve `stopRollup` içindeki ön kontrol, ücreti ödemeden önce sizi bilgilendirir.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > stop.json
qorechaind tx pqc cosign stop.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

:::danger
Bir rollup'ı durdurmak kalıcıdır. Durdurulduktan sonra rollup yeniden başlatılamaz.
:::

---

## Operatör komutları: toplu işler ve itirazlar

Rollup operatörleri yerleşim toplu işlerini (settlement batch) gönderir ve itiraz edenler (challenger) iyimser (optimistic) toplu işlere itiraz edebilir. Bu komutlar, **[Rollup'lara Genel Bakış](/rollups/overview)** ve **[ZK / STARK ve Çekimler](/rollups/zk-stark-withdrawals)** bölümlerinde açıklanan yerleşim katmanının temelini oluşturur.

### Kim, hangi sırayla gönderebilir

* **Toplu işleri yalnızca rollup'ın yapılandırılmış sıralayıcı adresi — veya hiçbiri yapılandırılmamışsa (tüm ön ayarlarda böyledir) oluşturucusu — gönderebilir.** Based ve shared sıralama henüz önerici kümelerini veya listelerini (roster) kabul etmez: bugün yalnızca etikettirler ve gönderimi oluşturucu yapar.
* Toplu işler bir zincir oluşturur: ilk toplu işin dizini `0`'dır; sonraki her toplu iş bir sonraki dizini kullanmalı ve önceki toplu işin durum kökünü `prev_state_root` olarak taşımalıdır.
* `native` veya `both` bir rollup'ta bir veri karması (data hash) taşıyan toplu iş, eşleşen bir blob zaten saklanmadıkça reddedilir (bkz. [Veri Kullanılabilirliği](/rollups/data-availability)). Veri karması olmayan bir toplu iş denetlenmez.
* Bir `zk` rollup'ı bir kanıt eklemelidir ve kanıt doğrulanmalıdır; henüz hiçbir ZK toplu işi kabul edilemez (bkz. [ZK / STARK ve Çekimler](/rollups/zk-stark-withdrawals)).
* **Zincir v3.2.5'ten itibaren (her iki ağ):** bir toplu işin `withdrawals_root` değeri boş veya tam olarak 32 bayt olmalıdır ve bir rollup en fazla 4,096 bekleyen optimistic toplu iş tutar (RDK'da `MAX_PENDING_OPTIMISTIC_BATCHES`); toplu işler ayrıca dizin sırasıyla sonlanır, bu yüzden sonraki bir toplu iş hâlâ `submitted` veya `challenged` durumundaki daha önceki birini bekler. RDK, kökün uzunluğunu her gönderimden önce denetler. v3.2.5'ten önce bu üç kuralın hiçbiri geçerli değildi.

### Bir toplu iş gönderme {#submit-a-batch}

Bir rollup için bir yerleşim toplu işi gönderin. Rollup ID'sini, bir toplu iş dizinini ve hex kodlu bir durum kökünü (state root) alır. İlkinden sonraki her toplu iş için önceki toplu işin durum kökünü `--prev-state-root` olarak geçirin.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --prev-state-root <previous-state-root-hex> --tx-count 120 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| Bayrak | Açıklama |
| ---- | ----------- |
| `--prev-state-root` | Toplu işin başladığı hex durum kökü (`0` dizininden sonraki her toplu iş için gereklidir) |
| `--tx-count` | Toplu işteki rollup işlemlerinin sayısı |
| `--data-hash` | Bir DA blob'u olarak gönderilen toplu iş verisinin hex karması (bugün boş bırakın: bir blob göndermenin yolu yok, bkz. [Veri Kullanılabilirliği](/rollups/data-availability)) |
| `--withdrawals-root` | Toplu işin L2 → L1 çekimlerinin hex Merkle kökü (bkz. [ZK / STARK ve Çekimler](/rollups/zk-stark-withdrawals)) |
| `--anchor-signature` | Rollup **oluşturucusunun** v2 çıpa imza baytları üzerindeki hex ML-DSA-87 imzası (v3.2.2'den beri); toplu iş ardından aynı işlemde `x/multilayer` içinde demirlenir ve reddedilen bir çıpa toplu işi reddeder |
| `--validator-set-hash` | Çıpada taşınan ve imzanın kapsadığı hex doğrulayıcı kümesi taahhüdü |

`--anchor-signature` olmadan toplu iş **demirlenmemiş** olarak yerleşir. Bir toplu işi demirlemek için imzalanacak baytları yazdırın, oluşturucunun kayıtlı kuantum sonrası anahtarıyla imzalayın ve imzayı geçirin (`--tx-count` ve `--validator-set-hash` değerleri gönderdiklerinizle eşleşmelidir):

```bash
qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex] \
  --chain-id qorechain-diana --tx-count 120
```

`layer-id`, rollup'ın katman kimliğidir (RDK tarafından oluşturulan rollup'lar için rollup ID'si). TypeScript'ten, `@qorechain/rdk` 0.6.0 ve sonrasındaki `RdkTxClient.submitBatch`, istemci hibrit imzaladığında ve rollup'ın oluşturucusu olduğunda çıpayı sizin için imzalar; `anchorSignBytesForBatch` ise bir oluşturucuya bant dışında imzalayacağı baytları verir (bkz. [RDK 0.7.0: değişiklikler ve sınırlar](#rdk-050-limits)). Bir `zk` rollup'ı için ZK `--proof` bugün bir CLI bayrağına sahip değildir ve resolve-challenge mesajı bir CLI komutu değildir: bir istemci kullanın. Bir çıpanın neyi kanıtladığı ve neyi kanıtlamadığı için bkz. [Yerleşim makbuzları](/rollups/settlement-receipts). Henüz her iki ağda da rollup, katman veya çıpa yoktur.

### Bir toplu işe itiraz etme (iyimser rollup'lar) {#challenge-a-batch-optimistic-rollups}

Herhangi bir hesap, itiraz penceresi içinde (mainnet'te 3.742.566 yüksekliğinden önce gönderilen bir toplu iş için varsayılan olarak 100,800 blok; v3.2.4'ten itibaren yeni toplu işler için blok süresinin saniyesi cinsinden bir pencere: testnet'te 8.337.253 yüksekliğinden beri, mainnet'te 3.742.566 yüksekliğinden beri) `submitted` durumundaki bir toplu işe, bir bağ (rollup'ın `challenge_bond`'u; `nft` ve `custom` ön ayarları için 1,000 QOR) ve bir hile kanıtı yatırarak itiraz edebilir. Optimistic bir toplu iş, durum kökünün kanonik geçiş kökü olup olmadığına göre yargılanır; bu yüzden gönderen tam olarak o kökü yayınlamalıdır (RDK şablonları 0.6.1'den beri bunu yapar; bkz. [RDK 0.7.0: değişiklikler ve sınırlar](#rdk-050-limits)). Rollup ID'sini ve toplu iş dizinini alır; hile kanıtını `--proof` ile geçirin:

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > challenge.json
qorechaind tx pqc cosign challenge.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| Bayrak | Açıklama |
| ---- | ----------- |
| `--proof` | Hex kodlu hile kanıtı |

Bir itiraz toplu işi **dondurur** (`challenged`): sonlandırılamaz. v3.2.5'ten önce bunu yalnızca rollup oluşturucusu çözebilirdi; v3.2.5'ten itibaren (her iki ağ) aşağıda açıklandığı gibi **herhangi bir hesap** çözebilir. Çözüm, bir resolve-challenge mesajıyla gönderilir (CLI komutu olarak sunulmaz; bir istemci kullanın). Zincir, saklanan kanıtı doğrulayarak sonuca kendisi karar verir. Hile onaylanırsa toplu iş `rejected` olur, bağ iade edilir ve itiraz eden, rollup'ın stake'inden bağa eşit ek bir tutar alır; reddedilirse bağ oluşturucuya gider ve toplu iş `submitted` durumuna döner.

**Zincir v3.2.5'ten itibaren (her iki ağ):** bir itirazı yalnızca oluşturucu değil, **herhangi bir hesap** çözebilir. Onaylanan bir hile, o toplu işi **ve henüz sonlandırılmamış sonraki her toplu işi** reddeder; sıralayıcı bu toplu işleri son iyi durum kökünden, aynı dizinler altında yeniden gönderir ve rollup oradan devam eder. Watchtower bu tür toplu işleri dizin ve durum köküne göre ayırt eder (bkz. [Watchtower](/rollups/watchtower)).

### Toplu işleri inceleme

```bash
# Bir rollup için en son toplu iş
qorechaind query rdk batch [rollup-id]

# Dizine göre belirli bir toplu iş
qorechaind query rdk batch [rollup-id] --index 42

# Dizin sırasına göre bir toplu iş sayfası (--limit en fazla 100, varsayılan 50)
qorechaind query rdk batches [rollup-id] --start 0 --limit 50
```

---

## Sorgulama

| Komut | Amaç |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Belirli bir rollup'ın detayları |
| `qorechaind query rdk list-rollups` | Tüm kayıtlı rollup'lar |
| `qorechaind query rdk batch [rollup-id]` | En son yerleşim toplu işi (veya `--index`) |
| `qorechaind query rdk batches [rollup-id]` | Dizin sırasına göre bir toplu iş sayfası (`--start`, `--limit`) |
| `qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex]` | Bir toplu iş için v2 çıpa imza baytları (çevrimdışı) |
| `qorechaind query rdk config` | RDK modül parametreleri |
| `qorechaind query rdk suggest-profile [use-case]` | `qor_suggestRollupProfile` RPC'sine bir yönlendirme yazdırır; herkese açık uç noktalar bunu sunmaz, bu yüzden [Ön Ayar Profilleri](/rollups/preset-profiles) tablosundan bir profil seçin |

---

## Sonraki adımlar

* **[Veri Kullanılabilirliği](/rollups/data-availability)** — native, Celestia ve yedekli DA arka uçları.
* **[ZK / STARK ve Çekimler](/rollups/zk-stark-withdrawals)** — kanıt doğrulama ve `execute-withdrawal` üzerinden L2 → L1 çekim akışı.
