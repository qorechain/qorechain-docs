---
slug: /cli-reference/node-commands
title: 노드 명령어
sidebar_label: 노드 명령어
sidebar_position: 1
---

# 노드 명령어

QoreChain 노드를 초기화, 설정, 운영하는 데 사용하는 `qorechaind` 명령어 레퍼런스입니다.

:::note
QoreChain은 두 개의 네트워크를 운영합니다: **`qorechain-vladi`** 메인넷(2026년 6월 29일부터 운영 중이며, 현재 노드 릴리스는 **v3.2.1**)과 **`qorechain-diana`** 테스트넷(노드 릴리스 **v3.2.2**)입니다. 참여하려는 네트워크에 맞는 `--chain-id`를 지정하세요 — 아래 예시는 테스트넷을 대상으로 하며, 메인넷의 경우 `--chain-id qorechain-vladi`를 사용하세요. 각 네트워크의 현재 릴리스는 [download.qore.host](https://download.qore.host)의 `latest.json`에 나와 있습니다.
:::

---

## init

주어진 모니커로 새 노드를 초기화합니다.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| 플래그          | 타입   | 설명                                    |
| ------------- | ------ | ---------------------------------------------- |
| `--chain-id`  | string | 체인 식별자 (항상 지정하세요. 생략하면 임의의 식별자가 생성됩니다) |
| `--home`      | string | 노드 홈 디렉터리 (기본값: `~/.qorechaind`) |
| `--overwrite` | bool   | 기존 `genesis.json`을 덮어씁니다    |
| `--recover`   | bool   | 키를 새로 만들지 않고 시드 문구를 입력하여 기존 키를 복구합니다 |

`--home` 아래에 `config/`, `data/` 디렉터리 구조와 초기 `genesis.json`을 생성합니다. 네트워크 노드의 경우, 시작하기 전에 이 `genesis.json`을 해당 네트워크의 제네시스 파일로 교체하세요([메인넷 연결하기](/getting-started/connecting-to-mainnet) 참조).

`init`은 또한 네트워크의 EVM 체인 ID(`qorechain-vladi`는 `9801`, `qorechain-diana`는 `9800`)를 `app.toml`의 `evm-chain-id` 설정에 기록하므로, 올바른 `--chain-id`를 지정하세요.

---

## start

노드를 시작하고 동기화 또는 블록 생성을 개시합니다.

```bash
qorechaind start [flags]
```

| 플래그                   | 타입   | 설명                                          |
| ---------------------- | ------ | ---------------------------------------------- |
| `--home`               | string | 노드 홈 디렉터리                                  |
| `--minimum-gas-prices` | string | 이 노드가 수락하는 최소 가스 가격. 네트워크 하한은 `0.1uqor`이므로 최소한 그 값 이상으로 설정하세요 |
| `--pruning`            | string | 프루닝 전략: `default`, `nothing`, `everything` |
| `--halt-height`        | uint   | 해당 블록 높이에서 노드를 정지합니다                   |
| `--halt-time`          | uint   | 해당 Unix 타임스탬프에서 노드를 정지합니다                |
| `--log_level`          | string | 로그 상세 수준: `info`, `debug`, `warn`, `error`      |
| `--trace`              | bool   | 오류 발생 시 전체 스택 트레이스를 활성화합니다                |

---

## version

`qorechaind` 바이너리 버전과 빌드 정보를 출력합니다.

```bash
qorechaind version
```

Go 버전, 커밋 해시, 빌드 태그를 포함한 확장 빌드 정보를 보려면 `--long`을 사용하세요.

```bash
qorechaind version --long
```

---

## status

실행 중인 노드에 현재 상태를 조회합니다. 동기화 상태, 최신 블록 높이, 합의 정보를 포함합니다.

```bash
qorechaind status
```

| 플래그     | 타입   | 설명                                     |
| -------- | ------ | ----------------------------------------------- |
| `--node` | string | RPC 엔드포인트 (기본값: `tcp://localhost:26657`) |

`node_info`, `sync_info`, `validator_info` 섹션을 포함한 JSON을 반환합니다.

---

## client configuration

`config` 하위 명령어는 없습니다. 클라이언트 기본값(`chain-id`, `keyring-backend`, `output`, `node`)은 `<home>/config/client.toml`에서 읽습니다. 이 파일을 편집하거나, 명령어마다 플래그(`--chain-id`, `--keyring-backend`, `--output`, `--node`)를 지정하세요.

---

## keys

트랜잭션 서명을 위한 로컬 키링을 관리합니다.

### 새 키 추가

```bash
qorechaind keys add <name> [flags]
```

| 플래그                   | 타입   | 설명                                     |
| ---------------------- | ------ | ----------------------------------------------- |
| `--keyring-backend`    | string | 백엔드: `os`, `file`, `kwallet`, `pass`, `test`, `memory` |
| `--key-type`           | string | 키 알고리즘: `secp256k1` (기본값) 또는 `eth_secp256k1` |
| `--coin-type`          | uint32 | HD 코인 타입 (기본값 `118`)                    |
| `--recover`            | bool   | 니모닉으로부터 키를 복구합니다                       |
| `--multisig`           | string | 멀티시그에 사용할 키의 콤마 구분 목록       |
| `--multisig-threshold` | uint   | 필요한 최소 서명 수                     |

### 전체 키 목록 조회

```bash
qorechaind keys list --keyring-backend <backend>
```

### 키 상세 정보 조회

```bash
qorechaind keys show <name> [flags]
```

| 플래그        | 타입   | 설명                         |
| ----------- | ------ | ----------------------------------- |
| `--bech`    | string | 출력 형식: `acc`, `val`, `cons` |
| `--address` | bool   | 주소만 표시합니다                   |
| `--pubkey`  | bool   | 공개 키만 표시합니다               |

### 키 삭제

```bash
qorechaind keys delete <name> --keyring-backend <backend>
```

### 키 내보내기 (암호화된 아머 형식)

```bash
qorechaind keys export <name>
```

### 키 가져오기

```bash
qorechaind keys import <name> <keyfile>
```

---

## genesis

제네시스 파일을 관리합니다.

### 제네시스 계정 추가

```bash
qorechaind genesis add-genesis-account <address> <coins> [flags]
```

| 플래그                 | 타입   | 설명                       |
| -------------------- | ------ | --------------------------------- |
| `--vesting-amount`   | string | 베스팅 수량                    |
| `--vesting-start-time` | int  | 베스팅 시작 시각 (Unix 타임스탬프) |
| `--vesting-end-time` | int    | 베스팅 종료 시각 (Unix 타임스탬프) |

### 제네시스 트랜잭션 생성

```bash
qorechaind genesis gentx <key-name> <stake-amount> [flags]
```

| 플래그                    | 타입   | 설명             |
| ----------------------- | ------ | ----------------------- |
| `--chain-id`            | string | 체인 식별자        |
| `--moniker`             | string | 검증인 모니커       |
| `--commission-rate`     | string | 초기 수수료율 |
| `--commission-max-rate` | string | 최대 수수료율 |

### 제네시스 트랜잭션 수집

```bash
qorechaind genesis collect-gentxs
```

다른 `genesis` 하위 명령어: `bulk-add-genesis-account`, `migrate`.

### 제네시스 파일 검증

```bash
qorechaind genesis validate
```

---

## 합의 엔진

이 하위 명령어들은 QoreChain 합의 엔진 계층과 상호작용합니다.

### 검증인 키 표시

```bash
qorechaind comet show-validator
```

합의 공개 키를 JSON 형식으로 출력합니다. 검증인 신원을 확인하는 데 사용됩니다.

### 노드 ID 표시

```bash
qorechaind comet show-node-id
```

P2P 노드 식별자(16진수 인코딩)를 출력합니다. 영구 피어 설정에 사용됩니다.

---

## export

현재 체인 상태를 JSON 제네시스 파일로 내보냅니다. 체인 업그레이드나 스냅샷에 유용합니다.

```bash
qorechaind export [flags]
```

| 플래그                | 타입   | 설명                               |
| ------------------- | ------ | ----------------------------------------- |
| `--for-zero-height` | bool   | 높이 0에서 재시작하기 위한 내보내기를 준비합니다 |
| `--height`          | int    | 특정 블록 높이에서 상태를 내보냅니다   |
| `--home`            | string | 노드 홈 디렉터리                       |
| `--output-document` | string | 내보내기 결과를 STDOUT 대신 이 파일에 기록합니다 |
| `--modules-to-export` | strings | 내보낼 모듈의 콤마 구분 목록 (기본값: 전체) |
| `--jail-allowed-addrs` | strings | 투옥 해제할 투옥된 검증인의 운영자 주소 |

---

## rollback

체인 상태를 한 블록 되돌립니다. 합의 실패로부터 복구할 때 유용합니다.

```bash
qorechaind rollback [flags]
```

| 플래그     | 타입   | 설명                                        |
| -------- | ------ | -------------------------------------------------- |
| `--hard` | bool   | 블록 저장소에서도 마지막 블록을 제거합니다 |
| `--home` | string | 노드 홈 디렉터리                                |

이 명령어는 애플리케이션 상태와 합의 상태를 모두 되돌립니다. 되돌릴 수 없으므로 신중하게 사용하세요.
