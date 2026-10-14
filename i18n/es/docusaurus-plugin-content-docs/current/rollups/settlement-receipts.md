---
slug: /rollups/settlement-receipts
title: Recibos de liquidación cuántico-seguros
sidebar_label: Recibos de Liquidación
sidebar_position: 6
---

# Recibos de liquidación cuántico-seguros

Un **recibo de liquidación** es un registro portátil de que el lote de liquidación de un rollup fue anclado a la Cadena Principal bajo una firma poscuántica. Nombra el rollup, el lote y el ancla, y lleva la firma **ML-DSA-87** (Dilithium-5, FIPS-204) del ancla, el mismo esquema que usa la Cadena Principal.

:::caution Fase temprana: todavía no existen anclas
Los recibos dependen de las anclas, y **todavía no existe ningún rollup ni ancla en ninguna de las dos redes**. En mainnet el RDK aún no escribe anclas: los lotes de liquidación se registran, pero el paso de anclaje se omite. Trata esta página como una descripción del diseño y de sus componentes, no de un servicio en el que puedas confiar hoy.
:::

## Un recibo es una afirmación, no una prueba {#a-receipt-is-a-claim}

Cada campo de un recibo lo aporta quien te lo entrega. Comprobar la firma frente a una clave que te dieron demuestra que alguien con esa clave firmó esos bytes; no demuestra que QoreChain haya anclado nada. Por tanto, un verificador necesita un cliente conectado a un nodo de QoreChain de su confianza y vuelve a leer la afirmación desde el estado de la cadena: el rollup y su capa, el lote y su raíz de estado, el ancla y la clave poscuántica registrada del creador.

## Qué firma el ancla {#what-the-anchor-signs}

La firma del ancla la realiza la clave ML-DSA-87 registrada del **creador del rollup**. En mainnet hoy, el mensaje firmado es

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

Una versión más reciente de la cadena cambia el mensaje firmado, así que no lo fijes en el código: lee los bytes de firma de la red a la que apuntas. Un ancla es un objeto a nivel de capa: no nombra el rollup ni el lote, por lo que un verificador los vincula mediante lecturas de la cadena (consulta [Arquitectura multicapa](/architecture/multilayer-architecture#reading-anchors)).

## Leer anclas {#reading-anchors}

Las anclas se pueden leer por REST y gRPC (`/qorechain/multilayer/v1/anchor/{layer_id}` para el ancla más reciente y `/qorechain/multilayer/v1/anchors/{layer_id}` para el historial), y la clave poscuántica registrada de una cuenta en `/qorechain/pqc/v1/account/{address}`. Los lotes de un rollup se leen con `qorechaind query rdk batch [rollup-id]` (las rutas REST del RDK no se sirven hoy en mainnet).

## Construir y verificar (TypeScript) {#build-and-verify}

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// Build a receipt for one batch (throws if no anchor covers the batch yet).
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 7);

// Verify it against chain state — pass a client; a receipt on its own proves nothing.
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

Pasa un `client` en cada verificación. Usa la última versión publicada de tu cliente RDK: la API de recibos y sus comprobaciones han cambiado entre versiones, y los clientes de Python, Go, Rust y Java exponen la misma superficie de construcción/verificación (realizan la verificación ML-DSA-87 a través de la biblioteca [`qorechain-pqc`](https://github.com/qorechain)).

:::note Limitaciones actuales de los clientes
Los clientes RDK publicados buscan la clave del creador por una ruta que la cadena en producción no sirve, por lo que la verificación en línea todavía no se completa contra las redes en producción. Hasta que una versión de los clientes lo solucione, usa un recibo solo como un registro que contrastar con el ancla que leas de tu propio nodo.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

Consulta [Desplegar un Rollup](/rollups/deploying-a-rollup) para la CLI completa de operador `qorollup`.
