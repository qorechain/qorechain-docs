---
slug: /qoresign/spec/hd-derivation-draft
title: ML-DSA-87-Schlüsselableitung
sidebar_label: Schlüsselableitung (HD-Entwurf)
sidebar_position: 4
---

# ML-DSA-87-Schlüsselableitung

Status: Die kanonische Ableitung ist stabil. Die hierarchische Ableitung ist ein
**Entwurf**: Implementierungen können sich ändern, bevor sie final wird, und mit
ihr abgeleitete Schlüssel müssen wie jeder andere Schlüssel on-chain registriert
werden. Quelle:
[`spec/hd-derivation-draft.md`](https://github.com/qorechain/qoresign/blob/main/spec/hd-derivation-draft.md).

## Kanonische Ableitung (stabil) {#canonical-derivation}

QoreChain-Wallets und das QoreChain SDK leiten pro Konto einen ML-DSA-87-Schlüssel
aus der BIP-39-Mnemonic und der Kontoadresse ab:

```
seed = SHAKE256( UTF-8( "qorechain:pqc:v1|" + bech32_address + "|" + mnemonic ), 32 bytes )
(pk, sk) = ML-DSA-87.KeyGen_internal(seed)
```

- `bech32_address` ist die `qor1`-Form des Kontos (eine `0x`-Adresse wird
  zuvor in dieselben 20 Bytes umgewandelt).
- `mnemonic` ist die Phrase in kanonischer Form: englische Wörter in
  Kleinbuchstaben, getrennt durch einzelne Leerzeichen, davor und danach nichts.
  Implementierungen müssen jede andere Schreibweise ablehnen, statt sie still zu
  normalisieren, weil ein anderer String einen anderen Schlüssel ergibt.
- Der Schlüssel ist an die Adresse gebunden: Dieselbe Mnemonic ergibt für jedes
  Konto einen anderen Schlüssel.

Eine Wallet, die diese Ableitung verwendet, signiert mit dem Schlüssel, der für
von QoreChain-Wallets erstellte Konten bereits registriert ist.

## Hierarchische Ableitung (Entwurf) {#hierarchical-derivation}

Für Wallets, die mehrere Post-Quanten-Schlüssel aus einem Seed benötigen, ohne
sie an eine Adresse zu binden. ML-DSA kennt keine öffentliche Kindableitung,
daher ist jedes Pfadsegment gehärtet.

Die Konstruktion ist SLIP-0010 mit einem eigenen Master-Key-String:

```
I  = HMAC-SHA512(key = "qorechain-mldsa87-seed", data = seed)
k  = I[0..32],  c = I[32..64]
for each index i (all >= 2^31):
    I = HMAC-SHA512(key = c, data = 0x00 || k || ser32(i))
    k = I[0..32],  c = I[32..64]
(pk, sk) = ML-DSA-87.KeyGen_internal(k)
```

- `seed` ist der 64-Byte-BIP-39-Seed (Mnemonic plus optionale Passphrase) oder
  ein beliebiger Seed mit 16 bis 64 Bytes.
- Der Standardpfad ist `m/44'/118'/{account}'/0'/0'`.
- Ein Pfad mit einem nicht gehärteten Segment wird abgelehnt.

Offene Punkte, bevor dies final wird: der im Pfad zu verwendende Coin-Type, das
Zusammenspiel mit der Schlüsselrotation on-chain (`MsgRotatePQCKey`) und die
Abstimmung mit anderen Ökosystemen, die Post-Quanten-Schlüssel aus einem Seed
ableiten.

## Testvektoren {#test-vectors}

`vectors/qoresign-v1.json`, Felder `canonical`, `hd` und `hdRejected`. Siehe
[Testvektoren](/qoresign/vectors).
