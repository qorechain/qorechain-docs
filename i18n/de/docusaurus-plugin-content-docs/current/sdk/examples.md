---
slug: /sdk/examples
title: Beispiele
sidebar_label: Beispiele
sidebar_position: 7
---

# Beispiele

Die lauffähigen TypeScript-Beispiele befinden sich im Verzeichnis
[`examples/`](https://github.com/qorechain/qorechain-sdk/tree/main/examples)
des SDK-Monorepos — die unten aufgeführten sowie `ai-preflight`,
`cross-vm-call`, `react-dapp`, `register-sidechain`, `rollup-lifecycle`,
`amm-swap`, `connect-keplr`, `evm-nft` und `subscribe-blocks`. Jeder Ordner ist
ein eigenständiges Workspace-Paket mit eigener `README.md`, `.env.example` und
einer einzigen `index.ts`. Die Beispiele lesen Endpunkte und Mnemonics aus
Umgebungsvariablen mit sinnvollen localhost-Standardwerten, und die
netzwerkabhängigen Beispiele schlagen mit einem Hinweis kontrolliert fehl, wenn
kein Node erreichbar ist.

Vom Repo-Root aus einmal installieren, dann kann jedes Beispiel gestartet werden:

```bash
pnpm install
pnpm --filter @qorechain/example-pqc-hybrid-sign start
```

> Verwenden Sie ausschließlich Test-Mnemonics oder generierte Schlüssel. Committen Sie niemals echte Geheimnisse.

Die folgenden Snippets sind aus der `index.ts` des jeweiligen Beispiels gekürzt.
Das vollständige, lauffähige Programm finden Sie in der verlinkten Quelle.

## connect-and-query

Einen Client erstellen und öffentlichen Chain-State lesen — ein natives
Bank-Guthaben und den aggregierten Tokenomics-Snapshot. Benötigt einen
erreichbaren Node.

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

[Quelle](https://github.com/qorechain/qorechain-sdk/tree/main/examples/connect-and-query)

## send-qor

Ein natives Konto (`qor1...`) aus einer Mnemonic ableiten und einen
QOR-Transfer broadcasten: ableiten → signieren → simulieren → Gebühr schätzen →
`bankSend`. Benötigt einen erreichbaren Konsens-RPC sowie REST und ein Konto
mit Guthaben.

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

[Quelle](https://github.com/qorechain/qorechain-sdk/tree/main/examples/send-qor)

## svm-transfer

Einen SOL-Transfer mit einer Memo-Instruktion auf der Solana-kompatiblen
(SVM-)Laufzeitumgebung von QoreChain erstellen, mit `@qorechain/svm`. Baut die
Transaktion offline und gibt sie aus; zum Senden werden ein erreichbarer
SVM-JSON-RPC und ein Konto mit Guthaben benötigt.

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

[Quelle](https://github.com/qorechain/qorechain-sdk/tree/main/examples/svm-transfer)

## evm-precompile

`@qorechain/evm` (eine dünne Schicht über viem) verwenden, um schreibgeschützte
QoreChain-Precompiles aufzurufen und ein ERC-20-Guthaben zu lesen. Die
EVM-Chain-ID wird automatisch über `eth_chainId` erkannt. Auf einem Node ohne
die Precompiles werfen diese Aufrufe "feature not present", was pro Aufruf
gemeldet wird.

```ts
import { createEvmClient, precompiles, erc20 } from "@qorechain/evm";

const client = await createEvmClient({ endpoints: { evmRpc } });
console.log(`evm chain id: ${await client.getChainId()}`);

const params = await precompiles.rlConsensusParams(client.publicClient);
const status = await precompiles.pqcKeyStatus(client.publicClient, account);
const bal = await erc20.balanceOf(client.publicClient, token, account);
```

[Quelle](https://github.com/qorechain/qorechain-sdk/tree/main/examples/evm-precompile)

## pqc-hybrid-sign

Post-Quanten-Signieren mit ML-DSA-87 (Dilithium-5, FIPS 204). **Läuft
vollständig offline — kein Node erforderlich.** Teil 1 signiert und verifiziert
eine Nachricht (mit einem Manipulationstest); Teil 2 baut eine hybride
Transaktion, die sowohl eine klassische secp256k1-Signatur als auch eine
ML-DSA-87-Signatur als `PQCHybridSignature`-Extension trägt, und verifiziert
anschließend die PQC-Hälfte lokal.

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

[Quelle](https://github.com/qorechain/qorechain-sdk/tree/main/examples/pqc-hybrid-sign)

## cosmwasm-query

Eine schreibgeschützte Smart Query gegen einen deployten CosmWasm-Contract
ausführen. Benötigt einen erreichbaren Konsens-RPC und eine deployte
Contract-Adresse.

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

[Quelle](https://github.com/qorechain/qorechain-sdk/tree/main/examples/cosmwasm-query)

## read-tokenomics

Tokenomics-State über den typisierten `qor_*`-JSON-RPC-Namespace
(`client.qor`) lesen, der über den EVM-JSON-RPC-Endpunkt bereitgestellt wird.
Die drei Lesevorgänge sind unabhängig, daher wird jeder gemeldet, auch wenn die
anderen nicht verfügbar sind.

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

[Quelle](https://github.com/qorechain/qorechain-sdk/tree/main/examples/read-tokenomics)

## unified-wallet

Ein **vereinheitlichtes eth-natives Konto** ableiten (SDK 0.6.0): ein
`eth_secp256k1`-Schlüssel, dargestellt als alle drei QoreChain-Adressen mit
einem gemeinsamen Guthaben, plus das adressgebundene ML-DSA-87-Schlüsselpaar.
Läuft vollständig offline.

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

[Quelle](https://github.com/qorechain/qorechain-sdk/tree/main/examples/unified-wallet)

## authenticator-spend

Eine relayer-eingereichte `MsgExecuteCosmos` auf der nativen
Authenticator-Lane bauen (SDK 0.7.0, Chain v3.1.85): ein Phantom-artiger
ed25519-Schlüssel signiert den domänenseparierten Auth-Digest, und die
resultierende Nachricht ist bereit, von einem Relayer gebroadcastet zu werden
(der Relayer zahlt die Gebühren; der externe Schlüssel erzeugt niemals eine
ML-DSA-Co-Signatur). Trockenlauf — kein Node erforderlich.

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

[Quelle](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend)
· Vollständige Anleitung:
[Authenticators & delegiertes Spending](/sdk/guides/authenticators)
