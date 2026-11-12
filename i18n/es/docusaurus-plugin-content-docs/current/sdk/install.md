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
transacciones PQC híbridas y suscripciones WebSocket). La versión
actual es la **0.13.0**, publicada el 11 de noviembre de 2026
(comprobada contra los registros el 11 de noviembre de 2026; Java es la excepción, consulta la
tabla):

| Registro | Paquete | Versión |
| --- | --- | --- |
| npm | `@qorechain/sdk`, `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm`, `create-qorechain-dapp` | 0.13.0 (`create-qorechain-dapp`: 0.13.1, un parche solo de plantillas sobre el SDK 0.13.0) |
| PyPI | `qorechain-sdk` (import `qorsdk`) | 0.13.0 |
| crates.io | `qorechain-sdk` (import `qorechain`) | 0.13.0 |
| Proxy de módulos de Go | `github.com/qorechain/qorechain-sdk/packages/go` | v0.13.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | Publicado (Maven Central, v0.13.0; JDK 17 o posterior; comprobado el 11 de noviembre de 2026) |

No existe una 0.11.0 para Python, Rust, Go ni Java: los paquetes de npm tuvieron una 0.11.0 el
29 de octubre de 2026 (el kit de desarrollo de la cadena, consulta más abajo) y todos los lenguajes pasaron
de la 0.10.0 a la 0.12.0 a la vez. La 0.13.0 llegó el 11 de noviembre de 2026 en todos los lenguajes.

Elige tu lenguaje a continuación.

## Notas de actualización {#upgrade}

:::danger Usa el SDK 0.8.1 o posterior en las redes en producción
Ambas redes públicas verifican la forma de **sign-bytes híbridos v2** (con etiqueta
de dominio y vinculada al chain id) y rechazan la forma antigua con el código `pqc` 21.
Todas las versiones del SDK anteriores a la **0.8.0** firman la forma antigua, y la **0.8.0**
busca el cambio bajo uno solo de los dos nombres de actualización que usaron las redes
(mainnet lo registró como `v3.2.0`, la testnet como `v3.1.98` y más tarde `v3.2.0`), por lo
que firma la forma equivocada en mainnet. Usa la **0.13.0** (o al menos la **0.8.1**) en todos los
lenguajes; se necesita la **0.8.2 o posterior** para abrir una
[ventana de autorización EVM](/sdk/guides/evm#evm-window). Los constructores
híbridos aceptan una opción `signBytesVersion` (`"auto"` | `"v1"` | `"v2"`); `"auto"`
consulta a la red y por tanto necesita el endpoint REST (`rest`) en
`qorechain-vladi` / `qorechain-diana`: lanza un error en lugar de adivinar. Consulta
[¿Qué forma de sign-bytes?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
La forma no cambió en la v3.2.3 ni en la v3.2.4 de la cadena (v3.2.4 se ejecuta en la testnet desde el 19 de octubre de 2026 y en la mainnet desde el 23 de octubre de 2026; la v3.2.5 y la v3.2.6 no cambiaron nada aquí; la mainnet ejecuta la v3.2.6 desde el 4 de noviembre de 2026): `"auto"`
se resuelve en v2 en ambas redes, porque ambas aplicaron la actualización que cambió a esa forma.
:::

## Qué cambia la 0.13.0 {#whats-new-0130}

El SDK 0.13.0 (11 de noviembre de 2026) es una sola versión para todos los lenguajes:
TypeScript, Python, Go, Rust y Java, con `@qorechain/react`, `@qorechain/evm`,
`@qorechain/svm` y `create-qorechain-dapp`. Tiene un cambio incompatible, en el
ayudante de cuenta de la ruta de semilla. Las cuentas derivadas de una mnemónica no
cambian, ni tampoco el formato de firma híbrida ni el comportamiento de la cadena: una
transacción construida con la 0.12.0 sigue siendo válida.
(Java está publicado en Maven Central como la 0.13.0, comprobado el 11 de noviembre de 2026.)

**Cambio incompatible.** Los ayudantes de la ruta de semilla `unifiedAccountFromSeed`
(TypeScript), `unified_account_from_seed` (Python, Rust), `unified.UnifiedAccountFromSeed`
(Go) y `UnifiedAccounts.unifiedAccountFromSeed` (Java) ahora necesitan exactamente una de
dos entradas: un código de recuperación `QRC1`, o un secreto PQC independiente de 32 bytes.
La clave ML-DSA-87 se deriva de ese segundo secreto. Llamar al ayudante sin ninguna opción,
o con más de una, lanza un error.

La opción `legacySeedDerivation` (Python `legacy_seed_derivation=True`, Go
`LegacySeedDerivation`, Rust `SeedPqcOptions::legacy_seed_derivation()`, Java
`SeedPqcOptions.legacy()`) es opcional. Úsala solo para recuperar la clave PQC de una cuenta
creada antes de la 0.13.0 y poder rotarla con `MsgRotatePQCKey`; no es para cuentas nuevas.

| Área | En la 0.13.0 |
| --- | --- |
| Ayudantes de la ruta de semilla | Necesitan un código de recuperación `QRC1` o un secreto PQC independiente de 32 bytes (exactamente uno); sin opción, o con más de una, lanzan un error. Las cuentas de mnemónica no cambian |
| `legacySeedDerivation` | Opcional, solo para recuperar la clave PQC de una cuenta creada antes de la 0.13.0 y poder rotarla con `MsgRotatePQCKey` |
| Códigos de recuperación `QRC1` | Añadidos en todos los lenguajes: `generatePqcRecoveryCode`, `isValidRecoveryCode`, `normalizeRecoveryCode`, `pqcKeyFromRecoveryCode`, `pqcRecoveryCodeFromSecret` (en snake_case en Python y Rust; en Go `GeneratePQCRecoveryCode`, `IsValidRecoveryCode`, `PQCKeyFromRecoveryCode`, `PQCRecoveryCodeFromSecret`) |
| `migrateToHybrid` | Informa `keyVerified` |
| Plantillas | `pnpm window recovery-code` imprime un código nuevo. Con `PRIVATE_KEY`, `pnpm window` lee `QORE_PQC_RECOVERY_CODE` y se detiene con un mensaje si falta; con `QORE_MNEMONIC` no cambia nada. Las plantillas de Foundry y Hardhat dependen de `^0.13.0` |
| Versión de sign-bytes `"auto"` | Lee primero la función de protocolo `pqc-sign-bytes-v2` en `/qorechain/pqc/v1/protocol_features`, y recurre a los planes de actualización aplicados solo si esa lectura falla |
| `getPqcStatus` / `get_pqc_status` | Lanzan un error cuando la respuesta del nodo no trae el indicador de registro, en lugar de informar «no registrada» |
| Python | Interpreta con rigor los códigos de resultado de las transacciones y los campos `found` y `live` de la ventana EVM; `wait_for_tx` trata una respuesta sin `tx_response` o `txhash` como aún pendiente |

**Opciones de la ruta de semilla en cada lenguaje**. Pasa exactamente una de las tres:

| Lenguaje | Llamada | Código de recuperación | Secreto independiente de 32 bytes | Clave antigua, solo recuperación |
| --- | --- | --- | --- | --- |
| TypeScript | `unifiedAccountFromSeed(seed32, opts)` | `{ recoveryCode }` (una cadena `"QRC1-..."`) | `{ pqcSecret }` (un `Uint8Array` de 32 bytes, independiente de `seed32`) | `{ legacySeedDerivation: true }` |
| Python | `unified_account_from_seed(seed32, ...)` | `recovery_code=...` | `pqc_secret=...` | `legacy_seed_derivation=True` |
| Go | `unified.UnifiedAccountFromSeed(seed32, opts)` | `unified.SeedPQCOptions{RecoveryCode: ...}` | `unified.SeedPQCOptions{PQCSecret: ...}` | `unified.SeedPQCOptions{LegacySeedDerivation: true}` |
| Rust | `unified_account_from_seed(seed32, opts)` | `SeedPqcOptions::recovery_code(code)` | `SeedPqcOptions::pqc_secret(secret32)` | `SeedPqcOptions::legacy_seed_derivation()` |
| Java | `UnifiedAccounts.unifiedAccountFromSeed(seed32, opts)` | `SeedPqcOptions.withRecoveryCode(code)` | `SeedPqcOptions.withPqcSecret(secret32)` | `SeedPqcOptions.legacy()` |

Las opciones de Python son solo por palabra clave. Un `pqcSecret` da la misma clave que el código de recuperación creado a partir de él con `pqcRecoveryCodeFromSecret(secret32)`. TypeScript también tiene `pqcKeyFromRecoveryCode(code, qor1)`.

**Migrar (TypeScript).** Crea un código de recuperación una sola vez y guárdalo aparte de
la semilla:

```ts
import { generatePqcRecoveryCode, unifiedAccountFromSeed } from "@qorechain/sdk";

const recoveryCode = generatePqcRecoveryCode(); // once; store it apart from the seed
const account = unifiedAccountFromSeed(seed32, { recoveryCode });
```

Una cuenta que registró su clave PQC con la 0.12 o anterior carga la clave antigua con
`{ legacySeedDerivation: true }` y la rota con `rotatePqcKeyMsg`:

```ts
const old = unifiedAccountFromSeed(seed32, { legacySeedDerivation: true });
// rotate it with rotatePqcKeyMsg, then use { recoveryCode } from then on
```

Conserva el código de recuperación: un código distinto da una clave distinta.

## Qué añade la 0.12.0 {#whats-new-0120}

El SDK 0.12.0 es la versión de cliente para la cadena **v3.2.5**, que la mainnet aplicó
en la altura 3,906,833 el 29 de octubre de 2026 (la testnet la aplicó el 26 de octubre).
La mainnet ejecuta la v3.2.6 desde el 4 de noviembre; la testnet ejecutó la v3.2.6 desde el 27 de octubre, la v3.2.7 del 6 al 12 de noviembre y la v3.2.8 desde el 12 de noviembre; el formato de firma híbrida, las direcciones, los decimales y los memos no
cambiaron, así que una transacción construida con la 0.10.0 sigue siendo válida.
TypeScript, Python, Go, Rust y Java pasan todos a la 0.12.0, junto con `@qorechain/react`,
`@qorechain/evm`, `@qorechain/svm` y `create-qorechain-dapp`. La versión se comprobó
en todos los lenguajes con un envío bancario híbrido en la testnet y con una clave KEM
registrada, leída de vuelta y retirada allí, además de lecturas en la mainnet.

| Área | En la 0.12.0 |
| --- | --- |
| Endpoints públicos por defecto | Los preajustes `mainnet` y `testnet` ahora apuntan a los endpoints públicos (REST, RPC de consenso y JSON-RPC de EVM en ambas, y además el WebSocket de EVM en la testnet) en lugar de localhost. Por tanto, un `createClient()` sin argumentos se comunica con la testnet pública. Consulta [Red y endpoints](/sdk/reference/network#public-endpoints) |
| Preajuste `localnet` | Los puertos de localhost que usaban todos los preajustes antes de la 0.12.0, con el chain id `qorechain-devnet`. Selecciónalo con `createClient({ network: "localnet" })` para conservar el comportamiento anterior |
| Gas exacto para transacciones híbridas | En una red que haya aplicado la v3.2.5, la comisión `"auto"` de una transacción nativa híbrida es `ceil(simulated x 1.02) + 2000`, porque la simulación ahora cobra por sí misma la verificación poscuántica. Un envío bancario híbrido pide unos 171,600 de gas en lugar de unos 289,000, y la comisión baja con él. Las redes anteriores, las transacciones clásicas y una consulta de plan fallida conservan la regla anterior; un multiplicador que pases sustituye a cualquiera de las dos reglas. `exactHybridGas` (y sus equivalentes en cada lenguaje) y, en TypeScript, `estimateGasDetails` (informa de la simulación, del límite de gas y de qué regla lo fijó). Java ganó la ruta de gas automático |
| Registro de claves ML-KEM-1024 | Una cuenta publica una clave de encapsulación ML-KEM-1024 (algoritmo 2, 1,568 bytes) para que cualquiera pueda cifrar hacia ella: `msg.pqc.registerKemKey` y `msg.pqc.removeKemKey` (la clave se comprueba primero: tamaño, cada coeficiente por debajo de 3329, no todo ceros), `validateKemPublicKey`, y la lectura `fetchKemKey` de `/qorechain/pqc/v1/kem/{address}` (bech32 o `0x`). Ambos mensajes necesitan la firma híbrida. La ruta responde en la mainnet y en la testnet. El SDK no cifra: para cargas selladas consulta [QoreSeal](/developer-tools/qoreseal) |
| Cuentas abstractas | Lecturas de las reglas de gasto almacenadas de una cuenta y de sus claves vinculadas (incluidas las revocadas), `MsgUpdateConfig` (el mensaje de gobernanza que activa o desactiva el módulo) y `authenticators_count` en la vista de la cuenta |
| Comprobaciones de reglas de gasto | Las reglas se comprueban como las comprueba la cadena: un denom `erc20/`, `erc721/` o `erc1155/` debe nombrar una dirección de contrato `0x`. Los códigos 8 (regla de gasto no válida) y 9 (módulo deshabilitado) de `abstractaccount` tienen nombre |
| Parámetros de gobernanza | El `MsgUpdateParams` de cross-VM (incluidos los contratos CosmWasm a los que puede llamar el precompilado del puente EVM) y el `MsgUpdateParams` de rollup, cada uno comprobado contra los límites de la cadena antes de firmar. La lectura de parámetros de cross-VM incluye `bridge_allowed_targets` |
| Constante de actualización y protos | `CHAIN_UPGRADE_V3_2_5`; definiciones protobuf sincronizadas con la cadena v3.2.5 |
| Kit de desarrollo de la cadena | Desde la 0.11.0, solo en npm, e incluido en la 0.12.0: `@qorechain/evm` exporta las cadenas de viem `qorechain` (9801) y `qorechainTestnet` (9800) y los auxiliares de la ventana de autorización EVM (`evmWindowStatus`, `openEvmWindowMessage`, también como `@qorechain/evm/window` sin viem). `create-qorechain-dapp` tiene las plantillas `foundry`, `hardhat`, `viem-wagmi` y `cosmwasm`. `@qorechain/react` tiene `PqcStatusBadge` (los nombres antiguos `QuantumSafeBadge` se conservan como alias obsoletos) |
| Correcciones | `@qorechain/svm`, al recibir endpoints sin `svmRpc`, usaba localhost; ahora indica que el endpoint no está configurado. La generación de código de Python apunta las importaciones entre protos de QoreChain al paquete |

**Cambio de comportamiento que debes revisar al actualizar.** Si tu código dependía del
valor predeterminado de localhost, selecciona `localnet` o pasa `endpoints`. Los endpoints
públicos de la testnet tienen un límite de peticiones por IP, así que el tráfico de producción
debería ejecutar o usar su propio nodo. Ningún preajuste define un endpoint de gRPC ni de SVM
en las redes públicas (las transacciones SVM no están abiertas), y la mainnet no tiene un
WebSocket de EVM público: el código que necesite alguno de ellos falla con un error que nombra el
endpoint que hay que pasar, en lugar de recurrir a localhost. En Rust los endpoints opcionales
ahora son `Option<String>`; en Python, Go y Java un endpoint sin establecer es `None`, una
cadena vacía y `null`.

Los nodos no informan de la versión de su binario. Para detectar una funcionalidad, pregunta a
`isUpgradeApplied` por cada nombre de actualización que la incluye, o lee `.version` de
`https://download.qore.host/<net>/latest.json`.

## Qué añadió la 0.10.0 {#whats-new-0100}

El SDK 0.10.0 es la versión de cliente para la cadena **v3.2.4**, que la mainnet
aplicó en la altura 3,742,566 el 23 de octubre de 2026 (la testnet la aplicó en la
altura 8,337,253 el 19 de octubre). El formato de firma, las direcciones, los
decimales, los memos y las comisiones no cambiaron, y una transacción construida con
la 0.9.0 sigue siendo válida. La versión se comprobó en todos los lenguajes con
transacciones reales en la testnet. No tenía constructores para nada introducido
después de la v3.2.4; las novedades de la v3.2.5 llegaron con la
[0.12.0](#whats-new-0120). La mainnet ejecuta la v3.2.6 desde el 4 de noviembre de 2026 (altura
4,020,000, propuesta de gobernanza 15; antes la v3.2.5, desde el 29 de octubre en la altura
3,906,833) y la 0.10.0 sigue funcionando allí porque el formato de firma no
cambió. La testnet aplicó la v3.2.5 y la v3.2.6 el 26 y el 27 de octubre de 2026, la v3.2.7 el 6 de noviembre y la v3.2.8 el 12 de noviembre (ninguna versión del SDK tiene constructores para los mensajes de la v3.2.7). Lo que trajo la 0.10.0
(todo sigue en la 0.13.0):

| Área | En la 0.10.0 |
| --- | --- |
| Niveles de staking (`x/stakingtier`) | Compositores `lockDelegation` (las comprobaciones propias de la cadena: un plazo de 3, 6 o 12 meses y una cantidad entera positiva), `unlockEarly`, `claimBonus` y `updateParams`; lecturas de los parámetros del módulo, de los bloqueos de un titular y del fondo de bonos (`fetchStakingTierParams`, `fetchStakingLocks`, `fetchStakingTierPool`); los códigos de error del módulo. Lo que hace el módulo se describe en [Staking y delegación](/user-guide/staking-and-delegation) |
| Nonce del authenticator | `fetchAuthNonce({ rest, address, pubkey })` lee la secuencia que una clave vinculada debe firmar a continuación para `MsgExecuteEVM` / `MsgExecuteCosmos` desde `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}`, en lugar de llevarla a mano. Ambas redes sirven la ruta; el propio módulo `abstractaccount` está desactivado en mainnet (activado en la testnet), así que un gasto en mainnet se rechaza antes de comprobar ningún nonce |
| Interruptores de funciones del protocolo | `fetchProtocolFeatures` e `isProtocolFeatureEnabled` leen, por nombre, qué reglas de consenso aplica una red desde `/qorechain/pqc/v1/protocol_features` (ambas redes la sirven). Una red por debajo de la v3.2.4 no sirve la ruta; usa `isUpgradeApplied` allí |
| `possessionProven` | El estado PQC indica si la clave de la cuenta se registró con una prueba de posesión |
| `ibcTimeoutTimestamp(seconds)` | Un timeout IBC absoluto en la unidad que usa `MsgTransfer` (nanosegundos Unix). Los timeouts IBC son tiempos absolutos; los paquetes de IBC v2 usan segundos Unix absolutos, y un valor relativo allí se rechaza después de cobrar la comisión. No hay ningún canal IBC abierto en la mainnet (comprobado el 27 de octubre de 2026) |
| Constante de actualización y protos | `CHAIN_UPGRADE_V3_2_4`; definiciones protobuf sincronizadas con la cadena v3.2.4 (campos nuevos en el registro de validadores del puente, en las consultas de nodo ligero y en las de rollup) |
| `ensurePqcRegistered` | Comparaba como coincidencia un estado sin clave pública; ahora lee la clave por `rest` y la compara. Si no tiene de dónde leerla, el resultado informa `keyVerified: false` en lugar de afirmar que la clave es la de quien llama |
| Rechazos durante la simulación de comisión | Un rechazo de la cadena que llega solo como texto (por ejemplo «no bonus to claim») ahora se nombra a partir de las descripciones de error registradas en la cadena en todos los lenguajes: `decodeTxError` (TypeScript), `SimulationRefusedError` (Python), `tx.DecodeRefusalText` (Go), `tx::decode_refusal_text` (Rust), `TxError.decode` (Java) |

`@qorechain/react` y `create-qorechain-dapp` pasaron a la 0.10.0 con ella; ambos
están ahora en la 0.13.0.

## Qué añadió la 0.9.0 {#whats-new-090}

El SDK 0.9.0 fue la versión de cliente para la cadena **v3.2.2** y **v3.2.3** (mainnet
las aplicó en las alturas 3,556,788 y 3,662,051; la mainnet ejecutó la v3.2.4 desde el 23 de octubre de 2026 (altura 3,742,566), ejecutó la v3.2.5 desde el 29 de octubre y ejecuta la v3.2.6 desde el 4 de noviembre de 2026, y la testnet ejecuta la v3.2.4 o posterior desde el 19 de octubre de 2026). El
formato de firma, las direcciones, los decimales, los memos y las comisiones no
cambiaron, así que la forma de sign-bytes híbridos v2 que firman la 0.8.1 y las
posteriores sigue siendo la correcta. Lo nuevo:

| Área | En la 0.9.0 (y posteriores) |
| --- | --- |
| `TxClient` híbrido (TypeScript) | Pasa el keypair de la cuenta: `client.connectTx(signer, { pqcKeypair })` o `TxClient.connect({ …, pqcKeypair, rest })`. Entonces cada transacción se firma de forma híbrida y `fee: "auto"` simula la propia transacción híbrida; un registro de clave por sí solo sigue siendo clásico (la vía de arranque de la cadena). `bankSend` y los clientes de rollup, multilayer y cross-VM del SDK lo usan. Sin un keypair no cambia nada |
| Clave PQC recuperable | `derivePqcCanonical(address, mnemonic)` y sus equivalentes en cada lenguaje (consulta [Firma híbrida](/sdk/guides/quantum-safe#canonical-derivation)) |
| `ensurePqcRegistered` | Lee primero el estado de la clave por REST (`rest`), se niega a registrar cuando no puede saberlo, lanza `PqcKeyMismatchError` cuando la cuenta ya tiene una clave distinta y trata el rechazo «ya registrada» de la cadena como un éxito. Desde la v3.2.3 de la cadena firma y adjunta por sí mismo la **prueba de posesión**; antes de la v3.2.3 deja el campo vacío |
| Ventanas EVM con alcance | `openEvmWindowMsg` acepta `nativeOnly` y `allowedTargets` (como máximo 16, sin duplicados); `fetchEvmWindow` lee ambos de vuelta (consulta la [guía de EVM](/sdk/guides/evm#evm-window)) |
| Consentimiento EIP-7702 | `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`, `classifyEvmDelegationRejection` |
| Integridad de claves | Los constructores de registro rechazan `classical_only`, una clave vacía y una clave ML-DSA-87 degenerada, que la cadena rechaza desde la v3.2.3. Se exportan `signProofOfPossession` / `verifyProofOfPossession`; `migratePqcKeyHybrid` envía el `MsgMigratePQCKey` con firma híbrida que las cuentas con clave necesitan desde la v3.2.3 |
| Digest v2 de cuenta abstracta | `evmAuthSignBytesV2` (vincula el límite de gas de la llamada) y `resolveEvmAuthDigestVersion`. El módulo `abstractaccount` está desactivado en mainnet (activado en la testnet), así que en mainnet esto es solo de referencia |
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
mainnet y en la testnet. Estos son los límites que eliminó la
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
| `@qorechain/react` 0.8.x dejaba ilegible el estado de la clave registrada en los endpoints públicos | Usa `@qorechain/react` 0.9.0 o posterior |

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

Publicado en npm en la versión `0.13.0`. Exporta las cadenas de viem `qorechain` (chain id 9801) y `qorechainTestnet` (9800) y los auxiliares de la [ventana de autorización EVM](/sdk/guides/evm#evm-window).

### Adaptador SVM

`@qorechain/svm` es un adaptador ligero sobre
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), que es una
**peer dependency**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Publicado en npm en la versión `0.13.0`.

### Kit de React

`@qorechain/react` es la capa oficial de React sobre `@qorechain/sdk` — un
provider, hooks y los componentes `ConnectButton` / `PqcStatusBadge`.
`react` (>=18) es una peer dependency:

```bash
npm i @qorechain/react
```

Publicado en npm en la versión `0.13.0`; depende de `@qorechain/sdk` `^0.13.0`. Consulta la
[guía del kit de React](/sdk/guides/react).

### Generador de proyectos

`create-qorechain-dapp` (npm, `0.13.1`) genera una dApp lista para ejecutar:

```bash
npm create qorechain-dapp@latest my-dapp
```

Los archivos `package.json` generados dependen de la versión del SDK con la que se
distribuye el generador (`@qorechain/sdk` `^0.13.0`; las plantillas EVM usan `@qorechain/evm` `^0.13.0`). La versión 0.13.1 cambia solo las plantillas; consulta [Generadores y CLI](/developer-tools/scaffolders-and-cli#template-fixes-0131). También tiene las plantillas `foundry`, `hardhat`, `viem-wagmi` y `cosmwasm` para trabajar con contratos.
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
> versión `0.13.0`) pero **se importa como `qorsdk`**:
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

Publicado como un módulo Go autocontenido (etiquetado `packages/go/v0.13.0`). Fija la versión
de forma explícita: `go get github.com/qorechain/qorechain-sdk/packages/go@v0.13.0`.

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

> Publicado en crates.io como `qorechain-sdk` (0.13.0); `cargo add qorechain-sdk`
> instala la última versión.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.13.0</version>
</dependency>
```

O Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.13.0'
```

> Publicado en Maven Central como `io.github.qorechain:qorechain-sdk`, versión 0.13.0
> (comprobado el 11 de noviembre de 2026). Necesita JDK 17 o posterior. Central no tiene
> una compilación 0.8.0 ni 0.8.1, así que en las redes en producción usa la 0.8.2 o
> posterior. La 0.9.1 fue una versión solo de Java que actualizó Bouncy Castle de la 1.80
> a la 1.85, sin cambios de API.

## Paquetes relacionados {#related-packages}

| Paquete | Finalidad | Versión |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Utilidades del lado de la wallet: generación de wallets (`generateQoreWallet`), firma híbrida `eth_secp256k1` (`signHybridEth`, `QoreChainSigner`), registro de la red en MetaMask (`addQoreEvmToWallet`), constructores de mensajes de autenticadores y de ventanas EVM (su `openEvmWindowMsg` solo construye la forma sin alcance), el digest v2 de cuenta abstracta. No adjunta una prueba de posesión. Peer dependencies: `@cosmjs/proto-signing` y `@cosmjs/stargate` `^0.32` (el SDK usa cosmjs 0.39, así que instalar ambos en un mismo proyecto hace que npm informe un conflicto de peer dependencies, `ERESOLVE`; mantenlos en proyectos separados o pasa `--legacy-peer-deps`) | 0.5.0 |
| `@qorechain/chain-bridge` | Worker del lado del servidor para backends: deriva la clave PQC, firma de forma híbrida y difunde (`sendTokens`, `registerPqc` y más). Pasa `cosmosRest`: con él, un registro lleva la prueba de posesión una vez que la red ha aplicado la v3.2.3, y un rechazo con aspecto de PQC se contrasta con la cadena antes de cualquier nuevo registro (una clave registrada distinta lanza `pqc_key_mismatch` en lugar de pagar un segundo registro) | 0.2.3 |
| `@qorechain/pqc` | Primitivas ML-DSA / ML-KEM / SHAKE-256 que siguen solo los estándares y `hybridSignBytes` (consulta [Firma poscuántica](/developer-guide/post-quantum-signing)); también en PyPI, crates.io, Maven Central y el proxy de Go (Go `v0.2.3`) en la misma versión | 0.2.3 |
| `@qorechain/handles` | Resolución verificada de `@handle` (`HandleClient`): tú aportas la clave pública del registro y un almacén de anclajes, y anclas después de que el usuario haya visto la dirección; el paquete nunca ancla por sí solo. Consulta [Chain bridge y handles](/developer-tools/chain-bridge#handles) | 0.1.0 |
| `@qorechain/connect` | **Obsoleto en npm y sin mantenimiento; no lo uses en trabajo nuevo. Usa en su lugar [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) (los reemplazos para la conexión con QoreX están en la [visión general de las herramientas para desarrolladores](/developer-tools/overview#group-connect)).** Un único conector para wallets EVM, Cosmos y SVM, construido sobre el wallet adapter (su rango de peer dependency es `@qorechain/wallet-adapter` `^0.2.1`, que no incluye la 0.5.0). No abre una [ventana de autorización EVM](/sdk/guides/evm#evm-window), por lo que un envío EVM a través de él es rechazado hasta que la cuenta tenga una clave registrada y una ventana abierta | 0.2.1 |
| `@qorechain/rdk` | Cliente del Rollup Development Kit (consulta [Rollups](/rollups/why)). Desde la 0.7.0 depende de `@qorechain/sdk` `^0.10.0` y de `@qorechain/evm` `^0.8.0` (comprobado en npm, 4 de noviembre de 2026). Un caret sobre una versión 0.x se queda dentro de esa versión menor, así que una aplicación con el SDK 0.13.0 obtiene para el kit una segunda copia anidada del SDK 0.10.x; mantén ambos separados (no pases un cliente de una copia a la otra) hasta que una versión del kit pase a la 0.13. Firma de forma híbrida solo cuando pasas un `pqcKeypair`; las lecturas funcionan sin él. También se publica como `qorechain-rdk` en PyPI, crates.io y Maven Central y como módulo de Go (fija `@v0.8.0`); desde la 0.8.0 esos cuatro clientes también firman de forma híbrida (las versiones anteriores firmaban solo de forma clásica; Java necesita Java 21). Consulta [RDK 0.8.0: cambios y límites](/rollups/deploying-a-rollup#rdk-050-limits) | 0.8.0 |
| `@qorechain/rdk-cli` | La CLI de operador `qorollup` para el RDK. Desde la 0.7.1 sus comandos de transacción (`create`, `pause`, `resume`, `stop`, `withdraw`) firman de forma híbrida (la 0.7.0 y anteriores firmaban solo de forma clásica y las redes las rechazaban); instalada desde npm se ejecuta y `--version` muestra la versión instalada (la 0.6.1 y anteriores no mostraban nada) | 0.8.0 |
| `@qorechain/qoreseal` | QoreSeal: cifra una carga útil hacia las claves ML-KEM-1024 que las cuentas publican en el registro KEM (el SDK 0.12.0 y posteriores registran y leen las claves; QoreSeal hace el cifrado). También en PyPI (`qorechain-qoreseal`; ruedas para macOS y Linux, la rueda de Windows en la próxima versión), crates.io, Maven Central (`io.github.qorechain:qoreseal` y `qoreseal-android`; los consumidores de Kotlin necesitan Kotlin 2.3 o posterior), el proxy de módulos de Go (`github.com/qorechain/qoreseal/go`, Go `v0.1.0`) y como paquete de Swift. Consulta [QoreSeal](/developer-tools/qoreseal) | 0.1.0 |
| `@qorechain/asset-kit` | Asset Kit: herramientas para tokens de activos del mundo real con permisos en el EVM Engine, con clientes en TypeScript, Python, Java y Go y contratos Solidity (`forge install qorechain/qorechain-asset-kit@v0.1.0`). Apache-2.0, salvo los scripts y las pruebas de ERC-3643 (GPL-3.0-or-later). Los módulos nativos que describe son una propuesta, no están construidos. También `qorechain-asset-kit` en PyPI y `io.github.qorechain:asset-kit` en Maven Central. Consulta [Asset Kit](/developer-tools/asset-kit) | 0.1.0 |
| `@qorechain/qoresign` | QoreSign: firma de wallets y de backend, e `inspectTransaction` para comprobar la capa poscuántica de una transacción confirmada. También en PyPI, crates.io y Maven Central. Consulta [QoreSign](/qoresign/overview) | 0.2.0 |
| `create-qorechain-rollup` | Generador de proyectos de rollup; sus plantillas dependen de `@qorechain/rdk` `^0.8.0` y firman de forma híbrida cuando pueden resolver tu clave poscuántica desde `QORE_MNEMONIC` o `QORE_PQC_SEED_HEX` | 0.8.0 |

## Siguiente paso

Continúa con el [Inicio rápido](/sdk/quickstart) para conectarte y leer el
estado en la cadena.
