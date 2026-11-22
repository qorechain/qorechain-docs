---
slug: /developer-guide/governance-proposals-contracts
title: "Propuneri de guvernanță pentru contracte: încarcă cod Native și deschide accesul între VM-uri (testnet)"
sidebar_label: Propuneri pentru contracte
sidebar_position: 12
---

# Propuneri de guvernanță pentru contracte: încarcă cod Native și deschide accesul între VM-uri (testnet)

Pe testnet-ul QoreChain `qorechain-diana`, nimeni nu încarcă un contract QoreChain Native (CosmWasm) printr-o tranzacție simplă, iar niciun contract EVM nu poate apela un contract Native prin bridge până când guvernanța nu a spus că poate. Ambele trec printr-o **propunere de guvernanță**: propunerea stochează codul tău compilat, opțional creează contractul și îl adaugă în lista de permisiuni între VM-uri, **fixat pe codul exact** pe care l-ai încărcat. Această pagină arată unui constructor cum să pregătească, să trimită, să urmărească și să verifice o astfel de propunere, apoi cum să apeleze contractul aprobat din Solidity.

Această pagină a fost verificată pe testnet-ul live la **22 noiembrie 2026** (lanțul `qorechain-diana`, lanț v3.2.9 din 20 noiembrie). Exemplele on-chain sunt propuneri reale: 40 (contractul `qday-receipts`, codul 865), 23, 27 și 34 (cod stocat), 19 și 20 (reguli de instanțiere), 32 (lista de permisiuni). Liniile de comandă `qorechaind` au fost scrise pornind de la referința CLI existentă și de la JSON-ul propunerii de pe lanț; binarul în sine nu a fost rulat pentru această pagină, deci rulează o dată `qorechaind tx gov submit-proposal --help` pe mașina ta dacă un indicator diferă.

:::note Doar testnet
Acești pași descriu testnet-ul. Mainnet nu are bridge-ul deschis între VM-uri, iar încărcarea codului acolo este tot doar prin guvernanță. QOR de test nu are valoare; folosește doar conturi de test.
:::

## De ce trece prin guvernanță {#why}

* **Încărcarea este închisă pentru conturi.** `code_upload_access` este `Nobody`, iar `MsgStoreCode` se află pe lista circuit breaker-ului. O propunere de guvernanță deschide breaker-ul, stochează codul ca cont de guvernanță și îl închide la loc în aceeași propunere, deci ușa nu rămâne niciodată deschisă între voturi.
* **Instanțierea este deschisă.** `instantiate_default_permission` este `Everybody` din propunerea 19, deci după ce guvernanța a stocat codul tău, oricine (tu inclus) poate crea contracte din el, cu excepția cazului în care codul stocat poartă o permisiune mai strictă.
* **Bridge-ul ajunge doar la contractele aprobate.** Bridge-ul `0x0901` poate apela doar țintele din `bridge_allowed_targets`. Fiecare țintă este fixată pe un id de cod și pe lungimea istoricului ei de cod, deci contractul nu poate fi migrat la alt cod păstrându-și aprobarea.
* **Este atomică.** Mesajele unei propuneri rulează împreună. Dacă unul eșuează (de exemplu un cod pe care lanțul îl refuză), niciunul nu se aplică, iar breaker-ul nu rămâne deschis.

## De ce ai nevoie {#needs}

| Element | Cum îl obții |
| --- | --- |
| Binarul `qorechaind` (Linux) | Versiunea de la [download.qore.host](https://download.qore.host). Un binar din arborele sursă public nu poate produce semnătura hibridă pe care o cere lanțul. |
| Un cont de testnet cu o cheie post-cuantică înregistrată | Vezi [Semnarea hibridă](/cli-reference/transaction-commands#hybrid-signing). |
| QOR de test pentru depozit și comisioane | Faucet-ul testnet-ului. O propunere obișnuită cere 10 QOR, una accelerată 50 QOR (tabelul de mai jos). |
| Docker, ca să construiești contractul la fel ca toți ceilalți | [Docker](https://docs.docker.com/get-docker/). |

## Pasul 1: construiește contractul și notează checksum-ul lui {#build}

Construiește cu optimizatorul CosmWasm, ca oricine să poată reconstrui sursa ta și să obțină aceiași octeți. Contractul din Workshop 3 a fost construit cu imaginea arm64 pe Apple Silicon (o mașină x86 folosește imaginea simplă `optimizer`; cele două dau checksum-uri diferite, deci spune în rezumatul propunerii pe care ai folosit-o):

```bash
cd my-contract
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

Ar trebui să vezi o linie per contract, cu un checksum hexazecimal de 64 de caractere și numele fișierului, de exemplu `6ebfc32f...5c43c  qday_receipts.wasm`. Acel checksum este **SHA-256 al fișierului wasm necomprimat** și este `data_hash` pe care îl va arăta lanțul pentru codul tău. Copiază-l; intră în rezumatul propunerii, ca votanții să-l poată verifica.

Înainte să cheltui un depozit, verifică codul față de limitele din [Gaz și limite de încărcare](/developer-guide/cosmwasm-development#gas-and-limits): cel mult 4.096 de funcții, cel mult 32 MiB compilat, fără instrucțiuni în virgulă mobilă.

## Pasul 2: codifică codul pentru propunere {#encode}

Propunerea poartă wasm-ul în interiorul JSON-ului, ca base64. Comprimă-l mai întâi (lanțul acceptă gzip, ceea ce a folosit propunerea 40: codul ei începe cu `H4sI`):

```bash
gzip -9 -c artifacts/my_contract.wasm | base64 | tr -d '\n' > code.b64
wc -c code.b64
```

Ar trebui să vezi o dimensiune în octeți. Codul `qday-receipts` are aproximativ 99.000 de caractere ca base64 de gzip. Păstrează-l într-un fișier, pentru că este prea lung ca să-l lipești într-o comandă.

## Pasul 3: scrie propunerea {#write}

O propunere este un fișier JSON cu `messages`, `metadata`, `deposit`, `title`, `summary` și `expedited`. `authority` și `sender` ale fiecărui mesaj de mai jos sunt **contul modulului de guvernanță**. Citește-l, nu-l copia de pe această pagină:

```bash
curl -s https://api-testnet.qore.host/cosmos/auth/v1beta1/module_accounts/gov
```

Ar trebui să vezi contul cu `"name":"gov"`; `address` începe cu `qor1`. Numește-l `<GOV_ADDRESS>` mai jos. La 22 noiembrie 2026 era `qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3`.

### Propunerea A: stochează codul și creează contractul {#proposal-a}

Aceasta este forma propunerii 40 fără mesajul ei de listă de permisiuni. Ordinea contează: deschide breaker-ul, stochează, închide breaker-ul, apoi instanțiază.

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

Cum completezi substituenții:

| Substituent | Cum îl obții |
| --- | --- |
| `<NEXT_CODE_ID>` | Ultimul id de cod plus unu. Citește-l pe ultimul cu `curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code?pagination.reverse=true&pagination.limit=1"`. La 22 noiembrie 2026, ultimul era 865, deci următorul era 866. Dacă propunerea altcuiva stochează cod înaintea ta, a ta primește un id mai târziu, iar mesajul de instanțiere eșuează, ceea ce anulează toată propunerea (nu pierzi nimic în afară de așteptare). |
| `<BASE64_SALT>` | Orice text scurt, codat base64: `printf 'my-contract-v1' \| base64`. Face adresa contractului previzibilă. Propunerea 40 a folosit salt-ul `qday-receipts-w3`. |
| `msg` | JSON-ul pe care îl așteaptă `instantiate` al contractului tău. `{}` pentru un contract fără câmpuri. |
| `admin` | Un șir gol înseamnă fără admin, deci nimeni nu poate migra contractul. Preferă asta pentru un contract pe care îl va apela bridge-ul (vezi [Fixările](#pins)). |
| `instantiate_permission` | `Everybody` sau `{ "permission": "AnyOfAddresses", "addresses": ["qor1..."] }` pentru a restrânge cine poate instanția (propunerea 34 a făcut asta pentru un contract de test). |

Nu ești obligat să instanțiezi în interiorul propunerii. Renunță la ultimul mesaj ca să stochezi doar codul și instanțiază mai târziu cu o tranzacție obișnuită (`tx wasm instantiate`, vezi [Ciclul de viață al contractului](/developer-guide/cosmwasm-development)). Propunerile 23 și 27 au stocat cod în acest fel.

### Propunerea B: pune contractul pe lista de permisiuni între VM-uri {#proposal-b}

După ce propunerea A a trecut, găsește adresa contractului și citește parametrii live ai modulului între VM-uri:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID>/contracts"
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>/history"
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

Ar trebui să vezi adresa contractului tău `qor1...`, un istoric cu **o singură** intrare (`INIT`, id-ul tău de cod) și setul de parametri. `MsgUpdateParams` pentru modulul între VM-uri **înlocuiește întregul set de parametri**, deci copiază fiecare câmp din răspunsul live și schimbă doar două lucruri: adaugă ținta ta în `bridge_allowed_targets` și adaugă fixarea ei în `bridge_target_pins`.

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

Numerele de mai sus sunt valorile citite la 22 noiembrie 2026; folosește-le pe cele citite live de tine, nu pe acestea. Propunerea 40 a omis `wasm_congestion_factor_micro`, un câmp pe care îl arată și răspunsul live; urmează răspunsul live și șablonul propunerii 40 și compară rezultatul cu tabelul din [Referința între VM-uri](/developer-guide/cross-vm-reference#params) după vot.

### Fixările: ce înseamnă `code_id` și `history_len` {#pins}

| Câmp | Sens |
| --- | --- |
| `target` | `cosmwasm:` urmat de adresa contractului, scris exact ca în `bridge_allowed_targets`. |
| `code_id` | Codul pe care trebuie să-l ruleze contractul pentru ca bridge-ul să-l poată apela. |
| `history_len` | Câte intrări are istoricul de cod al contractului când îl fixezi. O instanță nouă are 1. Un contract migrat o dată are 2 (lista de permisiuni a testnet-ului are un astfel de contract). Orice migrare ulterioară schimbă lungimea, deci fixarea nu se mai potrivește, iar bridge-ul refuză apelul. |

Un contract din lista de permisiuni care are un admin altul decât guvernanța trebuie fixat, pentru că acel admin l-ar putea migra. Cel mai simplu design sigur este ce a făcut propunerea 40: fără admin și cu fixare.

### Ambele într-o singură propunere {#one-proposal}

Propunerea 40 le-a făcut pe toate într-o singură propunere: a stocat codul, l-a instanțiat cu un salt și a fixat adresa pe care o produce acel salt. Asta cere în avans următorul id de cod și adresa viitoare a contractului, deci este ușor de greșit. Două propuneri costă un vot în plus și câteva ore; preferă-le, în afară de cazul în care ai derivat deja adresa.

## Pasul 4: depozit, perioadă de vot și praguri {#params}

Citește regulile live înainte să trimiți:

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/params/voting
```

| Regulă | Propunere obișnuită | Propunere accelerată (`"expedited": true`) |
| --- | --- | --- |
| Depozit minim | 10 QOR (`10000000uqor`) | 50 QOR (`50000000uqor`) |
| Perioadă de depozit (pentru a atinge minimul) | 172.800 s (2 zile) | 172.800 s (2 zile) |
| Perioadă de vot | 14.400 s (4 ore) | 3.600 s (1 oră) |
| Cvorum | 33,4% din stake-ul legat | 33,4% din stake-ul legat |
| Prag pentru da | 50% din voturile exprimate | 66,7% din voturile exprimate |
| Prag de veto | 33,4% | 33,4% |
| Depozit inițial minim | niciunul | niciunul |

Citit la 22 noiembrie 2026. Tot din același răspuns: un vot „nu cu veto” peste prag arde depozitul (`burn_vote_veto` este `true`), o propunere care nu atinge cvorumul nu îl arde, iar o propunere accelerată care pică la numărătoare continuă ca una obișnuită, cu voturile deja exprimate. Fiecare propunere pentru contracte trimisă până acum de echipa testnet-ului a fost accelerată; o propunere a unui constructor ar trebui în mod normal să rămână obișnuită (depozitul de 10 QOR și votul de patru ore sunt mai ușor de planificat).

## Pasul 5: trimite {#submit}

Fiecare tranzacție pe lane-ul Cosmos trebuie să poarte semnătura hibridă, deci construiești mai întâi tranzacția și apoi o semnezi cu cheia ta post-cuantică. Propunerea este mare (codul este în ea), așa că lasă-i loc în gaz: pragul de comision este 0,1 uqor per unitate de gaz, iar un octet de tranzacție costă 10 gaz.

```bash
qorechaind tx gov submit-proposal proposal-a.json \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas <GAS> --fees <FEES>uqor \
  --generate-only > submit.json

qorechaind tx pqc cosign submit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

Alege `--gas` și `--fees` dintr-o rulare de probă: rulează mai întâi `tx pqc cosign` cu `--dry-run` (afișează o estimare de gaz și nu trimite nimic), apoi folosește estimarea plus 30% ca `<GAS>` și o taxă de cel puțin `<GAS>` ori 0,1 uqor ca `<FEES>`. Un transfer simplu are nevoie de aproximativ 300.000 până la 400.000 de gaz, iar un deploy sau o propunere care conține cod are nevoie de mult mai mult.

`--generate-only` scrie tranzacția nesemnată. `tx pqc cosign` adaugă ambele semnături și o difuzează; context în [Semnarea hibridă](/cli-reference/transaction-commands#hybrid-signing) și în [comenzile gov](/cli-reference/transaction-commands#submit-proposal). Ar trebui să vezi un hash de tranzacție și codul 0. Dacă vezi o eroare de gaz epuizat, mărește `--gas` și `--fees` corespunzător (comisionul trebuie să fie cel puțin gaz înmulțit cu 0,1 uqor).

Găsește id-ul propunerii tale, care este și numărul din evenimentele tranzacției:

```bash
curl -s "https://api-testnet.qore.host/cosmos/gov/v1/proposals?pagination.reverse=true&pagination.limit=1"
```

Ar trebui să vezi titlul tău și statusul `PROPOSAL_STATUS_VOTING_PERIOD` (depozitul atașat de tine a atins minimul). Cu un depozit mai mic, statusul este `PROPOSAL_STATUS_DEPOSIT_PERIOD`; oricine îl poate completa:

```bash
qorechaind tx gov deposit <PROPOSAL_ID> 5000000uqor --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > deposit.json
qorechaind tx pqc cosign deposit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

## Pasul 6: votează {#vote}

Orice staker poate vota cu stake-ul pe care îl deține. Un singur portofel de constructor nu va atinge cvorumul de 33,4%, deci anunță validatorii și delegatorii testnet-ului despre propunerea ta (rezumatul propunerii este ce citesc) și roagă-i să voteze. Un vot este o tranzacție semnată hibrid, ca oricare alta:

```bash
qorechaind tx gov vote <PROPOSAL_ID> yes --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > vote.json
qorechaind tx pqc cosign vote.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

Opțiunile sunt `yes`, `no`, `abstain` și `no_with_veto` (vezi [Guvernanță](/user-guide/governance)). Urmărește numărătoarea și ceasul:

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>/tally
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>
```

Când votul se încheie, statusul devine `PROPOSAL_STATUS_PASSED` (mesajele au rulat), `PROPOSAL_STATUS_REJECTED` sau `PROPOSAL_STATUS_FAILED`. **Failed** înseamnă că votul a trecut, dar un mesaj nu a putut rula, iar atunci niciunul dintre mesaje nu s-a aplicat; `failed_reason` spune de ce. Propunerea 40, de exemplu, a arătat `PASSED` la o oră după ce a fost trimisă.

## Pasul 7: verifică codul pe lanț {#verify}

Compară codul pe care îl ține lanțul cu checksum-ul pe care l-ai construit. Lanțul raportează `data_hash` cu litere mari; `sha256sum` afișează litere mici.

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.code_info.data_hash'
sha256sum artifacts/my_contract.wasm
```

Ar trebui să vezi aceleași 64 de caractere în ambele linii. Ca o verificare mai puternică, calculează hash-ul octeților pe care îi ține efectiv lanțul:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.data' | base64 -d | sha256sum
```

Aceasta a afișat `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c` pentru codul 865, același checksum ca build-ul cu optimizatorul al sursei din Workshop 3. Apoi verifică contractul și, după propunerea B, lista de permisiuni:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params | jq '{bridge_allowed_targets, bridge_target_pins}'
```

Ar trebui să vezi `code_id` ca al tău și `admin` gol în primul răspuns, iar în al doilea ținta ta `cosmwasm:qor1...` cu fixarea ei (`code_id`, `history_len` de `"1"`). La 22 noiembrie 2026, lista avea patru ținte; a patra era `qday-receipts` la `qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8`, fixată pe codul 865.

## Pasul 8: apeleaz-o dintr-un contract EVM {#call}

EVM apelează bridge-ul la `0x0000000000000000000000000000000000000901` cu `executeCrossVMCall(uint8,string,bytes)`: VM-ul țintă `1` (Native), adresa contractului tău ca șir și mesajul JSON ca octeți. Partea Native vede contul `qor1...` propriu al contractului EVM apelant ca expeditor, iar o revenire (revert) de pe oricare parte le anulează pe ambele.

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

Se aplică două condiții, ambele explicate în [Referința între VM-uri](/developer-guide/cross-vm-reference#evm-to-wasm): ținta trebuie să fie pe lista de permisiuni (și să ruleze în continuare codul fixat), iar contul care trimite tranzacția are nevoie de o [fereastră de autorizare EVM](/developer-guide/evm-window-reference) deschisă, al cărei `allowed_targets` listează `0x...0901`. Pentru un exemplu complet și testat, cu un magazin Solidity și contractul `qday-receipts`, urmează [Workshop 3](/build-before-qday/workshop-3#part-2).

## Depanare {#troubleshooting}

| Ce vezi | Cauza probabilă și remedierea |
| --- | --- |
| `tx wasm store` eșuează sau nu ajunge niciodată în bloc | Este de așteptat. Conturile nu pot încărca pe testnet; circuit breaker-ul și `code_upload_access` blochează ambele. Folosește o propunere. |
| Statusul propunerii este `PROPOSAL_STATUS_FAILED` | Votul a trecut, dar un mesaj a eșuat, deci nu s-a aplicat nimic. Citește `failed_reason` în `GET /cosmos/gov/v1/proposals/<id>`. Un `code_id` greșit în mesajul de instanțiere este cauza obișnuită. |
| `PROPOSAL_STATUS_REJECTED` | Prea puține voturi da sau lipsă de cvorum. Trimite din nou cu un rezumat mai clar sau roagă validatorii să voteze. |
| Statusul rămâne `PROPOSAL_STATUS_DEPOSIT_PERIOD` | Depozitul total este sub minim (10 QOR obișnuită, 50 QOR accelerată). Adaugă mai mult cu `tx gov deposit` în 2 zile. |
| Trimiterea eșuează cu codul 20 în spațiul `pqc` | Tranzacția nu a purtat semnătură hibridă. Folosește `--generate-only` și `tx pqc cosign`. |
| Trimiterea eșuează cu gaz epuizat | Propunerea este mare. Mărește `--gas` și păstrează comisionul cel puțin gaz înmulțit cu 0,1 uqor. |
| Checksum-ul diferă de `data_hash` | Ai construit pe alt tip de mașină sau cu altă versiune de optimizator. Reconstruiește cu imaginea numită în rezumatul propunerii (imaginile arm64 și x86 dau octeți diferiți). |
| Apelul EVM revine cu `cross-VM bridge call refused: target ... is not allowlisted` | Contractul nu este în `bridge_allowed_targets` sau codul lui s-a schimbat de când a fost fixat. Compară parametrii live cu fixarea ta. |
| Apelul EVM este refuzat înainte să ajungă la bridge | Nicio fereastră EVM deschisă care să listeze `0x0901`. Deschide mai întâi una. |
| `MsgCrossVMCall` este refuzat | Apelul poate fi în pauză pe lista circuit breaker-ului. Citește `GET /cosmos/circuit/v1/disable_list`. |
| Propunerea B eșuează | Setul de parametri era incomplet sau o fixare este greșită. Verifică dacă fiecare câmp al răspunsului live este prezent și dacă `history_len` este egal cu numărul de intrări din istoric. |

## Pagini conexe {#related}

* [Guvernanță](/user-guide/governance) pentru vot, depozite și tipuri de propuneri.
* [Dezvoltare QoreChain Native](/developer-guide/cosmwasm-development) pentru ciclul de viață al contractului și interogări.
* [Comenzi de tranzacție](/cli-reference/transaction-commands#submit-proposal) pentru indicatorii exacți `gov` și `pqc cosign`.
* [Referința între VM-uri](/developer-guide/cross-vm-reference) pentru parametri, coadă și exemple de apel.
* [Workshop 3](/build-before-qday/workshop-3) pentru un exemplu lucrat între VM-uri.
