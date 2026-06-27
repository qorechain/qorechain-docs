---
slug: /sdk/guides/quantum-safe
title: Quantum-safe per impostazione predefinita
sidebar_label: Quantum-safe
sidebar_position: 6
---

# Quantum-safe per impostazione predefinita

QoreChain tratta la crittografia post-quantistica come uno schema di firma **di prima classe**.
Un account registra on-chain una chiave **ML-DSA-87 (Dilithium-5, NIST FIPS 204)**,
dopodiché le sue transazioni possono portare una firma **ibrida** — la consueta
firma classica secp256k1 **più** una firma ML-DSA-87. L'ante
handler della catena verifica entrambe, così un account quantum-safe rimane pienamente compatibile con
la verifica classica acquisendo al contempo protezione contro un futuro avversario
quantistico.

L'SDK racchiude tutto questo in una superficie minima e idempotente così che una dApp diventi
**quantum-safe per impostazione predefinita**: una sola chiamata per essere protetta da PQC.

## Verificare lo stato

`isPqcRegistered` / `getPqcStatus` leggono se un indirizzo ha una chiave PQC
registrata tramite il metodo JSON-RPC `qor_getPQCKeyStatus`. Accettano sia un
`QorClient` sia il client composto da `createClient`:

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({ network: "mainnet", endpoints: { /* … */ } });

const safe = await isPqcRegistered(client, "qor1…");
const status = await getPqcStatus(client, "qor1…");
// status: { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

Lo stesso stato è leggibile anche dal lato EVM tramite il precompilato
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
a `0x0000000000000000000000000000000000000A02` (esposto come
`pqcKeyStatus` in `@qorechain/evm`). Gli helper qui sopra preferiscono il metodo JSON-RPC,
che non richiede alcun peer viem.

## Registrare con una sola chiamata

`ensurePqcRegistered` rende un account quantum-safe. È **idempotente**: passa una
fonte di stato e salterà la registrazione quando la chiave è già registrata,
così è sicuro chiamarlo a ogni avvio dell'app.

```ts
import { generatePqcKeypair, ensurePqcRegistered } from "@qorechain/sdk";

const tx = await client.connectTx(signer);
const pqcKeypair = generatePqcKeypair(); // or derive deterministically from the wallet

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  statusSource: client, // makes the call idempotent (skips if already registered)
});
// res: { alreadyRegistered: boolean; txHash?: string }
```

Sotto il cofano costruisce e trasmette `MsgRegisterPQCKey` con la chiave pubblica
Dilithium del firmatario (da `pqcKeypair`) più, opzionalmente, la chiave pubblica
ECDSA dell'account.

## Firmare ibrido

`migrateToHybrid` garantisce la registrazione e restituisce un percorso di invio ibrido con la
coppia di chiavi pre-associata ai builder esistenti `buildHybridTx` / `signAndBroadcastHybrid`:

```ts
import { migrateToHybrid } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, { pqcKeypair, statusSource: client });

await hybrid.signAndBroadcastHybrid({
  registry,
  signer,          // classical secp256k1 direct signer
  messages,
  fee,
  chainId,
  accountNumber,
  sequence,
  transport,       // a connected broadcast transport (e.g. StargateClient)
});
```

## Ruotare una chiave

Se devi ruotare la chiave PQC (aggiornamento dell'algoritmo o una chiave compromessa), usa
`migratePqcKey`, che trasmette `MsgMigratePQCKey` dimostrando il possesso sia della
chiave vecchia sia di quella nuova:

```ts
import { migratePqcKey } from "@qorechain/sdk";

await migratePqcKey(tx, {
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
});
```

## Nell'interfaccia utente

Il kit [`@qorechain/react`](/sdk/guides/react) espone tutto questo in React: l'hook
`usePqcStatus` e il componente `<QuantumSafeBadge/>` mostrano un indicatore **Quantum-safe**
ogni volta che l'account connesso ha una chiave PQC registrata.
