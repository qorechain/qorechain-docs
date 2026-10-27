---
slug: /sdk/examples
title: Exemple
sidebar_label: Exemple
sidebar_position: 7
---

# Exemple

Exemplele TypeScript rulabile se află în directorul
[`examples/`](https://github.com/qorechain/qorechain-sdk/tree/main/examples)
al monorepo-ului SDK — cele de mai jos, plus `ai-preflight`,
`cross-vm-call`, `react-dapp`, `register-sidechain`, `rollup-lifecycle`,
`amm-swap`, `connect-keplr`, `evm-nft` și `subscribe-blocks`. Fiecare folder este
un pachet workspace de sine stătător,
cu propriul `README.md`, `.env.example` și un singur `index.ts`. Ele citesc
endpoint-urile și mnemonicele din variabile de mediu, cu valori implicite rezonabile pe localhost,
iar cele care depind de rețea eșuează elegant, cu un indiciu, atunci când niciun nod nu este
accesibil.

Din rădăcina repo-ului, instalați o singură dată, apoi rulați orice exemplu:

```bash
pnpm install
pnpm --filter @qorechain/example-pqc-hybrid-sign start
```

> Folosiți doar mnemonice de test sau chei generate. Nu comiteți niciodată secrete reale.

Fragmentele de mai jos sunt versiuni condensate ale fișierului `index.ts` din fiecare exemplu. Consultați
sursa din link pentru programul complet, rulabil.

## connect-and-query

Creați un client și citiți starea publică a lanțului — un sold bancar nativ și
un instantaneu de tokenomics. Necesită un nod accesibil. Exemplul din repository citește
instantaneul prin `client.qor`, un apel JSON-RPC `qor_` pe care endpoint-urile publice nu
îl servesc; fragmentul de mai jos folosește echivalentul REST (statisticile de ardere), care
funcționează pe mainnet și pe testnet.

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
const burn = await client.rest.getBurnStats(); // GET /qorechain/burn/v1/stats
```

[Sursa](https://github.com/qorechain/qorechain-sdk/tree/main/examples/connect-and-query)

## send-qor

Derivați un cont nativ (`qor1...`) dintr-un mnemonic și difuzați un transfer
QOR: derivare → semnare → simulare → estimare comision → `bankSend`. Necesită un
RPC de consens accesibil, plus REST și un cont finanțat. Acest exemplu semnează doar cu
semnătura **clasică**, deci funcționează pe un nod local sau de dezvoltare, dar este
refuzat de mainnet și de testnet, care cer semnătura hibridă pentru fiecare
tranzacție pe calea Native. Pentru rețelele publice conectați-vă cu perechea de chei
a contului, `client.connectTx(signer, { pqcKeypair })` (SDK 0.9.0 sau mai nou), ca în
[Quickstart](/sdk/quickstart#send-qor).

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

[Sursa](https://github.com/qorechain/qorechain-sdk/tree/main/examples/send-qor)

## svm-transfer

Construiți un transfer SOL cu o instrucțiune memo pe runtime-ul QoreChain
compatibil Solana (SVM), folosind `@qorechain/svm`. Construiește și afișează tranzacția
offline. Trimiterea necesită un JSON-RPC SVM accesibil și un cont finanțat și nu poate
reuși pe rețelele publice: trimiterea tranzacțiilor SVM este dezactivată
la nivelul întregii rețele, iar endpoint-urile SVM publice sunt doar pentru citire (consultați
[Dezvoltare SVM](/developer-guide/svm-development)).

```ts
import { deriveSvmAccount } from "@qorechain/sdk";
import {
  createSvmClient,
  svmKeypairFromSecretKey,
  createMemoInstruction,
} from "@qorechain/svm";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const account = await deriveSvmAccount(mnemonic);
const keypair = svmKeypairFromSecretKey(account.secretKey);

const client = createSvmClient({ endpoints: { svmRpc } });

const lamports = Math.round(0.01 * LAMPORTS_PER_SOL);
const to = new PublicKey(recipient); // `to` is a PublicKey, not a string
const tx = client.buildTransferSol({ from: keypair, to, lamports });
tx.add(createMemoInstruction("hello from @qorechain/svm", [keypair.publicKey]));
// To broadcast: client.sendTransaction(tx, [keypair])
```

[Sursa](https://github.com/qorechain/qorechain-sdk/tree/main/examples/svm-transfer)

## evm-precompile

Folosiți `@qorechain/evm` (un strat subțire peste viem) pentru a apela precompile-urile
QoreChain în mod read-only și pentru a citi un sold ERC-20. ID-ul de lanț EVM este detectat automat prin
`eth_chainId`. Precompile-urile nu sunt active pe mainnet, iar pe testnet sunt active doar
cele de verificare PQC, de stare a cheii PQC și de parametri de consens (consultați
[Starea rețelei](/developer-guide/evm-precompiles#network-status)); acolo unde un
precompile este inactiv, și pe un nod fără ele, acele apeluri aruncă eroarea "feature not present",
raportată per apel.

```ts
import { createEvmClient, precompiles, erc20 } from "@qorechain/evm";

const client = await createEvmClient({ endpoints: { evmRpc } });
console.log(`evm chain id: ${await client.getChainId()}`);

const params = await precompiles.rlConsensusParams(client.publicClient);
const status = await precompiles.pqcKeyStatus(client.publicClient, account);
const bal = await erc20.balanceOf(client.publicClient, token, account);
```

[Sursa](https://github.com/qorechain/qorechain-sdk/tree/main/examples/evm-precompile)

## pqc-hybrid-sign

Semnare post-cuantică cu ML-DSA-87 (Dilithium-5, FIPS 204). **Rulează complet
offline — nu necesită niciun nod.** Partea 1 semnează și verifică un mesaj (cu o verificare
anti-falsificare); partea 2 construiește o tranzacție hibridă care poartă atât o semnătură clasică
secp256k1, cât și o semnătură ML-DSA-87, ca extensie `PQCHybridSignature`, apoi
verifică local jumătatea PQC.

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
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // network floor: 0.1 uqor per gas
  chainId: "qorechain-diana",
  accountNumber: 0,
  sequence: 0,
  signBytesVersion: "v2", // explicit, so this offline example needs no node
  includePqcPublicKey: true, // embeds the key in the extension (registration is a separate, explicit step)
});
```

[Sursa](https://github.com/qorechain/qorechain-sdk/tree/main/examples/pqc-hybrid-sign)

## cosmwasm-query

Rulați o interogare smart read-only pe un contract QoreChain Native implementat. Necesită un
RPC de consens accesibil și o adresă de contract implementat.

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

[Sursa](https://github.com/qorechain/qorechain-sdk/tree/main/examples/cosmwasm-query)

## read-tokenomics

Citiți starea tokenomics prin namespace-ul JSON-RPC tipizat `qor_*`
(`client.qor`), servit prin endpoint-ul EVM JSON-RPC. Cele trei citiri sunt
independente, astfel încât fiecare este raportată chiar dacă celelalte nu sunt disponibile.
Nicio versiune de nod lansată nu servește încă namespace-ul `qor_`, așa că astăzi fiecare
citire eșuează cu `-32601` (consultați
[namespace-ul `qor_`](/api-reference/json-rpc-qor_-namespace)).

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: {
    evmRpc: process.env.QORE_EVM_RPC_URL ?? "http://localhost:8545",
  },
});

const burn = await client.qor.getBurnStats();        // qor_getBurnStats
const xqore = await client.qor.getXqorePosition(address); // qor_getXQOREPosition (xQORE has no query service yet)
const inflation = await client.qor.getInflationRate(); // qor_getInflationRate
```

[Sursa](https://github.com/qorechain/qorechain-sdk/tree/main/examples/read-tokenomics)

## unified-wallet

Derivați un **cont unificat eth-nativ** (SDK 0.6.0): o singură cheie `eth_secp256k1`
redată ca toate cele trei adrese QoreChain, cu un singur sold partajat, plus
perechea de chei ML-DSA-87 legată de adresă. Rulează complet offline.

```ts
import {
  deriveUnifiedAccount,
  qoreAddresses,
  unifiedAccountFromSeed,
} from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
console.log(account.cosmos); // "qor1…"  — Native lane
console.log(account.evm);    // "0x…"    — EVM lane
console.log(account.svm);    // base58   — SVM lane (same 20 bytes)

// Decode any one encoding into all three.
const all = qoreAddresses({ evm: account.evm });

// Or derive from a raw 32-byte seed instead of a mnemonic.
const fromSeed = unifiedAccountFromSeed(seed32);
```

[Sursa](https://github.com/qorechain/qorechain-sdk/tree/main/examples/unified-wallet)

## authenticator-spend

Construiți un `MsgExecuteCosmos` trimis prin relayer pe culoarul de autentificatori Native
(SDK 0.7.0, chain v3.1.85; modulul `abstractaccount` este dezactivat pe mainnet și
activat pe testnet, deci acest culoar nu poate fi folosit încă pe mainnet): o cheie ed25519 în stil Phantom semnează
digestul de autentificare cu separare de domeniu, iar mesajul rezultat este gata pentru ca un relayer
să îl difuzeze (relayer-ul plătește comisioanele; cheia externă nu produce niciodată o
co-semnătură ML-DSA). Rulare de probă — nu necesită niciun nod.

```ts
import {
  buildPhantomExecuteCosmos,
  cosmosAuthSignBytes,
  qorechainRegistry,
} from "@qorechain/sdk";

// Show the exact 32-byte digest the wallet signs (byte-exact vs the chain).
const digest = cosmosAuthSignBytes({ chainId, account, pubkey, to, amount, nonce });

// Build the relayer-ready message: the Phantom wallet signs the digest.
const msg = await buildPhantomExecuteCosmos({
  wallet,                 // window.solana in a browser
  relayer,                // submits + pays fees (a DIFFERENT account)
  chainId,
  account,                // the canonical PQC-required owner
  to,
  amount: "100uqor",
  nonce,                  // the per-authenticator sequence
});

// Prove it encodes via the default registry (what the relayer broadcasts).
const bytes = qorechainRegistry().encode(msg);
```

[Sursa](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend)
· Ghid complet:
[Autentificatori și cheltuieli delegate](/sdk/guides/authenticators)
