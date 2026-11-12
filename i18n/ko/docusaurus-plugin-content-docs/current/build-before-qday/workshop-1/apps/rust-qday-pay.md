---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: Rust 앱, qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# Rust 앱: qday-pay

**qday-pay**는 터미널에서 실행하는 작은 Rust 프로그램입니다. QoreChain 테스트넷 `qorechain-diana`에서 **하이브리드 서명**으로 테스트넷 QOR를 결제합니다. 하이브리드 서명이란 기존 방식의 secp256k1 서명에 양자 내성 ML-DSA-87 서명(NIST FIPS 204)을 더한 것입니다. 결제가 끝나면 체인에서 트랜잭션을 다시 읽어 와서, 두 서명이 모두 검사되었다는 체인 자체의 증거를 보여 줍니다.

**소요 시간:** 전체 약 15분입니다. 첫 빌드는 라이브러리를 내려받아 컴파일하므로 2~5분이 걸립니다. 그 이후에는 모든 명령이 몇 초 안에 실행됩니다.

## 보여 주는 것 {#what-it-shows}

- 게시된 크레이트 `qorechain-sdk`(버전 0.13, 코드에서는 `qorechain`으로 사용)를 이용한 **Rust의 하이브리드 서명**.
- 양자 내성 키의 **체인 1회 등록**.
- 모든 트랜잭션에 대한 **검증 보고서**: 64바이트 기존 방식 서명, 4,627바이트 ML-DSA-87 서명, 체인의 `pqc_hybrid_verify` 판정.

중요한 이유: 기존 방식 서명만으로는 미래의 양자 컴퓨터에 뚫릴 수 있다고 예상됩니다. 하이브리드 서명은 두 서명 중 하나만 안전하면 계속 안전합니다. [양자 안전 트랜잭션](/sdk/guides/quantum-safe)을 참고하세요.

## 단계별 안내 {#run}

자신의 터미널에서 작업합니다. 반드시 일회용 테스트넷 계정만 사용하세요. 테스트넷 QOR에는 가치가 없습니다. 여기서는 실제 지갑이나 실제 자금을 절대 사용하지 마세요.

:::note Windows
qday-pay는 키 파일에 Linux와 macOS의 파일 권한을 사용하므로, Windows에서는 **WSL**(Windows Subsystem for Linux) 안에서 실행합니다. WSL은 Windows 안에서 Linux 터미널을 제공합니다. 이후 모든 내용은 Linux 안내를 따릅니다.
:::

### 1. 시작 전에: 도구 설치 {#install}

세 가지 도구가 필요합니다. **Git**(코드 내려받기), **Rust**(프로그램 빌드), **C 컴파일러**(Rust가 프로그램을 링크할 때 필요)입니다. 이 앱에는 Java, Node.js, Python이 필요하지 않습니다.

**macOS**

| 도구 | 설치 방법 | 확인 방법 |
| --- | --- | --- |
| C 컴파일러와 Git | `xcode-select --install` (창이 열리면 Install 클릭) | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (Enter를 눌러 기본값 수락), 그런 다음 터미널을 닫았다가 다시 열기 | `rustc --version`과 `cargo --version` |

**Linux (Debian 또는 Ubuntu. 다른 배포판은 각자의 패키지 관리자를 사용)**

| 도구 | 설치 방법 | 확인 방법 |
| --- | --- | --- |
| Git과 C 컴파일러 | `sudo apt update && sudo apt install -y git build-essential curl` | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (Enter를 눌러 기본값 수락), 그런 다음 터미널을 닫았다가 다시 열기 | `rustc --version`과 `cargo --version` |

**Windows (WSL 이용)**

1. PowerShell을 관리자 권한으로 열고 `wsl --install`을 실행합니다. 요청하면 컴퓨터를 다시 시작하세요. Windows가 Ubuntu를 설치합니다. 시작 메뉴에서 **Ubuntu** 앱을 엽니다.
2. Ubuntu 터미널에서 위의 **Linux** 표를 따릅니다.
3. Windows용 Git(https://git-scm.com/download/win)은 필요하지 않습니다. 위의 Linux 명령으로 Git이 함께 설치되기 때문입니다.

Rust 1.74 이상이 필요합니다. `rustup` 명령은 최신 버전을 설치하므로 문제없습니다. 버전 확인 결과는 `rustc 1.80.0` 비슷하게, 또는 그보다 큰 숫자로 표시됩니다.

**표시되는 내용:** `git --version`, `rustc --version`, `cargo --version`이 각각 버전 번호를 출력합니다. 명령이 `command not found`라고 하면 터미널을 닫고 새로 열어 다시 시도하세요.

### 2. 시작 전에: 테스트넷 지갑과 파우셋 {#wallet}

이 앱은 5단계에서 자체 테스트넷 계정을 만들기 때문에, 실행하려고 지갑을 설치할 필요는 없습니다. 무료 테스트넷 QOR를 받을 방법만 있으면 됩니다. 파우셋은 주소로 무료 테스트넷 QOR를 보내 주는 웹사이트입니다.

QoreX 지갑에서 내 계정을 함께 보고 싶다면, 일회용 계정과 함께 **테스트넷의 QoreX**를 사용하세요.

- **QoreX 앱:** 설정을 열고 **Use testnet (developers)**를 켭니다.
- **QoreX 브라우저 확장 프로그램:** 잠금을 해제하고, 하단의 버전 번호를 7번 누른 다음 **Switch to testnet (diana)**를 선택합니다.

이 앱에는 이더리움 계정이 필요하지 않습니다. QoreChain Native 계정 유형(`qor1...` 주소)을 사용합니다.

**파우셋:** https://dashboard.qorechain.io/faucet. 로그인한 뒤 주소를 붙여 넣고 요청하세요. 파우셋은 **계정당 24시간에 100 QOR**를 지급합니다.

**알아 두세요:** 새 계정의 첫 번째 트랜잭션은 양자 내성 ML-DSA-87 키를 체인에 등록합니다. 한 번만 내는 약 0.09 QOR의 수수료가 듭니다. qday-pay가 7단계에서 이를 처리합니다.

**금액:** 여러분이 읽는 단위는 **QOR**입니다. 체인은 가장 작은 단위인 **uqor**로 계산합니다. 1 QOR = 1,000,000 uqor입니다. 금액은 QOR 단위로(예: `1`) 입력하면 프로그램이 알아서 변환합니다.

### 3. 코드 받기 {#get-the-code-step}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

**하는 일**

| 부분 | 의미 |
| --- | --- |
| `git clone <address>` | GitHub에서 예제 앱 전체 사본을 `build-before-qday`라는 새 폴더로 내려받습니다. |
| `cd <folder>` | 터미널을 Rust 앱 폴더로 이동합니다. 이후 명령은 모두 여기서 실행합니다. |

**표시되는 내용:** `Cloning into 'build-before-qday'...`가 나오고 프롬프트가 `04-rust-qday-pay` 폴더로 바뀝니다. `ls`를 실행해 확인하세요. `Cargo.toml`, `Cargo.lock`, `README.md`, `src`가 보입니다.

### 4. 프로그램 빌드 {#build}

```bash
cargo build --release
```

**하는 일:** `cargo`는 Rust의 빌드 도구입니다. 이 명령은 `Cargo.toml`에 나열된 라이브러리를 내려받고 프로그램을 파일 하나로 컴파일합니다.

| 부분 | 의미 |
| --- | --- |
| `build` | 프로그램을 컴파일합니다(아직 실행하지는 않습니다). |
| `--release` | 빠르게 최적화된 버전으로 빌드합니다. 생략하면 다른 폴더에 더 느린 디버그 버전이 만들어집니다. |

**소요 시간:** 처음에는 2~5분, 이후에는 몇 초입니다.

**표시되는 내용:** `Compiling ...` 줄이 많이 나온 뒤 `Finished release profile [optimized] target(s)`가 표시됩니다. 이제 프로그램은 `./target/release/qday-pay` 파일입니다.

실행되는지 확인합니다.

```bash
./target/release/qday-pay
```

**하는 일:** 명령 없이 프로그램을 실행합니다. 도움말을 출력할 뿐 아무것도 바꾸지 않습니다.

**표시되는 내용:**

```text
qday-pay: hybrid post-quantum payments on QoreChain testnet

  qday-pay new
  qday-pay status
  qday-pay register
  qday-pay send <qor1to> <amount_qor> [--memo text]
  qday-pay verify <tx_hash>
```

다섯 줄은 아래에서 사용할 다섯 가지 명령입니다. 이 페이지의 나머지 부분에서 `<command>`는 `./target/release/qday-pay <command>`를 뜻합니다.

### 5. 일회용 테스트넷 계정 만들기 {#new-account}

```bash
./target/release/qday-pay new
```

**하는 일:** 완전히 새로운 테스트넷 계정을 만듭니다. 비밀 복구 문구(니모닉)를 생성하여 **키 파일**에 저장합니다. 이 문구 하나에서 기존 방식 secp256k1 키와 양자 내성 ML-DSA-87 키, 두 가지 키가 모두 만들어집니다. 문구는 화면에 출력되지 않습니다.

| 부분 | 의미 |
| --- | --- |
| `new` | 계정과 키 파일을 만드는 명령입니다. 이미 있는 키 파일은 덮어쓰지 않으므로, 실수로 잔액이 있는 계정을 날릴 수 없습니다. |

**키 파일 위치:** `~/.config/qday/rust.env`. `~`는 홈 폴더입니다. 파일은 본인만 읽을 수 있습니다(모드 0600). `QDAY_KEY_FILE`을 설정하면 다른 위치를 쓸 수 있습니다. 예: `QDAY_KEY_FILE=$HOME/my-test-key.env ./target/release/qday-pay new`. 이렇게 했다면 이후 모든 명령 앞에도 같은 변수를 설정하세요.

:::warning 키 파일은 비공개로 유지하세요
키 파일은 계정의 열쇠입니다. 절대 공유하지 말고, 채팅이나 스크린샷에 붙여 넣지 말고, Git에 커밋하지 마세요. 이 계정은 워크숍에서만 사용하고 메인넷에서는 절대 쓰지 마세요. 끝나면 파일을 삭제하세요.
:::

**표시되는 내용:**

```text
  New testnet account (mnemonic saved, not shown)

  address      qor1...
  key file     /home/you/.config/qday/rust.env (0600)

  Next: fund it with testnet QOR, then `qday-pay status`.
```

`qor1...` 주소를 복사해 두세요.

### 6. 파우셋에서 계정에 자금 넣기 {#faucet}

1. https://dashboard.qorechain.io/faucet 을 열고 로그인합니다.
2. `qor1...` 주소를 붙여 넣고 요청합니다. 100 QOR를 받습니다.
3. 결제가 담긴 블록이 생성될 때까지 약 10초 기다립니다.

키를 등록하려면 계정이 먼저 체인에 존재해야 하며, 파우셋 결제가 바로 그 계정을 만들어 줍니다.

### 7. 계정 확인 {#status}

```bash
./target/release/qday-pay status
```

**하는 일:** 테스트넷에서 내 계정을 읽어 요약을 출력합니다. 아무것도 전송하지 않습니다.

**표시되는 내용:**

```text
  network      qorechain-diana (testnet)
  address      qor1...
  balance      100 QOR
  ML-DSA-87    NOT registered (run `qday-pay register`)
  block        123456
```

| 줄 | 의미 |
| --- | --- |
| `network` | 프로그램이 통신하는 체인입니다. 테스트넷 `qorechain-diana`에서만 동작하며 다른 네트워크는 거부합니다. |
| `balance` | 사용할 수 있는 QOR입니다. |
| `ML-DSA-87` | 양자 내성 키가 체인에 등록되어 있는지 여부입니다. |
| `block` | 최신 블록 높이입니다. 계속 올라갑니다. |

### 8. 양자 내성 키 등록 {#register}

```bash
./target/release/qday-pay register
```

**하는 일:** 내 ML-DSA-87 공개 키를 **소유 증명**(해당 비밀 키를 실제로 가지고 있다는 증명)과 함께 체인에 알리는 트랜잭션을 한 건 보냅니다. 체인이 키를 저장하며, 이제부터 내 양자 내성 서명을 검사할 수 있습니다. 한 번만 내는 약 0.09 QOR의 수수료가 듭니다. 다시 실행해도 안전합니다. 키가 이미 등록되어 있으면 아무 일도 하지 않습니다.

| 부분 | 의미 |
| --- | --- |
| `register` | ML-DSA-87 키를 한 번 등록하는 명령입니다. |

**표시되는 내용:**

```text
  ML-DSA-87    registered (MsgRegisterPQCKeyV2 + proof of possession)
  tx           <64-character transaction hash>
  block        123460
  gas          ... used / ... wanted
  address      qor1...
```

### 9. 하이브리드 서명 결제 보내기 {#send}

`qor1...`을 테스트넷 주소로 바꾸세요. 내 주소로 보내도 되고, 친구의 테스트넷 주소로 보내도 됩니다.

```bash
./target/release/qday-pay send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

**하는 일:** 결제를 만들고, 두 가지(secp256k1과 ML-DSA-87)로 서명하고, 가스 비용을 확인하고, 전송하고, 블록에 포함될 때까지 기다린 다음 10단계의 검증을 자동으로 실행합니다.

| 부분 | 의미 |
| --- | --- |
| `send` | 다른 주소로 QOR를 결제하는 명령입니다. |
| `qor1...` (첫 번째 값) | 받는 사람입니다. `qor1` 주소여야 하며, 아니면 프로그램이 `not a qor1 address`와 함께 중단됩니다. |
| `1` (두 번째 값) | QOR 단위의 금액입니다. `1`은 1 QOR, 즉 1,000,000 uqor입니다. `0.5` 같은 소수도 쓸 수 있습니다. |
| `--memo "text"` | 선택 사항입니다. 메모는 트랜잭션에 첨부되어 체인에 저장되는 짧은 글입니다. 공백이 있으면 따옴표로 묶으세요. 누구나 읽을 수 있으므로 개인적인 내용은 쓰지 마세요. |

`--memo` 옵션은 예시처럼 받는 사람과 금액 뒤에 둡니다.

**표시되는 내용:**

```text
  sending      1 QOR -> qor1...
  fee          ... uqor (gas ...)
  included     block 123465

  tx           <64-character transaction hash>
  block        123465
  memo         Build Before Q-Day Workshop 1 (Rust)
  classical    secp256k1   64 bytes
  quantum      ML-DSA-87   4627 bytes

  VERIFIED: secp256k1 + ML-DSA-87
```

`fee`는 uqor 단위로 표시되며 1 QOR보다 훨씬 적습니다. 프로그램은 `explorer` 링크와 `chain says` 줄도 출력합니다(10단계). 트랜잭션 해시를 복사해 두세요.

### 10. 트랜잭션 검증 {#verify}

```bash
./target/release/qday-pay verify <TX_HASH>
```

**하는 일:** 아무것도 전송하지 않고 체인에서 트랜잭션을 읽어 세 가지를 확인합니다.

| 부분 | 의미 |
| --- | --- |
| `verify` | 검증 보고서를 출력하는 명령입니다. |
| `<TX_HASH>` | 트랜잭션의 64자리 해시입니다. 9단계의 해시를 붙여 넣으세요. 어떤 테스트넷 트랜잭션에도 사용할 수 있습니다. |

확인 항목:

1. 트랜잭션이 성공했습니다(결과 코드 0).
2. 체인이 `status=verified`인 `pqc_hybrid_verify` 이벤트를 발생시켰습니다. 체인이 양자 내성 서명을 검사했다는 기록입니다.
3. 트랜잭션에 64바이트 secp256k1 서명과 함께 4,627바이트 ML-DSA-87 서명이 담긴 `PQCHybridSignature` 확장이 있습니다.

**표시되는 내용:** 9단계와 같은 보고서가 나오고 `VERIFIED: secp256k1 + ML-DSA-87`로 끝납니다. 확인 항목 중 하나라도 실패하면 보고서에 `NOT VERIFIED as hybrid`가 표시되고 프로그램은 종료 코드 2로 끝납니다.

### 11. 우리 프로그램 없이 두 번째 방법으로 검증하기 {#verify-curl}

체인에 직접 물어볼 수 있습니다. 필요한 것은 `curl`뿐이며, macOS와 대부분의 Linux에는 이미 들어 있습니다. `jq`(선택 사항)는 결과를 읽기 쉽게 해 줍니다. macOS에서는 `brew install jq`, Linux에서는 `sudo apt install -y jq`로 설치하세요.

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| 부분 | 의미 |
| --- | --- |
| `curl -s <address>` | 테스트넷 REST 서비스에서 응답을 내려받습니다. `-s`는 진행 표시줄을 숨깁니다. |
| `<HASH>` | 내 트랜잭션 해시입니다. |
| `\| jq '...'` | 세 가지 값을 골라 보여 줍니다. `jq`가 없으면 이 부분을 빼고 전체 텍스트를 읽으세요. |

**표시되는 내용:**

- 응답에 `"code": 0`이 있습니다(트랜잭션 성공). `jq` 출력의 첫 줄은 `0`입니다.
- ML-DSA-87 서명이 담긴 `PQCHybridSignature` 확장(타입 `/qorechain.pqc.v1.PQCHybridSignature`)이 있습니다. base64 텍스트 길이는 6,172자이며, 이는 4,627바이트입니다.
- `tx_response.events`에 `pqc_hybrid_verify` 타입의 이벤트가 있고 `status` 속성이 `verified`입니다.

**탐색기에서:** https://explore.qore.network 를 열어 **Testnet**으로 전환한 다음 트랜잭션 해시를 검색하세요. 프로그램이 바로 가는 링크도 출력해 줍니다.

### 12. 정리 {#cleanup}

다 끝났으면 일회용 키 파일을 삭제하세요.

```bash
rm ~/.config/qday/rust.env
```

`rm`은 파일을 삭제합니다. 더 이상 필요 없는 테스트넷 키에만 실행하세요.

## 문제 해결 {#troubleshooting}

| 보이는 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
| `command not found: cargo` 또는 `rustc` | Rust가 설치되지 않았거나, 설치 전에 터미널을 열었습니다. | Rust를 설치(1단계)한 다음 터미널을 닫고 다시 여세요. |
| `linker 'cc' not found` 또는 `linking with cc failed` | C 컴파일러가 없습니다. | macOS: `xcode-select --install`. Ubuntu: `sudo apt install -y build-essential`. |
| `cannot read ... run qday-pay new first` | 해당 위치에 키 파일이 없습니다. | `./target/release/qday-pay new`를 실행하거나, 이전과 같은 `QDAY_KEY_FILE`을 설정하세요. |
| `cannot create ... it may already exist` | 키 파일이 이미 있습니다. 프로그램은 기존 파일을 덮어쓰지 않습니다. | 그 파일을 계속 쓰거나, 필요한 내용이 없다면 `rm`으로 삭제한 뒤 `new`를 다시 실행하세요. |
| `account qor1... not found on chain yet; fund it first` | 계정에 QOR가 아직 없어서 체인에 존재하지 않습니다. | 파우셋에서 QOR를 요청하고(6단계) 약 10초 기다린 뒤 다시 시도하세요. |
| 파우셋이 요청 한도에 걸렸다고 함 | 파우셋은 계정당 24시간에 한 번만 요청을 받습니다. | 24시간을 기다리거나 두 번째 일회용 계정을 사용하세요. |
| `account has no PQC key and classical fallback is disabled` | 양자 내성 키를 등록하기 전에 결제를 보냈습니다. | `./target/release/qday-pay register`를 실행한 뒤 다시 보내세요. |
| `not a qor1 address` | 받는 사람 주소가 잘못되었습니다(예: `0x...` 주소). | `qor1...` 주소를 사용하세요. |
| `transport error` 또는 `error sending request` | 인터넷이 없거나 테스트넷에 잠시 접속할 수 없습니다. | 연결을 확인하고 1분 뒤에 다시 시도하세요. |
| `NOT VERIFIED as hybrid` | 트랜잭션이 실패했거나 하이브리드 서명이 아닙니다. | 보고서의 `code`를 읽어 보세요. 이 프로그램으로 새 결제를 보내세요. |
| `pnpm: command not found` | JavaScript 앱을 시도했습니다. 이 Rust 앱에는 pnpm이 필요 없습니다. | 여기서는 무시하세요. JavaScript 앱에서는 `npm install -g pnpm`을 실행하세요. |
| `EVM authorisation window exhausted` | 이 앱이 아니라 Hardhat 앱에 해당하는 메시지입니다. | 해당 앱에서 `pnpm window open`으로 새 윈도우를 여세요. |
| CORS 오류 | 브라우저 앱에 해당합니다. 이 명령줄 앱에는 발생하지 않습니다. | 브라우저 앱에서는 템플릿의 `/lcd` 프록시를 사용하세요. |

## 계정 {#account}

계정은 QoreChain Native secp256k1 계정입니다(coin type 118, 경로 `m/44'/118'/0'/0/0`, `qor1...` 주소). ML-DSA-87 키는 같은 복구 문구에서 SDK의 표준 주소 결합 규칙(`authenticator::try_derive_pqc_canonical`)으로 만들어집니다. 복구 문구 하나로 두 키를 모두 복원할 수 있습니다.

## 핵심이 되는 SDK 코드 {#code}

`src/main.rs`에 있는 `send` 명령의 핵심 부분입니다.

```rust
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);           // MsgSend
let draft = build_hybrid_tx(params.clone())?;                           // secp256k1 + ML-DSA-87
params.fee = estimate_fee(rest, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params)?;                                      // sign for real
let res = broadcast_and_wait(rest, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

등록은 호출 한 번입니다. `PqcDx::ensure_pqc_registered()`는 등록된 키가 아직 없을 때만 소유 증명이 포함된 `MsgRegisterPQCKeyV2`를 보냅니다.

## "검증됨"은 어떻게 판정하나 {#verified}

`verify`는 `GET /cosmos/tx/v1beta1/txs/{hash}`를 읽어 다음을 확인합니다.

- 트랜잭션이 성공했는지(`code 0`)
- 체인이 서명자에 대해 `status=verified`인 `pqc_hybrid_verify`를 발생시켰는지
- 본문에 4,627바이트 ML-DSA-87 서명이 담긴 `/qorechain.pqc.v1.PQCHybridSignature` 확장이 있는지(64바이트 secp256k1 서명과 함께)

## 화면에 표시되는 결과 {#output}

- `new`는 `qor1...` 주소와 키 파일 위치를 출력하며, 복구 문구는 절대 출력하지 않습니다.
- `status`는 잔액과 ML-DSA-87 키 등록 여부를 보여 줍니다.
- `send`는 `VERIFIED: secp256k1 + ML-DSA-87`과 탐색기 링크로 끝납니다.
- https://explore.qore.network (Testnet으로 전환)에서 트랜잭션이 해시로 검색됩니다.

## 네트워크 엔드포인트 {#access}

| | |
| --- | --- |
| Cosmos 체인 ID | `qorechain-diana` (테스트넷 전용) |
| REST | `https://api-testnet.qore.host` |
| 파우셋 | https://dashboard.qorechain.io/faucet |
| 탐색기 | https://explore.qore.network (Testnet으로 전환) |

## 사용된 패키지 {#packages}

| 크레이트 | 버전 | 용도 |
| --- | --- | --- |
| `qorechain-sdk` | 0.13 | 계정, 하이브리드 서명, REST 클라이언트, 검증 도우미 |
| `tokio` | 1 | 비동기 런타임 |
| `serde_json` | 1 | 체인의 JSON 응답 읽기 |
| `base64` | 0.22 | 서명 크기 측정 |
| `cosmrs` | 0.22 | `Coin` 메시지 타입 |

## 소스 코드 {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
