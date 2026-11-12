---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

El Hybrid Inspector es una pequeña página en React que muestra qué aspecto tiene una firma híbrida de QoreChain en la testnet `qorechain-diana`. Conectas la wallet QoreX, envías una transacción que QoreX firma con secp256k1 y ML-DSA-87, y la página la abre por dentro: la firma clásica, la firma poscuántica y el veredicto de la propia cadena. También puedes pegar el hash de cualquier transacción de la testnet.

## Qué demuestra {#what-it-shows}

- **Firma híbrida ML-DSA-87 + secp256k1 desde una página web.** La página entrega un mensaje codificado a QoreX con `qorexSignAndBroadcast`. QoreX firma con ambas claves y difunde.
- **Una transacción con firma híbrida, verificada en la cadena.** La página lee el evento `pqc_hybrid_verify` de la cadena para la transacción. Ese evento es la cadena diciendo que comprobó la firma poscuántica.
- **Los tamaños son visibles.** La firma clásica ocupa 64 bytes. La firma ML-DSA-87 (FIPS 204) ocupa 4.627 bytes y viaja en la extensión `PQCHybridSignature` de la transacción.

## Paso a paso {#steps}

### 1. Instala las herramientas

Necesitas un navegador basado en Chromium (Chrome, Edge, Brave), Git, Node.js 20 o posterior y pnpm.

- Git: https://git-scm.com/downloads
- Node.js 20+: https://nodejs.org (la versión LTS sirve)
- pnpm: `npm install -g pnpm`

Comprueba las versiones:

```sh
git --version
node --version     # v20.0.0 or higher
pnpm --version     # 9 or higher
```

### 2. Instala la extensión de navegador QoreX

Instala QoreX desde la tienda de tu navegador. Consulta [Integraciones de QoreX](/developer-tools/qorex-integrations) y el [navegador de dApps](/qorex/dapp-browser) para más detalles.

### 3. Crea una cuenta de testnet desechable en QoreX

Este taller nunca necesita tu wallet real. En QoreX, crea una cuenta **nueva** (un perfil nuevo o una wallet nueva) que uses solo para este ejercicio, y cámbiala a la testnet `qorechain-diana`. Consulta [Despliega en 5 minutos](/getting-started/deploy-in-5-minutes#step-testnet) para ver cómo se cambia a la testnet. QoreX muestra una frase de recuperación al crear la cuenta: anótala en papel, mantenla en privado y nunca la reutilices en la mainnet. La cuenta no tiene más valor que este ejercicio.

Copia la dirección de la cuenta (empieza por `qor1...`).

### 4. Consigue QOR de testnet en el faucet

1. Abre https://dashboard.qorechain.io/faucet e inicia sesión.
2. Pega tu dirección `qor1...` y reclama. Cada reclamo paga 100 QOR, una vez cada 24 horas por cuenta.

### 5. Obtén el código

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

### 6. Instala las dependencias

```sh
pnpm install
```

### 7. Comprueba que compila

```sh
pnpm build
```

El comando comprueba los tipos del proyecto y lo compila. Termina con `built in` y un tiempo.

### 8. Ejecuta la página

```sh
pnpm dev
```

Abre http://localhost:5173 en el navegador donde tengas instalado QoreX. Añade `?tx=<HASH>` a la dirección (`http://localhost:5173?tx=<HASH>`) para inspeccionar una transacción directamente. Si el puerto 5173 está ocupado, Vite imprime el puerto que usa en su lugar.

Las llamadas REST pasan por el proxy `/lcd` de Vite hacia `https://api-testnet.qore.host`, porque el endpoint REST público no envía cabeceras CORS. La página funciona solo en la testnet y no hace falta ningún archivo `.env`.

### 9. Conecta, envía y verifica

1. Haz clic en **Connect QoreX**. La página muestra tu dirección (`qor1...`), tu saldo de testnet y si hay una clave ML-DSA-87 registrada. QoreX registra la clave en tu primer envío.
2. **Envía** una pequeña cantidad de QOR con un memo. QoreX muestra lo que firmas y pide aprobación.
3. La página inspecciona la transacción automáticamente. También puedes pegar el hash de cualquier transacción de la testnet, de 64 caracteres.

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

`msgSendBytes` es un pequeño codificador protobuf en `src/App.tsx` para el mensaje `MsgSend` del módulo bank, porque QoreX recibe el mensaje ya codificado. La página marca una transacción como verificada de forma híbrida cuando su código es 0, un evento `pqc_hybrid_verify` tiene el estado `verified` y la firma poscuántica ocupa 4.627 bytes.

## Qué deberías ver {#result}

- La cabecera muestra `qorechain-diana (testnet)` y una altura de bloque que no deja de subir.
- Tras conectar: tu dirección, tu saldo y el estado de la clave.
- Tras enviar: el hash de la transacción y el código de resultado, y después la tarjeta de inspección con el memo, el tipo de mensaje, la firma clásica de 64 bytes, la firma ML-DSA-87 de 4.627 bytes con sus primeros bytes en hexadecimal, el nombre del algoritmo `ML-DSA-87 (FIPS 204)` y el veredicto `pqc_hybrid_verify`.
- En el explorador: abre https://explore.qore.network, cámbialo a **Testnet** y busca el hash de tu transacción.

## Paquetes usados {#packages}

| Paquete | Versión | Para qué se usa |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0 (fijada) | `getQorexNative`, `qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | Figura como dependencia; la propia página usa llamadas REST sencillas |
| `react`, `react-dom` | ^18.3.1 | Interfaz |
| `@vitejs/plugin-react` | ^4.3.0 | Plugin de React para Vite |
| `vite` | ^5.4.0 | Servidor de desarrollo y compilación |
| `typescript` | ^5.6.3 | Comprobación de tipos |

## Código fuente {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
