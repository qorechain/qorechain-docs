---
slug: /qorex/troubleshooting
title: Resolución de problemas de QoreX
sidebar_label: Resolución de problemas
sidebar_position: 9
---

# Resolución de problemas

Preguntas frecuentes y soluciones rápidas para la app y la extensión de QoreX.

| Síntoma | Causa / solución |
|---|---|
| **"Asegura tu dispositivo primero"** durante la incorporación | Configura Face ID / una huella dactilar **o un bloqueo de pantalla (PIN / patrón)** en los ajustes de tu sistema, y luego regresa. Una billetera solo se puede crear en un dispositivo con un factor de desbloqueo fuerte. En Android, el desbloqueo facial 2D por sí solo es un dato biométrico *débil*: lo que califica es el PIN que hay detrás. |
| **La hoja de inicio de sesión se cerró** / "Ese intento de inicio de sesión caducó" | Se abandonó un intento anterior: simplemente toca iniciar sesión de nuevo. |
| **Falta "Añadir una clave de acceso"** tras iniciar sesión con Google / Dashboard | Es lo esperado: las claves de acceso se asocian únicamente a las cuentas con código por correo (consulta la nota en [Cuenta y Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **"Los handles llegarán pronto"** | El registro de @handle está temporalmente inaccesible. Tu billetera no se ve afectada; los handles se activan automáticamente cuando el registro vuelve. |
| **"Código incorrecto o QR dañado"** durante la vinculación de dispositivos | Vuelve a comprobar el código de 10 caracteres (el alfabeto omite caracteres parecidos: nada de 0/O/1/I/L) y escanea de nuevo. Ambos artefactos son de un solo uso. |
| **La pantalla de la cámara indica que se necesita permiso** | iOS: Ajustes → QoreX → Cámara. Android: Información de la app → Permisos → Cámara. |
| **Extensión: no hay billetera al abrir por primera vez** | La extensión es una billetera **independiente**: abre la ventana emergente y elige **Crear billetera** o **Importar billetera**. No requiere la app móvil. |
| **Se rechaza el envío desde una dirección de solo lectura** | Esa dirección pertenece a otra billetera (la etiqueta muestra cuál). QoreX solo puede firmar por sus propias cuentas derivadas: envía desde la billetera que la posee. |
| **Aparece la insignia de testnet** | Ajustes → **"Usar testnet (desarrolladores)"** está activado. Desactívalo para volver a mainnet. |
| **El botón de intercambio está deshabilitado** | Es lo esperado por ahora: el intercambio se activa automáticamente en cuanto haya liquidez en el pool; no se necesita ninguna actualización de la app. |

## ¿Sigues atascado?

- Revisa la página [Seguridad y recuperación](/qorex/security-and-recovery) para conocer los guardianes y la vinculación de dispositivos.
- Para preguntas sobre QoreChain en sí, consulta la [documentación principal](/introduction/what-is-qorechain) o los canales de la comunidad enlazados en [qorechain.io](https://qorechain.io).
