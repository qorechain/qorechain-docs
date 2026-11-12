---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: Rust アプリ、qday-pay
sidebar_label: Rust、qday-pay
sidebar_position: 4
---

# Rust アプリ: qday-pay

**qday-pay** は、QoreChain テストネット（`qorechain-diana`、EVM チェーン ID 9800）で QOR を**ハイブリッド署名**で支払う、小さな Rust のコマンドラインツールです。従来型の secp256k1 署名と、ポスト量子の ML-DSA-87（FIPS 204）署名の両方が、同じトランザクションに付きます。送信後は、トランザクションをチェーンから読み戻し、チェーンが両方の署名を検証したかどうかを表示します。

## 確認できること {#what-it-shows}

- **Rust からの ML-DSA-87 + secp256k1 ハイブリッド署名。** 公開されているクレートだけで動き、追加のツールは要りません。
- **オンチェーンで検証された、ハイブリッド署名トランザクション1件。** チェーンは `status=verified` の `pqc_hybrid_verify` イベントを発行し、トランザクション本体には、64 バイトの secp256k1 署名と並んで、4627 バイトの ML-DSA-87 署名が含まれます。
- **1つのリカバリーフレーズで2つの鍵。** ML-DSA-87 鍵は、従来型の鍵と同じニーモニックから導出され、あなたのアドレスに紐づけられます。

これが重要な理由です。将来の量子コンピューターは secp256k1 署名を破ると見込まれています。ML-DSA-87 署名も付いたトランザクションは、保護されたままです。[量子耐性トランザクション](/sdk/guides/quantum-safe)を参照してください。

## ステップバイステップ {#run}

### 1. ツールをインストールする

Git と、最近の安定版 Rust ツールチェーン（`cargo` を含む）が必要です。

- Git: https://git-scm.com/downloads
- Rust: https://rustup.rs から rustup でインストールします

バージョンを確認します。

```bash
git --version
rustc --version
cargo --version
```

### 2. コードを取得する

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

### 3. ビルドする

```bash
cargo build --release
```

最初のビルドでは、依存関係をダウンロードしてコンパイルするため、数分かかります。最後に `Finished` と `release` プロファイルが表示されます。引数なしでツールを実行すると、コマンドの一覧が表示されます。

```bash
cargo run --release
```

### 4. 使い捨てのテストネットアカウントを作る

```bash
cargo run --release -- new
```

`new` はリカバリーフレーズを作成し、モード 0600 の鍵ファイルに保存します。フレーズが画面に表示されることはありません。鍵ファイルのデフォルトは `~/.config/qday/rust.env` で、別のパスを使うには `QDAY_KEY_FILE` を設定します。既存のファイルは上書きされません。これはテストネット専用のアカウントです。ここで実際のウォレットを使わないでください。鍵ファイルを共有したり、コミットしたり、メインネットで使い回したりしてもいけません。コマンドは、あなたの `qor1...` アドレスを表示します。

### 5. フォーセットでテストネット QOR を受け取る

1. https://dashboard.qorechain.io/faucet を開いてサインインします。
2. `qor1...` のアドレスを貼り付けて、受け取ります。1回の受け取りで 100 QOR が支払われ、アカウントごと、アドレスごとに24時間に1回です。

登録には手数料がかかるため、次のステップの前に、アカウントがチェーン上に存在している必要があります。

### 6. アカウントを確認する

```bash
cargo run --release -- status                  # address, balance, PQC key, latest block
```

### 7. ML-DSA-87 鍵を登録する

```bash
cargo run --release -- register                # register the ML-DSA-87 key (once, idempotent)
```

登録トランザクションは従来型の署名で行われます。鍵は自分自身の登録に共同署名できないためです。もう一度実行しても、何も起こりません。

### 8. ハイブリッド署名の支払いを送る

```bash
cargo run --release -- send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

`qor1...` を、任意のテストネットアドレス（たとえば2つ目の使い捨てアカウント）に置き換えてください。金額は QOR 単位です。`send` は金額を支払い、そのあと検証を実行します。

### 9. 任意のトランザクションを検証する

```bash
cargo run --release -- verify <TX_HASH>        # the verification report for any transaction
```

このツールはテストネット専用です。SDK の `testnet` プリセットを使い、ほかのチェーン ID に対しては実行を拒否します。

## アカウント {#account}

アカウントは、QoreChain Native の secp256k1 アカウントで、コインタイプは 118（`m/44'/118'/0'/0/0`）、アドレスは `qor1...` です。ML-DSA-87 鍵は、SDK の標準であるアドレス紐づけ規則を使い、同じニーモニックから導出されます。1つのニーモニックで、両方の鍵を復元できます。

```rust
let classical = derive_native_account(mnemonic, 0)?;
let pqc = try_derive_pqc_canonical(&classical.address, mnemonic)?;
```

## 肝心の SDK コード {#code}

これは、`send` コマンドの中核部分を、短く整えたものです。

```rust
// The payment: a plain bank MsgSend.
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);
// Which hybrid sign-bytes form this network verifies (asked once, cached).
let version = SignBytesResolver::new()
    .resolve(SignBytesMode::Auto, &net.chain_id, Some(&net.rest_url)).await?;

let mut params = BuildHybridTxParams {
    private_key: w.classical.private_key.clone(), // secp256k1 half
    public_key: w.classical.public_key.clone(),
    pqc_secret_key: w.pqc.secret_key.clone(),     // ML-DSA-87 half
    pqc_public_key: w.pqc.public_key.clone(),
    messages: vec![Message { type_url: send.type_url, value: send.value }],
    chain_id: net.chain_id.clone(),
    include_pqc_public_key: false, // key registered with `register`
    sign_bytes_version: Some(version),
    /* fee, account_number, sequence, memo, timeout_height */
};

let draft = build_hybrid_tx(params.clone())?;                    // sign a draft
params.fee = estimate_fee(&net.rest_url, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params.clone())?;                       // sign for real
let res = broadcast_and_wait(&net.rest_url, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

登録は、`PqcDx` の冪等な呼び出し `ensure_pqc_registered()` 1回で行われます。鍵がまだ登録されていないときにだけ、所有証明付きの `MsgRegisterPQCKeyV2` を送信し、アカウントに別の鍵がある場合は失敗します。

ガスは固定ではありません。ドラフトをシミュレートし、リミットはシミュレートしたガスの 1.3 倍とし、ガス1単位あたり 0.15 uqor で価格を決めます（チェーンの下限は 0.1 uqor です）。

## 「検証済み」の判定方法 {#verified}

`verify` は、公開テストネット REST エンドポイントの `GET /cosmos/tx/v1beta1/txs/{hash}` を読み取り、3つの点を確認します。

- トランザクションが成功したこと（`code 0`）。
- チェーンが、署名者について `status=verified` の `pqc_hybrid_verify` を発行したこと。
- 本体に、4627 バイトの ML-DSA-87 署名を持つ `/qorechain.pqc.v1.PQCHybridSignature` 拡張があること。

## 何が表示されるか {#output}

`send` が成功すると、金額と手数料、含まれたブロックが表示され、続いてレポートが表示されます。レポートには、トランザクションが成功したこと、`pqc_hybrid_verify` が `verified` であること、ML-DSA-87 署名が 4627 バイトであることが示されます。どれかのチェックが失敗すると、ツールはステータス 2 で終了します。トランザクションを検索するには、https://explore.qore.network を開いて **Testnet** に切り替え、ハッシュを検索するか、`https://explore.qore.network/tx/<HASH>` を開きます。

## ネットワークのエンドポイント {#access}

| 項目 | 場所 |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| エクスプローラー | `https://explore.qore.network`（Testnet に切り替えます） |
| フォーセット | https://dashboard.qorechain.io/faucet |

## 使用したパッケージ {#packages}

| 項目 | バージョン |
| --- | --- |
| `qorechain-sdk`（`qorechain` としてインポート） | 0.13（0.13.0 に解決） |
| `tokio` | 1 |
| `serde_json` | 1 |
| `base64` | 0.22 |
| `cosmrs` | 0.22 |
| `qday-pay`（このアプリ。未公開） | 0.1.0 |

全言語の SDK リリース表は [SDK のインストール](/sdk/install)を参照してください。

## ソースコード {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
