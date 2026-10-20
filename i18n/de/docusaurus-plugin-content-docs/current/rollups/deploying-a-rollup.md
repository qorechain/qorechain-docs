---
slug: /rollups/deploying-a-rollup
title: Einen Rollup bereitstellen
sidebar_label: Einen Rollup bereitstellen
sidebar_position: 3
---

# Einen Rollup bereitstellen

Sie können einen anwendungsspezifischen Rollup auf drei Arten einrichten: über das **Dashboard** (ein Anfrageformular, keine On-Chain-Transaktion), über die Chain-**CLI** (`qorechaind`, volle Kontrolle über die On-Chain-Transaktion) oder mit dem **TypeScript-RDK** (`@qorechain/rdk` plus dem `create-qorechain-rollup`-Scaffolder), das Konfiguration und Lesezugriffe abdeckt und hybride Transaktionen signieren kann, wenn Sie ihm einen Post-Quanten-Schlüssel übergeben (siehe [Einschränkungen von RDK 0.5.0](#rdk-050-limits)). Diese Seite behandelt alle drei Wege sowie den Betreiber-Lebenszyklus und die Batch-Befehle.

:::caution Fähigkeit im Frühstadium
Bisher wurde in keinem der beiden Netzwerke ein Rollup erstellt (geprüft am 20. Oktober 2026). Die folgenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**, Chain-Version **v3.2.4**, nur Testnet). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**, live seit dem 7. Juni 2026) läuft mit Chain-Version **v3.2.3**; diese Seite beschreibt das Mainnet-Verhalten, und die neuere Testnet-Version kann im Detail abweichen (die Unterschiede sind mit „nur Testnet“ gekennzeichnet). Validieren Sie jedes Deployment zuerst auf dem Testnet.
:::

:::note Gebühren und Signierung
Das Netzwerk erzwingt einen Mindest-Gaspreis von `0.1uqor`, sodass ein bloßes `--fees 500uqor` abgelehnt wird, und jede Transaktion auf der nativen Lane benötigt die hybride Post-Quanten-Mitsignatur. Die CLI-Beispiele auf dieser Seite erstellen die Transaktion daher mit `--generate-only` und signieren sie mit `qorechaind tx pqc cosign` mit, was sie signiert und sendet (erstellen Sie den Schlüssel einmalig mit `qorechaind tx pqc gen-key` und registrieren Sie ihn einmalig On-Chain mit `qorechaind tx pqc register-key`, oder über QoreX bzw. das SDK, die das für Sie erledigen). Die Gebühr wird beim Erzeugen der unsignierten Datei festgelegt, setzen Sie daher Gas-Limit und Gebühr gemeinsam: Die Gebühr muss mindestens dem Gas-Limit × 0,1 uqor entsprechen. Die unten genannten Gas-Limits sind Richtwerte — simulieren Sie, bevor Sie sich darauf verlassen. Siehe [Erste Transaktion](/getting-started/first-transaction) und [Post-Quanten-Signierung](/developer-guide/post-quantum-signing).
:::

---

## Voraussetzungen

| Voraussetzung | Details |
| ----------- | ------- |
| **Mindesteinsatz (Stake)** | Mindestens 10.000 QOR (`min_stake_for_rollup`); der Stake wird beim Erstellen des Rollups hinterlegt (Escrow) |
| **Erstellungs-Burn** | 1 % des eingesetzten Betrags wird bei der Erstellung dauerhaft verbrannt (eine Erstellung, bei der der Burn nicht angewendet werden kann, wird abgelehnt); der Rest bleibt im Escrow und wird beim Stoppen des Rollups zurückerstattet |
| **Stake für die Layer-Registrierung** | Die Erstellung registriert außerdem den Layer des Rollups im Multilayer-Modul, wodurch vom Ersteller weitere **1.000 QOR** (`min_sidechain_stake`) gesperrt werden; sie werden zurückerstattet, wenn der Layer beim Stoppen außer Betrieb genommen wird. Kann der Layer nicht registriert werden (Guthaben zu niedrig oder das Multilayer-Sidechain-Limit von 10 erreicht), wird der Rollup dennoch erstellt, hat aber keinen Layer, sodass seine Batches nicht verankert werden können |
| **Rollup-ID** | Verwenden Sie 3–64 Zeichen: Kleinbuchstaben, Ziffern, `.`, `_` und `-`, beginnend mit einem Buchstaben oder einer Ziffer. Die Chain erzwingt diese Regel seit v3.2.2 auf beiden Netzwerken (die CLI prüft sie, bevor sie die Transaktion erstellt), sodass eine nicht konforme ID abgelehnt wird |
| **Konto** | Ein finanziertes QoreChain-Konto mit einem registrierten Post-Quanten-Schlüssel und ausreichendem Guthaben für den Stake, den Layer-Stake und die Transaktionsgebühren |

Fragen Sie die aktuellen Modulparameter für den aktuellen Mindesteinsatz und die Burn-Rate ab, bevor Sie deployen:

```bash
qorechaind query rdk config
```

---

## Deployment über das Dashboard (Tools → Rollups)

Das Dashboard bietet unter **Tools → Rollups** ein Formular **Rollup bereitstellen**. Es ist ein **Anfrageformular**: Das Absenden erfasst eine Provisionierungsanfrage für Ihr Konto, die von **The Qore Trust** geprüft wird, und eine neue Anfrage zeigt den Status **provisioning**. Es sendet **keine** On-Chain-Transaktion `create-rollup` — um einen Rollup On-Chain zu registrieren, verwenden Sie die CLI unten.

### Schritte

1. **Anmelden.** Das Formular benötigt eine authentifizierte Sitzung, um eine Anfrage abzusenden und Ihre bestehenden Anfragen aufzulisten.
2. **Rollup benennen.** Geben Sie einen Rollup-Namen ein (2–41 Zeichen: Buchstaben, Zahlen, Leerzeichen, Bindestriche oder Unterstriche).
3. **Virtuelle Maschine wählen.** Der On-Chain-Eintrag speichert ein VM-Label. Ihr Rollup wird Off-Chain in einer eigenen Laufzeitumgebung ausgeführt; die Auswahl läuft nicht auf den eigenen EVM-, CosmWasm- oder SVM-Lanes von QoreChain:
   * **EVM** — Solidity-/Vyper-Contracts mit vollständigem Ethereum-Tooling (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — Rust-Smart-Contracts auf der Cosmos-SDK-Laufzeitumgebung, mit nativem IBC
   * **SVM** — die Solana Virtual Machine, für parallel ausführende Anwendungen mit hohem Durchsatz
4. **Data-Availability-Layer wählen.** Wo Ihr Rollup Transaktionsdaten veröffentlicht, damit jeder den Zustand rekonstruieren kann: **QoreChain DA**, **Celestia** oder **EigenDA**. Beachten Sie, dass EigenDA eine Option auf Dashboard-Ebene ist, während die On-Chain-DA-Backends des `x/rdk`-Moduls nativ, Celestia oder beides sind — siehe [Data Availability](/rollups/data-availability).
5. **Gas-Token festlegen.** Das Token, mit dem Ausführung auf Ihrem Rollup bezahlt wird. Standardmäßig **QOR**; geben Sie ein eigenes Symbol ein, um Ihr eigenes natives Token zu verwenden.
6. **Sequencer wählen.** Wer Transaktionen vor der Abwicklung ordnet: **Shared Sequencer** (das gemeinsame QoreChain-Set), **Dedicated (single)** (eigenen Einzel-Sequencer betreiben) oder **Decentralized** (ein permissionless Sequencer-Set).
7. **Settlement-Ziel wählen.** Wo der Rollup seine State-Roots und Validity-Proofs verankert: **QoreChain-Mainnet** oder **Ethereum**.
8. **Anfrage absenden.** Die Provisionierung wird von **The Qore Trust** geprüft, sodass eine frisch eingereichte Anfrage mit dem Status **provisioning** erscheint, bis die Prüfung abgeschlossen ist.

Ihre eingereichten Anfragen erscheinen in der Liste **Your rollups** mit ihrer VM, dem DA-Layer, dem Gas-Token, dem Sequencer, dem Settlement-Ziel und dem aktuellen Status.

:::note
Die Optionen des Formulars (virtuelle Maschine, Data-Availability-Layer, Gas-Token, Sequencer, Settlement-Ziel) beschreiben, was Sie anfragen; sie sind breiter gefasst als das, was das On-Chain-Modul `x/rdk` derzeit unterstützt. On-Chain ist die Data Availability `native` (Celestia ist nicht aktiv), und die Sequenzierung erfolgt durch den Rollup-Ersteller oder eine konfigurierte Sequencer-Adresse. Siehe [Data Availability](/rollups/data-availability).
:::

---

## Deployment über die CLI

Die CLI erstellt den Rollup direkt On-Chain. `create-rollup` nimmt drei Positionsargumente entgegen — die Rollup-ID, ein Profil und den Stake-Betrag (in `uqor`) — sowie ein optionales `--vm`-Flag.

:::tip
Ab Chain-Version **v3.1.74** **wendet `create-rollup` das Preset des gewählten Profils automatisch an** — Settlement-Modus, Sequencer, DA, Gas-Modell und VM stammen alle aus dem Preset. Sie müssen diese nicht mehr manuell setzen (zuvor hatte die Nachricht eine souveräne Konfiguration fest codiert). Das `--vm`-Flag ist jetzt **standardmäßig leer**, sodass die VM des Profils angewendet wird, sofern Sie sie nicht ausdrücklich überschreiben.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json
```

**Beispiel** — einen Rollup aus dem `defi`-Preset erstellen (Settlement, Sequencer, DA und VM stammen alle aus dem Preset; `defi` löst sich zu zk-Settlement auf der EVM auf). Erstellen Sie die unsignierte Transaktion, fügen Sie dann die Post-Quanten-Mitsignatur hinzu und senden Sie sie:

```bash
# 1. Build the unsigned transaction (10,000 QOR stake)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json

# 2. Cosign with your post-quantum key and broadcast
qorechaind tx pqc cosign create-rollup.json \
  --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

Ein ZK-Profil wie `defi` wird bei der Erstellung akzeptiert, aber ein so erstellter Rollup trägt keinen Verifying Key, sodass seine ZK-Batches noch nicht finalisiert werden können (siehe [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).

**Flags:**

| Flag | Standard | Beschreibung |
| ---- | ------- | ----------- |
| `--vm` | *(leer — verwendet die VM des Profils)* | Überschreibt den Rollup-VM-Typ: `evm`, `cosmwasm`, `svm` oder `custom`. Nicht setzen, um die VM des Presets zu verwenden. (In den RDK-Clients ist die Wasm-Laufzeitumgebung der **`native`**-VM-Typ — QoreChain Native — wobei `cosmwasm` als Legacy-Alias erhalten bleibt; `cosmwasm` ist der On-Wire-Wert, den dieses Chain-Level-Flag entgegennimmt.) |

:::note Das VM-Label sind Metadaten
`--vm` hält fest, welche Laufzeitumgebung Ihr Rollup verwendet. Die Host-Chain wickelt den Rollup nur ab (Settlement); sie führt seine Contracts nicht aus. Der CosmWasm-Upload der Host-Chain selbst ist derzeit geschlossen und ihre SVM-Transaktions-Lane ist netzwerkweit deaktiviert; das betrifft das Settlement eines Off-Chain-Rollups nicht, bedeutet aber, dass Sie keine Contracts für einen Rollup auf diesen Host-Chain-Lanes bereitstellen können.
:::

Das Argument `[profile]` wählt eine Preset-Konfiguration, die automatisch angewendet wird — siehe **[Preset Profiles](/rollups/preset-profiles)**. Der `[stake-amount]` ist der Bond in `uqor`; der Erstellungs-Burn beträgt 1 % davon.

### Überprüfen, was deployt wurde

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Deployment mit dem TypeScript-RDK (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Das Rollup Development Kit wird als zwei öffentliche npm-Pakete für dasselbe On-Chain-Modul `x/rdk` wie die CLI ausgeliefert. Sie sind am nützlichsten zum Erstellen und Validieren von Konfigurationen und zum Lesen des Zustands; lesen Sie die [Einschränkungen von RDK 0.5.0](#rdk-050-limits), bevor Sie sich darauf verlassen, Transaktionen zu senden:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.5.0`) — das TypeScript-SDK: ein Config-Builder mit Preset-Profilen, Transaktionshelfer für die Lebenszyklen von Rollup und Settlement-Batch, natives DA, typisierte Lese-Clients sowie die v0.4-Ergänzungen — quantensichere Settlement-Belege, der QCAI Rollup Copilot, Cross-VM-Calldata-Helfer und der Watchtower.
* **`create-qorechain-rollup`** (`v0.5.0`) — ein Scaffolder, der pro Profil eine lauffähige Starter-Vorlage klont (einschließlich der Vorlage `multivm-rollup`).

Diese sind auf npm veröffentlicht. Das Repo liefert außerdem eine veröffentlichte Betreiber-CLI, **`@qorechain/rdk-cli`** (`qorollup`, `v0.5.0`), mit den Befehlen `doctor`, `create`, `status`, `watch`, `params`, `suggest`, Lebenszyklus (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` und `faucet`, sowie den v0.4-Befehlen `receipt`, `advise` und `watchtower`.

Highlights seit dem ersten v0.4.0-Release:

* **v0.4.2 — funktioniert von Anfang an gegen das Live-Netzwerk.** Die Presets `mainnet` und `testnet` liefern jetzt die öffentlichen `qore.host`-Endpunkte (REST unter `api.qore.host` / `api-testnet.qore.host`), sodass `createRdkClient({ network })` die Chain ohne manuelle `endpoints`-Angabe erreicht — überschreiben Sie diese nur, um Ihren eigenen Node anzusprechen. Dasselbe Release benannte den Wasm-Rollup-VM-Identifikator in **`native`** um (QoreChain Native); `cosmwasm` bleibt als Legacy-Alias akzeptiert, und beide werden On-Wire auf `cosmwasm` abgebildet — Chain, Explorer und Dashboard bleiben unverändert.
* **v0.4.3 — Abhängigkeits-Update für den Fix der Hybrid-Signatur-Kodierung im SDK.** Der RDK-Transaktions-Client selbst signiert weiterhin rein klassisch (siehe [Einschränkungen von RDK 0.5.0](#rdk-050-limits)).
* **v0.4.4 — folgt `@qorechain/sdk` `^0.7.0`**, dem SDK-Release für die Authenticator-Lanes der Chain-Version **v3.1.85**, sodass diese Fähigkeiten den TypeScript-Nutzern des RDK direkt über das SDK zur Verfügung stehen. Keine Änderung an der RDK-API.
* **v0.5.0 (veröffentlicht am 18. Oktober 2026 auf npm, PyPI, crates.io, Maven Central und dem Go-Proxy)** — die Verifizierung von Settlement-Belegen prüft jetzt gegen den Chain-Zustand und meldet einen Beleg nie anhand seiner eigenen Felder als gültig; der TypeScript-Transaktions-Client signiert hybrid, wenn ihm ein `pqcKeypair` übergeben wird; jede Scaffolder-Vorlage pinnt `@qorechain/rdk` `^0.5.0`; `@qorechain/sdk` ist `^0.8.0`, sodass npm das SDK **0.8.3** als eigene Kopie des RDK installiert (das SDK 0.9.0 wurde am 21. Oktober 2026 nach dem RDK veröffentlicht und wird vom veröffentlichten RDK 0.5.0 nicht verwendet).

#### Einschränkungen von RDK 0.5.0 {#rdk-050-limits}

Diese Einschränkungen der veröffentlichten 0.5.0-Clients werden so angegeben, wie sie heute sind; keine davon ist ein Verhalten der Chain. Ein späteres Release wird hier erst angekündigt, wenn es veröffentlicht ist.

**Signierung.** Beide Netzwerke verlangen bei jeder Transaktion auf der nativen Lane eine hybride Signatur (secp256k1 + ML-DSA-87).

* Der **TypeScript**-Aufruf `RdkClient.connectTx(signer, { pqcKeypair, rest })` signiert über seine eigene Kopie von `@qorechain/sdk` (0.8.3, siehe oben) hybrid, wenn Sie das `pqcKeypair` eines Kontos übergeben, dessen Schlüssel bereits On-Chain registriert ist (`signer` muss ein `OfflineDirectSigner` sein, zum Beispiel aus `directSignerFromPrivateKey`; übergeben Sie einen `gasPrice` oder eine explizite Gebühr). Ohne `pqcKeypair` signiert der Client rein klassisch, und die Netzwerke lehnen die Transaktion ab. In keinem der beiden Netzwerke wurde ein Rollup erstellt, daher wurde dieser Weg auf keinem Live-Rollup erprobt.
* Der eigene Rollup-Client des SDK (`createRollupClient(tx)`, SDK 0.9.0) signiert ebenfalls hybrid, wenn sein `TxClient` mit einem `pqcKeypair` verbunden ist (`client.connectTx(signer, { pqcKeypair })`). Auch sein `submitBatch` hat kein `anchor_signature` und kein `validator_set_hash`. Über ihn wurde nichts in einem Live-Netzwerk erstellt, daher ist er live auf dieselbe Weise ungetestet.
* Die **`qorollup`-CLI**, die Skripte der gescaffoldeten Vorlagen (`create`, `submit-batch`) und die **Python-, Go-, Rust- und Java**-Clients signieren rein klassisch und bringen keine Transaktion zur Annahme. Für Transaktionen aus diesen erstellen und signieren Sie mit der Chain-CLI (`--generate-only`, dann `qorechaind tx pqc cosign`) oder verwenden den TypeScript-Client mit einem `pqcKeypair`.
* `submitBatchMsg` hat kein `anchor_signature` und kein `validator_set_hash`, sodass ein über das RDK gesendeter Batch unverankert ist (siehe [Einen Batch einreichen](#submit-a-batch)).

**Lesezugriffe.** Die REST-Routen `/qorechain/rdk/v1/…` werden auf beiden Netzwerken bereitgestellt, und `rdk.params()`, `rdk.rest.getRollup()` und `rdk.rest.getBatch()` rufen Routen auf, die die Chain bereitstellt. Zwei Helfer rufen Routen auf, die die Chain in dieser Form nicht bereitstellt: `getLatestBatch` fordert `/batches/{id}?latest=true` an, was die Chain als die seitenweise Liste behandelt (verwenden Sie `/qorechain/rdk/v1/latest_batch/{rollup_id}`), und `listBatches` liefert nur die erste Seite mit 50 Einträgen (die Route akzeptiert `start_index` und `limit`, höchstens 100). Die PQC-Kontoabfrage hinter der Beleg-Verifizierung verwendet einen Pfad im Plural, den die Netzwerke nicht bereitstellen (siehe [Settlement-Belege](/rollups/settlement-receipts)).

**Fristen.** Der Watchtower und die Gesundheitsprüfung hinter `qorollup status` behandeln das `submitted_at` eines Batches (eine Blockhöhe) als Zeitstempel, sodass Challenge-Window-Countdowns und `onDeadline`-Warnungen falsch sind (siehe [Watchtower](/rollups/watchtower)).

**Cross-VM.** Der Calldata-Helfer kodiert eine andere Funktionssignatur als die, die der Node dekodiert, und das Precompile unter `0x…0901` hat auf keinem der beiden Netzwerke Code (siehe [Multi-VM](/rollups/multi-vm)).

**Data Availability.** `buildDaBlob` hasht mit SHA-256, während das Blob-Commitment der Chain SHAKE-256 ist (siehe [Data Availability](/rollups/data-availability)).

#### Python-, Go-, Rust- und Java-Clients

Neben dem TypeScript-Paket bietet das RDK vollständige **Python-**, **Go-**, **Rust-** und **Java-**Clients, die die TypeScript-Oberfläche spiegeln: den Config-Builder mit Validierung, die fünf Preset-Profile, Denom-/Economics-/Bech32-Hilfsfunktionen, Binary-Merkle- und Withdrawal-Proof-Helfer, Rollup-Manifeste, REST- und `qor_`-JSON-RPC-Lese-Clients, Preflight-/Health-Checks, Konten (Mnemonic → `qor`-Adresse) sowie klassische Transaktionssignierung + Broadcast (`SIGN_MODE_DIRECT`, in den Netzwerken mit Hybrid-Signatur nicht akzeptiert — siehe [Einschränkungen von RDK 0.5.0](#rdk-050-limits)). Alle sind gegen gemeinsame sprachübergreifende Golden-Vektoren verifiziert und in ihren jeweiligen Registries **veröffentlicht**:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.5.0
```

```python
import qorrdk
```

Aktuell veröffentlichte Versionen, alle **0.5.0**: Python `qorechain-rdk` (PyPI, Import `qorrdk`), Go-Modul `github.com/qorechain/qorechain-rdk/packages/go` (`v0.5.0`), Rust `qorechain-rdk` (crates.io) und Java `io.github.qorechain:qorechain-rdk` (Maven Central). Diese Clients lesen den Chain-Zustand; sie erzeugen nicht die hybride Signatur, die die Netzwerke verlangen (siehe [Einschränkungen von RDK 0.5.0](#rdk-050-limits)).

:::note
Das TypeScript-RDK und seine Vorlagen verwenden standardmäßig das **`qorechain-diana`**-Testnet, und die Presets erreichen die öffentlichen Live-Endpunkte ohne weitere Konfiguration. Pinnen Sie Versionen und validieren Sie auf dem Testnet, bevor Sie ins Mainnet gehen.
:::

### Ein Projekt mit `create-qorechain-rollup` scaffolden {#scaffold-a-project-with-create-qorechain-rollup}

Jedes Profil hat eine passende Starter-Vorlage (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Erstellen Sie eine mit einer der beiden Formen:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Für nicht-interaktive Nutzung / CI übergeben Sie Vorlage und Netzwerk explizit:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

Der Scaffolder gibt die dokumentierten Kosten für Stake und Erstellungs-Burn sowie die nächsten Schritte zum Erstellen Ihres Rollups und zum Abfragen seines Status aus.

:::caution Was die gescaffoldeten Skripte können
Die Vorlagen von `create-qorechain-rollup` 0.5.0 hängen von `@qorechain/rdk` `^0.5.0` ab. Ihre Skripte `create` und `submit-batch` verbinden sich ohne Post-Quanten-Schlüssel, sodass die Transaktionen, die sie erstellen, rein klassisch sind und von beiden Netzwerken abgelehnt werden; fügen Sie `connectTx` ein `pqcKeypair` hinzu (siehe [Einschränkungen von RDK 0.5.0](#rdk-050-limits)), bevor Sie sich darauf verlassen. Das Skript `submit-batch` des Starters ist nur ein Referenzablauf: Es sendet illustrative Roots und einen Beispiel-Proof und soll in einem Live-Netzwerk keinen Batch finalisieren.
:::

### Eine Rollup-Konfiguration per Code erstellen

Erstellen Sie eine Konfiguration aus einem Preset, lesen Sie den aktuellen Stake und die Burn-Rate von der Chain und erzeugen Sie die Create-Nachricht. Der Config-Builder erzwingt die Kompatibilitätsmatrix zwischen Settlement und Proof bei `validate()` / `build()`. Senden Sie die resultierenden Werte mit der CLI oben (oder mit einem Client, der hybrid signiert) — siehe [Einschränkungen von RDK 0.5.0](#rdk-050-limits).

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read of /qorechain/rdk/v1/params, served on both networks.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// The values to pass to `qorechaind tx rdk create-rollup`.
const msg = config.toCreateMsg("<your qor address>", { stakeAmount: params.minStakeForRollup });
console.log(msg.rollupId, msg.profile, msg.vmType, msg.stakeAmount);
```

Nicht sicher, welches Profil passt? `rdk.suggestProfile(...)` soll eine QCAI-gestützte Empfehlung liefern; auf den aktuellen öffentlichen Endpunkten liefert es immer den Fallback `defi` (`source: "fallback"`), wählen Sie also anhand der [Profiltabelle](/rollups/preset-profiles).

### Zustand per Code lesen

Der typisierte REST-Client benötigt keinen Signer und liest beide Netzwerke:

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

Verwenden Sie für Batches `rdk.rest.getBatch(rollupId, index)` oder `qorechaind query rdk batch [rollup-id]` (unten); `getLatestBatch` und `listBatches` haben in 0.5.0 Einschränkungen (siehe [Einschränkungen von RDK 0.5.0](#rdk-050-limits)).

---

## Lebenszyklusverwaltung

Ein Rollup durchläuft die Zustände `pending`, `active`, `paused` und `stopped`; ein neuer Rollup startet sofort als `active`. Nur der Ersteller kann ihn pausieren, fortsetzen oder stoppen (erzwungen seit Chain-Version v3.2.0). Jeder der folgenden Befehle folgt demselben zweistufigen Muster wie die Erstellung: die unsignierte Transaktion erzeugen und dann mitsignieren.

### Pausieren

Den Rollup vorübergehend anhalten. Der Zustand bleibt erhalten und der Rollup kann wieder aufgenommen werden. Ein Grund-String ist erforderlich.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > pause.json
qorechaind tx pqc cosign pause.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Fortsetzen

Einen zuvor pausierten Rollup fortsetzen.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > resume.json
qorechaind tx pqc cosign resume.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Stoppen

Den Rollup dauerhaft stilllegen und seinen Stake freigeben. Das eingesetzte QOR — abzüglich des einmaligen Erstellungs-Burns und abzüglich allem, was bereits durch Withdrawals oder Fraud-Proof-Belohnungen aus dem Escrow des Rollups ausgezahlt wurde — wird an den Ersteller zurückerstattet: Seit v3.2.3 erfasst ein Escrow-Ledger pro Rollup, was jeder Rollup noch hält, `stop-rollup` erstattet genau dieses Guthaben zurück, und ein gestoppter Rollup zahlt keine weiteren Withdrawals mehr aus. Der Layer-Registrierungs-Stake von 1.000 QOR wird separat zurückerstattet, wenn der Layer des Rollups außer Betrieb genommen wird.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > stop.json
qorechaind tx pqc cosign stop.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

:::danger
Das Stoppen eines Rollups ist endgültig. Der Rollup kann nach dem Stoppen nicht neu gestartet werden.
:::

---

## Betreiberbefehle: Batches und Challenges

Rollup-Betreiber reichen Settlement-Batches ein, und Challenger können optimistische Batches anfechten. Diese Befehle bilden die Grundlage der Settlement-Schicht, die in **[Rollups Overview](/rollups/overview)** und **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)** beschrieben wird.

### Wer einreichen darf, und in welcher Reihenfolge

* **Nur die konfigurierte Sequencer-Adresse des Rollups — oder, wenn keine konfiguriert ist (bei jedem Preset), sein Ersteller — darf Batches einreichen.** Based und Shared Sequencing nehmen noch keine Proposer-Sets oder Rosters auf: Sie sind derzeit Labels, und der Ersteller reicht ein.
* Batches bilden eine Kette: Der erste Batch hat den Index `0`; jeder spätere Batch muss den nächsten Index verwenden und den State-Root des vorherigen Batches als `prev_state_root` tragen.
* Ein Batch, der bei einem `native`- oder `both`-Rollup einen Data-Hash trägt, wird abgelehnt, sofern nicht bereits ein passender Blob gespeichert ist (siehe [Data Availability](/rollups/data-availability)). Ein Batch ohne Data-Hash wird nicht geprüft.
* Ein `zk`-Rollup muss einen Proof anhängen, und der Proof muss verifiziert werden (siehe [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).

### Einen Batch einreichen {#submit-a-batch}

Einen Settlement-Batch für einen Rollup einreichen. Nimmt die Rollup-ID, einen Batch-Index und einen hex-kodierten State-Root entgegen. Übergeben Sie bei jedem Batch nach dem ersten den State-Root des vorherigen Batches als `--prev-state-root`.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --prev-state-root <previous-state-root-hex> --tx-count 120 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| Flag | Beschreibung |
| ---- | ----------- |
| `--prev-state-root` | Hex-State-Root, von dem der Batch ausgeht (erforderlich für jeden Batch nach Index `0`) |
| `--tx-count` | Anzahl der Rollup-Transaktionen im Batch |
| `--data-hash` | Hex-Hash der Batch-Daten, die als DA-Blob gesendet wurden (heute leer lassen: Es gibt keine Möglichkeit, einen Blob zu senden, siehe [Data Availability](/rollups/data-availability)) |
| `--withdrawals-root` | Hex-Merkle-Root der L2 → L1-Withdrawals des Batches (siehe [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)) |
| `--anchor-signature` | Hex-ML-DSA-87-Signatur des **Erstellers** des Rollups über die v2-Anchor-Sign-Bytes (seit v3.2.2); der Batch wird dann in derselben Transaktion in `x/multilayer` verankert, und ein abgelehnter Anker lehnt den Batch ab |
| `--validator-set-hash` | Hex-Validator-Set-Commitment, das im Anker enthalten ist und von der Signatur abgedeckt wird |

Ohne `--anchor-signature` wird der Batch **unverankert** abgewickelt. Um einen Batch zu verankern, geben Sie die zu signierenden Bytes aus, signieren Sie sie mit dem registrierten Post-Quanten-Schlüssel des Erstellers und übergeben Sie die Signatur (die Werte `--tx-count` und `--validator-set-hash` müssen mit denen übereinstimmen, die Sie einreichen):

```bash
qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex] \
  --chain-id qorechain-diana --tx-count 120
```

`layer-id` ist die Layer-ID des Rollups (bei vom RDK erstellten Rollups die Rollup-ID). Der ZK-`--proof` für einen `zk`-Rollup hat heute kein CLI-Flag, und die Resolve-Challenge-Nachricht ist kein CLI-Befehl: Verwenden Sie einen Client. Siehe [Settlement-Belege](/rollups/settlement-receipts), was ein Anker beweist und was nicht. In keinem der beiden Netzwerke existiert bisher ein Rollup, Layer oder Anker.

### Einen Batch anfechten (optimistische Rollups) {#challenge-a-batch-optimistic-rollups}

Jedes Konto kann einen Batch im Status `submitted` innerhalb des Challenge-Fensters (im Mainnet standardmäßig 100.800 Blöcke; nur im Testnet ab v3.2.4 für neue Batches ein Fenster in Sekunden der Blockzeit) anfechten, indem es einen Bond (den `challenge_bond` des Rollups; 1.000 QOR für die Presets `nft` und `custom`) und einen Fraud-Proof hinterlegt. Nimmt die Rollup-ID und den Batch-Index entgegen; übergeben Sie den Fraud-Proof mit `--proof`:

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > challenge.json
qorechaind tx pqc cosign challenge.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| Flag | Beschreibung |
| ---- | ----------- |
| `--proof` | Hex-kodierter Fraud-Proof |

Eine Challenge **friert** den Batch ein (`challenged`): Er kann nicht finalisiert werden. Der **Ersteller** des Rollups löst sie dann mit einer Resolve-Challenge-Nachricht auf (nicht als CLI-Befehl verfügbar; verwenden Sie einen Client). Die Chain entscheidet das Ergebnis selbst, indem sie den gespeicherten Proof verifiziert. Wird der Betrug bestätigt, wird der Batch `rejected`, der Bond wird zurückerstattet und der Challenger erhält zusätzlich einen Betrag in Höhe des Bonds aus dem Stake des Rollups; wird die Challenge abgewiesen, geht der Bond an den Ersteller und der Batch kehrt zu `submitted` zurück.

### Batches inspizieren

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42

# A page of batches in index order (--limit up to 100, default 50)
qorechaind query rdk batches [rollup-id] --start 0 --limit 50
```

---

## Abfragen

| Befehl | Zweck |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Details eines bestimmten Rollups |
| `qorechaind query rdk list-rollups` | Alle registrierten Rollups |
| `qorechaind query rdk batch [rollup-id]` | Neuester Settlement-Batch (oder `--index`) |
| `qorechaind query rdk batches [rollup-id]` | Eine Seite von Batches in Indexreihenfolge (`--start`, `--limit`) |
| `qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex]` | Die v2-Anchor-Sign-Bytes für einen Batch (offline) |
| `qorechaind query rdk config` | RDK-Modulparameter |
| `qorechaind query rdk suggest-profile [use-case]` | Gibt einen Verweis auf den RPC `qor_suggestRollupProfile` aus; die öffentlichen Endpunkte stellen ihn nicht bereit, wählen Sie also ein Profil anhand der Tabelle [Preset Profiles](/rollups/preset-profiles) |

---

## Nächste Schritte

* **[Data Availability](/rollups/data-availability)** — native, Celestia- und redundante DA-Backends.
* **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)** — Proof-Verifizierung und der L2 → L1 Withdrawal-Flow via `execute-withdrawal`.
