---
slug: /rollups/qcai-copilot
title: QCAI ロールアップ Copilot
sidebar_label: QCAI Copilot
sidebar_position: 7
---

# QCAI ロールアップ Copilot

RDK の QCAI ロールアップ Copilot は読み取り専用のヘルパーで、1 つのロールアップについて、ネットワークのアドバイザリデータ（手数料の見積もり、ネットワークへの推奨事項、そのロールアップを参照する不正調査、強化学習エージェントのステータス）を集めることを**試み**、それを平易な言葉による 1 つの読み物と、短い提案のリストにまとめます。

:::caution 公開エンドポイントでは利用できません
Copilot が読み取るアドバイザリサービス（`/qorechain/ai/v1/…` の REST ルートと `qor_*` JSON-RPC 名前空間）は、現在、メインネットでもテストネットでも公開の `qore.host` エンドポイントでは**提供されていません**。そのため、すべてのセクションが警告として返されます。Copilot は設計上ベストエフォートであり、失敗することはありませんが、結果が空であることは、ロールアップが検査されて健全だと確認されたことを意味するものでは**ありません**。これらのサービスが公開されるまでは、安全性のシグナルとして使用しないでください。[`qor_` 名前空間](/api-reference/json-rpc-qor_-namespace)を参照してください。
:::

## 1 回の呼び出し: `getRollupAdvice` {#one-call-getrollupadvice}

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");

console.log(advice.warnings);    // services that could not be reached (all of them today)
console.log(advice.suggestions); // plain-language suggestions, when data is available
```

結果には、対応するサービスが応答した場合に、`feeEstimate`、`networkRecommendations`、`fraudInvestigations`、`rlAgentStatus` も含まれます。

## CLI {#cli}

```bash
qorollup advise my-rollup
qorollup advise my-rollup --json
```

到達できないサービスはエラーではなく警告として一覧表示されます。また、何にも到達できなかった場合でも、人が読める出力に "no issues flagged" という行が表示されることがあります — 警告を読んでください。`qorollup` オペレーター CLI については、[ロールアップのデプロイ](/rollups/deploying-a-rollup)を参照してください。
