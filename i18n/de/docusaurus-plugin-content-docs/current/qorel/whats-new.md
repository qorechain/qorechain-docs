---
slug: /qorel/whats-new
title: Was ist neu in QORel
sidebar_label: Was ist neu
sidebar_position: 2
---

# Was ist neu in QORel

Diese Seite listet auf, was jede QORel-Version hinzufügt. Sie richtet sich an Betreiber, die entscheiden, ob sie von Hermes oder von einem früheren QORel wechseln, und sie nennt nur, was eine Version tut, als prüfbares Verhalten. QORel basiert auf Hermes 1.13.3 (Informal Systems, Apache-2.0); jede Änderung unten gilt zusätzlich zu dieser Basis. Alles, was nicht aufgeführt ist, verhält sich wie in Hermes.

## 0.1.0 {#v0-1-0}

Erste Version. Nur Testnet. Auf der [Release-Seite](https://github.com/qorechain/QORel/releases) liegen die Dateien.

### Innovationen {#innovations}

- **Hybrides Post-Quanten-Signieren für QoreChain.** Setzen Sie `signing = 'qorechain-hybrid'` auf einer Chain, und QORel hängt die ML-DSA-87-Signatur (`/qorechain.pqc.v1.PQCHybridSignature`) als einzige kritische Erweiterungsoption jeder Transaktion an und signiert dann den finalen Body mit secp256k1. Die Nachricht, die der Post-Quanten-Schlüssel signiert, sind die Sign-Bytes der Version 2, die beide QoreChain-Netzwerke prüfen. Statische `extension_options` lassen sich mit diesem Modus nicht kombinieren, und die Konfiguration wird abgelehnt, wenn sie vorhanden sind.
- **Das Standard-Signieren bleibt unverändert.** Mit `signing = 'standard'` (Standardwert) ist das Transaktionsformat Byte für Byte das von Hermes, für den Cosmos Hub, Osmosis und jede andere Cosmos-SDK-Chain.
- **Das Crate `qorel-signer`.** Das Post-Quanten-Primitiv (`PqSigner`, mit `MlDsa87Signer`), die Regeln der Chain (`SignBytesFramer`) und der Erweiterungs-Signer, den der Relayer aufruft (`TxExtensionSigner`), sind getrennte Schnittstellen. Gas-Simulation und Batch-Dimensionierung laufen über denselben Pfad, sodass die zusätzlichen rund 4,7 KB und das Prüf-Gas immer mitgezählt werden.
- **`qorel keys add` leitet den Post-Quanten-Schlüssel ab.** Auf einer Hybrid-Chain leitet es den ML-DSA-87-Schlüssel mit der QoreChain-Wallet-Ableitung aus derselben Mnemonic und demselben Konto ab und speichert nur dessen 32-Byte-Seed neben dem Schlüssel als `<key name>.pqc`. Es wird nichts Geheimes ausgegeben.
- **`qorel keys register-pqc`.** Sendet einmalig `MsgRegisterPQCKeyV2`, auf Netzwerken ab v3.2.3 mit einem Besitznachweis (Proof of Possession). Es ist idempotent (es wird nichts gesendet, wenn derselbe Schlüssel bereits registriert ist) und sendet nicht, wenn das Konto bereits einen anderen Schlüssel hat. `--no-proof` gibt es nur für Netzwerke älter als v3.2.3.
- **`qorel keys pqc-status`.** Gibt aus, ob der Schlüssel registriert ist, ob er mit dem lokalen Schlüssel übereinstimmt, ob der Besitz nachgewiesen wurde, welche Sign-Bytes die Chain prüft, und `ready_to_relay`.
- **Sicherheitsprüfung vor dem Senden.** Vor jeder Transaktion an eine Hybrid-Chain prüft QORel, dass der Schlüssel geladen, registriert und mit dem lokalen identisch ist und dass die Sign-Bytes-Version bekannt ist. Mit `pqc.sign_bytes = 'auto'` liest es die Version aus den angewendeten Upgrade-Einträgen der Chain, liest sie jede Minute neu und nach jeder Ablehnung mit Codespace `pqc` Code 21 ebenfalls. Bei jedem Fehler wird nichts gesendet und keine Gebühr fällt an; `health-check` meldet den Grund.
- **Gaspreis aus dem Fee-Market.** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` liest die Basisgebühr von QoreChain, die eine Untergrenze von 0,1 uqor pro Gas hat.
- **Erkennung von Fehlverhalten auf ibc-go-v10-Chains.** QORel liest den Header aus der `MsgUpdateClient`-Transaktion, weil ibc-go v10 ihn nicht mehr in `update_client`-Events aufnimmt. Das Standard-Hermes 1.13 schaltet die Erkennung auf diesen Chains ab.
- **Paket-Worker überstehen Rate-Limiting.** Worker bleiben aktiv, solange ein Relay- oder Clearing-Versuch fehlgeschlagen ist, und versuchen es bei jedem Clear-Intervall erneut. In Hermes beendet sich ein Worker auch nach `clear_interval x 5` Blöcken ohne neue IBC-Events, selbst wenn die letzte Clearing-Runde fehlgeschlagen ist; ein in diesem Moment ausstehendes Paket wartete daher auf das nächste Paket auf dem Kanal oder auf einen Neustart.
- **Schlüsseldateien nur für den Besitzer.** Hermes schrieb Schlüsseldateien mit der Standard-umask. QORel schreibt `<key name>.json` und `<key name>.pqc` mit dem Modus 0600. Von einem älteren Hermes hinzugefügte Schlüssel behalten ihren alten Modus; prüfen Sie sie mit `ls -l`.
- **Eine Binärdatei `qorel`.** Eine Binärdatei, `qorel`, mit dem Befehlssatz von Hermes plus den Key-Befehlen für den Post-Quanten-Schlüssel. Aus dem Quellbaum wird außerdem eine Binärdatei `hermes` mit derselben CLI gebaut.
- **Releases mit Herkunftsnachweis.** Tarballs für Linux und macOS, `.deb`- und `.rpm`-Pakete mit einer gehärteten systemd-Unit, eine Homebrew-Formel und ein mit cosign signiertes Multi-Arch-Container-Image. Release-Dateien kommen mit `SHA256SUMS` und Build-Attestierungen. Siehe [Installation](/qorel/install).
- **Ein lokaler Devnet-Test.** Das Repository enthält `scripts/qorel-devnet/`, das lokal einen QoreChain-Node und eine ibc-go-v10-Testchain baut und einen ICS-20-End-to-End-Test in beide Richtungen ausführt: Schlüsselregistrierung, Erstellung von Client, Verbindung und Kanal, Transfers in beide Richtungen, Rückführung eines übertragenen Tokens, ein abgelaufenes Paket, das abgeräumt und erstattet wird, und ein von QORel selbst gesendeter Transfer.

### Im Testnet bewährt {#proven-on-the-testnet}

- Der erste IBC-Kanal des QoreChain-Testnets, `transfer/channel-0` auf `qorechain-diana` zu `channel-600` im öffentlichen Testnet des Cosmos Hub (Chain-ID `provider`), wird von QORel relayt. Die Clients sind `07-tendermint-0` und `07-tendermint-466`, die Verbindungen `connection-0` und `connection-315`.
- Getestet wurden Transfers in beide Richtungen (1 QOR hinaus, 0,1 ATOM herein, 0,4 QOR zurück) und die automatische Rückerstattung eines Transfers mit 1 Sekunde Timeout über eine Timeout-Nachricht. Alle 13 Relayer-Transaktionen auf `qorechain-diana` waren erfolgreich.
- Die lesende Ansicht des Kanals steht unter [Assets bridgen](/user-guide/bridging-assets#ibc-test-channel).

### Nicht in dieser Version {#not-in-this-release}

- Relaying von IBC v2. Es ist in QORel noch nicht implementiert und die nächste Phase.
- Relaying für Ethereum (Eureka). Nicht begonnen.
- Relaying im Mainnet. Es ist noch kein Mainnet-IBC-Kanal geöffnet.
- Ein Windows-Build.
- Das Crate `qorel-signer` auf crates.io. Die Veröffentlichung ist blockiert; das Crate liegt im Repository unter `crates/qorel-signer`, verwenden Sie also eine Git-Abhängigkeit.

## Upgrade {#upgrading}

Es gibt kein früheres QORel-Release. Wechsel von Hermes 1.13 zu QORel 0.1.0:

1. Installieren Sie `qorel` neben oder anstelle von `hermes` ([Installation](/qorel/install)).
2. Behalten Sie Ihre `config.toml`. Chains ohne `signing` bleiben beim Standard-Signieren und verhalten sich wie zuvor.
3. Benennen Sie den Befehl in Ihren Service-Dateien von `hermes` in `qorel` um. Der Ordner des Schlüsselspeichers (standardmäßig `~/.hermes/keys`) bleibt unverändert, weshalb das Container-Image seine Daten unter `/home/nonroot/.hermes` einbindet.
4. Prüfen Sie die Modi der Schlüsseldateien mit `ls -l`; neue Schlüssel haben 0600, ältere behalten ihren Modus.

Die Upgrade-Hinweise des Upstream-Projekts Hermes in der `UPGRADING.md` des Repositorys gelten für alle, die von einer Hermes-Version älter als 1.6 kommen.
