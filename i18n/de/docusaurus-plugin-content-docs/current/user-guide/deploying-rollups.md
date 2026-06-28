---
slug: /user-guide/deploying-rollups
title: Rollups bereitstellen
sidebar_label: Rollups bereitstellen
sidebar_position: 6
---

# Rollups bereitstellen

Dieser Leitfaden beschreibt, wie Sie anwendungsspezifische Rollups auf QoreChain mit dem Rollup Development Kit (RDK) bereitstellen. Das RDK bietet voreingestellte Profile für gängige Anwendungsfälle sowie vollständige Anpassung für fortgeschrittene Bereitstellungen.

:::caution
Das RDK und die Rollup-Settlement-Schicht sind eine sich aktiv weiterentwickelnde Funktion. Behandeln Sie die nachfolgenden Parameter, Presets und den Reifegrad einzelner Funktionen als änderbar und validieren Sie Bereitstellungen auf **`qorechain-diana`**, bevor Sie das Mainnet anvisieren.
:::

:::note
Die nachfolgenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 live und läuft mit der Chain-Version **v3.1.80** — ersetzen Sie die Mainnet-Chain-ID und die Endpunkte aus der Seite **Mit dem Mainnet verbinden**, wenn Sie auf dem Mainnet bereitstellen.
:::

---

## Überblick

Das QoreChain RDK ermöglicht Entwicklern den Start souveräner Rollups, die auf QoreChain abgewickelt werden. Jedes Rollup ist eine eigenständige Ausführungsumgebung mit eigener Blockzeit, eigener virtueller Maschine und eigenem Gebührenmodell und erbt dabei die Sicherheits- und Datenverfügbarkeitsgarantien von QoreChain.

---

## Voreingestellte Profile

Das RDK wird mit fünf voreingestellten Profilen ausgeliefert, die jeweils auf eine gängige Anwendungskategorie abgestimmt sind:

| Profil         | Settlement (Proof)  | Sequencer | DA              | Gas-Modell   | VM       | Vorgesehener Anwendungsfall |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dediziert | native          | EIP-1559     | EVM      | DeFi-/AMM-Anwendungen (Lending, DEXs, Derivate) |
| **gaming**     | based               | based     | native          | flach        | custom   | Spielzustand mit hohem Durchsatz und Echtzeit-Erlebnisse |
| **nft**        | optimistic (Fraud)  | dediziert | native (Celestia DA geplant) | standard | CosmWasm | NFT-Minting- und Marktplatz-Workloads |
| **enterprise** | based               | based     | native          | subventioniert | EVM    | Permissioned- und Konsortium-Bereitstellungen mit gesponserten Gebühren |
| **custom**     | vollständig parametrisiert | vollständig parametrisiert | vollständig parametrisiert | vollständig parametrisiert | vollständig parametrisiert | Jedes Feld selbst festlegen |

:::note
Die obigen Pro-Preset-Werte entsprechen den ausgelieferten `@qorechain/rdk`-Profilstandards. Die genaue Konfiguration kann sich mit zunehmender Reife des RDK ändern — fragen Sie die maßgeblichen Werte mit `qorechaind query rdk config` (oder `RdkClient.params()`) ab, und beachten Sie, dass `based`-Settlement stets mit dem `based`-Sequencer-Modus gepaart wird.
:::

---

## Voraussetzungen

Bevor Sie ein Rollup bereitstellen, stellen Sie sicher, dass Sie die folgenden Voraussetzungen erfüllen:

| Voraussetzung     | Details                                                                                |
| ----------------- | -------------------------------------------------------------------------------------- |
| **Mindest-Stake** | 10.000 QOR (10.000.000.000 uqor)                                                        |
| **Erstellungs-Burn** | 1 % des gestakten Betrags wird bei der Rollup-Erstellung dauerhaft verbrannt        |
| **Konto**         | Ein finanziertes QoreChain-Konto mit ausreichendem Guthaben für den Stake plus Transaktionsgebühren |

---

## Ein Rollup aus einem Preset erstellen

Stellen Sie ein Rollup mit einem der voreingestellten Profile bereit:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-defi-rollup" \
  --profile defi \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Beispiel:** Stellen Sie ein Gaming-Rollup bereit:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "battle-arena" \
  --profile gaming \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Ein benutzerdefiniertes Rollup erstellen

Für die volle Kontrolle über die Rollup-Parameter verwenden Sie das `custom`-Profil und geben jede Option an:

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

| Parameter      | Optionen                                      | Beschreibung                       |
| -------------- | --------------------------------------------- | ---------------------------------- |
| `--settlement` | `optimistic`, `zk`, `based`, `sovereign`      | Wie Zustandsübergänge verifiziert werden |
| `--sequencer`  | `dedicated`, `shared`, `based`                | Strategie zur Transaktionsreihenfolge |
| `--da-backend` | `native`, `external`                          | Datenverfügbarkeitsschicht         |
| `--vm-type`    | `evm`, `cosmwasm`, `custom`                   | Ausführungsumgebung                |
| `--block-time` | Ganzzahl (Millisekunden)                      | Ziel-Intervall der Blockproduktion |

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

Rollup-Betreiber können den Lebenszyklus ihrer Bereitstellungen verwalten:

1. **Ein Rollup pausieren** — Halten Sie die Blockproduktion vorübergehend an. Der Rollup-Zustand bleibt erhalten und kann fortgesetzt werden.

   ```bash
   qorechaind tx rdk pause-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

2. **Ein Rollup fortsetzen** — Setzen Sie die Blockproduktion eines pausierten Rollups fort:

   ```bash
   qorechaind tx rdk resume-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

3. **Ein Rollup stoppen (dauerhaft)** — Stoppen Sie ein Rollup dauerhaft. Diese Aktion ist **unumkehrbar**.

   ```bash
   qorechaind tx rdk stop-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

:::danger
Das Stoppen eines Rollups ist dauerhaft. Der gesamte zugehörige Zustand wird archiviert, aber das Rollup kann nicht neu gestartet werden. Der gestakte QOR (abzüglich des Erstellungs-Burns) wird an den Betreiber zurückgegeben.
:::

---

## Rollups abfragen

Rufen Sie Details zu einem bestimmten Rollup ab:

```bash
qorechaind query rdk rollup <rollup_id>
```

Listen Sie alle Rollups auf QoreChain auf:

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

## QCAI-gestützte Profilempfehlung

Sie sind sich nicht sicher, welches Profil zu Ihrem Anwendungsfall passt? Verwenden Sie das QCAI-gestützte Empfehlungstool:

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

Dieser Befehl analysiert Ihre Beschreibung und empfiehlt das am besten geeignete voreingestellte Profil zusammen mit einer Erklärung.

---

## Tipps

* Beginnen Sie mit einem voreingestellten Profil und passen Sie es später an. Presets sind für ihre jeweiligen Anwendungsfälle optimiert.
* Der Erstellungs-Burn von 1 % ist eine einmalige Kosten, die zum Bereitstellungszeitpunkt auf den Mindest-Stake angewendet wird.
* Verwenden Sie `based`-Settlement, wenn Sie das einfachste Setup wünschen, bei dem QoreChain-Validatoren das Sequencing übernehmen.
* Überwachen Sie Batch-Einreichungen genau. Lücken bei der Batch-Einreichung können Warnungen des Netzwerks auslösen.
* Der `suggest-profile`-Befehl ist ein hilfreicher Ausgangspunkt, aber prüfen Sie die Empfehlung anhand Ihrer spezifischen Anforderungen.
