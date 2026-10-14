---
slug: /rollups/watchtower
title: Watchtower
sidebar_label: Watchtower
sidebar_position: 9
---

# Watchtower

Watchtower는 옵티미스틱 롤업을 위한 자동 챌린저 프레임워크입니다. 롤업의
정산 배치를 추적하고, 각 새 배치와 해당 챌린지 윈도우 마감 시각을 알려주며,
**여러분**의 유효성 술어가 배치를 거부할 때 이를 `onInvalid` 콜백으로 전달하여
챌린지를 연결할 수 있게 합니다.

이 프레임워크는 감시하고 *언제* 행동할지 결정합니다. **유효성 검사는 여러분이
제공합니다.** Watchtower는 배치가 부정하다고 스스로 판단하지 않습니다 —
`validate` 함수를 호출하고 여러분이 반환한 값에 따라 행동할 뿐입니다.

:::caution 초기 단계: RDK REST 경로 필요
Watchtower는 RDK REST 클라이언트를 통해 배치를 읽습니다. `/qorechain/rdk/v1/…` REST 경로는 현재 메인넷에서 제공되지 않으므로, Watchtower는 아직 메인넷에서 실행할 수 없습니다. 어느 네트워크에서도 롤업이 생성된 적이 없으므로 감시할 대상도 없습니다.
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require. See "Signing with the published clients" in
// Deploying a Rollup — the classical-only client in @qorechain/rdk 0.4.4
// cannot get a challenge accepted.
declare const tx: {
  challengeBatch(input: { rollupId: string; batchIndex: number; proof: string }): Promise<unknown>;
};

const watcher = watchBatches(rdk, "my-rollup", {
  onBatch: (batch) => {
    console.log("new batch", batch.batchIndex);
  },

  // Your validity predicate. Return false to flag the batch as invalid.
  validate: async (batch) => {
    return await isBatchValid(batch); // your logic
  },

  // Called when validate() returns false — wire it to a challenge.
  onInvalid: async ({ batch }) => {
    await tx.challengeBatch({
      rollupId: "my-rollup",
      batchIndex: batch.batchIndex,
      proof: myFraudProofHex, // hex fraud proof
    });
  },

  // Called as a batch approaches the end of its challenge window.
  onDeadline: ({ batch, secondsRemaining }) => {
    console.warn("challenge window closing for batch", batch.batchIndex, secondsRemaining);
  },
});

// Later:
watcher.stop();
```

프레임워크가 알려주는 것:

- `onBatch`를 통한 **새 배치**,
- `onDeadline`을 통한 **챌린지 윈도우 마감**, 그리고
- `onInvalid`를 통한 **무효 배치** (여러분의 `validate`가 `false`를 반환한 경우).

`onInvalid`를 챌린지에 연결하면 Watchtower가 완전한 자동 챌린저로
바뀝니다. 설정하지 않은 채 두면 관찰 전용 모드로 실행됩니다.

:::note 챌린지 윈도우
Watchtower가 보고하는 마감 시각은 챌린지 윈도우를 블록당 6초로 블록 수로 환산한 값(기본값 100,800 블록)을 사용하므로, 메인넷의 ≈3.2초 블록에서는 실제 윈도우가 "7일"보다 짧습니다. 챌린지를 제출하려면 롤업의 챌린지 본드(`nft` 및 `custom` 프리셋의 경우 1,000 QOR)도 필요합니다.
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower`는 명령줄에서 프레임워크를 실행하며, Ctrl-C를 누를 때까지 새 배치와
챌린지 윈도우 마감을 출력합니다. 전체 `qorollup` 운영자 CLI는
[롤업 배포하기](/rollups/deploying-a-rollup)를 참조하세요.
