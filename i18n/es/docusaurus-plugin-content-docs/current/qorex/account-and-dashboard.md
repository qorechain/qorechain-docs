---
slug: /qorex/account-and-dashboard
title: Cuenta y Dashboard
sidebar_label: Cuenta y Dashboard
sidebar_position: 6
---

# Cuenta y Dashboard

QoreX funciona **totalmente sin una cuenta** — tus claves nunca dependen de ella. Iniciar sesión solo añade comodidades como @handles, solicitudes de pago y emparejamiento con el Dashboard.

## Iniciar sesión {#sign-in}

Puedes iniciar sesión desde **Iniciar sesión** en la pestaña Inicio, o durante la incorporación. Métodos:

- **Código por correo** — introduce tu correo electrónico y recibe un código de un solo uso. Tras este inicio de sesión, QoreX ofrece añadir una **passkey** para inicios de sesión instantáneos en el futuro (Face ID / Touch ID / PIN). Esta es una passkey de *cuenta* — nunca toca las claves de tu monedero.
- **Passkey** — si registraste una previamente.
- **Continuar con Google** — un único salto nativo a través de la hoja de autenticación del sistema (la app nunca sale a un navegador).
- **Continuar con QORECHAIN Dashboard** — inicia sesión con una cuenta existente del Dashboard (incluido su acceso con Google) e importa tu perfil.

:::note
La oferta de passkey aparece únicamente tras iniciar sesión con **código por correo**. Cuando inicias sesión con un proveedor de identidad (Google o Dashboard), ese proveedor gestiona su propia autenticación, por lo que no se puede adjuntar una passkey a esas cuentas.
:::

## @handle {#handle}

Reclama un nombre único (por ejemplo `@liviu`) vinculado a tu dirección mediante **firmas duales** (una firma ed25519 del registro + tu propia firma secp256k1). Cualquiera puede entonces enviar a tu @handle. La resolución es **verificar-y-fijar** (confianza en el primer uso), de modo que si la clave de un handle se cambia silenciosamente en algún momento, QoreX lo marca.

Si el registro de handles está temporalmente inaccesible, la pantalla se degrada a **"Handles disponibles próximamente"** y todo lo demás sigue funcionando; los handles se reactivan automáticamente cuando el registro regresa.

## Cuenta vinculada {#linked-account}

**Ajustes → Cuenta vinculada** conecta tu monedero QoreX y tu cuenta del Dashboard en ambos sentidos:

1. Introduce el código de 8 caracteres que muestra el Dashboard, **o** genera uno en QoreX (válido 10 minutos) y escríbelo en el Dashboard.
2. Una vez vinculados, tu @handle y las direcciones conectadas aparecen en ambos.
3. Desvincula en cualquier momento.

Iniciar sesión *mediante* **Continuar con Dashboard** vincula ambos de forma implícita — no hay nada adicional que hacer.

## Integración con el Dashboard {#dashboard}

Con el Dashboard conectado:

- **Connect with QoreX** en el Dashboard lo empareja con tu monedero mediante un enlace profundo `qorex://connect` más una prueba de propiedad firmada.
- **Las transferencias iniciadas en el Dashboard** llegan a QoreX como solicitudes `qorex://tx`. Se decodifican, se te muestran por completo y se firman **solo en la app** tras la aprobación biométrica — y únicamente desde la propia dirección derivada de la app.
- Si una solicitud de Connect o de transferencia llega mientras **no has iniciado sesión**, QoreX ofrece un paso integrado **"Iniciar sesión en el Dashboard"** para que puedas continuar sin llegar a un callejón sin salida.
- **Tus direcciones (Ajustes)** — enumera cada cuenta derivada de este monedero, más las direcciones de **solo lectura** que vinculaste desde otros monederos (Keplr / MetaMask / Phantom). Las entradas de solo lectura se etiquetan con el monedero que las creó; intentar enviar desde una explica que debes enviar desde el monedero que la creó.

## Próximos pasos

- [Security & Recovery](/qorex/security-and-recovery) — los firmantes vinculados y los límites de gasto se apoyan en este emparejamiento.
- [dApp Browser](/qorex/dapp-browser) — conéctate a aplicaciones desde dentro de QoreX.
