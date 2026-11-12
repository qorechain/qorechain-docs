---
slug: /developer-guide/cross-vm-reference
title: クロス VM 呼び出しリファレンス (v3.2.8)
sidebar_label: クロス VM リファレンス
sidebar_position: 9
---

# クロス VM 呼び出しリファレンス (v3.2.8)

クロス VM 呼び出しは、ある仮想マシン上のコードが別の仮想マシン上のコントラクトを実行できるようにする仕組みです。たとえば、アカウントまたは QoreChain Native コントラクトが EVM コントラクトを呼び出す、アカウントが QoreChain Native (CosmWasm) コントラクトを呼び出す、Solidity コントラクトが QoreChain Native コントラクトを呼び出す、といった場合です。呼び出し方は 2 通りあります。**同期**呼び出しは自分のトランザクション内で実行され、結果がすぐに返ります。**非同期**呼び出しはキューに入れられ、後のブロックで実行されます。

このページは、リリース v3.2.8 のフィールド、コスト、制限のリファレンスで、方向ごとの実例を載せています。概念、ライフサイクル、以前の挙動は[クロス VM 相互運用性](/developer-guide/cross-vm-interoperability)に、SDK のウォークスルーは [Cross-VM ガイド](/sdk/guides/cross-vm)にあります。

:::note v3.2.8 が稼働している場所
**`qorechain-diana`** テストネットは 2026 年 11 月 12 日から **v3.2.8** で稼働しています。**`qorechain-vladi`** メインネットはまだ適用しておらず、メインネットでは `MsgCrossVMCall` はオフになっています。以下で「v3.2.8」と記された内容は、当面はテストネットの挙動です。
:::

:::caution 呼び出しメッセージは今すぐ使えるか
テストネットでは、アップグレードによって `MsgCrossVMCall` が一時停止されていました。ガバナンス提案 37 が可決されて停止が解除されたため、テストネットでは呼び出しが開放されています（2026 年 11 月 12 日に確認。サーキットブレーカーのリストには `/cosmwasm.wasm.v1.MsgStoreCode` のみが含まれています）。メインネットではオフのままです。ある時点で呼び出しが使えるかどうかは、モジュールパラメータ（`enabled`）とサーキットブレーカーのリストの 2 つで分かります。何かを構築する前に両方を確認してください。

```bash
# Module parameters: look for "enabled": true
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params

# Circuit breaker list: the call is paused while this contains /qorechain.crossvm.v1.MsgCrossVMCall
curl -s https://api-testnet.qore.host/cosmos/circuit/v1/disable_list
```

リストのルートは REST では `disable_list` と綴ります（`disabled_list` の綴りは `501` を返します）。ノード上のコマンドライン相当は `qorechaind query circuit disabled-list` です。呼び出しが一時停止されている間、それを含むトランザクションは拒否され、キューに入った呼び出しは、先に停止が解除されない限りタイムアウトするまで保留のままになります。提案 37 が可決される前は、リストに `/qorechain.crossvm.v1.MsgCrossVMCall` が含まれていましたが、テストネットでは現在含まれていません。送信した内容は[テストネットでの検証](#tested)を参照してください。
:::

## なぜ重要か {#why}

- **コストが予測できます。** QoreChain Native へのキュー呼び出しは、価格が事前に分かります。コントラクトの作業量と許容する最大の混雑係数を指定すると、代金はエスクローに保持され、使われなかった分は返金されます。
- **1 つのアカウントが他を押しのけることはできません。** 送信者は同時に最大 100 件までキューに入れられるため、共有キューは使える状態に保たれます。
- **失敗した呼び出しが無料になることはありません。** 失敗した呼び出しも、どの方向でも、行った作業の分を支払います。そのため、失敗を捕捉して同じガスで再試行する方法は通用しません。
- **EVM 側はウィンドウの範囲内に収まります。** 自分で署名していない EVM への呼び出しと、`0x0901` の EVM ブリッジは、開いている [EVM 認可ウィンドウ](/developer-guide/evm-window-reference)によってのみ受理されます。

## 同期呼び出しと非同期呼び出し {#sync-async}

| | 同期（デフォルト） | 非同期（`async = true`） |
| --- | --- | --- |
| 実行されるタイミング | 自分のトランザクション内 | 後のブロックの終了時に、キューから |
| ガス | トランザクション自身のガス | 設定された前払い予算（[コスト](#cost)を参照） |
| 結果 | トランザクションのレスポンスの `data` フィールドで返される | 返されない。完了したメッセージを ID で読み取る |
| ターゲットが失敗した場合 | トランザクション全体が取り消される | その呼び出しだけが `failed` として記録され、自分のトランザクションは残る |
| 資金 | QoreChain Native ターゲットには `funds` を添付できる | 同じ。資金を運べないレーンへの資金付き非同期呼び出しは、送信時に拒否される |
| 向いている用途 | 結果がすぐに必要なあらゆる処理 | 投げっぱなしの処理と、ガスを上限で抑えたい呼び出し |

キューに入ったメッセージは `pending` から `executed`、`failed`、`timed_out` のいずれかに遷移します。`queue_timeout_blocks`（テストネットでは 100）を過ぎるとタイムアウトします。キューは古いものから順に実行され、ブロック終了時の処理は 1 ブロックあたり最大 50 件を実行します。

### 誰が誰を呼ぶか、同期か非同期か {#who-calls-whom}

どちらのモードを使えるかは、誰が呼び出しをディスパッチするかによって決まります。

| 呼び出し元 | ターゲット | 同期 | 非同期 |
| --- | --- | --- | --- |
| アカウント（トランザクションに署名） | EVM、QoreChain Native | 可（デフォルト） | 可 |
| QoreChain Native コントラクトが自分自身として `MsgCrossVMCall` をディスパッチ | EVM | 可（`async` が false、デフォルト） | 可 |
| QoreChain Native コントラクトが自分自身として `MsgCrossVMCall` をディスパッチ | QoreChain Native | 拒否（自分のレーン） | 拒否（自分のレーン） |
| `0x0901` の EVM ブリッジから呼び出されたコントラクト（ブリッジの下位） | SVM | 可 | 使用されない |
| `0x0901` の EVM ブリッジから呼び出されたコントラクト（ブリッジの下位） | EVM | 使用されない | 可 |

自分自身として `MsgCrossVMCall` をディスパッチする QoreChain Native コントラクトは、どちらの方式でも EVM を呼び出せます。同期（`async` が false、デフォルト）はトランザクション自身のガスで実行され、結果は `MsgCrossVMCallResponse.data` で返り、失敗するとトランザクション全体が取り消されます。非同期は呼び出しをキューに入れます。どちらも以前にテストネットで実行しており、同期呼び出しは高さ 9,795,779、非同期呼び出しは高さ 9,795,783 でした。

「SVM へは同期、EVM へは非同期」という表現が当てはまるのは `0x0901` ブリッジの下位だけです。EVM ブリッジが呼び出したコントラクトがディスパッチする呼び出しは、SVM へ同期で、EVM へ非同期で送られる場合があります。これは、自分自身として動作するコントラクトに対する規則ではなく、そのようなコントラクトは EVM に対してどちらのモードも使えます。

## MsgCrossVMCall のフィールド {#fields}

タイプ URL は `/qorechain.crossvm.v1.MsgCrossVMCall` です。

| フィールド | 番号 | 意味 |
| ----- | ------ | ------- |
| `sender` | 1 | 自分の `qor1...` アドレス。メッセージに署名します。 |
| `source_vm` | 2 | チェーンは無視します。呼び出しの発信元はチェーンが判断します。古いノードがメッセージを受理できるように、引き続き送信されます。 |
| `target_vm` | 3 | `evm`、`cosmwasm`、`svm` のいずれか。自分自身のレーンへの呼び出しは拒否されます。SVM レーンは提案 37 以降テストネットで開放されており、メインネットではオフです。[SVM レーン](/developer-guide/svm-lane-v328)を参照してください。このページのために SVM への呼び出しは実行していません。 |
| `target_contract` | 4 | EVM アドレス（`0x` と 16 進数 40 桁。プリコンパイルのアドレスは不可）または `qor1...` のコントラクトアドレス。 |
| `payload` | 5 | 呼び出しデータ。EVM 向けは ABI エンコード、QoreChain Native 向けは UTF-8 の JSON execute メッセージ。最大 `max_message_size` バイト（65,536）。 |
| `funds` | 6 | 添付するコイン（QoreChain Native ターゲットのみ）。 |
| `async` | 7 | `true` で呼び出しをキューに入れ、`false`（デフォルト）で今すぐ実行します。 |
| `async_gas_limit` | 8 | v3.2.8、QoreChain Native への非同期呼び出しのみ。キューに入った呼び出しが実行に使うコントラクトのガス単位。`0` または未設定は 500,000 を意味します。250,000 から、キューが 1 ブロックで実行できる上限（デフォルト予算で 1,875,000）まで指定できます。 |
| `async_max_factor` | 9 | v3.2.8、QoreChain Native への非同期呼び出しのみ。支払ってよい混雑係数の上限で、**100 万分率**で表します。`1000000` が 1 倍、`4000000` が 4 倍です。有効範囲は 1,000,000 から 100,000,000（1 倍から 100 倍）で、`4` のような単純な倍数は、何かが実行される前に codespace `crossvm` のコード 2 で拒否されます。`0` または未設定は、送信時の係数の 4 倍（係数が 1 倍なら 4,000,000 の 100 万分率）を意味し、チェーンの上限で頭打ちになります。現在の係数を下回る値は、送信時に拒否されます。 |

コマンドラインでは、新しい 2 つのフィールドは `--async-gas-limit`（整数）と `--async-max-factor`（`2.5` のような小数。コマンドが 100 万分率に変換します）です。生のメッセージ、SDK、REST または JSON の形式では、値は常に 100 万分率で、2.5 倍は `2500000` です。SDK は、倍数を 100 万分率に変換するための `CROSSVM_ASYNC_FACTOR_ONE`（1,000,000）と、送信前に 2 つの値を確認する `validateCrossVmAsyncGas` をエクスポートしています。

## コスト、エスクロー、返金 {#cost}

**QoreChain Native への非同期呼び出し**（v3.2.8）の場合。

1. **エスクロー。** 前払い額は、単位数 × 係数 × ガス価格で、使われずに保持されます。デフォルトでは 500,000 単位 × 4（100 万分率で 4,000,000）× 0.1 uqor = 200,000 uqor、つまり **0.2 QOR** です。これは自分の残高から `crossvm_async_escrow` アカウントに移ります。それだけの使用可能な uqor が必要です。ロックされたベスティングコイン、手数料の付与（fee grant）、他のトークンで支払う手数料ではまかなえず、そのような呼び出しは拒否されます。
2. **キュースロット手数料。** すべての非同期呼び出しは、送信時にガスとしてスロット手数料も支払います。空のキューなら 500,000 ガス、キューが埋まるほど増え、満杯なら 2,000,000 ガスです。ガス価格 0.1 uqor では 0.05 QOR から 0.2 QOR になります。
3. **精算。** 呼び出しが終わると、その時点の係数で使われたガスがエスクローから手数料として支払われ、残りが自分に戻ります。失敗した呼び出しは使った分を支払います。タイムアウトした、または一度も実行されなかった呼び出しは、エスクロー全額が戻り、そのスロット手数料が処理手数料になります。`crossvm_escrow_settled` イベントに手数料と返金額が含まれます。
4. **係数の待機。** 混雑係数が `async_max_factor` 以下の間、呼び出しは実行されます。係数がそれより高い場合は待機し、高いままならタイムアウトします。デフォルト（送信時の係数の 4 倍、係数が 1 倍なら 100 万分率で 4,000,000）では、呼び出しが待機に入るには、係数が 4 倍を超える必要があります。
5. **サイズの制限。** 前払い額は 50,000,000 ガスを超えられません。これを超えると送信時に拒否されます。後で再試行するか、`async_gas_limit` を下げてください。

**EVM への非同期呼び出し**の場合、前払い予算は 1,000,000 ガスで、送信時に課金されます。**同期**呼び出しのコストは、トランザクション自身のガスです。大きなコードを読み込む重い QoreChain Native コントラクトは、ブロック内での最初の呼び出しで、デフォルトより高い `async_gas_limit` と `async_max_factor` が必要になります。

### 失敗した呼び出しにも課金されます {#failed-charged}

失敗したクロス VM 呼び出しも、行った作業の分を支払います。リバートした、またはガスを使い果たした EVM 呼び出しは、消費した EVM ガスを呼び出し元から使います。`0x0901` ブリッジ経由で行った QoreChain Native 呼び出しが失敗した場合は、コントラクトが費やしたガスを、呼び出し元の EVM フレームから使います。高コストで失敗する呼び出し先に耐えたいコントラクトは、残りのガスで再試行するのではなく、サブコールにガスの上限を設定してください。

## 保留キュー {#pending}

- **送信者ごとに最大 100 件の保留呼び出し**（`max_pending_per_sender`）。それを超える非同期呼び出しは、自分の呼び出しのいずれかが実行されるかタイムアウトするまで、`ErrQueueFull`（codespace `crossvm`、コード 4）で拒否されます。同期呼び出しは影響を受けません。
- **キュー全体で最大 `max_queue_size`** 件（1,000）を保持します。
- **保留リストはページ分割されます。** 1 ページあたり最大 100 件のメッセージを保持し、リスト内の各ペイロードは先頭の **1,024 バイト**（`payload_hex`）に切り詰められます。完全なペイロードを読むには、ID でメッセージを取得してください。
- **ページの上限は丸め込まれます。** `pagination.limit` が 0 または 100 を超える場合は、黙って 100 に丸められます。`limit=101` のリクエストは、エラーではなく最大 100 件で `200` を返します。続きを読むには、レスポンスの `next_key` を渡し、空になるまで続けてください。

```bash
# One page of pending calls (use the next key from the response for the next page)
curl -s "https://api-testnet.qore.host/qorechain/crossvm/v1/pending?pagination.limit=100"

# A message by id, with its whole payload
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/message/<id>
```

2026 年 11 月 12 日にテストネットで確認しました。保留ルートは `{"messages":[],"count":0,"pagination":{"next_key":null,"total":"0"}}`（キューは空）で `200` を返し、メッセージルートは、存在しない ID に対して `{"message":null,"found":false}` で `200` を返しました。同じ読み取りを Linux ノードの CLI で行うと次のとおりです。

```bash
qorechaind query crossvm pending
qorechaind query crossvm message <id>
```

:::note ノード CLI
`qorechaind` は Linux ノードの CLI です。パッケージ化された macOS 用バイナリはありません。REST 呼び出しはどのマシンからでも動作します。
:::

## モジュールパラメータ {#params}

```bash
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

2026 年 11 月 12 日に、次のフィールドで `200` が返りました。

| フィールド | 読み取った値 | 意味 |
| ----- | ---------- | ------- |
| `enabled` | `true` | モジュールのスイッチ。呼び出しメッセージには、サーキットブレーカーのリストに独自のエントリがあります。 |
| `max_message_size` | `65536` | ペイロードの最大バイト数。 |
| `max_queue_size` | `1000` | 同時にキューに入れられる最大の呼び出し数。 |
| `queue_timeout_blocks` | `100` | 未実行の呼び出しがタイムアウトするまでのブロック数。 |
| `bridge_allowed_targets` | `cosmwasm:qor1...` のエントリが 3 件 | `0x0901` ブリッジが呼び出せる QoreChain Native コントラクト。空ならブリッジは閉じたままです。 |
| `bridge_target_pins` | ターゲットごとに 1 エントリ: `target`、`code_id`、`history_len` | ブリッジが呼び出すために、許可された各ターゲットが引き続き実行していなければならないコード。 |
| `max_pending_per_sender` | `100` | 1 人の送信者が保持できるキュー内の呼び出し数。 |
| `max_cosmos_tx_gas` | `"50000000"` | 1 つの Native トランザクションが宣言できる最大ガス。 |
| `record_retention_blocks` | `"100000"` | 完了したキュー呼び出しの記録が保持される期間。 |
| `max_block_wasm_gas` | `"3000000"` | 1 ブロックが使える QoreChain Native の実行量。 |
| `max_tx_wasm_share_bps` | `5000` | 1 つのトランザクションが使える、その予算に対する割合。 |
| `max_block_level_wasm_gas` | `"10000000"` | トランザクション外で行うコントラクト処理の予算。 |
| `queue_wasm_reserve_bps` | `2500` | ブロック予算のうち、キュー用に確保される割合。 |
| `wasm_congestion_max_factor` | `20` | 混雑係数が到達しうる最大値。 |
| `wasm_congestion_target_bps` | `5000` | 係数が上昇し始める使用割合。 |
| `wasm_congestion_factor_micro` | `"1000000"` | 現在有効な係数（100 万分率。`1000000` が 1 倍）。 |
| `max_block_upload_bps` | `5000` | コードのアップロードが使える予算の割合。 |
| `max_queue_timeouts_per_block` | `100` | 1 ブロックでタイムアウトさせる呼び出し数。 |

`wasm_congestion_factor_micro` を使うと、キュー呼び出しが今すぐ前払いする額（単位数 × 係数 × 0.1 uqor）が分かります。

## 方向別の例 {#examples}

すべての例は、Native トランザクションと同様に、アカウントのポスト量子鍵で署名します。[ポスト量子署名](/developer-guide/post-quantum-signing)を参照してください。このページのために送信したのは、ネイティブアカウントから QoreChain Native への例だけです（[テストネットでの検証](#tested)を参照）。EVM の例は実行しておらず、該当箇所に UNTESTED と記しています。

### ネイティブアカウントから EVM コントラクトへ {#native-to-evm}

**UNTESTED:** この方向は、このページのために実行していません。

ターゲットは EVM コントラクトで、ペイロードは ABI エンコードされた呼び出しデータです。呼び出しは自分の `0x` アドレスとして実行されるため、EVM 側は自分を `msg.sender` として認識します。コマンドライン（Linux ノード CLI）では、構築してからポスト量子署名を追加します。

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload <hex of abi.encode(selector, args)> \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json

qorechaind tx pqc cosign call.json --from mykey --pqc-key mykey-mldsa \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

公開済みの SDK（0.13.0）を使った TypeScript です。このヘルパーは viem で呼び出しを ABI エンコードします。

```ts
import { createClient, createCrossVMClient } from "@qorechain/sdk";

const client = createClient({ network: "testnet" });
const tx = await client.connectTx(signer, { pqcKeypair }); // hybrid signing
const xvm = createCrossVMClient(tx);

const { messageId, executed, data } = await xvm.call({
  targetVm: "evm",
  targetContract: "0xYourErc20",
  evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 1n] },
});
```

Python、Go、Rust、Java は、EVM 向けのペイロードを生のバイト列として受け取ります（高レベルの ABI エンコードは TypeScript のみです）。Python です。

```python
client.call(target_vm="evm", target_contract="0xYourErc20", payload=calldata_bytes)
```

Go です。

```go
res, err := c.Call(crossvm.CallOptions{
    TargetVM:       crossvm.VMTypeEVM,
    TargetContract: "0xYourErc20",
    Payload:        calldata,
})
```

Rust です。

```rust
let opts = CallOptions::new(VM_TYPE_EVM, "0xYourErc20", calldata_bytes);
let resp = cross_vm.call_with_responses(&opts).await?;
```

Java です。

```java
CrossVMClient.CallOptions o = new CrossVMClient.CallOptions();
o.targetVm = CrossVMClient.VMType.EVM;
o.targetContract = "0xYourErc20";
o.payload = calldata;
client.call(o);
```

送信者がトランザクションに署名したアカウントでない場合（たとえば authz の被付与者）、EVM 側は付与者のウィンドウの下で実行されます。[Authz とウィンドウ](#authz)を参照してください。

### ネイティブアカウントから QoreChain Native コントラクトへ {#native-to-wasm}

ペイロードはコントラクトの JSON execute メッセージです。同期呼び出しは、コントラクトの応答を `data` で返します。

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload $(printf '%s' '{"transfer":{"recipient":"qor1...","amount":"1"}}' | xxd -p -c 0) \
  --funds 100uqor \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 600000 --fees 60000uqor --generate-only > call.json
```

ガス許容量と係数の上限を明示したキュー呼び出し（v3.2.8）です。係数が 1 の場合、エスクローは 800,000 × 2.5 × 0.1 uqor = 200,000 uqor（0.2 QOR）です（コマンドは `2.5` を受け取り、100 万分率の 2,500,000 を送信します）。

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload <hex of the execute message> --async \
  --async-gas-limit 800000 --async-max-factor 2.5 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json
```

SDK 0.13.0 を使った TypeScript です（同期と、デフォルトの許容量でのキュー呼び出し）。

```ts
const sync = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
});

const queued = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
  async: true, // default allowance: 500,000 units, 4x factor (4,000,000 millionths)
});

// SDK 0.14.0: explicit allowance. The factor is in millionths: 6x is 6_000_000.
const tuned = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
  async: true,
  asyncGasLimit: 800_000,
  asyncMaxFactor: 6_000_000,
});
```

Python（`async_=True`）、Go（`Async: true`）、Rust（`.queue(true)`）、Java（`o.async = true`）でも、同じようにキューに入れられます。

```python
client.call(target_vm="cosmwasm", target_contract="qor1...contract",
            cosmwasm={"transfer": {"recipient": "qor1...", "amount": "1"}}, async_=True)
```

:::note 新しい 2 つのフィールドに対する SDK のサポート
SDK 0.13.0 には `async_gas_limit` と `async_max_factor` のオプションがないため、キュー呼び出しはデフォルトを使います。SDK 0.14.0 は、クロス VM 呼び出しに `asyncGasLimit` と `asyncMaxFactor` を追加し、`CROSSVM_ASYNC_FACTOR_ONE`（1,000,000）と `validateCrossVmAsyncGas` をエクスポートします。また、その `buildCall` ヘルパーは、ネイティブアカウントに対して `sourceVm` を `evm` にデフォルト設定します。チェーンは `source_vm` を無視し、メッセージを `source_vm` が native として記録しました。
:::

### 0x0901 経由で EVM コントラクトから QoreChain Native コントラクトへ {#evm-to-wasm}

**UNTESTED:** この方向は、このページのために実行していません。

Solidity コントラクトが、`0x0000000000000000000000000000000000000901` のブリッジプリコンパイルを呼び出します。呼び出しは EVM トランザクション内で実行され、QoreChain Native 側の送信者は呼び出し元のアカウントまたはコントラクト（その `qor1` アドレス）となり、どこでリバートが起きても両側が取り消されます。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function callNative(string calldata contractAddr, bytes calldata executeMsg)
        external returns (bytes memory)
    {
        // targetVM 1 is QoreChain Native; executeMsg is the JSON execute message
        (bool ok, bytes memory ret) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
        return ret;
    }
}
```

ブリッジの規則は次のとおりです。

- 通常の `CALL` のみ、value なし、セレクターは `0x3c11078c` です。`STATICCALL`、`DELEGATECALL`、ターゲット VM が `0` または `2` の場合はリバートします。
- ターゲットは `bridge_allowed_targets` に含まれている必要があります（さらに v3.2.8 からは、固定されたコードを引き続き実行している必要があります）。どちらも上記のパラメータルートで確認できます。
- **呼び出し元には、`0x0901` を列挙したウィンドウが必要です。** ブリッジにトランザクションを送るアカウントは、`allowed_targets` に `0x0000000000000000000000000000000000000901`（およびコントラクト経由で呼ぶ場合はそれを呼び出すコントラクト）を含む、開いた [EVM 認可ウィンドウ](/developer-guide/evm-window-reference)を持たなければなりません。セッションに合った範囲を指定して、次のように開きます。

```bash
qorechaind tx pqc open-evm-window 600 5 10qor \
  --allowed-targets 0x0000000000000000000000000000000000000901 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

- 失敗した呼び出しは `Error(string)` の理由でリバートし、コントラクトが使ったガスが課金されます。

`@qorechain/rdk` のヘルパー `encodeCrossVmCalldata({ contract, msg })` は、TypeScript で同じ呼び出しデータを構築します（[マルチ VM](/rollups/multi-vm)を参照）。公開済みの SDK では、プリコンパイルのアドレスは `@qorechain/evm` の `PRECOMPILE_ADDRESSES.crossVmBridge` です。

### QoreChain Native コントラクトから EVM コントラクトへ {#wasm-to-evm}

ドキュメント作成者は **UNTESTED** です。チェーンチームによると、v3.2.8 より前に、テストネットで両方のモードが実行されています。

QoreChain Native コントラクトは、自身を送信者として、チェーンメッセージとして `MsgCrossVMCall` をディスパッチすることで呼び出しを行います。メッセージのフィールドは上記と同じです。`source_vm` に何が指定されていても、チェーンはそのコントラクトを CosmWasm の呼び出し元として扱います。`async` が false（デフォルト）の場合、呼び出しは同期で、トランザクションのガスで実行され、結果は `MsgCrossVMCallResponse.data` で返り、失敗するとトランザクション全体がリバートされます。`async` が true の場合は、キューに入れられます。[誰が誰を呼ぶか](#who-calls-whom)を参照してください。以下の例は呼び出しをキューに入れます。

```json
{
  "@type": "/qorechain.crossvm.v1.MsgCrossVMCall",
  "sender": "qor1...the contract...",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234567890123456789012345678901234567890",
  "payload": "<base64 of the ABI-encoded call>",
  "async": true
}
```

これに頼る前に知っておくべき点です。

- EVM はそのコントラクトを、32 バイトのアドレスの**末尾 20 バイト**として認識します。EVM コントラクトが、`msg.sender` が通常のアカウントであることに依存しないようにしてください。
- v3.2.8 からは、呼び出しの結果、その呼び出し元が開始時より多くのネイティブ QOR を保有することになる場合、呼び出しは失敗します（課金されます）。この方向を想定した EVM コントラクトは、`msg.sender` にネイティブ QOR を支払うのではなく、ERC-20 トークン、または呼び出しで指定された 20 バイトのアカウントに支払うべきです。
- 自分自身として動作するコントラクトは、EVM ウィンドウによる制限を受けません。アカウントからの authz 付与のもとでディスパッチされた呼び出しは制限を受けます。下記を参照してください。
- `0x0901` ブリッジの下位では、`MsgCrossVMCall` は自分自身として動作するコントラクトからのみ受理され、そこでの authz の `MsgExec` が他のアカウントのために運ぶことはできません。

両方のモードが以前にテストネットで実行されています（同期は高さ 9,795,779、非同期は高さ 9,795,783）。このメッセージをディスパッチするコントラクト側の Rust コードは、このページのために実行していません。

## Authz とウィンドウ {#authz}

送信者自身が送っていない EVM へのクロス VM 呼び出しは、**送信者の** EVM ウィンドウの下で実行されます。これは、送信者自身のコードが他人のトランザクション内で動作する場合とまったく同じです。実際には、authz の付与が使われる場合がこれに当たります。誰かが `MsgCrossVMCall` の付与を使って EVM を呼び出すとき、次のようになります。

- 呼び出しが受理されるのは、**自分の**ウィンドウが開いていて、そのスコープがターゲット（`allowed_targets`、`native_only`、価値を動かすプリコンパイル）を許可している場合のみです。
- 呼び出しが成功するたびに、ウィンドウのトランザクションが 1 つ消費され、そこで失ったネイティブの価値はウィンドウの価値に対して計上されます。
- 使用可能なポスト量子鍵と有効なウィンドウがない場合、呼び出しは、非同期呼び出しでは送信時に、そしてキューが実行するときにもう一度、拒否されます。
- コントラクトやグループポリシーはウィンドウを持たないため、それらからの authz の付与で EVM への呼び出しを運ぶことはできません。
- QoreChain Native への呼び出しは、ウィンドウによる制限を受けません。`MsgCrossVMCall` の汎用的な authz 付与は、QoreChain Native レーンで被付与者に自分の ID を与えます。アカウントを任せられる相手にのみ付与してください。

authz の付与のもとでの ERC-20 トークンの変換（`MsgConvertERC20`）も、同じように送信者のウィンドウによって受理されます。

## 制限とエラー {#limits}

| 状況 | 結果 |
| --------- | ------ |
| ペイロードが `max_message_size` より大きい | 拒否、コード 8（`message payload exceeds max size`） |
| ターゲットアドレスの形式がそのレーンに合っていない | 送信時に拒否、コード 5（`invalid target contract address`） |
| ターゲットがプリコンパイルのアドレス（`0x...0000` から `0x...ffff`） | 送信時に拒否、コード 5 |
| ターゲット VM が自分のレーンと同じ | 拒否 |
| 未知またはサポートされていない VM | コード 7（`unsupported VM type`） |
| 1 人の送信者から 100 件を超えるキュー呼び出し | 1 件が完了するかタイムアウトするまで `ErrQueueFull`、コード 4 |
| キューが `max_queue_size` 件を保持している | `ErrQueueFull`、コード 4 |
| `async_max_factor` が 1,000,000 から 100,000,000（100 万分率）の範囲外。たとえば `6000000` ではなく `6` | 何も実行される前に拒否、codespace `crossvm` のコード 2（`async_max_factor 6 is outside 1000000..100000000 (millionths)`） |
| `async_max_factor` が現在の係数より低い | 送信時に拒否 |
| `async_gas_limit` が 250,000 未満、またはキューのブロックあたりの余裕を超える | 送信時に拒否 |
| 前払い額が 50,000,000 ガスを超える | 送信時に拒否。後で再試行するか、上限を下げてください |
| 使用可能な uqor がエスクローより少ない | 拒否（ベスティングでロックされたコイン、fee grant、他のトークンの手数料ではまかなえません） |
| 呼び出しの順番が来たとき、混雑係数が `async_max_factor` を上回っている | 呼び出しは待機し、`queue_timeout_blocks` の後にタイムアウトする |
| 呼び出しがタイムアウトした、または一度も実行されなかった | エスクローは全額返金、スロット手数料は処理手数料として保持 |
| ターゲットが失敗した | `failed` の記録（非同期）またはトランザクションが取り消される（同期）。使ったガスは課金される |
| EVM からコントラクトの呼び出し元（32 バイトの送信者）にネイティブ QOR が返される | 呼び出しは失敗し、課金される |
| それを列挙したウィンドウなしでの `0x0901` 呼び出し | 拒否 |
| `0x0901` のターゲットが `bridge_allowed_targets` にない、または固定されて以降コードが変更された | リバート。リストにないターゲットでは `cross-VM bridge call refused: target ... is not allowlisted` |
| サーキットブレーカーのリストにある `MsgCrossVMCall` | トランザクションは拒否され、キューに入った呼び出しは保留のまま |
| SVM への呼び出し | このレーンは提案 37 以降テストネットで開放され、メインネットではオフ。このページのために SVM への呼び出しは実行していません（UNTESTED） |

失敗したキュー呼び出しに記録されるエラーは、ソースファイルの注釈なしのプレーンテキストです。

## イベント {#events}

| イベント | 属性 | 意味 |
| ----- | ---------- | ------- |
| `crossvm_request` | `message_id`、`source_vm`、`target_vm`、`target_contract`、`sender` | 呼び出しが送信された |
| `crossvm_response` | `message_id`、`status`、失敗した呼び出しでは `error` | キュー呼び出しが完了した |
| `crossvm_timeout` | `message_id` | キュー呼び出しがタイムアウトした |
| `crossvm_escrow_settled` | 手数料と返金額 | QoreChain Native への非同期呼び出しのエスクローが支払われた |

## テストネットでの検証 {#tested}

提案 37 が可決された後の 2026 年 11 月 12 日に、`qorechain-diana`（リリース v3.2.8）で、SDK 0.14.0（`createCrossVMClient(...).buildCall`、ハイブリッド署名、eth-native アカウント）を使い、コード 859 からインスタンス化したガバナンス保存済みの cw20 コントラクトに対して実行しました。ペイロードは `{"transfer":{"recipient":<self>,"amount":"1"}}` でした。

| ステップ | 結果 |
| ---- | ------ |
| サーキットブレーカーのリストを読み取る | `/cosmwasm.wasm.v1.MsgStoreCode` のみ。呼び出しメッセージは一時停止されていない |
| 同期のネイティブから QoreChain Native への呼び出し | シミュレーションで 601,178 ガス、シミュレーション値 × 1.3 で送信、コード 0、使用ガス 595,049 |
| 非同期のネイティブから QoreChain Native への呼び出し、`asyncGasLimit` 800000、`asyncMaxFactor` 6000000 | シミュレーションで 751,287 ガス。コード 0。使用ガス 751,277 |
| 非同期呼び出しの引き落とし（トランザクションのイベント） | 手数料（146,502 uqor、上限 × 0.15）と、モジュールアカウントに送られた 680,417 uqor（観測されたエスクローとキュースロットの支払い。ここでは内訳は示していません） |
| 非同期呼び出しのイベント | `source_vm` が native、`target_vm` が cosmwasm の `crossvm_request` |
| `GET /qorechain/crossvm/v1/message/{id}` | ステータスは `executed`、`created_height` と `executed_height` が等しい（キュー呼び出しは同じブロックで実行された）、エラーは空 |
| その後の `GET /qorechain/crossvm/v1/pending` | 空のリスト |
| `async_max_factor` に `6` を指定 | 何も実行される前に拒否: codespace `crossvm` のコード 2、`async_max_factor 6 is outside 1000000..100000000 (millionths): invalid cross-VM message` |

このページのために実行していないもの（UNTESTED）は、`0x0901` 経由の EVM から QoreChain Native への呼び出しと、QoreChain Native から EVM への呼び出しです。チェーンチームによると、QoreChain Native から EVM への同期および非同期のパスは、v3.2.8 より前の高さ 9,795,779 と 9,795,783 でテストネット上で実行されています。

## 関連ページ {#related}

- 概念、ライフサイクル、テストネットの許可リストに関する注記は、[クロス VM 相互運用性](/developer-guide/cross-vm-interoperability)を参照してください。
- ブリッジが必要とするウィンドウの開き方とスコープの指定は、[EVM 認可ウィンドウ リファレンス](/developer-guide/evm-window-reference)を参照してください。
- プリコンパイルの一覧とネットワークのステータスは、[EVM プリコンパイル](/developer-guide/evm-precompiles)を参照してください。
- コントラクトのガスとブロック予算は、[QoreChain Native 開発](/developer-guide/cosmwasm-development)と [QoreChain Native のガスと制限](/developer-guide/cosmwasm-gas-and-limits)を参照してください。
- 上記のトランザクションへの署名は、[ポスト量子署名](/developer-guide/post-quantum-signing)を参照してください。
- SDK と RDK のヘルパーは、[Cross-VM ガイド (SDK)](/sdk/guides/cross-vm)と[マルチ VM ロールアップ](/rollups/multi-vm)を参照してください。
