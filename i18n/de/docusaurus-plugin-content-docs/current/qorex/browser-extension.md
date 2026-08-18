---
slug: /qorex/browser-extension
title: QoreX Browser-Erweiterung
sidebar_label: Browser-Erweiterung
sidebar_position: 2
---

# QoreX Browser-Erweiterung

Die **Browser-Erweiterung** von QoreX ist die QoreChain-Wallet für den Desktop. Sie ist eine **eigenständige Wallet** — Wallet erstellen oder importieren, QOR halten und senden sowie Verbindungen zu dApps herstellen — und sie ist der Baustein, mit dem jede Website QoreX erkennen und jede Anfrage in eine ausdrückliche, entschlüsselt dargestellte Freigabe verwandeln kann.

Sie ist in drei Stores **live und öffentlich verfügbar**.

## Installation {#install}

| Browser | Installation |
|---|---|
| **Chrome und Chromium-Browser** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 oder neuer)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Welche Version wo live ist {#versions}

Store-Prüfungen werden zu unterschiedlichen Zeitpunkten abgeschlossen, daher unterscheidet sich die veröffentlichte Version derzeit je nach Browser:

| Browser | Veröffentlichte Version |
|---|---|
| **Firefox** | **0.1.5** |
| **Chrome / Chromium** | **0.1.3** (0.1.5 eingereicht, in Prüfung) |
| **Safari (macOS)** | wird innerhalb der **QoreX Wallet** macOS-App ausgeliefert, die eine eigene `1.x`-Nummerierung verwendet — der Mac App Store liefert derzeit **1.0** aus; der Build mit Erweiterung 0.1.5 befindet sich in Prüfung |

**0.1.5** ergänzt die [Erkennung über den Solana Wallet Standard](#standards), das [Entsperren per Passkey](#security), eine vollständig implementierte [SVM-dApp-Spur](#standards) sowie die [Verbindungsbrücke zum Dashboard](#dashboard-bridge). (Version 0.1.4 wurde nie veröffentlicht — ihre Änderungen erreichen die Nutzer mit 0.1.5.)

**Die Berechtigungsfläche ist in 0.1.3 und 0.1.5 identisch** — siehe [Welche Berechtigungen QoreX anfragt](#permissions).

:::note
Unter Safari öffnen sich Freigaben in einem Browser-Tab statt in einem Popup-Fenster — die Erweiterung wird aus derselben Codebasis mit Apples Safari-Web-Extension-Wrapper paketiert.
:::

## Wallet erstellen oder wiederherstellen {#wallet}

Öffnen Sie das Popup und wählen Sie:

- **Wallet erstellen** — erzeugt eine neue 24-Wörter-Wiederherstellungsphrase auf Ihrem Gerät (256 Bit Entropie), leitet daraus Ihre QoreChain-Identität ab und versiegelt sie im Tresor unter einem Passwort (und optional einem Passkey — siehe [Sicherheit](#security)).
- **Wallet importieren** — Wiederherstellung aus einer vorhandenen 24-Wörter-Phrase.

Die Erweiterung verwaltet ihre eigenen Schlüssel; sie benötigt die mobile App nicht. Sie können Ihre Mnemonik auch aus dem Popup exportieren. Schlüssel verlassen niemals das Gerät.

### Senden in externen Netzwerken {#send-external}

Neben QOR auf der nativen Spur kann das Popup auch Vermögenswerte in externen Netzwerken senden, die alle aus derselben Wiederherstellungsphrase abgeleitet werden:

| Art | Netzwerke | Mitgelieferte Token |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum | ERC-20-Einträge (USDT, USDC, DAI, sofern zutreffend) |
| SVM | Solana | SPL-Einträge (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | IBC-Eintrag (USDC auf Osmosis); optionales Memo-Feld |

Bevor eine externe Überweisung hinausgeht, müssen Sie eine ausdrückliche Bestätigung ankreuzen: **„Externe Netzwerke akzeptieren ausschließlich klassische Signaturen — anders als bei Ihren QOR ist diese Überweisung NICHT quantensicher."** Externe Chains können keine Post-Quanten-Signatur tragen, und QoreX verschweigt das nie.

## Unterstützte Wallet-Standards {#standards}

QoreX stellt drei Schnittstellen bereit, die alle auf der Seite als `window.qorex` (`{ evm, native, svm }`) injiziert und über die Erkennungsverträge von [`@qorechain/connect`](/sdk/overview) gefunden werden.

| Standard | Worum es sich handelt | Was das für Sie als Entwickler bedeutet |
|---|---|---|
| **EIP-1193** | Die JavaScript-API des Ethereum-Providers (`request(...)`, Events). | Ihr bestehender ethers.js-/viem-/web3.js-Code spricht unverändert mit der EVM-Spur von QoreX; numerische Fehlercodes (z. B. `4902`) werden wortgetreu weitergereicht. |
| **EIP-6963** | Erkennung mehrerer Wallet-Provider (Announce-/Request-Events). | QoreX meldet sich neben jeder anderen Wallet an — es **überschreibt `window.ethereum` niemals** — sodass der Nutzer QoreX pro Website konfliktfrei auswählt. |
| **`signDirect` nach Keplr-Muster** | Ein Provider in Form eines Cosmos-`OfflineDirectSigner` auf `window.qorex.native`. | dApps im Cosmos-Stil signieren Transaktionen der **nativen Spur** von QoreChain genauso, wie sie es mit Keplr täten; die Post-Quanten-Schicht ist bereits vorab angewendet (siehe [Post-Quanten-Signierung](#pqc)). |
| **Solana Wallet Standard** *(ab 0.1.5)* | Native Wallet-Erkennung für Solana-dApps (`wallet-standard:register-wallet` / `app-ready`). | Solana-dApps **erkennen QoreX automatisch** — keine eigene Integration nötig. Funktionen: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; Chain `solana:mainnet`; sowohl `legacy`- als auch `v0`-Transaktionen. |

:::note Die SVM-Spur direkt ansprechen
Dieselbe Schnittstelle ist auch unter `window.qorex.svm` verfügbar (`connect` / `signAndSendTransaction` / `signMessage`). Die automatische Erkennung über Wallet Standard und die vollständig implementierte SVM-Spur kommen mit **0.1.5** — heute sind sie daher unter **Firefox** verfügbar und unter Chrome, sobald 0.1.5 die Prüfung durchlaufen hat (siehe [welche Version wo live ist](#versions)).

Solana-Freigaben zeigen die entschlüsselte Nutzlast an (Empfänger und lamports bei System-Transfers sowie die Programmliste), lehnen Transaktionen ab, die Ihre Wallet nicht als Signierer aufführen, und kennzeichnen die Signatur als **klassisch** — siehe [Post-Quanten-Signierung](#pqc).
:::

## Sicherheit & Berechtigungen {#security}

QoreX ist darauf ausgelegt, überprüfbar zu sein, nicht bloß Vertrauen zu verlangen:

- **Tresor** — Ihre Schlüssel werden mit **AES-256-GCM** versiegelt. Der Passwortpfad leitet seinen Schlüssel mit **Argon2id** ab (RFC 9106, speicherintensiv: 64 MiB, t=3, p=1), sodass ein entwendeter Tresor-Blob dem Knacken per GPU/ASIC standhält. (Ältere PBKDF2-Blobs bleiben weiterhin zu öffnen und werden beim nächsten Entsperren neu mit Argon2id versiegelt.)
- **Entsperren per Passkey (optional, ab 0.1.5)** — sofern Ihr Authenticator die **WebAuthn PRF**-Erweiterung unterstützt, kann QoreX den Tresor mit der 32-Byte-PRF-Ausgabe des Passkeys entsperren statt mit einem eingetippten Passwort. Ihr Passwort bleibt stets als Rückfalloption erhalten.

  :::note Wo das Entsperren per Passkey erscheint
  QoreX erkennt WebAuthn per Feature-Detection und zeigt **Entsperren per Passkey aktivieren** nur dort an, wo der Browser die Funktion für Erweiterungsseiten bereitstellt — das sind **Chrome und Edge**. Unter **Firefox** ist die Option ausgeblendet, da Firefox WebAuthn nicht für Erweiterungsseiten bereitstellt. Zusammen mit dem [Versionsversatz](#versions) bedeutet das: Ein Firefox-Nutzer hat heute Wallet Standard, aber kein Entsperren per Passkey, und ein Chrome-Nutzer hat keines von beidem, bis 0.1.5 die Prüfung durchlaufen hat. Das ist so vorgesehen und kein Fehler.
  :::
- **Manifest V3 + strenge CSP** — `script-src 'self'; object-src 'self'; base-uri 'self'`. Nach der Installation gibt es **kein Nachladen von Remote-Code** und kein `wasm-unsafe-eval`.
- **Kein Konto, keine Telemetrie** — keine Analysen, kein Tracking, keine Remote-Protokollierung, keine Registrierung und keine E-Mail-Adresse. Der Firefox-Eintrag deklariert die Datenerhebung als `none`.

### Welche Berechtigungen QoreX anfragt und warum {#permissions}

Diesen Abschnitt gibt es, weil der Firefox-Eintrag die Berechtigung **„Auf Ihre Daten für alle Websites zugreifen"** anzeigt, was im Widerspruch zu einer Wallet zu stehen scheint, die keine Host-Berechtigungen deklariert. Hier ist die exakte, ungekürzte Wahrheit aus dem Manifest.

Die `manifest.json` der Erweiterung deklariert:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — die einzige API-Berechtigung. Sie speichert den verschlüsselten Tresor und Ihre ursprungsbezogenen Verbindungsfreigaben **lokal** im Speicher der Erweiterung.
- **`host_permissions: []`** — QoreX deklariert **keine** Host-Berechtigungen. Es fordert nicht die Möglichkeit an, in Ihrem Namen ursprungsübergreifende Netzwerkanfragen an beliebige Websites zu stellen.
- **`content_scripts` mit `<all_urls>`** — das ist der ehrliche Grund, weshalb Firefox *„Auf Ihre Daten für alle Websites zugreifen"* meldet. QoreX injiziert ein kleines Provider-Skript (`content.js` → `inpage.js`) in **jede Seite**. Ein Content-Skript, das auf allen Websites läuft, *kann* technisch gesehen die Seite auslesen, und Browser beschreiben diese Fähigkeit mit genau diesem Wortlaut — unabhängig davon, ob sie aus `host_permissions` oder aus einer Content-Skript-Übereinstimmung stammt.

**Warum das Content-Skript überall läuft.** Damit **jede** dApp die Wallet über EIP-6963 erkennen kann, ohne dass Sie zuvor Zugriff pro Website gewähren müssen. So arbeiten MetaMask, Keplr, Phantom und jede andere injizierte Wallet: Der injizierte Provider muss vorhanden sein, bevor die Skripte der Seite laufen (`document_start`), und zwar auf jeder Website, die Sie besuchen.

**Was dieses Skript tut — und was nicht.** Es leitet ausschließlich Wallet-Nachrichten weiter (Provider ankündigen, Verbindungs-/Signieranfragen an den Service Worker weiterreichen, das Ergebnis zurückgeben). Es liest **keine** Seiteninhalte über diese Wallet-Anfragen hinaus, sendet nichts an einen Server und lädt keinen Remote-Code — und es kann keine beliebigen ursprungsübergreifenden Daten abrufen, weil es keine Host-Berechtigungen gibt. All das ist überprüfbar: Die Erweiterung ist per CSP abgesichert, enthält keinerlei Analysefunktionen, und das Firefox-Paket umfasst ein reproduzierbares Quellcode-Zip.

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

Für die **native** Spur von QoreChain verwenden Sie den Provider nach Keplr-Muster unter `window.qorex.native` (`enable`, `getKey`, `signDirect`). Das übergeordnete Paket [`@qorechain/connect`](/sdk/overview) kapselt diese Erkennung für Sie.

Freigaben gelten **pro Ursprung**: Die erste Verbindung zu einer Website öffnet ein Freigabe-Popup, das den Ursprung anzeigt; die Freigabe legt ausschließlich Ihre öffentliche Adresse offen, und die Freigabe für eine Website gewährt einer anderen nichts.

### Dashboard-Brücke (v0.1.5) {#dashboard-bridge}

Version 0.1.5 fügt eine Brücke hinzu, die ausschließlich auf **`dashboard.qorechain.io`** beschränkt ist: `window.qorex.native.connectProof(sessionId)` signiert den Kopplungsnachweis von *Connect with QoreX* (das Backend prüft die Signatur erneut), und `executeTransfer({ to, amountUqor, memo })` gibt eine vom Dashboard vorgeschlagene QOR-Überweisung frei, sendet sie ins Netzwerk und liefert den `txHash` zurück. Auf jedem anderen Ursprung werden diese Methoden verweigert.

## Post-Quanten-Signierung {#pqc}

Jede QOR-Überweisung, die QoreX selbst anstößt, wird mit einer **hybriden Post-Quanten-Signatur** signiert — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) zusammen mit der klassischen secp256k1-Signatur — unter Verwendung der vollständigen Hybrid-Pipeline in `@qorechain/sdk`. **Es gibt keinen Schalter dafür**: QoreChain verlangt es, und QoreX sendet niemals eine QOR-Überweisung auf der nativen Spur ohne sie.

- **Von dApps angestoßene native Signierung** — dApps, die auf dem qorechain-connect-Ablauf aufbauen, legen die PQC-Erweiterung (`/qorechain.pqc.v1.PQCHybridSignature`) vorab in den Transaktionsrumpf, bevor sie `signDirect` aufrufen; QoreX steuert die klassische Hälfte bei und **weigert sich, blind zu signieren**: Es entschlüsselt die Nutzlast und kennzeichnet, ob die PQC-Schicht vorhanden ist.
- **Klassische Anfragen werden stets gekennzeichnet** — trägt eine Anfrage keine PQC-Schicht oder zielt sie auf eine externe Chain (ETH/BNB usw., die kein PQC tragen können), zeigt QoreX eine ausdrückliche Warnung an, statt stillschweigend herabzustufen.

**Was das für die Transaktionsgröße bedeutet.** ML-DSA-87 erzeugt eine große Signatur: Die Signatur umfasst **4.627 Byte** und der öffentliche Schlüssel **2.592 Byte** (durch FIPS-204 festgelegt). Eine hybride QoreChain-Transaktion ist daher um mehrere Kilobyte größer als eine rein klassische. Wenn Sie Transaktionen selbst erstellen und ins Netzwerk senden, dimensionieren Sie Ihre Puffer und Gebührenschätzungen für die zusätzlichen Bytes; die Gas-Abrechnung von QoreChain rechnet bereits mit ihnen. Siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing) für die Primitive und die Anforderung an deterministisches Signieren.
