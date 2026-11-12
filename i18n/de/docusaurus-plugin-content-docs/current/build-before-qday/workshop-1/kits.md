---
slug: /build-before-qday/workshop-1/kits
title: Die QoreChain-Kits
sidebar_label: Kits
sidebar_position: 10
---

# Die QoreChain-Kits

Der QoreChain-Entwickler-Stack besteht aus vierzehn Kits. Diese Seite nennt jedes in einer Zeile, mit Version und Veröffentlichungsort, und endet mit sechs Ideen, die Sie daraus bauen könnten. Zwölf Kits sind verfügbar. Zwei werden nicht ausgeliefert: Das Asset-Kit ist ein Vorschlag, und der PQ-Light-Client ist eine Spezifikation.

## Innovationen {#innovations}

- **Hybride Signierung mit ML-DSA-87 + secp256k1 ist im SDK, in den Wallets und in QoreSign eingebaut**, sodass eine App die Post-Quanten-Signierung nicht selbst implementieren muss.
- **Eine hybrid signierte Transaktion, On-Chain verifiziert**, ist der gemeinsame Nachweis über alle Apps hinweg: siehe den [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter), das [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) und den [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector).
- **Dieselbe Form in vielen Sprachen.** Das SDK, QoreSign und die PQC-Bibliothek erscheinen in mehreren Sprachen und werden gegen gemeinsame Testvektoren geprüft.

## Apps bauen {#build-apps}

| Kit | Was es tut | Version und Registry |
| --- | --- | --- |
| [QoreChain SDK](/sdk/overview) | Ein Client für die Lanes Native, EVM und SVM mit hybrider Signierung, PQC-Schlüsselregistrierung, EVM-Fenster-Helfern, Staking-Stufen, Tokenomics, AMM, Cross-VM-Aufrufen und Rollups. TypeScript, Python, Rust, Java und Go. | 0.13.0: npm, PyPI, crates.io, Maven Central, Go |
| [create-qorechain-dapp](/developer-tools/scaffolders-and-cli) | Erzeugt mit einem Befehl ein lauffähiges Projekt aus sieben Vorlagen: hardhat, foundry, viem-wagmi, fullstack-web, evm-solidity, cosmwasm und rollup-app. | 0.13.1: npm |
| [RDK, das Rollup Development Kit](/rollups/overview) | Anwendungsspezifische Rollups erstellen, starten und betreiben, die auf QoreChain abwickeln, mit signierten Settlement-Batches, Auszahlungen und Lesezugriff auf Data Availability. | `@qorechain/rdk` 0.8.0, fünf Sprachen |

```sh
npm i @qorechain/sdk @qorechain/evm
npx create-qorechain-dapp my-app -t hardhat --network testnet
```

## Wallets und Signierung {#wallets-signing}

| Kit | Was es tut | Version und Registry |
| --- | --- | --- |
| [QoreX und qorex-integrations](/developer-tools/qorex-integrations) | Die offizielle Wallet hält beide Schlüssel, signiert hybrid und zeigt, was Sie signieren. Die Integrationen bringen QoreX in RainbowKit und wagmi, cosmos-kit und Interchain Kit, mit Typen, einer Mock-Wallet und Playwright-Fixtures. Siehe auch den [QoreX-Überblick](/qorex/overview). | QoreX 1.2.3 (iOS, Android), Erweiterung 0.4.2 (Chrome, Firefox), `@qorechain/qorex-rainbowkit` 0.1.0 |
| [Wallet Adapter](/developer-tools/wallet-adapter) | Fügt QoreChain zu Wallets hinzu, die Menschen schon nutzen (Keplr, Leap, Cosmostation, MetaMask, Phantom), einschließlich der hybriden ML-DSA-87-Signatur, die die Chain verlangt. | `@qorechain/wallet-adapter` 0.5.0 |
| [QoreSign](/qoresign/overview) | Hybride Signierung für andere Wallets und Backends als QoreX: den ML-DSA-Schlüssel ableiten, Transaktionen der Native Lane mit beiden Schlüsseln signieren, hybride Signaturen lokal verifizieren, vor dem Signieren simulieren und Sign In With QoreChain. | 0.2.0: TypeScript, Rust, Go, Swift, Kotlin |
| [QoreChain PQC](/developer-tools/pqc-library) | Die Post-Quanten-Primitive unter allem anderen: ML-DSA (FIPS 204), ML-KEM (FIPS 203) und SHAKE-256, byte-kompatibel über Sprachen hinweg und gegen gemeinsame Testvektoren geprüft. | `@qorechain/pqc` 0.2.3, sechs Sprachen |

```sh
npm i @qorechain/qorex-rainbowkit @qorechain/qorex-types
npm i @qorechain/wallet-adapter
npm i @qorechain/qoresign
npm i @qorechain/pqc
```

## Daten und Datenschutz {#data-privacy}

| Kit | Was es tut | Version und Registry |
| --- | --- | --- |
| [QoreSeal](/developer-tools/qoreseal) | Daten an QoreChain-Konten verschlüsseln mit ML-KEM-1024 (standardmäßig hybrid mit X25519). Ein Konto veröffentlicht seinen Schlüssel on-chain, und jeder kann an dieses Konto verschlüsseln. Mehrere Empfänger, Auditor-Schlüssel und rotierende Gruppenschlüssel. | 0.1.0: TypeScript, Rust, Go, Swift, Kotlin, Python |
| [QoreChain MCP](/developer-tools/mcp) | Ein Model-Context-Protocol-Server und Kommandozeilenwerkzeug, das kompatiblen Entwicklerwerkzeugen Lesezugriff auf QoreChain gibt: Blöcke, Transaktionen, Konten, Validatoren, Staking-Stufen, Status der hybriden Signatur, Contract-Lesezugriffe und Gebührenschätzungen. Er signiert nie, hält nie Schlüssel und sendet nie. | `@qorechain/mcp` 0.1.0 |

```sh
npm i @qorechain/qoreseal
npx -y @qorechain/mcp
```

## Infrastruktur und Compliance {#infra-compliance}

| Kit | Was es tut | Version und Registry |
| --- | --- | --- |
| [QORel](/qorel/overview) | Ein IBC-Relayer, ein Fork von Hermes, mit einer steckbaren Signer-Schicht, damit auch Chains relayed werden können, die auf jeder Transaktion eine Post-Quanten-Signatur verlangen. Standard-Chains behalten das exakte Hermes-Format. | 0.1.0: GitHub, Container-Image, Homebrew |
| [Custody-Kit](/developer-tools/custody-kit) | Für Verwahrer: was jede Lane verlangt, Adressvalidierung, Einzahlungserkennung, Signieren und Verifizieren von Auszahlungen, Staking und Verwaltung des ML-DSA-87-Schlüssels, mit Testvektoren und Referenzcode. | 0.1.0: TypeScript, Python, Go, Rust, Java |
| [QoreScan](/developer-tools/qorescan) | Inventarisiert die Kryptografie eines Deployments (Node-Konfiguration, Schlüssel nach Typ, TLS-Endpunkte, Solidity-Quellen, Chain-Zustand) und exportiert ein CycloneDX-1.6-CBOM, mit Ausgaben, die auf FINMA-Aufsichtsmitteilung 05/2026, die EU-PQC-Roadmap und DORA abgebildet sind. Eine Inventarisierungshilfe, keine Zertifizierung. | `@qorechain/qorescan` 0.1.0 |
| [Asset-Kit](/developer-tools/asset-kit) | **Vorschlag, als Ganzes nicht ausgeliefert.** Werkzeuge für regulierte tokenisierte Assets: ERC-3643- und CMTAT-Adapter mit einer Post-Quanten-Halterprüfung, ERC-4626- und ERC-7540-Vaults, eine Emittenten-Konsole und Clients. Die EVM-Contracts sind verfügbar, die nativen Asset-Module sind ein Vorschlag. | 0.1.0 |
| [PQ-Light-Client](/developer-tools/pq-light-client) | **Spezifikation, nicht ausgeliefert.** Ein Light Client, der ML-DSA-87-signierten Checkpoints folgt. QoreChain erzeugt diese Checkpoints heute nicht. Das Repository enthält die Spezifikation und Referenz-Verifizierer (Go, Rust, TypeScript), damit das Design geprüft werden kann. | 0.1.0 (Spezifikation) |

```sh
brew install qorechain/tap/qorel
npx @qorechain/qorescan --help
```

## Sechs Dinge, die Sie bauen könnten {#ideas}

| Idee | Gebaut aus | Was es ist |
| --- | --- | --- |
| Quantensicherer Checkout | SDK, QoreX | Ein Button "Mit QOR bezahlen" für einen Webshop, bei dem jede Zahlung hybrid signiert ist. |
| Hackathon-Starter | create-qorechain-dapp | Von null zu einem bereitgestellten Contract auf dem Testnet in zehn Minuten, ein Befehl pro Teilnehmer. |
| Sign In With QoreChain | QoreSign | Passwortloser Login für eine Web-App, mit auf Ihrem Server geprüfter hybrider Signatur. |
| Sealed-Bid-Auktion | QoreSeal | Gebote bleiben bis zur Aufdeckung verschlüsselt. |
| PQC-Readiness-Inventar | QoreScan | Ein Kryptografie-Inventar und eine CBOM-Datei für ein Fintech-Team und seine Prüfer. |
| Eigenen Kanal relayen | QORel | Relayen zwischen dem QoreChain-Testnet und einer anderen Cosmos-Testnet-Chain. |

## Den Code holen {#get-the-code}

Jedes Kit hat seine eigene Handbuchseite, oben verlinkt. Die Beispiel-Apps dieses Workshops liegen im öffentlichen Repository [qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), und jede App-Seite führt vom ersten bis zum letzten Befehl hindurch:

```sh
git clone https://github.com/qorechain/build-before-qday
```
