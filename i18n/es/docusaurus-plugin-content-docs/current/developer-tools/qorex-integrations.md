---
slug: /developer-tools/qorex-integrations
title: Integraciones de QoreX
sidebar_label: Integraciones de QoreX
sidebar_position: 22
---

# Integraciones de QoreX (`@qorechain/qorex-*`)

Las integraciones de QoreX son seis pequeños paquetes de npm para desarrolladores de dApps que quieren que la [wallet QoreX](/qorex/overview) funcione en un front end EVM, Cosmos o Solana, y para los equipos que prueban esos front ends. Tres son conectores de wallet para bibliotecas populares (RainbowKit, Interchain Kit, cosmos-kit), uno contiene los tipos compartidos y los ayudantes de detección, y dos son herramientas de pruebas (una wallet simulada y fixtures de Playwright). Los seis están en la versión **0.1.0**, publicados el 27 de octubre de 2026, con licencia Apache-2.0.

Lo que no hacen: no custodian claves y no convierten a QoreX en algo más de lo que es hoy. Lea [Límites y problemas conocidos](#limits) antes de construir sobre ellos: las versiones de QoreX en las tiendas que están activas hoy admiten solo una parte de aquello a lo que pueden conectarse estos paquetes, y los límites se indican allí.

## Innovaciones {#innovations}

* **Un descubrimiento que no puede elegir la wallet equivocada.** QoreX se anuncia mediante EIP-6963 con el nombre de DNS inverso `network.qore.qorex` y nunca escribe `window.ethereum`. `@qorechain/qorex-types` selecciona el proveedor únicamente por ese nombre, y la wallet de RainbowKit fija el conector al proveedor anunciado y nunca recurre a `window.ethereum`.
* **La wallet construye la firma híbrida; la página nunca tiene la clave poscuántica.** La vía nativa de QoreChain necesita una firma secp256k1 más una firma ML-DSA-87 (FIPS 204). En el proveedor nativo (`window.qorex.native`), la llamada `signAndBroadcast` entrega los mensajes a QoreX, que construye la transacción, la firma con ambas claves y la difunde. El resultado es `txHash`, `code`, `height` y `shield`, donde `shield` es `shielded` una vez que la transacción confirmada lleva la capa híbrida.
* **Comprobaciones de capacidades en lugar de comprobaciones de versión.** Los paquetes leen la lista `capabilities` de la wallet (`hasCapability`), de modo que una función como `signAndBroadcast` se detecta, no se adivina a partir de un número de versión.
* **Los rechazos son explícitos, con códigos estables.** La firma Amino se rechaza por diseño, porque Amino JSON no puede llevar la firma híbrida; los conectores lanzan `QorexIntegrationError` con códigos como `QOREX_AMINO_REFUSED`, `QOREX_USE_SIGN_AND_BROADCAST` y `QOREX_NOT_SUPPORTED_YET`, y `isQorexIntegrationError(err, code)` los comprueba.
* **Un doble de pruebas que firma de verdad.** `@qorechain/qorex-wallet-mock` inyecta los mismos objetos que inyecta QoreX (`window.qorex = { evm, native, svm }`), registra una wallet de Solana y firma con los algoritmos reales (ML-DSA-87 híbrido mediante QoreSign en la vía nativa, secp256k1 en EVM, ed25519 en Solana) a partir de la mnemónica pública de prueba en la testnet por defecto. Se anuncia como `network.qore.qorex.mock`, de modo que el código que selecciona QoreX de forma estricta no puede confundirlo con la wallet.
* **Dos perfiles de comportamiento.** El perfil `current` del mock se comporta como el QoreX que está activo hoy; `planned` añade lo que el equipo de QoreX ha anunciado, para que pueda construir por adelantado sin que el mock afirme algo que la wallet aún no hace.
* **Fixtures de Playwright al estilo de Synpress v4** (`qorexMockFixtures`) inyectan el mock antes de la navegación, de modo que una prueba de extremo a extremo no necesita ninguna extensión de navegador.
* **Cuentas gobernadas por la wallet sin eventos.** Como QoreX todavía no emite `accountsChanged` ni `chainChanged`, la wallet de RainbowKit tiene un `pollAccountsOnFocus` opcional que vuelve a leer `eth_accounts` y `eth_chainId` cuando la página recupera el foco.

## Para qué se usa {#use-cases}

1. **Una dApp con wagmi y RainbowKit añade QoreX.** Añada `qorexWallet` a la lista de wallets de RainbowKit y `QOREX_CHAINS` a la configuración de wagmi. Los usuarios con QoreX se conectan y la dApp lee su dirección `0x` y el chain id (9801 o 9800). Los usuarios sin QoreX ven los enlaces de las tiendas.
2. **Una dApp de Cosmos con Interchain Kit o cosmos-kit añade QoreX.** Añada la wallet QoreX a `ChainProvider` y envíe las transacciones de QoreChain con `qorexSignAndBroadcast`: QoreX construye la transacción, añade la firma híbrida y la difunde, porque una página no puede tener la clave ML-DSA-87.
3. **Una dApp que ya admite Keplr.** `window.qorex.native` sigue el patrón de Keplr (`enable`, `getKey`, `signDirect`), así que la integración son unas pocas líneas. La guía del repositorio enumera todas las diferencias.
4. **Pruebas en CI de flujos de wallet sin extensión.** Un equipo de QA ejecuta Playwright con `qorexMockFixtures({ profile: "current" })`, pulsa Connect y comprueba que la página muestra `qorex.addresses.evm`. `qorex.rejectNext()` prueba la vía de rechazo.
5. **Construir por adelantado las nuevas funciones de QoreX.** Ejecute la misma batería con `profile: "planned"` para ejercitar las funciones anunciadas (firma EVM, eventos de cambio de cuenta, `signDirect` que añade la capa híbrida) antes de que QoreX las publique.
6. **Probar difusiones reales en la testnet.** Con una mnemónica de testnet propia y con fondos, un equipo deja que el mock haga `signAndBroadcast` de una transacción con firma híbrida a `qorechain-diana` y comprueba el resultado en la página.
7. **Detección de funciones en lugar de comprobaciones de versión.** Una dApp muestra un botón Send en QoreChain cuando `hasCapability(native, "signAndBroadcast")` es verdadero, de modo que las nuevas versiones de QoreX activan funciones sin cambios en la dApp.

## Cómo funciona {#how-it-works}

* **Vía EVM.** QoreX nunca escribe `window.ethereum`. Anuncia un proveedor EIP-1193 mediante EIP-6963 con el nombre de DNS inverso `network.qore.qorex`; `qorexWallet()` y `discoverQorexEip1193()` seleccionan exactamente ese proveedor. El mismo objeto está también en `window.qorex.evm`.
* **Vía nativa.** `window.qorex.native` es un proveedor con el patrón de Keplr (no es un alias de `window.keplr`). QoreChain exige una firma híbrida secp256k1 más ML-DSA-87 en las transacciones de la vía nativa y solo la wallet tiene la clave ML-DSA-87, así que la dApp envía los mensajes a `signAndBroadcast`. QoreX los muestra, fija la comisión, firma con ambas claves, difunde e informa de `shield`.
* **Solana.** QoreX registra una wallet de Solana Wallet Standard en `solana:mainnet` (la propia Solana). La vía SVM de QoreChain no está abierta a transacciones y no tiene un chain id de Wallet Standard.
* **Capacidades, no versiones.** Los kits leen `window.qorex.native.capabilities` mediante `hasCapability`. Una versión de QoreX puede declarar `listAccounts`, `connectProofPicksAccount`, `executeRequest` y `signAndBroadcast`.
* **Amino se rechaza por diseño**, porque Amino JSON no puede llevar la firma híbrida ML-DSA-87. Los kits atienden toda solicitud de firmante con un firmante directo.
* **`signDirect` y la capa poscuántica, con precisión.** Hoy el `signDirect` de QoreX firma el SignDoc tal como está con la clave secp256k1. En QoreChain el cuerpo ya debe contener una capa híbrida ML-DSA-87 válida para la clave registrada del firmante, algo que una página no puede producir. Por eso, en `qorechain-vladi` y `qorechain-diana`, el `signDirect` del firmante offline de los kits lanza `QOREX_USE_SIGN_AND_BROADCAST` antes de llegar a QoreX; `getAccounts` funciona en todas las cadenas. En otros chain ids los kits reenvían `signDirect` a QoreX, que hoy atiende solo los dos chain ids de QoreChain. Se prevé que una versión futura de QoreX añada la capa por sí misma en `signDirect` y declare la capacidad `signDirectAddsPqcLayer`; ninguna versión actual la declara. Los kits ya la comprueban, y cuando se declara, el firmante offline reenvía los SignDocs de QoreChain a QoreX. Entonces QoreX puede volver a estimar el gas y subir el límite de gas y la comisión, así que difunda siempre el documento `signed` que vuelve.
* **Estados de `shield`** devueltos por `signAndBroadcast`: `shielded` (la transacción confirmada lleva la capa híbrida), `pending` (difusión hecha, comprobación sin completar), `downgraded` (confirmada sin la capa; trátelo como una alerta) y `classical` (una vía donde la capa no se aplica).
* **El mock** construye sus cuentas a partir de una mnemónica BIP-39 (por defecto: la frase de prueba pública) como lo hace QoreX: `m/44'/118'/0'/0/i` con la clave ML-DSA-87 canónica de esa dirección `qor1`, `m/44'/60'/0'/0/i` para EVM y `m/44'/501'/i'/0'` para Solana. Su `signAndBroadcast` lee de REST la clave ML-DSA-87 de la cuenta, la registra una sola vez con `MsgRegisterPQCKeyV2` si falta, firma de forma híbrida con [QoreSign](/qoresign/overview), difunde (reintentando una vez con la otra versión de sign-bytes si la red lo pide), espera la inclusión y devuelve `{ txHash, code, height, shield }`.

### Lo que QoreX admite hoy {#qorex-today}

| Superficie | Hoy | Previsto por el equipo de QoreX |
|---|---|---|
| EVM (EIP-1193 mediante EIP-6963, `network.qore.qorex`) | conexión (`eth_requestAccounts`), `eth_accounts`, `eth_chainId`, `wallet_switchEthereumChain` a la red ya seleccionada en QoreX | eventos `accountsChanged` y `chainChanged`, códigos de error EIP-1193 4200 y 4902 en cada rechazo, `personal_sign`, `eth_signTypedData_v4`, `eth_sendTransaction`, `wallet_addEthereumChain` |
| Vía nativa de QoreChain (`window.qorex.native`) | `enable`, `getKey`, `signAndBroadcast`, `listAccounts`, `experimentalSuggestChain` (ids de QoreChain), `signDirect` (el SignDoc ya debe llevar la capa híbrida) | `signDirect` que añade por sí mismo la capa ML-DSA-87, firma de mensajes (ADR-36 más ML-DSA-87) |
| Solana (Wallet Standard, `solana:mainnet`) | connect, `signMessage`, `signTransaction` | `solana:signIn` |

En el lado EVM, firmar y enviar fallan actualmente con "QoreX: EVM method ... not yet supported". Para transacciones en QoreChain use la vía nativa. En la vía EVM de QoreChain una transacción se acepta cuando el remitente tiene una clave ML-DSA-87 registrada y una ventana de autorización EVM abierta desde la vía nativa. El usuario cambia la red dentro de QoreX; la dApp no puede cambiarla.

## Cómo usarlo {#how-to-use}

Los bloques de código de abajo son los quickstarts del hub de desarrolladores. Cada uno se comprobó con `tsc` y se ejecutó el 27 de octubre de 2026 tras instalar desde el registro público de npm (Node 26; jsdom 30 y `react-dom/client` para el código de navegador; Playwright 1.64 con Chromium para el fixture) y pasó. Ninguno envía una transacción ni necesita una clave con fondos. Con cada uno se indica el resultado observado. El comportamiento del lado de la wallet (un QoreX real en un navegador real) no se probó para esta página.

### `@qorechain/qorex-types`: detectar QoreX {#types}

```bash
npm install @qorechain/qorex-types
```

```ts
import { discoverQorexEip1193, getQorexNative, hasCapability } from "@qorechain/qorex-types";

// EVM: EIP-6963 discovery by rdns "network.qore.qorex" (QoreX never writes window.ethereum).
const evm = await discoverQorexEip1193({ timeoutMs: 500 });
console.log(evm ? "QoreX EVM provider found" : "QoreX EVM provider not announced");

// QoreChain native lane: window.qorex.native.
const native = getQorexNative();
if (native && hasCapability(native, "signAndBroadcast")) {
  const key = await native.getKey("qorechain-diana");
  console.log("native account:", key.bech32Address);
}
```

Observado bajo el mock: `QoreX EVM provider not announced`, y después `native account: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`. La primera línea es la esperada bajo el mock, véase [la salvedad de EIP-6963](#limits). El paquete no tiene dependencias en tiempo de ejecución y también exporta el icono de QoreX como data URI desde `@qorechain/qorex-types/icon`. Otras exportaciones: tipos de proveedor, `isQorexInstalled`, `qorexSignAndBroadcast` y ayudantes para clasificar los rechazos del EVM de QoreX.

### `@qorechain/qorex-rainbowkit`: QoreX en RainbowKit y wagmi {#rainbowkit}

```bash
npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

```ts
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { QOREX_CHAINS, qorechain, qorechainTestnet, qorexWallet } from "@qorechain/qorex-rainbowkit";

const connectors = connectorsForWallets(
  [{ groupName: "Recommended", wallets: [qorexWallet, metaMaskWallet] }],
  { appName: "My dApp", projectId: "<walletconnect project id>" },
);

export const config = createConfig({
  chains: QOREX_CHAINS, // QoreChain mainnet (9801) and testnet (9800)
  connectors,
  transports: { [qorechain.id]: http(), [qorechainTestnet.id]: http() },
});
console.log(config.chains.map((c) => `${c.id} ${c.name}`), connectors.length, "connectors");
```

Observado: `[ '9801 QoreChain', '9800 QoreChain Testnet' ] 2 connectors`. `QOREX_CHAINS` contiene las definiciones de cadena de viem para la vía EVM (RPC `https://evm.qore.host` y `https://evm-testnet.qore.host`, moneda nativa QOR con 18 decimales, explorador `https://explore.qore.network`). El `projectId` es un id de proyecto de WalletConnect que usted mismo crea con WalletConnect. Dependencias peer: `viem` ^2, `wagmi` ^2.9, `@rainbow-me/rainbowkit` ^2.2.11. Para recoger los cambios de cuenta y de red hechos en la wallet, use `wallets: [() => qorexWallet({ pollAccountsOnFocus: true })]`.

### `@qorechain/qorex-interchain-kit`: dApps de Cosmos (recomendado para trabajo nuevo) {#interchain-kit}

```bash
npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react
```

```tsx
import type { ComponentProps, ReactNode } from "react";
import { ChainProvider } from "@interchain-kit/react";
import { qorexWallet } from "@qorechain/qorex-interchain-kit";

type Props = Pick<ComponentProps<typeof ChainProvider>, "chains" | "assetLists"> & { children: ReactNode };

// chains / assetLists: your chain-registry entries, including QoreChain.
export function Providers({ chains, assetLists, children }: Props) {
  return (
    <ChainProvider chains={chains} assetLists={assetLists} wallets={[qorexWallet]}>
      {children}
    </ChainProvider>
  );
}
```

Observado: el componente se montó en jsdom con la entrada del chain-registry de la testnet de QoreChain (`@interchain-kit/react` 0.11.1). Dependencia peer: `@interchain-kit/core` ^0.11. Envíe una transacción de QoreChain con `qorexSignAndBroadcast`:

```ts
import { qorexSignAndBroadcast } from "@qorechain/qorex-interchain-kit";

const { txHash, code, height, shield } = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],
  memo: "",
});
```

La llamada acepta de 1 a 32 mensajes y un memo de hasta 256 bytes, y QoreX pide al usuario que la apruebe. El fragmento procede del README del paquete y no se ejecutó para esta página.

### `@qorechain/qorex-cosmos-kit`: dApps de Cosmos con cosmos-kit {#cosmos-kit}

```bash
npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react
```

```tsx
import type { ComponentProps, ReactNode } from "react";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as qorexWallets } from "@qorechain/qorex-cosmos-kit";

type Props = Pick<ComponentProps<typeof ChainProvider>, "chains" | "assetLists"> & { children: ReactNode };

// chains / assetLists: your chain-registry entries, including QoreChain.
export function Providers({ chains, assetLists, children }: Props) {
  return (
    <ChainProvider chains={chains} assetLists={assetLists} wallets={[...qorexWallets]} throwErrors={false}>
      {children}
    </ChainProvider>
  );
}
```

Observado: montado en jsdom con la entrada de la testnet de QoreChain (`@cosmos-kit/react` 2.24.1). **`throwErrors={false}` es necesario para que el código pase la comprobación de tipos:** `@cosmos-kit/react` 2.24 tipa `throwErrors` como una propiedad obligatoria, y el ejemplo del README del paquete la omite. Dependencia peer: `@cosmos-kit/core` ^2.18.1. El README del paquete recomienda Interchain Kit para dApps nuevas. También exporta `qorexSignAndBroadcast`.

### `@qorechain/qorex-wallet-mock`: doble de pruebas de QoreX {#wallet-mock}

```bash
npm install -D @qorechain/qorex-wallet-mock
```

```ts
import { createQorexMock } from "@qorechain/qorex-wallet-mock";

// jsdom / Vitest: install a QoreX test double into window (public test phrase, testnet only).
const mock = createQorexMock({ profile: "current" });
mock.install(window);

const [account] = (await window.qorex!.evm.request({ method: "eth_requestAccounts" })) as string[];
const chainId = await window.qorex!.evm.request({ method: "eth_chainId" });
console.log(account, chainId, mock.addresses());
```

Observado: `0x9858EfFD232B4033E47d90003D41EC34EcaEda94 0x2648 { native: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h, evm: 0x9858..., svm: HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk }`. Las cuentas se derivan como las deriva QoreX (`m/44'/118'/0'/0/i` con la clave ML-DSA-87 canónica de esa dirección `qor1`, `m/44'/60'/0'/0/i` para EVM, `m/44'/501'/i'/0'` para Solana). Las opciones incluyen `profile`, `mnemonic`, `accountIndex`, `chainId` (por defecto `qorechain-diana`), `autoApprove` y `allowMainnet`; la página también recibe `window.__qorexMock` con `approveNext()`, `rejectNext()`, `requests` y `switchAccount(i)`. En Playwright, inyecte `mock.initScript()` con `page.addInitScript` (Node 20.16 o posterior).

### `@qorechain/qorex-synpress`: fixtures de Playwright {#synpress}

```bash
npm install -D @qorechain/qorex-synpress @playwright/test
```

```ts
import { qorexMockFixtures } from "@qorechain/qorex-synpress";

// A Playwright test with the QoreX mock injected before navigation (no Synpress needed).
const test = qorexMockFixtures({ profile: "current" });
const { expect } = test;

test("connects", async ({ page, qorex }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connect" }).click();
  await expect(page.getByTestId("account")).toHaveText(qorex.addresses.evm);
});
```

Observado: `1 passed`, contra una página local cuyo botón Connect llama a `eth_requestAccounts` (Playwright 1.64, Chromium). Para combinar los fixtures con Synpress, instale `@synthetixio/synpress@4.1.2` y envuélvalos en `testWithSynpress`. El fixture `qorex` expone `addresses`, `approveNext()`, `rejectNext()`, `requests()`, `switchAccount(i)` y `disconnect()`. Dependencia peer: `@playwright/test` 1.48 o posterior. El estado vive en la página, así que cada navegación empieza con un mock nuevo.

### Enviar una transacción en QoreChain {#send-transaction}

La misma llamada existe en `@qorechain/qorex-interchain-kit`, `@qorechain/qorex-cosmos-kit` y `@qorechain/qorex-types`:

```ts
import { qorexSignAndBroadcast } from "@qorechain/qorex-interchain-kit";

const { txHash, code, height, shield } = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: MsgSend.encode(msg).finish() }],
  memo: "",
  gasLimit: 200000,
});
```

* `value` es el mensaje codificado en protobuf: un `Uint8Array`, un `number[]` o base64.
* De 1 a 32 mensajes; un memo de hasta 256 bytes; `gasLimit` se limita a entre 100,000 y 5,000,000 (400,000 si se omite). QoreX fija la comisión y la muestra antes de firmar.
* `chainId` debe coincidir con la red seleccionada en QoreX.
* Los mensajes que gestionan la clave ML-DSA-87 de la cuenta son del lado de la wallet y se rechazan, también dentro de `MsgExec`. Los tipos de mensaje que QoreX no puede mostrar se rechazan.
* Sin un kit, llame a `window.qorex.native.signAndBroadcast(request)` tras comprobar `hasCapability(native, "signAndBroadcast")`. `getKey` devuelve `pubKey` y `address` como `number[]`; conviértalos con `Uint8Array.from(key.pubKey)` (los kits lo hacen por usted).

### El mock en Playwright sin los fixtures {#mock-playwright}

```ts
import { createQorexMock } from "@qorechain/qorex-wallet-mock";

const mock = createQorexMock({ profile: "current" });
await page.addInitScript({ content: mock.initScript() });
await page.goto("http://localhost:5173");
await page.evaluate(() => window.__qorexMock!.rejectNext());
```

## API principal {#main-api}

| Paquete | Nombre | Qué hace |
|---|---|---|
| types | `discoverQorexEip1193({ timeoutMs })`, `findQorexEip1193()` | descubrimiento asíncrono EIP-6963 del proveedor EVM de QoreX, y una sonda síncrona del mismo |
| types | `getQorexNative()`, `isQorexInstalled()`, `hasCapability(native, capability)` | leer `window.qorex.native`, comprobar que QoreX está presente, probar una capacidad |
| types | `qorexSignAndBroadcast(request, { native? })` | entrega mensajes a QoreX; lanza `QOREX_NOT_INSTALLED` sin QoreX y `QOREX_NOT_SUPPORTED_YET` en un QoreX anterior a esta función |
| types | `QorexIntegrationError`, `isQorexIntegrationError(err, code)` | errores de estos paquetes, con códigos estables |
| types | `isQorexUnsupportedMethodError`, `isQorexUnrecognizedChainError`, `QOREX_EVM_ERROR_CODES` | clasifican los rechazos del EVM de QoreX: comprueban `code` (4200, 4902) y recurren después al texto del mensaje de hoy |
| types | `QorexEip1193Provider`, `QorexNativeProvider`, `QorexSolanaStandardWallet`, `QorexSvmProvider`; `@qorechain/qorex-types/icon` | tipos de lo que inyecta QoreX; el icono de QoreX como data URI |
| rainbowkit | `qorexWallet(options?)`, `createQorexConnector`, `getQorexEip1193Provider` | la wallet de RainbowKit (opción `pollAccountsOnFocus`), el conector de wagmi y el proveedor que usa |
| rainbowkit | `qorechain`, `qorechainTestnet`, `QOREX_CHAINS` | cadenas de viem 9801 y 9800 |
| interchain-kit | `qorexWallet`, `createQorexWallet()`, `QorexCosmosWallet` | wallet de Interchain Kit |
| cosmos-kit | `wallets`, `qorexExtension`, `QorexExtensionWallet`, `QorexClient` | wallet de cosmos-kit |
| ambos kits | `qorexSignAndBroadcast`, `QOREX_CAPABILITY_SIGN_DIRECT_ADDS_PQC_LAYER`, constantes de chain id, ayudantes de errores | reexportados desde `qorex-types` |
| wallet-mock | `createQorexMock(options)` | devuelve `{ install(window), initScript(), addresses(), ... }` |
| wallet-mock | `window.__qorexMock` | `approveNext()`, `rejectNext()`, `pendingApprovals`, `requests`, `clearRequests()`, `switchAccount(i)`, `switchNetwork(chainId)`, `disconnect()`, `addresses()` |
| wallet-mock | `PUBLIC_TEST_MNEMONIC` | la frase de prueba pública BIP-39 (nunca la financie) |
| synpress | `qorexMockFixtures(options)` | un `test` de Playwright con un fixture `qorex` automático |
| synpress | `qorex.addresses`, `approveNext()`, `rejectNext()`, `waitForApproval()`, `pendingApprovals()`, `requests()`, `clearRequests()`, `switchAccount(i)`, `switchNetwork(chainId)`, `disconnect()`, `mock` | los controles del fixture |
| synpress | `qorexExtensionFixtures({ extensionPath })` | interfaz prevista para la extensión real; hoy lanza `QorexExtensionModeUnavailableError` |

Con Synpress v4, combine los fixtures como `testWithSynpress(qorexMockFixtures({ profile: "planned" }))`. Con `autoApprove: false`, llame a `await qorex.waitForApproval()` para inspeccionar el estado pendiente y después a `qorex.approveNext()`. Ejecute la batería en ambos perfiles para cubrir el QoreX de hoy y la próxima versión.

### Comportamiento del firmante de los kits {#kit-signer}

| Llamada | Interchain Kit | cosmos-kit |
|---|---|---|
| `connect` o `enable`, `getAccount`, `getKey` | `enable` y `getKey` de QoreX, con los bytes convertidos a `Uint8Array` | igual |
| `getOfflineSigner(chainId)` | firmante directo para cualquier preferencia | firmante directo para cualquier preferencia, incluido el `"amino"` por defecto de cosmos-kit |
| `signDirect` del firmante en QoreChain | lanza `QOREX_USE_SIGN_AND_BROADCAST` (hasta que QoreX declare `signDirectAddsPqcLayer`) | igual |
| `signDirect` del firmante en otro chain id | se reenvía al `signDirect` de QoreX | igual |
| `signAmino`, `getOfflineSignerAmino` | lanza `QOREX_AMINO_REFUSED` | igual |
| `signArbitrary` (ADR-36) | lanza `QOREX_NOT_SUPPORTED_YET` (también `verifyArbitrary`) | lanza `QOREX_NOT_SUPPORTED_YET` |
| `sendTx` | lanza `QOREX_NOT_SUPPORTED_YET`; difunda a través de su endpoint RPC | no se proporciona |

### Opciones del wallet mock {#mock-options}

| Opción | Por defecto | Significado |
|---|---|---|
| `profile` | `"current"` | `"current"` es el QoreX de hoy; `"planned"` añade las funciones anunciadas |
| `mnemonic` | la frase de prueba pública BIP-39 | use la suya para todo lo que financie |
| `accountIndex` | `0` | el mismo índice en todas las vías |
| `chainId` | `"qorechain-diana"` | la red seleccionada en el mock |
| `rest` | `https://api-testnet.qore.host` | endpoint REST para `signAndBroadcast` y las consultas de claves |
| `evmRpc` | `https://evm-testnet.qore.host` | lo usa `eth_sendTransaction` (perfil planned) |
| `allowMainnet` | `false` | sin ella, se rechaza firmar para `qorechain-vladi` |
| `autoApprove` | `true` | cuando es `false`, las aprobaciones esperan a `approveNext()` o `rejectNext()` |
| `inclusionTimeoutMs`, `pollIntervalMs` | `30000`, `1500` | cómo espera `signAndBroadcast` la inclusión |

### Códigos de error {#error-codes}

De estos paquetes (`QorexIntegrationError.code`): `QOREX_NOT_INSTALLED`, `QOREX_USE_SIGN_AND_BROADCAST`, `QOREX_AMINO_REFUSED` y `QOREX_NOT_SUPPORTED_YET`; de `qorex-synpress`: `QOREX_EXTENSION_MODE_UNAVAILABLE`. Los errores propios de QoreX son objetos `Error` simples cuyo mensaje empieza por `QoreX`, por ejemplo `QoreX: connection rejected`, `QoreX: signature rejected`, `QoreX: wallet is locked` y `QoreX: unsupported chain <id>`. Hoy una cadena desconocida (4902) es el único caso que lleva un código numérico, y un rechazo del usuario no tiene el código EIP-1193 4001, así que compare el mensaje. Los mensajes que empiezan por `QoreX (mock):` vienen del mock, nunca de QoreX.

## Cómo acceder {#how-to-access}

* **Una wallet QoreX para uso real.** Los conectores hablan con la extensión de navegador o la app de QoreX que el usuario tenga instalada; consulte la página [Extensión de navegador de QoreX](/qorex/browser-extension) para las instalaciones y las versiones de las tiendas. Los paquetes de pruebas no necesitan ninguna wallet.
* **Redes.** Mainnet `qorechain-vladi` (chain id EVM 9801) y testnet `qorechain-diana` (chain id EVM 9800). QoreX atiende solo estos dos chain ids de QoreChain y rechaza los demás con "QoreX: unsupported chain". El mock usa por defecto la testnet y se niega a firmar para la mainnet a menos que pase `allowMainnet: true`.
* **Claves y fondos.** Los paquetes no custodian ninguna clave. El mock usa la frase de prueba pública BIP-39 (`abandon` repetida 11 veces, y luego `about`), que deriva `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`; nunca la financie. Para una prueba que difunda transacciones, dé al mock su propia mnemónica de testnet.
* **Otras cuentas.** RainbowKit con WalletConnect necesita un id de proyecto de WalletConnect, que se obtiene en WalletConnect.
* **Requisitos previos.** Node.js (el script de un solo archivo del mock necesita 20.16 o posterior), una app de React para los tres conectores y los paquetes peer indicados en cada quickstart. Los usuarios de TypeScript obtienen los tipos de `@qorechain/qorex-types`.
* **Costos.** Los paquetes son gratuitos. Una transacción enviada a través de QoreX paga la comisión habitual (mínimo 0.1 uqor por gas; QoreX fija el precio de sus propias transacciones en 0.15 uqor por gas).

### Redes {#networks}

| | Mainnet | Testnet |
|---|---|---|
| Chain id nativo | `qorechain-vladi` | `qorechain-diana` |
| Chain id EVM | 9801 (`0x2649`) | 9800 (`0x2648`) |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| JSON-RPC EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Explorador | `https://explore.qore.network` | igual, con la testnet seleccionada |

Prefijo bech32 `qor` (validadores `qorvaloper`), coin type 118, denominación `uqor` con 6 decimales en la vía nativa y QOR con 18 decimales en EVM. Los usuarios necesitan la extensión de QoreX (0.3.x) para uso real; las pruebas solo necesitan el mock. Para difusiones reales desde el mock, la cuenta necesita QOR de testnet del [Faucet](/dashboard/faucet) (requiere iniciar sesión); use su propia mnemónica, nunca la frase de prueba pública.

## Notas de seguridad {#security}

* La dApp nunca tiene la clave ML-DSA-87: QoreX firma las transacciones de QoreChain dentro de la wallet mediante `signAndBroadcast`.
* QoreX rechaza las solicitudes de la página de mensajes que gestionan la clave ML-DSA-87 de la cuenta.
* `qorexWallet()` nunca recurre a `window.ethereum`, así que otra wallet inyectada no se confunde con QoreX. El mock usa un nombre de DNS inverso distinto para que un doble de pruebas nunca se confunda con la wallet.
* Los métodos `connectProof`, `executeTransfer` y `executeRequest` existen para el dashboard de QoreChain y se rechazan en cualquier otro origen.
* Vigile el resultado `shield`. `downgraded` significa que la transacción se confirmó sin la capa híbrida; trátelo como una alerta.
* La mnemónica por defecto del mock es pública y el mock rechaza firmar para la mainnet a menos que se pase `allowMainnet: true`. Nunca financie la frase de prueba pública; use una mnemónica de testnet aparte para las pruebas en vivo.
* Comunique las vulnerabilidades de forma privada a security@qore.network.

## Dónde se publica {#where-published}

| Registro | Paquete | Versión | Enlace |
| --- | --- | --- | --- |
| npm | `@qorechain/qorex-types` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-types |
| npm | `@qorechain/qorex-rainbowkit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| npm | `@qorechain/qorex-interchain-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-interchain-kit |
| npm | `@qorechain/qorex-cosmos-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit |
| npm | `@qorechain/qorex-wallet-mock` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-wallet-mock |
| npm | `@qorechain/qorex-synpress` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-synpress |

Código fuente: https://github.com/qorechain/qorex-integrations (público, versión `v0.1.0` publicada el 27 de octubre de 2026, carpetas bajo `packages/`). También contiene guías (añadir QoreX junto a MetaMask, Keplr o Phantom; pruebas de extremo a extremo; errores y chain ids), una dApp de demostración que ejercita todas las superficies de QoreX en la testnet, ejemplos (`examples/wagmi-rainbowkit`, `examples/playwright-e2e`) y archivos de entradas del chain-registry. Licencia Apache-2.0; mantenedor QoreChain Association. Versiones leídas del registro de npm el 27 de octubre de 2026. Sustituyen a `@qorechain/connect`, que está obsoleto en npm: use `qorex-types` para detectar QoreX, `qorex-rainbowkit` para dApps EVM, `qorex-interchain-kit` (o `qorex-cosmos-kit`) para dApps de Cosmos, y [QoreSign](/qoresign/overview) para la firma híbrida en su propia wallet o backend.

## Límites y problemas conocidos {#limits}

**Lo que admiten hoy las versiones de QoreX.** Las versiones de las tiendas que están activas (la app móvil de QoreX 1.1.8; la extensión de navegador 0.3.8, y 0.3.9 en Firefox) todavía no admiten `getOfflineSigner` con una capa ML-DSA añadida por la wallet, y no admiten `signArbitrary`. A través de cosmos-kit e Interchain Kit, firmar con `getOfflineSigner` solo funciona si la propia página adjunta la capa poscuántica, algo que una página normalmente no puede hacer porque no tiene la clave. La forma admitida de enviar hoy una transacción de la vía nativa es `window.qorex.native.signAndBroadcast`, que envuelve `qorexSignAndBroadcast`. No interprete los conectores como una wallet completa de cosmos-kit o Interchain Kit con las versiones actuales de las tiendas, más allá de lo que indica el README de cada paquete. Los conectores están escritos de modo que una versión posterior de QoreX pueda añadir la capa en `signDirect` (declarada mediante una capacidad `signDirectAddsPqcLayer`) sin ningún cambio en su código.

**Lo que QoreX responde hoy** (según los README de los paquetes):

* **EVM:** `eth_chainId`, `eth_accounts`, `eth_requestAccounts` y `wallet_switchEthereumChain` para la red seleccionada en QoreX (una cadena desconocida se rechaza con el código 4902). Los métodos de firma (`personal_sign`, `eth_signTypedData_v4`, `eth_sendTransaction`) y `wallet_addEthereumChain` todavía no están admitidos y se rechazan con "QoreX: EVM method ... not yet supported". Todavía no hay eventos `accountsChanged` ni `chainChanged`. El equipo de QoreX los indica como previstos, no activos: eventos, códigos de error en cada rechazo, y después los métodos de firma y de transacción.
* **Transacciones EVM en general.** En QoreChain una transacción EVM solo se acepta de una cuenta con una clave ML-DSA-87 registrada y una ventana de autorización EVM abierta, ambas configuradas desde la vía nativa (véase [Desarrollo EVM](/developer-guide/evm-development#evm-window)). El `eth_sendTransaction` previsto del mock no abre esa ventana.
* **Nativa:** `enable`, `getKey`, `signDirect`, `signAndBroadcast`, `listAccounts` y `experimentalSuggestChain`, solo para `qorechain-vladi` y `qorechain-diana`. En QoreChain `signDirect` necesita que la capa híbrida ya esté presente, algo que una página no puede construir, así que use `signAndBroadcast`. `signArbitrary`, la firma Amino y `sendTx` no están disponibles; en los conectores `signArbitrary` lanza `QOREX_NOT_SUPPORTED_YET` y Amino lanza `QOREX_AMINO_REFUSED`.
* **Solana:** Wallet Standard en `solana:mainnet` con connect, disconnect, eventos, `signAndSendTransaction`, `signTransaction` y `signMessage`; sin `solana:signIn`. La vía SVM de la cadena todavía no acepta transacciones, así que el soporte de Solana aquí es solo del lado de la wallet.

**Salvedades encontradas al probar los quickstarts:**

* **cosmos-kit necesita `throwErrors`.** El ejemplo del README omite `throwErrors`, que `@cosmos-kit/react` 2.24 exige en sus tipos, por lo que tal como está escrito no pasa la comprobación de tipos. Pase `throwErrors={false}` (o su propio valor).
* **TypeScript estricto y el mock.** `window.qorex.evm.request(...)` devuelve `unknown`, así que la línea del README que desestructura su resultado falla bajo TypeScript estricto. Convierta el resultado con un cast, por ejemplo `as string[]` para `eth_requestAccounts`.
* **El mock tiene su propio id de EIP-6963.** Anuncia `network.qore.qorex.mock`, no `network.qore.qorex`. Por tanto, el código de descubrimiento que selecciona QoreX estrictamente por `network.qore.qorex` (incluido `discoverQorexEip1193` en `qorex-types`) no encuentra ningún proveedor EVM bajo el mock, por diseño, mientras que `window.qorex.evm` y el proveedor nativo sí están presentes. Si su código selecciona el proveedor mediante descubrimiento, haga que acepte el rdns del mock (exportado como `QOREX_MOCK_RDNS`) en las pruebas.
* **RainbowKit mantiene vivo Node.** En Node, construir la configuración de RainbowKit inicia temporizadores de WalletConnect, y el proceso no termina por sí solo después. Eso es lo esperado en una página. En un script o una prueba, salga explícitamente (por ejemplo `process.exit(0)`) una vez que haya leído lo que necesita.
* **El modo de extensión de Synpress todavía no funciona.** `qorexExtensionFixtures` es la vía prevista para manejar la extensión real y hoy lanza `QorexExtensionModeUnavailableError`, porque necesita selectores de prueba estables en las ventanas de aprobación de QoreX que todavía no se han publicado. Use el modo mock.

**Diferencias entre el mock y la wallet:** sin pantalla de bloqueo ni ventana de aprobación (las aprobaciones son `approveNext`, `rejectNext` o `autoApprove`); `signDirect` informa de un tipo de clave secp256k1 simple; `signAndSendTransaction` de Solana se rechaza; los mensajes que empiezan con "QoreX (mock):" son propios del mock. Los resultados de las pruebas con el mock muestran cómo se comporta su página frente a la interfaz descrita, no que una versión real de QoreX se comporte igual.

**Otros:** los seis paquetes son una versión inicial (0.1.0), así que espere que sus interfaces crezcan a medida que crezca QoreX. Ningún quickstart probado cubre `qorexSignAndBroadcast` contra una red en vivo o una wallet real.

## Páginas relacionadas {#related}

* [Wallet QoreX](/qorex/overview) y la [Extensión de navegador de QoreX](/qorex/browser-extension): la wallet con la que hablan estos paquetes.
* [QoreSign](/qoresign/overview): el firmante híbrido que usa el mock.
* [SDK de QoreChain](/sdk/overview): codificar mensajes como `MsgSend` para `signAndBroadcast`.
* [Desarrollo EVM](/developer-guide/evm-development#evm-window): registro de la clave ML-DSA-87 y ventanas de autorización EVM.
* [Faucet](/dashboard/faucet): QOR de testnet.
* [Servidor MCP de QoreChain](/developer-tools/mcp): lea el resultado de una difusión con `get_pq_status`.
* [Resumen de los paquetes para desarrolladores](/developer-tools/overview).
