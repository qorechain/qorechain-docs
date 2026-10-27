---
slug: /sdk/guides/quantum-safe
title: デフォルトでハイブリッド署名
sidebar_label: ハイブリッド署名
sidebar_position: 6
---

# デフォルトでハイブリッド署名

QoreChain はポスト量子暗号を**第一級**の署名方式として扱います。
アカウントは**ML-DSA-87（Dilithium-5、NIST FIPS 204）**鍵をオンチェーンに登録し、
その後トランザクションは**ハイブリッド**署名（通常の
古典的な secp256k1 署名**に加えて** ML-DSA-87 署名）を持つことができます。チェーンの ante
handler は両方を検証するため、鍵を登録したアカウントは古典的な検証と完全な互換性を保ちながら、
そのトランザクションはポスト量子署名も持つことになります。

SDK はこれを小さく冪等な API にまとめており、dApp は
**デフォルトでハイブリッド**署名を行います。鍵の登録に必要な呼び出しはたった 1 回です。稼働中のネットワークでは、
Native パスのトランザクションにとってこれは任意ではありません。鍵は**明示的に**登録する必要があり
（最初のトランザクションでの自動登録はありません）、その後はすべての
Native パスのトランザクションがハイブリッド署名を持たなければなりません。

## ステータスの確認 {#check-status}

`isPqcRegistered` / `getPqcStatus` は、アドレスに登録済みの PQC 鍵があるかどうかを読み取ります。
`createClient` で合成したクライアントを渡すと REST 経由で読み取ります
（`GET /qorechain/pqc/v1/account/{address}`、すべての公開エンドポイントが提供）。素の
`QorClient` を渡すと `qor_getPQCKeyStatus` JSON-RPC メソッドを使用しますが、**公開エンドポイントは
これを提供していません**（
[`qor_` 名前空間](/api-reference/json-rpc-qor_-namespace)を参照）。そのため
`*.qore.host` に対しては、合成したクライアントを渡してください。0.9.0 より前のリリースは常に
`qor_` メソッドを使用し、JSON-RPC エラー `-32601` で失敗しました。それらでは、REST ルートを
直接読み取ってください。

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

const registered = await isPqcRegistered(client, address); // boolean
const status = await getPqcStatus(client, address);
// { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

ルートは `GET /qorechain/pqc/v1/account/{address}`（`account` は単数形）です。登録済みのアドレスには
`{"found": true, "account": {…}}` を、
それ以外には `{"found": false, "account": null}` を返します。`client.rest.getPqcAccount(address)` は
その本文を返し、`fetchPqcStatus({ rest, address })` はそれを上記のステータスに変換します。
読み取れない応答（HTTP エラー、トランスポート障害）は、1 回再試行した後にスローされます。
「未登録」として読み取られることは決してありません。0.8.x では、`getPqcAccount` は複数形の
`/accounts/` パスを呼び出していましたが、チェーンはそのパスを提供していません。

同じステータスは EVM 側でも、
`0x0000000000000000000000000000000000000A02` にある
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
プリコンパイル（`@qorechain/evm` では `pqcKeyStatus` として公開）が有効になれば、それを介して読み取れます。
このプリコンパイルはメインネットでは有効ではなく、テストネットでは有効として列挙されています（2026年10月27日に確認。
[ネットワークの状況](/developer-guide/evm-precompiles#network-status)を参照）。

## 1 回の呼び出しで登録 {#register-in-one-call}

`ensurePqcRegistered` はアカウントの ML-DSA-87 鍵を登録します。署名者の ML-DSA-87 公開鍵を用いて
`MsgRegisterPQCKeyV2` を構築し、ブロードキャストします。これは**冪等**です。
まずアカウントのステータスを（`rest` を渡した場合は REST 経由で）読み取り、アカウントがこの鍵ペアの鍵を
すでに保持している場合は登録をスキップするため、
アプリ起動のたびに呼び出しても安全です。アカウントが*別の*鍵を保持している場合は
`PqcKeyMismatchError` を投げ、何も送信しません。あなたの鍵ペアで署名されたすべての
ハイブリッドトランザクションが拒否されてしまうためです。盲目的に登録することは決してありません。
ステータスを読み取れない場合は例外を投げます（鍵がないと分かっているアカウントに限り `force: true` を渡してください）。

登録は古典署名で行われ、ハイブリッド要件の対象外となっているため、新しい
アカウントでも最初の鍵をブートストラップできます。v3.2.3 以降、この免除が適用されるのは
鍵を持たないアカウントのみです（すでに鍵を保持しているアカウントは、登録や移行をハイブリッド署名しなければならず、
チェーンは弱い鍵、縮退した鍵、再利用された鍵を拒否します）。ネットワークが
v3.2.3 を適用すると、ヘルパーは新しい鍵で任意の**所有証明**に署名してそれを付加します
（チェーン ID は `chainId` またはノードから読み取り、v3.2.3 を適用していないネットワークでは
フィールドを付けません。古いノードはそれを拒否するためです）。署名は CosmJS 署名者、つまり
coin type 118 のアカウント（`deriveNativeAccount`）を通じて行われます。統合 eth-native アカウントの場合は、
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

// The address-bound key, recoverable from { address, mnemonic } (0.8.3+; see below).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// With the keypair the client signs every transaction hybrid; the registration
// itself stays classical (the chain's bootstrap path).
const tx = await client.connectTx(signer, { pqcKeypair });

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  rest: client.network.endpoints.rest,
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }

await tx.bankSend("qor1…", [{ denom: "uqor", amount: "1000000" }]); // hybrid-signed
```

### 復元できる鍵 {#canonical-derivation}

`derivePqcCanonical(address, mnemonic)` は、アカウントのアドレスとニーモニックから ML-DSA-87 鍵を導出するため、
紛失したデバイスも復元でき、すべての言語とウォレットが同じ鍵を導出します（1 つのニーモニックにつき、
アカウントごとに 1 つの鍵）。まずアドレスを小文字の `qor1…` 形式に解決するため、統合アカウントの
`0x` 形式でも同じ鍵が得られます。各言語の対応する関数:

| 言語 | 関数 | 公開バージョン |
| --- | --- | --- |
| TypeScript | `derivePqcCanonical(address, mnemonic)`（`@qorechain/sdk`） | 0.9.0 |
| Python | `derive_pqc_canonical(address, mnemonic)`（`qorsdk`） | 0.9.0 |
| Go | `authenticator.DerivePQCCanonical(address, mnemonic)` | v0.9.0 |
| Rust | `authenticator::try_derive_pqc_canonical(address, mnemonic)`（`Result` を返す） | 0.9.0 |
| Java | `Authenticator.derivePqcCanonical(address, mnemonic)` | 0.9.0 |

レガシーの導出（`derivePqcLegacy`、`"bridge"`）はアカウントにバインドされておらず、
新しい鍵には非推奨です。ローテーションヘルパーは、それを新しい鍵として拒否します（
[鍵のローテーション](#rotate-a-key)を参照）。

Python での登録（0.9.0。ステータスの読み取りは REST 経由で行われ、別の鍵が登録されている場合は
2 回目の登録に手数料を払う代わりに `PqcKeyMismatchError` を送出します）:

```python
import httpx
from qorsdk import derive_native_account, derive_pqc_canonical, ensure_pqc_registered, fetch_pqc_status

REST = "https://api.qore.host"
native = derive_native_account(mnemonic, 0)
pqc_keypair = derive_pqc_canonical(native.address, mnemonic)

print(fetch_pqc_status(REST, native.address))  # {'registered': False} for a new account

acct = httpx.get(f"{REST}/cosmos/auth/v1beta1/accounts/{native.address}").json()["account"]
result = ensure_pqc_registered(
    account=native,
    pqc_keypair=pqc_keypair,
    chain_id="qorechain-vladi",
    account_number=int(acct["account_number"]),
    sequence=int(acct.get("sequence", 0)),
    rest_url=REST,
    fee={"amount": [{"denom": "uqor", "amount": "60000"}], "gas": "600000"},
)
```

Go（`pqcdx.Signer.RestURL`）、Rust（`pqc_dx` の `rest_url`）、Java
（`signer.restUrl`）のヘルパーは、同じ REST ルートからステータスを読み取り、
同じ方法で所有証明を付加します。

その他の SDK は、それぞれのハイブリッドトランザクションビルダー
（Python と Rust では `build_hybrid_tx`、Go では `tx.BuildHybridMessages`、
Java では `PqcDx.HybridSendPath`）を通じてハイブリッド署名を行います。ハイブリッドで自動的に署名してくれるのは
TypeScript の `TxClient` だけです。

:::warning 必ず先に確認させてください
チェーンは、同じ鍵の 2 回目の登録を**手数料を徴収した後に**拒否します。
そのため `ensurePqcRegistered` は、まず REST（`/qorechain/pqc/v1/account/{address}`）で
ステータスを読み取り、判断できない場合は登録を拒否します。`rest`（`qor_*` を公開するノード向けの `statusSource`、
または事前に読み取った `status`）を渡してください。`force: true` はチェックをスキップします。
0.8.x では、このヘルパーに REST へのフォールバックがなく、自分で `status` を渡さない限り、
チェックなしで登録をブロードキャストしていました。
:::

## ハイブリッド署名

クライアントに `pqcKeypair` を持たせると、`tx.bankSend(...)` と
`tx.signAndBroadcast([messages], "auto")` はハイブリッドで署名します（`fee: "auto"` の経路は
ハイブリッドトランザクションをシミュレートし、ポスト量子検証のガスを加算します）。
ハイブリッド署名は、ネットワークが検証する sign-bytes 形式に対して計算されます（
[どの sign-bytes 形式か?](/sdk/concepts/accounts-pqc#sign-bytes-versions)を参照）。クライアントは
REST エンドポイントを通じてネットワークに問い合わせます。

`migrateToHybrid` は登録を保証し、下位レベルの `buildHybridTx` / `signAndBroadcastHybrid`
ビルダーに鍵ペアを事前バインドしたハイブリッド送信パスを返します。これは、手数料、アカウント番号、
シーケンスを自分で管理する場合のものです。SDK が sign-bytes 形式を解決できるよう、
`rest` を渡してください:

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  rest: "https://api.qore.host",
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

## 鍵のローテーション {#rotate-a-key}

アカウントの ML-DSA-87 鍵を**同じ**アルゴリズムの別の鍵に置き換えるには
（たとえば、レガシーの `shake256(mnemonic)` 鍵をアドレスにバインドされた正規の
鍵に移行する場合や、漏洩した鍵を廃止する場合）、
`rotatePqcKeyMsgFromMnemonic` で `MsgRotatePQCKey` を構築します。両方の鍵がこれに共同で署名します。
完全な例は[鍵のローテーション](/sdk/guides/authenticators#key-rotation)を参照してください。

`migratePqcKeyHybrid` は従来の `MsgMigratePQCKey` をブロードキャストします。これはアカウントを
**アルゴリズム**間で移行するもので、v3.2.3 以降、鍵を持つアカウントにチェーンが要求するハイブリッド署名を
伴います。`pqcKeypair` は**現在**登録されている鍵（ローテーションで外す側の鍵）で、
呼び出し側が 2 つの所有署名（旧鍵による `oldSignature`、新鍵による `newSignature`）を用意します。
古典署名の `migratePqcKey` は非推奨です。v3.2.3 のノードは、鍵を持つアカウントからの
古典署名による移行を拒否します。

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migratePqcKeyHybrid, qorechainRegistry } from "@qorechain/sdk";

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await migratePqcKeyHybrid({
  sender: account.address,
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,   // the currently registered key
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,
});
```

## UI 内で

[`@qorechain/react`](/sdk/guides/react) キットはこれらすべてを React で公開しています。
`usePqcStatus` フックと `<QuantumSafeBadge/>` コンポーネントは、接続中のアカウントに
登録済みの PQC 鍵がある場合にステータスインジケーターを表示します。どちらも
合成したクライアントとともに `getPqcStatus` を通じてステータスを読み取るため、`@qorechain/react`
0.9.0 以降は REST 経由で読み取り、公開エンドポイントに対して動作します。0.8.x では、そこで
鍵を確認できませんでした。
