---
slug: /qoresign/spec/hybrid-signing-v1
title: Semnarea hibridă a tranzacțiilor v1
sidebar_label: Semnare hibridă v1
sidebar_position: 1
---

# Semnarea hibridă a tranzacțiilor pe QoreChain, versiunea 1

Stare: stabilă. Se aplică lane-ului nativ (Cosmos SDK) al `qorechain-vladi`
(mainnet) și `qorechain-diana` (testnet). Sursa:
[`spec/hybrid-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/hybrid-signing-v1.md).

## Rezumat {#summary}

O tranzacție hibridă este un `TxRaw` obișnuit din Cosmos SDK, semnat de două ori
de același cont:

1. o semnătură ML-DSA-87 (FIPS 204), purtată în corpul tranzacției ca opțiune
   de extensie `/qorechain.pqc.v1.PQCHybridSignature`;
2. o semnătură secp256k1 `SIGN_MODE_DIRECT` peste corpul final, în
   `TxRaw.signatures`.

Rețeaua le verifică pe ambele. Pe lane-ul nativ, rețeaua cere implicit
semnătura ML-DSA-87 (`HybridSignatureMode = Required`, un parametru la nivelul
întregului lanț); în afara unui mic set de mesaje scutite, precum cele care
înregistrează sau întrețin cheia ML-DSA-87 a contului, o tranzacție fără ea este
refuzată.

## Chei {#keys}

| Cheie | Algoritm | Dimensiune |
|---|---|---|
| Clasică | secp256k1 (conturi `secp256k1`: adresă = RIPEMD160(SHA256(cheie comprimată)); conturi `eth_secp256k1`: adresă = ultimii 20 de octeți din KECCAK256(cheie necomprimată)) | cheie publică comprimată de 33 de octeți |
| Post-cuantică | ML-DSA-87, id de algoritm `1` | cheie publică 2592 de octeți, semnătură 4627 de octeți |

Cheia publică ML-DSA-87 trebuie înregistrată pentru cont cu
`MsgRegisterPQCKeyV2` înainte ca tranzacțiile hibride să se verifice (vezi
[Înregistrare](#registration)). În schimb, o tranzacție poate include cheia
publică în extensie (câmpul 3) pentru a o înregistra la prima utilizare.

## Extensia {#extension}

```protobuf
package qorechain.pqc.v1;

message PQCHybridSignature {
  uint32 algorithm_id   = 1; // 1 = ML-DSA-87
  bytes  pqc_signature  = 2; // 4627 bytes
  bytes  pqc_public_key = 3; // optional, 2592 bytes
}
```

Ea se adaugă în `TxBody.extension_options` (câmpul 1023) ca
`google.protobuf.Any`, cu `type_url = "/qorechain.pqc.v1.PQCHybridSignature"`
și codificarea protobuf ca `value`. Un corp trebuie să poarte exact o astfel de
extensie.

## Sign-bytes {#sign-bytes}

Fie `B0` codificarea protobuf canonică a `TxBody` **fără** extensia PQC (toate
celelalte câmpuri și extensii păstrate, în ordine) și `A` octeții `AuthInfo`
exact așa cum sunt difuzați. `BE32`/`BE64` sunt lungimi fără semn, big-endian.

```
v1 = BE32(len(B0)) || B0 || BE32(len(A)) || A
v2 = "qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id || v1
```

O rețea verifică exact o singură formă la o înălțime dată. Ambele rețele publice
verifică `v2` de la upgrade-urile lor `v3.1.98` / `v3.2.0` (mainnet: `v3.2.0` la
înălțimea 2,981,742); orice altă rețea verifică `v2` de la genesis. `v1` este
necesară doar pentru a reproduce semnăturile făcute înainte de aceste înălțimi.
Un client poate întreba un nod ce formă verifică, citind
`/cosmos/upgrade/v1beta1/applied_plan/{v3.1.98|v3.2.0}`.

Semnătura ML-DSA-87 este `ML-DSA.Sign(sk, signBytes, ctx = "")`. Rețeaua
acceptă atât varianta deterministă, cât și cea hedged; QoreSign semnează
implicit determinist (FIPS 204, `rnd` = 32 de octeți zero), astfel încât
semnăturile să fie reproductibile față de vectorii publicați.

## Ordinea operațiilor {#order-of-operations}

1. Codificați `B0` și `A` (taxa, limita de gaz și informațiile semnatarului sunt
   fixate în acest punct).
2. Calculați sign-bytes și semnătura ML-DSA-87.
3. Adăugați extensia la `B0`, în ordinea canonică a câmpurilor (după
   `extension_options` existente, înainte de `non_critical_extension_options`),
   obținând corpul final `B`.
4. Semnați `SignDoc { body_bytes = B, auth_info_bytes = A, chain_id, account_number }`
   cu secp256k1: SHA-256 pentru conturile `secp256k1`, KECCAK-256 pentru
   conturile `eth_secp256k1`; `r || s` de 64 de octeți, low-S.
5. Difuzați `TxRaw { B, A, [classical signature] }`.

Semnătura clasică acoperă extensia; semnătura ML-DSA-87 acoperă tot restul din
corp și din auth info, inclusiv taxa. Nicio semnătură nu se semnează pe sine.

## Înregistrare {#registration}

`MsgRegisterPQCKeyV2` (type URL `/qorechain.pqc.v1.MsgRegisterPQCKeyV2`):

| Câmp | Număr | Valoare |
|---|---|---|
| `sender` | 1 | contul `qor1` |
| `public_key` | 2 | cheia publică ML-DSA-87 |
| `algorithm_id` | 3 | `1` |
| `ecdsa_pubkey` | 4 | cheia secp256k1 comprimată de 33 de octeți a contului; trebuie să se deriveze în `sender` |
| `key_type` | 5 | `hybrid` |
| `proof_of_possession` | 6 | semnătură ML-DSA-87 peste mesajul de mai jos |

```
"qorechain-pqc-pop-v1|" + chain_id + "|" + algorithm_id + "|" + sender + "|" + lowercase_hex(public_key)
```

Tranzacția de înregistrare în sine este semnată doar cu cheia clasică. O cheie
publică a cărei parte `t1` (octeții de la 32 încolo) este în întregime zero este
refuzată, deoarece semnăturile ei pot fi falsificate.

## Alte lane-uri {#other-lanes}

- Lane-ul EVM: tranzacțiile Ethereum nu au câmp pentru o extensie, deci nu poartă
  nicio semnătură ML-DSA-87. Un cont cu o cheie ML-DSA-87 înregistrată poate
  deschide, de pe lane-ul nativ, o fereastră de autorizare EVM limitată
  (înălțime de expirare, număr maxim de tranzacții, valoare maximă). Vezi
  [Portofele EVM: fereastra de autorizare](/qoresign/guides/evm-quantum-ready).
- Lane-ul SVM: încă neactivat în rețea.

## Vectori de test {#test-vectors}

`vectors/qoresign-v1.json`, câmpul `hybridTx`, oferă un corp, auth info și un
număr de cont, cu sign-bytes, semnăturile, corpul final și `TxRaw` așteptate
pentru ambele versiuni. Vezi [Vectori de test](/qoresign/vectors).
