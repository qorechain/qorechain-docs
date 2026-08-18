---
slug: /qorex/browser-extension
title: QoreX Browser-Erweiterung
sidebar_label: Browser-Erweiterung
sidebar_position: 2
---

# QoreX Browser-Erweiterung

Die **Browser-Erweiterung** QoreX ist die QoreChain-Wallet für den Desktop. Sie ist eine **eigenständige Wallet** — Wallet erstellen oder importieren, QOR halten und senden sowie sich mit dApps verbinden — und sie ist zugleich der Baustein, mit dem jede Website QoreX erkennen und jede Anfrage in eine ausdrückliche, entschlüsselt dargestellte Freigabe verwandeln kann.

Sie ist in drei Stores **öffentlich verfügbar**.

## Installation {#install}

| Browser | Installation |
|---|---|
| **Chrome und Chromium-Browser** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 oder neuer)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Welche Version wo verfügbar ist {#versions}

Store-Prüfungen werden zu unterschiedlichen Zeitpunkten abgeschlossen, deshalb unterscheidet sich die veröffentlichte Version derzeit je nach Browser:

| Browser | Veröffentlichte Version |
|---|---|
| **Firefox** | **0.1.5** |
| **Chrome / Chromium** | **0.1.3** (0.1.5 eingereicht, in Prüfung) |
| **Safari (macOS)** | wird innerhalb der macOS-App **QoreX Wallet** ausgeliefert, die eine eigene `1.x`-Versionszählung verwendet |

**0.1.5** ergänzt die [Erkennung über den Solana Wallet Standard](#standards), das [Entsperren per Passkey](#security), eine vollständig implementierte [SVM-dApp-Spur](#standards) sowie die [Verbindungsbrücke zum Dashboard](#dashboard-bridge). (Version 0.1.4 wurde nie veröffentlicht — ihre Änderungen erreichen die Nutzer mit 0.1.5.)

**Der Umfang der Berechtigungen ist in 0.1.3 und 0.1.5 identisch** — siehe [Welche Berechtigungen QoreX anfragt](#permissions).

:::note
Unter Safari öffnen sich Freigaben in einem Browser-Tab statt in einem Popup-Fenster — die Erweiterung wird aus derselben Codebasis mit Apples Safari-Web-Extension-Wrapper paketiert.
:::

## Wallet erstellen oder wiederherstellen {#wallet}

Öffnen Sie das Popup und wählen Sie:

- **Wallet erstellen** — erzeugt auf Ihrem Gerät eine neue 24-Wörter-Wiederherstellungsphrase (256 Bit Entropie), leitet daraus Ihre QoreChain-Identität ab und versiegelt sie im Tresor unter einem Passwort (und optional einem Passkey — siehe [Sicherheit](#security)).
- **Wallet importieren** — Wiederherstellung aus einer vorhandenen 24-Wörter-Phrase.

Die Erweiterung verwaltet ihre eigenen Schlüssel; sie setzt die mobile App nicht voraus. Sie können Ihre Mnemonic auch aus dem Popup exportieren. Schlüssel verlassen das Gerät nie.

### Senden auf externen Netzwerken {#send-external}

Neben QOR auf der Native-Spur kann das Popup Werte auf externen Netzwerken senden, die alle aus derselben Wiederherstellungsphrase abgeleitet werden:

| Art | Netzwerke | Mitgelieferte Token |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum | ERC-20-Einträge (USDT, USDC, DAI, sofern zutreffend) |
| SVM | Solana | SPL-Einträge (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | IBC-Eintrag (USDC auf Osmosis); optionales Memo-Feld |

Bevor ein externer Transfer hinausgeht, müssen Sie eine ausdrückliche Bestätigung ankreuzen: **„Externe Netzwerke akzeptieren nur klassische Signaturen — anders als bei Ihren QOR ist dieser Transfer NICHT quantensicher."** Externe Chains können keine Post-Quanten-Signatur tragen, und QoreX verschweigt das nie.

## Unterstützte Wallet-Standards {#standards}

QoreX stellt drei Schnittstellen bereit, die alle als `window.qorex` (`{ evm, native, svm }`) in die Seite eingefügt und über die Erkennungsverträge von [`@qorechain/connect`](/sdk/overview) gefunden werden.

| Standard | Was es ist | Was es für Sie als Entwickler bedeutet |
|---|---|---|
| **EIP-1193** | Die JavaScript-API des Ethereum-Providers (`request(...)`, Events). | Ihr vorhandener ethers.js-/viem-/web3.js-Code spricht unverändert mit der EVM-Spur von QoreX; numerische Fehlercodes (z. B. `4902`) werden wortgetreu weitergereicht. |
| **EIP-6963** | Erkennung mehrerer Wallet-Provider (Announce-/Request-Events). | QoreX meldet sich neben jeder anderen Wallet an — es **überschreibt `window.ethereum` nie** — sodass Nutzer QoreX konfliktfrei pro Website auswählen. |
| **`signDirect` nach Keplr-Muster** | Ein Provider auf `window.qorex.native` in Form eines Cosmos-`OfflineDirectSigner`. | dApps im Cosmos-Stil signieren QoreChain-Transaktionen der **Native-Spur** genauso wie mit Keplr; die Post-Quanten-Schicht ist bereits vorab angewandt (siehe [Post-Quanten-Signierung](#pqc)). |
| **Solana Wallet Standard** *(ab 0.1.5)* | Native Wallet-Erkennung für Solana-dApps (`wallet-standard:register-wallet` / `app-ready`). | Solana-dApps **erkennen QoreX automatisch** — keine eigene Integration nötig. Funktionen: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; Chain `solana:mainnet`; sowohl `legacy`- als auch `v0`-Transaktionen. |

:::note Die SVM-Spur direkt ansprechen
Dieselbe Schnittstelle steht auch auf `window.qorex.svm` zur Verfügung (`connect` / `signAndSendTransaction` / `signMessage`). Die automatische Erkennung über Wallet Standard und die vollständig implementierte SVM-Spur kommen mit **0.1.5** — heute sind sie also unter **Firefox** verfügbar und unter Chrome, sobald 0.1.5 die Prüfung durchlaufen hat (siehe [welche Version wo verfügbar ist](#versions)).

Solana-Freigaben zeigen die entschlüsselte Nutzlast an (Empfänger und lamports bei System-Transfers sowie die Programmliste), weisen Transaktionen zurück, die Ihre Wallet nicht als Signierenden führen, und kennzeichnen die Signatur als **klassisch** — siehe [Post-Quanten-Signierung](#pqc).
:::

## Sicherheit & Berechtigungen {#security}

QoreX ist so gebaut, dass es überprüfbar und nicht bloß vertrauenswürdig ist:

- **Tresor** — Ihre Schlüssel werden mit **AES-256-GCM** versiegelt. Der Passwortpfad leitet seinen Schlüssel mit **Argon2id** ab (RFC 9106, speicherintensiv: 64 MiB, t=3, p=1), sodass ein entwendeter Tresor-Blob dem Knacken per GPU/ASIC standhält. (Ältere PBKDF2-Blobs bleiben weiterhin lesbar und werden beim nächsten Entsperren neu mit Argon2id versiegelt.)
- **Entsperren per Passkey (optional, ab 0.1.5)** — sofern Ihr Authenticator die Erweiterung **WebAuthn PRF** unterstützt, kann QoreX den Tresor mit der 32-Byte-PRF-Ausgabe des Passkeys statt mit einem eingetippten Passwort entsperren. Ihr Passwort bleibt stets als Rückfalloption erhalten.

  :::note Wo das Entsperren per Passkey erscheint
  QoreX erkennt WebAuthn automatisch und zeigt **Passkey-Entsperrung aktivieren** nur dort an, wo der Browser die Funktion für Erweiterungsseiten bereitstellt — das sind **Chrome und Edge**. Unter **Firefox** ist die Option ausgeblendet, weil Firefox WebAuthn für Erweiterungsseiten nicht bereitstellt. Zusammen mit dem [Versionsunterschied](#versions) bedeutet das: Eine Firefox-Nutzerin hat heute Wallet Standard, aber keine Passkey-Entsperrung, und ein Chrome-Nutzer hat beides nicht, bis 0.1.5 die Prüfung durchlaufen hat. Das ist so erwartet und kein Fehler.
  :::
- **Manifest V3 + strenge CSP** — `script-src 'self'; object-src 'self'; base-uri 'self'`. Nach der Installation gibt es **kein Nachladen von entferntem Code** und kein `wasm-unsafe-eval`.
- **Kein Konto, keine Telemetrie** — keine Analytik, kein Tracking, keine entfernte Protokollierung, keine Registrierung und keine E-Mail-Adresse. Der Firefox-Eintrag deklariert die Datenerhebung als `none`.

### Welche Berechtigungen QoreX anfragt und warum {#permissions}

Diesen Abschnitt gibt es, weil der Firefox-Eintrag die Berechtigung **„Auf Ihre Daten für alle Websites zugreifen"** anzeigt, was im Widerspruch zu einer Wallet stehen kann, die keinerlei Host-Berechtigungen deklariert. Hier ist die exakte, ungekürzte Wahrheit aus dem Manifest.

Die `manifest.json` der Erweiterung deklariert:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — die einzige API-Berechtigung. Sie speichert den verschlüsselten Tresor und Ihre Verbindungsfreigaben pro Herkunft **lokal** im Erweiterungsspeicher.
- **`host_permissions: []`** — QoreX deklariert **keine** Host-Berechtigungen. Es fordert nicht die Möglichkeit an, in Ihrem Namen Cross-Origin-Netzwerkanfragen an beliebige Websites zu stellen.
- **`content_scripts` mit `<all_urls>`** — das ist der ehrliche Grund, warum Firefox *„Auf Ihre Daten für alle Websites zugreifen"* anzeigt. QoreX fügt in **jede Seite** ein kleines Provider-Skript ein (`content.js` → `inpage.js`). Ein Content-Script, das auf allen Websites läuft, *kann* technisch die Seite auslesen, und Browser beschreiben diese Fähigkeit mit genau dieser Formulierung — unabhängig davon, ob sie aus `host_permissions` oder aus einem Content-Script-Treffer stammt.

**Warum das Content-Script überall läuft.** Damit **jede** dApp die Wallet über EIP-6963 erkennen kann, ohne dass Sie zuvor Zugriff pro Website erteilen müssen. So arbeiten MetaMask, Keplr, Phantom und jede andere eingefügte Wallet: Der eingefügte Provider muss vorhanden sein, bevor die Skripte der Seite laufen (`document_start`), und zwar auf jeder Website, die Sie besuchen.

**Was dieses Skript tut — und was nicht.** Es vermittelt ausschließlich Wallet-Nachrichten (den Provider ankündigen, Verbindungs- und Signieranfragen an den Service Worker weiterleiten, das Ergebnis zurückgeben). Es liest **keine** Seiteninhalte über diese Wallet-Anfragen hinaus, sendet nichts an einen Server und lädt keinen entfernten Code — und es kann keine beliebigen Cross-Origin-Daten abrufen, weil es keine Host-Berechtigungen gibt. All das ist überprüfbar: Die Erweiterung ist per CSP abgesichert, liefert keine Analytik aus, und das Firefox-Paket enthält ein reproduzierbares Quelltext-Zip.

## Eine dApp mit QoreX verbinden {#connect}

Eine dApp erkennt die EVM-Spur von QoreX über **EIP-6963**. Announce-and-Request, danach den zurückgegebenen EIP-1193-Provider verwenden:

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

Für die **Native**-Spur von QoreChain verwenden Sie den Provider nach Keplr-Muster unter `window.qorex.native` (`enable`, `getKey`, `signDirect`). Das übergeordnete Paket [`@qorechain/connect`](/sdk/overview) kapselt diese Erkennung für Sie.

Freigaben gelten **pro Herkunft**: Die erste Verbindung zu einer Website öffnet ein Freigabe-Popup, das die Herkunft anzeigt; die Zustimmung gibt nur Ihre öffentliche Adresse preis, und die Freigabe für eine Website gewährt einer anderen nichts.

### Dashboard-Brücke (v0.1.5) {#dashboard-bridge}

Version 0.1.5 fügt eine Brücke hinzu, die ausschließlich auf **`dashboard.qorechain.io`** beschränkt ist: `window.qorex.native.connectProof(sessionId)` signiert den Kopplungsnachweis von *Connect with QoreX* (das Backend prüft die Signatur erneut), und `executeTransfer({ to, amountUqor, memo })` gibt einen vom Dashboard vorgeschlagenen QOR-Transfer frei, sendet ihn und liefert den `txHash` zurück. Auf jeder anderen Herkunft werden diese Methoden verweigert.

## Post-Quanten-Signierung {#pqc}

Jeder QOR-Transfer, den QoreX selbst anstößt, wird mit einer **hybriden Post-Quanten-Signatur** signiert — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) zusammen mit der klassischen secp256k1-Signatur — über die vollständige Hybrid-Pipeline in `@qorechain/sdk`. **Es gibt keinen Schalter**: QoreChain verlangt es, und QoreX sendet niemals einen QOR-Transfer auf der Native-Spur ohne sie.

- **Von dApps angestoßenes Native-Signieren** — dApps, die auf dem qorechain-connect-Ablauf aufbauen, legen die PQC-Erweiterung (`/qorechain.pqc.v1.PQCHybridSignature`) vorab in den Transaktionskörper, bevor sie `signDirect` aufrufen; QoreX steuert die klassische Hälfte bei und **weigert sich, blind zu signieren**: Es entschlüsselt die Nutzlast und kennzeichnet, ob die PQC-Schicht vorhanden ist.
- **Klassische Anfragen werden immer gekennzeichnet** — trägt eine Anfrage keine PQC-Schicht oder zielt sie auf eine externe Chain (ETH/BNB usw., die kein PQC tragen kann), zeigt QoreX eine ausdrückliche Warnung an, statt still herabzustufen.

**Was das für die Transaktionsgröße bedeutet.** ML-DSA-87 erzeugt eine große Signatur: Die Signatur umfasst **4,627 bytes**, der öffentliche Schlüssel **2,592 bytes** (durch FIPS-204 festgelegt). Eine hybride QoreChain-Transaktion ist daher mehrere Kilobyte größer als eine rein klassische. Wenn Sie Transaktionen selbst erstellen und senden, legen Sie Ihre Puffer und Gebührenschätzungen auf die zusätzlichen Bytes aus; die Gasabrechnung von QoreChain rechnet bereits damit. Siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing) für die Primitive und die Anforderung an deterministisches Signieren.
