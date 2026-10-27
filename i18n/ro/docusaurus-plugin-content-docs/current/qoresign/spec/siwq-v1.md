---
slug: /qoresign/spec/siwq-v1
title: Sign In With QoreChain v1
sidebar_label: Sign In With QoreChain v1
sidebar_position: 2
---

# Sign In With QoreChain (SIWQ), versiunea 1

Stare: stabilă pentru versiunea 1 a formatului mesajului. Sursa:
[`spec/siwq-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/siwq-v1.md).

SIWQ permite unui cont QoreChain să dovedească unui serviciu din afara lanțului
că își controlează cheile. Mesajul urmează structura
[EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) și a Sign In With Solana,
adaptată la adresele și id-urile de lanț ale QoreChain. Semnătura are două
părți: o semnătură secp256k1 ADR-36, pe care o poate produce orice portofel
compatibil Keplr cu `signArbitrary`, și o semnătură ML-DSA-87 (FIPS 204) a
cheii post-cuantice înregistrate a contului.

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

- Liniile sunt separate printr-un singur `\n`; nu există newline la final.
- `scheme://` este opțional. `domain` este autoritatea RFC 3986 a site-ului care
  face cererea (host și port opțional).
- `address` este forma bech32 `qor1` a contului.
- Linia de statement este opțională. Fără ea, adresa este urmată de două linii
  goale, ca în EIP-4361.
- `Version` este `1`. `Chain ID` este un id de lanț QoreChain, precum
  `qorechain-vladi`.
- `Nonce` are cel puțin 8 caractere alfanumerice alese de server, de unică
  folosință.
- Marcajele de timp sunt RFC 3339 / ISO 8601.
- `Expiration Time`, `Not Before`, `Request ID` și `Resources` sunt opționale și
  apar în această ordine.

Un verificator trebuie să randeze din nou câmpurile parsate și să refuze un
mesaj care nu se potrivește octet cu octet.

## Semnături {#signatures}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

### Partea clasică (ADR-36) {#classical-part}

Cheia secp256k1 a contului semnează documentul de semnare amino JSON de mai
jos, serializat cu chei sortate și fără spații, unde `data` este base64 al
mesajului UTF-8, iar `signer` adresa `qor1`:

```json
{"account_number":"0","chain_id":"","fee":{"amount":[],"gas":"0"},"memo":"","msgs":[{"type":"sign/MsgSignData","value":{"data":"...","signer":"qor1..."}}],"sequence":"0"}
```

Digestul este SHA-256 pentru conturile `secp256k1` și KECCAK-256 pentru conturile
`eth_secp256k1`; semnătura are 64 de octeți `r || s`, low-S. `publicKey` este
cheia comprimată de 33 de octeți, care trebuie să se deriveze în `address`
conform `keyType`.

### Partea post-cuantică {#post-quantum-part}

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-siwq-v1|" + message))
```

Prefixul de domeniu împiedică folosirea unei semnături de sign-in ca semnătură
de tranzacție și invers (vezi
[Separarea domeniilor](/qoresign/spec/message-signing-v1#domain-separation)).

`signatureType` este `secp256k1` când partea `pq` lipsește. Verificatorii ar
trebui să refuze astfel de sign-in-uri, cu excepția cazului în care acceptă
explicit conturi doar cu cheie clasică.

## Verificare {#verification}

Un verificator trebuie să controleze, în această ordine:

1. mesajul se parsează și este în formă canonică;
2. `domain` este egal cu domeniul de la care a venit cererea;
3. `nonce` este egal cu nonce-ul emis de server pentru această sesiune, iar
   nonce-ul nu a mai fost folosit;
4. `Chain ID` este rețeaua așteptată;
5. `Expiration Time` este în viitor, iar `Not Before` și `Issued At` nu sunt în
   viitor (permițând o mică abatere de ceas);
6. cheia publică clasică se derivă în `address`, iar semnătura ADR-36 se
   verifică;
7. semnătura ML-DSA-87 se verifică față de cheia publică **înregistrată pe
   lanț** pentru `address` (`/qorechain/pqc/v1/account/{address}`), nu față de o
   cheie furnizată de client.

## Vectori de test {#test-vectors}

`vectors/qoresign-v1.json`, câmpul `siwq`. Vezi [Vectori de test](/qoresign/vectors).
