---
slug: /sdk/guides/quantum-safe
title: Quantum-safe în mod implicit
sidebar_label: Quantum-safe
sidebar_position: 6
---

# Quantum-safe în mod implicit

QoreChain tratează criptografia post-cuantică drept o schemă de semnătură **de prim rang**.
Un cont înregistrează pe lanț o cheie **ML-DSA-87 (Dilithium-5, NIST FIPS 204)**,
după care tranzacțiile sale pot purta o semnătură **hibridă** — obișnuita
semnătură clasică secp256k1 **plus** o semnătură ML-DSA-87. Ante handler-ul lanțului
verifică ambele, astfel încât un cont quantum-safe rămâne pe deplin compatibil cu
verificarea clasică, câștigând totodată protecție împotriva unui viitor adversar
cuantic.

SDK-ul împachetează acest lucru într-o suprafață minusculă, idempotentă, astfel încât o
dApp devine **quantum-safe în mod implicit**: un singur apel pentru a fi protejat PQC.

## Verificarea stării

`isPqcRegistered` / `getPqcStatus` citesc dacă o adresă are o cheie PQC
înregistrată prin metoda JSON-RPC `qor_getPQCKeyStatus`. Acceptă fie un
`QorClient`, fie clientul compus din `createClient`:

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({ network: "mainnet", endpoints: { /* … */ } });

const safe = await isPqcRegistered(client, "qor1…");
const status = await getPqcStatus(client, "qor1…");
// status: { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

Aceeași stare este citibilă și pe partea EVM prin precompila
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
de la `0x0000000000000000000000000000000000000A02` (expusă ca
`pqcKeyStatus` în `@qorechain/evm`). Helperele de mai sus preferă metoda JSON-RPC,
care nu necesită un peer viem.

## Înregistrare într-un singur apel

`ensurePqcRegistered` face un cont quantum-safe. Este **idempotent**: transmite o
sursă de stare și sare peste înregistrare atunci când cheia este deja înregistrată,
astfel încât poate fi apelat în siguranță la fiecare pornire a aplicației.

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

Sub capotă construiește și difuzează `MsgRegisterPQCKey` cu cheia publică
Dilithium a semnatarului (din `pqcKeypair`) plus, opțional, cheia publică ECDSA
a contului.

## Semnare hibridă

`migrateToHybrid` asigură înregistrarea și returnează o cale de trimitere hibridă cu
keypair-ul pre-legat la constructorii existenți `buildHybridTx` / `signAndBroadcastHybrid`:

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

## Rotirea unei chei

Dacă trebuie să rotești cheia PQC (upgrade de algoritm sau o cheie compromisă), folosește
`migratePqcKey`, care difuzează `MsgMigratePQCKey` dovedind deținerea atât a
cheii vechi, cât și a celei noi:

```ts
import { migratePqcKey } from "@qorechain/sdk";

await migratePqcKey(tx, {
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
});
```

## În interfața utilizator

Kit-ul [`@qorechain/react`](/sdk/guides/react) expune toate acestea în React: hook-ul
`usePqcStatus` și componenta `<QuantumSafeBadge/>` afișează un indicator **Quantum-safe**
ori de câte ori contul conectat are o cheie PQC înregistrată.
