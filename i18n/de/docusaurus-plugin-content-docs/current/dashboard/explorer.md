---
slug: /dashboard/explorer
title: Explorer
sidebar_label: Explorer
sidebar_position: 2
---

# Explorer

Der **Explorer** ist das schreibgeschützte Fenster zur Chain: Schlagen Sie Blöcke, Transaktionen, Adressen und Validatoren nach und beobachten Sie die Netzwerkaktivität. Er ist für alle gedacht, die eine Überweisung prüfen, ein Konto untersuchen, sehen möchten, welche Signatur eine Transaktion geschützt hat, oder sich die Validatorenmenge ansehen wollen. Es gibt zwei Explorer: den im Dashboard unter `dashboard.qorechain.io/explorer` und eine separate öffentliche App unter [explore.qore.network](https://explore.qore.network), die kein Konto benötigt. Es sind verschiedene Anwendungen, und sie wenden nicht dieselben Kennzeichnungsregeln an, daher behandelt diese Seite beide.

## Innovationen {#innovations}

- **Eine Signaturkennzeichnung nur, wenn die Chain sie verifiziert hat.** Im Dashboard-Explorer zeigt eine native Transaktion die Karte **PQC Verified** nur, wenn sie erfolgreich war (Code 0) **und** die Chain ein `pqc_hybrid_verify`-Event mit dem Status verifiziert ausgegeben hat. Eine fehlgeschlagene Transaktion erhält keine Post-Quantum-Aussage.
- **EVM-Transaktionen zeigen das Fenster, das sie autorisiert hat.** Ab der Aktivierungshöhe (Testnet 5,920,000; Mainnet 2,981,742) zeigt eine EVM-Transaktion „Authorised by a PQC window“, mit einem Link „Window opened by“ zur nativen, mit ML-DSA-87 signierten Transaktion, die es geöffnet hat. Das angezeigte Fenster ist das letzte Fenster-Öffnen des Absenders auf oder unter der Transaktionshöhe, das nicht abgelaufen ist und seither nicht geschlossen wurde. Eine EVM-Transaktion wird nie als „PQC Verified“ gekennzeichnet: Sie trägt eine gewöhnliche secp256k1-Signatur. Siehe [EVM-Autorisierungsfenster](/developer-guide/evm-development#evm-window).
- **Keine Post-Quantum-Kennzeichnung pro Block.** Blöcke werden mit Konsens-Schlüsseln signiert, daher wird der Schutz pro Transaktion angezeigt, nie pro Block.
- **Post-Quantum-Status des Validators aus der Chain.** Die Adressseite eines Validators hat ein Feld „Post-Quantum Crypto“ (Enabled, Disabled oder N/A). Enabled bedeutet, dass der Betreiber einen registrierten ML-DSA-87-Schlüssel hat. Der Besitznachweis ist on-chain optional.
- **Ein Konto, drei Schienen.** Ein `qor1...`-Verlauf führt native, EVM- und SVM-Aktivität zusammen, und die Adressseite zeigt den noch im Vesting befindlichen Betrag und das nächste Freigabedatum.
- **Netzwerkdaten und Endpunkte in einem Panel.** Chain-ID, EVM-Chain-ID, Token, Dezimalstellen, Adresspräfix, Coin-Typ, minimaler Gaspreis und kopierbare öffentliche Endpunkte, mit einem Panel „Add QoreChain to your wallet“.
- **Der eigenständige Explorer baut ausschließlich auf den öffentlichen Endpunkten auf.** [explore.qore.network](https://explore.qore.network) liest die öffentlichen Endpunkte der Chain und braucht kein Konto. Seine Adressseite zeigt die Formen `qor1`, `0x` und SVM eines Kontos mit einer Live-Paritätsprüfung (wei = uqor x 10^12; lamports = uqor x 1000), und seine Routen funktionieren als Wallet-Deep-Links.

## Verwendung {#how-to-use}

### Übersicht

Öffnen Sie **Explorer** in der Seitenleiste. Die Übersicht zeigt:

- den Netzwerkstatus mit einem Chip „Post-Quantum Secured“ (eine Kennzeichnung auf Netzwerkebene; die Aussage pro Transaktion steht auf der Transaktionsseite);
- **Latest Block**, **Block Time** und **Blocks Today**;
- **Total Bonded**, **Bonded Ratio** und **Circulating**;
- **Transactions**, **Real Txs**, **Active Set** und **Total Addresses**;
- **Latest Blocks** und **Latest Transactions**, mit Aktualisieren-Schaltflächen und automatischer Aktualisierung.

Klicken Sie auf eine Block- oder Transaktionszeile, um die zugehörige Seite zu öffnen.

### Suche

Das Suchfeld (Platzhalter „Search QoreChain (Address, Tx, Block)...“) leitet je nach Eingabe weiter:

- `qor...` öffnet die Adressseite.
- `0x...` oder eine 64-stellige Zeichenfolge öffnet die Transaktionsseite.
- Ziffern öffnen die Blockseite.

:::note Eine 0x-Adresse landet bei „Transaction Not Found“
Die Suche des Dashboards behandelt Eingaben mit `0x...` als Transaktions-Hash. Um eine EVM-Adresse nachzuschlagen, suchen Sie stattdessen nach ihrer `qor1...`-Form (eine `0x`-Adresse sind dieselben 20 Bytes wie ihre `qor1`-Form), oder verwenden Sie [explore.qore.network](https://explore.qore.network), dessen Adressseite beide akzeptiert.
:::

### Transaktionsseite

Die Transaktionsseite zeigt den Hash (mit Kopieren), Status und Typ, Block Height, Interactions (From und To), Value & Fees, Memo, Gas Consumed, bei Bedarf eine Cross-Chain-Zeile sowie **Raw Data**. Sie zeigt auch, was die Transaktion geschützt hat, und sie macht nur eine Aussage, die die Chain belegt:

- **PQC Verified.** Eine Transaktion auf der Native-Lane, die erfolgreich war und deren Hybridsignatur (einschließlich des ML-DSA-87-Anteils) die Chain selbst verifiziert hat. Eine fehlgeschlagene Transaktion oder eine ohne verifizierte Hybridsignatur zeigt stattdessen Standardsicherheit.
- **Authorised by a PQC window.** Eine EVM-Transaktion, die gesendet wurde, während der Absender ein offenes [EVM-Autorisierungsfenster](/developer-guide/evm-development#evm-window) hatte, mit dem Link **Window opened by**.

### Blockseite

Pfeile für Zurück und Vor führen durch die Chain. **Core Information** enthält die Höhe, den Hash, den Proposer, die Signaturanzahl und das verbrauchte Gas; **Technical Hashes** und **Block Transactions** folgen. Blöcke tragen keine Post-Quantum-Kennzeichnung.

### Adressseite

Eine QoreChain-Adresse ist ein Konto mit drei Kodierungen, Native (`qor1...`), EVM (`0x...`) und SVM (base58), und die Adressseite führt die Aktivität aller drei zusammen.

- **Copy address** und **Show QR Code** (ein Popover; es gibt keinen Download).
- **Total Balance** und **Available** sowie eine Zeile für den noch im Vesting befindlichen Betrag mit dem nächsten Freigabedatum.
- **Total Activity** und der kombinierte Verlauf (Methoden wie Transfer, Faucet Claim und Cross-Chain Swap).
- Auf der Adressseite eines Validators (`/explorer/address/qorvaloper1...`) das Feld **Post-Quantum Crypto**.

### Validatoren {#validators}

`/explorer/validators` listet die Validatoren des Netzwerks auf. Übersichtskarten zeigen **Active Validators**, **Bonded Tokens** und **Consensus Health** (eine Statusbezeichnung, kein gemessener Wert). Die Tabelle hat Rank, Validator, Voting Power, Commission, Status und PQC (die PQC-Spalte der Tabelle ist in jeder Zeile abgedunkelt; den tatsächlichen Status finden Sie auf der Adressseite des Validators). Das Suchfeld lautet „Search validator...“. Die Liste folgt dem in der Kopfzeile gewählten Netzwerk. Zum Delegieren siehe [Staking & Validatoren](/dashboard/staking-and-validators); für einen breiteren Vergleich mit Rendite und Anmeldung siehe [Validators](/dashboard/validators).

### Netzwerkdaten und Zur Wallet hinzufügen

Die Übersicht enthält die Chain-Daten und die öffentlichen Endpunkte, jeweils kopierbar, sowie dasselbe Panel **Add QoreChain to your wallet** wie die Wallet-Seite (siehe [QoreChain zu Ihrer Wallet hinzufügen](/dashboard/wallet#add-network)).

### Eigenständiger Explorer {#standalone-explorer}

[explore.qore.network](https://explore.qore.network) ist eine separate Web-App nur für den Explorer. Sie öffnet sich im **Mainnet** und hat in ihrer Kopfzeile einen Umschalter **Testnet / Mainnet**. Routen:

| Route | Was sie zeigt |
| --- | --- |
| `/` | Live-Höhe, Status, Supply, gebondeter Stake, neueste Blöcke und Transaktionen, Chain-Daten, öffentliche Endpunkte und Links zu Anleitungen. |
| `/blocks`, `/block/{height}` | Blockliste und ein Block mit seinen Transaktionen. |
| `/txs`, `/tx/{hash}` | Transaktionsliste und eine Transaktion mit Status, Gebühr, Gas, Nachrichten und der Rohantwort. |
| `/address/{qor1... or 0x...}` | Die einheitliche Identitätsseite mit den drei Kodierungen und der Paritätsprüfung. `/account/*` leitet auf `/address/*` um. |
| `/validators`, `/validator/{address}` | Die Validatorenmenge mit Voting Power und Provision sowie ein einzelner Validator. |
| `/tokens`, `/token/{denom}`, `/assets` | Token- und Asset-Listen. |
| `/contracts`, `/nfts`, `/collections` | Contracts, NFTs und Collections. |

Die Suche akzeptiert eine Blockhöhe, einen 64-stelligen Hex-Hash (mit oder ohne `0x`), eine `qor1...`- oder `0x...`-Adresse oder eine `qorvaloper1...`-Adresse. Eine Suche nach `qorvaloper1...` öffnet die Validatorenliste, nicht die Seite dieses Validators. Ein Abschnitt **Add to wallet** bietet suggestChain (Keplr, Leap, Cosmostation), EIP-3085 (MetaMask und andere EVM-Wallets), SVM-Anleitungen für einen benutzerdefinierten RPC und die Kopplung per WalletConnect v2.

Die Routen `/tx/`, `/block/` und `/address/` funktionieren mit EIP-3085-Block-Explorer-Links, sodass Wallets, die eine Explorer-URL öffnen, auf der richtigen Seite landen.

:::caution Verwenden Sie /api/lcd des Explorers nicht aus Code
Der eigenständige Explorer hat einen schreibgeschützten Proxy unter `/api/lcd/...`, der seine eigenen Seiten bedient und gemäß dem Netzwerk-Cookie des Browsers antwortet. Er ist keine öffentliche API: Er kann sich ändern, ist nicht für programmatische Nutzung ratenbegrenzt geplant und liefert das Netzwerk, das das Cookie nennt. Verwenden Sie für Skripte, Dienste und Wallets stattdessen die öffentlichen REST-Endpunkte: `https://api.qore.host` (Mainnet) und `https://api-testnet.qore.host` (Testnet). Siehe [REST- & gRPC-Endpunkte](/api-reference/rest-grpc-endpoints).
:::

:::note Der eigenständige Explorer wendet die PQC-Kennzeichnungsregeln des Dashboards noch nicht an
Die Regeln unter [Innovationen](#innovations) (eine Post-Quantum-Kennzeichnung erst nach Verifikation durch die Chain und die Karte „Authorised by a PQC window“ für EVM-Transaktionen) sind im Dashboard-Explorer live. Der eigenständige Explorer unter explore.qore.network wurde dafür noch nicht aktualisiert: Seine Transaktionsseite zeigt eine Markierung für Hybridsignaturen, die eine fehlgeschlagene Transaktion noch nicht unterscheidet, und er kennzeichnet EVM-Transaktionen mit seiner älteren Formulierung. Betrachten Sie die Kennzeichnungen des Dashboard-Explorers als Referenz.
:::

## Zugang {#how-to-access}

- **Dashboard-Explorer:** [dashboard.qorechain.io/explorer](https://dashboard.qorechain.io/explorer). Wählen Sie das Netzwerk in der Kopfzeile. Die **Übersicht** im Mainnet erfordert eine Anmeldung und den [einmaligen Hinweis](/dashboard/overview#risk-acknowledgement); die Übersicht im Testnet und **alle Detailseiten** (Transaktion, Block, Adresse, Validatoren) öffnen sich in beiden Netzwerken ohne Konto.
- **Eigenständiger Explorer:** [explore.qore.network](https://explore.qore.network). Kein Konto, keine Wallet. Verwenden Sie den Umschalter in der Kopfzeile für das Testnet.
- **Kosten:** kostenlos. Zum Lesen ist keine Wallet-Verbindung nötig.

## Wo veröffentlicht {#where-published}

| Oberfläche | Adresse | Netzwerke | Konto |
| --- | --- | --- | --- |
| Dashboard-Explorer | `dashboard.qorechain.io/explorer` (`/explorer/tx/<hash>`, `/explorer/block/<height>`, `/explorer/address/<address>`, `/explorer/validators`) | Mainnet und Testnet, Schalter in der Kopfzeile | Nur die Übersicht im Mainnet |
| Eigenständiger Explorer | `explore.qore.network` | Mainnet (Standard) und Testnet-Umschalter | Keines |
| Chain-Daten | `api.qore.host`, `api-testnet.qore.host` (REST), `rpc.qore.host`, `rpc-testnet.qore.host` (RPC) | Mainnet und Testnet | Keines |

## Grenzen und bekannte Probleme {#limits}

- **Eine in die Suche des Dashboards eingegebene `0x`-Adresse** landet bei „Transaction Not Found“. Verwenden Sie die `qor1...`-Form.
- **Die PQC-Spalte** in der Validatorentabelle des Dashboards ist immer abgedunkelt. Den tatsächlichen Status eines Validators finden Sie auf seiner Adressseite.
- **Nicht angezeigt:** ein Zähler für die Fensternutzung pro Transaktion, Post-Quantum-Beweise für Blöcke und ein Post-Quantum-Flag pro Validator in der Validatorentabelle.
- **Der eigenständige Explorer** hat die Kennzeichnungsregeln des Dashboards noch nicht übernommen (siehe oben), und eine Suche nach `qorvaloper1...` öffnet die Validatorenliste.
- **/api/lcd des eigenständigen Explorers** ist für die Website selbst gedacht, nicht für Programme.
- **Das Netzwerk folgt der Kopfzeile** im Dashboard-Explorer: Ein Hash aus dem anderen Netzwerk zeigt „not found“.
