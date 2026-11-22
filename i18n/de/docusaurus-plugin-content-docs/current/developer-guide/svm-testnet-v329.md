---
slug: /developer-guide/svm-testnet-v329
title: "SVM im Testnet: Programme deployen und Solana-Transaktionen senden (v3.2.9)"
sidebar_label: SVM-Testnet (v3.2.9)
sidebar_position: 11
---

# SVM im Testnet: Programme deployen und Solana-Transaktionen senden (v3.2.9)

Release **v3.2.9** lässt die Standard-Solana-Kommandozeile mit QoreChain sprechen. Sie können `solana transfer`, `solana program deploy`, `anchor deploy` und ein web3.js-Skript gegen das Testnet ausführen, und die Chain prüft jede Solana-Signatur selbst. Ein Solana-Schlüssel kann Ihr QoreChain-Konto nicht von sich aus berühren: Sie öffnen zuerst ein kleines, begrenztes **Autorisierungsfenster** mit einer Transaktion, die Ihr **Post-Quanten-Schlüssel** signiert, und das Fenster wird nur akzeptiert, wenn der Solana-Schlüssel mit seiner eigenen Signatur beweist, dass Sie ihn besitzen. Wenn das Fenster endet, ist der Schlüssel wieder ein gewöhnlicher Solana-Account.

Diese Seite führt Entwickler von einer leeren Maschine bis zu einem deployten und aufgerufenen Programm im Testnet: was neu ist, die Werkzeuge, den Schlüsselnachweis von Hand bauen, das Fenster öffnen und schließen, einen Deployer-Schlüssel mit Mitteln ausstatten, mit `solana` oder `anchor` deployen, das Programm aufrufen, das Ergebnis lesen, dazu eine Tabelle der echten Fehlertexte.

:::note Nur Testnet, geprüft am 22. November 2026
Alles hier läuft im Testnet **`qorechain-diana`**, das seit dem 20. November 2026 v3.2.9 betreibt (Governance-Vorschlag 39, Höhe 10,424,000). Die Solana-kompatible (SVM-)Lane ist dort seit Governance-Vorschlag 37 offen. **Nichts davon funktioniert im Mainnet:** Die SVM-Lane ist auf `qorechain-vladi` aus, Cross-VM-Aufrufe bleiben pausiert und der Upload von CosmWasm-Verträgen bleibt der Governance vorbehalten. Bauen Sie nur gegen das Testnet. Test-QOR hat keinen Wert. Verwenden Sie Wegwerf-Schlüssel.

Die Lesezugriffe, das Gebührenangebot, die Nonce-Route und das Beispiel für den Schlüsselnachweis auf dieser Seite wurden am 22. November 2026 gegen das Live-Testnet ausgeführt. Der vollständige Ablauf (Fenster, Mittel, Deploy, Aufruf, Upgrade, Schließen) lief vor dem Release in einem lokalen Testnetz mit unverändertem `solana-cli` 4.0.2 und `anchor-cli` 1.2.2. Die genaue Aufteilung steht unter [Was geprüft wurde](#tested).
:::

:::caution Das öffentliche Gateway relayt noch keine Transaktionen
Am 22. November 2026 beantwortete `https://svm-testnet.qore.host` jedes wohlgeformte `sendTransaction` mit `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)`. Lesezugriffe funktionieren, Gebührenangebote funktionieren, Schreibzugriffe werden abgelehnt, bis die Betreiber dieses Gateways einen Relayer-Account setzen. Die Schritte bis einschließlich zum Fenster brauchen kein Gateway. Für die Schritte, die senden, siehe [Senden ohne das öffentliche Gateway](#relay), und prüfen Sie den Endpunkt vor dem Start erneut: Führen Sie den Befehl aus [Schritt 1](#step-config) aus und danach ein `solana transfer` wie in [Schritt 6](#step-fund).
:::

## Was in v3.2.9 für die SVM neu ist {#whats-new}

* **Solana-Wire-Transaktionen on-chain.** Eine Transaktion, die ein Solana-Wallet oder -Werkzeug signiert hat, wird Byte für Byte in der Native-Nachricht `MsgSolanaTransaction` transportiert. Die Chain prüft jede ed25519-Signatur, den aktuellen Blockhash und den Fee Payer, führt die Instruktionen der Reihe nach als einen atomaren Schritt aus und lehnt eine Signatur ab, die sie schon gesehen hat. Die Nachricht läuft nur als Top-Level-Nachricht einer eigenen Trägertransaktion: Unter Authz und wenn ein Vertrag sie auslöst, wird sie abgelehnt.
* **Ein Gateway, das relayt statt auszuführen.** Die Solana-JSON-RPC-Methode `sendTransaction` des Knotens führt nichts mehr auf dem Knoten aus. Sie dekodiert die Transaktion, simuliert sie auf einer verworfenen Kopie des Zustands und übergibt sie an einen Relayer-Account, der die Trägertransaktion mit beiden Schlüsseln signiert und an den Mempool sendet. Nur was durch einen Block geht, ändert den Zustand. Der Relayer erhält keine Befugnis über Ihre Transaktion, weil Ihre ed25519-Signaturen on-chain geprüft werden.
* **Ein Post-Quanten-Autorisierungsfenster für Solana-Schlüssel.** `MsgOpenSVMWindow` benennt einen ed25519-Schlüssel und begrenzt ihn nach Blöcken, Anzahl der Transaktionen und QOR-Wert, optional beschränkt auf aufgelistete Programme. Solange das Fenster offen ist, handeln Transaktionen, die dieser Schlüssel signiert, für Ihr Konto. Das Öffnen braucht Ihre **ML-DSA-87-Signatur**, daher kann ein geleakter Solana-Schlüssel allein nie eines öffnen.
* **Ein Schlüsselnachweis.** Das Öffnen eines Fensters braucht `svm_key_proof` (Feld 7): eine 64 Byte lange Ed25519-Signatur, die der Solana-Schlüssel selbst über einen kurzen Text erzeugt, der die Chain, Ihr Konto und den Schlüssel nennt. Ein öffentlicher Schlüssel ist öffentlich, deshalb zeigt erst der Nachweis, dass die Person, die das Fenster öffnet, den Schlüssel besitzt.
* **Ein Nachweis öffnet ein Fenster.** Der Text enthält einen Zähler (die Nonce), der mit jedem für diesen Schlüssel geöffneten Fenster steigt, sodass ein alter Nachweis nicht erneut verwendet werden kann.
* **Ein Programm-Loader.** Der Upgradeable Loader ist verfügbar, sodass `solana program deploy`, `write-buffer`, `extend`, `set-upgrade-authority`, `close` und `anchor deploy` funktionieren, und Programme von ihrer Authority aktualisiert und geschlossen werden können, um die Rent zurückzubekommen.
* **Gebühren, die Solana-Werkzeuge verstehen.** `getFeeForMessage` und `simulateTransaction` melden die echte Gebühr, sodass die Standard-Gebührenprüfungen von `solana` und web3.js ohne zusätzliche Flags stimmen. Ist eine Transaktion zu billig, nennt der Fehler den genauen Preis, der zu setzen ist.
* **Budgets für Authz-Grants.** `MsgExecuteProgram`, `MsgCreateAccount` und `MsgDeployProgram`, die jemand anderes in Ihrem Namen unter einem Authz-Grant sendet, laufen nur innerhalb eines Fensters und seines separaten Im-Auftrag-Budgets.

### Der Transaktionsweg {#path}

```text
solana CLI / web3.js / anchor
        |  sendTransaction (signed wire transaction)
        v
SVM gateway on a node: decode, verify, simulate on a copy, check the price
        |  relayer signs MsgSolanaTransaction with the classical key and ML-DSA-87
        v
mempool, then a block: ante checks every Solana signature, blockhash, fee payer, window
        v
instructions run in order; they all succeed or none does
```

Die Solana-Gebühr geht an den Relayer, er legt also nie drauf. Jede Antwort des Gateways ist endgültig: Ein Block wird einmal committet, daher liefern `processed`, `confirmed` und `finalized` dieselben Daten.

### Das Fenster: was es begrenzt {#window}

| Grenze | Bedeutung | Limit |
| ------ | --------- | ----- |
| Blöcke | Das Fenster läuft nach dieser Anzahl Blöcke ab. Ein Block dauert im Testnet etwa 1,4 Sekunden (geprüft am 22. November 2026), 3.600 Blöcke sind also etwa 85 Minuten | 1 bis 17.280 |
| Transaktionen | Jede zugelassene Solana-Transaktion zählt eins, auch wenn sie danach fehlschlägt | 1 bis 1.000 |
| Wert | Jede Verminderung des nativen QOR des Kontos durch zugelassene Transaktionen zählt, Gebühren eingeschlossen. Eine Transaktion, die den Wert überschreiten würde, wird abgelehnt und zurückgesetzt. Der Wert wird in uqor oder QOR angegeben, zum Beispiel `25qor` | größer als 0 |
| Programme (optional) | Jede Instruktion einer zugelassenen Transaktion muss eines der aufgelisteten Programme aufrufen | bis zu 16 |

Regeln, die sich aus dem Design ergeben:

* Das Fenster wird nur durch **Ihre eigene Post-Quanten-Signatur** geöffnet und geschlossen, als Top-Level-Nachricht. Unter Authz, Gruppe oder einem Vertrag wird es abgelehnt.
* Sie brauchen einen **registrierten Post-Quanten-Schlüssel**, bevor Sie ein Fenster öffnen können.
* **Ein Solana-Schlüssel autorisiert zu einer Zeit ein Konto.** Ein erneutes Öffnen ersetzt das alte Fenster und gibt seinen Schlüssel frei.
* **Das Ändern oder Migrieren Ihres Post-Quanten-Schlüssels beendet das Fenster.**
* Neben dem nativen Guthaben zählt das Wertlimit auch QOR, das Ihre Signatur anderswo kontrolliert: Accounts, die mit einem Seed von Ihrem abgeleitet sind, Token-Accounts, die Sie schließen dürfen, Lookup-Tabellen und Loader-Accounts, deren Authority Sie sind. Ausgegeben oder an jemand anderen übergeben, zählen sie. Ein Fensterschlüssel kann die eigene Adresse Ihres Kontos nie aus dem Wallet-Zustand herausnehmen.
* Das Lesen von `getBalance` oder `getAccountInfo` für den Fensterschlüssel zeigt Ihr natives Guthaben, solange das Fenster offen ist.

### Bekannte Grenzen des Fensters {#window-limits}

Lesen Sie dies, bevor Sie ein Fenster für ein Wallet öffnen, das Token hält.

* **Token-Beträge zählen nicht zum Wertlimit.** Das Limit zählt nur natives QOR. Mit dem Standard-Scope (keine Programmliste) kann der Solana-Schlüssel die SPL-Token des Accounts übertragen und verbrennen und mit einer Mint Authority, die der Account hält, minten, allein für die Transaktionsgebühr.
* **Der Standard-Scope lehnt dauerhafte Grants ab.** Ein Schlüssel, der durch ein Fenster mit Standard-Scope handelt, kann keinen Delegate genehmigen, weder den Owner noch die Close Authority eines Token-Accounts ändern noch eine Mint- oder Freeze-Authority ändern. Das gilt auch für einen Token-Account oder Mint, der in derselben Transaktion angelegt wird. Dafür brauchen Sie Ihre eigene Post-Quanten-Signatur oder ein Fenster, dessen Programmliste das Token-Programm nennt.
* **Die Zahlung eines Mitsigners zählt gegen das Fenster.** Wenn ein anderer Schlüssel dieselbe Solana-Transaktion mitsigniert und darin etwas zahlt, zählt diese Zahlung ebenfalls gegen Ihr Wertlimit. Lassen Sie einen Sponsor in einer separaten Transaktion zahlen oder öffnen Sie ein Fenster, dessen Wertlimit alles abdeckt, was die Transaktion bewegt.
* **Grants unter einem ausdrücklichen Token-Scope überdauern das Fenster.** Wenn die Programmliste das Token-Programm nennt, bleiben Delegates und Authority-Änderungen, die durch das Fenster vorgenommen wurden, bestehen, nachdem das Fenster geschlossen wurde, abgelaufen ist oder Ihr Post-Quanten-Schlüssel rotiert wurde. Widerrufen Sie sie mit Ihrer eigenen Signatur.
* **Um Token-Aktionen ganz auszuschließen,** öffnen Sie das Fenster mit einer Programmliste, die das Token-Programm nicht nennt.

### Gebühren {#fees}

| Posten | Wert (Testnet, 22. November 2026) |
| ------ | --------------------------------- |
| Basisgebühr pro Signatur | 0,045 QOR (45.000 uqor, 45.000.000 Lamports). Das ist der Preis von 450.000 Gas beim Mindest-Gaspreis der Chain von 0,1 uqor pro Gas, und `getFeeForMessage` meldet ihn |
| Einheiten auf dem Bildschirm | `solana` beschriftet Beträge mit **SOL**. Auf QoreChain ist 1 „SOL“ gleich 1 QOR, weil 1 uqor 1.000 Lamports sind und 1 QOR 1.000.000 uqor. Lesen Sie „0.045 SOL“ als 0,045 QOR |
| Prioritätsgebühr | Nur wenn die Transaktion mehr Gas braucht, als die Basisgebühr abdeckt. Sie ist der ComputeBudget-Preis mal das Einheitenlimit |
| Ein Deploy | Eine Basisgebühr pro Schreibtransaktion, plus Rent, die beim Schließen des Programms zurückkommt |

Was Sie zahlen, ist durch das begrenzt, was Sie signiert haben: Sie zahlen die Kosten der Trägertransaktion, mindestens die Basisgebühr und höchstens die Gebühr, die Ihre eigene Signatur zugesagt hat. Ein Relayer kann Sie nicht mehr zahlen lassen.

Zahlt eine Transaktion weniger, als ihr Träger kostet, lehnt das Gateway sie mit Code `-32002` ab und nennt die genaue Lösung. Dieselben Zahlen stehen im Fehler-`data`:

```json
{
  "code": -32002,
  "message": "Transaction simulation failed: insufficient priority fee: the transaction pays 45000000 lamports, its carrier costs ... uqor ... set ComputeBudget SetComputeUnitPrice to <price> micro-lamports per compute unit, which covers it for a compute unit limit of <limit> or more ...",
  "data": {
    "computeUnitPrice": 0,
    "computeUnitLimit": 0,
    "transactionComputeUnitLimit": 0,
    "carrierFeeLamports": 0,
    "feeLamports": 0
  }
}
```

Die Nullen stehen für die Zahlen Ihrer Transaktion. Setzen Sie `SetComputeUnitPrice` auf `data.computeUnitPrice` und ein Einheitenlimit von mindestens `data.computeUnitLimit`; ein Mikro-Lamport weniger wird erneut abgelehnt. Bei `solana program deploy` verwenden Sie `--with-compute-unit-price <data.computeUnitPrice>`. In den Läufen vor dem Release passte jeder Schritt eines normalen Programm-Deploys, -Upgrades, -Extends, -Closes und einer Authority-Änderung in die Basisgebühr, Sie begegnen diesem Fehler also vor allem bei einem ungewöhnlich großen `--max-len`.

### Im-Auftrag-Budgets {#on-behalf}

Ein Authz-Grantee, der `MsgExecuteProgram`, `MsgCreateAccount` oder `MsgDeployProgram` in Ihrem Namen sendet, handelt nur innerhalb Ihres Fensters und seines **separaten Im-Auftrag-Budgets**: `on_behalf_max_txs` und `on_behalf_max_value`. Die eigenen Limits des Schlüssels und das Im-Auftrag-Budget können sich nicht gegenseitig aufbrauchen. Ohne Im-Auftrag-Budget (der Standard) werden solche Grants abgelehnt und nichts bewegt sich. Ein `MsgExecuteProgram`, das in eine Authz-Ausführung mit dem Konto selbst als Grantee verpackt ist, zählt ebenfalls als in Ihrem Auftrag gesendet, senden Sie Ihre eigenen SVM-Nachrichten also als Top-Level-Nachrichten.

Jede verschachtelte Ausführung oder jedes verschachtelte Deploy lässt Ihr Konto außerdem die SVM-Pauschalgebühr zahlen, `max(1, compute_budget_max / 1000)` uqor, das sind 1.400 uqor beim Live-Parameterwert von 1.400.000. Diese Gebühr zählt gegen das Im-Auftrag-Wertlimit. Setzen Sie `--on-behalf-max-value` auf mindestens `on_behalf_max_txs` mal die Pauschalgebühr, plus den Wert, den der Grantee bewegen soll. Ein Wert von 0 lehnt jede Ausführung im Auftrag ab.

### Der Loader {#loader}

| Sie führen aus | Was es on-chain tut |
| -------------- | ------------------- |
| `solana program deploy x.so` | Schreibt das Programm in vielen kleinen Transaktionen in einen Buffer und deployt es dann. Die Programm-ID ist die in `--program-id` oder eine neue |
| `solana program deploy --program-id <id> x.so` für ein bestehendes Programm | Aktualisiert es. Nur die Upgrade Authority kann das |
| `solana program write-buffer` / `show --buffers` / `close <buffer>` | Schreibt, listet und schließt einen Buffer ohne Deploy |
| `solana program extend <id> <bytes>` | Vergrößert den Datenbereich des Programms |
| `solana program set-upgrade-authority <id> --new-upgrade-authority <key>` | Übergibt Upgrades an einen anderen Schlüssel. `--final` macht das Programm dauerhaft |
| `solana program close <id>` | Schließt das Programm und gibt die Rent zurück |
| `anchor deploy` | Tut dasselbe mit dem von Anchor gebauten Programm |

Ein Programm darf bis zu 10 MiB groß sein (das Live-`max_program_size`). Programme rufen sich gegenseitig bis zu 4 Ebenen tief auf (`max_cpi`). Das Standard-Compute-Budget beträgt bis zu 1.400.000 Einheiten pro Instruktion.

## In diesem Leitfaden verwendete Begriffe {#words}

| Begriff | Einfache Bedeutung |
| ------- | ------------------ |
| SVM | Die Solana-kompatible virtuelle Maschine in QoreChain. Sie führt dieselben kompilierten Programme (SBF) aus wie Solana |
| Lamport | Die kleinste Einheit in Solana-Werkzeugen. 1 uqor sind 1.000 Lamports, und 1 QOR sind 1.000.000.000 Lamports |
| Fenster | Eine kurze, begrenzte Erlaubnis für einen Solana-Schlüssel, für Ihr Konto zu handeln. Das Öffnen braucht eine mit Ihrem Post-Quanten-Schlüssel signierte Transaktion |
| Schlüsselnachweis | Die eigene Signatur des Solana-Schlüssels über einen kurzen Text. Er beweist, dass Sie den genannten Schlüssel besitzen |
| Nonce | Ein Zähler pro Solana-Schlüssel, der mit jedem mit Nachweis geöffneten Fenster steigt. Der nächste Nachweis muss den aktuellen Wert signieren |
| Träger | Die Native-Transaktion, die eine Solana-Transaktion durch einen Block trägt |
| Relayer | Der Account, der den Träger signiert und sendet. Die Solana-Gebühr erstattet ihm die Kosten |
| Blockhash | Der aktuelle Block-Hash, auf dem eine Solana-Transaktion aufbaut. Er ist 150 Slots gültig, hier etwa 3,5 Minuten |

## Bevor Sie beginnen {#prerequisites}

Sie brauchen ein Terminal unter macOS oder Linux, etwa 10 QOR Test-QOR und diese Werkzeuge (die Versionen in der rechten Spalte sind die für diese Seite verwendeten):

| Werkzeug | Wofür | Verwendete Version |
| -------- | ----- | ------------------ |
| Solana-Kommandozeile (Agave) | `solana`, `solana-keygen` | `solana-cli` 4.0.2 |
| Rust und `cargo build-sbf` | Ein Programm bauen | `cargo-build-sbf` 4.0.0, Platform Tools v1.53, `rustc` 1.89 |
| Anchor (optional) | `anchor build`, `anchor deploy` | `anchor-cli` 1.2.2 |
| Node.js 18 oder neuer | Das Skript für den Schlüsselnachweis und das Aufrufskript | jede aktuelle LTS |
| `@solana/web3.js` 1.x | Das Programm aufrufen | 1.99 |
| `qorechaind` v3.2.9 | Ihren Post-Quanten-Schlüssel registrieren, das Fenster öffnen und schließen | das Release-Binary, siehe unten |

Prüfen Sie, was Sie haben:

```bash
solana --version
cargo build-sbf --version
anchor --version
node -v
```

**Zu `qorechaind`.** Das Öffnen eines Fensters ist eine Native-Nachricht, die Ihre ML-DSA-87-Signatur braucht, und der Befehl `tx pqc open-svm-window` ist Teil von v3.2.9. Am 22. November 2026 listete das Release-Manifest des Testnets (`https://download.qore.host/testnet/latest.json`) noch Version 3.2.8, das v3.2.9-Bundle ist also das im Text von Governance-Vorschlag 39 genannte (`GET https://api-testnet.qore.host/cosmos/gov/v1/proposals/39`). Das Release-Binary ist für Linux gebaut; es gibt kein paketiertes macOS-Binary. Ein SDK-Helfer für das Fenster ist noch nicht veröffentlicht. Alles andere in diesem Leitfaden braucht keinen Knoten.

Sie brauchen außerdem ein QoreChain-Konto mit Test-QOR (vom [Faucet](/dashboard/faucet)) und einen registrierten Post-Quanten-Schlüssel. Falls Sie das noch nicht getan haben, folgen Sie zuerst [Schlüssel registrieren](/developer-guide/post-quantum-signing#pqc-key-registration). Die Befehle unten nennen den Kontoschlüssel `mykey` und seinen Post-Quanten-Schlüssel `mykey-mldsa`.

:::caution Nur Wegwerf-Testnet-Schlüssel
Die zwei Solana-Schlüsselpaare, die Sie unten anlegen, sind Dateien mit geheimen Schlüsseln darin. Verwenden Sie nie ein Schlüsselpaar, das in einem anderen Netzwerk echte Mittel hält, und fügen Sie nie einen geheimen Schlüssel in einen Befehl, einen Chat oder ein Repository ein.
:::

## Schritt für Schritt {#steps}

Legen Sie einen Arbeitsordner und eine separate Solana-Konfiguration an, damit Ihre normalen `solana`-Einstellungen unberührt bleiben:

```bash
mkdir -p ~/qore-svm && cd ~/qore-svm
alias qsol='solana -C ~/qore-svm/solana-config.yml'
```

Der Alias führt `solana` mit einer eigenen Konfigurationsdatei aus. Bleiben Sie im selben Terminal oder wiederholen Sie den Alias in einem neuen.

### Schritt 1: Die Solana-Werkzeuge auf das Testnet richten {#step-config}

```bash
qsol config set --url https://svm-testnet.qore.host
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
qsol epoch-info
```

Die erste Zeile speichert die RPC-Adresse in `solana-config.yml`. Die zweite fragt den Knoten nach seiner Version. Sie sollten `solana-core` `1.18.0-qorechain`, die Chain-ID `qorechain-diana` und den Genesis-Hash `6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj` sehen (HTTP 200). Die dritte gibt den aktuellen Slot aus, der der Blockhöhe entspricht (am 22. November 2026 etwa 10,57 Millionen).

Die Lane-Parameter bestimmen, was passt. Lesen Sie sie einmal:

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

Sie sollten `"enabled":true` und die Limits des Live-Testnets sehen: `max_program_size` 10.485.760, `compute_budget_max` 1.400.000, `lamports_per_byte` 3.480, `max_cpi` 4. Ist `enabled` gleich `false`, ist die Lane geschlossen und nichts unten kann funktionieren.

Der öffentliche Endpunkt bedient keinen Websocket (ein Websocket-Upgrade wurde am 22. November 2026 mit HTTP 405 beantwortet), geben Sie also `--use-rpc` an die Befehle, die eine Transaktion bestätigen (`solana program deploy`, `write-buffer`), und lassen Sie das Werkzeug über einfaches HTTP pollen. Anchor akzeptiert es nach einem doppelten Bindestrich.

### Schritt 2: Zwei Solana-Schlüsselpaare anlegen {#step-keys}

```bash
solana-keygen new --no-bip39-passphrase --outfile window.json
solana-keygen new --no-bip39-passphrase --outfile deployer.json
solana-keygen pubkey window.json
solana-keygen pubkey deployer.json
```

Die ersten beiden Befehle schreiben je eine Schlüsselpaar-Datei (ein JSON-Array aus 64 Zahlen: der 32 Byte lange geheime Seed, dann der öffentliche Schlüssel). Die letzten zwei geben die öffentlichen Schlüssel als Base58-Text aus. Sie sollten zwei verschiedene Adressen mit 32 bis 44 Zeichen sehen. Nennen Sie sie `WINDOW_PUBKEY` und `DEPLOYER_PUBKEY`.

Warum zwei Schlüssel. Der **Fensterschlüssel** handelt kurze Zeit für Ihr Native-Konto. Er hält selbst nichts; er gibt Ihr QOR innerhalb des Fensters aus. Der **Deployer-Schlüssel** ist ein gewöhnlicher Solana-Schlüssel. Sie statten ihn aus dem Fenster mit Mitteln aus, und von da an deployt, aktualisiert und besitzt er das Programm ohne jedes Fenster. Verwenden Sie den Fensterschlüssel nicht als Upgrade Authority: Das Programm hält Ihr Native-Konto als Authority fest, und `solana` lehnt ein Upgrade ab, das ein Schlüssel signiert, der nicht die eingetragene Authority ist.

Setzen Sie den Deployer-Schlüssel als Standard-Signer Ihrer Solana-Konfiguration:

```bash
qsol config set --keypair ~/qore-svm/deployer.json
```

### Schritt 3: Ihren Post-Quanten-Schlüssel registrieren {#step-pqc}

Überspringen Sie diesen Schritt, wenn `qorechaind query pqc account <your qor address>` bereits einen Schlüssel zeigt. Andernfalls, auf einer Maschine mit dem Release-`qorechaind`:

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

qorechaind tx pqc gen-key mykey-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mykey-mldsa \
  --from mykey --chain-id $QCHAIN --node $QNODE --gas 600000 --fees 60000uqor -y
qorechaind query pqc account <your qor address> --node $QNODE
```

`gen-key` erzeugt den ML-DSA-87-Schlüssel und gibt seinen öffentlichen Schlüssel hexadezimal aus. `register-key-v2` legt ihn mit einem Besitznachweis auf Ihr Konto. Die Abfrage sollte den registrierten Schlüssel zeigen. Dies ist die einzige Transaktion, die ein neues Konto allein mit dem klassischen Schlüssel signieren darf. Die vollständige Erklärung, einschließlich der Sicherung des Schlüssels, steht unter [Post-Quanten-Signierung](/developer-guide/post-quantum-signing#pqc-key-registration).

### Schritt 4: Den Schlüsselnachweis bauen {#step-proof}

Der Nachweis ist eine Ed25519-Signatur des Fensterschlüssels über genau diesen Text, als UTF-8 kodiert, ohne Leerzeichen und ohne abschließenden Zeilenumbruch:

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>
```

Für einen Schlüssel, der schon ein oder mehrere Fenster geöffnet hat, folgt die Nonce `N` nach einem weiteren `|`:

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>|<N>
```

`N` ist die Anzahl der Fenster, die für diesen Schlüssel bereits mit Nachweis geöffnet wurden, dezimal geschrieben ohne Vorzeichen und ohne führende Nullen. Für einen neuen Schlüssel ist `N` gleich 0 und es gibt kein Suffix. Die Signatur ist reines Ed25519 (RFC 8032): kein Prehash, kein Kontext und kein Solana-Off-Chain-Message-Header, ein Wallet muss also die rohen UTF-8-Bytes signieren.

Bauen Sie den Text nicht von Hand. Fragen Sie die Chain danach:

```bash
curl -s "https://api-testnet.qore.host/qorechain/pqc/v1/svm_window_key_proof/<WINDOW_PUBKEY>?sender=<your qor address>"
```

Die Antwort enthält die Nonce und den genauen Text:

```json
{"svm_pubkey":"9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","nonce":"0","key_proof_required":true,"sign_bytes":"qorechain-svm-window-key-v1|qorechain-diana|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","chain_id":"qorechain-diana"}
```

Das ist die Live-Antwort vom 22. November 2026 für eine Beispieladresse. Signieren Sie `sign_bytes` mit dem Fensterschlüssel. Das Skript unten erledigt beide Schritte und verwendet nur Node.js (speichern Sie es als `keyproof.mjs`):

```js
// node keyproof.mjs <solana-keypair.json> <your qor address>
import { readFileSync } from "node:fs";
import { createPrivateKey, sign } from "node:crypto";

const REST = "https://api-testnet.qore.host";
const [keypairPath, sender] = process.argv.slice(2);

// A solana-cli keypair file: JSON array of 64 bytes, the 32-byte seed first, then the public key.
const bytes = Uint8Array.from(JSON.parse(readFileSync(keypairPath, "utf8")));
const seed = bytes.slice(0, 32);

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58(buf) {
  let n = 0n;
  for (const b of buf) n = n * 256n + BigInt(b);
  let out = "";
  while (n > 0n) { out = ALPHABET[Number(n % 58n)] + out; n /= 58n; }
  for (const b of buf) { if (b === 0) out = "1" + out; else break; }
  return out;
}
const pubkey = base58(bytes.slice(32));

// The chain knows its id and the key's nonce, so it gives the exact text.
const url = `${REST}/qorechain/pqc/v1/svm_window_key_proof/${pubkey}?sender=${sender}`;
const info = await (await fetch(url)).json();
console.log("nonce:", info.nonce);
console.log("text to sign:", info.sign_bytes);

// Pure Ed25519 over the UTF-8 bytes of the text.
const pkcs8 = Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), Buffer.from(seed)]);
const key = createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" });
const proof = sign(null, Buffer.from(info.sign_bytes, "utf8"), key);
console.log("svm_key_proof (hex):", proof.toString("hex"));
```

```bash
node keyproof.mjs window.json <your qor address>
```

Sie sollten `nonce: 0`, den Text und einen 128 Zeichen langen Hex-String sehen. Bewahren Sie den Hex-String auf. Er gilt für **ein Fenster** und nur für diesen Absender, diesen Schlüssel und diese Chain.

**Prüfen Sie Ihren Code gegen ein veröffentlichtes Beispiel.** Chain-ID `qorechain-diana`, Absender `qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d` (20 Bytes `0x11`), Nonce 0:

| Feld | Wert |
| ---- | ---- |
| Öffentlicher Schlüssel (Base58) | `9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| Öffentlicher Schlüssel (Hex) | `79b5562e8fe654f94078b112e8a98ba7901f853ae695bed7e0e3910bad049664` |
| Nachricht (131 Bytes) | `qorechain-svm-window-key-v1\|qorechain-diana\|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d\|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| Signatur (Hex) | `786b449dcd4b85c2225819c9ac993fbe97a2cfdce7f9ffba07e6895fad0b9b8d3a0634aae5b21d28d366590b3858c7085c8c856a90770fd919ee1bff728b0801` |

Mit Nonce 1 ist die Nachricht 133 Bytes lang und endet auf `|1`. Das obige Skript hat diese Signatur am 22. November 2026 mit dem passenden Schlüssel reproduziert. Erzeugt Ihr Code für dieselben Eingaben andere Bytes, sind die üblichen Ursachen ein abschließender Zeilenumbruch, ein Prehash, der Solana-Off-Chain-Header oder eine Nonce mit falschem Wert.

Sie müssen das Skript nicht ausführen: Der Befehl im nächsten Schritt kann mit der Schlüsselpaar-Datei selbst signieren (`--svm-keypair`). Verwenden Sie das Skript, wenn der Schlüssel woanders liegt, zum Beispiel in einem Wallet, das eine einfache Nachricht signieren kann, und übergeben Sie sein Ergebnis mit `--svm-key-proof`.

### Schritt 5: Das Fenster öffnen {#step-open}

Bauen Sie die Transaktion und fügen Sie dann die Post-Quanten-Signatur hinzu. Dieses Beispiel öffnet ein Fenster von 3.600 Blöcken (etwa 85 Minuten), bis zu 10 Transaktionen und insgesamt 10 QOR (Wert plus Gebühren), beschränkt auf das System-Programm (Überweisungen) und den Loader (Deploys):

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana
SYS=11111111111111111111111111111111
LOADER=BPFLoaderUpgradeab1e11111111111111111111111

qorechaind tx pqc open-svm-window <WINDOW_PUBKEY> 3600 10 10qor \
  --allowed-programs $SYS,$LOADER \
  --svm-keypair ~/qore-svm/window.json \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-open.json

qorechaind tx pqc cosign window-open.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Der erste Befehl baut `window-open.json`. Die Positionsargumente sind der öffentliche Solana-Schlüssel, die Anzahl der Blöcke, die Anzahl der Transaktionen und der Wert. Er liest die Nonce von der Chain und signiert den Schlüsselnachweis mit `window.json`. Der zweite Befehl fügt Ihre ML-DSA-87-Signatur hinzu und sendet die Transaktion. Sie sollten einen Transaktions-Hash und Code 0 sehen.

Um stattdessen den Nachweis aus dem Skript zu verwenden, ersetzen Sie `--svm-keypair ...` durch `--svm-key-proof <hex from Step 4>`. Geben Sie keines der beiden Flags an, lehnt der Befehl ab und gibt den genauen Text zum Signieren aus. Hat der Schlüssel schon Fenster geöffnet, liest der Befehl die Nonce selbst; mit `--svm-key-proof` können Sie sie mit `--svm-key-nonce <N>` festlegen.

Lesen Sie das Fenster zurück:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/svm_window/<your qor address>
qorechaind query pqc svm-window <your qor address> --node $QNODE
```

Sie sollten `"found":true` und `"live":true` sehen, mit `max_txs`, `used_txs`, `max_value`, `used_value`, `remaining_blocks`, `remaining_txs`, `remaining_value`, `allowed_programs` und `key_proven` `true`. Sie können es auch über den Solana-Schlüssel lesen: `GET /qorechain/pqc/v1/svm_window_by_key/<WINDOW_PUBKEY>`. Die Felder `key_proof_required`, `key_usable` und `key_proof_nonce` (der nächste zu signierende Wert) sind ebenfalls dabei.

Die Programmliste nennt das System-Programm und den Loader, weil das die getestete Kombination ist. In diesem Leitfaden überweist der Fensterschlüssel nur, und der Deployer deployt. Wenn Sie den Fensterschlüssel je ein Deploy direkt bezahlen lassen, muss die Liste beide Programme nennen.

### Schritt 6: Den Deployer mit Mitteln ausstatten {#step-fund}

Solange das Fenster offen ist, gibt der Fensterschlüssel Ihr QOR aus. Senden Sie 5 QOR an den Deployer:

```bash
qsol balance <WINDOW_PUBKEY>
qsol transfer <DEPLOYER_PUBKEY> 5 --keypair ~/qore-svm/window.json --allow-unfunded-recipient
qsol balance <DEPLOYER_PUBKEY>
```

Die erste Zeile zeigt Ihr natives Guthaben, wie der Fensterschlüssel es sieht (bei „SOL“ lesen Sie QOR). Die zweite sendet 5 QOR; das Flag `--keypair` macht den Fensterschlüssel für diesen einen Befehl zum Signer, und `--allow-unfunded-recipient` ist nötig, weil der Deployer noch nichts hält. Die dritte sollte `5 SOL` zeigen, also 5 QOR. Die Überweisung kostet Ihr Konto insgesamt 5,045 QOR: die 5 QOR plus die Basisgebühr von 0,045 QOR, und die Fensterzähler (`used_txs` 1, `used_value` 5.045.000) zeigen es.

Wird dies mit `this node relays no Solana transactions` abgelehnt, siehe [Senden ohne das öffentliche Gateway](#relay).

### Schritt 7: Ein kleines Programm bauen {#step-build}

```bash
cargo init --lib hello
cd hello
```

Ersetzen Sie `Cargo.toml` durch:

```toml
[package]
name = "hello"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
solana-program = "2.2"
```

Ersetzen Sie `src/lib.rs` durch:

```rust
use solana_program::{account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg, pubkey::Pubkey};

entrypoint!(process_instruction);

fn process_instruction(_program_id: &Pubkey, _accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    msg!("hello from QoreChain, {} data bytes", data.len());
    Ok(())
}
```

```bash
cargo build-sbf
ls -l target/deploy
```

Das kompiliert das Programm für SBF. Sie sollten `hello.so` (etwa 19 KB) und `hello-keypair.json` sehen, den Schlüssel, dessen Adresse zur Programm-ID wird. Compiler-Warnungen zu `unexpected cfg` sind harmlos. Das Programm schreibt eine Logzeile und tut sonst nichts.

### Schritt 8: Deployen {#step-deploy}

```bash
qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc
```

Das schreibt das Programm in etwa 20 kleinen Transaktionen und deployt es dann. `solana` schätzt zuerst die Kosten und prüft Ihr Guthaben: Für den 18.896 Byte großen Build gab es am 22. November 2026 einen Aufwand von 0,133 QOR (Rent) und eine Gebühr von 1,035 QOR aus, das sind 23 Transaktionen zu 0,045 QOR. Sie sollten mit `Program Id: <address>` enden. Prüfen Sie es:

```bash
qsol program show <program id>
```

Sie sollten die Programm-ID, den Loader (`BPFLoaderUpgradeab1e11111111111111111111111`), eine ProgramData-Adresse, die **Authority** (Ihr Deployer-Schlüssel), den Deploy-Slot und die Datenlänge sehen. Wenn Sie das Deploy gestartet haben und es auf halbem Weg stoppt, gibt `solana` eine 12-Wörter-Wiederherstellungsphrase für den temporären Buffer-Schlüssel aus. Bewahren Sie sie auf, bis das Deploy fertig ist: Damit setzen Sie denselben Buffer fort, indem Sie das wiederhergestellte Schlüsselpaar an das nächste `program deploy` oder `write-buffer` übergeben, und Sie können den Buffer schließen, um seine Rent zurückzubekommen.

Für ein mit Anchor gebautes Programm fügen Sie `--skip-feature-verify` zu `solana program deploy` hinzu, wie in den Läufen vor dem Release.

#### Mit Anchor {#anchor}

```bash
anchor init counter
cd counter
anchor build
anchor deploy --provider.cluster https://svm-testnet.qore.host \
  --provider.wallet ~/qore-svm/deployer.json -- --use-rpc
```

`anchor build` kompiliert das Vorlagenprogramm und `anchor deploy` deployt es an die Programm-ID in `declare_id!`. Ein Vorlagenprogramm ist etwa 130 KB groß, das sind etwa 130 Schreibtransaktionen zu 0,045 QOR, statten Sie den Deployer also zuerst mit mindestens 10 QOR aus. Im Lauf vor dem Release kostete ein 128-KB-Programm etwa 6,8 QOR, größtenteils die Schreibgebühren, wobei die Rent beim Schließen zurückkommt. Ein zweites `anchor deploy` nach einer Codeänderung aktualisiert das Programm. Anchor überspringt den IDL-Upload für eine lokale Adresse; der IDL-Upload ins Testnet wurde nicht getestet.

### Schritt 9: Das Programm aufrufen {#step-call}

`solana` kann kein beliebiges Programm aufrufen, verwenden Sie also ein kurzes web3.js-Skript. In einem leeren Ordner:

```bash
npm init -y
npm install @solana/web3.js@1
```

Speichern Sie als `call.cjs`:

```js
// node call.cjs <payer keypair.json> <program id> [data as text]
const fs = require("fs");
const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");

const RPC = "https://svm-testnet.qore.host";
const [payerPath, programId, text = "hi"] = process.argv.slice(2);
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(payerPath, "utf8"))));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const conn = new Connection(RPC, "confirmed");
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash }).add(
    new TransactionInstruction({ programId: new PublicKey(programId), keys: [], data: Buffer.from(text) }),
  );
  tx.sign(payer);

  const signature = await conn.sendRawTransaction(tx.serialize()); // preflight runs on the gateway
  console.log("signature:", signature);

  // The public endpoint serves no websocket, so poll instead of confirmTransaction.
  for (;;) {
    const { value } = await conn.getSignatureStatuses([signature]);
    if (value[0]) { console.log("status:", value[0].confirmationStatus, "err:", JSON.stringify(value[0].err)); break; }
    if ((await conn.getBlockHeight()) > lastValidBlockHeight) throw new Error("blockhash expired, build and send again");
    await sleep(1500);
  }
  const t = await conn.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
  console.log("fee (lamports):", t.meta.fee);
  console.log((t.meta.logMessages || []).join("\n"));
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
```

```bash
node call.cjs ~/qore-svm/deployer.json <program id> "hello"
```

Das Skript baut eine Instruktion für Ihr Programm, signiert sie mit dem Deployer-Schlüssel, sendet sie, pollt, bis die Signatur einen Status hat, und gibt das Log des Programms aus. Der Fee Payer ist der Deployer, daher ist kein Fenster nötig. Sie sollten eine Signatur, `status: finalized err: null`, `fee (lamports): 45000000` und Logs wie diese sehen (Form aus dem Lauf vor dem Release; die Meldung stammt von Ihrem eigenen Programm):

```text
Program <program id> invoke [1]
Program log: hello from QoreChain, 5 data bytes
Program <program id> consumed ... compute units
Program <program id> success
```

### Schritt 10: Das Ergebnis lesen {#step-read}

| Sie möchten | Befehl oder Aufruf |
| ----------- | ------------------ |
| Den Status einer Transaktion | `qsol confirm -v <signature>` oder `getSignatureStatuses` |
| Ihre Logs, Gebühr und Guthabenänderungen | `getTransaction` mit `maxSupportedTransactionVersion: 0` (das Skript oben) |
| Das Programm und seine Authority | `qsol program show <program id>` |
| Alle Programme des Deployers | `qsol program show --programs` |
| Einen Datenaccount | `qsol account <address>` oder `getAccountInfo` |
| Ihr Fenster, nach Konto oder nach Schlüssel | `GET /qorechain/pqc/v1/svm_window/<address>` und `.../svm_window_by_key/<pubkey>` |

Eine Transaktion, die innerhalb eines Blocks fehlschlägt (zum Beispiel, weil Sie den Preflight des Gateways mit `--skip-preflight` übersprungen haben), behält ihre Signatur und zahlt ihre Gebühr, ihre Wirkungen werden zurückgesetzt. Im Lauf vor dem Release wurde eine Überweisung über dem Wertlimit des Fensters, mit `--skip-preflight` gesendet, aufgenommen und schlug mit `Error processing Instruction 0: generic instruction error` fehl, und die Überweisung wurde zurückgesetzt. Ohne `--skip-preflight` wird sie früher abgelehnt, am Gateway, mit `-32002 ... SVM authorisation window exhausted`.

### Schritt 11: Aktualisieren, übergeben, erweitern und schließen {#step-admin}

All das verwendet den Deployer-Schlüssel als Signer und braucht kein Fenster.

| Aufgabe | Befehl |
| ------- | ------ |
| Nach einer Codeänderung aktualisieren | `qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc` |
| Den Datenbereich um N Bytes vergrößern | `qsol program extend <program id> N` |
| Upgrades an einen anderen Schlüssel übergeben | `qsol program set-upgrade-authority <program id> --new-upgrade-authority <new.json>` |
| Das Programm dauerhaft machen | `qsol program set-upgrade-authority <program id> --final` |
| Einen Buffer ohne Deploy schreiben, Buffer auflisten | `qsol program write-buffer x.so --use-rpc`, dann `qsol program show --buffers` |
| Einen Buffer schließen, oder das Programm schließen und die Rent zurückholen | `qsol program close <buffer or program id>` (ein Programm braucht außerdem `--bypass-warning`) |

Ein Upgrade durch einen Schlüssel, der nicht die Authority ist, wird abgelehnt. Nach `set-upgrade-authority` wird die alte Authority abgelehnt und die neue kann aktualisieren. Nach `--final` wird ein Upgrade mit der Meldung abgelehnt, dass das Programm nicht mehr aktualisierbar ist. Ein geschlossenes Programm kann nicht erneut aufgerufen werden, und `program show` sagt, dass es geschlossen wurde.

### Schritt 12: Das Fenster schließen {#step-close}

Sie können ein Fenster schließen, wenn Sie fertig sind, und Sie müssen es sofort schließen, wenn Sie glauben, dass der Solana-Schlüssel offengelegt wurde. Was das Fenster noch zugelassen hätte, wird ab dem nächsten Block abgelehnt:

```bash
qorechaind tx pqc close-svm-window --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-close.json
qorechaind tx pqc cosign window-close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Lesen Sie das Fenster erneut: Es sollte nicht mehr live sein, und `qsol balance <WINDOW_PUBKEY>` sollte wieder 0 zeigen. Der Fensterschlüssel kann Ihr QOR nicht mehr bewegen. Der Deployer-Schlüssel, das Programm und die Mittel, die Sie durch das Fenster angelegt haben, bleiben Ihre.

Um für denselben Schlüssel ein neues Fenster zu öffnen, führen Sie Schritt 4 erneut aus: Die Nonce ist jetzt höher, und ein für das alte Fenster erzeugter Nachweis wird mit `expected_nonce` abgelehnt.

## Senden ohne das öffentliche Gateway {#relay}

Das öffentliche Gateway unter `svm-testnet.qore.host` lehnte das Relaying am 22. November 2026 ab (siehe den Kasten oben). Es gibt zwei Wege zu senden, bis es relayt.

**Eine einzelne Transaktion über die Kommandozeile.** Jedes native Konto, das QOR hält und einen registrierten Post-Quanten-Schlüssel hat, kann eine von Ihnen signierte Solana-Transaktion tragen. Bauen und signieren Sie die Solana-Transaktion zuerst, zum Beispiel mit web3.js, und geben Sie sie in Base64 aus (`tx.serialize().toString("base64")`). Eine Transaktion ist etwa 3,5 Minuten nach dem verwendeten Blockhash gültig. Dann:

```bash
qorechaind tx svm solana-tx <base64 transaction> --from mykey \
  --chain-id $QCHAIN --node $QNODE --gas <GAS> --fees <FEES>uqor --generate-only > relay.json
qorechaind tx pqc cosign relay.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Bestimmen Sie `--gas` und `--fees` mit einem Probelauf: Führen Sie zuerst `tx pqc cosign` mit `--dry-run` aus (es gibt eine Gas-Schätzung aus und sendet nichts), verwenden Sie dann die Schätzung plus 30 % als `<GAS>` und eine Gebühr von mindestens `<GAS>` mal 0,1 uqor als `<FEES>`. Eine einfache Überweisung braucht etwa 300.000 bis 400.000 Gas, ein Deploy oder ein Vorschlag mit Code deutlich mehr.

Auf dem Testnet gemessen: Eine einfache Überweisung, die so weitergeleitet wurde, verbrauchte 327.570 Gas, verwenden Sie also `--gas 400000 --fees 40000uqor`; mit 300.000 geht das Gas aus. Dem Zahler wird zusätzlich die Solana-Gebühr berechnet, die er signiert hat (45.000.000 Lamports, 0,045 QOR).

Das Konto in `--from` ist der Relayer. Er signiert den Träger und zahlt dessen Gas, und der Solana-Fee-Payer erstattet es ihm. Der Relayer erhält keine Befugnis über die Solana-Transaktion. Die Gebühr des Trägers muss durch das gedeckt sein, was die Solana-Transaktion zahlt: 45.000 uqor für eine Signatur. Das ist praktikabel für eine Überweisung oder einen Aufruf, nicht für ein Deploy mit vielen Schreibtransaktionen. Dieser Weg wurde für diese Seite nicht im Live-Testnet ausgeführt.

**Ihr eigenes Gateway.** Ein Knoten, der dem Testnet folgt und das v3.2.9-Binary betreibt, bedient das Solana-JSON-RPC auf Port 8899 und relayt, wenn der Abschnitt `[svm-rpc]` seiner `app.toml` einen Relayer nennt: `relayer-key` (ein mit Mitteln ausgestatteter Account im Keyring des Knotens, oder mehrere durch Kommas getrennt), `relayer-pqc-key` (deren ML-DSA-87-Schlüssel im Ordner `pqc` des Knotens) und `relayer-keyring-backend`. Ist `relayer-key` leer, wird `sendTransaction` abgelehnt, wie heute am öffentlichen Endpunkt. Lassen Sie `relayer-fee` leer: Der Relayer bepreist dann jeden Träger nach dem, was die Solana-Transaktion zahlt, und legt so nie drauf. Kopieren Sie den gesamten Ordner `lib/` des Release-Bundles. Dieses Setup wurde für diese Seite nicht ausgeführt; zum Knoten selbst siehe [Einen Knoten betreiben](/developer-guide/running-a-node).

## Limits, die Sie einplanen sollten {#limits}

* **Relay-Quote.** Eine Solana-Transaktion, die über ein Gateway gesendet wird, zählt gegen ihren Fee Payer: standardmäßig 600 pro 30 Blöcke, was deutlich unter einer Minute liegt. Ein großes Deploy von einem Schlüssel kann sie überschreiten (ein 1-MB-Programm sind etwa 1.100 Schreibvorgänge). Die abgelehnten Schreibvorgänge kosten nichts. Schreiben Sie den Buffer zuerst mit `qsol program write-buffer`, warten Sie eine Minute und führen Sie es mit demselben Buffer erneut aus, falls es stoppt, dann deployen Sie aus dem Buffer mit `--buffer`, oder lassen Sie die Buffer-Schreibvorgänge und das Deploy von verschiedenen Fee Payern bezahlen.
* **Faire Aufteilung im Gateway.** Ein Gateway hält einen Teil seiner Kapazität für Clients zurück, die wenige Transaktionen gesendet haben, und teilt den Rest gleichmäßig unter den aktiven Client-Netzwerken auf. Wenn Sie mit einer Meldung zur fairen Aufteilung abgelehnt werden (Code `-32005`), warten Sie eine Minute oder verwenden Sie ein anderes Gateway.
* **Die Transaktion muss landen, bevor ihr Blockhash abläuft** (150 Slots). `solana` sendet für Sie erneut; ein Skript sollte dasselbe tun.
* **Eine Transaktion ist höchstens 1.232 Bytes groß, mit höchstens 64 Accounts,** wie bei Solana. Legacy- und Version-0-Nachrichten werden akzeptiert.
* **Programme und Accounts:** je 10 MiB; 32 KiB Stack und 256 KiB Heap pro Frame.
* **Verwahrungslimits** aus [SVM-Lane (v3.2.8)](/developer-guide/svm-lane-v328#custody) gelten weiter: Eine Einzahlung kann mit `svm custody cap exceeded` (Code 23) abgelehnt werden, wenn der SVM-Pool sein Limit erreicht hat.
* **Namen in der Fensterliste.** `--allowed-programs` nimmt Base58-Programm-IDs, höchstens 16, jede nur einmal. Ein Scope gilt für die Top-Level-Instruktionen der Transaktion: Ein aufgelistetes Programm, das andere Programme aufruft, trägt Ihre Signatur weiter, listen Sie also nur Programme, denen Sie als Ganzes vertrauen.
* **Adressen.** Eine neue v3.2.9-Nachricht lehnt eine Bech32-Adresse ab, die nicht in ihrer kanonischen Kleinschreibung vorliegt. Senden Sie die Form, die `toBech32` erzeugt.

## Fehlerbehebung {#troubleshooting}

Mit „live“ markierte Texte wurden am 22. November 2026 im Live-Testnet gesehen. Die übrigen sind die eigenen Meldungen der Chain und des Gateways, wie in den Läufen vor dem Release gesehen.

| Was Sie sehen | Was es bedeutet | Was zu tun ist |
| ------------- | --------------- | -------------- |
| `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)` (JSON-RPC-Code `-32603`, live) | Das Gateway hat keinen Relayer-Account | Verwenden Sie [Ihr eigenes Gateway oder das Kommandozeilen-Relay](#relay) oder warten Sie auf die Betreiber |
| `Error: Account <key> has insufficient funds for spend (X SOL) + fee (Y SOL)` (live, von `solana`) | Der Schlüssel hält nichts. Lesen Sie SOL als QOR | Öffnen Sie das Fenster und statten Sie den Schlüssel mit Mitteln aus, oder öffnen Sie das Fenster und verwenden Sie den Fensterschlüssel als Signer |
| Simulation `InsufficientFundsForFee`, Log `fee payer ... has no account: insufficient fee` (live) | Dieselbe Ursache, aus einer Simulation gesehen | Dieselbe Lösung |
| `invalid solana transaction: no signatures`, `truncated: need 2 bytes at 1` (Code `-32602`, live) | Die Bytes sind keine signierte Solana-Transaktion | Senden Sie die vollständige signierte Wire-Transaktion, Base64 oder Base58 |
| HTTP 405 bei einem Websocket-Upgrade (live) | Der öffentliche Endpunkt bedient keinen Websocket | Fügen Sie `--use-rpc` zu `solana program deploy` und `write-buffer` hinzu; pollen Sie in Skripten mit `getSignatureStatuses` |
| `-32002 ... insufficient priority fee ...` | Die Transaktion zahlt weniger, als ihr Träger kostet | Setzen Sie ComputeBudget-Preis und Einheitenlimit aus dem Fehler-`data`; siehe [Gebühren](#fees) |
| `-32002 ... SVM authorisation window exhausted` | Dem Fenster gingen Blöcke, Transaktionen oder Wert aus, oder die Transaktion würde den Wert überschreiten | Lesen Sie das Fenster, öffnen Sie ein neues mit höherem Wert oder mehr Transaktionen |
| `no open SVM authorisation window` (Codespace `pqc`, Code 341) | Der Schlüssel hat kein Live-Fenster | Öffnen Sie eines (Schritt 5) |
| Öffnen abgelehnt mit Code 343 und `expected_nonce=<N>` | Der Nachweis wurde über eine andere Nonce signiert, zum Beispiel ein alter Nachweis | Lesen Sie die Nonce-Route erneut (Schritt 4), signieren Sie erneut |
| `the key proof does not verify for <key>, sender <qor address>, chain <id>` (CLI) | Die Signatur passt nicht zum Text | Signieren Sie genau `sign_bytes` aus der Nonce-Route, mit dem richtigen Schlüssel und Absender |
| `--svm-keypair holds the key X, not Y` (CLI) | Die Schlüsselpaar-Datei ist nicht der Schlüssel, den Sie genannt haben | Verwenden Sie das Schlüsselpaar, das zum Base58-Schlüssel passt |
| `the window needs the proof that you hold the Solana key` (CLI) | Sie haben weder `--svm-keypair` noch `--svm-key-proof` angegeben | Geben Sie eines davon an; die Meldung gibt den zu signierenden Text aus |
| `blocks must be between 1 and 17280`, `max_txs must be between 1 and 1000`, `max_value must be positive`, `allowed_programs lists N programs, the maximum is 16` | Eine Fenstergrenze liegt außerhalb des Bereichs | Verwenden Sie Werte innerhalb der Tabelle unter [Das Fenster](#window) |
| `svm_pubkey ... is not a valid ed25519 public key`, oder `... is a native account address, not an ed25519 key` | Der Schlüssel ist eine Programmadresse oder eine Ihrer QoreChain-Adressen | Verwenden Sie ein mit `solana-keygen` erzeugtes Schlüsselpaar |
| `sender sol:<payer> has sent 600 transactions in the last 30 blocks` | Die Relay-Quote eines Fee Payers | Warten Sie eine Minute, setzen Sie mit demselben Buffer fort; siehe [Limits](#limits) |
| `-32005` mit `fair share of the relayer quota` | Das Gateway teilt seine Kapazität auf | Versuchen Sie es nach einer Minute erneut |
| `-32020 node is starting, no committed state` | Der Knoten hat noch keinen Zustand | Versuchen Sie es in ein paar Sekunden erneut |
| `node busy: the carrier could not be measured now, retry` | Das Gateway konnte den Träger in diesem Moment nicht bepreisen | Versuchen Sie es erneut |
| `Transaction simulation failed: Blockhash not found` | Der Blockhash ist älter als 150 Slots oder unbekannt | Holen Sie einen frischen Blockhash, signieren Sie und senden Sie erneut |
| `Transaction simulation failed: This transaction has already been processed` | Dieselbe signierte Transaktion wurde schon gesehen | Prüfen Sie `getSignatureStatuses`; senden Sie sie nicht erneut |
| Eine Solana-Transaktion wird mit `cannot approve a delegate`, `cannot hand over the ownership`, `cannot hand over the close authority` oder `cannot change the mint or freeze authority` abgelehnt, mit `the grant would outlive the window` | Ein Fenster mit Standard-Scope lehnt dauerhafte Token-Grants ab | Signieren Sie diese Aktion mit Ihrem eigenen Post-Quanten-Schlüssel auf der Native-Lane, oder öffnen Sie ein Fenster, dessen Programmliste das Token-Programm nennt (siehe [Bekannte Grenzen](#window-limits)) |
| `SVM module is disabled` (Code 11) | Die Lane ist geschlossen. Das ist der Mainnet-Zustand | Verwenden Sie das Testnet |
| `svm custody cap exceeded` (Code 23) | Der SVM-Pool hat sein Limit erreicht | Versuchen Sie es später oder mit einem kleineren Betrag erneut |
| `solana program deploy` eines mit Anchor gebauten Programms wird clientseitig wegen der Features des Programms abgelehnt | Das Werkzeug prüft ELF-Features | Fügen Sie `--skip-feature-verify` hinzu |
| Ein Upgrade durch den Fensterschlüssel wird von `solana` abgelehnt | Die eingetragene Authority ist Ihr Native-Konto, nicht der Schlüssel | Deployen Sie mit einem separaten Deployer-Schlüssel wie in diesem Leitfaden |
| Fenster öffnen oder schließen wird unter Authz, Gruppe oder einem Vertrag abgelehnt | Fenster werden nur durch Ihre eigene Signatur geöffnet und geschlossen | Senden Sie die Nachricht als Top-Level-Nachricht von Ihrem Konto |

## Was geprüft wurde {#tested}

| Prüfung | Wo und wann | Ergebnis |
| ------- | ----------- | -------- |
| `GET /qorechain/svm/v1/params` und `/cluster_info` | Live-Testnet, 22. November 2026 | `enabled` und `execution_enabled` beide `true` |
| `getHealth`, `getVersion`, `getGenesisHash`, `getLatestBlockhash` (Base58), `getMinimumBalanceForRentExemption(1024)` | Live-Testnet, 22. November 2026 | `ok`; `1.18.0-qorechain`; Genesis-Hash wie oben; 44 Zeichen langer Base58-Blockhash; 8.017.920 Lamports |
| `getFeeForMessage` und `simulateTransaction` für eine Überweisung mit einer Signatur | Live-Testnet, 22. November 2026 | Gebühr 45.000.000 Lamports (0,045 QOR); ein Payer ohne Mittel ergibt `InsufficientFundsForFee` |
| Nonce-Route des Schlüsselnachweises und Fenster-Routen | Live-Testnet, 22. November 2026 | Nonce 0, `sign_bytes` wie in Schritt 4; `found` `false` für eine Adresse ohne Fenster |
| Skript aus Schritt 4 gegen das veröffentlichte Beispiel | Route des Live-Testnets, 22. November 2026 | Signatur identisch mit der Tabelle |
| Programm-Build mit `cargo build-sbf` (4.0.0, Platform Tools v1.53) | lokale Maschine, 22. November 2026 | 18.896 Byte große `hello.so` |
| Kostenschätzung von `solana program deploy` mit einem Schlüssel ohne Mittel | Live-Testnet, 22. November 2026 | clientseitig abgelehnt mit Aufwand 0,133 QOR und Gebühr 1,035 QOR |
| `sendTransaction` einer wohlgeformten Überweisung | Live-Testnet, 22. November 2026 | abgelehnt: `this node relays no Solana transactions` |
| Websocket-Upgrade am öffentlichen Endpunkt | Live-Testnet, 22. November 2026 | HTTP 405 |
| Fenster öffnen, `solana transfer` vom Fensterschlüssel, Deploy, Aufruf, Upgrade, Authority setzen, Extend, Schließen, `anchor deploy` und Upgrade | lokales Testnetz vor dem Release, `solana-cli` 4.0.2, `anchor-cli` 1.2.2, `@solana/web3.js` 1.99 | bestanden |
| Dieselben Schritte im Live-Testnet | nicht ausgeführt: Das öffentliche Gateway relayte am 22. November 2026 nichts, und für diese Seite wurde kein Test-QOR ausgegeben | nicht ausgeführt |

## Mainnet {#mainnet}

Das Mainnet läuft mit einem Release ohne all dies: Die SVM-Lane ist dort aus, ihre öffentlichen SVM-Endpunkte sind schreibgeschützt, Cross-VM-Aufrufe bleiben pausiert und der Vertrags-Upload bleibt der Governance vorbehalten. Öffnen Sie keine Fenster, deployen Sie nicht und senden Sie keine Solana-Transaktionen gegen das Mainnet; planen Sie nur gegen das Testnet.

## Siehe auch {#see-also}

* [SVM-Lane (v3.2.8)](/developer-guide/svm-lane-v328): der Zustand der Lane, Rent, Verwahrungslimits und der Post-Quanten-Schlüssel eines SVM-Wallets.
* [SVM-Entwicklung](/developer-guide/svm-development): der Überblick über die Lane und der JSON-RPC-Server.
* [Solana-kompatibles JSON-RPC](/api-reference/json-rpc-solana-compatible): die Methodenliste.
* [Post-Quanten-Signierung](/developer-guide/post-quantum-signing): Ihren ML-DSA-87-Schlüssel registrieren und verwenden.
* [Referenz zum EVM-Autorisierungsfenster](/developer-guide/evm-window-reference): dieselbe Idee für Schlüssel im Ethereum-Stil.
* [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability): Aufrufe zwischen SVM, EVM und QoreChain Native.
* [Versionsverlauf](/appendix/version-history#v329): was v3.2.9 geändert hat.
