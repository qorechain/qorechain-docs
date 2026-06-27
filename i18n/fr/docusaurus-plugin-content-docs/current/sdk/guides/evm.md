---
slug: /sdk/guides/evm
title: Guide EVM
sidebar_label: EVM
sidebar_position: 1
---

# Guide EVM

`@qorechain/evm` est un adaptateur fin et fortement typé au-dessus de [viem](https://viem.sh) pour
le moteur EVM de QoreChain. Il ne réimplémente pas un client EVM — viem est une dépendance
pair (peer dependency). Il ajoute une fabrique de client consciente de la chaîne (avec
détection automatique de l'identifiant de chaîne EVM), des assistants ERC-20, des wrappers de
déploiement/appel de contrats, et des liaisons typées pour les précompilés EVM de QoreChain.

```bash
npm i @qorechain/evm viem
```

## Créer un client

`createEvmClient` renvoie un ensemble de clients reposant sur viem. Il détecte automatiquement
l'identifiant de chaîne EVM via `eth_chainId` sauf si vous passez `chainId`.

```ts
import { createEvmClient } from "@qorechain/evm";

const client = await createEvmClient({
  endpoints: { evmRpc: "https://evm.testnet.example" },
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

Vous pouvez aussi passer directement `rpcUrl` (mutuellement exclusif avec `endpoints`), un
`wsUrl` / `endpoints.evmWs` pour le WebSocket, un `chainId` explicite, et `decimals`
(par défaut 18, la convention EVM pour QOR — distincte de la base Cosmos `uqor`
de 10^6).

Dérivez un compte de signature EVM à partir d'une clé privée :

```ts
import { evmAccountFromPrivateKey } from "@qorechain/evm";

const account = evmAccountFromPrivateKey("0x...");
```

## Assistants ERC-20

L'espace de noms `erc20` (ainsi que les fonctions individuelles) encapsule les appels ERC-20 standard.
Les lectures prennent un client public viem ; les écritures prennent un client wallet.

```ts
import { erc20 } from "@qorechain/evm";

const bal = await erc20.balanceOf(client.publicClient, token, account);
const meta = await erc20.metadata(client.publicClient, token); // Erc20Metadata
const allowed = await erc20.allowance(client.publicClient, token, owner, spender);

// writes (need a wallet client)
// await erc20.transfer(walletClient, token, to, amount);
// await erc20.approve(walletClient, token, spender, amount);
```

L'ABI brut est exporté sous le nom `ERC20_ABI` si vous préférez appeler viem directement.

## Contrats

Wrappers génériques de déploiement et d'appel :

```ts
import { deployContract, readContract, writeContract } from "@qorechain/evm";

// const address = await deployContract(walletClient, { abi, bytecode, args });
// const value = await readContract(client.publicClient, { address, abi, functionName, args });
// const hash = await writeContract(walletClient, { address, abi, functionName, args });
```

## Précompilés

QoreChain expose des précompilés appelables par contrat à des adresses fixes. L'espace de noms
`precompiles` fournit des liaisons typées, et les adresses ainsi que les ABI sont
exportés.

| Précompilé | Fonction | Adresse |
| --- | --- | --- |
| Pont inter-VM | (routage du pont) | `0x0000000000000000000000000000000000000901` |
| Vérification PQC | `pqcVerify` | `0x0000000000000000000000000000000000000A01` |
| Statut de clé PQC | `pqcKeyStatus` | `0x0000000000000000000000000000000000000A02` |
| Score de risque QCAI | `aiRiskScore` | `0x0000000000000000000000000000000000000B01` |
| Vérification d'anomalie QCAI | `aiAnomalyCheck` | `0x0000000000000000000000000000000000000B02` |
| Paramètres de consensus | `rlConsensusParams` | `0x0000000000000000000000000000000000000C01` |

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

Les ABI des précompilés sont exportés sous les noms `IQORE_PQC_ABI`, `IQORE_AI_ABI`, et
`IQORE_CONSENSUS_ABI`.

> Sur un nœud sans les précompilés QoreChain, ces appels lèvent une erreur « feature not
> present ». Gérez cela appel par appel si vous ciblez des nœuds hétérogènes.

Voir l'[exemple](/sdk/examples) `evm-precompile` pour une version exécutable.
