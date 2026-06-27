---
slug: /sdk/examples
title: Esempi
sidebar_label: Esempi
sidebar_position: 7
---

# Esempi

Sette esempi TypeScript eseguibili si trovano nella directory
[`examples/`](https://github.com/qorechain/qorechain-sdk/tree/main/examples)
del monorepo dell'SDK. Ogni cartella è un pacchetto workspace autonomo
con il proprio `README.md`, `.env.example` e un unico `index.ts`. Leggono
endpoint e mnemonic dalle variabili d'ambiente con valori predefiniti localhost
ragionevoli, e quelli che dipendono dalla rete falliscono in modo controllato con un
suggerimento quando non è raggiungibile alcun nodo.

Dalla radice del repo, installa una volta, poi esegui qualsiasi esempio:

```bash
pnpm install
pnpm --filter @qorechain/example-pqc-hybrid-sign start
```

> Usa solo mnemonic di test o chiavi generate. Non fare mai il commit di segreti reali.

Gli snippet qui sotto sono condensati dall'`index.ts` di ciascun esempio. Consulta il
codice sorgente collegato per il programma completo ed eseguibile.

## connect-and-query

Crea un client e leggi lo stato pubblico della chain — un saldo bancario nativo e lo
snapshot aggregato della tokenomics. Richiede un nodo raggiungibile.

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

[Sorgente](https://github.com/qorechain/qorechain-sdk/tree/main/examples/connect-and-query)

## send-qor

Deriva un account nativo (`qor1...`) da un mnemonic e trasmetti un trasferimento
di QOR: deriva → firma → simula → stima la fee → `bankSend`. Richiede un
RPC di consenso raggiungibile più REST e un account finanziato.

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

[Sorgente](https://github.com/qorechain/qorechain-sdk/tree/main/examples/send-qor)

## svm-transfer

Costruisci un trasferimento di SOL con un'istruzione memo sul runtime
compatibile con Solana (SVM) di QoreChain, usando `@qorechain/svm`. Costruisce e stampa la transazione
offline; per inviarla servono un JSON-RPC SVM raggiungibile e un account finanziato.

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

[Sorgente](https://github.com/qorechain/qorechain-sdk/tree/main/examples/svm-transfer)

## evm-precompile

Usa `@qorechain/evm` (un livello sottile sopra viem) per chiamare precompile
QoreChain in sola lettura e leggere un saldo ERC-20. L'id della chain EVM viene rilevato automaticamente tramite
`eth_chainId`. Su un nodo privo dei precompile, queste chiamate generano "feature not
present", segnalato per ogni chiamata.

```ts
import { createEvmClient, precompiles, erc20 } from "@qorechain/evm";

const client = await createEvmClient({ endpoints: { evmRpc } });
console.log(`evm chain id: ${await client.getChainId()}`);

const params = await precompiles.rlConsensusParams(client.publicClient);
const status = await precompiles.pqcKeyStatus(client.publicClient, account);
const bal = await erc20.balanceOf(client.publicClient, token, account);
```

[Sorgente](https://github.com/qorechain/qorechain-sdk/tree/main/examples/evm-precompile)

## pqc-hybrid-sign

Firma post-quantistica con ML-DSA-87 (Dilithium-5, FIPS 204). **Viene eseguito
interamente offline — nessun nodo richiesto.** La parte 1 firma e verifica un messaggio (con un controllo
di manomissione); la parte 2 costruisce una transazione ibrida che porta sia una firma
classica secp256k1 sia una firma ML-DSA-87 come estensione `PQCHybridSignature`, poi
verifica localmente la metà PQC.

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

[Sorgente](https://github.com/qorechain/qorechain-sdk/tree/main/examples/pqc-hybrid-sign)

## cosmwasm-query

Esegui una query smart in sola lettura verso un contratto CosmWasm distribuito. Richiede un
RPC di consenso raggiungibile e l'indirizzo di un contratto distribuito.

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

[Sorgente](https://github.com/qorechain/qorechain-sdk/tree/main/examples/cosmwasm-query)

## read-tokenomics

Leggi lo stato della tokenomics tramite il namespace JSON-RPC tipizzato `qor_*`
(`client.qor`), servito sull'endpoint JSON-RPC EVM. Le tre letture sono
indipendenti, quindi ciascuna viene segnalata anche se le altre non sono disponibili.

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

[Sorgente](https://github.com/qorechain/qorechain-sdk/tree/main/examples/read-tokenomics)
