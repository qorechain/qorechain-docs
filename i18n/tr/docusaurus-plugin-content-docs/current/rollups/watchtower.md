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

:::caution Erken aşama: RDK REST rotaları gerekir
Watchtower yığınları RDK REST istemcisi aracılığıyla okur. `/qorechain/rdk/v1/…` REST rotaları bugün ana ağda sunulmamaktadır, bu nedenle Watchtower henüz ana ağa karşı çalışamaz. Henüz hiçbir ağda rollup oluşturulmamıştır, dolayısıyla izlenecek bir şey yoktur.
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require. See "Signing with the published clients" in
// Deploying a Rollup — the classical-only client in @qorechain/rdk 0.4.4
// cannot get a challenge accepted.
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

  // Called as a batch approaches the end of its challenge window.
  onDeadline: ({ batch, secondsRemaining }) => {
    console.warn("challenge window closing for batch", batch.batchIndex, secondsRemaining);
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
Watchtower'ın bildirdiği son tarih, itiraz penceresinin blok başına 6 saniye üzerinden bloğa dönüştürülmüş halini kullanır (varsayılan olarak 100.800 blok); bu nedenle ana ağın ≈3,2 sn'lik bloklarında gerçek pencere "7 gün"den daha kısadır. Bir itiraz göndermek ayrıca rollup'ın itiraz teminatını (`nft` ve `custom` ön ayarları için 1.000 QOR) gerektirir.
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower`, çerçeveyi komut satırından çalıştırır; siz Ctrl-C'ye basana kadar
yeni yığınları ve itiraz penceresi son tarihlerini yazdırır. Tam `qorollup`
operatör CLI'si için bkz.
[Bir Rollup Dağıtma](/rollups/deploying-a-rollup).
