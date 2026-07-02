---
slug: /developer-guide/svm-development
title: SVM-Entwicklung
sidebar_label: SVM-Entwicklung
sidebar_position: 4
---

# SVM-Entwicklung

QoreChain enthält eine **Solana Virtual Machine (SVM)**-Ausführungsumgebung, mit der Entwickler SBF/BPF-Programme mit vertrautem Solana-Tooling bereitstellen und ausführen können. Das SVM-Modul stellt eine Solana-kompatible JSON-RPC-Schnittstelle auf **Port 8899** bereit, die von `qorechaind start` automatisch gestartet wird (siehe [JSON-RPC-Server](#json-rpc-server) unten).

:::note
Die folgenden Befehle verwenden das **`qorechain-vladi`**-Mainnet, das seit dem 7. Juni 2026 live ist und die Chain-Version **v3.1.82** ausführt. Ersetzen Sie für das Testnet `--chain-id qorechain-diana`.
:::

---

## Überblick

Das `x/svm`-Modul bietet:

* **Natives QOR als erstklassiges SVM-Asset** — das einheitliche Guthaben des Kontos, sichtbar in Lamports
* Bereitstellung und Ausführung von SBF/BPF-Programmen
* Erstellung und Verwaltung von Datenkonten
* Einen Solana-kompatiblen JSON-RPC-Endpunkt
* Bidirektionales Adress-Mapping zwischen QoreChain- und Solana-Adressformaten
* Compute-Budget-Messung und mietbasierte Speicherökonomie

---

## Natives QOR auf der SVM-Schnittstelle {#native-qor}

Seit Chain-Version **v3.1.82** ist die SVM-Schnittstelle eine **erstklassige Schnittstelle für natives QOR**, kein separates Sandbox-Guthaben. Das eine einheitliche Guthaben des Kontos — dieselben Mittel, die auf der Cosmos-Schnittstelle als `uqor` und auf der EVM als Wei mit 18 Dezimalstellen sichtbar sind — erscheint auf der SVM-Seite in **Lamports** (9 Dezimalstellen):

```
1 uqor = 1,000 lamports    ·    1 QOR = 1,000,000,000 lamports
```

* **`getBalance` / `getAccountInfo`** geben das native QOR des Kontos zurück (in Lamports).
* **`getSignaturesForAddress`** gibt die Transaktionshistorie einer Adresse zurück — nutzbar für die Einzahlungserkennung mit Standard-Solana-Tooling.
* **System-Program-Transfers bewegen natives QOR** — eine Transferanweisung im Solana-Stil bewegt dieselben Mittel wie ein Cosmos-`MsgSend` oder ein EVM-Transfer.
* **SVM-Adressform** — die SVM-Adresse eines Kontos besteht aus seinen 20 Kontobytes, rechts auf 32 Bytes aufgefüllt und base58-kodiert. Alle drei Adressformen (`qor1...`, `0x...`, base58) beziehen sich auf dasselbe Konto.

Die öffentlichen Endpunkte (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sind **schreibgeschützt** — die Transaktionseinreichung ist am Edge deaktiviert. Betreiben Sie einen eigenen Node (Port 8899), um SVM-Transaktionen einzureichen.

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

Die Standardwerte sind `enable = true` und `address = "127.0.0.1:8899"`, sodass ein frisch gestarteter Node die Solana-JSON-RPC-Schnittstelle bereits auf Port 8899 bereitstellt — `@solana/web3.js` verbindet sich ohne zusätzliche Einrichtung unter `http://127.0.0.1:8899`. `getVersion` meldet `1.18.0-qorechain`, und `getBalance` / `getAccountInfo` geben live On-Chain-SVM-Konten zurück.

| Eigenschaft    | Wert                        |
| -------------- | --------------------------- |
| Standard-URL   | `http://127.0.0.1:8899`     |
| Aktiviert      | Ja, standardmäßig           |
| Gestartet von  | `qorechaind start`          |
| Kompatibilität | Solana JSON-RPC (Teilmenge) |
| `getVersion`   | `1.18.0-qorechain`          |

### Unterstützte Methoden

| Methode                             | Beschreibung                                    |
| ----------------------------------- | ----------------------------------------------- |
| `getAccountInfo`                    | Kontodaten und Lamport-Guthaben abrufen         |
| `getBalance`                        | Kontoguthaben in Lamports abrufen (natives QOR) |
| `getSignaturesForAddress`           | Transaktionshistorie für eine Adresse           |
| `getSlot`                           | Aktuelle Slot-Nummer                            |
| `getMinimumBalanceForRentExemption` | Mindestguthaben für eine gegebene Datengröße    |
| `getVersion`                        | Versionsinformationen der SVM-Laufzeit          |
| `getHealth`                         | Zustandsprüfung für den SVM-Endpunkt            |

---

## Programme bereitstellen und mit ihnen interagieren

:::info
**Moderne SBF-Ausführung.** Die SVM-Ausführungs-Engine wurde auf **solana-sbpf 0.21.1** modernisiert, sodass frisch kompilierte SBF-Programme aus der aktuellen Solana-Toolchain (**platform-tools v1.53 / agave 4.x**) auf QoreChain sowohl **bereitgestellt als auch ausgeführt** werden — die Ausführung wird vollständig unterstützt, nicht nur die Bereitstellung. Programme, die mit `cargo build-sbf --arch v0` oder `--arch v3` gebaut wurden, werden unterstützt.
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

   Die Transaktionsantwort enthält die **Programm-ID** im base58-Format.

2. **Eine Instruktion ausführen** — Rufen Sie ein On-Chain-BPF-Programm mit Instruktionsdaten auf:

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parameter           | Format             | Beschreibung                               |
   | ------------------- | ------------------ | ------------------------------------------ |
   | `program-id-base58` | Base58-String      | Die Adresse des bereitgestellten Programms |
   | `data-hex`          | Hex-kodierte Bytes | Serialisierte Instruktionsdaten            |

3. **Ein Datenkonto erstellen** — Programme benötigen oft Konten zur Zustandsspeicherung. Erstellen Sie eines mit angegebener Größe und Eigentümer:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parameter      | Beschreibung                                                              |
   | -------------- | ------------------------------------------------------------------------- |
   | `owner-base58` | Das Programm, dem dieses Konto gehört (base58)                            |
   | `space`        | Größe des Datenfelds in Bytes                                             |
   | `lamports`     | Anfangsguthaben (muss das Mindestguthaben für die Mietbefreiung erfüllen) |

   Fragen Sie das minimale mietbefreite Guthaben für eine gegebene Größe ab:

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

QoreChain unterhält ein **bidirektionales Adress-Mapping** zwischen nativen Bech32-Adressen (`qor1...`) und base58-Adressen im Solana-Stil:

| Richtung     | Beispiel                                                                           |
| ------------ | ---------------------------------------------------------------------------------- |
| Nativ zu SVM | `qor1abc...xyz` wird auf eine deterministische base58-Adresse abgebildet            |
| SVM zu Nativ | Base58-Programmadressen werden zurück auf ihre `qor1...`-Entsprechungen abgebildet |

Das Mapping ist deterministisch und wird vom `x/svm`-Modul verwaltet. Beide Darstellungen beziehen sich auf dasselbe zugrunde liegende Konto.

---

## Mietmodell

Das SVM-Modul verwendet ein **mietbasiertes Speichermodell**, um ein Aufblähen des Zustands zu verhindern:

| Parameter                       | Wert        |
| ------------------------------- | ----------- |
| Lamports pro Byte pro Jahr      | `3,480`     |
| Multiplikator der Mietbefreiung | `2.0`       |
| Erhebungshäufigkeit             | Jede Epoche |

* Konten mit einem Guthaben **über** `2 * (data_size * 3480 / seconds_per_year)` in Lamports sind **mietbefreit** und werden niemals belastet.
* Konten **unterhalb** der Mietbefreiungsschwelle wird jede Epoche Miete berechnet. Erreicht das Guthaben null, wird das Konto gelöscht.

:::info
**Bewährte Praxis:** Statten Sie Datenkonten immer mit einem Guthaben über dem Mindestbetrag für die Mietbefreiung aus, um eine unerwartete Kontolöschung zu vermeiden.
:::

---

## Compute-Budget

Jede Instruktionsausführung wird mit Compute-Einheiten gemessen:

| Parameter                                 | Wert        |
| ----------------------------------------- | ----------- |
| Max. Compute-Einheiten pro Instruktion    | `1,400,000` |
| Max. CPI-Tiefe (Cross-Program Invocation) | `4`         |
| Max. Programmgröße                        | `10 MB`     |
| Max. Kontodatengröße                      | `10 MB`     |

Programme, die das Compute-Budget überschreiten, werden angehalten und die Transaktion wird zurückgesetzt.

---

## Parameterübersicht

| Parameter                   | Wert         |
| --------------------------- | ------------ |
| `max_program_size`          | 10 MB        |
| `max_account_data_size`     | 10 MB        |
| `compute_budget_max`        | 1,400,000 CU |
| `max_cpi_depth`             | 4            |
| `lamports_per_byte_year`    | 3,480        |
| `rent_exemption_multiplier` | 2.0          |
| JSON-RPC-Port               | 8899         |

---

## Cross-VM-Interoperabilität

SVM-Programme können über den **asynchronen** Cross-VM-Nachrichtenpfad mit EVM- und CosmWasm-Verträgen kommunizieren:

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

Nachrichten werden in eine Warteschlange gestellt und vom EndBlocker verarbeitet. Siehe [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability) für Details zum Nachrichtenlebenszyklus und zum Timeout-Verhalten.

---

## Nächste Schritte

* [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability) — Kommunikation zwischen SVM, EVM und CosmWasm
* [EVM-Entwicklung](/developer-guide/evm-development) — Solidity-Smart-Contracts auf QoreChain
* [CosmWasm-Entwicklung](/developer-guide/cosmwasm-development) — Rust-basierte WebAssembly-Verträge
