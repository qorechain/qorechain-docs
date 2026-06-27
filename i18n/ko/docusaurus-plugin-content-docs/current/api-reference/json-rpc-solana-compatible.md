---
slug: /api-reference/json-rpc-solana-compatible
title: JSON-RPC — Solana 호환
sidebar_label: JSON-RPC — Solana 호환
sidebar_position: 4
---

# JSON-RPC — Solana 호환

QoreChain은 SVM(Solana Virtual Machine) 런타임을 통해 Solana 호환 JSON-RPC 인터페이스를 제공하여, 기존 Solana 도구와 SDK가 QoreChain과 네이티브로 상호작용할 수 있도록 합니다.

## 연결

| 전송 방식 | 기본 주소                 |
| --------- | ------------------------- |
| HTTP      | `http://127.0.0.1:8899`   |

JSON-RPC 서버는 **`qorechaind start`로 시작**되며 **기본적으로 활성화**되어 `127.0.0.1:8899`에서 수신 대기합니다. `app.toml`의 `[svm-rpc]` 섹션(`enable` + `address`)을 통해 구성됩니다. 새로 시작된 노드는 이미 이 인터페이스를 제공하므로 추가 프로세스가 필요하지 않습니다.

:::note
Solana 호환 JSON-RPC 인터페이스는 **`qorechain-vladi`** 메인넷(체인 버전 **v3.1.77**에서 가동 중)과 **`qorechain-diana`** 테스트넷 모두에서 포트 **8899**로 제공됩니다. 위의 로컬 주소는 직접 운영하는 노드에 적용됩니다. 원격 접속의 경우 공급자의 메인넷 또는 테스트넷 엔드포인트로 대체하세요.
:::

---

## 메서드

| 메서드                              | 매개변수                 | 설명                                                          |
| ----------------------------------- | ------------------------ | ------------------------------------------------------------- |
| `getAccountInfo`                    | `pubkey` (base58 string) | 계정 데이터, 소유자, lamports, 실행 가능 플래그를 반환합니다  |
| `getBalance`                        | `pubkey` (base58 string) | 주어진 공개 키의 잔액을 lamports 단위로 반환합니다           |
| `getSlot`                           | 없음                     | 현재 슬롯 번호를 반환합니다                                   |
| `getMinimumBalanceForRentExemption` | `dataLength` (integer)   | 주어진 데이터 크기에 대한 임대 면제 최소 잔액을 반환합니다   |
| `getVersion`                        | 없음                     | 노드 소프트웨어 버전을 반환합니다                             |
| `getHealth`                         | 없음                     | 노드 상태를 반환합니다(정상이면 `"ok"`)                      |

---

## 응답 형식

모든 응답은 JSON-RPC 2.0 사양을 따릅니다. 온체인 상태를 참조하는 응답에는 현재 `slot`이 포함된 `context` 객체가 포함됩니다:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": { ... }
  }
}
```

---

## 예제

### getAccountInfo

**요청:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getAccountInfo",
    "params": [
      "4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T",
      { "encoding": "base64" }
    ],
    "id": 1
  }'
```

**응답:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": {
      "data": ["AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", "base64"],
      "executable": false,
      "lamports": 1000000000,
      "owner": "11111111111111111111111111111111",
      "rentEpoch": 0
    }
  }
}
```

### getBalance

**요청:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T"],
    "id": 2
  }'
```

**응답:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": 1000000000
  }
}
```

### getVersion

**요청:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getVersion",
    "params": [],
    "id": 3
  }'
```

**응답:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "solana-core": "1.18.0-qorechain",
    "feature-set": 1
  }
}
```

버전 문자열 `1.18.0-qorechain`은 QoreChain SVM 런타임에서 실행되는 Solana 1.18.0 RPC 인터페이스와의 호환성을 나타냅니다.

---

## @solana/web3.js 통합

기존 Solana 애플리케이션은 `Connection` 객체를 로컬 SVM 엔드포인트로 지정하여 QoreChain에 연결할 수 있습니다:

```javascript
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection("http://127.0.0.1:8899", "confirmed");

// Check version
const version = await connection.getVersion();
console.log("Node version:", version["solana-core"]);

// Get balance
const pubkey = new PublicKey("4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T");
const balance = await connection.getBalance(pubkey);
console.log("Balance:", balance / LAMPORTS_PER_SOL);

// Get slot
const slot = await connection.getSlot();
console.log("Current slot:", slot);

// Get account info
const accountInfo = await connection.getAccountInfo(pubkey);
if (accountInfo) {
  console.log("Owner:", accountInfo.owner.toBase58());
  console.log("Executable:", accountInfo.executable);
  console.log("Data length:", accountInfo.data.length);
}
```

---

## 참고

- **주소 형식**: SVM 계정은 네이티브 Cosmos SDK 모듈에서 사용하는 `qor1` Bech32 접두사가 아니라 base58 인코딩된 공개 키(표준 Solana 형식)를 사용합니다.
- **크로스 VM 브리징**: EVM과 SVM 런타임 간에 자산을 이동하려면 크로스 VM 모듈(`x/crossvm`)을 사용하세요. `crossvm call` 구문은 [트랜잭션 명령어](/cli-reference/transaction-commands)를 참조하세요.
- **프로그램 배포**: CLI(`qorechaind tx svm deploy-program`)를 통해 또는 SVM 런타임을 통해 프로그래밍 방식으로 BPF 프로그램을 배포하세요.
- **컴퓨트 예산**: SVM 런타임은 기본적으로 트랜잭션당 1,400,000 컴퓨트 유닛의 컴퓨트 예산을 적용합니다. 이는 모듈 매개변수를 통해 구성할 수 있습니다.
