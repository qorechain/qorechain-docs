---
slug: /sdk/guides/evm
title: EVM Kılavuzu
sidebar_label: EVM
sidebar_position: 1
---

# EVM kılavuzu

`@qorechain/evm`, QoreChain EVM Engine için [viem](https://viem.sh) üzerine ince,
tip güvenli bir adaptördür. Bir EVM istemcisini yeniden uygulamaz — viem bir eş
bağımlılıktır. Zincir farkındalıklı bir istemci fabrikası (EVM zincir kimliği
otomatik algılamayla), ERC-20 yardımcıları, sözleşme dağıtım/çağrı sarmalayıcıları ve
QoreChain'in EVM ön derlemeleri için tipli bağlamalar ekler.

```bash
npm i @qorechain/evm viem
```

## Bir istemci oluşturun

`createEvmClient`, viem ile desteklenen bir istemci paketi döndürür. `chainId`
geçmediğiniz sürece EVM zincir kimliğini `eth_chainId` üzerinden otomatik algılar.

```ts
import { createEvmClient } from "@qorechain/evm";

const client = await createEvmClient({
  endpoints: { evmRpc: "https://evm.testnet.example" },
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

Ayrıca doğrudan bir `rpcUrl` (`endpoints` ile karşılıklı dışlayıcı), WebSocket için
bir `wsUrl` / `endpoints.evmWs`, açık bir `chainId` ve `decimals`
(varsayılan olarak 18, QOR için EVM kuralı — Cosmos `uqor` tabanı olan 10^6'dan
farklı) geçebilirsiniz.

Özel bir anahtardan bir EVM imzalama hesabı türetin:

```ts
import { evmAccountFromPrivateKey } from "@qorechain/evm";

const account = evmAccountFromPrivateKey("0x...");
```

## ERC-20 yardımcıları

`erc20` ad alanı (ve tek tek işlevler) standart ERC-20 çağrılarını sarar.
Okumalar bir viem genel istemcisi alır; yazmalar bir cüzdan istemcisi alır.

```ts
import { erc20 } from "@qorechain/evm";

const bal = await erc20.balanceOf(client.publicClient, token, account);
const meta = await erc20.metadata(client.publicClient, token); // Erc20Metadata
const allowed = await erc20.allowance(client.publicClient, token, owner, spender);

// writes (need a wallet client)
// await erc20.transfer(walletClient, token, to, amount);
// await erc20.approve(walletClient, token, spender, amount);
```

viem'i doğrudan çağırmayı tercih ederseniz, ham ABI `ERC20_ABI` olarak dışa aktarılır.

## Sözleşmeler

Genel dağıtım ve çağrı sarmalayıcıları:

```ts
import { deployContract, readContract, writeContract } from "@qorechain/evm";

// const address = await deployContract(walletClient, { abi, bytecode, args });
// const value = await readContract(client.publicClient, { address, abi, functionName, args });
// const hash = await writeContract(walletClient, { address, abi, functionName, args });
```

## Ön derlemeler

QoreChain, sabit adreslerde sözleşmeden çağrılabilir ön derlemeler sunar. `precompiles`
ad alanı tipli bağlamalar sağlar ve adresler ile ABI'ler dışa aktarılır.

| Ön derleme | İşlev | Adres |
| --- | --- | --- |
| Cross-VM Bridge | (köprü yönlendirme) | `0x0000000000000000000000000000000000000901` |
| PQC verify | `pqcVerify` | `0x0000000000000000000000000000000000000A01` |
| PQC key status | `pqcKeyStatus` | `0x0000000000000000000000000000000000000A02` |
| QCAI risk score | `aiRiskScore` | `0x0000000000000000000000000000000000000B01` |
| QCAI anomaly check | `aiAnomalyCheck` | `0x0000000000000000000000000000000000000B02` |
| Consensus params | `rlConsensusParams` | `0x0000000000000000000000000000000000000C01` |

```ts
import { precompiles, PRECOMPILE_ADDRESSES } from "@qorechain/evm";

// Read live consensus parameters.
const params = await precompiles.rlConsensusParams(client.publicClient);

// Check whether an address has a registered PQC key.
const status = await precompiles.pqcKeyStatus(client.publicClient, account);

// QCAI helpers.
const score = await precompiles.aiRiskScore(client.publicClient, /* args */);
const anomaly = await precompiles.aiAnomalyCheck(client.publicClient, /* args */);

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
```

Ön derleme ABI'leri `IQORE_PQC_ABI`, `IQORE_AI_ABI` ve
`IQORE_CONSENSUS_ABI` olarak dışa aktarılır.

> QoreChain ön derlemeleri olmayan bir düğümde, bu çağrılar bir "feature not
> present" hatası fırlatır. Heterojen düğümleri hedefliyorsanız bunu çağrı başına ele alın.

Çalıştırılabilir bir sürüm için `evm-precompile` [örneğine](/sdk/examples) bakın.
