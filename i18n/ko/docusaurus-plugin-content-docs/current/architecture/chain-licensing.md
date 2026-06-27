---
slug: /architecture/chain-licensing
title: 체인 라이선싱
sidebar_label: 체인 라이선싱
sidebar_position: 9
---

# 체인 라이선싱

`x/license` 모듈은 온체인 **기능 라이선싱**을 제공합니다. QoreChain의 특정 게이팅된 기능 — 가장 대표적으로 체인별 브리지 및 검증자 기능 — 은 작업을 수행하는 계정이 해당 기능에 대한 유효한 라이선스를 보유해야 합니다. 라이선스는 단순히 특정 보유자(**수령인**)가 특정 게이팅된 **기능**을 사용하도록 인가하는 온체인 기록입니다.

라이선싱은 이러한 기능을 검증 가능하고 자체 설명 가능하게 유지합니다: 모든 통합자, 익스플로러, 또는 지갑은 오프체인 조회 없이 주어진 계정이 주어진 기능에 대해 인가되었는지 체인에 물어볼 수 있습니다.

## 라이선스가 나타내는 것

각 라이선스는 `(grantee, feature_id)` 쌍을 키로 하는 기록입니다:

- **`grantee`** — 라이선스가 인가하는 `qor` 계정.
- **`feature_id`** — 잠금이 해제되는 게이팅된 기능. 기능 ID는 안정적인 문자열 식별자입니다. 브리지 및 검증자 기능은 대상 체인별로 명명되며(예: `bridge_ethereum`, `validator_solana`), 브리지 프로토콜 및 노드/검증자 운영자 기능과 같은 포괄 기능도 함께 존재합니다.
- **`granted_at`** / **`expires_at`** — 라이선스가 부여된 블록 높이와 만료되는 블록 높이(`0` 값은 만료되지 않음을 의미).
- **`granted_by`** — 라이선스를 발급한 권한.

기능 뒤에 게이팅된 능력은 실행 시점에 단순히 작업을 수행하는 계정이 해당 기능에 대한 **활성** 라이선스를 보유하고 있는지 확인합니다.

## 라이선스 생명주기

라이선스는 작은 상태 집합을 거쳐 이동합니다:

| 상태 | 의미 |
| --- | --- |
| **부여됨 / 활성** | 라이선스가 존재하며 수령인을 인가합니다. 일시 중지되지 않고 만료되지 않은 동안 활성으로 간주됩니다. |
| **일시 중지됨** | 일시적으로 비활성화됨. 기록은 여전히 존재하지만, 라이선스가 재개될 때까지 게이팅된 능력이 거부됩니다. |
| **취소됨** | 영구적으로 제거됨. 수령인이 더 이상 라이선스를 전혀 보유하지 않습니다. |

라이선스는 일시 중지되거나 취소된 적이 없더라도, `expires_at` 높이가 지나면 활성 상태가 중단됩니다.

## 누가 라이선스를 변경할 수 있는가

라이선스 부여, 취소, 일시 중지, 재개는 **권한 작업**입니다 — 임의의 사용자가 아니라 체인의 거버넌스 권한에 의해 수행됩니다. 이러한 트랜잭션은 모듈의 명령 표면의 일부로 존재하지만, 일반 사용자가 직접 호출하지는 않습니다. 생명주기는 권한에 의해 온체인에서 관리됩니다.

라이선스를 **획득**하려면 통합자는 **대시보드(Tools → Buy License)**를 거치며, 이것이 요청 흐름을 처리합니다. 그런 다음 권한이 온체인에 부여를 기록합니다.

권한이 게이팅하는 트랜잭션은 다음과 같습니다:

```bash
# Grant a license for a feature to a grantee (authority signs)
qorechaind tx license grant qor1grantee... bridge_ethereum \
  --expires-at 0 --from qor1authority... --chain-id qorechain-vladi

# Suspend / resume a license
qorechaind tx license suspend qor1grantee... bridge_ethereum --from qor1authority...
qorechaind tx license resume  qor1grantee... bridge_ethereum --from qor1authority...

# Revoke a license permanently
qorechaind tx license revoke qor1grantee... bridge_ethereum --from qor1authority...
```

## 라이선스 확인 및 검증

쿼리 명령어는 누구에게나 열려 있습니다. 이들은 통합자가 일상적으로 사용하는 모듈의 부분입니다 — 게이팅된 능력에 의존하기 전에 계정이 인가되었는지 확인하거나, 지갑 또는 익스플로러에 라이선스 상태를 표시하기 위해서입니다.

### 단일 라이선스 확인

`check`는 특정 수령인이 특정 기능을 보유하는지, 그리고 해당 라이선스가 현재 **활성** 상태인지 보고합니다. 이것은 "이 계정이 X를 수행하도록 허용되는가"라는 표준 호출입니다.

```bash
qorechaind query license check qor1grantee... bridge_ethereum
# -> returns the license record and an `active` flag (true / false)
```

응답에는 라이선스 세부 정보와 일시 중지 및 만료를 이미 고려한 부울 `active` 필드가 포함됩니다 — 따라서 `true`는 수령인이 지금 당장 게이팅된 기능을 사용할 수 있음을 의미합니다.

### 수령인의 라이선스 목록

`list`는 모든 기능에 걸쳐 한 계정이 보유한 모든 라이선스를 반환합니다.

```bash
qorechaind query license list qor1grantee...
```

### 기능 보유자 목록

`holders`는 주어진 기능에 대한 라이선스를 보유한 모든 계정을 반환합니다 — 예를 들어 특정 브리지 또는 검증자 기능에 대해 누가 인가되었는지 열거하는 데 유용합니다.

```bash
qorechaind query license holders bridge_ethereum
```

## 명령어 요약

**트랜잭션** (`qorechaind tx license …`) — 권한 / 거버넌스 게이팅:

| 명령어 | 목적 |
| --- | --- |
| `grant` | 수령인을 기능에 대해 인가 |
| `revoke` | 라이선스를 영구적으로 제거 |
| `suspend` | 라이선스를 일시적으로 비활성화 |
| `resume` | 일시 중지된 라이선스를 다시 활성화 |

**쿼리** (`qorechaind query license …`) — 누구에게나 열림:

| 명령어 | 목적 |
| --- | --- |
| `check` | 하나의 `(grantee, feature)` 라이선스와 그 활성 상태 확인 |
| `list` | 수령인이 보유한 모든 라이선스 목록 표시 |
| `holders` | 주어진 기능을 보유한 모든 수령인 목록 표시 |

## 관련 문서

- 브리지 및 검증자 기능에 대한 라이선스는 [브리지 아키텍처](/architecture/bridge-architecture)에 설명된 기능을 뒷받침합니다.
- 라이선스는 **대시보드(Tools → Buy License)**를 통해 획득됩니다.
- 라이트 노드는 [등록 및 라이선싱](/light-node/registration-and-licensing) 중에 라이선스를 획득합니다.
- [Tools Hub](/dashboard/tools-hub)에서 라이선스를 구매하고 관리하세요.
