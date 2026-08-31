---
slug: /getting-started/first-transaction
title: 첫 트랜잭션
sidebar_label: 첫 트랜잭션
sidebar_position: 5
---

# 첫 트랜잭션

이 가이드에서는 QOR 토큰 전송, 트랜잭션 조회, 그리고 QoreChain의 네이티브, EVM, SVM 인터페이스를 통한 상호작용 방법을 다룹니다.

:::note
아래 명령어는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**)을 기준으로 합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 2026년 6월 7일부터 운영 중입니다 — 메인넷에서 트랜잭션을 수행할 때는 **메인넷 연결하기** 페이지에 나온 메인넷 체인 ID와 엔드포인트로 교체하세요.
:::

## 잔액 확인하기

토큰을 보내기 전에 계정 잔액을 확인하세요.

```bash
qorechaind query bank balances qor1youraddress... --output json
```

응답에는 해당 계정이 보유한 모든 토큰 단위(denomination)가 포함됩니다. QOR 잔액은 `uqor`(마이크로-QOR) 단위로 표시되며, **1 QOR = 1,000,000 uqor**입니다.

## QOR 보내기

내 키에서 다른 주소로 토큰을 전송합니다.

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

이 명령은 수신자 주소로 **1 QOR**(1,000,000 uqor)을 보내며, 수수료로 500 uqor를 지불합니다.

:::caution Cosmos 전송에는 하이브리드 PQC 서명이 필요합니다
cosmos 경로에서는 네트워크 기본값이 `hybrid_signature_mode = required`로 설정되어 있습니다(현재 체인 버전 **v3.1.95**). 일반적인 클래식 방식의 `tx bank send`는 **거부됩니다** — cosmos 경로의 모든 트랜잭션은 secp256k1 서명과 함께 ML-DSA-87(Dilithium-5) 서명을 반드시 포함해야 합니다. `qorechaind tx pqc gen-key`로 Dilithium-5 키를 생성한 뒤, `qorechaind tx pqc cosign`으로 하이브리드 공동 서명을 첨부하세요(또는 QoreChain SDK의 `buildHybridTx`에서 `includePqcPublicKey`를 사용해 트랜잭션을 구성하면 최초 사용 시 키가 자동으로 등록됩니다). CLI 없이 코드로 하이브리드 서명을 생성하려면 오픈소스 [**qorechain-pqc**](/developer-guide/post-quantum-signing) 라이브러리(`hybridSignBytes`)와 QoreChain SDK가 동일한 기능을 제공합니다. 전체 하이브리드 흐름은 [지갑 설정](/getting-started/wallet-setup) 문서를 참고하세요.
:::

트랜잭션이 브로드캐스트되기 전에 확인 메시지가 표시됩니다. 확인하면 CLI가 트랜잭션 해시를 반환합니다.

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

:::note
EVM 트랜잭션은 cosmos 경로의 하이브리드 PQC 요구사항의 **영향을 받지 않습니다**. EVM은 별도의 `eth_secp256k1` ante 경로를 사용하므로, 표준 이더리움 서명 방식(MetaMask, ethers.js 등)이 PQC 확장 없이도 그대로 작동합니다.
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

## SVM RPC 사용하기

QoreChain의 SVM 실행 환경은 `8899` 포트에서 Solana 호환 RPC 인터페이스를 제공합니다.

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
| `--fees`           | uqor 단위의 트랜잭션 수수료         | `--fees 500uqor`               |
| `--from`           | 서명에 사용할 키 이름 또는 주소       | `--from mykey`                 |
| `--output`         | 응답 형식                       | `--output json`                |
| `--node`           | 연결할 RPC 엔드포인트              | `--node tcp://localhost:26657` |
| `--gas`            | 트랜잭션의 가스 한도                | `--gas auto`                   |
| `--gas-adjustment` | 추정 가스에 곱하는 배수             | `--gas-adjustment 1.3`         |
| `-y`               | 확인 프롬프트 건너뛰기              | `-y`                           |

### 예시: 일반적인 플래그를 모두 사용한 전체 명령어

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor \
  --node tcp://localhost:26657 \
  --output json \
  -y
```

## 다음 단계

첫 트랜잭션을 성공적으로 보냈다면, QoreChain이 제공하는 다른 기능들도 살펴보세요.

* **스테이킹과 위임(Delegation)** — QOR을 스테이킹하고 보상을 받아보세요
* **자산 브리징** — 여러 체인 간에 자산을 이동시켜 보세요
* **EVM 개발** — QoreChain에서 Solidity 스마트 컨트랙트를 배포해 보세요
