---
slug: /developer-guide/cross-vm-interoperability
title: VM'ler Arası Birlikte Çalışabilirlik
sidebar_label: VM'ler Arası Birlikte Çalışabilirlik
sidebar_position: 5
---

# VM'ler Arası Birlikte Çalışabilirlik

QoreChain'in **üçlü VM mimarisi** (EVM, CosmWasm, SVM), herhangi bir sanal makinedeki akıllı sözleşmelerin başka herhangi bir VM'deki sözleşmelerle iletişim kurmasına olanak tanır. `x/crossvm` modülü hem senkron hem de asenkron mesajlaşma yolları sağlar.

:::note
Aşağıdaki uç noktalar varsayılan olarak yerel bir düğüme yöneliktir. Ana ağda **`qorechain-vladi`** RPC uç noktalarını kullanın (Cosmos RPC **26657**, EVM JSON-RPC **8545**); test ağı **`qorechain-diana`** şeklindedir.
:::

---

## Mimariye Genel Bakış

```
 EVM (Solidity)          CosmWasm (Rust/Wasm)         SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| Yol              | Yön             | Zamanlama        | Mekanizma                       |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **Senkron**      | EVM'den CosmWasm'a | Aynı işlem    | `0x0000...0901` adresindeki önderlenmiş işlev |
| **Asenkron**     | CosmWasm'dan EVM'e | Sonraki blok  | EndBlocker aracılığıyla `MsgCrossVMCall` |
| **Asenkron**     | SVM'den herhangi bir VM'e | Sonraki blok | EndBlocker aracılığıyla `MsgCrossVMCall` |
| **Asenkron**     | Herhangi birinden SVM'e | Sonraki blok | EndBlocker aracılığıyla `MsgCrossVMCall` |

---

## Senkron Yol (EVM'den CosmWasm'a)

Senkron yol, `0x0000000000000000000000000000000000000901` adresinde bir EVM **önderlenmiş işlevi** kullanır. Bu, Solidity sözleşmelerinin CosmWasm sözleşmelerini çağırmasına ve aynı işlem içinde bir yanıt almasına olanak tanır.

### Solidity Örneği

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICrossVM {
    function call(bytes calldata payload) external returns (bytes memory);
}

contract CrossVMCaller {
    ICrossVM constant CROSSVM = ICrossVM(0x0000000000000000000000000000000000000901);

    function callCosmWasmContract(
        string memory cosmwasmAddr,
        string memory executeMsg,
        uint256 funds
    ) external returns (bytes memory) {
        bytes memory payload = abi.encode(cosmwasmAddr, executeMsg, funds);
        return CROSSVM.call(payload);
    }
}
```

Önderlenmiş işlev, CosmWasm sözleşmesini hemen yürütür ve sonucu döndürür. Gaz maliyeti: **50.000 taban + yürütme maliyeti**.

---

## Asenkron Yol

Diğer tüm VM'ler arası yönler asenkron mesaj kuyruğunu kullanır. Mesajlar bir blokta gönderilir ve sonraki blokta **EndBlocker** tarafından işlenir.

### CLI

```bash
# CosmWasm to EVM
qorechaind tx crossvm call \
  --source-vm cosmwasm \
  --target-vm evm \
  --target-contract 0x1234...abcd \
  --payload '{"method":"transfer","params":["0xRecipient",100]}' \
  --from mykey \
  -y

# SVM to CosmWasm
qorechaind tx crossvm call \
  --source-vm svm \
  --target-vm cosmwasm \
  --target-contract qor1contractaddr... \
  --payload '{"execute":{"action":{}}}' \
  --from mykey \
  -y

# EVM to SVM (async)
qorechaind tx crossvm call \
  --source-vm evm \
  --target-vm svm \
  --target-contract <program-id-base58> \
  --payload '0a0b0c...' \
  --from mykey \
  -y
```

---

## Mesaj Yaşam Döngüsü

Her VM'ler arası mesaj, tanımlanmış bir dizi durum arasında geçiş yapar:

```
Submitted --> Pending --> Executed
                |
                +--> Failed
                |
                +--> Timed Out
```

| Durum         | Açıklama                                                  |
| ------------- | --------------------------------------------------------- |
| **Submitted** | Mesaj kuyruğa kabul edildi                                |
| **Pending**   | Sonraki EndBlocker geçişinde yürütülmeyi bekliyor         |
| **Executed**  | Hedef sözleşme başarıyla çağrıldı; yanıt kaydedildi       |
| **Failed**    | Hedef sözleşme yürütmesi geri alındı; hata kaydedildi     |
| **Timed Out** | Mesaj, yürütülmeden `queue_timeout_blocks` değerini aştı  |

---

## Parametreler

| Parametre              | Değer        | Açıklama                                       |
| ---------------------- | ------------ | ---------------------------------------------- |
| `max_message_size`     | 65.536 bayt  | Mesaj başına maksimum yük boyutu               |
| `max_queue_size`       | 1.000        | Kuyruktaki maksimum bekleyen mesaj             |
| `queue_timeout_blocks` | 100          | İşlenmemiş bir mesajın zaman aşımına uğramasından önceki blok sayısı |

---

## Olaylar

`x/crossvm` modülü aşağıdaki olayları yayar:

| Olay               | Öznitelikler                                                        | Açıklama                              |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | Yeni VM'ler arası mesaj gönderildi    |
| `crossvm_response` | `message_id`, `status`, `result`                                    | Mesaj yürütüldü (başarı veya başarısızlık) |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`                              | Mesaj yürütülmeden sona erdi          |

WebSocket aracılığıyla olaylara abone olun:

```bash
wscat -c ws://localhost:26657/websocket
> {"jsonrpc":"2.0","method":"subscribe","params":["tm.event='Tx' AND crossvm_request.message_id EXISTS"],"id":1}
```

---

## Mesajları Sorgulama

### CLI

```bash
# Query a specific message by ID
qorechaind query crossvm message <message-id>

# List all pending messages
qorechaind query crossvm pending

# List messages by sender
qorechaind query crossvm messages-by-sender <address>
```

### JSON-RPC

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getCrossVMMessage",
    "params": ["<message-id>"],
    "id": 1
  }'
```

### Yanıt Biçimi

```json
{
  "message_id": "crossvm-00000042",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234...abcd",
  "sender": "qor1sender...",
  "payload": "...",
  "status": "executed",
  "result": "0x...",
  "submitted_height": 12345,
  "executed_height": 12346
}
```

---

## Tasarım Hususları

**Atomiklik:** Senkron çağrılar (önderlenmiş işlev aracılığıyla EVM'den CosmWasm'a) atomiktir — taraflardan biri geri alınırsa, tüm işlem geri alınır. Asenkron çağrılar bloklar arasında **atomik değildir**; sözleşmelerinizi `Failed` ve `Timed Out` durumlarını sorunsuzca ele alacak şekilde tasarlayın.

**Sıralama:** Kuyruktaki mesajlar, her EndBlocker geçişi içinde FIFO olarak işlenir. Farklı kaynak VM'ler arasında garantili bir sıralama yoktur.

**Yük kodlaması:** Yük biçimi hedef VM'e bağlıdır:

* **EVM hedefleri:** ABI ile kodlanmış işlev çağrıları
* **CosmWasm hedefleri:** JSON ile kodlanmış yürütme mesajları
* **SVM hedefleri:** Hex ile kodlanmış BPF talimat verileri

---

## Sonraki Adımlar

* [EVM Önderlenmiş İşlevleri](/developer-guide/evm-precompiles) — Senkron CrossVM önderlenmiş işlevi ve diğer özel önderlenmiş işlevler
* [EVM Geliştirme](/developer-guide/evm-development) — QoreChain üzerinde Solidity geliştirme
* [CosmWasm Geliştirme](/developer-guide/cosmwasm-development) — Rust/Wasm sözleşme geliştirme
* [SVM Geliştirme](/developer-guide/svm-development) — BPF program dağıtımı
