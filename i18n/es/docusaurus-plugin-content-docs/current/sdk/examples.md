---
slug: /sdk/examples
title: Ejemplos
sidebar_label: Ejemplos
sidebar_position: 7
---

# Ejemplos

Los ejemplos ejecutables en TypeScript se encuentran en el directorio
[`examples/`](https://github.com/qorechain/qorechain-sdk/tree/main/examples)
del monorepo del SDK — los que aparecen a continuación más `ai-preflight`,
`cross-vm-call`, `react-dapp`, `register-sidechain`, `rollup-lifecycle`,
`amm-swap`, `connect-keplr`, `evm-nft` y `subscribe-blocks`. Cada carpeta es
un paquete de workspace autocontenido
con su propio `README.md`, `.env.example` y un único `index.ts`. Leen los
endpoints y las frases mnemotécnicas desde variables de entorno con valores
predeterminados razonables para localhost, y los que dependen de la red fallan
de forma controlada con una indicación cuando no hay ningún nodo accesible.

Desde la raíz del repositorio, instala una sola vez y luego ejecuta cualquier ejemplo:

```bash
pnpm install
pnpm --filter @qorechain/example-pqc-hybrid-sign start
```

> Usa únicamente frases mnemotécnicas de prueba o claves generadas. Nunca subas secretos reales al repositorio.

Los fragmentos siguientes están condensados a partir del `index.ts` de cada
ejemplo. Consulta el código fuente enlazado para ver el programa completo y ejecutable.

## connect-and-query

Crea un cliente y lee el estado público de la cadena: un saldo bancario nativo y
la instantánea agregada de la tokenómica. Necesita un nodo accesible.

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

[Código fuente](https://github.com/qorechain/qorechain-sdk/tree/main/examples/connect-and-query)

## send-qor

Deriva una cuenta nativa (`qor1...`) a partir de una frase mnemotécnica y
difunde una transferencia de QOR: derivar → firmar → simular → estimar la
comisión → `bankSend`. Necesita un RPC de consenso accesible además de REST y
una cuenta con fondos.

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

[Código fuente](https://github.com/qorechain/qorechain-sdk/tree/main/examples/send-qor)

## svm-transfer

Construye una transferencia de SOL con una instrucción de memo en el runtime
compatible con Solana (SVM) de QoreChain, usando `@qorechain/svm`. Construye e
imprime la transacción sin conexión; para enviarla se necesita un JSON-RPC de
SVM accesible y una cuenta con fondos.

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

[Código fuente](https://github.com/qorechain/qorechain-sdk/tree/main/examples/svm-transfer)

## evm-precompile

Usa `@qorechain/evm` (una capa ligera sobre viem) para invocar precompilados de
QoreChain de solo lectura y leer un saldo ERC-20. El chain id de EVM se detecta
automáticamente mediante `eth_chainId`. En un nodo sin los precompilados, esas
llamadas lanzan "feature not present", y se informa por cada llamada.

```ts
import { createEvmClient, precompiles, erc20 } from "@qorechain/evm";

const client = await createEvmClient({ endpoints: { evmRpc } });
console.log(`evm chain id: ${await client.getChainId()}`);

const params = await precompiles.rlConsensusParams(client.publicClient);
const status = await precompiles.pqcKeyStatus(client.publicClient, account);
const bal = await erc20.balanceOf(client.publicClient, token, account);
```

[Código fuente](https://github.com/qorechain/qorechain-sdk/tree/main/examples/evm-precompile)

## pqc-hybrid-sign

Firma poscuántica con ML-DSA-87 (Dilithium-5, FIPS 204). **Se ejecuta
completamente sin conexión — no requiere ningún nodo.** La parte 1 firma y
verifica un mensaje (con una comprobación de manipulación); la parte 2 construye
una transacción híbrida que lleva tanto una firma clásica secp256k1 como una
firma ML-DSA-87 en forma de extensión `PQCHybridSignature`, y luego verifica
localmente la mitad PQC.

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

[Código fuente](https://github.com/qorechain/qorechain-sdk/tree/main/examples/pqc-hybrid-sign)

## cosmwasm-query

Ejecuta una consulta inteligente de solo lectura contra un contrato CosmWasm
desplegado. Necesita un RPC de consenso accesible y la dirección de un contrato
desplegado.

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

[Código fuente](https://github.com/qorechain/qorechain-sdk/tree/main/examples/cosmwasm-query)

## read-tokenomics

Lee el estado de la tokenómica a través del espacio de nombres JSON-RPC tipado
`qor_*` (`client.qor`), servido sobre el endpoint JSON-RPC de EVM. Las tres
lecturas son independientes, por lo que cada una se informa aunque las demás no
estén disponibles.

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

[Código fuente](https://github.com/qorechain/qorechain-sdk/tree/main/examples/read-tokenomics)

## unified-wallet

Deriva una **cuenta unificada nativa de eth** (SDK 0.6.0): una sola clave
`eth_secp256k1` representada como las tres direcciones de QoreChain con un único
saldo compartido, más el par de claves ML-DSA-87 vinculado a la dirección. Se
ejecuta completamente sin conexión.

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

[Código fuente](https://github.com/qorechain/qorechain-sdk/tree/main/examples/unified-wallet)

## authenticator-spend

Construye un `MsgExecuteCosmos` enviado por un relayer en el carril de
autenticadores Native (SDK 0.7.0, chain v3.1.85): una clave ed25519 al estilo
Phantom firma el digest de autenticación con separación de dominio, y el mensaje
resultante queda listo para que un relayer lo difunda (el relayer paga las
comisiones; la clave externa nunca produce una cofirma ML-DSA). Ejecución en
seco — no requiere ningún nodo.

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

[Código fuente](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend)
· Guía completa:
[Autenticadores y gasto delegado](/sdk/guides/authenticators)
