---
slug: /rollups/settlement-receipts
title: Kuantuma dayanıklı uzlaşma makbuzları
sidebar_label: Uzlaşma Makbuzları
sidebar_position: 6
---

# Kuantuma dayanıklı uzlaşma makbuzları

Bir **uzlaşma makbuzu**, bir rollup'un uzlaşma partisinin kuantum sonrası bir imza
altında Ana Zincire çapalandığının taşınabilir, kendi kendine yeten bir kanıtıdır.
Belirli bir partiyi, rollup'un durumunu o yükseklikte taahhüt eden zincir üzeri çapaya
bağlar ve **tamamen çevrimdışı** olarak doğrulanabilir — düğüm yok, doğrulayıcının ağ
yoluna güven yok.

Çapa imzası **ML-DSA-87**'dir (Dilithium-5, FIPS-204); Ana Zincirin kullandığı kuantum
sonrası şemanın aynısıdır, böylece bir makbuz taban zincirin kuantuma dayanıklı
bütünlüğünü devralır.

## Kanonik çapa mesajı

Doğrulama, çapa alanlarından oluşturulan ve tam olarak şu sırayla birleştirilen kanonik
bir mesaj üzerinde bir Dilithium-5 imzasını kontrol eder:

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

`anchorSignBytes(...)` bu baytları üretir; doğrulayıcı bunları makbuzdan yeniden
oluşturur ve imzayı katman oluşturucunun kayıtlı ML-DSA-87 anahtarına karşı kontrol eder.

## Oluşturma ve doğrulama (TypeScript)

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({
  endpoints: { rest: "https://rest.testnet.example" },
});

// Build a portable receipt for one batch.
const receipt = await buildSettlementReceipt(rdk, "my-roll", 7);

// Persist it, ship it, hand it to a counterparty — it is self-contained JSON.

// Verify fully offline. With no client, you must supply the creator's key.
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "<layer creator ML-DSA-87 public key>",
});

console.log(result.valid); // true when the signature and the batch↔anchor binding both hold
```

Bir `creatorPublicKey` yerine (veya onun yanında) bir `client` iletirseniz, doğrulama
katman oluşturucunun kayıtlı ML-DSA-87 anahtarını zincirden getirir
(`getPqcAccount(address)`). Doğrulama daha sonra iki şeyi kontrol eder:

1. kanonik çapa mesajı üzerindeki **Dilithium-5 imzası** ve
2. **parti ↔ çapa durum-kökü bağlaması** — elinizde tuttuğunuz partinin çapanın taahhüt
   ettiği parti olduğu.

```ts
// Online verification: fetch the creator's PQC key from the chain.
const online = await verifySettlementReceipt(receipt, { client: rdk });
```

## Çapaları okuma

Makbuzlar, yeni bir zincir üzeri `x/multilayer` **Anchor** sorgusundan oluşturulur. Okumalar:

- `getAnchor(layerId)` — bir katman için çapa.
- `getLatestAnchor()` — en son çapa.
- `getAnchors(layerId)` — bir katman için çapa geçmişi.
- `getPqcAccount(address)` — oluşturucunun imzasını doğrulamak için kullanılan, kayıtlı
  bir kuantum sonrası hesap (ML-DSA-87 anahtarı).

## CLI

```bash
# Build a receipt and print it.
qorollup receipt my-roll 7

# Build, then verify it inline.
qorollup receipt my-roll 7 --verify

# Build and write it to a file.
qorollup receipt my-roll 7 --out receipt.json
```

Tam `qorollup` operatör CLI'sı için [Bir Rollup Dağıtma](/rollups/deploying-a-rollup)
sayfasına bakın.

## Diğer diller

Python, Go, Rust ve Java (JVM) istemcileri aynı oluşturma/doğrulama yüzeyini sunar.
ML-DSA-87 doğrulamasını paketlenmiş bir JavaScript uygulaması yerine
[`qorechain-pqc`](https://github.com/qorechain) kütüphanesi aracılığıyla gerçekleştirirler;
bunu diliniz için RDK istemcisinin yanında kurun.
