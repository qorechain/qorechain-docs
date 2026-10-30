---
slug: /user-guide/bridging-assets
title: 자산 브리징
sidebar_label: 자산 브리징
sidebar_position: 5
---

# 자산 브리징

이 가이드에서는 QoreChain과 다른 블록체인 네트워크 간의 자산 이동이 어떻게 동작하도록 설계되었는지 설명합니다. QoreChain의 상호운용성 계층은 **37개의 체인 구성**(외부 체인 36개와 IBC로 연결되는 Injective)과 Cosmos 생태계 체인을 위한 최대 **8개의 IBC 카운터파티**를 중심으로 구축되어 있습니다.

:::caution 어느 네트워크에서도 라이브 상태가 아닙니다
브리지 모듈은 메인넷과 테스트넷에 배포되어 있지만, **활성화된 브리지 경로는 없습니다**. 37개의 체인 구성이 모두 브리지 컨트랙트가 설정되지 않은 `pending` 상태이고, 등록된 브리지 검증자가 없으며, 생성된 브리지 작업이 한 번도 없고, 메인넷에는 IBC 채널이 존재하지 않습니다(테스트넷에는 ID가 `provider`인 체인으로 가는 단일 ICS-20 테스트 채널이 있을 뿐이며, 아래에 명시된 상대방으로 가는 채널은 없습니다). 아래 내용은 모두 의도된 설계를 설명합니다. 자산이 브리징되기를 기대하고 전송하지 마십시오. 현재 상태 표는 [브리지 아키텍처](/architecture/bridge-architecture)를 참고하십시오.
:::

:::note
아래 명령어는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**, 체인 버전 **v3.2.6**)을 사용합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 체인 버전 **v3.2.5**로 가동 중입니다(2026년 10월 29일부터). 경로가 활성화되면 **메인넷 연결** 페이지의 메인넷 체인 ID와 엔드포인트로 대체하십시오. 2026년 10월 27일에 확인한 상태: 두 네트워크 모두에서 37개의 체인 구성이 모두 `pending`입니다.
:::

---

## 연결 개요

QoreChain은 두 가지 브리징 프로토콜을 제공하도록 설계되었습니다.

| 프로토콜                                  | 연결 수                          | 사용 사례                                                                  |
| ---------------------------------------- | ------------------------------- | ------------------------------------------------------------------------ |
| **IBC**(Inter-Blockchain Communication)  | 최대 8개 채널 (열린 채널 없음)      | IBC 지원 체인과의 네이티브 상호운용성                                         |
| **QCB**(QoreChain Bridge)                | 37개 구성 (모두 pending)          | PQC 기반 검증(attestation)을 통한 비-IBC 네트워크와의 크로스체인 전송              |

모든 체인 구성의 전체 목록은 **브리지 아키텍처** 페이지에 있습니다. 이 가이드는 브리지 전송이 어떻게 동작하도록 설계되었는지에 초점을 맞춥니다.

---

## IBC

IBC는 설계의 일부이지만(Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective), **이 상대방 중 아직 연결된 곳은 없으므로**(메인넷에는 IBC 채널이나 클라이언트가 없고, 테스트넷에는 ID가 `provider`인 체인으로 가는 단일 ICS-20 테스트 채널만 있습니다. 2026년 10월 27일 확인) 이 체인들로 전송할 수 있는 대상이 없습니다. 채널이 열리면 이 페이지에 목록이 표시됩니다.

### 테스트넷의 IBC 추가 기능 (v3.2.6) {#ibc-testnet-v326}

IBC 기능 세 가지는 테스트넷에만 있으며 메인넷에는 없습니다(메인넷의 `/Stride-Labs/ibc-rate-limiting/ratelimit/ratelimits` 경로는 501로 응답합니다).

* **IBC 속도 제한.** 거버넌스는 IBC 전송에 대해 채널별 할당량(시간 단위 윈도우당 공급량의 정수 퍼센트)을 설정할 수 있습니다. **자동이 아닙니다**. 현재 설정된 제한은 없으며, 빈 집합은 무제한을 뜻합니다. 전달된 패킷은 두 채널 모두에서 차감되고 환불은 할당량을 되돌려 줍니다. 이는 [보안 모델](#security-model)에서 설명하는 브리지 서킷 브레이커와는 별개입니다.
* **패킷 포워딩.** IBC v1로 도착하는 전송은 다른 체인으로 다시 보내기 위해 `{"forward":{"receiver":"...","port":"transfer","channel":"channel-N"}}` 형태의 메모를 담을 수 있으며, 홉이 실패하면 발신자에게 환불됩니다. 재시도는 없고 홉은 기본적으로 10분 후 타임아웃됩니다. 도착 시 ERC-20으로 변환되는 토큰은 포워딩할 수 없습니다.
* **08-wasm 라이트 클라이언트.** wasm 라이트 클라이언트 바이너리의 저장, 마이그레이션, 제거는 권한자 전용이며, 허용되는 클라이언트 유형은 거버넌스가 `08-wasm`을 추가하기 전까지 표준 클라이언트만 포함합니다.

한도는 테스트넷에서 `GET /Stride-Labs/ibc-rate-limiting/ratelimit/ratelimits`로 읽으세요(현재 `{"rate_limits":[]}`).

**어느 네트워크에 무엇이 있는가(2026년 10월 27일 확인).**

| | 메인넷 `qorechain-vladi` (v3.2.5) | 테스트넷 `qorechain-diana` (v3.2.6) |
|---|---|---|
| ICS-20 전송 (IBC v1) | 내장되어 있으나 열린 채널 없음 | 내장, 채널 하나 열려 있음 |
| IBC 속도 제한 | 사용할 수 없음 (501) | 사용 가능, 설정된 제한 없음 |
| 패킷 포워딩 | 사용할 수 없음 | 사용 가능 (IBC v1만) |
| 08-wasm 라이트 클라이언트 | 사용할 수 없음 | 메시지 세트는 있으나, 거버넌스가 `08-wasm`을 허용하기 전까지 wasm 클라이언트를 만들 수 없음 |

### 테스트넷의 테스트 채널 {#ibc-test-channel}

테스트넷에는 열려 있는 transfer 채널이 하나, `channel-0`(포트 `transfer`, `connection-0`, 버전 `ics20-1`, unordered)이 있습니다. 상대방은 Cosmos Hub 테스트넷(체인 ID `provider`, 채널 `channel-600`)입니다. 테스트넷에서 확인된 IBC denom은 `channel-0`으로 도착한 `uatom` 하나이며, QoreChain은 이를 위해 모듈이 소유하는 ERC-20 쌍도 유지합니다. 다음으로 상태를 읽으세요:

```bash
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
curl -s https://api-testnet.qore.host/ibc/apps/transfer/v1/denoms
```

테스트 채널에서 전송하려면 전송 트랜잭션을 만든 다음, 다른 네이티브 레인 트랜잭션과 마찬가지로 하이브리드 서명을 추가합니다:

```bash
qorechaind tx ibc-transfer transfer transfer channel-0 <receiver_on_the_hub_testnet> 1000uqor \
  --from mykey --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > ibc.json
qorechaind tx pqc cosign ibc.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

이것은 두 테스트 네트워크 사이의 테스트 채널이며, 토큰에는 가치가 없습니다. 패킷이 전달되려면 해당 채널에서 릴레이어가 실행 중이어야 하는데, [QORel](/qorel/overview)로 직접 릴레이어를 실행할 수 있습니다. 이 매뉴얼은 QoreChain이 운영하는 릴레이어 서비스를 약속하지 않으므로 전송이 대기 상태로 남아 있을 수 있습니다. 위 명령어를 메인넷에서 사용하지 마십시오. 메인넷에는 열린 채널이 없어 트랜잭션이 실패합니다.

---

## QCB 브리지 엔드포인트

QoreChain Bridge는 다양한 생태계 유형에 걸친 외부 체인과 연결되도록 설계되었습니다. 계획된 연결의 대표적인 목록은 다음과 같습니다(현재는 모두 `pending` 상태입니다).

| 체인      | 체인 유형 |
| --------- | ---------- |
| Ethereum  | EVM        |
| BSC       | EVM        |
| Solana    | Solana     |
| Avalanche | EVM        |
| Polygon   | EVM        |
| Arbitrum  | EVM        |
| TON       | TON        |
| Sui       | Sui Move   |
| Optimism  | EVM        |
| Base      | EVM        |
| Aptos     | Aptos      |
| Bitcoin   | Bitcoin    |
| NEAR      | NEAR       |
| Cardano   | Cardano    |
| Polkadot  | Polkadot   |
| Tezos     | Tezos      |
| Tron      | Tron       |

자산 목록은 게시되지 않습니다. 체인 구성에는 아직 자산 레지스트리가 없습니다. 체인 구성의 전체 목록은 **브리지 아키텍처** 페이지를 참고하십시오.

---

## 입금 흐름 (외부 체인에서 QoreChain으로)

외부 체인에서 QoreChain으로 입금하도록 설계된 순서는 다음과 같습니다.

1. **잠금(Lock)** — 외부 체인에서 QCB 브리지 컨트랙트 또는 주소로 토큰을 전송하여 잠급니다.
2. **검증(Attestation)** — 브리지 검증자들이 잠금 트랜잭션을 관찰하고 PQC 서명된 검증(attestation)을 생성합니다.
3. **임계값(Threshold)** — 검증자 검증(attestation)이 **10개 중 7개** 모이면 브리지가 입금을 완료합니다.
4. **발행(Mint)** — 동일한 가치의 래핑된 토큰이 QoreChain에서 발행되어 사용자의 `qor1...` 주소로 지급됩니다.

사용자가 직접 실행하는 "입금 시작" 명령어는 없습니다. 외부 체인에서 잠금을 수행하면 브리지 검증자들의 검증(attestation)이 사용자의 계정에 입금을 반영합니다. (체인의 `qorechaind tx bridge deposit` 명령어는 이미 검증된 입금을 반영하며 브리지 검증자의 서명이 필요합니다. 사용자가 입금을 시작하는 방법이 아닙니다.)

---

## 출금 흐름 (QoreChain에서 외부 체인으로)

QoreChain에서 외부 체인으로 출금하도록 설계된 순서는 다음과 같습니다.

1. **소각(Burn)** — QoreChain에서 래핑된 토큰을 소각합니다.
2. **검증(Attestation)** — 브리지 검증자들이 소각을 관찰하고 PQC 서명된 검증(attestation)을 생성합니다.
3. **임계값(Threshold)** — 검증(attestation)이 **10개 중 7개** 모이면 출금이 완료됩니다.
4. **잠금 해제(Unlock)** — 원본 토큰이 외부 체인에서 지정된 대상 주소로 지급됩니다.

**CLI 명령어** (현재는 차단됨: 활성화된 체인이 없으므로 트랜잭션이 거부됩니다):

```bash
# 1. Build the unsigned transaction
qorechaind tx bridge withdraw [destination-chain] [destination-address] [asset] [amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 300000 --fees 30000uqor \
  --generate-only > withdraw.json

# 2. Attach the post-quantum co-signature and broadcast
qorechaind tx pqc cosign withdraw.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

모든 네이티브 레인 트랜잭션에는 하이브리드 포스트 양자 공동 서명과 가스 단위당 최소 0.1 uqor의 수수료가 필요합니다. [첫 트랜잭션](/getting-started/first-transaction)을 참고하십시오.

---

## 보안 모델 {#security-model}

QoreChain Bridge는 여러 방어 계층으로 보호되도록 설계되었습니다.

| 메커니즘                     | 설명                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **7-of-10 PQC 다중서명**     | 모든 브리지 작업은 10명의 브리지 검증자 중 최소 7명의 검증(attestation)을 필요로 하며, 각 검증자는 포스트 양자 암호(post-quantum cryptographic) 서명을 사용합니다.               |
| **24시간 챌린지 기간**       | 대규모 전송 임계값(100,000 QOR)을 초과하는 전송은 24시간의 챌린지 창(window)에 진입하며, 이 기간 동안 검증자나 감시자가 사기성 트랜잭션을 신고할 수 있습니다. |
| **서킷 브레이커**            | QCB 브리지를 위해 설계됨: 비정상적인 거래량이나 의심스러운 패턴이 감지되면 자동 제한 장치가 브리지 작업을 중단시키고, 작업은 수동 검토 후 재개됩니다. 이는 IBC가 아니라 QCB 브리지에 적용되며, IBC 속도 제한(테스트넷 전용)은 거버넌스가 설정하고, 자동이 아니며, 현재 설정된 제한이 없습니다. |

---

## 브리지 상태 조회

브리지의 상태를 확인합니다.

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain ethereum
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation [id]
```

동일한 데이터는 `/qorechain/bridge/v1/` 아래의 REST로도 제공됩니다([브리지 아키텍처](/architecture/bridge-architecture#rest-api-endpoints) 참고).

---

## 팁

* 대상 주소 형식이 목표 체인과 일치하는지 항상 확인하십시오(예: EVM 체인은 `0x...`, Solana는 base58).
* 대규모 전송(100,000 QOR 초과)은 24시간 챌린지 기간을 자동으로 유발하도록 설계되어 있습니다.
* 브리지 수수료는 `bridge_fee` 소각 채널을 통해 소각됩니다 ([토큰 작업](/user-guide/token-operations) 참고).
