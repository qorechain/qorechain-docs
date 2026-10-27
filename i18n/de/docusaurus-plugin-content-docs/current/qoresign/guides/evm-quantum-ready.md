---
slug: /qoresign/guides/evm-quantum-ready
title: "EVM-Wallets: Quantum-Ready-Modus"
sidebar_label: EVM-Quantum-Ready-Modus
sidebar_position: 3
---

# EVM-Wallets: Quantum-Ready-Modus

Ethereum-Transaktionen haben kein Feld, in dem eine zweite Signatur
mitreisen könnte, und das Netzwerk wendet seine PQC-Einstellung chainweit an,
nicht pro Lane. Eine Transaktion, die auf der EVM-Lane von QoreChain gesendet
wird, ist daher nur mit secp256k1 signiert, und QoreSign bietet keine hybride
EVM-Signatur an (`assertHybridLane("evm")` wirft `LANE_NOT_AVAILABLE`).

Stattdessen lässt das Netzwerk eine EVM-Transaktion nur zu, wenn ihr Absender
einen registrierten ML-DSA-87-Schlüssel und ein aktives **EVM-Autorisierungsfenster**
hat, das sie abdeckt. Das Fenster wird von der nativen Lane aus durch eine
hybrid signierte Transaktion geöffnet, sodass der Post-Quanten-Schlüssel
EVM-Aktivität im Voraus autorisiert („Quantum-Ready-Modus“).
Beide öffentlichen Netzwerke erzwingen dies (Protokollfunktion
`evm-pqc-authorisation-window`, abrufbar mit `fetchProtocolFeatures` im
[QoreChain SDK](/sdk/overview) oder unter `/qorechain/pqc/v1/protocol_features`).

## Schritte für ein EVM-Konto {#steps}

1. Registrieren Sie auf der nativen Lane einen ML-DSA-87-Schlüssel für das Konto
   (`buildRegisterPqKeyMessage`, siehe
   [Registrierung](/qoresign/spec/hybrid-signing-v1#registration)). Für ein
   `eth_secp256k1`-Konto haben dieselben 20 Adress-Bytes eine `qor1`-Form;
   verwenden Sie diese als `sender`.
2. Öffnen Sie ein Fenster mit einer hybrid signierten Transaktion der nativen
   Lane: eine Ablaufhöhe, eine maximale Anzahl von EVM-Transaktionen, ein
   maximaler Wert und optional die Verträge, die aufgerufen werden dürfen. Das
   QoreChain SDK enthält Composer für die Fensternachrichten.
3. Senden Sie EVM-Transaktionen aus jeder EIP-1193-Wallet, solange das Fenster
   offen ist. Außerhalb eines Fensters oder jenseits seiner Grenzen lehnt das
   Netzwerk sie ab, sodass der secp256k1-Schlüssel allein auf der EVM-Lane
   keinen Wert bewegen kann.

Wenn das Netzwerk PQC pro Lane für die EVM-Lane einführt, ergänzt QoreSign in
einer neuen Minor-Version einen hybriden EVM-Modus.

## MetaMask und andere EIP-1193-Wallets {#eip-1193-wallets}

MetaMask und andere EIP-1193-Wallets können `eth_sendTransaction` keine
ML-DSA-87-Signatur hinzufügen; für sie ist das Fenster, geöffnet von einer
Wallet, die den ML-DSA-87-Schlüssel hält, der verfügbare Weg.
