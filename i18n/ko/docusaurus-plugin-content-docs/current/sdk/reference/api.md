---
slug: /sdk/reference/api
title: API 레퍼런스
sidebar_label: API
sidebar_position: 3
---

# API 레퍼런스

## TypeScript (`@qorechain/sdk`)

TypeScript 패키지는 공개 표면 전반에 완전한 TSDoc를 제공하며,
[TypeDoc](https://typedoc.org) 구성이 코어 패키지에 연결되어 있습니다.
`@qorechain/sdk`의 HTML API 레퍼런스를 생성하려면:

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

이 명령은 `packages/ts`에 정의된 `docs:api` 스크립트(`typedoc`)를 실행하여, 해당
패키지의 `docs/` 출력 디렉터리 아래에 API 사이트를 생성합니다. 생성된 출력은
커밋되지 않습니다 — 명령을 로컬에서 실행하거나 자체 문서 파이프라인에 연결하세요.

문서 사이트 자체의 TypeDoc 구성은 `docs/typedoc.json`에 있습니다. 이는 코어 패키지의
진입점을 가리키므로 문서 프로젝트에서도 다시 생성할 수 있습니다.

### 공개 표면 한눈에 보기

`@qorechain/sdk`의 의도적이고 지원되는 익스포트:

- **Client:** `createClient`, 타입 `QoreChainClient`, `CreateClientOptions`,
  `ConnectTxOptions`, `ClientFees`.
- **Networks:** 프리셋, lookup/list 헬퍼, 그리고 구성 타입(networks
  모듈).
- **Utilities:** `toBase` / `fromBase` (denom), 주소 인코딩/검증.
- **Accounts:** `generateMnemonic`, `validateMnemonic`, `deriveNativeAccount`,
  `deriveEvmAccount`, `deriveSvmAccount`; 계정 타입.
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, 길이 상수,
  알고리즘 ID/헬퍼, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **Read clients:** `RestClient`, `JsonRpcClient`, `QorClient`, HTTP 헬퍼
  (`getJson`, `postJsonRpc`, `buildUrl`, `joinUrl`, `QoreHttpError`).
- **Cross-VM:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **CosmWasm:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **Transactions:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient`,
  `MSG_SEND_TYPE_URL`, 하이브리드 헬퍼(`encodeHybridExtension`,
  `attachHybridExtension`, `buildHybridTx`, `signAndBroadcastHybrid`).

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, `erc20` 헬퍼, 컨트랙트
래퍼(`deployContract`, `readContract`, `writeContract`), `precompiles`
바인딩, `PRECOMPILE_ADDRESSES`, 그리고 ABI(`ERC20_ABI`, `IQORE_PQC_ABI`,
`IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, 프로그램 빌더(`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`), 그리고 프로그램 id
상수.

## 다른 언어

| 언어 | 생성된 문서 | 설치 |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — 공개 API의 docstring | `pip install qorechain-sdk` (import `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...` |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` |

각 패키지는 동일한 표면(네트워크 프리셋, denom/주소
유틸리티, HD 파생, PQC 프리미티브, REST + `qor_` JSON-RPC 읽기 클라이언트)을
그대로 반영하며, 언어 네이티브 문서 도구가 렌더링할 수 있도록 소스에 인라인으로
문서화되어 있습니다.
