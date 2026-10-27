---
slug: /developer-tools/scaffolders-and-cli
title: 프로젝트 스캐폴더와 qorollup CLI
sidebar_label: 스캐폴더와 CLI
sidebar_position: 21
---

# 프로젝트 스캐폴더와 `qorollup` CLI

명령줄 도구 세 가지로 아무것도 없는 상태에서 타입이 지정되고 빌드 가능한 QoreChain 프로젝트의 시작점까지 갈 수 있습니다. Node.js로 작업하는 애플리케이션 개발자(dApp)와 롤업 운영자를 위한 도구입니다.

* **`create-qorechain-dapp`**(0.10.0)은 [QoreChain SDK](/sdk/overview)를 기반으로 하는 세 가지 템플릿 중 하나로 dApp을 스캐폴딩합니다.
* **`create-qorechain-rollup`**(0.7.0)은 TypeScript [롤업 개발 키트](/rollups/overview)를 기반으로 하는 여섯 가지 템플릿 중 하나로 롤업 프로젝트를 스캐폴딩합니다.
* **`qorollup`**은 `@qorechain/rdk-cli` 패키지(0.7.0)의 명령으로, 사전 점검, 롤업 생성 및 모니터링, 실시간 파라미터 조회를 제공하는 운영자용 명령줄입니다.

이 페이지는 2026년 10월 27일에 npm에서 설치한 게시된 패키지를 기준으로 합니다. 개념 가이드는 [롤업 배포하기](/rollups/deploying-a-rollup)와 [SDK CLI 레퍼런스](/sdk/reference/cli)입니다.

## 혁신 요소 {#innovations}

* **CI를 위한 비대화형 스캐폴딩.** 모든 프롬프트에는 플래그가 있습니다. `--template`, `--network`, `--package-manager`, `--yes`(기본값 수락), `--no-install`입니다. 파이프라인은 터미널 없이 명령 하나로 프로젝트를 생성하고 빌드할 수 있습니다.
* **템플릿은 현재 패키지에 고정되어 있습니다.** dApp 템플릿은 `@qorechain/sdk` `^0.10.0`(EVM 템플릿은 `@qorechain/evm`)에, 롤업 템플릿은 `@qorechain/rdk` `^0.7.0`에 의존합니다. 이전 스캐폴더(0.8.0)는 라이브 네트워크에 서명할 수 없는 SDK로 해석되는 범위를 기록했지만, 현재 버전에서는 그런 일이 없습니다.
* **롤업 템플릿은 사용 사례별로 유효한 구성을 담고 있습니다.** 각 롤업 템플릿은 RDK의 호환성 매트릭스가 허용하는 정산, 시퀀서, 데이터 가용성, 가스, VM 조합을 설정하며, 스캐폴더는 무언가를 생성하기 전에 실시간 스테이크와 생성 소각량을 출력합니다.
* **무엇이 빠졌는지 알려 주는 사전 점검 명령.** `qorollup doctor`(그리고 롤업 템플릿 안의 `npm run doctor`)는 REST 엔드포인트가 응답하는지, 모듈 파라미터를 읽을 수 있는지, 엔드포인트가 요청한 네트워크인지, 서명자가 구성되어 있는지 확인하고 점검마다 한 줄씩 출력합니다. 템플릿 안에서는 롤업 구성도 호환성 매트릭스에 대해 검증합니다.
* **템플릿에 연결된 하이브리드 서명.** 롤업 템플릿은 작은 `signer.ts`를 통해 연결되며, 이 파일은 니모닉에서 계정의 ML-DSA-87 키를 파생하고(또는 원시 개인 키와 함께 시드를 받아) 네이티브 레인에서 네트워크가 요구하는 하이브리드 서명을 합니다. `rollup-app` dApp 템플릿도 같은 방식이며 `QORE_BROADCAST=1`을 설정하지 않으면 드라이런으로 실행됩니다.
* **드라이런.** `qorollup create ... --dry-run`은 구성을 검증하고, 스테이크와 소각량을 출력하며, 브로드캐스트 없이 `MsgCreateRollup`을 제출할 것임을 알려 줍니다.
* **기계가 읽을 수 있는 출력.** `qorollup ... --json`은 스크립트용 JSON을 출력합니다.

## 사용 방법 {#how-to-use}

### dApp 스캐폴딩 {#create-dapp}

```bash
# interactive
npm create qorechain-dapp my-dapp
# non-interactive
npx create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
```

| 템플릿 | 생성되는 내용 | 스크립트 |
| --- | --- | --- |
| `evm-solidity` | 사전 컴파일된 아티팩트가 있는 Solidity `Counter` 컨트랙트와, `@qorechain/evm`을 사용해 이를 배포하고 호출하는 viem 스크립트. 파일: `contracts/Counter.sol`, `contracts/Counter.artifact.ts`, `scripts/deploy.ts`, `.env`. | `deploy` |
| `fullstack-web` | `@qorechain/sdk`로 주소의 잔액(과 토크노믹스 개요)을 읽는 Vite, React, TypeScript 페이지. 파일: `index.html`, `src/App.tsx`, `src/main.tsx`, `vite.config.ts`, `.env`. | `dev`, `build`, `preview`, `typecheck` |
| `rollup-app` | SDK의 `createRollupClient`와 `createMultilayerClient`를 사용해 롤업 및 사이드체인 또는 페이체인 메시지를 만드는 Node 스크립트. 파일: `src/index.ts`와 일반적인 설정 파일. 기본값은 드라이런. | `start`, `typecheck` |

| 플래그 | 의미 |
| --- | --- |
| `-t, --template <name>` | `evm-solidity`, `fullstack-web` 또는 `rollup-app` |
| `--network <name>` | `testnet` 또는 `mainnet` |
| `--package-manager <pm>` | `pnpm`, `npm` 또는 `yarn` |
| `-y, --yes` | 프롬프트를 건너뛰고 기본값 사용 |
| `--no-install` | 의존성을 설치하지 않음 |
| `-h, --help`, `-v, --version` | 도움말, 버전 |

테스트한 예제(개발자 허브에서, 2026년 10월 27일에 빈 디렉터리에서 공개 npm 레지스트리의 `npx`로 실행): 웹 템플릿을 스캐폴딩하고 빌드합니다. 관찰된 결과: `Done! Created my-dapp`과 성공한 `vite build`. 빌드는 번들 크기 경고를 출력하지만 무해합니다.

```bash
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

웹 앱을 실행하기 전에 생성된 `.env`를 여세요. 이 파일은 `http://localhost:1317`과 `http://localhost:8545`를 가리키므로, `VITE_QORE_REST_URL`을 `https://api-testnet.qore.host`(메인넷은 `https://api.qore.host`)로, `VITE_QORE_EVM_RPC_URL`을 `https://evm-testnet.qore.host`(또는 `https://evm.qore.host`)로 설정하세요.

### 롤업 프로젝트 스캐폴딩 {#create-rollup}

```bash
npm create qorechain-rollup my-rollup
# non-interactive
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
```

| 템플릿 | 프로필 | 정산 / 시퀀서 / DA / 가스 / VM | 추가 파일 |
| --- | --- | --- | --- |
| `defi-rollup` | defi | zk-SNARK, 전용, 네이티브, EIP-1559, EVM | 참조용 증명기(`src/prover.ts`)와 `circuits/` 아래의 데모 회로 |
| `gaming-rollup` | gaming | based, based, 네이티브, 고정 가스, 커스텀 VM | 없음 |
| `nft-rollup` | nft | 옵티미스틱, 전용, QoreChain Native, 챌린지 흐름 포함 | `src/challenge.ts` |
| `enterprise-rollup` | enterprise | based, based, 네이티브, 보조 가스, EVM | 없음 |
| `custom-rollup` | custom | 완전히 파라미터화됨, 모든 필드가 문서화됨 | 없음 |
| `multivm-rollup` | multivm | 크로스 VM 프리컴파일을 통해 QoreChain Native 컨트랙트를 호출하는 EVM 롤업 | `contracts/CrossVmCaller.sol`, `src/crossvm-call.ts` |

모든 템플릿에는 `rollup.config.ts`(구성), `src/client.ts`, `src/signer.ts`, `src/create.ts`, `src/submit-batch.ts`, `src/query-status.ts`, `src/doctor.ts`, `src/status.ts`, `.env`와 `.env.example`, README, `.github/workflows/deploy.yml`이 들어 있습니다. 스크립트: `create`, `submit-batch`, `query-status`, `doctor`, `status`, `typecheck`. 프리셋 프로필은 [프리셋 프로필](/rollups/preset-profiles)에 설명되어 있습니다.

옵션은 dApp 스캐폴더와 같으며, 위의 여섯 가지 템플릿 이름을 사용합니다. `multivm-rollup` 템플릿은 `--help`에는 나열되지만 패키지 README에는 없습니다(README에는 다섯 개가 나열됨).

테스트한 예제(개발자 허브, 2026년 10월 27일, 빈 디렉터리에서 npm의 `npx`). 관찰된 결과: `Created my-rollup (defi-rollup template)`과 통과한 `tsc --noEmit`. 같은 날 0.6.2로 같은 스캐폴드와 `npm run typecheck`를 반복했고 결과는 같았습니다.

```bash
npx -y create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
cd my-rollup && npm run typecheck
```

스캐폴더가 출력하는 다음 단계: `npm install`, `.env`에 운영자 키 입력, `npm run doctor`, `npm run create`, `npm run query-status`. 생성된 `.env`에는 이미 공개 테스트넷 엔드포인트(`https://api-testnet.qore.host`, `https://rpc-testnet.qore.host`, `https://evm-testnet.qore.host`)가 들어 있고 키 필드는 비어 있습니다. `QORE_MNEMONIC` 또는 `QORE_OPERATOR_PRIVATE_KEY_HEX`(포스트 양자 시드용 `QORE_PQC_SEED_HEX`와 함께)입니다. 이 파일은 절대 커밋하지 마세요.

### `qorollup` CLI {#qorollup}

```bash
npm install -g @qorechain/rdk-cli
qorollup --version          # 0.7.0
qorollup doctor --network testnet
```

설치하지 않고 실행할 수도 있습니다: `npx @qorechain/rdk-cli doctor`.

| 명령 | 기능 |
| --- | --- |
| `doctor` | 사전 점검: 엔드포인트, 모듈 파라미터, 네트워크 일치, 서명자, 잔액, 구성 |
| `params` | 실시간 모듈 파라미터 출력 |
| `create --rollup-id <id>` | 롤업 생성(`--profile`, `--stake-uqor`, `--dry-run`) |
| `status <id>`, `watch <id>` | 상태와 건전성, 또는 실시간 보기(`--interval <ms>`) |
| `advise <id>` | QCAI Copilot의 조언([QCAI Copilot](/rollups/qcai-copilot) 참조) |
| `suggest "<use case>"` | 사용 사례에 맞는 프로필 제안 |
| `receipt <id> <batch>` | 정산 영수증 생성(`--verify`, `--out <file>`), [정산 영수증](/rollups/settlement-receipts) 참조 |
| `watchtower <id>` | 옵티미스틱 롤업용 챌린저 프레임워크, [Watchtower](/rollups/watchtower) 참조 |
| `pause`, `resume`, `stop <id>` | 수명 주기 전환(생성자만 가능) |
| `keygen` | 운영자 키 생성(니모닉과 주소) |
| `manifest export`, `manifest import` | 롤업 매니페스트 내보내기 또는 가져오기 |
| `withdraw --file <json>` | 출금을 조립하여 제출(`--dry-run`) |
| `faucet <address>` | 테스트넷 자금 요청(`QORE_FAUCET_URL` 필요) |

전역 플래그: `--network testnet|mainnet`(기본값 testnet), `--rest`, `--rpc`, `--evm-rpc`(엔드포인트 재정의, 또는 `QORE_REST_URL`, `QORE_RPC_URL`, `QORE_EVM_RPC_URL`), `--mnemonic` 또는 `--key`(또는 `QORE_MNEMONIC`, `QORE_OPERATOR_PRIVATE_KEY_HEX`), `--profile defi|gaming|nft|enterprise|custom`, `--json`, `-y, --yes`, `-h, --help`, `-v, --version`.

**`doctor`.** 트랜잭션을 보내는 모든 작업 전에 실행하세요. 2026년 10월 27일 테스트넷에서 0.6.2로 서명자를 설정하지 않고 관찰한 출력입니다(메인넷도 `qorechain-vladi`와 `https://api.qore.host`만 다르고 같게 출력됩니다. 도구는 긴 대시를 출력하지만 여기서는 하이픈으로 표시했습니다):

```text
Preflight (testnet - qorechain-diana):
✓ REST endpoint reachable - https://api-testnet.qore.host
✓ Module parameters readable - min stake 10000 QOR, burn 1%
✓ Network matches expectation - client is testnet (qorechain-diana)
! Signer configured - no signer (Set QORE_OPERATOR_PRIVATE_KEY_HEX or QORE_MNEMONIC to create/operate.)
All checks passed.
```

`!`로 시작하는 줄은 경고이며 실행을 실패시키지 않습니다. 서명자가 없는 것은 롤업을 생성하거나 운영하려는 경우에만 문제가 됩니다. 실패한 점검이 없으면 명령은 0으로 종료됩니다.

**테스트한 예제.** 개발자 허브에서: 키 없이 실시간 모듈 파라미터를 읽습니다. 0.6.1에서는 실패했고(명령이 아무것도 출력하지 않고 0으로 종료) 0.6.2에서 다시 실행했습니다.

```bash
npx -y @qorechain/rdk-cli params --network testnet --rest https://api-testnet.qore.host
```

`npx`, 전역 설치, 로컬 `node_modules/.bin/qorollup` 링크로 0.6.2에서(그리고 로컬 링크로 0.7.0에서도, `qorollup --version`은 0.7.0을 출력) 관찰한 결과: 모듈 파라미터가 출력됩니다(최대 롤업 200개, 최소 스테이크 10000 QOR, 생성 소각 1%, 챌린지 윈도우 3600 s, 최대 데이터 가용성 blob 2,097,152 바이트, blob 보관 432,000 블록, 블록당 최대 배치 10개). 생성의 드라이런도 관찰되었습니다.

```bash
qorollup create --rollup-id my-roll --profile defi --dry-run --network testnet
# Create rollup "my-roll" (profile defi, zk/evm)
# Stake 10000 QOR - burned on creation: 100 QOR
# Dry run OK - would submit MsgCreateRollup (no broadcast).
```

## 이용 방법 {#how-to-access}

* **사전 요구 사항.** Node.js 20 이상과 패키지 매니저. 스캐폴더는 파일을 쓰고, `--no-install`을 전달하지 않으면 의존성을 설치하므로 npm 레지스트리에 대한 네트워크 접근이 필요합니다. Python, Rust, Go, Java RDK 클라이언트는 라이브러리이며 스캐폴더가 없습니다. [롤업 배포하기](/rollups/deploying-a-rollup)를 참조하세요.
* **네트워크와 엔드포인트.** 메인넷 `qorechain-vladi`(EVM 체인 id 9801): REST `https://api.qore.host`, RPC `https://rpc.qore.host`, EVM `https://evm.qore.host`. 테스트넷 `qorechain-diana`(체인 id 9800): 첫 번째 레이블 뒤에 `-testnet`이 붙은 같은 호스트, 예를 들어 `https://api-testnet.qore.host`. 데이터 읽기, `doctor`, `params`, `suggest`, `--dry-run`에는 계정이 필요 없습니다.
* **계정과 키.** 트랜잭션을 보내는 모든 작업에는 자금이 있는 운영자 계정과 그 니모닉 또는 개인 키가 필요하며, 환경 변수나 플래그로 제공하고 절대 커밋하지 않습니다. 롤업을 생성하려면 최소 스테이크(두 네트워크 모두 10,000 QOR, 2026년 10월 27일 실시간으로 읽음)가 필요하며 그중 1%는 생성 시 소각됩니다. `qorollup keygen`은 새 키를 만들고, 테스트넷에서는 테스트 자금을 [Dashboard Faucet](/dashboard/faucet)에서 받거나 `QORE_FAUCET_URL`을 설정한 `qorollup faucet`으로 받습니다.
* **하이브리드 서명.** 네이티브 레인 트랜잭션에는 secp256k1 서명과 ML-DSA-87 서명이 모두 필요합니다. 템플릿은 니모닉에서 포스트 양자 키를 파생하지만, `qorollup` 트랜잭션 명령은 그렇지 않습니다(아래 제한 사항 참조).
* **비용.** 도구는 무료입니다(Apache-2.0). 체인에서 수수료 최저가는 가스당 0.1 uqor이며, 생성에는 위의 롤업 스테이크와 소각이 적용됩니다.

## 배포 위치 {#where-published}

| 레지스트리 | 패키지 | 버전 | 링크 |
| --- | --- | --- | --- |
| npm | `create-qorechain-dapp` (명령 `create-qorechain-dapp`) | 0.10.0 | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `create-qorechain-rollup` (명령 `create-qorechain-rollup`) | 0.7.0 | https://www.npmjs.com/package/create-qorechain-rollup |
| npm | `@qorechain/rdk-cli` (명령 `qorollup`) | 0.7.0 | https://www.npmjs.com/package/@qorechain/rdk-cli |
| npm | `@qorechain/rdk` (템플릿이 사용하는 라이브러리) | 0.7.0 | https://www.npmjs.com/package/@qorechain/rdk |

소스: https://github.com/qorechain/qorechain-sdk/tree/main/cli (dApp 스캐폴더), https://github.com/qorechain/qorechain-rdk/tree/main/cli (롤업 스캐폴더), https://github.com/qorechain/qorechain-rdk/tree/main/packages/rdk-cli (`qorollup`). RDK 0.7.0 릴리스는 PyPI, crates.io, Maven Central, Go 모듈 프록시에도 있습니다(2026년 10월 27일 확인). 모두 Apache-2.0입니다.

## 제한 사항 및 알려진 문제 {#limits}

* **테스트 실행에서 `--network mainnet`은 생성된 파일을 바꾸지 않았습니다.** 2026년 10월 27일에 `fullstack-web`과 `custom-rollup`을 `--network mainnet`으로 스캐폴딩했는데, 생성된 `.env`는 여전히 localhost 엔드포인트(dApp) 또는 테스트넷 엔드포인트와 함께 `QORE_NETWORK=testnet`(롤업)을 담고 있었고, dApp의 `App.tsx`는 `testnet` 클라이언트를 생성했습니다. `.env`에서, 웹 템플릿은 `src/App.tsx`에서도 네트워크와 엔드포인트를 직접 설정하세요.
* **아직 두 네트워크 어디에도 롤업이 없습니다**(2026년 10월 27일 확인). 롤업 도구의 어떤 트랜잭션 경로도 라이브 롤업에서 실행해 본 적이 없습니다. 먼저 테스트넷에서 모든 것을 검증하고 [RDK 0.7.0: 변경 사항 및 제한](/rollups/deploying-a-rollup#rdk-050-limits)을 읽으세요.
* **`defi-rollup` 템플릿은 배치를 정산할 수 없습니다.** ZK 정산은 아직 어느 네트워크에서도 사용할 수 없으며(키 등록은 체인 v3.2.7에서 제공될 예정), 데모 회로는 어떤 경우에도 체인의 증명 검사를 통과할 수 없습니다. 0.7.0부터 템플릿은 전송 전에 멈추므로, 체인이 항상 거부하는 배치에 더 이상 수수료를 쓰지 않습니다. 상황이 바뀔 때까지는 `optimistic` 정산을 쓰는 템플릿을 사용하세요([ZK, STARK 및 출금](/rollups/zk-stark-withdrawals) 참조).
* **`multivm-rollup` 템플릿은 아직 라이브가 아닌 것에 의존합니다.** `0x0000000000000000000000000000000000000901`의 크로스 VM 프리컴파일은 어느 네트워크에서도 활성화되어 있지 않으므로 컨트랙트에서의 호출은 아무 일도 하지 않습니다. 템플릿은 이를 확인하며 컨트랙트는 조용히 실패하는 대신 되돌려지도록(revert) 작성되어 있습니다([멀티 VM](/rollups/multi-vm) 참조).
* **`qorollup` 트랜잭션 명령은 고전 서명만 합니다.** `create`, `pause`, `resume`, `stop`, `withdraw`는 포스트 양자 키 없이 연결되며, 두 네트워크 모두 네이티브 레인에서 이를 거부합니다. 읽기, `doctor`, `params`, `receipt`, `--dry-run`은 영향을 받지 않습니다. 트랜잭션을 보내려면 스캐폴딩된 프로젝트(그 스크립트는 하이브리드로 서명함), `pqcKeypair`를 사용하는 TypeScript RDK, 또는 체인 CLI를 사용하세요.
* **일부 `qorollup` 도우미는 아직 연결할 대상이 없습니다.** 10월 27일 테스트넷에 대한 `advise`는 수수료, 네트워크, 사기, RL 에이전트 항목(노드가 501 또는 "method does not exist"로 응답)과 존재하지 않는 롤업에 대해 "advisory unavailable"을 출력했습니다. `suggest`는 `source: fallback`인 프로필을 반환했으며, 이는 어시스턴트 서비스 대신 내장 기본 목록이 사용되었음을 나타냅니다. 경고를 읽으세요.
* **`rollup-app`은 요청할 때만 브로드캐스트합니다.** 기본값은 드라이런이며, `QORE_BROADCAST=1`이면 계정의 ML-DSA-87 키를 한 번 등록하고 하이브리드로 서명합니다. 샘플 롤업 값은 예시일 뿐이므로 실제 프로필 이름과 스테이크는 [프리셋 프로필](/rollups/preset-profiles)에서 가져오세요.
* **`fullstack-web`은 토크노믹스 버튼에서 오류를 표시합니다.** 해당 패널은 공개 엔드포인트가 제공하지 않는 `qor_` JSON-RPC 메서드를 호출하며, 잔액 조회는 동작합니다. `client.rest.getBurnStats()` 같은 REST 읽기로 대체하세요.
* **`evm-solidity`에는 자금이 있는 계정 이상이 필요합니다.** QoreChain에서 EVM 트랜잭션을 보내려면 등록된 ML-DSA-87 키와 열려 있는 EVM 승인 윈도우도 필요하며, 이는 네이티브 레인에서 설정합니다([EVM 가이드](/developer-guide/evm-development#evm-window) 참조). 이 페이지를 위해 템플릿의 `deploy` 스크립트를 라이브 네트워크에 대해 실행해 보지는 않았습니다.
* **`create-qorechain-dapp --version`은 `0.5.1`을 출력합니다.** 설치된 패키지는 0.10.0인데도 그렇습니다(2026년 10월 27일 확인). 버전은 `package.json` 또는 레지스트리에서 확인하세요.
* **패키지 README가 최신이 아닙니다.** `create-qorechain-dapp` README는 템플릿 두 개를, `create-qorechain-rollup` README는 다섯 개를 나열하지만, `--help`는 각각 세 개와 여섯 개를 보여줍니다. `--help`를 신뢰하세요.
* **0.6.2 이전 버전은 npm에서 동작하지 않습니다.** `qorollup` 0.6.1 이하는 npm으로 어떤 방식으로 설치해도 아무것도 출력하지 않고 코드 0으로 종료되었으며 `--version`은 `0.4.1`을 출력했습니다. 0.6.1을 꼭 유지해야 한다면 `node node_modules/@qorechain/rdk-cli/dist/index.js <command>`를 실행하고, 그렇지 않다면 업그레이드하세요.
* **의존성 사본(0.6.x만 해당).** `@qorechain/rdk` 0.6.2 이하는 `@qorechain/sdk` `^0.9.0`에 의존했으므로, SDK 0.10.0도 설치한 프로젝트에는 중첩된 두 번째 SDK 0.9.x가 들어 있었습니다. 0.7.0부터 키트는 `@qorechain/sdk` `^0.10.0`에 의존하며 사본 하나를 공유합니다.
