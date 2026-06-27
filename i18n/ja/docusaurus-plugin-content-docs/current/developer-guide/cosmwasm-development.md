---
slug: /developer-guide/cosmwasm-development
title: CosmWasm 開発
sidebar_label: CosmWasm 開発
sidebar_position: 3
---

# CosmWasm 開発

QoreChain は **CosmWasm** スマートコントラクトをサポートしており、開発者は WebAssembly にコンパイルされる、安全でサンドボックス化されたプログラムを Rust で記述できます。CosmWasm コントラクトは、QoreChain のトリプル VM アーキテクチャ内で EVM および SVM プログラムと並行して実行されます。

:::note
以下のコマンドは、2026 年 6 月 7 日より稼働しチェーンバージョン **v3.1.77** を実行している **`qorechain-vladi`** メインネットを使用します。テストネットの場合は `--chain-id qorechain-diana` に置き換えてください。
:::

---

## 前提条件

| 依存関係                 | バージョン       | 目的                        |
| -------------------------- | ------------- | ------------------------------ |
| **Rust**                   | 最新の安定版 | コントラクトのコンパイル           |
| **wasm32-unknown-unknown** | target        | WebAssembly コンパイルターゲット |
| **cargo-generate**         | 最新        | プロジェクトのスキャフォールディング            |
| **cosmwasm-std**           | 1.5+          | CosmWasm 標準ライブラリ      |

Wasm ターゲットをインストールします。

```bash
rustup target add wasm32-unknown-unknown
```

---

## コントラクトのライフサイクル

CosmWasm コントラクトは、**ビルド**、**ストア**、**インスタンス化**、**実行**、**照会**という 5 つのステップのライフサイクルに従います。

1. **ビルド** — コントラクトを最適化された WebAssembly にコンパイルします。

   ```bash
   cd my-contract

   # Standard build
   cargo build --release --target wasm32-unknown-unknown

   # Optimized build (recommended for deployment)
   docker run --rm -v "$(pwd)":/code \
     cosmwasm/rust-optimizer:0.15.0
   ```

   最適化された `.wasm` ファイルは `artifacts/` ディレクトリに格納されます。

2. **ストア** — コンパイルしたコントラクトをチェーンにアップロードします。

   ```bash
   qorechaind tx wasm store contract.wasm \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   トランザクションが確定したら、保存されたコード ID を照会します。

   ```bash
   qorechaind query wasm list-code
   ```

3. **インスタンス化** — 保存されたコード ID から新しいコントラクトインスタンスを作成します。

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
   | `<code-id>`         | ストアトランザクションから返された数値 ID |
   | `--label`           | このインスタンスの人間が読めるラベル         |
   | `--no-admin`        | 管理者アドレスなし（コントラクトは変更不可）       |
   | `--admin <address>` | コントラクトをマイグレートできる管理者を設定      |

   コントラクトアドレスを取得します。

   ```bash
   qorechaind query wasm list-contracts-by-code <code-id>
   ```

4. **実行** — コントラクトの実行エントリポイントを呼び出して状態を変更します。

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto \
     -y
   ```

   資金を添えて実行する場合:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     -y
   ```

5. **照会** — トランザクションを送信せずにコントラクトの状態を読み取ります。

   ```bash
   qorechaind query wasm contract-state smart <contract-addr> \
     '{"get_count": {}}'
   ```

   照会のレスポンスは JSON として返されます。

---

## 便利な照会

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

## コントラクトの構造

典型的な CosmWasm コントラクトには 3 つのエントリポイントがあります。

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

## クロス VM 呼び出し

CosmWasm コントラクトは、`x/crossvm` モジュールを通じて EVM および SVM 上にデプロイされたコントラクトとやり取りできます。CosmWasm からのクロス VM 呼び出しは**非同期**メッセージパスを使用します。

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

メッセージはキューに送信され、次のブロックの EndBlocker で処理されます。メッセージの完全なライフサイクルについては、[クロス VM 相互運用性](/developer-guide/cross-vm-interoperability)を参照してください。

---

## モジュール統合

CosmWasm コントラクトは、標準的なメッセージパッシングを通じて Cosmos SDK モジュールとやり取りできます。

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

## コントラクトのマイグレーション

コントラクトが `--admin` アドレスを指定してインスタンス化された場合、管理者はそれを新しいコード ID にマイグレートできます。

```bash
qorechaind tx wasm migrate <contract-addr> <new-code-id> \
  '{"migrate_msg": {}}' \
  --from admin-key \
  -y
```

これは、既存のコントラクト状態を用いて新しいコードの `migrate` エントリポイントを呼び出します。

---

## 次のステップ

* [クロス VM 相互運用性](/developer-guide/cross-vm-interoperability) — CosmWasm から EVM および SVM コントラクトを呼び出す
* [SVM 開発](/developer-guide/svm-development) — QoreChain への BPF プログラムのデプロイ
* [EVM プリコンパイル](/developer-guide/evm-precompiles) — Solidity から PQC および AI 機能にアクセスする
