---
slug: /sdk/guides/cross-vm
title: Çapraz VM Kılavuzu
sidebar_label: Çapraz VM
sidebar_position: 4
---

# Çapraz VM kılavuzu

QoreChain, **EVM, SVM ve CosmWasm'ı yan yana** çalıştırır ve `x/crossvm` modülü,
tek bir yerel hesabın bunlardan herhangi birinde bir sözleşmeyi çağırmasına olanak
tanır. SDK, bu çağrıları oluşturmak, imzalamak ve yayınlamak için — birkaçını
**üç VM'nin tümünde tek bir atomik işlemde** paketlemek dahil — üst düzey bir
`createCrossVMClient` yardımcısı sağlar; ayrıca mesaj durumunu izlemek için tipli
okuma yardımcıları sunar. *EVM'nin içinden* başlatılan EVM→yerel yönlendirme,
`@qorechain/evm` içindeki **çapraz VM köprüsü precompile'ı** aracılığıyla hâlâ
zincir üzerinde çalışır.

## Birleşik çapraz VM çağrıları

`createCrossVMClient`, `MsgCrossVMCall`'ı (tür URL'si
`/qorechain.crossvm.v1.MsgCrossVMCall`) sarar, böylece asla elle bir
`{ typeUrl, value }` oluşturmaz veya kendiniz bir payload kodlamazsınız.
İstemcinin göndericisi, bağlı `TxClient`'in adresidir; `sourceVm` varsayılan
olarak `"evm"` olur.

```ts
import { createClient, createCrossVMClient } from "@qorechain/sdk";

const client = createClient({ network: "testnet", endpoints: { rpc, rest } });
const tx = await client.connectTx(signer);
const xvm = createCrossVMClient(tx);

// Call an EVM contract from a native account — the payload is ABI-encoded.
const { messageId, result } = await xvm.call({
  sourceVm: "cosmwasm",
  targetVm: "evm",
  targetContract: "0xToken",
  evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 1n] },
});
```

`VMType`, `"evm" | "cosmwasm" | "svm"` değerlerinden biridir (ayrıca `VM_TYPES`
dizisi olarak da dışa aktarılır).

### VM başına payload kodlaması

Çağrı başına tam olarak **bir** payload şekli seçin:

| Şekil | Kodlama |
|---|---|
| `{ payload: Uint8Array \| Hex }` | ham baytlar, değişmeden geçirilir |
| `{ evm: { abi, functionName, args } }` | viem'in `encodeFunctionData`'sı ile ABI olarak kodlanır (seçici + argümanlar) |
| `{ cosmwasm: object }` | `JSON.stringify`, ardından UTF-8 baytları (CosmWasm execute-msg kuralı) |
| `{ svm: { data: Uint8Array \| Hex } }` | ham baytlar (bir SVM talimat blob'u) |

EVM yolu `viem`'i geç (lazy) içe aktarır, bu nedenle isteğe bağlı `viem` peer'ı
yalnızca bir `{ evm: ... }` payload'ı gerçekten kullandığınızda gereklidir.

### Yalnızca oluşturma (çevrimdışı)

`buildCall`, yayınlamadan `EncodeObject`'i döndürür — inceleme, elle toplu işleme
veya başka bir yerde imzalama için kullanışlıdır. (EVM payload'ları asenkron
olarak ABI ile kodlanır, bu nedenle bunlar için `call`/`callAtomic` kullanın veya
önceden kodlayıp `{ payload }` geçirin.)

```ts
const msg = xvm.buildCall({
  targetVm: "svm",
  targetContract: "Prog...",
  svm: { data: new Uint8Array([1, 2, 3]) },
});
```

## Atomik üçlü VM işlemleri

`callAtomic`, birden çok `MsgCrossVMCall` mesajını **tek bir işlem gövdesinde**
paketler, böylece tek bir imza altında atomik olarak yürütülürler — üçlü VM
başlığı. Tek imza, EVM + SVM + CosmWasm'da yapılan çağrıların hepsi birlikte iner
veya hiçbiri inmez:

```ts
const { messageIds, result } = await xvm.callAtomic([
  {
    targetVm: "evm",
    targetContract: "0xToken",
    evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 2n] },
  },
  { targetVm: "svm", targetContract: "Prog...", svm: { data: instructionBytes } },
  { targetVm: "cosmwasm", targetContract: "qor1c...", cosmwasm: { ping: {} } },
]);
```

## Bir mesajı geri okuma

`getMessage`, bir çapraz VM mesajını kimliğine göre okur; tipli sorgu istemcisini
tercih eder ve `qor_getCrossVMMessage` JSON-RPC yöntemine geri döner:

```ts
import { connectQueryClients } from "@qorechain/sdk";

const queries = connectQueryClients(rpcClient);
const reader = createCrossVMClient(tx, { query: queries.crossvm });

const msg = await reader.getMessage(messageId);
```

## Çapraz VM mesaj durumunu okuma

`@qorechain/sdk`, `x/crossvm` üzerinde tipli REST sarmalayıcıları dışa aktarır:

```ts
import {
  createClient,
  getCrossVmMessage,
  getPendingCrossVmMessages,
  getCrossVmParams,
} from "@qorechain/sdk";

const client = createClient({
  endpoints: { rest: "https://rest.testnet.example" },
});

// A single message by id.
const msg = await getCrossVmMessage(client.rest, messageId);

// All pending messages.
const pending = await getPendingCrossVmMessages(client.rest);

// Module parameters.
const params = await getCrossVmParams(client.rest);
```

Bunlar tipli şekiller döndürür: `CrossVmMessage`, `CrossVmMessageResponse`,
`PendingCrossVmMessagesResponse` ve `CrossVmParamsResponse`.

Bir mesajı `qor_` JSON-RPC ad alanı aracılığıyla da okuyabilirsiniz:

```ts
const m = await client.qor.getCrossVMMessage(messageId);
```

## EVM köprüsü precompile'ı

EVM→yerel yönlendirme, `@qorechain/evm` içinde sunulan çapraz VM köprüsü
precompile'ı aracılığıyla zincir üzerinde yürütülür:

```ts
import { PRECOMPILE_ADDRESSES } from "@qorechain/evm";

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
// 0x0000000000000000000000000000000000000901
```

Bir mesajı yerel katmana yönlendirmek için precompile'ı bir Solidity
sözleşmesinden (veya viem aracılığıyla) o adreste çağırın, ardından yukarıdaki
okuma yardımcılarıyla durumunu izleyin. Tam precompile listesi için
[EVM kılavuzuna](/sdk/guides/evm) bakın.
