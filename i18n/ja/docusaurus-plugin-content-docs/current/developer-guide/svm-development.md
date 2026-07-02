---
slug: /developer-guide/svm-development
title: SVM開発
sidebar_label: SVM開発
sidebar_position: 4
---

# SVM開発

QoreChainには**Solana Virtual Machine（SVM）**実行環境が含まれており、開発者は使い慣れたSolanaツールを使用してSBF/BPFプログラムをデプロイ・実行できます。SVMモジュールは、Solana互換のJSON-RPCインターフェースを**ポート8899**で公開しており、`qorechaind start` が自動的に起動します（下記の[JSON-RPCサーバー](#json-rpc-server)を参照）。

:::note
以下のコマンドは、2026年6月7日から稼働しているチェーンバージョン**v3.1.82**の**`qorechain-vladi`**メインネットを使用しています。テストネットの場合は `--chain-id qorechain-diana` に置き換えてください。
:::

---

## 概要

`x/svm` モジュールは以下を提供します。

* **ファーストクラスのSVM資産としてのネイティブQOR** — アカウントの統一残高がlamports単位で表示されます
* SBF/BPFプログラムのデプロイと実行
* データアカウントの作成と管理
* Solana互換のJSON-RPCエンドポイント
* QoreChainとSolanaのアドレス形式間の双方向アドレスマッピング
* コンピュートバジェットの計測とレント（rent）ベースのストレージエコノミクス

---

## SVMインターフェース上のネイティブQOR {#native-qor}

チェーンバージョン**v3.1.82**以降、SVMインターフェースは独立したサンドボックス残高ではなく、**ファーストクラスのネイティブQORインターフェース**となっています。アカウントの単一の統一残高 — Cosmosインターフェースでは `uqor`、EVMでは18桁小数のweiとして表示されるのと同じ資金 — が、SVM側では**lamports**（9桁小数）で表示されます。

```
1 uqor = 1,000 lamports    ·    1 QOR = 1,000,000,000 lamports
```

* **`getBalance` / `getAccountInfo`** は、アカウントのネイティブQOR（lamports単位）を返します。
* **`getSignaturesForAddress`** は、アドレスに関係するトランザクション履歴を返します — 標準的なSolanaツールによる入金検知に利用できます。
* **System ProgramのトランスファーはネイティブQORを移動します** — Solanaスタイルのトランスファー命令は、Cosmosの `MsgSend` やEVMトランスファーと同じ資金を移動します。
* **SVMアドレス形式** — アカウントのSVMアドレスは、20バイトのアカウントバイト列を右側に32バイトまでパディングし、base58エンコードしたものです。3つのアドレス形式（`qor1...`、`0x...`、base58）はすべて同一のアカウントを指します。

パブリックエンドポイント（`https://svm.qore.host`、`https://svm-testnet.qore.host`）は**読み取り専用**です — エッジでトランザクション送信が無効化されています。SVMトランザクションを送信するには、自身のノード（ポート8899）を運用してください。

---

## JSON-RPCサーバー {#json-rpc-server}

Solana互換のJSON-RPCサーバーは**`qorechaind start` によって起動**され、**デフォルトで有効**です。`app.toml` の `[svm-rpc]` セクションで設定します。

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

デフォルトは `enable = true` および `address = "127.0.0.1:8899"` であり、起動したばかりのノードはすでにポート8899でSolana JSON-RPCインターフェースを提供しています — `@solana/web3.js` は追加設定なしで `http://127.0.0.1:8899` に接続できます。`getVersion` は `1.18.0-qorechain` を報告し、`getBalance` / `getAccountInfo` はオンチェーンの実際のSVMアカウントを返します。

| プロパティ      | 値                     |
| ------------- | ------------------------- |
| デフォルトURL   | `http://127.0.0.1:8899`   |
| 有効化       | はい、デフォルトで有効           |
| 起動元    | `qorechaind start`        |
| 互換性 | Solana JSON-RPC（サブセット）  |
| `getVersion`  | `1.18.0-qorechain`        |

### サポートされているメソッド

| メソッド                              | 説明                               |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | アカウントデータとlamports残高の取得 |
| `getBalance`                        | lamports単位のアカウント残高（ネイティブQOR）の取得 |
| `getSignaturesForAddress`           | アドレスのトランザクション履歴        |
| `getSlot`                           | 現在のスロット番号                       |
| `getMinimumBalanceForRentExemption` | 指定データサイズに対する最小残高     |
| `getVersion`                        | SVMランタイムのバージョン情報                  |
| `getHealth`                         | SVMエンドポイントのヘルスチェック         |

---

## プログラムのデプロイと操作

:::info
**最新のSBF実行環境。** SVM実行エンジンは**solana-sbpf 0.21.1**にモダナイズされているため、現行のSolanaツールチェーン（**platform-tools v1.53 / agave 4.x**）で新たにコンパイルしたSBFプログラムは、QoreChain上で**デプロイと実行の両方**が可能です — デプロイのみではなく、実行が完全にサポートされています。`cargo build-sbf --arch v0` または `--arch v3` のいずれでビルドしたプログラムもサポートされます。
:::

1. **SBFプログラムのデプロイ** — 現行のplatform-tools（v1.53 / agave 4.x）でSolanaプログラムをSBF共有オブジェクトにコンパイルし、QoreChainにデプロイします。

   ```bash
   # Build with the current Solana toolchain (--arch v0 or --arch v3)
   cargo build-sbf --arch v3

   # Deploy the compiled program
   qorechaind tx svm deploy-program ./my_program.so \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   トランザクションのレスポンスには、base58形式の**プログラムID**が含まれます。

2. **命令（Instruction）の実行** — 命令データを指定してオンチェーンのBPFプログラムを呼び出します。

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | パラメータ           | 形式            | 説明                    |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | Base58文字列     | デプロイ済みプログラムのアドレス |
   | `data-hex`          | 16進エンコードされたバイト列 | シリアライズされた命令データ    |

3. **データアカウントの作成** — プログラムは多くの場合、状態を保存するためのアカウントを必要とします。サイズと所有者を指定して作成します。

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | パラメータ      | 説明                                        |
   | -------------- | -------------------------------------------------- |
   | `owner-base58` | このアカウントを所有するプログラム（base58）        |
   | `space`        | データフィールドのサイズ（バイト単位）                    |
   | `lamports`     | 初期残高（レント免除の最小額を満たす必要があります） |

   指定サイズに対するレント免除の最小残高を照会します。

   ```bash
   # RPC: getMinimumBalanceForRentExemption
   curl -X POST http://localhost:8899 \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "getMinimumBalanceForRentExemption",
       "params": [1024]
     }'
   ```

4. **@solana/web3.jsの使用** — Solana JavaScript SDKは、QoreChainのSVMエンドポイントと直接動作します。

   ```javascript
   import { Connection, PublicKey } from "@solana/web3.js";

   const connection = new Connection("http://127.0.0.1:8899");

   // Check health
   const health = await connection.getHealth();
   console.log("SVM health:", health);

   // Get slot
   const slot = await connection.getSlot();
   console.log("Current slot:", slot);

   // Get account info
   const pubkey = new PublicKey("YourBase58ProgramId...");
   const accountInfo = await connection.getAccountInfo(pubkey);
   console.log("Account data:", accountInfo);

   // Get balance
   const balance = await connection.getBalance(pubkey);
   console.log("Balance (lamports):", balance);
   ```

---

## アドレスマッピング

QoreChainは、ネイティブのBech32アドレス（`qor1...`）とSolanaスタイルのbase58アドレスの間で**双方向アドレスマッピング**を維持しています。

| 方向     | 例                                                    |
| ------------- | ---------------------------------------------------------- |
| ネイティブ→SVM | `qor1abc...xyz` は決定論的なbase58アドレスにマッピングされます     |
| SVM→ネイティブ | Base58のプログラムアドレスは対応する `qor1...` にマッピングされます |

このマッピングは決定論的であり、`x/svm` モジュールによって管理されます。両方の表現は同一の基礎アカウントを指します。

---

## レントモデル

SVMモジュールは、状態の肥大化を防ぐために**レント（rent）ベースのストレージモデル**を採用しています。

| パラメータ                  | 値      |
| -------------------------- | ---------- |
| 1バイトあたり年間のlamports | `3,480`    |
| レント免除乗数  | `2.0`      |
| 徴収頻度       | 各エポック |

* 残高が `2 * (data_size * 3480 / seconds_per_year)` lamportsを**上回る**アカウントは**レント免除（rent-exempt）**となり、課金されることはありません。
* レント免除しきい値を**下回る**アカウントは、各エポックでレントが課金されます。残高がゼロになると、そのアカウントは削除（パージ）されます。

:::info
**ベストプラクティス：** 予期しないアカウント削除を避けるため、データアカウントには常にレント免除の最小額を上回る資金を入金してください。
:::

---

## コンピュートバジェット

各命令の実行はコンピュートユニット（compute units）で計測されます。

| パラメータ                                | 値       |
| ---------------------------------------- | ----------- |
| 命令あたりの最大コンピュートユニット        | `1,400,000` |
| 最大CPI（クロスプログラム呼び出し）深度 | `4`         |
| 最大プログラムサイズ                         | `10 MB`     |
| 最大アカウントデータサイズ                    | `10 MB`     |

コンピュートバジェットを超過したプログラムは停止され、トランザクションはリバートされます。

---

## パラメータ一覧

| パラメータ                   | 値        |
| --------------------------- | ------------ |
| `max_program_size`          | 10 MB        |
| `max_account_data_size`     | 10 MB        |
| `compute_budget_max`        | 1,400,000 CU |
| `max_cpi_depth`             | 4            |
| `lamports_per_byte_year`    | 3,480        |
| `rent_exemption_multiplier` | 2.0          |
| JSON-RPCポート               | 8899         |

---

## クロスVM相互運用性

SVMプログラムは、**非同期**のクロスVMメッセージパスを通じて、EVMおよびCosmWasmコントラクトと通信できます。

```bash
# Cross-VM call example
qorechaind tx crossvm call \
  --source-vm svm \
  --target-vm evm \
  --target-contract 0x1234...abcd \
  --payload '...' \
  --from mykey \
  -y
```

メッセージはキューに入れられ、EndBlockerによって処理されます。メッセージのライフサイクルとタイムアウト動作の詳細については、[クロスVM相互運用性](/developer-guide/cross-vm-interoperability)を参照してください。

---

## 次のステップ

* [クロスVM相互運用性](/developer-guide/cross-vm-interoperability) — SVM、EVM、CosmWasm間の通信
* [EVM開発](/developer-guide/evm-development) — QoreChain上のSolidityスマートコントラクト
* [CosmWasm開発](/developer-guide/cosmwasm-development) — RustベースのWebAssemblyコントラクト
