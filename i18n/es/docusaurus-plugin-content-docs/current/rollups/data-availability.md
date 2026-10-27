---
slug: /rollups/data-availability
title: Disponibilidad de datos
sidebar_label: Disponibilidad de datos
sidebar_position: 4
---

# Disponibilidad de datos

La disponibilidad de datos (DA) es la garantía de que los datos de transacción que respaldan el estado de un rollup se publican en algún lugar donde cualquiera pueda leerlos — de modo que cualquiera pueda reconstruir y verificar de forma independiente el estado del rollup. El RDK define tres backends de DA; hoy solo `native` está implementado.

| Backend | Qué es | Estado |
| ------- | ---------- | ------ |
| **`native`** | Almacenamiento de blobs on-chain dentro de la propia QoreChain | Implementado en el módulo; todavía no hay una forma pública de publicar un blob (ver más abajo) |
| **`celestia`** | Disponibilidad de datos a través de IBC hacia Celestia, una capa de DA modular dedicada | No implementado |
| **`both`** | Native y Celestia juntos, para redundancia | Se comporta exactamente como `native` hoy |

:::caution Capacidad en fase temprana
Todavía no se ha creado ningún rollup en ninguna de las dos redes (comprobado el 27 de octubre de 2026), y los backends de DA están implementados solo en parte. El estado de cada backend se indica a continuación; valida en la testnet **`qorechain-diana`** antes de confiar en cualquiera de ellos.
:::

---

## DA nativa (almacenamiento de blobs on-chain)

La DA nativa es el almacén de blobs on-chain dentro de `x/rdk`: cada blob se indexa por ID de rollup e índice de blob, lleva un **compromiso SHAKE-256** de sus bytes y se poda tras la ventana de retención mientras se conserva su compromiso.

:::caution Todavía no hay una forma pública de publicar un blob
El módulo define el almacenamiento, la retención y la poda de blobs, pero **no existe ningún mensaje de transacción para publicar un blob** en las versiones actuales (mainnet v3.2.4 y testnet v3.2.6; los mensajes del módulo se comprueban en el código fuente de la cadena). La cadena acepta un `data_hash` no vacío en un rollup `native` o `both` solo cuando hay un blob que coincida almacenado en la cadena, y nada puede almacenar uno. Por tanto, un lote de liquidación en un rollup así **debe dejar `data_hash` vacío**: un lote que indique un hash de datos es rechazado por datos no disponibles, después de haber pagado la comisión de la transacción.

El RDK sigue esto desde la **0.6.1**: `SubmitBatchInput.dataHash` es opcional (omitirlo significa vacío), las seis plantillas iniciales lo dejan vacío, `dataHashError` (`data_hash_error`, `DataHashError`, `Rules.dataHashError`) expone la regla en los cinco lenguajes, y `RdkTxClient.submitBatch` rechaza un lote así antes de difundirlo cuando puede leer el rollup (un cliente híbrido con un endpoint REST). Las versiones anteriores de las plantillas ponían un hash de datos en sus lotes, que la cadena rechazaba.
:::

Conceptos clave:

* **Blobs.** Un blob se asocia a un ID de rollup y a un índice de blob.
* **Compromisos (commitments).** Cada blob lleva un compromiso SHAKE-256 de 32 bytes de sus datos, de modo que un blob puede verificarse frente a lo que se comprometió, sin necesidad de confiar en quien lo almacena. (La utilidad TypeScript `buildDaBlob()` calcula actualmente el hash con SHA-256, por lo que su `dataHash` no coincide con el compromiso de la cadena, y como ninguna transacción publica un blob, de todos modos no debes enviar ese hash en un lote de un rollup `native` o `both`.)
* **Espacios de nombres (namespaces).** Los blobs pueden llevar un espacio de nombres específico del rollup, manteniendo los datos de cada rollup lógicamente separados dentro del almacenamiento compartido.
* **Retención y poda (pruning).** Los blobs nativos se conservan durante `blob_retention_blocks` (432,000 bloques — unos 16 días con el tiempo de bloque actual de mainnet de ≈3.2 s; la cifra varía con el tiempo de bloque) y luego se podan para mantener sostenible el almacenamiento on-chain. Tras la poda, los datos brutos del blob se eliminan mientras que los metadatos del compromiso se conservan, de modo que el compromiso histórico sigue siendo verificable aunque los bytes ya no se almacenen on-chain.

El tamaño máximo de blob y la ventana de retención se rigen por los parámetros del módulo en vivo. Consúltalos antes de diseñar en torno a cualquier límite específico:

```bash
qorechaind query rdk config
```

Los metadatos del blob (no los bytes) se pueden leer por REST en `/qorechain/rdk/v1/blob/{rollup_id}/{blob_index}`, que ambas redes sirven; incluyen `expires_at_height`.

---

## DA de Celestia (IBC hacia Celestia)

La DA de Celestia **no está implementada**. Un rollup cuyo backend de DA sea `celestia` no puede publicar datos (el módulo devuelve un error). El diseño previsto publica la disponibilidad de datos a través de IBC hacia **Celestia**, una red de DA modular dedicada, sin dejar de anclar la liquidación en QoreChain; no hay ningún canal IBC abierto en mainnet, y el único canal abierto en la testnet (comprobado el 27 de octubre de 2026) es un canal de transferencia de tokens (`ics20-1`), no un canal de disponibilidad de datos (consulta [Arquitectura del puente](/architecture/bridge-architecture)). Usa `native`.

---

## Both (redundancia)

El backend `both` está pensado para escribir en **native y Celestia juntos**. Hoy `both` se comporta exactamente como `native`: solo se almacena la copia nativa, y la mitad de Celestia se omite con una advertencia registrada. No lo trates como dos copias independientes.

---

## Elegir un backend

| Si quieres... | Elige |
| -------------- | ------ |
| La opción más sencilla y totalmente on-chain que hereda la seguridad de QoreChain | **`native`** |
| Descargar la DA a una capa modular dedicada | **`celestia`** — no implementado |
| Redundancia entre dos almacenes | **`both`** — igual que `native` hoy |

Para saber cómo encaja la DA en el panorama más amplio de la liquidación, consulta **[Visión general de los rollups](/rollups/overview)**. Para la referencia del módulo de más bajo nivel, consulta la página del **[Kit de desarrollo de rollups](/architecture/rollup-development-kit)**.
