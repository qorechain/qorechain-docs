---
slug: /qoresign/guides/sizes-and-transport
title: Tailles et transport
sidebar_label: Tailles et transport
sidebar_position: 5
---

# Tailles et transport

| Élément | Octets | Source |
|---|---|---|
| Clé publique ML-DSA-87 | 2592 | FIPS 204, Table 2 |
| Clé secrète ML-DSA-87 | 4896 | FIPS 204, Table 2 |
| Signature ML-DSA-87 | 4627 | FIPS 204, Table 2 |
| Seed ML-DSA-87 | 32 | FIPS 204 |
| Clé publique secp256k1 compressée | 33 | SEC 1 |
| Signature secp256k1 (r, s) | 64 | |
| Extension PQC dans un corps | environ 4640 (signature plus encadrement protobuf ; plus 2595 lorsque la clé publique est incluse) | `qorechain.pqc.v1.PQCHybridSignature` |

## Conséquences pour les portefeuilles {#consequences}

- Une transaction hybride est environ 4,7 Ko plus volumineuse qu'une transaction
  classique. Le gas et les frais évoluent avec la taille de la transaction ;
  simulez avant de signer (`simulateTx`) et utilisez la limite de gas suggérée.
- Un code QR statique unique contient au plus 2953 octets (version 40, binaire,
  correction d'erreurs faible) : une signature ou une clé publique ML-DSA-87 n'y
  tient donc pas. Les signataires isolés du réseau (air-gapped) ont besoin
  d'encodages en plusieurs parties (QR animé ou à codes fontaine).
- Conservez la seed de 32 octets, et non la clé secrète de 4896 octets, lorsque
  vous devez persister une clé ML-DSA-87 ; `pqKeyFromSeed` recrée la paire de
  clés.

La structure de l'extension est définie dans
[Signature de transactions hybride v1](/qoresign/spec/hybrid-signing-v1#extension).
