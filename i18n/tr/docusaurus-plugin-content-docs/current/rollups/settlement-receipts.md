---
slug: /rollups/settlement-receipts
title: Uzlaşma makbuzları
sidebar_label: Uzlaşma Makbuzları
sidebar_position: 6
---

# Uzlaşma makbuzları

Bir **uzlaşma makbuzu**, bir rollup'un uzlaşma partisinin kuantum sonrası bir imza altında Ana Zincire çapalandığına dair taşınabilir bir kayıttır. Rollup'u, partiyi ve çapayı adlandırır ve çapanın **ML-DSA-87** (Dilithium-5, FIPS-204) imzasını taşır; bu, Ana Zincirin kullandığı şemanın aynısıdır.

:::caution Erken aşama: henüz hiçbir çapa yok
Makbuzlar çapalara bağlıdır ve **henüz hiçbir ağda bir rollup veya çapa yoktur** (27 Ekim 2026 itibarıyla kontrol edildi). v3.2.2'den beri (her iki ağda da canlı) `anchor_signature` ile gönderilen bir parti, aynı işlemde `x/multilayer` içinde çapalanır; bu olmadan gönderilen bir parti çapasız olarak uzlaşır. TypeScript RDK (0.6.0 ile 0.7.0 arası), işlem istemcisi hibrit imzaladığında ve rollup'ın oluşturucusu olduğunda bu alanı gönderir, aksi halde çapasız gönderir; Python, Go, Rust ve Java istemcileri yalnızca klasik imzalar ve bu alanı oluşturmaz. Bunların hiçbiri canlı bir rollup üzerinde denenmemiştir. Bu sayfayı bugün güvenebileceğiniz bir hizmetin değil, tasarımın ve yapı taşlarının bir açıklaması olarak değerlendirin.
:::

## Bir makbuz kanıt değil, bir iddiadır {#a-receipt-is-a-claim}

Bir makbuzdaki her alan, onu size veren kişi tarafından sağlanır. İmzayı size verilen bir anahtara karşı kontrol etmek, o anahtara sahip birinin o baytları imzaladığını gösterir; QoreChain'in herhangi bir şeyi çapaladığını göstermez. Bu nedenle bir doğrulayıcının, güvendiği bir QoreChain düğümüne bağlı bir istemciye ihtiyacı vardır ve iddiayı zincir durumundan yeniden okur: rollup ve katmanı, parti ve durum kökü, çapa ve oluşturucunun kayıtlı kuantum sonrası anahtarı.

## Çapanın neyi imzaladığı {#what-the-anchor-signs}

Çapanın imzası, **rollup oluşturucusunun** kayıtlı ML-DSA-87 anahtarıyla atılır. İmzalanan mesaj, çapanın gönderildiği yüksekliğe bağlıdır. **v3.2.2'den itibaren (ana ağ yüksekliği 3,556,788, testnet yüksekliği 6,905,034) bu, v2 mesajıdır**: bir alan etiketi (domain tag), zincir kimliği ve uzunluk önekli `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, işlem sayısı ve sıkıştırılmış durum kanıtı (tam yerleşim [Çapaları Okuma](/architecture/multilayer-architecture#reading-anchors) bölümündedir). Zincir, o yükseklikten itibaren v1 çapayı (`layer_id || layer_height || state_root || validator_set_hash`, zincir kimliği yok) kabul etmez. İki biçimi de koda sabit yazmayın: hedeflediğiniz ağın imza baytlarını okuyun. RDK, v2 baytlarını `anchorSignBytesForBatch` ile (ve her iki biçimi `anchorSignBytesV1` / `anchorSignBytesV2` ile) oluşturur ve CLI bunları yazdırır, örneğin `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>` ile.

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

Her doğrulama için bir `client` iletin. Makbuz API'si ve kontrolleri sürümler arasında değişmiştir; bu nedenle 0.7.0'ı (güncel sürüm; makbuz kontrolleri 0.6.1'de getirilenlerdir) kullanın: 0.5.0 zincir kontrolünü tamamlayamıyordu ve 0.6.0 makbuzun her alanını karşılaştırmıyordu (aşağıya bakın). Python, Go, Rust ve Java istemcileri aynı oluşturma/doğrulama yüzeyini sunar; 0.6.1 ve sonraki sürümleri aynı tekil anahtar arama rotasını, çapa mesajının aynı yüksekliğe dayalı seçimini ve aynı alan alan karşılaştırmayı kullanır.

### 0.7.0 neyi doğrular {#what-060-verifies}

`verifySettlementReceipt`, yalnızca makbuza dayanarak asla `valid` bildirmez: `client` olmadan sonuç `mode: "signature-only"` ve `valid: false` olur. Bir `client` ile zinciri yeniden okur ve her kontrolü ayrı ayrı bildirir:

* `rollupLayerBinding`: zincir, rollup'ın makbuzun katmanına ait olduğunu söyler;
* `batchStateRoot`: zincirdeki parti, makbuzun durum kökünü taşır;
* `anchorOnChain`: makbuzun belirttiği **her** çapa alanıyla eşleşen bir çapa zincirde mevcuttur: durum kökü, katman yüksekliği, doğrulayıcı kümesi karması, imza, Ana Zincir yüksekliği, çapa zamanı, algoritma ve sürüm; sürüm 2 makbuzunda ayrıca işlem sayısı ve sıkıştırılmış durum kanıtı. Bir uyuşmazlık, alanı adıyla bildirir;
* `creatorAuthority`: imza anahtarı makbuzdan alınmadı, zincirden (`/qorechain/pqc/v1/account/{address}`) okundu;
* `pqcSignature`: ML-DSA-87 imzası, kurallı (canonical) çapa mesajı üzerinde doğrulanır;
* `chainBinding`: makbuz, gerçekten sorgulanan zinciri adlandırır.

Çapa mesajı, çapanın kaydedildiği yüksekliğe göre seçilir (v3.2.2 geçişinin altında v1, geçişten itibaren v2); asla ikisi de denenerek seçilmez, çünkü bir v1 imzası zincir kimliği taşımaz ve her zincirde doğrulanırdı. Paket, ana ağ (3,556,788) ve testnet (6,905,034) için geçiş yüksekliğini taşır. Sonuç, kullandığı biçimi `signBytesVersion` olarak bildirir. Makbuz şeması v2, `chainId` kaydeder; sürüm 1 makbuz hiçbirini taşımaz, bu nedenle `chainBinding` kontrolünü yalnızca çapası sorguladığınız zincirde bulunduğu için geçer. Doğrulama, başka bir zincirin düğümüne karşı kontrol edilen bir makbuzu reddeder. Zincirden herhangi bir şey okunmadan önce `receiptSchemaError`, bilinmeyen bir `version`'a, `ML-DSA-87` dışında bir `algorithm`'a veya (sürüm 2'de) `chainId`'si olmayan bir makbuza itiraz eder.

0.6.1'den itibaren sonuç ayrıca zincirin kendi `anchor` kaydını ve `valid` true olduğunda zincir durumundan yeniden oluşturulmuş bir `verifiedReceipt` değerini (Python ve Rust'ta `verified_receipt`, Go'da `VerifiedReceipt`) taşır: olguları size verilen makbuzdan değil, bunlardan okuyun. `qorollup receipt verify --json`, dosyayı yansıtmak yerine zincirden okunan bu makbuzu `receipt` olarak döndürür (makbuz geçerli değilse `null`). İşlem sayısından ve kanıttan önce düzenlenmiş sürüm 1 makbuzları yine de doğrulanır.

Hiçbir ağda çapa yoktur; bu nedenle bu yalnızca paket koduna karşı ve çevrimdışı kontrol edilmiştir, gerçek bir çapaya karşı değil. `buildSettlementReceipt` yalnızca bir çapa partiyi kapsadığında çalışır.

:::note 0.6.1 öncesi sürümler
0.6.0'daki `verifySettlementReceipt`, zincirin çapasını durum köküne, katman yüksekliğine, doğrulayıcı kümesi karmasına ve imzaya göre eşleştiriyordu, ancak bir makbuzun gösterdiği diğer alanları (Ana Zincir yüksekliği, çapa zamanı, algoritma, sürüm ve sürüm 2 makbuzunda işlem sayısı ile sıkıştırılmış durum kanıtı) karşılaştırmıyordu ve parti durum kökünü bilgilendirici sayıyordu. Uzlaşma iddiasının kendisi (durum kökü, çapa imzası, oluşturucu anahtarı) her zaman bağlıydı; 0.6.0'ın söyleyemediği, yanında yazdırılan üst verinin zincirle eşleşip eşleşmediğiydi. 0.7.0'ı kullanın.

0.5.0'daki `verifySettlementReceipt`, canlı ağlara karşı güvenli biçimde başarısız oluyordu (fail closed); bunun iki nedeni vardı ve ikisi de zincirde değil, istemcideydi: oluşturucunun anahtarını, kuantum sonrası hesap rotasının ağların sunmadığı çoğul bir `accounts` biçimi üzerinden arıyordu (HTTP 501) ve yalnızca v1 mesajını yeniden oluşturuyordu; zincir bunu v3.2.2'den beri çapalar için artık kabul etmez. Dolayısıyla gerçek bir makbuz doğrulanamıyordu, sahte olan ise yine reddediliyordu. 0.7.0'ı kullanın.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

Tam `qorollup` operatör CLI'sı için [Bir Rollup Dağıtma](/rollups/deploying-a-rollup) sayfasına bakın.
