---
slug: /rollups/deploying-a-rollup
title: Einen Rollup bereitstellen
sidebar_label: Einen Rollup bereitstellen
sidebar_position: 3
---

# Einen Rollup bereitstellen

Sie können einen anwendungsspezifischen Rollup auf drei Arten einrichten: über das **Dashboard** (ein Anfrageformular, keine On-Chain-Transaktion), über die Chain-**CLI** (`qorechaind`, volle Kontrolle über die On-Chain-Transaktion) oder mit dem **TypeScript-RDK** (`@qorechain/rdk` plus dem `create-qorechain-rollup`-Scaffolder), das Konfiguration und Lesezugriffe abdeckt und hybrid signierte Transaktionen erzeugen kann, wenn Sie ihm einen Post-Quanten-Schlüssel übergeben (siehe [Änderungen und Einschränkungen von RDK 0.7.0](#rdk-050-limits)). Diese Seite behandelt alle drei Wege sowie den Betreiber-Lebenszyklus und die Batch-Befehle.

:::caution Fähigkeit im Frühstadium
Bisher wurde in keinem der beiden Netzwerke ein Rollup erstellt (geprüft am 30. Oktober 2026). Die folgenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**, Chain-Version **v3.2.6**: v3.2.4 wurde dort am 19. Oktober 2026 angewendet, v3.2.5 am 26. Oktober auf Höhe 8.890.800 und v3.2.6 am 27. Oktober auf Höhe 8.970.638). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**, live seit dem 7. Juni 2026) läuft seit dem 29. Oktober 2026 mit Chain-Version **v3.2.5** (angewendet auf Höhe 3.906.833 durch Governance-Vorschlag 14; v3.2.4 wurde auf Höhe 3.742.566 am 23. Oktober 2026 durch Vorschlag 13 angewendet), sodass das, was v3.2.5 für Rollups ändert, mit „ab v3.2.5“ gekennzeichnet ist und in beiden Netzwerken gilt (eine Übersichtstabelle steht in der [Rollups-Übersicht](/rollups/overview#v325)). Frühere Releases unterscheiden sich in einigen Details, die diese Seite mit „ab v3.2.4“ kennzeichnet. Das Testnet ist ein Staging-Netzwerk mit eigenen Modulparametern (zum Beispiel ein Standard-Challenge-Fenster von 3.600 Sekunden gegenüber 604.800 im Mainnet und höchstens 200 Rollups gegenüber 100); lesen Sie `GET /qorechain/rdk/v1/params` auf dem Netzwerk, das Sie ansprechen. Validieren Sie jedes Deployment zuerst auf dem Testnet.
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
3. **Virtuelle Maschine wählen.** Der On-Chain-Eintrag speichert ein VM-Label. Ihr Rollup wird Off-Chain in einer eigenen Laufzeitumgebung ausgeführt; die Auswahl läuft nicht auf den eigenen EVM-, QoreChain Native- oder SVM-Lanes von QoreChain:
   * **EVM** — Solidity-/Vyper-Contracts mit vollständigem Ethereum-Tooling (Hardhat, Foundry, MetaMask)
   * **QoreChain Native** — Rust-Smart-Contracts auf der Cosmos-SDK-Laufzeitumgebung (der CosmWasm-Laufzeitumgebung), mit nativem IBC
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

**Erstellen Sie noch keinen `defi`-Rollup (ZK).** Die Chain akzeptiert die Erstellung und hinterlegt den Stake im Escrow, hat aber keine Möglichkeit, einen Verifying Key zu registrieren, sodass jeder ZK-Batch abgelehnt wird, nachdem seine Gebühr bezahlt wurde. Die Schlüsselregistrierung ist für Chain v3.2.7 geplant. Wählen Sie vorerst ein `optimistic`-Profil wie `nft` oder `custom` (siehe [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).

**Flags:**

| Flag | Standard | Beschreibung |
| ---- | ------- | ----------- |
| `--vm` | *(leer — verwendet die VM des Profils)* | Überschreibt den Rollup-VM-Typ: `evm`, `cosmwasm`, `svm` oder `custom`. Nicht setzen, um die VM des Presets zu verwenden. (In den RDK-Clients ist die Wasm-Laufzeitumgebung der **`native`**-VM-Typ — QoreChain Native — wobei `cosmwasm` als Legacy-Alias erhalten bleibt; `cosmwasm` ist der On-Wire-Wert, den dieses Chain-Level-Flag entgegennimmt.) |

:::note Das VM-Label sind Metadaten
`--vm` hält fest, welche Laufzeitumgebung Ihr Rollup verwendet. Die Host-Chain wickelt den Rollup nur ab (Settlement); sie führt seine Contracts nicht aus. Der QoreChain Native-Upload der Host-Chain selbst ist derzeit geschlossen und ihre SVM-Transaktions-Lane ist netzwerkweit deaktiviert; das betrifft das Settlement eines Off-Chain-Rollups nicht, bedeutet aber, dass Sie keine Contracts für einen Rollup auf diesen Host-Chain-Lanes bereitstellen können.
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

Das Rollup Development Kit wird als zwei öffentliche npm-Pakete für dasselbe On-Chain-Modul `x/rdk` wie die CLI ausgeliefert. Da in keinem der beiden Netzwerke bisher ein Rollup existiert, wurde kein Transaktionspfad des Kits auf einem Live-Rollup erprobt; lesen Sie [Änderungen und Einschränkungen von RDK 0.7.0](#rdk-050-limits), bevor Sie sich darauf verlassen, Transaktionen zu senden:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.7.0`) — das TypeScript-SDK: ein Config-Builder mit Preset-Profilen, Transaktionshelfer für die Lebenszyklen von Rollup und Settlement-Batch, natives DA, typisierte Lese-Clients, Settlement-Belege mit ML-DSA-87-Signatur, der QCAI Rollup Copilot, Cross-VM-Calldata-Helfer und der Watchtower. Es hängt von `@qorechain/sdk` `^0.10.0` (ab 0.7.0; 0.6.x verwendete `^0.9.0`) und `@qorechain/evm` `^0.8.0` ab.
* **`create-qorechain-rollup`** (`v0.7.0`) — ein Scaffolder, der pro Profil eine lauffähige Starter-Vorlage klont (einschließlich der Vorlage `multivm-rollup`).

Diese sind auf npm veröffentlicht. Das Repo liefert außerdem eine veröffentlichte Betreiber-CLI, **`@qorechain/rdk-cli`** (`qorollup`, `v0.7.0`), mit den Befehlen `doctor`, `create`, `status`, `watch`, `params`, `suggest`, Lebenszyklus (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` und `faucet`, sowie den Befehlen `receipt`, `advise` und `watchtower`. Ihre Transaktionsbefehle signieren rein klassisch (siehe die Einschränkungen unten).

Highlights nach Release:

* **v0.4.2 — funktioniert von Anfang an gegen das Live-Netzwerk.** Die Presets `mainnet` und `testnet` liefern jetzt die öffentlichen `qore.host`-Endpunkte (REST unter `api.qore.host` / `api-testnet.qore.host`), sodass `createRdkClient({ network })` die Chain ohne manuelle `endpoints`-Angabe erreicht — überschreiben Sie diese nur, um Ihren eigenen Node anzusprechen. Dasselbe Release benannte den Wasm-Rollup-VM-Identifikator in **`native`** um (QoreChain Native); `cosmwasm` bleibt als Legacy-Alias akzeptiert, und beide werden On-Wire auf `cosmwasm` abgebildet — Chain, Explorer und Dashboard bleiben unverändert.
* **v0.4.3 — Abhängigkeits-Update für den Fix der Hybrid-Signatur-Kodierung im SDK.** Der RDK-Transaktions-Client selbst signierte weiterhin rein klassisch.
* **v0.4.4 — folgt `@qorechain/sdk` `^0.7.0`**, dem SDK-Release für die Authenticator-Lanes der Chain-Version **v3.1.85**. Keine Änderung an der RDK-API.
* **v0.5.0 (18. Oktober 2026)** — die Verifizierung von Settlement-Belegen prüft gegen den Chain-Zustand und meldet einen Beleg nie anhand seiner eigenen Felder als gültig; der TypeScript-Transaktions-Client signiert hybrid, wenn ihm ein `pqcKeypair` übergeben wird. Es hängt von `@qorechain/sdk` `^0.8.0` ab.
* **v0.6.0 (GitHub-Release vom 20. Oktober 2026)** — das Kompatibilitäts-Release für die Chain v3.2.2 bis v3.2.4: verankerte Batches, Settlement-Belege, die verifiziert werden können, Challenge-Fenster, die so gemessen werden, wie die Chain sie misst, ein Encoder, der dem Cross-VM-Layout der Chain entspricht, Vorlagen, die hybrid signieren, und `@qorechain/sdk` `^0.9.0`. Die Details folgen unten.
* **v0.6.1 (GitHub-Release vom 25. Oktober 2026)** — ein Sicherheits- und Vorlagen-Fix-Release für die Chain ab v3.2.3, in allen fünf Sprachen: Die Verifizierung von Settlement-Belegen vergleicht jedes Feld, das der Beleg angibt, mit dem Anker der Chain, die sechs Starter-Vorlagen reichen keine Batches mehr ein, die die Chain ablehnt (sie lassen `dataHash` leer), und die optimistischen Vorlagen veröffentlichen die kanonische State Root der Chain statt eines Platzhalters. Es behält die Bereiche `@qorechain/sdk` `^0.9.0` und `@qorechain/evm` `^0.8.0` bei. Die Details folgen unten.
* **v0.6.2 (GitHub-Release vom 27. Oktober 2026)**: ein CLI-Hotfix ohne Änderungen an der Bibliothek: `qorollup`, von npm installiert (lokal, global oder per `npx`), läuft wieder, und `qorollup --version` sowie `create-qorechain-rollup --version` geben ihre tatsächlichen Versionen aus. Die übrigen Pakete wurden als 0.6.2 neu veröffentlicht, damit jede Registry auf einer Version bleibt.
* **v0.7.0 (GitHub-Release vom 27. Oktober 2026; aktuell)**: bereit für die Chain v3.2.5 in allen fünf Sprachen (beide Netzwerke laufen damit: das Mainnet seit dem 29. Oktober 2026, das Testnet seit dem 26. Oktober), und es behebt, wie Withdrawals und Data-Availability-Blobs gehasht werden: Mit den Standardwerten von 0.6.x gebaute Withdrawal-Proofs wurden On-Chain nie verifiziert, und 0.7.0 baut exakt den Baum der Chain. Es wechselt zu `@qorechain/sdk` `^0.10.0`, und die Vorlagen pinnen `@qorechain/rdk` `^0.7.0`. Die Details folgen unten.

**Veröffentlichte Versionen (in jeder Registry am 27. Oktober 2026 geprüft).** npm `@qorechain/rdk`, `@qorechain/rdk-cli` und `create-qorechain-rollup`: **0.7.0** (`latest`); PyPI `qorechain-rdk`: 0.7.0; crates.io `qorechain-rdk`: 0.7.0; Maven Central `io.github.qorechain:qorechain-rdk`: 0.7.0 (seine `maven-metadata.xml` führt neben früheren Versionen auch 0.6.2 und 0.7.0); Go-Modul `github.com/qorechain/qorechain-rdk/packages/go`: `v0.7.0` (Tag `packages/go/v0.7.0`; das `@latest` des Module-Proxys kann einem neuen Tag hinterherhinken, pinnen Sie daher ausdrücklich `@v0.7.0`). Das GitHub-Release ist [v0.7.0](https://github.com/qorechain/qorechain-rdk/releases/tag/v0.7.0).

#### Änderungen und Einschränkungen von RDK 0.7.0 {#rdk-050-limits}

Dieser Abschnitt gibt an, was die veröffentlichten 0.7.0-Pakete tun (und was 0.6.2, 0.6.1 und 0.6.0 zuvor geändert haben), geprüft anhand des Paketinhalts und der GitHub-Release-Notes, und was sie weiterhin nicht können. Keiner dieser Punkte ist ein Verhalten der Chain. Wo eine Aussage „live ungetestet“ sagt, existiert in keinem der beiden Netzwerke ein Rollup, sodass der Weg nur anhand des Codes und offline geprüft wurde.

**Was sich in 0.7.0 geändert hat** (alle fünf Sprachen, sofern eine Zeile nichts anderes sagt; die [Release-Notes](https://github.com/qorechain/qorechain-rdk/releases/tag/v0.7.0) enthalten die vollständige Liste). Verhalten, das zur Chain v3.2.5 gehört, ist mit seinem Netzwerk gekennzeichnet: **Beide Netzwerke laufen mit v3.2.5 oder später (das Mainnet seit dem 29. Oktober 2026, das Testnet läuft mit v3.2.6)**.

* **Withdrawal-Proofs werden On-Chain verifiziert.** Die Merkle- und Withdrawal-Helfer verwendeten standardmäßig SHA-256 und hashten jedes Blatt erneut, während die Chain Knoten mit SHAKE-256 hasht und ihre Blätter aus dem Withdrawal selbst baut, sodass ein mit den Standardwerten von 0.6.x gebauter Proof nie verifiziert wurde. `withdrawalsTree` baut jetzt die Withdrawals-Root eines Batches und jeden Proof genau so, wie es die Chain tut (die Blattposition ist der Withdrawal-Index): mit Blättern der ersten Form oder mit Blättern der zweiten Form, die zusätzlich die Chain-ID nennen, welche die Chain für Batches ab v3.2.5 verwendet (beide Netzwerke). `withdrawalLeafV1` und `withdrawalLeafV2` bauen ein Blatt, `assembleWithdrawalProof` baut standardmäßig den Baum der Chain, und die generischen Merkle-Helfer verwenden standardmäßig SHAKE-256. Das ist ein Breaking Change für Code, der sich auf die SHA-256-Standardwerte stützte (übergeben Sie `hash` ausdrücklich, um sie beizubehalten). Die neuen Byte-Formate wurden gegen Vektoren getestet, die vom eigenen Code der Chain erzeugt wurden, und jeder Withdrawal-Proof in diesen Vektoren wird vom Verifier der Chain akzeptiert. Siehe [Blatt- und Knotenkodierung](/rollups/zk-stark-withdrawals#leaf-and-node-encoding).
* **`qorollup withdraw` prüft, bevor es zahlt.** Es nimmt die Withdrawals des Batches entgegen (`qorollup withdraw --file withdrawal.json [--dry-run]`), baut den Proof unter der eigenen Bindung des Batches und verweigert, bevor eine Gebühr bezahlt wird, wenn das Ergebnis nicht die On-Chain-`withdrawals_root` des Batches ist.
* **`buildDaBlob` committet so wie die Chain.** Sein Commitment ist SHAKE-256, nicht SHA-256 (keine Transaktion sendet einen Blob, daher bleibt `dataHash` weiterhin leer).
* **Watchtower.** Der Watchtower unterschied Batches nur anhand des Index und übersah daher einen Batch, der unter einem abgelehnten Index erneut eingereicht wurde. Ab Chain v3.2.5 (beide Netzwerke) lehnt ein bestätigter Betrug den Batch und jeden späteren, noch nicht finalisierten Batch ab, und der Sequencer reicht unter denselben Indizes erneut ein; der Watchtower unterscheidet Batches jetzt anhand von Index und State Root und validiert nie einen abgelehnten Batch. Neue Helfer `transitionRootValidator` (ein `validate`-Prädikat, das die Betrugsregel der Chain anwendet) und `fraudProofForBatch` (der Proof, der gewinnt, oder keiner für einen ehrlichen Batch) sowie `qorollup watchtower --canonical`, das die Batches meldet, die eine Challenge gewinnen würde.
* **Settlement-Helfer der Chain v3.2.5** (beide Netzwerke): `getRollupHealth` meldet `heldBackBy`, wenn der neueste Batch nach seinem eigenen Fenster finalisieren könnte, ein früherer Batch aber noch `submitted` oder `challenged` ist (Batches werden der Reihe nach finalisiert), und `qorollup status` gibt es aus; `stopRollupError` und eine Vorprüfung in `stopRollup` (TypeScript und Rust), weil ein Rollup, dessen neuester Batch `submitted` oder `challenged` ist, nicht gestoppt werden kann; `MAX_PENDING_OPTIMISTIC_BATCHES` (4.096); `withdrawalsRootError` (eine Withdrawals-Root ist leer oder genau 32 Bytes lang), vor jeder Batch-Einreichung in allen fünf Sprachen geprüft.
* **Cross-VM-Helfer für die Chain v3.2.5** (beide Netzwerke): `getCrossVmParams` (die Allowlist, unter `/qorechain/crossvm/v1/params`), `crossVmTargetReady` (Precompile aktiv, Bridge aktiviert und Ziel in der Allowlist, mit dem blockierenden Grund), `decodeCrossVmResult` (die Antwort ist `abi.encode(bytes)`) und `decodeRevertReason` (eine Ablehnung ist `Error(string)`), geprüft gegen Kodierungen, die Solidity erzeugt hat. Siehe [Multi-VM](/rollups/multi-vm).
* **Fehlerdekodierung und kleine Ergänzungen.** `decodeRdkTxError` und `RDK_ERRORS` benennen die Fehlercodes des `rdk`-Moduls (2 bis 36) und was bei denen zu tun ist, denen ein Betreiber begegnet; `qorehash` (SHAKE-256, 32 Bytes) wird in allen fünf Sprachen exportiert; `FEATURE_RDK_CHALLENGE_SETTLEMENT` benennt das Feature-Flag der Chain.
* **Die Vorlage `defi` hält an, bevor sie eine Gebühr verschwendet.** Keine Chain-Version bis v3.2.5 kann einen ZK-Verifying-Key registrieren, sodass jeder ZK-Batch abgelehnt wird. Die Vorlage hält jetzt vor dem Senden an, und `RollupView.hasVerificationKey` liest das Feld, das die Chain v3.2.7 voraussichtlich hinzufügen wird.
* **Abhängigkeiten.** `@qorechain/sdk` `^0.10.0` (war `^0.9.0`), sodass eine Anwendung auf SDK 0.10.0 sich jetzt eine SDK-Kopie mit dem Kit teilt; die Vorlagen pinnen `@qorechain/rdk` `^0.7.0`.

**Was sich in 0.6.2 geändert hat** (nur die CLI und der Scaffolder; die Bibliothekspakete sind unverändert):

* **`qorollup` läuft, wenn es von npm installiert wird.** Die CLI startete nur, wenn `process.argv[1]` ihrem eigenen Dateipfad entsprach, doch npm startet das Bin eines Pakets über einen Symlink in `node_modules/.bin`, sodass 0.6.1 und früher, lokal oder global installiert oder mit `npx` ausgeführt, mit Code 0 beendet wurden und nichts ausgaben; nur `node .../dist/index.js` funktionierte. 0.6.2 vergleicht echte Pfade. Nach `npm i -g @qorechain/rdk-cli` funktioniert `qorollup ...`.
* **Versionen werden korrekt ausgegeben.** `qorollup --version` gab in früheren Releases `0.4.1` und `create-qorechain-rollup --version` gab `0.2.0` aus; beide lesen jetzt ihre eigene `package.json` (geprüft am 27. Oktober 2026: `qorollup --version` gibt `0.6.2` aus).

**Was sich in 0.6.1 geändert hat** (alle fünf Sprachen, sofern eine Zeile nichts anderes sagt; die [Release-Notes](https://github.com/qorechain/qorechain-rdk/releases/tag/v0.6.1) enthalten die vollständige Liste):

* **Die Beleg-Verifizierung vergleicht jedes Feld.** `verifySettlementReceipt` verlangt jetzt, dass jedes Anker-Feld, das der Beleg angibt, dem Anker der Chain entspricht (eine Abweichung nennt das Feld), verlangt, dass `batchStateRoot` der Batch-Root der Chain entspricht, und verweigert einen Beleg mit unbekannter `version` oder einem anderen `algorithm` als `ML-DSA-87`, bevor etwas von der Chain gelesen wird. Das Ergebnis trägt den übereinstimmenden `anchor` der Chain und, wenn gültig, einen aus dem Chain-Zustand neu aufgebauten `verifiedReceipt`; `qorollup receipt verify --json` liefert diesen aus der Chain gelesenen Beleg als `receipt`. Siehe [Settlement-Belege](/rollups/settlement-receipts#what-060-verifies).
* **Natives Data Availability: `dataHash` leer lassen.** Jedes Rollup-Profil verwendet `native` Data Availability, bei dem die Chain einen nicht leeren `data_hash` nur akzeptiert, wenn ein passender Blob On-Chain gespeichert ist, und keine Transaktion einen solchen speichern kann (siehe [Data Availability](/rollups/data-availability)). Die sechs Starter-Vorlagen setzten in 0.6.0 und früher einen Data-Hash auf ihre Batches, sodass die Chain jeden Vorlagen-Batch ablehnte, nachdem die Gebühr bezahlt war. Sie lassen ihn jetzt leer; `SubmitBatchInput.dataHash` ist in TypeScript optional (weggelassen bedeutet leer), `dataHashError` (`data_hash_error`, `DataHashError`, `Rules.dataHashError`) stellt die Regel bereit, und `RdkTxClient.submitBatch` verweigert einen solchen Batch vor dem Broadcast, wenn es den Rollup lesen kann (ein hybrider Client mit einem REST-Endpunkt).
* **Optimistische Vorlagen veröffentlichen die kanonische State Root.** Die Chain beurteilt einen optimistischen Batch anhand seiner kanonischen Transition Root, einem SHAKE-256-Commitment aus der vorherigen State Root des Batches, dem Data-Hash und der Transaktionsanzahl (`batchTransitionRoot` im RDK, wobei `transitionRootVersionFor` die Bindung wählt, die das verbundene Netzwerk anwendet). Die Vorlagen `custom`, `multivm` und `nft` reichten früher eine feste Platzhalter-Root ein, die nicht der kanonischen Root entspricht, die die Chain prüft; sie veröffentlichen jetzt die kanonische Root und senden keinen Platzhalter-Proof mehr. Das `challenge.ts` der Vorlage `nft` liest den Batch von der Chain und fordert nur einen Batch heraus, dessen Root nachweislich falsch ist. Bauen Sie die Formel nicht von Hand nach: Verwenden Sie `batchTransitionRoot`, damit die Bindung zum Netzwerk passt, an das Sie einreichen. Die Prüfung der Chain ist für jeden Client dieselbe, daher kann ein optimistischer Batch, dessen State Root nicht die kanonische Root ist, erfolgreich herausgefordert werden, gleich welcher Client ihn gesendet hat.
* **Neue Helfer.** `fraudProof`, `transitionRootVersionForBatch`, `receiptSchemaError` mit `SUPPORTED_RECEIPT_VERSIONS`, `RestClient.getProtocolFeatures` / `isProtocolFeatureEnabled` (eine Chain ohne die Route wird als „nicht aktiviert“ gelesen) und `getAppliedPlanHeight`. `@qorechain/rdk` hängt jetzt direkt von `@noble/hashes` ab (SHAKE-256 für die Transition Root; es war bereits über `@qorechain/sdk` installiert). Die Vorlagen pinnen `@qorechain/rdk` `^0.6.1`.

**Was sich in 0.6.0 geändert hat** (TypeScript, sofern eine Zeile nichts anderes sagt):

* **Signierung.** `RdkClient.connectTx(signer, { pqcKeypair, rest })` signiert hybrid (secp256k1 + ML-DSA-87), wenn Sie ein Schlüsselpaar übergeben; ohne eines signiert es rein klassisch, und die Netzwerke lehnen die Transaktion ab. `signer` muss ein `OfflineDirectSigner` sein, und die Gebühr muss explizit angegeben werden (eine `fee` oder ein `gasPrice` beim Verbinden). Neue Helfer `resolvePqcKeypair` und `pqcKeypairFromEnv` leiten aus einer Mnemonic sowohl den kanonischen als auch den Legacy-ML-DSA-87-Schlüssel ab und verwenden denjenigen, den das Konto On-Chain registriert hat; sie verweigern, statt zu raten, wenn das Konto einen anderen Schlüssel hält. `QORE_PQC_SEED_HEX` liefert einen Seed für einen Betreiber, der mit einem rohen privaten Schlüssel signiert. Das Kit hängt jetzt von `@qorechain/sdk` `^0.9.0` ab, sodass eine frische Installation eine SDK-Kopie (0.9.0) enthält; mit 0.5.0 installierte npm das SDK 0.8.3 verschachtelt unter dem Kit.
* **Verankerte Batches.** `MsgSubmitBatch` trägt `anchor_signature` und `validator_set_hash`. `RdkTxClient.submitBatch` signiert den Anker nur dann selbst, wenn der Client hybrid signiert, einen REST-Endpunkt hat und **der Ersteller des Rollups ist** (die Chain prüft den Anker gegen den registrierten Schlüssel des Erstellers); in jedem anderen Fall reicht er wie zuvor unverankert ein. Übergeben Sie `anchor: "require"`, um stattdessen zu verweigern, statt unverankert einzureichen, `anchor: "off"`, um nie zu signieren, oder `anchorSignature`, um eine selbst beschaffte Signatur zu senden. `anchorSignBytesForBatch` erzeugt die v2-Bytes für einen Ersteller, der außerhalb des Systems signiert, was ein Rollup mit separatem Sequencer benötigt. Live ungetestet.
* **Settlement-Belege.** Die PQC-Kontoabfrage verwendet die Route im Singular `/qorechain/pqc/v1/account/{address}` (0.5.0 verwendete einen Pfad im Plural, den die Netzwerke nicht bereitstellen). Die Verifizierung unterstützt beide Anchor-Sign-Bytes-Formen und wählt eine anhand der Höhe des Ankers, nie durch Ausprobieren beider: v1 unterhalb der v3.2.2-Umstellung, v2 ab ihr. Das Beleg-Schema v2 erfasst `chainId`; die Verifizierung verweigert einen Beleg, der gegen einen Node einer anderen Chain geprüft wird, und meldet `signBytesVersion` sowie eine Prüfung `chainBinding`. Belege der Version 1 werden weiterhin verifiziert. Siehe [Settlement-Belege](/rollups/settlement-receipts).
* **Lesezugriffe.** `getLatestBatch` ruft `/qorechain/rdk/v1/latest_batch/{rollup_id}` auf (0.5.0 rief eine Form auf, die die Chain nicht bereitstellt), und `listBatches` folgt jeder Seite (`listBatchesPage` liest eine). `RollupView` trägt `escrowBalance` und, wo der Node sie meldet, `challengeWindowSec`, `challengeBond` und `proofSystem`; `BatchView` trägt `submittedTime`.
* **Challenge-Fenster.** `batchChallengeWindow` berechnet das Fenster eines Batches so, wie es die Chain tut, und beurteilt es anhand der Chain-Spitze (`getChainTip`), nicht anhand der lokalen Uhr: Sekunden der Blockzeit für einen Batch mit erfasster Einreichungszeit (die Regel von v3.2.4: im Testnet seit Höhe 8.337.253, im Mainnet seit Höhe 3.742.566), andernfalls `window / 6` Blöcke, gezählt ab der Einreichungshöhe (die Regel für Batches, die vor der Upgrade-Höhe eingereicht wurden). Die Gesundheitsprüfung hinter `qorollup status` und der Watchtower verwenden sie (siehe [Watchtower](/rollups/watchtower)).
* **Cross-VM.** `encodeCrossVmCalldata` kodiert jetzt `executeCrossVMCall(uint8,string,bytes)`, das Layout, das der Node dekodiert, und nimmt ein `targetVm` entgegen. `isCrossVmPrecompileActive` liest die Live-Liste der aktiven Precompiles (siehe [Multi-VM](/rollups/multi-vm)).
* **Vor der Gebührenzahlung geprüfte Regeln.** `rollupIdError` prüft die ID-Grammatik, wenn Sie eine Konfiguration validieren und bevor `createRollup` sendet; `withdrawalErrors` prüft ein Withdrawal, bevor `executeWithdrawal` sendet.
* **Vorlagen.** Die gescaffoldeten Vorlagen verbinden sich über `pqcKeypairFromEnv`, sodass ihre Skripte `create` und `submit-batch` hybrid signieren, und sie hingen von `@qorechain/rdk` `^0.6.0` ab (`^0.6.1` seit dem Scaffolder 0.6.1). Die Vorlage `multivm-rollup` prüft, dass das Precompile live ist, und verlangt eine nicht leere Antwort vom Ziel.
* **Python, Go, Rust und Java.** Die oben genannten Korrekturen auf der Leseseite (PQC-Route im Singular, `latest_batch`, Anchor-Sign-Bytes v2, Challenge-Fenster-Regeln, ID- und Withdrawal-Prüfungen) sind auch in den veröffentlichten Paketen der vier anderen Sprachen enthalten.
* **Breaking Changes.** `encodeCrossVmCalldata` nimmt `targetVm` entgegen, und `CROSS_VM_DEFAULT_SIGNATURE` hat sich geändert. `RollupHealth` und `BatchDeadline` tragen ein `challengeWindow` statt der alten sekundenbasierten Frist.

**Einschränkungen, die in 0.7.0 bleiben:**

* **ZK-Settlement kann in keinem der beiden Netzwerke bisher verwendet werden.** Betroffen sind das Profil `defi`, die Vorlage `defi-rollup` und jeder Rollup, der mit `zk`-Settlement erstellt wurde: Die Chain hat noch keine Möglichkeit, einen Verifying Key für einen Rollup zu registrieren, sodass jeder ZK-Batch abgelehnt wird, nachdem seine Gebühr bezahlt wurde. Die Schlüsselregistrierung ist für Chain v3.2.7 geplant. Verwenden Sie bis dahin `optimistic`-Settlement (siehe [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).
* **Der Demo-Circuit der Vorlage `defi` kann nicht verifizieren.** Es ist ein `snarkjs`-Multiplier-Circuit, während die Chain Groth16 über BLS12-381 mit drei öffentlichen Eingaben prüft (der vorherigen State Root, der neuen State Root und dem Data-Hash). Selbst wenn die Schlüsselregistrierung einmal existiert, würde ein Proof des Demo-Circuits nicht bestehen; ersetzen Sie den Circuit durch Ihren eigenen State-Transition-Circuit.
* **In 0.7.0 behoben: Withdrawal-Merkle-Helfer.** In 0.6.2 und früher verwendeten die Helfer standardmäßig SHA-256, und ein mit den Standardwerten gebauter Proof wurde On-Chain nie verifiziert; verwenden Sie ab 0.7.0 `withdrawalsTree` / `assembleWithdrawalProof` (siehe [Blatt- und Knotenkodierung](/rollups/zk-stark-withdrawals#leaf-and-node-encoding)).

* **Nur der TypeScript-Client signiert hybrid.** Die `qorollup`-CLI (ihre Befehle `create`, `pause`, `resume`, `stop` und `withdraw` verbinden sich ohne Post-Quanten-Schlüssel) und die **Python-, Go-, Rust- und Java**-Clients signieren rein klassisch, was beide Netzwerke auf der nativen Lane ablehnen; ihre READMEs sagen das weiterhin. Ihre Nachrichten-Builder haben kein Feld `anchor_signature` oder `validator_set_hash`. Für Transaktionen aus diesen erstellen und signieren Sie mit der Chain-CLI (`--generate-only`, dann `qorechaind tx pqc cosign`) oder verwenden den TypeScript-Client mit einem `pqcKeypair`.
* **Keine hybride Erstellung eines Rollups wurde live erprobt,** weil in keinem der beiden Netzwerke ein Rollup existiert. Dasselbe gilt für verankerte Batches, Withdrawals und den gesamten Beleg-Ablauf.
* **Das Verankern braucht den Ersteller.** Ein Batch wird nur dann in derselben Transaktion verankert, wenn die Signatur des Erstellers darin enthalten ist. Ist der Sequencer eine andere Adresse, muss der Ersteller die v2-Bytes außerhalb des Systems signieren, und der Sequencer sendet das Ergebnis.
* **Das Cross-VM-Precompile unter `0x…0901` ist weiterhin auf keinem der beiden Netzwerke aktiv,** sodass ein Aufruf aus einem Contract im Mainnet nichts bewirkt und auch im Testnet noch nicht nutzbar ist (siehe [Multi-VM](/rollups/multi-vm)).
* **Länge des Challenge-Fensters.** Das Kit liest das eigene Fenster eines Rollups nur, wenn der Node es meldet (das Paket dokumentiert dies als v3.2.4 und später, was beide Netzwerke ausführen). Andernfalls verwendet es das Standardfenster des Moduls; übergeben Sie `challengeWindowSecs` für einen Rollup, der ein eigenes konfiguriert hat. Die älteren Helfer `challengeWindowDeadline` und `isChallengeWindowClosed` werden weiterhin exportiert und nehmen weiterhin Sekunden entgegen, geben Sie ihnen also keine Blockhöhe.
* **Data Availability.** Keine Transaktion sendet einen Blob, sodass ein Batch auf einem Rollup mit `native` oder `both` `dataHash` leer lassen muss (siehe [Data Availability](/rollups/data-availability)). `buildDaBlob` hashte in 0.6.2 und früher mit SHA-256; ab 0.7.0 ist sein Commitment das SHAKE-256 der Chain.

**Versionen vor 0.7.0.** 0.6.2 und früher bauen Withdrawal-Proofs, die On-Chain nie verifiziert werden, und hashen `buildDaBlob` mit SHA-256; verwenden Sie 0.7.0. 0.6.1 und früher installierten die `qorollup`-CLI von npm in einem Zustand, in dem sie nichts ausgab und mit 0 beendete (in 0.6.2 behoben). 0.6.0 vergleicht bei der Beleg-Verifizierung weniger Felder als 0.6.1 und liefert Vorlagen aus, die Batches einreichen, die die Chain ablehnt (einen Data-Hash auf einem Native-DA-Rollup, eine Platzhalter-State-Root bei den optimistischen). 0.5.0 und früher sollten nicht für Settlement-Belege, den Watchtower oder Cross-VM-Calldata verwendet werden: 0.5.0 suchte den Schlüssel des Erstellers auf einer Route, die die Netzwerke nicht bereitstellen (sodass die Beleg-Verifizierung bei jedem echten Beleg fail-closed scheiterte), baute nur die v1-Anchor-Nachricht nach, las eine Blockhöhe als Zeitstempel (jedes Batch-Alter und jede Challenge-Frist war falsch, und der Watchtower löste seine Fristwarnung sofort für jeden Batch aus), rief eine Latest-Batch-Route auf, die die Chain nicht bereitstellt, las nur die ersten 50 Batches, kodierte eine Funktion, die das Precompile nicht dekodiert, und lieferte Vorlagen aus, die rein klassisch signierten. 0.4.x hatte keine Hybrid-Signierung im Transaktions-Client.

#### Python-, Go-, Rust- und Java-Clients

Neben dem TypeScript-Paket bietet das RDK vollständige **Python-**, **Go-**, **Rust-** und **Java-**Clients, die die TypeScript-Oberfläche spiegeln: den Config-Builder mit Validierung, die fünf Preset-Profile, Denom-/Economics-/Bech32-Hilfsfunktionen, Binary-Merkle- und Withdrawal-Proof-Helfer, Rollup-Manifeste, REST- und `qor_`-JSON-RPC-Lese-Clients, Preflight-/Health-Checks, Konten (Mnemonic → `qor`-Adresse) sowie klassische Transaktionssignierung + Broadcast (`SIGN_MODE_DIRECT`, in den Netzwerken mit Hybrid-Signatur nicht akzeptiert — siehe [Änderungen und Einschränkungen von RDK 0.7.0](#rdk-050-limits)). Alle sind gegen gemeinsame sprachübergreifende Golden-Vektoren verifiziert und in ihren jeweiligen Registries **veröffentlicht**:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go (pin the version)
go get github.com/qorechain/qorechain-rdk/packages/go@v0.7.0

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.7.0
```

```python
import qorrdk
```

Aktuell veröffentlichte Versionen, alle **0.7.0** (geprüft am 27. Oktober 2026): Python `qorechain-rdk` (PyPI, Import `qorrdk`), Go-Modul `github.com/qorechain/qorechain-rdk/packages/go` (`v0.7.0`), Rust `qorechain-rdk` (crates.io) und Java `io.github.qorechain:qorechain-rdk` (Maven Central). Diese Clients lesen den Chain-Zustand; sie erzeugen weiterhin nicht die hybride Signatur, die die Netzwerke verlangen, und ihre Nachrichten-Builder tragen keine Anchor-Felder (siehe [Änderungen und Einschränkungen von RDK 0.7.0](#rdk-050-limits)).

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
Die Vorlagen von `create-qorechain-rollup` 0.7.0 hängen von `@qorechain/rdk` `^0.7.0` ab. Ihre Skripte `create` und `submit-batch` verbinden sich über `connectOperator()` in `src/signer.ts`, das Ihren Post-Quanten-Schlüssel aus `QORE_MNEMONIC` auflöst (oder aus `QORE_PQC_SEED_HEX`, wenn Sie mit `QORE_OPERATOR_PRIVATE_KEY_HEX` signieren), ihn gegen die Chain prüft und hybrid signiert; ist keines von beiden gesetzt, warnt das Skript und signiert rein klassisch, was beide Netzwerke ablehnen. Über eine Vorlage wurde in keinem Live-Netzwerk ein Rollup erstellt, daher ist dieser Weg live ungetestet. Das Skript `submit-batch` des Starters ist nur ein Referenzablauf: Seit 0.6.1 lässt es `dataHash` leer (die Chain lehnt einen Data-Hash auf einem Native-DA-Rollup ab), und die optimistischen Vorlagen veröffentlichen die kanonische State Root statt eines Platzhalters; für den Rest verwendet es weiterhin illustrative Werte und soll in einem Live-Netzwerk keinen Batch finalisieren. Die Vorlage `defi-rollup` (ZK) hält ab 0.7.0 vor dem Senden eines Batches an, weil die Chain ihn ablehnen würde (siehe [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).
:::

### Eine Rollup-Konfiguration per Code erstellen

Erstellen Sie eine Konfiguration aus einem Preset, lesen Sie den aktuellen Stake und die Burn-Rate von der Chain und erzeugen Sie die Create-Nachricht. Der Config-Builder erzwingt die Kompatibilitätsmatrix zwischen Settlement und Proof bei `validate()` / `build()`. Senden Sie die resultierenden Werte mit der CLI oben oder mit dem TypeScript-Client, dem ein `pqcKeypair` übergeben wurde — siehe [Änderungen und Einschränkungen von RDK 0.7.0](#rdk-050-limits).

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

Verwenden Sie für Batches `rdk.rest.getBatch(rollupId, index)` oder `qorechaind query rdk batch [rollup-id]` (unten); `getLatestBatch` und `listBatches` lesen seit 0.6.0 die Route `latest_batch` der Chain und jede Seite der Batch-Liste (siehe [Änderungen und Einschränkungen von RDK 0.7.0](#rdk-050-limits)).

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

**Ab Chain v3.2.5 (beide Netzwerke):** Ein Rollup kann nicht gestoppt werden, solange sein neuester Batch `submitted` oder `challenged` ist, lösen Sie ihn also zuerst auf oder finalisieren Sie ihn; ein gestoppter Rollup gibt seinen Platz unter dem Rollup-Limit des Moduls frei. Vor v3.2.5 galt keine der beiden Regeln. Aus TypeScript sagen Ihnen `stopRollupError` und die Vorprüfung in `stopRollup` Bescheid, bevor Sie die Gebühr bezahlen.

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
* Ein `zk`-Rollup muss einen Proof anhängen, und der Proof muss verifiziert werden; bisher kann kein ZK-Batch akzeptiert werden (siehe [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)).
* **Ab Chain v3.2.5 (beide Netzwerke):** Die `withdrawals_root` eines Batches muss leer oder genau 32 Bytes lang sein, und ein Rollup hält höchstens 4.096 ausstehende optimistische Batches (`MAX_PENDING_OPTIMISTIC_BATCHES` im RDK); Batches werden außerdem in Indexreihenfolge finalisiert, sodass ein späterer Batch auf einen früheren wartet, der noch `submitted` oder `challenged` ist. Das RDK prüft die Länge der Root vor jeder Einreichung. Vor v3.2.5 galt keine dieser drei Regeln.

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

`layer-id` ist die Layer-ID des Rollups (bei vom RDK erstellten Rollups die Rollup-ID). Aus TypeScript signiert `RdkTxClient.submitBatch` in `@qorechain/rdk` 0.6.0 und später den Anker für Sie, wenn der Client hybrid signiert und der Ersteller des Rollups ist, und `anchorSignBytesForBatch` gibt einem Ersteller die Bytes zum Signieren außerhalb des Systems (siehe [Änderungen und Einschränkungen von RDK 0.7.0](#rdk-050-limits)). Der ZK-`--proof` für einen `zk`-Rollup hat heute kein CLI-Flag, und die Resolve-Challenge-Nachricht ist kein CLI-Befehl: Verwenden Sie einen Client. Siehe [Settlement-Belege](/rollups/settlement-receipts), was ein Anker beweist und was nicht. In keinem der beiden Netzwerke existiert bisher ein Rollup, Layer oder Anker.

### Einen Batch anfechten (optimistische Rollups) {#challenge-a-batch-optimistic-rollups}

Jedes Konto kann einen Batch im Status `submitted` innerhalb des Challenge-Fensters (standardmäßig 100.800 Blöcke für einen im Mainnet vor Höhe 3.742.566 eingereichten Batch; ab v3.2.4 ein Fenster in Sekunden der Blockzeit für neue Batches: im Testnet seit Höhe 8.337.253, im Mainnet seit Höhe 3.742.566) anfechten, indem es einen Bond (den `challenge_bond` des Rollups; 1.000 QOR für die Presets `nft` und `custom`) und einen Fraud-Proof hinterlegt. Ein optimistischer Batch wird danach beurteilt, ob seine State Root die kanonische Transition Root ist, daher sollte ein Einreicher genau diese Root veröffentlichen (die Vorlagen von RDK tun das ab 0.6.1; siehe [Änderungen und Einschränkungen von RDK 0.7.0](#rdk-050-limits)). Nimmt die Rollup-ID und den Batch-Index entgegen; übergeben Sie den Fraud-Proof mit `--proof`:

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

Eine Challenge **friert** den Batch ein (`challenged`): Er kann nicht finalisiert werden. Vor v3.2.5 konnte nur der Ersteller des Rollups sie auflösen; ab v3.2.5 (beide Netzwerke) kann das **jedes Konto**, wie unten beschrieben. Die Auflösung wird mit einer Resolve-Challenge-Nachricht eingereicht (nicht als CLI-Befehl verfügbar; verwenden Sie einen Client). Die Chain entscheidet das Ergebnis selbst, indem sie den gespeicherten Proof verifiziert. Wird der Betrug bestätigt, wird der Batch `rejected`, der Bond wird zurückerstattet und der Challenger erhält zusätzlich einen Betrag in Höhe des Bonds aus dem Stake des Rollups; wird die Challenge abgewiesen, geht der Bond an den Ersteller und der Batch kehrt zu `submitted` zurück.

**Ab Chain v3.2.5 (beide Netzwerke):** **Jedes Konto** kann eine Challenge auflösen, nicht nur der Ersteller. Ein bestätigter Betrug lehnt diesen Batch **und jeden späteren, noch nicht finalisierten Batch** ab, und der Sequencer reicht diese Batches ab der letzten guten State Root unter denselben Indizes erneut ein; der Rollup läuft von dort aus weiter. Der Watchtower unterscheidet solche Batches anhand von Index und State Root (siehe [Watchtower](/rollups/watchtower)).

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
