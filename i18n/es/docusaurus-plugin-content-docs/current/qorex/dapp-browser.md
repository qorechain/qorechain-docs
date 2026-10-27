---
slug: /qorex/dapp-browser
title: Navegador de dApps
sidebar_label: Navegador de dApps
sidebar_position: 7
---

# Navegador de dApps (móvil)

QoreX incluye un **navegador de dApps** integrado para que puedas usar aplicaciones de QoreChain sin salir de la billetera, con cada firma aprobada de forma explícita. Está pensado para usuarios móviles que quieren usar una aplicación web sin instalar nada más, y para desarrolladores que prueban su aplicación dentro de la billetera móvil.

## Innovaciones {#innovations}

- **Conexiones con alcance de sesión.** Una aprobación por origen, y toda conexión termina cuando cierras el navegador.
- **Firmas decodificadas y protegidas por biometría.** Cada firma es su propia aprobación, con la carga útil decodificada; lo que QoreX no puede decodificar, lo rechaza.
- **`signAndBroadcast`.** Una página envía los mensajes; QoreX los muestra, añade la capa ML-DSA-87 que solo la billetera puede crear y los difunde.
- **Descubrimiento sin apropiarse.** QoreX se anuncia mediante EIP-6963 y nunca sobrescribe el `window.ethereum` ni el `window.keplr` de otra billetera.

## Cómo acceder {#how-to-access}

El navegador de dApps forma parte de la aplicación móvil: instálala desde la App Store (iOS 15.1 o posterior) o Google Play (Android 7.0 o posterior); los enlaces están en la [descripción general](/qorex/overview#how-to-access). No necesita ninguna cuenta. Para dApps de escritorio, usa la [Extensión de navegador](/qorex/browser-extension).

## Conectarse a una dApp {#how-to-use}

Abre el **navegador de dApps** desde la pestaña Inicio y navega hasta una aplicación. Escribe o pega la dirección de la dApp en el cuadro **Enter a dApp URL** (solo se conectan las direcciones `https://`). QoreX inyecta sus proveedores en la página como `window.qorex` - un proveedor nativo de QoreChain (incluido `signAndBroadcast`), un proveedor EVM de solo lectura (únicamente consultas de cuenta y de cadena) y un proveedor de Solana - y además se anuncia mediante EIP-6963. Solo establece `window.ethereum` cuando ninguna otra billetera lo ha hecho, y nunca sobrescribe otra billetera. No hay alias `window.keplr`.

- **Conectarse** requiere **una aprobación por origen**. Al aprobar solo se revela tu dirección pública a ese sitio.
- **Cada firma** es su propia aprobación protegida por biometría, con la carga útil **decodificada** para que veas exactamente lo que estás firmando - **no hay firma a ciegas**.
- **Todos los permisos se anulan cuando se cierra el navegador** - las conexiones tienen alcance de sesión.
- **Las transacciones nativas pasan por `signAndBroadcast`:** QoreX muestra cada mensaje, la comisión y la cuenta firmante, añade la capa ML-DSA-87 y difunde la transacción. El proveedor EVM de aquí solo responde a consultas de cuenta y de cadena; no firma ni envía transacciones EVM. Consulta [Qué muestra la ventana de aprobación](/qorex/security-and-recovery#approvals).

## Q-Day Scanner

Desde los botones rápidos de la pestaña Inicio también puedes abrir el **Q-Day Scanner**: introduce cualquier dirección de Bitcoin o Ethereum para obtener un informe de exposición. Consulta [Seguridad y recuperación](/qorex/security-and-recovery#q-day-scanner).

## Referencia rápida de ajustes

Otras entradas útiles en **Ajustes**:

- **Seguridad** → [Seguridad y recuperación](/qorex/security-and-recovery)
- **Idioma** - sigue al teléfono por defecto; 10 idiomas
- **Volver a hacer el recorrido** - cinco tarjetas breves sobre lo que hace QoreX y dónde está cada cosa
- **Monedas y redes** - todo lo que la billetera puede guardar y enviar hoy
- **Billeteras** - varias frases de recuperación en este teléfono - consulta [Varias billeteras](/qorex/getting-started#several-wallets)
- **Tus cuentas** y **Tus direcciones** → [Cuenta y Dashboard](/qorex/account-and-dashboard)
- **Claim your @handle** y **Linked account** → [Cuenta y Dashboard](/qorex/account-and-dashboard)
- **Usar testnet (desarrolladores)** - cambia a la testnet `qorechain-diana` (EVM chain ID 9800); la aplicación se revincula en vivo, sin reiniciar. El valor predeterminado siempre es mainnet. Los saldos de testnet no muestran valor en USD.
- **Animación de la cartera** - activa o desactiva el fondo Aurora.
- **Eliminar cuenta** → [Elimina tu cuenta](/qorex/account-and-dashboard#delete-account)
- **Connected to** - muestra la red activa y su chain ID.

## Notas de plataforma

- **iOS** (iOS 15.1 o posterior) - Face ID (aparece un aviso de uso en el primer uso), una bóveda Secure Enclave, inicio de sesión a través de la hoja de autenticación del sistema y un permiso de cámara para la vinculación de dispositivos y el escaneo de QR.
- **Android** (Android 7.0 o posterior) - BiometricPrompt con un Keystore StrongBox, deep links registrados para los flujos `qorex://` (callback de autenticación, connect, tx, link) y un permiso de cámara para la vinculación de dispositivos.

Para dApps de escritorio, usa la [Extensión de navegador](/qorex/browser-extension) en su lugar.

## Dónde se publica {#where-published}

El navegador de dApps se distribuye dentro de la aplicación móvil de QoreX (App Store y Google Play); consulta [Dónde se publica](/qorex/overview#where-published) para ver las fichas y las versiones actuales. No es una descarga aparte.

## Límites y problemas conocidos {#limits}

- Solo se conectan las direcciones `https://`.
- El proveedor EVM de aquí responde únicamente a consultas de cuenta y de cadena; no firma ni envía transacciones ni mensajes EVM. `signArbitrary` (firma de mensajes) no está soportado.
- `window.qorex.native` es de estilo Keplr, no un reemplazo directo de Keplr, y no hay alias `window.keplr`.
- Las conexiones no persisten: terminan cuando se cierra el navegador.
- El Q-Day Scanner, la recuperación social y Legacy están en la aplicación, no en la extensión.
