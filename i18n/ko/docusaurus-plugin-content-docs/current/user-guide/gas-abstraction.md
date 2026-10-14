---
slug: /user-guide/gas-abstraction
title: 가스 추상화
sidebar_label: 가스 추상화
sidebar_position: 7
---

# 가스 추상화

이 페이지는 사용자가 QOR 대신 허용된 비네이티브 토큰으로 트랜잭션 수수료를 지불할 수 있도록 설계된 QoreChain의 가스 추상화 기능을 설명합니다. **현재 어느 네트워크에서도 사용할 수 없습니다**. 이 페이지는 설계 내용과 대신 해야 할 일을 설명합니다.

:::caution 아직 사용할 수 없음
비네이티브 토큰으로 수수료를 지불하는 기능은 현재 메인넷(**`qorechain-vladi`**, 노드 릴리스 **v3.2.1**)과 테스트넷(**`qorechain-diana`**) 어디에서도 작동하지 **않습니다**.

* 가스 추상화 쿼리는 메인넷에서 제공되지 않습니다: `qorechaind query gasabstraction accepted-tokens`는 도움말 텍스트를 출력하고, REST 경로 `/qorechain/gasabstraction/v1/config`는 `Not Implemented`를 반환합니다.
* 두 네트워크 모두 열려 있는 IBC 채널이 없으므로, 수수료로 지불할 `ibc/USDC` 또는 `ibc/ATOM` 잔액이 존재할 수 없습니다.
* 네트워크 수수료 하한은 `uqor`로 검사되므로, 다른 단위의 수수료는 거부됩니다.

모든 수수료는 `uqor`로 지불하세요. 라이브 네트워크에서 토큰이 허용되면 이 페이지가 업데이트됩니다.
:::

---

## 현재 작동하는 방법: uqor로 수수료 지불

모든 트랜잭션은 가스 단위당 최소 **0.1 uqor**를 지불합니다. 가스 한도와 수수료를 함께 설정하세요.

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --gas 400000 --fees 40000uqor \
  --chain-id qorechain-vladi --generate-only > tx.json
```

그런 다음 [트랜잭션 명령어](/cli-reference/transaction-commands#hybrid-signing)에 설명된 대로 `qorechaind tx pqc cosign`으로 하이브리드 서명하고 브로드캐스트하세요. 트랜잭션 유형별 권장 한도는 [수수료와 가스](/cli-reference/transaction-commands#fees-and-gas)를 참조하세요.

---

## 개요

가스 추상화는 트랜잭션 수수료를 지불하기 위해 QOR를 보유해야 하는 요구 사항을 없애도록 설계되었습니다. 허용된 대체 토큰(예: IBC로 전송된 스테이블코인)을 보유한 사용자는 해당 토큰으로 수수료를 지불하게 되며, 프로토콜은 처리 전에 수수료 금액을 네이티브 등가 토큰으로 환산합니다.

---

## 의도된 설계

### 허용되는 토큰

모듈의 제네시스 구성에는 다음 토큰과 프로토콜이 정의한 환산 비율이 나열되어 있습니다. 이는 수수료 목적의 교환 비율이며 시장 가격이 아닙니다. 현재 네트워크에는 `uqor`만 존재할 수 있습니다(위의 안내 참조).

| 토큰              | 표시 단위 | 환산 비율 |
| ------------------ | ------------ | --------------- |
| **QOR**            | `uqor`       | 1.0 (네이티브)    |
| **USDC** (IBC 경유) | `ibc/USDC`   | 1.0             |
| **ATOM** (IBC 경유) | `ibc/ATOM`   | 10.0            |

### 작동하도록 의도된 방식

QoreChain의 `GasAbstractionDecorator`는 트랜잭션 처리 파이프라인에 위치합니다. 수수료가 비네이티브 표시 단위인 트랜잭션에 대해:

1. **수수료 확인** — 디코레이터가 수수료 표시 단위를 읽습니다.
2. **비율 조회** — 해당 표시 단위가 허용 토큰 목록에 있으면, 해당하는 환산 비율을 조회합니다.
3. **환산** — 수수료가 네이티브 `uqor` 등가액으로 환산됩니다.
4. **표준 처리** — 환산된 수수료가 표준 수수료 차감 핸들러를 거치므로, 이후의 수수료 처리(검증인 분배, 소각, 트레저리, 스테이커 및 라이트 노드 배분)는 네이티브 등가액을 기준으로 이루어집니다.

---

## 구성 조회

메인넷은 아직 가스 추상화 쿼리를 제공하지 않으며, `qor_getGasAbstractionConfig` JSON-RPC 메서드는 어떤 공개 엔드포인트에서도 제공되지 않습니다([`qor_` 네임스페이스](/api-reference/json-rpc-qor_-namespace) 참조). 현재 라이브 허용 토큰 목록을 읽을 수 있는 공개 방법은 없습니다.
