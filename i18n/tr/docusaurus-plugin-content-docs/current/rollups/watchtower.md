---
slug: /rollups/watchtower
title: Watchtower
sidebar_label: Watchtower
sidebar_position: 9
---

# Watchtower

Watchtower, optimistic rollup'lar için otomatik bir itiraz (auto-challenger)
çerçevesidir. Bir rollup'ın çözüm (settlement) yığınlarını (batch) takip eder,
her yeni yığını ve itiraz penceresinin son tarihini ortaya çıkarır ve — **sizin**
geçerlilik yükleminiz (validity predicate) bir yığını reddettiğinde — bir
itirazı devreye sokabilmeniz için onu `onInvalid` geri çağırma fonksiyonunuza
(callback) iletir.

Çerçeve izler ve *ne zaman* olacağına karar verir; **geçerlilik kontrolünü siz
sağlarsınız**. Watchtower hiçbir zaman bir yığının hileli olduğuna kendi başına
karar vermez — sizin `validate` fonksiyonunuzu çağırır ve döndürdüğünüz değere
göre hareket eder.

:::caution Erken aşama: henüz izlenecek bir şey yok
Watchtower yığınları RDK REST istemcisi aracılığıyla okur ve `/qorechain/rdk/v1/…` rotaları her iki ağda da sunulmaktadır. Hiçbir ağda rollup oluşturulmamıştır (27 Ekim 2026 itibarıyla kontrol edildi), dolayısıyla henüz izlenecek bir şey yoktur ve Watchtower canlı bir yığına karşı çalıştırılmamıştır. `@qorechain/rdk` 0.5.0 sürümünde son tarih mantığı yanlıştı (bir blok yüksekliğini Unix zaman damgası olarak okuyordu; bu yüzden `onDeadline` bir yığın ilk görüldüğü anda tetikleniyordu) ve yalnızca 50 yığınlık ilk sayfayı okuyordu; **0.6.0 ikisini de düzeltti** (aşağıya bakın). Güncel sürüm olan 0.7.0'ı kullanın.
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require: pass `pqcKeypair` to `RdkClient.connectTx` (see
// "RDK 0.7.0: changes and limits" in Deploying a Rollup). Without it the
// transaction is classical-only and refused.
declare const tx: {
  challengeBatch(input: { rollupId: string; batchIndex: number; proof: string }): Promise<unknown>;
};

const watcher = watchBatches(rdk, "my-rollup", {
  onBatch: (batch) => {
    console.log("new batch", batch.batchIndex);
  },

  // Your validity predicate. Return false to flag the batch as invalid.
  validate: async (batch) => {
    return await isBatchValid(batch); // your logic
  },

  // Called when validate() returns false — wire it to a challenge.
  onInvalid: async ({ batch }) => {
    await tx.challengeBatch({
      rollupId: "my-rollup",
      batchIndex: batch.batchIndex,
      proof: myFraudProofHex, // hex fraud proof
    });
  },

  // Called once per batch when its challenge window is still open and close to
  // closing: within `deadlineWarnSecs` seconds (time-based window) or
  // `deadlineWarnBlocks` blocks (block-count window). `window` says which rule
  // applies and what is left.
  onDeadline: ({ batch, window }) => {
    console.warn("challenge window closing for batch", batch.batchIndex, window);
  },
});

// Later:
watcher.stop();
```

Çerçeve şunları ortaya çıkarır:

- **yeni yığınlar** `onBatch` aracılığıyla,
- **itiraz penceresi son tarihleri** `onDeadline` aracılığıyla ve
- **geçersiz yığınlar** (sizin `validate` fonksiyonunuzun `false` döndürdüğü
  durumlar) `onInvalid` aracılığıyla.

0.6.0'dan itibaren (ve sonraki her sürümde) bir rollup'ın batch listesinin her sayfasını izler, bir batch'i son tarihi yaklaştıkça yeniden değerlendirir (her batch'i ilk görüşte bir kez yargılamak yerine, penceresi hâlâ açık olan en eski batch'ten itibaren ileriye doğru yoklamayı sürdürür) ve her pencereyi yerel saate göre değil, zincir ucuna (`getChainTip`, düğümün durumu) göre ölçer. Zaten `finalized` olan bir batch doğrulanmaz veya hakkında uyarı verilmez.

**Yeniden gönderilen batch'ler (0.7.0).** Zincir v3.2.5'ten itibaren (şimdi testnet'te; mainnet'te yükseltmeden sonra) onaylanan bir sahtekârlık, batch'i ve sonraki sonlandırılmamış her batch'i reddeder ve sequencer aynı indekslerle yeniden gönderir. 0.7.0 öncesi sürümler batch'leri yalnızca indekse göre ayırt ediyordu ve bu yüzden reddedilmiş bir indekste yeniden gönderilen bir batch'i kaçırıyordu; 0.7.0 onları indeks ve durum köküne göre ayırt eder ve reddedilmiş bir batch'i asla doğrulamaz.

**Zincirin sahtekârlık kuralını uygulama (0.7.0).** `transitionRootValidator`, zincirin kendi kuralını uygulayan hazır bir `validate` yüklemidir (bir batch, durum kökü kanonik geçiş kökü değilse sahtekârdır) ve `fraudProofForBatch`, kazanan kanıtı döndürür (dürüst bir batch için hiçbir şey döndürmez); böylece onu `challengeBatch`'e geçirebilirsiniz.

`onInvalid`'i bir itiraza bağlamak, Watchtower'ı eksiksiz bir otomatik
itiraz aracına dönüştürür; yalnızca gözlem (observe-only) modunda çalıştırmak için
onu ayarlanmamış bırakın.

:::note İtiraz penceresi
Zincir bir yığının penceresini iki yoldan biriyle ölçer ve `batchChallengeWindow` (Watchtower ve `qorollup status` arkasındaki sağlık kontrolü tarafından kullanılır) hangisinin geçerli olduğunu bildirir. **Blok sayısı penceresi, mainnet'te 3.742.566 yüksekliğinden önce gönderilen yığınlar için geçerli olan kural (v3.2.3 ve öncesi):** pencere, rollup'ın yapılandırılmış saniyelerinin blok başına sabit 6 saniye üzerinden bloğa dönüştürülmüş halidir; varsayılan 604.800 için **100.800 blok**, yığının `submitted_at` yüksekliğinden itibaren sayılır; gerçek süre blok süresini izler, bu nedenle ana ağın ≈3,1 sn'lik bloklarında "7 gün"den daha kısadır. Paket `open` ve `finalizable` durumlarını ayrı bildirir, çünkü uyguladığı kurala göre tek bir blok her ikisidir (bir itiraz `height - submitted_at <= window` iken açık sayılır, `height - submitted_at >= window` olduğunda sonlandırılabilir). **Zaman tabanlı pencere, v3.2.4'ten itibaren (test ağında 8.337.253 yüksekliğinden beri, mainnet'te 3.742.566 yüksekliğinden beri):** yükseltme yüksekliğinden itibaren gönderilen bir yığın kendi blok süresini kaydeder ve penceresi o kadar saniyelik blok süresidir. Watchtower, düğüm rollup'ın kendi penceresini bildirdiğinde onu kullanır (paket bunu v3.2.4 ve sonrası olarak belgeler); aksi halde modülün varsayılan penceresine döner, bu nedenle kendi penceresini yapılandırmış bir rollup için `challengeWindowSecs` geçin. Bir itiraz göndermek ayrıca rollup'ın itiraz teminatını (`nft` ve `custom` ön ayarları için 1.000 QOR) gerektirir. Modülün varsayılan penceresi mainnet'te 604.800 saniye, test ağında 3.600 saniyedir (bir saat; 27 Ekim 2026'da `GET /qorechain/rdk/v1/params` adresinden okundu); bu nedenle aynı rollup yapılandırması test ağında çok daha kısa bir pencereye sahiptir.
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower`, çerçeveyi komut satırından çalıştırır; siz Ctrl-C'ye basana kadar
yeni yığınları ve itiraz penceresi son tarihlerini yazdırır. `--canonical` ekleyin (0.7.0); durum kökü kanonik geçiş kökü olmayan her batch'i, yani bir itirazın kazanacağı batch'leri de bildirir. Tam `qorollup`
operatör CLI'si için bkz.
[Bir Rollup Dağıtma](/rollups/deploying-a-rollup).
