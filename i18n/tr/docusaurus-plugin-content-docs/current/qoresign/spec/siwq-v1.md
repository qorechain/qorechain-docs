---
slug: /qoresign/spec/siwq-v1
title: Sign In With QoreChain v1
sidebar_label: Sign In With QoreChain v1
sidebar_position: 2
---

# Sign In With QoreChain (SIWQ), sürüm 1

Durum: mesaj biçiminin 1. sürümü için kararlı. Kaynak:
[`spec/siwq-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/siwq-v1.md).

SIWQ, bir QoreChain hesabının anahtarlarının denetimini zincir dışı bir hizmete
kanıtlamasını sağlar. Mesaj,
[EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) ve Sign In With Solana
düzenini izler ve QoreChain adreslerine ve zincir kimliklerine uyarlanmıştır.
İmzanın iki parçası vardır: herhangi bir Keplr uyumlu cüzdanın `signArbitrary`
ile üretebildiği bir ADR-36 secp256k1 imzası ve hesabın kayıtlı kuantum sonrası
anahtarına ait bir ML-DSA-87 (FIPS 204) imzası.

## Mesaj {#message}

```
${scheme://}${domain} wants you to sign in with your QoreChain account:
${address}

${statement}

URI: ${uri}
Version: 1
Chain ID: ${chain-id}
Nonce: ${nonce}
Issued At: ${issued-at}
Expiration Time: ${expiration-time}
Not Before: ${not-before}
Request ID: ${request-id}
Resources:
- ${resources[0]}
- ${resources[1]}
...
```

- Satırlar tek bir `\n` ile ayrılır; sonda yeni satır yoktur.
- `scheme://` isteğe bağlıdır. `domain`, isteği yapan sitenin RFC 3986
  yetkilisidir (ana makine ve isteğe bağlı port).
- `address`, hesabın `qor1` bech32 biçimidir.
- Statement satırı isteğe bağlıdır. Olmadığında, EIP-4361'de olduğu gibi adresi iki
  boş satır izler.
- `Version` değeri `1`'dir. `Chain ID`, `qorechain-vladi` gibi bir QoreChain
  zincir kimliğidir.
- `Nonce`, sunucunun seçtiği en az 8 alfasayısal karakterdir ve tek kullanımlıktır.
- Zaman damgaları RFC 3339 / ISO 8601 biçimindedir.
- `Expiration Time`, `Not Before`, `Request ID` ve `Resources` isteğe bağlıdır
  ve bu sırayla görünür.

Bir doğrulayıcı, ayrıştırılan alanları yeniden oluşturmalı ve bayt bayt eşleşmeyen
bir mesajı reddetmelidir.

## İmzalar {#signatures}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

### Klasik kısım (ADR-36) {#classical-part}

Hesabın secp256k1 anahtarı, sıralı anahtarlarla ve boşluksuz serileştirilmiş
aşağıdaki amino JSON imza belgesini imzalar; burada `data`, UTF-8 mesajın base64
karşılığı ve `signer` `qor1` adresidir:

```json
{"account_number":"0","chain_id":"","fee":{"amount":[],"gas":"0"},"memo":"","msgs":[{"type":"sign/MsgSignData","value":{"data":"...","signer":"qor1..."}}],"sequence":"0"}
```

Özet, `secp256k1` hesapları için SHA-256, `eth_secp256k1` hesapları için
KECCAK-256'dır; imza 64 bayt `r || s`, low-S'tir. `publicKey`, 33 baytlık
sıkıştırılmış anahtardır ve `keyType` altında `address`'e türemelidir.

### Kuantum sonrası kısım {#post-quantum-part}

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-siwq-v1|" + message))
```

Alan öneki, bir oturum açma imzasının işlem imzası olarak kullanılabilmesini ve
tersini önler (bkz.
[Alan ayrımı](/qoresign/spec/message-signing-v1#domain-separation)).

`pq` kısmı yoksa `signatureType` değeri `secp256k1`'dir. Doğrulayıcılar,
yalnızca klasik hesapları açıkça kabul etmedikçe bu tür oturum açmaları
reddetmelidir.

## Doğrulama {#verification}

Bir doğrulayıcı şunları bu sırayla denetlemelidir:

1. mesaj ayrıştırılır ve kanonik biçimdedir;
2. `domain`, isteğin geldiği alan adına eşittir;
3. `nonce`, sunucunun bu oturum için ürettiği nonce'a eşittir ve nonce daha önce
   kullanılmamıştır;
4. `Chain ID` beklenen ağdır;
5. `Expiration Time` gelecektedir; `Not Before` ve `Issued At` gelecekte değildir
   (küçük bir saat sapmasına izin verilir);
6. klasik açık anahtar `address`'e türer ve ADR-36 imzası doğrulanır;
7. ML-DSA-87 imzası, istemcinin sağladığı bir anahtara karşı değil, `address` için
   **zincirde kayıtlı** açık anahtara (`/qorechain/pqc/v1/account/{address}`)
   karşı doğrulanır.

## Test vektörleri {#test-vectors}

`vectors/qoresign-v1.json`, `siwq` alanı. Bkz. [Test vektörleri](/qoresign/vectors).
