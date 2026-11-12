---
slug: /developer-guide/evm-window-reference
title: EVM認可ウィンドウリファレンス(v3.2.8)
sidebar_label: EVMウィンドウリファレンス
sidebar_position: 7
---

# EVM認可ウィンドウリファレンス(v3.2.8)

Ethereumトランザクションが持つのはsecp256k1署名1つだけで、QoreChainが他のすべてのトランザクションに求めるポスト量子(ML-DSA-87)署名を載せることができません。**EVM認可ウィンドウ**は、このギャップを埋めます。アカウントはまず、ポスト量子鍵で署名された**QoreChain Nativeメッセージ**で、範囲を限定したウィンドウを開きます。その後、EVMレーンは、ウィンドウがカバーしている間に限り、そのアカウントの通常のMetaMask、ethers.js、Hardhat、Foundryのトランザクションを受け付けます。このページは、リリース**v3.2.8**でウィンドウがどのように動作するかについての完全なリファレンスです。

:::note v3.2.8が稼働している場所
**`qorechain-diana`**テストネットは、2026年11月12日から**v3.2.8**を実行しています。**`qorechain-vladi`**メインネットはまだ適用していません。メインネットでは、ウィンドウは、以下で「v3.2.8」と記されたオプションとルールを除き、[EVM開発](/developer-guide/evm-development#evm-window)に記載のとおりに動作します。v3.2.8未満のノードは、新しいリストを設定するウィンドウメッセージを拒否します。
:::

## なぜ重要か {#why}

- **盗まれたクラシック鍵の価値は、開いているウィンドウが許可する範囲に限られます。** ウィンドウは、時間(ブロック数)、トランザクション数、出ていくQORの量、そして必要に応じてアカウントが触れてよいコントラクトを制限します。
- **ポスト量子鍵が主導権を持ち続けます。** ウィンドウの開始、絞り込み、終了は、すべてハイブリッド署名されたNativeメッセージです。クラシック鍵だけでウィンドウを開くことは決してできません。
- **v3.2.8はデフォルトをより厳格にします。** 標準のプリコンパイルのメソッドはデフォルトで拒否され、他のコントラクトが検査する署名にはウィンドウの同意が必要であり、ポスト量子鍵を変更するとウィンドウが閉じます。

v3.2.8での追加事項の概要は[v3.2.8で追加されたウィンドウオプション](/developer-guide/evm-development#evm-window-v328)にあります。このページでは、それを完全には繰り返さず、例、フィールドリファレンス、エラー表を追加します。最初のウィンドウをステップごとに説明したガイドについては、[初めてのトランザクション](/getting-started/first-transaction#evm-window)を参照してください。

## 開く、閉じる、読み取る {#lifecycle}

| 操作 | メッセージ | CLI | REST |
| ------ | ------- | --- | ---- |
| 開く(開いているウィンドウを置き換える) | `/qorechain.pqc.v1.MsgOpenEVMWindow` | `qorechaind tx pqc open-evm-window [blocks] [max-txs] [max-value]` | なし(トランザクション) |
| ただちに閉じる | `/qorechain.pqc.v1.MsgCloseEVMWindow` | `qorechaind tx pqc close-evm-window` | なし(トランザクション) |
| 読み取る | なし | `qorechaind q pqc evm-window <address>` | `GET /qorechain/pqc/v1/evm_window/{address}` |

ウィンドウの開始と終了は、Nativeレーンのトランザクションであり、アカウントのハイブリッド署名(クラシックとML-DSA-87)が必要です。また、ウィンドウを開くには、アカウントがすでに登録済みのポスト量子鍵を持っている必要があります。ウィンドウを閉じると、保留中のEIP-7702の同意も取り下げられます。ウィンドウを開くと、**アカウントのnonceが進みます**(NativeのシーケンスがEVMのnonceです)。そのため、先にウィンドウを開き、その後でEVMのnonceを読み取ってください。

### CLI {#cli}

`--generate-only`でトランザクションを構築し、その後`tx pqc cosign`でポスト量子署名を追加します。リリース版の`qorechaind`バイナリには`gen-key`と`cosign`がありますが、コミュニティビルドにはありません。

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# Open: 7,200 blocks, 20 transactions, 100 QOR cap (value plus maximum fees)
qorechaind tx pqc open-evm-window 7200 20 100qor \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

引数を指定しない場合、CLIはデプロイセッション向けに設定されたデフォルト値を使用します。3,600ブロック、10トランザクション、25 QORです。1つのトークンコントラクトに限定したウィンドウ(アドレスはご自身のものに置き換えてください)は次のとおりです。

```bash
qorechaind tx pqc open-evm-window 600 5 100qor \
  --allowed-targets 0x1111111111111111111111111111111111111111 \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

たとえばクラシック鍵が漏洩したと思われる場合は、ウィンドウを早期に閉じます。ウィンドウがまだ許可していたものは、次のブロックから拒否されます。

```bash
qorechaind tx pqc close-evm-window \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 40000uqor --generate-only > close.json

qorechaind tx pqc cosign close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

ウィンドウを読み取ります。

```bash
qorechaind q pqc evm-window <qor1-address> --node $QNODE
```

`live: true`に加えて、`remaining_blocks`、`remaining_txs`、`remaining_value`(uqor)が表示されていれば正常です。コマンドリファレンスは[トランザクションコマンド](/cli-reference/transaction-commands#open-evm-window)にあります。

### REST {#rest}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

ウィンドウを持たないアカウントには、HTTP 200で`found: false`が返されるため、この経路は安全にポーリングできます。数値はすべてJSON文字列です。保存されているウィンドウは、期限切れまたは使い切られている場合があります。`live`は、現在の高さで、少なくともあと1つの値ゼロのトランザクションをまだ受け付けるかどうかを示します。

### TypeScript {#typescript}

ウィンドウのヘルパーは`@qorechain/sdk`にあります(署名のセットアップについては[SDK EVMガイド](/sdk/guides/evm#evm-window-scope)を参照)。`openEvmWindowMsg`は以下のすべてのフィールドを受け取り、`closeEvmWindowMsg`は終了メッセージを構築し、`fetchEvmWindow`はウィンドウを読み取り、`classifyEvmWindowRejection`は拒否の理由を説明します。

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  openEvmWindowMsg,
  closeEvmWindowMsg,
  fetchEvmWindow,
} from "@qorechain/sdk";

const REST = "https://api-testnet.qore.host";
const client = createClient({
  network: "testnet",
  endpoints: { rest: REST, rpc: "https://rpc-testnet.qore.host", evmRpc: "https://evm-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic); // already registered on chain
const tx = await client.connectTx(signer, { pqcKeypair });         // signs hybrid

// Open a window that may call one token contract (replace the address with your own).
await tx.signAndBroadcast(
  [
    openEvmWindowMsg({
      sender: account.address,
      blocks: 7200,
      maxTxs: 20,
      maxValue: "100000000",                 // uqor: value PLUS the maximum fee of each transaction
      allowedTargets: ["0x1111111111111111111111111111111111111111"], // your token contract
    }),
  ],
  "auto",
);

// Read it back (opens first, then read the nonce).
const w = await fetchEvmWindow({ rest: REST, address: account.address });
console.log(w.live, w.remainingBlocks, w.remainingTxs, w.remainingValue);

// Close it early.
await tx.signAndBroadcast([closeEvmWindowMsg(account.address)], "auto");
```

`openEvmWindowMsg`は、署名の前に境界値とリストの形式を検査するため、間違いは、拒否されたトランザクションで費用を払うのではなく、ローカルで失敗します。`MAX_EVM_WINDOW_BLOCKS`と`MAX_EVM_WINDOW_TXS`は、その境界値をエクスポートします。読み戻し(`fetchEvmWindow`)は、境界値、カウンター、v3.2.3のスコープ(`nativeOnly`、`allowedTargets`)を返します。`validators`(コントラクトアドレス)、`stakingValidators`(`qorvaloper1...`)、`ibcReceivers`(`"<channel>/<receiver>"`)は、v3.2.8のリストを持つSDK 0.14.0以降のビルダーで受け付けられます。読み戻しはそれらを返さず、v3.2.8のRESTウィンドウ経路も返さないため、ウィンドウを開いたときの値を保管してください。3つのリストを設定するのは、v3.2.8を実行しているネットワークだけにしてください。それより下のノードは、それらを設定したウィンドウメッセージを拒否します。ハイブリッド署名の`connectTx`では、ポスト量子鍵があらかじめ登録されている必要があります。

### テストネットでの検証 {#tested}

2026年11月12日に`qorechain-diana`(リリースv3.2.8)で、ポスト量子鍵を登録済みのeth-nativeアカウントを使い、SDK 0.13.0(`openEvmWindowMsg`、`closeEvmWindowMsg`、`fetchEvmWindow`)とハイブリッド署名で実行しました。ウィンドウのフィールド`validators`、`staking_validators`、`ibc_receivers`は、SDK 0.13.0のビルダーにはありませんでした。SDK 0.14.0がそれらを`openEvmWindowMsg`に追加しており、この実行では使用していません(SDK 0.13.0では、それらにコマンドラインを使用してください)。

| ステップ | 結果 |
| ---- | ------ |
| 開く前の`GET /qorechain/pqc/v1/evm_window/{address}` | `found: false`、`live: false` |
| 開く: 300ブロック、5トランザクション、1,000,000 uqor | コード0、使用ガス187,282。読み戻し: `found: true`、`live: true`、`opened_height` 9942089、`expiry_height` 9942389、`max_txs` 5、`max_value` 1000000、`remaining_blocks` 297、`native_only: false`、`allowed_targets: []` |
| `nativeOnly: true`で再度開く | コード0、使用ガス187,803。新しいウィンドウが古いものを置き換えた: `native_only: true`、新しい`opened_height` |
| 閉じる | コード0、使用ガス170,468。読み戻し: `found: false` |

同日、SDK 0.14.0を使って、`allowedTargets`(許可対象のアドレス1件)、`stakingValidators`(バリデーターのオペレーターアドレス1件)、`ibcReceivers`(`channel-0/...`のペア1件)を指定してウィンドウを開いたところ、コード0で成功し、使用ガスは195,233でした。RESTの読み戻しには`allowed_targets`が含まれ、`found: true`、`live: true`が返されました。`validators`、`staking_validators`、`ibc_receivers`のリストは返されないため、ウィンドウを開いたときの値を保管してください。

`fetchEvmWindow`は、同じフィールドをキャメルケース(`openedHeight`、`remainingBlocks`、`nativeOnly`、`allowedTargets`)で返しました。ウィンドウの開始と終了は、ハイブリッド署名のCosmosトランザクションであるため、アカウントが最初に送信するトランザクションには、先に鍵が登録されている必要があります。

### Python、Go、Rust、Java {#other-languages}

各SDKには、メッセージのビルダーとRESTでの読み取りがあります。いずれも、チェーンの境界値をローカルで検査します。v3.2.8のリストを設定する言語のビルダーには、SDK 0.14.0以降が必要です(JavaはMaven Centralの0.14.0)。それ以前のリリースでは、古いフィールドのみが構築されます。

| 言語 | 開く(すべてのリスト付き) | 閉じる | 読み取る | EVMの上限 |
| -------- | ---------------------- | ----- | ---- | ---------- |
| Python | `msg.pqc.open_evm_window(sender=, blocks=, max_txs=, max_value=, native_only=, allowed_targets=, validators=, staking_validators=, ibc_receivers=)` | `msg.pqc.close_evm_window(sender=)` | `get_evm_window(rest, address)` | `fetch_evm_limits(rest)` |
| Go | `messages.NewOpenEVMWindowWithScope(sender, blocks, maxTxs, maxValue, scope)`と`messages.EVMWindowScope` | `messages.NewCloseEVMWindow(sender)` | `rest.GetEVMWindowStatus(address)` | `rest.GetEVMLimits()` |
| Rust | `msg::pqc::open_evm_window_with_scope_any(sender, blocks, max_txs, max_value, &scope)`と`EvmWindowScope` | `msg::pqc::close_evm_window_any(sender)` | `get_evm_window(&rest, address)` | まだヘルパーなし。REST経路を読み取る |
| Java | `EvmWindow.openWithPolicy(sender, blocks, maxTxs, maxValue, nativeOnly, allowedTargets, validators, stakingValidators, ibcReceivers)` | `EvmWindow.close(sender)` | `rest.evmWindow(address)` | `rest.evmLimits()` |

Python:

```python
from qorsdk import RestClient, get_network, get_evm_window, msg

sender = "qor1..."
open_msg = msg.pqc.open_evm_window(
    sender=sender,
    blocks=7200,
    max_txs=20,
    max_value="100000000",  # uqor, integer string
    allowed_targets=["0x1111111111111111111111111111111111111111"],  # your token contract
)
# broadcast it through the usual hybrid path, then:
rest = RestClient(get_network("testnet").endpoints.rest)
status = get_evm_window(rest, sender)
print(status.live, status.remaining_blocks, status.remaining_txs, status.remaining_value)
close_msg = msg.pqc.close_evm_window(sender=sender)
```

Go:

```go
open, err := messages.NewOpenEVMWindowWithScope(sender, 7200, 20, "100000000",
    messages.EVMWindowScope{
        AllowedTargets: []string{"0x1111111111111111111111111111111111111111"}, // your token contract
    })
status, err := rest.GetEVMWindowStatus(sender)
closeMsg, err := messages.NewCloseEVMWindow(sender)
```

Rust:

```rust
use qorechain::evm_window::{get_evm_window, EvmWindowScope};
use qorechain::msg;

let scope = EvmWindowScope {
    allowed_targets: vec!["0x1111111111111111111111111111111111111111".into()], // your token contract
    ..Default::default()
};
let open = msg::pqc::open_evm_window_with_scope_any("qor1...", 7200, 20, "100000000", &scope)?;
let status = get_evm_window(&rest, "qor1...").await?;
let close = msg::pqc::close_evm_window_any("qor1...");
```

Java:

```java
TypedMessage open = EvmWindow.openWithPolicy(sender, 7200, 20, "100000000",
    false,
    List.of("0x1111111111111111111111111111111111111111"), // allowedTargets: your token contract
    null,                                                   // validators
    null,                                                   // stakingValidators
    null);                                                  // ibcReceivers
EvmWindowStatus status = rest.evmWindow(sender);
TypedMessage close = EvmWindow.close(sender);
```

SDKがユーザーに代わってウィンドウを開くことは決してありません。ウィンドウは支出を認可するものであるため、この手順は明示的で、ユーザーに見える形のままにされています。

## フィールド {#fields}

| フィールド(CLIフラグ) | 制限 | 意味 |
| ---------------- | ----- | ------- |
| `blocks`(最初の引数) | 1〜17,280 | ウィンドウは、開始時の高さに`blocks`を加えた高さ以降は何も受け付けません。これは時間ではなくブロック数です。現在のブロック時間では、テストネットで約5時間、メインネットで約15時間です |
| `max_txs`(2番目の引数) | 1〜1,000 | 受け付けるEVMトランザクションの数 |
| `max_value`(3番目の引数) | 正の値 | ウィンドウがアカウントから出すことを許可するuqorの合計: 送金された価値**に加えて**、受け付けた各トランザクションの最大手数料(ガス上限に手数料上限を掛けたもの) |
| `native_only`(`--native-only`) | trueまたはfalse | 単純なQORの送金のみを受け付ける: calldataなし、コントラクト作成なし、コードを持つ受取先なし、EIP-7702の認可なし |
| `allowed_targets`(`--allowed-targets`) | 最大16個の`0x`アドレス、重複なし | これらのアドレス宛てのトランザクションのみを受け付ける。コントラクトの作成は拒否される |
| `validators`(`--validators`) | 最大16個の`0x`アドレス、重複なし | アカウントの署名の検査が、アカウント自身の操作として有効と見なされるコントラクト: ウォレットコントラクトが呼び出すバリデーターモジュール、またはERC-4337のエントリーポイント。v3.2.8 |
| `staking_validators`(`--staking-validators`) | 最大16個の`qorvaloper...`アドレス、重複なし | アカウントがウィンドウ経由で委任または再委任できるバリデーター。v3.2.8 |
| `ibc_receivers`(`--ibc-receivers`) | 最大16エントリーの`<channel>/<receiver>`、各256文字以内、スペースやカンマなし | ネイティブQORのIBC送金の宛先として許可する正確な値。バイト単位で比較されるため、`channel-0`と小文字のbech32受取人を、送金が持つとおりに正確に記述してください。v3.2.8 |

すべての境界値を指定する必要があります。チェーンは、欠けているものをデフォルト値で補わずに拒否します(CLIは、デプロイセッション向けのデフォルト値を自分で補います)。どれか1つの境界値が尽きると、実質的にウィンドウは終了します。ウィンドウが機能するのは、アカウントのポスト量子鍵が使用可能な間のみです。つまり、空でなく、クラシックのみでなく、ガバナンスによって無効化されていない場合です。

### ウィンドウが数えるもの {#counting}

受付時、トランザクションが実行される前に、各EVMトランザクションは`max_txs`の1つを使用し、使用値に、送金された価値と最大手数料(18桁のEVM単位からuqorに変換し、切り上げたもの)を加えます。受け付けられた後にリバートしたトランザクションも、自身の分はすでに使用したことになります。実行後、アカウントに代わってプリコンパイルが移動したネイティブQOR(委任、預入、IBC送金)も、ウィンドウに課金されるため、トランザクションの価値がゼロであっても`max_value`にカウントされます。

カウントされないもの: `eth_call`、`eth_estimateGas`、シミュレーション。トークンはまったく価格換算されません。ERC-20の送金や承認は価値ゼロを持つため、それらはスコープ(`allowed_targets`)で制限してください。各課金は、属性`address`、`evm_address`、`window_open_height`、`used_txs`、`used_value`、`tx_value`、`source`(受付時は`ante`、実行後の課金は`settlement`)を持つ`pqc_evm_window_used`イベントを発行するため、ウォレットはトランザクションが何を消費したかを表示できます。開始と終了は、`pqc_evm_window_opened`と`pqc_evm_window_closed`を発行します。

## ウィンドウ経由の標準プリコンパイル {#precompile-allowlist}

ウィンドウが認可するアカウントに対して、標準プリコンパイル(ステーキング、ディストリビューション、ICS-20、ガバナンス、スラッシング、ERC-20トークンプリコンパイル)のメソッドは、表に含まれており、かつウィンドウが`allowed_targets`でそのプリコンパイルを挙げていない限り、拒否されます。プリコンパイルのアドレスは[EVMプリコンパイル](/developer-guide/evm-precompiles)にあります。ステーキング、ディストリビューション、ICS-20、ガバナンスのものは、それぞれ`0x...0800`、`0x...0801`、`0x...0802`、`0x...0805`です。

| プリコンパイル | メソッド | 受け付けられる条件 |
| ---------- | ------ | ------------- |
| distribution | `claimRewards`、`withdrawDelegatorRewards` | 報酬がアカウント自身に支払われる(その引き出しアドレスが自身のものである) |
| distribution | `withdrawValidatorCommission` | バリデーターがアカウント自身のもので、アカウント自身に支払う |
| distribution | `depositValidatorRewardsPool` | バリデーターが`staking_validators`に含まれ、すべてのコインがネイティブQORである |
| staking | `delegate`、`redelegate` | 宛先のバリデーターが`staking_validators`に含まれる |
| ICS-20 | `transfer` | ネイティブQOR、`transfer`ポート経由、メモなしで、`ibc_receivers`内の組み合わせ宛て |
| ERC-20トークンプリコンパイル | `transfer`、`transferFrom`、`approve` | ネイティブQOR。それ以外のトークンは、ウィンドウがそのトークンのアドレスを挙げている場合のみ |

ステーキング(`0x…0800`)とディストリビューション(`0x…0801`)のプリコンパイルは、この表の他の標準プリコンパイルと同様に、**現時点ではテストネットでもメインネットでも有効化されていません**。ガバナンスによって有効化できます。有効化されていないプリコンパイルのアドレスへの呼び出しは、コードのないアドレスに届くため、成功しますが何も行われず、ガスは消費されます。ウィンドウのフィールド`staking_validators`、`validators`、`ibc_receivers`は、プリコンパイルが有効化された時点から適用されます。ステーキングと報酬の請求には、ネイティブのCosmosメッセージ(QoreX、またはqorechaindのstakingおよびdistributionコマンド)を使用してください。プリコンパイルが有効な場合、その金額は18桁のEVM単位ではなく、`uqor`(6桁)で表します。

それ以外はすべて、ウィンドウが何を挙げていても拒否されます。アンデリゲート、アンボンディングのキャンセル、投票やその他のガバナンス操作、引き出しアドレスの変更、バリデーターの作成や編集、アンジェイル、コミュニティプールへの資金提供などです。これらは、ポスト量子署名されたNativeトランザクションとして送信してください。`ibc_receivers`なしでICS-20を挙げても、送金は受け付けられず、`staking_validators`なしでステーキングのプリコンパイルを挙げても、委任は受け付けられません。

何を挙げるかの例:

| 目的 | ウィンドウ |
| ---- | ------ |
| ステーク、報酬の請求、アンデリゲート、投票 | ネイティブのCosmosメッセージを使用する(QoreXのStakeとClaim、またはqorechaind tx staking / distributionコマンド)。これらにEVMウィンドウは使用しない |
| QORをブリッジで送り出す | ICS-20のプリコンパイルを含む`allowed_targets`と、`channel-0/<receiver>`のような`ibc_receivers` |
| ERC-20プリコンパイルとして保有するIBCトークンを移動する | そのトークンのアドレスを含む`allowed_targets` |

コントラクトを挙げることは、そのコントラクトがアカウントの資産に対して行えることへのアカウントの同意です。アカウントのトークンを保有するボールト、ルーター、トークンについては、ウィンドウはどのトークンがどこへ移動するかを制限しません。

## コントラクトの作成 {#contract-creation}

コントラクトのデプロイには、**スコープなし**のウィンドウが必要です。`native_only`や`allowed_targets`を持つウィンドウは、コントラクトの作成を拒否します。デプロイセッションでは、通常のウィンドウ(CLIのデフォルトはそのために設定されています)を開き、デプロイして、閉じます。その後のセッションでは、`--allowed-targets <contract-address>`を付けてウィンドウを開き、デプロイしたコントラクトへの呼び出しに限定します。HardhatとFoundryを使ったデプロイの手順は、[EVM開発](/developer-guide/evm-development)にあります。

## Permit、EIP-712オーダー、Permit2 {#permits}

EIP-2612のpermit、Permit2の送金、署名済みオーダー、メタトランザクションは、`ecrecover`プリコンパイルを使ってコントラクトが検査します。v3.2.8以降(ネットワークが適用した時点で両方のネットワーク)、使用可能なポスト量子鍵を持つアカウントでは、この検査が成功するのは、アカウント自身の**有効な**ウィンドウが**検証するコントラクト**(呼び出しを転送するルーターではなく、トークンまたはPermit2そのもの)を受け付けている間のみです。

1. ウィンドウにスコープがある場合は、検証するコントラクトを`allowed_targets`に挙げます(`native_only`では、そのような署名は受け付けられません)。
2. ユーザーが署名する**前に**ウィンドウを開きます。有効なウィンドウがないと、署名は無効として扱われ、コントラクトはそれを拒否します。
3. 署名自体がウィンドウに課金されることはありません。署名は、一度使われると公開されるためです。
4. ウィンドウ内で付与されたpermitや承認は、ウィンドウが閉じた後も残ります。セッションの終了時に、承認を確認して取り消してください。

ポスト量子の記録を持たないアカウント、自身の署名を検査する委任されたウォレット、スコープなしのウィンドウ内での送信者自身の署名は、従来どおりリカバリーされます。クエリとガス見積もりは影響を受けません。

## 鍵の変更とEIP-7702の同意 {#key-changes}

- **ポスト量子鍵のローテーション、マイグレーション、再登録を行うと、ウィンドウが閉じ**、EIP-7702の同意が削除されます。その後、ウィンドウを再度開いてください。ホットウォレットや取引所との統合では、これを織り込んでください。
- ウィンドウ、EIP-7702の同意(`MsgAuthorizeEVMDelegation`、`MsgClearEVMDelegation`)、およびアブストラクトアカウントの管理メッセージは、アカウント**自身のトップレベルの、ハイブリッド署名されたメッセージ**でなければなりません。authz(`MsgExec`)経由で送信したり、別のアカウントに付与したりすることはできず、それらのメッセージタイプの付与は拒否されます。この種の既存の同意の付与は、アップグレード時に削除されました。
- 他者のトランザクション内で動作するEIP-7702の委任されたアカウントには、そのコードが動作する時点で、自身の有効なウィンドウが必要です。ない場合、その呼び出しだけが失敗し、呼び出し元のコントラクトがその失敗を確認します。そのため、委任されたアカウントへの支払いが、支払う側のトランザクション全体をリバートさせることはなくなりました。

委任の同意は`qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>`で記録され、`GET /qorechain/pqc/v1/evm_delegation_consent/{address}`で読み取られます。[EIP-7702の委任](/developer-guide/evm-development#eip-7702)を参照してください。

## 適用中の制限 {#limits}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_limits
```

テストネットは、2026年11月12日に、`tx_max_gas`が**30000000**、`precompile_input_max_bytes`が**16384**と応答しました。

| 制限 | 値 | 意味 |
| ----- | ----- | ------- |
| `tx_max_gas` | 30,000,000 | 1つのEVMトランザクションが要求できる最大のガス。これを超えると、トランザクションは実行前に拒否されます。1つのNativeメッセージによって開始されるEVMの実行は、同じバジェットを共有します |
| `precompile_input_max_bytes` | 16,384 | 保護されたステートフルなプリコンパイルが受け付ける最大の入力 |
| ウィンドウの`blocks` | 17,280 | 最長のウィンドウ |
| ウィンドウの`max_txs` | 1,000 | 1つのウィンドウ内の最大トランザクション数 |
| リストのエントリー | リストごとに16 | `allowed_targets`、`validators`、`staking_validators`、`ibc_receivers` |

応答には、ガバナンスで設定された値を持つ`limits`オブジェクトも含まれます。適用中の値である、最上位の`tx_max_gas`と`precompile_input_max_bytes`を読み取ってください。この経路はv3.2.8から提供されるため、公開メインネットは、アップグレードされるまで`501 Not Implemented`を返します。

通常のガス価格で開いたウィンドウも、最大手数料をカウントします。ガス上限30,000,000で手数料上限100 gweiの場合、1つのトランザクションにつき`max_value`に対して3 QORがカウントされます。

## エラー {#errors}

拒否は、コードスペース`pqc`で返されます。EVM JSON-RPC経由では、拒否はメッセージを持ちコードスペースを持たないブロードキャストエラーとして届くため、テキストでも照合してください(SDKの分類器はそうしています)。

| コード | メッセージ | 原因 | 対処 |
| ---- | ------- | ----- | ---------- |
| 26 | `no open EVM authorisation window` | ウィンドウがない、登録済みのポスト量子鍵がない、またはウィンドウが期限切れ | 鍵がなければ先に登録し、その後ウィンドウを開く |
| 27 | `EVM authorisation window exhausted` | 境界値が使い果たされたか、トランザクションがウィンドウのスコープ外(ウィンドウが挙げていない標準プリコンパイル、またはスコープ付きウィンドウでのコントラクト作成を含む) | より大きな境界値または必要なスコープで、新しいウィンドウを開く |
| 28 | `invalid EVM authorisation window` | 制限を超える開始リクエスト、またはその時点で使用可能な鍵がない | `blocks`、`max_txs`、`max_value`、リストを確認する。鍵を登録または修復する |
| 62 | `delegated account has no window covering this action` | 委任されたアカウントが動作した、または送信者が自身のウィンドウがカバーする以上を移動したが、それをカバーするウィンドウがなかった。v3.2.8以降、同じルールにより問題のある呼び出しのみが失敗する | その操作を受け付けるウィンドウを、そのアカウントに対して開く |
| revert | `<method> is disabled: the circuit breaker has tripped ...` | Nativeメッセージが無効化されている標準プリコンパイルのメソッド | 待つ。ウィンドウ側で変更することはない |
| revert | `<method>: account ... has no open EVM authorisation window that lists 0x...` | 価値を動かすプリコンパイルに、コード経由で到達したが、アカウントのウィンドウがそれを挙げていない | プリコンパイルを`allowed_targets`に追加する |
| nonce | `nonce too low` | EVMトランザクションが、ウィンドウが開く前に署名された(開くとnonceが進む) | nonceを読み直して、再度署名する |
| chain id | `only replay-protected (EIP-155) Ethereum transactions are accepted` | チェーンIDなしで署名されたトランザクション | ツールのネットワーク設定にチェーンIDを設定する |

TypeScript SDKの`classifyEvmWindowRejection(err)`は、`"no-pqc-key"`、`"no-window"`、`"exhausted"`、`"invalid"`のいずれかを返します。他のSDKにも同等の分類器があります(Pythonの`describe_evm_window_error`、Goの`tx.ClassifyEVMWindowError`、Rustの`classify_evm_window_error`、Javaの`EvmWindowIssue.classify`)。

## ウィンドウが管理しないもの {#outside}

ウィンドウが管理するのは、EVMレーン、つまりクラシック鍵のみで署名されたトランザクションです。次のものは、それぞれが自身のポスト量子署名を持つか、署名したアカウントのためにモジュールが開始するものであるため、ウィンドウには課金されません。

- アカウントが自分で署名するNativeレーンのメッセージ: bankの送金、ステーキング、ガバナンス、および署名者自身の`0x`アドレスとして実行される、EVMへの`MsgCrossVMCall`。
- アカウントの認証器によって認可されたアブストラクトアカウントの実行。
- モジュールによって実行されるERC-20の変換とIBCコールバック。

送信者自身が送信していない、EVMへのクロスVM呼び出し(たとえばauthzの付与の下でのもの)は、送信者のウィンドウの下で実行され、ウィンドウがその対象を受け付けている必要があります。`0x0901`のクロスVMブリッジには、それを挙げているウィンドウが必要です。[クロスVM相互運用性](/developer-guide/cross-vm-interoperability)を参照してください。

## MetaMaskとQoreXのフロー {#qorex-flow}

MetaMaskは、**Ethereum形式(コイン60)のアカウント**の鍵であるEthereum鍵で署名し、Nativeメッセージを生成することはできません。そうしたアカウントがウィンドウを開く場所がQoreXです。QoreX自身の送信はNativeレーンを使用し、ウィンドウを必要としません。

1. QoreXで、MetaMaskのフレーズに対応するコイン60のアカウントを追加または復元します([MetaMaskまたはダッシュボードからフレーズを復元する](/qorex/getting-started#restore-dashboard)を参照)。アカウントには登録済みのML-DSA-87鍵が必要です。最初のQoreX送金で、それが登録されます。
2. **EVMアクセスウィンドウ**カードを開き(アプリ: 設定、セキュリティ、EVMアクセスウィンドウ。拡張機能: ポップアップ内の**EVMアクセスウィンドウ**ボタン)、ブロック数(最大17,280)、トランザクション数(最大1,000)、QORでの支出上限を選択します。上限は、各金額とその最大手数料をカバーします。デフォルトは、300ブロック、5トランザクション、1 QORです。
3. ハイブリッド署名されたメッセージを承認します。新しいウィンドウは、開いているウィンドウを置き換え、開くとnonceが進むため、MetaMaskから送信するのはその後にしてください。それ以前に準備されたトランザクションは「nonce too low」で拒否されます。
4. チェーンID 9800(テストネット)または9801(メインネット)に対して、MetaMaskから送信します。完了したら**ウィンドウを閉じる**を使用します。これは、ウィンドウが有効な間のみ表示されます。

QoreXのカードが設定するのは、3つの境界値です。スコープのリスト(`allowed_targets`、`validators`、`staking_validators`、`ibc_receivers`、`native_only`)の画面はないため、スコープ付きウィンドウは、`qorechaind`またはSDKから作成します。このカードとその4つの状態については、[EVMアクセスウィンドウ](/qorex/security-and-recovery#evm-window)を参照してください。

## 関連ページ {#related}

- [EVM開発](/developer-guide/evm-development): ランタイム、ガス上限、および[v3.2.8のウィンドウオプション](/developer-guide/evm-development#evm-window-v328)
- [EVMプリコンパイル](/developer-guide/evm-precompiles)
- [クロスVM相互運用性](/developer-guide/cross-vm-interoperability)
- [ポスト量子署名](/developer-guide/post-quantum-signing)
- [SDK EVMガイド](/sdk/guides/evm#evm-window-scope)
- [トランザクションコマンド](/cli-reference/transaction-commands#open-evm-window)および[クエリコマンド](/cli-reference/query-commands)
- [RESTおよびgRPCエンドポイント](/api-reference/rest-grpc-endpoints)
- [初めてのトランザクション](/getting-started/first-transaction#evm-window)
- [QoreX: EVMアクセスウィンドウ](/qorex/security-and-recovery#evm-window)
