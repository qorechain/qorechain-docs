---
slug: /rollups/settlement-receipts
title: 양자 안전 정산 영수증
sidebar_label: 정산 영수증
sidebar_position: 6
---

# 양자 안전 정산 영수증

**정산 영수증(settlement receipt)** 은 롤업의 정산 배치가 포스트 양자 서명 아래
메인 체인에 앵커링되었음을 증명하는, 휴대 가능하고 자체 완결적인 증명입니다.
특정 배치를 해당 높이에서 롤업의 상태를 커밋한 온체인 앵커에 바인딩하며,
**완전히 오프라인으로** 검증할 수 있습니다 — 노드도 필요 없고, 검증자의 네트워크
경로를 신뢰할 필요도 없습니다.

앵커 서명은 메인 체인이 사용하는 것과 동일한 포스트 양자 방식인
**ML-DSA-87**(Dilithium-5, FIPS-204)이므로, 영수증은 기본 체인의 양자 안전
무결성을 그대로 물려받습니다.

## 정규 앵커 메시지

검증은 앵커 필드를 아래의 정확한 순서로 연결하여 만든 정규 메시지에 대한
Dilithium-5 서명을 확인합니다:

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

`anchorSignBytes(...)`가 이 바이트를 생성합니다. 검증자는 영수증으로부터 이를
재구성한 뒤, 레이어 생성자가 등록한 ML-DSA-87 키에 대해 서명을 확인합니다.

## 빌드 및 검증 (TypeScript)

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2);
// pass `endpoints` only to target your own node.
const rdk = createRdkClient({ network: "testnet" });

// Build a portable receipt for one batch.
const receipt = await buildSettlementReceipt(rdk, "my-roll", 7);

// Persist it, ship it, hand it to a counterparty — it is self-contained JSON.

// Verify fully offline. With no client, you must supply the creator's key.
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "<layer creator ML-DSA-87 public key>",
});

console.log(result.valid); // true when the signature and the batch↔anchor binding both hold
```

`creatorPublicKey` 대신(또는 함께) `client`를 전달하면, 검증 과정에서 레이어
생성자가 등록한 ML-DSA-87 키를 체인에서 가져옵니다
(`getPqcAccount(address)`). 그런 다음 검증은 두 가지를 확인합니다:

1. 정규 앵커 메시지에 대한 **Dilithium-5 서명**, 그리고
2. **배치 ↔ 앵커 상태 루트 바인딩** — 여러분이 보유한 배치가 앵커가 커밋한
   바로 그 배치인지 여부.

```ts
// Online verification: fetch the creator's PQC key from the chain.
const online = await verifySettlementReceipt(receipt, { client: rdk });
```

## 앵커 읽기

영수증은 온체인 `x/multilayer` **Anchor** 쿼리로부터 만들어지며, 이 쿼리는 체인
버전 **v3.1.80**부터 gRPC와 REST 모두에서 사용할 수 있습니다
([REST / gRPC 엔드포인트](/api-reference/rest-grpc-endpoints#multilayer-module)
참조). 읽기 메서드는 다음과 같습니다:

- `getAnchor(layerId)` — 레이어의 앵커.
- `getLatestAnchor()` — 가장 최근 앵커.
- `getAnchors(layerId)` — 레이어의 앵커 히스토리.
- `getPqcAccount(address)` — 등록된 포스트 양자 계정(해당 ML-DSA-87 키).
  생성자의 서명을 검증하는 데 사용됩니다.

## CLI

```bash
# Build a receipt and print it.
qorollup receipt my-roll 7

# Build, then verify it inline.
qorollup receipt my-roll 7 --verify

# Build and write it to a file.
qorollup receipt my-roll 7 --out receipt.json
```

전체 `qorollup` 운영자 CLI는 [롤업 배포하기](/rollups/deploying-a-rollup)를
참조하세요.

## 다른 언어

Python, Go, Rust, Java(JVM) 클라이언트도 동일한 빌드/검증 인터페이스를
제공합니다. 이들 클라이언트는 번들된 JavaScript 구현 대신
[`qorechain-pqc`](https://github.com/qorechain) 라이브러리를 통해 ML-DSA-87
검증을 수행하므로, 사용하는 언어의 RDK 클라이언트와 함께 해당 라이브러리를
설치하세요.
