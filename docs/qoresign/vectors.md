---
slug: /qoresign/vectors
title: QoreSign test vectors
sidebar_label: Test vectors
sidebar_position: 5
---

# Test vectors

[`qoresign-v1.json`](https://github.com/qorechain/qoresign/blob/main/vectors/qoresign-v1.json)
is generated from the TypeScript implementation (`pnpm build && pnpm vectors`)
and checked by the TypeScript, Rust, Go, Swift and Kotlin test suites. A change
to the file is a change to the wire format: add a new file with a new version
instead of editing this one.

Every key is derived from the public BIP-39 test mnemonic (`abandon ... about`).
Never send funds to these accounts.

## Fields {#fields}

| Field | Contents |
|---|---|
| `accounts` | classical keys and addresses for `secp256k1` (`m/44'/118'/0'/0/0`) and `eth_secp256k1` (`m/44'/60'/0'/0/0`) accounts |
| `canonical` | canonical ML-DSA-87 public keys per address ([key derivation](/qoresign/spec/hd-derivation-draft#canonical-derivation)) |
| `hd`, `hdRejected` | draft hierarchical derivation: public keys per path, and paths that must be refused ([key derivation](/qoresign/spec/hd-derivation-draft#hierarchical-derivation)) |
| `hybridTx` | a `TxBody` and `AuthInfo`, account number and chain id, with the expected sign-bytes, ML-DSA-87 signature, final body, secp256k1 signature and `TxRaw` for sign-bytes `v2` and `v1` ([hybrid signing](/qoresign/spec/hybrid-signing-v1)) |
| `proofOfPossession` | proof-of-possession message and signature ([registration](/qoresign/spec/hybrid-signing-v1#registration)) |
| `registerMessage` | encoded `MsgRegisterPQCKeyV2` |
| `message` | arbitrary message signing: data, ADR-36 and ML-DSA-87 sign-bytes, signature ([message signing](/qoresign/spec/message-signing-v1)) |
| `siwq` | sign-in fields, rendered message, ADR-36 and ML-DSA-87 sign-bytes, signature, and a time at which it verifies ([Sign In With QoreChain](/qoresign/spec/siwq-v1)) |

## Encoding {#encoding}

All byte strings are lowercase hex. ML-DSA-87 signatures are deterministic
(FIPS 204, `rnd` = 32 zero bytes); secp256k1 signatures use RFC 6979 and low-S.
