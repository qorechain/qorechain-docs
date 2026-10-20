---
slug: /user-guide/governance
title: 거버넌스
sidebar_label: 거버넌스
sidebar_position: 3
---

# 거버넌스

이 가이드는 QoreChain에서 온체인 거버넌스가 작동하는 방식을 다루며, 여기에는 투표가 집계되는 방식, 제안 제출 방법, 그리고 투표 방법이 포함됩니다.

:::note
아래 명령어는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 사용합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 2026년 6월 7일부터 가동 중이며 릴리스 **v3.2.3**을 실행합니다. 테스트넷은 **v3.2.4**를 실행합니다 — 메인넷에서 거버넌스에 참여할 때는 **메인넷 연결** 페이지의 메인넷 체인 ID와 엔드포인트로 대체하세요.
:::

:::caution `tx pqc cosign`으로 서명하기
메인넷과 테스트넷은 모든 Cosmos 레인 트랜잭션에 하이브리드 양자 내성 서명을 요구하므로, 이 페이지의 명령어는 그대로는 브로드캐스트되지 않습니다. 명령어에 `--generate-only > tx.json`을 추가한 다음 `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`를 실행하세요. [하이브리드 서명](/cli-reference/transaction-commands#hybrid-signing)을 참조하세요.
:::

---

## 투표권 {#voting-power}

제안은 **본딩된 스테이크**를 기준으로 집계됩니다. 본딩된 검증자에게 위임한 QOR 1개는 승수 없이 투표권 1단위로 계산됩니다. 직접 투표하지 않으면 위임이 검증자의 투표를 따르며, 직접 투표하면 해당 스테이크에 대해서는 그 투표가 우선합니다. 제안은 다음 조건이 모두 충족될 때 통과됩니다.

| 규칙      | 현재 값    | 의미                                                                          |
| --------- | ---------- | ----------------------------------------------------------------------------- |
| 정족수    | 33.4%      | 투표해야 하는 본딩된 스테이크의 비율                                          |
| 임계값    | 50%        | 통과에 필요한, 기권하지 않은 투표 중 "yes"의 비율                             |
| 거부권    | 33.4%      | "no with veto"가 이 비율에 도달하면 제안은 거부되고 예치금은 소각됩니다       |

이 값들은 2026년 10월 20일에 메인넷에서 읽은 것이며(테스트넷도 동일합니다), 거버넌스가 값을 변경할 수 있으므로 `qorechaind query gov params`로 확인하세요.

:::note QDRW는 설계되어 있으나 활성화되어 있지 않습니다
QoreChain의 설계에는 큰 스테이크를 완화하고 평판에 가중치를 부여하는 **QDRW(Quadratic Delegation-Reputation Weighted)** 투표권 공식 `VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)`이 포함되어 있습니다. 이 공식은 `x/qca` 모듈에 구현되어 있지만 두 네트워크 모두에서 **꺼져 있으며**(`qorechaind query qca config`에서 `qdrw_enabled`가 `false`), 거버넌스 집계에 포함되지 않으므로 현재 어떤 투표에도 영향을 주지 않습니다. xQORE 역시 아직 출시되지 않았습니다([xQORE 스테이킹](/user-guide/xqore-staking) 참조).
:::

---

## 제안 제출

모든 QOR 보유자는 거버넌스 제안을 제출할 수 있습니다. 제안이 투표 기간에 진입하려면 최소 예치금이 필요합니다.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**제안 파일 예시** (`proposal.json`). 제안은 통과 시 거버넌스 모듈이 실행하는 메시지 목록에 제목, 요약, 예치금을 더한 것입니다. 이 예시는 최대 검증자 수를 100에서 150으로 늘립니다. `authority`는 거버넌스 모듈 계정입니다(`qorechaind query auth module-account gov`):

```json
{
  "messages": [
    {
      "@type": "/cosmos.staking.v1beta1.MsgUpdateParams",
      "authority": "qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3",
      "params": {
        "unbonding_time": "1814400s",
        "max_validators": 150,
        "max_entries": 7,
        "historical_entries": 10000,
        "bond_denom": "uqor",
        "min_commission_rate": "0.000000000000000000"
      }
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Increase maximum validator count",
  "summary": "Raise the active validator set from 100 to 150 to improve decentralization.",
  "expedited": false
}
```

`MsgUpdateParams`는 매개변수 집합 전체를 교체하므로, `qorechaind query staking params`에서 현재 값을 복사한 뒤 변경하려는 필드만 수정하세요. 텍스트 전용(신호용) 제안은 `"messages": []`를 사용합니다. `qorechaind tx gov draft-proposal`은 기본 골격을 생성합니다.

---

## 제안 투표

제안이 투표 기간에 진입하면 스테이킹 중인 누구나 투표할 수 있습니다:

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**투표 옵션:**

| 옵션           | 설명                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `yes`          | 제안 찬성                                                                                                |
| `no`           | 제안 반대                                                                                                |
| `abstain`      | 입장을 취하지 않고 제안을 인지했음을 표시                                                                |
| `no_with_veto` | 제안에 반대하며 애초에 제출되지 말았어야 한다는 의사를 표시(임계값 충족 시 예치금 소각)                  |

**예시:**

```bash
qorechaind tx gov vote 1 yes \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

---

## 제안 유형

제안은 통과 시 실행되는 0개 이상의 메시지를 담습니다. 일반적인 경우는 다음과 같습니다:

| 유형                 | 설명                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **텍스트**           | 메시지가 없고 자동 온체인 실행이 없는 신호용 제안입니다. 커뮤니티 여론 확인에 사용됩니다.       |
| **매개변수 변경**    | 거버넌스 모듈 계정이 보내는 모듈의 `MsgUpdateParams` 메시지입니다. 해당 모듈의 매개변수 집합 전체를 교체합니다. |
| **소프트웨어 업그레이드** | 지정된 블록 높이에서 진행할 조율된 체인 업그레이드를 예약하는 `MsgSoftwareUpgrade` 메시지입니다. |
| **커뮤니티 지출**    | 커뮤니티 풀에서 수신자 주소로 자금을 보내는 `MsgCommunityPoolSpend` 메시지입니다.               |
| **긴급(Expedited)**  | `"expedited": true`로 설정하면 더 짧은 투표 기간, 더 높은 예치금과 통과 임계값이 적용됩니다(아래 참조). |

---

## 제안 조회

모든 제안 목록 조회:

```bash
qorechaind query gov proposals
```

ID로 특정 제안 조회:

```bash
qorechaind query gov proposal <proposal_id>
```

제안에 대한 현재 투표 집계 확인:

```bash
qorechaind query gov tally <proposal_id>
```

제안에 대한 본인의 투표 확인:

```bash
qorechaind query gov vote <proposal_id> <voter_address>
```

---

## 거버넌스 매개변수

현재 거버넌스 매개변수 조회:

```bash
qorechaind query gov params
```

주요 매개변수는 다음과 같습니다:

| 매개변수             | 설명                                                             | 현재 값 (2026년 10월 20일) |
| -------------------- | ---------------------------------------------------------------- | -------------------------- |
| `min_deposit`        | 제안이 투표에 진입하기 위해 필요한 최소 예치금                   | 10 QOR (`10000000uqor`)    |
| `max_deposit_period` | 최소 예치금에 도달해야 하는 시간 창                              | 2일                        |
| `voting_period`      | 제안이 활성화된 후 진행되는 투표 기간의 길이                     | 2일                        |
| `quorum`             | 유효한 투표로 인정되기 위한 최소 참여율                          | 0.334                      |
| `threshold`          | 통과에 필요한 최소 "yes" 비율(기권 제외)                         | 0.5                        |
| `veto_threshold`     | 제안을 거부하고 예치금을 소각하기 위한 최소 "no with veto" 비율  | 0.334                      |
| `expedited_voting_period` / `expedited_threshold` / `expedited_min_deposit` | 긴급 제안의 투표 기간, 통과 임계값, 예치금 | 1일 / 0.667 / 50 QOR |

---

## 지금까지의 메인넷 거버넌스 {#mainnet-history}

메인넷 거버넌스는 매개변수 변경, 서킷 브레이커 결정, 조율된 업그레이드에 사용되어 왔으며, 2026년 10월부터는 체인이 v3.2.0 업그레이드 시점에 기록해 둔 금액을 해제하는 데에도 사용되었습니다. 제안 7~11은 2026년 10월에 메인넷에서 통과되었고 제안 12는 이 글을 작성하는 시점에 투표 기간 중이었습니다. 목록과 결과는 [버전 기록](/appendix/version-history#governance-timeline)에 있으며, 모든 제안은 `GET /cosmos/gov/v1/proposals`에서 실시간으로 확인할 수 있습니다.

---

:::tip

* 투표 기간이 끝나기 전에 투표하세요. 투표는 제안이 투표 기간 중일 때 던진 경우에만 집계됩니다.
* `no_with_veto`는 신중하게 사용하세요. 거부권 임계값에 도달하면 제안 예치금이 소각됩니다.
* 예치 기간 내에 최소 예치금에 도달하지 못한 제안은 자동으로 제거됩니다.

:::
