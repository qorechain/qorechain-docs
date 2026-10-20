---
slug: /user-guide/token-operations
title: Token İşlemleri
sidebar_label: Token İşlemleri
sidebar_position: 1
---

# Token İşlemleri

Bu kılavuz QOR token'ını, token gönderme ve alma işlemlerini, bakiye sorgulamayı ve QoreChain üzerindeki ücret dağıtım modelini ele alır.

:::note
Aşağıdaki komutlar **`qorechain-diana`** testnet'ini (EVM chain ID **9800**) kullanır. Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) 7 Haziran 2026'dan beri canlıdır ve **v3.2.3** sürümünü çalıştırır; testnet **v3.2.4** çalıştırır — mainnet üzerinde işlem yaparken **Mainnet'e Bağlanma** sayfasındaki mainnet chain ID ve endpoint'lerini kullanın.
:::

:::caution `tx pqc cosign` ile imzalayın
Mainnet ve testnet, her Cosmos hattı (lane) işleminde hibrit bir kuantum sonrası imza gerektirir; bu nedenle bu sayfadaki komutlar yazıldığı haliyle yayınlanmaz. Bir komuta `--generate-only > tx.json` ekleyin, ardından `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>` komutunu çalıştırın. Bkz. [Hibrit imzalama](/cli-reference/transaction-commands#hybrid-signing). [QoreX](/qorex/overview) ve [Dashboard](/dashboard/overview) bu imzalamayı sizin yerinize yapar.
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
  --gas 400000 --fees 40000uqor
```

**Örnek:** Başka bir adrese 5 QOR (5.000.000 uqor) gönderin:

```bash
qorechaind tx bank send qor1sender... qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Gönderen için ham adres yerine bir anahtar adı (key name) da kullanabilirsiniz:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
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
| **Yakılan**       | %30 | Arzdan kalıcı olarak kaldırılır                                     |
| **Hazine**        | %20 | Protokol geliştirmesini ve ekosistem hibelerini finanse eder        |
| **Stake Edenler** | %10 | Tüm delegatörlere orantılı olarak dağıtılır                        |
| **Hafif Node'lar**| %3  | Hafif node ödülleri (aşağıdaki nota bakın)                          |

Bu pay, ücret toplayıcıya (fee collector) giren her şeye uygulanır; ücret toplayıcı, işlem ücretlerini ve her epoch'ta basılan staking emisyonunu tutar. Hafif node payı, hafif node ödül havuzuna birikir; kayıt açıktır ve lisansa bağlıdır, ancak henüz hiçbir hafif node kayıt olmamıştır; bu nedenle şu anda hiçbir node bundan ödeme almamaktadır (bkz. [Hafif Node](/light-node/overview#reward-program-status)). v3.2.0 yükseltmesinden bu yana staker payı normal bir staking ödülü olarak ödenir (bkz. [Tokenomics](/architecture/tokenomics#stranded-and-reserve)).

## Yakma Kanalları

QoreChain'in yakma modülü 12 yakma kaynağı tanımlar. Bunlardan herhangi biri aracılığıyla yakılan QOR, dolaşımdan kalıcı olarak kaldırılır. Mainnet'te şimdiye kadar yalnızca gas ücreti ve başarısız işlem kanallarında yakma kaydedilmiştir; diğerleri tanımlıdır ancak hiçbir şey kaydetmemiştir. Testnet, isteğe bağlı zaman kilitli staking modülü için on üçüncü bir kaynak olan `staking_tier_penalty` kaydeder.

| Kanal              | Açıklama                                                                         |
| ------------------ | -------------------------------------------------------------------------------- |
| `gas_fee`          | Tüm gas ücretlerinin %30'u yakılır                                                |
| `contract_create`  | Sözleşme oluşturma başına sabit 100 QOR ücret yakılır (devre dışı: CosmWasm yüklemesi kapalı) |
| `ai_service`       | AI servis ücretlerinin %50'si yakılır (devre dışı: AI servis ücretleri canlı değil) |
| `bridge_fee`       | Köprü ücretlerinin %100'ü yakılır (devre dışı: köprü canlı değil)                 |
| `treasury_buyback` | Hazineden periyodik geri alım ve yakma                                            |
| `failed_tx`        | Başarısız işlemlerin gas'ının %10'u; zincir tarafından v3.2.2'den itibaren uygulanır |
| `xqore_penalty`    | Yakma yoluyla yönlendirilen xQORE erken çıkış cezaları (xQORE canlı değil)        |
| `auto_buyback`     | Protokol düzeyinde otomatik yakmalar (devre dışı)                                 |
| `tge`              | Ayrılmış; TGE yakması genesis'ten önce gerçekleşti ve bu kanal hiçbir şey kaydetmez |
| `rollup_create`    | Rollup oluşturma stake'inin %1'i yakılır                                          |
| `milestone`        | Sabit kümülatif işlem sayılarında planlanmış yakmalar (henüz hiçbiri tetiklenmedi) |
| `amm`              | AMM protokol ücretleri için ayrılmış (kayıtlı bir şey yok)                        |

Yakma modülünün CLI sorgusu yoktur; kaynak başına kümülatif yakmayı REST üzerinden okuyun:

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

Yanıt, `total_burned` ve `burns_by_source` değerlerini (uqor cinsinden) listeler. Güncel toplam arz `qorechaind query bank total-supply-of uqor` ile görülür.

## İpuçları

:::caution
Token göndermeden önce alıcı adreslerini her zaman iki kez kontrol edin. QoreChain üzerindeki işlemler geri alınamaz.
:::

:::tip

* Bir işlemi yayınlamadan simüle etmek için `--dry-run` bayrağını kullanın.
* `--gas` değerini açıkça ayarlayın (hibrit imzalı bir transfer için 400.000 yeterlidir).
* Ücret tabanı **gas birimi başına 0,1 uqor**'dur; dolayısıyla 400.000 gas limiti en az **40.000 uqor** gerektirir.

:::
