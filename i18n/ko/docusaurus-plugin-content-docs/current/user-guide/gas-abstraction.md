---
slug: /user-guide/gas-abstraction
title: 가스 추상화
sidebar_label: 가스 추상화
sidebar_position: 7
---

# 가스 추상화

이 가이드는 사용자가 QOR 대신 비네이티브 토큰으로 트랜잭션 수수료를 지불할 수 있게 하는 QoreChain의 가스 추상화 기능을 다룹니다.

:::note
아래 명령어는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 사용합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 체인 버전 **v3.1.77**을 실행하며 2026년 6월 7일부터 가동 중입니다 — 메인넷에서 트랜잭션을 수행할 때는 **메인넷 연결** 페이지의 메인넷 체인 ID와 엔드포인트로 대체하세요.
:::

---

## 개요

가스 추상화는 트랜잭션 수수료를 지불하기 위해 QOR 토큰을 보유해야 하는 요구 사항을 제거합니다. 허용된 대체 토큰(예: IBC로 전송된 USDC 또는 ATOM)을 보유한 사용자는 이러한 토큰을 직접 수수료 지불 수단으로 사용할 수 있습니다. 프로토콜은 처리 전에 수수료 금액을 네이티브 등가물로 자동 변환합니다.

---

## 허용 토큰

다음 토큰이 수수료 지불에 허용됩니다:

| 토큰               | 명칭         | 변환 비율       | 예시 수수료          |
| ------------------ | ------------ | --------------- | -------------------- |
| **QOR**            | `uqor`       | 1.0 (네이티브)  | `--fees 500uqor`     |
| **USDC** (IBC 경유) | `ibc/USDC`   | 1.0             | `--fees 500ibc/USDC` |
| **ATOM** (IBC 경유) | `ibc/ATOM`   | 10.0            | `--fees 50ibc/ATOM`  |

:::note
변환 비율은 시장 가격이 아니라 프로토콜에 정의된 교환 비율을 반영합니다. ATOM의 비율 10.0은 수수료 목적상 ibc/ATOM 1단위가 uqor 10단위에 해당함을 의미합니다.
:::

---

## 작동 방식

QoreChain의 `GasAbstractionDecorator`는 트랜잭션 처리 파이프라인에 통합되어 있습니다. 트랜잭션이 비네이티브 명칭으로 수수료를 포함할 때 다음이 발생합니다:

1. **수수료 검사** — 데코레이터가 트랜잭션에 지정된 수수료 명칭을 확인합니다.
2. **비율 조회** — 명칭이 허용 토큰 목록에 있으면 프로토콜이 해당 변환 비율을 조회합니다.
3. **변환** — 변환 비율을 사용하여 수수료 금액이 네이티브 uqor 등가물로 변환됩니다.
4. **표준 처리** — 변환된 수수료가 표준 `DeductFee` 핸들러로 전달되어 발신자의 계정에서 차감됩니다. 변환은 트랜잭션 파이프라인의 나머지 부분에 대해 투명합니다. 모든 다운스트림 수수료 처리(검증자 분배, 소각, 트레저리 할당, 스테이커 보상, 라이트 노드 보상)는 네이티브 uqor 등가물에 대해 작동합니다.

---

## 사용 예시

### USDC로 수수료 지불

USDC로 수수료를 지불하여 토큰 전송을 보냅니다:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500ibc/USDC
```

USDC는 변환 비율이 1.0이므로 500 ibc/USDC는 500 uqor와 동등합니다.

### ATOM으로 수수료 지불

ATOM으로 수수료를 지불하여 토큰 전송을 보냅니다:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 50ibc/ATOM
```

ATOM은 변환 비율이 10.0이므로 50 ibc/ATOM은 500 uqor와 동등합니다.

---

## 허용 토큰 조회

현재 가스 추상화에 허용되는 토큰 목록과 변환 비율을 가져옵니다:

```bash
qorechaind query gasabstraction accepted-tokens
```

**샘플 출력:**

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

JSON-RPC를 통해 통합하는 애플리케이션의 경우, 가스 추상화 구성을 조회하세요:

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

* 가스 추상화는 아직 QOR를 보유하지 않았을 수 있는 다른 생태계에서 온보딩하는 사용자에게 이상적입니다.
* 변환 비율은 거버넌스에 의해 설정되며 매개변수 변경 제안을 통해 업데이트될 수 있습니다.
* 여러 허용 토큰을 보유한 경우, 어떤 트랜잭션 유형에서든 그중 어느 것이든 수수료에 사용할 수 있습니다.
* `--fees`에 지정된 실제 토큰이 계정에서 차감됩니다. 변환은 수수료가 최소 요구 사항을 충족하는지 검증하는 데만 사용됩니다.

:::
