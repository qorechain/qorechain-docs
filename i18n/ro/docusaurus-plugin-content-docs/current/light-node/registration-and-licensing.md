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

Poți, de asemenea, să înregistrezi un nod și să obții o licență prin QoreChain Dashboard, care oferă un flux ghidat în loc să construiești comenzi de chain manual.

- Înregistrează-ți nodul din **Tools → Node Registration**.
- Obține sau reînnoiește o licență din **Tools → Buy License**.

Fluxul din Dashboard te ghidează prin asocierea cheii tale de operator, alegerea tipului de nod și a rețelei și finalizarea înregistrării on-chain. Folosește-l dacă preferi o interfață grafică în locul CLI-ului sau pentru a gestiona licențierea împreună cu înregistrarea într-un singur loc.

## Unde să mergi mai departe

- [Recompense și monitorizare](/light-node/rewards-and-monitoring) — cum se câștigă, se compune și se monitorizează cota de 3%.
- [Ediția SX](/light-node/sx-edition) — comanda `register` și referința CLI completă.
