---
slug: /developer-guide/cosmwasm-development
title: CosmWasm 개발
sidebar_label: CosmWasm 개발
sidebar_position: 3
---

# CosmWasm 개발

QoreChain은 **CosmWasm** 스마트 컨트랙트를 지원하여, 개발자가 WebAssembly로 컴파일되는 안전하고 샌드박스화된 프로그램을 Rust로 작성할 수 있게 합니다. CosmWasm 컨트랙트는 QoreChain의 트리플 VM 아키텍처 내에서 EVM 및 SVM 프로그램과 함께 실행됩니다.

:::note
아래 명령은 2026년 6월 7일부터 운영 중이며 노드 릴리스 **v3.2.3**을 실행하는 **`qorechain-vladi`** 메인넷을 사용합니다. 테스트넷(v3.2.4 실행, 테스트넷 전용)의 경우 `--chain-id qorechain-diana`로 대체하세요.
:::

:::caution 코드 업로드 및 인스턴스화에는 현재 명시적 권한이 필요합니다
이 글 작성 시점 기준, `code_upload_access`와 `instantiate_default_permission`은 **메인넷과 테스트넷 모두**에서 **`Nobody`**로 설정되어 있습니다. 즉, 업계 전반의 CosmWasm 보안 권고에 따라 `MsgStoreCode`와 `MsgInstantiateContract`는 기본적으로 임의의 계정에 열려 있지 않습니다. 아래 단계가 성공하려면 거버넌스를 통해 계정(또는 특정 주소 목록)에 업로드/인스턴스화 권한을 부여받아야 합니다. 이는 거버넌스가 변경할 수 있는 종류의 설정이므로 먼저 실시간 파라미터를 확인하세요(현재 메인넷에는 저장된 컨트랙트 코드가 전혀 없습니다):

```bash
qorechaind query wasm params
# or: curl -s https://api.qore.host/cosmwasm/wasm/v1/codes/params  (substitute api-testnet.qore.host for testnet)
```

`MsgStoreCode`, `MsgInstantiateContract`, `MsgInstantiateContract2` 메시지 유형도 두 네트워크 모두에서 체인의 서킷 브레이커에 의해 꺼져 있으므로(`qorechaind query circuit disabled-list`), 권한만 올려서는 이 항목들이 해제되기 전까지 충분하지 않습니다.

이 제한은 이미 인스턴스화된 컨트랙트에는 영향을 주지 않습니다. 기존 컨트랙트에 대한 `execute`와 `query`는 이 설정과 무관하게 정상적으로 작동합니다.
:::

:::caution `tx pqc cosign`으로 서명하세요
메인넷과 테스트넷은 모든 Cosmos 레인 트랜잭션에 하이브리드 양자 내성 서명을 요구하므로, 이 페이지의 `tx` 명령은 그대로는 브로드캐스트되지 않습니다. 이 명령들은 `--generate-only > tx.json`으로 트랜잭션을 구성합니다. 그런 다음 `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`로 서명하고 브로드캐스트하세요(서명기는 [다운로드 매니페스트](/developer-guide/running-a-node#fetch-the-manifest)의 릴리스 바이너리에 포함되어 있으며, 공개 소스에서 빌드한 바이너리에는 없습니다). 네트워크 수수료 하한은 **가스 단위당 0.1 uqor**이며, `--gas-prices 0.1uqor`가 이를 나타냅니다. 하이브리드 서명은 시뮬레이션에 포함되지 않는 약 47,000 가스를 추가하므로 `1.5` 조정값을 사용합니다. [양자 내성 서명](/developer-guide/post-quantum-signing)을 참조하세요.
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
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   트랜잭션이 확정된 후(위에서 설명한 대로 `tx pqc cosign`으로 `tx.json`에 서명하고 브로드캐스트), 저장된 코드 ID를 조회합니다:

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
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   | 플래그                | 설명                                    |
   | ------------------- | ---------------------------------------------- |
   | `<code-id>`         | store 트랜잭션에서 반환된 숫자 ID |
   | `--label`           | 이 인스턴스에 대한 사람이 읽을 수 있는 레이블         |
   | `--no-admin`        | 관리자 주소 없음(컨트랙트가 불변)       |
   | `--admin <address>` | 컨트랙트를 마이그레이션할 수 있는 관리자 설정      |

   컨트랙트 주소를 검색합니다:

   ```bash
   qorechaind query wasm list-contract-by-code <code-id>
   ```

4. **실행** — 상태를 변경하기 위해 컨트랙트의 execute 진입점을 호출합니다:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   자금을 첨부하여 실행합니다:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
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

크로스 VM 호출은 `x/crossvm` 모듈을 통해 `MsgCrossVMCall` 트랜잭션으로 전송됩니다. 메시지 라이프사이클은 [크로스 VM 상호운용성](/developer-guide/cross-vm-interoperability)을 참조하세요. CosmWasm 컨트랙트에는 크로스 VM 호출을 시작하기 위한 전용 컨트랙트 측 바인딩이 없으므로(컨트랙트가 내보낼 수 있는 커스텀 `QoreChainMsg` 메시지가 없음), 컨트랙트는 자신의 `execute` 진입점 내부에서 EVM 또는 SVM 컨트랙트를 호출할 수 없습니다. v3.2.3부터는 호출자 자신의 레인으로 향하는 호출이 거부되며, 실패한 대기열 호출은 부작용을 남기지 않습니다.

:::caution 크로스 VM 호출은 현재 메인넷에서 꺼져 있습니다
`MsgCrossVMCall`은 메인넷의 서킷 브레이커 목록(`qorechaind query circuit disabled-list`)에 올라 있고 SVM 레인은 두 네트워크 모두에서 비활성화되어 있으므로, 현재 크로스 VM 경로는 일반 트랜잭션에 사용할 수 없습니다.
:::

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
  --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
  --generate-only > tx.json
```

이는 기존 컨트랙트 상태와 함께 새 코드의 `migrate` 진입점을 호출합니다.

---

## 다음 단계

* [크로스 VM 상호운용성](/developer-guide/cross-vm-interoperability) — CosmWasm에서 EVM 및 SVM 컨트랙트 호출
* [SVM 개발](/developer-guide/svm-development) — QoreChain에 BPF 프로그램 배포
* [EVM 프리컴파일](/developer-guide/evm-precompiles) — 계획된 Solidity 프리컴파일 참조(아직 활성화된 것은 없음)
