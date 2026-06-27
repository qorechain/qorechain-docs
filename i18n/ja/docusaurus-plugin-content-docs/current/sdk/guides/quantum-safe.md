---
slug: /sdk/guides/quantum-safe
title: デフォルトで量子耐性
sidebar_label: 量子耐性
sidebar_position: 6
---

# デフォルトで量子耐性

QoreChain はポスト量子暗号を**第一級**の署名方式として扱います。
アカウントは**ML-DSA-87（Dilithium-5、NIST FIPS 204）**鍵をオンチェーンに登録し、
その後トランザクションは**ハイブリッド**署名（通常の
古典的な secp256k1 署名**に加えて** ML-DSA-87 署名）を持つことができます。チェーンの ante
handler は両方を検証するため、量子耐性アカウントは古典的な検証と完全な互換性を保ちながら、
将来の量子敵対者に対する保護を獲得します。

SDK はこれを小さく冪等な API にまとめており、dApp は
**デフォルトで量子耐性**になります。PQC で保護するための呼び出しはたった 1 回です。

## ステータスの確認

`isPqcRegistered` / `getPqcStatus` は、`qor_getPQCKeyStatus` JSON-RPC メソッドを介して
アドレスに登録済みの PQC 鍵があるかどうかを読み取ります。これらは
`QorClient` または `createClient` で合成したクライアントのいずれかを受け取ります:

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({ network: "mainnet", endpoints: { /* … */ } });

const safe = await isPqcRegistered(client, "qor1…");
const status = await getPqcStatus(client, "qor1…");
// status: { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

同じステータスは EVM 側でも、
`0x0000000000000000000000000000000000000A02` にある
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
プリコンパイル（`@qorechain/evm` では `pqcKeyStatus` として公開）を介して読み取れます。
上記のヘルパーは viem ピアを必要としない JSON-RPC メソッドを優先します。

## 1 回の呼び出しで登録

`ensurePqcRegistered` はアカウントを量子耐性にします。これは**冪等**です。ステータス
ソースを渡すと、鍵がすでに登録されている場合は登録をスキップするため、
アプリ起動のたびに呼び出しても安全です。

```ts
import { generatePqcKeypair, ensurePqcRegistered } from "@qorechain/sdk";

const tx = await client.connectTx(signer);
const pqcKeypair = generatePqcKeypair(); // or derive deterministically from the wallet

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  statusSource: client, // makes the call idempotent (skips if already registered)
});
// res: { alreadyRegistered: boolean; txHash?: string }
```

内部では、署名者の Dilithium 公開鍵（`pqcKeypair` から）に加えて、オプションで
アカウントの ECDSA 公開鍵を用いて `MsgRegisterPQCKey` を構築しブロードキャストします。

## ハイブリッド署名

`migrateToHybrid` は登録を保証し、既存の `buildHybridTx` / `signAndBroadcastHybrid`
ビルダーに鍵ペアを事前バインドしたハイブリッド送信パスを返します:

```ts
import { migrateToHybrid } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, { pqcKeypair, statusSource: client });

await hybrid.signAndBroadcastHybrid({
  registry,
  signer,          // classical secp256k1 direct signer
  messages,
  fee,
  chainId,
  accountNumber,
  sequence,
  transport,       // a connected broadcast transport (e.g. StargateClient)
});
```

## 鍵のローテーション

PQC 鍵をローテーションする必要がある場合（アルゴリズムのアップグレードや鍵の漏洩）は、
`migratePqcKey` を使用します。これは古い鍵と新しい鍵の両方の所有を証明する
`MsgMigratePQCKey` をブロードキャストします:

```ts
import { migratePqcKey } from "@qorechain/sdk";

await migratePqcKey(tx, {
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
});
```

## UI 内で

[`@qorechain/react`](/sdk/guides/react) キットはこれらすべてを React で公開しています。
`usePqcStatus` フックと `<QuantumSafeBadge/>` コンポーネントは、接続中のアカウントに
登録済みの PQC 鍵がある場合に**量子耐性**インジケーターを表示します。
