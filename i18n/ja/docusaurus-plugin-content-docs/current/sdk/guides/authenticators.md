---
slug: /sdk/guides/authenticators
title: オーセンティケーターと委任支出
sidebar_label: オーセンティケーター
sidebar_position: 8
---

# オーセンティケーターと委任支出

**オーセンティケーターレーン**（SDK 0.7.0、チェーン **v3.1.85**）を使うと、リンクされた外部キー — Phantom の **ed25519** キー、または MetaMask / EVM の **secp256k1** キー — が、**外部キーが ML-DSA 共同署名を一切生成することなく**、最小権限・支出上限付き・失効可能な条件のもとで、唯一の正準（canonical）な **PQC 必須**アカウントから支出できます。

これはチェーン側の
[アカウント抽象化](/developer-guide/account-abstraction)モジュールに対応する SDK 側の機能です。

:::danger 稼働中のネットワークでは利用できません
`x/abstractaccount` モジュールは `qorechain-vladi` および `qorechain-diana` で**無効**です（`GET /qorechain/abstractaccount/v1/config` は `"enabled": false` を返します）。チェーン v3.2.0 以降、このフラグはすべてのパス（抽象アカウントの作成、オーセンティケーターのリンク、`MsgExecuteEVM` / `MsgExecuteCosmos` の両方）で強制され、チェーンは `abstract account
module is disabled`（コード 9）でそれらを拒否します。トランザクションでこれを有効にすることはできません。以下の内容はすべて、参照用にモジュールのインターフェースを説明するものです。モジュールが有効になるまでは、稼働中のネットワーク上でリンクキーや委任支出のフローを構築しないでください。また、そのようなフローを提供する前にフラグを確認してください。
:::

## リレイヤーモデル

**リレイヤー**がトランザクションを送信し、手数料を支払います。リレイヤー自身のハイブリッド（クラシカル + ML-DSA-87）署名がエンベロープの ante ハンドラーを満たすため、正準アカウントの PQC 署名はオンチェーンでは**不要**です。代わりに、認可はドメイン分離されリプレイ拘束された **sign-bytes** ダイジェストに対するリンク済みキーの署名によって行われます。

```text
 Phantom / MetaMask key            Relayer (pays fees)             Chain
 ─────────────────────            ───────────────────            ─────
 sign(authSignBytes)  ──────────▶ wrap in Msg, sign envelope ──▶ verify authenticator sig
                                                                  check permission + rule
                                                                  spend FROM canonical account
```

リレイヤーはオーナーとは**別の**アカウントです。オーセンティケーターが署名するノンスは、チェーンが保持するリンク済みキー自身のシーケンス（[ノンス](#nonces)を参照）であり、アカウントの EVM ノンスではありません。

## 3 つのレーン

| レーン | メッセージ | Sign-bytes | 支出内容 |
| --- | --- | --- | --- |
| EVM | `MsgExecuteEVM` | `evmAuthSignBytes` | アカウントの `0x` アドレスからのネイティブ QOR / EVM コール |
| Native | `MsgExecuteCosmos` | `cosmosAuthSignBytes` | アカウントからの `x/bank` 経由のネイティブ QOR |
| キーローテーション | `MsgRotatePQCKey` | `rotationSignBytes` | （アカウントの PQC キーをローテーション） |

メッセージの type URL は `/qorechain.abstractaccount.v1.MsgExecuteEVM`、
`/qorechain.abstractaccount.v1.MsgExecuteCosmos`、および
`/qorechain.pqc.v1.MsgRotatePQCKey` です。

## Phantom オーセンティケーターの登録

キーのリンクは**オーナー署名**（正準アカウントによる通常のハイブリッドトランザクション）で行います。`MsgRegisterAuthenticator` でキー（スキーム + 生の公開鍵バイト列）、付与する `permissions`、およびセッション期限 `expiryUnix` を指定します。支出上限は `MsgUpdateSpendingRules` により `SpendingRule` として付与します。

```ts
import { msg } from "@qorechain/sdk";

// The Phantom wallet in the browser:
const phantomPubkey = window.solana.publicKey.toBytes(); // 32-byte ed25519

// 1) Link the key: least privilege ("send" only) + a session expiry.
const register = msg.abstractaccount.registerAuthenticator({
  owner: canonicalAccount,          // the PQC-required account ("qor1…")
  accountAddress: canonicalAccount, // the account the key may act for
  scheme: "ed25519",                // Phantom keys are ed25519
  pubkey: phantomPubkey,
  permissions: ["send"],            // e.g. "send", "evm", "svm" — never "all" for a hot key
  expiryUnix: String(Math.floor(Date.now() / 1000) + 7 * 24 * 3600), // 7 days
  label: "phantom",
});

// 2) Bound what it can move: per-tx and daily limits, uqor only.
const limits = msg.abstractaccount.updateSpendingRules({
  owner: canonicalAccount,
  accountAddress: canonicalAccount,
  rules: [
    {
      id: "phantom-hot",
      perTxLimit: "1000000",    // ≤ 1 QOR per spend
      dailyLimit: "10000000",   // ≤ 10 QOR per day
      allowedDenoms: ["uqor"],
      enabled: true,
    },
  ],
});

// Broadcast BOTH owner-signed (hybrid) — e.g. via the hybrid tx path:
// await signAndBroadcastHybrid({ ..., messages: [register, limits] });
```

:::caution ルールがキーを制限するのは、ルールが存在する場合のみです
チェーンは次の順序で上限を解決します。オーセンティケーター自身のルールが設定されていて `enabled` であればそれ、そうでなければアカウントの最初の `enabled` なルール、それもなければ**なし、つまり上限は存在しません**。`enabled: false` で保存されたルールは、上限ゼロではなく上限なしです。`MsgRegisterAuthenticator` はルールを持たないため、このメッセージだけでリンクされたキーは、アカウントレベルのルールによってのみ制限されます。`MsgUpdateSpendingRules` で意図的にルールを設定し、キーが必要とするパーミッションだけを登録してください。上限はリンク済みキーが与えうる被害を抑えるものであり、キーの失効に代わるものではありません。
:::

キーを即座に無効化するには、オーナーが
`msg.abstractaccount.revokeAuthenticator({ owner, accountAddress, scheme,
pubkey })` をブロードキャストします。

## Phantom からの支出（Native レーン、リレイヤー経由）

キーがリンクされると、ブラウザ側でリレイヤーに渡せる `MsgExecuteCosmos` を構築できます。`buildPhantomExecuteCosmos` はドメイン分離されたダイジェストを再構築し、Phantom に署名させ（`signMessage`）、`{ typeUrl, value }` 形式のメッセージを返します。

**ブラウザ側（Phantom ユーザー）:**

```ts
import { buildPhantomExecuteCosmos } from "@qorechain/sdk";

// window.solana is a Phantom-style wallet: { publicKey, signMessage }.
const msgExecute = await buildPhantomExecuteCosmos({
  wallet: window.solana,
  relayer: relayerAddress,       // who will submit + pay fees
  chainId: "qorechain-vladi",
  account: canonicalAccount,     // the PQC-required owner
  to: recipient,                 // "qor1…"
  amount: "100uqor",             // single-coin amount string
  nonce,                         // the per-authenticator sequence for (account, pubkey)
});

// Ship `msgExecute` to your relayer service (it is already signed by Phantom):
await fetch("/api/relay", {
  method: "POST",
  body: JSON.stringify({
    typeUrl: msgExecute.typeUrl,
    value: {
      ...msgExecute.value,
      pubkey: Buffer.from(msgExecute.value.pubkey).toString("base64"),
      signature: Buffer.from(msgExecute.value.signature).toString("base64"),
      nonce: msgExecute.value.nonce.toString(),
    },
  }),
});
```

**サーバー側（リレイヤー）:** リレイヤーは**自身の**アカウントで、ハイブリッドパス（`signAndBroadcastHybrid`、`rest` を渡す）を使ってエンベロープに署名し、手数料を支払います。リレイヤーの ML-DSA-87 キーは、他のアカウントと同様に登録されている必要があります。メッセージ内のオーセンティケーターの署名が、オーナーのアカウントから支出するための認可となります。

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  signAndBroadcastHybrid,
  qorechainRegistry,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";

// The relayer's OWN account: a different account than the owner.
const mnemonic = process.env.RELAYER_MNEMONIC!;
const relayer = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(relayer.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(relayer.address, mnemonic);

const transport = await StargateClient.connect(RPC);
const info = await transport.getSequence(relayer.address);

// `msgExecute` is the message decoded from the request. The relayer pays fees.
const result = await signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,
  messages: [msgExecute],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: REST,
  transport,
});
console.log(result.transactionHash);
```

エンドツーエンドで実行可能なバージョン（Phantom の代わりにローカルの ed25519 キーを使用）は
[`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend)
サンプルにあります。

## MetaMask からの支出（EVM レーン）

MetaMask のキーは、その **20 バイトの ETH アドレス**（スキーム `secp256k1`）を
`registerEthAuthenticatorMsg` でリンクし、同種のダイジェストに対する 65 バイトの
EIP-191 `personal_sign` 署名によって支出を認可します。

**1) オーナーが MetaMask アドレスをリンクする**（オーナー署名、ハイブリッド）:

```ts
import { registerEthAuthenticatorMsg } from "@qorechain/sdk";

const [ethAddress] = await window.ethereum.request({
  method: "eth_requestAccounts",
  params: [],
});

const register = registerEthAuthenticatorMsg({
  owner: canonicalAccount,
  ethAddress,                 // 0x-hex 20-byte address = the authenticator pubkey
  permissions: ["evm"],       // EVM lane only
  expiryUnix: Math.floor(Date.now() / 1000) + 24 * 3600, // 24 h session
  label: "metamask",
});
// broadcast owner-signed (hybrid), like any other message
```

**2) MetaMask が EVM 送金を認可する** — `buildMetaMaskExecuteEvm` はダイジェストを構築し、プロバイダーに `personal_sign`（EIP-191）を要求して、リレイヤーに渡せる `MsgExecuteEVM` を返します。

```ts
import { buildMetaMaskExecuteEvm } from "@qorechain/sdk";

const msgExecute = await buildMetaMaskExecuteEvm({
  provider: window.ethereum,   // any EIP-1193 provider
  address: ethAddress,         // the linked 20-byte address (0x-hex)
  relayer: relayerAddress,
  chainId: "qorechain-vladi",
  account: canonicalAccount,   // the PQC-required owner
  to: "0xRecipient…",          // 0x-hex recipient
  value: "1000000000000000000",// decimal wei string (EVM lane: 18 decimals)
  gasLimit: 100000,
  nonce: authSequence,         // the linked key's authenticator sequence (see Nonces) — NOT the EVM nonce
  digestVersion: "v2",         // from chain v3.2.3 (see "Sign-bytes"); use resolveEvmAuthDigestVersion
});
// hand `msgExecute` to the relayer, exactly as in the Phantom flow
```

`buildMetaMaskExecuteCosmos` も Native レーンで同様に動作します
（`to: "qor1…"`、`amount: "100uqor"`、`nonce` = オーセンティケーターごとのシーケンス）。キーと署名を自前で管理する場合のために、対応する低レベルコンポーザー — `executeEvmMsg`、
`executeCosmosMsg`、`registerEthAuthenticatorMsg`、`revokeAuthenticatorMsg`、
`rotatePqcKeyMsg` — も用意されています。

## Sign-bytes（バイト単位で厳密）

2 つのバイトヘルパーがあります。`BE64(n)` は 8 バイトのビッグエンディアン整数、`LP(bytes)` は
`BE64(len) ‖ bytes`（長さプレフィックス付き）です。

**EVM レーン** — `evmAuthSignBytes({ chainId, account, pubkey, to, value, data, nonce })`
は 32 バイトのダイジェストを返します。

```text
sha256( "qorechain-evm-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(value) ‖ LP(data) ‖ BE64(nonce) )
```

`to` は `0x` 16 進の受取人、`value` は 10 進の wei 文字列、`data` は生の
calldata です。

**EVM レーン、v2（チェーン v3.2.3）** — `evmAuthSignBytesV2({ …, gasLimit })` は
呼び出しのガスリミットを追加するため、リレイヤーが有効な署名を別のリミットで
リプレイすることはできません。チェーンはブロックごとに正確に 1 つの形式のみを検証します。
v3.2.3 アップグレードより前は v1、それ以降は v2 です。`resolveEvmAuthDigestVersion({ rest })` は、
ネットワークが v3.2.3 を適用した後は `"v2"`、それ以前は `"v1"` を返し、
`buildPhantomExecuteEvm` / `buildMetaMaskExecuteEvm` は
`digestVersion` を受け取ります（デフォルトは `"v1"` なので、v3.2.3 以降のネットワークでは `"v2"` を渡してください）。
`gasLimit` はゼロ以外でなければなりません。

```text
sha256( "qorechain-evm-auth-v2"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(value) ‖ LP(data) ‖ BE64(nonce) ‖ BE64(gasLimit) )
```

**Native レーン** — `cosmosAuthSignBytes({ chainId, account, pubkey, to, amount, nonce })`
は 32 バイトのダイジェストを返します。

```text
sha256( "qorechain-cosmos-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(amount) ‖ BE64(nonce) )
```

`amount` は正準の単一コイン文字列（例: `100uqor`）です。

**ローテーション** — `rotationSignBytes(chainId, algorithmId, account, oldPub, newPub)`
は両方のキーが署名する文字列（その UTF-8 表現）を返します。

```text
qorechain-pqc-rotate-v1|<chainId>|<algorithmId>|<account>|<oldHex>|<newHex>
```

## ノンス {#nonces}

両レーンとも、`(account, pubkey)` ごとの**オーセンティケーターごとのシーケンス**を使用します。これはチェーンがリンク済みキーごとに保持するカウンターで、0 から始まり、実行が成功するたびにインクリメントされます。

- `MsgExecuteEVM.nonce` はこのカウンターであり、アカウントの EVM ノンス
  （`eth_getTransactionCount`）では**ありません**。
- `MsgExecuteCosmos.nonce` も同種のカウンターです。

このカウンターを照会するクエリはまだないため、リンク済みキーごとに自分で追跡してください。新しくリンクしたキーは 0 で、チェーンが受理した実行のたびに +1 します。チェーンの現在のカウンターと異なる値を送ると、リプレイとして拒否されます
（`abstractaccount` コード 11、下記参照）。

## パーミッションスキーマ

チェーンは正準のオーセンティケーター・パーミッション分類（タクソノミー）を公開しており、クライアントは文字列をハードコードせずにスコープを検証し、`schema_version` によって差異（ドリフト）を検出できます。

```ts
// REST (LCD):
const schema = await client.rest.getPermissionSchema();

schema.schema_version;      // bumps on any taxonomy/mapping change
schema.permissions;         // ["send", "evm", "svm", "all", ...]
schema.msg_permissions;     // { "/qorechain.abstractaccount.v1.MsgExecuteEVM": "evm", ... }
schema.key_management_msgs; // typeURLs NEVER delegable to a linked key
```

REST ルートは `GET /qorechain/abstractaccount/v1/permission_schema` です。型付き gRPC クエリクライアントは同じデータを
`clients.abstractaccount.permissionSchema()` として公開しています。このモジュールは
`/config`、`/accounts`、`/accounts/{address}` も提供します。

## エラーコード

失敗は `decodeTxError` を通じて、分かりやすい `kind` にデコードされます。

| Codespace | コード | Kind |
| --- | --- | --- |
| `abstractaccount` | 5 | `spending_limit_exceeded` |
| `abstractaccount` | 6 | `session_key_expired` |
| `abstractaccount` | 10 | `permission_denied` |
| `abstractaccount` | 11 | `authenticator_replay` |
| `pqc` | 21 | `hybrid_verify_failed` |

```ts
import { decodeTxError } from "@qorechain/sdk";

const decoded = decodeTxError({
  code: result.code,
  codespace: result.codespace,
  rawLog: result.rawLog,
});

switch (decoded.kind) {
  case "spending_limit_exceeded": // over the per-tx or daily SpendingRule
    break;
  case "session_key_expired":     // expiryUnix passed — re-register the key
    break;
  case "permission_denied":       // scope missing — check the permission_schema
    break;
  case "authenticator_replay":    // wrong nonce — refetch and re-sign
    break;
  case "hybrid_verify_failed":    // ML-DSA sig did not verify (see note below)
    break;
}
```

`hybrid_verify_failed` は ML-DSA-87 署名が検証されなかったことを意味します。hedged 署名は原因ではありません
（チェーンは hedged と決定的な ML-DSA-87 署名を同様に受け入れます）。
[コード 21 のトラブルシューティング](/developer-guide/post-quantum-signing#code-21) を参照してください。また、0.6.1 より前の SDK がハイブリッド拡張を JSON エンコードした場合にも表示されます（アップグレードしてください。
[アカウントと PQC 署名](/sdk/concepts/accounts-pqc#hybrid-signing)を参照）。

## キーローテーション {#key-rotation}

アカウントの ML-DSA-87 キーを、**同じ**アルゴリズムの新しいキーにローテーションします — 例えば、レガシーな chain-bridge 派生キー（`shake256(mnemonic)`）を、正準のアドレス拘束キー
（`shake256("qorechain:pqc:v1|addr|mnemonic")`）へ移行する場合です。

```ts
import { rotatePqcKeyMsgFromMnemonic, derivePqcLegacy } from "@qorechain/sdk";

const { msg, oldKeypair, newKeypair } = rotatePqcKeyMsgFromMnemonic({
  account,
  mnemonic,
  chainId: "qorechain-vladi",
  // oldDerivation: "bridge" (legacy), newDerivation: "adapter" (canonical) by default
});
// broadcast `msg` BY the account, cosigned (hybrid) with the OLD key —
// both keys dual-sign the rotation bytes (old proves ownership, new proves control).
```

`derivePqcLegacy(mnemonic)` は、必要なとき（例: ローテーションが確定するまで署名を続ける場合）に、レガシーな鍵ペアを単独で再現します。

## 次のステップ

- [アカウントと PQC 署名](/sdk/concepts/accounts-pqc) — 統合アカウントとハイブリッド署名。
- [アカウント抽象化](/developer-guide/account-abstraction) — チェーン側のモジュール。
- 実行可能なサンプル:
  [`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend)。
