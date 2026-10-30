---
slug: /developer-tools/qore-cli
title: QoreChain CLI (qore)
sidebar_label: QoreChain CLI
sidebar_position: 24
---

# QoreChain CLI (`@qorechain/qore-cli`, 명령 `qore`)

`qore`는 터미널에서 QoreChain을 읽습니다. 코드를 작성하지 않고도 트랜잭션을 조회하고, 포스트 퀀텀 서명이 검증되는지 확인하고, 계정이나 검증자 집합을 읽고, 트랜잭션을 시뮬레이션하고, 미서명 전송을 준비하려는 개발자, 운영자, 스크립트를 위한 도구입니다. 모든 명령은 [QoreChain MCP 서버](/developer-tools/mcp)의 도구 하나를 실행하며, `--json`은 해당 도구가 반환하는 JSON을 그대로 출력하므로 스크립트와 AI 에이전트가 같은 데이터를 봅니다.

서명이나 브로드캐스트는 전혀 이루어지지 않으며, CLI는 키를 보관하지 않습니다. 버전 **0.1.0**, 2026년 10월 27일 게시, Apache-2.0, Node.js 20 이상입니다.

## 혁신 {#innovations}

* **MCP 도구 출력과 동일한 JSON.** `qore <command> --json`은 해당 MCP 도구가 반환하는 것과 같은 필드 이름의 같은 객체를 출력합니다. `--json` 없이는 같은 객체가 읽기 쉬운 텍스트로 출력됩니다. 한쪽을 기준으로 작성한 스크립트는 다른 쪽에서도 동작합니다.
* **터미널에서 확인하는 포스트 퀀텀 상태.** `qore pq status <txhash>`는 트랜잭션에 하이브리드 레이어가 정확히 하나 있는지, 그리고 ML-DSA-87(FIPS 204) 서명이 서명자가 체인에 등록한 키에 대해 sign-bytes v1과 v2 기준으로 검증되는지 보고합니다. `qore pq status <address>`는 등록된 키, 그 유형, 소유 증명, EVM 인증 윈도를 보고합니다.
* **키가 필요 없는 전송 파이프라인.** `prepare-transfer --json`이 미서명 전송을 파일로 쓰고 `simulate`가 그 파일을 받으므로, 셸 스크립트에서 전송을 만들고, 점검하고, 가격을 산정할 수 있습니다. 서명 단계는 지갑이나 [QoreSign](/qoresign/overview)에 남아 있습니다.
* **안정적인 종료 코드.** 0은 성공, 1은 `NOT_FOUND`나 `INVALID_INPUT` 같은 안정적인 코드를 담은 도구 오류, 2는 사용법 오류이므로 스크립트가 결과에 따라 분기할 수 있습니다.

## 활용 사례 {#use-cases}

1. **트랜잭션에 하이브리드 서명이 있었는지 확인.** 브로드캐스트 직후 `qore pq status <hash>`가 서명 티어와 ML-DSA-87 레이어가 서명자가 등록한 키에 대해 검증되는지 보고합니다.
2. **터미널에서 체인 상태 조회.** `qore block`, `qore account <address>`, `qore validators`, `qore search <query>`는 탐색기를 열거나 코드를 작성하지 않고도 간단한 질문에 답합니다.
3. **서명하기 전에 전송의 가격 산정과 점검.** `prepare-transfer`가 미서명 전송을 쓰고, `simulate`가 가스, 잔액 변화, 해석된 거부 사유를 보여 주며, `estimate-fee`가 권장 수수료를 알려 줍니다. 서명은 자신의 지갑이나 [QoreSign](/qoresign/overview)으로 합니다.
4. **스크립트나 CI 작업에서 컨트랙트 읽기.** `qore read-contract --to 0x... --function "balanceOf(address)" --arg 0x... --returns uint256 --json | jq`로 토큰 잔액이나 컨트랙트 뷰를 확인하고 결과를 파싱합니다.
5. **셸 스크립트와 모니터링.** `--json` 출력과 안정적인 종료 코드(0, 1, 2)로 스크립트가 결과에 따라 분기할 수 있습니다. 같은 JSON을 [MCP 서버](/developer-tools/mcp)가 반환하므로 AI 클라이언트와 스크립트가 같은 데이터를 봅니다.

## 작동 방식 {#how-it-works}

모든 `qore` 명령은 선택한 네트워크의 공개 REST, RPC, EVM JSON-RPC 엔드포인트를 대상으로, 사용자의 프로세스 안에서 MCP 서버의 공유 코어에 있는 도구 하나를 실행합니다. 응답은 체인의 응답에서 필드 단위로 구성되고, 업스트림 오류 텍스트는 출력되지 않으며, 실패는 일곱 가지 안정적인 오류 코드(`NOT_FOUND`, `INVALID_INPUT`, `UPSTREAM_UNAVAILABLE`, `NOT_AVAILABLE_ON_CHAIN`, `RATE_LIMITED`, `UNAUTHORIZED`, `INTERNAL_ERROR`) 중 하나로 매핑됩니다. 각 업스트림 요청에는 10초 타임아웃(`--timeout`으로 변경), 4 MiB 응답 제한이 있고 재시도는 없습니다. 하이브리드 서명 검사는 [QoreSign](/qoresign/overview)으로 로컬에서 실행됩니다. 아무것도 서명되거나 전송되지 않습니다. 각 도구의 자세한 내용은 [MCP 서버 페이지](/developer-tools/mcp#how-it-works)에 있습니다.

## 사용 방법 {#how-to-use}

설치 없이 실행하거나 한 번 설치하세요.

```bash
npx -y @qorechain/qore-cli chain
npm install -g @qorechain/qore-cli
qore --version
```

명령은 읽기 전용이며 기본값은 테스트넷입니다.

```bash
# the latest block, and the chain info
qore block
qore chain

# is this testnet transaction hybrid-signed, and does the ML-DSA-87 layer verify?
qore pq status F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152

# an account on mainnet, as JSON
qore account qor1... --network mainnet --json

# the top bonded validators
qore validators --limit 3

# an unsigned transfer, then its simulation (nothing is signed or sent)
qore prepare-transfer --from qor1... --to qor1... --amount 1.5 --json > transfer.json
qore simulate transfer.json
qore estimate-fee --from qor1... --to qor1... --amount 1.5
```

금액은 `1.5` 또는 `1.5 QOR`(QOR, 소수점 6자리까지) 또는 `1500000uqor`입니다. 주소는 `qor1...` 또는 `0x...`를 사용할 수 있습니다.

### 계정과 트랜잭션을 확인하는 스크립트 {#script}

저장소에는 이를 수행하는 전체 스크립트(`examples/cli/pq-check.sh`)가 있습니다. 핵심 부분은 다음과 같습니다.

```bash
net=testnet
qore() { npx -y @qorechain/qore-cli "$@" --network "$net" --json; }

qore account "$addr" | jq '{exists, balances: [.balances[] | {denom, amount, display}], pq_key_registered}'
qore pq status "$addr" | jq '.address_status | {registered, algorithm, key_type, possession_proven, evm_window: .evm_window.live}'
qore pq status "$tx" | jq '.transaction_status | {tier, has_exactly_one_pqc_layer, signer, verified: .verification.verified, reason: .verification.reason}'

# An unsigned transfer to yourself, then its fee (nothing is signed or sent).
qore prepare-transfer --from "$addr" --to "$addr" --amount 0.000001 > transfer.json
qore simulate transfer.json | jq '{ok, gas_used, suggested_gas_limit, refusal}'
```

`qore block --network mainnet --json`의 예(2026년 10월 27일):

```json
{
  "network": "mainnet",
  "height": "3858155",
  "hash": "1DA8CA5049ACF8844A3B775E2E138B2B118EDC1FC8C1F3602369B0C18D0B90C2",
  "time": "2026-10-27T21:32:48.831948088Z",
  "chain_id": "qorechain-vladi",
  "proposer_address": "B1CDC8C45DA1FFF9BA5A01320F16FC7460E90B8F",
  "tx_count": 0,
  "tx_hashes": [],
  "tx_hashes_truncated": false,
  "explorer_url": "https://explore.qore.network/block/3858155"
}
```

### 명령 {#commands}

| 명령 | MCP 도구 | 기능 |
|---|---|---|
| `chain`, `features` | `get_chain_info` | 체인 ID, 최신 블록, 최소 가스 가격, sign-bytes 버전, 프로토콜 기능 스위치, 활성 EVM 프리컴파일 |
| `block [height]` | `get_block` | 블록 하나. 기본값은 최신 블록 |
| `tx get <hash>` | `get_transaction` | 네이티브 또는 EVM 해시로 조회한 트랜잭션: 상태, 수수료, 메시지, 서명자, 서명 티어 |
| `account <address>` | `get_address_info` | 잔액, 계정 상태, 스테이킹 양, 두 가지 주소 형식 |
| `pq status <address\|txhash>` | `get_pq_status` | 주소의 ML-DSA-87 키 상태, 또는 트랜잭션의 하이브리드 레이어 검사 |
| `validators [--status S] [--limit N]` | `get_validators` | 스테이크순 검증자. 상태는 `bonded`(기본), `unbonding`, `unbonded`, `all`이며, 한도는 200까지 |
| `staking-tiers [--holder A]` | `get_staking_tiers` | 스테이킹 티어 파라미터와 풀, 그리고 한 보유자의 락업(체인 v3.2.4 이상) |
| `search <query>` | `search` | 높이, 해시, 주소, 검증자를 감지하여 읽습니다 |
| `read-contract --to 0x.. (--data 0x.. \| --function "f(address)" --arg V) [--returns T]` | `read_contract` | EVM `eth_call` 전용이며, 선택적 인코딩과 디코딩을 지원합니다 |
| `simulate <txfile.json\|base64> [--no-pqc-placeholder]` | `simulate_tx` | 인코딩된 트랜잭션에 대한 가스, 잔액 변화, 해석된 거부 사유 |
| `estimate-fee (<txfile.json\|base64> \| --from A --to B --amount X)` | `estimate_fee` | 권장 가스 한도와 수수료. ML-DSA-87 레이어 포함 |
| `prepare-transfer --from A --to B --amount X [--memo M] [--gas-limit N]` | `prepare_transfer` | 지갑이 서명할 미서명 전송 |

전역 옵션: `--network testnet|mainnet`(기본값 `testnet`), `--json`, `--timeout <ms>`(업스트림 타임아웃, 기본값 10000), `--help`, `--version`. 도구 스키마는 [MCP 도구 레퍼런스](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md)에 있습니다.

### 실행한 내용 {#what-was-run}

2026년 10월 27일에 `@qorechain/qore-cli` 0.1.0과 `@qorechain/mcp` 0.1.0을 npm에서 빈 프로젝트에 설치하고, 공개 엔드포인트에 대해 다음 읽기 전용 명령을 실행했습니다.

* `qore --version`은 `0.1.0`을 출력했고, `qore --help`는 위의 명령을 나열했습니다.
* `qore chain`(테스트넷)은 체인 `qorechain-diana`, EVM 체인 ID 9800, 최소 가스 가격 0.1, sign-bytes `v2`를 출력했고, `qore chain --network mainnet`은 체인 `qorechain-vladi`, EVM 체인 ID 9801, sign-bytes `v2`를 출력했습니다.
* `qore block`, `qore validators --limit 3 --json`, `qore staking-tiers --json`, `qore search 8981000`, `qore account qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08`, `qore read-contract --to 0x...0a02 --function "x()"`는 각자의 데이터를 반환했습니다.
* `qore pq status F642F59F...2152`는 티어 `pqc`, `has_exactly_one_pqc_layer: true`, sign-bytes `v2`로 `verified: true`를 출력했습니다.
* `qore prepare-transfer --from A --to A --amount 1.5 --json`은 미서명 전송(가스 한도 171698, 수수료 17170 uqor)을 썼고, 그 파일에 대한 `qore simulate`는 `ok: true`를 반환했으며, `qore estimate-fee`는 일치하는 수수료를 반환했습니다. 보내는 사람과 받는 사람이 같은 주소였기 때문에 도구가 경고를 추가했으며, 서명이나 전송은 이루어지지 않았습니다.
* `qore tx get zzz`는 `error [INVALID_INPUT]`를 출력하고 1로 종료했으며, `qore bogus`는 2로 종료했습니다.

## 접근 방법 {#how-to-access}

* **네트워크.** 테스트넷 `qorechain-diana`(기본값)와 `--network mainnet`을 사용하는 메인넷 `qorechain-vladi`.
* **엔드포인트.** CLI는 공개 REST, RPC, EVM JSON-RPC 엔드포인트를 읽습니다. 테스트넷은 `https://api-testnet.qore.host`, `https://rpc-testnet.qore.host`, `https://evm-testnet.qore.host`이고, 메인넷은 `https://api.qore.host`, `https://rpc.qore.host`, `https://evm.qore.host`입니다.
* **계정과 키.** 없음. 로그인도, API 키도, 설정 파일도 없으며, 호스팅 MCP 엔드포인트의 키는 CLI에 적용되지 않습니다.
* **사전 요구 사항.** Node.js 20 이상과 아웃바운드 HTTPS.
* **비용.** 무료입니다. 준비한 전송을 보내려면 자신의 지갑에서 네트워크 수수료(하한은 가스당 0.1 uqor)를 지불하며, CLI는 그 단계를 수행하지 않습니다.

## 보안 참고 사항 {#security}

* **서명 코드 경로 없음.** CLI는 키를 보관하지 않고, 아무것도 서명하지 않으며, 아무것도 브로드캐스트하지 않습니다. `prepare-transfer`는 미서명 문서를 반환합니다.
* **비밀 정보는 거부됩니다.** 복구 문구처럼 보이는 입력(연속된 BIP-39 단어 12개 이상)이나 32바이트 개인 키 단독 입력은 요청이 전송되기 전에 `INVALID_INPUT`으로 거부됩니다. 그래도 명령줄에 넣지 마세요. 셸 기록에 남으며, 오류 메시지는 해당 비밀 정보가 노출된 것으로 간주하라고 안내합니다.
* **공개 데이터만 컴퓨터를 떠납니다.** 사용자가 전달한 주소, 해시, 인코딩된 트랜잭션이 공개 QoreChain 엔드포인트로 전송됩니다.
* **메인넷은 명시적으로 지정.** `--network mainnet`을 지정하지 않으면 호출은 테스트넷으로 가며, 메인넷용으로 준비한 전송에는 경고가 붙습니다.
* **메모는 공개되고 영구적입니다.** `--memo`에 비밀 정보를 넣지 마세요.
* 취약점은 공개 이슈가 아닌 security@qore.network로 비공개로 보고하세요.

## 게시 위치 {#where-published}

| 레지스트리 | 패키지 | 버전 | 설치 | 비고 |
|---|---|---|---|---|
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Bin `qore`. Node.js 20 이상 |

소스: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp), 폴더 `packages/cli` (공개, Apache-2.0, 2026년 10월 27일 확인). CLI의 Python 또는 Rust 빌드는 없으며, 서버 자체는 PyPI에도 [`qorechain-mcp`](/developer-tools/mcp#where-published)로 게시되어 있습니다.

## 제한 사항 및 알려진 문제 {#limits}

* **읽기 전용.** 어떤 명령도 서명하거나 브로드캐스트하지 않습니다. `prepare-transfer`는 uqor의 네이티브 레인 `MsgSend`만 만들며, EVM, SVM, 스테이킹, 거버넌스, 컨트랙트 트랜잭션은 준비하지 않습니다. `simulate`와 `estimate-fee`는 인코딩된 모든 네이티브 레인 트랜잭션을 받습니다.
* **Faucet과 토큰 보유자 목록 없음.** 이 두 MCP 도구에는 CLI 명령이 없습니다. 테스트넷 QOR은 [Faucet](/dashboard/faucet)에서 받습니다.
* **테스트넷 기록은 정리됩니다.** 오래된 테스트넷 블록이나 트랜잭션은 조회 가능한 가장 낮은 높이와 함께 `NOT_FOUND`를 반환합니다. 확인 시점에 메인넷은 높이 1부터 제공되었습니다.
* **가스 수치는 체인 버전을 따릅니다.** 두 네트워크 모두 v3.2.5를 적용했으므로 시뮬레이션에 ML-DSA-87 검증 비용이 포함됩니다. 더 오래된 노드에 대해서는 권장 가스 한도에 여유분이 붙습니다.
* **출력 제한.** 블록당 트랜잭션 해시 최대 100개, 트랜잭션당 메시지 최대 50개, 계정당 잔액 최대 100개, 호출당 검증자 최대 200개. 각 요청에는 기본 10초 타임아웃, 4 MiB 응답 제한이 있고 재시도는 없습니다.
* **비밀 정보는 거부됩니다.** 복구 문구나 개인 키 단독 입력처럼 보이는 입력은 `INVALID_INPUT`으로 거부됩니다. 명령줄에 넣지 마세요. 셸 기록에 남습니다.
* **EVM 포스트 퀀텀 프리컴파일** `0x...0A01`과 `0x...0A02`는 테스트넷에서만 활성화되어 있습니다.
* **첫 번째 릴리스.** 0.1.0: 이후 버전에서 명령 이름과 옵션이 바뀔 수 있습니다. 스크립트에는 `--json`과 종료 코드를 사용하고 버전을 고정하세요.

## 관련 페이지 {#related}

* [QoreChain MCP 서버](/developer-tools/mcp): AI 클라이언트용 같은 도구와 호스팅 엔드포인트.
* [QoreSign](/qoresign/overview): `prepare-transfer`가 쓴 전송에 서명합니다.
* [SDK CLI 레퍼런스](/sdk/reference/cli): SDK 자체의 명령줄.
* [Faucet](/dashboard/faucet): 테스트넷 QOR.
* [개발자 패키지 개요](/developer-tools/overview).
