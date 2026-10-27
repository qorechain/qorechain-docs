---
slug: /qoresign/spec/siwq-v1
title: Sign In With QoreChain v1
sidebar_label: Sign In With QoreChain v1
sidebar_position: 2
---

# Sign In With QoreChain (SIWQ), version 1

Statut : stable pour la version 1 du format de message. Source :
[`spec/siwq-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/siwq-v1.md).

SIWQ permet à un compte QoreChain de prouver à un service hors chaîne qu'il
contrôle ses clés. Le message suit la structure d'
[EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) et de Sign In With Solana,
adaptée aux adresses et aux identifiants de chaîne de QoreChain. La signature se
compose de deux parties : une signature secp256k1 ADR-36, que tout portefeuille
compatible Keplr peut produire avec `signArbitrary`, et une signature ML-DSA-87
(FIPS 204) de la clé post-quantique enregistrée du compte.

## Message {#message}

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

- Les lignes sont séparées par un unique `\n` ; il n'y a pas de saut de ligne
  final.
- `scheme://` est facultatif. `domain` est l'autorité RFC 3986 du site demandeur
  (hôte et port facultatif).
- `address` est la forme bech32 `qor1` du compte.
- La ligne de déclaration (statement) est facultative. Sans elle, l'adresse est
  suivie de deux lignes vides, comme dans EIP-4361.
- `Version` vaut `1`. `Chain ID` est un identifiant de chaîne QoreChain tel que
  `qorechain-vladi`.
- `Nonce` comporte au moins 8 caractères alphanumériques choisis par le serveur, à
  usage unique.
- Les horodatages sont au format RFC 3339 / ISO 8601.
- `Expiration Time`, `Not Before`, `Request ID` et `Resources` sont facultatifs et
  apparaissent dans cet ordre.

Un vérificateur doit re-générer le rendu à partir des champs analysés et refuser
un message qui ne correspond pas octet pour octet.

## Signatures {#signatures}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

### Partie classique (ADR-36) {#classical-part}

La clé secp256k1 du compte signe le document de signature amino JSON ci-dessous,
sérialisé avec les clés triées et sans espaces, où `data` est le base64 du
message UTF-8 et `signer` l'adresse `qor1` :

```json
{"account_number":"0","chain_id":"","fee":{"amount":[],"gas":"0"},"memo":"","msgs":[{"type":"sign/MsgSignData","value":{"data":"...","signer":"qor1..."}}],"sequence":"0"}
```

Le condensat est SHA-256 pour les comptes `secp256k1` et KECCAK-256 pour les
comptes `eth_secp256k1` ; la signature fait 64 octets `r || s`, low-S.
`publicKey` est la clé compressée de 33 octets, qui doit dériver vers `address`
sous `keyType`.

### Partie post-quantique {#post-quantum-part}

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-siwq-v1|" + message))
```

Le préfixe de domaine empêche qu'une signature de connexion soit utilisable comme
signature de transaction, et inversement (voir
[Séparation des domaines](/qoresign/spec/message-signing-v1#domain-separation)).

`signatureType` vaut `secp256k1` lorsque la partie `pq` est absente. Les
vérificateurs doivent refuser de telles connexions, sauf s'ils acceptent
explicitement les comptes uniquement classiques.

## Vérification {#verification}

Un vérificateur doit contrôler, dans cet ordre :

1. le message s'analyse correctement et est sous forme canonique ;
2. `domain` est égal au domaine d'où provient la requête ;
3. `nonce` est égal au nonce émis par le serveur pour cette session, et le nonce
   n'a pas déjà été utilisé ;
4. `Chain ID` est le réseau attendu ;
5. `Expiration Time` est dans le futur, et `Not Before` et `Issued At` ne sont pas
   dans le futur (en admettant un léger décalage d'horloge) ;
6. la clé publique classique dérive vers `address` et la signature ADR-36 se
   vérifie ;
7. la signature ML-DSA-87 se vérifie avec la clé publique **enregistrée sur la
   chaîne** pour `address` (`/qorechain/pqc/v1/account/{address}`), et non avec
   une clé fournie par le client.

## Vecteurs de test {#test-vectors}

`vectors/qoresign-v1.json`, champ `siwq`. Voir [Vecteurs de test](/qoresign/vectors).
