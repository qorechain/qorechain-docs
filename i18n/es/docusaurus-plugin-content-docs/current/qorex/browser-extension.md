---
slug: /qorex/browser-extension
title: Extensión de Navegador QoreX
sidebar_label: Extensión de Navegador
sidebar_position: 2
---

# Extensión de Navegador QoreX

La **extensión de navegador** QoreX es la wallet de escritorio de QoreChain. Es una **wallet independiente** (crea o importa una wallet, guarda, envía y haz staking de QOR, y conéctate a dApps) y es la pieza que permite que cualquier sitio web descubra QoreX y convierta cada solicitud en una aprobación explícita y decodificada. Es para quien usa QoreChain desde un navegador de escritorio, y para desarrolladores que quieren que su aplicación web funcione con una wallet de QoreChain.

Está **activa y disponible públicamente** en tres tiendas (Chrome, Firefox y Safari). Firefox lleva actualmente el build más reciente; Chrome y Safari van una versión por detrás. Ver [qué versión está activa en cada uno](#versions).

## Innovaciones {#innovations}

- **`signAndBroadcast`.** Una dApp envía mensajes; la wallet muestra cada mensaje decodificado y la comisión, añade la capa ML-DSA-87 que solo la wallet puede crear, y transmite. Una página nunca tiene la clave ML-DSA-87.
- **`signDirect` comprueba la capa contra la clave registrada.** Si una dApp adjunta por sí misma una capa ML-DSA-87, QoreX la comprueba contra la clave registrada de la cuenta en cadena antes de que se abra cualquier ventana de aprobación. Una transacción solo clásica se rechaza. Esta no es la ruta recomendada (ver [Límites](#limits)).
- **Un solo permiso de API.** El único permiso de API de la extensión es `storage`, no hay permisos de host y no hay código de analítica, de informes de fallos ni de seguimiento. Ver [Qué permisos solicita QoreX](#permissions).
- **Bóveda sellada.** La bóveda se cifra con AES-256-GCM bajo una clave derivada de la contraseña (Argon2id). Donde el navegador expone WebAuthn PRF (Chrome y Edge), puedes desbloquear con una passkey en su lugar; la contraseña siempre sigue como respaldo.
- **Descubrimiento sin apropiarse.** QoreX se anuncia con EIP-6963 (`rdns` `network.qore.qorex`) y el Solana Wallet Standard. Nunca sobrescribe `window.ethereum` ni `window.keplr`.
- **Aprobaciones por origen, identificado por el navegador.** El sitio es el origen que atestigua el propio navegador, nunca lo que la solicitud afirma. Una solicitud que repite un campo para que pueda leerse de dos maneras se rechaza.

## Cómo usarla {#how-to-use}

1. Instala la extensión (ver [Cómo acceder](#how-to-access)) y abre el popup.
2. Elige **Crear una wallet nueva** (una contraseña y luego 24 palabras mostradas una sola vez) o **Importar una frase de recuperación**. Ver [Crear o restaurar una wallet](#wallet).
3. Usa **Enviar**, **Recibir**, **Stake** y **Monedas y tokens** en el popup. Ver [Hacer staking desde la extensión](#stake) y [Enviar en redes externas](#send-external).
4. Abre una dApp. La primera conexión muestra una aprobación con el origen del sitio; aprobar revela únicamente tu dirección pública. Revoca cualquier sitio en [Sitios conectados](#connected-sites).
5. Como desarrollador, detecta QoreX con EIP-6963 y envía una transacción con `signAndBroadcast`. Ver [Conectar una dApp a QoreX](#connect) y [Enviar una transacción de QoreChain desde una dApp](#sign-and-broadcast).

## Cómo acceder {#how-to-access}

Solo necesitas un navegador de escritorio: sin cuenta, sin registro y sin app móvil. Se aplican comisiones de red cuando envías o haces staking (el mínimo de la red es 0.1 uqor por gas). La extensión sigue la red en la que está configurada; mainnet `qorechain-vladi` es la predeterminada.

### Instalación {#install}

| Navegador | Instalación |
|---|---|
| **Chrome y navegadores basados en Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** (Firefox 140 o posterior) | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 12 o posterior)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

Instala siempre desde una de estas fichas.

### Qué versión está activa en cada uno {#versions}

Versión actual en cada tienda, a fecha de **27 de octubre de 2026**:

| Tienda | Versión actual |
|---|---|
| Chrome Web Store | 0.3.8 |
| Firefox Add-ons | 0.3.9 |
| Safari (Mac App Store, app de macOS **QoreX Wallet**) | 1.7.8, que incluye la extensión 0.3.8 (la Mac App Store usa su propia numeración `1.x`) |

Las revisiones de cada tienda se completan en momentos distintos, así que una tienda puede servir un build más antiguo que otra; la ficha de la tienda siempre muestra su versión actual. Consulta también [Qué versión está activa en cada uno](/qorex/overview#versions).

Firefox 0.3.9 añade [bloqueos de staking](/qorex/portfolio-and-staking#staking-locks), memos de transferencias IBC en lenguaje claro en las aprobaciones y [staking desde cuentas importadas de MetaMask](#coin60). Chrome y Safari los incluirán cuando sus tiendas sirvan un build 0.3.9.

Desde 0.2.6 la extensión ha incorporado: [varias wallets con una sola contraseña](#wallets), una [cuenta al estilo Ethereum que añades a mano](#coin60), [Claim & restake](#stake), una lista **Unstaking en curso**, [añadir un token por contrato](#custom-tokens), [Recibir en cualquier red](#receive), [Sitios conectados con Revocar](#connected-sites), la [ventana de acceso EVM](#evm-window), [`signAndBroadcast` para dApps](#sign-and-broadcast) y pantallas de aprobación que muestran cada mensaje, comisión y caducidad.

**La superficie de permisos no ha cambiado desde 0.1.3.** Ver [Qué permisos solicita QoreX](#permissions).

:::note
En Safari, las aprobaciones se abren en una pestaña del navegador en lugar de una ventana emergente. La extensión se empaqueta con el envoltorio de extensiones web de Safari de Apple, a partir de la misma base de código.
:::

## Crear o restaurar una wallet {#wallet}

Abre el popup y elige:

- **Crear una wallet nueva** - elige una contraseña (de al menos 8 caracteres); QoreX genera en tu dispositivo una frase de recuperación nueva de 24 palabras (256 bits de entropía), deriva tu identidad de QoreChain y la sella en la bóveda bajo esa contraseña (y, opcionalmente, una passkey - ver [Seguridad](#security)). Las 24 palabras se muestran **una sola vez** - anótalas, marca *He guardado mi frase de recuperación en un lugar seguro* y continúa. Puedes volver a mostrarlas más tarde con **Mostrar frase de recuperación** en el popup (requiere la contraseña).
- **Importar una frase de recuperación** - restaura a partir de una frase existente. Una frase de menos de 24 palabras restaura tus fondos con normalidad, pero QoreX te avisa de que tu clave ML-DSA-87 solo tiene entonces la fortaleza de esa frase; para la fortaleza completa, crea una wallet nueva de 24 palabras y mueve tus fondos allí.

:::danger Anota la frase antes de continuar
La bóveda de la extensión vive solo en este navegador. **Quitar la extensión, borrar sus datos o restablecer el navegador elimina tus claves**, y nadie - incluida QoreChain Association - puede restaurarlas. Sin tus 24 palabras anotadas, tus fondos se pierden para siempre. Ver [Haz la copia de seguridad ahora](/qorex/security-and-recovery#back-up-now).
:::

La extensión mantiene sus propias claves; no requiere la app móvil. Las claves nunca salen del dispositivo.

## Varias wallets y cuentas {#wallets}

- **Wallets** (desde 0.3.3) - la pantalla **Wallets** del popup («Wallets en este navegador») lista todas las wallets de este navegador. Cada una tiene su propia frase de recuperación; **una sola contraseña** las desbloquea todas, y cambiar de una a otra modifica cuál muestra y con cuál firma QoreX (nada se mueve en cadena). **Añade** una wallet creando una nueva (su frase se muestra una sola vez) o restaurando una; se te pide la contraseña una vez para volver a sellar la bóveda. Añadir o quitar una wallet desactiva el **desbloqueo con passkey** - vuelve a activarlo desde la pantalla de inicio. Para quitar una, toca *Quitar de este navegador* e introduce tu contraseña; la última wallet no se puede quitar desde esta pantalla. Quitarla elimina esa clave del navegador - solo su frase de recuperación la recupera.
- **Cuentas** (desde 0.2.2) - **Tus cuentas** crea y alterna entre varias cuentas a partir de la misma frase (hasta 20 por wallet; están numeradas y no se pueden renombrar). Restaurar la frase que anotaste devuelve la **Cuenta 1**; vuelve a añadir las demás con **Añadir una cuenta**. Cambiar de cuenta mueve todo con ella: envíos, staking, recepción y tu @handle siguen a la cuenta que esté activa.

### Cuenta al estilo Ethereum {#coin60}

Desde 0.3.2, **Añadir una cuenta Ethereum (coin 60)** (en la pantalla **Tus cuentas**) añade la cuenta para una frase usada primero en MetaMask o en el Dashboard; ver [Restaurar una frase de MetaMask o del Dashboard](/qorex/getting-started#restore-dashboard). Su dirección 0x es la que MetaMask muestra para las mismas palabras. No se ofrecen handles en ella. Desde Firefox 0.3.9 puedes hacer staking desde esta cuenta en la extensión.

Portafolio, Q-Day Scanner, recuperación social, Legacy Protocol, solicitudes de pago, inicio de sesión con la cuenta y vinculación de dispositivos siguen siendo exclusivos de la app móvil - ver [QoreX Wallet](/qorex/overview#platform-availability).

## Tu cuenta, saldo y @handle {#account}

La pantalla de inicio del popup muestra tu dirección `qor1…` (toca para copiar) y tu saldo de QOR en vivo, así no necesitas abrir un explorador de bloques para consultar ninguno de los dos.

### Saldos en vesting (bloqueados) {#vesting}

Si tu cuenta tiene QOR en vesting (por ejemplo, una asignación TGE aún no liberada), el saldo se divide en **disponible ahora** y **aún bloqueado**, y un envío que supere el monto disponible se rechaza antes de que llegue a la red, en lugar de fallar en cadena después de cobrar una comisión. QoreX deliberadamente **no** muestra una "próxima fecha de desbloqueo" aquí: un cronograma de vesting puede ser modificado por gobernanza, así que una fecha en la tarjeta de saldo se leería como una promesa que QoreX no puede garantizar. La división entre disponible y bloqueado es lo que se mantiene exacto.

### Reclama un @handle

Reclamar un **@handle** único (por ejemplo, `@liviu`) requiere una **cuenta con sesión iniciada** y se hace **en la app móvil**; la extensión te dirige allí y no reclama handles por sí misma. Una vez reclamado, el handle se vincula a esa dirección, de modo que la extensión lo resuelve cuando lo pagas y otros pueden pagarte por nombre. Consulta [@handle](/qorex/account-and-dashboard#handle) para ver cómo los handles se vinculan a direcciones (no a una wallet en su conjunto).

## Enviar a un @handle {#handle-send}

Desde 0.1.9 puedes pagar directamente a un @handle registrado en lugar de buscar una dirección (las búsquedas estuvieron interrumpidas por un fallo en las versiones hasta 0.3.6 y vuelven a funcionar desde 0.3.7):

1. Abre el popup y toca **Enviar**.
2. En el campo de destinatario, escribe `@` seguido del handle (por ejemplo, `@liviu`) en lugar de una dirección `qor1…`.
3. QoreX resuelve el handle y te muestra la **dirección resuelta** antes de que firmes nada - verifica siempre esto frente a lo que esperas.
4. Ingresa el monto y confirma.

La resolución se verifica de dos maneras antes de que QoreX la use: una atestación del registro comprobada contra una clave de confianza integrada en la extensión, y la propia firma del titular del handle sobre el reclamo. Una respuesta que falle en cualquiera de las dos comprobaciones se rechaza por completo - QoreX no recurre a mostrar una dirección sin verificar. La primera vez que pagas a un handle determinado, QoreX recuerda (fija) la dirección a la que se resolvió; si ese handle más adelante se resuelve a una dirección **diferente**, QoreX se detiene y te muestra tanto la dirección antigua como la nueva en su totalidad, para que puedas decidir si continuar. Esta memoria vive **por navegador** - pagar al mismo handle por primera vez desde un navegador o computadora diferente lo mostrará también como nuevo allí. Eso es lo esperado, no un error.

## Recibir {#receive}

Toca **Recibir** en el popup para mostrar tu dirección `qor1…` como un código QR (con el ícono de QoreChain incrustado) junto a un botón de copiar - escanéalo desde un teléfono o pega la dirección directamente.

**Selector de red.** Recibir también puede mostrar la dirección para Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis y Celestia, cada una con una advertencia de «solo esta red» (QoreChain sigue siendo la primera).

## Hacer staking desde la extensión {#stake}

Desde **0.2.2**, el popup tiene su propia pantalla de **Stake** - una wallet creada solo en la extensión ya no necesita la app móvil para obtener recompensas de staking.

1. Abre el popup y ve a **Stake**.
2. La pantalla lista los validadores activos con su comisión, tu total actual en staking y cualquier recompensa pendiente de reclamar. Los validadores que la red ha **encarcelado (jailed)** quedan fuera de la lista - delegar a uno de ellos nunca es lo que quieres.
3. Para delegar, elige un validador y un monto, luego confirma. QoreX firma con la firma híbrida obligatoria (secp256k1 y ML-DSA-87), igual que un Envío. Mientras escribes, te avisa si el monto dejaría menos que la comisión de una transacción (no podrías retirar de staking ni reclamar hasta que la cuenta vuelva a tener QOR). Con varias cuentas, elige cuál hace el staking desde el selector de cuenta de la pantalla Stake.
4. **Reclamar** recoge las recompensas; **Claim & restake** las recompone de vuelta a los validadores que las generaron en una sola transacción. QoreX comprueba antes que tu QOR **desbloqueado** pueda pagar la comisión (se paga antes de que lleguen las recompensas) y te avisa si no es así.
5. **Retirar de staking (unstake)** inicia el período de desbonding de 21 días y el monto aparece en **Unstaking en curso** con el tiempo restante - ver [Staking y Delegación](/user-guide/staking-and-delegation).
6. **Mover stake** traslada el stake a uno o varios validadores distintos (redelegar) - sin espera de desbonding, sin penalización, y las recompensas siguen fluyendo. Ver [Mover stake entre validadores](/qorex/portfolio-and-staking#move-stake).

El staking, la delegación y las recompensas ocurren exclusivamente en el carril **Nativo**, nunca a través de un precompilado EVM. Firefox 0.3.9 añade además [bloqueos de staking](/qorex/portfolio-and-staking#staking-locks).

### Aprobar una solicitud de staking del Dashboard {#stake-dashboard}

El [Dashboard](/dashboard/staking-and-validators) de QoreChain compone las solicitudes de staking pero no puede firmarlas - tu clave nunca sale de la bóveda de la extensión. Al hacer clic en **Continuar en QoreX** en el Dashboard, la solicitud se abre en la extensión para que la revises (validador y monto) y la apruebes, exactamente igual que un Envío.

:::note Si una transacción aparece como "degradada" en lugar de exitosa
El Dashboard ocasionalmente muestra una transacción como **degradada (downgraded)** en lugar de un éxito limpio. Esto significa que tus fondos se movieron, pero la capa de firma ML-DSA-87 no se encontró en cadena para esa transacción - no es algo que hayas hecho mal ni algo que puedas arreglar de tu lado. Es un fallo de nuestro lado; por favor repórtalo a soporte para que podamos investigarlo. El mensaje permanece en pantalla deliberadamente en lugar de desaparecer, para que tengas tiempo de leerlo y reportarlo.
:::

### Enviar en redes externas {#send-external}

Además de QOR en el carril Nativo, el popup puede enviar activos en redes externas, todas derivadas de la misma frase de recuperación (para las redes EVM muestra la **comisión máxima de red** - «Comisión de red: como máximo …» - antes de que confirmes):

| Tipo | Redes | Tokens incluidos |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | Entradas ERC-20 (USDC y USDT en las cadenas EVM, DAI en Ethereum) |
| SVM | Solana | Entradas SPL (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | Noble USDC vía IBC; campo de memo opcional |

Antes de que salga una transferencia externa debes marcar una confirmación explícita: **"External networks accept only classical signatures — unlike your QOR, this transfer is NOT quantum-safe."** Este es el texto exacto que muestran los builds en vivo. Las cadenas externas no pueden llevar una firma ML-DSA-87, y QoreX nunca lo oculta.

## Estándares de wallet compatibles {#standards}

QoreX expone tres interfaces, todas inyectadas en la página como `window.qorex` (`{ evm, native, svm }`) y detectadas mediante EIP-6963 y el Solana Wallet Standard. En una aplicación web, el [wallet adapter](/developer-tools/wallet-adapter) envuelve esta detección.

| Estándar | Qué es | Qué significa para ti como desarrollador |
|---|---|---|
| **EIP-1193** | La API JavaScript del proveedor de Ethereum (`request(...)`, eventos). | El proveedor EVM de QoreX responde a consultas de cuenta y de red - `eth_requestAccounts`, `eth_accounts`, `eth_chainId` y `wallet_switchEthereumChain` (cualquier otra cadena devuelve el estándar `4902`). **Todavía no** firma ni envía transacciones o mensajes EVM: los demás métodos devuelven "EVM method … not yet supported". Usa MetaMask u otra wallet EVM para las transacciones del carril EVM (que ahora además necesitan una [ventana de acceso EVM](#evm-window) abierta). |
| **EIP-6963** | Descubrimiento de proveedores multi-wallet (eventos announce / request). | QoreX se anuncia junto a cualquier otra wallet - **nunca sobrescribe `window.ethereum`** - así que el usuario elige QoreX por sitio sin conflictos. |
| **Proveedor Nativo (estilo Keplr)** | `window.qorex.native`: `enable`, `getKey`, `signAndBroadcast` y `signDirect`, además de una lista `capabilities`. **No** es un reemplazo completo de Keplr: QoreX no crea el alias `window.keplr`, y `signAmino` y `sendTx` no existen. | Para enviar una transacción de QoreChain llama a **`signAndBroadcast`** (ver [Enviar una transacción de QoreChain](#sign-and-broadcast)): QoreX muestra los mensajes decodificados y la comisión, añade la capa ML-DSA-87 que solo la wallet puede crear, y transmite. `signDirect` está disponible pero no es la ruta recomendada: comprueba una capa que tu página adjuntó contra la clave registrada de la cuenta antes de cualquier ventana de aprobación, y rechaza una transacción solo clásica. |
| **Solana Wallet Standard** *(desde 0.1.5)* | Descubrimiento nativo de wallets para dApps de Solana (`wallet-standard:register-wallet` / `app-ready`). | Las dApps de Solana **detectan automáticamente QoreX** - sin integración personalizada. Funciones: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; cadena `solana:mainnet`; transacciones tanto `legacy` como `v0`. |

:::note Cómo acceder al carril SVM directamente
La misma interfaz también está disponible en `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). El descubrimiento automático de Wallet-Standard y el carril SVM totalmente implementado se lanzaron en **0.1.5** y están activos tanto en Chrome como en Firefox (ver [qué versión está activa en cada uno](#versions)).

Las aprobaciones de Solana muestran **una línea por instrucción**, decodificada donde QoreX puede: transferencias de SOL (destinatario y lamports), transferencias de tokens SPL, **«PERMITIR GASTAR tus tokens»** (approve), **«ENTREGAR el control de la cuenta»** (set authority) y el cierre de una cuenta de tokens - y dicen «instrucción que QoreX no puede leer» para cualquier otra, junto con el programa. Una solicitud que incluye una instrucción approve o set-authority se titula «quiere autoridad sobre tus tokens de Solana - lee cada línea de abajo». Se rechazan las transacciones que no incluyan tu wallet como firmante, `signMessage` no firmará bytes que en realidad sean una transacción, y la firma se marca como **clásica**. Ver [Firma híbrida](#pqc).
:::

## Monedas y tokens {#custom-tokens}

La pantalla **Monedas y tokens** del popup te permite añadir un **token ERC-20 por su contrato**: elige la red, pega la dirección del contrato, **Comprobar contrato**. QoreX lee el nombre y los decimales del token del propio contrato - y vuelve a leerlos en segundo plano al añadirlo, en lugar de fiarse del popup - y luego te los muestra con un recordatorio de que cualquiera puede crear un token con cualquier nombre. El token aparece entonces en **Enviar en redes externas**. Rechaza tokens incluidos de serie, duplicados, redes que no son EVM, direcciones incorrectas, contratos ilegibles y contratos que toman prestado el nombre de un token incluido.

## Sitios conectados {#connected-sites}

**Sitios conectados** en el popup lista todos los sitios que esta wallet ha aprobado - un sitio puede ver la dirección de esta wallet y pedirte que firmes. Toca **Revocar** para quitar uno. Las aprobaciones se guardan **por wallet**: un sitio aprobado para una wallet no puede leer la dirección de otra wallet después de que cambies.

## Ventana de acceso EVM {#evm-window}

La pantalla **Ventana de acceso EVM** del popup abre y cierra la ventana que permite a una cuenta al estilo Ethereum (coin 60) enviar en el carril EVM de QoreChain (v3.2.0 y posteriores) - la misma pantalla que en la app, con los mismos límites (hasta 17,280 bloques y 1,000 transacciones, y un tope de QOR que cuenta cada monto más su comisión máxima). Ver [Ventana de acceso EVM](/qorex/security-and-recovery#evm-window).

## Idioma {#language}

La extensión habla los mismos diez idiomas que la app móvil, el dashboard y el sitio: inglés, rumano, alemán, español, francés, italiano, turco, árabe, japonés y coreano. Por defecto sigue el idioma de tu **navegador** (recurriendo al inglés para cualquier otro) - nota que esta es una fuente distinta a la de la app móvil, que sigue el idioma del **teléfono**, así que ambas pueden mostrar idiomas diferentes si tu teléfono y tu navegador están configurados de forma distinta. Un selector en la pantalla de inicio del popup te permite anular el idioma detectado en cualquier momento; cambiar a árabe invierte el popup a derecha-a-izquierda de inmediato, no solo el texto.

## Seguridad y permisos {#security}

QoreX está construido para ser verificable, no solo confiable:

- **Bóveda** - tus claves están selladas con **AES-256-GCM**. La ruta de contraseña deriva su clave con **Argon2id** (RFC 9106, resistente a memoria: 64 MiB, t=3, p=1), de modo que un blob de bóveda copiado es lento de atacar por fuerza bruta con hardware GPU o ASIC. (Los blobs heredados con PBKDF2 se pueden seguir abriendo y se resellan a Argon2id en el siguiente desbloqueo.)
- **Desbloqueo con passkey (opcional, desde 0.1.5)** - donde tu autenticador admite la extensión **WebAuthn PRF**, QoreX puede desbloquear la bóveda a partir de la salida PRF de 32 bytes de la passkey en lugar de una contraseña escrita. Tu contraseña siempre permanece como respaldo.

  :::note Dónde aparece el desbloqueo con passkey
  QoreX detecta WebAuthn por funcionalidad y solo muestra **Activar desbloqueo con passkey** donde el navegador lo expone a las páginas de extensión - eso es **Chrome y Edge**. En **Firefox** la opción está oculta, porque Firefox no expone WebAuthn a las páginas de extensión. Esto es esperado, no un error.
  :::
- **Manifest V3 + CSP estricta** - `script-src 'self'; object-src 'self'; base-uri 'self'`. No hay **carga de código remoto** después de la instalación, ni `wasm-unsafe-eval`.
- **Sin analítica, sin informes de fallos, sin SDK de seguimiento, sin registro de usuario** - la extensión no necesita ninguna cuenta para guardar, enviar o hacer staking de QOR. Tus claves, tu frase de recuperación, la bóveda y las aprobaciones nunca salen del navegador. Sí hace solicitudes de red: a los endpoints públicos de QoreChain para saldos, historial y difusión de transacciones (estas llevan tu dirección pública `qor1…`), una consulta de precios (sin dirección), los servicios públicos de cualquier red externa que tengas o consultes (tu dirección pública en esa red) y el registro de @handle (el handle, o una dirección pública). Solo si usas el [emparejamiento con el Dashboard](#dashboard-bridge) envía una prueba firmada de que eres el titular de la dirección. Consulta [Qué envía QoreX por la red](/qorex/overview#data-and-privacy).

### Qué permisos solicita QoreX, y por qué {#permissions}

Esta sección existe porque la ficha de Firefox muestra el permiso **"Acceder a tus datos en todos los sitios web"**, lo cual puede parecer contradictorio con una wallet que declara no tener permisos de host. Aquí está la verdad exacta, sin editar, tomada del manifiesto.

El `manifest.json` de la extensión declara:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
],
"web_accessible_resources": [
  { "resources": ["dist/inpage.js"], "matches": ["<all_urls>"], "use_dynamic_url": true }
]
```

- **`permissions: ["storage"]`** - el único permiso de API. Almacena la bóveda cifrada y tus aprobaciones de conexión por origen **localmente**, en el almacenamiento de la extensión.
- **`host_permissions: []`** - QoreX no declara **ningún** permiso de host. No solicita la capacidad de hacer solicitudes de red entre orígenes a sitios arbitrarios en tu nombre.
- **`web_accessible_resources`** - permite que las páginas carguen el `inpage.js` propio de QoreX, el pequeño script que expone el proveedor. `use_dynamic_url` le da una dirección distinta por sesión para que los sitios no puedan identificar la extensión sondeando su presencia (fingerprinting).
- **`content_scripts` con matches `<all_urls>`** - esta es la razón honesta por la que Firefox dice *"Acceder a tus datos en todos los sitios web."* QoreX inyecta un pequeño script proveedor (`content.js` → `inpage.js`) en **cada página**. Un content script que se ejecuta en todos los sitios *puede* técnicamente leer la página, y los navegadores describen esa capacidad con esa frase exacta - venga de `host_permissions` o de una coincidencia de content script.

**Por qué el content script se ejecuta en todas partes.** Para que **cualquier** dApp pueda descubrir la wallet mediante EIP-6963 sin que primero le concedas acceso por sitio. Así es como funcionan MetaMask, Keplr, Phantom y cualquier otra wallet inyectada: el proveedor inyectado debe estar presente antes de que se ejecuten los scripts de la página (`document_start`), en cualquier sitio que visites.

**Qué hace ese script - y qué no hace.** Solo enlaza mensajes de la wallet (anuncia el proveedor, reenvía solicitudes de conexión/firma al service worker, devuelve el resultado). **No** lee el contenido de la página más allá de esas solicitudes de la wallet, no envía nada a un servidor, ni carga código remoto - y no puede obtener datos arbitrarios entre orígenes porque no hay permisos de host. Todo esto es verificable: la extensión está bloqueada por CSP, no incluye analítica y su manifiesto (arriba) se puede leer en el paquete instalado.

## Conectar una dApp a QoreX {#connect}

Una dApp descubre QoreX mediante **EIP-6963**. Anuncia y solicita, luego usa el proveedor EIP-1193 devuelto (que solo responde a consultas de cuenta y de red - ver la tabla anterior):

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

Para el carril **Nativo** de QoreChain, usa el proveedor en `window.qorex.native` (`enable`, `getKey`, `signAndBroadcast`, `signDirect`; lee `capabilities` para ver qué admite este build). En una aplicación web, el [wallet adapter](/developer-tools/wallet-adapter) envuelve por ti esta detección EIP-6963, y el [kit para desarrolladores de QoreX](/developer-tools/qorex-integrations) cubre la integración del lado de la aplicación. (`@qorechain/connect` está obsoleto; no inicies trabajo nuevo con él.)

Las aprobaciones son **por origen**: la primera conexión a un sitio abre un popup de aprobación que muestra el origen, aprobar revela únicamente tu dirección pública, y la aprobación de un sitio no concede nada a otro. Las aprobaciones se guardan por wallet, persisten hasta que las revoques en **Sitios conectados**, y un sitio puede tener una solicitud en espera (tres en total); cambiar de wallet o bloquear responde "no" a las solicitudes en espera. Ver [Qué muestra la ventana de aprobación](/qorex/security-and-recovery#approvals).

### Puente del Dashboard (v0.1.5, ampliado en v0.2.2) {#dashboard-bridge}

La versión 0.1.5 añade un puente limitado exclusivamente a **`dashboard.qorechain.io`**: `window.qorex.native.connectProof(sessionId)` firma la prueba de emparejamiento *Connect with QoreX* (el backend reverifica la firma), y `executeTransfer({ to, amountUqor, memo })` aprueba y transmite una transferencia de QOR propuesta por el Dashboard, devolviendo el `txHash`. Estos métodos se rechazan en cualquier otro origen.

**0.2.2** añade `native:executeRequest`, que acepta una solicitud completa propuesta por el Dashboard - incluyendo [staking](#stake-dashboard) - validada contra el mismo parser compartido que QoreX usa en todas partes: se rechaza ante un desajuste de red, un origen ajeno, una dirección que no es la tuya, un tipo de solicitud desconocido, o una solicitud de staking que lleve un `toAddress` (las solicitudes de staking no tienen uno). Los tipos de solicitud son enviar, delegar, retirar delegación, redelegar y reclamar; una solicitud de Connect te deja elegir cuál de tus cuentas vincular, y `listAccounts()` devuelve tus cuentas (solo lectura).

Dado que una dirección `qor1…` es igualmente válida en mainnet y en testnet, una solicitud propuesta por el Dashboard indica a qué red apunta, y QoreX se niega a actuar sobre ella si eso no coincide con la red a la que la extensión está conectada actualmente - nunca cambiará de red por cuenta propia a partir de una solicitud.

## Enviar una transacción de QoreChain desde una dApp: `signAndBroadcast` {#sign-and-broadcast}

Toda transacción del carril nativo de QoreChain de una cuenta con una clave ML-DSA-87 registrada necesita una firma híbrida - secp256k1 **y** ML-DSA-87 - y solo la wallet posee la clave ML-DSA, así que una página no puede construirla. Envía los mensajes; QoreX hace el resto: muestra los mensajes decodificados y la comisión, construye la transacción para la cuenta que el usuario seleccionó, añade la firma híbrida (registrando antes la clave ML-DSA-87 de la cuenta si es su primera transacción), transmite y resuelve con el resultado. Disponible desde la extensión **0.3.5** y la app **1.1.5** (todos los builds de las tiendas hoy).

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");            // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                        // must be the wallet's active network
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],  // protobuf bytes: Uint8Array, number[] or base64
  memo: "",                                          // optional, up to 256 bytes
  gasLimit: 300000,                                  // optional
});
// → { txHash, code, height? }
```

- `chainId` debe ser igual a la red activa de la wallet (`qorechain-vladi` en mainnet). Una dApp no puede cambiar la red; solo el usuario puede.
- De 1 a 32 mensajes por llamada; los bytes del mensaje se firman exactamente como se envían.
- La comisión (`gasLimit` × el precio de gas de la red) se muestra antes de la aprobación. Un rechazo lanza `QoreX: signature rejected`.
- La gestión de la clave ML-DSA-87 (registrar, migrar, rotar - también dentro de authz `MsgExec`) se rechaza: la wallet gestiona por sí misma la clave de la cuenta.

## Firma híbrida {#pqc}

Cada transferencia nativa de QOR que QoreX inicia por sí misma se firma dos veces: con una clave clásica secp256k1 y con **ML-DSA-87** (FIPS 204), usando el pipeline híbrido de `@qorechain/sdk`. **No hay opción para desactivarlo**: QoreChain lo exige y QoreX nunca envía una transferencia de QOR del carril Nativo sin ello.

- **Firma Nativa iniciada por dApp** - usa [`signAndBroadcast`](#sign-and-broadcast): QoreX decodifica cada mensaje, muestra la comisión y añade por sí misma la capa ML-DSA-87. `signDirect` firma una transacción que construyó la página; no es la ruta recomendada, porque una capa que la página adjuntó se comprueba contra la clave registrada de la cuenta antes de cualquier ventana de aprobación y una transacción solo clásica se rechaza (también se rechaza para cuentas al estilo Ethereum, que usan `signAndBroadcast`). QoreX nunca firma a ciegas: una solicitud que no puede decodificar se rechaza, y nunca firma una transacción de QoreChain solo clásica.
- **Las firmas clásicas siempre están etiquetadas** - las transferencias en redes externas (ETH, BNB, Solana, …) no pueden llevar una firma ML-DSA-87; QoreX te hace marcar una confirmación explícita y las marca como clásicas en lugar de degradar silenciosamente.

**Qué significa esto para el tamaño de la transacción.** ML-DSA-87 es una firma grande: la firma tiene **4,627 bytes** y la clave pública **2,592 bytes** (fijado por FIPS-204). Una transacción híbrida de QoreChain es, por lo tanto, varios kilobytes más grande que una puramente clásica. Si construyes y transmites transacciones tú mismo, dimensiona tus búferes y estimaciones de comisión para los bytes adicionales; la contabilidad de gas de QoreChain ya los espera. Ver [Firma post-cuántica](/developer-guide/post-quantum-signing) (la guía para desarrolladores) para las primitivas y el requisito de firma determinista.

## Dónde está publicada {#where-published}

| Tienda | Ficha | Versión actual | Enlace |
|---|---|---|---|
| Chrome Web Store | **QoreX** | 0.3.8 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Firefox Add-ons | `qorex` | 0.3.9 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Mac App Store (Safari) | **QoreX Wallet**, app 1.7.8 | extensión 0.3.8 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |

El código fuente de QoreX no es público. Las versiones son las del 27 de octubre de 2026; las fichas de las tiendas siempre muestran la versión actual.

## Límites y problemas conocidos {#limits}

- **El proveedor EVM solo responde a consultas de cuenta y de red.** Todavía no firma ni envía transacciones o mensajes EVM. Usa MetaMask u otra wallet EVM para las transacciones del carril EVM, que además necesitan una [ventana de acceso EVM](#evm-window) abierta; una transacción EVM lleva solo una firma secp256k1.
- **`window.qorex.native` es de estilo Keplr, no un reemplazo completo de Keplr.** No hay alias `window.keplr`. `signAmino` y `sendTx` no existen. `getOfflineSigner` funciona solo cuando la propia página adjunta la capa ML-DSA-87; una capa añadida por la wallet a través de `getOfflineSigner` no es compatible. `signArbitrary` (firma de mensajes) no es compatible. La ruta nativa compatible es `window.qorex.native.signAndBroadcast`.
- **Solo en la app móvil:** Portafolio, Q-Day Scanner, recuperación social, Legacy, solicitudes de pago, inicio de sesión, vinculación de dispositivos y reclamar un @handle.
- **Sin pantalla de Swap** en la extensión.
- **El desbloqueo con passkey** se ofrece solo donde el navegador expone WebAuthn a las páginas de extensión (Chrome y Edge); en Firefox está oculto.
- **Safari** abre las aprobaciones en una pestaña del navegador en lugar de un popup.
- **Las redes externas** aceptan solo firmas clásicas; QoreX te hace confirmarlo antes de cada transferencia.
- **Chrome y Safari van una versión por detrás de Firefox** en el momento de escribir esto (ver [versiones](#versions)).
- La bóveda de la extensión vive solo en este navegador. Quitar la extensión, borrar sus datos o restablecer el navegador elimina tus claves; solo tus 24 palabras anotadas las restauran.
