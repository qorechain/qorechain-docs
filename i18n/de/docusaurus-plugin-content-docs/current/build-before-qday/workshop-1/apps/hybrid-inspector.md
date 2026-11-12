---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

Der Hybrid Inspector ist eine kleine React-Seite, die zeigt, wie eine hybride QoreChain-Signatur auf dem Testnet `qorechain-diana` aussieht. Sie verbinden die QoreX-Wallet und senden eine Transaktion, die QoreX sowohl mit secp256k1 als auch mit ML-DSA-87 signiert, und die Seite legt diese Transaktion offen: die klassische Signatur, die Post-Quanten-Signatur und das eigene Urteil der Chain. Sie können auch einen beliebigen Testnet-Transaktions-Hash einfügen.

## Was es zeigt {#what-it-shows}

- **Hybride Signierung mit ML-DSA-87 + secp256k1 von einer Webseite aus.** Die Seite übergibt QoreX mit `qorexSignAndBroadcast` eine kodierte Nachricht. QoreX signiert mit beiden Schlüsseln und sendet.
- **Eine hybrid signierte Transaktion, On-Chain verifiziert.** Die Seite liest das Ereignis `pqc_hybrid_verify` der Chain für die Transaktion. Dieses Ereignis ist die Aussage der Chain, dass sie die Post-Quanten-Signatur geprüft hat.
- **Die Größen sind sichtbar.** Die klassische Signatur ist 64 Bytes lang. Die ML-DSA-87-Signatur (FIPS 204) ist 4.627 Bytes lang und reist in der Erweiterung `PQCHybridSignature` der Transaktion.

## Schritt für Schritt {#steps}

### 1. Die Werkzeuge installieren

Sie brauchen einen Chromium-basierten Browser (Chrome, Edge, Brave), Git, Node.js 20 oder neuer und pnpm.

- Git: https://git-scm.com/downloads
- Node.js 20+: https://nodejs.org (die LTS-Version genügt)
- pnpm: `npm install -g pnpm`

Prüfen Sie die Versionen:

```sh
git --version
node --version     # v20.0.0 or higher
pnpm --version     # 9 or higher
```

### 2. Die QoreX-Browsererweiterung installieren

Installieren Sie QoreX aus dem Store Ihres Browsers. Details finden Sie unter [QoreX Integrations](/developer-tools/qorex-integrations) und im [dApp-Browser](/qorex/dapp-browser).

### 3. Ein Wegwerf-Testnet-Konto in QoreX erstellen

Dieser Workshop braucht nie Ihre echte Wallet. Erstellen Sie in QoreX ein **neues** Konto (ein neues Profil oder eine neue Wallet), das nur für diese Übung dient, und schalten Sie es auf das Testnet `qorechain-diana`. Den Testnet-Wechsel beschreibt [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes#step-testnet). QoreX zeigt beim Erstellen des Kontos eine Wiederherstellungsphrase: Schreiben Sie sie auf Papier auf, halten Sie sie privat und verwenden Sie sie nie im Mainnet. Das Konto hat über diese Übung hinaus keinen Wert.

Kopieren Sie die Kontoadresse (sie beginnt mit `qor1...`).

### 4. Test-QOR vom Faucet holen

1. Öffnen Sie https://dashboard.qorechain.io/faucet und melden Sie sich an.
2. Fügen Sie Ihre Adresse `qor1...` ein und fordern Sie an. Ein Abruf zahlt 100 QOR aus, einmal alle 24 Stunden pro Konto.

### 5. Den Code holen

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

### 6. Abhängigkeiten installieren

```sh
pnpm install
```

### 7. Prüfen, ob es baut

```sh
pnpm build
```

Der Befehl prüft die Typen des Projekts und baut es. Er endet mit `built in` und einer Zeitangabe.

### 8. Die Seite starten

```sh
pnpm dev
```

Öffnen Sie http://localhost:5173 in dem Browser, in dem QoreX installiert ist. Hängen Sie `?tx=<HASH>` an die Adresse an (`http://localhost:5173?tx=<HASH>`), um eine Transaktion direkt zu untersuchen. Ist Port 5173 belegt, gibt Vite stattdessen den verwendeten Port aus.

Die REST-Aufrufe laufen über den Vite-Proxy `/lcd` zu `https://api-testnet.qore.host`, weil der öffentliche REST-Endpunkt keine CORS-Header sendet. Die Seite funktioniert nur auf dem Testnet, und eine `.env`-Datei ist nicht nötig.

### 9. Verbinden, senden und verifizieren

1. Klicken Sie auf **Connect QoreX**. Die Seite zeigt Ihre Adresse (`qor1...`), Ihr Testnet-Guthaben und ob ein ML-DSA-87-Schlüssel registriert ist. QoreX registriert den Schlüssel beim ersten Senden.
2. **Senden** Sie einen kleinen Betrag QOR mit einem Memo. QoreX zeigt, was Sie signieren, und bittet um Bestätigung.
3. Die Seite untersucht die Transaktion automatisch. Sie können auch einen beliebigen 64-stelligen Testnet-Transaktions-Hash einfügen.

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

Den Nachweis von der Chain lesen:

```ts
const res = await fetch(`/lcd/cosmos/tx/v1beta1/txs/${hash}`).then((r) => r.json());
const tx = res.tx;
const ext = [...(tx.body.extension_options ?? []), ...(tx.body.non_critical_extension_options ?? [])];
const hyb = ext.find((x) => String(x["@type"]).includes("PQCHybridSignature"));
const verify = (res.tx_response.events ?? []).filter((e) => e.type === "pqc_hybrid_verify");
// classical signature: atob(tx.signatures[0]).length  -> 64
// ML-DSA-87 signature: atob(hyb.pqc_signature).length -> 4627
```

`msgSendBytes` ist ein kleiner Protobuf-Encoder in `src/App.tsx` für die Bank-Nachricht `MsgSend`, weil QoreX die kodierte Nachricht entgegennimmt. Die Seite markiert eine Transaktion als hybrid verifiziert, wenn ihr Code 0 ist, ein Ereignis `pqc_hybrid_verify` den Status `verified` hat und die Post-Quanten-Signatur 4.627 Bytes lang ist.

## Was Sie sehen sollten {#result}

- Der Kopfbereich zeigt `qorechain-diana (testnet)` und eine Blockhöhe, die weiter steigt.
- Nach dem Verbinden: Ihre Adresse, Ihr Guthaben und der Schlüsselstatus.
- Nach dem Senden: der Transaktions-Hash und der Ergebniscode, dann die Untersuchungskarte mit dem Memo, dem Nachrichtentyp, der 64 Bytes langen klassischen Signatur, der 4.627 Bytes langen ML-DSA-87-Signatur mit ihren ersten Bytes in Hex, dem Algorithmusnamen `ML-DSA-87 (FIPS 204)` und dem Urteil `pqc_hybrid_verify`.
- Im Explorer: Öffnen Sie https://explore.qore.network, schalten Sie auf **Testnet** und suchen Sie nach Ihrem Transaktions-Hash.

## Verwendete Pakete {#packages}

| Paket | Version | Verwendet für |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0 (fixiert) | `getQorexNative`, `qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | Als Abhängigkeit aufgeführt; die Seite selbst nutzt einfache REST-Aufrufe |
| `react`, `react-dom` | ^18.3.1 | Oberfläche |
| `@vitejs/plugin-react` | ^4.3.0 | Vite-React-Plugin |
| `vite` | ^5.4.0 | Dev-Server und Build |
| `typescript` | ^5.6.3 | Typprüfung |

## Quellcode {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
