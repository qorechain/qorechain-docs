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
En las redes en producción esto no es opcional para las transacciones de la ruta Native: la
clave debe registrarse **explícitamente** (no hay registro automático en la primera
transacción), y después cada transacción de la ruta Native debe llevar la firma híbrida.

## Comprobar el estado {#check-status}

`isPqcRegistered` / `getPqcStatus` leen si una dirección tiene una clave PQC
registrada mediante el método JSON-RPC `qor_getPQCKeyStatus`. Aceptan ya sea un
`QorClient` o el cliente compuesto de `createClient`. **Los endpoints públicos
no sirven el espacio de nombres `qor_`** (consulta
[el espacio de nombres `qor_`](/api-reference/json-rpc-qor_-namespace)), así que contra
`*.qore.host` esas utilidades fallan con el error JSON-RPC `-32601`. Lee el estado
por REST en su lugar:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

async function isPqcRegistered(address: string): Promise<boolean> {
  const res = await client.rest.get<{ found: boolean }>(
    `/qorechain/pqc/v1/account/${address}`,
  );
  return res.found;
}
```

La ruta es `GET /qorechain/pqc/v1/account/{address}` (`account` en singular). Responde
`{"found": true, "account": {…}}` para una dirección registrada y
`{"found": false, "account": null}` en caso contrario. No uses `client.rest.getPqcAccount`
para esto: llama a la ruta en plural `/accounts/`, que la cadena no sirve.

`isPqcRegistered(client, address)` y `getPqcStatus(client, address)` (con la opción
`statusSource`) siguen siendo las llamadas adecuadas contra un nodo que sirva el espacio
de nombres `qor`; su resultado es
`{ registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }`.

El mismo estado también se puede leer desde el lado EVM mediante el
precompilado `pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
en `0x0000000000000000000000000000000000000A02` (expuesto como
`pqcKeyStatus` en `@qorechain/evm`) una vez que ese precompilado esté activo; todavía no
está activo en mainnet ni en testnet (consulta
[Estado de la red](/developer-guide/evm-precompiles#network-status)). La próxima versión
de parche del SDK recurre a la ruta REST anterior cuando recibe un cliente que expone
`.rest` (como el cliente compuesto), y lanza un error en lugar de informar «no
registrada» cuando no se puede leer el estado.

## Registrar en una sola llamada

`ensurePqcRegistered` hace que una cuenta sea segura frente a lo cuántico. Construye y difunde
`MsgRegisterPQCKeyV2` con la clave pública ML-DSA-87 del firmante y la clave pública ECDSA
de la cuenta. Es **idempotente** cuando le pasas un `status` leído previamente (o un
`statusSource`): omite el registro cuando la clave ya está registrada, de modo que
es seguro llamarla en cada arranque de la app.

El registro se firma de forma clásica y está exento del requisito híbrido, de modo que una
cuenta nueva puede arrancar su primera clave. Se firma mediante un firmante de CosmJS, es decir,
una cuenta con coin type 118 (`deriveNativeAccount`); para una cuenta unificada eth-nativa
firma el registro con `EthNativeSigner` y `signMode: "classical"` (consulta
[Cuentas y firma PQC](/sdk/concepts/accounts-pqc#hybrid-signing)). La clave de
2592 bytes necesita un límite de gas de unos 600.000; el precio mínimo del gas de la red es
0,1 uqor por unidad de gas.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  ensurePqcRegistered,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const tx = await client.connectTx(signer);

// The address-bound key, recoverable from { address, mnemonic } (SDK 0.8.3+).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// Read the status over REST: the default status source needs the `qor_` namespace.
const { found } = await client.rest.get<{ found: boolean }>(
  `/qorechain/pqc/v1/account/${account.address}`,
);

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }
```

## Firmar de forma híbrida

`migrateToHybrid` garantiza el registro y devuelve una ruta de envío híbrida con el
par de claves preenlazado a los constructores existentes `buildHybridTx` / `signAndBroadcastHybrid`.
Pasa `rest` para que el SDK pueda determinar qué forma de sign-bytes híbrida
verifica la red (consulta
[¿Qué forma de sign-bytes?](/sdk/concepts/accounts-pqc#sign-bytes-versions)):

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await hybrid.signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,          // classical secp256k1 direct signer
  messages,
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,       // a connected broadcast transport (e.g. StargateClient)
});
```

La cadena acepta cualquier firma ML-DSA-87 FIPS-204 válida, ya sea hedged o
determinista. El SDK firma de forma determinista por defecto (desde 0.5.1), de modo que
una transacción siempre tiene la misma firma y el mismo hash de tx. Si una tx híbrida falla con
el código `pqc` 21 (`hybrid_verify_failed`), la causa es la versión de sign-bytes,
el chain-id, una biblioteca PQC obsoleta o una clave no registrada o distinta, nunca la
firma hedged: consulta [Solución de problemas del código 21](/developer-guide/post-quantum-signing#code-21).

## Rotar una clave

Para sustituir la clave ML-DSA-87 de una cuenta por otra clave del **mismo** algoritmo
(por ejemplo, pasar una clave heredada `shake256(mnemonic)` a la clave canónica vinculada
a la dirección, o retirar una clave comprometida), construye un `MsgRotatePQCKey` con
`rotatePqcKeyMsgFromMnemonic`; ambas claves lo firman conjuntamente. Consulta
[Rotación de claves](/sdk/guides/authenticators#key-rotation) para ver el ejemplo completo.

`migratePqcKey` difunde el antiguo `MsgMigratePQCKey`, que mueve una cuenta
entre **algoritmos** y requiere que el llamador aporte ambas firmas:

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
**seguridad cuántica** siempre que la cuenta conectada tenga una clave PQC registrada. Ambos leen el
estado mediante `getPqcStatus`, así que contra los endpoints públicos (sin el espacio de
nombres `qor_`) hoy no pueden confirmar una clave; consulta los límites de las redes en
producción en la página de React.
