---
slug: /developer-tools/mcp
title: QoreChain MCP 서버
sidebar_label: MCP 서버
sidebar_position: 23
---

# QoreChain MCP 서버 (`@qorechain/mcp`)

QoreChain MCP 서버는 [Model Context Protocol](https://modelcontextprotocol.io)을 통해 AI 에이전트와 개발자 도구에 QoreChain 읽기 접근을 제공합니다. 블록, 트랜잭션, 계정, 검증자, 스테이킹 티어, 하이브리드 secp256k1 + ML-DSA-87(FIPS 204) 서명의 상태, EVM 컨트랙트 읽기, 시뮬레이션과 수수료 추정, 그리고 계정 소유자가 자신의 지갑에서 서명하는 미서명 전송을 다룹니다. MCP를 지원하는 클라이언트나 에이전트를 QoreChain에 연결하려는 개발자, 그리고 출력이 안정적인 스크립트 가능한 읽기 전용 체인 뷰를 원하는 팀을 위한 서버입니다.

이 서버는 서명하지 않고, 키를 보관하지 않으며, 트랜잭션을 브로드캐스트하지 않습니다. stdio를 통해 사용자의 컴퓨터에서 실행하거나, 직접 호스팅하거나 QoreChain이 호스팅하는 Streamable HTTP 서버로 실행합니다. 버전 **0.1.0**, 2026년 10월 27일 게시, Apache-2.0입니다. 명령줄 쌍둥이인 [`qore`](/developer-tools/qore-cli)는 터미널에서 같은 도구를 실행합니다.

## 혁신 {#innovations}

* **라벨이 아닌 하이브리드 서명 검증.** `get_pq_status`는 트랜잭션 해시를 받아, 본문에 `/qorechain.pqc.v1.PQCHybridSignature` 레이어가 정확히 하나 있는지 확인하고, 서명자가 체인에 등록한 키에 대해 [QoreSign](/qoresign/overview)으로 그 ML-DSA-87 레이어를 로컬에서 검증합니다(sign-bytes v1과 v2를 모두 시도). 결과는 트랜잭션 유형으로 추측한 값이 아니라, 이유가 포함된 `verified: true` 또는 `false`입니다.
* **실제 수수료가 반영된 미서명 전송.** `prepare_transfer`는 보내는 사람의 계정 번호, 시퀀스, 공개 키를 읽고, 올바른 크기의 자리표시자 ML-DSA-87 레이어를 넣어 전송을 시뮬레이션하므로, 가스에 지갑이 서명할 때 추가하는 레이어가 포함됩니다. 그리고 SignDoc, 읽기 쉬운 요약, 점검 결과를 반환합니다. 빠진 것은 소유자의 서명뿐입니다.
* **해석된 거부 사유가 포함된 시뮬레이션.** `simulate_tx`와 `estimate_fee`는 사용된 가스, 권장 가스 한도, 주소별 잔액 변화를 반환하며, 네트워크가 트랜잭션을 거부할 경우 원시 오류 문자열 대신 해석된 거부 사유를 반환합니다.
* **서버와 CLI가 하나의 스키마를 사용.** 모든 `qore` 명령은 MCP 도구 하나를 실행하며, `qore --json`은 해당 도구가 반환하는 JSON을 그대로 출력합니다. Python 패키지도 같은 도구 이름, 입력 및 출력 스키마, 오류 코드를 제공하며, 둘 다 동일하게 기록된 체인 응답으로 테스트됩니다.
* **비밀 정보는 컴퓨터를 떠나기 전에 거부.** 복구 문구처럼 보이는 입력(연속된 BIP-39 단어 12개 이상)이나 32바이트 개인 키 단독 입력은 요청이 전송되기 전에 `INVALID_INPUT`으로 거부되며, 오류 메시지는 해당 비밀 정보가 노출된 것으로 간주하라고 안내합니다.
* **필드 단위로 구성되는 응답.** 모든 출력은 체인 응답의 지정된 필드로 조립됩니다. 업스트림 오류 본문과 스택 트레이스는 클라이언트에 전달되지 않으며, 실패는 일곱 가지 안정적인 오류 코드로 매핑됩니다.

## 활용 사례 {#use-cases}

1. **코딩 어시스턴트에게 체인 상태 묻기.** 개발자가 MCP 호환 편집기에 서버를 추가하고 "메인넷의 최신 블록은 무엇인가요?" 또는 "테스트넷에서 qor1...의 잔액을 보여 주세요"라고 묻습니다. `get_block`과 `get_address_info`가 공개 엔드포인트에서 읽어 탐색기 링크와 함께 답합니다.
2. **트랜잭션에 하이브리드 서명이 있었는지 확인.** 지갑 또는 SDK 개발자가 방금 트랜잭션을 브로드캐스트했고, ML-DSA-87 레이어가 정확히 하나 있으며 그 레이어가 등록된 키에 대해 검증되는지 확인하려고 합니다. `get_pq_status`(또는 `qore pq status <hash>`)가 서명 티어와 로컬 검증 결과를 보고합니다.
3. **사용자가 서명할 전송 준비.** QoreChain 기반으로 만든 어시스턴트가 키를 건드리지 않고 사용자의 QOR 전송을 도와야 합니다. `prepare_transfer`는 읽기 쉬운 요약, 점검 결과, 경고(메인넷용 경고 포함)가 담긴 미서명 SignDoc을 반환하고, `estimate_fee`가 수수료를 알려 줍니다. 사용자는 자신의 지갑에서 서명합니다.
4. **거부된 트랜잭션 디버깅.** 백엔드 팀에 네트워크가 거부하는 인코딩된 트랜잭션이 있습니다. `simulate_tx`는 가스, 주소별 잔액 변화, 해석된 거부 사유를 반환하며 아무것도 브로드캐스트하지 않습니다.
5. **스크립트나 CI 작업에서 컨트랙트 읽기.** dApp 팀이 `qore read-contract --to 0x... --function "balanceOf(address)" --arg 0x... --returns uint256 --json`으로 토큰 잔액이나 컨트랙트 뷰를 확인하고 `jq`로 JSON을 파싱합니다.
6. **검증자 및 스테이킹 대시보드.** 분석가가 본딩된 검증자를 투표권 비율과 수수료율과 함께 나열하고(`get_validators`), 스테이킹 티어 파라미터와 한 보유자의 락업을 읽습니다(`get_staking_tiers`).
7. **팀용 엔드포인트 운영.** 회사가 자체 리버스 프록시 뒤에서 API 키와 속도 제한을 적용해 `qorechain-mcp serve`를 실행하므로, 여러 내부 도구가 자사 노드를 가리키는 하나의 MCP 엔드포인트를 공유합니다.

## 작동 방식 {#how-it-works}

* 서버는 공개 QoreChain 엔드포인트(REST, 합의 RPC, EVM JSON-RPC) 위에서 동작하는 얇은 상태 비저장 리더입니다. 각 업스트림 호출은 10초 타임아웃, 4 MiB 응답 제한, 재시도 없음의 요청 하나입니다.
* 응답은 체인의 응답에서 필드 단위로 구성됩니다. 업스트림 오류 본문, 스택 트레이스, 라이브러리 메시지는 클라이언트에 전달되지 않으며, 예상치 못한 실패는 `INTERNAL_ERROR`가 됩니다. 오류는 `isError: true`인 도구 결과와 JSON 본문으로 돌아옵니다.
* 하이브리드 서명 검사는 [QoreSign](/qoresign/overview)으로 로컬에서 실행됩니다. 서버는 트랜잭션과 서명자가 등록한 ML-DSA-87 키를 가져와 sign-bytes(v1 또는 v2)를 다시 만들고 검증합니다.
* 시뮬레이션: v3.2.5 이상의 체인에서는 시뮬레이션에 이미 ML-DSA-87 검증 비용이 포함되어(`get_chain_info`의 `exact_gas_simulation: true`) 권장 가스 한도가 정확하며, 이전 체인에서는 여유분이 붙습니다. 본문에 ML-DSA-87 레이어가 없으면 `simulate_tx`는 올바른 크기의 자리표시자 레이어(브로드캐스트되지 않음)를 추가하여 가스가 지갑이 서명할 트랜잭션과 일치하도록 합니다(`assume_pqc_layer`, 기본값 true). 서버는 체인의 버전을 스스로 감지합니다.
* EVM 프리컴파일 `0x...0A01`(ML-DSA-87 검증)과 `0x...0A02`(키 상태)는 테스트넷에서만 활성화되어 있으며, 메인넷에서 호출하면 빈 데이터를 반환합니다.
* 기계가 읽을 수 있는 도구 스키마는 저장소에 `spec/tools.json`으로 있으며, 서버 자체의 `tools/list` 응답에서 생성됩니다. 사람이 읽는 레퍼런스는 `docs/tools.md`입니다.

## 사용 방법 {#how-to-use}

npm 패키지는 Node.js 20 이상, Python 패키지는 Python 3.10 이상이 필요합니다.

### npx로 로컬 실행 {#run-npx}

서버가 시작되는지 확인한 다음 MCP 클라이언트에 추가합니다. 로컬 서버를 시작하는 대부분의 클라이언트는 `mcpServers` 객체가 있는 JSON 파일을 읽습니다(파일 이름과 HTTP 서버용 키 이름은 클라이언트마다 다르므로 해당 클라이언트의 문서를 참고하세요).

```bash
npx -y @qorechain/mcp --version
```

```json
{
  "mcpServers": {
    "qorechain": { "command": "npx", "args": ["-y", "@qorechain/mcp"] }
  }
}
```

클라이언트를 다시 시작하면 14개의 도구가 표시됩니다. 서버는 클라이언트와 stdio로 통신합니다. 그런 다음 예를 들어 이렇게 물어보세요.

* "QoreChain 메인넷의 최신 블록은 무엇인가요?" (`get_block`)
* "테스트넷 트랜잭션 F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152에 유효한 ML-DSA-87 레이어가 있나요?" (`get_pq_status`)
* "내 주소에서 qor1...로 1.5 QOR 테스트넷 전송을 준비하고 수수료를 추정해 주세요." (`prepare_transfer`, `estimate_fee`)

### pip 또는 uvx로 로컬 실행 {#run-pip}

```bash
pip install qorechain-mcp
qorechain-mcp --network testnet      # stdio
# or, without installing:
uvx qorechain-mcp
```

```json
{ "mcpServers": { "qorechain": { "command": "uvx", "args": ["qorechain-mcp"] } } }
```

Python 패키지는 stdio만 제공합니다. Streamable HTTP, API 키, 속도 제한이 필요하면 npm 패키지(아래)를 사용하세요. 이 패키지에는 라이브러리 진입점인 `run_tool`도 있습니다.

### HTTP 서버로 실행 {#run-http}

```bash
npx -y @qorechain/mcp serve --port 8787
# listening on http://127.0.0.1:8787/mcp
```

HTTP 전송은 상태를 저장하지 않으며 JSON으로 응답합니다. MCP 요청에는 `POST /mcp`, `{"status":"ok"}`를 반환하는 상태 확인에는 `GET /healthz`를 사용합니다. 옵션은 다음과 같습니다.

| 옵션 | 기본값 | 의미 |
|---|---|---|
| `--port` | 8787 | TCP 포트 |
| `--host` | 127.0.0.1 | 바인드 주소. `0.0.0.0`은 모든 인터페이스에서 수신합니다 |
| `--api-keys-file` | 없음 | 허용되는 키의 SHA-256 해시 파일. 설정하면 요청에 `Authorization: Bearer <key>`가 필요합니다 |
| `--rate-limit` | 60 | API 키별, 클라이언트 IP별 분당 요청 수. `0`이면 끕니다 |
| `--allowed-origin` | 없음 | 엔드포인트를 호출할 수 있는 브라우저 오리진(반복 가능). 다른 오리진은 HTTP 403을 받습니다 |
| `--trust-proxy` | 꺼짐 | 클라이언트 IP를 `X-Forwarded-For`에서 가져옵니다. 직접 관리하는 프록시 뒤에서만 사용하세요 |
| `--network` | testnet | 네트워크를 지정하지 않은 호출에 사용할 네트워크 |

자신의 엔드포인트를 보호하려면 키를 만들고, 해시만 저장하고, 키는 클라이언트에 전달하세요.

```bash
openssl rand -hex 32 > my.key
npx -y @qorechain/mcp hash-key < my.key >> api-keys.txt
npx -y @qorechain/mcp serve --api-keys-file api-keys.txt
```

`api-keys.txt`에는 한 줄에 64자리 16진수 해시 하나가 들어갑니다(선택적으로 `sha256:` 접두사를 허용하며, `#`은 주석을 시작합니다). 키가 없거나 알 수 없는 키는 `UNAUTHORIZED`로 시작하는 오류 메시지와 함께 HTTP 401을 받고, 속도 제한을 넘으면 서버가 `Retry-After`와 함께 HTTP 429로 응답합니다. 컴퓨터 외부에서 접근할 수 있는 모든 서버 앞에는 TLS를 두세요.

이 패키지는 자체 런타임에 내장할 수 있도록 `createServer`, `createHttpHandler`, `startNodeServer`도 내보냅니다. 자세한 내용은 소스 저장소의 [셀프 호스팅](https://github.com/qorechain/qorechain-mcp/blob/main/docs/self-hosting.md) 문서를 참고하세요.

### 설정 {#configuration}

| 설정 | 방법 | 효과 |
|---|---|---|
| 호출별 네트워크 | 모든 도구의 `network` 인수: `testnet` 또는 `mainnet` | 해당 호출에 사용할 체인을 선택합니다 |
| 기본 네트워크 | 서버 명령의 `--network testnet` 또는 `--network mainnet` | 호출에서 네트워크를 지정하지 않을 때 사용하는 네트워크. 기본값은 `testnet` |
| HTTP 포트, 호스트, 키, 제한 | 위의 `serve` 옵션 | HTTP 모드에서만 적용 |
| 업스트림 타임아웃 | 요청당 10초 고정, 응답 4 MiB 제한, 재시도 없음 | 느린 엔드포인트는 `UPSTREAM_UNAVAILABLE`을 반환합니다 |

메인넷은 `qorechain-vladi`(EVM 체인 ID 9801), 테스트넷은 `qorechain-diana`(EVM 체인 ID 9800)입니다. 메인넷용으로 준비한 전송에는 추가 경고가 붙습니다. 네트워크를 지정하는 환경 변수는 없으며, 명령줄 플래그나 호출별 인수만 사용합니다. 클라이언트의 기본값을 메인넷으로 하려면 다음과 같이 합니다.

```json
{ "command": "npx", "args": ["-y", "@qorechain/mcp", "--network", "mainnet"] }
```

### 도구 {#tools}

14개의 도구는 모두 읽기 전용이며 선택적 `network`를 받습니다. 입력과 출력은 서버 자체의 스키마에서 생성되며, [도구 레퍼런스](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md)에 모든 필드가 나와 있습니다.

| 도구 | 반환하는 내용 |
|---|---|
| `get_chain_info` | 체인 ID, 최신 블록, 최소 가스 가격, sign-bytes 버전, 프로토콜 기능 스위치, 예정된 업그레이드(있는 경우), 활성 EVM 프리컴파일 |
| `get_block` | 블록 하나(또는 최신 블록): 해시, 시간, 제안자, 트랜잭션 수, 최대 100개의 트랜잭션 해시 |
| `get_transaction` | 네이티브 해시 또는 EVM 해시(`0x` 접두사)로 조회한 트랜잭션: 상태, 수수료, 메모, 가스, 최대 50개의 메시지, 서명자, 서명 티어(`pqc`, `enrollment`, `shake` 또는 `classical`) |
| `get_address_info` | 두 가지 주소 형식(`qor1...`과 `0x...`), 계정 상태, 최대 100개의 잔액, 스테이킹 양, ML-DSA-87 키 등록 여부, 바이트코드 배포 여부 |
| `get_pq_status` | 주소의 경우: 등록된 키, 알고리즘, 소유 증명, EVM 인증 윈도. 트랜잭션의 경우: 하이브리드 레이어가 정확히 하나인지, 검증되는지 여부 |
| `get_validators` | 스테이크순 검증자(기본은 본딩됨, 최대 50개, 한도는 200까지): 상태, 감금 여부, 스테이크, 투표권 비율, 수수료율 |
| `get_staking_tiers` | 스테이킹 티어 모듈: 락업 조건과 보너스, 조기 해제 페널티, 보너스 풀, 선택적으로 한 보유자의 락업. 체인 v3.2.4 이상 |
| `search` | 하나의 문자열에서 블록 높이, 트랜잭션 해시, 주소, 검증자를 감지하여 읽고, 같은 데이터를 반환하는 도구의 이름을 알려줍니다 |
| `read_contract` | EVM `eth_call` 전용이며, 함수 시그니처의 ABI 인코딩과 결과 디코딩을 선택적으로 지원합니다 |
| `estimate_fee` | 시뮬레이션된 가스, 권장 가스 한도, 수수료(가스 한도 곱하기 최소 가스 가격). ML-DSA-87 레이어 포함 |
| `simulate_tx` | 인코딩된 트랜잭션에 대한 사용된 가스, 권장 가스 한도, 주소별 잔액 변화, 해석된 거부 사유 |
| `prepare_transfer` | uqor의 미서명 `MsgSend`: SignDoc, 읽기 쉬운 요약, 점검 결과와 경고 |
| `get_token_holders` | 항상 `NOT_AVAILABLE_ON_CHAIN`: 보유자 목록에는 공개 엔드포인트가 제공하지 않는 인덱서가 필요합니다 |
| `request_faucet` | 항상 `NOT_AVAILABLE_ON_CHAIN`: 테스트넷 QOR은 대시보드의 [Faucet](/dashboard/faucet)에서 받습니다 |

오류는 `isError: true`인 도구 결과이며 JSON 본문은 `{"error": {"code", "message", "details?"}}`입니다. 코드는 `NOT_FOUND`, `INVALID_INPUT`, `UPSTREAM_UNAVAILABLE`, `NOT_AVAILABLE_ON_CHAIN`, `RATE_LIMITED`, `UNAUTHORIZED`, `INTERNAL_ERROR`입니다.

### 라이브러리로 사용 {#library}

npm 패키지는 `createServer({ defaultNetwork })`(모든 MCP 전송에서 쓸 수 있는 MCP 서버 인스턴스), `createHttpHandler({ apiKeyHashes, rateLimitPerMinute })`(Fetch API 핸들러, `(Request) => Promise<Response>`), `startNodeServer(...)`(`serve`가 사용하는 Node HTTP 서버)를 내보냅니다. 공통 옵션은 `defaultNetwork`, `endpoints`(네트워크가 자신의 노드를 가리키게 함), `upstream`(`timeoutMs`, `maxResponseBytes`, `fetch`), `onToolCall`(도구 이름, 상태, 지연 시간을 받음)입니다.

Python 패키지도 `run_tool`을 통해 같은 방식으로 사용할 수 있습니다.

```python
import anyio
from qorechain_mcp import Context, run_tool

async def main():
    out = await run_tool("get_chain_info", {"network": "mainnet"}, Context())
    print(out["latest_block"])

anyio.run(main)
```

### 터미널에서 호스팅 엔드포인트 테스트 {#test-hosted}

```bash
curl -s -X POST https://mcp.qorechain.io/mcp \
  -H "Authorization: Bearer $QORECHAIN_MCP_KEY" \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

유효한 키가 없으면 엔드포인트는 메시지가 `UNAUTHORIZED`로 시작하는 JSON-RPC 오류와 함께 HTTP 401로 응답합니다.

### 문제 해결 {#troubleshooting}

* `UPSTREAM_UNAVAILABLE`: 공개 엔드포인트가 10초 안에 응답하지 않았습니다. 다시 시도하세요.
* 오래된 테스트넷 블록에서 `NOT_FOUND`: 테스트넷 노드는 기록을 정리하며, 오류에 조회 가능한 가장 낮은 높이가 표시됩니다. `get_chain_info`는 `earliest_available_height`를 보고합니다.
* 클라이언트에 도구가 표시되지 않음: 터미널에서 `npx -y @qorechain/mcp --help`를 실행해 Node와 npm이 동작하는지 확인한 다음, 클라이언트의 MCP 로그를 확인하세요.
* 호스팅 엔드포인트에서 `UNAUTHORIZED`: 키가 없거나, 잘못되었거나, 폐기되었거나, 아직 활성화되지 않았습니다(새 키는 1~2분이 걸릴 수 있습니다).

### 실행한 내용 {#what-was-run}

2026년 10월 27일에 게시된 패키지를 레지스트리에서 설치하여 공개 테스트넷과 메인넷 엔드포인트에 대해 실행했습니다.

* `qorechain-mcp --version`은 `0.1.0`을 출력했습니다. stdio에서 `initialize`는 서버 이름 `qorechain-mcp`를 반환했고 `tools/list`는 위의 14개 도구 이름을 반환했습니다. `pip install qorechain-mcp==0.1.0`이 설치되었고 `--version`은 `0.1.0`을 출력했습니다.
* `qorechain-mcp serve --port 18787`은 `GET /healthz`에 `{"status":"ok"}`로 응답했고, `POST /mcp`로 보낸 `get_chain_info`의 `tools/call`에도 응답했습니다.
* `get_chain_info`는 테스트넷에서 체인 `qorechain-diana`, EVM 체인 ID 9800, 최소 가스 가격 0.1 uqor, sign-bytes `v2`를 반환했고, 메인넷에서 체인 `qorechain-vladi`, EVM 체인 ID 9801, sign-bytes `v2`를 반환했습니다.
* 위 테스트넷 트랜잭션에 대한 `get_pq_status`는 티어 `pqc`, 하이브리드 레이어 정확히 하나, sign-bytes `v2`로 `verified: true`를 반환했습니다.
* 테스트넷에서 1.5 QOR에 대한 `prepare_transfer`는 가스 한도 171698, 수수료 17170 uqor(0.01717 QOR)의 SignDoc을 반환했고, 그 미서명 트랜잭션에 대한 `simulate_tx`는 보내는 사람에게서 수수료가 차감되는 `ok: true`를 반환했습니다. 서명이나 전송은 이루어지지 않았습니다.

## 접근 방법 {#how-to-access}

* **로컬(기본 옵션).** `npx -y @qorechain/mcp` 또는 `uvx qorechain-mcp`를 통한 stdio. 계정도 API 키도 필요하지 않습니다. 공개 QoreChain 엔드포인트를 읽으므로 아웃바운드 HTTPS가 필요합니다.
* **직접 운영하는 HTTP 서버.** 위에서 설명한 `qorechain-mcp serve`이며, API 키와 속도 제한을 직접 설정합니다.
* **호스팅 엔드포인트.** `https://mcp.qorechain.io/mcp`는 Streamable HTTP 전송을 제공합니다. 호출에서 `"network": "mainnet"`을 지정하지 않으면 테스트넷을 사용합니다. 모든 요청에 `Authorization: Bearer <key>`로 보내는 API 키가 필요하며, 키는 대시보드에서 요청합니다(아래 참고). 키가 없으면 엔드포인트는 HTTP 401(`UNAUTHORIZED`)로 응답하며, 2026년 10월 27일에도 그러했습니다. 계정당 활성 키는 1개이며, 각 키는 초당 요청 10회(버스트 20)와 하루 요청 100,000회로 제한됩니다. 대부분의 용도에서는 키가 필요 없는 로컬 설정이 더 간단한 선택입니다.

  키를 받으려면 [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers)에 로그인하고 **AI agents (MCP)** 탭을 연 다음 **API key** 양식(이름 또는 조직, 연락처, 사용 목적, 예상 사용량)을 작성하고 **Request API key**를 누릅니다. QoreChain 팀이 요청을 승인하거나 거절하며, 거절되면 그 사유 메모가 표시되고 다시 요청할 수 있습니다. 승인되면 **Generate key**를 누릅니다. 키는 한 번만 표시되며, 복사 버튼과 바로 사용할 수 있는 구성 스니펫이 함께 제공되고, 1~2분 이내에 활성화됩니다. QoreChain은 지문(해시)만 보관하므로 분실한 키는 다시 표시할 수 없습니다. 키를 폐기(약 1분 안에 적용)하고 새로 요청하세요. [개발자 페이지](/dashboard/developers#mcp)를 참고하세요.

키가 필요한 서버를 위한 HTTP 클라이언트 설정(정확한 키 이름은 클라이언트마다 다릅니다):

```json
{
  "mcpServers": {
    "qorechain": {
      "type": "http",
      "url": "https://mcp.qorechain.io/mcp",
      "headers": { "Authorization": "Bearer ${QORECHAIN_MCP_KEY}" }
    }
  }
}
```

복구 문구나 개인 키를 클라이언트 설정에 넣지 마세요. QoreChain 도구에는 그런 것이 필요하지 않습니다.

서버는 다음 공개 엔드포인트에서 읽습니다.

| | 테스트넷 | 메인넷 |
|---|---|---|
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| 합의 RPC | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |

비용: 서버는 무료입니다. 읽기에는 비용이 들지 않습니다. `prepare_transfer`가 만든 트랜잭션을 브로드캐스트하면 네트워크 수수료가 적용됩니다(수수료 하한은 가스당 0.1 uqor).

## 보안 참고 사항 {#security}

* **서명 코드 경로가 존재하지 않습니다.** 서버와 CLI 모두에 없습니다. 아무것도 서명되지 않고, 키가 저장되지 않으며, 아무것도 브로드캐스트되지 않습니다.
* **비밀 정보는 거부됩니다.** 복구 문구처럼 보이는 입력(연속된 BIP-39 단어 12개 이상)이나 32바이트 16진수 개인 키 단독 입력은 요청이 전송되기 전에 `INVALID_INPUT`으로 거부되며, 오류 메시지는 해당 비밀 정보가 노출된 것으로 간주하라고 안내합니다. 복구 문구나 개인 키를 클라이언트 설정에 넣지 마세요. QoreChain 도구에는 그런 것이 필요하지 않습니다.
* **업스트림 오류 텍스트는 전달되지 않으며**, 응답은 필드 단위로 구성됩니다.
* **로그.** HTTP 로그에는 JSON-RPC 메서드, 도구 이름, 상태, 지연 시간이 기록됩니다. 입력, 출력, 키, 클라이언트 주소는 기록되지 않습니다.
* 셀프 호스팅 서버의 **API 키**는 평문이 아니라 SHA-256 해시로 저장됩니다. CORS는 기본적으로 닫혀 있어, localhost에 바인드된 서버를 DNS 리바인딩으로부터도 보호합니다.
* **메인넷은 명시적으로 지정해야 하며**, `prepare_transfer`는 메인넷 전송에 경고를 추가합니다.
* **메모는 공개되고 영구적입니다.** 메모에 비밀 정보를 넣지 마세요.
* **호스팅 API 키는 비밀번호처럼 취급하세요.** 환경 변수나 비밀 저장소에 보관하고, 유출되면 대시보드에서 폐기하세요.
* 취약점은 공개 이슈가 아닌 security@qore.network로 비공개로 보고하세요.

## 게시 위치 {#where-published}

| 레지스트리 | 패키지 | 버전 | 실행 | 비고 |
|---|---|---|---|---|
| npm | [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | 0.1.0 | `npx -y @qorechain/mcp` | Bin `qorechain-mcp`. stdio 및 Streamable HTTP. Node.js 20 이상 |
| PyPI | [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | 0.1.0 | `pip install qorechain-mcp` 또는 `uvx qorechain-mcp` | stdio 전용. Python 3.10 이상 |
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | `qore` 명령. [QoreChain CLI](/developer-tools/qore-cli) 참고 |

소스: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp) (공개, Apache-2.0, 2026년 10월 27일 확인). 저장소에는 서버, CLI, Python 패키지, 도구 레퍼런스, 셀프 호스팅 안내, 클라이언트 설정 예제, 에이전트 스킬 파일 세 개가 들어 있습니다. 게시된 컨테이너 이미지는 없으므로 `npx` 또는 `pip`를 사용하세요.

## 제한 사항 및 알려진 문제 {#limits}

* **읽기 전용.** 서명 코드 경로도, 키 저장소도, 브로드캐스트도 없습니다. `prepare_transfer`는 미서명 문서를 반환합니다. 전송을 완료하려면 [QoreSign](/qoresign/overview)이나 QoreX 지갑으로 서명하고 직접 브로드캐스트한 다음, `get_transaction`으로 결과를 읽으세요. `read_contract`는 `eth_call`만 사용하며 상태를 변경할 수 없습니다.
* **준비할 수 있는 트랜잭션은 한 종류.** `prepare_transfer`는 uqor의 네이티브 레인 `MsgSend`를 만듭니다. EVM, SVM, 스테이킹, 거버넌스, 컨트랙트 트랜잭션은 만들지 않습니다. `estimate_fee`와 `simulate_tx`는 인코딩된 모든 네이티브 레인 트랜잭션을 받습니다.
* **가스 수치는 네트워크마다 다릅니다.** 테스트넷(v3.2.6)의 시뮬레이션에는 이미 ML-DSA-87 검증 비용이 포함되어 있어 가스가 정확합니다. 메인넷(v3.2.4)의 시뮬레이션에는 포함되지 않으므로 권장 가스 한도에 여유분이 붙습니다(메인넷에서는 `exact_gas_simulation`이 false입니다).
* **테스트넷 기록은 정리됩니다.** 오래된 테스트넷 블록은 `NOT_FOUND`를 반환하며, 오류에는 조회 가능한 가장 낮은 높이가 표시됩니다(확인 시점 테스트넷에서는 8,790,799이고, 메인넷은 높이 1부터 제공되었습니다). `get_pq_status`는 현재 등록된 키에 대해 레이어를 검증하므로, 키 교체 후에는 이전 트랜잭션이 더 이상 일치하지 않습니다.
* **EVM 포스트 퀀텀 프리컴파일.** `0x...0A01`(ML-DSA-87 검증)과 `0x...0A02`(키 상태)는 테스트넷에서만 활성화되어 있으며, 메인넷에서 호출하면 빈 데이터를 반환합니다.
* **제한.** 각 업스트림 요청에는 10초 타임아웃과 4 MiB 응답 제한이 있고 재시도는 없습니다. 블록은 트랜잭션 해시를 최대 100개, 트랜잭션은 메시지를 최대 50개, 계정은 잔액을 최대 100개까지 나열합니다. HTTP 요청 본문은 512 KiB로 제한됩니다. 메모는 최대 256자이며 공개되고 영구적이므로 비밀 정보를 넣지 마세요. 셀프 호스팅 서버의 속도 제한은 인스턴스별이며 메모리에 저장됩니다. 로드 밸런서 뒤에서는 각 인스턴스가 따로 집계합니다.
* **사용할 수 없음:** `get_token_holders`(공개 엔드포인트에 인덱서 없음)와 `request_faucet`(로그인이 필요한 대시보드 Faucet 사용). 호스팅 엔드포인트에는 대시보드에서 요청하는 API 키가 필요하지만, 로컬 설정에는 필요하지 않습니다.
* **메인넷은 명시적으로 지정.** 호출에서 `"network": "mainnet"`을 지정하거나 서버를 `--network mainnet`으로 시작하지 않으면 호출은 테스트넷으로 갑니다.
* **컨테이너 이미지는 게시되지 않습니다.** `npx` 또는 `pip`로 서버를 실행하세요.
* **버전.** 0.1.0은 첫 번째 릴리스입니다. 이후 버전에서 도구 이름과 스키마가 바뀔 수 있으며, 저장소의 생성된 `spec/tools.json`이 설치한 버전의 레퍼런스입니다.

## 관련 페이지 {#related}

* [QoreChain CLI](/developer-tools/qore-cli): 터미널에서 사용하는 같은 도구.
* [QoreSign](/qoresign/overview): `get_pq_status`가 사용하는 하이브리드 검증기.
* [QoreChain SDK](/sdk/overview): 이 서버가 읽고 시뮬레이션하는 트랜잭션을 만들고 서명합니다.
* [QoreX 통합](/developer-tools/qorex-integrations): `prepare_transfer`가 준비한 것에 서명하는 지갑.
* [수탁 키트](/developer-tools/custody-kit): 수탁 기관을 위한 입금 감지와 출금 검증.
* [Faucet](/dashboard/faucet)과 [대시보드의 개발자 페이지](/dashboard/developers#mcp): 테스트넷 QOR와 MCP API 키.
* [개발자 패키지 개요](/developer-tools/overview).
