---
slug: /developer-tools/pq-light-client
title: PQ ライトクライアント
sidebar_label: PQ ライトクライアント
sidebar_position: 31
---

# PQ ライトクライアント (`qorechain-pq-light-client`)

`qorechain-pq-light-client` は、ML-DSA-87（FIPS 204）で署名されたチェックポイントのためのドラフト仕様とリファレンス検証器です。提案されている設計では、バリデーターが各エポックの終わりに、専用の ML-DSA-87 チェックポイント鍵で短いチェックポイントに署名し、ライトクライアントはそれらの署名だけを検証してチェックポイントの連鎖を追跡します。プロトコル研究者、リレイヤーやブリッジの開発者、そして設計をレビューして照らし合わせてテストしたい他のチェーンのチームを対象としています。バージョン **0.1.0**、Apache-2.0、QoreChain Association が保守しています。

**チェーンはこれらのチェックポイントをサポートしておらず、予定もありません。** QoreChain は、メインネット（`qorechain-vladi`）でもテストネット（`qorechain-diana`）でも、このパッケージが検証するチェックポイントを生成しません。サポートするチェーンバージョンはなく、アップグレードや日付の計画もありません。バリデーターのコンセンサス鍵は現在 ed25519 であり、ポスト量子ではありません。このパッケージは稼働中のネットワークを追跡できず、シミュレートされたバリデーターセットと共有テストベクターに対して実行されます。QoreChain のルート、ブリッジ、IBC チャネルをポスト量子にするものではありません。

## 革新点 {#innovations}

* **ブロックごとの署名ではなくチェックポイント。** バリデーターは、エポックごとに 1 つのチェックポイント（チェーン ID、エポック、高さ、時刻、ヘッダーハッシュ、アプリハッシュ、署名セットのハッシュ、次のセットのハッシュ）に署名します。署名は通常のトランザクションで運ばれるため、ブロック生成が署名を待つことはなく、データ量もすべてのブロックに署名する場合よりはるかに少なく済みます。理由は仕様（12 節）に記載されています。
* **所有証明つきの別個のチェックポイント鍵。** 各バリデーターは、コンセンサス鍵やアカウント鍵とは別の ML-DSA-87 チェックポイント鍵を登録し、`"qorechain-pqlc-key-pop-v1|" || chain_id || operator address || consensus address || public key` に対する所有証明を添えます。
* **退出するセットによるセットの引き継ぎ。** チェックポイントは、最後に信頼されたチェックポイントが指定するセットのパワーの 3 分の 2 を厳密に上回る保有者が署名した場合に受理されます。そのためバリデーターセットの変更は常に退出するセットによって署名されます。ちょうど 3 分の 2 ではクォーラムになりません。また、メンバーでない者の署名はスキップされず、チェックポイントを無効にします。
* **オブジェクトごとに 1 つのエンコーディング。** チェックポイント、バリデーターセット、署名付きチェックポイントには正規のエンコーディングがあり、デコーダーは各オブジェクトについてちょうど 1 つのエンコーディングだけを受け付けます。リレイヤーは正規のバイト列をそのまま転送します。
* **チェックの順序が固定。** `verifyCheckpoint` は指定された順序でチェックを実行するため、TypeScript、Rust、Go は同じ入力に対して同じエラーコードを返します。
* **不正行為の証拠。** 1 つのエポックに対してそれぞれクォーラムを持つ 2 つの異なるチェックポイントは、不正行為です。`detectMisbehaviour` は、正規の順序で並べた両方のチェックポイント、二重署名者、およびそのパワーを返します。
* **3 つの言語、1 組のベクター。** 共有ベクター（`vectors/pq-light-client-v1.json`）は決定論的なシミュレーターから生成され、4 バリデーターと 21 バリデーターのチェックポイントチェーン、セットのローテーション、検証器が出し得るすべての拒否、競合するチェックポイント、デコーダーのケースを網羅します。Go、Rust、TypeScript のすべてがこれに合格するため、4 つ目の実装もバイト単位で一致することを証明できます。

## ユースケース {#use-cases}

1. **リレイヤー開発者がポスト量子の更新経路のプロトタイプを作る。** Rust のリレイヤーはネットワークごとに 1 つの信頼状態を保持し、署名付きチェックポイントをデコードして検証し、同じバイト列を宛先へ転送し、`CONFLICTING_CHECKPOINT` で停止します。現時点では、ベクターまたはカスタムのシミュレートされたチェーンに対して実行されます。リポジトリのリレイヤーガイドにそのループが示されています。
2. **IBC とブリッジのチームが設計を評価する。** 仕様 14 節は、チェックポイントを IBC ライトクライアントのタイプ（クライアント状態、コンセンサス状態、不正行為、チェックポイントの高さでのメンバーシップ証明）に対応付けます。チームは、チェーン上に何かが存在する前に、その対応付けとトレードオフをレビューできます。これは設計メモであり、そのためのコードは存在しません。
3. **EVM チェーンや Solana のチームが検証器の設計を比較する。** 15 節は、オンチェーンの ML-DSA-87 検証、検証の STARK 証明、アテスターセットを比較し、どの選択がポスト量子の性質を保ち、どれがそれを手放すかを示します。こちらも設計メモのみです。参考までに、QoreChain 自身の EVM には ML-DSA 検証プリコンパイル（`pqcVerify`、0x0A01）があり、テストネットでのみ有効です。[EVM プリコンパイル](/developer-guide/evm-precompiles)を参照してください。
4. **セキュリティレビュアーと研究者がルールを確認する。** チェックの順序、クォーラムのルール、セットの引き継ぎ、信頼期間、不正行為の証拠は、仕様として定められ、3 つの言語でテスト可能です。
5. **ルートについて語るチームが主張を正しく表現する。** リポジトリのポジションページは、ルートをポスト量子と呼べる条件を定義しています（[制限事項](#limits)を参照）。
6. **他の言語の実装者。** ベクターにより、新しい実装がリファレンスと一致することを証明できます。

## 仕組み {#how-it-works}

この節のすべては提案されている設計であり、そのすべてに、予定されていないチェーン側のサポートが必要です。

1. 各バリデーターは、所有証明（上記）とともに ML-DSA-87 チェックポイント鍵を登録します。
2. 各エポックの終わりに、バリデーターはチェックポイントに署名します。内容は、チェーン ID、エポック（厳密に増加）、高さ、時刻、ヘッダーハッシュ、アプリハッシュ、このチェックポイントに署名するセットのハッシュ、次のチェックポイントに署名するセットのハッシュです。
3. ライトクライアントは、最後に信頼されたチェックポイントが指定したセットのパワーの 3 分の 2 を超える署名を受けたチェックポイントを受理します。
4. 1 つのエポックに対してそれぞれクォーラムを持つ 2 つの異なるチェックポイントは不正行為であり、証拠は二重署名者を特定します。

ブロックごとのコンセンサスは変わりません。エポック内の高さは、次のチェックポイントまで従来型のままです。ポスト量子の保証が必要なクライアントは、チェックポイントの高さを使い、最大 1 エポック分の遅延を受け入れます。

**フォーマット**（すべての整数はビッグエンディアン、バージョンバイトは `0x01`）:

| オブジェクト | レイアウト | サイズ |
|---|---|---|
| チェックポイント | バージョン、チェーン ID の長さとバイト列、エポック、高さ、時刻、ヘッダーハッシュ、アプリハッシュ、バリデーターセットハッシュ、次のバリデーターセットハッシュ | `154 + len(chain_id)` バイト（`qorechain-vladi` では 169） |
| バリデーターセット | バージョン、数（1 から 256）、続いてバリデーターごとに 20 バイトのアドレス、8 バイトのパワー、2,592 バイトの ML-DSA-87 鍵（アドレス順にソート） | `3 + 2,620 x validators` バイト |
| 署名付きチェックポイント | バージョン、チェックポイント、署名数、署名者ごとに 20 バイトのアドレスと 4,627 バイトの署名（アドレス順にソート）、次のセットのフラグ、セットが変わる場合は次のセット | `qorechain-vladi` では `173 + 4,647 x signers` バイト、次のセットがある場合はそれに加えて |

**署名とハッシュ。** ML-DSA-87、FIPS 204 の pure モード、空のコンテキストで、`"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)` に対して署名します。決定論的署名とヘッジ署名のどちらも有効です。ハッシュは 32 バイト出力の SHAKE-256 で、バリデーターセットのハッシュにはプレフィックス `qorechain-pqlc-valset-v1|` を使用します。

**検証の順序**（`verifyCheckpoint`）: 構造、チェーン ID、信頼の期限切れ、時計のずれ、同一エポックの扱い（同一なら `NOT_NEWER`、クォーラムを持ちつつ異なる場合は `CONFLICTING_CHECKPOINT`）、エポック・高さ・時刻の進行、署名セットが信頼された次のセットと等しいこと、同梱された次のセットがそのハッシュと一致すること、クォーラム。失敗しても信頼状態は変わりません。署名セットが変わらない間は、後のエポックを直接受理できます。ローテーションの後は、ローテーション以降のすべてのチェックポイントを検証する必要があります。

**信頼。** クライアントは、あらゆるプルーフ・オブ・ステークのライトクライアントと同様に、プロトコルの外で選ばれた信頼のルートから開始します。信頼期間は、バリデーターがまだペナルティを受け得る期間より短くなければならず、それを過ぎたらクライアントを再初期化する必要があります。

仕様はリポジトリの `spec/pq-light-client-v1.md` です（ステータス: ドラフト、レビュー受付中）。10 節（チェックポイント鍵、署名、エポック、オンチェーンのペナルティ）はレビューのための設計であり、確約ではありません。

## 使い方 {#how-to-use}

### インストール {#install}

| 言語 | インストール | 最小プラットフォーム |
|---|---|---|
| TypeScript | `npm install @qorechain/pq-light-client` | Node.js 20.19 以降、およびブラウザ。`@qorechain/pqc` 0.2.3 に依存 |
| Rust | `cargo add qorechain-pq-light-client`（ライブラリ `qorechain_pq_light_client`） | stable の Rust。`qorechain-pqc` 0.2.3 に依存。`unsafe` なし、I/O なし |
| Go | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0`（パッケージ `pqlightclient`） | Go 1.25。`github.com/qorechain/qorechain-pqc/go` v0.2.3 に依存 |

PyPI パッケージはなく、予定もありません。

### クイックスタート（オフライン、TypeScript） {#quickstart}

QoreChain のネットワークには一切接続しません。このスクリプトは、共有ベクターにあるシミュレートされた 21 バリデーターのチェックポイントチェーン（チェーン ID `qorechain-sim-21`、エポック 2 でのセットのローテーションを含む）を追跡し、その後、ライブのソースが利用できないことを示します。ベクターの鍵は公開されたテスト鍵です。

```bash
mkdir pqlc && cd pqlc && npm init -y && npm pkg set type=module
npm install @qorechain/pq-light-client
curl -sLO https://raw.githubusercontent.com/qorechain/qorechain-pq-light-client/v0.1.0/vectors/pq-light-client-v1.json
```

```js
// follow.mjs: a TypeScript port of the repository's Rust relayer example.
import { readFileSync } from "node:fs";
import {
  PqLightClientError,
  decodeSignedCheckpoint,
  decodeValidatorSet,
  fetchCheckpoint,
  newTrustedState,
  verifyCheckpoint,
} from "@qorechain/pq-light-client";

const v = JSON.parse(readFileSync("pq-light-client-v1.json", "utf8"));
const hex = (s) => Uint8Array.from(Buffer.from(s, "hex"));

const root = decodeSignedCheckpoint(hex(v.signedCheckpoints["c21-e0-root"].encoded));
const set = decodeValidatorSet(hex(v.validatorSets.C21.encoded));
let state = newTrustedState({
  checkpoint: root.checkpoint,
  signatures: root.signatures,
  validatorSet: set,
  nextValidatorSet: set,
  trustingPeriod: 1_209_600n, // 14 days
  maxClockDrift: 10n,
});

for (const id of ["c21-e1", "c21-e2-rotate", "c21-e3"]) {
  const signed = decodeSignedCheckpoint(hex(v.signedCheckpoints[id].encoded));
  state = verifyCheckpoint(state, signed, signed.checkpoint.time + 5n);
  console.log(`trusted epoch ${state.checkpoint.epoch} at height ${state.checkpoint.height}`);
}

try {
  await fetchCheckpoint("https://rpc.example.invalid", state.checkpoint.chainId, 4n);
} catch (e) {
  if (e instanceof PqLightClientError) console.log("live source:", e.code);
}
```

2026年10月27日に、公開済みの npm 0.1.0 パッケージとタグ v0.1.0 のベクターに対して実行したところ、`node follow.mjs` は次を出力しました。

```
trusted epoch 1 at height 11000
trusted epoch 2 at height 12000
trusted epoch 3 at height 13000
live source: REQUIRES_CHAIN_SUPPORT
```

ベクターのファイルは約 2.4 MB です。Rust の原本はリポジトリの `rust/examples/relayer.rs`（`cargo run --example relayer`）です。このページのためには実行していません。

TypeScript でのエラー処理（パッケージの README より）:

```ts
try {
  trusted = verifyCheckpoint(trusted, decodeSignedCheckpoint(bytes), BigInt(Math.floor(Date.now() / 1000)));
} catch (e) {
  if (e instanceof PqLightClientError && e.code === "CONFLICTING_CHECKPOINT") {
    report(e.misbehaviour);
  }
}
```

Go での同じ処理:

```go
signed, err := pqlightclient.DecodeSignedCheckpoint(b)
if err != nil {
	return err
}
next, err := pqlightclient.VerifyCheckpoint(trusted, signed, uint64(time.Now().Unix()))
if errors.Is(err, pqlightclient.ErrConflictingCheckpoint) {
	// err.(*pqlightclient.Error).Misbehaviour holds the evidence
}
```

### 主な API {#api}

API は 3 つの言語すべてで同じです（TypeScript は camelCase、Go は PascalCase、Rust は snake_case）。64 ビットのフィールドは TypeScript では `bigint` です。

| 名前 | 内容 |
|---|---|
| `Checkpoint`、`ValidatorSet`、`SignedCheckpoint`、`TrustedState`、`Misbehaviour` | データ型 |
| `encodeCheckpoint`、`decodeCheckpoint` | 正規のチェックポイントエンコーディング。厳格なデコーダー |
| `encodeValidatorSet`、`decodeValidatorSet`、`hashValidatorSet` | バリデーターセットのエンコーディングと SHAKE-256 ハッシュ |
| `encodeSignedCheckpoint`、`decodeSignedCheckpoint` | リレイヤーが運ぶバイト列 |
| `encodeCheckpointSignBytes` | 署名対象バイト列、`"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)` |
| `newTrustedState` | 信頼のルートから信頼状態を作成（両方のセットがチェックポイント内の値にハッシュされることを確認します。署名は検証しません） |
| `verifyCheckpoint(trusted, signed, now)` | 完全な検証。新しい信頼状態または型付きエラーを返す |
| `detectMisbehaviour(set, a, b)` | 競合するチェックポイントの証拠。なければ何も返さない |
| `signCheckpoint` | ML-DSA-87 の秘密鍵でチェックポイントに署名（シミュレーターとテスト用） |
| `CheckpointSource`、`fetchCheckpoint`、`chainCheckpointSource`（TypeScript）または `ChainCheckpointSource`（Rust、Go） | 将来のノード API 用のインターフェース。現時点では常に `REQUIRES_CHAIN_SUPPORT` で失敗し、リクエストは行わない |
| `PqLightClientError`（TypeScript）、`ErrInsufficientPower` などを持つ `*Error`（Go、`errors.Is` を使用）、`code()` を持つ `Error`（Rust） | 安定したコードを持つ型付きエラー |

3 つの言語で共通のエラーコードと、リレイヤーが取るべき対応（リレイヤーガイドより）:

| エラー | 対応 |
|---|---|
| `MALFORMED` | バイト列を破棄する。ソースに問題がある |
| `CHAIN_ID_MISMATCH` | 設定エラー |
| `TRUST_EXPIRED` | 停止する。新しい信頼のルートから再初期化する |
| `FUTURE_CHECKPOINT` | ローカルの時計を確認する。後で再試行する |
| `NOT_NEWER` | 新しいものはない。待つ |
| `SET_MISMATCH` | セットのローテーションを伴うチェックポイントが欠けている。間のエポックを取得する |
| `UNKNOWN_VALIDATOR`、`BAD_SIGNATURE` | チェックポイントを破棄する |
| `INSUFFICIENT_POWER` | さらに署名が集まるのを待つ |
| `CONFLICTING_CHECKPOINT` | リレイを停止し、証拠を報告する |
| `REQUIRES_CHAIN_SUPPORT` | 現時点では想定どおり |

## アクセス方法 {#how-to-access}

- **メインネット `qorechain-vladi` とテストネット `qorechain-diana`:** チェックポイントは生成されないため、検証器はどちらのネットワークも追跡できません。サポートするチェーンバージョンはなく、予定もありません。
- ネットワークの現状: バリデーターのコンセンサス鍵は ed25519、vote extension はオフ、IBC は標準の 07 ライトクライアントタイプを使用しています。
- **パッケージを実行する**には、言語のランタイム以外は何も必要ありません。アカウントも、鍵も、エンドポイントも、費用もかかりません。ベクターは公開されたテスト鍵と、チェーン ID `qorechain-sim` および `qorechain-sim-21` を使用します。
- 参考のみ（このパッケージは使用しません）: REST `https://api.qore.host` と `https://api-testnet.qore.host`、RPC `https://rpc.qore.host` と `https://rpc-testnet.qore.host`。

## 公開場所 {#where-published}

2026年10月27日に各レジストリで確認しました。

| レジストリ | パッケージ | バージョン | リンク |
|---|---|---|---|
| npm | `@qorechain/pq-light-client` | 0.1.0（`latest`） | [npmjs.com](https://www.npmjs.com/package/@qorechain/pq-light-client) |
| crates.io | `qorechain-pq-light-client` | 0.1.0 | [crates.io](https://crates.io/crates/qorechain-pq-light-client) |
| Go モジュールプロキシ | `github.com/qorechain/qorechain-pq-light-client/go` | v0.1.0（タグ `go/v0.1.0`） | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) |

ソース: [github.com/qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client)（リリース v0.1.0、ソースコード、バイナリなし）。ライセンスは Apache-2.0 です。

## 制限事項と既知の問題 {#limits}

- **QoreChain、IBC チャネル、ブリッジ、リレイヤーをポスト量子にするものではありません。** バリデーターのコンセンサス鍵は現在ポスト量子ではなく、それを変えるアップグレードも予定されていません。
- **稼働中のネットワークを追跡できません。** `fetchCheckpoint` は常に `REQUIRES_CHAIN_SUPPORT` で失敗します。シミュレートされたバリデーターセットと共有ベクターに対して動作します。
- **仕様はドラフトであり、レビュー受付中です。** その中のどれも確約ではありません。
- **コードのない設計メモ:** IBC クライアントタイプ（14 節）と EVM および Solana の検証器（15 節）。
- **エポック内の高さは従来型のままです。** チェックポイントがあっても、ポスト量子の検証が適用されるのはチェックポイントの高さです。
- **ポスト量子ルートと呼べる条件。** ルートをポスト量子と呼べるのは、両端が相手側のポスト量子署名された状態を双方向で検証し、従来型のステップがない場合です。つまり、どちらの端にも従来型のライトクライアントがなく、ペアリングベースの SNARK ラッパーがなく、従来型のアテスター委員会がないことです。ポスト量子のアカウント署名だけでは、ルートはポスト量子になりません。QoreChain のアカウントは ML-DSA-87 と secp256k1 で署名します。これは「ポスト量子のアカウント署名」と表現し、ポスト量子ルートとは表現しないでください。
- **信頼のルートは主観的です。** 誤ったルートから始めたクライアントを、プロトコルは守れません。
- **1.0 未満。** マイナーバージョンで API が変わることがあります。

リポジトリのポジションページが推奨する表現:

| 状況 | 表現 |
|---|---|
| アカウントが ML-DSA-87 で署名する | 「ポスト量子のアカウント署名」 |
| 一方の端がポスト量子のチェックポイントを検証し、もう一方は検証しない | 「チェーン X 上の QoreChain の状態のポスト量子検証。戻りの経路は従来型」 |
| 両端がポスト量子署名された状態を検証し、従来型のステップがない | 「ポスト量子ルート」 |

両端がこのルールを満たすまでは、ルートを、実際に何を検証しているかで説明してください。例えば「相手側の従来型ライトクライアントによって保護されている」のようにします。

## セキュリティに関する注意 {#security}

- このパッケージは鍵を保持せず、I/O も行いません。Rust には `unsafe` コードがなく、TypeScript と Go では `fetchCheckpoint` はリクエストを行いません。
- デコーダーは厳格です。オブジェクトごとに 1 つのエンコーディングのみで、それ以外の署名長や鍵長は拒否されます。リレイヤーは、再エンコードしたものではなく、正規のバイト列をそのまま転送する必要があります。
- セット外のバリデーターからの署名は、スキップされずにチェックポイントを無効にします。これにより、すべての実装が同じ結果になります。
- 検証器の時計を同期させておいてください。時計が進んでいると信頼が早く失効し、遅れていると新しいチェックポイントが `FUTURE_CHECKPOINT` として拒否されます。
- この設計は、各チェックポイントセットのパワーの 3 分の 2 を超えて保有するバリデーターが、自分のノードがコミットしたチェックポイント以外には署名しないことを前提としています。
- 提案されている署名ドメイン（`qorechain-pqlc-checkpoint-v1|`、`qorechain-pqlc-key-pop-v1|`）は提案であり、現時点ではチェーン上で予約されていません。
- ベクターの鍵は公開されたテスト鍵です。他の用途には決して使わないでください。
- 脆弱性は security@qore.network に非公開で報告してください。

## 関連ページ {#related}

- [PQC ライブラリ](/developer-tools/pqc-library): 検証器の基盤となる ML-DSA-87 と SHAKE-256 のバインディング。
- [QoreSign](/qoresign/overview): アカウントレベルの ML-DSA-87 署名。バリデーターのチェックポイントとは別物です。
- [ポスト量子セキュリティ](/architecture/post-quantum-security): 現在のチェーンのポスト量子モデル。
- [ブリッジアーキテクチャ](/architecture/bridge-architecture) と [アセットのブリッジ](/user-guide/bridging-assets): 現在のクロスチェーンルートは標準の従来型ライトクライアントを使用します。
- [QoreSeal](/developer-tools/qoreseal): 2026年10月27日に公開された、もう 1 つの 0.1.0 ポスト量子キット。
- [開発者パッケージ概要](/developer-tools/overview)。
