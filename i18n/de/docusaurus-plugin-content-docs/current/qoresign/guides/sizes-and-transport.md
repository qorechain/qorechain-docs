---
slug: /qoresign/guides/sizes-and-transport
title: Größen und Transport
sidebar_label: Größen und Transport
sidebar_position: 5
---

# Größen und Transport

| Element | Bytes | Quelle |
|---|---|---|
| ML-DSA-87-Public-Key | 2592 | FIPS 204, Table 2 |
| ML-DSA-87-Secret-Key | 4896 | FIPS 204, Table 2 |
| ML-DSA-87-Signatur | 4627 | FIPS 204, Table 2 |
| ML-DSA-87-Seed | 32 | FIPS 204 |
| Komprimierter secp256k1-Public-Key | 33 | SEC 1 |
| secp256k1-Signatur (r, s) | 64 | |
| PQC-Erweiterung in einem Body | etwa 4640 (Signatur plus Protobuf-Rahmen; plus 2595, wenn der Public Key eingebettet ist) | `qorechain.pqc.v1.PQCHybridSignature` |

## Folgen für Wallets {#consequences}

- Eine hybride Transaktion ist etwa 4,7 KB größer als eine klassische. Gas und
  Gebühren skalieren mit der Transaktionsgröße; simulieren Sie vor dem
  Signieren (`simulateTx`) und verwenden Sie das vorgeschlagene Gaslimit.
- Ein einzelner statischer QR-Code fasst höchstens 2953 Bytes (Version 40,
  binär, niedrige Fehlerkorrektur), sodass eine ML-DSA-87-Signatur oder ein
  Public Key nicht in einen passt. Air-gapped Signer benötigen mehrteilige
  Kodierungen (animierte oder Fountain-codierte QR-Codes).
- Speichern Sie den 32-Byte-Seed, nicht den 4896-Byte-Secret-Key, wenn Sie einen
  ML-DSA-87-Schlüssel dauerhaft ablegen müssen; `pqKeyFromSeed` erstellt das
  Schlüsselpaar neu.

Das Layout der Erweiterung ist in
[Hybrides Signieren von Transaktionen v1](/qoresign/spec/hybrid-signing-v1#extension)
definiert.
