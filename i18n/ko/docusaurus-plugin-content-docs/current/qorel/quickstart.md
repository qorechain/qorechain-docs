---
slug: /qorel/quickstart
title: QORel 빠른 시작
sidebar_label: 빠른 시작
sidebar_position: 4
---

# 빠른 시작

QoreChain 테스트넷 `qorechain-diana`와 Cosmos Hub 공개 테스트넷(체인 ID `provider`) 사이에서 릴레이하는 과정을 안내합니다. 설치, 설정, 키 추가와 등록, 준비 상태 확인, 릴레이어 시작, 첫 전송까지 다룹니다. 릴레이어를 운영해 본 적이 없는 사람을 위한 것입니다. 여기의 모든 것은 테스트넷이며 토큰은 가치가 없습니다.

## 혁신 {#innovations}

- **준비 상태는 필드 하나입니다.** `qorel keys pqc-status`는 `ready_to_relay`로 끝납니다. 이것이 `true`이면 포스트 양자 키가 체인에 등록되어 있고 로컬 키와 일치하므로, 릴레이어가 그 이유로 자신의 트랜잭션을 거부당하지 않습니다.
- **문제가 있으면 아무것도 보내지 않습니다.** 전송 전 검사가 잘못된 트랜잭션이 체인에 도달하기 전에 막아 주므로, 단계를 빠뜨려도 수수료가 들지 않습니다.
- **모든 체인에 같은 흐름.** Cosmos Hub 쪽 단계는 Hermes 고유의 것이며, 새로운 것은 QoreChain 체인 항목과 등록 단계뿐입니다.

## 사용 방법 {#how-to-use}

### 1. 설치 {#step-install}

[설치](/qorel/install) 페이지의 아무 방법으로 `qorel`을 설치하고 확인합니다.

```bash
qorel --version
```

### 2. 설정 가져오기 {#step-config}

저장소에서 예제 설정을 복사합니다(`packaging/config.example.toml`. `.deb`와 `.rpm`은 `/etc/qorel/config.example.toml`에 둡니다).

```bash
mkdir -p ~/.hermes
curl -o ~/.hermes/config.toml https://raw.githubusercontent.com/qorechain/QORel/main/packaging/config.example.toml
```

`~/.hermes/config.toml`을 열어 QoreChain 노드의 자리 표시자(`YOUR-QORECHAIN-NODE`)를 직접 운영하는 테스트넷 노드의 RPC, gRPC, WebSocket 주소로 바꿉니다. QoreChain에는 공개 gRPC 엔드포인트가 없으므로 직접 노드가 필요합니다. [노드 운영](/developer-guide/running-a-node)과 [테스트넷 연결하기](/getting-started/connecting-to-testnet)를 참고하세요. 모든 설정은 [설정](/qorel/configuration)에 설명되어 있습니다.

예제 설정에는 체인이 둘 있습니다. `signing = 'qorechain-hybrid'`인 `qorechain-diana`와 기본 표준 서명을 쓰는 `provider`입니다. 릴레이는 QoreChain의 `transfer/channel-0`과 Hub 테스트넷의 `transfer/channel-600`으로 제한됩니다.

### 3. 릴레이어 계정 만들기와 자금 넣기 {#step-accounts}

각 체인에 릴레이어용 새 계정을 만듭니다. 전용 계정을 사용하고, 밸리데이터 운영자 키는 절대 사용하지 마세요. 각 계정의 니모닉을 본인만 읽을 수 있는 파일에 저장합니다.

```bash
umask 077
nano ./diana.mnemonic       # paste the mnemonic, save
nano ./provider.mnemonic
```

같은 니모닉을 두 체인에 쓸 수도 있고 체인마다 따로 쓸 수도 있습니다. QORel은 기본적으로 코인 타입 118(`m/44'/118'/0'/0/0`)로 파생합니다. 계정이 다른 경로를 쓴다면 `keys add`에 `--hd-path`를 전달하세요.

키를 추가합니다.

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./diana.mnemonic
qorel keys add --chain provider        --key-name relayer --mnemonic-file ./provider.mnemonic
```

`qorechain-diana`에서는 `keys add`가 같은 니모닉으로 ML-DSA-87 키도 파생하여 그 시드를 키 옆에 `relayer.pqc`로 저장합니다. 끝나면 니모닉 파일을 삭제하세요.

그런 다음 계정에 자금을 넣습니다. 주소는 `qorel keys list --chain <id>`로 확인합니다. 테스트넷 QOR은 [대시보드 포셋](/dashboard/faucet)에서 받고, Hub 테스트넷의 테스트 토큰은 해당 네트워크의 공개 포셋에서 받습니다. 수수료에는 토큰 몇 개면 충분합니다. QoreChain의 하한은 가스당 0.1 uqor이므로 기본 가스 한도 400,000인 트랜잭션은 하한 가격에서 약 40,000 uqor이 듭니다. 다음으로 확인하세요.

```bash
qorel keys balance --chain qorechain-diana
qorel keys balance --chain provider
```

### 4. 포스트 양자 키 등록 {#step-register}

QoreChain은 ML-DSA-87 공개 키를 등록한 계정의 하이브리드 서명 트랜잭션만 받아들입니다. 등록은 한 번만 하면 됩니다.

```bash
qorel keys register-pqc --chain qorechain-diana
```

클래식 키만으로 서명한 트랜잭션(QoreChain이 그런 방식으로 받아들이는 유일한 종류의 트랜잭션) 하나를 소유 증명과 함께 보냅니다. 다시 실행해도 안전합니다. 같은 키가 이미 등록되어 있으면 아무것도 보내지 않습니다. 계정에 이미 다른 포스트 양자 키가 등록되어 있으면 거부하고 아무것도 보내지 않습니다.

준비 상태를 확인합니다.

```bash
qorel keys pqc-status --chain qorechain-diana
```

결과는 `chain_id`, `account`, `local_public_key_sha256`, `registered`, `matches_local_key`, `registered_public_key_sha256`, `possession_proven`, `sign_bytes`, `ready_to_relay` 필드를 가진 JSON 객체입니다. `ready_to_relay`가 `true`일 때만 계속하세요. 그렇지 않으면 [문제 해결](/qorel/troubleshooting)을 참고하세요.

### 5. 상태 점검 {#step-health}

```bash
qorel health-check
```

설정과 각 체인과의 연결을 확인하고, QoreChain 항목에서 1.1 미만의 가스 배수를 잘못된 설정의 가능성으로 보고합니다(경고이며 릴레이는 계속 동작합니다).

### 6. 채널 고르기 {#step-channel}

테스트넷에는 이미 transfer 채널이 있습니다. `qorechain-diana`의 `channel-0`이며, 상대방은 `provider`의 `channel-600`입니다([테스트 채널](/user-guide/bridging-assets#ibc-test-channel)). 이를 릴레이하려면 바로 7단계로 가세요.

대신 두 체인 사이에 직접 새 채널을 만들려면:

```bash
qorel create channel \
  --a-chain qorechain-diana --b-chain provider \
  --a-port transfer --b-port transfer \
  --new-client-connection
```

`--new-client-connection`은 두 라이트 클라이언트와 연결도 함께 만듭니다. 각 체인에서 여러 트랜잭션이 전송됩니다. 명령은 새 채널 식별자를 출력하며, 이를 두 체인 항목의 `packet_filter`에 넣으세요.

### 7. 릴레이어 시작 {#step-start}

```bash
qorel start
```

실행 상태로 두세요(오래 실행할 릴레이어에는 systemd 서비스나 컨테이너를 사용하세요. [밸리데이터 옆에서 실행하기](/qorel/running-next-to-a-validator) 참고). QORel은 패킷을 릴레이하고, 라이트 클라이언트를 갱신하고, misbehaviour를 감시합니다.

### 8. 첫 전송 보내기 {#step-transfer}

두 번째 터미널에서 QoreChain에서 Hub 테스트넷으로 1000 uqor을 보냅니다. QORel이 같은 하이브리드 서명으로 이 트랜잭션에 직접 서명하고 전송합니다.

```bash
qorel tx ft-transfer \
  --src-chain qorechain-diana --dst-chain provider \
  --src-port transfer --src-channel channel-0 \
  --amount 1000 --denom uqor \
  --timeout-seconds 600 \
  --receiver <a cosmos address on the Hub testnet>
```

`--receiver`가 없으면 토큰은 대상 체인의 릴레이어 자신의 주소로 갑니다. 그런 다음 패킷을 추적합니다.

```bash
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

패킷은 실행 중인 릴레이어가 전달하고 확인 응답이 돌아올 때까지 목록에 나타납니다. QoreChain에서는 REST로 채널과 토큰 추적도 읽을 수 있습니다.

```bash
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
curl -s https://api-testnet.qore.host/ibc/apps/transfer/v1/denoms
```

타임아웃 전에 전달되지 않은 전송은 릴레이어가 소스 체인의 발신자에게 환불합니다. 위의 `--timeout-seconds` 값은 10분을 줍니다.

## 접근 방법 {#how-to-access}

- **네트워크.** 테스트넷 `qorechain-diana`와 Cosmos Hub 공개 테스트넷만 해당합니다.
- **필요한 것.** QORel, 직접 운영하는 QoreChain 테스트넷 노드(RPC, gRPC, WebSocket), 접근 가능한 Hub 테스트넷 엔드포인트, 각 체인의 자금이 있는 릴레이어 계정 하나, 각각의 니모닉이 담긴 파일.
- **비용.** 테스트 토큰으로 낸 수수료뿐입니다. QoreChain에서는 가스 곱하기 가격이며 하한은 가스당 0.1 uqor이고, 사용하지 않은 가스는 환불되지 않습니다.
- **컨테이너 사용자.** 위의 각 명령을 `docker run --rm -v $HOME/.qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 <command>`로 실행하고, 니모닉 파일은 마운트한 디렉터리 안에 두며, `start`는 오래 실행되는 컨테이너로 실행하세요([설치](/qorel/install#container)).

## 배포 위치 {#where-published}

바이너리와 예제 설정은 [QORel 저장소](https://github.com/qorechain/QORel)(`packaging/config.example.toml`)에서 받습니다. 모든 채널은 [설치](/qorel/install)를, 버전은 [QORel 개요](/qorel/overview#where-published)를 참고하세요.

## 한계와 알려진 문제 {#limits}

- **테스트넷 전용.** 메인넷 IBC는 열려 있지 않습니다. 이 흐름을 메인넷에 연결하지 마세요.
- **직접 운영하는 QoreChain 노드가 필요합니다.** 공개 gRPC 엔드포인트가 없습니다.
- **새 채널은 두 체인 모두에서 수수료가 들며** 클라이언트와 연결이 추가됩니다. 직접 채널이 필요하지 않다면 `channel-0`을 릴레이하는 편이 좋습니다.
- **Hub 쪽 공개 엔드포인트는 속도 제한이 걸릴 수 있습니다.** QORel이 계속 재시도하지만, 꾸준한 릴레이에는 직접 운영하는 노드를 사용하세요.
- **릴레이될 때까지 대기.** 채널에 실행 중인 릴레이어가 없으면 전송은 하나가 시작되거나 패킷이 타임아웃될 때까지 대기 상태로 남습니다.

다음: [설정](/qorel/configuration), [모니터링](/qorel/monitoring), [문제 해결](/qorel/troubleshooting).
