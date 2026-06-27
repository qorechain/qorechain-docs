---
slug: /rollups/why
title: なぜ QoreChain RDK なのか
sidebar_label: なぜ QoreChain RDK なのか
sidebar_position: 2
---

# なぜ QoreChain RDK なのか

ほとんどのロールアップ開発キットは、同じテーマのバリエーションです。つまり、ベースレイヤーに決済するアプリチェーンの立ち上げを支援するものです。QoreChain RDK もそれを行いますが、加えて **他のどのロールアップキットにもできない** 3 つのことを公開します。なぜなら、それらはツール側ではなく QoreChain のレイヤー 1 に存在する機能に依存しているからです。

- **ポスト量子** 決済レイヤー、
- **オンチェーン AI/RL** アドバイザリープリミティブ（QCAI）、そして
- クロス VM 呼び出しを備えた **トリプル VM** ランタイム。

汎用的なオプティミスティック / zk ロールアップだけが必要であれば、どのキットでも構いません。ロールアップの決済を **検証可能・量子耐性・AI 対応** にしたいのであれば、それを表現できる唯一のキットがこれです。TypeScript、Python、Go、Rust、Java で利用できます。

| 差別化要因 | ステータス | ここでしか実現できない理由 |
| --- | --- | --- |
| **量子耐性決済レシート** | 🟢 唯一無二（先行者） | ポスト量子 L1 が必要 — 非 PQC のベースレイヤーでは不可能 |
| **QCAI ロールアップコパイロット** | 🟢 チェーンを通じて唯一無二 | QoreChain 限定のオンチェーン AI/RL エンドポイントをラップ |
| **マルチ VM クロス VM 呼び出し** | 🟡 際立った特徴 | QoreChain は EVM + CosmWasm + SVM を 1 つのチェーンで実行 |

---

## 1. 量子耐性決済レシート

> 🟢 **唯一無二。** 非ポスト量子 L1 上に構築されたロールアップキットでは、これを提供できません。

ロールアップが決済バッチをアンカーすると、QoreChain はそのステートルートを **ポスト量子（ML-DSA-87 / Dilithium-5、FIPS-204）** 署名のもとでメインチェーンにコミットします。RDK はそのアンカーを、誰もが **完全にオフラインで** 検証できる **ポータブルなレシート** に変換します。ノードも不要、キットへの信頼も不要、ただ数学があるだけです。

このレシートは 2 つのことを証明します。バッチのステートルートがアンカーされたものと一致すること（バインディング）、そしてアンカーがレイヤー作成者の登録済みポスト量子鍵で署名されていること（真正性）です。署名は正規メッセージ `layer_id || layer_height(8-byte big-endian) || state_root || validator_set_hash` を対象とします。

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.network" }, // your QoreChain node REST
});

// Build a portable receipt for batch #42 of "my-rollup".
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
// → { algorithm: "ML-DSA-87", stateRoot, layerHeight, pqcSignature, creator, ... }

// Verify it — fetches the creator's PQC key from the chain.
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);                 // true
console.log(result.checks.pqcSignature);   // Dilithium-5 signature verified
console.log(result.checks.stateRootBinding); // batch root == anchored root
```

**完全にオフライン** — レシートと作成者の公開鍵を誰かに渡せば、エアギャップされたマシン上でも、ネットワークに触れることなく検証できます。

```ts
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "a1b2…", // the layer creator's ML-DSA-87 key (hex)
});
// result.valid === true, with zero network calls
```

同じレシートは **5 つすべての言語でバイト単位まで一致して検証されます**（TypeScript 以外のクライアントはチェーン自身の `qorechain-pqc` ライブラリを使用します）。そのため、TypeScript サービスで生成されたレシートは、Go の監査ツールや Java のバックエンドでも同一に検証されます。[量子耐性決済レシート](/rollups/settlement-receipts) を参照してください。

---

## 2. QCAI ロールアップコパイロット

> 🟢 **チェーンを通じて唯一無二。** 他のネットワークが単純に持たないオンチェーン AI/RL エンドポイント上に構築されています。

QoreChain はネットワークレベルの AI/RL サービスをオンチェーンで実行します。手数料ポリシーエージェント、ネットワーク推奨、不正調査、サーキットブレーカーなどです。コパイロットはそれらを集約し、1 つのロールアップに対する単一でレビュー可能な平易な言葉のビューにします。読み取り専用かつベストエフォートで、アドバイザリーサービスに到達できない場合は、失敗するのではなく警告へとグレースフルに低下します。

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "mainnet", endpoints: { rest, evmRpc } });

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

他のキットにはラップする対象がありません — アドバイザリーデータは QoreChain のプリミティブです。[QCAI コパイロット](/rollups/qcai-copilot) を参照してください。

---

## 3. マルチ VM クロス VM 呼び出し

> 🟡 **際立った特徴。** QoreChain は EVM、CosmWasm、SVM を 1 つのチェーンで実行し、EVM → CosmWasm をブリッジするプリコンパイルを備えています。

あなたの EVM（Solidity）ロールアップコントラクトは、`0x…0901` にある固定のプリコンパイルを通じて、既存の **CosmWasm** コントラクトを呼び出すことができます。RDK が代わりにコールデータを構築するため、CosmWasm のオラクル、トークン、レジストリを再実装することなく Solidity から再利用できます。

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

`npm create qorechain-rollup my-app -- --template multivm-rollup` でスターターをスキャフォールドできます。（EVM↔CosmWasm のみ。SVM のクロス呼び出しは別です。）[マルチ VM](/rollups/multi-vm) を参照してください。

---

## 期待されるその他すべて

差別化要因を超えて、RDK はテーブルステークスも提供します。共有のゴールデンベクターに対して検証された 5 つの公開言語クライアント、5 つのプリセットプロファイルと完全な互換性マトリックス、決済バッチおよびライフサイクル管理、ネイティブなデータ可用性、オプティミスティックロールアップ向けの **ウォッチタワー** 自動チャレンジャー、そして `qorollup` オペレーター CLI です。

## 次へ

- [ロールアップのデプロイ](/rollups/deploying-a-rollup) — 言語ごとのインストールと、ゼロからライブのテストネットロールアップまで。
- [量子耐性決済レシート](/rollups/settlement-receipts) ·
  [QCAI コパイロット](/rollups/qcai-copilot) ·
  [マルチ VM](/rollups/multi-vm) ·
  [ウォッチタワー](/rollups/watchtower) — 詳細な解説。
