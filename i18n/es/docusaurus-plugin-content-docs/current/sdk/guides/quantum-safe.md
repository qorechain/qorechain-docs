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
registrada. Con el cliente compuesto de `createClient` leen por REST
(`GET /qorechain/pqc/v1/account/{address}`, servida por todos los endpoints públicos); con
un `QorClient` simple usan el método JSON-RPC `qor_getPQCKeyStatus`, que **los
endpoints públicos no sirven** (consulta
[el espacio de nombres `qor_`](/api-reference/json-rpc-qor_-namespace)), así que contra
`*.qore.host` pasa el cliente compuesto. Las versiones anteriores a la 0.9.0 usaban siempre el
método `qor_` y fallaban con el error JSON-RPC `-32601`; allí lee directamente la ruta
REST.

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

const registered = await isPqcRegistered(client, address); // boolean
const status = await getPqcStatus(client, address);
// { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

La ruta es `GET /qorechain/pqc/v1/account/{address}` (`account` en singular). Responde
`{"found": true, "account": {…}}` para una dirección registrada y
`{"found": false, "account": null}` en caso contrario; `client.rest.getPqcAccount(address)`
devuelve ese cuerpo, y `fetchPqcStatus({ rest, address })` lo convierte en el estado
anterior. Una respuesta ilegible (un error HTTP, un fallo de transporte) lanza un error tras un
reintento: nunca se interpreta como «no registrada». En la 0.8.x `getPqcAccount` llamaba a una
ruta en plural `/accounts/` que la cadena no sirve.

El mismo estado también se puede leer desde el lado EVM mediante el
precompilado `pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
en `0x0000000000000000000000000000000000000A02` (expuesto como
`pqcKeyStatus` en `@qorechain/evm`) una vez que ese precompilado esté activo; no
está activo en mainnet, y figura como activo en la testnet (comprobado el 27 de octubre de 2026; consulta
[Estado de la red](/developer-guide/evm-precompiles#network-status)).

## Registrar en una sola llamada {#register-in-one-call}

`ensurePqcRegistered` hace que una cuenta sea segura frente a lo cuántico. Construye y difunde
`MsgRegisterPQCKeyV2` con la clave pública ML-DSA-87 del firmante. Es **idempotente**:
lee primero el estado de la cuenta (por REST cuando pasas `rest`), omite el
registro cuando la cuenta ya tiene la clave de este par de claves, y por lo tanto es
seguro llamarla en cada arranque de la app. Cuando la cuenta tiene una clave *distinta* lanza
`PqcKeyMismatchError` y no envía nada, porque toda transacción híbrida firmada
con tu par de claves sería rechazada. Nunca registra a ciegas: si no se puede leer el estado
lanza un error (pasa `force: true` solo para una cuenta de la que sepas que no tiene clave).

El registro se firma de forma clásica y está exento del requisito híbrido, de modo que una
cuenta nueva puede arrancar su primera clave; desde la v3.2.3 esa exención cubre solo una
cuenta sin clave (una cuenta que ya tiene una debe firmar de forma híbrida un registro
o una migración, y la cadena rechaza las claves débiles, degeneradas o reutilizadas). Una vez que la red
haya aplicado la v3.2.3, el helper firma con la clave nueva la **prueba de posesión** opcional y
la adjunta (lee el id de la cadena de `chainId` o del nodo, y
omite el campo en una red que no haya aplicado la v3.2.3, porque un nodo anterior
lo rechaza). Firma mediante un firmante de CosmJS, es decir, una cuenta con coin type 118
(`deriveNativeAccount`); para una cuenta unificada eth-nativa firma el registro con
`EthNativeSigner` y `signMode: "classical"` (consulta
[Cuentas y firma PQC](/sdk/concepts/accounts-pqc#hybrid-signing)). La clave de
2.592 bytes necesita un límite de gas de unos 600.000; el precio mínimo del gas de la red es
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

// The address-bound key, recoverable from { address, mnemonic } (0.8.3+; see below).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// With the keypair the client signs every transaction hybrid; the registration
// itself stays classical (the chain's bootstrap path).
const tx = await client.connectTx(signer, { pqcKeypair });

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  rest: client.network.endpoints.rest,
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }

await tx.bankSend("qor1…", [{ denom: "uqor", amount: "1000000" }]); // hybrid-signed
```

### Una clave que puedes recuperar {#canonical-derivation}

`derivePqcCanonical(address, mnemonic)` deriva la clave ML-DSA-87 de la cuenta a partir de su
dirección y su mnemónico, de modo que un dispositivo perdido es recuperable y cada lenguaje y
cada cartera derivan la misma clave (un mnemónico, una clave por cuenta). Primero resuelve la dirección a
su forma `qor1…` en minúsculas, así que la forma `0x` de una cuenta unificada da la
misma clave. Los equivalentes:

| Lenguaje | Función | Publicado |
| --- | --- | --- |
| TypeScript | `derivePqcCanonical(address, mnemonic)` (`@qorechain/sdk`) | 0.9.0 |
| Python | `derive_pqc_canonical(address, mnemonic)` (`qorsdk`) | 0.9.0 |
| Go | `authenticator.DerivePQCCanonical(address, mnemonic)` | v0.9.0 |
| Rust | `authenticator::try_derive_pqc_canonical(address, mnemonic)` (devuelve un `Result`) | 0.9.0 |
| Java | `Authenticator.derivePqcCanonical(address, mnemonic)` | 0.9.0 |

La derivación heredada (`derivePqcLegacy`, `"bridge"`) no está vinculada a la cuenta y
está obsoleta para claves nuevas; los helpers de rotación la rechazan como clave nueva (consulta
[Rotar una clave](#rotate-a-key)).

Registro en Python (0.9.0; la lectura del estado va por REST y la llamada lanza
`PqcKeyMismatchError` para una clave registrada distinta en lugar de pagar un segundo
registro):

```python
import httpx
from qorsdk import derive_native_account, derive_pqc_canonical, ensure_pqc_registered, fetch_pqc_status

REST = "https://api.qore.host"
native = derive_native_account(mnemonic, 0)
pqc_keypair = derive_pqc_canonical(native.address, mnemonic)

print(fetch_pqc_status(REST, native.address))  # {'registered': False} for a new account

acct = httpx.get(f"{REST}/cosmos/auth/v1beta1/accounts/{native.address}").json()["account"]
result = ensure_pqc_registered(
    account=native,
    pqc_keypair=pqc_keypair,
    chain_id="qorechain-vladi",
    account_number=int(acct["account_number"]),
    sequence=int(acct.get("sequence", 0)),
    rest_url=REST,
    fee={"amount": [{"denom": "uqor", "amount": "60000"}], "gas": "600000"},
)
```

Los helpers de Go (`pqcdx.Signer.RestURL`), Rust (`pqc_dx` `rest_url`) y Java
(`signer.restUrl`) leen el estado de la misma ruta REST y adjuntan la
prueba de posesión de la misma manera.

Los demás SDK firman de forma híbrida mediante sus constructores de transacciones híbridas
(`build_hybrid_tx` en Python y Rust, `tx.BuildHybridMessages` en Go,
`PqcDx.HybridSendPath` en Java); solo el `TxClient` de TypeScript firma de forma híbrida por ti.

:::warning Deja siempre que compruebe primero
La cadena rechaza un segundo registro de la misma clave **después de cobrar la
comisión**. Por eso `ensurePqcRegistered` lee primero el estado, por REST
(`/qorechain/pqc/v1/account/{address}`), y se niega a registrar cuando no puede
saberlo. Pasa `rest` (o `statusSource` para un nodo que exponga `qor_*`, o un
`status` leído previamente); `force: true` omite la comprobación. En la 0.8.x el helper no tenía
un recurso REST alternativo y difundía el registro sin comprobar, a menos que pasaras tú mismo `status`.
:::

## Firmar de forma híbrida

Con un `pqcKeypair` en el cliente, `tx.bankSend(...)` y
`tx.signAndBroadcast([messages], "auto")` firman de forma híbrida (la ruta `fee: "auto"`
simula la transacción híbrida y añade el gas de la verificación poscuántica).
La firma híbrida se calcula sobre la forma de sign-bytes que verifica la red (consulta
[¿Qué forma de sign-bytes?](/sdk/concepts/accounts-pqc#sign-bytes-versions)); el cliente
se lo pregunta a la red a través de su endpoint REST.

`migrateToHybrid` garantiza el registro y devuelve una ruta de envío híbrida con el
par de claves preenlazado a los constructores de más bajo nivel `buildHybridTx` /
`signAndBroadcastHybrid`, para cuando gestionas tú mismo la comisión, el número de cuenta y la secuencia. Pasa
`rest` para que el SDK pueda resolver la forma de sign-bytes:

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  rest: "https://api.qore.host",
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

## Rotar una clave {#rotate-a-key}

Para sustituir la clave ML-DSA-87 de una cuenta por otra clave del **mismo** algoritmo
(por ejemplo, pasar una clave heredada `shake256(mnemonic)` a la clave canónica vinculada
a la dirección, o retirar una clave comprometida), construye un `MsgRotatePQCKey` con
`rotatePqcKeyMsgFromMnemonic`; ambas claves lo firman conjuntamente. Consulta
[Rotación de claves](/sdk/guides/authenticators#key-rotation) para ver el ejemplo completo.

`migratePqcKeyHybrid` difunde el antiguo `MsgMigratePQCKey`, que mueve una cuenta
entre **algoritmos**, con la firma híbrida que la cadena exige desde la v3.2.3 a
una cuenta que tiene una clave. `pqcKeypair` es la clave que está registrada **actualmente**
(la que se retira), y el llamador aporta las dos firmas de titularidad
(`oldSignature` de la clave antigua, `newSignature` de la clave nueva). El
`migratePqcKey` clásico está obsoleto: un nodo v3.2.3 rechaza una migración clásica de una
cuenta con clave.

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migratePqcKeyHybrid, qorechainRegistry } from "@qorechain/sdk";

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await migratePqcKeyHybrid({
  sender: account.address,
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,   // the currently registered key
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,
});
```

## En la interfaz de usuario

El kit [`@qorechain/react`](/sdk/guides/react) expone todo esto en React: el
hook `usePqcStatus` y el componente `<QuantumSafeBadge/>` muestran un indicador de
**seguridad cuántica** siempre que la cuenta conectada tenga una clave PQC registrada. Ambos leen el
estado mediante `getPqcStatus` con el cliente compuesto, así que desde `@qorechain/react`
0.9.0 lo leen por REST y funcionan contra los endpoints públicos; la 0.8.x no
podía confirmar una clave allí.
