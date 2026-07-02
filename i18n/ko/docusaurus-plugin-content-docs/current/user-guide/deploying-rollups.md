---
slug: /user-guide/deploying-rollups
title: 롤업 배포
sidebar_label: 롤업 배포
sidebar_position: 6
---

# 롤업 배포

이 가이드는 Rollup Development Kit(RDK)를 사용하여 QoreChain에 애플리케이션별 롤업을 배포하는 방법을 다룹니다. RDK는 일반적인 사용 사례를 위한 프리셋 프로필과 고급 배포를 위한 완전한 사용자 정의를 제공합니다.

:::caution
RDK와 롤업 정산 계층은 활발히 발전 중인 기능입니다. 아래의 매개변수, 프리셋, 그리고 개별 기능의 성숙도는 변경될 수 있는 것으로 취급하고, 메인넷을 대상으로 하기 전에 **`qorechain-diana`**에서 배포를 검증하세요.
:::

:::note
아래 명령어는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 사용합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 체인 버전 **v3.1.82**을 실행하며 2026년 6월 7일부터 가동 중입니다 — 메인넷에 배포할 때는 **메인넷 연결** 페이지의 메인넷 체인 ID와 엔드포인트로 대체하세요.
:::

---

## 개요

QoreChain RDK는 개발자가 QoreChain에서 정산되는 소버린 롤업을 출시할 수 있게 합니다. 각 롤업은 자체 블록 타임, 가상 머신, 그리고 수수료 모델을 갖춘 독립적인 실행 환경이며, QoreChain의 보안과 데이터 가용성 보장을 상속합니다.

---

## 프리셋 프로필

RDK는 다섯 가지 프리셋 프로필을 제공하며, 각각 일반적인 애플리케이션 카테고리에 맞게 조정되어 있습니다:

| 프로필         | 정산 (증명)         | 시퀀서   | DA              | 가스 모델     | VM       | 의도된 사용 사례 |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicated | native          | EIP-1559     | EVM      | DeFi/AMM 애플리케이션(대출, DEX, 파생상품) |
| **gaming**     | based               | based     | native          | flat         | custom   | 고처리량 게임 상태 및 실시간 경험 |
| **nft**        | optimistic (fraud)  | dedicated | native (Celestia DA 예정) | standard | CosmWasm | NFT 발행 및 마켓플레이스 워크로드 |
| **enterprise** | based               | based     | native          | subsidized   | EVM      | 후원 수수료를 갖춘 권한형 및 컨소시엄 배포 |
| **custom**     | 완전 매개변수화      | 완전 매개변수화 | 완전 매개변수화 | 완전 매개변수화 | 완전 매개변수화 | 모든 필드를 직접 설정 |

:::note
위의 프리셋별 값은 제공되는 `@qorechain/rdk` 프로필 기본값과 일치합니다. 정확한 구성은 RDK가 성숙함에 따라 변경될 수 있습니다 — 권위 있는 값은 `qorechaind query rdk config`(또는 `RdkClient.params()`)로 조회하고, `based` 정산은 항상 `based` 시퀀서 모드와 짝을 이룬다는 점에 유의하세요.
:::

---

## 요구 사항

롤업을 배포하기 전에 다음 요구 사항을 충족하는지 확인하세요:

| 요구 사항          | 세부 정보                                                                               |
| ----------------- | -------------------------------------------------------------------------------------- |
| **최소 스테이크**  | 10,000 QOR (10,000,000,000 uqor)                                                       |
| **생성 소각**      | 스테이크된 금액의 1%가 롤업 생성 시 영구적으로 소각됩니다                                  |
| **계정**          | 스테이크와 트랜잭션 수수료에 충분한 잔액을 갖춘 자금이 충전된 QoreChain 계정              |

---

## 프리셋으로 롤업 생성하기

프리셋 프로필 중 하나를 사용하여 롤업을 배포하세요:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-defi-rollup" \
  --profile defi \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**예시:** 게이밍 롤업 배포:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "battle-arena" \
  --profile gaming \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 커스텀 롤업 생성하기

롤업 매개변수를 완전히 제어하려면 `custom` 프로필을 사용하고 각 옵션을 지정하세요:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-rollup" \
  --profile custom \
  --settlement optimistic \
  --sequencer dedicated \
  --da-backend native \
  --vm-type evm \
  --block-time 1000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**커스텀 매개변수:**

| 매개변수       | 옵션                                          | 설명                               |
| -------------- | --------------------------------------------- | ---------------------------------- |
| `--settlement` | `optimistic`, `zk`, `based`, `sovereign`      | 상태 전환이 검증되는 방식           |
| `--sequencer`  | `dedicated`, `shared`, `based`                | 트랜잭션 순서 지정 전략             |
| `--da-backend` | `native`, `external`                          | 데이터 가용성 계층                 |
| `--vm-type`    | `evm`, `cosmwasm`, `custom`                   | 실행 환경                          |
| `--block-time` | 정수 (밀리초)                                  | 목표 블록 생성 간격                |

---

## 배치 제출

롤업 운영자는 정산을 위해 트랜잭션 배치를 QoreChain에 제출합니다:

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root <hex_encoded_state_root> \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**예시:**

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root a1b2c3d4e5f6... \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 롤업 라이프사이클 관리

롤업 운영자는 배포의 라이프사이클을 관리할 수 있습니다:

1. **롤업 일시정지** — 블록 생성을 일시적으로 중단합니다. 롤업 상태는 보존되며 재개할 수 있습니다.

   ```bash
   qorechaind tx rdk pause-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

2. **롤업 재개** — 일시정지된 롤업에서 블록 생성을 재개합니다:

   ```bash
   qorechaind tx rdk resume-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

3. **롤업 중지 (영구)** — 롤업을 영구적으로 중지합니다. 이 작업은 **되돌릴 수 없습니다**.

   ```bash
   qorechaind tx rdk stop-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

:::danger
롤업 중지는 영구적입니다. 관련된 모든 상태는 아카이브되지만 롤업은 재시작할 수 없습니다. 스테이크된 QOR(생성 소각분 제외)은 운영자에게 반환됩니다.
:::

---

## 롤업 조회

특정 롤업에 대한 세부 정보를 가져옵니다:

```bash
qorechaind query rdk rollup <rollup_id>
```

QoreChain의 모든 롤업을 나열합니다:

```bash
qorechaind query rdk rollups
```

**샘플 출력:**

```yaml
rollup:
  id: "my-defi-rollup"
  owner: qor1abc...xyz
  profile: defi
  settlement: zk
  vm_type: evm
  block_time: 500ms
  status: active
  total_batches: 1247
  last_state_root: "a1b2c3d4..."
```

---

## QCAI 지원 프로필 추천

어떤 프로필이 사용 사례에 맞는지 확실하지 않으신가요? QCAI 지원 추천 도구를 사용하세요:

```bash
qorechaind query rdk suggest-profile --use-case "defi lending protocol"
```

**샘플 출력:**

```yaml
suggested_profile: defi
confidence: 0.94
reasoning: "DeFi lending protocols benefit from ZK settlement for fast finality, EVM compatibility for Solidity smart contracts, and EIP-1559 fee model for predictable gas costs."
alternative_profile: enterprise
```

이 명령어는 사용자의 설명을 분석하고 설명과 함께 가장 적합한 프리셋 프로필을 추천합니다.

---

## 팁

* 프리셋 프로필로 시작하고 나중에 사용자 정의하세요. 프리셋은 대상 사용 사례에 맞게 최적화되어 있습니다.
* 1% 생성 소각은 배포 시점에 최소 스테이크에 적용되는 일회성 비용입니다.
* QoreChain 검증자가 시퀀싱을 처리하는 가장 간단한 설정을 원한다면 `based` 정산을 사용하세요.
* 배치 제출을 면밀히 모니터링하세요. 배치 제출의 공백은 네트워크의 경고를 트리거할 수 있습니다.
* `suggest-profile` 명령어는 유용한 출발점이지만, 추천을 특정 요구 사항과 비교하여 검토하세요.
