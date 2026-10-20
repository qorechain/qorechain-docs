---
slug: /rollups/settlement-receipts
title: Recibos de liquidación cuántico-seguros
sidebar_label: Recibos de Liquidación
sidebar_position: 6
---

# Recibos de liquidación cuántico-seguros

Un **recibo de liquidación** es un registro portátil de que el lote de liquidación de un rollup fue anclado a la Cadena Principal bajo una firma poscuántica. Nombra el rollup, el lote y el ancla, y lleva la firma **ML-DSA-87** (Dilithium-5, FIPS-204) del ancla, el mismo esquema que usa la Cadena Principal.

:::caution Fase temprana: todavía no existen anclas
Los recibos dependen de las anclas, y **todavía no existe ningún rollup ni ancla en ninguna de las dos redes** (comprobado el 20 de octubre de 2026). Desde v3.2.2 (en vivo en ambas redes), un lote enviado con un `anchor_signature` se ancla en `x/multilayer` en la misma transacción; un lote enviado sin él se liquida sin ancla. Los clientes RDK publicados (0.5.0) no envían ese campo, por lo que los lotes que envían quedan sin ancla. Trata esta página como una descripción del diseño y de sus componentes, no de un servicio en el que puedas confiar hoy.
:::

## Un recibo es una afirmación, no una prueba {#a-receipt-is-a-claim}

Cada campo de un recibo lo aporta quien te lo entrega. Comprobar la firma frente a una clave que te dieron demuestra que alguien con esa clave firmó esos bytes; no demuestra que QoreChain haya anclado nada. Por tanto, un verificador necesita un cliente conectado a un nodo de QoreChain de su confianza y vuelve a leer la afirmación desde el estado de la cadena: el rollup y su capa, el lote y su raíz de estado, el ancla y la clave poscuántica registrada del creador.

## Qué firma el ancla {#what-the-anchor-signs}

La firma del ancla la realiza la clave ML-DSA-87 registrada del **creador del rollup**. El mensaje firmado depende de la altura a la que se envía el ancla. **Desde v3.2.2 (altura 3,556,788 en mainnet, altura 6,905,034 en testnet) es el mensaje v2**: una etiqueta de dominio, el id de la cadena y, con prefijo de longitud, `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, el número de transacciones y la prueba de estado comprimida (el formato exacto está en [Leer anclas](/architecture/multilayer-architecture#reading-anchors)). Desde esa altura, la cadena no acepta un ancla v1 (`layer_id || layer_height || state_root || validator_set_hash`, sin id de cadena). No fijes en el código ninguna de las dos formas: lee los bytes de firma de la red a la que apuntas, por ejemplo con `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>`.

Un ancla es un objeto a nivel de capa: no nombra el rollup ni el lote, por lo que un verificador los vincula mediante lecturas de la cadena (consulta [Arquitectura multicapa](/architecture/multilayer-architecture#reading-anchors)).

## Leer anclas {#reading-anchors}

Las anclas se pueden leer por REST y gRPC (`/qorechain/multilayer/v1/anchor/{layer_id}` para el ancla más reciente y `/qorechain/multilayer/v1/anchors/{layer_id}` para el historial), y la clave poscuántica registrada de una cuenta en `/qorechain/pqc/v1/account/{address}` (`account` en singular). Los lotes de un rollup se leen por las rutas REST del RDK (`/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`, `/qorechain/rdk/v1/latest_batch/{rollup_id}`, `/qorechain/rdk/v1/batches/{rollup_id}`), que sirven ambas redes, o con `qorechaind query rdk batch [rollup-id]`.

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

Pasa un `client` en cada verificación. La API de recibos y sus comprobaciones han cambiado entre versiones, así que usa una versión que verifique contra la cadena (0.5.0 o posterior). Los clientes de Python, Go, Rust y Java exponen la misma superficie de construcción/verificación (los cinco clientes usan la misma ruta plural de búsqueda de claves que la limitación descrita a continuación).

:::caution Limitaciones actuales de los clientes (RDK 0.5.0)
`verifySettlementReceipt` en 0.5.0 nunca informa `valid` a partir del recibo por sí solo (sin un `client` el resultado es `mode: "signature-only"` y `valid: false`), y su comprobación contra la cadena todavía no se completa contra las redes en vivo, por dos motivos que están en el cliente, no en la cadena:

* busca la clave del creador mediante la forma plural `accounts` de la ruta de cuenta poscuántica, que las redes no sirven (HTTP 501; la ruta que funciona es la singular `account`), de modo que con un `client` el resultado es `valid: false` con el motivo de que no se pudo resolver la clave poscuántica del creador; y
* reconstruye el mensaje firmado con el formato v1, que la cadena ya no acepta para anclas desde v3.2.2, por lo que no podría verificar una firma v2 genuina ni siquiera con la clave en mano.

`buildSettlementReceipt` solo funciona cuando un ancla cubre el lote, y no existe ninguna. Usa un recibo solo como un registro que contrastar con el ancla y la clave del creador que leas de tu propio nodo, con los bytes de firma v2 de la red.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

Consulta [Desplegar un Rollup](/rollups/deploying-a-rollup) para la CLI completa de operador `qorollup`.
