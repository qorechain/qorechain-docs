---
slug: /developer-tools/asset-kit
title: QoreChain Asset Kit
sidebar_label: Asset Kit
sidebar_position: 35
---

# QoreChain Asset Kit

Das QoreChain Asset Kit ist quelloffenes Tooling zum Ausgeben und Verwalten zugangsbeschränkter (permissioned) Token, die reale Vermögenswerte auf QoreChain abbilden. Es hat zwei Teile mit unterschiedlichem Status. Der eine Teil ist ein Satz von EVM-Contracts, die heute auf der QoreChain-EVM-Engine laufen: Adapter für zwei offene Token-Standards für regulierte Vermögenswerte (ERC-3643 und CMTAT), Vaults mit beschränkten Anteilen und eine QoreChain-spezifische Kontrolle, die verlangt, dass jeder Halter einen registrierten ML-DSA-87-Schlüssel hat. Der andere Teil ist ein **Vorschlag** für native Chain-Module, veröffentlicht als Protobuf-Schnittstellen mit Clients in vier Sprachen und einem In-Memory-Mock, damit Anwendungen gegen die vorgeschlagenen Regeln entworfen und getestet werden können.

Es richtet sich an Emittenten, Transfer-Agenten, Fondsverwalter, Compliance- und Rechtsteams sowie Integratoren, die einen regulierten Token im QoreChain-Testnet prototypisch bauen möchten. Version **0.1.0**, Apache-2.0 (mit den Lizenzausnahmen unter [Wo es veröffentlicht ist](#where-published)), gepflegt von der QoreChain Association. Es ist vor 1.0 und **nicht auditiert**.

:::caution Was live ist und was nicht
- **Funktioniert heute, nur im Testnet:** die EVM-Contracts, die Foundry-Deployment-Skripte und die Emittenten-Konsole, auf `qorechain-diana` (EVM-Chain-ID 9800). Die Halterprüfung liest die Precompile `pqcKeyStatus` bei `0x0A02`, die im Testnet aktiv und im Mainnet **nicht aktiv** ist.
- **Mainnet (`qorechain-vladi`, EVM-Chain-ID 9801):** Die Halterprüfung schlägt geschlossen fehl (**fail closed**). Jede Adresse, die nicht ausdrücklich ausgenommen ist, gilt als nicht berechtigt, sodass ein durch den Guard beschränkter Token nicht zwischen gewöhnlichen Haltern bewegt werden kann. Die Deployment-Skripte weigern sich, auf Chain 9801 zu laufen.
- **Ein Vorschlag, nirgends live:** Die nativen Module `x/asset`, `x/identity`, `x/compliance`, `x/settlement` und `x/attest` existieren in keinem QoreChain-Netzwerk, und kein Upgrade, das sie hinzufügt, ist geplant. Die Clients dafür können nur mit einem In-Memory-Mock sprechen.
- **Rechtsvorlagen** im Repository sind ungeprüfte Entwürfe für die Besprechung mit Rechtsberatern. Sie sind keine Rechtsberatung.
:::

## Innovationen {#innovations}

- **Eine Post-Quantum-Halterprüfung zusätzlich zu den eigenen Kontrollen des Standards.** Der Guard liest `pqcKeyStatus(address)` bei `0x0A02` und akzeptiert eine Adresse nur, wenn die Antwort `registered`, Algorithmus-ID 1 (ML-DSA-87) und `possessionProven` lautet. Ein ohne Besitznachweis registrierter Schlüssel könnte jemand anderem gehören und zählt daher nicht. Jede Kontrolle des Upstream-Standards (Identitätsregister, Claim-Topics, Einfrieren, Pause, erzwungene Übertragung) gilt weiterhin; die Prüfung kommt zu ihnen hinzu.
- **Fail closed, mit strikter Dekodierung.** Der Guard ruft die Precompile mit einem festen Gas-Kontingent auf und dekodiert die Antwort strikt. Eine Antwort im älteren Layout mit drei Feldern, eine fehlerhafte Antwort oder gar keine Antwort wird als „kein Schlüssel“ behandelt. Wo die Precompile nicht aktiv ist, ist jede nicht ausgenommene Adresse nicht berechtigt.
- **Derselbe Guard hinter drei Adaptern.** `QoreChainHybridHolderRule` wird als `ruleEngine` in einen CMTAT-v3-Token eingesteckt (oder als Regel in einer CMTA RuleEngine) mit den Restriktionscodes 60, 61 und 62; `QoreChainHybridHolderModule` wird als Plug-and-play-Modul in die modulare ERC-3643-Compliance eingesteckt; die Vaults nehmen jede `IHolderEligibility`-Richtlinie, den Guard eingeschlossen.
- **Vault-Anteile, die einen beschränkten Token nicht waschen können.** `QoreChainRwaVault` (ERC-4626) und `QoreChainRwaAsyncVault` (ERC-7540, Anfragen werden von einem Operator mit `FULFILLER_ROLE` in Stapeln abgewickelt) prüfen die Empfängerseite jeder Anteilsbewegung: `maxDeposit` und `maxMint` liefern null für einen nicht berechtigten Empfänger. Rücknahmen werden nie abgelehnt.
- **Upstream-Contracts unverändert verwendet.** T-REX 4.1.6, ONCHAINID 2.2.1, CMTAT 3.2.0 und OpenZeppelin sind Git-Submodule, keine Kopien.
- **Ein Vorschlag, der getestet werden kann, bevor er existiert.** Jeder Aufruf des `ChainClient` schlägt mit `ChainUpgradeRequired` fehl (Code `CHAIN_UPGRADE_REQUIRED`, plus Modulname), ohne eine Netzwerkanfrage zu senden. Ein `MockChain` implementiert die vorgeschlagenen Regeln im Speicher und lehnt mit `MockChainError` ab, der den Namen des vorgeschlagenen Fehlercodes trägt, zum Beispiel `ERROR_CODE_ADDRESS_FROZEN`. Eine Anwendung kann gegen den Mock geschrieben werden und den echten Client angebunden lassen, sodass ein fehlendes Upgrade klar gemeldet wird, statt stillschweigend zu scheitern.
- **Eine Konsole ohne Backend.** Die Emittenten-Konsole ist eine React-Seite, die keine eigene Netzwerkanfrage stellt; der Produktions-Build setzt eine Content-Security-Policy mit `connect-src 'none'`, und alles läuft über die verbundene Wallet.
- **Tests, die offline laufen.** 33 Foundry-Tests laufen ohne Netzwerk, mit einem Test-Double der Precompile.

## Was es tut {#what-it-does}

**Funktioniert heute auf der QoreChain-EVM (Testnet):**

- **`QoreChainHybridHolderGuard`.** Meldet, ob eine Adresse einen registrierten ML-DSA-87-Schlüssel mit Besitznachweis hat (`isHybridHolder`, `isEligible`, `requireHybridHolder`, `keyStatus`, `precompileActive`). Vom Eigentümer verwaltete Ausnahmen für Contracts wie Vaults und Escrows (`setExempt`, Event `ExemptionSet` mit einer Begründung). Das Eigentum wechselt in zwei Schritten (OpenZeppelin `Ownable2Step`).
- **`QoreChainHybridHolderRule`.** Eine CMTAT-v3-Übertragungsregel, die auf den Guard abgebildet ist. Restriktionscodes 60 (Sender), 61 (Empfänger) und 62 (Spender) über `detectTransferRestriction`, `detectTransferRestrictionFrom` und `messageForTransferRestriction`.
- **`QoreChainHybridHolderModule`.** Ein Modul der modularen ERC-3643-Compliance (T-REX v4), das auf den Guard abgebildet ist. `moduleCheck` prüft Sender und Empfänger. Keine Konfiguration pro Compliance.
- **`QoreChainRwaVault` und `QoreChainRwaAsyncVault`.** Oben beschrieben.
- **`IERC7518`.** Eine Schnittstellenskizze für ERC-7518-Partitionen, ohne Implementierung; ihre ERC-165-ID `0x5a264a5d` wird von einem Test geprüft.
- **Deployment-Skripte (Foundry).** `script/DeployCmtat.s.sol`, `script/erc3643/DeployErc3643.s.sol` und `script/DeployVaults.s.sol`, mit einem gemeinsamen Preflight (`script/QoreChainTestnet.sol`), der meldet, ob die Precompile antwortet und wie der Schlüsselstatus des Deployers ist, und der Chain 9801 ablehnt.
- **Emittenten-Konsole** (`packages/issuer-console`). Verbindet jede EIP-6963-Wallet, fügt QoreChain Testnet hinzu oder wechselt dorthin, erstellt einen durch den Guard beschränkten CMTAT-Token (Guard, Regel und Token, wie in `DeployCmtat.s.sol`), öffnet bestehende CMTAT- oder ERC-3643-Token, führt Agentenaktionen aus (Mint, Burn, Einfrieren, Auftauen, erzwungene Übertragung, Pause, Pause aufheben) und zeigt Halter und ein aus Chain-Events aufgebautes Audit-Protokoll.

**Vorschlag (nicht on-chain):**

- Protobuf-Schnittstellen in `proto/` für `x/asset`, `x/identity`, `x/compliance`, `x/settlement` und `x/attest`, und ihre Semantik in `docs/proposal.md`.
- Clients in TypeScript, Python, Go und Java: generierte Typen, der `ChainClient` und der `MockChain`.

**Referenzdokumente im Repository:**

- `docs/evm-adapters.md`: die Contracts, Upstream-Lizenzen, Testnet-Deployment.
- `docs/technology-standards.md`: ein Entwurf, der die Netzwerke so beschreibt, wie ein Emittent oder Prüfer sie sehen müsste (Zuverlässigkeit, Governance, Upgrade-Befugnis, Transaktionsreihenfolge, Beobachtbarkeit, Vorfallbehandlung, Schlüsselverwaltung), jede Tatsache gekennzeichnet als Verified, Documented, Not measured oder Not published.
- `legal/`: drei Vorlagen zur Besprechung (siehe [Grenzen](#limits)).

## Anwendungsfälle {#use-cases}

1. **Ein Emittent baut einen zugangsbeschränkten Token im Testnet als Prototyp.** Der Emittent deployt einen CMTAT-Token mit `DeployCmtat.s.sol` (oder aus der Emittenten-Konsole) oder eine vollständige ERC-3643-Suite mit `DeployErc3643.s.sol` und probiert Einfrieren, Pause, erzwungene Übertragung und die Halterprüfung auf `qorechain-diana` aus, bevor irgendeine Entscheidung über eine echte Emission fällt.
2. **Ein Fondsverwalter wickelt Zeichnungen und Rücknahmen über Vaults mit beschränkten Anteilen ab.** Anleger beantragen Einzahlungen bei `QoreChainRwaAsyncVault`; der Verwalter bearbeitet sie in Stapeln mit `fulfillDeposit` und `fulfillRedeem`; Anteile können nur von berechtigten Adressen empfangen werden, während Rücknahmen für jeden offen bleiben, der Anteile hält.
3. **Ein Compliance-Team verlangt für jeden Halter die Registrierung eines Post-Quantum-Schlüssels.** Mit `QoreChainHybridHolderRule` (CMTAT) oder `QoreChainHybridHolderModule` (ERC-3643) kann ein Token nur an Adressen mit einem registrierten, durch Besitznachweis belegten ML-DSA-87-Schlüssel gemintet oder übertragen werden, zusätzlich zu den eigenen Identitäts- und Allowlist-Kontrollen des Standards.
4. **Ein Integrator baut gegen die vorgeschlagenen nativen Module.** Eine Wallet, ein Register oder ein Back Office programmiert gegen `MockChain` in TypeScript, Python, Go oder Java, prüft per Assertion seine Events und Fehlercodes und lässt `ChainClient` angebunden.
5. **Ein Produktteam entwirft Abläufe für Lieferung gegen Zahlung und Attestierung.** Das vorgeschlagene `x/settlement` (Anweisungen mit bilateraler Bestätigung, alle Teile oder keines) und `x/attest` (Aussagen mit Gültigkeitsdauer und Veralterung) lassen sich in `MockChain` durchspielen, um Nutzerabläufe zu entwerfen, im Wissen, dass keines von beiden on-chain existiert.
6. **Ein Rechtsteam beginnt den Papierkram mit Rechtsberatern.** Die Vorlagen für ein Schweizer Registerwertrecht, Liechtensteiner TVTG-Token-Bedingungen und eine Engagement-Skizze für die EU-DLT-Pilotregelung geben eine Struktur und einen technischen Zuordnungsabschnitt zum Ausfüllen. Qualifizierte Rechtsberater in der jeweiligen Rechtsordnung prüfen alles vor jeder Verwendung.
7. **Ein Due-Diligence-Prüfer liest die Netzwerkfakten.** `docs/technology-standards.md` listet auf, was in den Live-Netzwerken geprüft werden kann und was nicht gemessen oder nicht veröffentlicht ist, mit Quellen.

## So funktioniert es {#how-it-works}

### Die Halterprüfung auf der EVM {#holder-check}

Die Precompile bei `0x0A02` beantwortet `pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey, bool possessionProven)`. Der Guard verlangt `registered && algorithmId == 1 && possessionProven`. Dadurch schlägt der Guard geschlossen fehl (fail closed): Wo die Precompile nicht aktiv ist, ist jede nicht ausdrücklich ausgenommene Adresse nicht berechtigt. Die Precompile selbst und ihren Netzwerkstatus finden Sie unter [EVM-Precompiles](/developer-guide/evm-precompiles).

```
                 CMTAT v3 token  -- ruleEngine -->  QoreChainHybridHolderRule --+
                                                                                +--> QoreChainHybridHolderGuard --> 0x0A02 pqcKeyStatus
ERC-3643 token -> ModularCompliance - module -->  QoreChainHybridHolderModule --+         (exemptions for contracts)
                                                                                |
       ERC-4626 / ERC-7540 vault shares ----------- IHolderEligibility ---------+
```

Die Prüfung ist additiv. Jede Kontrolle des Upstream-Standards gilt weiterhin: ERC-3643-Identitätsregister (ONCHAINID), Claim-Topics, vertrauenswürdige Aussteller, Einfrieren, teilweises Einfrieren, Pause, erzwungene Übertragung und Wiederherstellung; CMTAT-Einfrieren, teilweises Einfrieren, Pause, erzwungene Übertragung, Dokumente und Snapshots.

### Was die Prüfung abdeckt {#coverage}

Entscheidend ist das Empfangen: Ein Mint oder eine Übertragung an eine Adresse ohne Schlüssel wird abgelehnt. Die CMTAT-Regel prüft außerdem den Sender und bei `transferFrom` den Spender. Das ERC-3643-Modul prüft Sender und Empfänger; ERC-3643 übergibt den Spender nicht an Compliance-Module, daher wird ein `transferFrom`-Spender dort nicht geprüft. Burns werden nie abgelehnt (in ERC-3643 fragt `burn` die Compliance-Module gar nicht ab), sodass ein Halter, der die Berechtigung verloren hat, trotzdem ausgelöst werden kann.

### Vaults {#vaults}

Beide Vaults prüfen die Empfängerseite jeder Anteilsbewegung; Rücknahmen werden nie abgelehnt. Im ERC-7540-Vault werden Anfragen pro Controller aggregiert (Anfrage-ID 0). Der Fulfiller wandelt ausstehende Einzahlungen bei der Erfüllung zum eigenen Verhältnis von Vermögenswerten pro Anteil des Vaults in Anteile um, ohne externe Bewertungseingabe; Controller beanspruchen dann mit `deposit` oder `mint`, oder `redeem` oder `withdraw`. Der Vault-Contract selbst muss den zugrunde liegenden Token halten dürfen: im ERC-3643-Identitätsregister oder in der CMTAT-Allowlist registriert und im Guard ausgenommen (`DeployVaults.s.sol` setzt die Guard-Ausnahmen).

### Eine EVM-Transaktion auf QoreChain senden {#native-prerequisites}

Jede EVM-Transaktion auf QoreChain wird nur zugelassen, wenn der Sender Folgendes hat:

1. einen registrierten ML-DSA-87-Schlüssel, registriert mit `MsgRegisterPQCKeyV2` und einem Besitznachweis, und
2. ein offenes EVM-Autorisierungsfenster, geöffnet durch `/qorechain.pqc.v1.MsgOpenEVMWindow` in einer hybrid signierten (secp256k1 plus ML-DSA-87) Transaktion der nativen Lane.

Für Deployments braucht das Fenster **leere** `allowed_targets` (ein auf Ziele beschränktes Fenster lehnt die Contract-Erstellung ab), `max_txs` mindestens in Höhe der Anzahl der Transaktionen, `max_value` so, dass es den Wert plus die maximale Gebühr jeder Transaktion abdeckt, `blocks` lang genug (höchstens 17.280) und `native_only` auf false. Das Öffnen des Fensters erhöht die Konto-Sequenz, die zugleich die EVM-Nonce ist: Öffnen Sie zuerst das Fenster und führen Sie dann das Skript aus. Aufrufe und Gasschätzung brauchen kein Fenster. Hintergrund: [Post-Quantum-Signierung](/developer-guide/post-quantum-signing) und [EVM-Entwicklung](/developer-guide/evm-development#evm-window).

### Der Vorschlag {#proposal}

Sechs Flags, die bei der Erstellung festgelegt oder nur lockerbar sind (`require_auth`, `freezable`, `pausable`, `non_transferable`, `supply_cap`, `require_hybrid_signature`); Rollen (Emittent, Agenten, Prüfer, Identitäts-Agenten, Claim-Aussteller, Attestierer); geordnete Übertragungsprüfungen; Einfrieren, teilweises Einfrieren, Clawback und erzwungene Übertragung mit protokollierter Begründung; Identitäten mit Claims, aber ohne personenbezogene Daten on-chain; ein Register versionierter Compliance-Module (`identity-verified`, `country-allowlist`, `country-blocklist`, `max-holders`, `max-balance`, `attestation-fresh`); Settlement-Anweisungen mit Bestätigungen; Attestierungen mit dem Status `FRESH`, `STALE` oder `MISSING`. Die Spezifikation ist `docs/proposal.md` im Repository. Wo Text und Mock voneinander abweichen, ist der Text das beabsichtigte Verhalten. All das ist ein Entwurf: Nichts davon existiert in einem QoreChain-Netzwerk.

## So verwenden Sie es {#how-to-use}

### Installation {#install}

| Teil | Installation | Mindestplattform |
|---|---|---|
| Solidity-Contracts (von GitHub) | `git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit` (Tag `v0.1.0`), oder als Foundry-Abhängigkeit: `forge install qorechain/qorechain-asset-kit@v0.1.0` | Foundry; solc 0.8.28 (T-REX- und ONCHAINID-Dateien nutzen 0.8.17); `evm_version = "cancun"` |
| Java | `implementation("io.github.qorechain:asset-kit:0.1.0")` (Maven `io.github.qorechain:asset-kit:0.1.0`) | Java 17 |
| Go | `go get github.com/qorechain/qorechain-asset-kit/clients/go@v0.1.0` (Paket `assetkit`) | Go 1.23 |
| Python | **Kommt** auf PyPI als `qorechain-asset-kit`; noch nicht veröffentlicht. Heute aus einem Klon: `cd clients/python && python -m pip install .` (Import `qorechain_asset_kit`) | Python 3.10 |
| TypeScript | **Kommt** auf npm als `@qorechain/asset-kit`; noch nicht veröffentlicht. Heute aus einem Klon: `pnpm install && pnpm -r build` | Node.js 22.12 |
| Emittenten-Konsole | Aus einem Klon: `pnpm install`, dann `pnpm --filter @qorechain/issuer-console dev` (nicht als Paket veröffentlicht) | Ein Browser mit einer EIP-6963-Wallet |

Das README des Repositorys und das README des TypeScript-Clients importieren aus `@qorechain/asset-kit`, als wäre es installiert. Das funktioniert nur aus einem Klon, bis der npm-Release erscheint.

Mit `forge install` liegen die Contracts unter `lib/qorechain-asset-kit/contracts/` und ihre eigenen Abhängigkeiten unter `lib/qorechain-asset-kit/contracts/lib/`. Remappings, die den Guard, die CMTAT-Regel und die Vaults kompilieren:

```
qorechain-asset-kit/=lib/qorechain-asset-kit/contracts/src/
@openzeppelin/contracts/=lib/qorechain-asset-kit/contracts/lib/openzeppelin-contracts/contracts/
CMTAT/=lib/qorechain-asset-kit/contracts/lib/CMTAT/contracts/
```

### Quickstart 1: Die Contracts bauen und testen (offline) {#quickstart-build}

Aus dem README des Repositorys. Kein Netzwerk, kein Konto.

```bash
git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit
cd qorechain-asset-kit/contracts
forge build && forge test
```

Die beobachtete Ausgabe endet mit `33 tests passed, 0 failed, 0 skipped (33 total tests)`.

### Quickstart 2: Ein Deployment gegen das Testnet im Trockenlauf ausführen {#quickstart-dry-run}

Ohne `--broadcast` simuliert Foundry gegen den Testnet-Zustand und sendet nichts. Für einen Trockenlauf funktioniert jede Adresse als `--sender`.

```bash
forge script script/DeployCmtat.s.sol --rpc-url qorechain_testnet --sender <deployer>
```

`qorechain_testnet` ist in `foundry.toml` als `https://evm-testnet.qore.host` definiert. Der Preflight gibt die Chain-ID (9800), `pqcKeyStatus precompile: active` und den Schlüsselstatus des Deployers aus. Für eine Adresse ohne Schlüssel fügt er `Broadcasting would fail: register an ML-DSA-87 key and open an EVM window first.` hinzu. Danach gibt er die Adressen aus, die Guard, Regel und Token hätten. Derselbe Befehl gegen das Mainnet bricht mit `QoreChain mainnet: the hybrid-holder guard is testnet only` ab. `script/erc3643/DeployErc3643.s.sol` und `script/DeployVaults.s.sol` laufen genauso. Optionale Umgebungsvariablen: `CMTAT_ADMIN`, `CMTAT_NAME`, `CMTAT_SYMBOL`, `CMTAT_TOKEN_ID`, `CMTAT_TERMS_URI`, `TREX_AGENT`, `TREX_SALT`, `VAULT_ASSET`, `VAULT_GUARD`.

### Vor dem Broadcast im Testnet {#before-broadcast}

1. Verwenden Sie ein Testnet-Konto, das Sie kontrollieren, mit etwas Test-QOR (siehe den [Faucet](/dashboard/faucet)). Verwenden Sie niemals eine Mainnet-Mnemonic, und finanzieren Sie niemals die öffentliche Testphrase aus den Beispielen.
2. Registrieren Sie seinen ML-DSA-87-Schlüssel mit Besitznachweis (das Beispiel `examples/register-and-send` von [QoreSign](/qoresign/overview) registriert einen).
3. Öffnen Sie ein EVM-Autorisierungsfenster mit den Einstellungen aus [Eine EVM-Transaktion senden](#native-prerequisites), mit leeren `allowed_targets`. Das [QoreChain SDK](/sdk/overview) baut die Nachricht (`openEvmWindow` in der Nachrichtengruppe `pqc` in TypeScript, `qorsdk.msg.pqc.open_evm_window` in Python) und liest das Fenster zurück (`fetchEvmWindow`, `get_evm_window`).
4. Führen Sie das Skript mit `--broadcast` und Ihrer Wallet-Konfiguration aus.
5. Nehmen Sie jeden Contract, der den Token halten muss (Vaults, Escrows), mit `guard.setExempt` aus, registrieren Sie Halter in der eigenen Compliance des Tokens und prüfen Sie vor dem Minten jeden Halter mit `guard.isHybridHolder(address)`.

### Quickstart 3: Emittenten-Konsole (Testnet) {#quickstart-console}

```bash
pnpm install
pnpm --filter @qorechain/issuer-console dev
```

Verbinden Sie eine EIP-6963-Wallet, wechseln Sie zu QoreChain Testnet und erstellen Sie dann einen CMTAT-Token oder öffnen Sie einen bestehenden per Adresse. Auf Chain 9801 zeigt die Konsole eine Warnung und deaktiviert die Token-Erstellung. Die Konsole registriert keine Schlüssel und öffnet keine Fenster; erledigen Sie zuerst die Schritte 2 und 3 oben.

### Quickstart 4: Mit MockChain gegen die vorgeschlagenen Module bauen (Python, offline) {#quickstart-python}

Aus dem README des Python-Clients. Bis zum PyPI-Release installieren Sie aus einem Klon (siehe [Installation](#install)).

```python
from qorechain_asset_kit import MockChain, MockChainError, asset

chain = MockChain()
chain.asset.create_asset(issuer="qor1issuer", asset_id="bond-2030", flags={"freezable": True})
chain.asset.mint(agent="qor1issuer", asset_id="bond-2030", to="qor1alice", amount="100")
chain.asset.freeze(agent="qor1issuer", asset_id="bond-2030", holder="qor1alice", frozen=True)
try:
    chain.asset.transfer(from_="qor1alice", asset_id="bond-2030", to="qor1bob", amount="1")
except MockChainError as e:
    print(e.code)  # ERROR_CODE_ADDRESS_FROZEN
```

Beobachtete Ausgabe: `ERROR_CODE_ADDRESS_FROZEN`. Derselbe Aufruf auf `ChainClient()` wirft `ChainUpgradeRequired` mit `module == "x/asset"` und `code == "CHAIN_UPGRADE_REQUIRED"`.

### Quickstart 5: Dasselbe in Go (Modul-Proxy v0.1.0) {#quickstart-go}

Aus dem README des Go-Clients, in ein `main`-Paket eingebettet.

```go
package main

import (
	"context"
	"errors"
	"fmt"

	assetkit "github.com/qorechain/qorechain-asset-kit/clients/go"
	assetv1 "github.com/qorechain/qorechain-asset-kit/clients/go/gen/qorechain/asset/v1"
)

func main() {
	ctx := context.Background()
	chain := assetkit.NewMockChain()
	_, err := chain.Asset().CreateAsset(ctx, &assetv1.MsgCreateAsset{
		Issuer: "qor1issuer", AssetId: "bond-2030", Flags: &assetv1.RwaFlagsV0{Freezable: true},
	})
	_, err = chain.Asset().Mint(ctx, &assetv1.MsgMint{Agent: "qor1issuer", AssetId: "bond-2030", To: "qor1alice", Amount: "100"})
	fmt.Println("mock mint error:", err)

	_, err = assetkit.NewChainClient().Asset().Mint(ctx, &assetv1.MsgMint{})
	var upgrade *assetkit.ChainUpgradeRequired
	fmt.Println(errors.As(err, &upgrade), upgrade.Module)
}
```

Beobachtete Ausgabe: `mock mint error: <nil>` und dann `true x/asset`. Das README des Java-Clients hat das gleichwertige Beispiel mit `MockChain`, `MsgCreateAsset.newBuilder()` und `MockChainError.code()`.

:::note
Die READMEs für Go und TypeScript im Repository enthalten kleine Fehler in ihren Snippets, die in 0.1.1 behoben werden sollen. Das Go-Beispiel oben ist die korrigierte Fassung.
:::

## Haupt-API {#main-api}

### Contracts {#api-contracts}

| Name | Was es tut |
|---|---|
| `QoreChainHybridHolderGuard(initialOwner)` | Guard über `0x0A02`: `isHybridHolder`, `isEligible`, `requireHybridHolder` (revertiert mit `HybridKeyRequired`), `keyStatus`, `decodeKeyStatus`, `precompileActive`, `setExempt`, `exempt` |
| `QoreChainHybridHolderRule(guard)` | CMTAT-Regel: `detectTransferRestriction`, `detectTransferRestrictionFrom`, `canTransfer`, `canTransferFrom`, `messageForTransferRestriction`, `canReturnTransferRestrictionCode`; Codes `CODE_FROM_NOT_HYBRID` (60), `CODE_TO_NOT_HYBRID` (61), `CODE_SPENDER_NOT_HYBRID` (62) |
| `QoreChainHybridHolderModule(guard)` | ERC-3643-Modul: `moduleCheck`, `bindCompliance`, `unbindCompliance`, `isComplianceBound`, `isPlugAndPlay`, `name` |
| `QoreChainRwaVault(asset, name, symbol, eligibility)` | ERC-4626-Vault mit beschränkten Anteilen |
| `QoreChainRwaAsyncVault(asset, name, symbol, eligibility, admin)` | ERC-7540-Vault: `requestDeposit`, `fulfillDeposit`, `requestRedeem`, `fulfillRedeem`, `pendingDepositRequest`, `claimableDepositRequest`, `pendingRedeemRequest`, `claimableRedeemRequest`, `setOperator`, sowie `deposit`, `mint`, `redeem`, `withdraw` mit einem Controller; `FULFILLER_ROLE`; Previews revertieren absichtlich |
| `IHolderEligibility` | `isEligible(address)`: eine andere Berechtigungsrichtlinie für die Vaults einstecken |
| `IERC7518` | Skizze der Partitionsschnittstelle |
| `forge script script/DeployCmtat.s.sol` | Guard, Regel und CMTAT-Token |
| `forge script script/erc3643/DeployErc3643.s.sol` | T-REX-Infrastruktur, Guard, Modul und eine Token-Suite |
| `forge script script/DeployVaults.s.sol` | Beide Vaults über einem beschränkten Token, mit Guard-Ausnahmen |

### Clients (Vorschlag) {#api-clients}

Gezeigt werden die Namen aus TypeScript und Java; Python verwendet snake_case (`create_asset`), und Go verwendet Go-Schreibweise hinter Accessoren (`chain.Asset().CreateAsset(ctx, msg)`).

| Name | Was es tut |
|---|---|
| `ChainClient` (Go `NewChainClient()`) | Jeder Aufruf scheitert mit `ChainUpgradeRequired`; keine Netzwerkanfrage |
| `MockChain` (Go `NewMockChain()`) | Die vorgeschlagenen Regeln im Speicher; Ablehnungen werfen `MockChainError` |
| `asset` | `createAsset`, `updateFlags`, `setRole`, `proposeIssuer`, `acceptIssuer`, `authorizeHolder`, `mint`, `burn`, `transfer`, `freeze`, `freezePartial`, `pause`, `clawback`, `forceTransfer`, `setTerms`, `retire`; Abfragen `asset`, `assets`, `holder`, `holders`, `roles`, `canTransfer`, `params` |
| `identity` | `registerIdentity`, `updateCountry`, `bindAddress`, `unbindAddress`, `addClaim`, `revokeClaim`, `removeIdentity`, `setClaimIssuer`; Abfragen `identity`, `identityByAddress`, `claimIssuers`, `isVerified` |
| `compliance` | `registerModule`, `setModuleStatus`, `bindModule`, `unbindModule`, `migrateBinding`; Abfragen `modules`, `module`, `bindings`, `check` |
| `settlement` | `createVenue`, `createInstruction`, `affirm`, `withdrawAffirmation`, `executeInstruction`, `cancelInstruction`; Abfragen `instruction`, `instructionsByParty`, `venue` |
| `attest` | `setAttester`, `submit`, `revoke`; Abfragen `latest`, `history`, `attesters` |
| Mock-Helfer | `setHybridKey`, `fundBank`, `bankBalance`, `advance(blocks, seconds)`, `events(type)`, `defineModuleLogic(moduleId, fn)` (Python zusätzlich `has_hybrid_key`, `height`, `time`) |

## So greifen Sie darauf zu {#how-to-access}

| | Testnet `qorechain-diana` | Mainnet `qorechain-vladi` |
|---|---|---|
| EVM-Chain-ID | 9800 | 9801 |
| EVM-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| Precompile `pqcKeyStatus` `0x0A02` | Aktiv | Nicht aktiv (`eth_call` liefert leere Daten); eine Aktivierung bräuchte einen Governance-Beschluss, keiner gefasst |
| Hybrid-Holder-Guard, -Regel, -Modul | Funktionieren | Fail closed: Jede nicht ausgenommene Adresse ist nicht berechtigt, sodass Token nicht zwischen gewöhnlichen Haltern bewegt werden können |
| Deployment-Skripte | Trockenlauf und Broadcast | Weigern sich zu laufen |
| Emittenten-Konsole | Voll | Warnung; Token-Erstellung deaktiviert |
| Native Module (`x/asset` und andere) | Existieren nicht | Existieren nicht |

Voraussetzungen für alles, was eine EVM-Transaktion sendet: ein Konto mit einem registrierten ML-DSA-87-Schlüssel (mit Besitznachweis) und einem offenen EVM-Autorisierungsfenster, beides auf der nativen Lane mit einer hybrid signierten Transaktion eingerichtet. Lesezugriffe (`eth_call`, Logs, Gasschätzung, Trockenläufe) brauchen keines von beiden. `MockChain` und die Foundry-Tests brauchen überhaupt kein Netzwerk. Weitere Endpunkte und den Faucet finden Sie unter [Mit dem Testnet verbinden](/getting-started/connecting-to-testnet) und [Mit dem Mainnet verbinden](/getting-started/connecting-to-mainnet).

Zu beachtendes Netzwerkverhalten: `PREVRANDAO` ist eine Konstante (kein Contract des Kits verwendet es); Blob-Transaktionen (Typ 3) werden abgelehnt, und die Typen 0, 1, 2 und 4 werden akzeptiert; EIP-7702-Delegationen brauchen die eigene Post-Quantum-Zustimmung der Authority (`MsgAuthorizeEVMDelegation`).

## Wo es veröffentlicht ist {#where-published}

Am 28. Oktober 2026 live geprüft (der GitHub-Release, Maven Central und der Go-Proxy liefern 0.1.0; PyPI und npm liefern 404).

| Registry | Paket | Version | Link |
|---|---|---|---|
| Maven Central | `io.github.qorechain:asset-kit` | 0.1.0 | https://central.sonatype.com/artifact/io.github.qorechain/asset-kit |
| Go-Modul-Proxy | `github.com/qorechain/qorechain-asset-kit/clients/go` | v0.1.0 (Tag `clients/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-asset-kit/clients/go |
| PyPI | `qorechain-asset-kit` | **Kommt** (noch nicht auf PyPI) | |
| npm | `@qorechain/asset-kit` | **Kommt** (nicht veröffentlicht) | |
| GitHub (Solidity-Contracts, Emittenten-Konsole, Protos, Dokumentation, Rechtsvorlagen) | `qorechain/qorechain-asset-kit` | Release v0.1.0 | https://github.com/qorechain/qorechain-asset-kit/releases/tag/v0.1.0 |

Repository: https://github.com/qorechain/qorechain-asset-kit. Betreuer: QoreChain Association.

**Lizenzen.** Der Code steht unter Apache-2.0, ausgenommen `contracts/script/erc3643/` und `contracts/test/erc3643/`, die zusammen mit der ERC-3643-Referenzimplementierung kompiliert werden und unter GPL-3.0-or-later stehen. Die Dokumentation in `docs/` und `legal/` steht unter Apache-2.0. Abhängigkeiten behalten ihre eigenen Lizenzen und werden unverändert als Git-Submodule verwendet: T-REX und ONCHAINID (GPL-3.0), CMTAT (MPL-2.0), OpenZeppelin (MIT). Ein deployter ERC-3643-Token ist T-REX-Code unter dessen Lizenz; ein deployter CMTAT-Token steht unter MPL-2.0. Die Datei `NOTICE` listet jede Abhängigkeit auf.

## Grenzen und bekannte Probleme {#limits}

- **Die nativen Module existieren nicht.** `x/asset`, `x/identity`, `x/compliance`, `x/settlement` und `x/attest` sind ein Vorschlag. Ein Upgrade, das sie hinzufügt, ist nicht geplant. `ChainClient` kann in 0.1.0 nie erfolgreich sein; `MockChain` ist ein Entwicklungswerkzeug, keine Chain.
- **Die Halterprüfung gibt es nur im Testnet.** Im Mainnet schlägt der Guard geschlossen fehl (fail closed); ein Mainnet-Deployment kann sich nicht auf ihn verlassen.
- **Agentenbefugnisse umgehen die Halterprüfung.** In beiden Standards konsultieren die erzwungene Übertragung und die Wallet-Wiederherstellung durch einen Agenten weder die Regel noch das Modul: CMTAT `forcedTransfer` sowie ERC-3643 `forcedTransfer` und `recoveryAddress` können Token auf eine Adresse legen, die keinen Schlüssel hat. Beschränken Sie, wer die Agentenrollen hält.
- **ERC-3643-`transferFrom`-Spender werden vom Modul nicht geprüft**, weil ERC-3643 den Spender nicht an die Compliance übergibt. Die CMTAT-Regel prüft den Spender.
- **Burns und Rücknahmen bleiben offen** für Halter, die die Berechtigung verloren haben, absichtlich, in beiden Token-Standards und beiden Vaults.
- **Ausstehende ERC-7540-Anfragen lassen sich in 0.1.0 nicht stornieren.** Wenn ein Agent Vermögenswerte aus dem asynchronen Vault abzieht, liefert `totalAssets` null, und Ansprüche, die die fehlenden Vermögenswerte brauchen, scheitern, bis der Emittent den Bestand wiederherstellt.
- **Keine externe Bewertungseingabe** im ERC-7540-Vault; die Umrechnung verwendet den eigenen Bestand des Vaults pro Anteil.
- **Keine Lieferung gegen Zahlung und keine Attestierungen auf der EVM.** Diese gibt es nur als vorgeschlagene `x/settlement` und `x/attest`.
- **ERC-7518 ist eine Schnittstellenskizze**, keine Implementierung. Partitionen lassen sich heute mit einem Token pro Klasse oder Tranche abbilden, die sich ein Identitätsregister oder eine Regel teilen.
- **CMTA RuleEngine v3** wird weiterhin als Release Candidates veröffentlicht; die Regel funktioniert direkt als `ruleEngine` eines Tokens und meldet beide Regel-Schnittstellen-IDs (`0x2497d6cb`, `0xb1a69752`).
- **Die Emittenten-Konsole** registriert keine Schlüssel, öffnet keine Fenster, deployt keine ERC-3643-Suiten oder Vaults und verwaltet keine CMTAT-Rollen, teilweisen Einfrierungen, Dokumente oder Snapshots.
- **Python und TypeScript sind nicht in ihren Registries.** Verwenden Sie einen Klon, bis die Releases auf PyPI und npm erscheinen; diese Seite nennt dafür keinen Registry-Installationsbefehl.
- **README-Fehler.** Die Go- und TypeScript-Snippets in den READMEs des Repositorys haben kleine Fehler, die in 0.1.1 behoben werden sollen. Verwenden Sie die Quickstarts auf dieser Seite.
- **Rechtsvorlagen.** `legal/` enthält drei Entwürfe zur Besprechung: ein Schweizer Registerwertrecht (Art. 973d bis 973i des Obligationenrechts), Liechtensteiner Token-Bedingungen nach dem TVTG (Ansatz „Token-Container“) und eine Engagement-Skizze für einen Betreiber unter der EU-DLT-Pilotregelung (Verordnung (EU) 2022/858). Sie wurden nicht von Rechtsberatern geprüft, sind keine Rechtsberatung und müssen vor jeder Verwendung von qualifizierten Rechtsberatern in der jeweiligen Rechtsordnung geprüft werden. Ihre Verwendung oder die des Kits sagt nichts darüber aus, ob eine bestimmte Emission irgendeine rechtliche Anforderung erfüllt. Die QoreChain Association handelt für keinen Vermögenswert als Emittent, Registerführer, Verwahrer, Handelsplatz oder Rechtsberater.
- **Vor 1.0.** Die vorgeschlagenen Protos können sich in jeder Minor-Version ändern.

## Sicherheitshinweise {#security}

- **Nicht auditiert.** Die Contracts wurden nicht unabhängig geprüft. Verwenden Sie sie ohne eine solche Prüfung nicht, um echten Wert zu halten.
- Schlüssel bleiben bei ihren Eigentümern: Der Guard liest den öffentlichen Schlüsselstatus von der Chain und fasst nie einen privaten Schlüssel an. Deployer-, Eigentümer- und Agentenschlüssel sind gewöhnliche EVM-Konten mit registrierten ML-DSA-87-Schlüsseln; halten Sie die Rollen Emittent, Guard-Eigentümer und Agent auf getrennten, gut geschützten Konten.
- Der Guard-Eigentümer steuert die Ausnahmen. Eine Ausnahme macht eine Adresse ohne Schlüssel berechtigt; erteilen Sie sie Contracts, die den Vermögenswert planmäßig halten, und beobachten Sie `ExemptionSet`-Events.
- Agentenrollen können die Halterprüfung umgehen (erzwungene Übertragung, Wiederherstellung). Behandeln Sie sie als die sensibelsten Rollen des Tokens.
- Der Guard schlägt geschlossen fehl und dekodiert die Antwort der Precompile strikt; einen Schlüssel ohne Besitznachweis behandelt er nie als gültig.
- Der Produktions-Build der Emittenten-Konsole setzt eine Content-Security-Policy mit `connect-src 'none'`: Die Seite stellt keine eigene Netzwerkanfrage, und alles läuft über die Wallet.
- `MockChain` vertraut den Signierer-Feldern der Nachrichten (es gibt keine Signaturen); es ist keine Sicherheitsgrenze.
- Probleme in CMTAT, der ERC-3643-Referenzimplementierung, ONCHAINID oder OpenZeppelin sollten auch an deren Betreuer gehen.
- Melden Sie Schwachstellen im Kit vertraulich an security@qore.network.

## Verwandte Seiten {#related}

- [QoreChain SDK](/sdk/overview): Registrierung eines ML-DSA-87-Schlüssels und Öffnen eines EVM-Autorisierungsfensters (`openEvmWindow`, `fetchEvmWindow`, `get_evm_window`).
- [QoreSign](/qoresign/overview): hybrides Signieren für die Transaktionen der nativen Lane, die Schlüssel registrieren und Fenster öffnen.
- [Post-Quantum-Signierung](/developer-guide/post-quantum-signing) und [Konten und PQC-Signierung](/sdk/concepts/accounts-pqc): Schlüsselregistrierung und die hybride Signatur.
- [EVM-Entwicklung](/developer-guide/evm-development#evm-window): das EVM-Autorisierungsfenster.
- [EVM-Precompiles](/developer-guide/evm-precompiles): `0x0A01` und `0x0A02`, nur im Testnet aktiv.
- [Chain Developer Kit](/developer-tools/chain-dev-sdk): Foundry-, Hardhat- und viem-Templates und Fenster-Helfer (SDK 0.11.0, kommt).
- [Custody Kit](/developer-tools/custody-kit) und [QoreScan](/developer-tools/qorescan): benachbarte Kits für Verwahrer und für Kryptografie-Inventare.
- [Entwickler-Pakete](/developer-tools/overview): jedes Paket und sein Registry-Status.
- Upstream-Standards: ERC-3643, CMTAT, ERC-4626, ERC-7540, ERC-7518.
