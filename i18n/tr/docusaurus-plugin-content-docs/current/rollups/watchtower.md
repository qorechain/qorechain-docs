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
geçerlilik yüklemiyle (validity predicate) bir yığını reddettiğinizde — bir
itirazı devreye sokabilmeniz için onu `onInvalid` geri çağırma fonksiyonunuza
(callback) iletir.

Çerçeve izler ve *ne zaman* olacağına karar verir; **geçerlilik kontrolünü siz
sağlarsınız**. Watchtower hiçbir zaman bir yığının hileli olduğuna kendi başına
karar vermez — sizin `validate` fonksiyonunuzu çağırır ve döndürdüğünüz değere
göre hareket eder.

## `watchBatches`

```ts
import { createRdkClient, watchBatches, challengeBatch } from "@qorechain/rdk";

const rdk = createRdkClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    rpc: "https://rpc.testnet.example", // needed to broadcast a challenge
  },
});

const watcher = watchBatches(rdk, "my-roll", {
  onBatch: (batch) => {
    console.log("new batch", batch.index);
  },

  // Your validity predicate. Return false to flag the batch as invalid.
  validate: async (batch) => {
    return await isBatchValid(batch); // your logic
  },

  // Called when validate() returns false — wire it to a challenge.
  onInvalid: async (batch) => {
    await challengeBatch(rdk, "my-roll", batch.index /* + your fraud proof */);
  },

  // Called as a batch approaches the end of its challenge window.
  onDeadline: (batch) => {
    console.warn("challenge window closing for batch", batch.index);
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

`onInvalid`'i `challengeBatch`'e bağlamak, Watchtower'ı eksiksiz bir otomatik
itiraz aracına dönüştürür; yalnızca gözlem (observe-only) modunda çalıştırmak için
onu ayarlanmamış bırakın.

## CLI

```bash
qorollup watchtower my-roll
```

`watchtower`, çerçeveyi komut satırından çalıştırır; siz Ctrl-C'ye basana kadar
yeni yığınları ve itiraz penceresi son tarihlerini yazdırır. Tam `qorollup`
operatör CLI'si için bkz.
[Bir Rollup Dağıtma](/rollups/deploying-a-rollup).
