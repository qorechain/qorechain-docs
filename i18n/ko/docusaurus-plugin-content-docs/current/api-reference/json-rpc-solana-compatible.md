---
slug: /api-reference/json-rpc-solana-compatible
title: JSON-RPC — Solana 호환
sidebar_label: JSON-RPC — Solana 호환
sidebar_position: 4
---

# JSON-RPC — Solana-Compatible

QoreChain은 SVM(Solana Virtual Machine) 런타임을 통해 Solana 호환 JSON-RPC 인터페이스를 제공하여, 기존 Solana 툴링 및 SDK가 QoreChain과 네이티브하게 상호작용할 수 있도록 합니다.

:::caution SVM 트랜잭션 제출이 현재 비활성화되어 있습니다
체인 버전 v3.1.89(8월 22일) 기준, 장애 발생 이후 SVM 실행 레인은 **네트워크 전역에서 트랜잭션 제출이 비활성화**되었습니다 — 어떤 트랜잭션을 보내도 `code 11, "SVM module is disabled"`가 반환됩니다. 이는 공개 읽기 전용 엔드포인트뿐 아니라 네트워크 전역에 적용됩니다. 아래 표의 읽기 계열 메서드(예: `getBalance`, `getAccountInfo`)는 여전히 응답할 수 있지만, 레인이 재개되기 전까지는 SVM 트랜잭션을 제출하는 실제 연동을 시도하지 마십시오 — 이는 런타임 파라미터가 아니라 컴파일 타임 비활성화이므로 거버넌스 투표로 다시 켤 수 없으며, 외부 감사에서 통과 판정이 나올 때까지 계속 비활성화 상태로 유지될 것으로 예상됩니다.
:::

## 연결

| 전송 방식 | 주소 |
| --------- | ------------------------- |
| HTTP (자체 노드) | `http://127.0.0.1:8899`   |
| HTTPS (공개, 메인넷, 읽기 전용) | `https://svm.qore.host` |
| HTTPS (공개, 테스트넷, 읽기 전용) | `https://svm-testnet.qore.host` |

JSON-RPC 서버는 **`qorechaind start`에 의해 시작**되며 **기본적으로 활성화**되어 있고, `127.0.0.1:8899`에서 리스닝합니다. `app.toml`의 `[svm-rpc]` 섹션(`enable` + `address`)을 통해 설정합니다. 새로 시작한 노드는 이 인터페이스를 이미 제공하므로 별도의 프로세스가 필요하지 않습니다. 공개 엔드포인트는 **읽기 전용**입니다(트랜잭션 제출은 엣지에서 비활성화되어 있습니다).

:::note
체인 버전 **v3.1.82** 기준, SVM 인터페이스는 계정의 **네이티브 QOR 잔액**을 제공합니다 — Cosmos 및 EVM 인터페이스에서 보이는 것과 동일한 통합 자금이며, **lamport** 단위로 표시됩니다(9자리 소수; **1 uqor = 1,000 lamport**). [SVM 인터페이스의 네이티브 QOR](/developer-guide/svm-development#native-qor)을 참고하십시오.
:::

---

## 메서드

| 메서드                              | 파라미터               | 설명                                                    |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `getAccountInfo`                    | `pubkey` (base58 문자열) | 계정 데이터, 소유자, lamport, executable 플래그를 반환     |
| `getBalance`                        | `pubkey` (base58 문자열) | 지정한 공개 키의 네이티브 QOR 잔액을 lamport 단위로 반환 |
| `getSignaturesForAddress`           | `address` (base58 문자열) | 해당 주소와 관련된 트랜잭션 서명을 반환(입금 감지) |
| `getSlot`                           | 없음                     | 현재 슬롯 번호를 반환                                |
| `getMinimumBalanceForRentExemption` | `dataLength` (정수)   | 지정한 데이터 크기에 대한 렌트 면제 최소 잔액을 반환 |
| `getVersion`                        | 없음                     | 노드 소프트웨어 버전을 반환                              |
| `getHealth`                         | 없음                     | 노드 상태를 반환(정상이면 `"ok"`)                 |

---

## 응답 형식

모든 응답은 JSON-RPC 2.0 사양을 따릅니다. 온체인 상태를 참조하는 응답에는 현재 `slot`을 담은 `context` 객체가 포함됩니다.

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

## 예시

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

## @solana/web3.js 연동

기존 Solana 애플리케이션은 `Connection` 객체를 로컬 SVM 엔드포인트로 지정하여 QoreChain에 연결할 수 있습니다.

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

## 참고 사항

- **주소 형식**: SVM 계정은 base58로 인코딩된 공개 키(표준 Solana 형식)를 사용하며, 네이티브 Cosmos SDK 모듈에서 사용하는 `qor1` Bech32 접두사와는 다릅니다.
- **크로스 VM 브리징**: EVM과 SVM 런타임 간에 자산을 이동하려면 Cross-VM 모듈(`x/crossvm`)을 사용하십시오. `crossvm call` 구문은 [트랜잭션 명령어](/cli-reference/transaction-commands)를 참고하십시오.
- **프로그램 배포**: CLI(`qorechaind tx svm deploy-program`)를 통해 또는 SVM 런타임을 통해 프로그래밍 방식으로 BPF 프로그램을 배포합니다.
- **컴퓨트 예산**: SVM 런타임은 기본적으로 트랜잭션당 1,400,000 컴퓨트 유닛의 컴퓨트 예산을 적용합니다. 이는 모듈 파라미터를 통해 설정할 수 있습니다.
