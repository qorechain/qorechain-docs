---
slug: /rollups/watchtower
title: Watchtower
sidebar_label: Watchtower
sidebar_position: 9
---

# Watchtower

Watchtower는 옵티미스틱 롤업을 위한 자동 챌린저 프레임워크입니다. 롤업의
정산 배치를 추적하고, 각 새 배치와 해당 챌린지 윈도우 마감 시각을 노출하며,
**여러분**의 유효성 술어가 배치를 거부할 때 이를 `onInvalid` 콜백으로 전달하여
챌린지를 연결할 수 있게 합니다.

이 프레임워크는 감시하고 *언제* 행동할지 결정합니다. **유효성 검사는 여러분이
제공합니다.** Watchtower는 배치가 부정하다고 스스로 판단하지 않습니다 —
`validate` 함수를 호출하고 여러분이 반환한 값에 따라 행동할 뿐입니다.

## `watchBatches`

```ts
import { createRdkClient, watchBatches, challengeBatch } from "@qorechain/rdk";

const rdk = createRdkClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    rpc: "https://rpc.testnet.example", // needed to broadcast a challenge
  },
});

const watcher = watchBatches(rdk, "my-roll", {
  onBatch: (batch) => {
    console.log("new batch", batch.index);
  },

  // Your validity predicate. Return false to flag the batch as invalid.
  validate: async (batch) => {
    return await isBatchValid(batch); // your logic
  },

  // Called when validate() returns false — wire it to a challenge.
  onInvalid: async (batch) => {
    await challengeBatch(rdk, "my-roll", batch.index /* + your fraud proof */);
  },

  // Called as a batch approaches the end of its challenge window.
  onDeadline: (batch) => {
    console.warn("challenge window closing for batch", batch.index);
  },
});

// Later:
watcher.stop();
```

프레임워크가 노출하는 것:

- `onBatch`를 통한 **새 배치**,
- `onDeadline`을 통한 **챌린지 윈도우 마감**, 그리고
- `onInvalid`를 통한 **무효 배치** (여러분의 `validate`가 `false`를 반환한 경우).

`onInvalid`를 `challengeBatch`에 연결하면 Watchtower가 완전한 자동 챌린저로
바뀝니다. 설정하지 않은 채 두면 관찰 전용 모드로 실행됩니다.

## CLI

```bash
qorollup watchtower my-roll
```

`watchtower`는 명령줄에서 프레임워크를 실행하며, Ctrl-C를 누를 때까지 새 배치와
챌린지 윈도우 마감을 출력합니다. 전체 `qorollup` 운영자 CLI는
[롤업 배포하기](/rollups/deploying-a-rollup)를 참조하세요.
