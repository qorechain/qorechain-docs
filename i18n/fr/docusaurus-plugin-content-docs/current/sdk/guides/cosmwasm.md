---
slug: /sdk/guides/cosmwasm
title: Guide QoreChain Native
sidebar_label: QoreChain Native
sidebar_position: 3
---

# Guide QoreChain Native

QoreChain Native est le nom donné par QoreChain à son runtime de contrats intelligents CosmWasm ; les bibliothèques CosmWasm et les paquets clients nommés sur cette page sont donc ceux que vous utilisez avec lui.

Le cœur TypeScript (`@qorechain/sdk`) inclut de fins wrappers typés au-dessus de
`@cosmjs/cosmwasm-stargate` pour interroger et exécuter des contrats QoreChain Native. Les lectures
utilisent un client en lecture seule ; les changements d'état utilisent un client de signature.

## Requêtes en lecture seule

Ouvrez un client QoreChain Native en lecture seule à partir de votre instance `createClient()` — il
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
Sur `qorechain-vladi` (mainnet), `code_upload_access` et
`instantiate_default_permission` valent `Nobody`, et `MsgStoreCode` /
`MsgInstantiateContract` / `MsgInstantiateContract2` sont en outre désactivés par le
disjoncteur de la chaîne ; `uploadCode` et `instantiate` sont donc refusés pour les
comptes ordinaires. Sur `qorechain-diana` (testnet, vérifié le 27 octobre 2026),
`code_upload_access` vaut `Nobody` et seul `MsgStoreCode` est désactivé, tandis que
`instantiate_default_permission` vaut `Everybody` : `instantiate` y est donc ouvert pour
du code qui existe déjà. Les contrats qui existent déjà peuvent être interrogés (ci-dessus)
et exécutés. Consultez `GET /cosmwasm/wasm/v1/codes/params` pour connaître les
permissions en vigueur.
Voir [Développement QoreChain Native](/developer-guide/cosmwasm-development).
:::

:::caution Le client de signature QoreChain Native signe de manière classique
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

Ajoutez les types de messages QoreChain Native à un registre et envoyez le `MsgExecuteContract`
via le constructeur hybride. La clé ML-DSA-87 du compte doit d'abord avoir été enregistrée
(voir [Signature hybride](/sdk/guides/quantum-safe)). Nécessite
`npm i @cosmjs/cosmwasm-stargate @cosmjs/proto-signing cosmjs-types @cosmjs/stargate` :

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

### Gas des appels de contrat {#gas}

**Ne codez pas le gas en dur pour un appel de contrat.** Un gas fixe de 400,000
suffit pour un simple transfert sur un appel et s'épuise au suivant. À partir de
la version v3.2.8 (testnet uniquement jusqu'à une mise à niveau ultérieure du
mainnet), le gas CosmWasm est retarifé :

- **Le premier appel d'un code de contrat dans un bloc paie un coût de
  chargement.** Un transfert cw20 coûte environ 533,000 gas comme premier appel
  de son code dans un bloc, et environ 84,000 pour chaque appel suivant. La
  gouvernance peut épingler les codes populaires, et les codes épinglés
  échappent au coût de chargement.
- **Les frais augmentent avec la congestion.** Un facteur de congestion
  multiplie le gas des contrats de 1x jusqu'à 20x par défaut lorsque les blocs
  sont chargés d'appels de contrat, et un bloc dispose d'un budget limité
  d'exécution de contrats, dont une seule transaction peut utiliser au plus la
  moitié.
- **La simulation inclut les deux.** Une simulation facture toujours le
  chargement à froid et ajoute une marge pour la congestion ; `gas simulé x 1.3`
  est donc une limite sûre. Utilisez `fee: "auto"` lorsque votre client le
  propose (CosmJS `"auto"`, le `TxClient` du SDK, le hook React `useTx`), et
  simulez vous-même lorsque vous construisez les frais à la main comme ci-dessus.
- **Restez sous le plafond de transaction.** Une transaction Cosmos ne peut pas
  fixer une limite de gas supérieure à 50,000,000 et elle est refusée avant que
  ses frais ne soient prélevés.

Cela vaut aussi pour l'instanciation, la migration et tout autre message qui
exécute du code de contrat.

Voir l'[exemple](/sdk/examples) `cosmwasm-query` pour un exemple de lecture exécutable.
