---
slug: /qoresign/vectors
title: Vectori de test QoreSign
sidebar_label: Vectori de test
sidebar_position: 5
---

# Vectori de test

[`qoresign-v1.json`](https://github.com/qorechain/qoresign/blob/main/vectors/qoresign-v1.json)
este generat din implementarea TypeScript (`pnpm build && pnpm vectors`) și
verificat de suitele de teste TypeScript, Rust, Go, Swift, Kotlin și Python. O
modificare a fișierului este o modificare a formatului de transmisie: adăugați
în schimb un fișier nou cu o versiune nouă, în loc să îl editați pe acesta.

Fiecare cheie este derivată din mnemonica publică de test BIP-39
(`abandon ... about`). Nu trimiteți niciodată fonduri către aceste conturi.

## Câmpuri {#fields}

| Câmp | Conținut |
|---|---|
| `accounts` | chei clasice și adrese pentru conturile `secp256k1` (`m/44'/118'/0'/0/0`) și `eth_secp256k1` (`m/44'/60'/0'/0/0`) |
| `canonical` | chei publice ML-DSA-87 canonice per adresă ([derivarea cheilor](/qoresign/spec/hd-derivation-draft#canonical-derivation)) |
| `hd`, `hdRejected` | draftul derivării ierarhice: chei publice per cale și căile care trebuie refuzate ([derivarea cheilor](/qoresign/spec/hd-derivation-draft#hierarchical-derivation)) |
| `hybridTx` | un `TxBody` și `AuthInfo`, numărul contului și id-ul lanțului, cu sign-bytes, semnătura ML-DSA-87, corpul final, semnătura secp256k1 și `TxRaw` așteptate pentru sign-bytes `v2` și `v1` ([semnarea hibridă](/qoresign/spec/hybrid-signing-v1)) |
| `proofOfPossession` | mesajul și semnătura dovezii de posesie ([înregistrare](/qoresign/spec/hybrid-signing-v1#registration)) |
| `registerMessage` | `MsgRegisterPQCKeyV2` codificat |
| `message` | semnarea mesajelor arbitrare: datele, sign-bytes ADR-36 și ML-DSA-87, semnătura ([semnarea mesajelor](/qoresign/spec/message-signing-v1)) |
| `siwq` | câmpurile de sign-in, mesajul randat, sign-bytes ADR-36 și ML-DSA-87, semnătura și un moment la care se verifică ([Sign In With QoreChain](/qoresign/spec/siwq-v1)) |

## Codificare {#encoding}

Toate șirurile de octeți sunt hex cu litere mici. Semnăturile ML-DSA-87 sunt
deterministe (FIPS 204, `rnd` = 32 de octeți zero); semnăturile secp256k1
folosesc RFC 6979 și low-S.
