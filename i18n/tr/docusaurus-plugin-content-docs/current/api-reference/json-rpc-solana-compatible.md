---
slug: /api-reference/json-rpc-solana-compatible
title: JSON-RPC — Solana Uyumlu
sidebar_label: JSON-RPC — Solana Uyumlu
sidebar_position: 4
---

# JSON-RPC — Solana Uyumlu

QoreChain, SVM (Solana Virtual Machine) çalışma zamanı üzerinden Solana ile uyumlu bir JSON-RPC arayüzü sunar ve mevcut Solana araçlarının ve SDK'larının QoreChain ile doğrudan etkileşime girmesini sağlar.

:::caution SVM işlem gönderimi şu anda devre dışı
Zincir sürümü v3.1.89 (22 Ağustos) itibarıyla, yaşanan bir olayın ardından SVM yürütme hattı **ağ genelinde işlem gönderimi için devre dışı bırakılmıştır** — herhangi bir işlem `code 11, "SVM module is disabled"` hatası döndürür. Bu durum yalnızca genel salt okunur uç noktalarda değil, ağ genelinde geçerlidir. Aşağıdaki tablodaki okuma tipi yöntemler (örn. `getBalance`, `getAccountInfo`) yanıt vermeye devam edebilir, ancak hat yeniden açılana kadar SVM işlemi gönderen canlı bir entegrasyon denemeyin.
:::

## Bağlantı

| Aktarım | Adres |
| --------- | ------------------------- |
| HTTP (kendi düğümünüz) | `http://127.0.0.1:8899`   |
| HTTPS (genel, mainnet, salt okunur) | `https://svm.qore.host` |
| HTTPS (genel, testnet, salt okunur) | `https://svm-testnet.qore.host` |

JSON-RPC sunucusu **`qorechaind start` tarafından başlatılır** ve **varsayılan olarak etkindir**, `127.0.0.1:8899` üzerinde dinler. `app.toml` içindeki bir `[svm-rpc]` bölümü (`enable` + `address`) üzerinden yapılandırılır. Yeni başlatılan bir düğüm bu arayüzü zaten sunar — ek bir süreç gerekmez. Genel uç noktalar **salt okunurdur** (işlem gönderimi uçta devre dışı bırakılmıştır).

:::note
Zincir sürümü **v3.1.82** itibarıyla, SVM arayüzü hesabın **yerel QOR bakiyesini** — Cosmos ve EVM arayüzlerinde görülenle aynı birleşik fonları — **lamport** cinsinden (9 ondalık; **1 uqor = 1,000 lamport**) sunar. Bkz. [SVM Arayüzünde Yerel QOR](/developer-guide/svm-development#native-qor).
:::

---

## Yöntemler

| Yöntem                              | Parametreler               | Açıklama                                                    |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `getAccountInfo`                    | `pubkey` (base58 dizesi) | Hesap verisini, sahibini, lamport miktarını ve çalıştırılabilir bayrağını döndürür     |
| `getBalance`                        | `pubkey` (base58 dizesi) | Verilen genel anahtar için lamport cinsinden yerel QOR bakiyesini döndürür |
| `getSignaturesForAddress`           | `address` (base58 dizesi) | Adresi ilgilendiren işlem imzalarını döndürür (para yatırma tespiti) |
| `getSlot`                           | yok                     | Geçerli slot numarasını döndürür                                |
| `getMinimumBalanceForRentExemption` | `dataLength` (tam sayı)   | Verilen veri boyutu için kira muafiyeti gerektiren minimum bakiyeyi döndürür |
| `getVersion`                        | yok                     | Düğüm yazılımı sürümünü döndürür                              |
| `getHealth`                         | yok                     | Düğüm sağlık durumunu döndürür (sağlıklıysa `"ok"`)                 |

---

## Yanıt Biçimi

Tüm yanıtlar JSON-RPC 2.0 spesifikasyonunu izler. Zincir üzerindeki duruma referans veren yanıtlar, geçerli `slot` bilgisini içeren bir `context` nesnesi içerir:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": { ... }
  }
}
```

---

## Örnekler

### getAccountInfo

**İstek:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getAccountInfo",
    "params": [
      "4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T",
      { "encoding": "base64" }
    ],
    "id": 1
  }'
```

**Yanıt:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": {
      "data": ["AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", "base64"],
      "executable": false,
      "lamports": 1000000000,
      "owner": "11111111111111111111111111111111",
      "rentEpoch": 0
    }
  }
}
```

### getBalance

**İstek:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T"],
    "id": 2
  }'
```

**Yanıt:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": 1000000000
  }
}
```

### getVersion

**İstek:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getVersion",
    "params": [],
    "id": 3
  }'
```

**Yanıt:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "solana-core": "1.18.0-qorechain",
    "feature-set": 1
  }
}
```

`1.18.0-qorechain` sürüm dizesi, QoreChain SVM çalışma zamanı üzerinde çalışan Solana 1.18.0 RPC arayüzüyle uyumluluğu gösterir.

---

## @solana/web3.js Entegrasyonu

Mevcut Solana uygulamaları, `Connection` nesnesini yerel SVM uç noktasına yönlendirerek QoreChain'e bağlanabilir:

```javascript
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection("http://127.0.0.1:8899", "confirmed");

// Check version
const version = await connection.getVersion();
console.log("Node version:", version["solana-core"]);

// Get balance
const pubkey = new PublicKey("4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T");
const balance = await connection.getBalance(pubkey);
console.log("Balance:", balance / LAMPORTS_PER_SOL);

// Get slot
const slot = await connection.getSlot();
console.log("Current slot:", slot);

// Get account info
const accountInfo = await connection.getAccountInfo(pubkey);
if (accountInfo) {
  console.log("Owner:", accountInfo.owner.toBase58());
  console.log("Executable:", accountInfo.executable);
  console.log("Data length:", accountInfo.data.length);
}
```

---

## Notlar

- **Adres biçimi**: SVM hesapları, yerel Cosmos SDK modüllerinin kullandığı `qor1` Bech32 önekinin aksine, base58 kodlu genel anahtarlar (standart Solana biçimi) kullanır.
- **VM'ler Arası Köprüleme**: Varlıkları EVM ve SVM çalışma zamanları arasında taşımak için VM'ler Arası modülünü (`x/crossvm`) kullanın. `crossvm call` sözdizimi için [İşlem Komutları](/cli-reference/transaction-commands) sayfasına bakın.
- **Program dağıtımı**: BPF programlarını CLI üzerinden (`qorechaind tx svm deploy-program`) veya programatik olarak SVM çalışma zamanı aracılığıyla dağıtın.
- **Hesaplama bütçesi**: SVM çalışma zamanı, varsayılan olarak işlem başına 1,400,000 hesaplama birimlik bir hesaplama bütçesi uygular. Bu, modül parametreleri aracılığıyla yapılandırılabilir.
