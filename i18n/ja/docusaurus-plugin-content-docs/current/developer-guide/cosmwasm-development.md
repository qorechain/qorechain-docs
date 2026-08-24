---
slug: /developer-guide/cosmwasm-development
title: CosmWasm開発
sidebar_label: CosmWasm開発
sidebar_position: 3
---

# CosmWasm開発

QoreChainは**CosmWasm**スマートコントラクトをサポートしており、開発者はRustで安全かつサンドボックス化されたプログラムを記述し、WebAssemblyへコンパイルできます。CosmWasmコントラクトは、QoreChainのトリプルVMアーキテクチャの中でEVMおよびSVMプログラムと並行して実行されます。

:::note
以下のコマンドは、2026年6月7日から稼働しているメインネット**`qorechain-vladi`**（チェーンバージョン**v3.1.92**）を対象としています。テストネットの場合は `--chain-id qorechain-diana` に置き換えてください。
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

   最適化された `.wasm` ファイルは `artifacts/` ディレクトリに生成されます。

2. **Store** — コンパイル済みコントラクトをチェーンにアップロードします。

   ```bash
   qorechaind tx wasm store contract.wasm \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   トランザクションが確定した後、保存されたコードIDを照会します。

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
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   | フラグ                | 説明                                    |
   | ------------------- | ---------------------------------------------- |
   | `<code-id>`         | store トランザクションから返される数値ID |
   | `--label`           | このインスタンスの人間可読なラベル         |
   | `--no-admin`        | 管理者アドレスなし（コントラクトはイミュータブル）       |
   | `--admin <address>` | コントラクトの移行が可能な管理者を設定      |

   コントラクトアドレスを取得します。

   ```bash
   qorechaind query wasm list-contracts-by-code <code-id>
   ```

4. **Execute** — コントラクトのexecuteエントリーポイントを呼び出し、状態を変更します。

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto \
     -y
   ```

   資金を添えて実行する場合。

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     -y
   ```

5. **Query** — トランザクションを送信せずにコントラクトの状態を読み取ります。

   ```bash
   qorechaind query wasm contract-state smart <contract-addr> \
     '{"get_count": {}}'
   ```

   クエリの応答はJSONとして返されます。

---

## よく使うクエリ

```bash
# List all stored code
qorechaind query wasm list-code

# List all instances of a specific code ID
qorechaind query wasm list-contracts-by-code <code-id>

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

CosmWasmコントラクトは、`x/crossvm` モジュールを通じてEVMおよびSVM上にデプロイされたコントラクトと連携できます。CosmWasmからのクロスVM呼び出しは**非同期**メッセージパスを使用します。

```rust
use cosmwasm_std::{CosmosMsg, CustomMsg};

// Call an EVM contract from CosmWasm
let cross_vm_msg = CosmosMsg::Custom(QoreChainMsg::CrossVMCall {
    target_vm: "evm".to_string(),
    target_contract: "0x1234...abcd".to_string(),
    payload: hex::encode(abi_encoded_data),
    funds: vec![],
});

Ok(Response::new().add_message(cross_vm_msg))
```

メッセージはキューに送信され、次のブロックでEndBlockerによって処理されます。メッセージの完全なライフサイクルについては、[クロスVM相互運用性](/developer-guide/cross-vm-interoperability)を参照してください。

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
  -y
```

これにより、既存のコントラクト状態を保持したまま、新しいコードの `migrate` エントリーポイントが呼び出されます。

---

## 次のステップ

* [クロスVM相互運用性](/developer-guide/cross-vm-interoperability) — CosmWasmからEVMおよびSVMコントラクトを呼び出す
* [SVM開発](/developer-guide/svm-development) — QoreChain上にBPFプログラムをデプロイする
* [EVMプリコンパイル](/developer-guide/evm-precompiles) — SolidityからPQCおよびAI機能にアクセスする
