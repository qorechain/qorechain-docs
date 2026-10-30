---
slug: /qorel/troubleshooting
title: QORel 문제 해결 및 FAQ
sidebar_label: 문제 해결
sidebar_position: 9
---

# 문제 해결 및 FAQ

QORel 운영에 관한 질문과 해결 방법을 사람들이 보통 마주치는 순서대로 정리했습니다. 릴레이어가 시작되지 않거나, 전송을 거부하거나, 패킷을 대기 상태로 남기는 운영자를 위한 것입니다. QORel은 현재 테스트넷 전용이므로 모든 답변은 `qorechain-diana`를 전제로 합니다.

## 혁신 {#innovations}

하이브리드 체인의 대부분의 문제는 수수료가 소모되기 전에 잡힙니다.

- **전송 전 검사가 문제를 알려 줍니다.** 포스트 양자 키가 로드되지 않았거나, 등록되지 않았거나, 로컬 키가 아니거나, sign-bytes 버전을 알 수 없으면 QORel은 아무것도 보내지 않고 그중 어느 것인지 알려 줍니다.
- **`keys pqc-status`가 가장 먼저 실행할 명령입니다.** 등록 여부, 키 일치, 소유 증명, 체인이 검증하는 sign-bytes 버전, `ready_to_relay`를 보여 줍니다.
- **`health-check`가 잘못된 설정을 설명합니다.** QoreChain 항목에서 1.1 미만의 가스 배수도 포함됩니다.

## 사용 방법 {#how-to-use}

먼저 다음을 실행해 비교해 보세요.

```bash
qorel --version
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

### 키와 등록 {#keys}

**`ready_to_relay`가 `false`입니다. 어떻게 하나요?**
`keys pqc-status`의 다른 필드를 읽어 보세요.
- `registered: false`: 계정에 등록된 포스트 양자 키가 없습니다. 계정에 자금을 넣은 다음 `qorel keys register-pqc --chain qorechain-diana`를 실행하세요.
- `registered: true`이지만 `matches_local_key: false`: 계정에 등록된 키가 QORel이 가진 키와 다릅니다. 계정 본래의 니모닉과 올바른 `--key-name`을 사용했는지 확인하세요. 키를 다시 추가했다면 `keys add --overwrite`가 니모닉에서 로컬 키와 `<key name>.pqc` 시드를 다시 만듭니다.
- 명령이 키를 로드하지 못함: 키 옆의 `<key name>.pqc` 파일이 없거나 읽을 수 없습니다. 해당 체인에 `keys add`를 다시 실행하세요.

**`keys register-pqc`가 계정에 이미 다른 키가 있다고 합니다.**
의도적으로 아무것도 보내지 않았습니다. 체인에 있는 키는 다른 니모닉이나 다른 도구로 등록된 것입니다. 원래 니모닉을 사용하거나 이전 키로 체인에서 키를 교체하세요([포스트 양자 서명](/developer-guide/post-quantum-signing#key-rotation)). 계정이 이전에 사용한 키는 다시 등록할 수 없습니다.

**`keys register-pqc`가 수수료 또는 잔액 오류로 실패합니다.**
첫 트랜잭션을 보내려면 계정에 테스트넷 QOR이 필요합니다. [대시보드 포셋](/dashboard/faucet)을 사용하세요. 등록에는 수십만 가스가 필요하며, 하한인 0.1 uqor 기준으로는 수만 uqor입니다.

**`--no-proof`가 필요한가요?**
v3.2.3보다 오래된 네트워크에서만 필요합니다. 두 QoreChain 네트워크 모두 소유 증명을 받아들이며, QORel은 기본적으로 이를 추가합니다.

**포스트 양자 키는 어디에 저장되나요?**
secp256k1 키 옆에 `<key name>.pqc`(32바이트 시드)로 저장되며 소유자만 읽을 수 있습니다. 니모닉에서 다시 파생할 수 있습니다. 파일이 아니라 니모닉을 백업하세요.

**키 파일을 다른 사람이 읽을 수 있습니다.**
QORel은 새 키 파일을 0600으로 기록합니다. 이전 Hermes로 추가한 키는 기존 모드를 유지하므로 `chmod 600`을 실행하세요.

### 설정 {#config}

**`extension_options`에 대한 메시지와 함께 설정이 거부됩니다.**
정적 `extension_options`는 `signing = 'qorechain-hybrid'`와 함께 쓸 수 없습니다. 포스트 양자 서명이 유일한 critical 확장 옵션이어야 합니다. 해당 체인 항목에서 제거하세요.

**체인이 `signing = "qorechain-hybrid"`를 사용하지 않는다고 나옵니다.**
포스트 양자 키 명령은 해당 설정이 있는 체인에서만 동작합니다. QoreChain 항목에 추가하세요.

**sign-bytes 버전을 설정해야 하나요?**
아니요. `pqc.sign_bytes = 'auto'`가 체인에서 읽고, 1분마다 그리고 거부될 때마다 다시 읽습니다. 체인과 맞지 않는 고정 `v1` 또는 `v2`는 모든 트랜잭션이 거부되게 만듭니다.

**`pqc-status`가 `sign_bytes`를 unknown으로 표시합니다.**
QORel이 체인의 업그레이드 기록을 읽지 못했습니다. QoreChain 항목의 `rpc_addr`이 응답하는지, 올바른 네트워크(테스트넷에서는 `qorechain-diana`)를 가리키는지 확인하세요. QORel은 버전을 알 수 없으면 서명하지 않습니다.

**어떤 가스 배수를 써야 하나요?**
`1.1`이 예제 기본값이며 `health-check`를 조용하게 유지합니다. 체인 v3.2.5 이상에서는(이제 두 네트워크 모두 해당하며, 테스트넷 v3.2.6에서 측정) `1.05` 같은 더 낮은 값도 동작합니다. 이전 빌드는 시뮬레이션된 가스를 적게 보고하므로, 그런 빌드를 실행하는 노드에서는 `1.15`를 사용하세요. [가스](/qorel/configuration#gas)를 참고하세요.

**`health-check`가 가스 배수에 대해 경고합니다.**
QoreChain 항목에서 1.1보다 낮다는 뜻입니다. 경고일 뿐이며 릴레이는 동작합니다. 가스 부족 실패가 보이면 올리세요.

### 전송과 릴레이 {#relaying}

**체인이 codespace `pqc`, 코드 21로 트랜잭션을 거부합니다.**
하이브리드 서명이 검증되지 않았습니다. QORel은 다음 트랜잭션 전에 sign-bytes 버전과 등록 상태를 다시 읽고 재시도합니다. 반복된다면 체인 항목의 `id`가 정확히 체인 ID(`qorechain-diana`)인지, 키가 등록된 키인지(`keys pqc-status`), 사용하는 노드가 예상한 버전을 실행하는지 확인하세요. 원인은 [포스트 양자 서명](/developer-guide/post-quantum-signing#code-21)에 나열되어 있습니다.

**아무것도 보내지지 않고 수수료도 소모되지 않았는데 릴레이어가 오류를 로그에 남깁니다.**
전송 전 검사가 제 역할을 한 것입니다. 로그 줄이 빠진 부분을 알려 줍니다. 키가 로드되지 않음, 키가 등록되지 않음, 키 불일치, sign-bytes 버전 알 수 없음 중 하나입니다. 위에서 설명한 대로 고치세요.

**`account sequence mismatch` 오류.**
두 프로세스가 같은 릴레이어 키로 서명하고 있습니다. 키당 릴레이어 하나만 실행하세요. systemd 서비스와 컨테이너를 함께 실행하는 경우와 두 번째 Kubernetes 파드도 여기에 해당합니다.

**로그에 `429 Too Many Requests`가 보입니다.**
엔드포인트가 속도 제한을 걸고 있는 것이며, 보통 재시작 직후의 공개 엔드포인트입니다. QORel은 이를 재시도 가능으로 처리하고 패킷 워커를 계속 실행하며 매 클리어 간격마다 재시도합니다. 꾸준한 릴레이에는 직접 운영하는 노드나 유료 엔드포인트를 사용하세요. QoreChain 테스트넷에는 공개 gRPC 엔드포인트가 없으므로 QoreChain 쪽은 어차피 직접 노드가 필요합니다.

**QoreChain에서 수수료 또는 가스 부족 오류.**
수수료는 가스 한도 곱하기 가격이며 환불이 없고 하한은 가스당 0.1 uqor입니다. `gas_price`, `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` 설정 여부, 계정 잔액(`qorel keys balance --chain qorechain-diana`)을 확인하세요.

### 패킷과 채널 {#packets}

**전송이 대기 중이고 아무것도 도착하지 않습니다.**
순서대로 확인하세요. 채널에 릴레이어가 실행 중인지(프로세스가 떠 있고 텔레메트리가 응답함), 채널이 두 체인 모두의 `packet_filter`에 있는지, 릴레이어가 대상 체인에 잔액이 있는지, 포스트 양자 키가 준비되었는지, 엔드포인트에 연결할 수 있는지. 그런 다음 해당 채널에 `qorel query packet pending`을 실행하세요. 릴레이어가 없으면 패킷은 하나가 시작되거나 전송이 타임아웃될 때까지 기다립니다.

**전송이 만료되면 어떻게 되나요?**
릴레이어가 실행 중이면 타임아웃을 릴레이하고 토큰은 소스 체인의 발신자에게 환불됩니다. 테스트넷 채널에서 테스트했습니다.

**기존 테스트 채널을 쓸 수 있나요, 아니면 직접 만들어야 하나요?**
테스트넷의 `channel-0`에서 Hub 테스트넷의 `channel-600`으로 가는 채널이 열려 있습니다([테스트 채널](/user-guide/bridging-assets#ibc-test-channel)). 해당 `packet_filter`로 QORel을 실행하면 릴레이됩니다. 정말 필요할 때만 `qorel create channel ... --new-client-connection`으로 직접 만드세요.

**`create channel`이 중간에 실패합니다.**
핸드셰이크는 두 체인에 걸친 여러 트랜잭션입니다. `qorel health-check`를 실행해 원인을 고친 다음, 이미 만들어진 연결을 `--a-connection`으로 지정해 명령을 다시 실행하거나 `--new-client-connection`으로 처음부터 다시 시작하세요.

**기본 Hermes가 QoreChain에서 동작하나요?**
아니요. QoreChain은 ML-DSA-87 서명이 없는 트랜잭션을 거부하고, 기본 Hermes는 이를 추가하지 않습니다. QORel은 Hermes에 그 서명을 더한 것입니다.

### 일반 {#general}

**QORel이 QoreChain 외의 체인도 릴레이할 수 있나요?**
네. `signing`이 없는 체인은 표준 Hermes 트랜잭션 형식을 바이트 단위로 그대로 사용합니다.

**메인넷을 지원하나요?**
아직 아닙니다. 열려 있는 메인넷 IBC 채널이 없습니다. 메인넷 IBC가 열리면 이 매뉴얼에서 알려 드립니다.

**IBC v2를 지원하나요?**
아직 아닙니다. IBC v2 릴레이는 QORel에 구현되어 있지 않으며 다음 단계입니다. Ethereum(Eureka) 릴레이는 시작하지 않았습니다.

**Windows는요?**
지원하지 않습니다. WSL2에서 컨테이너를 사용하세요.

**문제는 어디에 보고하나요?**
[github.com/qorechain/QORel](https://github.com/qorechain/QORel/issues)에 이슈를 여세요. QORel 버전, 민감 정보를 가린 체인 항목, `qorel keys pqc-status`의 출력을 포함하고, 니모닉, 키 파일, `.pqc` 시드는 절대 게시하지 마세요.

## 접근 방법 {#how-to-access}

- 위의 모든 명령은 릴레이어와 같은 설정으로 릴레이어 호스트에서 실행합니다.
- 비교할 공개 상태: QoreChain 테스트넷 REST `https://api-testnet.qore.host`([테스트넷 연결하기](/getting-started/connecting-to-testnet))와 [블록 탐색기](https://explore.qore.network)(테스트넷으로 전환).

## 배포 위치 {#where-published}

QORel은 저장소 [qorechain/QORel](https://github.com/qorechain/QORel)에 있으며 이슈도 그곳에 올립니다. 업스트림 Hermes 가이드 [hermes.informal.systems](https://hermes.informal.systems)는 QORel이 공유하는 설정과 명령을 다룹니다.

## 한계와 알려진 문제 {#limits}

- **테스트넷 전용**이며 0.x 릴리스입니다.
- **아직 IBC v2 릴레이 없음**(다음 단계), Ethereum(Eureka) 릴레이도 없습니다.
- **서드파티 엔드포인트는 속도 제한이 있습니다.** 예제 설정의 Hub 쪽 엔드포인트는 공개 엔드포인트이며 QoreChain이 운영하지 않습니다.
- **이 페이지는 모든 Hermes 오류를 다룰 수 없습니다.** 포스트 양자 키, sign bytes, QoreChain을 언급하지 않는 오류에는 Hermes 가이드와 이슈 트래커가 적용됩니다.

함께 보기: [설정](/qorel/configuration), [모니터링](/qorel/monitoring), [모든 언어에서 서명하기](/qorel/signing-from-any-language).
