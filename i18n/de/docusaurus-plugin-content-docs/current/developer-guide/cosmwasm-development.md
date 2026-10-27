---
slug: /developer-guide/cosmwasm-development
title: QoreChain Native-Entwicklung
sidebar_label: QoreChain Native-Entwicklung
sidebar_position: 3
---

# QoreChain Native-Entwicklung

QoreChain unterstützt **QoreChain Native**-Smart-Contracts. QoreChain Native ist der Name, den QoreChain für seine **CosmWasm**-Runtime verwendet: Entwickler schreiben sichere, sandboxed Programme in Rust gegen die Standard-CosmWasm-Bibliotheken (`cosmwasm-std`) und kompilieren sie zu WebAssembly. QoreChain Native-Contracts laufen innerhalb der Triple-VM-Architektur von QoreChain parallel zu EVM- und SVM-Programmen.

:::note
Die folgenden Befehle verwenden das **`qorechain-vladi`**-Mainnet (live seit dem 7. Juni 2026), auf dem das Node-Release **v3.2.4** seit dem 23. Oktober 2026 läuft (Governance-Vorschlag 13, Höhe 3.742.566). Ersetzen Sie `--chain-id qorechain-diana` für das Testnet, auf dem v3.2.6 läuft (v3.2.4 seit dem 19. Oktober 2026).
:::

:::caution Code-Upload und Instanziierung erfordern im Mainnet eine explizite Berechtigung; das Testnet weicht ab
Zum Zeitpunkt der Erstellung dieses Dokuments (geprüft am 27. Oktober 2026) sind `code_upload_access` und `instantiate_default_permission` im **Mainnet** beide auf **`Nobody`** gesetzt — das bedeutet, `MsgStoreCode` und `MsgInstantiateContract` stehen nicht beliebigen Accounts offen, im Anschluss an eine branchenweite Sicherheitswarnung für CosmWasm, die Runtime, auf der QoreChain Native aufbaut. Im **Testnet `qorechain-diana`** weichen die Einstellungen ab: `code_upload_access` ist weiterhin `Nobody` (Code wird nur per Governance gespeichert), aber `instantiate_default_permission` ist **`Everybody`**, von der Testnet-Governance am 27. Oktober 2026 gesetzt, sodass jeder Account einen gespeicherten Code instanziieren kann, dessen eigene Berechtigung dies erlaubt. Sie benötigen eine Governance-Entscheidung, um Ihrem Account (oder einer bestimmten Adressliste) die Upload-/Instanziierungsberechtigung zu erteilen, bevor die untenstehenden Schritte gelingen. Prüfen Sie zunächst die aktuellen Live-Parameter, da genau diese Einstellung durch Governance geändert werden kann (im Mainnet ist derzeit überhaupt kein Contract-Code gespeichert):

```bash
qorechaind query wasm params
# or: curl -s https://api.qore.host/cosmwasm/wasm/v1/codes/params  (substitute api-testnet.qore.host for testnet)
```

Der Circuit Breaker der Chain schaltet außerdem Nachrichtentypen netzwerkweit ab (`qorechaind query circuit disabled-list`). Im **Mainnet** stehen `MsgStoreCode`, `MsgInstantiateContract` und `MsgInstantiateContract2` auf der Liste; die Berechtigung allein zu erweitern genügt daher nicht, solange diese Einträge nicht aufgehoben sind. Im **Testnet** steht nur `MsgStoreCode` auf der Liste: Die Instanziierung ist offen, der Upload nicht.

**Testnet: von der Governance gespeicherte, geprüfte Contracts.** Da gewöhnliche Accounts im Testnet keinen Code hochladen können, hat die Governance fünf geprüfte Contracts gespeichert, die jeder instanziieren kann (`instantiate_permission` `Everybody`): cw20-base (Token), cw721-base (NFT-Kollektion), cw4-group, cw3-fixed-multisig und ein kleiner Zähler-Contract. Zum Zeitpunkt der Erstellung sind es die Code-IDs 859 bis 863, in dieser Reihenfolge, aufgelistet von `GET /cosmwasm/wasm/v1/code` mit dem Governance-Modulkonto als Ersteller und anhand ihres `data_hash` erkennbar; lesen Sie die IDs aus der Live-Liste, statt sie fest zu codieren. Sie existieren nur im Testnet. Das Mainnet hat keinen gespeicherten Code.

Diese Einschränkung betrifft bereits instanziierte Contracts nicht — `execute` und `query` gegen einen bestehenden Contract funktionieren unabhängig von dieser Einstellung normal.
:::

:::caution Signieren mit `tx pqc cosign`
Mainnet und Testnet verlangen für jede Transaktion auf der Cosmos-Lane eine hybride post-quantensichere Signatur, daher werden die `tx`-Befehle auf dieser Seite so, wie sie geschrieben sind, nicht gesendet. Sie erstellen die Transaktion mit `--generate-only > tx.json`; signieren und senden Sie sie anschließend mit `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>` (die Release-Binärdatei aus dem [Download-Manifest](/developer-guide/running-a-node#fetch-the-manifest) enthält den Signierer; ein Build aus dem öffentlichen Quellcode nicht). Die Netzwerk-Gebührenuntergrenze beträgt **0.1 uqor pro Gas-Einheit**, was `--gas-prices 0.1uqor` ausdrückt; die hybride Signatur fügt etwa 47,000 Gas hinzu, die eine Simulation nicht enthält, daher die Anpassung `1.5`. Siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing).
:::

---

## Voraussetzungen

| Abhängigkeit                | Version       | Zweck                          |
| ---------------------------- | ------------- | ------------------------------ |
| **Rust**                     | Aktuell stabil | Contract-Kompilierung          |
| **wasm32-unknown-unknown**   | Target        | WebAssembly-Kompilierungsziel  |
| **cargo-generate**           | Aktuell       | Projekt-Scaffolding            |
| **cosmwasm-std**             | 1.5+          | CosmWasm-Standardbibliothek            |

Installieren Sie das Wasm-Target:

```bash
rustup target add wasm32-unknown-unknown
```

---

## Contract-Lebenszyklus

QoreChain Native-Contracts folgen einem fünfstufigen Lebenszyklus: **Build**, **Store**, **Instantiate**, **Execute** und **Query**.

1. **Build** — Kompilieren Sie Ihren Contract zu optimiertem WebAssembly:

   ```bash
   cd my-contract

   # Standard build
   cargo build --release --target wasm32-unknown-unknown

   # Optimized build (recommended for deployment)
   docker run --rm -v "$(pwd)":/code \
     cosmwasm/rust-optimizer:0.15.0
   ```

   Die optimierte `.wasm`-Datei befindet sich im Verzeichnis `artifacts/`.

2. **Store** — Laden Sie den kompilierten Contract in die Chain hoch:

   ```bash
   qorechaind tx wasm store contract.wasm \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   Nachdem die Transaktion bestätigt wurde (signieren und senden Sie `tx.json` wie oben beschrieben mit `tx pqc cosign`), fragen Sie die gespeicherte Code-ID ab:

   ```bash
   qorechaind query wasm list-code
   ```

3. **Instantiate** — Erstellen Sie eine neue Contract-Instanz aus einer gespeicherten Code-ID:

   ```bash
   qorechaind tx wasm instantiate <code-id> \
     '{"count": 0, "owner": "qor1..."}' \
     --label "my-counter-contract" \
     --from mykey \
     --no-admin \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   | Flag                 | Beschreibung                                        |
   | -------------------- | ---------------------------------------------------- |
   | `<code-id>`          | Numerische ID, die von der Store-Transaktion zurückgegeben wird |
   | `--label`             | Lesbares Label für diese Instanz                     |
   | `--no-admin`          | Keine Admin-Adresse (Contract ist unveränderlich)    |
   | `--admin <address>`   | Legt einen Admin fest, der den Contract migrieren kann |

   Rufen Sie die Contract-Adresse ab:

   ```bash
   qorechaind query wasm list-contract-by-code <code-id>
   ```

4. **Execute** — Rufen Sie den Execute-Einstiegspunkt eines Contracts auf, um den Zustand zu ändern:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   Execute mit angehängten Mitteln:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

5. **Query** — Lesen Sie den Contract-Zustand aus, ohne eine Transaktion einzureichen:

   ```bash
   qorechaind query wasm contract-state smart <contract-addr> \
     '{"get_count": {}}'
   ```

   Query-Antworten werden als JSON zurückgegeben.

---

## Nützliche Abfragen

```bash
# List all stored code
qorechaind query wasm list-code

# List all instances of a specific code ID
qorechaind query wasm list-contract-by-code <code-id>

# Get contract info (code ID, admin, label)
qorechaind query wasm contract <contract-addr>

# Get raw contract state by key
qorechaind query wasm contract-state raw <contract-addr> <key-hex>

# Get full contract state (all keys)
qorechaind query wasm contract-state all <contract-addr>

# Get contract history (instantiate/migrate events)
qorechaind query wasm contract-history <contract-addr>
```

---

## Contract-Struktur

Ein typischer QoreChain Native-Contract hat drei Einstiegspunkte:

```rust
use cosmwasm_std::{
    entry_point, Binary, Deps, DepsMut, Env, MessageInfo,
    Response, StdResult,
};

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    // Initialize contract state
    Ok(Response::new().add_attribute("method", "instantiate"))
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    // Handle state-changing operations
    Ok(Response::new().add_attribute("method", "execute"))
}

#[entry_point]
pub fn query(
    deps: Deps,
    _env: Env,
    msg: QueryMsg,
) -> StdResult<Binary> {
    // Handle read-only queries
    Ok(Binary::default())
}
```

---

## Cross-VM-Aufrufe

Cross-VM-Aufrufe werden als `MsgCrossVMCall`-Transaktionen über das Modul `x/crossvm` gesendet; den Nachrichten-Lebenszyklus finden Sie unter [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability). QoreChain Native-Contracts haben keine eigene contractseitige Anbindung, um einen Cross-VM-Aufruf auszulösen (es gibt keine benutzerdefinierte `QoreChainMsg`-Nachricht, die Contracts ausgeben könnten); ein Contract kann daher aus seinem `execute`-Einstiegspunkt heraus keinen EVM- oder SVM-Contract aufrufen. Seit v3.2.3 wird ein Aufruf in die eigene Lane des Aufrufers abgelehnt, und ein eingereihter Aufruf, der fehlschlägt, hinterlässt keine Nebenwirkungen.

:::caution Cross-VM-Aufrufe sind im Mainnet derzeit abgeschaltet
`MsgCrossVMCall` steht auf der Circuit-Breaker-Liste des Mainnets (`qorechaind query circuit disabled-list`), und die SVM-Lane ist in beiden Netzwerken deaktiviert; der Cross-VM-Pfad ist daher für gewöhnliche Transaktionen heute nicht nutzbar.
:::

---

## Modul-Integration

QoreChain Native-Contracts können über standardmäßige Nachrichtenübermittlung mit Cosmos-SDK-Modulen interagieren:

```rust
// Send native tokens via the bank module
let send_msg = BankMsg::Send {
    to_address: "qor1recipient...".to_string(),
    amount: vec![Coin {
        denom: "uqor".to_string(),
        amount: Uint128::new(1_000_000),
    }],
};

// Delegate to a validator via the staking module
let delegate_msg = StakingMsg::Delegate {
    validator: "qorvaloper1...".to_string(),
    amount: Coin {
        denom: "uqor".to_string(),
        amount: Uint128::new(1_000_000),
    },
};
```

---

## Contract-Migration

Wenn der Contract mit einer `--admin`-Adresse instanziiert wurde, kann der Admin ihn zu einer neuen Code-ID migrieren:

```bash
qorechaind tx wasm migrate <contract-addr> <new-code-id> \
  '{"migrate_msg": {}}' \
  --from admin-key \
  --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
  --generate-only > tx.json
```

Dies ruft den `migrate`-Einstiegspunkt des neuen Codes mit dem bestehenden Contract-Zustand auf.

---

## Nächste Schritte

* [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability) — EVM- und SVM-Contracts von QoreChain Native aus aufrufen
* [SVM-Entwicklung](/developer-guide/svm-development) — BPF-Programme auf QoreChain bereitstellen
* [EVM-Precompiles](/developer-guide/evm-precompiles) — Referenz für die Solidity-Precompiles (im Mainnet ist keines aktiv; im Testnet sind drei aktiv)
