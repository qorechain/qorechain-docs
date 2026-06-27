---
slug: /sdk/guides/quantum-safe
title: Seguridad cuántica por defecto
sidebar_label: Seguridad cuántica
sidebar_position: 6
---

# Seguridad cuántica por defecto

QoreChain trata la criptografía poscuántica como un esquema de firma de **primera clase**.
Una cuenta registra en cadena una clave **ML-DSA-87 (Dilithium-5, NIST FIPS 204)**,
tras lo cual sus transacciones pueden llevar una firma **híbrida** — la habitual
firma clásica secp256k1 **más** una firma ML-DSA-87. El ante handler de la cadena
verifica ambas, de modo que una cuenta con seguridad cuántica permanece totalmente compatible
con la verificación clásica al tiempo que gana protección frente a un futuro adversario
cuántico.

El SDK empaqueta esto en una superficie diminuta e idempotente para que una dApp se vuelva
**segura frente a lo cuántico por defecto**: una sola llamada para estar protegido con PQC.

## Comprobar el estado

`isPqcRegistered` / `getPqcStatus` leen si una dirección tiene una clave PQC
registrada mediante el método JSON-RPC `qor_getPQCKeyStatus`. Aceptan ya sea un
`QorClient` o el cliente compuesto de `createClient`:

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({ network: "mainnet", endpoints: { /* … */ } });

const safe = await isPqcRegistered(client, "qor1…");
const status = await getPqcStatus(client, "qor1…");
// status: { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

El mismo estado también se puede leer desde el lado EVM mediante el
precompilado `pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
en `0x0000000000000000000000000000000000000A02` (expuesto como
`pqcKeyStatus` en `@qorechain/evm`). Las utilidades anteriores prefieren el método JSON-RPC,
que no necesita ningún par de viem.

## Registrar en una sola llamada

`ensurePqcRegistered` hace que una cuenta sea segura frente a lo cuántico. Es **idempotente**: pasa una
fuente de estado y omite el registro cuando la clave ya está registrada,
de modo que es seguro llamarla en cada arranque de la app.

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

Internamente construye y difunde `MsgRegisterPQCKey` con la clave pública Dilithium
del firmante (de `pqcKeypair`) más, opcionalmente, la clave pública ECDSA de la
cuenta.

## Firmar de forma híbrida

`migrateToHybrid` garantiza el registro y devuelve una ruta de envío híbrida con el
par de claves preenlazado a los constructores existentes `buildHybridTx` / `signAndBroadcastHybrid`:

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

## Rotar una clave

Si necesitas rotar la clave PQC (actualización de algoritmo o una clave comprometida), usa
`migratePqcKey`, que difunde `MsgMigratePQCKey` demostrando la posesión tanto de la
clave antigua como de la nueva:

```ts
import { migratePqcKey } from "@qorechain/sdk";

await migratePqcKey(tx, {
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
});
```

## En la interfaz de usuario

El kit [`@qorechain/react`](/sdk/guides/react) expone todo esto en React: el
hook `usePqcStatus` y el componente `<QuantumSafeBadge/>` muestran un indicador de
**seguridad cuántica** siempre que la cuenta conectada tenga una clave PQC registrada.
