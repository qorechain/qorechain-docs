---
slug: /qoresign/spec/message-signing-v1
title: Mesaj imzalama v1
sidebar_label: Mesaj imzalama v1
sidebar_position: 3
---

# Mesaj imzalama, sürüm 1

Durum: kararlı. Rastgele verinin zincir dışında imzalanması içindir (Keplr uyumlu
cüzdanların `signArbitrary` isteği); örneğin bir hesabın denetimini bir hizmete
kanıtlamak için. Kaynak:
[`spec/message-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/message-signing-v1.md).

## İmza {#signature}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

- **Klasik kısım:** ADR-36. Hesabın secp256k1 anahtarı, `MsgSignData { signer, data }`
  mesajının amino JSON imza belgesini imzalar; tıpkı
  [Sign In With QoreChain v1](/qoresign/spec/siwq-v1#classical-part)
  sayfasındaki gibi (`secp256k1` hesapları için SHA-256 özeti,
  `eth_secp256k1` için KECCAK-256; 64 bayt `r || s`, low-S).
- **Kuantum sonrası kısım:**

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-msg-v1|" + chain_id + "|") || data, ctx = "")
```

`data` ham mesaj baytlarıdır. `chain_id` yalnızca harf, rakam, `.`, `_` ve `-`
içerir.

## Alan ayrımı {#domain-separation}

Bir hesabın QoreChain üzerinde yaptığı her ML-DSA-87 imzası kendi alanıyla
başlar; böylece bir amaç için üretilmiş bir imza başka bir amaçla yeniden
kullanılamaz. Bir cüzdan, ML-DSA-87 anahtarıyla bu öneklerden biri olmadan asla
ham bayt imzalamamalı ve bir mesajın, başka bir kullanım için ayrılmış bir önekle
başlamasına asla izin vermemelidir.

| Önek | Kullanım |
|---|---|
| `qorechain-pqc-hybrid-v2` | işlem sign-bytes ([Hibrit işlem imzalama v1](/qoresign/spec/hybrid-signing-v1#sign-bytes)) |
| `qorechain-pqc-pop-v1\|` | anahtar kaydında sahiplik kanıtı |
| `qorechain:pqc:recovery:v1` | hesap kurtarma |
| `qorechain-svm-auth-v2` | SVM hattı yetkilendirmesi |
| `qorechain-siwq-v1\|` | Sign In With QoreChain ([Sign In With QoreChain v1](/qoresign/spec/siwq-v1)) |
| `qorechain-msg-v1\|` | bu spesifikasyon |

## Doğrulama {#verification}

1. Klasik açık anahtar, `keyType` altında `signer`'a türer ve ADR-36 imzası
   doğrulanır.
2. ML-DSA-87 imzası, `signer` için **zincirde kayıtlı** anahtar altında
   (`/qorechain/pqc/v1/account/{address}`), yukarıdaki baytlar üzerinde ve
   beklenen zincir kimliğiyle doğrulanır.

## Test vektörleri {#test-vectors}

`vectors/qoresign-v1.json`, `message` alanı. Bkz. [Test vektörleri](/qoresign/vectors).
