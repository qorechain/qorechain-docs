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
Abfragen laufen gegen den Node, auf den `--node` zeigt. Verwenden Sie einen **`qorechain-vladi`**-Mainnet-RPC-Endpunkt für Live-Daten (zum Beispiel `--node https://rpc.qore.host:443`) oder einen **`qorechain-diana`**-Testnet-Endpunkt (`--node https://rpc-testnet.qore.host:443`) zum Testen. Der Standardwert `tcp://localhost:26657` zielt auf einen Node, den Sie selbst betreiben. Das Mainnet führt die Node-Version v3.2.3 aus und das Testnet v3.2.4; das Testnet stellt einige zusätzliche Routen und Befehle bereit, die das Mainnet nicht hat (unten mit **nur Testnet** gekennzeichnet), sodass eine Abfrage, die dort funktioniert, auf dem Mainnet `Not Implemented` zurückgeben kann. Die Befehle auf dieser Seite wurden gegen die Release-Binary v3.2.3 geprüft und gegen `https://rpc.qore.host:443` ausgeführt.
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
- `account` meldet den registrierten Schlüssel. Neben dem Schlüssel, `key_type` und `algorithm_name` enthält der Datensatz `classical_key_source` (`stored`, `auth_account` oder `none`: woher der klassische öffentliche Schlüssel stammt). Im Testnet (v3.2.4, **nur Testnet**) enthält er außerdem `possession_proven`, das `true` ist, wenn der Schlüssel mit einem verifizierten Besitznachweis registriert wurde.
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

Im Mainnet melden diese `emission_mode: "fixed"`, eine feste Emission von 86.000 QOR pro Epoche von 43.200 Blöcken und eine kumulative Obergrenze von 590.000.000 QOR (Governance-Vorschlag 10, angenommen am 19. Oktober 2026; die erste Epoche mit dem neuen Betrag beginnt bei Block 3.672.000). Beträge sind in `uqor` angegeben. Das Testnet meldet weiterhin eigene, abweichende Werte; das v3.2.4-Release des Testnets fügt einen weiteren Emissionsmodus hinzu, den das Mainnet nicht hat (**nur Testnet**).

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

`reward-pool` zeigt, wie sich das Reward-Guthaben des Moduls in `reserved`, `outstanding`, `payable` und `distributable` aufteilt, sowie die Grenzen pro Node: `max_reward_per_block_per_node` und, seit v3.2.3, `max_reward_per_month_per_node` (2.000 QOR, anteilig nach Blockzeit und Uptime). Im Testnet (v3.2.4, **nur Testnet**) meldet es außerdem `monthly_cap_active`, `last_distribution_time` und `last_distribution_height`.

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
```

---

## abstractaccount

Das Abstract-Account-Modul ist derzeit auf beiden Netzwerken abgeschaltet (`config.enabled` ist `false`), daher liefern diese Abfragen keine Konten.

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

Zum Zeitpunkt der Erstellung existiert auf keinem der beiden Netzwerke ein Pool.

---

## stakingtier (nur Testnet)

```bash
qorechaind query stakingtier params
qorechaind query stakingtier locks <holder_address>
qorechaind query stakingtier pool
```

Das Staking-Tiers-Modul ist Teil des Releases **v3.2.4**, das nur im Testnet läuft; das Mainnet hat das Modul noch nicht (der Governance-Vorschlag 13 würde v3.2.4 bei Höhe 3,742,566 anwenden). REST: `/qorechain/stakingtier/v1/params`, `/locks/{holder}`, `/pool`. Siehe [Transaktionsbefehle](/cli-reference/transaction-commands#stakingtier).

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

`query upgrade applied <name>` ist der Weg, um abzulesen, wann ein Upgrade wirksam wurde: Im Mainnet wurde `v3.2.2` bei Höhe 3.556.788 und `v3.2.3` bei Höhe 3.662.051 angewendet; im Testnet `v3.2.2` bei 6.905.034, `v3.2.3` bei 8.003.746 und `v3.2.4` bei 8.337.253 (`0` bedeutet nicht angewendet). Die Circuit-Breaker-Liste des Mainnets (`disabled-list`) enthält derzeit die Nachrichten zur Erstellung von Vesting-Konten, CosmWasm-Store und -Instantiate, AMM-Pool-Pause und -Fortsetzung, Cross-VM-Aufruf, Multilayer-Layer-Statusaktualisierung, PQC-Algorithmus-Deprecate und -Disable sowie die PRISM-Konsens-Governance-Nachrichten; die des Testnets enthält nur die drei CosmWasm-Nachrichten.

---

## evm, erc20, wasm

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

---

## Module ohne CLI

`xqore`, `babylon` und `fairblock` haben keine Transaktions- oder Query-Befehle. Sie sind derzeit weder über die CLI noch über eine öffentliche API nutzbar.
