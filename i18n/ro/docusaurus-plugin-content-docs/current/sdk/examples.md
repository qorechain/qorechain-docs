---
slug: /sdk/examples
title: Exemple
sidebar_label: Exemple
sidebar_position: 7
---

# Exemple

Șapte exemple TypeScript executabile se află în directorul
[`examples/`](https://github.com/qorechain/qorechain-sdk/tree/main/examples)
al monorepo-ului SDK. Fiecare folder este un pachet workspace de sine stătător,
cu propriul `README.md`, `.env.example` și un singur `index.ts`. Acestea citesc
endpoint-urile și mnemonicele din variabile de mediu, cu valori implicite
rezonabile pentru localhost, iar cele care depind de rețea eșuează elegant, cu o
sugestie, atunci când niciun nod nu este accesibil.

Din rădăcina repo-ului, instalează o singură dată, apoi rulează orice exemplu:

```bash
pnpm install
pnpm --filter @qorechain/example-pqc-hybrid-sign start
```

> Folosește doar mnemonice de test sau chei generate. Nu comite niciodată secrete reale.

Fragmentele de mai jos sunt versiuni condensate ale fișierului `index.ts` din
fiecare exemplu. Consultă sursa linkată pentru programul complet, executabil.

## connect-and-query

Creează un client și citește starea publică a lanțului — un sold bancar nativ și
instantaneul agregat al tokenomicii. Necesită un nod accesibil.

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

Derivă un cont nativ (`qor1...`) dintr-un mnemonic și difuzează un transfer QOR:
derivare → semnare → simulare → estimare comision → `bankSend`. Necesită un RPC
de consens accesibil plus REST și un cont alimentat.

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

Construiește un transfer SOL cu o instrucțiune de memo pe runtime-ul compatibil
Solana (SVM) al QoreChain, folosind `@qorechain/svm`. Construiește și afișează
tranzacția offline; trimiterea necesită un JSON-RPC SVM accesibil și un cont
alimentat.

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

Folosește `@qorechain/evm` (un strat subțire peste viem) pentru a apela
precompile-uri QoreChain doar de citire și pentru a citi un sold ERC-20. ID-ul
lanțului EVM este detectat automat prin `eth_chainId`. Pe un nod fără
precompile-uri, aceste apeluri aruncă „feature not present", raportat per apel.

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

Semnare post-cuantică cu ML-DSA-87 (Dilithium-5, FIPS 204). **Rulează complet
offline — niciun nod nu este necesar.** Partea 1 semnează și verifică un mesaj
(cu o verificare de alterare); partea 2 construiește o tranzacție hibridă care
poartă atât o semnătură clasică secp256k1, cât și o semnătură ML-DSA-87 ca
extensie `PQCHybridSignature`, apoi verifică local jumătatea PQC.

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

Rulează o interogare smart doar de citire către un contract CosmWasm implementat.
Necesită un RPC de consens accesibil și o adresă de contract implementată.

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

Citește starea tokenomicii prin spațiul de nume JSON-RPC tipizat `qor_*`
(`client.qor`), servit prin endpoint-ul JSON-RPC EVM. Cele trei citiri sunt
independente, deci fiecare este raportată chiar dacă celelalte nu sunt
disponibile.

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
