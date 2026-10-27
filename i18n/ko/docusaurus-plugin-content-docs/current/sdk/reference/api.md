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
  `unifiedAccountFromSeed`, `addressesFrom20`, `qoreAddresses`. (`unifiedAccountFromPhantomSignature`와 `connectPhantomUnified`는 0.8.0에서 제거되었으며 오류를 발생시킵니다.)
- **PQC:** `generatePqcKeypair`, `pqcSign`, `pqcVerify`, 길이 상수,
  알고리즘 ID/헬퍼, `PqcSigner`, `HybridSigner`,
  `buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`.
- **PQC 키 라이프사이클 (0.9.0):** `ensurePqcRegistered`(REST로 상태를 읽고,
  `PqcKeyMismatchError`), `fetchPqcStatus`, `isRegisteredPqcKey`,
  `buildRegisterPqcKeyMsg`, `signProofOfPossession` / `verifyProofOfPossession`
  (`PROOF_OF_POSSESSION_DOMAIN`), `validateRegisteredPqcKey`,
  `isDegeneratePqcPublicKey`, `migrateToHybrid`, `migratePqcKeyHybrid`,
  `isUpgradeApplied` / `requireUpgradeApplied`(`CHAIN_UPGRADE_V3_2_2`,
  `CHAIN_UPGRADE_V3_2_3`, `CHAIN_UPGRADE_V3_2_4`).
- **읽기 클라이언트:** `RestClient`(`getPermissionSchema` 포함),
  `JsonRpcClient`, `QorClient`, HTTP 헬퍼(`getJson`, `postJsonRpc`,
  `buildUrl`, `joinUrl`, `QoreHttpError`); 모든 모듈에 대한 타입 지정 쿼리
  클라이언트 — `amm`, `license`, `abstractaccount`(`permissionSchema`),
  그리고 `multilayer`의 `Anchor`/`Anchors` 상태 앵커(state-anchor) 쿼리 포함.
  공개 엔드포인트에서는 일부 타입 지정 REST 헬퍼가 게이트웨이가 제공하지 않는
  경로를 호출합니다: `getAiStats`, `getFeeEstimate`, `getXqorePosition`,
  `getInflationRate`, `getReputation`.
  `getBurnStats`, `getAllBalances`, `getBridgeChains`, `getPermissionSchema`,
  그리고(복수형 `accounts` 경로를 실제로 제공되는 단수형
  `/qorechain/pqc/v1/account/{address}`로 고친 0.9.0부터) `getPqcAccount`는
  동작합니다.
- **Cross-VM:** `getCrossVmMessage`, `getPendingCrossVmMessages`,
  `getCrossVmParams`.
- **QoreChain Native:** `createCosmWasmClient`, `connectCosmWasmSigner`,
  `queryContractSmart`, `getContractInfo`, `instantiate`, `execute`,
  `uploadCode`.
- **트랜잭션:** `estimateFee`, `directSignerFromPrivateKey`, `TxClient`(0.9.0부터
  `pqcKeypair`로 연결하면 하이브리드, `HYBRID_VERIFY_GAS`),
  `MSG_SEND_TYPE_URL`, 하이브리드 헬퍼(`encodeHybridExtension`,
  `attachHybridExtension`, `buildHybridTx`, `signAndBroadcastHybrid`);
  `decodeTxError`를 통한 구조화된 오류 디코딩(`abstractaccount`
  코드 5/6/10/11 및 `pqc` 코드 21 포함. 0.10.0부터는 수수료 시뮬레이션 중에 텍스트로
  도착하는 거부도 이름으로 알려 줍니다).
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
  [Authenticators 가이드](/sdk/guides/authenticators)를 참고하세요(이 레인들의
  기반이 되는 모듈은 메인넷에서 꺼져 있고 테스트넷에서 활성화되어 있습니다).
- **하이브리드 sign-bytes (0.8.0+):** `buildHybridTx`, `signAndBroadcastHybrid`,
  `signHybridEth`, `EthNativeSigner`의 `signBytesVersion` 옵션
  (`"auto" | "v1" | "v2"`); `resolveSignBytesVersion`,
  `SIGN_BYTES_V2_UPGRADES`, `isHybridSignBytesRejection`, `hybridSignBytesV1` /
  `hybridSignBytesV2`, `migrationSignBytes`, `bridgeAttestationSignBytes`.
- **EVM 인증 윈도우 (0.8.2+):** `openEvmWindowMsg`(0.9.0부터 `nativeOnly`와
  `allowedTargets`), `closeEvmWindowMsg`, `fetchEvmWindow`,
  `classifyEvmWindowRejection`, `isEvmWindowRejection`, `MAX_EVM_WINDOW_BLOCKS`,
  `MAX_EVM_WINDOW_TXS`, `MAX_EVM_WINDOW_TARGETS`. 자세한 내용은
  [EVM 인증 윈도우](/sdk/guides/evm#evm-window)를 참고하세요.
- **EIP-7702 동의 (0.9.0):** `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`,
  `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`,
  `classifyEvmDelegationRejection`, `EVM_DELEGATION_CLEAR`,
  `MAX_EVM_DELEGATION_CONSENT_BLOCKS`.
- **추상 계정 다이제스트 v2 (0.9.0):** `evmAuthSignBytesV2`,
  `resolveEvmAuthDigestVersion`; `validateSpendingRules`.
- **체인 v3.2.4 (0.10.0):** 스테이킹 티어(`msg.stakingtier.lockDelegation` /
  `unlockEarly` / `claimBonus` / `updateParams`, `validateLockDelegation`,
  `STAKING_LOCK_MONTHS`, `fetchStakingTierParams`, `fetchStakingLocks`,
  `fetchStakingTierPool`); `fetchAuthNonce`; `fetchProtocolFeatures` /
  `isProtocolFeatureEnabled`; PQC 상태의 `possessionProven`;
  `ibcTimeoutTimestamp`; `CHAIN_UPGRADE_V3_2_4`. 자세한 내용은
  [0.10.0의 추가 사항](/sdk/install#whats-new-0100)을 참고하세요.
- **정규(canonical) PQC 파생 (0.8.3+):** `derivePqcCanonical(account, mnemonic)`,
  `canonicalAccount(account)`; PQC 등록 메시지는
  `buildRegisterPqcKeyMsg`입니다(`ensurePqcRegistered`에서 사용).
  `derivePqcLegacy`는 새 키에 대해 더 이상 권장되지 않습니다.

### `@qorechain/evm`

`createEvmClient`, `evmAccountFromPrivateKey`, `erc20` 헬퍼, 컨트랙트
래퍼(`deployContract`, `readContract`, `writeContract`), `precompiles`
바인딩, 프리컴파일 기반 헬퍼 `simulateWithRiskScore`, `aiRiskScore`,
`aiAnomalyCheck`, `PRECOMPILE_ADDRESSES`, 그리고 ABI(`ERC20_ABI`,
`IQORE_PQC_ABI`, `IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`). 프리컴파일 기반
바인딩과 헬퍼는 공개 네트워크에서 활성화되어 있지 않습니다
([EVM 프리컴파일](/developer-guide/evm-precompiles#network-status) 참조).

### `@qorechain/svm`

`createSvmClient`, `DEFAULT_SVM_RPC_URL`, `svmKeypairFromSecretKey`,
`svmAddress`, 프로그램 빌더(`createMemoInstruction`,
`createTransferTokenInstruction`, `createAssociatedTokenAccountInstruction`,
`getAssociatedTokenAddress`, `createInvokeInstruction`), 그리고 프로그램 ID
상수.

## 기타 언어

| 언어 | 생성 문서 | 설치 |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — 공개 API의 docstring | `pip install qorechain-sdk`, 버전 `0.10.0` (import `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...@v0.10.0` (태그 `packages/go/v0.10.0`) |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` (0.10.0; import `qorechain`) |
| Java | Maven Central javadoc | `io.github.qorechain:qorechain-sdk:0.10.0` |

각 패키지는 동일한 표면(네트워크 프리셋, denom/주소 유틸리티, HD 파생 —
통합 eth-native 계정 포함 — PQC 프리미티브와 하이브리드 서명, 타입 지정
메시지와 쿼리, authenticator 레인, 그리고 REST + `qor_` JSON-RPC 읽기
클라이언트)을 미러링하며, 소스에 인라인으로 문서화되어 있어 각 언어의
네이티브 문서 도구가 이를 렌더링합니다. TypeScript 지갑 빌더
(`buildPhantom*` / `buildMetaMask*`)와 브라우저 지갑 어댑터는
TypeScript 전용입니다.
