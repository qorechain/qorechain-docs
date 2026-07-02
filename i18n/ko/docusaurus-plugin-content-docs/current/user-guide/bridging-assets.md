---
slug: /user-guide/bridging-assets
title: 자산 브리징
sidebar_label: 자산 브리징
sidebar_position: 5
---

# 자산 브리징

이 가이드는 QoreChain과 다른 블록체인 네트워크 간에 자산을 이동하는 방법을 다룹니다. QoreChain의 상호운용성 계층은 이종 네트워크를 위한 **37개의 QCB(QoreChain Bridge) 구성**(QoreChain 루프백 포함)과 Cosmos 생태계 체인을 위한 **8개의 IBC 채널**로 구성됩니다.

:::caution
크로스체인 브리지는 현재 **테스트넷 / 사전 프로덕션** 단계에 있습니다. 연결 가용성, 지원 자산, 그리고 종결성 매개변수는 변경될 수 있으며 프로덕션 준비가 된 것으로 취급해서는 안 됩니다. 모든 전송에 의존하기 전에 **`qorechain-diana`**에서 검증하세요.
:::

:::note
아래 명령어는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 사용합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 체인 버전 **v3.1.82**을 실행하며 2026년 6월 7일부터 가동 중입니다 — 브리지 지원이 활성화된 곳에서는 **메인넷 연결** 페이지의 메인넷 체인 ID와 엔드포인트로 대체하세요.
:::

---

## 연결 개요

QoreChain은 두 가지 브리징 프로토콜을 제공합니다:

| 프로토콜                                   | 연결                | 사용 사례                                                                  |
| ---------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| **IBC** (Inter-Blockchain Communication) | 8개 채널           | IBC 지원 체인과의 네이티브 상호운용성                                       |
| **QCB** (QoreChain Bridge)               | 37개 구성          | PQC로 보호된 검증을 통한 비IBC 네트워크와의 크로스체인 전송                  |

모든 QCB 구성과 IBC 채널의 전체 목록은 **Bridge Architecture** 페이지에 있습니다. 이 가이드는 일상적인 브리징 사용에 중점을 둡니다.

---

## IBC 채널

다음 IBC 지원 체인들이 QoreChain과 채널을 구축했습니다:

| 체인                  | 채널        | 상태   |
| -------------------- | ----------- | ------ |
| Cosmos Hub           | `channel-0` | 활성   |
| Osmosis              | `channel-1` | 활성   |
| Noble                | `channel-2` | 활성   |
| Celestia             | `channel-3` | 활성   |
| Stride               | `channel-4` | 활성   |
| Akash                | `channel-5` | 활성   |
| Babylon              | `channel-6` | 활성   |
| QoreChain (루프백)    | `channel-7` | 활성   |

IBC 전송은 표준 `ibc-transfer` 모듈을 사용합니다:

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <recipient> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## QCB 브리지 엔드포인트

QoreChain Bridge는 여러 생태계 유형에 걸친 외부 체인에 연결됩니다. 지원되는 네트워크의 대표적인 선택:

| 체인      | 체인 유형  | 지원 자산        |
| --------- | ---------- | ---------------- |
| Ethereum  | EVM        | ETH, USDC, WBTC  |
| BSC       | EVM        | BNB, USDC        |
| Solana    | Solana     | SOL, USDC        |
| Avalanche | EVM        | AVAX, USDC       |
| Polygon   | EVM        | MATIC, USDC      |
| Arbitrum  | EVM        | ETH, ARB, USDC   |
| TON       | TON        | TON              |
| Sui       | Sui Move   | SUI              |
| Optimism  | EVM        | ETH, USDC, OP    |
| Base      | EVM        | ETH, USDC        |
| Aptos     | Aptos      | APT, USDC        |
| Bitcoin   | Bitcoin    | BTC              |
| NEAR      | NEAR       | NEAR, USDC       |
| Cardano   | Cardano    | ADA              |
| Polkadot  | Polkadot   | DOT              |
| Tezos     | Tezos      | XTZ              |
| Tron      | Tron       | TRX, USDT        |

QCB 구성의 전체 목록과 현재 롤아웃 상태는 **Bridge Architecture** 페이지를 참조하세요.

---

## 입금 흐름 (외부 체인에서 QoreChain으로)

외부 체인에서 QoreChain으로 자산을 입금하는 것은 다음 순서를 따릅니다:

1. **잠금** — QCB 브리지 컨트랙트나 주소로 토큰을 전송하여 외부 체인에서 토큰을 잠급니다.
2. **검증** — 브리지 검증자들이 잠금 트랜잭션을 관찰하고 PQC로 서명된 검증을 생성합니다.
3. **임계값** — **10개 중 7개**의 검증자 검증이 수집되면 브리지가 입금을 최종 처리합니다.
4. **발행** — 동등한 래핑된 토큰이 QoreChain에서 발행되어 사용자의 `qor1...` 주소로 입금됩니다.

**CLI 명령어:**

```bash
qorechaind tx bridge deposit \
  --chain ethereum \
  --amount 1000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 출금 흐름 (QoreChain에서 외부 체인으로)

QoreChain에서 외부 체인으로 자산을 출금하기:

1. **소각** — QoreChain에서 래핑된 토큰을 소각합니다.
2. **검증** — 브리지 검증자들이 소각을 관찰하고 PQC로 서명된 검증을 생성합니다.
3. **임계값** — **10개 중 7개**의 검증이 수집되면 출금이 최종 처리됩니다.
4. **잠금 해제** — 원본 토큰이 지정된 목적지 주소로 외부 체인에서 해제됩니다.

**CLI 명령어:**

```bash
qorechaind tx bridge withdraw \
  --chain ethereum \
  --amount 1000000 \
  --to 0xYourEthereumAddress \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## 보안 모델

QoreChain Bridge는 여러 방어 계층으로 보호됩니다:

| 메커니즘                       | 설명                                                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **7-of-10 PQC 다중서명**      | 모든 브리지 작업은 10개 중 최소 7개의 브리지 검증자로부터 검증을 요구하며, 각각 양자내성 암호화 서명을 사용합니다.                                        |
| **24시간 이의제기 기간**       | 구성 가능한 임계값을 초과하는 출금은 검증자나 감시자가 사기성 트랜잭션을 표시할 수 있는 24시간 이의제기 창에 진입합니다.                                   |
| **서킷 브레이커**              | 비정상적인 거래량이나 의심스러운 패턴이 감지되면 자동 속도 제한기가 브리지 작업을 중단시킵니다. 브리지 작업은 수동 검토 후 재개됩니다.                     |

---

## 브리지 상태 조회

대기 중인 브리지 작업의 상태를 확인하세요:

```bash
qorechaind query bridge pending-deposits --address <your_qor_address>
```

```bash
qorechaind query bridge pending-withdrawals --address <your_qor_address>
```

활성 브리지 연결을 모두 나열하세요:

```bash
qorechaind query bridge connections
```

---

## 팁

* 브리지 입금은 일반적으로 필요한 10개 중 7개 검증이 수집되면 몇 분 이내에 최종 처리됩니다.
* 대규모 출금은 24시간 이의제기 기간을 자동으로 트리거합니다. 시간에 민감한 전송은 미리 계획하세요.
* 목적지 주소 형식이 대상 체인과 일치하는지 항상 확인하세요(예: EVM 체인은 `0x...`, Solana는 base58).
* IBC 전송은 네이티브 프로토콜 수준 통신을 사용하므로 일반적으로 QCB 전송보다 빠릅니다.
* 브리지 수수료는 `bridge_fee` 소각 채널을 통해 소각됩니다([토큰 운영](/user-guide/token-operations) 참조).
