---
slug: /cli-reference/node-commands
title: Düğüm Komutları
sidebar_label: Düğüm Komutları
sidebar_position: 1
---

# Düğüm Komutları

Bir QoreChain düğümünü başlatmak, yapılandırmak ve işletmek için kullanılan `qorechaind` komutlarına yönelik referans.

:::note
QoreChain iki ağ çalıştırır: **`qorechain-vladi`** ana ağı (29 Haziran 2026'dan beri canlı; güncel düğüm sürümü **v3.2.1**) ve **`qorechain-diana`** test ağı (düğüm sürümü **v3.2.2**). Katılmak istediğiniz ağ için uygun `--chain-id` değerini geçirin — aşağıdaki örnekler test ağını hedefler; ana ağ için `--chain-id qorechain-vladi` kullanın. Her ağın güncel sürümü, [download.qore.host](https://download.qore.host) altındaki `latest.json` dosyasında listelenir.
:::

---

## init

Verilen takma ad (moniker) ile yeni bir düğüm başlatın.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| Bayrak        | Tür    | Açıklama                                        |
| ------------- | ------ | ---------------------------------------------- |
| `--chain-id`  | string | Zincir tanımlayıcısı (her zaman belirtin; belirtilmezse rastgele bir tanesi oluşturulur) |
| `--home`      | string | Düğüm ana dizini (varsayılan: `~/.qorechaind`) |
| `--overwrite` | bool   | Mevcut `genesis.json` dosyasının üzerine yaz   |
| `--recover`   | bool   | Yeni bir anahtar oluşturmak yerine mevcut bir anahtarı kurtarmak için tohum (seed) ifadesi girin |

`--home` altında `config/`, `data/` ve bir başlangıç `genesis.json` ile dizin yapısını oluşturur. Bir ağ düğümü için, başlatmadan önce bu `genesis.json` dosyasını ağın genesis dosyasıyla değiştirin ([Ana Ağa Bağlanma](/getting-started/connecting-to-mainnet) bölümüne bakın).

`init` ayrıca ağın EVM zincir kimliğini (`qorechain-vladi` için `9801`, `qorechain-diana` için `9800`) `app.toml` içindeki `evm-chain-id` ayarına yazar; bu nedenle doğru `--chain-id` değerini geçirin.

---

## start

Düğümü başlatın ve senkronize etmeye ya da blok üretmeye başlayın.

```bash
qorechaind start [flags]
```

| Bayrak                 | Tür    | Açıklama                                              |
| ---------------------- | ------ | ---------------------------------------------------- |
| `--home`               | string | Düğüm ana dizini                                     |
| `--minimum-gas-prices` | string | Bu düğümün kabul ettiği minimum gaz fiyatı. Ağ tabanı `0.1uqor`'dur; en az bu değeri ayarlayın |
| `--pruning`            | string | Budama stratejisi: `default`, `nothing`, `everything` |
| `--halt-height`        | uint   | Düğümü bu blok yüksekliğinde durdur                  |
| `--halt-time`          | uint   | Düğümü bu Unix zaman damgasında durdur               |
| `--log_level`          | string | Günlük ayrıntı düzeyi: `info`, `debug`, `warn`, `error` |
| `--trace`              | bool   | Hatalarda tam yığın izini (stack trace) etkinleştir  |

---

## version

`qorechaind` ikili dosyasının sürümünü ve derleme bilgilerini yazdırın.

```bash
qorechaind version
```

Go sürümü, commit karması ve derleme etiketleri dahil genişletilmiş derleme ayrıntıları için `--long` kullanın:

```bash
qorechaind version --long
```

---

## status

Çalışan düğümü; senkronizasyon durumu, en son blok yüksekliği ve uzlaşma bilgileri dahil olmak üzere mevcut durumu için sorgulayın.

```bash
qorechaind status
```

| Bayrak   | Tür    | Açıklama                                        |
| -------- | ------ | ----------------------------------------------- |
| `--node` | string | RPC uç noktası (varsayılan: `tcp://localhost:26657`) |

`node_info`, `sync_info` ve `validator_info` bölümleriyle JSON döndürür.

---

## client configuration

`config` alt komutu yoktur. İstemci varsayılanları (`chain-id`, `keyring-backend`, `output`, `node`) `<home>/config/client.toml` dosyasından okunur; bu dosyayı düzenleyin veya her komutta bayrağı geçirin (`--chain-id`, `--keyring-backend`, `--output`, `--node`).

---

## keys

İşlemleri imzalamak için yerel anahtarlığı (keyring) yönetin.

### Yeni Bir Anahtar Ekleme

```bash
qorechaind keys add <name> [flags]
```

| Bayrak                 | Tür    | Açıklama                                        |
| ---------------------- | ------ | ----------------------------------------------- |
| `--keyring-backend`    | string | Arka uç: `os`, `file`, `kwallet`, `pass`, `test`, `memory` |
| `--key-type`           | string | Anahtar algoritması: `secp256k1` (varsayılan) veya `eth_secp256k1` |
| `--coin-type`          | uint32 | HD coin türü (varsayılan `118`)                 |
| `--recover`            | bool   | Anahtarı anımsatıcıdan (mnemonic) kurtar        |
| `--multisig`           | string | Çoklu imza için virgülle ayrılmış anahtar listesi |
| `--multisig-threshold` | uint   | Gereken minimum imza sayısı                      |

### Tüm Anahtarları Listeleme

```bash
qorechaind keys list --keyring-backend <backend>
```

### Anahtar Ayrıntılarını Gösterme

```bash
qorechaind keys show <name> [flags]
```

| Bayrak      | Tür    | Açıklama                            |
| ----------- | ------ | ----------------------------------- |
| `--bech`    | string | Çıktı formatı: `acc`, `val`, `cons` |
| `--address` | bool   | Yalnızca adresi göster              |
| `--pubkey`  | bool   | Yalnızca açık anahtarı göster       |

### Bir Anahtarı Silme

```bash
qorechaind keys delete <name> --keyring-backend <backend>
```

### Bir Anahtarı Dışa Aktarma (Zırh-Şifreli)

```bash
qorechaind keys export <name>
```

### Bir Anahtarı İçe Aktarma

```bash
qorechaind keys import <name> <keyfile>
```

---

## genesis

Genesis dosyasını yönetin.

### Bir Genesis Hesabı Ekleme

```bash
qorechaind genesis add-genesis-account <address> <coins> [flags]
```

| Bayrak               | Tür    | Açıklama                          |
| -------------------- | ------ | --------------------------------- |
| `--vesting-amount`   | string | Hak ediş (vesting) miktarı        |
| `--vesting-start-time` | int  | Hak ediş başlangıç zamanı (Unix zaman damgası) |
| `--vesting-end-time` | int    | Hak ediş bitiş zamanı (Unix zaman damgası) |

### Bir Genesis İşlemi Oluşturma

```bash
qorechaind genesis gentx <key-name> <stake-amount> [flags]
```

| Bayrak                  | Tür    | Açıklama                |
| ----------------------- | ------ | ----------------------- |
| `--chain-id`            | string | Zincir tanımlayıcısı    |
| `--moniker`             | string | Doğrulayıcı takma adı   |
| `--commission-rate`     | string | Başlangıç komisyon oranı |
| `--commission-max-rate` | string | Maksimum komisyon oranı |

### Genesis İşlemlerini Toplama

```bash
qorechaind genesis collect-gentxs
```

Diğer `genesis` alt komutları: `bulk-add-genesis-account` ve `migrate`.

### Genesis Dosyasını Doğrulama

```bash
qorechaind genesis validate
```

---

## Uzlaşma Motoru

Bu alt komutlar, QoreChain Uzlaşma Motoru katmanıyla etkileşime girer.

### Doğrulayıcı Anahtarını Gösterme

```bash
qorechaind comet show-validator
```

Uzlaşma açık anahtarını JSON formatında verir. Doğrulayıcı kimliğini doğrulamak için kullanılır.

### Düğüm Kimliğini Gösterme

```bash
qorechaind comet show-node-id
```

P2P düğüm tanımlayıcısını (onaltılık kodlanmış) verir. Kalıcı eş (peer) yapılandırması için kullanılır.

---

## export

Mevcut zincir durumunu JSON genesis dosyası olarak dışa aktarın. Zincir yükseltmeleri veya anlık görüntüler için kullanışlıdır.

```bash
qorechaind export [flags]
```

| Bayrak              | Tür    | Açıklama                                   |
| ------------------- | ------ | ----------------------------------------- |
| `--for-zero-height` | bool   | Yükseklik 0'da yeniden başlatma için dışa aktarmayı hazırla |
| `--height`          | int    | Durumu belirli bir blok yüksekliğinde dışa aktar |
| `--home`            | string | Düğüm ana dizini                          |
| `--output-document` | string | Dışa aktarımı STDOUT yerine bu dosyaya yaz |
| `--modules-to-export` | strings | Dışa aktarılacak modüllerin virgülle ayrılmış listesi (varsayılan: tümü) |
| `--jail-allowed-addrs` | strings | Hapisten çıkarılacak hapisteki doğrulayıcıların operatör adresleri |

---

## rollback

Zincir durumunu bir blok geri alın. Bir uzlaşma hatasından kurtulmak için kullanışlıdır.

```bash
qorechaind rollback [flags]
```

| Bayrak   | Tür    | Açıklama                                            |
| -------- | ------ | -------------------------------------------------- |
| `--hard` | bool   | Son bloğu blok deposundan da kaldır                |
| `--home` | string | Düğüm ana dizini                                   |

Bu komut hem uygulama durumunu hem de uzlaşma durumunu geri alır. Geri alınamayacağı için dikkatli kullanın.
