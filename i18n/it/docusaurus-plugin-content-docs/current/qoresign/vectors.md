---
slug: /qoresign/vectors
title: Vettori di test di QoreSign
sidebar_label: Vettori di test
sidebar_position: 5
---

# Vettori di test

[`qoresign-v1.json`](https://github.com/qorechain/qoresign/blob/main/vectors/qoresign-v1.json)
è generato dall'implementazione TypeScript (`pnpm build && pnpm vectors`) e
verificato dalle suite di test TypeScript, Rust, Go, Swift, Kotlin e Python. Una modifica
al file è una modifica al formato wire: aggiungi un nuovo file con una nuova
versione invece di modificare questo.

Ogni chiave è derivata dalla mnemonica di test pubblica BIP-39
(`abandon ... about`). Non inviare mai fondi a questi account.

## Campi {#fields}

| Campo | Contenuto |
|---|---|
| `accounts` | chiavi classiche e indirizzi per gli account `secp256k1` (`m/44'/118'/0'/0/0`) ed `eth_secp256k1` (`m/44'/60'/0'/0/0`) |
| `canonical` | chiavi pubbliche ML-DSA-87 canoniche per indirizzo ([derivazione delle chiavi](/qoresign/spec/hd-derivation-draft#canonical-derivation)) |
| `hd`, `hdRejected` | bozza di derivazione gerarchica: chiavi pubbliche per percorso e percorsi che devono essere rifiutati ([derivazione delle chiavi](/qoresign/spec/hd-derivation-draft#hierarchical-derivation)) |
| `hybridTx` | un `TxBody` e un `AuthInfo`, numero di account e chain id, con i sign-bytes attesi, la firma ML-DSA-87, il body finale, la firma secp256k1 e il `TxRaw` per i sign-bytes `v2` e `v1` ([firma ibrida](/qoresign/spec/hybrid-signing-v1)) |
| `proofOfPossession` | messaggio e firma della prova di possesso ([registrazione](/qoresign/spec/hybrid-signing-v1#registration)) |
| `registerMessage` | `MsgRegisterPQCKeyV2` codificato |
| `message` | firma di messaggi arbitrari: dati, sign-bytes ADR-36 e ML-DSA-87, firma ([firma di messaggi](/qoresign/spec/message-signing-v1)) |
| `siwq` | campi del sign-in, messaggio renderizzato, sign-bytes ADR-36 e ML-DSA-87, firma e un istante in cui risulta valido ([Sign In With QoreChain](/qoresign/spec/siwq-v1)) |

## Codifica {#encoding}

Tutte le sequenze di byte sono in esadecimale minuscolo. Le firme ML-DSA-87 sono
deterministiche (FIPS 204, `rnd` = 32 byte a zero); le firme secp256k1 usano
RFC 6979 e low-S.
