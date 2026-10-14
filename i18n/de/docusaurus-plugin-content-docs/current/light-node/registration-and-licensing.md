---
slug: /light-node/registration-and-licensing
title: Registrierung und Lizenzierung
sidebar_label: Registrierung & Lizenzierung
sidebar_position: 4
---

# Registrierung und Lizenzierung

Um den [3%-Belohnungsanteil für Light Nodes](/light-node/rewards-and-monitoring) zu verdienen, muss ein Light Node **on-chain registriert** sein und fortlaufend nachweisen, dass er aktiv ist. Diese Seite behandelt, wie die Registrierung funktioniert, wie der Node seine Aktivität (Liveness) nachweist und wie man einen Node über das Dashboard lizenziert und on-chain registriert.

:::note Die Registrierung für das Belohnungsprogramm ist noch nicht geöffnet
Auf keinem der beiden Netzwerke wurde eine `lightnode_operator`-Lizenz vergeben, und es ist kein Node registriert, daher lehnt die Chain heute jede Registrierung ab. Das Betreiben und Synchronisieren eines Nodes erfordert keine Lizenz. Siehe [Status des Belohnungsprogramms](/light-node/overview#reward-program-status), um den aktuellen Stand zu prüfen.
:::

## On-Chain-Registrierung

Die Registrierung trägt deinen Light Node in die Chain ein, damit das Protokoll weiß, dass er existiert, welcher Typ er ist (`sx` oder `ux`) und welcher Operator-Schlüssel ihn kontrolliert. Sobald er registriert und aktiv ist, wird der Node für den Belohnungsanteil für Light Nodes berechtigt.

### Voraussetzungen {#requirements}

Die Chain prüft all dies, wenn deine Registrierungstransaktion ausgeführt wird:

1. Eine aktive `lightnode_operator`-Lizenz auf der Operator-Adresse.
2. Mindestens **1.000 QOR gebondet** an Validatoren von derselben Adresse (deine Gesamtsumme über alle Validatoren). Delegiere **vor** der Registrierung: über die Staking-Seite des Dashboards oder mit `qorechaind tx staking delegate` (und der Post-Quantum-Mitsignatur, wie bei jeder Transaktion).
3. Ein Guthaben auf dem Operator-Konto, um die Registrierungsgebühr von **1 QOR** und die Transaktionsgebühren zu bezahlen. Der Daemon zahlt für jeden Heartbeat von diesem Konto eine Gebühr (Standard `50000uqor` pro Heartbeat, `[heartbeat] fees`).
4. Weniger als 10.000 netzwerkweit registrierte Light Nodes.

### Erzeugen der Registrierungsbefehle

Die Registrierung erfolgt von deiner **Operator-Adresse** aus: einem finanzierten `qor1…`-Konto, das mit `qorechaind` (oder einer beliebigen Cosmos-Wallet) erstellt wurde und auch die Belohnungen erhält. Der Dilithium-5-Schlüssel des Nodes selbst hat keine Adresse; er wird zum Post-Quantum-Schlüssel des Kontos. Trage die Adresse in `config.toml` als `operator_address` ein und stelle sicher, dass `key_name` und `chain_id` wie unter [Erster Start](/light-node/sx-edition#first-run-onboard) beschrieben gesetzt sind (`onboard` setzt sie nicht korrekt für dich). Führe dann aus:

```bash
lightnode-sx register
```

Bevor etwas ausgegeben wird, fragt der Befehl die Chain, ob `operator_address` eine aktive `lightnode_operator`-Lizenz besitzt. Er tut dies, weil die Chain eine Registrierung ohne Lizenz ablehnt und es keinen Sinn hat, dir Befehle zu geben, die abgelehnt würden. Ohne Lizenz bricht er ab mit:

```text
operator address qor1... has no lightnode_operator licence. Buy one at
https://dashboard.qorechain.io -> Tools -> Buy License, and enter this operator
address there; the on-chain grant follows and register works once it lands.
```

Eine im Dashboard gekaufte Lizenz wird in einem separaten Schritt on-chain vergeben, daher kann `register` nach dem Kauf noch eine Weile „no licence“ melden; `lightnode-sx status` zeigt dieselbe Zeile `Licence:` und wechselt auf `active`, sobald die Vergabe eintrifft. Ein bereits registrierter Node wird als solcher gemeldet, statt ein zweites Mal registriert zu werden.

Mit einer aktiven Lizenz liest der Befehl den Node-Schlüssel aus dem Keyring und gibt, mit deinen Werten ausgefüllt, Folgendes aus:

1. **Nur einmal** den Befehl, der den Node-Schlüssel als Post-Quantum-Schlüssel an das Operator-Konto bindet (`qorechaind tx pqc register-key-v2 dilithium5 <pubkey> hybrid --from operator …`), nachdem der Schlüssel mit `lightnode-sx keys export` in das Schlüsselverzeichnis von `qorechaind` exportiert wurde. Überspringe ihn, wenn das Konto bereits einen Post-Quantum-Schlüssel hat (`GET /qorechain/pqc/v1/account/<address>` liefert `found: true`). Reicht das ausgegebene Gas-Limit nicht aus, wiederhole ihn mit `--gas 600000 --fees 60000uqor`.
2. Die Registrierung selbst: `qorechaind tx lightnode register <type> <version> --from operator --generate-only > register.json`, dann `qorechaind tx pqc cosign register.json --from operator --pqc-key <key>`. Die Chain verlangt bei jeder Transaktion die Post-Quantum-Mitsignatur, daher ist die Registrierung ein Paar aus Erzeugen und Mitsignieren.

Der Befehl akzeptiert zwei optionale Flags:

- `--type` — der Node-Typ, `sx` oder `ux` (Standard ist `sx`).
- `--version` — die zu registrierende Node-Version (Standard ist die eigene Version der Binärdatei).

Reiche die Transaktion in dem Netzwerk ein, dem du beitrittst (Testnet `qorechain-diana` oder Mainnet `qorechain-vladi`). Die Registrierung erfordert eine aktive `lightnode_operator`-Lizenz, die auf der Operator-Adresse vergeben wurde; andernfalls lehnt die Chain sie ab.

:::note
`lightnode-sx register` **gibt** die Befehle zur Überprüfung und Ausführung **aus** — es sendet sie nicht von selbst. So behältst du die Kontrolle darüber, wann und wie der Node registriert wird.
:::

## Heartbeat-Liveness-Nachweise

Die Registrierung allein reicht nicht aus, um berechtigt zu bleiben. Ein registrierter Light Node muss fortlaufend nachweisen, dass er online ist, indem er **Heartbeat-Liveness-Nachweise** einreicht. Über diese Heartbeats unterscheidet die Chain aktive Nodes — die für den Belohnungsanteil berechtigt sind — von registrierten, aber offline befindlichen Nodes.

In der Praxis bedeutet das: Ein Node, der registriert ist und weiterläuft (und synchronisiert ist), behält seine Berechtigung, während ein Node, der offline geht, aufhört, seine Aktivität nachzuweisen, und seine Berechtigung verliert, bis er zurückkehrt. Den Daemon am Laufen und gesund zu halten, ist daher Teil des Verdienens von Belohnungen — siehe [Belohnungen und Überwachung](/light-node/rewards-and-monitoring) dazu, wie man Heartbeat- und Sync-Zustand beobachtet.

### PQC-mitsignierte Heartbeat-Pipeline {#pqc-cosigned-heartbeat-pipeline}

QoreChain ist **standardmäßig PQC-erforderlich**, daher wird die Heartbeat-Liveness-Transaktion über eine post-quantum mitsignierte Pipeline erzeugt statt über eine rein klassische Signatur. Der Daemon erstellt den unsignierten Heartbeat und signiert ihn dann vor dem Broadcast mit einer **hybriden Dilithium-5 (ML-DSA-87)**-Signatur mit — dieselbe Post-Quantum-Haltung, die die Chain für jede Transaktion erzwingt. Der Node reicht einen Heartbeat pro `interval_blocks`-Fenster ein (passend zum Chain-Parameter `heartbeat_interval`) und taktet sich anhand der Blockhöhe selbst, um Ablehnungen wegen zu früher Einreichung zu vermeiden.

On-Chain-Heartbeats sind standardmäßig aktiviert. Der Daemon benötigt: `operator_address` in der Konfiguration; eine `qorechaind`-Binärdatei **ab v3.2.0** (im `PATH` oder unter `[heartbeat] qorechaind_path`; das SX-Docker-Image, das aus dem Tag `v3.1.4` gebaut wurde, enthält eine — ältere Signierer werden von der Chain abgelehnt); und das `qorechaind`-Home-Verzeichnis mit dem Operator-Schlüssel und dem exportierten Node-Schlüssel (`qorechaind_home`, Standard `~/.qorechaind`). Zwei Keyring-Passphrasen gehören in die Umgebung: `QORE_LIGHTNODE_KEYRING_PASSPHRASE` für den Node-Keyring und `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` für den `qorechaind`-Keyring (die zweite wird über stdin an `qorechaind` weitergeleitet und nie in eine Befehlszeile geschrieben). `qorechaind` wird **nur für Linux amd64** veröffentlicht (siehe den Eintrag `binary` in `https://download.qore.host/mainnet/latest.json`), daher laufen und synchronisieren Nodes auf macOS-, Windows- oder ARM-Hosts zwar, können Heartbeats aber nicht nativ signieren; ein registrierter Node sollte die SX-Edition unter Linux amd64 oder das Docker-Image auf einem amd64-Host betreiben. Er taktet sich anhand des eigenen `last_heartbeat` der Chain für den Node, sodass ein Neustart weder einen doppelten Heartbeat sendet noch ein ganzes Intervall wartet. Solange der Node nicht registriert ist, sendet er keinen Heartbeat; stattdessen protokolliert er den Grund, einmal pro Zustandswechsel: keine Lizenz (mit dem Hinweis, wo man eine kauft) oder Lizenz aktiv, aber nicht registriert (führe `lightnode-sx register` aus). `lightnode-sx status` zeigt die Zeilen `Signer:`, `Licence:` und `Registration:`, sodass der Grund ohne Lesen der Logs sichtbar ist. Fehlt der Signierer, läuft und synchronisiert der Node weiterhin; er kann nur nicht on-chain aktiv bleiben, und `status` weist darauf hin.

## Registrierung und Lizenzierung über das Dashboard

Du kannst deinen Lizenzstatus prüfen und deine Node-Angaben auf dem Tab **Tools → Light Node** des QoreChain Dashboards pflegen. Das Betreiben des Nodes und der Beitritt zu dessen Belohnungsprogramm sind zwei unterschiedliche Dinge, und das Dashboard hält sie getrennt:

1. **Die Software besorgen (keine Lizenz nötig).** Der Tab verlinkt die Light-Node-Binärdateien für das gewählte Netzwerk (dieselben Dateien wie unter `https://download.qore.host/<net>/lightnode/latest.json`, mit ihren sha256-Prüfsummen) und zeigt ein Bring-up-Paket für einen vollständigen QoreChain-Node. Ein Light Node benötigt nur die Binärdatei `lightnode-sx` oder `lightnode-ux` und einen RPC-Endpunkt; folge der [SX-Edition](/light-node/sx-edition).
2. **Den Status deines Belohnungsprogramms prüfen.** Der Beitritt zum Belohnungsanteil für Light Nodes ist ein separater, on-chain-gesteuerter Schritt: eine aktive, on-chain vergebene `lightnode_operator`-Lizenz, mindestens 1.000 QOR gebondet (deine Gesamtsumme über alle Validatoren, live aus dem Staking ausgelesen) und eine Registrierungsgebühr von 1 QOR. **Die Anmeldung ist noch nicht geöffnet** (siehe [Status des Belohnungsprogramms](/light-node/overview#reward-program-status)), und der Kauf einer Lizenz öffnet sie nicht vorzeitig. Die Betriebszeit wird ab dem Block gezählt, in dem sich dein Node on-chain registriert, nicht früher.
3. **Lizenz.** Eine über **Buy License** gekaufte Lizenz wird zunächst auf unserer Seite erfasst; die Vergabe, die sie on-chain anerkennt, ist ein separater Schritt, und die Chain lehnt eine Registrierung ab, bis sie eingetroffen ist. Der Kauf erfordert die `qor1…`-Adresse, an die die Lizenz vergeben wird, und zeigt **Paid — awaiting on-chain grant**, bis die Chain sie bestätigt. `lightnode-sx status` zeigt die On-Chain-Zeile `Licence:`.
4. **Registrierungseintrag.** Wenn dein Konto eine als aktiv erfasste Lizenz besitzt, zeigt der Tab außerdem ein kurzes Formular (Operator-Adresse, Moniker, öffentliche Endpunkt-URL und eine Bestätigung der Stake-Verpflichtung), gefolgt von einer Zusammenfassung dessen, was du eingereicht hast. Dies erfasst deine Anfrage im Dashboard; es sendet **nicht** die On-Chain-Registrierungstransaktion.
5. **On-chain registrieren.** Sobald die Lizenz vergeben ist und 1.000 QOR von deiner Operator-Adresse gebondet sind, registriere dich mit `lightnode-sx register` und den `qorechaind`-Befehlen, die es ausgibt (siehe oben).

Das Dashboard ist nützlich, um den Node herunterzuladen, die Anforderungen der Chain und die Gesundheit deines Nodes zu prüfen und eine Lizenz zu kaufen. Die On-Chain-Registrierung selbst ist immer die Transaktion `lightnode-sx register`.

## Wie es weitergeht

- [Belohnungen und Überwachung](/light-node/rewards-and-monitoring) — wie der 3%-Anteil gutgeschrieben, eingefordert und überwacht wird.
- [SX-Edition](/light-node/sx-edition) — der `register`-Befehl und die vollständige CLI-Referenz.
