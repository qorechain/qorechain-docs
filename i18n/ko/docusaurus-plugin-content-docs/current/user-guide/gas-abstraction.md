---
slug: /user-guide/gas-abstraction
title: 가스 추상화
sidebar_label: 가스 추상화
sidebar_position: 7
---

# 가스 추상화

가스 추상화를 사용하면 사용자가 QOR 대신 허용된 비네이티브 토큰으로 트랜잭션 수수료를 지불할 수 있습니다. 수수료 환산 코드는 체인의 일부이지만, **현재 어느 네트워크에서도 비네이티브 토큰이 허용되지 않으므로** 모든 수수료는 QOR로 지불됩니다. 이 페이지는 현재 라이브 상태인 것, 구현된 대로의 환산 방식, 그리고 대신 해야 할 일을 설명합니다.

:::caution 아직 사용할 수 없음: 모든 수수료를 uqor로 지불하세요
2026년 10월 20일에 확인한 메인넷(**`qorechain-vladi`**, 노드 릴리스 **v3.2.3**)과 테스트넷(**`qorechain-diana`**, 노드 릴리스 **v3.2.4**)의 상태:

* 라이브 허용 토큰 목록에는 **`uqor`만** 있습니다. 수수료 환산은 v3.2.2부터 켜졌지만 다른 것은 목록에 없고, 블록당 환산 상한은 `0`(환산 꺼짐)이며 환산 플로트에는 잔액이 없습니다. 다른 단위로 지불한 수수료는 시뮬레이션에서도 실제 트랜잭션에서도 "denom not accepted for fee payment" 오류와 함께 거부됩니다.
* 두 네트워크 모두 IBC 채널이나 클라이언트가 없으므로, 수수료로 지불할 `ibc/…` 잔액이 존재할 수 없습니다.

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

## 라이브 구성 {#live-configuration}

이 모듈은 REST와 gRPC로 구성을 제공합니다. 다음은 2026년 10월 20일 두 네트워크의 값입니다.

| 필드 | 값 | 의미 |
| --- | --- | --- |
| `enabled` | `true` | 모듈 스위치 |
| `native_denom` | `uqor` | 모든 수수료가 최종적으로 지불되는 단위 |
| `accepted_tokens` | `uqor`만 | 수수료를 지불할 수 있는 토큰. `uqor`에는 가격 소스가 필요하지 않음 |
| `premium_bps` | `300` | 플로트가 가격 위험을 감당하기 위해 환산된 수수료 가치에서 떼어 두는 비율(3 %) |
| `max_tip_multiplier` | `3` | 환산된 수수료는 해당 가스의 최소 수수료의 이 배수를 초과할 수 없음. `0`이면 한도 없음 |
| `float_min` | `0` | 플로트가 항상 남겨 두는 네이티브 잔액 |
| `block_conversion_cap` | `0` | 플로트가 블록당 지급하는 최대량. `0`이면 환산이 꺼져 있음 |

이 페이지의 이전 버전에는 고정 환율의 `ibc/USDC`와 `ibc/ATOM` 자리 표시자 항목이 나와 있었습니다. 이들은 라이브 목록에 없습니다.

직접 읽어 보세요.

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate uqor
qorechaind query gasabstraction float

curl -s https://api.qore.host/qorechain/gasabstraction/v1/config
curl -s "https://api.qore.host/qorechain/gasabstraction/v1/conversion_rate?denom=uqor"
curl -s https://api.qore.host/qorechain/gasabstraction/v1/float
```

`conversion_rate`는 `rate`, `effective_rate`(프리미엄을 뺀 환율), `price_source`, 그리고 해당 토큰이 현재 높이에서 `usable`한지 여부를 보고하며, 그렇지 않으면 `reason`도 함께 보고합니다. `float`는 플로트의 주소와 잔액, 그리고 `block_cap` 대비 현재 블록의 사용량을 보고합니다. `qor_getGasAbstractionConfig` JSON-RPC 메서드는 어떤 공개 엔드포인트에서도 제공되지 않으므로([`qor_` 네임스페이스](/api-reference/json-rpc-qor_-namespace) 참조) REST 또는 gRPC를 사용하세요.

---

## 환산 작동 방식 (구현된 대로) {#how-it-works}

v3.2.2부터 수수료 디코레이터는 각 트랜잭션을 두 경로 중 하나로 보냅니다.

* `uqor`로 지불하거나 둘 이상의 단위로 지불하는 수수료는 변경 없이 **네이티브 경로**를 따릅니다.
* **정확히 하나의** 비네이티브 단위로 지불하는 수수료는 **환산 경로**를 따릅니다.

환산 경로에서는 다음과 같이 진행됩니다.

1. **허용 여부.** 해당 단위가 허용 토큰 목록에 있고 가격 소스가 있어야 하며, 그렇지 않으면 트랜잭션이 거부됩니다.
2. **가격.** 토큰의 가격은 두 가지 소스 중 하나에서 가져옵니다. 명시된 블록 높이에서 만료되는 거버넌스 설정 고정 환율, 또는 해당 토큰과 QOR을 짝짓는 [AMM](/architecture/amm) 풀의 시간 가중 평균 가격입니다. 풀 가격은 풀이 활성 상태이고, QOR 쪽에 구성된 최소 유동성 이상을 보유하며, 현물 가격이 평균 가격에서 구성된 편차 이내일 때만 사용됩니다.
3. **가치.** 수수료의 네이티브 가치는 토큰 금액에 가격을 곱한 값에서 프리미엄을 뺀 것입니다.
4. **네이티브 수수료와 동일한 규칙.** 네이티브 최소 수수료 규칙과 동적 수수료 규칙이 그 네이티브 가치에 적용되므로, 환산된 수수료는 QOR 수수료가 충족해야 하는 기준(하한으로 가스 단위당 0.1 uqor)을 그대로 충족해야 하며 `max_tip_multiplier`로 제한됩니다.
5. **정산.** 납부자의 토큰은 가스 추상화 모듈의 **플로트**로 가고, 플로트가 네이티브 가치를 `uqor`로 수수료 수집기에 지급합니다. 따라서 수수료 수집기 이후의 모든 단계(소각, 검증자, 스테이커, 트레저리, 라이트 노드 배분)는 항상 `uqor`만 보게 됩니다.

환산은 세 가지로 제한됩니다. 트랜잭션당(`max_tip_multiplier`), 블록당(`block_conversion_cap`), 그리고 플로트가 항상 남겨 두는 잔액(`float_min`)입니다. 모든 거부는 시뮬레이션 중에도 발생하므로, 가스 추정은 실제 트랜잭션과 똑같이 실패합니다.

### 토큰이 허용되도록 하기

* **거버넌스**가 `MsgUpdateConfig`로 구성을 교체합니다(권한: 거버넌스 모듈 계정). 실제 `ibc/<hash>` 수수료 토큰과 그 풀 또는 고정 환율을 추가하고 환산을 여는 방법이 바로 이것입니다.
* **플로트**는 일반 뱅크 전송을 거부하는 모듈 계정입니다. `MsgFundFloat`(`qorechaind tx gasabstraction fund-float <amount>uqor`)로 자금을 채우며, 예를 들어 이를 위해 커뮤니티 풀 지출을 받은 계정이 할 수 있습니다.

메인넷에서는 이 중 어느 것에 대해서도 제안이 이루어진 적이 없으며, 제안이 통과될 때까지 목록은 `uqor` 전용으로 유지됩니다.
