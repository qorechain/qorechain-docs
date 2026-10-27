---
slug: /developer-tools/qoreseal
title: QoreSeal
sidebar_label: QoreSeal
sidebar_position: 30
---

# QoreSeal (`qoreseal`)

QoreSeal は、ML-KEM-1024（FIPS 203）でデータを QoreChain アカウント宛てに暗号化するオープンソースのライブラリです。アカウントは ML-KEM-1024 公開鍵をチェーン上に公開します。すると誰でも、そのアカウントと、送信者が追加した他の受信者が読めるペイロードを暗号化できます。機密性の高いペイロード（メモ、請求書、ドキュメント、入札）を必要とする dApp 開発者、閲覧アクセスを必要とする監査人、プライベートグループやサイドチェーンの運営者向けです。標準のプリミティブを組み合わせるもので、独自のプリミティブは一切実装していません。バージョン **0.1.0**、Apache-2.0、QoreChain Association がメンテナンスしています。

2026年10月27日時点の状況: 暗号化そのものは、ネットワークもアカウントも不要で、どこでもオフラインで動作します。チェーンから読み取ったアドレス宛てに暗号化するには KEM 鍵レジストリが必要で、これは**テストネット**（`qorechain-diana`）では**稼働中**、**メインネット（`qorechain-vladi`）には v3.2.5 のアップグレード後に導入されます**（日付は未定）。パッケージは Rust、Go、Python、Swift、Kotlin/JVM、Android 向けに公開されています。TypeScript パッケージ `@qorechain/qoreseal` は**近日公開**で、まだ npm にはありません。この構成は、1.0 に先立つ外部レビューを待つドラフトです。

QoreSeal が保護するのはペイロードの内容だけで、それ以外は保護しません。アドレス、トランザクションのタイミング、送金額、エンベロープのサイズ、受信者の数はチェーン上で公開されたままです。トランザクションを秘匿する手段ではありません。

## 革新点 {#innovations}

- **1 つのエンベロープで、1 から 1,024 の受信者。** ペイロードはランダムな AES-256-GCM データ鍵で一度だけ暗号化され、データ鍵は受信者ごとに別々にラップされます。したがって、読者を 1 人追加するコストはペイロードをもう 1 部複製することではなく、約 1.6 KB です。
- **デフォルトはハイブリッドで、暗黙のダウングレードは決してありません。** `hybrid` モードでは、各受信者エントリが ML-KEM-1024 のカプセル化と X25519 の鍵合意を SHA3-256 コンバイナで組み合わせるため、どちらか一方が保たれている限りデータは保護されます。`mlkem` モード（ML-KEM-1024 のみ）は明示的に選択する必要があり、ライブラリが自ら自動的にこれにフォールバックすることはありません。
- **コンテキストバインディング。** すべてのエンベロープは、鍵導出（HKDF-SHA-256、info は `"qorechain-kem-v1|" + chainId + "|" + purpose`）を通じてチェーン ID と目的に、またオプションの関連データにバインドされます。ある目的で封印されたエンベロープは、別の目的では開きません。
- **チェーン上に公開され、チェーンが検証する鍵。** アカウントは `MsgRegisterKEMKey` で ML-KEM-1024 鍵を登録し、これはトランザクションのハイブリッド署名で認証されます。`validateMlkemPublicKey` は、登録時にチェーンが適用するのと同じ検証を行います。
- **受信者カード。** レジストリが保持するのは ML-KEM 鍵だけです。ハイブリッドモード用の X25519 鍵は、アカウントが [QoreSign](/qoresign/overview) のメッセージ署名で署名し、チェーン上の ML-KEM 鍵にバインドするカードで運ばれます。送信者はカードをチェーン上の両方の鍵に照らして検証するため、カードはどの経路から届いても構いません。偽造されたカードや古いカードがもたらし得るのは、せいぜいエンベロープを ML-KEM-1024 の強度に下げることだけです。ML-KEM の部分は常にチェーン上の鍵を使用するためです。
- **プライベートグループ用のエポック鍵。** `EpochKeyManager` は、メンバーが変わるたびに新しいエポック鍵を作成し、現在のメンバー宛てに封印します。削除されたメンバーは、所属していたエポックの鍵を保持し続けますが、それ以降のエポックは読めません。
- **コミットメント付きの暗号化バッチ。** バッチコーデックは、暗号文コミットメントとソルト付き平文コミットメントを持つ暗号化 blob を生成し、[RDK](/rollups/overview) で QoreChain にアンカーできる状態にします。
- **どの言語でも同じバイト列。** TypeScript と Go はネイティブ実装で、Rust は Swift、Kotlin、Python の下にあるコアです。共有テストベクターはすべての言語でバイト単位で検証され、エラーには安定したコード（たとえば `NOT_A_RECIPIENT`、`DECRYPTION_FAILED`、`CARD_INVALID`、`RECIPIENT_NEEDS_X25519`、`UNKNOWN_EPOCH`、`MALFORMED_ENVELOPE`）が付きます。

## ユースケース {#use-cases}

1. **dApp がユーザー間のメモやメッセージを暗号化する。** チャットや決済の dApp は、`sealToAddresses` で各メモを受信者のアドレス宛てに封印し、`qoreseal:` テキストをメモ、コントラクト、または独自のデータベースに保存します。開けるのは受信者の鍵だけです。
2. **監査人（閲覧）鍵つきの請求書とドキュメント。** 企業は、請求書番号を関連データとして、買い手、売り手、監査人の鍵宛てに 1 つのエンベロープで請求書を封印します。監査人の鍵は、設定に保管される通常の QoreSeal 鍵ペアです。四半期ごとに 1 つの鍵（新しいインデックスを使った `deriveSealKeys`）を使えば、企業は監査人に審査対象の期間だけを渡せます。
3. **封印入札とコミット・リビール。** オークションは、`purpose: "bid:<auction id>"` と入札者アドレスを関連データとして、入札をオークション鍵宛てに封印し、エンベロープを保存して、締め切り後に開きます。
4. **コンソーシアムまたはプライベートサイドチェーン。** プライベートロールアップの運営者は、`EpochKeyManager` でメンバーとエポック鍵を共有し、`PrivateBatchCodec` ですべてのバッチを暗号化し、暗号化 blob とそのコミットメントを RDK で QoreChain にアンカーします。
5. **「暗号化データの受信」を提供するウォレット。** ウォレットは、アカウントのニーモニック（インデックス 0）から QoreSeal の鍵を導出し、ハイブリッド署名した `MsgRegisterKEMKey` で ML-KEM 鍵を公開し、署名用の受信者カードをプレーンテキストで表示します。
6. **リカバリーまたはエスクローの受信者。** カストディやコンプライアンスのチームは、すべてのエンベロープにオフラインのリカバリー鍵を追加し、ユーザーが鍵を失ってもデータが残るようにします。
7. **Python または Go のバックエンド。** サービスが、他のどの言語ともバイト互換のまま、レポートやエクスポートをアカウントのリスト宛てに封印します。

## 仕組み {#how-it-works}

プリミティブ（QoreSeal はそのいずれも実装していません）: ML-KEM-1024（FIPS 203。カプセル化鍵 1,568 バイト、デカプセル化鍵 3,168 バイト、暗号文 1,568 バイト）、X25519（RFC 7748）、SHA3-256 コンバイナ、HKDF-SHA-256、AES-256-GCM（96 ビットのノンス、128 ビットのタグ）。

**封印**の概要:

1. ランダムな 16 バイトのソルトと、ランダムな 32 バイトのデータ鍵が生成されます。
2. 受信者ごとに、受信者の鍵に対する ML-KEM-1024 のカプセル化を行います。ハイブリッドモードでは、受信者の X25519 鍵との一時的な X25519 鍵合意も行い、2 つのシークレットを SHA3-256 で結合します。HKDF-SHA-256（ソルト、info は `"qorechain-kem-v1|" + chainId + "|" + purpose`）で鍵暗号化鍵が導出され、AES-256-GCM でデータ鍵をラップします。
3. ペイロードはデータ鍵で一度だけ暗号化され、ヘッダー全体とオプションの関連データが認証されます。

**エンベロープのレイアウト:** マジック `QSEL`、バージョン 1、モード、アルゴリズムバイト、フラグ、ソルト、受信者数、受信者ごとに 1 エントリ（ヒント、ML-KEM 暗号文、ハイブリッドモードでは X25519 の一時鍵、ラップされたデータ鍵）、ノンス、暗号文。サイズ: ハイブリッドモードでは `56 + 1,664 x recipients + plaintext` バイト、`mlkem` モードでは `56 + 1,632 x recipients + plaintext` バイトです。仕様より: 受信者 1 人で平文 1 KB の場合は 2,744 バイト（ハイブリッド）、受信者 10 人で 1 KB の場合は 17,720 バイトです。

チェーン ID と目的はエンベロープには書き込まれません。受信者は同じ値を渡す必要があります。チェーン ID、目的、関連データが誤っている場合、またはバイト列に何らかの変更があった場合は、`DECRYPTION_FAILED` になります。

**ヒント。** ソルト付きのヒントにより、受信者は自分のエントリをすばやく見つけられます。`anonymous: true` の場合、ヒントはゼロにされ、受信者はすべてのエントリを試します。

**テキスト形式。** `envelopeToText` と `envelopeFromText` は、`"qoreseal:" + base64url` との間で変換します。

**チェーン上にあるもの**

- モジュール `qorechain.pqc.v1` の KEM 鍵レジストリ: `sender`、`algorithm_id = 2`（ML-KEM-1024）、`public_key` を持つ `MsgRegisterKEMKey` と、`sender` を持つ `MsgRemoveKEMKey`。タイプ URL は `/qorechain.pqc.v1.MsgRegisterKEMKey` と `/qorechain.pqc.v1.MsgRemoveKEMKey` です。
- クエリ: `GET /qorechain/pqc/v1/kem/{address}`（`qor1` 形式または `0x` 形式を受け付けます）。`found` を返し、見つかった場合は `address`、`algorithm_id`、`algorithm_name`、`public_key`、`registered_height` を持つ `key` を返します。
- 登録は、トランザクションのハイブリッド署名で認証されます。送信者はすでに ML-DSA-87 鍵を登録している必要があり、トランザクションは QoreSign の `signHybrid` で署名されます。1 アカウントにつき 1 つの鍵で、再登録すると置き換えられます。
- 拒否（codespace `pqc`）: 250 このチェーンでレジストリがまだ有効化されていない、251 KEM 公開鍵が無効、252 このアカウントに公開された KEM 鍵がない、253 この鍵はこのアカウントにすでに公開されている、254 KEM 鍵の公開には登録済みのポスト量子署名鍵が必要。`describeKemRegistryError` がこれらを説明します。
- エンベロープ自体は、アプリケーションが置いた場所（メモ、コントラクト、ファイル、API）に置かれます。チェーンが秘密鍵を目にすることはありません。

**受信者カード。** 約 6.7 KB の JSON で、大部分は ML-DSA-87 署名です。アカウントは、固定のテキスト（`QoreSeal recipient card v1`、チェーン ID、アドレス、ML-KEM 鍵の SHA3-256、X25519 鍵、発行時刻）に QoreSign のメッセージ署名で署名します。新しい ML-KEM 鍵を登録すると、古い鍵向けに作られたカードはすべて無効になります。

**プライベートグループ。** エポック鍵ペイロード（`QSEK`、エポック番号、32 バイトの鍵）は、通常のエンベロープで現在のメンバー宛てに封印されます。バッチ blob（`QSBT`、エポック、バッチインデックス、ロールアップ ID などのコンテキスト、ノンス、AES-256-GCM 暗号文）は `83 + context length + data length` バイトです。コミットメント: `ciphertextCommitment = SHA3-256(blob)` と `plaintextCommitment = SHA3-256("qorechain-qoreseal-batch-v1" || commitSalt || data)`。部外者がエントロピーの低い内容を推測できないよう、ソルトが付けられています。

仕様はリポジトリの `spec/qoreseal-v1.md` です（ステータス: ドラフト、レビュー進行中）。共有ベクターは `vectors/qoreseal-v1.json` です。

## 使い方 {#how-to-use}

### インストール {#install}

| 言語 | インストール | 最小プラットフォーム |
|---|---|---|
| Rust | `cargo add qorechain-qoreseal`（ライブラリ名は `qoreseal`） | stable Rust |
| Go | `go get github.com/qorechain/qoreseal/go@v0.1.0` | Go 1.25 |
| Python | `pip install qorechain-qoreseal`（import は `qoreseal`） | Python 3.9 以降。macOS 11 以降（arm64、x86_64）と Linux manylinux2014（x86_64、aarch64）向けのホイール。Windows 用ホイールはまだありません |
| Swift | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`、プロダクト `QoreSeal` | iOS 16、macOS 13 |
| Kotlin / JVM | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Java 17。Kotlin 2.3 以降のコンパイラ（Kotlin 2.1 ではコンパイルに失敗します） |
| Android | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | API 24。R8 の keep ルールを同梱。Kotlin 2.3 以降のコンパイラ |
| TypeScript | **近日公開**: `@qorechain/qoreseal` はまだ npm になく、インストールコマンドはありません | |

TypeScript のソース、サンプル、ネットワークヘルパーはリポジトリにあり、`pnpm install && pnpm build` の後にそこから実行できます。npm パッケージが公開されるまでは、TypeScript の使い方としてリポジトリを利用し、上記のパッケージ名が使われることを想定してください。

### クイックスタート 1: オフラインでの封印と開封（Python） {#quickstart-python}

2026年10月27日に、公開済みの 0.1.0 ホイールに対して実行しました。ネットワークもアカウントも不要です。受信者 2 人、関連データ、そして別の目的ではエンベロープが開かないことの確認です。

```python
import qoreseal as qs

alice = qs.generate_seal_keys()
bob = qs.generate_seal_keys()

envelope = qs.seal_envelope(
    "qorechain-diana", "invoice",
    [qs.recipient_of(alice), qs.recipient_of(bob)],
    b"amount due: 120 QOR",
    aad=b"invoice-42",
)
text = qs.envelope_to_text(envelope)  # "qoreseal:..."

plaintext = qs.open_envelope("qorechain-diana", "invoice", envelope, bob, aad=b"invoice-42")
assert plaintext == b"amount due: 120 QOR"
print(len(envelope), text[:20], plaintext)

# A different purpose never opens the envelope.
try:
    qs.open_envelope("qorechain-diana", "chat", envelope, bob, aad=b"invoice-42")
except qs.QoreSealError.Failure as e:
    print("other purpose:", e.code)
```

出力は `3403 qoreseal:UVNFTAEBAgE b'amount due: 120 QOR'`、続いて `other purpose: DECRYPTION_FAILED` でした。長さは 56 + 2 x 1,664 + 19 = 3,403 バイトです。

### クイックスタート 2: オフラインでの封印と開封（Go） {#quickstart-go}

Go モジュールプロキシの v0.1.0 に対して実行しました。

```go
package main

import (
	"fmt"

	qoreseal "github.com/qorechain/qoreseal/go"
)

func main() {
	alice, _ := qoreseal.GenerateSealKeys()
	auditor, _ := qoreseal.GenerateSealKeys()

	envelope, err := qoreseal.Seal(qoreseal.SealArgs{
		ChainID:    "qorechain-diana",
		Purpose:    "invoice",
		Recipients: []qoreseal.SealRecipient{qoreseal.RecipientOf(alice), qoreseal.RecipientOf(auditor)},
		Plaintext:  []byte("120 QOR due on 2026-11-30"),
		AAD:        []byte("invoice-42"),
	})
	if err != nil {
		panic(err)
	}
	plaintext, err := qoreseal.Open(qoreseal.OpenArgs{
		ChainID: "qorechain-diana", Purpose: "invoice", Envelope: envelope, Keys: auditor, AAD: []byte("invoice-42"),
	})
	fmt.Println(len(envelope), string(plaintext), err)
}
```

出力は `3409 120 QOR due on 2026-11-30 <nil>` でした。

Rust、Swift、Kotlin も同じ呼び出し（`seal`、`open`、`generate_seal_keys` など。表記は各言語の流儀に従います）を使います。それらのサンプルは、このページのためには実行していません。

### クイックスタート 3: エポックを使ったプライベートグループ（Python、オフライン） {#quickstart-group}

リポジトリのサンプル `examples/private-rollup` に沿ったものです。alice と bob はエポック 1 から始まり、carol が参加し（エポック 2）、bob が削除されます（エポック 3）。bob はエポック 1 は読めますが、エポック 3 は読めません。

```python
import qoreseal as qs

chain_id, rollup_id = "qorechain-diana", "demo-private-rollup"
purpose = f"epoch-key:{rollup_id}"
alice, bob, carol = qs.generate_seal_keys(), qs.generate_seal_keys(), qs.generate_seal_keys()

mgr = qs.EpochKeyManager(chain_id, purpose, [
    qs.GroupMember(id="alice", recipient=qs.recipient_of(alice)),
    qs.GroupMember(id="bob", recipient=qs.recipient_of(bob)),
])
bob_keys = [qs.open_epoch_key(chain_id, purpose, mgr.distribution(), bob)]  # epoch 1

b1 = mgr.seal_batch(rollup_id, 1, b'{"txs":["alice pays bob 5"]}')
mgr.add_member("carol", qs.recipient_of(carol))   # epoch 2
mgr.remove_member("bob")                          # epoch 3
b3 = mgr.seal_batch(rollup_id, 3, b'{"txs":["alice pays carol 1"]}')

print(qs.open_batch(b1.blob, bob_keys).data)      # bob read epoch 1
try:
    qs.open_batch(b3.blob, bob_keys)              # bob was removed before epoch 3
except qs.QoreSealError.Failure as e:
    print("bob, epoch 3:", e.code)
print(b3.ciphertext_commitment.hex(), b3.plaintext_commitment.hex())
```

出力は、bob のエポック 1 のバッチ、続いて `bob, epoch 3: UNKNOWN_EPOCH`、そして 2 つのコミットメント（実行のたびにランダム）でした。

封印したバッチを [RDK](/rollups/overview) でアンカーするには、暗号化 blob をネイティブのデータアベイラビリティ blob とし、その SHA-256 をバッチの `data_hash` にします（TypeScript、リポジトリのガイドより。このページのためには実行していません）:

```ts
import { buildDaBlob, submitBatchMsg } from "@qorechain/rdk";

const codec = new PrivateBatchCodec("my-rollup", mgr);
const sealed = codec.seal(batchIndex, batchBytes);
const blob = buildDaBlob({ data: sealed.blob, maxBlobSize: params.maxDaBlobSize });
const msg = submitBatchMsg({ sequencer, rollupId: "my-rollup", batchIndex, stateRoot, txCount, dataHash: blob.dataHash });
```

ロールアップのバッチがどのように投稿されるかについては、[データアベイラビリティ](/rollups/data-availability)を参照してください。

### テストネットでアドレス宛てに暗号化する {#encrypt-to-address}

必要なのは、ご自身が管理する `qorechain-diana` のアカウントで、少量のテストネット QOR と、登録済みの ML-DSA-87 鍵（QoreSign のサンプル `register-and-send` が 1 つ登録します）を持っているものです。テストネット用のニーモニックを使用し、メインネットのものや、資金のある公開テスト用フレーズは決して使わないでください。このフローはリポジトリのガイドに基づく説明で、このページのためには実行していません。

1. アカウントのニーモニックから鍵を導出します: `deriveSealKeys({ mnemonic })`（インデックス 0）。ニーモニックはそのままバックアップにもなります。
2. ML-KEM-1024 鍵を公開します: `buildRegisterKemKeyMessage({ sender: address, mlkemPublicKey: sealKeys.mlkemPublicKey })` を作り、トランザクションボディに入れ、QoreSign の `signHybrid` で署名し、`simulateTx` でシミュレーションして、`submitWithSignBytesFallback` で送信します。拒否された場合は、`describeKemRegistryError(res.codespace, res.code)` が説明します。
3. 確認します: `GET https://api-testnet.qore.host/qorechain/pqc/v1/kem/<address>`。鍵を公開していないアカウントには `{"found":false,"key":null}` が返ります。
4. 受信者カードに署名します: `signRecipientCard({ chainId: "qorechain-diana", address, keys: sealKeys, classicalKey, pqKey })`。それを、送信者が取得できる場所に公開します。
5. 送信者側: `sealToAddresses({ rest: "https://api-testnet.qore.host", chainId: "qorechain-diana", purpose: "note", recipients: [{ address, card }], plaintext })`。カードがない場合は `mode: "mlkem"` を渡します。
6. 受信者側: `open({ chainId: "qorechain-diana", purpose: "note", envelope, keys: sealKeys })`。

実行可能な完全なフローは、リポジトリのサンプル `examples/register-and-encrypt` です。メインネットが v3.2.5 を適用するまで、このサンプルはメインネットでの実行を拒否します。Go は、`network.NewClient(rest).SealToAddresses(ctx, network.SealToArgs{...})` で同じ送信者側を提供します。Rust、Swift、Kotlin、Python はオフラインです。`/qorechain/pqc/v1/kem/{address}` と `/qorechain/pqc/v1/account/{address}` を自分で読み取り、カードを検証（`verify_recipient_card`）してから封印してください。

### 主な API {#api}

名前は TypeScript の形式です。Go は Go の表記（`Seal`、`Open`、`NewEpochKeyManager`）、Rust と Python はスネークケースを使います。Python、Swift、Kotlin では、`seal` と `open` は `seal_envelope` / `sealEnvelope` と `open_envelope` / `openEnvelope` です。

| 名前 | 内容 | 対象 |
|---|---|---|
| `generateSealKeys` | ランダムな鍵ペア（ML-KEM-1024 + X25519） | すべて |
| `deriveSealKeys` | BIP-39 ニーモニック、オプションのパスフレーズ、インデックスからの鍵ペア | すべて |
| `sealKeysFromSeed`、`sealSeedFromMnemonic` | 32 バイトのシードから復元。ニーモニックからシードを生成 | すべて |
| `recipientOf` | 鍵ペアから公開の受信者を作成 | すべて |
| `validateMlkemPublicKey`、`validateX25519PublicKey` | 入力の検証（チェーンも同じ ML-KEM の検証を行います） | すべて |
| `seal` | 1 から 1,024 の受信者宛てに暗号化（`mode`、`aad`、`anonymous`） | すべて |
| `open` | 鍵ペアで復号 | すべて |
| `parseEnvelope`、`envelopeSize` | エンベロープの検査、サイズの計算 | すべて |
| `envelopeToText`、`envelopeFromText` | `qoreseal:` テキスト形式 | すべて |
| `signRecipientCard`、`verifyRecipientCard` | 受信者カードの作成と検証 | すべて |
| `recipientCardText`、`recipientCardFields`、`assembleRecipientCard` | ウォレット UI など別の場所で署名するときにカードを構築 | すべて |
| `buildRegisterKemKeyMessage`、`buildRemoveKemKeyMessage` | レジストリメッセージ。QoreSign でハイブリッド署名します | すべて |
| `describeKemRegistryError` | codespace `pqc` のコード 250 から 254 を説明 | すべて |
| `EpochKeyManager` | グループのエポック鍵: `addMember`、`removeMember`、`rotate`、`distribution`、`exportKeys`、`keyFor`、`members`、`epoch` | すべて |
| `sealEpochKey`、`openEpochKey` | エポック鍵の送受信（たとえば新規参加者への履歴） | すべて |
| `PrivateBatchCodec`、`sealBatch`、`openBatch`、`parseBatchHeader`、`batchSize` | コミットメント付きの暗号化バッチ | すべて |
| `fetchKemKey`、`fetchMlkemPublicKey` | REST からアカウントの ML-KEM 鍵を読み取る | TypeScript、Go の network パッケージ |
| `resolveRecipient` | チェーン上の鍵とカードを検証して受信者にする | TypeScript、Go の network パッケージ |
| `sealToAddresses` | アドレスでアカウント宛てに封印 | TypeScript、Go の network パッケージ |

ネットワークヘルパーは、TypeScript では `@qorechain/qoreseal/network`、Go では `github.com/qorechain/qoreseal/go/network` です。より低レベルの部品もエクスポートされています（`mlkemEncapsulate`、`mlkemDecapsulate`、`x25519Agree`、`hybridSharedSecret`、`deriveKey`、`kdfInfo`、`recipientHint`）。テスト用の名前を持つ関数（`sealWithEntropy`、`testing_*`）は、テストベクターを再現するためのもので、実データには決して使用しないでください。

Python のエラーは安定した `code` を持つ `QoreSealError.Failure` を送出します。Go のエラーは `qoreseal.IsCode` で比較します。

## アクセス方法 {#how-to-access}

| | メインネット `qorechain-vladi` | テストネット `qorechain-diana` |
|---|---|---|
| KEM 鍵レジストリ | v3.2.5 のアップグレード後（まだ適用されておらず、日付は未定） | 稼働中 |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host`（チェーン ID 9801） | `https://evm-testnet.qore.host`（チェーン ID 9800） |

2026年10月27日、テストネットのレジストリクエリは、鍵のないアカウントに対して `{"found":false,"key":null}` を返し、メインネットでの同じクエリは "Not Implemented" を返しました。

- オフラインでの封印と開封は、直接渡す監査人鍵、プライベートグループ、バッチを含め、ネットワークもアカウントも不要です。
- アドレス宛てに暗号化するには、受信者が ML-KEM-1024 鍵をレジストリに公開していることが必要で、ハイブリッドモードでは受信者カードも必要です。
- 鍵を公開するには、テストネット QOR（メインネットではアップグレード後の QOR）を持つアカウント、登録済みの ML-DSA-87 鍵、そしてトランザクションにハイブリッド署名するための QoreSign が必要です。手数料の下限はガス 1 あたり 0.1 uqor です。テストネット QOR は[フォーセット](/dashboard/faucet)から入手してください。
- メインネットが v3.2.5 を適用するまで、メインネットではレジストリクエリは利用できず、登録は拒否されます（コード 250）。

## 公開場所 {#where-published}

2026年10月27日に、各レジストリで確認しました。

| レジストリ | パッケージ | バージョン | リンク |
|---|---|---|---|
| crates.io | `qorechain-qoreseal` | 0.1.0 | [crates.io/crates/qorechain-qoreseal](https://crates.io/crates/qorechain-qoreseal) |
| Go モジュールプロキシ | `github.com/qorechain/qoreseal/go` | v0.1.0（タグ `go/v0.1.0`） | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoreseal/go) |
| PyPI | `qorechain-qoreseal` | 0.1.0（macOS arm64 と x86_64、Linux x86_64 と aarch64 向けのホイール、およびソース） | [pypi.org/project/qorechain-qoreseal](https://pypi.org/project/qorechain-qoreseal/) |
| Swift Package Manager | `github.com/qorechain/qoreseal` の `QoreSeal` | 0.1.0（GitHub リリースのバイナリ `QoreSealFFI.xcframework.zip`） | [release v0.1.0](https://github.com/qorechain/qoreseal/releases/tag/v0.1.0) |
| Maven Central | `io.github.qorechain:qoreseal` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) |
| Maven Central | `io.github.qorechain:qoreseal-android` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) |
| npm | `@qorechain/qoreseal` | まだ公開されていません（近日公開） | |

どちらの Maven アーティファクトを使うプロジェクトも、Kotlin 2.3 以降のコンパイラが必要です。Kotlin/JVM アーティファクトは、macOS（arm64、x86_64）、Linux（x86_64、arm64）、Windows（x86_64）向けのネイティブライブラリを同梱しています。Android アーティファクトは arm64-v8a、armeabi-v7a、x86_64 をカバーします。

ソース: [github.com/qorechain/qoreseal](https://github.com/qorechain/qoreseal)（リリース v0.1.0）。ライセンスは Apache-2.0 です。

## 制限と既知の問題 {#limits}

- **保護されるのはペイロードの内容です。** 送信者と受信者のアドレス、バンク送金の金額、トランザクションのタイミング、エンベロープのサイズ、受信者の数はチェーン上で公開されたままです。
- **プライベートトランザクションではありません。** QoreSeal は、誰が誰と取引するか、いくら取引するかを隠しません。
- **ゼロ知識証明はありません。** 暗号化されたデータについて何も証明されません。プライベートサイドチェーンでは、グループ外の検証者はバッチの内部で何が起きているかを確認できません。
- **エンベロープは署名されません。** 誰でもアドレス宛てに暗号化でき、複数受信者のエンベロープの受信者は誰でも、他の受信者向けに別のエンベロープを作れてしまいます。送信者を認証する必要がある場合は、内容またはエンベロープに署名してください（QoreSign の `signMessage`）。
- **すべての受信者がペイロード全体を読みます。** 受信者ごとの秘匿処理はありません。読者が異なる場合は、別々のエンベロープを封印してください。
- **ヒントは匿名性ではありません。** 候補の公開鍵（チェーン上にあります）を知っている人なら誰でも、その鍵が受信者かどうかを試せます。`anonymous: true` はヒントをゼロにし、その場合、受信者はすべてのエントリを試します。
- **鍵を失うとデータを失います。** チェーン上での復旧はありません。シードまたはニーモニックを失うと、その鍵宛てに封印されたすべてを失います。
- **鍵の削除やローテーションは、何も消去も再暗号化もしません。** 古い鍵宛てに封印されたデータは、その鍵を持つ人には引き続き読めます。古いシードやインデックスは保管してください。
- **削除されたグループメンバー**は、所属していたエポックの鍵を保持します。新しいメンバーは、古い鍵が自分宛てに封印されない限り、参加したエポック以降を読みます。
- **チェーン ID と目的はエンベロープに含まれません。** 受信者がそれらを知っている必要があります。
- **メインネットのレジストリ:** メインネットが v3.2.5 を適用するまで利用できません。
- **1.0 より前で、構成は外部レビュー待ちです。** マイナーバージョンで API が変わることがあります。依存する前に仕様を読んでください。
- **npm パッケージはまだなく**、Windows 用の Python ホイールもまだありません。

## セキュリティに関する注意 {#security}

- 秘密鍵は、QoreSeal を実行するデバイスやサーバーの外に出ることはありません。チェーンが保存するのは ML-KEM-1024 公開鍵だけで、カードは X25519 公開鍵を運びます。
- アカウントのニーモニック、専用のニーモニック、または 32 バイトのシード（`keys.seed`）を、保存時に暗号化してバックアップしてください。ML-KEM 秘密鍵だけをエクスポートしてはいけません。シードまたはニーモニックをエクスポートしてください。
- ローテーション: 次のインデックスに移り、新しい ML-KEM 鍵を登録し、新しいカードに署名します。古いカードは自動的に検証されなくなります。
- ユーザーの鍵が失われてもデータが残る必要がある場合は、リカバリー受信者（オフラインの鍵）を追加してください。追加先のすべてを読めるため、監査人鍵と同じように扱ってください。
- グループでは、`exportKeys()` がすべてのエポック鍵を保持します。そのエクスポートを運営者自身の鍵とオフラインのリカバリー鍵宛てに封印し、シーケンサーのマシンには置かないでください。エポック鍵は定期的にローテーションしてください。
- `mlkem` モードは明示的に選択する必要があり、ハイブリッドが暗黙に劣化することはありません。
- プリミティブは [`qorechain-pqc`](/developer-tools/pqc-library) バインディングと、確立されたライブラリ（TypeScript では noble、RustCrypto クレート、Go の標準ライブラリ）から来ており、アカウント署名は [QoreSign](/qoresign/overview) から来ています。
- 脆弱性は security@qore.network まで非公開で報告してください。チェーン上のメタデータが公開されているのは設計どおりであり、ドキュメント上の話題であって、脆弱性ではありません。

## 関連ページ {#related}

- [QoreSign](/qoresign/overview): 登録トランザクションのハイブリッド署名と、受信者カードや署名付きエンベロープの背後にあるメッセージ署名。
- [RDK 概要](/rollups/overview)と[データアベイラビリティ](/rollups/data-availability): プライベートサイドチェーンの暗号化バッチのアンカー。
- [PQC ライブラリ](/developer-tools/pqc-library): QoreSeal の下にある ML-KEM-1024 バインディング。
- [ポスト量子セキュリティ](/architecture/post-quantum-security)と[ポスト量子署名](/developer-guide/post-quantum-signing): アカウントと鍵がチェーン上でどのように機能するか。
- [開発者パッケージ概要](/developer-tools/overview)。
