---
slug: /developer-tools/custody-kit
title: QoreChainカストディキット
sidebar_label: カストディキット
sidebar_position: 32
---

# QoreChainカストディキット

QoreChainカストディキットは、QoreChain上で顧客の資金を保管するカストディアンや取引所向けの、文章による統合ガイド、テストベクターのセット、小さなリファレンスコードです。各実行レーンでネットワークが何を要求するかを説明し、統合で間違えやすい部分を読みやすいコードで示します。具体的には、アドレスのチェック、署名済みトランザクションのブロードキャスト前のデコードと検証、どの着金を計上するかの判断です。

対象は、カストディアン、取引所、決済事業者、ウォレットのバックエンド、そしてそれらの統合をレビューするエンジニアと監査人です。バージョン**0.1.0**、2026年10月27日に公開、Apache-2.0。メインネット(`qorechain-vladi`)とテストネット(`qorechain-diana`)に対応しています。同梱のライブチェックはテストネットに対して実行され、読み取りのみを行います。

**最初にお読みください: このキットはライブラリではなく、サンプルコードです。** リポジトリをクローンし、お使いの言語のフォルダーを読む、コピーする、またはベンダリングしてください。このキットのnpm、PyPI、crates.io、Maven Centralのパッケージは、意図的に存在しません。形式上の例外はGoだけです。Goのフォルダーはタグ付きバージョンを持つGoモジュールなので`go get`で取得できますが、それでも安定したAPIが約束されたものではなく、サンプルコードです([ライブラリであるものとサンプルコードであるもの](#library-vs-example)を参照)。署名と暗号的な検証は、公開ライブラリである[QoreSign](/qoresign/overview)が担います。

## 革新点 {#innovations}

- **5つの言語で同じ動作を、1つのファイルで証明。** TypeScript、Python、Go、Rust、Javaが、同じ4つの関数を、同じ結果と同じエラーコードで実装しています。すべての言語が共通のテストベクターファイル`vectors/custody-v1.json`に対して実行されるため、キットを別の言語に移植するチームは、一致することを証明できます。
- **アドレスに対する安定したエラーコード。** `validateAddress`は決して例外を投げません。成功時にはアドレスの2つの表記を返し、失敗時には11個の安定したコード(`EMPTY`、`WHITESPACE`、`BAD_HEX`、`BAD_EIP55`、`NO_CHECKSUM`、`MIXED_CASE`、`BAD_BECH32`、`BAD_CHECKSUM`、`WRONG_PREFIX`、`BAD_LENGTH`、`KIND_NOT_ALLOWED`)のいずれかを返すので、出金フォームで正確な理由を表示できます。
- **ブロードキャスト前に両方の署名をチェック。** `verifyTx`は、`SignDoc`に対するsecp256k1署名、渡された鍵に対するML-DSA-87レイヤー、そしてトランザクション内の公開鍵が想定した鍵かどうかを検証します。`{ valid, classical, signerKey, pq }`を返し、不正な署名では例外を投げず、形式が不正な入力に対してのみ例外を投げます。別のプロセスが、何かを送信する前にすべての署名済み出金に対してこれを実行できます。
- **理由つきの入金判断。** `extractDeposits`は、トランザクションのすべての着金を、`creditable`フラグと`reason`(`evm_failed`、`fee_refund`、`unsupported_message`、または`null`)とともに返します。EVM統合の担当者が驚くケース、つまり失敗したEVM実行でもネイティブレベルの結果コードは0を報告する、という場合を捉えます。
- **ノードに一致するクエリビルダー。** `buildDepositQuery`は、アドレス宛ての着金に対する、パーセントエンコードされた正確なRESTパスを生成します(limitは1~100、高さの範囲、昇順)。また、`0x`の入力を`qor1`形式に変換します。
- **レーンごとに書かれたガイダンス。** ガイドは、Nativeレーン、認可ウィンドウを持つEVMレーンをカバーし、SVMレーンはトランザクションに対して開放されていないため、その上に入金や出金のフローを構築してはならないことを明記しています。

## ユースケース {#use-cases}

1. **取引所の入金スキャナー。** 高さのカーソルを保持し、自分のノードに対して`buildDepositQuery({ address, minHeight, maxHeight })`を呼び出し、続いて`extractDeposits(txResponse, address)`で、成功した`MsgSend`、`MsgMultiSend`、EVM送金を`uqor`で計上します。失敗したEVM実行、ガスの払い戻し、その他のメッセージは、除外されるか、レビュー対象としてフラグが付きます。
2. **第二承認者を置いた出金パイプライン。** 署名者がハイブリッド署名付きの出金を作成した後、独立したプロセスが`decodeTx`(受取人、金額、手数料、メモ)と`verifyTx`(両方の署名、想定した鍵)を、トランザクションのブロードキャスト前に実行します。
3. **アドレスの受け付け。** ユーザーが入力したすべての出金アドレスを`validateAddress`で検証し、`qorvaloper`アドレスは支払い先として拒否し、必要に応じて16進入力にEIP-55チェックサムを必須にします。
4. **HSMの計画。** セキュリティチームは、鍵管理ガイドを使って、HSMで生成するML-DSA-87鍵とニーモニックベースの正規導出のどちらにするかを選び、空のコンテキストでの純粋なML-DSA-87署名に対するPKCS #11 v3.2のサポートを確認し、ローテーションとバックアップを設計します。
5. **EVMの支払いレール。** EVMレーンで支払いを行う取引所は、ML-DSA-87鍵を一度登録し、バッチごとに1つのハイブリッドNativeレーンのトランザクションでスコープ付きの認可ウィンドウを開き、その後は既存のsecp256k1スタックで通常のEIP-1559トランザクションに署名します。
6. **顧客向けのステーキング。** ステーキングを提供するカストディアンは、ステーキングガイド(委任、委任解除、再委任、報酬、ステーキングティアのロック)に従い、署名の前にすべてのステーキングメッセージを`decodeTx`でデコードします。
7. **別の言語への移植、または監査。** 独自の実装を書くチームは、それを`vectors/custody-v1.json`に対して実行して、リファレンスの結果およびエラーコードと一致することを示します。
8. **メインネット前のリハーサル。** 統合チームは、テストネットでのリハーサル(鍵の登録、ハイブリッド送金、入金スキャン、ステーキング、EVMウィンドウ、鍵のローテーション)と、統合チェックリストに従います。

## 仕組み {#how-it-works}

### キットの内容 {#contents}

| 部分 | 内容 |
|---|---|
| `docs/` | 10のガイドページ: レーンごとの署名、アドレスと導出、入金、出金、ステーキング、エラー、鍵管理、テスト環境、統合チェックリスト、FAQ。 |
| `code/ts`、`code/python`、`code/go`、`code/rust`、`code/java` | 同じ4つの関数を持つリファレンスコードと、言語ごとの小さなサンプルのコマンドライン。 |
| `vectors/custody-v1.json` | テストベクター: エラーコードごとの正しいアドレスと不正なアドレス、ハイブリッド署名付きの`MsgDelegate`、eth-nativeアカウントからのハイブリッド署名付きの`MsgOpenEVMWindow`、ステーキングとウィンドウのメッセージ、形式が不正なトランザクション、入金クエリ、入金抽出のケース。QoreSignのベクターは参照によって再利用され、SHA-256でチェックされます。 |
| ライブチェック | テストネットに対する読み取り専用のチェックで、`QORE_LIVE_TEST=1`で有効になります: ステーキングのパラメーター、最近の送金に対する入金クエリ、コミット済みのハイブリッドトランザクションの検証。 |

### ライブラリであるものとサンプルコードであるもの {#library-vs-example}

| 要素 | 種類 | 入手先 |
|---|---|---|
| QoreSign(署名、ML-DSA-87とsecp256k1の検証、鍵登録メッセージ) | 公開ライブラリ | npm、PyPI、crates.io、Go、Maven Central。[QoreSign](/qoresign/overview)を参照。 |
| TypeScript、Python、Rust、Javaのキットのコード | サンプルコード。どのレジストリにも公開されていません | `qorechain/qorechain-custody-kit`をクローンし、フォルダーをコピーまたはベンダリングします。 |
| Goのキットのコード(パッケージ`custodykit`) | サンプルコード。タグ付きバージョンのGoモジュールとして取得できますが、安定したAPIの約束はありません | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0`、またはクローンしてベンダリングします。 |
| ガイドページ、ベクター、チェックリスト | ドキュメントとデータ | リポジトリ。 |

キットは署名方式を実装していません。ML-DSA-87とsecp256k1の検証はQoreSignが提供します。Pythonのコードには、EIP-55チェックサムのためだけに使う小さなKeccak-256が含まれており、それ以外の用途はありません。

### レーン {#lanes}

| レーン | カストディアンが署名するもの | ステータス |
|---|---|---|
| ネイティブ (Cosmos SDK) | secp256k1の`SIGN_MODE_DIRECT`に加えてML-DSA-87(FIPS 204)レイヤー。鍵が登録されたアカウントには従来型の経路がありません。鍵のないアカウントが従来型で送信できるのは、鍵を登録するため(またはアンジェイルするため)だけです。 | 開放 |
| EVM | 通常のsecp256k1のEthereumトランザクション(EIP-155とEIP-1559)。ML-DSA-87鍵が登録され、ハイブリッドNativeレーンのトランザクションで開かれた有効な認可ウィンドウを持つ送信者に対して受け付けられます。ウィンドウごとにML-DSA-87署名が1つ必要です。 | 開放 |
| SVM | 該当なし | トランザクションに対しては未開放 |

### ハイブリッドNativeレーンのトランザクション {#hybrid}

- ハイブリッドトランザクションは、同じアカウントが2回署名した通常の`TxRaw`です。ML-DSA-87署名は、拡張オプション`/qorechain.pqc.v1.PQCHybridSignature`(`algorithm_id = 1`、4,627バイトの署名、任意で2,592バイトの公開鍵)としてボディ内に載ります。secp256k1署名は、拡張を含む最終的なボディに対する通常の`SIGN_MODE_DIRECT`署名です。
- ML-DSA-87署名は、拡張を除いた署名対象バイト列をカバーします。両方の公開ネットワークは署名対象バイト列v2(ドメイン文字列、チェーンID、そしてボディとauth infoのバイト列)を検証します。ヘッジ版と決定論的なFIPS 204署名はどちらも受け付けられます。規範となる形式は[QoreSignハイブリッド署名仕様](/qoresign/spec/hybrid-signing-v1)です。
- 処理の順序: ボディとauth infoをエンコード(手数料とガスは固定)、v2の署名対象バイト列を計算、ML-DSA-87で署名、拡張を追加、`SignDoc`にsecp256k1で署名、ブロードキャスト。
- 鍵の登録: `MsgRegisterPQCKeyV2`(`key_type = "hybrid"`、任意だが推奨される所有証明つき)を、鍵のないアカウントから従来型で署名し、ホットアドレスごとに一度行います。QoreSignがメッセージ全体を構築します。
- ハイブリッドトランザクションは従来型より約4.7 KB大きく、より多くのガスを使うため、必ずシミュレートしてください。

### アドレス {#addresses}

- `qor1...`と`0x...`は、同じ20バイトの2つの表記です。どちらに送っても、同じ残高に着金します。`qorvaloper1...`はバリデーターのオペレーターアドレスであり、支払いアドレスにはなりません。
- アカウントの種類は2つあります。`secp256k1`(コインタイプ118、パス`m/44'/118'/0'/0/i`)と、eth-nativeの`eth_secp256k1`(コインタイプ60、パス`m/44'/60'/0'/0/i`)です。同じニーモニックから2つの異なるアカウントが得られます。eth-nativeアカウントでは、1つの鍵でNativeレーンとEVMレーンの両方を操作できます。
- ML-DSA-87鍵は、正規導出(QoreChainのウォレットとSDKが登録するもので、`qor1`アドレスとニーモニックに結び付けられます)、階層導出のドラフト、またはHSMで生成したランダムな鍵のいずれかから得られます。登録すれば、有効な鍵であればどれでも機能します。[鍵の導出](/qoresign/guides/key-derivation)を参照してください。

### 入金 {#deposits}

- QoreChainは、ブロックがコミットされた時点でそのブロックをファイナライズします。リオーグはないため、コミット済みブロック内のトランザクションは1ブロックで確定します。追加の確認数は運用上の選択です。
- Nativeレーンの入金は、`GET /cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...' AND tx.height>=H1 AND tx.height<=H2&order_by=ORDER_BY_ASC`で見つけられます。`buildDepositQuery`はまさにこのパスを構築します。
- `extractDeposits`の計上ルール: `code != 0`のトランザクションは何も動かしていません。`msg_index`のない`transfer`は手数料の支払いです。金額はデノミネーション(デフォルトは`uqor`)でフィルターされます。`MsgSend`と`MsgMultiSend`の出力は計上可能です。`MsgEthereumTx`は、EVM実行が失敗した場合、またはその送金が手数料コレクターからのガスの払い戻しである場合を除き、計上可能です。それ以外はすべて、レビュー用に`reason: "unsupported_message"`とともに返されます。

### 出金とガス {#withdrawals}

- 手数料 = ceil(ガスリミット x ガス価格)を`uqor`で表します。最低ガス価格は0.1 uqorで、ガスリミットに対して課金されます。
- ガスリミットは、完全に署名されたトランザクションのシミュレーションから取得します。v3.2.5アップグレードを適用済みのノード(現在のテストネット、適用後のメインネット)では、シミュレーションにML-DSA-87の検証が含まれるため、`ceil(gas_used x 1.02) + 2000`を使います。それ以前は`ceil((gas_used + 40000) x 1.4)`を使います。どちらが当てはまるかは日付ではなく、`GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.5`で判定します。
- ガスリミットを決めたら、`AuthInfo`を再構築して再度署名します。両方の署名が手数料をカバーしているためです。
- シーケンス: ホットアドレスごとに署名者のキューを1つ運用するか、並列で支払うために複数のホットアドレスを使います。

### EVM認可ウィンドウ {#evm-windows}

- ウィンドウは`/qorechain.pqc.v1.MsgOpenEVMWindow`で開きます(`blocks`は1~17,280、`max_txs`は1~1,000、`max_value`は`uqor`で、値と最大手数料の合計として数えます。任意の`native_only`、最大16アドレスの任意の`allowed_targets`)。閉じるには`MsgCloseEVMWindow`を使います。状態は`GET /qorechain/pqc/v1/evm_window/{address}`にあります。
- ウィンドウを開くと既存のウィンドウは置き換えられ、アカウントのシーケンス(これがEVMのnonceです)が進みます。まずウィンドウを開き、その後でnonceを読み取ってください。
- `eth_call`と`eth_estimateGas`にはウィンドウは不要です。

## 使い方 {#how-to-use}

### コードの入手 {#install}

キットはリファレンスコードです。パッケージをインストールするのではなく、リポジトリをクローンするか、お使いの言語のフォルダーをベンダリングしてください。

| 言語 | 入手方法 | 依存先 | 最低限のプラットフォーム |
|---|---|---|---|
| TypeScript | `git clone https://github.com/qorechain/qorechain-custody-kit`、その後`cd code/ts && pnpm install && pnpm build` | `@qorechain/qoresign` 0.1.0 (npm) | Node.js 20 |
| Python | クローンし、`cd code/python && pip install -r requirements-dev.txt`。`verify_tx`には、さらに`pip install qorechain-qoresign==0.1.1` | 実行時には何もなし。`verify_tx`には`qorechain-qoresign` 0.1.1 (PyPI) | Python 3.9 |
| Go | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0`(パッケージ`custodykit`)、またはクローン | `github.com/qorechain/qoresign/go` v0.1.0 | Go 1.25 |
| Rust | クローンし、`cd code/rust && cargo build`(crates.ioにはありません) | `qorechain-qoresign` 0.1.0 (crates.io) | Rust 2021エディション |
| Java | クローンし、`cd code/java && mvn test`(Maven Centralにはありません) | `io.github.qorechain:qoresign:0.1.0` (Maven Central)、Gson | Java 17 |

QoreSignは、キットが使うすべての言語(Pythonを含む)向けに公開されています。Pythonコードの`verify_tx`には、PyPIの`qorechain-qoresign` 0.1.1(macOSとLinux)が必要です。TypeScript、Go、Rust、JavaのコードはQoreSign 0.1.0に固定されており、0.1.1と並んで引き続き公開されています。

### クイックスタート {#quickstart}

対象ネットワーク: チェーンを読み取るものはすべてテストネット(`qorechain-diana`)です。環境変数`QORE_REST`により、サンプルとライブチェックを別のRESTエンドポイントに向けられます。本番ではそれが自分のノードになります。以下のアドレスは公開のBIP-39テスト用フレーズから得たもので、資金を保持してはいけません。

**1. アドレスを検証する(Go、オフライン)。** 2026年10月27日に、タグ`v0.1.0`のクローンから実行しました。

```bash
cd code/go
go run ./cmd/custody-kit validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94
```

次のように出力されました(終了コード0)。

```json
{
  "valid": true,
  "kind": "account",
  "format": "hex",
  "checksum": "eip55",
  "bech32": "qor1npvwllfr9dqr8erajqqr6s0vxnk2ak55am9g2c",
  "hex": "0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
}
```

バリデーターのアドレスは、`--allow-validator`で許可しない限り拒否されます。

```bash
go run ./cmd/custody-kit validate qorvaloper19rl4cm2hmr8afy4kldpxz3fka4jguq0a5ws5he
```

`"valid": false`と`"error": "KIND_NOT_ALLOWED"`、詳細`a validator address is not accepted here`が出力され、終了コード1で終了しました。同じチェックアウトで、Goのテストスイート(`go test ./...`)も成功しました。

**2. 署名済みトランザクションをブロードキャスト前にデコードして検証する。**

```bash
go run ./cmd/custody-kit decode <tx hex or base64>
go run ./cmd/custody-kit verify <tx> --chain-id qorechain-diana --account-number <n> \
  --pubkey <33-byte hex> --pq-pubkey <2592-byte hex>
```

eth-nativeアカウントには`--eth`を追加します。アカウント番号は`GET /cosmos/auth/v1beta1/account_info/{address}`から、登録済みのML-DSA-87鍵は`GET /qorechain/pqc/v1/account/{address}`から読み取ります。

TypeScriptでの同じ処理(キットのサンプルのコマンドライン`code/ts/src/cli.ts`から)。

```ts
import { decodeTx, fromHex, verifyTx } from "./index.js";

console.log(JSON.stringify(decodeTx(txBytes), null, 2)); // messages, memo, fee, signers, pqcLayers, txHash

const r = verifyTx({
  txBytes,
  chainId: "qorechain-diana",
  accountNumber: BigInt(accountNumber),
  classicalPublicKey: fromHex(secp256k1PubKeyHex),
  classicalKeyType: "secp256k1", // or "eth_secp256k1" for eth-native accounts
  pqPublicKey: fromHex(registeredMlDsa87KeyHex),
});
// r.valid, r.classical, r.signerKey ("match" | "absent" | "mismatch"), r.pq
```

**3. 入金をスキャンする(テストネットでの読み取り)。**

```bash
go run ./cmd/custody-kit deposits qor1... --from-height 8976000 --to-height 8976400
```

2026年10月27日に、公開テストアドレスについてテストネットの高さ8976000から8983000に対して実行したところ、空のリストが返りました。一度も着金を受けたことのないアドレスでは、これが想定どおりの結果です。

TypeScript(`code/ts/src/cli.ts`から)。

```ts
import { DEFAULT_TESTNET_REST, buildDepositQuery, extractDeposits, getJson } from "./index.js";

const restUrl = process.env.QORE_REST ?? DEFAULT_TESTNET_REST;
const path = buildDepositQuery({ address, minHeight: BigInt(from), maxHeight: BigInt(to) });
const body = await getJson(restUrl, path);
const responses = (body.tx_responses ?? []) as Record<string, unknown>[];
const entries = responses.flatMap((r) => extractDeposits(r, address));
// each entry: txhash, height, msgIndex, messageType, sender, amount, denom, memo, creditable, reason
```

Go(`code/go/cmd/custody-kit/main.go`から)。

```go
opts := custodykit.DepositQueryOptions{Address: addr, MinHeight: &from, MaxHeight: &to}
path, err := custodykit.BuildDepositQuery(opts)
// GET restURL + path, then for each tx_response:
r, err := custodykit.ParseTxResponse(raw)
entries, err := custodykit.ExtractDeposits(r, addr, "") // "" = uqor
```

**4. その他の言語。**

```bash
# Python (from code/python/src)
python -m qorechain_custody_kit validate qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h
python -m qorechain_custody_kit deposits <address> --from-height H --to-height H

# Rust
cargo run --example custody-kit -- validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94

# Java
mvn -q compile exec:java -Dexec.args="validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
```

**5. ベクターとライブチェックを実行する。**

```bash
scripts/fetch-qoresign-vectors.sh            # optional: also check the QoreSign hybrid vectors
cd code/go && go test ./...                  # vectors
QORE_LIVE_TEST=1 go test -run Live ./...     # live reads against testnet
```

各言語に同等のコマンドがあります(`pnpm test`、`pytest`、`cargo test`、`mvn test`)。ライブチェックに資金は不要です。このページを書いた時点で実行したのは、Goの`validate`と`deposits`のコマンドとGoのテストスイートのみで、他の言語についてはリポジトリに基づいて説明しています。

### 主な関数とコマンド {#api}

| TypeScript | Go | PythonとRust | Java | 内容 |
|---|---|---|---|---|
| `validateAddress(input, { allow, requireEip55 })` | `ValidateAddress(input, ValidateAddressOptions{Allow, RequireEIP55})` | `validate_address` | `Addresses.validateAddress` | `{ valid, kind, format, checksum, bech32, hex }`または`{ valid: false, error }`を返します。 |
| `decodeTx(txBytes)`、`decodeMessage(typeUrl, value)` | `DecodeTx`、`DecodeMessage` | `decode_tx`、`decode_message` | `TxDecoder.decodeTx`、`decodeMessage` | メッセージ、メモ、手数料、署名者、ML-DSA-87レイヤー、トランザクションハッシュ。 |
| `verifyTx({ txBytes, chainId, accountNumber, classicalPublicKey, classicalKeyType, pqPublicKey, signBytesVersion })` | `VerifyTx(VerifyTxArgs{...})` | `verify_tx` | `TxVerifier.verifyTx` | `{ valid, classical, signerKey, pq }`を返します。署名対象バイト列のバージョンはv1、v2、またはどちらか。 |
| `buildDepositQuery({ address, minHeight, maxHeight, event, page, limit, orderBy })` | `BuildDepositQuery` | `build_deposit_query` | `Deposits.buildDepositQuery` | 着金に対するRESTパス。`event`は`transfer`(デフォルト)または`coin_received`。`limit`は1~100でデフォルトは50。デフォルトは昇順。 |
| `extractDeposits(txResponse, address, { denom })` | `ExtractDeposits(resp, address, denom)` | `extract_deposits` | `Deposits.extractDeposits` | `creditable`と`reason`を持つ入金エントリー。 |
| `depositEventQuery`、`percentEncode`、`getJson`、`toHex`、`fromHex` | `DepositEventQuery`、`PercentEncode`、`GetJSON`、`ToHex`、`FromHex`、`ParseTxResponse` | `deposit_event_query`、`get_json`、`from_hex` | `CustodyKit`、`Rest` | ヘルパー。 |

そのほか、定数`FEE_COLLECTOR`、`MSG_SEND`、`MSG_MULTI_SEND`、`MSG_ETHEREUM_TX`、`KNOWN_MESSAGES`、`PQC_HYBRID_TYPE_URL`、`DEFAULT_TESTNET_REST`もエクスポートされています。

すべての言語に共通のサンプルのコマンドライン:

- `validate <address> [--allow-validator] [--require-eip55]`
- `decode <tx hex or base64>`
- `verify <tx> --chain-id ID --account-number N --pubkey HEX [--eth] [--pq-pubkey HEX]`
- `deposits <address> [--from-height H] [--to-height H] [--rest URL]`

エラーコードは、すべての言語で同一です。

- キット: `MALFORMED_TX`(バイト列が正しい形式のトランザクションではない)、`UNKNOWN_FIELD`(デコーダーが知らないフィールドで、ネットワークも拒否するもの)、`INVALID_ARGUMENT`。
- `validateAddress`: [革新点](#innovations)に挙げた11個のコード。

カストディアンが最もよく遭遇するチェーンの拒否を、コードスペースとコードで示します(完全な表はキットの`docs/errors.md`にあります)。

| コードスペース | コード |
|---|---|
| `sdk` | 3 シーケンスの不一致、4 未承認、5 残高不足、11 ガス不足、12 メモが大きすぎる、13 手数料不足、19 すでにメンプールにある |
| `pqc` | 20 ハイブリッド署名が必要、21 ハイブリッド検証に失敗、7 鍵は登録済み、26 EVMウィンドウなし(または登録済みの鍵なし)、27 ウィンドウを使い切った、またはスコープ外、28 ウィンドウのパラメーターが無効 |
| `stakingtier` | 13 ステークはロックされている |

コードスペースとコードを併せて分岐に使い、生のログを保持してください。

## アクセス方法 {#how-to-access}

| | メインネット | テストネット |
|---|---|---|
| チェーンID | `qorechain-vladi` | `qorechain-diana` |
| EVMチェーンID | 9801 | 9800 |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| ノードのリリース | v3.2.4(v3.2.5は未適用) | v3.2.6(v3.2.5は適用済み) |

- デノミネーションは`uqor`です(1 QOR = 10^6 uqor。EVMレーンでは1 uqor = 10^12 wei)。最低ガス価格は0.1 uqor、アンボンディング期間は21日、メモの上限は256文字です。これらの値は2026年10月27日に両方のネットワークから読み取ったもので、ガバナンスによって変更されることがあるため、本番ではチェーンから読み取ってください。
- 入金に鍵や登録は不要です。送信には、ホットアドレスごとに登録されたML-DSA-87鍵が必要です。
- 本番では自前のフルノードを運用してください。公開エンドポイントにはレート制限があり、開発用です。スクリプトが`403 Forbidden`を受け取った場合は、`User-Agent`ヘッダーを明示的に設定してください。[ノードの運用](/developer-guide/running-a-node)と[メインネットへの接続](/getting-started/connecting-to-mainnet)を参照してください。
- テストネットは、各ノードリリースをメインネットより先に受け取ります。ガスのルールの切り替えは、日付ではなく、適用済みのアップグレードを確認して行ってください。
- テストネットのテストトークン(`erc20:0x...`形式のbankデノミネーション、IBCトークン)は、メインネットには存在しません。両方のネットワークで`uqor`を計上してください。
- テストネットのQORはQoreChainダッシュボードのフォーセットから入手でき、価値はありません。[テストネットへの接続](/getting-started/connecting-to-testnet)を参照してください。

## セキュリティに関する注意 {#security}

- ホットアドレスの両方の鍵(secp256k1とML-DSA-87)が、すべてのNativeレーンのトランザクションに署名します。両方を同じカストディの境界内に置き、同じクォーラムと監査証跡の下で管理してください。
- 32バイトのML-DSA-87シード(ソフトウェア鍵)をバックアップするか、HSMの鍵バックアップを使用してください。鍵が登録されたアカウントには従来型の経路がないため、ML-DSA-87鍵を失うと、そのアカウントはもう署名できません。復元はテストネットで`verifyTx`を使ってテストしてください。
- HSMは、署名対象バイト列に対する、空のコンテキストでの純粋なML-DSA-87署名(PKCS #11 v3.2の`CKM_ML_DSA`)をサポートしている必要があります。`HashML-DSA`は受け付けられません。
- 署名済みのすべてのトランザクションに対して、ブロードキャストの前に、それを構築していないプロセスで`decodeTx`と`verifyTx`を実行してください。
- ローテーションには`MsgRotatePQCKey`を使います。両方の鍵が署名し、トランザクション自身のレイヤーは現在の鍵を使い、以前の鍵の再利用は拒否されます。secp256k1鍵が露出した場合は、両方の鍵を新しくした新しいアドレスに資金を移し、開いているEVMウィンドウを閉じてください。
- EVMウィンドウ: `native_only`または`allowed_targets`を使い、バッチをカバーできる最小の`max_value`と`blocks`を設定し、バッチの後にウィンドウを閉じてください。`MsgSetWithdrawAddress`、`MsgRotatePQCKey`、`MsgOpenEVMWindow`、`MsgAuthorizeEVMDelegation`は、特権的な操作として扱ってください。
- `ethereum_tx`イベントが失敗を報告しているEVMトランザクションは、ネイティブの結果が`code == 0`であっても、決して計上しないでください。
- これはバージョン0.1.0のリファレンスコードです。本番で使う前にレビューしてください。脆弱性は、誤った計上や意図しない署名につながりうるドキュメントの誤りも含め、security@qore.networkに非公開で報告してください。

## 公開場所 {#where-published}

2026年10月27日にレジストリと照合しました。

| レジストリ | パッケージ | バージョン | リンク |
|---|---|---|---|
| GitHub | `qorechain/qorechain-custody-kit`(5つの言語すべて、ガイドページ、ベクター) | リリース`v0.1.0`、2026年10月27日に公開 | https://github.com/qorechain/qorechain-custody-kit |
| Goモジュールプロキシ | `github.com/qorechain/qorechain-custody-kit/code/go`(サンプルコード、取得可能) | v0.1.0(タグ`code/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go |
| npm、PyPI、crates.io、Maven Central | 未公開: キットはコピーまたはベンダリングするサンプルコードです | 該当なし | 該当なし |

GitHubリリースには添付ファイルはありません。リリースはリポジトリのタグです。キットが依存するものはすべて公開済みです: npmの`@qorechain/qoresign`(最新は0.1.1、キットは0.1.0に固定)、PyPIの`qorechain-qoresign`(0.1.1)、crates.ioの`qorechain-qoresign`(最新は0.1.1、キットは0.1.0に固定)、`github.com/qorechain/qoresign/go`(v0.1.0とv0.1.1)、Maven Centralの`io.github.qorechain:qoresign`(0.1.0と0.1.1)。

ライセンスはApache-2.0。メンテナー: QoreChain Association。

## 制限事項と既知の問題 {#limits}

- キットは、鍵の保持、トランザクションへの署名、ブロードキャスト、しきい値署名やMPC署名を提供しません。署名はQoreSignまたはお使いのHSMが行います。現時点でML-DSAに標準化されたしきい値方式はありません。ガイドは、しきい値のsecp256k1鍵を、別に保持するML-DSA-87鍵と組み合わせる方法を記載しています。
- どのカストディアンの内部プロセスについても、何も述べていません。チェックリストが記述するのは、ネットワークの要件のみです。
- `validateAddress`は20バイトのアドレスを受け付けます。より長いモジュールやコントラクトのアカウントアドレスは、入金や支払いのアドレスとしてそうあるべきように、拒否されます。
- `extractDeposits`が自動で計上するのは、`MsgSend`、`MsgMultiSend`、成功した`MsgEthereumTx`です。その他のメッセージ(報酬の引き出し、コントラクト呼び出し、IBC送金)は計上されず、レビュー用に返されます。
- `verifyTx`は、単一署名者のトランザクションを検証します。
- SVMレーンはトランザクションに対して開放されていません。その上に入金や出金のフローを構築しないでください。
- キット自身のコードは、0.1.0のサンプルコードです。関数名とシグネチャはバージョン間で変わる可能性があり、Goモジュールのタグも安定したAPIを約束するものではありません。
- このページを書いた時点で実行したのは、Goのサンプルとテストスイートのみです。他の4つの言語のライブチェックとベクターチェックは再実行していません。
- リポジトリのPythonのREADMEには、`qorechain-qoresign` 0.1.1がPyPIに公開されるまで`verify_tx`がインポートエラーを出す、という記載がまだ残っている場合があります。そのバージョンは公開済みなので、この記載は古くなっています。
- キットのガイドが引用しているパラメーター(ガスの数値、ステーキングティアの値)は、2026年10月27日に読み取ったものです。本番ではチェーンから読み取ってください。

## 関連ページ {#related}

- [QoreSign](/qoresign/overview): ハイブリッド署名、検証、鍵登録メッセージ、ガスのヘルパー`suggestGasLimit`と`simulateTx`。
- [QoreChain SDK](/sdk/overview): `decodeTxError`によるエラーのデコード、EVMウィンドウのコンポーザー、拒否の分類器。
- [ポスト量子署名](/developer-guide/post-quantum-signing): ハイブリッド署名、署名対象バイト列v2、鍵の登録。
- [取引所・インテグレーター向けガイド](/developer-guide/exchange-integration): ネイティブ、EVM、SVMの各経路の選び方。
- [EVMプリコンパイル](/developer-guide/evm-precompiles)とEVMレーン。
- [ステーキングと委任](/user-guide/staking-and-delegation)。
- [ノードの運用](/developer-guide/running-a-node)と[メインネットへの接続](/getting-started/connecting-to-mainnet)。
- [QoreChain MCPサーバー](/developer-tools/mcp): 簡単なチェックのための`get_pq_status`と`simulate_tx`。
- [QoreScan](/developer-tools/qorescan): ノード、エンドポイント、アカウントの暗号を棚卸しします。
