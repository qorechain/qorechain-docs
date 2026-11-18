---
slug: /build-before-qday/workshop-2
title: "Workshop 2: Geld mit einem Post-Quanten-Schlüssel schützen"
sidebar_label: "Workshop 2"
sidebar_position: 3
date: 2026-11-18
---

# Workshop 2: Geld mit einem Post-Quanten-Schlüssel schützen

Workshop 1 hat eine Transaktion gesendet, die mit zwei Schlüsseln signiert war. Workshop 2 nutzt den Post-Quanten-Schlüssel, um **Geld zu schützen**: zuerst ein Smart Contract, der nur auszahlt, wenn ein Post-Quanten-Schlüssel signiert, dann ein KI-Agent, dessen Ausgabelimits von der Chain durchgesetzt werden, und schließlich eine Möglichkeit, die Chain zu fragen, wie jede Transaktion geschützt war.

Sie müssen kein Sicherheitsexperte sein. Jeder Befehl unten sagt, was er tut und was Sie sehen sollten. Die drei Beispiel-Apps sind öffentlich: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), Ordner `workshop-2`.

**Wie lange das dauert:** etwa 40 Minuten für den Vault, 25 für den Agenten, 10 für die Fragen an die Chain. Die Teile können Sie in beliebiger Reihenfolge machen, aber jeder Teil braucht sein eigenes Testkonto.

## Was wir bauen {#what-we-built}

| Teil | App | Was sie zeigt |
| --- | --- | --- |
| 1 | **QDayVault** (Solidity und TypeScript) | Ein Vault, der nur mit einer ML-DSA-87-Signatur auszahlt, auf der Chain vom Precompile `pqcVerify` geprüft. Ein gestohlener Schlüssel im Ethereum-Stil reicht nicht, um das Geld zu nehmen. |
| 2 | **Rechnungen zahlender Agent** (Node.js) | Ein Agent mit eigenem Schlüssel. Die Chain setzt seine Limits durch: nur senden, 1 QOR pro Zahlung, 3 QOR pro Tag, 24 Stunden. |
| 3 | **Die Chain fragen** (MCP und `qore-cli`) | Nur lesende Fragen: Wurde diese Transaktion Post-Quanten-signiert, und wie ist der Zustand des Schlüssels dieses Kontos? |

Die Neuerungen dahinter:

- **Post-Quanten-Verifizierung innerhalb eines Contracts.** Die Chain hat eingebaute Contracts (Precompiles) an festen Adressen, die ML-DSA-87-Signaturen prüfen und den registrierten Schlüssel eines Kontos melden. Ihr Solidity-Code ruft sie wie jeden anderen Contract auf.
- **Limits, die auf der Chain leben.** Die Berechtigungen und Ausgaberegeln eines Agenten sind Teil des Kontos, sodass ein Fehler oder ein gestohlener Server sie nicht aufheben kann.
- **Ehrliche Kennzeichnung.** Die Chain kann Ihnen sagen, welche Transaktionen eine Post-Quanten-Signatur trugen und welche nicht.

## Begriffe in diesem Leitfaden {#words}

| Begriff | Einfache Bedeutung |
| --- | --- |
| Precompile | Ein eingebauter Contract an einer festen Adresse, den die Chain nativ ausführt. `pqcVerify` liegt bei `0x0000000000000000000000000000000000000a01` und `pqcKeyStatus` bei `0x0000000000000000000000000000000000000a02`. Schreiben Sie die Adressen in Kleinbuchstaben: Der Solidity-Compiler lehnt gemischte Groß- und Kleinschreibung ab |
| ML-DSA-87 | Das Post-Quanten-Signaturverfahren (NIST FIPS 204), das QoreChain verwendet |
| EVM-Fenster | Eine kurze, begrenzte Erlaubnis, von einem Konto aus Transaktionen im Ethereum-Stil zu senden. Zum Öffnen braucht es eine mit beiden Schlüsseln signierte Transaktion, sodass ein Ethereum-Schlüssel allein nie eines öffnen kann |
| Guardian | Das Konto, dessen Post-Quanten-Schlüssel jede Auszahlung aus dem Vault signieren muss |
| Authenticator | Ein mit Ihrem Konto verknüpfter Schlüssel mit Regeln, die die Chain durchsetzt, wie ihn der Agent in Teil 2 verwendet |
| Wegwerf-Konto | Ein für diese Übung erzeugter Schlüssel, der nur Test-QOR enthält |

:::caution Nur Wegwerf-Konten im Testnet
Verwenden Sie Schlüssel, die für diesen Workshop erzeugt wurden und Test-QOR ohne Wert enthalten. Tragen Sie niemals den Schlüssel oder Wiederherstellungscode eines Kontos mit echtem Geld in eine `.env`-Datei oder einen Befehl ein.
:::

## Bevor Sie beginnen {#prerequisites}

Sie brauchen die Werkzeuge aus [Bevor Sie beginnen](/build-before-qday/prerequisites) (ein Terminal, Node.js 22 oder neuer und Git) sowie einen Webbrowser. Prüfen Sie Node.js:

```bash
node -v
```

Es sollte `v22` oder höher ausgeben. Teil 1 braucht außerdem **pnpm** und **Foundry**:

```bash
npm install -g pnpm
```

Installiert pnpm, das Paketwerkzeug, das der Vault verwendet. Prüfen Sie es mit `pnpm -v`.

Foundry kompiliert, testet und stellt Solidity bereit. Installieren Sie es von [getfoundry.sh](https://getfoundry.sh): Die Seite nennt einen Befehl für Ihr System, danach führen Sie aus:

```bash
foundryup
```

Lädt die Foundry-Werkzeuge herunter. Prüfen Sie mit `forge --version` und `cast --version`.

Holen Sie sich den Beispielcode:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-2
```

Die erste Zeile lädt die Beispiele in einen Ordner namens `build-before-qday` herunter. Die zweite wechselt in den Ordner `workshop-2`, der die drei Apps enthält.

Für Test-QOR nutzen Sie den [Faucet](/dashboard/faucet) im Dashboard. Alle drei Apps laufen nur im QoreChain-Testnet `qorechain-diana`.

## Teil 1: QDayVault, ein Vault, der einen geleakten Schlüssel übersteht {#part-1}

Code: [workshop-2/01-qday-vault](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/01-qday-vault). Ein normaler Wallet-Schlüssel (der secp256k1-Schlüssel, den MetaMask verwendet) könnte eines Tages von einem Quantencomputer gebrochen werden. Dieser Vault ist so gebaut, dass ein gestohlener Schlüssel dieser Art nicht genügt: Geld verlässt ihn nur, wenn der **Guardian** die Auszahlung mit einem Post-Quanten-Schlüssel signiert, und der Contract prüft diese Signatur selbst, auf der Chain. Jeder darf die signierte Auszahlung einreichen. Entscheidend ist die Signatur, nicht, wer sie sendet.

```bash
cd 01-qday-vault
```

Wechselt in den Vault-Ordner.

### Wie der Contract funktioniert {#vault-how}

Öffnen Sie `src/QDayVault.sol`. Die wichtige Funktion ist `withdraw`:

```solidity
(bool registered,, bytes memory pubkey, bool proven) = PQC_KEYS.pqcKeyStatus(guardian);
if (!registered || pubkey.length == 0) revert GuardianKeyNotRegistered();
if (!proven) revert GuardianKeyNotProven();

uint256 n = nonce;
if (!PQC_VERIFY.pqcVerify(pubkey, mldsaSignature, withdrawalMessage(to, amount, n))) revert BadPqcSignature();

nonce = n + 1;
emit Withdrawn(to, amount, n);
(bool ok,) = to.call{value: amount}("");
if (!ok) revert TransferFailed();
```

1. **Den Schlüssel des Guardians von der Chain lesen.** Der Schlüssel ist 2.592 Bytes groß, deshalb speichert der Contract ihn nicht. Wenn der Guardian den Schlüssel auf der Chain rotiert, folgt der Vault.
2. **Einen nie bewiesenen Schlüssel ablehnen.** „Bewiesen“ heißt, dass das Konto beim Registrieren des Schlüssels einen Besitznachweis signiert hat. Ohne diese Prüfung könnte jemand einen Schlüssel registrieren, der ihm nicht gehört.
3. **Die Signatur über eine exakte Nachricht verifizieren.** Die Nachricht bindet ein festes Tag, die Chain-ID, die Vault-Adresse, den Empfänger, den Betrag und die Nonce. Eine Signatur gilt also für eine Auszahlung, bei einem Vault, auf einer Chain, einmal.
4. **Die Nonce erhöhen, bevor Geld gesendet wird.** Dieselbe Signatur kann nicht zweimal verwendet werden, und der Zustand ändert sich vor dem externen Aufruf, was vor Reentrancy schützt.
5. **Prüfen, ob die Überweisung geklappt hat.** Falls nicht, wird die ganze Transaktion rückgängig gemacht.

### Schritt 1: Die Tests ausführen (kein Konto nötig) {#vault-tests}

```bash
pnpm install
```

Lädt die JavaScript-Pakete aus `package.json` herunter (das QoreChain SDK, viem, tsx).

```bash
pnpm forge-std
```

Lädt `forge-std`, die Standardbibliothek von Foundry, nach `lib/` herunter. Die Tests und das Deploy-Skript importieren sie. Das machen Sie einmal.

```bash
forge test
```

Kompiliert den Contract und führt die 8 Tests in `test/QDayVault.t.sol` aus. Sie sollten `8 passed; 0 failed` sehen. Die lokale Test-Chain hat keine QoreChain-Precompiles, deshalb legen die Tests mit `vm.etch` kleine Platzhalter-Contracts an die beiden Precompile-Adressen. Sie prüfen die Logik: Eine gültige Signatur zahlt aus, eine ungültige wird abgelehnt, eine Signatur gilt nur einmal, ein unbewiesener Schlüssel wird abgelehnt. Die echten Precompiles laufen in den nächsten Schritten.

### Schritt 2: Ein Konto nur für das Testnet erstellen {#vault-account}

```bash
cast wallet new
```

Gibt eine neue Adresse und einen privaten Schlüssel aus. Verwenden Sie es nur für das Testnet.

Unter macOS und Linux:

```bash
cp .env.example .env
```

Unter Windows PowerShell verwenden Sie `Copy-Item .env.example .env`. Das erstellt Ihre eigene Einstellungsdatei. `.env` wird von Git ignoriert und deshalb nie committet. Öffnen Sie `.env` und setzen Sie `PRIVATE_KEY` auf den privaten Schlüssel aus `cast wallet new`.

```bash
pnpm window recovery-code
```

Gibt einen Wiederherstellungscode aus, der mit `QRC1-` beginnt. Aus ihm wird Ihr Post-Quanten-Schlüssel erzeugt. Tragen Sie ihn als `QORE_PQC_RECOVERY_CODE` in `.env` ein und bewahren Sie eine Kopie an einem sicheren Ort auf, getrennt vom privaten Schlüssel. Verwenden Sie immer denselben Code: Ein anderer Code bedeutet einen anderen Post-Quanten-Schlüssel.

### Schritt 3: Das Konto aufladen {#vault-fund}

```bash
pnpm window status
```

Gibt Ihr Konto in zwei Formen aus, `0x...` und `qor1...`. Es ist dasselbe Konto. Fügen Sie die Adresse `qor1...` in den [Faucet](/dashboard/faucet) ein.

### Schritt 4: Ihren Post-Quanten-Schlüssel registrieren, einmalig {#vault-register}

```bash
pnpm window register
```

Hinterlegt Ihren öffentlichen ML-DSA-87-Schlüssel auf der Chain, mit einem Nachweis, dass er Ihnen gehört. Das machen Sie einmal pro Konto. Danach zeigt `pnpm window status` `PQC key: registered`. Das ist die einzige Transaktion, die die Chain nur mit dem klassischen Schlüssel akzeptiert, weil die Chain Ihren Post-Quanten-Schlüssel noch nicht kennt. Was die Registrierung wirklich bindet, lesen Sie unter [Wie Ihr Post-Quanten-Schlüssel an Ihr Konto gebunden wird](/build-before-qday/key-binding).

### Schritt 5: Ein begrenztes EVM-Fenster öffnen {#vault-window}

```bash
pnpm window:scoped
```

Sendet eine mit beiden Schlüsseln signierte Transaktion, die ein EVM-Fenster von **600 Blöcken (etwa 15 Minuten), 3 Transaktionen und 2 QOR** an Wert plus Gebühren öffnet. Das reicht für das Deploy und eine Auszahlung, nicht mehr. Wenn Ihr klassischer Schlüssel bei offenem Fenster geleakt wird, ist der Schaden auf dieses Budget begrenzt; wenn es endet, schließt sich die Lane im Ethereum-Stil wieder.

**Warten Sie etwa 10 Sekunden** vor dem nächsten Schritt. Das Öffnen des Fensters hat eine Nonce Ihres Kontos verbraucht, und der nächste Block muss sie zuerst enthalten.

### Schritt 6: Den Vault bereitstellen {#vault-deploy}

```bash
pnpm deploy:testnet
```

Führt das Foundry-Skript `script/QDayVault.s.sol` aus: Es stellt den Vault mit einer Einzahlung von 1 QOR bereit und macht **Sie** zum Guardian. Suchen Sie in der Ausgabe nach `QDayVault 0x...`. In der Ausgabe von Foundry bedeutet „ETH“ QOR.

```bash
pnpm vault status
```

Zeigt die Vault-Adresse, sein Guthaben (1 QOR), den Guardian (Sie) und die Nonce (0).

### Schritt 7: Der Angriff, als Simulation {#vault-attack}

```bash
pnpm vault attack 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

Spielt einen Angreifer nach, der Ihren klassischen Schlüssel hat, aber nicht Ihren Post-Quanten-Schlüssel. Er signiert die Auszahlung mit einem zufälligen ML-DSA-87-Schlüssel und fragt die Chain, was passieren würde. Sie sollten `BLOCKED by the vault: BadPqcSignature` sehen. Es ist nur eine Simulation, sie kostet also nichts und verbraucht Ihr Fenster nicht. Als Empfänger funktioniert jede Adresse.

### Schritt 8: Die echte Auszahlung {#vault-withdraw}

```bash
pnpm vault withdraw 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

Signiert die Auszahlung mit **Ihrem** ML-DSA-87-Schlüssel (eine Nachricht von 157 Bytes, eine Signatur von 4.627 Bytes) und sendet sie. Der Vault prüft sie mit `pqcVerify` und zahlt aus. Sie sollten `WITHDRAWN tx 0x...` und einen Explorer-Link sehen.

```bash
pnpm window status
```

Zeigt, was vom Fenster übrig ist: 1 Transaktion, genau das Budget, das Sie ihm gegeben haben.

### Wenn etwas schiefgeht {#vault-troubleshooting}

| Was Sie sehen | Was es bedeutet | Was zu tun ist |
| --- | --- | --- |
| `REFUSED: Missing or invalid parameters` beim Deploy oder bei der Auszahlung | Es gibt kein aktives EVM-Fenster: Es ist abgelaufen oder aufgebraucht | Führen Sie `pnpm window status` aus, dann `pnpm window:scoped`, warten Sie 10 Sekunden und versuchen Sie es erneut |
| `does not exist on chain yet` | Das Konto hat noch kein QOR | Nutzen Sie den Faucet (Schritt 3) |
| `PQC key: not registered` | Schritt 4 wurde übersprungen | Führen Sie `pnpm window register` aus |
| `GuardianKeyNotRegistered` | Der Guardian hat keinen ML-DSA-87-Schlüssel auf der Chain | Registrieren Sie ihn (Schritt 4) |
| `No vault yet` | Aus diesem Ordner wurde noch nichts bereitgestellt | Machen Sie Schritt 6, oder setzen Sie `VAULT_ADDRESS` in `.env` |

### Den Contract vor dem Deploy prüfen lassen {#vault-audit}

Der Ordner `audit/` enthält den ersten Entwurf des Contracts mit echten Fehlern und die korrigierte Version. Er zeigt einen zweistufigen Ablauf mit dem [Contract Auditor](/dashboard/contract-auditor) des Dashboards: den Entwurf prüfen lassen, jeden Befund mit einem Test beheben, den endgültigen Contract prüfen lassen und beide Berichte aufbewahren. Ein automatisches Audit ersetzt vor dem Mainnet kein menschliches Audit. Bei Solidity zeigt die Bewertung der Quantenbereitschaft „Not scored“, was zu erwarten ist: Auf der EVM übernimmt die Chain die Post-Quanten-Prüfung über das Precompile. Siehe `audit/README.md` im Ordner und die Seite [EVM-Precompiles](/developer-guide/evm-precompiles) für die Precompile-Adressen und das Gas.

## Teil 2: Ein Rechnungen zahlender Agent mit Limits, die die Chain durchsetzt {#part-2}

Code: [workshop-2/02-pq-agent](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/02-pq-agent). Wenn Sie einem Bot Ihren privaten Schlüssel geben, leben seine Ausgabelimits in seinem eigenen Code. Ein Fehler, eine Prompt Injection oder ein gestohlener Server, und die Limits sind weg. Auf QoreChain leben die Limits **auf der Chain**: Der Agent bekommt einen eigenen Schlüssel, verknüpft mit Ihrem Konto unter Regeln, die die Chain bei jeder Zahlung prüft.

Gehen Sie einen Ordner zurück und in den Agenten:

```bash
cd ../02-pq-agent
```

### Drei Schlüssel, drei Rollen {#agent-keys}

| Schlüssel | Wer ihn hält | Was er kann |
| --- | --- | --- |
| **Owner** | Sie | Ihr Konto, mit beiden Schlüsseln signiert. Hält das Geld, verknüpft den Agenten und schreibt die Regeln |
| **Agent-Schlüssel** | Der Agent | Ein ed25519-Schlüssel. Er kann beantragen, vom Konto des Owners auszugeben, nur innerhalb der Regeln. Er hält kein Geld |
| **Gas-Wallet** | Der Agent | Ein kleines separates Konto, das die Anfragen des Agenten einreicht und die Gebühren zahlt. Es hält nie das Geld des Owners |

Die Regeln in diesem Beispiel: Der Agent darf nur **QOR senden**, höchstens **1 QOR pro Zahlung** und **3 QOR pro Tag**, und die Verknüpfung **läuft nach 24 Stunden ab**. Öffnen Sie `agent.mjs` und sehen Sie sich den Befehl `pay` an: Er enthält keine Limitprüfung. Der Agent versucht einfach zu zahlen. Jedes Limit, das Sie sehen werden, kommt von der Chain.

### Schritt 1: Installieren und die Schlüssel erstellen {#agent-keys-create}

```bash
npm install
```

Lädt die Pakete aus `package.json` herunter: das QoreChain SDK, CosmJS und `@noble/curves` für den ed25519-Schlüssel.

```bash
node agent.mjs init
```

Erstellt den ed25519-Schlüssel des Agenten und seine Gas-Wallet und speichert sie in `~/.config/qday/agent.env`, nur für Sie lesbar. Es gibt die Adresse `qor1...` der Gas-Wallet aus.

```bash
node agent.mjs owner-init
```

Erstellt ein Wegwerf-Owner-Konto für das Testnet und speichert es in `~/.config/qday/owner.env`. Wenn Sie ein Konto verwenden möchten, das Sie schon haben, tragen Sie stattdessen `QORE_MNEMONIC="..."` in diese Datei ein. Schlüssel verlassen nie Ihren Computer, werden nie ausgegeben und gehören nie in ein Repository.

```bash
node agent.mjs whoami
```

Gibt die drei Adressen aus: Owner, Agent-Schlüssel und Gas-Wallet.

### Schritt 2: Den Owner und die Gas-Wallet aufladen {#agent-fund}

Fügen Sie jede Adresse `qor1...` in den [Faucet](/dashboard/faucet) ein. Der Owner braucht einige QOR für die Rechnungen, die Gas-Wallet etwa 3 QOR für Gebühren.

```bash
node agent.mjs balance
```

Prüft, dass beide QOR haben.

### Schritt 3: Die Post-Quanten-Schlüssel registrieren, einmalig {#agent-register}

```bash
node agent.mjs register owner
node agent.mjs register gas
```

Jedes Konto hinterlegt seinen öffentlichen ML-DSA-87-Schlüssel auf der Chain, mit einem Besitznachweis. Ab dann signieren beide jede Transaktion mit zwei Schlüsseln.

### Schritt 4: Den Agenten mit Limits verknüpfen {#agent-link}

```bash
node agent.mjs link 1 3
```

Der Owner sendet **eine** Transaktion, mit beiden Schlüsseln signiert, die den ed25519-Schlüssel des Agenten mit dem Konto des Owners verknüpft (der Agent-Schlüssel signiert einen Nachweis, dass er zustimmt, sodass niemand einen Schlüssel verknüpfen kann, der ihm nicht gehört), ihm eine Berechtigung (`send`) gibt, eine Ausgaberegel schreibt (1 QOR pro Zahlung, 3 QOR pro Tag, nur `uqor`) und ein Ablaufdatum nach 24 Stunden setzt. Mit einer dritten Zahl wählen Sie eine andere Stundenzahl, höchstens 30 Tage. Sie sollten `agent linked` und `hybrid ML-DSA-87: verified` sehen.

```bash
node agent.mjs rules
```

Liest von der Chain zurück, was sie durchsetzt: die Regel, die Berechtigung, das Ablaufdatum und wie viele Zahlungen der Agent gemacht hat. Wie das Verknüpfen funktioniert, lesen Sie unter [Authenticators](/sdk/guides/authenticators).

### Schritt 5: Den Agenten die Rechnungen zahlen lassen {#agent-run}

```bash
node agent.mjs run bills.json
```

Der Agent versucht, die fünf Rechnungen in `bills.json` zu zahlen, insgesamt 8,2 QOR. Für jede signiert er eine Anfrage mit seinem ed25519-Schlüssel, und die Gas-Wallet reicht sie ein. Sie sollten Folgendes sehen:

| Rechnung | Betrag | Ergebnis | Warum |
| --- | --- | --- | --- |
| Server hosting | 0.8 | PAID | |
| Domain renewal | 0.5 | PAID | |
| Invoice from an unknown sender | 5 | REFUSED BY THE CHAIN | Über dem Limit von 1 QOR pro Zahlung |
| API credits | 1 | PAID | |
| Monitoring | 0.9 | REFUSED BY THE CHAIN | Über dem Tageslimit von 3 QOR: 2,3 ausgegeben, 0,7 übrig |

Die Ablehnungen kommen von der Chain, nicht vom Code des Agenten. Ein Detail im Explorer: Eine abgelehnte Zahlung erscheint trotzdem als Transaktion mit Code 0. Die Transaktion selbst wurde in einen Block aufgenommen, aber die Zahlung darin wurde abgelehnt. `agent.mjs` liest das Ergebnis der Zahlung darin, und das gibt er aus.

### Schritt 6: Den Agenten widerrufen {#agent-revoke}

```bash
node agent.mjs revoke
```

Eine Transaktion des Owners schaltet den Agent-Schlüssel ab.

```bash
node agent.mjs pay qor1s90l5nnwfjznf4cdj3p4pf2p7uk32axf8800yu 0.1 "after revoke"
```

Versucht noch eine Zahlung. Sie sollten `REFUSED BY THE CHAIN: linked key is unbound or revoked` sehen. Wird ein Agent also jemals kompromittiert, verlieren Sie höchstens sein Tageslimit, und eine Transaktion stoppt ihn.

Um die Demo erneut auszuführen, verschieben Sie `~/.config/qday/agent.env` an einen anderen Ort (nachdem Sie das QOR der Gas-Wallet herausgezogen haben) und führen Sie `node agent.mjs init` erneut aus.

Alle Befehle: `init`, `owner-init`, `whoami`, `register owner|gas`, `link <perTxQOR> <dailyQOR> [hours]`, `rules`, `pay <to> <QOR> [memo]`, `run <bills.json>`, `revoke`, `balance`. Mit Umgebungsvariablen können Sie `QORE_REST`, `QORE_RPC` (Ihr eigener Node) und `QDAY_DIR` (wo die Schlüsseldateien liegen) ändern.

## Teil 3: Die Chain fragen, mit MCP und qore-cli {#part-3}

Code: [workshop-2/03-mcp](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/03-mcp). MCP (Model Context Protocol) ist ein Standardweg, auf dem Coding-Assistenten und andere KI-Werkzeuge externe Werkzeuge nutzen. Der QoreChain-MCP-Server, `@qorechain/mcp`, gibt ihnen **Lesezugriff** auf die Chain: Blöcke, Transaktionen, Konten, den Zustand des Post-Quanten-Schlüssels eines Kontos, Gebührenschätzungen und Simulationen. Er hat 14 Werkzeuge. Er **signiert nie, hält nie Schlüssel und sendet nie**: Wenn Sie eine Überweisung verlangen, gibt er Ihnen ein unsigniertes Dokument, und Sie signieren es in Ihrer eigenen Wallet.

### Zu Ihrem MCP-Client hinzufügen {#mcp-config}

Jeder MCP-Client funktioniert. Die meisten verwenden eine Konfiguration wie diese:

```json
{
  "mcpServers": {
    "qorechain": {
      "command": "npx",
      "args": ["-y", "@qorechain/mcp"]
    }
  }
}
```

`npx -y` lädt den Server beim ersten Mal herunter und startet ihn. Der Client listet dann seine Werkzeuge auf, zum Beispiel `get_pq_status`, `get_transaction`, `get_address_info`, `read_contract`, `estimate_fee`, `simulate_tx` und `prepare_transfer`.

### Dieselben Fragen im Terminal {#mcp-cli}

`qore-cli` gibt dieselben Antworten ohne KI-Client. Stellen Sie drei Fragen zu dem, was Sie gebaut haben:

```bash
npx -y @qorechain/qore-cli pq status <hash of an agent payment>
```

Wurde die Zahlung des Agenten Post-Quanten-signiert? Erwartet: `tier: pqc`, `verified: true`. Es ist eine native Transaktion, mit beiden Schlüsseln signiert und von der Chain geprüft.

```bash
npx -y @qorechain/qore-cli pq status <hash of the vault withdrawal>
```

Und die Auszahlung aus dem Vault? Erwartet: `tier: classical`, `reason: evm_lane`. Das ist eine ehrliche Antwort: Transaktionen im Ethereum-Stil tragen keine Post-Quanten-Signatur. Sie werden durch das EVM-Fenster geschützt und hier durch den Vault-Contract, der selbst eine ML-DSA-87-Signatur prüft.

```bash
npx -y @qorechain/qore-cli pq status <your 0x or qor1 address>
```

Und das Konto? Erwartet: `registered: true`, `possession_proven: true` und das EVM-Fenster mit dem, was davon übrig ist.

### Ein visueller Client (optional) {#mcp-inspector}

Um die Werkzeuge ohne KI-Assistenten durchzuklicken:

```bash
npx -y @modelcontextprotocol/inspector npx -y @qorechain/mcp
```

Wählen Sie dann **Connect**, **Tools**, **List Tools**, wählen Sie `get_pq_status`, tragen Sie bei `target` eine Adresse oder einen Hash ein und wählen Sie **Run Tool**.

## Was Sie jetzt haben {#done}

Einen Contract, der nur gegen eine Post-Quanten-Signatur auszahlt, einen Agenten, dessen Limits die Chain durchsetzt, und die Werkzeuge, um zu prüfen, wie jede Transaktion geschützt war. Nutzen Sie jedes davon als Grundlage für Ihre Einreichung: Die Stufen und Regeln finden Sie unter [Build Before Q-Day](/build-before-qday/overview).
