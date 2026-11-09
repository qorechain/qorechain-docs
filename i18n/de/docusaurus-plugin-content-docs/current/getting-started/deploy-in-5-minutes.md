---
slug: /getting-started/deploy-in-5-minutes
title: In 5 Minuten auf QoreChain bereitstellen
sidebar_label: In 5 Minuten bereitstellen
sidebar_position: 6
---

# In 5 Minuten auf QoreChain bereitstellen

Diese Seite richtet sich an Solidity-Entwickler, die QoreChain noch nie benutzt haben. Sie behalten Foundry oder Hardhat und Ihren MetaMask-Schlüssel. Das einzig Neue ist ein kurzes **Autorisierungsfenster**: QoreChain schützt jedes Konto mit einem Post-Quanten-Schlüssel, eine Ethereum-Transaktion kann keinen tragen, also öffnen Sie zuerst ein begrenztes Fenster, und Ihre normalen EVM-Transaktionen werden zugelassen, solange es offen ist. Die folgenden Schritte verwenden das **Testnet** (`qorechain-diana`, EVM-Chain-ID 9800), wo nichts echtes Geld kostet.

:::note
Dieser Ablauf wurde im Testnet durchgespielt: Ein Fenster wurde in QoreX geöffnet, anschließend wurde mit Foundry `cast` aus derselben Wiederherstellungsphrase ein Contract erstellt und aufgerufen. `forge create` und Hardhat senden dieselbe Art von EVM-Transaktion, waren aber nicht Teil dieses Durchlaufs. Ein über die Kommandozeile von `qorechaind` geöffnetes Fenster ist ebenfalls bestätigt; siehe [Alternative: die Kommandozeile](#cli).
:::

## Was Sie brauchen {#what-you-need}

- Ein MetaMask-Konto, von dem aus Sie bereitstellen möchten, mit seiner Wiederherstellungsphrase oder seinem privaten Schlüssel.
- [QoreX](/qorex/overview), die QoreChain-Wallet (App oder Browser-Erweiterung).
- Foundry oder Hardhat, bereits installiert.

## 1. Importieren Sie Ihren MetaMask-Schlüssel als Coin-60-Konto in QoreX {#step-import}

QoreX-Konten verwenden standardmäßig Coin-Typ 118. Ein Coin-118-Konto hat einen anderen Schlüssel als MetaMask, daher kann keine MetaMask-Transaktion von ihm stammen, und ein darauf geöffnetes Fenster ist nutzlos. Öffnen Sie in QoreX **Ihre Konten** und tippen Sie auf **Ethereum-Konto hinzufügen (coin 60)**. Seine `0x…`-Adresse ist die, die MetaMask anzeigt, und es ist derselbe Schlüssel wie bei einer `qor1…`-Adresse auf QoreChain. Für das erste Ethereum-Konto einer Phrase ist dies auch die Adresse, die Foundry aus derselben Phrase bei Index 0 ableitet. Das Konto hat eine eigene Adresse; laden Sie es daher auf und wählen Sie es in QoreX aus, bevor Sie mit den nächsten Schritten fortfahren. Siehe [Eine Phrase aus MetaMask oder dem Dashboard wiederherstellen](/qorex/getting-started#restore-dashboard).

## 2. Stellen Sie QoreX auf das Testnet um {#step-testnet}

- **App:** Einstellungen → **Testnet verwenden (Entwickler)**.
- **Browser-Erweiterung:** entsperren, unten siebenmal auf die Versionsnummer tippen und dann **Zum Testnet wechseln (diana)** wählen.

Das Netzwerk-Badge auf Home wechselt zu TESTNET.

## 3. Testnet-QOR erhalten {#step-faucet}

Fordern Sie Testnet-QOR für Ihre `0x…`- oder `qor1…`-Adresse beim [Dashboard-Faucet](/dashboard/faucet) an. Es ist dasselbe Guthaben bei beiden Formen der Adresse.

## 4. Öffnen Sie das EVM-Fenster in QoreX {#step-window}

- **Erweiterung und App:** die Karte mit dem Titel **MetaMask auf QoreChain** (mit einem **0x**-Zeichen) im Haupt-Popup oder auf Home. Sie öffnet den Bildschirm **EVM-Zugriffsfenster**.
- **App:** außerdem Einstellungen → Sicherheit → **EVM-Zugriffsfenster**.

Wenn dieses Konto noch keinen Post-Quanten-Schlüssel hat, registriert QoreX ihn in diesem Schritt für Sie. Die Registrierung kostet 0,09 QOR, einmal pro Konto, und die Fenster-Transaktion zahlt zusätzlich ihre eigene Netzwerkgebühr. Anschließend wählen Sie drei Grenzen:

| Feld | Bereich | QoreX-Standard |
|---|---|---|
| Blöcke (wie lange das Fenster offen bleibt) | 1 bis 17.280 | 300 |
| Max. Transaktionen | 1 bis 1.000 | 5 |
| Ausgabenobergrenze, in QOR | größer als 0 | 1 |

Die Ausgabenobergrenze zählt den Wert jeder Transaktion **plus ihre maximale Gebühr** (Gas-Limit mal Gebührenobergrenze), nicht nur das, was sie überträgt. Ein Contract-Deployment bewegt kein QOR, zählt aber dennoch seine maximale Gebühr: Ein von Hardhat gesendetes Deployment mit 3.000.000 Gas zählt etwa 0,64 QOR.

Für eine Deployment-Sitzung sind die Standardwerte zu klein. Eine vernünftige Wahl sind 3.000 Blöcke (im Testnet etwa eine Stunde), 20 Transaktionen und eine Obergrenze von 10 QOR. Halten Sie sie so klein, wie Ihre Sitzung es erlaubt, und schließen Sie das Fenster, wenn Sie fertig sind.

:::caution Öffnen Sie zuerst das Fenster
Das Öffnen eines Fensters erhöht die Nonce des Kontos. Öffnen Sie es **bevor** Sie bereitstellen: Eine zuvor signierte Transaktion wird mit „nonce too low" abgelehnt.
:::

## 5. Mit Foundry oder Hardhat bereitstellen {#step-deploy}

Verwenden Sie **denselben aufgeladenen Schlüssel** wie beim Coin-60-Konto; QoreX kann nicht als Foundry-Signierer dienen, geben Sie Foundry oder Hardhat also den privaten Schlüssel (oder die Phrase mit `--mnemonic`). Die Netzwerkeinstellungen:

| Einstellung | Wert |
|---|---|
| RPC-URL | `https://evm-testnet.qore.host` |
| Chain-ID | `9800` |
| Währung | QOR, 18 Dezimalstellen |

**Foundry**

```bash
export ETH_RPC_URL=https://evm-testnet.qore.host

forge create src/Counter.sol:Counter --private-key $DEPLOYER_KEY --broadcast
cast send <contract> "increment()" --private-key $DEPLOYER_KEY
cast call <contract> "number()(uint256)"
```

**Hardhat**

```js
// hardhat.config.js
module.exports = {
  solidity: "0.8.24",
  networks: {
    diana: {
      url: "https://evm-testnet.qore.host",
      chainId: 9800,
      accounts: [process.env.DEPLOYER_KEY],
    },
  },
};
```

```bash
DEPLOYER_KEY=0x... npx hardhat run scripts/deploy.js --network diana
```

Jede Transaktion, die Sie senden (Deployment oder Aufruf), verbraucht eine der Transaktionen des Fensters. Lesezugriffe (`cast call`, View-Funktionen, Gasschätzung) brauchen kein Fenster und verbrauchen nichts davon.

## Das Fenster prüfen und mit dem Ablauf umgehen {#check-and-expiry}

Ein Fenster **läuft ab**: Wenn seine Blöcke, seine Transaktionen oder seine Ausgabenobergrenze aufgebraucht sind, lehnt der EVM-Pfad Ihre nächste Transaktion mit `no open EVM authorisation window` oder `EVM authorisation window exhausted` ab. Öffnen Sie in QoreX ein neues; ein neues Fenster ersetzt das alte.

Um seinen Zustand zu sehen, nutzen Sie den Tab **PQ key status** auf [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers) (siehe [Entwickler](/dashboard/developers)) oder die REST-Route:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

`live: true` mit `remaining_blocks`, `remaining_txs` und `remaining_value` (in `uqor`) bedeutet, dass es offen ist.

## Alternative: die Kommandozeile {#cli}

Mit der `qorechaind`-Release-Binärdatei können Sie die Schritte 1 und 4 sowie die Registrierung des Post-Quanten-Schlüssels ohne QoreX durchführen. Die vollständigen Befehle (Schlüsselimport, `tx pqc register-key-v2`, `tx pqc open-evm-window`, `tx pqc cosign`) stehen unter [EVM-Entwicklung](/developer-guide/evm-development) und im Abschnitt [EVM-Autorisierungsfenster](/developer-guide/evm-development#evm-window). Ein auf diese Weise geöffnetes Fenster, gefolgt von einer mit `cast` gesendeten Transaktion, ist im Testnet bestätigt.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

qorechaind tx pqc open-evm-window 3000 20 10qor --from deployer \
  --chain-id $QCHAIN --node $QNODE --gas 400000 --fees 80000uqor --generate-only > window.json
qorechaind tx pqc cosign window.json --from deployer --pqc-key deployer-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Engen Sie ein Deployment-Fenster nicht mit `--native-only` oder `--allowed-targets` ein: Beide lehnen die Contract-Erstellung ab. Sie sind für spätere Sitzungen gedacht, sobald der Contract existiert.

## Was im Testnet anders ist {#diana-notes}

- **CosmWasm** akzeptiert im Testnet nur von der Governance genehmigte Codes, Sie können dort also keinen eigenen Contract hochladen. Solidity ist der offene Weg.
- **SVM** ist nicht verfügbar.
- Das Mainnet funktioniert genauso mit Chain-ID 9801 und `https://evm.qore.host`, aber beginnen Sie im Testnet.

## Häufige Fehler {#errors}

| Meldung | Ursache | Lösung |
|---|---|---|
| `account ... has no registered post-quantum key` | das Konto hat keinen ML-DSA-87-Schlüssel | ein Fenster in QoreX öffnen, das ihn registriert, oder ihn über die Kommandozeile registrieren |
| `no open EVM authorisation window` | kein Fenster, oder es ist abgelaufen | ein Fenster öffnen |
| `EVM authorisation window exhausted` | Transaktionen oder Ausgabenobergrenze aufgebraucht | ein neues Fenster mit größeren Grenzen öffnen |
| `nonce too low` | das Fenster wurde geöffnet, nachdem Sie signiert hatten | zuerst das Fenster öffnen, dann senden |
| `only replay-protected (EIP-155) Ethereum transactions are accepted` | eine ohne Chain-ID signierte Transaktion | `chainId` in Ihrer Netzwerkkonfiguration setzen |

Weiter: [EVM-Entwicklung](/developer-guide/evm-development), [QoreX-Sicherheit und Wiederherstellung](/qorex/security-and-recovery#evm-window), [Entwickler](/dashboard/developers).
