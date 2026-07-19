---
slug: /qorex/troubleshooting
title: Solución de problemas de QoreX
sidebar_label: Solución de problemas
sidebar_position: 9
---

# Solución de problemas

Preguntas comunes y soluciones rápidas para la app y la extensión de QoreX.

| Síntoma | Causa / solución |
|---|---|
| **"Secure your device first"** durante la configuración inicial | Registra Face ID o una huella dactilar en los ajustes de tu sistema y luego vuelve a la app. Solo se puede crear una billetera en un dispositivo protegido con biometría. |
| **Hoja de inicio de sesión cerrada** / "That sign-in attempt expired" | Se abandonó un intento anterior: simplemente vuelve a tocar iniciar sesión. |
| **Falta "Add a passkey"** después de iniciar sesión con Google / Dashboard | Es lo esperado: las passkeys se asocian solo a las cuentas con código por correo (consulta la nota en [Cuenta y Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **"Handles coming soon"** | El registro de @handle está temporalmente inaccesible. Tu billetera no se ve afectada; los handles se activan automáticamente cuando el registro vuelve. |
| **"Wrong code or damaged QR"** durante la vinculación de dispositivos | Vuelve a verificar el código de 10 caracteres (el alfabeto omite caracteres parecidos: sin 0/O/1/I/L) y vuelve a escanear. Ambos artefactos son de un solo uso. |
| **La pantalla de la cámara indica que se necesita permiso** | iOS: Ajustes → QoreX → Cámara. Android: Información de la app → Permisos → Cámara. |
| **Extensión: "No wallet yet"** | La extensión se empareja con una billetera creada en la app móvil de QoreX: crea una allí primero. |
| **Se rechaza el envío desde una dirección de solo lectura** | Esa dirección pertenece a otra billetera (la etiqueta muestra cuál). QoreX solo puede firmar por sus propias cuentas derivadas: envía desde la billetera que la posee. |
| **Aparece la insignia de testnet** | Ajustes → **"Use testnet (developers)"** está activado. Desactívalo para volver a mainnet. |
| **El botón Swap está deshabilitado** | Es lo esperado por ahora: Swap se activa automáticamente cuando haya liquidez en el pool disponible; no se necesita actualizar la app. |

## ¿Sigues atascado?

- Revisa la página de [Seguridad y recuperación](/qorex/security-and-recovery) para conocer los guardianes y la vinculación de dispositivos.
- Para preguntas sobre QoreChain en sí, consulta la [documentación principal](/introduction/what-is-qorechain) o los canales de la comunidad enlazados en [qorechain.io](https://qorechain.io).
