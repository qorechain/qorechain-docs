---
slug: /sdk/faq
title: FAQ & Fehlerbehebung
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ & Fehlerbehebung

## Ist das Mainnet live?

Ja. Das Mainnet ist **live** (Chain-ID `qorechain-vladi`). Die Testnet-Voreinstellung
(`qorechain-diana`) bleibt ebenfalls verfügbar. Beide Voreinstellungen liefern localhost-Endpunkt-Standardwerte;
wähle das Netzwerk mit `createClient({ network: "mainnet" })` und
überschreibe `endpoints` mit deinen Node-URLs. Siehe
[Netzwerk & Endpunkte](/sdk/reference/network).

## Warum landen meine Aufrufe bei localhost?

`createClient()` verwendet standardmäßig **localhost**-Endpunkte. Um mit einem echten Node zu
kommunizieren, übergib ein `endpoints`-Objekt:

```ts
const client = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    rpc: "https://rpc.testnet.example",
    evmRpc: "https://evm.testnet.example",
  },
});
```

Der Signierpfad (`connectTx`) benötigt den Konsens-**`rpc`**-Endpunkt; CosmWasm-Lesevorgänge
nutzen ihn ebenfalls. REST-Lesevorgänge verwenden `rest`; EVM- und `qor_`-Aufrufe verwenden `evmRpc`.

## "Cannot find module 'viem'" / "'@solana/web3.js'"

Dies sind **Peer-Abhängigkeiten** von `@qorechain/evm` bzw. `@qorechain/svm`.
Installiere sie in deinem Projekt:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Ein Precompile-Aufruf wirft "feature not present"

Die EVM-Precompiles existieren nur auf Nodes, die die QoreChain EVM Engine ausführen. Auf einem
einfachen EVM-Node scheitern diese Aufrufe. Wenn du heterogene Nodes ansprichst, umschließe jeden
Precompile-Aufruf und behandle den Fehler pro Aufruf.

## Meine Beträge sind um den Faktor Million daneben

QOR hat **10^6** Basis-`uqor`-Einheiten. Verwende `toBase` / `fromBase` und führe alle Berechnungen in
Basiseinheiten durch:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

Beachte, dass die EVM-Laufzeitumgebung QOR mit **18** Dezimalstellen darstellt (EVM-Konvention), was
sich von der Cosmos-`uqor`-Basis von 10^6 unterscheidet.

## Welche Pakete sind veröffentlicht, und wo?

Alle. Der TypeScript-Core (`@qorechain/sdk`) und die EVM/SVM-Adapter
(`@qorechain/evm`, `@qorechain/svm`) sind auf npm unter `0.3.0`; der Python-Client ist
auf PyPI (`pip install qorechain-sdk` unter `0.3.1`, Import `qorsdk`); der Rust-Client
ist auf crates.io (`cargo add qorechain-sdk` unter `0.3.0`); und der Go-Client
ist auf dem Modul-Proxy (`go get github.com/qorechain/qorechain-sdk/packages/go/...`).
Siehe [Installation](/sdk/install) für die vollständigen Befehle pro Sprache.

## Mein Mnemonic wird abgelehnt

Das SDK validiert sowohl die BIP-39-Wortliste **als auch** die Prüfsumme, bevor ein
Schlüssel abgeleitet wird, sodass eine vertippte Phrase eine Ausnahme auslöst, statt stillschweigend das falsche
Konto zu erzeugen. Überprüfe die Wörter erneut; verwende `validateMnemonic`, um eine Phrase zu testen.

## Hybride (PQC) Transaktionen

Lokales ML-DSA-87-Signieren/-Verifizieren und die hybriden Tx-Erstellungs-Helfer sind
heute verfügbar. Bevor eine hybride Tx on-chain PQC-verifiziert wird, muss der öffentliche
PQC-Schlüssel des Signierers registriert sein (`MsgRegisterPQCKey`), oder du musst
`includePqcPublicKey: true` setzen, um ihn zur automatischen Registrierung einzubetten. Die vollständige hybride
Einreichung wird gerade für das Live-Netzwerk finalisiert. Siehe
[Konten & PQC-Signierung](/sdk/concepts/accounts-pqc).
