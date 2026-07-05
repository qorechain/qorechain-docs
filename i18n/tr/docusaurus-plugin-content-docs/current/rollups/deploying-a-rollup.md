---
slug: /rollups/deploying-a-rollup
title: Rollup Dağıtma
sidebar_label: Rollup Dağıtma
sidebar_position: 3
---

# Rollup Dağıtma

Uygulamaya özel bir rollup'ı üç şekilde dağıtabilirsiniz: **Dashboard** üzerinden (rehberli, kod gerektirmeyen bir sihirbaz), zincir **CLI**'ı üzerinden (`qorechaind`, zincir üstü işlem üzerinde tam kontrol) veya programatik olarak **TypeScript RDK** ile (`@qorechain/rdk` artı `create-qorechain-rollup` iskelet oluşturucusu). Bu sayfa üç yöntemi de, ayrıca operatör yaşam döngüsünü ve batch komutlarını kapsar.

:::note
Aşağıdaki komutlar **`qorechain-diana`** testnet'ini hedefler. Mainnet (**`qorechain-vladi`**, EVM zincir kimliği **9801**) 7 Haziran 2026'dan bu yana **v3.1.85** zincir sürümüyle canlıdır — mainnet üzerinde dağıtım yaparken mainnet zincir kimliğini ve uç noktalarını kullanın. Her dağıtımı önce testnet üzerinde doğrulayın.
:::

---

## Gereksinimler

| Gereksinim | Ayrıntılar |
| ----------- | ------- |
| **Minimum stake** | Rollup oluşturulduğunda QOR cinsinden bir stake teminatı emanete alınır |
| **Oluşturma yakımı** | Stake edilen tutarın bir kısmı oluşturma sırasında kalıcı olarak yakılır; kalan kısım emanette tutulur ve rollup durdurulduğunda iade edilir |
| **Hesap** | Stake artı işlem ücretleri için yeterli bakiyeye sahip, fonlanmış bir QoreChain hesabı |

Dağıtımdan önce güncel minimum stake ve yakım oranı için canlı modül parametrelerini sorgulayın:

```bash
qorechaind query rdk config
```

---

## Dashboard üzerinden dağıtım (Tools → Rollups)

Dashboard, **Tools → Rollups** altında rehberli bir **Deploy a Rollup** sihirbazı sunar. Elle işlem oluşturmadan uygulamaya özel bir rollup başlatmanın en hızlı yoludur.

### Adımlar

1. **Oturum açın.** Sihirbaz, dağıtım yapmak ve mevcut dağıtımlarınızı listelemek için kimliği doğrulanmış bir oturum gerektirir.
2. **Rollup'ınıza ad verin.** Bir rollup adı girin (2–41 karakter: harfler, rakamlar, boşluklar, tireler veya alt çizgiler).
3. **Bir sanal makine seçin.** QoreChain üçlü-VM'li bir zincirdir; dolayısıyla rollup'ınız şunlardan herhangi birini çalıştırabilir:
   * **EVM** — tam Ethereum araç desteğiyle (Hardhat, Foundry, MetaMask) Solidity / Vyper sözleşmeleri
   * **CosmWasm** — Cosmos SDK çalışma zamanı üzerinde Rust akıllı sözleşmeleri, yerleşik IBC ile
   * **SVM** — paralel yürütmeli, yüksek işlem hacimli uygulamalar için Solana Sanal Makinesi
4. **Bir veri kullanılabilirliği (DA) katmanı seçin.** Rollup'ınızın, herkesin durumu yeniden oluşturabilmesi için işlem verilerini yayımladığı yer: **QoreChain DA**, **Celestia** veya **EigenDA**. EigenDA'nın Dashboard düzeyinde bir seçenek olduğunu, zincir üstü `x/rdk` DA arka uçlarının ise native, Celestia veya her ikisi olduğunu unutmayın — bkz. [Veri Kullanılabilirliği](/rollups/data-availability).
5. **Bir gaz tokeni belirleyin.** Rollup'ınızda yürütme ücretlerini ödemek için kullanılan token. Varsayılan **QOR**'dur; kendi yerel tokeninizi kullanmak için özel bir sembol girin.
6. **Bir sıralayıcı (sequencer) seçin.** Uzlaşmadan önce işlemleri kimin sıralayacağı: **Shared sequencer** (QoreChain ortak kümesi), **Dedicated (single)** (kendi tekil sıralayıcınızı çalıştırın) veya **Decentralized** (izinsiz bir sıralayıcı kümesi).
7. **Bir uzlaşma (settlement) hedefi seçin.** Rollup'ın durum köklerini ve geçerlilik kanıtlarını nereye sabitleyeceği: **QoreChain mainnet** veya **Ethereum**.
8. **Dağıtın.** Sihirbazı gönderin. Sağlama işlemi, rollup canlıya alınmadan önce **The Qore Trust** tarafından incelenir; bu nedenle yeni gönderilmiş bir rollup, inceleme tamamlanana kadar **provisioning** durumuyla görünür.

Gönderdiğiniz rollup'lar, VM'leri, DA katmanları, gaz tokenleri, sıralayıcıları, uzlaşma hedefleri ve güncel durumlarıyla birlikte **Your rollups** listesinde görünür.

:::note
Dashboard sihirbazı, kullanıcı dostu, ürün düzeyinde seçenekler sunar ve sağlama işlemini incelemeli bir hattan geçirir. Aşağıdaki CLI ise doğrudan `x/rdk` modülünün zincir üstü mesaj yüzeyiyle çalışır. İkisi aynı temel kavramları (VM, DA, sıralayıcı, uzlaşma) paylaşır, ancak bunları farklı soyutlama seviyelerinde sunar.
:::

---

## CLI üzerinden dağıtım

CLI, rollup'ı doğrudan zincir üzerinde oluşturur. `create-rollup` üç konumsal argüman alır — rollup kimliği, bir profil ve (`uqor` cinsinden) stake tutarı — artı isteğe bağlı bir `--vm` bayrağı.

:::tip
Zincir sürümü **v3.1.74** itibarıyla `create-rollup`, **seçilen profilin ön ayarını otomatik olarak uygular** — uzlaşma modu, sıralayıcı, DA, gaz modeli ve VM'in tamamı ön ayardan alınır. Bunları artık elle ayarlamanız gerekmez (önceden mesaj, egemen (sovereign) bir yapılandırmayı sabit kodluyordu). `--vm` bayrağı artık **varsayılan olarak boştur**; dolayısıyla açıkça geçersiz kılmadığınız sürece profilin VM'i uygulanır.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Örnek** — `defi` ön ayarından bir rollup oluşturun (uzlaşma, sıralayıcı, DA ve VM'in tümü ön ayardan gelir; `defi`, EVM üzerinde zk uzlaşmasına karşılık gelir):

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Bayraklar:**

| Bayrak | Varsayılan | Açıklama |
| ---- | ------- | ----------- |
| `--vm` | *(boş — profilin VM'i kullanılır)* | Rollup VM türünü geçersiz kılar: `evm`, `cosmwasm`, `svm` veya `custom`. Ön ayarın VM'ini uygulamak için boş bırakın. (RDK istemcilerinde Wasm çalışma zamanı, **`native`** VM türüdür — QoreChain Native — ve `cosmwasm` eski (legacy) bir takma ad olarak korunur; `cosmwasm` kablo üzerindeki (on-wire) değerdir ve bu zincir düzeyindeki bayrağın aldığı değer de budur.) |

`[profile]` argümanı, otomatik olarak uygulanan bir ön ayar yapılandırması seçer — bkz. **[Ön Ayar Profilleri](/rollups/preset-profiles)**. `[stake-amount]`, `uqor` cinsinden teminattır.

### Dağıttığınızı inceleyin

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## TypeScript RDK ile dağıtım (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Rollup Development Kit, CLI ile aynı zincir üstü `x/rdk` modülünü genel RPC/REST/gRPC/JSON-RPC üzerinden ve herhangi bir cosmjs `OfflineSigner` ile süren iki genel npm paketi olarak yayımlanır:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.4`) — TypeScript SDK'sı: ön ayar profilleriyle bir yapılandırma oluşturucu, rollup ve uzlaşma-batch yaşam döngüleri için işlem yardımcıları, native DA, tipli okuma istemcileri ve v0.4 eklemeleri — kuantum-güvenli uzlaşma makbuzları, QCAI Rollup Copilot, VM'ler arası calldata yardımcıları ve watchtower.
* **`create-qorechain-rollup`** (`v0.4.4`) — her profil için çalıştırılabilir bir başlangıç şablonunu (`multivm-rollup` şablonu dahil) klonlayan bir iskelet oluşturucu.

Bunlar npm'de yayımlanmıştır. Depo ayrıca yayımlanmış bir operatör CLI'ı da içerir: **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.4`) — `doctor`, `create`, `status`, `watch`, `params`, `suggest`, yaşam döngüsü (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` ve `faucet` komutları, artı v0.4 ile gelen `receipt`, `advise` ve `watchtower` komutları.

İlk v0.4.0 sürümünden bu yana öne çıkanlar:

* **v0.4.2 — kutudan çıktığı gibi canlı ağa karşı çalışır.** `mainnet` ve `testnet` ön ayarları artık genel `qore.host` uç noktalarını içerir (REST için `api.qore.host` / `api-testnet.qore.host`); böylece `createRdkClient({ network })`, elle `endpoints` ayarı yapmadan zincire ulaşır — yalnızca kendi düğümünüzü hedeflemek için geçersiz kılın. Aynı sürüm, Wasm rollup VM tanımlayıcısını **`native`** (QoreChain Native) olarak yeniden adlandırdı; `cosmwasm` kabul edilen eski bir takma ad olarak kalır ve her ikisi de kablo üzerinde `cosmwasm` değerine eşlenir — zincir, gezgin ve Dashboard değişmemiştir.
* **v0.4.3 — hibrit imza kodlama düzeltmesi** TypeScript imzalama yolu için (aşağıdaki uyarıya bakın).
* **v0.4.4 — `@qorechain/sdk` `^0.7.0` sürümünü takip eder**; bu, zincir **v3.1.85** kimlik doğrulayıcı (authenticator) hatları için yayımlanan SDK sürümüdür ve söz konusu yetenekler RDK'nın TypeScript kullanıcılarına doğrudan SDK üzerinden ulaşır. RDK API'sinde değişiklik yoktur.

:::caution
**TypeScript kullanıcıları RDK ≥ 0.4.3 sürümünde olmalıdır.** Önceki sürümler hibrit PQC işlem uzantısını hatalı kodluyordu; bu nedenle zincir, hibrit imzalı her işlemi reddediyordu. v0.4.3 (`@qorechain/sdk` ≥ 0.6.1 aracılığıyla) kodlamayı düzeltir. Yalnızca TypeScript hibrit imzalama yolu etkilenmişti — Python, Go, Rust ve Java istemcileri yalnızca klasik imza kullanır ve hiçbir zaman etkilenmedi.
:::

#### Python, Go, Rust ve Java istemcileri

TypeScript paketinin yanı sıra RDK, TypeScript yüzeyini yansıtan tam donanımlı **Python**, **Go**, **Rust** ve **Java** istemcileri sağlar: doğrulamalı yapılandırma oluşturucu, beş ön ayar profili, denom/ekonomi/bech32 yardımcıları, ikili-Merkle ve para çekme kanıtı yardımcıları, rollup manifestoları, REST ve `qor_` JSON-RPC okuma istemcileri, ön kontrol/sağlık denetimleri, hesaplar (anımsatıcı sözcükler → `qor` adresi) ve **işlem imzalama + yayınlama** (`SIGN_MODE_DIRECT`). Tümü, diller arası paylaşılan altın vektörlere (golden vectors) karşı doğrulanmıştır ve kayıt defterlerinde **yayımlanmıştır**:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
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

Güncel yayımlanmış sürümler: Python `qorechain-rdk` **0.4.4** (PyPI, içe aktarma adı `qorrdk`), Rust `qorechain-rdk` (crates.io — yayımlanmış en son sürümü kurun veya depodan derleyin), Go modülü `github.com/qorechain/qorechain-rdk/packages/go` (**v0.4.4**) ve Java `io.github.qorechain:qorechain-rdk` **0.4.4** (Maven Central). Canlı yayınlama, bir düğüm uç noktası gerektirir.

:::note
TypeScript RDK ve şablonları varsayılan olarak **`qorechain-diana`** testnet'ini hedefler ve v0.4.2'den bu yana ön ayarlar, kutudan çıktığı gibi canlı genel uç noktalara ulaşır. Sürümleri sabitleyin ve mainnet'ten önce testnet üzerinde doğrulayın.
:::

### `create-qorechain-rollup` ile bir proje iskeleti oluşturun {#scaffold-a-project-with-create-qorechain-rollup}

Her profilin eşleşen bir başlangıç şablonu vardır (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Aşağıdaki iki biçimden biriyle iskelet oluşturun:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Etkileşimsiz / CI kullanımı için şablonu ve ağı açıkça belirtin:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

İskelet oluşturucu, belgelenmiş stake ve oluşturma yakımı maliyetini ve rollup'ınızı oluşturup durumunu okumanız için sonraki adımları yazdırır.

### Koddan bir rollup oluşturun

Bir ön ayardan yapılandırma oluşturun, canlı stake ve yakım oranını zincirden okuyun, ardından bir imzalama istemcisiyle rollup'ı oluşturun. Yapılandırma oluşturucu, `validate()` / `build()` çağrılarında uzlaşma → kanıt uyumluluk matrisini uygular.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2) —
// no manual `endpoints` config needed; override to target your own node.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connect a signing client with any cosmjs OfflineSigner.
const tx = await rdk.connectTx(signer, { gasPrice: "0.15uqor" }); // the chain enforces a 0.1uqor/gas fee floor
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

### Yaşam döngüsünü yönetin ve durumu koddan okuyun

İmzalama istemcisi tam yaşam döngüsünü sunar — `pauseRollup`, `resumeRollup`, `stopRollup`, ayrıca `submitBatch`, `challengeBatch`, `resolveChallenge` ve `executeWithdrawal`. Yaşam döngüsü geçişleri, `currentStatus` geçirilerek korumaya alınabilir.

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

Durumu, tipli REST istemcisiyle okuyun (imzalayıcı gerekmez):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## Yaşam döngüsü yönetimi

Bir rollup, `pending`, `active`, `paused` ve `stopped` durumları arasında ilerler. Oluşturucu, geçişleri aşağıdaki komutlarla yönetir.

### Duraklat

Rollup'ı geçici olarak durdurun. Durum korunur ve rollup devam ettirilebilir. Bir gerekçe dizesi zorunludur.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Devam ettir

Önceden duraklatılmış bir rollup'ı devam ettirin.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Durdur

Rollup'ı kalıcı olarak devreden çıkarın ve stake'ini serbest bırakın. Stake edilen QOR — tek seferlik oluşturma yakımı düşüldükten sonra — oluşturucuya iade edilir.

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

## Operatör komutları: batch'ler ve itirazlar

Rollup operatörleri uzlaşma batch'leri gönderir; itirazcılar (challengers) ise optimistic batch'lere itiraz edebilir. Bu komutlar, **[Rollup'lara Genel Bakış](/rollups/overview)** ve **[ZK / STARK ve Para Çekme](/rollups/zk-stark-withdrawals)** sayfalarında anlatılan uzlaşma katmanının temelini oluşturur.

### Batch gönderme

Bir rollup için uzlaşma batch'i gönderin. Rollup kimliğini, bir batch dizinini ve hex kodlu bir durum kökünü alır.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Batch'e itiraz etme

Gönderilmiş bir batch'e itiraz edin (optimistic rollup'lar için). Rollup kimliğini ve batch dizinini alır; sahtecilik kanıtını `--proof` ile geçirin. Zincir sürümü **v3.1.74** itibarıyla optimistic **submit-batch → challenge-batch** yolu canlıdır ve uçtan uca çalışmaktadır.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| Bayrak | Açıklama |
| ---- | ----------- |
| `--proof` | Hex kodlu sahtecilik kanıtı |

### Batch'leri inceleme

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42
```

---

## Sorgulama

| Komut | Amaç |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Belirli bir rollup'ın ayrıntıları |
| `qorechaind query rdk list-rollups` | Kayıtlı tüm rollup'lar |
| `qorechaind query rdk batch [rollup-id]` | En son uzlaşma batch'i (veya `--index`) |
| `qorechaind query rdk config` | RDK modül parametreleri |
| `qorechaind query rdk suggest-profile [use-case]` | Bir kullanım senaryosu için ön ayar önerisi |

---

## Sonraki adımlar

* **[Veri Kullanılabilirliği](/rollups/data-availability)** — native, Celestia ve yedekli DA arka uçları.
* **[ZK / STARK ve Para Çekme](/rollups/zk-stark-withdrawals)** — kanıt doğrulama ve `execute-withdrawal` üzerinden L2 → L1 para çekme akışı.
