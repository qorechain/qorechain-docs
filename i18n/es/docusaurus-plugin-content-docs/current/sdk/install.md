---
slug: /sdk/install
title: Instalación
sidebar_label: Instalación
sidebar_position: 2
---

# Instalación

Instala el SDK para tu lenguaje. El núcleo TypeScript (`@qorechain/sdk`), los
adaptadores EVM y SVM (`@qorechain/evm`, `@qorechain/svm`), el kit de React
(`@qorechain/react`) y los clientes de Python, Go, Rust y Java están todos
**publicados** en sus registros con paridad completa con la cadena nativa
(mensajes tipados, consultas, el ciclo de vida de las transacciones,
transacciones PQC híbridas y suscripciones WebSocket). La línea de versiones
actual es la **0.9**, publicada el 21 de octubre de 2026 (comprobada contra cada
registro ese mismo día):

| Registro | Paquete | Versión |
| --- | --- | --- |
| npm | `@qorechain/sdk`, `@qorechain/react`, `create-qorechain-dapp` | 0.9.0 |
| PyPI | `qorechain-sdk` (import `qorsdk`) | 0.9.0 |
| crates.io | `qorechain-sdk` (import `qorechain`) | 0.9.0 |
| Proxy de módulos de Go | `github.com/qorechain/qorechain-sdk/packages/go` | v0.9.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.9.1 (actualización solo de Java de su dependencia Bouncy Castle, sin cambios de API; los demás lenguajes siguen en la 0.9.0) |

Elige tu lenguaje a continuación.

## Notas de actualización {#upgrade}

:::danger Usa el SDK 0.8.1 o posterior en las redes en producción
Ambas redes públicas verifican la forma de **sign-bytes híbridos v2** (con etiqueta
de dominio y vinculada al chain id) y rechazan la forma antigua con el código `pqc` 21.
Todas las versiones del SDK anteriores a la **0.8.0** firman la forma antigua, y la **0.8.0**
busca el cambio bajo uno solo de los dos nombres de actualización que usaron las redes
(mainnet lo registró como `v3.2.0`, la testnet como `v3.1.98` y más tarde `v3.2.0`), por lo
que firma la forma equivocada en mainnet. Usa la **0.9.0** (o al menos la **0.8.1**) en todos los
lenguajes; se necesita la **0.8.2 o posterior** para abrir una
[ventana de autorización EVM](/sdk/guides/evm#evm-window). Los constructores
híbridos aceptan una opción `signBytesVersion` (`"auto"` | `"v1"` | `"v2"`); `"auto"`
consulta a la red y por tanto necesita el endpoint REST (`rest`) en
`qorechain-vladi` / `qorechain-diana`: lanza un error en lugar de adivinar. Consulta
[¿Qué forma de sign-bytes?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
La forma no cambió en la v3.2.3 ni en la v3.2.4 de la cadena (v3.2.4 se ejecuta en la testnet desde el 19 de octubre de 2026 y en la mainnet desde el 23 de octubre de 2026): `"auto"`
se resuelve en v2 en ambas redes.
:::

## Qué añade la 0.9.0 {#whats-new-090}

El SDK 0.9.0 es la versión de cliente para la cadena **v3.2.2** y **v3.2.3** (mainnet
las aplicó en las alturas 3,556,788 y 3,662,051; ambas redes ejecutan ahora v3.2.4: la testnet desde el 19 de octubre de 2026, mainnet desde el 23 de octubre de 2026 en la altura 3,742,566). El
formato de firma, las direcciones, los decimales, los memos y las comisiones no
cambiaron, así que la forma de sign-bytes híbridos v2 que firman la 0.8.1 y las
posteriores sigue siendo la correcta. Lo nuevo:

| Área | En la 0.9.0 |
| --- | --- |
| `TxClient` híbrido (TypeScript) | Pasa el keypair de la cuenta: `client.connectTx(signer, { pqcKeypair })` o `TxClient.connect({ …, pqcKeypair, rest })`. Entonces cada transacción se firma de forma híbrida y `fee: "auto"` simula la propia transacción híbrida; un registro de clave por sí solo sigue siendo clásico (la vía de arranque de la cadena). `bankSend` y los clientes de rollup, multilayer y cross-VM del SDK lo usan. Sin un keypair no cambia nada |
| Clave PQC recuperable | `derivePqcCanonical(address, mnemonic)` y sus equivalentes en cada lenguaje (consulta [A prueba de computación cuántica](/sdk/guides/quantum-safe#canonical-derivation)) |
| `ensurePqcRegistered` | Lee primero el estado de la clave por REST (`rest`), se niega a registrar cuando no puede saberlo, lanza `PqcKeyMismatchError` cuando la cuenta ya tiene una clave distinta y trata el rechazo «ya registrada» de la cadena como un éxito. Desde la v3.2.3 de la cadena firma y adjunta por sí mismo la **prueba de posesión**; antes de la v3.2.3 deja el campo vacío |
| Ventanas EVM con alcance | `openEvmWindowMsg` acepta `nativeOnly` y `allowedTargets` (como máximo 16, sin duplicados); `fetchEvmWindow` lee ambos de vuelta (consulta la [guía de EVM](/sdk/guides/evm#evm-window)) |
| Consentimiento EIP-7702 | `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`, `classifyEvmDelegationRejection` |
| Integridad de claves | Los constructores de registro rechazan `classical_only`, una clave vacía y una clave ML-DSA-87 degenerada, que la cadena rechaza desde la v3.2.3. Se exportan `signProofOfPossession` / `verifyProofOfPossession`; `migratePqcKeyHybrid` envía el `MsgMigratePQCKey` con firma híbrida que las cuentas con clave necesitan desde la v3.2.3 |
| Digest v2 de cuenta abstracta | `evmAuthSignBytesV2` (vincula el límite de gas de la llamada) y `resolveEvmAuthDigestVersion`. El módulo `abstractaccount` está desactivado en ambas redes, así que esto es solo de referencia |
| Detección de actualizaciones | `isUpgradeApplied`, `requireUpgradeApplied`: los campos opcionales nuevos solo se establecen después de que `applied_plan` informe de la versión, porque un nodo que no ha aplicado una versión rechaza la transacción completa cuando se establece uno de los campos nuevos de esa versión |
| Decodificación de errores | Un fallo dentro de un bloque conserva su codespace (por ejemplo `pqc` 231, no `sdk_231`); se decodifican `rate_limited` y los códigos de delegación; `decodeTxError` lee el log o el mensaje de un error lanzado |
| Reglas de gasto | `validateSpendingRules` se ejecuta en los constructores de `MsgUpdateSpendingRules` y rechaza una regla que no limita nada |
| Correcciones | La ruta de cuenta PQC es la singular `/qorechain/pqc/v1/account/{address}` en todos los SDK (y en `client.rest.getPqcAccount`, `isPqcRegistered` y `getPqcStatus` cuando se les da el cliente compuesto); el `VERSION` exportado coincide con el paquete; los clientes de Go y Rust creados por el SDK agotan el tiempo de espera en lugar de quedarse colgados; las plantillas de `create-qorechain-dapp` dependen de la versión con la que se distribuyen |

La derivación PQC heredada para claves nuevas (`derivePqcLegacy`, `"bridge"`) está
obsoleta: no está vinculada a la cuenta, así que un mismo mnemónico daría una misma
clave a todas las cuentas. Los helpers de rotación la rechazan como clave **nueva**;
recuperar una clave heredada existente o rotarla hacia otra sigue funcionando.

## Versiones anteriores a la 0.9.0 {#before-090}

Si estás en la 0.8.x, sigue firmando la forma que verifican ambas redes y funciona en
mainnet y en la testnet (ambas en v3.2.4). Estos son los límites que elimina la
0.9.0, y algunos cuestan una comisión si no se conocen:

| Versión anterior a la 0.9.0 | Qué hacer en su lugar |
| --- | --- |
| Sin constructores de prueba de posesión, de ventana con alcance ni de consentimiento EIP-7702 | Usa `qorechaind tx pqc register-key-v2 … --pqc-key <name>`, `open-evm-window --native-only` / `--allowed-targets` y `authorize-evm-delegation` / `clear-evm-delegation` (consulta [Ventana de autorización EVM](/getting-started/first-transaction#evm-window), [Delegaciones EIP-7702](/architecture/post-quantum-security#eip-7702)) |
| `ensurePqcRegistered` sin un `status` difundía el registro sin comprobar, e informaba éxito cuando había registrada una clave distinta | Un segundo registro para una cuenta que ya tiene una clave es rechazado **después de cobrar la comisión**. Lee primero `GET /qorechain/pqc/v1/account/{address}` y pasa `status: { registered: found }` |
| `client.rest.getPqcAccount`, `isPqcRegistered`, `getPqcStatus` | Llamaban a una ruta `/accounts/` en plural o al espacio de nombres `qor_`, que los endpoints públicos no sirven (HTTP 501, `-32601`). Lee la ruta REST en singular indicada arriba |
| `TxClient` / `bankSend` y los clientes de rollup, multilayer y cross-VM firmaban solo de forma clásica | Las redes lo rechazan para cualquier cuenta que tenga una clave. Envía mediante `signAndBroadcastHybrid` |
| Las transacciones fallidas dentro de un bloque perdían su codespace | Lee la transacción desde `GET /cosmos/tx/v1beta1/txs/{hash}` |
| La constante exportada `VERSION` de la 0.8.3 informaba `0.8.0` | Lee la versión instalada desde `package.json` |
| `create-qorechain-dapp` 0.8.0 fijaba `@qorechain/sdk` / `@qorechain/evm` en `^0.3.0` (un caret sobre una versión 0.x se queda dentro de la 0.3) | Ejecuta `npm i @qorechain/sdk@latest` tras generar el proyecto |
| `@qorechain/react` 0.8.x dejaba ilegible el estado de la clave registrada en los endpoints públicos | Usa `@qorechain/react` 0.9.0 |

:::caution Correcciones anteriores
El SDK **0.6.1** corrigió un error crítico para el consenso: la extensión del
cuerpo de la transacción `/qorechain.pqc.v1.PQCHybridSignature` se serializaba
en JSON dentro de `Any.value` y era **rechazada por la cadena en CheckTx**. Las
transacciones híbridas (PQC + clásica) construidas con SDK ≤ 0.6.0 son
rechazadas en la cadena. La **0.8.0** eliminó las utilidades de cuenta basadas en firmas de wallet (consulta
[Cuentas y firma PQC](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

El paquete principal:

```bash
npm i @qorechain/sdk
```

Está dirigido a Node.js 20+ y se distribuye con ESM, CommonJS y definiciones de
tipos. Los ejemplos de transacciones híbridas de esta documentación también importan
`StargateClient` de `@cosmjs/stargate` (`npm i @cosmjs/stargate`).

### Adaptador EVM

`@qorechain/evm` es un adaptador ligero y con tipado seguro sobre
[viem](https://viem.sh). viem es una **peer dependency** — instálalo junto al
paquete:

```bash
npm i @qorechain/evm viem
```

Publicado en npm en la versión `0.8.0`.

### Adaptador SVM

`@qorechain/svm` es un adaptador ligero sobre
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), que es una
**peer dependency**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Publicado en npm en la versión `0.8.0`.

### Kit de React

`@qorechain/react` es la capa oficial de React sobre `@qorechain/sdk` — un
provider, hooks y los componentes `ConnectButton` / `QuantumSafeBadge`.
`react` (>=18) es una peer dependency:

```bash
npm i @qorechain/react
```

Publicado en npm en la versión `0.9.0`; depende de `@qorechain/sdk` `^0.9.0`. Consulta la
[guía del kit de React](/sdk/guides/react).

### Generador de proyectos

`create-qorechain-dapp` (npm, `0.9.0`) genera una dApp lista para ejecutar:

```bash
npm create qorechain-dapp@latest my-dapp
```

Los archivos `package.json` generados dependen de la versión del SDK con la que se
distribuye el generador (`@qorechain/sdk` `^0.9.0`; la plantilla EVM usa `@qorechain/evm` `^0.8.0`).
La versión 0.8.0 del generador escribía rangos `^0.3.0`, que sobre una versión 0.x se
quedan dentro de la 0.3 y no pueden firmar para las redes en producción; si generaste
el proyecto con la 0.8.0, ejecuta `npm i @qorechain/sdk@latest`. Consulta la
[referencia de la CLI](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Requiere Python 3.10+. El paquete incluye type hints y un marcador `py.typed`.

> La distribución se instala como `qorechain-sdk` (publicada en PyPI en la
> versión `0.9.0`) pero **se importa como `qorsdk`**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Requiere Go 1.23+. Importa los subpaquetes que necesites, por ejemplo:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

Publicado como un módulo Go autocontenido (etiquetado `packages/go/v0.9.0`). Fija la versión
de forma explícita: `go get github.com/qorechain/qorechain-sdk/packages/go@v0.9.0`.

## Rust

```bash
cargo add qorechain-sdk
```

O, para seguir la cabecera del repositorio:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Requiere Rust 1.74+. Los clientes de lectura son asíncronos (Tokio). El crate
se importa como `qorechain` (`use qorechain;`).

> Publicado en crates.io como `qorechain-sdk` (0.9.0); `cargo add qorechain-sdk`
> instala la última versión.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.9.1</version>
</dependency>
```

O Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.9.1'
```

> Publicado en Maven Central como `io.github.qorechain:qorechain-sdk` (se sirven la 0.9.0
> y la 0.9.1; la 0.9.1 es la última y la versión de release, comprobado el 21 de octubre de 2026).
> La 0.9.1 es una versión solo de Java que actualiza Bouncy Castle de la 1.80 a la 1.85, según
> sus notas de versión; no tiene cambios de API. Central no tiene una compilación 0.8.0 ni
> 0.8.1, así que en las redes en producción usa la 0.9.x (o la 0.8.2 o posterior).

## Paquetes relacionados {#related-packages}

| Paquete | Finalidad | Versión |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Utilidades del lado de la wallet: generación de wallets (`generateQoreWallet`), firma híbrida `eth_secp256k1` (`signHybridEth`, `QoreChainSigner`), registro de la red en MetaMask (`addQoreEvmToWallet`), constructores de mensajes de autenticadores y de ventanas EVM (su `openEvmWindowMsg` solo construye la forma sin alcance), el digest v2 de cuenta abstracta. No adjunta una prueba de posesión. Peer dependencies: `@cosmjs/proto-signing` y `@cosmjs/stargate` `^0.32` (el SDK usa cosmjs 0.39, así que instalar ambos en un mismo proyecto hace que npm informe un conflicto de peer dependencies, `ERESOLVE`; mantenlos en proyectos separados o pasa `--legacy-peer-deps`) | 0.4.0 |
| `@qorechain/chain-bridge` | Worker del lado del servidor para backends: deriva la clave PQC, firma de forma híbrida y difunde (`sendTokens`, `registerPqc` y más). Pasa `cosmosRest`: con él, un registro lleva la prueba de posesión una vez que la red ha aplicado la v3.2.3, y un rechazo con aspecto de PQC se contrasta con la cadena antes de cualquier nuevo registro (una clave registrada distinta lanza `pqc_key_mismatch` en lugar de pagar un segundo registro) | 0.2.3 |
| `@qorechain/pqc` | Primitivas ML-DSA / ML-KEM / SHAKE-256 que siguen solo los estándares y `hybridSignBytes` (consulta [Firma poscuántica](/developer-guide/post-quantum-signing)); también en PyPI, crates.io, Maven Central y el proxy de Go (Go `v0.2.3`) en la misma versión | 0.2.3 |
| `@qorechain/handles` | Resolución verificada de `@handle` con fijado trust-on-first-use (`HandleClient`) | 0.1.0 |
| `@qorechain/connect` | Un único conector para wallets EVM, Cosmos y SVM, construido sobre el wallet adapter (su rango de peer dependency es `@qorechain/wallet-adapter` `^0.2.1`, que no incluye la 0.4.0). No abre una [ventana de autorización EVM](/sdk/guides/evm#evm-window), por lo que un envío EVM a través de él es rechazado hasta que la cuenta tenga una clave registrada y una ventana abierta | 0.2.1 |
| `@qorechain/rdk` | Cliente del Rollup Development Kit (consulta [Rollups](/rollups/why)). Depende de `@qorechain/sdk` `^0.9.0` y de `@qorechain/evm` `^0.8.0`, así que una aplicación con el SDK 0.9.0 comparte con él una única copia del SDK (la 0.5.0 traía el SDK 0.8.3 como copia anidada). Firma de forma híbrida solo cuando pasas un `pqcKeypair`; las lecturas funcionan sin él. También se publica como `qorechain-rdk` en PyPI, crates.io y Maven Central y como módulo de Go (fija `@v0.6.0`); esos cuatro clientes firman solo de forma clásica. Consulta [RDK 0.6.0: cambios y límites](/rollups/deploying-a-rollup#rdk-050-limits) | 0.6.0 |
| `@qorechain/rdk-cli` | La CLI de operador `qorollup` para el RDK. Sus comandos de transacción (`create`, `pause`, `resume`, `stop`, `withdraw`) firman solo de forma clásica y las redes los rechazan | 0.6.0 |
| `create-qorechain-rollup` | Generador de proyectos de rollup; sus plantillas dependen de `@qorechain/rdk` `^0.6.0` y firman de forma híbrida cuando pueden resolver tu clave poscuántica desde `QORE_MNEMONIC` o `QORE_PQC_SEED_HEX` | 0.6.0 |

## Siguiente paso

Continúa con el [Inicio rápido](/sdk/quickstart) para conectarte y leer el
estado en la cadena.
