---
slug: /dashboard/overview
title: Dashboard-Überblick & Erste Schritte
sidebar_label: Überblick & Erste Schritte
sidebar_position: 1
---

# Dashboard-Überblick & Erste Schritte

Das QoreChain Dashboard unter **[dashboard.qorechain.io](https://dashboard.qorechain.io)** ist die offizielle Web-App, um QoreChain aus dem Browser zu nutzen. Ein Konto und ein Netzwerk-Schalter geben Ihnen den Explorer, eine Wallet-Ansicht, einen Testnet-Faucet, einen Swap-Bildschirm für Test-Token, Quests, KI-Contract-Tools, Node- und Validator-Tooling sowie eine Entwicklerseite. Es ist für alle gedacht, die das Netzwerk ausprobieren möchten, ohne etwas zu installieren, und für Entwickler, die während der Arbeit schnelle Prüfungen brauchen. Es wird nichts installiert: Das Dashboard läuft in Ihrem Browser.

Dieser Abschnitt ist eine Anleitung für Nutzer: was jede Seite tut, wie man sie öffnet und welche Grenzen sie hat.

## Innovationen {#innovations}

- **Ein Schalter legt das Netzwerk für jede Seite fest.** Der Schalter **Testnet / Mainnet** in der Kopfzeile speichert Ihre Wahl im Browser und lädt die Seite neu, sodass Server und Browser dasselbe Netzwerk lesen. Mainnet ist der Standard.
- **Mainnet ist non-custodial.** Das Dashboard hält niemals Mainnet-Schlüssel und signiert niemals eine Mainnet-Transaktion. Es übergibt QoreX nur die Parameter einer Sende- oder Staking-Aktion, und QoreX baut die Transaktion neu auf, zeigt sie an, signiert sie (hybride ML-DSA-87-Signatur) und sendet sie. Das Dashboard erfährt nur den Transaktions-Hash.
- **Mainnet-Ansichten brauchen ein Konto; das Testnet ist offen.** Im Mainnet prüfen die Startseiten-Statistiken, die Wallet, Trade und die Explorer-Übersicht den Zugriff auf dem Server. Ein abgemeldeter Besucher sieht „Sign in to view mainnet“.
- **Eine Bestätigung zu echten Mitteln, einmal pro Browser.** Vor der ersten Mainnet-Ansicht von Wallet, Trade, Explorer-Übersicht oder Startseiten-Statistiken listet eine Karte mit dem Titel „You're entering QoreChain Mainnet“ vier Punkte auf: Das Dashboard ist non-custodial, Transaktionen sind endgültig und unumkehrbar, es besteht das Risiko eines Totalverlusts und nichts hier ist eine Finanzberatung, und Testnet-QOR ist niemals tauschbar. Die Bestätigung wird in Ihrem Browser gespeichert, nicht in Ihrem Konto.
- **Ein Konto, drei Kodierungen.** Dasselbe Konto wird als `qor1...`-Adresse, als `0x...`-Adresse und als SVM-Base58-Adresse gezeigt, und das Dashboard liest Guthaben und Verlauf einmal über `qor1...`.

## Verwendung {#how-to-use}

### Das Layout

**Kopfzeile.** Der Netzwerk-Schalter, dann **Sign In** oder ein Profilmenü (Profile, Edit Profile, Theme, Language, Rewards, Referral, Docs, Log out).

**Desktop-Seitenleiste, der Reihe nach:**

| Eintrag | Seite | Was es ist |
| --- | --- | --- |
| **Discover** | `/` | Startseite: Hero-Schaltflächen **Create Smart Contract** und **Explore Network**, Zähler unter „Dashboard Overview“, Listen erstellter Contracts, neuester öffentlicher Audits und Top-Contributors sowie ein „Developer Toolkit“ mit **Start Generating**, **New Audit** und **Claim Tokens**. |
| **Public Sale** | `/public-sale` | Bestehende Teilnehmer sehen ihre Zuteilung, den Vesting-Zeitplan und den Claim. |
| **Wallet** | [Wallet](/dashboard/wallet) | Guthaben, Verlauf, Empfangen und (Mainnet) Senden und Staken über QoreX. |
| **Faucet** | [Faucet](/dashboard/faucet) | Kostenlose Testnet-Token. |
| **Explorer** | [Explorer](/dashboard/explorer) | Blöcke, Transaktionen, Adressen und Validatoren. |
| **Trade** | [Trade](/dashboard/trade) | Swap-Bildschirm für Test-Token. |
| Gruppe **Earn** | [Quests](/dashboard/quests) | Quests, Leaderboard, Badges. |
| **Games** | [Quests](/dashboard/quests#games) | Die QoreChain Arcade. |
| Gruppe **Build** | [Smart Contract Creator](/dashboard/smart-contract-creator), [Contract Auditor](/dashboard/contract-auditor), [Nodes & Validators](/dashboard/tools-hub) (`/tools`), [Developers](/dashboard/developers) | Contract-Tools, die Betreiberseite (fünf Tabs: Validator Program, Validator Application, Light Node, Node Registration, Rollups) und die öffentliche Entwicklerseite (sechs Tabs: SDKs, PQ key status, Simulator, Signing playground, QoreX test wallet, AI agents (MCP)). Der Eintrag Nodes & Validators hieß früher „Tools“; sein SDK-Tab ist zu Developers umgezogen. |
| **FAQ** | `/faq` | Hilfe in der App. Teile davon sind veraltet; dieses Handbuch ist die Referenz. |

Die Seite [Validators](/dashboard/validators) (`/validators`) hat keinen Link in der Seitenleiste; öffnen Sie sie über die Adresse.

**Mobil.** Eine untere Leiste (Discover, Wallet, Faucet, dann Explorer, Trade, Quests) plus ein zentrales Fächermenü mit dem Rest.

### Anmelden {#sign-in}

Das Dashboard hat zwei Ebenen: ein **Dashboard-Konto**, mit dem Sie sich anmelden, und die **Wallet**, die Sie damit verbinden. Zum Durchsuchen ist nie eine Wallet nötig.

- **Vor dem Laden der Seite zur Anmeldung weitergeleitet:** Profile, [Wallet](/dashboard/wallet), Rewards, Referral, [Quests](/dashboard/quests), [Trade](/dashboard/trade), [Faucet](/dashboard/faucet), Connection, Contracts, Public Sale und jede gespeicherte Contract-Seite `/smart-contract-creator/<id>`.
- **Zeigt einen Bildschirm „Authentication Required“, wenn Sie abgemeldet sind:** [Nodes & Validators](/dashboard/tools-hub), [Validators](/dashboard/validators), FAQ, [AI Audit](/dashboard/contract-auditor), Badges, Leaderboard und Games.
- **Ohne Konto geöffnet:** die Discover-Startseite, die Detailseiten des [Explorers](/dashboard/explorer) (Transaktion, Block, Adresse, Validatoren) in beiden Netzwerken, die Explorer-Übersicht im Testnet, die Startseite des [Smart Contract Creator](/dashboard/smart-contract-creator) (eine kostenlose Generierung), die Audit-Liste unter `/audits` und öffentliche Audit-Berichte sowie die Seite [Developers](/dashboard/developers).
- **Mainnet im abgemeldeten Zustand:** Seiten, die Mainnet-Daten zeigen (Startseiten-Zähler, Wallet, Trade, die Explorer-Übersicht), zeigen „Sign in to view mainnet“ und eine Schaltfläche **Sign In**.

### Wählen Sie Ihr Netzwerk {#select-network}

Die Kopfzeile zeigt das Netzwerk, auf dem Sie sind, und lässt Sie wechseln. Die Wahl wird in Ihrem Browser gespeichert.

| Netzwerk | Chain-ID | Wann es zu verwenden ist |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Live-Netzwerk (live seit dem 7. Juni 2026, läuft seit dem 23. Oktober 2026 mit Chain v3.2.4) für echten Wert. Non-custodial: Sie verbinden Ihre eigene Wallet. |
| **Testnet** | `qorechain-diana` | Kostenlose Umgebung (läuft seit dem 27. Oktober 2026 mit Chain v3.2.6) mit einer vom Dashboard verwalteten Test-Wallet und dem [Faucet](/dashboard/faucet). |

Das native Token ist **QOR** (Basiseinheit `uqor`, 1 QOR = 10^6 uqor). Wenn Sie neu sind, beginnen Sie im Testnet, beantragen Sie Token beim Faucet und probieren Sie eine erste Überweisung aus, bevor Sie zum Mainnet wechseln.

Einige Seiten ignorieren den Schalter: Der Faucet zahlt immer im Testnet aus, [Trade](/dashboard/trade) zeigt immer Testnet-Inhalte, und Quests, Badges, Leaderboard, Games, Public Sale und FAQ hängen nicht vom Netzwerk ab.

### Verbinden Sie Ihre Wallet {#connect-your-wallet}

- **Mainnet ist non-custodial.** Verbinden Sie **QoreX** (die offizielle QoreChain-Wallet, Extension oder App), **Keplr** oder **MetaMask**. Senden und Staken auf der Native-Schiene erfordern QoreX, da QoreChain-Konten mit einer hybriden Post-Quanten-Signatur signieren, die heute nur QoreX erzeugt. Keplr verbindet sich, um auf der Native-Schiene anzuzeigen und zu empfangen. MetaMask verbindet sich auf der EVM-Schiene; das Senden dort erfordert zusätzlich den Post-Quanten-Schlüssel des Kontos und ein geöffnetes EVM-Fenster, das aus QoreX heraus geöffnet wird (siehe [Senden mit MetaMask](/dashboard/wallet#send-metamask)).
- **Testnet ist custodial.** Das Dashboard verwaltet eine Test-Wallet für Sie, sodass nichts zu installieren ist und kein echter Wert auf dem Spiel steht.

#### Mit QoreX verbinden (empfohlen) {#connect-qorex}

1. Öffnen Sie [dashboard.qorechain.io](https://dashboard.qorechain.io) und stellen Sie sicher, dass die Kopfzeile **Mainnet** anzeigt.
2. Wenn dies Ihr erster Besuch einer Mainnet-Seite in diesem Browser ist, akzeptieren Sie den [einmaligen Risikohinweis](#risk-acknowledgement).
3. Öffnen Sie **Wallet** (Sie müssen angemeldet sein) und wählen Sie auf der Karte **QoreX wallet** die Option **Connect with QoreX**.
4. Wenn die QoreX-Browser-Extension erkannt wird und keine Methode gespeichert ist, fragt das Dashboard „How do you want to connect?“ mit **Browser extension** und **QoreX app**. Die Wahl wird gespeichert. Wird keine Extension erkannt, geht es direkt zum App-Ablauf.
   - **Browser extension:** Das Popup der Extension zeigt `dashboard.qorechain.io` als anfragende Seite. Bestätigen Sie es; damit wird ein einmaliger Nachweis signiert, dass Ihnen Ihre `qor1...`-Adresse gehört. Es werden keine Mittel bewegt.
   - **QoreX app:** Das Dashboard zeigt einen QR-Code und **Open QoreX**. Scannen oder tippen Sie ihn an, prüfen Sie die Kopplungsanfrage in QoreX und bestätigen Sie mit Ihrer Biometrie. Das Dashboard fragt im Hintergrund ab („Waiting for approval in QoreX...“) und schließt von selbst ab.
   - Ein Link **Use a different method** erscheint nur, solange eine Kopplung aussteht.
5. Nach der Bestätigung zeigt das Dashboard Ihre `qor1...`-Adresse an und schaltet die Aktionen frei, die eine Signatur benötigen.

Siehe [Wallet](/dashboard/wallet#mainnet) für die vollständige Anleitung zum Verbinden und Senden sowie die Seite [Account & Dashboard](/qorex/account-and-dashboard#dashboard) in der QoreX-Dokumentation für die Wallet-seitige Sicht derselben Kopplung.

#### Mit Keplr oder MetaMask verbinden

1. Öffnen Sie **Wallet**, mit der Kopfzeile auf **Mainnet** und akzeptiertem Hinweis.
2. Wählen Sie unter **or connect another wallet** die Option **Connect Keplr** oder **Connect MetaMask**.
3. Bestätigen Sie die Verbindung in Ihrer Wallet. Wenn Ihre Wallet QoreChain noch nicht kennt, siehe [QoreChain zu Ihrer Wallet hinzufügen](/dashboard/wallet#add-network).

Sobald verbunden, zeigt die Wallet-Seite Ihre Adresse mit Guthaben und Verlauf an. Siehe [Wallet Setup](/getting-started/wallet-setup) für eine Anleitung zur Ersteinrichtung.

### Einmaliger Risikohinweis {#risk-acknowledgement}

Die Karte mit dem Hinweis erscheint vor der ersten Mainnet-Ansicht von **Wallet**, **Trade**, **Explorer-Übersicht** oder **Startseiten-Statistiken** in einem Browser. Sie ist nicht für jede Mainnet-Seite erforderlich: Die Detailseiten des Explorers, der Creator und die anderen Seiten öffnen sich ohne sie. Akzeptieren Sie sie einmal pro Browser; das Löschen der Browserdaten zeigt sie erneut an.

## Zugang {#how-to-access}

- **URL:** [dashboard.qorechain.io](https://dashboard.qorechain.io), in jedem aktuellen Browser. Keine Installation.
- **Konto:** Anmeldung per E-Mail oder über einen unterstützten Identitätsanbieter auf der Anmeldeseite. Welche Seiten es erfordern, ist unter [Anmelden](#sign-in) aufgeführt.
- **Netzwerke:** Mainnet `qorechain-vladi` und Testnet `qorechain-diana`, mit dem Schalter in der Kopfzeile. Mainnet ist der Standard.
- **Wallet:** keine zum Durchsuchen. QoreX für Senden und Staken im Mainnet, Keplr oder MetaMask zum Anzeigen und Empfangen. Im Testnet erstellt das Dashboard eine Test-Wallet für Sie.
- **Kosten:** Das Dashboard ist kostenlos nutzbar. On-Chain-Aktionen zahlen die Netzwerkgebühr (Untergrenze 0,1 uqor pro Gas). Einige kostenpflichtige Angebote sind auf ihren eigenen Seiten beschrieben (die Light-Node-Lizenz und die Gebühr des Validator-Programms unter [Nodes & Validators](/dashboard/tools-hub)).
- **Early-Access-Sperre:** heute keine. Mainnet-Seiten brauchen nur die Anmeldung (wo oben aufgeführt) und den einmaligen Hinweis.

## Wo veröffentlicht {#where-published}

| Oberfläche | Adresse | Netzwerke | Anmeldung |
| --- | --- | --- | --- |
| Dashboard | [dashboard.qorechain.io](https://dashboard.qorechain.io) | Mainnet und Testnet | Je Seite, siehe [Anmelden](#sign-in) |
| Eigenständiger Explorer | [explore.qore.network](https://explore.qore.network) (eine separate App, siehe [Explorer](/dashboard/explorer#standalone-explorer)) | Mainnet und Testnet | Keine |
| Öffentliche Endpunkte | `rpc.qore.host`, `api.qore.host`, `evm.qore.host`, `svm.qore.host`, mit `*-testnet`-Varianten | Mainnet und Testnet | Keine |

Seiten dieses Abschnitts: [Explorer](/dashboard/explorer), [Wallet](/dashboard/wallet), [Trade](/dashboard/trade), [Bridge](/dashboard/bridge), [Smart Contract Creator](/dashboard/smart-contract-creator), [Contract Auditor](/dashboard/contract-auditor), [Staking & Validatoren](/dashboard/staking-and-validators), [Validators](/dashboard/validators), [Faucet](/dashboard/faucet), [Quests, Badges, Leaderboard und Games](/dashboard/quests), [Nodes & Validators](/dashboard/tools-hub) und [Developers](/dashboard/developers).

## Grenzen und bekannte Probleme {#limits}

- **Es gibt keinen Bridge-Bildschirm.** Siehe [Bridge](/dashboard/bridge).
- **Trade folgt nicht dem Netzwerk-Schalter.** Es zeigt Testnet-Inhalte, auch wenn die Kopfzeile auf Mainnet steht. Siehe [Trade](/dashboard/trade).
- **Die FAQ in der App ist eine kurze Hilfeseite.** Wo sie und dieses Handbuch voneinander abweichen, folgen Sie diesem Handbuch.
- **Noch nicht live:** der Transaction inspector auf der Developers-Seite und der MCP-Server (die Developers-Seite weist darauf hin, dass er nicht veröffentlicht ist).
- **Mainnet-Einschränkungen.** Staking, Senden und Contract-Deployments im Mainnet sind je Seite beschrieben; mehrere Abläufe (Native- oder SVM-Deployments, Redelegation, zeitgesperrtes Staking) werden im Dashboard nicht angeboten.
- **Das Testnet hat keinen echten Wert.** Senden Sie niemals echte QOR an eine Testnet-Adresse: Die Formate sind identisch. Siehe [Wallet](/dashboard/wallet#testnet).

:::tip Neu bei QoreChain?
Folgen Sie [Verbindung zum Testnet](/getting-started/connecting-to-testnet) und [Ihre erste Transaktion](/getting-started/first-transaction), um schnell praktische Erfahrung zu sammeln, und kehren Sie dann zurück, um den Rest des Dashboards zu erkunden.
:::
