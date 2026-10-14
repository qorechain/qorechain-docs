---
slug: /sdk/guides/quantum-safe
title: デフォルトで量子耐性
sidebar_label: 量子耐性
sidebar_position: 6
---

# デフォルトで量子耐性

QoreChain はポスト量子暗号を**第一級**の署名方式として扱います。
アカウントは**ML-DSA-87（Dilithium-5、NIST FIPS 204）**鍵をオンチェーンに登録し、
その後トランザクションは**ハイブリッド**署名（通常の
古典的な secp256k1 署名**に加えて** ML-DSA-87 署名）を持つことができます。チェーンの ante
handler は両方を検証するため、量子耐性アカウントは古典的な検証と完全な互換性を保ちながら、
将来の量子敵対者に対する保護を獲得します。

SDK はこれを小さく冪等な API にまとめており、dApp は
**デフォルトで量子耐性**になります。PQC で保護するための呼び出しはたった 1 回です。稼働中のネットワークでは、
Native パスのトランザクションにとってこれは任意ではありません。鍵は**明示的に**登録する必要があり
（最初のトランザクションでの自動登録はありません）、その後はすべての
Native パスのトランザクションがハイブリッド署名を持たなければなりません。

## ステータスの確認 {#check-status}

`isPqcRegistered` / `getPqcStatus` は、`qor_getPQCKeyStatus` JSON-RPC メソッドを介して
アドレスに登録済みの PQC 鍵があるかどうかを読み取ります。これらは
`QorClient` または `createClient` で合成したクライアントのいずれかを受け取ります。**公開エンドポイントは
`qor_` 名前空間を提供していません**（
[`qor_` 名前空間](/api-reference/json-rpc-qor_-namespace)を参照）。そのため
`*.qore.host` に対しては、これらのヘルパーは JSON-RPC エラー `-32601` で失敗します。代わりに
REST でステータスを読み取ってください:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

async function isPqcRegistered(address: string): Promise<boolean> {
  const res = await client.rest.get<{ found: boolean }>(
    `/qorechain/pqc/v1/account/${address}`,
  );
  return res.found;
}
```

ルートは `GET /qorechain/pqc/v1/account/{address}`（`account` は単数形）です。登録済みのアドレスには
`{"found": true, "account": {…}}` を、
それ以外には `{"found": false, "account": null}` を返します。このために `client.rest.getPqcAccount` を使わないでください。
これは複数形の `/accounts/` パスを呼び出しますが、チェーンはそのパスを提供していません。

`isPqcRegistered(client, address)` と `getPqcStatus(client, address)`（`statusSource`
オプション付き）は、`qor` 名前空間を提供するノードに対しては引き続き正しい呼び出しです。
その結果は
`{ registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }` です。

同じステータスは EVM 側でも、
`0x0000000000000000000000000000000000000A02` にある
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
プリコンパイル（`@qorechain/evm` では `pqcKeyStatus` として公開）が有効になれば、それを介して読み取れます。
このプリコンパイルはメインネットでもテストネットでもまだ
有効ではありません（
[ネットワークの状況](/developer-guide/evm-precompiles#network-status)を参照）。次の SDK
パッチリリースでは、`.rest` を公開するクライアント（合成クライアントなど）が渡された場合は上記の REST ルートに
フォールバックし、ステータスを読み取れないときは「未登録」と報告する代わりに
例外を投げます。

## 1 回の呼び出しで登録

`ensurePqcRegistered` はアカウントを量子耐性にします。署名者の ML-DSA-87 公開鍵とアカウントの
ECDSA 公開鍵を用いて `MsgRegisterPQCKeyV2` を構築し、ブロードキャストします。事前に読み取った `status`（または
`statusSource`）を渡すと**冪等**になります。鍵がすでに登録されている場合は登録をスキップするため、
アプリ起動のたびに呼び出しても安全です。

登録は古典署名で行われ、ハイブリッド要件の対象外となっているため、新しい
アカウントでも最初の鍵をブートストラップできます。登録は CosmJS 署名者、つまり
coin type 118 のアカウント（`deriveNativeAccount`）を通じて署名されます。統合 eth-native アカウントの場合は、
`EthNativeSigner` と `signMode: "classical"` で登録に署名してください（
[アカウントと PQC 署名](/sdk/concepts/accounts-pqc#hybrid-signing)を参照）。2,592 バイトの
鍵には約 600,000 のガスリミットが必要です。ネットワークの最低ガス価格は
ガス 1 単位あたり 0.1 uqor です。

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  ensurePqcRegistered,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const tx = await client.connectTx(signer);

// The address-bound key, recoverable from { address, mnemonic } (SDK 0.8.3+).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// Read the status over REST: the default status source needs the `qor_` namespace.
const { found } = await client.rest.get<{ found: boolean }>(
  `/qorechain/pqc/v1/account/${account.address}`,
);

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }
```

## ハイブリッド署名

`migrateToHybrid` は登録を保証し、既存の `buildHybridTx` / `signAndBroadcastHybrid`
ビルダーに鍵ペアを事前バインドしたハイブリッド送信パスを返します。
ネットワークがどのハイブリッド sign-bytes 形式を検証するかを SDK が判定できるよう、`rest` を渡してください
（
[どの sign-bytes 形式か?](/sdk/concepts/accounts-pqc#sign-bytes-versions)を参照）:

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await hybrid.signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,          // classical secp256k1 direct signer
  messages,
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,       // a connected broadcast transport (e.g. StargateClient)
});
```

チェーンは、hedged でも決定論的でも、有効な FIPS-204 ML-DSA-87 署名であれば何でも受け入れます。
SDK はデフォルトで決定論的に署名する（0.5.1 以降）ため、
トランザクションは常に同じ署名と同じ tx ハッシュを持ちます。ハイブリッド tx が
`pqc` コード 21（`hybrid_verify_failed`）で失敗した場合、原因は sign-bytes のバージョン、
chain-id、古い PQC ライブラリ、あるいは未登録または別の鍵であり、hedged 署名が原因であることはありません。
[コード 21 のトラブルシューティング](/developer-guide/post-quantum-signing#code-21)を参照してください。

## 鍵のローテーション

アカウントの ML-DSA-87 鍵を**同じ**アルゴリズムの別の鍵に置き換えるには
（たとえば、レガシーの `shake256(mnemonic)` 鍵をアドレスにバインドされた正規の
鍵に移行する場合や、漏洩した鍵を廃止する場合）、
`rotatePqcKeyMsgFromMnemonic` で `MsgRotatePQCKey` を構築します。両方の鍵がこれに共同で署名します。
完全な例は[鍵のローテーション](/sdk/guides/authenticators#key-rotation)を参照してください。

`migratePqcKey` は従来の `MsgMigratePQCKey` をブロードキャストします。これはアカウントを
**アルゴリズム**間で移行するもので、両方の署名を呼び出し側が用意する必要があります:

```ts
import { migratePqcKey } from "@qorechain/sdk";

await migratePqcKey(tx, {
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
});
```

## UI 内で

[`@qorechain/react`](/sdk/guides/react) キットはこれらすべてを React で公開しています。
`usePqcStatus` フックと `<QuantumSafeBadge/>` コンポーネントは、接続中のアカウントに
登録済みの PQC 鍵がある場合に**量子耐性**インジケーターを表示します。どちらも
`getPqcStatus` を通じてステータスを読み取るため、公開エンドポイント（`qor_`
名前空間なし）に対しては現時点で鍵を確認できません。稼働中のネットワークの制限については
React ページを参照してください。
