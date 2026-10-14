---
slug: /qorex/account-and-dashboard
title: Cuenta y Dashboard
sidebar_label: Cuenta y Dashboard
sidebar_position: 6
---

# Cuenta y Dashboard

QoreX funciona **completamente sin una cuenta**: tus claves nunca dependen de una. Iniciar sesión añade comodidades como las solicitudes de pago y el emparejamiento con el Dashboard; reclamar un @handle también puede pedirte que inicies sesión.

## Iniciar sesión {#sign-in}

Puedes iniciar sesión desde **Sign in** en la pestaña de inicio, o durante la incorporación. Métodos:

- **Código por correo electrónico** — introduce tu correo electrónico y recibe un código de un solo uso. Después de este inicio de sesión, QoreX te ofrece añadir una **passkey** para futuros inicios de sesión instantáneos (Face ID / Touch ID / PIN). Esta es una passkey de *cuenta*: nunca toca las claves de tu monedero.
- **Passkey** — si registraste una anteriormente.
- **Sign in with Apple** *(solo iOS)* — Apple comparte únicamente tu nombre y tu correo electrónico, y te permite ocultar tu dirección real detrás de una dirección de retransmisión privada.
- **Continue with Google** — un único salto nativo a través de la hoja de autenticación del sistema (la app nunca te redirige a un navegador).
- **Continue with QORECHAIN Dashboard** — inicia sesión con una cuenta de Dashboard existente (incluido su inicio de sesión de Google) e importa tu perfil.

:::note
La oferta de passkey solo aparece después de iniciar sesión con **código por correo electrónico**. Cuando inicias sesión con un proveedor de identidad (Apple, Google o Dashboard), ese proveedor gestiona su propia autenticación, por lo que no se puede asociar una passkey a esas cuentas.
:::

## Varias cuentas a partir de una frase {#accounts}

Settings → **Your accounts** te permite crear hasta **20 cuentas** por monedero y cambiar entre ellas, todas derivadas de la misma frase de recuperación de 24 palabras (no hay nada adicional que respaldar). Cada cuenta es su propia dirección `qor1…` con su propio saldo, su propio @handle opcional (un handle se vincula a una **dirección**, no al monedero) y —tras su primer envío— su propia clave post-cuántica. Toca una cuenta para ponerla en uso. La cuenta que esté activa es la que usan Send, Receive, Staking y el navegador de dApps: cambiar de cuenta lo mueve todo con ella, y la app muestra en qué cuenta estás siempre que exista más de una. Las cuentas se numeran *Account 1, 2, …*; no se pueden renombrar. La extensión de navegador tiene la misma pantalla; consulta [Varias cuentas a partir de una frase](/qorex/browser-extension#wallet).

- **Add an account** añade la siguiente cuenta sobre la misma frase. Una cuenta nueva registra su propia clave a prueba de ordenadores cuánticos la primera vez que envía, lo cual cuesta una pequeña comisión de red única.
- **Add an Ethereum account (coin 60)** es para una frase de recuperación usada primero en MetaMask o en el Dashboard de QoreChain: ahí es donde están sus fondos. Usa la ruta de Ethereum `m/44'/60'` y se etiqueta *Ethereum · coin 60*; su dirección `0x…` es la misma en todas las redes EVM y es la misma clave que esa cuenta de QoreChain. Consulta [Restaurar una frase desde MetaMask o el Dashboard](/qorex/getting-started#restore-dashboard).
- **Restaurar** una frase en un dispositivo nuevo recupera solo **Account 1**; usa **Add an account** (y **Add an Ethereum account (coin 60)**) para recuperar las demás. La pantalla Addresses (**Settings → Your addresses**) es independiente: enumera todas las cuentas de este monedero más las direcciones de solo lectura vinculadas desde otros monederos.

## @handle {#handle}

Reclama un nombre único (por ejemplo, `@liviu`) vinculado a tu dirección mediante **firmas duales** (una firma ed25519 del registro + tu propia firma secp256k1). A partir de ahí, cualquiera puede enviarte a tu @handle. La resolución es de tipo **verify-then-pin** (confianza en el primer uso), de modo que si la clave de un handle llega a cambiarse silenciosamente, QoreX lo marca.

Dado que un handle se vincula a una dirección y no a tu monedero, reclamarlo es **por dirección**: si tienes [varias cuentas](#accounts), cada una puede tener su propio @handle, y reclamar uno para una cuenta no le da automáticamente un nombre a las demás. En la extensión de navegador puedes pagar a un handle; reclamarlo desde el popup se ofrece en las cuentas normales de QoreChain en algunas versiones y en otras no: si el popup no lo ofrece, resérvalo desde la app móvil. Las cuentas de estilo Ethereum (coin 60) no tienen handle.

Si el registro de handles no está disponible temporalmente, la pantalla se reduce a **"Handles coming soon"** y todo lo demás sigue funcionando; los handles vuelven a activarse automáticamente cuando el registro vuelve a estar disponible.

:::note Reclamar un handle frente a vincular con el Dashboard
Se trata de dos acciones separadas y no relacionadas. Reclamar un @handle permite que **otras personas te envíen fondos por tu nombre**; no hace nada más por sí solo. Vincular con el Dashboard (más abajo) conecta tu monedero con una cuenta de Dashboard para que ambos puedan mostrar los mismos datos. Puedes hacer una sin la otra.
:::

## Cuenta vinculada {#linked-account}

**Settings → Linked account** conecta tu monedero QoreX y tu cuenta de Dashboard en ambos sentidos:

1. Introduce el código de 8 caracteres que muestra el Dashboard, **o** genera uno en QoreX (válido 10 minutos) e introdúcelo en el Dashboard.
2. Si tienes [varias cuentas](#accounts), la propia ventana de aprobación de QoreX te permite elegir **cuál** se vincula: no asume que es la cuenta actualmente activa.
3. Una vez vinculado, tu @handle y tus direcciones conectadas aparecen en ambos.
4. Desvincula cuando quieras.

Iniciar sesión *mediante* **Continue with Dashboard** vincula ambos de forma implícita: no hay nada adicional que hacer.

## Integración con el Dashboard {#dashboard}

Con el Dashboard conectado:

- **Connect with QoreX** en el Dashboard lo empareja con tu monedero mediante un enlace directo (deep link) `qorex://connect` más una prueba de propiedad firmada.
- **Las transferencias iniciadas en el Dashboard** llegan a QoreX como solicitudes `qorex://tx`. Se decodifican, se te muestran por completo y se firman **únicamente en la app** tras la aprobación biométrica, y solo desde la dirección propia derivada de la app. Dado que una dirección `qor1…` es igualmente válida en mainnet y en testnet, cada solicitud iniciada desde el Dashboard indica a qué red va dirigida, y QoreX se niega a actuar sobre ella si eso no coincide con la red a la que estás conectado en ese momento: nunca cambia de red en nombre de una solicitud.
- Si llega una solicitud de Connect o de transferencia mientras **no has iniciado sesión**, QoreX ofrece un paso en línea de **"Sign in to Dashboard"** para que puedas continuar sin llegar a un callejón sin salida.
- **Your addresses (Settings)** — enumera todas las cuentas derivadas de este monedero, además de las direcciones de **solo lectura** que vinculaste desde otros monederos (Keplr / MetaMask / Phantom). Las entradas de solo lectura están etiquetadas con el monedero que las creó; si intentas enviar desde una, se te explica que debes enviarla desde el monedero que la creó.

## Eliminar tu cuenta {#delete-account}

Settings → **Delete account** (la entrada roja al final). Tras una confirmación y un desbloqueo biométrico, QoreX borra de forma permanente: el monedero y las claves privadas de este dispositivo; tu @handle en el registro de QoreX (si lo hay); tu cuenta del Dashboard de QoreChain (si iniciaste sesión); y tu configuración de recuperación social (si está configurada). No se puede deshacer. Como QoreX no es custodial, **si no has respaldado tu frase de recuperación perderás el acceso a cualquier fondo**: respáldala primero. Las eliminaciones del lado del servidor se hacen en la medida de lo posible; el borrado en el dispositivo siempre se completa y devuelve la app a la pantalla del primer inicio.

## Próximos pasos

- [Seguridad y recuperación](/qorex/security-and-recovery) — copia de seguridad, recuperación y la ventana de acceso EVM.
- [Navegador de dApps](/qorex/dapp-browser) — conéctate a apps desde dentro de QoreX.
