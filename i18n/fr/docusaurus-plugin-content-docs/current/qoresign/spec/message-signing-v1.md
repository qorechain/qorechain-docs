---
slug: /qoresign/spec/message-signing-v1
title: Signature de messages v1
sidebar_label: Signature de messages v1
sidebar_position: 3
---

# Signature de messages, version 1

Statut : stable. Sert à signer des données arbitraires hors chaîne (la requête
`signArbitrary` des portefeuilles compatibles Keplr), par exemple pour prouver à
un service le contrôle d'un compte. Source :
[`spec/message-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/message-signing-v1.md).

## Signature {#signature}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

- **Partie classique :** ADR-36. La clé secp256k1 du compte signe le document de
  signature amino JSON de `MsgSignData { signer, data }`, exactement comme dans
  [Sign In With QoreChain v1](/qoresign/spec/siwq-v1#classical-part) (condensat
  SHA-256 pour les comptes `secp256k1`, KECCAK-256 pour `eth_secp256k1` ; 64
  octets `r || s`, low-S).
- **Partie post-quantique :**

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-msg-v1|" + chain_id + "|") || data, ctx = "")
```

`data` correspond aux octets bruts du message. `chain_id` ne contient que des
lettres, des chiffres, `.`, `_` et `-`.

## Séparation des domaines {#domain-separation}

Chaque signature ML-DSA-87 qu'un compte produit sur QoreChain commence par un
domaine qui lui est propre, de sorte qu'une signature produite pour un usage ne
puisse pas être rejouée pour un autre. Un portefeuille ne doit jamais signer
d'octets bruts avec la clé ML-DSA-87 sans l'un de ces préfixes, et ne doit jamais
laisser un message commencer par un préfixe réservé à un autre usage.

| Préfixe | Usage |
|---|---|
| `qorechain-pqc-hybrid-v2` | sign-bytes de transaction ([Signature de transactions hybride v1](/qoresign/spec/hybrid-signing-v1#sign-bytes)) |
| `qorechain-pqc-pop-v1\|` | preuve de possession lors de l'enregistrement de la clé |
| `qorechain:pqc:recovery:v1` | récupération de compte |
| `qorechain-svm-auth-v2` | autorisation de la voie SVM |
| `qorechain-siwq-v1\|` | Sign In With QoreChain ([Sign In With QoreChain v1](/qoresign/spec/siwq-v1)) |
| `qorechain-msg-v1\|` | cette spécification |

## Vérification {#verification}

1. La clé publique classique dérive vers `signer` sous `keyType`, et la signature
   ADR-36 se vérifie.
2. La signature ML-DSA-87 se vérifie avec la clé **enregistrée sur la chaîne**
   pour `signer` (`/qorechain/pqc/v1/account/{address}`), sur les octets
   ci-dessus avec l'identifiant de chaîne attendu.

## Vecteurs de test {#test-vectors}

`vectors/qoresign-v1.json`, champ `message`. Voir [Vecteurs de test](/qoresign/vectors).
