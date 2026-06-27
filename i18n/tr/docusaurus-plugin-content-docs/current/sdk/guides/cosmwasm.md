---
slug: /sdk/guides/cosmwasm
title: CosmWasm Kılavuzu
sidebar_label: CosmWasm
sidebar_position: 3
---

# CosmWasm kılavuzu

TypeScript çekirdeği (`@qorechain/sdk`), CosmWasm sözleşmelerini sorgulamak ve
yürütmek için `@cosmjs/cosmwasm-stargate` üzerinde ince, tipli sarmalayıcılar
içerir. Okumalar salt okunur bir istemci kullanır; durum değişiklikleri ise
imzalayan bir istemci kullanır.

## Salt okunur sorgular

`createClient()` örneğinizden salt okunur bir CosmWasm istemcisi açın — konsensüs
RPC uç noktası üzerinden bağlanır ve istemcide önbelleğe alınır (memoized).

```ts
import {
  createClient,
  queryContractSmart,
  getContractInfo,
} from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: { rpc: "https://rpc.testnet.example" },
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

Durum değişiklikleri için, `connectCosmWasmSigner` ile imzalayan bir istemci
bağlayın (bu, `directSignerFromPrivateKey` tarafından üretilenle aynı türde bir
çevrimdışı imzalayıcı alır), ardından tipli sarmalayıcıları kullanın:

```ts
import {
  connectCosmWasmSigner,
  uploadCode,
  instantiate,
  execute,
} from "@qorechain/sdk";

const signingCw = await connectCosmWasmSigner(rpcUrl, signer);

// Upload Wasm bytecode -> a code id.
const { codeId } = await uploadCode(signingCw, sender, wasmBytes, fee);

// Instantiate a contract from a code id.
const { contractAddress } = await instantiate(
  signingCw,
  sender,
  codeId,
  { /* init msg */ },
  "label",
  fee,
);

// Execute a message against a deployed contract.
const res = await execute(
  signingCw,
  sender,
  contractAddress,
  { /* execute msg */ },
  fee,
);
```

Tam argüman şekilleri `@cosmjs/cosmwasm-stargate`'i izler; SDK, tipli
`ContractMsg`, `FeeInput`, `InstantiateOpts`, `CosmWasmReadClient` ve
`CosmWasmSigningClient` türlerini ekler.

Çalıştırılabilir bir okuma örneği için `cosmwasm-query`
[örneğine](/sdk/examples) bakın.
