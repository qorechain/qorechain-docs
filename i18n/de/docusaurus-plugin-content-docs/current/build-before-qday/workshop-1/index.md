---
slug: /build-before-qday/workshop-1
title: "Workshop 1: Ihre erste hybrid signierte Transaktion"
sidebar_label: "Workshop 1"
sidebar_position: 2
date: 2026-11-12
---

# Workshop 1: Ihre erste hybrid signierte Transaktion

Diese Anleitung führt Sie von einem Rechner, auf dem noch nichts installiert ist, bis zu einer Transaktion, die gleichzeitig mit zwei Schlüsseln signiert und vom QoreChain-Testnet verifiziert wird. Alles läuft in Ihrer eigenen Umgebung, mit einem Wegwerf-Testnet-Konto.

## Was wir bauen {#what-we-built}

Ein vollständiges Solidity-Projekt, das mit einem Befehl per Scaffolding erzeugt, getestet und auf dem QoreChain-Testnet bereitgestellt wird, und danach eine Transaktion, die **gleichzeitig mit zwei Schlüsseln** signiert und von der Chain geprüft wird.

Was es zeigt:

- **Hybride Signierung.** Die Transaktion trägt eine klassische secp256k1-Signatur und eine Post-Quanten-Signatur ML-DSA-87 (NIST FIPS 204).
- **Eine hybrid signierte Transaktion, On-Chain verifiziert.** Die Validatoren prüfen beide Signaturen. Den Nachweis lesen Sie vom öffentlichen REST-Endpunkt (die Erweiterung `PQCHybridSignature` und das Ereignis `pqc_hybrid_verify`) und im Explorer.
- **Das EVM-Autorisierungsfenster.** Eine Ethereum-Transaktion kann keine Post-Quanten-Signatur tragen. Deshalb registrieren Sie auf QoreChain Ihren ML-DSA-87-Schlüssel einmalig und öffnen mit einer hybrid signierten Nachricht ein kurzes Fenster, in dem Ihre normalen EVM-Transaktionen zugelassen werden. Die Idee im Detail steht in [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes).

Genau das verlangt das Level Quantum Pass.

## Voraussetzungen {#prerequisites}

Sie brauchen einen Rechner mit macOS, Linux oder Windows (mit WSL), ein Terminal und einen Webbrowser. Installieren Sie zuerst diese Werkzeuge und prüfen Sie jeweils die Version:

| Werkzeug | Version | Prüfen | Installieren |
| --- | --- | --- | --- |
| Node.js | 22 oder neuer (Hardhat 3 verlangt es) | `node -v` | [nodejs.org](https://nodejs.org) |
| pnpm | 9 oder neuer | `pnpm -v` | `npm install -g pnpm` (oder `corepack enable`) |
| curl | beliebig | `curl --version` | auf macOS und Linux enthalten |
| jq (optional) | beliebig | `jq --version` | [jqlang.org](https://jqlang.org), nur zum Filtern der Ausgabe in Schritt 6 |

Außerdem brauchen Sie ein Konto im QoreChain-Dashboard, um den Faucet zu nutzen (Schritt 4).

Das Netzwerk und die öffentlichen Endpunkte, die in dieser Anleitung verwendet werden:

| Dienst | URL |
| --- | --- |
| Testnet | `qorechain-diana`, EVM-Chain-ID 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM-JSON-RPC | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (auf Testnet umschalten) |
| Faucet | `https://dashboard.qorechain.io/faucet` (Anmeldung erforderlich) |

:::caution Nur Wegwerf-Testnet-Schlüssel
Verwenden Sie Schlüssel, die nur für diese Übung erzeugt wurden und nur Test-QOR enthalten. Tragen Sie niemals den Schlüssel oder Wiederherstellungscode eines Kontos mit echtem Guthaben in `.env` ein, und committen Sie `.env` niemals in git.
:::

## Schritte {#steps}

### Schritt 1: Werkzeuge prüfen {#step-1}

1. Öffnen Sie ein Terminal.
2. Führen Sie die Prüfungen aus der Tabelle oben aus:

```bash
node -v
pnpm -v
```

`node -v` muss `v22` oder höher ausgeben. Falls nicht, installieren Sie ein neueres Node.js, bevor Sie weitermachen.

### Schritt 2: Projekt per Scaffolding erzeugen und Tests ausführen {#step-2}

1. Erzeugen Sie das Projekt in einem neuen Ordner. Der `npx`-Befehl lädt den Scaffolder herunter und braucht deshalb Internetzugang:

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

2. Wechseln Sie in den Ordner und führen Sie die Tests aus. Sie laufen auf einer lokalen simulierten Chain und senden nichts:

```bash
cd qday-demo
pnpm test
```

Sie sollten `Done! Created qday-demo` sehen und danach `2 passing` von den Tests.

3. Sehen Sie sich an, was Sie bekommen haben: `contracts/Counter.sol`, `ignition/modules/Counter.ts`, `scripts/window.ts` (der Helfer für das Autorisierungsfenster) und `hardhat.config.ts` mit dem Netzwerk `qorechainTestnet` (Chain-ID 9800). Mehr zu den Vorlagen: [Scaffolder und CLI](/developer-tools/scaffolders-and-cli) und [Chain Developer Kit](/developer-tools/chain-dev-sdk).

### Schritt 3: Wegwerf-Testnet-Konto erstellen {#step-3}

Das Konto braucht zwei Geheimnisse: einen privaten Schlüssel im Ethereum-Stil und einen **Wiederherstellungscode** (beginnt mit `QRC1`), aus dem der Post-Quanten-Schlüssel ML-DSA-87 abgeleitet wird. Der folgende Befehl erzeugt beides mit Bibliotheken, die das Projekt bereits installiert hat, und schreibt es direkt in eine neue `.env`-Datei. So wird nichts auf Ihrem Bildschirm ausgegeben oder irgendwo eingefügt. Führen Sie ihn im Ordner `qday-demo` aus:

```bash
node --input-type=module -e '
import { generatePrivateKey } from "viem/accounts";
import { generatePqcRecoveryCode } from "@qorechain/sdk";
import { writeFileSync } from "node:fs";
writeFileSync(".env", `PRIVATE_KEY=${generatePrivateKey()}\nQORE_PQC_RECOVERY_CODE=${generatePqcRecoveryCode()}\nQORE_NETWORK=testnet\n`);
console.log(".env written");
'
```

Er gibt `.env written` aus. Hinweise:

- Der Befehl ersetzt die Platzhalter-`.env`, die der Scaffolder angelegt hat. Führen Sie ihn nur einmal aus. Ein neuer Lauf erzeugt ein anderes Konto und einen anderen Post-Quanten-Schlüssel.
- Lassen Sie `.env` unverändert: Derselbe private Schlüssel und derselbe Wiederherstellungscode ergeben jedes Mal dasselbe Konto. Wenn Sie die Datei verlieren, beginnen Sie mit einem neuen Konto von vorn.
- Sie bevorzugen eine Mnemonic? Tragen Sie stattdessen `QORE_MNEMONIC="your twelve words"` in `.env` ein, statt der beiden Zeilen oben. Bei einer Mnemonic stammen beide Schlüssel aus derselben Phrase, und es ist kein Wiederherstellungscode nötig. Verwenden Sie eine Phrase, die nur für diese Übung erzeugt wurde.

Fragen Sie nun das Projekt nach der Adresse Ihres neuen Kontos:

```bash
pnpm window status
```

Sie sollten drei Zeilen sehen:

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

Kopieren Sie die Adresse `qor1...`. Diese geben Sie im Faucet an.

### Schritt 4: Test-QOR vom Faucet holen {#step-4}

1. Öffnen Sie den [Faucet](https://dashboard.qorechain.io/faucet) in Ihrem Browser und melden Sie sich an.
2. Fügen Sie Ihre Adresse `qor1...` ein (oder wählen Sie **Use my address**, falls das Dashboard sie kennt).
3. Wählen Sie **Request Tokens**. Die Karte zeigt **Tokens Sent!** mit 100 QOR, dazu die Test-Token des Fests, und einen Link **View on Explorer**.

Der Faucet zahlt einmal alle 24 Stunden pro Konto und pro Adresse aus. Die genauen Beträge stehen unter [Faucet](/dashboard/faucet). Prüfen Sie zurück im Terminal, ob das Konto jetzt on-chain existiert:

```bash
pnpm window status
```

Die Ausgabe antwortet jetzt, statt mit "does not exist on chain yet" zu scheitern.

### Schritt 5: Schlüssel registrieren, Fenster öffnen, bereitstellen {#step-5}

1. Registrieren Sie Ihren ML-DSA-87-Schlüssel. Das ist ein einmaliger Schritt pro Konto, klassisch signiert, wie es die Chain für die Registrierung verlangt:

```bash
pnpm window register
```

Es gibt `registered: <HASH>` aus.

2. Öffnen Sie das Autorisierungsfenster. Das ist selbst eine **hybrid signierte** Transaktion:

```bash
pnpm window open
```

Es gibt `opened: <HASH>` aus und danach eine Zeile wie `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)`. Notieren Sie sich den Hash bei `opened:`: Sie verifizieren ihn in Schritt 6.

3. Warten Sie etwa 10 Sekunden. Das Fenster hat die Nonce des Kontos erhöht, und Hardhat wartet auf Bestätigungen.
4. Bauen Sie den Contract und stellen Sie ihn bereit:

```bash
pnpm build
pnpm deploy:testnet
```

Antworten Sie auf "Confirm deploy to network qorechainTestnet (9800)?" mit `y`. Sie sollten `CounterModule#Counter - 0x...` sehen.

### Schritt 6: Hybride Signatur On-Chain verifizieren {#step-6}

Die Transaktion `opened:` aus Schritt 5 wurde mit beiden Schlüsseln signiert. Ersetzen Sie `<HASH>` durch diesen Hash und lesen Sie sie vom öffentlichen REST-Endpunkt:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Achten Sie auf:

1. `tx_response.code` gleich `0`.
2. Im Transaktions-Body die Erweiterung `PQCHybridSignature` mit der ML-DSA-87-Signatur: **4.627 Bytes**, neben der 64 Bytes langen secp256k1-Signatur.
3. In `tx_response.events` das Ereignis `pqc_hybrid_verify` mit dem Attribut `status` auf `verified`. Um nur dieses Ereignis auszugeben (braucht `jq`):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> \
  | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Sehen Sie es sich danach im Explorer an:

1. Öffnen Sie [explore.qore.network](https://explore.qore.network).
2. Schalten Sie die Netzwerkauswahl auf **Testnet**.
3. Suchen Sie nach dem Hash. Die Transaktionsseite zeigt die Signatursicherheit als quantensicher, On-Chain verifiziert, mit dem Algorithmus ML-DSA-87 (FIPS 204).

Das ist der Nachweis: Die Validatoren haben beide Signaturen geprüft.

## Was Sie sehen sollten {#what-you-should-see}

| Wo | Was |
| --- | --- |
| Nach Schritt 2 | `Done! Created qday-demo` und `2 passing` |
| Nach Schritt 3 | `.env written`, dann eine Zeile `account:` mit Ihren Adressen `0x...` und `qor1...` |
| Nach Schritt 4 | **Tokens Sent!** im Faucet und ein vorhandenes Konto in `pnpm window status` |
| Nach Schritt 5 | `registered: <HASH>`, `opened: <HASH>`, dann `CounterModule#Counter - 0x...` |
| Nach Schritt 6 | `code` 0, eine 4.627 Bytes lange ML-DSA-87-Signatur und `pqc_hybrid_verify` mit `status` `verified`, in der REST-Ausgabe und im Explorer auf Testnet |

## Verwendete Pakete {#published}

Deklariert in der erzeugten `package.json`:

| Paket | Registry | Version |
| --- | --- | --- |
| `create-qorechain-dapp` | npm | 0.14.0 |
| `@qorechain/sdk` | npm | ^0.14.0 |
| `@qorechain/evm` | npm | ^0.14.0 |
| `@cosmjs/stargate` | npm | ^0.39.0 |
| `hardhat` | npm | ^3.21.1 |
| `viem` | npm | ^2.47.6 |
| `tsx` | npm | ^4.19.0 |
| `typescript` | npm | ^5.6.3 |

Der Scaffolder installiert außerdem die Plugins Hardhat Toolbox, Ignition und Keystore, die in der erzeugten `package.json` stehen.

## Fehlerbehebung {#troubleshooting}

| Was Sie sehen | Warum | Was zu tun ist |
| --- | --- | --- |
| `HHE10402` oder "wait for confirmations" direkt nach dem Öffnen des Fensters | Das Öffnen des Fensters hat die Nonce des Kontos erhöht | Führen Sie `pnpm deploy:testnet` erneut aus |
| "EVM authorisation window exhausted" oder "no window" | Dem Fenster sind Transaktionen oder Blöcke ausgegangen, oder es ist auf einen anderen Contract beschränkt (ein auf einen anderen Contract beschränktes Fenster blockiert eine Bereitstellung) | Führen Sie `pnpm window open` aus, um ein neues Fenster zu öffnen, warten Sie etwa 10 Sekunden und stellen Sie dann erneut bereit |
| "account has no PQC key and classical fallback is disabled" | Das Konto hat keinen ML-DSA-87-Schlüssel registriert | Führen Sie zuerst `pnpm window register` aus, dann öffnen Sie das Fenster |
| "does not exist on chain yet" | Das Konto hat noch kein QOR | Holen Sie QOR vom Faucet (Schritt 4) |
| "Rate Limit Reached" im Faucet, oder nach 30 Sekunden keine Token | Ein Abruf pro 24 Stunden pro Konto und pro Adresse, und Anfragen werden nacheinander bearbeitet | Warten Sie ein paar Sekunden und versuchen Sie es erneut, oder warten Sie das Ende der Sperrzeit ab |
| `pnpm window` bricht mit einer Meldung über einen fehlenden Wiederherstellungscode ab | `.env` enthält `PRIVATE_KEY` ohne `QORE_PQC_RECOVERY_CODE` | Wiederholen Sie Schritt 3 oder verwenden Sie `QORE_MNEMONIC` |
| Hardhat startet nicht | Node.js ist älter als 22 | Installieren Sie Node.js 22 oder neuer und führen Sie `pnpm install` erneut aus |

## Die Beispiel-Apps {#example-apps}

Derselbe Ablauf, aus mehreren Sprachen und mit verschiedenen Frontends. Jede signiert hybrid. Alle liegen im öffentlichen Repository [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), Ordner `workshop-1`. So holen Sie es:

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

Jede App-Seite ist eine eigene vollständige Anleitung vom Anfang bis zum Ende.

| App | Sprache | Seite |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

Die Kits hinter diesen Apps sind unter [Kits](/build-before-qday/workshop-1/kits) aufgeführt. Wenn Sie die QoreX-Wallet mit einer Browser-dApp nutzen möchten, lesen Sie [QoreX](/qorex/overview).
