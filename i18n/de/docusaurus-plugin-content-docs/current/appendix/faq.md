---
slug: /appendix/faq
title: FAQ
sidebar_label: FAQ
sidebar_position: 5
---

# Häufig gestellte Fragen

Allgemeine Fragen zu QoreChain, beantwortet anhand der Dokumentation. Jede Antwort verweist auf die maßgebliche Seite mit allen Details. Für SDK-spezifische Fragen siehe die [SDK-FAQ](/sdk/faq).

### Ist das Mainnet live?

Ja. Das QoreChain-Mainnet (Chain `qorechain-vladi`, EVM-Chain-ID 9801) ist seit dem 7. Juni 2026 live und läuft mit Release v3.2.8 (angewendet auf Höhe 4.273.000 am 18. November 2026 durch Governance-Vorschlag 17; v3.2.7 war auf Höhe 4.164.600 am 12. November 2026 durch Vorschlag 16 angewendet worden); das Testnet `qorechain-diana` läuft seit dem 20. November 2026 mit v3.2.9, nach v3.2.8 ab dem 12. November (v3.2.9 auf Höhe 10.424.000; v3.2.8 auf Höhe 9.929.500). Siehe [Netzwerke](/appendix/networks) und [Verbindung mit dem Mainnet](/getting-started/connecting-to-mainnet).

### Welche Chain-IDs und EVM-Chain-IDs gibt es?

Das Mainnet ist die Cosmos-Chain `qorechain-vladi` mit der EVM-Chain-ID **9801** (hex `0x2649`); das Testnet ist `qorechain-diana` mit der EVM-Chain-ID **9800** (hex `0x2648`). Die vollständige Tabelle finden Sie unter [Netzwerke](/appendix/networks).

### Wie werden Transaktionsgebühren verteilt?

Die eingenommenen Gebühren werden aufgeteilt: **37% an Validatoren, 30% verbrannt, 20% an die Community-Treasury, 10% an Staker und 3% an Light Nodes**. Die Aufteilung gilt für alles im Fee Collector, einschließlich der Epochen-Emission. Siehe [Tokenomics](/architecture/tokenomics#fee-distribution).

### Was ist PRISM?

PRISM ist die Reinforcement-Learning-Optimierungsschicht, die in die QoreChain Consensus Engine eingebettet ist. Sie beobachtet Netzwerkmetriken und schlägt deterministische Anpassungen der Konsensparameter unter Sicherungsschalter-Sicherheitskontrollen vor. Heute läuft sie im Beobachtungsmodus: Es ist keine trainierte Policy geladen, daher ändert sie keinen Parameter. Siehe [PRISM Consensus Engine](/architecture/prism-consensus-engine).

### Ist die Cross-Chain-Bridge live?

Nein. Das Bridge-Modul ist bereitgestellt, aber alle 37 Chain-Konfigurationen stehen noch aus, es sind keine Bridge-Validatoren registriert, und im Mainnet existiert kein IBC-Channel (das Testnet hat einen einzelnen ICS-20-Transfer-Channel zu einer Test-Chain, der für IBC-Tests geöffnet wurde, und keinen zu den geplanten Gegenparteien). Sie ist um 37 Chain-Konfigurationen und bis zu 8 IBC-Gegenparteien herum konzipiert; behandeln Sie diese Zielwerte als Design-Absicht. Siehe [Bridge-Architektur](/architecture/bridge-architecture).

### Wie verbinde ich ein Wallet?

Verwenden Sie das offizielle [QoreX](/qorex/overview)-Wallet oder fügen Sie einem EVM-Wallet ein QoreChain-Netzwerk mit den EVM-Chain-IDs hinzu (9801 Mainnet, 9800 Testnet). Siehe [Wallet-Einrichtung](/getting-started/wallet-setup).

### Wie erhalte ich Testnet-Token?

Verwenden Sie den Testnet-Faucet im Dashboard. Siehe [Dashboard-Faucet](/dashboard/faucet) und [Verbindung mit dem Testnet](/getting-started/connecting-to-testnet).

### Was sind fUSD, fETH und fBTC?

Reine Testnet-Test-Token (FestUSD, FestETH und FestBTC, mit 6, 18 und 8 Dezimalstellen), die für den Builder Fest erstellt wurden. Sie haben keinen Wert, existieren nicht im Mainnet und werden als Bank-Coins mit den groß-/kleinschreibungsabhängigen Denominationen `erc20:<contract address>` gehalten. Der Testnet-Faucet kann sie zusammen mit einem QOR-Claim senden. Siehe [Fest-Test-Token](/dashboard/faucet#fest-tokens).

### Wie betreibe ich einen Node, Validator oder Light Node?

Für einen Full Node siehe [Einen Node betreiben](/developer-guide/running-a-node). Für einen Validator siehe [Einen Validator betreiben](/developer-guide/running-a-validator). Für einen Light Node siehe [Light Node](/light-node/overview); die Registrierung für das Light-Node-Belohnungsprogramm ist offen und lizenzpflichtig, und am 27. Oktober 2026 wurde in jedem Netzwerk ein Light Node registriert ([Status](/light-node/overview#reward-program-status)).

### Welches Signaturverfahren verwendet QoreChain?

QoreChain verwendet ein Post-Quantum-Hybridverfahren, das klassisches **secp256k1 (ECDSA)** mit Post-Quantum-**ML-DSA-87 (Dilithium-5)** kombiniert. Dieses Hybridverfahren ist auf dem Cosmos-Transaktionspfad standardmäßig erforderlich, wobei der Durchsetzungsmodus per Governance gesteuert wird. Auf der EVM-Lane bleibt die Signatur secp256k1, und ein Konto muss zusätzlich einen registrierten ML-DSA-Schlüssel und ein offenes Autorisierungsfenster besitzen (seit v3.2.0). Ein Konto ist erst dann Post-Quantum-geschützt, wenn es seinen ML-DSA-87-Schlüssel registriert hat; diese erste Registrierung wird nur mit dem klassischen Schlüssel signiert (der dokumentierte Bootstrap), registrieren Sie ihn also, bevor das Konto nennenswerte Guthaben hält. Siehe [Post-Quantum-Sicherheit](/architecture/post-quantum-security).

### Warum wird meine EVM-Transaktion mit „no open EVM authorisation window“ abgelehnt?

Seit v3.2.0 lässt die EVM-Lane eine Transaktion nur von einem Konto zu, das einen registrierten Post-Quantum-Schlüssel und ein offenes Autorisierungsfenster besitzt. Öffnen Sie ein Fenster mit einer Transaktion auf der Cosmos-Lane mit hybrider ML-DSA-87-Signatur (FIPS 204) und versuchen Sie es dann erneut. Siehe [EVM-Autorisierungsfenster](/getting-started/first-transaction#evm-window).

### Wie viele Validatoren hat das Mainnet?

Acht gebondete Validatoren am 27. Oktober 2026, mit etwa 60,3 Millionen gebondeten QOR (das aktive Set kann bis zu 100 umfassen). Das Testnet hat vier. Das aktuelle Set können Sie unter `GET /cosmos/staking/v1beta1/validators` auf `https://api.qore.host` auslesen.

### Welche Blockzeit kann ich erwarten?

Etwa 3,1 Sekunden im Mainnet und etwa 1,3 Sekunden im Testnet (gemessene Durchschnittswerte, 27. Oktober 2026). Die Blockzeit wird durch die Node-Konfiguration der Validatoren festgelegt.

### Ist xQORE verfügbar?

Noch nicht. Das Accounting-Modul existiert, aber Lock- und Unlock-Transaktionen sind in den Live-Netzwerken nicht angebunden. Siehe [Tokenomics](/architecture/tokenomics#x-xqore).

### Ist das QOR-Angebot festgelegt?

Das Genesis-Angebot betrug 4.420.000.000 QOR. Die Staking-Emission wird unter einer harten kumulativen Obergrenze von 590.000.000 QOR geprägt (86.000 QOR pro Epoche seit Governance-Vorschlag 10, Oktober 2026), und Burns entfernen Token dauerhaft. Siehe [Tokenomics](/architecture/tokenomics#supply-and-emission).

### Wie erstelle ich ein Rollup?

Verwenden Sie das QoreChain Rollup Development Kit. Siehe [Rollups](/rollups/overview) und die Architekturreferenz zum [Rollup Development Kit](/architecture/rollup-development-kit).

### Wie erstelle ich eine dApp?

Verwenden Sie das [QoreChain SDK](/sdk/overview), das öffentliche SDK zum Erstellen von Anwendungen auf QoreChain über seine EVM-, SVM- und QoreChain Native-Ausführungsumgebungen hinweg.

### Wo kann ich Fragen stellen?

Der QCAIA-Community-Bot beantwortet Fragen auf Discord ([discord.gg/qorechain](https://discord.gg/qorechain)) und Telegram ([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)). Siehe [QCAIA-Community-Bot](/qcaia/overview).

### Gibt es einen zweiten, unabhängig betriebenen EVM-RPC für das Testnet? {#testnet-second-evm-rpc}

Derzeit nicht. `https://evm-testnet.qore.host` ist der einzige öffentliche EVM JSON-RPC für `qorechain-diana`, und die öffentlichen Testnet-Endpunkte werden vom QoreChain-Team betrieben. Ein Vergleich zwischen ihnen prüft verschiedene Schnittstellen, nicht unabhängige Betreiber.

Für eine wirklich unabhängige Prüfung betreiben Sie Ihren eigenen Testnet-Node mit aktiviertem JSON-RPC und fragen Sie ihn direkt ab. [Verbindung zum Testnet](/getting-started/connecting-to-testnet) enthält das Binary, die Genesis, die Peers und den State Sync. Verwenden Sie State Sync: Der öffentliche Sentry behält nur aktuelle Blöcke.

Für schnelle Gegenprüfungen können Sie den Konsens-RPC `https://rpc-testnet.qore.host` (Blöcke, Transaktionen nach Hash), REST `https://api-testnet.qore.host` (Konten, Guthaben, Modulzustand), den EVM WebSocket `wss://evm-ws-testnet.qore.host` und den Explorer unter [explore.qore.network](https://explore.qore.network), auf Testnet umgeschaltet, verwenden.

### Was passiert, wenn ich ein neues EVM-Fenster öffne, während noch eines aktiv ist? {#new-evm-window}

Das neue Fenster ersetzt das aktive, Sie müssen das alte also nicht vorher schließen. Ein Konto hat immer nur ein Fenster gleichzeitig.

Das neue Fenster beginnt mit `usedTxs` und `usedValue` bei null. Sein Ablauf, `maxTxs` und `maxValue` stammen ausschließlich aus der neuen Nachricht. Nichts wird aus dem alten Fenster übernommen.

Auch der Geltungsbereich wird vollständig ersetzt. Wenn die neue Nachricht `allowed_targets` auflistet, erlaubt das Fenster nur Transaktionen an diese Adressen und lehnt die Vertragserstellung ab. Schließen Sie Ihre Deployments daher ab, bevor Sie ein solches Fenster öffnen. Hat die neue Nachricht keine Liste, hat auch das neue Fenster keine, selbst wenn das alte eine hatte. Prüfen Sie nach dem Broadcast das Ergebnis mit der EVM-Fenster-Abfrage oder im Ereignis `pqc_evm_window_opened`. Siehe [Referenz zum EVM-Autorisierungsfenster](/developer-guide/evm-window-reference).

### Wie lasse ich meinen CosmWasm-Vertrag im Testnet speichern und für Cross-VM-Aufrufe zulassen? {#testnet-cosmwasm-allowlist}

Im Testnet läuft das Hochladen von CosmWasm-Code über die Governance. Reichen Sie einen Vorschlag ein, der den Code-Upload öffnet, Ihren Code speichert und den Upload wieder schließt, in derselben Form wie frühere angenommene Vorschläge (zum Beispiel 27 und 50). Veröffentlichen Sie den Quellcode, einen reproduzierbaren Build und den sha256 der wasm-Datei, damit andere ihn prüfen können. Ein regulärer Vorschlag braucht eine Einzahlung von 10 QOR und hat eine Abstimmung von 4 Stunden. Ein beschleunigter braucht 50 QOR, hat eine Abstimmung von 1 Stunde und benötigt einen höheren Anteil an Ja-Stimmen.

Wenn der Code gespeichert und Ihr Vertrag instanziiert ist, fügt ihn ein zweiter Vorschlag der Cross-VM-Allowlist hinzu (`bridge_allowed_targets`, mit einem Pin in `bridge_target_pins`), wie es Vorschlag 40 getan hat. Ein Vertrag mit einem anderen Admin als der Governance muss gepinnt werden. Dieser Vorschlag ersetzt alle Parameter des Moduls. Kopieren Sie daher die aktuellen Werte aus `https://api-testnet.qore.host/qorechain/crossvm/v1/params` und fügen Sie Ihren Eintrag hinzu. Der Vertrag muss bereits existieren, wenn der Vorschlag ausgeführt wird.

Posten Sie die Vorschlagsnummer beim Einreichen im Builder-Kanal des Fests, damit die Testnet-Validatoren ihn prüfen und vor Ende der Abstimmung abstimmen können. Die vollständigen Schritte mit den genauen Dateien und Befehlen stehen in [Governance-Vorschläge für Verträge](/developer-guide/governance-proposals-contracts).

## Verwandt

* [Netzwerke](/appendix/networks) — Referenz für Chain-IDs, Ports und Endpunkte.
* [Was ist QoreChain](/introduction/what-is-qorechain) — Überblick über die Plattform.
* [QCAIA-Community-Bot](/qcaia/overview) — Stellen Sie Fragen auf Discord und Telegram.
