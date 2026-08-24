---
slug: /developer-guide/svm-development
title: SVM開発
sidebar_label: SVM開発
sidebar_position: 4
---

# SVM開発

QoreChainには**Solana Virtual Machine (SVM)**実行環境が組み込まれており、開発者は使い慣れたSolanaツールを使ってSBF/BPFプログラムをデプロイ・実行できます。SVMモジュールは**ポート8899**でSolana互換のJSON-RPCインターフェースを公開しており、これは`qorechaind start`によって自動的に起動されます(以下の[JSON-RPCサーバー](#json-rpc-server)を参照)。

:::note
以下のコマンドは、2026年6月7日から稼働しているチェインバージョン**v3.1.92**を実行中の**`qorechain-vladi`**メインネットを使用しています。テストネットの場合は`--chain-id qorechain-diana`に置き換えてください。
:::

---

:::caution SVMトランザクション送信は現在無効化されています
チェインバージョンv3.1.89(8月22日)以降、インシデントを受けて、SVM実行レーンはトランザクション送信についてネットワーク全体で**無効化**されています——`x/svm`宛に送信されるトランザクション(プログラムデプロイ、命令実行、アカウント作成、送金)はすべて`code 11, "SVM module is disabled"`を返します。これは自分自身のノードにもパブリックエンドポイントにも当てはまります。読み取り系のRPCメソッドは引き続き応答する場合がありますが、このレーンが再開されるまでは、実運用のSVM統合を構築したりリハーサルしたりしないでください。
:::

## 概要

`x/svm`モジュールは以下を提供します:

* **ネイティブQORをファーストクラスのSVMアセットとして** — アカウントの統合残高がlamports単位で参照できます
* SBF/BPFプログラムのデプロイと実行
* データアカウントの作成と管理
* Solana互換のJSON-RPCエンドポイント
* QoreChainとSolanaのアドレス形式間の双方向アドレスマッピング
* コンピュートバジェットの計測とレントベースのストレージ経済性

---

## SVMインターフェース上のネイティブQOR {#native-qor}

チェインバージョン**v3.1.82**以降、SVMインターフェースは独立したサンドボックス残高ではなく、ファーストクラスのネイティブQORインターフェースです。アカウントが持つ単一の統合残高——Cosmosインターフェースでは`uqor`として、EVMでは18桁小数のweiとして参照できるのと同じ資金——が、SVM側では**lamports**(9桁小数)として表示されます:

```
1 uqor = 1,000 lamports    ·    1 QOR = 1,000,000,000 lamports
```

* **`getBalance` / `getAccountInfo`** はアカウントのネイティブQOR残高(lamports単位)を返します。
* **`getSignaturesForAddress`** は、あるアドレスに関わるトランザクション履歴を返します——標準的なSolanaツールによる入金検知に利用できます。
* **System Programによる送金はネイティブQORを移動します** — Solanaスタイルの送金命令は、Cosmosの`MsgSend`やEVMの送金と同じ資金を移動させます。
* **SVMアドレス形式** — アカウントのSVMアドレスは、20バイトのアカウントバイト列を32バイトになるよう右側にパディングし、base58エンコードしたものです。3つのアドレス形式(`qor1...`、`0x...`、base58)はすべて同じアカウントを指します。

パブリックエンドポイント(`https://svm.qore.host`、`https://svm-testnet.qore.host`)は**読み取り専用**です——トランザクション送信はエッジ側で無効化されています。通常であれば、SVMトランザクションを送信するために自分自身のノード(ポート8899)を運用しますが、上記の注意事項のとおり、`x/svm`のトランザクションレーン自体が現在、自分自身のノードを含むネットワーク全体で無効化されています。

---

## JSON-RPCサーバー {#json-rpc-server}

Solana互換のJSON-RPCサーバーは**`qorechaind start`によって起動**され、**デフォルトで有効**になっています。`app.toml`内の`[svm-rpc]`セクションで設定します:

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

デフォルトは`enable = true`、`address = "127.0.0.1:8899"`なので、起動したばかりのノードはすでにポート8899でSolana JSON-RPCインターフェースを提供しています——`@solana/web3.js`は追加設定なしで`http://127.0.0.1:8899`に接続できます。`getVersion`は`1.18.0-qorechain`を返し、`getBalance` / `getAccountInfo`はオンチェーンの実際のSVMアカウントを返します。

| プロパティ    | 値                        |
| ------------- | ------------------------- |
| デフォルトURL | `http://127.0.0.1:8899`   |
| 有効化        | デフォルトで有効           |
| 起動元        | `qorechaind start`        |
| 互換性        | Solana JSON-RPC(サブセット）|
| `getVersion`  | `1.18.0-qorechain`        |

### サポートされているメソッド

| メソッド                            | 説明                                       |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | アカウントデータとlamport残高を取得        |
| `getBalance`                        | アカウント残高をlamports単位(ネイティブQOR)で取得 |
| `getSignaturesForAddress`           | あるアドレスのトランザクション履歴         |
| `getSlot`                           | 現在のスロット番号                         |
| `getMinimumBalanceForRentExemption` | 指定したデータサイズに対する最低残高       |
| `getVersion`                        | SVMランタイムのバージョン情報              |
| `getHealth`                         | SVMエンドポイントのヘルスチェック          |

---

## プログラムのデプロイと操作

:::info
**最新のSBF実行。** SVM実行エンジンは**solana-sbpf 0.21.1**へと刷新されており、現行のSolanaツールチェーン(**platform-tools v1.53 / agave 4.x**)でコンパイルされたばかりのSBFプログラムは、QoreChain上で**デプロイと実行の両方**が可能です——実行はデプロイのみでなく完全にサポートされています。`cargo build-sbf --arch v0`または`--arch v3`のいずれでビルドしたプログラムもサポートされます。
:::

1. **SBFプログラムをデプロイする** — 現行のplatform-tools(v1.53 / agave 4.x)を使ってSolanaプログラムをSBF共有オブジェクトにコンパイルし、QoreChainにデプロイします:

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

2. **命令を実行する** — 命令データを指定してオンチェーンのBPFプログラムを呼び出します:

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | パラメータ           | 形式               | 説明                            |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | Base58文字列        | デプロイ済みプログラムのアドレス   |
   | `data-hex`          | 16進エンコードされたバイト列 | シリアライズされた命令データ  |

3. **データアカウントを作成する** — プログラムは状態を保存するためにアカウントを必要とすることがよくあります。サイズとオーナーを指定してアカウントを作成します:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | パラメータ      | 説明                                                |
   | -------------- | -------------------------------------------------- |
   | `owner-base58` | このアカウントを所有するプログラム(base58)          |
   | `space`        | データフィールドのサイズ(バイト単位)                 |
   | `lamports`     | 初期残高(レント免除の最低額を満たす必要があります)    |

   指定サイズに対するレント免除の最低残高を照会します:

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

4. **@solana/web3.jsを使う** — Solana JavaScript SDKは、QoreChainのSVMエンドポイントに対してそのまま動作します:

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

QoreChainは、ネイティブBech32アドレス(`qor1...`)とSolanaスタイルのbase58アドレスとの間で**双方向のアドレスマッピング**を維持しています:

| 方向             | 例                                                        |
| ---------------- | ---------------------------------------------------------- |
| ネイティブ → SVM  | `qor1abc...xyz`は決定論的なbase58アドレスにマッピングされます |
| SVM → ネイティブ  | base58形式のプログラムアドレスは対応する`qor1...`に逆マッピングされます |

このマッピングは決定論的であり、`x/svm`モジュールによって管理されます。両方の表現は、同一の基盤となるアカウントを指します。

---

## レントモデル

SVMモジュールは、状態の肥大化を防ぐために**レントベースのストレージモデル**を採用しています:

| パラメータ                  | 値         |
| -------------------------- | ---------- |
| 1バイトあたり年間lamports    | `3,480`    |
| レント免除乗数               | `2.0`      |
| 徴収頻度                    | 各エポック  |

* 残高が`2 * (data_size * 3480 / seconds_per_year)`(lamports単位)を**上回る**アカウントは**レント免除**となり、決して課金されません。
* レント免除しきい値を**下回る**アカウントは、各エポックでレントが課金されます。残高がゼロに達すると、そのアカウントは削除されます。

:::info
**ベストプラクティス:** 予期しないアカウント削除を避けるため、データアカウントには常にレント免除の最低額を上回る資金を入れておいてください。
:::

---

## コンピュートバジェット

各命令の実行は、コンピュートユニットで計測されます:

| パラメータ                                | 値          |
| ---------------------------------------- | ----------- |
| 命令あたりの最大コンピュートユニット         | `1,400,000` |
| 最大CPI(クロスプログラム呼び出し)深度      | `4`         |
| 最大プログラムサイズ                       | `10 MB`     |
| 最大アカウントデータサイズ                  | `10 MB`     |

コンピュートバジェットを超過したプログラムは停止され、トランザクションはリバートされます。

---

## パラメータまとめ

| パラメータ                    | 値           |
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

SVMプログラムは、**非同期**のクロスVMメッセージパスを通じてEVMおよびCosmWasmコントラクトと通信できます:

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

メッセージはキューに入れられ、EndBlockerによって処理されます。メッセージのライフサイクルとタイムアウトの挙動の詳細については、[クロスVM相互運用性](/developer-guide/cross-vm-interoperability)を参照してください。

---

## 次のステップ

* [クロスVM相互運用性](/developer-guide/cross-vm-interoperability) — SVM、EVM、CosmWasm間の通信
* [EVM開発](/developer-guide/evm-development) — QoreChain上のSolidityスマートコントラクト
* [CosmWasm開発](/developer-guide/cosmwasm-development) — Rustベースのwasmコントラクト
