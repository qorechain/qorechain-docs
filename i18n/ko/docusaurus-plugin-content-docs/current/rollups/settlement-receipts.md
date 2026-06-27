---
slug: /rollups/settlement-receipts
title: 양자 안전 정산 영수증
sidebar_label: 정산 영수증
sidebar_position: 6
---

# 양자 안전 정산 영수증

**정산 영수증**은 롤업의 정산 배치가 포스트 양자 서명 하에서 메인 체인에
앵커링되었다는 휴대 가능하고 자기 완결적인 증명입니다. 이는 특정 배치를 해당
높이에서 롤업의 상태를 커밋한 온체인 앵커에 묶으며, **완전 오프라인**으로
검증할 수 있습니다 — 노드도, 검증자의 네트워크 경로에 대한 신뢰도 필요 없습니다.

앵커 서명은 메인 체인이 사용하는 것과 동일한 포스트 양자 방식인
**ML-DSA-87**(Dilithium-5, FIPS-204)이므로, 영수증은 베이스 체인의 양자 안전
무결성을 상속받습니다.

## 정규 앵커 메시지

검증은 앵커 필드로부터 이 정확한 순서로 연결되어 구성된 정규 메시지에 대한
Dilithium-5 서명을 확인합니다:

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

`anchorSignBytes(...)`는 이 바이트를 생성합니다; 검증자는 영수증으로부터 이를
재구성하고 레이어 생성자의 등록된 ML-DSA-87 키에 대해 서명을 확인합니다.

## 빌드 및 검증 (TypeScript)

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({
  endpoints: { rest: "https://rest.testnet.example" },
});

// Build a portable receipt for one batch.
const receipt = await buildSettlementReceipt(rdk, "my-roll", 7);

// Persist it, ship it, hand it to a counterparty — it is self-contained JSON.

// Verify fully offline. With no client, you must supply the creator's key.
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "<layer creator ML-DSA-87 public key>",
});

console.log(result.valid); // true when the signature and the batch↔anchor binding both hold
```

`creatorPublicKey` 대신 (또는 함께) `client`를 전달하면, 검증은 레이어 생성자의
등록된 ML-DSA-87 키를 체인(`getPqcAccount(address)`)에서 가져옵니다. 그러면
검증은 두 가지를 확인합니다:

1. 정규 앵커 메시지에 대한 **Dilithium-5 서명**, 그리고
2. **배치 ↔ 앵커 상태 루트 바인딩** — 보유하고 있는 배치가 앵커가 커밋한
   바로 그 배치라는 것.

```ts
// Online verification: fetch the creator's PQC key from the chain.
const online = await verifySettlementReceipt(receipt, { client: rdk });
```

## 앵커 읽기

영수증은 새로운 온체인 `x/multilayer` **Anchor** 쿼리로부터 빌드됩니다. 읽기 작업:

- `getAnchor(layerId)` — 한 레이어의 앵커.
- `getLatestAnchor()` — 가장 최근 앵커.
- `getAnchors(layerId)` — 한 레이어의 앵커 이력.
- `getPqcAccount(address)` — 등록된 포스트 양자 계정(그 ML-DSA-87 키),
  생성자의 서명을 검증하는 데 사용됨.

## CLI

```bash
# Build a receipt and print it.
qorollup receipt my-roll 7

# Build, then verify it inline.
qorollup receipt my-roll 7 --verify

# Build and write it to a file.
qorollup receipt my-roll 7 --out receipt.json
```

전체 `qorollup` 운영자 CLI는
[롤업 배포하기](/rollups/deploying-a-rollup)를 참고하세요.

## 다른 언어들

Python, Go, Rust, Java(JVM) 클라이언트는 동일한 빌드/검증 표면을 노출합니다.
이들은 번들된 JavaScript 구현이 아니라
[`qorechain-pqc`](https://github.com/qorechain) 라이브러리를 통해 ML-DSA-87
검증을 수행합니다; 해당 언어의 RDK 클라이언트와 함께 설치하세요.
