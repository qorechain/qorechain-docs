---
slug: /qorel/signing-from-any-language
title: どの言語からでも QoreChain トランザクションに署名する
sidebar_label: どの言語からでも署名
sidebar_position: 8
---

# どの言語からでも QoreChain トランザクションに署名する

QORel は、`qorel-signer` クレートを使って Rust で署名します。他のリレイヤー、ボット、ツールも、QoreChain SDK とポスト量子ライブラリを使えば、他の言語で同じハイブリッドのポスト量子署名を生成できます。このページでは、それらすべてが従う契約を示し、Rust、TypeScript、Go、Python、Java で使うライブラリを一覧にします。QoreChain にトランザクションを送信するリレイヤー、ボット、バックエンドを構築する開発者向けです。

## 特長 {#innovations}

- **1 つの契約、1 組のテストベクター。** どの言語も同じ sign bytes と同じ拡張を構築します。QORel リポジトリは、チェーンが受け付けたトランザクションからバイト単位で再構築したベクターを公開しているため、実装をネットワークに触れさせる前に確認できます。
- **追加されるのは拡張だけです。** ポスト量子署名は、トランザクションボディの 1 つの拡張オプションに載って運ばれます。メッセージ、手数料、従来型の署名は通常の形式のままです。
- **フックポイントは限定的です。** 署名は、auth info が確定した後、従来型の署名ドキュメントを構築する前に追加されます。リレイヤーに必要なのはその箇所での 1 つの変更であり、書き直しではありません。
- **どこでも同じ鍵。** ML-DSA-87 鍵は、QoreChain ウォレットの導出方式でアカウントのニーモニックから導出されるため、そのニーモニックをインポートするどのウォレットやリレイヤーでも、同じポスト量子鍵が得られます。

## 使い方 {#how-to-use}

### 契約 {#contract}

QoreChain は、次の両方の署名を持つネイティブレーンのトランザクションだけを受け付けます。

- **従来型の secp256k1 署名**。通常の `SIGN_MODE_DIRECT` 形式で、拡張を含む最終的なボディをカバーします。
- ボディの拡張オプションに含まれる **ML-DSA-87（FIPS 204）署名**。型は `/qorechain.pqc.v1.PQCHybridSignature` で、`algorithm_id = 1`、`pqc_signature`（4,627 バイト）、およびオプションの `pqc_public_key`（2,592 バイト）を持ちます。これはトランザクションの唯一のクリティカルな拡張オプション（`extension_options` 内）でなければなりません。

ML-DSA 署名は sign bytes（バージョン 2、両方のネットワークで現行）をカバーします。

```
"qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id
                          || BE32(len(B0)) || B0
                          || BE32(len(A))  || A
```

- `B0` は、PQC 拡張を含まない `TxBody` を、正規形で再エンコードしたものです。
- `A` は `AuthInfo` のバイト列で、変更しません。

処理の順序:

1. ボディと auth info を構築します。
2. sign bytes に ML-DSA-87 で署名します。
3. 拡張をボディに追加します。
4. 最終的なボディに secp256k1 で署名します。
5. ブロードキャストします。

間違えやすいルール:

- `B0` は正規形である必要があります。チェーンは、ボディをデコードし、ハイブリッドのオプションを取り除き、再エンコードすることで `B0` を再導出するためです。独自の拡張オプション、`unordered` フラグ、不明なフィールド、非正規のエンコードを含むボディを送信しないでください。
- codespace `pqc` コード 21 での拒否は、ハイブリッド署名の検証に失敗したことを意味します。再試行する前に、sign-bytes バージョンとアカウントの登録状況を再読み込みしてください。[ポスト量子署名](/developer-guide/post-quantum-signing#code-21)を参照してください。
- ガス: 検証には、鍵を持つ署名者 1 人あたり 2,000 ガスに加えて、約 4.7 KB の拡張のサイズ分のコストがかかります。両方が計上されるよう、同じ経路でシミュレートしてください。

### 鍵の登録と導出 {#keys}

アカウントは、所有証明（proof of possession）を含めて、`MsgRegisterPQCKeyV2` で ML-DSA 公開鍵を 1 回登録します。これは、QoreChain が従来型の署名だけで受け付ける唯一のトランザクションです。[ポスト量子署名](/developer-guide/post-quantum-signing#pqc-key-registration)を参照してください。

ML-DSA 鍵は、アカウントと同じニーモニックから導出されます。

```
seed = SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)[:32]
```

その後、`ML-DSA-87.KeyGen_internal(seed)` を実行します。秘密情報はゼロ化され、出力されることはありません。同じ導出は[鍵導出](/qoresign/guides/key-derivation)でも説明されています。

### QORel のシグナーレイヤー {#signer-layer}

`qorel-signer` クレートは、作業を 3 つのインターフェースに分けます。

- `PqSigner`: ポスト量子プリミティブ（`algorithm_id`、`public_key`、`sign`）。`MlDsa87Signer` が提供されており、デフォルトではヘッジ署名、テストベクターでは決定論的署名を使います。すべての署名は使用前に検証されます。
- `SignBytesFramer`: チェーンのルール（`check_body`、`frame`、`pack`）。
- `TxExtensionSigner`: リレイヤーが呼び出すもの。`PqExtensionSigner` がプリミティブとフレーマーを組み合わせます。

リレイヤーは次の順序でトランザクションを構築します。共同署名者の拡張を含まないボディをエンコードする（`B0`）。最終的な auth info をエンコードする（`A`）。追加する拡張オプションを共同署名者に尋ねる。それらを含めてボディを再エンコードする。最終的なボディの署名ドキュメントに対して従来型の署名を作成する。Rust からこのクレートを使うには、リポジトリから依存として指定してください（crates.io には未公開です）。

```toml
[dependencies]
qorel-signer = { git = "https://github.com/qorechain/QORel", tag = "qorel-v0.1.0" }
```

チェーン向けのハイブリッドシグナーを構築し、拡張オプションを尋ねる完全な呼び出し例は、リポジトリの `crates/qorel-signer/README.md` にあります。このクレートは生の protobuf バイト列を扱い、チェーンが拒否するボディ（既存のクリティカルな拡張オプション、`unordered`、不明なフィールド）を拒否し、バージョンが判明する前に QoreChain ネットワークで v1 の sign bytes にフォールバックすることはなく、作成した各署名を検証し、シークレットをゼロ化して `Debug` 出力ではマスクします。そのテストでは、チェーンの ante ハンドラーが受理したトランザクションを、バイト単位で再構築します。[概要の qorel-signer](/qorel/overview#qorel-signer)も参照してください。

別の追加署名を必要とするチェーンは、フレーマーを実装し、アルゴリズムが異なる場合は新しいプリミティブも実装します。リレイヤーの他の部分は何も変わりません。

### ライブラリ {#libraries}

| 言語 | パッケージ | ハイブリッド署名 |
|---|---|---|
| Rust | `qorechain-sdk`（crates.io）、または [QORel リポジトリ](https://github.com/qorechain/QORel)の `qorel-signer`（`crates/qorel-signer`） | `PqExtensionSigner` を使う `qorel_signer::qorechain::qorechain_hybrid_signer`、`qorechain::tx::build_hybrid_tx` |
| TypeScript と JavaScript | `npm install @qorechain/sdk` | `pqcKeypair` でハイブリッド署名する `TxClient`、`ensurePqcRegistered` |
| Go | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | `qorechain/tx`（ハイブリッドの構築と署名）、`qorechain/signbytes`、`qorechain/pqcdx` |
| Python | `pip install qorechain-sdk` | `build_hybrid_tx`、`build_hybrid_signature_extension` |
| Java と Kotlin | `io.github.qorechain:qorechain-sdk`（Maven Central） | `PqcDx`（登録、ハイブリッド送信パス）とハイブリッドトランザクションビルダー |
| C およびその他 | [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) | ML-DSA-87 の鍵生成、署名、検証のバインディング。sign bytes は上記のとおりにフレーム化します |

各パッケージの現行バージョンについては[開発者向けパッケージ](/developer-tools/overview)を、ウォレットやバックエンドでの署名については [QoreSign](/qoresign/overview) を参照してください。一部のパッケージの従来型のみのクライアントは、ネイティブレーンのトランザクションを送信できません。書き込みに使う前に、パッケージのページを確認してください。

### テストベクター {#test-vectors}

QORel リポジトリの `crates/qorel-signer/tests/vectors/` には、次のものがあります。

- sign bytes の既知解答ファイル。
- リレートランザクションのベクター: 拡張を含まないボディ、sign bytes、拡張のバイト列、完全に署名されたトランザクション。チェーンが受け付けたトランザクションからバイト単位で再構築されたものです。
- SDK 間で共通の鍵導出ベクター。

稼働中のネットワークに何かを送信する前に、ご自身の言語でこれらを実行してください。QoreSign のベクターは[テストベクター](/qoresign/vectors)にあります。

### 他のリレイヤーにポスト量子署名を追加する {#other-relayers}

フックポイントは「auth info が確定した後、従来型の署名ドキュメントを構築する前」です。拡張はそこに差し込みます。

- Hermes ベースのリレイヤーでは、それは `crates/relayer/src/chain/cosmos/encode.rs::sign_tx` です。そこでの QORel の変更は汎用的で、任意の `TxExtensionSigner` が拡張オプションを追加できます。
- Cosmos SDK の `client/tx` パッケージ上に構築された Go のリレイヤーでは、`SetSignatures` の前に `TxBuilder` をラップします。

## アクセス方法 {#how-to-access}

- **ネットワーク。** 契約は両方の QoreChain ネットワークで同じです。QORel 自体はテストネットでのみテストされています。
- **鍵とアカウント。** ML-DSA-87 鍵が登録された、資金のあるアカウント。テストネット QOR は[ダッシュボードのファウセット](/dashboard/faucet)から入手できます。
- **費用。** ライブラリは無料です（Apache-2.0）。トランザクションはガスを支払い、下限はガス 1 あたり 0.1 uqor です。

## 公開場所 {#where-published}

| パッケージ | レジストリ | ソース |
|---|---|---|
| `qorel-signer` | リポジトリ内（`crates/qorel-signer`）。crates.io には未公開のため、上記の git 依存を使用してください | [qorechain/QORel](https://github.com/qorechain/QORel) |
| `qorechain-sdk`、`@qorechain/sdk`、Go モジュール、Maven アーティファクト | crates.io、npm、Go プロキシ、Maven Central、PyPI | [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk) |
| `qorechain-pqc` | npm、PyPI、crates.io、Go、Maven | [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc) |

## 制限と既知の問題 {#limits}

- **ML-DSA-87（アルゴリズム ID 1）のみ。** QORel と上記のライブラリが署名に使うアルゴリズムは、これだけです。
- **sign-bytes バージョン。** このページはバージョン 2 を記載しており、両方のネットワークがこれを検証します。ツールは、バージョンを仮定するのではなく、チェーン（適用済みのアップグレード記録）から読み取る必要があります。QORel はそうしています。
- **署名はローカルです。** これらのライブラリは、あなたの代わりに鍵を保管することも、ハードウェアウォレット経由で署名することもありません。
- **各言語の例はここでは繰り返しません。** 各パッケージ自身のクイックスタートを使用してください。このマニュアルは、すべての言語が QORel のテストベクターに対して実行されたとは主張しません。
