---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

Der Hybrid Inspector ist eine kleine Webseite (gebaut mit React), die zeigt, wie eine hybride QoreChain-Signatur im Testnet `qorechain-diana` aussieht. Sie verbinden die QoreX-Wallet und senden eine Transaktion, die QoreX sowohl mit secp256k1 als auch mit ML-DSA-87 signiert. Die Seite legt diese Transaktion dann offen: die klassische Signatur, die Post-Quanten-Signatur und das eigene Urteil der Chain. Sie können auch jeden beliebigen Testnet-Transaktions-Hash einfügen.

**Wie lange das dauert:** etwa 20 Minuten, einschließlich der Installationen. Danach läuft die Seite in Sekunden.

## Was sie zeigt {#what-it-shows}

- **Hybride Signierung mit ML-DSA-87 + secp256k1 aus einer Webseite.** Die Seite übergibt mit `qorexSignAndBroadcast` eine kodierte Nachricht an QoreX. QoreX signiert mit beiden Schlüsseln und sendet die Transaktion.
- **Eine hybrid signierte Transaktion, on-chain verifiziert.** Die Seite liest das Ereignis `pqc_hybrid_verify` der Chain für die Transaktion. Dieses Ereignis ist die Aussage der Chain, dass sie die Post-Quanten-Signatur geprüft hat.
- **Die Größen sind sichtbar.** Die klassische Signatur ist 64 Bytes groß. Die ML-DSA-87-Signatur (FIPS 204) ist 4.627 Bytes groß und reist in der Erweiterung `PQCHybridSignature` der Transaktion mit.

## Schritt für Schritt {#steps}

Sie arbeiten in Ihrem eigenen Terminal und in Ihrem Browser. Verwenden Sie ausschließlich ein Wegwerf-Konto im Testnet. Testnet-QOR hat keinen Wert. Verwenden Sie hier niemals eine echte Wallet oder echtes Geld.

### 1. Bevor Sie beginnen: die Werkzeuge installieren {#install}

Sie brauchen vier Dinge: einen Chromium-basierten Browser (Chrome, Edge oder Brave), **Git** (lädt den Code herunter), **Node.js** (führt die Werkzeuge der Seite aus) und **pnpm** (installiert die Bibliotheken der Seite). Verwenden Sie Node.js 22 oder neuer. Die Seite selbst läuft auch ab Node.js 20, aber 22 ist die sichere Wahl für jede App des Workshops.

**macOS**

| Werkzeug | So installieren Sie es | Prüfen |
| --- | --- | --- |
| Git | `xcode-select --install` (oder `brew install git`) | `git --version` |
| Node.js 22+ | Laden Sie den LTS-Installer von https://nodejs.org herunter, oder führen Sie `brew install node` aus | `node --version` (muss v22 oder höher anzeigen) |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Windows** (verwenden Sie PowerShell)

| Werkzeug | So installieren Sie es | Prüfen |
| --- | --- | --- |
| Git | Download von https://git-scm.com/download/win | `git --version` |
| Node.js 22+ | Laden Sie den LTS-Installer von https://nodejs.org herunter (oder `winget install OpenJS.NodeJS.LTS`) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Linux (Debian oder Ubuntu)**

| Werkzeug | So installieren Sie es | Prüfen |
| --- | --- | --- |
| Git | `sudo apt update && sudo apt install -y git curl` | `git --version` |
| Node.js 22+ | Folgen Sie https://nodejs.org/en/download (wählen Sie Linux, dann die LTS-Version) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Stolperstein:** Node.js, das mit Homebrew installiert wurde, enthält pnpm nicht. Wenn Sie `pnpm: command not found` sehen, führen Sie `npm install -g pnpm` aus und öffnen Sie dann ein neues Terminal.

**Was Sie sehen sollten:** Jeder Prüfbefehl gibt eine Versionsnummer aus. `node --version` beginnt mit `v22` oder höher.

### 2. Bevor Sie beginnen: QoreX im Testnet {#qorex}

QoreX ist die offizielle QoreChain-Wallet. Diese Seite braucht die **QoreX-Browser-Erweiterung** in dem Browser, in dem Sie die Seite öffnen. Installieren Sie sie aus dem Store Ihres Browsers. Siehe [QoreX Integrations](/developer-tools/qorex-integrations) und den [dApp-Browser](/qorex/dapp-browser).

Verwenden Sie ein **neues Wegwerf-Konto**, das nur für diese Übung angelegt wird. QoreX zeigt beim Anlegen des Kontos eine Wiederherstellungsphrase an. Schreiben Sie sie auf Papier, halten Sie sie privat und verwenden Sie sie niemals im Mainnet wieder.

Schalten Sie QoreX auf das Testnet um:

- **Browser-Erweiterung:** Entsperren Sie sie, tippen Sie unten 7 Mal auf die Versionsnummer und wählen Sie dann **Switch to testnet (diana)**.
- **QoreX-App:** Öffnen Sie die Einstellungen und aktivieren Sie **Use testnet (developers)**. (Die Seite läuft in einem Desktop-Browser, deshalb verwenden Sie für dieses Tutorial die Erweiterung.)

Mehr zum Umschalten auf das Testnet finden Sie unter [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes#step-testnet). Kopieren Sie Ihre Kontoadresse (sie beginnt mit `qor1...`).

Sie brauchen für diese Seite kein Ethereum-Konto (Coin 60), denn sie sendet eine Zahlung im Format QoreChain Native.

### 3. Testnet-QOR vom Faucet holen {#faucet}

Der Faucet ist eine Webseite, die kostenlose Testnet-QOR an eine Adresse sendet.

1. Öffnen Sie https://dashboard.qorechain.io/faucet und melden Sie sich an.
2. Fügen Sie Ihre `qor1...`-Adresse ein und fordern Sie an. Der Faucet zahlt **100 QOR pro 24 Stunden und Konto**.

**Beträge:** Die Einheit, die Sie lesen, ist **QOR**. Die Chain rechnet in **uqor**, der kleinsten Einheit. 1 QOR = 1.000.000 uqor. Die Seite fragt nach QOR und rechnet für Sie um.

**Gut zu wissen:** Die allererste Transaktion eines neuen Kontos registriert dessen Post-Quanten-Schlüssel ML-DSA-87 on-chain. Das ist eine einmalige Gebühr von etwa 0,09 QOR. QoreX erledigt das bei Ihrer ersten Zahlung für Sie.

### 4. Den Code holen {#get-code}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

| Teil | Bedeutung |
| --- | --- |
| `git clone <address>` | Lädt eine vollständige Kopie der Beispiel-Apps von GitHub in einen neuen Ordner namens `build-before-qday`. |
| `cd <folder>` | Wechselt Ihr Terminal in den Ordner des Hybrid Inspector. Alle weiteren Befehle laufen von hier aus. |

**Was Sie sehen sollten:** `Cloning into 'build-before-qday'...`. Führen Sie zur Kontrolle `ls` aus: Sie sehen `package.json`, `src`, `index.html` und `vite.config.ts`.

### 5. Die Bibliotheken installieren {#install-libs}

```sh
pnpm install
```

**Was es tut:** `pnpm` lädt die Bibliotheken herunter, die die Seite braucht (aufgelistet in `package.json`), in einen Ordner namens `node_modules`. Sie führen das einmal pro Projekt aus.

| Teil | Bedeutung |
| --- | --- |
| `pnpm` | Das Werkzeug, das Bibliotheken installiert. |
| `install` | `package.json` lesen und alles installieren, was dort steht, in den Versionen aus `pnpm-lock.yaml`. |

**Wie lange:** unter einer Minute.

**Was Sie sehen sollten:** einen Fortschrittsbalken und dann `Done in` und eine Zeitangabe.

### 6. Prüfen, ob es baut {#build}

```sh
pnpm build
```

**Was es tut:** führt das Skript namens `build` aus `package.json` aus. Dieses Skript lautet `tsc --noEmit && vite build`.

| Teil | Bedeutung |
| --- | --- |
| `pnpm build` | Das `build`-Skript des Projekts ausführen. |
| `tsc --noEmit` | Der TypeScript-Prüfer. Er sucht Fehler im Code und schreibt keine Dateien. |
| `vite build` | Vite packt die Seite in eine kleine Webseite im Ordner `dist`. |

**Was Sie sehen sollten:** `transforming...`, dann Zeilen wie `dist/index.html` und schließlich `built in` mit einer Zeitangabe (deutlich unter einer Sekunde).

### 7. Die Seite starten {#run}

```sh
pnpm dev
```

**Was es tut:** führt das Skript `dev` aus, das auf Ihrem eigenen Computer einen kleinen Webserver startet, damit Sie die Seite im Browser benutzen können. Lassen Sie dieses Terminal während der Arbeit offen. Mit Strg+C beenden Sie ihn.

**Was Sie sehen sollten:**

```text
  VITE v5.4.21  ready in 111 ms

  ➜  Local:   http://localhost:5173/
```

Öffnen Sie http://localhost:5173 in dem Browser, in dem QoreX installiert ist. Ist Port 5173 belegt, gibt Vite den anderen Port aus. Verwenden Sie die Adresse, die er ausgibt.

Um eine Transaktion direkt zu prüfen, hängen Sie `?tx=<HASH>` an die Adresse an: `http://localhost:5173?tx=<HASH>`.

**Warum die Seite `/lcd` aufruft:** Der öffentliche Testnet-REST-Dienst sendet keine CORS-Header, sodass eine Browser-Seite ihn nicht direkt aufrufen kann. Der Dev-Server leitet jeden Aufruf von `/lcd` an `https://api-testnet.qore.host` weiter. Die Seite funktioniert nur im Testnet, und es wird keine `.env`-Datei benötigt.

### 8. Verbinden, senden und verifizieren {#connect-send}

1. **Verbinden.** Klicken Sie auf **Connect QoreX**. QoreX fragt, ob Sie der Seite den Zugriff erlauben. Bestätigen Sie. Die Seite zeigt Ihre Adresse (`qor1...`), Ihr Testnet-Guthaben und an, ob ein ML-DSA-87-Schlüssel registriert ist. Bis zu Ihrer ersten Zahlung steht dort "not registered yet".
2. **Das Sendeformular ausfüllen.**

| Feld | Bedeutung |
| --- | --- |
| To | Die Empfängeradresse (`qor1...`). Sie ist standardmäßig mit Ihrer eigenen Adresse gefüllt, das ist in Ordnung. |
| Amount (QOR) | Wie viel gesendet wird, in QOR. `1` bedeutet 1 QOR = 1.000.000 uqor. |
| Memo | Ein kurzer Text, der an die Transaktion angehängt und on-chain gespeichert wird. Jeder kann ihn lesen, schreiben Sie also nichts Privates hinein. |

3. **Senden.** Klicken Sie auf **Sign with QoreX and send**. QoreX zeigt, was Sie signieren, und bittet um Bestätigung. Bestätigen Sie. Warten Sie auf den Block (einige Sekunden).
4. **Prüfen.** Die Seite prüft die Transaktion automatisch. Sie können in Schritt 3 der Seite auch einen beliebigen 64-stelligen Testnet-Transaktions-Hash einfügen und auf **Inspect** klicken.

**Was Sie sehen sollten:** eine Zeile `QoreX: code 0, shield ..., tx <hash>`, dann die Prüfkarte, die unten unter "Was Sie sehen sollten" beschrieben ist. Kopieren Sie den Transaktions-Hash.

### 9. Auf zweitem Weg verifizieren, ohne die Seite {#verify-curl}

Sie können die Chain direkt fragen. Dafür brauchen Sie nur `curl`, das macOS und die meisten Linux-Systeme mitbringen. In Windows PowerShell verwenden Sie `curl.exe`. Das Werkzeug `jq` ist optional und macht die Antwort besser lesbar (`brew install jq` unter macOS, `sudo apt install -y jq` unter Linux, `winget install jqlang.jq` unter Windows).

```sh
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| Teil | Bedeutung |
| --- | --- |
| `curl -s <address>` | Lädt die Antwort vom Testnet-REST-Dienst herunter. `-s` blendet den Fortschrittsbalken aus. |
| `<HASH>` | Ihr Transaktions-Hash aus Schritt 8. |
| `\| jq '...'` | Greift drei Werte heraus. Ohne `jq` lassen Sie diesen Teil weg und lesen den vollständigen Text. |

**Was Sie sehen sollten:**

- `code` ist `0`: Die Transaktion war erfolgreich.
- Eine `PQCHybridSignature`-Erweiterung (Typ `/qorechain.pqc.v1.PQCHybridSignature`) mit einer `pqc_signature`. Ihr Base64-Text ist 6.172 Zeichen lang, das sind 4.627 Bytes ML-DSA-87-Signatur.
- In `tx_response.events` ein Ereignis vom Typ `pqc_hybrid_verify` mit dem Attribut `status` auf `verified`.

**Im Explorer:** Öffnen Sie https://explore.qore.network, schalten Sie ihn auf **Testnet** und suchen Sie nach Ihrem Transaktions-Hash.

## Fehlerbehebung {#troubleshooting}

| Was Sie sehen | Warum | Was zu tun ist |
| --- | --- | --- |
| `pnpm: command not found` | pnpm ist nicht installiert. Node.js von Homebrew enthält es nicht. | Führen Sie `npm install -g pnpm` aus und öffnen Sie dann ein neues Terminal. |
| `node --version` zeigt v18 oder niedriger | Node.js ist zu alt. | Installieren Sie Node.js 22 oder neuer (Schritt 1). |
| Die Seite meldet `QoreX was not found in this page. Install the QoreX extension, switch it to testnet, and reload.` | Die Erweiterung fehlt, ist gesperrt, oder der Browser ist nicht Chromium-basiert. | Installieren und entsperren Sie QoreX in Chrome, Edge oder Brave. Schalten Sie auf Testnet um und laden Sie die Seite neu. |
| Der Faucet meldet ein Ratenlimit | Eine Anfrage pro 24 Stunden und Konto. | Warten Sie 24 Stunden oder verwenden Sie ein zweites Wegwerf-Konto. |
| `account has no PQC key and classical fallback is disabled` | Der Post-Quanten-Schlüssel ist noch nicht registriert. | Senden Sie einmal aus QoreX (es registriert den Schlüssel bei Ihrer ersten Zahlung, etwa 0,09 QOR). Stellen Sie sicher, dass Sie zuerst QOR vom Faucet haben. |
| `EVM authorisation window exhausted` | Gehört zur Hardhat-App, nicht zu dieser Seite. | Öffnen Sie in jener App mit `pnpm window open` ein neues Fenster. |
| `HHE10402`, nachdem das Fenster geöffnet wurde | Gehört zur Hardhat-App. Das Fenster braucht ein paar Sekunden. | Führen Sie das Deploy erneut aus. |
| CORS-Fehler in der Browser-Konsole | Die Seite hat den REST-Dienst direkt aufgerufen. | Verwenden Sie den `/lcd`-Proxy des Dev-Servers (`pnpm dev`) und öffnen Sie die Seite unter `http://localhost:5173`. Öffnen Sie `dist/index.html` nicht als Datei. |
| `Enter an amount in QOR, for example 1.` | Der Betrag ist leer, null oder keine Zahl. | Geben Sie eine Zahl wie `1` ein. |
| `A transaction hash is 64 hex characters.` | Der eingefügte Hash ist falsch oder abgeschnitten. | Fügen Sie alle 64 Zeichen ein. |
| `Transaction not found on qorechain-diana` | Der Hash stammt aus einem anderen Netzwerk, oder der Block ist noch nicht final. | Warten Sie 10 Sekunden und versuchen Sie es erneut. Prüfen Sie, ob QoreX auf dem Testnet steht. |
| Port 5173 ist bereits belegt | Ein anderes Programm verwendet ihn. | Vite wählt den nächsten Port und gibt ihn aus. Öffnen Sie diese Adresse. |

## Der Code {#code}

Verbinden und Senden:

```ts
import { getQorexNative, qorexSignAndBroadcast } from "@qorechain/qorex-types";

const native = getQorexNative();
await native.enable("qorechain-diana");
const key = await native.getKey("qorechain-diana");      // key.bech32Address

const r = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes(from, to, uqor) }],
  memo,
});                                                       // r.txHash, r.code, r.shield
```

Den Nachweis aus der Chain lesen:

```ts
const res = await fetch(`/lcd/cosmos/tx/v1beta1/txs/${hash}`).then((r) => r.json());
const tx = res.tx;
const ext = [...(tx.body.extension_options ?? []), ...(tx.body.non_critical_extension_options ?? [])];
const hyb = ext.find((x) => String(x["@type"]).includes("PQCHybridSignature"));
const verify = (res.tx_response.events ?? []).filter((e) => e.type === "pqc_hybrid_verify");
// classical signature: atob(tx.signatures[0]).length  -> 64
// ML-DSA-87 signature: atob(hyb.pqc_signature).length -> 4627
```

`msgSendBytes` ist ein kleiner Protobuf-Encoder in `src/App.tsx` für die Bank-Nachricht `MsgSend`, weil QoreX die kodierte Nachricht entgegennimmt. Die Seite markiert eine Transaktion als hybrid verifiziert, wenn ihr Code 0 ist, ein Ereignis `pqc_hybrid_verify` den Status `verified` hat und die Post-Quanten-Signatur 4.627 Bytes groß ist.

## Was Sie sehen sollten {#result}

- Die Kopfzeile zeigt `qorechain-diana (testnet)` und eine Blockhöhe, die stetig steigt.
- Nach dem Verbinden: Ihre Adresse, Ihr Guthaben und der Status des Schlüssels.
- Nach dem Senden: der Transaktions-Hash und der Ergebniscode, dann die Prüfkarte mit dem Memo, dem Nachrichtentyp, der 64 Bytes großen klassischen Signatur, der 4.627 Bytes großen ML-DSA-87-Signatur mit ihren ersten Bytes in Hex, dem Algorithmusnamen `ML-DSA-87 (FIPS 204)` und dem Urteil `pqc_hybrid_verify`.
- Im Explorer: Öffnen Sie https://explore.qore.network, schalten Sie ihn auf **Testnet** und suchen Sie nach Ihrem Transaktions-Hash.

## Verwendete Pakete {#packages}

| Paket | Version | Verwendet für |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0 (gepinnt) | `getQorexNative`, `qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | Als Abhängigkeit aufgeführt; die Seite selbst verwendet einfache REST-Aufrufe |
| `react`, `react-dom` | ^18.3.1 | Oberfläche |
| `@vitejs/plugin-react` | ^4.3.0 | Vite-React-Plugin |
| `vite` | ^5.4.0 | Dev-Server und Build |
| `typescript` | ^5.6.3 | Typprüfung |

## Quellcode {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
