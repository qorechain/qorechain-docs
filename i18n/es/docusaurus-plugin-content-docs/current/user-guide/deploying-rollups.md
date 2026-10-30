---
slug: /user-guide/deploying-rollups
title: Despliegue de rollups
sidebar_label: Despliegue de rollups
sidebar_position: 6
---

# Despliegue de rollups

Esta guía es una breve orientación para lanzar un rollup específico de aplicación que se liquida en QoreChain con el Rollup Development Kit (RDK). Los comandos paso a paso están en **[Desplegar un Rollup](/rollups/deploying-a-rollup)**; esta página cubre lo que necesitas antes de empezar.

:::caution Capacidad en una fase temprana
Todavía no se ha creado ningún rollup en ninguna de las dos redes (comprobado el 27 de octubre de 2026 en la testnet y el 30 de octubre de 2026 en la mainnet). Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) ejecuta la versión de cadena **v3.2.5** desde el 29 de octubre de 2026, que trae las reglas de liquidación de [comportamiento de la cadena v3.2.5](/rollups/overview#v325) (cualquier cuenta puede resolver un desafío, los lotes se finalizan en orden); la testnet (**`qorechain-diana`**, EVM chain ID **9800**) ejecuta v3.2.6 (desde el 27 de octubre de 2026), y su ventana de desafío por defecto es de 1 hora en lugar de 7 días. Valida primero en testnet; el comportamiento de la ventana de desafío se describe en [Rollup Development Kit](/architecture/rollup-development-kit#optimistic-settlement)).
:::

---

## Qué es un rollup aquí {#what-a-rollup-is-here}

Un rollup de QoreChain es una cadena específica de aplicación que **ejecuta fuera de la cadena** y usa QoreChain para la **liquidación**: registras el rollup on-chain, publicas lotes de raíces de estado y, opcionalmente, blobs de datos y compromisos de retirada. El registro on-chain contiene un perfil, un modo de liquidación, un modo de secuenciador, un backend de disponibilidad de datos, un modelo de gas y una etiqueta de VM; la cadena anfitriona no ejecuta las transacciones de tu rollup.

---

## Perfiles preestablecidos {#preset-profiles}

El RDK incluye cinco perfiles preestablecidos, cada uno ajustado para una categoría de aplicación común:

| Perfil         | Liquidación (prueba)  | Secuenciador | DA              | Modelo de gas | VM       | Caso de uso previsto |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicado | nativo          | EIP-1559     | EVM      | Aplicaciones DeFi/AMM (préstamos, DEX, derivados) |
| **gaming**     | based               | based     | nativo          | plano        | custom   | Estado de juego de alto rendimiento y experiencias en tiempo real |
| **nft**        | optimista (fraude)  | dedicado | nativo (DA de Celestia planeado) | estándar | QoreChain Native | Acuñación de NFT y cargas de trabajo de marketplace |
| **enterprise** | based               | based     | nativo          | subvencionado | EVM      | Despliegues permisionados y de consorcio con comisiones patrocinadas |
| **custom**     | valores por defecto: optimista (fraude) | dedicado | nativo | estándar | EVM | Valores iniciales por defecto; ajusta lo que el mensaje permita |

Consulta [Perfiles preestablecidos](/rollups/preset-profiles) para ver los detalles y las notas de madurez (por ejemplo, la liquidación ZK, y por tanto el perfil `defi`, todavía no se puede usar en ninguna de las dos redes, y el secuenciado `based` significa actualmente que el creador envía los lotes).

---

## Requisitos {#requirements}

| Requisito | Detalles |
| ----------- | ------- |
| **Stake del rollup** | Al menos 10,000 QOR (`min_stake_for_rollup`, 10,000,000,000 uqor). Consulta el valor vigente: `qorechaind query rdk config` |
| **Quema de creación** | El 1 % del stake que aportes se quema al crear el rollup; el resto se mantiene en depósito (escrow) en un libro por rollup. Cuando detienes el rollup recuperas lo que quede en él (las retiradas y las recompensas de pruebas de fraude pagadas desde él reducen el reembolso) |
| **Id del rollup** | De 3 a 64 caracteres: letras minúsculas, dígitos, `.`, `_` y `-`, empezando por una letra o un dígito. Un id que incumpla esto se rechaza después de que hayas pagado la comisión, así que compruébalo primero (el RDK de TypeScript 0.6.0 lo comprueba antes de difundir) |
| **Stake de registro de la capa** | Crear un rollup también registra una capa en el módulo multilayer, que bloquea otros 1,000 QOR del creador (se devuelven cuando se detiene el rollup). Sin ese saldo no se crea la capa y el rollup no puede anclarse |
| **Cuenta** | Una cuenta financiada con una clave poscuántica registrada (cada transacción del carril nativo se firma de forma híbrida) |

---

## Consejos {#tips}

* Empieza con un perfil preestablecido. Los preajustes fijan el modo de liquidación, el secuenciador, el backend de disponibilidad de datos y la VM; `create-rollup` solo recibe el id, el perfil, el stake y un `--vm` opcional.
* La quema de creación del 1 % se aplica al stake que aportes.
* Los lotes se liquidan sin ancla a menos que envíes con ellos la firma poscuántica del creador (`--anchor-signature` en `tx rdk submit-batch`, disponible desde v3.2.2). Consulta [Anclaje de estado](/architecture/rollup-development-kit#state-anchoring).
* Las retiradas a L1 (`tx rdk execute-withdrawal`) se pagan desde el libro de depósito de tu rollup y funcionan en mainnet desde v3.2.3; necesitan un lote finalizado con una raíz de retiradas y usan solo `uqor`.
* El creador del rollup es hoy quien envía los lotes (ningún preajuste establece una dirección de secuenciador), así que mantén a salvo la clave del creador: solo el creador puede pausar, reanudar o detener el rollup.
* El RDK se publica en cinco lenguajes (versión 0.7.0 en npm, PyPI, crates.io, Maven Central y el proxy de módulos de Go; comprobado el 27 de octubre de 2026), pero solo el cliente de TypeScript firma transacciones híbridas, y solo cuando le proporcionas tu par de claves poscuánticas; la CLI `qorollup` y los clientes de Python, Go, Rust y Java firman solo en modo clásico, y ambas redes lo rechazan. Consulta [Cambios y límites del RDK](/rollups/deploying-a-rollup#rdk-050-limits).
* El asistente `suggest-profile` devuelve actualmente un valor de respaldo fijo `defi` en los endpoints públicos, así que elige a partir de la tabla de perfiles.

---

## Próximos pasos {#next-steps}

* [Desplegar un Rollup](/rollups/deploying-a-rollup) — crea, opera y detén un rollup desde la CLI o TypeScript.
* [Resumen de Rollups](/rollups/overview) — modos de liquidación, secuenciadores, sistemas de prueba.
* [Disponibilidad de datos](/rollups/data-availability) y [ZK / STARK y retiradas](/rollups/zk-stark-withdrawals).
