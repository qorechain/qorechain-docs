---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: Python 앱, Q-Day 에어드롭
sidebar_label: Python, 에어드롭
sidebar_position: 6
---

# Python 앱: Q-Day 에어드롭

**Q-Day 에어드롭**(Airdrop)은 주소 목록 전체에 테스트넷 QOR를 **한 번의** 트랜잭션으로 보내는 작은 Python 도구입니다. 트랜잭션은 기존 방식의 secp256k1 키와 양자 내성 ML-DSA-87 키(FIPS 204)로 서명됩니다. 그런 다음 도구는 체인 자체의 기록을 근거로 두 서명이 모두 검증되었음을 증명합니다. QoreChain 테스트넷(`qorechain-diana`, EVM 체인 ID 9800)에서 실행됩니다.

**소요 시간:** 처음에는 약 20분입니다(도구 설치 10분, 설정 5분, 전송과 확인 5분).

Python을 몰라도 됩니다. 아래 명령을 하나씩 입력하고 결과를 "표시되는 내용"과 비교하기만 하면 됩니다.

## 보여 주는 것 {#what-it-shows}

- Python에서 하는 **하이브리드 ML-DSA-87 + secp256k1 서명**.
- 멀티 전송 메시지 하나로 여러 수신자에게 한꺼번에 지급하는, **체인에서 검증된 하이브리드 서명 트랜잭션 한 건**.
- 도구의 말이 아니라 체인 자체의 트랜잭션 기록으로 만든 **검증 보고서**.

중요한 이유: 서명 하나가 에어드롭 전체를 보호하며, ML-DSA-87 부분이 양자 내성이기 때문에 미래의 양자 컴퓨터에도 계속 보호됩니다. [양자 안전 트랜잭션](/sdk/guides/quantum-safe)을 참고하세요.

:::warning 테스트넷 전용
반드시 일회용 테스트넷 계정만 사용하세요. 테스트넷 QOR에는 가치가 없습니다. 이 튜토리얼에서는 실제 지갑, 실제 복구 문구, 실제 자금을 절대 사용하지 마세요.
:::

## 자주 나오는 용어 {#words}

| 용어 | 의미 |
| --- | --- |
| 테스트넷 | QoreChain의 연습용 사본입니다. 여기의 코인은 무료이며 가치가 없습니다. |
| QOR와 uqor | 같은 코인을 부르는 두 이름입니다. 1 QOR = 1,000,000 uqor. 도구는 QOR 단위로 금액을 묻고, 수수료는 uqor로 표시합니다. |
| 메모 | 은행 송금의 메모처럼 트랜잭션에 첨부하는 짧은 글입니다. |
| 주소 | 내 공개 계좌 번호입니다. QoreChain에서는 `qor1`로 시작합니다. 공유해도 안전합니다. |
| 키 파일 | 비밀 복구 문구가 들어 있는 파일입니다. 절대 공유하지 마세요. |
| 파우셋 | 무료 테스트넷 QOR를 주는 웹사이트입니다. |
| 해시 | 트랜잭션의 고유 ID입니다. 트랜잭션을 조회할 때 사용합니다. |

## 시작 전에 {#before}

**Git**(코드 내려받기)과 `venv`(도구의 라이브러리를 담는 전용 폴더)가 포함된 **Python 3.10 이상**이 필요합니다. 각 설치 후에는 **터미널을 닫고 새로 연** 다음 확인 명령을 실행하세요.

| 도구 | macOS | Windows | Linux (Debian 또는 Ubuntu) | 확인 |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (Homebrew는 https://brew.sh) | https://git-scm.com/download/win | `sudo apt install git` | `git --version` |
| Python 3.10+ | `brew install python` | https://www.python.org/downloads/ (설치 프로그램에서 "Add python.exe to PATH"에 체크) | `sudo apt install python3 python3-venv python3-pip` | `python3 --version` (Windows에서는 `python --version`) |

Windows에서는 PowerShell 또는 Git Bash를 사용하세요. 이 페이지에서 `python3`라고 쓴 곳에는 Windows에서 보통 `python`을 씁니다. 가상 환경을 켜는 줄(3단계)을 제외하면 나머지는 모두 같습니다.

## 테스트넷 지갑과 무료 QOR 받기 {#wallet}

도구가 아래 4단계에서 자체 일회용 키를 만들기 때문에, 이 튜토리얼에 지갑 앱은 필요하지 않습니다. QoreX에서 내 계정을 함께 보고 싶다면 다음과 같이 하세요.

1. **QoreX 앱:** 설정을 열고 **Use testnet (developers)**를 켭니다.
2. **QoreX 브라우저 확장 프로그램:** 잠금을 해제하고, 하단의 버전 번호를 7번 누른 다음 **Switch to testnet (diana)**를 선택합니다.

무료 QOR는 https://dashboard.qorechain.io/faucet 의 파우셋에서 받습니다. 로그인하고 주소를 붙여 넣은 뒤 요청하세요. **계정당 24시간에 100 QOR**를 지급합니다.

새 계정의 첫 번째 트랜잭션은 양자 내성 ML-DSA-87 키를 체인에 등록합니다. 한 번만 하는 단계이며 수수료는 약 0.09 QOR입니다. 도구가 `register` 명령으로 이를 처리해 줍니다.

## 단계별 안내 {#run}

### 1. 코드 내려받기 {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

**하는 일**

- `git clone <address>`: GitHub의 프로젝트를 `build-before-qday`라는 새 폴더로 복사합니다.
- `cd <folder>`: 터미널을 Python 앱 폴더로 이동합니다. 이후 모든 명령은 이 폴더에서 실행해야 합니다.

**표시되는 내용:** `Cloning into 'build-before-qday'...` 같은 줄이 나오고, 프롬프트가 새 폴더로 바뀝니다.

### 2. 전용 Python 환경 만들기 {#venv}

```bash
python3 -m venv .venv
```

**하는 일:** 이 도구의 라이브러리를 담는 `.venv` 폴더를 만들어, 컴퓨터의 다른 것들과 섞이지 않게 합니다.

| 부분 | 의미 |
| --- | --- |
| `python3` | Python 프로그램입니다. |
| `-m venv` | Python에 내장된 "가상 환경" 생성기를 실행합니다. |
| `.venv` | 만들 폴더의 이름입니다. |

**표시되는 내용:** 아무것도 출력되지 않으며, 새 `.venv` 폴더가 생깁니다.

### 3. 환경을 켜고 라이브러리 설치 {#deps}

```bash
source .venv/bin/activate
```

Windows PowerShell에서는 대신 `.venv\Scripts\activate`를 사용하세요(PowerShell이 막으면 `Set-ExecutionPolicy -Scope Process RemoteSigned`를 실행한 뒤 다시 시도). Windows 명령 프롬프트에서는 `.venv\Scripts\activate.bat`를 사용하세요.

**하는 일:** 터미널이 전용 환경을 사용하도록 전환합니다.

**표시되는 내용:** 프롬프트 맨 앞에 `(.venv)`가 표시됩니다. 새 터미널을 열 때마다 같은 명령으로 다시 켜세요.

```bash
pip install -r requirements.txt
```

| 부분 | 의미 |
| --- | --- |
| `pip` | Python의 라이브러리 설치 도구입니다. |
| `install` | 라이브러리를 내려받아 설치합니다. |
| `-r requirements.txt` | 이 파일에서 라이브러리 목록을 읽습니다. 라이브러리 하나인 `qorechain-sdk==0.13.0`(QoreChain SDK, 정확히 0.13.0 버전)과 그것이 필요로 하는 것들이 적혀 있습니다. |

**표시되는 내용:** 내려받기 줄이 나오고 `Successfully installed ... qorechain-sdk-0.13.0`으로 끝납니다. 새 pip를 사용할 수 있다는 안내는 무시해도 됩니다.

**소요 시간:** 약 15초에서 1분입니다.

이제 도구가 시작되는지 확인합니다.

```bash
python airdrop.py --help
```

**표시되는 내용:** 명령 `new`, `status`, `register`, `drop`, `verify`.

### 4. 일회용 테스트넷 계정 만들기 {#key}

```bash
python airdrop.py new
```

**하는 일:** 새 계정을 만듭니다. 비밀 복구 문구를 키 파일 `~/.config/qday/python.env`(홈 폴더 안, 본인만 읽을 수 있음)에 쓰고, 공개 주소만 출력합니다.

| 부분 | 의미 |
| --- | --- |
| `new` | 새 키 파일을 만들고 그 주소를 출력합니다. |
| `new --force` | 이미 있는 키 파일을 교체합니다. 이전 키는 사라집니다. |

**표시되는 내용:** `New testnet wallet`, `qor1...`로 시작하는 `address`, `(mode 600, mnemonic not shown)`이 붙은 키 파일 경로, 그리고 다음 단계에 대한 안내.

**`qor1...` 주소를 복사해 두세요.** 잃어버렸다면 `python airdrop.py status`가 다시 출력해 줍니다. 키 파일은 절대 공유하지 말고, Git에 커밋하지 말고, 메인넷에서 재사용하지 마세요.

키를 다른 곳에 두려면 `--key-file`을 명령 이름 **앞에** 쓰세요.

```bash
python airdrop.py --key-file ~/my.env status
```

`--key-file <path>`는 "기본 파일 대신 이 키 파일을 사용하라"는 뜻입니다. 순서가 중요합니다. `--key-file`은 `status`, `drop` 등 다른 명령 앞에 옵니다. 환경 변수 `QORE_KEY_FILE`을 대신 설정해도 됩니다.

### 5. 파우셋에서 테스트넷 QOR 받기 {#faucet}

1. https://dashboard.qorechain.io/faucet 을 열고 로그인합니다.
2. `qor1...` 주소를 붙여 넣고 요청 버튼을 누릅니다.
3. 몇 초 기다린 다음 실행합니다.

```bash
python airdrop.py status
```

**하는 일:** 테스트넷에 내 잔액과 양자 내성 키의 등록 여부를 묻습니다.

**표시되는 내용:** 내 잔액(약 100 QOR)과 ML-DSA-87 키가 아직 등록되지 않았다는 경고. 주소가 "is not on chain yet"이라고 나오면 파우셋 결제가 아직 도착하지 않은 것입니다. 10초 기다렸다가 다시 시도하세요.

### 6. 양자 내성 키 등록 {#register}

```bash
python airdrop.py register
```

**하는 일:** ML-DSA-87 키를 체인에 한 번 기록합니다. 다시 실행해도 안전합니다. 이 첫 트랜잭션은 기존 방식으로 서명됩니다. 키가 자기 자신의 등록에 함께 서명할 수는 없기 때문입니다. 약 0.09 QOR가 듭니다. 그 이후의 모든 트랜잭션은 하이브리드로 서명됩니다.

**표시되는 내용:** 트랜잭션 해시와 `registered` 줄(두 번 실행했다면 `already registered`).

**소요 시간:** 몇 초(블록 하나)입니다.

### 7. 수신자 목록 작성 {#list}

일회용 수신자 계정을 두 개 만드세요. 각각 자기 키 파일을 가집니다.

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

**하는 일:** 앞에서와 같은 `new`이지만, `--key-file`이 각 키를 별도의 파일로 보내므로 아무것도 덮어쓰이지 않습니다. (테스트넷을 쓰는 친구들의 주소를 사용해도 됩니다.)

**표시되는 내용:** 서로 다른 `qor1...` 주소 두 개. 둘 다 복사해 두세요.

이제 이 폴더에 `addresses.txt`라는 일반 텍스트 파일을 만들고 한 줄에 주소 하나씩 적으세요. 어떤 텍스트 편집기든 괜찮습니다(Windows는 메모장, macOS는 일반 텍스트 모드의 텍스트 편집기, Linux는 `nano addresses.txt`).

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

예시 두 줄을 실제 주소로 바꾸세요. 빈 줄, `#` 주석, 중복, 보내는 사람 자신, 올바른 `qor1...` 주소가 아닌 모든 것은 경고와 함께 건너뜁니다. 트랜잭션 하나당 수신자는 최대 100명입니다. 이 폴더에는 자리 표시 줄이 들어 있는 샘플 `addresses.example.txt`도 있습니다.

### 8. 에어드롭 보내기 {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

| 부분 | 의미 |
| --- | --- |
| `drop` | 목록의 모든 사람에게 지급하는 트랜잭션 한 건을 보냅니다. |
| `addresses.txt` | 수신자가 담긴 파일입니다. |
| `0.1` | **수신자 한 명당** QOR 단위의 금액입니다(0.1 QOR = 100,000 uqor). 수신자가 둘이면 합계 0.2 QOR를 받습니다. |
| `--memo "..."` | 트랜잭션에 첨부하는 짧은 글입니다. 선택 사항입니다. |
| `--yes` (또는 `-y`) | 선택 사항: "정말 진행할까요" 질문을 건너뜁니다. |

옵션 순서: 금액과 파일이 먼저 오고, `--memo`와 `--yes`는 그 뒤에 옵니다. `--key-file`은 다릅니다. `drop` 앞에 옵니다.

**하는 일:** 요약(수신자, 1인당 금액, 합계)을 보여 주고 확인을 요청합니다. `y`를 입력하고 Enter를 누르세요. 그런 다음 체인에 필요한 가스량을 묻고(시험 실행), 안전 여유분으로 30퍼센트를 더하고, 두 키로 서명하고, 트랜잭션 한 건을 전송한 뒤, 검증 보고서를 출력합니다.

**표시되는 내용:** 트랜잭션 해시와 높이, 그리고 다음이 담긴 보고서: code 0, 서명자의 `pqc_hybrid_verify` 상태 `verified`, 4,627바이트 ML-DSA-87 서명, 그리고 내 목록과 일치하는 수신자 수. 해시를 복사해 두세요.

**소요 시간:** 약 10초입니다.

### 9. 아무 트랜잭션이나 검증 {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

**하는 일:** 체인에서 트랜잭션을 읽어 검증 보고서만 따로 출력합니다. 내 것뿐 아니라 어떤 트랜잭션 해시에도 사용할 수 있습니다.

**표시되는 내용:** 8단계 끝에서 본 것과 같은 보고서.

## 트랜잭션 직접 검증하기 {#check}

도구를 믿을 필요는 없습니다. 체인에 직접 물어보세요.

**방법 1, 브라우저에서.** `https://explore.qore.network/tx/<HASH>`를 열고(`<HASH>` 자리에 내 해시를 넣으세요) 탐색기를 **Testnet**으로 전환합니다. 모든 수신자에게 지급된 성공한 트랜잭션이 보여야 합니다.

**방법 2, 명령 한 줄:**

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| 부분 | 의미 |
| --- | --- |
| `curl` | 웹 주소의 내용을 내려받는 도구입니다. macOS, Windows 10 이상, 대부분의 Linux에 내장되어 있습니다. |
| `-s` | 조용한 모드입니다. 진행 표시줄을 숨깁니다. |
| 주소 | 공개 테스트넷 REST API입니다. 전체 트랜잭션 기록을 JSON으로 돌려줍니다. |

긴 출력에서 **표시되는 내용**(jq를 설치했다면 `| jq .`를 덧붙이세요. https://jqlang.github.io/jq/download/ 참고):

- `"code": 0`은 트랜잭션이 성공했다는 뜻입니다.
- 64바이트 기존 방식 서명과 함께 **4,627바이트**의 `pqc_signature`(ML-DSA-87 서명)가 담긴 `PQCHybridSignature` 확장.
- 내 주소에 대해 `status`가 `verified`인 `pqc_hybrid_verify` 이벤트.

## 증명이 작동하는 방식 {#proof}

`verify`는 공개 테스트넷 REST 엔드포인트의 `GET /cosmos/tx/v1beta1/txs/{hash}`를 읽어 다음을 확인합니다.

- 서명자에 대해 `status=verified`인 `pqc_hybrid_verify` 타입의 이벤트가 있는지
- `/qorechain.pqc.v1.PQCHybridSignature` 확장에 4,627바이트 ML-DSA-87 서명이 담겨 있는지
- 트랜잭션이 성공했는지(code 0), 그리고 몇 명에게 지급했는지

## 문제 해결 {#troubleshooting}

| 보이는 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
| `python3: command not found` 또는 3.10 미만 버전 | Python이 없거나 오래되었습니다. | Python 3.10 이상을 설치하고 새 터미널을 여세요. Windows에서는 `python`을 사용하세요. |
| `No module named venv` 또는 `ensurepip is not available` | Python의 venv 부분이 설치되어 있지 않습니다(Debian, Ubuntu). | `sudo apt install python3-venv`를 실행한 뒤 2단계를 반복하세요. |
| `ModuleNotFoundError: No module named 'qorsdk'` | 환경이 켜져 있지 않거나 설치를 건너뛰었습니다. | `source .venv/bin/activate`를 실행한 다음 `pip install -r requirements.txt`를 실행하세요. |
| `unrecognized arguments: --key-file` | `--key-file`을 명령 뒤에 두었습니다. | 앞에 두세요: `python airdrop.py --key-file <path> status`. |
| `no key file at ... Run: python airdrop.py new` | 4단계를 건너뛰었거나, 다른 `--key-file`을 사용 중입니다. | `python airdrop.py new`를 실행하세요. |
| `... already exists (use --force to replace it)` | 키 파일이 이미 있습니다. | 그대로 쓰거나, `python airdrop.py new --force`를 실행하세요(이전 키는 사라집니다). |
| `... is readable by others (mode ...)` | 키 파일 권한이 너무 느슨합니다. | `chmod 600 <path>`를 실행하세요. |
| `... is not on chain yet (fund it first)` | 파우셋 QOR가 아직 도착하지 않았습니다. | 10초 기다리거나 파우셋에서 요청하세요. |
| `account has no PQC key and classical fallback is disabled` | 양자 내성 키가 아직 등록되지 않았습니다. | 먼저 `python airdrop.py register`를 실행하세요. |
| `the ML-DSA-87 key is not registered yet` | 같은 이유이며, 도구가 전송 전에 발견한 것입니다. | `python airdrop.py register`를 실행하세요. |
| `balance too low` | 총 금액에 수수료를 더하면 보유량보다 많습니다. | 금액을 줄이거나 다음 파우셋 요청을 기다리세요. |
| 파우셋이 요청 한도라고 함 | 계정당 24시간에 한 번만 요청할 수 있습니다. | 기다리거나 다른 일회용 계정을 사용하세요. |
| `skip line N: not a valid qor1 address` | `addresses.txt`의 한 줄이 올바른 주소가 아닙니다. | 그 줄을 고치거나 삭제하세요. 나머지 줄은 그대로 동작합니다. |
| `no valid recipients` | 모든 줄이 건너뛰어졌습니다. | `addresses.txt`에 실제 `qor1...` 주소가 들어 있는지 확인하세요. |
| `bad amount` | 금액이 일반 숫자가 아닙니다. | `0.1`처럼 QOR 단위의 숫자를 사용하세요. |
| `refused by the node: code ...` | 체인이 트랜잭션을 거부했습니다. | 메시지를 읽어 보세요. 테스트넷이 바쁘거나 업그레이드 중이라면 1분 기다렸다가 다시 시도하세요. |
| `transaction not found on the testnet` | 해시가 틀렸거나 블록이 아직 확정되지 않았습니다. | 해시를 확인하고 몇 초 뒤에 다시 시도하세요. |
| `the testnet may be pausing for an upgrade` | 공개 엔드포인트가 IP 주소당 요청 수를 제한하거나, 테스트넷이 업그레이드 중입니다. | 1분 기다린 뒤 다시 실행하세요. |
| `EVM authorisation window exhausted` | 이 앱이 아니라 EVM 앱에 해당합니다. | EVM 앱에서 `pnpm window open`으로 새 윈도우를 여세요. |
| 윈도우를 연 뒤 `HHE10402` | Hardhat 앱에만 해당합니다. 윈도우가 아직 활성화되지 않았습니다. | 배포를 다시 실행하세요. |
| 브라우저의 `CORS` 오류 | 웹 페이지가 체인을 직접 호출할 때만 발생합니다. 이 도구는 그렇지 않습니다. | 브라우저 앱에서는 템플릿의 `/lcd` 프록시를 사용하세요. |
| `pnpm: command not found` | pnpm이 설치되어 있지 않습니다. 여기서는 필요하지 않습니다. | Hardhat 튜토리얼에서만 `npm install -g pnpm`을 실행하세요. |

## 핵심이 되는 SDK 코드 {#code}

```python
from qorsdk import (derive_native_account, derive_pqc_canonical, msg, build_hybrid_tx,
                    auto_fee, hybrid_sign_and_broadcast, wait_for_tx,
                    resolve_sign_bytes_version)

account = derive_native_account(mnemonic)                   # classical secp256k1 key
pqc = derive_pqc_canonical(account.address, mnemonic)       # ML-DSA-87 key, same mnemonic

# ONE MsgMultiSend: one input (the sender), one output per recipient.
drop = msg.bank.multi_send(
    inputs=[Input(address=sender, coins=[Coin(denom="uqor", amount=str(each * len(to)))])],
    outputs=[Output(address=a, coins=[Coin(denom="uqor", amount=str(each))]) for a in to])

build = lambda fee, v: build_hybrid_tx(account=account, pqc_keypair=pqc, messages=[drop], fee=fee,
    memo=memo, chain_id="qorechain-diana", account_number=num, sequence=seq, sign_bytes_version=v)

v = resolve_sign_bytes_version("qorechain-diana", rest_url=REST)                 # "v2" on the testnet
fee = auto_fee(REST, build({"amount": [], "gas": "0"}, v), gas_multiplier=1.3)  # simulate
res = hybrid_sign_and_broadcast(lambda v: build(fee, v), chain_id="qorechain-diana", rest_url=REST)
included = wait_for_tx(rest, res["tx_response"]["txhash"])
```

키는 `ensure_pqc_registered(...)`로 한 번 등록되며, 같은 키가 이미 체인에 있으면 아무 일도 하지 않습니다. 가스는 고정값이 아닙니다. 실제 하이브리드 서명 트랜잭션을 먼저 시뮬레이션하고, 한도는 시뮬레이션된 가스의 1.3배이며 가스당 0.15 uqor로 계산합니다.

계정은 coin type 118(`m/44'/118'/0'/0/0`)입니다. ML-DSA-87 키는 같은 복구 문구에서 만들어지며 `derive_pqc_canonical`로 주소와 결합됩니다. 시드 기반 도우미로 직접 앱을 만든다면 SDK 0.13.0에는 복구 코드나 독립적인 32바이트 PQC 비밀 값이 필요합니다(Python에서는 `unified_account_from_seed(seed32, recovery_code=...)`). [SDK 설치](/sdk/install#whats-new-0130)를 참고하세요. 복구 코드를 절대 출력하지 마세요.

## 사용된 패키지 {#packages}

| 항목 | 버전 |
| --- | --- |
| `qorechain-sdk` (PyPI, `qorsdk`로 import) | 0.13.0 (`requirements.txt`에 `qorechain-sdk==0.13.0`으로 고정) |
| Python | 3.10 이상 |

도구는 protobuf 타입 `Input`, `Output`(`cosmpy.protos.cosmos.bank.v1beta1.bank_pb2`에서)과 `Coin`(`cosmpy.protos.cosmos.base.v1beta1.coin_pb2`에서)도 import하며, 이들은 SDK와 함께 설치됩니다. 모든 언어의 릴리스 표는 [SDK 설치](/sdk/install)를 참고하세요.

## 참고할 곳 {#access}

| 항목 | 위치 |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| 탐색기 | `https://explore.qore.network` (Testnet으로 전환) |
| 파우셋 | https://dashboard.qorechain.io/faucet |
| 코드 | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
