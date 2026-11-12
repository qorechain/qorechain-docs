---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

El Hybrid Inspector es una pequeña página web (hecha con React) que muestra cómo es una firma híbrida de QoreChain en la testnet `qorechain-diana`. Conectas la wallet QoreX, envías una transacción que QoreX firma con secp256k1 y con ML-DSA-87, y la página abre esa transacción para enseñarte sus partes: la firma clásica, la firma poscuántica y el veredicto de la propia cadena. También puedes pegar el hash de cualquier transacción de la testnet.

**Cuánto tarda:** unos 20 minutos, incluidas las instalaciones. Después, la página funciona en segundos.

## Qué demuestra {#what-it-shows}

- **Firma híbrida ML-DSA-87 + secp256k1 desde una página web.** La página entrega un mensaje codificado a QoreX con `qorexSignAndBroadcast`. QoreX firma con ambas claves y lo difunde.
- **Una transacción firmada de forma híbrida y verificada en la cadena.** La página lee el evento `pqc_hybrid_verify` de la transacción. Ese evento es la cadena diciendo que comprobó la firma poscuántica.
- **Los tamaños se ven.** La firma clásica ocupa 64 bytes. La firma ML-DSA-87 (FIPS 204) ocupa 4.627 bytes y viaja en la extensión `PQCHybridSignature` de la transacción.

## Paso a paso {#steps}

Trabajas en tu propia terminal y en tu navegador. Usa solo una cuenta de testnet desechable. Los QOR de la testnet no tienen valor. No uses aquí una wallet real ni fondos reales.

### 1. Antes de empezar: instala las herramientas {#install}

Necesitas cuatro cosas: un navegador basado en Chromium (Chrome, Edge o Brave), **Git** (descarga el código), **Node.js** (ejecuta las herramientas de la página) y **pnpm** (instala las librerías de la página). Usa Node.js 22 o superior. La página también funciona desde Node.js 20, pero 22 es la opción segura para todas las apps del taller.

**macOS**

| Herramienta | Cómo instalarla | Cómo comprobarla |
| --- | --- | --- |
| Git | `xcode-select --install` (o `brew install git`) | `git --version` |
| Node.js 22+ | Descarga el instalador LTS desde https://nodejs.org, o ejecuta `brew install node` | `node --version` (debe mostrar v22 o superior) |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Windows** (usa PowerShell)

| Herramienta | Cómo instalarla | Cómo comprobarla |
| --- | --- | --- |
| Git | Descárgalo desde https://git-scm.com/download/win | `git --version` |
| Node.js 22+ | Descarga el instalador LTS desde https://nodejs.org (o `winget install OpenJS.NodeJS.LTS`) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Linux (Debian o Ubuntu)**

| Herramienta | Cómo instalarla | Cómo comprobarla |
| --- | --- | --- |
| Git | `sudo apt update && sudo apt install -y git curl` | `git --version` |
| Node.js 22+ | Sigue https://nodejs.org/en/download (elige Linux y luego la versión LTS) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Ojo:** Node.js instalado con Homebrew no incluye pnpm. Si ves `pnpm: command not found`, ejecuta `npm install -g pnpm` y abre una terminal nueva.

**Qué deberías ver:** cada comando de comprobación imprime un número de versión. `node --version` empieza por `v22` o más.

### 2. Antes de empezar: QoreX en la testnet {#qorex}

QoreX es la wallet oficial de QoreChain. Esta página necesita la **extensión de navegador de QoreX** en el navegador donde abras la página. Instálala desde la tienda de tu navegador. Consulta [Integraciones de QoreX](/developer-tools/qorex-integrations) y el [navegador de dApps](/qorex/dapp-browser).

Usa una **cuenta nueva y desechable** creada solo para este ejercicio. QoreX muestra una frase de recuperación al crear la cuenta. Apúntala en papel, mantenla en privado y no la reutilices nunca en la mainnet.

Cambia QoreX a la testnet:

- **Extensión de navegador:** desbloquéala, toca 7 veces el número de versión de la parte inferior y elige **Switch to testnet (diana)**.
- **App QoreX:** abre Ajustes y activa **Use testnet (developers)**. (La página se ejecuta en un navegador de escritorio, así que en este tutorial usas la extensión.)

Consulta [Despliega en 5 minutos](/getting-started/deploy-in-5-minutes#step-testnet) para saber más sobre el cambio a la testnet. Copia la dirección de tu cuenta (empieza por `qor1...`).

No necesitas una cuenta de Ethereum (coin 60) para esta página, porque envía un pago nativo de QoreChain.

### 3. Consigue QOR de testnet en el faucet {#faucet}

El faucet es un sitio web que envía QOR de testnet gratis a una dirección.

1. Abre https://dashboard.qorechain.io/faucet e inicia sesión.
2. Pega tu dirección `qor1...` y haz la solicitud. El faucet paga **100 QOR cada 24 horas por cuenta**.

**Cantidades:** la unidad que lees es el **QOR**. La cadena cuenta en **uqor**, la unidad más pequeña. 1 QOR = 1.000.000 uqor. La página te pide QOR y hace la conversión por ti.

**Conviene saber:** la primera transacción de una cuenta nueva registra en la cadena su clave poscuántica ML-DSA-87. Es una tarifa única de unos 0,09 QOR. QoreX lo hace por ti en tu primer envío.

### 4. Descarga el código {#get-code}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

| Parte | Significado |
| --- | --- |
| `git clone <address>` | Descarga desde GitHub una copia completa de las apps de ejemplo en una carpeta nueva llamada `build-before-qday`. |
| `cd <folder>` | Mueve tu terminal a la carpeta del Hybrid Inspector. Todos los comandos siguientes se ejecutan desde aquí. |

**Qué deberías ver:** `Cloning into 'build-before-qday'...`. Ejecuta `ls` para comprobarlo: verás `package.json`, `src`, `index.html` y `vite.config.ts`.

### 5. Instala las librerías {#install-libs}

```sh
pnpm install
```

**Qué hace:** `pnpm` descarga las librerías que necesita la página (las que figuran en `package.json`) en una carpeta llamada `node_modules`. Se ejecuta una vez por proyecto.

| Parte | Significado |
| --- | --- |
| `pnpm` | La herramienta que instala librerías. |
| `install` | Lee `package.json` e instala todo lo que lista, en las versiones de `pnpm-lock.yaml`. |

**Cuánto tarda:** menos de un minuto.

**Qué deberías ver:** una barra de progreso y después `Done in` con un tiempo.

### 6. Comprueba que compila {#build}

```sh
pnpm build
```

**Qué hace:** ejecuta el script llamado `build` de `package.json`. Ese script es `tsc --noEmit && vite build`.

| Parte | Significado |
| --- | --- |
| `pnpm build` | Ejecuta el script `build` del proyecto. |
| `tsc --noEmit` | El verificador de TypeScript. Busca errores en el código y no escribe archivos. |
| `vite build` | Vite empaqueta la página en un pequeño sitio web dentro de la carpeta `dist`. |

**Qué deberías ver:** `transforming...`, luego líneas como `dist/index.html` y, al final, `built in` con un tiempo (muy por debajo de un segundo).

### 7. Ejecuta la página {#run}

```sh
pnpm dev
```

**Qué hace:** ejecuta el script `dev`, que arranca un pequeño servidor web en tu propio ordenador para que puedas usar la página en el navegador. Deja esta terminal abierta mientras trabajas. Pulsa Ctrl+C para detenerlo.

**Qué deberías ver:**

```text
  VITE v5.4.21  ready in 111 ms

  ➜  Local:   http://localhost:5173/
```

Abre http://localhost:5173 en el navegador donde está instalado QoreX. Si el puerto 5173 está ocupado, Vite imprime otro puerto. Usa la dirección que imprima.

Para inspeccionar una transacción directamente, añade `?tx=<HASH>` a la dirección: `http://localhost:5173?tx=<HASH>`.

**Por qué la página llama a `/lcd`:** el servicio REST público de la testnet no envía cabeceras CORS, así que una página del navegador no puede llamarlo directamente. El servidor de desarrollo reenvía cada llamada de `/lcd` a `https://api-testnet.qore.host`. La página funciona solo en la testnet y no hace falta ningún archivo `.env`.

### 8. Conecta, envía y verifica {#connect-send}

1. **Conecta.** Haz clic en **Connect QoreX**. QoreX te pide permitir la página. Aprueba. La página muestra tu dirección (`qor1...`), tu saldo de testnet y si hay una clave ML-DSA-87 registrada. Dice "not registered yet" hasta tu primer envío.
2. **Rellena el formulario de envío.**

| Campo | Significado |
| --- | --- |
| To | La dirección de destino (`qor1...`). Viene rellenada con tu propia dirección, y eso está bien. |
| Amount (QOR) | Cuánto enviar, en QOR. `1` significa 1 QOR = 1.000.000 uqor. |
| Memo | Un texto corto adjunto a la transacción y guardado en la cadena. Cualquiera puede leerlo, así que no escribas nada privado. |

3. **Envía.** Haz clic en **Sign with QoreX and send**. QoreX muestra lo que vas a firmar y pide aprobación. Aprueba. Espera al bloque (unos segundos).
4. **Inspecciona.** La página inspecciona la transacción automáticamente. También puedes pegar cualquier hash de transacción de testnet de 64 caracteres en el paso 3 de la página y hacer clic en **Inspect**.

**Qué deberías ver:** una línea `QoreX: code 0, shield ..., tx <hash>` y después la tarjeta de inspección descrita en "Qué deberías ver" más abajo. Copia el hash de la transacción.

### 9. Verifícalo de una segunda forma, sin la página {#verify-curl}

Puedes preguntarle directamente a la cadena. Solo necesitas `curl`, que incluyen macOS y la mayoría de los sistemas Linux. En PowerShell de Windows usa `curl.exe`. La herramienta `jq` es opcional y hace la respuesta más fácil de leer (`brew install jq` en macOS, `sudo apt install -y jq` en Linux, `winget install jqlang.jq` en Windows).

```sh
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| Parte | Significado |
| --- | --- |
| `curl -s <address>` | Descarga la respuesta del servicio REST de la testnet. `-s` oculta la barra de progreso. |
| `<HASH>` | El hash de tu transacción, del paso 8. |
| `\| jq '...'` | Extrae tres valores. Sin `jq`, quita esta parte y lee el texto completo. |

**Qué deberías ver:**

- `code` vale `0`: la transacción tuvo éxito.
- Una extensión `PQCHybridSignature` (tipo `/qorechain.pqc.v1.PQCHybridSignature`) con un `pqc_signature`. Su texto en base64 tiene 6.172 caracteres, es decir, 4.627 bytes de firma ML-DSA-87.
- En `tx_response.events`, un evento de tipo `pqc_hybrid_verify` con el atributo `status` igual a `verified`.

**En el explorador:** abre https://explore.qore.network, cámbialo a **Testnet** y busca el hash de tu transacción.

## Solución de problemas {#troubleshooting}

| Qué ves | Por qué | Qué hacer |
| --- | --- | --- |
| `pnpm: command not found` | pnpm no está instalado. Node.js de Homebrew no lo incluye. | Ejecuta `npm install -g pnpm` y abre una terminal nueva. |
| `node --version` muestra v18 o inferior | Node.js es demasiado antiguo. | Instala Node.js 22 o superior (paso 1). |
| La página dice `QoreX was not found in this page. Install the QoreX extension, switch it to testnet, and reload.` | Falta la extensión, está bloqueada, o el navegador no es de base Chromium. | Instala y desbloquea QoreX en Chrome, Edge o Brave. Cambia a la testnet y recarga la página. |
| El faucet dice que alcanzaste un límite de solicitudes | Una solicitud cada 24 horas por cuenta. | Espera 24 horas, o usa una segunda cuenta desechable. |
| `account has no PQC key and classical fallback is disabled` | La clave poscuántica aún no está registrada. | Envía una vez desde QoreX (registra la clave en tu primer envío, unos 0,09 QOR). Antes asegúrate de tener QOR del faucet. |
| `EVM authorisation window exhausted` | Pertenece a la app de Hardhat, no a esta página. | En esa app, abre una ventana nueva con `pnpm window open`. |
| `HHE10402` tras abrir la ventana | Pertenece a la app de Hardhat. La ventana necesita unos segundos. | Vuelve a ejecutar el despliegue. |
| Error de CORS en la consola del navegador | La página llamó al servicio REST directamente. | Usa el proxy `/lcd` del servidor de desarrollo (`pnpm dev`) y abre la página en `http://localhost:5173`. No abras `dist/index.html` como archivo. |
| `Enter an amount in QOR, for example 1.` | La cantidad está vacía, es cero o no es un número. | Escribe un número como `1`. |
| `A transaction hash is 64 hex characters.` | El hash pegado es incorrecto o está cortado. | Pega los 64 caracteres completos. |
| `Transaction not found on qorechain-diana` | El hash es de otra red, o el bloque aún no es final. | Espera 10 segundos e inténtalo de nuevo. Comprueba que QoreX está en la testnet. |
| El puerto 5173 ya está en uso | Otro programa lo usa. | Vite elige el siguiente puerto y lo imprime. Abre esa dirección. |

## El código {#code}

Conectar y enviar:

```ts
import { getQorexNative, qorexSignAndBroadcast } from "@qorechain/qorex-types";

const native = getQorexNative();
await native.enable("qorechain-diana");
const key = await native.getKey("qorechain-diana");      // key.bech32Address

const r = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes(from, to, uqor) }],
  memo,
});                                                       // r.txHash, r.code, r.shield
```

Leer la prueba desde la cadena:

```ts
const res = await fetch(`/lcd/cosmos/tx/v1beta1/txs/${hash}`).then((r) => r.json());
const tx = res.tx;
const ext = [...(tx.body.extension_options ?? []), ...(tx.body.non_critical_extension_options ?? [])];
const hyb = ext.find((x) => String(x["@type"]).includes("PQCHybridSignature"));
const verify = (res.tx_response.events ?? []).filter((e) => e.type === "pqc_hybrid_verify");
// classical signature: atob(tx.signatures[0]).length  -> 64
// ML-DSA-87 signature: atob(hyb.pqc_signature).length -> 4627
```

`msgSendBytes` es un pequeño codificador protobuf de `src/App.tsx` para el mensaje `MsgSend` del módulo bank, porque QoreX recibe el mensaje ya codificado. La página marca una transacción como verificada de forma híbrida cuando su código es 0, un evento `pqc_hybrid_verify` tiene el estado `verified` y la firma poscuántica ocupa 4.627 bytes.

## Qué deberías ver {#result}

- La cabecera muestra `qorechain-diana (testnet)` y una altura de bloque que no deja de subir.
- Tras conectar: tu dirección, tu saldo y el estado de la clave.
- Tras enviar: el hash de la transacción y el código de resultado, y luego la tarjeta de inspección con el memo, el tipo de mensaje, la firma clásica de 64 bytes, la firma ML-DSA-87 de 4.627 bytes con sus primeros bytes en hexadecimal, el nombre del algoritmo `ML-DSA-87 (FIPS 204)` y el veredicto `pqc_hybrid_verify`.
- En el explorador: abre https://explore.qore.network, cámbialo a **Testnet** y busca el hash de tu transacción.

## Paquetes usados {#packages}

| Paquete | Versión | Para qué se usa |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0 (fijada) | `getQorexNative`, `qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | Figura como dependencia; la página en sí usa llamadas REST sencillas |
| `react`, `react-dom` | ^18.3.1 | Interfaz |
| `@vitejs/plugin-react` | ^4.3.0 | Plugin de React para Vite |
| `vite` | ^5.4.0 | Servidor de desarrollo y compilación |
| `typescript` | ^5.6.3 | Comprobación de tipos |

## Código fuente {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
