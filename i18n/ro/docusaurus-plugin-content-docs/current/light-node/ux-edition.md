---
slug: /light-node/ux-edition
title: Ediția UX (Dashboard web)
sidebar_label: Ediția UX
sidebar_position: 3
---

# Ediția UX — Dashboard web

Ediția **UX (User eXperience)** rulează același daemon de nod light ca ediția SX, dar adaugă un **dashboard web încorporat** pentru ca tu să poți urmări nodul și rețeaua într-un browser. Binarul este `lightnode-ux`. La fel ca ediția SX, aceasta este linia **v3.1.1** a nodului light (versiunea sa proprie, separată de versiunea chain-ului).

Ediția UX este alegerea potrivită pentru utilizarea pe desktop și pentru operatorii care preferă o interfață vizuală în locul liniei de comandă.

## Instalare

### Construire din sursă

Ediția UX necesită **Go 1.26.1** și se construiește cu CGO activat pentru biblioteca nativă post-cuantică:

```bash
CGO_ENABLED=1 go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

Aceasta produce `build/lightnode-ux`.

### Docker

Serviciul UX se construiește din `Dockerfile.ux`:

```bash
docker compose up lightnode-ux
```

Containerul UX își păstrează datele într-un volum denumit la `/root/.qorechain-lightnode` și citește adresa RPC a chain-ului din variabila de mediu `QORECHAIN_RPC_ADDR`.

## Rulare

Pornește nodul UX:

```bash
build/lightnode-ux start
```

Aceasta lansează împreună daemon-ul și serverul de dashboard încorporat. Ediția UX activează întotdeauna dashboard-ul. La pornire, binarul afișează URL-ul dashboard-ului.

Ediția UX împarte configurarea cu ediția SX: citește același `config.toml` din `~/.qorechain-lightnode` și folosește același keyring Dilithium-5. Dacă nu ai configurat încă nodul, rulează mai întâi asistentul SX (`lightnode-sx onboard`) pentru a scrie configurarea și a importa sau genera cheia ta — vezi [Ediția SX](/light-node/sx-edition).

## Dashboard-ul web pe portul 8420

Dashboard-ul este expus pe **portul 8420**. Acesta este portul pe care imaginea Docker `lightnode-ux` îl declară (`EXPOSE 8420`) și valoarea implicită la care se leagă binarul, așa că atunci când rulezi în Docker, dashboard-ul este publicat pe `8420`:

```
http://localhost:8420
```

:::caution Verifică maparea portului din compose
Unele texte din alte locuri fac referire la portul 8080 pentru dashboard. Valoarea autoritativă este **8420** — aceasta este ceea ce imaginea expune efectiv și la ce se leagă daemon-ul în mod implicit. Dacă îți adaptezi propriul `docker-compose.yml` sau un reverse proxy, mapează la **8420**, nu la 8080.
:::

## Ce afișează dashboard-ul

Dashboard-ul este organizat în următoarele vizualizări:

- **Overview** — înălțimea blocului și starea nodului la o privire.
- **Validators** — setul de validatori legați (bonded).
- **Delegation** — delegările tale curente și împărțirea lor.
- **Network** — telemetria de rețea în direct și header-ele sincronizate recent.
- **Bridge** — telemetria bridge-ului cross-chain.
- **Tokenomics** — telemetria economiei tokenului.
- **Settings** — configurarea efectivă a nodului.

Telemetria se actualizează în timp real, daemon-ul reîmprospătând datele despre validatori, rețea, bridge și tokenomics la intervale independente (configurabile sub `[telemetry]` în `config.toml`).

### Bannerul local-only

Dacă nodul **nu are niciun endpoint RPC de chain configurat**, dashboard-ul rulează în **modul local-only** și afișează un banner proeminent care explică starea: stiva PQC este verificată, dar nodul nu sincronizează niciun chain, așa că înălțimea blocului rămâne la `0`. Bannerul te îndeamnă să rulezi asistentul de onboarding pe gazdă:

```bash
lightnode-sx onboard
```

Asistentul rulează self-test-ul PQC, cere endpoint-ul tău de chain și importă sau generează cheia ta de validator. Odată ce un endpoint este configurat, repornește nodul și dashboard-ul începe să afișeze date de chain în direct.

## Unde să mergi mai departe

- [Înregistrare și licențiere](/light-node/registration-and-licensing) — înregistrează nodul on-chain.
- [Recompense și monitorizare](/light-node/rewards-and-monitoring) — câștigă cota de 3% pentru nodurile light și monitorizează sănătatea nodului.
