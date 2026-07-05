---
slug: /sdk/why
title: QoreChain SDK を選ぶ理由
sidebar_label: QoreChain SDK を選ぶ理由
sidebar_position: 2
---

# QoreChain SDK を選ぶ理由

QoreChain SDK は、モダンなマルチチェーン SDK に求められるすべてを提供します —
全モジュール向けの型付きメッセージ、型付きクエリ、1 つのニーモニックから 3 つの
VM のアカウントを生成、自動ガス、エラーデコード、サブスクリプション、ウォレット、
そして React キット。

しかし、5 つの機能は **QoreChain でしか実現できません**。これらは他のどの Layer 1
にもないプロトコル機能の上に構築されているためです: オンチェーン AI、ネイティブ
ブリッジを備えた 3 つの共存 VM、必須のポスト量子暗号、3 つの VM レーンすべてに
またがる 1 つの 20 バイト ID、そして外部ウォレット鍵のための PQC を損なわない
委任支出。これこそが、ここで開発する理由です。

---

## 1. AI プリフライト・リスクスコアリング

**ブロードキャストする前に、オンチェーン AI でトランザクションをスキャンします。**

QoreChain は AI リスク分析を EVM プリコンパイルとして提供しています。SDK がそれらを
代わりに呼び出し、ガスとリスク/異常判定を 1 回の呼び出しで返します — そのため
ウォレットや dApp は署名の *前に* 警告(またはブロック)できます。

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

**ユニークな理由:** スコアリングは決定論的なプリコンパイル(`aiRiskScore` は
`0x…0B01`、`aiAnomalyCheck` は `0x…0B02`)として *チェーンの内部で* 実行されます。
他のネットワークでは、オフチェーンで非決定論的な AI サービスを後付けすることしか
できません。これは、署名前にトランザクションを AI 審査し、その結果をオンチェーンで
得られる初めての SDK です。詳細は [AI プリフライト](/sdk/guides/ai-preflight) を
参照してください。

---

## 2. 統合クロス VM 呼び出し — 1 つのアカウント、3 つの VM、1 つのトランザクション

**任意の VM 上のコントラクトを呼び出し、3 つの VM をまたぐ呼び出しをアトミックにバッチ処理します。**

QoreChain は CosmWasm、EVM、SVM のコントラクトを、ネイティブなクロス VM ブリッジを
備えた同一チェーン上で実行します。SDK はそのいずれをも呼び出せる単一のインター
フェースを公開しており、複数のクロス VM 呼び出しを 1 回の署名で済む単一のアトミック
トランザクションにまとめることもできます。

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

**ユニークな理由:** QoreChain は、3 つの共存 VM とネイティブブリッジモジュール
(`crossvm` + `CrossVMBridge` プリコンパイル)を備えた唯一の L1 です。単一 VM の
チェーンでは「1 つのアカウント、3 つの VM、1 つのアトミックトランザクション」を
表現できません — その SDK にはラップすべきものが存在しないのです。一度書けば、
どの VM でも呼び出せます。詳細は [クロス VM 呼び出し](/sdk/guides/cross-vm) を
参照してください。

---

## 3. デフォルトで量子安全

**署名者を 1 回の呼び出しでポスト量子保護にします。**

QoreChain はハイブリッドなポスト量子署名(ML-DSA-87 + 古典)をプロトコルレベルで
強制しています。SDK はその導入をワンライナーにします: チェック、登録、ハイブリッド
署名への移行 — さらに、保護されていることをユーザーに示す React バッジも用意されて
います。

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

**ユニークな理由:** ポスト量子暗号は QoreChain ではネイティブかつ必須であり、
実験的なものではありません。「デフォルトで量子安全」が 1 回の呼び出しとドロップ
インのバッジだけで実現できる初めての SDK です。詳細は
[量子安全](/sdk/guides/quantum-safe) を参照してください。

---

## 4. 統合 eth ネイティブアカウント — 1 つの鍵、3 つのアドレス、1 つの残高

**1 つの `eth_secp256k1` 鍵が、3 つのレーンすべてで 1 つの 20 バイト ID になります。**
(SDK 0.6.0、チェーン v3.1.83。)

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"  bech32 — Native lane
account.evm;    // "0x…"    EIP-55 — EVM lane
account.svm;    // base58   — SVM lane (same 20 bytes + 12 zero bytes)
// A deposit to ANY of the three lands in ONE balance,
// and the same key spends on every lane (signHybridEth on the Native path).
```

**ユニークな理由:** 他所のマルチ VM 構成では、ランタイムごとに独自のアカウント空間が
あり、資金はレーンごとに取り残されてしまいます。QoreChain は 1 つの 20 バイト ID を
共有残高付きで 3 通りに表現します — ウォレットが「あるレーンには資金があるのに別の
レーンにはない」状態には決してなりません。`connectPhantomUnified` を使えば、Phantom の
署名からこの ID をノンカストディアルにブートストラップすることさえできます。詳細は
[統合アカウント](/sdk/concepts/accounts-pqc#unified-accounts) を参照してください。

---

## 5. オーセンティケーターレーン — PQC を手放さない委任支出

**リンクされた Phantom や MetaMask の鍵が、PQC 必須の正規アカウントから、制限の
範囲内で、リレイヤー経由で支出します。**(SDK 0.7.0、チェーン v3.1.85。)

```ts
import { buildPhantomExecuteCosmos } from "@qorechain/sdk";

// The Phantom key signs a domain-separated digest; a relayer pays fees and
// broadcasts. The external key NEVER produces an ML-DSA co-signature.
const msg = await buildPhantomExecuteCosmos({
  wallet: window.solana,
  relayer: relayerAddress,
  chainId: "qorechain-vladi",
  account: canonicalAccount, // the PQC-required owner
  to: recipient,
  amount: "100uqor",
  nonce, // per-authenticator sequence
});
```

**ユニークな理由:** すべての支出はオンチェーンのパーミッション分類体系、
`SpendingRule` による制限、そして有効期限によって制約されます — 最小権限かつ
取り消し可能でありながら、アカウント自体はポスト量子保護を維持します。詳細は
[オーセンティケーターと委任支出](/sdk/guides/authenticators) を参照してください。

---

## それ以外もすべて

5 つの差別化要素に加えて、SDK は **TypeScript、Python、Go、Rust、Java** にわたって
チェーンの全機能をカバーします: 全モジュール向けの型付きコンポーザー(`multilayer`
経由のサイドチェーン/ペイチェーン、`rdk` 経由のロールアップを含む)、型付きクエリ、
トランザクションのライフサイクル、サブスクリプション、ブラウザウォレット、そして
[`@qorechain/react`](/sdk/guides/react) フックキット。

開発を始める準備はできましたか? [クイックスタート](/sdk/quickstart) から始めましょう。
