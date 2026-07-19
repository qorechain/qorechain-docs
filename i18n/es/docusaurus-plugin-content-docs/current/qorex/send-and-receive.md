---
slug: /qorex/send-and-receive
title: Enviar y recibir
sidebar_label: Enviar y recibir
sidebar_position: 3
---

# Enviar y recibir

La pestaña Inicio (Wallet) es tu punto de partida. Muestra un **distintivo de red** (MAINNET por defecto, o TESTNET si activaste el interruptor de desarrollador), tu **saldo total** (toca para ocultar/mostrar) y las acciones principales: **Enviar · Recibir · Intercambiar · Hacer staking**. Tu lista de activos muestra **QOR** (Native + poscuántico 🛡, un saldo unificado en los carriles Native/EVM/SVM) y **Todas las redes** (una vista unificada de ETH · BNB · POL · ARB).

## Enviar QOR a prueba de cuántica

1. Toca **Enviar**.
2. Introduce el destinatario como una dirección `qor1…` **o** un **@handle**. Un handle se resuelve y se verifica criptográficamente (firma del registro + firma del propietario + fijación por confianza en el primer uso); si la clave de un handle cambia alguna vez de forma silenciosa, QoreX muestra una advertencia explícita.
3. Introduce el importe. La vista previa muestra el destinatario, el importe, la comisión y el estado del **Shield**: el nivel de protección poscuántica de la firma.
4. Confirma con aprobación **biométrica**. QoreX firma la transferencia con la firma híbrida poscuántica obligatoria (ML-DSA-87 + secp256k1) y la difunde en el carril Native.

Tu **primera** transferencia también registra automáticamente tu clave poscuántica en la cadena; puedes verlo en [Seguridad y recuperación](/qorex/security-and-recovery#pqc-key). No se necesita ningún paso aparte.

## Recibir QOR

Toca **Recibir** para mostrar tu dirección `qor1…` como código QR (con el icono de QoreChain incrustado) y un botón de copiar. Comparte cualquiera de los dos con el remitente.

## Solicitar un pago

Toca **Solicitar** (requiere [iniciar sesión](/qorex/account-and-dashboard#sign-in)) para crear una solicitud de pago —un importe más una nota opcional— como código QR o enlace. Quien lo escanee verá la transferencia ya rellenada.

## Redes y tokens externos

Desde **Todas las redes** (o Enviar-externo) puedes enviar de forma nativa **ETH, BNB, POL, ARB y SOL**, además de tokens **ERC-20** y **SPL**, todo derivado de la misma frase de recuperación (ETH usa `m/44'/60'`, SOL usa su ruta estándar y SPL usa cuentas de token asociadas).

:::caution Las cadenas externas son solo clásicas
Otras cadenas de bloques no pueden transportar firmas poscuánticas. Cuando envías en una red externa, QoreX lo indica explícitamente (la transferencia usa una firma clásica y el **Shield** muestra la degradación). Tu **QOR** siempre permanece en el carril Native protegido. Los envíos externos basados en Cosmos admiten una nota opcional.
:::

## Intercambiar

La pestaña **Intercambiar** está conectada al AMM en cadena de QoreChain, pero permanece desactivada —el botón dice **"Intercambiar — próximamente con liquidez del pool"**— hasta que la liquidez y el indicador de función remoto lo activen. Cuando eso ocurra, se habilita automáticamente; **no se necesita actualizar la app**.

## Próximos pasos

- [Portafolio y staking](/qorex/portfolio-and-staking) — consulta tu asignación y gana recompensas.
- [Seguridad y recuperación](/qorex/security-and-recovery) — protege y recupera tu wallet.
