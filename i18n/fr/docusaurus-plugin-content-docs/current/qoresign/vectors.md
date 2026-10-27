---
slug: /qoresign/vectors
title: Vecteurs de test QoreSign
sidebar_label: Vecteurs de test
sidebar_position: 5
---

# Vecteurs de test

[`qoresign-v1.json`](https://github.com/qorechain/qoresign/blob/main/vectors/qoresign-v1.json)
est généré à partir de l'implémentation TypeScript (`pnpm build && pnpm vectors`)
et vérifié par les suites de tests TypeScript, Rust, Go, Swift et Kotlin. Toute
modification du fichier est une modification du format de transmission : ajoutez
plutôt un nouveau fichier avec une nouvelle version au lieu de modifier celui-ci.

Chaque clé est dérivée de la phrase mnémonique de test BIP-39 publique
(`abandon ... about`). N'envoyez jamais de fonds vers ces comptes.

## Champs {#fields}

| Champ | Contenu |
|---|---|
| `accounts` | clés classiques et adresses pour les comptes `secp256k1` (`m/44'/118'/0'/0/0`) et `eth_secp256k1` (`m/44'/60'/0'/0/0`) |
| `canonical` | clés publiques ML-DSA-87 canoniques par adresse ([dérivation de clés](/qoresign/spec/hd-derivation-draft#canonical-derivation)) |
| `hd`, `hdRejected` | brouillon de dérivation hiérarchique : clés publiques par chemin, et chemins qui doivent être refusés ([dérivation de clés](/qoresign/spec/hd-derivation-draft#hierarchical-derivation)) |
| `hybridTx` | un `TxBody` et un `AuthInfo`, un numéro de compte et un identifiant de chaîne, avec les sign-bytes attendus, la signature ML-DSA-87, le corps final, la signature secp256k1 et le `TxRaw` pour les sign-bytes `v2` et `v1` ([signature hybride](/qoresign/spec/hybrid-signing-v1)) |
| `proofOfPossession` | message et signature de preuve de possession ([enregistrement](/qoresign/spec/hybrid-signing-v1#registration)) |
| `registerMessage` | `MsgRegisterPQCKeyV2` encodé |
| `message` | signature de messages arbitraires : données, sign-bytes ADR-36 et ML-DSA-87, signature ([signature de messages](/qoresign/spec/message-signing-v1)) |
| `siwq` | champs de connexion, message rendu, sign-bytes ADR-36 et ML-DSA-87, signature, et un instant auquel elle est valide ([Sign In With QoreChain](/qoresign/spec/siwq-v1)) |

## Encodage {#encoding}

Toutes les chaînes d'octets sont en hexadécimal minuscule. Les signatures
ML-DSA-87 sont déterministes (FIPS 204, `rnd` = 32 octets à zéro) ; les
signatures secp256k1 utilisent RFC 6979 et low-S.
