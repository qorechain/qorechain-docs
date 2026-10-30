---
slug: /developer-tools/custody-kit
title: QoreChain 커스터디 키트
sidebar_label: 커스터디 키트
sidebar_position: 32
---

# QoreChain 커스터디 키트

QoreChain 커스터디 키트는 QoreChain에서 고객 자금을 보관하는 수탁 기관과 거래소를 위한 서면 통합 가이드, 테스트 벡터 세트, 작은 참조 코드입니다. 각 실행 레인에서 네트워크가 무엇을 요구하는지 설명하고, 통합에서 틀리기 쉬운 부분을 읽기 쉬운 코드로 보여줍니다. 주소 검사, 서명된 트랜잭션을 브로드캐스트하기 전에 디코딩하고 검증하는 일, 어떤 입금 전송을 반영할지 결정하는 일이 그에 해당합니다.

수탁 기관, 거래소, 결제 처리 업체, 지갑 백엔드와, 이런 통합을 검토하는 엔지니어와 감사자를 위한 것입니다. 버전 **0.1.0**, 2026년 10월 27일 게시, Apache-2.0. 메인넷(`qorechain-vladi`)과 테스트넷(`qorechain-diana`)에서 동작하며, 함께 제공되는 라이브 검사는 테스트넷에서 실행되고 읽기만 합니다.

**먼저 읽어 주세요. 이 키트는 라이브러리가 아니라 예제 코드입니다.** 저장소를 클론하고 사용하는 언어의 폴더를 읽고, 복사하거나, 벤더링합니다. 키트의 npm, PyPI, crates.io, Maven Central 패키지는 의도적으로 없습니다. 형식상 유일한 예외는 Go입니다. Go 폴더는 태그된 버전이 있는 Go 모듈이므로 `go get`으로 가져올 수 있지만, 여전히 안정적인 API를 약속하지 않는 예제 코드입니다([무엇이 라이브러리이고 무엇이 예제 코드인가](#library-vs-example) 참조). 서명과 암호학적 검증은 게시된 라이브러리인 [QoreSign](/qoresign/overview)에서 제공됩니다.

## 혁신 {#innovations}

- **다섯 개 언어에서 하나의 동작, 하나의 파일로 증명.** TypeScript, Python, Go, Rust, Java는 같은 네 가지 함수를 같은 결과와 같은 오류 코드로 구현합니다. 모든 언어는 공유 테스트 벡터 파일 `vectors/custody-v1.json`을 대상으로 실행되므로, 키트를 다른 언어로 이식하는 팀은 동일함을 증명할 수 있습니다.
- **주소에 대한 안정적인 오류 코드.** `validateAddress`는 예외를 던지지 않습니다. 성공하면 주소의 두 표기를 반환하고, 그렇지 않으면 열한 개의 안정적인 코드(`EMPTY`, `WHITESPACE`, `BAD_HEX`, `BAD_EIP55`, `NO_CHECKSUM`, `MIXED_CASE`, `BAD_BECH32`, `BAD_CHECKSUM`, `WRONG_PREFIX`, `BAD_LENGTH`, `KIND_NOT_ALLOWED`) 중 하나를 반환하므로, 출금 양식이 정확한 사유를 보여줄 수 있습니다.
- **브로드캐스트 전에 두 서명을 모두 검사.** `verifyTx`는 `SignDoc`에 대한 secp256k1 서명, 사용자가 전달한 키에 대한 ML-DSA-87 계층, 그리고 트랜잭션 안의 공개 키가 기대한 키인지를 검사합니다. `{ valid, classical, signerKey, pq }`를 반환하며, 잘못된 형식의 입력에서만 예외를 던지고 잘못된 서명에서는 던지지 않습니다. 별도의 프로세스가 무엇이든 전송하기 전에 서명된 모든 출금에 대해 이를 실행할 수 있습니다.
- **사유가 붙는 입금 결정.** `extractDeposits`는 트랜잭션의 모든 수신 전송을 `creditable` 플래그와 `reason`(`evm_failed`, `fee_refund`, `unsupported_message` 또는 `null`)과 함께 반환합니다. EVM 통합 담당자를 놀라게 하는 경우, 즉 실패한 EVM 실행도 네이티브 수준에서는 결과 코드 0을 보고하는 경우를 잡아냅니다.
- **노드와 일치하는 쿼리 빌더.** `buildDepositQuery`는 주소로 들어오는 전송에 대한 정확한 퍼센트 인코딩 REST 경로(limit 1~100, 높이 범위, 오름차순)를 만들고, `0x` 입력을 `qor1` 형식으로 변환합니다.
- **레인별로 작성된 안내.** 가이드는 네이티브 레인, 인가 윈도우가 있는 EVM 레인을 다루며, SVM 레인은 트랜잭션에 열려 있지 않으므로 그 위에 입금이나 출금 흐름을 만들어서는 안 된다고 명시합니다.

## 사용 사례 {#use-cases}

1. **거래소용 입금 스캐너.** 높이 커서를 유지하고, 자체 노드에 대해 `buildDepositQuery({ address, minHeight, maxHeight })`를 호출한 다음 `extractDeposits(txResponse, address)`로 `uqor` 단위의 성공한 `MsgSend`, `MsgMultiSend`, EVM 전송을 반영합니다. 실패한 EVM 실행, 가스 환불, 기타 메시지는 제외되거나 검토용으로 표시됩니다.
2. **두 번째 승인자가 있는 출금 파이프라인.** 서명자가 하이브리드 서명된 출금을 만든 뒤, 독립된 프로세스가 트랜잭션을 브로드캐스트하기 전에 `decodeTx`(수신자, 금액, 수수료, 메모)와 `verifyTx`(두 서명, 기대 키)를 실행합니다.
3. **주소 접수.** 사용자가 입력한 모든 출금 주소를 `validateAddress`로 검증하고, `qorvaloper` 주소는 결제 대상으로 거부하며, 필요하면 16진수 입력에 EIP-55 체크섬을 요구합니다.
4. **HSM 계획.** 보안 팀이 키 관리 가이드를 이용해 HSM에서 생성한 ML-DSA-87 키와 니모닉 기반 정규 파생 중 하나를 선택하고, 빈 컨텍스트로 순수 ML-DSA-87 서명을 하는 PKCS #11 v3.2 지원을 확인하며, 교체와 백업을 설계합니다.
5. **EVM 지급 레일.** EVM 레인에서 지급하는 거래소는 ML-DSA-87 키를 한 번 등록하고, 하나의 하이브리드 네이티브 레인 트랜잭션으로 배치마다 범위가 제한된 인가 윈도우를 연 다음, 기존 secp256k1 스택으로 일반 EIP-1559 트랜잭션에 서명합니다.
6. **고객을 위한 스테이킹.** 스테이킹을 제공하는 수탁 기관은 스테이킹 가이드(위임, 위임 해제, 재위임, 보상, 스테이킹 티어 잠금)를 따르고, 서명하기 전에 모든 스테이킹 메시지를 `decodeTx`로 디코딩합니다.
7. **다른 언어로의 이식 또는 감사.** 자체 구현을 작성하는 팀은 이를 `vectors/custody-v1.json`에 대해 실행하여 참조 결과 및 오류 코드와 일치함을 보여줍니다.
8. **메인넷 전 리허설.** 통합 팀은 테스트넷 리허설(키 등록, 하이브리드 전송, 입금 스캔, 스테이킹, EVM 윈도우, 키 교체)과 통합 체크리스트를 따릅니다.

## 작동 방식 {#how-it-works}

### 키트에 들어 있는 것 {#contents}

| 구성 요소 | 설명 |
|---|---|
| `docs/` | 열 개의 가이드 페이지: 레인별 서명, 주소와 파생, 입금, 출금, 스테이킹, 오류, 키 관리, 테스트 환경, 통합 체크리스트, FAQ. |
| `code/ts`, `code/python`, `code/go`, `code/rust`, `code/java` | 같은 네 가지 함수와 언어별 작은 예제 명령줄을 갖춘 참조 코드. |
| `vectors/custody-v1.json` | 테스트 벡터: 오류 코드마다 하나씩의 올바른 주소와 잘못된 주소, eth-native 계정의 하이브리드 서명된 `MsgDelegate`, 하이브리드 서명된 `MsgOpenEVMWindow`, 스테이킹 및 윈도우 메시지, 잘못된 형식의 트랜잭션, 입금 쿼리와 입금 추출 사례. QoreSign 벡터는 참조로 재사용되며 SHA-256으로 확인됩니다. |
| 라이브 검사 | `QORE_LIVE_TEST=1`로 켜는 테스트넷 대상 읽기 전용 검사: 스테이킹 파라미터, 최근 전송에 대한 입금 쿼리, 커밋된 하이브리드 트랜잭션의 검증. |

### 무엇이 라이브러리이고 무엇이 예제 코드인가 {#library-vs-example}

| 구성 요소 | 종류 | 구하는 곳 |
|---|---|---|
| QoreSign(서명, ML-DSA-87 및 secp256k1 검증, 키 등록 메시지) | 게시된 라이브러리 | npm, PyPI, crates.io, Go, Maven Central. [QoreSign](/qoresign/overview) 참조. |
| TypeScript, Python, Rust, Java로 된 키트의 코드 | 예제 코드이며 어떤 레지스트리에도 게시되지 않음 | `qorechain/qorechain-custody-kit`을 클론하여 폴더를 복사하거나 벤더링. |
| Go로 된 키트의 코드(패키지 `custodykit`) | 예제 코드. 태그된 버전의 Go 모듈로 가져올 수 있으나 안정적인 API는 약속하지 않음 | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0`, 또는 클론하여 벤더링. |
| 가이드 페이지, 벡터, 체크리스트 | 문서와 데이터 | 저장소. |

키트는 어떤 서명 방식도 구현하지 않습니다. ML-DSA-87과 secp256k1 검증은 QoreSign에서 제공됩니다. Python 코드에는 EIP-55 체크섬에 쓰이는 작은 Keccak-256이 들어 있으며, 그 외의 용도는 없습니다.

### 레인 {#lanes}

| 레인 | 수탁 기관이 서명하는 것 | 상태 |
|---|---|---|
| 네이티브(Cosmos SDK) | secp256k1 `SIGN_MODE_DIRECT`와 ML-DSA-87(FIPS 204) 계층. 키가 등록된 계정에는 클래식 경로가 없으며, 키가 없는 계정은 키를 등록하기 위해(또는 unjail을 위해)서만 클래식으로 보낼 수 있습니다. | 열림 |
| EVM | 일반 secp256k1 Ethereum 트랜잭션(EIP-155 및 EIP-1559). 등록된 ML-DSA-87 키와 유효한 인가 윈도우가 있는 발신자에 대해 허용되며, 윈도우는 하이브리드 네이티브 레인 트랜잭션으로 열립니다. 윈도우당 ML-DSA-87 서명 하나입니다. | 열림 |
| SVM | 해당 없음 | 트랜잭션에 열려 있지 않음 |

### 하이브리드 네이티브 레인 트랜잭션 {#hybrid}

- 하이브리드 트랜잭션은 같은 계정이 두 번 서명한 일반 `TxRaw`입니다. ML-DSA-87 서명은 확장 옵션 `/qorechain.pqc.v1.PQCHybridSignature`(`algorithm_id = 1`, 4,627바이트 서명, 선택적으로 2,592바이트 공개 키)로 본문에 실려 갑니다. secp256k1 서명은 확장을 포함한 최종 본문에 대한 통상의 `SIGN_MODE_DIRECT` 서명입니다.
- ML-DSA-87 서명은 확장을 제외한 서명 바이트를 대상으로 합니다. 두 공개 네트워크는 서명 바이트 v2(도메인 문자열, 체인 ID, 이어서 본문과 auth info 바이트)를 검증합니다. hedged 방식과 결정적 FIPS 204 서명 모두 허용됩니다. 규범이 되는 형식은 [QoreSign 하이브리드 서명 명세](/qoresign/spec/hybrid-signing-v1)입니다.
- 작업 순서: 본문과 auth info를 인코딩(수수료와 가스 고정), v2 서명 바이트 계산, ML-DSA-87로 서명, 확장 추가, secp256k1로 `SignDoc`에 서명, 브로드캐스트.
- 키 등록: `MsgRegisterPQCKeyV2`(`key_type = "hybrid"`, 선택 사항이지만 권장되는 소유 증명 포함). 키가 없는 계정에서 핫 주소당 한 번 클래식으로 서명합니다. QoreSign이 메시지 전체를 만듭니다.
- 하이브리드 트랜잭션은 클래식 트랜잭션보다 약 4.7 KB 크고 가스를 더 사용하므로, 항상 시뮬레이션하세요.

### 주소 {#addresses}

- `qor1...`와 `0x...`는 같은 20바이트의 두 표기입니다. 어느 쪽으로 보낸 자금이든 같은 잔액에 도착합니다. `qorvaloper1...`는 검증자 운영자 주소이며 결제 주소가 아닙니다.
- 계정 종류는 두 가지입니다. `secp256k1`(코인 타입 118, 경로 `m/44'/118'/0'/0/i`)과 eth-native `eth_secp256k1`(코인 타입 60, 경로 `m/44'/60'/0'/0/i`)입니다. 같은 니모닉에서 서로 다른 두 계정이 나옵니다. eth-native 계정은 하나의 키로 네이티브 레인과 EVM 레인을 모두 운영할 수 있게 합니다.
- ML-DSA-87 키는 정규 파생(QoreChain 지갑과 SDK가 등록하는 방식이며 `qor1` 주소와 니모닉에 묶임), 초안 단계의 계층적 파생, 또는 HSM에서 생성한 무작위 키에서 얻을 수 있습니다. 유효한 키라면 등록된 뒤에는 어느 것이든 동작합니다. [키 파생](/qoresign/guides/key-derivation)을 참조하세요.

### 입금 {#deposits}

- QoreChain은 블록이 커밋될 때 확정합니다. 재구성(reorganisation)은 없으므로, 커밋된 블록 안의 트랜잭션은 한 블록 뒤에 최종입니다. 추가 확인은 운영상의 선택입니다.
- 네이티브 레인 입금은 `GET /cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...' AND tx.height>=H1 AND tx.height<=H2&order_by=ORDER_BY_ASC`로 찾습니다. `buildDepositQuery`가 정확히 이 경로를 만듭니다.
- `extractDeposits`의 반영 규칙: `code != 0`인 트랜잭션은 아무것도 옮기지 않았습니다. `msg_index`가 없는 `transfer`는 수수료 지불입니다. 금액은 denom으로 필터링됩니다(기본값은 `uqor`). `MsgSend`와 `MsgMultiSend`의 출력은 반영 가능하고, `MsgEthereumTx`는 EVM 실행이 실패했거나 전송이 수수료 수취 계정(fee collector)에서 온 가스 환불인 경우를 제외하고 반영 가능합니다. 그 밖의 것은 검토를 위해 `reason: "unsupported_message"`와 함께 반환됩니다.

### 출금과 가스 {#withdrawals}

- 수수료 = ceil(가스 한도 x 가스 가격), 단위는 `uqor`입니다. 최소 가스 가격은 0.1 uqor이며 가스 한도에 부과됩니다.
- 가스 한도는 완전히 서명된 트랜잭션의 시뮬레이션에서 가져옵니다. v3.2.5 업그레이드를 적용한 노드(2026년 10월 29일부터 두 네트워크 모두)에서는 시뮬레이션에 ML-DSA-87 검증이 포함되므로 `ceil(gas_used x 1.02) + 2000`을 사용합니다. 그 전에는 `ceil((gas_used + 40000) x 1.4)`를 사용합니다. 어느 쪽이 해당하는지는 날짜가 아니라 `GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.5`로 확인합니다.
- 가스 한도를 정한 뒤에는 `AuthInfo`를 다시 만들고 다시 서명합니다. 두 서명 모두 수수료를 포함하기 때문입니다.
- 시퀀스: 핫 주소마다 서명자 큐를 하나씩 운영하거나, 병렬 지급을 위해 여러 핫 주소를 사용합니다.

### EVM 인가 윈도우 {#evm-windows}

- 윈도우는 `/qorechain.pqc.v1.MsgOpenEVMWindow`(`blocks` 1~17,280, `max_txs` 1~1,000, 값과 최대 수수료를 합산하는 `uqor` 단위의 `max_value`, 선택적 `native_only`, 최대 16개 주소의 선택적 `allowed_targets`)로 열고 `MsgCloseEVMWindow`로 닫습니다. 상태는 `GET /qorechain/pqc/v1/evm_window/{address}`에서 확인합니다.
- 윈도우를 열면 기존 윈도우를 대체하고 계정의 시퀀스(EVM nonce)가 증가합니다. 윈도우를 먼저 열고 그다음에 nonce를 읽으세요.
- `eth_call`과 `eth_estimateGas`에는 윈도우가 필요하지 않습니다.

## 사용 방법 {#how-to-use}

### 코드 받기 {#install}

키트는 참조 코드입니다. 패키지를 설치하는 대신 저장소를 클론하거나 사용하는 언어의 폴더를 벤더링하세요.

| 언어 | 받는 방법 | 의존 대상 | 최소 플랫폼 |
|---|---|---|---|
| TypeScript | `git clone https://github.com/qorechain/qorechain-custody-kit` 후 `cd code/ts && pnpm install && pnpm build` | `@qorechain/qoresign` 0.1.0 (npm) | Node.js 20 |
| Python | 클론한 뒤 `cd code/python && pip install -r requirements-dev.txt`. `verify_tx`에는 추가로 `pip install qorechain-qoresign==0.1.1` | 런타임에는 없음. `verify_tx`에는 `qorechain-qoresign` 0.1.1 (PyPI) | Python 3.9 |
| Go | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` (패키지 `custodykit`), 또는 클론 | `github.com/qorechain/qoresign/go` v0.1.0 | Go 1.25 |
| Rust | 클론한 뒤 `cd code/rust && cargo build` (crates.io에 없음) | `qorechain-qoresign` 0.1.0 (crates.io) | Rust 2021 edition |
| Java | 클론한 뒤 `cd code/java && mvn test` (Maven Central에 없음) | `io.github.qorechain:qoresign:0.1.0` (Maven Central), Gson | Java 17 |

QoreSign은 키트가 사용하는 모든 언어(Python 포함)로 게시되어 있습니다. Python 코드의 `verify_tx`에는 PyPI의 `qorechain-qoresign` 0.1.1이 필요합니다(macOS와 Linux). TypeScript, Go, Rust, Java 코드는 QoreSign 0.1.0에 고정되어 있으며, 이 버전은 0.1.1과 나란히 여전히 게시되어 있습니다.

### 퀵스타트 {#quickstart}

대상 네트워크: 체인을 읽는 모든 작업은 테스트넷(`qorechain-diana`)입니다. 환경 변수 `QORE_REST`는 예제와 라이브 검사가 다른 REST 엔드포인트를 가리키게 하며, 프로덕션에서는 이것이 자체 노드입니다. 아래 주소들은 공개 BIP-39 테스트 구문에서 나온 것이므로 절대 자금을 넣어서는 안 됩니다.

**1. 주소 검증(Go, 오프라인).** 태그 `v0.1.0`의 클론에서 2026년 10월 27일에 실행했습니다.

```bash
cd code/go
go run ./cmd/custody-kit validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94
```

다음을 출력했습니다(종료 코드 0).

```json
{
  "valid": true,
  "kind": "account",
  "format": "hex",
  "checksum": "eip55",
  "bech32": "qor1npvwllfr9dqr8erajqqr6s0vxnk2ak55am9g2c",
  "hex": "0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
}
```

검증자 주소는 `--allow-validator`로 허용하지 않으면 거부됩니다.

```bash
go run ./cmd/custody-kit validate qorvaloper19rl4cm2hmr8afy4kldpxz3fka4jguq0a5ws5he
```

`"valid": false`와 함께 `"error": "KIND_NOT_ALLOWED"`, 상세 내용 `a validator address is not accepted here`를 출력하고 종료 코드 1로 끝났습니다. 같은 체크아웃에서 Go 테스트 스위트(`go test ./...`)도 통과했습니다.

**2. 브로드캐스트 전에 서명된 트랜잭션을 디코딩하고 검증.**

```bash
go run ./cmd/custody-kit decode <tx hex or base64>
go run ./cmd/custody-kit verify <tx> --chain-id qorechain-diana --account-number <n> \
  --pubkey <33-byte hex> --pq-pubkey <2592-byte hex>
```

eth-native 계정에는 `--eth`를 추가하세요. 계정 번호는 `GET /cosmos/auth/v1beta1/account_info/{address}`에서, 등록된 ML-DSA-87 키는 `GET /qorechain/pqc/v1/account/{address}`에서 읽습니다.

TypeScript에서의 동일한 작업은 키트의 예제 명령줄(`code/ts/src/cli.ts`)에서 가져왔습니다.

```ts
import { decodeTx, fromHex, verifyTx } from "./index.js";

console.log(JSON.stringify(decodeTx(txBytes), null, 2)); // messages, memo, fee, signers, pqcLayers, txHash

const r = verifyTx({
  txBytes,
  chainId: "qorechain-diana",
  accountNumber: BigInt(accountNumber),
  classicalPublicKey: fromHex(secp256k1PubKeyHex),
  classicalKeyType: "secp256k1", // or "eth_secp256k1" for eth-native accounts
  pqPublicKey: fromHex(registeredMlDsa87KeyHex),
});
// r.valid, r.classical, r.signerKey ("match" | "absent" | "mismatch"), r.pq
```

**3. 입금 스캔(테스트넷에서 읽기).**

```bash
go run ./cmd/custody-kit deposits qor1... --from-height 8976000 --to-height 8976400
```

2026년 10월 27일에 공개 테스트 주소에 대해 테스트넷 높이 8976000~8983000 범위로 실행했을 때 빈 목록을 반환했으며, 아무것도 받은 적 없는 주소에서는 예상된 결과입니다.

TypeScript(`code/ts/src/cli.ts`에서):

```ts
import { DEFAULT_TESTNET_REST, buildDepositQuery, extractDeposits, getJson } from "./index.js";

const restUrl = process.env.QORE_REST ?? DEFAULT_TESTNET_REST;
const path = buildDepositQuery({ address, minHeight: BigInt(from), maxHeight: BigInt(to) });
const body = await getJson(restUrl, path);
const responses = (body.tx_responses ?? []) as Record<string, unknown>[];
const entries = responses.flatMap((r) => extractDeposits(r, address));
// each entry: txhash, height, msgIndex, messageType, sender, amount, denom, memo, creditable, reason
```

Go(`code/go/cmd/custody-kit/main.go`에서):

```go
opts := custodykit.DepositQueryOptions{Address: addr, MinHeight: &from, MaxHeight: &to}
path, err := custodykit.BuildDepositQuery(opts)
// GET restURL + path, then for each tx_response:
r, err := custodykit.ParseTxResponse(raw)
entries, err := custodykit.ExtractDeposits(r, addr, "") // "" = uqor
```

**4. 다른 언어.**

```bash
# Python (from code/python/src)
python -m qorechain_custody_kit validate qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h
python -m qorechain_custody_kit deposits <address> --from-height H --to-height H

# Rust
cargo run --example custody-kit -- validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94

# Java
mvn -q compile exec:java -Dexec.args="validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
```

**5. 벡터와 라이브 검사 실행.**

```bash
scripts/fetch-qoresign-vectors.sh            # optional: also check the QoreSign hybrid vectors
cd code/go && go test ./...                  # vectors
QORE_LIVE_TEST=1 go test -run Live ./...     # live reads against testnet
```

각 언어에 동등한 명령(`pnpm test`, `pytest`, `cargo test`, `mvn test`)이 있습니다. 라이브 검사에는 자금이 필요하지 않습니다. 이 페이지를 작성할 때 실행한 것은 Go의 `validate` 및 `deposits` 명령과 Go 테스트 스위트뿐이며, 다른 언어는 저장소를 기준으로 설명한 것입니다.

### 주요 함수와 명령 {#api}

| TypeScript | Go | Python 및 Rust | Java | 기능 |
|---|---|---|---|---|
| `validateAddress(input, { allow, requireEip55 })` | `ValidateAddress(input, ValidateAddressOptions{Allow, RequireEIP55})` | `validate_address` | `Addresses.validateAddress` | `{ valid, kind, format, checksum, bech32, hex }` 또는 `{ valid: false, error }`를 반환합니다. |
| `decodeTx(txBytes)`, `decodeMessage(typeUrl, value)` | `DecodeTx`, `DecodeMessage` | `decode_tx`, `decode_message` | `TxDecoder.decodeTx`, `decodeMessage` | 메시지, 메모, 수수료, 서명자, ML-DSA-87 계층, 트랜잭션 해시. |
| `verifyTx({ txBytes, chainId, accountNumber, classicalPublicKey, classicalKeyType, pqPublicKey, signBytesVersion })` | `VerifyTx(VerifyTxArgs{...})` | `verify_tx` | `TxVerifier.verifyTx` | `{ valid, classical, signerKey, pq }`를 반환합니다. 서명 바이트 버전은 v1, v2 또는 둘 중 아무거나입니다. |
| `buildDepositQuery({ address, minHeight, maxHeight, event, page, limit, orderBy })` | `BuildDepositQuery` | `build_deposit_query` | `Deposits.buildDepositQuery` | 수신 전송에 대한 REST 경로. `event`는 `transfer`(기본값) 또는 `coin_received`이며, `limit`은 1~100(기본값 50), 기본은 오름차순입니다. |
| `extractDeposits(txResponse, address, { denom })` | `ExtractDeposits(resp, address, denom)` | `extract_deposits` | `Deposits.extractDeposits` | `creditable`과 `reason`이 있는 입금 항목. |
| `depositEventQuery`, `percentEncode`, `getJson`, `toHex`, `fromHex` | `DepositEventQuery`, `PercentEncode`, `GetJSON`, `ToHex`, `FromHex`, `ParseTxResponse` | `deposit_event_query`, `get_json`, `from_hex` | `CustodyKit`, `Rest` | 헬퍼. |

상수 `FEE_COLLECTOR`, `MSG_SEND`, `MSG_MULTI_SEND`, `MSG_ETHEREUM_TX`, `KNOWN_MESSAGES`, `PQC_HYBRID_TYPE_URL`, `DEFAULT_TESTNET_REST`도 함께 내보냅니다.

모든 언어의 예제 명령줄:

- `validate <address> [--allow-validator] [--require-eip55]`
- `decode <tx hex or base64>`
- `verify <tx> --chain-id ID --account-number N --pubkey HEX [--eth] [--pq-pubkey HEX]`
- `deposits <address> [--from-height H] [--to-height H] [--rest URL]`

모든 언어에서 동일한 오류 코드:

- 키트: `MALFORMED_TX`(바이트가 올바른 형식의 트랜잭션이 아님), `UNKNOWN_FIELD`(디코더가 모르는 필드이며 네트워크도 거부함), `INVALID_ARGUMENT`.
- `validateAddress`: [혁신](#innovations)에 나열된 열한 개의 코드.

수탁 기관이 가장 자주 마주치는 체인의 거부 사유를 코드스페이스와 코드로 나타냅니다(전체 표는 키트의 `docs/errors.md`에 있습니다).

| 코드스페이스 | 코드 |
|---|---|
| `sdk` | 3 시퀀스 불일치, 4 권한 없음, 5 잔액 부족, 11 가스 부족, 12 메모가 너무 큼, 13 수수료 부족, 19 이미 멤풀에 있음 |
| `pqc` | 20 하이브리드 서명 필요, 21 하이브리드 검증 실패, 7 키가 이미 등록됨, 26 EVM 윈도우 없음(또는 등록된 키 없음), 27 윈도우 소진 또는 범위 밖, 28 잘못된 윈도우 파라미터 |
| `stakingtier` | 13 스테이크가 잠겨 있음 |

코드스페이스와 코드를 함께 보고 분기하고, 원본 로그를 보관하세요.

## 접근 방법 {#how-to-access}

| | 메인넷 | 테스트넷 |
|---|---|---|
| 체인 ID | `qorechain-vladi` | `qorechain-diana` |
| EVM 체인 ID | 9801 | 9800 |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| 노드 릴리스 | v3.2.5 (2026년 10월 29일 적용) | v3.2.6 (v3.2.5 적용됨) |

- 단위는 `uqor`입니다(1 QOR = 10^6 uqor, EVM 레인에서는 1 uqor = 10^12 wei). 최소 가스 가격은 0.1 uqor, 언본딩 기간은 21일, 메모 제한은 256자입니다. 이 값들은 2026년 10월 27일에 두 네트워크에서 읽은 것이며 거버넌스로 바뀔 수 있으므로, 프로덕션에서는 체인에서 읽으세요.
- 입금에는 키도 등록도 필요하지 않습니다. 전송하려면 핫 주소마다 등록된 ML-DSA-87 키가 필요합니다.
- 프로덕션에서는 자체 풀 노드를 운영하세요. 공개 엔드포인트는 요청 속도가 제한되며 개발용입니다. 스크립트가 `403 Forbidden`을 받으면 명시적인 `User-Agent` 헤더를 설정하세요. [노드 운영](/developer-guide/running-a-node)과 [메인넷 연결](/getting-started/connecting-to-mainnet)을 참조하세요.
- 테스트넷은 각 노드 릴리스를 메인넷보다 먼저 받습니다. 가스 규칙은 날짜가 아니라 적용된 업그레이드를 확인해서 전환하세요(두 네트워크 모두 v3.2.5를 적용했습니다).
- 테스트넷의 테스트 토큰(`erc20:0x...` 형식의 뱅크 denom, IBC 토큰)은 메인넷에 존재하지 않습니다. 두 네트워크 모두에서 `uqor`를 반영하세요.
- 테스트넷 QOR은 QoreChain 대시보드 faucet에서 받으며 가치가 없습니다. [테스트넷 연결](/getting-started/connecting-to-testnet)을 참조하세요.

## 보안 참고 사항 {#security}

- 핫 주소의 두 키(secp256k1과 ML-DSA-87)는 모든 네이티브 레인 트랜잭션에 서명합니다. 같은 수탁 경계 안에서 같은 정족수와 감사 추적 아래 보관하세요.
- 32바이트 ML-DSA-87 시드(소프트웨어 키)를 백업하거나 HSM의 키 백업을 사용하세요. 키가 등록된 계정에는 클래식 경로가 없으므로, ML-DSA-87 키를 잃으면 그 계정은 더 이상 서명할 수 없습니다. 테스트넷에서 `verifyTx`로 복원을 시험하세요.
- HSM은 빈 컨텍스트로 서명 바이트에 대한 순수 ML-DSA-87 서명(PKCS #11 v3.2의 `CKM_ML_DSA`)을 지원해야 합니다. `HashML-DSA`는 허용되지 않습니다.
- 서명된 모든 트랜잭션에 대해 브로드캐스트 전에, 그것을 만들지 않은 프로세스에서 `decodeTx`와 `verifyTx`를 실행하세요.
- 교체에는 `MsgRotatePQCKey`를 사용합니다. 두 키가 모두 서명하고, 트랜잭션 자체의 계층은 현재 키를 사용하며, 이전 키의 재사용은 거부됩니다. secp256k1 키가 노출되었다면 두 키를 모두 새로 만든 새 주소로 자금을 옮기고 열려 있는 EVM 윈도우를 닫으세요.
- EVM 윈도우: `native_only` 또는 `allowed_targets`를 사용하고, 배치를 덮는 가장 작은 `max_value`와 `blocks`를 쓰며, 배치가 끝나면 윈도우를 닫으세요. `MsgSetWithdrawAddress`, `MsgRotatePQCKey`, `MsgOpenEVMWindow`, `MsgAuthorizeEVMDelegation`은 권한이 필요한 작업으로 취급하세요.
- `ethereum_tx` 이벤트가 실패를 보고하는 EVM 트랜잭션은, 네이티브 결과가 `code == 0`이더라도 절대 반영하지 마세요.
- 이것은 버전 0.1.0의 참조 코드입니다. 프로덕션에서 사용하기 전에 검토하세요. 취약점은 security@qore.network로 비공개 보고해 주세요. 잘못된 반영이나 의도하지 않은 서명으로 이어질 수 있는 문서 오류도 포함됩니다.

## 게시 위치 {#where-published}

2026년 10월 27일에 레지스트리와 대조해 확인했습니다.

| 레지스트리 | 패키지 | 버전 | 링크 |
|---|---|---|---|
| GitHub | `qorechain/qorechain-custody-kit` (다섯 개 언어 전부, 가이드 페이지, 벡터) | 릴리스 `v0.1.0`, 2026년 10월 27일 게시 | https://github.com/qorechain/qorechain-custody-kit |
| Go 모듈 프록시 | `github.com/qorechain/qorechain-custody-kit/code/go` (예제 코드, 가져올 수 있음) | v0.1.0 (태그 `code/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go |
| npm, PyPI, crates.io, Maven Central | 게시되지 않음: 키트는 복사하거나 벤더링하는 예제 코드 | 해당 없음 | 해당 없음 |

GitHub 릴리스에는 첨부 파일이 없으며, 릴리스는 저장소의 태그입니다. 키트가 기반으로 삼는 의존성은 모두 게시되어 있습니다. npm의 `@qorechain/qoresign`(최신 0.1.1, 키트는 0.1.0에 고정), PyPI의 `qorechain-qoresign`(0.1.1), crates.io의 `qorechain-qoresign`(최신 0.1.1, 키트는 0.1.0에 고정), `github.com/qorechain/qoresign/go`(v0.1.0 및 v0.1.1), Maven Central의 `io.github.qorechain:qoresign`(0.1.0 및 0.1.1)입니다.

라이선스 Apache-2.0. 유지 관리자: QoreChain Association.

## 제한 사항 및 알려진 문제 {#limits}

- 키트는 키를 보관하거나, 트랜잭션에 서명하거나, 브로드캐스트하거나, 임계값 또는 MPC 서명을 제공하지 않습니다. 서명은 QoreSign 또는 사용자의 HSM이 수행합니다. 현재 ML-DSA에는 표준화된 임계값 방식이 없습니다. 가이드는 임계값 secp256k1 키를 별도로 보관되는 ML-DSA-87 키와 결합하는 방법을 문서화합니다.
- 어떤 수탁 기관의 내부 프로세스에 대해서도 어떤 주장도 하지 않습니다. 체크리스트는 네트워크 요구 사항만 설명합니다.
- `validateAddress`는 20바이트 주소를 받습니다. 더 긴 모듈 및 컨트랙트 계정 주소는 입금 및 지급 주소로서 당연히 그래야 하듯 거부됩니다.
- `extractDeposits`는 `MsgSend`, `MsgMultiSend`, 성공한 `MsgEthereumTx`를 자동으로 반영합니다. 다른 메시지(보상 출금, 컨트랙트 호출, IBC 전송)는 반영되지 않고 검토를 위해 반환됩니다.
- `verifyTx`는 단일 서명자 트랜잭션을 검증합니다.
- SVM 레인은 트랜잭션에 열려 있지 않습니다. 그 위에 입금이나 출금 흐름을 만들지 마세요.
- 키트 자체의 코드는 0.1.0의 예제 코드입니다. 함수 이름과 시그니처는 버전 사이에 바뀔 수 있으며, Go 모듈 태그도 안정적인 API를 약속하지 않습니다.
- 이 페이지를 작성할 때 실행한 것은 Go 예제와 테스트 스위트뿐입니다. 다른 네 개 언어의 라이브 검사와 벡터 검사는 다시 실행하지 않았습니다.
- 저장소의 Python README에는 `qorechain-qoresign` 0.1.1이 PyPI에 올라올 때까지 `verify_tx`가 import 오류를 일으킨다는 안내가 아직 남아 있을 수 있습니다. 해당 버전은 게시되었으므로 그 안내는 최신이 아닙니다.
- 키트의 가이드는 2026년 10월 27일에 읽은 파라미터(가스 수치, 스테이킹 티어 값)를 인용합니다. 프로덕션에서는 체인에서 읽으세요.

## 관련 페이지 {#related}

- [QoreSign](/qoresign/overview): 하이브리드 서명, 검증, 키 등록 메시지, 가스 헬퍼 `suggestGasLimit`과 `simulateTx`.
- [QoreChain SDK](/sdk/overview): `decodeTxError`를 이용한 오류 디코딩, EVM 윈도우 컴포저, 거부 분류기.
- [포스트 퀀텀 서명](/developer-guide/post-quantum-signing): 하이브리드 서명, 서명 바이트 v2, 키 등록.
- [거래소 및 통합 담당자 가이드](/developer-guide/exchange-integration): 네이티브, EVM, SVM 경로 중에서 고르기.
- [EVM 프리컴파일](/developer-guide/evm-precompiles)과 EVM 레인.
- [스테이킹과 위임](/user-guide/staking-and-delegation).
- [노드 운영](/developer-guide/running-a-node)과 [메인넷 연결](/getting-started/connecting-to-mainnet).
- [QoreChain MCP 서버](/developer-tools/mcp): 빠른 확인을 위한 `get_pq_status`와 `simulate_tx`.
- [QoreScan](/developer-tools/qorescan): 노드, 엔드포인트, 계정의 암호화 자산을 목록화.
