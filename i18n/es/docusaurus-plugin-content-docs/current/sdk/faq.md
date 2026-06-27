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
`createClient({ network: "mainnet" })` y sobrescribe `endpoints` con las URL de tu
nodo. Consulta [Red y endpoints](/sdk/reference/network).

## ¿Por qué mis llamadas van a localhost?

`createClient()` usa de forma predeterminada endpoints de **localhost**. Para
comunicarte con un nodo real, pasa un objeto `endpoints`:

```ts
const client = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    rpc: "https://rpc.testnet.example",
    evmRpc: "https://evm.testnet.example",
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
de EVM), lo cual es distinto de la base `uqor` de Cosmos de 10^6.

## ¿Qué paquetes están publicados y dónde?

Todos. El núcleo de TypeScript (`@qorechain/sdk`) y los adaptadores EVM/SVM
(`@qorechain/evm`, `@qorechain/svm`) están en npm en `0.3.0`; el cliente de Python
está en PyPI (`pip install qorechain-sdk` en `0.3.1`, importa `qorsdk`); el cliente
de Rust está en crates.io (`cargo add qorechain-sdk` en `0.3.0`); y el cliente de
Go está en el proxy de módulos (`go get github.com/qorechain/qorechain-sdk/packages/go/...`).
Consulta [Instalación](/sdk/install) para ver los comandos completos por lenguaje.

## Mi frase mnemotécnica es rechazada

El SDK valida tanto la lista de palabras BIP-39 **como** la suma de comprobación
antes de derivar cualquier clave, de modo que una frase con una errata genera un
error en lugar de producir silenciosamente la cuenta equivocada. Vuelve a revisar
las palabras; usa `validateMnemonic` para probar una frase.

## Transacciones híbridas (PQC)

La firma/verificación local con ML-DSA-87 y los ayudantes para construir
transacciones híbridas están disponibles hoy. Antes de que una transacción híbrida
se verifique con PQC en la cadena, la clave pública PQC del firmante debe estar
registrada (`MsgRegisterPQCKey`), o debes establecer `includePqcPublicKey: true`
para incrustarla y permitir el registro automático. El envío híbrido completo se
está finalizando para la red en funcionamiento. Consulta
[Cuentas y firma PQC](/sdk/concepts/accounts-pqc).
