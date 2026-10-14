---
slug: /sdk/guides/cosmwasm
title: Guide CosmWasm
sidebar_label: CosmWasm
sidebar_position: 3
---

# Guide CosmWasm

Le cœur TypeScript (`@qorechain/sdk`) inclut de fins wrappers typés au-dessus de
`@cosmjs/cosmwasm-stargate` pour interroger et exécuter des contrats CosmWasm. Les lectures
utilisent un client en lecture seule ; les changements d'état utilisent un client de signature.

## Requêtes en lecture seule

Ouvrez un client CosmWasm en lecture seule à partir de votre instance `createClient()` — il
se connecte via le point de terminaison RPC de consensus et est mémorisé sur le client.

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

Vous pouvez également construire un client de lecture directement avec `createCosmWasmClient`.

## Signature : instancier, exécuter, téléverser

:::caution Le téléversement et l'instanciation sont soumis à permission
`code_upload_access` et `instantiate_default_permission` valent `Nobody` sur
`qorechain-vladi` et `qorechain-diana`, et `MsgStoreCode` /
`MsgInstantiateContract` / `MsgInstantiateContract2` sont en outre désactivés par le
disjoncteur de la chaîne ; `uploadCode` et `instantiate` sont donc refusés pour les
comptes ordinaires. Les contrats qui existent déjà peuvent être interrogés (ci-dessus)
et exécutés. Consultez `GET /cosmwasm/wasm/v1/codes/params` pour connaître les
permissions en vigueur.
Voir [Développement CosmWasm](/developer-guide/cosmwasm-development).
:::

:::caution Le client de signature CosmWasm signe de manière classique
`connectCosmWasmSigner` encapsule le client de signature CosmJS, qui n'attache que la
signature classique secp256k1. Les réseaux en production exigent la signature hybride
(secp256k1 + ML-DSA-87) sur chaque transaction du chemin Native ; une transaction envoyée
par ce biais y est donc refusée. Elle fonctionne face à un nœud qui n'exige pas
l'extension hybride (un nœud de développement local). Pour un `execute` sur un réseau en
production, construisez le message et envoyez-le avec `signAndBroadcastHybrid` (exemple
ci-dessous).
:::

Pour les changements d'état face à un nœud qui accepte les signatures classiques, connectez un
client de signature avec `connectCosmWasmSigner` (il prend un signataire hors ligne, du même
type que celui produit par `directSignerFromPrivateKey`), puis utilisez les wrappers typés.
Les helpers renvoient `Promise<unknown>` sauf si vous indiquez le type du résultat :

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

Les formes exactes des arguments suivent `@cosmjs/cosmwasm-stargate` ; le SDK ajoute les types
typés `ContractMsg`, `FeeInput`, `InstantiateOpts`, `CosmWasmReadClient` et
`CosmWasmSigningClient`.

### Exécuter sur un réseau en production (hybride)

Ajoutez les types de messages CosmWasm à un registre et envoyez le `MsgExecuteContract`
via le constructeur hybride. La clé ML-DSA-87 du compte doit d'abord avoir été enregistrée
(voir [Quantum-safe](/sdk/guides/quantum-safe)). Nécessite
`npm i @cosmjs/cosmwasm-stargate @cosmjs/proto-signing cosmjs-types @cosmjs/stargate` :

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

Voir l'[exemple](/sdk/examples) `cosmwasm-query` pour un exemple de lecture exécutable.
