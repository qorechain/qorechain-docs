---
slug: /rollups/deploying-a-rollup
title: Desplegar un rollup
sidebar_label: Desplegar un rollup
sidebar_position: 3
---

# Desplegar un rollup

Puedes desplegar un rollup específico de aplicación de tres maneras: a través del **Dashboard** (un asistente guiado sin código), a través de la **CLI** de la cadena (`qorechaind`, con control total sobre la transacción on-chain), o de forma programática con el **RDK de TypeScript** (`@qorechain/rdk` más el scaffolder `create-qorechain-rollup`). Esta página cubre las tres opciones, además del ciclo de vida del operador y los comandos de lotes.

:::note
Los comandos siguientes apuntan a la testnet **`qorechain-diana`**. La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) está en producción desde el 7 de junio de 2026 ejecutando la versión de cadena **v3.1.77** — sustituye el chain ID y los endpoints de mainnet al desplegar en mainnet. Valida cada despliegue primero en testnet.
:::

---

## Requisitos

| Requisito | Detalles |
| ----------- | ------- |
| **Stake mínimo** | Se deposita en garantía un bono de stake en QOR cuando se crea el rollup |
| **Quema de creación** | Una fracción de la cantidad puesta en stake se quema permanentemente en la creación; el resto se mantiene en garantía y se devuelve cuando se detiene el rollup |
| **Cuenta** | Una cuenta de QoreChain con fondos suficientes para el stake más las comisiones de transacción |

Consulta los parámetros del módulo en vivo para conocer el stake mínimo y la tasa de quema actuales antes de desplegar:

```bash
qorechaind query rdk config
```

---

## Desplegar a través del Dashboard (Tools → Rollups)

El Dashboard ofrece un asistente guiado **Deploy a Rollup** en **Tools → Rollups**. Es la vía más rápida para lanzar un rollup específico de aplicación sin ensamblar una transacción a mano.

### Pasos

1. **Inicia sesión.** El asistente requiere una sesión autenticada para desplegar y para listar tus despliegues existentes.
2. **Nombra tu rollup.** Introduce un nombre de rollup (2–41 caracteres: letras, números, espacios, guiones o guiones bajos).
3. **Elige una máquina virtual.** QoreChain es una cadena de triple VM, por lo que tu rollup puede ejecutar cualquiera de las siguientes:
   * **EVM** — contratos en Solidity / Vyper con todas las herramientas de Ethereum (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — contratos inteligentes en Rust sobre el runtime de Cosmos SDK, con IBC nativo
   * **SVM** — la Solana Virtual Machine, para aplicaciones de ejecución paralela y alto rendimiento
4. **Elige una capa de disponibilidad de datos.** Dónde publica tu rollup los datos de transacción para que cualquiera pueda reconstruir el estado: **QoreChain DA**, **Celestia** o **EigenDA**. Ten en cuenta que EigenDA es una opción a nivel del Dashboard, mientras que los backends de DA on-chain de `x/rdk` son native, Celestia o both — consulta [Disponibilidad de datos](/rollups/data-availability).
5. **Define un token de gas.** El token que se usa para pagar la ejecución en tu rollup. El valor predeterminado es **QOR**; introduce un símbolo personalizado para usar tu propio token nativo.
6. **Elige un secuenciador.** Quién ordena las transacciones antes de la liquidación: **Shared sequencer** (el conjunto compartido de QoreChain), **Dedicated (single)** (ejecuta tu propio secuenciador único) o **Decentralized** (un conjunto de secuenciadores sin permisos).
7. **Elige un destino de liquidación.** Dónde ancla el rollup sus raíces de estado y pruebas de validez: **QoreChain mainnet** o **Ethereum**.
8. **Despliega.** Envía el asistente. El aprovisionamiento es revisado por **The Qore Trust** antes de que el rollup entre en producción, por lo que un rollup recién enviado aparece con un estado **provisioning** hasta que finaliza la revisión.

Tus rollups enviados aparecen en la lista **Your rollups** con su VM, capa de DA, token de gas, secuenciador, destino de liquidación y estado actual.

:::note
El asistente del Dashboard presenta opciones amigables a nivel de producto y enruta el aprovisionamiento a través de un pipeline revisado. La CLI siguiente trabaja directamente contra la superficie de mensajes on-chain del módulo `x/rdk`. Ambas comparten los mismos conceptos subyacentes (VM, DA, secuenciador, liquidación) pero los exponen a diferentes niveles.
:::

---

## Desplegar a través de la CLI

La CLI crea el rollup directamente on-chain. `create-rollup` toma tres argumentos posicionales — el ID del rollup, un perfil y la cantidad de stake (en `uqor`) — más un flag opcional `--vm`.

:::tip
A partir de la versión de cadena **v3.1.74**, `create-rollup` **aplica automáticamente el preset del perfil elegido** — el modo de liquidación, el secuenciador, la DA, el modelo de gas y la VM se toman todos del preset. Ya no necesitas configurarlos a mano (anteriormente el mensaje codificaba de forma fija una configuración soberana). El flag `--vm` ahora **toma por defecto un valor vacío**, por lo que se aplica la VM del perfil a menos que la sobrescribas explícitamente.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Ejemplo** — crea un rollup a partir del preset `defi` (la liquidación, el secuenciador, la DA y la VM provienen todos del preset; `defi` se resuelve como liquidación zk sobre la EVM):

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Flags:**

| Flag | Predeterminado | Descripción |
| ---- | ------- | ----------- |
| `--vm` | *(vacío — usa la VM del perfil)* | Sobrescribe el tipo de VM del rollup: `evm`, `cosmwasm`, `svm` o `custom`. Déjalo sin configurar para aplicar la VM del preset. |

El argumento `[profile]` selecciona una configuración de preset que se aplica automáticamente — consulta **[Perfiles preestablecidos](/rollups/preset-profiles)**. El `[stake-amount]` es el bono en `uqor`.

### Inspeccionar lo que desplegaste

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Desplegar con el RDK de TypeScript (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

El Kit de desarrollo de rollups se distribuye como dos paquetes públicos de npm que controlan el mismo módulo on-chain `x/rdk` que la CLI, sobre RPC/REST/gRPC/JSON-RPC públicos y cualquier `OfflineSigner` de cosmjs:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.0`) — el SDK de TypeScript: un constructor de configuración con perfiles preestablecidos, helpers de transacción para los ciclos de vida del rollup y del lote de liquidación, DA nativa, clientes de lectura tipados, y las adiciones de la v0.4 — recibos de liquidación cuánticamente seguros, el QCAI Rollup Copilot, helpers de calldata entre VM y la watchtower.
* **`create-qorechain-rollup`** (`v0.4.0`) — un scaffolder que clona una plantilla de inicio ejecutable por perfil (incluida la plantilla `multivm-rollup`).

Estos están publicados en npm. El repositorio también incluye una CLI de operador publicada, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.0`), con los comandos `doctor`, `create`, `status`, `watch`, `params`, `suggest`, de ciclo de vida (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` y `faucet`, además de los comandos `receipt`, `advise` y `watchtower` de la v0.4.

#### Clientes de Python, Go, Rust y Java

Junto al paquete de TypeScript, el RDK proporciona clientes completos de **Python**, **Go**, **Rust** y **Java** que reflejan la superficie de TypeScript: el constructor de configuración con validación, los cinco perfiles preestablecidos, utilidades de denom/economía/bech32, helpers de Merkle binario y de pruebas de retiro, manifiestos de rollup, clientes de lectura REST y JSON-RPC `qor_`, comprobaciones de preflight/salud, cuentas (mnemónica → dirección `qor`) y **firma + difusión de transacciones** (`SIGN_MODE_DIRECT`). Todos están verificados frente a vectores dorados compartidos entre lenguajes y están **publicados** en sus registros:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.0
```

```python
import qorrdk
```

Versiones publicadas actuales: Python `qorechain-rdk` **0.4.0** (PyPI, import `qorrdk`), Rust `qorechain-rdk` **0.4.0** (crates.io), módulo de Go `github.com/qorechain/qorechain-rdk/packages/go`, y Java `io.github.qorechain:qorechain-rdk` **0.4.0** (Maven Central). La difusión en vivo requiere un endpoint de nodo.

:::note
El RDK de TypeScript y sus plantillas apuntan a la testnet **`qorechain-diana`** y están marcados como **próximamente** para los flujos completos de extremo a extremo. Fija las versiones y valida en testnet.
:::

### Generar un proyecto con `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

Cada perfil tiene una plantilla de inicio correspondiente (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Genera una con cualquiera de estas formas:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Para uso no interactivo / CI, pasa la plantilla y la red de forma explícita:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

El scaffolder imprime el coste documentado de stake y de quema de creación y los siguientes pasos para crear tu rollup y leer su estado.

### Crear un rollup desde código

Construye una configuración a partir de un preset, lee el stake y la tasa de quema en vivo desde la cadena, y luego crea el rollup con un cliente de firma. El constructor de configuración aplica la matriz de compatibilidad liquidación → prueba en `validate()` / `build()`.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connect a signing client with any cosmjs OfflineSigner.
const tx = await rdk.connectTx(signer, { gasPrice: "0.025uqor" });
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

¿No estás seguro de qué perfil encaja? `rdk.suggestProfile("a lending protocol with predictable fees")` devuelve una recomendación asistida por QCAI (con un fallback documentado).

### Gestionar el ciclo de vida y leer el estado desde código

El cliente de firma expone el ciclo de vida completo — `pauseRollup`, `resumeRollup`, `stopRollup`, además de `submitBatch`, `challengeBatch`, `resolveChallenge` y `executeWithdrawal`. Las transiciones del ciclo de vida pueden protegerse pasando `currentStatus`.

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

Lee el estado con el cliente REST tipado (no se requiere firmante):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## Gestión del ciclo de vida

Un rollup pasa por los estados `pending`, `active`, `paused` y `stopped`. El creador gestiona las transiciones con los siguientes comandos.

### Pausar

Detiene temporalmente el rollup. El estado se conserva y el rollup puede reanudarse. Se requiere una cadena de motivo.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Reanudar

Reanuda un rollup previamente pausado.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Detener

Da de baja permanentemente el rollup y libera su stake. El QOR puesto en stake — menos la quema de creación única — se devuelve al creador.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
Detener un rollup es permanente. El rollup no puede reiniciarse una vez detenido.
:::

---

## Comandos del operador: lotes y desafíos

Los operadores de rollup envían lotes de liquidación, y los desafiantes pueden disputar los lotes optimistas. Estos comandos sustentan la capa de liquidación descrita en **[Visión general de los rollups](/rollups/overview)** y **[ZK / STARK y retiros](/rollups/zk-stark-withdrawals)**.

### Enviar un lote

Envía un lote de liquidación para un rollup. Toma el ID del rollup, un índice de lote y una raíz de estado codificada en hex.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Desafiar un lote

Desafía un lote enviado (para rollups optimistas). Toma el ID del rollup y el índice de lote; pasa la prueba de fraude con `--proof`. A partir de la versión de cadena **v3.1.74**, la vía optimista **submit-batch → challenge-batch** está activa y funciona de extremo a extremo.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| Flag | Descripción |
| ---- | ----------- |
| `--proof` | Prueba de fraude codificada en hex |

### Inspeccionar lotes

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42
```

---

## Consultas

| Comando | Propósito |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Detalles de un rollup específico |
| `qorechaind query rdk list-rollups` | Todos los rollups registrados |
| `qorechaind query rdk batch [rollup-id]` | Último lote de liquidación (o `--index`) |
| `qorechaind query rdk config` | Parámetros del módulo RDK |
| `qorechaind query rdk suggest-profile [use-case]` | Recomienda un preset para un caso de uso |

---

## Próximos pasos

* **[Disponibilidad de datos](/rollups/data-availability)** — backends de DA native, Celestia y redundante.
* **[ZK / STARK y retiros](/rollups/zk-stark-withdrawals)** — verificación de pruebas y el flujo de retiro L2 → L1 a través de `execute-withdrawal`.
