---
slug: /qoresign/spec/hd-derivation-draft
title: Derivarea cheilor ML-DSA-87
sidebar_label: Derivarea cheilor (draft HD)
sidebar_position: 4
---

# Derivarea cheilor ML-DSA-87

Stare: derivarea canonică este stabilă. Derivarea ierarhică este un **draft**:
implementările se pot schimba înainte de forma finală, iar cheile derivate cu ea
trebuie înregistrate pe lanț ca orice altă cheie. Sursa:
[`spec/hd-derivation-draft.md`](https://github.com/qorechain/qoresign/blob/main/spec/hd-derivation-draft.md).

## Derivarea canonică (stabilă) {#canonical-derivation}

Portofelele QoreChain și SDK-ul QoreChain derivă o cheie ML-DSA-87 per cont din
mnemonica BIP-39 și adresa contului:

```
seed = SHAKE256( UTF-8( "qorechain:pqc:v1|" + bech32_address + "|" + mnemonic ), 32 bytes )
(pk, sk) = ML-DSA-87.KeyGen_internal(seed)
```

- `bech32_address` este forma `qor1` a contului (o adresă `0x` este mai întâi
  convertită în aceiași 20 de octeți).
- `mnemonic` este fraza în formă canonică: cuvinte englezești cu litere mici,
  separate prin spații simple, fără nimic înainte sau după. Implementările
  trebuie să refuze orice altă scriere în loc să o normalizeze în tăcere,
  deoarece un șir diferit dă o cheie diferită.
- Cheia este legată de adresă: aceeași mnemonică dă o cheie diferită pentru
  fiecare cont.

Un portofel care folosește această derivare semnează cu cheia deja înregistrată
pentru conturile create de portofelele QoreChain.

## Derivarea ierarhică (draft) {#hierarchical-derivation}

Pentru portofelele care au nevoie de mai multe chei post-cuantice dintr-un
singur seed, fără a le lega de o adresă. ML-DSA nu are derivare publică de chei
copil, deci fiecare segment al căii este hardened.

Construcția este SLIP-0010, cu propriul șir de master key:

```
I  = HMAC-SHA512(key = "qorechain-mldsa87-seed", data = seed)
k  = I[0..32],  c = I[32..64]
for each index i (all >= 2^31):
    I = HMAC-SHA512(key = c, data = 0x00 || k || ser32(i))
    k = I[0..32],  c = I[32..64]
(pk, sk) = ML-DSA-87.KeyGen_internal(k)
```

- `seed` este seed-ul BIP-39 de 64 de octeți (mnemonică plus parolă opțională)
  sau orice seed de 16 până la 64 de octeți.
- Calea implicită este `m/44'/118'/{account}'/0'/0'`.
- O cale cu orice segment non-hardened este refuzată.

Puncte deschise înainte ca aceasta să devină finală: coin type-ul de folosit în
cale, interacțiunea cu rotirea cheilor pe lanț (`MsgRotatePQCKey`) și alinierea
cu alte ecosisteme care derivează chei post-cuantice dintr-un seed.

## Vectori de test {#test-vectors}

`vectors/qoresign-v1.json`, câmpurile `canonical`, `hd` și `hdRejected`. Vezi
[Vectori de test](/qoresign/vectors).
