---
slug: /rollups/deploying-a-rollup
title: Bir Rollup Dağıtma
sidebar_label: Bir Rollup Dağıtma
sidebar_position: 3
---

# Bir Rollup Dağıtma

Uygulamaya özel bir rollup'ı üç şekilde dağıtabilirsiniz: **Dashboard** üzerinden (rehberli, kod yazmayı gerektirmeyen bir sihirbaz), zincir **CLI**'si üzerinden (`qorechaind`, zincir üstü işlem üzerinde tam kontrol) veya programatik olarak **TypeScript RDK** ile (`@qorechain/rdk` artı `create-qorechain-rollup` iskelet oluşturucu). Bu sayfa her üçünü de, operatör yaşam döngüsünü ve toplu (batch) komutları kapsar.

:::note
Aşağıdaki komutlar **`qorechain-diana`** test ağını hedef alır. Mainnet (**`qorechain-vladi`**, EVM zincir ID **9801**) 7 Haziran 2026'dan beri **v3.1.95** zincir sürümünü çalıştırarak canlıdır — mainnet'te dağıtım yaparken mainnet zincir ID'sini ve uç noktalarını kullanın. Her dağıtımı önce test ağında doğrulayın.
:::

---

## Gereksinimler

| Gereksinim | Detaylar |
| ----------- | ------- |
| **Minimum stake** | Rollup oluşturulduğunda QOR cinsinden bir stake bağı emanete alınır |
| **Oluşturma yakımı (burn)** | Stake edilen tutarın bir kısmı oluşturma sırasında kalıcı olarak yakılır; kalan tutar emanette tutulur ve rollup durdurulduğunda iade edilir |
| **Hesap** | Stake artı işlem ücretleri için yeterli bakiyeye sahip, fonlanmış bir QoreChain hesabı |

Dağıtımdan önce güncel minimum stake ve yakım oranı için canlı modül parametrelerini sorgulayın:

```bash
qorechaind query rdk config
```

---

## Dashboard üzerinden dağıtım (Tools → Rollups)

Dashboard, **Tools → Rollups** altında rehberli bir **Deploy a Rollup** sihirbazı sunar. Elle bir işlem oluşturmadan uygulamaya özel bir rollup başlatmanın en hızlı yoludur.

### Adımlar

1. **Oturum açın.** Sihirbazın dağıtım yapabilmesi ve mevcut dağıtımlarınızı listeleyebilmesi için kimlik doğrulanmış bir oturum gerekir.
2. **Rollup'ınıza bir isim verin.** Bir rollup adı girin (2–41 karakter: harfler, rakamlar, boşluklar, tireler veya alt çizgiler).
3. **Bir sanal makine seçin.** QoreChain üçlü VM'li bir zincirdir, bu yüzden rollup'ınız şunlardan herhangi birini çalıştırabilir:
   * **EVM** — tam Ethereum araç setiyle (Hardhat, Foundry, MetaMask) Solidity / Vyper sözleşmeleri
   * **CosmWasm** — Cosmos SDK çalışma zamanında, yerel IBC ile Rust akıllı sözleşmeleri
   * **SVM** — paralel yürütmeli, yüksek verimli uygulamalar için Solana Virtual Machine
4. **Bir veri kullanılabilirliği (DA) katmanı seçin.** Rollup'ınızın, herkesin durumu yeniden oluşturabilmesi için işlem verisini yayınladığı yer: **QoreChain DA**, **Celestia** veya **EigenDA**. EigenDA'nın bir Dashboard seviyesi seçenek olduğunu, zincir üstü `x/rdk` DA arka uçlarının ise native, Celestia veya her ikisi olduğunu unutmayın — bkz. [Veri Kullanılabilirliği](/rollups/data-availability).
5. **Bir gaz tokeni belirleyin.** Rollup'ınızda yürütme için ödeme yapmakta kullanılan token. Varsayılan olarak **QOR**'dur; kendi native tokeninizi kullanmak için özel bir sembol girin.
6. **Bir sıralayıcı (sequencer) seçin.** İşlemleri yerleşim (settlement) öncesinde kimin sıraladığı: **Shared sequencer** (QoreChain'in paylaşımlı seti), **Dedicated (single)** (kendi tek sıralayıcınızı çalıştırın) veya **Decentralized** (izinsiz bir sıralayıcı seti).
7. **Bir yerleşim (settlement) hedefi seçin.** Rollup'ın durum köklerini (state root) ve geçerlilik kanıtlarını nereye demirlediği: **QoreChain mainnet** veya **Ethereum**.
8. **Dağıtın.** Sihirbazı gönderin. Provizyon, rollup canlıya geçmeden önce **The Qore Trust** tarafından incelenir; bu yüzden yeni gönderilmiş bir rollup, inceleme tamamlanana kadar **provisioning** durumunda görünür.

Gönderdiğiniz rollup'lar, VM'leri, DA katmanları, gaz tokenleri, sıralayıcıları, yerleşim hedefleri ve güncel durumlarıyla birlikte **Your rollups** listesinde görünür.

:::note
Dashboard sihirbazı, kullanıcı dostu ve ürün seviyesinde seçenekler sunar ve provizyonu incelemeli bir hat üzerinden yönlendirir. Aşağıdaki CLI, `x/rdk` modülünün zincir üstü mesaj yüzeyine doğrudan karşı çalışır. İkisi de aynı temel kavramları (VM, DA, sıralayıcı, yerleşim) paylaşır ama bunları farklı seviyelerde sunar.
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
  --fees 500uqor
```

**Örnek** — `defi` ön ayarından bir rollup oluşturma (yerleşim, sıralayıcı, DA ve VM'nin tamamı ön ayardan gelir; `defi`, EVM üzerinde zk yerleşimine karşılık gelir):

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Bayraklar:**

| Bayrak | Varsayılan | Açıklama |
| ---- | ------- | ----------- |
| `--vm` | *(boş — profilin VM'sini kullanır)* | Rollup VM türünü geçersiz kılar: `evm`, `cosmwasm`, `svm` veya `custom`. Ön ayarın VM'sini uygulamak için ayarlamadan bırakın. (RDK istemcilerinde Wasm çalışma zamanı **`native`** VM türüdür — QoreChain Native — `cosmwasm` ise eski (legacy) bir takma ad olarak korunur; `cosmwasm` tel üzerindeki (on-wire) değerdir ve bu zincir seviyesi bayrağın aldığı değer de budur.) |

`[profile]` argümanı, otomatik olarak uygulanan bir ön ayar yapılandırması seçer — bkz. **[Ön Ayar Profilleri](/rollups/preset-profiles)**. `[stake-amount]`, `uqor` cinsinden bağdır.

### Dağıttığınızı inceleyin

```bash
# Belirli bir rollup'ı ID ile sorgula
qorechaind query rdk rollup my-defi-rollup

# Kayıtlı tüm rollup'ları listele
qorechaind query rdk list-rollups
```

---

## TypeScript RDK (`@qorechain/rdk`) ile dağıtım {#deploy-with-the-typescript-rdk-qorechainrdk}

Rollup Development Kit, CLI ile aynı zincir üstü `x/rdk` modülünü, herkese açık RPC/REST/gRPC/JSON-RPC üzerinden ve herhangi bir cosmjs `OfflineSigner` ile yöneten iki herkese açık npm paketi olarak sunulur:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.4`) — TypeScript SDK'sı: ön ayar profilleriyle bir yapılandırma oluşturucu, rollup ve yerleşim toplu iş (settlement-batch) yaşam döngüleri için işlem yardımcıları, native DA, tipli okuma istemcileri ve v0.4 eklemeleri — kuantum güvenli yerleşim makbuzları, QCAI Rollup Copilot, VM'ler arası calldata yardımcıları ve watchtower.
* **`create-qorechain-rollup`** (`v0.4.4`) — profil başına bir çalıştırılabilir başlangıç şablonunu (`multivm-rollup` şablonu dahil) klonlayan bir iskelet oluşturucu.

Bunlar npm'e yayınlanmıştır. Depo ayrıca yayınlanmış bir operatör CLI'si olan **`@qorechain/rdk-cli`**'yi (`qorollup`, `v0.4.4`) sunar; bu, `doctor`, `create`, `status`, `watch`, `params`, `suggest`, yaşam döngüsü komutları (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` ve `faucet` komutlarına, artı v0.4'ün `receipt`, `advise` ve `watchtower` komutlarına sahiptir.

İlk v0.4.0 sürümünden bu yana öne çıkanlar:

* **v0.4.2 — kutudan çıktığı gibi canlı ağa karşı çalışır.** `mainnet` ve `testnet` ön ayarları artık herkese açık `qore.host` uç noktalarını (`api.qore.host` / `api-testnet.qore.host` adresindeki REST) barındırıyor, böylece `createRdkClient({ network })` elle bir `endpoints` yapılandırması olmadan zincire ulaşır — yalnızca kendi düğümünüzü hedeflemek için geçersiz kılın. Aynı sürüm, Wasm rollup VM tanımlayıcısını **`native`** (QoreChain Native) olarak yeniden adlandırdı; `cosmwasm` kabul edilen eski bir takma ad olarak kalır ve ikisi de tel üzerinde `cosmwasm`'a eşlenir — zincir, gezgin (explorer) ve Dashboard değişmedi.
* **v0.4.3 — hibrit imza kodlama düzeltmesi**, TypeScript imzalama yolu için (aşağıdaki uyarıya bakın).
* **v0.4.4 — `@qorechain/sdk` `^0.7.0`'ı izler**, zincir **v3.1.85** yetkilendirici (authenticator) hatları için olan SDK sürümü; böylece bu yetenekler RDK'nın TypeScript kullanıcılarına SDK üzerinden doğrudan ulaşır. RDK API'sinde değişiklik yok.

:::caution
**TypeScript kullanıcıları RDK ≥ 0.4.3 sürümünde olmalıdır.** Daha önceki sürümler hibrit PQC işlem uzantısını hatalı kodluyordu, bu yüzden zincir hibrit imzalı her işlemi reddediyordu. v0.4.3 (`@qorechain/sdk` ≥ 0.6.1 üzerinden) bu kodlamayı düzeltir. Yalnızca TypeScript hibrit imzalama yolu etkilendi — Python, Go, Rust ve Java istemcileri yalnızca klasik imzalama yapar ve hiçbir zaman etkilenmedi.
:::

#### Python, Go, Rust ve Java istemcileri

TypeScript paketinin yanı sıra RDK, TypeScript yüzeyini yansıtan tam **Python**, **Go**, **Rust** ve **Java** istemcileri sunar: doğrulamalı yapılandırma oluşturucu, beş ön ayar profili, denom/ekonomi/bech32 yardımcı programları, ikili-Merkle ve çekim (withdrawal) kanıtı yardımcıları, rollup manifestleri, REST ve `qor_` JSON-RPC okuma istemcileri, ön kontrol/sağlık kontrolleri, hesaplar (mnemonik → `qor` adresi) ve **işlem imzalama + yayınlama** (`SIGN_MODE_DIRECT`). Hepsi paylaşılan diller arası altın (golden) vektörlere karşı doğrulanmıştır ve kendi kayıt defterlerine **yayınlanmıştır**:

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

Güncel yayınlanmış sürümler: Python `qorechain-rdk` **0.4.4** (PyPI, `qorrdk` olarak içe aktarılır), Rust `qorechain-rdk` (crates.io — en son yayınlanan sürümü kurun veya depodan derleyin), Go modülü `github.com/qorechain/qorechain-rdk/packages/go` (**v0.4.4**) ve Java `io.github.qorechain:qorechain-rdk` **0.4.4** (Maven Central). Canlı yayınlama bir düğüm uç noktası gerektirir.

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

### Koddan bir rollup oluşturma

Bir ön ayardan bir yapılandırma oluşturun, zincirden güncel stake ve yakım oranını okuyun, ardından imzalayan bir istemciyle rollup'ı oluşturun. Yapılandırma oluşturucu, yerleşim → kanıt uyumluluk matrisini `validate()` / `build()` üzerinde zorunlu kılar.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// defi ön ayarının varsayılanlarıyla önceden doldurulmuş bir yapılandırma oluşturucu; .set({ ... }) ile geçersiz kılın.
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// Herkese açık qore.host uç noktaları ön ayarlara gömülüdür (RDK ≥ 0.4.2) —
// elle bir `endpoints` yapılandırması gerekmez; kendi düğümünüzü hedeflemek için geçersiz kılın.
const rdk = createRdkClient({ network: "testnet" });

// Canlı modül parametrelerini okuyun — stake veya yakım oranını asla sabit kodlamayın.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Herhangi bir cosmjs OfflineSigner ile imzalayan bir istemci bağlayın.
const tx = await rdk.connectTx(signer, { gasPrice: "0.15uqor" }); // zincir 0.1uqor/gas ücret tabanını zorunlu kılar
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

Hangi profilin uygun olduğundan emin değil misiniz? `rdk.suggestProfile("a lending protocol with predictable fees")`, QCAI destekli bir öneri döndürür (belgelenmiş bir yedek mekanizmayla birlikte).

### Koddan yaşam döngüsünü yönetme ve durumu okuma

İmzalayan istemci, tam yaşam döngüsünü sunar — `pauseRollup`, `resumeRollup`, `stopRollup`, artı `submitBatch`, `challengeBatch`, `resolveChallenge` ve `executeWithdrawal`. Yaşam döngüsü geçişleri `currentStatus` geçirilerek korunabilir.

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

Tipli REST istemcisiyle durumu okuyun (imzalayan gerekmez):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## Yaşam döngüsü yönetimi

Bir rollup `pending`, `active`, `paused` ve `stopped` durumları arasında ilerler. Oluşturucu, geçişleri aşağıdaki komutlarla yönetir.

### Duraklat

Rollup'ı geçici olarak durdurun. Durum korunur ve rollup devam ettirilebilir. Bir neden dizesi gereklidir.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Devam ettir

Daha önce duraklatılmış bir rollup'ı devam ettirin.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Durdur

Rollup'ı kalıcı olarak devre dışı bırakın ve stake'ini serbest bırakın. Stake edilen QOR — tek seferlik oluşturma yakımı düşülerek — oluşturucuya iade edilir.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
Bir rollup'ı durdurmak kalıcıdır. Durdurulduktan sonra rollup yeniden başlatılamaz.
:::

---

## Operatör komutları: toplu işler ve itirazlar

Rollup operatörleri yerleşim toplu işlerini (settlement batch) gönderir ve itiraz edenler (challenger) iyimser (optimistic) toplu işlere itiraz edebilir. Bu komutlar, **[Rollup'lara Genel Bakış](/rollups/overview)** ve **[ZK / STARK ve Çekimler](/rollups/zk-stark-withdrawals)** bölümlerinde açıklanan yerleşim katmanının temelini oluşturur.

### Bir toplu iş gönderme

Bir rollup için bir yerleşim toplu işi gönderin. Rollup ID'sini, bir toplu iş dizinini ve hex kodlu bir durum kökünü (state root) alır.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Bir toplu işe itiraz etme

Gönderilmiş bir toplu işe itiraz edin (iyimser rollup'lar için). Rollup ID'sini ve toplu iş dizinini alır; hile kanıtını `--proof` ile geçirin. Zincir sürümü **v3.1.74** itibarıyla, iyimser **submit-batch → challenge-batch** yolu uçtan uca canlı ve çalışır durumdadır.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| Bayrak | Açıklama |
| ---- | ----------- |
| `--proof` | Hex kodlu hile kanıtı |

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
| `qorechaind query rdk suggest-profile [use-case]` | Bir kullanım senaryosu için ön ayar önerisi |

---

## Sonraki adımlar

* **[Veri Kullanılabilirliği](/rollups/data-availability)** — native, Celestia ve yedekli DA arka uçları.
* **[ZK / STARK ve Çekimler](/rollups/zk-stark-withdrawals)** — kanıt doğrulama ve `execute-withdrawal` üzerinden L2 → L1 çekim akışı.
