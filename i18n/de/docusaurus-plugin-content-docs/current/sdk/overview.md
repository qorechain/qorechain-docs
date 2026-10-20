---
slug: /sdk/overview
title: QoreChain SDK – Überblick
sidebar_label: Überblick
sidebar_position: 1
---

# QoreChain SDK

Das QoreChain SDK ist das offizielle, mehrsprachige Entwickler-Kit zum Erstellen
dezentraler Anwendungen auf **QoreChain** — einem quantensicheren
Layer-1-Netzwerk mit drei virtuellen Maschinen.

Diese Dokumentation beschreibt, wie Sie das SDK installieren, sich mit dem
Netzwerk verbinden, On-Chain-Zustand lesen, Konten ableiten, Transaktionen
signieren und senden und mit jeder der virtuellen Maschinen von QoreChain
arbeiten.

## Was ist QoreChain?

QoreChain ist eine Layer-1-Blockchain mit drei vollwertigen
Smart-Contract-Laufzeitumgebungen auf einer einzigen Chain:

- **QoreChain Native** — Wasm-Smart-Contracts über das Cosmos SDK (die CosmWasm-Runtime).
- **QoreChain EVM Engine** — Ethereum-kompatible Ausführung (Solidity, viem,
  Standard-JSON-RPC).
- **SVM** — eine Solana-kompatible Laufzeitumgebung mit einem JSON-RPC im
  Solana-Stil.

Konten, Guthaben und Token werden über die Laufzeitumgebungen hinweg geteilt,
und die Chain enthält das IBC-Modul für Cross-Chain-Interoperabilität (im
Mainnet und im Testnet sind noch keine IBC-Channels geöffnet).

:::note Was heute auf den Live-Netzwerken funktioniert (Mainnet v3.2.3, ab Höhe 3.742.566 v3.2.4; Testnet v3.2.4)
**Funktioniert:** Lesezugriffe auf jeder Lane, hybrid-signierte Native-Transaktionen,
vereinheitlichte Konten, EVM-Transaktionen innerhalb eines
[Autorisierungsfensters](/sdk/guides/evm#evm-window) und SVM-Lesezugriffe.
**Noch nicht verfügbar:** die EVM-Precompiles (inaktiv), der `qor_`-JSON-RPC-Namespace,
SVM-Transaktionen, Cross-VM-Aufrufe im Mainnet (`MsgCrossVMCall` ist durch den
Circuit Breaker abgeschaltet), QoreChain Native-Upload und -Instanziierung für normale
Konten, die Authenticator-/Abstract-Account-Abläufe (Modul abgeschaltet), xQORE
und Gas-Abstraktion. Jeder Leitfaden wiederholt den Vorbehalt dort, wo er zutrifft.

Das veröffentlichte SDK (0.9.0, 21. Oktober 2026) signiert in der Form, die beide
Netzwerke verifizieren (v2-Hybrid-Sign-Bytes, aus dem Chain-Zustand aufgelöst),
und das Signaturformat, die Adressen, Dezimalstellen, Memos und Gebühren haben
sich in v3.2.3 oder v3.2.4 nicht geändert (das Mainnet läuft ab Höhe 3.742.566 mit v3.2.4). Es enthält die Client-Seite der
späteren Post-Quanten-Regeln (den Besitznachweis bei der Schlüsselregistrierung,
EVM-Fenster mit Gültigkeitsbereich, EIP-7702-Einwilligungsnachrichten); Versionen
vor 0.9.0 tun das nicht, siehe [Versionen vor 0.9.0](/sdk/install#before-090).
:::

### Quantensicher von Grund auf

QoreChain stellt Post-Quanten-Kryptografie-Primitive (PQC) auf Basis von
**ML-DSA-87** (Dilithium-5, FIPS 204) bereit. Neben klassischem
secp256k1-Signieren unterstützt die Chain eine **hybride** Signatur-Strategie,
bei der eine Transaktion *sowohl* eine klassische Signatur als auch eine
Post-Quanten-Signatur trägt — sie bleibt damit heute unter klassischer
Verifikation gültig und erhält zugleich Post-Quanten-Schutz.

Das SDK stellt bereits heute ML-DSA-87-Schlüsselerzeugung, -Signierung und
-Verifikation bereit, dazu die Bausteine für hybride Transaktionen. Auf den
Live-Netzwerken **muss** eine Transaktion auf dem Native-Pfad hybrid signiert
sein, und der ML-DSA-87-Schlüssel des Kontos muss zuvor registriert werden. Details
finden Sie unter [Konten & PQC-Signierung](/sdk/concepts/accounts-pqc). Keine
Marketing-Versprechen — das SDK stellt exakt die Primitive bereit, die die
Chain implementiert.

## Was dieses SDK besonders macht

Über die vollständige Multi-Chain-Parität hinaus sind drei Fähigkeiten **nur
auf QoreChain möglich**, weil sie auf Protokollfunktionen aufbauen, die keine
andere Layer 1 besitzt:

- **KI-Preflight-Risikobewertung** — prüfen Sie eine Transaktion mit
  On-Chain-KI, bevor Sie sie broadcasten. `simulateWithRiskScore` liefert Gas
  plus ein Risiko-/Anomalie-Urteil aus deterministischen EVM-Precompiles,
  sodass eine Wallet oder dApp *vor* dem Signieren warnen (oder blockieren)
  kann. Die Precompiles sind im Mainnet und im Testnet noch nicht aktiv. Siehe
  [KI-Preflight](/sdk/guides/ai-preflight).
- **Vereinheitlichte Cross-VM-Aufrufe** — ein Konto, drei VMs, eine
  Transaktion. `createCrossVMClient` ruft einen Contract auf jeder beliebigen
  VM auf, und `callAtomic` bündelt mehrere Cross-VM-Aufrufe in einer einzigen,
  einmal signierten atomaren Transaktion. Siehe
  [Cross-VM-Aufrufe](/sdk/guides/cross-vm).
- **Quantensichere DX** — machen Sie einen Signer mit einem einzigen
  idempotenten Aufruf post-quanten-geschützt (`ensurePqcRegistered` /
  `migrateToHybrid`), inklusive eines Drop-in-React-Badges. Siehe
  [Quantensicher](/sdk/guides/quantum-safe).

Zwei weitere Fähigkeiten auf Chain-Ebene kamen mit 0.6.0 und 0.7.0 hinzu (die
zweite ist auf den Live-Netzwerken noch nicht nutzbar, siehe unten):

- **Vereinheitlichte eth-native Konten** — ein `eth_secp256k1`-Schlüssel ist
  eine 20-Byte-Identität, dargestellt als `qor1…`, `0x…` und eine
  SVM-Base58-Adresse, die alle ein gemeinsames Guthaben teilen. Siehe
  [Vereinheitlichte Konten](/sdk/concepts/accounts-pqc#unified-accounts).
- **Authenticator-Lanes** — verknüpfen Sie einen Phantom- oder
  MetaMask-Schlüssel mit dem kanonischen PQC-pflichtigen Konto und lassen Sie
  ihn über einen Relayer ausgeben — nach dem Least-Privilege-Prinzip, mit
  Ausgabenlimits und jederzeit widerrufbar. Das dahinterliegende
  `abstractaccount`-Modul ist heute auf beiden Netzwerken abgeschaltet. Siehe
  [Authenticators & delegiertes Ausgeben](/sdk/guides/authenticators).

Ein neues **`@qorechain/react`**-Kit (Provider, Hooks, `ConnectButton`,
`QuantumSafeBadge`) macht den Bau einer quantensicheren dApp zum Standardweg —
siehe den [React-Kit-Guide](/sdk/guides/react). Die vollständige Argumentation
finden Sie unter [Warum QoreChain SDK](/sdk/why).

## Die SDK-Familie

Das SDK erscheint als Paketfamilie, sodass Sie in der Sprache Ihrer Wahl
entwickeln können. Alle Pakete teilen dieselben Netzwerk-Presets,
Ableitungsschemata, Denominations-Arithmetik und Lese-Schnittstellen.

| Paket | Sprache | Installation | Status |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Veröffentlicht (npm, v0.9.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (Import `qorsdk`) | Veröffentlicht (PyPI, v0.9.0) |
| `qorechain-sdk` (Go-Modul) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Veröffentlicht (Go-Proxy, Tag `packages/go/v0.9.0`) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` (Import `qorechain`) | Veröffentlicht (crates.io, v0.9.0) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.9.1` | Veröffentlicht (Maven Central, v0.9.1; die anderen Sprachen sind 0.9.0) |
| `@qorechain/evm` | TypeScript (EVM-Adapter) | `npm i @qorechain/evm viem` | Veröffentlicht (npm, v0.8.0) |
| `@qorechain/svm` | TypeScript (SVM-Adapter) | `npm i @qorechain/svm @solana/web3.js` | Veröffentlicht (npm, v0.8.0) |
| `@qorechain/react` | TypeScript (React-Kit) | `npm i @qorechain/react` | Veröffentlicht (npm, v0.9.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Veröffentlicht (npm, v0.9.0) |

> Die Python-Distribution wird als `qorechain-sdk` installiert, aber **als
> `qorsdk` importiert**. Alle Clients sind in ihren Registries veröffentlicht —
> die Befehle pro Sprache finden Sie unter [Installation](/sdk/install).

Der TypeScript-Kern (`@qorechain/sdk`) ist die Grundlage für die Beispiele in
dieser Dokumentation. Die Python-, Go-, Rust- und Java-Clients erreichen
**vollständige Native-Chain-Parität** mit TypeScript: Netzwerk-Presets,
Denom-/Adress-Utilities, HD-Kontoableitung (Native/EVM/SVM), PQC-Signierung
(ML-DSA-87), typisierte Message-Composer für jedes Custom-Modul sowie die
Standard-Cosmos-Module, typisierte Query-Clients, den kompletten
Transaktionslebenszyklus (Auto-Gas, Fehlerdecodierung, Tx-Tracking,
Block-/Tx-Suche), hybride Post-Quanten-Transaktionen und
WebSocket-Subscriptions. Alle diese Clients sind **veröffentlicht**: TypeScript
auf npm (`@qorechain/sdk` 0.9.0), Python auf PyPI (`qorechain-sdk` 0.9.0,
Import `qorsdk`), Go auf dem Modul-Proxy (Tag `packages/go/v0.9.0`), Rust auf
crates.io (`qorechain-sdk` 0.9.0) und Java auf Maven Central
(`io.github.qorechain:qorechain-sdk` 0.9.1, ein reines Java-Update; die anderen Clients sind 0.9.0). Die
EVM-/SVM-Ausführungsadapter (`@qorechain/evm`, `@qorechain/svm`, beide 0.8.0),
das `@qorechain/react`-Kit (0.9.0) und die
`create-qorechain-dapp`-Scaffolding-CLI (0.9.0) sind reine TypeScript-Pakete
und ebenfalls auf npm veröffentlicht. Die Begleitpakete finden Sie unter
[Installation](/sdk/install#related-packages).

## Neu in 0.6, 0.7, 0.8 und 0.9

**0.6.0 — vereinheitlichte eth-native Konten (Chain v3.1.83).** Ein
`eth_secp256k1`-Schlüssel ist eine 20-Byte-Identität, dargestellt in allen drei
Adresskodierungen, mit einem gemeinsamen ausgabefähigen Guthaben auf jeder
Lane:

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"   (bech32, Native lane)
account.evm;    // "0x…"     (EIP-55, EVM lane)
account.svm;    // base58    (20 bytes + 12 zero bytes)
```

Native-Lane-Signierung mit demselben Schlüssel erfolgt über `signClassicalEth`
/ `signHybridEth`, und ein Phantom- oder MetaMask-Schlüssel wird als Authenticator mit dem Konto
verknüpft (die Ableitung aus einer Phantom-Signatur wurde in 0.8.0 entfernt). Das
Legacy-`deriveNativeAccount` mit Coin-Type 118 bleibt unverändert. Siehe
[Vereinheitlichte Konten](/sdk/concepts/accounts-pqc#unified-accounts).

**0.6.1 — konsenskritischer Fix.** Die `PQCHybridSignature`-Tx-Body-Extension
wird jetzt protobuf-kodiert (zuvor war sie JSON-kodiert und wurde bei CheckTx
abgelehnt). Hybride Transaktionen, die mit SDK ≤ 0.6.0 gebaut wurden, werden
**on-chain abgelehnt** — bitte upgraden.

**0.7.0 — Authenticator-Lanes (Chain v3.1.85).** Das dahinterliegende
`abstractaccount`-Modul ist derzeit auf beiden Netzwerken abgeschaltet (siehe den
[Authenticators-Guide](/sdk/guides/authenticators)). Ein verknüpfter Phantom-
(ed25519) oder MetaMask-Schlüssel (secp256k1, über die 20-Byte-Adresse) kann
über einen Relayer vom kanonischen PQC-pflichtigen Konto ausgeben — nach dem
Least-Privilege-Prinzip, mit Ausgabenlimits und widerrufbar: Composer für
`MsgExecuteEVM` / `MsgExecuteCosmos` / `MsgRotatePQCKey`, byte-exakte Helfer
`evmAuthSignBytes` / `cosmosAuthSignBytes` / `rotationSignBytes`, die
`permissionSchema`-Query, decodierte Fehlercodes und TypeScript-Wallet-Builder
(`buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm`, …). Vollständiger
Walkthrough mit kopierbaren Beispielen:
[Authenticators & delegiertes Ausgeben](/sdk/guides/authenticators).

**0.8.0 – 0.8.3 — v2-Hybrid-Sign-Bytes und das EVM-Autorisierungsfenster (Chain
v3.2.0).** Die Post-Quanten-Hälfte einer hybriden Transaktion wird jetzt in der
Form signiert, die das Zielnetzwerk verifiziert (v1 oder v2,
`signBytesVersion: "auto" | "v1" | "v2"`). Beide öffentlichen Netzwerke laufen
auf v2, daher ist SDK **0.8.1 oder neuer** erforderlich, um im Mainnet Transaktionen
zu senden (verwenden Sie 0.9.0). **0.8.2** ergänzt `openEvmWindowMsg`, `closeEvmWindowMsg`,
`fetchEvmWindow` und `classifyEvmWindowRejection` für das EVM-Lane-
[Autorisierungsfenster](/sdk/guides/evm#evm-window).
**0.8.0** hat die Wallet-Signatur-Kontohelfer entfernt (`connectPhantomUnified` und
`unifiedAccountFromPhantomSignature`, in 0.8.0 entfernt), wendet in jeder Sprache strikte
ML-DSA-87-Größenprüfungen an und ergänzt das `async`-Flag sowie zurückgegebene
Callee-Daten bei Cross-VM-Aufrufen. **0.8.3** behebt die Tx-Suche, Race Conditions
in React-Hooks, die Sequenzierung von Python-`migrate_to_hybrid` und die
adressformunabhängige kanonische PQC-Ableitung (`derivePqcCanonical`,
`canonicalAccount`). Siehe
[Upgrade-Hinweise](/sdk/install#upgrade).

**0.9.0 — Client-Unterstützung für Chain v3.2.2 und v3.2.3.** Der TypeScript-`TxClient`
signiert hybrid, wenn Sie das Schlüsselpaar des Kontos übergeben
(`client.connectTx(signer, { pqcKeypair })`), sodass `bankSend` und die Rollup-,
Multilayer- und Cross-VM-Clients des SDK auf den öffentlichen Netzwerken funktionieren.
`ensurePqcRegistered` prüft zuerst den registrierten Schlüssel über REST, verweigert die
Registrierung eines zweiten, anderen Schlüssels und hängt den Besitznachweis selbst an,
sobald das Netzwerk v3.2.3 angewendet hat. Neue Builder decken EVM-Fenster mit Gültigkeitsbereich
(`nativeOnly`, `allowedTargets`) und die EIP-7702-Einwilligungsnachrichten ab, und
`derivePqcCanonical(address, mnemonic)` liefert in jeder Sprache einen Schlüssel, den Sie aus
der Mnemonic wiederherstellen können. Die PQC-Konto-Route ist die Singular-Route
`/qorechain/pqc/v1/account/{address}`, Fehlschläge innerhalb eines Blocks behalten
ihren Codespace, und `create-qorechain-dapp` erzeugt Projekte auf dem aktuellen SDK. Siehe
[Was 0.9.0 neu bringt](/sdk/install#whats-new-090).

## Nächste Schritte

- [Warum QoreChain SDK](/sdk/why) — die fünf Fähigkeiten, die es nur auf
  QoreChain gibt.
- [Installation](/sdk/install) — Installationsanleitungen pro Sprache.
- [Quickstart](/sdk/quickstart) — verbinden, ein Guthaben lesen, einen Transfer
  senden.
- [Konzepte: Architektur](/sdk/concepts/architecture) — das Triple-VM-Modell.
- [Konzepte: Konten & PQC-Signierung](/sdk/concepts/accounts-pqc) — Schlüssel
  und Post-Quanten-Signierung.
- [Guides](/sdk/guides/evm) — How-tos pro VM.
- [Authenticators & delegiertes Ausgeben](/sdk/guides/authenticators) —
  verknüpfte Phantom-/MetaMask-Schlüssel, die über einen Relayer ausgeben.
- [Netzwerk- & Endpunkt-Referenz](/sdk/reference/network) — Chain-ID, Ports,
  Token.
- [Beispiele](/sdk/examples) — lauffähige, kopierbare Snippets.
- Die [Netzwerk- & Endpunkt-Referenz](/sdk/reference/network) ist außerdem
  unter [Netzwerke](/appendix/networks) verlinkt.
