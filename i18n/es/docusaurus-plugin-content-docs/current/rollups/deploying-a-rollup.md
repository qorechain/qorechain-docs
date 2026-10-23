---
slug: /rollups/deploying-a-rollup
title: Desplegar un rollup
sidebar_label: Desplegar un rollup
sidebar_position: 3
---

# Desplegar un rollup

Puedes configurar un rollup específico de aplicación de tres maneras: a través del **Dashboard** (un formulario de solicitud, no una transacción on-chain), a través de la **CLI** de la cadena (`qorechaind`, con control total sobre la transacción on-chain) o con el **RDK de TypeScript** (`@qorechain/rdk` más el generador de plantillas `create-qorechain-rollup`), que cubre la configuración, las lecturas y, cuando le proporcionas una clave post-cuántica, las transacciones firmadas en modo híbrido (consulta [RDK 0.6.0: cambios y límites](#rdk-050-limits)). Esta página cubre las tres opciones, además del ciclo de vida del operador y los comandos de lotes.

:::caution Capacidad en fase temprana
Todavía no se ha creado ningún rollup en ninguna de las dos redes (comprobado el 23 de octubre de 2026). Los comandos siguientes usan la testnet **`qorechain-diana`** (EVM chain ID **9800**, versión de cadena **v3.2.4** desde el 19 de octubre de 2026). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**, en producción desde el 7 de junio de 2026) ejecuta la versión de cadena **v3.2.4** desde el 23 de octubre de 2026 (aplicada en la altura 3,742,566 por la propuesta de gobernanza 13); las versiones anteriores difieren en algunos detalles, que esta página marca como «desde v3.2.4». Valida cada despliegue primero en la testnet.
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
| **ID del rollup** | Usa de 3 a 64 caracteres: letras minúsculas, dígitos, `.`, `_` y `-`, empezando por una letra o un dígito. La cadena impone esta regla en ambas redes desde la v3.2.2 (la CLI la comprueba antes de construir la transacción), por lo que un ID que no la cumpla es rechazado |
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
3. **Elige una máquina virtual.** El registro on-chain almacena una etiqueta de VM. Tu rollup se ejecuta off-chain en su propio runtime; la elección no se ejecuta en los propios carriles EVM, QoreChain Native o SVM de QoreChain:
   * **EVM** — contratos en Solidity / Vyper con todas las herramientas de Ethereum (Hardhat, Foundry, MetaMask)
   * **QoreChain Native** — contratos inteligentes en Rust sobre el runtime del Cosmos SDK (el runtime CosmWasm), con IBC nativo
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
`--vm` registra qué runtime usa tu rollup. La cadena anfitriona solo liquida el rollup; no ejecuta sus contratos. La subida de QoreChain Native de la propia cadena anfitriona está actualmente cerrada y su carril de transacciones SVM está deshabilitado en toda la red, lo que no afecta a la liquidación de un rollup off-chain pero sí significa que no puedes desplegar contratos para un rollup en esos carriles de la cadena anfitriona.
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

El Rollup Development Kit se distribuye como dos paquetes públicos de npm para el mismo módulo on-chain `x/rdk` que la CLI. Todavía no existe ningún rollup en ninguna de las dos redes, así que ninguna vía de transacción del kit se ha ejercitado en un rollup en vivo; lee [RDK 0.6.0: cambios y límites](#rdk-050-limits) antes de fiarte de él para enviar transacciones:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.6.0`) — el SDK de TypeScript: un constructor de configuración con perfiles preset, helpers de transacción para los ciclos de vida del rollup y de los lotes de liquidación, DA nativa, clientes de lectura tipados, recibos de liquidación con seguridad cuántica, el QCAI Rollup Copilot, helpers de calldata cross-VM y el watchtower. Depende de `@qorechain/sdk` `^0.9.0` y de `@qorechain/evm` `^0.8.0`.
* **`create-qorechain-rollup`** (`v0.6.0`) — un generador que clona una plantilla inicial ejecutable por perfil (incluida la plantilla `multivm-rollup`).

Están publicados en npm. El repositorio también incluye una CLI de operador publicada, **`@qorechain/rdk-cli`** (`qorollup`, `v0.6.0`), con los comandos `doctor`, `create`, `status`, `watch`, `params`, `suggest`, de ciclo de vida (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` y `faucet`, además de los comandos `receipt`, `advise` y `watchtower`. Sus comandos de transacción firman solo en modo clásico (véanse los límites más abajo).

Aspectos destacados por versión:

* **v0.4.2 — funciona contra la red en vivo sin configuración adicional.** Los presets `mainnet` y `testnet` ahora incluyen los endpoints públicos de `qore.host` (REST en `api.qore.host` / `api-testnet.qore.host`), de modo que `createRdkClient({ network })` alcanza la cadena sin `endpoints` manuales — sobreescríbelos solo para apuntar a tu propio nodo. La misma versión renombró el identificador de la VM de rollup Wasm a **`native`** (QoreChain Native); `cosmwasm` sigue siendo un alias heredado aceptado, y ambos se mapean a `cosmwasm` on-wire — la cadena, el explorador y el Dashboard no cambian.
* **v0.4.3 — actualización de dependencias por la corrección de la codificación de la firma híbrida del SDK.** El propio cliente de transacciones del RDK seguía firmando solo en modo clásico.
* **v0.4.4 — sigue a `@qorechain/sdk` `^0.7.0`**, la versión del SDK para los carriles de autenticadores de la cadena **v3.1.85**. Sin cambios en la API del RDK.
* **v0.5.0 (18 de octubre de 2026)** — la verificación de recibos de liquidación comprueba contra el estado de la cadena y nunca da por válido un recibo a partir de sus propios campos; el cliente de transacciones de TypeScript firma en modo híbrido cuando se le pasa un `pqcKeypair`. Depende de `@qorechain/sdk` `^0.8.0`.
* **v0.6.0 (versión de GitHub del 20 de octubre de 2026; comprobada en todos los registros el 23 de octubre de 2026)** — la versión de compatibilidad para las versiones de cadena v3.2.2 a v3.2.4: lotes anclados, recibos de liquidación que pueden verificarse, ventanas de desafío medidas como las mide la cadena, un codificador que coincide con el formato cross-VM de la cadena, plantillas que firman en modo híbrido y `@qorechain/sdk` `^0.9.0`. Los detalles y lo que queda pendiente están más abajo.

**Versiones publicadas (comprobadas el 23 de octubre de 2026).** npm `@qorechain/rdk`, `@qorechain/rdk-cli` y `create-qorechain-rollup`: **0.6.0** (`latest`); PyPI `qorechain-rdk`: 0.6.0; crates.io `qorechain-rdk`: 0.6.0; Maven Central `io.github.qorechain:qorechain-rdk`: 0.6.0 (latest y release); módulo de Go `github.com/qorechain/qorechain-rdk/packages/go`: el proxy de módulos sirve `v0.6.0` y es lo que ahora resuelve `@latest`; fijar `@v0.6.0` de forma explícita sigue siendo lo más claro.

#### RDK 0.6.0: cambios y límites {#rdk-050-limits}

Esta sección indica qué hacen los paquetes publicados 0.6.0, comprobado contra el contenido de los paquetes y las notas de la versión de GitHub, y qué siguen sin poder hacer. Ninguno de estos puntos es un comportamiento de la cadena. Donde una frase dice «no probado en vivo», no existe ningún rollup en ninguna de las dos redes, así que la vía solo se ha comprobado contra el código y sin conexión.

**Qué cambió en la 0.6.0** (TypeScript, salvo que una línea indique otra cosa):

* **Firma.** `RdkClient.connectTx(signer, { pqcKeypair, rest })` firma en modo híbrido (secp256k1 + ML-DSA-87) cuando le pasas un par de claves; sin él firma solo en modo clásico y las redes rechazan la transacción. `signer` debe ser un `OfflineDirectSigner`, y la comisión debe ser explícita (una `fee`, o un `gasPrice` al conectar). Los nuevos helpers `resolvePqcKeypair` y `pqcKeypairFromEnv` derivan a partir de un mnemónico tanto la clave ML-DSA-87 canónica como la heredada y usan la que la cuenta tenga registrada on-chain; se niegan, en lugar de adivinar, cuando la cuenta tiene una clave distinta. `QORE_PQC_SEED_HEX` aporta una semilla para un operador que firma con una clave privada en bruto. El kit ahora depende de `@qorechain/sdk` `^0.9.0`, así que una instalación nueva contiene una sola copia del SDK (0.9.0); con la 0.5.0, npm instalaba el SDK 0.8.3 anidado bajo el kit.
* **Lotes anclados.** `MsgSubmitBatch` lleva `anchor_signature` y `validator_set_hash`. `RdkTxClient.submitBatch` firma el ancla por sí mismo solo cuando el cliente firma en modo híbrido, tiene un endpoint REST y **es el creador del rollup** (la cadena comprueba el ancla contra la clave registrada del creador); en cualquier otro caso envía sin anclar, como antes. Pasa `anchor: "require"` para negarte en lugar de enviar sin anclar, `anchor: "off"` para no firmar nunca, o `anchorSignature` para enviar una firma que hayas obtenido tú mismo. `anchorSignBytesForBatch` construye los bytes v2 para un creador que firma fuera de banda, algo que necesita un rollup con un secuenciador distinto. No probado en vivo.
* **Recibos de liquidación.** La consulta de cuenta PQC usa la ruta en singular `/qorechain/pqc/v1/account/{address}` (la 0.5.0 usaba una ruta en plural que las redes no sirven). La verificación admite ambas formas de sign-bytes del ancla y elige una según la altura del ancla, nunca probando las dos: v1 por debajo del cambio de la v3.2.2, v2 a partir de él. El esquema de recibo v2 registra `chainId`; la verificación rechaza un recibo comprobado contra un nodo de otra cadena, e informa de `signBytesVersion` y de una comprobación `chainBinding`. Los recibos de versión 1 siguen verificándose. Consulta [Recibos de liquidación](/rollups/settlement-receipts).
* **Lecturas.** `getLatestBatch` llama a `/qorechain/rdk/v1/latest_batch/{rollup_id}` (la 0.5.0 llamaba a una forma que la cadena no sirve), y `listBatches` recorre todas las páginas (`listBatchesPage` lee una). `RollupView` incluye `escrowBalance` y, cuando el nodo los informa, `challengeWindowSec`, `challengeBond` y `proofSystem`; `BatchView` incluye `submittedTime`.
* **Ventanas de desafío.** `batchChallengeWindow` calcula la ventana de un lote como lo hace la cadena y la juzga contra la punta de la cadena (`getChainTip`), no contra el reloj local: segundos de tiempo de bloque para un lote que tiene un tiempo de envío registrado (la regla de la v3.2.4: la testnet desde la altura 8,337,253, la mainnet desde la altura 3,742,566), y `window / 6` bloques contados desde la altura de envío en caso contrario (la regla para los lotes enviados antes de la altura de la actualización). La comprobación de salud que hay detrás de `qorollup status` y el watchtower la usan (consulta [Watchtower](/rollups/watchtower)).
* **Cross-VM.** `encodeCrossVmCalldata` ahora codifica `executeCrossVMCall(uint8,string,bytes)`, el formato que decodifica el nodo, y recibe un `targetVm`. `isCrossVmPrecompileActive` lee la lista en vivo de precompiles activos (consulta [Multi-VM](/rollups/multi-vm)).
* **Reglas comprobadas antes de pagar una comisión.** `rollupIdError` comprueba la gramática del ID al validar una configuración y antes de que `createRollup` difunda; `withdrawalErrors` comprueba un retiro antes de que `executeWithdrawal` difunda.
* **Plantillas.** Las plantillas generadas se conectan mediante `pqcKeypairFromEnv`, así que sus scripts `create` y `submit-batch` firman en modo híbrido, y dependen de `@qorechain/rdk` `^0.6.0`. La plantilla `multivm-rollup` comprueba que el precompile esté activo y exige una respuesta no vacía del destino.
* **Python, Go, Rust y Java.** Las correcciones del lado de lectura anteriores (ruta PQC en singular, `latest_batch`, sign-bytes v2 del ancla, reglas de la ventana de desafío, comprobaciones de ID y de retiro) también están en los paquetes publicados de los otros cuatro lenguajes.
* **Cambios incompatibles.** `encodeCrossVmCalldata` recibe `targetVm`, y `CROSS_VM_DEFAULT_SIGNATURE` cambió. `RollupHealth` y `BatchDeadline` incluyen un `challengeWindow` en lugar del antiguo plazo basado en segundos.

**Límites que se mantienen en la 0.6.0:**

* **Solo el cliente de TypeScript firma en modo híbrido.** La CLI `qorollup` (sus comandos `create`, `pause`, `resume`, `stop` y `withdraw` se conectan sin clave post-cuántica) y los clientes de **Python, Go, Rust y Java** firman solo en modo clásico, que ambas redes rechazan en el carril nativo; sus README siguen diciéndolo. Sus constructores de mensajes no tienen ningún campo `anchor_signature` ni `validator_set_hash`. Para transacciones desde estos, construye y firma con la CLI de la cadena (`--generate-only`, y después `qorechaind tx pqc cosign`) o usa el cliente de TypeScript con un `pqcKeypair`.
* **No se ha ejercitado en vivo ninguna creación híbrida de un rollup,** porque no existe ningún rollup en ninguna de las dos redes. Lo mismo vale para los lotes anclados, los retiros y todo el flujo de recibos.
* **El anclaje necesita al creador.** Un lote se ancla en la misma transacción solo si la firma del creador va en ella. Si el secuenciador es otra dirección, el creador tiene que firmar los bytes v2 fuera de banda y el secuenciador envía el resultado.
* **El precompile cross-VM en `0x…0901` no tiene código** y no figura en la lista de precompiles activos en ninguna de las dos redes, así que una llamada desde un contrato sigue sin hacer nada (consulta [Multi-VM](/rollups/multi-vm)).
* **Duración de la ventana de desafío.** El kit lee la ventana propia de un rollup solo cuando el nodo la informa (el paquete lo documenta como v3.2.4 y posteriores, que ahora ejecutan ambas redes). En caso contrario usa la ventana por defecto del módulo; pasa `challengeWindowSecs` para un rollup que configuró la suya. Los helpers antiguos `challengeWindowDeadline` e `isChallengeWindowClosed` siguen exportándose y siguen recibiendo segundos, así que no les pases una altura de bloque.
* **Disponibilidad de datos.** `buildDaBlob` calcula el hash con SHA-256, mientras que el compromiso de blob de la cadena es SHAKE-256 (consulta [Disponibilidad de datos](/rollups/data-availability)).

**Versiones anteriores a la 0.6.0.** La 0.5.0 y las anteriores no deben usarse para recibos de liquidación, el watchtower ni el calldata cross-VM: la 0.5.0 buscaba la clave del creador en una ruta que las redes no sirven (así que la verificación de recibos fallaba en modo cerrado con todos los recibos genuinos), reconstruía solo el mensaje de ancla v1, leía una altura de bloque como una marca de tiempo (toda edad de lote y todo plazo de desafío eran erróneos, y el watchtower lanzaba de inmediato su alerta de plazo para cada lote), llamaba a una ruta de último lote que la cadena no sirve, leía solo los primeros 50 lotes, codificaba una función que el precompile no decodifica y distribuía plantillas que firmaban solo en modo clásico. La 0.4.x no tenía firma híbrida en el cliente de transacciones.

#### Clientes de Python, Go, Rust y Java

Junto al paquete de TypeScript, el RDK ofrece clientes completos de **Python**, **Go**, **Rust** y **Java** que reflejan la superficie de TypeScript: el constructor de configuración con validación, los cinco perfiles preset, utilidades de denominación/economía/bech32, helpers de Merkle binario y de pruebas de retiro, manifiestos de rollup, clientes de lectura REST y JSON-RPC `qor_`, comprobaciones de preflight/salud, cuentas (mnemónico → dirección `qor`) y firma clásica de transacciones + difusión (`SIGN_MODE_DIRECT`, no aceptado en las redes de firma híbrida — consulta [RDK 0.6.0: cambios y límites](#rdk-050-limits)). Todos están verificados contra vectores dorados compartidos entre lenguajes y están **publicados** en sus registros:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go (pin the version: the proxy's @latest still answered v0.5.0 when checked)
go get github.com/qorechain/qorechain-rdk/packages/go@v0.6.0

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.6.0
```

```python
import qorrdk
```

Versiones publicadas actuales, todas **0.6.0** (comprobadas el 23 de octubre de 2026): Python `qorechain-rdk` (PyPI, se importa como `qorrdk`), módulo de Go `github.com/qorechain/qorechain-rdk/packages/go` (`v0.6.0`), Rust `qorechain-rdk` (crates.io) y Java `io.github.qorechain:qorechain-rdk` (Maven Central). Estos clientes leen el estado de la cadena; siguen sin producir la firma híbrida que exigen las redes, y sus constructores de mensajes no incluyen campos de ancla (consulta [RDK 0.6.0: cambios y límites](#rdk-050-limits)).

:::note
El RDK de TypeScript y sus plantillas apuntan por defecto a la testnet **`qorechain-diana`**, y los presets alcanzan los endpoints públicos en vivo sin configuración adicional. Fija las versiones y valida en la testnet antes de mainnet.
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

:::caution Qué pueden hacer los scripts generados
Las plantillas de `create-qorechain-rollup` 0.6.0 dependen de `@qorechain/rdk` `^0.6.0`. Sus scripts `create` y `submit-batch` se conectan mediante `connectOperator()` en `src/signer.ts`, que resuelve tu clave post-cuántica a partir de `QORE_MNEMONIC` (o de `QORE_PQC_SEED_HEX` cuando firmas con `QORE_OPERATOR_PRIVATE_KEY_HEX`), la comprueba contra la cadena y firma en modo híbrido; si no se define ninguna de las dos, el script avisa y firma solo en modo clásico, que ambas redes rechazan. No se ha creado ningún rollup a través de una plantilla en una red en vivo, así que esta vía no está probada en vivo. El script `submit-batch` de la plantilla es solo un flujo de referencia: envía raíces ilustrativas y una prueba de ejemplo, y no se espera que finalice un lote en una red en vivo.
:::

### Construye una configuración de rollup desde código

Construye una configuración a partir de un preset, lee de la cadena el stake y la tasa de quema en vivo y produce el mensaje de creación. El constructor de configuración impone la matriz de compatibilidad liquidación → prueba en `validate()` / `build()`. Envía los valores resultantes con la CLI de arriba, o con el cliente de TypeScript al que se le pasa un `pqcKeypair` — consulta [RDK 0.6.0: cambios y límites](#rdk-050-limits).

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read of /qorechain/rdk/v1/params, served on both networks.
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

El cliente REST tipado no requiere firmante y lee ambas redes:

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

Para los lotes, usa `rdk.rest.getBatch(rollupId, index)` o `qorechaind query rdk batch [rollup-id]` (más abajo); desde la 0.6.0, `getLatestBatch` y `listBatches` leen la ruta `latest_batch` de la cadena y todas las páginas de la lista de lotes (consulta [RDK 0.6.0: cambios y límites](#rdk-050-limits)).

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

Desmantela permanentemente el rollup y libera su stake. El QOR en stake — menos la quema única de creación y menos cualquier cantidad ya pagada desde la garantía del rollup por retiros o recompensas de pruebas de fraude — se devuelve al creador: desde la v3.2.3, un libro de garantía por rollup registra lo que cada rollup conserva todavía, `stop-rollup` reembolsa exactamente ese saldo, y un rollup detenido no paga más retiros. El stake de registro de capa de 1,000 QOR se devuelve por separado cuando se desmantela la capa del rollup.

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

### Enviar un lote {#submit-a-batch}

Envía un lote de liquidación para un rollup. Toma el ID del rollup, un índice de lote y una raíz de estado codificada en hexadecimal. Para cada lote posterior al primero, pasa la raíz de estado del lote anterior como `--prev-state-root`.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --prev-state-root <previous-state-root-hex> --tx-count 120 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| Flag | Descripción |
| ---- | ----------- |
| `--prev-state-root` | Raíz de estado hexadecimal desde la que parte el lote (obligatoria para todo lote posterior al índice `0`) |
| `--tx-count` | Número de transacciones del rollup en el lote |
| `--data-hash` | Hash hexadecimal de los datos del lote publicados como blob de DA (déjalo vacío hoy: no hay forma de publicar un blob, consulta [Disponibilidad de datos](/rollups/data-availability)) |
| `--withdrawals-root` | Raíz de Merkle hexadecimal de los retiros L2 → L1 del lote (consulta [ZK / STARK y retiros](/rollups/zk-stark-withdrawals)) |
| `--anchor-signature` | Firma ML-DSA-87 hexadecimal del **creador** del rollup sobre los bytes de firma de ancla v2 (desde la v3.2.2); el lote se ancla entonces en `x/multilayer` en la misma transacción, y un ancla rechazada rechaza el lote |
| `--validator-set-hash` | Compromiso hexadecimal del conjunto de validadores que lleva el ancla y que cubre la firma |

Sin `--anchor-signature` el lote se liquida **sin anclar**. Para anclar un lote, imprime los bytes a firmar, fírmalos con la clave post-cuántica registrada del creador y pasa la firma (los valores de `--tx-count` y `--validator-set-hash` deben coincidir con los que envíes):

```bash
qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex] \
  --chain-id qorechain-diana --tx-count 120
```

`layer-id` es el ID de capa del rollup (el ID del rollup en los rollups creados por el RDK). Desde TypeScript, `RdkTxClient.submitBatch` de `@qorechain/rdk` 0.6.0 firma el ancla por ti cuando el cliente firma en modo híbrido y es el creador del rollup, y `anchorSignBytesForBatch` da a un creador los bytes que firmar fuera de banda (consulta [RDK 0.6.0: cambios y límites](#rdk-050-limits)). El `--proof` ZK de un rollup `zk` no tiene hoy ningún flag de CLI, y el mensaje de resolución de desafío no es un comando de CLI: usa un cliente. Consulta [Recibos de liquidación](/rollups/settlement-receipts) para saber qué prueba y qué no prueba un ancla. Todavía no existe ningún rollup, capa ni ancla en ninguna de las dos redes.

### Desafiar un lote (rollups optimistas) {#challenge-a-batch-optimistic-rollups}

Cualquier cuenta puede desafiar un lote `submitted` dentro de la ventana de desafío (100,800 bloques por defecto para un lote enviado en mainnet antes de la altura 3,742,566; desde la v3.2.4, una ventana en segundos de tiempo de bloque para los lotes nuevos: en la testnet desde la altura 8,337,253, en mainnet desde la altura 3,742,566) depositando un bono (el `challenge_bond` del rollup; 1,000 QOR para los presets `nft` y `custom`) y una prueba de fraude. Toma el ID del rollup y el índice del lote; pasa la prueba de fraude con `--proof`:

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

# A page of batches in index order (--limit up to 100, default 50)
qorechaind query rdk batches [rollup-id] --start 0 --limit 50
```

---

## Consultas

| Comando | Propósito |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Detalles de un rollup específico |
| `qorechaind query rdk list-rollups` | Todos los rollups registrados |
| `qorechaind query rdk batch [rollup-id]` | Último lote de liquidación (o `--index`) |
| `qorechaind query rdk batches [rollup-id]` | Una página de lotes en orden de índice (`--start`, `--limit`) |
| `qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex]` | Los bytes de firma de ancla v2 de un lote (offline) |
| `qorechaind query rdk config` | Parámetros del módulo RDK |
| `qorechaind query rdk suggest-profile [use-case]` | Imprime una referencia al RPC `qor_suggestRollupProfile`; los endpoints públicos no lo sirven, así que elige un perfil a partir de la tabla de [Perfiles preconfigurados](/rollups/preset-profiles) |

---

## Próximos pasos

* **[Disponibilidad de datos](/rollups/data-availability)** — backends de DA nativos, Celestia y redundantes.
* **[ZK / STARK y retiros](/rollups/zk-stark-withdrawals)** — verificación de pruebas y el flujo de retiro L2 → L1 vía `execute-withdrawal`.
