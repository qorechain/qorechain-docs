---
slug: /cli-reference/transaction-commands
title: 트랜잭션 명령어
sidebar_label: 트랜잭션 명령어
sidebar_position: 2
---

# 트랜잭션 명령어

모든 트랜잭션 명령어는 다음 패턴을 따릅니다:

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
라이브 메인넷(체인 버전 **v3.1.82**)에 브로드캐스트하려면 `--chain-id qorechain-vladi`를 설정하고, 테스트넷의 경우 `--chain-id qorechain-diana`를 설정하세요. 생략하면 클라이언트는 로컬 설정의 `chain-id`를 사용합니다.
:::

공통 플래그는 모든 `tx` 하위 명령어에 적용됩니다:

| 플래그              | 타입   | 설명                                             |
| ------------------- | ------ | ----------------------------------------------- |
| `--from`            | string | 서명 키의 이름 또는 주소                        |
| `--chain-id`        | string | 체인 식별자 (기본값: 설정에서 가져옴)           |
| `--fees`            | string | 트랜잭션 수수료 (예: `500uqor`)                 |
| `--gas`             | string | 가스 한도 또는 추정을 위한 `auto`               |
| `--gas-adjustment`  | float  | `auto` 사용 시 가스 배수 (기본값: 1.0)          |
| `--keyring-backend` | string | 키링 백엔드: `os`, `file`, `test`               |
| `--node`            | string | RPC 엔드포인트 (기본값: `tcp://localhost:26657`) |
| `--broadcast-mode`  | string | `sync`, `async` 또는 `block`                    |
| `-y`                | bool   | 확인 프롬프트 건너뛰기                          |

---

## bank

### send

한 계정에서 다른 계정으로 토큰을 전송합니다.

```bash
qorechaind tx bank send <from_address> <to_address> <amount> [flags]
```

---

## staking

### create-validator

네트워크에 새 밸리데이터를 생성합니다.

```bash
qorechaind tx staking create-validator [flags]
```

| 플래그                         | 타입   | 설명                                         |
| ------------------------------ | ------ | -------------------------------------------- |
| `--amount`                     | string | 자기 위임 수량 (예: `1000000uqor`)           |
| `--pubkey`                     | string | 밸리데이터 컨센서스 공개 키 (JSON)           |
| `--moniker`                    | string | 밸리데이터 표시 이름                         |
| `--commission-rate`            | string | 초기 커미션 비율 (예: `0.10`)                |
| `--commission-max-rate`        | string | 최대 커미션 비율                             |
| `--commission-max-change-rate` | string | 일일 최대 커미션 변경 비율                   |
| `--min-self-delegation`        | string | 필요한 최소 자기 위임량                      |

### edit-validator

기존 밸리데이터의 설명 또는 커미션을 수정합니다.

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

밸리데이터에게 토큰을 위임합니다.

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

위임을 한 밸리데이터에서 다른 밸리데이터로 이동합니다.

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

밸리데이터로부터 토큰을 언본딩합니다.

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

---

## distribution

### withdraw-all-rewards

대기 중인 모든 스테이킹 보상을 인출합니다.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

특정 밸리데이터로부터 보상을 인출합니다.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| 플래그         | 타입 | 설명                              |
| -------------- | ---- | --------------------------------- |
| `--commission` | bool | 밸리데이터 커미션도 함께 인출     |

---

## gov

### submit-proposal

거버넌스 제안을 제출합니다.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

제안 파일은 제안 유형, 제목, 설명 및 실행할 메시지를 지정하는 JSON 문서입니다.

### vote

활성 제안에 투표합니다.

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

투표 옵션: `yes`, `no`, `abstain`, `no_with_veto`.

### deposit

제안에 보증금을 추가합니다.

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc

Cosmos 트랜잭션 경로는 기본적으로 하이브리드 서명을 요구합니다(`hybrid_signature_mode = required`). `gen-key` 및 `cosign` 명령어는 클래식 secp256k1 서명과 함께 cosmos 경로에서 트랜잭션을 수행하는 데 필요한 Dilithium-5 (ML-DSA-87) 키와 `PQCHybridSignature` 확장을 생성합니다.

### gen-key

하이브리드 서명을 위한 Dilithium-5 (ML-DSA-87) 포스트퀀텀 키를 생성합니다.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

트랜잭션에 Dilithium-5 공동 서명을 `PQCHybridSignature` 확장으로 첨부하여 하이브리드(secp256k1 + ML-DSA-87) 트랜잭션을 생성합니다. 기본 `required` 강제 모드에서 cosmos 경로 트랜잭션에 필수입니다. 표준 CosmJS / 릴레이어 툴링은 트랜잭션을 수행하려면 이 확장을 생성해야 하며, QoreChain SDK의 `buildHybridTx`(`includePqcPublicKey` 포함)가 이와 동등한 작업을 수행합니다.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

계정에 대한 포스트퀀텀 공개 키를 등록합니다.

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

확장 메타데이터 및 증명(attestation)과 함께 PQC 키를 등록합니다.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| 플래그          | 타입   | 설명                           |
| --------------- | ------ | ------------------------------ |
| `--attestation` | string | TEE 증명 데이터 (hex)          |
| `--metadata`    | string | 추가 키 메타데이터 (JSON)      |

### migrate-key

기존 클래식 키를 하이브리드 PQC 키 쌍으로 마이그레이션합니다.

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

---

## xqore

### lock

QOR 토큰을 xQORE 거버넌스 스테이킹 포지션에 잠급니다.

```bash
qorechaind tx xqore lock <amount> [flags]
```

| 플래그            | 타입   | 설명                                       |
| ----------------- | ------ | ------------------------------------------ |
| `--lock-duration` | string | 잠금 기간 (예: `30d`, `90d`, `180d`)       |

### unlock

xQORE를 다시 QOR로 잠금 해제합니다. 조기 잠금 해제는 페널티 등급에 따라 페널티가 발생할 수 있습니다.

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

외부 체인으로부터의 브리지 입금을 시작합니다.

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| 플래그        | 타입   | 설명                           |
| ------------- | ------ | ------------------------------ |
| `--recipient` | string | QoreChain의 수신자 주소        |

### withdraw

외부 체인으로의 브리지 출금을 시작합니다.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

### update-chain-config

단일 서명 트랜잭션으로 체인의 브리지를 활성화하거나 재구성합니다(체인 버전 **v3.1.80**부터 사용 가능). `bridge_admin` 키 또는 `qcb_bridge` 라이선스가 필요하며, 거버넌스 제안이나 체인 업그레이드는 필요하지 않습니다. 컨트랙트 주소, 컨펌 수, 아키텍처 및 상태를 설정합니다.

```bash
qorechaind tx bridge update-chain-config <chain_id> [flags] --from bridge-admin
```

### set-verifier-bootstrap

체인의 활성 검증자(verifier)를 선택하고 해당 신뢰 루트를 설치합니다(마찬가지로 `bridge_admin` 권한이 필요합니다).

```bash
qorechaind tx bridge set-verifier-bootstrap <chain_id> <verifier> [flags] --from bridge-admin
```

---

## crossvm

### call

실행 환경(EVM, CosmWasm, SVM) 간에 크로스 VM 메시지를 전송합니다.

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| 플래그        | 타입   | 설명                                 |
| ------------- | ------ | ------------------------------------ |
| `--source-vm` | string | 소스 VM: `evm`, `cosmwasm`, `svm`    |
| `--gas-limit` | uint   | 크로스 VM 실행을 위한 가스 한도      |

### process-queue

대기 중인 크로스 VM 메시지를 수동으로 처리합니다(운영자 명령어).

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

SVM 런타임에 BPF 프로그램을 배포합니다.

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| 플래그         | 타입   | 설명                             |
| -------------- | ------ | -------------------------------- |
| `--program-id` | string | 선택적 프로그램 ID (base58)      |

### execute

배포된 SVM 프로그램에서 인스트럭션을 실행합니다.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| 플래그       | 타입   | 설명                                                  |
| ------------ | ------ | ----------------------------------------------------- |
| `--accounts` | string | 인스트럭션에 사용할 쉼표로 구분된 계정 공개 키 목록   |

### create-account

할당된 데이터 공간을 가진 새 SVM 계정을 생성합니다.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| 플래그    | 타입   | 설명                                                 |
| --------- | ------ | ---------------------------------------------------- |
| `--owner` | string | 소유자 프로그램 (base58, 기본값: 시스템 프로그램)    |

---

## multilayer

### register-sidechain

새 사이드체인 레이어를 등록합니다.

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| 플래그                  | 타입   | 설명                                                  |
| ----------------------- | ------ | ----------------------------------------------------- |
| `--block-time-ms`       | uint   | 목표 블록 시간(ms) (기본값 2000)                      |
| `--domains`             | string | 쉼표로 구분된 지원 도메인 (기본값 `defi`)             |
| `--max-tx`              | uint   | 블록당 최대 트랜잭션 수 (기본값 1000)                 |
| `--min-validators`      | uint32 | 최소 밸리데이터 세트 크기 (기본값 1)                  |
| `--settlement-interval` | uint   | 블록 단위 정산 간격 (기본값 100)                      |
| `--vm-types`            | string | 쉼표로 구분된 지원 VM 타입 (기본값 `evm`)             |

### register-paychain

고빈도 마이크로트랜잭션을 위한 새 페이체인 레이어를 등록합니다.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| 플래그                  | 타입 | 설명                                        |
| ----------------------- | ---- | -------------------------------------------- |
| `--max-tx`              | uint | 블록당 최대 트랜잭션 수 (기본값 5000)       |
| `--settlement-interval` | uint | 블록 단위 정산 간격 (기본값 50)             |

### anchor-state

등록된 레이어에 대한 상태 앵커(정산)를 제출합니다.

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

트랜잭션을 최적의 레이어로 라우팅합니다.

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| 플래그           | 타입   | 설명                                 |
| ---------------- | ------ | ------------------------------------ |
| `--target-layer` | string | 특정 레이어로 강제 라우팅            |

### update-layer-status

레이어의 운영 상태를 업데이트합니다(운영자 전용).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

상태 값: `active`, `paused`, `draining`.

### challenge-anchor

상태 앵커에 대한 사기 이의(fraud challenge)를 제출합니다.

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

Rollup Development Kit에 새 롤업을 등록합니다.

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| 플래그              | 타입   | 설명                                                    |
| ------------------- | ------ | ------------------------------------------------------- |
| `--settlement-type` | string | `optimistic`, `zk`, `pessimistic`, `sovereign`          |
| `--profile`         | string | 프리셋: `defi`, `gaming`, `nft`, `enterprise`, `custom` |
| `--stake`           | string | 운영자 스테이크 수량                                    |
| `--da-enabled`      | bool   | 네이티브 데이터 가용성 활성화                           |

### submit-batch

롤업에 대한 정산 배치를 제출합니다.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

정산 배치에 대한 사기 이의를 제출합니다(옵티미스틱 롤업).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

이의 제기 기간이 지난 배치를 수동으로 확정합니다.

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

롤업을 일시 중지합니다(운영자 전용).

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

일시 중지된 롤업을 재개합니다(운영자 전용).

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

롤업을 영구적으로 중지하고 스테이크를 해제합니다(운영자 전용).

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
롤업 출금 및 크로스 레이어 정산도 `rdk` 트랜잭션 그룹 아래에 노출됩니다(예: 확정된 배치에 대해 증명된 출금을 정산하는 `execute-withdrawal` 명령어). 정확한 인수와 플래그는 롤업의 정산 유형과 DA 구성에 따라 다르므로, 이러한 트랜잭션을 구성하기 전에 **Rollup Development Kit** 문서에서 공식 명령어 목록을 확인하세요.
:::

---

## babylon

### submit-btc-checkpoint

에포크에 대한 BTC 체크포인트를 제출합니다.

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Babylon 통합을 통해 BTC를 리스테이킹합니다.

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| 플래그          | 타입   | 설명                                 |
| --------------- | ------ | ------------------------------------ |
| `--btc-tx-hash` | string | 증거로 사용할 비트코인 트랜잭션 해시 |

---

## abstractaccount

### create

프로그래밍 가능한 지출 규칙을 가진 추상 계정(abstract account)을 생성합니다.

```bash
qorechaind tx abstractaccount create [flags]
```

| 플래그             | 타입   | 설명                                 |
| ------------------ | ------ | ------------------------------------ |
| `--spending-rules` | string | 지출 규칙을 정의하는 JSON 파일       |

### update-spending-rules

기존 추상 계정의 지출 규칙을 업데이트합니다.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

---

## rlconsensus

PRISM은 컨센서스 파라미터를 조정하는 강화학습 레이어입니다. 이 명령어들은 PRISM 에이전트를 제어하며, CLI 모듈 이름 `rlconsensus`와 그 하위 명령어들은 원문 그대로 유지됩니다.

### set-agent-mode

PRISM 에이전트의 운영 모드를 설정합니다(거버넌스 전용).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

모드 값: `0` (꺼짐), `1` (관찰), `2` (제안), `3` (자동).

### resume-agent

서킷 브레이커 발동 후 PRISM 에이전트를 재개합니다.

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

PRISM 에이전트 정책 구성을 업데이트합니다(거버넌스 전용).

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

PRISM 에이전트의 보상 가중치 구성을 업데이트합니다.

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| 플래그                | 타입   | 설명                          |
| --------------------- | ------ | ----------------------------- |
| `--throughput-weight` | string | 처리량 보상에 대한 가중치     |
| `--latency-weight`    | string | 지연 시간 보상에 대한 가중치  |
| `--security-weight`   | string | 보안 보상에 대한 가중치       |
