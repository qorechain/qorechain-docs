---
slug: /rollups/rdk-v328
title: "RDK unter v3.2.8: Was sich geändert hat"
sidebar_label: RDK unter v3.2.8
sidebar_position: 11
---

# RDK unter v3.2.8: Was sich geändert hat

QoreChain-Release v3.2.8 ändert, wie Rollups abgewickelt werden. Rollups können ihre Daten jetzt auf der Chain ablegen, die Chain ihre Transaktionen ordnen lassen (Based Sequencing), optimistisch mit einem Fraud Proof abwickeln, der den Batch erneut ausführt, ihre Posts auf eine Gruppe von Mitgliedern beschränken und Groth16-Abhebungs-Roots so binden, dass jede 32-Byte-Root akzeptiert wird. Das STARK-Settlement ist bis zu einem späteren Release pausiert. Diese Seite beschreibt, was jede Änderung bewirkt und wie man sie nutzt. Sie richtet sich an Rollup-Betreiber und Entwickler, die auf dem Modul `x/rdk` aufbauen.

:::caution Vorerst nur im Testnet

v3.2.8 läuft seit dem 12. November 2026 im öffentlichen Testnet `qorechain-diana`. Das Mainnet hat es noch nicht angewendet, daher wird jede Funktion auf dieser Seite dort abgelehnt, bis es so weit ist. Betrachten Sie die Beispiele als Testnet-Beispiele.

:::

:::note Welche Werkzeuge das heute können

* **Knoten-Kommandozeile (`qorechaind`)**: Jede Nachricht auf dieser Seite hat einen Befehl. Das ist die Linux-Knoten-Binärdatei; es gibt keine paketierte macOS-Binärdatei, daher führen Sie sie auf einem Mac auf einem Linux-Host aus oder lesen die Chain über REST.
* **RDK-Kit**: RDK 0.9.0 unterstützt v3.2.8. Es ist in jeder Registry veröffentlicht: npm (`@qorechain/rdk`, `@qorechain/rdk-cli`, `create-qorechain-rollup`), PyPI (`qorechain-rdk`), crates.io (`qorechain-rdk`), Maven (`io.github.qorechain:qorechain-rdk`) und Go (`github.com/qorechain/qorechain-rdk/packages/go` v0.9.0). Versionshinweise: https://github.com/qorechain/qorechain-rdk/releases/tag/v0.9.0.
* **RDK-Clients für Python, Go, Rust und Java**: Version 0.9.0 jedes Clients unterstützt v3.2.8. Der Durchlauf von Anfang bis Ende unten verwendete den TypeScript-Client.

:::

## Was sich auf einen Blick geändert hat {#at-a-glance}

| Bereich | Verhalten ab v3.2.8 |
| --- | --- |
| Daten ablegen | `MsgPostRollupData` legt eine Payload in einer Transaktion ab und behält eine Verpflichtung (Commitment) auf der Chain unter der nächsten Inbox-Sequenz des Rollups. |
| Based Sequencing | Die Chain ordnet die Transaktionen eines Rollups nach ihrer Aufnahme. Gesetzt bei der Erstellung oder per Governance mit `MsgSetRollupSequencing`. |
| Optimistische Rollups | Neue optimistische Rollups (`nft`, `custom`) nutzen das Ausführungsmodell `qledger-v1` und müssen Based sein. Ein Fraud Proof führt den Batch erneut aus. |
| Submitter-Bond | Batches eines `qledger-v1`-Rollups brauchen einen Bond (`MsgBondRollupSubmitter`). Ein bestätigter Fraud Proof verbrennt die Hälfte und zahlt die Hälfte an den Challenger. |
| Einzahlungen | `MsgDepositToRollup` schreibt einem 32-Byte-Account auf einem `qledger-v1`-Rollup Guthaben gut. |
| Private Rollups | `defi`-Rollups, die mit der Privatsphäre `encapsulated` erstellt wurden, akzeptieren nur ML-KEM-1024-Umschläge an ihre Mitglieder (`MsgSetRollupMembers`). |
| Groth16-Eingaben | Eingaben werden modulo dem BLS12-381-Skalarkörper gelesen. `withdrawals_root` darf beliebige 32 Bytes sein und wird reduziert gespeichert. |
| STARK | STARK-Schlüssel und STARK-Batches werden bis zu einem späteren Release abgelehnt. |
| Aufbewahrung | Verpflichtungen für abgelegte Daten werden für `posted_data_retention_blocks` aufbewahrt, bei `qledger-v1`-Rollups mit länger aufbewahrten Checkpoints. |

## Warum das wichtig ist {#why}

Vor v3.2.8 hatten die Daten eines Rollups keinen Platz auf der Chain, sodass jeder, der einen Batch prüfte, der Kopie des Sequencers vertrauen musste. Das Ablegen von Daten und die Ordnung nach Aufnahme beseitigen dieses Vertrauen: Die Chain selbst verzeichnet, was abgelegt wurde und in welcher Reihenfolge, und ein Batch muss genau diesen Bereich verbrauchen. Bei optimistischen Rollups prüft eine Anfechtung jetzt die Ausführung und nicht nur eine Root, sodass ein falscher Batch den Bond seines Einreichers kostet. Private Rollups lassen eine Gruppe Daten auf einer öffentlichen Chain teilen, ohne sie zu veröffentlichen.

## Rollup-Daten ablegen {#posting-data}

`MsgPostRollupData` (Befehl `tx rdk post-data`) sendet eine Payload in einer Transaktion. Die Bytes bleiben in der Transaktion und sind damit im Block. Die Chain behält eine Verpflichtung unter der nächsten Inbox-Sequenz des Rollups (beginnend bei 1): den SHA-256 der Daten, ihre Größe, den Poster und die Höhe. Außerdem erweitert sie den Inbox-Akkumulator des Rollups.

* **Wer ablegen darf**: der Sequencer des Rollups (sein Ersteller, wenn keine Sequencer-Adresse gesetzt ist). Bei einem Based-Rollup jeder.
* **Größe**: höchstens `max_posted_data_bytes` pro Post (Standard 131,072 Bytes, harte Obergrenze 1 MiB) und `max_posted_data_bytes_per_block` über alle Rollups hinweg (Standard 524,288 abrechenbare Bytes).
* **Gebühr**: `posted_data_fee_per_byte` uqor pro abrechenbarem Byte (Standard 10), und ein Post wird mit mindestens 1 KiB abgerechnet. Die Gebühr geht an den Fee Collector und wird wie eine Transaktionsgebühr aufgeteilt. Gas wird zusätzlich berechnet.
* **Aufbewahrung**: Die Verpflichtung wird nach `posted_data_retention_blocks` (Standard 648,000) bereinigt. Die Bytes bleiben in der Blockhistorie.
* **Verwendung in einem Batch**: Ein Batch eines Native-DA-Rollups, das nicht Based ist, darf einen aufbewahrten Post mit `data_hash` gleich dem SHA-256 der Daten referenzieren.

Kommandozeile (Linux-Knoten-Binärdatei):

```bash
# Post a file's raw bytes to a rollup
qorechaind tx rdk post-data my-rollup @payload.bin --from <key> --chain-id qorechain-diana

# Or post hex
qorechaind tx rdk post-data my-rollup 68656c6c6f --from <key> --chain-id qorechain-diana

# Read a commitment back (the payload itself is in the transaction at its height)
qorechaind query rdk posted-data my-rollup 1
```

Eine Verpflichtung über REST lesen (im Testnet geprüft, siehe [Geprüfte Routen](#checked-routes)):

```bash
curl -s https://api-testnet.qore.host/qorechain/rdk/v1/posted_data/<rollup-id>/1
```

Die Antwort enthält `data_hash`, `size`, `poster`, `height`, `inbox_acc` und `expires_at_height`. Eine Sequenz, die nie abgelegt oder die bereinigt wurde, liefert HTTP 404.

## Based Sequencing {#based-sequencing}

Ein Based-Rollup wird durch die Aufnahme auf QoreChain geordnet. Jeder Post erhält die nächste Inbox-Sequenz, und jeder Batch verbraucht die Inbox der Reihe nach.

* Erstellen Sie ein Rollup mit `--sequencing based` als Based, oder stellen Sie ein bestehendes Rollup per Governance mit `MsgSetRollupSequencing` darauf um.
* Jeder Batch setzt `inbox_end` (die Sequenz des letzten Posts, den er verbraucht) und trägt die Verpflichtung auf den Inbox-Bereich als `data_hash`. Fragen Sie die Chain mit `query rdk inbox` danach (sie liefert `range_data_hash`).
* Ein Based-Rollup wird nur per Governance pausiert, fortgesetzt und gestoppt.

Wer bei einem Based-Rollup Batches einreichen darf, hängt vom Rollup ab:

| Rollup | Wer Batches einreicht |
| --- | --- |
| zk mit einem Groth16-Schlüssel (`defi`) | Jeder Account. Der Beweis bindet die Roots, den Inbox-Bereich und die Abhebungs-Root. |
| Based-Settlement (`gaming`, `enterprise`) | Nur der Sequencer des Rollups. |
| optimistisch mit `qledger-v1` (`nft`, `custom`) | Jeder Account, der einen Submitter-Bond hält. |

Optimistische Rollups ohne `qledger-v1` und STARK-Rollups können in diesem Release nicht Based sein.

```bash
# Create a based defi rollup (a Groth16 key is registered separately with set-verification-key)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 --sequencing based --from <key> --chain-id qorechain-diana

# Inbox head, consumed position and the range hash for a batch ending at the head
qorechaind query rdk inbox my-defi-rollup

# Range hash for a batch that ends earlier
qorechaind query rdk inbox my-defi-rollup --inbox-end 12
```

Der Akkumulator und die Bereichsverpflichtung, für Prover, die sie berechnen wollen, ohne einem Knoten zu vertrauen:

```
acc_n = SHA-256("qorechain/rdk/inbox/v1" | lp(chain_id) | lp(rollup_id) | acc_(n-1)
                | be64(n) | be64(height) | lp(poster) | SHA-256(data))
range = SHA-256("qorechain/rdk/inbox-range/v1" | lp(chain_id) | lp(rollup_id)
                | be64(from) | be64(to) | acc_from | acc_to)
```

`acc_0` sind 32 Nullbytes, und `lp` ist ein 4-Byte-Längenpräfix in Big-Endian.

## Optimistische Rollups mit qledger-v1 {#qledger-v1}

Ab v3.2.8 kann ein neues optimistisches Rollup nicht mehr ohne Ausführungs-VM erstellt werden. Die Presets `nft` und `custom` brauchen `--execution-vm qledger-v1` zusammen mit `--sequencing based`. Optimistische Rollups, die vor v3.2.8 erstellt wurden, bleiben unverändert.

`qledger-v1` ist ein Account-Ledger in uqor (ein Sparse Merkle Tree mit SHA-256) mit signierten Überweisungen und Abhebungen. Account-Schlüssel sind ausschließlich ML-DSA-44. Seine Eingaben sind seine Inbox:

* **Nutzer-Posts**: je eine Transaktion, höchstens 6 KiB.
* **Einzahlungen**: `MsgDepositToRollup` schreibt einer 32-Byte-Account-ID Guthaben gut. Die Chain hängt die Einzahlung selbst an die Inbox an.

```bash
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based --from <key> --chain-id qorechain-diana

# Deposit 1,000,000 uqor (1 QOR) for a 32-byte L2 account id
qorechaind tx rdk deposit my-nft-rollup <64-hex-chars> 1000000 --from <key> --chain-id qorechain-diana
```

### Submitter-Bond und Pending {#submitter-bond}

Jeder Account darf Batches einreichen, sobald er auf diesem Rollup einen Submitter-Bond von mindestens `min_submitter_bond` hält (Standard 1,000 QOR, 1,000,000,000 uqor).

```bash
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 --from <key> --chain-id qorechain-diana
qorechaind query rdk submitter-bond my-nft-rollup <submitter-address>
qorechaind tx rdk unbond-submitter my-nft-rollup --from <key> --chain-id qorechain-diana
```

Die Bond-Abfrage liefert `amount`, `last_submit_time`, `unbond_after` und `pending`. `pending` ist die Anzahl der Batches dieses Einreichers, die noch auf Finalität warten: Sie steigt mit jedem eingereichten Batch und sinkt, wenn einer finalisiert oder abgelehnt wird. Ein Einreicher darf weniger als 1,024 Batches ausstehend haben. Ein Bond kann mit `unbond-submitter` ein volles Challenge-Fenster nach dem letzten Batch des Halters zurückgenommen werden.

### Batch-Regeln {#batch-rules}

`consumed` sei die Inbox-Position, ab der der nächste Batch beginnt, und `head` der letzte Post (beide in `query rdk inbox`). Ein Batch mit `inbox_end = end` wird zugelassen, wenn alle folgenden Bedingungen erfüllt sind:

1. Der Einreicher hält mindestens `min_submitter_bond` und hat weniger als 1,024 Batches ausstehend.
2. `consumed < end <= head`. Ein Batch verbraucht mindestens einen Eintrag.
3. `end - consumed <= 64`. Höchstens 64 Inbox-Einträge pro Batch.
4. Die Chain kann den Akkumulator bei `end` noch erzeugen: `end` ist der Head, oder die Verpflichtung von Post `end` ist aufbewahrt (`query rdk inbox <rollup> --inbox-end <end>` liefert einen `range_data_hash`).
5. Ein Batch mit weniger als 64 Einträgen, der vor dem Head endet, endet entweder unmittelbar vor einem Post aus den letzten 20 Blöcken oder an einem Checkpoint (`end` ist ein Vielfaches von 64), dessen nächster Post nicht mehr aufbewahrt ist.
6. `data_hash` ist die Inbox-Bereichsverpflichtung von `consumed` bis `end`, der erste Batch beginnt mit der leeren Ledger-Root, und `state_root` hat 32 Bytes.

Ein Client kann `end` so wählen:

```
want = min(head, consumed + 64)
if want == head or retained(want):
    end = want                          # to the head, or a full batch of 64
else:
    end = (consumed // 64 + 1) * 64     # the next checkpoint, which is retained
```

Einreichen mit der Kommandozeile:

```bash
qorechaind tx rdk submit-batch my-nft-rollup 0 <state-root-hex> \
  --prev-state-root <hex> --tx-count 4 --inbox-end 4 \
  --data-hash <range_data_hash from query rdk inbox> \
  --withdrawals-root <hex> --from <key> --chain-id qorechain-diana
```

### Fraud Proofs {#fraud-proofs}

Während des Challenge-Fensters darf jeder `MsgChallengeBatch` mit einem `qledger-v1`-Fraud-Proof senden: den Eingaben des Batches und einem Merkle-Zeugen der Accounts, die sie berühren. Die Chain führt den Batch erneut aus.

* Ist die State Root oder die Abhebungs-Root falsch, wird der Batch abgelehnt, ebenso jeder darauf aufbauende Batch. Die Inbox wird zurückgerollt.
* Der gesamte Bond des Einreichers wird gekürzt (Slashing). **Die Hälfte wird verbrannt, die Hälfte an den Challenger gezahlt.** Die verbrannte Hälfte wird im Burn-Modul unter der Quelle `rollup_slash` verzeichnet. Ein Einreicher, der seinen eigenen falschen Batch anficht, verliert trotzdem die Hälfte seines Bonds.
* Ein Beweis, der keinen falschen Batch zeigt, scheitert mit Fehler 51 und ändert nichts.

```bash
qorechaind tx rdk challenge-batch my-nft-rollup 1 --proof <hex-fraud-proof> --from <key> --chain-id qorechain-diana
```

RDK 0.9.0 enthält die `qledger-v1`-Helfer, die die Beweis-Bytes bauen.

Batches, die nicht angefochten werden, finalisieren von selbst, wenn das Challenge-Fenster endet. Abhebungen werden nur aus finalisierten Batches bezahlt, aus dem Einzahlungspool des Rollups, nie aus dem Escrow des Erstellers. Ein Rollup kann nicht gestoppt werden, solange der Pool Einzahlungen hält (Fehler 54).

### Aufbewahrung und Leerlaufzeiten {#retention}

* Eine Post-Verpflichtung wird für `posted_data_retention_blocks` aufbewahrt, danach, solange kein finalisierter Batch sie abdeckt, für bis zu 4 weitere Aufbewahrungszeiträume.
* Danach wird sie bereinigt, außer einem Checkpoint: Jeder Post, dessen Sequenz ein Vielfaches von 64 ist, behält seine Verpflichtung, bis ein finalisierter Batch sie abdeckt oder das Rollup gestoppt wird.
* Ein gestopptes Rollup behält keine Verpflichtung über seinen Aufbewahrungszeitraum hinaus.
* `posted_data_retention_blocks` muss mindestens so groß sein wie das längste geltende Challenge-Fenster, gezählt als ein Block pro Sekunde (`default_challenge_window` und das Fenster jedes nicht gestoppten Rollups). Eine Parameteränderung, die ihn kürzer lässt oder ein Fenster darüber hebt, wird mit `invalid params` abgelehnt. Die Obergrenze ist 25,920,000.
* Beim Upgrade auf v3.2.8 wird ein gespeicherter Wert unterhalb dieses Fensters auf es angehoben. Standardparameter bleiben unverändert.
* **Testnet-Werte**: `default_challenge_window` beträgt 3,600 Sekunden (der Core-Standard und der Wert im Stil des Mainnets sind 604,800 Sekunden, 7 Tage). Abgelegte Daten werden 648,000 Blöcke lang aufbewahrt, Blobs und finalisierte Batches 432,000 Blöcke.

Nach einer langen Leerlaufzeit, mit mehr als 64 nicht verbrauchten Posts und bereinigten Verpflichtungen, holt ein Einreicher der Reihe nach auf: ein Batch bis zum nächsten Vielfachen von 64, falls `consumed` keines ist, dann volle Batches zu 64 von Checkpoint zu Checkpoint, dann ein letzter Batch bis zum Head (oder bis zu einer beliebigen aufbewahrten Position nach Regel 5). Im Normalbetrieb ändert sich nichts: Batches mit bis zu 64 Einträgen, bis zum Head oder bis unmittelbar vor einen aktuellen Post.

## Private Rollups {#private-rollups}

Ein `defi`-Rollup (Groth16), das mit der Privatsphäre `encapsulated` erstellt wurde, akzeptiert nur Posts, die ML-KEM-1024-Umschläge an seine Mitglieder sind.

Ein Umschlag verschlüsselt die Daten einmal mit AES-256-GCM unter einem frischen Schlüssel und kapselt diesen Schlüssel für den ML-KEM-1024-Schlüssel jedes Mitglieds aus dem KEM-Register der Chain. Eine Schlüsselverpflichtung stellt sicher, dass alle Mitglieder denselben Inhalt öffnen. Die Chain prüft, dass der Umschlag wohlgeformt ist und dass jeder Eintrag den aktuellen Schlüssel des Mitglieds nennt. Sie entschlüsselt nie.

* Der Ersteller setzt die Mitglieder mit `MsgSetRollupMembers`: höchstens 32, jedes mit einem registrierten ML-KEM-1024-Schlüssel. Jede Änderung beginnt eine neue Mitgliedschaftsepoche.
* Posts, der Poster, Zeitpunkte, Größen, Mitglieder, Roots und Abhebungen (Empfänger und Betrag) bleiben öffentlich. Nur die Inhalte der Posts sind privat.

```bash
qorechaind tx rdk create-rollup my-private-rollup defi 10000000000 --privacy encapsulated \
  --verification-key-file vk.json --from <key> --chain-id qorechain-diana

qorechaind tx rdk set-members my-private-rollup <addr1>,<addr2> --from <key> --chain-id qorechain-diana

# Encrypt to the members and post, in one step
qorechaind tx rdk post-private-data my-private-rollup @message.bin --from <key> --chain-id qorechain-diana

# A member opens a post offline
qorechaind tx rdk decrypt-private-data my-private-rollup @envelope.hex
```

## Groth16-Eingaben und die Abhebungs-Root {#groth16}

Ein Groth16-Batch über BLS12-381 (das Profil `defi`, SNARK) wird gegen öffentliche Eingaben verifiziert, jede ein 32-Byte-Wert, der als Big-Endian-Ganzzahl gelesen und modulo der Ordnung des Skalarkörpers reduziert wird:

```
r = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001
input_i = int.from_bytes(value_i, "big") mod r
values  = prev_state_root, state_root, data_hash, withdrawals_root
```

Ein Batch, der eingereicht wurde, bevor Abhebungen gebunden wurden, hat nur die ersten drei Eingaben. Der Zeuge des Provers muss dieselben reduzierten Werte verwenden.

Ob ein Wert bereits unter `r` liegen muss, hängt davon ab, wer ihn setzt:

| Wert | Wer ihn setzt | Muss unter r liegen |
| --- | --- | --- |
| `state_root` | der Prover | ja |
| `prev_state_root` | die Chain (die zuletzt abgewickelte `state_root`), außer beim ersten Batch eines Rollups | nur beim ersten Batch |
| `data_hash` | die Chain, wenn gebunden (der Inbox-Bereich eines Based-Rollups, eine Verpflichtung für abgelegte Daten), sonst der Prover | nur wenn nicht gebunden |
| `withdrawals_root` | die Chain (die Wurzel des Abhebungsbaums, die `MsgExecuteWithdrawal` neu aufbaut) | nein |

Was das für einen Client bedeutet:

* Reichen Sie die Abhebungs-Root so ein, wie der Baum sie liefert. Sie darf beliebige 32 Bytes sein.
* Die Chain speichert `withdrawals_root mod r` als 32 Big-Endian-Bytes. Die Batch-Abfrage zeigt diesen gespeicherten Wert, mit `withdrawals_root_reduced` true. Etwa 55 Prozent der Baum-Roots liegen bei oder über `r`, sodass der gespeicherte Wert oft von den eingereichten Bytes abweicht.
* `MsgExecuteWithdrawal` ändert sich für den Client nicht: Senden Sie die Blattfelder und die Geschwister-Hashes. Die Chain baut die Root neu auf und akzeptiert die Abhebung, wenn `rebuilt_root mod r == stored_root mod r`.
* Zwei Einreichungen desselben Batches, deren Roots sich um ein Vielfaches von `r` unterscheiden, sind derselbe Batch. Die erste wird abgewickelt, die zweite als bereits existierender Batch abgelehnt, und jede Abhebung im Baum wird gegen die gespeicherte Root bezahlt.
* Vergleichen Sie nach dem Settlement die gespeicherte Root mit `tree_root mod r`, nicht mit `tree_root`.

Optimistische Batches, `qledger-v1`-Batches und Groth16-Batches aus der Zeit vor der Reduktionsregel speichern und vergleichen die exakten 32 Bytes. Zur Kodierung von Baum und Blättern siehe [ZK / STARK & Auszahlungen](/rollups/zk-stark-withdrawals).

## Das STARK-Settlement ist pausiert {#stark}

Die einzige STARK-Aussage, die der Verifizierer unterstützt, beweist wiederholtes Quadrieren zwischen zwei 64-Bit-Werten. Das schränkt weder die Abhebungen noch die Daten eines Rollups ein. Ab v3.2.8 kann kein STARK-Schlüssel gesetzt werden, und die Batches eines STARK-Rollups werden abgelehnt (Fehler 52). Die Governance kann ein solches Rollup auf einen Groth16-Schlüssel umstellen. Das STARK-Settlement kehrt in einem späteren Release mit einer echten Rollup-Aussage zurück.

## Neue Nachrichten {#messages}

| Nachricht | Befehl | Wer sie sendet |
| --- | --- | --- |
| `MsgPostRollupData` | `tx rdk post-data` | Der Sequencer, oder jeder bei einem Based-Rollup |
| `MsgSetRollupSequencing` | Governance-Vorschlag | Governance |
| `MsgDepositToRollup` | `tx rdk deposit` | Jeder, für ein `qledger-v1`-Rollup |
| `MsgBondRollupSubmitter` | `tx rdk bond-submitter` | Ein Batch-Einreicher |
| `MsgUnbondRollupSubmitter` | `tx rdk unbond-submitter` | Ein Batch-Einreicher |
| `MsgSetRollupMembers` | `tx rdk set-members` | Der Ersteller eines privaten Rollups |
| `MsgSubmitBatch` Feld `inbox_end` | `tx rdk submit-batch --inbox-end` | Der Einreicher eines Batches eines Based-Rollups |

`create-rollup` akzeptiert außerdem `--sequencing`, `--execution-vm` und `--privacy`. Die Kompatibilitätsmatrix lautet jetzt: Optimistisch mit Fraud Proofs braucht `qledger-v1` und Based Sequencing, und ZK-Settlement bedeutet SNARK.

## Durchgespielter Ablauf: erstellen, bonden, einzahlen, ablegen, Batch, anfechten, finalisieren, abheben {#worked-flow}

:::note Vom RDK-Team am 12. November 2026 im Testnet ausgeführt
Das RDK-Team hat diesen Ablauf am 12. November 2026 von 06:22 bis 07:27 UTC von Anfang bis Ende im Testnet `qorechain-diana` ausgeführt. Er wurde vollständig über RDK 0.9.0 (TypeScript) mit der RDK-Gebühr `auto` bei 0.15 uqor pro Gas gesteuert. Jeder Schritt lieferte Code 0. Er wurde nicht vom Autor dieser Seite ausgeführt.
:::

| Schritt | Nachricht | Verbrauchtes Gas / gewünschtes Gas |
| --- | --- | --- |
| 0 | Zuerst den Post-Quanten-Schlüssel des neuen Accounts in einer eigenen Transaktion registrieren (`MsgRegisterPQCKeyV2` mit Besitznachweis). Die RDK-Clients tun das automatisch; ohne es wird die erste echte Transaktion mit pqc-Code 8 abgelehnt | 348,917 / 600,000 |
| 1 | `MsgCreateRollup`: Profil `nft`, Ausführungs-VM `qledger-v1`, Sequencing `based`, Stake 10,000 QOR (1% verbrannt) | 301,260 / 349,199 |
| 2 | `MsgBondRollupSubmitter`, 1,000 QOR | 178,059 / 263,425 |
| 3 | `MsgDepositToRollup` zweimal (3 QOR und 1 QOR; das Minimum ist 1 QOR) | je etwa 240,000 / 350,000 |
| 4 | `MsgPostRollupData` zweimal (eine signierte qledger-Überweisung und eine signierte qledger-Abhebung), plus die Gebühr für abgelegte Daten (10 uqor pro abrechenbarem Byte, mindestens 1 KiB abgerechnet) | je etwa 328,500 / 474,000 |
| 5 | `planQledgerBatch`, dann `MsgSubmitBatch` für 4 Inbox-Einträge (`inbox_end` 4, `data_hash` der Inbox-Bereich). Batch-Status `submitted`, Bond `pending` 1 | 712,379 / 1,011,431 |
| 6 | Fraud-Test: ein weiterer Post, dann ein Batch mit absichtlich falscher State Root (233,990 / 341,742), dann `MsgChallengeBatch` mit dem vom RDK gebauten Fraud Proof (4,136 Bytes) | 450,186 / 644,417 |
| 7 | Batch 0 finalisierte von selbst nach dem Challenge-Fenster des Testnets von 3,600 Sekunden | keine Transaktion |
| 8 | `MsgExecuteWithdrawal` über 0.3 QOR mit dem qledger-Merkle-Beweis des RDK | 192,768 / 284,220 |

Bemerkenswerte Ergebnisse:

* **Schritt 6**: Der falsche Batch wurde abgelehnt, der Bond des Einreichers wurde gekürzt (die Hälfte verbrannt, die Hälfte an den Challenger gezahlt), die Inbox wurde zurückgerollt, und der frühere gute Batch blieb unberührt.
* **Schritt 8**: Der Einzahlungspool des Rollups ging von 4.0 auf 3.7 QOR, und das Guthaben des Empfängers stieg um 0.3 QOR abzüglich der Gebühr.

Die Kommandozeile hat für jeden Schritt ein Gegenstück. Diese einzelnen Befehle wurden für diese Seite nicht ausgeführt und folgen den Definitionen der Knoten-CLI:

```bash
CHAIN="--chain-id qorechain-diana --from <key>"

# 1. Create an optimistic, based qledger-v1 rollup (needs the creation stake)
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based $CHAIN

# 2. Bond the submitter (at least min_submitter_bond)
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 $CHAIN

# 3. Deposit funds for an L2 account
qorechaind tx rdk deposit my-nft-rollup <64-hex-account-id> 1000000 $CHAIN

# 4. Post a signed L2 transaction (one transaction, at most 6 KiB)
qorechaind tx rdk post-data my-nft-rollup @signed-l2-tx.bin $CHAIN

# 5. Read the range hash, execute the entries off chain, then submit the batch
qorechaind query rdk inbox my-nft-rollup
qorechaind tx rdk submit-batch my-nft-rollup 0 <new-state-root> --tx-count <n> \
  --inbox-end <end> --data-hash <range_data_hash> --withdrawals-root <root> $CHAIN

# 6. A challenger who finds a wrong root sends a fraud proof inside the window
qorechaind tx rdk challenge-batch my-nft-rollup 0 --proof <hex-fraud-proof> $CHAIN

# 7. An unchallenged batch finalizes by itself when the challenge window ends
qorechaind query rdk batch my-nft-rollup --index 0   # status finalized

# 8. Withdraw from the finalized batch (anyone may submit the proof)
qorechaind tx rdk execute-withdrawal my-nft-rollup 0 <withdrawal-index> <recipient> uqor <amount> \
  --proof <sibling-hex>,<sibling-hex> $CHAIN
```

Das Challenge-Fenster eines Rollups steht in seinem `challenge_window_sec`. Im Testnet beträgt `default_challenge_window` absichtlich 3,600 Sekunden, damit Rollups innerhalb einer Stunde erprobt werden können; der Core-Standard und der Wert im Stil des Mainnets sind 604,800 Sekunden (7 Tage). Die Schritte 5 bis 8 brauchen Roots und Beweise, die aus dem Ledger berechnet werden; RDK 0.9.0 enthält die `qledger-v1`-Helfer, die das tun.

## Die Chain mit dem veröffentlichten TypeScript-Kit lesen {#typescript}

Diese Lesezugriffe verwenden Namen aus `@qorechain/rdk`, das v3.2.8 ab 0.9.0 unterstützt. Sie können die neuen Felder auch direkt mit `curl` lesen, wie unten gezeigt.

```ts
import { RestClient } from "@qorechain/rdk";

const rest = new RestClient("https://api-testnet.qore.host");

const params = await rest.getParams();
const rollup = await rest.getRollup("my-nft-rollup");
const latest = await rest.getLatestBatch("my-nft-rollup");
console.log(params, rollup, latest);
```

Dieses Snippet wurde für diese Seite nicht ausgeführt.

## Geprüfte Routen {#checked-routes}

Diese schreibgeschützten Routen wurden am 12. November 2026 vom öffentlichen Testnet angefordert.

| Route | Status |
| --- | --- |
| `GET /qorechain/rdk/v1/params` | 200 |
| `GET /qorechain/rdk/v1/rollups` | 200 |
| `GET /qorechain/rdk/v1/rollup/<id>` | 200 |
| `GET /qorechain/rdk/v1/inbox/<id>` und `?inbox_end=N` | 200 |
| `GET /qorechain/rdk/v1/posted_data/<id>/<sequence>` | 200, oder 404 für eine nie abgelegte oder bereinigte Sequenz |
| `GET /qorechain/rdk/v1/submitter_bond/<id>/<address>` | 200 |
| `GET /qorechain/rdk/v1/batches/<id>`, `latest_batch/<id>`, `batch/<id>/<index>` | 200 |
| jede Route für ein unbekanntes Rollup | 404 |

```bash
BASE=https://api-testnet.qore.host/qorechain/rdk/v1
curl -s $BASE/params
curl -s $BASE/inbox/<rollup-id>
curl -s $BASE/submitter_bond/<rollup-id>/<address>
curl -s $BASE/latest_batch/<rollup-id>
```

Die Modulparameter enthalten jetzt `max_posted_data_bytes`, `max_posted_data_bytes_per_block`, `posted_data_fee_per_byte`, `posted_data_retention_blocks`, `min_submitter_bond` und `finalized_batch_retention_blocks`. Die Batch-Ansicht ergänzt `inbox_start`, `inbox_end` und `withdrawals_root_reduced`, und die Rollup-Ansicht ergänzt `sequencing`, `execution_vm`, `privacy`, `members`, `members_epoch` und `deposit_pool`. Die Inbox-Antwort hat `head_sequence`, `consumed_sequence` und `range_data_hash`, das leer ist, wenn die Verpflichtung am angefragten Ende nicht verfügbar ist.

## Limits und Fehler {#limits}

| Limit oder Fehler | Wert oder Bedeutung |
| --- | --- |
| Post-Größe | `max_posted_data_bytes`, Standard 131,072 Bytes, Obergrenze 1 MiB |
| Abgelegte Bytes pro Block | `max_posted_data_bytes_per_block`, Standard 524,288 abrechenbare Bytes |
| Post-Gebühr | Standardmäßig 10 uqor pro abrechenbarem Byte, mindestens 1 KiB abgerechnet |
| Aufbewahrung abgelegter Daten | Standardmäßig 648,000 Blöcke, höchstens 25,920,000, nie unter dem längsten Challenge-Fenster in Sekunden |
| `qledger-v1`-Post | Eine Transaktion, höchstens 6 KiB |
| Batch-Größe | 1 bis 64 Inbox-Einträge |
| Ausstehende Batches pro Einreicher | weniger als 1,024 |
| Mitglieder eines privaten Rollups | höchstens 32, jedes mit einem registrierten ML-KEM-1024-Schlüssel |
| Abgewickelte Batches pro Block, pro Rollup | `max_batches_per_block`, Standard 10 (Fehler 40) |
| Fehler 41, 44, 47 | Die Funktion ist auf dieser Höhe nicht aktiviert (das Netzwerk hat v3.2.8 nicht angewendet) |
| Fehler 42, 43 | Post zu groß, oder das Post-Limit des Blocks ist erreicht |
| Fehler 45 | Based Sequencing ist für dieses Rollup nicht verfügbar |
| Fehler 46 | Der Batch passt nicht zur Inbox des Rollups (falsches `inbox_end` oder `data_hash`) |
| Fehler 48 | Ungültiger Ausführungs- oder Privatsphäre-Modus |
| Fehler 49 | Submitter-Bond erforderlich |
| Fehler 50 | Submitter-Bond ist noch gesperrt |
| Fehler 51 | Der Fraud Proof zeigt den Batch nicht als ungültig |
| Fehler 52 | STARK-Settlement ist pausiert |
| Fehler 53 | Der Post ist kein gültiger Umschlag an die Mitglieder des Rollups |
| Fehler 54 | Das Rollup hält noch Nutzereinzahlungen und kann deshalb nicht gestoppt werden |

## Verwandte Seiten {#related}

* [Rollups-Überblick](/rollups/overview)
* [Preset-Profile](/rollups/preset-profiles)
* [Einen Rollup bereitstellen](/rollups/deploying-a-rollup)
* [Datenverfügbarkeit](/rollups/data-availability)
* [ZK / STARK & Auszahlungen](/rollups/zk-stark-withdrawals)
* [Watchtower](/rollups/watchtower)
