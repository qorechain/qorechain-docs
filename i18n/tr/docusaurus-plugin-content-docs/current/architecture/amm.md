---
slug: /architecture/amm
title: AMM ve Zincir Üstü Likidite
sidebar_label: AMM ve Zincir Üstü Likidite
sidebar_position: 8
---

# AMM ve Zincir Üstü Likidite

`x/amm` modülü, QoreChain'in yerel, zincir üstü otomatik piyasa yapıcısıdır (AMM). Herkesin likidite havuzları oluşturmasına, likidite sağlamasına ve QoreChain-yerel varlıkları doğrudan protokol seviyesinde takas etmesine olanak tanır — zincir dışı bir emir defteri ve harici bir akıllı sözleşme DEX gerektirmez. **Kontrol Paneli Trade / DEX** deneyiminin arkasındaki zincir üstü uzlaşma katmanıdır.

Havuzlar tanıdık AMM fiyatlandırma eğrilerini takip eder:

- **`constant_product`** — `x*y=k` eğrisi (genel amaçlı çiftler).
- **`stable_swap`** — yakın sabitlenmiş çiftler için düşük kaymalı bir eğri, bir genlik katsayısıyla ayarlanır.

Tüm tutarlar QoreChain'in yerel birimlerini kullanır. Stake ve ücret tokenı **QOR**'dur ve temel birimi **uqor**'dur (1 QOR = 10^6 uqor). Havuz katılımcıları ve adresleri `qor` bech32 önekini kullanır.

:::note
Aşağıdaki komutlar `qorechaind` kullanır. Ortamınız için olağan işlem bayraklarını (`--from`, `--chain-id`, `--gas`, `--fees`, `--node`) ekleyin — örneğin ana ağa karşı `--chain-id qorechain-vladi --gas 400000 --fees 40000uqor` (ağ ücret tabanı, gaz birimi başına 0,1 uqor'dur). Her `tx amm` komutu bir Cosmos hattı işlemidir, bu nedenle hibrit kuantum sonrası imza gerektirir: `--generate-only > tx.json` ekleyin, ardından `qorechaind tx pqc cosign tx.json --from <key> --pqc-key <name> --chain-id <id>` komutunu çalıştırın (bkz. [İlk İşlem](/getting-started/first-transaction#send-qor)).
:::

:::caution Henüz hiç havuz yok
AMM modülü ana ağda (v3.2.3) ve test ağında (v3.2.4) canlıdır, ancak **henüz hiçbir havuz oluşturulmamıştır** (20 Ekim 2026'da kontrol edildi: `GET /qorechain/amm/v1/pools` her ikisinde de boş bir liste döndürür) ve aşağıdaki örneklerdeki birimler (`uusdc`, `uusdt`) açıklayıcıdır: bugün ağlarda böyle varlıklar bulunmaz. Bir havuz oluşana kadar her takas veya likidite ekleme komutu, havuz bulunamadı hatasıyla başarısız olur.
:::

## Modül parametreleri {#parameters}

Canlı değerleri `qorechaind query amm params` veya `GET /qorechain/amm/v1/params` ile okuyun. Ana ağ ve test ağı şu anda aynı değerleri bildirir:

| Parametre | Değer | Anlamı |
| --- | --- | --- |
| `enabled` | `true` | Modül anahtarı |
| `swap_fee_bps` | `30` | Takas ücreti, giriş tutarının %0,30'u |
| `protocol_fee_bps` | `10` | Takas ücretinin protokol payı olarak havuzdan çıkan kısmı (girişin %0,10'u). Geri kalanı likidite sağlayıcıları için havuzda kalır |
| `pool_creation_fee` | `100000000` | 100 QOR (uqor cinsinden); ilk yatırımlara ek olarak tahsil edilir ve bir havuz oluşturulduğunda yakılır |
| `min_liquidity` | `1000` | Yeni bir havuzun iki ilk yatırımından küçük olanı en az bu kadar temel birim olmalıdır |
| `max_pools_per_creator` | `50` | Bir hesabın oluşturabileceği havuz sayısı |
| `max_swap_impact_bps` | `500` | Bir takasın sahip olabileceği en büyük fiyat etkisi (%5); bkz. [Takas kuralları](#swap-rules) |
| `lp_token_decimals` | `6` | Bir havuzun LP tokenının ondalık basamak sayısı |

## v3.2.2'den beri uygulanan takas kuralları {#swap-rules}

Aşağıdaki AMM bütünlük düzeltmeleri ana ağda v3.2.2 ile (3.556.788 yüksekliği, 16 Ekim 2026) uygulandı ve v3.2.3'te (3.662.051 yüksekliği, 20 Ekim 2026) iyileştirildi. Hangi hattan gelirse gelsin her takas için geçerlidirler.

* **Her iki birim de havuza bağlıdır.** Bir takas, hedeflediği havuzun iki birimini de belirtmelidir. Stable-swap havuzları her iki yönde de (tam-giriş ve tam-çıkış) stable-swap eğrisiyle fiyatlandırılır.
* **Protokol ücreti.** Takas ücretinin protokol payı havuzdan çıkar. QOR ile ödendiğinde ücret toplayıcıya gider ve bloğun diğer ücretleriyle bölüştürülür (bkz. [Tokenomik](/architecture/tokenomics)); yakılan kısım `amm` yakma kaynağı altında kaydedilir; başka herhangi bir birimde ise topluluk havuzuna gider. Havuz oluşturma ücreti yakılır ve aynı `amm` kaynağı altında kaydedilir.
* **Fiyat etkisi tavanı.** `max_swap_impact_bps` uygulanır: havuzun fiyatına göre fiyat etkisi %5'i aşan bir takas reddedilir. Kayma sınırı belirlemeyen bir takas (tam-girişte `min-out` değerinin 0 olması veya tam-çıkışta tüm giriş rezervini kapsayan bir `max-in`) ayrıca havuzun blok başındaki fiyatına göre ölçülür ve aynı bloktaki önceki işlemler fiyatı tavanın ötesine taşıdıysa reddedilir. Her takasta gerçek bir `min-out` / `max-in` belirleyin.
* **Sınırlandırılmış blok sonu işi (v3.2.3).** Her bloğun sonunda modül, en fazla 100 havuzun sürekli ağırlıklı ortalama fiyatını sırayla (round-robin) yeniler. 100 veya daha az havuz olduğu sürece her havuz her blokta yenilenir; bunun ötesinde bir havuzun ortalaması `ceil(pools / 100)` blokluk her turda bir güncellenir. Ortalama bilgilendirme amaçlıdır (`pool` sorgularıyla döndürülür) ve takas fiyatlandırmasını değiştirmez.

## Havuzlar ve LP payları

Bir havuz iki birimin (`token_a`, `token_b`, sıralı olarak saklanır) rezervlerini tutar ve bu rezervler üzerinde orantılı bir hak temsil eden **LP tokenları** basar. Her havuzun sayısal bir `id`'si, bir `type`'ı, bir `status`'u (`active` veya `paused`) ve kendi LP birimi vardır. Likidite eklediğinizde LP tokenları alırsınız; likidite çıkardığınızda rezervlerdeki payınızı geri almak için bunları yakarsınız.

### Bir havuz oluşturma

`create-pool` bir havuz türü ve iki ilk yatırımı (coin olarak) alır. Sabit bir çift için, genlik katsayısını `--amp` ile ayarlayın.

```bash
# Constant-product pool seeded with QOR and a bridged USD asset
qorechaind tx amm create-pool constant_product 1000000000uqor 1000000000uusdc \
  --from qor1youraddr... --chain-id qorechain-vladi

# Stable-swap pool with an amplification coefficient
qorechaind tx amm create-pool stable_swap 1000000000uusdc 1000000000uusdt \
  --amp 200 --from qor1youraddr... --chain-id qorechain-vladi
```

### Likidite ekleme

`add-liquidity` her iki tarafı da bir havuza yatırır ve LP tokenları basar. Son argüman, kabul edeceğiniz minimum LP tutarıdır — işleminiz gerçekleşmeden önce havuz oranının değişmesine karşı korumanız.

```bash
qorechaind tx amm add-liquidity 1 500000000uqor 500000000uusdc 100000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Likidite çıkarma

`remove-liquidity` LP tokenlarını yakar ve rezervleri çeker. İki `min` argümanı, geri alacağınız her tarafın minimum tutarını belirler.

```bash
qorechaind tx amm remove-liquidity 1 100000 490000000 490000000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

## Takaslar

AMM, iki standart takas yönünü destekler.

### Tam-giriş

`swap-exact-in` sabit bir giriş tutarı harcar ve eğrinin verdiği çıktıyı, bir minimum-çıktı tabanına (kayma koruması) tabi olarak döndürür.

```bash
# Spend exactly 1,000,000 uqor for uusdc, refusing anything below 990,000 uusdc out
qorechaind tx amm swap-exact-in 1 1000000uqor uusdc 990000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Tam-çıkış

`swap-exact-out` sabit bir çıkış tutarı talep eder ve gerekli olan kadar girişi, bir maksimum-giriş tavanına tabi olarak harcar.

```bash
# Receive exactly 1,000,000 uusdc, spending at most 1,010,000 uqor
qorechaind tx amm swap-exact-out 1 uqor 1000000uusdc 1010000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

Her takastaki sondaki `min-out` / `max-in` argümanı kayma korumasıdır: bunu taze bir teklif (aşağıda) artı toleransınızdan ayarlayın; yürütülen fiyat bunu ihlal ederse işlem geri alınır.

## Teklifler (fiyat ön izlemesi)

Teklifler salt okunurdur — bir takası göndermeden ön izleme yaparlar, böylece bir istemci kullanıcı imzalamadan önce beklenen çıktıyı ve ücreti gösterebilir. Bir Trade arayüzünün fiyat alanı için doğal destektirler.

```bash
# Preview the output of spending 1,000,000 uqor into pool 1
qorechaind query amm quote-exact-in 1 uqor 1000000
# -> returns amount_out and fee

# Preview the input needed to receive 1,000,000 uusdc from pool 1
qorechaind query amm quote-exact-out 1 uusdc 1000000
# -> returns amount_in and fee
```

Döndürülen `fee`, AMM'nin işleme uyguladığı takas ücretidir. Ücret ve kayma seviyeleri havuz/parametre güdümlüdür; bunları elle hesaplamak yerine herhangi bir işlem üzerindeki somut etkilerini görmek için teklif uç noktalarını kullanın.

## Havuzları ve bakiyeleri inceleme

Bunların tümü, herkesin çalıştırabileceği salt okunur sorgulardır.

```bash
# Module parameters
qorechaind query amm params

# A single pool by ID
qorechaind query amm pool 1

# Every pool
qorechaind query amm pools

# Resolve a pool from its denom pair (order-independent)
qorechaind query amm pool-by-denoms uqor uusdc

# An account's LP balance in a pool
qorechaind query amm lp-balance 1 qor1youraddr...
```

`pool` havuzun rezervlerini, LP arzını, türünü, durumunu ve sürekli ağırlıklı ortalama bir fiyatı döndürür. `lp-balance` bir hesabın o havuz için tuttuğu LP token `balance`'ını döndürür.

## Bir havuzu duraklatma ve sürdürme

Havuzlar, yönetişim yetkilisi tarafından duraklatılabilir ve sürdürülebilir. Ana ağda bu iki mesaj şu anda devre kesici tarafından kapatılmıştır; test ağında kapatılmamıştır. Duraklatılmış bir havuz, sürdürülene kadar takasları ve likidite değişikliklerini reddeder — olay müdahalesi veya koordineli bakım için kullanışlıdır.


## Komut özeti

**İşlemler** (`qorechaind tx amm …`):

| Komut | Amaç |
| --- | --- |
| `create-pool` | Bir `constant_product` veya `stable_swap` havuzu oluştur |
| `add-liquidity` | Rezerv yatır ve LP tokenları bas |
| `remove-liquidity` | LP tokenları yak ve rezervleri çek |
| `swap-exact-in` | Sabit bir giriş tutarını takas et |
| `swap-exact-out` | Sabit bir çıkış tutarına takas et |
| `pause-pool` | Bir havuzu duraklat (yönetişim yetkilisi; ana ağda kapalı) |
| `resume-pool` | Duraklatılmış bir havuzu sürdür (yönetişim yetkilisi; ana ağda kapalı) |

**Sorgular** (`qorechaind query amm …`):

| Komut | Amaç |
| --- | --- |
| `params` | Modül parametrelerini göster |
| `pool` | Kimliğe göre bir havuzu göster |
| `pools` | Tüm havuzları listele |
| `pool-by-denoms` | Birim çiftinden bir havuzu çöz |
| `lp-balance` | Bir hesabın havuzdaki LP bakiyesi |
| `quote-exact-in` | Sabit-giriş takası için çıktı ön izlemesi |
| `quote-exact-out` | Sabit-çıkış takası için giriş ön izlemesi |

## İlgili

- **Kontrol Paneli Trade / DEX**, bu havuzları, teklifleri ve takasları günlük kullanıcılar için grafiksel bir arayüzde sunar.
- QOR arzının, ücretlerin ve değerin zincir boyunca nasıl aktığını öğrenmek için [Tokenomik](/architecture/tokenomics) sayfasına bakın.
- Takasları kendiniz [Trade / DEX](/dashboard/trade) arayüzünde deneyin.
- Varlıkları önce QoreChain'e getirmek için [Varlık Köprüleme](/user-guide/bridging-assets) sayfasına bakın (köprü henüz canlı değildir).
- Havuzlar ayrıca [Gaz Soyutlaması](/user-guide/gas-abstraction) için bir ücret fiyat kaynağı olabilir; bugün ücretler için hiçbir token kabul edilmemektedir.
