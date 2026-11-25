---
slug: /qorex/dapp-browser
title: Navegador de dApps
sidebar_label: Navegador de dApps
sidebar_position: 7
---

# Navegador de dApps (móvil)

QoreX incluye un **navegador de dApps** integrado para que puedas usar aplicaciones de QoreChain sin salir de la billetera, con cada firma aprobada de forma explícita. Está pensado para usuarios móviles que quieren usar una aplicación web sin instalar nada más, y para desarrolladores que prueban su aplicación dentro de la billetera móvil.

## Innovaciones {#innovations}

- **Una aprobación por sitio, siempre revocable.** Cada origen se aprueba por separado; los sitios conectados se guardan en este dispositivo, por billetera, y puedes revocar cualquiera de ellos en [La protección de mi dinero](/qorex/security-and-recovery#protection).
- **Firmas decodificadas y protegidas por biometría.** Cada firma es su propia aprobación, con la carga útil decodificada; lo que QoreX no puede decodificar, lo rechaza.
- **`signAndBroadcast`.** Una página envía los mensajes; QoreX los muestra, añade la capa ML-DSA-87 que solo la billetera puede crear y los difunde.
- **Firma EVM y de mensajes en el navegador.** Las dApps EVM pueden firmar mensajes, datos tipados y transacciones en QoreChain, y lo que hace cada una se decodifica y se simula primero; además, cualquier página puede pedir una firma de mensaje que también lleve una mitad ML-DSA-87.
- **Abrir una página desde un enlace.** Un enlace `browse` abre tu página directamente en el navegador de dApps, y la página de inicio guarda en el dispositivo tus sitios favoritos y recientes.
- **Descubrimiento sin apropiarse.** QoreX se anuncia mediante EIP-6963 y nunca sobrescribe el `window.ethereum` ni el `window.keplr` de otra billetera.

## Cómo acceder {#how-to-access}

El navegador de dApps forma parte de la aplicación móvil: instálala desde la App Store (iOS 15.1 o posterior) o Google Play (Android 7.0 o posterior); los enlaces están en la [descripción general](/qorex/overview#how-to-access). No necesita ninguna cuenta. Para dApps de escritorio, usa la [Extensión de navegador](/qorex/browser-extension).

## Conectarse a una dApp {#how-to-use}

Abre el **navegador de dApps** desde la pestaña Inicio y navega hasta una aplicación. Escribe o pega la dirección de la dApp en el cuadro **Introduce la URL de una dApp** (solo se conectan las direcciones `https://`). QoreX inyecta sus proveedores en la página como `window.qorex` - un proveedor nativo de QoreChain (incluidos `signAndBroadcast`, `signDirect` y la firma de mensajes), un proveedor EVM y un objeto proveedor de Solana - y además se anuncia mediante EIP-6963. Solo establece `window.ethereum` cuando ninguna otra billetera lo ha hecho, y nunca sobrescribe otra billetera. No hay alias `window.keplr`. Para desarrolladores: consulta [Integrar una dApp con QoreX](/qorex/dapp-integration).

### Sitios favoritos y recientes {#favourites}

La página de inicio del navegador enumera tus **Favoritos** y tus sitios **Recientes** (los últimos 8). Toca la estrella de la barra de direcciones para guardar como favorita la página abierta (tócala otra vez para quitarla) y usa el botón de inicio para volver a la lista. **Borrar** vacía la lista de recientes. Una página que abriste desde un [enlace browse](#browse-links) cuenta como una visita. Ambas listas permanecen en este teléfono, guardadas sin la consulta ni el fragmento de la página.

### Abrir una página desde un enlace {#browse-links}

Un enlace en la web puede abrir una página en el navegador de dApps: `https://link.qore.network/browse?url=<encoded https address>` o `qorex://browse?url=<encoded https address>`. QoreX pide primero la solicitud biométrica que abre el navegador de dApps. Rechaza una dirección que no sea `https://` en un nombre de dominio, o que tenga un puerto, un nombre de usuario, una dirección IP o `localhost`. El enlace no da nada a la página: sigue teniendo que pedir conectarse, y cada firma sigue pasando por la hoja de aprobación. Si no hay billetera en el teléfono, la app se queda en la incorporación. Consulta [Enlaces que un servicio puede generar](/qorex/dapp-integration#links).

- **Conectarse** requiere **una aprobación por origen**. Al aprobar solo se revela tu dirección pública a ese sitio.
- **Cada firma** es su propia aprobación protegida por biometría, con la carga útil **decodificada** para que veas exactamente lo que estás firmando - **no hay firma a ciegas**.
- **Las conexiones duran hasta que las revocas.** Desde la 1.2.5, la dirección del sitio se guarda en este dispositivo, por billetera. Consulta y revoca los sitios conectados en [La protección de mi dinero](/qorex/security-and-recovery#protection). Una conexión nunca firma nada por sí sola: cada firma sigue necesitando su propia aprobación.
- **Las transacciones nativas pasan por `signAndBroadcast`:** QoreX muestra cada mensaje, la comisión y la cuenta firmante, añade la capa ML-DSA-87 y difunde la transacción. Consulta [Qué muestra la ventana de aprobación](/qorex/security-and-recovery#approvals).
- **Las dApps EVM** pueden pedir `personal_sign`, datos tipados y transacciones en QoreChain. La aprobación los decodifica y muestra lo que la transacción hace con tu saldo cuando la red lo permite. En el carril EVM de QoreChain la aprobación también abre la breve ventana de autorización que necesita la transacción y nombra todos los contratos que admite; consulta [Ventana de acceso EVM](/qorex/security-and-recovery#evm-window). Solo las cuentas importadas de MetaMask pueden enviar en ese carril.
- **Firma de mensajes:** una página puede pedirte que firmes un mensaje; primero lo ves entero.
- **Red:** una página no puede cambiar la red. Cámbiala en el propio QoreX (consulta los ajustes más abajo); la página debe estar en la misma red que la billetera.

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
- **Modo desarrollador** - desactivado por defecto; añade una pestaña Desarrollo con herramientas para quienes construyen sobre QoreChain. Consulta [Modo desarrollador](/qorex/developer-mode).
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
- El navegador integrado firma solo en la red activa de QoreChain y emite únicamente el evento EVM `connect`: se cierra para cambiar de cuenta o de red. No firma transacciones de Solana y no tiene red de Ethereum.
- `window.qorex.native` es de estilo Keplr, no un reemplazo directo de Keplr, y no hay alias `window.keplr`. La firma Amino se rechaza.
- El Q-Day Scanner, la recuperación social y Legacy están en la aplicación, no en la extensión.
