---
slug: /developer-guide/governance-proposals-contracts
title: "Governance-Vorschläge für Verträge: Native-Code hochladen und Cross-VM-Zugriff öffnen (Testnet)"
sidebar_label: Vertragsvorschläge
sidebar_position: 12
---

# Governance-Vorschläge für Verträge: Native-Code hochladen und Cross-VM-Zugriff öffnen (Testnet)

Im QoreChain-Testnet `qorechain-diana` lädt niemand einen QoreChain-Native-Vertrag (CosmWasm) mit einer einfachen Transaktion hoch, und kein EVM-Vertrag kann über die Bridge einen Native-Vertrag aufrufen, bevor die Governance es erlaubt hat. Beides läuft über einen **Governance-Vorschlag**: Der Vorschlag speichert Ihren kompilierten Code, erstellt optional den Vertrag und fügt ihn der Cross-VM-Allowlist hinzu, **fest an den genauen Code gebunden**, den Sie hochgeladen haben. Diese Seite zeigt Entwicklern, wie man einen solchen Vorschlag vorbereitet, einreicht, beobachtet und prüft und danach den genehmigten Vertrag aus Solidity aufruft.

Diese Seite wurde am **22. November 2026** gegen das Live-Testnet geprüft (Chain `qorechain-diana`, Chain v3.2.9 seit dem 20. November). Die On-Chain-Beispiele sind echte Vorschläge: 40 (der Vertrag `qday-receipts`, Code 865), 23, 27 und 34 (gespeicherter Code), 19 und 20 (Instanziierungsregeln), 32 (die Allowlist). Die `qorechaind`-Befehlszeilen wurden aus der bestehenden CLI-Referenz und dem Vorschlags-JSON on-chain geschrieben; das Binary selbst wurde für diese Seite nicht ausgeführt, führen Sie daher einmal `qorechaind tx gov submit-proposal --help` auf Ihrer Maschine aus, falls ein Flag abweicht.

:::note Nur Testnet
Diese Schritte beschreiben das Testnet. Das Mainnet hat die offene Cross-VM-Bridge nicht, und der Code-Upload ist dort ebenfalls der Governance vorbehalten. Test-QOR hat keinen Wert; verwenden Sie nur Testkonten.
:::

## Warum es über die Governance läuft {#why}

* **Der Upload ist für Konten geschlossen.** `code_upload_access` ist `Nobody` und `MsgStoreCode` steht auf der Circuit-Breaker-Liste. Ein Governance-Vorschlag öffnet den Breaker, speichert den Code als Governance-Konto und schließt ihn innerhalb desselben Vorschlags wieder, sodass die Tür zwischen den Abstimmungen nie offen bleibt.
* **Die Instanziierung ist offen.** `instantiate_default_permission` ist seit Vorschlag 19 `Everybody`, sobald die Governance Ihren Code gespeichert hat, kann also jeder (Sie eingeschlossen) Verträge daraus erstellen, es sei denn, der gespeicherte Code trägt eine engere Berechtigung.
* **Die Bridge erreicht nur genehmigte Verträge.** Die Bridge `0x0901` kann nur die Ziele in `bridge_allowed_targets` aufrufen. Jedes Ziel ist an eine Code-ID und an die Länge seiner Code-Historie gebunden, sodass der Vertrag nicht auf anderen Code migriert werden kann und dabei seine Genehmigung behält.
* **Es ist atomar.** Die Nachrichten eines Vorschlags laufen zusammen. Schlägt eine fehl (zum Beispiel ein Code, den die Chain ablehnt), wird keine davon angewendet, und der Breaker bleibt nicht offen.

## Was Sie brauchen {#needs}

| Posten | So bekommen Sie es |
| --- | --- |
| Das `qorechaind`-Binary (Linux) | Das Release unter [download.qore.host](https://download.qore.host). Ein Binary aus dem öffentlichen Quellbaum kann die hybride Signatur, die die Chain verlangt, nicht signieren. |
| Ein Testnet-Konto mit registriertem Post-Quanten-Schlüssel | Siehe [Hybride Signierung](/cli-reference/transaction-commands#hybrid-signing). |
| Test-QOR für die Einlage und die Gebühren | Der Testnet-Faucet. Ein regulärer Vorschlag braucht 10 QOR, ein beschleunigter 50 QOR (Tabelle unten). |
| Docker, um den Vertrag auf dieselbe Weise wie alle anderen zu bauen | [Docker](https://docs.docker.com/get-docker/). |

## Schritt 1: Den Vertrag bauen und seine Prüfsumme notieren {#build}

Bauen Sie mit dem CosmWasm-Optimizer, damit jeder Ihren Quellcode neu bauen und dieselben Bytes erhalten kann. Der Vertrag aus Workshop 3 wurde mit dem arm64-Image auf Apple Silicon gebaut (eine x86-Maschine verwendet das einfache `optimizer`-Image; die beiden ergeben unterschiedliche Prüfsummen, nennen Sie daher in der Vorschlagszusammenfassung, welches Sie verwendet haben):

```bash
cd my-contract
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

Sie sollten pro Vertrag eine Zeile mit einer 64 Zeichen langen hexadezimalen Prüfsumme und dem Dateinamen sehen, zum Beispiel `6ebfc32f...5c43c  qday_receipts.wasm`. Diese Prüfsumme ist der **SHA-256 der unkomprimierten Wasm-Datei**, und sie ist der `data_hash`, den die Chain für Ihren Code zeigt. Kopieren Sie sie; sie gehört in die Vorschlagszusammenfassung, damit die Abstimmenden sie prüfen können.

Bevor Sie eine Einlage ausgeben, prüfen Sie den Code gegen die Limits unter [Gas- und Upload-Limits](/developer-guide/cosmwasm-development#gas-and-limits): höchstens 4.096 Funktionen, höchstens 32 MiB kompiliert, keine Gleitkomma-Instruktionen.

## Schritt 2: Den Code für den Vorschlag kodieren {#encode}

Der Vorschlag trägt das Wasm als Base64 im JSON. Komprimieren Sie es zuerst (die Chain akzeptiert gzip, was Vorschlag 40 verwendet hat: Sein Code beginnt mit `H4sI`):

```bash
gzip -9 -c artifacts/my_contract.wasm | base64 | tr -d '\n' > code.b64
wc -c code.b64
```

Sie sollten eine Größe in Bytes sehen. Der Code von `qday-receipts` hat als Base64 von gzip etwa 99.000 Zeichen. Behalten Sie ihn in einer Datei, denn er ist zu lang, um ihn in einen Befehl einzufügen.

## Schritt 3: Den Vorschlag schreiben {#write}

Ein Vorschlag ist eine JSON-Datei mit `messages`, `metadata`, `deposit`, `title`, `summary` und `expedited`. Die `authority` und der `sender` jeder Nachricht unten ist das **Governance-Modulkonto**. Lesen Sie es aus, statt es von dieser Seite zu kopieren:

```bash
curl -s https://api-testnet.qore.host/cosmos/auth/v1beta1/module_accounts/gov
```

Sie sollten das Konto mit `"name":"gov"` sehen; seine `address` beginnt mit `qor1`. Nennen Sie sie unten `<GOV_ADDRESS>`. Am 22. November 2026 war es `qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3`.

### Vorschlag A: Den Code speichern und den Vertrag erstellen {#proposal-a}

Das ist die Form von Vorschlag 40 ohne seine Allowlist-Nachricht. Die Reihenfolge ist wichtig: Breaker öffnen, speichern, Breaker schließen, dann instanziieren.

```json
{
  "messages": [
    {
      "@type": "/cosmos.circuit.v1.MsgResetCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgStoreCode",
      "sender": "<GOV_ADDRESS>",
      "wasm_byte_code": "<CONTENTS OF code.b64>",
      "instantiate_permission": { "permission": "Everybody", "addresses": [] }
    },
    {
      "@type": "/cosmos.circuit.v1.MsgTripCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgInstantiateContract2",
      "sender": "<GOV_ADDRESS>",
      "admin": "",
      "code_id": "<NEXT_CODE_ID>",
      "label": "my-contract-v1",
      "msg": {},
      "funds": [],
      "salt": "<BASE64_SALT>",
      "fix_msg": false
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: store my-contract and create one instance",
  "summary": "Stores my-contract, built with cosmwasm/optimizer-arm64:0.16.1 from <SOURCE URL>, sha256 <YOUR CHECKSUM>. No funds, no admin. The MsgStoreCode breaker is reset and tripped again inside this proposal; code upload by accounts stays closed.",
  "expedited": false
}
```

So füllen Sie die Platzhalter:

| Platzhalter | So bekommen Sie ihn |
| --- | --- |
| `<NEXT_CODE_ID>` | Die letzte Code-ID plus eins. Lesen Sie die letzte mit `curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code?pagination.reverse=true&pagination.limit=1"`. Am 22. November 2026 war die letzte 865, die nächste also 866. Wenn der Vorschlag von jemand anderem zuerst Code speichert, erhält Ihrer eine spätere ID und die Instanziierungsnachricht schlägt fehl, was den ganzen Vorschlag rückgängig macht (verloren geht nur die Wartezeit). |
| `<BASE64_SALT>` | Ein beliebiger kurzer Text, Base64-kodiert: `printf 'my-contract-v1' \| base64`. Er macht die Vertragsadresse vorhersagbar. Vorschlag 40 verwendete den Salt `qday-receipts-w3`. |
| `msg` | Das JSON, das die `instantiate`-Funktion Ihres Vertrags erwartet. `{}` für einen Vertrag ohne Felder. |
| `admin` | Ein leerer String bedeutet keinen Admin, sodass niemand den Vertrag migrieren kann. Bevorzugen Sie das für einen Vertrag, den die Bridge aufruft (siehe [Pins](#pins)). |
| `instantiate_permission` | `Everybody`, oder `{ "permission": "AnyOfAddresses", "addresses": ["qor1..."] }`, um einzuschränken, wer instanziieren darf (Vorschlag 34 tat dies für einen Testvertrag). |

Sie müssen nicht innerhalb des Vorschlags instanziieren. Lassen Sie die letzte Nachricht weg, um nur den Code zu speichern, und instanziieren Sie später mit einer gewöhnlichen Transaktion (`tx wasm instantiate`, siehe [Lebenszyklus eines Vertrags](/developer-guide/cosmwasm-development)). Die Vorschläge 23 und 27 haben Code auf diese Weise gespeichert.

### Vorschlag B: Den Vertrag auf die Cross-VM-Allowlist setzen {#proposal-b}

Nachdem Vorschlag A angenommen wurde, finden Sie die Vertragsadresse und lesen die Live-Cross-VM-Parameter:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID>/contracts"
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>/history"
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

Sie sollten Ihre Vertragsadresse `qor1...`, eine Historie mit **einem** Eintrag (`INIT`, Ihre Code-ID) und den Parametersatz sehen. `MsgUpdateParams` des Cross-VM-Moduls **ersetzt den gesamten Parametersatz**, kopieren Sie also jedes Feld aus der Live-Antwort und ändern Sie nur zwei Dinge: Fügen Sie Ihr Ziel zu `bridge_allowed_targets` hinzu und seinen Pin zu `bridge_target_pins`.

```json
{
  "messages": [
    {
      "@type": "/qorechain.crossvm.v1.MsgUpdateParams",
      "authority": "<GOV_ADDRESS>",
      "max_message_size": "65536",
      "max_queue_size": 1000,
      "queue_timeout_blocks": "100",
      "enabled": true,
      "bridge_allowed_targets": [
        "<ALL EXISTING ENTRIES, UNCHANGED>",
        "cosmwasm:<CONTRACT_ADDRESS>"
      ],
      "bridge_target_pins": [
        "<ALL EXISTING PINS, UNCHANGED>",
        { "target": "cosmwasm:<CONTRACT_ADDRESS>", "code_id": "<CODE_ID>", "history_len": "1" }
      ],
      "max_pending_per_sender": 100,
      "max_cosmos_tx_gas": "50000000",
      "record_retention_blocks": "100000",
      "max_block_wasm_gas": "3000000",
      "max_tx_wasm_share_bps": 5000,
      "max_block_level_wasm_gas": "10000000",
      "queue_wasm_reserve_bps": 2500,
      "wasm_congestion_max_factor": 20,
      "wasm_congestion_target_bps": 5000,
      "max_block_upload_bps": 5000,
      "max_queue_timeouts_per_block": 100
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: allow the bridge to call my-contract",
  "summary": "Adds cosmwasm:<CONTRACT_ADDRESS> (code <CODE_ID>, no admin) to the bridge allowlist with a pin to that code. The existing targets, their pins and every other cross-VM parameter are unchanged.",
  "expedited": false
}
```

Die Zahlen oben sind die am 22. November 2026 gelesenen Werte; verwenden Sie die, die Sie live lesen, nicht diese. Vorschlag 40 ließ `wasm_congestion_factor_micro` weg, ein Feld, das die Live-Antwort ebenfalls zeigt; folgen Sie der Live-Antwort und der Vorlage von Vorschlag 40 und vergleichen Sie das Ergebnis nach der Abstimmung mit der Tabelle in der [Cross-VM-Referenz](/developer-guide/cross-vm-reference#params).

### Pins: was `code_id` und `history_len` bedeuten {#pins}

| Feld | Bedeutung |
| --- | --- |
| `target` | `cosmwasm:` gefolgt von der Vertragsadresse, genau so geschrieben wie in `bridge_allowed_targets`. |
| `code_id` | Der Code, den der Vertrag ausführen muss, damit die Bridge ihn aufruft. |
| `history_len` | Wie viele Einträge die Code-Historie des Vertrags hat, wenn Sie ihn pinnen. Eine frische Instanz hat 1. Ein einmal migrierter Vertrag hat 2 (die Testnet-Allowlist hat einen solchen Vertrag). Jede spätere Migration ändert die Länge, sodass der Pin nicht mehr passt und die Bridge den Aufruf ablehnt. |

Ein Vertrag auf der Allowlist, der einen anderen Admin als die Governance hat, muss gepinnt werden, weil dieser Admin ihn migrieren könnte. Das einfachste sichere Design ist das von Vorschlag 40: kein Admin und ein Pin.

### Beides in einem Vorschlag {#one-proposal}

Vorschlag 40 hat alles in einem Vorschlag erledigt: Er speicherte den Code, instanziierte ihn mit einem Salt und pinnte die Adresse, die dieser Salt ergibt. Das braucht die nächste Code-ID und die künftige Vertragsadresse im Voraus und ist daher leicht falsch zu machen. Zwei Vorschläge kosten eine zusätzliche Abstimmung und ein paar Stunden; bevorzugen Sie sie, es sei denn, Sie haben die Adresse bereits abgeleitet.

## Schritt 4: Einlage, Abstimmungszeitraum und Schwellen {#params}

Lesen Sie die Live-Regeln, bevor Sie einreichen:

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/params/voting
```

| Regel | Regulärer Vorschlag | Beschleunigter Vorschlag (`"expedited": true`) |
| --- | --- | --- |
| Mindesteinlage | 10 QOR (`10000000uqor`) | 50 QOR (`50000000uqor`) |
| Einlagezeitraum (bis zum Erreichen des Minimums) | 172.800 s (2 Tage) | 172.800 s (2 Tage) |
| Abstimmungszeitraum | 14.400 s (4 Stunden) | 3.600 s (1 Stunde) |
| Quorum | 33,4 % des gebondeten Stakes | 33,4 % des gebondeten Stakes |
| Ja-Schwelle | 50 % der abgegebenen Stimmen | 66,7 % der abgegebenen Stimmen |
| Veto-Schwelle | 33,4 % | 33,4 % |
| Mindest-Ersteinlage | keine | keine |

Gelesen am 22. November 2026. Ebenfalls aus derselben Antwort: Eine Stimme „No with Veto“ über der Schwelle verbrennt die Einlage (`burn_vote_veto` ist `true`), ein Vorschlag, der das Quorum verfehlt, verbrennt sie nicht, und ein beschleunigter Vorschlag, der seine Auszählung nicht besteht, läuft als regulärer mit den bereits abgegebenen Stimmen weiter. Jeder bisherige Vorschlag, den das Testnet-Team für Verträge eingereicht hat, war beschleunigt; ein Entwicklervorschlag sollte normalerweise regulär bleiben (die Einlage von 10 QOR und die vierstündige Abstimmung lassen sich leichter planen).

## Schritt 5: Einreichen {#submit}

Jede Transaktion auf der Cosmos-Lane muss die hybride Signatur tragen, also bauen Sie die Transaktion zuerst und signieren sie dann mit Ihrem Post-Quanten-Schlüssel. Der Vorschlag ist groß (der Code steckt darin), geben Sie ihm also Spielraum beim Gas: Die Gebührenuntergrenze liegt bei 0,1 uqor pro Gaseinheit, und ein Byte Transaktion kostet 10 Gas.

```bash
qorechaind tx gov submit-proposal proposal-a.json \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas <GAS> --fees <FEES>uqor \
  --generate-only > submit.json

qorechaind tx pqc cosign submit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

Bestimmen Sie `--gas` und `--fees` mit einem Probelauf: Führen Sie zuerst `tx pqc cosign` mit `--dry-run` aus (es gibt eine Gas-Schätzung aus und sendet nichts), verwenden Sie dann die Schätzung plus 30 % als `<GAS>` und eine Gebühr von mindestens `<GAS>` mal 0,1 uqor als `<FEES>`. Eine einfache Überweisung braucht etwa 300.000 bis 400.000 Gas, ein Deploy oder ein Vorschlag mit Code deutlich mehr.

Auf dem Testnet gemessen: Ein Vorschlag mit etwa 99 KB komprimiertem Code (102,6 KB JSON) verbrauchte 14.961.429 Gas. Rechnen Sie mit etwa 150 Gas pro Byte Vorschlags-JSON, für einen Vorschlag von 100 KB also mindestens `--gas 20000000 --fees 2000000uqor`. Eine Stimme verbrauchte etwa 153.400 Gas: verwenden Sie `--gas 300000 --fees 30000uqor`. Der Code wird am Ende der Abstimmung gespeichert und kostet den Einreicher nichts extra.

`--generate-only` schreibt die unsignierte Transaktion. `tx pqc cosign` fügt beide Signaturen hinzu und sendet sie; Hintergrund unter [Hybride Signierung](/cli-reference/transaction-commands#hybrid-signing) und den [gov-Befehlen](/cli-reference/transaction-commands#submit-proposal). Sie sollten einen Transaktions-Hash und Code 0 sehen. Sehen Sie einen Out-of-Gas-Fehler, erhöhen Sie `--gas` und die passenden `--fees` (die Gebühr muss mindestens Gas mal 0,1 uqor betragen).

Finden Sie Ihre Vorschlags-ID, die auch die Nummer in den Transaktions-Events ist:

```bash
curl -s "https://api-testnet.qore.host/cosmos/gov/v1/proposals?pagination.reverse=true&pagination.limit=1"
```

Sie sollten Ihren Titel und den Status `PROPOSAL_STATUS_VOTING_PERIOD` sehen (die beigefügte Einlage hat das Minimum erreicht). Bei einer kleineren Einlage ist der Status `PROPOSAL_STATUS_DEPOSIT_PERIOD`; jeder kann sie aufstocken:

```bash
qorechaind tx gov deposit <PROPOSAL_ID> 5000000uqor --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > deposit.json
qorechaind tx pqc cosign deposit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

## Schritt 6: Abstimmen {#vote}

Jeder Staker darf mit dem Stake abstimmen, den er hält. Ein einzelnes Entwickler-Wallet erreicht das Quorum von 33,4 % nicht, informieren Sie also die Testnet-Validatoren und Delegatoren über Ihren Vorschlag (die Vorschlagszusammenfassung ist das, was sie lesen) und bitten Sie sie abzustimmen. Eine Stimme ist wie jede andere eine hybrid signierte Transaktion:

```bash
qorechaind tx gov vote <PROPOSAL_ID> yes --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > vote.json
qorechaind tx pqc cosign vote.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

Die Optionen sind `yes`, `no`, `abstain` und `no_with_veto` (siehe [Governance](/user-guide/governance)). Beobachten Sie die Auszählung und die Uhr:

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>/tally
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>
```

Wenn die Abstimmung endet, wird der Status zu `PROPOSAL_STATUS_PASSED` (die Nachrichten sind gelaufen), `PROPOSAL_STATUS_REJECTED` oder `PROPOSAL_STATUS_FAILED`. **Failed** bedeutet, dass die Abstimmung bestanden wurde, aber eine Nachricht nicht laufen konnte, und dann wurde keine der Nachrichten angewendet; `failed_reason` nennt den Grund. Vorschlag 40 zeigte zum Beispiel `PASSED`, eine Stunde nach der Einreichung.

## Schritt 7: Den Code on-chain prüfen {#verify}

Vergleichen Sie den Code, den die Chain hält, mit der Prüfsumme, die Sie gebaut haben. Die Chain meldet `data_hash` in Großbuchstaben; `sha256sum` gibt Kleinbuchstaben aus.

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.code_info.data_hash'
sha256sum artifacts/my_contract.wasm
```

Sie sollten in beiden Zeilen dieselben 64 Zeichen sehen. Als stärkere Prüfung hashen Sie die Bytes, die die Chain tatsächlich hält:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.data' | base64 -d | sha256sum
```

Das gab für Code 865 `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c` aus, dieselbe Prüfsumme wie der Optimizer-Build des Quellcodes von Workshop 3. Prüfen Sie dann den Vertrag und, nach Vorschlag B, die Allowlist:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params | jq '{bridge_allowed_targets, bridge_target_pins}'
```

Sie sollten in der ersten Antwort `code_id` als Ihre und `admin` leer sehen, und in der zweiten Ihr Ziel `cosmwasm:qor1...` mit seinem Pin (`code_id`, `history_len` von `"1"`). Am 22. November 2026 enthielt die Liste vier Ziele; das vierte war `qday-receipts` unter `qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8`, gepinnt auf Code 865.

## Schritt 8: Aus einem EVM-Vertrag aufrufen {#call}

Die EVM ruft die Bridge unter `0x0000000000000000000000000000000000000901` mit `executeCrossVMCall(uint8,string,bytes)` auf: Ziel-VM `1` (Native), Ihre Vertragsadresse als String und die JSON-Nachricht als Bytes. Die Native-Seite sieht das eigene `qor1...`-Konto des aufrufenden EVM-Vertrags als Absender, und ein Revert auf einer der beiden Seiten macht beide rückgängig.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CallMyContract {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function record(string calldata contractAddr, bytes calldata executeMsg) external {
        (bool ok, ) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
    }
}
```

Zwei Bedingungen gelten, beide erklärt in der [Cross-VM-Referenz](/developer-guide/cross-vm-reference#evm-to-wasm): Das Ziel muss auf der Allowlist stehen (und weiter seinen gepinnten Code ausführen), und das Konto, das die Transaktion sendet, braucht ein offenes [EVM-Autorisierungsfenster](/developer-guide/evm-window-reference), dessen `allowed_targets` `0x...0901` auflistet. Für ein vollständiges, getestetes Beispiel mit einem Solidity-Shop und dem Vertrag `qday-receipts` folgen Sie [Workshop 3](/build-before-qday/workshop-3#part-2).

## Fehlerbehebung {#troubleshooting}

| Was Sie sehen | Wahrscheinliche Ursache und Lösung |
| --- | --- |
| `tx wasm store` schlägt fehl oder landet nie | Erwartet. Konten können im Testnet nicht hochladen; der Circuit Breaker und `code_upload_access` blockieren es beide. Verwenden Sie einen Vorschlag. |
| Der Vorschlagsstatus ist `PROPOSAL_STATUS_FAILED` | Die Abstimmung wurde bestanden, aber eine Nachricht ist fehlgeschlagen, daher wurde nichts angewendet. Lesen Sie `failed_reason` in `GET /cosmos/gov/v1/proposals/<id>`. Eine falsche `code_id` in der Instanziierungsnachricht ist die häufige Ursache. |
| `PROPOSAL_STATUS_REJECTED` | Nicht genug Ja-Stimmen oder kein Quorum. Reichen Sie erneut mit einer klareren Zusammenfassung ein, oder bitten Sie Validatoren abzustimmen. |
| Der Status bleibt `PROPOSAL_STATUS_DEPOSIT_PERIOD` | Die Gesamteinlage liegt unter dem Minimum (10 QOR regulär, 50 QOR beschleunigt). Stocken Sie mit `tx gov deposit` innerhalb von 2 Tagen auf. |
| Einreichen schlägt mit Code 20 im Space `pqc` fehl | Die Transaktion trug keine hybride Signatur. Verwenden Sie `--generate-only` und `tx pqc cosign`. |
| Einreichen schlägt mit Out of Gas fehl | Der Vorschlag ist groß. Erhöhen Sie `--gas` und halten Sie die Gebühr bei mindestens Gas mal 0,1 uqor. |
| Die Prüfsumme weicht von `data_hash` ab | Sie haben auf einem anderen Maschinentyp oder mit einer anderen Optimizer-Version gebaut. Bauen Sie neu mit dem in der Vorschlagszusammenfassung genannten Image (arm64- und x86-Images ergeben unterschiedliche Bytes). |
| Der EVM-Aufruf macht einen Revert mit `cross-VM bridge call refused: target ... is not allowlisted` | Der Vertrag steht nicht in `bridge_allowed_targets`, oder sein Code hat sich seit dem Pinnen geändert. Vergleichen Sie die Live-Parameter mit Ihrem Pin. |
| Der EVM-Aufruf wird abgelehnt, bevor er die Bridge erreicht | Kein offenes EVM-Fenster, das `0x0901` auflistet. Öffnen Sie zuerst eines. |
| `MsgCrossVMCall` wird abgelehnt | Der Aufruf ist möglicherweise auf der Circuit-Breaker-Liste pausiert. Lesen Sie `GET /cosmos/circuit/v1/disable_list`. |
| Vorschlag B schlägt fehl | Der Parametersatz war unvollständig oder ein Pin ist falsch. Prüfen Sie, dass jedes Feld der Live-Antwort vorhanden ist und dass `history_len` der Anzahl der Historieneinträge entspricht. |

## Verwandte Seiten {#related}

* [Governance](/user-guide/governance) für Abstimmung, Einlagen und Vorschlagstypen.
* [QoreChain-Native-Entwicklung](/developer-guide/cosmwasm-development) für den Lebenszyklus eines Vertrags und Abfragen.
* [Transaktionsbefehle](/cli-reference/transaction-commands#submit-proposal) für die genauen Flags von `gov` und `pqc cosign`.
* [Cross-VM-Referenz](/developer-guide/cross-vm-reference) für die Parameter, die Queue und die Aufrufbeispiele.
* [Workshop 3](/build-before-qday/workshop-3) für ein durchgearbeitetes Cross-VM-Beispiel.
