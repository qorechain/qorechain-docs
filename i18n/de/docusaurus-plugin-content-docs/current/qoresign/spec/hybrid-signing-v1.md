---
slug: /qoresign/spec/hybrid-signing-v1
title: Hybrides Signieren von Transaktionen v1
sidebar_label: Hybrides Signieren v1
sidebar_position: 1
---

# Hybrides Signieren von Transaktionen auf QoreChain, Version 1

Status: stabil. Gilt für die native Lane (Cosmos SDK) von `qorechain-vladi`
(Mainnet) und `qorechain-diana` (Testnet). Quelle:
[`spec/hybrid-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/hybrid-signing-v1.md).

## Zusammenfassung {#summary}

Eine hybride Transaktion ist ein gewöhnliches `TxRaw` des Cosmos SDK, das vom
selben Konto zweimal signiert wird:

1. eine ML-DSA-87-Signatur (FIPS 204), die im Transaktions-Body als
   Erweiterungsoption `/qorechain.pqc.v1.PQCHybridSignature` transportiert wird;
2. eine secp256k1-Signatur im Modus `SIGN_MODE_DIRECT` über den finalen Body, in
   `TxRaw.signatures`.

Das Netzwerk prüft beide. Auf der nativen Lane verlangt das Netzwerk standardmäßig
die ML-DSA-87-Signatur (`HybridSignatureMode = Required`, ein chainweiter
Parameter); abgesehen von einer kleinen Menge ausgenommener Nachrichten, etwa
solcher, die den ML-DSA-87-Schlüssel des Kontos registrieren oder pflegen, wird
eine Transaktion ohne sie abgelehnt.

## Schlüssel {#keys}

| Schlüssel | Algorithmus | Größe |
|---|---|---|
| Klassisch | secp256k1 (`secp256k1`-Konten: Adresse = RIPEMD160(SHA256(komprimierter Schlüssel)); `eth_secp256k1`-Konten: Adresse = letzte 20 Bytes von KECCAK256(unkomprimierter Schlüssel)) | 33-Byte-komprimierter Public Key |
| Post-Quanten | ML-DSA-87, Algorithmus-ID `1` | Public Key 2592 Bytes, Signatur 4627 Bytes |

Der ML-DSA-87-Public-Key muss mit `MsgRegisterPQCKeyV2` für das Konto registriert
sein, bevor sich hybride Transaktionen verifizieren lassen (siehe
[Registrierung](#registration)). Eine Transaktion kann den Public Key stattdessen
in der Erweiterung (Feld 3) einbetten, um ihn bei der ersten Verwendung zu
registrieren.

## Die Erweiterung {#extension}

```protobuf
package qorechain.pqc.v1;

message PQCHybridSignature {
  uint32 algorithm_id   = 1; // 1 = ML-DSA-87
  bytes  pqc_signature  = 2; // 4627 bytes
  bytes  pqc_public_key = 3; // optional, 2592 bytes
}
```

Sie wird zu `TxBody.extension_options` (Feld 1023) als `google.protobuf.Any` mit
`type_url = "/qorechain.pqc.v1.PQCHybridSignature"` und der Protobuf-Kodierung als
`value` hinzugefügt. Ein Body muss genau eine solche Erweiterung tragen.

## Sign-Bytes {#sign-bytes}

`B0` sei die kanonische Protobuf-Kodierung des `TxBody` **ohne** die
PQC-Erweiterung (alle anderen Felder und Erweiterungen bleiben erhalten, in
derselben Reihenfolge) und `A` die `AuthInfo`-Bytes genau so, wie sie gesendet
werden. `BE32`/`BE64` sind Längen als vorzeichenlose Big-Endian-Werte.

```
v1 = BE32(len(B0)) || B0 || BE32(len(A)) || A
v2 = "qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id || v1
```

Ein Netzwerk prüft bei einer gegebenen Höhe genau eine Form. Beide öffentlichen
Netzwerke prüfen `v2` seit ihren Upgrades `v3.1.98` / `v3.2.0` (Mainnet: `v3.2.0`
bei Höhe 2.981.742); jedes andere Netzwerk prüft `v2` ab Genesis. `v1` wird nur
benötigt, um Signaturen zu reproduzieren, die vor diesen Höhen erstellt wurden.
Ein Client kann einen Node fragen, welche Form er prüft, indem er
`/cosmos/upgrade/v1beta1/applied_plan/{v3.1.98|v3.2.0}` liest.

Die ML-DSA-87-Signatur ist `ML-DSA.Sign(sk, signBytes, ctx = "")`. Das Netzwerk
akzeptiert sowohl die deterministische als auch die „hedged“-Variante; QoreSign
signiert standardmäßig deterministisch (FIPS 204, `rnd` = 32 Null-Bytes), damit
Signaturen gegen die veröffentlichten Vektoren reproduzierbar sind.

## Reihenfolge der Schritte {#order-of-operations}

1. `B0` und `A` kodieren (Gebühr, Gaslimit und Signer-Info stehen an diesem
   Punkt fest).
2. Die Sign-Bytes und die ML-DSA-87-Signatur berechnen.
3. Die Erweiterung in kanonischer Feldreihenfolge an `B0` anhängen (nach den
   vorhandenen `extension_options`, vor `non_critical_extension_options`); das
   ergibt den finalen Body `B`.
4. `SignDoc { body_bytes = B, auth_info_bytes = A, chain_id, account_number }`
   mit secp256k1 signieren: SHA-256 für `secp256k1`-Konten, KECCAK-256 für
   `eth_secp256k1`-Konten; 64 Bytes `r || s`, Low-S.
5. `TxRaw { B, A, [klassische Signatur] }` senden.

Die klassische Signatur deckt die Erweiterung ab; die ML-DSA-87-Signatur deckt
alles andere im Body und in der Auth-Info ab, einschließlich der Gebühr. Keine der
beiden Signaturen signiert sich selbst.

## Registrierung {#registration}

`MsgRegisterPQCKeyV2` (Type-URL `/qorechain.pqc.v1.MsgRegisterPQCKeyV2`):

| Feld | Nummer | Wert |
|---|---|---|
| `sender` | 1 | das `qor1`-Konto |
| `public_key` | 2 | ML-DSA-87-Public-Key |
| `algorithm_id` | 3 | `1` |
| `ecdsa_pubkey` | 4 | der 33-Byte-komprimierte secp256k1-Schlüssel des Kontos; er muss zu `sender` ableiten |
| `key_type` | 5 | `hybrid` |
| `proof_of_possession` | 6 | ML-DSA-87-Signatur über die untenstehende Nachricht |

```
"qorechain-pqc-pop-v1|" + chain_id + "|" + algorithm_id + "|" + sender + "|" + lowercase_hex(public_key)
```

Die Registrierungstransaktion selbst wird nur mit dem klassischen Schlüssel
signiert. Ein Public Key, dessen `t1`-Teil (ab Byte 32) vollständig null ist, wird
abgelehnt, weil sich seine Signaturen fälschen lassen.

## Andere Lanes {#other-lanes}

- EVM-Lane: Ethereum-Transaktionen haben kein Feld für eine Erweiterung, daher
  tragen sie keine ML-DSA-87-Signatur. Ein Konto mit registriertem
  ML-DSA-87-Schlüssel kann von der nativen Lane aus ein begrenztes
  EVM-Autorisierungsfenster öffnen (Ablaufhöhe, maximale Transaktionen,
  maximaler Wert). Siehe
  [EVM-Wallets: Autorisierungsfenster](/qoresign/guides/evm-quantum-ready).
- SVM-Lane: im Netzwerk noch nicht geöffnet.

## Testvektoren {#test-vectors}

`vectors/qoresign-v1.json`, Feld `hybridTx`, liefert einen Body, Auth-Info und
eine Kontonummer mit den erwarteten Sign-Bytes, Signaturen, dem finalen Body und
dem `TxRaw` für beide Versionen. Siehe [Testvektoren](/qoresign/vectors).
