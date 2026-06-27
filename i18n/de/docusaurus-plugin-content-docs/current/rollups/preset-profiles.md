---
slug: /rollups/preset-profiles
title: Preset-Profile
sidebar_label: Preset-Profile
sidebar_position: 2
---

# Preset-Profile

Das RDK liefert **Preset-Profile**, die schlüsselfertige Rollup-Konfigurationen bereitstellen, abgestimmt auf gängige Anwendungskategorien. Ein Preset bündelt einen Abwicklungsmodus, einen Sequencer-Modus, ein Datenverfügbarkeits-Backend und Ausführungsparameter, sodass Sie ein Rollup starten können, ohne jede Option von Hand auswählen zu müssen.

Ein Profil wird positional an `create-rollup` übergeben:

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount]
```

:::note
Die nachstehenden Werte je Preset entsprechen den ausgelieferten Profil-Standardwerten von **`@qorechain/rdk`**, die die veröffentlichte Profiltabelle des Netzwerks widerspiegeln. Sie können sich mit der Reifung des RDK weiterentwickeln — fragen Sie die Live-Modulparameter mit `qorechaind query rdk config` ab (oder `RdkClient.params()` aus dem SDK), um die maßgebliche Konfiguration zu erhalten, und validieren Sie auf dem **`qorechain-diana`**-Testnet, bevor Sie ins Mainnet gehen.
:::

---

## Die Preset-Profile

Jedes Preset bündelt ein Abwicklungsparadigma (und das von seiner Abwicklung benötigte Beweissystem), einen Sequencer-Modus, ein Datenverfügbarkeits-Backend, ein Gas-Modell und eine VM:

| Profil | Abwicklung (Beweis) | Sequencer | DA | Gas-Modell | VM | Vorgesehener Anwendungsfall |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK) | dedicated | native | EIP-1559 | EVM | DeFi- und AMM-artige Anwendungen — Kreditmärkte, DEXs und Derivate, bei denen schnelle Finalität und vorhersehbare Gebühren wichtig sind |
| **`gaming`** | based | based | native | flat | custom | Spielzustand und In-Game-Ökonomien mit hohem Durchsatz und niedriger Latenz |
| **`nft`** | optimistic (fraud) | dedicated | native (Celestia DA geplant) | standard | CosmWasm | NFT-Minting, Marktplätze und digitale Sammlerstücke |
| **`enterprise`** | based | based | native | subsidized | EVM | Berechtigungsbeschränkte und Konsortial-Bereitstellungen mit gesponserten (subventionierten) Gebühren |
| **`custom`** | vollständig parametrisiert (Standardwerte: optimistic / fraud) | vollständig parametrisiert | vollständig parametrisiert | vollständig parametrisiert | vollständig parametrisiert (Standard: EVM) | Jedes Feld ist benutzerdefiniert — von Grund auf beginnen und jede Option selbst festlegen |

Einige Einschränkungen ergeben sich aus der [Abwicklung-→-Beweis-Matrix](/rollups/overview): `optimistic`-Abwicklung nutzt `fraud`-Beweise, `zk` nutzt `snark` (oder `stark`), und `based` und `sovereign` führen keinen Beweis. `based`-Abwicklung wird stets mit dem `based`-Sequencer-Modus gepaart. Das `nft`-Preset wickelt heute nativ ab, mit **geplantem Celestia DA**.

:::note
Die Konfiguration je Preset wurde live On-Chain auf Chain-Version **v3.1.74** verifiziert, wo `create-rollup` das Preset des Profils automatisch anwendet: **`defi` = zk + EVM, `gaming` = based + custom VM, `nft` = optimistic + CosmWasm, `enterprise` = based + EVM, `custom` = optimistic + EVM (Standardwerte)**. Das `custom`-Preset lässt jedes Feld offen — die gezeigten Werte sind seine Ausgangs-Standardwerte.
:::

Behandeln Sie die vier Domänen-Presets als sinnvolle Ausgangspunkte und das **`custom`**-Profil als die vollständig offene Option. Die genauen gebündelten Parameter können sich zwischen Releases ändern — fragen Sie `rdk config` (unten) für die maßgeblichen Werte ab, beginnen Sie dann mit dem nächstgelegenen Preset und verfeinern Sie es.

Die CLI [`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) gerüstet ein lauffähiges Starter-Projekt — eine Vorlage pro Profil (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — sodass Sie mit einem einzigen Befehl von einem Profil zu funktionierendem Erstellungs-/Abfragecode gelangen.

---

## Eine Empfehlung erhalten: `suggest-profile`

Wenn Sie unsicher sind, welches Preset passt, nimmt die `suggest-profile`-Abfrage eine Beschreibung Ihres Anwendungsfalls in einfacher Sprache entgegen und gibt ein empfohlenes Profil zurück.

```bash
qorechaind query rdk suggest-profile [use-case]
```

**Beispiel:**

```bash
qorechaind query rdk suggest-profile "a lending protocol with predictable fees"
```

Der Vorschlag ist ein hilfreicher Ausgangspunkt — prüfen Sie die Empfehlung anhand Ihrer konkreten Anforderungen (Abwicklungsgarantien, Sequencer-Vertrauensmodell, Datenverfügbarkeitsanforderungen und VM), bevor Sie sich auf eine Konfiguration festlegen.

---

## Preset-Konfiguration On-Chain inspizieren

Da die Preset-Spezifika On-Chain aufgelöst werden, besteht der maßgebliche Weg, zu sehen, worauf ein Profil aufgelöst wird, darin, das Modul und das erstellte Rollup abzufragen:

```bash
# Module-level parameters that govern rollup creation and defaults
qorechaind query rdk config

# After creation, inspect the resolved configuration of a specific rollup
qorechaind query rdk rollup [rollup-id]

# List all registered rollups
qorechaind query rdk list-rollups
```

Dieses Muster — `config` vor der Bereitstellung abfragen, dann `rollup` danach — lässt Sie genau bestätigen, was Ihr gewähltes Preset erzeugt hat, anstatt sich auf dokumentierte Werte zu verlassen, die sich weiterentwickeln können.

---

## Nächste Schritte

* **[Ein Rollup bereitstellen](/rollups/deploying-a-rollup)** — ein Rollup aus einem Preset über das Dashboard oder die CLI erstellen und dann seinen Lebenszyklus verwalten.
* **[Rollups – Überblick](/rollups/overview)** — die Abwicklungsparadigmen und Sequencer-Modi, die ein Preset bündelt.
* **[Rollup Development Kit](/architecture/rollup-development-kit)** — die tiefer liegende Modulreferenz.
