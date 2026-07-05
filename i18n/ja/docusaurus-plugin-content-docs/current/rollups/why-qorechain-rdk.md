---
slug: /rollups/why
title: なぜ QoreChain RDK なのか
sidebar_label: なぜ QoreChain RDK なのか
sidebar_position: 2
---

# なぜ QoreChain RDK なのか

ほとんどのロールアップ開発キットは同じテーマのバリエーションにすぎません。つまり、ベースレイヤーに決済（セトルメント）するアプリチェーンの立ち上げを支援するものです。QoreChain RDK もそれを行いますが、さらに **他のどのロールアップキットにもできない** 3 つの機能を提供します。これらはツーリングではなく、QoreChain の Layer 1 に存在する機能に依存しているためです。

- **ポスト量子（post-quantum）** の決済レイヤー、
- オンチェーン AI/RL アドバイザリープリミティブ（QCAI）、
- クロス VM 呼び出しを備えた **トリプル VM** ランタイム。

汎用的な optimistic/zk ロールアップだけが必要なら、どのキットでも構いません。ロールアップの決済を **検証可能で、量子耐性があり、AI 対応** にしたいなら、それを表現できるのはこのキットだけです — TypeScript、Python、Go、Rust、Java で利用できます。

| 差別化要素 | ステータス | ここでしか実現できない理由 |
| --- | --- | --- |
| **量子耐性のある決済レシート** | 🟢 唯一無二（ファーストムーバー） | ポスト量子 L1 が必要 — 非 PQC ベースレイヤーでは不可能 |
| **QCAI Rollup Copilot** | 🟢 チェーンを通じて唯一 | QoreChain 固有のオンチェーン AI/RL エンドポイントをラップ |
| **マルチ VM のクロス VM 呼び出し** | 🟡 独自性あり | QoreChain は EVM + CosmWasm + SVM を単一チェーン上で実行 |

---

## 1. 量子耐性のある決済レシート

> 🟢 **唯一無二。** 非ポスト量子 L1 上に構築されたロールアップキットには提供できません。

ロールアップが決済バッチをアンカーすると、QoreChain はそのステートルートを **ポスト量子（ML-DSA-87 / Dilithium-5、FIPS-204）** 署名のもとで Main Chain にコミットします。RDK はそのアンカーを、誰でも **完全オフラインで** 検証できる **ポータブルなレシート** に変換します — ノードも不要、キットへの信頼も不要、必要なのは数学だけです。

レシートは 2 つのことを証明します。バッチのステートルートがアンカーされたものと一致すること（バインディング）、そしてアンカーがレイヤー作成者の登録済みポスト量子鍵で署名されたこと（真正性）です。署名は正規メッセージ
`layer_id || layer_height(8-byte big-endian) || state_root || validator_set_hash` をカバーします。

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2);
// pass `endpoints` only to target your own node.
const rdk = createRdkClient({ network: "mainnet" });

// Build a portable receipt for batch #42 of "my-rollup".
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
// → { algorithm: "ML-DSA-87", stateRoot, layerHeight, pqcSignature, creator, ... }

// Verify it — fetches the creator's PQC key from the chain.
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);                 // true
console.log(result.checks.pqcSignature);   // Dilithium-5 signature verified
console.log(result.checks.stateRootBinding); // batch root == anchored root
```

**完全オフライン** — レシートと作成者の公開鍵を誰かに渡せば、エアギャップ環境のマシンでも、ネットワークに一切触れずに検証できます。

```ts
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "a1b2…", // the layer creator's ML-DSA-87 key (hex)
});
// result.valid === true, with zero network calls
```

同じレシートは **5 つの言語すべてでバイト単位で同一に** 検証されます（TypeScript 以外のクライアントはチェーン自身の `qorechain-pqc` ライブラリを使用します）。そのため、TypeScript サービスが生成したレシートは、Go の監査ツールでも Java のバックエンドでもまったく同じように検証されます。詳細は [量子耐性のある決済レシート](/rollups/settlement-receipts) を参照してください。

---

## 2. QCAI Rollup Copilot

> 🟢 **チェーンを通じて唯一無二。** 他のネットワークには存在しないオンチェーン AI/RL エンドポイントの上に構築されています。

QoreChain はネットワークレベルの AI/RL サービスをオンチェーンで実行しています — 手数料ポリシーエージェント、ネットワーク推奨、不正調査、サーキットブレーカーなどです。Copilot はこれらを 1 つのロールアップ向けに、レビュー可能で平易な言葉による単一のビューへ集約します。読み取り専用かつベストエフォートで動作し、アドバイザリーサービスに到達できない場合は、失敗する代わりに警告へ縮退します。

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "mainnet" }); // REST + qor_ JSON-RPC endpoints baked in (RDK ≥ 0.4.2)

const advice = await getRollupAdvice(rdk, "my-rollup");

for (const s of advice.suggestions) {
  console.log(`[${s.level}] ${s.message}`);
  // [action] 2 open fraud investigation(s) reference this rollup …
  // [warn]   QCAI reports network congestion — consider raising the fee …
  // [info]   A live QCAI fee estimate is available …
}

console.log(advice.feeEstimate);          // live QCAI fee estimate
console.log(advice.fraudInvestigations);  // investigations touching this rollup
console.log(advice.rlAgentStatus);        // the RL fee/routing agent's state
```

CLI から:

```bash
qorollup advise my-rollup
```

他のキットにはラップすべき対象がそもそも存在しません — アドバイザリーデータは QoreChain のプリミティブです。詳細は [QCAI Copilot](/rollups/qcai-copilot) を参照してください。

---

## 3. マルチ VM のクロス VM 呼び出し

> 🟡 **独自性あり。** QoreChain は EVM、CosmWasm、SVM を単一チェーン上で実行し、EVM → CosmWasm をブリッジするプリコンパイルを備えています。

EVM（Solidity）のロールアップコントラクトは、`0x…0901` の固定プリコンパイルを通じて既存の **CosmWasm** コントラクトを呼び出せます。RDK が calldata を構築してくれるため、CosmWasm のオラクル、トークン、レジストリを再実装することなく Solidity から再利用できます。

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

スターターは `npm create qorechain-rollup my-app -- --template multivm-rollup` でスキャフォールドできます。（EVM↔CosmWasm のみ。SVM のクロス呼び出しは別枠です。）詳細は [マルチ VM](/rollups/multi-vm) を参照してください。

---

## その他の期待どおりの機能

差別化要素に加えて、RDK は標準装備も一通り揃えています。共有ゴールデンベクターで検証済みの 5 つの公開済み言語クライアント、5 つのプリセットプロファイルと完全な互換性マトリクス、決済バッチとライフサイクルの管理、ネイティブなデータ可用性、optimistic ロールアップ向けの **watchtower** 自動チャレンジャー、そして `qorollup` オペレーター CLI です。

## 次のステップ

- [ロールアップのデプロイ](/rollups/deploying-a-rollup) — 言語ごとのインストール手順と、ゼロからテストネット上で稼働するロールアップまで。
- [量子耐性のある決済レシート](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [マルチ VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — 詳細解説。
