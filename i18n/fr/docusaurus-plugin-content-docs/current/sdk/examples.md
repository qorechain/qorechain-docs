---
slug: /sdk/examples
title: Exemples
sidebar_label: Exemples
sidebar_position: 7
---

# Exemples

Sept exemples TypeScript exécutables se trouvent dans le répertoire
[`examples/`](https://github.com/qorechain/qorechain-sdk/tree/main/examples)
du monorepo du SDK. Chaque dossier est un paquet de workspace autonome
avec son propre `README.md`, son `.env.example` et un unique `index.ts`. Ils lisent
les points de terminaison et les phrases mnémoniques depuis des variables d'environnement avec des valeurs par défaut localhost raisonnables,
et ceux qui dépendent du réseau échouent proprement avec un indice lorsqu'aucun nœud n'est
accessible.

Depuis la racine du dépôt, installez une fois, puis exécutez n'importe quel exemple :

```bash
pnpm install
pnpm --filter @qorechain/example-pqc-hybrid-sign start
```

> Utilisez uniquement des phrases mnémoniques de test ou des clés générées. Ne committez jamais de véritables secrets.

Les extraits ci-dessous sont condensés à partir de l'`index.ts` de chaque exemple. Voir la
source liée pour le programme complet et exécutable.

## connect-and-query

Créez un client et lisez l'état public de la chaîne — un solde bancaire natif et
l'instantané agrégé de la tokenomics. Nécessite un nœud accessible.

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: {
    rest: process.env.QORE_REST_URL ?? "http://localhost:1317",
    evmRpc: process.env.QORE_EVM_RPC_URL ?? "http://localhost:8545",
  },
});

const balances = await client.rest.getAllBalances(address);
const overview = await client.qor.getTokenomicsOverview();
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/connect-and-query)

## send-qor

Dérivez un compte natif (`qor1...`) à partir d'une phrase mnémonique et diffusez un transfert
QOR : dériver → signer → simuler → estimer les frais → `bankSend`. Nécessite un
RPC de consensus accessible ainsi que REST et un compte approvisionné.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  toBase,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, prefix);

const amount = [{ denom: baseDenom, amount: toBase("1.5") }]; // "1500000" uqor

const tx = await client.connectTx(signer);
const gasEstimate = await tx.simulate(messages);
const fee = await client.fees.estimate("normal");
const result = await tx.bankSend(recipient, amount, { fee });
console.log(result.transactionHash);
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/send-qor)

## svm-transfer

Construisez un transfert SOL avec une instruction de mémo sur le runtime compatible Solana
(SVM) de QoreChain, en utilisant `@qorechain/svm`. Construit et affiche la transaction
hors ligne ; l'envoi nécessite un JSON-RPC SVM accessible et un compte approvisionné.

```ts
import { deriveSvmAccount } from "@qorechain/sdk";
import {
  createSvmClient,
  svmKeypairFromSecretKey,
  createMemoInstruction,
} from "@qorechain/svm";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const account = await deriveSvmAccount(mnemonic);
const keypair = svmKeypairFromSecretKey(account.secretKey);

const client = createSvmClient({ endpoints: { svmRpc } });

const lamports = Math.round(0.01 * LAMPORTS_PER_SOL);
const tx = client.buildTransferSol({ from: keypair, to: recipient, lamports });
tx.add(createMemoInstruction("hello from @qorechain/svm", [keypair.publicKey]));
// To broadcast: client.sendTransaction(tx, [keypair])
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/svm-transfer)

## evm-precompile

Utilisez `@qorechain/evm` (une fine couche au-dessus de viem) pour appeler des précompilés
QoreChain en lecture seule et lire un solde ERC-20. L'ID de chaîne EVM est détecté automatiquement via
`eth_chainId`. Sur un nœud sans les précompilés, ces appels lèvent « feature not
present », signalé par appel.

```ts
import { createEvmClient, precompiles, erc20 } from "@qorechain/evm";

const client = await createEvmClient({ endpoints: { evmRpc } });
console.log(`evm chain id: ${await client.getChainId()}`);

const params = await precompiles.rlConsensusParams(client.publicClient);
const status = await precompiles.pqcKeyStatus(client.publicClient, account);
const bal = await erc20.balanceOf(client.publicClient, token, account);
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/evm-precompile)

## pqc-hybrid-sign

Signature post-quantique avec ML-DSA-87 (Dilithium-5, FIPS 204). **S'exécute entièrement
hors ligne — aucun nœud requis.** La partie 1 signe et vérifie un message (avec une vérification
d'altération) ; la partie 2 construit une transaction hybride portant à la fois une signature
classique secp256k1 et une signature ML-DSA-87 sous forme d'extension `PQCHybridSignature`, puis
vérifie la moitié PQC localement.

```ts
import {
  generatePqcKeypair,
  pqcSign,
  pqcVerify,
  buildHybridTx,
} from "@qorechain/sdk";

const keypair = generatePqcKeypair();
const message = new TextEncoder().encode("QoreChain is quantum-safe");
const signature = pqcSign(keypair.secretKey, message);
const valid = pqcVerify(keypair.publicKey, message, signature);

const built = await buildHybridTx({
  registry,
  signer,
  pqcKeypair,
  messages,
  fee: { amount: [{ denom: "uqor", amount: "5000" }], gas: "200000" },
  chainId: "qorechain-diana",
  accountNumber: 0,
  sequence: 0,
  includePqcPublicKey: true, // embed the key for auto-registration on first use
});
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/pqc-hybrid-sign)

## cosmwasm-query

Exécutez une requête smart en lecture seule contre un contrat CosmWasm déployé. Nécessite un
RPC de consensus accessible et une adresse de contrat déployé.

```ts
import {
  createClient,
  queryContractSmart,
  getContractInfo,
} from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: { rpc: process.env.QORE_RPC_URL ?? "http://localhost:26657" },
});

const cw = await client.cosmwasm(); // read-only, memoized on the client
const info = await getContractInfo(cw, contract);
const result = await queryContractSmart(cw, contract, { token_info: {} });
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/cosmwasm-query)

## read-tokenomics

Lisez l'état de la tokenomics via l'espace de noms JSON-RPC typé `qor_*`
(`client.qor`), servi sur le point de terminaison JSON-RPC EVM. Les trois lectures sont
indépendantes, de sorte que chacune est signalée même si les autres sont indisponibles.

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: {
    evmRpc: process.env.QORE_EVM_RPC_URL ?? "http://localhost:8545",
  },
});

const burn = await client.qor.getBurnStats();        // qor_getBurnStats
const xqore = await client.qor.getXqorePosition(address); // qor_getXQOREPosition
const inflation = await client.qor.getInflationRate(); // qor_getInflationRate
```

[Source](https://github.com/qorechain/qorechain-sdk/tree/main/examples/read-tokenomics)
