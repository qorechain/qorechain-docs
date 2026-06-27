---
slug: /rollups/qcai-copilot
title: QCAI ロールアップ Copilot
sidebar_label: QCAI Copilot
sidebar_position: 7
---

# QCAI ロールアップ Copilot

QCAI ロールアップ Copilot は、ネットワークのアドバイザリーサービスが 1 つのロールアップについて
知っているすべてを収集し、単一の平易な言葉での読み物にまとめます: ライブの手数料見積もり、
ネットワークの推奨事項、そのロールアップを参照する不正調査、強化学習エージェントのステータス、
そしてあなたが実行に移せる短い提案のリストです。

これは **ベストエフォート** です。アドバイザリーサービスはオプションのインフラであり、いずれかが
到達不能な場合、Copilot は呼び出し全体を失敗させるのではなく、そのセクションを除外して警告を記録し、
グレースフルに劣化します。常に結果が得られます。

## 1 回の呼び出し: `getRollupAdvice`

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

## 基盤となる読み取り

`getRollupAdvice` は、直接呼び出すこともできる読み取り専用メソッドの集合を集約します。
アドバイザリーの REST メソッドは `/qorechain/ai/v1/...` 配下にあります:

- `getFeeEstimate(...)` — 現在の手数料見積もり。
- `getNetworkRecommendations(...)` — ネットワークレベルのチューニング推奨事項。
- `getFraudInvestigations(...)` / `getFraudInvestigation(id)` — 進行中の
  調査と、id による単一の調査。
- `getCircuitBreakers(...)` — アドバイザリーのサーキットブレーカー状態。

強化学習の読み取りには `qor_*` JSON-RPC 名前空間を使用します:

- `getRLAgentStatus()` — エージェントの現在のステータス。
- `getRLObservation()` — 最新の観測。
- `getRLReward()` — 最新の報酬シグナル。

これらはすべて読み取りであるため、Copilot に必要なのは REST エンドポイント（および RL 読み取り用の
EVM / `qor_` JSON-RPC エンドポイント）のみです — 署名者は不要です。

## CLI

```bash
qorollup advise my-roll
qorollup advise my-roll --json
```

`advise` は集約されたアドバイスを表示し、到達不能なサービスはエラーではなく警告として表面化します。
完全な `qorollup` オペレーター CLI については [ロールアップのデプロイ](/rollups/deploying-a-rollup)
を参照してください。
