---
slug: /user-guide/token-operations
title: Token İşlemleri
sidebar_label: Token İşlemleri
sidebar_position: 1
---

# Token İşlemleri

Bu kılavuz QOR token'ını, token gönderme ve alma işlemlerini, bakiye sorgulamayı ve QoreChain üzerindeki ücret dağıtım modelini ele alır.

:::note
Aşağıdaki komutlar **`qorechain-diana`** testnet'ini (EVM chain ID **9800**) kullanır. Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) 7 Haziran 2026'dan beri **v3.1.95** zincir sürümüyle canlıdır — mainnet üzerinde işlem yaparken **Mainnet'e Bağlanma** sayfasındaki mainnet chain ID ve endpoint'lerini kullanın.
:::

## Token Bilgileri

| Özellik                  | Değer                         |
| ------------------------ | ----------------------------- |
| **Görüntülenen Birim**   | QOR                           |
| **Temel Birim**          | uqor                          |
| **Dönüşüm**               | 1 QOR = 1.000.000 uqor (10^6) |
| **Chain ID**              | `qorechain-vladi` (mainnet) / `qorechain-diana` (testnet) |
| **Bech32 Öneki**          | `qor` (örn. `qor1abc...xyz`) |

Zincir üzerindeki tüm tutarlar **uqor** cinsinden ifade edilir. İşlem gönderirken tutarları her zaman uqor cinsinden belirtin.

## Token Gönderme

Bir hesaptan diğerine QOR token transferi yapmak için:

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

Gönderen için ham adres yerine bir anahtar adı (key name) da kullanabilirsiniz:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

## Bakiye Sorgulama

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

Bu, hesabın 15 QOR (15.000.000 uqor) bulundurduğunu gösterir.

## Ücret Yapısı

QoreChain üzerindeki işlem ücretleri, ağ teşviklerini uyumlu hale getirmek için beş hedefe dağıtılır:

| Hedef            | Pay | Amaç                                                              |
| ----------------- | --- | ------------------------------------------------------------------ |
| **Validator'lar** | %37 | Blok üretenleri ödüllendirir ve ağı güvence altına alır             |
| **Yakılan**       | %30 | Arzdan kalıcı olarak kaldırılır, deflasyonist baskı yaratır         |
| **Hazine**        | %20 | Protokol geliştirmesini ve ekosistem hibelerini finanse eder        |
| **Stake Edenler** | %10 | Tüm delegatörlere orantılı olarak dağıtılır                        |
| **Hafif Node'lar**| %3  | Ağ verisi sunan hafif node operatörlerini ödüllendirir              |

## Yakma Kanalları

QoreChain çok kanallı bir yakma (burn) mekanizması uygular. QOR token'ları 10 farklı kanal aracılığıyla dolaşımdan kalıcı olarak kaldırılır:

| Kanal                 | Açıklama                                                              |
| ---------------------- | ------------------------------------------------------------------- |
| `tx_fee`               | Her işlem ücretinin %30'luk yakma payı                                |
| `governance_penalty`   | Yönetişim önerileri yeter sayıya ulaşamadığında veya veto edildiğinde yakılır |
| `slashing_burn`        | Cezalandırılan (slash edilen) validator stake'lerinin yakılan kısmı  |
| `bridge_fee`           | Zincirler arası köprü transferlerinde yakılan ücret                  |
| `spam_deterrent`       | İşaretlenmiş spam işlemlere uygulanan ek yakma                       |
| `epoch_excess`         | Epoch sınırlarında hedefi aşan fazla emisyonların yakılması           |
| `manual_burn`          | Yönetişim önerisi yoluyla topluluk tarafından başlatılan token yakmaları |
| `contract_callback`    | Akıllı sözleşme callback yürütmelerinde yakılan ücretler              |
| `cross_vm_fee`         | VM'ler arası (örn. EVM'den CosmWasm'e) çağrılar yürütülürken yakılır  |
| `rollup_create`        | Yeni bir rollup dağıtılırken minimum stake'in %1'i yakılır             |

Tüm kanallardaki toplam yakılan tutarı sorgulayabilirsiniz:

```bash
qorechaind query bank total --denom uqor
```

## İpuçları

:::caution
Token göndermeden önce alıcı adreslerini her zaman iki kez kontrol edin. QoreChain üzerindeki işlemler geri alınamaz.
:::

:::tip

* Bir işlemi yayınlamadan simüle etmek için `--dry-run` bayrağını kullanın.
* Node'un işleminiz için gereken gas'ı tahmin etmesine izin vermek için `--gas auto` kullanın.
* Standart bir transfer için minimum ücret **500 uqor**'dur.

:::
