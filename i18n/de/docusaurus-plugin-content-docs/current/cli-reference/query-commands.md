---
slug: /cli-reference/query-commands
title: Query-Befehle
sidebar_label: Query-Befehle
sidebar_position: 3
---

# Query-Befehle

Alle Query-Befehle folgen dem Muster:

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
Abfragen laufen gegen den Node, auf den `--node` zeigt. Verwenden Sie einen **`qorechain-vladi`**-Mainnet-RPC-Endpunkt für Live-Daten (zum Beispiel `--node https://rpc.qore.host:443`) oder einen **`qorechain-diana`**-Testnet-Endpunkt (`--node https://rpc-testnet.qore.host:443`) zum Testen. Der Standardwert `tcp://localhost:26657` zielt auf einen Node, den Sie selbst betreiben. Das Mainnet führt die Node-Version v3.2.5 seit dem 29. Oktober 2026 aus (angewendet bei Höhe 3.906.833 durch Governance-Vorschlag 14; v3.2.4 wurde bei Höhe 3.742.566 am 23. Oktober 2026 angewendet); das Testnet läuft mit v3.2.6 (v3.2.4 seit dem 19. Oktober 2026, v3.2.5 seit dem 26. Oktober, v3.2.6 seit dem 27. Oktober). Das Release v3.2.4 fügt einige Routen und Befehle hinzu (unten mit **v3.2.4** gekennzeichnet): Sie funktionieren auf beiden Netzwerken, und ein Node mit einem älteren Release beantwortet sie mit `Not Implemented`. Das Release v3.2.6 fügt zwei Befehle hinzu (mit **v3.2.6** gekennzeichnet, nur im Testnet, bis das Mainnet es anwendet). Die Befehle auf dieser Seite wurden gegen die Release-Binary v3.2.3 geprüft und gegen `https://rpc.qore.host:443` ausgeführt; die v3.2.4-Routen wurden am 23. Oktober 2026 über REST geprüft und die v3.2.6-Befehle gegen den Quellcode von v3.2.6.
:::

Gemeinsame Flags gelten für jeden `query`-Unterbefehl:

| Flag       | Typ    | Beschreibung                                        |
| ---------- | ------ | --------------------------------------------------- |
| `--node`   | string | RPC-Endpunkt (Standard: `tcp://localhost:26657`)     |
| `--output` | string | Ausgabeformat: `json` oder `text`                    |
| `--height` | int    | Zustand bei einer bestimmten Blockhöhe abfragen      |

Nicht jedes Modul hat eine CLI-Abfrage. Wo ein Befehl fehlt, verwenden Sie den REST-Endpunkt (`https://api.qore.host/...`); siehe [REST-API](/api-reference/rest-grpc-endpoints).

---

## bank

```bash
qorechaind query bank balances <address>
qorechaind query bank total-supply
qorechaind query bank total-supply-of uqor
qorechaind query bank spendable-balances <address>
```

(Es gibt kein `query bank total`.)

---

## staking

```bash
qorechaind query staking validator <validator_address>
qorechaind query staking validators
qorechaind query staking validators --status BOND_STATUS_BONDED
qorechaind query staking delegation <delegator_address> <validator_address>
qorechaind query staking delegations <delegator_address>
qorechaind query staking delegations-to <validator_address>
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
qorechaind query staking unbonding-delegations <delegator_address>
qorechaind query staking redelegation <delegator_address> <src_validator> <dst_validator>
qorechaind query staking params
qorechaind query staking pool
```

`--status` erwartet den vollständigen Enum-Namen: `BOND_STATUS_BONDED`, `BOND_STATUS_UNBONDING` oder `BOND_STATUS_UNBONDED` (`--status bonded` wird abgelehnt).

---

## distribution

```bash
qorechaind query distribution rewards <delegator_address>
qorechaind query distribution commission <validator_address>
qorechaind query distribution validator-outstanding-rewards <validator_address>
qorechaind query distribution community-pool
qorechaind query distribution params
```

---

## gov

```bash
qorechaind query gov proposals
qorechaind query gov proposals --proposal-status voting-period
qorechaind query gov proposal <proposal_id>
qorechaind query gov votes <proposal_id>
qorechaind query gov vote <proposal_id> <voter_address>
qorechaind query gov tally <proposal_id>
qorechaind query gov params
```

`--proposal-status` akzeptiert `deposit-period`, `voting-period`, `passed`, `rejected` oder `failed`. Weitere Filter: `--voter`, `--depositor`.

---

## tx

```bash
qorechaind query tx <txhash>
qorechaind query txs --query "message.sender='<address>'"
```

---

## pqc

```bash
qorechaind query pqc account <address>
qorechaind query pqc algorithms
qorechaind query pqc algorithm dilithium5
qorechaind query pqc stats
qorechaind query pqc params
qorechaind query pqc migration <algorithm_id>
qorechaind query pqc hybrid-mode
qorechaind query pqc evm-window <address>
qorechaind query pqc evm-delegation-consent <address>
```

- `algorithm` erwartet einen Algorithmusnamen (`dilithium5`, `mlkem1024`) oder eine numerische ID.
- `migration` erwartet eine **Algorithmus-ID** (zum Beispiel `1`), keine Adresse, und meldet `No active migration`, wenn keine läuft.
- `account` meldet den registrierten Schlüssel. Neben dem Schlüssel, `key_type` und `algorithm_name` enthält der Datensatz `classical_key_source` (`stored`, `auth_account` oder `none`: woher der klassische öffentliche Schlüssel stammt). Ab v3.2.4 (Mainnet seit dem 23. Oktober 2026, Testnet seit dem 19. Oktober 2026) enthält er außerdem `possession_proven`, das `true` ist, wenn der Schlüssel mit einem verifizierten Besitznachweis registriert wurde.
- `evm-window` zeigt, ob die Adresse ein offenes Autorisierungsfenster der EVM-Lane hat und wie viele Blöcke, Transaktionen und welcher Wert verbleiben (`found`, `live`, `remaining_blocks`, `remaining_txs`, `remaining_value`) sowie den Umfang des Fensters (`native_only`, `allowed_targets`; seit Mainnet v3.2.3). REST: `GET /qorechain/pqc/v1/evm_window/{address}`.
- `evm-delegation-consent` zeigt die EIP-7702-Delegationszustimmung der Adresse (`found`, `live`, `delegate`, `granted_height`, `expiry_height`), ihre aktuelle Delegation und ihre EVM-Nonce. REST: `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.
- `params` und `hybrid-mode` melden `hybrid_signature_mode` (`2` = auf beiden Netzwerken erforderlich) und `allow_classical_fallback` (`false`).

---

## burn

Das Burn-Modul hat keine CLI-Abfrage. Verwenden Sie REST:

```bash
curl -s https://api.qore.host/qorechain/burn/v1/params
curl -s https://api.qore.host/qorechain/burn/v1/stats
curl -s https://api.qore.host/qorechain/burn/v1/records
curl -s https://api.qore.host/qorechain/burn/v1/milestone
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

`stranded_rewards` meldet den Staker-Anteil, der in das Distribution-Modul eingezahlt wurde, ohne einen Anspruch zu decken (`reserved`, `released`, `snapshot_height`). Er kann nur durch eine Governance-Abstimmung freigegeben werden. Die Reserve wurde erstmals beim Upgrade auf v3.2.0 erfasst und bei der Upgrade-Höhe von v3.2.3 neu berechnet; lesen Sie daher die Live-Werte, statt sich auf eine anderswo genannte Zahl zu verlassen.

`stats` schlüsselt den kumulierten Burn nach Quelle auf, einschließlich `failed_tx`, das seit dem Upgrade auf v3.2.2 ungleich null ist.

---

## mint und inflation

`qorechaind query mint params|inflation|annual-provisions` liest das Standard-Mint-Modul, dessen Rate auf beiden Netzwerken `0` beträgt; es meldet **nicht** den Emissionsplan des Protokolls. Es gibt keinen CLI-Befehl `query inflation`. Die eigenen Emissionseinstellungen und der Fortschritt des Protokolls werden seit v3.2.2 über REST bereitgestellt:

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params       # emission_mode, fixed_epoch_emission, max_total_emission, epoch_length
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info   # current_epoch, next_epoch_height, total_minted, remaining_emission
```

Im Mainnet melden diese `emission_mode: "fixed"`, eine feste Emission von 86.000 QOR pro Epoche von 43.200 Blöcken und eine kumulative Obergrenze von 590.000.000 QOR (Governance-Vorschlag 10, angenommen am 19. Oktober 2026; die erste Epoche mit dem neuen Betrag beginnt bei Block 3.672.000). Beträge sind in `uqor` angegeben. Das Testnet meldet eigene, abweichende Werte: Es ist über seine eigene Governance (Vorschlag 14, angenommen am 20. Oktober 2026) in den weiteren Emissionsmodus gewechselt, den v3.2.4 hinzugefügt hat (`target_apy`). Ein Netzwerk wechselt den Modus nur durch seine eigene Governance-Abstimmung, sodass das Mainnet bei `fixed` bleibt, bis eine solche Abstimmung angenommen wird (geprüft am 27. Oktober 2026).

---

## ai

```bash
qorechaind query ai config
qorechaind query ai stats
```

---

## reputation und qca

```bash
qorechaind query reputation params
qorechaind query qca config
```

Es gibt keine Abfragen für die Reputation einzelner Validatoren oder für die Pool-Klassifizierung.

`query reputation params` (REST `GET /qorechain/reputation/v1/params`) antwortet nur im Testnet. Im Mainnet antwortet die Route mit `Not Implemented` (geprüft am 30. Oktober 2026, nach v3.2.5), sie startet im Mainnet also erst mit einem späteren Chain-Release.

---

## lightnode

```bash
qorechaind query lightnode params
qorechaind query lightnode stats
qorechaind query lightnode light-nodes
qorechaind query lightnode light-node <operator_address>
qorechaind query lightnode rewards <operator_address>
qorechaind query lightnode reward-pool
```

`reward-pool` zeigt, wie sich das Reward-Guthaben des Moduls in `reserved`, `outstanding`, `payable` und `distributable` aufteilt, sowie die Grenzen pro Node: `max_reward_per_block_per_node` und, seit v3.2.3, `max_reward_per_month_per_node` (2.000 QOR, anteilig nach Blockzeit und Uptime). Ab v3.2.4 (Mainnet seit dem 23. Oktober 2026, Testnet seit dem 19. Oktober 2026) meldet es außerdem `monthly_cap_active`, `last_distribution_time` und `last_distribution_height`.

---

## license

```bash
qorechaind query license check <grantee_address> <feature_id>
qorechaind query license holders <feature_id>
qorechaind query license list <grantee_address>
```

`check` liefert einen `NotFound`-Fehler, wenn der Begünstigte keine Lizenz für das Feature besitzt.

---

## bridge

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain <chain_id>
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation <operation_id>
```

---

## crossvm

```bash
qorechaind query crossvm message <message_id>
qorechaind query crossvm pending
qorechaind query crossvm params
```

---

## svm

```bash
qorechaind query svm account <base58_address>
qorechaind query svm program <base58_address>
qorechaind query svm params
qorechaind query svm slot
```

---

## multilayer

```bash
qorechaind query multilayer layer <layer_id>
qorechaind query multilayer layers
qorechaind query multilayer routing-stats
qorechaind query multilayer params
```

---

## rdk

```bash
qorechaind query rdk config
qorechaind query rdk rollup <rollup_id>
qorechaind query rdk list-rollups
qorechaind query rdk batch <rollup_id>            # latest batch
qorechaind query rdk batch <rollup_id> --index 42 # a specific batch
```

```bash
qorechaind query rdk batches <rollup_id> [--start 0] [--limit 100]   # batches in index order
qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>
```

`config` zeigt die Modulparameter (Mindest-Stake, Burn-Rate bei der Erstellung, Challenge-Fenster, DA-Limits). `anchor-sign-bytes` gibt in Hex die v2-Anchor-Sign-Bytes aus, die ein Rollup-Ersteller für `tx rdk submit-batch --anchor-signature` signiert. Dieselben Abfragen werden seit v3.2.2 auch über REST unter `/qorechain/rdk/v1/...` bereitgestellt (siehe [REST- / gRPC-Endpunkte](/api-reference/rest-grpc-endpoints#rdk-module)). `suggest-profile <use_case>` fragt die Chain nicht ab; es gibt nur einen Hinweis auf eine JSON-RPC-Methode aus, die die öffentlichen Endpunkte nicht bereitstellen. Wählen Sie ein Profil daher aus den [Preset-Profilen](/rollups/preset-profiles).

---

## rlconsensus

```bash
qorechaind query rlconsensus agent-status
qorechaind query rlconsensus observation
qorechaind query rlconsensus reward
qorechaind query rlconsensus params
qorechaind query rlconsensus policy
qorechaind query rlconsensus applied-params   # v3.2.6 (testnet)
qorechaind query rlconsensus last-action      # v3.2.6 (testnet)
```

`agent-status` meldet den Modus, die Epoche und die Schrittanzahl des Agenten; `policy` meldet die Epoche und die Gewichtsanzahl der gespeicherten Policy (nicht die Gewichte). **v3.2.6 (nur Testnet, bis das Mainnet dieses Release anwendet):** `applied-params` gibt die Werte aus, die der Agent als angewendet hält (Blockzeit, Gaspreis-Untergrenze, Pool-Gewichte), und `last-action` die Aktion, die er bei seinem letzten Schritt vorgeschlagen hat; sie wird in jedem Modus festgehalten, auch im Schattenmodus, in dem nichts angewendet wird. Alle diese werden auf dem Testnet auch über REST bereitgestellt (siehe [RL-Consensus-Modul](/api-reference/rest-grpc-endpoints#rlconsensus-module)); gegen einen Mainnet-Node antworten die beiden neuen Befehle mit `Not Implemented`, bis das Mainnet dieses Release anwendet.

---

## abstractaccount

Das Abstract-Account-Modul ist im Mainnet abgeschaltet (`config.enabled` ist `false`, daher liefern diese Abfragen dort keine Konten) und im Testnet per Governance eingeschaltet (`config.enabled` ist `true`; geprüft am 27. Oktober 2026).

```bash
qorechaind query abstractaccount config
qorechaind query abstractaccount accounts
qorechaind query abstractaccount account <address>
qorechaind query abstractaccount permission-schema
```

`auth-keygen`, `auth-sign-cosmos <chain_id> <account> <to> <amount> <nonce>` und `auth-sign-evm <chain_id> <account> <to_0x> <value_wei> <data_hex> <nonce>` erstellen Authenticator-Signaturen offline. Der Authenticator-Seed ist niemals ein Argument: Er wird aus `--seed-file <file>` (oder `-` für stdin), aus der Umgebungsvariable `QORE_AUTH_SEED` oder über eine Eingabeaufforderung ohne Echo gelesen, und `auth-keygen` schreibt ihn in eine neue `0600`-Datei (`--out`), statt ihn auszugeben.

---

## gasabstraction

Gas-Abstraction-Abfragen werden seit v3.2.2 auf beiden Netzwerken bereitgestellt:

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate <denom>   # what one unit of a fee token is worth in uqor, and whether it can pay fees
qorechaind query gasabstraction float                     # the conversion float's balances and this block's usage
```

Die Liste der akzeptierten Token enthält auf beiden Netzwerken nur natives `uqor`, daher werden Gebühren in `uqor` bezahlt und es findet keine Umrechnung statt; die Governance entscheidet, welche weiteren Token akzeptiert werden. REST: `/qorechain/gasabstraction/v1/config`, `/conversion_rate?denom=`, `/float`. Siehe [Gas Abstraction](/user-guide/gas-abstraction).

---

## amm

```bash
qorechaind query amm params
qorechaind query amm pools
qorechaind query amm pool <pool_id>
qorechaind query amm pool-by-denoms <denom_a> <denom_b>
qorechaind query amm lp-balance <pool_id> <address>
qorechaind query amm quote-exact-in <pool_id> <denom_in> <amount_in>
qorechaind query amm quote-exact-out <pool_id> <denom_out> <amount_out>
```

Zum Zeitpunkt der Erstellung existiert auf keinem der beiden Netzwerke ein Pool. Im Testnet sind die drei Fest-Testtoken als zweites Denom eines Pools verfügbar (siehe [Testnet-Testtoken](/api-reference/rest-grpc-endpoints#fest-tokens)).

---

## stakingtier (v3.2.4)

```bash
qorechaind query stakingtier params
qorechaind query stakingtier locks <holder_address>
qorechaind query stakingtier pool
```

Das Staking-Tiers-Modul ist Teil des Releases **v3.2.4**: Es läuft seit dem 19. Oktober 2026 im Testnet und seit dem 23. Oktober 2026 im Mainnet (Höhe 3.742.566, Governance-Vorschlag 13). Ein Node mit einem älteren Release beantwortet diese Abfragen mit `Not Implemented`. REST: `/qorechain/stakingtier/v1/params`, `/locks/{holder}`, `/pool`. Siehe [Transaktionsbefehle](/cli-reference/transaction-commands#stakingtier).

---

## circuit, feemarket, upgrade

```bash
qorechaind query circuit disabled-list        # message types switched off network-wide
qorechaind query feemarket params
qorechaind query feemarket base-fee
qorechaind query upgrade plan
qorechaind query upgrade applied <upgrade_name>
qorechaind query upgrade module-versions
```

`query upgrade applied <name>` ist der Weg, um abzulesen, wann ein Upgrade wirksam wurde: Im Mainnet wurde `v3.2.2` bei Höhe 3.556.788, `v3.2.3` bei Höhe 3.662.051, `v3.2.4` bei Höhe 3.742.566 und `v3.2.5` bei Höhe 3.906.833 angewendet; im Testnet `v3.2.2` bei 6.905.034, `v3.2.3` bei 8.003.746, `v3.2.4` bei 8.337.253, `v3.2.5` bei 8.890.800 und `v3.2.6` bei 8.970.638 (`0` bedeutet nicht angewendet; im Mainnet ist `v3.2.6` zum Zeitpunkt der Erstellung `0`). Die Circuit-Breaker-Liste des Mainnets (`disabled-list`) enthält derzeit die Nachrichten zur Erstellung von Vesting-Konten, QoreChain Native-Store und -Instantiate, AMM-Pool-Pause und -Fortsetzung, Cross-VM-Aufruf, Multilayer-Layer-Statusaktualisierung, PQC-Algorithmus-Deprecate und -Disable sowie die PRISM-Konsens-Governance-Nachrichten; die des Testnets enthält nur die QoreChain-Native-Nachricht `MsgStoreCode` (geprüft am 27. Oktober 2026; die Instanziierung wurde von der Testnet-Governance freigegeben).

---

## evm, erc20, wasm

Die `wasm`-Befehle lesen QoreChain Native, den QoreChain-eigenen Namen für die CosmWasm-Smart-Contract-Laufzeit; die Befehls- und Modulnamen behalten die Schreibweise `wasm`.

```bash
qorechaind query evm params
qorechaind query evm balance-bank <0x_address> uqor
qorechaind query erc20 token-pairs
qorechaind query wasm params
qorechaind query wasm list-code
qorechaind query wasm list-contract-by-code <code_id>
qorechaind query wasm contract <contract_address>
qorechaind query wasm contract-state smart <contract_address> '<json_query>'
```

`query erc20 token-pairs` ist im Mainnet leer; im Testnet listet es die drei Fest-Testtoken (fUSD, fETH, fBTC) und ein IBC-Token. Ihre Bank-Denoms sind `erc20:` plus die EIP-55-Vertragsadresse und beachten die Groß-/Kleinschreibung; siehe [Testnet-Fest-Testtoken](/developer-guide/evm-development#fest-tokens). Im Testnet zeigt `query wasm params` für `code_upload_access` den Wert `Nobody` und für `instantiate_default_permission` den Wert `Everybody`; im Mainnet sind beide `Nobody` (siehe [QoreChain-Native-Entwicklung](/developer-guide/cosmwasm-development)).

---

## Module ohne CLI

`xqore`, `babylon` und `fairblock` haben keine Transaktions- oder Query-Befehle. Sie sind derzeit weder über die CLI noch über eine öffentliche API nutzbar.
