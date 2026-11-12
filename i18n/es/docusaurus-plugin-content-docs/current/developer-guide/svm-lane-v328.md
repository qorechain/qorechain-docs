---
slug: /developer-guide/svm-lane-v328
title: "Carril SVM: programas, cuentas y límites de custodia (v3.2.8)"
sidebar_label: Carril SVM (v3.2.8)
sidebar_position: 10
---

# Carril SVM: programas, cuentas y límites de custodia (v3.2.8)

El carril SVM es la parte de QoreChain compatible con Solana: despliegas programas compilados, creas cuentas de datos y llamas a programas con herramientas al estilo Solana, y el mismo saldo de QOR nativo es visible en lamports. La versión **v3.2.8** cerró el carril en la actualización hasta que una votación de gobernanza lo reabrió. En la testnet esa votación (propuesta 37) se ha aprobado y el carril está **abierto**; su custodia está acotada por tres límites gobernados.

Esta página explica cómo leer el estado del carril, cómo funcionan los programas, las cuentas y la renta, cómo registra una clave poscuántica una cartera SVM, qué significan los límites de custodia y qué ejemplos pueden ejecutarse hoy.

:::note Primero la testnet, y el carril está abierto allí desde la propuesta 37
v3.2.8 se ejecuta en la testnet **`qorechain-diana`** desde el 12 de noviembre de 2026. La mainnet (`qorechain-vladi`) sigue en v3.2.6, no tiene fecha para v3.2.8 y **el carril sigue desactivado en la mainnet**. La actualización cerró el carril en la testnet (las escrituras SVM fallaban, `MsgRegisterSVMPQCKey` se rechazaba). **La propuesta de gobernanza 37 se aprobó y lo abrió en `qorechain-diana`**: puso `enabled: true`, dejó los demás parámetros como estaban y levantó la pausa del disyuntor (circuit breaker) sobre `MsgExecuteProgram` y sobre las llamadas entre VM. Al comprobarlo el 12 de noviembre de 2026 tras la votación, `GET /qorechain/svm/v1/params` mostraba `enabled: true` y la lista del disyuntor contenía solo `/cosmwasm.wasm.v1.MsgStoreCode`. El JSON-RPC público de SVM sigue siendo de solo lectura. Lee siempre el estado en vivo primero (sección siguiente) y no lo des por supuesto.
:::

## Por qué importa {#why}

* Un cliente que ofrece acciones SVM mientras el carril está cerrado da a los usuarios transacciones rechazadas. Leer un parámetro antes lo evita.
* El carril guarda QOR real: cada lamport de un programa, de una dirección derivada de programa o de una cuenta de datos está respaldado por uqor que guarda el módulo SVM. Los tres límites de custodia mantienen ese fondo acotado, así que una transferencia o un depósito puede ser rechazado aunque el remitente tenga los fondos.
* La renta y los límites de tamaño deciden cuánto cuesta mantener estado en la cadena, así que pertenecen al presupuesto de un despliegue.

## Leer el estado del carril {#lane-state}

El estado del carril es el campo `enabled` de los parámetros de SVM. Léelo desde la ruta REST o desde la CLI del nodo. La misma respuesta lleva todos los demás límites de esta página, así que una sola llamada basta para dimensionar un despliegue.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

Respuesta en `qorechain-diana`, 12 de noviembre de 2026, tras aprobarse la propuesta 37 (HTTP 200):

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":true,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

En un nodo Linux (no hay un binario empaquetado para macOS), la misma lectura es:

```bash
qorechaind query svm params --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

En TypeScript, con Node 18 o posterior (no hace falta ninguna llamada del SDK para esta lectura):

```ts
const REST = "https://api-testnet.qore.host";

const { params } = await (await fetch(`${REST}/qorechain/svm/v1/params`)).json();
if (!params.enabled) {
  throw new Error("The SVM lane is closed on this network; do not offer SVM actions");
}
console.log("compute units per instruction:", params.compute_budget_max);
```

Un ayudante tipado para estos parámetros (y un constructor seguro para una propuesta de parámetros) forma parte del borrador del SDK para v3.2.8, que todavía no está publicado. Una versión posterior del SDK lo añadirá; hasta entonces usa la línea de comandos o la ruta REST.

### Identidad del clúster {#cluster-info}

`cluster_info` identifica el clúster para las carteras e indica si la ejecución está activada. No cambia con el estado del carril de ninguna otra forma que no sea `execution_enabled`.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/cluster_info
```

Respuesta del 12 de noviembre de 2026, leída tras aprobarse la propuesta 37, con `execution_enabled` en `true` (HTTP 200):

```json
{"chain_id":"qorechain-diana","genesis_hash":"6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj","caip2_chain_id":"solana:6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zR","derivation":"base58(SHA-256(\"qorechain/svm/genesis-hash/v1\" || 0x00 || chain_id))","execution_enabled":true}
```

La CLI del nodo tiene la misma consulta: `qorechaind query svm cluster-info`. El método JSON-RPC `getGenesisHash` en `https://svm-testnet.qore.host` devuelve el mismo hash. El hash se deriva del id de la cadena; no es el hash génesis de un clúster real de Solana.

## El RPC público de SVM es de solo lectura {#public-rpc}

Los endpoints públicos `https://svm.qore.host` y `https://svm-testnet.qore.host` responden a lecturas y rechazan los métodos de escritura (`sendTransaction` y similares) en los ids de cadena públicos, esté o no abierto el carril. Para enviar transacciones SVM ejecutas tu propio nodo, que sirve el JSON-RPC compatible con Solana en el puerto 8899 por defecto (véase [Desarrollo con SVM](/developer-guide/svm-development#json-rpc-server)), y el propio carril debe estar abierto en la red que sigue ese nodo. Las lecturas funcionan ahora:

```bash
# Health, version, cluster hash, slot and a rent quote (all HTTP 200 on 12 November 2026)
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getGenesisHash","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getMinimumBalanceForRentExemption","params":[1024]}'
```

`getVersion` informó `solana-core` `1.18.0-qorechain` junto con el id de la cadena, el id del clúster y el hash génesis. La cotización de renta para 1,024 bytes fue de `8017920` lamports el 12 de noviembre de 2026. Las rutas REST `GET /qorechain/svm/v1/account/{address}`, `.../program/{address}` y `.../slot` respondieron **HTTP 501** (no implementado) en el endpoint público; lee cuentas y programas mediante los métodos JSON-RPC `getAccountInfo` y `getMultipleAccounts`, o mediante la CLI del nodo.

## Desplegar y llamar a programas {#programs}

Una vez abierto el carril, el flujo es: construir un programa SBF con la cadena de herramientas actual de Solana, desplegarlo, crear las cuentas que necesita y luego llamarlo. Cada comando `tx svm` es una transacción del carril Cosmos, así que necesita un límite de gas explícito, una comisión de al menos el gas por 0.1 uqor y la cofirma poscuántica híbrida (véase [Firma poscuántica](/developer-guide/post-quantum-signing)).

Estos son los comandos de la CLI de nodo para Linux de la referencia del nodo. **UNTESTED (sin probar): el carril se abrió en la testnet solo después de la propuesta 37, y para esta página no se ejecutó ningún despliegue de programa, ejecución ni creación de cuenta.**

```bash
# 1. Build (platform-tools v1.53, --arch v0 or --arch v3)
cargo build-sbf --arch v3

# 2. Deploy; the response carries the program id in base58
qorechaind tx svm deploy-program ./my_program.so --from mykey \
  --gas 2000000 --fees 200000uqor --chain-id qorechain-diana --generate-only > tx.json
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana

# 3. Create a data account owned by the program (space in bytes, lamports for rent)
qorechaind tx svm create-account <owner-base58> <space> <lamports> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json

# 4. Call the program
qorechaind tx svm execute <program-id-base58> <data-hex> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json
```

Lecturas en un nodo, disponibles sea cual sea el estado del carril:

```bash
qorechaind query svm account <base58-address>
qorechaind query svm program <base58-address>
qorechaind query svm params
qorechaind query svm slot
```

### TypeScript con @qorechain/svm 0.13.0 {#typescript}

`@qorechain/svm` es una capa fina sobre `@solana/web3.js`. No tiene envoltorio del cargador (loader): usa la CLI del nodo de arriba para desplegar, y el paquete para construir y enviar instrucciones a un programa que ya existe. Sus presets públicos no fijan ningún endpoint SVM a propósito, así que dale la URL de tu propio nodo.

```ts
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createSvmClient,
  createInvokeInstruction,
  withComputeBudget,
  svmKeypairFromSecretKey,
} from "@qorechain/svm";

const client = createSvmClient({ rpcUrl: "http://127.0.0.1:8899" }); // your own node

const payer = svmKeypairFromSecretKey(secretKey64);       // 64-byte Solana-style secret key
const programId = new PublicKey("<program-id-base58>");
const dataAccount = new PublicKey("<data-account-base58>");

const tx = new Transaction().add(
  createInvokeInstruction(
    programId,
    [{ pubkey: dataAccount, isSigner: false, isWritable: true }],
    Uint8Array.from([0]),                                  // your program's instruction data
  ),
);
withComputeBudget(tx, { units: 200_000 });                 // stay under compute_budget_max

const sim = await client.simulateTransaction(tx);          // dry run first
const signature = await client.sendTransaction(tx, [payer]);
```

**UNTESTED:** este ejemplo necesita un nodo que ejecutes tú (el carril está abierto en la testnet). Contra el endpoint público el envío se rechaza. Las llamadas de solo lectura (`client.getBalance`, `client.getAccountInfo`, `client.getSignaturesForAddress`) funcionan contra `https://svm-testnet.qore.host` porque `createSvmClient({ rpcUrl })` acepta cualquier URL.

Python, Go, Rust y Java: los adaptadores SVM de esos lenguajes construyen los mismos mensajes; una versión posterior del SDK añadirá los ayudantes de v3.2.8. Hasta entonces usa la CLI del nodo de arriba o el mensaje en bruto. Cualquier biblioteca cliente de Solana puede también hablar con el puerto 8899 de tu propio nodo porque el conjunto de métodos es compatible con Solana.

## Cuentas y renta {#rent}

Las cuentas de datos SVM pagan por el espacio que usan. Las cifras salen de los parámetros en vivo de arriba.

| Elemento | Regla | Valor en vivo (testnet) |
| -------- | ----- | ----------------------- |
| Renta por año | tamaño de los datos en bytes por `lamports_per_byte` | 3,480 lamports por byte |
| Mínimo exento de renta | renta por año por `rent_exemption_multi` | multiplicador 2.0 |
| Financiada en el mínimo o por encima | nunca se le cobra renta | |
| Financiada por debajo del mínimo | la renta se descuenta en cada época | |
| El saldo llega a cero | la cuenta se elimina | |

Lamports y uqor se relacionan como 1 uqor = 1,000 lamports. Pregunta al nodo por el mínimo exacto en lugar de calcularlo: `getMinimumBalanceForRentExemption` devolvió 8,017,920 lamports para 1,024 bytes (la cotización incluye la cabecera de la cuenta). `create-account` necesita al menos esa cantidad de lamports, o la cuenta no queda exenta de renta.

Direcciones: la dirección SVM de una cuenta son sus 20 bytes de cuenta rellenados hasta 32 bytes y escritos en base58. Las formas `qor1...`, `0x...` y base58 nombran la misma cuenta.

## Clave poscuántica para carteras SVM {#pqc-key}

Una cartera SVM que quiera una clave poscuántica en la cadena la registra con **`MsgRegisterSVMPQCKey`**. Lleva el remitente, la dirección SVM de 32 bytes y la clave pública ML-DSA-87. Es un mensaje del carril Cosmos, así que el remitente lo firma en modo híbrido como cualquier otra transacción nativa. Se rechaza mientras el carril está cerrado, y **la cuenta SVM debe existir ya antes de registrar su clave** (véase el rechazo en [Probado en la testnet](#tested)).

No hay un comando `tx svm` para esto; usa el compositor del SDK. En TypeScript el compositor es `msg.svm.registerSvmPqcKey` en `@qorechain/sdk`. **UNTESTED para una cuenta existente: el único envío fue para una dirección sin cuenta, y se rechazó.**

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  msg,
} from "@qorechain/sdk";
import { fromBech32 } from "@cosmjs/encoding";

const client = createClient({
  network: "testnet",
  endpoints: { rest: "https://api-testnet.qore.host", rpc: "https://rpc-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);
const tx = await client.connectTx(signer, { pqcKeypair });   // signs hybrid

// 20 account bytes padded with zeros to the 32-byte SVM address
const svmAddr = new Uint8Array(32);
svmAddr.set(fromBech32(account.address).data);

await tx.signAndBroadcast(
  [msg.svm.registerSvmPqcKey({ sender: account.address, svmAddr, pqcPubKey: pqcKeypair.publicKey })],
  "auto",
);
```

El compositor de Python es `msg.svm.register_svm_pqc_key(sender=, ...)` y el de Go es `Svm.RegisterPQCKey(sender, svmAddr, pqcPubKey)`.

## Límites de custodia {#custody}

Cada lamport que tiene un programa, una dirección derivada de programa o una cuenta de datos está respaldado por uqor que el módulo SVM guarda en un único fondo, llamado custodia. Tres parámetros gobernados lo acotan. Los tres están en uqor; 1 QOR son 1,000,000 uqor. La gobernanza los cambia con una propuesta de parámetros, y una propuesta debe enviar los doce campos porque sustituye el conjunto en su totalidad.

| Parámetro | Valor en vivo | En términos sencillos |
| --------- | ------------- | --------------------- |
| `max_custody_uqor` | 10,000,000,000 (10,000 QOR) | El tope del saldo del fondo SVM. Una transferencia que elevara el fondo por encima se rechaza con `svm custody cap exceeded` (código 23). `0` significa sin tope. |
| `max_custody_hard_uqor` | 1,000,000,000,000 (1,000,000 QOR) | El techo absoluto del saldo bruto del fondo, incluidas las reservas de renta, la prefinanciación y las donaciones simples. Una operación que dejara el saldo por encima se rechaza. No debe ser inferior a `max_custody_uqor`, y debe ser mayor que cero para que el carril pueda abrirse. |
| `max_account_excess_uqor` | 10,000,000,000 (10,000 QOR) | Lo máximo que una sola cuenta de datos puede tener por encima de su mínimo exento de renta. `0` significa sin tope por cuenta. |

Qué significa esto para una aplicación: mantén modesto el valor que aparcas en cuentas SVM y por encima del mínimo de renta solo en lo que necesites. Un depósito que va bien para tu saldo aún puede ser rechazado si el fondo en su conjunto está cerca de su tope, así que trata el código 23 como "reintenta más tarde o con menos", no como una transacción inválida. Los límites solo pueden crecer mediante una votación de gobernanza, nunca por una transacción de un usuario.

## Presupuesto de cómputo y límites de tamaño {#limits}

| Límite | Parámetro | Valor en vivo (testnet) |
| ------ | --------- | ----------------------- |
| Unidades de cómputo por instrucción | `compute_budget_max` | 1,400,000 |
| Tamaño del programa (ELF) | `max_program_size` | 10,485,760 bytes (10 MiB) |
| Tamaño de la cuenta de datos | `max_account_data_size` | 10,485,760 bytes (10 MiB) |
| Llamadas anidadas entre programas | `max_cpi` | 4 |
| Esquema de firma por defecto | `default_sig_scheme` | 0 (Ed25519) |
| Desfase del slot | `svm_slot_offset` | 0 (el slot es la altura del bloque más el desfase) |

Cada marco tiene una pila de 32 KiB y un heap de 256 KiB. Los valores de arriba pueden cambiar por gobernanza, así que léelos en vivo. En `@qorechain/svm` 0.13.0, `withComputeBudget(tx, { units })` solicita un límite de unidades de cómputo; mantenlo igual o por debajo de `compute_budget_max`.

## Límites actuales del endpoint SVM de la testnet {#endpoint-limits}

El carril está abierto, pero el JSON-RPC público de SVM todavía no se comporta como un nodo completo de Solana. Planifica en función de estos límites:

- **`getLatestBlockhash` devuelve el blockhash como 64 caracteres hexadecimales,** no en base58 como hacen los nodos de Solana (leído el 12 de noviembre de 2026: `blockhash` `e8d4...d449`, `lastValidBlockHeight` 9944659). Un cliente que espere base58 tiene que convertirlo. El equipo de la cadena ha programado un cambio.
- **`sendTransaction` en el formato de transporte de Solana desde las herramientas estándar de Solana todavía no está soportado** en el endpoint público. Los programas se despliegan y se llaman con los mensajes Cosmos `MsgDeployProgram` y `MsgExecuteProgram`, firmados con la firma híbrida como cualquier transacción del carril Cosmos (véanse los ayudantes de TypeScript de arriba). La paridad completa con las herramientas de Solana está prevista para una versión posterior.
- **Una clave externa puede autorizar una acción SVM a través de un relayer.** La autorización firma un resumen vinculado a la cadena (dominio `qorechain-svm-auth-v3`) una vez que la red active la función de protocolo `svm-relayed-chain-bound`; `@qorechain/wallet-adapter` 0.6.0 lo construye con `authSignBytesV3`, y `resolveSvmAuthVersion` lee qué forma quiere la red.

## Errores y rechazos {#errors}

| Lo que ves | Significado | Qué hacer |
| ---------- | ----------- | --------- |
| `SVM module is disabled` (código 11) | El carril está cerrado (mainnet, o la testnet antes de la propuesta 37) | Lee `enabled`; no reintentes |
| `MsgRegisterSVMPQCKey` rechazado con `SVM account ... not found` (codespace `svm`, código 3) | La cuenta SVM todavía no existe | Crea primero la cuenta y luego registra su clave |
| `MsgRegisterSVMPQCKey` rechazado mientras el carril está cerrado | Carril cerrado | Regístrala cuando el carril se abra |
| Método de escritura rechazado en `svm.qore.host` o `svm-testnet.qore.host` | Los endpoints públicos son de solo lectura | Usa tu propio nodo |
| `svm custody cap exceeded` (código 23) | El fondo está en su tope | Reintenta más tarde o con una cantidad menor |
| `airdrop rate limit exceeded` (código 19) | `requestAirdrop` llamado con demasiada frecuencia (solo testnet) | Espera |
| `blockhash expired` (código 20) | El blockhash reciente es demasiado antiguo | Obtén uno nuevo y firma de nuevo |
| `svm simulation slots busy, retry later` (código 24) | Las simulaciones están acotadas; nunca ocurre dentro de un bloque | Reintenta la simulación |
| HTTP 501 en `/qorechain/svm/v1/account/...` | Ruta no implementada en el endpoint público | Usa `getAccountInfo` |

## Probado en la testnet {#tested}

Ejecutado en `qorechain-diana` el 12 de noviembre de 2026 (versión v3.2.8) tras aprobarse la propuesta 37.

| Paso | Resultado |
| ---- | --------- |
| `GET /cosmos/circuit/v1/disable_list` | Solo `/cosmwasm.wasm.v1.MsgStoreCode` |
| `GET /qorechain/svm/v1/params` | `enabled` true; `max_program_size` 10485760, `max_account_data_size` 10485760, `compute_budget_max` 1400000, `lamports_per_byte` 3480, `rent_exemption_multi` 2, `max_cpi` 4, `max_custody_uqor` 10000000000, `max_custody_hard_uqor` 1000000000000, `max_account_excess_uqor` 10000000000 |
| `MsgRegisterSVMPQCKey` para una dirección SVM que todavía no existe | Rechazado: codespace `svm` código 3, `SVM account ... not found: SVM account not found`. La cuenta debe existir antes de registrar su clave poscuántica |

No ejecutado (UNTESTED): despliegue de programa, ejecución de programa y creación de cuenta SVM.

## Mainnet {#mainnet}

La mainnet sigue por ahora en v3.2.6, con el carril SVM desactivado, y activarlo en la mainnet requiere una versión posterior y una votación de gobernanza. Planifica solo contra la testnet.

## Véase también {#see-also}

* [Desarrollo con SVM](/developer-guide/svm-development): la visión general del carril, el servidor JSON-RPC y el QOR nativo como lamports.
* [JSON-RPC compatible con Solana](/api-reference/json-rpc-solana-compatible): la lista de métodos.
* [Firma poscuántica](/developer-guide/post-quantum-signing): la firma híbrida que necesita toda transacción del carril nativo.
* [Interoperabilidad entre VM](/developer-guide/cross-vm-interoperability): llamadas entre SVM, EVM y QoreChain Native.
* [Operadores de nodo: lista de comprobación v3.2.8](/developer-guide/node-operators-v328): actualizar un nodo.
