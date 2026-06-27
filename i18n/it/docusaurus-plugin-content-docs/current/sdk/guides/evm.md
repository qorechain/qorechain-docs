---
slug: /sdk/guides/evm
title: Guida EVM
sidebar_label: EVM
sidebar_position: 1
---

# Guida EVM

`@qorechain/evm` è un adattatore sottile e type-safe basato su [viem](https://viem.sh) per
il motore EVM di QoreChain. Non reimplementa un client EVM — viem è una peer
dependency. Aggiunge una factory di client consapevole della catena (con auto-rilevamento
dell'EVM chain-id), helper ERC-20, wrapper per il deploy/la chiamata di contratti e binding
tipizzati per i precompilati EVM di QoreChain.

```bash
npm i @qorechain/evm viem
```

## Creare un client

`createEvmClient` restituisce un bundle di client basato su viem. Rileva automaticamente
l'EVM chain id tramite `eth_chainId` a meno che tu non passi `chainId`.

```ts
import { createEvmClient } from "@qorechain/evm";

const client = await createEvmClient({
  endpoints: { evmRpc: "https://evm.testnet.example" },
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

Puoi anche passare direttamente `rpcUrl` (mutuamente esclusivo con `endpoints`), un
`wsUrl` / `endpoints.evmWs` per WebSocket, un `chainId` esplicito e `decimals`
(predefinito a 18, la convenzione EVM per QOR — distinta dalla base Cosmos `uqor`
di 10^6).

Deriva un account di firma EVM da una chiave privata:

```ts
import { evmAccountFromPrivateKey } from "@qorechain/evm";

const account = evmAccountFromPrivateKey("0x...");
```

## Helper ERC-20

Il namespace `erc20` (e le singole funzioni) incapsula le chiamate ERC-20 standard.
Le letture richiedono un public client viem; le scritture richiedono un wallet client.

```ts
import { erc20 } from "@qorechain/evm";

const bal = await erc20.balanceOf(client.publicClient, token, account);
const meta = await erc20.metadata(client.publicClient, token); // Erc20Metadata
const allowed = await erc20.allowance(client.publicClient, token, owner, spender);

// writes (need a wallet client)
// await erc20.transfer(walletClient, token, to, amount);
// await erc20.approve(walletClient, token, spender, amount);
```

L'ABI grezza è esportata come `ERC20_ABI` se preferisci chiamare viem direttamente.

## Contratti

Wrapper generici per il deploy e la chiamata:

```ts
import { deployContract, readContract, writeContract } from "@qorechain/evm";

// const address = await deployContract(walletClient, { abi, bytecode, args });
// const value = await readContract(client.publicClient, { address, abi, functionName, args });
// const hash = await writeContract(walletClient, { address, abi, functionName, args });
```

## Precompilati

QoreChain espone precompilati richiamabili da contratto a indirizzi fissi. Il
namespace `precompiles` fornisce binding tipizzati, e gli indirizzi e le ABI sono
esportati.

| Precompilato | Funzione | Indirizzo |
| --- | --- | --- |
| Cross-VM Bridge | (routing del bridge) | `0x0000000000000000000000000000000000000901` |
| Verifica PQC | `pqcVerify` | `0x0000000000000000000000000000000000000A01` |
| Stato chiave PQC | `pqcKeyStatus` | `0x0000000000000000000000000000000000000A02` |
| Punteggio di rischio QCAI | `aiRiskScore` | `0x0000000000000000000000000000000000000B01` |
| Controllo anomalie QCAI | `aiAnomalyCheck` | `0x0000000000000000000000000000000000000B02` |
| Parametri di consenso | `rlConsensusParams` | `0x0000000000000000000000000000000000000C01` |

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

Le ABI dei precompilati sono esportate come `IQORE_PQC_ABI`, `IQORE_AI_ABI` e
`IQORE_CONSENSUS_ABI`.

> Su un nodo privo dei precompilati di QoreChain, queste chiamate generano un errore "feature not
> present". Gestiscilo per ogni chiamata se hai come target nodi eterogenei.

Vedi l'[esempio](/sdk/examples) `evm-precompile` per una versione eseguibile.
