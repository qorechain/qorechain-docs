---
slug: /sdk/guides/ai-preflight
title: Guide de pré-vérification IA
sidebar_label: Pré-vérification IA
sidebar_position: 5
---

# Guide de pré-vérification IA

QoreChain est le premier réseau à exposer un **modèle de risque/anomalie IA sur la chaîne**
à toute dApp. Deux précompilés EVM en lecture seule vous permettent de noter une transaction *avant*
qu'elle ne soit signée ou diffusée, en utilisant uniquement `eth_call` :

| Capacité | Précompilé | Adresse |
|---|---|---|
| Score de risque pour les données d'appel | `aiRiskScore(bytes)` | `0x0000000000000000000000000000000000000B01` |
| Vérification d'anomalie pour `(sender, amount)` | `aiAnomalyCheck(address,uint256)` | `0x0000000000000000000000000000000000000B02` |

L'implémentation se trouve dans `@qorechain/evm` (l'adaptateur EVM au-dessus de
[viem](https://viem.sh)) et est réexportée depuis `@qorechain/sdk` à des fins de découverte.

> Le `level` de risque est plus élevé pour les transactions plus risquées. La politique d'exemple de la chaîne
> utilise `require(level < 3)`.

## Pré-vérification en un seul appel

`simulateWithRiskScore` regroupe une estimation de gaz, un score de risque et une vérification
d'anomalie en un seul verdict consultatif :

```ts
import { createEvmClient, simulateWithRiskScore } from "@qorechain/evm";

const { publicClient } = await createEvmClient({
  endpoints: { evmRpc: "https://evm.testnet.example" },
});

const preflight = await simulateWithRiskScore(publicClient, {
  from: "0xYourAddress",
  to: "0xToken",
  data: "0xa9059cbb...", // ERC-20 transfer calldata
  value: 0n,
});

console.log(preflight.gas);     // bigint — eth_estimateGas
console.log(preflight.risk);    // { score: bigint, level: number }
console.log(preflight.anomaly); // { anomalyScore: bigint, flagged: boolean }
console.log(preflight.safe);    // boolean — advisory verdict
```

`safe` est calculé comme `risk.level < RISK_LEVEL_UNSAFE_THRESHOLD && !anomaly.flagged`,
où le seuil vaut par défaut `3`. Lorsqu'aucune `data` n'est fournie, le score de risque est
calculé sur le bytecode déployé à `to`, de sorte qu'un simple transfert de valeur vers un
contrat est tout de même noté.

> **L'indicateur `safe` est consultatif.** Les précompilés ne bloquent rien par
> eux-mêmes. Définissez et appliquez votre propre politique hors chaîne (et un contrat peut faire `require` sur
> le niveau sur la chaîne). `RISK_LEVEL_UNSAFE_THRESHOLD` est exporté afin que vous puissiez
> référencer la même valeur par défaut que celle documentée par le SDK.

## Les éléments de base

```ts
import { aiRiskScore, aiAnomalyCheck } from "@qorechain/evm";

// Risk score for raw calldata (accepts a 0x-hex string or a Uint8Array).
const { score, level } = await aiRiskScore(publicClient, "0xa9059cbb...");

// Anomaly check for a (sender, amount) pair.
const { anomalyScore, flagged } = await aiAnomalyCheck(
  publicClient,
  "0xYourAddress",
  1_000_000_000_000_000_000n, // 1 QOR in wei
);
```

Les deux encodent l'appel avec `encodeFunctionData` de viem et décodent le tuple
retourné avec `decodeFunctionResult`.

## Constantes d'adresse

```ts
import { AI_RISK_SCORE_ADDRESS, AI_ANOMALY_CHECK_ADDRESS } from "@qorechain/evm";
```

## Disponibilité

Les précompilés IA existent sur les nœuds du réseau QoreChain. Sur un nœud EVM ordinaire, les
appels lèvent une erreur « not available » — traitez une erreur levée par l'un de ces
assistants comme « fonctionnalité absente sur ce nœud ».

Voir le [guide EVM](/sdk/guides/evm) pour la liste complète des précompilés, et
l'[exemple `ai-preflight`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/ai-preflight) exécutable.
