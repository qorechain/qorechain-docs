---
slug: /qorex/browser-extension
title: Extensión de navegador QoreX
sidebar_label: Extensión de navegador
sidebar_position: 2
---

# Extensión de navegador QoreX

La **extensión de navegador** QoreX es la billetera QoreChain de escritorio. Es una **billetera independiente** — crea o importa una billetera, guarda y envía QOR, y conéctate a dApps — y es la pieza que permite a cualquier sitio web descubrir QoreX y convertir cada solicitud en una aprobación explícita y decodificada.

Está **activa y disponible públicamente** en tres tiendas.

## Instalación {#install}

| Navegador | Instalar |
|---|---|
| **Chrome y navegadores basados en Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 o posterior)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

La compilación pública actual es la **0.1.3**. La versión **0.1.5** se está desplegando ahora; añade el [puente de conexión con el Dashboard](#dashboard-bridge). La superficie de permisos no cambia entre estas versiones.

:::note
En Safari, las aprobaciones se abren en una pestaña del navegador en lugar de en una ventana emergente — la extensión está empaquetada con el envoltorio de extensión web de Safari de Apple a partir del mismo código base.
:::

## Crear o restaurar una billetera {#wallet}

Abre la ventana emergente y elige:

- **Crear billetera** — genera una nueva frase de recuperación de 24 palabras en tu dispositivo (256 bits de entropía), deriva tu identidad de QoreChain y la sella en la bóveda bajo una contraseña (y, opcionalmente, una passkey — consulta [Seguridad](#security)).
- **Importar billetera** — restaura a partir de una frase de 24 palabras existente.

La extensión guarda sus propias claves; no requiere la aplicación móvil. También puedes exportar tu mnemónica desde la ventana emergente. Las claves nunca salen del dispositivo.

## Estándares de billetera admitidos {#standards}

QoreX expone tres interfaces, todas inyectadas en la página como `window.qorex` (`{ evm, native, svm }`) y descubiertas mediante los contratos de detección de [`@qorechain/connect`](/sdk/overview).

| Estándar | Qué es | Qué significa para ti como desarrollador |
|---|---|---|
| **EIP-1193** | La API JavaScript del proveedor de Ethereum (`request(...)`, eventos). | Tu código actual de ethers.js / viem / web3.js habla con el carril EVM de QoreX sin cambios; los códigos de error numéricos (p. ej. `4902`) se reenvían literalmente. |
| **EIP-6963** | Descubrimiento de proveedores multi-billetera (eventos de anuncio / solicitud). | QoreX se anuncia junto a cualquier otra billetera — **nunca sobrescribe `window.ethereum`** — de modo que el usuario elige QoreX por sitio sin conflictos. |
| **`signDirect` estilo Keplr** | Un proveedor con forma de `OfflineDirectSigner` de Cosmos en `window.qorex.native`. | Las dApps de estilo Cosmos firman transacciones del **carril Native** de QoreChain igual que lo harían con Keplr; la capa poscuántica se aplica previamente (consulta [Firma poscuántica](#pqc)). |

:::note SVM (compatible con Solana)
Se expone un proveedor SVM en `window.qorex.svm` con `connect` / `signAndSendTransaction` / `signMessage`. QoreX **aún no** se registra mediante el protocolo de descubrimiento **Wallet Standard** de Solana, por lo que las dApps de Solana que dependen del autodescubrimiento de Wallet-Standard no detectarán QoreX automáticamente — accede a él a través de `window.qorex.svm` directamente por ahora.
:::

## Seguridad y permisos {#security}

QoreX está construida para ser verificable, no solo para inspirar confianza:

- **Bóveda** — tus claves se sellan con **AES-256-GCM**. La vía de contraseña deriva su clave con **Argon2id** (RFC 9106, resistente a memoria: 64 MiB, t=3, p=1), de modo que un blob de bóveda exfiltrado resiste el descifrado por GPU/ASIC. (Los blobs PBKDF2 heredados siguen siendo abribles y se vuelven a sellar con Argon2id en el próximo desbloqueo.)
- **Desbloqueo con passkey (opcional)** — allí donde tu autenticador admite la extensión **WebAuthn PRF**, QoreX puede desbloquear la bóveda a partir de la salida PRF de 32 bytes de la passkey en lugar de una contraseña escrita.
- **Manifest V3 + CSP estricta** — `script-src 'self'; object-src 'self'; base-uri 'self'`. **No hay carga de código remoto** tras la instalación ni `wasm-unsafe-eval`.
- **Sin cuenta, sin telemetría** — sin analíticas, sin seguimiento, sin registro remoto, sin registro de usuario y sin correo electrónico. La ficha de Firefox declara la recopilación de datos como `none`.

### Qué permisos pide QoreX, y por qué {#permissions}

Esta sección existe porque la ficha de Firefox muestra el permiso **"Acceder a tus datos en todos los sitios web"**, lo que puede parecer contradictorio con una billetera que no declara permisos de host. Aquí está la verdad exacta, sin editar, del manifiesto.

El archivo `manifest.json` de la extensión declara:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — el único permiso de API. Almacena la bóveda cifrada y tus aprobaciones de conexión por origen **localmente**, en el almacenamiento de la extensión.
- **`host_permissions: []`** — QoreX **no** declara permisos de host. No solicita la capacidad de hacer solicitudes de red entre orígenes a sitios arbitrarios en tu nombre.
- **`content_scripts` coincide con `<all_urls>`** — esta es la razón honesta por la que Firefox dice *"Acceder a tus datos en todos los sitios web."* QoreX inyecta un pequeño script de proveedor (`content.js` → `inpage.js`) en **cada página**. Un content script que se ejecuta en todos los sitios *puede* técnicamente leer la página, y los navegadores describen esa capacidad con esa redacción exacta — provenga de `host_permissions` o de una coincidencia de content-script.

**Por qué el content script se ejecuta en todas partes.** Para que **cualquier** dApp pueda descubrir la billetera a través de EIP-6963 sin que tengas que conceder primero acceso por sitio. Así funcionan MetaMask, Keplr, Phantom y cualquier otra billetera inyectada: el proveedor inyectado debe estar presente antes de que se ejecuten los scripts de la página (`document_start`), en cualquier sitio que visites.

**Qué hace ese script — y qué no hace.** Solo actúa como puente para los mensajes de la billetera (anunciar el proveedor, reenviar solicitudes de conexión/firma al service worker, devolver el resultado). **No** lee el contenido de la página más allá de esas solicitudes de billetera, no envía nada a un servidor ni carga código remoto — y no puede obtener datos arbitrarios entre orígenes porque no hay permisos de host. Todo esto es verificable: la extensión está bloqueada por CSP, no incluye analíticas y el paquete de Firefox incluye un zip de código fuente reproducible.

## Conectar una dApp a QoreX {#connect}

Una dApp descubre el carril EVM de QoreX a través de **EIP-6963**. Anunciar y solicitar, luego usar el proveedor EIP-1193 devuelto:

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

Para el carril **Native** de QoreChain, usa el proveedor estilo Keplr en `window.qorex.native` (`enable`, `getKey`, `signDirect`). El paquete de más alto nivel [`@qorechain/connect`](/sdk/overview) envuelve esta detección por ti.

Las aprobaciones son **por origen**: la primera conexión a un sitio abre una ventana emergente de aprobación que muestra el origen, aprobar revela únicamente tu dirección pública, y la aprobación de un sitio no concede nada a otro.

### Puente con el Dashboard (v0.1.5) {#dashboard-bridge}

La versión 0.1.5 añade un puente limitado a **`dashboard.qorechain.io` únicamente**: `window.qorex.native.connectProof(sessionId)` firma la prueba de emparejamiento *Connect with QoreX* (el backend vuelve a verificar la firma), y `executeTransfer({ to, amountUqor, memo })` aprueba y transmite una transferencia de QOR propuesta por el Dashboard, devolviendo el `txHash`. Estos métodos se rechazan en cualquier otro origen.

## Firma poscuántica {#pqc}

Cada transferencia de QOR que QoreX inicia por sí misma se firma con una **firma poscuántica híbrida** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) junto a la firma clásica secp256k1 — usando la canalización híbrida completa de `@qorechain/sdk`. **No hay ningún interruptor**: QoreChain lo exige y QoreX nunca envía una transferencia de QOR del carril Native sin ello.

- **Firma Native iniciada por la dApp** — las dApps construidas sobre el flujo qorechain-connect aplican por adelantado la extensión PQC (`/qorechain.pqc.v1.PQCHybridSignature`) en el cuerpo de la transacción antes de llamar a `signDirect`; QoreX aporta la mitad clásica y **se niega a firmar a ciegas**, decodificando la carga útil y marcando si la capa PQC está presente.
- **Las solicitudes clásicas siempre se etiquetan** — si una solicitud no lleva capa PQC, o apunta a una cadena externa (ETH/BNB/etc., que no pueden llevar PQC), QoreX muestra una advertencia explícita en lugar de degradar silenciosamente.

**Qué significa esto para el tamaño de la transacción.** ML-DSA-87 es una firma grande: la firma ocupa **4,627 bytes** y la clave pública **2,592 bytes** (fijados por FIPS-204). Una transacción híbrida de QoreChain es, por tanto, varios kilobytes más grande que una puramente clásica. Si construyes y transmites transacciones tú mismo, dimensiona tus búferes y estimaciones de comisión para los bytes adicionales; la contabilidad de gas de QoreChain ya los prevé. Consulta [Firma poscuántica](/developer-guide/post-quantum-signing) para conocer las primitivas y el requisito de firma determinista.
