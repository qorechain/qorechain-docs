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
Aşağıdaki komutlar `qorechaind` kullanır. Ortamınız için olağan işlem bayraklarını (`--from`, `--chain-id`, `--gas`, `--fees`, `--node`) ekleyin — örneğin ana ağa karşı `--chain-id qorechain-vladi`.
:::

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

Havuzlar, havuz yetkilisi (`--from` ile geçirilen adres) tarafından duraklatılabilir ve sürdürülebilir. Duraklatılmış bir havuz, sürdürülene kadar takasları ve likidite değişikliklerini reddeder — olay müdahalesi veya koordineli bakım için kullanışlıdır.

```bash
# Pause pool 1 with a human-readable reason
qorechaind tx amm pause-pool 1 "scheduled maintenance" \
  --from qor1authority... --chain-id qorechain-vladi

# Resume pool 1
qorechaind tx amm resume-pool 1 \
  --from qor1authority... --chain-id qorechain-vladi
```

## Komut özeti

**İşlemler** (`qorechaind tx amm …`):

| Komut | Amaç |
| --- | --- |
| `create-pool` | Bir `constant_product` veya `stable_swap` havuzu oluştur |
| `add-liquidity` | Rezerv yatır ve LP tokenları bas |
| `remove-liquidity` | LP tokenları yak ve rezervleri çek |
| `swap-exact-in` | Sabit bir giriş tutarını takas et |
| `swap-exact-out` | Sabit bir çıkış tutarına takas et |
| `pause-pool` | Bir havuzu duraklat (yetkili) |
| `resume-pool` | Duraklatılmış bir havuzu sürdür (yetkili) |

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
- Varlıkları önce QoreChain'e getirmek için [Varlık Köprüleme](/user-guide/bridging-assets) sayfasına bakın.
