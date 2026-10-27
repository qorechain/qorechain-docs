---
slug: /qoresign/spec/hd-derivation-draft
title: Derivazione delle chiavi ML-DSA-87
sidebar_label: Derivazione delle chiavi (bozza HD)
sidebar_position: 4
---

# Derivazione delle chiavi ML-DSA-87

Stato: la derivazione canonica è stabile. La derivazione gerarchica è una
**bozza**: le implementazioni possono cambiare prima che diventi definitiva, e le
chiavi derivate con essa devono essere registrate on-chain come qualsiasi altra
chiave. Fonte:
[`spec/hd-derivation-draft.md`](https://github.com/qorechain/qoresign/blob/main/spec/hd-derivation-draft.md).

## Derivazione canonica (stabile) {#canonical-derivation}

I wallet QoreChain e il QoreChain SDK derivano una chiave ML-DSA-87 per account
dalla mnemonica BIP-39 e dall'indirizzo dell'account:

```
seed = SHAKE256( UTF-8( "qorechain:pqc:v1|" + bech32_address + "|" + mnemonic ), 32 bytes )
(pk, sk) = ML-DSA-87.KeyGen_internal(seed)
```

- `bech32_address` è la forma `qor1` dell'account (un indirizzo `0x` viene prima
  convertito negli stessi 20 byte).
- `mnemonic` è la frase in forma canonica: parole inglesi minuscole separate da
  spazi singoli, senza nulla prima o dopo. Le implementazioni devono rifiutare
  qualsiasi altra grafia invece di normalizzarla in silenzio, perché una stringa
  diversa produce una chiave diversa.
- La chiave è legata all'indirizzo: la stessa mnemonica produce una chiave
  diversa per ogni account.

Un wallet che usa questa derivazione firma con la chiave già registrata per gli
account creati dai wallet QoreChain.

## Derivazione gerarchica (bozza) {#hierarchical-derivation}

Per i wallet che hanno bisogno di più chiavi post-quantistiche da un unico seed
senza legarle a un indirizzo. ML-DSA non ha una derivazione pubblica dei figli,
quindi ogni segmento del percorso è hardened.

La costruzione è SLIP-0010 con una propria stringa per la chiave master:

```
I  = HMAC-SHA512(key = "qorechain-mldsa87-seed", data = seed)
k  = I[0..32],  c = I[32..64]
for each index i (all >= 2^31):
    I = HMAC-SHA512(key = c, data = 0x00 || k || ser32(i))
    k = I[0..32],  c = I[32..64]
(pk, sk) = ML-DSA-87.KeyGen_internal(k)
```

- `seed` è il seed BIP-39 da 64 byte (mnemonica più passphrase facoltativa), o un
  qualsiasi seed da 16 a 64 byte.
- Il percorso predefinito è `m/44'/118'/{account}'/0'/0'`.
- Un percorso con un qualsiasi segmento non hardened viene rifiutato.

Punti aperti prima che diventi definitiva: il coin type da usare nel percorso,
l'interazione con la rotazione delle chiavi on-chain (`MsgRotatePQCKey`) e
l'allineamento con altri ecosistemi che derivano chiavi post-quantistiche da un
seed.

## Vettori di test {#test-vectors}

`vectors/qoresign-v1.json`, campi `canonical`, `hd` e `hdRejected`. Vedi
[Vettori di test](/qoresign/vectors).
