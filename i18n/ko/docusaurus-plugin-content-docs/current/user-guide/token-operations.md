---
slug: /user-guide/token-operations
title: 토큰 작업
sidebar_label: 토큰 작업
sidebar_position: 1
---

# 토큰 작업

이 가이드에서는 QOR 토큰, 토큰 송수신 방법, 잔액 조회, 그리고 QoreChain의 수수료 분배 모델에 대해 다룹니다.

:::note
아래 명령은 **`qorechain-diana`** 테스트넷(EVM chain ID **9800**)을 사용합니다. 메인넷(**`qorechain-vladi`**, EVM chain ID **9801**)은 체인 버전 **v3.1.77**로 2026년 6월 7일부터 가동 중입니다. 메인넷에서 거래할 때는 **메인넷 연결** 페이지의 메인넷 chain ID 및 엔드포인트로 대체하세요.
:::

## 토큰 정보

| 속성                      | 값                            |
| ------------------------ | ----------------------------- |
| **표시 단위**             | QOR                           |
| **기본 단위**             | uqor                          |
| **환산**                  | 1 QOR = 1,000,000 uqor (10^6) |
| **Chain ID**             | `qorechain-vladi` (메인넷) / `qorechain-diana` (테스트넷) |
| **Bech32 접두사**         | `qor` (예: `qor1abc...xyz`)    |

모든 온체인 금액은 **uqor** 단위로 표시됩니다. 거래를 제출할 때는 항상 금액을 uqor 단위로 지정하세요.

## 토큰 전송

한 계정에서 다른 계정으로 QOR 토큰을 전송하려면:

```bash
qorechaind tx bank send <from_address> <to_address> <amount>uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**예시:** 다른 주소로 5 QOR (5,000,000 uqor) 전송:

```bash
qorechaind tx bank send qor1sender... qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

송신자에 대해 원시 주소 대신 키 이름을 사용할 수도 있습니다:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

## 잔액 조회

모든 계정의 잔액을 확인합니다:

```bash
qorechaind query bank balances <address>
```

**예시:**

```bash
qorechaind query bank balances qor1abc...xyz
```

**샘플 출력:**

```yaml
balances:
- amount: "15000000"
  denom: uqor
pagination:
  next_key: null
  total: "0"
```

이는 해당 계정이 15 QOR (15,000,000 uqor)를 보유하고 있음을 나타냅니다.

## 수수료 구조

QoreChain의 거래 수수료는 네트워크 인센티브를 정렬하기 위해 다섯 곳으로 분배됩니다:

| 분배처          | 비율  | 목적                                                            |
| --------------- | ----- | --------------------------------------------------------------- |
| **검증인**      | 37%   | 블록 생성자에게 보상하고 네트워크를 보호합니다                    |
| **소각**        | 30%   | 공급량에서 영구적으로 제거되어 디플레이션 압력을 만듭니다          |
| **트레저리**    | 20%   | 프로토콜 개발과 생태계 보조금에 자금을 지원합니다                 |
| **스테이커**    | 10%   | 모든 위임자에게 비례하여 분배됩니다                              |
| **라이트 노드** | 3%    | 네트워크 데이터를 제공하는 라이트 노드 운영자에게 보상합니다       |

## 소각 채널

QoreChain은 다중 채널 소각 메커니즘을 구현합니다. QOR 토큰은 10개의 개별 채널을 통해 유통에서 영구적으로 제거됩니다:

| 채널                  | 설명                                                                |
| -------------------- | ------------------------------------------------------------------- |
| `tx_fee`             | 모든 거래 수수료의 30% 소각 부분                                      |
| `governance_penalty` | 거버넌스 제안이 정족수에 도달하지 못하거나 거부될 때 소각              |
| `slashing_burn`      | 슬래싱된 검증인 스테이크의 소각 부분                                  |
| `bridge_fee`         | 크로스체인 브리지 전송 시 소각되는 수수료                             |
| `spam_deterrent`     | 스팸으로 표시된 거래에 적용되는 추가 소각                             |
| `epoch_excess`       | 에포크 경계에서 목표를 초과한 발행량 소각                             |
| `manual_burn`        | 거버넌스 제안을 통한 커뮤니티 주도 토큰 소각                          |
| `contract_callback`  | 스마트 컨트랙트 콜백 실행 시 소각되는 수수료                          |
| `cross_vm_fee`       | 크로스 VM (예: EVM에서 CosmWasm) 호출 실행 시 소각                    |
| `rollup_create`      | 새 롤업 배포 시 최소 스테이크의 1% 소각                               |

모든 채널에 걸친 총 소각 금액을 조회할 수 있습니다:

```bash
qorechaind query bank total --denom uqor
```

## 팁

:::caution
토큰을 전송하기 전에 항상 수신자 주소를 다시 확인하세요. QoreChain의 거래는 되돌릴 수 없습니다.
:::

:::tip

* `--dry-run` 플래그를 사용하면 거래를 브로드캐스트하지 않고 시뮬레이션할 수 있습니다.
* `--gas auto`를 사용하면 노드가 거래에 필요한 가스를 추정하도록 할 수 있습니다.
* 표준 전송의 최소 수수료는 **500 uqor**입니다.

:::
