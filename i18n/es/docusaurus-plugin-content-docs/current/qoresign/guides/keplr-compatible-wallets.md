---
slug: /qoresign/guides/keplr-compatible-wallets
title: Añadir firma híbrida a una cartera compatible con Keplr
sidebar_label: Carteras compatibles con Keplr
sidebar_position: 1
---

# Añadir firma híbrida a una cartera compatible con Keplr

El carril nativo de QoreChain rechaza la transacción de una cuenta con una clave
ML-DSA-87 registrada si la transacción no lleva también la firma de esa clave.
Una cartera compatible con Keplr (Keplr, Leap, Cosmostation y otras que
implementan `signDirect`) produce la parte secp256k1; la parte ML-DSA-87 tiene
que venir de quien posea la clave post-cuántica.

Hay dos formas de añadirla.

## Opción A: la cartera tiene ambas claves (QoreSign) {#option-a}

La cartera deriva la clave ML-DSA-87 junto a la clave secp256k1 y añade la capa
antes de firmar.

```ts
import { deriveCanonicalPqKey, signPqLayer } from "@qorechain/qoresign";

// at account creation or import, from the same mnemonic and address
const pqKey = deriveCanonicalPqKey({ mnemonic, address });

// inside signDirect(signerAddress, signDoc):
const { bodyBytes } = signPqLayer({
  chainId: signDoc.chainId,
  bodyBytes: signDoc.bodyBytes,
  authInfoBytes: signDoc.authInfoBytes,
  pqKey,
});
const finalDoc = { ...signDoc, bodyBytes }; // sign this with the secp256k1 key, as for any Cosmos SDK chain
```

Reglas que mantienen seguro al usuario:

- Muestra al usuario los mensajes y la comisión de `bodyBytes` / `authInfoBytes`
  antes de firmar, igual que en cualquier solicitud `signDirect`. La firma
  ML-DSA-87 cubre la comisión.
- Cuando una dApp envíe un cuerpo que ya lleve una capa PQC, compruébalo con
  `assertPqLayerMatchesRegisteredKey` (de `@qorechain/qoresign/network`) antes
  de añadir tu firma clásica; una capa que no se verifica no protege nada.
- Registra la clave una sola vez por cuenta con `buildRegisterPqKeyMessage`,
  firmado en modo `classicalOnly` (consulta
  [`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
  y [Registro](/qoresign/spec/hybrid-signing-v1#registration)).
- Tras la difusión, lee la transacción confirmada y llama a
  `evaluateLayerState`; `downgraded` significa que la capa no llegó a la cadena.

## Opción B: la dApp tiene la clave post-cuántica (`@qorechain/wallet-adapter`) {#option-b}

Cuando no se puede cambiar la cartera, una dApp puede usar
[`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter):
añade la capa ML-DSA-87 al cuerpo y luego pide a la cartera sin modificar una
firma `signDirect` ordinaria. La clave post-cuántica queda entonces en la dApp o
en un firmante complementario, no en la cartera. QoreSign y el adaptador
producen los mismos bytes para las mismas claves.

## Registro de la cadena en Keplr {#chain-registration}

Sugiere la cadena con `experimentalSuggestChain` usando los descriptores de
cadena publicados: chain ids `qorechain-vladi` (mainnet) y `qorechain-diana`
(testnet), prefijo bech32 `qor`, coin type `118`, denominación de comisión
`uqor` con 6 decimales y un precio mínimo de gas de `0.1`. Endpoints públicos:
`https://rpc.qore.host` y `https://api.qore.host` (mainnet),
`https://rpc-testnet.qore.host` y `https://api-testnet.qore.host` (testnet).
