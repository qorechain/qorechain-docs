---
slug: /qorex/browser-extension
title: QoreX Browser-Erweiterung
sidebar_label: Browser-Erweiterung
sidebar_position: 2
---

# QoreX Browser-Erweiterung

Die QoreX **Browser-Erweiterung** ist die Desktop-QoreChain-Wallet. Sie ist eine **eigenständige Wallet** — erstellen oder importieren Sie eine Wallet, halten und senden Sie QOR und verbinden Sie sich mit dApps — und sie ist der Baustein, der jeder Website ermöglicht, QoreX zu erkennen und jede Anfrage in eine explizite, entschlüsselte Freigabe zu verwandeln.

Sie ist **live und öffentlich** in drei Stores verfügbar.

## Installation {#install}

| Browser | Installation |
|---|---|
| **Chrome und Chromium-Browser** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 oder neuer)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

Der aktuelle öffentliche Build ist **0.1.3**. Version **0.1.5** wird gerade ausgerollt; sie fügt die [Dashboard-Verbindungsbrücke](#dashboard-bridge) hinzu. Die Berechtigungsfläche bleibt über diese Versionen hinweg unverändert.

:::note
Unter Safari öffnen sich Freigaben in einem Browser-Tab statt in einem Popup-Fenster — die Erweiterung wird mit Apples Safari-Web-Extension-Wrapper aus derselben Codebasis paketiert.
:::

## Wallet erstellen oder wiederherstellen {#wallet}

Öffnen Sie das Popup und wählen Sie:

- **Wallet erstellen** — generiert eine frische 24-Wörter-Wiederherstellungsphrase auf Ihrem Gerät (256-Bit-Entropie), leitet Ihre QoreChain-Identität ab und versiegelt sie im Tresor unter einem Passwort (und optional einem Passkey — siehe [Sicherheit](#security)).
- **Wallet importieren** — Wiederherstellung aus einer bestehenden 24-Wörter-Phrase.

Die Erweiterung hält ihre eigenen Schlüssel; sie benötigt die mobile App nicht. Sie können Ihre Mnemonik auch aus dem Popup exportieren. Schlüssel verlassen das Gerät niemals.

## Unterstützte Wallet-Standards {#standards}

QoreX stellt drei Schnittstellen bereit, alle auf der Seite als `window.qorex` (`{ evm, native, svm }`) injiziert und über die Erkennungsverträge von [`@qorechain/connect`](/sdk/overview) auffindbar.

| Standard | Was es ist | Was es für Sie als Entwickler bedeutet |
|---|---|---|
| **EIP-1193** | Die JavaScript-API des Ethereum-Providers (`request(...)`, Events). | Ihr bestehender ethers.js- / viem- / web3.js-Code spricht unverändert mit der EVM-Spur von QoreX; numerische Fehlercodes (z. B. `4902`) werden wortgetreu weitergeleitet. |
| **EIP-6963** | Multi-Wallet-Provider-Erkennung (Announce-/Request-Events). | QoreX kündigt sich neben jeder anderen Wallet an — es **überschreibt niemals `window.ethereum`** — sodass der Nutzer QoreX pro Website ohne Konflikte auswählt. |
| **Keplr-Muster `signDirect`** | Ein im Stil eines Cosmos-`OfflineDirectSigner` gestalteter Provider auf `window.qorex.native`. | dApps im Cosmos-Stil signieren QoreChain-**Native-Spur**-Transaktionen genauso, wie sie es mit Keplr täten; die Post-Quanten-Schicht wird vorab angewendet (siehe [Post-Quanten-Signierung](#pqc)). |

:::note SVM (Solana-kompatibel)
Ein SVM-Provider wird auf `window.qorex.svm` mit `connect` / `signAndSendTransaction` / `signMessage` bereitgestellt. QoreX registriert sich **noch nicht** über das Solana-**Wallet-Standard**-Erkennungsprotokoll, sodass Solana-dApps, die auf die Wallet-Standard-Auto-Erkennung angewiesen sind, QoreX nicht automatisch erkennen — erreichen Sie es vorerst direkt über `window.qorex.svm`.
:::

## Sicherheit & Berechtigungen {#security}

QoreX ist so gebaut, dass es überprüfbar und nicht nur vertrauenswürdig ist:

- **Tresor** — Ihre Schlüssel werden mit **AES-256-GCM** versiegelt. Der Passwort-Pfad leitet seinen Schlüssel mit **Argon2id** ab (RFC 9106, speicherhart: 64 MiB, t=3, p=1), sodass ein entwendeter Tresor-Blob GPU/ASIC-Cracking widersteht. (Alte PBKDF2-Blobs bleiben öffenbar und werden beim nächsten Entsperren neu auf Argon2id versiegelt.)
- **Passkey-Entsperrung (optional)** — wo Ihr Authentifikator die **WebAuthn PRF**-Erweiterung unterstützt, kann QoreX den Tresor aus der 32-Byte-PRF-Ausgabe des Passkeys statt aus einem eingetippten Passwort entsperren.
- **Manifest V3 + strenge CSP** — `script-src 'self'; object-src 'self'; base-uri 'self'`. Es gibt **kein Laden von Remote-Code** nach der Installation und kein `wasm-unsafe-eval`.
- **Kein Konto, keine Telemetrie** — keine Analysen, kein Tracking, kein Remote-Logging, keine Registrierung und keine E-Mail. Der Firefox-Eintrag deklariert die Datenerfassung als `none`.

### Welche Berechtigungen QoreX anfragt und warum {#permissions}

Dieser Abschnitt existiert, weil der Firefox-Eintrag die Berechtigung **„Zugriff auf Ihre Daten für alle Websites"** anzeigt, was im Widerspruch zu einer Wallet stehen kann, die keine Host-Berechtigungen deklariert. Hier ist die exakte, unbearbeitete Wahrheit aus dem Manifest.

Die `manifest.json` der Erweiterung deklariert:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — die einzige API-Berechtigung. Sie speichert den verschlüsselten Tresor und Ihre Verbindungsfreigaben pro Ursprung **lokal**, im Erweiterungsspeicher.
- **`host_permissions: []`** — QoreX deklariert **keine** Host-Berechtigungen. Es fordert nicht die Fähigkeit an, in Ihrem Namen ursprungsübergreifende Netzwerkanfragen an beliebige Websites zu stellen.
- **`content_scripts` passt auf `<all_urls>`** — dies ist der ehrliche Grund, warum Firefox *„Zugriff auf Ihre Daten für alle Websites"* sagt. QoreX injiziert ein kleines Provider-Skript (`content.js` → `inpage.js`) in **jede Seite**. Ein Content-Skript, das auf allen Websites läuft, *kann* technisch die Seite lesen, und Browser beschreiben diese Fähigkeit mit genau diesem Wortlaut — egal ob sie aus `host_permissions` oder aus einem Content-Skript-Match stammt.

**Warum das Content-Skript überall läuft.** Damit **jede** dApp die Wallet über EIP-6963 erkennen kann, ohne dass Sie zuerst pro Website Zugriff gewähren müssen. So funktionieren MetaMask, Keplr, Phantom und jede andere injizierte Wallet: Der injizierte Provider muss vorhanden sein, bevor die Skripte der Seite laufen (`document_start`), auf jeder Website, die Sie besuchen.

**Was dieses Skript tut — und was nicht.** Es überbrückt nur Wallet-Nachrichten (den Provider ankündigen, Connect-/Sign-Anfragen an den Service Worker weiterleiten, das Ergebnis zurückgeben). Es **liest keine** Seiteninhalte über diese Wallet-Anfragen hinaus, sendet nichts an einen Server und lädt keinen Remote-Code — und es kann keine beliebigen ursprungsübergreifenden Daten abrufen, weil es keine Host-Berechtigungen gibt. All dies ist überprüfbar: Die Erweiterung ist CSP-gesperrt, liefert keine Analysen aus, und das Firefox-Paket enthält ein reproduzierbares Quellcode-Zip.

## Eine dApp mit QoreX verbinden {#connect}

Eine dApp erkennt die EVM-Spur von QoreX über **EIP-6963**. Announce-and-Request, dann den zurückgegebenen EIP-1193-Provider verwenden:

```ts
import type { EIP6963ProviderDetail } from "./types";

const wallets = new Map<string, EIP6963ProviderDetail>();

// 1. Collect every wallet that announces itself.
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});

// 2. Ask installed wallets to announce.
window.dispatchEvent(new Event("eip6963:requestProvider"));

// 3. Pick QoreX by its rdns and use the standard EIP-1193 provider.
const qorex = wallets.get("network.qore.qorex");
if (qorex) {
  const accounts = await qorex.provider.request({ method: "eth_requestAccounts" });
  console.log("QoreX EVM account:", accounts[0]);
}
```

Für die QoreChain-**Native**-Spur verwenden Sie den Keplr-Muster-Provider unter `window.qorex.native` (`enable`, `getKey`, `signDirect`). Das übergeordnete [`@qorechain/connect`](/sdk/overview)-Paket kapselt diese Erkennung für Sie.

Freigaben erfolgen **pro Ursprung**: Die erste Verbindung zu einer Website öffnet ein Freigabe-Popup, das den Ursprung anzeigt, die Freigabe legt nur Ihre öffentliche Adresse offen, und die Freigabe einer Website gewährt einer anderen nichts.

### Dashboard-Brücke (v0.1.5) {#dashboard-bridge}

Version 0.1.5 fügt eine Brücke hinzu, die ausschließlich auf **`dashboard.qorechain.io`** beschränkt ist: `window.qorex.native.connectProof(sessionId)` signiert den *Connect with QoreX*-Kopplungsnachweis (das Backend verifiziert die Signatur erneut), und `executeTransfer({ to, amountUqor, memo })` genehmigt und sendet eine vom Dashboard vorgeschlagene QOR-Überweisung und gibt den `txHash` zurück. Diese Methoden werden auf jedem anderen Ursprung abgelehnt.

## Post-Quanten-Signierung {#pqc}

Jede QOR-Überweisung, die QoreX selbst initiiert, wird mit einer **hybriden Post-Quanten-Signatur** signiert — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) neben der klassischen secp256k1-Signatur — unter Verwendung der vollständigen Hybrid-Pipeline in `@qorechain/sdk`. **Es gibt keinen Schalter**: QoreChain verlangt es, und QoreX sendet niemals eine Native-Spur-QOR-Überweisung ohne sie.

- **dApp-initiierte Native-Signierung** — dApps, die auf dem qorechain-connect-Ablauf aufbauen, legen die PQC-Erweiterung (`/qorechain.pqc.v1.PQCHybridSignature`) vorab in den Transaktionskörper, bevor sie `signDirect` aufrufen; QoreX trägt die klassische Hälfte bei und **weigert sich, blind zu signieren**, entschlüsselt die Nutzlast und markiert, ob die PQC-Schicht vorhanden ist.
- **Klassische Anfragen werden immer gekennzeichnet** — wenn eine Anfrage keine PQC-Schicht trägt oder auf eine externe Chain zielt (ETH/BNB/usw., die kein PQC tragen kann), zeigt QoreX eine explizite Warnung an, anstatt stillschweigend herabzustufen.

**Was das für die Transaktionsgröße bedeutet.** ML-DSA-87 ist eine große Signatur: Die Signatur ist **4,627 bytes** und der öffentliche Schlüssel **2,592 bytes** groß (durch FIPS-204 festgelegt). Eine hybride QoreChain-Transaktion ist daher mehrere Kilobyte größer als eine rein klassische. Wenn Sie Transaktionen selbst erstellen und senden, dimensionieren Sie Ihre Puffer und Gebührenschätzungen für die zusätzlichen Bytes; die Gas-Abrechnung von QoreChain erwartet sie bereits. Siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing) für die Primitive und die Anforderung an die deterministische Signierung.
