---
slug: /cli-reference/node-commands
title: 노드 명령어
sidebar_label: 노드 명령어
sidebar_position: 1
---

# 노드 명령어

QoreChain 노드를 초기화, 설정, 운영하는 데 사용하는 `qorechaind` 명령어 레퍼런스입니다.

:::note
QoreChain은 두 개의 네트워크를 운영합니다: **`qorechain-vladi`** 메인넷(2026년 6월 7일부터 운영 중이며, 노드 릴리스 **v3.2.4**는 2026년 10월 23일 높이 3,742,566에서 거버넌스 제안 13으로 적용됨. v3.2.3은 2026년 10월 20일 높이 3,662,051에서 적용됨)과 **`qorechain-diana`** 테스트넷(노드 릴리스 **v3.2.6**은 2026년 10월 27일 높이 8,970,638에서 적용됨. 그 전에 v3.2.5가 2026년 10월 26일 높이 8,890,800에서, v3.2.4가 2026년 10월 19일 높이 8,337,253에서 적용됨)입니다. 메인넷 거버넌스 제안 14가 투표 기간 중이며, 이 제안은 높이 3,906,833에서 v3.2.5를 적용합니다. 해당 릴리스가 바꾸는 내용은 메인넷이 이를 적용한 뒤에 문서화됩니다. 참여하려는 네트워크에 맞는 `--chain-id`를 지정하세요 — 아래 예시는 테스트넷을 대상으로 하며, 메인넷의 경우 `--chain-id qorechain-vladi`를 사용하세요. 각 네트워크의 현재 릴리스는 [download.qore.host](https://download.qore.host)의 `latest.json`에 나와 있습니다.

이 페이지의 명령어는 v3.2.3 릴리스 바이너리를 기준으로 확인했습니다. v3.2.4 바이너리에는 v3.2.3 바이너리에 없는 명령어가 추가되어 있으며(예: `stakingtier`), 이러한 명령어는 두 네트워크 모두에서 실행됩니다(테스트넷은 2026년 10월 19일부터, 메인넷은 2026년 10월 23일부터). 이 매뉴얼에서 그런 명령어를 언급하는 경우 이를 명시합니다. v3.2.6 바이너리(테스트넷)는 두 가지 쿼리 명령어 `query rlconsensus applied-params`와 `last-action`을 추가합니다. 이들은 메인넷이 해당 릴리스를 적용할 때까지 테스트넷 전용입니다([쿼리 명령어](/cli-reference/query-commands#rlconsensus) 참조). 이 페이지의 나머지 내용은 두 릴리스에서 동일하게 동작합니다.
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
| `--pruning`            | string | 프루닝 전략: `default`, `nothing`, `everything`, `custom` (`--pruning-keep-recent` 및 `--pruning-interval`과 함께 사용) |
| `--halt-height`        | uint   | 해당 블록 높이에서 노드를 정지합니다                   |
| `--halt-time`          | uint   | 해당 Unix 타임스탬프에서 노드를 정지합니다                |
| `--log_level`          | string | 로그 상세 수준: `info`, `debug`, `warn`, `error`      |
| `--trace`              | bool   | 오류 발생 시 전체 스택 트레이스를 활성화합니다                |

공개 소스 트리로 빌드한 바이너리(커뮤니티 빌드)는 `qorechain-vladi` 또는 `qorechain-diana`에서 시작을 거부합니다. 양자내성 서명을 검증할 수 없고 네트워크의 블록을 정확하게 재생할 수 없기 때문입니다(노드 릴리스 v3.2.3 이후). [download.qore.host](https://download.qore.host)의 릴리스 바이너리를 사용하세요. [소스에서 빌드하기](/developer-guide/building-from-source)를 참조하세요.

---

## version

릴리스 바이너리에서 `qorechaind version`은 릴리스 번호를 **출력하지 않습니다**: 빈 줄을 출력하며, `version --long`도 빌드 세부 정보를 추가하지 않습니다. 릴리스를 구분하는 데 이 명령어에 의존하지 마세요. 실행 중인 버전을 확인하려면 다음을 사용하세요.

- 압축을 풀기 전에 **다운로드한 아카이브**의 SHA-256을 네트워크 [매니페스트](https://download.qore.host/mainnet/latest.json)의 `binary.sha256`과 비교하세요(설치한 내용의 기록으로 그 아카이브 또는 체크섬을 보관하세요).
- 체인에 적용된 업그레이드를 조회하세요: `GET /cosmos/upgrade/v1beta1/applied_plan/<upgrade_name>`은 업그레이드가 적용된 높이를 반환하며, 적용되지 않았으면 `0`을 반환합니다.

```bash
# archive checksum, as published
curl -s https://download.qore.host/mainnet/latest.json | jq -r '.version, .binary.sha256'
# has v3.2.3 / v3.2.4 been applied on mainnet, and at which height? (a name that was not applied returns {"height":"0"}, e.g. v3.2.5 today)
curl -s https://api.qore.host/cosmos/upgrade/v1beta1/applied_plan/v3.2.3   # {"height":"3662051"}
curl -s https://api.qore.host/cosmos/upgrade/v1beta1/applied_plan/v3.2.4   # {"height":"3742566"}
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
