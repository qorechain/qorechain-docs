---
slug: /light-node/rewards-and-monitoring
title: Recompense și monitorizare
sidebar_label: Recompense și monitorizare
sidebar_position: 5
---

# Recompense și monitorizare

Un light node înregistrat primește o parte din alocarea pentru light nodes și **trebuie să rămână sănătos** pentru a continua să se califice pentru ea. Această pagină acoperă cota de 3% din recompensele pentru light nodes, modul în care recompensele sunt creditate și revendicate, ce face și ce nu face nodul cu delegările, precum și modul de monitorizare a nodului.

:::note Nimic de aici nu reprezintă o promisiune de câștiguri
Înregistrarea este deschisă în ambele rețele; consultați [Starea programului de recompense](/light-node/overview#reward-program-status) pentru starea curentă. Suma creditată unui nod depinde de alocarea pentru light nodes, de numărul de noduri eligibile, de stake-ul și uptime-ul acestora și de limita per nod descrisă mai jos.
:::

## Cota de 3% din recompensa pe bloc

Distribuția comisioanelor din QoreChain rezervă o cotă fixă de **3% pentru light nodes** care furnizează date de rețea. Aceasta este una dintre cele cinci destinații din împărțirea recompenselor protocolului — validatori (37%), arse (30%), trezorerie (20%), stakeri (10%) și **light nodes (3%)** — impusă on-chain. Consultați [Tokenomics](/architecture/tokenomics) pentru detalierea completă.

Pentru a participa la această cotă, un nod are nevoie de următoarele, verificate on-chain, nu auto-declarate: o licență activă `lightnode_operator` (verificată la înregistrare), un minimum de **1,000 QOR delegați către validatori bonded** — calculat ca total pe toți validatorii cărora le delegați, nu per validator; delegările către validatori în jail sau unbonded nu se iau în calcul; necesar la înregistrare și recitit din staking de fiecare dată când sunt creditate recompense — și o taxă de înregistrare de **1 QOR**, plătită o singură dată la înregistrare. Participarea este plafonată la nivel de rețea la **10,000 de light nodes**. Consultați [Registration and Licensing](/light-node/registration-and-licensing) pentru modul în care funcționează înregistrarea și [Starea programului de recompense](/light-node/overview#reward-program-status) pentru starea curentă.

Cei 3% reprezintă suma care curge în modulul light-node, nu un drept per nod: fiecare nod eligibil este creditat cu partea sa ponderată după stake din ceea ce s-a acumulat, limitată per nod, iar tot ce nu este câștigat merge într-o rezervă pe care o poate elibera doar un vot de guvernanță. De la lanțul v3.2.3, limita per nod este de **2,000 QOR la 30 de zile** (`max_reward_per_month_per_node`), proporțională cu timpul de bloc scurs între decontări și scalată după uptime (regula `lightnode-monthly-cap`); aceasta înlocuiește limita anterioară per bloc (`max_reward_per_block_per_node`, `1713` uqor pe bloc). Începând cu v3.2.4 (mainnet din 23 octombrie 2026, testnet din 19 octombrie 2026), limita pentru un nod începe la cea mai târzie dintre decontarea anterioară și înregistrarea proprie a nodului, astfel încât un nod nou înregistrat nu este creditat pentru timpul dinaintea înregistrării. Consultați [cota de 3% din recompensele pentru light nodes](/light-node/overview#the-3-light-node-reward-share).

Odată înregistrat și cu stake delegat, menținerea eligibilității ține de a rămâne activ. Un nod are nevoie de cel puțin **80% uptime** și trebuie să continue să trimită dovezi de liveness prin heartbeat la un **interval de 1,000 de blocuri** (aproximativ 54 de minute pe mainnet la timpul mediu de bloc măsurat de circa 3.2 s; aproximativ 17 minute pe testnet, care produce blocuri aproximativ o dată pe secundă).

**Regulile de timp.** Lanțul respinge un heartbeat trimis la **mai puțin de 1,000 de blocuri după cel anterior** (`heartbeat submitted too early`); primul heartbeat după înregistrare nu are o asemenea limită inferioară. Dacă niciun heartbeat nu sosește în **1,000 + 100 de blocuri** (`heartbeat_interval` plus `heartbeat_grace_period`; pe mainnet aproximativ 54 de minute plus o perioadă de grație de circa 5 minute) de la ultimul — sau de la înregistrare, dacă nu ați trimis niciunul — nodul este marcat inactiv și nu mai este creditat. Un heartbeat trimis mai târziu este totuși acceptat și îl reactivează. Daemonul trimite următorul heartbeat de îndată ce au trecut 1,000 de blocuri de la `last_heartbeat`-ul propriu al lanțului pentru nodul dvs., verificând la fiecare 60 de secunde.

**Ratarea ferestrei costă uptime, nu înregistrarea.** Un nod care ratează fereastra este marcat inactiv și încetează să câștige, dar chiar următorul heartbeat reușit îl reactivează — nu este nevoie de re-înregistrare. **Uptime-ul** dvs. este raportul curent dintre heartbeat-urile primite și cele așteptate (unul la fiecare 1,000 de blocuri) de la blocul la care v-ați înregistrat, plafonat la 1. Sub pragul `min_uptime_for_rewards` (`0.80`) un nod nu câștigă nimic; la acest prag sau peste el, plafonul per nod este scalat după uptime-ul dvs. O pană lungă scade așadar raportul, iar acesta se recuperează doar pe măsură ce se acumulează heartbeat-uri la timp. Verificați `status` dacă un nod apare ca inactiv: raportează starea semnatarului, a licenței și a înregistrării.

:::note Ce dovedește de fapt un heartbeat
Un heartbeat reușit dovedește că cheia operatorului a semnat la timp — nu dovedește că un nod rulează continuu software-ul complet. Tratați-l ca pe o semnătură de liveness, nu ca pe o „verificare a unui nod activ”.
:::

:::note `last_heartbeat` este o înălțime de bloc, nu un timestamp
Dacă interogați direct înregistrarea on-chain a unui nod, `last_heartbeat` este o înălțime de bloc, iar o valoare de `0` înseamnă că încă nu a fost înregistrat niciun heartbeat — lanțul măsoară atunci termenul de inactivitate de la înălțimea `registered_at` a nodului. Citirea lui `0` ca un calcul naiv de timp scurs face ca un nod proaspăt înregistrat să pară cu milioane de blocuri întârziat.
:::

*Eligibilitate pentru recompense: dețineți o licență activă on-chain și stake-ul minim bonded, înregistrați-vă, apoi continuați să dovediți liveness prin heartbeat-uri pentru a rămâne peste pragurile de uptime și de interval al heartbeat-ului.*

```mermaid
flowchart LR
    A["Register on-chain"] --> B["Submit heartbeat<br/>liveness proofs"]
    B --> C{"Synced and<br/>proving liveness?"}
    C -- "yes" --> D["Active status<br/>eligible for light-node rewards"]
    C -- "stalled / offline" --> E["Not eligible<br/>(no share)"]
    E --> B
    D --> F["Credited its share<br/>(bounded per node)"]
    F --> G["Claim to the<br/>operator account"]
    G --> D
```

## Cum funcționează recompensele {#how-rewards-work}

### Creditare

La fiecare 100 de blocuri lanțul creditează fiecare nod eligibil (activ, cu cel puțin stake-ul minim delegat și cel puțin uptime-ul minim) cu partea sa din ceea ce s-a acumulat, limitată per nod (cel mult 2,000 QOR la 30 de zile, proporțional cu timpul scurs de la decontarea anterioară) așa cum este descris în [cota de 3% din recompensele pentru light nodes](/light-node/overview#the-3-light-node-reward-share). Suma este adăugată la `accumulated_rewards` al nodului. Citiți-o cu:

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/rewards/<operator-address>
# or: qorechaind query lightnode rewards <operator-address>
```

(Folosiți `https://api-testnet.qore.host` pentru testnet.)

### Revendicare

Recompensele creditate rămân în înregistrarea nodului până când le revendicați. Nodul le poate revendica pentru dvs.: setați `auto_claim = true` sub `[delegation]`, iar daemonul revendică recompensele light-node acumulate în contul operatorului odată ce depășesc `min_reward_claim` (implicit `1000000` uqor, 1 QOR), verificând la fiecare `compound_interval` (implicit `1h`). Semnează revendicarea la fel ca heartbeat-urile (nativ sau prin alternativa `qorechaind`). Auto-revendicarea este **dezactivată implicit** și doar revendică: nodul nu re-delegă și nu mută niciodată stake-ul.

Pentru a revendica manual cu `qorechaind` (cheia operatorului într-un keyring `qorechaind` și cheia post-cuantică exportată cu `lightnode-sx keys export <key-name> --out ~/.qorechaind/pqc/<key-name>.dilithium`), folosiți o pereche generate-then-cosign:

```bash
qorechaind tx lightnode claim-rewards --from operator --chain-id <chain-id> --node https://rpc.qore.host --gas 300000 --fees 30000uqor --generate-only > claim.json
qorechaind tx pqc cosign claim.json --from operator --pqc-key <key-name> --chain-id <chain-id> --node https://rpc.qore.host
```

`qorechaind tx lightnode deregister` elimină înregistrarea și plătește tot ce a rămas creditat; taxa de înregistrare nu este rambursată.

### Urmărirea delegărilor și alertele de reputație

Nodul oglindește delegările contului operatorului din lanț la pornire și apoi la fiecare cinci minute. Când `rebalance_enabled` este activat (implicit), verifică și scorul de reputație al fiecărui validator căruia îi delegați și înregistrează un avertisment pentru oricare sub `min_reputation` (implicit `0.5`). Nu mută stake-ul: modificați delegările din propriul portofel. (Opțiunile `validators` și `split_weights` din `[delegation]` sunt acceptate, dar în prezent nu sunt utilizate.)

### Inspectarea recompenselor și a delegărilor

```bash
lightnode-sx validators   # the bonded validator set
lightnode-sx delegation   # the operator account's delegations, as mirrored by the running daemon
lightnode-sx rewards      # the operator account's pending staking rewards
```

Începând cu 3.1.6, aceste comenzi și vizualizarea UX **Delegation** citesc contul din `operator_address`. `rewards` afișează recompensele de **staking** din delegările dvs., nu recompensele light-node. Pentru a citi totul direct din lanț:

```bash
curl -s https://api.qore.host/cosmos/staking/v1beta1/delegations/<operator-address>
curl -s https://api.qore.host/cosmos/distribution/v1beta1/delegators/<operator-address>/rewards
curl -s https://api.qore.host/qorechain/lightnode/v1/rewards/<operator-address>   # light-node rewards
```

## Monitorizare

Menținerea nodului sănătos este ceea ce îl păstrează eligibil pentru recompense. Există trei lucruri care merită urmărite.

### Telemetrie

Telemetria în timp real acoperă validatorii, consensul/rețeaua, bridge-ul și tokenomics, fiecare fiind reîmprospătat la propriul interval (configurat sub `[telemetry]` în `config.toml`). Din CLI:

```bash
lightnode-sx status    # node and light-client sync status
lightnode-sx network   # recent synced headers and latest height
```

Ediția UX afișează aceleași date live în vizualizările **Overview**, **Network**, **Bridge** și **Tokenomics** — consultați [UX Edition](/light-node/ux-edition).

### Starea de sincronizare și de heartbeat

Comanda `status` raportează ID-ul lanțului, înălțimea celui mai recent bloc, dacă lanțul este în curs de recuperare (catching up), înălțimea sincronizată și starea de sincronizare a light client-ului, `Signer` (nativ, `qorechaind` sau indisponibil, cu motivul) și — odată ce `operator_address` este setat — starea `Licence` și `Registration` (inclusiv statusul nodului și înălțimea ultimului heartbeat). Un nod care este înregistrat, sincronizat și în funcțiune continuă să trimită **dovezi de liveness prin heartbeat** și astfel rămâne eligibil pentru recompense. Aceste heartbeat-uri sunt produse printr-un **pipeline de tranzacții co-semnate PQC** (hibrid Dilithium-5 / ML-DSA-87), în concordanță cu setarea implicită a lanțului care impune PQC — consultați [Registration and Licensing](/light-node/registration-and-licensing#pqc-cosigned-heartbeat-pipeline) pentru modul în care funcționează pipeline-ul și cum își alege nodul semnatarul. Dacă `status` arată nodul blocat sau nesincronizat, este posibil să nu reușească să dovedească liveness — investigați înainte ca eligibilitatea să fie afectată.

### Starea autotestării

Dacă suspectați o problemă cu stiva criptografică, rulați oricând autotestul PQC:

```bash
lightnode-sx selftest
```

Acesta rulează keygen → sign → verify → tamper-detection (cinci verificări) și iese cu cod diferit de zero la orice eșec. Este cea mai rapidă modalitate de a exclude o problemă la stiva de semnare post-cuantică atunci când diagnosticați probleme ale nodului. Consultați [SX Edition](/light-node/sx-edition) pentru detalierea completă a autotestului.

### Interogări ale lanțului {#chain-queries}

URL-uri de bază: `https://api.qore.host` (mainnet) și `https://api-testnet.qore.host` (testnet).

| Interogare | Returnează |
| --- | --- |
| `GET /qorechain/lightnode/v1/params` | Taxa de înregistrare, intervalul și perioada de grație ale heartbeat-ului, stake-ul minim delegat, cota de recompensă, uptime-ul minim, plafonul de noduri. |
| `GET /qorechain/lightnode/v1/stats` | Numărul de noduri înregistrate și active, totalul recompenselor creditate. |
| `GET /qorechain/lightnode/v1/node/{address}` | Înregistrarea unui nod (`status`, `last_heartbeat`, `total_heartbeats`, `expected_heartbeats`, `accumulated_rewards`). |
| `GET /qorechain/lightnode/v1/rewards/{address}` | Recompensele creditate și încă nerevendicate. |
| `GET /qorechain/lightnode/v1/reward_pool` | Cum se împarte soldul modulului între rezervă, recompense creditate și următoarea plată; include limitele per nod (`max_reward_per_month_per_node` și anteriorul `max_reward_per_block_per_node`). |
| `GET /qorechain/license/v1/check/{address}/lightnode_operator` | Dacă o adresă deține o licență activă. |

## Unde continuați

- [Registration and Licensing](/light-node/registration-and-licensing) — înregistrați-vă și rămâneți activ.
- [Tokenomics](/architecture/tokenomics) — modelul complet de recompense și ardere.
