---
slug: /qorel/configuration
title: QORel 설정
sidebar_label: 설정
sidebar_position: 5
---

# 설정

QORel은 TOML 파일 하나(기본값 `~/.hermes/config.toml`, 또는 `--config`로 지정한 경로)를 읽습니다. 표준 방식으로 서명하는 체인에 대해서는 파일이 곧 Hermes의 설정이며, 모든 설정은 [Hermes 가이드](https://hermes.informal.systems)에 설명되어 있습니다. 이 페이지는 QORel이 추가하는 것, 즉 QoreChain 체인 항목, 포스트 양자 키, 가스 설정, 트랜잭션을 보내기 전에 실행되는 검사를 다룹니다. QORel 설정을 작성하거나 검토하는 운영자를 위한 것입니다.

## 혁신 {#innovations}

- **체인별 `signing`.** `'qorechain-hybrid'`는 해당 체인에 QORel이 보내는 모든 트랜잭션에 ML-DSA-87 서명을 추가하고, `'standard'`(기본값)는 Hermes와 바이트 단위로 동일합니다. 혼합 설정도 가능합니다. 프로세스 하나에 각 종류의 체인을 하나씩 둘 수 있습니다.
- **체인에서 읽는 sign-bytes 버전.** `pqc.sign_bytes = 'auto'`이면 QORel은 체인의 적용된 업그레이드 기록을 읽어 일치하는 형식으로 서명하고, 1분마다 그리고 거부될 때마다 다시 읽으며, 버전을 지어내지 않습니다.
- **수수료 시장 가스 가격.** `backend = 'cosmos-evm-feemarket'`인 `dynamic_gas_price`는 QoreChain의 기본 수수료(최소 가스당 0.1 uqor)를 따릅니다.
- **안전하지 않은 조합을 거부하는 설정.** 포스트 양자 서명이 유일한 critical 확장 옵션이어야 하므로, 정적 `extension_options`를 하이브리드 서명과 함께 쓰면 로드 시점에 거부됩니다.

## 사용 방법 {#how-to-use}

### QoreChain 체인 항목 {#chain-entry}

예제 설정의 테스트넷 항목입니다. 노드 주소를 직접 운영하는 테스트넷 노드의 주소로 바꾸세요.

```toml
[[chains]]
id = 'qorechain-diana'
type = 'CosmosSdk'
rpc_addr = 'http://YOUR-QORECHAIN-NODE:26657'
grpc_addr = 'http://YOUR-QORECHAIN-NODE:9090'
event_source = { mode = 'push', url = 'ws://YOUR-QORECHAIN-NODE:26657/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'qor'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000

# The QoreChain-specific part:
signing = 'qorechain-hybrid'
gas_price = { price = 0.1, denom = 'uqor' }
gas_multiplier = 1.1
dynamic_gas_price = { enabled = true, multiplier = 1.0, max = 10.0, backend = 'cosmos-evm-feemarket' }
# optional, defaults shown:
# pqc = { sign_bytes = 'auto', sign_mode = 'hedged', include_public_key = false }

clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
# Relay only the channels you operate.
packet_filter = { policy = 'allow', list = [['transfer', 'channel-0']] }
```

QoreChain 전용 설정:

| 설정 | 값 | 역할 |
|---|---|---|
| `signing` | `'qorechain-hybrid'` | 이 체인에 보내는 모든 트랜잭션에 ML-DSA-87(FIPS 204) 서명을 추가합니다. 다른 모든 체인에서는 생략하거나 `'standard'`를 사용하세요. |
| `account_prefix` | `'qor'` | QoreChain 계정의 주소 접두사. |
| `gas_price` | `{ price = 0.1, denom = 'uqor' }` | 수수료 하한은 가스당 0.1 uqor입니다. |
| `gas_multiplier` | `1.1` | 시뮬레이션된 가스에 곱해 가스 한도를 구합니다. [가스](#gas)를 참고하세요. |
| `dynamic_gas_price.backend` | `'cosmos-evm-feemarket'` | `gas_price`만 사용하는 대신 체인의 수수료 시장 기본 수수료를 읽습니다. |
| `pqc.sign_bytes` | `'auto'`(기본값), `'v1'` 또는 `'v2'` | `auto`는 체인에서 sign-bytes 버전을 읽고, `v1`과 `v2`는 한 가지 형식을 강제합니다. `auto`로 두세요. |
| `pqc.sign_mode` | `'hedged'`(기본값) 또는 `'deterministic'` | 무작위 또는 결정적 ML-DSA 서명. 체인은 둘 다 받아들입니다. |
| `pqc.include_public_key` | `false`(기본값) | 각 서명 확장에 공개 키를 포함할지 여부. 키가 등록되는 것은 아니며, 등록은 `keys register-pqc`만 합니다. |

읽기용 QoreChain 공개 테스트넷 엔드포인트는 [테스트넷 연결하기](/getting-started/connecting-to-testnet)에 나열되어 있습니다. 릴레이어에는 gRPC도 필요한데 공개되어 있지 않으므로, QoreChain 쪽은 직접 노드를 운영하세요.

### 그 밖의 Cosmos SDK 체인 {#other-chains}

Hermes에서처럼 항목을 작성하고 `signing`은 생략합니다. 예제 설정의 Cosmos Hub 공개 테스트넷 항목입니다.

```toml
[[chains]]
id = 'provider'
type = 'CosmosSdk'
rpc_addr = 'https://rpc.provider-sentry-01.hub-testnet.polypore.xyz'
grpc_addr = 'https://grpc.provider-sentry-01.hub-testnet.polypore.xyz:443'
event_source = { mode = 'push', url = 'wss://rpc.provider-sentry-01.hub-testnet.polypore.xyz/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'cosmos'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000
gas_price = { price = 0.005, denom = 'uatom' }
gas_multiplier = 1.3
dynamic_gas_price = { enabled = true, multiplier = 1.1, max = 0.1, backend = 'skip-feemarket' }
clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
packet_filter = { policy = 'allow', list = [['transfer', 'channel-600']] }
```

이 엔드포인트는 서드파티가 운영하는 공개 엔드포인트이며 속도 제한이 걸릴 수 있습니다. 꾸준한 릴레이에는 직접 운영하는 노드를 사용하세요.

### 전역 설정 {#global}

예제 설정은 Hermes 설정인 다음을 사용합니다.

```toml
[global]
log_level = 'info'

[mode.clients]
enabled = true
refresh = true
misbehaviour = true

[mode.connections]
enabled = false

[mode.channels]
enabled = false

[mode.packets]
enabled = true
clear_interval = 50
clear_on_start = true
tx_confirmation = true

[rest]
enabled = false
host = '127.0.0.1'
port = 3000

[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

`mode.clients`는 라이트 클라이언트를 최신 상태로 유지하고 misbehaviour를 감시하며, `mode.packets`는 패킷을 릴레이하고 대기 중인 패킷을 `clear_interval` 블록마다 그리고 시작 시에 클리어합니다. 연결 및 채널 핸드셰이크는 `create` 명령에 맡깁니다. 텔레메트리 포트는 [모니터링](/qorel/monitoring)에 설명되어 있습니다.

### 키 {#keys}

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana
```

- `keys add`(또는 니모닉이 들어 있는 키 파일을 지정하는 `--key-file`)는 Hermes처럼 secp256k1 키를 저장하고, 하이브리드 체인에서는 같은 니모닉과 계정으로부터 QoreChain 지갑 파생 방식으로 ML-DSA-87 키를 파생합니다. 32바이트 시드만 키 옆에 `<key name>.pqc`로 저장됩니다. 비밀 값은 출력되지 않습니다. 파생 방식은 [키 파생](/qoresign/guides/key-derivation)을 참고하세요.
- `keys register-pqc`는 `MsgRegisterPQCKeyV2`를 한 번 보냅니다. QoreChain이 클래식 서명만으로 받아들이는 유일한 트랜잭션이며, v3.2.3 이상의 네트워크에서는 소유 증명이 함께 들어갑니다. 멱등적이며 계정에 이미 다른 키가 있으면 전송을 거부합니다. 체인이 확인하는 내용은 [포스트 양자 서명](/developer-guide/post-quantum-signing#pqc-key-registration)을 참고하세요.
- `keys pqc-status`는 키가 등록되어 있는지, 로컬 키와 일치하는지, 소유 증명으로 증명되었는지, 체인이 어떤 sign bytes를 검증하는지 보여 줍니다. `ready_to_relay`는 `true`여야 합니다.
- 소액 잔액이 있는 전용 릴레이어 계정을 사용하고, 밸리데이터 운영자 키는 절대 사용하지 마세요.
- 키 파일(`<key name>.json`과 `<key name>.pqc`)은 소유자만 읽을 수 있게(0600) 기록됩니다. 업스트림 Hermes는 기본 umask를 사용했습니다. 이전 Hermes로 추가한 키는 기존 모드를 유지하므로 `ls -l`로 확인하세요.

### 가스 {#gas}

QoreChain은 수수료 전액(가스 한도 곱하기 가격)을 환불 없이 부과하므로, 배수를 작게 유지하세요.

- 테스트넷(v3.2.6)에서는 시뮬레이션이 전달된 가스와 수백 가스 이내로 일치합니다. 해당 라인의 빌드에서 실행한 로컬 엔드 투 엔드 테스트는 `1.05`로 통과합니다(모든 릴레이 트랜잭션이 한도의 95%를 사용했습니다).
- 이전 빌드는 약 8~10% 적게 보고합니다(프리릴리스 데브넷에서 측정했으며, `1.15`에서 4~7%의 여유가 남았습니다). 직접 운영하는 노드에서 측정하기 전까지는 `1.15`를 사용하세요.
- `health-check`는 QoreChain 항목에서 `1.1` 미만의 배수를 잘못된 설정의 가능성으로 보고합니다. 이는 경고이며 릴레이는 계속 동작합니다. 예제 설정의 값인 `1.1`은 `1.05`보다 수수료가 약 5% 더 들지만 경고가 나오지 않게 합니다.
- 일회성 `keys register-pqc` 트랜잭션은 설정과 관계없이 최소 `1.1`을 사용합니다.
- 하이브리드 서명 하나는 트랜잭션에 약 4.7 KB와 검증용 가스 2,000을 추가하며, 시뮬레이션에는 둘 다 포함됩니다.

### 모든 전송 전의 안전 검사 {#safety-checks}

하이브리드 체인에 트랜잭션을 보내기 전에 QORel은 포스트 양자 키가 로드되어 있고, 체인에 등록되어 있고, 로컬 키와 동일한지, 그리고 sign-bytes 버전을 알고 있는지 확인합니다. 검사 중 하나라도 실패하면 아무것도 보내지 않고(수수료가 소모되지 않음) `health-check`가 이유를 보고합니다. 체인이 codespace `pqc` 코드 21로 거부하면 QORel은 다음 트랜잭션 전에 버전과 등록 상태를 다시 읽습니다.

### ibc-go v10 체인 참고 사항 {#ibc-go-v10}

- ICS-29 수수료 미들웨어는 ibc-go v10에 더 이상 없습니다. 수수료는 가스 가격, 수수료 부여자(fee granter), 동적 기본 수수료입니다.
- ibc-go v10은 더 이상 `update_client` 이벤트에 헤더를 넣지 않습니다. QORel은 대신 `MsgUpdateClient` 트랜잭션에서 헤더를 읽으므로 misbehaviour 탐지가 계속 동작합니다(기본 Hermes 1.13은 이런 체인에서 이를 끕니다).

### 속도 제한이 걸린 엔드포인트 {#rate-limits}

공개 엔드포인트는 릴레이어 시작 직후 등 순간적으로 몰린 요청에 `429 Too Many Requests`로 응답하는 경우가 많습니다. Hermes는 이를 재시도 가능으로 처리하지만, 마지막 클리어링 라운드가 실패했더라도 새 IBC 이벤트 없이 `clear_interval x 5` 블록이 지나면 패킷 워커도 중지됩니다. 그 시점에 대기 중이던 패킷은 채널의 다음 패킷이나 재시작을 기다려야 했습니다. QORel은 릴레이나 클리어링 시도가 실패한 동안 채널의 패킷 워커를 계속 살려 두고 매 클리어 간격마다 재시도합니다. 클리어링 라운드가 성공한 뒤에만 유휴 상태로 중지합니다. 프로덕션 릴레이에는 직접 운영하는 노드나 유료 엔드포인트를 선호하고, 대기 중인 패킷에 알림을 설정하세요([모니터링](/qorel/monitoring)).

## 접근 방법 {#how-to-access}

- **파일 위치.** 타르볼 또는 Homebrew 설치는 `~/.hermes/config.toml`, `.deb`와 `.rpm`은 `/etc/qorel/config.toml`, 컨테이너는 마운트한 디렉터리입니다. `--config <path>`로 덮어쓸 수 있습니다.
- **키 저장소.** `key_store_folder`가 키 보관 위치를 정합니다. 기본값은 `~/.hermes/keys`이고 패키지는 `/var/lib/qorel/keys`를 사용합니다.
- **사전 요구 사항.** 각 체인의 RPC, gRPC, WebSocket 엔드포인트와 각 체인에 잔액이 있는 릴레이어 계정.
- **설정 확인.** `qorel health-check`는 파일을 로드하고 각 체인을 테스트합니다.

## 배포 위치 {#where-published}

| 내용 | 위치 |
|---|---|
| 예제 설정(테스트넷, QoreChain 및 Cosmos Hub 공개 테스트넷) | [qorechain/QORel](https://github.com/qorechain/QORel)의 `packaging/config.example.toml`. 패키지는 `/etc/qorel/config.example.toml`에 설치합니다 |
| Hermes 설정 레퍼런스 | [hermes.informal.systems](https://hermes.informal.systems) |

## 한계와 알려진 문제 {#limits}

- **정적 `extension_options`는 거부됩니다.** `signing = 'qorechain-hybrid'`인 체인에서는 사용할 수 없습니다.
- **`pqc.sign_bytes`는 `auto`로 두세요.** 체인이 검증하는 형식과 맞지 않는 고정 `v1` 또는 `v2`는 체인이 모든 트랜잭션을 거부하게 만듭니다.
- **이전 키의 모드.** 이전 Hermes가 기록한 파일은 기존 권한을 유지합니다.
- **서드파티 엔드포인트.** 예제 설정의 Hub 쪽 엔드포인트는 QoreChain이 운영하지 않으며 바뀌거나 속도 제한이 걸릴 수 있습니다.
- **테스트넷 항목만 해당.** 여기의 QoreChain 항목은 `qorechain-diana`용입니다. 메인넷은 IBC에 열려 있지 않습니다.
