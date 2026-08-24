---
slug: /user-guide/gas-abstraction
title: 가스 추상화
sidebar_label: 가스 추상화
sidebar_position: 7
---

# 가스 추상화

이 가이드는 사용자가 QOR가 아닌 다른 토큰으로 트랜잭션 수수료를 지불할 수 있게 해주는 QoreChain의 가스 추상화 기능을 다룹니다.

:::note
아래 명령어는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 기준으로 합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 2026년 6월 7일부터 체인 버전 **v3.1.92**로 가동 중입니다 — 메인넷에서 트랜잭션을 처리할 때는 **Connecting to Mainnet** 페이지에 나온 메인넷 체인 ID와 엔드포인트로 대체하세요.
:::

---

## 개요

가스 추상화는 트랜잭션 수수료를 지불하기 위해 QOR 토큰을 보유해야 하는 요구 사항을 없애줍니다. 허용된 대체 토큰(예: IBC로 전송된 USDC 또는 ATOM)을 보유한 사용자는 해당 토큰을 수수료 지불에 직접 사용할 수 있습니다. 프로토콜은 처리 전에 수수료 금액을 자동으로 네이티브 등가 토큰으로 환산합니다.

---

## 허용되는 토큰

수수료 지불에 허용되는 토큰은 다음과 같습니다.

| 토큰              | 표시 단위 | 환산 비율 | 수수료 예시          |
| ------------------ | ------------ | --------------- | -------------------- |
| **QOR**            | `uqor`       | 1.0 (네이티브)    | `--fees 500uqor`     |
| **USDC** (IBC 경유) | `ibc/USDC`   | 1.0             | `--fees 500ibc/USDC` |
| **ATOM** (IBC 경유) | `ibc/ATOM`   | 10.0            | `--fees 50ibc/ATOM`  |

:::note
환산 비율은 시장 가격이 아니라 프로토콜이 정의한 교환 비율을 반영합니다. ATOM의 비율 10.0은 수수료 목적상 ibc/ATOM 1단위가 uqor 10단위와 동일함을 의미합니다.
:::

---

## 작동 방식

QoreChain의 `GasAbstractionDecorator`는 트랜잭션 처리 파이프라인에 통합되어 있습니다. 트랜잭션에 네이티브가 아닌 표시 단위의 수수료가 포함되면 다음 과정이 진행됩니다.

1. **수수료 확인** — 디코레이터가 트랜잭션에 지정된 수수료 표시 단위를 확인합니다.
2. **비율 조회** — 해당 표시 단위가 허용 토큰 목록에 있으면, 프로토콜이 해당하는 환산 비율을 조회합니다.
3. **환산** — 수수료 금액이 환산 비율을 사용해 네이티브 uqor 등가액으로 환산됩니다.
4. **표준 처리** — 환산된 수수료가 표준 `DeductFee` 핸들러로 전달되어 발신자 계정에서 차감됩니다. 이 환산 과정은 나머지 트랜잭션 파이프라인에는 투명하게 처리됩니다. 이후의 모든 수수료 처리(검증인 분배, 소각, 트레저리 배분, 스테이커 보상, 라이트 노드 보상)는 네이티브 uqor 등가액을 기준으로 이루어집니다.

---

## 사용 예시

### USDC로 수수료 지불하기

USDC로 수수료를 지불하며 토큰 전송을 실행합니다.

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500ibc/USDC
```

USDC의 환산 비율은 1.0이므로, 500 ibc/USDC는 500 uqor와 동일합니다.

### ATOM으로 수수료 지불하기

ATOM으로 수수료를 지불하며 토큰 전송을 실행합니다.

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 50ibc/ATOM
```

ATOM의 환산 비율은 10.0이므로, 50 ibc/ATOM은 500 uqor와 동일합니다.

---

## 허용 토큰 조회하기

가스 추상화에 현재 허용되는 토큰 목록과 그 환산 비율을 조회합니다.

```bash
qorechaind query gasabstraction accepted-tokens
```

**출력 예시:**

```yaml
accepted_tokens:
- denom: uqor
  conversion_rate: "1.000000000000000000"
- denom: ibc/USDC
  conversion_rate: "1.000000000000000000"
- denom: ibc/ATOM
  conversion_rate: "10.000000000000000000"
```

---

## JSON-RPC 접근

JSON-RPC로 연동하는 애플리케이션의 경우, 가스 추상화 설정을 다음과 같이 조회합니다.

```
qor_getGasAbstractionConfig
```

**요청:**

```json
{
  "jsonrpc": "2.0",
  "method": "qor_getGasAbstractionConfig",
  "params": [],
  "id": 1
}
```

**응답:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "accepted_tokens": [
      { "denom": "uqor", "conversion_rate": "1.0" },
      { "denom": "ibc/USDC", "conversion_rate": "1.0" },
      { "denom": "ibc/ATOM", "conversion_rate": "10.0" }
    ]
  }
}
```

---

:::tip

* 가스 추상화는 아직 QOR를 보유하지 않은, 다른 생태계에서 온보딩하는 사용자에게 이상적입니다.
* 환산 비율은 거버넌스에 의해 설정되며, 매개변수 변경 제안을 통해 업데이트될 수 있습니다.
* 허용된 토큰을 여러 개 보유하고 있다면, 어떤 종류의 트랜잭션에도 그중 어느 것이든 수수료로 사용할 수 있습니다.
* `--fees`에 지정된 실제 토큰이 계정에서 차감됩니다. 환산은 수수료가 최소 요건을 충족하는지 검증하는 용도로만 사용됩니다.

:::
