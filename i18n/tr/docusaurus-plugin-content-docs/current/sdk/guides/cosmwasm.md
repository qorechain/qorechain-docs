---
slug: /sdk/guides/cosmwasm
title: QoreChain Native Kılavuzu
sidebar_label: QoreChain Native
sidebar_position: 3
---

# QoreChain Native kılavuzu

QoreChain Native, QoreChain'in CosmWasm akıllı sözleşme çalışma zamanı için kullandığı addır; bu nedenle bu sayfada adı geçen CosmWasm kütüphaneleri ve istemci paketleri, onunla birlikte kullandığınız paketlerdir.

TypeScript çekirdeği (`@qorechain/sdk`), QoreChain Native sözleşmelerini sorgulamak ve
yürütmek için `@cosmjs/cosmwasm-stargate` üzerinde ince, tipli sarmalayıcılar
içerir. Okumalar salt okunur bir istemci kullanır; durum değişiklikleri ise
imzalayan bir istemci kullanır.

## Salt okunur sorgular

`createClient()` örneğinizden salt okunur bir QoreChain Native istemcisi açın — konsensüs
RPC uç noktası üzerinden bağlanır ve istemcide önbelleğe alınır (memoized).

```ts
import {
  createClient,
  queryContractSmart,
  getContractInfo,
} from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: { rpc: "https://rpc-testnet.qore.host" }, // mainnet: https://rpc.qore.host
});

const cw = await client.cosmwasm(); // read-only CosmWasmReadClient

// Contract metadata.
const info = await getContractInfo(cw, contractAddress);

// A smart query (the message shape is contract-specific).
const result = await queryContractSmart(cw, contractAddress, { token_info: {} });
```

Ayrıca `createCosmWasmClient` ile doğrudan bir okuma istemcisi de
oluşturabilirsiniz.

## İmzalama: instantiate, execute, upload

:::caution Yükleme ve instantiate izne tabidir
`qorechain-vladi` (mainnet) üzerinde `code_upload_access` ve
`instantiate_default_permission` `Nobody` olarak ayarlıdır; ayrıca `MsgStoreCode` /
`MsgInstantiateContract` / `MsgInstantiateContract2` zincirin devre kesicisi
(circuit breaker) tarafından da kapatılmıştır, bu nedenle sıradan hesaplar için
`uploadCode` ve `instantiate` reddedilir. `qorechain-diana` (testnet, 27 Ekim 2026'da kontrol edildi)
üzerinde `code_upload_access` `Nobody`'dir ve yalnızca `MsgStoreCode` kapatılmıştır;
`instantiate_default_permission` ise `Everybody`'dir, dolayısıyla orada halihazırda var olan
kod için `instantiate` açıktır. Halihazırda var olan sözleşmeler
sorgulanabilir (yukarıda) ve yürütülebilir. Güncel izinler için
`GET /cosmwasm/wasm/v1/codes/params` adresine bakın.
Bkz. [QoreChain Native Geliştirme](/developer-guide/cosmwasm-development).
:::

:::caution QoreChain Native imzalayan istemci klasik olarak imzalar
`connectCosmWasmSigner`, yalnızca klasik secp256k1 imzasını ekleyen CosmJS imzalayan
istemcisini sarmalar. Canlı ağlar, her Native yol işleminde hibrit
(secp256k1 + ML-DSA-87) imza gerektirir; bu nedenle onun üzerinden gönderilen bir
işlem orada reddedilir; hibrit uzantıyı gerektirmeyen bir düğüme (yerel bir geliştirme
düğümü) karşı çalışır. Canlı bir ağda `execute` için mesajı oluşturun ve
`signAndBroadcastHybrid` ile gönderin (aşağıdaki örnek).
:::

Klasik imzaları kabul eden bir düğüme karşı durum değişiklikleri için,
`connectCosmWasmSigner` ile imzalayan bir istemci bağlayın (bu, 
`directSignerFromPrivateKey` tarafından üretilenle aynı türde bir çevrimdışı
imzalayıcı alır), ardından tipli sarmalayıcıları kullanın. Sonuç tipini
vermediğiniz sürece yardımcı fonksiyonlar `Promise<unknown>` döndürür:

```ts
import {
  connectCosmWasmSigner,
  uploadCode,
  instantiate,
  execute,
} from "@qorechain/sdk";

const signingCw = await connectCosmWasmSigner(rpcUrl, signer);

// Upload Wasm bytecode -> a code id.
const { codeId } = await uploadCode<{ codeId: number }>(
  signingCw, sender, wasmBytes, "auto",
);

// Instantiate a contract from a code id (the last argument is InstantiateOpts).
const { contractAddress } = await instantiate<{ contractAddress: string }>(
  signingCw,
  sender,
  codeId,
  { /* init msg */ },
  "label",
  { fee: "auto" },
);

// Execute a message against a deployed contract.
const res = await execute(
  signingCw,
  sender,
  contractAddress,
  { /* execute msg */ },
  "auto",
);
```

Tam argüman şekilleri `@cosmjs/cosmwasm-stargate`'i izler; SDK, tipli
`ContractMsg`, `FeeInput`, `InstantiateOpts`, `CosmWasmReadClient` ve
`CosmWasmSigningClient` türlerini ekler.

### Canlı bir ağda yürütme (hibrit)

QoreChain Native mesaj türlerini bir registry'ye ekleyin ve `MsgExecuteContract`'ı hibrit
oluşturucu üzerinden gönderin. Hesabın ML-DSA-87 anahtarı önce kaydedilmiş olmalıdır
(bkz. [Kuantum güvenli](/sdk/guides/quantum-safe)). Şunu gerektirir:
`npm i @cosmjs/cosmwasm-stargate @cosmjs/proto-signing cosmjs-types @cosmjs/stargate`:

```ts
import { Registry } from "@cosmjs/proto-signing";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import {
  qorechainRegistryTypes,
  signAndBroadcastHybrid,
  derivePqcCanonical,
} from "@qorechain/sdk";

const registry = new Registry([...qorechainRegistryTypes, ...wasmTypes]);
const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(sender);

const result = await signAndBroadcastHybrid({
  registry,
  signer,                                            // from directSignerFromPrivateKey
  pqcKeypair: derivePqcCanonical(sender, mnemonic),  // the key registered on-chain
  messages: [
    {
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: MsgExecuteContract.fromPartial({
        sender,
        contract: contractAddress,
        msg: new TextEncoder().encode(JSON.stringify({ /* execute msg */ })),
        funds: [],
      }),
    },
  ],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,
});
```

Çalıştırılabilir bir okuma örneği için `cosmwasm-query`
[örneğine](/sdk/examples) bakın.
