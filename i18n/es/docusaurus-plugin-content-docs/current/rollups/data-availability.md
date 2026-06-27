---
slug: /rollups/data-availability
title: Disponibilidad de datos
sidebar_label: Disponibilidad de datos
sidebar_position: 4
---

# Disponibilidad de datos

La disponibilidad de datos (DA) es la garantía de que los datos de transacción que respaldan el estado de un rollup se publican en algún lugar donde cualquiera pueda leerlos — de modo que cualquiera pueda reconstruir y verificar de forma independiente el estado del rollup. El RDK admite tres backends de DA.

| Backend | Qué es |
| ------- | ---------- |
| **`native`** | Almacenamiento de blobs on-chain dentro de la propia QoreChain |
| **`celestia`** | Disponibilidad de datos a través de IBC hacia Celestia, una capa de DA modular dedicada |
| **`both`** | Native y Celestia juntos, para redundancia |

:::caution
Los backends de disponibilidad de datos forman parte del RDK en evolución activa. Trata las notas de madurez siguientes como intención de diseño y valídalas en la testnet **`qorechain-diana`** antes de confiar en un backend en producción.
:::

---

## DA nativa (almacenamiento de blobs on-chain)

La DA nativa almacena los datos de transacción del rollup como **blobs** directamente en QoreChain. Cada blob se confirma y es direccionable, de modo que los datos que respaldan un lote de liquidación pueden recuperarse y verificarse on-chain.

Conceptos clave:

* **Blobs.** Los datos de transacción del rollup se publican como blobs de disponibilidad de datos, cada uno asociado a un ID de rollup y a un índice de blob.
* **Compromisos (commitments).** Cada blob lleva un compromiso (un hash de los datos del blob), de modo que un blob puede verificarse frente a lo que se comprometió, sin necesidad de confiar en quien lo almacena.
* **Espacios de nombres (namespaces).** Los blobs pueden llevar un espacio de nombres específico del rollup, manteniendo los datos de cada rollup lógicamente separados dentro del almacenamiento compartido.
* **Retención y poda (pruning).** Los blobs nativos se conservan durante una ventana acotada y luego se podan para mantener sostenible el almacenamiento on-chain. Tras la poda, los datos brutos del blob se eliminan mientras que los metadatos del compromiso se conservan, de modo que el compromiso histórico sigue siendo verificable aunque los bytes ya no se almacenen on-chain.

El tamaño máximo exacto de blob y la ventana de retención se rigen por los parámetros del módulo en vivo. Consúltalos antes de diseñar en torno a cualquier límite específico:

```bash
qorechaind query rdk config
```

La DA nativa es la opción más sencilla — mantiene todo dentro de QoreChain, heredando la seguridad y la criptografía post-cuántica de la cadena anfitriona, a costa de consumir almacenamiento de la cadena anfitriona.

---

## DA de Celestia (IBC hacia Celestia)

El backend `celestia` publica la disponibilidad de datos a través de IBC hacia **Celestia**, una red de DA modular dedicada. Esto descarga el almacenamiento de blobs de QoreChain hacia una capa de DA específica, sin dejar de anclar la liquidación en QoreChain.

:::note
La DA de Celestia es una integración en proceso de maduración. En la versión actual debe tratarse como aún no consolidada para producción — valida el comportamiento en testnet y prefiere `native` o `both` donde necesites una garantía liquidada hoy.
:::

---

## Both (redundancia)

El backend `both` escribe en **native y Celestia juntos**, ofreciendo redundancia entre un almacén on-chain y una capa de DA modular externa. Elige `both` cuando quieras la mayor superficie de disponibilidad posible y estés dispuesto a pagar por almacenar los datos en dos lugares.

Dado que la vía de Celestia todavía está madurando, trata `both` como nativa-con-redundancia-en-progreso en lugar de una garantía de que hoy se liquidan dos copias totalmente independientes. Confirma el comportamiento actual en testnet.

---

## Elegir un backend

| Si quieres... | Elige |
| -------------- | ------ |
| La opción más sencilla y totalmente on-chain que hereda la seguridad de QoreChain | **`native`** |
| Descargar la DA a una capa modular dedicada (en maduración) | **`celestia`** |
| La máxima superficie de disponibilidad con redundancia (en maduración) | **`both`** |

Para saber cómo encaja la DA en el panorama más amplio de la liquidación, consulta **[Visión general de los rollups](/rollups/overview)**. Para la referencia del módulo de más bajo nivel, consulta la página del **[Kit de desarrollo de rollups](/architecture/rollup-development-kit)**.
