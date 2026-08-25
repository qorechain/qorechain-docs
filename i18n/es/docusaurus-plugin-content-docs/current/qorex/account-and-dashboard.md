---
slug: /qorex/account-and-dashboard
title: Cuenta y Dashboard
sidebar_label: Cuenta y Dashboard
sidebar_position: 6
---

# Cuenta y Dashboard

QoreX funciona **completamente sin una cuenta**: tus claves nunca dependen de una. Iniciar sesión solo añade comodidades como los @handles, las solicitudes de pago y el emparejamiento con el Dashboard.

## Iniciar sesión {#sign-in}

Puedes iniciar sesión desde **Sign in** en la pestaña de inicio, o durante la incorporación. Métodos:

- **Código por correo electrónico** — introduce tu correo electrónico y recibe un código de un solo uso. Después de este inicio de sesión, QoreX te ofrece añadir una **passkey** para futuros inicios de sesión instantáneos (Face ID / Touch ID / PIN). Esta es una passkey de *cuenta*: nunca toca las claves de tu monedero.
- **Passkey** — si registraste una anteriormente.
- **Continue with Google** — un único salto nativo a través de la hoja de autenticación del sistema (la app nunca te redirige a un navegador).
- **Continue with QORECHAIN Dashboard** — inicia sesión con una cuenta de Dashboard existente (incluido su inicio de sesión de Google) e importa tu perfil.

:::note
La oferta de passkey solo aparece después de iniciar sesión con **código por correo electrónico**. Cuando inicias sesión con un proveedor de identidad (Google o Dashboard), ese proveedor gestiona su propia autenticación, por lo que no se puede asociar una passkey a esas cuentas.
:::

## Varias cuentas a partir de una frase {#accounts}

Settings → **Your accounts** (también encontrable como **Addresses**) te permite crear, cambiar y renombrar hasta **20 cuentas**, todas derivadas de la misma frase de recuperación de 24 palabras (no hay nada adicional que respaldar). Cada cuenta tiene su propia dirección `qor1…` distinta con su propio saldo y —dado que un handle se vincula a una **dirección**, no al monedero en su conjunto— su propio @handle opcional. La cuenta que esté activa es la que usan Send, Receive, Staking y el navegador de dApps. Desde la versión **0.2.2**, la extensión de navegador también cuenta con esta función; consulta [Varias cuentas a partir de una frase](/qorex/browser-extension#wallet).

## @handle {#handle}

Reclama un nombre único (por ejemplo, `@liviu`) vinculado a tu dirección mediante **firmas duales** (una firma ed25519 del registro + tu propia firma secp256k1). A partir de ahí, cualquiera puede enviarte a tu @handle. La resolución es de tipo **verify-then-pin** (confianza en el primer uso), de modo que si la clave de un handle llega a cambiarse silenciosamente, QoreX lo marca.

Dado que un handle se vincula a una dirección y no a tu monedero, reclamarlo es **por dirección**: si tienes [varias cuentas](#accounts), cada una puede tener su propio @handle, y reclamar uno para una cuenta no le da automáticamente un nombre a las demás. La extensión de navegador también puede reclamar un handle para su única dirección, directamente desde el popup.

Si el registro de handles no está disponible temporalmente, la pantalla se reduce a **"Handles coming soon"** y todo lo demás sigue funcionando; los handles vuelven a activarse automáticamente cuando el registro vuelve a estar disponible.

:::note Reclamar un handle frente a vincular con el Dashboard
Se trata de dos acciones separadas y no relacionadas. Reclamar un @handle permite que **otras personas te envíen fondos por tu nombre**; no hace nada más por sí solo. Vincular con el Dashboard (más abajo) conecta tu monedero con una cuenta de Dashboard para que ambos puedan mostrar los mismos datos. Puedes hacer una sin la otra.
:::

## Cuenta vinculada {#linked-account}

**Settings → Linked account** conecta tu monedero QoreX y tu cuenta de Dashboard en ambos sentidos:

1. Introduce el código de 8 caracteres que muestra el Dashboard, **o** genera uno en QoreX (válido 10 minutos) e introdúcelo en el Dashboard.
2. Una vez vinculado, tu @handle y tus direcciones conectadas aparecen en ambos.
3. Desvincula cuando quieras.

Iniciar sesión *mediante* **Continue with Dashboard** vincula ambos de forma implícita: no hay nada adicional que hacer.

## Integración con el Dashboard {#dashboard}

Con el Dashboard conectado:

- **Connect with QoreX** en el Dashboard lo empareja con tu monedero mediante un enlace directo (deep link) `qorex://connect` más una prueba de propiedad firmada.
- **Las transferencias iniciadas en el Dashboard** llegan a QoreX como solicitudes `qorex://tx`. Se decodifican, se te muestran por completo y se firman **únicamente en la app** tras la aprobación biométrica, y solo desde la dirección propia derivada de la app. Dado que una dirección `qor1…` es igualmente válida en mainnet y en testnet, cada solicitud iniciada desde el Dashboard indica a qué red va dirigida, y QoreX se niega a actuar sobre ella si eso no coincide con la red a la que estás conectado en ese momento: nunca cambia de red en nombre de una solicitud.
- Si llega una solicitud de Connect o de transferencia mientras **no has iniciado sesión**, QoreX ofrece un paso en línea de **"Sign in to Dashboard"** para que puedas continuar sin llegar a un callejón sin salida.
- **Your addresses (Settings)** — enumera todas las cuentas derivadas de este monedero, además de las direcciones de **solo lectura** que vinculaste desde otros monederos (Keplr / MetaMask / Phantom). Las entradas de solo lectura están etiquetadas con el monedero que las creó; si intentas enviar desde una, se te explica que debes enviarla desde el monedero que la creó.

## Próximos pasos

- [Seguridad y recuperación](/qorex/security-and-recovery) — los firmantes vinculados y los límites de gasto se construyen sobre este emparejamiento.
- [Navegador de dApps](/qorex/dapp-browser) — conéctate a apps desde dentro de QoreX.
