---
slug: /rollups/preset-profiles
title: Preset-Profile
sidebar_label: Preset-Profile
sidebar_position: 2
---

# Preset-Profile

Das RDK liefert **Preset-Profile** mit, die schlüsselfertige Rollup-Konfigurationen bereitstellen, abgestimmt auf gängige Anwendungskategorien. Ein Preset bündelt einen Settlement-Modus, einen Sequencer-Modus, ein Data-Availability-Backend und Ausführungsparameter, sodass Sie ein Rollup starten können, ohne jede Option einzeln auswählen zu müssen.

Ein Profil wird positionell an `create-rollup` übergeben:

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount]
```

:::note
Die untenstehenden Werte pro Preset entsprechen den ausgelieferten Profil-Standardwerten von **`@qorechain/rdk`**, die die veröffentlichte Profiltabelle des Netzwerks widerspiegeln. Sie können sich mit der Weiterentwicklung des RDK dennoch ändern — fragen Sie die aktuellen Modulparameter mit `qorechaind query rdk config` (oder `RdkClient.params()` aus dem SDK) ab, um die maßgebliche Konfiguration zu erhalten, und validieren Sie auf dem **`qorechain-diana`**-Testnet, bevor Sie ins Mainnet gehen.
:::

---

## Die Preset-Profile

Jedes Preset bündelt ein Settlement-Paradigma (und das Beweissystem, das dieses Settlement erfordert), einen Sequencer-Modus, ein Data-Availability-Backend, ein Gas-Modell und eine VM:

| Profil | Settlement (Beweis) | Sequencer | DA | Gas-Modell | VM | Vorgesehener Anwendungsfall |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK) | dedicated | native | EIP-1559 | EVM | DeFi- und AMM-artige Anwendungen — Lending-Märkte, DEXs und Derivate, bei denen schnelle Finalität und vorhersehbare Gebühren zählen |
| **`gaming`** | based | based | native | flat | custom | Spielzustände mit hohem Durchsatz und niedriger Latenz sowie In-Game-Ökonomien |
| **`nft`** | optimistic (fraud) | dedicated | native (Celestia DA geplant) | standard | QoreChain Native (`native`) | NFT-Minting, Marktplätze und digitale Sammlerstücke |
| **`enterprise`** | based | based | native | subsidized | EVM | Permissioned- und Konsortiums-Deployments mit gesponserten (subventionierten) Gebühren |
| **`custom`** | vollständig parametrierbar (Standard: optimistic / fraud) | vollständig parametrierbar | vollständig parametrierbar | vollständig parametrierbar | vollständig parametrierbar (Standard: EVM) | Jedes Feld ist benutzerdefiniert — beginnen Sie bei null und legen Sie jede Option selbst fest |

Einige Einschränkungen ergeben sich aus der [Settlement-→-Beweis-Matrix](/rollups/overview): `optimistic`-Settlement verwendet `fraud`-Beweise, `zk` verwendet `snark` (oder `stark`), und `based` sowie `sovereign` tragen keinen Beweis. `based`-Settlement wird immer mit dem `based`-Sequencer-Modus kombiniert. Das `nft`-Preset settelt heute nativ, mit **Celestia DA geplant**.

Seit RDK v0.4.2 heißt die Wasm-VM-Option (die Laufzeitumgebung, die CosmWasm-Verträge ausführt) **`native`** — QoreChain Native. `cosmwasm` bleibt als Legacy-Alias akzeptiert, und beide werden auf der Leitung auf `cosmwasm` abgebildet, sodass Chain, Explorer und Dashboard unverändert bleiben.

:::note
Die Konfiguration pro Preset wurde live auf Chain-Version **v3.1.74** verifiziert, wo `create-rollup` das Preset des Profils automatisch anwendet: **`defi` = zk + EVM, `gaming` = based + custom VM, `nft` = optimistic + QoreChain Native (Wasm), `enterprise` = based + EVM, `custom` = optimistic + EVM (Standardwerte)**. Das `custom`-Preset lässt jedes Feld offen — die gezeigten Werte sind seine Ausgangs-Standardwerte.
:::

Betrachten Sie die vier Domänen-Presets als sinnvolle Ausgangspunkte und das **`custom`**-Profil als die vollständig offene Option. Die genauen gebündelten Parameter können sich zwischen Releases ändern — fragen Sie `rdk config` (unten) für die maßgeblichen Werte ab, starten Sie dann vom nächstliegenden Preset und verfeinern Sie es.

Die CLI [`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) erzeugt ein lauffähiges Starterprojekt — eine Vorlage pro Profil (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — sodass Sie mit einem einzigen Befehl von einem Profil zu funktionierendem Create-/Query-Code gelangen.

---

## Eine Empfehlung erhalten: `suggest-profile`

Wenn Sie unsicher sind, welches Preset passt, nimmt die Query `suggest-profile` eine Beschreibung Ihres Anwendungsfalls in natürlicher Sprache entgegen und gibt ein empfohlenes Profil zurück.

```bash
qorechaind query rdk suggest-profile [use-case]
```

**Beispiel:**

```bash
qorechaind query rdk suggest-profile "a lending protocol with predictable fees"
```

Der Vorschlag ist ein hilfreicher Ausgangspunkt — prüfen Sie die Empfehlung anhand Ihrer spezifischen Anforderungen (Settlement-Garantien, Sequencer-Vertrauensmodell, Data-Availability-Bedarf und VM), bevor Sie sich auf eine Konfiguration festlegen.

---

## Preset-Konfiguration on-chain inspizieren

Da die Preset-Details on-chain aufgelöst werden, ist der maßgebliche Weg, um zu sehen, wozu ein Profil aufgelöst wird, die Abfrage des Moduls und des erstellten Rollups:

```bash
# Module-level parameters that govern rollup creation and defaults
qorechaind query rdk config

# After creation, inspect the resolved configuration of a specific rollup
qorechaind query rdk rollup [rollup-id]

# List all registered rollups
qorechaind query rdk list-rollups
```

Dieses Muster — `config` vor dem Deployment abfragen, danach `rollup` abfragen — lässt Sie genau bestätigen, was Ihr gewähltes Preset erzeugt hat, statt sich auf dokumentierte Werte zu verlassen, die sich weiterentwickeln können.

---

## Nächste Schritte

* **[Ein Rollup deployen](/rollups/deploying-a-rollup)** — erstellen Sie ein Rollup aus einem Preset über das Dashboard oder die CLI und verwalten Sie anschließend seinen Lebenszyklus.
* **[Rollups-Überblick](/rollups/overview)** — die Settlement-Paradigmen und Sequencer-Modi, die ein Preset bündelt.
* **[Rollup Development Kit](/architecture/rollup-development-kit)** — die tiefergehende Modulreferenz.
