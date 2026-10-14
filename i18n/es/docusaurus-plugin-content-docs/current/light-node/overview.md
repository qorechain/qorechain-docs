---
slug: /light-node/overview
title: Visión general del nodo ligero
sidebar_label: Visión general
sidebar_position: 1
---

# Visión general del nodo ligero

El **nodo ligero de QoreChain** es un cliente ligero que sigue la red QoreChain sin ejecutar un validador completo ni un nodo de archivo. En lugar de reproducir cada transacción, corrobora las cabeceras de bloque entre múltiples endpoints RPC, refleja desde la cadena las delegaciones y recompensas de la cuenta del operador, y transmite telemetría de red en vivo, todo desde un binario pequeño y autónomo.

Ejecutar un nodo ligero te permite observar el estado de la red sin el coste de almacenamiento, ancho de banda y operación de un nodo completo. Participar en la parte de recompensas de los nodos ligeros es un paso aparte, sujeto a licencia, que **todavía no está abierto**; consulta [Estado del programa de recompensas](#reward-program-status).

## Su propia línea de versiones

El nodo ligero se distribuye en su **propia línea de versiones, actualmente v3.1.3,** para los binarios precompilados, que es **distinta de la versión de lanzamiento de la cadena** (la cadena va en una pista `v3.x` independiente). Los binarios de cada red se publican con un **manifiesto de checksum SHA-256** en `https://download.qore.host/<net>/lightnode/latest.json` (`<net>` es `mainnet` o `testnet`; ambos canales llevan actualmente la misma compilación v3.1.3). Consulta [Edición SX](/light-node/sx-edition#install) para los pasos de descarga y verificación. La etiqueta de código fuente `v3.1.4` difiere de v3.1.3 únicamente en el firmante incluido en la imagen de Docker; consulta [Docker](/light-node/sx-edition#docker).

Cuando leas documentación o notas de versión, trata la versión del nodo ligero (v3.1.3) y la versión de la cadena como dos números separados que coinciden en compartir una serie mayor.

## Por qué ejecutar un nodo ligero {#why-run-a-light-node}

- **Participa en la parte de recompensas de los nodos ligeros.** Los nodos ligeros registrados y activos que cumplen las reglas de stake y de tiempo de actividad son elegibles para la **asignación del 3% para nodos ligeros** que se describe a continuación. El registro en el programa de recompensas **todavía no está abierto**; consulta [Estado del programa de recompensas](#reward-program-status). Ejecutar y sincronizar un nodo no requiere licencia y funciona hoy.
- **Verifica de forma cruzada el estado de la cadena que se te muestra.** El nodo obtiene la altura más reciente de su endpoint RPC primario y de cada endpoint testigo configurado en paralelo, y solo almacena una cabecera cuando coinciden en el hash del bloque — elevando el nivel de exigencia de confiar en un único endpoint a necesitar que todos los endpoints configurados estén comprometidos a la vez. Esto es corroboración entre fuentes independientes, **no verificación criptográfica de consenso completa** (no hay comprobación del conjunto de validadores ni de las firmas de commit). Tu nodo registra en qué modo está funcionando como el valor `assurance` de cada línea `synced header` de su registro de depuración (establece `log_level = "debug"`); no se muestra en el panel del nodo ni en `status`, y ningún servicio central de QoreChain puede verlo, ya que las elecciones de RPC de tu nodo son locales a tu configuración. **`trusted-single-source`** es lo que obtienes sin testigos configurados: el nodo registra una advertencia al arrancar indicándolo, porque un único endpoint gestionado honestamente informa el mismo valor que uno comprometido. Añade un testigo gestionado de forma independiente para pasar a `corroborated-across-sources`.
- **Vigila tu stake.** El nodo refleja desde la cadena las delegaciones de la cuenta del operador y avisa cuando un validador al que delegas cae por debajo de una puntuación de reputación configurable. Nunca mueve stake por sí mismo: los cambios de delegación se hacen desde tu propio monedero.
- **Observa la red en vivo.** La telemetría en tiempo real cubre validadores, consenso, el puente y los tokenomics.
- **Poscuántico desde el primer día.** Las claves y firmas usan Dilithium-5 (ML-DSA-87).

## Dos ediciones: SX y UX

El nodo ligero viene en dos ediciones construidas a partir del mismo código base. Elige la que se ajuste a cómo quieres operar el nodo.

| Edición | Binario | Diseñado para | Interfaz |
| --- | --- | --- | --- |
| **SX — Server eXperience** | `lightnode-sx` | Despliegues de servidor sin interfaz | CLI completa (daemon + comandos de gestión) |
| **UX — User eXperience** | `lightnode-ux` | Uso de escritorio y de operador | Panel web embebido |

- La **edición SX** es un daemon sin interfaz con una CLI de gestión completa. Es la opción adecuada para servidores, automatización y operadores que viven en la línea de comandos. Consulta [Edición SX](/light-node/sx-edition).
- La **edición UX** ejecuta el mismo daemon pero añade un panel web embebido para que puedas observar la telemetría, las delegaciones y las recompensas en un navegador. Consulta [Edición UX](/light-node/ux-edition).

Ambas ediciones leen el mismo `config.toml`, almacenan datos en el mismo directorio principal (`~/.qorechain-lightnode` por defecto) y usan el mismo keyring de Dilithium-5.

## La parte del 3% de recompensas para nodos ligeros {#the-3-light-node-reward-share}

La distribución de comisiones de QoreChain asigna una **parte fija del 3% a los nodos ligeros** (el parámetro `reward_share`, `0.03`). Consulta [Tokenomics](/architecture/tokenomics) para el desglose completo del 37% / 30% / 20% / 10% / 3% (validadores, quemado, tesorería, stakers, nodos ligeros).

Ese 3% es lo que se abona a la cuenta del módulo de nodos ligeros; no es un derecho por nodo. Cada 100 bloques la cadena acredita a cada nodo elegible su parte ponderada por stake de lo acumulado desde la liquidación anterior, **limitada por nodo** mediante `max_reward_per_block_per_node` (actualmente `1713` uqor por bloque, escalado por el tiempo de actividad del nodo). El límite es un techo, no una cantidad prometida. Todo lo que no se gana se traslada a una reserva que solo una votación de gobernanza puede liberar, de modo que no se acumula ningún bote para quien se registre primero. Puedes inspeccionar el reparto en vivo con `GET /qorechain/lightnode/v1/reward_pool`.

Para ser elegible para recompensas, un nodo ligero debe estar **registrado on-chain y activo** (probando su liveness con heartbeats), mantener al menos el stake vinculado mínimo y mantener su tiempo de actividad igual o superior al mínimo. El registro y el licenciamiento se tratan en [Registro y licenciamiento](/light-node/registration-and-licensing); cómo se acreditan, reclaman y monitorizan las recompensas se trata en [Recompensas y monitorización](/light-node/rewards-and-monitoring).

## Estado del programa de recompensas {#reward-program-status}

:::note El registro en el programa de recompensas todavía no está abierto
En el momento de escribir esto (15 de octubre de 2026) no se ha concedido ninguna licencia `lightnode_operator` en ninguna de las dos redes y no hay ningún nodo ligero registrado (`GET /qorechain/lightnode/v1/stats` informa `total_registered: "0"` en mainnet y en testnet). La cadena rechaza un registro sin esa licencia, por lo que todavía nadie puede inscribirse. La contabilidad de recompensas en sí ya está activa en ambas redes desde la actualización v3.2.0. Ejecutar y sincronizar un nodo no requiere licencia y funciona hoy, pero el tiempo de actividad se cuenta **desde el bloque en que tu nodo se registra**, así que ejecutar un nodo antes no genera crédito.

El manifiesto de versión (`https://download.qore.host/<net>/lightnode/latest.json`) lleva la señal oficial en su campo `registration.open`. También puedes consultar `GET /qorechain/license/v1/holders/lightnode_operator` y `GET /qorechain/lightnode/v1/stats` en `https://api.qore.host` (mainnet) o `https://api-testnet.qore.host` (testnet).
:::

## Características principales de un vistazo

- **Corroboración de cabeceras multi-fuente** — verifica de forma cruzada el hash del último bloque frente a cada endpoint testigo configurado antes de confiar en él, sin descargar bloques completos, sincronizando rápidamente incluso desde un arranque en frío.
- **Seguimiento de delegaciones** — refleja desde la cadena las delegaciones de la cuenta del operador (solo lectura).
- **Reclamación automática opcional** — reclama las recompensas acumuladas del nodo ligero a la cuenta del operador en un intervalo configurable. Desactivada por defecto; nunca vuelve a delegar.
- **Alertas de reputación** — avisa cuando un validador al que delegas cae por debajo de una puntuación de reputación configurable; no mueve stake.
- **Telemetría en tiempo real** — validadores, consenso, puente y tokenomics, actualizados en intervalos independientes.
- **Registro on-chain** — con pruebas de liveness por heartbeat que mantienen al nodo elegible para recompensas. El registro está sujeto a licencia.
- **Criptografía poscuántica** — claves y firmas Dilithium-5 (ML-DSA-87) en todo momento.
- **Modo solo local** — ejercita el stack PQC completo y ejecuta el nodo de forma independiente antes de apuntarlo a una cadena en vivo.

El nodo ligero se publica bajo la licencia **Apache 2.0**.

## Adónde ir a continuación

- [Edición SX](/light-node/sx-edition) — instala, configura y ejecuta el daemon de servidor.
- [Edición UX](/light-node/ux-edition) — ejecuta la edición con panel web.
- [Registro y licenciamiento](/light-node/registration-and-licensing) — regístrate on-chain y obtén una licencia.
- [Recompensas y monitorización](/light-node/rewards-and-monitoring) — cómo se acredita y reclama la parte del 3%, y cómo mantener el nodo en buen estado.
- [Tokenomics](/architecture/tokenomics) — cómo encaja la parte de recompensas para nodos ligeros en la economía más amplia.
