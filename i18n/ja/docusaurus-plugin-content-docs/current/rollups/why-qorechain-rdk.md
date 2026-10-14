---
slug: /rollups/why
title: なぜ QoreChain RDK なのか
sidebar_label: なぜ QoreChain RDK なのか
sidebar_position: 2
---

# なぜ QoreChain RDK なのか

ほとんどのロールアップ開発キットは同じテーマのバリエーションにすぎません。つまり、ベースレイヤーに決済（セトルメント）するアプリチェーンの立ち上げを支援するものです。QoreChain RDK もそれを行いますが、さらに QoreChain 固有の 3 つの機能を追加します。これらはツーリングではなく、QoreChain の Layer 1 を軸に構築されています。

- **ポスト量子（post-quantum）** の決済レイヤー、
- オンチェーン AI/RL アドバイザリープリミティブ（QCAI）、
- クロス VM 呼び出しを備えた **トリプル VM** ランタイム。

:::caution 初期段階: ステータス列をお読みください
どちらのネットワークにも、まだロールアップは作成されていません。下の表は、現時点で動作するものを示しています。汎用的な optimistic/zk ロールアップだけが必要なら、どのキットでも構いません。ここで説明する機能は、RDK が TypeScript、Python、Go、Rust、Java で上乗せするものです。
:::

| 機能 | ステータス | 依存するもの |
| --- | --- | --- |
| **量子耐性のある決済レシート** | 🟡 初期段階 | アンカーは Main Chain のポスト量子方式である ML-DSA-87 で署名されます。アンカーはまだ存在しません |
| **QCAI Rollup Copilot** | 🟡 公開エンドポイントではまだ利用不可 | 現在、公開エンドポイントが公開していないオンチェーン AI/RL アドバイザリーサービス |
| **マルチ VM のクロス VM 呼び出し** | 🟡 稼働中のネットワークではまだ利用不可 | 有効化されていないクロス VM プリコンパイルがあり、CosmWasm のアップロードは閉じられています |

---

## 1. 量子耐性のある決済レシート

> 🟡 **QoreChain のポスト量子ベースレイヤー上に構築された設計。** 決済アンカーは、Main Chain と同じ方式である ML-DSA-87（Dilithium-5、FIPS-204）で署名されます。初期段階: どちらのネットワークにも、まだアンカーは存在しません。

ロールアップの作成者が決済バッチをアンカーすると、そのアンカーはオンチェーンに登録されたポスト量子鍵で署名されます。RDK はそのアンカーを **ポータブルなレシート** としてパッケージ化でき、検証者は QoreChain ノードから該当する主張を読み直して、ロールアップ、バッチ、アンカー、作成者の鍵のすべてがチェーンの保持する内容と一致することを確認します。

```ts
import { createRdkClient, buildSettlementReceipt, verifySettlementReceipt } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

レシートが何を証明し、何を証明しないのかについては、[量子耐性のある決済レシート](/rollups/settlement-receipts) を参照してください。

---

## 2. QCAI Rollup Copilot

> 🟡 **公開エンドポイントではまだ利用できません。**

Copilot は、ネットワークのアドバイザリーサービス（手数料ポリシーエージェント、推奨、不正調査）を、1 つのロールアップ向けに読み取り専用で平易な言葉による単一のビューへ集約することを目的としています。ベストエフォートで動作し、サービスに到達できない場合は、失敗する代わりに警告へ縮退します。これらのサービスは現在、公開エンドポイントでは公開されていないため、すべてのセクションが警告として返されます。

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");
console.log(advice.warnings); // services that could not be reached
```

CLI から: `qorollup advise my-rollup`。詳細は [QCAI Copilot](/rollups/qcai-copilot) を参照してください。

---

## 3. マルチ VM のクロス VM 呼び出し

> 🟡 **稼働中のネットワークではまだ利用できません** — プリコンパイルは有効化されておらず、CosmWasm のアップロードは閉じられています。[マルチ VM](/rollups/multi-vm) を参照してください。

RDK には、EVM（Solidity）コントラクトから **CosmWasm** コントラクトへの呼び出しを、`0x…0901` の固定プリコンパイル経由でエンコードするヘルパーが含まれています。このプリコンパイルは、メインネットでもテストネットでも **有効ではありません**（[EVM プリコンパイル: ネットワークの状況](/developer-guide/evm-precompiles#network-status) を参照）。

```ts
import { encodeCrossVmCalldata, CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1examplecontract…",       // target CosmWasm contract
  msg: JSON.stringify({ increment: {} }),  // its execute message
});

// Send an EVM transaction:  to = CROSS_VM_PRECOMPILE,  data = calldata
console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

あるいは、ロールアップ上の Solidity から直接:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data =
        abi.encodeWithSignature("executeCrossVMCall(string,bytes)", contractAddr, msg_);
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

スターターは `npm create qorechain-rollup my-app -- --template multivm-rollup` でスキャフォールドできます。（EVM↔CosmWasm のみ。SVM のクロス呼び出しは別枠です。）

---

## その他の期待どおりの機能

これらの機能に加えて、RDK は標準装備も一通り揃えています。共有ゴールデンベクターで検証済みの 5 つの公開済み言語クライアント、5 つのプリセットプロファイルと完全な互換性マトリクス、決済バッチとライフサイクルの管理、ネイティブなデータ可用性ストレージ（そのステータス注記を参照）、optimistic ロールアップ向けの **watchtower** 自動チャレンジャー、そして `qorollup` オペレーター CLI です。

## 次のステップ

- [ロールアップのデプロイ](/rollups/deploying-a-rollup) — 言語ごとのインストール手順と、テストネット上のロールアップに至る CLI の手順。
- [量子耐性のある決済レシート](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [マルチ VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — 詳細解説。
