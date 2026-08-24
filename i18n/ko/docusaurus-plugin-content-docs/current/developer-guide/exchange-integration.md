---
slug: /developer-guide/exchange-integration
title: 거래소 및 통합사 가이드
sidebar_label: 거래소 통합
sidebar_position: 11
---

# 거래소 및 통합사 가이드

거래소, 커스터디, 결제 통합사가 QOR을 상장하고 입출금을 처리하는 데 필요한 모든 것: 인터페이스 선택, 안전한 입금 감지, 출금 서명까지 다룹니다.

:::note
이 가이드는 **`qorechain-vladi`** 메인넷(체인 버전 **v3.1.92**)을 대상으로 합니다. 먼저 **`qorechain-diana`** 테스트넷에서 전체 흐름을 리허설하세요 — 두 네트워크의 엔드포인트는 [네트워크](/appendix/networks#public-endpoints)에서 확인할 수 있습니다. 자체 풀 노드를 운영한다면 현재 체인 버전으로 유지하세요 — 오래된 노드는 최신 트랜잭션 타입을 디코딩하지 못하고 동기화가 멈춥니다.
:::

## 통합 경로 선택 {#choosing-a-path}

QoreChain은 **하나의 통합된 네이티브 QOR 잔액**을 세 가지 인터페이스로 노출하는 단일 체인입니다. **동일한 개인 키가 동일한 자금**을 Cosmos(`qor1...`), EVM(`0x...`), SVM(base58) 주소 아래에서 제어하므로, 여러분의 스택에 맞는 인터페이스를 선택하면 됩니다.

| | **A) Cosmos (네이티브)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| 주소 | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (동일 키) |
| 소수 자릿수 (네이티브 QOR) | **6** (`uqor`) | **18** (wei 방식) | **9** (lamports; 1 uqor = 1,000 lamports) |
| 도구 | Cosmos SDK / CosmJS | **표준 Ethereum** (ethers/web3, MetaMask) | `@solana/web3.js` |
| 출금 서명 | **하이브리드 PQC 필수** (ML-DSA-87 + secp256k1) | **표준 secp256k1 / EIP-155 — PQC 불필요** | Cosmos 트랜잭션 또는 온-노드 제출을 통해 |
| 메모/태그 지원 | **가능** (공유 주소 + 메모) | 불가 (사용자당 하나의 주소) | 불가 (사용자당 하나의 주소) |
| 입금 감지 | `MsgSend` 이벤트 스캔 | `eth_getBlockByNumber`로 블록 스캔 | `getBalance` / `getSignaturesForAddress` |
| 적합한 대상 | Cosmos 네이티브 플랫폼 | **기존 EVM 통합을 보유한 플랫폼** | Solana 툴링 플랫폼 |

**권장 사항:** 이미 EVM 체인을 지원한다면 **경로 B(EVM)**가 가장 적은 노력으로 통합할 수 있는 방법입니다 — 표준 Ethereum 툴링을 그대로 사용하며, **출금에 양자내성 서명이 필요하지 않습니다** (EVM ante 경로는 예외 대상입니다). 경로 A(Cosmos)는 메모 기반 공유 입금 주소를 사용하는 네이티브 경로입니다. 경로 C(SVM)는 서류상으로는 완전한 네이티브 QOR 인터페이스이지만, **해당 트랜잭션 레인은 현재 네트워크 전역에서 비활성화되어 있습니다** ([경로 C](#path-c-svm) 참고) — 재개될 때까지는 경로 A 또는 경로 B를 사용하세요.

세 인터페이스는 **상호 배타적이지 않습니다** — 동일 키의 `0x`, `qor1`, SVM 형태로 전송된 자금은 모두 같은 잔액입니다.

## 노드 운영 {#node}

프로덕션 통합에서는 서드파티 엔드포인트가 아니라 **자체 동기화 노드**를 기준으로 입금을 검증해야 합니다. [메인넷 연결하기](/getting-started/connecting-to-mainnet)를 따르세요 — 사전 빌드된 바이너리 번들(SHA-256 체크섬 포함), 제네시스, 퍼블릭 피어, 수수료 하한(`0.1uqor`), 게시된 체인 데이터 스냅샷을 통한 빠른 부트스트랩까지 다룹니다. 비검증 풀 노드를 운영하는 데는 라이선스가 필요하지 않습니다.

QoreChain은 **즉시 완결성**(리오그 없음)을 가지므로 **1회 확인이면 최종 확정**입니다. 1~2블록을 기다리면 운영상 여유를 더 확보할 수 있습니다.

## 경로 A — Cosmos (네이티브) {#path-a-cosmos}

기본 REST URL: `https://api.qore.host` (또는 자체 노드에서 `http://localhost:1317`).

### 입금 감시

```bash
# latest height
curl -s https://rpc.qore.host/status | jq -r .result.sync_info.latest_block_height

# all txs in a height (deposit scanning)
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs/block/{HEIGHT}" | jq '.txs'

# incoming transfers to an address
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&pagination.limit=50" | jq '.tx_responses[].txhash'

# balance (uqor — divide by 1e6 for QOR)
curl -s "https://api.qore.host/cosmos/bank/v1beta1/balances/qor1.../by_denom?denom=uqor" | jq -r .balance.amount
```

### 가짜 입금 방지 체크리스트 {#anti-fake-deposit}

다음 조건을 **모두** 만족할 때만 입금을 인정하세요:

1. **`tx_response.code == 0`** — 트랜잭션이 성공했을 때. 실패한 트랜잭션은 절대 인정하지 마세요.
2. 메시지가 **`/cosmos.bank.v1beta1.MsgSend`**(또는 `MsgMultiSend`의 출력)일 것 — 컨트랙트 호출이나 다른 모듈이 아닐 것.
3. **`to_address`**가 여러분의 입금 주소와 일치하고, (공유 주소 모델의 경우) **`memo`**가 해당 사용자와 일치할 것.
4. **`denom == "uqor"`**이고 `amount`가 인정할 금액일 것(uqor → QOR로 환산하려면 10⁶으로 나눔). 다른 denom은 거부하세요.
5. 트랜잭션이 **커밋된 블록**에 있을 것(`height`가 존재하고 최신 커밋 높이 이하). 완결성은 즉시이므로 1회 확인이면 최종 확정이며, 여유를 위해 1~2블록을 기다리세요.
6. **전송 이벤트**(`coin_received` / `coin_spent`)로부터 금액을 다시 계산하여 메시지 금액과 교차 검증하세요 — 단일 필드나 메모만 믿지 마세요.
7. 여러분의 **자체** 동기화 노드에서 `GET /cosmos/tx/v1beta1/txs/{hash}`를 통해 트랜잭션 해시가 존재하는지 확인하세요.

### 출금 — 하이브리드 PQC 서명 {#cosmos-withdrawals}

메인넷은 Cosmos 트랜잭션에 대해 **양자내성 서명**을 강제합니다(`allow_classical_fallback = false`). 모든 출금에는 ML-DSA-87(Dilithium-5, FIPS-204) **더하기** secp256k1로 구성된 **하이브리드 서명**이 필요합니다. 입금은 이 과정이 필요하지 않습니다(체인을 감시하기만 하면 됩니다).

서명 라이브러리는 [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter)(npm)이며, FIPS-204 프리미티브를 위해 `@qorechain/pqc`를 함께 사용합니다:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

서명은 **2단계** 흐름입니다 (`qorechaind tx pqc cosign`과 동일한 방식):

**1단계 — 핫월렛당 최초 1회: ML-DSA-87 키를 등록합니다.** 이 등록 트랜잭션 한 건만 **클래식 서명**으로 처리됩니다(부트스트랩 예외): 메시지 `/qorechain.pqc.v1.MsgRegisterPQCKeyV2`에 `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`를 담습니다. ML-DSA 키는 결정론적으로 파생하여 기존 시크릿으로부터 복구 가능하게 하세요 — 예: `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` 후 `mldsa.keygen(seed)` — 그리고 이 시드를 핫월렛 키와 함께 보관하세요.

**2단계 — 이후 모든 출금: `MsgSend`를 하이브리드 서명합니다.** 어댑터는 일반적인 secp256k1 `signDirect` *이전에* ML-DSA-87 서명을 트랜잭션 본문 확장(tx-body extension)에 포함시키므로 기존 서명 로직은 변경할 필요가 없습니다:

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  address, pubkeySecp256k1, accountNumber, pqc });
const txBytes = await signer.signHybrid({
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress,
      amount: [{ denom: "uqor", amount: "1000000" }] })).finish() }],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gasLimit: 400000n },
  sequence });
```

서명된 바이트를 브로드캐스트합니다:

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 8 "classical fallback not allowed" => step 1 not done yet for this account
```

이후 `GET /cosmos/tx/v1beta1/txs/{hash}`를 폴링하여 `code == 0`으로 블록에 포함될 때까지 기다리세요.

HSM이나 다른 언어로 작성한 커스텀 서명기를 사용하는 경우, 독립형 [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) FIPS-204 라이브러리(npm, PyPI, crates.io, Maven Central, Go)를 사용하여 동일한 확장을 조립하세요. ML-DSA 서명은 **반드시 결정론적**이어야 하며(FIPS-204 §3.4) — [결정론적 서명](/developer-guide/post-quantum-signing#deterministic-signing) 참고 — 체인은 헤지드(hedged) 서명을 거부합니다.

### 서버 사이드 대안: `@qorechain/chain-bridge` {#chain-bridge}

브라우저 지갑 없이 완전히 서버 사이드에서 동작하는 핫월렛 워커의 경우, **`@qorechain/chain-bridge`**(npm)가 키 파생, 최초 사용 시 PQC 자동 등록, 하이브리드 서명, 브로드캐스트까지 전체 흐름을 하나의 호출로 감쌉니다. 순수 JavaScript로 작성되어(네이티브 애드온 없음) 서버리스 워커에 적합합니다:

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc.qore.host",       // or your own node
  chainId: "qorechain-vladi",
  signerMnemonic: process.env.HOT_WALLET_MNEMONIC,  // from your secrets manager
});

// One call: derives the canonical ML-DSA-87 key, auto-registers it if missing,
// hybrid-signs the MsgSend, and broadcasts. Amounts are in uqor (6 decimals).
const { txHash } = await bridge.sendTokens({
  to: "qor1recipient...",
  amountUqor: "1000000",   // 1 QOR
});
```

`chain-bridge`(≥0.1.1)는 스택의 나머지 부분과 동일한 표준 주소 결합 PQC 파생 방식을 사용합니다 — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — 따라서 니모닉으로부터 `qorechaind tx pqc recover-key`를 통해 키를 복구할 수 있습니다. 이전 버전 도구로 등록된 계정도 자동으로 처리되며(레거시 키 폴백), [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation)를 통해 표준 키로 한 번에 마이그레이션할 수 있습니다.

## 경로 B — EVM {#path-b-evm}

`https://evm.qore.host`(체인 ID **9801**) 또는 자체 노드의 8545 포트를 대상으로 하는 표준 Ethereum 통합입니다.

* **소수 자릿수:** EVM 레일에서 네이티브 QOR은 **18 소수 자릿수**입니다(1 uqor = 10¹² wei). 이를 잘못 처리하면 입금이 10¹² 배로 잘못 인정됩니다.
* **입금:** `eth_getBlockByNumber`로 블록을 스캔하여 여러분의 주소로의 네이티브 전송을 찾고, `eth_getTransactionReceipt`(`status == 0x1`)로 확인하세요.
* **출금:** 표준 secp256k1 / EIP-155 서명이며 — EVM ante 경로에서는 **PQC가 필요하지 않습니다**. 어떤 Ethereum 서명 스택도 변경 없이 그대로 동작합니다.
* **가짜 입금 방지:** 영수증 상태를 검증하고, 이동한 값이 인덱싱하지 않는 ERC-20 이벤트가 아니라 **네이티브** 전송인지 확인하며, 자체 노드로 재확인하세요.
* **주소 매핑:** `0x` 주소와 `qor1` 주소는 동일한 계정의 두 가지 인코딩이며 자금이 공유됩니다. [EVM 개발](/developer-guide/evm-development) 참고.

## 경로 C — SVM (Solana 호환) {#path-c-svm}

:::caution SVM 레인 현재 비활성화됨
SVM 실행 레인은 체인 버전 v3.1.89(8월 22일)부터 **트랜잭션 제출에 한해 네트워크 전역에서 현재 비활성화**되어 있습니다 — 이 레인으로 보내는 모든 트랜잭션은 `code 11, "SVM module is disabled"`를 반환합니다. 레인이 재개되기 전까지는 경로 C 위에 입출금 레일을 구축하지 **마세요**. 대신 **경로 A(Cosmos)** 또는 **경로 B(EVM)**를 사용하세요. 읽기 전용 요청(예: `getBalance`)은 계속 응답할 수 있지만, 트랜잭션 제출이 비활성화된 동안에는 SVM 기반의 입금 감지나 출금 흐름을 구축하지 마세요.
:::

v3.1.82부터 SVM 인터페이스는 **네이티브 QOR**을 제공합니다([SVM 인터페이스의 네이티브 QOR](/developer-guide/svm-development#native-qor) 참고):

* **잔액:** `getBalance`는 lamports를 반환합니다(QOR로 환산하려면 10⁹으로 나눔; 1 uqor = 1,000 lamports).
* **입금:** `getSignaturesForAddress`가 주소의 트랜잭션 이력을 제공하며, System Program 전송이 네이티브 QOR을 이동시킵니다.
* 퍼블릭 엔드포인트(`https://svm.qore.host`, `https://svm-testnet.qore.host`)는 **읽기 전용**입니다. 트랜잭션은 자체 노드를 통해 제출하세요.

## 흐름 요약 {#flow-summary}

| 작업 | 경로 | 서명 필요 여부 |
|---|---|---|
| **입금** (사용자 → 플랫폼) | 자체 동기화 노드에서 여러분의 주소로의 전송을 감시(Cosmos의 경우 + 메모) | 불필요 — 감시만 하면 됨 |
| **출금** (플랫폼 → 사용자) | 전송을 구성하고, 오프라인으로 서명한 뒤, 브로드캐스트 | Cosmos: 하이브리드 PQC · EVM: 표준 secp256k1 |
| **잔액 / 스윕** | REST / EVM / SVM 잔액 조회 + 전송 | 스윕에만 서명 필요 |

## 관련 문서

* [메인넷 연결하기](/getting-started/connecting-to-mainnet) — 노드 설정, 다운로드, 스냅샷
* [노드 운영하기](/developer-guide/running-a-node) — 배포, 프루닝, 인덱싱
* [양자내성 서명](/developer-guide/post-quantum-signing) — 하이브리드 출금을 뒷받침하는 FIPS-204 라이브러리
* [네트워크](/appendix/networks) — 인터페이스별 체인 ID, 엔드포인트, 소수 자릿수
