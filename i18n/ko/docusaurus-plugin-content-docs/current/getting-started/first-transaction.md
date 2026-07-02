---
slug: /getting-started/first-transaction
title: 첫 트랜잭션
sidebar_label: 첫 트랜잭션
sidebar_position: 5
---

# 첫 트랜잭션

이 가이드는 QOR 토큰 전송, 트랜잭션 조회, 그리고 네이티브, EVM, SVM 인터페이스 전반에 걸친 QoreChain과의 상호작용을 단계별로 안내합니다.

:::note
아래 명령은 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 사용합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 2026년 6월 7일부터 운영 중입니다 — 메인넷에서 트랜잭션을 보낼 때는 **메인넷 연결하기** 페이지의 메인넷 체인 ID와 엔드포인트로 대체하세요.
:::

## 잔액 확인

토큰을 보내기 전에 계정 잔액을 확인하세요.

```bash
qorechaind query bank balances qor1youraddress... --output json
```

응답에는 계정이 보유한 모든 토큰 단위가 포함됩니다. QOR 잔액은 `uqor`(마이크로-QOR)로 표시되며, **1 QOR = 1,000,000 uqor**입니다.

## QOR 전송

키에서 다른 주소로 토큰을 전송하세요.

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

이 명령은 수신자 주소로 **1 QOR**(1,000,000 uqor)를 보내며, 500 uqor의 수수료를 지불합니다.

:::caution Cosmos 전송에는 하이브리드 PQC 서명이 필요합니다
cosmos 경로에서 네트워크 기본값은 `hybrid_signature_mode = required`입니다(현재 체인 버전 **v3.1.82**). 일반 클래식 `tx bank send`는 **거부됩니다** — 모든 cosmos 경로 트랜잭션은 secp256k1 서명과 함께 ML-DSA-87(Dilithium-5) 서명을 포함해야 합니다. `qorechaind tx pqc gen-key`로 Dilithium-5 키를 생성한 다음, `qorechaind tx pqc cosign`으로 하이브리드 공동 서명을 첨부하세요(또는 QoreChain SDK의 `buildHybridTx`로 트랜잭션을 빌드하고 `includePqcPublicKey`를 사용하여 첫 사용 시 키가 자동 등록되도록 하세요). CLI 외부에서 하이브리드 서명을 생성하려면, 오픈소스 [**qorechain-pqc**](/developer-guide/post-quantum-signing) 라이브러리(`hybridSignBytes`)와 QoreChain SDK가 코드에서 동일한 작업을 수행합니다. 전체 하이브리드 흐름은 [지갑 설정](/getting-started/wallet-setup)을 참조하세요.
:::

트랜잭션이 브로드캐스트되기 전에 확인하라는 메시지가 표시됩니다. 확인되면 CLI가 트랜잭션 해시를 반환합니다.

## 트랜잭션 조회

완료된 트랜잭션을 해시로 조회하세요.

```bash
qorechaind query tx <txhash>
```

출력에는 트랜잭션 상태, 사용된 가스, 블록 높이, 실행 중 발생한 모든 이벤트가 포함됩니다.

JSON 출력의 경우:

```bash
qorechaind query tx <txhash> --output json
```

## JSON-RPC 사용 (EVM)

QoreChain의 EVM 실행 환경은 포트 `8545`에서 표준 Ethereum JSON-RPC 인터페이스를 노출합니다.

:::note
EVM 트랜잭션은 cosmos 경로의 하이브리드 PQC 요구 사항의 **영향을 받지 않습니다**. 별도의 `eth_secp256k1` ante 경로를 사용하므로, 표준 Ethereum 서명(MetaMask, ethers.js 등)이 PQC 확장 없이 작동합니다.
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

잔액은 가장 작은 단위로 hex 인코딩된 값으로 반환됩니다.

## SVM RPC 사용

QoreChain의 SVM 실행 환경은 포트 `8899`에서 Solana 호환 RPC 인터페이스를 노출합니다.

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

## 일반적인 CLI 패턴

`qorechaind` CLI로 작업할 때 다음 플래그가 자주 사용됩니다.

| 플래그             | 설명                          | 예시                           |
| ------------------ | ----------------------------- | ------------------------------ |
| `--chain-id`       | 대상 체인 지정                | `--chain-id qorechain-diana`   |
| `--fees`           | uqor 단위의 트랜잭션 수수료   | `--fees 500uqor`               |
| `--from`           | 서명 키 이름 또는 주소        | `--from mykey`                 |
| `--output`         | 응답 형식                     | `--output json`                |
| `--node`           | 연결할 RPC 엔드포인트         | `--node tcp://localhost:26657` |
| `--gas`            | 트랜잭션의 가스 한도          | `--gas auto`                   |
| `--gas-adjustment` | 추정 가스의 배수              | `--gas-adjustment 1.3`         |
| `-y`               | 확인 프롬프트 건너뛰기        | `-y`                           |

### 예시: 모든 일반 플래그를 포함한 전체 명령

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor \
  --node tcp://localhost:26657 \
  --output json \
  -y
```

## 다음 단계

이제 첫 트랜잭션을 보냈으니, QoreChain이 제공하는 더 많은 기능을 살펴보세요.

* **스테이킹 및 위임** — QOR를 스테이킹하고 보상을 받으세요
* **자산 브리징** — 체인 간에 자산을 이동하세요
* **EVM 개발** — QoreChain에 Solidity 스마트 컨트랙트를 배포하세요
