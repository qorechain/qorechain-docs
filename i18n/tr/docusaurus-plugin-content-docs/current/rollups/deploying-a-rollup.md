---
slug: /rollups/deploying-a-rollup
title: Bir Rollup Dağıtma
sidebar_label: Bir Rollup Dağıtma
sidebar_position: 3
---

# Bir Rollup Dağıtma

Uygulamaya özgü bir rollup'ı üç şekilde dağıtabilirsiniz: **Dashboard** üzerinden (rehberli, kod gerektirmeyen bir sihirbaz), zincir **CLI**'si üzerinden (`qorechaind`, zincir üstü işlem üzerinde tam kontrol) veya **TypeScript RDK** ile programatik olarak (`@qorechain/rdk` artı `create-qorechain-rollup` iskelet oluşturucu). Bu sayfa üçünü de, ayrıca operatör yaşam döngüsünü ve toplu işlem komutlarını kapsar.

:::note
Aşağıdaki komutlar **`qorechain-diana`** testnet'ini hedefler. Mainnet (**`qorechain-vladi`**, EVM zincir kimliği **9801**), 7 Haziran 2026'dan beri **v3.1.82** zincir sürümünü çalıştırarak canlıdır — mainnet'te dağıtım yaparken mainnet zincir kimliğini ve uç noktalarını yerine koyun. Her dağıtımı önce testnet üzerinde doğrulayın.
:::

---

## Gereksinimler

| Gereksinim | Ayrıntılar |
| ----------- | ------- |
| **Minimum stake** | Rollup oluşturulduğunda QOR cinsinden bir stake teminatı emanete alınır |
| **Oluşturma yakımı** | Stake edilen miktarın bir kısmı oluşturmada kalıcı olarak yakılır; geri kalanı emanette tutulur ve rollup durdurulduğunda iade edilir |
| **Hesap** | Stake ile işlem ücretleri için yeterli bakiyeye sahip, fonlanmış bir QoreChain hesabı |

Dağıtımdan önce mevcut minimum stake ve yakım oranı için canlı modül parametrelerini sorgulayın:

```bash
qorechaind query rdk config
```

---

## Dashboard üzerinden dağıtma (Tools → Rollups)

Dashboard, **Tools → Rollups** altında rehberli bir **Deploy a Rollup** sihirbazı sunar. Bir işlemi elle bir araya getirmeden uygulamaya özgü bir rollup başlatmanın en hızlı yoludur.

### Adımlar

1. **Oturum açın.** Sihirbaz, dağıtım yapmak ve mevcut dağıtımlarınızı listelemek için kimliği doğrulanmış bir oturum gerektirir.
2. **Rollup'ınıza ad verin.** Bir rollup adı girin (2–41 karakter: harfler, rakamlar, boşluklar, tireler veya alt çizgiler).
3. **Bir sanal makine seçin.** QoreChain üçlü-VM bir zincirdir, böylece rollup'ınız aşağıdakilerden herhangi birini çalıştırabilir:
   * **EVM** — tam Ethereum araç takımıyla Solidity / Vyper sözleşmeleri (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — Cosmos SDK çalışma zamanında, native IBC ile Rust akıllı sözleşmeleri
   * **SVM** — paralel yürütmeli, yüksek verimli uygulamalar için Solana Sanal Makinesi
4. **Bir veri kullanılabilirliği katmanı seçin.** Rollup'ınızın herkesin durumu yeniden oluşturabilmesi için işlem verilerini yayınladığı yer: **QoreChain DA**, **Celestia** veya **EigenDA**. EigenDA'nın bir Dashboard seviyesi seçenek olduğunu, oysa zincir üstü `x/rdk` DA arka uçlarının native, Celestia veya both olduğunu unutmayın — bkz. [Veri Kullanılabilirliği](/rollups/data-availability).
5. **Bir gaz token'ı ayarlayın.** Rollup'ınızda yürütme için ödeme yapmak üzere kullanılan token. Varsayılan olarak **QOR**'dur; kendi native token'ınızı kullanmak için özel bir sembol girin.
6. **Bir sıralayıcı seçin.** Uzlaşmadan önce işlemleri kimin sıralayacağı: **Shared sequencer** (QoreChain paylaşılan kümesi), **Dedicated (single)** (kendi tek sıralayıcınızı çalıştırın) veya **Decentralized** (izinsiz bir sıralayıcı kümesi).
7. **Bir uzlaşma hedefi seçin.** Rollup'ın durum köklerini ve geçerlilik kanıtlarını nereye bağladığı: **QoreChain mainnet** veya **Ethereum**.
8. **Dağıtın.** Sihirbazı gönderin. Sağlama, rollup canlıya geçmeden önce **The Qore Trust** tarafından gözden geçirilir, bu nedenle yeni gönderilen bir rollup, gözden geçirme tamamlanana kadar **provisioning** durumuyla görünür.

Gönderilen rollup'larınız, VM'leri, DA katmanları, gaz token'ları, sıralayıcıları, uzlaşma hedefleri ve mevcut durumlarıyla birlikte **Your rollups** listesinde görünür.

:::note
Dashboard sihirbazı kullanıcı dostu, ürün seviyesinde seçimler sunar ve sağlamayı gözden geçirilen bir hat üzerinden yönlendirir. Aşağıdaki CLI, doğrudan `x/rdk` modülünün zincir üstü mesaj yüzeyine karşı çalışır. İkisi aynı temel kavramları paylaşır (VM, DA, sıralayıcı, uzlaşma) ancak bunları farklı seviyelerde açığa çıkarır.
:::

---

## CLI üzerinden dağıtma

CLI, rollup'ı doğrudan zincir üstünde oluşturur. `create-rollup` üç konumsal argüman alır — rollup kimliği, bir profil ve stake miktarı (`uqor` cinsinden) — ayrıca isteğe bağlı bir `--vm` bayrağı.

:::tip
**v3.1.74** zincir sürümünden itibaren `create-rollup`, **seçilen profilin ön ayarını otomatik olarak uygular** — uzlaşma modu, sıralayıcı, DA, gaz modeli ve VM'nin tümü ön ayardan alınır. Bunları artık elle ayarlamanız gerekmez (önceden mesaj, egemen bir yapılandırmayı sabit kodluyordu). `--vm` bayrağı artık **varsayılan olarak boştur**, böylece açıkça geçersiz kılmadığınız sürece profilin VM'si geçerli olur.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Örnek** — `defi` ön ayarından bir rollup oluşturun (uzlaşma, sıralayıcı, DA ve VM'nin tümü ön ayardan gelir; `defi`, EVM üzerinde zk uzlaşmasına çözümlenir):

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Bayraklar:**

| Bayrak | Varsayılan | Açıklama |
| ---- | ------- | ----------- |
| `--vm` | *(boş — profilin VM'sini kullan)* | Rollup VM türünü geçersiz kıl: `evm`, `cosmwasm`, `svm` veya `custom`. Ön ayarın VM'sini uygulamak için ayarsız bırakın. |

`[profile]` argümanı, otomatik olarak uygulanan bir ön ayar yapılandırması seçer — bkz. **[Ön Ayar Profilleri](/rollups/preset-profiles)**. `[stake-amount]`, `uqor` cinsinden teminattır.

### Dağıttığınızı inceleyin

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## TypeScript RDK ile dağıtma (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Rollup Development Kit, CLI ile aynı zincir üstü `x/rdk` modülünü herkese açık RPC/REST/gRPC/JSON-RPC ve herhangi bir cosmjs `OfflineSigner` üzerinden çalıştıran iki herkese açık npm paketi olarak gelir:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.0`) — TypeScript SDK: ön ayar profilleriyle bir yapılandırma oluşturucu, rollup ve uzlaşma toplu işlemi yaşam döngüleri için işlem yardımcıları, native DA, türü belirtilmiş okuma istemcileri ve v0.4 eklemeleri — kuantum güvenli uzlaşma makbuzları, QCAI Rollup Copilot, VM'ler arası calldata yardımcıları ve watchtower.
* **`create-qorechain-rollup`** (`v0.4.0`) — profil başına çalıştırılabilir bir başlangıç şablonu klonlayan bir iskelet oluşturucu (`multivm-rollup` şablonu dahil).

Bunlar npm'e yayınlanmıştır. Depo ayrıca yayınlanmış bir operatör CLI'si olan **`@qorechain/rdk-cli`**'yi (`qorollup`, `v0.4.0`) `doctor`, `create`, `status`, `watch`, `params`, `suggest`, yaşam döngüsü (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` ve `faucet` komutlarıyla, ayrıca v0.4 `receipt`, `advise` ve `watchtower` komutlarıyla birlikte gönderir.

#### Python, Go, Rust ve Java istemcileri

TypeScript paketinin yanı sıra RDK, TypeScript yüzeyini yansıtan tam **Python**, **Go**, **Rust** ve **Java** istemcileri sağlar: doğrulamalı yapılandırma oluşturucu, beş ön ayar profili, denom/ekonomi/bech32 yardımcıları, ikili-Merkle ve para çekme kanıtı yardımcıları, rollup manifestleri, REST ve `qor_` JSON-RPC okuma istemcileri, ön uçuş/sağlık kontrolleri, hesaplar (anımsatıcı → `qor` adresi) ve **işlem imzalama + yayınlama** (`SIGN_MODE_DIRECT`). Tümü, paylaşılan diller arası altın vektörlere karşı doğrulanmıştır ve kayıt defterlerine **yayınlanmıştır**:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.0
```

```python
import qorrdk
```

Mevcut yayınlanmış sürümler: Python `qorechain-rdk` **0.4.0** (PyPI, `qorrdk` olarak içe aktarılır), Rust `qorechain-rdk` **0.4.0** (crates.io), Go modülü `github.com/qorechain/qorechain-rdk/packages/go` ve Java `io.github.qorechain:qorechain-rdk` **0.4.0** (Maven Central). Canlı yayın bir düğüm uç noktası gerektirir.

:::note
TypeScript RDK ve şablonları **`qorechain-diana`** testnet'ini hedefler ve tam uçtan uca akışlar için **yakında geliyor** olarak işaretlenmiştir. Sürümleri sabitleyin ve testnet üzerinde doğrulayın.
:::

### `create-qorechain-rollup` ile bir proje iskeleti oluşturma {#scaffold-a-project-with-create-qorechain-rollup}

Her profilin eşleşen bir başlangıç şablonu vardır (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). İki biçimden biriyle bir tane iskeletleyin:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Etkileşimsiz / CI kullanımı için şablonu ve ağı açıkça geçirin:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

İskelet oluşturucu, belgelenmiş stake ve oluşturma-yakım maliyetini ve rollup'ınızı oluşturmak ile durumunu okumak için sonraki adımları yazdırır.

### Koddan bir rollup oluşturma

Bir ön ayardan bir yapılandırma oluşturun, canlı stake ve yakım oranını zincirden okuyun, ardından bir imzalama istemcisiyle rollup'ı oluşturun. Yapılandırma oluşturucu, `validate()` / `build()` üzerinde uzlaşma → kanıt uyumluluk matrisini zorunlu kılar.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connect a signing client with any cosmjs OfflineSigner.
const tx = await rdk.connectTx(signer, { gasPrice: "0.025uqor" });
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

Hangi profilin uygun olduğundan emin değil misiniz? `rdk.suggestProfile("a lending protocol with predictable fees")`, QCAI destekli bir öneri döndürür (belgelenmiş bir geri dönüşle).

### Yaşam döngüsünü yönetin ve koddan durum okuyun

İmzalama istemcisi tam yaşam döngüsünü açığa çıkarır — `pauseRollup`, `resumeRollup`, `stopRollup`, ayrıca `submitBatch`, `challengeBatch`, `resolveChallenge` ve `executeWithdrawal`. Yaşam döngüsü geçişleri, `currentStatus` geçirilerek korunabilir.

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

Türü belirtilmiş REST istemcisiyle durum okuyun (imzalayıcı gerektirmez):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## Yaşam döngüsü yönetimi

Bir rollup `pending`, `active`, `paused` ve `stopped` durumları arasında ilerler. Oluşturan kişi, geçişleri aşağıdaki komutlarla yönetir.

### Duraklat

Rollup'ı geçici olarak durdurun. Durum korunur ve rollup devam ettirilebilir. Bir neden dizesi gereklidir.

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

Rollup'ı kalıcı olarak hizmet dışı bırakın ve stake'ini serbest bırakın. Stake edilen QOR — bir kerelik oluşturma yakımı düşülerek — oluşturan kişiye iade edilir.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
Bir rollup'ı durdurmak kalıcıdır. Rollup durdurulduktan sonra yeniden başlatılamaz.
:::

---

## Operatör komutları: toplu işlemler ve itirazlar

Rollup operatörleri uzlaşma toplu işlemleri gönderir ve itiraz edenler iyimser toplu işlemlere itiraz edebilir. Bu komutlar, **[Rollup'lara Genel Bakış](/rollups/overview)** ve **[ZK / STARK ve Para Çekme](/rollups/zk-stark-withdrawals)** sayfalarında açıklanan uzlaşma katmanının temelini oluşturur.

### Bir toplu işlem gönder

Bir rollup için bir uzlaşma toplu işlemi gönderin. Rollup kimliğini, bir toplu işlem dizinini ve hex kodlu bir durum kökünü alır.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Bir toplu işleme itiraz et

Gönderilen bir toplu işleme itiraz edin (iyimser rollup'lar için). Rollup kimliğini ve toplu işlem dizinini alır; sahtekârlık kanıtını `--proof` ile geçirin. **v3.1.74** zincir sürümünden itibaren, iyimser **submit-batch → challenge-batch** yolu canlıdır ve uçtan uca çalışmaktadır.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| Bayrak | Açıklama |
| ---- | ----------- |
| `--proof` | Hex kodlu sahtekârlık kanıtı |

### Toplu işlemleri incele

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
| `qorechaind query rdk batch [rollup-id]` | En son uzlaşma toplu işlemi (veya `--index`) |
| `qorechaind query rdk config` | RDK modül parametreleri |
| `qorechaind query rdk suggest-profile [use-case]` | Bir kullanım senaryosu için bir ön ayar öner |

---

## Sonraki adımlar

* **[Veri Kullanılabilirliği](/rollups/data-availability)** — native, Celestia ve yedekli DA arka uçları.
* **[ZK / STARK ve Para Çekme](/rollups/zk-stark-withdrawals)** — kanıt doğrulama ve `execute-withdrawal` aracılığıyla L2 → L1 para çekme akışı.
