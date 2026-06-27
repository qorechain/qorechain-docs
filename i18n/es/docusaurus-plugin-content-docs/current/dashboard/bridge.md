---
slug: /dashboard/bridge
title: Puente
sidebar_label: Puente
sidebar_position: 5
---

# Puente

El **Puente** te permite mover activos entre QoreChain y otras cadenas desde una sola pantalla. Cada operación del puente está protegida por criptografía poscuántica. Para conocer el diseño detrás de las transferencias entre cadenas, consulta [Arquitectura del Puente](/architecture/bridge-architecture).

:::caution Estado cualificado
El puente entre cadenas se encuentra actualmente en testnet y se está desplegando de forma progresiva: todavía no es un sistema de mainnet en producción. Trata las rutas disponibles como un trabajo en curso en lugar de conectividad garantizada en vivo, y comienza en testnet.
:::

Conecta tu monedero para usar el Puente: consulta [Visión general y primeros pasos](/dashboard/overview#connect-your-wallet).

## Cómo transferir un activo por el puente

1. Elige la cadena y el token de **origen** en el selector superior. El selector muestra el token, su red y tu saldo.
2. Elige la cadena y el token de **destino** en el selector inferior.
3. Introduce la cantidad a transferir. Se muestra la cantidad que recibirás en el lado de destino.
4. Para enviar los activos a una dirección distinta a la tuya, activa **Enviar a otra** e introduce el destinatario.
5. Revisa la **comisión** y el **tiempo estimado** de liquidación que se muestran en la parte inferior.
6. Confirma la transferencia en tu monedero.

Un control de intercambio entre los dos selectores te permite invertir el origen y el destino con un solo toque.

## Consejos

- Confirma ambas cadenas y la dirección de destino antes de enviar: las transferencias entre cadenas no se pueden revertir.
- El tiempo de liquidación varía según la ruta; la estimación se actualiza a medida que cambias las cadenas y las cantidades.
- Para obtener más información sobre cómo se validan las transferencias entre cadenas, consulta [Transferencia de activos por el puente](/user-guide/bridging-assets) y [Arquitectura del Puente](/architecture/bridge-architecture).
