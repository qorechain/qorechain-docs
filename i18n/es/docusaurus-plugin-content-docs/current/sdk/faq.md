---
slug: /sdk/faq
title: Preguntas frecuentes y resolución de problemas
sidebar_label: Preguntas frecuentes
sidebar_position: 8
---

# Preguntas frecuentes y resolución de problemas

## ¿Está la mainnet en funcionamiento?

Sí. La mainnet está **en funcionamiento** (id de cadena `qorechain-vladi`, en
funcionamiento desde el 7 de junio de 2026) y ejecuta la versión de cadena v3.2.6 (aplicada en la altura 4,020,000 el 4 de noviembre de 2026, propuesta de gobernanza 15; la v3.2.5 se aplicó en la altura 3,906,833 el 29 de octubre de 2026 y la v3.2.4 en la altura 3,742,566 el 23 de octubre de 2026); la testnet ejecuta v3.2.6 desde el 27 de octubre de 2026, v3.2.7 desde el 6 de noviembre y v3.2.8 desde el 12 de noviembre de 2026 (altura 9,929,500; no está en la mainnet, sin fecha). El preajuste de testnet (`qorechain-diana`)
también sigue disponible. Desde el SDK 0.12.0 ambos preajustes usan por defecto los
endpoints públicos; selecciona la red con `createClient({ network: "mainnet" })` y
sobrescribe `endpoints` solo para tu propio nodo. Consulta
[Red y endpoints](/sdk/reference/network).

## ¿Por qué mis llamadas van a localhost?

Estás en un SDK **anterior a la 0.12.0**, cuyos preajustes usan por defecto endpoints de **localhost**:
actualiza, o pasa un objeto `endpoints`. Desde la 0.12.0 `createClient()` y
`createClient({ network: "mainnet" })` usan los endpoints públicos, y el preajuste
`localnet` es el que usa localhost.

```ts
const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",
    rpc: "https://rpc-testnet.qore.host",
    evmRpc: "https://evm-testnet.qore.host",
  },
});
```

Si en cambio obtienes "endpoint ... is not configured for the mainnet preset", la llamada
necesita un endpoint que los preajustes públicos no definen (gRPC, un RPC de SVM, el
WebSocket EVM de la mainnet); pásalo en `endpoints`.

La ruta de firma (`connectTx`) necesita el endpoint de consenso **`rpc`**; las
lecturas de QoreChain Native también lo usan. Las lecturas REST usan `rest`; las llamadas
EVM usan `evmRpc` (y las llamadas `qor_` también, en un nodo que sirva ese
espacio de nombres). Las URL de la mainnet están en la
[referencia de red](/sdk/reference/network#public-endpoints).

## "Cannot find module 'viem'" / "'@solana/web3.js'"

Estas son **dependencias de pares** de `@qorechain/evm` y `@qorechain/svm`
respectivamente. Instálalas en tu proyecto:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Una llamada a un precompilado lanza "returned no data" / "feature not present"

Los precompilados EVM de QoreChain están compilados en el nodo pero **no están
activos en la mainnet**, y solo tres están activos en la testnet: solo responden donde
sus direcciones figuran en el parámetro `active_static_precompiles` del módulo EVM.
Esa lista está vacía en la mainnet; en la testnet contiene los precompilados de
verificación PQC (`0x…0A01`), de estado de clave PQC (`0x…0A02`) y de parámetros de
consenso (`0x…0C01`) (comprobado el 27 de octubre de 2026; la lista de la testnet también contenía el puente cross-VM `0x…0901` desde el 4 de noviembre y el 7 de noviembre de 2026, activo con una lista de permitidos (probado con `eth_call`), y la de la mainnet seguía vacía), así que el par de IA sigue
sin responder nada allí. Donde un precompilado está inactivo la
llamada devuelve datos vacíos, así que viem informa `returned no data ("0x")` y el
auxiliar lanza un error (consulta
[Precompilados EVM: estado de la red](/developer-guide/evm-precompiles#network-status)).
En un nodo EVM normal las llamadas fallan del mismo modo. Revisa
`GET /cosmos/evm/vm/v1/params` y envuelve cada llamada a un precompilado para que
el error se maneje por llamada.

## Mi llamada a `client.qor` falla con -32601

`client.qor` llama al espacio de nombres JSON-RPC `qor_`, que ninguna compilación
publicada del nodo sirve; `rpc_modules` en los endpoints EVM públicos solo lista
`eth`, `net`, `rpc`, `txpool` y `web3`. Usa en su lugar una ruta REST, por ejemplo
`GET /qorechain/pqc/v1/account/{address}` (estado de la clave PQC) o
`GET /qorechain/burn/v1/stats`, mediante `client.rest.get(...)`. Consulta
[el espacio de nombres `qor_`](/api-reference/json-rpc-qor_-namespace).

## Mis cantidades están desfasadas por un factor de un millón

QOR tiene **10^6** unidades base `uqor`. Usa `toBase` / `fromBase` y haz todas las
operaciones matemáticas en unidades base:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

Ten en cuenta que el runtime EVM representa QOR con **18** decimales (convención
de EVM), lo cual es distinto de la base `uqor` Native de 10^6.

## ¿Qué paquetes están publicados y dónde?

Todos (comprobado el 11 de noviembre de 2026). El núcleo de TypeScript
(`@qorechain/sdk`, 0.13.0), el kit de React (`@qorechain/react`, 0.13.0), el
generador de proyectos `create-qorechain-dapp` (0.13.1, un parche solo de plantillas sobre el SDK 0.13.0) y los adaptadores EVM/SVM
(`@qorechain/evm`, `@qorechain/svm`, 0.13.0) están en npm; el cliente de Python
está en PyPI (`pip install qorechain-sdk` en 0.13.0, importa `qorsdk`); el cliente
de Go está en el proxy de módulos
(`go get github.com/qorechain/qorechain-sdk/packages/go@v0.13.0`); el cliente de
Rust está en crates.io (`cargo add qorechain-sdk`, 0.13.0); y el cliente de Java
está en Maven Central (`io.github.qorechain:qorechain-sdk`, JDK 17 o posterior), donde la 0.13.0 está
publicada (comprobado el 11 de noviembre de 2026). Consulta
[Instalación](/sdk/install) para ver los comandos completos por lenguaje.

## Mi frase mnemotécnica es rechazada

El SDK valida tanto la lista de palabras BIP-39 **como** la suma de comprobación
antes de derivar cualquier clave, de modo que una frase con una errata genera un
error en lugar de producir silenciosamente la cuenta equivocada. Vuelve a revisar
las palabras; usa `validateMnemonic` para probar una frase.

## Transacciones híbridas (PQC)

El envío híbrido (clásico + ML-DSA-87) está **en funcionamiento y es
obligatorio** en la ruta Native: las transacciones Native solo clásicas son
rechazadas en la cadena (chain v3.2.0). Antes de que una transacción híbrida se
verifique con PQC, la clave pública PQC del firmante debe **registrarse de forma
explícita** con `MsgRegisterPQCKeyV2` (una transacción firmada de forma clásica y
exenta del requisito híbrido); incrustar la clave pública en la extensión
(`includePqcPublicKey: true`) **no** la registra, y la cadena no registra una
clave en el primer uso. En TypeScript, entrega al cliente el par de claves
(`client.connectTx(signer, { pqcKeypair })`, SDK 0.9.0 o posterior) y cada transacción que
envíe se firma de forma híbrida.
La cadena acepta cualquier firma ML-DSA-87 válida según FIPS-204, hedged o
determinista. El SDK firma de forma determinista por defecto (desde 0.5.1) para
que una transacción tenga siempre la misma firma y el mismo hash de tx. Si una tx
híbrida falla con el código 21 de `pqc` (`hybrid_verify_failed`), la causa es la
versión de los sign-bytes, el chain-id, una biblioteca PQC obsoleta o una clave no
registrada o distinta, nunca la firma hedged.
Ambas redes verifican la forma v2 de los sign-bytes, así que usa el SDK **0.8.1 o
posterior** (la 0.13.0 es la actual) y pasa `rest` (o `signBytesVersion`): los
constructores lanzan un error en `qorechain-vladi` / `qorechain-diana` si no se
indica uno de ellos. Consulta
[Solución de problemas del código 21](/developer-guide/post-quantum-signing#code-21) y
[Cuentas y firma PQC](/sdk/concepts/accounts-pqc).

## Mi transacción EVM es rechazada con "no open EVM authorisation window"

Desde chain v3.2.0, el carril EVM admite una transacción solo de una cuenta que
tenga una clave PQC registrada y una ventana de autorización abierta. Registra una
clave, abre una ventana y luego envía. Consulta
[Ventana de autorización EVM](/sdk/guides/evm#evm-window). Con el SDK,
`classifyEvmWindowRejection(err)` devuelve `"no-pqc-key"`, `"no-window"`,
`"exhausted"` o `"invalid"`.

## Mis transacciones híbridas fallan en CheckTx con un error de análisis de la transacción

Actualiza el SDK. Las versiones **0.6.0 y anteriores** serializaban en JSON la
extensión del cuerpo de la transacción `/qorechain.pqc.v1.PQCHybridSignature`,
que el decodificador de transacciones de la cadena rechaza en CheckTx. Desde
**0.6.1** la extensión se codifica en protobuf (el valor comienza con `0x08`) en
los cinco lenguajes: las transacciones híbridas construidas con versiones
anteriores son rechazadas en la cadena, en todos los carriles (incluido
eth-native).

## ¿Con qué versiones de la cadena funciona el SDK?

El SDK **0.12.0** es la versión de cliente para la cadena **v3.2.5** (la mainnet
desde el 29 de octubre de 2026 en la altura 3,906,833; la testnet desde el 26 de
octubre). La mainnet ejecuta la v3.2.6
(desde el 4 de noviembre) y la testnet la v3.2.8 (desde el 12 de noviembre; la v3.2.7 desde el 6 de noviembre, la v3.2.6 desde el 27 de octubre); el formato de firma no
cambió hasta la v3.2.6, así que la 0.12.0 funciona en la mainnet. La 0.12.0 no tiene constructores para las novedades de la v3.2.7 (el registro de multifirma PQC, el modo de firma textual, el APR, la identidad de clúster y los mensajes de verification key), y su ruta de firma no se volvió a comprobar contra la testnet v3.2.7; usa la CLI para ellos. Añade la regla exacta de gas para las transacciones híbridas, los
constructores y la lectura del registro de claves ML-KEM, las lecturas de cuentas
abstractas y los constructores verificados de parámetros de gobernanza (consulta
[Qué añade la 0.12.0](/sdk/install#whats-new-0120)), además de lo que la 0.10.0 añadió
para v3.2.4 (los constructores y lecturas de los niveles de staking, `fetchAuthNonce`
y las lecturas de funcionalidades del protocolo, consulta
[Qué añadió la 0.10.0](/sdk/install#whats-new-0100)) y lo que la 0.9.0 añadió para
v3.2.2 y v3.2.3: constructores para la prueba de posesión opcional en el registro
(la adjunta automáticamente `ensurePqcRegistered` una vez que la red haya aplicado
v3.2.3), las ventanas EVM con alcance y los mensajes de consentimiento EIP-7702. El SDK **0.8.1 o posterior**
también opera en ambas redes (la forma v2 de los sign-bytes híbridos, el registro,
los envíos híbridos y la ventana EVM funcionan sin cambios), pero no tiene ninguno
de esos constructores: usa la CLI para ellos (consulta
[Versiones anteriores a la 0.9.0](/sdk/install#before-090)). El formato de firma no
cambió en v3.2.4, v3.2.5 ni v3.2.6. La mainnet ejecuta v3.2.6 y la testnet v3.2.8 (la testnet aplicó la v3.2.5 el 26 de octubre
de 2026, la v3.2.6 el 27 de octubre, la v3.2.7 el 6 de noviembre y la v3.2.8 el 12 de noviembre; la mainnet aplicó la v3.2.5 el 29 de octubre y la v3.2.6 el 4 de noviembre). El SDK 0.10.0 y el 0.9.0 siguen funcionando en ellas, pero no tienen constructores para las
novedades de la v3.2.5 (el registro de claves ML-KEM, la regla exacta de gas); con esas versiones usa la CLI, o actualiza a la 0.13.0. La 0.12.0 se construyó y se verificó contra la v3.2.5.

## Mi registro de clave PQC fue rechazado pero se cobró la comisión

Un registro para una cuenta que ya tiene una clave es rechazado por la cadena
después de descontar la comisión. `ensurePqcRegistered` en la 0.9.0 y posteriores lee primero
`GET /qorechain/pqc/v1/account/{address}` (pasa `rest`), omite el registro cuando
la clave de este par de claves ya está registrada, y lanza `PqcKeyMismatchError`
cuando hay una distinta. Las versiones anteriores no miraban primero, a menos que
pasaras tú mismo `status: { registered: found }`, donde `found` proviene de esa
ruta. Desde v3.2.3 la cadena también rechaza las claves débiles, degeneradas y
reutilizadas; las claves de `derivePqcCanonical` o `tx pqc gen-key` son válidas.

## `create-qorechain-dapp` instala un SDK que no puede firmar

Solo la versión 0.8.0 del generador lo hacía: escribía rangos `^0.3.0` para
`@qorechain/sdk` y `@qorechain/evm`, y un rango con caret sobre una versión 0.x se
queda dentro de la 0.3. Las versiones 0.9.0 y posteriores generan el proyecto sobre el SDK actual;
si usaste la 0.8.0, ejecuta `npm i @qorechain/sdk@latest` (y
`@qorechain/evm@latest`) después de generar el proyecto.

## `VERSION` dice 0.8.0 pero instalé la 0.8.3

La constante exportada `VERSION` de la 0.8.3 no se actualizó e informa `0.8.0`;
desde la 0.9.0 coincide con el paquete. En versiones anteriores, lee la versión
instalada de `package.json`.

## Mi gasto mediante authenticator es rechazado con `authenticator_replay`

(El módulo `abstractaccount` está desactivado en la mainnet; un gasto allí se
rechaza con `abstract account module is disabled` antes de comprobar ningún
nonce. Está activado en la testnet. Consulta
[Authenticators y gasto delegado](/sdk/guides/authenticators). La
orientación siguiente se aplica dondequiera que el módulo esté activado.)

El nonce es incorrecto. Tanto `MsgExecuteEVM.nonce` como `MsgExecuteCosmos.nonce`
son la **secuencia de authenticator** de la clave vinculada para
`(account, pubkey)`: un contador que la cadena mantiene por cada clave vinculada,
que empieza en 0 y se incrementa con cada ejecución correcta. **No** es el nonce
EVM de la cuenta. Léelo con `fetchAuthNonce` (SDK 0.10.0 o posterior, cadena v3.2.4 o
posterior), o llévalo tú por cada clave vinculada en versiones anteriores. Desde
v3.2.3 el carril EVM también firma
`evmAuthSignBytesV2`, que vincula el límite de gas de la llamada
(`resolveEvmAuthDigestVersion` elige la forma). Usa el contador que leas (o lleves)
para esa clave y firma de nuevo.

Otros fallos de authenticator se decodifican mediante `decodeTxError`: códigos de
`abstractaccount` 5 (`spending_limit_exceeded`), 6 (`session_key_expired`) y
10 (`permission_denied`). Consulta
[Authenticators y gasto delegado](/sdk/guides/authenticators).
