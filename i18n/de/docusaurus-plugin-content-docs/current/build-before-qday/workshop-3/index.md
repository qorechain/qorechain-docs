---
slug: /build-before-qday/workshop-3
title: "Workshop 3: Verschlüsselte Apps und Cross-VM"
sidebar_label: "Workshop 3"
sidebar_position: 4
date: 2026-11-20
---

# Workshop 3: Verschlüsselte Apps und Cross-VM

Workshop 2 hat Geld mit einem Post-Quanten-Schlüssel geschützt. Workshop 3 macht mit derselben Chain zwei neue Dinge. Erstens **verschlüsseln Sie eine Nachricht an eine QoreChain-Adresse**, sodass nur der Besitzer dieser Adresse sie lesen kann, mit Post-Quanten-Verschlüsselung. Zweitens schreibt eine Transaktion auf der **EVM** in einen Contract auf **QoreChain Native**, und beide Seiten ändern sich zusammen oder gar nicht.

Sie müssen kein Kryptograf sein. Jeder Befehl unten sagt, was er tut und was Sie sehen sollten. Die beiden Beispiel-Apps sind öffentlich: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), Ordner `workshop-3`. Beide laufen nur im QoreChain-Testnet `qorechain-diana`. Test-QOR hat keinen Wert.

**Wie lange das dauert:** etwa 30 Minuten für QoreSeal, 40 für den Cross-VM-Checkout. Die beiden Teile sind unabhängig voneinander, und jeder braucht eigene Testkonten.

## Was wir bauen {#what-we-built}

| Teil | App | Was sie zeigt |
| --- | --- | --- |
| 1 | **QoreSeal** (Node.js) | Eine Nachricht mit ML-KEM-1024 an eine Adresse `qor1...` verschlüsseln, sie öffnen, sehen, dass Außenstehende es nicht können, sehen, dass Manipulation erkannt wird, und einen Schlüssel rotieren, ohne alte Post zu verlieren. |
| 2 | **CrossVmCheckout** (Solidity und Rust) | Ein Aufruf aus einem EVM-Contract schreibt in derselben Transaktion eine Quittung in einen Native-Contract. Scheitert eine der beiden Seiten, werden beide Seiten rückgängig gemacht. |

Die Neuerungen dahinter:

- **Verschlüsselung an eine Adresse.** Jedes Konto kann einen Post-Quanten-Verschlüsselungsschlüssel auf der Chain veröffentlichen, wie ein öffentliches Telefonbuch. Um jemandem zu schreiben, brauchen Sie nur seine Adresse.
- **Eine Karte, die den Schlüssel an das Konto bindet.** Das Konto signiert eine kleine Empfängerkarte mit beiden Signaturschlüsseln, sodass niemand einen gefälschten Verschlüsselungsschlüssel dazwischenschieben kann.
- **Hybride Verschlüsselung.** ML-KEM-1024 (NIST FIPS 203) wird mit dem klassischen X25519-Schlüssel kombiniert. Die Nachricht bleibt privat, solange eines von beiden hält.
- **Cross-VM-Atomarität.** Die EVM und QoreChain Native teilen sich einen Zustand und einen Block. Ein Aufruf zwischen ihnen ist Teil derselben Transaktion, es bleibt also kein halbfertiger Zustand zum Aufräumen.
- **Reichweite mit Genehmigung der Governance.** Die Bridge ruft nur Native-Contracts auf, die die Governance genehmigt hat, und jede Genehmigung ist an den Code des Contracts gebunden.

## Begriffe in diesem Leitfaden {#words}

| Begriff | Einfache Bedeutung |
| --- | --- |
| ML-KEM-1024 | Ein Post-Quanten-Schlüsselaustausch (NIST FIPS 203). Hier dient er dazu, für jede Nachricht einen geheimen Schlüssel zu vereinbaren |
| X25519 | Ein klassischer Schlüsselaustausch, mit ML-KEM kombiniert, damit der Umschlag hält, auch wenn eines von beiden gebrochen wird |
| ML-DSA-87 | Die Post-Quanten-Signatur (NIST FIPS 204). Jede native Transaktion wird mit ihr und mit dem klassischen secp256k1-Schlüssel signiert |
| Empfängerkarte | Eine kleine signierte Notiz, die die Verschlüsselungsschlüssel eines Kontos an das Konto bindet |
| Umschlag | Die versiegelte Nachricht, gespeichert als Textdatei, die Sie auf beliebigem Weg verschicken können |
| Native | QoreChain Native, die CosmWasm-Lane, in der Contracts in Rust geschrieben werden |
| Bridge-Precompile | Ein eingebauter Contract bei `0x0000000000000000000000000000000000000901`, der es einem EVM-Contract erlaubt, einen Native-Contract aufzurufen |
| Allowlist | Die Native-Contracts, die die Governance für die Bridge freigegeben hat |
| EVM-Fenster | Eine kurze, begrenzte Erlaubnis, von einem Konto aus Transaktionen im Ethereum-Stil zu senden. Zum Öffnen braucht es eine mit beiden Schlüsseln signierte Transaktion |

:::caution Nur Wegwerf-Konten im Testnet
Verwenden Sie Schlüssel, die für diesen Workshop erzeugt wurden und Test-QOR ohne Wert enthalten. Tragen Sie niemals die geheimen Wörter oder den Schlüssel eines Kontos mit echtem Geld in eine Datei oder einen Befehl ein.
:::

## Bevor Sie beginnen {#prerequisites}

Sie brauchen die Werkzeuge aus [Bevor Sie beginnen](/build-before-qday/prerequisites) (ein Terminal, Node.js und Git) und einen Browser für den Faucet. Teil 1 braucht Node.js 20 oder neuer. Teil 2 braucht außerdem **pnpm** und **Foundry**, optional Rust. Prüfen Sie Node.js:

```bash
node -v
```

Es sollte `v20` oder höher ausgeben. Für Teil 2 installieren Sie den Rest:

```bash
npm install -g pnpm
```

Installiert pnpm, das Paketwerkzeug, das Teil 2 verwendet. Prüfen Sie es mit `pnpm -v`. Foundry kompiliert, testet und stellt Solidity bereit: Installieren Sie es von [getfoundry.sh](https://getfoundry.sh) und führen Sie dann `foundryup` aus. Prüfen Sie mit `forge --version` und `cast --version`.

Holen Sie sich den Beispielcode:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-3
```

Die erste Zeile lädt die Beispiele in einen Ordner namens `build-before-qday` herunter. Die zweite wechselt in den Ordner `workshop-3`, der die beiden Apps enthält.

Test-QOR bekommen Sie vom [Faucet](/dashboard/faucet) im Dashboard.

## Teil 1: QoreSeal, an eine Adresse verschlüsseln {#part-1}

Code: [workshop-3/01-qoreseal](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/01-qoreseal). Pakete: `@qorechain/qoreseal` und `@qorechain/qoresign`.

Sie wollen jemandem eine private Nachricht schicken und kennen nur seine Adresse. Diese App zeigt, wie das geht:

1. Alice registriert ihre Schlüssel auf der Chain.
2. Jeder kann den Verschlüsselungsschlüssel von Alice über ihre Adresse nachschlagen.
3. Eine Nachricht wird an Alice versiegelt. Alice öffnet sie. **Eve kann es nicht.**
4. Ändern Sie ein Bit des Umschlags, und er **lässt sich nicht mehr öffnen**.
5. Eine Nachricht, versiegelt an Alice **und** Bob: Jeder öffnet sie mit seinem eigenen Schlüssel.
6. Alice **rotiert** ihren Schlüssel: Die alte Karte wird abgelehnt, neue Nachrichten verwenden den neuen Schlüssel, und alte Nachrichten lassen sich weiterhin öffnen.

Die Verschlüsselung findet auf Ihrem Computer statt. Die Chain sieht die Nachricht nie, nur den öffentlichen Schlüssel.

```bash
cd 01-qoreseal
```

Wechselt in den QoreSeal-Ordner.

### Schritt 1: installieren {#seal-install}

```bash
npm install
```

Lädt die exakten Paketversionen aus `package-lock.json` herunter: QoreSeal, QoreSign (den hybriden Signierer) und ein paar cosmjs-Helfer, die die Transaktion bauen.

```bash
node seal.mjs help
```

Listet alle Befehle auf.

### Schritt 2: drei Testnet-Konten erstellen {#seal-accounts}

```bash
node seal.mjs init alice
node seal.mjs init bob
node seal.mjs init eve
```

Jeder Befehl erstellt ein neues Konto und speichert dessen geheime Wörter in `~/.config/qday-w3/<name>.json`, nur für Sie lesbar. Es wird nichts Geheimes ausgegeben. Setzen Sie `QDAY_DIR`, um die Dateien woanders abzulegen. Jeder Befehl gibt die Adresse `qor1...` des Kontos aus.

### Schritt 3: Alice aufladen {#seal-fund-alice}

Fügen Sie die Adresse `qor1...` von Alice in den [Faucet](/dashboard/faucet) ein und prüfen Sie dann:

```bash
node seal.mjs whoami
```

Zeigt jedes Konto: Adresse, Guthaben und ob seine Schlüssel schon auf der Chain sind. Vorerst lautet die Antwort `no`.

### Schritt 4: Alice registriert ihre Schlüssel {#seal-register}

```bash
node seal.mjs register alice
```

Zwei Transaktionen:

1. **Der ML-DSA-87-Signaturschlüssel**, mit einem Nachweis, dass er Alice gehört. Das ist die einzige Transaktion, die die Chain nur mit dem klassischen Schlüssel akzeptiert, weil sie ihren Post-Quanten-Schlüssel noch nicht kennt.
2. **Der ML-KEM-1024-Verschlüsselungsschlüssel** (1.568 Bytes), mit beiden Schlüsseln signiert. Ab jetzt kann ihn jeder von der Chain lesen.

Danach signiert der Befehl die **Empfängerkarte** von Alice und speichert sie als `cards/alice.json`. In einer echten App würden Sie die Karte neben der Adresse veröffentlichen, zum Beispiel auf einer Profilseite, in einem Contract oder hinter einer API.

### Schritt 5: QOR an Bob und Eve geben und Bob registrieren {#seal-bob}

```bash
node seal.mjs fund alice bob 3
node seal.mjs fund alice eve 3
```

Sendet 3 Test-QOR von Alice an Bob und an Eve. Wie jede Transaktion nach der Registrierung wird sie mit **beiden** Schlüsseln signiert, und die Chain prüft beide. Deshalb registriert sich Alice zuerst: Ein Konto ohne ML-DSA-87-Schlüssel auf der Chain kann nur einen registrieren, und jede andere Transaktion davon wird abgelehnt.

```bash
node seal.mjs register bob
```

Bob wird für Schritt 9 gebraucht, in dem eine Nachricht an zwei Personen geht. Eve bleibt unregistriert: Sie ist die Außenstehende, die versuchen wird, die Post von Alice zu lesen.

### Schritt 6: Alice nachschlagen, wie es ein Absender tun würde {#seal-lookup}

```bash
node seal.mjs lookup alice
```

Liest `GET /qorechain/pqc/v1/kem/<address>` von der öffentlichen REST-API: den Algorithmus (`ML-KEM-1024`), den öffentlichen Schlüssel von 1.568 Bytes und den Block, in dem er registriert wurde. Dann prüft der Befehl die Karte gegen diesen Schlüssel und gegen den ML-DSA-87-Schlüssel von Alice auf der Chain. Sie sollten `card valid` sehen. Das geht für jede Adresse: `node seal.mjs lookup qor1...`.

### Schritt 7: Eine Nachricht an Alice versiegeln und öffnen {#seal-send}

```bash
node seal.mjs send alice "Payroll for March: 12,400 QOR to the team"
```

Liest den Schlüssel von Alice von der Chain, prüft ihre Karte und versiegelt die Nachricht. Eine Nachricht von 41 Zeichen wird etwa 1.760 Bytes groß, überwiegend Post-Quanten-Schlüsselmaterial. Der Umschlag wird in `inbox/` gespeichert.

```bash
node seal.mjs open alice
```

Zeigt `OPENED by alice with encryption key #0` und die Nachricht.

```bash
node seal.mjs open eve
```

Zeigt `CANNOT OPEN: eve holds none of the keys this envelope was sealed to`. Eve hat die Datei, aber nicht den Schlüssel von Alice.

### Schritt 8: Manipulieren {#seal-tamper}

```bash
node seal.mjs tamper alice
```

Kippt ein Bit des Umschlags und versucht, ihn zu öffnen. Sie sollten `REFUSED` mit `DECRYPTION_FAILED` sehen. Der Umschlag ist authentifiziert, daher wird jede Änderung erkannt, und niemand kann eine versiegelte Nachricht verändern.

### Schritt 9: Eine Nachricht, zwei Empfänger {#seal-multi}

```bash
node seal.mjs send alice,bob "Board memo: Q4 budget"
node seal.mjs open bob
node seal.mjs open alice
```

Ein Umschlag, an beide Adressen versiegelt. Jeder öffnet ihn mit seinem eigenen Schlüssel. Eve kann es weiterhin nicht.

### Schritt 10: Den Schlüssel von Alice rotieren {#seal-rotate}

```bash
node seal.mjs rotate alice
```

Leitet aus denselben geheimen Wörtern den **nächsten** Verschlüsselungsschlüssel von Alice ab (Nummer 1) und registriert ihn auf der Chain, wo er den alten **ersetzt**. Dann prüft der Befehl die **alte** Karte gegen die Chain, und Sie sollten `refused: the card names a different ML-KEM-1024 key than the registered one` sehen. Absender, die die Karte prüfen, können nicht mehr an den alten Schlüssel versiegeln. Eine neue Karte wird signiert.

```bash
node seal.mjs open alice inbox/$(ls inbox | head -1)
```

Öffnet den **ersten** Umschlag, der vor der Rotation versiegelt wurde: `OPENED by alice with encryption key #0 (an older key)`. Der alte Schlüssel wurde nie gespeichert. Er wird aus den geheimen Wörtern erneut abgeleitet, daher sperrt Sie eine Rotation nie aus alter Post aus.

```bash
node seal.mjs inspect
```

Zeigt, was in einem Umschlag steckt, ohne das Geheimnis: Version, Zweck, Empfänger und Größen.

### Wie der Code funktioniert {#seal-code}

Alles steht in `seal.mjs`. Die wichtigen QoreSeal-Aufrufe:

| Aufruf | Was er tut |
| --- | --- |
| `deriveSealKeys({ mnemonic, index })` | Die Verschlüsselungsschlüssel der Schlüsselnummer `index`, abgeleitet aus den geheimen Wörtern |
| `buildRegisterKemKeyMessage({ sender, mlkemPublicKey })` | Die Nachricht `MsgRegisterKEMKey`, die den Schlüssel auf die Chain bringt |
| `signRecipientCard({ chainId, address, keys, classicalKey, pqKey })` | Die Karte, mit beiden Signaturschlüsseln des Kontos signiert |
| `verifyRecipientCard({ card, chainId, address, mlkemPublicKey, pqPublicKey })` | Wirft einen Fehler, wenn die Karte nicht zu den Schlüsseln auf der Chain passt |
| `sealToAddresses({ rest, chainId, purpose, recipients, plaintext })` | Liest jeden Schlüssel von der Chain, prüft jede Karte, versiegelt |
| `open({ chainId, purpose, envelope, keys })` | Öffnet den Umschlag oder wirft einen Fehler |
| `envelopeToText` und `envelopeFromText` | Der Umschlag als Textdatei und zurück |

`purpose` (hier `qday-note`) ist Teil dessen, was versiegelt wird: Ein Umschlag, der für eine App erstellt wurde, lässt sich nicht öffnen, als käme er von einer anderen.

### Wenn etwas schiefgeht (QoreSeal) {#seal-trouble}

| Was Sie sehen | Was zu tun ist |
| --- | --- |
| `does not exist on chain yet: fund ... first` | Das Konto hat kein QOR: Nutzen Sie den Faucet oder `fund` |
| `no ML-KEM key registered for this address` | Führen Sie zuerst `register` für dieses Konto aus |
| `hybrid mode needs the recipient card` | Die Datei `cards/<name>.json` fehlt: Führen Sie `register <name>` aus, es schreibt die Karte erneut |
| `no envelope yet` | Führen Sie zuerst `send` aus |
| `account has no PQC key and classical fallback is disabled` | Dieses Konto hat sich noch nicht registriert: Führen Sie `register <name>` aus, bevor Sie `fund` davon verwenden |
| `refused: ...` bei einer Transaktion | Lesen Sie die Meldung: meist zu wenig QOR, oder die öffentliche Testnet-API begrenzt Ihre Anfragen. Warten Sie ein paar Sekunden |

Die Dateien in `~/.config/qday-w3/` enthalten geheime Wörter. Committen oder teilen Sie sie nie, und verwenden Sie sie nie im Mainnet wieder. Die Ordner `cards/` und `inbox/` sind lokal und in `.gitignore` aufgeführt.

## Teil 2: CrossVmCheckout, eine Transaktion über zwei VMs {#part-2}

Code: [workshop-3/02-cross-vm](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/02-cross-vm). Sprachen: Solidity und TypeScript für die EVM-Seite, Rust für die Native-Seite.

QoreChain betreibt mehr als eine virtuelle Maschine auf derselben Chain: die **EVM** (Solidity, im Stil von MetaMask) und **QoreChain Native** (CosmWasm-Contracts in Rust). Sie teilen sich einen Zustand und einen Block. Diese App ist ein winziger Shop:

- **`CrossVmCheckout`** (Solidity, EVM) zählt Bestellungen.
- **`qday-receipts`** (Rust, Native) führt ein Quittungsbuch.
- Ein Aufruf von `checkout("coffee for the team")` macht beides **in derselben Transaktion**: Die Bestellzahl steigt auf der EVM-Seite, und auf der Native-Seite wird eine Quittung geschrieben.

Es geht um **Atomarität**: Beide Seiten ändern sich zusammen, oder keine ändert sich.

| Befehl | Was passiert | Ergebnis |
| --- | --- | --- |
| `checkout` | Bestellung +1 auf der EVM, Quittung +1 auf Native | Beide ändern sich |
| `undo` | Die Native-Quittung wird geschrieben, **dann** macht die EVM-Seite rückgängig | Keine ändert sich: Auch die Quittung wird rückgängig gemacht |
| `native-fails` | Die Bestellung wird gezählt, **dann** lehnt der Native-Contract ab | Keine ändert sich: Auch die Bestellung wird rückgängig gemacht |
| `outside` | Die Bridge bitten, einen Native-Contract aufzurufen, den die Governance nicht genehmigt hat | Von der Chain abgelehnt |

Im Mainnet sind Cross-VM-Aufrufe derzeit pausiert, deshalb läuft dieser Teil nur im Testnet.

### Die Bridge und die Allowlist {#bridge}

Die EVM erreicht Native über das Bridge-Precompile bei `0x0000000000000000000000000000000000000901`. Sie rufen auf:

```solidity
executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)
```

| Argument | Bedeutung |
| --- | --- |
| `targetVM` | `1` für Native |
| `targetContract` | Die Adresse `qor1...` des Native-Contracts |
| `payload` | Die JSON-Nachricht des Native-Contracts |

Die Bridge erreicht nur Native-Contracts, die die **Governance** genehmigt hat. Die Liste ist öffentlich, in den crossvm-Parametern (`GET https://api-testnet.qore.host/qorechain/crossvm/v1/params`), und jeder Eintrag ist an den Code des Contracts gebunden, sodass ein genehmigter Contract später nicht gegen anderen Code ausgetauscht werden kann.

Der Native-Contract, den Sie aufrufen werden, `qday-receipts`, steht auf der Testnet-Allowlist (Governance-Vorschlag 40, Code-ID 865):

```text
qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8
```

Er hat keinen Admin, also kann ihn niemand ändern. **Jeder Builder kann ihn für den Cross-VM-Track aus seinen eigenen Contracts aufrufen.** Auf der Native-Seite ist der Absender des Aufrufs das eigene `qor1...`-Konto Ihres EVM-Contracts, nicht Ihre Wallet, sodass jede Quittung zeigt, welcher Contract sie geschrieben hat.

### Wie der EVM-Contract funktioniert {#xvm-how}

Öffnen Sie `evm/src/CrossVmCheckout.sol`:

```solidity
function checkout(string calldata note, bool failAfter) external returns (bytes memory reply) {
    _checkNote(bytes(note));
    orders += 1;
    reply = _callNative(bytes(string.concat('{"record":{"note":"', note, '"}}')));
    if (failAfter) revert EvmSideFailed();
    emit Ordered(orders, msg.sender, note, reply);
}

function _callNative(bytes memory payload) private returns (bytes memory) {
    (bool ok, bytes memory ret) =
        BRIDGE.call(abi.encodeWithSignature("executeCrossVMCall(uint8,string,bytes)", NATIVE, receipts, payload));
    if (!ok) revert BridgeCallFailed(ret);
    if (ret.length == 0) revert BridgeNotActive();
    if (ret.length >= 64 && uint256(bytes32(ret)) == 32) return abi.decode(ret, (bytes));
    return ret;
}
```

1. **Die Notiz prüfen.** Sie steht in einem JSON-String, daher muss sie 1 bis 140 druckbare Zeichen haben, ohne `"` und ohne `\`. Sonst könnte eine präparierte Notiz die Nachricht ändern, die der Native-Contract erhält.
2. **Die Bestellung zählen.** Eine normale Zustandsänderung auf der EVM.
3. **Die Bridge aufrufen.** Der Native-Contract läuft direkt dort, innerhalb dieser Transaktion.
4. **Wenn der Bridge-Aufruf scheiterte, rückgängig machen.** Ein Native-Fehler wird zu einem EVM-Revert, und die ganze Transaktion wird rückgängig gemacht.
5. **Keine Antwort heißt keine Bridge.** Auf einer Chain, auf der das Precompile nicht aktiv ist, „gelingt“ ein Aufruf dieser Adresse mit leeren Daten. Behandeln Sie das als Fehler, nie als Erfolg.
6. **Die Antwort dekodieren.** Die Bridge liefert die Native-Antwort als ABI-kodierte `bytes`. Der Code akzeptiert auch rohe Bytes.
7. **`failAfter`** macht rückgängig, nachdem der Native-Aufruf gelungen ist. Es zeigt, dass auch die auf der Native-Seite geschriebene Quittung rückgängig gemacht wird.

Verwenden Sie einen normalen `call`, keinen `staticcall` und keine View-Funktion: Die Bridge lehnt statische Aufrufe ab, weil die Native-Seite Zustand schreiben kann.

Alle Befehle unten laufen im Ordner `evm`, sofern nicht anders angegeben:

```bash
cd ../02-cross-vm/evm
```

Wenn Sie noch in `01-qoreseal` sind, wechselt das in den EVM-Ordner der Cross-VM-App.

### Schritt 1: Die Tests ausführen (kein Konto nötig) {#xvm-tests}

```bash
pnpm install
pnpm forge-std
forge test
```

`pnpm install` lädt die JavaScript-Pakete herunter. `pnpm forge-std` lädt einmalig die Standardbibliothek von Foundry nach `lib/` herunter. `forge test` führt die 5 Tests in `test/CrossVmCheckout.t.sol` aus. Sie sollten `5 passed; 0 failed` sehen.

Die lokale EVM von Foundry hat keine QoreChain-Bridge, deshalb legen die Tests mit `vm.etch` eine kleine Fake-Bridge bei `0x...0901` an. Sie prüfen die exakt gesendete JSON-Nachricht, dass `failAfter` alles rückgängig macht, dass ein Native-Fehler die EVM-Seite rückgängig macht, dass eine Notiz kein JSON einschleusen kann und dass eine inaktive Bridge ein Fehler ist. Die echte Bridge läuft in den nächsten Schritten.

### Schritt 2: Ein Konto mit Post-Quanten-Schlüssel {#xvm-account}

Wenn Sie Workshop 2 gemacht haben, kopieren Sie Ihre `.env` von dort (dasselbe Konto, Schlüssel schon registriert) und fügen Sie die Zeile `RECEIPTS_CONTRACT` aus `.env.example` hinzu. Andernfalls:

```bash
cast wallet new
cp .env.example .env
```

`cast wallet new` erstellt ein Wegwerf-Konto. Tragen Sie dessen privaten Schlüssel in `.env` als `PRIVATE_KEY` ein. **Nur Testnet.**

```bash
pnpm window recovery-code
```

Gibt einen Code `QRC1-...` aus. Tragen Sie ihn in `.env` als `QORE_PQC_RECOVERY_CODE` ein und bewahren Sie eine Kopie getrennt vom privaten Schlüssel auf. Ihr ML-DSA-87-Schlüssel wird daraus abgeleitet.

```bash
pnpm window status
```

Zeigt Ihre Adresse `qor1...`. Fügen Sie sie in den [Faucet](/dashboard/faucet) ein, dann:

```bash
pnpm window register
```

Hinterlegt Ihren ML-DSA-87-Schlüssel auf der Chain, einmal pro Konto. `pnpm window status` zeigt jetzt `PQC key: registered`.

### Schritt 3: Ein begrenztes EVM-Fenster öffnen {#xvm-window}

```bash
pnpm window:scoped
```

Öffnet ein Fenster von **1.200 Blöcken (etwa 28 Minuten), 6 Transaktionen und 3 QOR** an Wert plus Gebühren. Das reicht für das Deploy und die drei Demo-Transaktionen, nicht mehr. Ihre Wallet ruft **Ihren eigenen Contract** auf, und der Contract ruft dann die Bridge mit seiner eigenen Identität auf, sodass das Fenster nur den Aufruf Ihres Contracts zulassen muss.

**Warten Sie etwa 10 Sekunden** vor dem nächsten Schritt, damit die Fenster-Transaktion in einem Block ist.

### Schritt 4: Den Shop bereitstellen {#xvm-deploy}

```bash
pnpm deploy:testnet
```

Stellt `CrossVmCheckout` bereit, mit Verweis auf `RECEIPTS_CONTRACT`. Suchen Sie nach `CrossVmCheckout 0x...`. In der Ausgabe von Foundry bedeutet „ETH“ QOR.

```bash
pnpm xvm status
```

Zeigt beide Seiten: `orders` in Ihrem EVM-Contract und die Anzahl der Quittungen in `qday-receipts`, mit den letzten drei Quittungen. Andere Builder schreiben in dasselbe Quittungsbuch, die Anzahl ist also wahrscheinlich nicht null. Entscheidend ist, wie sie sich **ändert**.

### Schritt 5: Ein Contract, den die Chain nicht genehmigt hat {#xvm-outside}

```bash
pnpm xvm outside
```

Simuliert einen direkten Bridge-Aufruf an einen echten Native-Contract, der **nicht** auf der Allowlist steht. Sie sollten `REFUSED by the bridge: ... is not allowlisted` sehen. Das ist kostenlos und verbraucht keine Fenster-Transaktion.

### Schritt 6: Eine Transaktion, zwei VMs {#xvm-checkout}

```bash
pnpm xvm checkout "coffee for the team"
```

Sie sehen `before`, die Transaktion (`SUCCESS`) und `after`: orders +1 **und** receipts +1, dazu die neue Quittung mit Ihrer Notiz, gesendet `from` der Adresse `qor1...` Ihres Contracts. Dann `both sides changed, in the same transaction`.

### Schritt 7: Die EVM-Seite scheitert nach dem Native-Aufruf {#xvm-undo}

```bash
pnpm xvm undo "this receipt must disappear"
```

Die Native-Quittung wird geschrieben, dann macht die EVM-Seite rückgängig. Die Transaktion wird als `REVERTED` aufgenommen, und `before` und `after` sind identisch: `nothing changed on either side`. Auch die Quittung, die auf der Native-Seite geschrieben wurde, ist weg.

### Schritt 8: Die Native-Seite lehnt ab {#xvm-native-fails}

```bash
pnpm xvm native-fails
```

Die Bestellung wird auf der EVM-Seite gezählt, dann lehnt `qday-receipts` mit `{"fail":{}}` ab. Die Transaktion ist `REVERTED`, und die Zahlen sind identisch: Auch die EVM-Bestellung wird rückgängig gemacht.

Jede Transaktion hat einen Explorer-Link. Öffnen Sie ihn im [Dashboard-Explorer](/dashboard/explorer) mit dem Netzwerkwähler auf **Testnet**.

### Wenn etwas schiefgeht (Cross-VM) {#xvm-trouble}

| Was Sie sehen | Was es bedeutet | Was zu tun ist |
| --- | --- | --- |
| `Missing or invalid parameters` beim Deploy oder bei einer Transaktion | Kein aktives EVM-Fenster | `pnpm window status`, dann `pnpm window:scoped`, 10 Sekunden warten, erneut versuchen |
| `No shop yet` | Aus diesem Ordner wurde noch nichts bereitgestellt | Schritt 4, oder setzen Sie `SHOP_ADDRESS` in `.env` |
| `BridgeCallFailed` mit `not allowlisted` | Das Ziel ist von der Governance nicht genehmigt | Verwenden Sie `qday-receipts`, die Adresse oben |
| `BridgeNotActive` | Das Bridge-Precompile ist in diesem Netzwerk nicht aktiv | Verwenden Sie das Testnet |
| `BadNote` | Die Notiz ist leer, zu lang oder enthält `"` oder `\` | Verwenden Sie einfachen Text bis 140 Zeichen |

### Die Native-Seite {#native-side}

Der Ordner `native/` enthält den vollständigen Quellcode von `qday-receipts` (CosmWasm 2, Rust):

| Nachricht | Was sie tut |
| --- | --- |
| `{"record":{"note":"..."}}` | Fügt eine Quittung hinzu: ID, Absender, Notiz, Blockhöhe |
| `{"fail":{}}` | Lehnt immer ab, um Atomarität zu zeigen |
| `{"count":{}}` (Abfrage) | Wie viele Quittungen |
| `{"receipt":{"id":1}}` (Abfrage) | Eine Quittung |
| `{"latest":{"limit":3}}` (Abfrage) | Die neuesten Quittungen, die neueste zuerst, höchstens 20 |

Führen Sie seine Tests aus (Rust nötig):

```bash
cd ../native
cargo test
```

Sie sollten 3 bestandene Tests sehen. Das Hochladen von Native-Contracts im Testnet läuft über die Governance, Sie müssen diesen also nicht bereitstellen: Er ist bereits live.

Um zu prüfen, dass der Code auf der Chain dieser Quellcode ist, bauen Sie ihn mit dem CosmWasm-Optimizer und vergleichen Sie die Prüfsummen. Der Code auf der Chain wurde auf einem Apple-Silicon-Mac mit dem arm64-Image gebaut, verwenden Sie also dasselbe: Das x86-Image erzeugt eine andere Prüfsumme.

```bash
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

Die Prüfsumme sollte `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c` sein, derselbe `data_hash`, den die Chain für Code 865 zeigt:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/865" | head -c 400
```

Lesen Sie das Quittungsbuch von überall, ohne Konto:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8/smart/$(printf '{"latest":{"limit":3}}' | base64)"
```

### Dateien {#files}

```text
evm/src/CrossVmCheckout.sol         the shop: counts orders, writes receipts through the bridge
evm/test/CrossVmCheckout.t.sol      Foundry tests, with a fake bridge
evm/script/CrossVmCheckout.s.sol    deploy script (reads RECEIPTS_CONTRACT and PRIVATE_KEY)
evm/scripts/window.ts               pnpm window: status, register, open, recovery-code
evm/scripts/xvm.ts                  pnpm xvm: status, checkout, undo, native-fails, outside
evm/.env.example                    the settings to copy into .env
native/src/lib.rs                   qday-receipts, the Native contract
```

## Mehr erfahren {#learn-more}

- Das Fest, die Tracks Encrypted Apps und Cross-VM und die Bounties: [build.qorechain.io](https://build.qorechain.io).
- QoreSeal auf npm: [@qorechain/qoreseal](https://www.npmjs.com/package/@qorechain/qoreseal).
- [EVM-Precompiles](/developer-guide/evm-precompiles) und die [Cross-VM-Referenz](/developer-guide/cross-vm-reference).
- [Workshop 2](/build-before-qday/workshop-2) für das EVM-Fenster und den Vault.
