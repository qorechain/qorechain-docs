---
slug: /user-guide/xqore-staking
title: xQORE Stake Etme
sidebar_label: xQORE Stake Etme
sidebar_position: 4
---

# xQORE Stake Etme

Bu kılavuz, QOR sahiplerinin tokenlarını gelişmiş yönetişim gücü için kilitlemesine olanak tanıyan ve uzun vadeli katılımcıları ödüllendiren bir PvP rebase modeline sahip xQORE yönetişim stake etme mekanizmasını kapsar.

:::note
Aşağıdaki komutlar **`qorechain-diana`** test ağını (EVM chain ID **9800**) kullanır. Ana ağ (**`qorechain-vladi`**, EVM chain ID **9801**) 7 Haziran 2026'dan beri **v3.1.77** zincir sürümünü çalıştırarak yayında — ana ağda stake ederken **Ana Ağa Bağlanma** sayfasındaki ana ağ chain ID'sini ve uç noktalarını kullanın.
:::

---

## Genel Bakış

xQORE, QoreChain'in yönetişim-stake etme tokenıdır. QOR kilitlediğinizde, **1:1 oranında** xQORE alırsınız. xQORE tutmak, yönetişimde önemli bir avantaj sağlar: xQORE tokenları QDRW oy gücü formülünde **çift ağırlıkla** sayılır (bkz. [Yönetişim](/user-guide/governance)).

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

Bu, QOR'u xQORE'a kilitlemenin, tek başına normal stake etmeye kıyasla yönetişim etkisini fiilen iki katına çıkardığı anlamına gelir.

---

## xQORE için QOR Kilitleme

xQORE basmak için QOR tokenlarını 1:1 oranında kilitleyin:

```bash
qorechaind tx xqore lock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Örnek:** 1.000 QOR kilitleyin:

```bash
qorechaind tx xqore lock 1000000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Bu işlemden sonra hesabınız 1.000.000.000 uxqore (1.000 xQORE) tutacaktır.

---

## xQORE Kilidini Açma

QOR'u geri almak için xQORE yakın. Tokenların ne kadar süre kilitli kaldığına bağlı olarak bir **çıkış cezası** uygulanabilir:

```bash
qorechaind tx xqore unlock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Örnek:** 500 xQORE kilidini açın:

```bash
qorechaind tx xqore unlock 500000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Çıkış Cezası Takvimi

xQORE'dan erken çekim bir cezaya tabidir. Ne kadar uzun tutarsanız, ceza o kadar düşük olur:

| Kilit Süresi      | Çıkış Cezası |
| ------------------ | ------------ |
| 30 günden az  | **50%**      |
| 30 ila 90 gün      | **35%**      |
| 90 ila 180 gün     | **15%**      |
| 180 günden fazla | **0%**       |

**Örnek:** 1.000 QOR kilitlediyseniz ve 45 gün sonra kilidini açarsanız, 650 QOR alırsınız (%35 ceza uygulanır). Kalan 350 QOR, PvP rebase mekanizması aracılığıyla diğer xQORE sahiplerine yeniden dağıtılır.

---

## PvP Rebase Mekanizması

Erken çıkışlardan toplanan cezalar **yakılmaz**. Bunun yerine, kalan tüm xQORE sahiplerine orantılı olarak yeniden dağıtılır. Bu, sabırlı sahiplerin başkalarının sabırsızlığından faydalandığı bir "Oyuncu vs Oyuncu" dinamiği yaratır.

Nasıl çalışır:

1. Bir kullanıcı, 180 günlük sıfır ceza eşiğinden önce xQORE kilidini açar.
2. Çıkış cezası, iade edilen QOR'undan düşülür.
3. Ceza miktarı, kalan tüm xQORE pozisyonlarına orantılı olarak dağıtılır.
4. Kalan her sahibin xQORE başına talep edilebilir QOR'u artar.

Bu mekanizma, uzun vadeli yönetişim bağlılığını teşvik eder ve pozisyonlarını koruyan sahipleri ödüllendirir.

---

## Pozisyonunuzu Sorgulama

Mevcut xQORE pozisyonunuzu, kilit sürenizi ve uygulanabilir çıkış cezanızı kontrol edin:

```bash
qorechaind query xqore position <address>
```

**Örnek:**

```bash
qorechaind query xqore position qor1abc...xyz
```

**Örnek çıktı:**

```yaml
position:
  address: qor1abc...xyz
  locked_amount: "1000000000"
  xqore_balance: "1000000000"
  lock_timestamp: "2026-01-15T12:00:00Z"
  current_penalty_rate: "0.150000000000000000"
  accrued_rebase: "25000000"
```

---

## JSON-RPC Erişimi

JSON-RPC aracılığıyla QoreChain ile entegre olan uygulamalar için, xQORE pozisyonu şu kullanılarak sorgulanabilir:

```
qor_getXQOREPosition
```

**İstek:**

```json
{
  "jsonrpc": "2.0",
  "method": "qor_getXQOREPosition",
  "params": ["qor1abc...xyz"],
  "id": 1
}
```

**Yanıt:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "locked_amount": "1000000000",
    "xqore_balance": "1000000000",
    "lock_timestamp": "2026-01-15T12:00:00Z",
    "current_penalty_rate": "0.15",
    "accrued_rebase": "25000000"
  }
}
```

---

## İpuçları

* Oy gücünüzü en üst düzeye çıkarmak için önemli yönetişim oylamalarından çok önce QOR'u xQORE'a kilitleyin.
* Sıfır cezalı çıkışlar için 180 günlük eşik, sabırlı yönetişim katılımcılarını ödüllendirir.
* PvP rebase birikimlerini izleyin. Başkaları erken çıktıkça pozisyonunuzun değeri artar.
* xQORE transfer edilemez. Yalnızca QOR kilitlenerek basılabilir ve kilidi açılarak yakılabilir.
* Kilitlemeden önce çıkış cezasını dikkatlice değerlendirin. Kısa vadeli kilitler önemli cezalar taşır.
