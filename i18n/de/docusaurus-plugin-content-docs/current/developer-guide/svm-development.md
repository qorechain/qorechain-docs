---
slug: /developer-guide/svm-development
title: SVM-Entwicklung
sidebar_label: SVM-Entwicklung
sidebar_position: 4
---

# SVM-Entwicklung

QoreChain enthält eine **Solana Virtual Machine (SVM)**-Ausführungsumgebung, die es Entwicklern ermöglicht, SBF/BPF-Programme mit vertrauten Solana-Tools bereitzustellen und auszuführen. Das SVM-Modul stellt eine Solana-kompatible JSON-RPC-Schnittstelle auf **Port 8899** bereit, die von `qorechaind start` automatisch gestartet wird (siehe [JSON-RPC-Server](#json-rpc-server) unten).

:::note
Die folgenden Befehle verwenden das **`qorechain-vladi`**-Mainnet, das seit dem 7. Juni 2026 live ist und die Chain-Version **v3.1.92** ausführt. Ersetzen Sie `--chain-id qorechain-diana` für das Testnet.
:::

---

:::caution Übermittlung von SVM-Transaktionen derzeit deaktiviert
Seit Chain-Version v3.1.89 (22. August) ist die SVM-Ausführungsspur infolge eines Vorfalls **netzwerkweit für die Übermittlung von Transaktionen deaktiviert** — jede an `x/svm` gesendete Transaktion (Programm-Deployment, Instruktionsausführung, Kontoerstellung, Überweisungen) liefert `code 11, "SVM module is disabled"` zurück. Dies gilt sowohl für Ihren eigenen Node als auch für die öffentlichen Endpunkte. Lesende RPC-Methoden können weiterhin antworten, aber bauen oder proben Sie keine produktive SVM-Integration, bevor die Spur wieder geöffnet ist — dies ist eine Deaktivierung zur Kompilierzeit, kein Laufzeitparameter, sodass sie nicht durch eine Governance-Abstimmung wieder aktiviert werden kann; sie wird voraussichtlich deaktiviert bleiben, bis ein externes Audit sie freigibt.
:::

## Übersicht

Das Modul `x/svm` bietet:

* **Natives QOR als erstklassiges SVM-Asset** — das einheitliche Guthaben des Kontos, sichtbar in Lamports
* Bereitstellung und Ausführung von SBF/BPF-Programmen
* Erstellung und Verwaltung von Daten-Accounts
* Einen Solana-kompatiblen JSON-RPC-Endpunkt
* Bidirektionales Adress-Mapping zwischen QoreChain- und Solana-Adressformaten
* Compute-Budget-Messung und mietbasierte Speicherökonomie

---

## Natives QOR auf der SVM-Schnittstelle {#native-qor}

Seit Chain-Version **v3.1.82** ist die SVM-Schnittstelle eine **erstklassige native-QOR-Schnittstelle** und kein separates Sandbox-Guthaben mehr. Das eine einheitliche Guthaben des Kontos — dieselben Mittel, die auf der Cosmos-Schnittstelle als `uqor` und auf der EVM als 18-Dezimal-Wei sichtbar sind — erscheint auf der SVM-Seite in **Lamports** (9 Dezimalstellen):

```
1 uqor = 1.000 Lamports    ·    1 QOR = 1.000.000.000 Lamports
```

* **`getBalance` / `getAccountInfo`** liefern das native QOR-Guthaben des Kontos (in Lamports).
* **`getSignaturesForAddress`** liefert den Transaktionsverlauf einer Adresse — nutzbar zur Erkennung von Einzahlungen mit Standard-Solana-Tools.
* **System-Program-Transfers bewegen natives QOR** — eine Solana-artige Transfer-Instruktion bewegt dieselben Mittel, die ein Cosmos-`MsgSend` oder ein EVM-Transfer bewegen würden.
* **SVM-Adressform** — die SVM-Adresse eines Kontos sind seine 20 Konto-Bytes, rechts auf 32 Bytes aufgefüllt und Base58-kodiert. Alle drei Adressformen (`qor1...`, `0x...`, Base58) beziehen sich auf dasselbe Konto.

Die öffentlichen Endpunkte (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sind **nur lesend** — die Übermittlung von Transaktionen ist am Edge deaktiviert. Normalerweise würden Sie einen eigenen Node (Port 8899) betreiben, um SVM-Transaktionen zu übermitteln, aber beachten Sie den Hinweis oben: Die `x/svm`-Transaktionsspur selbst ist derzeit netzwerkweit deaktiviert, auch auf Ihrem eigenen Node.

---

## JSON-RPC-Server {#json-rpc-server}

Der Solana-kompatible JSON-RPC-Server wird **von `qorechaind start` gestartet** und ist **standardmäßig aktiviert**. Er wird über einen `[svm-rpc]`-Abschnitt in `app.toml` konfiguriert:

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

Die Standardwerte sind `enable = true` und `address = "127.0.0.1:8899"`, sodass ein frisch gestarteter Node bereits die Solana-JSON-RPC-Schnittstelle auf Port 8899 bereitstellt — `@solana/web3.js` verbindet sich ohne zusätzliche Einrichtung mit `http://127.0.0.1:8899`. `getVersion` meldet `1.18.0-qorechain`, und `getBalance` / `getAccountInfo` liefern live On-Chain-SVM-Accounts.

| Eigenschaft   | Wert                      |
| ------------- | ------------------------- |
| Standard-URL  | `http://127.0.0.1:8899`   |
| Aktiviert     | Ja, standardmäßig         |
| Gestartet von | `qorechaind start`        |
| Kompatibilität | Solana JSON-RPC (Teilmenge) |
| `getVersion`  | `1.18.0-qorechain`        |

### Unterstützte Methoden

| Methode                              | Beschreibung                               |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | Kontodaten und Lamport-Guthaben abrufen |
| `getBalance`                        | Kontoguthaben in Lamports abrufen (natives QOR) |
| `getSignaturesForAddress`           | Transaktionsverlauf für eine Adresse        |
| `getSlot`                           | Aktuelle Slot-Nummer                       |
| `getMinimumBalanceForRentExemption` | Mindestguthaben für eine gegebene Datengröße     |
| `getVersion`                        | Versionsinformationen der SVM-Laufzeit        |
| `getHealth`                         | Health-Check für den SVM-Endpunkt         |

---

## Programme bereitstellen und mit ihnen interagieren

:::info
**Moderne SBF-Ausführung.** Die SVM-Ausführungs-Engine wurde auf **solana-sbpf 0.21.1** modernisiert, sodass frisch kompilierte SBF-Programme aus der aktuellen Solana-Toolchain (**platform-tools v1.53 / agave 4.x**) auf QoreChain sowohl **bereitgestellt als auch ausgeführt** werden — die Ausführung wird vollständig unterstützt, nicht nur das Deployment. Programme, die mit `cargo build-sbf --arch v0` oder `--arch v3` gebaut wurden, werden unterstützt.
:::

1. **Ein SBF-Programm bereitstellen** — Kompilieren Sie Ihr Solana-Programm mit den aktuellen platform-tools (v1.53 / agave 4.x) zu einem SBF-Shared-Object und stellen Sie es dann auf QoreChain bereit:

   ```bash
   # Build with the current Solana toolchain (--arch v0 or --arch v3)
   cargo build-sbf --arch v3

   # Deploy the compiled program
   qorechaind tx svm deploy-program ./my_program.so \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   Die Transaktionsantwort enthält die **Programm-ID** im Base58-Format.

2. **Eine Instruktion ausführen** — Rufen Sie ein On-Chain-BPF-Programm mit Instruktionsdaten auf:

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parameter           | Format            | Beschreibung                    |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | Base58-String     | Die Adresse des bereitgestellten Programms |
   | `data-hex`          | Hex-kodierte Bytes | Serialisierte Instruktionsdaten    |

3. **Ein Daten-Account erstellen** — Programme benötigen oft Accounts, um Zustand zu speichern. Erstellen Sie eines mit einer angegebenen Größe und einem Owner:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parameter      | Beschreibung                                        |
   | -------------- | -------------------------------------------------- |
   | `owner-base58` | Das Programm, das dieses Account besitzt (Base58)        |
   | `space`        | Größe des Datenfelds in Bytes                    |
   | `lamports`     | Anfangsguthaben (muss das Mindestmaß der Rent-Befreiung erfüllen) |

   Fragen Sie das mietbefreite Mindestguthaben für eine gegebene Größe ab:

   ```bash
   # RPC: getMinimumBalanceForRentExemption
   curl -X POST http://localhost:8899 \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "getMinimumBalanceForRentExemption",
       "params": [1024]
     }'
   ```

4. **Verwendung von @solana/web3.js** — Das Solana-JavaScript-SDK funktioniert direkt mit dem QoreChain-SVM-Endpunkt:

   ```javascript
   import { Connection, PublicKey } from "@solana/web3.js";

   const connection = new Connection("http://127.0.0.1:8899");

   // Check health
   const health = await connection.getHealth();
   console.log("SVM health:", health);

   // Get slot
   const slot = await connection.getSlot();
   console.log("Current slot:", slot);

   // Get account info
   const pubkey = new PublicKey("YourBase58ProgramId...");
   const accountInfo = await connection.getAccountInfo(pubkey);
   console.log("Account data:", accountInfo);

   // Get balance
   const balance = await connection.getBalance(pubkey);
   console.log("Balance (lamports):", balance);
   ```

---

## Adress-Mapping

QoreChain unterhält ein **bidirektionales Adress-Mapping** zwischen nativen Bech32-Adressen (`qor1...`) und Solana-artigen Base58-Adressen:

| Richtung      | Beispiel                                                    |
| ------------- | ---------------------------------------------------------- |
| Nativ zu SVM | `qor1abc...xyz` wird auf eine deterministische Base58-Adresse abgebildet     |
| SVM zu Nativ | Base58-Programmadressen werden zurück auf äquivalente `qor1...`-Adressen abgebildet |

Das Mapping ist deterministisch und wird vom Modul `x/svm` verwaltet. Beide Darstellungen beziehen sich auf dasselbe zugrunde liegende Konto.

---

## Rent-Modell

Das SVM-Modul verwendet ein **mietbasiertes Speichermodell**, um Zustandsaufblähung zu verhindern:

| Parameter                  | Wert      |
| -------------------------- | ---------- |
| Lamports pro Byte pro Jahr | `3.480`    |
| Rent-Befreiungsmultiplikator  | `2,0`      |
| Erhebungshäufigkeit       | Jede Epoche |

* Accounts mit einem Guthaben **über** `2 * (data_size * 3480 / seconds_per_year)` Lamports sind **rent-befreit** und werden nie belastet.
* Accounts **unter** der Rent-Befreiungsschwelle werden jede Epoche mit Miete belastet. Erreicht das Guthaben null, wird das Account gelöscht.

:::info
**Best Practice:** Statten Sie Daten-Accounts immer mit mehr als dem Rent-Befreiungsminimum aus, um eine unerwartete Kontolöschung zu vermeiden.
:::

---

## Compute-Budget

Jede Instruktionsausführung wird mit Compute-Units gemessen:

| Parameter                                | Wert       |
| ---------------------------------------- | ----------- |
| Max. Compute-Units pro Instruktion        | `1.400.000` |
| Max. CPI-Tiefe (Cross-Program Invocation) | `4`         |
| Max. Programmgröße                         | `10 MB`     |
| Max. Konto-Datengröße                    | `10 MB`     |

Programme, die das Compute-Budget überschreiten, werden angehalten, und die Transaktion wird zurückgesetzt.

---

## Parameterübersicht

| Parameter                   | Wert        |
| --------------------------- | ------------ |
| `max_program_size`          | 10 MB        |
| `max_account_data_size`     | 10 MB        |
| `compute_budget_max`        | 1.400.000 CU |
| `max_cpi_depth`             | 4            |
| `lamports_per_byte_year`    | 3.480        |
| `rent_exemption_multiplier` | 2,0          |
| JSON-RPC-Port               | 8899         |

---

## Cross-VM-Interoperabilität

SVM-Programme können über den **asynchronen** Cross-VM-Nachrichtenpfad mit EVM- und CosmWasm-Contracts kommunizieren:

```bash
# Cross-VM call example
qorechaind tx crossvm call \
  --source-vm svm \
  --target-vm evm \
  --target-contract 0x1234...abcd \
  --payload '...' \
  --from mykey \
  -y
```

Nachrichten werden in eine Warteschlange gestellt und vom EndBlocker verarbeitet. Siehe [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability) für Details zum Nachrichtenlebenszyklus und Timeout-Verhalten.

---

## Nächste Schritte

* [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability) — Kommunikation zwischen SVM, EVM und CosmWasm
* [EVM-Entwicklung](/developer-guide/evm-development) — Solidity-Smart-Contracts auf QoreChain
* [CosmWasm-Entwicklung](/developer-guide/cosmwasm-development) — Rust-basierte WebAssembly-Contracts
