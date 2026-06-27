---
slug: /sdk/why
title: QoreChain SDK を選ぶ理由
sidebar_label: QoreChain SDK を選ぶ理由
sidebar_position: 2
---

# QoreChain SDK を選ぶ理由

QoreChain SDK は、現代的なマルチチェーン SDK が提供するすべてを備えています。すなわち、すべてのモジュールに対する型付きメッセージ、型付きクエリ、1 つのニーモニックから 3 つの VM 向けのアカウント、自動ガス、エラーデコード、サブスクリプション、ウォレット、そして React キットです。

しかし、3 つの機能は **QoreChain でのみ実現可能** です。なぜなら、それらは他のどの Layer 1 にもないプロトコル機能の上に構築されているからです。すなわち、オンチェーン AI、ネイティブブリッジを備えた 3 つの同居 VM、そして必須のポスト量子暗号です。これらこそが、ここで構築する理由です。

---

## 1. AI によるプリフライトリスクスコアリング

**ブロードキャストする前に、オンチェーン AI でトランザクションをスキャンします。**

QoreChain は AI リスク分析を EVM プリコンパイルとして提供します。SDK が代わりにそれらを呼び出し、ガスとリスク/異常判定を 1 回の呼び出しで返します。これにより、ウォレットや dApp は署名する *前* に警告（またはブロック）できます。

```ts
import { createClient } from "@qorechain/sdk";
import { simulateWithRiskScore } from "@qorechain/evm";

const client = createClient({ network: "mainnet", endpoints: { evmRpc } });

const preflight = await simulateWithRiskScore(client.evm, {
  from: account.address,
  to: contractAddress,
  data: calldata,
  value: 0n,
});

console.log(preflight.gas);            // estimated gas
console.log(preflight.risk.level);     // on-chain risk level
console.log(preflight.anomaly.flagged);// anomalous pattern?
if (!preflight.safe) {
  // advisory verdict — set your own policy
  console.warn("Transaction flagged by on-chain AI risk scoring");
}
```

**ユニークである理由:** スコアリングは決定論的なプリコンパイルとして *チェーン内部* で実行されます（`aiRiskScore` は `0x…0B01`、`aiAnomalyCheck` は `0x…0B02`）。他のネットワークでは、オフチェーンで非決定論的な AI サービスを後付けすることしかできません。これは、署名される前にトランザクションを AI でスクリーニングし、オンチェーンの結果を返す最初の SDK です。[AI プリフライト](/sdk/guides/ai-preflight) を参照してください。

---

## 2. 統合されたクロス VM 呼び出し — 1 つのアカウント、3 つの VM、1 つのトランザクション

**任意の VM 上のコントラクトを呼び出し、3 つすべてにまたがる呼び出しをアトミックにバッチ処理します。**

QoreChain は、CosmWasm、EVM、SVM のコントラクトを同じチェーン上でネイティブなクロス VM ブリッジとともに実行します。SDK は、そのいずれかを呼び出すための単一のインターフェースを公開します。さらに、複数のクロス VM 呼び出しを、一度署名するだけの単一のアトミックなトランザクションにまとめます。

```ts
import { createCrossVMClient } from "@qorechain/sdk";

const crossVM = createCrossVMClient(tx, { query: client.query });

// Call an EVM contract from a native account (payload ABI-encoded for you).
await crossVM.call({
  targetVm: "evm",
  targetContract: "0xToken…",
  evm: { abi, functionName: "transfer", args: [recipient, amount] },
});

// One signature, three VMs, atomic: EVM → SVM → CosmWasm.
await crossVM.callAtomic([
  { targetVm: "evm", targetContract: "0x…", evm: { abi, functionName: "approve", args } },
  { targetVm: "svm", targetContract: "Prog…", svm: { data } },
  { targetVm: "cosmwasm", targetContract: "qor1…", cosmwasm: { swap: {} } },
]);
```

**ユニークである理由:** QoreChain は、3 つの同居 VM とネイティブブリッジモジュール（`crossvm` と `CrossVMBridge` プリコンパイル）を備えた唯一の L1 です。単一 VM のチェーンは「1 つのアカウント、3 つの VM、1 つのアトミックなトランザクション」を表現できず、それらの SDK にはラップするものが何もありません。一度書けば、どの VM でも呼び出せます。[クロス VM 呼び出し](/sdk/guides/cross-vm) を参照してください。

---

## 3. デフォルトで量子安全

**1 回の呼び出しで署名者をポスト量子保護されたものにします。**

QoreChain は、ハイブリッドなポスト量子署名（ML-DSA-87 + クラシック）をプロトコルレベルで強制します。SDK はそれらの採用を 1 行で可能にします。すなわち、チェック、登録、ハイブリッド署名への移行です。さらに、ユーザーに保護されていることを示す React バッジも提供します。

```ts
import { ensurePqcRegistered, migrateToHybrid } from "@qorechain/sdk";

// Idempotent: registers the signer's ML-DSA-87 key on-chain if not already.
const { alreadyRegistered, txHash } = await ensurePqcRegistered(tx, { pqcKeypair });

// Switch the signing path to hybrid (classical + post-quantum).
const hybrid = await migrateToHybrid(tx, { pqcKeypair });
await hybrid.send(messages);
```

```tsx
import { QuantumSafeBadge } from "@qorechain/react";

// Shows a "Quantum-safe" indicator when the address has a registered PQC key.
<QuantumSafeBadge address={account.address} />
```

**ユニークである理由:** ポスト量子暗号は QoreChain ではネイティブかつ必須であり、実験ではありません。これは「デフォルトで量子安全」が単一の呼び出しとドロップイン可能なバッジで実現される最初の SDK です。[量子安全](/sdk/guides/quantum-safe) を参照してください。

---

## その他すべても

3 つの差別化要因に加えて、SDK は **TypeScript、Python、Go、Rust、Java** にわたってチェーンの全機能をカバーします。すなわち、すべてのモジュール（`multilayer` 経由のサイドチェーン/ペイチェーン、`rdk` 経由のロールアップを含む）に対する型付きコンポーザー、型付きクエリ、tx ライフサイクル、サブスクリプション、ブラウザウォレット、そして [`@qorechain/react`](/sdk/guides/react) フックキットです。

構築の準備はできましたか？[クイックスタート](/sdk/quickstart) から始めましょう。
