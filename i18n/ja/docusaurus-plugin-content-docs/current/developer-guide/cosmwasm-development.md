---
slug: /developer-guide/cosmwasm-development
title: CosmWasm開発
sidebar_label: CosmWasm開発
sidebar_position: 3
---

# CosmWasm開発

QoreChainは**CosmWasm**スマートコントラクトをサポートしており、開発者はRustで安全かつサンドボックス化されたプログラムを記述し、WebAssemblyへコンパイルできます。CosmWasmコントラクトは、QoreChainのトリプルVMアーキテクチャの中でEVMおよびSVMプログラムと並行して実行されます。

:::note
以下のコマンドは、2026年6月29日から稼働しているメインネット**`qorechain-vladi`**（ノードリリース**v3.2.1**）を対象としています。テストネット（v3.2.2）の場合は `--chain-id qorechain-diana` に置き換えてください。
:::

:::caution コードのアップロードとインスタンス化には現在、明示的な権限が必要です
本稿執筆時点で、`code_upload_access` と `instantiate_default_permission` はメインネットとテストネットの**両方**で**`Nobody`**に設定されています。つまり、業界全体のCosmWasmセキュリティ勧告に従い、`MsgStoreCode` と `MsgInstantiateContract` はデフォルトでは任意のアカウントに開放されていません。以下の手順を成功させるには、事前にガバナンスによってアカウント（または特定のアドレスリスト）にアップロード/インスタンス化の権限を付与してもらう必要があります。これはまさにガバナンスによって変更され得る種類の設定であるため、まず現行のパラメータを確認してください（メインネットには現在、保存済みのコントラクトコードが一切ありません）。

```bash
qorechaind query wasm params
# or: curl -s https://api.qore.host/cosmwasm/wasm/v1/codes/params  (substitute api-testnet.qore.host for testnet)
```

`MsgStoreCode`、`MsgInstantiateContract`、`MsgInstantiateContract2` の各メッセージタイプも、両ネットワークでチェーンのサーキットブレーカーによって無効化されています（`qorechaind query circuit disabled-list`）。そのため、権限を引き上げるだけでは足りず、これらのエントリが解除されるまで実行できません。

この制限は、既にインスタンス化済みのコントラクトには影響しません — 既存のコントラクトに対する `execute` と `query` は、この設定にかかわらず通常どおり動作します。
:::

:::caution `tx pqc cosign` で署名します
メインネットとテストネットでは、Cosmosレーンのすべてのトランザクションにハイブリッドのポスト量子署名が必要です。そのため、このページの `tx` コマンドは記載のままではブロードキャストされません。これらは `--generate-only > tx.json` でトランザクションを構築します。その後、`qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>` で署名してブロードキャストしてください（[ダウンロードマニフェスト](/developer-guide/running-a-node#fetch-the-manifest)のリリースバイナリには署名機能が含まれていますが、公開ソースからのビルドには含まれていません）。ネットワークの手数料下限は**ガス1単位あたり0.1 uqor**で、これが `--gas-prices 0.1uqor` の意味です。ハイブリッド署名はシミュレーションに含まれない約47,000ガスを追加するため、`1.5` の調整を行っています。[ポスト量子署名](/developer-guide/post-quantum-signing)を参照してください。
:::

---

## 前提条件

| 依存関係                      | バージョン         | 用途                            |
| -------------------------- | ------------- | ------------------------------ |
| **Rust**                   | 最新の安定版 | コントラクトのコンパイル           |
| **wasm32-unknown-unknown** | ターゲット        | WebAssemblyコンパイルターゲット |
| **cargo-generate**         | 最新版          | プロジェクトの雛形生成            |
| **cosmwasm-std**           | 1.5以上          | CosmWasm標準ライブラリ      |

Wasmターゲットをインストールします。

```bash
rustup target add wasm32-unknown-unknown
```

---

## コントラクトのライフサイクル

CosmWasmコントラクトは、**Build（ビルド）**、**Store（保存）**、**Instantiate（インスタンス化）**、**Execute（実行）**、**Query（クエリ）**という5段階のライフサイクルに従います。

1. **Build** — コントラクトを最適化されたWebAssemblyにコンパイルします。

   ```bash
   cd my-contract

   # Standard build
   cargo build --release --target wasm32-unknown-unknown

   # Optimized build (recommended for deployment)
   docker run --rm -v "$(pwd)":/code \
     cosmwasm/rust-optimizer:0.15.0
   ```

   最適化された `.wasm` ファイルは `artifacts/` ディレクトリに出力されます。

2. **Store** — コンパイル済みコントラクトをチェーンにアップロードします。

   ```bash
   qorechaind tx wasm store contract.wasm \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   トランザクションが確定したら（上記のとおり `tx pqc cosign` で `tx.json` に署名してブロードキャストします）、保存されたコードIDを照会します。

   ```bash
   qorechaind query wasm list-code
   ```

3. **Instantiate** — 保存済みのコードIDから新しいコントラクトインスタンスを作成します。

   ```bash
   qorechaind tx wasm instantiate <code-id> \
     '{"count": 0, "owner": "qor1..."}' \
     --label "my-counter-contract" \
     --from mykey \
     --no-admin \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   | フラグ                | 説明                                    |
   | ------------------- | ---------------------------------------------- |
   | `<code-id>`         | 保存トランザクションから返される数値ID |
   | `--label`           | このインスタンスの人間が読めるラベル         |
   | `--no-admin`        | 管理者アドレスなし（コントラクトは不変になります）       |
   | `--admin <address>` | コントラクトを移行できる管理者を設定します      |

   コントラクトアドレスを取得します。

   ```bash
   qorechaind query wasm list-contract-by-code <code-id>
   ```

4. **Execute** — コントラクトのexecuteエントリーポイントを呼び出し、状態を変更します。

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   資金を添付して実行します。

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

5. **Query** — トランザクションを送信せずにコントラクトの状態を読み取ります。

   ```bash
   qorechaind query wasm contract-state smart <contract-addr> \
     '{"get_count": {}}'
   ```

   クエリのレスポンスはJSONで返されます。

---

## よく使うクエリ

```bash
# List all stored code
qorechaind query wasm list-code

# List all instances of a specific code ID
qorechaind query wasm list-contract-by-code <code-id>

# Get contract info (code ID, admin, label)
qorechaind query wasm contract <contract-addr>

# Get raw contract state by key
qorechaind query wasm contract-state raw <contract-addr> <key-hex>

# Get full contract state (all keys)
qorechaind query wasm contract-state all <contract-addr>

# Get contract history (instantiate/migrate events)
qorechaind query wasm contract-history <contract-addr>
```

---

## コントラクト構造

典型的なCosmWasmコントラクトには、3つのエントリーポイントがあります。

```rust
use cosmwasm_std::{
    entry_point, Binary, Deps, DepsMut, Env, MessageInfo,
    Response, StdResult,
};

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    // Initialize contract state
    Ok(Response::new().add_attribute("method", "instantiate"))
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    // Handle state-changing operations
    Ok(Response::new().add_attribute("method", "execute"))
}

#[entry_point]
pub fn query(
    deps: Deps,
    _env: Env,
    msg: QueryMsg,
) -> StdResult<Binary> {
    // Handle read-only queries
    Ok(Binary::default())
}
```

---

## クロスVM呼び出し

クロスVM呼び出しは、`x/crossvm` モジュールを通じて `MsgCrossVMCall` トランザクションとして送信されます。メッセージのライフサイクルについては、[クロスVM相互運用性](/developer-guide/cross-vm-interoperability)を参照してください。現時点では、CosmWasmコントラクトにはクロスVM呼び出しを開始するためのコントラクト側のバインディングがありません（コントラクトが発行できるカスタムの `QoreChainMsg` メッセージは存在しません）。そのため、コントラクトは自身の `execute` エントリーポイントの内部からEVMまたはSVMのコントラクトを呼び出すことはできません。

:::caution クロスVM呼び出しは現在メインネットで無効化されています
`MsgCrossVMCall` はメインネットのサーキットブレーカーのリストに含まれており（`qorechaind query circuit disabled-list`）、SVMレーンも両ネットワークで無効化されています。そのため、現時点ではクロスVMのパスを通常のトランザクションで利用することはできません。
:::

---

## モジュール連携

CosmWasmコントラクトは、標準的なメッセージパッシングを通じてCosmos SDKモジュールと連携できます。

```rust
// Send native tokens via the bank module
let send_msg = BankMsg::Send {
    to_address: "qor1recipient...".to_string(),
    amount: vec![Coin {
        denom: "uqor".to_string(),
        amount: Uint128::new(1_000_000),
    }],
};

// Delegate to a validator via the staking module
let delegate_msg = StakingMsg::Delegate {
    validator: "qorvaloper1...".to_string(),
    amount: Coin {
        denom: "uqor".to_string(),
        amount: Uint128::new(1_000_000),
    },
};
```

---

## コントラクトの移行

コントラクトが `--admin` アドレス付きでインスタンス化されていた場合、管理者はそれを新しいコードIDに移行できます。

```bash
qorechaind tx wasm migrate <contract-addr> <new-code-id> \
  '{"migrate_msg": {}}' \
  --from admin-key \
  --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
  --generate-only > tx.json
```

これにより、既存のコントラクト状態を保持したまま、新しいコードの `migrate` エントリーポイントが呼び出されます。

---

## 次のステップ

* [クロスVM相互運用性](/developer-guide/cross-vm-interoperability) — CosmWasmからEVMおよびSVMコントラクトを呼び出す
* [SVM開発](/developer-guide/svm-development) — QoreChain上にBPFプログラムをデプロイする
* [EVMプリコンパイル](/developer-guide/evm-precompiles) — 計画中のSolidityプリコンパイルのリファレンス（現時点で有効なものはありません）
