---
slug: /qoresign/spec/hd-derivation-draft
title: Dérivation de clés ML-DSA-87
sidebar_label: Dérivation de clés (brouillon HD)
sidebar_position: 4
---

# Dérivation de clés ML-DSA-87

Statut : la dérivation canonique est stable. La dérivation hiérarchique est un
**brouillon** : les implémentations peuvent changer avant qu'elle ne soit
définitive, et les clés dérivées avec elle doivent être enregistrées sur la chaîne
comme n'importe quelle autre clé. Source :
[`spec/hd-derivation-draft.md`](https://github.com/qorechain/qoresign/blob/main/spec/hd-derivation-draft.md).

## Dérivation canonique (stable) {#canonical-derivation}

Les portefeuilles QoreChain et le SDK QoreChain dérivent une clé ML-DSA-87 par
compte à partir du mnémonique BIP-39 et de l'adresse du compte :

```
seed = SHAKE256( UTF-8( "qorechain:pqc:v1|" + bech32_address + "|" + mnemonic ), 32 bytes )
(pk, sk) = ML-DSA-87.KeyGen_internal(seed)
```

- `bech32_address` est la forme `qor1` du compte (une adresse `0x` est d'abord
  convertie vers les mêmes 20 octets).
- `mnemonic` est la phrase sous forme canonique : mots anglais en minuscules,
  séparés par une seule espace, sans rien avant ni après. Les implémentations
  doivent refuser toute autre graphie plutôt que de la normaliser en silence, car
  une chaîne différente donne une clé différente.
- La clé est liée à l'adresse : le même mnémonique donne une clé différente pour
  chaque compte.

Un portefeuille qui utilise cette dérivation signe avec la clé déjà enregistrée
pour les comptes créés par les portefeuilles QoreChain.

## Dérivation hiérarchique (brouillon) {#hierarchical-derivation}

Pour les portefeuilles qui ont besoin de plusieurs clés post-quantiques à partir
d'une seule seed, sans les lier à une adresse. ML-DSA n'a pas de dérivation
d'enfant publique ; chaque segment du chemin est donc durci.

La construction est SLIP-0010 avec sa propre chaîne de clé maître :

```
I  = HMAC-SHA512(key = "qorechain-mldsa87-seed", data = seed)
k  = I[0..32],  c = I[32..64]
for each index i (all >= 2^31):
    I = HMAC-SHA512(key = c, data = 0x00 || k || ser32(i))
    k = I[0..32],  c = I[32..64]
(pk, sk) = ML-DSA-87.KeyGen_internal(k)
```

- `seed` est la seed BIP-39 de 64 octets (mnémonique plus phrase secrète
  facultative), ou toute seed de 16 à 64 octets.
- Le chemin par défaut est `m/44'/118'/{account}'/0'/0'`.
- Un chemin comportant un segment non durci est refusé.

Points ouverts avant que ceci ne devienne définitif : le coin type à utiliser dans
le chemin, l'interaction avec la rotation de clé sur la chaîne
(`MsgRotatePQCKey`), et l'alignement avec d'autres écosystèmes qui dérivent des
clés post-quantiques à partir d'une seed.

## Vecteurs de test {#test-vectors}

`vectors/qoresign-v1.json`, champs `canonical`, `hd` et `hdRejected`. Voir
[Vecteurs de test](/qoresign/vectors).
