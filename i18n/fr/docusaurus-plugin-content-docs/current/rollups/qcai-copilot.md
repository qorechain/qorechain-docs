---
slug: /rollups/qcai-copilot
title: Copilote de rollup QCAI
sidebar_label: Copilote QCAI
sidebar_position: 7
---

# Copilote de rollup QCAI

Le copilote de rollup QCAI rassemble tout ce que les services consultatifs du
réseau savent sur un rollup donné et le condense en une lecture unique, en
langage clair : une estimation des frais en temps réel, des recommandations
réseau, les éventuelles enquêtes anti-fraude faisant référence au rollup, le
statut de l'agent d'apprentissage par renforcement, ainsi qu'une courte liste
de suggestions concrètes que vous pouvez appliquer.

Il fonctionne en mode **meilleur effort**. Les services consultatifs sont une
infrastructure optionnelle — si l'un d'eux est injoignable, le copilote se
dégrade proprement : il omet la section concernée et enregistre un
avertissement au lieu de faire échouer l'appel entier. Vous obtenez toujours
un résultat.

## Un seul appel : `getRollupAdvice`

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

// The public qore.host endpoints (REST + the qor_ JSON-RPC endpoint used for
// the RL agent reads) are baked into the presets since RDK 0.4.2 — no manual
// endpoint config needed; pass `endpoints` only to target your own node.
const rdk = createRdkClient({ network: "testnet" });

const advice = await getRollupAdvice(rdk, "my-roll");

console.log(advice.feeEstimate);            // live fee estimate (if reachable)
console.log(advice.networkRecommendations); // tuning recommendations
console.log(advice.fraudInvestigations);    // investigations referencing this rollup
console.log(advice.rlAgentStatus);          // RL agent status (qor_ JSON-RPC)
console.log(advice.suggestions);            // plain-language, actionable
console.log(advice.warnings);               // services that were unreachable
```

## Les lectures sous-jacentes

`getRollupAdvice` agrège un ensemble de méthodes en lecture seule que vous
pouvez également appeler directement. Les méthodes REST consultatives sont
exposées sous `/qorechain/ai/v1/...` :

- `getFeeEstimate(...)` — estimation actuelle des frais.
- `getNetworkRecommendations(...)` — recommandations de réglage au niveau du
  réseau.
- `getFraudInvestigations(...)` / `getFraudInvestigation(id)` — enquêtes
  ouvertes et enquête individuelle par id.
- `getCircuitBreakers(...)` — état consultatif des disjoncteurs.

Les lectures d'apprentissage par renforcement utilisent l'espace de noms
JSON-RPC `qor_*` :

- `getRLAgentStatus()` — le statut actuel de l'agent.
- `getRLObservation()` — la dernière observation.
- `getRLReward()` — le dernier signal de récompense.

Comme il s'agit exclusivement de lectures, le copilote n'a besoin que d'un
point de terminaison REST (et d'un point de terminaison EVM / JSON-RPC `qor_`
pour les lectures RL) — aucun signataire n'est requis.

## CLI

```bash
qorollup advise my-roll
qorollup advise my-roll --json
```

`advise` affiche les conseils agrégés, les services injoignables étant signalés
comme des avertissements plutôt que comme des erreurs. Consultez
[Déployer un rollup](/rollups/deploying-a-rollup) pour la CLI opérateur
`qorollup` complète.
