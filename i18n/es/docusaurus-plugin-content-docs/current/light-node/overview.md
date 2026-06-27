---
slug: /light-node/overview
title: Visión general del nodo ligero
sidebar_label: Visión general
sidebar_position: 1
---

# Visión general del nodo ligero

El **nodo ligero de QoreChain** es un cliente ligero que sigue la red QoreChain sin ejecutar un validador completo ni un nodo de archivo. En lugar de reproducir cada transacción, verifica criptográficamente las cabeceras de bloque, hace seguimiento de delegaciones y recompensas, y transmite telemetría de red en vivo, todo desde un binario pequeño y autónomo.

Ejecutar un nodo ligero te permite participar en la economía de la red y observar su estado sin el coste de almacenamiento, ancho de banda y operación de un nodo completo.

## Su propia línea de versiones

El nodo ligero se distribuye en su **propia línea de versiones —actualmente v3.1.1—**, que es **distinta de la versión de lanzamiento de la cadena** (la cadena va en una pista `v3.x` independiente). La línea v3.1.1 del nodo ligero está alineada con `qorechain-core`: añade una suite de regresión de criptografía poscuántica (PQC) (keygen, sign, verify y detección de manipulación) que protege el comportamiento de verificación de firmas del núcleo y la ejecuta en integración continua.

Cuando leas documentación o notas de versión, trata la versión del nodo ligero (v3.1.1) y la versión de la cadena como dos números separados que coinciden en compartir una serie mayor.

## Por qué ejecutar un nodo ligero

- **Gana una parte de las recompensas de bloque.** Los nodos ligeros activos y registrados son elegibles para la **parte del 3% de recompensas para nodos ligeros** que se describe a continuación.
- **Verifica la cadena tú mismo.** El nodo realiza la verificación de cabeceras con un cliente ligero con salto (skipping), por lo que obtienes garantía criptográfica del estado de la cadena sin confiar en una API remota.
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

- **Cliente ligero con salto** — verifica cabeceras sin descargar bloques completos, sincronizando rápidamente incluso desde un arranque en frío.
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
