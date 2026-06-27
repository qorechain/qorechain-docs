---
slug: /architecture/btc-restaking-babylon
title: BTC 리스테이킹 (Babylon)
sidebar_label: BTC 리스테이킹 (Babylon)
sidebar_position: 11
---

# BTC 리스테이킹 (Babylon)

`x/babylon` 모듈은 QoreChain을 Babylon Protocol과 통합하여 비트코인의 작업 증명 확정성 보장을 상속받습니다. BTC 리스테이킹을 통해 QoreChain은 비트코인 프로토콜 자체에 어떤 변경도 요구하지 않으면서 비트코인의 해시레이트로 뒷받침되는 보조 확정성 계층을 얻습니다.

## 개요

Babylon Protocol은 지분 증명 체인이 타임스탬핑 및 체크포인팅 메커니즘을 통해 비트코인의 보안을 활용할 수 있게 합니다. QoreChain의 통합은 다음과 같이 작동합니다:

1. **BTC 스테이커**가 Babylon 스테이킹 트랜잭션에 비트코인을 잠그고 QoreChain에 자신의 포지션을 등록합니다.
2. QoreChain의 **에포크 체크포인트**가 주기적으로 Babylon에 릴레이되며, Babylon은 이를 비트코인에 타임스탬핑합니다.
3. **확정성 상속**: QoreChain 에포크가 비트코인에 체크포인팅되면, 해당 에포크가 다루는 상태는 비트코인의 작업 증명 확정성 보장을 상속받습니다.

이는 QoreChain 자체의 검증자 집합에만 의존하지 않고 비트코인의 누적 해시레이트에 앵커링된, 장거리 공격과 이중 서명에 대한 방어를 제공합니다.

## BTC 스테이킹 포지션

사용자는 비트코인 스테이킹 트랜잭션을 참조하는 `MsgBTCRestake` 트랜잭션을 제출하여 QoreChain에 BTC 스테이킹 포지션을 등록할 수 있습니다.

### 등록 요건

| 파라미터                | 값                           | 설명                                              |
| ----------------------- | ---------------------------- | ------------------------------------------------- |
| **최소 스테이크**       | 100,000 사토시 (0.001 BTC)   | 스테이킹 포지션당 필요한 최소 BTC                 |
| **언본딩 기간**         | 144 BTC 블록 (\~1일)         | 스테이킹된 BTC를 인출하기 전 대기 기간            |
| **체크포인트 간격**     | 10 QoreChain 에포크마다      | 상태가 Babylon에 체크포인팅되는 빈도              |

### 스테이킹 포지션 구조

각 BTC 스테이킹 포지션은 다음 온체인 상태를 추적합니다:

| 필드               | 설명                                                            |
| ------------------ | --------------------------------------------------------------- |
| `staker_address`   | 스테이커의 QoreChain 주소 (`qor1...`)                          |
| `btc_tx_hash`      | 스테이킹 트랜잭션의 비트코인 트랜잭션 해시                     |
| `amount_satoshis`  | 사토시 단위로 스테이킹된 BTC 양                                |
| `status`           | 포지션 생명주기 상태: `active`, `unbonding`, 또는 `withdrawn`  |
| `staked_at`        | 포지션 등록 타임스탬프                                          |
| `unbonding_height` | 언본딩이 시작된 블록 높이 (해당되는 경우)                      |
| `validator_addr`   | 이 스테이크가 위임된 QoreChain 검증자 주소                     |

### 등록 흐름

1. **BTC 스테이킹 트랜잭션 생성** — 비트코인 네트워크에서 BTC 스테이킹 트랜잭션을 생성합니다.
2. **QoreChain에서 MsgBTCRestake 제출** — QoreChain에서 `btc_tx_hash`, `amount`, `validator`와 함께 `MsgBTCRestake`를 제출합니다.
3. **포지션 기록됨** — 포지션이 "active"로 온체인에 기록됩니다.

## 에포크 체크포인트

QoreChain의 에포크 상태 루트는 Babylon 릴레이 체인을 통해 주기적으로 비트코인에 체크포인팅됩니다.

### 체크포인트 흐름

1. **체크포인트 제출** — QoreChain 검증자가 에포크 번호, BTC 블록 해시, BTC 블록 높이, QoreChain 상태 루트를 포함하는 `MsgSubmitBTCCheckpoint`를 제출합니다.
2. **IBC 릴레이** — 체크포인트 데이터가 IBC를 통해 Babylon 체인으로 릴레이됩니다.
3. **비트코인에 타임스탬핑** — Babylon이 체크포인트를 비트코인 트랜잭션에 포함하여 QoreChain의 상태를 비트코인 블록체인에 앵커링합니다.
4. **확인** — 비트코인 트랜잭션이 확인되면 확정성이 Babylon을 통해 QoreChain으로 다시 흘러갑니다.
5. **확정** — 체크포인트 상태가 `pending`에서 `confirmed`로, 다시 `finalized`로 전환됩니다.

### 체크포인트 구조

| 필드               | 설명                                                     |
| ------------------ | -------------------------------------------------------- |
| `epoch_num`        | 체크포인팅되는 QoreChain 에포크 번호                     |
| `btc_block_hash`   | 체크포인트를 포함하는 비트코인 블록 해시                 |
| `btc_block_height` | 비트코인 블록 높이                                       |
| `state_root`       | 에포크 경계에서의 QoreChain 상태 루트                    |
| `submitted_at`     | 체크포인트 제출 타임스탬프                               |
| `status`           | 체크포인트 상태: `pending`, `confirmed`, 또는 `finalized` |

### 에포크 스냅샷

각 체크포인트 경계에서 에포크 스냅샷이 집계된 네트워크 상태를 캡처합니다:

| 필드               | 설명                                             |
| ------------------ | ------------------------------------------------ |
| `total_staked`     | 모든 포지션에 걸쳐 스테이킹된 총 BTC (사토시)    |
| `active_positions` | 활성 스테이킹 포지션 수                          |
| `validator_count`  | BTC 기반 위임을 가진 검증자 수                   |
| `block_height`     | 스냅샷 시점의 QoreChain 블록 높이                |

## 보조 확정성 계층

Babylon 통합은 QoreChain의 네이티브 합의 확정성을 보완하는 **보조 확정성 보장**을 제공합니다:

| 확정성 계층    | 출처                       | 속도         | 보안                                    |
| -------------- | -------------------------- | ------------ | --------------------------------------- |
| **기본**       | QoreChain 합의 엔진        | \~5초        | QOR 스테이크 + PQC 서명으로 뒷받침      |
| **보조**       | Babylon + Bitcoin          | \~60분       | 비트코인의 누적 해시레이트로 뒷받침     |

보조 계층은 특히 다음에 유용합니다:

* **장거리 공격 방지**: 공격자가 상당한 QOR 스테이크를 축적하더라도, 비트코인에 체크포인팅된 이력을 다시 쓸 수 없습니다.
* **크로스체인 브리지 보안**: 큰 가치를 수반하는 브리지 작업은 자금을 해제하기 전에 비트코인 수준의 확정성을 기다릴 수 있습니다.
* **기관 신뢰**: 비트코인 타임스탬프는 QoreChain 상태 이력에 대한 독립적으로 검증 가능한 증명을 제공합니다.

## 구성

| 파라미터              | 기본값           | 설명                                      |
| --------------------- | ---------------- | ----------------------------------------- |
| `enabled`             | `false`          | BTC 리스테이킹 기능의 마스터 스위치       |
| `min_stake_amount`    | 100,000 사토시   | 스테이킹 포지션당 최소 BTC                |
| `unbonding_period`    | 144 BTC 블록     | BTC 표기 언본딩 기간                      |
| `checkpoint_interval` | 10 에포크        | Babylon 체크포인트 사이의 에포크          |
| `babylon_chain_id`    | `bbn-1`          | 연결된 Babylon 네트워크의 체인 ID         |

## 이벤트

모듈은 다음 온체인 이벤트를 발생시킵니다:

| 이벤트 유형              | 속성                                     | 설명                                           |
| ------------------------ | ---------------------------------------- | ---------------------------------------------- |
| `btc_restake`            | staker, btc\_tx\_hash, amount, validator | 새 BTC 스테이킹 포지션 등록됨                   |
| `btc_unbond`             | staker, amount                           | BTC 스테이킹 포지션이 언본딩에 진입함          |
| `btc_checkpoint`         | epoch, checkpoint\_id                    | 에포크 체크포인트가 Babylon에 제출됨           |
| `babylon_epoch_complete` | epoch                                    | 비트코인 타임스탬프로 Babylon 에포크 확정됨    |

## API 엔드포인트

### REST

| 메서드 | 엔드포인트                       | 설명                                     |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | 주소에 대한 BTC 스테이킹 포지션 가져오기 |
| GET    | `/babylon/v1/checkpoint/{epoch}` | 특정 에포크에 대한 체크포인트 데이터 가져오기 |
| GET    | `/babylon/v1/params`             | 모듈 구성 파라미터 가져오기              |

### JSON-RPC

| 메서드                      | 파라미터           | 설명                                                            |
| --------------------------- | ------------------ | ---------------------------------------------------------------- |
| `qor_getBTCStakingPosition` | `address` (문자열) | 주어진 QoreChain 주소에 대한 BTC 스테이킹 포지션을 반환          |

## CLI 명령어

### 쿼리 명령어

```bash
# Query BTC restaking configuration
qorechaind query babylon config

# Query a staking position by address
qorechaind query babylon position <staker-address>
```

### 트랜잭션 명령어

```bash
# Register a BTC restaking position
qorechaind tx babylon restake \
  --btc-tx-hash <hash> \
  --amount-satoshis <amount> \
  --validator <qorvaloper1...> \
  --from <key-name>

# Submit a BTC checkpoint
qorechaind tx babylon submit-checkpoint \
  --epoch <epoch-number> \
  --btc-block-hash <hash> \
  --btc-block-height <height> \
  --state-root <root> \
  --from <key-name>
```
