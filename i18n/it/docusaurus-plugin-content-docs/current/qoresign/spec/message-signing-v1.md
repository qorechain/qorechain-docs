---
slug: /qoresign/spec/message-signing-v1
title: Firma di messaggi v1
sidebar_label: Firma di messaggi v1
sidebar_position: 3
---

# Firma di messaggi, versione 1

Stato: stabile. Serve a firmare dati arbitrari off-chain (la richiesta
`signArbitrary` dei wallet compatibili con Keplr), per esempio per dimostrare a
un servizio il controllo di un account. Fonte:
[`spec/message-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/message-signing-v1.md).

## Firma {#signature}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

- **Parte classica:** ADR-36. La chiave secp256k1 dell'account firma il
  documento di firma amino JSON di `MsgSignData { signer, data }`, esattamente
  come in [Sign In With QoreChain v1](/qoresign/spec/siwq-v1#classical-part)
  (digest SHA-256 per gli account `secp256k1`, KECCAK-256 per `eth_secp256k1`;
  `r || s` da 64 byte, low-S).
- **Parte post-quantistica:**

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-msg-v1|" + chain_id + "|") || data, ctx = "")
```

`data` sono i byte grezzi del messaggio. `chain_id` contiene solo lettere, cifre,
`.`, `_` e `-`.

## Separazione dei domini {#domain-separation}

Ogni firma ML-DSA-87 che un account produce su QoreChain inizia con un dominio
proprio, così una firma prodotta per uno scopo non può essere riutilizzata per un
altro. Un wallet non deve mai firmare byte grezzi con la chiave ML-DSA-87 senza
uno di questi prefissi, e non deve mai lasciare che un messaggio inizi con un
prefisso riservato a un altro uso.

| Prefisso | Uso |
|---|---|
| `qorechain-pqc-hybrid-v2` | sign-bytes delle transazioni ([Firma ibrida delle transazioni v1](/qoresign/spec/hybrid-signing-v1#sign-bytes)) |
| `qorechain-pqc-pop-v1\|` | prova di possesso alla registrazione della chiave |
| `qorechain:pqc:recovery:v1` | recupero dell'account |
| `qorechain-svm-auth-v2` | autorizzazione sulla corsia SVM |
| `qorechain-siwq-v1\|` | Sign In With QoreChain ([Sign In With QoreChain v1](/qoresign/spec/siwq-v1)) |
| `qorechain-msg-v1\|` | questa specifica |

## Verifica {#verification}

1. La chiave pubblica classica deriva in `signer` secondo `keyType` e la firma
   ADR-36 si verifica.
2. La firma ML-DSA-87 si verifica con la chiave **registrata on-chain** per
   `signer` (`/qorechain/pqc/v1/account/{address}`), sui byte indicati sopra con
   il chain id atteso.

## Vettori di test {#test-vectors}

`vectors/qoresign-v1.json`, campo `message`. Vedi
[Vettori di test](/qoresign/vectors).
