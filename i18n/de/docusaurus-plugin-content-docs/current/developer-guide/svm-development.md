---
slug: /developer-guide/svm-development
title: SVM-Entwicklung
sidebar_label: SVM-Entwicklung
sidebar_position: 4
---

# SVM-Entwicklung

QoreChain enthält eine Ausführungsumgebung für die **Solana Virtual Machine (SVM)**, die es Entwicklern ermöglicht, SBF/BPF-Programme mit vertrauten Solana-Werkzeugen bereitzustellen und auszuführen. Das SVM-Modul stellt eine Solana-kompatible JSON-RPC-Schnittstelle an **Port 8899** bereit, die `qorechaind start` automatisch startet (siehe [JSON-RPC-Server](#json-rpc-server) weiter unten).

:::note
Die folgenden Befehle verwenden das **`qorechain-vladi`**-Mainnet, seit dem 7. Juni 2026 aktiv und mit der Chain-Version **v3.1.77** betrieben. Ersetzen Sie es durch `--chain-id qorechain-diana` für das Testnet.
:::

---

## Überblick

Das `x/svm`-Modul bietet:

* Bereitstellung und Ausführung von SBF/BPF-Programmen
* Erstellung und Verwaltung von Datenkonten
* Einen Solana-kompatiblen JSON-RPC-Endpunkt
* Bidirektionale Adresszuordnung zwischen den Adressformaten von QoreChain und Solana
* Compute-Budget-Messung und mietbasierte Speicherökonomie

---

## JSON-RPC-Server {#json-rpc-server}

Der Solana-kompatible JSON-RPC-Server wird **von `qorechaind start` gestartet** und ist **standardmäßig aktiviert**. Er wird über einen Abschnitt `[svm-rpc]` in `app.toml` konfiguriert:

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

Die Standardwerte sind `enable = true` und `address = "127.0.0.1:8899"`, sodass ein frisch gestarteter Knoten bereits die Solana-JSON-RPC-Schnittstelle an Port 8899 bereitstellt — `@solana/web3.js` verbindet sich unter `http://127.0.0.1:8899` ohne zusätzliche Einrichtung. `getVersion` meldet `1.18.0-qorechain`, und `getBalance` / `getAccountInfo` geben aktive On-Chain-SVM-Konten zurück.

| Eigenschaft   | Wert                      |
| ------------- | ------------------------- |
| Standard-URL  | `http://127.0.0.1:8899`   |
| Aktiviert     | Ja, standardmäßig         |
| Gestartet von | `qorechaind start`        |
| Kompatibilität | Solana JSON-RPC (Teilmenge) |
| `getVersion`  | `1.18.0-qorechain`        |

### Unterstützte Methoden

| Methode                             | Beschreibung                              |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | Kontodaten und Lamport-Guthaben abrufen   |
| `getBalance`                        | Kontoguthaben in Lamports abrufen         |
| `getSlot`                           | Aktuelle Slot-Nummer                      |
| `getMinimumBalanceForRentExemption` | Mindestguthaben für eine gegebene Datengröße |
| `getVersion`                        | Versionsinfo der SVM-Laufzeitumgebung     |
| `getHealth`                         | Zustandsprüfung für den SVM-Endpunkt      |

---

## Programme bereitstellen und mit ihnen interagieren

:::info
**Moderne SBF-Ausführung.** Die SVM-Ausführungs-Engine wurde auf **solana-sbpf 0.21.1** modernisiert, sodass frisch kompilierte SBF-Programme aus der aktuellen Solana-Toolchain (**platform-tools v1.53 / agave 4.x**) sowohl **bereitgestellt als auch ausgeführt** werden können — die Ausführung wird vollständig unterstützt, nicht nur die Bereitstellung. Programme, die entweder mit `cargo build-sbf --arch v0` oder `--arch v3` erstellt wurden, werden unterstützt.
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

   | Parameter           | Format            | Beschreibung                   |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | Base58-Zeichenkette | Die Adresse des bereitgestellten Programms |
   | `data-hex`          | Hex-kodierte Bytes | Serialisierte Instruktionsdaten |

3. **Ein Datenkonto erstellen** — Programme benötigen oft Konten, um Zustand zu speichern. Erstellen Sie eines mit einer angegebenen Größe und einem Eigentümer:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parameter      | Beschreibung                                       |
   | -------------- | -------------------------------------------------- |
   | `owner-base58` | Das Programm, dem dieses Konto gehört (base58)     |
   | `space`        | Größe des Datenfelds in Bytes                      |
   | `lamports`     | Anfangsguthaben (muss das Mindestmaß für Mietbefreiung erreichen) |

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

## Adresszuordnung

QoreChain pflegt eine **bidirektionale Adresszuordnung** zwischen nativen Bech32-Adressen (`qor1...`) und Adressen im Solana-Stil im Base58-Format:

| Richtung      | Beispiel                                                   |
| ------------- | ---------------------------------------------------------- |
| Nativ zu SVM  | `qor1abc...xyz` wird auf eine deterministische Base58-Adresse abgebildet |
| SVM zu Nativ  | Base58-Programmadressen werden zurück auf `qor1...`-Entsprechungen abgebildet |

Die Zuordnung ist deterministisch und wird vom `x/svm`-Modul verwaltet. Beide Darstellungen beziehen sich auf dasselbe zugrunde liegende Konto.

---

## Mietmodell

Das SVM-Modul verwendet ein **mietbasiertes Speichermodell**, um eine Aufblähung des Zustands zu verhindern:

| Parameter                  | Wert       |
| -------------------------- | ---------- |
| Lamports pro Byte pro Jahr | `3,480`    |
| Mietbefreiungs-Multiplikator | `2.0`    |
| Erhebungshäufigkeit        | Jede Epoche |

* Konten mit einem Guthaben **über** `2 * (data_size * 3480 / seconds_per_year)` in Lamports sind **mietbefreit** und werden niemals belastet.
* Konten **unterhalb** der Mietbefreiungsschwelle werden in jeder Epoche mit Miete belastet. Erreicht das Guthaben null, wird das Konto gelöscht.

:::info
**Bewährte Vorgehensweise:** Statten Sie Datenkonten immer über dem Mietbefreiungsminimum mit Guthaben aus, um unerwartete Kontolöschungen zu vermeiden.
:::

---

## Compute-Budget

Jede Instruktionsausführung wird mit Compute-Einheiten gemessen:

| Parameter                                | Wert        |
| ---------------------------------------- | ----------- |
| Max. Compute-Einheiten pro Instruktion   | `1,400,000` |
| Max. CPI-Tiefe (Cross-Program Invocation) | `4`        |
| Max. Programmgröße                       | `10 MB`     |
| Max. Kontodatengröße                     | `10 MB`     |

Programme, die das Compute-Budget überschreiten, werden angehalten und die Transaktion wird rückgängig gemacht.

---

## Zusammenfassung der Parameter

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

## VM-übergreifende Interoperabilität

SVM-Programme können über den **asynchronen** VM-übergreifenden Nachrichtenpfad mit EVM- und CosmWasm-Verträgen kommunizieren:

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

Nachrichten werden in eine Warteschlange gestellt und vom EndBlocker verarbeitet. Siehe [VM-übergreifende Interoperabilität](/developer-guide/cross-vm-interoperability) für Details zum Nachrichten-Lebenszyklus und Timeout-Verhalten.

---

## Nächste Schritte

* [VM-übergreifende Interoperabilität](/developer-guide/cross-vm-interoperability) — Kommunikation zwischen SVM, EVM und CosmWasm
* [EVM-Entwicklung](/developer-guide/evm-development) — Solidity-Smart-Contracts auf QoreChain
* [CosmWasm-Entwicklung](/developer-guide/cosmwasm-development) — Rust-basierte WebAssembly-Verträge
