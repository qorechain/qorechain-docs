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

**ブロードキャストする前に、オンチェーン AI でトランザクションをスキャンします**
(対象ネットワークで AI プリコンパイルが有効である必要がありますが、パブリック
ネットワークではまだ有効ではありません)。

QoreChain は AI リスク分析を EVM プリコンパイルに組み込んでいます。SDK がそれらを
代わりに呼び出し、ガスとリスク/異常判定を 1 回の呼び出しで返します — そのため
ウォレットや dApp は署名の *前に* 警告(またはブロック)できます。AI プリコンパイルは
メインネットでもテストネットでも**まだ有効ではありません**(
[EVM プリコンパイル: ネットワークの状況](/developer-guide/evm-precompiles#network-status)
を参照)。

```ts
import { createEvmClient, simulateWithRiskScore } from "@qorechain/evm";

const { publicClient } = await createEvmClient({ endpoints: { evmRpc } });

const preflight = await simulateWithRiskScore(publicClient, {
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

**他との違い:** スコアリングは、オフチェーンのサービスとしてではなく、決定論的な
プリコンパイル(`aiRiskScore` は `0x…0B01`、`aiAnomalyCheck` は `0x…0B02`)として
*チェーンの内部で* 実行されるように設計されています。これらのプリコンパイルが
有効化されるまで、上記のヘルパーはパブリックネットワークでエラーを投げます
(`returned no data ("0x")`)。詳細は [AI プリフライト](/sdk/guides/ai-preflight) を
参照してください。

---

## 2. 統合クロス VM 呼び出し — 1 つのアカウント、3 つの VM、1 つのトランザクション

**任意の VM 上のコントラクトを呼び出し、3 つの VM をまたぐ呼び出しをアトミックにバッチ処理します。**

QoreChain は QoreChain Native、EVM、SVM のコントラクトを、ネイティブなクロス VM ブリッジを
備えた同一チェーン上で実行します。SDK はそのいずれをも呼び出せる単一のインター
フェースを公開しており、複数のクロス VM 呼び出しを 1 回の署名で済む単一のアトミック
トランザクションにまとめることもできます。

```ts
import { connectQueryClients, createCrossVMClient } from "@qorechain/sdk";

// rpcClient: a connected consensus-RPC client (the CosmJS RPC client type).
const crossVM = createCrossVMClient(tx, { query: connectQueryClients(rpcClient).crossvm });

// Call an EVM contract from a native account (payload ABI-encoded for you).
await crossVM.call({
  targetVm: "evm",
  targetContract: "0xToken…",
  evm: { abi, functionName: "transfer", args: [recipient, amount] },
});

// One signature, three VMs, atomic: EVM → SVM → QoreChain Native.
await crossVM.callAtomic([
  { targetVm: "evm", targetContract: "0x…", evm: { abi, functionName: "approve", args } },
  { targetVm: "svm", targetContract: "Prog…", svm: { data } },
  { targetVm: "cosmwasm", targetContract: "qor1…", cosmwasm: { swap: {} } },
]);
```

**他との違い:** QoreChain は、ネイティブブリッジモジュール(`crossvm`、および有効化
後は `CrossVMBridge` プリコンパイル)を備えた 3 つの共存 VM を実行するため、1 つの
SDK インターフェースで 3 つすべてを扱えます。単一 VM のチェーンには、ラップできる
同等のものがありません。現時点では、呼び出しの到達範囲は対象とするレーンによって
制限されます: `MsgCrossVMCall` はメインネットで無効化されており、SVM トランザクションは
無効化されており、QoreChain Native のアップロードとインスタンス化は許可制です。詳細は
[クロス VM 呼び出し](/sdk/guides/cross-vm) を参照してください。

---

## 3. デフォルトで量子安全

**署名者を 1 回の呼び出しでポスト量子保護にします。**

QoreChain はハイブリッドなポスト量子署名(ML-DSA-87 + 古典)をプロトコルレベルで
強制しています。SDK はその導入をワンライナーにします: チェック、登録、ハイブリッド
署名への移行 — さらに、保護されていることをユーザーに示す React バッジも用意されて
います。

```ts
import { ensurePqcRegistered, migrateToHybrid } from "@qorechain/sdk";

// Registers the signer's ML-DSA-87 key on-chain unless the chain already has it:
// it reads the status over REST first and never registers blind.
const rest = "https://api.qore.host";
const { alreadyRegistered, txHash } = await ensurePqcRegistered(tx, { pqcKeypair, rest });

// Switch the signing path to hybrid (classical + post-quantum).
const hybrid = await migrateToHybrid(tx, { pqcKeypair, rest });
await hybrid.signAndBroadcastHybrid({
  registry, signer, messages, fee, chainId, accountNumber, sequence,
  rest: "https://api.qore.host", // resolves the v1/v2 PQC sign-bytes form
  transport,
});
```

```tsx
import { QuantumSafeBadge } from "@qorechain/react";

// Shows a "Quantum-safe" indicator when the address has a registered PQC key
// (read over REST, so it works on the public endpoints from `@qorechain/react` 0.9.0).
<QuantumSafeBadge address={account.address} />
```

**重要な理由:** ポスト量子暗号は QoreChain のネイティブパスではネイティブかつ必須
であり、実験的なものではありません。SDK はその導入を、登録の呼び出しとハイブリッド
送信パスだけに集約します。登録は明示的に行います: 最初のトランザクションでの自動
登録はありません。詳細は [量子安全](/sdk/guides/quantum-safe) を参照してください。

---

## 4. 統合 eth ネイティブアカウント — 1 つの鍵、3 つのアドレス、1 つの残高

**1 つの `eth_secp256k1` 鍵が、3 つのレーンすべてで 1 つの 20 バイト ID になります。**
(SDK 0.6.0、チェーン v3.1.83。)SVM トランザクションレーンは現在ネットワーク全体で
無効化されており、EVM レーンには
[認可ウィンドウ](/sdk/guides/evm#evm-window)が必要です。共有残高とアドレスの
マッピングは、いずれの場合も有効です。

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"  bech32 — Native lane
account.evm;    // "0x…"    EIP-55 — EVM lane
account.svm;    // base58   — SVM lane (same 20 bytes + 12 zero bytes)
// A deposit to ANY of the three lands in ONE balance,
// and the same key signs on every enabled lane (signHybridEth on the Native path).
```

**ユニークな理由:** 他所のマルチ VM 構成では、ランタイムごとに独自のアカウント空間が
あり、資金はレーンごとに取り残されてしまいます。QoreChain は 1 つの 20 バイト ID を
共有残高付きで 3 通りに表現します — ウォレットが「あるレーンには資金があるのに別の
レーンにはない」状態には決してなりません。Phantom などの外部ウォレットは、制限付きのオーセンティケーターとしてこの ID に
リンクできます（[オーセンティケーター](/sdk/guides/authenticators)）。詳細は
[統合アカウント](/sdk/concepts/accounts-pqc#unified-accounts) を参照してください。

---

## 5. オーセンティケーターレーン — PQC を手放さない委任支出

**リンクされた Phantom や MetaMask の鍵が、PQC 必須の正規アカウントから、制限の
範囲内で、リレイヤー経由で支出します。**(SDK 0.7.0、チェーン v3.1.85。)

:::caution まだライブネットワークでは利用できません
`abstractaccount` モジュールは `qorechain-vladi` と `qorechain-diana` で無効化されて
おり(`GET /qorechain/abstractaccount/v1/config` は `"enabled": false` を返します)、
チェーン v3.2.0 以降はこのフラグがすべてのパスで強制されるため、鍵をリンクすることは
できず、以下のレーンも利用できません。詳細は
[オーセンティケーターガイド](/sdk/guides/authenticators) を参照してください。
:::

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

**重要な理由:** モジュールが有効化されると、すべての支出はオンチェーンのパーミッション
分類体系、`SpendingRule` による制限、そして有効期限によって制約されます — 最小権限
かつ取り消し可能でありながら、アカウント自体はポスト量子保護を維持します。詳細は
[オーセンティケーターと委任支出](/sdk/guides/authenticators) を参照してください。

---

## それ以外もすべて

5 つの差別化要素に加えて、SDK は **TypeScript、Python、Go、Rust、Java** にわたって
チェーンの全機能をカバーします: 全モジュール向けの型付きコンポーザー(`multilayer`
経由のサイドチェーン/ペイチェーン、`rdk` 経由のロールアップを含む)、型付きクエリ、
トランザクションのライフサイクル、サブスクリプション、ブラウザウォレット、そして
[`@qorechain/react`](/sdk/guides/react) フックキット。

開発を始める準備はできましたか? [クイックスタート](/sdk/quickstart) から始めましょう。
