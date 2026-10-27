---
slug: /developer-tools/scaffolders-and-cli
title: Generadores de proyectos y la CLI qorollup
sidebar_label: Generadores y CLI
sidebar_position: 21
---

# Generadores de proyectos y la CLI `qorollup`

Tres herramientas de línea de comandos llevan un proyecto de QoreChain de la nada a un punto de partida tipado y compilable. Son para desarrolladores de aplicaciones (dApps) y operadores de rollups que trabajan en Node.js:

* **`create-qorechain-dapp`** (0.10.0) genera una dApp a partir de una de tres plantillas, construidas sobre el [SDK de QoreChain](/sdk/overview).
* **`create-qorechain-rollup`** (0.6.2) genera un proyecto de rollup a partir de una de seis plantillas, construidas sobre el [Rollup Development Kit](/rollups/overview) de TypeScript.
* **`qorollup`**, el comando del paquete `@qorechain/rdk-cli` (0.6.2), es la línea de comandos del operador: comprobaciones previas, creación y monitorización de un rollup, lectura de parámetros en vivo.

La página refleja los paquetes publicados tal como se instalan desde npm el 27 de octubre de 2026. Las guías conceptuales son [Desplegar un rollup](/rollups/deploying-a-rollup) y la [referencia de la CLI del SDK](/sdk/reference/cli).

## Innovaciones {#innovations}

* **Generación no interactiva para CI.** Cada pregunta tiene un indicador: `--template`, `--network`, `--package-manager`, `--yes` (aceptar los valores predeterminados) y `--no-install`. Un pipeline puede generar y compilar un proyecto con un solo comando y sin terminal.
* **Las plantillas están fijadas a los paquetes actuales.** Las plantillas de dApp dependen de `@qorechain/sdk` `^0.10.0` (la plantilla EVM, de `@qorechain/evm`) y las plantillas de rollup de `@qorechain/rdk` `^0.6.1`, que una instalación nueva resuelve a 0.6.2. Un generador anterior (0.8.0) escribía rangos que se resolvían a un SDK que no podía firmar para las redes en vivo; con el actual eso no ocurre.
* **Las plantillas de rollup codifican una configuración válida para cada caso de uso.** Cada plantilla de rollup establece una combinación de liquidación, secuenciador, disponibilidad de datos, gas y VM que acepta la matriz de compatibilidad del RDK, y el generador imprime el stake y la quema de creación en vivo antes de que crees nada.
* **Un comando de comprobación previa que nombra lo que falta.** `qorollup doctor` (y `npm run doctor` dentro de una plantilla de rollup) comprueba que el endpoint REST responde, que se pueden leer los parámetros del módulo, que el endpoint es la red que pediste y que hay un firmante configurado, e imprime una línea por comprobación. Dentro de una plantilla también valida la configuración del rollup contra la matriz de compatibilidad.
* **Firma híbrida integrada en las plantillas.** Las plantillas de rollup se conectan mediante un pequeño `signer.ts` que deriva la clave ML-DSA-87 de la cuenta a partir de tu mnemónico (o toma una semilla junto con una clave privada en bruto) y firma de forma híbrida, que es lo que exigen las redes en el carril nativo. La plantilla de dApp `rollup-app` hace lo mismo y se ejecuta como simulacro salvo que establezcas `QORE_BROADCAST=1`.
* **Simulacros.** `qorollup create ... --dry-run` valida la configuración, imprime el stake y la quema, e indica que enviaría `MsgCreateRollup` sin difundirlo.
* **Salida legible por máquinas.** `qorollup ... --json` imprime JSON para scripts.

## Cómo usarlo {#how-to-use}

### Genera una dApp {#create-dapp}

```bash
# interactive
npm create qorechain-dapp my-dapp
# non-interactive
npx create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
```

| Plantilla | Qué genera | Scripts |
| --- | --- | --- |
| `evm-solidity` | Un contrato Solidity `Counter` con un artefacto precompilado, y un script viem que lo despliega y lo llama usando `@qorechain/evm`. Archivos: `contracts/Counter.sol`, `contracts/Counter.artifact.ts`, `scripts/deploy.ts`, `.env`. | `deploy` |
| `fullstack-web` | Una página con Vite, React y TypeScript que lee los saldos de una dirección (y un resumen de tokenomics) con `@qorechain/sdk`. Archivos: `index.html`, `src/App.tsx`, `src/main.tsx`, `vite.config.ts`, `.env`. | `dev`, `build`, `preview`, `typecheck` |
| `rollup-app` | Un script de Node que usa `createRollupClient` y `createMultilayerClient` del SDK para construir mensajes de rollup y de sidechain o paychain. Archivos: `src/index.ts` y la configuración habitual. Simulacro por defecto. | `start`, `typecheck` |

| Indicador | Significado |
| --- | --- |
| `-t, --template <name>` | `evm-solidity`, `fullstack-web` o `rollup-app` |
| `--network <name>` | `testnet` o `mainnet` |
| `--package-manager <pm>` | `pnpm`, `npm` o `yarn` |
| `-y, --yes` | omite las preguntas y usa los valores predeterminados |
| `--no-install` | no instala las dependencias |
| `-h, --help`, `-v, --version` | ayuda, versión |

Ejemplo probado (del centro para desarrolladores; ejecutado el 27 de octubre de 2026 en un directorio vacío, con `npx` desde el registro público de npm): genera la plantilla web y la compila. Observado: `Done! Created my-dapp` y un `vite build` correcto. La compilación imprime una advertencia de tamaño del bundle, que es inofensiva.

```bash
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

Antes de ejecutar la aplicación web, abre el `.env` generado: apunta a `http://localhost:1317` y `http://localhost:8545`, así que establece `VITE_QORE_REST_URL` en `https://api-testnet.qore.host` (o `https://api.qore.host` para mainnet) y `VITE_QORE_EVM_RPC_URL` en `https://evm-testnet.qore.host` (o `https://evm.qore.host`).

### Genera un proyecto de rollup {#create-rollup}

```bash
npm create qorechain-rollup my-rollup
# non-interactive
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
```

| Plantilla | Perfil | Liquidación / secuenciador / DA / gas / VM | Archivos adicionales |
| --- | --- | --- | --- |
| `defi-rollup` | defi | zk-SNARK, dedicated, native, EIP-1559, EVM | un probador de referencia (`src/prover.ts`) y un circuito de demostración en `circuits/` |
| `gaming-rollup` | gaming | based, based, native, gas fijo, VM personalizada | ninguno |
| `nft-rollup` | nft | optimistic, dedicated, QoreChain Native, con un flujo de desafío | `src/challenge.ts` |
| `enterprise-rollup` | enterprise | based, based, native, gas subvencionado, EVM | ninguno |
| `custom-rollup` | custom | totalmente parametrizado, cada campo documentado | ninguno |
| `multivm-rollup` | multivm | un rollup EVM que llama a contratos de QoreChain Native mediante el precompile entre VMs | `contracts/CrossVmCaller.sol`, `src/crossvm-call.ts` |

Cada plantilla contiene `rollup.config.ts` (la configuración), `src/client.ts`, `src/signer.ts`, `src/create.ts`, `src/submit-batch.ts`, `src/query-status.ts`, `src/doctor.ts`, `src/status.ts`, `.env` y `.env.example`, un README y un `.github/workflows/deploy.yml`. Scripts: `create`, `submit-batch`, `query-status`, `doctor`, `status`, `typecheck`. Los perfiles predefinidos se explican en [Perfiles predefinidos](/rollups/preset-profiles).

Las opciones son las mismas que en el generador de dApps, con los seis nombres de plantilla anteriores. La plantilla `multivm-rollup` aparece en `--help` pero no en el README del paquete, que lista cinco.

Ejemplo probado (centro para desarrolladores, 27 de octubre de 2026, `npx` desde npm en un directorio vacío). Observado: `Created my-rollup (defi-rollup template)` y `tsc --noEmit` pasando. El mismo proceso de generación y `npm run typecheck` se repitieron con 0.6.2 el mismo día, con el mismo resultado.

```bash
npx -y create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
cd my-rollup && npm run typecheck
```

Siguientes pasos, tal como los imprime el generador: `npm install`, rellenar la clave del operador en `.env`, `npm run doctor`, `npm run create`, `npm run query-status`. El `.env` generado ya contiene los endpoints públicos de la testnet (`https://api-testnet.qore.host`, `https://rpc-testnet.qore.host`, `https://evm-testnet.qore.host`) y campos de clave vacíos: `QORE_MNEMONIC` o `QORE_OPERATOR_PRIVATE_KEY_HEX` (con `QORE_PQC_SEED_HEX` para la semilla poscuántica). Nunca subas ese archivo al repositorio.

### La CLI `qorollup` {#qorollup}

```bash
npm install -g @qorechain/rdk-cli
qorollup --version          # 0.6.2
qorollup doctor --network testnet
```

También puedes ejecutarla sin instalar: `npx @qorechain/rdk-cli doctor`.

| Comando | Qué hace |
| --- | --- |
| `doctor` | comprobación previa: endpoints, parámetros del módulo, coincidencia de red, firmante, saldo, configuración |
| `params` | imprime los parámetros del módulo en vivo |
| `create --rollup-id <id>` | crea un rollup (`--profile`, `--stake-uqor`, `--dry-run`) |
| `status <id>`, `watch <id>` | estado y salud, o una vista en vivo (`--interval <ms>`) |
| `advise <id>` | consejo del Copiloto QCAI (consulta [Copiloto QCAI](/rollups/qcai-copilot)) |
| `suggest "<use case>"` | sugiere un perfil para un caso de uso |
| `receipt <id> <batch>` | construye un recibo de liquidación (`--verify`, `--out <file>`), consulta [Recibos de liquidación](/rollups/settlement-receipts) |
| `watchtower <id>` | marco de desafiantes para rollups optimistic, consulta [Watchtower](/rollups/watchtower) |
| `pause`, `resume`, `stop <id>` | transiciones del ciclo de vida (solo el creador) |
| `keygen` | genera una clave de operador (mnemónico y dirección) |
| `manifest export`, `manifest import` | exporta o importa un manifiesto de rollup |
| `withdraw --file <json>` | ensambla y envía un retiro (`--dry-run`) |
| `faucet <address>` | solicita fondos de testnet (requiere `QORE_FAUCET_URL`) |

Indicadores globales: `--network testnet|mainnet` (testnet por defecto), `--rest`, `--rpc`, `--evm-rpc` (sustituciones de endpoint, o `QORE_REST_URL`, `QORE_RPC_URL`, `QORE_EVM_RPC_URL`), `--mnemonic` o `--key` (o `QORE_MNEMONIC`, `QORE_OPERATOR_PRIVATE_KEY_HEX`), `--profile defi|gaming|nft|enterprise|custom`, `--json`, `-y, --yes`, `-h, --help`, `-v, --version`.

**`doctor`.** Ejecútalo antes de cualquier cosa que envíe una transacción. Salida observada el 27 de octubre de 2026 con 0.6.2 y sin firmante configurado, en la testnet (mainnet imprimió lo mismo, con `qorechain-vladi` y `https://api.qore.host`; la herramienta imprime rayas largas, mostradas aquí como guiones):

```text
Preflight (testnet - qorechain-diana):
✓ REST endpoint reachable - https://api-testnet.qore.host
✓ Module parameters readable - min stake 10000 QOR, burn 1%
✓ Network matches expectation - client is testnet (qorechain-diana)
! Signer configured - no signer (Set QORE_OPERATOR_PRIVATE_KEY_HEX or QORE_MNEMONIC to create/operate.)
All checks passed.
```

Una línea que empieza por `!` es una advertencia y no hace fallar la ejecución; la falta de firmante solo es un problema cuando quieres crear u operar un rollup. El comando termina con código 0 cuando no falla ninguna comprobación.

**Ejemplo probado.** Del centro para desarrolladores: leer los parámetros del módulo en vivo sin ninguna clave. Falló en 0.6.1 (el comando no imprimió nada y terminó con 0) y se volvió a ejecutar en 0.6.2:

```bash
npx -y @qorechain/rdk-cli params --network testnet --rest https://api-testnet.qore.host
```

Observado con 0.6.2 mediante `npx`, mediante una instalación global y mediante el enlace local `node_modules/.bin/qorollup`: se imprimen los parámetros del módulo (máximo de rollups 200, stake mínimo 10000 QOR, quema de creación 1%, ventana de desafío 3600 s, blob máximo de disponibilidad de datos 2,097,152 bytes, retención de blobs 432,000 bloques, máximo de lotes por bloque 10). Un simulacro de creación, también observado:

```bash
qorollup create --rollup-id my-roll --profile defi --dry-run --network testnet
# Create rollup "my-roll" (profile defi, zk/evm)
# Stake 10000 QOR - burned on creation: 100 QOR
# Dry run OK - would submit MsgCreateRollup (no broadcast).
```

## Cómo acceder {#how-to-access}

* **Requisitos previos.** Node.js 20 o posterior y un gestor de paquetes. Los generadores escriben archivos y, salvo que pases `--no-install`, instalan dependencias, por lo que necesitan acceso de red al registro de npm. Los clientes RDK de Python, Rust, Go y Java son bibliotecas y no tienen generador; consulta [Desplegar un rollup](/rollups/deploying-a-rollup).
* **Redes y endpoints.** Mainnet `qorechain-vladi` (EVM chain id 9801): REST `https://api.qore.host`, RPC `https://rpc.qore.host`, EVM `https://evm.qore.host`. Testnet `qorechain-diana` (chain id 9800): los mismos hosts con `-testnet` tras la primera etiqueta, por ejemplo `https://api-testnet.qore.host`. Leer datos, `doctor`, `params`, `suggest` y `--dry-run` no necesitan ninguna cuenta.
* **Cuentas y claves.** Todo lo que envía una transacción necesita una cuenta de operador con fondos y su mnemónico o clave privada, proporcionados mediante variables de entorno o indicadores, nunca subidos al repositorio. Crear un rollup requiere el stake mínimo (10,000 QOR en ambas redes, leído en vivo el 27 de octubre de 2026), del cual se quema el 1% en la creación. `qorollup keygen` crea una clave nueva; en la testnet, los fondos de prueba vienen del [Grifo del Dashboard](/dashboard/faucet), o de `qorollup faucet` con `QORE_FAUCET_URL` establecido.
* **Firma híbrida.** Las transacciones del carril nativo necesitan una firma secp256k1 más una firma ML-DSA-87. Las plantillas derivan la clave poscuántica de tu mnemónico; los comandos de transacción de `qorollup` no lo hacen (consulta los límites más abajo).
* **Costes.** Las herramientas son gratuitas (Apache-2.0). On-chain, el mínimo de comisión es 0.1 uqor por gas; el stake y la quema del rollup indicados arriba se aplican a la creación.

## Dónde está publicado {#where-published}

| Registro | Paquete | Versión | Enlace |
| --- | --- | --- | --- |
| npm | `create-qorechain-dapp` (comando `create-qorechain-dapp`) | 0.10.0 | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `create-qorechain-rollup` (comando `create-qorechain-rollup`) | 0.6.2 | https://www.npmjs.com/package/create-qorechain-rollup |
| npm | `@qorechain/rdk-cli` (comando `qorollup`) | 0.6.2 | https://www.npmjs.com/package/@qorechain/rdk-cli |
| npm | `@qorechain/rdk` (biblioteca que usan las plantillas) | 0.6.2 | https://www.npmjs.com/package/@qorechain/rdk |

Código fuente: https://github.com/qorechain/qorechain-sdk/tree/main/cli (generador de dApps), https://github.com/qorechain/qorechain-rdk/tree/main/cli (generador de rollups) y https://github.com/qorechain/qorechain-rdk/tree/main/packages/rdk-cli (`qorollup`). La versión 0.6.2 del RDK también está en PyPI, crates.io y el proxy de módulos de Go; el artefacto de Java en Maven Central sigue en 0.6.1 (comprobado el 27 de octubre de 2026). Todos son Apache-2.0.

## Límites y problemas conocidos {#limits}

* **`--network mainnet` no cambió los archivos generados en una prueba.** El 27 de octubre de 2026 se generaron `fullstack-web` y `custom-rollup` con `--network mainnet`; el `.env` generado seguía con endpoints de localhost (dApp) o `QORE_NETWORK=testnet` con los endpoints de la testnet (rollup), y el `App.tsx` de la dApp creaba un cliente `testnet`. Establece tú mismo la red y los endpoints en `.env` y, para la plantilla web, en `src/App.tsx`.
* **Todavía no existe ningún rollup en ninguna de las dos redes** (comprobado el 27 de octubre de 2026). Ninguna ruta de transacción de las herramientas de rollup se ha ejercitado en un rollup en vivo. Valida todo primero en la testnet y lee [RDK 0.6.2: cambios y límites](/rollups/deploying-a-rollup#rdk-050-limits).
* **La plantilla `defi-rollup` no puede finalizar un lote.** La liquidación ZK todavía no se puede usar en ninguna de las dos redes, y su circuito de demostración no podría superar la comprobación de pruebas de la cadena en cualquier caso. Usa una plantilla con liquidación `optimistic` hasta que eso cambie (consulta [ZK, STARK y Retiros](/rollups/zk-stark-withdrawals)).
* **La plantilla `multivm-rollup` depende de algo que no está en producción.** El precompile entre VMs en `0x0000000000000000000000000000000000000901` no está activo en ninguna de las dos redes, así que una llamada desde un contrato no hace nada; la plantilla lo comprueba y su contrato está escrito para revertir en lugar de fallar en silencio (consulta [Multi-VM](/rollups/multi-vm)).
* **Los comandos de transacción de `qorollup` firman solo de forma clásica.** `create`, `pause`, `resume`, `stop` y `withdraw` se conectan sin una clave poscuántica, algo que ambas redes rechazan en el carril nativo. Las lecturas, `doctor`, `params`, `receipt` y `--dry-run` no se ven afectados. Para enviar transacciones, usa un proyecto generado (sus scripts firman de forma híbrida), el RDK de TypeScript con un `pqcKeypair`, o la CLI de la cadena.
* **Algunos auxiliares de `qorollup` todavía no tienen con qué comunicarse.** `advise` contra la testnet el 27 de octubre imprimió "advisory unavailable" para las superficies de comisión, red, fraude y agente RL (el nodo respondió 501 o "method does not exist") y para un rollup que no existe. `suggest` devolvió un perfil con `source: fallback`, lo que indica que se usó la lista predeterminada incorporada en lugar del servicio de asistente. Lee las advertencias.
* **`rollup-app` difunde solo cuando lo pides.** Ejecuta un simulacro por defecto; con `QORE_BROADCAST=1` registra una vez la clave ML-DSA-87 de la cuenta y firma de forma híbrida. Sus valores de rollup de ejemplo son ilustrativos: toma los nombres de perfil reales y el stake de [Perfiles predefinidos](/rollups/preset-profiles).
* **`fullstack-web` muestra un error en su botón de tokenomics.** Ese panel llama a un método JSON-RPC `qor_` que los endpoints públicos no sirven; la consulta de saldo funciona. Sustitúyelo por una lectura REST como `client.rest.getBurnStats()`.
* **`evm-solidity` necesita algo más que una cuenta con fondos.** Enviar una transacción EVM en QoreChain también necesita una clave ML-DSA-87 registrada y una ventana de autorización EVM abierta, configuradas desde el carril nativo (consulta la [guía EVM](/developer-guide/evm-development#evm-window)). El script `deploy` de la plantilla no se ejecutó contra una red en vivo para esta página.
* **`create-qorechain-dapp --version` imprime `0.5.1`** aunque el paquete instalado es 0.10.0 (comprobado el 27 de octubre de 2026). Lee la versión de `package.json` o del registro.
* **Los README de los paquetes están desactualizados.** El README de `create-qorechain-dapp` lista dos plantillas y el de `create-qorechain-rollup` cinco; `--help` muestra tres y seis. Fíate de `--help`.
* **Las versiones anteriores a 0.6.2 no funcionan desde npm.** `qorollup` 0.6.1 y anteriores, instalados por npm de cualquier modo, no imprimían nada y terminaban con código 0, y `--version` imprimía `0.4.1`. Si debes quedarte en 0.6.1, ejecuta `node node_modules/@qorechain/rdk-cli/dist/index.js <command>`; de lo contrario, actualiza.
* **Copias de dependencias.** `@qorechain/rdk` 0.6.2 depende de `@qorechain/sdk` `^0.9.0`, así que un proyecto que también instale el SDK 0.10.0 contiene un segundo SDK 0.9.x anidado. Esto es inofensivo para los scripts que generan las plantillas.
* **Maven Central va con retraso.** El artefacto Java del RDK es allí 0.6.1; 0.6.2 está pendiente y no contiene ningún cambio en Java.
