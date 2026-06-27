---
slug: /rollups/qcai-copilot
title: QCAI Rollup Copilot
sidebar_label: QCAI Copilot
sidebar_position: 7
---

# QCAI Rollup Copilot

Le QCAI Rollup Copilot rassemble tout ce que les services consultatifs du réseau
savent sur un rollup et le condense en une lecture unique, en langage clair : une
estimation de frais en direct, des recommandations réseau, toute enquête de fraude
faisant référence au rollup, le statut de l'agent d'apprentissage par renforcement
et une courte liste de suggestions sur lesquelles vous pouvez agir.

Il fonctionne en **best-effort**. Les services consultatifs sont une infrastructure
optionnelle — si l'un d'eux est injoignable, le Copilot se dégrade gracieusement,
en abandonnant cette section et en enregistrant un avertissement plutôt qu'en
faisant échouer l'ensemble de l'appel. Vous obtenez toujours un résultat.

## Un seul appel : `getRollupAdvice`

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    evmRpc: "https://evm.testnet.example", // qor_ JSON-RPC for RL agent reads
  },
});

const advice = await getRollupAdvice(rdk, "my-roll");

console.log(advice.feeEstimate);            // live fee estimate (if reachable)
console.log(advice.networkRecommendations); // tuning recommendations
console.log(advice.fraudInvestigations);    // investigations referencing this rollup
console.log(advice.rlAgentStatus);          // RL agent status (qor_ JSON-RPC)
console.log(advice.suggestions);            // plain-language, actionable
console.log(advice.warnings);               // services that were unreachable
```

## Les lectures sous-jacentes

`getRollupAdvice` agrège un ensemble de méthodes en lecture seule que vous pouvez
aussi appeler directement. Les méthodes REST consultatives résident sous
`/qorechain/ai/v1/...` :

- `getFeeEstimate(...)` — estimation de frais actuelle.
- `getNetworkRecommendations(...)` — recommandations de réglage au niveau réseau.
- `getFraudInvestigations(...)` / `getFraudInvestigation(id)` — enquêtes
  ouvertes et une enquête unique par id.
- `getCircuitBreakers(...)` — état consultatif des disjoncteurs.

Les lectures d'apprentissage par renforcement utilisent l'espace de noms JSON-RPC
`qor_*` :

- `getRLAgentStatus()` — le statut actuel de l'agent.
- `getRLObservation()` — la dernière observation.
- `getRLReward()` — le dernier signal de récompense.

Comme il s'agit uniquement de lectures, le Copilot n'a besoin que d'un point de
terminaison REST (et d'un point de terminaison EVM / JSON-RPC `qor_` pour les
lectures RL) — pas de signataire.

## CLI

```bash
qorollup advise my-roll
qorollup advise my-roll --json
```

`advise` affiche l'avis agrégé, les services injoignables apparaissant comme des
avertissements plutôt que comme des erreurs. Consultez [Déployer un Rollup](/rollups/deploying-a-rollup)
pour la CLI opérateur `qorollup` complète.
