---
slug: /user-guide/token-operations
title: Token İşlemleri
sidebar_label: Token İşlemleri
sidebar_position: 1
---

# Token İşlemleri

Bu kılavuz, QOR tokenını, token gönderme ve almayı, bakiye sorgulamayı ve QoreChain üzerindeki ücret dağıtım modelini anlamayı kapsar.

:::note
Aşağıdaki komutlar **`qorechain-diana`** test ağını (EVM chain ID **9800**) kullanır. Ana ağ (**`qorechain-vladi`**, EVM chain ID **9801**) 7 Haziran 2026'dan beri **v3.1.77** zincir sürümünü çalıştırarak yayında — ana ağda işlem yaparken **Ana Ağa Bağlanma** sayfasındaki ana ağ chain ID'sini ve uç noktalarını kullanın.
:::

## Token Bilgileri

| Özellik                 | Değer                         |
| ------------------------ | ----------------------------- |
| **Gösterim Birimi** | QOR                           |
| **Temel Birim**    | uqor                          |
| **Dönüşüm**           | 1 QOR = 1.000.000 uqor (10^6) |
| **Chain ID**             | `qorechain-vladi` (ana ağ) / `qorechain-diana` (test ağı) |
| **Bech32 Öneki**        | `qor` (örn., `qor1abc...xyz`) |

Tüm zincir üzeri miktarlar **uqor** cinsinden belirtilir. İşlem gönderirken miktarları her zaman uqor cinsinden belirtin.

## Token Gönderme

QOR tokenlarını bir hesaptan diğerine transfer etmek için:

```bash
qorechaind tx bank send <from_address> <to_address> <amount>uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Örnek:** Başka bir adrese 5 QOR (5.000.000 uqor) gönderin:

```bash
qorechaind tx bank send qor1sender... qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Gönderen için ham adres yerine bir anahtar adı da kullanabilirsiniz:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

## Bakiyeleri Sorgulama

Herhangi bir hesabın bakiyesini kontrol edin:

```bash
qorechaind query bank balances <address>
```

**Örnek:**

```bash
qorechaind query bank balances qor1abc...xyz
```

**Örnek çıktı:**

```yaml
balances:
- amount: "15000000"
  denom: uqor
pagination:
  next_key: null
  total: "0"
```

Bu, hesabın 15 QOR (15.000.000 uqor) tuttuğunu gösterir.

## Ücret Yapısı

QoreChain üzerindeki işlem ücretleri, ağ teşviklerini hizalamak için beş hedefe dağıtılır:

| Hedef     | Pay | Amaç                                                         |
| --------------- | ----- | --------------------------------------------------------------- |
| **Doğrulayıcılar**  | 37%   | Blok üreticilerini ödüllendirir ve ağı güvence altına alır                 |
| **Yakılan**      | 30%   | Arzdan kalıcı olarak çıkarılır, deflasyonist baskı oluşturur |
| **Hazine**    | 20%   | Protokol geliştirmeyi ve ekosistem hibelerini finanse eder                 |
| **Stake Edenler**     | 10%   | Tüm delegatörlere orantılı olarak dağıtılır                    |
| **Hafif Düğümler** | 3%    | Ağ verisi sunan hafif düğüm operatörlerini ödüllendirir            |

## Yakma Kanalları

QoreChain, çok kanallı bir yakma mekanizması uygular. QOR tokenları, 10 farklı kanal aracılığıyla dolaşımdan kalıcı olarak çıkarılır:

| Kanal              | Açıklama                                                         |
| -------------------- | ------------------------------------------------------------------- |
| `tx_fee`             | Her işlem ücretinin %30'luk yakma payı                       |
| `governance_penalty` | Yönetişim önerileri yeter sayıya ulaşamadığında veya veto edildiğinde yakılır |
| `slashing_burn`      | Slashing uygulanan doğrulayıcı stake'lerinin yakılan payı                  |
| `bridge_fee`         | Zincirler arası köprü transferlerinde yakılan ücret                            |
| `spam_deterrent`     | İşaretlenen spam işlemlerine uygulanan ek yakma                |
| `epoch_excess`       | Hedefin üzerindeki fazla emisyonlar epoch sınırlarında yakılır           |
| `manual_burn`        | Yönetişim önerisi yoluyla toplulukça başlatılan token yakmaları             |
| `contract_callback`  | Akıllı sözleşme geri çağırma yürütmelerinde yakılan ücretler                   |
| `cross_vm_fee`       | Çapraz VM (örn., EVM'den CosmWasm'a) çağrıları yürütülürken yakılır        |
| `rollup_create`      | Yeni bir rollup dağıtılırken minimum stake'in %1'i yakılır          |

Tüm kanallardaki toplam yakılan miktarı sorgulayabilirsiniz:

```bash
qorechaind query bank total --denom uqor
```

## İpuçları

:::caution
Token göndermeden önce alıcı adreslerini her zaman iki kez kontrol edin. QoreChain üzerindeki işlemler geri alınamaz.
:::

:::tip

* Bir işlemi yayınlamadan simüle etmek için `--dry-run` bayrağını kullanın.
* Düğümün işleminiz için gereken gas'ı tahmin etmesine izin vermek için `--gas auto` kullanın.
* Standart bir transfer için minimum ücret **500 uqor**'dur.

:::
