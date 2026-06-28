---
slug: /rollups/settlement-receipts
title: Recibos de liquidación cuántico-seguros
sidebar_label: Recibos de Liquidación
sidebar_position: 6
---

# Recibos de liquidación cuántico-seguros

Un **recibo de liquidación** es una prueba portátil y autocontenida de que el lote
de liquidación de un rollup fue anclado a la Cadena Principal bajo una firma
poscuántica. Vincula un lote específico al ancla en cadena que comprometió el
estado del rollup a esa altura, y puede verificarse **totalmente sin conexión** —
sin nodo, sin confianza en la ruta de red del verificador.

La firma del ancla es **ML-DSA-87** (Dilithium-5, FIPS-204), el mismo
esquema poscuántico que usa la Cadena Principal, de modo que un recibo hereda la
integridad cuántico-segura de la cadena base.

## El mensaje canónico del ancla

La verificación comprueba una firma Dilithium-5 sobre un mensaje canónico construido a partir
de los campos del ancla, concatenados en este orden exacto:

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

`anchorSignBytes(...)` produce estos bytes; el verificador los reconstruye a partir
del recibo y comprueba la firma frente a la clave ML-DSA-87 registrada del creador de la capa.

## Construir y verificar (TypeScript)

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({
  endpoints: { rest: "https://rest.testnet.example" },
});

// Build a portable receipt for one batch.
const receipt = await buildSettlementReceipt(rdk, "my-roll", 7);

// Persist it, ship it, hand it to a counterparty — it is self-contained JSON.

// Verify fully offline. With no client, you must supply the creator's key.
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "<layer creator ML-DSA-87 public key>",
});

console.log(result.valid); // true when the signature and the batch↔anchor binding both hold
```

Si pasas un `client` en lugar de (o junto con) `creatorPublicKey`, la verificación
obtiene la clave ML-DSA-87 registrada del creador de la capa desde la cadena
(`getPqcAccount(address)`). La verificación comprueba entonces dos cosas:

1. la **firma Dilithium-5** sobre el mensaje canónico del ancla, y
2. el **vínculo lote ↔ raíz de estado del ancla** — que el lote que tienes es el que
   comprometió el ancla.

```ts
// Online verification: fetch the creator's PQC key from the chain.
const online = await verifySettlementReceipt(receipt, { client: rdk });
```

## Leer anclas

Los recibos se construyen a partir de la consulta **Anchor** en cadena de `x/multilayer`,
disponible tanto por gRPC como por REST a partir de la versión de cadena **v3.1.80** (consulta
[REST / gRPC Endpoints](/api-reference/rest-grpc-endpoints#multilayer-module)).
Las lecturas:

- `getAnchor(layerId)` — el ancla de una capa.
- `getLatestAnchor()` — el ancla más reciente.
- `getAnchors(layerId)` — el historial de anclas de una capa.
- `getPqcAccount(address)` — una cuenta poscuántica registrada (su clave ML-DSA-87),
  usada para verificar la firma del creador.

## CLI

```bash
# Build a receipt and print it.
qorollup receipt my-roll 7

# Build, then verify it inline.
qorollup receipt my-roll 7 --verify

# Build and write it to a file.
qorollup receipt my-roll 7 --out receipt.json
```

Consulta [Desplegar un Rollup](/rollups/deploying-a-rollup) para la CLI completa de operador
`qorollup`.

## Otros lenguajes

Los clientes de Python, Go, Rust y Java (JVM) exponen la misma superficie de
construcción/verificación. Realizan la verificación ML-DSA-87 a través de la
biblioteca [`qorechain-pqc`](https://github.com/qorechain) en lugar de una implementación
JavaScript empaquetada; instálala junto con el cliente RDK de tu lenguaje.
