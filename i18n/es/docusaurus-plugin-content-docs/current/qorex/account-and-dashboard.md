---
slug: /qorex/account-and-dashboard
title: Cuenta y Dashboard
sidebar_label: Cuenta y Dashboard
sidebar_position: 6
---

# Cuenta y Dashboard

QoreX funciona **totalmente sin una cuenta** — tus claves nunca dependen de una. Iniciar sesión solo añade comodidades como los @handles, las solicitudes de pago y el emparejamiento con el Dashboard.

## Iniciar sesión {#sign-in}

Puedes iniciar sesión desde **Sign in** en la pestaña de Inicio, o durante la configuración inicial. Métodos:

- **Código por correo** — introduce tu correo y recibe un código de un solo uso. Tras este inicio de sesión, QoreX te ofrece añadir una **passkey** para inicios de sesión instantáneos en el futuro (Face ID / Touch ID / PIN). Esta es una passkey de *cuenta* — nunca toca las claves de tu wallet.
- **Passkey** — si registraste una previamente.
- **Continue with Google** — un único salto nativo a través de la hoja de autenticación del sistema (la app nunca sale hacia un navegador).
- **Continue with QORECHAIN Dashboard** — inicia sesión con una cuenta de Dashboard existente (incluido su inicio de sesión con Google) e importa tu perfil.

:::note
La oferta de passkey aparece únicamente tras el inicio de sesión con **código por correo**. Cuando inicias sesión con un proveedor de identidad (Google o Dashboard), ese proveedor gestiona su propia autenticación, por lo que no se puede asociar una passkey a esas cuentas.
:::

## @handle {#handle}

Reclama un nombre único (por ejemplo `@liviu`) vinculado a tu dirección mediante **firmas duales** (una firma ed25519 del registro + tu propia firma secp256k1). Cualquiera puede entonces enviar a tu @handle. La resolución es **verify-then-pin** (confianza en el primer uso), de modo que si la clave de un handle se cambia alguna vez de forma silenciosa, QoreX lo señala.

Si el registro de handles está temporalmente inaccesible, la pantalla se degrada a **"Handles coming soon"** y todo lo demás sigue funcionando; los handles se reactivan automáticamente cuando el registro vuelve.

## Cuenta vinculada {#linked-account}

**Settings → Linked account** conecta tu wallet QoreX y tu cuenta de Dashboard en ambos sentidos:

1. Introduce el código de 8 caracteres que muestra el Dashboard, **o** genera uno en QoreX (válido 10 minutos) y escríbelo en el Dashboard.
2. Una vez vinculadas, tu @handle y las direcciones conectadas aparecen en ambos.
3. Desvincula en cualquier momento.

Iniciar sesión *mediante* **Continue with Dashboard** vincula ambos de forma implícita — no hay nada más que hacer.

## Integración con el Dashboard {#dashboard}

Con el Dashboard conectado:

- **Connect with QoreX** en el Dashboard lo empareja con tu wallet mediante un deep link `qorex://connect` más una prueba de propiedad firmada.
- **Las transferencias iniciadas en el Dashboard** llegan a QoreX como solicitudes `qorex://tx`. Se decodifican, se te muestran por completo y se firman **solo en la app** tras la aprobación biométrica — y únicamente desde la dirección derivada propia de la app.
- **Tus direcciones (Settings)** — lista cada cuenta derivada de esta wallet, más las direcciones **de solo lectura** que vinculaste desde otras wallets (Keplr / MetaMask / Phantom). Las entradas de solo lectura se etiquetan con la wallet que las creó; al intentar enviar desde una de ellas se te explica que debes enviar desde la wallet que la creó.

## Próximos pasos

- [Seguridad y Recuperación](/qorex/security-and-recovery) — los firmantes vinculados y los límites de gasto se apoyan en este emparejamiento.
- [Navegador de dApps](/qorex/dapp-browser) — conéctate a aplicaciones desde dentro de QoreX.
