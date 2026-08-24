---
slug: /light-node/registration-and-licensing
title: Înregistrare și licențiere
sidebar_label: Înregistrare și licențiere
sidebar_position: 4
---

# Înregistrare și licențiere

Pentru a câștiga [cota de recompensă de 3% pentru nodurile light](/light-node/rewards-and-monitoring), un nod light trebuie să fie **înregistrat on-chain** și trebuie să continue să demonstreze că este activ. Această pagină descrie cum funcționează înregistrarea, cum demonstrează nodul că este viu (liveness) și cum să înregistrezi și să licențiezi un nod prin Dashboard.

## Înregistrarea on-chain

Înregistrarea înscrie nodul tău light pe chain, astfel încât protocolul să știe că există, ce tip este (`sx` sau `ux`) și ce cheie de operator îl controlează. Odată înregistrat și activ, nodul devine eligibil pentru cota de recompensă pentru nodurile light.

### Generarea comenzii de înregistrare

Ediția SX poate afișa comanda exactă de chain pentru a înregistra acest nod. Rulează:

```bash
lightnode-sx register
```

Aceasta citește cheia ta de operator din keyring și afișează o tranzacție `qorechaind` gata de rulare, împreună cu adresa ta de operator, tipul nodului și versiunea. Comanda acceptă două flag-uri opționale:

- `--type` — tipul nodului, `sx` sau `ux` (implicit `sx`).
- `--version` — versiunea nodului de înregistrat (implicit versiunea proprie a binarului).

Comanda afișată înregistrează nodul sub modulul `x/lightnode` on-chain. Trimite-o cu un cont de operator finanțat pe rețeaua la care te alături (testnet `qorechain-diana` sau mainnet `qorechain-vladi`).

:::note
`lightnode-sx register` **afișează** tranzacția de înregistrare pentru ca tu să o examinezi și să o trimiți — nu o difuzează singură. Astfel rămâi tu în control asupra momentului și modului în care este înregistrat nodul.
:::

## Dovezi de liveness prin heartbeat

Doar înregistrarea nu este suficientă pentru a rămâne eligibil. Un nod light înregistrat trebuie să demonstreze continuu că este online prin trimiterea de **dovezi de liveness prin heartbeat**. Aceste heartbeat-uri sunt modul în care chain-ul distinge nodurile active — care sunt eligibile pentru cota de recompensă — de nodurile înregistrate, dar offline.

În practică, asta înseamnă că un nod care este înregistrat și menținut în funcțiune (și sincronizat) își păstrează eligibilitatea, în timp ce un nod care iese offline încetează să mai demonstreze liveness și își pierde eligibilitatea până când revine. Menținerea daemon-ului în funcțiune și sănătos face, prin urmare, parte din câștigarea recompenselor — vezi [Recompense și monitorizare](/light-node/rewards-and-monitoring) pentru cum să urmărești sănătatea heartbeat-ului și a sincronizării.

### Pipeline-ul de heartbeat co-semnat PQC {#pqc-cosigned-heartbeat-pipeline}

QoreChain este **PQC obligatoriu în mod implicit**, așa că tranzacția de liveness prin heartbeat este produsă printr-un pipeline post-cuantic co-semnat, nu printr-o semnătură exclusiv clasică. Daemon-ul construiește heartbeat-ul nesemnat, apoi îl co-semnează cu o semnătură **hibridă Dilithium-5 (ML-DSA-87)** înainte de difuzare — aceeași postură post-cuantică pe care chain-ul o impune pentru fiecare tranzacție. Nodul trimite un heartbeat per fereastră `interval_blocks` (corespunzând parametrului `heartbeat_interval` al chain-ului), reglându-și ritmul după înălțimea blocului pentru a evita respingerile pentru trimitere prematură.

Heartbeat-urile on-chain sunt opționale în daemon: activează secțiunea `[heartbeat]` din configurația nodului (`enabled = true`) și direcționează `qorechaind_path` către un binar `qorechaind`, care execută fluxul de generare-apoi-co-semnare. Când acest lucru nu este configurat, nodul rulează fără a trimite heartbeat-uri on-chain, iar operatorul poate trimite liveness manual cu comenzile de chain afișate.

## Înregistrare și licențiere prin Dashboard

Poți, de asemenea, să pornești un nod și să verifici starea licențierii lui prin pagina **Tools** din QoreChain Dashboard. Rularea nodului și înscrierea în programul de recompense sunt două lucruri diferite, iar Dashboard-ul le păstrează separate, în loc să prezinte un singur flux ghidat de înscriere:

1. **Pornește-ți nodul (Tools → Light Node, pasul 1).** Acest pas nu necesită nicio licență și nicio verificare on-chain de niciun fel, și este afișat fiecărui vizitator înaintea oricărui altceva. Citește manifestul curent al rețelei în timp real și te ghidează prin descărcarea și verificarea binarului, inițializarea nodului cu genesis, direcționarea `config.toml` către peer-ii rețelei și state-sync în loc de sincronizare de la genesis.
2. **Verifică starea ta în programul de recompense (Tools → Light Node).** Înscrierea în cota de recompensă pentru nodurile light este un pas separat, condiționat on-chain: necesită o licență `lightnode_operator` activă, acordată on-chain, un minim de QOR delegat — numărat ca total al tău pe toți validatorii cărora le delegi, nu per validator, și citit în timp real din staking, nu auto-declarat — și o mică taxă de înregistrare on-chain. **Înscrierea nu este deschisă încă**, iar cumpărarea unei licențe prin **Buy License** nu o deschide mai devreme — nu există nimic la care să te înscrii astăzi. Până se deschide, acest tab afișează cerința ca pe o stare de verificat, nu ca pe un formular de trimis. Rulează-ți și sincronizează-ți nodul între timp; timpul de funcționare (uptime) de dinainte ca înscrierea să se deschidă este de așteptat să conteze odată ce aceasta se deschide.
3. **Înregistrează-te odată ce licența ta este acordată on-chain (Tools → Light Node).** O licență cumpărată prin **Buy License** este înregistrată mai întâi pe partea noastră; acordarea care o face recunoscută on-chain este un pas separat, iar înregistrarea este refuzată până când acea acordare are loc. Odată ce s-a întâmplat, acest tab înlocuiește panoul de stare cu un formular de înregistrare: adresa ta de operator (`qor1…`), un moniker și un URL de endpoint public, plus o confirmare a angajamentului de stake.
4. **Confirmă și pune stake-ul (bond).** După ce trimiți, Dashboard-ul afișează un rezumat de confirmare al înregistrării (moniker, adresă de operator, endpoint, intenția de stake, stare). Pune (bond) stake-ul confirmat din adresa ta de operator odată ce eligibilitatea se deschide.

Folosește fluxul din Dashboard dacă preferi o interfață grafică în locul CLI-ului, sau pentru a gestiona licențierea și înregistrarea împreună, într-un singur loc. Comanda `lightnode-sx register` de mai sus rămâne disponibilă pentru oricine preferă să construiască și să examineze tranzacția singur — înregistrarea on-chain și eligibilitatea pentru programul de recompense sunt guvernate de chain în același mod, indiferent de calea folosită.

## Unde să mergi mai departe

- [Recompense și monitorizare](/light-node/rewards-and-monitoring) — cum se câștigă, se compune și se monitorizează cota de 3%.
- [Ediția SX](/light-node/sx-edition) — comanda `register` și referința CLI completă.
