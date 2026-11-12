---
slug: /api-reference/rest-grpc-endpoints
title: REST-/gRPC-Endpunkte
sidebar_label: REST-/gRPC-Endpunkte
sidebar_position: 1
---

# REST-/gRPC-Endpunkte

QoreChain stellt drei primäre Schnittstellen für den programmatischen Zugriff bereit:

| Schnittstelle | Standardport | Protokoll | Beschreibung                         |
| ------------- | ------------ | --------- | ------------------------------------ |
| REST          | `1317`       | HTTP/1.1  | REST-Gateway (Cosmos-SDK-API-Server) |
| gRPC          | `9090`       | HTTP/2    | Protobuf-codierter gRPC-Dienst       |
| RPC           | `26657`      | HTTP + WS | QoreChain-Consensus-Engine-RPC       |

Alle REST-Endpunkte liefern JSON zurück. gRPC-Endpunkte verwenden Protocol Buffers und können mit jedem gRPC-Client genutzt werden. Die RPC-Schnittstelle stellt Abfragen auf Konsensebene sowie das Broadcasten von Transaktionen bereit.

:::note
Diese Schnittstellen sind sowohl im **`qorechain-vladi`**-Mainnet (live seit 7. Juni 2026) als auch im **`qorechain-diana`**-Testnet verfügbar. Das Testnet läuft mit dem Node-Release **v3.2.8** (von der Testnet-Governance auf Höhe 9.929.500 am 12. November 2026 angewendet, nach v3.2.7 auf Höhe 9.594.600 am 6. November 2026), das Mainnet mit **v3.2.7**, ein Release dahinter. Das Mainnet hat v3.2.7 auf Höhe 4.164.600 am 12. November 2026 angewendet (Governance-Vorschlag 16, nach v3.2.6 auf Höhe 4.020.000 am 4. November 2026, Governance-Vorschlag 15, v3.2.5 auf Höhe 3.906.833 am 29. Oktober 2026, Vorschlag 14, und v3.2.4 auf Höhe 3.742.566 am 23. Oktober 2026); das Testnet hat v3.2.5 auf Höhe 8.890.800 am 26. Oktober 2026, v3.2.6 auf Höhe 8.970.638 am 27. Oktober 2026, v3.2.7 auf Höhe 9.594.600 und v3.2.8 auf Höhe 9.929.500 angewendet. Das Mainnet hat v3.2.8 nicht angewendet. Routen und Felder, die ein Release hinzufügt, erscheinen in einem Netzwerk erst, wenn dieses Netzwerk das Release angewendet hat. Die unten mit dem 4. November 2026 markierten Routenprüfungen wurden nach dem v3.2.6-Upgrade gegen den öffentlichen Mainnet-Host durchgeführt; die mit **v3.2.7** markierten Routen wurden am 7. November 2026 gegen den öffentlichen Testnet-Host und am 12. November 2026 gegen den öffentlichen Mainnet-Host geprüft, nachdem das Mainnet v3.2.7 angewendet hatte (alle werden bereitgestellt; siehe die Hinweise bei den einzelnen Routen). Die folgenden Basis-URLs setzen einen lokal laufenden Node voraus. Die öffentlichen gehosteten Endpunkte sind `https://api.qore.host` / `https://api-testnet.qore.host` (REST) und `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC), aufgeführt unter [Netzwerke](/appendix/networks#public-endpoints). **Es gibt keinen öffentlichen gRPC-Endpunkt**: Die Hostnamen `grpc.qore.host` und `grpc-testnet.qore.host` existieren nicht; betreiben Sie daher einen eigenen Node, wenn Sie gRPC benötigen.
:::

## Basis-URLs

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Welche Routen es gibt {#which-routes-exist}

QoreChain-spezifische Module werden über REST unter dem Präfix `/qorechain/<module>/v1/...` bereitgestellt, und nur die unten aufgeführten Module haben REST-Routen. Die übrigen Module sind **ausschließlich über gRPC** erreichbar (siehe [Nur-gRPC-Module](#grpc-only-modules)). Standardrouten für Cosmos SDK, EVM und QoreChain Native sind unter [Standardrouten](#standard-routes) aufgeführt.

Eine Route, die nicht existiert, antwortet mit HTTP `501` und `{"code":12,"message":"Not Implemented"}`. Das bedeutet, dass die Route nicht bereitgestellt wird, nicht, dass die Abfrage ein leeres Ergebnis geliefert hat. Verkürzte Pfade ohne das Präfix `/qorechain/` (zum Beispiel `/bridge/v1/chains` oder `/pqc/v1/params`) werden **nicht** bereitgestellt. Ein unbekannter Datensatz auf einer Route, die existiert, liefert HTTP `404` mit `{"code":5,"message":"... not found"}`.

Die folgenden Beispiele verwenden den öffentlichen Mainnet-Host; ersetzen Sie ihn für das Testnet durch `https://api-testnet.qore.host`. Die Werte in den Beispielen wurden zwischen dem 20. und 27. Oktober 2026 aus den Live-Netzwerken gelesen und ändern sich im Lauf der Zeit; nutzen Sie sie für die Form einer Antwort. Das Release v3.2.4 hat einige Routen und Felder hinzugefügt. Sie sind unten mit **v3.2.4** markiert: Das Testnet stellt sie seit dem 19. Oktober 2026 bereit, das Mainnet seit dem 23. Oktober 2026. Das Release v3.2.5 (Mainnet seit dem 29. Oktober 2026, Testnet seit dem 26. Oktober) hat die Cross-VM-Parameter- und Nachrichtenrouten sowie die Route des nativen Schlüsselregisters hinzugefügt, markiert mit **v3.2.5**. Das Release v3.2.6 (Testnet seit dem 27. Oktober 2026, Mainnet seit dem 4. November 2026) hat weitere hinzugefügt, markiert mit **v3.2.6**: Der Mainnet-Host antwortete am 4. November 2026 darauf mit `200` (wo eine Ausnahme gilt, ist sie vermerkt). Ein Node, der noch ein älteres Release verwendet, antwortet auf eine neue Route mit `501`. Das Release v3.2.7 (Testnet seit dem 6. November 2026, Mainnet seit dem 12. November 2026) hat die mit **v3.2.7** markierten Routen hinzugefügt: PQC-Multisig und textuelles Signieren, Staking-APR und die SVM-Cluster-Identität.

## PQC-Modul {#pqc-module}

| Methode | Endpunkt                                 | Beschreibung                                                                          |
| ------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| GET     | `/qorechain/pqc/v1/account/{address}`    | Registrierung des Post-Quanten-Schlüssels für ein Konto (`found`, Schlüsseltyp, Algorithmus) |
| GET     | `/qorechain/pqc/v1/evm_window/{address}` | Das Autorisierungsfenster der EVM-Lane des Kontos und was davon übrig ist             |
| GET     | `/qorechain/pqc/v1/evm_limits`           | Die geltenden EVM-Gaslimits (pro Transaktion 30,000,000); nur im Testnet ab v3.2.8; das Mainnet hat v3.2.8 nicht angewendet und antwortet mit `501` (geprüft am 12. November 2026) |
| GET     | `/qorechain/pqc/v1/evm_delegation_consent/{address}` | Die EIP-7702-Delegationseinwilligung des Kontos, die aktuelle Delegation und die EVM-Nonce (seit v3.2.2) |
| GET     | `/qorechain/pqc/v1/protocol_features`    | **v3.2.4** (Testnet seit dem 19. Oktober 2026; Mainnet seit dem 23. Oktober 2026; `501` auf einem älteren Node). Jedes Protokoll-Feature, das das Binary kennt, mit den Flags `enabled`, `known` und `staged` |
| GET     | `/qorechain/pqc/v1/kem/{address}`        | **v3.2.5** (beide Netzwerke, im Mainnet seit dem 29. Oktober 2026, im Testnet seit dem 26. Oktober; `501` auf einem älteren Node). Der ML-KEM-Verschlüsselungsschlüssel, der für eine Adresse in der nativen Schlüsselregistry registriert ist: `{"found":false,"key":null}`, wenn keiner registriert ist |
| GET     | `/qorechain/pqc/v1/params`               | **v3.2.6** (Testnet seit dem 27. Oktober 2026, Mainnet seit dem 4. November 2026; `501` auf einem älteren Node). Die Modulparameter |
| GET    | `/qorechain/pqc/v1/multisig/{address}`   | **v3.2.7** (Testnet seit dem 6. November 2026, Mainnet seit dem 12. November 2026; `501` auf einem älteren Node). Der hybride Post-Quanten-Multisig-Eintrag einer Adresse: `{"found":false,"multisig":null}`, wenn keiner registriert ist |
| POST   | `/qorechain/pqc/v1/textual_sign_doc`     | **v3.2.7** (Testnet seit dem 6. November 2026, Mainnet seit dem 12. November 2026; `501` auf einem älteren Node; auch ein `GET` antwortet mit `501`). Erstellt das SIGN_MODE_TEXTUAL-Dokument einer Transaktion, das eine Web-Wallet anzeigen und signieren kann (siehe unten) |

Beachten Sie, dass das Pfadsegment die Singularform `account` ist. Eine Route `/qorechain/pqc/v1/stats` gibt es nicht (nutzen Sie `qorechaind query pqc stats`). `/qorechain/pqc/v1/params` wird ab v3.2.6 bereitgestellt und antwortete am 4. November 2026 in beiden Netzwerken mit `200` (im Mainnet: `pqc_primary` `true`, `allow_classical_fallback` `false`, `min_security_level` `5`, `default_signature_algo_name` `dilithium5`, `hybrid_signature_mode_name` `required`). Verwenden Sie auf einem Node älter als v3.2.6 stattdessen `qorechaind query pqc params`.

### PQC-Multisig und textuelles Signieren (v3.2.7) {#pqc-multisig-textual}

Seit v3.2.7 (Testnet seit dem 6. November 2026, Mainnet seit dem 12. November 2026, wo das Protokoll-Feature `pqc-multisig` ab Höhe 4.164.600 aktiviert ist) kann ein Konto einen hybriden Post-Quanten-k-aus-n-Multisig haben. Die Nachricht ist `/qorechain.pqc.v1.MsgRegisterPQCMultisig`; die Post-Quanten-Menge folgt den Mitgliedern und Schlüsseln des aktuellen klassischen Multisigs des Kontos. `GET /qorechain/pqc/v1/multisig/{address}` liefert die Registrierung. Am 7. November 2026 antwortete es für ein Konto ohne Multisig mit `200` und `{"found":false,"multisig":null}` (die Route braucht eine gültige Adresse `qor1...`; eine fehlerhafte antwortet mit `400`). Im Mainnet wird die Route seit dem 12. November 2026 bereitgestellt (eine Anfrage mit einer ungültigen Adresse antwortete mit `400`, was zeigt, dass die Route eingebunden ist). Die Felder des Eintrags für einen registrierten Multisig wurden hier nicht gelesen, weil im Testnet noch kein Multisig registriert ist.

`POST /qorechain/pqc/v1/textual_sign_doc` bedient Hardware- und Web-Wallets, die mit SIGN_MODE_TEXTUAL signieren. Der JSON-Body enthält `tx_json` (die unsignierte Transaktion als JSON-String) oder `tx_bytes` (base64) sowie `chain_id`, `account_number`, `sequence` und `public_key` (ein Any mit `@type` und `key`). Die Antwort enthält `sign_bytes` (base64, das zu signierende Dokument) und `screens`, die Liste der Zeilen, die ein Gerät anzeigt (`title`, `content`, `indent`, `expert`). Im Mainnet antwortete ein leerer JSON-Body am 12. November 2026 mit `400`, die Route ist dort also eingebunden. Ein Body ohne Transaktion antwortet mit `400` (`tx_bytes or tx_json is required`), und eine Transaktion ohne Nachricht oder mit mehr als 32 Nachrichten wird abgelehnt. Auf der Kommandozeile unterstützt `qorechaind tx pqc cosign` den textuellen Signiermodus ab v3.2.7 (siehe [Transaktionsbefehle](/cli-reference/transaction-commands#cosign)).

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/multisig/qor1...   # oder api-testnet.qore.host
curl -s -X POST https://api.qore.host/qorechain/pqc/v1/textual_sign_doc \
  -H 'content-type: application/json' -d @request.json
```

Das für eine Post-Quanten-Signaturprüfung berechnete Gas beträgt ab v3.2.7 (Testnet seit dem 6. November 2026, Mainnet seit dem 12. November 2026, Schalter `pqc-verify-gas-calibrated`) pauschal 2.000 Gas pro Prüfung; siehe [Versionshistorie](/appendix/version-history#v327).

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/account/qor1...
```

```json
{
  "found": true,
  "account": {
    "address": "qor1...",
    "public_key": "<base64 ML-DSA-87 public key>",
    "algorithm_id": 1,
    "algorithm_name": "dilithium5",
    "ecdsa_pubkey": null,
    "key_type": "hybrid",
    "created_at_height": "209015",
    "migration_public_key": null,
    "migration_algorithm_id": 0,
    "classical_key_source": "auth_account"
  }
}
```

`classical_key_source` gibt an, woher `ecdsa_pubkey` stammt: `stored` (der bei der Registrierung angegebene Schlüssel), `auth_account` (es wurde nichts gespeichert, daher ist es der eigene On-Chain-Public-Key des Kontos) oder `none`. Ab v3.2.4 (im Testnet seit dem 19. Oktober 2026; im Mainnet seit dem 23. Oktober 2026) trägt der Datensatz außerdem `"possession_proven": false`; das Feld ist `true`, sobald ein Schlüssel mit einem verifizierten [Besitznachweis](/developer-guide/post-quantum-signing#proof-of-possession) registriert wurde; ein Node mit einem älteren Release meldet das Feld nicht.

Ein Konto ohne registrierten Schlüssel liefert `{"found": false, "account": null}`. Verwenden Sie `found`, um zu entscheiden, ob ein Konto einen Schlüssel registrieren muss, bevor es senden kann.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_window/qor1...
```

```json
{
  "found": false,
  "live": false,
  "opened_height": "0",
  "expiry_height": "0",
  "max_txs": "0",
  "used_txs": "0",
  "max_value": "",
  "used_value": "",
  "remaining_blocks": "0",
  "remaining_txs": "0",
  "remaining_value": "",
  "native_only": false,
  "allowed_targets": []
}
```

Diese Route schlägt für eine Adresse ohne Fenster nie fehl; sie liefert `found: false`. Seit v3.2.0 lässt die EVM-Lane eine Transaktion nur von einem Konto zu, das einen registrierten PQC-Schlüssel **und** ein offenes Fenster hat. `live` ist `true`, solange das Fenster bei der aktuellen Blockhöhe mindestens eine weitere Transaktion zulässt. `remaining_blocks`, `remaining_txs` und `remaining_value` zeigen, welche Grenze am ehesten erschöpft ist; Werte sind `uqor`-Ganzzahlen, die als Strings zurückgegeben werden. Seit v3.2.3 kann ein Fenster einen Scope tragen: `native_only` (nur einfache QOR-Transfers) und `allowed_targets` (nur aufgelistete Empfänger; es begrenzt, welche Contracts und Token berührt werden dürfen, nicht wie viel). Wie die EVM-Lane funktioniert, steht unter [EVM-Entwicklung](/developer-guide/evm-development#evm-window).

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_delegation_consent/qor1...
```

```json
{
  "found": false,
  "live": false,
  "delegate": "",
  "granted_height": "0",
  "expiry_height": "0",
  "current_delegate": "",
  "nonce": "0"
}
```

Eine EIP-7702-Delegation eines Kontos wird nur mit der eigenen Post-Quanten-Einwilligung des Kontos wirksam (`MsgAuthorizeEVMDelegation`). `found` und `live` melden eine aufgezeichnete, noch verwendbare Einwilligung für `delegate`; `current_delegate` ist die Delegation, die das Konto aktuell gesetzt hat, und `nonce` ist seine EVM-Nonce.

## Bridge-Modul {#bridge-module}

Der schreibgeschützte Zustand des Bridge-Moduls wird über REST unter `/qorechain/bridge/v1/...` bereitgestellt (mit echten On-Chain-JSON-Daten seit Chain-Version **v3.1.77**). Die Bridge-`config` meldet z. B. `min_validators=10` und `attestation_threshold=7`.

| Methode | Endpunkt                                    | Beschreibung                                  |
| ------- | ------------------------------------------- | --------------------------------------------- |
| GET     | `/qorechain/bridge/v1/config`               | Aktuelle Konfiguration des Bridge-Moduls      |
| GET     | `/qorechain/bridge/v1/chains`               | Listet alle registrierten Bridge-Chains auf   |
| GET     | `/qorechain/bridge/v1/chains/{chain_id}`    | Details zu einer bestimmten verbrückten Chain |
| GET     | `/qorechain/bridge/v1/validators`           | Listet registrierte Bridge-Validatoren auf    |
| GET     | `/qorechain/bridge/v1/validators/{address}` | Details zu einem bestimmten Bridge-Validator  |
| GET     | `/qorechain/bridge/v1/operations`           | Listet Bridge-Operationen auf                 |
| GET     | `/qorechain/bridge/v1/operations/{id}`      | Details zu einer bestimmten Bridge-Operation  |

```bash
curl -s https://api.qore.host/qorechain/bridge/v1/config
```

```json
{
  "config": {
    "min_validators": 10,
    "attestation_threshold": 7,
    "challenge_period_secs": "86400",
    "large_transfer_threshold": "100000000000",
    "enabled": true
  }
}
```

`chains/{chain_id}` liefert einen Eintrag wie `{"chain": {"chain_id": "ethereum", "name": "Ethereum", "chain_type": "evm", "bridge_contract": "0x000…0", "status": "pending", "min_confirmations": 12, ...}}`.

:::caution Die Bridge ist noch nicht live
Alle 37 konfigurierten Bridge-Chains melden in beiden Netzwerken `"status": "pending"`, und `validators` und `operations` sind leere Listen. Diese Routen zeigen die Konfiguration des Moduls; sie bedeuten nicht, dass heute Assets verbrückt werden können. Siehe [Bridge-Architektur](/architecture/bridge-architecture).
:::

## Multilayer-Modul {#multilayer-module}

Der vollständige Abfragedienst des Multilayer-Moduls wird über REST unter `/qorechain/multilayer/v1/...` bereitgestellt (seit Chain-Version **v3.1.80**), einschließlich zweier **State-Anchor-Leseabfragen**: `anchor/{layer_id}` liefert den neuesten Settlement-Anchor für eine Layer, und `anchors/{layer_id}` liefert deren Anchor-Verlauf. Jeder Anchor trägt eine **ML-DSA-87 (Dilithium-5)**-Signatur über seine kanonischen Felder, sodass ein Client einen Anchor abrufen und unabhängig verifizieren kann — die On-Chain-Grundlage für die [Settlement Receipts](/rollups/settlement-receipts) des Rollup Development Kit.

| Methode | Endpunkt                                      | Beschreibung                                               |
| ------- | --------------------------------------------- | ---------------------------------------------------------- |
| GET     | `/qorechain/multilayer/v1/params`             | Aktuelle Parameter des Multilayer-Moduls                   |
| GET     | `/qorechain/multilayer/v1/layers`             | Listet alle registrierten Layer auf                        |
| GET     | `/qorechain/multilayer/v1/layers/{layer_id}`  | Details zu einer bestimmten Layer                          |
| GET     | `/qorechain/multilayer/v1/anchor/{layer_id}`  | Neuester State-Anchor für eine Layer                       |
| GET     | `/qorechain/multilayer/v1/anchors/{layer_id}` | State-Anchor-Verlauf für eine Layer                        |
| GET     | `/qorechain/multilayer/v1/routing-stats`      | Statistiken zum Transaktionsrouting über alle Layer hinweg |

Eine `StateAnchorView` enthält `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` und `compressed_state_proof`. Seit v3.2.2 ist die signierte Nachricht die **v2-Anchor-Nachricht**: das Domain-Tag `qorechain-multilayer-anchor-v2`, dann Chain-ID, Layer-ID, Layer-Höhe, State Root, Validator-Set-Hash, Transaktionszahl und komprimierter State Proof, wobei jedem Feld variabler Länge seine 8-Byte-Länge im Big-Endian-Format vorangestellt ist (die frühere v1-Nachricht hatte keine Chain-ID und keine Längenpräfixe, sodass eine Signatur auf jeder Chain gültig war). Sie wird gegen den registrierten PQC-Schlüssel des Layer-Erstellers verifiziert. `qorechaind query rdk anchor-sign-bytes` gibt die Bytes für einen Rollup-Batch aus. Eine Layer ohne Anchor liefert von `anchor/{layer_id}` HTTP `404` (`no anchor for layer ...`) und von `anchors/{layer_id}` eine leere Liste (`{"anchors": []}`).

```bash
curl -s https://api.qore.host/qorechain/multilayer/v1/params
```

```json
{
  "params": {
    "max_sidechains": "10",
    "max_paychains": "50",
    "min_anchor_interval": "100",
    "max_anchor_interval": "1000",
    "default_challenge_period": "86400",
    "min_sidechain_stake": "1000000000",
    "min_paychain_stake": "100000000",
    "routing_enabled": true,
    "routing_confidence_threshold": "0.6",
    "cross_layer_fee_bundling": true
  }
}
```

Zum Zeitpunkt der Erstellung ist `layers` in beiden Netzwerken eine leere Liste. Das Beispiel ist die Mainnet-Antwort; im Testnet ist `max_sidechains` `64` (durch Governance-Vorschlag 16 angehoben, angenommen am 25. Oktober 2026, für das Builder-Event).

## Burn-Modul {#burn-module}

Der schreibgeschützte Zustand des Burn-Moduls wird über REST unter `/qorechain/burn/v1/...` bereitgestellt. Die Burn-`params` enthalten z. B. `gas_burn_rate=0.30`.

| Methode | Endpunkt                              | Beschreibung                                                                        |
| ------- | ------------------------------------- | ----------------------------------------------------------------------------------- |
| GET     | `/qorechain/burn/v1/params`           | Aktuelle Parameter des Burn-Moduls                                                  |
| GET     | `/qorechain/burn/v1/stats`            | Kumulierte Burn-Summe, aufgeschlüsselt nach Quelle                                  |
| GET     | `/qorechain/burn/v1/records`          | Listet aktuelle Burn-Datensätze auf                                                 |
| GET     | `/qorechain/burn/v1/milestone`        | Fortschritt des Burn-Meilensteins (kumulierte Transaktionszahl)                     |
| GET     | `/qorechain/burn/v1/stranded_rewards` | Beiseitegelegter und von der Governance noch nicht freigegebener Staker-Anteil      |

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

```json
{
  "stats": {
    "total_burned": "31574710367921",
    "burns_by_source": {
      "gas_fee": "31574710282421",
      "failed_tx": "85500",
      "milestone": "0",
      "amm": "0",
      "xqore_penalty": "0"
    },
    "last_burn_height": "3666968"
  }
}
```

Die echte Antwort listet jede Burn-Quelle auf (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty` und ab v3.2.4 `staking_tier_penalty`, die Strafe für das vorzeitige Entsperren einer Staking-Tier-Sperre, die verbrannt wird); das Beispiel ist gekürzt. Beträge sind in `uqor` angegeben. `failed_tx` ist seit dem Upgrade v3.2.2 ungleich null, als der Burn für fehlgeschlagene Transaktionen begann, auf die tatsächlich berechnete Gebühr angewendet zu werden. Seit v3.2.3 werden alte `records` einzelner Burns bereinigt, sodass `records` ein aktuelles Fenster ist und nicht den vollständigen Verlauf zeigt; die Summen in `stats` sind kumuliert.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "0", "released": "10500542706858", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` ist der Betrag, der noch freizugeben ist, `released` ist, wie viel die Governance bereits herausbewegt hat, und `snapshot_height` ist die Höhe des Upgrades v3.2.0, das die Reserve erfasst hat. Die obigen Werte wurden am 23. Oktober 2026 gelesen: Die Governance hat den ersten Betrag (6.693.045,921330 QOR) am 19. Oktober 2026 freigegeben, das Upgrade v3.2.3 hat die verbleibende Reserve auf seiner eigenen Höhe neu berechnet (3.807.496,785528 QOR), und Governance-Vorschlag 12 hat diesen Betrag freigegeben (angenommen, Abstimmung beendet am 21. Oktober 2026), sodass die Reserve nun leer ist und `released` insgesamt 10.500.542,706858 QOR beträgt. Lesen Sie die Live-Werte. Siehe [Tokenomics](/architecture/tokenomics).

## Abstract-Account-Modul {#abstract-account-module}

Der Abfragedienst für Abstract Accounts wird über REST unter `/qorechain/abstractaccount/v1/...` bereitgestellt (seit Chain-Version **v3.1.85**), einschließlich des **Permission Schema**, das zur Validierung von [Authenticator](/developer-guide/account-abstraction#authenticators)-Scopes ohne Hardcoding verwendet wird.

| Methode | Endpunkt                                           | Beschreibung                                                                |
| ------- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| GET     | `/qorechain/abstractaccount/v1/config`             | Modulkonfiguration (Feature-Probe: `enabled`)                               |
| GET     | `/qorechain/abstractaccount/v1/accounts`           | Listet Abstract Accounts auf                                                |
| GET     | `/qorechain/abstractaccount/v1/accounts/{address}` | Abstract-Account-Zustand für eine Adresse (`404`, falls keiner existiert)   |
| GET     | `/qorechain/abstractaccount/v1/permission_schema`  | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs`, `lane_rules` |
| GET     | `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` | **v3.2.4** (Testnet seit dem 19. Oktober 2026; Mainnet seit dem 23. Oktober 2026; `501` auf einem älteren Node). Die Sequenz, die ein verknüpfter Authenticator-Schlüssel als Nächstes signieren muss (`nonce`, `linked`) |

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/config
```

```json
{ "config": { "enabled": false, "max_session_keys": 10, "max_spending_rules": 5, "default_session_ttl": "86400" } }
```

:::note Im Mainnet deaktiviert, im Testnet aktiviert
Das obige Beispiel ist die Mainnet-Antwort: Dort ist `enabled` `false` (und `accounts` eine leere Liste), sodass Abstract-Account-Funktionen wie das Ausgeben über verknüpfte Wallets im Mainnet nicht verfügbar sind. Im Testnet ist `enabled` seit dem Governance-Vorschlag 18 (angenommen am 27. Oktober 2026) `true`, und `accounts` listet die bisher erstellten Konten auf (geprüft am 27. Oktober 2026). Verwenden Sie `config.enabled` als Feature-Probe, bevor Sie sich auf dieses Modul verlassen. Siehe [Account Abstraction](/developer-guide/account-abstraction).
:::

## AMM-Modul {#amm-module}

| Methode | Endpunkt                                                            | Beschreibung                                                 |
| ------- | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| GET     | `/qorechain/amm/v1/params`                                          | Aktuelle AMM-Parameter (Gebühren in Basispunkten, Limits)    |
| GET     | `/qorechain/amm/v1/pools`                                           | Listet Pools auf                                             |
| GET     | `/qorechain/amm/v1/pools/{pool_id}`                                 | Ein Pool (`404`, falls unbekannt)                            |
| GET     | `/qorechain/amm/v1/pools/{pool_id}/lp/{address}`                    | LP-Token-Guthaben einer Adresse in einem Pool                |
| GET     | `/qorechain/amm/v1/pool_by_denoms?denom_a=&denom_b=`                | Findet den Pool für ein Denom-Paar (`404`, falls keiner existiert) |
| GET     | `/qorechain/amm/v1/quote/exact_in?pool_id=&denom_in=&amount_in=`    | Quote: Output für einen exakten Input                        |
| GET     | `/qorechain/amm/v1/quote/exact_out?pool_id=&denom_out=&amount_out=` | Quote: benötigter Input für einen exakten Output             |

```bash
curl -s https://api.qore.host/qorechain/amm/v1/params
```

```json
{
  "params": {
    "swap_fee_bps": 30,
    "protocol_fee_bps": 10,
    "min_liquidity": "1000",
    "max_pools_per_creator": 50,
    "lp_token_decimals": 6,
    "pool_creation_fee": "100000000",
    "max_swap_impact_bps": 500,
    "enabled": true
  }
}
```

Alle sieben AMM-Routen antworten in beiden Netzwerken (geprüft am 27. Oktober 2026). Zum Zeitpunkt der Erstellung gibt es in keinem der beiden Netzwerke Pools (`{"pools": []}`). Antworten auf Eingaben, die nichts treffen: `pools/{pool_id}` mit einer unbekannten ID liefert HTTP `404` (`{"code":5,"message":"pool 1 not found"}`); `pool_by_denoms` ohne Pool für das Paar liefert `404` (`no pool for uqor/foo`); eine Quote für einen unbekannten Pool liefert HTTP `400` mit `{"code":3,"message":"pool not found"}`; `pools/{pool_id}/lp/{address}` liefert `{"balance":"0"}` für eine Adresse ohne LP-Position (die Adresse muss eine gültige bech32-Adresse mit `qor1` sein, sonst `400`). Die beiden Quote-Routen und `pool_by_denoms` lesen ihre Eingabe aus dem Query-String und brauchen daher Parameter: Ohne `amount_in` / `amount_out` antworten sie mit `400` (`invalid amount_in` / `invalid amount_out`).

Im Testnet ist die zweite Denomination, die ein Pool braucht, verfügbar: drei per Governance registrierte Test-Token, siehe [Testnet-Test-Token (Fest)](#fest-tokens). Im Mainnet gibt es kein Äquivalent; seine einzige Bank-Denomination ist `uqor`.

## Lizenz-Modul {#licence-module}

| Methode | Endpunkt                                             | Beschreibung                                                                          |
| ------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| GET     | `/qorechain/license/v1/check/{grantee}/{feature_id}` | Ob `grantee` eine aktive Berechtigung für das Feature hält (`404`, falls keine)       |
| GET     | `/qorechain/license/v1/holders/{feature_id}`         | Alle Berechtigungen für ein Feature                                                   |
| GET     | `/qorechain/license/v1/list/{grantee}`               | Alle von einer Adresse gehaltenen Berechtigungen                                      |

Eine Berechtigung (`LicenseView`) hat `grantee`, `feature_id`, `expires_at`, `granted_at`, `granted_by`, `suspended` und `metadata`. `check` liefert zusätzlich `active`. Eine Listen- oder Holders-Abfrage ohne Treffer liefert `{"licenses": []}`; `check` für eine Adresse ohne Berechtigung liefert HTTP `404` mit `{"code":5,"message":"no license for <grantee>/<feature_id>"}`.

```bash
curl -s https://api.qore.host/qorechain/license/v1/holders/lightnode_operator
```

```json
{
  "licenses": [
    {
      "grantee": "qor1...",
      "feature_id": "lightnode_operator",
      "expires_at": "0",
      "granted_at": "3536305",
      "granted_by": "qor1...",
      "suspended": false,
      "metadata": "",
      "active": true
    }
  ]
}
```

`expires_at: "0"` bedeutet, dass die Berechtigung nicht abläuft. Seit v3.2.3 kann die Governance die Lizenzautorität ersetzen, die diese Lizenzen erteilt (`MsgUpdateAuthority`); bereits erteilte Berechtigungen bleiben bestehen.

## Light-Node-Modul {#light-node-module}

| Methode | Endpunkt                                    | Beschreibung                                                                  |
| ------- | ------------------------------------------- | ----------------------------------------------------------------------------- |
| GET     | `/qorechain/lightnode/v1/params`            | Parameter für Registrierung, Heartbeat und Belohnungen                        |
| GET     | `/qorechain/lightnode/v1/stats`             | `total_registered`, `total_active`, `total_rewards`, `last_reward_height`     |
| GET     | `/qorechain/lightnode/v1/nodes`             | Listet registrierte Light Nodes auf                                           |
| GET     | `/qorechain/lightnode/v1/node/{address}`    | Ein Node (`{"node": null, "found": false}`, falls nicht registriert)          |
| GET     | `/qorechain/lightnode/v1/rewards/{address}` | Für eine Operator-Adresse angesammelte Belohnungen (`accumulated_rewards`)    |
| GET     | `/qorechain/lightnode/v1/reward_pool`       | Abrechnung des Belohnungspools (`balance`, `reserved`, `outstanding`, `payable`, `distributable`, `max_reward_per_block_per_node`, `max_reward_per_month_per_node`, `initialized`) |

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/params
```

```json
{
  "registration_fee": "1000000",
  "heartbeat_interval": "1000",
  "min_delegated_stake": "1000000000",
  "reward_share": "0.030000000000000000",
  "min_uptime_for_rewards": "0.800000000000000000",
  "max_light_nodes": "10000",
  "heartbeat_grace_period": "100"
}
```

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/reward_pool
```

```json
{
  "balance": "5645408555",
  "reserved": "5645276228",
  "outstanding": "130077",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "2250",
  "initialized": true,
  "max_reward_per_month_per_node": "2000000000",
  "monthly_cap_active": true,
  "last_distribution_time": "1792775155",
  "last_distribution_height": "3744000"
}
```

`reserved` ist der Teil des Pools, der zurückgehalten wird und nur per Governance-Abstimmung bewegt werden kann. Die Grenzen pro Node sind in `uqor` angegeben: `max_reward_per_block_per_node` ist die Obergrenze pro Block, und seit v3.2.3 ist `max_reward_per_month_per_node` (`2000000000` uqor = 2.000 QOR pro 30 Tage) die Monatsobergrenze, anteilig nach Blockzeit und Uptime berechnet, sodass sie nicht mehr davon abhängt, wie schnell Blöcke kommen. Eine Obergrenze ist kein zugesicherter Betrag. Das Beispiel ist die am 23. Oktober 2026 gelesene Live-Antwort des Mainnets, nachdem die Governance die frühere Reserve freigegeben hatte (Vorschlag 8, 19. Oktober 2026). Ab v3.2.4 (im Testnet seit dem 19. Oktober 2026; im Mainnet seit dem 23. Oktober 2026) enthält die Antwort zusätzlich `monthly_cap_active`, `last_distribution_time` und `last_distribution_height`, und die Grenze eines Nodes beginnt mit seiner eigenen Registrierung.

:::note Die Registrierung erfordert eine Lizenz
Die Chain lehnt eine Light-Node-Registrierung ohne eine aktive `lightnode_operator`-Lizenzberechtigung ab (`holders/lightnode_operator` listet die Berechtigungen auf). Am 27. Oktober 2026 meldet `stats` sowohl im Mainnet als auch im Testnet `"total_registered": "1"`. Den Programmstatus finden Sie unter [Light Nodes](/light-node/overview).
:::

## RDK-Modul {#rdk-module}

Der Abfragedienst des Rollup Development Kit wird über REST unter `/qorechain/rdk/v1/...` bereitgestellt (seit Chain-Version **v3.2.2**; in v3.2.0 und v3.2.1 war er ausschließlich über gRPC erreichbar).

| Methode | Endpunkt                                              | Beschreibung                                         |
| ------- | ----------------------------------------------------- | ---------------------------------------------------- |
| GET     | `/qorechain/rdk/v1/params`                            | Modulparameter                                       |
| GET     | `/qorechain/rdk/v1/rollups`                           | Listet Rollups auf                                   |
| GET     | `/qorechain/rdk/v1/rollup/{rollup_id}`                | Ein Rollup (`404`, falls unbekannt)                  |
| GET     | `/qorechain/rdk/v1/latest_batch/{rollup_id}`          | Der neueste Settlement-Batch des Rollups             |
| GET     | `/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`   | Ein Settlement-Batch                                 |
| GET     | `/qorechain/rdk/v1/batches/{rollup_id}`               | Die Batches des Rollups in Indexreihenfolge (paginiert) |
| GET     | `/qorechain/rdk/v1/blob/{rollup_id}/{blob_index}`     | Ein Datensatz eines Data-Availability-Blobs          |

```bash
curl -s https://api.qore.host/qorechain/rdk/v1/params
```

```json
{
  "params": {
    "max_rollups": 100,
    "min_stake_for_rollup": "10000000000",
    "rollup_creation_burn_rate": "0.01",
    "default_challenge_window": "604800",
    "max_da_blob_size": "2097152",
    "blob_retention_blocks": "432000",
    "max_batches_per_block": 10
  }
}
```

Zum Zeitpunkt der Erstellung ist `rollups` in beiden Netzwerken eine leere Liste, sodass die Routen pro Rollup mit `404` antworten (zum Beispiel `{"code":5,"message":"rollup foo not found"}`). `default_challenge_window` wird in Sekunden angegeben (`604800`). Ab v3.2.4 wird das optimistische Challenge-Fenster eines neu eingereichten Batches in Blockzeit gemessen: im Testnet seit Höhe 8.337.253 (19. Oktober 2026), im Mainnet seit Höhe 3.742.566 (23. Oktober 2026). Vor dem Upgrade rechnete die Chain den Sekundenwert mit festen 6 Sekunden pro Block in Blöcke um. Im Testnet setzte der Governance-Vorschlag 17 (angenommen am 27. Oktober 2026) `default_challenge_window` für das Builder-Event auf `3600` (eine Stunde) und `max_rollups` auf `200`, sodass das obige Beispiel (Mainnet) dort vom Testnet abweicht; `rollups` ist im Testnet zum Zeitpunkt der Erstellung weiterhin leer.

**v3.2.7 (Testnet seit dem 6. November 2026; der Schalter `rdk-zk-verification-key` ist für das Mainnet seit dem 12. November 2026 eingeschaltet):** Ein ZK-Rollup kann seinen Verification Key mit `MsgSetVerificationKey` registrieren (und später mit `MsgUpdateVerificationKey` ändern), und ein ZK-Batch für ein Rollup ohne Key wird abgelehnt, bevor die Gebühr bezahlt wird. Das sind Nachrichten, keine Abfragen: Keine REST-Route liest einen registrierten Key (die naheliegenden Pfade antworteten am 7. November 2026 mit `501`), und im Testnet ist kein ZK-Rollup registriert (`rollups` ist leer; auch das Mainnet hatte bei der letzten Prüfung am 4. November 2026 keines); die Registrierung wurde hier daher nicht Ende-zu-Ende ausgeführt. Siehe [Versionshistorie](/appendix/version-history#v327).

## Inflationsmodul {#inflation-module}

Die Emissionseinstellungen und der Fortschritt werden über REST unter `/qorechain/inflation/v1/...` bereitgestellt (seit Chain-Version **v3.2.2**). Sie sind über keinen CLI-Befehl verfügbar.

| Methode | Endpunkt                              | Beschreibung                                                                |
| ------- | ------------------------------------- | --------------------------------------------------------------------------- |
| GET     | `/qorechain/inflation/v1/params`      | Emissionsparameter: `emission_mode`, `fixed_epoch_emission`, `max_total_emission`, `epoch_length`, `enabled` |
| GET     | `/qorechain/inflation/v1/epoch_info`  | Fortschritt: `current_epoch`, `block_start`, `next_epoch_height`, `total_minted`, `max_total_emission`, `remaining_emission` |

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info
```

Im Mainnet ist `emission_mode` `"fixed"`, `fixed_epoch_emission` ist `"86000000000"` (86.000 QOR pro Epoche), `epoch_length` ist `"43200"` Blöcke und `max_total_emission` ist `"590000000000000"` (590.000.000 QOR, die kumulative Obergrenze). Diese Werte wurden durch Governance-Vorschlag 10 festgelegt (angenommen am 19. Oktober 2026); die erste Epoche, die den neuen festen Betrag verwendet, beginnt bei Block 3.672.000, und `epoch_info` zeigt die laufende Epoche und den bisher geminteten Betrag. Die Liste `schedule` in der Antwort gehört zum ursprünglichen Modus `schedule`; sie beschreibt nicht, was eine Epoche im Modus fixed mintet. Alle Beträge sind `uqor`. Das Testnet meldet eigene, abweichende Werte. Ab v3.2.4 gibt es einen dritten Modus, `target_apy`, mit einem Feld `target_apy_bps` (im Testnet seit dem 19. Oktober 2026; im Mainnet seit dem 23. Oktober 2026). Ein Netzwerk wechselt nur durch eine eigene Governance-Abstimmung in diesen Modus, sodass das Mainnet bei `fixed` bleibt, bis eine solche Abstimmung angenommen wird (geprüft am 27. Oktober 2026: weiterhin `fixed`). Das Testnet ist durch eigene Governance (Vorschlag 14, angenommen am 20. Oktober 2026) auf `target_apy` gewechselt und meldet zum Zeitpunkt der Erstellung `"emission_mode": "target_apy"`, wobei `epoch_info` zeigt, dass die kumulative Obergrenze bereits erreicht ist (`remaining_emission` `0`).

## Gas-Abstraction-Modul {#gas-abstraction-module}

| Methode | Endpunkt                                              | Beschreibung                                                                |
| ------- | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| GET     | `/qorechain/gasabstraction/v1/config`                 | Akzeptierte Gebührentoken, Aufschlag, Konvertierungslimit pro Block         |
| GET     | `/qorechain/gasabstraction/v1/conversion_rate?denom=` | Was eine Einheit eines Gebührentokens in `uqor` wert ist und ob es `usable` ist |
| GET     | `/qorechain/gasabstraction/v1/float`                  | Adresse, Guthaben und Nutzung des Konvertierungs-Floats in diesem Block     |

```bash
curl -s https://api.qore.host/qorechain/gasabstraction/v1/config
```

```json
{
  "config": {
    "enabled": true,
    "native_denom": "uqor",
    "accepted_tokens": [
      { "denom": "uqor", "conversion_rate": "1.0", "price_source": "", "rate_expiry_height": "0",
        "pool_id": "0", "min_liquidity": "", "max_deviation_bps": 0 }
    ],
    "premium_bps": 300,
    "max_tip_multiplier": 3,
    "float_min": "0",
    "block_conversion_cap": "0"
  }
}
```

Die Liste der akzeptierten Token enthält in beiden Netzwerken nur natives `uqor`, sodass Gebühren in `uqor` bezahlt werden und keine Konvertierung stattfindet. Die Governance fügt ein Token hinzu (mit einem Pool, einer Mindestliquidität und einer maximalen Abweichung zwischen zeitgewichtetem und Spot-Preis); eine in einem solchen Token bezahlte Gebühr wird über einen QOR-Float konvertiert und über einen AMM-Pool wieder aufgefüllt. `conversion_rate` ohne `?denom=` antwortet mit `500` (`denom is required`).

## RL-Consensus-Modul (v3.2.6) {#rlconsensus-module}

:::note Ab v3.2.6 in beiden Netzwerken bereitgestellt
Das REST-Gateway des Moduls `rlconsensus` kam mit **v3.2.6**, das das `qorechain-diana`-Testnet auf Höhe 8.970.638 am 27. Oktober 2026 und das Mainnet auf Höhe 4.020.000 am 4. November 2026 angewendet hat. Am 4. November 2026 antworteten alle sieben folgenden Routen sowohl auf dem öffentlichen Mainnet-Host als auch im Testnet mit HTTP `200`; keine benötigt einen Parameter. Vor v3.2.6 antworteten sie mit `501` (`{"code":12,"message":"Not Implemented"}`), und das Modul war nur über gRPC erreichbar.
:::

| Methode | Endpunkt                                  | Beschreibung                                                             |
| ------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| GET     | `/qorechain/rlconsensus/v1/agent`         | Agent-Status: `mode`, `current_epoch`, `total_steps`, `last_observation_at`, `last_action_at`, `circuit_breaker_active`, `blocks_since_revert` |
| GET     | `/qorechain/rlconsensus/v1/params`        | Modulparameter: Beobachtungsintervall, Agent-Modus, Schrittlimits, Fenster und Schwellenwert des Circuit Breakers, Belohnungsgewichte, Standard-Blockzeit, Gaspreis und Größe des Validator-Sets |
| GET     | `/qorechain/rlconsensus/v1/observation`   | Der neueste Beobachtungsvektor (`height` und 25 `values`)                |
| GET     | `/qorechain/rlconsensus/v1/reward`        | Das neueste Belohnungssignal und seine Komponenten                       |
| GET     | `/qorechain/rlconsensus/v1/policy`        | Das gespeicherte Policy-Netzwerk: `epoch`, `updated_at`, `weight_count` (die Gewichte selbst werden nicht zurückgegeben) |
| GET     | `/qorechain/rlconsensus/v1/applied_params` | Die Werte, die der Agent als angewendet führt: `block_time_ms`, `gas_limit`, `gas_price_floor`, `pool_weight_rpos`, `pool_weight_dpos` |
| GET     | `/qorechain/rlconsensus/v1/last_action`   | Die Aktion, die der Agent bei seinem letzten Schritt vorgeschlagen hat: `height`, `mode`, fünf `values` und `applied` |

```bash
curl -s https://api-testnet.qore.host/qorechain/rlconsensus/v1/agent
curl -s https://api-testnet.qore.host/qorechain/rlconsensus/v1/last_action
```

```json
{ "mode": "shadow", "current_epoch": "1", "total_steps": "209", "last_observation_at": "8975660",
  "last_action_at": "8975660", "circuit_breaker_active": false, "blocks_since_revert": "0" }
```

```json
{ "height": "8975660", "mode": "shadow", "values": ["-0.334711810000000000", "-0.500000000000000000",
  "0.000000000000000000", "0.000000000000000000", "0.000000000000000000"], "applied": false }
```

Die Beispiele oben stammen aus dem Testnet. Im Mainnet (geprüft am 4. November 2026) befindet sich der Agent im Modus `conservative` mit `current_epoch` `0`, `total_steps` `0` und `circuit_breaker_active` `false`; `policy` meldet `weight_count` `0` (keine Policy gespeichert), `last_action` ist leer (`height` `0`, `applied` `false`), und `applied_params` enthält die Standardwerte. Der Agent macht alle `observation_interval` Blöcke (10) einen Schritt. Im Modus `shadow` berechnet er eine Aktion und zeichnet sie auf, ohne etwas anzuwenden; daher ist `applied` `false`, und `applied_params` bleibt bei seinen Standardwerten (`block_time_ms` `5000`, `gas_price_floor` `100`, Pool-Gewichte `0.40` und `0.35`). Im Testnet wurde der Agent durch Governance-Vorschlag 29 (angenommen am 27. Oktober 2026) im Shadow-Modus mit einer gespeicherten Policy gestartet; `circuit_breaker_active` ist `false`. Das Mainnet hat den Agenten nicht gestartet. Beträge und Werte sind Strings. Die angewendeten Werte sind in diesem Release rein informativ: Der einzige Leser On-Chain ist der schreibgeschützte [`rlConsensusParams`-Precompile](/developer-guide/evm-precompiles#network-status). Die passenden gRPC-Methoden sind `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy`, `AppliedParams` und `LastAction` (Dienst `qorechain.rlconsensus.v1.Query`), und die CLI-Befehle stehen unter [Abfragebefehle](/cli-reference/query-commands#rlconsensus).

## Staking-Tiers-Modul (v3.2.4) {#stakingtier-module}

:::note Verfügbar ab v3.2.4
Das Staking-Tiers-Modul ist Teil von **v3.2.4**. Diese Routen werden vom Testnet seit dem 19. Oktober 2026 bereitgestellt und vom Mainnet seit dem 23. Oktober 2026 (Governance-Vorschlag 13, Höhe 3.742.566). Ein Node mit einem älteren Release antwortet darauf mit `501`.
:::

| Methode | Endpunkt                                  | Beschreibung                                                       |
| ------- | ----------------------------------------- | ------------------------------------------------------------------ |
| GET     | `/qorechain/stakingtier/v1/params`        | Lock-Stufen, der Mindestbetrag für einen Lock, die Strafe bei vorzeitiger Freigabe |
| GET     | `/qorechain/stakingtier/v1/locks/{holder}` | Die Locks eines Inhabers, was jeder aktuell ansammelt und was beansprucht werden kann |
| GET     | `/qorechain/stakingtier/v1/pool`          | Der Bonuspool: Guthaben, ausstehender Betrag, Überschuss und die letzte Abrechnung |
| GET    | `/qorechain/stakingtier/v1/apr`           | **v3.2.7** (Testnet seit dem 6. November 2026, Mainnet seit dem 12. November 2026; `501` auf einem älteren Node). Der Basis-Staking-Satz und die Tier-Boni |
| GET    | `/qorechain/stakingtier/v1/apr/{delegator}` | **v3.2.7** (gleiche Verfügbarkeit). Dasselbe für einen Delegator: Light-Node-Bonusstatus, Delegationen und der effektive Satz |

`params` listet die drei Lock-Laufzeiten (3, 6 und 12 Monate) mit ihren Parametern und `min_lock_amount` (`"10000000"` uqor, 10 QOR). Locks werden mit `tx stakingtier lock` erstellt (siehe [Transaktionsbefehle](/cli-reference/transaction-commands#stakingtier)).

**APR-Routen (v3.2.7).** Am 12. November 2026 antwortete die Mainnet-Route mit `200`, `source` `emission`, `bonus_enabled` `true` und `max_total_apy_bps` `2500`, und die Delegator-Route antwortete für eine ungültige Adresse mit `400`. `GET /qorechain/stakingtier/v1/apr` liefert `base` (`gross_base_apr_bps`, `source`, `computed_height`, `bonus_enabled`, `max_total_apy_bps`), `base_apr_bps`, eine Liste `tiers` (für 3, 6 und 12 Monate: `bonus_bps` 150, 300 und 500, mit den effektiven Werten) sowie die Light-Node- und Validator-Boni (`light_node_bonus_bps` 200, `validator_bonus_bps` 300). Am 7. November 2026 lag der Basissatz im Testnet bei `0` (`source` `fees_only`), sodass nur die Tier-Boni ungleich null waren; die Pool-Route meldet den Bonuspool. Für eine Adresse ohne Delegation antwortet die Delegator-Route mit `200`, einer leeren Liste `delegations` und einem effektiven Satz von `0`. Jede Zahl ist ein Basispunkt-Wert dessen, was die Chain bei ihrer letzten Abrechnung berechnet hat. Sie ist **nicht garantiert**, sie ändert sich mit Gebühren und Finanzierung, und sie ist kein Versprechen irgendeiner Rendite.

## Reputationsmodul {#reputation-module}

Die REST-Routen des Reputationsmoduls kamen mit Chain v3.2.6 und werden von beiden Netzwerken bereitgestellt (Testnet seit dem 27. Oktober 2026, Mainnet seit dem 4. November 2026). Geprüft auf dem öffentlichen Mainnet-Host am 4. November 2026: `/qorechain/reputation/v1/params`, `/validators` und `/validator/{address}` antworteten alle mit `200`. Vor v3.2.6 antwortete jede Route mit HTTP `501` (`{"code":12,"message":"Not Implemented"}`), und das Modul war nur über gRPC erreichbar.

| Methode | Endpunkt | Beschreibung |
| ------- | -------- | ------------ |
| GET     | `/qorechain/reputation/v1/params` | Die Score-Gewichte (`alpha`, `beta`, `gamma`, `delta`), `lambda` und `min_score` |
| GET     | `/qorechain/reputation/v1/validator/{address}` | Der Datensatz eines Validators. `{address}` ist eine Operator-Adresse `qorvaloper1...` oder eine Konsensadresse `qorvalcons1...`. Zu den Feldern gehören `composite_score`, `stake_score`, `performance_score`, `contribution_score`, `time_score`, `uptime_blocks`, `missed_blocks` und `last_updated_height`. `404` bedeutet, dass der Validator noch keinen Score hat; eine Zeichenfolge, die weder eine Operator- noch eine Konsensadresse ist, wird mit `400` beantwortet |
| GET     | `/qorechain/reputation/v1/validators` | Die Datensätze aller bewerteten Validatoren (`reputations`) |

Scores sind Dezimalzeichenfolgen zwischen 0 und 1. Der Light Node liest die Route pro Validator, um zu warnen, wenn ein delegierter Validator unter `min_reputation` liegt (siehe [Belohnungen und Überwachung](/light-node/rewards-and-monitoring#delegation-alerts)). Dieselben Routen funktionieren auf beiden öffentlichen Hosts.

## SVM-Cluster-Identität (v3.2.7) {#svm-cluster-info}

| Methode | Endpunkt                         | Beschreibung |
| ------ | -------------------------------- | ----------- |
| GET    | `/qorechain/svm/v1/cluster_info` | **v3.2.7** (Testnet seit dem 6. November 2026, Mainnet seit dem 12. November 2026; `501` auf einem älteren Node). Die Identität des SVM-Clusters: `chain_id`, `genesis_hash`, `caip2_chain_id` (die Wallet-Standard-Chain-ID), `derivation` und `execution_enabled` |

Am 7. November 2026 antwortete das Testnet mit `genesis_hash` `6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj`, `caip2_chain_id` `solana:6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zR` und `execution_enabled` `false`. Der Genesis-Hash wird aus der Chain-ID abgeleitet (SHA-256 aus einem festen Label und der Chain-ID, base58-kodiert) und ist daher stabil. Dieselben Werte stehen in `getGenesisHash` und `getVersion` des SVM-JSON-RPC (siehe [JSON-RPC — Solana-kompatibel](/api-reference/json-rpc-solana-compatible)). SVM bleibt aus: `execution_enabled` ist `false`. Am 12. November 2026 antwortete das Mainnet mit `200`, `chain_id` `qorechain-vladi`, `genesis_hash` `4LQ9znKk8J3C8YBz2unNdqRCC35ZXvSiFN9YGJNwu3er`, `caip2_chain_id` `solana:4LQ9znKk8J3C8YBz2unNdqRCC35ZXvSi` und `execution_enabled` `false`; die SVM-Lane ist im Mainnet weiterhin aus.

## Nur-gRPC-Module {#grpc-only-modules}

Im Mainnet (Node-Release v3.2.7 seit dem 12. November 2026; die Modulliste wurde am 4. November 2026 auf v3.2.6 geprüft, abgesehen von der Zeile `svm`) haben diese Module einen gRPC-`Query`-Dienst, aber **keine REST-Route**, abgesehen von den Ausnahmen in der Tabelle. Die Dienstnamen folgen dem Muster `qorechain.<module>.v1.Query`.

| Modul         | gRPC-Abfragemethoden (Mainnet, Chain-Version v3.2.7)       |
| ------------- | ---------------------------------------------------------- |
| `ai`          | `Config`, `Stats`                                          |
| `crossvm`     | `PendingMessages` (über REST seit v3.2.5: `Params` unter `/qorechain/crossvm/v1/params` und `Message` unter `/qorechain/crossvm/v1/message/{id}`) |
| `reputation`  | `Params` (seit v3.2.6 auch über REST, siehe [Reputationsmodul](#reputation-module)) |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy`, `AppliedParams`, `LastAction` (seit v3.2.6 auch über REST) |
| `svm`         | `Slot`, `Account`, `Program` (v3.2.7 ergänzt `ClusterInfo` in beiden Netzwerken, auch über REST, siehe [SVM-Cluster-Identität](#svm-cluster-info)) |
| `qca`         | `Config`                                                   |

Die `rlconsensus`-Abfragen werden ab v3.2.6 in beiden Netzwerken über REST bereitgestellt (mit zwei weiteren Methoden, `AppliedParams` und `LastAction`); siehe [RL-Consensus-Modul](#rlconsensus-module). Verwenden Sie `grpcurl` gegen Ihren eigenen Node oder die [CLI-Abfragebefehle](/cli-reference/query-commands). Die `rdk`-Abfragen sind ebenfalls über REST verfügbar (siehe [RDK-Modul](#rdk-module)); vor v3.2.2 waren sie ausschließlich über gRPC erreichbar.

Die Module xQORE, BTC-Restaking (Babylon) und FairBlock haben im aktuellen Release überhaupt keinen Abfragedienst, weder über REST noch über gRPC. Die Module Inflation und Gas Abstraction, die vor v3.2.2 keinen hatten, werden über REST bereitgestellt (siehe [Inflationsmodul](#inflation-module) und [Gas-Abstraction-Modul](#gas-abstraction-module)).

## Standardrouten {#standard-routes}

Die standardmäßigen REST-Routen von Cosmos SDK, IBC, EVM und QoreChain Native werden ebenfalls bereitgestellt. In beiden Netzwerken verifizierte Beispiele:

| Endpunkt                                                       | Beschreibung                                           |
| -------------------------------------------------------------- | ------------------------------------------------------ |
| `/cosmos/bank/v1beta1/supply`                                  | Gesamtangebot                                          |
| `/cosmos/bank/v1beta1/balances/{address}`                      | Kontostände                                            |
| `/cosmos/staking/v1beta1/validators`                           | Validatoren                                            |
| `/cosmos/staking/v1beta1/params`                               | Staking-Parameter                                      |
| `/cosmos/distribution/v1beta1/params`                          | Distributionsparameter                                 |
| `/cosmos/gov/v1/params/voting`                                 | Governance-Parameter                                   |
| `/cosmos/slashing/v1beta1/params`                              | Slashing-Parameter                                     |
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | Ausstehende / angewendete Upgrades (`applied_plan/v3.2.3` liefert im Mainnet `{"height":"3662051"}`) |
| `/cosmos/circuit/v1/disable_list`                              | Netzwerkweit abgeschaltete Nachrichtentypen            |
| `/cosmos/base/node/v1beta1/config`                             | Minimaler Gaspreis des Nodes (`0.1uqor` in beiden Netzwerken) |
| `/cosmos/base/tendermint/v1beta1/blocks/latest`                | Neuester Block                                         |
| `/cosmos/tx/v1beta1/txs`, `/txs/{hash}`, `/txs/block/{height}` | Transaktionssuche / -abruf / nach Block                |
| `/cosmos/evm/vm/v1/params`                                     | Parameter des EVM-Moduls                               |
| `/cosmos/evm/feemarket/v1/params`                              | Parameter des EVM-Gebührenmarkts                       |
| `/cosmwasm/wasm/v1/codes/params`                               | QoreChain Native-Upload-/Instanziierungsberechtigungen         |
| `/ibc/apps/transfer/v1/params`                                 | IBC-Transferparameter                                  |
| `/ibc/core/client/v2/counterparty_info/{client_id}`   | **v3.2.6**. Die für einen Client registrierte IBC-v2-Gegenseite (`404`, falls keine) |
| `/ibc/core/client/v2/config/{client_id}`              | **v3.2.6**. Die IBC-v2-Client-Konfiguration (`allowed_relayers`) |
| `/cosmos/evm/erc20/v1/token_pairs`, `/token_pairs/{token}` | ERC20-Token-Paare (Testnet: die drei Fest-Test-Token und ein IBC-Token; Mainnet: keine) |

Das QoreChain Native-Präfix lautet `/cosmwasm/wasm/v1/...`; `/cosmos/wasm/v1/...` wird nicht bereitgestellt.

### IBC-v2-Client-Routen (v3.2.6) {#ibc-v2-routes}

Der IBC-v2-Client-Abfragedienst wurde zuvor über gRPC bereitgestellt, aber seine REST-Routen fehlten; v3.2.6 bindet sie ein. Ein Relayer liest von hier die Gegenseite eines Clients. Beide Routen nehmen die Client-ID im Pfad (zum Beispiel `07-<type>-0`); eine leere ID antwortet mit `400`. Geprüft im Testnet am 27. Oktober 2026 und im Mainnet am 4. November 2026:

| Route | Testnet | Mainnet (v3.2.6) |
| --- | --- | --- |
| `/ibc/core/client/v2/counterparty_info/{client_id}` | `200` mit der Gegenseite oder `404` (`client 07-<type>-0 counterparty not found`) für einen Client, bei dem keine registriert ist; eine leere ID antwortet mit `400` | gleiche Formen: `404` (`client 07-tendermint-0 counterparty not found`) für einen Client ohne Gegenseite (das Mainnet hat noch keinen IBC-Client) |
| `/ibc/core/client/v2/config/{client_id}` | `200`, `{"config":{"allowed_relayers":[]}}` (eine leere Liste bedeutet: jeder Relayer) | `200`, `{"config":{"allowed_relayers":[]}}` |
| `/ibc/core/channel/v2/clients/{client_id}/next_sequence_send`, `/packet_commitments` und die übrigen IBC-v2-Channel-Routen | antworten (`404`, wenn für den Client nichts aufgezeichnet ist, `200` mit einer leeren Liste bei Commitments) | antworten, gleiche Formen (geprüft am 4. November 2026) |

Die IBC-v1-Routen (`/ibc/core/client/v1/...`, `/ibc/core/channel/v1/...`) antworten in beiden Netzwerken. Zum Zeitpunkt der Erstellung hält das Testnet einen IBC-Client und einen offenen Transfer-Channel (`channel-0`, mit einem IBC-denominierten Token), und das Mainnet hat keinen IBC-Client, keinen Channel und keinen IBC-denominierten Token. Das Rate-Limit-Modul antwortet unter `/Stride-Labs/ibc-rate-limiting/ratelimit/ratelimits` und die 08-wasm-Checksummenliste unter `/ibc/lightclients/wasm/v1/checksums`: In beiden Netzwerken liefert die erste eine leere Liste `rate_limits` (es ist kein Limit gesetzt) und die zweite eine leere Liste `checksums`. Das Mainnet antwortete am 4. November 2026 auf beide mit `200` (vor v3.2.6 antwortete es mit `501`). Die Packet-Forward-Abfrageroute `/ibc/apps/packetforward/v1/params` antwortete im Mainnet mit `501`; eine öffentliche Route dafür wurde nicht gefunden, daher sind seine Einstellungen dort nicht über REST lesbar.

### Testnet-Test-Token (Fest) {#fest-tokens}

:::note Nur Testnet, ohne Wert
Die drei folgenden Token existieren nur im `qorechain-diana`-Testnet. Es sind Test-Token für Builder: Sie haben keinen Wert, und das Mainnet hat überhaupt kein ERC20-Token-Paar (geprüft am 27. Oktober 2026: `token_pairs` ist leer, und das Bank-Angebot enthält nur `uqor`). Die Governance hat sie am 27. Oktober 2026 als ERC20-Token-Paare registriert (Vorschlag 26).
:::

Im Testnet existiert ein registriertes ERC20-Token auch als Bank-Coin, sodass es gehalten, gesendet und als zweite Denomination eines [AMM-Pools](#amm-module) verwendet werden kann. Die Bank-Denomination ist `erc20:` gefolgt von der Vertragsadresse in der **gemischten Groß-/Kleinschreibung der EIP-55-Prüfsumme**, und der Denom-String ist **groß-/kleinschreibungsabhängig**: Die rein kleingeschriebene Schreibweise ist ein anderer String und wird nicht gefunden.

| Token | Vertragsadresse | Bank-Denom | Dezimalstellen |
| --- | --- | --- | --- |
| fUSD (FestUSD) | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` | 6 |
| fETH (FestETH) | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` | 18 |
| fBTC (FestBTC) | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | 8 |

```bash
# the three tokens and their display names / decimals
curl -s https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata
# one denom: the case matters (this returns the metadata, the lowercase spelling returns 404)
curl -s "https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata/erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA"
# the ERC20 token pairs, and the supply of one denom
curl -s https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs
curl -s "https://api-testnet.qore.host/cosmos/bank/v1beta1/supply/by_denom?denom=erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA"
```

`denoms_metadata` listet jedes Token mit `symbol` `fUSD` / `fETH` / `fBTC`, `display` `FestUSD` / `FestETH` / `FestBTC` und den Dezimalstellen als Exponent der Anzeigeeinheit auf. Eine Kontostandsabfrage (`/cosmos/bank/v1beta1/balances/{address}`) zeigt den konvertierten Teil des Guthabens eines Inhabers unter der Denom `erc20:...`; Token, die noch auf der EVM-Seite gehalten werden, erscheinen im eigenen `balanceOf` des ERC20-Vertrags. Die Umwandlung zwischen beiden Formen erfolgt mit `MsgConvertERC20` (EVM zu Bank) und `MsgConvertCoin` (Bank zu EVM); der Absender von `MsgConvertERC20` muss als bech32-Adresse mit `qor1` geschrieben werden. Siehe [EVM-Entwicklung](/developer-guide/evm-development#fest-tokens).

## gRPC-Reflection

Ein selbst betriebener Node stellt gRPC auf Port `9090` bereit. Wo Server-Reflection aktiviert ist, können Tools wie `grpcurl` die verfügbaren Dienste entdecken:

```bash
grpcurl -plaintext localhost:9090 list
```

Um einen bestimmten Dienst abzufragen:

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

`qorechain.pqc.v1.Query` hat auf einem v3.2.3-Node drei Methoden, `Account`, `EVMWindow` und `EVMDelegationConsent`, und ab v3.2.4 (Testnet seit dem 19. Oktober 2026, Mainnet seit dem 23. Oktober 2026) eine vierte, `ProtocolFeatures`. Eine Methode `Params` kommt in v3.2.6 hinzu (Testnet seit dem 27. Oktober 2026, Mainnet seit dem 4. November 2026); ein Node älter als v3.2.6 hat keine Methode `Params`. Das Release v3.2.7 (beide Netzwerke) ergänzt die Multisig- und Textual-Dokument-Routen, die unter [PQC-Multisig und textuelles Signieren](#pqc-multisig-textual) beschrieben sind.

## Authentifizierung

Alle REST- und gRPC-Endpunkte sind standardmäßig unauthentifiziert. Für Produktivumgebungen sollte ein Reverse-Proxy (z. B. Nginx oder Caddy) vor dem Node platziert werden, um TLS-Terminierung und Zugriffskontrolle zu übernehmen.
