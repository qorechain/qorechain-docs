---
slug: /qoresign/guides/sizes-and-transport
title: Dimensioni e trasporto
sidebar_label: Dimensioni e trasporto
sidebar_position: 5
---

# Dimensioni e trasporto

| Elemento | Byte | Fonte |
|---|---|---|
| Chiave pubblica ML-DSA-87 | 2592 | FIPS 204, Table 2 |
| Chiave segreta ML-DSA-87 | 4896 | FIPS 204, Table 2 |
| Firma ML-DSA-87 | 4627 | FIPS 204, Table 2 |
| Seed ML-DSA-87 | 32 | FIPS 204 |
| Chiave pubblica compressa secp256k1 | 33 | SEC 1 |
| Firma secp256k1 (r, s) | 64 | |
| Estensione PQC in un body | circa 4640 (firma più framing protobuf; più 2595 quando la chiave pubblica è incorporata) | `qorechain.pqc.v1.PQCHybridSignature` |

## Conseguenze per i wallet {#consequences}

- Una transazione ibrida è più grande di circa 4,7 KB rispetto a una classica. Gas
  e commissioni crescono con la dimensione della transazione; simula prima di
  firmare (`simulateTx`) e usa il limite di gas suggerito.
- Un singolo codice QR statico contiene al massimo 2953 byte (versione 40,
  binario, correzione d'errore bassa), quindi una firma o una chiave pubblica
  ML-DSA-87 non vi sta. I firmatari air-gapped richiedono codifiche in più parti
  (QR animati o con codifica a fontana).
- Quando devi conservare una chiave ML-DSA-87, salva il seed da 32 byte, non la
  chiave segreta da 4896 byte; `pqKeyFromSeed` ricrea la coppia di chiavi.

Il layout dell'estensione è definito in
[Firma ibrida delle transazioni v1](/qoresign/spec/hybrid-signing-v1#extension).
