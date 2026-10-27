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
Setați `--chain-id qorechain-vladi` pentru a difuza tranzacția pe mainnet-ul live sau `--chain-id qorechain-diana` pentru testnet. Ambele rețele rulează linia v3.2: versiunea de nod pentru mainnet **v3.2.4** (aplicată la înălțimea 3.742.566 pe 23 octombrie 2026 prin propunerea de guvernanță 13; v3.2.3 a fost aplicată la înălțimea 3.662.051 pe 20 octombrie 2026; propunerea de guvernanță 14 ar aplica v3.2.5 la înălțimea 3.906.833 și se află în perioada de votare la momentul redactării), testnet **v3.2.6** (aplicată la înălțimea 8.970.638 pe 27 octombrie 2026, după v3.2.5 la înălțimea 8.890.800 pe 26 octombrie și v3.2.4 la înălțimea 8.337.253 pe 19 octombrie). Verificați `latest.json` de pe [download.qore.host](https://download.qore.host) pentru versiunea curentă. Dacă `--chain-id` este omis, clientul folosește `chain-id`-ul din configurația locală a clientului.

Comenzile și flag-urile de pe această pagină au fost verificate pe binarul de release v3.2.3, plus completările din v3.2.4. Tot ce există doar începând cu v3.2.4 (pe mainnet din 23 octombrie 2026, pe testnet din 19 octombrie 2026) este marcat ca atare. Sursa v3.2.6 nu adaugă nicio comandă `tx` nouă; ea schimbă starea testnet-ului (token-uri de test, un modul abstract-account activat, instanțiere QoreChain Native deschisă), lucruri menționate în secțiunile de mai jos acolo unde contează.
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

`hybrid_signature_mode` este `required` pe ambele rețele (`qorechaind query pqc hybrid-mode`). Fiecare tranzacție de pe calea Cosmos trebuie să poarte o semnătură ML-DSA-87 (Dilithium-5) alături de semnătura secp256k1; un simplu `tx bank send ... -y` este respins (codespace `pqc`, cod 20). Singurele excepții, începând cu mainnet v3.2.3, sunt:

- **prima** înregistrare a unei chei PQC pentru un cont care nu are încă nicio cheie (`register-key` sau `register-key-v2`), astfel încât un cont nou să poată face bootstrap;
- repararea unei înregistrări de cont care nu conține nicio cheie utilizabilă, cu `register-key-v2`;
- `tx slashing unjail` pentru un cont care nu are nicio cheie PQC înregistrată.

Un cont care deține deja o cheie PQC trebuie să semneze hibrid totul, **inclusiv** `register-key-v2` și `migrate-key` (o încercare doar cu semnătură clasică este refuzată cu codul 234). Un cont fără cheie nu poate atașa nici el o semnătură hibridă: nu are față de ce să verifice, deci se înregistrează mai întâi.

Fiecare comandă de pe această pagină, cu excepția primei înregistrări (`pqc register-key` / `pqc register-key-v2` pe un cont fără cheie), se rulează așadar în doi pași: construiți tranzacția cu `--generate-only`, apoi o semnați și o difuzați cu `tx pqc cosign`. `pqc rotate-key` face singură cosemnarea și difuzarea; `pqc gen-key` și `pqc recover-key` doar creează local un fișier de cheie:

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

`gen-key` și `recover-key` refuză să suprascrie un fișier de cheie existent cu acel nume; `--force` îl înlocuiește și păstrează vechiul fișier ca `<name>.dilithium.bak-<unix-time>`.

### register-key

Înregistrează o cheie publică PQC pentru contul dvs. (comandă legacy: algoritmul este Dilithium-5). O primă înregistrare se semnează doar cu cheia clasică; aceasta este excepția de bootstrap. Un cont care are deja o cheie trebuie să o semneze hibrid (`--generate-only`, apoi `tx pqc cosign`).

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`key_type` este `hybrid` (recomandat) sau `pqc_only`. `classical_only` este refuzat (codul 230): nu înregistrează nicio cheie post-cuantică, deci contul nu ar mai putea semna niciodată. Cheia publică de 2.592 de octeți face înregistrarea mai costisitoare decât un transfer, motiv pentru care are nevoie de o limită de gas mai mare.

Chain-ul refuză și o cheie care nu oferă nicio protecție post-cuantică (codul 230) și o cheie pe care acest cont a mai folosit-o (codul 232). Refuză o înregistrare a cărei cheie clasică nu este cea proprie a semnatarului (codul 45).

### register-key-v2

Înregistrează o cheie cu selecție explicită a algoritmului și, opțional, dovedește că dețineți secretul cheii.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> [--pqc-key <name>] \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`algorithm` este `dilithium5` (sau `1`) ori `mlkem1024` (sau `2`); `key_type` este `hybrid` sau `pqc_only`.

**Dovada de posesie (opțională).** Cu `--pqc-key <name>` (o cheie creată cu `gen-key` sau `recover-key`), comanda atașează o dovadă de posesie: semnătura proprie a noii chei peste `qorechain-pqc-pop-v1|<chain-id>|<algorithm id>|<address>|<public key hex>`. Chain-ul o verifică atunci când este prezentă și refuză înregistrarea dacă nu se verifică (codul 231); o înregistrare fără ea este în continuare acceptată. Dovada numește chain-ul, algoritmul, contul și cheia, deci nu dovedește nimic pentru un alt cont sau o altă rețea. Adaugă tranzacției o semnătură de 4.627 de octeți, așa că păstrați limita de gas la `600000`. Dovada călătorește în câmpul `proof_of_possession` al mesajului. SDK-ul TypeScript 0.9.0 atașează una singur prin `ensurePqcRegistered`, odată ce rețeaua a aplicat v3.2.3; versiunile anterioare ale SDK-ului și `@qorechain/wallet-adapter` nu o fac, deci o înregistrare făcută prin ele nu poartă nicio dovadă (este în continuare acceptată).

```bash
qorechaind tx pqc gen-key mypqc                      # prints the public key hex
qorechaind tx pqc register-key-v2 dilithium5 <pubkey_hex> hybrid --pqc-key mypqc \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

Începând cu v3.2.4 (pe mainnet din 23 octombrie 2026, pe testnet din 19 octombrie 2026) înregistrarea contului raportează și dacă o dovadă a fost verificată, ca `possession_proven` (vezi [Endpoint-uri REST / gRPC](/api-reference/rest-grpc-endpoints#pqc-module)).

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

Ambele rețele au aplicat upgrade-ul care a mutat verificarea hibridă pe sign-bytes v2; forma v1 este refuzată. O tranzacție poate purta o singură extensie de semnătură hibridă (mai multe sunt refuzate începând cu v3.2.3).

### migrate-key

Migrează cheia PQC a contului dvs. de la un algoritm la altul. Trebuie să fie activă o migrare pentru algoritmul dvs. curent (pornită prin guvernanță); ambele chei semnează octeții migrării, iar tranzacția în sine are nevoie de semnătura dvs. hibridă (`--generate-only`, apoi `tx pqc cosign`). O cheie pe care contul a mai folosit-o este refuzată (codul 232).

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> --generate-only [flags] > m.json
qorechaind tx pqc cosign m.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
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

Începând cu v3.2.3, o rotație refuză o cheie nouă care nu oferă nicio protecție post-cuantică (codul 230) și o cheie pe care contul a mai folosit-o (codul 232); contul își amintește cheile de la care a făcut rotația, deci o rotație nu poate fi reluată pentru a reveni la o cheie veche.

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

**Ferestre cu domeniu limitat (mainnet v3.2.3 și ulterioare).** Limita de valoare numără doar QOR nativ: un transfer de token, o aprobare sau orice alt apel de contract poartă valoarea zero și nu este numărat în ea. Două flag-uri opționale restrâng ce admite fereastra:

| Flag                | Efect                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--native-only`     | Admite doar transferuri simple de QOR: fără calldata, fără creare de contract, fără destinatar care poartă cod, fără autorizare EIP-7702 |
| `--allowed-targets` | Admite doar acești destinatari (adrese `0x` separate prin virgulă); crearea de contracte este refuzată                      |

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
```

O fereastră deschisă fără niciunul dintre flag-uri admite ce a admis întotdeauna. Domeniul este raportat de interogarea ferestrei ca `native_only` și `allowed_targets`.

### close-evm-window

Închide imediat fereastra dvs., de exemplu atunci când bănuiți că cheia clasică este compromisă. Revocă și un consimțământ de delegare EIP-7702 în așteptare.

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

### authorize-evm-delegation și clear-evm-delegation

O delegare EIP-7702 a contului dvs. intră în vigoare doar cu propriul dvs. consimțământ post-cuantic (mainnet din v3.2.2). `authorize-evm-delegation` înregistrează acest consimțământ pentru o singură adresă delegată; este de unică folosință, expiră după numărul dat de blocuri și este revocat de `close-evm-window`. `clear-evm-delegation` elimină o delegare deja setată. Ambele sunt mesaje de pe calea Cosmos semnate hibrid (`--generate-only`, apoi `tx pqc cosign`).

```bash
qorechaind tx pqc authorize-evm-delegation <delegate_0x_address> <blocks> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
qorechaind tx pqc clear-evm-delegation --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
```

Adresa zero ca `delegate` consimte la eliminarea delegării. Verificați starea cu `qorechaind query pqc evm-delegation-consent <address>`.

Niciunul dintre mesajele de cheie PQC (`register-key`, `register-key-v2`, `rotate-key`, `migrate-key`) nu poate fi trimis în numele unui cont prin `authz` (mainnet v3.2.3 și ulterioare).

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

`node_type` este `sx` sau `ux`. Înregistrarea necesită o licență `lightnode_operator` activă, acordată de autoritatea de licențiere a rețelei; vezi [Nod light](/light-node/overview) pentru starea curentă a programului. Alte comenzi: `tx lightnode heartbeat`, `tx lightnode claim-rewards`, `tx lightnode deregister`.

Începând cu v3.2.3, recompensa pe care o poate acumula un nod este limitată **pe lună** (`max_reward_per_month_per_node` în `GET /qorechain/lightnode/v1/reward_pool`, 2.000 QOR per 30 de zile), proporțional cu timpul de bloc și uptime-ul, deci limita nu mai depinde de cât de repede sunt produse blocurile. O limită este un plafon, nu o sumă promisă. Începând cu v3.2.4 (pe mainnet din 23 octombrie 2026, pe testnet din 19 octombrie 2026) limita unui nod începe de la propria sa înregistrare, nu de la decontarea anterioară.

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

### register-validator / attest

Mesaje de validator de bridge. `register-validator <pqc_pubkey_hex> <supported_chains_csv>` înregistrează un validator pentru îndatorirea de atestare, iar `attest <chain> <event_type> <operation_id> <tx_hash> <amount> <asset> [--pqc-signature <hex>] [--proof <hex>]` trimite o atestare. Niciun validator de bridge nu este înregistrat pe vreuna dintre rețele. Începând cu v3.2.4 (pe mainnet din 23 octombrie 2026, pe testnet din 19 octombrie 2026), o înregistrare de validator de bridge necesită și o dovadă de posesie și o cheie pe care niciun alt validator de bridge nu o folosește.

### update-chain-config / set-verifier-bootstrap / update-circuit-breaker-limits

Administrative (licență `bridge_admin` sau `qcb_bridge`; limitele circuit breaker-ului pot fi setate și prin guvernanță).

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
qorechaind tx bridge update-circuit-breaker-limits <chain_id> <max_single_transfer> <daily_limit> [flags]
```

Limitele sunt în unități de bază, iar `0` înseamnă nelimitat. Doar o rută al cărei status este exact `active` mută valoare.

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

Primul `transfer` este subcomanda, iar al doilea este portul sursă. La momentul redactării, nu este deschis niciun canal IBC pe mainnet; testnet-ul are un canal de transfer deschis (`channel-0`), verificat la 27 octombrie 2026 cu `query ibc channel channels`.

---

## amm

Mesaje AMM native. La momentul redactării nu există niciun pool pe vreuna dintre rețele, deci aceste comenzi nu au încă asupra a ce să acționeze.

```bash
qorechaind tx amm create-pool <pool_type> <deposit_a> <deposit_b> [flags]     # pool_type: constant_product | stable_swap; deposits as coins, e.g. 1000000uqor
qorechaind tx amm add-liquidity <pool_id> <amount_a> <amount_b> <min_lp_out> [flags]
qorechaind tx amm remove-liquidity <pool_id> <lp_amount> <min_a> <min_b> [flags]
qorechaind tx amm swap-exact-in <pool_id> <token_in> <denom_out> <min_out> [flags]
qorechaind tx amm swap-exact-out <pool_id> <denom_in> <token_out> <max_in> [flags]
```

Începând cu v3.2.2, un swap trebuie să numească ambele denominații ale pool-ului, `max_swap_impact_bps` este impus, iar taxa de protocol este direcționată prin modulul burn.

Pe testnet, un pool poate asocia `uqor` cu unul dintre cele trei token-uri de test Fest (fără valoare; doar testnet). Depozitul și sumele swap-ului folosesc denominația bank `erc20:<adresa 0x EIP-55>`, care ține cont de majuscule, de exemplu `qorechaind tx amm create-pool constant_product 1000000000uqor 2000000000erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA --from mykey --generate-only > tx.json` (apoi `tx pqc cosign`). Un token deținut pe partea EVM trebuie mai întâi convertit într-un coin bank cu `MsgConvertERC20`, al cărui expeditor este o adresă `qor1`; comanda CLI `qorechaind tx erc20 convert-erc20` din versiunea de nod v3.2.6 scrie expeditorul ca adresă `0x`, iar lanțul o refuză (`decoding bech32 failed`), așa că construiți acel mesaj cu expeditorul `qor1`. Detalii: [Dezvoltare EVM](/developer-guide/evm-development#fest-tokens). Crearea unui pool costă taxa de creare a pool-ului în plus față de depozite (`pool_creation_fee` în `query amm params`).

---

## gasabstraction

```bash
qorechaind tx gasabstraction fund-float <amount> [flags]
```

Mută tokeni nativi (de exemplu `1000000uqor`) în float-ul de conversie a taxelor, rezerva de QOR pe care modulul o folosește pentru a plăti validatorii atunci când o taxă este plătită într-un alt token acceptat. Guvernanța decide ce tokeni sunt acceptați. Pe ambele rețele configurația acceptă doar `uqor` nativ, deci nu are loc nicio conversie; verificați cu `qorechaind query gasabstraction accepted-tokens`.

---

## crossvm

```bash
qorechaind tx crossvm call <evm|cosmwasm|svm> <target_contract> --payload <hex> [--funds <coins>] [--async] [flags]
```

`call` este oprit pe mainnet de circuit breaker (vezi [mai jos](#disabled-messages)) și funcționează pe testnet doar acolo unde calea țintă este disponibilă. Un apel pus în coadă (`--async`) care eșuează nu lasă efecte secundare, doar înregistrarea sa `Failed` (începând cu v3.2.3), iar un apel a cărui cale sursă derivată este egală cu calea țintă este refuzat. Vezi [Interoperabilitate Cross-VM](/developer-guide/cross-vm-interoperability).

---

## stakingtier (v3.2.4) {#stakingtier}

:::note Disponibil de la v3.2.4
Modulul de niveluri de staking a apărut cu versiunea **v3.2.4**: rulează pe testnet-ul `qorechain-diana` din 19 octombrie 2026 și pe mainnet din 23 octombrie 2026 (înălțimea 3.742.566, propunerea de guvernanță 13). Un nod aflat încă pe o versiune mai veche nu are modulul, iar aceste comenzi sunt refuzate; verificați mai întâi `GET /qorechain/stakingtier/v1/params` pe nodul pe care îl țintiți.
:::

Delegări opționale blocate în timp: un delegator poate bloca o parte dintr-o delegare existentă pentru 3, 6 sau 12 luni (blocarea minimă este de 10 QOR) și poate revendica ulterior bonusul pe care modulul îl creditează pentru ea. O blocare este o înregistrare adăugată peste delegare: fondurile delegate rămân la validator.

```bash
qorechaind tx stakingtier lock <validator_address> <amount_uqor> <months> [flags]    # months: 3, 6 or 12
qorechaind tx stakingtier unlock-early <lock_id> [flags]
qorechaind tx stakingtier claim [flags]
```

Blocarea este impusă de serverul de mesaje de staking, deci acoperă și anularea delegării prin `authz`, un grup sau un contract. Încheierea timpurie a unei blocări pierde bonusul neplătit și arde o penalizare; suma minimă de blocare și ceilalți parametri se găsesc în `GET /qorechain/stakingtier/v1/params`. Ca orice tranzacție de pe calea Cosmos, acestea au nevoie de cosemnarea hibridă (`--generate-only`, apoi `tx pqc cosign`) și de o limită de gas generoasă (de exemplu `--gas 900000 --fees 90000uqor`).

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [--prev-state-root <hex>] [--tx-count <n>] [--data-hash <hex>] [--withdrawals-root <hex>] [--validator-set-hash <hex>] [--anchor-signature <hex>] [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

`profile` este `defi`, `gaming`, `nft`, `enterprise` sau `custom`; `stake_amount` este în uqor (minimul curent se află în `query rdk config`). Presetarea profilului furnizează settlement-ul, sequencer-ul, DA și modelul de gas; doar VM-ul poate fi suprascris din linia de comandă. Nu există nicio comandă `finalize-batch`.

Pe un rollup al cărui data availability este `native` (sau `both`), lăsați `--data-hash` gol: nicio tranzacție nu postează un blob de data availability, iar lanțul refuză un batch care declară un hash de date pentru un astfel de rollup (așa se comportă versiunea de nod v3.2.4, versiunea de mainnet la momentul redactării). Pentru un rollup optimistic, clientul `@qorechain/rdk` (0.6.1) setează state root-ul unui batch la rădăcina canonică de tranziție a lanțului (`batchTransitionRoot` în RDK); vezi [Rollup-uri](/rollups/overview).

`--anchor-signature` este semnătura ML-DSA a creatorului rollup-ului peste **octeții de semnare v2 ai ancorei**; cu ea, batch-ul este ancorat și în modulul multilayer. Afișați octeții exacți de semnat cu `qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>`; valorile trebuie să corespundă flag-urilor `submit-batch`. Începând cu v3.2.3, modulul ține un **registru de escrow per rollup**: o retragere se plătește doar din ceea ce conține registrul acelui rollup și este verificată pentru denominație, sumă pozitivă, adâncimea dovezii și dimensiunea nodurilor vecine; oprirea unui rollup restituie doar ceea ce a rămas în registrul său, iar un rollup oprit nu mai plătește retrageri. La momentul redactării nu există niciun rollup pe vreuna dintre rețele.

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
| `tx wasm store`, `tx wasm instantiate`, `instantiate2`    | Mainnet: permisiunea de upload și instanțiere este `Nobody`, iar cele trei tipuri de mesaj sunt pe lista circuit breaker-ului. Testnet: upload-ul este `Nobody`, iar `MsgStoreCode` este pe listă (codul este stocat prin guvernanță), în timp ce instanțierea este deschisă (`Everybody`) și nu este pe listă |
| `tx crossvm call`                                         | Dezactivată pe mainnet de circuit breaker; activată pe testnet                                 |
| `tx vesting create-vesting-account`, `create-periodic-vesting-account`, `create-permanent-locked-account` | Pe lista circuit breaker-ului de mainnet; începând cu v3.2.3, un cont de vesting poate fi oricum creat doar pentru semnatarul însuși |
| PQC `MsgDeprecateAlgorithm` / `MsgDisableAlgorithm`        | Mesaje de propunere de guvernanță (fără comandă CLI), pe lista circuit breaker-ului de mainnet; începând cu v3.2.3, guvernanța nu poate elimina nici ultimul algoritm de semnătură activ |
| `tx svm deploy-program`, `execute`, `create-account`      | Calea de tranzacție SVM este dezactivată la nivelul întregii rețele                            |
| `tx abstractaccount create`, `register-authenticator`, `execute-cosmos`, `execute-evm` | Mainnet: modulul abstract-account este oprit (`query abstractaccount config` afișează `enabled: false`). Testnet: pornit prin guvernanță (`enabled: true`, verificat la 27 octombrie 2026) |
| `tx rlconsensus *`, `tx amm pause-pool`/`resume-pool`      | Mesaje cu autoritate de guvernanță; sunt și pe lista circuit breaker-ului de mainnet           |
| `tx license *`                                            | Doar pentru autoritate (licențele sunt acordate de autoritatea de licențiere a rețelei; începând cu v3.2.3, guvernanța poate înlocui acea autoritate cu `MsgUpdateAuthority`) |

Lista live se obține cu `qorechaind query circuit disabled-list`.
