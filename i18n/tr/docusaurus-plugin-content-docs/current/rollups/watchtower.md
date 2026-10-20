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

:::caution Erken aşama: izlenecek bir şey yok ve 0.5.0 son tarih uyarıları yanlış
Watchtower yığınları RDK REST istemcisi aracılığıyla okur ve `/qorechain/rdk/v1/…` rotaları her iki ağda da sunulmaktadır. Hiçbir ağda rollup oluşturulmamıştır (20 Ekim 2026 itibarıyla kontrol edildi), dolayısıyla henüz izlenecek bir şey yoktur. `@qorechain/rdk` 0.5.0 sürümünde itiraz penceresi son tarih mantığı da güvenilir değildir: bir yığının `submittedAt` değeri bir **blok yüksekliğidir**, ancak Watchtower (ve `qorollup status` komutunun arkasındaki sağlık kontrolü) saniye cinsinden pencereyi buna ekler ve toplamı duvar saatiyle karşılaştırır; bu yüzden `secondsRemaining` anlamsızdır ve `onDeadline` bir yığın ilk görüldüğü anda tetiklenir. Kararlar için `onDeadline` veya geri sayımı kullanmayın; son tarihi kendiniz hesaplayın (aşağıdaki nota bakın). İzleyici ayrıca yığınların yalnızca ilk sayfasını (50) okur.
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require: pass `pqcKeypair` to `RdkClient.connectTx` (see
// "RDK 0.5.0 limits" in Deploying a Rollup). Without it the transaction is
// classical-only and refused.
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

  // Called when a batch is within `deadlineWarnSecs` of its deadline. In 0.5.0 the
  // deadline mixes a block height with the wall clock, so treat this as unreliable.
  onDeadline: ({ batch, secondsRemaining }) => {
    console.warn("challenge window alert for batch", batch.batchIndex, secondsRemaining);
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

`onInvalid`'i bir itiraza bağlamak, Watchtower'ı eksiksiz bir otomatik
itiraz aracına dönüştürür; yalnızca gözlem (observe-only) modunda çalıştırmak için
onu ayarlanmamış bırakın.

:::note İtiraz penceresi
Bir yığının son tarihini saniye olarak değil, blok olarak hesaplayın: `submitted_at` (bir blok yüksekliği) artı pencere. **Ana ağda (v3.2.3)** pencere, blok başına sabit 6 saniye üzerinden bloğa dönüştürülmüş varsayılan 604.800 "saniye"dir, yani **100.800 blok** (gerçek süre blok süresini izler, bu nedenle ana ağın ≈3,2 sn'lik bloklarında "7 gün"den daha kısadır). **Yalnızca testnet'te (v3.2.4)**, 8.337.253 yüksekliğinden itibaren gönderilen bir yığın, blok süresinin saniyesi cinsinden ölçülen bir pencere alır. Bir itiraz göndermek ayrıca rollup'ın itiraz teminatını (`nft` ve `custom` ön ayarları için 1.000 QOR) gerektirir.
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower`, çerçeveyi komut satırından çalıştırır; siz Ctrl-C'ye basana kadar
yeni yığınları ve itiraz penceresi son tarihlerini yazdırır. Tam `qorollup`
operatör CLI'si için bkz.
[Bir Rollup Dağıtma](/rollups/deploying-a-rollup).
