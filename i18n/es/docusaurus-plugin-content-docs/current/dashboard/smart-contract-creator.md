---
slug: /dashboard/smart-contract-creator
title: Creador de contratos inteligentes
sidebar_label: Creador de contratos inteligentes
sidebar_position: 6
---

# Creador de contratos inteligentes

El **Creador de contratos inteligentes** genera contratos inteligentes a partir de una descripción en lenguaje natural, impulsado por **QCAI**. Describe lo que quieres, elige tu blockchain de destino y QCAI escribe el contrato por ti. Admite **17 blockchains** para las herramientas de IA, de modo que puedas dirigirte al ecosistema para el que estás construyendo.

Conectar tu billetera te permite guardar y administrar los contratos que generes — consulta [Resumen y primeros pasos](/dashboard/overview#connect-your-wallet).

## Generar un contrato

1. **Describe tu contrato.** En el campo de instrucción, escribe lo que debe hacer el contrato — por ejemplo, un token con un suministro fijo, una colección NFT o un calendario de adquisición de derechos (vesting). Cuanto más específico seas, mejor será el resultado.
2. **Elige la blockchain.** Selecciona tu destino entre las blockchains admitidas. El lenguaje del contrato y la categoría de tu elección se muestran junto al selector.
3. **Elige un tipo de contrato** (opcional). Elige una plantilla inicial, como un contrato de token, NFT o gobernanza, para guiar la generación.
4. **Genera.** Selecciona **Generate**. Un indicador de progreso muestra el estado mientras QCAI produce el contrato.

## Revisar el resultado

Cuando la generación termina, el Dashboard muestra el contrato en una vista con resaltado de sintaxis, junto con detalles como el nombre del contrato, la blockchain, el lenguaje, el tamaño del archivo y la hora de generación. La instrucción que usaste se muestra junto al resultado como referencia.

Desde aquí puedes:

- **Copiar** el código del contrato a tu portapapeles.
- **Descargar** el contrato como un archivo en el formato adecuado para la blockchain que elegiste.
- **Editar** el contrato para refinarlo aún más.

## Desplegar tu contrato {#deploy}

### En mainnet (EVM) — despliegue sin custodia {#deploy-mainnet}

El despliegue en mainnet es sin custodia: el Dashboard compila tu contrato y devuelve datos de despliegue **sin firmar** — nunca retiene tus claves ni firma en tu nombre. Tú firmas y difundes el despliegue desde tu propia billetera, y el Dashboard registra después el contrato resultante.

1. Abre el contrato que quieres desplegar (un contrato con destino EVM) y selecciona **Deploy** en **Mainnet**. Si esta es tu primera acción en mainnet, acepta el [reconocimiento de riesgo único](/dashboard/overview#risk-acknowledgement).
2. Conecta **MetaMask** si aún no está conectada — consulta [Resumen y primeros pasos](/dashboard/overview#connect-your-wallet).
3. El Dashboard compila el contrato y entrega la transacción de despliegue sin firmar a tu billetera.
4. Revisa la transacción en MetaMask — red, gas y datos — y luego confirma para firmarla y difundirla tú mismo.
5. Una vez que el despliegue se confirma en la cadena, el Dashboard registra la dirección del contrato resultante junto a tus contratos guardados.

En mainnet, por ahora solo los despliegues **EVM** están disponibles de esta manera; los despliegues **Wasm** y **SVM** son solo para testnet.

### En testnet — con un clic {#deploy-testnet}

El flujo de testnet no cambia: la billetera de prueba administrada por el dashboard firma y envía el despliegue por ti con un solo clic, para que puedas iterar rápidamente con tokens del [Faucet](/dashboard/faucet) antes de pasar a mainnet. Testnet admite despliegues EVM, Wasm y SVM.

## Compartir y reutilizar

Cada contrato generado tiene su propia página, que puedes abrir o compartir. Si abres un contrato que no te pertenece, puedes hacer un **fork** para iniciar tu propia copia y continuar desde ahí.

:::tip Revisa y prueba siempre
El código generado por QCAI es un excelente punto de partida, no un sustituto de la revisión. Lee el contrato, pruébalo en la [testnet](/getting-started/connecting-to-testnet) y pásalo por el [Auditor de contratos](/dashboard/contract-auditor) antes de desplegar cualquier cosa de valor.
:::

## Relacionado

- [Auditor de contratos](/dashboard/contract-auditor) — ejecuta un análisis de seguridad de QCAI sobre un contrato.
- [Guía para desarrolladores](/developer-guide/evm-development) — despliegue de contratos en los entornos de ejecución de QoreChain.
