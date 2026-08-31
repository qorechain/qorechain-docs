---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — eth_ Ad Alanı
sidebar_label: JSON-RPC — eth_ Ad Alanı
sidebar_position: 3
---

# JSON-RPC — eth_ Ad Alanı

QoreChain, tamamen EVM uyumlu bir JSON-RPC arayüzü uygular ve standart Ethereum araçlarının (MetaMask, Hardhat, Foundry, ethers.js, web3.js) zincirle herhangi bir değişiklik yapılmadan etkileşime girmesine olanak tanır.

## Bağlantı

| Taşıma    | Varsayılan Adres        |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

:::note
EVM JSON-RPC arayüzü, **`qorechain-vladi`** ana ağı (EVM zincir kimliği **9801**, onaltılık `0x2649`, **v3.1.95** zincir sürümünde canlı) ve **`qorechain-diana`** test ağı (EVM zincir kimliği **9800**, onaltılık `0x2648`) tarafından sunulur. Yukarıdaki yerel adresler kendi çalıştırdığınız bir düğüm için geçerlidir; uzaktan erişim için sağlayıcınızın ana ağ veya test ağı uç noktasını kullanın.
:::

## Desteklenen Ad Alanları

| Ad Alanı  | Açıklama                                                                                                       |
| --------- | --------------------------------------------------------------------------------------------------------------- |
| `eth_`    | Temel Ethereum JSON-RPC yöntemleri                                                                              |
| `web3_`   | Yardımcı yöntemler (istemci sürümü, hashleme)                                                                   |
| `net_`    | Ağ durumu yöntemleri                                                                                            |
| `txpool_` | İşlem havuzu incelemesi                                                                                         |
| `qor_`    | QoreChain'e özgü uzantılar (bkz. [qor_ Ad Alanı](/api-reference/json-rpc-qor_-namespace))                       |

## eth_ Yöntemleri

| Yöntem                       | Parametreler                                      | Açıklama                                                  |
| ---------------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| `eth_blockNumber`            | yok                                                | En son blok numarasını döndürür                            |
| `eth_getBalance`             | `address`, `blockNumber`                           | Bir adresin bakiyesini wei cinsinden döndürür               |
| `eth_getTransactionCount`    | `address`, `blockNumber`                           | Bir adres için nonce'u (işlem sayısını) döndürür             |
| `eth_sendRawTransaction`     | `signedTxData`                                     | İmzalanmış bir işlemi yayın için gönderir                   |
| `eth_call`                   | `callObject`, `blockNumber`                        | EVM'e karşı salt okunur bir çağrı yürütür                   |
| `eth_estimateGas`            | `callObject`                                       | Bir işlem için gereken gazı tahmin eder                     |
| `eth_getBlockByNumber`       | `blockNumber`, `fullTx` (bool)                     | Numaraya göre blok verisini döndürür                        |
| `eth_getTransactionByHash`   | `txHash`                                           | Hash'e göre işlem verisini döndürür                          |
| `eth_getTransactionReceipt`  | `txHash`                                           | Madenciliği yapılmış bir işlem için makbuzu döndürür         |
| `eth_getLogs`                | `filterObject`                                     | Bir filtreyle eşleşen günlükleri döndürür                    |
| `eth_chainId`                | yok                                                | Zincir kimliğini döndürür (onaltılık kodlanmış)              |
| `eth_gasPrice`               | yok                                                | Geçerli gaz fiyatını wei cinsinden döndürür                  |
| `eth_feeHistory`             | `blockCount`, `newestBlock`, `rewardPercentiles`   | Geçmiş ücret verilerini döndürür (EIP-1559)                  |

## web3_ Yöntemleri

| Yöntem                | Parametreler | Açıklama                                    |
| --------------------- | ------------ | -------------------------------------------- |
| `web3_clientVersion`  | yok          | İstemci sürüm dizesini döndürür               |
| `web3_sha3`           | `data` (hex) | Girdinin Keccak-256 hash'ini döndürür         |

## net_ Yöntemleri

| Yöntem            | Parametreler | Açıklama                                        |
| ------------------ | ------------ | ------------------------------------------------- |
| `net_version`       | yok          | Ağ kimliğini döndürür                             |
| `net_listening`     | yok          | Düğüm dinliyorsa `true` döndürür                  |
| `net_peerCount`     | yok          | Bağlı eş sayısını döndürür (onaltılık)             |

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

# Enabled API namespaces
api = "eth,web3,net,txpool,qor"

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
  "result": "0x53b35"
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
- Filtre sınırlamaları: `eth_getLogs`, sorgu başına `filter-cap` sonuçla sınırlıdır (varsayılan 10.000). Büyük veri kümeleri için daha dar blok aralıkları kullanın.

:::
