---
slug: /sdk/quickstart
title: クイックスタート
sidebar_label: クイックスタート
sidebar_position: 3
---

# クイックスタート

ゼロからトランザクション送信まで。このページでは TypeScript SDK
（`@qorechain/sdk`）を使用します。Python、Go、Rust での接続と読み取りの短い
スニペットは末尾に掲載しています。

## 1. 接続

`createClient()` はネットワークを解決し、読み取りクライアント、手数料ヘルパー、
遅延初期化される署名エントリーポイントを構成します。デフォルトでは公開テストネット
（`qorechain-diana`）を対象とします。デフォルトのエンドポイントは
**localhost** を指すため、実際のノードと通信するには `endpoints` を渡してください。

```ts
import { createClient } from "@qorechain/sdk";

// Testnet (chain id "qorechain-diana"), default localhost endpoints.
const client = createClient();

// Point at a real node by overriding endpoints.
const remote = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",   // Native REST (LCD)
    rpc: "https://rpc-testnet.qore.host",    // consensus RPC (for signing)
    evmRpc: "https://evm-testnet.qore.host", // EVM + qor_ JSON-RPC
  },
});
```

メインネット（チェーン ID `qorechain-vladi`）は稼働中です。メインネットを選択し、
localhost のデフォルトを公開エンドポイント（または自前のノード）で上書きしてください：

```ts
const main = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});
```

## 2. アカウントの導出

1 つのニーモニックから、独立した導出パスを介して Native（`qor1…`）、EVM（`0x…`）、
SVM（base58）の各アカウントが導出されます。

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Native secp256k1, coin type 118)
```

0.6.0 以降では、代わりに **統合 eth-native アカウント**を導出できます — 1 つの
`eth_secp256k1` 鍵が 3 つのアドレス（`qor1…`、`0x…`、SVM base58）すべてとして
表現され、残高は 1 つに共有されます：

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const unified = await deriveUnifiedAccount(mnemonic);
console.log(unified.cosmos); // "qor1..."
console.log(unified.evm);    // "0x..."
console.log(unified.svm);    // base58 (same 20 bytes + 12 zero bytes)
```

EVM/SVM の導出、統合アカウント、導出パスの完全な一覧表については、
[アカウントと PQC 署名](/sdk/concepts/accounts-pqc)を参照してください。

## 3. 残高の読み取り

```ts
// Native bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. QOR の送金

Native アカウントを導出し、その秘密鍵を署名者（signer）に変換し、`TxClient`
に接続してトークンを送信します。QOR を基本単位の `uqor` に変換するには
`toBase("1.5")` を使用します。

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  toBase,
} from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rpc: "https://rpc-testnet.qore.host",
    rest: "https://api-testnet.qore.host",
  },
});

const account = await deriveNativeAccount(mnemonic);

// Adapt the raw secp256k1 key into an offline signer bound to the "qor" prefix.
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");

// Connect a tx client at the consensus RPC endpoint.
const tx = await client.connectTx(signer);

// Estimate a fee, then send 1.5 QOR.
const fee = await client.fees.estimate(); // or "fast" | "normal" | "slow"
const result = await tx.bankSend(
  "qor1recipientaddress...",
  [{ denom: "uqor", amount: toBase("1.5") }],
  { fee },
);

console.log(result.transactionHash);
```

`toBase("1.5")` は `"1500000"` を返します（QOR の基本単位 `uqor` は 10^6 です）。

:::info 稼働中ネットワークでのハイブリッド署名
メインネットおよびテストネットでは、Native パスに**ハイブリッド**（古典 +
ML-DSA-87）署名拡張が必須です — `buildHybridTx` /
`signAndBroadcastHybrid` を使用するか、統合 eth-native アカウントの場合は
`signHybridEth` を使用してください。
[ハイブリッド署名](/sdk/concepts/accounts-pqc#hybrid-signing)を参照してください。
:::

## その他の言語：接続と読み取り

以下は同じネットワークプリセットと読み取り API を提供します。

### Python

```python
from qorechain import create_client

client = create_client()  # testnet preset (localhost endpoints)
print(client.network.chain_id)  # "qorechain-diana"

balances = client.rest.get_all_balances("qor1...")
stats = client.qor.get_ai_stats()
client.close()
```

### Go

```go
import "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"

c, err := client.CreateClient(client.Options{}) // defaults to "testnet"
if err != nil {
    panic(err)
}
fmt.Println(c.Network.ChainID) // qorechain-diana

balances, err := c.REST.GetAllBalances("qor1...")
stats, err := c.Qor.GetAIStats()
```

### Rust

```rust
use qorechain::ClientBuilder;

#[tokio::main]
async fn main() -> qorechain::Result<()> {
    let client = ClientBuilder::new().build()?; // defaults to "testnet"
    let balances = client.rest.get_all_balances("qor1...").await?;
    let stats = client.qor.get_ai_stats().await?;
    let _ = (balances, stats);
    Ok(())
}
```

## 次のステップ

- [ガイド](/sdk/guides/evm) — 各 VM（EVM、SVM、CosmWasm、クロス VM）の使い方。
- [アカウントと PQC 署名](/sdk/concepts/accounts-pqc) — HD 導出、統合
  eth-native アカウント、ポスト量子署名。
- [オーセンティケータと委任支出](/sdk/guides/authenticators) — リンク済みの
  Phantom/MetaMask 鍵にリレイヤー経由で支出させる方法。
- [ネットワークとエンドポイントのリファレンス](/sdk/reference/network)。
- [サンプル集](/sdk/examples) — 上記の各フローの実行可能なスニペット。
