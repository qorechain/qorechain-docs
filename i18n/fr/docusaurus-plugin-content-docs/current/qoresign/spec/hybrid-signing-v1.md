---
slug: /qoresign/spec/hybrid-signing-v1
title: Signature de transactions hybride v1
sidebar_label: Signature hybride v1
sidebar_position: 1
---

# Signature de transactions hybride sur QoreChain, version 1

Statut : stable. S'applique à la voie native (Cosmos SDK) de `qorechain-vladi`
(mainnet) et de `qorechain-diana` (testnet). Source :
[`spec/hybrid-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/hybrid-signing-v1.md).

## Résumé {#summary}

Une transaction hybride est un `TxRaw` ordinaire du Cosmos SDK, signé deux fois
par le même compte :

1. une signature ML-DSA-87 (FIPS 204), transportée dans le corps de la
   transaction sous forme d'option d'extension
   `/qorechain.pqc.v1.PQCHybridSignature` ;
2. une signature secp256k1 `SIGN_MODE_DIRECT` sur le corps final, dans
   `TxRaw.signatures`.

Le réseau vérifie les deux. Sur la voie native, le réseau exige par défaut la
signature ML-DSA-87 (`HybridSignatureMode = Required`, un paramètre à l'échelle de
la chaîne) ; à l'exception d'un petit ensemble de messages exemptés, comme ceux
qui enregistrent ou maintiennent la clé ML-DSA-87 du compte, une transaction qui
en est dépourvue est refusée.

## Clés {#keys}

| Clé | Algorithme | Taille |
|---|---|---|
| Classique | secp256k1 (comptes `secp256k1` : adresse = RIPEMD160(SHA256(clé compressée)) ; comptes `eth_secp256k1` : adresse = 20 derniers octets de KECCAK256(clé non compressée)) | clé publique compressée de 33 octets |
| Post-quantique | ML-DSA-87, identifiant d'algorithme `1` | clé publique de 2592 octets, signature de 4627 octets |

La clé publique ML-DSA-87 doit être enregistrée pour le compte avec
`MsgRegisterPQCKeyV2` avant que les transactions hybrides ne se vérifient (voir
[Enregistrement](#registration)). Une transaction peut aussi inclure la clé
publique dans l'extension (champ 3) pour l'enregistrer à la première utilisation.

## L'extension {#extension}

```protobuf
package qorechain.pqc.v1;

message PQCHybridSignature {
  uint32 algorithm_id   = 1; // 1 = ML-DSA-87
  bytes  pqc_signature  = 2; // 4627 bytes
  bytes  pqc_public_key = 3; // optional, 2592 bytes
}
```

Elle est ajoutée à `TxBody.extension_options` (champ 1023) sous forme de
`google.protobuf.Any` avec `type_url = "/qorechain.pqc.v1.PQCHybridSignature"` et
l'encodage protobuf comme `value`. Un corps doit porter exactement une extension
de ce type.

## Sign-bytes {#sign-bytes}

Soit `B0` l'encodage protobuf canonique du `TxBody` **sans** l'extension PQC
(tous les autres champs et extensions conservés, dans l'ordre) et `A` les octets
d'`AuthInfo` exactement tels que diffusés. `BE32`/`BE64` sont des longueurs
non signées en big-endian.

```
v1 = BE32(len(B0)) || B0 || BE32(len(A)) || A
v2 = "qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id || v1
```

Un réseau vérifie exactement une forme à une hauteur donnée. Les deux réseaux
publics vérifient `v2` depuis leurs mises à niveau `v3.1.98` / `v3.2.0` (mainnet :
`v3.2.0` à la hauteur 2,981,742) ; tout autre réseau vérifie `v2` dès la genèse.
`v1` n'est nécessaire que pour reproduire des signatures faites avant ces
hauteurs. Un client peut demander à un nœud quelle forme il vérifie en lisant
`/cosmos/upgrade/v1beta1/applied_plan/{v3.1.98|v3.2.0}`.

La signature ML-DSA-87 est `ML-DSA.Sign(sk, signBytes, ctx = "")`. Le réseau
accepte la variante déterministe comme la variante hedged ; QoreSign signe par
défaut de façon déterministe (FIPS 204, `rnd` = 32 octets à zéro) afin que les
signatures soient reproductibles par rapport aux vecteurs publiés.

## Ordre des opérations {#order-of-operations}

1. Encodez `B0` et `A` (les frais, la limite de gas et les informations du
   signataire sont fixés à ce stade).
2. Calculez les sign-bytes et la signature ML-DSA-87.
3. Ajoutez l'extension à `B0`, dans l'ordre canonique des champs (après les
   `extension_options` existantes, avant `non_critical_extension_options`), ce qui
   donne le corps final `B`.
4. Signez `SignDoc { body_bytes = B, auth_info_bytes = A, chain_id, account_number }`
   avec secp256k1 : SHA-256 pour les comptes `secp256k1`, KECCAK-256 pour les
   comptes `eth_secp256k1` ; `r || s` sur 64 octets, low-S.
5. Diffusez `TxRaw { B, A, [signature classique] }`.

La signature classique couvre l'extension ; la signature ML-DSA-87 couvre tout le
reste du corps et des informations d'authentification, frais compris. Aucune des
deux signatures ne se signe elle-même.

## Enregistrement {#registration}

`MsgRegisterPQCKeyV2` (type URL `/qorechain.pqc.v1.MsgRegisterPQCKeyV2`) :

| Champ | Numéro | Valeur |
|---|---|---|
| `sender` | 1 | le compte `qor1` |
| `public_key` | 2 | clé publique ML-DSA-87 |
| `algorithm_id` | 3 | `1` |
| `ecdsa_pubkey` | 4 | la clé secp256k1 compressée de 33 octets du compte ; elle doit dériver vers `sender` |
| `key_type` | 5 | `hybrid` |
| `proof_of_possession` | 6 | signature ML-DSA-87 du message ci-dessous |

```
"qorechain-pqc-pop-v1|" + chain_id + "|" + algorithm_id + "|" + sender + "|" + lowercase_hex(public_key)
```

La transaction d'enregistrement elle-même est signée uniquement avec la clé
classique. Une clé publique dont la partie `t1` (octets 32 et suivants) est
entièrement nulle est refusée, car ses signatures peuvent être falsifiées.

## Autres voies {#other-lanes}

- Voie EVM : les transactions Ethereum n'ont pas de champ pour une extension ; elles
  ne portent donc aucune signature ML-DSA-87. Un compte doté d'une clé ML-DSA-87
  enregistrée peut ouvrir, depuis la voie native, une fenêtre d'autorisation EVM
  bornée (hauteur d'expiration, nombre maximal de transactions, valeur maximale).
  Voir [Portefeuilles EVM : mode prêt pour le post-quantique](/qoresign/guides/evm-quantum-ready).
- Voie SVM : pas encore ouverte sur le réseau.

## Vecteurs de test {#test-vectors}

`vectors/qoresign-v1.json`, champ `hybridTx`, fournit un corps, des informations
d'authentification et un numéro de compte avec les sign-bytes attendus, les
signatures, le corps final et le `TxRaw` pour les deux versions. Voir
[Vecteurs de test](/qoresign/vectors).
