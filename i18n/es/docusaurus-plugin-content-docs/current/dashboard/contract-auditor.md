---
slug: /dashboard/contract-auditor
title: Auditor de Contratos
sidebar_label: Auditor de Contratos
sidebar_position: 7
---

# Auditor de Contratos

El **Auditor de Contratos** (barra lateral **Build**, entrada **AI Audit**) ejecuta una revisión de seguridad del código fuente de un contrato pegado con **QCAIA**, el asistente de IA de QoreChain, y devuelve una puntuación, un nivel de riesgo y hallazgos con las correcciones recomendadas. Está pensado para desarrolladores que quieren una segunda mirada rápida a un contrato antes de probarlo y desplegarlo. No es una auditoría formal y no sustituye la revisión humana.

## Innovaciones {#innovations}

- **Detección automática de la blockchain.** "Auto-detect from code" es la opción por defecto; en su lugar puedes elegir uno de 17 ecosistemas.
- **Un porcentaje de preparación poscuántica aparte** junto a la Security Score de 0 a 100, informado por separado para que no se mezcle con la puntuación de seguridad.
- **Una auditoría gratuita cada día UTC.** La primera auditoría de cada día UTC es gratuita. Después, en testnet cada auditoría se paga con QOR de prueba tras un diálogo "Confirm Security Audit" que muestra el "Audit Cost"; en mainnet, las auditorías adicionales esperan al siguiente día UTC.
- **Informes privados por defecto.** El propietario cambia la visibilidad; un informe público nunca muestra el nombre ni la IP del propietario.
- **Hallazgos con correcciones, no solo etiquetas.** Cada hallazgo tiene una severidad, una ubicación, una descripción y una corrección recomendada, y el informe completo añade recomendaciones, optimizaciones de gas, buenas prácticas y aspectos positivos.

## Cómo usarlo {#how-to-use}

### Ejecutar una auditoría

1. Inicia sesión (obligatorio) y abre **AI Audit**.
2. Rellena **Blockchain** (por defecto "Auto-detect from code"), **Name (Optional)** y **Contract Source Code**.
3. Selecciona **Run Security Audit** y luego confirma el diálogo "Confirm Security Audit".
4. El **Security Report** aparece en línea en la misma página. **Export PDF** lo guarda.

**Ejemplo mínimo:** pega un ERC-20, deja la detección automática, **Run Security Audit**, Confirm, **Export PDF**.

### Leer el informe

El informe en línea muestra:

- **Risk Level**, codificado por colores;
- **Security Score** de 0 a 100, y el porcentaje de preparación poscuántica;
- un **Executive Summary**;
- **Vulnerabilities Found (N Issues)**, con severidades Critical, High, Medium, Low e Info. Un resultado limpio dice "No vulnerabilities detected".

Cada hallazgo indica severidad, título, la ubicación en el código, una descripción y una corrección recomendada.

La página del informe completo `/audits/<id>` añade el desglose por severidad, **Recommendations**, **Gas optimizations**, **Best practices**, **Positive aspects** y, para el propietario, el interruptor de visibilidad.

### Auditorías anteriores y cómo compartir

- Tus propios informes están en **Profile > Audited**.
- La lista **All Security Audits** en `/audits` (enlazada desde la página de inicio) muestra las últimas auditorías de todos los usuarios en una tabla con nombre del contrato, blockchain, nivel de riesgo, puntuación y fecha. Un cuadro de búsqueda filtra por nombre, blockchain o nivel de riesgo. Una fila solo se abre si el informe es público o tuyo.
- En un informe de tu propiedad, un interruptor en la parte superior dice "This report is private". Actívalo para hacer público el informe y que cualquiera con el enlace pueda leerlo (tu nombre y tu IP nunca se muestran), y desactívalo para volver a hacerlo privado.

:::tip Audita antes de desplegar
Ejecuta una auditoría como último paso antes de desplegar, y vuelve a ejecutarla después de cualquier cambio. Trata los hallazgos como una guía que debes verificar, no como una garantía, y combina el informe con tus propias pruebas en [testnet](/getting-started/connecting-to-testnet).
:::

## Cómo acceder {#how-to-access}

- **URL:** [dashboard.qorechain.io/audit](https://dashboard.qorechain.io/audit), o **New Audit** en la página de inicio.
- **Cuenta:** se requiere iniciar sesión para ejecutar una auditoría. La lista `/audits` y los informes públicos en `/audits/<id>` se abren sin cuenta.
- **Redes:** funciona en ambas. La regla de la auditoría diaria gratuita es la misma; las auditorías adicionales de pago existen solo en testnet.
- **Coste:** la primera auditoría de cada día UTC es gratuita; las adicionales en testnet cuestan QOR de prueba; las adicionales en mainnet esperan al día siguiente.

## Dónde está publicado {#where-published}

| Superficie | Dirección | Cuenta |
| --- | --- | --- |
| Ejecutar una auditoría | `dashboard.qorechain.io/audit` | Requiere iniciar sesión |
| All Security Audits | `dashboard.qorechain.io/audits` | Ninguna |
| Un informe | `dashboard.qorechain.io/audits/<id>` | Ninguna si es público; si no, el propietario |

## Límites y problemas conocidos {#limits}

- Revisa solo el código fuente que pegas, sin compilación, pruebas ni análisis en tiempo de ejecución. Los hallazgos pueden ser incompletos o incorrectos.
- Un informe privado no puede abrirlo nadie salvo su propietario, ni siquiera con el enlace.

## Relacionado

- [Creador de Contratos Inteligentes](/dashboard/smart-contract-creator) - genera contratos con QCAIA.
- [Seguridad Poscuántica](/architecture/post-quantum-security) - cómo QoreChain protege las cuentas y las firmas.
