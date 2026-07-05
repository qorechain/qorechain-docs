---
slug: /sdk/reference/api
title: API 레퍼런스
sidebar_label: API
sidebar_position: 3
---

# API 레퍼런스

## TypeScript (`@qorechain/sdk`)

TypeScript 패키지는 공개 표면(public surface) 전체에 TSDoc이 포함되어 배포되며,
코어 패키지에는 [TypeDoc](https://typedoc.org) 설정이 연결되어 있습니다.
`@qorechain/sdk`의 HTML API 레퍼런스를 생성하려면 다음을 실행하세요:

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

이 명령은 `packages/ts`에 정의된 `docs:api` 스크립트(`typedoc`)를 실행하여 해당
패키지의 `docs/` 출력 디렉터리 아래에 API 사이트를 생성합니다. 생성된 출력물은
커밋되지 않으므로, 명령을 로컬에서 실행하거나 자체 문서 파이프라인에
연결하세요.

문서 사이트 자체의 TypeDoc 설정은 `docs/typedoc.json`에 있으며, 코어 패키지의
엔트리 포인트를 가리키므로 문서 프로젝트에서도 다시 생성할 수 있습니다.

### 공개 표면 한눈에 보기

`@qorechain/sdk`가 의도적으로 지원하는 export 목록:

- **클라이언트:** `createClient`, 타입 `QoreChainClient`, `CreateClientOptions`,
  `ConnectTxOptions`, `ClientFees`.
- **네트워크:** 프리셋, 조회/목록 헬퍼, 설정 타입(networks 모듈).
- **유틸리티:** `toBase` / `fromBase`(denom), 주소 인코딩/검증.
- **계정:** `generateMnemonic`, `validateMnemonic`, `deriveNativeAccount`,
  `deriveEvmAccount`, `deriveSvmAccount`; 계정 타입.
- **통합 계정 (0.6.0):** `deriveUnifiedAccount`,
  `unifiedAccountFromSeed`, `addressesFrom20`, `qoreAddresses`,
  `unifiedAccountFromPhantomSignature`, `connectPhantomUnified`.
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, 길이 상수,
  알고리즘 ID/헬퍼, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **읽기 클라이언트:** `RestClient`(`getPermissionSchema` 포함),
  `JsonRpcClient`, `QorClient`, HTTP 헬퍼(`getJson`, `postJsonRpc`,
  `buildUrl`, `joinUrl`, `QoreHttpError`); 모든 모듈에 대한 타입 지정 쿼리
  클라이언트 — `amm`, `license`, `abstractaccount`(`permissionSchema`),
  그리고 `multilayer`의 `Anchor`/`Anchors` 상태 앵커(state-anchor) 쿼리 포함.
- **Cross-VM:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **CosmWasm:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **트랜잭션:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient`,
  `MSG_SEND_TYPE_URL`, 하이브리드 헬퍼(`encodeHybridExtension`,
  `attachHybridExtension`, `buildHybridTx`, `signAndBroadcastHybrid`);
  `decodeTxError`를 통한 구조화된 오류 디코딩(`abstractaccount`
  코드 5/6/10/11 및 `pqc` 코드 21 포함).
- **eth-native 서명 (0.6.0):** `signClassicalEth`, `signHybridEth`
  (`keccak256(SignDoc)`에 대한 secp256k1 서명, 공개키 타입
  `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`, 그리고 ML-DSA-87 하이브리드
  익스텐션), `EthNativeSigner`, `accountAuthInfo`.
- **Authenticator 레인 (0.7.0):** 메시지 컴포저
  `msg.abstractaccount.registerAuthenticator` / `revokeAuthenticator` /
  `executeEvm` / `executeCosmos` 및 `msg.pqc` 로테이션(단독으로도
  `executeEvmMsg`, `executeCosmosMsg`,
  `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`,
  `rotatePqcKeyMsg`로 export됨); 바이트 단위로 정확한 sign-bytes인
  `evmAuthSignBytes`, `cosmosAuthSignBytes`, `rotationSignBytes`; 지갑 빌더
  `buildPhantomExecuteEvm` / `buildPhantomExecuteCosmos`(ed25519
  `signMessage`) 및 `buildMetaMaskExecuteEvm` / `buildMetaMaskExecuteCosmos`
  (EIP-191 `personal_sign`); 키 로테이션 `rotatePqcKeyMsgFromMnemonic`,
  `derivePqcLegacy`. 자세한 내용은
  [Authenticators 가이드](/sdk/guides/authenticators)를 참고하세요.

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, `erc20` 헬퍼, 컨트랙트
래퍼(`deployContract`, `readContract`, `writeContract`), `precompiles`
바인딩, `PRECOMPILE_ADDRESSES`, 그리고 ABI(`ERC20_ABI`, `IQORE_PQC_ABI`,
`IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, 프로그램 빌더(`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`), 그리고 프로그램 ID
상수.

## 기타 언어

| 언어 | 생성 문서 | 설치 |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — 공개 API의 docstring | `pip install qorechain-sdk`, 버전 `0.7.0` (import `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...` (태그 `packages/go/v0.7.0`) |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` — 최신 게시 크레이트(저장소 기준 0.7.0; import `qorechain`) |
| Java | Maven Central javadoc | `io.github.qorechain:qorechain-sdk:0.7.0` |

각 패키지는 동일한 표면(네트워크 프리셋, denom/주소 유틸리티, HD 파생 —
통합 eth-native 계정 포함 — PQC 프리미티브와 하이브리드 서명, 타입 지정
메시지와 쿼리, authenticator 레인, 그리고 REST + `qor_` JSON-RPC 읽기
클라이언트)을 미러링하며, 소스에 인라인으로 문서화되어 있어 각 언어의
네이티브 문서 도구가 이를 렌더링합니다. TypeScript 지갑 빌더
(`buildPhantom*` / `buildMetaMask*`)와 브라우저 지갑 어댑터는
TypeScript 전용입니다.
