---
slug: /dashboard/smart-contract-creator
title: Creador de contratos inteligentes
sidebar_label: Creador de contratos inteligentes
sidebar_position: 6
---

# Creador de contratos inteligentes

El **Creador de contratos inteligentes** genera contratos inteligentes a partir de una descripción en lenguaje natural, impulsado por **QCAI**. Describe lo que quieres, elige tu blockchain de destino y QCAI escribe el contrato por ti. Admite **17 blockchains** para las herramientas de IA, de modo que puedas dirigirte al ecosistema para el que estás construyendo.

Puedes probarlo **sin una cuenta**: un visitante nuevo obtiene una generación gratuita y ve el contrato completo. Para la siguiente, así como para guardar, auditar y desplegar, hace falta una cuenta gratuita; la página ofrece **Create a free account** una vez que se ha usado tu prueba gratuita.

Inicia sesión para guardar y administrar los contratos que generes — consulta [Iniciar sesión](/dashboard/overview#sign-in).

## Generar un contrato

1. **Empieza con un ejemplo o describe el tuyo.** La página se abre con "What would you like to build?". Bajo **Or start from an example:** elige **Token**, **NFT collection**, **Locked vault** o **2-of-3 multisig** — cada uno rellena una descripción completa y selecciona una blockchain y una plantilla adecuadas — o escribe la tuya en **Contract Description**. Cuanto más específico seas, mejor será el resultado.
2. **Elige la blockchain.** Usa **Target Blockchain**. El lenguaje del contrato y la categoría de tu elección se muestran junto al selector.
3. **Elige un tipo de contrato** (opcional). **Contract Type** ofrece una plantilla inicial, como un contrato de token, NFT o gobernanza; déjalo en **Custom (describe in prompt)** para basarte únicamente en tu descripción.
4. **Genera.** Selecciona **Generate Smart Contract**. Un indicador de progreso muestra el estado mientras QCAI produce el contrato.

## Revisar el resultado

Cuando la generación termina, el Dashboard muestra el contrato en una vista con resaltado de sintaxis, junto con detalles como el nombre del contrato, la blockchain, el lenguaje, el tamaño del archivo y la hora de generación. La instrucción que usaste se muestra junto al resultado como referencia.

Desde aquí puedes:

- **Copiar** el código del contrato a tu portapapeles (**Copy Code**).
- **Exportar a PDF** el contrato (**Export PDF**).
- **Descargar** el contrato como un archivo (**Download File**) en el formato adecuado para la blockchain que elegiste.
- **Editar** el contrato (**Edit Contract**) para refinarlo aún más.

## Desplegar tu contrato {#deploy}

### En mainnet (EVM) — despliegue sin custodia {#deploy-mainnet}

El despliegue en mainnet es sin custodia: el Dashboard compila tu contrato y devuelve datos de despliegue **sin firmar** — nunca retiene tus claves ni firma en tu nombre. Tú firmas y difundes el despliegue desde tu propia billetera, y el Dashboard registra después el contrato resultante.

1. Abre el contrato que quieres desplegar (un contrato con destino EVM) y selecciona **Deploy** en **Mainnet**. Si esta es tu primera acción en mainnet, acepta el [reconocimiento de riesgo único](/dashboard/overview#risk-acknowledgement).
2. Conecta **MetaMask** si aún no está conectada — consulta [Resumen y primeros pasos](/dashboard/overview#connect-your-wallet). Desde la versión de cadena v3.2.0, el carril EVM también requiere que la cuenta tenga una clave poscuántica registrada y una **ventana de autorización EVM abierta**, que se abre desde QoreX (consulta [Enviar con MetaMask](/dashboard/wallet#send-metamask)); sin ella, la cadena rechaza el despliegue.
3. El Dashboard compila el contrato y entrega la transacción de despliegue sin firmar a tu billetera.
4. Revisa la transacción en MetaMask — red, gas y datos — y luego confirma para firmarla y difundirla tú mismo.
5. Una vez que el despliegue se confirma en la cadena, el Dashboard registra la dirección del contrato resultante junto a tus contratos guardados.

Solo se pueden desplegar desde el Dashboard los contratos **EVM** (Solidity). Los despliegues de CosmWasm y de programas de Solana no están disponibles por el momento en ninguna de las dos redes.

### En testnet — con un clic {#deploy-testnet}

En testnet, la billetera de prueba administrada por el dashboard firma y envía un despliegue EVM por ti con un solo clic, para que puedas iterar rápidamente con tokens del [Faucet](/dashboard/faucet) antes de pasar a mainnet. Testnet aplica la misma regla del carril EVM que mainnet, por lo que un despliegue aún puede ser rechazado si la cuenta no tiene una clave poscuántica o una ventana EVM abierta.

## Compartir y reutilizar

Cada contrato generado tiene su propia página. Los contratos son **privados por defecto**: solo tú puedes abrir los tuyos. Como propietario verás un botón **Public** / **Private** en la página del contrato; ponlo en **Public** para que cualquiera con el enlace pueda abrir (y hacer fork de) el contrato, y de nuevo en **Private** para retirarlo. Si abres un contrato público que no te pertenece, puedes hacer un **fork** para iniciar tu propia copia y continuar desde ahí.

:::tip Revisa y prueba siempre
El código generado por QCAI es un excelente punto de partida, no un sustituto de la revisión. Lee el contrato, pruébalo en la [testnet](/getting-started/connecting-to-testnet) y pásalo por el [Auditor de contratos](/dashboard/contract-auditor) antes de desplegar cualquier cosa de valor.
:::

## Relacionado

- [Auditor de contratos](/dashboard/contract-auditor) — ejecuta un análisis de seguridad de QCAI sobre un contrato.
- [Guía para desarrolladores](/developer-guide/evm-development) — despliegue de contratos en los entornos de ejecución de QoreChain.
