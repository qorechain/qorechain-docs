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
(bkz. [Hibrit imzalama](/sdk/guides/quantum-safe)). Şunu gerektirir:
`npm i @cosmjs/cosmwasm-stargate @cosmjs/proto-signing cosmjs-types @cosmjs/stargate`:

```ts
import { Registry } from "@cosmjs/proto-signing";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import {
  qorechainRegistryTypes,
  signAndBroadcastHybrid,
  derivePqcCanonical,
} from "@qorechain/sdk";

const registry = new Registry([...qorechainRegistryTypes, ...wasmTypes]);
const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(sender);

// Never hardcode gas for a contract call: simulate it, then add at least 30%.
// The simulation already includes the cost of loading the contract code and a
// congestion margin (see "Gas for contract calls" below).
const cwClient = await SigningCosmWasmClient.connectWithSigner(
  "https://rpc.qore.host",
  signer,
);
const msgs = [
  {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.fromPartial({
      sender,
      contract: contractAddress,
      msg: new TextEncoder().encode(JSON.stringify({ /* execute msg */ })),
      funds: [],
    }),
  },
];
const simulatedGas = await cwClient.simulate(sender, msgs, undefined);
const gas = Math.ceil(simulatedGas * 1.3);
const gasPrice = 0.15; // uqor per unit of gas; the network floor is 0.1

const result = await signAndBroadcastHybrid({
  registry,
  signer,                                            // from directSignerFromPrivateKey
  pqcKeypair: derivePqcCanonical(sender, mnemonic),  // the key registered on-chain
  messages: msgs,
  fee: {
    amount: [{ denom: "uqor", amount: String(Math.ceil(gas * gasPrice)) }],
    gas: String(gas),
  },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,
});
```

### Sözleşme çağrıları için gas {#gas}

**Bir sözleşme çağrısı için gas'i sabit yazmayın.** Sabit 400.000, basit bir transfer için bir çağrıda yeterli olur ve bir sonrakinde yetmez. v3.2.8 sürümünden itibaren (daha sonraki bir ana ağ yükseltmesine kadar yalnızca test ağında) CosmWasm gas'i yeniden fiyatlandırılır:

- **Bir sözleşme kodunun bir blokta ilk çağrısı bir yükleme maliyeti öder.** Bir cw20 transferi, kodunun blokta ilk çağrısı olarak yaklaşık 533.000 gas, her tekrar için yaklaşık 84.000 gas tutar. Yönetişim popüler kodları sabitleyebilir (pin) ve sabitlenmiş kodlar yükleme ücretinden muaftır.
- **Ücretler tıkanıklıkla artar.** Bloklar sözleşme çağrılarıyla meşgulken bir tıkanıklık çarpanı sözleşme gas'ini varsayılan olarak 1x'ten 20x'e kadar ölçekler ve bir bloğun, tek bir işlemin en fazla yarısını kullanabileceği sınırlı bir sözleşme yürütme bütçesi vardır.
- **Simülasyon ikisini de içerir.** Bir simülasyon her zaman soğuk yüklemeyi ücretlendirir ve tıkanıklık için bir pay ekler; bu yüzden `simüle edilen gas x 1,3` güvenli bir limittir. İstemciniz sunuyorsa `fee: "auto"` kullanın (CosmJS `"auto"`, SDK `TxClient`, React `useTx` hook'u) ve ücreti yukarıdaki gibi elle kurarken kendiniz simülasyon yapın.
- **İşlem üst sınırının altında kalın.** Bir Cosmos işlemi 50.000.000'un üzerinde bir gas limiti belirleyemez ve ücreti alınmadan önce reddedilir.

Aynısı instantiate, migrate ve sözleşme kodu çalıştıran her diğer mesaj için de geçerlidir.

Çalıştırılabilir bir okuma örneği için `cosmwasm-query`
[örneğine](/sdk/examples) bakın.
