---
slug: /cli-reference/node-commands
title: 노드 명령어
sidebar_label: 노드 명령어
sidebar_position: 1
---

# 노드 명령어

QoreChain 노드를 초기화, 구성, 운영하는 데 사용되는 `qorechaind` 명령어에 대한 참조입니다.

:::note
QoreChain은 두 개의 네트워크를 실행합니다: **`qorechain-vladi`** 메인넷(2026년 6월 7일부터 체인 버전 **v3.1.80**에서 라이브)과 **`qorechain-diana`** 테스트넷. 참여하려는 네트워크에 맞는 `--chain-id`를 전달하세요 — 아래 예시는 테스트넷을 대상으로 하며, 메인넷의 경우 `--chain-id qorechain-vladi`를 사용하세요.
:::

---

## init

지정된 모니커로 새 노드를 초기화합니다.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| 플래그        | 유형   | 설명                                            |
| ------------- | ------ | ---------------------------------------------- |
| `--chain-id`  | string | 체인 식별자(필수)                               |
| `--home`      | string | 노드 홈 디렉터리(기본값: `~/.qorechaind`)       |
| `--overwrite` | bool   | 기존 제네시스 및 구성 파일 덮어쓰기              |

`--home` 아래에 `config/`, `data/`, 그리고 초기 `genesis.json`을 포함한 디렉터리 구조를 생성합니다.

---

## start

노드를 시작하고 동기화 또는 블록 생성을 시작합니다.

```bash
qorechaind start [flags]
```

| 플래그                  | 유형   | 설명                                                 |
| ---------------------- | ------ | ---------------------------------------------------- |
| `--home`               | string | 노드 홈 디렉터리                                     |
| `--minimum-gas-prices` | string | 수락할 최소 가스 가격(예: `0.001uqor`)               |
| `--pruning`            | string | 가지치기 전략: `default`, `nothing`, `everything`     |
| `--halt-height`        | uint   | 이 블록 높이에서 노드 중지                           |
| `--halt-time`          | uint   | 이 Unix 타임스탬프에서 노드 중지                     |
| `--log_level`          | string | 로그 상세도: `info`, `debug`, `warn`, `error`        |
| `--trace`              | bool   | 오류 발생 시 전체 스택 트레이스 활성화               |

---

## version

`qorechaind` 바이너리 버전 및 빌드 정보를 출력합니다.

```bash
qorechaind version
```

Go 버전, 커밋 해시, 빌드 태그를 포함한 확장된 빌드 세부 정보를 보려면 `--long`을 사용하세요:

```bash
qorechaind version --long
```

---

## status

실행 중인 노드에 동기화 상태, 최신 블록 높이, 합의 정보를 포함한 현재 상태를 쿼리합니다.

```bash
qorechaind status
```

| 플래그   | 유형   | 설명                                            |
| -------- | ------ | ----------------------------------------------- |
| `--node` | string | RPC 엔드포인트(기본값: `tcp://localhost:26657`)  |

`node_info`, `sync_info`, `validator_info` 섹션이 포함된 JSON을 반환합니다.

---

## config

노드 구성의 값을 읽거나 씁니다.

### 구성 값 설정

```bash
qorechaind config set <key> <value>
```

### 구성 값 가져오기

```bash
qorechaind config get <key>
```

일반적인 구성 키에는 `chain-id`, `keyring-backend`, `output`, `node`가 있습니다.

---

## keys

트랜잭션 서명을 위한 로컬 키링을 관리합니다.

### 새 키 추가

```bash
qorechaind keys add <name> [flags]
```

| 플래그                  | 유형   | 설명                                            |
| ---------------------- | ------ | ----------------------------------------------- |
| `--keyring-backend`    | string | 백엔드: `os`, `file`, `test`                     |
| `--algo`               | string | 키 알고리즘: `secp256k1`(기본값), `ed25519`      |
| `--recover`            | bool   | 니모닉에서 키 복구                               |
| `--multisig`           | string | 멀티시그를 위한 쉼표로 구분된 키 목록            |
| `--multisig-threshold` | uint   | 필요한 최소 서명 수                              |

### 모든 키 나열

```bash
qorechaind keys list --keyring-backend <backend>
```

### 키 세부 정보 표시

```bash
qorechaind keys show <name> [flags]
```

| 플래그      | 유형   | 설명                                |
| ----------- | ------ | ----------------------------------- |
| `--bech`    | string | 출력 형식: `acc`, `val`, `cons`      |
| `--address` | bool   | 주소만 표시                         |
| `--pubkey`  | bool   | 공개 키만 표시                      |

### 키 삭제

```bash
qorechaind keys delete <name> --keyring-backend <backend>
```

### 키 내보내기(Armor 암호화)

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

| 플래그                | 유형   | 설명                              |
| -------------------- | ------ | --------------------------------- |
| `--vesting-amount`   | string | 베스팅 금액                       |
| `--vesting-end-time` | int    | 베스팅 종료 시간(Unix 타임스탬프)  |

### 제네시스 트랜잭션 생성

```bash
qorechaind genesis gentx <key-name> <stake-amount> [flags]
```

| 플래그                   | 유형   | 설명                    |
| ----------------------- | ------ | ----------------------- |
| `--chain-id`            | string | 체인 식별자             |
| `--moniker`             | string | 검증자 모니커           |
| `--commission-rate`     | string | 초기 수수료율           |
| `--commission-max-rate` | string | 최대 수수료율           |

### 제네시스 트랜잭션 수집

```bash
qorechaind genesis collect-gentxs
```

### 제네시스 파일 검증

```bash
qorechaind genesis validate-genesis
```

---

## 합의 엔진

이 하위 명령어들은 QoreChain 합의 엔진 레이어와 상호작용합니다.

### 검증자 키 표시

```bash
qorechaind comet show-validator
```

JSON 형식으로 합의 공개 키를 출력합니다. 검증자 신원을 확인하는 데 사용됩니다.

### 노드 ID 표시

```bash
qorechaind comet show-node-id
```

P2P 노드 식별자(16진수 인코딩)를 출력합니다. 영구 피어 구성에 사용됩니다.

---

## export

현재 체인 상태를 JSON 제네시스 파일로 내보냅니다. 체인 업그레이드나 스냅샷에 유용합니다.

```bash
qorechaind export [flags]
```

| 플래그               | 유형   | 설명                                      |
| ------------------- | ------ | ----------------------------------------- |
| `--for-zero-height` | bool   | 높이 0에서 재시작하기 위한 내보내기 준비    |
| `--height`          | int    | 특정 블록 높이에서 상태 내보내기           |
| `--home`            | string | 노드 홈 디렉터리                          |

---

## rollback

체인 상태를 한 블록 롤백합니다. 합의 실패에서 복구하는 데 유용합니다.

```bash
qorechaind rollback [flags]
```

| 플래그   | 유형   | 설명                                              |
| -------- | ------ | -------------------------------------------------- |
| `--hard` | bool   | 블록 저장소에서도 마지막 블록 제거                  |
| `--home` | string | 노드 홈 디렉터리                                   |

이 명령어는 애플리케이션 상태와 합의 상태를 모두 롤백합니다. 취소할 수 없으므로 주의해서 사용하세요.
