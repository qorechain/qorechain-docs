---
slug: /sdk/guides/evm
title: Ghid EVM
sidebar_label: EVM
sidebar_position: 1
---

# Ghid EVM

`@qorechain/evm` este un adaptor subțire, type-safe peste [viem](https://viem.sh) pentru
motorul EVM al QoreChain. Nu reimplementează un client EVM — viem este o dependență
peer. Adaugă o fabrică de clienți conștientă de lanț (cu auto-detectare a chain-id-ului
EVM), helpere ERC-20, wrappere pentru deploy/apel de contracte și legături tipizate
pentru precompilele EVM ale QoreChain.

```bash
npm i @qorechain/evm viem
```

## Crearea unui client

`createEvmClient` returnează un pachet de client susținut de viem. Detectează automat
chain-id-ul EVM prin `eth_chainId`, cu excepția cazului în care transmiți `chainId`.

```ts
import { createEvmClient } from "@qorechain/evm";

const client = await createEvmClient({
  endpoints: { evmRpc: "https://evm.testnet.example" },
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

Poți de asemenea să transmiți direct `rpcUrl` (mutual exclusiv cu `endpoints`), un
`wsUrl` / `endpoints.evmWs` pentru WebSocket, un `chainId` explicit și `decimals`
(implicit 18, convenția EVM pentru QOR — distinctă de baza Cosmos `uqor`
de 10^6).

Derivă un cont de semnare EVM dintr-o cheie privată:

```ts
import { evmAccountFromPrivateKey } from "@qorechain/evm";

const account = evmAccountFromPrivateKey("0x...");
```

## Helpere ERC-20

Spațiul de nume `erc20` (și funcțiile individuale) împachetează apelurile ERC-20 standard.
Citirile primesc un public client viem; scrierile primesc un wallet client.

```ts
import { erc20 } from "@qorechain/evm";

const bal = await erc20.balanceOf(client.publicClient, token, account);
const meta = await erc20.metadata(client.publicClient, token); // Erc20Metadata
const allowed = await erc20.allowance(client.publicClient, token, owner, spender);

// writes (need a wallet client)
// await erc20.transfer(walletClient, token, to, amount);
// await erc20.approve(walletClient, token, spender, amount);
```

ABI-ul brut este exportat ca `ERC20_ABI` dacă preferi să apelezi viem direct.

## Contracte

Wrappere generice pentru deploy și apel:

```ts
import { deployContract, readContract, writeContract } from "@qorechain/evm";

// const address = await deployContract(walletClient, { abi, bytecode, args });
// const value = await readContract(client.publicClient, { address, abi, functionName, args });
// const hash = await writeContract(walletClient, { address, abi, functionName, args });
```

## Precompile

QoreChain expune precompile apelabile prin contract la adrese fixe. Spațiul de nume
`precompiles` oferă legături tipizate, iar adresele și ABI-urile sunt
exportate.

| Precompilă | Funcție | Adresă |
| --- | --- | --- |
| Cross-VM Bridge | (rutare bridge) | `0x0000000000000000000000000000000000000901` |
| Verificare PQC | `pqcVerify` | `0x0000000000000000000000000000000000000A01` |
| Stare cheie PQC | `pqcKeyStatus` | `0x0000000000000000000000000000000000000A02` |
| Scor de risc QCAI | `aiRiskScore` | `0x0000000000000000000000000000000000000B01` |
| Verificare anomalii QCAI | `aiAnomalyCheck` | `0x0000000000000000000000000000000000000B02` |
| Parametri de consens | `rlConsensusParams` | `0x0000000000000000000000000000000000000C01` |

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

ABI-urile precompilelor sunt exportate ca `IQORE_PQC_ABI`, `IQORE_AI_ABI` și
`IQORE_CONSENSUS_ABI`.

> Pe un nod fără precompilele QoreChain, aceste apeluri aruncă o eroare „feature not
> present”. Tratează acest lucru per apel dacă vizezi noduri eterogene.

Vezi [exemplul](/sdk/examples) `evm-precompile` pentru o versiune executabilă.
