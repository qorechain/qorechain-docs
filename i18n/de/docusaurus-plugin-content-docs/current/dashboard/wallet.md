---
slug: /dashboard/wallet
title: Wallet
sidebar_label: Wallet
sidebar_position: 3
---

# Wallet

Auf der Seite **Wallet** sehen Sie Ihr Guthaben und Ihre Transaktionshistorie, empfangen QOR und versenden es. Wie die Seite funktioniert, hängt vom Netzwerk ab:

- **Mainnet — nicht-verwahrend (non-custodial).** Das Dashboard hält keine Mainnet-Schlüssel. Sie verbinden Ihre eigene Wallet (**Keplr** für die Native-Schiene, **MetaMask** für die EVM-Schiene), Ihr echtes Guthaben und Ihre Historie werden direkt von der Chain gelesen, und Sie können auf jeder Schiene Guthaben empfangen. Sendungen erfolgen aus Ihrer eigenen verbundenen Wallet.
- **Testnet — verwahrend (custodial).** Das Dashboard verwaltet eine Test-Wallet für Sie, sodass Sie Überweisungen, Swaps und Staking ganz ohne Einrichtung ausprobieren können. Befüllen Sie sie über den [Faucet](/dashboard/faucet).

Konten sind durch quantensichere Kryptografie geschützt, und die Native-Kodierung jeder Adresse verwendet das bech32-Präfix `qor` (`qor1...`).

## Ein Konto, drei Kodierungen {#one-account-three-encodings}

Ein QoreChain-Konto ist eine einzige Identität, die auf drei Arten geschrieben werden kann — eine pro Ausführungsschiene:

| Schiene | Kodierung | Sieht aus wie |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | z. B. `5Gv7...` |

Alle drei Kodierungen verweisen auf **dasselbe Konto und dasselbe Guthaben**. Auf jeder beliebigen Schiene empfangene Mittel landen in Ihrem einen Guthaben, und das Dashboard indexiert Guthaben und Historie über die `qor1`-Kodierung (Native), sodass die Aktivitäten aller Schienen gemeinsam angezeigt werden.

## Die Wallet im Mainnet verwenden {#mainnet}

1. Stellen Sie die Dashboard-Kopfzeile auf **Mainnet** um.
2. Akzeptieren Sie, falls Sie dazu aufgefordert werden, die [einmalige Risikobestätigung](/dashboard/overview#risk-acknowledgement) — im Mainnet werden echte Mittel bewegt, das Dashboard ist nicht-verwahrend, und Transaktionen sind unumkehrbar.
3. Wählen Sie **Connect Wallet** und dann **Keplr** (Native-Schiene) oder **MetaMask** (EVM-Schiene), und genehmigen Sie anschließend die Verbindung in Ihrer Wallet.
4. Die Seite lädt Ihr echtes Guthaben und Ihre Transaktionshistorie von der Chain.

Falls QoreChain in Ihrer Wallet noch nicht konfiguriert ist, fügen Sie es zuerst hinzu — siehe [QoreChain zu Ihrer Wallet hinzufügen](#add-network).

### Im Mainnet senden {#send-mainnet}

Da das Dashboard Ihre Mainnet-Schlüssel niemals hält, erfolgen Sendungen aus Ihrer eigenen verbundenen Wallet: Erstellen Sie die Überweisung in Keplr (Native-Schiene) oder MetaMask (EVM-Schiene) wie in jedem anderen Netzwerk und signieren Sie sie dort. Das Dashboard zeigt die Transaktion in Ihrer Historie an, sobald sie on-chain ist.

:::caution Echte Mittel, unumkehrbare Überweisungen
Mainnet-Transaktionen sind unumkehrbar. Prüfen Sie die Empfängeradresse in Ihrer Wallet immer doppelt, bevor Sie signieren.
:::

### Auf einer bestimmten Schiene empfangen {#receive-mainnet}

1. Wählen Sie **Receive**.
2. Wählen Sie im Empfangsdialog mit dem Auswahlschalter eine Schiene: **Native QOR**, **EVM** oder **SVM**.
3. Der Dialog zeigt Ihre Adresse in der Kodierung dieser Schiene (`qor1...`, `0x...` oder base58) mit einem QR-Code und einer Kopierschaltfläche.
4. Kopieren Sie die Adresse, oder lassen Sie den Absender den QR-Code scannen.

Welche Schiene der Absender auch verwendet, die Mittel kommen auf demselben Konto an — ein Konto, drei Kodierungen, ein Guthaben.

### Ihre Transaktionshistorie lesen {#history}

Im Mainnet zeigt jede Zeile in Ihrer Historie:

- Ein **Schienen-Badge** — Native, EVM oder SVM —, das angibt, welche Schiene die Transaktion verwendet hat.
- Eine **echte Transaktionstyp-Bezeichnung**, etwa *Send*, *PQC key registration* oder *contract deploy*, anstelle einer generischen Bezeichnung.
- Betrag, Zeitpunkt und Status, mit dem Transaktions-Hash, den Sie im [Explorer](/dashboard/explorer) öffnen können.

## Die Wallet im Testnet verwenden {#testnet}

Im Testnet (`qorechain-diana`) verwaltet das Dashboard eine Test-Wallet für Sie, sodass Sie Abläufe von Anfang bis Ende testen können, ohne etwas verbinden zu müssen.

### Was die Seite anzeigt

- Ihre Wallet-Bezeichnung und die aktive Adresse in verkürzter Form, mit einer Ein-Klick-Kopierschaltfläche.
- Ihr **Gesamtguthaben** in QOR.
- Ein Sicherheitspanel mit Hinweis auf quantensichere Verschlüsselung und das verbundene Netzwerk.
- Eine Anzeige der letzten Aktualisierung mit einer Aktualisierungsschaltfläche.
- Die Tabs **Assets** und **Activity** mit Ihren Beständen und Ihrer Transaktionshistorie.

Verwenden Sie die Aktualisierungsschaltfläche jederzeit, um Ihr aktuelles Guthaben und die neueste Aktivität von der Chain abzurufen.

### QOR senden (Testnet)

1. Wählen Sie **Send**.
2. Geben Sie die Empfängeradresse ein (`qor1...`).
3. Geben Sie den Betrag und optional ein Memo ein.
4. Prüfen Sie die Details und die geschätzte Gebühr und bestätigen Sie anschließend.

Während Sie einen Empfänger eintippen, werden gespeicherte Kontakte und kürzlich verwendete Adressen vorgeschlagen, um Fehler zu vermeiden. Nach dem Absenden der Überweisung erhalten Sie eine Bestätigung mit dem Transaktions-Hash, den Sie im [Explorer](/dashboard/explorer) öffnen können.

### QOR empfangen (Testnet)

1. Wählen Sie **Receive**.
2. Teilen Sie dem Absender Ihre Adresse oder deren QR-Code mit, oder kopieren Sie die Adresse mit einem Klick.
3. Geben Sie optional einen gewünschten Betrag und ein Memo ein, um einen Zahlungslink und einen herunterladbaren QR-Code zu erzeugen.

### Ihre Test-Wallets verwalten

Wählen Sie **My Wallets**, um Ihre Adressliste zu öffnen. Von dort aus können Sie zwischen Wallets wechseln, eine neue Wallet erstellen, eine bestehende importieren oder eine nicht mehr benötigte Wallet entfernen. Die aktive Wallet ist diejenige, die im Testnet für Senden, Swaps, Staking und andere signierte Aktionen im gesamten Dashboard verwendet wird.

## QoreChain zu Ihrer Wallet hinzufügen {#add-network}

Die Seite **Add Network** zeigt vier nebeneinanderliegende Karten — eine pro Verbindungsart —, damit Sie QoreChain mit einem Klick zu Ihrer eigenen Wallet hinzufügen können:

| Karte | Was sie Ihnen bietet |
| --- | --- |
| **Native** | RPC- und REST-Endpunkte sowie die Chain-ID, jeweils mit Kopierschaltfläche — für Keplr und andere Wallets der Native-Schiene. |
| **EVM** | Fertige EIP-3085-Netzwerkparameter — ein Klick fügt QoreChain zu MetaMask und anderen EVM-Wallets hinzu. |
| **SVM** | Die SVM-RPC-URL für SVM-kompatible Wallets und Tools. |
| **WalletConnect** | Eine WalletConnect-Kopplung, um jede WalletConnect-kompatible Wallet zu verbinden. |

So fügen Sie QoreChain hinzu:

1. Öffnen Sie die Seite **Add Network** im Dashboard.
2. Wählen Sie die Karte, die zur Schiene Ihrer Wallet passt.
3. Wählen Sie die Hinzufügen-Schaltfläche (EVM, WalletConnect), oder kopieren Sie die Endpunkte und die Chain-ID in das Netzwerk-hinzufügen-Formular Ihrer Wallet (Native, SVM).
4. Genehmigen Sie das neue Netzwerk in Ihrer Wallet.

Die öffentlichen Endpunkte sind `rpc.qore.host` (Native RPC), `api.qore.host` (REST), `evm.qore.host` (EVM JSON-RPC) und `svm.qore.host` (SVM RPC), mit `*-testnet`-Varianten (zum Beispiel `rpc-testnet.qore.host`) für das Testnet. Chain-IDs: Mainnet `qorechain-vladi` (EVM-Chain-ID `9801`), Testnet `qorechain-diana` (EVM-Chain-ID `9800`).

## Verwandte Themen

- [Token Operations](/user-guide/token-operations) — Konzepte hinter QOR-Überweisungen und Denominierungen.
- [Trade](/dashboard/trade) — tauschen Sie Ihre Token auf dem On-Chain-AMM.
- [Bridge](/dashboard/bridge) — bewegen Sie Assets zu und von anderen Chains.
