---
slug: /cli-reference/transaction-commands
title: Comenzi de tranzacție
sidebar_label: Comenzi de tranzacție
sidebar_position: 2
---

# Comenzi de tranzacție

Toate comenzile de tranzacție urmează modelul:

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
Setați `--chain-id qorechain-vladi` pentru a difuza tranzacția pe mainnet-ul live sau `--chain-id qorechain-diana` pentru testnet. Ambele rețele rulează linia v3.2 (versiunea de nod pentru mainnet **v3.2.1**, testnet **v3.2.2**; verificați `latest.json` de pe [download.qore.host](https://download.qore.host) pentru versiunea curentă). Dacă `--chain-id` este omis, clientul folosește `chain-id`-ul din configurația locală a clientului.
:::

Flag-urile comune se aplică fiecărei subcomenzi `tx`:

| Flag                | Tip    | Descriere                                                      |
| ------------------- | ------ | -------------------------------------------------------------- |
| `--from`            | string | Numele sau adresa cheii semnatare                              |
| `--chain-id`        | string | Identificatorul chain-ului (implicit: din configurația clientului) |
| `--fees`            | string | Taxa de tranzacție, ex. `40000uqor`                            |
| `--gas-prices`      | string | Prețul gas-ului în loc de `--fees`, ex. `0.1uqor`              |
| `--gas`             | string | Limita de gas sau `auto` pentru estimare (implicit `200000`)   |
| `--gas-adjustment`  | float  | Multiplicator aplicat estimării `auto` (implicit `1`)          |
| `--keyring-backend` | string | `os`, `file`, `kwallet`, `pass`, `test` sau `memory`           |
| `--node`            | string | Endpoint-ul RPC (implicit `tcp://localhost:26657`)             |
| `--broadcast-mode`  | string | `sync` sau `async`                                             |
| `--generate-only`   | bool   | Afișează tranzacția nesemnată în loc să o semneze              |
| `-y`                | bool   | Sare peste promptul de confirmare                              |

---

## Taxe și gas {#fees-and-gas}

Pragul minim al taxei de rețea este de **0,1 uqor per unitate de gas** (`query feemarket params` afișează `min_gas_price`; taxa de bază live poate crește peste prag sub încărcare, vezi `query feemarket base-fee`). O tranzacție este respinsă dacă nu este îndeplinită condiția `fee >= gas limit x gas price`, deci `--fees 500uqor` funcționează doar pentru o limită de gas de 5.000 sau mai mică și eșuează pentru orice tranzacție reală.

| Tranzacție                                    | `--gas` sugerat   | `--fees` corespunzător |
| --------------------------------------------- | ----------------- | ---------------------- |
| Transfer, delegare, vot, claim cu semnătură hibridă | `400000`    | `40000uqor`            |
| Înregistrarea cheii PQC                       | `600000`          | `60000uqor`            |
| `lightnode register`                          | `300000`          | `30000uqor`            |

O semnătură hibridă adaugă aproximativ 4,7 KB unei tranzacții, taxați la 10 gas per octet, așa că valoarea implicită `--gas 200000` nu este întotdeauna suficientă: transferurile cu semnătură hibridă pe mainnet au consumat între aproximativ 160.000 și 240.000 de gas. Setați întotdeauna `--gas` explicit, împreună cu `--fees` (sau `--gas-prices`).

---

## Semnarea hibridă este obligatorie pe calea Cosmos {#hybrid-signing}

`hybrid_signature_mode` este `required` pe ambele rețele (`qorechaind query pqc hybrid-mode`). Fiecare tranzacție de pe calea Cosmos trebuie să poarte o semnătură ML-DSA-87 (Dilithium-5) alături de semnătura secp256k1; un simplu `tx bank send ... -y` este respins. Singurele excepții sunt înregistrarea și migrarea cheii PQC (astfel încât un cont nou să își poată înregistra prima cheie) și `tx slashing unjail` pentru un cont care nu are nicio cheie PQC înregistrată.

Fiecare comandă de pe această pagină, cu excepția `pqc register-key`, `pqc register-key-v2` și `pqc migrate-key`, se rulează așadar în doi pași: construiți tranzacția cu `--generate-only`, apoi o semnați și o difuzați cu `tx pqc cosign`:

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

Numele cheii `mypqc` este o cheie creată cu `tx pqc gen-key` și înregistrată pe cont (vezi [pqc](#pqc)). Folosiți binarul oficial de versiune de pe [download.qore.host](https://download.qore.host) pentru aceasta: un binar compilat din arborele sursă public nu poate crea sau aplica o semnătură Dilithium (`gen-key` și `cosign` raportează că au nevoie de build-ul complet). [QoreX](/qorex/overview) și SDK-urile efectuează aceeași semnare în locul dvs.

---

## bank

### send

Transferă tokeni de la un cont la altul.

```bash
qorechaind tx bank send <from_key_or_address> <to_address> <amount> [flags]
```

Exemplu: `qorechaind tx bank send mykey qor1recipient... 1000000uqor --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > tx.json`, apoi `tx pqc cosign` așa cum este arătat mai sus. 1 QOR = 1.000.000 uqor.

---

## staking

### create-validator

Creează un validator dintr-un fișier JSON (forma bazată pe flag-uri a fost eliminată). Mainnet necesită și o licență `validator_operator` activă și o cheie PQC înregistrată; vezi [Rularea unui validator](/developer-guide/running-a-validator).

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json
```

`validator.json`:

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

### edit-validator

Editează descrierea sau comisionul unui validator existent.

```bash
qorechaind tx staking edit-validator --new-moniker "new-name" --website "https://example.org" --from mykey [flags]
```

Flag-uri: `--new-moniker`, `--website`, `--identity`, `--security-contact`, `--details`, `--commission-rate`, `--min-self-delegation`. Câmpurile omise rămân neschimbate.

### delegate

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

### cancel-unbond

Anulează o intrare de unbonding aflată în desfășurare.

```bash
qorechaind tx staking cancel-unbond <validator_address> <amount> <creation_height> [flags]
```

---

## slashing

### unjail

Readuce un validator aflat în jail în setul activ după perioada de jail.

```bash
qorechaind tx slashing unjail --from mykey [flags]
```

---

## distribution

### withdraw-all-rewards

Retrage toate recompensele de staking în așteptare.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Retrage recompensele de la un singur validator.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Flag           | Tip  | Descriere                                                |
| -------------- | ---- | -------------------------------------------------------- |
| `--commission` | bool | Retrage și comisionul (adrese de operator de validator)  |

---

## gov

### submit-proposal

Trimite o propunere de guvernanță dintr-un fișier JSON cu `messages`, `metadata`, `deposit`, `title`, `summary` și, opțional, `expedited`. Generați un schelet cu `qorechaind tx gov draft-proposal`.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

### vote

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Opțiuni de vot: `yes`, `no`, `abstain`, `no_with_veto`. Folosiți `tx gov weighted-vote <proposal_id> yes=0.6,no=0.4` pentru a împărți un vot.

### deposit

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc {#pqc}

### gen-key

Generează o cheie Dilithium-5 (ML-DSA-87) și o stochează în `<home>/pqc/<name>.dilithium` (mod `0600`, **necriptată**). Afișează cheia publică în hex.

```bash
qorechaind tx pqc gen-key <name>
```

### register-key

Înregistrează o cheie publică PQC pentru contul dvs. (comandă legacy: algoritmul este Dilithium-5). Semnată doar cu cheia clasică; aceasta este excepția de bootstrap.

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`key_type` este `hybrid` (recomandat), `pqc_only` sau `classical_only`. Cheia publică de 2.592 de octeți face înregistrarea mai costisitoare decât un transfer, motiv pentru care are nevoie de o limită de gas mai mare.

### register-key-v2

Înregistrează o cheie cu selecție explicită a algoritmului.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`algorithm` este `dilithium5` (sau `1`) ori `mlkem1024` (sau `2`).

### cosign

Semnează o tranzacție nesemnată cu cheia PQC și cu cheia clasică a contului, apoi o difuzează.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> --from <key> --pqc-key <name> --chain-id <id>
```

| Flag           | Descriere                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `--pqc-key`    | Numele cheii create cu `gen-key` sau `recover-key`                                                |
| `--sign-bytes` | `auto` (implicit: întreabă chain-ul ce formă de sign-bytes se aplică), `v1` sau `v2`              |
| `--generate-only` / `--offline` | Afișează tranzacția semnată ca JSON în loc să o difuzeze; o trimiteți mai târziu cu `tx broadcast`; `--offline` necesită și `--account-number`, `--sequence` și `--sign-bytes v1\|v2` |
| `--dry-run`    | Simulează și afișează estimarea de gas                                                            |

Ambele rețele au aplicat upgrade-ul care a mutat verificarea hibridă pe sign-bytes v2; forma v1 este refuzată.

### migrate-key

Migrează cheia PQC a contului dvs. de la un algoritm la altul. Trebuie să fie activă o migrare pentru algoritmul dvs. curent (pornită prin guvernanță); ambele chei semnează octeții migrării.

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> [flags]
```

### recover-key

Reconstruiește cheia ML-DSA-87 a contului din mnemonicul BIP-39 (citit de la stdin) și o stochează local. Folosește `SHAKE-256("qorechain:pqc:v1|address|mnemonic")`.

```bash
echo "<mnemonic>" | qorechaind tx pqc recover-key <name> <address> [flags]
```

| Flag           | Tip    | Descriere                                                                  |
| -------------- | ------ | -------------------------------------------------------------------------- |
| `--derivation` | string | `adapter` (canonic, implicit) sau `bridge` (legacy `SHAKE-256(mnemonic)`)  |

### rotate-key

Rotește cheia ML-DSA-87 a contului în cadrul aceluiași algoritm. Citește mnemonicul de la stdin, semnează dublu cu cheia veche și cea nouă, cosemnează cu cheia veche și difuzează.

```bash
echo "<mnemonic>" | qorechaind tx pqc rotate-key --from mykey --old-derivation bridge --new-derivation adapter \
  --gas 600000 --fees 60000uqor --chain-id qorechain-vladi
```

| Flag               | Tip    | Descriere                                                                            |
| ------------------ | ------ | ------------------------------------------------------------------------------------ |
| `--old-derivation` | string | Derivarea cheii înregistrate în prezent: `bridge` (implicit) sau `adapter`           |
| `--new-derivation` | string | Derivarea noii chei: `adapter` (implicit) sau `bridge`                               |
| `--new-random`     | bool   | Rotește către o cheie aleatorie nouă; necesită `--new-key-out`                       |
| `--new-key-out`    | string | Salvează noua cheie privată ca `<home>/pqc/<name>.dilithium` înainte de a se trimite orice |
| `--sign-bytes`     | string | `auto` (implicit), `v1` sau `v2`                                                     |

### open-evm-window

Calea EVM admite o tranzacție doar de la un cont care deține o cheie PQC înregistrată **și** are o fereastră de autorizare deschisă. O fereastră se deschide cu un mesaj de pe calea Cosmos, deci poartă semnătura PQC pe care un portofel Ethereum nu o poate produce. În interiorul ferestrei, tranzacțiile obișnuite MetaMask funcționează neschimbat.

```bash
qorechaind tx pqc open-evm-window <blocks> <max-txs> <max-value> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

| Argument    | Limită               | Semnificație                                                                                  |
| ----------- | -------------------- | --------------------------------------------------------------------------------------------- |
| `blocks`    | 1 până la 17.280     | Cât timp rămâne deschisă fereastra, numărat de la blocul care o deschide                      |
| `max-txs`   | 1 până la 1.000      | Câte tranzacții EVM admite                                                                    |
| `max-value` | pozitiv              | Totalul admis, incluzând valoarea transferată **și** taxa maximă pe care o poate plăti fiecare tranzacție; `uqor` sau `qor`, ex. `1000qor` |

Deschiderea unei ferestre o înlocuiește pe cea existentă. Verificați-o cu `qorechaind query pqc evm-window <address>`.

### close-evm-window

Închide imediat fereastra dvs., de exemplu atunci când bănuiți că cheia clasică este compromisă.

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

`node_type` este `sx` sau `ux`. Înregistrarea necesită o licență `lightnode_operator` activă, iar înregistrarea pentru programul de recompense al nodurilor light **nu este încă deschisă**. Alte comenzi: `tx lightnode heartbeat`, `tx lightnode claim-rewards`, `tx lightnode deregister`. Vezi [Nod light](/light-node/overview).

---

## bridge

Bridge-ul nu este în producție: pe ambele rețele, fiecare chain configurat are statusul `pending` și nu este înregistrat niciun validator de bridge (`query bridge chains`, `query bridge validators`).

### withdraw

```bash
qorechaind tx bridge withdraw <destination_chain> <destination_address> <asset> <amount> [flags]
```

### deposit

Creditează active transferate prin bridge dintr-un chain sursă. Poartă semnăturile validatorilor (`--validator-sigs`, `--pqc-commitment`); este un mesaj de operator de bridge, nu modul în care un utilizator final inițiază un depozit.

```bash
qorechaind tx bridge deposit <source_chain> <source_tx_hash> <asset> <amount> [flags]
```

### update-chain-config / set-verifier-bootstrap

Administrative (licență `bridge_admin` sau `qcb_bridge`).

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
```

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

Primul `transfer` este subcomanda, iar al doilea este portul sursă. La momentul redactării, nu este deschis niciun canal IBC pe vreuna dintre rețele (`query ibc channel channels`).

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

`profile` este `defi`, `gaming`, `nft`, `enterprise` sau `custom`; `stake_amount` este în uqor (minimul curent se află în `query rdk config`). Presetarea profilului furnizează settlement-ul, sequencer-ul, DA și modelul de gas; doar VM-ul poate fi suprascris din linia de comandă. Nu există nicio comandă `finalize-batch`.

---

## multilayer

```bash
qorechaind tx multilayer register-sidechain <layer_id> <description> [--block-time-ms 2000] [--domains defi] [--max-tx 1000] [--min-validators 1] [--settlement-interval 100] [--vm-types evm] [flags]
qorechaind tx multilayer register-paychain <layer_id> <description> [--max-tx 5000] [--settlement-interval 50] [--base-fee-multiplier 0.01] [flags]
qorechaind tx multilayer anchor-state <layer_id> <layer_height> <state_root_hex> <pqc_agg_sig_hex> [flags]
qorechaind tx multilayer route-transaction <payload_hex> [--preferred-layer <id>] [--max-latency-ms 10000] [--max-fee 1000000] [flags]
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_height> <fraud_proof_hex> <reason> [flags]
qorechaind tx multilayer update-layer-status <layer_id> <new_status> <reason> [flags]
```

`new_status` este `proposed`, `active`, `suspended` sau `decommissioned`. `update-layer-status` este dezactivat pe mainnet de circuit breaker (vezi mai jos).

---

## Mesaje dezactivate sau indisponibile în prezent {#disabled-messages}

Unele comenzi există în binar, dar nu pot reuși pe rețelele live:

| Comandă                                                   | Motiv                                                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `tx wasm store`, `tx wasm instantiate`, `instantiate2`    | Permisiunea de upload și instanțiere este `Nobody` pe ambele rețele, iar tipurile de mesaj sunt și pe lista circuit breaker-ului |
| `tx crossvm call`                                         | Dezactivată pe mainnet de circuit breaker                                                      |
| `tx svm deploy-program`, `execute`, `create-account`      | Calea de tranzacție SVM este dezactivată la nivelul întregii rețele                            |
| `tx abstractaccount create`, `register-authenticator`, `execute-cosmos`, `execute-evm` | Modulul abstract-account este oprit (`query abstractaccount config` afișează `enabled: false`) |
| `tx rlconsensus *`, `tx amm pause-pool`/`resume-pool`      | Mesaje cu autoritate de guvernanță; sunt și pe lista circuit breaker-ului de mainnet           |
| `tx license *`                                            | Doar pentru autoritate (licențele sunt acordate de autoritatea de licențiere a rețelei)        |

Lista live se obține cu `qorechaind query circuit disabled-list`.
