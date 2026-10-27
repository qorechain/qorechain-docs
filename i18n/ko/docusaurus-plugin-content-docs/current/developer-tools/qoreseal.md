---
slug: /developer-tools/qoreseal
title: QoreSeal
sidebar_label: QoreSeal
sidebar_position: 30
---

# QoreSeal (`qoreseal`)

QoreSeal은 ML-KEM-1024(FIPS 203)로 QoreChain 계정에 데이터를 암호화하는 오픈 소스 라이브러리입니다. 계정이 자신의 ML-KEM-1024 공개 키를 체인에 게시하면, 누구든 그 계정과 발신자가 추가한 다른 수신자들이 읽을 수 있는 페이로드를 암호화할 수 있습니다. 기밀 페이로드(메모, 청구서, 문서, 입찰)가 필요한 dApp 개발자, 열람 권한이 필요한 감사인, 비공개 그룹과 사이드체인 운영자를 위한 것입니다. 표준 프리미티브를 조합할 뿐 자체 프리미티브는 구현하지 않습니다. 버전 **0.1.0**, Apache-2.0, QoreChain Association이 관리합니다.

2026년 10월 27일 현재 상태: 암호화 자체는 네트워크도 계정도 없이 어디서나 오프라인으로 작동합니다. 체인에서 읽은 주소로 암호화하려면 KEM 키 레지스트리가 필요한데, 이는 **테스트넷**(`qorechain-diana`)에서 **라이브**이며 **메인넷(`qorechain-vladi`)에는 v3.2.5 업그레이드 이후** 적용됩니다. 날짜는 정해지지 않았습니다. 패키지는 Rust, Go, Python, Swift, Kotlin/JVM, Android용으로 게시되어 있습니다. TypeScript 패키지 `@qorechain/qoreseal`은 **출시 예정**이며 아직 npm에 없습니다. 이 구성은 1.0 이전에 외부 검토를 기다리는 초안입니다.

QoreSeal은 페이로드의 내용만 보호하며 그 외에는 아무것도 보호하지 않습니다. 주소, 트랜잭션 시점, 전송 금액, 엔벨로프 크기, 수신자 수는 체인에서 공개로 남습니다. 트랜잭션을 비공개로 만드는 방법이 아닙니다.

## 혁신 {#innovations}

- **하나의 엔벨로프, 수신자 1~1,024명.** 페이로드는 무작위 AES-256-GCM 데이터 키로 한 번 암호화되고, 데이터 키는 수신자마다 따로 래핑됩니다. 따라서 독자를 추가하는 데는 페이로드 사본이 아니라 약 1.6 KB가 듭니다.
- **기본은 하이브리드이며, 조용히 다운그레이드되지 않습니다.** `hybrid` 모드에서 각 수신자 항목은 ML-KEM-1024 캡슐화와 X25519 합의를 SHA3-256 결합기로 합치므로, 둘 중 하나만 유지되어도 데이터는 보호됩니다. `mlkem` 모드(ML-KEM-1024 단독)는 명시적으로 선택해야 하며, 라이브러리는 스스로 이 모드로 대체하지 않습니다.
- **컨텍스트 바인딩.** 모든 엔벨로프는 키 유도(정보값 `"qorechain-kem-v1|" + chainId + "|" + purpose`를 가진 HKDF-SHA-256)를 통해 체인 ID와 목적에, 그리고 선택적인 연관 데이터에 묶입니다. 한 목적으로 봉인된 엔벨로프는 다른 목적으로는 열리지 않습니다.
- **체인에 게시되고 체인이 검사하는 키.** 계정은 트랜잭션의 하이브리드 서명으로 인증되는 `MsgRegisterKEMKey`로 ML-KEM-1024 키를 등록합니다. `validateMlkemPublicKey`는 체인이 등록 시 적용하는 것과 같은 검사를 적용합니다.
- **수신자 카드.** 레지스트리는 ML-KEM 키만 담고 그 밖에는 아무것도 담지 않습니다. 하이브리드 모드용 X25519 키는 계정이 [QoreSign](/qoresign/overview) 메시지 서명으로 서명하고 체인상의 ML-KEM 키에 묶은 카드에 실려 전달됩니다. 발신자는 체인의 두 키로 카드를 검증하므로 카드는 어떤 경로로든 올 수 있습니다. ML-KEM 부분은 항상 체인상의 키를 사용하기 때문에, 위조되거나 오래된 카드는 기껏해야 엔벨로프를 ML-KEM-1024 강도로 낮출 뿐입니다.
- **비공개 그룹을 위한 에포크 키.** `EpochKeyManager`는 구성원이 바뀔 때마다 새 에포크 키를 만들어 현재 구성원에게 봉인합니다. 제거된 구성원은 자신이 속했던 에포크의 키를 유지하며 이후 에포크는 읽을 수 없습니다.
- **커밋먼트가 있는 암호화된 배치.** 배치 코덱은 암호문 커밋먼트와 솔트가 적용된 평문 커밋먼트가 있는 암호화된 블롭을 만들며, [RDK](/rollups/overview)로 QoreChain에 앵커링할 준비가 되어 있습니다.
- **모든 언어에서 같은 바이트.** TypeScript와 Go는 네이티브 구현이고, Rust는 Swift, Kotlin, Python 아래의 코어입니다. 공유 테스트 벡터를 모든 언어에서 바이트 단위로 검사하며, 오류에는 안정적인 코드가 있습니다(예: `NOT_A_RECIPIENT`, `DECRYPTION_FAILED`, `CARD_INVALID`, `RECIPIENT_NEEDS_X25519`, `UNKNOWN_EPOCH`, `MALFORMED_ENVELOPE`).

## 사용 사례 {#use-cases}

1. **dApp이 사용자 간 메모나 메시지를 암호화합니다.** 채팅 또는 결제 dApp이 `sealToAddresses`로 각 메모를 수신자의 주소에 봉인하고, `qoreseal:` 텍스트를 메모, 컨트랙트 또는 자체 데이터베이스에 저장합니다. 수신자의 키만 이를 엽니다.
2. **감사인(열람) 키가 있는 청구서와 문서.** 기업이 청구서 번호를 연관 데이터로 하여, 구매자, 판매자, 감사인 키에 하나의 엔벨로프로 청구서를 봉인합니다. 감사인 키는 설정에 보관하는 평범한 QoreSeal 키 쌍이며, 분기마다 키 하나(새 인덱스로 `deriveSealKeys`)를 쓰면 기업은 감사인에게 검토 중인 기간만 넘길 수 있습니다.
3. **봉인 입찰과 커밋-리빌.** 경매가 `purpose: "bid:<auction id>"`와 입찰자 주소를 연관 데이터로 하여 입찰을 경매 키에 봉인하고, 엔벨로프를 저장한 뒤, 마감 후에 엽니다.
4. **컨소시엄 또는 비공개 사이드체인.** 비공개 롤업의 운영자가 `EpochKeyManager`로 구성원과 에포크 키를 공유하고, `PrivateBatchCodec`으로 모든 배치를 암호화하며, 암호화된 블롭과 그 커밋먼트를 RDK로 QoreChain에 앵커링합니다.
5. **"암호화된 데이터 수신"을 제공하는 지갑.** 지갑이 계정 니모닉(인덱스 0)에서 QoreSeal 키를 유도하고, 하이브리드 서명된 `MsgRegisterKEMKey`로 ML-KEM 키를 게시하며, 서명용 수신자 카드를 일반 텍스트로 보여 줍니다.
6. **복구 또는 에스크로 수신자.** 커스터디 또는 컴플라이언스 팀이 모든 엔벨로프에 오프라인 복구 키를 추가하여, 사용자의 키를 잃어도 데이터가 살아남게 합니다.
7. **Python 또는 Go 백엔드.** 서비스가 다른 모든 언어와 바이트 호환되는 방식으로 보고서나 내보내기를 계정 목록에 봉인합니다.

## 작동 방식 {#how-it-works}

프리미티브(QoreSeal은 그중 어느 것도 구현하지 않습니다): ML-KEM-1024(FIPS 203. 캡슐화 키 1,568바이트, 역캡슐화 키 3,168바이트, 암호문 1,568바이트), X25519(RFC 7748), SHA3-256 결합기, HKDF-SHA-256, AES-256-GCM(96비트 논스, 128비트 태그).

**봉인**, 요약하면 다음과 같습니다.

1. 무작위 16바이트 솔트와 무작위 32바이트 데이터 키를 뽑습니다.
2. 수신자마다 수신자의 키로 ML-KEM-1024 캡슐화를 수행합니다. 하이브리드 모드에서는 수신자의 X25519 키와의 임시 X25519 합의도 수행하고, 두 비밀을 SHA3-256으로 결합합니다. 키 암호화 키는 HKDF-SHA-256(솔트, 정보값 `"qorechain-kem-v1|" + chainId + "|" + purpose`)로 유도되어 AES-256-GCM으로 데이터 키를 래핑합니다.
3. 페이로드는 데이터 키로 한 번 암호화되며, 전체 헤더와 선택적 연관 데이터를 인증합니다.

**엔벨로프 레이아웃:** 매직 `QSEL`, 버전 1, 모드, 알고리즘 바이트, 플래그, 솔트, 수신자 수, 수신자별 항목 하나(힌트, ML-KEM 암호문, 하이브리드 모드의 X25519 임시 키, 래핑된 데이터 키), 논스, 암호문. 크기: 하이브리드 모드에서는 `56 + 1,664 x recipients + plaintext` 바이트, `mlkem` 모드에서는 `56 + 1,632 x recipients + plaintext`. 명세 기준: 수신자 1명과 평문 1 KB는 2,744바이트(하이브리드), 수신자 10명과 1 KB는 17,720바이트입니다.

체인 ID와 목적은 엔벨로프에 기록되지 않습니다. 수신자가 같은 값을 전달해야 합니다. 잘못된 체인 ID, 목적, 연관 데이터이거나 바이트가 조금이라도 바뀌면 `DECRYPTION_FAILED`가 나옵니다.

**힌트.** 솔트가 적용된 힌트는 수신자가 자신의 항목을 빠르게 찾게 해 줍니다. `anonymous: true`이면 힌트가 0으로 채워지고 수신자는 모든 항목을 시도합니다.

**텍스트 형식.** `envelopeToText`와 `envelopeFromText`는 `"qoreseal:" + base64url`과 상호 변환합니다.

**체인에 있는 것**

- 모듈 `qorechain.pqc.v1`의 KEM 키 레지스트리: `sender`, `algorithm_id = 2`(ML-KEM-1024), `public_key`를 가진 `MsgRegisterKEMKey`, 그리고 `sender`를 가진 `MsgRemoveKEMKey`. 타입 URL: `/qorechain.pqc.v1.MsgRegisterKEMKey`와 `/qorechain.pqc.v1.MsgRemoveKEMKey`.
- 쿼리: `GET /qorechain/pqc/v1/kem/{address}`(`qor1` 또는 `0x` 형식 허용). `found`를 반환하고, 찾으면 `address`, `algorithm_id`, `algorithm_name`, `public_key`, `registered_height`를 가진 `key`도 반환합니다.
- 등록은 트랜잭션의 하이브리드 서명으로 인증됩니다. 발신자는 이미 등록된 ML-DSA-87 키를 가지고 있어야 하며, 트랜잭션은 QoreSign `signHybrid`로 서명됩니다. 계정당 키 하나이며, 다시 등록하면 교체됩니다.
- 거부(코드스페이스 `pqc`): 250 이 체인에서 아직 레지스트리가 활성화되지 않음, 251 잘못된 KEM 공개 키, 252 이 계정에 게시된 KEM 키 없음, 253 이 키는 이미 이 계정에 게시되어 있음, 254 KEM 키를 게시하려면 등록된 포스트 퀀텀 서명 키가 필요함. `describeKemRegistryError`가 이를 설명합니다.
- 엔벨로프 자체는 애플리케이션이 두는 곳(메모, 컨트랙트, 파일, API)으로 갑니다. 체인은 비밀 키를 절대 보지 않습니다.

**수신자 카드.** 대부분 ML-DSA-87 서명으로 이루어진 약 6.7 KB의 JSON입니다. 계정은 고정 텍스트(`QoreSeal recipient card v1`, 체인 ID, 주소, ML-KEM 키의 SHA3-256, X25519 키, 발급 시각)에 QoreSign 메시지 서명으로 서명합니다. 새 ML-KEM 키를 등록하면 이전 키로 만든 모든 카드가 폐기됩니다.

**비공개 그룹.** 에포크 키 페이로드(`QSEK`, 에포크 번호, 32바이트 키)는 평범한 엔벨로프에 담겨 현재 구성원에게 봉인됩니다. 배치 블롭(`QSBT`, 에포크, 배치 인덱스, 롤업 ID 같은 컨텍스트, 논스, AES-256-GCM 암호문)은 `83 + context length + data length` 바이트입니다. 커밋먼트: `ciphertextCommitment = SHA3-256(blob)`, 그리고 `plaintextCommitment = SHA3-256("qorechain-qoreseal-batch-v1" || commitSalt || data)`이며, 외부인이 엔트로피가 낮은 내용을 추측하지 못하도록 솔트가 적용됩니다.

명세는 저장소의 `spec/qoreseal-v1.md`입니다(상태: 초안, 검토 진행 중). 공유 벡터는 `vectors/qoreseal-v1.json`입니다.

## 사용 방법 {#how-to-use}

### 설치 {#install}

| 언어 | 설치 | 최소 플랫폼 |
|---|---|---|
| Rust | `cargo add qorechain-qoreseal` (라이브러리 이름 `qoreseal`) | stable Rust |
| Go | `go get github.com/qorechain/qoreseal/go@v0.1.0` | Go 1.25 |
| Python | `pip install qorechain-qoreseal` (import `qoreseal`) | Python 3.9 이상. macOS 11+(arm64, x86_64)와 Linux manylinux2014(x86_64, aarch64)용 휠. 아직 Windows 휠 없음 |
| Swift | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`, 제품 `QoreSeal` | iOS 16, macOS 13 |
| Kotlin / JVM | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Java 17. Kotlin 2.3 이상 컴파일러(Kotlin 2.1에서는 컴파일 실패) |
| Android | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | API 24. R8 keep 규칙 포함. Kotlin 2.3 이상 컴파일러 |
| TypeScript | **출시 예정**: `@qorechain/qoreseal`은 아직 npm에 없으므로 설치 명령이 없습니다 | |

TypeScript 소스, 예제, 네트워크 헬퍼는 저장소에 있으며 `pnpm install && pnpm build` 후 거기에서 실행됩니다. npm 패키지가 게시되기 전까지는 저장소를 TypeScript 사용 방법으로 보고, 위의 패키지 이름을 기대하세요.

### 퀵스타트 1: 오프라인에서 봉인하고 열기 (Python) {#quickstart-python}

2026년 10월 27일에 게시된 0.1.0 휠로 실행했습니다. 네트워크도 계정도 필요 없습니다. 수신자 두 명, 연관 데이터, 그리고 다른 목적으로는 엔벨로프가 열리지 않는지 확인합니다.

```python
import qoreseal as qs

alice = qs.generate_seal_keys()
bob = qs.generate_seal_keys()

envelope = qs.seal_envelope(
    "qorechain-diana", "invoice",
    [qs.recipient_of(alice), qs.recipient_of(bob)],
    b"amount due: 120 QOR",
    aad=b"invoice-42",
)
text = qs.envelope_to_text(envelope)  # "qoreseal:..."

plaintext = qs.open_envelope("qorechain-diana", "invoice", envelope, bob, aad=b"invoice-42")
assert plaintext == b"amount due: 120 QOR"
print(len(envelope), text[:20], plaintext)

# A different purpose never opens the envelope.
try:
    qs.open_envelope("qorechain-diana", "chat", envelope, bob, aad=b"invoice-42")
except qs.QoreSealError.Failure as e:
    print("other purpose:", e.code)
```

출력은 `3403 qoreseal:UVNFTAEBAgE b'amount due: 120 QOR'`, 그다음 `other purpose: DECRYPTION_FAILED`였습니다. 길이는 56 + 2 x 1,664 + 19 = 3,403바이트입니다.

### 퀵스타트 2: 오프라인에서 봉인하고 열기 (Go) {#quickstart-go}

Go 모듈 프록시의 v0.1.0으로 실행했습니다.

```go
package main

import (
	"fmt"

	qoreseal "github.com/qorechain/qoreseal/go"
)

func main() {
	alice, _ := qoreseal.GenerateSealKeys()
	auditor, _ := qoreseal.GenerateSealKeys()

	envelope, err := qoreseal.Seal(qoreseal.SealArgs{
		ChainID:    "qorechain-diana",
		Purpose:    "invoice",
		Recipients: []qoreseal.SealRecipient{qoreseal.RecipientOf(alice), qoreseal.RecipientOf(auditor)},
		Plaintext:  []byte("120 QOR due on 2026-11-30"),
		AAD:        []byte("invoice-42"),
	})
	if err != nil {
		panic(err)
	}
	plaintext, err := qoreseal.Open(qoreseal.OpenArgs{
		ChainID: "qorechain-diana", Purpose: "invoice", Envelope: envelope, Keys: auditor, AAD: []byte("invoice-42"),
	})
	fmt.Println(len(envelope), string(plaintext), err)
}
```

출력은 `3409 120 QOR due on 2026-11-30 <nil>`이었습니다.

Rust, Swift, Kotlin은 같은 호출(`seal`, `open`, `generate_seal_keys` 등, 각 언어의 표기법에 맞춰)을 사용합니다. 이들의 예제는 이 페이지를 위해 실행하지 않았습니다.

### 퀵스타트 3: 에포크가 있는 비공개 그룹 (Python, 오프라인) {#quickstart-group}

저장소 예제 `examples/private-rollup`을 따릅니다. 앨리스와 밥은 에포크 1에서 시작하고, 캐럴이 합류하며(에포크 2), 밥이 제거됩니다(에포크 3). 밥은 에포크 1은 읽을 수 있지만 에포크 3은 읽을 수 없습니다.

```python
import qoreseal as qs

chain_id, rollup_id = "qorechain-diana", "demo-private-rollup"
purpose = f"epoch-key:{rollup_id}"
alice, bob, carol = qs.generate_seal_keys(), qs.generate_seal_keys(), qs.generate_seal_keys()

mgr = qs.EpochKeyManager(chain_id, purpose, [
    qs.GroupMember(id="alice", recipient=qs.recipient_of(alice)),
    qs.GroupMember(id="bob", recipient=qs.recipient_of(bob)),
])
bob_keys = [qs.open_epoch_key(chain_id, purpose, mgr.distribution(), bob)]  # epoch 1

b1 = mgr.seal_batch(rollup_id, 1, b'{"txs":["alice pays bob 5"]}')
mgr.add_member("carol", qs.recipient_of(carol))   # epoch 2
mgr.remove_member("bob")                          # epoch 3
b3 = mgr.seal_batch(rollup_id, 3, b'{"txs":["alice pays carol 1"]}')

print(qs.open_batch(b1.blob, bob_keys).data)      # bob read epoch 1
try:
    qs.open_batch(b3.blob, bob_keys)              # bob was removed before epoch 3
except qs.QoreSealError.Failure as e:
    print("bob, epoch 3:", e.code)
print(b3.ciphertext_commitment.hex(), b3.plaintext_commitment.hex())
```

출력은 밥의 에포크 1 배치, 그다음 `bob, epoch 3: UNKNOWN_EPOCH`, 그다음 두 커밋먼트(실행할 때마다 무작위)였습니다.

봉인된 배치를 [RDK](/rollups/overview)로 앵커링하려면, 암호화된 블롭이 네이티브 데이터 가용성 블롭이 되고 그 SHA-256이 배치 `data_hash`가 됩니다(TypeScript, 저장소 가이드에서 가져옴. 이 페이지를 위해 실행하지 않음).

```ts
import { buildDaBlob, submitBatchMsg } from "@qorechain/rdk";

const codec = new PrivateBatchCodec("my-rollup", mgr);
const sealed = codec.seal(batchIndex, batchBytes);
const blob = buildDaBlob({ data: sealed.blob, maxBlobSize: params.maxDaBlobSize });
const msg = submitBatchMsg({ sequencer, rollupId: "my-rollup", batchIndex, stateRoot, txCount, dataHash: blob.dataHash });
```

롤업 배치가 게시되는 방식은 [데이터 가용성](/rollups/data-availability)을 참고하세요.

### 테스트넷에서 주소로 암호화하기 {#encrypt-to-address}

직접 제어하는 `qorechain-diana` 계정이 필요하며, 약간의 테스트넷 QOR와 등록된 ML-DSA-87 키가 있어야 합니다(QoreSign 예제 `register-and-send`가 하나를 등록합니다). 테스트넷 니모닉을 사용하고, 메인넷 니모닉이나 자금이 있는 공개 테스트 문구는 절대 사용하지 마세요. 이 흐름은 저장소 가이드를 바탕으로 설명한 것이며 이 페이지를 위해 실행하지는 않았습니다.

1. 계정 니모닉에서 키를 유도합니다: `deriveSealKeys({ mnemonic })`(인덱스 0). 니모닉이 곧 백업입니다.
2. ML-KEM-1024 키를 게시합니다: `buildRegisterKemKeyMessage({ sender: address, mlkemPublicKey: sealKeys.mlkemPublicKey })`를 트랜잭션 본문에 넣고, QoreSign `signHybrid`로 서명하고, `simulateTx`로 시뮬레이션한 뒤 `submitWithSignBytesFallback`으로 보냅니다. 거부되면 `describeKemRegistryError(res.codespace, res.code)`가 설명해 줍니다.
3. 확인합니다: `GET https://api-testnet.qore.host/qorechain/pqc/v1/kem/<address>`. 키를 게시하지 않은 계정에는 `{"found":false,"key":null}`로 응답합니다.
4. 수신자 카드에 서명합니다: `signRecipientCard({ chainId: "qorechain-diana", address, keys: sealKeys, classicalKey, pqKey })`, 그리고 발신자가 가져올 수 있는 곳에 게시합니다.
5. 발신자 쪽: `sealToAddresses({ rest: "https://api-testnet.qore.host", chainId: "qorechain-diana", purpose: "note", recipients: [{ address, card }], plaintext })`. 카드가 없으면 `mode: "mlkem"`을 전달합니다.
6. 수신자 쪽: `open({ chainId: "qorechain-diana", purpose: "note", envelope, keys: sealKeys })`.

완전히 실행 가능한 흐름은 저장소 예제 `examples/register-and-encrypt`입니다. 해당 네트워크가 v3.2.5를 적용하기 전까지 이 예제는 메인넷을 거부합니다. Go는 `network.NewClient(rest).SealToAddresses(ctx, network.SealToArgs{...})`로 같은 발신자 쪽을 제공합니다. Rust, Swift, Kotlin, Python은 오프라인입니다. `/qorechain/pqc/v1/kem/{address}`와 `/qorechain/pqc/v1/account/{address}`를 직접 읽고, 카드를 검증한(`verify_recipient_card`) 다음 봉인하세요.

### 주요 API {#api}

이름은 TypeScript 형식입니다. Go는 Go 표기법(`Seal`, `Open`, `NewEpochKeyManager`)을 쓰고, Rust와 Python은 snake_case를 씁니다. Python, Swift, Kotlin에서 `seal`과 `open`은 `seal_envelope` / `sealEnvelope`와 `open_envelope` / `openEnvelope`입니다.

| 이름 | 기능 | 위치 |
|---|---|---|
| `generateSealKeys` | 무작위 키 쌍(ML-KEM-1024 + X25519) | 전체 |
| `deriveSealKeys` | BIP-39 니모닉, 선택적 패스프레이즈와 인덱스에서 만든 키 쌍 | 전체 |
| `sealKeysFromSeed`, `sealSeedFromMnemonic` | 32바이트 시드에서 복원, 니모닉에서 시드 생성 | 전체 |
| `recipientOf` | 키 쌍에서 공개 수신자 생성 | 전체 |
| `validateMlkemPublicKey`, `validateX25519PublicKey` | 입력 검사(체인이 같은 ML-KEM 검사를 적용) | 전체 |
| `seal` | 1~1,024명의 수신자에게 암호화(`mode`, `aad`, `anonymous`) | 전체 |
| `open` | 키 쌍으로 복호화 | 전체 |
| `parseEnvelope`, `envelopeSize` | 엔벨로프 검사, 크기 계산 | 전체 |
| `envelopeToText`, `envelopeFromText` | `qoreseal:` 텍스트 형식 | 전체 |
| `signRecipientCard`, `verifyRecipientCard` | 수신자 카드 생성과 검사 | 전체 |
| `recipientCardText`, `recipientCardFields`, `assembleRecipientCard` | 다른 곳(예: 지갑 UI)에서 서명할 때 카드 구성 | 전체 |
| `buildRegisterKemKeyMessage`, `buildRemoveKemKeyMessage` | 레지스트리 메시지, QoreSign으로 하이브리드 서명 필요 | 전체 |
| `describeKemRegistryError` | 코드스페이스 `pqc` 코드 250~254 설명 | 전체 |
| `EpochKeyManager` | 그룹용 에포크 키: `addMember`, `removeMember`, `rotate`, `distribution`, `exportKeys`, `keyFor`, `members`, `epoch` | 전체 |
| `sealEpochKey`, `openEpochKey` | 에포크 키 전송 또는 수신(예: 새 구성원을 위한 이력) | 전체 |
| `PrivateBatchCodec`, `sealBatch`, `openBatch`, `parseBatchHeader`, `batchSize` | 커밋먼트가 있는 암호화된 배치 | 전체 |
| `fetchKemKey`, `fetchMlkemPublicKey` | REST에서 계정의 ML-KEM 키 읽기 | TypeScript, Go network 패키지 |
| `resolveRecipient` | 체인상의 키와 카드를 검증하여 수신자로 변환 | TypeScript, Go network 패키지 |
| `sealToAddresses` | 주소로 계정에 봉인 | TypeScript, Go network 패키지 |

네트워크 헬퍼는 TypeScript에서는 `@qorechain/qoreseal/network`, Go에서는 `github.com/qorechain/qoreseal/go/network`입니다. 더 낮은 수준의 구성 요소도 내보냅니다(`mlkemEncapsulate`, `mlkemDecapsulate`, `x25519Agree`, `hybridSharedSecret`, `deriveKey`, `kdfInfo`, `recipientHint`). 테스트용으로 이름 붙은 함수(`sealWithEntropy`, `testing_*`)는 테스트 벡터를 재현하기 위한 것이며 실제 데이터에는 절대 사용해서는 안 됩니다.

Python 오류는 안정적인 `code`를 가진 `QoreSealError.Failure`를 발생시키고, Go 오류는 `qoreseal.IsCode`로 비교합니다.

## 접근 방법 {#how-to-access}

| | 메인넷 `qorechain-vladi` | 테스트넷 `qorechain-diana` |
|---|---|---|
| KEM 키 레지스트리 | v3.2.5 업그레이드 이후(아직 적용되지 않음, 날짜 없음) | 라이브 |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` (체인 ID 9801) | `https://evm-testnet.qore.host` (체인 ID 9800) |

2026년 10월 27일에 테스트넷 레지스트리 쿼리는 키가 없는 계정에 `{"found":false,"key":null}`로 응답했고, 메인넷에서 같은 쿼리는 "Not Implemented"로 응답했습니다.

- 오프라인 봉인과 열기(직접 전달하는 감사인 키, 비공개 그룹, 배치 포함)에는 네트워크도 계정도 필요하지 않습니다.
- 주소로 암호화하려면 수신자가 ML-KEM-1024 키를 레지스트리에 게시했어야 하며, 하이브리드 모드에서는 수신자 카드도 필요합니다.
- 키를 게시하려면 테스트넷 QOR(메인넷에서는 업그레이드 이후의 QOR)이 있는 계정, 등록된 ML-DSA-87 키, 그리고 트랜잭션에 하이브리드 서명하는 QoreSign이 필요합니다. 수수료 하한은 가스당 0.1 uqor입니다. 테스트넷 QOR은 [Faucet](/dashboard/faucet)에서 받으세요.
- 메인넷이 v3.2.5를 적용하기 전까지는 메인넷에서 레지스트리 쿼리를 사용할 수 없고 등록은 거부됩니다(코드 250).

## 게시 위치 {#where-published}

2026년 10월 27일에 각 레지스트리에서 확인했습니다.

| 레지스트리 | 패키지 | 버전 | 링크 |
|---|---|---|---|
| crates.io | `qorechain-qoreseal` | 0.1.0 | [crates.io/crates/qorechain-qoreseal](https://crates.io/crates/qorechain-qoreseal) |
| Go 모듈 프록시 | `github.com/qorechain/qoreseal/go` | v0.1.0 (태그 `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoreseal/go) |
| PyPI | `qorechain-qoreseal` | 0.1.0 (macOS arm64 및 x86_64, Linux x86_64 및 aarch64용 휠, 그리고 소스) | [pypi.org/project/qorechain-qoreseal](https://pypi.org/project/qorechain-qoreseal/) |
| Swift Package Manager | `github.com/qorechain/qoreseal`의 `QoreSeal` | 0.1.0 (GitHub 릴리스의 바이너리 `QoreSealFFI.xcframework.zip`) | [release v0.1.0](https://github.com/qorechain/qoreseal/releases/tag/v0.1.0) |
| Maven Central | `io.github.qorechain:qoreseal` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) |
| Maven Central | `io.github.qorechain:qoreseal-android` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) |
| npm | `@qorechain/qoreseal` | 아직 게시되지 않음 (출시 예정) | |

두 Maven 아티팩트 중 하나를 사용하는 프로젝트에는 Kotlin 2.3 이상 컴파일러가 필요합니다. Kotlin/JVM 아티팩트는 macOS(arm64, x86_64), Linux(x86_64, arm64), Windows(x86_64)용 네이티브 라이브러리를 번들하며, Android 아티팩트는 arm64-v8a, armeabi-v7a, x86_64를 다룹니다.

소스: [github.com/qorechain/qoreseal](https://github.com/qorechain/qoreseal) (릴리스 v0.1.0). 라이선스 Apache-2.0.

## 한계와 알려진 문제 {#limits}

- **보호되는 것은 페이로드의 내용입니다.** 발신자와 수신자 주소, 뱅크 전송 금액, 트랜잭션 시점, 엔벨로프 크기, 수신자 수는 체인에서 공개로 남습니다.
- **비공개 트랜잭션이 아닙니다.** QoreSeal은 누가 누구와 거래하는지, 얼마를 거래하는지 숨기지 않습니다.
- **영지식 증명이 없습니다.** 암호화된 데이터에 대해 아무것도 증명하지 않습니다. 비공개 사이드체인에서 그룹 밖의 검증자는 배치 안에서 무슨 일이 일어나는지 검사할 수 없습니다.
- **엔벨로프는 서명되지 않습니다.** 누구나 주소로 암호화할 수 있으며, 다중 수신자 엔벨로프의 수신자는 누구든 다른 수신자들을 위한 다른 엔벨로프를 만들 수 있습니다. 발신자를 인증해야 한다면 내용이나 엔벨로프에 서명하세요(QoreSign `signMessage`).
- **모든 수신자가 페이로드 전체를 읽습니다.** 수신자별 가림 처리는 없으며, 독자가 다르면 별도의 엔벨로프를 봉인하세요.
- **힌트는 익명성이 아닙니다.** 후보의 공개 키(체인에 있음)를 아는 사람은 누구나 그 키가 수신자인지 시험해 볼 수 있습니다. `anonymous: true`는 힌트를 0으로 채우며, 그러면 수신자가 모든 항목을 시도합니다.
- **키를 잃으면 데이터를 잃습니다.** 체인에서의 복구는 없습니다. 시드나 니모닉을 잃으면 그 키에 봉인된 모든 것을 잃습니다.
- **키를 제거하거나 교체해도 아무것도 지워지거나 다시 암호화되지 않습니다.** 이전 키에 봉인된 데이터는 그 키를 가진 사람이 계속 읽을 수 있으므로, 이전 시드나 인덱스를 보관하세요.
- **제거된 그룹 구성원**은 자신이 속했던 에포크의 키를 유지합니다. 새 구성원은 이전 키가 그들에게 봉인되지 않는 한 합류한 에포크부터 읽습니다.
- **체인 ID와 목적은 엔벨로프에 없습니다.** 수신자가 이를 알아야 합니다.
- **메인넷 레지스트리:** 메인넷이 v3.2.5를 적용하기 전까지 사용할 수 없습니다.
- **1.0 이전, 구성은 외부 검토 대기 중.** 마이너 버전에서 API가 바뀔 수 있습니다. 의존하기 전에 명세를 읽으세요.
- **아직 npm 패키지가 없고** Windows용 Python 휠도 아직 없습니다.

## 보안 참고 사항 {#security}

- 비밀 키는 QoreSeal을 실행하는 기기나 서버를 절대 떠나지 않습니다. 체인은 ML-KEM-1024 공개 키만 저장하고, 카드는 X25519 공개 키를 담습니다.
- 계정 니모닉, 전용 니모닉 또는 32바이트 시드(`keys.seed`)를 저장 시 암호화하여 백업하세요. ML-KEM 비밀 키만 따로 내보내지 마세요. 시드나 니모닉을 내보내세요.
- 교체: 다음 인덱스로 이동하고, 새 ML-KEM 키를 등록하고, 새 카드에 서명합니다. 이전 카드는 자동으로 검증되지 않게 됩니다.
- 사용자의 키를 잃어도 살아남아야 하는 데이터에는 복구 수신자(오프라인 키)를 추가하세요. 추가된 모든 것을 읽으므로 감사인 키처럼 취급하세요.
- 그룹의 경우 `exportKeys()`에는 모든 에포크 키가 들어 있습니다. 이 내보내기를 운영자 자신의 키와 오프라인 복구 키에 봉인하고, 시퀀서 머신에는 두지 마세요. 에포크 키를 일정에 따라 교체하세요.
- `mlkem` 모드는 명시적으로 선택해야 하며, 하이브리드는 조용히 저하되지 않습니다.
- 프리미티브는 [`qorechain-pqc`](/developer-tools/pqc-library) 바인딩과 검증된 라이브러리(TypeScript는 noble, RustCrypto 크레이트, Go 표준 라이브러리)에서 오며, 계정 서명은 [QoreSign](/qoresign/overview)에서 옵니다.
- 취약점은 security@qore.network로 비공개로 신고하세요. 온체인 메타데이터가 공개인 것은 설계에 따른 것이며 취약점이 아니라 문서화 주제입니다.

## 관련 페이지 {#related}

- [QoreSign](/qoresign/overview): 등록 트랜잭션의 하이브리드 서명, 그리고 수신자 카드와 서명된 엔벨로프의 바탕이 되는 메시지 서명.
- [RDK 개요](/rollups/overview)와 [데이터 가용성](/rollups/data-availability): 비공개 사이드체인의 암호화된 배치 앵커링.
- [PQC 라이브러리](/developer-tools/pqc-library): QoreSeal 아래의 ML-KEM-1024 바인딩.
- [포스트 양자 보안](/architecture/post-quantum-security)과 [포스트 양자 서명](/developer-guide/post-quantum-signing): 체인에서 계정과 키가 작동하는 방식.
- [개발자 패키지 개요](/developer-tools/overview).
