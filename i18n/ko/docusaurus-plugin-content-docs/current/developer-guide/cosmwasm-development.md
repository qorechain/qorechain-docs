---
slug: /developer-guide/cosmwasm-development
title: CosmWasm 개발
sidebar_label: CosmWasm 개발
sidebar_position: 3
---

# CosmWasm 개발

QoreChain은 **CosmWasm** 스마트 컨트랙트를 지원하여, 개발자가 WebAssembly로 컴파일되는 안전하고 샌드박스화된 프로그램을 Rust로 작성할 수 있게 합니다. CosmWasm 컨트랙트는 QoreChain의 트리플 VM 아키텍처 내에서 EVM 및 SVM 프로그램과 함께 실행됩니다.

:::note
아래 명령은 2026년 6월 7일부터 운영 중이며 체인 버전 **v3.1.80**을 실행하는 **`qorechain-vladi`** 메인넷을 사용합니다. 테스트넷의 경우 `--chain-id qorechain-diana`로 대체하세요.
:::

---

## 사전 요구 사항

| 의존성                 | 버전       | 용도                        |
| -------------------------- | ------------- | ------------------------------ |
| **Rust**                   | 최신 안정 버전 | 컨트랙트 컴파일           |
| **wasm32-unknown-unknown** | target        | WebAssembly 컴파일 타깃 |
| **cargo-generate**         | 최신        | 프로젝트 스캐폴딩            |
| **cosmwasm-std**           | 1.5+          | CosmWasm 표준 라이브러리      |

Wasm 타깃을 설치하세요:

```bash
rustup target add wasm32-unknown-unknown
```

---

## 컨트랙트 라이프사이클

CosmWasm 컨트랙트는 다섯 단계의 라이프사이클을 따릅니다: **빌드(Build)**, **저장(Store)**, **인스턴스화(Instantiate)**, **실행(Execute)**, **조회(Query)**.

1. **빌드** — 컨트랙트를 최적화된 WebAssembly로 컴파일합니다:

   ```bash
   cd my-contract

   # Standard build
   cargo build --release --target wasm32-unknown-unknown

   # Optimized build (recommended for deployment)
   docker run --rm -v "$(pwd)":/code \
     cosmwasm/rust-optimizer:0.15.0
   ```

   최적화된 `.wasm` 파일은 `artifacts/` 디렉터리에 생성됩니다.

2. **저장** — 컴파일된 컨트랙트를 체인에 업로드합니다:

   ```bash
   qorechaind tx wasm store contract.wasm \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   트랜잭션이 확정된 후, 저장된 코드 ID를 조회합니다:

   ```bash
   qorechaind query wasm list-code
   ```

3. **인스턴스화** — 저장된 코드 ID로부터 새 컨트랙트 인스턴스를 생성합니다:

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

   | 플래그                | 설명                                    |
   | ------------------- | ---------------------------------------------- |
   | `<code-id>`         | store 트랜잭션에서 반환된 숫자 ID |
   | `--label`           | 이 인스턴스에 대한 사람이 읽을 수 있는 레이블         |
   | `--no-admin`        | 관리자 주소 없음(컨트랙트가 불변)       |
   | `--admin <address>` | 컨트랙트를 마이그레이션할 수 있는 관리자 설정      |

   컨트랙트 주소를 검색합니다:

   ```bash
   qorechaind query wasm list-contracts-by-code <code-id>
   ```

4. **실행** — 상태를 변경하기 위해 컨트랙트의 execute 진입점을 호출합니다:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto \
     -y
   ```

   자금을 첨부하여 실행합니다:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     -y
   ```

5. **조회** — 트랜잭션을 제출하지 않고 컨트랙트 상태를 읽습니다:

   ```bash
   qorechaind query wasm contract-state smart <contract-addr> \
     '{"get_count": {}}'
   ```

   조회 응답은 JSON으로 반환됩니다.

---

## 유용한 조회

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

## 컨트랙트 구조

일반적인 CosmWasm 컨트랙트에는 세 개의 진입점이 있습니다:

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

## 크로스 VM 호출

CosmWasm 컨트랙트는 `x/crossvm` 모듈을 통해 EVM 및 SVM에 배포된 컨트랙트와 상호작용할 수 있습니다. CosmWasm으로부터의 크로스 VM 호출은 **비동기** 메시지 경로를 사용합니다:

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

메시지는 큐에 제출되고 다음 블록에서 EndBlocker에 의해 처리됩니다. 전체 메시지 라이프사이클은 [크로스 VM 상호운용성](/developer-guide/cross-vm-interoperability)을 참조하세요.

---

## 모듈 통합

CosmWasm 컨트랙트는 표준 메시지 전달을 통해 Cosmos SDK 모듈과 상호작용할 수 있습니다:

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

## 컨트랙트 마이그레이션

컨트랙트가 `--admin` 주소로 인스턴스화된 경우, 관리자는 이를 새 코드 ID로 마이그레이션할 수 있습니다:

```bash
qorechaind tx wasm migrate <contract-addr> <new-code-id> \
  '{"migrate_msg": {}}' \
  --from admin-key \
  -y
```

이는 기존 컨트랙트 상태와 함께 새 코드의 `migrate` 진입점을 호출합니다.

---

## 다음 단계

* [크로스 VM 상호운용성](/developer-guide/cross-vm-interoperability) — CosmWasm에서 EVM 및 SVM 컨트랙트 호출
* [SVM 개발](/developer-guide/svm-development) — QoreChain에 BPF 프로그램 배포
* [EVM 프리컴파일](/developer-guide/evm-precompiles) — Solidity에서 PQC 및 AI 기능 접근
