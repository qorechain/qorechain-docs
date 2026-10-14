---
slug: /light-node/registration-and-licensing
title: Înregistrare și licențiere
sidebar_label: Înregistrare și licențiere
sidebar_position: 4
---

# Înregistrare și licențiere

Pentru a câștiga [cota de recompensă de 3% pentru nodurile light](/light-node/rewards-and-monitoring), un nod light trebuie să fie **înregistrat on-chain** și trebuie să continue să demonstreze că este activ. Această pagină descrie cum funcționează înregistrarea, cum demonstrează nodul că este viu (liveness) și cum să licențiezi un nod prin Dashboard și să îl înregistrezi on-chain.

:::note Înregistrarea în programul de recompense nu este încă deschisă
Nicio licență `lightnode_operator` nu a fost acordată pe vreuna dintre rețele și niciun nod nu este înregistrat, așa că chain-ul refuză astăzi orice înregistrare. Rularea și sincronizarea unui nod nu necesită licență. Vezi [Starea programului de recompense](/light-node/overview#reward-program-status) pentru cum verifici starea curentă.
:::

## Înregistrarea on-chain

Înregistrarea înscrie nodul tău light pe chain, astfel încât protocolul să știe că există, ce tip este (`sx` sau `ux`) și ce cheie de operator îl controlează. Odată înregistrat și activ, nodul devine eligibil pentru cota de recompensă pentru nodurile light.

### Cerințe {#requirements}

Chain-ul verifică toate acestea atunci când se execută tranzacția ta de înregistrare:

1. O licență `lightnode_operator` activă pe adresa operatorului.
2. Cel puțin **1.000 QOR delegați (bonded)** către validatori de la aceeași adresă (totalul tău pe toți validatorii). Delegă **înainte** de a te înregistra: din pagina de staking a Dashboard-ului sau cu `qorechaind tx staking delegate` (și cu co-semnătura post-cuantică, ca orice tranzacție).
3. Un sold în contul operatorului pentru a plăti taxa de înregistrare de **1 QOR** și taxele de tranzacție. Daemon-ul plătește o taxă pentru fiecare heartbeat din acest cont (implicit `50000uqor` per heartbeat, `[heartbeat] fees`).
4. Mai puțin de 10.000 de noduri light înregistrate la nivelul întregii rețele.

### Generarea comenzilor de înregistrare

Înregistrarea se face de la **adresa ta de operator**: un cont `qor1…` finanțat, creat cu `qorechaind` (sau cu orice portofel Cosmos), care primește și recompensele. Cheia Dilithium-5 a nodului nu are adresă; ea devine cheia post-cuantică a contului. Pune adresa în `config.toml` ca `operator_address` și asigură-te că `key_name` și `chain_id` sunt setate așa cum este descris în [Prima rulare](/light-node/sx-edition#first-run-onboard) (`onboard` nu le setează corect în locul tău). Apoi rulează:

```bash
lightnode-sx register
```

Înainte de a afișa orice, comanda întreabă chain-ul dacă `operator_address` deține o licență `lightnode_operator` activă. O face pentru că chain-ul refuză o înregistrare fără ea și nu are rost să ți se dea comenzi care vor fi refuzate. Fără licență, se oprește cu:

```text
operator address qor1... has no lightnode_operator licence. Buy one at
https://dashboard.qorechain.io -> Tools -> Buy License, and enter this operator
address there; the on-chain grant follows and register works once it lands.
```

O licență cumpărată în Dashboard este acordată on-chain într-un pas separat, așa că `register` poate spune în continuare „no licence” o vreme după achiziție; `lightnode-sx status` afișează aceeași linie `Licence:` și trece pe `active` când acordarea ajunge. Un nod care este deja înregistrat este raportat ca atare, în loc să fie înregistrat de două ori.

Cu o licență activă, comanda citește cheia nodului din keyring și afișează, completate cu valorile tale:

1. **O singură dată**, comanda care atașează cheia nodului la contul operatorului ca cheie post-cuantică a acestuia (`qorechaind tx pqc register-key-v2 dilithium5 <pubkey> hybrid --from operator …`), după exportarea cheii în directorul de chei al `qorechaind` cu `lightnode-sx keys export`. Sari peste ea dacă contul are deja o cheie post-cuantică (`GET /qorechain/pqc/v1/account/<address>` răspunde `found: true`). Dacă limita de gas afișată se epuizează, repet-o cu `--gas 600000 --fees 60000uqor`.
2. Înregistrarea propriu-zisă: `qorechaind tx lightnode register <type> <version> --from operator --generate-only > register.json`, apoi `qorechaind tx pqc cosign register.json --from operator --pqc-key <key>`. Chain-ul cere co-semnătura post-cuantică pe fiecare tranzacție, așa că înregistrarea este o pereche generare-apoi-co-semnare.

Comanda acceptă două flag-uri opționale:

- `--type` — tipul nodului, `sx` sau `ux` (implicit `sx`).
- `--version` — versiunea nodului de înregistrat (implicit versiunea proprie a binarului).

Trimite pe rețeaua la care te alături (testnet `qorechain-diana` sau mainnet `qorechain-vladi`). Înregistrarea necesită o licență `lightnode_operator` activă, acordată pe adresa operatorului; în caz contrar, chain-ul o refuză.

:::note
`lightnode-sx register` **afișează** comenzile pentru ca tu să le examinezi și să le rulezi — nu difuzează nimic singură. Astfel rămâi tu în control asupra momentului și modului în care este înregistrat nodul.
:::

## Dovezi de liveness prin heartbeat

Doar înregistrarea nu este suficientă pentru a rămâne eligibil. Un nod light înregistrat trebuie să demonstreze continuu că este online prin trimiterea de **dovezi de liveness prin heartbeat**. Aceste heartbeat-uri sunt modul în care chain-ul distinge nodurile active — care sunt eligibile pentru cota de recompensă — de nodurile înregistrate, dar offline.

În practică, asta înseamnă că un nod care este înregistrat și menținut în funcțiune (și sincronizat) își păstrează eligibilitatea, în timp ce un nod care iese offline încetează să mai demonstreze liveness și își pierde eligibilitatea până când revine. Menținerea daemon-ului în funcțiune și sănătos face, prin urmare, parte din câștigarea recompenselor — vezi [Recompense și monitorizare](/light-node/rewards-and-monitoring) pentru cum să urmărești sănătatea heartbeat-ului și a sincronizării.

### Pipeline-ul de heartbeat co-semnat PQC {#pqc-cosigned-heartbeat-pipeline}

QoreChain este **PQC obligatoriu în mod implicit**, așa că tranzacția de liveness prin heartbeat este produsă printr-un pipeline post-cuantic co-semnat, nu printr-o semnătură exclusiv clasică. Daemon-ul construiește heartbeat-ul nesemnat, apoi îl co-semnează cu o semnătură **hibridă Dilithium-5 (ML-DSA-87)** înainte de difuzare — aceeași postură post-cuantică pe care chain-ul o impune pentru fiecare tranzacție. Nodul trimite un heartbeat per fereastră `interval_blocks` (corespunzând parametrului `heartbeat_interval` al chain-ului), reglându-și ritmul după înălțimea blocului pentru a evita respingerile pentru trimitere prematură.

Heartbeat-urile on-chain sunt activate implicit. Daemon-ul are nevoie de: `operator_address` în configurație; un binar `qorechaind` **v3.2.0 sau mai nou** (în `PATH` sau la `[heartbeat] qorechaind_path`; imaginea Docker SX construită din tag-ul `v3.1.4` include unul — semnatarii mai vechi sunt refuzați de chain); și home-ul `qorechaind` care conține cheia operatorului și cheia exportată a nodului (`qorechaind_home`, implicit `~/.qorechaind`). Două parole de keyring își au locul în mediu: `QORE_LIGHTNODE_KEYRING_PASSPHRASE` pentru keyring-ul nodului și `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` pentru keyring-ul `qorechaind` (a doua este transmisă către `qorechaind` pe stdin, niciodată plasată pe linia de comandă). `qorechaind` este publicat **doar pentru Linux amd64** (vezi intrarea `binary` din `https://download.qore.host/mainnet/latest.json`), așa că pe gazde macOS, Windows sau ARM nodul rulează și se sincronizează, dar nu poate semna nativ heartbeat-uri; un nod înregistrat ar trebui să ruleze ediția SX pe Linux amd64 sau imaginea Docker pe o gazdă amd64. Își reglează ritmul după `last_heartbeat` al chain-ului pentru acel nod, așa că o repornire nici nu trimite un duplicat, nici nu așteaptă un interval întreg. Până când nodul este înregistrat, nu trimite heartbeat; în schimb loghează motivul, o dată la fiecare schimbare de stare: lipsa licenței (cu indicația unde se poate cumpăra una) sau licență activă, dar nod neînregistrat (rulează `lightnode-sx register`). `lightnode-sx status` afișează liniile `Signer:`, `Licence:` și `Registration:`, astfel încât motivul să fie vizibil fără a citi log-urile. Când lipsește semnatarul, nodul rulează și se sincronizează în continuare; doar că nu poate rămâne activ pe chain, iar `status` spune acest lucru.

## Înregistrare și licențiere prin Dashboard

Poți verifica starea licențierii și poți păstra detaliile nodului tău în tab-ul **Tools → Light Node** din QoreChain Dashboard. Rularea unui nod și înscrierea în programul lui de recompense sunt două lucruri diferite, iar Dashboard-ul le păstrează separate:

1. **Obține software-ul (nu este nevoie de licență).** Tab-ul oferă linkuri către binarele nodului light pentru rețeaua selectată (aceleași fișiere ca `https://download.qore.host/<net>/lightnode/latest.json`, cu sumele lor de control sha256) și afișează un pachet de punere în funcțiune pentru un nod QoreChain complet. Un nod light are nevoie doar de binarul `lightnode-sx` sau `lightnode-ux` și de un endpoint RPC; urmează [Ediția SX](/light-node/sx-edition).
2. **Verifică starea ta în programul de recompense.** Înscrierea în cota de recompensă pentru nodurile light este un pas separat, condiționat on-chain: o licență `lightnode_operator` activă, acordată on-chain, cel puțin 1.000 QOR delegați (totalul tău pe toți validatorii, citit în timp real din staking) și o taxă de înregistrare de 1 QOR. **Înscrierea nu este deschisă încă** (vezi [Starea programului de recompense](/light-node/overview#reward-program-status)), iar cumpărarea unei licențe nu o deschide mai devreme. Uptime-ul se numără de la blocul în care nodul tău se înregistrează on-chain, nu mai devreme.
3. **Licența.** O licență cumpărată prin **Buy License** este înregistrată mai întâi pe partea noastră; acordarea care o face recunoscută on-chain este un pas separat, iar chain-ul refuză o înregistrare până când aceasta ajunge. Achiziția necesită adresa `qor1…` căreia i se va acorda licența și afișează **Paid — awaiting on-chain grant** până când chain-ul o confirmă. `lightnode-sx status` afișează linia `Licence:` de pe chain.
4. **Înregistrarea în evidență.** Dacă contul tău deține o licență înregistrată ca activă, tab-ul afișează și un scurt formular (adresa operatorului, moniker, URL-ul endpoint-ului public și o confirmare a angajamentului de stake), urmat de un rezumat al celor trimise. Acesta înregistrează cererea ta în Dashboard; **nu** trimite tranzacția de înregistrare on-chain.
5. **Înregistrează-te on-chain.** Odată ce licența este acordată și 1.000 QOR sunt delegați de la adresa ta de operator, înregistrează-te cu `lightnode-sx register` și cu comenzile `qorechaind` pe care le afișează (vezi mai sus).

Dashboard-ul este util pentru descărcarea nodului, verificarea cerințelor chain-ului și a sănătății nodului tău și cumpărarea unei licențe. Înregistrarea on-chain propriu-zisă este întotdeauna tranzacția `lightnode-sx register`.

## Unde să mergi mai departe

- [Recompense și monitorizare](/light-node/rewards-and-monitoring) — cum se creditează, se revendică și se monitorizează cota de 3%.
- [Ediția SX](/light-node/sx-edition) — comanda `register` și referința CLI completă.
