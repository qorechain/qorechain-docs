---
slug: /qoresign/guides/sizes-and-transport
title: Dimensiuni și transport
sidebar_label: Dimensiuni și transport
sidebar_position: 5
---

# Dimensiuni și transport

| Element | Octeți | Sursă |
|---|---|---|
| Cheie publică ML-DSA-87 | 2592 | FIPS 204, Table 2 |
| Cheie secretă ML-DSA-87 | 4896 | FIPS 204, Table 2 |
| Semnătură ML-DSA-87 | 4627 | FIPS 204, Table 2 |
| Seed ML-DSA-87 | 32 | FIPS 204 |
| Cheie publică secp256k1 comprimată | 33 | SEC 1 |
| Semnătură secp256k1 (r, s) | 64 | |
| Extensia PQC într-un corp | aproximativ 4640 (semnătura plus încadrarea protobuf; plus 2595 când cheia publică este inclusă) | `qorechain.pqc.v1.PQCHybridSignature` |

## Consecințe pentru portofele {#consequences}

- O tranzacție hibridă este cu aproximativ 4,7 KB mai mare decât una clasică.
  Gazul și taxele cresc odată cu dimensiunea tranzacției; simulați înainte de
  semnare (`simulateTx`) și folosiți limita de gaz sugerată.
- Un singur cod QR static conține cel mult 2953 de octeți (versiunea 40, binar,
  corecție de erori redusă), deci o semnătură sau o cheie publică ML-DSA-87 nu
  încape într-unul. Semnatarii air-gapped au nevoie de codificări în mai multe
  părți (QR animat sau codat fountain).
- Păstrați seed-ul de 32 de octeți, nu cheia secretă de 4896 de octeți, când
  trebuie să persistați o cheie ML-DSA-87; `pqKeyFromSeed` recreează perechea de
  chei.

Structura extensiei este definită în
[Semnarea hibridă a tranzacțiilor v1](/qoresign/spec/hybrid-signing-v1#extension).
