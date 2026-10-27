---
slug: /rollups/settlement-receipts
title: Recibos de liquidación cuántico-seguros
sidebar_label: Recibos de Liquidación
sidebar_position: 6
---

# Recibos de liquidación cuántico-seguros

Un **recibo de liquidación** es un registro portátil de que el lote de liquidación de un rollup fue anclado a la Cadena Principal bajo una firma poscuántica. Nombra el rollup, el lote y el ancla, y lleva la firma **ML-DSA-87** (Dilithium-5, FIPS-204) del ancla, el mismo esquema que usa la Cadena Principal.

:::caution Fase temprana: todavía no existen anclas
Los recibos dependen de las anclas, y **todavía no existe ningún rollup ni ancla en ninguna de las dos redes** (comprobado el 27 de octubre de 2026). Desde v3.2.2 (en vivo en ambas redes), un lote enviado con un `anchor_signature` se ancla en `x/multilayer` en la misma transacción; un lote enviado sin él se liquida sin ancla. El RDK de TypeScript (0.6.1) envía ese campo cuando su cliente de transacciones firma en modo híbrido y es el creador del rollup, y en caso contrario envía el lote sin ancla; los clientes de Python, Go, Rust y Java firman solo en modo clásico y no construyen el campo. Nada de esto se ha ejercitado en un rollup en vivo. Trata esta página como una descripción del diseño y de sus componentes, no de un servicio en el que puedas confiar hoy.
:::

## Un recibo es una afirmación, no una prueba {#a-receipt-is-a-claim}

Cada campo de un recibo lo aporta quien te lo entrega. Comprobar la firma frente a una clave que te dieron demuestra que alguien con esa clave firmó esos bytes; no demuestra que QoreChain haya anclado nada. Por tanto, un verificador necesita un cliente conectado a un nodo de QoreChain de su confianza y vuelve a leer la afirmación desde el estado de la cadena: el rollup y su capa, el lote y su raíz de estado, el ancla y la clave poscuántica registrada del creador.

## Qué firma el ancla {#what-the-anchor-signs}

La firma del ancla la realiza la clave ML-DSA-87 registrada del **creador del rollup**. El mensaje firmado depende de la altura a la que se envía el ancla. **Desde v3.2.2 (altura 3,556,788 en mainnet, altura 6,905,034 en testnet) es el mensaje v2**: una etiqueta de dominio, el id de la cadena y, con prefijo de longitud, `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, el número de transacciones y la prueba de estado comprimida (el formato exacto está en [Leer anclas](/architecture/multilayer-architecture#reading-anchors)). Desde esa altura, la cadena no acepta un ancla v1 (`layer_id || layer_height || state_root || validator_set_hash`, sin id de cadena). No fijes en el código ninguna de las dos formas: lee los bytes de firma de la red a la que apuntas. El RDK construye los bytes v2 con `anchorSignBytesForBatch` (y ambas formas con `anchorSignBytesV1` / `anchorSignBytesV2`), y la CLI los imprime, por ejemplo con `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>`.

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

Pasa un `client` en cada verificación. La API de recibos y sus comprobaciones han cambiado entre versiones, así que usa 0.6.1 (la versión actual): 0.5.0 no podía completar la comprobación contra la cadena, y 0.6.0 no comparaba todos los campos del recibo (consulta más abajo). Los clientes de Python, Go, Rust y Java exponen la misma superficie de construcción/verificación; sus versiones 0.6.1 usan la misma ruta singular de búsqueda de claves, la misma elección del mensaje de ancla según la altura y la misma comparación campo por campo.

### Qué verifica 0.6.1 {#what-060-verifies}

`verifySettlementReceipt` nunca informa `valid` a partir del recibo por sí solo: sin un `client` el resultado es `mode: "signature-only"` y `valid: false`. Con un `client` vuelve a leer la cadena e informa de cada comprobación por separado:

* `rollupLayerBinding`: la cadena dice que el rollup pertenece a la capa del recibo;
* `batchStateRoot`: el lote de la cadena lleva la raíz de estado del recibo;
* `anchorOnChain`: existe en la cadena un ancla que coincide con **todos** los campos del ancla que indica el recibo: raíz de estado, altura de la capa, hash del conjunto de validadores, firma, altura de la Cadena Principal, hora del ancla, algoritmo y versión, y en un recibo de versión 2 el recuento de transacciones y la prueba de estado comprimida. Una discrepancia nombra el campo;
* `creatorAuthority`: la clave de firma se leyó de la cadena (`/qorechain/pqc/v1/account/{address}`), no se tomó del recibo;
* `pqcSignature`: la firma ML-DSA-87 se verifica sobre el mensaje de ancla canónico;
* `chainBinding`: el recibo nombra la cadena que realmente se consultó.

El mensaje de ancla se elige según la altura a la que se registró el ancla (v1 por debajo del cambio de v3.2.2, v2 a partir de él), nunca probando ambos, porque una firma v1 no lleva id de cadena y se verificaría en cualquier cadena. El paquete incluye la altura del cambio para mainnet (3,556,788) y testnet (6,905,034). El resultado informa de la forma que usó como `signBytesVersion`. El esquema de recibo v2 registra `chainId`; un recibo de versión 1 no lleva ninguno, por lo que supera `chainBinding` solo porque su ancla se encontró en la cadena que consultaste. La verificación rechaza un recibo comprobado contra un nodo de otra cadena. Antes de leer nada de la cadena, `receiptSchemaError` rechaza un recibo con una `version` desconocida, un `algorithm` distinto de `ML-DSA-87` o (versión 2) sin `chainId`.

Desde la 0.6.1 el resultado también incluye el propio `anchor` de la cadena y, cuando `valid` es true, un `verifiedReceipt` reconstruido a partir del estado de la cadena (`verified_receipt` en Python y Rust, `VerifiedReceipt` en Go): lee los hechos de ahí, no del recibo que te entregaron. `qorollup receipt verify --json` devuelve ese recibo leído de la cadena como `receipt` (`null` cuando el recibo no es válido) en lugar de repetir el archivo. Los recibos de versión 1, que son anteriores al recuento de transacciones y a la prueba, siguen verificándose.

No existe ningún ancla en ninguna de las dos redes, por lo que esto solo se ha comprobado contra el código del paquete y sin conexión, no contra un ancla real. `buildSettlementReceipt` solo funciona cuando un ancla cubre el lote.

:::note Versiones anteriores a 0.6.1
`verifySettlementReceipt` en 0.6.0 hacía coincidir el ancla de la cadena por su raíz de estado, altura de la capa, hash del conjunto de validadores y firma, pero no comparaba los demás campos que muestra un recibo (altura de la Cadena Principal, hora del ancla, algoritmo, versión y, en un recibo de versión 2, el recuento de transacciones y la prueba de estado comprimida), y trataba la raíz de estado del lote como informativa. La propia afirmación de liquidación (raíz de estado, firma del ancla, clave del creador) siempre estuvo vinculada; lo que 0.6.0 no podía decirte era si los metadatos impresos junto a ella coincidían con la cadena. Usa 0.6.1.

`verifySettlementReceipt` en 0.5.0 fallaba de forma cerrada contra las redes en vivo, por dos motivos que estaban en el cliente, no en la cadena: buscaba la clave del creador mediante una forma plural `accounts` de la ruta de cuenta poscuántica, que las redes no sirven (HTTP 501), y reconstruía solo el mensaje v1, que la cadena ya no acepta para anclas desde v3.2.2. Por tanto, un recibo genuino no podía verificarse, y uno falsificado seguía siendo rechazado. Usa 0.6.1.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

Consulta [Desplegar un Rollup](/rollups/deploying-a-rollup) para la CLI completa de operador `qorollup`.
