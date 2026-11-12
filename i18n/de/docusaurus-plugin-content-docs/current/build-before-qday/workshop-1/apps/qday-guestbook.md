---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

Das Q-Day Guestbook ist ein On-Chain-Gästebuch auf dem QoreChain-EVM-Testnet. Jede Adresse kann es einmal mit einer Nachricht von bis zu 140 Zeichen signieren. Es besteht aus zwei Teilen: einem Solidity-Contract mit einem Hardhat-Projekt (`contracts-app/`) und einer React-Webseite (`web/`), die die QoreX-Wallet verbindet, das EVM-Fenster des Kontos anzeigt und die neuesten Einträge live auflistet.

## Was es zeigt {#shows}

- **Eine Browser-dApp, die hybrid signiert, ohne es zu wissen.** Die Seite ist eine gewöhnliche wagmi- und RainbowKit-App. QoreX ergänzt die ML-DSA-87-Hälfte der Signatur, sodass dieselbe Transaktion durch secp256k1 und durch einen Post-Quanten-Schlüssel geschützt ist.
- **Das EVM-Fenster ist in der Oberfläche sichtbar.** Die Seite liest das Fenster des Kontos von der Chain und zeigt, ob es aktiv ist und wie viele Blöcke und Transaktionen übrig sind.
- **Verständliche Ablehnungen.** Wenn die Chain einen Schreibvorgang ablehnt, ordnet `classifyEvmWindowRejection` den Fehler einer von vier Ursachen zu (kein registrierter Schlüssel, kein Fenster, Fenster aufgebraucht, ungültige Parameter), und die Seite zeigt die Lösung.
- **Hybride Signaturen, On-Chain verifiziert.** Jede Signatur, die Sie schreiben, ist eine Transaktion, die die Chain erst akzeptiert hat, nachdem sie beide Signaturen (ML-DSA-87 und secp256k1) geprüft hatte.

## Bevor Sie anfangen {#prerequisites}

Sie brauchen ein Terminal unter macOS, Linux oder Windows mit WSL oder Git Bash und diese Werkzeuge:

| Werkzeug | Benötigte Version | Prüfen mit |
| --- | --- | --- |
| Git | jede aktuelle Version | `git --version` |
| Node.js | 20.12 oder neuer (22 LTS empfohlen) | `node --version` |
| pnpm | 9 oder neuer | `pnpm --version` |

Installieren Sie Node.js von https://nodejs.org. Wenn `pnpm --version` fehlschlägt, installieren Sie pnpm mit `npm install -g pnpm` (oder `corepack enable`) und prüfen Sie erneut.

Außerdem brauchen Sie ein kostenloses Konto im [QoreChain-Dashboard](https://dashboard.qorechain.io) für den Faucet und, für den Browser-Teil, die QoreX-Wallet (die Erweiterung für einen Desktop-Browser oder die App). Siehe [QoreX Integrations](/developer-tools/qorex-integrations) und den [QoreX-Überblick](/qorex/overview). In den Contract-Schritten verwenden Sie nie eine echte Wallet: Sie nutzen ein Wegwerf-Testnet-Konto. Test-QOR hat keinen Wert.

## Schritt für Schritt {#steps}

### 1. Den Code holen {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

Das Projekt hat zwei Ordner, die Sie getrennt einrichten.

### 2. Contracts: installieren und testen {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

Sie sollten `3 passing` für die `QDayGuestbook`-Tests sehen. Sie laufen auf einer lokalen simulierten Chain und brauchen keinen Schlüssel.

### 3. Contracts: die Testnet-Schlüsseldatei erstellen {#step-account}

```sh
cp .env.example .env
```

Die Datei `.env` enthält einen Wegwerf-Schlüssel. Committen Sie sie deshalb nie und verwenden Sie den Schlüssel nirgendwo sonst. Öffnen Sie `.env` in einem beliebigen Editor und tragen Sie zwei Werte ein.

**a. Ein privater Wegwerf-Schlüssel.** Erzeugen Sie einen zufälligen 32-Byte-Schlüssel:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

Kopieren Sie den ausgegebenen Wert `0x...` als `PRIVATE_KEY=0x...` in `.env` und ersetzen Sie damit den Platzhalter aus lauter Nullen.

**b. Ein Post-Quanten-Wiederherstellungscode.** Der ML-DSA-87-Schlüssel des Kontos wird aus einem separaten Wiederherstellungscode abgeleitet. Erzeugen Sie einen:

```sh
pnpm window recovery-code
```

Kopieren Sie die ausgegebene Zeile `QRC1-...` als `QORE_PQC_RECOVERY_CODE=QRC1-...` in `.env`. Verwenden Sie immer denselben Code: Ein neuer Code gibt dem Konto einen anderen ML-DSA-87-Schlüssel.

Lassen Sie `QORE_MNEMONIC` leer und behalten Sie `QORE_NETWORK=testnet`. Ihre `.env` sieht jetzt so aus (Platzhalter dargestellt):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 4. Contracts: das Konto aufladen {#step-faucet}

```sh
pnpm window status
```

Die erste Zeile gibt Ihr Konto als `0x...` und in seiner Form `qor1...` aus. Kopieren Sie die Adresse `qor1...` und dann:

1. Öffnen Sie https://dashboard.qorechain.io/faucet und melden Sie sich an.
2. Fügen Sie die Adresse `qor1...` ein und fordern Sie das QOR an (100 QOR einmal alle 24 Stunden).
3. Warten Sie ein paar Sekunden und führen Sie `pnpm window status` erneut aus.

### 5. Contracts: Schlüssel registrieren, Fenster öffnen, bereitstellen {#step-window}

```sh
pnpm window register        # once: registers your ML-DSA-87 key
pnpm window open            # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                    # opening the window advances the account's nonce
pnpm deploy:testnet         # Hardhat Ignition, answer y when asked to confirm
```

`pnpm deploy:testnet` gibt die Adresse des bereitgestellten `QDayGuestbook` aus (`0x...`). Kopieren Sie sie. Die Registrierung ist die einzige Nachricht, die die Chain klassisch signiert akzeptiert, weil noch kein Schlüssel on-chain ist, gegen den geprüft werden könnte. Das Öffnen des Fensters ist hybrid signiert; behalten Sie den Transaktions-Hash, den es ausgibt.

### 6. Contracts: von der Kommandozeile signieren {#step-cli}

```sh
pnpm sign "Hello from my terminal"   # writes one entry
pnpm sign --read                     # lists the latest entries
```

Jede Adresse kann nur einmal signieren, ein zweites `pnpm sign` vom selben Konto wird daher vom Contract abgelehnt.

### 7. Webseite: installieren und konfigurieren {#step-web}

Öffnen Sie ein zweites Terminal im selben Projektordner (oder gehen Sie mit `cd ..` dorthin zurück) und führen Sie aus:

```sh
cd web
pnpm install
cp .env.example .env
```

Öffnen Sie `web/.env` und tragen Sie die Adresse ein, die Sie in Schritt 5 kopiert haben:

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

Lassen Sie `VITE_WALLETCONNECT_PROJECT_ID` leer: Es wird nur gebraucht, wenn Sie in `src/wagmi.ts` eine WalletConnect-basierte Wallet hinzufügen.

### 8. Webseite: starten {#step-run}

```sh
pnpm dev
```

Öffnen Sie http://localhost:5174 in dem Browser, in dem QoreX installiert ist. Die Seite liest die Chain über den EVM-RPC. Das EVM-Fenster liest sie per REST über den Vite-Proxy `/lcd`, weil der öffentliche REST-Endpunkt keine CORS-Header sendet. Die Liste der Signaturen unten zeigt bereits den Eintrag, den Sie in Schritt 6 geschrieben haben.

### 9. Aus QoreX signieren {#step-sign}

1. Installieren Sie QoreX und schalten Sie es auf das Testnet. Den Wechsel beschreibt [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes#step-testnet).
2. Verwenden Sie in QoreX ein Coin-60-Konto (Ethereum) mit einem registrierten ML-DSA-87-Schlüssel und laden Sie es über den [Faucet](/dashboard/faucet) auf (fügen Sie nach der Anmeldung seine Adresse ein).
3. Wählen Sie auf der Seite **Connect QoreX**, geben Sie eine Nachricht ein und wählen Sie **Sign**. QoreX bietet in seiner Freigabe an, das EVM-Fenster zu öffnen, falls keines offen ist.
4. Bestätigen Sie in QoreX.

### 10. Im Explorer nachschlagen {#step-explorer}

Öffnen Sie https://explore.qore.network und schalten Sie die Netzwerkauswahl auf **Testnet**. Suchen Sie nach dem Transaktions-Hash aus Schritt 6 oder 9, nach dem Hash von `pnpm window open` oder nach der Adresse des `QDayGuestbook`. Die Fenster-Transaktion zeigt eine Post-Quanten-Signatur, die die Chain verifiziert hat.

## Was Sie sehen sollten {#result}

- `pnpm test` in `contracts-app` gibt `3 passing` aus.
- `pnpm window status` gibt `PQC key: registered` und `window: live` mit den verbleibenden Blöcken und Transaktionen aus.
- `pnpm deploy:testnet` gibt die Adresse des `QDayGuestbook` aus (`0x...`).
- `pnpm sign "..."` gibt den Transaktions-Hash und `status: success in block ...` aus.
- Auf der Seite zeigt Schritt 1 Ihr Konto `0x...`, die Chain `qorechain-diana EVM (9800)`, Ihr Guthaben und das EVM-Fenster als `live` mit den verbleibenden Blöcken und Transaktionen.
- Nachdem Sie **Sign** gewählt und in QoreX bestätigt haben, erscheint ein Transaktionslink zum Explorer, danach `success in block ...`.
- Die Liste unten zeigt die Anzahl der Signaturen on-chain und die neuesten Einträge (bis zu 20), neueste zuerst, alle paar Sekunden aktualisiert.
- Ein zweiter Versuch von derselben Adresse zeigt, dass die Adresse bereits signiert hat.

## Der Code {#code}

Der Contract hält die Einträge in einem Array und erlaubt eine Signatur pro Adresse:

```solidity
uint256 public constant MAX_LENGTH = 140;
Entry[] private entries;
mapping(address => bool) public hasSigned;

function sign(string calldata message) external {
    uint256 len = bytes(message).length;
    if (len == 0 || len > MAX_LENGTH) revert BadLength();
    if (hasSigned[msg.sender]) revert AlreadySigned();
    hasSigned[msg.sender] = true;
    entries.push(Entry(msg.sender, uint64(block.timestamp), message));
    emit Signed(entries.length - 1, msg.sender, message);
}

function count() external view returns (uint256) { return entries.length; }

// the newest `limit` entries, newest first
function latest(uint256 limit) external view returns (Entry[] memory out);
```

QoreX ist die erste Wallet in der Connector-Liste (`web/src/wagmi.ts`):

```ts
import { qorechain, qorechainTestnet } from "@qorechain/evm";
import { qorexWallet } from "@qorechain/qorex-rainbowkit";

wallets: [() => qorexWallet({ pollAccountsOnFocus: true }), injectedWallet],
// ...
chains: [qorechainTestnet, qorechain],
```

Die Seite zeigt das Fenster und erklärt Ablehnungen (`web/src/App.tsx`):

```tsx
const w = await evmWindowStatus({ rest: REST, address });   // found, live, remainingBlocks, remainingTxs
const rejection = write.error ? classifyEvmWindowRejection(write.error) : undefined;
// "no-pqc-key" | "no-window" | "exhausted" | "invalid"
```

## Verwendete Pakete {#packages}

Contracts (`contracts-app/`):

| Paket | Version | Verwendet für |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Fenster-Helferskript, hybride Signierung |
| `@qorechain/evm` | ^0.13.0 | Chain-Definitionen, `evmWindowStatus`, `evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | Senden der Fensternachricht |
| `hardhat` | ^3.21.1 | Kompilieren, Testen, Ignition-Bereitstellung |
| `viem` | ^2.47.6 | Ethereum-Client |
| `tsx` | ^4.19.0 | Ausführen der TypeScript-Skripte |
| `typescript` | ^5.6.3 | Typprüfung |

Webseite (`web/`):

| Paket | Version | Verwendet für |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | Chain-Definitionen, `evmWindowStatus`, `classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | QoreX als RainbowKit-Wallet |
| `@rainbow-me/rainbowkit` | ^2.2.11 | Connect-Button |
| `wagmi` | ^2.19.5 | React-Hooks für Lese- und Schreibzugriffe |
| `viem` | ^2.53.1 | Ethereum-Client |
| `@tanstack/react-query` | ^5.59.0 | Datenabruf für Fenster und Chain-Lesezugriffe |
| `react`, `react-dom` | ^18.3.1 | Oberfläche |
| `vite` | ^5.4.0 | Dev-Server |
| `@vitejs/plugin-react` | ^4.3.0 | React-Unterstützung für Vite |
| `typescript` | ^5.6.3 | Typprüfung |

Quelle: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
