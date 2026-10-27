---
slug: /developer-tools/pq-light-client
title: PQ 라이트 클라이언트
sidebar_label: PQ 라이트 클라이언트
sidebar_position: 31
---

# PQ 라이트 클라이언트 (`qorechain-pq-light-client`)

`qorechain-pq-light-client`는 ML-DSA-87(FIPS 204)로 서명된 체크포인트를 위한 초안 사양과 참조 검증기입니다. 제안된 설계에서 검증자는 각 에포크가 끝날 때 별도의 ML-DSA-87 체크포인트 키로 짧은 체크포인트에 서명하고, 라이트 클라이언트는 그 서명을 검증하는 것만으로 체크포인트 체인을 따라갑니다. 프로토콜 연구자, 릴레이어 및 브리지 개발자, 그리고 설계를 검토하고 이에 맞춰 테스트하려는 다른 체인의 팀을 위한 것입니다. 버전 **0.1.0**, Apache-2.0, QoreChain Association이 유지 관리합니다.

**체인은 이 체크포인트를 지원하지 않으며, 예정된 일정도 없습니다.** QoreChain은 메인넷(`qorechain-vladi`)과 테스트넷(`qorechain-diana`) 어디에서도 이 패키지가 검증하는 체크포인트를 생성하지 않습니다. 이를 지원하는 체인 버전은 없으며 업그레이드나 날짜도 계획되어 있지 않습니다. 검증자 합의 키는 현재 ed25519이며 포스트 퀀텀이 아닙니다. 이 패키지는 실제 네트워크를 따라갈 수 없고, 시뮬레이션된 검증자 집합과 공유 테스트 벡터에 대해 실행됩니다. 이것이 QoreChain의 어떤 경로, 브리지, IBC 채널도 포스트 퀀텀으로 만들지 않습니다.

## 혁신 {#innovations}

- **블록별 서명 대신 체크포인트.** 검증자는 에포크마다 하나의 체크포인트(체인 id, 에포크, 높이, 시간, 헤더 해시, 앱 해시, 서명 집합의 해시, 다음 집합의 해시)에 서명합니다. 서명은 일반 트랜잭션에 실려 전달되므로 블록 생성이 서명을 기다리지 않으며, 데이터 양은 모든 블록에 서명하는 경우보다 훨씬 적게 유지됩니다. 사양(12절)에 근거가 설명되어 있습니다.
- **소유 증명이 있는 별도의 체크포인트 키.** 각 검증자는 합의 키 및 모든 계정 키와 분리된 ML-DSA-87 체크포인트 키를 등록하며, `"qorechain-pqlc-key-pop-v1|" || chain_id || operator address || consensus address || public key`에 대한 소유 증명을 함께 제출합니다.
- **나가는 집합에 의한 집합 인계.** 체크포인트는 마지막으로 신뢰한 체크포인트가 지정한 집합의 파워 중 엄격히 3분의 2를 넘게 보유한 검증자들이 서명했을 때 수락되므로, 검증자 집합 변경은 항상 나가는 집합이 서명합니다. 정확히 3분의 2는 정족수가 아니며, 구성원이 아닌 이의 서명은 건너뛰어지는 대신 체크포인트를 무효로 만듭니다.
- **객체당 하나의 인코딩.** 체크포인트, 검증자 집합, 서명된 체크포인트에는 정규 인코딩이 있고, 디코더는 각 객체에 대해 정확히 하나의 인코딩만 받아들입니다. 릴레이어는 정규 바이트를 그대로 전달합니다.
- **고정된 검사 순서.** `verifyCheckpoint`는 지정된 순서로 검사를 실행하므로, TypeScript, Rust, Go는 같은 입력에 대해 같은 오류 코드를 반환합니다.
- **오작동 증거.** 한 에포크에 대해 각각 정족수를 가진 서로 다른 두 체크포인트는 오작동입니다. `detectMisbehaviour`는 정규 순서의 두 체크포인트, 이중 서명자와 그들의 파워를 반환합니다.
- **세 언어, 하나의 벡터 세트.** 공유 벡터(`vectors/pq-light-client-v1.json`)는 결정론적 시뮬레이터에서 나오며, 검증자 4명과 21명의 체크포인트 체인, 집합 교체, 검증기가 생성할 수 있는 모든 거부, 충돌하는 체크포인트, 디코더 케이스를 다룹니다. Go, Rust, TypeScript가 모두 통과하므로, 네 번째 구현도 바이트 단위로 일치함을 증명할 수 있습니다.

## 사용 사례 {#use-cases}

1. **릴레이어 개발자가 포스트 퀀텀 업데이트 경로를 프로토타이핑합니다.** Rust 릴레이어는 네트워크당 하나의 신뢰 상태를 유지하고, 서명된 각 체크포인트를 디코딩하고 검증하며, 같은 바이트를 목적지로 전달하고, `CONFLICTING_CHECKPOINT`에서 멈춥니다. 현재는 벡터 또는 직접 만든 시뮬레이션 체인에 대해 실행되며, 저장소의 릴레이어 가이드가 루프를 보여줍니다.
2. **IBC 및 브리지 팀이 설계를 평가합니다.** 사양 14절은 체크포인트를 IBC 라이트 클라이언트 유형(클라이언트 상태, 합의 상태, 오작동, 체크포인트 높이의 멤버십 증명)에 매핑합니다. 팀은 온체인에 아무것도 존재하기 전에 매핑과 그 트레이드오프를 검토할 수 있습니다. 이는 설계 노트이며, 이에 대한 코드는 없습니다.
3. **EVM 체인 또는 Solana의 팀이 검증기 설계를 비교합니다.** 15절은 온체인 ML-DSA-87 검증, 검증의 STARK 증명, 증명자 집합을 비교하며, 어떤 선택이 포스트 퀀텀 속성을 유지하고 어떤 선택이 이를 포기하는지 포함합니다. 이것도 설계 노트일 뿐입니다. 참고로 QoreChain 자체 EVM에는 ML-DSA 검증 프리컴파일(`pqcVerify`, 0x0A01)이 있으며 테스트넷에서만 활성화되어 있습니다. [EVM 프리컴파일](/developer-guide/evm-precompiles)을 참조하세요.
4. **보안 검토자와 연구자가 규칙을 확인합니다.** 검사 순서, 정족수 규칙, 집합 인계, 신뢰 기간, 오작동 증거는 명세되어 있으며 세 언어로 테스트할 수 있습니다.
5. **경로에 대해 말하는 팀이 주장을 올바르게 표현합니다.** 저장소의 입장 페이지는 경로를 언제 포스트 퀀텀이라고 부를 수 있는지 정의합니다([제한 사항](#limits) 참조).
6. **다른 언어의 구현자.** 벡터를 통해 새 구현이 참조 구현과 일치함을 증명할 수 있습니다.

## 작동 방식 {#how-it-works}

이 섹션의 모든 내용은 제안된 설계이며, 모두 예정되지 않은 체인 지원을 필요로 합니다.

1. 각 검증자는 소유 증명과 함께 ML-DSA-87 체크포인트 키를 등록합니다(위 참조).
2. 각 에포크가 끝날 때 검증자들이 체크포인트에 서명합니다: 체인 id, 에포크(엄격히 증가), 높이, 시간, 헤더 해시, 앱 해시, 이 체크포인트에 서명하는 집합의 해시, 다음 체크포인트에 서명할 집합의 해시.
3. 라이트 클라이언트는 마지막으로 신뢰한 체크포인트가 지정한 집합의 파워 중 3분의 2를 넘는 서명이 있는 체크포인트를 수락합니다.
4. 한 에포크에 대해 각각 정족수를 가진 서로 다른 두 체크포인트는 오작동이며, 증거는 이중 서명자를 지목합니다.

블록별 합의는 변경되지 않습니다. 에포크 안의 높이는 다음 체크포인트까지 고전적인 상태로 남으며, 포스트 퀀텀 보장이 필요한 클라이언트는 체크포인트 높이를 사용하고 최대 한 에포크의 지연을 감수합니다.

**형식**(모든 정수는 빅엔디언, 버전 바이트 `0x01`):

| 객체 | 레이아웃 | 크기 |
|---|---|---|
| 체크포인트 | 버전, 체인 id 길이와 바이트, 에포크, 높이, 시간, 헤더 해시, 앱 해시, 검증자 집합 해시, 다음 검증자 집합 해시 | `154 + len(chain_id)` 바이트(`qorechain-vladi`는 169) |
| 검증자 집합 | 버전, 개수(1~256), 이어서 검증자별로: 20바이트 주소, 8바이트 파워, 2,592바이트 ML-DSA-87 키, 주소순 정렬 | `3 + 2,620 x validators` 바이트 |
| 서명된 체크포인트 | 버전, 체크포인트, 서명 개수, 서명자별로 20바이트 주소와 4,627바이트 서명(주소순 정렬), 다음 집합 플래그, 집합이 바뀔 때 다음 집합 | `qorechain-vladi`의 경우 `173 + 4,647 x signers` 바이트, 다음 집합이 있으면 그만큼 추가 |

**서명과 해시.** ML-DSA-87, FIPS 204 순수 모드, 빈 컨텍스트, `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)`에 대해. 결정론적 서명과 헤지드 서명 모두 유효합니다. 해시는 32바이트 출력의 SHAKE-256이며, 검증자 집합 해시는 접두사 `qorechain-pqlc-valset-v1|`를 사용합니다.

**검증 순서**(`verifyCheckpoint`): 구조, 체인 id, 신뢰 만료, 시계 오차, 같은 에포크 처리(동일하면 `NOT_NEWER`; 다르면서 정족수가 있으면 `CONFLICTING_CHECKPOINT`), 에포크·높이·시간의 진행, 서명 집합이 신뢰하는 다음 집합과 같은지, 함께 전달된 다음 집합이 해시와 일치하는지, 정족수. 실패하면 신뢰 상태는 변경되지 않습니다. 서명 집합이 변하지 않는 동안에는 이후 에포크를 바로 수락할 수 있으며, 교체 후에는 교체 시점부터의 모든 체크포인트를 검증해야 합니다.

**신뢰.** 클라이언트는 다른 모든 지분 증명 라이트 클라이언트와 마찬가지로 프로토콜 밖에서 선택한 신뢰 루트에서 시작합니다. 신뢰 기간은 검증자가 여전히 처벌받을 수 있는 기간보다 짧아야 하며, 그 이후에는 클라이언트를 다시 초기화해야 합니다.

사양은 저장소의 `spec/pq-light-client-v1.md`입니다(상태: 초안, 검토에 열려 있음). 10절(체크포인트 키, 서명, 에포크, 온체인 페널티)은 검토를 위한 설계이며 약속이 아닙니다.

## 사용 방법 {#how-to-use}

### 설치 {#install}

| 언어 | 설치 | 최소 플랫폼 |
|---|---|---|
| TypeScript | `npm install @qorechain/pq-light-client` | Node.js 20.19 이상 및 브라우저. `@qorechain/pqc` 0.2.3에 의존 |
| Rust | `cargo add qorechain-pq-light-client` (라이브러리 `qorechain_pq_light_client`) | stable Rust; `qorechain-pqc` 0.2.3에 의존; `unsafe` 없음, I/O 없음 |
| Go | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` (패키지 `pqlightclient`) | Go 1.25; `github.com/qorechain/qorechain-pqc/go` v0.2.3에 의존 |

PyPI 패키지는 없으며 계획도 없습니다.

### 퀵스타트 (오프라인, TypeScript) {#quickstart}

QoreChain 네트워크에는 아무것도 접속하지 않습니다. 스크립트는 공유 벡터의 시뮬레이션된 21 검증자 체크포인트 체인(체인 id `qorechain-sim-21`, 에포크 2의 집합 교체 포함)을 따라간 뒤, 실시간 소스를 사용할 수 없음을 보여줍니다. 벡터의 키는 공개 테스트 키입니다.

```bash
mkdir pqlc && cd pqlc && npm init -y && npm pkg set type=module
npm install @qorechain/pq-light-client
curl -sLO https://raw.githubusercontent.com/qorechain/qorechain-pq-light-client/v0.1.0/vectors/pq-light-client-v1.json
```

```js
// follow.mjs: a TypeScript port of the repository's Rust relayer example.
import { readFileSync } from "node:fs";
import {
  PqLightClientError,
  decodeSignedCheckpoint,
  decodeValidatorSet,
  fetchCheckpoint,
  newTrustedState,
  verifyCheckpoint,
} from "@qorechain/pq-light-client";

const v = JSON.parse(readFileSync("pq-light-client-v1.json", "utf8"));
const hex = (s) => Uint8Array.from(Buffer.from(s, "hex"));

const root = decodeSignedCheckpoint(hex(v.signedCheckpoints["c21-e0-root"].encoded));
const set = decodeValidatorSet(hex(v.validatorSets.C21.encoded));
let state = newTrustedState({
  checkpoint: root.checkpoint,
  signatures: root.signatures,
  validatorSet: set,
  nextValidatorSet: set,
  trustingPeriod: 1_209_600n, // 14 days
  maxClockDrift: 10n,
});

for (const id of ["c21-e1", "c21-e2-rotate", "c21-e3"]) {
  const signed = decodeSignedCheckpoint(hex(v.signedCheckpoints[id].encoded));
  state = verifyCheckpoint(state, signed, signed.checkpoint.time + 5n);
  console.log(`trusted epoch ${state.checkpoint.epoch} at height ${state.checkpoint.height}`);
}

try {
  await fetchCheckpoint("https://rpc.example.invalid", state.checkpoint.chainId, 4n);
} catch (e) {
  if (e instanceof PqLightClientError) console.log("live source:", e.code);
}
```

2026년 10월 27일에 게시된 npm 0.1.0 패키지와 태그 v0.1.0의 벡터에 대해 실행했을 때 `node follow.mjs`는 다음을 출력했습니다:

```
trusted epoch 1 at height 11000
trusted epoch 2 at height 12000
trusted epoch 3 at height 13000
live source: REQUIRES_CHAIN_SUPPORT
```

벡터 파일은 약 2.4 MB입니다. Rust 원본은 저장소의 `rust/examples/relayer.rs`(`cargo run --example relayer`)이며, 이 페이지를 위해 실행하지 않았습니다.

TypeScript의 오류 처리(패키지 README에서):

```ts
try {
  trusted = verifyCheckpoint(trusted, decodeSignedCheckpoint(bytes), BigInt(Math.floor(Date.now() / 1000)));
} catch (e) {
  if (e instanceof PqLightClientError && e.code === "CONFLICTING_CHECKPOINT") {
    report(e.misbehaviour);
  }
}
```

Go에서의 동일한 코드:

```go
signed, err := pqlightclient.DecodeSignedCheckpoint(b)
if err != nil {
	return err
}
next, err := pqlightclient.VerifyCheckpoint(trusted, signed, uint64(time.Now().Unix()))
if errors.Is(err, pqlightclient.ErrConflictingCheckpoint) {
	// err.(*pqlightclient.Error).Misbehaviour holds the evidence
}
```

### 주요 API {#api}

API는 세 언어에서 동일합니다(TypeScript는 camelCase, Go는 PascalCase, Rust는 snake_case). 64비트 필드는 TypeScript에서 `bigint`입니다.

| 이름 | 기능 |
|---|---|
| `Checkpoint`, `ValidatorSet`, `SignedCheckpoint`, `TrustedState`, `Misbehaviour` | 데이터 유형 |
| `encodeCheckpoint`, `decodeCheckpoint` | 정규 체크포인트 인코딩; 엄격한 디코더 |
| `encodeValidatorSet`, `decodeValidatorSet`, `hashValidatorSet` | 검증자 집합 인코딩과 SHAKE-256 해시 |
| `encodeSignedCheckpoint`, `decodeSignedCheckpoint` | 릴레이어가 운반하는 바이트 |
| `encodeCheckpointSignBytes` | 서명 바이트, `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)` |
| `newTrustedState` | 신뢰 루트에서 신뢰 상태로(두 집합이 체크포인트에 있는 값으로 해시되는지 확인하며, 서명은 검증하지 않음) |
| `verifyCheckpoint(trusted, signed, now)` | 전체 검증; 새 신뢰 상태 또는 타입이 지정된 오류를 반환 |
| `detectMisbehaviour(set, a, b)` | 충돌하는 체크포인트에 대한 증거, 없으면 아무것도 반환하지 않음 |
| `signCheckpoint` | ML-DSA-87 비밀 키로 체크포인트에 서명(시뮬레이터와 테스트용) |
| `CheckpointSource`, `fetchCheckpoint`, `chainCheckpointSource`(TypeScript) 또는 `ChainCheckpointSource`(Rust, Go) | 향후 노드 API를 위한 인터페이스; 현재는 항상 `REQUIRES_CHAIN_SUPPORT`로 실패하며 요청을 보내지 않음 |
| `PqLightClientError`(TypeScript), `ErrInsufficientPower` 등이 있는 `*Error`(Go, `errors.Is` 사용), `code()`가 있는 `Error`(Rust) | 안정적인 코드를 가진 타입이 지정된 오류 |

세 언어가 공유하는 오류 코드와 릴레이어가 해야 할 일(릴레이어 가이드에서):

| 오류 | 조치 |
|---|---|
| `MALFORMED` | 바이트를 버림; 소스에 결함이 있음 |
| `CHAIN_ID_MISMATCH` | 구성 오류 |
| `TRUST_EXPIRED` | 중단; 새 신뢰 루트에서 다시 초기화 |
| `FUTURE_CHECKPOINT` | 로컬 시계를 확인; 나중에 다시 시도 |
| `NOT_NEWER` | 새로운 것이 없음; 대기 |
| `SET_MISMATCH` | 집합 교체가 있는 체크포인트가 누락됨; 사이의 에포크를 가져옴 |
| `UNKNOWN_VALIDATOR`, `BAD_SIGNATURE` | 체크포인트를 버림 |
| `INSUFFICIENT_POWER` | 더 많은 서명을 대기 |
| `CONFLICTING_CHECKPOINT` | 릴레이를 중단하고 증거를 보고 |
| `REQUIRES_CHAIN_SUPPORT` | 현재는 예상된 결과 |

## 접근 방법 {#how-to-access}

- **메인넷 `qorechain-vladi`와 테스트넷 `qorechain-diana`:** 체크포인트가 생성되지 않으므로 검증기는 어느 네트워크도 따라갈 수 없습니다. 이를 지원하는 체인 버전은 없으며 예정된 것도 없습니다.
- 네트워크의 현재 상태: 검증자 합의 키는 ed25519이고, 투표 확장은 꺼져 있으며, IBC는 표준 07 라이트 클라이언트 유형을 사용합니다.
- **패키지를 실행하려면** 언어 런타임 외에는 아무것도 필요 없습니다. 계정도, 키도, 엔드포인트도, 비용도 없습니다. 벡터는 공개 테스트 키와 체인 id `qorechain-sim` 및 `qorechain-sim-21`을 사용합니다.
- 참고용일 뿐입니다(이 패키지는 사용하지 않음): REST `https://api.qore.host`와 `https://api-testnet.qore.host`, RPC `https://rpc.qore.host`와 `https://rpc-testnet.qore.host`.

## 게시 위치 {#where-published}

2026년 10월 27일에 각 레지스트리에서 확인했습니다.

| 레지스트리 | 패키지 | 버전 | 링크 |
|---|---|---|---|
| npm | `@qorechain/pq-light-client` | 0.1.0 (`latest`) | [npmjs.com](https://www.npmjs.com/package/@qorechain/pq-light-client) |
| crates.io | `qorechain-pq-light-client` | 0.1.0 | [crates.io](https://crates.io/crates/qorechain-pq-light-client) |
| Go 모듈 프록시 | `github.com/qorechain/qorechain-pq-light-client/go` | v0.1.0 (태그 `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) |

소스: [github.com/qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client) (릴리스 v0.1.0, 소스 코드, 바이너리 없음). 라이선스 Apache-2.0.

## 제한 사항 및 알려진 문제 {#limits}

- **QoreChain, 어떤 IBC 채널, 브리지, 릴레이어도 포스트 퀀텀으로 만들지 않습니다.** 검증자 합의 키는 현재 포스트 퀀텀이 아니며, 이를 바꾸는 업그레이드는 예정되어 있지 않습니다.
- **실제 네트워크를 따라갈 수 없습니다.** `fetchCheckpoint`는 항상 `REQUIRES_CHAIN_SUPPORT`로 실패합니다. 시뮬레이션된 검증자 집합과 공유 벡터에서 동작합니다.
- **사양은 초안이며 검토에 열려 있습니다.** 그 안의 어떤 것도 약속이 아닙니다.
- **코드가 없는 설계 노트:** IBC 클라이언트 유형(14절)과 EVM 및 Solana 검증기(15절).
- **에포크 안의 높이는 고전적인 상태로 남습니다.** 체크포인트가 있어도 포스트 퀀텀 검증은 체크포인트 높이에 적용됩니다.
- **포스트 퀀텀 경로라고 부를 수 있는 것.** 양쪽 끝이 서로 상대편의 포스트 퀀텀 서명 상태를 양방향으로 검증하고 고전적인 단계가 없을 때 경로를 포스트 퀀텀이라고 부를 수 있습니다: 어느 쪽에도 고전 라이트 클라이언트가 없고, 페어링 기반 SNARK 래퍼가 없으며, 고전 증명자 위원회가 없어야 합니다. 포스트 퀀텀 계정 서명만으로는 경로가 포스트 퀀텀이 되지 않습니다. QoreChain 계정은 ML-DSA-87과 secp256k1로 서명합니다. 이를 포스트 퀀텀 경로가 아니라 "포스트 퀀텀 계정 서명"으로 설명하세요.
- **신뢰 루트는 주관적입니다.** 프로토콜은 잘못된 신뢰 루트에서 시작하는 클라이언트를 보호할 수 없습니다.
- **1.0 이전.** 마이너 버전에서 API가 바뀔 수 있습니다.

저장소의 입장 페이지가 제안하는 표현:

| 상황 | 표현 |
|---|---|
| 계정이 ML-DSA-87로 서명 | "post-quantum account signatures" |
| 한쪽 끝은 포스트 퀀텀 체크포인트를 검증하고 다른 쪽은 그렇지 않음 | "post-quantum verification of QoreChain state on chain X; the return path is classical" |
| 양쪽 끝이 포스트 퀀텀 서명 상태를 검증하며 고전적인 단계가 없음 | "post-quantum route" |

양쪽 끝이 규칙을 충족할 때까지는 경로를 실제로 검증하는 것으로 설명하세요. 예를 들어 "secured by the counterparty's classical light client"입니다.

## 보안 참고 사항 {#security}

- 패키지는 키를 보관하지 않으며 I/O를 하지 않습니다. Rust에는 `unsafe` 코드가 없고, TypeScript와 Go에서 `fetchCheckpoint`는 요청을 보내지 않습니다.
- 디코더는 엄격합니다: 객체당 하나의 인코딩이며, 다른 서명 또는 키 길이는 거부됩니다. 릴레이어는 재인코딩이 아니라 정규 바이트를 그대로 전달해야 합니다.
- 집합 밖 검증자의 서명은 건너뛰어지는 대신 체크포인트를 무효로 만들며, 이는 모든 구현이 같은 결과를 내도록 유지합니다.
- 검증기의 시계를 동기화된 상태로 유지하세요: 시계가 빠르면 신뢰가 일찍 만료되고, 느리면 새 체크포인트가 `FUTURE_CHECKPOINT`로 거부됩니다.
- 설계는 각 체크포인트 집합의 파워 중 3분의 2를 넘게 보유한 검증자들이 자신의 노드가 커밋한 체크포인트 외에는 아무것에도 서명하지 않는다고 가정합니다.
- 제안된 서명 도메인(`qorechain-pqlc-checkpoint-v1|`, `qorechain-pqlc-key-pop-v1|`)은 제안일 뿐이며, 현재 온체인에 예약되어 있지 않습니다.
- 벡터의 키는 공개 테스트 키이므로 다른 용도로 절대 사용하지 마세요.
- 취약점은 security@qore.network로 비공개로 신고하세요.

## 관련 페이지 {#related}

- [PQC 라이브러리](/developer-tools/pqc-library): 검증기 아래에 있는 ML-DSA-87 및 SHAKE-256 바인딩.
- [QoreSign](/qoresign/overview): 계정 수준의 ML-DSA-87 서명으로, 검증자 체크포인트와는 다른 것입니다.
- [포스트 양자 보안](/architecture/post-quantum-security): 현재 체인의 포스트 퀀텀 모델.
- [브리지 아키텍처](/architecture/bridge-architecture) 및 [자산 브리징](/user-guide/bridging-assets): 현재 크로스체인 경로는 표준 고전 라이트 클라이언트를 사용합니다.
- [QoreSeal](/developer-tools/qoreseal): 2026년 10월 27일에 게시된 또 다른 0.1.0 포스트 퀀텀 키트.
- [개발자 패키지 개요](/developer-tools/overview).
