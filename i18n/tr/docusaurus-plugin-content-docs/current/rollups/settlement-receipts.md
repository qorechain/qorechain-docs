---
slug: /rollups/settlement-receipts
title: Kuantuma dayanıklı uzlaşma makbuzları
sidebar_label: Uzlaşma Makbuzları
sidebar_position: 6
---

# Kuantuma dayanıklı uzlaşma makbuzları

Bir **uzlaşma makbuzu**, bir rollup'un uzlaşma partisinin kuantum sonrası bir imza altında Ana Zincire çapalandığına dair taşınabilir bir kayıttır. Rollup'u, partiyi ve çapayı adlandırır ve çapanın **ML-DSA-87** (Dilithium-5, FIPS-204) imzasını taşır; bu, Ana Zincirin kullandığı şemanın aynısıdır.

:::caution Erken aşama: henüz hiçbir çapa yok
Makbuzlar çapalara bağlıdır ve **henüz hiçbir ağda bir rollup veya çapa yoktur**. Ana ağda RDK henüz çapa yazmaz: uzlaşma partileri kaydedilir, ancak çapalama adımı atlanır. Bu sayfayı bugün güvenebileceğiniz bir hizmetin değil, tasarımın ve yapı taşlarının bir açıklaması olarak değerlendirin.
:::

## Bir makbuz kanıt değil, bir iddiadır {#a-receipt-is-a-claim}

Bir makbuzdaki her alan, onu size veren kişi tarafından sağlanır. İmzayı size verilen bir anahtara karşı kontrol etmek, o anahtara sahip birinin o baytları imzaladığını gösterir; QoreChain'in herhangi bir şeyi çapaladığını göstermez. Bu nedenle bir doğrulayıcının, güvendiği bir QoreChain düğümüne bağlı bir istemciye ihtiyacı vardır ve iddiayı zincir durumundan yeniden okur: rollup ve katmanı, parti ve durum kökü, çapa ve oluşturucunun kayıtlı kuantum sonrası anahtarı.

## Çapanın neyi imzaladığı {#what-the-anchor-signs}

Çapanın imzası, **rollup oluşturucusunun** kayıtlı ML-DSA-87 anahtarıyla atılır. Bugün ana ağda imzalanan mesaj şudur

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

Daha yeni bir zincir sürümü imzalanan mesajı değiştirir, bu nedenle bunu koda sabit yazmayın: hedeflediğiniz ağın imza baytlarını okuyun. Çapa, katman düzeyinde bir nesnedir: rollup'u veya partiyi adlandırmaz, bu nedenle bir doğrulayıcı bunları zincir okumaları aracılığıyla bağlar (bkz. [Çok Katmanlı Mimari](/architecture/multilayer-architecture#reading-anchors)).

## Çapaları okuma {#reading-anchors}

Çapalar REST ve gRPC üzerinden okunabilir (en son çapa için `/qorechain/multilayer/v1/anchor/{layer_id}` ve geçmiş için `/qorechain/multilayer/v1/anchors/{layer_id}`), bir hesabın kayıtlı kuantum sonrası anahtarı ise `/qorechain/pqc/v1/account/{address}` adresinden okunabilir. Bir rollup'un partileri `qorechaind query rdk batch [rollup-id]` ile okunur (RDK REST rotaları bugün ana ağda sunulmaz).

## Oluşturma ve doğrulama (TypeScript) {#build-and-verify}

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// Build a receipt for one batch (throws if no anchor covers the batch yet).
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 7);

// Verify it against chain state — pass a client; a receipt on its own proves nothing.
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

Her doğrulama için bir `client` iletin. RDK istemcinizin yayınlanmış en son sürümünü kullanın: makbuz API'si ve kontrolleri sürümler arasında değişmiştir ve Python, Go, Rust ve Java istemcileri aynı oluşturma/doğrulama yüzeyini sunar (ML-DSA-87 doğrulamasını [`qorechain-pqc`](https://github.com/qorechain) kütüphanesi aracılığıyla gerçekleştirirler).

:::note Mevcut istemci sınırlamaları
Yayınlanmış RDK istemcileri oluşturucunun anahtarını canlı zincirin sunmadığı bir yol üzerinden arar; bu nedenle çevrimiçi doğrulama canlı ağlarda henüz tamamlanmaz. Bir istemci sürümü bunu ele alana kadar, bir makbuzu yalnızca kendi düğümünüzden okuduğunuz çapayla çapraz kontrol edilecek bir kayıt olarak kullanın.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

Tam `qorollup` operatör CLI'sı için [Bir Rollup Dağıtma](/rollups/deploying-a-rollup) sayfasına bakın.
