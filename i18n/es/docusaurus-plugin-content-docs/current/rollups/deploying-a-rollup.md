---
slug: /rollups/deploying-a-rollup
title: Desplegar un rollup
sidebar_label: Desplegar un rollup
sidebar_position: 3
---

# Desplegar un rollup

Puedes configurar un rollup específico de aplicación de tres maneras: a través del **Dashboard** (un formulario de solicitud, no una transacción on-chain), a través de la **CLI** de la cadena (`qorechaind`, con control total sobre la transacción on-chain) o con el **RDK de TypeScript** (`@qorechain/rdk` más el generador de plantillas `create-qorechain-rollup`), que hoy cubre la configuración y las lecturas. Esta página cubre las tres opciones, además del ciclo de vida del operador y los comandos de lotes.

:::caution Capacidad en fase temprana
Todavía no se ha creado ningún rollup en ninguna de las dos redes. Los comandos siguientes usan la testnet **`qorechain-diana`** (EVM chain ID **9800**, versión de cadena **v3.2.2**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) ejecuta la versión de cadena **v3.2.1**; esta página describe el comportamiento de mainnet, y la versión más reciente de la testnet puede diferir en los detalles. Valida cada despliegue primero en la testnet.
:::

:::note Comisiones y firma
La red impone un precio de gas mínimo de `0.1uqor`, por lo que un simple `--fees 500uqor` es rechazado, y toda transacción del carril nativo necesita la cofirma híbrida post-cuántica. Por eso los ejemplos de CLI de esta página construyen la transacción con `--generate-only` y la cofirman con `qorechaind tx pqc cosign`, que la firma y la difunde (crea la clave una sola vez con `qorechaind tx pqc gen-key` y regístrala on-chain una sola vez con `qorechaind tx pqc register-key`, o a través de QoreX o del SDK, que lo hacen por ti). La comisión queda fijada cuando se genera el archivo sin firmar, así que define el límite de gas y la comisión juntos: la comisión debe ser al menos el límite de gas × 0,1 uqor. Los límites de gas de abajo son orientativos — simula antes de fiarte de ellos. Consulta [Primera transacción](/getting-started/first-transaction) y [Firma post-cuántica](/developer-guide/post-quantum-signing).
:::

---

## Requisitos

| Requisito | Detalles |
| ----------- | ------- |
| **Stake mínimo** | Al menos 10,000 QOR (`min_stake_for_rollup`); el stake se deposita en garantía (escrow) cuando se crea el rollup |
| **Quema de creación** | El 1 % del stake aportado se quema de forma permanente en la creación (una creación que no pueda aplicar la quema es rechazada); el resto queda en garantía y se devuelve cuando el rollup se detiene |
| **Stake de registro de capa** | La creación también registra la capa del rollup en el módulo multilayer, lo que bloquea otros **1,000 QOR** (`min_sidechain_stake`) del creador, que se devuelven cuando la capa se desmantela al detener el rollup. Si la capa no puede registrarse (saldo insuficiente, o se alcanzó el límite de 10 sidechains de multilayer), el rollup se crea de todos modos pero no tiene capa, por lo que sus lotes no pueden anclarse |
| **ID del rollup** | Usa de 3 a 64 caracteres: letras minúsculas, dígitos, `.`, `_` y `-`, empezando por una letra o un dígito. Las versiones de cadena más recientes imponen esta regla, así que úsala desde el principio |
| **Cuenta** | Una cuenta de QoreChain con fondos y con una clave post-cuántica registrada, con saldo suficiente para el stake, el stake de la capa y las comisiones de transacción |

Consulta los parámetros vivos del módulo para conocer el stake mínimo y la tasa de quema actuales antes de desplegar:

```bash
qorechaind query rdk config
```

---

## Desplegar mediante el Dashboard (Tools → Rollups)

El Dashboard ofrece un formulario **Deploy a Rollup** en **Tools → Rollups**. Es un **formulario de solicitud**: al enviarlo se registra una solicitud de aprovisionamiento para tu cuenta, revisada por **The Qore Trust**, y una solicitud nueva muestra el estado **provisioning**. **No** difunde una transacción `create-rollup` on-chain — para registrar un rollup on-chain, usa la CLI que sigue.

### Pasos

1. **Inicia sesión.** El formulario requiere una sesión autenticada para enviar una solicitud y para listar tus solicitudes existentes.
2. **Ponle nombre a tu rollup.** Introduce un nombre de rollup (2–41 caracteres: letras, números, espacios, guiones o guiones bajos).
3. **Elige una máquina virtual.** El registro on-chain almacena una etiqueta de VM. Tu rollup se ejecuta off-chain en su propio runtime; la elección no se ejecuta en los propios carriles EVM, CosmWasm o SVM de QoreChain:
   * **EVM** — contratos en Solidity / Vyper con todas las herramientas de Ethereum (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — contratos inteligentes en Rust sobre el runtime del Cosmos SDK, con IBC nativo
   * **SVM** — la Solana Virtual Machine, para aplicaciones de alto rendimiento con ejecución en paralelo
4. **Elige una capa de disponibilidad de datos.** Dónde publica tu rollup los datos de transacciones para que cualquiera pueda reconstruir el estado: **QoreChain DA**, **Celestia** o **EigenDA**. Ten en cuenta que EigenDA es una opción a nivel de Dashboard, mientras que los backends de DA on-chain de `x/rdk` son native, Celestia o ambos — consulta [Disponibilidad de datos](/rollups/data-availability).
5. **Define un token de gas.** El token que se usa para pagar la ejecución en tu rollup. Por defecto es **QOR**; introduce un símbolo personalizado para usar tu propio token nativo.
6. **Elige un secuenciador.** Quién ordena las transacciones antes de la liquidación: **Shared sequencer** (el conjunto compartido de QoreChain), **Dedicated (single)** (ejecuta tu propio secuenciador único) o **Decentralized** (un conjunto de secuenciadores sin permisos).
7. **Elige un destino de liquidación.** Dónde ancla el rollup sus raíces de estado y pruebas de validez: **QoreChain mainnet** o **Ethereum**.
8. **Envía la solicitud.** El aprovisionamiento lo revisa **The Qore Trust**, por lo que una solicitud recién enviada aparece con estado **provisioning** hasta que la revisión termina.

Las solicitudes que envíes aparecen en la lista **Your rollups** con su VM, capa de DA, token de gas, secuenciador, destino de liquidación y estado actual.

:::note
Las opciones del formulario (máquina virtual, capa de disponibilidad de datos, token de gas, secuenciador, destino de liquidación) describen lo que estás solicitando; son más amplias que lo que el módulo on-chain `x/rdk` admite actualmente. On-chain, la disponibilidad de datos es `native` (Celestia no está activo), y la secuenciación la realiza el creador del rollup o una dirección de secuenciador configurada. Consulta [Disponibilidad de datos](/rollups/data-availability).
:::

---

## Desplegar mediante la CLI

La CLI crea el rollup directamente on-chain. `create-rollup` toma tres argumentos posicionales — el ID del rollup, un perfil y el importe del stake (en `uqor`) — más un flag opcional `--vm`.

:::tip
A partir de la versión de cadena **v3.1.74**, `create-rollup` **aplica automáticamente el preset del perfil elegido** — el modo de liquidación, el secuenciador, la DA, el modelo de gas y la VM se toman todos del preset. Ya no necesitas configurarlos a mano (antes el mensaje fijaba en el código una configuración soberana). El flag `--vm` ahora **está vacío por defecto**, de modo que se aplica la VM del perfil salvo que la sobreescribas explícitamente.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json
```

**Ejemplo** — crea un rollup a partir del preset `defi` (la liquidación, el secuenciador, la DA y la VM vienen todos del preset; `defi` se resuelve en liquidación zk sobre la EVM). Construye la transacción sin firmar y, después, añade la cofirma post-cuántica y difúndela:

```bash
# 1. Build the unsigned transaction (10,000 QOR stake)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json

# 2. Cosign with your post-quantum key and broadcast
qorechaind tx pqc cosign create-rollup.json \
  --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

Un perfil ZK como `defi` se acepta en la creación, pero un rollup creado de este modo no lleva una verifying key, por lo que sus lotes ZK todavía no pueden finalizarse (consulta [ZK / STARK y retiros](/rollups/zk-stark-withdrawals)).

**Flags:**

| Flag | Por defecto | Descripción |
| ---- | ------- | ----------- |
| `--vm` | *(vacío — usa la VM del perfil)* | Sobreescribe el tipo de VM del rollup: `evm`, `cosmwasm`, `svm` o `custom`. Déjalo sin definir para aplicar la VM del preset. (En los clientes del RDK el runtime Wasm es el tipo de VM **`native`** — QoreChain Native — con `cosmwasm` mantenido como alias heredado; `cosmwasm` es el valor on-wire, que es lo que acepta este flag a nivel de cadena.) |

:::note La etiqueta de VM son metadatos
`--vm` registra qué runtime usa tu rollup. La cadena anfitriona solo liquida el rollup; no ejecuta sus contratos. La subida de CosmWasm de la propia cadena anfitriona está actualmente cerrada y su carril de transacciones SVM está deshabilitado en toda la red, lo que no afecta a la liquidación de un rollup off-chain pero sí significa que no puedes desplegar contratos para un rollup en esos carriles de la cadena anfitriona.
:::

El argumento `[profile]` selecciona una configuración preset que se aplica automáticamente — consulta **[Perfiles preconfigurados](/rollups/preset-profiles)**. El `[stake-amount]` es el bono en `uqor`; la quema de creación es el 1 % del mismo.

### Inspecciona lo que has desplegado

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Desplegar con el RDK de TypeScript (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

El Rollup Development Kit se distribuye como dos paquetes públicos de npm para el mismo módulo on-chain `x/rdk` que la CLI. Hoy son más útiles para construir y validar configuraciones y para leer el estado; consulta la advertencia de firma más abajo antes de fiarte de ellos para enviar transacciones:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.4`) — el SDK de TypeScript: un constructor de configuración con perfiles preset, helpers de transacción para los ciclos de vida del rollup y de los lotes de liquidación, DA nativa, clientes de lectura tipados y las incorporaciones de la v0.4 — recibos de liquidación con seguridad cuántica, el QCAI Rollup Copilot, helpers de calldata cross-VM y el watchtower.
* **`create-qorechain-rollup`** (`v0.4.4`) — un generador que clona una plantilla inicial ejecutable por perfil (incluida la plantilla `multivm-rollup`).

Están publicados en npm. El repositorio también incluye una CLI de operador publicada, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.4`), con los comandos `doctor`, `create`, `status`, `watch`, `params`, `suggest`, de ciclo de vida (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` y `faucet`, además de los comandos `receipt`, `advise` y `watchtower` de la v0.4.

Aspectos destacados desde el lanzamiento inicial v0.4.0:

* **v0.4.2 — funciona contra la red en vivo sin configuración adicional.** Los presets `mainnet` y `testnet` ahora incluyen los endpoints públicos de `qore.host` (REST en `api.qore.host` / `api-testnet.qore.host`), de modo que `createRdkClient({ network })` alcanza la cadena sin `endpoints` manuales — sobreescríbelos solo para apuntar a tu propio nodo. La misma versión renombró el identificador de la VM de rollup Wasm a **`native`** (QoreChain Native); `cosmwasm` sigue siendo un alias heredado aceptado, y ambos se mapean a `cosmwasm` on-wire — la cadena, el explorador y el Dashboard no cambian.
* **v0.4.3 — actualización de dependencias por la corrección de la codificación de la firma híbrida del SDK.** El propio cliente de transacciones del RDK sigue firmando solo en modo clásico (ver la advertencia más abajo).
* **v0.4.4 — sigue a `@qorechain/sdk` `^0.7.0`**, la versión del SDK para los carriles de autenticadores de la cadena **v3.1.85**, de modo que esas capacidades llegan directamente a los usuarios de TypeScript del RDK a través del SDK. Sin cambios en la API del RDK.

:::caution Firma con los clientes publicados
Ambas redes exigen una firma híbrida (secp256k1 + ML-DSA-87) en toda transacción del carril nativo. El paquete npm publicado actualmente (`@qorechain/rdk` 0.4.4) firma mediante un cliente solo clásico, por lo que puede **leer** el estado de la cadena pero no consigue que se acepte una transacción. Para enviar transacciones hoy, construye y firma con la CLI (`--generate-only`, y después `qorechaind tx pqc cosign`) o con la firma híbrida de [`@qorechain/sdk`](/sdk/overview). Los clientes del RDK de Python, Go, Rust y Java también firman solo en modo clásico y **no son adecuados para transacciones** en estas redes. Comprueba la versión que instalas; las versiones que añadan firma híbrida a los clientes del RDK se indicarán aquí.
:::

:::note Las lecturas necesitan las rutas REST del RDK
Los helpers de lectura de TypeScript (`rdk.params()`, `rdk.rest.getRollup()`) llaman a rutas REST `/qorechain/rdk/v1/…`, que los endpoints públicos de mainnet no sirven actualmente. En mainnet usa `qorechaind query rdk …` (gRPC).
:::

#### Clientes de Python, Go, Rust y Java

Junto al paquete de TypeScript, el RDK ofrece clientes completos de **Python**, **Go**, **Rust** y **Java** que reflejan la superficie de TypeScript: el constructor de configuración con validación, los cinco perfiles preset, utilidades de denominación/economía/bech32, helpers de Merkle binario y de pruebas de retiro, manifiestos de rollup, clientes de lectura REST y JSON-RPC `qor_`, comprobaciones de preflight/salud, cuentas (mnemónico → dirección `qor`) y firma clásica de transacciones + difusión (`SIGN_MODE_DIRECT`, no aceptado en las redes de firma híbrida — consulta la advertencia de arriba). Todos están verificados contra vectores dorados compartidos entre lenguajes y están **publicados** en sus registros:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.4
```

```python
import qorrdk
```

Versiones publicadas actuales: Python `qorechain-rdk` **0.5.0** (PyPI, se importa como `qorrdk`), módulo de Go `github.com/qorechain/qorechain-rdk/packages/go` (**v0.5.0**), Rust `qorechain-rdk` **0.4.4** (crates.io) y Java `io.github.qorechain:qorechain-rdk` **0.4.4** (Maven Central). Estos clientes leen el estado de la cadena; no producen la firma híbrida que exigen las redes (consulta la advertencia de arriba).

:::note
El RDK de TypeScript y sus plantillas apuntan por defecto a la testnet **`qorechain-diana`**, y desde la v0.4.2 los presets alcanzan los endpoints públicos en vivo sin configuración adicional. Fija las versiones y valida en la testnet antes de mainnet.
:::

### Genera un proyecto con `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

Cada perfil tiene una plantilla inicial correspondiente (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Genera una con cualquiera de estas dos formas:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Para uso no interactivo / CI, pasa la plantilla y la red de forma explícita:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

El generador imprime el coste documentado de stake y quema de creación, y los siguientes pasos para crear tu rollup y leer su estado.

:::caution Comprueba la versión del RDK que instala la plantilla
Las plantillas fijan actualmente `@qorechain/rdk` a la serie 0.2. Después de generar el proyecto, ejecuta `npm install @qorechain/rdk@latest` para obtener los presets de endpoints públicos de `qore.host` y los clientes de lectura actuales. El script `submit-batch` de la plantilla es solo un flujo de referencia: envía raíces ilustrativas y una prueba de ejemplo, y no se espera que finalice un lote en una red en vivo.
:::

### Construye una configuración de rollup desde código

Construye una configuración a partir de un preset, lee de la cadena el stake y la tasa de quema en vivo y produce el mensaje de creación. El constructor de configuración impone la matriz de compatibilidad liquidación → prueba en `validate()` / `build()`. Envía los valores resultantes con la CLI de arriba (o con un cliente que firme en modo híbrido) — consulta la advertencia de firma.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read: it works where the RDK REST routes are served and
// is refused (HTTP 501) on mainnet today — use `qorechaind query rdk config` there.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// The values to pass to `qorechaind tx rdk create-rollup`.
const msg = config.toCreateMsg("<your qor address>", { stakeAmount: params.minStakeForRollup });
console.log(msg.rollupId, msg.profile, msg.vmType, msg.stakeAmount);
```

¿No sabes qué perfil encaja? `rdk.suggestProfile(...)` está pensado para devolver una recomendación asistida por QCAI; en los endpoints públicos actuales siempre devuelve el respaldo `defi` (`source: "fallback"`), así que elige a partir de la [tabla de perfiles](/rollups/preset-profiles).

### Lee el estado desde código

El cliente REST tipado no requiere firmante y funciona donde se sirven las rutas REST del RDK (hoy no en mainnet):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

Para los lotes, usa `qorechaind query rdk batch [rollup-id]` (más abajo).

---

## Gestión del ciclo de vida

Un rollup pasa por los estados `pending`, `active`, `paused` y `stopped`; un rollup nuevo empieza `active` de inmediato. Solo el creador puede pausarlo, reanudarlo o detenerlo (se impone desde la versión de cadena v3.2.0). Cada comando de abajo sigue el mismo patrón de dos pasos que la creación: genera la transacción sin firmar y luego cofírmala.

### Pausar

Detén temporalmente el rollup. El estado se conserva y el rollup puede reanudarse. Se requiere una cadena de texto con el motivo.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > pause.json
qorechaind tx pqc cosign pause.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Reanudar

Reanuda un rollup pausado previamente.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > resume.json
qorechaind tx pqc cosign resume.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Detener

Desmantela permanentemente el rollup y libera su stake. El QOR en stake — menos la quema única de creación — se devuelve al creador. El stake de registro de capa de 1,000 QOR se devuelve por separado cuando se desmantela la capa del rollup.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > stop.json
qorechaind tx pqc cosign stop.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

:::danger
Detener un rollup es permanente. El rollup no puede reiniciarse una vez detenido.
:::

---

## Comandos del operador: lotes y desafíos

Los operadores de rollups envían lotes de liquidación, y los desafiantes pueden disputar los lotes optimistas. Estos comandos sustentan la capa de liquidación descrita en **[Visión general de rollups](/rollups/overview)** y **[ZK / STARK y retiros](/rollups/zk-stark-withdrawals)**.

### Quién puede enviar y en qué orden

* **Solo la dirección de secuenciador configurada del rollup — o, cuando no hay ninguna configurada (todos los presets), su creador — puede enviar lotes.** La secuenciación based y la compartida todavía no admiten conjuntos de proponentes ni listas: hoy son etiquetas, y envía el creador.
* Los lotes forman una cadena: el primer lote tiene el índice `0`; cada lote posterior debe usar el siguiente índice y llevar la raíz de estado del lote anterior como `prev_state_root`.
* Un lote que lleva un hash de datos en un rollup `native` o `both` es rechazado a menos que ya esté almacenado un blob coincidente (consulta [Disponibilidad de datos](/rollups/data-availability)). Un lote sin hash de datos no se comprueba.
* Un rollup `zk` debe adjuntar una prueba, y la prueba debe verificarse (consulta [ZK / STARK y retiros](/rollups/zk-stark-withdrawals)).

### Enviar un lote

Envía un lote de liquidación para un rollup. Toma el ID del rollup, un índice de lote y una raíz de estado codificada en hexadecimal.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

El comando de la CLI toma solo estos tres argumentos posicionales, por lo que solo puede enviar el **lote 0**; los lotes posteriores necesitan un cliente que pueda establecer `prev_state_root` (y, cuando se usan, `data_hash`, `withdrawals_root` y `tx_count`). Los lotes de un rollup se liquidan pero **no se anclan** a `x/multilayer` en mainnet hoy (consulta [Rollup Development Kit](/architecture/rollup-development-kit#state-anchoring)).

### Desafiar un lote (rollups optimistas) {#challenge-a-batch-optimistic-rollups}

Cualquier cuenta puede desafiar un lote `submitted` dentro de la ventana de desafío depositando un bono (el `challenge_bond` del rollup; 1,000 QOR para los presets `nft` y `custom`) y una prueba de fraude. Toma el ID del rollup y el índice del lote; pasa la prueba de fraude con `--proof`:

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > challenge.json
qorechaind tx pqc cosign challenge.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| Flag | Descripción |
| ---- | ----------- |
| `--proof` | Prueba de fraude codificada en hexadecimal |

Un desafío **congela** el lote (`challenged`): no puede finalizarse. Entonces el **creador** del rollup lo resuelve con un mensaje de resolución de desafío (no expuesto como comando de CLI; usa un cliente). La cadena decide el resultado por sí misma verificando la prueba almacenada. Si se confirma el fraude, el lote pasa a `rejected`, el bono se devuelve y el desafiante recibe además un importe igual al bono, tomado del stake del rollup; si se desestima, el bono pasa al creador y el lote vuelve a `submitted`.

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
| `qorechaind query rdk suggest-profile [use-case]` | Imprime una referencia al RPC `qor_suggestRollupProfile`; los endpoints públicos no lo sirven, así que elige un perfil a partir de la tabla de [Perfiles preconfigurados](/rollups/preset-profiles) |

---

## Próximos pasos

* **[Disponibilidad de datos](/rollups/data-availability)** — backends de DA nativos, Celestia y redundantes.
* **[ZK / STARK y retiros](/rollups/zk-stark-withdrawals)** — verificación de pruebas y el flujo de retiro L2 → L1 vía `execute-withdrawal`.
