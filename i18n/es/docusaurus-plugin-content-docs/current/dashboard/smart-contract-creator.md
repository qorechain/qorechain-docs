---
slug: /dashboard/smart-contract-creator
title: Creador de contratos inteligentes
sidebar_label: Creador de contratos inteligentes
sidebar_position: 6
---

# Creador de contratos inteligentes

El **Creador de contratos inteligentes** genera contratos inteligentes a partir de una descripción en lenguaje natural, impulsado por **QCAI**. Describe lo que quieres, elige tu blockchain de destino y QCAI escribe el contrato por ti. Admite **17 blockchains** para las herramientas de IA, de modo que puedas dirigirte al ecosistema para el que estás construyendo.

Conectar tu billetera te permite guardar y administrar los contratos que generes —consulta [Resumen y primeros pasos](/dashboard/overview#connect-your-wallet).

## Generar un contrato

1. **Describe tu contrato.** En el campo de instrucción, escribe lo que debe hacer el contrato —por ejemplo, un token con un suministro fijo, una colección NFT o un calendario de adquisición de derechos (vesting). Cuanto más específico seas, mejor será el resultado.
2. **Elige la blockchain.** Selecciona tu destino entre las blockchains admitidas. El lenguaje del contrato y la categoría de tu elección se muestran junto al selector.
3. **Elige un tipo de contrato** (opcional). Elige una plantilla inicial, como un contrato de token, NFT o gobernanza, para guiar la generación.
4. **Genera.** Selecciona **Generate**. Un indicador de progreso muestra el estado mientras QCAI produce el contrato.

## Revisar el resultado

Cuando termina la generación, el Panel muestra el contrato en una vista con resaltado de sintaxis, junto con detalles como el nombre del contrato, la blockchain, el lenguaje, el tamaño del archivo y la hora de generación. La instrucción que usaste se muestra con el resultado como referencia.

Desde aquí puedes:

- **Copiar** el código del contrato al portapapeles.
- **Descargar** el contrato como un archivo en el formato correcto para la blockchain elegida.
- **Editar** el contrato para refinarlo aún más.

## Compartir y reutilizar

Cada contrato generado tiene su propia página que puedes abrir o compartir. Si abres un contrato que no es tuyo, puedes hacer un **fork** para empezar tu propia copia y continuar desde ahí.

:::tip Revisa y prueba siempre
El código generado por QCAI es un buen punto de partida, no un sustituto de la revisión. Lee el contrato, pruébalo en [testnet](/getting-started/connecting-to-testnet) y pásalo por el [Auditor de contratos](/dashboard/contract-auditor) antes de desplegar nada de valor.
:::

## Relacionado

- [Auditor de contratos](/dashboard/contract-auditor) — ejecuta un análisis de seguridad de QCAI sobre un contrato.
- [Guía para desarrolladores](/developer-guide/evm-development) — despliegue de contratos en los entornos de ejecución de QoreChain.
