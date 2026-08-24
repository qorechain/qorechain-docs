---
slug: /user-guide/deploying-rollups
title: Rollups bereitstellen
sidebar_label: Rollups bereitstellen
sidebar_position: 6
---

# Rollups bereitstellen

Diese Anleitung beschreibt, wie Sie anwendungsspezifische Rollups auf QoreChain mit dem Rollup Development Kit (RDK) bereitstellen. Das RDK bietet voreingestellte Profile für gängige Anwendungsfälle sowie vollständige Anpassungsmöglichkeiten für fortgeschrittene Deployments.

:::caution
Das RDK und die Rollup-Abwicklungsschicht sind eine sich aktiv weiterentwickelnde Fähigkeit. Betrachten Sie die Parameter, Presets und den Reifegrad der einzelnen unten aufgeführten Funktionen als veränderlich und validieren Sie Deployments auf **`qorechain-diana`**, bevor Sie das Mainnet anvisieren.
:::

:::note
Die folgenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 live und läuft mit Chain-Version **v3.1.92** — ersetzen Sie beim Deployment auf dem Mainnet die Chain-ID und die Endpunkte anhand der Seite **Connecting to Mainnet**.
:::

---

## Übersicht

Das QoreChain-RDK ermöglicht Entwicklern den Start souveräner Rollups, die auf QoreChain abgewickelt werden. Jeder Rollup ist eine eigenständige Ausführungsumgebung mit eigener Blockzeit, virtueller Maschine und eigenem Gebührenmodell, während er gleichzeitig die Sicherheits- und Datenverfügbarkeitsgarantien von QoreChain erbt.

---

## Voreingestellte Profile

Das RDK wird mit fünf voreingestellten Profilen ausgeliefert, die jeweils auf eine gängige Anwendungskategorie zugeschnitten sind:

| Profil        | Abwicklung (Nachweis)  | Sequenzer | DA              | Gasmodell    | VM       | Vorgesehener Anwendungsfall |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicated | native          | EIP-1559     | EVM      | DeFi-/AMM-Anwendungen (Lending, DEXs, Derivate) |
| **gaming**     | based               | based     | native          | flat         | custom   | Hochdurchsatz-Spielzustände und Echtzeiterlebnisse |
| **nft**        | optimistic (fraud)  | dedicated | native (Celestia DA geplant) | standard | CosmWasm | NFT-Minting- und Marktplatz-Workloads |
| **enterprise** | based               | based     | native          | subsidized   | EVM      | Berechtigte und Konsortial-Deployments mit gesponserten Gebühren |
| **custom**     | fully parameterized | fully parameterized | fully parameterized | fully parameterized | fully parameterized | Jedes Feld selbst festlegen |

:::note
Die oben genannten Werte je Preset entsprechen den ausgelieferten Profil-Standardwerten von `@qorechain/rdk`. Die genaue Konfiguration kann sich im Zuge der Weiterentwicklung des RDK ändern — fragen Sie die maßgeblichen Werte mit `qorechaind query rdk config` ab (oder `RdkClient.params()`), und beachten Sie, dass die `based`-Abwicklung immer mit dem `based`-Sequenzer-Modus gepaart ist.
:::

---

## Voraussetzungen

Stellen Sie vor der Bereitstellung eines Rollups sicher, dass Sie die folgenden Voraussetzungen erfüllen:

| Anforderung       | Details                                                                                |
| ----------------- | -------------------------------------------------------------------------------------- |
| **Mindesteinsatz** | 10.000 QOR (10.000.000.000 uqor)                                                       |
| **Erstellungs-Burn** | 1 % des eingesetzten Betrags werden bei der Rollup-Erstellung dauerhaft verbrannt                       |
| **Konto**       | Ein finanziertes QoreChain-Konto mit ausreichendem Guthaben für den Einsatz zuzüglich Transaktionsgebühren |

---

## Einen Rollup aus einem Preset erstellen

Stellen Sie einen Rollup mithilfe eines der voreingestellten Profile bereit:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-defi-rollup" \
  --profile defi \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Beispiel:** Einen Gaming-Rollup bereitstellen:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "battle-arena" \
  --profile gaming \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Einen benutzerdefinierten Rollup erstellen

Für die volle Kontrolle über die Rollup-Parameter verwenden Sie das Profil `custom` und legen jede Option einzeln fest:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-rollup" \
  --profile custom \
  --settlement optimistic \
  --sequencer dedicated \
  --da-backend native \
  --vm-type evm \
  --block-time 1000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Benutzerdefinierte Parameter:**

| Parameter      | Optionen                                       | Beschreibung                        |
| -------------- | --------------------------------------------- | ---------------------------------- |
| `--settlement` | `optimistic`, `zk`, `based`, `sovereign`      | Wie Zustandsübergänge verifiziert werden |
| `--sequencer`  | `dedicated`, `shared`, `based`                | Strategie zur Transaktionsreihenfolge      |
| `--da-backend` | `native`, `external`                          | Datenverfügbarkeits-Schicht            |
| `--vm-type`    | `evm`, `cosmwasm`, `custom`                   | Ausführungsumgebung              |
| `--block-time` | Ganzzahl (Millisekunden)                        | Angestrebtes Blockproduktionsintervall   |

---

## Batches einreichen

Rollup-Betreiber reichen Transaktions-Batches zur Abwicklung bei QoreChain ein:

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root <hex_encoded_state_root> \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Beispiel:**

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root a1b2c3d4e5f6... \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Verwaltung des Rollup-Lebenszyklus

Rollup-Betreiber können den Lebenszyklus ihrer Deployments verwalten:

1. **Einen Rollup pausieren** — Die Blockproduktion vorübergehend anhalten. Der Rollup-Zustand bleibt erhalten und kann fortgesetzt werden.

   ```bash
   qorechaind tx rdk pause-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

2. **Einen Rollup fortsetzen** — Die Blockproduktion eines pausierten Rollups fortsetzen:

   ```bash
   qorechaind tx rdk resume-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

3. **Einen Rollup stoppen (dauerhaft)** — Einen Rollup dauerhaft stoppen. Diese Aktion ist **unumkehrbar**.

   ```bash
   qorechaind tx rdk stop-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

:::danger
Das Stoppen eines Rollups ist endgültig. Der gesamte zugehörige Zustand wird archiviert, aber der Rollup kann nicht neu gestartet werden. Der eingesetzte QOR-Betrag (abzüglich des Erstellungs-Burns) wird an den Betreiber zurückerstattet.
:::

---

## Rollups abfragen

Details zu einem bestimmten Rollup abrufen:

```bash
qorechaind query rdk rollup <rollup_id>
```

Alle Rollups auf QoreChain auflisten:

```bash
qorechaind query rdk rollups
```

**Beispielausgabe:**

```yaml
rollup:
  id: "my-defi-rollup"
  owner: qor1abc...xyz
  profile: defi
  settlement: zk
  vm_type: evm
  block_time: 500ms
  status: active
  total_batches: 1247
  last_state_root: "a1b2c3d4..."
```

---

## QCAI-gestützter Profilvorschlag

Nicht sicher, welches Profil zu Ihrem Anwendungsfall passt? Nutzen Sie das QCAI-gestützte Vorschlagstool:

```bash
qorechaind query rdk suggest-profile --use-case "defi lending protocol"
```

**Beispielausgabe:**

```yaml
suggested_profile: defi
confidence: 0.94
reasoning: "DeFi lending protocols benefit from ZK settlement for fast finality, EVM compatibility for Solidity smart contracts, and EIP-1559 fee model for predictable gas costs."
alternative_profile: enterprise
```

Dieser Befehl analysiert Ihre Beschreibung und empfiehlt das am besten geeignete voreingestellte Profil samt Begründung.

---

## Tipps

* Beginnen Sie mit einem voreingestellten Profil und passen Sie es später an. Presets sind für ihre jeweiligen Zielanwendungsfälle optimiert.
* Der 1 %ige Erstellungs-Burn ist eine einmalige Gebühr, die bei der Bereitstellung auf den Mindesteinsatz angewendet wird.
* Verwenden Sie die `based`-Abwicklung, wenn Sie die einfachste Einrichtung wünschen, bei der QoreChain-Validatoren die Sequenzierung übernehmen.
* Überwachen Sie Batch-Einreichungen genau. Lücken bei der Batch-Einreichung können Warnmeldungen des Netzwerks auslösen.
* Der Befehl `suggest-profile` ist ein hilfreicher Ausgangspunkt, überprüfen Sie die Empfehlung aber anhand Ihrer spezifischen Anforderungen.
