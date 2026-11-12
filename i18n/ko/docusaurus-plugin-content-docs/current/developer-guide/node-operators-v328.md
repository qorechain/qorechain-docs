---
slug: /developer-guide/node-operators-v328
title: "노드 운영자: v3.2.8 체크리스트"
sidebar_label: 노드 운영자 v3.2.8
sidebar_position: 11
---

# 노드 운영자: v3.2.8 체크리스트

릴리스 **v3.2.8**은 2026년 11월 12일(높이 9,929,500)부터 테스트넷 `qorechain-diana`에서 실행되고 있습니다. 메인넷 `qorechain-vladi`는 v3.2.6에 머물러 있으며 v3.2.8 날짜가 아직 없으므로, 이 페이지의 내용은 현재 메인넷 노드에는 적용되지 않습니다.

이 페이지는 v3.2.8에서 노드 운영자가 확인하고 변경해야 할 사항의 짧은 목록입니다. 번들에 들어 있는 공유 라이브러리, 컨트랙트 런타임 설정, 새로운 `app.toml` 기본값, 새 REST 경로 하나, 그리고 아직 v3.2.7에 있는 노드를 업그레이드하는 단계를 다룹니다. 전체 노드 가이드는 [노드 실행](/developer-guide/running-a-node)을 참고하세요.

**중요한 이유.** v3.2.8은 새로운 컨트랙트 런타임 라이브러리로 스마트 컨트랙트를 실행하며, 컨트랙트 호출이 사용하는 메모리와 코드 로딩에 대해 비용을 부과합니다. 이전 라이브러리 폴더를 그대로 두거나 컨트랙트 메모리를 너무 적게 설정한 노드는 시작되지 않거나 뒤처집니다. 나머지 체크리스트는 소규모 설정 작업입니다.

## 1. `lib/` 폴더 전체를 복사하세요 {#lib-folder}

릴리스 번들에는 `qorechaind`와 공유 라이브러리 네 개가 들어 있는 `lib/` 폴더가 있습니다.

| 라이브러리 | 역할 |
| --- | --- |
| `libqorepqc.so` | 포스트 퀀텀 서명 검증 |
| `libqoresvm.so` | SVM 런타임 |
| `libwasmvm.x86_64.so` | 업스트림 컨트랙트 런타임 라이브러리 |
| `libwasmvmqore_v1.x86_64.so` | v3.2.8에서 새로 추가됨: QoreChain 컨트랙트 런타임 라이브러리 |

개별 파일이 아니라 **폴더 전체**를 복사하세요. Dockerfile의 `COPY lib/ ...` 줄이나 베어메탈 호스트의 `cp -r lib/* ...`는 이후 릴리스에서 라이브러리가 추가되어도 계속 동작하지만, 파일 이름을 나열한 목록은 그렇지 않습니다.

```bash
tar -xzf qorechaind-v3.2.8-b3-linux-amd64.tar.gz
sudo cp qorechaind /usr/local/bin/qorechaind
sudo cp -r lib/. /opt/qorechain/lib/
```

로더가 복사한 폴더를 가리키게 한 다음(이미 사용 중인 `LD_LIBRARY_PATH` 또는 `ld.so.conf.d` 항목) 재시작하세요. 위 명령은 하나의 예시 패턴이므로, 자신의 설치 경로를 사용하세요.

## 2. 컨트랙트 메모리 캐시: 최소 256 MiB {#memory-cache}

컨트랙트 런타임은 컴파일된 컨트랙트를 메모리에 보관합니다. `app.toml`의 `[wasm]` 섹션에서 `memory_cache_size`는 **256 MiB 이상**이어야 합니다.

```toml
[wasm]
memory_cache_size = 256
```

256보다 작은 값은 노드가 시작될 때 256으로 올려지며, 노드는 경고를 기록합니다. 사양이 작은 머신에서는 추가 메모리를 감안하세요.

## 3. 컨트랙트 디렉터리는 이제 `<home>/wasm` {#wasm-directory}

컴파일된 컨트랙트 코드는 이제 `<home>/wasm`에 저장됩니다. 여기서 `<home>`은 노드를 시작할 때 지정하는 디렉터리(`--home`)입니다. 컨트랙트 코드가 여전히 이전 위치에 있는 노드는 그 위치를 계속 사용하며 경고를 기록합니다. 편한 때에 폴더를 옮기면 되며, 먼저 노드를 중지하세요.

## 4. 새로운 `app.toml` 기본값 {#app-toml-defaults}

v3.2.8로 초기화한 노드는 다음 기본값을 기록합니다. 기존 `app.toml` 파일은 **다시 쓰이지 않으므로**, 업그레이드된 노드는 직접 바꾸기 전까지 이전 값을 유지합니다.

| 설정 | 새 기본값 | 역할 |
| --- | --- | --- |
| `simulation_gas_limit` | `50000000` | 이 노드에서 시뮬레이션되는 트랜잭션의 가스 한도. 지갑과 SDK는 전송 전에 시뮬레이션하며, 높은 한도 덕분에 큰 컨트랙트 호출도 시뮬레이션할 수 있습니다 |
| JSON-RPC `api` 네임스페이스 | `eth,net,web3` | `txpool` 네임스페이스는 노드의 대기 중인 트랜잭션을 공개하기 때문에 기본적으로 제공되지 않습니다. 필요한 경우에만 `txpool`을 직접 추가하세요 |

```toml
simulation_gas_limit = 50000000

[json-rpc]
api = "eth,net,web3"
```

## 5. 쿼리 가스 한도 {#query-gas-limit}

컨트랙트 쿼리는 `app.toml`의 `[wasm]` 섹션이 제어하는 노드 로컬 가스 한도 아래에서 실행됩니다. 체인 팀은 검증인에서 이를 `0`(제한 없음)으로 설정할 것을 권장합니다.

```toml
[wasm]
query_gas_limit = 0
```

이 설정은 컨트랙트 쿼리에 대해 자신의 노드가 응답하는 내용만 바꾸며, 어떤 블록이 포함해야 하는 내용은 바꾸지 않습니다. 이는 검증인에 대한 체인 팀의 권장 사항이며, 공개 쿼리를 제공하는 노드는 유한한 한도를 선호할 수 있습니다.

## 6. 새 경로: `GET /qorechain/svm/v1/params` {#svm-params}

v3.2.8은 SVM 모듈 파라미터를 위한 읽기 전용 경로를 추가합니다. v3.2.8을 실행하는 노드(테스트넷)에서 제공되며, 릴리스가 적용되지 않은 메인넷에서는 HTTP `501`로 응답합니다.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

2026년 11월 12일 테스트넷의 응답:

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":false,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

| 필드 | 의미 |
| --- | --- |
| `enabled` | SVM 트랜잭션 레인이 열려 있는지 여부. 업그레이드 이후 테스트넷에서는 `false`이므로, 거버넌스가 다시 열 때까지 SVM 쓰기는 거부됩니다 |
| `max_program_size`, `max_account_data_size` | 바이트 단위 크기 제한(각각 10,485,760) |
| `compute_budget_max` | 트랜잭션이 요청할 수 있는 최대 컴퓨트 예산(1,400,000) |
| `lamports_per_byte`, `rent_exemption_multi` | 스토리지 가격 입력값 |
| `svm_slot_offset`, `default_sig_scheme`, `max_cpi` | 슬롯 번호 오프셋, 기본 서명 방식, 프로그램 간 호출 깊이 제한 |
| `max_custody_uqor`, `max_custody_hard_uqor`, `max_account_excess_uqor` | SVM 계정이 보유할 수 있는 네이티브 QOR의 한도(uqor 단위) |

SVM 전송 버튼을 보여 주기 전에 `enabled`를 읽으세요. [SVM 개발](/developer-guide/svm-development)을 참고하세요. 경로 `GET /qorechain/svm/v1/cluster_info`는 클러스터 식별 정보를 반환하는 별도의 경로입니다.

## 7. 매니페스트 확인 {#manifest}

매니페스트는 어떤 바이너리를 설치할지에 대한 기준 정보입니다.

```bash
curl -s https://download.qore.host/testnet/latest.json | jq '{version, minCompatible, upgradeType, upgradeHeight, binary: .binary.url}'
```

2026년 11월 12일에는 `version` `3.2.8`, `minCompatible` `3.2.8`, `upgradeType` `height`, `upgradeHeight` `9929500`, 바이너리 `qorechaind-v3.2.8-b3-linux-amd64.tar.gz`로 응답했습니다. `binary.url`을 신뢰하기 전에 `version`이 `minCompatible`과 같은지 확인하고, 같은 파일의 `sha256`으로 아카이브를 검증하세요. 메인넷 매니페스트는 `https://download.qore.host/mainnet/latest.json`에 있으며, 메인넷 업그레이드가 공지되기 전까지는 v3.2.6을 가리킵니다.

## 8. 아직 v3.2.7인 노드 업그레이드 {#upgrade-from-v327}

테스트넷 업그레이드 높이가 지났으므로, 아직 v3.2.7인 노드는 높이 9,929,500에서 `UPGRADE "v3.2.8" NEEDED`와 함께 정지합니다. 상태는 유지되며 재동기화할 필요가 없습니다.

1. 매니페스트에 명시된 아카이브를 다운로드하고 SHA-256을 검증합니다.
2. 노드를 중지합니다.
3. `qorechaind`를 교체하고 `lib/` 폴더 전체를 복사합니다([1단계](#lib-folder)).
4. `[wasm] memory_cache_size`를 확인하고([2단계](#memory-cache)), `simulation_gas_limit`, JSON-RPC 네임스페이스, `query_gas_limit`을 결정합니다([4단계와 5단계](#app-toml-defaults)).
5. 노드를 시작하고 로그를 지켜봅니다. 컨트랙트 디렉터리나 메모리 캐시에 대한 경고는 아직 바꾸지 않았다면 예상되는 현상입니다.
6. 체인을 따라가고 있는지 확인합니다.

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params | jq '.params.enabled'
```

테스트넷에 새로 합류하는 노드는 v3.2.8 바이너리로 바로 시작합니다. 스테이트 싱크와 피어는 [테스트넷 연결하기](/getting-started/connecting-to-testnet)를, 업그레이드 이력은 [노드 실행](/developer-guide/running-a-node#upgrades)을 참고하세요.

## 제한과 오류

| 보이는 현상 | 의미 | 대처 방법 |
| --- | --- | --- |
| `UPGRADE "v3.2.8" NEEDED`와 함께 노드가 높이 9,929,500에서 정지 | 노드가 아직 v3.2.7 바이너리를 사용 중입니다 | 8단계 |
| 공유 라이브러리가 없다는 시작 오류 | `lib/`를 전체 복사하지 않았거나 로더가 그 위치를 가리키지 않습니다 | 1단계 |
| `memory_cache_size`가 올려졌다는 경고 | 설정된 값이 256 MiB보다 작습니다 | 256 이상으로 설정하세요 |
| 컨트랙트 디렉터리에 대한 경고 | 컨트랙트 코드가 아직 이전 위치에 있습니다 | 편할 때 `<home>/wasm`으로 옮기세요 |
| `/qorechain/svm/v1/params`에서 `501` | 노드가 v3.2.8이 아닙니다(현재 메인넷) | 메인넷에서는 예상되는 응답입니다 |

## 관련 페이지

* [노드 실행](/developer-guide/running-a-node), [v3.2.8의 컨트랙트 런타임](/developer-guide/running-a-node#v328-node) 포함
* [검증인 실행](/developer-guide/running-a-validator)
* [테스트넷 연결하기](/getting-started/connecting-to-testnet)
* [REST 및 gRPC 엔드포인트](/api-reference/rest-grpc-endpoints)
