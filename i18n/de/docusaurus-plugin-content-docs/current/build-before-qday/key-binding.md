---
slug: /build-before-qday/key-binding
title: Wie Ihr Post-Quanten-Schlüssel an Ihr Konto gebunden wird
sidebar_label: Schlüsselbindung
sidebar_position: 3
---

# Wie Ihr Post-Quanten-Schlüssel an Ihr Konto gebunden wird

Jedes Tutorial in diesem Bereich verwendet neben Ihrem normalen Kontoschlüssel einen **Post-Quanten-Schlüssel**. Diese Seite erklärt in einfachen Worten, woher dieser Schlüssel kommt, woher die Chain weiß, dass er zu Ihrem Konto gehört, und wie Sie das selbst prüfen können. Zum Lesen müssen Sie nichts ausführen. Die Prüfungen unter [Selbst prüfen](#check) dauern etwa 5 Minuten.

## Die Idee in einem Bild {#picture}

```text
Wiederherstellungsphrase (oder Wiederherstellungscode)
        |
        v
beide Schlüssel ableiten
  - klassischer Schlüssel (secp256k1)
  - Post-Quanten-Schlüssel (ML-DSA-87), an Ihre Kontoadresse gebunden
        |
        v
einmal registrieren, mit einem Besitznachweis
        |
        v
jede Transaktion wird hybrid signiert (beide Schlüssel)
        |
        v
Validatoren prüfen beide Signaturen
```

## Begriffe auf dieser Seite {#words}

| Begriff | Was er bedeutet |
| --- | --- |
| Klassischer Schlüssel | Ihr normaler Kontoschlüssel (secp256k1). Er signiert jede Transaktion auf jeder Blockchain dieser Art. |
| ML-DSA-87-Schlüssel | Der Post-Quanten-Signaturschlüssel. Ein künftiger Quantencomputer soll ihn voraussichtlich nicht brechen können. |
| Wiederherstellungsphrase (Mnemonic) | Die 12 oder 24 Wörter, mit denen ein Konto wiederhergestellt wird. |
| Wiederherstellungscode | Eine Zeile, die mit `QRC1` beginnt. Sie ersetzt die Wiederherstellungsphrase für den Post-Quanten-Schlüssel, wenn Ihr Konto aus einem rohen privaten Schlüssel stammt. |
| Registrieren | Eine Transaktion, die der Chain mitteilt, welcher ML-DSA-87-Schlüssel zu Ihrem Konto gehört. |
| Besitznachweis | Eine Signatur, die zeigt, dass Sie wirklich die geheime Hälfte des Schlüssels besitzen, den Sie registrieren. |
| Hybride Signatur | Beide Signaturen auf einer Transaktion. |

## 1. Ableiten, nicht erzeugen {#derive}

Der Post-Quanten-Schlüssel wird nicht zufällig gewählt und in einer Datei abgelegt, die Sie verlieren könnten. Er wird **abgeleitet**: Dieselbe Eingabe ergibt immer denselben Schlüssel.

- **Mit einer Wiederherstellungsphrase.** Der ML-DSA-87-Schlüssel entsteht aus **derselben Wiederherstellungsphrase** wie der klassische Schlüssel, zusammen mit Ihrer Kontoadresse. Der klassische und der Post-Quanten-Schlüssel werden beide aus der Phrase neu aufgebaut, daher stellt **eine Sicherung beide wieder her**. So arbeiten QoreX und das vereinheitlichte Konto des SDK.
- **Mit einem rohen privaten Schlüssel.** Ein privater Schlüssel allein kann keinen zweiten Schlüssel liefern. Der Post-Quanten-Schlüssel wird dann aus einem eigenen **Wiederherstellungscode** erzeugt, der mit `QRC1` beginnt. Im Projekt von Workshop 1 erstellen Sie ihn mit `pnpm window recovery-code`. Im SDK heißt er `generatePqcRecoveryCode()`.

Drei Regeln für einen Wiederherstellungscode:

1. Bewahren Sie ihn **getrennt** vom privaten Schlüssel auf. Liegen beide an einem Ort, nimmt ein einziger Diebstahl beide mit.
2. Verwenden Sie für dasselbe Konto immer **denselben** Code.
3. Ein **anderer Code ergibt einen anderen Schlüssel**. Die Chain sieht dann einen Schlüssel, der nicht zu dem passt, den Sie registriert haben.

:::caution Ein Wiederherstellungscode lässt sich nicht neu aufbauen
Ein verlorener Wiederherstellungscode kann nicht wiederhergestellt werden. Schreiben Sie ihn beim Erstellen auf Papier auf. Ausgenommen sind Wegwerf-Konten im Testnet: Ein neues Konto ist in einer Minute erstellt.
:::

## 2. Einmal binden, mit einem Besitznachweis {#bind}

Binden bedeutet eine Transaktion, die pro Konto einmal gesendet wird und `MsgRegisterPQCKeyV2` heißt. Sie enthält:

- Ihren ML-DSA-87-**öffentlichen Schlüssel** (2.592 Byte) und
- einen **Besitznachweis**: Der Schlüssel signiert einen kurzen Text, der die Chain und Ihr Konto nennt. Niemand kann einen Schlüssel binden, den er nicht besitzt, und niemand kann eine Bindung von einer anderen Chain kopieren.

Dies ist die einzige Nachricht, die die Chain **nur mit der klassischen Signatur** akzeptiert. Der Grund ist einfach: Davor hat die Chain keinen Post-Quanten-Schlüssel für Ihr Konto gespeichert, also gibt es nichts, wogegen eine zweite Signatur geprüft werden könnte.

So gehen Sie vor:

| Wo | Wie |
| --- | --- |
| QoreX | Automatisch beim ersten Senden. Es kostet einmalig etwa 0,09 QOR. |
| Workshop 1 und die Beispiel-Apps | `pnpm window register` (Schritt 5 der [Workshop-1-Anleitung](/build-before-qday/workshop-1#step-5)). |
| Ihr eigener Code | `ensurePqcRegistered` aus dem SDK. |

`ensurePqcRegistered` kann gefahrlos erneut aufgerufen werden. Es liest zuerst Ihr Konto. Ist Ihr Schlüssel bereits gebunden, sendet es nichts. Ist ein **anderer** Schlüssel gebunden, bricht es mit `PqcKeyMismatchError` ab und sendet nichts. Wenn Sie eine zweite Registrierung von Hand senden, lehnt die Chain sie ab und **nimmt trotzdem die Gebühr**. Lassen Sie daher die Prüfung vom Helfer erledigen.

:::note Was die Chain heute verlangt
Die Chain prüft einen Besitznachweis, sobald einer vorhanden ist, und lehnt die Registrierung ab, wenn er sich nicht verifizieren lässt. Das SDK und QoreX fügen selbst einen bei. Im Mainnet wird eine Registrierung ohne Nachweis weiterhin akzeptiert. Im Testnet muss ab Release v3.2.8 die erste Transaktion eines neuen Kontos diese Registrierung sein. Details: [Post-Quanten-Signierung](/developer-guide/post-quantum-signing#proof-of-possession).
:::

## 3. Nach der Bindung ist alles hybrid {#hybrid}

Ab dann trägt jede native Transaktion zwei Signaturen:

- die klassische secp256k1-Signatur (64 Byte) und
- die ML-DSA-87-Signatur (4.627 Byte) in einer Erweiterung namens `PQCHybridSignature`.

Die Validatoren prüfen **beide**. Danach hält die Chain ein Ereignis `pqc_hybrid_verify` mit dem Status `verified` fest.

Ohne registrierten Schlüssel wird eine Transaktion mit `account has no PQC key and classical fallback is disabled` abgelehnt.

Transaktionen auf der EVM-Spur (zum Beispiel ein Contract-Deploy) brauchen noch etwas mehr: ein EVM-Autorisierungsfenster, das durch eine hybrid signierte Nachricht geöffnet wird. Siehe die [EVM-Fenster-Referenz](/developer-guide/evm-window-reference).

## Selbst prüfen {#check}

Sie brauchen `curl`. `jq` ist optional. Beides wird unter [Bevor Sie beginnen](/build-before-qday/prerequisites#curl-jq) behandelt.

### Ist mein Schlüssel registriert? {#check-account}

1. Ersetzen Sie `qor1...` durch Ihre eigene Adresse und führen Sie aus:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/account/qor1...
```

Was es tut: fragt den öffentlichen Testnet-Server nach dem Schlüsseleintrag Ihres Kontos.

Parameter:

- `curl`: ein Programm, das eine Webadresse abruft.
- `-s`: still, es blendet die Fortschrittsanzeige aus und zeigt nur die Antwort.
- `https://api-testnet.qore.host/qorechain/pqc/v1/account/qor1...`: die REST-Adresse des Testnets, gefolgt von Ihrem Konto.

**Was Sie sehen sollten:** Für ein registriertes Konto eine Antwort wie diese (Platzhalter, Ihre enthält echte Werte):

```json
{
  "found": true,
  "account": {
    "address": "qor1...",
    "public_key": "<base64 ML-DSA-87 public key>",
    "algorithm_id": 1,
    "algorithm_name": "dilithium5",
    "ecdsa_pubkey": "<your classical public key>",
    "key_type": "hybrid",
    "created_at_height": "<block height>",
    "migration_public_key": null,
    "migration_algorithm_id": 0,
    "classical_key_source": "auth_account",
    "possession_proven": true
  }
}
```

`found` ist `true`, wenn ein Schlüssel gebunden ist, und `false`, wenn nicht. `possession_proven` ist `true`, wenn der Schlüssel mit einem verifizierten Besitznachweis registriert wurde.

### Wurde meine Transaktion hybrid signiert? {#check-tx}

Die Prüfung aus Workshop 1, Schritt 6.

1. Ersetzen Sie `<HASH>` durch den Hash einer Ihrer Transaktionen (ohne `<` und `>`) und führen Sie aus:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Was es tut: fragt den öffentlichen Testnet-Server nach dem vollständigen Datensatz Ihrer Transaktion.

**Was Sie sehen sollten:** ein langer Textblock. Achten Sie auf drei Dinge:

1. `"code": 0` innerhalb von `tx_response`. Code 0 bedeutet Erfolg.
2. Die Erweiterung `PQCHybridSignature`, die die ML-DSA-87-Signatur enthält: **4.627 Byte**, neben der 64 Byte langen secp256k1-Signatur.
3. In `events` ein Ereignis vom Typ `pqc_hybrid_verify` mit dem Attribut `status` auf `verified`.

2. Um nur dieses Ereignis auszugeben (braucht `jq`):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Was es tut: ruft denselben Datensatz ab und leitet ihn durch `jq`, das nur das Verifizierungsereignis behält.

**Was Sie sehen sollten:** ein Ereignis, dessen Attribut `status` den Wert `verified` hat.

## Verwandte Schlüssel und Änderungen {#related}

- **Verschlüsselungsschlüssel.** ML-KEM-1024-Schlüssel, die [QoreSeal](/developer-tools/qoreseal) verwendet, um Daten an ein Konto zu verschlüsseln, liegen in einem **eigenen Register**. Sie veröffentlichen einen mit `MsgRegisterKEMKey` in einer hybrid signierten Transaktion, das Konto muss also schon seinen ML-DSA-87-Schlüssel haben.
- **Signaturschlüssel ändern.** `MsgRotatePQCKey` tauscht den ML-DSA-87-Schlüssel gegen einen neuen vom gleichen Typ aus, zum Beispiel um einen kompromittierten Schlüssel stillzulegen. `MsgMigratePQCKey` wechselt zwischen Algorithmen. Beide brauchen Signaturen des alten und des neuen Schlüssels, und die Chain lehnt einen Schlüssel ab, den das Konto früher schon benutzt hat. Beide sind im Mainnet und im Testnet aktiv. Alle Regeln: [Post-Quanten-Signierung](/developer-guide/post-quantum-signing).

## Fehlerbehebung {#troubleshooting}

| Was Sie sehen | Warum | Was zu tun ist |
| --- | --- | --- |
| `account has no PQC key and classical fallback is disabled` | Das Konto hat seinen ML-DSA-87-Schlüssel noch nicht registriert. | Registrieren Sie zuerst (`pnpm window register`, erstes Senden in QoreX oder `ensurePqcRegistered`) und senden Sie dann erneut. Prüfen Sie mit der Kontoabfrage oben. |
| `PqcKeyMismatchError` oder `registered, but NOT this key` in `pnpm window status` | Ein anderer Schlüssel ist schon gebunden. Sie haben einen anderen Wiederherstellungscode oder eine andere Phrase benutzt als beim ersten Mal. | Verwenden Sie wieder den ursprünglichen Wiederherstellungscode oder die ursprüngliche Phrase. Bei einem Wegwerf-Konto beginnen Sie mit einem neuen Konto von vorn. |
| Registrierung abgelehnt, weil bereits registriert | Das Konto besitzt schon einen Schlüssel. Eine zweite rohe Registrierung nimmt trotzdem die Gebühr. | Tun Sie nichts. Lesen Sie das Konto mit der Abfrage oben oder nutzen Sie `ensurePqcRegistered`, das zuerst prüft. |
| Sie haben Ihren Wiederherstellungscode verloren | Er lässt sich aus dem privaten Schlüssel nicht neu aufbauen. | Stammt das Konto aus einer Wiederherstellungsphrase, verwenden Sie dieselbe Phrase: Sie ergibt denselben Schlüssel. Andernfalls nutzen Sie ein neues Konto. Im Testnet kostet das nichts. |
| Die Registrierung schlägt mit einer Gebühren- oder Guthabenmeldung fehl | Das Konto hat zu wenig QOR für die Gebühr (etwa 0,09 QOR) oder die Gebühr liegt unter der Netzuntergrenze von 0,1 uqor pro Gas-Einheit. | Holen Sie QOR vom [Faucet](https://dashboard.qorechain.io/faucet), setzen Sie das Gas für eine manuelle Registrierung auf etwa 600.000 und versuchen Sie es erneut. |
| `found` ist `false`, obwohl Sie registriert haben | Sie fragen das falsche Netzwerk oder die falsche Adresse ab. | Prüfen Sie, dass Sie `api-testnet.qore.host` für das Testnet und Ihre eigene `qor1...`-Adresse verwenden. Eine Wallet kann ein anderes Netzwerk anzeigen als Ihr Projekt. |
| Das Konto antwortet mit `found: true`, aber Ihre Transaktionen schlagen fehl | Der Schlüssel on-chain ist nicht der, den Ihr Projekt ableitet. | Führen Sie `pnpm window status` aus und vergleichen Sie mit dem Wiederherstellungscode in `.env`. |

## Nächster Schritt {#next}

Gehen Sie zurück zur [Workshop-1-Anleitung](/build-before-qday/workshop-1#step-5) und registrieren Sie Ihren Schlüssel, oder lesen Sie die [Übersicht](/build-before-qday/overview).
