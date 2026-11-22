---
slug: /developer-guide/svm-testnet-v329
title: "SVM en la testnet: despliega programas y envía transacciones de Solana (v3.2.9)"
sidebar_label: SVM Testnet (v3.2.9)
sidebar_position: 11
---

# SVM en la testnet: despliega programas y envía transacciones de Solana (v3.2.9)

La versión **v3.2.9** permite que la línea de comandos estándar de Solana hable con QoreChain. Puedes ejecutar `solana transfer`, `solana program deploy`, `anchor deploy` y un script de web3.js contra la testnet, y la cadena comprueba ella misma cada firma de Solana. Una clave de Solana no puede tocar tu cuenta de QoreChain por sí sola: primero abres una pequeña **ventana de autorización** acotada con una transacción firmada con tu **clave post-cuántica**, y la ventana solo se acepta cuando la clave de Solana demuestra, con su propia firma, que la tienes. Cuando la ventana termina, la clave vuelve a ser una cuenta de Solana corriente.

Esta página lleva a un desarrollador desde una máquina vacía hasta un programa desplegado y llamado en la testnet: qué hay de nuevo, las herramientas, cómo construir a mano la prueba de clave, abrir y cerrar la ventana, financiar una clave de despliegue, desplegar con `solana` o `anchor`, llamar al programa, leer el resultado y una tabla con los textos de error reales.

:::note Solo testnet, comprobado el 22 de noviembre de 2026
Todo lo de aquí se ejecuta en la testnet **`qorechain-diana`**, que ejecuta v3.2.9 desde el 20 de noviembre de 2026 (propuesta de gobernanza 39, altura 10,424,000). El carril compatible con Solana (SVM) está abierto allí desde la propuesta de gobernanza 37. **Nada de esto funciona en la mainnet:** el carril SVM está desactivado en `qorechain-vladi`, las llamadas entre VM siguen en pausa y la subida de contratos CosmWasm sigue siendo solo por gobernanza. Construye solo contra la testnet. El QOR de prueba no tiene valor. Usa claves desechables.

Las llamadas de lectura, la cotización de la comisión, la ruta del nonce y el ejemplo de prueba de clave de esta página se ejecutaron contra la testnet en vivo el 22 de noviembre de 2026. El flujo completo (ventana, financiación, despliegue, llamada, actualización, cierre) se ejecutó antes de la versión en una red de pruebas local con `solana-cli` 4.0.2 y `anchor-cli` 1.2.2 sin modificar. Consulta [Qué se comprobó](#tested) para ver el reparto exacto.
:::

:::caution La pasarela pública todavía no retransmite transacciones
El 22 de noviembre de 2026 `https://svm-testnet.qore.host` respondió a cada `sendTransaction` bien formado con `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)`. Las lecturas funcionan, las cotizaciones de comisión funcionan, las escrituras se rechazan hasta que los operadores de esa pasarela configuren una cuenta retransmisora. Los pasos hasta la ventana incluida no necesitan pasarela. Para los pasos que envían, consulta [Enviar sin la pasarela pública](#relay) y vuelve a comprobar el endpoint antes de empezar: ejecuta el comando del [Paso 1](#step-config) y después un `solana transfer` como en el [Paso 6](#step-fund).
:::

## Novedades de v3.2.9 para la SVM {#whats-new}

* **Transacciones de Solana en la cadena.** Una transacción que firmó una cartera o herramienta de Solana viaja, byte a byte, en el mensaje Native `MsgSolanaTransaction`. La cadena verifica cada firma ed25519, el blockhash reciente y el pagador de la comisión, ejecuta las instrucciones en orden como un solo paso atómico y rechaza una firma que ya ha visto. El mensaje solo se ejecuta como mensaje de nivel superior de su propia transacción portadora: se rechaza bajo authz y cuando lo despacha un contrato.
* **Una pasarela que retransmite en lugar de ejecutar.** El método JSON-RPC de Solana `sendTransaction` del nodo ya no ejecuta nada en el nodo. Decodifica la transacción, la simula sobre una copia descartada del estado y la entrega a una cuenta retransmisora que firma la transacción portadora con ambas claves y la envía al mempool. Solo cambia el estado lo que pasa por un bloque. El retransmisor no gana ninguna autoridad sobre tu transacción, porque tus firmas ed25519 se verifican en la cadena.
* **Una ventana de autorización post-cuántica para claves de Solana.** `MsgOpenSVMWindow` nombra una clave ed25519 y la acota por bloques, número de transacciones y valor en QOR, limitada opcionalmente a programas listados. Mientras la ventana está abierta, las transacciones firmadas por esa clave actúan en nombre de tu cuenta. Abrirla exige tu **firma ML-DSA-87**, así que una clave de Solana filtrada por sí sola nunca puede abrir una.
* **Una prueba de clave.** Abrir una ventana necesita `svm_key_proof` (campo 7): una firma Ed25519 de 64 bytes, hecha por la propia clave de Solana, sobre un texto corto que nombra la cadena, tu cuenta y la clave. Una clave pública es pública, así que la prueba es lo que demuestra que quien abre la ventana tiene la clave.
* **Una prueba abre una ventana.** El texto lleva un contador (el nonce) que sube con cada ventana abierta para esa clave, así que una prueba antigua no puede reutilizarse.
* **Un cargador de programas.** El cargador actualizable está disponible, así que funcionan `solana program deploy`, `write-buffer`, `extend`, `set-upgrade-authority`, `close` y `anchor deploy`, y los programas pueden ser actualizados por su autoridad y cerrados para recuperar la renta.
* **Comisiones que entienden las herramientas de Solana.** `getFeeForMessage` y `simulateTransaction` informan la comisión real, así que las comprobaciones de comisión por defecto de `solana` y web3.js son correctas sin banderas adicionales. Cuando una transacción es demasiado barata, el error lleva el precio exacto que hay que fijar.
* **Presupuestos para concesiones authz.** `MsgExecuteProgram`, `MsgCreateAccount` y `MsgDeployProgram` enviados en tu nombre por otra persona bajo una concesión authz se ejecutan solo dentro de una ventana y su presupuesto aparte en nombre de otro.

### El camino de la transacción {#path}

```text
solana CLI / web3.js / anchor
        |  sendTransaction (signed wire transaction)
        v
SVM gateway on a node: decode, verify, simulate on a copy, check the price
        |  relayer signs MsgSolanaTransaction with the classical key and ML-DSA-87
        v
mempool, then a block: ante checks every Solana signature, blockhash, fee payer, window
        v
instructions run in order; they all succeed or none does
```

La comisión de Solana va al retransmisor, así que nunca pierde dinero. Cada respuesta de la pasarela es definitiva: un bloque se confirma una sola vez, así que `processed`, `confirmed` y `finalized` devuelven los mismos datos.

### La ventana: qué acota {#window}

| Límite | Qué significa | Rango |
| ----- | ------------- | ----- |
| Bloques | La ventana expira tras este número de bloques. Un bloque tarda unos 1.4 segundos en la testnet (comprobado el 22 de noviembre de 2026), así que 3,600 bloques son unos 85 minutos | 1 a 17,280 |
| Transacciones | Cada transacción de Solana admitida cuenta una, aunque después falle | 1 a 1,000 |
| Valor | Cuenta cada disminución del QOR nativo de la cuenta causada por transacciones admitidas, comisiones incluidas. Una transacción que superaría el valor se rechaza y se revierte. El valor se da en uqor o QOR, por ejemplo `25qor` | mayor que 0 |
| Programas (opcional) | Cada instrucción de una transacción admitida debe llamar a uno de los programas listados | hasta 16 |

Reglas que se siguen del diseño:

* La ventana la abren y cierran únicamente **tu propia firma post-cuántica**, como mensaje de nivel superior. Se rechaza bajo authz, group o un contrato.
* Necesitas una **clave post-cuántica registrada** antes de poder abrir una ventana.
* **Una clave de Solana autoriza una cuenta a la vez.** Abrir una ventana de nuevo sustituye a la anterior y libera su clave.
* **Cambiar o migrar tu clave post-cuántica termina la ventana.**
* Además del saldo nativo, el límite de valor cuenta también el QOR que tu firma controla en otros lugares: cuentas derivadas de la tuya con una semilla, cuentas de token que puedes cerrar, tablas de búsqueda y cuentas del cargador de las que eres la autoridad. Si se gastan o se entregan a otra persona, cuentan. Una clave de ventana nunca puede sacar la dirección propia de tu cuenta del estado de la cartera.
* Leer `getBalance` o `getAccountInfo` para la clave de la ventana muestra tu saldo nativo mientras la ventana está abierta.

### Límites conocidos de la ventana {#window-limits}

Léelos antes de abrir una ventana para una cartera que guarda tokens.

* **Las cantidades de tokens no se cuentan en el límite de valor.** El límite cuenta solo QOR nativo. Con el alcance por defecto (sin lista de programas), la clave de Solana puede transferir y quemar los tokens SPL de la cuenta, y acuñar con una autoridad de acuñación que la cuenta tenga, solo por la comisión de la transacción.
* **El alcance por defecto rechaza las concesiones duraderas.** Una clave que actúa mediante una ventana de alcance por defecto no puede aprobar un delegado, cambiar el propietario o la autoridad de cierre de una cuenta de token, ni cambiar la autoridad de acuñación o de congelación. Esto incluye una cuenta de token o una acuñación creada en la misma transacción. Estas acciones necesitan tu propia firma post-cuántica, o una ventana cuya lista de programas nombre el programa de tokens.
* **El pago de un cofirmante cuenta contra la ventana.** Si otra clave firma la misma transacción de Solana y paga algo en ella, ese pago también cuenta contra tu límite de valor. Deja que un patrocinador pague en una transacción aparte, o abre una ventana cuyo límite de valor cubra todo lo que mueve la transacción.
* **Las concesiones hechas bajo un alcance explícito de tokens sobreviven a la ventana.** Si la lista de programas nombra el programa de tokens, los delegados y cambios de autoridad hechos mediante la ventana siguen vigentes después de que la ventana se cierre, expire o tu clave post-cuántica rote. Revócalos con tu propia firma.
* **Para excluir por completo las acciones con tokens,** abre la ventana con una lista de programas que no nombre el programa de tokens.

### Comisiones {#fees}

| Concepto | Valor (testnet, 22 de noviembre de 2026) |
| ---- | --------------------------------- |
| Comisión base por firma | 0.045 QOR (45,000 uqor, 45,000,000 lamports). Es el precio de 450,000 de gas al precio mínimo de gas de la cadena de 0.1 uqor por gas, y `getFeeForMessage` lo informa |
| Unidades en pantalla | `solana` etiqueta las cantidades como **SOL**. En QoreChain 1 "SOL" es 1 QOR, porque 1 uqor son 1,000 lamports y 1 QOR son 1,000,000 uqor. Lee "0.045 SOL" como 0.045 QOR |
| Comisión de prioridad | Solo cuando la transacción necesita más gas del que paga la comisión base. Es el precio de ComputeBudget por el límite de unidades |
| Un despliegue | Una comisión base por transacción de escritura, más la renta, que se recupera cuando cierras el programa |

Lo que pagas está acotado por lo que firmaste: pagas el coste de la transacción portadora, como mínimo la comisión base y como máximo la comisión que prometió tu propia firma. Un retransmisor no puede hacerte pagar más.

Cuando una transacción paga menos de lo que cuesta su portadora, la pasarela la rechaza con el código `-32002` y te dice la corrección exacta. Los mismos números están en el `data` del error:

```json
{
  "code": -32002,
  "message": "Transaction simulation failed: insufficient priority fee: the transaction pays 45000000 lamports, its carrier costs ... uqor ... set ComputeBudget SetComputeUnitPrice to <price> micro-lamports per compute unit, which covers it for a compute unit limit of <limit> or more ...",
  "data": {
    "computeUnitPrice": 0,
    "computeUnitLimit": 0,
    "transactionComputeUnitLimit": 0,
    "carrierFeeLamports": 0,
    "feeLamports": 0
  }
}
```

Los ceros representan los números de tu transacción. Fija `SetComputeUnitPrice` a `data.computeUnitPrice` y un límite de unidades de al menos `data.computeUnitLimit`; un micro-lamport menos se rechaza otra vez. Con `solana program deploy` usa `--with-compute-unit-price <data.computeUnitPrice>`. En las ejecuciones previas a la versión, cada paso de un despliegue, actualización, extensión, cierre y cambio de autoridad normales de un programa cabía en la comisión base, así que este error te saldrá sobre todo con un `--max-len` inusualmente grande.

### Presupuestos en nombre de otro {#on-behalf}

Un beneficiario de authz que envía `MsgExecuteProgram`, `MsgCreateAccount` o `MsgDeployProgram` en tu nombre actúa solo dentro de tu ventana y de su **presupuesto aparte en nombre de otro**: `on_behalf_max_txs` y `on_behalf_max_value`. Los límites propios de la clave y el presupuesto en nombre de otro no pueden agotarse mutuamente. Sin presupuesto en nombre de otro (el valor por defecto) esas concesiones se rechazan y nada se mueve. Un `MsgExecuteProgram` envuelto en una ejecución authz con la propia cuenta como beneficiaria también cuenta como enviado en tu nombre, así que envía tus propios mensajes SVM como mensajes de nivel superior.

Cada ejecución o despliegue anidado hace además que tu cuenta pague la comisión plana de SVM, `max(1, compute_budget_max / 1000)` uqor, que son 1,400 uqor con el valor de parámetro en vivo de 1,400,000. Esa comisión cuenta contra el límite de valor en nombre de otro. Fija `--on-behalf-max-value` en al menos `on_behalf_max_txs` veces la comisión plana, más el valor que el beneficiario debe mover. Un valor de 0 rechaza toda ejecución en nombre de otro.

### El cargador {#loader}

| Ejecutas | Qué hace en la cadena |
| ------- | --------------------- |
| `solana program deploy x.so` | Escribe el programa en un búfer en muchas transacciones pequeñas y después lo despliega. El id del programa es el de `--program-id`, o uno nuevo |
| `solana program deploy --program-id <id> x.so` para un programa existente | Lo actualiza. Solo puede hacerlo la autoridad de actualización |
| `solana program write-buffer` / `show --buffers` / `close <buffer>` | Escribe, lista y cierra un búfer sin desplegar |
| `solana program extend <id> <bytes>` | Agranda el área de datos del programa |
| `solana program set-upgrade-authority <id> --new-upgrade-authority <key>` | Entrega las actualizaciones a otra clave. `--final` hace permanente el programa |
| `solana program close <id>` | Cierra el programa y devuelve la renta |
| `anchor deploy` | Hace lo mismo con el programa construido por Anchor |

Un programa puede pesar hasta 10 MiB (el `max_program_size` en vivo). Los programas se llaman entre sí hasta 4 niveles de profundidad (`max_cpi`). El presupuesto de cómputo por defecto es de hasta 1,400,000 unidades por instrucción.

## Palabras usadas en esta guía {#words}

| Palabra | Significado sencillo |
| ---- | ------------- |
| SVM | La máquina virtual compatible con Solana de QoreChain. Ejecuta los mismos programas compilados (SBF) que Solana |
| Lamport | La unidad más pequeña en las herramientas de Solana. 1 uqor son 1,000 lamports, y 1 QOR son 1,000,000,000 lamports |
| Ventana | Un permiso corto y acotado para que una clave de Solana actúe en nombre de tu cuenta. Abrirla necesita una transacción firmada con tu clave post-cuántica |
| Prueba de clave | La firma propia de la clave de Solana sobre un texto corto. Demuestra que tienes la clave que nombras |
| Nonce | Un contador por clave de Solana, que aumenta con cada ventana abierta con una prueba. La siguiente prueba debe firmar el valor actual |
| Portadora | La transacción Native que lleva una transacción de Solana a través de un bloque |
| Retransmisor | La cuenta que firma y envía la portadora. La comisión de Solana la reembolsa |
| Blockhash | El hash de bloque reciente sobre el que se construye una transacción de Solana. Es válido durante 150 slots, unos 3.5 minutos aquí |

## Antes de empezar {#prerequisites}

Necesitas una terminal en macOS o Linux, unos 10 QOR de prueba y estas herramientas (las versiones de la columna derecha son las usadas para esta página):

| Herramienta | Para qué | Versión usada |
| ---- | -------- | ------------ |
| Línea de comandos de Solana (Agave) | `solana`, `solana-keygen` | `solana-cli` 4.0.2 |
| Rust y `cargo build-sbf` | Construir un programa | `cargo-build-sbf` 4.0.0, platform tools v1.53, `rustc` 1.89 |
| Anchor (opcional) | `anchor build`, `anchor deploy` | `anchor-cli` 1.2.2 |
| Node.js 18 o superior | El script de prueba de clave y el script de llamada | cualquier LTS actual |
| `@solana/web3.js` 1.x | Llamar al programa | 1.99 |
| `qorechaind` v3.2.9 | Registrar tu clave post-cuántica, abrir y cerrar la ventana | el binario de la versión, ver abajo |

Comprueba lo que tienes:

```bash
solana --version
cargo build-sbf --version
anchor --version
node -v
```

**Sobre `qorechaind`.** Abrir una ventana es un mensaje Native que necesita tu firma ML-DSA-87, y el comando `tx pqc open-svm-window` forma parte de v3.2.9. El 22 de noviembre de 2026 el manifiesto de versiones de la testnet (`https://download.qore.host/testnet/latest.json`) seguía listando la versión 3.2.8, así que el paquete v3.2.9 es el nombrado en el texto de la propuesta de gobernanza 39 (`GET https://api-testnet.qore.host/cosmos/gov/v1/proposals/39`). El binario de la versión está construido para Linux; no hay un binario empaquetado para macOS. Todavía no se ha publicado un ayudante del SDK para la ventana. Todo lo demás de esta guía no necesita nodo.

También necesitas una cuenta de QoreChain con QOR de prueba (consíguelo en el [faucet](/dashboard/faucet)) y una clave post-cuántica registrada. Si no lo has hecho, sigue primero [Registrar tu clave](/developer-guide/post-quantum-signing#pqc-key-registration). Los comandos de abajo llaman `mykey` a la clave de la cuenta y `mykey-mldsa` a su clave post-cuántica.

:::caution Solo claves desechables de testnet
Los dos pares de claves de Solana que creas abajo son archivos con claves secretas dentro. Nunca uses un par de claves que tenga fondos reales en otra red, y nunca pegues una clave secreta en un comando, un chat o un repositorio.
:::

## Paso a paso {#steps}

Crea una carpeta de trabajo y una configuración de Solana separada, para no tocar tus ajustes normales de `solana`:

```bash
mkdir -p ~/qore-svm && cd ~/qore-svm
alias qsol='solana -C ~/qore-svm/solana-config.yml'
```

El alias ejecuta `solana` con su propio archivo de configuración. Sigue usando la misma terminal, o repite el alias en una nueva.

### Paso 1: Apunta las herramientas de Solana a la testnet {#step-config}

```bash
qsol config set --url https://svm-testnet.qore.host
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
qsol epoch-info
```

La primera línea guarda la dirección RPC en `solana-config.yml`. La segunda pregunta al nodo por su versión. Deberías ver `solana-core` `1.18.0-qorechain`, el id de cadena `qorechain-diana` y el hash de génesis `6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj` (HTTP 200). La tercera imprime el slot actual, que es igual a la altura de bloque (unos 10.57 millones el 22 de noviembre de 2026).

Los parámetros del carril deciden qué cabe. Léelos una vez:

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

Deberías ver `"enabled":true` y los límites de la testnet en vivo: `max_program_size` 10,485,760, `compute_budget_max` 1,400,000, `lamports_per_byte` 3,480, `max_cpi` 4. Si `enabled` es `false`, el carril está cerrado y nada de lo que sigue puede funcionar.

El endpoint público no sirve websocket (una actualización a websocket respondió HTTP 405 el 22 de noviembre de 2026), así que pasa `--use-rpc` a los comandos que confirman una transacción (`solana program deploy`, `write-buffer`) y deja que la herramienta consulte por HTTP simple. Anchor lo acepta tras un doble guion.

### Paso 2: Crea dos pares de claves de Solana {#step-keys}

```bash
solana-keygen new --no-bip39-passphrase --outfile window.json
solana-keygen new --no-bip39-passphrase --outfile deployer.json
solana-keygen pubkey window.json
solana-keygen pubkey deployer.json
```

Los dos primeros comandos escriben cada uno un archivo de par de claves (una matriz JSON de 64 números: la semilla secreta de 32 bytes y después la clave pública). Los dos últimos imprimen las claves públicas como texto base58. Deberías ver dos direcciones distintas de 32 a 44 caracteres. Llámalas `WINDOW_PUBKEY` y `DEPLOYER_PUBKEY`.

Por qué dos claves. La **clave de ventana** actuará en nombre de tu cuenta Native durante un tiempo corto. No guarda nada por sí misma; gasta tu QOR dentro de la ventana. La **clave de despliegue** es una clave de Solana corriente. La financias desde la ventana y, a partir de ahí, despliega, actualiza y es dueña del programa sin ventana alguna. No uses la clave de ventana como autoridad de actualización: el programa registra tu cuenta Native como autoridad, y `solana` rechaza una actualización firmada por una clave que no es la autoridad registrada.

Fija la clave de despliegue como firmante por defecto de tu configuración de Solana:

```bash
qsol config set --keypair ~/qore-svm/deployer.json
```

### Paso 3: Registra tu clave post-cuántica {#step-pqc}

Omite este paso si `qorechaind query pqc account <your qor address>` ya muestra una clave. Si no, en una máquina con el `qorechaind` de la versión:

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

qorechaind tx pqc gen-key mykey-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mykey-mldsa \
  --from mykey --chain-id $QCHAIN --node $QNODE --gas 600000 --fees 60000uqor -y
qorechaind query pqc account <your qor address> --node $QNODE
```

`gen-key` crea la clave ML-DSA-87 e imprime su clave pública en hexadecimal. `register-key-v2` la pone en tu cuenta, con una prueba de posesión. La consulta debería mostrar la clave registrada. Esta es la única transacción que una cuenta nueva puede firmar solo con la clave clásica. La explicación completa, incluido cómo hacer una copia de seguridad de la clave, está en [Firma post-cuántica](/developer-guide/post-quantum-signing#pqc-key-registration).

### Paso 4: Construye la prueba de clave {#step-proof}

La prueba es una firma Ed25519 de la clave de ventana sobre este texto exacto, codificado como UTF-8 sin espacios ni salto de línea final:

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>
```

Para una clave que ya ha abierto una o más ventanas, el nonce `N` sigue tras un `|` más:

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>|<N>
```

`N` es el número de ventanas ya abiertas con una prueba para esa clave, escrito en decimal sin signo ni ceros a la izquierda. Para una clave nueva `N` es 0 y no hay sufijo. La firma es Ed25519 simple (RFC 8032): sin prehash, sin contexto y sin la cabecera de mensaje fuera de cadena de Solana, así que una cartera debe firmar los bytes UTF-8 en bruto.

No construyas el texto a mano. Pídeselo a la cadena:

```bash
curl -s "https://api-testnet.qore.host/qorechain/pqc/v1/svm_window_key_proof/<WINDOW_PUBKEY>?sender=<your qor address>"
```

La respuesta trae el nonce y el texto exacto:

```json
{"svm_pubkey":"9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","nonce":"0","key_proof_required":true,"sign_bytes":"qorechain-svm-window-key-v1|qorechain-diana|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","chain_id":"qorechain-diana"}
```

Esta es la respuesta en vivo del 22 de noviembre de 2026 para una dirección de ejemplo. Firma `sign_bytes` con la clave de ventana. El script de abajo hace ambos pasos usando solo Node.js (guárdalo como `keyproof.mjs`):

```js
// node keyproof.mjs <solana-keypair.json> <your qor address>
import { readFileSync } from "node:fs";
import { createPrivateKey, sign } from "node:crypto";

const REST = "https://api-testnet.qore.host";
const [keypairPath, sender] = process.argv.slice(2);

// A solana-cli keypair file: JSON array of 64 bytes, the 32-byte seed first, then the public key.
const bytes = Uint8Array.from(JSON.parse(readFileSync(keypairPath, "utf8")));
const seed = bytes.slice(0, 32);

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58(buf) {
  let n = 0n;
  for (const b of buf) n = n * 256n + BigInt(b);
  let out = "";
  while (n > 0n) { out = ALPHABET[Number(n % 58n)] + out; n /= 58n; }
  for (const b of buf) { if (b === 0) out = "1" + out; else break; }
  return out;
}
const pubkey = base58(bytes.slice(32));

// The chain knows its id and the key's nonce, so it gives the exact text.
const url = `${REST}/qorechain/pqc/v1/svm_window_key_proof/${pubkey}?sender=${sender}`;
const info = await (await fetch(url)).json();
console.log("nonce:", info.nonce);
console.log("text to sign:", info.sign_bytes);

// Pure Ed25519 over the UTF-8 bytes of the text.
const pkcs8 = Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), Buffer.from(seed)]);
const key = createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" });
const proof = sign(null, Buffer.from(info.sign_bytes, "utf8"), key);
console.log("svm_key_proof (hex):", proof.toString("hex"));
```

```bash
node keyproof.mjs window.json <your qor address>
```

Deberías ver `nonce: 0`, el texto y una cadena hexadecimal de 128 caracteres. Guarda la cadena hexadecimal. Es válida para **una ventana** y solo para este remitente, clave y cadena.

**Comprueba tu código con un ejemplo publicado.** Id de cadena `qorechain-diana`, remitente `qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d` (20 bytes de `0x11`), nonce 0:

| Campo | Valor |
| ----- | ----- |
| Clave pública (base58) | `9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| Clave pública (hex) | `79b5562e8fe654f94078b112e8a98ba7901f853ae695bed7e0e3910bad049664` |
| Mensaje (131 bytes) | `qorechain-svm-window-key-v1\|qorechain-diana\|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d\|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| Firma (hex) | `786b449dcd4b85c2225819c9ac993fbe97a2cfdce7f9ffba07e6895fad0b9b8d3a0634aae5b21d28d366590b3858c7085c8c856a90770fd919ee1bff728b0801` |

Con nonce 1 el mensaje tiene 133 bytes y termina en `|1`. El script de arriba reprodujo esta firma el 22 de noviembre de 2026 con la clave correspondiente. Si tu código produce otros bytes con las mismas entradas, las causas habituales son un salto de línea final, un prehash, la cabecera fuera de cadena de Solana o un nonce de valor incorrecto.

No tienes que ejecutar el script: el comando del paso siguiente puede firmar por sí solo con el archivo de par de claves (`--svm-keypair`). Usa el script cuando la clave esté en otro lugar, por ejemplo en una cartera que pueda firmar un mensaje simple, y pasa su resultado con `--svm-key-proof`.

### Paso 5: Abre la ventana {#step-open}

Construye la transacción y después añade la firma post-cuántica. Este ejemplo abre una ventana de 3,600 bloques (unos 85 minutos), hasta 10 transacciones y 10 QOR en total (valor más comisiones), limitada al programa System (transferencias) y al cargador (despliegues):

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana
SYS=11111111111111111111111111111111
LOADER=BPFLoaderUpgradeab1e11111111111111111111111

qorechaind tx pqc open-svm-window <WINDOW_PUBKEY> 3600 10 10qor \
  --allowed-programs $SYS,$LOADER \
  --svm-keypair ~/qore-svm/window.json \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-open.json

qorechaind tx pqc cosign window-open.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

El primer comando construye `window-open.json`. Los argumentos posicionales son la clave pública de Solana, el número de bloques, el número de transacciones y el valor. Lee el nonce de la cadena y firma la prueba de clave con `window.json`. El segundo comando añade tu firma ML-DSA-87 y envía la transacción. Deberías ver un hash de transacción y el código 0.

Para usar la prueba del script en su lugar, sustituye `--svm-keypair ...` por `--svm-key-proof <hex from Step 4>`. Si no das ninguna de las dos banderas, el comando se niega e imprime el texto exacto que hay que firmar. Si la clave ya ha abierto ventanas, el comando lee el nonce por sí mismo; con `--svm-key-proof` puedes fijarlo con `--svm-key-nonce <N>`.

Lee la ventana de vuelta:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/svm_window/<your qor address>
qorechaind query pqc svm-window <your qor address> --node $QNODE
```

Deberías ver `"found":true` y `"live":true`, con `max_txs`, `used_txs`, `max_value`, `used_value`, `remaining_blocks`, `remaining_txs`, `remaining_value`, `allowed_programs` y `key_proven` en `true`. También puedes leerla por la clave de Solana: `GET /qorechain/pqc/v1/svm_window_by_key/<WINDOW_PUBKEY>`. Los campos `key_proof_required`, `key_usable` y `key_proof_nonce` (el siguiente valor que hay que firmar) también están ahí.

La lista de programas nombra el programa System y el cargador porque esa es la combinación probada. En esta guía la clave de ventana solo transfiere y la clave de despliegue despliega. Si alguna vez dejas que la clave de ventana pague un despliegue directamente, la lista debe nombrar ambos programas.

### Paso 6: Financia la clave de despliegue {#step-fund}

Mientras la ventana está abierta, la clave de ventana gasta tu QOR. Envía 5 QOR a la clave de despliegue:

```bash
qsol balance <WINDOW_PUBKEY>
qsol transfer <DEPLOYER_PUBKEY> 5 --keypair ~/qore-svm/window.json --allow-unfunded-recipient
qsol balance <DEPLOYER_PUBKEY>
```

La primera línea muestra tu saldo Native tal como lo ve la clave de ventana (en "SOL", lee QOR). La segunda envía 5 QOR; la bandera `--keypair` hace que la clave de ventana sea la firmante solo para este comando, y `--allow-unfunded-recipient` hace falta porque la clave de despliegue aún no tiene nada. La tercera debería mostrar `5 SOL`, es decir, 5 QOR. La transferencia le cuesta a tu cuenta 5.045 QOR en total: los 5 QOR más la comisión base de 0.045 QOR, y los contadores de la ventana (`used_txs` 1, `used_value` 5,045,000) lo reflejan.

Si se rechaza con `this node relays no Solana transactions`, consulta [Enviar sin la pasarela pública](#relay).

### Paso 7: Construye un programa pequeño {#step-build}

```bash
cargo init --lib hello
cd hello
```

Sustituye `Cargo.toml` por:

```toml
[package]
name = "hello"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
solana-program = "2.2"
```

Sustituye `src/lib.rs` por:

```rust
use solana_program::{account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg, pubkey::Pubkey};

entrypoint!(process_instruction);

fn process_instruction(_program_id: &Pubkey, _accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    msg!("hello from QoreChain, {} data bytes", data.len());
    Ok(())
}
```

```bash
cargo build-sbf
ls -l target/deploy
```

Esto compila el programa para SBF. Deberías ver `hello.so` (unos 19 KB) y `hello-keypair.json`, la clave cuya dirección se convierte en el id del programa. Las advertencias del compilador sobre `unexpected cfg` son inofensivas. El programa escribe una línea de registro y nada más.

### Paso 8: Despliega {#step-deploy}

```bash
qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc
```

Esto escribe el programa en unas 20 transacciones pequeñas y después lo despliega. `solana` primero estima el coste y comprueba tu saldo: para la compilación de 18,896 bytes imprimió un gasto de 0.133 QOR (renta) y una comisión de 1.035 QOR el 22 de noviembre de 2026, que son 23 transacciones a 0.045 QOR. Deberías terminar con `Program Id: <address>`. Compruébalo:

```bash
qsol program show <program id>
```

Deberías ver el id del programa, el cargador (`BPFLoaderUpgradeab1e11111111111111111111111`), una dirección ProgramData, la **autoridad** (tu clave de despliegue), el slot de despliegue y la longitud de los datos. Si empezaste el despliegue y se detiene a medias, `solana` imprime una frase de recuperación de 12 palabras para la clave temporal del búfer. Guárdala hasta que el despliegue haya terminado: con ella retomas el mismo búfer pasando el par de claves recuperado al siguiente `program deploy` o `write-buffer`, y puedes cerrar el búfer para recuperar su renta.

Para un programa construido con Anchor, añade `--skip-feature-verify` a `solana program deploy`, como hicieron las ejecuciones previas a la versión.

#### Con Anchor {#anchor}

```bash
anchor init counter
cd counter
anchor build
anchor deploy --provider.cluster https://svm-testnet.qore.host \
  --provider.wallet ~/qore-svm/deployer.json -- --use-rpc
```

`anchor build` compila el programa de la plantilla y `anchor deploy` lo despliega en el id de programa de `declare_id!`. Un programa de plantilla pesa unos 130 KB, que son unas 130 transacciones de escritura a 0.045 QOR, así que financia antes la clave de despliegue con al menos 10 QOR. En la ejecución previa a la versión un programa de 128 KB costó unos 6.8 QOR, la mayor parte en comisiones de escritura, y la renta se recupera al cerrar. Un segundo `anchor deploy` tras un cambio de código actualiza el programa. Anchor omite la subida del IDL para una dirección local; la subida del IDL a la testnet no se probó.

### Paso 9: Llama al programa {#step-call}

`solana` no puede llamar a un programa arbitrario, así que usa un script corto de web3.js. En una carpeta vacía:

```bash
npm init -y
npm install @solana/web3.js@1
```

Guárdalo como `call.cjs`:

```js
// node call.cjs <payer keypair.json> <program id> [data as text]
const fs = require("fs");
const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");

const RPC = "https://svm-testnet.qore.host";
const [payerPath, programId, text = "hi"] = process.argv.slice(2);
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(payerPath, "utf8"))));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const conn = new Connection(RPC, "confirmed");
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash }).add(
    new TransactionInstruction({ programId: new PublicKey(programId), keys: [], data: Buffer.from(text) }),
  );
  tx.sign(payer);

  const signature = await conn.sendRawTransaction(tx.serialize()); // preflight runs on the gateway
  console.log("signature:", signature);

  // The public endpoint serves no websocket, so poll instead of confirmTransaction.
  for (;;) {
    const { value } = await conn.getSignatureStatuses([signature]);
    if (value[0]) { console.log("status:", value[0].confirmationStatus, "err:", JSON.stringify(value[0].err)); break; }
    if ((await conn.getBlockHeight()) > lastValidBlockHeight) throw new Error("blockhash expired, build and send again");
    await sleep(1500);
  }
  const t = await conn.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
  console.log("fee (lamports):", t.meta.fee);
  console.log((t.meta.logMessages || []).join("\n"));
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
```

```bash
node call.cjs ~/qore-svm/deployer.json <program id> "hello"
```

El script construye una instrucción para tu programa, la firma con la clave de despliegue, la envía, consulta hasta que la firma tiene un estado e imprime el registro del programa. El pagador de la comisión es la clave de despliegue, así que no hace falta ventana. Deberías ver una firma, `status: finalized err: null`, `fee (lamports): 45000000` y registros como estos (la forma viene de la ejecución previa a la versión; el mensaje es el de tu propio programa):

```text
Program <program id> invoke [1]
Program log: hello from QoreChain, 5 data bytes
Program <program id> consumed ... compute units
Program <program id> success
```

### Paso 10: Lee el resultado {#step-read}

| Qué quieres | Comando o llamada |
| -------- | --------------- |
| El estado de una transacción | `qsol confirm -v <signature>`, o `getSignatureStatuses` |
| Sus registros, comisión y cambios de saldo | `getTransaction` con `maxSupportedTransactionVersion: 0` (el script de arriba) |
| El programa y su autoridad | `qsol program show <program id>` |
| Todos los programas de la clave de despliegue | `qsol program show --programs` |
| Una cuenta de datos | `qsol account <address>`, o `getAccountInfo` |
| Tu ventana, por cuenta o por clave | `GET /qorechain/pqc/v1/svm_window/<address>` y `.../svm_window_by_key/<pubkey>` |

Una transacción que falla dentro de un bloque (por ejemplo porque omitiste la comprobación previa de la pasarela con `--skip-preflight`) conserva igualmente su firma y paga su comisión, y sus efectos se revierten. En la ejecución previa a la versión una transferencia por encima del límite de valor de la ventana, enviada con `--skip-preflight`, entró y falló con `Error processing Instruction 0: generic instruction error`, y la transferencia se revirtió. Sin `--skip-preflight` se rechaza antes, en la pasarela, con `-32002 ... SVM authorisation window exhausted`.

### Paso 11: Actualiza, entrega, extiende y cierra {#step-admin}

Todo esto usa la clave de despliegue como firmante y no necesita ventana.

| Tarea | Comando |
| ---- | ------- |
| Actualizar tras un cambio de código | `qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc` |
| Agrandar el área de datos en N bytes | `qsol program extend <program id> N` |
| Entregar las actualizaciones a otra clave | `qsol program set-upgrade-authority <program id> --new-upgrade-authority <new.json>` |
| Hacer permanente el programa | `qsol program set-upgrade-authority <program id> --final` |
| Escribir un búfer sin desplegar, listar búferes | `qsol program write-buffer x.so --use-rpc`, y después `qsol program show --buffers` |
| Cerrar un búfer, o cerrar el programa y recuperar la renta | `qsol program close <buffer or program id>` (un programa necesita además `--bypass-warning`) |

Una actualización hecha por cualquier clave que no sea la autoridad se rechaza. Tras `set-upgrade-authority`, la autoridad anterior se rechaza y la nueva puede actualizar. Tras `--final`, una actualización se rechaza con un mensaje de que el programa ya no es actualizable. Un programa cerrado no puede volver a llamarse y `program show` dice que se ha cerrado.

### Paso 12: Cierra la ventana {#step-close}

Puedes cerrar una ventana cuando termines, y debes cerrarla de inmediato si crees que la clave de Solana quedó expuesta. Lo que la ventana aún admitía se rechaza desde el siguiente bloque:

```bash
qorechaind tx pqc close-svm-window --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-close.json
qorechaind tx pqc cosign window-close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Lee la ventana otra vez: ya no debería estar activa, y `qsol balance <WINDOW_PUBKEY>` debería volver a mostrar 0. La clave de ventana ya no puede mover tu QOR. La clave de despliegue, el programa y los fondos que creaste mediante la ventana siguen siendo tuyos.

Para abrir una ventana nueva para la misma clave, ejecuta de nuevo el Paso 4: el nonce es ahora más alto, y una prueba hecha para la ventana anterior se rechaza con `expected_nonce`.

## Enviar sin la pasarela pública {#relay}

La pasarela pública de `svm-testnet.qore.host` se negó a retransmitir el 22 de noviembre de 2026 (consulta el recuadro al principio). Hay dos formas de enviar hasta que retransmita.

**Una sola transacción por la línea de comandos.** Cualquier cuenta nativa que tenga QOR y una clave post-cuántica registrada puede llevar una transacción de Solana que hayas firmado. Construye y firma primero la transacción de Solana, por ejemplo con web3.js, e imprímela en base64 (`tx.serialize().toString("base64")`). Una transacción es válida durante unos 3.5 minutos tras el blockhash que usa. Después:

```bash
qorechaind tx svm solana-tx <base64 transaction> --from mykey \
  --chain-id $QCHAIN --node $QNODE --gas <GAS> --fees <FEES>uqor --generate-only > relay.json
qorechaind tx pqc cosign relay.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Fija `--gas` y `--fees` con una prueba en seco: ejecuta primero `tx pqc cosign` con `--dry-run` (imprime una estimación de gas y no envía nada), luego usa la estimación más un 30 % como `<GAS>` y una comisión de al menos `<GAS>` por 0,1 uqor como `<FEES>`. Una transferencia simple necesita unos 300.000 a 400.000 de gas; un despliegue o una propuesta que lleva código necesita mucho más.

Medido en el testnet: una transferencia simple retransmitida así usó 327.570 de gas, así que usa `--gas 400000 --fees 40000uqor`; con 300.000 se queda sin gas. Al pagador también se le cobra la comisión de Solana que firmó (45.000.000 lamports, 0,045 QOR).

La cuenta de `--from` es el retransmisor. Firma la portadora y paga su gas, y el pagador de la comisión de Solana lo reembolsa. El retransmisor no gana ninguna autoridad sobre la transacción de Solana. La comisión de la portadora debe quedar cubierta por lo que paga la transacción de Solana: 45,000 uqor por una firma. Esto es práctico para una transferencia o una llamada, no para un despliegue de muchas transacciones de escritura. Esta ruta no se ejecutó en la testnet en vivo para esta página.

**Tu propia pasarela.** Un nodo que sigue la testnet y ejecuta el binario v3.2.9 sirve el JSON-RPC de Solana en el puerto 8899 y retransmite cuando la sección `[svm-rpc]` de su `app.toml` nombra un retransmisor: `relayer-key` (una cuenta financiada en el keyring del nodo, o varias separadas por comas), `relayer-pqc-key` (sus claves ML-DSA-87 bajo la carpeta `pqc` del nodo) y `relayer-keyring-backend`. Con `relayer-key` vacío, `sendTransaction` se rechaza, como en el endpoint público hoy. Deja `relayer-fee` vacío: el retransmisor entonces fija el precio de cada portadora según lo que paga la transacción de Solana, así que nunca pierde dinero. Copia la carpeta `lib/` entera del paquete de la versión. Esta configuración no se ejecutó para esta página; consulta [Ejecutar un nodo](/developer-guide/running-a-node) para el nodo en sí.

## Límites que conviene prever {#limits}

* **Cuota de retransmisión.** Una transacción de Solana enviada mediante una pasarela cuenta contra su pagador de comisión: 600 por 30 bloques por defecto, que es bastante menos de un minuto. Un despliegue grande desde una sola clave puede superarla (un programa de 1 MB son unas 1,100 escrituras). Las escrituras rechazadas no cuestan nada. Escribe primero el búfer con `qsol program write-buffer`, espera un minuto y ejecútalo de nuevo con el mismo búfer si se detiene, y después despliega desde el búfer con `--buffer`, o paga las escrituras del búfer y el despliegue desde pagadores de comisión distintos.
* **Reparto equitativo de la pasarela.** Una pasarela reserva parte de su capacidad para clientes que han enviado pocas transacciones y reparte el resto a partes iguales entre las redes de clientes activas. Si te rechaza con un mensaje de reparto equitativo (código `-32005`), espera un minuto o usa otra pasarela.
* **La transacción debe entrar antes de que expire su blockhash** (150 slots). `solana` reenvía por ti; un script debería hacer lo mismo.
* **Una transacción pesa como máximo 1,232 bytes, con un máximo de 64 cuentas,** como en Solana. Se aceptan mensajes legacy y de versión 0.
* **Programas y cuentas:** 10 MiB cada uno; pila de 32 KiB y heap de 256 KiB por frame.
* **Los límites de custodia** de [Carril SVM (v3.2.8)](/developer-guide/svm-lane-v328#custody) siguen aplicándose: un depósito puede rechazarse con `svm custody cap exceeded` (código 23) cuando el fondo SVM está en su tope.
* **Nombres en la lista de la ventana.** `--allowed-programs` toma ids de programa en base58, como máximo 16, cada uno una sola vez. Un alcance se aplica a las instrucciones de nivel superior de la transacción: un programa listado que llama a otros programas lleva tu firma consigo, así que lista solo programas en los que confíes por completo.
* **Direcciones.** Un mensaje nuevo de v3.2.9 rechaza una dirección bech32 que no esté en su forma canónica en minúsculas. Envía la forma que produce `toBech32`.

## Solución de problemas {#troubleshooting}

Los textos marcados "live" se vieron en la testnet en vivo el 22 de noviembre de 2026. Los demás son mensajes propios de la cadena y de la pasarela tal como se vieron en las ejecuciones previas a la versión.

| Lo que ves | Qué significa | Qué hacer |
| ------------ | ------------- | ---------- |
| `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)` (código JSON-RPC `-32603`, live) | La pasarela no tiene cuenta retransmisora | Usa [tu propia pasarela o la retransmisión por línea de comandos](#relay), o espera a los operadores |
| `Error: Account <key> has insufficient funds for spend (X SOL) + fee (Y SOL)` (live, de `solana`) | La clave no tiene nada. Lee SOL como QOR | Abre la ventana y financia la clave, o abre la ventana y usa la clave de ventana como firmante |
| Simulación `InsufficientFundsForFee`, registro `fee payer ... has no account: insufficient fee` (live) | La misma causa, vista desde una simulación | La misma solución |
| `invalid solana transaction: no signatures`, `truncated: need 2 bytes at 1` (código `-32602`, live) | Los bytes no son una transacción de Solana firmada | Envía la transacción completa firmada, en base64 o base58 |
| HTTP 405 en una actualización a websocket (live) | El endpoint público no sirve websocket | Añade `--use-rpc` a `solana program deploy` y `write-buffer`; consulta con `getSignatureStatuses` en los scripts |
| `-32002 ... insufficient priority fee ...` | La transacción paga menos de lo que cuesta su portadora | Fija el precio de ComputeBudget y el límite de unidades a partir del `data` del error; consulta [Comisiones](#fees) |
| `-32002 ... SVM authorisation window exhausted` | La ventana se quedó sin bloques, transacciones o valor, o la transacción superaría el valor | Lee la ventana, abre una nueva con más valor o más transacciones |
| `no open SVM authorisation window` (codespace `pqc`, código 341) | La clave no tiene ventana activa | Abre una (Paso 5) |
| Apertura rechazada con el código 343 y `expected_nonce=<N>` | La prueba se firmó sobre otro nonce, por ejemplo una prueba antigua | Lee de nuevo la ruta del nonce (Paso 4), firma otra vez |
| `the key proof does not verify for <key>, sender <qor address>, chain <id>` (CLI) | La firma no coincide con el texto | Firma exactamente `sign_bytes` de la ruta del nonce, con la clave y el remitente correctos |
| `--svm-keypair holds the key X, not Y` (CLI) | El archivo de par de claves no es la clave que nombraste | Usa el par de claves que coincide con la clave en base58 |
| `the window needs the proof that you hold the Solana key` (CLI) | No diste ni `--svm-keypair` ni `--svm-key-proof` | Da una de las dos; el mensaje imprime el texto que hay que firmar |
| `blocks must be between 1 and 17280`, `max_txs must be between 1 and 1000`, `max_value must be positive`, `allowed_programs lists N programs, the maximum is 16` | Un límite de la ventana está fuera de rango | Usa valores dentro de la tabla de [La ventana](#window) |
| `svm_pubkey ... is not a valid ed25519 public key`, o `... is a native account address, not an ed25519 key` | La clave es una dirección de programa o una de tus direcciones de QoreChain | Usa un par de claves hecho con `solana-keygen` |
| `sender sol:<payer> has sent 600 transactions in the last 30 blocks` | La cuota de retransmisión de un pagador de comisión | Espera un minuto, retoma con el mismo búfer; consulta [Límites](#limits) |
| `-32005` con `fair share of the relayer quota` | La pasarela reparte su capacidad | Reintenta tras un minuto |
| `-32020 node is starting, no committed state` | El nodo aún no tiene estado | Reintenta en unos segundos |
| `node busy: the carrier could not be measured now, retry` | La pasarela no pudo fijar el precio de la portadora en este momento | Reintenta |
| `Transaction simulation failed: Blockhash not found` | El blockhash tiene más de 150 slots o es desconocido | Obtén un blockhash nuevo, firma y envía otra vez |
| `Transaction simulation failed: This transaction has already been processed` | La misma transacción firmada ya se vio antes | Comprueba `getSignatureStatuses`; no la envíes de nuevo |
| Una transacción de Solana se rechaza con `cannot approve a delegate`, `cannot hand over the ownership`, `cannot hand over the close authority` o `cannot change the mint or freeze authority`, con `the grant would outlive the window` | Una ventana de alcance por defecto rechaza las concesiones duraderas de tokens | Firma esta acción con tu propia clave post-cuántica en el carril Native, o abre una ventana cuya lista de programas nombre el programa de tokens (consulta [Límites conocidos](#window-limits)) |
| `SVM module is disabled` (código 11) | El carril está cerrado. Este es el estado de la mainnet | Usa la testnet |
| `svm custody cap exceeded` (código 23) | El fondo SVM está en su tope | Reintenta más tarde o con una cantidad menor |
| `solana program deploy` de un programa construido con Anchor se rechaza en el cliente por las características del programa | La herramienta comprueba las características del ELF | Añade `--skip-feature-verify` |
| Una actualización hecha por la clave de ventana la rechaza `solana` | La autoridad registrada es tu cuenta Native, no la clave | Despliega con una clave de despliegue aparte como en esta guía |
| Apertura o cierre de ventana rechazados bajo authz, group o un contrato | Las ventanas las abren y cierran solo tu propia firma | Envía el mensaje como mensaje de nivel superior desde tu cuenta |

## Qué se comprobó {#tested}

| Comprobación | Dónde y cuándo | Resultado |
| ----- | -------------- | ------ |
| `GET /qorechain/svm/v1/params` y `/cluster_info` | testnet en vivo, 22 de noviembre de 2026 | `enabled` y `execution_enabled` ambos `true` |
| `getHealth`, `getVersion`, `getGenesisHash`, `getLatestBlockhash` (base58), `getMinimumBalanceForRentExemption(1024)` | testnet en vivo, 22 de noviembre de 2026 | `ok`; `1.18.0-qorechain`; hash de génesis como arriba; blockhash base58 de 44 caracteres; 8,017,920 lamports |
| `getFeeForMessage` y `simulateTransaction` para una transferencia de una firma | testnet en vivo, 22 de noviembre de 2026 | comisión de 45,000,000 lamports (0.045 QOR); un pagador sin fondos da `InsufficientFundsForFee` |
| Ruta del nonce de la prueba de clave y rutas de la ventana | testnet en vivo, 22 de noviembre de 2026 | nonce 0, `sign_bytes` como en el Paso 4; `found` `false` para una dirección sin ventana |
| Script de prueba de clave del Paso 4 contra el ejemplo publicado | ruta de la testnet en vivo, 22 de noviembre de 2026 | firma idéntica a la de la tabla |
| Construcción del programa con `cargo build-sbf` (4.0.0, platform tools v1.53) | máquina local, 22 de noviembre de 2026 | `hello.so` de 18,896 bytes |
| Estimación de coste de `solana program deploy` desde una clave sin fondos | testnet en vivo, 22 de noviembre de 2026 | rechazado en el cliente con gasto de 0.133 QOR y comisión de 1.035 QOR |
| `sendTransaction` de una transferencia bien formada | testnet en vivo, 22 de noviembre de 2026 | rechazado: `this node relays no Solana transactions` |
| Actualización a websocket en el endpoint público | testnet en vivo, 22 de noviembre de 2026 | HTTP 405 |
| Abrir ventana, `solana transfer` desde la clave de ventana, despliegue, llamada, actualización, cambio de autoridad, extensión, cierre, `anchor deploy` y actualización | red de pruebas local antes de la versión, `solana-cli` 4.0.2, `anchor-cli` 1.2.2, `@solana/web3.js` 1.99 | superado |
| Los mismos pasos en la testnet en vivo | no se ejecutaron: la pasarela pública no retransmitió nada el 22 de noviembre de 2026 y no se gastó QOR de prueba en esta página | no se ejecutó |

## Mainnet {#mainnet}

La mainnet ejecuta una versión sin nada de esto: el carril SVM está desactivado allí, sus endpoints SVM públicos son de solo lectura, las llamadas entre VM siguen en pausa y la subida de contratos sigue siendo solo por gobernanza. No abras ventanas, no despliegues ni envíes transacciones de Solana contra la mainnet; planifica solo contra la testnet.

## Véase también {#see-also}

* [Carril SVM (v3.2.8)](/developer-guide/svm-lane-v328): el estado del carril, la renta, los límites de custodia y la clave post-cuántica de una cartera SVM.
* [Desarrollo SVM](/developer-guide/svm-development): la visión general del carril y el servidor JSON-RPC.
* [JSON-RPC compatible con Solana](/api-reference/json-rpc-solana-compatible): la lista de métodos.
* [Firma post-cuántica](/developer-guide/post-quantum-signing): registrar y usar tu clave ML-DSA-87.
* [Referencia de la ventana de autorización EVM](/developer-guide/evm-window-reference): la misma idea para claves de estilo Ethereum.
* [Interoperabilidad entre VM](/developer-guide/cross-vm-interoperability): llamadas entre SVM, EVM y QoreChain Native.
* [Historial de versiones](/appendix/version-history#v329): qué cambió v3.2.9.
