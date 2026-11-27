---
slug: /build-before-qday/workshop-4
title: "Taller 4: Rollups, IBC y QoreX para desarrolladores"
sidebar_label: "Taller 4"
sidebar_position: 5
date: 2026-11-27
---

# Taller 4: Rollups, IBC y QoreX para desarrolladores

El Taller 4 baja por debajo de la aplicación. Primero, ejecutas un **rollup** que liquida en QoreChain: lo creas, retiras fondos de él, demuestras lo que hizo, después haces trampa a propósito y ves cómo se descubre. Segundo, envías **QOR a la testnet del Cosmos Hub y de vuelta** por IBC. Tercero, ves lo que te ofrece la **wallet QoreX** mientras construyes una dApp.

Cada comando de abajo dice qué hace y qué deberías ver. El código es público: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), carpeta `workshop-4`. Aquí todo funciona solo en testnets. Los tokens de prueba no tienen valor.

**Cuánto tarda:** unos 45 minutos de pasos. El rollup tiene además una ventana de impugnación de una hora, durante la cual esperas. Las tres partes son independientes: mientras esperas en la Parte 1, puedes hacer la Parte 2 o la Parte 3.

## Qué construimos {#what-we-built}

| Parte | Aplicación | Qué demuestra |
| --- | --- | --- |
| 1 | **Un rollup** (Node.js, `@qorechain/rdk`) | Lotes cuya ancla está firmada con ML-DSA-87, un retiro pagado con una prueba de Merkle, un recibo de liquidación que cualquiera puede comprobar, un fraude demostrado por un watchtower y un bono recortado. |
| 2 | **IBC de ida y vuelta** (Node.js, `@qorechain/qoresign`, cosmjs) | QOR va a la testnet del Cosmos Hub y regresa, transportado por QORel, el relayer de QoreChain. |
| 3 | **QoreX para desarrolladores** (una guía, sin código nuevo) | Los proveedores con los que habla una dApp, los paquetes de integración, el modo desarrollador, el registro de solicitudes y el inspector de transacciones. |

Las innovaciones que hay detrás:

- **Un rollup cuya liquidación está firmada de forma poscuántica.** El creador firma la raíz de estado de cada lote honesto con ML-DSA-87 (NIST FIPS 204), y la cadena la guarda.
- **Pruebas de fraude que la propia cadena comprueba.** Con el libro contable `qledger-v1`, QoreChain vuelve a ejecutar un lote en disputa. No hay que confiar en nadie para saber quién tenía razón.
- **Orden tomado de QoreChain.** Con la secuenciación basada, las transacciones del rollup se publican en una bandeja de entrada en QoreChain, así que el operador no puede reordenarlas ni omitir lo que se publicó.
- **IBC con una firma híbrida en el lado de QoreChain.** La transferencia que sale de QoreChain se firma con secp256k1 y ML-DSA-87.
- **Una wallet que muestra su trabajo.** QoreX registra lo que pidió cada sitio y te deja inspeccionar lo que guardó la cadena.

## Palabras usadas en esta guía {#words}

| Palabra | Significado sencillo |
| --- | --- |
| Rollup | Un sistema que ejecuta sus propias transacciones fuera de la cadena principal y le envía a esta un resumen breve de vez en cuando |
| Lote | Uno de esos resúmenes: el nuevo estado del rollup y los retiros que pide |
| Raíz de estado | Una huella corta de todos los saldos del rollup |
| Rollup optimista | Los lotes se aceptan de inmediato y solo pasan a ser definitivos si nadie demuestra que son erróneos durante la ventana de impugnación |
| Ventana de impugnación | El tiempo que cualquiera tiene para demostrar que un lote es erróneo. En la testnet es de una hora |
| Bono | Dinero que el operador bloquea y pierde si miente |
| Watchtower | Una cuenta que vuelve a ejecutar las transacciones del rollup y denuncia un lote erróneo |
| `qledger-v1` | Un libro contable sencillo que la propia cadena sabe volver a ejecutar. Las cuentas que contiene firman con ML-DSA-44 |
| Secuenciación basada | El orden de las transacciones del rollup viene de la bandeja de entrada en QoreChain, no del operador |
| Ancla | La raíz de estado del lote, firmada por el creador del rollup con ML-DSA-87 y guardada en la cadena |
| Prueba de Merkle | Unos pocos hashes que demuestran que un elemento está dentro de un conjunto mayor, sin enviar el conjunto entero |
| IBC | La forma en que las cadenas Cosmos mueven tokens entre sí sin un custodio: cada cadena ejecuta un cliente ligero de la otra y comprueba pruebas |
| Canal | Una vía entre dos cadenas |
| Voucher | El token que crea la otra cadena mientras tus QOR permanecen bloqueados en QoreChain |
| Escrow | La cuenta de QoreChain donde los QOR enviados esperan hasta que regresa el voucher |
| Relayer | Un programa que transporta paquetes y pruebas entre dos cadenas |

:::caution Solo cuentas de testnet desechables
Los scripts crean cuentas nuevas para ti. Mantenlo así. Nunca pongas las palabras secretas ni la clave de una cuenta que tenga dinero real en un archivo ni en un comando.
:::

## Antes de empezar {#prerequisites}

Necesitas una terminal, **Node.js 20 o posterior** y **Git**: consulta [Antes de empezar](/build-before-qday/prerequisites). La parte 3 necesita además **pnpm** y la wallet QoreX. Comprueba Node.js:

```bash
node -v
```

Debe mostrar `v20` o superior. Consigue el código de ejemplo:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-4
```

La primera línea descarga los ejemplos en una carpeta llamada `build-before-qday`. La segunda entra en la carpeta `workshop-4`.

Cada parte necesita una cantidad distinta de QOR de prueba:

| Parte | Qué necesitas | De dónde sale |
| --- | --- | --- |
| 1, cuenta del operador | Unos 12.010 QOR de prueba: 10.000 de stake del rollup, 1.000 para el espacio de sidechain, 1.000 de bono del remitente de lotes y unos pocos para depósitos y comisiones | El faucet da 100 QOR al día, que no es suficiente. Pide una asignación mayor de testnet al equipo del festival en los canales de [build.qorechain.io](https://build.qorechain.io) |
| 1, cuenta del watchtower | Unos pocos QOR de prueba para comisiones | El [faucet](/dashboard/faucet) |
| 2 | Unos 2 QOR de prueba, más un poco de ATOM de prueba | El [faucet](/dashboard/faucet). El script pide ATOM al faucet de la testnet del Cosmos Hub |
| 3 | Un poco de QOR de prueba en tu cuenta de testnet de QoreX | El [faucet](/dashboard/faucet) |

:::tip ¿Sin una asignación grande? Aun así puedes seguir la Parte 1
`node rollup.mjs rollups` no necesita cuenta, y los pasos de abajo muestran lo que hace cada comando.
:::

## Parte 1: un rollup que liquida en QoreChain {#part-1}

Código: [workshop-4/01-rollup](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/01-rollup). Paquete: `@qorechain/rdk`, el Rollup Development Kit.

Recorrerás la vida completa de un pequeño rollup optimista: crearlo, bloquear un stake, depositar el bono del operador, hacer depósitos, enviar un lote, esperar, retirar, construir un recibo, hacer trampa y descubrir la trampa. Consulta [Rollups](/rollups/overview) para saber cómo funcionan.

### Paso 1: instala {#r1}

```bash
cd 01-rollup
npm install
node rollup.mjs help
```

| Parte | Qué hace |
| --- | --- |
| `cd 01-rollup` | Entra en la carpeta de la aplicación del rollup. |
| `npm install` | Descarga los paquetes que usa la aplicación. Las versiones están fijadas por `package.json` y `package-lock.json`. |
| `node rollup.mjs help` | Ejecuta el script y lista todos los comandos. |

**Lo que deberías ver:** la lista de comandos: `init`, `rollups`, `prepare`, `status`, `withdraw`, `bond`, `receipt`, `cheat`, `watchtower`.

### Paso 2: mira los rollups de la testnet {#r2}

```bash
node rollup.mjs rollups
```

Lee la cadena. No hace falta cuenta.

**Lo que deberías ver:** una primera línea con el número de rollups y el stake y el bono que la cadena pide hoy (10.000 QOR y 1.000 QOR cuando se escribió esta guía), y después una línea por rollup: su id, si está activo, cómo liquida (`optimistic` o `zk`), su tipo de VM y el bloque en que se creó.

**Por qué:** muestra que las cifras que vas a pagar vienen de la cadena, no del script.

### Paso 3: crea dos cuentas {#r3}

```bash
node rollup.mjs init
```

Crea dos cuentas, el **operador** y el **watchtower**. Sus palabras secretas se guardan en `~/.config/qday-w4/operator.json` y `watcher.json`, legibles solo por ti, y nunca se muestran. El archivo del operador contiene además dos semillas aleatorias para las claves del rollup de dos usuarios, Ana y Ben. Para guardar los archivos en otro sitio, define la variable de entorno `QDAY_DIR`.

**Lo que deberías ver:** dos direcciones `qor1...`. Financia las dos, como se explica en [Antes de empezar](#prerequisites).

**Por qué dos cuentas:** quien denuncia un lote erróneo no debería ser quien lo publicó.

### Paso 4: crea el rollup y envía el lote 0 {#r4}

```bash
node rollup.mjs prepare
```

Este único comando ejecuta toda la preparación. Recuerda lo que ya hizo en `~/.config/qday-w4/rollup-state.json`, así que puedes ejecutarlo de nuevo si algo se detiene a medias.

| Qué envía | Qué hace |
| --- | --- |
| `createRollup` | Crea tu rollup con ejecución `qledger-v1` y secuenciación basada, y bloquea el stake. |
| `bondRollupSubmitter` | Bloquea el bono de 1.000 QOR. |
| Dos depósitos | 3 QOR para Ana y 1 QOR para Ben pasan al rollup. |
| Tres transacciones del rollup | Ana paga 0,5 QOR a Ben, Ana retira 0,3 QOR, Ben retira 0,2 QOR. Cada una se firma con la clave ML-DSA-44 del remitente y se publica en la bandeja de entrada en QoreChain. |
| `submitBatch` | El script vuelve a leer la bandeja de entrada, la ejecuta de nuevo para obtener la nueva raíz de estado y la raíz de retiros, y envía el lote 0. El RDK firma su ancla con ML-DSA-87. |

**Lo que deberías ver:** una línea `ok` por transacción, con el bloque y un enlace al explorador. Después, el estado de tu rollup, con el lote 0 en estado `submitted`.

### Paso 5: espera una hora y comprueba {#r5}

```bash
node rollup.mjs status
```

**Lo que deberías ver:** el rollup, el stake del operador, el fondo de retiros, el bono y cada lote. Pasada la ventana de impugnación de una hora, el lote 0 aparece como `finalized`.

**Por qué la espera:** un rollup optimista es seguro porque hay tiempo para demostrar que un lote es erróneo antes de que salga el dinero.

### Paso 6: retira a QoreChain {#r6}

```bash
node rollup.mjs withdraw 0
node rollup.mjs withdraw 1
```

El retiro `0` son los 0,3 QOR de Ana y el retiro `1` son los 0,2 QOR de Ben. En esta demo ambos se pagan a la cuenta del operador. El script construye una prueba de Merkle de que el retiro está en la raíz de retiros del lote 0, y la cadena la comprueba contra la raíz que guardó antes de pagar. Después el script envía el mismo retiro por segunda vez.

**Lo que deberías ver:** el número de hashes de la prueba, una línea `ok`, el saldo del destinatario antes y después (la misma cuenta pagó la comisión) y después el segundo intento marcado como `REFUSED`. Un retiro se paga una sola vez.

Si el lote 0 todavía no es definitivo, el comando se detiene y dice que los retiros solo se pagan después de la ventana de impugnación.

### Paso 7: un recibo de liquidación {#r7}

```bash
node rollup.mjs receipt 0
```

Construye un pequeño archivo JSON que describe el lote 0 y lo guarda junto a tus claves. Cualquiera puede comprobarlo: la comprobación lo vuelve a leer todo de QoreChain y no confía en el archivo.

| Comprobación | Qué demuestra |
| --- | --- |
| `rollupLayerBinding` | El rollup pertenece a la capa que nombra el recibo |
| `batchStateRoot` | El lote de la cadena lleva exactamente esta raíz de estado |
| `anchorOnChain` | En la cadena existe un ancla con todos los campos del recibo |
| `creatorAuthority` | La clave de firma se leyó de la cadena, no del recibo |
| `pqcSignature` | La firma ML-DSA-87 sobre el ancla es válida |
| `chainBinding` | El recibo pertenece a esta cadena y no es una copia traída de otro sitio |

**Lo que deberías ver:** `VALID` con una marca junto a cada una de las seis comprobaciones. Después el script cambia un dígito hexadecimal de la raíz de estado y vuelve a comprobar: `NOT VALID`.

**Por qué es útil:** un exchange, un auditor u otro sistema puede verificar el estado de un rollup sin confiar en quien envió el archivo.

### Paso 8: un operador deshonesto {#r8}

```bash
node rollup.mjs cheat
```

Ben paga 0,1 QOR a Ana dentro del rollup, y después el operador envía el lote 1 con un bit de la raíz de estado cambiado, a propósito.

**Lo que deberías ver:** dos líneas `ok`. La segunda dice que el lote se publicó con una **raíz de estado errónea**. La cadena lo acepta por ahora: hay una hora para demostrar que es erróneo, y el bono del operador está en juego.

### Paso 9: el watchtower lo descubre {#r9}

```bash
node rollup.mjs watchtower
```

Este comando usa la cuenta del watchtower, no la del operador.

| Paso | Qué ocurre |
| --- | --- |
| 1 | Lee el lote 1 de la cadena. |
| 2 | Lee exactamente la parte de la bandeja de entrada que usó el lote 1 y la vuelve a ejecutar a partir del estado posterior al lote 0. Esto da la raíz honesta. |
| 3 | Construye la prueba de fraude y la comprueba en tu ordenador. |
| 4 | Envía `challengeBatch`. La cadena vuelve a ejecutar el lote por sí misma, lo rechaza y recorta el bono: la mitad se quema y la otra mitad va al watchtower. |

**Lo que deberías ver:** la raíz errónea y la raíz honesta, el resultado de la comprobación local, una línea `ok` para la impugnación, el lote marcado como rechazado y el saldo del watchtower antes y después.

:::note Puede que alguien sea más rápido que tú
La testnet ya tiene watchtowers independientes. Si uno de ellos demuestra el fraude primero, lo que puede llevar un solo bloque, tu script dice que el lote ya está rechazado y solo ejecuta la comprobación local. En cualquier caso, el operador pierde el bono.
:::

Para volver a hacer trampa, primero repón el bono:

```bash
node rollup.mjs bond
```

### Cómo está organizado el código {#r-code}

Todo está en un solo archivo, `rollup.mjs`. Cada comando es una función del objeto `cmds`, en el orden de los pasos de arriba. La función `connect()` convierte un archivo de cuenta en un cliente de transacciones del RDK que firma cada transacción de QoreChain con las dos claves, secp256k1 y ML-DSA-87.

## Parte 2: QOR al Cosmos Hub y de vuelta {#part-2}

Código: [workshop-4/02-ibc](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/02-ibc). Paquetes: `@qorechain/qoresign` y cosmjs. Redes: la testnet de QoreChain `qorechain-diana` y la testnet del Cosmos Hub `provider`.

Esta aplicación envía 0,5 QOR de la testnet de QoreChain a la testnet del Cosmos Hub y los trae de vuelta. [QORel](https://github.com/qorechain/QORel), el relayer de QoreChain, transporta los paquetes entre las dos cadenas. Cuando se escribió esta guía, la testnet de QoreChain tenía diez canales IBC: Cosmos Hub, Osmosis, Injective, Akash, Celestia, Coreum, dYdX, Fetch, Allora e ixo. IBC funciona solo en la testnet: no está activo en mainnet.

Cómo funciona:

1. Una sola clave te da dos direcciones: `qor1...` en QoreChain y `cosmos1...` en el Hub.
2. **Ida:** la transferencia se firma en QoreChain con las dos claves, y la cadena comprueba ambas. QORel lleva el paquete y una prueba al Hub. El cliente ligero de QoreChain que tiene el Hub comprueba la prueba y crea un voucher por los QOR.
3. **Vuelta:** en el Hub, la transferencia se firma de la forma habitual del Hub. El cliente ligero del Hub que tiene QoreChain comprueba la prueba. El voucher se quema y se liberan los QOR originales.

:::info Dos límites que conviene conocer
El `channel-0` de QoreChain es el `channel-600` del Hub. El nombre del voucher en el Hub es `ibc/` seguido del SHA-256 de `transfer/channel-600/uqor`. En cada canal de QOR de la testnet, como máximo el 1 % del suministro de QOR puede cruzar en 24 horas, como freno de seguridad.
:::

### Paso 1: instala {#i1}

```bash
cd ../02-ibc
npm install
node ibc.mjs help
```

La primera línea pasa de `01-rollup` a `02-ibc`. Si estás en la carpeta `workshop-4`, usa `cd 02-ibc`.

**Lo que deberías ver:** la lista de comandos: `init`, `channels`, `status`, `register`, `hub-faucet`, `send`, `back`.

### Paso 2: una clave, dos cadenas {#i2}

```bash
node ibc.mjs init
```

Crea una cuenta y guarda sus palabras secretas en `~/.config/qday-w4/traveler.json`, legible solo por ti. Nunca se muestran. `QDAY_DIR` cambia la carpeta.

**Lo que deberías ver:** la dirección de la cuenta en QoreChain y su dirección en el Cosmos Hub. Pega la dirección `qor1...` en el [faucet](/dashboard/faucet).

### Paso 3: lista los canales {#i3}

```bash
node ibc.mjs channels
```

Lee todos los canales IBC de la testnet de QoreChain y la cadena que hay en el otro extremo. No hace falta cuenta.

**Lo que deberías ver:** una línea por canal con su estado (`OPEN`), el id de la otra cadena y el nombre del canal en ese lado. La última línea muestra que mainnet todavía no tiene canales.

### Paso 4: registra tu clave poscuántica y consigue ATOM {#i4}

```bash
node ibc.mjs register
node ibc.mjs hub-faucet
node ibc.mjs status
```

| Comando | Qué hace |
| --- | --- |
| `register` | Pone tu clave pública ML-DSA-87 en la cadena, una sola vez. Las transacciones posteriores de QoreChain se comprueban contra ella. |
| `hub-faucet` | Pide ATOM al faucet público de la testnet del Cosmos Hub, que paga las comisiones del camino de vuelta. |
| `status` | Muestra tus QOR en QoreChain, el voucher y el ATOM en el Hub, y si tu clave está en la cadena. |

**Lo que deberías ver:** después de `status`, tu saldo de QOR, `ML-DSA-87 key on chain: yes` y algo de ATOM. Si algún saldo sigue en cero, espera un minuto y ejecuta `status` de nuevo.

### Paso 5: la ida {#i5}

```bash
node ibc.mjs send 0.5
```

Construye un mensaje de transferencia de tokens (`MsgTransfer`, el estándar ICS-20) en `channel-0`, lo firma con las dos claves mediante QoreSign y después espera hasta que el voucher aparece en el Hub.

**Lo que deberías ver:** tres líneas numeradas: la transacción firmada con su número de paquete, bloque y enlace al explorador; QORel llevando el paquete; y el voucher llegando al Hub, con el número de segundos que tardó. Cada sentido suele tardar unos pocos segundos. Tu tiempo puede ser distinto.

### Paso 6: y la vuelta {#i6}

```bash
node ibc.mjs back
```

Envía todos los vouchers a casa por `channel-600`. La transacción del Hub se firma con un cliente cosmjs normal, al precio del gas actual del Hub. Después el script espera a que regresen los QOR.

**Lo que deberías ver:** la transacción del Hub, después el voucher quemado en el Hub y QOR normales liberados en QoreChain.

### Cómo está organizado el código {#i-code}

Todo está en un solo archivo, `ibc.mjs`. `sendTx()` construye y firma una transacción híbrida de QoreChain con QoreSign. `hubWallet()` convierte las mismas palabras secretas en una wallet del Hub con el prefijo `cosmos`. Cada comando es una función del objeto `cmds`.

## Parte 3: QoreX para desarrolladores {#part-3}

Guía: [workshop-4/03-qorex-developer-mode](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/03-qorex-developer-mode). No hay código nuevo: usas el [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) del Taller 1.

Los pasos de abajo usan la **extensión de navegador QoreX 0.4.5** en Chrome o Firefox. La extensión de Safari es una versión anterior. La app de QoreX (1.2.5, iPhone y Android) también tiene el modo desarrollador: lo activas en **Ajustes**, como se explica en [Modo desarrollador](/qorex/developer-mode).

### Con qué habla una dApp {#providers}

QoreX añade tres proveedores a las páginas web:

| Proveedor | Para | Estándar |
| --- | --- | --- |
| `window.ethereum` | dApps EVM. QoreX también se anuncia mediante EIP-6963 | EIP-1193 |
| `window.qorex.native` | Transacciones nativas de QoreChain, firmadas con secp256k1 y ML-DSA-87 | API de QoreX |
| `window.qorex.svm` | El carril SVM | API de QoreX |

Estos paquetes de npm conectan QoreX con herramientas habituales:

| Paquete | Uso |
| --- | --- |
| `@qorechain/qorex-rainbowkit` | QoreX en RainbowKit (EVM) |
| `@qorechain/qorex-cosmos-kit`, `@qorechain/qorex-interchain-kit` | QoreX en Cosmos Kit e Interchain Kit |
| `@qorechain/qorex-types` | Tipos de TypeScript para `window.qorex` |
| `@qorechain/qorex-wallet-mock`, `@qorechain/qorex-synpress` | Probar tu dApp contra QoreX en pruebas automatizadas |
| `@qorechain/sdk`, `@qorechain/wallet-adapter` | Construir y enviar transacciones con firma híbrida |

Consulta [Integrar una dApp con QoreX](/qorex/dapp-integration) para ver los detalles.

### Paso 1: activa el modo desarrollador {#x1}

En el popup de la extensión, haz clic **siete veces** en el número de versión en la parte inferior de la pantalla de inicio. Aparece una sección **Modo desarrollador** con **Herramientas de desarrollo**, **Cambiar a testnet (diana)** y **Desactivar el modo desarrollador**. Haz clic en **Cambiar a testnet (diana)**.

**Por qué primero:** el registro de solicitudes solo registra solicitudes mientras el modo desarrollador está activado.

### Paso 2: arranca el Hybrid Inspector {#x2}

Desde la carpeta `workshop-4`:

```bash
cd ../workshop-1/03-hybrid-inspector
pnpm install
pnpm dev
```

La primera línea pasa a la aplicación del Taller 1, `pnpm install` descarga sus paquetes y `pnpm dev` arranca una página web local. Abre la dirección que muestra (normalmente `http://localhost:5173`) y conecta QoreX.

### Paso 3: envía una solicitud con la wallet bloqueada {#x3}

Haz clic en **Bloquear** en QoreX. En el Inspector, envía 0,001 QOR a tu propia dirección con el memo `Workshop 4`.

**Lo que deberías ver:** QoreX pide tu contraseña y **nombra el sitio** que está haciendo la solicitud. Después de desbloquear, la aprobación muestra la cantidad, el destinatario y el memo. Apruébala: la transacción se firma con las dos claves. Si cierras la ventana en su lugar, la solicitud se rechaza.

**Por qué importa:** nada se firma sin tu contraseña, y sabes qué sitio está pidiendo.

### Paso 4: abre las herramientas de desarrollo {#x4}

Abre **Herramientas de desarrollo** y mira en **Transacciones**:

- **Registro de solicitudes:** lo que cada sitio pidió a QoreX, con el método, los parámetros y lo que respondiste.
- **Inspector de transacciones:** pega un hash de transacción o una solicitud en **Hash or request** y haz clic en **Inspeccionar**. Con un hash, ves lo que registró la cadena, sin salir de la wallet.

Hay 17 herramientas de desarrollo en total. [Modo desarrollador](/qorex/developer-mode) explica cada una.

### Otras novedades de QoreX 1.2.5 {#also-new}

- **Una ventana EVM manual permite por defecto solo transferencias de QOR.** Puedes elegir un alcance más amplio, y ves lo que concedes.
- **Multifirma PQC:** una cuenta compartida cuyos miembros firman cada uno de forma poscuántica.
- **Rotación y reparación de claves:** reemplaza o arregla tu clave ML-DSA-87 en la cadena sin cambiar tu dirección.

## Solución de problemas {#troubleshooting}

| Qué ves | Qué hacer |
| --- | --- |
| `no operator account yet` | Ejecuta antes `node rollup.mjs init`. |
| `no rollup yet` | Ejecuta antes `node rollup.mjs prepare`. |
| `createRollup` se rechaza por falta de fondos | La cuenta del operador necesita unos 12.010 QOR de prueba. Consulta [Antes de empezar](#prerequisites). |
| `prepare` se detiene a medias | Ejecútalo de nuevo. Continúa a partir de lo que ya hizo. |
| `withdrawals are paid only after the challenge window` | El lote 0 todavía no es definitivo. Compruébalo con `node rollup.mjs status` e inténtalo más tarde. |
| `nothing to challenge` | Ejecuta antes `node rollup.mjs cheat`. |
| El lote ya está rechazado cuando ejecutas `watchtower` | Otro watchtower de la testnet fue más rápido. Es normal. |
| `no account "traveler"` | Ejecuta antes `node ibc.mjs init`. |
| `does not exist on chain yet` | Consigue QOR de prueba del faucet para esa dirección e inténtalo de nuevo. |
| `nothing after 120 s` | Puede que el relayer esté ocupado. Espera un minuto y ejecuta `node ibc.mjs status`. |
| El registro de solicitudes está vacío | Activa el modo desarrollador antes de usar la dApp. |

## Más información {#learn-more}

- El festival, sus niveles y pistas: [build.qorechain.io](https://build.qorechain.io).
- [Rollups](/rollups/overview) y el RDK. El RDK está disponible para TypeScript, Python, Rust, Go y Java, con una herramienta de línea de comandos, `qorollup`, y una plantilla de proyecto.
- Para seguir los lotes nuevos a medida que llegan, mira `watchBatches` en el RDK: un punto de partida para un watchtower que funcione todo el día.
- [QORel](https://github.com/qorechain/QORel) es de código abierto. Instálalo con `brew install qorechain/tap/qorel` o usa el contenedor `ghcr.io/qorechain/qorel`. Ejecútalo solo con tus propias claves.
- Para probar otro canal en la Parte 2, cambia `CHANNEL`, `HUB_CHANNEL` y los endpoints de la otra cadena en `ibc.mjs`. `node ibc.mjs channels` los lista.
- [Modo desarrollador](/qorex/developer-mode) e [integración de dApps](/qorex/dapp-integration) en QoreX.
- [Taller 3, QoreSeal](/build-before-qday/workshop-3#part-1), si tu rollup necesita mantener privados los datos que publica.
