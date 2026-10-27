---
slug: /qoresign/spec/message-signing-v1
title: Nachrichtensignatur v1
sidebar_label: Nachrichtensignatur v1
sidebar_position: 3
---

# Nachrichtensignatur, Version 1

Status: stabil. Zum Signieren beliebiger Daten off-chain (die
`signArbitrary`-Anfrage Keplr-kompatibler Wallets), zum Beispiel um gegenüber
einem Dienst die Kontrolle über ein Konto nachzuweisen. Quelle:
[`spec/message-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/message-signing-v1.md).

## Signatur {#signature}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

- **Klassischer Teil:** ADR-36. Der secp256k1-Schlüssel des Kontos signiert das
  Amino-JSON-Signaturdokument von `MsgSignData { signer, data }`, genau wie in
  [Sign In With QoreChain v1](/qoresign/spec/siwq-v1#classical-part) (SHA-256-Digest
  für `secp256k1`-Konten, KECCAK-256 für `eth_secp256k1`; 64 Bytes
  `r || s`, Low-S).
- **Post-Quanten-Teil:**

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-msg-v1|" + chain_id + "|") || data, ctx = "")
```

`data` sind die rohen Nachrichten-Bytes. `chain_id` enthält nur Buchstaben,
Ziffern, `.`, `_` und `-`.

## Domain-Trennung {#domain-separation}

Jede ML-DSA-87-Signatur, die ein Konto auf QoreChain erstellt, beginnt mit einer
eigenen Domain, damit eine für einen Zweck erzeugte Signatur nicht für einen
anderen Zweck wiederverwendet werden kann. Eine Wallet darf den ML-DSA-87-Schlüssel
niemals über rohe Bytes signieren lassen, ohne dass eines dieser Präfixe
vorangestellt ist, und darf nie zulassen, dass eine Nachricht mit einem Präfix
beginnt, das für eine andere Verwendung reserviert ist.

| Präfix | Verwendung |
|---|---|
| `qorechain-pqc-hybrid-v2` | Sign-Bytes von Transaktionen ([Hybrides Signieren von Transaktionen v1](/qoresign/spec/hybrid-signing-v1#sign-bytes)) |
| `qorechain-pqc-pop-v1\|` | Besitznachweis bei der Schlüsselregistrierung |
| `qorechain:pqc:recovery:v1` | Kontowiederherstellung |
| `qorechain-svm-auth-v2` | Autorisierung auf der SVM-Lane |
| `qorechain-siwq-v1\|` | Sign In With QoreChain ([Sign In With QoreChain v1](/qoresign/spec/siwq-v1)) |
| `qorechain-msg-v1\|` | diese Spezifikation |

## Prüfung {#verification}

1. Der klassische Public Key leitet unter `keyType` zu `signer` ab, und die
   ADR-36-Signatur verifiziert sich.
2. Die ML-DSA-87-Signatur verifiziert sich unter dem **on-chain registrierten**
   Schlüssel von `signer` (`/qorechain/pqc/v1/account/{address}`) über die oben
   genannten Bytes mit der erwarteten Chain-ID.

## Testvektoren {#test-vectors}

`vectors/qoresign-v1.json`, Feld `message`. Siehe [Testvektoren](/qoresign/vectors).
