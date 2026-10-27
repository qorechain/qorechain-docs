---
slug: /qoresign/spec/siwq-v1
title: Sign In With QoreChain v1
sidebar_label: Sign In With QoreChain v1
sidebar_position: 2
---

# Sign In With QoreChain (SIWQ), Version 1

Status: stabil für Version 1 des Nachrichtenformats. Quelle:
[`spec/siwq-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/siwq-v1.md).

Mit SIWQ weist ein QoreChain-Konto gegenüber einem Off-Chain-Dienst die
Kontrolle über seine Schlüssel nach. Die Nachricht folgt dem Layout von
[EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) und Sign In With Solana,
angepasst an QoreChain-Adressen und Chain-IDs. Die Signatur hat zwei Teile: eine
ADR-36-secp256k1-Signatur, die jede Keplr-kompatible Wallet mit `signArbitrary`
erzeugen kann, und eine ML-DSA-87-Signatur (FIPS 204) des registrierten
Post-Quanten-Schlüssels des Kontos.

## Nachricht {#message}

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

- Zeilen werden durch ein einzelnes `\n` getrennt; es gibt keinen abschließenden
  Zeilenumbruch.
- `scheme://` ist optional. `domain` ist die RFC-3986-Authority der anfragenden
  Website (Host und optionaler Port).
- `address` ist die Bech32-Form des Kontos mit `qor1`.
- Die Statement-Zeile ist optional. Ohne sie folgen auf die Adresse zwei leere
  Zeilen, wie in EIP-4361.
- `Version` ist `1`. `Chain ID` ist eine QoreChain-Chain-ID wie
  `qorechain-vladi`.
- `Nonce` besteht aus mindestens 8 alphanumerischen Zeichen, vom Server gewählt,
  einmalig verwendbar.
- Zeitstempel folgen RFC 3339 / ISO 8601.
- `Expiration Time`, `Not Before`, `Request ID` und `Resources` sind optional und
  erscheinen in dieser Reihenfolge.

Ein Prüfer muss die geparsten Felder neu rendern und eine Nachricht ablehnen, die
nicht Byte für Byte übereinstimmt.

## Signaturen {#signatures}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

### Klassischer Teil (ADR-36) {#classical-part}

Der secp256k1-Schlüssel des Kontos signiert das untenstehende
Amino-JSON-Signaturdokument, serialisiert mit sortierten Schlüsseln und ohne
Leerraum, wobei `data` das Base64 der UTF-8-Nachricht und `signer` die
`qor1`-Adresse ist:

```json
{"account_number":"0","chain_id":"","fee":{"amount":[],"gas":"0"},"memo":"","msgs":[{"type":"sign/MsgSignData","value":{"data":"...","signer":"qor1..."}}],"sequence":"0"}
```

Der Digest ist SHA-256 für `secp256k1`-Konten und KECCAK-256 für
`eth_secp256k1`-Konten; die Signatur besteht aus 64 Bytes `r || s`, Low-S.
`publicKey` ist der 33-Byte-komprimierte Schlüssel, der unter `keyType` zu
`address` ableiten muss.

### Post-Quanten-Teil {#post-quantum-part}

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-siwq-v1|" + message))
```

Das Domain-Präfix verhindert, dass eine Anmeldesignatur als Transaktionssignatur
verwendet werden kann und umgekehrt (siehe
[Domain-Trennung](/qoresign/spec/message-signing-v1#domain-separation)).

`signatureType` ist `secp256k1`, wenn der `pq`-Teil fehlt. Prüfer sollten solche
Anmeldungen ablehnen, sofern sie nicht ausdrücklich rein klassische Konten
akzeptieren.

## Prüfung {#verification}

Ein Prüfer muss in dieser Reihenfolge Folgendes kontrollieren:

1. Die Nachricht lässt sich parsen und liegt in kanonischer Form vor;
2. `domain` entspricht der Domain, von der die Anfrage kam;
3. `nonce` entspricht der Nonce, die der Server für diese Sitzung ausgestellt hat,
   und die Nonce wurde noch nicht verwendet;
4. `Chain ID` ist das erwartete Netzwerk;
5. `Expiration Time` liegt in der Zukunft, und `Not Before` und `Issued At` liegen
   nicht in der Zukunft (mit einer kleinen Toleranz für Uhrenabweichung);
6. der klassische Public Key leitet zu `address` ab, und die ADR-36-Signatur
   verifiziert sich;
7. die ML-DSA-87-Signatur verifiziert sich unter dem **on-chain registrierten**
   Public Key von `address` (`/qorechain/pqc/v1/account/{address}`), nicht unter
   einem vom Client gelieferten Schlüssel.

## Testvektoren {#test-vectors}

`vectors/qoresign-v1.json`, Feld `siwq`. Siehe [Testvektoren](/qoresign/vectors).
