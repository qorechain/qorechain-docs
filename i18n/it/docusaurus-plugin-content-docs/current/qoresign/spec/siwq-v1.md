---
slug: /qoresign/spec/siwq-v1
title: Sign In With QoreChain v1
sidebar_label: Sign In With QoreChain v1
sidebar_position: 2
---

# Sign In With QoreChain (SIWQ), versione 1

Stato: stabile per la versione 1 del formato del messaggio. Fonte:
[`spec/siwq-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/siwq-v1.md).

SIWQ permette a un account QoreChain di dimostrare a un servizio off-chain il
controllo delle proprie chiavi. Il messaggio segue il layout di
[EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) e di Sign In With Solana,
adattato agli indirizzi e ai chain id di QoreChain. La firma ha due parti: una
firma secp256k1 ADR-36, che qualsiasi wallet compatibile con Keplr può produrre
con `signArbitrary`, e una firma ML-DSA-87 (FIPS 204) della chiave
post-quantistica registrata dell'account.

## Messaggio {#message}

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

- Le righe sono separate da un singolo `\n`; non c'è alcun a capo finale.
- `scheme://` è facoltativo. `domain` è l'authority RFC 3986 del sito che
  effettua la richiesta (host e porta facoltativa).
- `address` è la forma bech32 `qor1` dell'account.
- La riga della dichiarazione (statement) è facoltativa. Senza di essa
  l'indirizzo è seguito da due righe vuote, come in EIP-4361.
- `Version` è `1`. `Chain ID` è un chain id di QoreChain, come
  `qorechain-vladi`.
- `Nonce` è composto da almeno 8 caratteri alfanumerici scelti dal server, a uso
  singolo.
- I timestamp sono in formato RFC 3339 / ISO 8601.
- `Expiration Time`, `Not Before`, `Request ID` e `Resources` sono facoltativi e
  compaiono in questo ordine.

Un verificatore deve ri-renderizzare i campi analizzati e rifiutare un messaggio
che non corrisponda byte per byte.

## Firme {#signatures}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

### Parte classica (ADR-36) {#classical-part}

La chiave secp256k1 dell'account firma il documento di firma amino JSON qui sotto,
serializzato con chiavi ordinate e senza spazi, dove `data` è il base64 del
messaggio UTF-8 e `signer` l'indirizzo `qor1`:

```json
{"account_number":"0","chain_id":"","fee":{"amount":[],"gas":"0"},"memo":"","msgs":[{"type":"sign/MsgSignData","value":{"data":"...","signer":"qor1..."}}],"sequence":"0"}
```

Il digest è SHA-256 per gli account `secp256k1` e KECCAK-256 per gli account
`eth_secp256k1`; la firma è `r || s` da 64 byte, low-S. `publicKey` è la chiave
compressa da 33 byte, che deve derivare in `address` secondo `keyType`.

### Parte post-quantistica {#post-quantum-part}

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-siwq-v1|" + message))
```

Il prefisso di dominio impedisce che una firma di sign-in possa essere usata come
firma di transazione e viceversa (vedi
[Separazione dei domini](/qoresign/spec/message-signing-v1#domain-separation)).

`signatureType` è `secp256k1` quando la parte `pq` è assente. I verificatori
dovrebbero rifiutare tali sign-in a meno che accettino esplicitamente account
solo classici.

## Verifica {#verification}

Un verificatore deve controllare, in quest'ordine:

1. il messaggio viene analizzato correttamente ed è in forma canonica;
2. `domain` coincide con il dominio da cui proviene la richiesta;
3. `nonce` coincide con il nonce emesso dal server per questa sessione e il nonce
   non è stato usato prima;
4. `Chain ID` è la rete attesa;
5. `Expiration Time` è nel futuro, mentre `Not Before` e `Issued At` non sono nel
   futuro (ammettendo un piccolo scarto di orologio);
6. la chiave pubblica classica deriva in `address` e la firma ADR-36 si verifica;
7. la firma ML-DSA-87 si verifica con la chiave pubblica **registrata on-chain**
   per `address` (`/qorechain/pqc/v1/account/{address}`), non con una chiave
   fornita dal client.

## Vettori di test {#test-vectors}

`vectors/qoresign-v1.json`, campo `siwq`. Vedi
[Vettori di test](/qoresign/vectors).
