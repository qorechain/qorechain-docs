---
slug: /light-node/registration-and-licensing
title: Registrierung und Lizenzierung
sidebar_label: Registrierung & Lizenzierung
sidebar_position: 4
---

# Registrierung und Lizenzierung

Um am [3%-Belohnungsanteil für Light Nodes](/light-node/rewards-and-monitoring) teilzunehmen, muss ein Light Node **on-chain registriert** sein und fortlaufend nachweisen, dass er aktiv ist. Diese Seite behandelt, was die Chain verlangt, wie du eine Lizenz erhältst, wie sich der Node selbst registriert und wie er seine Aktivität (Liveness) nachweist.

:::note Die Registrierung ist offen
Die Registrierung ist im Mainnet (`qorechain-vladi`) und im Testnet (`qorechain-diana`) offen. Das Betreiben und Synchronisieren eines Nodes erfordert keine Lizenz. Siehe [Status des Belohnungsprogramms](/light-node/overview#reward-program-status), um den aktuellen Stand zu prüfen.
:::

## On-Chain-Registrierung

Die Registrierung trägt deinen Light Node in die Chain ein, damit das Protokoll weiß, dass er existiert, welcher Typ er ist (`sx` oder `ux`) und welches Operator-Konto ihn kontrolliert. Sobald er registriert und aktiv ist, wird der Node für den Belohnungsanteil für Light Nodes berechtigt.

### Voraussetzungen {#requirements}

Die Chain prüft all dies, wenn deine Registrierungstransaktion ausgeführt wird:

1. Eine aktive `lightnode_operator`-Lizenz auf der Operator-Adresse.
2. Mindestens **1.000 QOR**, die von derselben Adresse an **gebondete** Validatoren **delegiert** sind (deine Gesamtsumme über alle Validatoren; Delegationen an gejailte oder ungebondete Validatoren zählen nicht).
3. Ein Guthaben auf dem Operator-Konto, um die Registrierungsgebühr von **1 QOR** und die Transaktionsgebühren zu bezahlen. Der Node zahlt außerdem für jeden Heartbeat eine Gebühr von diesem Konto: Beim nativen Signieren beträgt die Gebühr 0,25 uqor pro Gas-Einheit, also 75.000 uqor (0,075 QOR) beim Standardwert `[heartbeat] gas` von 300.000, oder etwa 1,9 QOR im Monat bei rund 25 Heartbeats pro Tag.
4. Weniger als 10.000 netzwerkweit registrierte Light Nodes.

Nach der Registrierung muss der Node alle **1.000 Blöcke** einen Heartbeat senden (mit einer Karenz von 100 Blöcken) und mindestens **80 % Uptime** halten, um ausgezahlt zu werden. Die aktuellen Werte liest du mit `GET https://api.qore.host/qorechain/lightnode/v1/params` (Testnet: `https://api-testnet.qore.host`).

### Das Operator-Konto {#operator-account}

Die Registrierung erfolgt von deiner **Operator-Adresse** aus: einem gewöhnlichen `qor1…`-Konto, das die Lizenz und den Stake hält, die Gebühren zahlt und die Belohnungen erhält. Der Node muss dafür signieren können, daher muss es ein Konto sein, **dessen Wiederherstellungswörter du besitzt**: Wörter, die du dir selbst notiert hast, ein Konto aus Keplr oder ein `qorechaind`-Schlüssel (Ableitungspfad `m/44'/118'/0'/0/0`). Ein eigenes Konto, das nur für den Node verwendet wird, ist die beste Wahl.

Eine Custodial-Wallet im Dashboard (eine, deren Seed das Dashboard für dich verwahrt) kann keinen Node betreiben, es sei denn, du exportierst zuerst ihren Seed.

Der Dilithium-5-Schlüssel des Nodes hat keine eigene Adresse: Auf QoreChain wird ein Post-Quantum-Schlüssel an ein Konto angehängt, er erzeugt keines. Der Node hängt seinen Schlüssel als Post-Quantum-Schlüssel an das Operator-Konto an, es sei denn, das Konto hat bereits einen (siehe [Konten, die bereits einen Post-Quantum-Schlüssel haben](#accounts-with-a-pqc-key)).

## Eine Lizenz erhalten

### Mainnet: Kauf im Dashboard

Lizenzen werden im QoreChain Dashboard unter **Tools → Light Node** gekauft. Eine Lizenz kostet **50 $**, zahlbar in USDT auf ERC-20, BEP-20 oder TRC-20; die Zahlung wird auf ihrer jeweiligen Chain verifiziert. Du musst die `qor1…`-Adresse, für die die Lizenz bestimmt ist, **vor** der Zahlung eingeben; verwende die oben beschriebene Operator-Adresse.

Die Vergabe ist ein separater On-Chain-Schritt, der von Hand signiert und in Batches gesendet wird. Bis die Chain sie bestätigt, zeigt der Tab **Paid, awaiting on-chain grant**, und der Node meldet weiterhin, dass die Adresse keine Lizenz hat. `lightnode-sx status` zeigt eine Zeile `Licence:`, die auf `active` wechselt, sobald die Vergabe eintrifft. Du kannst es auch direkt prüfen:

```bash
curl -s https://api.qore.host/qorechain/license/v1/check/<operator-address>/lightnode_operator
```

### Testnet: auf Anfrage

Im Testnet wird nichts verkauft. Testnet-Lizenzen sind kostenlos und werden auf Anfrage von der Testnet-Lizenzstelle vergeben: Schreib an nodes@qorechain.io und gib deine Testnet-Adresse `qor1…` an.

## Den Node registrieren

Die folgenden Schritte sind der eigene Einrichtungsablauf des Nodes. Sie sind für beide Editionen gleich: `lightnode-ux` hat dieselben Befehle wie `lightnode-sx` und verwendet dasselbe Home-Verzeichnis (`~/.qorechain-lightnode`). Details zu jedem Befehl findest du unter [SX-Edition](/light-node/sx-edition#first-run-onboard).

```bash
# 1. Keys are stored encrypted. Keep this set for every command below and for start.
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

# 2. Self-test, RPC endpoint (mainnet: https://rpc.qore.host), node key
lightnode-sx onboard

# 3. The operator account: the one the licence is for. --recover reads its
#    recovery words from standard input.
lightnode-sx keys add-operator --recover

# 4. Post-quantum key, missing stake (only if you name a validator), registration
lightnode-sx register --delegate-to qorvaloper1...

# 5. Run the node; it sends heartbeats on its own
lightnode-sx start
lightnode-sx status
```

Die Passphrase schützt beide Schlüssel im Keyring des Nodes: den Post-Quantum-Schlüssel des Nodes und den Schlüssel des Operator-Kontos.

### Was `register` tut

`register` liest `operator_address` und die Schlüssel aus dem Keyring und führt dann Folgendes aus:

1. **Prüft die Lizenz.** Es fragt die Chain, ob `operator_address` eine aktive `lightnode_operator`-Lizenz besitzt. Ohne Lizenz bricht es ab und nennt, wo du eine bekommst. Ab 3.1.10 verweist die Meldung im Mainnet auf **Tools → Light Node** und im Testnet auf eine kostenlose Lizenz auf Anfrage unter nodes@qorechain.io (3.1.9 nannte noch den alten Dashboard-Tab). Eine abgelaufene oder gesperrte Lizenz wird als solche gemeldet. Ein bereits registrierter Node wird als solcher gemeldet, und es wird nichts gesendet.
2. **Hängt den Post-Quantum-Schlüssel an**, es sei denn, das Konto hat bereits einen. Ein Konto ohne Post-Quantum-Schlüssel darf nur diese eine Nachricht senden, klassisch signiert (ohne die hybride Erweiterung); der Node sendet sie auf diese Weise und fügt einen Besitznachweis (Proof of Possession) für den Schlüssel bei, wo die Chain dies unterstützt.
3. **Delegiert den fehlenden Stake**, nur wenn du mit `--delegate-to qorvaloper1...` einen Validator angibst. Ohne `--delegate-to` bricht es ab, wenn das Konto unter dem Minimum liegt, und nennt den fehlenden Betrag. Ab 3.1.10 zählt es, wie die Chain, nur Stake, der an **gebondete** Validatoren delegiert ist; 3.1.9 zählte auch gejailte oder ungebondete Validatoren mit und konnte dann on-chain abgewiesen werden, delegiere also an einen aktiven Validator, wenn du 3.1.9 betreibst.
4. **Registriert den Node** mit der Gebühr von 1 QOR.

Jeder Schritt wird vom Node selbst signiert und in einem Block bestätigt, bevor der nächste gesendet wird. Jede Transaktion nach der Schlüsselregistrierung trägt die hybride ML-DSA-87- + secp256k1-Signatur, die die Chain verlangt.

Der Befehl akzeptiert diese Flags:

- `--delegate-to` — der `qorvaloper1…`-Validator, an den der fehlende Stake delegiert wird.
- `--type` — der Node-Typ, `sx` oder `ux` (Standard ist die Edition der Binärdatei).
- `--version` — die zu registrierende Node-Version (Standard ist die eigene Version der Binärdatei).
- `--print` — gibt die entsprechenden `qorechaind`-Befehle aus, statt zu signieren (siehe unten).

Das Konto muss bereits on-chain existieren (es muss Guthaben erhalten haben), bevor `register` dafür signieren kann.

### Konten, die bereits einen Post-Quantum-Schlüssel haben {#accounts-with-a-pqc-key}

Ein in einer Wallet eingerichtetes Konto hat oft bereits einen Post-Quantum-Schlüssel, abgeleitet aus denselben Wiederherstellungswörtern. Nach den Regeln von Chain v3.2.3 akzeptiert die Chain nur den auf dem Konto registrierten Schlüssel und lehnt Schlüssel vom Typ `classical_only` oder einen leeren Schlüssel ab.

Seit 3.1.9 behandelt `keys add-operator --recover` diesen Fall: Hat das Konto bereits einen Post-Quantum-Schlüssel, rekonstruiert es diesen Schlüssel aus den Wörtern, mit derselben Ableitung wie der wallet-adapter und das Dashboard (dieselbe wie `qorechaind tx pqc recover-key`), und der Node signiert damit. Hat das Konto keinen Schlüssel, leitet der Node einen aus den Wörtern ab, sodass die Wörter auch den Schlüssel des Nodes wiederherstellen. Hat das Konto einen Post-Quantum-Schlüssel, den die Wörter nicht reproduzieren können (eine Wallet, die ihren eigenen Schlüssel erzeugt und verwahrt), verweigert der Befehl die Ausführung und empfiehlt ein eigenes Operator-Konto.

### Fallback: Operator-Schlüssel in einem `qorechaind`-Keyring

Wenn du den Schlüssel des Operator-Kontos in einem `qorechaind`-Keyring aufbewahrst und ihn nicht im Node speichern möchtest, überspringe Schritt 3 und führe aus:

```bash
lightnode-sx register --print
```

Es führt dieselben Lizenz- und Registrierungsprüfungen aus und gibt, mit deinen Werten ausgefüllt, die `qorechaind`-Befehle für jeden Schritt aus: den Export des Node-Schlüssels in das Schlüsselverzeichnis von `qorechaind` (`keys export <name> --out ~/.qorechaind/pqc/<name>.dilithium`), `tx pqc register-key-v2 … hybrid`, ein `tx staking delegate`, wenn der Stake nicht reicht, und `tx lightnode register` als Paar aus Erzeugen und anschließendem `tx pqc cosign`. Auf diesem Weg verwendet der Daemon `qorechaind` auch für Heartbeats; siehe [`[heartbeat]`-Einstellungen](/light-node/sx-edition#configure).

## Heartbeat-Liveness-Nachweise

Die Registrierung allein reicht nicht aus, um berechtigt zu bleiben. Ein registrierter Light Node muss fortlaufend nachweisen, dass er online ist, indem er **Heartbeat-Liveness-Nachweise** einreicht. Über diese Heartbeats unterscheidet die Chain aktive Nodes — die für den Belohnungsanteil berechtigt sind — von registrierten, aber offline befindlichen Nodes.

In der Praxis bedeutet das: Ein Node, der registriert ist und weiterläuft (und synchronisiert ist), behält seine Berechtigung, während ein Node, der offline geht, aufhört, seine Aktivität nachzuweisen, und seine Berechtigung verliert, bis er zurückkehrt. Den Daemon am Laufen und gesund zu halten, ist daher Teil des Verdienens von Belohnungen — siehe [Belohnungen und Überwachung](/light-node/rewards-and-monitoring) dazu, wie man Heartbeat- und Sync-Zustand beobachtet.

### PQC-mitsignierte Heartbeat-Pipeline {#pqc-cosigned-heartbeat-pipeline}

QoreChain ist **standardmäßig PQC-erforderlich**, daher trägt jeder Heartbeat eine **hybride Signatur**: ML-DSA-87 (Dilithium-5) mit dem Post-Quantum-Schlüssel des Kontos und secp256k1 mit dem Schlüssel des Operator-Kontos. Der Node erstellt und signiert die Transaktion selbst unter Linux, macOS und Windows; `qorechaind` wird nicht benötigt. Welche Sign-Bytes-Version zu verwenden ist, liest er aus dem Netzwerk.

On-Chain-Heartbeats sind standardmäßig aktiviert. Der Daemon sendet einen, sobald seit dem eigenen `last_heartbeat` der Chain für den Node 1.000 Blöcke (`[heartbeat] interval_blocks`, passend zum `heartbeat_interval` der Chain) vergangen sind, und prüft dies alle 60 Sekunden, sodass ein Neustart weder einen doppelten Heartbeat sendet noch ein ganzes Intervall wartet. Jeder Heartbeat wird erst gemeldet, wenn er in einem Block ist.

Der Daemon wählt seinen Signierer beim Start:

- **Nativ** — der Keyring enthält den Operator-Schlüssel (aus `keys add-operator`), und er passt zu `operator_address`. Das ist der Normalfall.
- **`qorechaind`-Fallback** — andernfalls, wenn eine `qorechaind`-Binärdatei im `PATH` oder unter `[heartbeat] qorechaind_path` liegt. Er verwendet den Operator-Schlüssel im `qorechaind`-Keyring (`[heartbeat] key_name`, Home `qorechaind_home`, Standard `~/.qorechaind`) und den exportierten Node-Schlüssel unter `pqc/<key_name>.dilithium`. Die Passphrase des `qorechaind`-Keyrings gehört in `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE`; sie wird über stdin an `qorechaind` weitergeleitet und nie in eine Befehlszeile geschrieben.

Solange der Node nicht registriert ist, sendet er keine Heartbeats; stattdessen protokolliert er den Grund, einmal pro Zustandswechsel: keine Lizenz oder Lizenz aktiv, aber nicht registriert (führe `register` aus). `lightnode-sx status` zeigt die Zeilen `Signer:`, `Licence:` und `Registration:`, sodass der Grund ohne Lesen der Logs sichtbar ist. Gibt es keinen Signierer, läuft und synchronisiert der Node weiterhin, kann aber nicht on-chain aktiv bleiben, und `status` weist darauf hin.

## Der Light-Node-Tab im Dashboard

Der Tab **Tools → Light Node** des QoreChain Dashboards bündelt die Schritte:

1. **Downloads.** Er verlinkt die Light-Node-Binärdateien für das gewählte Netzwerk (dieselben Dateien wie unter `https://download.qore.host/<net>/lightnode/latest.json`, mit ihren sha256-Prüfsummen).
2. **Einrichtungsschritte.** Er zeigt die fünf obigen Schritte, abgestimmt auf die Version im Release-Manifest, und ob die Registrierung offen ist, gelesen aus dem Feld `registration` des Manifests.
3. **Lizenzkauf** (nur Mainnet). Er nimmt die Lizenzadresse vor der Zahlung entgegen und zeigt **Paid, awaiting on-chain grant**, bis die Chain die Vergabe bestätigt. Er warnt dich, wenn die eingegebene Adresse deine eigene Custodial-Wallet im Dashboard ist, und weist zur Information darauf hin, wenn die Adresse bereits einen Post-Quantum-Schlüssel hat.
4. **Status.** Ein Status-Panel zeigt den Zustand des Nodes, wie er von der Chain gelesen wird.

Die Registrierung selbst ist immer die Transaktion, die von `lightnode-sx register` (oder `lightnode-ux register`) gesendet wird. Das Dashboard registriert keine Nodes; sein altes Registrierungsformular, das nur einen Eintrag speicherte, wurde entfernt.

## Wie es weitergeht

- [Belohnungen und Überwachung](/light-node/rewards-and-monitoring) — wie der 3%-Anteil gutgeschrieben, eingefordert und überwacht wird.
- [SX-Edition](/light-node/sx-edition) — der `register`-Befehl und die vollständige CLI-Referenz.
