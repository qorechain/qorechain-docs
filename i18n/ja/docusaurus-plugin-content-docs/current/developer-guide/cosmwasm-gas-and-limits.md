---
slug: /developer-guide/cosmwasm-gas-and-limits
title: CosmWasmのガス、価格設定、アップロード制限
sidebar_label: CosmWasmのガスと制限
sidebar_position: 6
---

# CosmWasmのガス、価格設定、アップロード制限

QoreChain Nativeのコントラクト(QoreChainにおけるCosmWasmランタイムの名称)は、バリデーターが実行するのに要するコストに基づいて価格設定されます。リリース**v3.2.8**以降、コントラクト呼び出しの価格は3つの要素で決まります。コントラクトのコードが現在のブロックですでにメモリにロードされているか、ブロックがコントラクトの処理でどれだけ混み合っているか、そして呼び出しがどれだけのメモリに触れるかです。コードのアップロードには、サイズと形状に上限があります。

:::note まずテストネットで
v3.2.8は、2026年11月12日から**`qorechain-diana`**テストネットで稼働しています。メインネット(`qorechain-vladi`)には、後のガバナンスアップグレードで適用されます。そのため、以下の数値は現時点ではテストネットの状態を、アップグレード後はメインネットの状態を表します。すべてのコマンドは`--chain-id qorechain-diana`を使用しています。メインネットがアップグレードされたら、`qorechain-vladi`に置き換えてください。
:::

## なぜ重要か {#why}

- 昨日は固定のガス上限で動作したコントラクト呼び出しが、今日はガス不足になることがあります。ブロック内でのコードの初回呼び出しは、2回目以降の数倍のコストがかかるためです。固定の上限は推測にすぎず、最悪のタイミングで失敗します。
- 手数料は負荷に連動します。ブロックがコントラクト呼び出しで埋まるとコントラクト実行の価格は上がり、そうでなくなると下がります。
- 各ブロックには、コントラクト処理の量に上限があります。収まらない呼び出しは失敗し、他の失敗したトランザクションと同様に手数料を支払います。

簡単なルール: **シミュレーションを行い、結果に少なくとも1.3を掛け、コントラクト呼び出しのガスを決してハードコードしないでください。**

## ガスモデル {#gas-model}

### コードのロードコスト {#code-load}

コントラクトが実行される前に、コンパイル済みのコードをロードする必要があります。ブロック内でのコードの初回呼び出しが、そのロードの費用を支払います。同じブロック内で同じコードを後から呼び出す場合は、コードがすでにメモリ上にあるため、安価です。

| 呼び出し | おおよそのガス |
| ---- | --------------- |
| cw20の`transfer`、ブロック内でのコードの初回呼び出し(メッセージ1つ、測定された使用ガス) | 585,151 |
| cw20の`transfer`、1つのトランザクション内で3回の呼び出し、つまり同じブロック内で2回の繰り返し(測定された使用ガス、合計) | 646,169 |
| 同じ単一の呼び出しの、シミュレーションが報告する値 | 591,280 |

これらの数値は、2026年11月12日に、ガバナンスが保存したレビュー済みのcw20コードを使って、テストネットで測定したものです(混雑係数1倍)。同じブロック内での同じコードの繰り返しは、実際には約30,500ガスしか追加されません。シミュレーションは、トランザクションが使用する量よりも多く報告します。常にコールドロードを課金し、混雑に備えた余裕を加えるためです。3回の呼び出しは、シミュレーションで1,326,504でしたが、使用量は646,169でした。数値はコードと呼び出しによって異なるため、ご自身のコントラクトで測定してください。詳しくは、ロードはブロック内でのコードの初回呼び出しで全額が課金され、同じブロック内でそのコードに対する次の8回の呼び出しではロード費用がかからず、それ以降の各呼び出しはその8分の1を支払います。ロード済みコードの集合はブロックごとに空から始まるため、すべてのバリデーターが同じ呼び出しに同じ課金をします。これは、インスタンス化、実行、マイグレーション、および別のコントラクトやクロスVMブリッジからの呼び出しに適用されます。

**ピン留めされたコードはロード課金をスキップします。** ガバナンスは、よく使われるコードをピン留めして、バリデーターがロードしたままにしておくことができ、ピン留めされたコードへの呼び出しはロードコストを支払いません。どのコードがピン留めされているかを確認します。

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/pinned
```

### 呼び出しのセットアップとメモリ {#setup}

すべての呼び出しは、小さなセットアップ課金(基本コスト、初期メモリの64 KiBページごとのコスト、データセグメントごとのコスト)と、拡張したメモリの各ページに対する課金も支払います。メモリを小さく保つコントラクトのほうが安価です。

### 混雑による価格設定 {#congestion}

コントラクト実行のガスには、**混雑係数**が掛けられます。

| プロパティ | 値 |
| -------- | ----- |
| 範囲 | デフォルトで1倍から20倍まで |
| ガバナンスの上限 | ガバナンスは最大値を100倍まで設定できる |
| 上昇するとき | ブロックが満杯のときのみ。コントラクトバジェットの半分(デフォルトの目標)を超えて使用したブロックの後に係数が上がり、バジェットを使い切った場合はより速く上がる |
| 下降するとき | 目標より少なく使用したブロックの後 |

この係数はコントラクト実行のみに掛かります。ストレージ、呼び出しのセットアップ、コードのアップロードには掛かりません。上記の送金を測定したとき、係数は1倍でした。

現在の値を読み取ります。

```bash
qorechaind query crossvm params --node https://rpc-testnet.qore.host:443
```

確認すべきフィールドは、`wasm_congestion_factor_micro`(適用中の係数。100万分の1単位なので`1000000`は1倍)、`wasm_congestion_max_factor`、`wasm_congestion_target_bps`、`max_block_wasm_gas`、`max_tx_wasm_share_bps`です。

### ブロックごとのコントラクトバジェット {#budget}

各ブロックには、コントラクト処理のバジェットがあります。デフォルト値は次のとおりです。

| パラメーター | デフォルト | 意味 |
| --------- | ------- | ------- |
| `max_block_wasm_gas` | 3,000,000 | 1つのブロックですべてのトランザクションを合わせて使用できるコントラクト実行量 |
| `max_tx_wasm_share_bps` | 5,000(半分) | 1つのトランザクションが使用できるバジェットの割合。デフォルトでは1,500,000 |
| `queue_wasm_reserve_bps` | 2,500 | キューに入った非同期のクロスVM呼び出しのために確保されるバジェットの割合 |

バジェットがトランザクションのコントラクト処理を拒否すると、トランザクションは失敗し(「block wasm gas budget exhausted」)、他の失敗したトランザクションと同様に手数料を支払います。バジェットが満杯の状態で始まる次のブロックで再試行してください。優先手数料は、バジェットが使い果たされる前の、ブロックの早い段階で取り込まれるのに役立ちます。1つのトランザクションの割り当てを超える量を必要とする単一の呼び出しは、ガバナンスがバジェットまたは割合を引き上げるまで実行できません。

### シミュレーションと安全マージン {#simulation}

シミュレーションは**常にコールドロードを課金**します。まるで呼び出しがブロック内でそのコードの初回呼び出しであるかのように扱い、実行を、次のブロックが使用する混雑係数に2段階分の上昇を加えた係数(実行部分で約2.25倍)で価格設定します。したがって、見積もりは数ブロックにわたる負荷の上昇にも耐えられます。初回の呼び出しに対して低すぎることはありません。

このため、すべてのコントラクトメッセージで次のルールを使用してください。

1. トランザクションをシミュレーションします。
2. シミュレーションされたガスに**少なくとも1.3**を掛けます。
3. その結果をガス上限として使用し、トランザクションの上限を超えないようにします。

### トランザクションの上限 {#tx-cap}

Cosmosトランザクションは、**50,000,000**を超えるガス上限を設定できません。上限を超えるトランザクションは、手数料が課金される前に拒否されます。

## アップロードのルール {#upload}

コードのアップロード(`MsgStoreCode`)は、引き続き**ガバナンスによって管理**されます。両方のネットワークで`code_upload_access`は`Nobody`であるため、コードはガバナンス提案を通じて保存されます。いつでも確認できます。

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/params
```

v3.2.8以降、アップロードは、コストの低いチェックから順に、決まった順序で検査されます。

1. **アクセス。** 送信者がアップロードルールで許可されている必要があります。メモリプールは、許可された送信者からのアップロードメッセージのみを受け付けます。
2. **宣言されたサイズに対するガスを先に確認。** トランザクションには、宣言したモジュールサイズに対するガスが残っている必要があります。そうでなければ、何も展開される前に、ただちにガス不足で失敗します。
3. **1回のパスでの検査。** モジュールは1回だけ、宣言されたサイズを超えないように展開され、以下の制限に照らして検査されます。gzipのアップロードは、宣言されたサイズに展開される、ちょうど1つのgzipメンバーでなければなりません。
4. **ストレージとコンパイル。** ストレージはバイトごとに課金され、その後モジュールがコンパイルされます。

一般的なアップロードのコスト: **cw20で約990万ガス**、**cw721で約2,280万ガス**。制限内に収まる最も密度の高いアップロードは約3,200万ガスで、それでも50,000,000の上限の範囲内です。

### モジュールの制限 {#module-limits}

| 制限 | 値 |
| ----- | ----- |
| 関数 | 最大4,096 |
| 関数型 | 最大512 |
| コンパイル後のサイズ(保守的な見積もり) | 最大32 MiB |
| エクスポート | 最大128 |
| グローバル | 最大256 |
| 要素セグメント | 最大16、合計で最大2,500エントリ |
| データセグメント | 最大1,024 |
| 初期メモリ | 最大64ページ(4 MiB) |
| カスタムセクション | 合計で最大128 KiB |
| 浮動小数点演算 | 許可されない |

浮動小数点命令は、バリデーターのハードウェア間で決定的でないため拒否されます。`cosmwasm-std`の整数型または小数型を使ってコントラクトを書き、ガバナンスに提出する前に、ビルドに浮動小数点命令が含まれていないことを確認してください。

制限は、**すでに保存されているコードに対しても呼び出し時に**検査されます。そのため、以前に保存されたコードが制限(たとえば浮動小数点)に違反している場合、呼び出されたときに拒否されます。標準のcw20およびcw721テンプレートとリリースコントラクトから構築されたコントラクトは、すべての制限に対して十分に余裕があります。

## 実例: cw20の送金の見積もりと実行 {#worked-example}

メッセージは、標準のcw20の`transfer`です: `{"transfer": {"recipient": "qor1...", "amount": "1000"}}`。例ではテストネットを使用します。

### CLI {#example-cli}

CLIに`--gas auto`でシミュレーションさせ、1.3以上の調整値を使用します。`--generate-only`でトランザクションを構築し、`tx pqc cosign`で署名します。マニュアルの他の部分と同じです([ハイブリッド署名](/cli-reference/transaction-commands#hybrid-signing)を参照)。

```bash
qorechaind tx wasm execute <contract-addr> \
  '{"transfer":{"recipient":"qor1recipient...","amount":"1000"}}' \
  --from mykey \
  --gas auto --gas-adjustment 1.3 --gas-prices 0.15uqor \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

ネットワークの下限は、ガス1単位あたり0.1 uqorです。`0.15uqor`は余裕を持たせた値です。コントラクトが、同じコードを使う他のユーザーと同じブロックで頻繁に呼び出される場合でも、シミュレーションされた上限にはすでにコールドロードが含まれています。

### TypeScript {#example-ts}

シミュレーションを行い、1.3を掛け、上限を確認してから、ハイブリッドビルダー経由で送信します。これは、[QoreChain Native SDKガイド](/sdk/guides/cosmwasm#gas)に従っており、そこには完全なインポートと、アカウントのML-DSA-87鍵の登録が記載されています。

```ts
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { checkCosmosGasLimit, COSMOS_TX_MAX_GAS } from "@qorechain/sdk";

const cwClient = await SigningCosmWasmClient.connectWithSigner(
  "https://rpc-testnet.qore.host",
  signer,
);

const msgs = [
  {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.fromPartial({
      sender,
      contract: contractAddress,
      msg: new TextEncoder().encode(
        JSON.stringify({ transfer: { recipient, amount: "1000" } }),
      ),
      funds: [],
    }),
  },
];

const simulatedGas = await cwClient.simulate(sender, msgs, undefined);
const gas = Math.ceil(simulatedGas * 1.3);
checkCosmosGasLimit(gas); // throws above COSMOS_TX_MAX_GAS (50,000,000)

const gasPrice = 0.15; // uqor per unit of gas
const fee = {
  amount: [{ denom: "uqor", amount: String(Math.ceil(gas * gasPrice)) }],
  gas: String(gas),
};
// Pass `fee` and `msgs` to signAndBroadcastHybrid exactly as in the SDK guide.
```

`carriesWasmExecution(messages)`は、メッセージのリストにシミュレーションされたガスが必要かどうかを教えてくれます。`WASM_GAS_MULTIPLIER_MIN`は、最小値1.3です。CosmJSクライアントが手数料として`"auto"`を受け付ける場合は、クライアントが代わりにシミュレーションを行います。

### テストネットでの検証 {#example-tested}

この実行は、2026年11月12日に`qorechain-diana`(リリースv3.2.8)で、eth-nativeアカウント、TypeScript SDK 0.13.0、ガバナンスが保存したcw20コード(コードID 859)を使って行いました。トランザクションに署名し、署名済みのバイト列をRESTのシミュレーション経路にPOSTし、シミュレーションされたガスの1.3倍で実際のトランザクションを送信します。

```ts
import { Registry } from "@cosmjs/proto-signing";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { EthNativeSigner, qorechainRegistryTypes } from "@qorechain/sdk";

const registry = new Registry([...qorechainRegistryTypes, ...wasmTypes]);
const signer = new EthNativeSigner(account, { rest: REST, registry });
const signBytesVersion = await signer.resolveSignBytesVersion(CHAIN_ID);

// 1. Sign once with a generous limit, then ask the node what the call needs.
const base = { chainId: CHAIN_ID, accountNumber, sequence, messages: [msg] };
const { txRawBytes } = signer.sign({
  ...base,
  fee: { amount: [{ denom: "uqor", amount: "450000" }], gas: "3000000" },
  signBytesVersion,
});
const sim = await fetch(`${REST}/cosmos/tx/v1beta1/simulate`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ tx_bytes: Buffer.from(txRawBytes).toString("base64") }),
}).then((r) => r.json());

// 2. Send it for real with the simulated gas times 1.3.
const gas = Math.ceil(Number(sim.gas_info.gas_used) * 1.3);
const res = await signer.signAndBroadcast(transport, {
  ...base,
  fee: { amount: [{ denom: "uqor", amount: String(Math.ceil(gas * 0.15)) }], gas: String(gas) },
});
```

実行結果の出力:

| ステップ | 結果 |
| ---- | ------ |
| cw20のインスタンス化(コード859): シミュレーション後、その1.3倍で送信 | シミュレーション634,956、上限825,443。コード0、使用ガス629,267 |
| cw20の`transfer`: シミュレーション | 591,280ガス |
| 同じ送金を固定上限400,000で実行 | 拒否: `out of gas in location: wasm code load; gasWanted: 400000, gasUsed: 564549`(手数料は課金される) |
| 同じ送金をシミュレーション値の1.3倍(768,664)で実行 | コード0、使用ガス585,151 |
| 1つのトランザクション内の3回の送金、シミュレーション値の1.3倍(1,724,456) | コード0、使用ガス646,169 |

固定の400,000という上限は、ブロック内でのコードの初回呼び出しで失敗しますが、シミュレーションされた上限では失敗しません。手数料は、要求した上限に基づいて設定されます(この実行ではガス1単位あたり0.15 uqor)。そのため、マージンを大きくすると手数料も大きくなります。5ではなく、1.3を使用してください。

### Python、Go、Rust、Java {#example-other}

これらのSDKはいずれも、RESTの経路に対してシミュレーションを行い、その結果から上限を決定します。シミュレーション経路はトランザクションの構造を必要とするため、完全に組み立てられた(署名済みの)トランザクションが必要です。CosmWasmの実行、インスタンス化、マイグレーション(およびクロスVM呼び出し)では、SDKは上限をシミュレーションされたガスの少なくとも1.3倍に引き上げます。いずれのSDKにも、すぐに使えるcw20やCosmWasmのメッセージビルダーはないため、ご利用のprotobufライブラリで`MsgExecuteContract`を構築し、その署名済みバイト列を渡してください。

**Python**(`qorechain-sdk`、`qorsdk`): `estimate_gas`と`auto_fee`は、構築されたトランザクションを受け取り、wasmメッセージに対して1.3の下限を適用します。

```python
from qorsdk import auto_fee, estimate_gas

rest = "https://api-testnet.qore.host"
gas = estimate_gas(rest, built, gas_multiplier=1.3)   # raises above the 50,000,000 cap
fee = auto_fee(rest, built, gas_multiplier=1.3, gas_price="0.15uqor")
```

**Go**(`github.com/qorechain/qorechain-sdk/packages/go/qorechain/tx`): `EstimateGas`はシミュレーションされたガスを返し、`WasmGasWanted`は1.3の下限を適用し、`EstimateFee`は渡された係数で価格を計算します(下限自体は加えないため、1.3以上を渡してください)。

```go
used, err := tx.EstimateGas("https://api-testnet.qore.host", txBytes, nil)
if err != nil { return err }
gas := tx.WasmGasWanted(used, 1.3)

fee, err := tx.EstimateFee("https://api-testnet.qore.host", txBytes, 1.3, "0.15uqor", nil)
```

**Rust**(`qorechain-sdk`): `estimate_gas_wanted`は、wasmおよびクロスVMメッセージに対して上限をシミュレーションされたガスの少なくとも1.3倍に引き上げ、`estimate_fee`はその価格を計算します。

```rust
use qorechain_sdk::tx::{estimate_fee, estimate_gas_wanted};

let est = estimate_gas_wanted("https://api-testnet.qore.host", &tx_bytes, 1.3).await?;
// est.simulated, est.gas_wanted
let fee = estimate_fee("https://api-testnet.qore.host", &tx_bytes, 1.3, "0.15uqor").await?;
```

**Java**(`io.github.qorechain.tx.AutoGas`): トランザクションがwasmまたはクロスVMメッセージを含む場合は、最後の引数に`true`を渡します。

```java
AutoGas.Estimate est = AutoGas.estimate(
    "https://api-testnet.qore.host", txBytes, /* hybrid */ true, 1.3, null, /* wasmOrCrossVm */ true);
// est.simulatedGas, est.gasWanted
```

### RESTのシミュレーション経路 {#example-rest}

署名済みトランザクションのbase64を付けて`POST /cosmos/tx/v1beta1/simulate`を呼び出すと、`gas_info.gas_used`が返されます。これに1.3を掛けたものが上限です。

```bash
curl -s -X POST https://api-testnet.qore.host/cosmos/tx/v1beta1/simulate \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64 of the signed TxRaw>"}'
```

応答には`gas_info.gas_used`(文字列)が含まれます。この経路はPOSTのみを受け付けます。`GET`には`501 Not Implemented`が返されます。

## 制限とエラー {#limits-errors}

| 状況 | 表示される内容 | 対処 |
| --------- | ------------ | ---------- |
| ガス上限が50,000,000を超える | 手数料が課金される前に拒否される | 上限を下げる。処理を複数のトランザクションに分割する |
| コントラクト呼び出しでのガス不足 | トランザクションがガス不足エラーで失敗する | シミュレーションを行い、結果の少なくとも1.3倍を使用する。固定値を再利用しない |
| ブロックのコントラクトバジェットが使い果たされた | ブロックのwasmガスバジェットに言及する失敗。手数料は支払い済み | 次のブロックで再試行する。必要に応じて優先手数料を付ける |
| 1つの呼び出しがトランザクションの割り当てを超える量を必要とする | 毎回失敗する | ガバナンスにバジェットまたは割合の引き上げを依頼するか、呼び出しを軽くする |
| アクセス権のない送信者によるアップロード | 受付時に拒否される | ガバナンス提案を通じてコードを提出する |
| 宣言されたサイズに対するガスが不足したアップロード | ただちにガス不足になる | 宣言されたサイズをカバーするガスを設定する(cw20で約990万) |
| モジュールの制限を超えるアップロード | アップロード時に拒否される | 関数、エクスポート、グローバル、セグメント、メモリを減らす(上の表を参照) |
| モジュール内の浮動小数点命令 | アップロード時に拒否され、保存済みコードは呼び出し時に拒否される | ビルドから浮動小数点演算を取り除く |
| 1つのメンバーでない、またはサイズが誤っているgzipのアップロード | 拒否される | 正しいサイズで、モジュールを単一のgzipストリームとして圧縮する |

## 関連ページ {#related}

- [QoreChain Nativeガイド(SDK): コントラクト呼び出しのガス](/sdk/guides/cosmwasm#gas)
- [QoreChain Nativeの開発](/developer-guide/cosmwasm-development)
- [クロスVM相互運用性](/developer-guide/cross-vm-interoperability)
- [ハイブリッド署名と`tx pqc cosign`](/cli-reference/transaction-commands#hybrid-signing)
- [ガバナンス](/user-guide/governance)
