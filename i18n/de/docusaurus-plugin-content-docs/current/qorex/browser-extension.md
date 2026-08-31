---
slug: /qorex/browser-extension
title: QoreX Browser-Erweiterung
sidebar_label: Browser-Erweiterung
sidebar_position: 2
---

# QoreX Browser-Erweiterung

Die **Browser-Erweiterung** von QoreX ist die Desktop-QoreChain-Wallet. Sie ist eine **eigenständige Wallet** — erstellen oder importieren Sie eine Wallet, halten und senden Sie QOR und verbinden Sie sich mit dApps — und sie ist der Baustein, der jeder Website erlaubt, QoreX zu erkennen und jede Anfrage in eine explizite, entschlüsselte Genehmigung zu verwandeln.

Sie ist **live und öffentlich** in drei Stores verfügbar.

## Installation {#install}

| Browser | Installation |
|---|---|
| **Chrome und Chromium-Browser** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 oder neuer)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Welche Version wo verfügbar ist {#versions}

Store-Reviews landen zu unterschiedlichen Zeitpunkten, daher unterscheidet sich die veröffentlichte Version derzeit je nach Browser:

| Browser | Veröffentlichte Version |
|---|---|
| **Firefox** | **0.2.6** |
| **Safari (macOS)** | läuft innerhalb der **QoreX Wallet**-macOS-App, die ihre eigene `1.x`-Nummerierung verwendet — der Mac App Store liefert derzeit **1.6** (enthält Erweiterung **0.2.6**) |
| **Chrome / Chromium** | Stand Ende August in einem langwierigen Store-Review-Prozess festhängend — prüfen Sie den aktuellen Stand direkt im [Chrome Web Store-Eintrag](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg), statt einer Versionsangabe hier zu vertrauen |

Neuere Funktionen sind in Ihrem Browser möglicherweise noch nicht live — prüfen Sie die Tabelle oben, bevor Sie annehmen, dass etwas hier Beschriebenes verfügbar ist. Wenn das Dashboard Ihnen mitteilt, dass Ihre Erweiterung aktualisiert werden muss, bedeutet das eine bestimmte Mindestversion für diese Aktion (zum Beispiel 0.2.2, für Staking) — nicht, dass Ihr Build allgemein veraltet ist.

**0.1.5** fügte [Solana Wallet Standard Discovery](#standards), [Passkey-Entsperrung](#security), eine vollständig implementierte [SVM-dApp-Lane](#standards) und die [Dashboard-Verbindungsbrücke](#dashboard-bridge) hinzu. (Version 0.1.4 wurde nie veröffentlicht — ihre Änderungen erreichen Nutzer mit 0.1.5.)

**0.1.6–0.1.9** fügten in dieser Reihenfolge hinzu: Vesting-bewusste Sendungen mit ehrlichen Bank-Ablehnungsmeldungen; die Kontoadresse und das Live-Guthaben direkt auf der Popup-Startseite; und in **0.1.9** [das Bezahlen eines @Handles](#handle-send) direkt aus „Senden", einen [Empfangsbildschirm mit QR-Code der Adresse](#receive), eine [Sprachauswahl](#language) (zehn Sprachen, passend zum Sprachumfang der mobilen App) sowie die Entfernung eines verwirrenden „nächsten Freischaltdatums" aus dem [Vesting-Guthaben](#vesting).

**0.2.2** fügte [Staking direkt aus der Erweiterung](#stake) hinzu — einen eigenen Stake-Bildschirm (Validatoren mit Provision, Ihr gesamtes gestaktes Guthaben, wartende Rewards sowie Delegieren / Unstaken / Beanspruchen); [mehrere Konten aus einer Wiederherstellungsphrase](#wallet), genau wie in der mobilen App; die Behebung, die es der Staking-Schaltfläche des **Dashboards** erst ermöglicht, die Erweiterung tatsächlich zu erreichen (eine nur in der Erweiterung erstellte Wallet konnte zuvor über das Dashboard gar nicht staken — siehe [Dashboard-Brücke](#dashboard-bridge)); funktionierendes @Handle-Beanspruchen aus dem Browser; sowie die am Fuß des Popups angezeigte Build-Nummer.

**Die Berechtigungsoberfläche hat sich seit 0.1.3 nicht geändert** — siehe [Welche Berechtigungen QoreX anfragt](#permissions).

:::note
Unter Safari öffnen sich Genehmigungen in einem Browser-Tab statt in einem Popup-Fenster — die Erweiterung wird mit Apples Safari-Web-Extension-Wrapper aus derselben Codebasis verpackt.
:::

## Eine Wallet erstellen oder wiederherstellen {#wallet}

Öffnen Sie das Popup und wählen Sie:

- **Wallet erstellen** — erzeugt auf Ihrem Gerät eine neue 24-Wort-Wiederherstellungsphrase (256-Bit-Entropie), leitet Ihre QoreChain-Identität ab und versiegelt sie im Tresor unter einem Passwort (und optional einem Passkey — siehe [Sicherheit](#security)).
- **Wallet importieren** — Wiederherstellung aus einer vorhandenen 24-Wort-Phrase.

Die Erweiterung verwaltet ihre eigenen Schlüssel; sie benötigt nicht die mobile App. Sie können Ihre Mnemonic auch aus dem Popup exportieren. Schlüssel verlassen niemals das Gerät.

:::note Mehrere Konten aus einer Phrase (ab 0.2.2)
Die Erweiterung kann jetzt mehrere Konten aus derselben Wiederherstellungsphrase erstellen und zwischen ihnen wechseln, genau wie die mobile App — die Phrase, die Sie bereits notiert haben, stellt jedes davon wieder her. Der Wechsel nimmt alles mit: Senden, Staking, Empfangen und Ihr @Handle folgen jeweils dem gerade aktiven Konto. Portfolio, Q-Day Scanner, soziale Wiederherstellung, Legacy-Protokoll, Zahlungsanfragen und Geräteverknüpfung bleiben nur in der mobilen App verfügbar — siehe [QoreX Wallet](/qorex/overview#platform-availability) für den vollständigen Vergleich.
:::

## Ihr Konto, Guthaben & @Handle {#account}

Der Leerlaufbildschirm des Popups zeigt Ihre `qor1…`-Adresse (zum Kopieren antippen) sowie Ihr Live-QOR-Guthaben, sodass Sie keinen Block-Explorer öffnen müssen, um beides zu prüfen.

### Vesting-Guthaben (gesperrt) {#vesting}

Wenn Ihr Konto Vesting-QOR hält (zum Beispiel eine noch nicht freigegebene TGE-Zuteilung), teilt sich das Guthaben auf in **jetzt verfügbar** und **noch gesperrt**, und eine Sendung, die den verfügbaren Betrag übersteigt, wird abgelehnt, bevor sie das Netzwerk erreicht, statt On-Chain nach Abzug einer Gebühr fehlzuschlagen. QoreX zeigt hier absichtlich **kein** „nächstes Freischaltdatum": Ein Vesting-Zeitplan kann per Governance geändert werden, sodass ein Datum auf der Guthabenkarte wie ein Versprechen wirken würde, das QoreX nicht garantieren kann. Die Aufteilung in verfügbar vs. gesperrt bleibt das, was korrekt bleibt.

### Ein @Handle beanspruchen

Aus dem Popup heraus können Sie ein eindeutiges **@Handle** (zum Beispiel `@liviu`) für die Adresse dieses Kontos beanspruchen, genau wie in der mobilen App. Die Beanspruchung wird mit dem eigenen Schlüssel des Kontos signiert und an diese Adresse gebunden, sodass die mobile App und das Dashboard sie auflösen können, wenn jemand an Sie sendet. Siehe [@Handle](/qorex/account-and-dashboard#handle) dazu, wie Handles an Adressen gebunden werden (nicht an eine Wallet als Ganzes).

## An ein @Handle senden {#handle-send}

Seit 0.1.9 können Sie ein registriertes @Handle direkt bezahlen, statt eine Adresse nachzuschlagen:

1. Öffnen Sie das Popup und tippen Sie auf **Senden**.
2. Geben Sie im Empfängerfeld ein `@` gefolgt vom Handle ein (zum Beispiel `@liviu`) statt einer `qor1…`-Adresse.
3. QoreX löst das Handle auf und zeigt Ihnen die **aufgelöste Adresse**, bevor Sie irgendetwas signieren — prüfen Sie diese immer gegen Ihre Erwartung.
4. Betrag eingeben und bestätigen.

Die Auflösung wird auf zwei Arten verifiziert, bevor QoreX sie verwendet: eine Registry-Attestierung, die gegen einen fest in die Erweiterung eingebauten Vertrauensschlüssel geprüft wird, sowie die eigene Signatur des Handle-Inhabers über die Beanspruchung. Eine Antwort, die eine der beiden Prüfungen nicht besteht, wird rundweg abgelehnt — QoreX greift nicht auf die Anzeige einer unverifizierten Adresse zurück. Beim ersten Mal, dass Sie ein bestimmtes Handle bezahlen, merkt sich QoreX (pinnt) die aufgelöste Adresse; wenn dieses Handle später auf eine **andere** Adresse aufgelöst wird, stoppt QoreX und zeigt Ihnen sowohl die alte als auch die neue Adresse vollständig an, damit Sie entscheiden können, ob Sie fortfahren möchten. Dieses Gedächtnis lebt **pro Browser** — wenn Sie dasselbe Handle zum ersten Mal aus einem anderen Browser oder Computer bezahlen, wird es dort ebenfalls als neu angezeigt. Das ist erwartet, kein Fehler.

## Empfangen {#receive}

Tippen Sie im Popup auf **Empfangen**, um Ihre `qor1…`-Adresse als QR-Code (mit eingebettetem QoreChain-Icon) zusammen mit einer Kopieren-Schaltfläche anzuzeigen — scannen Sie ihn von einem Telefon oder fügen Sie die Adresse direkt ein.

## Aus der Erweiterung staken {#stake}

Seit **0.2.2** hat das Popup einen eigenen **Stake**-Bildschirm — eine nur in der Erweiterung erstellte Wallet benötigt nicht mehr die mobile App, um Staking-Rewards zu verdienen.

1. Öffnen Sie das Popup und wechseln Sie zu **Stake**.
2. Der Bildschirm listet aktive Validatoren mit ihrer Provision, Ihr aktuell gestaktes Gesamtguthaben sowie alle wartenden, noch zu beanspruchenden Rewards auf. Validatoren, die das Netzwerk **inhaftiert** hat, werden aus der Liste ausgeschlossen — an einen davon zu delegieren ist nie das, was Sie wollen.
3. Um zu delegieren, wählen Sie einen Validator und einen Betrag und bestätigen dann. QoreX signiert mit der obligatorischen hybriden Post-Quanten-Signatur, genau wie bei einer Sendung.
4. **Unstaken** und **Beanspruchen** funktionieren vom selben Bildschirm aus. Unstaken startet die 21-tägige Unbonding-Periode — siehe [Staking & Delegation](/user-guide/staking-and-delegation) für die Bedeutung.
5. Seit **0.2.6** können Sie außerdem **Stake zu einem anderen Validator verschieben** (redelegieren) — keine Unbonding-Wartezeit, keine Strafe, und Rewards fließen den ganzen Weg über weiter. Siehe [Stake zwischen Validatoren verschieben](/qorex/portfolio-and-staking#move-stake) für die Funktionsweise (die Mechanik ist zwischen App und Erweiterung identisch).

Staking, Delegation und Rewards finden ausschließlich auf der **Native**-Lane statt, niemals über ein EVM-Precompile.

### Eine Dashboard-Staking-Anfrage genehmigen {#stake-dashboard}

Das QoreChain-[Dashboard](/dashboard/staking-and-validators) stellt Staking-Anfragen zusammen, kann sie aber nicht signieren — Ihr Schlüssel verlässt niemals den Tresor der Erweiterung. Wenn Sie im Dashboard auf **Weiter in QoreX** klicken, öffnet sich die Anfrage in der Erweiterung, damit Sie sie prüfen (Validator und Betrag) und genehmigen können, genau wie bei einer Sendung. Diese Verbindung war in 0.2.1 defekt (die Erweiterung meldete sich selbst als „zu alt", obwohl sie der neueste veröffentlichte Build war — das eigentliche Problem war ein fehlender interner Zwischenschritt, nicht Versionsveraltung); sie ist ab **0.2.2** behoben. Falls Sie einen älteren Build verwenden, siehe [welche Version wo verfügbar ist](#versions).

:::note Wenn eine Transaktion als „herabgestuft" statt erfolgreich angezeigt wird
Das Dashboard zeigt eine Transaktion gelegentlich als **herabgestuft** statt als sauberen Erfolg an. Das bedeutet, dass Ihre Gelder bewegt wurden, die Post-Quanten-Signaturschicht für diese Transaktion jedoch on-chain nicht gefunden wurde — das ist nichts, was Sie falsch gemacht haben, und nichts, was Sie von Ihrer Seite aus beheben können. Es ist ein Fehler auf unserer Seite; bitte melden Sie ihn dem Support, damit wir es untersuchen können. Die Meldung bleibt absichtlich auf dem Bildschirm stehen, statt zu verschwinden, damit Sie Zeit haben, sie zu lesen und zu melden.
:::

### Auf externen Netzwerken senden {#send-external}

Neben QOR auf der Native-Lane kann das Popup Assets auf externen Netzwerken senden, alle abgeleitet von derselben Wiederherstellungsphrase:

| Art | Netzwerke | Gebündelte Token |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | ERC-20-Einträge (USDC und USDT über die EVM-Chains hinweg, DAI auf Ethereum) |
| SVM | Solana | SPL-Einträge (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | Noble USDC über IBC; optionales Memo-Feld |

Bevor eine externe Überweisung hinausgeht, müssen Sie eine explizite Bestätigung ankreuzen: **„Externe Netzwerke akzeptieren nur klassische Signaturen — anders als Ihr QOR ist diese Überweisung NICHT quantensicher."** Externe Chains können keine Post-Quanten-Signatur tragen, und QoreX verschweigt das nie.

## Unterstützte Wallet-Standards {#standards}

QoreX stellt drei Schnittstellen bereit, alle als `window.qorex` (`{ evm, native, svm }`) auf der Seite injiziert und über die [`@qorechain/connect`](/sdk/overview)-Erkennungsverträge auffindbar.

| Standard | Was es ist | Was es für Sie als Entwickler bedeutet |
|---|---|---|
| **EIP-1193** | Die Ethereum-Provider-JavaScript-API (`request(...)`, Events). | Ihr bestehender ethers.js- / viem- / web3.js-Code spricht unverändert mit QoreX's EVM-Lane; numerische Fehlercodes (z. B. `4902`) werden unverändert weitergereicht. |
| **EIP-6963** | Multi-Wallet-Provider-Erkennung (announce-/request-Events). | QoreX kündigt sich selbst neben jeder anderen Wallet an — es **überschreibt niemals `window.ethereum`** — sodass der Nutzer QoreX pro Website ohne Konflikte auswählt. |
| **Keplr-Muster `signDirect`** | Ein Cosmos-`OfflineDirectSigner`-förmiger Provider unter `window.qorex.native`. | Cosmos-artige dApps signieren QoreChain-**Native-Lane**-Transaktionen genauso, wie sie es mit Keplr täten; die Post-Quanten-Schicht ist bereits vorab angewendet (siehe [Post-Quanten-Signierung](#pqc)). |
| **Solana Wallet Standard** *(ab 0.1.5)* | Native Wallet-Erkennung für Solana-dApps (`wallet-standard:register-wallet` / `app-ready`). | Solana-dApps **erkennen QoreX automatisch** — keine benutzerdefinierte Integration nötig. Funktionen: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; Chain `solana:mainnet`; sowohl `legacy`- als auch `v0`-Transaktionen. |

:::note Direkter Zugriff auf die SVM-Lane
Dieselbe Schnittstelle ist auch unter `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`) verfügbar. Wallet-Standard-Auto-Discovery und die vollständig implementierte SVM-Lane wurden mit **0.1.5** ausgeliefert und sind sowohl in Chrome als auch in Firefox live (siehe [welche Version wo verfügbar ist](#versions)).

Solana-Genehmigungen zeigen die entschlüsselte Payload (Empfänger und Lamports bei System-Transfers sowie die Programmliste), lehnen Transaktionen ab, die Ihre Wallet nicht als Signer auflisten, und markieren die Signatur als **klassisch** — siehe [Post-Quanten-Signierung](#pqc).
:::

## Sprache {#language}

Die Erweiterung spricht dieselben zehn Sprachen wie die mobile App, das Dashboard und die Website: Englisch, Rumänisch, Deutsch, Spanisch, Französisch, Italienisch, Türkisch, Arabisch, Japanisch und Koreanisch. Sie folgt standardmäßig der Sprache Ihres **Browsers** (mit Rückfall auf Englisch für alles andere) — beachten Sie, dass dies eine andere Quelle ist als bei der mobilen App, die der Sprache des **Telefons** folgt, sodass beide unterschiedliche Sprachen anzeigen können, wenn Telefon und Browser unterschiedlich eingestellt sind. Eine Auswahl auf dem Leerlaufbildschirm des Popups erlaubt es Ihnen, die erkannte Sprache jederzeit zu überschreiben; der Wechsel zu Arabisch dreht das Popup sofort auf rechts-nach-links um, nicht nur den Text.

## Sicherheit & Berechtigungen {#security}

QoreX ist darauf ausgelegt, überprüfbar zu sein, nicht nur vertrauenswürdig:

- **Tresor** — Ihre Schlüssel werden mit **AES-256-GCM** versiegelt. Der Passwortpfad leitet seinen Schlüssel mit **Argon2id** ab (RFC 9106, speicherhart: 64 MiB, t=3, p=1), sodass ein exfiltrierter Tresor-Blob GPU-/ASIC-Cracking widersteht. (Alte PBKDF2-Blobs bleiben öffenbar und werden beim nächsten Entsperren zu Argon2id neu versiegelt.)
- **Passkey-Entsperrung (optional, ab 0.1.5)** — wo Ihr Authenticator die **WebAuthn-PRF**-Erweiterung unterstützt, kann QoreX den Tresor anhand der 32-Byte-PRF-Ausgabe des Passkeys entsperren, statt eines eingegebenen Passworts. Ihr Passwort bleibt stets ein Fallback.

  :::note Wo die Passkey-Entsperrung erscheint
  QoreX erkennt WebAuthn per Feature-Detection und zeigt **Passkey-Entsperrung aktivieren** nur dort, wo der Browser dies für Erweiterungsseiten bereitstellt — das sind **Chrome und Edge**. In **Firefox** ist die Option ausgeblendet, weil Firefox WebAuthn für Erweiterungsseiten nicht bereitstellt. Das ist erwartet, kein Fehler.
  :::
- **Manifest V3 + strikte CSP** — `script-src 'self'; object-src 'self'; base-uri 'self'`. Es gibt **kein Nachladen von Remote-Code** nach der Installation und kein `wasm-unsafe-eval`.
- **Kein Konto, keine Telemetrie** — keine Analytics, kein Tracking, kein Remote-Logging, keine Anmeldung und keine E-Mail. Der Firefox-Eintrag deklariert die Datenerhebung als `none`.

### Welche Berechtigungen QoreX anfragt, und warum {#permissions}

Dieser Abschnitt existiert, weil der Firefox-Eintrag die Berechtigung **„Auf Ihre Daten für alle Websites zugreifen"** anzeigt, was im Widerspruch zu einer Wallet stehen kann, die keine Host-Berechtigungen deklariert. Hier ist die exakte, ungeschönte Wahrheit aus dem Manifest.

Die `manifest.json` der Erweiterung deklariert:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — die einzige API-Berechtigung. Sie speichert den verschlüsselten Tresor und Ihre Verbindungsgenehmigungen pro Ursprung **lokal** im Erweiterungsspeicher.
- **`host_permissions: []`** — QoreX deklariert **keine** Host-Berechtigungen. Es fordert nicht die Fähigkeit an, in Ihrem Namen Cross-Origin-Netzwerkanfragen an beliebige Websites zu stellen.
- **`content_scripts` mit Übereinstimmung `<all_urls>`** — dies ist der ehrliche Grund, warum Firefox „Auf Ihre Daten für alle Websites zugreifen" anzeigt. QoreX injiziert ein kleines Provider-Skript (`content.js` → `inpage.js`) in **jede Seite**. Ein Content-Script, das auf allen Websites läuft, *kann* technisch die Seite lesen, und Browser beschreiben diese Fähigkeit mit genau diesem Wortlaut — egal ob sie aus `host_permissions` oder aus einer Content-Script-Übereinstimmung stammt.

**Warum das Content-Script überall läuft.** Damit **jede** dApp die Wallet über EIP-6963 erkennen kann, ohne dass Sie zuvor pro Website Zugriff gewähren müssen. So funktionieren MetaMask, Keplr, Phantom und jede andere injizierte Wallet: Der injizierte Provider muss vorhanden sein, bevor die Skripte der Seite laufen (`document_start`), auf welcher Website Sie auch immer sind.

**Was dieses Skript tut — und nicht tut.** Es überbrückt ausschließlich Wallet-Nachrichten (den Provider ankündigen, Connect-/Sign-Anfragen an den Service-Worker weiterleiten, das Ergebnis zurückgeben). Es liest **nicht** über diese Wallet-Anfragen hinaus den Seiteninhalt, sendet nichts an einen Server und lädt keinen Remote-Code — und es kann keine beliebigen Cross-Origin-Daten abrufen, da keine Host-Berechtigungen vorliegen. All das ist überprüfbar: Die Erweiterung ist CSP-gesperrt, liefert keine Analytics aus, und das Firefox-Paket enthält ein reproduzierbares Quellcode-Zip.

## Eine dApp mit QoreX verbinden {#connect}

Eine dApp erkennt die EVM-Lane von QoreX über **EIP-6963**. Announce-and-Request, dann den zurückgegebenen EIP-1193-Provider verwenden:

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

Für die QoreChain-**Native**-Lane verwenden Sie den Keplr-Muster-Provider unter `window.qorex.native` (`enable`, `getKey`, `signDirect`). Das übergeordnete [`@qorechain/connect`](/sdk/overview)-Paket kapselt diese Erkennung für Sie.

Genehmigungen sind **pro Ursprung**: Die erste Verbindung zu einer Website öffnet ein Genehmigungs-Popup, das den Ursprung anzeigt, die Genehmigung gibt nur Ihre öffentliche Adresse preis, und die Genehmigung einer Website gewährt einer anderen nichts.

### Dashboard-Brücke (v0.1.5, erweitert in v0.2.2) {#dashboard-bridge}

Version 0.1.5 fügt eine Brücke hinzu, die ausschließlich auf **`dashboard.qorechain.io`** beschränkt ist: `window.qorex.native.connectProof(sessionId)` signiert den *Connect-with-QoreX*-Pairing-Beweis (das Backend verifiziert die Signatur erneut), und `executeTransfer({ to, amountUqor, memo })` genehmigt und überträgt einen vom Dashboard vorgeschlagenen QOR-Transfer und gibt den `txHash` zurück. Diese Methoden werden bei jedem anderen Ursprung abgelehnt.

**0.2.2** fügt `native:executeRequest` hinzu, das eine gesamte vom Dashboard vorgeschlagene Anfrage entgegennimmt — einschließlich [Staking](#stake-dashboard) — validiert gegen denselben gemeinsamen Parser, den QoreX überall sonst verwendet: abgelehnt bei einer Netzwerk-Fehlübereinstimmung, einem fremden Ursprung, einer Adresse, die nicht Ihnen gehört, einer unbekannten Anfrageart oder einer Staking-Anfrage, die eine `toAddress` trägt (Staking-Anfragen haben keine).

Da eine `qor1…`-Adresse sowohl auf dem Mainnet als auch auf dem Testnet gleichermaßen gültig ist, gibt eine vom Dashboard vorgeschlagene Anfrage an, welches Netzwerk sie anvisiert, und QoreX weigert sich, danach zu handeln, wenn dies nicht mit dem Netzwerk übereinstimmt, mit dem die Erweiterung gerade verbunden ist — sie wechselt niemals im Auftrag einer Anfrage das Netzwerk.

## Post-Quanten-Signierung {#pqc}

Jede QOR-Überweisung, die QoreX selbst initiiert, wird mit einer **hybriden Post-Quanten-Signatur** signiert — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) zusammen mit der klassischen secp256k1-Signatur — unter Verwendung der vollständigen Hybrid-Pipeline in `@qorechain/sdk`. **Es gibt keinen Schalter dafür**: QoreChain verlangt es, und QoreX sendet niemals eine Native-Lane-QOR-Überweisung ohne diese Signatur.

- **dApp-initiierte Native-Signierung** — dApps, die auf dem qorechain-connect-Flow aufbauen, legen die PQC-Erweiterung (`/qorechain.pqc.v1.PQCHybridSignature`) vor dem Aufruf von `signDirect` vorab in den Transaktionskörper ein; QoreX steuert die klassische Hälfte bei und **weigert sich, blind zu signieren**, entschlüsselt die Payload und markiert, ob die PQC-Schicht vorhanden ist.
- **Klassische Anfragen werden immer gekennzeichnet** — wenn eine Anfrage keine PQC-Schicht trägt oder eine externe Chain anvisiert (ETH/BNB/etc., die keine PQC tragen kann), zeigt QoreX eine explizite Warnung an, statt stillschweigend herabzustufen.

**Was das für die Transaktionsgröße bedeutet.** ML-DSA-87 ist eine große Signatur: Die Signatur umfasst **4.627 Byte** und der öffentliche Schlüssel **2.592 Byte** (festgelegt durch FIPS-204). Eine hybride QoreChain-Transaktion ist daher um mehrere Kilobyte größer als eine rein klassische. Wenn Sie Transaktionen selbst erstellen und übertragen, dimensionieren Sie Ihre Puffer und Gebührenschätzungen für die zusätzlichen Bytes; QoreChains Gas-Abrechnung erwartet diese bereits. Siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing) für die Primitiven und die Anforderung der deterministischen Signierung.
