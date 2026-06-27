---
slug: /dashboard/wallet
title: Monedero
sidebar_label: Monedero
sidebar_position: 3
---

# Monedero

La página de **Monedero** es donde consultas tu saldo, envías y recibes QOR, y gestionas tus direcciones. Tus cuentas de QoreChain están protegidas con criptografía resistente a la computación cuántica, y cada dirección usa el prefijo bech32 `qor` (`qor1...`).

Conecta primero tu monedero — consulta [Resumen y primeros pasos](/dashboard/overview#connect-your-wallet).

## Qué muestra la página

- La etiqueta de tu monedero y la dirección activa, en forma abreviada, con un botón de copiado de un solo clic.
- Tu **saldo total** en QOR.
- Un panel de seguridad que indica el cifrado resistente a la computación cuántica y la red conectada.
- Un indicador de última actualización con un control para refrescar.
- Pestañas de **Activos** y **Actividad** que muestran tus tenencias y tu historial de transacciones.

Usa el control de refresco en cualquier momento para obtener tu saldo actual y tu actividad más reciente desde la cadena.

## Enviar QOR

1. Selecciona **Enviar**.
2. Introduce la dirección del destinatario (`qor1...`).
3. Introduce el importe y un memo opcional.
4. Revisa los detalles y la comisión estimada, y luego confirma.

A medida que escribes un destinatario, se sugieren contactos guardados y direcciones recientes para ayudarte a evitar errores. Tras enviar la transferencia, recibes una confirmación con el hash de la transacción, que puedes abrir en el [Explorador](/dashboard/explorer).

:::caution Verifica la dirección dos veces
Las transferencias en blockchain son irreversibles. Confirma siempre la dirección del destinatario antes de enviar.
:::

## Recibir QOR

1. Selecciona **Recibir**.
2. Comparte tu dirección o su código QR con el remitente, o copia la dirección con un solo clic.
3. Opcionalmente, introduce un importe solicitado y un memo para generar un enlace de pago y un código QR descargable.

## Gestionar tus monederos

Selecciona **Mis monederos** para abrir tu lista de direcciones. Desde ahí puedes cambiar entre monederos, crear un monedero nuevo, importar uno existente o eliminar un monedero que ya no necesites. El monedero activo es el que se utiliza para enviar, intercambiar, hacer staking y otras acciones firmadas en todo el Dashboard.

## Relacionado

- [Operaciones con tokens](/user-guide/token-operations) — conceptos detrás de las transferencias y denominaciones de QOR.
- [Trade](/dashboard/trade) — intercambia tus tokens en el AMM on-chain.
- [Bridge](/dashboard/bridge) — mueve activos hacia y desde otras cadenas.
