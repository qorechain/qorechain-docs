---
slug: /developer-guide/svm-development
title: SVM 開発
sidebar_label: SVM 開発
sidebar_position: 4
---

# SVM 開発

QoreChain には **Solana Virtual Machine (SVM)** 実行環境が含まれており、開発者は使い慣れた Solana ツールを使って SBF/BPF プログラムをデプロイおよび実行できます。SVM モジュールは **ポート 8899** で Solana 互換の JSON-RPC インターフェースを公開しており、`qorechaind start` がこれを自動的に起動します（下記の [JSON-RPC サーバー](#json-rpc-server) を参照）。

:::note
以下のコマンドは、2026 年 6 月 7 日からチェーンバージョン **v3.1.77** で稼働している **`qorechain-vladi`** メインネットを使用します。テストネットの場合は `--chain-id qorechain-diana` に置き換えてください。
:::

---

## 概要

`x/svm` モジュールは以下を提供します。

* SBF/BPF プログラムのデプロイと実行
* データアカウントの作成と管理
* Solana 互換の JSON-RPC エンドポイント
* QoreChain と Solana のアドレス形式間の双方向アドレスマッピング
* コンピュートバジェットの計測とレントベースのストレージ経済

---

## JSON-RPC サーバー {#json-rpc-server}

Solana 互換の JSON-RPC サーバーは **`qorechaind start` によって起動され**、**デフォルトで有効** になっています。これは `app.toml` 内の `[svm-rpc]` セクションで設定します。

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

デフォルトは `enable = true` および `address = "127.0.0.1:8899"` であるため、新しく起動したノードはすでにポート 8899 で Solana JSON-RPC インターフェースを提供しています。`@solana/web3.js` は追加設定なしで `http://127.0.0.1:8899` に接続できます。`getVersion` は `1.18.0-qorechain` を報告し、`getBalance` / `getAccountInfo` はライブのオンチェーン SVM アカウントを返します。

| プロパティ      | 値                        |
| ------------- | ------------------------- |
| デフォルト URL   | `http://127.0.0.1:8899`   |
| 有効           | はい、デフォルトで有効      |
| 起動元          | `qorechaind start`        |
| 互換性          | Solana JSON-RPC（サブセット） |
| `getVersion`  | `1.18.0-qorechain`        |

### サポートされるメソッド

| メソッド                              | 説明                                       |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | アカウントデータと lamport 残高を取得         |
| `getBalance`                        | アカウント残高を lamport 単位で取得           |
| `getSlot`                           | 現在のスロット番号                            |
| `getMinimumBalanceForRentExemption` | 指定したデータサイズに必要な最小残高           |
| `getVersion`                        | SVM ランタイムのバージョン情報                |
| `getHealth`                         | SVM エンドポイントのヘルスチェック            |

---

## プログラムのデプロイと操作

:::info
**最新の SBF 実行。** SVM 実行エンジンは **solana-sbpf 0.21.1** 上に刷新されたため、現在の Solana ツールチェーン（**platform-tools v1.53 / agave 4.x**）で新しくコンパイルされた SBF プログラムは、QoreChain 上で **デプロイと実行の両方** が可能です。実行は完全にサポートされており、デプロイ専用ではありません。`cargo build-sbf --arch v0` または `--arch v3` のいずれかでビルドされたプログラムがサポートされます。
:::

1. **SBF プログラムのデプロイ** — Solana プログラムを現在の platform-tools（v1.53 / agave 4.x）で SBF 共有オブジェクトにコンパイルし、QoreChain にデプロイします。

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

   トランザクションのレスポンスには、base58 形式の **プログラム ID** が含まれます。

2. **命令の実行** — オンチェーンの BPF プログラムを命令データとともに呼び出します。

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | パラメータ           | 形式               | 説明                            |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | Base58 文字列      | デプロイされたプログラムのアドレス  |
   | `data-hex`          | 16 進エンコードバイト | シリアライズされた命令データ      |

3. **データアカウントの作成** — プログラムは状態を保存するためにアカウントを必要とすることがよくあります。サイズと所有者を指定して作成します。

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | パラメータ      | 説明                                                |
   | -------------- | -------------------------------------------------- |
   | `owner-base58` | このアカウントを所有するプログラム（base58）          |
   | `space`        | データフィールドのサイズ（バイト単位）                |
   | `lamports`     | 初期残高（レント免除の最小値を満たす必要があります）   |

   指定したサイズに対するレント免除の最小残高を照会します。

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

4. **@solana/web3.js の使用** — Solana JavaScript SDK は QoreChain の SVM エンドポイントと直接動作します。

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

QoreChain は、ネイティブの Bech32 アドレス（`qor1...`）と Solana スタイルの base58 アドレスの間で **双方向アドレスマッピング** を維持します。

| 方向          | 例                                                          |
| ------------- | ---------------------------------------------------------- |
| ネイティブから SVM | `qor1abc...xyz` は決定論的な base58 アドレスにマッピングされる |
| SVM からネイティブ | base58 プログラムアドレスは `qor1...` 相当にマッピングし直される |

このマッピングは決定論的であり、`x/svm` モジュールによって管理されます。両方の表現は同じ基礎となるアカウントを指します。

---

## レントモデル

SVM モジュールは、状態の肥大化を防ぐために **レントベースのストレージモデル** を使用します。

| パラメータ                  | 値          |
| -------------------------- | ---------- |
| 年間バイトあたりの lamport     | `3,480`    |
| レント免除の乗数              | `2.0`      |
| 徴収頻度                     | エポックごと  |

* lamport 単位で `2 * (data_size * 3480 / seconds_per_year)` **を超える** 残高を持つアカウントは **レント免除** され、課金されることはありません。
* レント免除のしきい値 **を下回る** アカウントは、エポックごとにレントが課金されます。残高がゼロになると、アカウントは削除されます。

:::info
**ベストプラクティス:** 予期しないアカウントの削除を避けるため、データアカウントには常にレント免除の最小値を超える資金を入れておいてください。
:::

---

## コンピュートバジェット

各命令の実行はコンピュートユニットで計測されます。

| パラメータ                                | 値           |
| ---------------------------------------- | ----------- |
| 命令あたりの最大コンピュートユニット          | `1,400,000` |
| 最大 CPI（クロスプログラム呼び出し）の深さ    | `4`         |
| 最大プログラムサイズ                        | `10 MB`     |
| 最大アカウントデータサイズ                   | `10 MB`     |

コンピュートバジェットを超過したプログラムは停止され、トランザクションは元に戻されます。

---

## パラメータ概要

| パラメータ                   | 値           |
| --------------------------- | ------------ |
| `max_program_size`          | 10 MB        |
| `max_account_data_size`     | 10 MB        |
| `compute_budget_max`        | 1,400,000 CU |
| `max_cpi_depth`             | 4            |
| `lamports_per_byte_year`    | 3,480        |
| `rent_exemption_multiplier` | 2.0          |
| JSON-RPC ポート               | 8899         |

---

## クロス VM 相互運用性

SVM プログラムは、**非同期** クロス VM メッセージパスを通じて EVM および CosmWasm コントラクトと通信できます。

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

メッセージはキューに入れられ、EndBlocker によって処理されます。メッセージのライフサイクルとタイムアウト動作の詳細については、[クロス VM 相互運用性](/developer-guide/cross-vm-interoperability) を参照してください。

---

## 次のステップ

* [クロス VM 相互運用性](/developer-guide/cross-vm-interoperability) — SVM、EVM、CosmWasm 間の通信
* [EVM 開発](/developer-guide/evm-development) — QoreChain 上の Solidity スマートコントラクト
* [CosmWasm 開発](/developer-guide/cosmwasm-development) — Rust ベースの WebAssembly コントラクト
