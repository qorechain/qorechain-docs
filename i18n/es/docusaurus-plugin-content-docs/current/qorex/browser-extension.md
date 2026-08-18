---
slug: /qorex/browser-extension
title: Extensión de navegador QoreX
sidebar_label: Extensión de navegador
sidebar_position: 2
---

# Extensión de navegador QoreX

La **extensión de navegador** QoreX es la cartera QoreChain para escritorio. Es una **cartera autónoma** — crea o importa una cartera, guarda y envía QOR, y conéctate a dApps — y es la pieza que permite a cualquier sitio web descubrir QoreX y convertir cada solicitud en una aprobación explícita y descodificada.

Está **publicada y disponible** en tres tiendas.

## Instalación {#install}

| Navegador | Instalación |
|---|---|
| **Chrome y navegadores Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 o posterior)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Qué versión está publicada en cada navegador {#versions}

Las revisiones de las tiendas se resuelven en momentos distintos, así que la versión publicada actualmente difiere según el navegador:

| Navegador | Versión publicada |
|---|---|
| **Firefox** | **0.1.5** |
| **Chrome / Chromium** | **0.1.3** (0.1.5 enviada, en revisión) |
| **Safari (macOS)** | se distribuye dentro de la aplicación **QoreX Wallet** para macOS, que usa su propia numeración de versiones `1.x` |

**0.1.5** añade [descubrimiento mediante Solana Wallet Standard](#standards), [desbloqueo con clave de acceso](#security), un [carril SVM para dApps](#standards) totalmente implementado y el [puente de conexión con el Dashboard](#dashboard-bridge). (La versión 0.1.4 nunca se publicó — sus cambios llegan a los usuarios con la 0.1.5.)

**La superficie de permisos es idéntica en 0.1.3 y 0.1.5** — consulta [Qué permisos pide QoreX](#permissions).

:::note
En Safari, las aprobaciones se abren en una pestaña del navegador en lugar de una ventana emergente — la extensión se empaqueta con el envoltorio de extensiones web de Safari de Apple a partir del mismo código base.
:::

## Crear o restaurar una cartera {#wallet}

Abre la ventana emergente y elige:

- **Crear cartera** — genera una frase de recuperación nueva de 24 palabras en tu dispositivo (256 bits de entropía), deriva tu identidad de QoreChain y la sella en la bóveda bajo una contraseña (y, opcionalmente, una clave de acceso — consulta [Seguridad](#security)).
- **Importar cartera** — restaura a partir de una frase existente de 24 palabras.

La extensión guarda sus propias claves; no requiere la aplicación móvil. También puedes exportar tu mnemónica desde la ventana emergente. Las claves nunca salen del dispositivo.

### Enviar en redes externas {#send-external}

Además de QOR en el carril Native, la ventana emergente puede enviar activos en redes externas, todos derivados de la misma frase de recuperación:

| Tipo | Redes | Tokens incluidos |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum | entradas ERC-20 (USDT, USDC, DAI cuando corresponde) |
| SVM | Solana | entradas SPL (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | entrada IBC (USDC en Osmosis); campo de memo opcional |

Antes de que salga una transferencia externa debes marcar una confirmación explícita: **«Las redes externas solo aceptan firmas clásicas — a diferencia de tus QOR, esta transferencia NO es resistente a la computación cuántica.»** Las cadenas externas no pueden transportar una firma poscuántica, y QoreX nunca lo oculta.

## Estándares de cartera admitidos {#standards}

QoreX expone tres interfaces, todas inyectadas en la página como `window.qorex` (`{ evm, native, svm }`) y descubiertas mediante los contratos de detección de [`@qorechain/connect`](/sdk/overview).

| Estándar | Qué es | Qué significa para ti como desarrollador |
|---|---|---|
| **EIP-1193** | La API JavaScript del proveedor de Ethereum (`request(...)`, eventos). | Tu código actual de ethers.js / viem / web3.js habla con el carril EVM de QoreX sin cambios; los códigos numéricos de error (p. ej. `4902`) se reenvían literalmente. |
| **EIP-6963** | Descubrimiento de proveedores multicartera (eventos de anuncio / solicitud). | QoreX se anuncia junto a todas las demás carteras — **nunca sobrescribe `window.ethereum`** — de modo que el usuario elige QoreX en cada sitio sin conflictos. |
| **`signDirect` al estilo Keplr** | Un proveedor con forma de `OfflineDirectSigner` de Cosmos en `window.qorex.native`. | Las dApps de estilo Cosmos firman transacciones del **carril Native** de QoreChain igual que lo harían con Keplr; la capa poscuántica se aplica previamente (consulta [Firma poscuántica](#pqc)). |
| **Solana Wallet Standard** *(desde 0.1.5)* | Descubrimiento nativo de carteras para dApps de Solana (`wallet-standard:register-wallet` / `app-ready`). | Las dApps de Solana **detectan QoreX automáticamente** — sin integración a medida. Funciones: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; cadena `solana:mainnet`; transacciones `legacy` y `v0`. |

:::note Acceder directamente al carril SVM
La misma interfaz también está disponible en `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). El descubrimiento automático de Wallet Standard y el carril SVM totalmente implementado llegan con **0.1.5** — así que hoy están disponibles en **Firefox**, y en Chrome en cuanto la 0.1.5 supere la revisión (consulta [qué versión está publicada en cada navegador](#versions)).

Las aprobaciones de Solana muestran la carga útil descodificada (destinatario y lamports para las transferencias de System, y la lista de programas), rechazan las transacciones que no incluyan tu cartera como firmante, y marcan la firma como **clásica** — consulta [Firma poscuántica](#pqc).
:::

## Seguridad y permisos {#security}

QoreX está construida para ser verificable, no solo digna de confianza:

- **Bóveda** — tus claves se sellan con **AES-256-GCM**. La ruta con contraseña deriva su clave con **Argon2id** (RFC 9106, exigente en memoria: 64 MiB, t=3, p=1), de modo que un blob de bóveda exfiltrado resiste el descifrado por GPU/ASIC. (Los blobs heredados con PBKDF2 siguen pudiendo abrirse y se vuelven a sellar con Argon2id en el siguiente desbloqueo.)
- **Desbloqueo con clave de acceso (opcional, desde 0.1.5)** — cuando tu autenticador admite la extensión **WebAuthn PRF**, QoreX puede desbloquear la bóveda a partir de la salida PRF de 32 bytes de la clave de acceso en lugar de una contraseña escrita. Tu contraseña siempre sigue disponible como alternativa.

  :::note Dónde aparece el desbloqueo con clave de acceso
  QoreX detecta la disponibilidad de WebAuthn y solo muestra **Activar desbloqueo con clave de acceso** allí donde el navegador la expone a las páginas de extensión — es decir, en **Chrome y Edge**. En **Firefox** la opción está oculta, porque Firefox no expone WebAuthn a las páginas de extensión. Combinado con el [desfase de versiones](#versions), esto significa que hoy un usuario de Firefox tiene Wallet Standard pero no desbloqueo con clave de acceso, y un usuario de Chrome no tiene ninguno de los dos hasta que la 0.1.5 supere la revisión. Esto es lo esperado, no un fallo.
  :::
- **Manifest V3 + CSP estricta** — `script-src 'self'; object-src 'self'; base-uri 'self'`. **No hay carga de código remoto** tras la instalación ni `wasm-unsafe-eval`.
- **Sin cuenta, sin telemetría** — sin analítica, sin rastreo, sin registro remoto, sin registro de usuario y sin correo electrónico. La ficha de Firefox declara la recopilación de datos como `none`.

### Qué permisos pide QoreX, y por qué {#permissions}

Esta sección existe porque la ficha de Firefox muestra el permiso **«Acceder a tus datos en todos los sitios web»**, lo que puede parecer contradictorio en una cartera que no declara permisos de host. Esta es la verdad exacta y sin editar del manifiesto.

El archivo `manifest.json` de la extensión declara:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — el único permiso de API. Almacena la bóveda cifrada y tus aprobaciones de conexión por origen **de forma local**, en el almacenamiento de la extensión.
- **`host_permissions: []`** — QoreX **no** declara ningún permiso de host. No solicita la capacidad de hacer peticiones de red entre orígenes a sitios arbitrarios en tu nombre.
- **`content_scripts` coincide con `<all_urls>`** — esta es la razón honesta por la que Firefox dice *«Acceder a tus datos en todos los sitios web»*. QoreX inyecta un pequeño script de proveedor (`content.js` → `inpage.js`) en **todas las páginas**. Un script de contenido que se ejecuta en todos los sitios *puede* técnicamente leer la página, y los navegadores describen esa capacidad con esa misma redacción — venga de `host_permissions` o de una coincidencia de script de contenido.

**Por qué el script de contenido se ejecuta en todas partes.** Para que **cualquier** dApp pueda descubrir la cartera mediante EIP-6963 sin que tengas que conceder antes acceso por sitio. Así es como funcionan MetaMask, Keplr, Phantom y todas las demás carteras inyectadas: el proveedor inyectado debe estar presente antes de que se ejecuten los scripts de la página (`document_start`), en cualquier sitio que visites.

**Qué hace ese script — y qué no hace.** Solo transmite mensajes de cartera (anunciar el proveedor, reenviar las solicitudes de conexión/firma al service worker, devolver el resultado). **No** lee el contenido de la página más allá de esas solicitudes de cartera, ni envía nada a un servidor, ni carga código remoto — y no puede obtener datos arbitrarios entre orígenes porque no hay permisos de host. Todo esto es verificable: la extensión está bloqueada por CSP, no incluye analítica, y el paquete de Firefox incluye un zip de código fuente reproducible.

## Conectar una dApp a QoreX {#connect}

Una dApp descubre el carril EVM de QoreX mediante **EIP-6963**. Anunciar y solicitar, y después usar el proveedor EIP-1193 devuelto:

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

Para el carril **Native** de QoreChain, usa el proveedor al estilo Keplr en `window.qorex.native` (`enable`, `getKey`, `signDirect`). El paquete de más alto nivel [`@qorechain/connect`](/sdk/overview) envuelve esta detección por ti.

Las aprobaciones son **por origen**: la primera conexión con un sitio abre una ventana de aprobación que muestra el origen, aprobar revela únicamente tu dirección pública, y la aprobación de un sitio no concede nada a otro.

### Puente con el Dashboard (v0.1.5) {#dashboard-bridge}

La versión 0.1.5 añade un puente limitado **exclusivamente a `dashboard.qorechain.io`**: `window.qorex.native.connectProof(sessionId)` firma la prueba de emparejamiento *Conectar con QoreX* (el backend vuelve a verificar la firma), y `executeTransfer({ to, amountUqor, memo })` aprueba y difunde una transferencia de QOR propuesta desde el Dashboard, devolviendo el `txHash`. Estos métodos se rechazan en cualquier otro origen.

## Firma poscuántica {#pqc}

Cada transferencia de QOR que la propia QoreX inicia se firma con una **firma híbrida poscuántica** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) junto a la firma clásica secp256k1 — usando la canalización híbrida completa de `@qorechain/sdk`. **No hay ninguna opción para desactivarlo**: QoreChain lo exige y QoreX nunca envía una transferencia de QOR por el carril Native sin ella.

- **Firma Native iniciada por una dApp** — las dApps construidas sobre el flujo de qorechain-connect superponen previamente la extensión PQC (`/qorechain.pqc.v1.PQCHybridSignature`) en el cuerpo de la transacción antes de llamar a `signDirect`; QoreX aporta la mitad clásica y **se niega a firmar a ciegas**, descodificando la carga útil e indicando si la capa PQC está presente.
- **Las solicitudes clásicas siempre se etiquetan** — si una solicitud no lleva capa PQC, o va dirigida a una cadena externa (ETH/BNB/etc., que no pueden transportar PQC), QoreX muestra una advertencia explícita en lugar de degradar la seguridad en silencio.

**Qué significa esto para el tamaño de la transacción.** ML-DSA-87 produce una firma grande: la firma ocupa **4,627 bytes** y la clave pública **2,592 bytes** (fijados por FIPS-204). Por tanto, una transacción híbrida de QoreChain es varios kilobytes mayor que una puramente clásica. Si construyes y difundes transacciones por tu cuenta, dimensiona tus búferes y estimaciones de comisión para esos bytes adicionales; la contabilidad de gas de QoreChain ya cuenta con ellos. Consulta [Firma poscuántica](/developer-guide/post-quantum-signing) para conocer las primitivas y el requisito de firma determinista.
