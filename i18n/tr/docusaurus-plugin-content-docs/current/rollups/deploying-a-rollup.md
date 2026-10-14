---
slug: /rollups/deploying-a-rollup
title: Bir Rollup Dağıtma
sidebar_label: Bir Rollup Dağıtma
sidebar_position: 3
---

# Bir Rollup Dağıtma

Uygulamaya özel bir rollup'ı üç şekilde kurabilirsiniz: **Dashboard** üzerinden (bir talep formu, zincir üstü bir işlem değil), zincir **CLI**'si üzerinden (`qorechaind`, zincir üstü işlem üzerinde tam kontrol) veya **TypeScript RDK** ile (`@qorechain/rdk` artı `create-qorechain-rollup` iskelet oluşturucu); RDK bugün yapılandırmayı ve okumaları kapsar. Bu sayfa her üçünü de, operatör yaşam döngüsünü ve toplu (batch) komutları kapsar.

:::caution Erken aşama yetenek
Henüz her iki ağda da herhangi bir rollup oluşturulmadı. Aşağıdaki komutlar **`qorechain-diana`** test ağını kullanır (EVM zincir ID **9800**, zincir sürümü **v3.2.2**). Mainnet (**`qorechain-vladi`**, EVM zincir ID **9801**) **v3.2.1** zincir sürümünü çalıştırır; bu sayfa mainnet davranışını anlatır ve test ağının daha yeni sürümü ayrıntılarda farklılık gösterebilir. Her dağıtımı önce test ağında doğrulayın.
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
| **Rollup ID'si** | 3–64 karakter kullanın: küçük harfler, rakamlar, `.`, `_` ve `-`; bir harf veya rakamla başlamalıdır. Daha yeni zincir sürümleri bu kuralı zorunlu kılar, bu yüzden en baştan kullanın |
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
3. **Bir sanal makine seçin.** Zincir üstü kayıt bir VM etiketi saklar. Rollup'ınız kendi çalışma zamanında zincir dışında yürütülür; bu seçim QoreChain'in kendi EVM, CosmWasm veya SVM hatlarında çalışmaz:
   * **EVM** — tam Ethereum araç setiyle (Hardhat, Foundry, MetaMask) Solidity / Vyper sözleşmeleri
   * **CosmWasm** — Cosmos SDK çalışma zamanında, yerel IBC ile Rust akıllı sözleşmeleri
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

`defi` gibi bir ZK profili oluşturma sırasında kabul edilir, ancak bu şekilde oluşturulan bir rollup doğrulama anahtarı taşımaz; bu yüzden ZK toplu işleri henüz sonlandırılamaz (bkz. [ZK / STARK ve Çekimler](/rollups/zk-stark-withdrawals)).

**Bayraklar:**

| Bayrak | Varsayılan | Açıklama |
| ---- | ------- | ----------- |
| `--vm` | *(boş — profilin VM'sini kullanır)* | Rollup VM türünü geçersiz kılar: `evm`, `cosmwasm`, `svm` veya `custom`. Ön ayarın VM'sini uygulamak için ayarlamadan bırakın. (RDK istemcilerinde Wasm çalışma zamanı **`native`** VM türüdür — QoreChain Native — `cosmwasm` ise eski (legacy) bir takma ad olarak korunur; `cosmwasm` tel üzerindeki (on-wire) değerdir ve bu zincir seviyesi bayrağın aldığı değer de budur.) |

:::note VM etiketi bir üst veridir
`--vm`, rollup'ınızın hangi çalışma zamanını kullandığını kaydeder. Ana zincir yalnızca rollup'ı yerleştirir (settle); sözleşmelerini yürütmez. Ana zincirin kendi CosmWasm yüklemesi şu anda kapalıdır ve SVM işlem hattı ağ genelinde devre dışıdır; bu, zincir dışı bir rollup'ın yerleşimini etkilemez, ancak bir rollup için sözleşmeleri bu ana zincir hatlarına dağıtamayacağınız anlamına gelir.
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

Rollup Development Kit, CLI ile aynı zincir üstü `x/rdk` modülü için iki herkese açık npm paketi olarak sunulur. Bugün en çok yapılandırmaları oluşturmak ve doğrulamak ve durumu okumak için işe yararlar; işlem göndermek için onlara güvenmeden önce aşağıdaki imzalama uyarısına bakın:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.4`) — TypeScript SDK'sı: ön ayar profilleriyle bir yapılandırma oluşturucu, rollup ve yerleşim toplu iş (settlement-batch) yaşam döngüleri için işlem yardımcıları, native DA, tipli okuma istemcileri ve v0.4 eklemeleri — kuantum güvenli yerleşim makbuzları, QCAI Rollup Copilot, VM'ler arası calldata yardımcıları ve watchtower.
* **`create-qorechain-rollup`** (`v0.4.4`) — profil başına bir çalıştırılabilir başlangıç şablonunu (`multivm-rollup` şablonu dahil) klonlayan bir iskelet oluşturucu.

Bunlar npm'e yayınlanmıştır. Depo ayrıca yayınlanmış bir operatör CLI'si olan **`@qorechain/rdk-cli`**'yi (`qorollup`, `v0.4.4`) sunar; bu, `doctor`, `create`, `status`, `watch`, `params`, `suggest`, yaşam döngüsü komutları (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` ve `faucet` komutlarına, artı v0.4'ün `receipt`, `advise` ve `watchtower` komutlarına sahiptir.

İlk v0.4.0 sürümünden bu yana öne çıkanlar:

* **v0.4.2 — kutudan çıktığı gibi canlı ağa karşı çalışır.** `mainnet` ve `testnet` ön ayarları artık herkese açık `qore.host` uç noktalarını (`api.qore.host` / `api-testnet.qore.host` adresindeki REST) barındırıyor, böylece `createRdkClient({ network })` elle bir `endpoints` yapılandırması olmadan zincire ulaşır — yalnızca kendi düğümünüzü hedeflemek için geçersiz kılın. Aynı sürüm, Wasm rollup VM tanımlayıcısını **`native`** (QoreChain Native) olarak yeniden adlandırdı; `cosmwasm` kabul edilen eski bir takma ad olarak kalır ve ikisi de tel üzerinde `cosmwasm`'a eşlenir — zincir, gezgin (explorer) ve Dashboard değişmedi.
* **v0.4.3 — SDK'nın hibrit imza kodlama düzeltmesi için bağımlılık güncellemesi.** RDK işlem istemcisinin kendisi hâlâ yalnızca klasik imzalama yapar (aşağıdaki uyarıya bakın).
* **v0.4.4 — `@qorechain/sdk` `^0.7.0`'ı izler**, zincir **v3.1.85** yetkilendirici (authenticator) hatları için olan SDK sürümü; böylece bu yetenekler RDK'nın TypeScript kullanıcılarına SDK üzerinden doğrudan ulaşır. RDK API'sinde değişiklik yok.

:::caution Yayınlanmış istemcilerle imzalama
Her iki ağ da her native hat işleminde hibrit (secp256k1 + ML-DSA-87) imza gerektirir. Şu anda yayınlanmış npm paketi (`@qorechain/rdk` 0.4.4) yalnızca klasik imzalayan bir istemci üzerinden imzalar; bu yüzden zincir durumunu **okuyabilir** ancak bir işlemin kabul edilmesini sağlayamaz. Bugün işlemler için CLI ile (`--generate-only`, ardından `qorechaind tx pqc cosign`) veya [`@qorechain/sdk`](/sdk/overview) içindeki hibrit imzalama ile oluşturup imzalayın. Python, Go, Rust ve Java RDK istemcileri de yalnızca klasik imzalar ve bu ağlarda **işlemler için uygun değildir**. Kurduğunuz sürümü kontrol edin; RDK istemcilerine hibrit imzalama ekleyen sürümler burada duyurulacaktır.
:::

:::note Okumalar RDK REST rotalarını gerektirir
TypeScript okuma yardımcıları (`rdk.params()`, `rdk.rest.getRollup()`) `/qorechain/rdk/v1/…` REST rotalarını çağırır; herkese açık mainnet uç noktaları bugün bu rotaları sunmaz. Mainnet'te `qorechaind query rdk …` (gRPC) kullanın.
:::

#### Python, Go, Rust ve Java istemcileri

TypeScript paketinin yanı sıra RDK, TypeScript yüzeyini yansıtan tam **Python**, **Go**, **Rust** ve **Java** istemcileri sunar: doğrulamalı yapılandırma oluşturucu, beş ön ayar profili, denom/ekonomi/bech32 yardımcı programları, ikili-Merkle ve çekim (withdrawal) kanıtı yardımcıları, rollup manifestleri, REST ve `qor_` JSON-RPC okuma istemcileri, ön kontrol/sağlık kontrolleri, hesaplar (mnemonik → `qor` adresi) ve klasik işlem imzalama + yayınlama (`SIGN_MODE_DIRECT`, hibrit imzalı ağlarda kabul edilmez — yukarıdaki uyarıya bakın). Hepsi paylaşılan diller arası altın (golden) vektörlere karşı doğrulanmıştır ve kendi kayıt defterlerine **yayınlanmıştır**:

```bash
# Python — qorechain-rdk olarak kurulur, qorrdk olarak içe aktarılır
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.4
```

```python
import qorrdk
```

Güncel yayınlanmış sürümler: Python `qorechain-rdk` **0.5.0** (PyPI, `qorrdk` olarak içe aktarılır), Go modülü `github.com/qorechain/qorechain-rdk/packages/go` (**v0.5.0**), Rust `qorechain-rdk` **0.4.4** (crates.io) ve Java `io.github.qorechain:qorechain-rdk` **0.4.4** (Maven Central). Bu istemciler zincir durumunu okur; ağların gerektirdiği hibrit imzayı üretmezler (yukarıdaki uyarıya bakın).

:::note
TypeScript RDK ve şablonları varsayılan olarak **`qorechain-diana`** test ağını kullanır ve v0.4.2'den beri ön ayarlar kutudan çıktığı gibi herkese açık uç noktalara ulaşır. Sürümleri sabitleyin ve mainnet öncesinde test ağında doğrulayın.
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

:::caution Şablonun kurduğu RDK sürümünü kontrol edin
Şablonlar şu anda `@qorechain/rdk`'yı 0.2 serisine sabitler. İskeleti oluşturduktan sonra, herkese açık `qore.host` uç nokta ön ayarlarını ve güncel okuma istemcilerini almak için `npm install @qorechain/rdk@latest` komutunu çalıştırın. Başlangıç şablonunun `submit-batch` betiği yalnızca bir referans akıştır: örnek kökler ve örnek bir kanıt gönderir ve canlı bir ağda bir toplu işi sonlandırması beklenmez.
:::

### Koddan bir rollup yapılandırması oluşturma

Bir ön ayardan bir yapılandırma oluşturun, zincirden güncel stake ve yakım oranını okuyun ve oluşturma mesajını üretin. Yapılandırma oluşturucu, yerleşim → kanıt uyumluluk matrisini `validate()` / `build()` üzerinde zorunlu kılar. Ortaya çıkan değerleri yukarıdaki CLI ile (veya hibrit imzalayan bir istemciyle) gönderin — imzalama uyarısına bakın.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read: it works where the RDK REST routes are served and
// is refused (HTTP 501) on mainnet today — use `qorechaind query rdk config` there.
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

Tipli REST istemcisi bir imzalayana ihtiyaç duymaz ve RDK REST rotalarının sunulduğu yerlerde çalışır (bugün mainnet'te değil):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

Toplu işler için `qorechaind query rdk batch [rollup-id]` komutunu kullanın (aşağıda).

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

Rollup'ı kalıcı olarak devre dışı bırakın ve stake'ini serbest bırakın. Stake edilen QOR — tek seferlik oluşturma yakımı düşülerek — oluşturucuya iade edilir. 1,000 QOR'luk katman kayıt stake'i, rollup'ın katmanı devre dışı bırakıldığında ayrıca iade edilir.

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
* Bir `zk` rollup'ı bir kanıt eklemelidir ve kanıt doğrulanmalıdır (bkz. [ZK / STARK ve Çekimler](/rollups/zk-stark-withdrawals)).

### Bir toplu iş gönderme

Bir rollup için bir yerleşim toplu işi gönderin. Rollup ID'sini, bir toplu iş dizinini ve hex kodlu bir durum kökünü (state root) alır.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

CLI komutu yalnızca bu üç konumsal argümanı alır, bu yüzden yalnızca **toplu iş 0**'ı gönderebilir; sonraki toplu işler `prev_state_root`'u (ve kullanıldığında `data_hash`, `withdrawals_root` ve `tx_count`'u) ayarlayabilen bir istemci gerektirir. Bir rollup'ın toplu işleri yerleştirilir (settled) ancak bugün mainnet'te `x/multilayer`'a **demirlenmez** (bkz. [Rollup Development Kit](/architecture/rollup-development-kit#state-anchoring)).

### Bir toplu işe itiraz etme (iyimser rollup'lar) {#challenge-a-batch-optimistic-rollups}

Herhangi bir hesap, itiraz penceresi içinde `submitted` durumundaki bir toplu işe, bir bağ (rollup'ın `challenge_bond`'u; `nft` ve `custom` ön ayarları için 1,000 QOR) ve bir hile kanıtı yatırarak itiraz edebilir. Rollup ID'sini ve toplu iş dizinini alır; hile kanıtını `--proof` ile geçirin:

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

Bir itiraz toplu işi **dondurur** (`challenged`): sonlandırılamaz. Ardından rollup **oluşturucusu** bunu bir resolve-challenge mesajıyla çözer (CLI komutu olarak sunulmaz; bir istemci kullanın). Zincir, saklanan kanıtı doğrulayarak sonuca kendisi karar verir. Hile onaylanırsa toplu iş `rejected` olur, bağ iade edilir ve itiraz eden, rollup'ın stake'inden bağa eşit ek bir tutar alır; reddedilirse bağ oluşturucuya gider ve toplu iş `submitted` durumuna döner.

### Toplu işleri inceleme

```bash
# Bir rollup için en son toplu iş
qorechaind query rdk batch [rollup-id]

# Dizine göre belirli bir toplu iş
qorechaind query rdk batch [rollup-id] --index 42
```

---

## Sorgulama

| Komut | Amaç |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Belirli bir rollup'ın detayları |
| `qorechaind query rdk list-rollups` | Tüm kayıtlı rollup'lar |
| `qorechaind query rdk batch [rollup-id]` | En son yerleşim toplu işi (veya `--index`) |
| `qorechaind query rdk config` | RDK modül parametreleri |
| `qorechaind query rdk suggest-profile [use-case]` | `qor_suggestRollupProfile` RPC'sine bir yönlendirme yazdırır; herkese açık uç noktalar bunu sunmaz, bu yüzden [Ön Ayar Profilleri](/rollups/preset-profiles) tablosundan bir profil seçin |

---

## Sonraki adımlar

* **[Veri Kullanılabilirliği](/rollups/data-availability)** — native, Celestia ve yedekli DA arka uçları.
* **[ZK / STARK ve Çekimler](/rollups/zk-stark-withdrawals)** — kanıt doğrulama ve `execute-withdrawal` üzerinden L2 → L1 çekim akışı.
