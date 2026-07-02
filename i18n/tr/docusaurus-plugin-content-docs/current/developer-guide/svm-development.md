---
slug: /developer-guide/svm-development
title: SVM Geliştirme
sidebar_label: SVM Geliştirme
sidebar_position: 4
---

# SVM Geliştirme

QoreChain, geliştiricilerin tanıdık Solana araçlarını kullanarak SBF/BPF programları dağıtmasına ve çalıştırmasına olanak tanıyan bir **Solana Virtual Machine (SVM)** yürütme ortamı içerir. SVM modülü, `qorechaind start` komutunun otomatik olarak başlattığı, **8899 portu** üzerinde Solana uyumlu bir JSON-RPC arayüzü sunar (aşağıdaki [JSON-RPC Sunucusu](#json-rpc-server) bölümüne bakın).

:::note
Aşağıdaki komutlar, 7 Haziran 2026'dan bu yana canlı olan ve **v3.1.82** zincir sürümünü çalıştıran **`qorechain-vladi`** ana ağını (mainnet) kullanır. Test ağı (testnet) için `--chain-id qorechain-diana` kullanın.
:::

---

## Genel Bakış

`x/svm` modülü şunları sağlar:

* **Birinci sınıf bir SVM varlığı olarak yerel QOR** — hesabın birleşik bakiyesi, lamports cinsinden görülebilir
* SBF/BPF program dağıtımı ve yürütmesi
* Veri hesabı oluşturma ve yönetimi
* Solana uyumlu bir JSON-RPC uç noktası
* QoreChain ve Solana adres biçimleri arasında çift yönlü adres eşlemesi
* Hesaplama bütçesi ölçümü ve kira (rent) tabanlı depolama ekonomisi

---

## SVM Arayüzünde Yerel QOR {#native-qor}

**v3.1.82** zincir sürümünden itibaren SVM arayüzü, ayrı bir sandbox bakiyesi değil, **birinci sınıf bir yerel QOR arayüzüdür**. Hesabın tek birleşik bakiyesi — Cosmos arayüzünde `uqor` olarak, EVM'de 18 ondalıklı wei olarak görülen aynı fonlar — SVM tarafında **lamports** (9 ondalık) cinsinden görünür:

```
1 uqor = 1,000 lamports    ·    1 QOR = 1,000,000,000 lamports
```

* **`getBalance` / `getAccountInfo`** hesabın yerel QOR bakiyesini (lamports cinsinden) döndürür.
* **`getSignaturesForAddress`** bir adrese dokunan işlem geçmişini döndürür — standart Solana araçlarıyla para yatırma (deposit) tespiti için kullanılabilir.
* **System Program transferleri yerel QOR taşır** — Solana tarzı bir transfer talimatı, bir Cosmos `MsgSend` veya bir EVM transferinin taşıyacağı aynı fonları taşır.
* **SVM adres biçimi** — bir hesabın SVM adresi, hesabın 20 baytının sağdan 32 bayta doldurulup base58 ile kodlanmış halidir. Üç adres biçiminin tümü (`qor1...`, `0x...`, base58) aynı hesaba işaret eder.

Genel uç noktalar (`https://svm.qore.host`, `https://svm-testnet.qore.host`) **salt okunurdur** — işlem gönderimi uç noktada (edge) devre dışıdır. SVM işlemleri göndermek için kendi düğümünüzü (port 8899) çalıştırın.

---

## JSON-RPC Sunucusu {#json-rpc-server}

Solana uyumlu JSON-RPC sunucusu **`qorechaind start` tarafından başlatılır** ve **varsayılan olarak etkindir**. `app.toml` dosyasındaki bir `[svm-rpc]` bölümü aracılığıyla yapılandırılır:

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

Varsayılan değerler `enable = true` ve `address = "127.0.0.1:8899"` olduğundan, yeni başlatılmış bir düğüm Solana JSON-RPC arayüzünü 8899 portunda zaten sunar — `@solana/web3.js` ek bir kurulum gerekmeden `http://127.0.0.1:8899` adresine bağlanır. `getVersion`, `1.18.0-qorechain` değerini bildirir; `getBalance` / `getAccountInfo` ise zincir üzerindeki canlı SVM hesaplarını döndürür.

| Özellik        | Değer                      |
| -------------- | -------------------------- |
| Varsayılan URL | `http://127.0.0.1:8899`    |
| Etkin          | Evet, varsayılan olarak    |
| Başlatan       | `qorechaind start`         |
| Uyumluluk      | Solana JSON-RPC (alt küme) |
| `getVersion`   | `1.18.0-qorechain`         |

### Desteklenen Metodlar

| Metod                               | Açıklama                                             |
| ----------------------------------- | ---------------------------------------------------- |
| `getAccountInfo`                    | Hesap verilerini ve lamport bakiyesini alır          |
| `getBalance`                        | Hesap bakiyesini lamports cinsinden alır (yerel QOR) |
| `getSignaturesForAddress`           | Bir adres için işlem geçmişi                         |
| `getSlot`                           | Geçerli slot numarası                                |
| `getMinimumBalanceForRentExemption` | Belirli bir veri boyutu için minimum bakiye          |
| `getVersion`                        | SVM çalışma zamanı sürüm bilgisi                     |
| `getHealth`                         | SVM uç noktası için sağlık kontrolü                  |

---

## Program Dağıtma ve Programlarla Etkileşim

:::info
**Modern SBF yürütmesi.** SVM yürütme motoru **solana-sbpf 0.21.1** üzerine modernize edilmiştir; bu nedenle güncel Solana araç zinciriyle (**platform-tools v1.53 / agave 4.x**) yeni derlenmiş SBF programları QoreChain üzerinde hem **dağıtılır hem de çalışır** — yürütme tam olarak desteklenir, yalnızca dağıtımla sınırlı değildir. Hem `cargo build-sbf --arch v0` hem de `--arch v3` ile derlenen programlar desteklenir.
:::

1. **Bir SBF Programı Dağıtın** — Solana programınızı güncel platform-tools (v1.53 / agave 4.x) ile bir SBF paylaşımlı nesnesine derleyin, ardından QoreChain'e dağıtın:

   ```bash
   # Build with the current Solana toolchain (--arch v0 or --arch v3)
   cargo build-sbf --arch v3

   # Deploy the compiled program
   qorechaind tx svm deploy-program ./my_program.so \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   İşlem yanıtı, base58 biçimindeki **program kimliğini (program ID)** içerir.

2. **Bir Talimat Çalıştırın** — Zincir üzerindeki bir BPF programını talimat verisiyle çağırın:

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parametre           | Biçim             | Açıklama                       |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | Base58 dizesi     | Dağıtılan programın adresi     |
   | `data-hex`          | Hex kodlu baytlar | Serileştirilmiş talimat verisi |

3. **Bir Veri Hesabı Oluşturun** — Programların durum saklamak için genellikle hesaplara ihtiyacı vardır. Belirtilen boyut ve sahiple bir hesap oluşturun:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parametre      | Açıklama                                                      |
   | -------------- | ------------------------------------------------------------- |
   | `owner-base58` | Bu hesabın sahibi olan program (base58)                       |
   | `space`        | Veri alanının bayt cinsinden boyutu                           |
   | `lamports`     | Başlangıç bakiyesi (kira muafiyeti minimumunu karşılamalıdır) |

   Belirli bir boyut için minimum kira muafiyeti bakiyesini sorgulayın:

   ```bash
   # RPC: getMinimumBalanceForRentExemption
   curl -X POST http://localhost:8899 \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "getMinimumBalanceForRentExemption",
       "params": [1024]
     }'
   ```

4. **@solana/web3.js Kullanımı** — Solana JavaScript SDK'sı, QoreChain SVM uç noktasıyla doğrudan çalışır:

   ```javascript
   import { Connection, PublicKey } from "@solana/web3.js";

   const connection = new Connection("http://127.0.0.1:8899");

   // Check health
   const health = await connection.getHealth();
   console.log("SVM health:", health);

   // Get slot
   const slot = await connection.getSlot();
   console.log("Current slot:", slot);

   // Get account info
   const pubkey = new PublicKey("YourBase58ProgramId...");
   const accountInfo = await connection.getAccountInfo(pubkey);
   console.log("Account data:", accountInfo);

   // Get balance
   const balance = await connection.getBalance(pubkey);
   console.log("Balance (lamports):", balance);
   ```

---

## Adres Eşlemesi

QoreChain, yerel Bech32 adresleri (`qor1...`) ile Solana tarzı base58 adresleri arasında **çift yönlü bir adres eşlemesi** tutar:

| Yön            | Örnek                                                           |
| -------------- | --------------------------------------------------------------- |
| Yerelden SVM'e | `qor1abc...xyz`, deterministik bir base58 adresine eşlenir      |
| SVM'den Yerele | Base58 program adresleri, `qor1...` karşılıklarına geri eşlenir |

Eşleme deterministiktir ve `x/svm` modülü tarafından yönetilir. Her iki gösterim de aynı temel hesaba işaret eder.

---

## Kira Modeli

SVM modülü, durum şişmesini (state bloat) önlemek için **kira tabanlı bir depolama modeli** kullanır:

| Parametre                   | Değer     |
| --------------------------- | --------- |
| Bayt başına yıllık lamports | `3,480`   |
| Kira muafiyeti çarpanı      | `2.0`     |
| Tahsilat sıklığı            | Her epoch |

* Bakiyesi lamports cinsinden `2 * (data_size * 3480 / seconds_per_year)` değerinin **üzerinde** olan hesaplar **kiradan muaftır** ve asla ücretlendirilmez.
* Kira muafiyeti eşiğinin **altındaki** hesaplardan her epoch'ta kira tahsil edilir. Bakiye sıfıra ulaşırsa hesap silinir.

:::info
**En iyi uygulama:** Beklenmedik hesap silinmesini önlemek için veri hesaplarını her zaman kira muafiyeti minimumunun üzerinde fonlayın.
:::

---

## Hesaplama Bütçesi

Her talimat yürütmesi hesaplama birimleriyle (compute units) ölçülür:

| Parametre                                       | Değer       |
| ----------------------------------------------- | ----------- |
| Talimat başına maksimum hesaplama birimi        | `1,400,000` |
| Maksimum CPI (programlar arası çağrı) derinliği | `4`         |
| Maksimum program boyutu                         | `10 MB`     |
| Maksimum hesap verisi boyutu                    | `10 MB`     |

Hesaplama bütçesini aşan programlar durdurulur ve işlem geri alınır.

---

## Parametre Özeti

| Parametre                   | Değer        |
| --------------------------- | ------------ |
| `max_program_size`          | 10 MB        |
| `max_account_data_size`     | 10 MB        |
| `compute_budget_max`        | 1,400,000 CU |
| `max_cpi_depth`             | 4            |
| `lamports_per_byte_year`    | 3,480        |
| `rent_exemption_multiplier` | 2.0          |
| JSON-RPC portu              | 8899         |

---

## VM'ler Arası Birlikte Çalışabilirlik

SVM programları, **asenkron** VM'ler arası mesaj yolu üzerinden EVM ve CosmWasm sözleşmeleriyle iletişim kurabilir:

```bash
# Cross-VM call example
qorechaind tx crossvm call \
  --source-vm svm \
  --target-vm evm \
  --target-contract 0x1234...abcd \
  --payload '...' \
  --from mykey \
  -y
```

Mesajlar kuyruğa alınır ve EndBlocker tarafından işlenir. Mesaj yaşam döngüsü ve zaman aşımı davranışıyla ilgili ayrıntılar için [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability) sayfasına bakın.

---

## Sonraki Adımlar

* [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability) — SVM, EVM ve CosmWasm arasında iletişim
* [EVM Geliştirme](/developer-guide/evm-development) — QoreChain üzerinde Solidity akıllı sözleşmeleri
* [CosmWasm Geliştirme](/developer-guide/cosmwasm-development) — Rust tabanlı WebAssembly sözleşmeleri
