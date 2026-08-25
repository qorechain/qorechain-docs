---
slug: /light-node/overview
title: Visión general del nodo ligero
sidebar_label: Visión general
sidebar_position: 1
---

# Visión general del nodo ligero

El **nodo ligero de QoreChain** es un cliente ligero que sigue la red QoreChain sin ejecutar un validador completo ni un nodo de archivo. En lugar de reproducir cada transacción, corrobora las cabeceras de bloque entre múltiples endpoints RPC, hace seguimiento de delegaciones y recompensas, y transmite telemetría de red en vivo, todo desde un binario pequeño y autónomo.

Ejecutar un nodo ligero te permite participar en la economía de la red y observar su estado sin el coste de almacenamiento, ancho de banda y operación de un nodo completo.

## Su propia línea de versiones

El nodo ligero se distribuye en su **propia línea de versiones —actualmente v3.1.2—**, que es **distinta de la versión de lanzamiento de la cadena** (la cadena va en una pista `v3.x` independiente). Los binarios se publican con un **manifiesto de checksum SHA-256** — consulta [Conexión a Mainnet](/getting-started/connecting-to-mainnet) para el patrón de descarga — y v3.1.2 es la primera versión cuyos binarios de Windows y macOS realmente pasan keygen/sign/verify (las compilaciones anteriores eran previas a una sustitución de biblioteca de Rust y fallaban silenciosamente en esas plataformas). Actualmente está promovida en el canal de lanzamiento de **testnet**; el canal de mainnet se mantiene deliberadamente a la espera de un periodo de maduración más largo antes de promoverla — si un enlace de descarga de mainnet da 404, es por eso, no por un enlace roto.

Cuando leas documentación o notas de versión, trata la versión del nodo ligero (v3.1.2) y la versión de la cadena como dos números separados que coinciden en compartir una serie mayor.

## Por qué ejecutar un nodo ligero {#why-run-a-light-node}

- **Gana una parte de las recompensas de bloque.** Los nodos ligeros activos y registrados son elegibles para la **parte del 3% de recompensas para nodos ligeros** que se describe a continuación.
- **Verifica de forma cruzada el estado de la cadena que se te muestra.** El nodo obtiene la altura más reciente de su endpoint RPC primario y de cada endpoint testigo configurado en paralelo, y solo almacena una cabecera cuando coinciden en el hash del bloque — elevando el nivel de exigencia de confiar en un único endpoint a necesitar que todos los endpoints configurados estén comprometidos a la vez. Esto es corroboración entre fuentes independientes, **no verificación criptográfica de consenso completa** (no hay comprobación del conjunto de validadores ni de las firmas de commit). Tu propio nodo informa de en qué modo está funcionando mediante un estado `Assurance` en **su propio panel** (`http://127.0.0.1:8420` por defecto) — esto no es algo que un panel central de QoreChain pueda ver, ya que las elecciones de RPC de tu nodo son locales a tu configuración. **`trusted-single-source`** (sin testigos configurados) es el valor por defecto con el que empiezan la mayoría de los operadores, no una señal de alarma — un único endpoint gestionado honestamente informa el mismo valor que uno comprometido. Añade un testigo gestionado de forma independiente para pasar a `corroborated-across-sources`.
- **Delega y autocompone.** Gestiona el stake delegado entre múltiples validadores, repartido por peso, y compón las recompensas automáticamente.
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

## La parte del 3% de recompensas para nodos ligeros

La distribución de comisiones de QoreChain asigna una **parte fija del 3% a los nodos ligeros** por servir datos de la red. Esto se aplica on-chain como parte del reparto de recompensas del protocolo y es el mismo canal documentado en la economía del proyecto; consulta [Tokenomics](/architecture/tokenomics) para el desglose completo del 37% / 30% / 20% / 10% / 3% (validadores, quemado, tesorería, stakers, nodos ligeros).

Para ser elegible para esta parte, un nodo ligero debe estar **registrado on-chain y probando activamente su liveness** mediante pruebas de heartbeat. El registro y el licenciamiento se tratan en [Registro y licenciamiento](/light-node/registration-and-licensing); cómo se gana, compone y monitoriza la parte se trata en [Recompensas y monitorización](/light-node/rewards-and-monitoring).

## Características principales de un vistazo

- **Corroboración de cabeceras multi-fuente** — verifica de forma cruzada el hash del último bloque frente a cada endpoint testigo configurado antes de confiar en él, sin descargar bloques completos, sincronizando rápidamente incluso desde un arranque en frío.
- **Staking delegado** — haz staking entre múltiples validadores con pesos de reparto configurables.
- **Recompensas con autocomposición** — reclama y vuelve a delegar las recompensas en un intervalo configurable.
- **Rebalanceo consciente de la reputación** — desplaza la delegación hacia validadores de mayor reputación automáticamente.
- **Telemetría en tiempo real** — validadores, consenso, puente y tokenomics, actualizados en intervalos independientes.
- **Registro on-chain** — con pruebas de liveness por heartbeat que mantienen al nodo elegible para recompensas.
- **Criptografía poscuántica** — claves y firmas Dilithium-5 (ML-DSA-87) en todo momento.
- **Modo solo local** — ejercita el stack PQC completo y ejecuta el nodo de forma independiente antes de apuntarlo a una cadena en vivo.

El nodo ligero se publica bajo la licencia **Apache 2.0**.

## Adónde ir a continuación

- [Edición SX](/light-node/sx-edition) — instala, configura y ejecuta el daemon de servidor.
- [Edición UX](/light-node/ux-edition) — ejecuta la edición con panel web.
- [Registro y licenciamiento](/light-node/registration-and-licensing) — regístrate on-chain y obtén una licencia.
- [Recompensas y monitorización](/light-node/rewards-and-monitoring) — gana la parte del 3% y mantén el nodo en buen estado.
- [Edición SX](/light-node/sx-edition) y [Edición UX](/light-node/ux-edition) son las dos formas de ejecutar un nodo ligero.
- [Tokenomics](/architecture/tokenomics) — cómo encaja la parte de recompensas para nodos ligeros en la economía más amplia.
