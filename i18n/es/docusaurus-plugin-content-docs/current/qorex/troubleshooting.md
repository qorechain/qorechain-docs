---
slug: /qorex/troubleshooting
title: Resolución de problemas de QoreX
sidebar_label: Resolución de problemas
sidebar_position: 9
---

# Resolución de problemas

Preguntas comunes y soluciones rápidas para la app y la extensión de QoreX.

| Síntoma | Causa / solución |
|---|---|
| **"Protege tu dispositivo primero"** durante la incorporación | Configura Face ID / una huella dactilar **o un bloqueo de pantalla (PIN / patrón)** en los ajustes del sistema y luego vuelve. Una billetera solo se puede crear en un dispositivo con un factor de desbloqueo fuerte. En Android, el desbloqueo facial 2D por sí solo es un biométrico *débil*: es el PIN detrás de él lo que califica. |
| **Hoja de inicio de sesión cerrada** / "Ese intento de inicio de sesión expiró" | Se abandonó un intento anterior: simplemente toca iniciar sesión de nuevo. |
| **Falta "Añadir una clave de acceso"** tras iniciar sesión con Google / el Dashboard | Es lo esperado: las claves de acceso solo se vinculan a cuentas de código por correo (consulta la nota en [Cuenta y Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **"Handles próximamente"** | El registro de @handle está temporalmente inaccesible. Tu billetera no se ve afectada; los handles se activan automáticamente cuando vuelve a estar disponible. |
| **"Código incorrecto o QR dañado"** durante la vinculación de dispositivos | Vuelve a comprobar el código de 10 caracteres (el alfabeto omite los caracteres parecidos: sin 0/O/1/I/L) y vuelve a escanear. Ambos artefactos son de un solo uso. |
| **La pantalla de la cámara indica que se necesita permiso** | iOS: Ajustes → QoreX → Cámara. Android: Información de la app → Permisos → Cámara. |
| **Extensión: "Aún no hay billetera"** | La extensión se empareja con una billetera creada en la app móvil de QoreX: crea una allí primero. |
| **Se rechaza el envío desde una dirección de solo lectura** | Esa dirección pertenece a otra billetera (la etiqueta muestra cuál). QoreX solo puede firmar por sus propias cuentas derivadas: envía desde la billetera que la posee. |
| **Se muestra la insignia de testnet** | Ajustes → **"Usar testnet (desarrolladores)"** está activado. Desactívalo para volver a mainnet. |
| **El botón de Swap está deshabilitado** | Es lo esperado por ahora: Swap se activa automáticamente en cuanto haya liquidez en el pool; no se necesita ninguna actualización de la app. |

## ¿Aún tienes problemas?

- Revisa la página de [Seguridad y recuperación](/qorex/security-and-recovery) para conocer los guardianes y la vinculación de dispositivos.
- Para preguntas sobre QoreChain en sí, consulta la [documentación principal](/introduction/what-is-qorechain) o los canales de la comunidad enlazados en [qorechain.io](https://qorechain.io).
