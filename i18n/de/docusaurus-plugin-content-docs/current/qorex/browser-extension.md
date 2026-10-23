---
slug: /qorex/browser-extension
title: QoreX Browser-Erweiterung
sidebar_label: Browser-Erweiterung
sidebar_position: 2
---

# QoreX Browser-Erweiterung

Die **Browser-Erweiterung** von QoreX ist die Desktop-QoreChain-Wallet. Sie ist eine **eigenständige Wallet** — erstellen oder importieren Sie eine Wallet, halten und senden Sie QOR und verbinden Sie sich mit dApps — und sie ist der Baustein, der jeder Website erlaubt, QoreX zu erkennen und jede Anfrage in eine explizite, entschlüsselte Genehmigung zu verwandeln.

Sie ist **live und öffentlich** in drei Stores verfügbar (Chrome, Firefox und Safari); Chrome hinkt den anderen derzeit um ein Release hinterher — siehe [welche Version wo verfügbar ist](#versions).

## Installation {#install}

| Browser | Installation |
|---|---|
| **Chrome und Chromium-Browser** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** (Firefox 140 oder neuer) | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 12 oder neuer)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Welche Version wo verfügbar ist {#versions}

Aktuelle Version in jedem Store, Stand **23. Oktober 2026**:

| Store | Aktuelle Version |
|---|---|
| Chrome Web Store | 0.3.8 |
| Firefox Add-ons | 0.3.8 |
| Safari (Mac App Store, macOS-App **QoreX Wallet**) | 1.7.8, die die Erweiterung 0.3.8 enthält — der Mac App Store verwendet seine eigene `1.x`-Nummerierung |

Store-Reviews landen zu unterschiedlichen Zeitpunkten, daher kann ein Store einen älteren Build ausliefern als ein anderer; der Store-Eintrag zeigt stets seine aktuelle Version. Diese Seite beschreibt den Funktionsumfang von 0.3.7, den jetzt jeder Store enthält (0.3.8 ist der aktuelle Build). Siehe auch [Welche Version wo verfügbar ist](/qorex/overview#versions).

Seit 0.2.6 hat die Erweiterung hinzugewonnen: [mehrere Wallets mit einem Passwort](#wallets), ein [Ethereum-artiges Konto, das Sie von Hand hinzufügen](#coin60), [Claim & restake](#stake), eine Liste **Unstaking läuft**, das [Hinzufügen eines Tokens per Vertrag](#custom-tokens), [Empfangen auf jedem Netzwerk](#receive), [Verbundene Websites mit Widerrufen](#connected-sites), das [EVM-Zugriffsfenster](#evm-window), [`signAndBroadcast` für dApps](#sign-and-broadcast) sowie Genehmigungsbildschirme, die jede Nachricht, Gebühr und Ablaufzeit anzeigen.

**Die Berechtigungsoberfläche hat sich seit 0.1.3 nicht geändert** — siehe [Welche Berechtigungen QoreX anfragt](#permissions).

:::note
Unter Safari öffnen sich Genehmigungen in einem Browser-Tab statt in einem Popup-Fenster — die Erweiterung wird mit Apples Safari-Web-Extension-Wrapper aus derselben Codebasis verpackt.
:::

## Eine Wallet erstellen oder wiederherstellen {#wallet}

Öffnen Sie das Popup und wählen Sie:

- **Neue Wallet erstellen** — wählen Sie ein Passwort (mindestens 8 Zeichen); QoreX erzeugt auf Ihrem Gerät eine frische 24-Wort-Wiederherstellungsphrase (256-Bit-Entropie), leitet Ihre QoreChain-Identität ab und versiegelt sie unter diesem Passwort (und optional einem Passkey — siehe [Sicherheit](#security)) im Tresor. Die 24 Wörter werden **einmal** angezeigt — schreiben Sie sie auf, haken Sie *Ich habe meine Wiederherstellungsphrase an einem sicheren Ort gespeichert* an und fahren Sie dann fort. Sie können sie später im Popup mit **Wiederherstellungsphrase anzeigen** erneut einblenden (Passwort erforderlich).
- **Wiederherstellungsphrase importieren** — Wiederherstellung aus einer vorhandenen Phrase. Eine Phrase mit weniger als 24 Wörtern stellt Ihr Guthaben normal wieder her, aber QoreX warnt, dass Ihr Post-Quanten-Schlüssel dann nur die Stärke der Phrase erhält; für volle Stärke erstellen Sie eine neue 24-Wort-Wallet und verschieben Ihr Guthaben dorthin.

:::danger Schreiben Sie die Phrase auf, bevor Sie fortfahren
Der Tresor der Erweiterung existiert nur in diesem Browser. **Das Entfernen der Erweiterung, das Löschen ihrer Daten oder das Zurücksetzen des Browsers löscht Ihre Schlüssel**, und niemand — auch nicht die QoreChain Association — kann sie wiederherstellen. Ohne Ihre notierten 24 Wörter ist Ihr Guthaben für immer verloren. Siehe [Jetzt sichern](/qorex/security-and-recovery#back-up-now).
:::

Die Erweiterung verwaltet ihre eigenen Schlüssel; sie benötigt nicht die mobile App. Schlüssel verlassen niemals das Gerät.

## Mehrere Wallets und Konten {#wallets}

- **Wallets** (ab 0.3.3) — der Popup-Bildschirm **Wallets** („Wallets in diesem Browser") listet jede Wallet in diesem Browser auf. Jede hat ihre eigene Wiederherstellungsphrase; **ein Passwort** entsperrt alle, und das Umschalten ändert, welche Wallet QoreX anzeigt und mit welcher es signiert (on-chain bewegt sich nichts). Eine Wallet **fügen Sie hinzu**, indem Sie eine neue erstellen (ihre Phrase wird einmal angezeigt) oder eine wiederherstellen; Ihr Passwort wird einmal abgefragt, um den Tresor neu zu versiegeln. Das Hinzufügen oder Entfernen einer Wallet schaltet die **Passkey-Entsperrung** aus — schalten Sie sie auf dem Startbildschirm wieder ein. Zum Entfernen tippen Sie auf *Aus diesem Browser entfernen* und geben Ihr Passwort ein; die letzte Wallet kann auf diesem Bildschirm nicht entfernt werden. Das Entfernen löscht diesen Schlüssel aus dem Browser — nur seine Wiederherstellungsphrase bringt ihn zurück.
- **Konten** (ab 0.2.2) — **Ihre Konten** erstellt und wechselt zwischen mehreren Konten aus derselben Phrase (bis zu 20 pro Wallet; sie sind nummeriert und können nicht umbenannt werden). Die Wiederherstellung der notierten Phrase bringt **Konto 1** zurück; die übrigen fügen Sie mit **Konto hinzufügen** erneut hinzu. Der Wechsel nimmt alles mit: Senden, Staking, Empfangen und Ihr @Handle folgen jeweils dem gerade aktiven Konto.

### Ethereum-artiges Konto {#coin60}

Ab 0.3.2 fügt **Ethereum-Konto hinzufügen (Coin 60)** (auf dem Bildschirm **Ihre Konten**) das Konto für eine Phrase hinzu, die zuerst in MetaMask oder im Dashboard verwendet wurde; siehe [Eine Phrase aus MetaMask oder dem Dashboard wiederherstellen](/qorex/getting-started#restore-dashboard). Seine 0x-Adresse ist diejenige, die MetaMask für dieselben Wörter anzeigt. Handles werden dafür nicht angeboten.

Portfolio, Q-Day Scanner, soziale Wiederherstellung, Legacy-Protokoll, Zahlungsanfragen, Konto-Anmeldung und Geräteverknüpfung bleiben nur in der mobilen App verfügbar — siehe [QoreX Wallet](/qorex/overview#platform-availability).

## Ihr Konto, Guthaben & @Handle {#account}

Der Leerlaufbildschirm des Popups zeigt Ihre `qor1…`-Adresse (zum Kopieren antippen) sowie Ihr Live-QOR-Guthaben, sodass Sie keinen Block-Explorer öffnen müssen, um beides zu prüfen.

### Vesting-Guthaben (gesperrt) {#vesting}

Wenn Ihr Konto Vesting-QOR hält (zum Beispiel eine noch nicht freigegebene TGE-Zuteilung), teilt sich das Guthaben auf in **jetzt verfügbar** und **noch gesperrt**, und eine Sendung, die den verfügbaren Betrag übersteigt, wird abgelehnt, bevor sie das Netzwerk erreicht, statt On-Chain nach Abzug einer Gebühr fehlzuschlagen. QoreX zeigt hier absichtlich **kein** „nächstes Freischaltdatum": Ein Vesting-Zeitplan kann per Governance geändert werden, sodass ein Datum auf der Guthabenkarte wie ein Versprechen wirken würde, das QoreX nicht garantieren kann. Die Aufteilung in verfügbar vs. gesperrt bleibt das, was korrekt bleibt.

### Ein @Handle beanspruchen

Das Beanspruchen eines eindeutigen **@Handles** (zum Beispiel `@liviu`) erfordert ein **angemeldetes Konto** und geschieht **in der mobilen App**; die Erweiterung verweist Sie dorthin und beansprucht Handles nicht selbst. Einmal beansprucht, wird das Handle an diese Adresse gebunden, sodass die Erweiterung es auflöst, wenn Sie es bezahlen, und andere Sie per Namen bezahlen können. Siehe [@Handle](/qorex/account-and-dashboard#handle) dazu, wie Handles an Adressen gebunden werden (nicht an eine Wallet als Ganzes).

## An ein @Handle senden {#handle-send}

Seit 0.1.9 können Sie ein registriertes @Handle direkt bezahlen, statt eine Adresse nachzuschlagen (Abfragen wurden in den Versionen bis 0.3.6 durch einen Fehler unterbrochen und funktionieren ab 0.3.7 wieder):

1. Öffnen Sie das Popup und tippen Sie auf **Senden**.
2. Geben Sie im Empfängerfeld ein `@` gefolgt vom Handle ein (zum Beispiel `@liviu`) statt einer `qor1…`-Adresse.
3. QoreX löst das Handle auf und zeigt Ihnen die **aufgelöste Adresse**, bevor Sie irgendetwas signieren — prüfen Sie diese immer gegen Ihre Erwartung.
4. Betrag eingeben und bestätigen.

Die Auflösung wird auf zwei Arten verifiziert, bevor QoreX sie verwendet: eine Registry-Attestierung, die gegen einen fest in die Erweiterung eingebauten Vertrauensschlüssel geprüft wird, sowie die eigene Signatur des Handle-Inhabers über die Beanspruchung. Eine Antwort, die eine der beiden Prüfungen nicht besteht, wird rundweg abgelehnt — QoreX greift nicht auf die Anzeige einer unverifizierten Adresse zurück. Beim ersten Mal, dass Sie ein bestimmtes Handle bezahlen, merkt sich QoreX (pinnt) die aufgelöste Adresse; wenn dieses Handle später auf eine **andere** Adresse aufgelöst wird, stoppt QoreX und zeigt Ihnen sowohl die alte als auch die neue Adresse vollständig an, damit Sie entscheiden können, ob Sie fortfahren möchten. Dieses Gedächtnis lebt **pro Browser** — wenn Sie dasselbe Handle zum ersten Mal aus einem anderen Browser oder Computer bezahlen, wird es dort ebenfalls als neu angezeigt. Das ist erwartet, kein Fehler.

## Empfangen {#receive}

Tippen Sie im Popup auf **Empfangen**, um Ihre `qor1…`-Adresse als QR-Code (mit eingebettetem QoreChain-Icon) zusammen mit einer Kopieren-Schaltfläche anzuzeigen — scannen Sie ihn von einem Telefon oder fügen Sie die Adresse direkt ein.

**Netzwerkauswahl.** Empfangen kann auch die Adresse für Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis und Celestia anzeigen, jeweils mit einem Hinweis „nur dieses Netzwerk" (QoreChain bleibt an erster Stelle).

## Aus der Erweiterung staken {#stake}

Seit **0.2.2** hat das Popup einen eigenen **Stake**-Bildschirm — eine nur in der Erweiterung erstellte Wallet benötigt nicht mehr die mobile App, um Staking-Rewards zu verdienen.

1. Öffnen Sie das Popup und wechseln Sie zu **Stake**.
2. Der Bildschirm listet aktive Validatoren mit ihrer Provision, Ihr aktuell gestaktes Gesamtguthaben sowie alle wartenden, noch zu beanspruchenden Rewards auf. Validatoren, die das Netzwerk **inhaftiert** hat, werden aus der Liste ausgeschlossen — an einen davon zu delegieren ist nie das, was Sie wollen.
3. Um zu delegieren, wählen Sie einen Validator und einen Betrag und bestätigen dann. QoreX signiert mit der obligatorischen hybriden Post-Quanten-Signatur, genau wie bei einer Sendung. Während Sie tippen, warnt es Sie, wenn der Betrag weniger als die Gebühr einer Transaktion übrig ließe (Sie könnten dann nicht unstaken oder beanspruchen, bis das Konto wieder QOR hält). Bei mehreren Konten wählen Sie über die Kontoauswahl auf dem Stake-Bildschirm, welches stakt.
4. **Beanspruchen** sammelt Rewards ein; **Claim & restake** reinvestiert sie in einer Transaktion an die Validatoren, die sie verdient haben. QoreX prüft zuvor, ob Ihr **entsperrtes** QOR die Gebühr bezahlen kann (sie wird vor dem Eintreffen der Rewards fällig), und sagt es Ihnen, falls nicht.
5. **Unstaken** startet die 21-tägige Unbonding-Periode, und der Betrag erscheint mit der verbleibenden Zeit unter **Unstaking läuft** — siehe [Staking & Delegation](/user-guide/staking-and-delegation).
6. **Stake verschieben** verschiebt Stake zu einem oder mehreren anderen Validatoren (Redelegation) — keine Unbonding-Wartezeit, keine Strafe, und Rewards fließen weiter. Siehe [Stake zwischen Validatoren verschieben](/qorex/portfolio-and-staking#move-stake).

Staking, Delegation und Rewards finden ausschließlich auf der **Native**-Lane statt, niemals über ein EVM-Precompile.

### Eine Dashboard-Staking-Anfrage genehmigen {#stake-dashboard}

Das QoreChain-[Dashboard](/dashboard/staking-and-validators) stellt Staking-Anfragen zusammen, kann sie aber nicht signieren — Ihr Schlüssel verlässt niemals den Tresor der Erweiterung. Wenn Sie im Dashboard auf **Weiter in QoreX** klicken, öffnet sich die Anfrage in der Erweiterung, damit Sie sie prüfen (Validator und Betrag) und genehmigen können, genau wie bei einer Sendung.

:::note Wenn eine Transaktion als „herabgestuft" statt erfolgreich angezeigt wird
Das Dashboard zeigt eine Transaktion gelegentlich als **herabgestuft** statt als sauberen Erfolg an. Das bedeutet, dass Ihre Gelder bewegt wurden, die Post-Quanten-Signaturschicht für diese Transaktion jedoch on-chain nicht gefunden wurde — das ist nichts, was Sie falsch gemacht haben, und nichts, was Sie von Ihrer Seite aus beheben können. Es ist ein Fehler auf unserer Seite; bitte melden Sie ihn dem Support, damit wir es untersuchen können. Die Meldung bleibt absichtlich auf dem Bildschirm stehen, statt zu verschwinden, damit Sie Zeit haben, sie zu lesen und zu melden.
:::

### Auf externen Netzwerken senden {#send-external}

Neben QOR auf der Native-Lane kann das Popup Assets auf externen Netzwerken senden, alle abgeleitet von derselben Wiederherstellungsphrase (bei EVM-Netzwerken zeigt es vor der Bestätigung die **maximale Netzwerkgebühr** an — „Netzwerkgebühr: höchstens …"):

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
| **EIP-1193** | Die Ethereum-Provider-JavaScript-API (`request(...)`, Events). | Der EVM-Provider von QoreX beantwortet Konto- und Netzwerkabfragen — `eth_requestAccounts`, `eth_accounts`, `eth_chainId` und `wallet_switchEthereumChain` (jede andere Chain liefert das Standard-`4902`). Er signiert oder sendet **noch keine** EVM-Transaktionen oder -Nachrichten: Andere Methoden liefern „EVM method … not yet supported". Verwenden Sie MetaMask oder eine andere EVM-Wallet für Transaktionen auf der EVM-Lane (die jetzt zusätzlich ein geöffnetes [EVM-Zugriffsfenster](#evm-window) benötigen). |
| **EIP-6963** | Multi-Wallet-Provider-Erkennung (announce-/request-Events). | QoreX kündigt sich selbst neben jeder anderen Wallet an — es **überschreibt niemals `window.ethereum`** — sodass der Nutzer QoreX pro Website ohne Konflikte auswählt. |
| **Native Provider (Keplr-Muster)** | `window.qorex.native`: `enable`, `getKey`, `signDirect` und `signAndBroadcast` sowie eine `capabilities`-Liste. Er ist **kein** vollständiger Keplr-Ersatz — QoreX legt keinen Alias `window.keplr` an und hat weder `getOfflineSigner`, `signAmino` noch `sendTx`. | Um eine QoreChain-Transaktion zu senden, rufen Sie **`signAndBroadcast`** auf (siehe [Eine QoreChain-Transaktion senden](#sign-and-broadcast)): QoreX zeigt die entschlüsselten Nachrichten und die Gebühr an, fügt die hybride Post-Quanten-Signatur hinzu, die nur die Wallet erzeugen kann, und überträgt. `signDirect` auf QoreChain wird abgelehnt, sofern die Transaktion nicht bereits eine gültige quantensichere Schicht trägt. |
| **Solana Wallet Standard** *(ab 0.1.5)* | Native Wallet-Erkennung für Solana-dApps (`wallet-standard:register-wallet` / `app-ready`). | Solana-dApps **erkennen QoreX automatisch** — keine benutzerdefinierte Integration nötig. Funktionen: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; Chain `solana:mainnet`; sowohl `legacy`- als auch `v0`-Transaktionen. |

:::note Direkter Zugriff auf die SVM-Lane
Dieselbe Schnittstelle ist auch unter `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`) verfügbar. Wallet-Standard-Auto-Discovery und die vollständig implementierte SVM-Lane wurden mit **0.1.5** ausgeliefert und sind sowohl in Chrome als auch in Firefox live (siehe [welche Version wo verfügbar ist](#versions)).

Solana-Genehmigungen zeigen **eine Zeile pro Instruktion**, entschlüsselt, wo QoreX das kann: SOL-Überweisungen (Empfänger und Lamports), SPL-Token-Überweisungen, **„AUSGABE Ihrer Token ERLAUBEN"** (Approve), **„KONTROLLE über das Konto ÜBERGEBEN"** (Set Authority) und das Schließen eines Token-Kontos — und sagen bei allem anderen „Instruktion, die QoreX nicht lesen kann", zusammen mit dem Programm. Eine Anfrage, die eine Approve- oder Set-Authority-Instruktion enthält, erhält die Überschrift „will Verfügungsgewalt über Ihre Solana-Token — lesen Sie jede Zeile unten". Transaktionen, die Ihre Wallet nicht als Signer auflisten, werden abgelehnt, `signMessage` signiert keine Bytes, die in Wirklichkeit eine Transaktion sind, und die Signatur wird als **klassisch** markiert — siehe [Post-Quanten-Signierung](#pqc).
:::

## Coins und Token {#custom-tokens}

Auf dem Popup-Bildschirm **Coins und Token** können Sie einen **ERC-20-Token über seinen Vertrag** hinzufügen: Netzwerk wählen, Vertragsadresse einfügen, **Vertrag prüfen**. QoreX liest Namen und Dezimalstellen des Tokens aus dem Vertrag selbst — und liest sie beim Hinzufügen im Hintergrund erneut, statt dem Popup zu vertrauen — und zeigt sie dann mit dem Hinweis an, dass jeder einen Token mit beliebigem Namen erstellen kann. Der Token erscheint danach unter **Auf externen Netzwerken senden**. Abgelehnt werden gebündelte Token, Duplikate, Nicht-EVM-Netzwerke, ungültige Adressen, nicht lesbare Verträge und Verträge, die den Namen eines gebündelten Tokens borgen.

## Verbundene Websites {#connected-sites}

**Verbundene Websites** im Popup listet jede Website auf, die diese Wallet genehmigt hat — eine Website kann die Adresse dieser Wallet sehen und Sie um eine Signatur bitten. Tippen Sie auf **Widerrufen**, um eine zu entfernen. Genehmigungen werden **pro Wallet** geführt: Eine für eine Wallet genehmigte Website kann nach dem Wechsel nicht die Adresse einer anderen Wallet lesen.

## EVM-Zugriffsfenster {#evm-window}

Der Popup-Bildschirm **EVM-Zugriffsfenster** öffnet und schließt das Fenster, das einem Ethereum-artigen (Coin 60) Konto das Senden auf der EVM-Lane von QoreChain erlaubt (v3.2.0 und neuer) — derselbe Bildschirm wie in der App, mit denselben Grenzen (bis zu 17.280 Blöcke und 1.000 Transaktionen sowie eine QOR-Obergrenze, die jeden Betrag samt seiner maximalen Gebühr zählt). Siehe [EVM-Zugriffsfenster](/qorex/security-and-recovery#evm-window).

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
- **Keine Analytics, kein Absturzbericht, kein Tracking-SDK, keine Anmeldung** — die Erweiterung braucht kein Konto, um QOR zu halten, zu senden oder zu staken. Ihre Schlüssel, Wiederherstellungsphrase, Ihr Tresor und Ihre Genehmigungen verlassen den Browser nie. Sie stellt jedoch Netzwerkanfragen: an die öffentlichen QoreChain-Endpunkte für Guthaben, Verlauf und Übertragung (diese enthalten Ihre öffentliche `qor1…`-Adresse), eine Preisabfrage (ohne Adresse), die öffentlichen Dienste jedes externen Netzwerks, das Sie halten oder ansehen (Ihre öffentliche Adresse in diesem Netzwerk), und die @Handle-Registry (das Handle oder eine öffentliche Adresse). Nur wenn Sie die [Dashboard-Kopplung](#dashboard-bridge) verwenden, sendet sie einen signierten Nachweis, dass Sie die Adresse besitzen. Siehe [Was QoreX über das Netzwerk sendet](/qorex/overview#data-and-privacy).

### Welche Berechtigungen QoreX anfragt, und warum {#permissions}

Dieser Abschnitt existiert, weil der Firefox-Eintrag die Berechtigung **„Auf Ihre Daten für alle Websites zugreifen"** anzeigt, was im Widerspruch zu einer Wallet stehen kann, die keine Host-Berechtigungen deklariert. Hier ist die exakte, ungeschönte Wahrheit aus dem Manifest.

Die `manifest.json` der Erweiterung deklariert:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
],
"web_accessible_resources": [
  { "resources": ["dist/inpage.js"], "matches": ["<all_urls>"], "use_dynamic_url": true }
]
```

- **`permissions: ["storage"]`** — die einzige API-Berechtigung. Sie speichert den verschlüsselten Tresor und Ihre Verbindungsgenehmigungen pro Ursprung **lokal** im Erweiterungsspeicher.
- **`host_permissions: []`** — QoreX deklariert **keine** Host-Berechtigungen. Es fordert nicht die Fähigkeit an, in Ihrem Namen Cross-Origin-Netzwerkanfragen an beliebige Websites zu stellen.
- **`web_accessible_resources`** — erlaubt Seiten, das eigene `inpage.js` von QoreX zu laden, das kleine Skript, das den Provider bereitstellt. `use_dynamic_url` gibt ihm eine Adresse pro Sitzung, sodass Websites die Erweiterung nicht per Abtasten identifizieren (Fingerprinting) können.
- **`content_scripts` mit Übereinstimmung `<all_urls>`** — dies ist der ehrliche Grund, warum Firefox „Auf Ihre Daten für alle Websites zugreifen" anzeigt. QoreX injiziert ein kleines Provider-Skript (`content.js` → `inpage.js`) in **jede Seite**. Ein Content-Script, das auf allen Websites läuft, *kann* technisch die Seite lesen, und Browser beschreiben diese Fähigkeit mit genau diesem Wortlaut — egal ob sie aus `host_permissions` oder aus einer Content-Script-Übereinstimmung stammt.

**Warum das Content-Script überall läuft.** Damit **jede** dApp die Wallet über EIP-6963 erkennen kann, ohne dass Sie zuvor pro Website Zugriff gewähren müssen. So funktionieren MetaMask, Keplr, Phantom und jede andere injizierte Wallet: Der injizierte Provider muss vorhanden sein, bevor die Skripte der Seite laufen (`document_start`), auf welcher Website Sie auch immer sind.

**Was dieses Skript tut — und nicht tut.** Es überbrückt ausschließlich Wallet-Nachrichten (den Provider ankündigen, Connect-/Sign-Anfragen an den Service-Worker weiterleiten, das Ergebnis zurückgeben). Es liest **nicht** über diese Wallet-Anfragen hinaus den Seiteninhalt, sendet nichts an einen Server und lädt keinen Remote-Code — und es kann keine beliebigen Cross-Origin-Daten abrufen, da keine Host-Berechtigungen vorliegen. All das ist überprüfbar: Die Erweiterung ist CSP-gesperrt, liefert keine Analytics aus, und das Firefox-Paket enthält ein reproduzierbares Quellcode-Zip.

## Eine dApp mit QoreX verbinden {#connect}

Eine dApp erkennt QoreX über **EIP-6963**. Announce-and-Request, dann den zurückgegebenen EIP-1193-Provider verwenden (er beantwortet nur Konto- und Netzwerkabfragen — siehe die Tabelle oben):

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

Für die QoreChain-**Native**-Lane verwenden Sie den Provider unter `window.qorex.native` (`enable`, `getKey`, `signAndBroadcast`, `signDirect`; lesen Sie `capabilities`, um zu sehen, was dieser Build unterstützt). Das übergeordnete [`@qorechain/connect`](/sdk/overview)-Paket kapselt diese Erkennung für Sie.

Genehmigungen sind **pro Ursprung**: Die erste Verbindung zu einer Website öffnet ein Genehmigungs-Popup, das den Ursprung anzeigt, die Genehmigung gibt nur Ihre öffentliche Adresse preis, und die Genehmigung einer Website gewährt einer anderen nichts. Genehmigungen werden pro Wallet geführt, bleiben bestehen, bis Sie sie unter **Verbundene Websites** widerrufen, und eine Website kann eine wartende Anfrage haben (insgesamt drei); das Wechseln der Wallet oder das Sperren beantwortet wartende Anfragen mit „Nein". Siehe [Was das Genehmigungsfenster zeigt](/qorex/security-and-recovery#approvals).

### Dashboard-Brücke (v0.1.5, erweitert in v0.2.2) {#dashboard-bridge}

Version 0.1.5 fügt eine Brücke hinzu, die ausschließlich auf **`dashboard.qorechain.io`** beschränkt ist: `window.qorex.native.connectProof(sessionId)` signiert den *Connect-with-QoreX*-Pairing-Beweis (das Backend verifiziert die Signatur erneut), und `executeTransfer({ to, amountUqor, memo })` genehmigt und überträgt einen vom Dashboard vorgeschlagenen QOR-Transfer und gibt den `txHash` zurück. Diese Methoden werden bei jedem anderen Ursprung abgelehnt.

**0.2.2** fügt `native:executeRequest` hinzu, das eine gesamte vom Dashboard vorgeschlagene Anfrage entgegennimmt — einschließlich [Staking](#stake-dashboard) — validiert gegen denselben gemeinsamen Parser, den QoreX überall sonst verwendet: abgelehnt bei einer Netzwerk-Fehlübereinstimmung, einem fremden Ursprung, einer Adresse, die nicht Ihnen gehört, einer unbekannten Anfrageart oder einer Staking-Anfrage, die eine `toAddress` trägt (Staking-Anfragen haben keine). Die Anfragearten sind Senden, Delegieren, Undelegieren, Redelegieren und Beanspruchen; eine Connect-Anfrage lässt Sie wählen, welches Ihrer Konten verknüpft wird, und `listAccounts()` gibt Ihre Konten zurück (nur lesend).

Da eine `qor1…`-Adresse sowohl auf dem Mainnet als auch auf dem Testnet gleichermaßen gültig ist, gibt eine vom Dashboard vorgeschlagene Anfrage an, welches Netzwerk sie anvisiert, und QoreX weigert sich, danach zu handeln, wenn dies nicht mit dem Netzwerk übereinstimmt, mit dem die Erweiterung gerade verbunden ist — sie wechselt niemals im Auftrag einer Anfrage das Netzwerk.

## Eine QoreChain-Transaktion aus einer dApp senden: `signAndBroadcast` {#sign-and-broadcast}

Jede QoreChain-Transaktion von einem Konto mit registriertem Post-Quanten-Schlüssel braucht eine hybride Signatur — secp256k1 **und** ML-DSA-87 — und nur die Wallet hält den ML-DSA-Schlüssel, sodass eine Seite sie nicht erzeugen kann. Senden Sie die Nachrichten; QoreX erledigt den Rest: Es zeigt die entschlüsselten Nachrichten und die Gebühr an, baut die Transaktion für das vom Nutzer gewählte Konto, fügt die hybride Signatur hinzu (und registriert zuvor den Post-Quanten-Schlüssel des Kontos, falls dies seine erste Transaktion ist), überträgt und liefert das Ergebnis. Verfügbar ab Erweiterung **0.3.5** und App **1.1.5** (jeder aktuelle Store-Build).

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");            // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                        // must be the wallet's active network
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],  // protobuf bytes: Uint8Array, number[] or base64
  memo: "",                                          // optional, up to 256 bytes
  gasLimit: 300000,                                  // optional
});
// → { txHash, code, height?, shield }
```

- `chainId` muss dem aktiven Netzwerk der Wallet entsprechen (`qorechain-vladi` im Mainnet). Eine dApp kann das Netzwerk nicht wechseln; nur der Nutzer kann das.
- 1–32 Nachrichten pro Aufruf; die Nachrichten-Bytes werden genau so signiert, wie sie gesendet wurden.
- Die Gebühr (`gasLimit` × der Gaspreis des Netzwerks) wird vor der Genehmigung angezeigt. Eine Ablehnung wirft `QoreX: signature rejected`.
- Die Verwaltung des Post-Quanten-Schlüssels (Registrieren, Migrieren, Rotieren — auch innerhalb von authz `MsgExec`) wird abgelehnt: Die Wallet verwaltet den Schlüssel des Kontos selbst.

## Post-Quanten-Signierung {#pqc}

Jede QOR-Überweisung, die QoreX selbst initiiert, wird mit einer **hybriden Post-Quanten-Signatur** signiert — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) zusammen mit der klassischen secp256k1-Signatur — unter Verwendung der vollständigen Hybrid-Pipeline in `@qorechain/sdk`. **Es gibt keinen Schalter dafür**: QoreChain verlangt es, und QoreX sendet niemals eine Native-Lane-QOR-Überweisung ohne diese Signatur.

- **dApp-initiierte Native-Signierung** — verwenden Sie [`signAndBroadcast`](#sign-and-broadcast): QoreX entschlüsselt jede Nachricht, zeigt die Gebühr an und fügt die quantensichere Schicht selbst hinzu. `signDirect` signiert eine Transaktion, die die Seite gebaut hat, und wird auf QoreChain **abgelehnt**, sofern diese Transaktion nicht bereits eine gültige quantensichere Schicht trägt (und für Ethereum-artige Konten, die `signAndBroadcast` verwenden, abgelehnt). QoreX signiert nie blind: Eine Anfrage, die es nicht entschlüsseln kann, wird abgelehnt, und es signiert niemals eine rein klassische QoreChain-Transaktion.
- **Klassische Signaturen werden immer gekennzeichnet** — Überweisungen auf externen Netzwerken (ETH, BNB, Solana, …) können keine Post-Quanten-Signatur tragen; QoreX lässt Sie eine explizite Bestätigung ankreuzen und markiert sie als klassisch, statt stillschweigend herabzustufen.

**Was das für die Transaktionsgröße bedeutet.** ML-DSA-87 ist eine große Signatur: Die Signatur umfasst **4.627 Byte** und der öffentliche Schlüssel **2.592 Byte** (festgelegt durch FIPS-204). Eine hybride QoreChain-Transaktion ist daher um mehrere Kilobyte größer als eine rein klassische. Wenn Sie Transaktionen selbst erstellen und übertragen, dimensionieren Sie Ihre Puffer und Gebührenschätzungen für die zusätzlichen Bytes; QoreChains Gas-Abrechnung erwartet diese bereits. Siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing) für die Primitiven und die Anforderung der deterministischen Signierung.
