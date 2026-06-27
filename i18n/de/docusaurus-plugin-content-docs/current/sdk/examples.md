---
slug: /sdk/examples
title: Beispiele
sidebar_label: Beispiele
sidebar_position: 7
---

# Beispiele

Sieben lauffähige TypeScript-Beispiele befinden sich im Verzeichnis
[`examples/`](https://github.com/qorechain/qorechain-sdk/tree/main/examples)
des SDK-Monorepos. Jeder Ordner ist ein eigenständiges Workspace-Paket
mit eigener `README.md`, `.env.example` und einer einzigen `index.ts`. Sie lesen
Endpunkte und Mnemonics aus Umgebungsvariablen mit sinnvollen localhost-Standardwerten,
und die netzwerkabhängigen scheitern kontrolliert mit einem Hinweis, wenn kein Node
erreichbar ist.

Vom Repo-Stammverzeichnis aus einmal installieren, dann ein beliebiges Beispiel ausführen:

```bash
pnpm install
pnpm --filter @qorechain/example-pqc-hybrid-sign start
```

> Verwende nur Test-Mnemonics oder generierte Schlüssel. Committe niemals echte Geheimnisse.

Die folgenden Snippets sind aus der `index.ts` des jeweiligen Beispiels gekürzt. Den
vollständigen, lauffähigen Code findest du im verlinkten Quellcode.

## connect-and-query

Erstelle einen Client und lies öffentlichen Chain-Zustand — einen nativen Bank-Kontostand und den
aggregierten Tokenomics-Snapshot. Benötigt einen erreichbaren Node.

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

[Quellcode](https://github.com/qorechain/qorechain-sdk/tree/main/examples/connect-and-query)

## send-qor

Leite ein natives (`qor1...`) Konto aus einem Mnemonic ab und sende eine QOR-Überweisung:
ableiten → signieren → simulieren → Gebühr schätzen → `bankSend`. Benötigt einen
erreichbaren Konsens-RPC sowie REST und ein finanziertes Konto.

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

[Quellcode](https://github.com/qorechain/qorechain-sdk/tree/main/examples/send-qor)

## svm-transfer

Erstelle eine SOL-Überweisung mit einer Memo-Instruktion auf der Solana-kompatiblen
Laufzeitumgebung (SVM) von QoreChain mit `@qorechain/svm`. Die Transaktion wird offline
erstellt und ausgegeben; das Senden benötigt eine erreichbare SVM-JSON-RPC und ein finanziertes Konto.

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

[Quellcode](https://github.com/qorechain/qorechain-sdk/tree/main/examples/svm-transfer)

## evm-precompile

Verwende `@qorechain/evm` (eine dünne Schicht über viem), um schreibgeschützte QoreChain-Precompiles
aufzurufen und einen ERC-20-Kontostand zu lesen. Die EVM-Chain-ID wird automatisch über
`eth_chainId` erkannt. Auf einem Node ohne die Precompiles werfen diese Aufrufe "feature not
present", pro Aufruf gemeldet.

```ts
import { createEvmClient, precompiles, erc20 } from "@qorechain/evm";

const client = await createEvmClient({ endpoints: { evmRpc } });
console.log(`evm chain id: ${await client.getChainId()}`);

const params = await precompiles.rlConsensusParams(client.publicClient);
const status = await precompiles.pqcKeyStatus(client.publicClient, account);
const bal = await erc20.balanceOf(client.publicClient, token, account);
```

[Quellcode](https://github.com/qorechain/qorechain-sdk/tree/main/examples/evm-precompile)

## pqc-hybrid-sign

Post-Quanten-Signierung mit ML-DSA-87 (Dilithium-5, FIPS 204). **Läuft vollständig
offline — kein Node erforderlich.** Teil 1 signiert und verifiziert eine Nachricht (mit einer
Manipulationsprüfung); Teil 2 erstellt eine hybride Transaktion, die sowohl eine klassische secp256k1-Signatur
als auch eine ML-DSA-87-Signatur als `PQCHybridSignature`-Erweiterung trägt, und
verifiziert dann die PQC-Hälfte lokal.

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

[Quellcode](https://github.com/qorechain/qorechain-sdk/tree/main/examples/pqc-hybrid-sign)

## cosmwasm-query

Führe eine schreibgeschützte Smart-Query gegen einen bereitgestellten CosmWasm-Vertrag aus. Benötigt einen
erreichbaren Konsens-RPC und eine bereitgestellte Vertragsadresse.

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

[Quellcode](https://github.com/qorechain/qorechain-sdk/tree/main/examples/cosmwasm-query)

## read-tokenomics

Lies den Tokenomics-Zustand über den typisierten `qor_*`-JSON-RPC-Namensraum
(`client.qor`), der über den EVM-JSON-RPC-Endpunkt bereitgestellt wird. Die drei Lesevorgänge sind
unabhängig, sodass jeder gemeldet wird, selbst wenn die anderen nicht verfügbar sind.

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

[Quellcode](https://github.com/qorechain/qorechain-sdk/tree/main/examples/read-tokenomics)
