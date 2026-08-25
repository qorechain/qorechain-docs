---
slug: /qorex/send-and-receive
title: Enviar y recibir
sidebar_label: Enviar y recibir
sidebar_position: 3
---

# Enviar y recibir

La pestaña Inicio (Wallet) es tu punto de partida. Muestra una **insignia de red** (MAINNET de forma predeterminada, o TESTNET si activaste el interruptor de desarrollador), tu **saldo total** (toca para ocultar/mostrar) y las acciones principales: **Enviar · Recibir · Swap · Stake**. Tu lista de activos muestra **QOR** (Nativo + poscuántico 🛡, un saldo unificado en los carriles Nativo/EVM/SVM) y **Todas las redes** (una vista unificada de ETH, BNB, POL, ARB y las demás [redes externas](#external-networks-tokens) que admite QoreX).

## Enviar QOR a prueba de computación cuántica

1. Toca **Enviar**.
2. Introduce el destinatario como una dirección `qor1…` **o** un **@handle**. Un handle se resuelve y se verifica criptográficamente (firma del registro + firma del propietario + fijación de confianza en el primer uso); si la clave de un handle cambia alguna vez de forma silenciosa, QoreX muestra una advertencia explícita.
3. Introduce el importe. La vista previa muestra el destinatario, el importe, la comisión y el estado del **Shield** (Escudo) — el nivel de protección poscuántica de la firma.
4. Confirma con la aprobación **biométrica**. QoreX firma la transferencia con la firma híbrida poscuántica obligatoria (ML-DSA-87 + secp256k1) y la difunde en el carril Nativo.

Tu **primera** transferencia también registra automáticamente tu clave poscuántica en la cadena — puedes verlo en [Seguridad y recuperación](/qorex/security-and-recovery#pqc-key). No se necesita ningún paso adicional.

### Enviar a un @handle, paso a paso {#handle-send}

1. Abre **Enviar** y escribe `@` seguido del handle (por ejemplo `@liviu`) en el campo de destinatario en lugar de una dirección.
2. QoreX busca el handle y te muestra la **dirección `qor1…` resuelta** antes de que confirmes nada.
3. Comprueba la dirección resuelta, introduce el importe y confirma como de costumbre.

QoreX solo acepta una resolución que supere **ambas** comprobaciones que realiza: una atestación del registro verificada frente a una clave de confianza fijada en la app, y la propia firma del propietario del handle sobre la reclamación. Si falla cualquiera de las dos comprobaciones, se produce un error en lugar de recurrir a una dirección no verificada. La primera vez que pagas a un handle determinado, QoreX recuerda la dirección a la que se resolvió; si la dirección de ese handle cambia alguna vez, QoreX se detiene antes de firmar y te muestra la dirección antigua y la nueva una junto a la otra para que decidas si quieres continuar. Esta memoria es **por dispositivo** — pagar al mismo handle por primera vez desde otro teléfono o una instalación nueva lo muestra como nuevo también ahí, lo cual es lo esperado, no un error. La extensión de navegador resuelve y paga handles de la misma manera (su memoria es **por navegador**, así que un navegador o equipo distinto lo verá como nuevo) — consulta [Enviar a un @handle](/qorex/browser-extension#handle-send).

### Enviar QOR en proceso de consolidación (bloqueado) {#vesting}

Si parte de tu saldo todavía está en proceso de **consolidación (vesting)** — por ejemplo, una asignación de TGE aún no liberada — tu total se divide en **disponible ahora** y **todavía bloqueado**. Solo puedes enviar la parte disponible; QoreX rechaza por sí mismo un intento de gasto excesivo en lugar de dejar que la red lo rechace después de cobrar una comisión. La parte bloqueada se vuelve gastable gradualmente a medida que el calendario de consolidación la va liberando. Esta división se muestra en todos los lugares donde aparece tu saldo — Inicio, Enviar y Detalle del activo.

## Recibir QOR

Toca **Recibir** para mostrar tu dirección `qor1…` como un código QR (con el icono de QoreChain incrustado) y un botón de copiar. Comparte cualquiera de los dos con el remitente.

:::note Recibir un activo de red externa por primera vez
La pantalla **Recibir** solo muestra una red en la que ya tienes saldo — así que si nunca has tenido ETH, todavía no habrá ahí una opción de ETH para elegir. Tu dirección EVM existe desde el momento en que existe tu wallet (se deriva de la misma frase de recuperación) y es la misma dirección en Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet y Avalanche — encuéntrala y cópiala desde **Ajustes → Direcciones** y comparte esa en su lugar. Una vez que llegue una transferencia, esa red aparecerá en Recibir a partir de entonces.
:::

## Solicitar un pago

Toca **Solicitar** (requiere [inicio de sesión](/qorex/account-and-dashboard#sign-in)) para crear una solicitud de pago — un importe más una nota opcional — como código QR o enlace. Quien la escanee verá la transferencia previamente rellenada.

## Redes y tokens externos {#external-networks-tokens}

Desde **Todas las redes** (o Enviar-externo) puedes enviar **ETH, BNB, POL, AVAX y SOL** de forma nativa, además de ETH en **Arbitrum, Base y OP Mainnet**, y **ATOM, OSMO y TIA** en Cosmos, además de tokens **ERC-20**, **SPL** e **IBC** — USDC y USDT en las cadenas EVM y Solana, DAI en Ethereum, y Noble USDC a través de IBC — todos derivados de la misma frase de recuperación (ETH usa `m/44'/60'`, SOL usa su ruta estándar, y SPL usa cuentas de token asociadas).

:::caution Las cadenas externas son solo clásicas
Otras blockchains no pueden llevar firmas poscuánticas. Cuando envías en una red externa, QoreX lo indica explícitamente (la transferencia usa una firma clásica y el **Shield** muestra la degradación). Tu **QOR** siempre permanece en el carril Nativo protegido. Los envíos externos basados en Cosmos admiten una nota opcional.
:::

## Swap

La pestaña **Swap** está conectada al AMM en cadena de QoreChain, pero permanece deshabilitada — el botón indica **"Swap — próximamente con liquidez de pools"** — hasta que la liquidez y el indicador de función remoto la activen. Cuando eso ocurra, se activará automáticamente; **no se necesita ninguna actualización de la app**.

:::note iOS
La pestaña Swap no aparece en absoluto en la versión de la App Store — Apple trata un intercambio de tokens dentro de la app como un servicio regulado. Swap permanece disponible (una vez habilitado) en Android y en la extensión de navegador.
:::

## Próximos pasos

- [Portafolio y Staking](/qorex/portfolio-and-staking) — consulta tu asignación y gana recompensas.
- [Seguridad y recuperación](/qorex/security-and-recovery) — protege y recupera tu wallet.
