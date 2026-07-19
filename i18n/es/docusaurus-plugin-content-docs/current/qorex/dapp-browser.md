---
slug: /qorex/dapp-browser
title: Navegador de dApps
sidebar_label: Navegador de dApps
sidebar_position: 7
---

# Navegador de dApps (móvil)

QoreX incluye un **navegador de dApps** integrado para que puedas usar aplicaciones de QoreChain sin salir de la billetera, con cada firma aprobada de forma explícita.

## Conectarse a una dApp

Abre el **navegador de dApps** desde la pestaña Inicio y navega hasta una aplicación. QoreX inyecta sus proveedores en la página: un proveedor de conexión de QoreChain, un proveedor EVM de solo lectura y alias `keplr` / `ethereum` corteses que **nunca secuestran** otras billeteras reales.

- **Conectarse** requiere **una aprobación por origen**. Al aprobar solo se revela tu dirección pública a ese sitio.
- **Cada firma** es su propia aprobación protegida por biometría, con la carga útil **decodificada** para que veas exactamente lo que estás firmando: **no hay firma a ciegas**.
- **Todos los permisos se anulan cuando se cierra el navegador**: las conexiones tienen alcance de sesión.

## Q-Day Scanner

Desde los botones rápidos de la pestaña Inicio también puedes abrir el **Q-Day Scanner**: introduce cualquier dirección para obtener su informe de exposición cuántica, es decir, qué fondos residen en claves solo clásicas y cuáles ya están protegidos post-cuánticamente. Consulta [Seguridad y recuperación](/qorex/security-and-recovery#q-day-scanner).

## Referencia rápida de ajustes

Otros controles útiles en **Ajustes**:

- **Panel de seguridad** → [Seguridad y recuperación](/qorex/security-and-recovery)
- **Tus direcciones** y **Linked account** → [Cuenta y Dashboard](/qorex/account-and-dashboard)
- **Usar testnet (desarrolladores)**: cambia a la testnet `qorechain-diana` (EVM chain ID 9800); la aplicación se revincula en vivo, sin reiniciar. El valor predeterminado siempre es mainnet.
- **Animación de la cartera**: activa o desactiva el fondo Aurora.
- **Estado de la red**: muestra "Connected to …" con los endpoints activos.

## Notas de plataforma

- **iOS**: Face ID (aparece un aviso de uso en el primer uso), una bóveda Secure Enclave, inicio de sesión a través de la hoja de autenticación del sistema y un permiso de cámara para la vinculación de dispositivos y el escaneo de QR.
- **Android**: BiometricPrompt con un Keystore StrongBox, deep links registrados para los flujos `qorex://` (callback de autenticación, connect, tx, link) y un permiso de cámara para la vinculación de dispositivos.

Para dApps de escritorio, usa la [Extensión de navegador](/qorex/browser-extension) en su lugar.
