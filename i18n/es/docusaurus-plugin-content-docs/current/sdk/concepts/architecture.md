---
slug: /sdk/concepts/architecture
title: Arquitectura y Conceptos
sidebar_label: Arquitectura
sidebar_position: 1
---

# Arquitectura y conceptos

QoreChain es una única cadena Layer 1 que ejecuta tres máquinas virtuales de
contratos inteligentes en paralelo, con cuentas compartidas y un token compartido.

## El modelo triple-VM

| VM | Contratos | Superficie de cliente en el SDK |
| --- | --- | --- |
| **QoreChain Native** | Contratos Rust/Wasm (el runtime CosmWasm) | `client.cosmwasm()` y los helpers `queryContractSmart` / `execute` en `@qorechain/sdk` |
| **QoreChain EVM Engine** | Solidity / Vyper | `@qorechain/evm` (un adaptador de viem) |
| **SVM** | Programas de Solana | `@qorechain/svm` (un adaptador de `@solana/web3.js`) |

La capa nativa (Cosmos) gestiona las transferencias bancarias, el staking, la
gobernanza y el módulo `x/crossvm` que enruta mensajes entre runtimes.

## Superficies de lectura

El SDK se comunica con un nodo a través de varios endpoints:

- **Cosmos REST (LCD)** — balances bancarios, información de cuentas, consultas de módulos.
- **Consensus RPC** — usado para firmar/difundir transacciones nativas y para el
  cliente de lectura de QoreChain Native.
- **EVM JSON-RPC** — llamadas `eth_*`, `net_*`, `web3_*` y `txpool_*` estándar en
  los endpoints públicos. El namespace `qor_*` de QoreChain y los precompilados
  de EVM todavía no están disponibles allí (véase más abajo).
- **SVM JSON-RPC** — RPC compatible con Solana para el runtime SVM (solo lectura
  en los endpoints públicos; el envío de transacciones SVM está deshabilitado en
  toda la red).

En los nodos que lo habilitan, el namespace JSON-RPC `qor_*` expone lecturas
específicas de QoreChain como tokenómica, estado de las claves PQC, modo de firma
híbrida, mensajes entre VMs y estadísticas de red. En TypeScript estos son
métodos tipados en `client.qor` (`QorClient`); la misma superficie existe en los
SDK de Python, Go y Rust. Frente a los endpoints públicos, usa en su lugar las
rutas REST (por ejemplo `GET /qorechain/pqc/v1/account/{address}` para el estado
de las claves PQC y `GET /qorechain/burn/v1/stats` para las estadísticas de
quema).

> **Aún no se sirve:** ninguna compilación de nodo publicada sirve el namespace JSON-RPC `qor_`, por lo que hoy toda llamada `qor_*` devuelve `-32601` (método no encontrado) en todos los endpoints públicos. Consulta [el namespace `qor_`](/api-reference/json-rpc-qor_-namespace).

## Tokens y denominaciones

- Token de visualización: **QOR**.
- Denominación base: **uqor**, con **10^6** unidades base por QOR.

Haz siempre las operaciones matemáticas de dinero en unidades base. El SDK
proporciona conversiones exactas para que nunca pierdas precisión por culpa del
punto flotante:

```ts
import { toBase, fromBase } from "@qorechain/sdk";

toBase("1.5");        // "1500000"  (QOR -> uqor)
fromBase("1500000");  // "1.5"      (uqor -> QOR)
```

> Nota: el runtime EVM representa QOR con 18 decimales (la convención de EVM), lo
> cual es distinto de la base `uqor` de Cosmos de 10^6. El cliente
> `@qorechain/evm` usa 18 decimales por defecto para la visualización. Confirma el
> valor para tu red objetivo.

## Direcciones

El mismo material de clave puede expresarse en tres formatos de dirección:

- **native** — bech32 con el prefijo `qor` (`qor1…`); los validadores usan
  `qorvaloper`.
- **EVM** — `0x…`, con checksum EIP-55.
- **SVM** — base58 de la clave pública ed25519.

Consulta [Cuentas y firma PQC](/sdk/concepts/accounts-pqc) para conocer las rutas
de derivación.

## Cross-VM

El módulo `x/crossvm` de QoreChain permite que los contratos de una VM activen
acciones en otra. La ruta EVM→native se ejecuta on-chain a través del
**precompilado del puente cross-VM** (`@qorechain/evm`; todavía no activo en las redes públicas), y el SDK proporciona
helpers tipados de lectura REST (`getCrossVmMessage`, `getPendingCrossVmMessages`,
`getCrossVmParams`) además de `client.qor.getCrossVmMessage(...)` para rastrear el
estado de los mensajes. En los endpoints públicos los helpers REST y `client.qor`
no se sirven; lee los mensajes con `connectQueryClients(rpc).crossvm`. Consulta la
[guía cross-VM](/sdk/guides/cross-vm).
