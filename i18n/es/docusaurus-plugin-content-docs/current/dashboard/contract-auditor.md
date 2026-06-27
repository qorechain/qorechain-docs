---
slug: /dashboard/contract-auditor
title: Auditor de Contratos
sidebar_label: Auditor de Contratos
sidebar_position: 7
---

# Auditor de Contratos

El **Auditor de Contratos** ejecuta un análisis de seguridad impulsado por IA de un contrato inteligente, con la tecnología de **QCAI**. Envía un contrato y QCAI lo revisa en busca de vulnerabilidades, asigna un nivel de riesgo general y una puntuación de seguridad, y explica cada hallazgo con una corrección recomendada. Al igual que el [Creador de Contratos Inteligentes](/dashboard/smart-contract-creator), el Auditor funciona en **17 blockchains** para las herramientas de IA.

## Ejecutar una auditoría

1. Abre el **Auditor** y proporciona el contrato que quieres analizar.
2. Inicia la auditoría. QCAI revisa el contrato y produce un informe.

## Leer el informe

Un informe de auditoría se abre en su propia página e incluye:

- **Nivel de riesgo** — una calificación general (por ejemplo crítico, alto, medio o bajo), codificada por colores para una revisión rápida.
- **Puntuación de seguridad** — una puntuación general de 0 a 100.
- **Desglose por severidad** — cuántos hallazgos corresponden a cada nivel de severidad (crítico, alto, medio, bajo e informativo).
- **Resumen** — una breve visión general de la postura de seguridad del contrato.

### Hallazgos

Cada hallazgo indica su severidad, un título, la ubicación en el código a la que se refiere, una descripción del problema y una corrección recomendada. Cuando un contrato no tiene problemas en un nivel determinado, el informe lo indica.

Cuando corresponde, el informe también incluye secciones de recomendaciones generales, optimizaciones de gas, buenas prácticas y aspectos positivos que el contrato ya hace correctamente.

## Revisar auditorías anteriores

La lista de auditorías muestra tus informes anteriores en una tabla con el nombre del contrato, la blockchain, el nivel de riesgo, la puntuación de seguridad y cuándo se creó cada uno. Un cuadro de búsqueda filtra por nombre de contrato o blockchain. Selecciona cualquier fila para volver a abrir el informe completo y usa el enlace a la página del propio informe para compartirlo.

:::tip Audita antes de desplegar
Ejecuta una auditoría como último paso antes de desplegar, y vuelve a ejecutarla después de cualquier cambio. Trata los hallazgos como una guía que debes verificar, no como una garantía automática: combina el informe con tus propias pruebas en [testnet](/getting-started/connecting-to-testnet).
:::

## Relacionado

- [Creador de Contratos Inteligentes](/dashboard/smart-contract-creator) — genera contratos con QCAI.
- [Seguridad Poscuántica](/architecture/post-quantum-security) — cómo QoreChain protege las cuentas y las firmas.
