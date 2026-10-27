---
slug: /qoresign/guides/keplr-compatible-wallets
title: Adăugați semnarea hibridă într-un portofel compatibil Keplr
sidebar_label: Portofele compatibile Keplr
sidebar_position: 1
---

# Adăugați semnarea hibridă într-un portofel compatibil Keplr

Lane-ul nativ al QoreChain refuză o tranzacție de la un cont cu o cheie ML-DSA-87
înregistrată, cu excepția cazului în care tranzacția poartă și semnătura acelei
chei. Un portofel compatibil Keplr (Keplr, Leap, Cosmostation și altele care
implementează `signDirect`) produce partea secp256k1; partea ML-DSA-87 trebuie
să vină de la cel care deține cheia post-cuantică.

Există două moduri de a o adăuga.

## Varianta A: portofelul deține ambele chei (QoreSign) {#option-a}

Portofelul derivă cheia ML-DSA-87 alături de cheia secp256k1 și adaugă stratul
înainte de a semna.

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

Reguli care protejează utilizatorul:

- Arătați utilizatorului mesajele și taxa din `bodyBytes` / `authInfoBytes`
  înainte de semnare, la fel ca pentru orice cerere `signDirect`. Semnătura
  ML-DSA-87 acoperă taxa.
- Când un dApp trimite un corp care poartă deja un strat PQC, verificați-l cu
  `assertPqLayerMatchesRegisteredKey` (din `@qorechain/qoresign/network`)
  înainte de a adăuga semnătura clasică; un strat care nu se verifică nu
  protejează nimic.
- Înregistrați cheia o singură dată per cont cu `buildRegisterPqKeyMessage`,
  semnat în modul `classicalOnly` (vezi
  [`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
  și [Înregistrare](/qoresign/spec/hybrid-signing-v1#registration)).
- După difuzare, citiți tranzacția comisă și apelați `evaluateLayerState`;
  `downgraded` înseamnă că stratul nu a ajuns pe lanț.

## Varianta B: dApp-ul deține cheia post-cuantică (`@qorechain/wallet-adapter`) {#option-b}

Când portofelul nu poate fi schimbat, un dApp poate folosi
[`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter):
adaugă stratul ML-DSA-87 la corp și apoi cere portofelului neschimbat o
semnătură `signDirect` obișnuită. Cheia post-cuantică rămâne astfel la dApp sau
la un semnatar însoțitor, nu în portofel. QoreSign și adaptorul produc aceiași
octeți pentru aceleași chei.

## Înregistrarea lanțului pentru Keplr {#chain-registration}

Sugerați lanțul cu `experimentalSuggestChain`, folosind descriptorii de lanț
publicați: id-urile de lanț `qorechain-vladi` (mainnet) și `qorechain-diana`
(testnet), prefixul bech32 `qor`, coin type `118`, denominația taxei `uqor` cu 6
zecimale și un preț minim al gazului de `0.1`. Endpointuri publice:
`https://rpc.qore.host` și `https://api.qore.host` (mainnet),
`https://rpc-testnet.qore.host` și `https://api-testnet.qore.host` (testnet).
