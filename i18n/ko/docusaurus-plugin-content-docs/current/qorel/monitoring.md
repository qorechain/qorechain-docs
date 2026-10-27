---
slug: /qorel/monitoring
title: QORel 모니터링
sidebar_label: 모니터링
sidebar_position: 7
---

# 모니터링

조용히 멈춘 릴레이어는 패킷을 대기 상태로 남기므로 감시해야 합니다. 이 페이지는 QORel이 제공하는 것(Prometheus 텔레메트리, 선택적 REST 엔드포인트, 로그, 명령)과 알림을 걸어야 할 대상을 나열합니다. 관심 있는 채널의 릴레이어를 운영하는 운영자를 위한 것입니다.

## 혁신 {#innovations}

- **스크립트로 확인할 수 있는 포스트 양자 준비 상태 검사.** `qorel keys pqc-status`는 JSON 객체를 출력하며, 키가 체인에 등록되어 있고 로컬 키와 일치할 때만 `ready_to_relay` 필드가 `true`가 됩니다. 이 필드에 알림을 걸면 릴레이어가 거부되기 전에 누락되거나 바뀐 키를 잡아낼 수 있습니다.
- **조용히 릴레이를 멈추지 않는 실패 처리.** 패킷 워커는 릴레이나 클리어링 시도가 실패한 뒤에도 계속 실행되며 매 클리어 간격마다 재시도하므로, 잠깐의 속도 제한은 채널이 멈추는 것이 아니라 로그의 경고로 나타납니다.
- **이유를 알려 주는 전송 전 검사.** 전송 전 검사가 트랜잭션을 거부하면(키 미등록, 키 불일치, sign-bytes 버전 알 수 없음) 아무것도 보내지 않고 이유가 로그에 남으며 `qorel health-check`에도 표시됩니다.

## 사용 방법 {#how-to-use}

### 텔레메트리 {#telemetry}

설정에서 활성화합니다.

```toml
[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

메트릭은 `http://127.0.0.1:3001/metrics`에서 Prometheus 형식으로 제공됩니다. Hermes 메트릭이며, Prometheus는 카운터를 `_total` 접미사와 함께 보여 줍니다. 그래프로 볼 만한 것:

| 메트릭 | 이유 |
|---|---|
| `workers` | 유형별 실행 중인 워커 수. 줄어들면 워커가 멈춘 것입니다. |
| `backlog_size`, `backlog_oldest_sequence` | 채널에서 대기 중인 패킷과 아직 대기 중인 가장 오래된 시퀀스. |
| `wallet_balance` | 각 체인에서의 릴레이어 잔액. |
| `receive_packets_confirmed`, `acknowledgment_packets_confirmed`, `timeout_packets_confirmed` | 릴레이된 패킷. 백로그가 늘어나는데 선이 평평하면 정체입니다. |
| `client_updates_submitted`, `client_misbehaviours_submitted` | 라이트 클라이언트 유지 관리와 misbehaviour 보고. |
| `broadcast_errors`, `simulate_errors` | 거부되었거나 시뮬레이션에 실패한 트랜잭션. |
| `ws_reconnect` | WebSocket 재연결. 연달아 많으면 엔드포인트가 불안정하다는 뜻입니다. |
| `tx_latency_submitted`, `tx_latency_confirmed` | 트랜잭션에 걸리는 시간. |

Hermes는 전체 목록을 [텔레메트리 가이드](https://hermes.informal.systems/documentation/telemetry/operators.html)에 문서화하고 있습니다. 예제 설정에서 리스너는 `127.0.0.1`에 있습니다. Prometheus 스크레이퍼를 같은 호스트에 두거나, 의도적으로 `host`를 바꾸세요.

### 알림을 걸어야 할 대상 {#alerts}

| 대상 | 위치 |
|---|---|
| 프로세스 동작 | 텔레메트리 엔드포인트가 응답함 |
| 내 채널의 대기 중인 패킷과 확인 응답 | `qorel query packet pending --chain <id> --port transfer --channel <channel>` |
| 각 체인의 릴레이어 잔액 | `qorel keys balance --chain <id>` 또는 `wallet_balance` |
| 포스트 양자 키 준비 상태 | `qorel keys pqc-status`가 `ready_to_relay: true`를 보고 |
| 클라이언트 최신성 | QORel은 신뢰 기간(trusting period)의 3분의 1 시점에 클라이언트를 갱신합니다. 클라이언트가 그 기간의 약 절반 동안 갱신되지 않았다면 알림 |
| 오류 | `broadcast_errors`와 `simulate_errors` 증가 |

cron이나 모니터링 에이전트에 적합한, 키 상태를 확인하는 간단한 검사:

```bash
qorel --json keys pqc-status --chain qorechain-diana | jq -e '.result.ready_to_relay == true'
```

키가 준비되지 않았으면 0이 아닌 코드로 종료합니다.

### 로그 {#logs}

`[global]`의 `log_level = 'info'`가 기본값입니다. systemd 패키지에서는 로그가 저널로 갑니다.

```bash
journalctl -u qorel -f
```

QORel이 체인에서 sign-bytes 버전을 읽었고 그것이 바뀌면 `post-quantum sign bytes`로 시작하는 로그 줄이 나타납니다. 엔드포인트의 `429` 응답에 대한 경고는 엔드포인트가 속도 제한을 걸고 있다는 뜻이며, QORel은 재시도합니다.

### REST 엔드포인트 {#rest}

선택적 REST 서버(설정의 `[rest]`, 예제에서는 포트 3000, 기본값은 비활성화)는 점검을 위해 릴레이어의 상태를 노출합니다. `127.0.0.1`에 바인딩된 상태로 두세요.

### 수동 검사 {#by-hand}

```bash
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
```

## 접근 방법 {#how-to-access}

- 텔레메트리와 REST는 릴레이어 호스트에 로컬입니다. 직접 노출하지 않는 한 둘 다 공용 네트워크에는 열려 있지 않습니다.
- `qorel` 명령은 릴레이어와 같은 설정 파일을 읽습니다.
- QoreChain 테스트넷의 공개 REST 엔드포인트(`https://api-testnet.qore.host`)는 채널과 토큰 추적 상태를 보여 줍니다. [테스트넷 연결하기](/getting-started/connecting-to-testnet)를 참고하세요.

## 배포 위치 {#where-published}

모니터링은 `qorel` 바이너리의 일부이며 따로 설치할 것이 없습니다. 소스와 Hermes 텔레메트리 가이드: [qorechain/QORel](https://github.com/qorechain/QORel), [hermes.informal.systems](https://hermes.informal.systems).

## 한계와 알려진 문제 {#limits}

- **호스팅 대시보드 없음.** QORel은 대시보드나 알림 규칙을 제공하지 않습니다. 위의 메트릭으로 직접 구성하세요.
- **메트릭 이름은 Hermes의 것입니다.** QORel 0.1.0은 포스트 양자 메트릭을 추가하지 않습니다. 그 상태는 `keys pqc-status`를 사용하세요.
- **공개 엔드포인트에서는 속도 제한이 일상적입니다.** 단발성 `429` 경고가 아니라 지속되는 백로그에 알림을 거세요.
- **테스트넷 전용.** 여기의 어떤 것도 메인넷 채널을 상대로 실행된 적이 없습니다.
