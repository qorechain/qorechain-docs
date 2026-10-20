---
slug: /sdk/reference/cli
title: CLI — create-qorechain-dapp
sidebar_label: CLI
sidebar_position: 2
---

# CLI: `create-qorechain-dapp`

공식 스타터 템플릿에서 새 QoreChain dApp을 스캐폴딩하세요.

```bash
# interactive
npm create qorechain-dapp my-dapp
# or
npx create-qorechain-dapp my-dapp

# non-interactive (CI)
npx create-qorechain-dapp my-dapp --template evm-solidity --yes --no-install
```

> `create-qorechain-dapp`(`0.9.0`)으로 npm에 게시되어 있습니다. 생성되는
> `package.json` 파일은 `@qorechain/sdk` `^0.9.0`에 의존합니다(EVM 템플릿은
> `@qorechain/evm` `^0.8.0`). 스캐폴더의 0.8.0 버전은 `^0.3.0` 범위를 기록했는데,
> npm은 이를 실제 네트워크에 서명할 수 없는 0.3 릴리스로 해석합니다. 0.8.0으로
> 스캐폴딩했다면 `npm i @qorechain/sdk@latest`를 실행하세요.

## 템플릿

| 템플릿 | 설명 |
| --- | --- |
| `evm-solidity` | Solidity `Counter` 컨트랙트 + viem 배포/상호작용 스크립트(`@qorechain/evm`). |
| `fullstack-web` | 잔액과 토크노믹스를 읽는 Vite + React + TypeScript dApp(`@qorechain/sdk`). |
| `rollup-app` | `RollupClient`와 멀티레이어 헬퍼를 사용하는 롤업 + 사이드체인/페이체인 앱(`@qorechain/sdk`). |

`rollup-app` 템플릿(0.9.0)은 기본적으로 드라이 런을 실행합니다. `QORE_BROADCAST=1`을
지정하면 니모닉에서 계정의 ML-DSA-87 키를 파생하고, 한 번 등록한 뒤 하이브리드로
서명하는데, 이전 템플릿은 이를 할 수 없었습니다. 샘플 롤업 값(`profile: "default"`,
스테이크)은 예시일 뿐입니다. 브로드캐스트하기 전에 [프리셋 프로필](/rollups/preset-profiles)과
라이브 모듈 파라미터에서 실제 프로필 이름과 스테이크를 가져오세요.

`fullstack-web` 템플릿은 `client.qor`를 통해 토크노믹스 개요를 읽는데, 이는 공개 엔드포인트가
제공하지 않는 `qor_` JSON-RPC 호출이므로 메인넷과 테스트넷에서는 해당 패널에 오류가 표시되며,
잔액 조회는 동작합니다. 공개 네트워크용으로는 `client.rest.getBurnStats()` 같은 REST 조회로
전환하세요.

## 옵션

| 플래그 | 설명 |
| --- | --- |
| `-t, --template <name>` | 사용할 템플릿(`evm-solidity` \| `fullstack-web` \| `rollup-app`). |
| `--network <name>` | 네트워크 프리셋(`testnet` \| `mainnet`). |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`. |
| `-y, --yes` | 프롬프트를 건너뛰고 기본값을 사용합니다. |
| `--no-install` | 스캐폴딩 후 의존성을 설치하지 않습니다. |
| `--local` | `@qorechain/*` 의존성을 SDK 모노레포로 향하는 로컬 `file:` 링크로 재작성합니다. |
| `-h, --help` | 도움말을 표시합니다. |
| `-v, --version` | 버전을 출력합니다. |

## 워크스페이스에 대한 로컬 개발

`@qorechain/*` 패키지는 npm에 게시되어 있으므로 평범한 `npm install`로 동작합니다.
`--local`을 사용하면 스캐폴딩된 프로젝트가 대신 모노레포 패키지를 가리키게 됩니다
(먼저 `pnpm -r build`로 빌드하세요):

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
