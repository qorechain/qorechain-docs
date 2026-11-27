---
slug: /build-before-qday/workshop-4
title: "Workshop 4: Rollups, IBC und QoreX für Entwickler"
sidebar_label: "Workshop 4"
sidebar_position: 5
date: 2026-11-27
---

# Workshop 4: Rollups, IBC und QoreX für Entwickler

Workshop 4 geht unter die Anwendungsebene. Erstens betreiben Sie ein **Rollup**, das auf QoreChain abgewickelt wird: Sie erstellen es, heben daraus ab, beweisen, was es getan hat, betrügen dann absichtlich und sehen zu, wie der Betrug auffliegt. Zweitens senden Sie **QOR zum Testnet des Cosmos Hub und zurück** über IBC. Drittens sehen Sie, was Ihnen die **QoreX-Wallet** bietet, während Sie eine dApp entwickeln.

Jeder Befehl unten sagt, was er tut und was Sie sehen sollten. Der Code ist öffentlich: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), Ordner `workshop-4`. Alles hier läuft nur in Testnets. Test-Token haben keinen Wert.

**Wie lange das dauert:** etwa 45 Minuten für die Schritte. Das Rollup hat außerdem ein Challenge-Fenster von einer Stunde, während dessen Sie warten. Die drei Teile sind unabhängig voneinander: Während Sie in Teil 1 warten, können Sie Teil 2 oder Teil 3 machen.

## Was wir bauen {#what-we-built}

| Teil | App | Was sie zeigt |
| --- | --- | --- |
| 1 | **Ein Rollup** (Node.js, `@qorechain/rdk`) | Batches, deren Anker mit ML-DSA-87 signiert ist, eine Abhebung, die mit einem Merkle-Beweis ausgezahlt wird, eine Settlement-Quittung, die jeder prüfen kann, einen von einem Watchtower bewiesenen Betrug und eine geslashte Kaution. |
| 2 | **IBC hin und zurück** (Node.js, `@qorechain/qoresign`, cosmjs) | QOR geht zum Testnet des Cosmos Hub und kommt zurück, transportiert von QORel, dem QoreChain-Relayer. |
| 3 | **QoreX für Entwickler** (ein Leitfaden, kein neuer Code) | Die Provider, mit denen eine dApp spricht, die Integrationspakete, der Entwicklermodus, das Anfrageprotokoll und der Transaktionsinspektor. |

Die Neuerungen dahinter:

- **Ein Rollup, dessen Settlement post-quantenfähig signiert ist.** Der Ersteller signiert die State Root jedes ehrlichen Batches mit ML-DSA-87 (NIST FIPS 204), und die Chain speichert sie.
- **Fraud Proofs, die die Chain selbst prüft.** Mit dem Ledger `qledger-v1` führt QoreChain einen angefochtenen Batch erneut aus. Man muss niemandem vertrauen, der sagt, wer recht hatte.
- **Eine Reihenfolge, die von QoreChain kommt.** Beim Based Sequencing werden Rollup-Transaktionen in eine Inbox auf QoreChain geschrieben, sodass der Betreiber sie nicht umsortieren und nichts weglassen kann, was dort eingestellt wurde.
- **IBC mit hybrider Signatur auf der QoreChain-Seite.** Die Überweisung, die QoreChain verlässt, wird sowohl mit secp256k1 als auch mit ML-DSA-87 signiert.
- **Eine Wallet, die ihre Arbeit offenlegt.** QoreX hält fest, was jede Website angefragt hat, und lässt Sie prüfen, was die Chain gespeichert hat.

## Begriffe in diesem Leitfaden {#words}

| Begriff | Einfache Bedeutung |
| --- | --- |
| Rollup | Ein System, das seine eigenen Transaktionen außerhalb der Hauptchain ausführt und der Hauptchain von Zeit zu Zeit eine kurze Zusammenfassung schickt |
| Batch | Eine solche Zusammenfassung: der neue Zustand des Rollups und die Abhebungen, die es verlangt |
| State Root | Ein kurzer Fingerabdruck aller Guthaben im Rollup |
| Optimistisches Rollup | Batches werden sofort angenommen und erst dann endgültig, wenn während des Challenge-Fensters niemand beweist, dass sie falsch sind |
| Challenge-Fenster | Die Zeit, in der jeder beweisen kann, dass ein Batch falsch ist. Im Testnet ist es eine Stunde |
| Kaution | Geld, das der Betreiber sperrt und verliert, wenn er lügt |
| Watchtower | Ein Konto, das die Transaktionen des Rollups erneut abspielt und einen falschen Batch meldet |
| `qledger-v1` | Ein einfaches Ledger, das die Chain selbst erneut ausführen kann. Die Konten darin signieren mit ML-DSA-44 |
| Based Sequencing | Die Reihenfolge der Rollup-Transaktionen kommt aus der Inbox auf QoreChain, nicht vom Betreiber |
| Anker | Die State Root des Batches, vom Ersteller des Rollups mit ML-DSA-87 signiert und auf der Chain gespeichert |
| Merkle-Beweis | Ein paar Hashes, die beweisen, dass ein Element zu einer größeren Menge gehört, ohne die ganze Menge zu senden |
| IBC | Die Art, wie Cosmos-Chains Token ohne Verwahrer untereinander bewegen: Jede Chain betreibt einen Light Client der anderen und prüft Beweise |
| Kanal | Eine Spur zwischen zwei Chains |
| Voucher | Der Token, den die andere Chain erzeugt, während Ihr QOR auf QoreChain gesperrt bleibt |
| Escrow | Das Konto auf QoreChain, auf dem gesendetes QOR wartet, bis der Voucher zurückkommt |
| Relayer | Ein Programm, das Pakete und Beweise zwischen zwei Chains transportiert |

:::caution Nur Wegwerf-Konten im Testnet
Die Skripte erstellen neue Konten für Sie. Belassen Sie es dabei. Tragen Sie niemals die geheimen Wörter oder den Schlüssel eines Kontos mit echtem Geld in eine Datei oder einen Befehl ein.
:::

## Bevor Sie beginnen {#prerequisites}

Sie brauchen ein Terminal, **Node.js 20 oder neuer** und **Git**: siehe [Bevor Sie beginnen](/build-before-qday/prerequisites). Teil 3 braucht außerdem **pnpm** und die QoreX-Wallet. Prüfen Sie Node.js:

```bash
node -v
```

Es sollte `v20` oder höher ausgeben. Holen Sie sich den Beispielcode:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-4
```

Die erste Zeile lädt die Beispiele in einen Ordner namens `build-before-qday` herunter. Die zweite wechselt in den Ordner `workshop-4`.

Jeder Teil braucht eine andere Menge Test-QOR:

| Teil | Was Sie brauchen | Woher es kommt |
| --- | --- | --- |
| 1, Betreiberkonto | Etwa 12.010 Test-QOR: 10.000 Rollup-Stake, 1.000 für den Sidechain-Slot, 1.000 Submitter-Kaution und ein paar für Einzahlungen und Gebühren | Der Faucet gibt 100 QOR pro Tag, das reicht nicht. Bitten Sie das Fest-Team über die Kanäle von [build.qorechain.io](https://build.qorechain.io) um eine größere Testnet-Zuteilung |
| 1, Watchtower-Konto | Ein paar Test-QOR für Gebühren | Der [Faucet](/dashboard/faucet) |
| 2 | Etwa 2 Test-QOR und ein wenig Test-ATOM | Der [Faucet](/dashboard/faucet). Das Skript bittet den Faucet des Cosmos-Hub-Testnets um ATOM |
| 3 | Ein wenig Test-QOR in Ihrem QoreX-Testnet-Konto | Der [Faucet](/dashboard/faucet) |

:::tip Keine große Zuteilung? Sie können Teil 1 trotzdem verfolgen
`node rollup.mjs rollups` braucht kein Konto, und die Schritte unten zeigen, was jeder Befehl tut.
:::

## Teil 1: ein Rollup, das auf QoreChain abgewickelt wird {#part-1}

Code: [workshop-4/01-rollup](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/01-rollup). Paket: `@qorechain/rdk`, das Rollup Development Kit.

Sie gehen den ganzen Lebenszyklus eines kleinen optimistischen Rollups durch: es erstellen, einen Stake sperren, die Kaution des Betreibers hinterlegen, einzahlen, einen Batch einreichen, warten, abheben, eine Quittung erstellen, betrügen und den Betrug erwischen. Wie Rollups funktionieren, steht unter [Rollups](/rollups/overview).

### Schritt 1: installieren {#r1}

```bash
cd 01-rollup
npm install
node rollup.mjs help
```

| Teil | Was er tut |
| --- | --- |
| `cd 01-rollup` | Wechselt in den Ordner der Rollup-App. |
| `npm install` | Lädt die Pakete herunter, die die App verwendet. Die Versionen sind durch `package.json` und `package-lock.json` festgelegt. |
| `node rollup.mjs help` | Führt das Skript aus und listet alle Befehle auf. |

**Was Sie sehen sollten:** die Liste der Befehle: `init`, `rollups`, `prepare`, `status`, `withdraw`, `bond`, `receipt`, `cheat`, `watchtower`.

### Schritt 2: die Rollups im Testnet ansehen {#r2}

```bash
node rollup.mjs rollups
```

Liest die Chain. Es wird kein Konto gebraucht.

**Was Sie sehen sollten:** eine erste Zeile mit der Anzahl der Rollups sowie dem Stake und der Kaution, die die Chain heute verlangt (10.000 QOR und 1.000 QOR, als dieser Leitfaden geschrieben wurde), dann eine Zeile pro Rollup: seine ID, ob es aktiv ist, wie es abgewickelt wird (`optimistic` oder `zk`), sein VM-Typ und der Block, in dem es erstellt wurde.

**Warum:** Es zeigt, dass die Zahlen, die Sie bezahlen werden, von der Chain kommen, nicht vom Skript.

### Schritt 3: zwei Konten erstellen {#r3}

```bash
node rollup.mjs init
```

Erstellt zwei Konten, den **Betreiber** und den **Watchtower**. Ihre geheimen Wörter werden in `~/.config/qday-w4/operator.json` und `watcher.json` gespeichert, nur für Sie lesbar, und werden nie ausgegeben. Die Datei des Betreibers enthält außerdem zwei zufällige Seeds für die Rollup-Schlüssel von zwei Nutzern, Ana und Ben. Um die Dateien woanders abzulegen, setzen Sie die Umgebungsvariable `QDAY_DIR`.

**Was Sie sehen sollten:** zwei Adressen `qor1...`. Laden Sie beide auf, wie unter [Bevor Sie beginnen](#prerequisites) beschrieben.

**Warum zwei Konten:** Wer einen falschen Batch meldet, sollte nicht derjenige sein, der ihn veröffentlicht hat.

### Schritt 4: das Rollup erstellen und Batch 0 einreichen {#r4}

```bash
node rollup.mjs prepare
```

Dieser eine Befehl führt die gesamte Einrichtung aus. Er merkt sich in `~/.config/qday-w4/rollup-state.json`, was er schon erledigt hat, sodass Sie ihn erneut ausführen können, wenn etwas auf halbem Weg stehen bleibt.

| Was er sendet | Was es tut |
| --- | --- |
| `createRollup` | Erstellt Ihr Rollup mit der Ausführung `qledger-v1` und Based Sequencing und sperrt den Stake. |
| `bondRollupSubmitter` | Sperrt die Kaution von 1.000 QOR. |
| Zwei Einzahlungen | 3 QOR für Ana und 1 QOR für Ben gehen in das Rollup. |
| Drei Rollup-Transaktionen | Ana zahlt Ben 0,5 QOR, Ana hebt 0,3 QOR ab, Ben hebt 0,2 QOR ab. Jede wird mit dem ML-DSA-44-Schlüssel des Absenders signiert und in die Inbox auf QoreChain geschrieben. |
| `submitBatch` | Das Skript liest die Inbox zurück, führt sie erneut aus, um die neue State Root und die Withdrawals Root zu erhalten, und sendet Batch 0. Das RDK signiert seinen Anker mit ML-DSA-87. |

**Was Sie sehen sollten:** eine Zeile `ok` pro Transaktion, mit dem Block und einem Explorer-Link. Dann den Status Ihres Rollups, wobei Batch 0 als `submitted` angezeigt wird.

### Schritt 5: eine Stunde warten, dann prüfen {#r5}

```bash
node rollup.mjs status
```

**Was Sie sehen sollten:** das Rollup, den Stake des Betreibers, den Abhebungspool, die Kaution und jeden Batch. Nach dem Challenge-Fenster von einer Stunde wird Batch 0 als `finalized` angezeigt.

**Warum das Warten:** Ein optimistisches Rollup ist sicher, weil Zeit bleibt, einen Batch als falsch zu beweisen, bevor Geld abfließt.

### Schritt 6: nach QoreChain abheben {#r6}

```bash
node rollup.mjs withdraw 0
node rollup.mjs withdraw 1
```

Abhebung `0` sind die 0,3 QOR von Ana und Abhebung `1` die 0,2 QOR von Ben. In dieser Demo werden beide an das Betreiberkonto ausgezahlt. Das Skript baut einen Merkle-Beweis, dass die Abhebung in der Withdrawals Root von Batch 0 enthalten ist, und die Chain prüft ihn gegen die gespeicherte Root, bevor sie zahlt. Dann sendet das Skript dieselbe Abhebung ein zweites Mal.

**Was Sie sehen sollten:** die Anzahl der Hashes im Beweis, eine Zeile `ok`, das Guthaben des Empfängers vorher und nachher (dasselbe Konto hat die Gebühr bezahlt) und dann den zweiten Versuch, markiert mit `REFUSED`. Eine Abhebung wird nur einmal ausgezahlt.

Wenn Batch 0 noch nicht endgültig ist, bricht der Befehl ab und sagt, dass Abhebungen erst nach dem Challenge-Fenster ausgezahlt werden.

### Schritt 7: eine Settlement-Quittung {#r7}

```bash
node rollup.mjs receipt 0
```

Erstellt eine kleine JSON-Datei, die Batch 0 beschreibt, und speichert sie neben Ihren Schlüsseln. Jeder kann sie prüfen: Die Prüfung liest alles erneut von QoreChain und vertraut der Datei nicht.

| Prüfung | Was sie beweist |
| --- | --- |
| `rollupLayerBinding` | Das Rollup gehört zu dem Layer, den die Quittung nennt |
| `batchStateRoot` | Der Batch auf der Chain trägt genau diese State Root |
| `anchorOnChain` | Auf der Chain existiert ein Anker mit jedem Feld der Quittung |
| `creatorAuthority` | Der Signaturschlüssel wurde von der Chain gelesen, nicht aus der Quittung |
| `pqcSignature` | Die ML-DSA-87-Signatur über dem Anker ist gültig |
| `chainBinding` | Die Quittung gehört zu dieser Chain und ist keine Kopie von anderswo |

**Was Sie sehen sollten:** `VALID` mit einem Häkchen neben jeder der sechs Prüfungen. Dann ändert das Skript eine Hex-Ziffer der State Root und prüft erneut: `NOT VALID`.

**Warum das nützlich ist:** Eine Börse, ein Prüfer oder ein anderes System kann den Zustand eines Rollups verifizieren, ohne demjenigen zu vertrauen, der die Datei geschickt hat.

### Schritt 8: ein unehrlicher Betreiber {#r8}

```bash
node rollup.mjs cheat
```

Ben zahlt Ana innerhalb des Rollups 0,1 QOR, und dann reicht der Betreiber Batch 1 ein, bei dem absichtlich ein Bit der State Root gekippt ist.

**Was Sie sehen sollten:** zwei Zeilen `ok`. Die zweite sagt, dass der Batch mit einer **falschen State Root** veröffentlicht wurde. Die Chain akzeptiert ihn vorerst: Es bleibt eine Stunde, um zu beweisen, dass er falsch ist, und die Kaution des Betreibers steht auf dem Spiel.

### Schritt 9: der Watchtower erwischt ihn {#r9}

```bash
node rollup.mjs watchtower
```

Dieser Befehl verwendet das Watchtower-Konto, nicht das des Betreibers.

| Schritt | Was passiert |
| --- | --- |
| 1 | Er liest Batch 1 von der Chain. |
| 2 | Er liest genau den Teil der Inbox, den Batch 1 verwendet hat, und spielt ihn ab dem Zustand nach Batch 0 erneut ab. Das ergibt die ehrliche Root. |
| 3 | Er baut den Fraud Proof und prüft ihn auf Ihrem Computer. |
| 4 | Er sendet `challengeBatch`. Die Chain führt den Batch selbst erneut aus, verwirft ihn und slasht die Kaution: Die Hälfte wird verbrannt, die andere Hälfte geht an den Watchtower. |

**Was Sie sehen sollten:** die falsche Root und die ehrliche Root, das Ergebnis der lokalen Prüfung, eine Zeile `ok` für die Anfechtung, den als abgelehnt markierten Batch und das Guthaben des Watchtowers vorher und nachher.

:::note Jemand ist vielleicht schneller als Sie
Im Testnet gibt es bereits unabhängige Watchtower. Wenn einer von ihnen den Betrug zuerst beweist, was einen einzigen Block dauern kann, sagt Ihr Skript, dass der Batch bereits abgelehnt ist, und führt nur die lokale Prüfung aus. In beiden Fällen verliert der Betreiber die Kaution.
:::

Um erneut zu betrügen, füllen Sie zuerst die Kaution wieder auf:

```bash
node rollup.mjs bond
```

### Wie der Code aufgebaut ist {#r-code}

Alles steht in einer Datei, `rollup.mjs`. Jeder Befehl ist eine Funktion im Objekt `cmds`, in der Reihenfolge der Schritte oben. Die Funktion `connect()` macht aus einer Kontodatei einen RDK-Transaktionsclient, der jede QoreChain-Transaktion mit beiden Schlüsseln signiert, secp256k1 und ML-DSA-87.

## Teil 2: QOR zum Cosmos Hub und zurück {#part-2}

Code: [workshop-4/02-ibc](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/02-ibc). Pakete: `@qorechain/qoresign` und cosmjs. Netzwerke: das QoreChain-Testnet `qorechain-diana` und das Testnet des Cosmos Hub, `provider`.

Diese App sendet 0,5 QOR vom QoreChain-Testnet zum Testnet des Cosmos Hub und holt sie zurück. [QORel](https://github.com/qorechain/QORel), der QoreChain-Relayer, transportiert die Pakete zwischen den beiden Chains. Als dieser Leitfaden geschrieben wurde, hatte das QoreChain-Testnet zehn IBC-Kanäle: Cosmos Hub, Osmosis, Injective, Akash, Celestia, Coreum, dYdX, Fetch, Allora und ixo. IBC läuft nur im Testnet: Im Mainnet ist es nicht live.

So funktioniert es:

1. Ein Schlüssel gibt Ihnen zwei Adressen: `qor1...` auf QoreChain und `cosmos1...` auf dem Hub.
2. **Hin:** Die Überweisung wird auf QoreChain mit beiden Schlüsseln signiert, und die Chain prüft beide. QORel transportiert das Paket und einen Beweis zum Hub. Der Light Client von QoreChain auf dem Hub prüft den Beweis und erzeugt einen Voucher für das QOR.
3. **Zurück:** Auf dem Hub wird die Überweisung auf die übliche Art des Hubs signiert. Der Light Client des Hubs auf QoreChain prüft den Beweis. Der Voucher wird verbrannt und das ursprüngliche QOR freigegeben.

:::info Zwei Grenzen, die Sie kennen sollten
`channel-0` von QoreChain ist `channel-600` des Hubs. Der Name des Vouchers auf dem Hub ist `ibc/`, gefolgt vom SHA-256 von `transfer/channel-600/uqor`. Auf jedem QOR-Kanal im Testnet kann als Sicherheitsbremse innerhalb von 24 Stunden höchstens 1 % des QOR-Angebots hinüberwandern.
:::

### Schritt 1: installieren {#i1}

```bash
cd ../02-ibc
npm install
node ibc.mjs help
```

Die erste Zeile wechselt von `01-rollup` nach `02-ibc`. Wenn Sie im Ordner `workshop-4` sind, verwenden Sie `cd 02-ibc`.

**Was Sie sehen sollten:** die Liste der Befehle: `init`, `channels`, `status`, `register`, `hub-faucet`, `send`, `back`.

### Schritt 2: ein Schlüssel, zwei Chains {#i2}

```bash
node ibc.mjs init
```

Erstellt ein Konto und speichert dessen geheime Wörter in `~/.config/qday-w4/traveler.json`, nur für Sie lesbar. Sie werden nie ausgegeben. `QDAY_DIR` ändert den Ordner.

**Was Sie sehen sollten:** die QoreChain-Adresse des Kontos und seine Cosmos-Hub-Adresse. Fügen Sie die Adresse `qor1...` in den [Faucet](/dashboard/faucet) ein.

### Schritt 3: die Kanäle auflisten {#i3}

```bash
node ibc.mjs channels
```

Liest jeden IBC-Kanal im QoreChain-Testnet und die Chain am anderen Ende. Es wird kein Konto gebraucht.

**Was Sie sehen sollten:** eine Zeile pro Kanal mit seinem Zustand (`OPEN`), der ID der anderen Chain und dem Namen des Kanals auf jener Seite. Die letzte Zeile zeigt, dass das Mainnet noch keine Kanäle hat.

### Schritt 4: den Post-Quanten-Schlüssel registrieren und ATOM holen {#i4}

```bash
node ibc.mjs register
node ibc.mjs hub-faucet
node ibc.mjs status
```

| Befehl | Was er tut |
| --- | --- |
| `register` | Bringt Ihren öffentlichen ML-DSA-87-Schlüssel einmalig auf die Chain. Spätere QoreChain-Transaktionen werden gegen ihn geprüft. |
| `hub-faucet` | Bittet den öffentlichen Faucet des Cosmos-Hub-Testnets um ATOM, womit die Gebühren auf dem Rückweg bezahlt werden. |
| `status` | Zeigt Ihr QOR auf QoreChain, den Voucher und das ATOM auf dem Hub und ob Ihr Schlüssel auf der Chain ist. |

**Was Sie sehen sollten:** nach `status` Ihr QOR-Guthaben, `ML-DSA-87 key on chain: yes` und etwas ATOM. Ist ein Guthaben noch null, warten Sie eine Minute und führen Sie `status` erneut aus.

### Schritt 5: hin {#i5}

```bash
node ibc.mjs send 0.5
```

Baut eine Token-Transfer-Nachricht (`MsgTransfer`, der Standard ICS-20) auf `channel-0`, signiert sie über QoreSign mit beiden Schlüsseln und wartet dann, bis der Voucher auf dem Hub erscheint.

**Was Sie sehen sollten:** drei nummerierte Zeilen: die signierte Transaktion mit ihrer Paketnummer, dem Block und dem Explorer-Link; QORel, das das Paket transportiert; und die Ankunft des Vouchers auf dem Hub, mit der Anzahl der benötigten Sekunden. Jede Richtung dauert meist ein paar Sekunden. Ihre Zeit kann abweichen.

### Schritt 6: und zurück {#i6}

```bash
node ibc.mjs back
```

Schickt jeden Voucher über `channel-600` nach Hause. Die Hub-Transaktion wird mit einem normalen cosmjs-Client zum aktuellen Gaspreis des Hubs signiert. Dann wartet das Skript, bis das QOR zurückkommt.

**Was Sie sehen sollten:** die Hub-Transaktion, dann den auf dem Hub verbrannten Voucher und das auf QoreChain freigegebene einfache QOR.

### Wie der Code aufgebaut ist {#i-code}

Alles steht in einer Datei, `ibc.mjs`. `sendTx()` baut und signiert eine hybride QoreChain-Transaktion mit QoreSign. `hubWallet()` macht aus denselben geheimen Wörtern eine Hub-Wallet mit dem Präfix `cosmos`. Jeder Befehl ist eine Funktion im Objekt `cmds`.

## Teil 3: QoreX für Entwickler {#part-3}

Leitfaden: [workshop-4/03-qorex-developer-mode](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/03-qorex-developer-mode). Es gibt keinen neuen Code: Sie verwenden den [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) aus Workshop 1.

Die Schritte unten verwenden die **Browser-Erweiterung QoreX 0.4.5** in Chrome oder Firefox. Die Safari-Erweiterung ist eine frühere Version. Die QoreX-App (1.2.5, iPhone und Android) hat ebenfalls den Entwicklermodus: Sie schalten ihn in den **Einstellungen** ein, wie unter [Entwicklermodus](/qorex/developer-mode) erklärt.

### Womit eine dApp spricht {#providers}

QoreX fügt Webseiten drei Provider hinzu:

| Provider | Für | Standard |
| --- | --- | --- |
| `window.ethereum` | EVM-dApps. QoreX meldet sich außerdem über EIP-6963 an | EIP-1193 |
| `window.qorex.native` | Native QoreChain-Transaktionen, signiert mit secp256k1 und ML-DSA-87 | QoreX-API |
| `window.qorex.svm` | Die SVM-Lane | QoreX-API |

Diese Pakete auf npm verbinden QoreX mit gängigen Werkzeugen:

| Paket | Verwendung |
| --- | --- |
| `@qorechain/qorex-rainbowkit` | QoreX in RainbowKit (EVM) |
| `@qorechain/qorex-cosmos-kit`, `@qorechain/qorex-interchain-kit` | QoreX in Cosmos Kit und Interchain Kit |
| `@qorechain/qorex-types` | TypeScript-Typen für `window.qorex` |
| `@qorechain/qorex-wallet-mock`, `@qorechain/qorex-synpress` | Ihre dApp in automatisierten Tests gegen QoreX testen |
| `@qorechain/sdk`, `@qorechain/wallet-adapter` | Transaktionen mit hybrider Signatur bauen und senden |

Details finden Sie unter [dApp-Integration](/qorex/dapp-integration).

### Schritt 1: den Entwicklermodus einschalten {#x1}

Klicken Sie im Popup der Erweiterung **siebenmal** auf die Versionsnummer unten auf dem Startbildschirm. Es erscheint ein Bereich **Entwicklermodus** mit **Entwicklerwerkzeuge**, **Zum Testnet (diana) wechseln** und **Entwicklermodus ausschalten**. Klicken Sie auf **Zum Testnet (diana) wechseln**.

**Warum zuerst:** Das Anfrageprotokoll zeichnet Anfragen nur auf, solange der Entwicklermodus an ist.

### Schritt 2: den Hybrid Inspector starten {#x2}

Aus dem Ordner `workshop-4`:

```bash
cd ../workshop-1/03-hybrid-inspector
pnpm install
pnpm dev
```

Die erste Zeile wechselt zur App aus Workshop 1, `pnpm install` lädt ihre Pakete herunter und `pnpm dev` startet eine lokale Webseite. Öffnen Sie die ausgegebene Adresse (meist `http://localhost:5173`) und verbinden Sie QoreX.

### Schritt 3: eine Anfrage senden, während die Wallet gesperrt ist {#x3}

Klicken Sie in QoreX auf **Sperren**. Senden Sie im Inspector 0,001 QOR mit dem Memo `Workshop 4` an Ihre eigene Adresse.

**Was Sie sehen sollten:** QoreX fragt nach Ihrem Passwort und **nennt die Website**, die anfragt. Nach dem Entsperren zeigt die Freigabe den Betrag, den Empfänger und das Memo. Genehmigen Sie sie: Die Transaktion wird mit beiden Schlüsseln signiert. Wenn Sie stattdessen das Fenster schließen, wird die Anfrage abgelehnt.

**Warum das wichtig ist:** Nichts wird ohne Ihr Passwort signiert, und Sie wissen, welche Website anfragt.

### Schritt 4: die Entwicklerwerkzeuge öffnen {#x4}

Öffnen Sie die **Entwicklerwerkzeuge** und sehen Sie unter **Transaktionen** nach:

- **Anfrageprotokoll:** was jede Website von QoreX angefragt hat, mit der Methode, den Parametern und Ihrer Antwort.
- **Transaktionsinspektor:** Fügen Sie einen Transaktions-Hash oder eine Anfrage in **Hash oder Anfrage** ein und klicken Sie auf **Prüfen**. Mit einem Hash sehen Sie, was die Chain festgehalten hat, ohne die Wallet zu verlassen.

Insgesamt gibt es 17 Entwicklerwerkzeuge. [Entwicklermodus](/qorex/developer-mode) erklärt jedes einzelne.

### Außerdem neu in QoreX 1.2.5 {#also-new}

- **Ein manuelles EVM-Fenster erlaubt standardmäßig nur QOR-Überweisungen.** Sie können einen weiteren Umfang wählen, und Sie sehen, was Sie gewähren.
- **PQC-Multisig:** ein gemeinsames Konto, dessen Mitglieder jeweils post-quantenfähig signieren.
- **Schlüsselrotation und Reparatur:** Ersetzen oder reparieren Sie Ihren ML-DSA-87-Schlüssel auf der Chain, ohne Ihre Adresse zu ändern.

## Fehlerbehebung {#troubleshooting}

| Was Sie sehen | Was zu tun ist |
| --- | --- |
| `no operator account yet` | Führen Sie zuerst `node rollup.mjs init` aus. |
| `no rollup yet` | Führen Sie zuerst `node rollup.mjs prepare` aus. |
| `createRollup` wird wegen fehlender Mittel abgelehnt | Das Betreiberkonto braucht etwa 12.010 Test-QOR. Siehe [Bevor Sie beginnen](#prerequisites). |
| `prepare` bleibt auf halbem Weg stehen | Führen Sie es erneut aus. Es macht dort weiter, wo es schon war. |
| `withdrawals are paid only after the challenge window` | Batch 0 ist noch nicht endgültig. Prüfen Sie mit `node rollup.mjs status` und versuchen Sie es später erneut. |
| `nothing to challenge` | Führen Sie zuerst `node rollup.mjs cheat` aus. |
| Der Batch ist bereits abgelehnt, wenn Sie `watchtower` ausführen | Ein anderer Watchtower im Testnet war schneller. Das ist normal. |
| `no account "traveler"` | Führen Sie zuerst `node ibc.mjs init` aus. |
| `does not exist on chain yet` | Holen Sie für diese Adresse Test-QOR vom Faucet und versuchen Sie es erneut. |
| `nothing after 120 s` | Der Relayer ist vielleicht ausgelastet. Warten Sie eine Minute und führen Sie `node ibc.mjs status` aus. |
| Das Anfrageprotokoll ist leer | Schalten Sie den Entwicklermodus ein, bevor Sie die dApp verwenden. |

## Mehr erfahren {#learn-more}

- Das Fest, seine Stufen und Tracks: [build.qorechain.io](https://build.qorechain.io).
- [Rollups](/rollups/overview) und das RDK. Das RDK ist für TypeScript, Python, Rust, Go und Java verfügbar, mit einem Kommandozeilenwerkzeug, `qorollup`, und einer Projektvorlage.
- Um neuen Batches zu folgen, sobald sie eintreffen, sehen Sie sich `watchBatches` im RDK an: ein Ausgangspunkt für einen Watchtower, der den ganzen Tag läuft.
- [QORel](https://github.com/qorechain/QORel) ist Open Source. Installieren Sie es mit `brew install qorechain/tap/qorel` oder verwenden Sie den Container `ghcr.io/qorechain/qorel`. Betreiben Sie es nur mit Ihren eigenen Schlüsseln.
- Um in Teil 2 einen anderen Kanal auszuprobieren, ändern Sie `CHANNEL`, `HUB_CHANNEL` und die Endpunkte der anderen Chain in `ibc.mjs`. `node ibc.mjs channels` listet sie auf.
- [Entwicklermodus](/qorex/developer-mode) und [dApp-Integration](/qorex/dapp-integration) in QoreX.
- [Workshop 3, QoreSeal](/build-before-qday/workshop-3#part-1), falls Ihr Rollup die Daten, die es veröffentlicht, privat halten muss.
