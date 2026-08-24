---
slug: /qorex/troubleshooting
title: Solución de problemas de QoreX
sidebar_label: Solución de problemas
sidebar_position: 9
---

# Solución de problemas

Preguntas frecuentes y soluciones rápidas para la app y la extensión de QoreX.

| Síntoma | Causa / solución |
|---|---|
| **"Protege primero tu dispositivo"** durante la incorporación | Configura Face ID / una huella dactilar **o un bloqueo de pantalla (PIN / patrón)** en los ajustes de tu sistema y luego regresa. Un monedero solo se puede crear en un dispositivo con un factor de desbloqueo fuerte. En Android, el desbloqueo facial 2D por sí solo es una biometría *débil*: lo que la califica es el PIN que hay detrás. |
| **Se cerró la hoja de inicio de sesión** / "Ese intento de inicio de sesión caducó" | Se abandonó un intento anterior: simplemente toca iniciar sesión de nuevo. |
| Falta **"Añadir una passkey"** tras iniciar sesión con Google / el Dashboard | Es lo esperado: las passkeys solo se asocian a las cuentas con código por correo electrónico (consulta la nota en [Cuenta y Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **"Los handles llegarán pronto"** | El registro de @handles está temporalmente inaccesible. Tu monedero no se ve afectado; los handles se activan automáticamente en cuanto el registro vuelve a estar disponible. |
| **QoreX avisa de que la dirección de un handle cambió** | Es un comportamiento de seguridad esperado, no un error: QoreX recuerda la dirección a la que resolvió un handle la primera vez que le pagaste, y señala cualquier cambio posterior en lugar de confiarlo silenciosamente. Confirma la nueva dirección por un canal aparte con el destinatario antes de continuar. |
| **Se rechaza el envío por ser "superior a tu saldo disponible"** en una cuenta con vesting | Parte de tu saldo sigue bloqueado por un calendario de vesting. Solo se puede enviar la parte **disponible** (mostrada en Inicio, Enviar y el detalle del activo); el resto se desbloquea gradualmente. |
| **Una solicitud del monedero indica que es "para testnet/mainnet, pero tu monedero está en…"** | La solicitud (por ejemplo, desde el Dashboard) apunta a una red distinta de aquella a la que estás conectado en este momento. Cambia tú mismo de red primero si eso era lo que querías: QoreX no cambiará de red por ti. |
| **"Código incorrecto o QR dañado"** durante la vinculación de dispositivos | Vuelve a comprobar el código de 10 caracteres (el alfabeto omite caracteres parecidos: nada de 0/O/1/I/L) y escanea de nuevo. Ambos artefactos son de un solo uso. |
| **La pantalla de la cámara indica que se necesita permiso** | iOS: Ajustes → QoreX → Cámara. Android: Información de la app → Permisos → Cámara. |
| **Extensión: no hay monedero al abrirla por primera vez** | La extensión es un monedero **independiente**: abre la ventana emergente y elige **Crear monedero** o **Importar monedero**. No requiere la app móvil. |
| **Se rechaza el envío desde una dirección de solo lectura** | Esa dirección pertenece a otro monedero (la etiqueta indica cuál). QoreX solo puede firmar por sus propias cuentas derivadas: envía desde el monedero que la posee. |
| **Aparece la insignia de testnet** | Ajustes → **"Usar testnet (desarrolladores)"** está activado. Desactívalo para volver a mainnet. |
| **El botón de Swap está deshabilitado** | Es lo esperado por ahora: Swap se activa automáticamente en cuanto haya liquidez disponible en el pool; no se necesita ninguna actualización de la app. |
| **Desinstalé la app / eliminé la extensión y ahora no veo ningún monedero** | La bóveda existía únicamente en ese dispositivo o en ese navegador. Si habías hecho una copia de seguridad de tu frase de 24 palabras, restaura el monedero con ella. Si habías configurado la [recuperación social](/qorex/security-and-recovery#social-recovery), inicia una recuperación con tus guardianes. Sin ninguna de las dos cosas, el monedero no se puede recuperar: consulta [Haz una copia de seguridad ahora](/qorex/security-and-recovery#back-up-now) para proteger de inmediato cualquier monedero nuevo. |

## ¿Sigues atascado?

- Revisa la página [Seguridad y recuperación](/qorex/security-and-recovery) para conocer los guardianes y la vinculación de dispositivos.
- Para preguntas sobre QoreChain en sí, consulta la [documentación principal](/introduction/what-is-qorechain) o los canales de la comunidad enlazados en [qorechain.io](https://qorechain.io).
