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

> `create-qorechain-dapp`(`0.3.0`)으로 npm에 게시되어 있습니다.

## 템플릿

| 템플릿 | 설명 |
| --- | --- |
| `evm-solidity` | Solidity `Counter` 컨트랙트 + viem 배포/상호작용 스크립트(`@qorechain/evm`). |
| `fullstack-web` | 잔액과 토크노믹스를 읽는 Vite + React + TypeScript dApp(`@qorechain/sdk`). |

## 옵션

| 플래그 | 설명 |
| --- | --- |
| `-t, --template <name>` | 사용할 템플릿(`evm-solidity` \| `fullstack-web`). |
| `--network <name>` | 네트워크 프리셋(`testnet` \| `mainnet`). |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`. |
| `-y, --yes` | 프롬프트를 건너뛰고 기본값을 사용합니다. |
| `--no-install` | 스캐폴딩 후 의존성을 설치하지 않습니다. |
| `--local` | `@qorechain/*` 의존성을 SDK 모노레포로 향하는 로컬 `file:` 링크로 재작성합니다. |
| `-h, --help` | 도움말을 표시합니다. |
| `-v, --version` | 버전을 출력합니다. |

## 워크스페이스에 대한 로컬 개발

`@qorechain/*` 패키지는 npm에 게시되어 있습니다. 게시된 후에는 평범한
`npm install`로 동작합니다. 그 전까지는 `--local`을 사용해 스캐폴딩된 프로젝트가
모노레포 패키지를 가리키게 하세요(먼저 `pnpm -r build`로 빌드하세요):

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
