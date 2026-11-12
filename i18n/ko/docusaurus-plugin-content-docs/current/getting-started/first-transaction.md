---
slug: /getting-started/first-transaction
title: 첫 트랜잭션
sidebar_label: 첫 트랜잭션
sidebar_position: 5
---

# 첫 트랜잭션

이 가이드에서는 QOR 토큰 전송, 트랜잭션 조회, 그리고 QoreChain의 네이티브, EVM, SVM 인터페이스를 통한 상호작용 방법을 다룹니다.

:::note
아래 명령어는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 기준으로 합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 2026년 6월 7일부터 운영 중이며 2026년 11월 12일부터 릴리스 v3.2.7을 실행합니다(테스트넷은 2026년 11월 12일부터 v3.2.8을 실행해 왔습니다) — 메인넷에서 트랜잭션을 수행할 때는 **메인넷 연결하기** 페이지에 나온 메인넷 체인 ID와 엔드포인트로 교체하세요.
:::

## 잔액 확인하기

토큰을 보내기 전에 계정 잔액을 확인하세요.

```bash
qorechaind query bank balances qor1youraddress... --output json
```

응답에는 해당 계정이 보유한 모든 토큰 단위(denomination)가 포함됩니다. QOR 잔액은 `uqor`(마이크로-QOR) 단위로 표시되며, **1 QOR = 1,000,000 uqor**입니다.

## QOR 보내기 {#send-qor}

QoreChain 계정은 Cosmos 레인에서 **하이브리드 서명**으로 전송합니다. 기존 방식의 secp256k1 서명에 ML-DSA-87(Dilithium-5) 서명이 더해집니다. 일반적인 `qorechaind tx bank send ... -y`는 거부되므로, 전송 트랜잭션을 서명 없이 먼저 만든 다음 공동 서명(co-sign)합니다. 계정에 포스트 퀀텀 키를 한 번 등록해 두어야 하며(아래 [포스트 퀀텀 키 등록하기](#register-pqc-key) 참고), [download.qore.host](https://download.qore.host)의 공식 `qorechaind` 릴리스 바이너리가 필요합니다(공개 소스 트리에서 빌드한 바이너리는 Dilithium 서명을 생성하거나 적용할 수 없습니다).

```bash
# 1. Build the unsigned transaction (the fee is fixed here, because cosign signs the fee in this file)
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 60000uqor \
  --generate-only > tx.json

# 2. Add the ML-DSA-87 signature and broadcast
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

이 명령은 수신자 주소로 **1 QOR**(1,000,000 uqor)을 보내며, 수수료로 60,000 uqor(0.06 QOR)를 지불합니다. 네트워크 최저 수수료는 **가스 1단위당 0.1 uqor**이므로, 수수료는 가스 한도에 0.1을 곱한 값 이상이어야 합니다. 즉 `--gas 400000`에는 `--fees 40000uqor` 이상이 필요합니다. 예제는 가스 1단위당 0.15 uqor를 지불합니다(`--fees 60000uqor`). v3.2.8부터 멤풀은 가스당 수수료 순으로 트랜잭션을 정렬하므로, 최저 수수료만 지불하는 전송은 블록이 붐빌 때 다른 트랜잭션 뒤에서 기다립니다. 하이브리드 서명이 적용된 전송은 서명이 트랜잭션에 약 4.7 KB를 추가하기 때문에 보통 160,000~240,000 가스를 사용합니다. `cosign`은 네트워크가 검증하는 서명 대상 바이트 형식을 노드에 물어보므로, 같은 명령이 두 네트워크 모두에서 동작합니다.

### 포스트 퀀텀 키 등록하기 {#register-pqc-key}

포스트 퀀텀 키는 계정당 한 번 **명시적으로 등록**합니다. 체인이 첫 트랜잭션 때 자동으로 등록해 주지 않습니다. 새 계정도 시작할 수 있도록, 등록 트랜잭션 자체(그리고 키 마이그레이션)는 클래식 키만으로 서명할 수 있습니다.

```bash
# generate the ML-DSA-87 key (stored under ~/.qorechaind/pqc/mypqc.dilithium, mode 0600, not encrypted)
qorechaind tx pqc gen-key mypqc

# register the printed public key for your account
qorechaind tx pqc register-key <public_key_hex> hybrid --from mykey \
  --chain-id qorechain-diana --gas 600000 --fees 90000uqor
```

v3.2.3부터 체인은 등록 시 선택적인 **소유 증명(proof of possession)**도 받으며, 약한 키, 퇴화(degenerate) 키, 이미 사용된 키는 거부합니다. 소유 증명을 첨부하려면 `register-key-v2`로 등록하고 로컬 키 이름을 지정하세요.

```bash
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --gas 600000 --fees 90000uqor
```

PQC 키 파일은 복구 문구만큼 신중하게 백업하세요. 이 키는 `qorechaind tx pqc recover-key`로 복구 문구에서 다시 도출할 수 있습니다. [QoreX](/qorex/overview)와 QoreChain SDK는 키 등록을 대신 처리해 줍니다. 전체 하이브리드 흐름은 [지갑 설정](/getting-started/wallet-setup)을 참고하세요.

:::caution Cosmos 전송에는 하이브리드 PQC 서명이 필요합니다
Cosmos 레인에서는 네트워크 설정이 `hybrid_signature_mode = required`입니다(라이브 네트워크는 v3.2 라인을 실행합니다). 클래식 서명만 있는 트랜잭션은 **거부됩니다**. CLI 없이 코드로 하이브리드 서명을 생성하려면 오픈소스 [**qorechain-pqc**](/developer-guide/post-quantum-signing) 라이브러리(`hybridSignBytes`)와 QoreChain SDK가 동일한 기능을 제공합니다.
:::

공동 서명된 트랜잭션이 수락되면 CLI가 트랜잭션 해시를 반환합니다.

## 새 계정의 첫 트랜잭션 {#first-tx-pqc}

릴리스 **v3.2.8**부터(테스트넷은 2026년 11월 12일부터, 메인넷은 아직 적용하지 않음) 새 계정의 첫 트랜잭션은 반드시 **포스트 퀀텀 키 등록**이어야 합니다. 소유 증명을 담은 `MsgRegisterPQCKeyV2`를 클래식 키만으로 서명해야 합니다. 등록된 키가 없는 계정의 다른 모든 첫 트랜잭션은 거부됩니다. 이는 자금을 받았지만 아직 아무것도 보낸 적 없는 새 계정에 적용되며, 이미 등록된 키가 있는 계정은 영향을 받지 않습니다.

**중요한 이유.** Cosmos 레인의 이후 모든 트랜잭션은 하이브리드(secp256k1 + ML-DSA-87)로 서명되며, 체인은 이미 알고 있는 키에 대해서만 ML-DSA-87 부분을 검증할 수 있습니다. 등록은 아직 그 서명을 담을 수 없는 유일한 트랜잭션이므로, 체인이 클래식 서명만으로 받아들이는 유일한 트랜잭션이며 반드시 가장 먼저 와야 합니다. 등록하기 전에 전송, 위임, 컨트랙트 호출을 보내면 트랜잭션이 거부되고 먼저 등록해야 합니다.

### 키 등록하기

CLI에서는 위의 [포스트 퀀텀 키 등록하기](#register-pqc-key)와 똑같이 `register-key-v2`를 사용하세요(키는 먼저 `qorechaind tx pqc gen-key mypqc`로 생성해야 합니다).

```bash
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --gas 600000 --fees 90000uqor
```

TypeScript SDK(0.9.0 이상)에서는 `ensurePqcRegistered`가 먼저 키 상태를 읽고, 키가 이미 등록되어 있으면 트랜잭션을 건너뛰며, 소유 증명을 첨부하고, 등록을 스스로 클래식 서명으로 전송합니다.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  ensurePqcRegistered,
} from "@qorechain/sdk";

const client = createClient({
  endpoints: { rest: "https://api-testnet.qore.host", rpc: "https://rpc-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);
const tx = await client.connectTx(signer, { pqcKeypair });

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  rest: client.network.endpoints.rest,
  fee: { amount: [{ denom: "uqor", amount: "90000" }], gas: "600000" },
});
console.log(res.alreadyRegistered ? "already registered" : res.txHash);
```

메시지만 필요하다면(예: 자체 트랜잭션 본문에 넣기 위해) `buildRegisterPqcKeyMsg(sender, { pqcKeypair, ecdsaPubkey, proofOfPossession })`가 전송하지 않고 `MsgRegisterPQCKeyV2`를 반환합니다.

다른 SDK에도 같은 멱등(idempotent) 헬퍼가 있으며, 모두 먼저 REST로 키 상태를 읽고 맹목적으로 등록하지 않습니다.

| 언어 | 헬퍼 |
| --- | --- |
| Python | `qorsdk.pqc_dx.ensure_pqc_registered(account=..., pqc_keypair=..., chain_id=..., account_number=..., sequence=..., rest_url=..., fee=...)` |
| Go | `pqcdx.New(pqcdx.Signer{...}, pqcdx.Options{}).EnsurePQCRegistered(pqcdx.RegisterOptions{})` |
| Rust | `PqcDx::ensure_pqc_registered().await` |
| Java | `PqcDx.ensurePqcRegistered(signer, broadcaster, qor, new PqcDx.EnsureOptions())` |

각 언어의 전체 서명자 설정은 해당 언어의 SDK 레퍼런스를 참고하세요. 등록에는 계정이 수수료를 낼 만큼의 QOR를 보유해야 하므로, 등록하기 전에 새 계정에 자금을 넣으세요.

### 서명을 포함한 수수료 추정

하이브리드 서명은 트랜잭션에 약 **4.7 KB**를 더하고 체인은 이에 대해 **검증 수수료**를 부과하므로, 서명되지 않았거나 클래식으로만 서명된 트랜잭션 사본으로 추정한 수수료는 너무 낮습니다. 하이브리드 서명을 포함해 트랜잭션을 시뮬레이션하거나 SDK가 대신하게 하세요. TypeScript 클라이언트의 기본 수수료는 `"auto"`이며, 하이브리드 트랜잭션을 시뮬레이션하여 그 결과로 가스 한도를 설정합니다.

```ts
import { toBase } from "@qorechain/sdk";

// "auto" is the default: the client simulates the hybrid transaction itself.
await tx.bankSend("qor1recipientaddress...", [{ denom: "uqor", amount: toBase("1.5") }]);
```

| 트랜잭션 | 일반적인 가스 | 가스당 0.15 uqor일 때의 수수료 예시 |
| --- | --- | --- |
| 하이브리드 서명 전송 | 약 160,000 ~ 240,000 | 24,000 ~ 36,000 uqor |
| 키 등록 | 약 600,000(설정할 한도) | 90,000 uqor |

**테스트넷에서 검증됨.** 2026년 11월 12일(릴리스 v3.2.8)에 500 QOR를 가진 새 eth-native 계정이 먼저 등록을 보냈습니다(SDK 0.13.0, 소유 증명과 함께 클래식 서명). 코드 0, 한도 600,000에서 사용 가스 299,233, 수수료 90,000 uqor였습니다. 이후 첫 하이브리드 서명 전송은 한도 400,000에서 187,494 가스를 사용했습니다(수수료 60,000 uqor). `GET /cosmos/tx/v1beta1/txs/{hash}`로 트랜잭션을 다시 읽으면 코드 0, 4,627바이트 ML-DSA-87 서명을 담은 `/qorechain.pqc.v1.PQCHybridSignature` 확장, 그리고 `pqc_verify`(`hybrid_mode=required`)와 `pqc_hybrid_verify`(`status=verified`) 이벤트가 확인되었습니다. 등록이 첫 트랜잭션이어야 한다는 규칙은 체인 팀에서 받은 것이며, 다른 종류의 첫 트랜잭션은 시도하지 않았습니다.

네트워크 최저 수수료는 가스 1단위당 0.1 uqor입니다. v3.2.8부터 멤풀은 가스당 수수료 순으로 트랜잭션을 정렬하므로, 최저 수수료보다 조금 더 지불하면 블록이 붐빌 때 트랜잭션이 다른 트랜잭션 뒤에서 기다리지 않습니다.

### 등록을 건너뛰면 보이는 현상

| 보이는 현상 | 의미 | 대처 방법 |
| --- | --- | --- |
| 계정에 등록된 PQC 키가 없거나 하이브리드 서명이 있어야 한다는 거부(모듈 `pqc`, 코드 8. SDK는 `pqc_key_required`로 보고) | 계정에 아직 등록된 키가 없습니다 | 위와 같이 키를 등록한 다음 다시 보내세요 |
| 등록이 `already registered`로 거부됨(모듈 `pqc`, 코드 7) | 계정이 이미 키를 보유하고 있습니다 | 할 일 없음. `GET /qorechain/pqc/v1/account/{address}`로 등록 정보를 읽거나 `ensurePqcRegistered`를 사용하세요(다른 키라면 `PqcKeyMismatchError`를 던집니다) |

[SDK 퀵스타트](/sdk/quickstart), [포스트 퀀텀 서명](/developer-guide/post-quantum-signing), [지갑 설정](/getting-started/wallet-setup)도 참고하세요.

## 트랜잭션 조회하기

해시로 완료된 트랜잭션을 조회합니다.

```bash
qorechaind query tx <txhash>
```

출력에는 트랜잭션 상태, 사용된 가스, 블록 높이, 그리고 실행 중 발생한 모든 이벤트가 포함됩니다.

JSON 형식으로 출력하려면 다음과 같이 합니다.

```bash
qorechaind query tx <txhash> --output json
```

## JSON-RPC 사용하기 (EVM)

QoreChain의 EVM 실행 환경은 `8545` 포트에서 표준 이더리움 JSON-RPC 인터페이스를 제공합니다.

:::caution EVM 트랜잭션에는 승인 윈도우가 필요합니다
표준 이더리움 서명 방식(MetaMask, ethers.js 등)은 여전히 수정 없이 그대로 동작하지만, v3.2.0부터 EVM 레인은 **등록된 포스트 퀀텀 키**와 **열려 있는 EVM 승인 윈도우**가 있는 계정의 트랜잭션만 받아들입니다. 먼저 윈도우를 여세요(ML-DSA 키로 서명하는 Cosmos 레인 트랜잭션입니다). 아래 [EVM 승인 윈도우](#evm-window)를 참고하세요. 윈도우가 없으면 노드가 `no open EVM authorisation window`라고 응답합니다. 상태 읽기(`eth_blockNumber`, `eth_getBalance`, `eth_call`, `eth_estimateGas`)에는 윈도우가 필요 없습니다.
:::

### 최신 블록 번호 가져오기

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }' | jq '.result'
```

### 계정 잔액 가져오기

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0xYourEVMAddress", "latest"],
    "id": 1
  }' | jq '.result'
```

잔액은 최소 단위의 16진수(hex) 인코딩 값으로 반환됩니다.

### EVM 승인 윈도우 {#evm-window}

체인 릴리스 **v3.2.0**(메인넷 높이 2,981,742, 2026년 9월 25일, 테스트넷 높이 5,920,000)부터 EVM 레인은 다음 조건을 모두 충족하는 계정의 트랜잭션만 받아들입니다.

1. **등록된 포스트 퀀텀 키**(ML-DSA-87)가 있고,
2. 트랜잭션을 수용할 여유가 남은 **열려 있는 EVM 승인 윈도우**가 있어야 합니다.

EVM 레인의 나머지 부분은 달라지지 않았습니다. MetaMask, ethers.js, Hardhat, Foundry로 계속 서명하며, `eth_estimateGas`를 비롯한 시뮬레이션은 윈도우 없이도 동작합니다. 컨트랙트 배포도 다른 EVM 트랜잭션과 똑같이 취급되므로, 배포 전에 윈도우가 필요합니다.

**왜 윈도우가 필요한가요?** 표준 지갑은 이더리움 트랜잭션에 secp256k1 서명 하나만 하며, 애플리케이션이 두 번째 포스트 퀀텀 서명을 덧붙일 방법을 제공하지 않습니다. 그래서 포스트 퀀텀 승인이 트랜잭션보다 *먼저* 전달됩니다. ML-DSA 서명을 실을 수 있는 일반 Cosmos 레인 트랜잭션으로 한도가 있는 윈도우를 열면, EVM 레인이 그 윈도우에 포함되는 트랜잭션을 받아들입니다. 클래식 키만으로는 윈도우를 열 수 없으므로, 클래식 키가 탈취되더라도 EVM 레인에서는 이미 열린 윈도우가 허용하는 범위 안에서만 행동할 수 있습니다. approval과 비슷하게 동작합니다. 한정된 횟수의 트랜잭션과 한정된 금액의 네이티브 QOR을 한정된 시간 동안 승인한 다음, 평소처럼 거래하면 됩니다. 윈도우는 토큰 금액이나 컨트랙트가 이미 보유한 approval을 제한하지 않습니다.

**윈도우가 제한하는 것.** 세 가지 한도가 동시에 적용되며, 먼저 소진되는 한도가 윈도우를 닫습니다.

| 한도 | 의미 | 허용 범위 |
| --- | --- | --- |
| `blocks` | 윈도우를 여는 블록부터 계산해 윈도우가 열려 있는 기간 | 1 – 17,280 |
| `max-txs` | 윈도우가 받아들이는 EVM 트랜잭션 수 | 1 – 1,000 |
| `max-value` | 윈도우가 받아들이는 총 유출량(uqor 단위): 전송 금액 **더하기** 각 트랜잭션이 지불할 수 있는 최대 수수료(가스 한도 × 수수료 상한), 올림 처리 | 0 초과 |

* 17,280 블록은 메인넷에서 약 15시간(블록당 약 3.1초), 테스트넷에서 약 6시간(블록당 약 1.3초)입니다.
* 받아들여진 뒤 실패한 트랜잭션도 슬롯과 금액 예산을 소모합니다.
* 새 윈도우를 열면 이전 윈도우를 **대체**하며, 소비량은 0부터 다시 시작합니다.
* CLI는 `max-value`를 `uqor` 또는 `qor` 단위로 받습니다(`1000qor` = 1,000,000,000 uqor).
* 금액 한도는 네이티브 QOR만 집계합니다. 토큰 전송, approval, 그 밖의 컨트랙트 호출은 금액이 0입니다. 범위(아래)는 윈도우가 받아들이는 수신자를 좁히지만, 토큰 금액을 제한하지는 않습니다.

**1단계 — 포스트 퀀텀 키 등록**(한 번만): 위의 [포스트 퀀텀 키 등록하기](#register-pqc-key)를 참고하세요.

**2단계 — 윈도우 열기.** 윈도우 열기는 Cosmos 레인 트랜잭션이므로, 서명 없이 먼저 만든 다음 공동 서명합니다.

```bash
# at most 1000 QOR in total, at most 20 transactions, for 7,200 blocks (about 6.4 hours on mainnet)
qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 60000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**범위 좁히기(v3.2.3 이상).** 두 개의 선택적 플래그로 열린 윈도우가 받아들이는 대상을 제한할 수 있습니다. `--native-only`는 일반 네이티브 QOR 전송만 허용하고(calldata 없음, 컨트랙트 생성 없음, 코드를 가진 수신자 없음), `--allowed-targets 0xAAA...,0xBBB...`는 해당 수신자로 가는 트랜잭션만 허용합니다(최대 16개이며, 이 경우 컨트랙트 생성은 거부됩니다). 예를 들면 다음과 같습니다.

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 60000uqor --generate-only > window.json
```

`--allowed-targets`는 윈도우가 건드릴 수 있는 컨트랙트와 토큰을 **어느 것으로** 제한할 뿐, **얼마나**는 제한하지 않습니다. 나열된 토큰은 `approve`를 포함해 그 토큰의 어떤 금액도 허용하며, 나열된 컨트랙트는 자신의 코드와 기존 승인이 허용하는 것을 모두 옮길 수 있으므로, 범용 포워더나 라우터 컨트랙트는 나열하지 마세요. 윈도우는 EVM 레인의(고전 서명) 트랜잭션만 제한하며, 크로스 VM 호출과 authz처럼 하이브리드 PQC 서명으로 서명된 Cosmos 메시지는 윈도우 밖에 있습니다.

메인넷에서 윈도우를 여는 데는 약 180,000 가스가 사용되었습니다. [QoreX](/qorex/security-and-recovery#evm-window)에서는 같은 단계가 **설정 → 보안 → EVM 액세스 윈도우**(앱) 또는 **EVM 액세스 윈도우** 버튼(확장 프로그램)입니다. 윈도우를 열면 계정 nonce가 증가하므로, 지갑에서 EVM 트랜잭션을 준비하기 **전에** 윈도우를 여세요.

**3단계 — 남은 한도 확인:**

```bash
qorechaind query pqc evm-window qor1youraddress...
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/qor1youraddress...
```

윈도우가 없는 주소에 대해서도 REST 응답은 실패하지 않으며 `found: false`를 반환합니다. 필드는 `found`, `live`, `opened_height`, `expiry_height`, `max_txs`, `used_txs`, `max_value`, `used_value`, `remaining_blocks`, `remaining_txs`, `remaining_value`입니다(uqor 정수, 문자열로 반환). 메인넷에서는 `https://api.qore.host`를 사용하세요.

**4단계 — EVM 레인을 평소처럼 사용.** MetaMask나 사용 중인 툴링에서 평소처럼 전송하세요. 각 트랜잭션은 윈도우에서 트랜잭션 슬롯 하나와 (금액 + 최대 수수료)를 소모합니다.

**윈도우를 일찍 닫기.** 클래식 키가 탈취되었다고 의심되면 윈도우를 닫으세요. 윈도우가 아직 허용하고 있던 것은 다음 블록부터 거부됩니다. 윈도우를 닫으면 보류 중인 EIP-7702 위임 동의도 함께 철회됩니다(v3.2.2부터. 계정의 코드를 변경하는 type-4 트랜잭션은 포스트 퀀텀 `authorize-evm-delegation` 동의가 있어야만 허용됩니다).

```bash
qorechaind tx pqc close-evm-window --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 60000uqor --generate-only > close.json
qorechaind tx pqc cosign close.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**오류**

| 표시되는 내용 | 의미 | 해야 할 일 |
| --- | --- | --- |
| `no open EVM authorisation window; open one with MsgOpenEVMWindow ...` (모듈 `pqc`, code 26) | 이 계정에 윈도우가 없음 | 2단계 |
| `... has no registered post-quantum key; the EVM lane requires one` (EVM 레인에서는 code 26, 윈도우를 열려고 하면 code 28) | 등록된 ML-DSA 키가 없음 | 1단계 |
| `the EVM authorisation window for ... does not admit this transaction (remaining: ...)` (code 27) | 만료되었거나 소진됨. 메시지에 어느 한도인지 표시됨 | 새 윈도우 열기 |
| `invalid EVM authorisation window` (code 28) | 한도가 허용 범위를 벗어남(`blocks` 1–17,280, `max-txs` 1–1,000, `max-value` > 0) | 인자 수정 |

코드에서는 QoreChain SDK와 `@qorechain/wallet-adapter`가 열기/닫기 메시지를 구성하고 윈도우 상태를 읽을 수 있습니다. [SDK 문서](/sdk/overview)를 참고하세요.

윈도우는 EVM 레인에만 적용됩니다. Cosmos 레인 트랜잭션은 이미 모든 트랜잭션에 하이브리드 서명을 담고 있으며, 윈도우를 한 번도 열지 않으면 EVM 트랜잭션은 거부될 뿐 다른 것은 달라지지 않습니다.

## SVM RPC 사용하기

QoreChain의 SVM 실행 환경은 `8899` 포트에서 Solana 호환 RPC 인터페이스를 제공합니다. SVM 트랜잭션 레인은 현재 네트워크 전역에서 비활성화되어 있으므로, 지금 사용할 수 있는 것은 아래의 읽기 메서드입니다.

### 현재 슬롯 가져오기

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getSlot",
    "id": 1
  }' | jq '.result'
```

### 계정 잔액 가져오기

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["YourSVMPublicKey"],
    "id": 1
  }' | jq '.result'
```

## 자주 쓰는 CLI 패턴

`qorechaind` CLI를 사용할 때 자주 쓰이는 플래그는 다음과 같습니다.

| 플래그               | 설명                        | 예시                              |
| ------------------ | ----------------------------- | ------------------------------ |
| `--chain-id`       | 대상 체인을 지정합니다              | `--chain-id qorechain-diana`   |
| `--fees`           | uqor 단위의 트랜잭션 수수료(가스 한도 × 최소 0.1) | `--fees 40000uqor`  |
| `--from`           | 서명에 사용할 키 이름 또는 주소       | `--from mykey`                 |
| `--output`         | 응답 형식                       | `--output json`                |
| `--node`           | 연결할 RPC 엔드포인트              | `--node tcp://localhost:26657` |
| `--gas`            | 트랜잭션의 가스 한도                | `--gas 400000` (또는 `--gas auto`) |
| `--gas-adjustment` | 추정 가스에 곱하는 배수             | `--gas-adjustment 1.5`         |
| `--gas-prices`     | `--fees` 대신 사용하는 가스 가격    | `--gas-prices 0.1uqor`         |
| `--generate-only`  | 서명되지 않은 트랜잭션을 출력(`tx pqc cosign` 전에 필요) | `--generate-only` |
| `-y`               | 확인 프롬프트 건너뛰기              | `-y`                           |

### 예시: 일반적인 플래그를 모두 사용한 전체 명령어

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 60000uqor \
  --node tcp://localhost:26657 \
  --output json \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

## 다음 단계

첫 트랜잭션을 성공적으로 보냈다면, QoreChain이 제공하는 다른 기능들도 살펴보세요.

* **스테이킹과 위임(Delegation)** — QOR을 스테이킹하고 보상을 받아보세요
* **자산 브리징** — 여러 체인 간에 자산을 이동시켜 보세요
* **EVM 개발** — QoreChain에서 Solidity 스마트 컨트랙트를 배포해 보세요
