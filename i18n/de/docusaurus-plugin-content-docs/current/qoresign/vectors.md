---
slug: /qoresign/vectors
title: QoreSign-Testvektoren
sidebar_label: Testvektoren
sidebar_position: 5
---

# Testvektoren

[`qoresign-v1.json`](https://github.com/qorechain/qoresign/blob/main/vectors/qoresign-v1.json)
wird aus der TypeScript-Implementierung erzeugt (`pnpm build && pnpm vectors`)
und von den Testsuiten für TypeScript, Rust, Go, Swift und Kotlin geprüft. Eine
Änderung an der Datei ist eine Änderung am Wire-Format: Legen Sie stattdessen
eine neue Datei mit einer neuen Version an, statt diese zu bearbeiten.

Jeder Schlüssel wird aus der öffentlichen BIP-39-Test-Mnemonic
(`abandon ... about`) abgeleitet. Senden Sie niemals Guthaben an diese Konten.

## Felder {#fields}

| Feld | Inhalt |
|---|---|
| `accounts` | klassische Schlüssel und Adressen für Konten vom Typ `secp256k1` (`m/44'/118'/0'/0/0`) und `eth_secp256k1` (`m/44'/60'/0'/0/0`) |
| `canonical` | kanonische ML-DSA-87-Public-Keys pro Adresse ([Schlüsselableitung](/qoresign/spec/hd-derivation-draft#canonical-derivation)) |
| `hd`, `hdRejected` | hierarchische Ableitung (Entwurf): Public Keys pro Pfad sowie Pfade, die abgelehnt werden müssen ([Schlüsselableitung](/qoresign/spec/hd-derivation-draft#hierarchical-derivation)) |
| `hybridTx` | ein `TxBody` und `AuthInfo`, Kontonummer und Chain-ID, mit den erwarteten Sign-Bytes, der ML-DSA-87-Signatur, dem finalen Body, der secp256k1-Signatur und dem `TxRaw` für die Sign-Bytes `v2` und `v1` ([hybrides Signieren](/qoresign/spec/hybrid-signing-v1)) |
| `proofOfPossession` | Nachricht und Signatur des Besitznachweises ([Registrierung](/qoresign/spec/hybrid-signing-v1#registration)) |
| `registerMessage` | kodierte `MsgRegisterPQCKeyV2` |
| `message` | Signieren beliebiger Nachrichten: Daten, ADR-36- und ML-DSA-87-Sign-Bytes, Signatur ([Nachrichtensignatur](/qoresign/spec/message-signing-v1)) |
| `siwq` | Anmeldefelder, gerenderte Nachricht, ADR-36- und ML-DSA-87-Sign-Bytes, Signatur sowie ein Zeitpunkt, zu dem sie sich verifizieren lässt ([Sign In With QoreChain](/qoresign/spec/siwq-v1)) |

## Kodierung {#encoding}

Alle Byte-Strings sind Hex in Kleinbuchstaben. ML-DSA-87-Signaturen sind
deterministisch (FIPS 204, `rnd` = 32 Null-Bytes); secp256k1-Signaturen
verwenden RFC 6979 und Low-S.
