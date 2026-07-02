---
slug: /developer-guide/exchange-integration
title: 거래소 및 통합자 가이드
sidebar_label: 거래소 통합
sidebar_position: 11
---

# 거래소 및 통합자 가이드

거래소, 커스터디언, 결제 통합자가 QOR을 상장하고 입출금을 처리하는 데 필요한 모든 것: 인터페이스 선택, 안전한 입금 감지, 출금 서명.

:::note
이 가이드는 **`qorechain-vladi`** 메인넷(체인 버전 **v3.1.82**)을 대상으로 합니다. 먼저 **`qorechain-diana`** 테스트넷에서 전체 흐름을 리허설하세요 — 두 네트워크의 엔드포인트는 [네트워크](/appendix/networks#public-endpoints)에 있습니다.
:::

## 통합 경로 선택 {#choosing-a-path}

QoreChain은 세 가지 인터페이스를 통해 노출되는 **하나의 통합된 네이티브 QOR 잔액**을 가진 단일 체인입니다. **동일한 개인 키가 동일한 자금을 제어**하며, Cosmos(`qor1...`), EVM(`0x...`), SVM(base58) 주소 아래에서 모두 동일합니다 — 여러분의 스택에 맞는 인터페이스를 선택하면 됩니다.

| | **A) Cosmos (네이티브)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| 주소 | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (동일 키) |
| 소수 자릿수 (네이티브 QOR) | **6** (`uqor`) | **18** (wei 방식) | **9** (lamports; 1 uqor = 1,000 lamports) |
| 툴링 | Cosmos SDK / CosmJS | **표준 Ethereum** (ethers/web3, MetaMask) | `@solana/web3.js` |
| 출금 서명 | **하이브리드 PQC 필수** (ML-DSA-87 + secp256k1) | **표준 secp256k1 / EIP-155 — PQC 불필요** | Cosmos tx 또는 노드 직접 제출 |
| 메모 / 태그 지원 | **예** (공유 주소 + 메모) | 아니요 (사용자당 주소 1개) | 아니요 (사용자당 주소 1개) |
| 입금 감지 | `MsgSend` 이벤트 스캔 | `eth_getBlockByNumber`로 블록 스캔 | `getBalance` / `getSignaturesForAddress` |
| 적합한 대상 | Cosmos 네이티브 플랫폼 | **기존 EVM 통합을 보유한 플랫폼** | Solana 툴링 플랫폼 |

**권장 사항:** 이미 EVM 체인을 지원하고 있다면 **경로 B(EVM)**가 가장 적은 노력으로 통합할 수 있는 방법입니다 — 표준 Ethereum 툴링을 사용하며, **출금에 포스트 양자 서명이 필요하지 않습니다**(EVM ante 경로는 면제됨). 경로 A(Cosmos)는 메모 기반 공유 입금 주소를 사용하는 네이티브 경로입니다. 경로 C(SVM) 역시 완전한 네이티브 QOR 인터페이스입니다 — Solana 툴링을 특별히 선호한다면 선택하세요.

세 인터페이스는 **상호 배타적이지 않습니다** — 동일한 키의 `0x`, `qor1`, SVM 형태로 전송된 자금은 동일한 잔액입니다.

## 노드 실행 {#node}

프로덕션 통합에서는 서드파티 엔드포인트가 아니라 **자체적으로 동기화한 노드**에서 입금을 검증해야 합니다. [메인넷 연결](/getting-started/connecting-to-mainnet)을 따르세요 — 사전 빌드된 바이너리 번들(SHA-256 체크섬 포함), 제네시스, 공개 피어, 수수료 하한(`0.1uqor`), 그리고 게시된 체인 데이터 스냅샷을 통한 빠른 부트스트랩을 다룹니다. 비검증 풀 노드를 실행하는 데는 라이선스가 필요하지 않습니다.

QoreChain은 **즉시 파이널리티**(리오그 없음)를 가지므로 **1 컨펌이 곧 최종 확정**입니다. 1–2 블록을 기다리면 운영상 충분한 여유가 생깁니다.

## 경로 A — Cosmos (네이티브) {#path-a-cosmos}

기본 REST URL: `https://api.qore.host` (또는 자체 노드의 `http://localhost:1317`).

### 입금 모니터링

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

다음 사항이 **모두** 충족될 때**만** 입금을 인정하세요:

1. **`tx_response.code == 0`** — 트랜잭션이 성공했습니다. 실패한 tx는 절대 인정하지 마세요.
2. 메시지가 **`/cosmos.bank.v1beta1.MsgSend`** (또는 `MsgMultiSend` 출력)여야 합니다 — 컨트랙트 호출이나 다른 모듈이 아니어야 합니다.
3. **`to_address`**가 여러분의 입금 주소와 일치하고, (공유 주소 모델의 경우) **`memo`**가 해당 사용자와 일치해야 합니다.
4. **`denom == "uqor"`**이고 `amount`가 인정할 금액이어야 합니다(uqor → QOR로는 ÷ 10⁶). 다른 denom은 모두 거부하세요.
5. tx가 **커밋된 블록**에 포함되어 있어야 합니다(`height`가 존재하고 최신 커밋 높이 이하). 파이널리티는 즉시입니다 — 1 컨펌이 최종 확정이며, 여유를 위해 1–2 블록을 기다리세요.
6. **전송 이벤트**(`coin_received` / `coin_spent`)로부터 금액을 재계산하고 메시지의 금액과 교차 검증하세요 — 단일 필드나 메모만을 절대 신뢰하지 마세요.
7. **자체적으로** 동기화한 노드에 대해 `GET /cosmos/tx/v1beta1/txs/{hash}`로 tx 해시가 존재하는지 확인하세요.

### 출금 — 하이브리드 PQC 서명 {#cosmos-withdrawals}

메인넷은 cosmos 트랜잭션에 **포스트 양자 서명**을 강제합니다(`allow_classical_fallback = false`): 모든 출금에는 ML-DSA-87(Dilithium-5, FIPS-204) **및** secp256k1로 구성된 **하이브리드 서명**이 필요합니다. 입금에는 이것이 필요하지 **않습니다**(체인을 모니터링만 하면 됩니다).

서명 라이브러리는 [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm)이며, FIPS-204 프리미티브를 위해 `@qorechain/pqc`를 함께 가져옵니다:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

서명은 **2단계** 흐름입니다(`qorechaind tx pqc cosign`을 그대로 반영):

**1단계 — 핫 월렛당 한 번: ML-DSA-87 키 등록.** 이 단일 등록 트랜잭션은 **클래식 서명**을 사용합니다(부트스트랩 예외): 메시지 `/qorechain.pqc.v1.MsgRegisterPQCKeyV2`에 `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`를 담습니다. ML-DSA 키는 기존 시크릿으로부터 복구 가능하도록 결정론적으로 파생하세요 — 예: `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` 후 `mldsa.keygen(seed)` — 그리고 시드를 핫 월렛 키와 함께 보관하세요.

**2단계 — 이후의 모든 출금: `MsgSend`를 하이브리드 서명.** 어댑터는 일반적인 secp256k1 `signDirect` *이전에* ML-DSA-87 서명을 tx-body 확장에 삽입하므로, 기존 서명자는 변경 없이 그대로 유지됩니다:

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

그런 다음 `GET /cosmos/tx/v1beta1/txs/{hash}`를 폴링하여 `code == 0`으로 블록에 포함될 때까지 확인하세요.

HSM이나 다른 언어의 커스텀 서명자를 사용하는 경우, 독립형 [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) FIPS-204 라이브러리(npm, PyPI, crates.io, Maven Central, Go)를 사용해 동일한 확장을 조립하세요. ML-DSA 서명은 **반드시 결정론적**이어야 합니다(FIPS-204 §3.4) — [결정론적 서명](/developer-guide/post-quantum-signing#deterministic-signing)을 참조하세요. 체인은 hedged 서명을 거부합니다.

## 경로 B — EVM {#path-b-evm}

`https://evm.qore.host`(체인 ID **9801**) 또는 자체 노드의 8545 포트를 대상으로 하는 표준 Ethereum 통합입니다.

* **소수 자릿수:** 네이티브 QOR은 EVM 레일에서 **18자리 소수**입니다(1 uqor = 10¹² wei). 이를 잘못 처리하면 입금이 10¹² 배수로 잘못 인정됩니다.
* **입금:** `eth_getBlockByNumber`로 블록을 스캔하여 여러분의 주소로 향하는 네이티브 전송을 찾고, `eth_getTransactionReceipt`(`status == 0x1`)로 확인하세요.
* **출금:** 표준 secp256k1 / EIP-155 서명 — EVM ante 경로에서는 **PQC가 필요하지 않습니다**. 기존 Ethereum 서명 스택이 변경 없이 그대로 작동합니다.
* **가짜 입금 방지:** 영수증 상태를 확인하고, 이동한 값이 (인덱싱하지 않는 ERC-20 이벤트가 아닌) **네이티브** 전송인지 검증하며, 자체 노드에 대해 확인하세요.
* **주소 매핑:** `0x` 주소와 `qor1` 주소는 동일한 계정의 두 가지 인코딩입니다 — 자금은 공유됩니다. [EVM 개발](/developer-guide/evm-development)을 참조하세요.

## 경로 C — SVM (Solana 호환) {#path-c-svm}

v3.1.82부터 SVM 인터페이스는 **네이티브 QOR**을 제공합니다([SVM 인터페이스의 네이티브 QOR](/developer-guide/svm-development#native-qor) 참조):

* **잔액:** `getBalance`는 lamports를 반환합니다(QOR로는 ÷ 10⁹; 1 uqor = 1,000 lamports).
* **입금:** `getSignaturesForAddress`가 주소의 트랜잭션 히스토리를 제공합니다. System Program 전송이 네이티브 QOR을 이동시킵니다.
* 공개 엔드포인트(`https://svm.qore.host`, `https://svm-testnet.qore.host`)는 **읽기 전용**입니다. 트랜잭션은 자체 노드를 통해 제출하세요.

## 흐름 요약 {#flow-summary}

| 작업 | 경로 | 서명 필요 여부 |
|---|---|---|
| **입금** (사용자 → 플랫폼) | 동기화된 자체 노드에서 여러분의 주소로 향하는 전송을 모니터링 (Cosmos에서는 + 메모) | 아니요 — 모니터링만 |
| **출금** (플랫폼 → 사용자) | 전송을 구성하고 오프라인으로 서명한 뒤 브로드캐스트 | Cosmos: 하이브리드 PQC · EVM: 표준 secp256k1 |
| **잔액 / 스윕** | REST / EVM / SVM 잔액 조회 + 전송 | 스윕 시에만 서명 |

## 관련 문서

* [메인넷 연결](/getting-started/connecting-to-mainnet) — 노드 설정, 다운로드, 스냅샷
* [노드 실행](/developer-guide/running-a-node) — 배포, 프루닝, 인덱싱
* [포스트 양자 서명](/developer-guide/post-quantum-signing) — 하이브리드 출금을 뒷받침하는 FIPS-204 라이브러리
* [네트워크](/appendix/networks) — 인터페이스별 체인 ID, 엔드포인트, 소수 자릿수
