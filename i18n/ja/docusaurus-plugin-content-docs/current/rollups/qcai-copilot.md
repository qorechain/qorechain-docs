---
slug: /rollups/qcai-copilot
title: QCAI ロールアップ Copilot
sidebar_label: QCAI Copilot
sidebar_position: 7
---

# QCAI ロールアップ Copilot

QCAI ロールアップ Copilot は、ネットワークのアドバイザリサービスが 1 つのロールアップについて把握しているすべての情報を集約し、平易な言葉による単一のレポートにまとめます。内容は、ライブの手数料見積もり、ネットワーク推奨事項、そのロールアップに言及している不正調査、強化学習エージェントのステータス、そしてすぐに実行に移せる提案の短いリストです。

これは**ベストエフォート**で動作します。アドバイザリサービスは任意のインフラであり、いずれかに到達できない場合でも、Copilot はそのセクションを省略して警告を記録するという形で緩やかに縮退し、呼び出し全体が失敗することはありません。常に結果が返されます。

## 1 回の呼び出し: `getRollupAdvice`

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

## 内部で行われる読み取り

`getRollupAdvice` は、直接呼び出すこともできる読み取り専用メソッド群を集約したものです。アドバイザリ REST メソッドは `/qorechain/ai/v1/...` 配下にあります。

- `getFeeEstimate(...)` — 現在の手数料見積もり。
- `getNetworkRecommendations(...)` — ネットワークレベルのチューニング推奨事項。
- `getFraudInvestigations(...)` / `getFraudInvestigation(id)` — 進行中の調査一覧と、id 指定による単一の調査。
- `getCircuitBreakers(...)` — アドバイザリのサーキットブレーカー状態。

強化学習関連の読み取りには `qor_*` JSON-RPC ネームスペースを使用します。

- `getRLAgentStatus()` — エージェントの現在のステータス。
- `getRLObservation()` — 最新の観測値。
- `getRLReward()` — 最新の報酬シグナル。

これらはすべて読み取り操作であるため、Copilot に必要なのは REST エンドポイント（および RL 読み取り用の EVM / `qor_` JSON-RPC エンドポイント）だけです。署名者は不要です。

## CLI

```bash
qorollup advise my-roll
qorollup advise my-roll --json
```

`advise` は集約されたアドバイスを出力し、到達できなかったサービスはエラーではなく警告として表示されます。オペレーター向け `qorollup` CLI の全体については[ロールアップのデプロイ](/rollups/deploying-a-rollup)を参照してください。
