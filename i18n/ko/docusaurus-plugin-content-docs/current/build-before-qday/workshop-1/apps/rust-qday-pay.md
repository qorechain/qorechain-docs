---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: Rust 앱, qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# Rust 앱: qday-pay

**qday-pay**는 QoreChain 테스트넷(`qorechain-diana`, EVM 체인 ID 9800)에서 QOR를 **하이브리드 서명**으로 결제하는 작은 Rust 명령줄 도구입니다. 같은 트랜잭션에 기존 방식의 secp256k1 서명과 양자 내성 ML-DSA-87(FIPS 204) 서명이 함께 담깁니다. 전송 후에는 체인에서 트랜잭션을 다시 읽어, 체인이 두 서명을 모두 검증했는지 보여 줍니다.

## 보여 주는 것 {#what-it-shows}

- 추가 도구 없이 공개된 크레이트만으로 Rust에서 하는 **하이브리드 ML-DSA-87 + secp256k1 서명**.
- **온체인에서 검증되는 하이브리드 서명 트랜잭션 하나**: 체인이 `status=verified`인 `pqc_hybrid_verify` 이벤트를 발생시키고, 트랜잭션 본문에는 64바이트 secp256k1 서명 옆에 4627바이트 ML-DSA-87 서명이 담깁니다.
- **복구 문구 하나로 키 두 개**: ML-DSA-87 키는 기존 키와 같은 니모닉에서 파생되며 여러분의 주소에 바인딩됩니다.

중요한 이유: 미래의 양자 컴퓨터는 secp256k1 서명을 깰 것으로 예상됩니다. ML-DSA-87 서명도 함께 담긴 트랜잭션은 계속 보호됩니다. [양자 안전 트랜잭션](/sdk/guides/quantum-safe)을 참고하세요.

## 단계별 안내 {#run}

### 1. 도구 설치

Git과, `cargo`가 포함된 최신 안정 버전의 Rust 툴체인이 필요합니다.

- Git: https://git-scm.com/downloads
- Rust: https://rustup.rs 에서 rustup으로 설치

버전을 확인합니다.

```bash
git --version
rustc --version
cargo --version
```

### 2. 코드 받기

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

### 3. 빌드

```bash
cargo build --release
```

첫 빌드는 의존성을 내려받아 컴파일하므로 몇 분이 걸립니다. 마지막에 `Finished` `release` 프로필이 출력됩니다. 인자 없이 도구를 실행하면 명령 목록이 출력됩니다.

```bash
cargo run --release
```

### 4. 일회용 테스트넷 계정 만들기

```bash
cargo run --release -- new
```

`new`는 복구 문구를 만들어 권한 0600의 키 파일에 저장합니다. 문구는 출력되지 않습니다. 키 파일의 기본 위치는 `~/.config/qday/rust.env`이며, 다른 경로를 쓰려면 `QDAY_KEY_FILE`을 설정하세요. 기존 파일은 덮어쓰지 않습니다. 이 계정은 테스트넷 전용입니다. 여기서는 실제 지갑을 절대 사용하지 마시고, 키 파일을 공유하거나 커밋하지 마시고, 메인넷에서 재사용하지 마세요. 이 명령은 `qor1...` 주소를 출력합니다.

### 5. 포셋에서 테스트넷 QOR 받기

1. https://dashboard.qorechain.io/faucet 을 열고 로그인합니다.
2. `qor1...` 주소를 붙여 넣고 받습니다. 한 번 받으면 100 QOR가 지급되며, 계정당, 주소당 24시간에 한 번 가능합니다.

등록에는 수수료가 들기 때문에, 다음 단계 전에 계정이 체인에 존재해야 합니다.

### 6. 계정 확인

```bash
cargo run --release -- status                  # address, balance, PQC key, latest block
```

### 7. ML-DSA-87 키 등록

```bash
cargo run --release -- register                # register the ML-DSA-87 key (once, idempotent)
```

등록 트랜잭션은 기존 방식으로 서명합니다. 키는 자신의 등록에 공동 서명할 수 없기 때문입니다. 다시 실행해도 아무 일도 일어나지 않습니다.

### 8. 하이브리드 서명 결제 보내기

```bash
cargo run --release -- send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

`qor1...`을 아무 테스트넷 주소(예: 두 번째 일회용 계정)로 바꾸세요. 금액의 단위는 QOR입니다. `send`는 금액을 결제한 다음 검증을 실행합니다.

### 9. 아무 트랜잭션이나 검증

```bash
cargo run --release -- verify <TX_HASH>        # the verification report for any transaction
```

이 도구는 테스트넷 전용입니다. SDK의 `testnet` 프리셋을 사용하며 다른 체인 ID에 대해서는 실행을 거부합니다.

## 계정 {#account}

이 계정은 코인 타입 118(`m/44'/118'/0'/0/0`)의 QoreChain Native secp256k1 계정이며 `qor1...` 주소를 가집니다. ML-DSA-87 키는 같은 니모닉에서 SDK의 표준 주소 바인딩 규칙으로 파생됩니다. 니모닉 하나로 두 키를 모두 복원할 수 있습니다.

```rust
let classical = derive_native_account(mnemonic, 0)?;
let pqc = try_derive_pqc_canonical(&classical.address, mnemonic)?;
```

## 핵심 SDK 코드 {#code}

다음은 `send` 명령의 핵심 부분을 줄인 것입니다.

```rust
// The payment: a plain bank MsgSend.
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);
// Which hybrid sign-bytes form this network verifies (asked once, cached).
let version = SignBytesResolver::new()
    .resolve(SignBytesMode::Auto, &net.chain_id, Some(&net.rest_url)).await?;

let mut params = BuildHybridTxParams {
    private_key: w.classical.private_key.clone(), // secp256k1 half
    public_key: w.classical.public_key.clone(),
    pqc_secret_key: w.pqc.secret_key.clone(),     // ML-DSA-87 half
    pqc_public_key: w.pqc.public_key.clone(),
    messages: vec![Message { type_url: send.type_url, value: send.value }],
    chain_id: net.chain_id.clone(),
    include_pqc_public_key: false, // key registered with `register`
    sign_bytes_version: Some(version),
    /* fee, account_number, sequence, memo, timeout_height */
};

let draft = build_hybrid_tx(params.clone())?;                    // sign a draft
params.fee = estimate_fee(&net.rest_url, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params.clone())?;                       // sign for real
let res = broadcast_and_wait(&net.rest_url, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

등록은 `PqcDx`의 `ensure_pqc_registered()` 호출 하나로 끝나며 여러 번 실행해도 결과가 같습니다. 등록된 키가 아직 없을 때만 소유 증명과 함께 `MsgRegisterPQCKeyV2`를 보내고, 계정에 다른 키가 있으면 실패합니다.

가스는 고정값이 아닙니다. 초안을 시뮬레이션하고, 한도는 시뮬레이션된 가스의 1.3배로 정하며, 가스당 0.15 uqor로 가격을 매깁니다(체인의 최저 가격은 0.1 uqor).

## "검증됨"을 판정하는 방법 {#verified}

`verify`는 공개 테스트넷 REST 엔드포인트에서 `GET /cosmos/tx/v1beta1/txs/{hash}`를 읽어 세 가지를 확인합니다.

- 트랜잭션이 성공했는지(`code 0`)
- 체인이 서명자에 대해 `status=verified`인 `pqc_hybrid_verify`를 발생시켰는지
- 본문에 4627바이트 ML-DSA-87 서명이 담긴 `/qorechain.pqc.v1.PQCHybridSignature` 확장이 있는지

## 확인할 결과 {#output}

`send`가 성공하면 금액과 수수료, 포함된 블록이 출력되고, 이어서 트랜잭션 성공, `pqc_hybrid_verify`가 `verified`, ML-DSA-87 서명이 4627바이트라는 것을 보여 주는 보고서가 나옵니다. 확인 중 하나라도 실패하면 도구는 상태 코드 2로 종료됩니다. 트랜잭션을 조회하려면 https://explore.qore.network 를 열어 **Testnet**으로 전환하고 해시를 검색하거나, `https://explore.qore.network/tx/<HASH>`를 여세요.

## 네트워크 엔드포인트 {#access}

| 항목 | 위치 |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| 익스플로러 | `https://explore.qore.network`(Testnet으로 전환) |
| 포셋 | https://dashboard.qorechain.io/faucet |

## 사용한 패키지 {#packages}

| 항목 | 버전 |
| --- | --- |
| `qorechain-sdk`(`qorechain`으로 import) | 0.13(0.13.0으로 해석됨) |
| `tokio` | 1 |
| `serde_json` | 1 |
| `base64` | 0.22 |
| `cosmrs` | 0.22 |
| `qday-pay`(이 앱, 미배포) | 0.1.0 |

모든 언어의 SDK 릴리스 표는 [SDK 설치](/sdk/install)를 참고하세요.

## 소스 코드 {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
