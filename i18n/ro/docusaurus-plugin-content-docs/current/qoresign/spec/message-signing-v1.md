---
slug: /qoresign/spec/message-signing-v1
title: Semnarea mesajelor v1
sidebar_label: Semnarea mesajelor v1
sidebar_position: 3
---

# Semnarea mesajelor, versiunea 1

Stare: stabilă. Pentru semnarea datelor arbitrare în afara lanțului (cererea
`signArbitrary` a portofelelor compatibile Keplr), de exemplu pentru a dovedi
unui serviciu controlul asupra unui cont. Sursa:
[`spec/message-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/message-signing-v1.md).

## Semnătura {#signature}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

- **Partea clasică:** ADR-36. Cheia secp256k1 a contului semnează documentul de
  semnare amino JSON al `MsgSignData { signer, data }`, exact ca în
  [Sign In With QoreChain v1](/qoresign/spec/siwq-v1#classical-part) (digest
  SHA-256 pentru conturile `secp256k1`, KECCAK-256 pentru `eth_secp256k1`;
  `r || s` de 64 de octeți, low-S).
- **Partea post-cuantică:**

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-msg-v1|" + chain_id + "|") || data, ctx = "")
```

`data` sunt octeții bruți ai mesajului. `chain_id` conține doar litere, cifre,
`.`, `_` și `-`.

## Separarea domeniilor {#domain-separation}

Fiecare semnătură ML-DSA-87 pe care un cont o face pe QoreChain începe cu un
domeniu propriu, astfel încât o semnătură produsă pentru un scop să nu poată fi
reutilizată pentru altul. Un portofel nu trebuie să semneze niciodată octeți
bruți cu cheia ML-DSA-87 fără unul dintre aceste prefixe și nu trebuie să lase
niciodată un mesaj să înceapă cu un prefix rezervat altei utilizări.

| Prefix | Utilizare |
|---|---|
| `qorechain-pqc-hybrid-v2` | sign-bytes ale tranzacțiilor ([Semnarea hibridă a tranzacțiilor v1](/qoresign/spec/hybrid-signing-v1#sign-bytes)) |
| `qorechain-pqc-pop-v1\|` | dovada de posesie la înregistrarea cheii |
| `qorechain:pqc:recovery:v1` | recuperarea contului |
| `qorechain-svm-auth-v2` | autorizarea lane-ului SVM |
| `qorechain-siwq-v1\|` | Sign In With QoreChain ([Sign In With QoreChain v1](/qoresign/spec/siwq-v1)) |
| `qorechain-msg-v1\|` | această specificație |

## Verificare {#verification}

1. Cheia publică clasică se derivă în `signer` conform `keyType`, iar semnătura
   ADR-36 se verifică.
2. Semnătura ML-DSA-87 se verifică față de cheia **înregistrată pe lanț** pentru
   `signer` (`/qorechain/pqc/v1/account/{address}`), peste octeții de mai sus,
   cu id-ul de lanț așteptat.

## Vectori de test {#test-vectors}

`vectors/qoresign-v1.json`, câmpul `message`. Vezi [Vectori de test](/qoresign/vectors).
