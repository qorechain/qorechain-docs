---
slug: /qoresign/guides/keplr-compatible-wallets
title: Aggiungere la firma ibrida a un wallet compatibile con Keplr
sidebar_label: Wallet compatibili con Keplr
sidebar_position: 1
---

# Aggiungere la firma ibrida a un wallet compatibile con Keplr

La corsia Native di QoreChain rifiuta una transazione proveniente da un account
con una chiave ML-DSA-87 registrata se la transazione non porta anche la firma di
quella chiave. Un wallet compatibile con Keplr (Keplr, Leap, Cosmostation e altri
che implementano `signDirect`) produce la parte secp256k1; la parte ML-DSA-87
deve arrivare da chi detiene la chiave post-quantistica.

Ci sono due modi per aggiungerla.

## Opzione A: il wallet detiene entrambe le chiavi (QoreSign) {#option-a}

Il wallet deriva la chiave ML-DSA-87 accanto alla chiave secp256k1 e aggiunge lo
strato prima di firmare.

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

Regole che tengono al sicuro l'utente:

- Mostra all'utente i messaggi e la commissione presenti in `bodyBytes` /
  `authInfoBytes` prima di firmare, come per qualsiasi richiesta `signDirect`. La
  firma ML-DSA-87 copre la commissione.
- Quando una dApp invia un body che porta già uno strato PQC, controllalo con
  `assertPqLayerMatchesRegisteredKey` (da `@qorechain/qoresign/network`) prima di
  aggiungere la tua firma classica; uno strato che non si verifica non protegge
  nulla.
- Registra la chiave una sola volta per account con
  `buildRegisterPqKeyMessage`, firmato in modalità `classicalOnly` (vedi
  [`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
  e [Registrazione](/qoresign/spec/hybrid-signing-v1#registration)).
- Dopo il broadcast, rileggi la transazione registrata e chiama
  `evaluateLayerState`; `downgraded` significa che lo strato non è arrivato sulla
  chain.

## Opzione B: la dApp detiene la chiave post-quantistica (`@qorechain/wallet-adapter`) {#option-b}

Quando il wallet non può essere modificato, una dApp può usare
[`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter):
aggiunge lo strato ML-DSA-87 al body e poi chiede al wallet invariato una normale
firma `signDirect`. In questo caso la chiave post-quantistica risiede presso la
dApp o un firmatario complementare, non nel wallet. QoreSign e l'adapter
producono gli stessi byte a parità di chiavi.

## Registrazione della chain per Keplr {#chain-registration}

Suggerisci la chain con `experimentalSuggestChain` usando i descrittori di chain
pubblicati: chain id `qorechain-vladi` (mainnet) e `qorechain-diana` (testnet),
prefisso bech32 `qor`, coin type `118`, denom della commissione `uqor` con 6
decimali e prezzo minimo del gas pari a `0.1`. Endpoint pubblici:
`https://rpc.qore.host` e `https://api.qore.host` (mainnet),
`https://rpc-testnet.qore.host` e `https://api-testnet.qore.host` (testnet).
