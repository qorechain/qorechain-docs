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
라이브 메인넷(체인 버전 **v3.1.77**)에 브로드캐스트하려면 `--chain-id qorechain-vladi`를, 테스트넷의 경우 `--chain-id qorechain-diana`를 설정하세요. 생략하면 클라이언트는 로컬 구성의 `chain-id`를 사용합니다.
:::

공통 플래그는 모든 `tx` 하위 명령어에 적용됩니다:

| 플래그              | 유형   | 설명                                            |
| ------------------- | ------ | ----------------------------------------------- |
| `--from`            | string | 서명 키의 이름 또는 주소                         |
| `--chain-id`        | string | 체인 식별자(기본값: 구성에서)                    |
| `--fees`            | string | 트랜잭션 수수료(예: `500uqor`)                   |
| `--gas`             | string | 가스 한도 또는 견적을 위한 `auto`                |
| `--gas-adjustment`  | float  | `auto` 사용 시 가스 배수(기본값: 1.0)            |
| `--keyring-backend` | string | 키링 백엔드: `os`, `file`, `test`               |
| `--node`            | string | RPC 엔드포인트(기본값: `tcp://localhost:26657`)  |
| `--broadcast-mode`  | string | `sync`, `async`, 또는 `block`                   |
| `-y`                | bool   | 확인 프롬프트 건너뛰기                           |

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

네트워크에 새 검증자를 생성합니다.

```bash
qorechaind tx staking create-validator [flags]
```

| 플래그                          | 유형   | 설명                                         |
| ------------------------------ | ------ | -------------------------------------------- |
| `--amount`                     | string | 자기 위임 금액(예: `1000000uqor`)            |
| `--pubkey`                     | string | 검증자 합의 공개 키(JSON)                     |
| `--moniker`                    | string | 검증자 표시 이름                             |
| `--commission-rate`            | string | 초기 수수료율(예: `0.10`)                     |
| `--commission-max-rate`        | string | 최대 수수료율                                |
| `--commission-max-change-rate` | string | 최대 일일 수수료 변경률                       |
| `--min-self-delegation`        | string | 필요한 최소 자기 위임                         |

### edit-validator

기존 검증자의 설명 또는 수수료를 편집합니다.

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

검증자에게 토큰을 위임합니다.

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

한 검증자에서 다른 검증자로 위임을 이동합니다.

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

검증자에게서 토큰을 언본딩합니다.

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

특정 검증자로부터 보상을 인출합니다.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| 플래그         | 유형 | 설명                               |
| -------------- | ---- | ---------------------------------- |
| `--commission` | bool | 검증자 수수료도 함께 인출           |

---

## gov

### submit-proposal

거버넌스 제안을 제출합니다.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

제안 파일은 제안 유형, 제목, 설명, 실행할 메시지를 지정하는 JSON 문서입니다.

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

cosmos 트랜잭션 경로는 기본적으로 하이브리드 서명을 요구합니다(`hybrid_signature_mode = required`). `gen-key` 및 `cosign` 명령어는 고전적인 secp256k1 서명과 함께 cosmos 경로에서 트랜잭션하는 데 필요한 Dilithium-5(ML-DSA-87) 키와 `PQCHybridSignature` 확장을 생성합니다.

### gen-key

하이브리드 서명을 위한 Dilithium-5(ML-DSA-87) 포스트 양자 키를 생성합니다.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

트랜잭션에 `PQCHybridSignature` 확장으로 Dilithium-5 공동 서명을 첨부하여 하이브리드(secp256k1 + ML-DSA-87) 트랜잭션을 생성합니다. 기본 `required` 강제 모드에서 cosmos 경로 트랜잭션에 필요합니다. 표준 CosmJS / 릴레이어 도구는 트랜잭션하려면 이 확장을 생성해야 합니다. QoreChain SDK의 `buildHybridTx`(`includePqcPublicKey` 포함)가 동등한 작업을 수행합니다.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

계정에 대한 포스트 양자 공개 키를 등록합니다.

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

확장된 메타데이터 및 증명(attestation)과 함께 PQC 키를 등록합니다.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| 플래그          | 유형   | 설명                            |
| --------------- | ------ | ------------------------------ |
| `--attestation` | string | TEE 증명 데이터(hex)            |
| `--metadata`    | string | 추가 키 메타데이터(JSON)        |

### migrate-key

기존 고전 키를 하이브리드 PQC 키 쌍으로 마이그레이션합니다.

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

| 플래그            | 유형   | 설명                                       |
| ----------------- | ------ | ------------------------------------------ |
| `--lock-duration` | string | 잠금 기간(예: `30d`, `90d`, `180d`)        |

### unlock

xQORE를 다시 QOR로 잠금 해제합니다. 조기 잠금 해제는 페널티 티어에 따라 페널티가 발생할 수 있습니다.

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

외부 체인에서 브리지 입금을 시작합니다.

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| 플래그        | 유형   | 설명                            |
| ------------- | ------ | ------------------------------ |
| `--recipient` | string | QoreChain의 수령자 주소         |

### withdraw

외부 체인으로 브리지 출금을 시작합니다.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

---

## crossvm

### call

실행 환경(EVM, CosmWasm, SVM) 간에 크로스 VM 메시지를 보냅니다.

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| 플래그        | 유형   | 설명                                 |
| ------------- | ------ | ------------------------------------ |
| `--source-vm` | string | 소스 VM: `evm`, `cosmwasm`, `svm`    |
| `--gas-limit` | uint   | 크로스 VM 실행을 위한 가스 한도       |

### process-queue

대기 중인 크로스 VM 메시지를 수동으로 처리합니다(운영자 명령어).

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

BPF 프로그램을 SVM 런타임에 배포합니다.

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| 플래그         | 유형   | 설명                         |
| -------------- | ------ | ---------------------------- |
| `--program-id` | string | 선택적 프로그램 ID(base58)    |

### execute

배포된 SVM 프로그램에서 명령어(instruction)를 실행합니다.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| 플래그       | 유형   | 설명                                                |
| ------------ | ------ | --------------------------------------------------- |
| `--accounts` | string | 명령어를 위한 쉼표로 구분된 계정 공개 키             |

### create-account

할당된 데이터 공간을 가진 새 SVM 계정을 생성합니다.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| 플래그    | 유형   | 설명                                            |
| --------- | ------ | ----------------------------------------------- |
| `--owner` | string | 소유자 프로그램(base58, 기본값: 시스템 프로그램) |

---

## multilayer

### register-sidechain

새 사이드체인 레이어를 등록합니다.

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| 플래그                   | 유형   | 설명                                                |
| ----------------------- | ------ | --------------------------------------------------- |
| `--block-time-ms`       | uint   | 목표 블록 시간(ms 단위, 기본값 2000)                |
| `--domains`             | string | 쉼표로 구분된 지원 도메인(기본값 `defi`)            |
| `--max-tx`              | uint   | 블록당 최대 트랜잭션 수(기본값 1000)                |
| `--min-validators`      | uint32 | 최소 검증자 집합 크기(기본값 1)                     |
| `--settlement-interval` | uint   | 정산 간격(블록 단위, 기본값 100)                    |
| `--vm-types`            | string | 쉼표로 구분된 지원 VM 유형(기본값 `evm`)            |

### register-paychain

고빈도 마이크로트랜잭션을 위한 새 페이체인 레이어를 등록합니다.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| 플래그                   | 유형 | 설명                                         |
| ----------------------- | ---- | -------------------------------------------- |
| `--max-tx`              | uint | 블록당 최대 트랜잭션 수(기본값 5000)         |
| `--settlement-interval` | uint | 정산 간격(블록 단위, 기본값 50)              |

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

| 플래그           | 유형   | 설명                              |
| ---------------- | ------ | --------------------------------- |
| `--target-layer` | string | 특정 레이어로 라우팅 강제          |

### update-layer-status

레이어의 운영 상태를 업데이트합니다(운영자 전용).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

상태 값: `active`, `paused`, `draining`.

### challenge-anchor

상태 앵커에 대한 사기 이의 제기를 제출합니다.

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

롤업 개발 키트로 새 롤업을 등록합니다.

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| 플래그              | 유형   | 설명                                                |
| ------------------- | ------ | ---------------------------------------------------- |
| `--settlement-type` | string | `optimistic`, `zk`, `pessimistic`, `sovereign`       |
| `--profile`         | string | 사전 설정: `defi`, `gaming`, `nft`, `enterprise`, `custom` |
| `--stake`           | string | 운영자 스테이크 금액                                 |
| `--da-enabled`      | bool   | 네이티브 데이터 가용성 활성화                        |

### submit-batch

롤업에 대한 정산 배치를 제출합니다.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

정산 배치에 대한 사기 이의 제기를 제출합니다(optimistic 롤업).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

이의 제기 기간을 통과한 배치를 수동으로 최종화합니다.

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
롤업 인출 및 교차 레이어 정산도 `rdk` 트랜잭션 그룹에서 노출됩니다(예: 최종화된 배치에 대해 증명된 인출을 정산하는 `execute-withdrawal` 명령어). 정확한 인수와 플래그는 롤업의 정산 유형 및 DA 구성에 따라 다릅니다. 이러한 트랜잭션을 구성하기 전에 권위 있는 명령어 표면에 대해 **롤업 개발 키트** 문서를 참조하세요.
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

| 플래그          | 유형   | 설명                              |
| --------------- | ------ | --------------------------------- |
| `--btc-tx-hash` | string | 증명으로서의 비트코인 트랜잭션 해시 |

---

## abstractaccount

### create

프로그래밍 가능한 지출 규칙을 가진 추상 계정을 생성합니다.

```bash
qorechaind tx abstractaccount create [flags]
```

| 플래그              | 유형   | 설명                              |
| ------------------ | ------ | --------------------------------- |
| `--spending-rules` | string | 지출 규칙을 정의하는 JSON 파일     |

### update-spending-rules

기존 추상 계정의 지출 규칙을 업데이트합니다.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

---

## rlconsensus

PRISM은 합의 매개변수를 튜닝하는 강화 학습 레이어입니다. 이 명령어들은 PRISM 에이전트를 제어합니다. CLI 모듈 이름 `rlconsensus`와 그 하위 명령어는 그대로 보존됩니다.

### set-agent-mode

PRISM 에이전트 운영 모드를 설정합니다(거버넌스 전용).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

모드 값: `0`(off), `1`(observe), `2`(suggest), `3`(auto).

### resume-agent

서킷 브레이커 작동 후 PRISM 에이전트를 재개합니다.

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

| 플래그                 | 유형   | 설명                         |
| --------------------- | ------ | ---------------------------- |
| `--throughput-weight` | string | 처리량 보상에 대한 가중치     |
| `--latency-weight`    | string | 지연 시간 보상에 대한 가중치  |
| `--security-weight`   | string | 보안 보상에 대한 가중치       |
