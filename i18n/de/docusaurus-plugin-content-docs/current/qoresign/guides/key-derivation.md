---
slug: /qoresign/guides/key-derivation
title: Schlüsselableitung
sidebar_label: Schlüsselableitung
sidebar_position: 4
---

# Schlüsselableitung

QoreSign bietet zwei Wege, aus einer BIP-39-Mnemonic einen ML-DSA-87-Schlüssel
zu erhalten. Vollständige Definitionen:
[ML-DSA-87-Schlüsselableitung](/qoresign/spec/hd-derivation-draft).

| | `deriveCanonicalPqKey` | `deriveHdPqKey` (Entwurf) |
|---|---|---|
| Eingabe | Mnemonic + Kontoadresse | Mnemonic (oder Seed) + gehärteter Pfad |
| An die Adresse gebunden | ja | nein |
| Gleicher Schlüssel wie bei QoreChain-Wallets | ja | nein |
| Registrierung on-chain nötig | nur, wenn noch nicht registriert | immer |
| Stabilität | stabil | kann sich ändern, bevor er final ist |

Verwenden Sie die [kanonische Ableitung](/qoresign/spec/hd-derivation-draft#canonical-derivation),
es sei denn, Sie benötigen mehrere Post-Quanten-Schlüssel pro Seed, die von
Adressen unabhängig sind (der [hierarchische Entwurf](/qoresign/spec/hd-derivation-draft#hierarchical-derivation)).

## Form der Mnemonic {#mnemonic-form}

Die Mnemonic muss in kanonischer Form vorliegen (Wörter in Kleinbuchstaben,
einzelne Leerzeichen). QoreSign lehnt andere Schreibweisen ab, statt sie zu
normalisieren, weil die Phrase Teil der Ableitungseingabe ist und eine andere
Schreibweise einen anderen Schlüssel ergäbe.

## Wallets ohne Mnemonic {#without-mnemonic}

Wallets, die die Mnemonic nicht besitzen (zum Beispiel Schlüssel in Hardware),
können die kanonische Ableitung nicht verwenden. Sie können mit
`pqKeyFromSeed(randomBytes(32))` einen zufälligen ML-DSA-87-Schlüssel erzeugen
oder den HD-Entwurf nutzen und diesen Schlüssel registrieren.
