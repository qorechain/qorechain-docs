---
slug: /rollups/settlement-receipts
title: Kuantuma dayanıklı uzlaşma makbuzları
sidebar_label: Uzlaşma Makbuzları
sidebar_position: 6
---

# Kuantuma dayanıklı uzlaşma makbuzları

Bir **uzlaşma makbuzu**, bir rollup'un uzlaşma partisinin kuantum sonrası bir imza altında Ana Zincire çapalandığına dair taşınabilir bir kayıttır. Rollup'u, partiyi ve çapayı adlandırır ve çapanın **ML-DSA-87** (Dilithium-5, FIPS-204) imzasını taşır; bu, Ana Zincirin kullandığı şemanın aynısıdır.

:::caution Erken aşama: henüz hiçbir çapa yok
Makbuzlar çapalara bağlıdır ve **henüz hiçbir ağda bir rollup veya çapa yoktur** (20 Ekim 2026 itibarıyla kontrol edildi). v3.2.2'den beri (her iki ağda da canlı) `anchor_signature` ile gönderilen bir parti, aynı işlemde `x/multilayer` içinde çapalanır; bu olmadan gönderilen bir parti çapasız olarak uzlaşır. Yayınlanmış RDK istemcileri (0.5.0) bu alanı göndermez, dolayısıyla gönderdikleri partiler çapasızdır. Bu sayfayı bugün güvenebileceğiniz bir hizmetin değil, tasarımın ve yapı taşlarının bir açıklaması olarak değerlendirin.
:::

## Bir makbuz kanıt değil, bir iddiadır {#a-receipt-is-a-claim}

Bir makbuzdaki her alan, onu size veren kişi tarafından sağlanır. İmzayı size verilen bir anahtara karşı kontrol etmek, o anahtara sahip birinin o baytları imzaladığını gösterir; QoreChain'in herhangi bir şeyi çapaladığını göstermez. Bu nedenle bir doğrulayıcının, güvendiği bir QoreChain düğümüne bağlı bir istemciye ihtiyacı vardır ve iddiayı zincir durumundan yeniden okur: rollup ve katmanı, parti ve durum kökü, çapa ve oluşturucunun kayıtlı kuantum sonrası anahtarı.

## Çapanın neyi imzaladığı {#what-the-anchor-signs}

Çapanın imzası, **rollup oluşturucusunun** kayıtlı ML-DSA-87 anahtarıyla atılır. İmzalanan mesaj, çapanın gönderildiği yüksekliğe bağlıdır. **v3.2.2'den itibaren (ana ağ yüksekliği 3,556,788, testnet yüksekliği 6,905,034) bu, v2 mesajıdır**: bir alan etiketi (domain tag), zincir kimliği ve uzunluk önekli `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, işlem sayısı ve sıkıştırılmış durum kanıtı (tam yerleşim [Çapaları Okuma](/architecture/multilayer-architecture#reading-anchors) bölümündedir). Zincir, o yükseklikten itibaren v1 çapayı (`layer_id || layer_height || state_root || validator_set_hash`, zincir kimliği yok) kabul etmez. İki biçimi de koda sabit yazmayın: hedeflediğiniz ağın imza baytlarını okuyun, örneğin `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>` ile.

Çapa, katman düzeyinde bir nesnedir: rollup'u veya partiyi adlandırmaz, bu nedenle bir doğrulayıcı bunları zincir okumaları aracılığıyla bağlar (bkz. [Çok Katmanlı Mimari](/architecture/multilayer-architecture#reading-anchors)).

## Çapaları okuma {#reading-anchors}

Çapalar REST ve gRPC üzerinden okunabilir (en son çapa için `/qorechain/multilayer/v1/anchor/{layer_id}` ve geçmiş için `/qorechain/multilayer/v1/anchors/{layer_id}`), bir hesabın kayıtlı kuantum sonrası anahtarı ise `/qorechain/pqc/v1/account/{address}` adresinden okunabilir (tekil `account`). Bir rollup'un partileri, her iki ağın da sunduğu RDK REST rotaları (`/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`, `/qorechain/rdk/v1/latest_batch/{rollup_id}`, `/qorechain/rdk/v1/batches/{rollup_id}`) üzerinden veya `qorechaind query rdk batch [rollup-id]` ile okunur.

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

Her doğrulama için bir `client` iletin. Makbuz API'si ve kontrolleri sürümler arasında değişmiştir; bu nedenle zincire karşı doğrulama yapan bir sürüm kullanın (0.5.0 veya sonrası). Python, Go, Rust ve Java istemcileri aynı oluşturma/doğrulama yüzeyini sunar (beş istemcinin tamamı, aşağıdaki sınırlamadaki çoğul anahtar arama yolunun aynısını kullanır).

:::caution Mevcut istemci sınırlamaları (RDK 0.5.0)
0.5.0'daki `verifySettlementReceipt`, yalnızca makbuza dayanarak asla `valid` bildirmez (`client` olmadan sonuç `mode: "signature-only"` ve `valid: false` olur) ve zincir kontrolü canlı ağlara karşı henüz tamamlanmaz; bunun iki nedeni vardır ve ikisi de zincirde değil, istemcidedir:

* oluşturucunun anahtarını, kuantum sonrası hesap rotasının ağların sunmadığı çoğul `accounts` biçimi üzerinden arar (HTTP 501; çalışan rota tekil `account` olandır); bu nedenle bir `client` ile sonuç, oluşturucunun kuantum sonrası anahtarının çözümlenemediği gerekçesiyle `valid: false` olur; ve
* imzalanan mesajı, zincirin v3.2.2'den beri çapalar için artık kabul etmediği v1 yerleşiminde yeniden oluşturur; bu nedenle anahtar elde olsa bile gerçek bir v2 imzasını doğrulayamazdı.

`buildSettlementReceipt` yalnızca bir çapa partiyi kapsadığında çalışır ve hiçbiri yoktur. Bir makbuzu yalnızca, kendi düğümünüzden okuduğunuz çapa ve oluşturucunun anahtarıyla, ağa ait v2 imza baytları kullanılarak çapraz kontrol edilecek bir kayıt olarak kullanın.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

Tam `qorollup` operatör CLI'sı için [Bir Rollup Dağıtma](/rollups/deploying-a-rollup) sayfasına bakın.
