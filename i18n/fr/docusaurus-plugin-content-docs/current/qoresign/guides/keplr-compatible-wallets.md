---
slug: /qoresign/guides/keplr-compatible-wallets
title: Ajouter la signature hybride à un portefeuille compatible Keplr
sidebar_label: Portefeuilles compatibles Keplr
sidebar_position: 1
---

# Ajouter la signature hybride à un portefeuille compatible Keplr

La voie native de QoreChain refuse une transaction provenant d'un compte doté
d'une clé ML-DSA-87 enregistrée, sauf si la transaction porte aussi la signature
de cette clé. Un portefeuille compatible Keplr (Keplr, Leap, Cosmostation et
d'autres qui implémentent `signDirect`) produit la partie secp256k1 ; la partie
ML-DSA-87 doit venir de celui qui détient la clé post-quantique.

Il y a deux façons de l'ajouter.

## Option A : le portefeuille détient les deux clés (QoreSign) {#option-a}

Le portefeuille dérive la clé ML-DSA-87 à côté de la clé secp256k1 et ajoute la
couche avant de signer.

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

Règles qui protègent l'utilisateur :

- Montrez à l'utilisateur les messages et les frais issus de `bodyBytes` /
  `authInfoBytes` avant de signer, comme pour toute requête `signDirect`. La
  signature ML-DSA-87 couvre les frais.
- Lorsqu'une dApp envoie un corps qui porte déjà une couche PQC, vérifiez-la avec
  `assertPqLayerMatchesRegisteredKey` (de `@qorechain/qoresign/network`) avant
  d'ajouter votre signature classique ; une couche qui ne se vérifie pas ne
  protège rien.
- Enregistrez la clé une seule fois par compte avec
  `buildRegisterPqKeyMessage`, signé en mode `classicalOnly` (voir
  [`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
  et [Enregistrement](/qoresign/spec/hybrid-signing-v1#registration)).
- Après la diffusion, relisez la transaction validée et appelez
  `evaluateLayerState` ; `downgraded` signifie que la couche n'a pas atteint la
  chaîne.

## Option B : la dApp détient la clé post-quantique (`@qorechain/wallet-adapter`) {#option-b}

Lorsque le portefeuille ne peut pas être modifié, une dApp peut utiliser
[`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter) :
il ajoute la couche ML-DSA-87 au corps, puis demande au portefeuille inchangé une
signature `signDirect` ordinaire. La clé post-quantique reste alors chez la dApp
ou chez un signataire compagnon, pas dans le portefeuille. QoreSign et
l'adaptateur produisent les mêmes octets pour les mêmes clés.

## Enregistrement de la chaîne dans Keplr {#chain-registration}

Suggérez la chaîne avec `experimentalSuggestChain` en utilisant les descripteurs
de chaîne publiés : identifiants de chaîne `qorechain-vladi` (mainnet) et
`qorechain-diana` (testnet), préfixe bech32 `qor`, coin type `118`, denom de frais
`uqor` avec 6 décimales et un prix minimal du gas de `0.1`. Points de terminaison
publics : `https://rpc.qore.host` et `https://api.qore.host` (mainnet),
`https://rpc-testnet.qore.host` et `https://api-testnet.qore.host` (testnet).
