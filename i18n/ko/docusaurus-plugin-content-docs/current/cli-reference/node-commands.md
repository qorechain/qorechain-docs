---
slug: /cli-reference/node-commands
title: 노드 명령어
sidebar_label: 노드 명령어
sidebar_position: 1
---

# 노드 명령어

QoreChain 노드를 초기화, 설정, 운영하는 데 사용하는 `qorechaind` 명령어 레퍼런스입니다.

:::note
QoreChain은 두 개의 네트워크를 운영합니다: **`qorechain-vladi`** 메인넷(2026년 6월 7일부터 체인 버전 **v3.1.92**로 운영 중)과 **`qorechain-diana`** 테스트넷입니다. 참여하려는 네트워크에 맞는 `--chain-id`를 지정하세요 — 아래 예시는 테스트넷을 대상으로 하며, 메인넷의 경우 `--chain-id qorechain-vladi`를 사용하세요.
:::

---

## init

주어진 모니커로 새 노드를 초기화합니다.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| 플래그          | 타입   | 설명                                    |
| ------------- | ------ | ---------------------------------------------- |
| `--chain-id`  | string | 체인 식별자 (필수)                    |
| `--home`      | string | 노드 홈 디렉터리 (기본값: `~/.qorechaind`) |
| `--overwrite` | bool   | 기존 제네시스 및 설정 파일을 덮어씁니다    |

`--home` 아래에 `config/`, `data/` 디렉터리 구조와 초기 `genesis.json`을 생성합니다.

---

## start

노드를 시작하고 동기화 또는 블록 생성을 개시합니다.

```bash
qorechaind start [flags]
```

| 플래그                   | 타입   | 설명                                          |
| ---------------------- | ------ | ---------------------------------------------- |
| `--home`               | string | 노드 홈 디렉터리                                  |
| `--minimum-gas-prices` | string | 수락할 최소 가스 가격 (예: `0.001uqor`)     |
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

## config

노드 설정 값을 읽거나 씁니다.

### 설정 값 지정

```bash
qorechaind config set <key> <value>
```

### 설정 값 조회

```bash
qorechaind config get <key>
```

일반적인 설정 키로는 `chain-id`, `keyring-backend`, `output`, `node`가 있습니다.

---

## keys

트랜잭션 서명을 위한 로컬 키링을 관리합니다.

### 새 키 추가

```bash
qorechaind keys add <name> [flags]
```

| 플래그                   | 타입   | 설명                                     |
| ---------------------- | ------ | ----------------------------------------------- |
| `--keyring-backend`    | string | 백엔드: `os`, `file`, `test`                   |
| `--algo`               | string | 키 알고리즘: `secp256k1` (기본값), `ed25519` |
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

### 제네시스 파일 검증

```bash
qorechaind genesis validate-genesis
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
