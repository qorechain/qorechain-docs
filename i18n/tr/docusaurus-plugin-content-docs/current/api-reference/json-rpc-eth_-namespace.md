---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — eth_ Ad Alanı
sidebar_label: JSON-RPC — eth_ Ad Alanı
sidebar_position: 3
---

# JSON-RPC — eth_ Ad Alanı

QoreChain, EVM uyumlu bir JSON-RPC arayüzü uygular; böylece standart Ethereum araçları (MetaMask, Hardhat, Foundry, ethers.js, web3.js) zincir durumunu okuyabilir ve gazı hiçbir değişiklik yapmadan tahmin edebilir. **EVM şeridinden işlem göndermek için** zincir sürümü v3.2.0'dan itibaren **fazladan bir adım gerekir**: gönderen hesabın kayıtlı bir kuantum sonrası anahtarı ve açık bir EVM yetkilendirme penceresi olmalıdır ([İşlem gönderme](#sending-transactions) bölümüne bakın).

## Bağlantı

| Taşıma    | Varsayılan Adres        |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

:::note
EVM JSON-RPC arayüzü, **`qorechain-vladi`** ana ağı (EVM zincir kimliği **9801**, onaltılık `0x2649`, düğüm sürümü **v3.2.5**, 3.906.833 numaralı yükseklikte 29 Ekim 2026'dan beri, 7 Haziran 2026'dan beri canlı) ve **`qorechain-diana`** test ağı (EVM zincir kimliği **9800**, onaltılık `0x2648`, düğüm sürümü **v3.2.6**, 27 Ekim 2026'dan beri) tarafından sunulur. Yukarıdaki yerel adresler kendi çalıştırdığınız bir düğüm için geçerlidir. Genel HTTP uç noktaları `https://evm.qore.host` (ana ağ) ve `https://evm-testnet.qore.host` (test ağı) olup [Ağlar](/appendix/networks#public-endpoints) sayfasında listelenmiştir. Tek genel EVM WebSocket'i test ağınındır (`wss://evm-ws-testnet.qore.host`); genel bir ana ağ EVM WebSocket'i yoktur.
:::

## Desteklenen Ad Alanları

| Ad Alanı  | Açıklama                                                                                                       |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `eth_`    | Temel Ethereum JSON-RPC yöntemleri                                                                             |
| `web3_`   | Yardımcı yöntemler (istemci sürümü, hashleme)                                                                  |
| `net_`    | Ağ durumu yöntemleri                                                                                           |
| `txpool_` | İşlem havuzu incelemesi                                                                                        |
| `rpc_`    | Sunucu iç gözlemi (`rpc_modules`)                                                                              |

## eth_ Yöntemleri

| Yöntem                      | Parametreler                                     | Açıklama                                             |
| --------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `eth_blockNumber`           | yok                                              | En son blok numarasını döndürür                      |
| `eth_getBalance`            | `address`, `blockNumber`                         | Bir adresin bakiyesini wei cinsinden döndürür        |
| `eth_getTransactionCount`   | `address`, `blockNumber`                         | Bir adres için nonce'u (işlem sayısını) döndürür     |
| `eth_sendRawTransaction`    | `signedTxData`                                   | İmzalanmış bir işlemi yayın için gönderir            |
| `eth_call`                  | `callObject`, `blockNumber`                      | EVM'e karşı salt okunur bir çağrı yürütür            |
| `eth_estimateGas`           | `callObject`                                     | Bir işlem için gereken gazı tahmin eder              |
| `eth_getBlockByNumber`      | `blockNumber`, `fullTx` (bool)                   | Numaraya göre blok verisini döndürür                 |
| `eth_getTransactionByHash`  | `txHash`                                         | Hash'e göre işlem verisini döndürür                  |
| `eth_getTransactionReceipt` | `txHash`                                         | Madenciliği yapılmış bir işlem için makbuzu döndürür |
| `eth_getLogs`               | `filterObject`                                   | Bir filtreyle eşleşen günlükleri döndürür            |
| `eth_chainId`               | yok                                              | Zincir kimliğini döndürür (onaltılık kodlanmış)      |
| `eth_gasPrice`              | yok                                              | Geçerli gaz fiyatını wei cinsinden döndürür          |
| `eth_feeHistory`            | `blockCount`, `newestBlock`, `rewardPercentiles` | Geçmiş ücret verilerini döndürür (EIP-1559)          |
| `eth_getBlockByHash`        | `blockHash`, `fullTx` (bool)                     | Hash'e göre blok verisini döndürür                   |
| `eth_getCode`               | `address`, `blockNumber`                         | Kontrat bytecode'unu döndürür                        |
| `eth_getStorageAt`          | `address`, `slot`, `blockNumber`                 | Bir depolama yuvasını döndürür                       |
| `eth_getBlockReceipts`      | `blockNumber`                                    | Bir bloktaki tüm makbuzları döndürür                 |
| `eth_getProof`              | `address`, `storageKeys`, `blockNumber`          | Bir hesap kanıtı döndürür                            |
| `eth_createAccessList`      | `callObject`, `blockNumber`                      | Bir çağrı için erişim listesi oluşturur              |
| `eth_maxPriorityFeePerGas`  | yok                                              | Önerilen öncelik ücretini döndürür (wei)             |
| `eth_syncing`               | yok                                              | Düğüm senkronize olduğunda `false` döndürür          |
| `eth_newFilter`, `eth_newBlockFilter`, `eth_getFilterChanges` | filtre nesnesi / filtre kimliği | Yoklama (polling) filtreleri                 |

## web3_ Yöntemleri

| Yöntem               | Parametreler | Açıklama                                 |
| -------------------- | ------------ | ---------------------------------------- |
| `web3_clientVersion` | yok          | İstemci sürüm dizesini döndürür          |
| `web3_sha3`          | `data` (hex) | Girdinin Keccak-256 hash'ini döndürür    |

## txpool_ Yöntemleri

| Yöntem           | Parametreler | Açıklama                                                                   |
| ---------------- | ------------ | -------------------------------------------------------------------------- |
| `txpool_status`  | yok          | Bekleyen ve kuyruktaki işlemlerin sayısını döndürür                        |
| `txpool_content` | yok          | Bekleyen ve kuyruktaki işlemleri döndürür (genel uç noktalarda yok)        |
| `txpool_inspect` | yok          | Havuzun özetini döndürür (genel uç noktalarda yok)                         |

## net_ Yöntemleri

| Yöntem          | Parametreler | Açıklama                                    |
| --------------- | ------------ | ------------------------------------------- |
| `net_version`   | yok          | Ağ kimliğini döndürür                       |
| `net_listening` | yok          | Düğüm dinliyorsa `true` döndürür            |
| `net_peerCount` | yok          | Bağlı eş sayısını döndürür (onaltılık)      |

## Yapılandırma

JSON-RPC sunucusunu `app.toml` içinde etkinleştirin ve yapılandırın:

```toml
[json-rpc]
# Enable the JSON-RPC server
enable = true

# HTTP server address
address = "0.0.0.0:8545"

# WebSocket server address
ws-address = "0.0.0.0:8546"

# Enabled API namespaces (a node initialised by v3.2.3 or later defaults to "eth,net,web3";
# txpool is opt-in because it publishes the node's pending transactions)
api = "eth,web3,net,txpool"

# Maximum number of logs returned by eth_getLogs
filter-cap = 10000

# Maximum gas for eth_call and eth_estimateGas
gas-cap = 25000000

# EVM execution timeout
evm-timeout = "5s"

# Transaction fee cap (in QOR)
txfee-cap = 1

# Maximum open WebSocket connections
max-open-connections = 0
```

## Genel uç noktalardaki sınırlar {#public-limits}

:::note
- `eth_getLogs`, `fromBlock` ile `toBlock` arasında en fazla **10.000 blok** kabul eder. Daha geniş bir aralık `{"code":-32000,"message":"maximum [from, to] blocks distance: 10000"}` döndürür. Sorguları 10.000 blok veya daha küçük pencereler halinde yapın. Ayrı `filter-cap` ayarı, döndürülen günlük sayısını sınırlar.
- `txpool_status`, genel uç noktalarda çalışır. `txpool_content` ve `txpool_inspect`, hem genel ana ağ hem de genel test ağı uç noktasında devre dışıdır (kendi çalıştırdığınız ve `api` listesinde `txpool` bulunan bir düğümde çalışırlar).
- `debug_*` yöntemleri ve `eth_signTransaction` kullanılamaz.
- `eth_subscribe` bir WebSocket bağlantısı gerektirir. HTTP üzerinden `-32601 notifications not supported` döndürür. Bkz. [WebSocket Olayları](/api-reference/websocket-events).
- Genel uç noktalarda eski yüksekliklerdeki durum budanmıştır (pruned); bu nedenle uzak bir geçmiş bloğa karşı `eth_call`, durum sürümü hatasıyla başarısız olabilir.
- Bir betik `403 Forbidden` alırsa açık bir `User-Agent` başlığı ayarlayın; Python'un varsayılan `urllib` ajanı engellenir, `requests`, `curl`, Node ve Go istemcileri olduğu gibi çalışır.
:::

## İşlem gönderme {#sending-transactions}

:::caution EVM şeridi bir PQC anahtarı ve açık bir pencere gerektirir
Zincir sürümü v3.2.0'dan itibaren EVM şeridi, bir işlemi (`MsgEthereumTx`, kontrat dağıtımları dahil) yalnızca **kayıtlı bir kuantum sonrası anahtarı** ve **açık bir EVM yetkilendirme penceresi** olan bir hesaptan kabul eder. Bu kurulumu yapmamış sıradan bir EVM cüzdanı işlem gönderemez: düğüm, işlemleri dahil etmek yerine bir `pqc` modülü hatasıyla (kod 26, 27 veya 28) reddeder. Bakiyeleri okumak, `eth_call` çağırmak ve gazı tahmin etmek için pencere gerekmez. v3.2.2'den itibaren **zincir kimliği olmadan** imzalanmış bir işlem (EIP-155 öncesi) de reddedilir; v3.2.3'ten itibaren bir pencere yalnızca düz QOR transferleriyle (`native_only`) veya listelenmiş alıcılarla (`allowed_targets`) sınırlandırılabilir; kapsam dışındaki bir işlem kod 27 ile reddedilir.

Göndermeden önce bir hesabı kontrol edin:

- `GET /qorechain/pqc/v1/account/{address}` (`found: true` bir anahtarın kayıtlı olduğu anlamına gelir)
- `GET /qorechain/pqc/v1/evm_window/{address}` (`live: true` şu anda bir pencerenin işlemleri kabul ettiği anlamına gelir)

Her ikisi de [REST / gRPC Uç Noktaları](/api-reference/rest-grpc-endpoints#pqc-module) sayfasında açıklanmıştır (pencere yanıtı ayrıca `native_only` ve `allowed_targets` alanlarını da bildirir). Pencere, bir Ethereum işlemiyle değil, bir QoreChain işlemiyle (`MsgOpenEVMWindow`; en fazla 17.280 blok ve 1.000 işlemle ve bir değer sınırıyla sınırlıdır) açılır. Şerit genel bakışı için [EVM Geliştirme](/developer-guide/evm-development) sayfasına bakın.
:::

## Örnekler

### eth_blockNumber

İstek:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }'
```

Yanıt:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x37f559"
}
```

### eth_chainId

İstek:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_chainId",
    "params": [],
    "id": 2
  }'
```

Yanıt (ana ağ `qorechain-vladi`, zincir kimliği 9801):

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": "0x2649"
}
```

`qorechain-diana` test ağında (zincir kimliği 9800) bu yöntem `"0x2648"` döndürür.

### eth_getBalance

İstek:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28", "latest"],
    "id": 3
  }'
```

Yanıt:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": "0x56bc75e2d63100000"
}
```

## ethers.js ile Bağlanma

```javascript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get latest block
const block = await provider.getBlockNumber();
console.log("Latest block:", block);

// Get balance
const balance = await provider.getBalance("0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28");
console.log("Balance:", ethers.formatEther(balance), "QOR");
```

:::info

- Zincir kimliği onaltılık bir dize olarak döndürülür. Cüzdan yapılandırması için ondalığa dönüştürün — `0x2649` = **9801** (ana ağ), `0x2648` = **9800** (test ağı).
- Gaz fiyatlandırması EIP-1559 modelini izler. Baz ücret ve öncelik ücreti tahmini için `eth_feeHistory` kullanın.
- Kabul edilen blok etiketleri: `"latest"`, `"earliest"`, `"pending"` veya onaltılık bir blok numarası.
- Filtre sınırlamaları: `eth_getLogs`, sorgu başına `filter-cap` sonuçla sınırlıdır (varsayılan 10.000) ve genel uç noktalar 10.000 bloktan geniş aralıkları reddeder. Büyük veri kümeleri için daha dar blok aralıkları kullanın.

:::
