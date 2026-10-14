---
slug: /qcaia/examples
title: Ejemplos de QCAIA
sidebar_label: Ejemplos
sidebar_position: 4
---

# Ejemplos de QCAIA

A continuación se muestran algunos ejemplos prácticos de cómo hacerle preguntas a QCAIA y el tipo de respuesta que ofrece. Las preguntas usan la sintaxis `/ask` de Discord; en Telegram harías la misma pregunta mencionando a **`@QCAIA_Bot`** o a QoreChain (consulta [Telegram](/qcaia/telegram)).

Estas respuestas son **ilustrativas** — paráfrasis breves y en lenguaje sencillo de la documentación pública de QoreChain. La redacción en vivo de QCAIA variará, y se encuentra en **beta**.

## Ejemplo 1 — El puente

**Tú preguntas:**

```
/ask How does QoreChain's bridge work?
```

**QCAIA responde:**

> El puente de QoreChain está diseñado para mover activos entre QoreChain y otras redes, combinando transferencias QCB con IBC. Todavía no está en funcionamiento: todas las configuraciones de cadena siguen pendientes y no hay ningún canal IBC abierto en ninguna de las dos redes. Para conocer el diseño completo, consulta la documentación del puente.

_Más información: [Arquitectura del puente](/architecture/bridge-architecture)._

## Ejemplo 2 — PRISM

**Tú preguntas:**

```
/ask What is PRISM?
```

**QCAIA responde:**

> PRISM es la capa de optimización por aprendizaje por refuerzo de QoreChain, diseñada para ajustar los parámetros de la red a medida que cambian las condiciones. Hoy funciona en modo de observación: registra observaciones, pero todavía no hay cargada ninguna política entrenada. Puedes leer el análisis detallado en la documentación de PRISM.

_Más información: [Motor de consenso PRISM](/architecture/prism-consensus-engine)._

## Ejemplo 3 — Distribución de comisiones

**Tú preguntas:**

```
/ask What is the QOR fee distribution?
```

**QCAIA responde:**

> Las comisiones de transacción en QoreChain se reparten entre varios destinos: 37% / 30% / 20% / 10% / 3%. Esto distribuye el valor entre las personas y funciones que mantienen la red en funcionamiento. Consulta la documentación de tokenómica para conocer el desglose de cada parte.

## Ejemplo 4 — Multilingüe (Español)

QCAIA traduce automáticamente las preguntas que no están en inglés, las responde y contesta. Aquí lo tienes en español:

**Tú preguntas:**

```
/ask ¿Qué es QoreChain?
```

**QCAIA responde:**

> QoreChain es una blockchain de capa 1 con seguridad post-cuántica, un motor de IA (QCAI) y el motor de consenso PRISM. Está diseñada para ser rápida, segura y preparada para el futuro.

Lo mismo funciona en Telegram — solo escribe tu pregunta en tu idioma mientras mencionas a **`@QCAIA_Bot`** o a QoreChain.

## Ejemplo 5 — Orientación rápida

**Tú preguntas:**

```
/about
```

**QCAIA responde:**

> Soy QCAIA, el Asistente de IA de QoreChain (beta). Pregúntame sobre la tecnología, la tokenómica, el equipo y el ecosistema de QoreChain en Discord o Telegram. Prueba `/ask` seguido de tu pregunta, o usa `/tokenomics` para un resumen rápido de QOR.

---

¿Listo para probarlo tú mismo? Únete a [Discord](/qcaia/discord) o [Telegram](/qcaia/telegram) y hazle una pregunta a QCAIA.
