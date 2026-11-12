---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: Python 앱, Q-Day Airdrop
sidebar_label: Python, Airdrop
sidebar_position: 6
---

# Python 앱: Q-Day Airdrop

**Q-Day Airdrop**은 기존 방식의 secp256k1 키와 양자 내성 ML-DSA-87(FIPS 204) 키로 서명한 **하나의** 트랜잭션으로 주소 목록 전체에 테스트넷 QOR를 보내는 작은 Python 도구입니다. 그런 다음 체인 자체의 기록으로 두 서명이 모두 검증되었음을 증명합니다. QoreChain 테스트넷(`qorechain-diana`, EVM 체인 ID 9800)에서 실행됩니다.

## 보여 주는 것 {#what-it-shows}

- Python에서 하는 **하이브리드 ML-DSA-87 + secp256k1 서명**.
- 멀티 센드 메시지 하나로 많은 수신자에게 한 번에 지급하는, **온체인에서 검증된 하이브리드 서명 트랜잭션 하나**.
- 도구의 말이 아니라 체인 자체의 트랜잭션 기록으로 만든 **검증 보고서**.

중요한 이유: 서명 하나가 에어드롭 전체를 보호하며, ML-DSA-87 절반이 양자 내성이므로 미래의 양자 컴퓨터에 대해서도 보호가 유지됩니다. [양자 안전 트랜잭션](/sdk/guides/quantum-safe)을 참고하세요.

## 단계별 안내 {#run}

아래의 모든 작업은 자신의 터미널(macOS, Linux 또는 WSL이 있는 Windows)에서 실행됩니다. 일회용 테스트넷 계정만 사용합니다. 테스트넷 QOR에는 가치가 없으며, 여기서는 실제 지갑을 쓰지 않습니다.

### 1. 도구 설치 {#install}

Git과 Python 3.10 이상(`venv` 포함)이 필요합니다. 가지고 있는 것을 확인하세요.

```bash
git --version
python3 --version      # must report 3.10 or later
python3 -m venv --help # prints usage if venv is available
```

없는 것이 있다면 먼저 설치하세요. 예를 들어 [python.org](https://www.python.org/downloads/)에서 받거나 패키지 관리자를 사용합니다(macOS는 `brew install python`, Debian이나 Ubuntu는 `sudo apt install python3 python3-venv git`). 새 터미널을 열고 확인을 다시 실행하세요.

### 2. 코드 받기 {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

### 3. 의존성 설치 {#deps}

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

패키지 하나인 `qorechain-sdk==0.13.0`과 그에 필요한 것들이 설치됩니다. 나머지 단계 동안 가상 환경을 활성화한 상태로 두세요(새 터미널에서는 `source .venv/bin/activate`를 다시 실행). 도구가 시작되는지 확인합니다.

```bash
python airdrop.py --help
```

`new`, `status`, `register`, `drop`, `verify` 명령이 보여야 합니다.

### 4. 일회용 테스트넷 계정 만들기 {#key}

```bash
python airdrop.py new
```

새 복구 문구를 생성해 키 파일 `~/.config/qday/python.env`(본인만 읽을 수 있음, 권한 600)에 저장하고, `qor1...`로 시작하는 계정 주소만 출력합니다. 문구는 표시되지 않습니다. 이 파일을 공유하거나 커밋하지 마시고, 메인넷에서 재사용하지 마세요. 키를 다른 곳에 두려면 명령 이름 앞에 `--key-file /path/to/file`을 붙이거나(예: `python airdrop.py --key-file ~/my.env status`) `QORE_KEY_FILE`을 설정하세요.

출력에서 `qor1...` 주소를 복사합니다. 잃어버렸다면 `python airdrop.py status`가 다시 출력해 줍니다.

### 5. 포셋에서 테스트넷 QOR 받기 {#faucet}

1. https://dashboard.qorechain.io/faucet 을 열고 로그인합니다.
2. `qor1...` 주소를 붙여 넣고 토큰을 요청합니다. 포셋은 24시간마다 100 QOR를 줍니다.
3. 도착했는지 확인합니다.

```bash
python airdrop.py status
```

잔액에 테스트넷 QOR가 표시되고, 양자 내성 키는 아직 등록되지 않은 것으로 표시되어야 합니다.

### 6. 양자 내성 키 등록 {#register}

```bash
python airdrop.py register
```

ML-DSA-87 키를 체인에 한 번 등록합니다. 다시 실행해도 안전합니다. 등록은 기존 방식으로 서명합니다. 키는 자신의 등록에 공동 서명할 수 없기 때문입니다. 그 이후의 모든 트랜잭션은 하이브리드로 서명합니다.

### 7. 수신자 목록 작성 {#list}

한 줄에 테스트넷 주소 하나씩 담은 텍스트 파일을 만듭니다. 처음 시도할 때는 `--key-file`이 새 파일을 가리키게 해서 일회용 주소 몇 개를 만들거나, 테스트넷을 쓰는 친구의 주소를 사용하세요.

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

그런 다음 출력된 주소를 `addresses.txt`에 넣습니다.

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

빈 줄, `#` 주석, 중복, 발신자 자신, 유효한 `qor1...` 계정 주소가 아닌 모든 항목은 경고와 함께 건너뜁니다. 트랜잭션 하나에 수신자는 최대 100명입니다. 저장소에는 자리표시자 줄로 된 샘플인 `addresses.example.txt`도 있습니다.

### 8. 에어드롭 보내기 {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

`0.1`은 수신자 한 명당 보내는 QOR 금액입니다. 도구가 요약(수신자 수, 1인당 금액, 총액)을 보여 주고 확인을 요청합니다. 질문을 건너뛰려면 `--yes`를 추가하세요. 이어서 트랜잭션을 시뮬레이션해 가스를 정하고, 두 키로 서명하고, 트랜잭션 하나로 브로드캐스트한 다음 검증 보고서를 출력합니다. 브로드캐스트가 실패하면 1분 기다렸다가 다시 시도하세요.

### 9. 아무 트랜잭션이나 검증 {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

`drop`이 출력한 해시를 사용하세요. 어떤 트랜잭션 해시든 검증 보고서만 따로 출력합니다.

## 확인할 결과 {#output}

- `drop`이 트랜잭션 해시와 높이를 출력하고, 이어서 검증 보고서를 보여 줍니다. 서명자의 `pqc_hybrid_verify` 상태가 `verified`이고, ML-DSA-87 서명이 4627바이트이며, 코드가 0이고, 수신자 수가 목록과 일치합니다.
- 익스플로러에서: `https://explore.qore.network/tx/<HASH>`를 열고 익스플로러를 **Testnet**으로 전환합니다. 트랜잭션이 성공으로 표시되고 모든 수신자에게 지급된 것을 볼 수 있습니다.

## 증명이 동작하는 방식 {#proof}

`verify`는 공개 테스트넷 REST 엔드포인트에서 `GET /cosmos/tx/v1beta1/txs/{hash}`를 읽어 다음을 확인합니다.

- 서명자에 대해 `status=verified`인 `pqc_hybrid_verify` 유형의 이벤트
- `/qorechain.pqc.v1.PQCHybridSignature` 확장에 4627바이트 ML-DSA-87 서명이 담겨 있는지(64바이트 secp256k1 서명 옆에)
- 트랜잭션이 성공했는지(code 0), 그리고 몇 명에게 지급했는지

## 핵심 SDK 코드 {#code}

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

키는 `ensure_pqc_registered(...)`로 한 번 등록하며, 같은 키가 이미 체인에 있으면 아무 일도 하지 않습니다. 가스는 고정값이 아닙니다. 실제로 하이브리드 서명된 트랜잭션을 먼저 시뮬레이션하고, 한도는 시뮬레이션된 가스의 1.3배로 정하며, 가스당 0.15 uqor로 가격을 매깁니다.

이 계정은 코인 타입 118(`m/44'/118'/0'/0/0`)입니다. ML-DSA-87 키는 같은 복구 문구에서 파생되며 `derive_pqc_canonical`로 주소에 바인딩됩니다. 시드 기반 헬퍼로 직접 앱을 만든다면 SDK 0.13.0에는 복구 코드 또는 독립적인 32바이트 PQC 시크릿이 필요합니다(Python에서는 `unified_account_from_seed(seed32, recovery_code=...)`). [SDK 설치](/sdk/install#whats-new-0130)를 참고하세요. 복구 코드는 절대 출력하지 마세요.

## 사용한 패키지 {#packages}

| 항목 | 버전 |
| --- | --- |
| `qorechain-sdk`(PyPI, `qorsdk`로 import) | 0.13.0(`requirements.txt`에 `qorechain-sdk==0.13.0`으로 고정) |
| Python | 3.10 이상 |

이 도구는 protobuf 타입 `Input`, `Output`(`cosmpy.protos.cosmos.bank.v1beta1.bank_pb2`에서)과 `Coin`(`cosmpy.protos.cosmos.base.v1beta1.coin_pb2`에서)도 import하며, 이들은 SDK와 함께 설치됩니다. 모든 언어의 릴리스 표는 [SDK 설치](/sdk/install)를 참고하세요.

## 참고할 곳 {#access}

| 항목 | 위치 |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| 익스플로러 | `https://explore.qore.network`(Testnet으로 전환) |
| 포셋 | https://dashboard.qorechain.io/faucet |
| 코드 | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
