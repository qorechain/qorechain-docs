---
slug: /sdk/faq
title: Preguntas frecuentes y resolución de problemas
sidebar_label: Preguntas frecuentes
sidebar_position: 8
---

# Preguntas frecuentes y resolución de problemas

## ¿Está la mainnet en funcionamiento?

Sí. La mainnet está **en funcionamiento** (id de cadena `qorechain-vladi`). El
preajuste de testnet (`qorechain-diana`) también sigue disponible. Ambos
preajustes incluyen endpoints predeterminados de localhost; selecciona la red con
`createClient({ network: "mainnet" })` y sobrescribe `endpoints` con las URL de
tus nodos. Consulta [Red y endpoints](/sdk/reference/network).

## ¿Por qué mis llamadas van a localhost?

`createClient()` usa de forma predeterminada endpoints de **localhost**. Para
comunicarte con un nodo real, pasa un objeto `endpoints`:

```ts
const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",
    rpc: "https://rpc-testnet.qore.host",
    evmRpc: "https://evm-testnet.qore.host",
  },
});
```

La ruta de firma (`connectTx`) necesita el endpoint de consenso **`rpc`**; las
lecturas de CosmWasm también lo usan. Las lecturas REST usan `rest`; las llamadas
EVM y `qor_` usan `evmRpc`.

## "Cannot find module 'viem'" / "'@solana/web3.js'"

Estas son **dependencias de pares** de `@qorechain/evm` y `@qorechain/svm`
respectivamente. Instálalas en tu proyecto:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Una llamada a un precompilado lanza "feature not present"

Los precompilados EVM existen solo en nodos que ejecutan el QoreChain EVM Engine.
En un nodo EVM normal esas llamadas fallan. Si apuntas a nodos heterogéneos,
envuelve cada llamada a un precompilado y maneja el error por llamada.

## Mis cantidades están desfasadas por un factor de un millón

QOR tiene **10^6** unidades base `uqor`. Usa `toBase` / `fromBase` y haz todas las
operaciones matemáticas en unidades base:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

Ten en cuenta que el runtime EVM representa QOR con **18** decimales (convención
de EVM), lo cual es distinto de la base `uqor` Native de 10^6.

## ¿Qué paquetes están publicados y dónde?

Todos. El núcleo de TypeScript (`@qorechain/sdk`), los adaptadores EVM/SVM
(`@qorechain/evm`, `@qorechain/svm`), el kit de React (`@qorechain/react`) y el
generador de proyectos `create-qorechain-dapp` están en npm en `0.7.0`; el
cliente de Python está en PyPI (`pip install qorechain-sdk` en `0.7.0`, importa
`qorsdk`); el cliente de Go está en el proxy de módulos
(`go get github.com/qorechain/qorechain-sdk/packages/go/...`, tag
`packages/go/v0.7.0`); y el cliente de Java está en Maven Central
(`io.github.qorechain:qorechain-sdk:0.7.0`). El cliente de Rust está en crates.io
(`cargo add qorechain-sdk`) en la **última versión publicada del crate**, que
actualmente va por detrás de 0.7.0 — instálalo desde crates.io o desde el repo.
Consulta [Instalación](/sdk/install) para ver los comandos completos por
lenguaje.

## Mi frase mnemotécnica es rechazada

El SDK valida tanto la lista de palabras BIP-39 **como** la suma de comprobación
antes de derivar cualquier clave, de modo que una frase con una errata genera un
error en lugar de producir silenciosamente la cuenta equivocada. Vuelve a revisar
las palabras; usa `validateMnemonic` para probar una frase.

## Transacciones híbridas (PQC)

El envío híbrido (clásico + ML-DSA-87) está **en funcionamiento y es
obligatorio** en la ruta Native: las transacciones Native solo clásicas son
rechazadas en la cadena (chain v3.1.95). Antes de que una transacción híbrida se
verifique con PQC, la clave pública PQC del firmante debe estar registrada
(`MsgRegisterPQCKeyV2`), o puedes establecer `includePqcPublicKey: true` para
incrustarla y permitir el registro automático en el primer uso. La cadena acepta
**solo** firmas ML-DSA-87 deterministas (el SDK firma de forma determinista de
manera predeterminada desde 0.5.1); las firmas «hedged» fallan con el código 21
de `pqc` (`hybrid_verify_failed`). Consulta
[Cuentas y firma PQC](/sdk/concepts/accounts-pqc).

## Mis transacciones híbridas fallan en CheckTx con un error de análisis de la transacción

Actualiza el SDK. Las versiones **0.6.0 y anteriores** serializaban en JSON la
extensión del cuerpo de la transacción `/qorechain.pqc.v1.PQCHybridSignature`,
que el decodificador de transacciones de la cadena rechaza en CheckTx. Desde
**0.6.1** la extensión se codifica en protobuf (el valor comienza con `0x08`) en
los cinco lenguajes: las transacciones híbridas construidas con versiones
anteriores son rechazadas en la cadena, en todos los carriles (incluido
eth-native).

## Mi gasto mediante authenticator es rechazado con `authenticator_replay`

El nonce es incorrecto. `MsgExecuteEVM.nonce` debe ser el nonce EVM **actual** de
la cuenta (el relayer es una cuenta distinta, así que **no** sumes 1);
`MsgExecuteCosmos.nonce` es la **secuencia por authenticator** para
`(account, pubkey)`, un contador de almacenamiento separado. Vuelve a obtener el
valor y firma de nuevo. Otros fallos de authenticator se decodifican mediante
`decodeTxError`: códigos de `abstractaccount` 5 (`spending_limit_exceeded`),
6 (`session_key_expired`) y 10 (`permission_denied`). Consulta
[Authenticators y gasto delegado](/sdk/guides/authenticators).
