---
slug: /qorex/browser-extension
title: Extensión de Navegador QoreX
sidebar_label: Extensión de Navegador
sidebar_position: 2
---

# Extensión de Navegador QoreX

La **extensión de navegador** QoreX es la wallet de escritorio de QoreChain. Es una **wallet independiente** — crea o importa una wallet, guarda y envía QOR, y conéctate a dApps — y es la pieza que permite que cualquier sitio web descubra QoreX y convierta cada solicitud en una aprobación explícita y decodificada.

Está **activa y disponible públicamente** en tres tiendas.

## Instalación {#install}

| Navegador | Instalación |
|---|---|
| **Chrome y navegadores basados en Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 o posterior)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Qué versión está activa en cada uno {#versions}

Las revisiones de cada tienda se completan en momentos distintos, así que la versión publicada actualmente difiere según el navegador:

| Navegador | Versión publicada |
|---|---|
| **Firefox** | **0.2.2** |
| **Chrome / Chromium** | **0.1.5** (0.1.9 enviada, aún en revisión; la ficha está bloqueada para nuevos envíos hasta que esa revisión se apruebe, así que 0.2.2 aún no se ha enviado allí) |
| **Safari (macOS)** | se distribuye dentro de la app de macOS **QoreX Wallet**, que usa su propia numeración `1.x` — la Mac App Store actualmente sirve la **1.3** (incluye la extensión **0.2.2**) |

Es posible que las funciones más nuevas aún no estén activas en tu navegador — consulta la tabla anterior antes de asumir que algo descrito aquí ya está disponible. Si el Dashboard te indica que tu extensión necesita actualizarse, significa que hay una versión mínima concreta requerida para esa acción (normalmente 0.2.2, para staking) — no que tu build sea generalmente antigua.

**0.1.5** añadió el [descubrimiento vía Solana Wallet Standard](#standards), el [desbloqueo con passkey](#security), un [carril dApp SVM](#standards) totalmente implementado y el [puente de conexión con el Dashboard](#dashboard-bridge). (La versión 0.1.4 nunca se publicó — sus cambios llegan a los usuarios con 0.1.5.)

**0.1.6–0.1.9** añadieron, en orden: envíos conscientes del vesting con mensajes honestos de rechazo bancario; la dirección de la cuenta y el saldo en vivo mostrados directamente en el inicio del popup; y, en **0.1.9**, [pagar a un @handle](#handle-send) directamente desde Enviar, una [pantalla de Recibir con código QR de la dirección](#receive), un [selector de idioma](#language) (diez idiomas, igual que el conjunto de la app móvil), y la eliminación de una confusa "próxima fecha de desbloqueo" del [saldo en vesting](#vesting).

**0.2.2** añadió [staking, desde la propia extensión](#stake) — su propia pantalla de Stake (validadores con comisión, tu total en staking, recompensas pendientes y delegar / retirar de staking / reclamar); [varias cuentas a partir de una misma frase de recuperación](#wallet), igual que la app móvil; la corrección que permite que el botón de staking del **Dashboard** llegue realmente a la extensión (una wallet creada solo en la extensión antes no podía hacer staking a través del Dashboard en absoluto — ver [puente del Dashboard](#dashboard-bridge)); el reclamo funcional de @handle desde el navegador; y el número de build mostrado al pie del popup.

**La superficie de permisos no ha cambiado desde 0.1.3** — ver [Qué permisos solicita QoreX](#permissions).

:::note
En Safari, las aprobaciones se abren en una pestaña del navegador en lugar de una ventana emergente — la extensión se empaqueta con el envoltorio de extensiones web de Safari de Apple, a partir de la misma base de código.
:::

## Crear o restaurar una wallet {#wallet}

Abre el popup y elige:

- **Crear wallet** — genera una frase de recuperación de 24 palabras nueva en tu dispositivo (256 bits de entropía), deriva tu identidad de QoreChain y la sella en la bóveda bajo una contraseña (y, opcionalmente, una passkey — ver [Seguridad](#security)).
- **Importar wallet** — restaura a partir de una frase de 24 palabras existente.

La extensión mantiene sus propias claves; no requiere la app móvil. También puedes exportar tu mnemónico desde el popup. Las claves nunca salen del dispositivo.

:::note Varias cuentas a partir de una misma frase (desde 0.2.2)
La extensión ahora puede crear y alternar entre varias cuentas a partir de la misma frase de recuperación, igual que la app móvil — la frase que ya anotaste restaura todas ellas. Cambiar de cuenta mueve todo con ella: envíos, staking, recepción y tu @handle siguen a la cuenta que esté activa. Portafolio, Q-Day Scanner, recuperación social, Legacy Protocol, solicitudes de pago y vinculación de dispositivos siguen siendo exclusivos de la app móvil — ver [QoreX Wallet](/qorex/overview#platform-availability) para la comparación completa.
:::

## Tu cuenta, saldo y @handle {#account}

La pantalla de inicio del popup muestra tu dirección `qor1…` (toca para copiar) y tu saldo de QOR en vivo, así no necesitas abrir un explorador de bloques para consultar ninguno de los dos.

### Saldos en vesting (bloqueados) {#vesting}

Si tu cuenta tiene QOR en vesting (por ejemplo, una asignación TGE aún no liberada), el saldo se divide en **disponible ahora** y **aún bloqueado**, y un envío que supere el monto disponible se rechaza antes de que llegue a la red, en lugar de fallar en cadena después de cobrar una comisión. QoreX deliberadamente **no** muestra una "próxima fecha de desbloqueo" aquí: un cronograma de vesting puede ser modificado por gobernanza, así que una fecha en la tarjeta de saldo se leería como una promesa que QoreX no puede garantizar. La división entre disponible y bloqueado es lo que se mantiene exacto.

### Reclama un @handle

Desde el popup puedes reclamar un **@handle** único (por ejemplo, `@liviu`) para la dirección de esta cuenta, igual que en la app móvil. El reclamo se firma con la clave propia de la cuenta y se vincula a esa dirección, de modo que la app móvil y el Dashboard puedan resolverlo cuando alguien te envíe algo. Consulta [@handle](/qorex/account-and-dashboard#handle) para ver cómo los handles se vinculan a direcciones (no a una wallet en su conjunto).

## Enviar a un @handle {#handle-send}

Desde 0.1.9 puedes pagar directamente a un @handle registrado en lugar de buscar una dirección:

1. Abre el popup y toca **Enviar**.
2. En el campo de destinatario, escribe `@` seguido del handle (por ejemplo, `@liviu`) en lugar de una dirección `qor1…`.
3. QoreX resuelve el handle y te muestra la **dirección resuelta** antes de que firmes nada — verifica siempre esto frente a lo que esperas.
4. Ingresa el monto y confirma.

La resolución se verifica de dos maneras antes de que QoreX la use: una atestación del registro comprobada contra una clave de confianza integrada en la extensión, y la propia firma del titular del handle sobre el reclamo. Una respuesta que falle en cualquiera de las dos comprobaciones se rechaza por completo — QoreX no recurre a mostrar una dirección sin verificar. La primera vez que pagas a un handle determinado, QoreX recuerda (fija) la dirección a la que se resolvió; si ese handle más adelante se resuelve a una dirección **diferente**, QoreX se detiene y te muestra tanto la dirección antigua como la nueva en su totalidad, para que puedas decidir si continuar.

## Recibir {#receive}

Toca **Recibir** en el popup para mostrar tu dirección `qor1…` como un código QR (con el ícono de QoreChain incrustado) junto a un botón de copiar — escanéalo desde un teléfono o pega la dirección directamente.

## Hacer staking desde la extensión {#stake}

Desde **0.2.2**, el popup tiene su propia pantalla de **Stake** — una wallet creada solo en la extensión ya no necesita la app móvil para obtener recompensas de staking.

1. Abre el popup y ve a **Stake**.
2. La pantalla lista los validadores activos con su comisión, tu total actual en staking y cualquier recompensa pendiente de reclamar. Los validadores que la red ha **encarcelado (jailed)** quedan fuera de la lista — delegar a uno de ellos nunca es lo que quieres.
3. Para delegar, elige un validador y un monto, luego confirma. QoreX firma con la firma híbrida post-cuántica obligatoria, igual que un Envío.
4. **Retirar de staking (unstake)** y **reclamar** funcionan desde la misma pantalla. Retirar de staking inicia el período de desbonding de 21 días — ver [Staking y Delegación](/user-guide/staking-and-delegation) para saber qué significa eso.

El staking, la delegación y las recompensas ocurren exclusivamente en el carril **Nativo**, nunca a través de un precompilado EVM.

### Aprobar una solicitud de staking del Dashboard {#stake-dashboard}

El [Dashboard](/dashboard/staking-and-validators) de QoreChain compone las solicitudes de staking pero no puede firmarlas — tu clave nunca sale de la bóveda de la extensión. Al hacer clic en **Continuar en QoreX** en el Dashboard, la solicitud se abre en la extensión para que la revises (validador y monto) y la apruebes, exactamente igual que un Envío. Esta conexión estaba rota en 0.2.1 (la extensión se reportaba a sí misma como "demasiado antigua" incluso siendo el build publicado más reciente — el problema real era un salto interno faltante, no una versión desactualizada); está corregida desde **0.2.2**. Si tienes un build anterior, consulta [qué versión está activa en cada uno](#versions).

:::note Si una transacción aparece como "degradada" en lugar de exitosa
El Dashboard ocasionalmente muestra una transacción como **degradada (downgraded)** en lugar de un éxito limpio. Esto significa que tus fondos se movieron, pero la capa de firma post-cuántica no se encontró en cadena para esa transacción — no es algo que hayas hecho mal ni algo que puedas arreglar de tu lado. Es un fallo de nuestro lado; por favor repórtalo a soporte para que podamos investigarlo. El mensaje permanece en pantalla deliberadamente en lugar de desaparecer, para que tengas tiempo de leerlo y reportarlo.
:::

### Enviar en redes externas {#send-external}

Además de QOR en el carril Nativo, el popup puede enviar activos en redes externas, todas derivadas de la misma frase de recuperación:

| Tipo | Redes | Tokens incluidos |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | Entradas ERC-20 (USDC y USDT en las cadenas EVM, DAI en Ethereum) |
| SVM | Solana | Entradas SPL (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | Noble USDC vía IBC; campo de memo opcional |

Antes de que salga una transferencia externa debes marcar una confirmación explícita: **"Las redes externas aceptan solo firmas clásicas — a diferencia de tu QOR, esta transferencia NO es a prueba de cuántica."** Las cadenas externas no pueden llevar una firma post-cuántica, y QoreX nunca lo oculta.

## Estándares de wallet compatibles {#standards}

QoreX expone tres interfaces, todas inyectadas en la página como `window.qorex` (`{ evm, native, svm }`) y detectadas mediante los contratos de detección de [`@qorechain/connect`](/sdk/overview).

| Estándar | Qué es | Qué significa para ti como desarrollador |
|---|---|---|
| **EIP-1193** | La API JavaScript del proveedor de Ethereum (`request(...)`, eventos). | Tu código existente de ethers.js / viem / web3.js habla con el carril EVM de QoreX sin cambios; los códigos de error numéricos (por ejemplo, `4902`) se reenvían tal cual. |
| **EIP-6963** | Descubrimiento de proveedores multi-wallet (eventos announce / request). | QoreX se anuncia junto a cualquier otra wallet — **nunca sobrescribe `window.ethereum`** — así que el usuario elige QoreX por sitio sin conflictos. |
| **`signDirect` al estilo Keplr** | Un proveedor con forma de `OfflineDirectSigner` de Cosmos en `window.qorex.native`. | Las dApps al estilo Cosmos firman transacciones del carril **Nativo** de QoreChain de la misma manera que lo harían con Keplr; la capa post-cuántica se aplica de antemano (ver [Firma post-cuántica](#pqc)). |
| **Solana Wallet Standard** *(desde 0.1.5)* | Descubrimiento nativo de wallets para dApps de Solana (`wallet-standard:register-wallet` / `app-ready`). | Las dApps de Solana **detectan automáticamente QoreX** — sin integración personalizada. Funciones: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; cadena `solana:mainnet`; transacciones tanto `legacy` como `v0`. |

:::note Cómo acceder al carril SVM directamente
La misma interfaz también está disponible en `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). El descubrimiento automático de Wallet-Standard y el carril SVM totalmente implementado se lanzaron en **0.1.5** y están activos tanto en Chrome como en Firefox (ver [qué versión está activa en cada uno](#versions)).

Las aprobaciones de Solana muestran el payload decodificado (destinatario y lamports para transferencias del System, y la lista de programas), rechazan transacciones que no incluyan tu wallet como firmante, y marcan la firma como **clásica** — ver [Firma post-cuántica](#pqc).
:::

## Idioma {#language}

La extensión habla los mismos diez idiomas que la app móvil, el dashboard y el sitio: inglés, rumano, alemán, español, francés, italiano, turco, árabe, japonés y coreano. Por defecto sigue el idioma de tu **navegador** (recurriendo al inglés para cualquier otro) — nota que esta es una fuente distinta a la de la app móvil, que sigue el idioma del **teléfono**, así que ambas pueden mostrar idiomas diferentes si tu teléfono y tu navegador están configurados de forma distinta. Un selector en la pantalla de inicio del popup te permite anular el idioma detectado en cualquier momento; cambiar a árabe invierte el popup a derecha-a-izquierda de inmediato, no solo el texto.

## Seguridad y permisos {#security}

QoreX está construido para ser verificable, no solo confiable:

- **Bóveda** — tus claves están selladas con **AES-256-GCM**. La ruta de contraseña deriva su clave con **Argon2id** (RFC 9106, resistente a memoria: 64 MiB, t=3, p=1), de modo que un blob de bóveda exfiltrado resiste el cracking por GPU/ASIC. (Los blobs heredados con PBKDF2 se pueden seguir abriendo y se resellan a Argon2id en el siguiente desbloqueo.)
- **Desbloqueo con passkey (opcional, desde 0.1.5)** — donde tu autenticador admite la extensión **WebAuthn PRF**, QoreX puede desbloquear la bóveda a partir de la salida PRF de 32 bytes de la passkey en lugar de una contraseña escrita. Tu contraseña siempre permanece como respaldo.

  :::note Dónde aparece el desbloqueo con passkey
  QoreX detecta WebAuthn por funcionalidad y solo muestra **Activar desbloqueo con passkey** donde el navegador lo expone a las páginas de extensión — eso es **Chrome y Edge**. En **Firefox** la opción está oculta, porque Firefox no expone WebAuthn a las páginas de extensión. Esto es esperado, no un error.
  :::
- **Manifest V3 + CSP estricta** — `script-src 'self'; object-src 'self'; base-uri 'self'`. No hay **carga de código remoto** después de la instalación, ni `wasm-unsafe-eval`.
- **Sin cuenta, sin telemetría** — sin analítica, sin seguimiento, sin registro remoto, sin registro de usuario y sin correo electrónico. La ficha de Firefox declara la recopilación de datos como `none`.

### Qué permisos solicita QoreX, y por qué {#permissions}

Esta sección existe porque la ficha de Firefox muestra el permiso **"Acceder a tus datos en todos los sitios web"**, lo cual puede parecer contradictorio con una wallet que declara no tener permisos de host. Aquí está la verdad exacta, sin editar, tomada del manifiesto.

El `manifest.json` de la extensión declara:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — el único permiso de API. Almacena la bóveda cifrada y tus aprobaciones de conexión por origen **localmente**, en el almacenamiento de la extensión.
- **`host_permissions: []`** — QoreX no declara **ningún** permiso de host. No solicita la capacidad de hacer solicitudes de red entre orígenes a sitios arbitrarios en tu nombre.
- **`content_scripts` con matches `<all_urls>`** — esta es la razón honesta por la que Firefox dice *"Acceder a tus datos en todos los sitios web."* QoreX inyecta un pequeño script proveedor (`content.js` → `inpage.js`) en **cada página**. Un content script que se ejecuta en todos los sitios *puede* técnicamente leer la página, y los navegadores describen esa capacidad con esa frase exacta — venga de `host_permissions` o de una coincidencia de content script.

**Por qué el content script se ejecuta en todas partes.** Para que **cualquier** dApp pueda descubrir la wallet mediante EIP-6963 sin que primero le concedas acceso por sitio. Así es como funcionan MetaMask, Keplr, Phantom y cualquier otra wallet inyectada: el proveedor inyectado debe estar presente antes de que se ejecuten los scripts de la página (`document_start`), en cualquier sitio que visites.

**Qué hace ese script — y qué no hace.** Solo enlaza mensajes de la wallet (anuncia el proveedor, reenvía solicitudes de conexión/firma al service worker, devuelve el resultado). **No** lee el contenido de la página más allá de esas solicitudes de la wallet, no envía nada a un servidor, ni carga código remoto — y no puede obtener datos arbitrarios entre orígenes porque no hay permisos de host. Todo esto es verificable: la extensión está bloqueada por CSP, no incluye analítica y el paquete de Firefox incluye un zip de código fuente reproducible.

## Conectar una dApp a QoreX {#connect}

Una dApp descubre el carril EVM de QoreX mediante **EIP-6963**. Anuncia y solicita, luego usa el proveedor EIP-1193 devuelto:

```ts
import type { EIP6963ProviderDetail } from "./types";

const wallets = new Map<string, EIP6963ProviderDetail>();

// 1. Collect every wallet that announces itself.
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});

// 2. Ask installed wallets to announce.
window.dispatchEvent(new Event("eip6963:requestProvider"));

// 3. Pick QoreX by its rdns and use the standard EIP-1193 provider.
const qorex = wallets.get("network.qore.qorex");
if (qorex) {
  const accounts = await qorex.provider.request({ method: "eth_requestAccounts" });
  console.log("QoreX EVM account:", accounts[0]);
}
```

Para el carril **Nativo** de QoreChain, usa el proveedor al estilo Keplr en `window.qorex.native` (`enable`, `getKey`, `signDirect`). El paquete de nivel superior [`@qorechain/connect`](/sdk/overview) envuelve esta detección por ti.

Las aprobaciones son **por origen**: la primera conexión a un sitio abre un popup de aprobación que muestra el origen, aprobar revela únicamente tu dirección pública, y la aprobación de un sitio no concede nada a otro.

### Puente del Dashboard (v0.1.5, ampliado en v0.2.2) {#dashboard-bridge}

La versión 0.1.5 añade un puente limitado exclusivamente a **`dashboard.qorechain.io`**: `window.qorex.native.connectProof(sessionId)` firma la prueba de emparejamiento *Connect with QoreX* (el backend reverifica la firma), y `executeTransfer({ to, amountUqor, memo })` aprueba y transmite una transferencia de QOR propuesta por el Dashboard, devolviendo el `txHash`. Estos métodos se rechazan en cualquier otro origen.

**0.2.2** añade `native:executeRequest`, que acepta una solicitud completa propuesta por el Dashboard — incluyendo [staking](#stake-dashboard) — validada contra el mismo parser compartido que QoreX usa en todas partes: se rechaza ante un desajuste de red, un origen ajeno, una dirección que no es la tuya, un tipo de solicitud desconocido, o una solicitud de staking que lleve un `toAddress` (las solicitudes de staking no tienen uno).

Dado que una dirección `qor1…` es igualmente válida en mainnet y en testnet, una solicitud propuesta por el Dashboard indica a qué red apunta, y QoreX se niega a actuar sobre ella si eso no coincide con la red a la que la extensión está conectada actualmente — nunca cambiará de red por cuenta propia a partir de una solicitud.

## Firma post-cuántica {#pqc}

Cada transferencia de QOR que QoreX inicia por sí misma se firma con una **firma híbrida post-cuántica** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) junto con la firma clásica secp256k1 — usando el pipeline híbrido completo de `@qorechain/sdk`. **No hay opción para desactivarlo**: QoreChain lo exige y QoreX nunca envía una transferencia de QOR del carril Nativo sin ello.

- **Firma Nativa iniciada por dApp** — las dApps construidas sobre el flujo de qorechain-connect pre-incorporan la extensión PQC (`/qorechain.pqc.v1.PQCHybridSignature`) en el cuerpo de la transacción antes de llamar a `signDirect`; QoreX aporta la mitad clásica y **se niega a firmar a ciegas**, decodificando el payload e indicando si la capa PQC está presente.
- **Las solicitudes clásicas siempre están etiquetadas** — si una solicitud no lleva capa PQC, o apunta a una cadena externa (ETH/BNB/etc., que no puede llevar PQC), QoreX muestra una advertencia explícita en lugar de degradar silenciosamente.

**Qué significa esto para el tamaño de la transacción.** ML-DSA-87 es una firma grande: la firma tiene **4,627 bytes** y la clave pública **2,592 bytes** (fijado por FIPS-204). Una transacción híbrida de QoreChain es, por lo tanto, varios kilobytes más grande que una puramente clásica. Si construyes y transmites transacciones tú mismo, dimensiona tus búferes y estimaciones de comisión para los bytes adicionales; la contabilidad de gas de QoreChain ya los espera. Ver [Firma post-cuántica](/developer-guide/post-quantum-signing) para las primitivas y el requisito de firma determinista.
