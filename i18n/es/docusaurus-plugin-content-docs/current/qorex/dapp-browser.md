---
slug: /qorex/dapp-browser
title: Navegador de dApps
sidebar_label: Navegador de dApps
sidebar_position: 7
---

# Navegador de dApps (móvil)

QoreX incluye un **navegador de dApps** integrado para que puedas usar aplicaciones de QoreChain sin salir de la billetera, con cada firma aprobada de forma explícita.

## Conectarse a una dApp

Abre el **navegador de dApps** desde la pestaña Inicio y navega hasta una aplicación. Escribe o pega la dirección de la dApp en el cuadro **Enter a dApp URL** (solo se conectan las direcciones `https://`). QoreX inyecta sus proveedores en la página como `window.qorex`: un proveedor nativo de QoreChain (incluido `signAndBroadcast`), un proveedor EVM de solo lectura (únicamente consultas de cuenta y de cadena) y un proveedor de Solana; además, se anuncia mediante EIP-6963. Solo establece `window.ethereum` cuando ninguna otra billetera lo ha hecho, y nunca sobrescribe otra billetera. No hay alias `window.keplr`.

- **Conectarse** requiere **una aprobación por origen**. Al aprobar solo se revela tu dirección pública a ese sitio.
- **Cada firma** es su propia aprobación protegida por biometría, con la carga útil **decodificada** para que veas exactamente lo que estás firmando: **no hay firma a ciegas**.
- **Todos los permisos se anulan cuando se cierra el navegador**: las conexiones tienen alcance de sesión.
- **Las transacciones nativas pasan por `signAndBroadcast`:** QoreX muestra cada mensaje, la comisión y la cuenta firmante, añade la capa resistente a la computación cuántica y difunde la transacción. El proveedor EVM de aquí solo responde a consultas de cuenta y de cadena; no firma ni envía transacciones EVM. Consulta [Qué muestra la ventana de aprobación](/qorex/security-and-recovery#approvals).

## Q-Day Scanner

Desde los botones rápidos de la pestaña Inicio también puedes abrir el **Q-Day Scanner**: introduce cualquier dirección para obtener su informe de exposición cuántica, es decir, qué fondos residen en claves solo clásicas y cuáles ya están protegidos post-cuánticamente. Consulta [Seguridad y recuperación](/qorex/security-and-recovery#q-day-scanner).

## Referencia rápida de ajustes

Otras entradas útiles en **Ajustes**:

- **Seguridad** → [Seguridad y recuperación](/qorex/security-and-recovery)
- **Idioma**: sigue al teléfono por defecto; 10 idiomas
- **Volver a hacer el recorrido**: cinco tarjetas breves sobre lo que hace QoreX y dónde está cada cosa
- **Monedas y redes**: todo lo que la billetera puede guardar y enviar hoy
- **Billeteras**: varias frases de recuperación en este teléfono — consulta [Varias billeteras](/qorex/getting-started#several-wallets)
- **Tus cuentas** y **Tus direcciones** → [Cuenta y Dashboard](/qorex/account-and-dashboard)
- **Claim your @handle** y **Linked account** → [Cuenta y Dashboard](/qorex/account-and-dashboard)
- **Usar testnet (desarrolladores)**: cambia a la testnet `qorechain-diana` (EVM chain ID 9800); la aplicación se revincula en vivo, sin reiniciar. El valor predeterminado siempre es mainnet. Los saldos de testnet no muestran valor en USD.
- **Animación de la cartera**: activa o desactiva el fondo Aurora.
- **Eliminar cuenta** → [Elimina tu cuenta](/qorex/account-and-dashboard#delete-account)
- **Connected to**: muestra la red activa y su chain ID.

## Notas de plataforma

- **iOS** (iOS 15.1 o posterior): Face ID (aparece un aviso de uso en el primer uso), una bóveda Secure Enclave, inicio de sesión a través de la hoja de autenticación del sistema y un permiso de cámara para la vinculación de dispositivos y el escaneo de QR.
- **Android** (Android 7.0 o posterior): BiometricPrompt con un Keystore StrongBox, deep links registrados para los flujos `qorex://` (callback de autenticación, connect, tx, link) y un permiso de cámara para la vinculación de dispositivos.

Para dApps de escritorio, usa la [Extensión de navegador](/qorex/browser-extension) en su lugar.
