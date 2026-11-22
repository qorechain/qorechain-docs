---
slug: /developer-guide/svm-testnet-v329
title: "테스트넷의 SVM: 프로그램 배포와 Solana 트랜잭션 전송 (v3.2.9)"
sidebar_label: SVM 테스트넷 (v3.2.9)
sidebar_position: 11
---

# 테스트넷의 SVM: 프로그램 배포와 Solana 트랜잭션 전송 (v3.2.9)

릴리스 **v3.2.9**는 표준 Solana 명령줄이 QoreChain과 통신하도록 합니다. 테스트넷을 상대로 `solana transfer`, `solana program deploy`, `anchor deploy`, web3.js 스크립트를 실행할 수 있으며, 체인이 모든 Solana 서명을 직접 검증합니다. Solana 키는 혼자서는 QoreChain 계정을 건드릴 수 없습니다. 먼저 **포스트 퀀텀 키**로 서명한 트랜잭션으로 작고 제한된 **인가 윈도우**를 열어야 하며, Solana 키가 자신의 서명으로 그 키를 보유하고 있음을 증명할 때에만 윈도우가 받아들여집니다. 윈도우가 끝나면 그 키는 다시 평범한 Solana 계정이 됩니다.

이 페이지는 개발자를 빈 컴퓨터에서 시작해 테스트넷에 프로그램을 배포하고 호출하는 데까지 안내합니다. 새로운 점, 도구, 키 증명을 직접 만드는 방법, 윈도우 열기와 닫기, 배포자 키 충전, `solana` 또는 `anchor`로 배포, 프로그램 호출, 결과 읽기, 그리고 실제 오류 문구 표를 다룹니다.

:::note 테스트넷 전용, 2026년 11월 22일에 확인
여기서 설명하는 모든 것은 2026년 11월 20일부터 v3.2.9를 실행 중인 **`qorechain-diana`** 테스트넷(거버넌스 제안 39, 높이 10,424,000)에서 동작합니다. Solana 호환(SVM) 레인은 거버넌스 제안 37 이후 그곳에서 열려 있습니다. **메인넷에서는 아무것도 동작하지 않습니다.** `qorechain-vladi`에서는 SVM 레인이 꺼져 있고, 크로스 VM 호출은 일시 중지된 상태이며, CosmWasm 컨트랙트 업로드는 거버넌스 전용입니다. 테스트넷만을 대상으로 빌드하세요. 테스트 QOR에는 가치가 없습니다. 일회용 키를 사용하세요.

이 페이지의 읽기 호출, 수수료 견적, 논스 경로, 키 증명 예시는 2026년 11월 22일에 실제 테스트넷에서 실행했습니다. 전체 흐름(윈도우, 충전, 배포, 호출, 업그레이드, 닫기)은 릴리스 전에 수정하지 않은 `solana-cli` 4.0.2와 `anchor-cli` 1.2.2로 로컬 테스트 네트워크에서 실행했습니다. 정확한 구분은 [확인한 내용](#tested)을 참고하세요.
:::

:::caution 공개 게이트웨이는 아직 트랜잭션을 릴레이하지 않습니다
2026년 11월 22일 `https://svm-testnet.qore.host`는 형식이 올바른 모든 `sendTransaction`에 `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)`로 응답했습니다. 읽기와 수수료 견적은 동작하지만, 그 게이트웨이의 운영자가 릴레이어 계정을 설정할 때까지 쓰기는 거부됩니다. 윈도우까지의 단계는 게이트웨이가 필요하지 않습니다. 전송이 필요한 단계는 [공개 게이트웨이 없이 전송하기](#relay)를 보고, 시작하기 전에 엔드포인트를 다시 확인하세요. [1단계](#step-config)의 명령을 실행한 다음 [6단계](#step-fund)처럼 `solana transfer`를 실행해 보면 됩니다.
:::

## v3.2.9에서 SVM의 새로운 점 {#whats-new}

* **체인 위의 Solana 와이어 트랜잭션.** Solana 지갑이나 도구가 서명한 트랜잭션이 Native 메시지 `MsgSolanaTransaction`에 바이트 단위로 그대로 담겨 전달됩니다. 체인은 모든 ed25519 서명, 최근 블록해시, 수수료 지불자를 검증하고, 명령을 순서대로 하나의 원자적 단계로 실행하며, 이미 본 서명은 거부합니다. 이 메시지는 자신을 운반하는 트랜잭션의 최상위 메시지로만 실행됩니다. authz 아래에서, 그리고 컨트랙트가 디스패치할 때는 거부됩니다.
* **실행하지 않고 릴레이하는 게이트웨이.** 노드의 Solana JSON-RPC 메서드 `sendTransaction`은 더 이상 노드에서 아무것도 실행하지 않습니다. 트랜잭션을 디코딩하고, 폐기되는 상태 복사본에서 시뮬레이션한 뒤, 두 키로 운반 트랜잭션에 서명해 멤풀로 보내는 릴레이어 계정에 넘깁니다. 블록을 통과한 것만 상태를 바꿉니다. ed25519 서명은 체인에서 검증되므로 릴레이어는 사용자의 트랜잭션에 대한 어떤 권한도 얻지 않습니다.
* **Solana 키를 위한 포스트 퀀텀 인가 윈도우.** `MsgOpenSVMWindow`는 ed25519 키 하나를 지정하고, 블록 수, 트랜잭션 수, QOR 가치로 제한하며, 선택적으로 나열된 프로그램으로 한정할 수 있습니다. 윈도우가 열려 있는 동안 그 키가 서명한 트랜잭션이 사용자의 계정을 대신해 동작합니다. 윈도우를 여는 데는 **ML-DSA-87 서명**이 필요하므로, 유출된 Solana 키만으로는 윈도우를 열 수 없습니다.
* **키 증명.** 윈도우를 열려면 `svm_key_proof`(필드 7)가 필요합니다. Solana 키 자신이 만든 64바이트 Ed25519 서명이며, 체인, 사용자의 계정, 키를 명시하는 짧은 텍스트에 대한 것입니다. 공개 키는 공개되어 있으므로, 윈도우를 여는 사람이 그 키를 보유하고 있음을 보여 주는 것이 이 증명입니다.
* **증명 하나로 윈도우 하나.** 텍스트에는 해당 키에 대해 윈도우를 열 때마다 증가하는 카운터(논스)가 들어 있으므로, 오래된 증명은 재사용할 수 없습니다.
* **프로그램 로더.** 업그레이드 가능한 로더를 사용할 수 있으므로 `solana program deploy`, `write-buffer`, `extend`, `set-upgrade-authority`, `close`, `anchor deploy`가 동작하며, 프로그램은 권한자가 업그레이드하고 닫아서 렌트를 돌려받을 수 있습니다.
* **Solana 도구가 이해하는 수수료.** `getFeeForMessage`와 `simulateTransaction`이 실제 수수료를 보고하므로, 기본 `solana`와 web3.js의 수수료 검사는 추가 플래그 없이 올바르게 동작합니다. 트랜잭션이 너무 저렴하면 오류에 설정해야 할 정확한 가격이 담겨 있습니다.
* **authz 부여를 위한 예산.** 다른 사람이 authz 부여에 따라 사용자 이름으로 보낸 `MsgExecuteProgram`, `MsgCreateAccount`, `MsgDeployProgram`은 윈도우와 그 별도의 대리 예산 안에서만 실행됩니다.

### 트랜잭션 경로 {#path}

```text
solana CLI / web3.js / anchor
        |  sendTransaction (signed wire transaction)
        v
SVM gateway on a node: decode, verify, simulate on a copy, check the price
        |  relayer signs MsgSolanaTransaction with the classical key and ML-DSA-87
        v
mempool, then a block: ante checks every Solana signature, blockhash, fee payer, window
        v
instructions run in order; they all succeed or none does
```

Solana 수수료는 릴레이어에게 가므로 릴레이어가 손해를 보는 일은 없습니다. 게이트웨이의 모든 응답은 최종적입니다. 블록은 한 번만 커밋되므로 `processed`, `confirmed`, `finalized`가 같은 데이터를 반환합니다.

### 윈도우: 무엇을 제한하는가 {#window}

| 제한 | 의미 | 한도 |
| ----- | ------------- | ----- |
| 블록 | 윈도우가 이 블록 수 이후에 만료됩니다. 테스트넷에서 블록은 약 1.4초가 걸리므로(2026년 11월 22일 확인) 3,600블록은 약 85분입니다 | 1에서 17,280 |
| 트랜잭션 | 승인된 Solana 트랜잭션은 이후 실패하더라도 각각 하나로 계산됩니다 | 1에서 1,000 |
| 가치 | 승인된 트랜잭션 때문에 계정의 네이티브 QOR가 감소한 모든 양이 수수료를 포함해 계산됩니다. 가치를 초과하게 될 트랜잭션은 거부되고 되돌려집니다. 가치는 uqor 또는 QOR로 지정하며, 예를 들면 `25qor`입니다 | 0보다 큼 |
| 프로그램(선택) | 승인된 트랜잭션의 모든 명령은 나열된 프로그램 중 하나를 호출해야 합니다 | 최대 16 |

설계에서 따라오는 규칙은 다음과 같습니다.

* 윈도우는 **사용자 본인의 포스트 퀀텀 서명**으로, 최상위 메시지로서만 열고 닫습니다. authz, 그룹, 컨트랙트 아래에서는 거부됩니다.
* 윈도우를 열려면 먼저 **등록된 포스트 퀀텀 키**가 있어야 합니다.
* **Solana 키 하나는 한 번에 계정 하나만 인가합니다.** 윈도우를 다시 열면 이전 윈도우가 대체되고 그 키는 해제됩니다.
* **포스트 퀀텀 키를 변경하거나 마이그레이션하면 윈도우가 종료됩니다.**
* 가치 한도는 네이티브 잔액 외에도, 사용자의 서명이 다른 곳에서 제어하는 QOR도 계산합니다. 시드로 사용자의 계정에서 파생된 계정, 닫을 수 있는 토큰 계정, 사용자가 권한자인 조회 테이블과 로더 계정이 해당합니다. 지출되었거나 다른 사람에게 넘어갔다면 계산됩니다. 윈도우 키는 사용자 계정 자체의 주소를 지갑 상태에서 꺼낼 수 없습니다.
* 윈도우가 열려 있는 동안 윈도우 키로 `getBalance`나 `getAccountInfo`를 읽으면 사용자의 네이티브 잔액이 보입니다.

### 윈도우의 알려진 한계 {#window-limits}

토큰을 보유한 지갑에 윈도우를 열기 전에 읽어 보세요.

* **토큰 수량은 가치 한도에 계산되지 않습니다.** 한도는 네이티브 QOR만 계산합니다. 기본 범위(프로그램 목록 없음)에서는 Solana 키가 거래 수수료만 내고 계정의 SPL 토큰을 전송하고 소각할 수 있으며, 계정이 보유한 민트 권한으로 발행도 할 수 있습니다.
* **기본 범위는 지속되는 부여를 거부합니다.** 기본 범위 윈도우로 동작하는 키는 위임자 승인, 토큰 계정의 소유자나 닫기 권한 변경, 민트나 동결 권한 변경을 할 수 없습니다. 같은 트랜잭션에서 만든 토큰 계정이나 민트도 마찬가지입니다. 이런 동작에는 사용자 본인의 포스트 퀀텀 서명이 필요하거나, 프로그램 목록에 토큰 프로그램을 명시한 윈도우가 필요합니다.
* **공동 서명자의 지불은 윈도우에 계산됩니다.** 다른 키가 같은 Solana 트랜잭션에 서명하고 그 안에서 무언가를 지불하면, 그 지불도 사용자의 가치 한도에 계산됩니다. 후원자가 별도의 트랜잭션에서 지불하게 하거나, 트랜잭션이 옮기는 모든 것을 가치 한도가 포괄하는 윈도우를 여세요.
* **명시적 토큰 범위에서 만든 부여는 윈도우보다 오래갑니다.** 프로그램 목록에 토큰 프로그램을 명시하면, 윈도우를 통해 만든 위임과 권한 변경은 윈도우가 닫히거나 만료되거나 포스트 퀀텀 키가 교체된 뒤에도 그대로 남습니다. 사용자 본인의 서명으로 취소하세요.
* **토큰 동작을 완전히 제외하려면** 토큰 프로그램을 명시하지 않은 프로그램 목록으로 윈도우를 여세요.

### 수수료 {#fees}

| 항목 | 값(테스트넷, 2026년 11월 22일) |
| ---- | --------------------------------- |
| 서명당 기본 수수료 | 0.045 QOR(45,000 uqor, 45,000,000 lamport). 가스당 최소 가스 가격 0.1 uqor에서 450,000 가스의 가격이며, `getFeeForMessage`가 이를 보고합니다 |
| 화면의 단위 | `solana`는 금액을 **SOL**로 표시합니다. QoreChain에서 1 "SOL"은 1 QOR입니다. 1 uqor가 1,000 lamport이고 1 QOR가 1,000,000 uqor이기 때문입니다. "0.045 SOL"은 0.045 QOR로 읽으세요 |
| 우선 수수료 | 트랜잭션이 기본 수수료가 감당하는 것보다 많은 가스를 필요로 할 때만 적용됩니다. ComputeBudget 가격에 단위 한도를 곱한 값입니다 |
| 배포 | 쓰기 트랜잭션마다 기본 수수료 하나, 그리고 프로그램을 닫으면 돌려받는 렌트 |

지불하는 금액은 서명한 내용으로 상한이 정해집니다. 운반 트랜잭션의 비용을 지불하며, 최소 기본 수수료에서 최대 사용자 본인의 서명이 약속한 수수료까지입니다. 릴레이어는 사용자가 더 많이 지불하게 만들 수 없습니다.

트랜잭션이 운반 트랜잭션의 비용보다 적게 지불하면 게이트웨이는 코드 `-32002`로 거부하고 정확한 해결 방법을 알려 줍니다. 같은 숫자가 오류 `data`에 들어 있습니다.

```json
{
  "code": -32002,
  "message": "Transaction simulation failed: insufficient priority fee: the transaction pays 45000000 lamports, its carrier costs ... uqor ... set ComputeBudget SetComputeUnitPrice to <price> micro-lamports per compute unit, which covers it for a compute unit limit of <limit> or more ...",
  "data": {
    "computeUnitPrice": 0,
    "computeUnitLimit": 0,
    "transactionComputeUnitLimit": 0,
    "carrierFeeLamports": 0,
    "feeLamports": 0
  }
}
```

0은 사용자 트랜잭션의 숫자를 대신합니다. `SetComputeUnitPrice`를 `data.computeUnitPrice`로, 단위 한도를 최소 `data.computeUnitLimit`로 설정하세요. 1 마이크로 lamport라도 낮으면 다시 거부됩니다. `solana program deploy`에서는 `--with-compute-unit-price <data.computeUnitPrice>`를 사용하세요. 릴리스 전 실행에서 일반적인 프로그램 배포, 업그레이드, 확장, 닫기, 권한 변경의 모든 단계가 기본 수수료로 충분했으므로, 이 오류는 주로 비정상적으로 큰 `--max-len`에서 만나게 됩니다.

### 대리 예산 {#on-behalf}

`MsgExecuteProgram`, `MsgCreateAccount`, `MsgDeployProgram`을 사용자 이름으로 보내는 authz 피부여자는 사용자의 윈도우와 그 **별도의 대리 예산**(`on_behalf_max_txs`와 `on_behalf_max_value`) 안에서만 동작합니다. 키 자체의 한도와 대리 예산은 서로를 소진시킬 수 없습니다. 대리 예산이 없으면(기본값) 그런 부여는 거부되고 아무것도 움직이지 않습니다. 계정 자신을 피부여자로 하는 authz 실행으로 감싼 `MsgExecuteProgram`도 사용자를 대신해 보낸 것으로 계산되므로, 자신의 SVM 메시지는 최상위 메시지로 보내세요.

중첩된 실행이나 배포는 모두 사용자의 계정이 SVM 고정 수수료 `max(1, compute_budget_max / 1000)` uqor도 지불하게 만드는데, 실시간 파라미터 값 1,400,000에서는 1,400 uqor입니다. 이 수수료는 대리 가치 한도에 계산됩니다. `--on-behalf-max-value`는 최소 `on_behalf_max_txs`에 고정 수수료를 곱한 값에, 피부여자가 옮기기로 한 가치를 더한 값으로 설정하세요. 값이 0이면 모든 대리 실행이 거부됩니다.

### 로더 {#loader}

| 실행하는 명령 | 체인에서 하는 일 |
| ------- | --------------------- |
| `solana program deploy x.so` | 많은 작은 트랜잭션으로 프로그램을 버퍼에 쓴 다음 배포합니다. 프로그램 id는 `--program-id`에 지정한 것이거나 새로 만든 것입니다 |
| 기존 프로그램에 대한 `solana program deploy --program-id <id> x.so` | 업그레이드합니다. 업그레이드 권한자만 할 수 있습니다 |
| `solana program write-buffer` / `show --buffers` / `close <buffer>` | 배포하지 않고 버퍼를 쓰고, 나열하고, 닫습니다 |
| `solana program extend <id> <bytes>` | 프로그램의 데이터 영역을 키웁니다 |
| `solana program set-upgrade-authority <id> --new-upgrade-authority <key>` | 업그레이드 권한을 다른 키에 넘깁니다. `--final`은 프로그램을 영구적으로 만듭니다 |
| `solana program close <id>` | 프로그램을 닫고 렌트를 돌려받습니다 |
| `anchor deploy` | Anchor가 빌드한 프로그램으로 같은 일을 합니다 |

프로그램은 최대 10 MiB(실시간 `max_program_size`)까지 가능합니다. 프로그램은 서로 최대 4단계 깊이까지 호출합니다(`max_cpi`). 기본 컴퓨트 예산은 명령당 최대 1,400,000 유닛입니다.

## 이 가이드에서 쓰는 용어 {#words}

| 용어 | 쉬운 뜻 |
| ---- | ------------- |
| SVM | QoreChain의 Solana 호환 가상 머신. Solana와 같은 컴파일된 프로그램(SBF)을 실행합니다 |
| Lamport | Solana 도구에서 가장 작은 단위. 1 uqor는 1,000 lamport이고, 1 QOR는 1,000,000,000 lamport입니다 |
| 윈도우 | 하나의 Solana 키가 사용자의 계정을 대신해 동작하도록 허용하는 짧고 제한된 권한. 열려면 포스트 퀀텀 키로 서명한 트랜잭션이 필요합니다 |
| 키 증명 | 짧은 텍스트에 대한 Solana 키 자신의 서명. 지정한 키를 보유하고 있음을 증명합니다 |
| 논스 | Solana 키별 카운터로, 증명과 함께 윈도우를 열 때마다 증가합니다. 다음 증명은 현재 값에 서명해야 합니다 |
| 운반 트랜잭션 | Solana 트랜잭션 하나를 블록으로 실어 나르는 Native 트랜잭션 |
| 릴레이어 | 운반 트랜잭션에 서명하고 전송하는 계정. Solana 수수료로 비용을 보전받습니다 |
| 블록해시 | Solana 트랜잭션의 기반이 되는 최근 블록 해시. 150슬롯, 여기서는 약 3.5분 동안 유효합니다 |

## 시작하기 전에 {#prerequisites}

macOS 또는 Linux 터미널, 약 10 QOR의 테스트 QOR, 그리고 다음 도구가 필요합니다(오른쪽 열은 이 페이지에 사용한 버전입니다).

| 도구 | 용도 | 사용한 버전 |
| ---- | -------- | ------------ |
| Solana 명령줄(Agave) | `solana`, `solana-keygen` | `solana-cli` 4.0.2 |
| Rust와 `cargo build-sbf` | 프로그램 빌드 | `cargo-build-sbf` 4.0.0, platform tools v1.53, `rustc` 1.89 |
| Anchor(선택) | `anchor build`, `anchor deploy` | `anchor-cli` 1.2.2 |
| Node.js 18 이상 | 키 증명 스크립트와 호출 스크립트 | 현재의 아무 LTS |
| `@solana/web3.js` 1.x | 프로그램 호출 | 1.99 |
| `qorechaind` v3.2.9 | 포스트 퀀텀 키 등록, 윈도우 열기와 닫기 | 릴리스 바이너리, 아래 참조 |

가지고 있는 것을 확인하세요.

```bash
solana --version
cargo build-sbf --version
anchor --version
node -v
```

**`qorechaind`에 대해.** 윈도우를 여는 것은 ML-DSA-87 서명이 필요한 Native 메시지이며, `tx pqc open-svm-window` 명령은 v3.2.9에 포함되어 있습니다. 2026년 11월 22일 테스트넷 릴리스 매니페스트(`https://download.qore.host/testnet/latest.json`)에는 아직 버전 3.2.8이 올라 있었으므로, v3.2.9 번들은 거버넌스 제안 39의 본문(`GET https://api-testnet.qore.host/cosmos/gov/v1/proposals/39`)에 명시된 것입니다. 릴리스 바이너리는 Linux용으로 빌드되며, 패키지된 macOS 바이너리는 없습니다. 윈도우를 위한 SDK 헬퍼는 아직 게시되지 않았습니다. 이 가이드의 나머지는 노드가 필요하지 않습니다.

테스트 QOR가 있는 QoreChain 계정([페이시](/dashboard/faucet)에서 받으세요)과 등록된 포스트 퀀텀 키도 필요합니다. 아직 하지 않았다면 먼저 [키 등록](/developer-guide/post-quantum-signing#pqc-key-registration)을 따르세요. 아래 명령은 계정 키를 `mykey`, 그 포스트 퀀텀 키를 `mykey-mldsa`라고 부릅니다.

:::caution 일회용 테스트넷 키만 사용하세요
아래에서 만드는 두 Solana 키페어는 비밀 키가 들어 있는 파일입니다. 다른 네트워크에서 실제 자금을 보유한 키페어는 절대 사용하지 말고, 비밀 키를 명령, 채팅, 저장소에 붙여 넣지 마세요.
:::

## 단계별 안내 {#steps}

평소의 `solana` 설정을 건드리지 않도록 작업 폴더 하나와 별도의 Solana 설정을 만드세요.

```bash
mkdir -p ~/qore-svm && cd ~/qore-svm
alias qsol='solana -C ~/qore-svm/solana-config.yml'
```

별칭은 자체 설정 파일로 `solana`를 실행합니다. 같은 터미널을 계속 사용하거나, 새 터미널에서는 별칭을 다시 설정하세요.

### 1단계: Solana 도구를 테스트넷에 연결 {#step-config}

```bash
qsol config set --url https://svm-testnet.qore.host
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
qsol epoch-info
```

첫 줄은 RPC 주소를 `solana-config.yml`에 저장합니다. 두 번째는 노드에 버전을 묻습니다. `solana-core` `1.18.0-qorechain`, 체인 id `qorechain-diana`, 제네시스 해시 `6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj`(HTTP 200)가 보여야 합니다. 세 번째는 블록 높이와 같은 현재 슬롯을 출력합니다(2026년 11월 22일 약 1,057만).

레인 파라미터가 무엇이 들어맞는지 결정합니다. 한 번 읽어 보세요.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

`"enabled":true`와 실시간 테스트넷의 한도가 보여야 합니다. `max_program_size` 10,485,760, `compute_budget_max` 1,400,000, `lamports_per_byte` 3,480, `max_cpi` 4입니다. `enabled`가 `false`이면 레인이 닫힌 것이며 아래의 어떤 것도 동작할 수 없습니다.

공개 엔드포인트는 웹소켓을 제공하지 않으므로(2026년 11월 22일 웹소켓 업그레이드는 HTTP 405로 응답했습니다), 트랜잭션을 확인하는 명령(`solana program deploy`, `write-buffer`)에는 `--use-rpc`를 주어 도구가 일반 HTTP로 폴링하게 하세요. Anchor는 이중 대시 뒤에서 이를 받아들입니다.

### 2단계: Solana 키페어 두 개 만들기 {#step-keys}

```bash
solana-keygen new --no-bip39-passphrase --outfile window.json
solana-keygen new --no-bip39-passphrase --outfile deployer.json
solana-keygen pubkey window.json
solana-keygen pubkey deployer.json
```

처음 두 명령은 각각 키페어 파일(64개 숫자의 JSON 배열: 32바이트 비밀 시드, 그다음 공개 키)을 씁니다. 마지막 두 명령은 공개 키를 base58 텍스트로 출력합니다. 32자에서 44자인 서로 다른 두 주소가 보여야 합니다. 이를 `WINDOW_PUBKEY`와 `DEPLOYER_PUBKEY`라고 부르겠습니다.

왜 키가 두 개인가. **윈도우 키**는 짧은 시간 동안 사용자의 Native 계정을 대신해 동작합니다. 키 자체는 아무것도 보유하지 않으며, 윈도우 안에서 사용자의 QOR를 지출합니다. **배포자 키**는 평범한 Solana 키입니다. 윈도우를 통해 이 키를 충전하면, 그 후에는 윈도우 없이 프로그램을 배포하고 업그레이드하고 소유합니다. 윈도우 키를 업그레이드 권한자로 사용하지 마세요. 프로그램은 사용자의 Native 계정을 권한자로 기록하며, `solana`는 기록된 권한자가 아닌 키가 서명한 업그레이드를 거부합니다.

배포자 키를 Solana 설정의 기본 서명자로 설정하세요.

```bash
qsol config set --keypair ~/qore-svm/deployer.json
```

### 3단계: 포스트 퀀텀 키 등록 {#step-pqc}

`qorechaind query pqc account <your qor address>`가 이미 키를 보여 준다면 이 단계를 건너뛰세요. 그렇지 않으면 릴리스 `qorechaind`가 있는 컴퓨터에서 다음을 실행하세요.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

qorechaind tx pqc gen-key mykey-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mykey-mldsa \
  --from mykey --chain-id $QCHAIN --node $QNODE --gas 600000 --fees 60000uqor -y
qorechaind query pqc account <your qor address> --node $QNODE
```

`gen-key`는 ML-DSA-87 키를 만들고 공개 키를 16진수로 출력합니다. `register-key-v2`는 소유 증명과 함께 그 키를 계정에 등록합니다. 조회에는 등록된 키가 보여야 합니다. 이것은 새 계정이 클래식 키만으로 서명할 수 있는 유일한 트랜잭션입니다. 키를 백업하는 방법을 포함한 전체 설명은 [포스트 퀀텀 서명](/developer-guide/post-quantum-signing#pqc-key-registration)에 있습니다.

### 4단계: 키 증명 만들기 {#step-proof}

증명은 윈도우 키가 다음 텍스트 그대로에 대해 만든 Ed25519 서명이며, 공백과 끝의 줄바꿈 없이 UTF-8로 인코딩합니다.

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>
```

이전에 윈도우를 한 번 이상 연 적이 있는 키는 `|` 하나를 더 두고 논스 `N`이 뒤따릅니다.

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>|<N>
```

`N`은 그 키에 대해 증명과 함께 이미 연 윈도우의 수이며, 부호와 앞의 0 없이 십진수로 씁니다. 새 키는 `N`이 0이고 접미사가 없습니다. 서명은 일반 Ed25519(RFC 8032)입니다. 프리해시, 컨텍스트, Solana 오프체인 메시지 헤더가 없으므로 지갑은 원시 UTF-8 바이트에 서명해야 합니다.

텍스트를 손으로 만들지 마세요. 체인에 물어보세요.

```bash
curl -s "https://api-testnet.qore.host/qorechain/pqc/v1/svm_window_key_proof/<WINDOW_PUBKEY>?sender=<your qor address>"
```

응답에는 논스와 정확한 텍스트가 들어 있습니다.

```json
{"svm_pubkey":"9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","nonce":"0","key_proof_required":true,"sign_bytes":"qorechain-svm-window-key-v1|qorechain-diana|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","chain_id":"qorechain-diana"}
```

이것은 2026년 11월 22일에 샘플 주소로 받은 실제 응답입니다. `sign_bytes`를 윈도우 키로 서명하세요. 아래 스크립트는 Node.js만 사용해 두 단계를 모두 수행합니다(`keyproof.mjs`로 저장):

```js
// node keyproof.mjs <solana-keypair.json> <your qor address>
import { readFileSync } from "node:fs";
import { createPrivateKey, sign } from "node:crypto";

const REST = "https://api-testnet.qore.host";
const [keypairPath, sender] = process.argv.slice(2);

// A solana-cli keypair file: JSON array of 64 bytes, the 32-byte seed first, then the public key.
const bytes = Uint8Array.from(JSON.parse(readFileSync(keypairPath, "utf8")));
const seed = bytes.slice(0, 32);

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58(buf) {
  let n = 0n;
  for (const b of buf) n = n * 256n + BigInt(b);
  let out = "";
  while (n > 0n) { out = ALPHABET[Number(n % 58n)] + out; n /= 58n; }
  for (const b of buf) { if (b === 0) out = "1" + out; else break; }
  return out;
}
const pubkey = base58(bytes.slice(32));

// The chain knows its id and the key's nonce, so it gives the exact text.
const url = `${REST}/qorechain/pqc/v1/svm_window_key_proof/${pubkey}?sender=${sender}`;
const info = await (await fetch(url)).json();
console.log("nonce:", info.nonce);
console.log("text to sign:", info.sign_bytes);

// Pure Ed25519 over the UTF-8 bytes of the text.
const pkcs8 = Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), Buffer.from(seed)]);
const key = createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" });
const proof = sign(null, Buffer.from(info.sign_bytes, "utf8"), key);
console.log("svm_key_proof (hex):", proof.toString("hex"));
```

```bash
node keyproof.mjs window.json <your qor address>
```

`nonce: 0`, 텍스트, 128자의 16진수 문자열이 보여야 합니다. 16진수 문자열을 보관하세요. 이 문자열은 **윈도우 하나**에 대해서만, 그리고 이 발신자, 키, 체인에 대해서만 유효합니다.

**공개된 예시와 코드를 비교해 보세요.** 체인 id `qorechain-diana`, 발신자 `qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d`(`0x11` 20바이트), 논스 0입니다.

| 필드 | 값 |
| ----- | ----- |
| 공개 키(base58) | `9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| 공개 키(hex) | `79b5562e8fe654f94078b112e8a98ba7901f853ae695bed7e0e3910bad049664` |
| 메시지(131바이트) | `qorechain-svm-window-key-v1\|qorechain-diana\|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d\|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| 서명(hex) | `786b449dcd4b85c2225819c9ac993fbe97a2cfdce7f9ffba07e6895fad0b9b8d3a0634aae5b21d28d366590b3858c7085c8c856a90770fd919ee1bff728b0801` |

논스 1이면 메시지는 133바이트이고 `|1`로 끝납니다. 위 스크립트는 2026년 11월 22일에 대응하는 키로 이 서명을 재현했습니다. 같은 입력에 대해 코드가 다른 바이트를 만든다면, 흔한 원인은 끝의 줄바꿈, 프리해시, Solana 오프체인 헤더, 잘못된 논스 값입니다.

스크립트를 꼭 실행할 필요는 없습니다. 다음 단계의 명령이 키페어 파일로 직접 서명할 수 있습니다(`--svm-keypair`). 키가 다른 곳, 예를 들어 일반 메시지에 서명할 수 있는 지갑에 있을 때 스크립트를 사용하고, 그 결과를 `--svm-key-proof`로 전달하세요.

### 5단계: 윈도우 열기 {#step-open}

트랜잭션을 만든 다음 포스트 퀀텀 서명을 추가합니다. 이 예시는 3,600블록(약 85분), 최대 10개 트랜잭션, 총 10 QOR(가치와 수수료 합계)의 윈도우를 열고, System 프로그램(전송)과 로더(배포)로 한정합니다.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana
SYS=11111111111111111111111111111111
LOADER=BPFLoaderUpgradeab1e11111111111111111111111

qorechaind tx pqc open-svm-window <WINDOW_PUBKEY> 3600 10 10qor \
  --allowed-programs $SYS,$LOADER \
  --svm-keypair ~/qore-svm/window.json \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-open.json

qorechaind tx pqc cosign window-open.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

첫 명령은 `window-open.json`을 만듭니다. 위치 인수는 Solana 공개 키, 블록 수, 트랜잭션 수, 가치입니다. 체인에서 논스를 읽고 `window.json`으로 키 증명에 서명합니다. 두 번째 명령은 사용자의 ML-DSA-87 서명을 추가하고 트랜잭션을 전송합니다. 트랜잭션 해시와 코드 0이 보여야 합니다.

스크립트의 증명을 대신 사용하려면 `--svm-keypair ...`를 `--svm-key-proof <hex from Step 4>`로 바꾸세요. 두 플래그를 모두 주지 않으면 명령이 거부하고 서명할 정확한 텍스트를 출력합니다. 키가 이전에 윈도우를 연 적이 있다면 명령이 논스를 스스로 읽습니다. `--svm-key-proof`와 함께라면 `--svm-key-nonce <N>`으로 고정할 수 있습니다.

윈도우를 다시 읽어 보세요.

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/svm_window/<your qor address>
qorechaind query pqc svm-window <your qor address> --node $QNODE
```

`"found":true`와 `"live":true`가 보여야 하며, `max_txs`, `used_txs`, `max_value`, `used_value`, `remaining_blocks`, `remaining_txs`, `remaining_value`, `allowed_programs`, 그리고 `key_proven` `true`가 함께 있습니다. Solana 키로도 읽을 수 있습니다. `GET /qorechain/pqc/v1/svm_window_by_key/<WINDOW_PUBKEY>`입니다. `key_proof_required`, `key_usable`, `key_proof_nonce`(서명할 다음 값) 필드도 있습니다.

프로그램 목록에 System 프로그램과 로더를 명시한 것은 그 조합을 테스트했기 때문입니다. 이 가이드에서 윈도우 키는 전송만 하고 배포자가 배포합니다. 윈도우 키가 배포 비용을 직접 지불하게 한다면 목록에 두 프로그램을 모두 명시해야 합니다.

### 6단계: 배포자 충전 {#step-fund}

윈도우가 열려 있는 동안 윈도우 키가 사용자의 QOR를 지출합니다. 배포자에게 5 QOR를 보내세요.

```bash
qsol balance <WINDOW_PUBKEY>
qsol transfer <DEPLOYER_PUBKEY> 5 --keypair ~/qore-svm/window.json --allow-unfunded-recipient
qsol balance <DEPLOYER_PUBKEY>
```

첫 줄은 윈도우 키가 보는 사용자의 네이티브 잔액을 보여 줍니다("SOL"은 QOR로 읽으세요). 두 번째는 5 QOR를 보냅니다. `--keypair` 플래그는 이 명령 하나에서 윈도우 키를 서명자로 만들며, 배포자가 아직 아무것도 보유하지 않으므로 `--allow-unfunded-recipient`가 필요합니다. 세 번째는 `5 SOL`, 즉 5 QOR를 보여야 합니다. 이 전송은 사용자의 계정에 총 5.045 QOR가 듭니다. 5 QOR에 기본 수수료 0.045 QOR를 더한 값이며, 윈도우 카운터(`used_txs` 1, `used_value` 5,045,000)가 이를 보여 줍니다.

`this node relays no Solana transactions`로 거부되면 [공개 게이트웨이 없이 전송하기](#relay)를 보세요.

### 7단계: 작은 프로그램 빌드 {#step-build}

```bash
cargo init --lib hello
cd hello
```

`Cargo.toml`을 다음으로 바꾸세요.

```toml
[package]
name = "hello"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
solana-program = "2.2"
```

`src/lib.rs`를 다음으로 바꾸세요.

```rust
use solana_program::{account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg, pubkey::Pubkey};

entrypoint!(process_instruction);

fn process_instruction(_program_id: &Pubkey, _accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    msg!("hello from QoreChain, {} data bytes", data.len());
    Ok(())
}
```

```bash
cargo build-sbf
ls -l target/deploy
```

이는 프로그램을 SBF로 컴파일합니다. `hello.so`(약 19 KB)와, 주소가 프로그램 id가 되는 키인 `hello-keypair.json`이 보여야 합니다. `unexpected cfg`에 대한 컴파일러 경고는 무해합니다. 프로그램은 로그 한 줄을 쓰고 다른 일은 하지 않습니다.

### 8단계: 배포 {#step-deploy}

```bash
qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc
```

이는 프로그램을 약 20개의 작은 트랜잭션으로 쓴 다음 배포합니다. `solana`는 먼저 비용을 추정하고 잔액을 확인합니다. 18,896바이트 빌드의 경우 2026년 11월 22일에 지출 0.133 QOR(렌트)와 수수료 1.035 QOR를 출력했으며, 이는 0.045 QOR의 트랜잭션 23개입니다. 마지막에 `Program Id: <address>`가 보여야 합니다. 확인하세요.

```bash
qsol program show <program id>
```

프로그램 id, 로더(`BPFLoaderUpgradeab1e11111111111111111111111`), ProgramData 주소, **권한자**(배포자 키), 배포 슬롯, 데이터 길이가 보여야 합니다. 배포를 시작했는데 중간에 멈추면, `solana`가 임시 버퍼 키의 12단어 복구 문구를 출력합니다. 배포가 끝날 때까지 보관하세요. 이 문구로 복구한 키페어를 다음 `program deploy`나 `write-buffer`에 전달하면 같은 버퍼를 이어서 사용할 수 있고, 버퍼를 닫아 렌트를 돌려받을 수도 있습니다.

Anchor로 빌드한 프로그램은 릴리스 전 실행에서와 같이 `solana program deploy`에 `--skip-feature-verify`를 추가하세요.

#### Anchor 사용 {#anchor}

```bash
anchor init counter
cd counter
anchor build
anchor deploy --provider.cluster https://svm-testnet.qore.host \
  --provider.wallet ~/qore-svm/deployer.json -- --use-rpc
```

`anchor build`는 템플릿 프로그램을 컴파일하고 `anchor deploy`는 `declare_id!`의 프로그램 id로 배포합니다. 템플릿 프로그램은 약 130 KB이며 0.045 QOR의 쓰기 트랜잭션 약 130개에 해당하므로, 먼저 배포자에게 최소 10 QOR를 충전하세요. 릴리스 전 실행에서 128 KB 프로그램은 약 6.8 QOR가 들었고, 대부분은 쓰기 수수료이며 렌트는 닫을 때 돌아옵니다. 코드를 바꾼 뒤 두 번째 `anchor deploy`를 하면 프로그램이 업그레이드됩니다. Anchor는 로컬 주소에 대한 IDL 업로드를 건너뛰며, 테스트넷으로의 IDL 업로드는 테스트하지 않았습니다.

### 9단계: 프로그램 호출 {#step-call}

`solana`는 임의의 프로그램을 호출할 수 없으므로 짧은 web3.js 스크립트를 사용하세요. 빈 폴더에서 다음을 실행합니다.

```bash
npm init -y
npm install @solana/web3.js@1
```

`call.cjs`로 저장하세요.

```js
// node call.cjs <payer keypair.json> <program id> [data as text]
const fs = require("fs");
const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");

const RPC = "https://svm-testnet.qore.host";
const [payerPath, programId, text = "hi"] = process.argv.slice(2);
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(payerPath, "utf8"))));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const conn = new Connection(RPC, "confirmed");
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash }).add(
    new TransactionInstruction({ programId: new PublicKey(programId), keys: [], data: Buffer.from(text) }),
  );
  tx.sign(payer);

  const signature = await conn.sendRawTransaction(tx.serialize()); // preflight runs on the gateway
  console.log("signature:", signature);

  // The public endpoint serves no websocket, so poll instead of confirmTransaction.
  for (;;) {
    const { value } = await conn.getSignatureStatuses([signature]);
    if (value[0]) { console.log("status:", value[0].confirmationStatus, "err:", JSON.stringify(value[0].err)); break; }
    if ((await conn.getBlockHeight()) > lastValidBlockHeight) throw new Error("blockhash expired, build and send again");
    await sleep(1500);
  }
  const t = await conn.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
  console.log("fee (lamports):", t.meta.fee);
  console.log((t.meta.logMessages || []).join("\n"));
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
```

```bash
node call.cjs ~/qore-svm/deployer.json <program id> "hello"
```

스크립트는 프로그램에 대한 명령 하나를 만들고, 배포자 키로 서명하고, 전송하고, 서명에 상태가 생길 때까지 폴링한 다음 프로그램의 로그를 출력합니다. 수수료 지불자는 배포자이므로 윈도우가 필요하지 않습니다. 서명, `status: finalized err: null`, `fee (lamports): 45000000`, 그리고 다음과 같은 로그가 보여야 합니다(형태는 릴리스 전 실행에서 가져왔으며, 메시지는 프로그램 자체의 것입니다).

```text
Program <program id> invoke [1]
Program log: hello from QoreChain, 5 data bytes
Program <program id> consumed ... compute units
Program <program id> success
```

### 10단계: 결과 읽기 {#step-read}

| 원하는 것 | 명령 또는 호출 |
| -------- | --------------- |
| 트랜잭션의 상태 | `qsol confirm -v <signature>` 또는 `getSignatureStatuses` |
| 로그, 수수료, 잔액 변경 | `maxSupportedTransactionVersion: 0`을 준 `getTransaction`(위 스크립트) |
| 프로그램과 그 권한자 | `qsol program show <program id>` |
| 배포자의 모든 프로그램 | `qsol program show --programs` |
| 데이터 계정 | `qsol account <address>` 또는 `getAccountInfo` |
| 계정별 또는 키별 윈도우 | `GET /qorechain/pqc/v1/svm_window/<address>`와 `.../svm_window_by_key/<pubkey>` |

블록 안에서 실패하는 트랜잭션(예를 들어 `--skip-preflight`로 게이트웨이의 사전 검사를 건너뛴 경우)도 서명은 유지되고 수수료는 지불되며, 그 효과는 되돌려집니다. 릴리스 전 실행에서 윈도우의 가치 한도를 넘는 전송을 `--skip-preflight`로 보내면 블록에 들어가 `Error processing Instruction 0: generic instruction error`로 실패했고 전송은 되돌려졌습니다. `--skip-preflight` 없이는 더 일찍, 게이트웨이에서 `-32002 ... SVM authorisation window exhausted`로 거부됩니다.

### 11단계: 업그레이드, 인계, 확장, 닫기 {#step-admin}

이 모든 것은 배포자 키를 서명자로 사용하며 윈도우가 필요하지 않습니다.

| 작업 | 명령 |
| ---- | ------- |
| 코드 변경 후 업그레이드 | `qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc` |
| 데이터 영역을 N바이트 키우기 | `qsol program extend <program id> N` |
| 업그레이드 권한을 다른 키에 넘기기 | `qsol program set-upgrade-authority <program id> --new-upgrade-authority <new.json>` |
| 프로그램을 영구적으로 만들기 | `qsol program set-upgrade-authority <program id> --final` |
| 배포 없이 버퍼 쓰기, 버퍼 나열 | `qsol program write-buffer x.so --use-rpc`, 그다음 `qsol program show --buffers` |
| 버퍼를 닫거나, 프로그램을 닫고 렌트 돌려받기 | `qsol program close <buffer or program id>`(프로그램은 `--bypass-warning`도 필요) |

권한자가 아닌 키의 업그레이드는 거부됩니다. `set-upgrade-authority` 이후에는 이전 권한자가 거부되고 새 권한자가 업그레이드할 수 있습니다. `--final` 이후의 업그레이드는 프로그램이 더 이상 업그레이드할 수 없다는 메시지와 함께 거부됩니다. 닫힌 프로그램은 다시 호출할 수 없으며 `program show`는 닫혔다고 알려 줍니다.

### 12단계: 윈도우 닫기 {#step-close}

작업이 끝나면 윈도우를 닫을 수 있으며, Solana 키가 노출되었다고 생각되면 즉시 닫아야 합니다. 윈도우가 아직 승인하던 것은 다음 블록부터 거부됩니다.

```bash
qorechaind tx pqc close-svm-window --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-close.json
qorechaind tx pqc cosign window-close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

윈도우를 다시 읽어 보세요. 더 이상 활성 상태가 아니어야 하고, `qsol balance <WINDOW_PUBKEY>`는 다시 0이어야 합니다. 윈도우 키는 더 이상 사용자의 QOR를 움직일 수 없습니다. 윈도우를 통해 만든 배포자 키, 프로그램, 자금은 계속 사용자의 것입니다.

같은 키로 새 윈도우를 열려면 4단계를 다시 실행하세요. 논스가 이제 더 높으며, 이전 윈도우를 위해 만든 증명은 `expected_nonce`와 함께 거부됩니다.

## 공개 게이트웨이 없이 전송하기 {#relay}

`svm-testnet.qore.host`의 공개 게이트웨이는 2026년 11월 22일에 릴레이를 거부했습니다(맨 위의 상자 참조). 릴레이를 시작할 때까지 전송하는 방법은 두 가지입니다.

**명령줄로 트랜잭션 하나.** QOR를 보유하고 등록된 포스트 퀀텀 키가 있는 모든 네이티브 계정은 사용자가 서명한 Solana 트랜잭션을 운반할 수 있습니다. 먼저 예를 들어 web3.js로 Solana 트랜잭션을 만들고 서명한 다음 base64로 출력하세요(`tx.serialize().toString("base64")`). 트랜잭션은 사용한 블록해시 이후 약 3.5분 동안 유효합니다. 그다음:

```bash
qorechaind tx svm solana-tx <base64 transaction> --from mykey \
  --chain-id $QCHAIN --node $QNODE --gas <GAS> --fees <FEES>uqor --generate-only > relay.json
qorechaind tx pqc cosign relay.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

`--gas`와 `--fees`는 드라이 런으로 정하세요. 먼저 `tx pqc cosign`을 `--dry-run`과 함께 실행해(가스 추정치를 출력하고 아무것도 전송하지 않습니다) 추정치에 30%를 더한 값을 `<GAS>`로, `<GAS>`에 0.1 uqor를 곱한 금액 이상을 `<FEES>`로 사용합니다. 단순 전송은 대략 30만~40만 가스가 필요하고, 배포나 코드를 담은 제안은 훨씬 더 많이 필요합니다.

`--from`의 계정이 릴레이어입니다. 운반 트랜잭션에 서명하고 가스를 지불하며, Solana 수수료 지불자가 이를 보전합니다. 릴레이어는 Solana 트랜잭션에 대한 어떤 권한도 얻지 않습니다. 운반 트랜잭션의 수수료는 Solana 트랜잭션이 지불하는 것으로 충당되어야 하며, 서명 하나에 45,000 uqor입니다. 이는 전송이나 호출에는 실용적이지만, 쓰기 트랜잭션이 많은 배포에는 그렇지 않습니다. 이 경로는 이 페이지를 위해 실제 테스트넷에서 실행하지 않았습니다.

**자체 게이트웨이.** 테스트넷을 따르고 v3.2.9 바이너리를 실행하는 노드는 포트 8899에서 Solana JSON-RPC를 제공하며, `app.toml`의 `[svm-rpc]` 섹션에 릴레이어를 지정하면 릴레이합니다. `relayer-key`(노드 키링에 있는 충전된 계정, 또는 쉼표로 구분한 여러 개), `relayer-pqc-key`(노드의 `pqc` 폴더 아래 그 ML-DSA-87 키), `relayer-keyring-backend`입니다. `relayer-key`가 비어 있으면 오늘의 공개 엔드포인트처럼 `sendTransaction`이 거부됩니다. `relayer-fee`는 비워 두세요. 그러면 릴레이어가 Solana 트랜잭션이 지불하는 것에서 각 운반 트랜잭션의 가격을 정하므로 손해를 보지 않습니다. 릴리스 번들의 `lib/` 폴더 전체를 복사하세요. 이 설정은 이 페이지를 위해 실행하지 않았습니다. 노드 자체는 [노드 실행하기](/developer-guide/running-a-node)를 참고하세요.

## 계획해야 할 한도 {#limits}

* **릴레이 할당량.** 게이트웨이를 통해 보낸 Solana 트랜잭션은 수수료 지불자에게 계산됩니다. 기본값은 30블록당 600개이며 1분이 채 되지 않습니다. 한 키에서의 큰 배포는 이를 넘을 수 있습니다(1 MB 프로그램은 쓰기 약 1,100개). 거부된 쓰기는 비용이 없습니다. 먼저 `qsol program write-buffer`로 버퍼를 쓰고, 중단되면 1분 기다렸다가 같은 버퍼로 다시 실행한 다음, `--buffer`로 버퍼에서 배포하거나, 버퍼 쓰기와 배포를 서로 다른 수수료 지불자가 지불하게 하세요.
* **게이트웨이의 공정 분배.** 게이트웨이는 용량의 일부를 트랜잭션을 거의 보내지 않은 클라이언트를 위해 남겨 두고, 나머지는 활성 클라이언트 네트워크 사이에 고르게 나눕니다. 공정 분배 메시지(코드 `-32005`)로 거부되면 1분 기다리거나 다른 게이트웨이를 사용하세요.
* **트랜잭션은 블록해시가 만료되기 전에(150슬롯) 반영되어야 합니다.** `solana`는 자동으로 재전송하며, 스크립트도 그렇게 해야 합니다.
* **트랜잭션은 Solana와 같이 최대 1,232바이트, 최대 64개 계정입니다.** 레거시와 버전 0 메시지를 받아들입니다.
* **프로그램과 계정:** 각각 10 MiB. 프레임당 32 KiB 스택과 256 KiB 힙.
* [SVM 레인 (v3.2.8)](/developer-guide/svm-lane-v328#custody)의 **커스터디 한도**는 여전히 적용됩니다. SVM 풀이 한도에 도달하면 예치가 `svm custody cap exceeded`(코드 23)로 거부될 수 있습니다.
* **윈도우 목록의 이름.** `--allowed-programs`는 base58 프로그램 id를 받으며, 최대 16개이고 각각 한 번만 쓸 수 있습니다. 범위는 트랜잭션의 최상위 명령에 적용됩니다. 나열된 프로그램이 다른 프로그램을 호출하면 사용자의 서명이 함께 전달되므로, 전체로서 신뢰하는 프로그램만 나열하세요.
* **주소.** v3.2.9의 새 메시지는 정식 소문자 형태가 아닌 bech32 주소를 거부합니다. `toBech32`가 만드는 형태로 보내세요.

## 문제 해결 {#troubleshooting}

"live"로 표시된 문구는 2026년 11월 22일 실제 테스트넷에서 본 것입니다. 나머지는 릴리스 전 실행에서 본 체인과 게이트웨이 자체의 메시지입니다.

| 보이는 내용 | 의미 | 해야 할 일 |
| ------------ | ------------- | ---------- |
| `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)`(JSON-RPC 코드 `-32603`, live) | 게이트웨이에 릴레이어 계정이 없습니다 | [자체 게이트웨이 또는 명령줄 릴레이](#relay)를 사용하거나 운영자를 기다리세요 |
| `Error: Account <key> has insufficient funds for spend (X SOL) + fee (Y SOL)`(live, `solana`에서) | 키가 아무것도 보유하지 않습니다. SOL은 QOR로 읽으세요 | 윈도우를 열고 키를 충전하거나, 윈도우를 열고 윈도우 키를 서명자로 사용하세요 |
| 시뮬레이션 `InsufficientFundsForFee`, 로그 `fee payer ... has no account: insufficient fee`(live) | 같은 원인을 시뮬레이션에서 본 것입니다 | 같은 해결 방법 |
| `invalid solana transaction: no signatures`, `truncated: need 2 bytes at 1`(코드 `-32602`, live) | 바이트가 서명된 Solana 트랜잭션이 아닙니다 | 서명된 전체 와이어 트랜잭션을 base64 또는 base58로 보내세요 |
| 웹소켓 업그레이드에 HTTP 405(live) | 공개 엔드포인트는 웹소켓을 제공하지 않습니다 | `solana program deploy`와 `write-buffer`에 `--use-rpc`를 추가하고, 스크립트에서는 `getSignatureStatuses`로 폴링하세요 |
| `-32002 ... insufficient priority fee ...` | 트랜잭션이 운반 트랜잭션의 비용보다 적게 지불합니다 | 오류 `data`의 ComputeBudget 가격과 단위 한도를 설정하세요. [수수료](#fees) 참조 |
| `-32002 ... SVM authorisation window exhausted` | 윈도우의 블록, 트랜잭션, 가치가 소진되었거나 트랜잭션이 가치를 초과하게 됩니다 | 윈도우를 읽고, 더 높은 가치나 더 많은 트랜잭션으로 새로 여세요 |
| `no open SVM authorisation window`(코드스페이스 `pqc`, 코드 341) | 키에 활성 윈도우가 없습니다 | 하나 여세요(5단계) |
| 코드 343과 `expected_nonce=<N>`로 열기가 거부됨 | 증명이 다른 논스에 대해 서명되었습니다. 예를 들어 오래된 증명입니다 | 논스 경로를 다시 읽고(4단계) 다시 서명하세요 |
| `the key proof does not verify for <key>, sender <qor address>, chain <id>`(CLI) | 서명이 텍스트와 일치하지 않습니다 | 올바른 키와 발신자로 논스 경로의 `sign_bytes`를 정확히 서명하세요 |
| `--svm-keypair holds the key X, not Y`(CLI) | 키페어 파일이 지정한 키가 아닙니다 | base58 키와 일치하는 키페어를 사용하세요 |
| `the window needs the proof that you hold the Solana key`(CLI) | `--svm-keypair`도 `--svm-key-proof`도 주지 않았습니다 | 둘 중 하나를 주세요. 메시지가 서명할 텍스트를 출력합니다 |
| `blocks must be between 1 and 17280`, `max_txs must be between 1 and 1000`, `max_value must be positive`, `allowed_programs lists N programs, the maximum is 16` | 윈도우 제한이 범위를 벗어났습니다 | [윈도우](#window)의 표 안의 값을 사용하세요 |
| `svm_pubkey ... is not a valid ed25519 public key` 또는 `... is a native account address, not an ed25519 key` | 키가 프로그램 주소이거나 사용자의 QoreChain 주소 중 하나입니다 | `solana-keygen`으로 만든 키페어를 사용하세요 |
| `sender sol:<payer> has sent 600 transactions in the last 30 blocks` | 한 수수료 지불자의 릴레이 할당량 | 1분 기다리고 같은 버퍼로 재개하세요. [한도](#limits) 참조 |
| `-32005`와 `fair share of the relayer quota` | 게이트웨이가 용량을 나눕니다 | 1분 후 다시 시도하세요 |
| `-32020 node is starting, no committed state` | 노드에 아직 상태가 없습니다 | 몇 초 후 다시 시도하세요 |
| `node busy: the carrier could not be measured now, retry` | 게이트웨이가 지금은 운반 트랜잭션의 가격을 매길 수 없었습니다 | 다시 시도하세요 |
| `Transaction simulation failed: Blockhash not found` | 블록해시가 150슬롯보다 오래되었거나 알 수 없습니다 | 새 블록해시를 가져와 다시 서명하고 보내세요 |
| `Transaction simulation failed: This transaction has already been processed` | 같은 서명된 트랜잭션을 이전에 봤습니다 | `getSignatureStatuses`를 확인하세요. 다시 보내지 마세요 |
| Solana 트랜잭션이 `cannot approve a delegate`, `cannot hand over the ownership`, `cannot hand over the close authority` 또는 `cannot change the mint or freeze authority`와 `the grant would outlive the window`로 거부됨 | 기본 범위 윈도우는 지속되는 토큰 부여를 거부합니다 | 이 동작은 Native 레인에서 사용자 본인의 포스트 퀀텀 키로 서명하거나, 프로그램 목록에 토큰 프로그램을 명시한 윈도우를 여세요([알려진 한계](#window-limits) 참조) |
| `SVM module is disabled`(코드 11) | 레인이 닫혀 있습니다. 메인넷의 상태입니다 | 테스트넷을 사용하세요 |
| `svm custody cap exceeded`(코드 23) | SVM 풀이 한도에 도달했습니다 | 나중에, 또는 더 적은 금액으로 다시 시도하세요 |
| Anchor로 빌드한 프로그램의 `solana program deploy`가 프로그램의 기능 때문에 클라이언트 측에서 거부됨 | 도구가 ELF 기능을 검사합니다 | `--skip-feature-verify`를 추가하세요 |
| 윈도우 키의 업그레이드가 `solana`에서 거부됨 | 기록된 권한자는 키가 아니라 사용자의 Native 계정입니다 | 이 가이드처럼 별도의 배포자 키로 배포하세요 |
| authz, 그룹, 컨트랙트 아래에서 윈도우 열기 또는 닫기가 거부됨 | 윈도우는 사용자 본인의 서명으로만 열고 닫습니다 | 계정에서 최상위 메시지로 메시지를 보내세요 |

## 확인한 내용 {#tested}

| 확인 | 장소와 시점 | 결과 |
| ----- | -------------- | ------ |
| `GET /qorechain/svm/v1/params`와 `/cluster_info` | 실제 테스트넷, 2026년 11월 22일 | `enabled`와 `execution_enabled`가 모두 `true` |
| `getHealth`, `getVersion`, `getGenesisHash`, `getLatestBlockhash`(base58), `getMinimumBalanceForRentExemption(1024)` | 실제 테스트넷, 2026년 11월 22일 | `ok`, `1.18.0-qorechain`, 위의 제네시스 해시, 44자 base58 블록해시, 8,017,920 lamport |
| 서명 하나짜리 전송에 대한 `getFeeForMessage`와 `simulateTransaction` | 실제 테스트넷, 2026년 11월 22일 | 수수료 45,000,000 lamport(0.045 QOR). 충전되지 않은 지불자는 `InsufficientFundsForFee` |
| 키 증명 논스 경로와 윈도우 경로 | 실제 테스트넷, 2026년 11월 22일 | 논스 0, 4단계와 같은 `sign_bytes`. 윈도우가 없는 주소는 `found` `false` |
| 공개된 예시에 대한 4단계의 키 증명 스크립트 | 실제 테스트넷 경로, 2026년 11월 22일 | 표와 동일한 서명 |
| `cargo build-sbf`(4.0.0, platform tools v1.53)로 프로그램 빌드 | 로컬 컴퓨터, 2026년 11월 22일 | 18,896바이트 `hello.so` |
| 충전되지 않은 키로 `solana program deploy` 비용 추정 | 실제 테스트넷, 2026년 11월 22일 | 지출 0.133 QOR와 수수료 1.035 QOR로 클라이언트 측에서 거부됨 |
| 형식이 올바른 전송의 `sendTransaction` | 실제 테스트넷, 2026년 11월 22일 | 거부됨: `this node relays no Solana transactions` |
| 공개 엔드포인트의 웹소켓 업그레이드 | 실제 테스트넷, 2026년 11월 22일 | HTTP 405 |
| 윈도우 열기, 윈도우 키로 `solana transfer`, 배포, 호출, 업그레이드, 권한 설정, 확장, 닫기, `anchor deploy`와 업그레이드 | 릴리스 전 로컬 테스트 네트워크, `solana-cli` 4.0.2, `anchor-cli` 1.2.2, `@solana/web3.js` 1.99 | 통과 |
| 실제 테스트넷에서 같은 단계 | 실행하지 않음: 공개 게이트웨이가 2026년 11월 22일에 아무것도 릴레이하지 않았고, 이 페이지를 위해 테스트 QOR를 쓰지 않았습니다 | 실행하지 않음 |

## 메인넷 {#mainnet}

메인넷은 이 중 아무것도 없는 릴리스를 실행합니다. 그곳에서는 SVM 레인이 꺼져 있고, 공개 SVM 엔드포인트는 읽기 전용이며, 크로스 VM 호출은 일시 중지된 상태이고, 컨트랙트 업로드는 거버넌스 전용입니다. 메인넷을 상대로 윈도우를 열거나, 배포하거나, Solana 트랜잭션을 보내지 마세요. 테스트넷만을 대상으로 계획하세요.

## 함께 보기 {#see-also}

* [SVM 레인 (v3.2.8)](/developer-guide/svm-lane-v328): 레인 상태, 렌트, 커스터디 한도, SVM 지갑의 포스트 퀀텀 키.
* [SVM 개발](/developer-guide/svm-development): 레인 개요와 JSON-RPC 서버.
* [Solana 호환 JSON-RPC](/api-reference/json-rpc-solana-compatible): 메서드 목록.
* [포스트 퀀텀 서명](/developer-guide/post-quantum-signing): ML-DSA-87 키 등록과 사용.
* [EVM 인가 윈도우 레퍼런스](/developer-guide/evm-window-reference): 이더리움 방식 키를 위한 같은 개념.
* [크로스 VM 상호운용성](/developer-guide/cross-vm-interoperability): SVM, EVM, QoreChain Native 사이의 호출.
* [버전 기록](/appendix/version-history#v329): v3.2.9에서 바뀐 점.
