---
slug: /developer-guide/svm-lane-v328
title: "SVM レーン: プログラム、アカウント、カストディ制限 (v3.2.8)"
sidebar_label: SVM レーン (v3.2.8)
sidebar_position: 10
---

# SVM レーン: プログラム、アカウント、カストディ制限 (v3.2.8)

SVM レーンは、QoreChain の Solana 互換部分です。Solana スタイルのツールを使って、コンパイル済みプログラムのデプロイ、データアカウントの作成、プログラムの呼び出しができ、同じネイティブ QOR 残高が lamports で見えます。リリース **v3.2.8** は、アップグレード時にこのレーンを閉じ、ガバナンス投票で再開されるまで閉じたままにしました。テストネットではその投票（提案 37）が可決され、レーンは**開放**されています。そのカストディは、ガバナンスで管理される 3 つの制限によって範囲が定められています。

このページでは、レーンの状態の読み取り方、プログラム、アカウント、レントの仕組み、SVM ウォレットがポスト量子鍵を登録する方法、カストディ制限の意味、そして現時点で実行できる例を説明します。

:::note まずテストネット。提案 37 以降、レーンはそこで開放されています
v3.2.8 は、**`qorechain-diana`** テストネットで 2026 年 11 月 12 日から稼働しています。メインネット（`qorechain-vladi`）はまだ v3.2.6 で、v3.2.8 の日付はなく、**メインネットではレーンはオフのままです**。アップグレードはテストネットでレーンを閉じました（SVM の書き込みは失敗し、`MsgRegisterSVMPQCKey` は拒否されました）。**ガバナンス提案 37 が可決され、`qorechain-diana` でレーンが開放されました**。これは `enabled: true` を設定し、他のパラメータはそのままにして、`MsgExecuteProgram` とクロス VM 呼び出しに対するサーキットブレーカーの一時停止を解除しました。投票後の 2026 年 11 月 12 日に確認したところ、`GET /qorechain/svm/v1/params` は `enabled: true` を示し、サーキットブレーカーのリストには `/cosmwasm.wasm.v1.MsgStoreCode` のみが含まれていました。公開 SVM JSON-RPC は引き続き読み取り専用です。必ず最初に実際の状態を読み取り（次のセクション）、決めつけないでください。
:::

## なぜ重要か {#why}

* レーンが閉じている間に SVM の操作を提示するクライアントは、ユーザーに拒否されるトランザクションを返すことになります。最初に 1 つのパラメータを読み取れば、これを避けられます。
* このレーンは実際の QOR を保有しています。プログラム、プログラム派生アドレス、データアカウントにある lamport はすべて、SVM モジュールが保有する uqor に裏付けられています。3 つのカストディ制限がこのプールの範囲を定めているため、送信者に資金があっても、転送や入金が拒否されることがあります。
* レントとサイズの制限は、状態をオンチェーンに保持するコストを決めるため、デプロイの予算に含める必要があります。

## レーンの状態の読み取り {#lane-state}

レーンの状態は、SVM パラメータの `enabled` フィールドです。REST ルートまたはノード CLI から読み取ります。同じレスポンスに、このページのほかのすべての制限が含まれているので、1 回の呼び出しでデプロイの規模を見積もれます。

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

提案 37 が可決された後の 2026 年 11 月 12 日の `qorechain-diana` のレスポンスです（HTTP 200）。

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":true,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

Linux ノード上（パッケージ化された macOS 用バイナリはありません）では、同じ読み取りは次のとおりです。

```bash
qorechaind query svm params --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

TypeScript（Node 18 以降）では次のようになります（この読み取りに SDK の呼び出しは不要です）。

```ts
const REST = "https://api-testnet.qore.host";

const { params } = await (await fetch(`${REST}/qorechain/svm/v1/params`)).json();
if (!params.enabled) {
  throw new Error("The SVM lane is closed on this network; do not offer SVM actions");
}
console.log("compute units per instruction:", params.compute_budget_max);
```

これらのパラメータ用の型付きヘルパー（およびパラメータ提案を安全に構築するビルダー）は、v3.2.8 向けの SDK ドラフトに含まれていますが、まだ公開されていません。後の SDK リリースで追加されます。それまではコマンドラインまたは REST ルートを使ってください。

### クラスター ID {#cluster-info}

`cluster_info` は、ウォレット向けにクラスターを識別し、実行がオンかどうかを示します。`execution_enabled` 以外の点では、レーンの状態によって変わりません。

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/cluster_info
```

提案 37 が可決された後に読み取った 2026 年 11 月 12 日のレスポンスで、`execution_enabled` は `true` です（HTTP 200）。

```json
{"chain_id":"qorechain-diana","genesis_hash":"6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj","caip2_chain_id":"solana:6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zR","derivation":"base58(SHA-256(\"qorechain/svm/genesis-hash/v1\" || 0x00 || chain_id))","execution_enabled":true}
```

ノード CLI にも同じクエリがあります: `qorechaind query svm cluster-info`。`https://svm-testnet.qore.host` の JSON-RPC メソッド `getGenesisHash` も同じハッシュを返します。このハッシュはチェーン ID から導出されたもので、実際の Solana クラスターのジェネシスハッシュではありません。

## 公開 SVM RPC は読み取り専用です {#public-rpc}

公開エンドポイント `https://svm.qore.host` と `https://svm-testnet.qore.host` は、読み取りには応答し、公開チェーン ID 上の書き込みメソッド（`sendTransaction` など）は、レーンが開放されているかどうかにかかわらず拒否します。SVM トランザクションを送信するには、自分のノードを実行する必要があります。ノードは、デフォルトでポート 8899 で Solana 互換の JSON-RPC を提供します（[SVM 開発](/developer-guide/svm-development#json-rpc-server)を参照）。また、そのノードが追従するネットワークでレーン自体が開放されている必要があります。読み取りは今すぐ利用できます。

```bash
# Health, version, cluster hash, slot and a rent quote (all HTTP 200 on 12 November 2026)
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getGenesisHash","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getMinimumBalanceForRentExemption","params":[1024]}'
```

`getVersion` は、チェーン ID、クラスター ID、ジェネシスハッシュとともに、`solana-core` の `1.18.0-qorechain` を報告しました。2026 年 11 月 12 日における 1,024 バイトのレント見積もりは `8017920` lamports でした。REST ルート `GET /qorechain/svm/v1/account/{address}`、`.../program/{address}`、`.../slot` は、公開エンドポイントで **HTTP 501**（未実装）を返しました。アカウントとプログラムは、JSON-RPC メソッド `getAccountInfo` と `getMultipleAccounts`、またはノード CLI で読み取ってください。

## プログラムのデプロイと呼び出し {#programs}

レーンが開放されたら、流れは次のとおりです。最新の Solana ツールチェーンで SBF プログラムをビルドし、デプロイし、必要なアカウントを作成してから、呼び出します。`tx svm` のコマンドはすべて Cosmos レーンのトランザクションなので、明示的なガスの上限、ガス × 0.1 uqor 以上の手数料、そしてハイブリッドのポスト量子連署が必要です（[ポスト量子署名](/developer-guide/post-quantum-signing)を参照）。

以下は、ノードリファレンスにある Linux ノード CLI のコマンドです。**UNTESTED: テストネットでレーンが開放されたのは提案 37 の後であり、このページのために、プログラムのデプロイ、実行、アカウント作成は実行していません。**

```bash
# 1. Build (platform-tools v1.53, --arch v0 or --arch v3)
cargo build-sbf --arch v3

# 2. Deploy; the response carries the program id in base58
qorechaind tx svm deploy-program ./my_program.so --from mykey \
  --gas 2000000 --fees 200000uqor --chain-id qorechain-diana --generate-only > tx.json
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana

# 3. Create a data account owned by the program (space in bytes, lamports for rent)
qorechaind tx svm create-account <owner-base58> <space> <lamports> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json

# 4. Call the program
qorechaind tx svm execute <program-id-base58> <data-hex> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json
```

ノード上での読み取りは、レーンの状態にかかわらず利用できます。

```bash
qorechaind query svm account <base58-address>
qorechaind query svm program <base58-address>
qorechaind query svm params
qorechaind query svm slot
```

### @qorechain/svm 0.13.0 を使った TypeScript {#typescript}

`@qorechain/svm` は `@solana/web3.js` の上に載る薄いレイヤーです。ローダーのラッパーはありません。デプロイには上記のノード CLI を使い、すでに存在するプログラムへの命令の構築と送信にはこのパッケージを使ってください。公開プリセットは意図的に SVM エンドポイントを設定していないため、自分のノードの URL を渡してください。

```ts
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createSvmClient,
  createInvokeInstruction,
  withComputeBudget,
  svmKeypairFromSecretKey,
} from "@qorechain/svm";

const client = createSvmClient({ rpcUrl: "http://127.0.0.1:8899" }); // your own node

const payer = svmKeypairFromSecretKey(secretKey64);       // 64-byte Solana-style secret key
const programId = new PublicKey("<program-id-base58>");
const dataAccount = new PublicKey("<data-account-base58>");

const tx = new Transaction().add(
  createInvokeInstruction(
    programId,
    [{ pubkey: dataAccount, isSigner: false, isWritable: true }],
    Uint8Array.from([0]),                                  // your program's instruction data
  ),
);
withComputeBudget(tx, { units: 200_000 });                 // stay under compute_budget_max

const sim = await client.simulateTransaction(tx);          // dry run first
const signature = await client.sendTransaction(tx, [payer]);
```

**UNTESTED:** この例には、自分で実行するノードが必要です（レーンはテストネットで開放されています）。公開エンドポイントに対しては、送信は拒否されます。読み取り専用の呼び出し（`client.getBalance`、`client.getAccountInfo`、`client.getSignaturesForAddress`）は、`createSvmClient({ rpcUrl })` が任意の URL を受け付けるため、`https://svm-testnet.qore.host` に対して動作します。

Python、Go、Rust、Java については、それらの言語の SVM アダプターが同じメッセージを構築します。v3.2.8 のヘルパーは後の SDK リリースで追加されます。それまでは、上記のノード CLI または生のメッセージを使ってください。メソッドセットが Solana 互換であるため、どの Solana クライアントライブラリでも、自分のノードのポート 8899 と通信できます。

## アカウントとレント {#rent}

SVM のデータアカウントは、使用する容量の分を支払います。数値は上記の実際のパラメータから得られます。

| 項目 | ルール | 実際の値（テストネット） |
| ---- | ---- | -------------------- |
| 年間のレント | データサイズ（バイト）× `lamports_per_byte` | 1 バイトあたり 3,480 lamports |
| レント免除の最小額 | 年間のレント × `rent_exemption_multi` | 倍率 2.0 |
| 最小額以上の資金がある場合 | レントは課金されない | |
| 最小額を下回る資金の場合 | エポックごとにレントが差し引かれる | |
| 残高がゼロになる場合 | アカウントは削除される | |

lamports と uqor の関係は、1 uqor = 1,000 lamports です。正確な最小額は、計算せずにノードに問い合わせてください。`getMinimumBalanceForRentExemption` は、1,024 バイトに対して 8,017,920 lamports を返しました（見積もりにはアカウントヘッダーが含まれます）。`create-account` にはその額以上の lamports が必要で、そうでなければアカウントはレント免除になりません。

アドレスについて: アカウントの SVM アドレスは、20 バイトのアカウントバイトを 32 バイトまでパディングし、base58 で表記したものです。`qor1...`、`0x...`、base58 の各形式は、同じアカウントを指します。

## SVM ウォレット向けのポスト量子鍵 {#pqc-key}

ポスト量子鍵をオンチェーンに持ちたい SVM ウォレットは、**`MsgRegisterSVMPQCKey`** で登録します。このメッセージは、送信者、32 バイトの SVM アドレス、ML-DSA-87 公開鍵を運びます。これは Cosmos レーンのメッセージなので、送信者は他のネイティブトランザクションと同様にハイブリッドで署名します。レーンが閉じている間は拒否され、**鍵を登録する前に SVM アカウントがすでに存在している必要があります**（[テストネットでの検証](#tested)の拒否を参照）。

そのための `tx svm` コマンドはありません。SDK のコンポーザーを使ってください。TypeScript では、コンポーザーは `@qorechain/sdk` の `msg.svm.registerSvmPqcKey` です。**既存のアカウントについては UNTESTED: 唯一の送信はアカウントのないアドレス向けで、拒否されました。**

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  msg,
} from "@qorechain/sdk";
import { fromBech32 } from "@cosmjs/encoding";

const client = createClient({
  network: "testnet",
  endpoints: { rest: "https://api-testnet.qore.host", rpc: "https://rpc-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);
const tx = await client.connectTx(signer, { pqcKeypair });   // signs hybrid

// 20 account bytes padded with zeros to the 32-byte SVM address
const svmAddr = new Uint8Array(32);
svmAddr.set(fromBech32(account.address).data);

await tx.signAndBroadcast(
  [msg.svm.registerSvmPqcKey({ sender: account.address, svmAddr, pqcPubKey: pqcKeypair.publicKey })],
  "auto",
);
```

Python のコンポーザーは `msg.svm.register_svm_pqc_key(sender=, ...)`、Go のものは `Svm.RegisterPQCKey(sender, svmAddr, pqcPubKey)` です。

## カストディ制限 {#custody}

プログラム、プログラム派生アドレス、データアカウントが保有するすべての lamport は、SVM モジュールがカストディと呼ばれる 1 つのプールで保有する uqor に裏付けられています。ガバナンスで管理される 3 つのパラメータがその範囲を定めています。3 つとも単位は uqor で、1 QOR は 1,000,000 uqor です。ガバナンスはパラメータ提案でこれらを変更し、提案はセット全体を置き換えるため、12 個すべてのフィールドを送る必要があります。

| パラメータ | 実際の値 | 平易な説明 |
| --------- | ---------- | -------------- |
| `max_custody_uqor` | 10,000,000,000（10,000 QOR） | SVM プールの残高の上限。プールをそれより上に押し上げる転送は、`svm custody cap exceeded`（コード 23）で拒否されます。`0` は上限なしを意味します。 |
| `max_custody_hard_uqor` | 1,000,000,000,000（1,000,000 QOR） | レント準備金、事前入金、単純な寄付を含む、プールの生の残高に対する絶対的な上限。残高をそれより上にする操作は拒否されます。`max_custody_uqor` を下回ってはならず、レーンを開放するにはゼロより大きい必要があります。 |
| `max_account_excess_uqor` | 10,000,000,000（10,000 QOR） | 1 つのデータアカウントがレント免除の最小額を超えて保有できる最大額。`0` はアカウントごとの上限なしを意味します。 |

アプリケーションにとっての意味は次のとおりです。SVM アカウントに置く価値は控えめにし、レントの最小額を超える分は必要なだけにしてください。自分の残高では問題のない入金でも、プール全体が上限に近い場合は拒否されることがあります。そのため、コード 23 は無効なトランザクションではなく、「後で、またはもっと少ない額で試す」という意味として扱ってください。これらの制限は、ガバナンス投票によってのみ引き上げられ、ユーザーのトランザクションでは決して引き上げられません。

## コンピュート予算とサイズの制限 {#limits}

| 制限 | パラメータ | 実際の値（テストネット） |
| ----- | --------- | -------------------- |
| 命令あたりのコンピュートユニット | `compute_budget_max` | 1,400,000 |
| プログラムのサイズ（ELF） | `max_program_size` | 10,485,760 バイト（10 MiB） |
| データアカウントのサイズ | `max_account_data_size` | 10,485,760 バイト（10 MiB） |
| ネストしたプログラム呼び出し | `max_cpi` | 4 |
| デフォルトの署名スキーム | `default_sig_scheme` | 0（Ed25519） |
| スロットオフセット | `svm_slot_offset` | 0（スロットはブロック高さにオフセットを加えたもの） |

各フレームには 32 KiB のスタックと 256 KiB のヒープがあります。上記の値はガバナンスによって変更される可能性があるため、実際の値を読み取ってください。`@qorechain/svm` 0.13.0 では、`withComputeBudget(tx, { units })` がコンピュートユニットの上限を要求します。これは `compute_budget_max` 以下に保ってください。

## テストネット SVM エンドポイントの現在の制限 {#endpoint-limits}

レーンは開放されていますが、公開 SVM JSON-RPC はまだ完全な Solana ノードのようには動作しません。次の制限を前提に計画してください。

- **`getLatestBlockhash` は、ブロックハッシュを 64 桁の 16 進文字として返します。** Solana ノードのような base58 ではありません（2026 年 11 月 12 日に読み取り: `blockhash` は `e8d4...d449`、`lastValidBlockHeight` は 9944659）。base58 を想定するクライアントは変換する必要があります。チェーンチームは変更を予定しています。
- **標準的な Solana ツールからの Solana ワイヤフォーマットの `sendTransaction` は、公開エンドポイントではまだサポートされていません。** プログラムは、Cosmos メッセージ `MsgDeployProgram` と `MsgExecuteProgram` でデプロイおよび呼び出され、他の Cosmos レーンのトランザクションと同様にハイブリッド署名で署名されます（上記の TypeScript ヘルパーを参照）。Solana ツールとの完全な互換性は、後のリリースで予定されています。
- **外部の鍵は、リレーヤー経由で SVM の操作を認可できます。** ネットワークがプロトコル機能 `svm-relayed-chain-bound` を有効にすると、認可はチェーンに束縛されたダイジェスト（ドメイン `qorechain-svm-auth-v3`）に署名します。`@qorechain/wallet-adapter` 0.6.0 は `authSignBytesV3` でそれを構築し、`resolveSvmAuthVersion` はネットワークが求める形式を読み取ります。

## エラーと拒否 {#errors}

| 表示される内容 | 意味 | 対処 |
| ------------ | ------- | ---------- |
| `SVM module is disabled`（コード 11） | レーンが閉じている（メインネット、または提案 37 より前のテストネット） | `enabled` を読み取る。再試行しない |
| `MsgRegisterSVMPQCKey` が `SVM account ... not found`（codespace `svm`、コード 3）で拒否される | SVM アカウントがまだ存在しない | 先にアカウントを作成し、それから鍵を登録する |
| レーンが閉じている間に `MsgRegisterSVMPQCKey` が拒否される | レーンが閉じている | レーンが開放された後に登録する |
| `svm.qore.host` または `svm-testnet.qore.host` で書き込みメソッドが拒否される | 公開エンドポイントは読み取り専用 | 自分のノードを使う |
| `svm custody cap exceeded`（コード 23） | プールが上限に達している | 後で、またはもっと少ない額で再試行する |
| `airdrop rate limit exceeded`（コード 19） | `requestAirdrop` の呼び出しが多すぎる（テストネットのみ） | 待つ |
| `blockhash expired`（コード 20） | 直近のブロックハッシュが古すぎる | 新しいものを取得して再署名する |
| `svm simulation slots busy, retry later`（コード 24） | シミュレーションには上限がある。ブロック内では発生しない | シミュレーションを再試行する |
| `/qorechain/svm/v1/account/...` で HTTP 501 | 公開エンドポイントではルートが未実装 | `getAccountInfo` を使う |

## テストネットでの検証 {#tested}

提案 37 が可決された後の 2026 年 11 月 12 日に、`qorechain-diana`（リリース v3.2.8）で実行しました。

| ステップ | 結果 |
| ---- | ------ |
| `GET /cosmos/circuit/v1/disable_list` | `/cosmwasm.wasm.v1.MsgStoreCode` のみ |
| `GET /qorechain/svm/v1/params` | `enabled` は true。`max_program_size` 10485760、`max_account_data_size` 10485760、`compute_budget_max` 1400000、`lamports_per_byte` 3480、`rent_exemption_multi` 2、`max_cpi` 4、`max_custody_uqor` 10000000000、`max_custody_hard_uqor` 1000000000000、`max_account_excess_uqor` 10000000000 |
| まだ存在しない SVM アドレスに対する `MsgRegisterSVMPQCKey` | 拒否: codespace `svm` のコード 3、`SVM account ... not found: SVM account not found`。ポスト量子鍵を登録する前にアカウントが存在していなければなりません |

実行していないもの（UNTESTED）は、プログラムのデプロイ、プログラムの実行、SVM アカウントの作成です。

## メインネット {#mainnet}

メインネットは当面 v3.2.6 のままで、SVM レーンはオフです。メインネットで有効にするには、後のリリースとガバナンス投票が必要です。計画はテストネットのみを基準にしてください。

## 関連項目 {#see-also}

* [SVM 開発](/developer-guide/svm-development): レーンの概要、JSON-RPC サーバー、lamports としてのネイティブ QOR。
* [Solana 互換 JSON-RPC](/api-reference/json-rpc-solana-compatible): メソッド一覧。
* [ポスト量子署名](/developer-guide/post-quantum-signing): すべてのネイティブレーンのトランザクションに必要なハイブリッド署名。
* [クロス VM 相互運用性](/developer-guide/cross-vm-interoperability): SVM、EVM、QoreChain Native 間の呼び出し。
* [ノードオペレーター: v3.2.8 チェックリスト](/developer-guide/node-operators-v328): ノードのアップグレード。
