---
slug: /light-node/ux-edition
title: Ediția UX (Dashboard web)
sidebar_label: Ediția UX
sidebar_position: 3
---

# Ediția UX — Dashboard web

Ediția **UX (User eXperience)** rulează același daemon de nod light ca ediția SX, dar adaugă un **dashboard web încorporat** pentru ca tu să poți urmări nodul și rețeaua într-un browser. Binarul este `lightnode-ux`. La fel ca ediția SX, se află pe linia de versiune proprie a nodului light, separată de versiunea chain-ului (canalele ambelor rețele purtau 3.1.12 pe 27 octombrie 2026).

Ediția UX este alegerea potrivită pentru utilizarea pe desktop și pentru operatorii care preferă o interfață vizuală în locul liniei de comandă.

## Instalare

Binarele precompilate rulează nativ pe **șase platforme fără nicio dependență nativă** — Linux (amd64, arm64), macOS (Intel, Apple Silicon) și Windows (amd64, arm64) — fiecare de aproximativ 13 MB. Verifică suma de control (checksum) a descărcării față de manifest înainte de a o rula — vezi [Ediția SX](/light-node/sx-edition#install) pentru cum se face.

### Construire din sursă

Ediția UX necesită **Go 1.26.1**. Criptografia sa post-cuantică este o implementare pur-Go (fără CGO, fără bibliotecă nativă):

```bash
go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

Construiește din tag-ul de release pe care îl numește manifestul (astăzi `git checkout v3.1.12`). Aceasta produce `build/lightnode-ux`.

### Docker

Serviciul UX se construiește din `Dockerfile.ux` din depozitul sursă (`github.com/qorechain/qorechain-lightnode`, tag-ul care corespunde manifestului rețelei tale). Containerul are nevoie de un `config.toml` în volumul său de date înainte de a porni. Binarul UX are comenzile de configurare, așa că îl poți crea direct în volum:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

docker compose run --rm lightnode-ux onboard
docker compose run --rm lightnode-ux keys add-operator --recover   # to register this node
docker compose run --rm lightnode-ux register --delegate-to qorvaloper1...
```

În interiorul unui container, dashboard-ul trebuie să asculte pe toate interfețele containerului, așa că setează acest lucru în configurația respectivă (`/root/.qorechain-lightnode/config.toml` din volum) și publică portul pe loopback-ul gazdei exclusiv. Fișierul `docker-compose.yml` livrat publică `8420:8420`, care este accesibil de pe alte mașini; modifică-l:

```toml
[dashboard]
bind_addr = "0.0.0.0:8420"
```

```yaml
# docker-compose.yml, lightnode-ux service
ports:
  - "127.0.0.1:8420:8420"
```

```bash
docker compose up -d lightnode-ux
```

Containerul UX își păstrează datele, inclusiv keyring-ul, într-un volum denumit la `/root/.qorechain-lightnode` și citește adresa RPC a chain-ului din variabila de mediu `QORECHAIN_RPC_ADDR`. Nodul își semnează singur tranzacțiile, așa că un container UX se poate înregistra și poate trimite heartbeat-uri la fel ca ediția SX. Imaginea UX nu include `qorechaind`, așa că alternativa `qorechaind` nu este disponibilă în ea.

## Rulare

Pornește nodul UX:

```bash
build/lightnode-ux start
```

Aceasta lansează împreună daemon-ul și serverul de dashboard încorporat. Ediția UX activează întotdeauna dashboard-ul. La pornire, binarul afișează URL-ul dashboard-ului.

Ediția UX împarte configurarea cu ediția SX: citește același `config.toml` din `~/.qorechain-lightnode` și folosește același keyring, și are aceleași comenzi (`onboard`, `keys`, `register`, `status`, `selftest` și celelalte). Configurarea inițială înseamnă aceiași cinci pași, cu `lightnode-ux` în locul lui `lightnode-sx`:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-ux onboard
lightnode-ux keys add-operator --recover
lightnode-ux register --delegate-to qorvaloper1...
lightnode-ux start
```

Vezi [Ediția SX](/light-node/sx-edition#first-run-onboard) pentru ce face fiecare comandă și [Înregistrare și licențiere](/light-node/registration-and-licensing) pentru cerințe. Daemon-ul din ediția UX semnează și trimite heartbeat-uri la fel ca ediția SX, pe Linux, macOS și Windows. Când `register` este rulat din binarul UX, nodul este înregistrat cu tipul `ux`.

## Dashboard-ul web pe portul 8420

Dashboard-ul este expus pe **portul 8420**. Acesta este portul pe care imaginea Docker `lightnode-ux` îl declară (`EXPOSE 8420`) și valoarea implicită la care se leagă binarul, așa că atunci când rulezi în Docker, dashboard-ul este publicat pe `8420`:

```
http://localhost:8420
```

:::caution Verifică maparea portului din compose
Unele texte din alte locuri fac referire la portul 8080 pentru dashboard. Valoarea autoritativă este **8420** — aceasta este ceea ce imaginea expune efectiv și la ce se leagă daemon-ul în mod implicit. Dacă îți adaptezi propriul `docker-compose.yml` sau un reverse proxy, mapează la **8420**, nu la 8080.
:::

:::caution Protejează dashboard-ul
Dashboard-ul nu are autentificare. Dacă nu setezi `[dashboard] token`, oricine poate ajunge la portul 8420 poate citi configurația, delegările și recompensele tale; nicio cheie privată nu este servită vreodată. Cu un token setat, fiecare rută `/api` și conexiunea `/ws` necesită `Authorization: Bearer <token>` (token-ul pe care QoreX îl trimite când se asociază cu nodul); prin `http` simplu, acel token traversează rețeaua necriptat. Binarul acum **implicit ascultă doar pe loopback** (`127.0.0.1:8420`) în loc de toate interfețele, și afișează un avertisment la pornire dacă l-ai configurat să asculte mai larg — dar avertismentul nu este un refuz. Dacă lărgești în mod deliberat legarea (de exemplu pentru a-l accesa de pe altă mașină, sau pentru că publici portul din Docker), setează un token și pune-l în spatele https (un reverse proxy sau un tunel SSH), în loc să-l expui direct. Conexiunea de telemetrie WebSocket verifică de asemenea `Origin`-ul browserului, întrucât o legare de rețea largă, singură, nu împiedică o altă pagină deschisă în același browser să se conecteze.
:::

## Ce afișează dashboard-ul

Dashboard-ul este organizat în următoarele vizualizări:

- **Overview** — înălțimea blocului și starea nodului la o privire.
- **Validators** — setul de validatori legați (bonded).
- **Delegation** — delegările oglindite din contul tău de operator (`operator_address`).
- **Network** — telemetria de rețea în direct și header-ele sincronizate recent.
- **Bridge** — telemetria bridge-ului cross-chain.
- **Tokenomics** — telemetria economiei tokenului.
- **Settings** — configurarea efectivă a nodului.

De la nodul light 3.1.11, dashboard-ul afișează un banner când nodul găsește o versiune mai nouă (vezi [Ediția SX: actualizarea](/light-node/sx-edition#updating)). API-ul său local oferă aceleași informații la `GET /api/update`.

Telemetria se actualizează în timp real, daemon-ul reîmprospătând datele despre validatori, rețea, bridge și tokenomics la intervale independente (configurabile sub `[telemetry]` în `config.toml`).

### Bannerul local-only

Dacă nodul **nu are niciun endpoint RPC de chain configurat**, dashboard-ul rulează în **modul local-only** și afișează un banner proeminent care explică starea: stiva PQC este verificată, dar nodul nu sincronizează niciun chain, așa că înălțimea blocului rămâne la `0`. Bannerul te îndeamnă să rulezi asistentul de onboarding pe gazdă (menționează `lightnode-sx`; `lightnode-ux onboard` face același lucru):

```bash
lightnode-sx onboard
```

Asistentul rulează self-test-ul PQC, cere endpoint-ul tău de chain și importă sau generează cheia nodului tău. Odată ce un endpoint este configurat, repornește nodul și dashboard-ul începe să afișeze date de chain în direct.

## Unde să mergi mai departe

- [Înregistrare și licențiere](/light-node/registration-and-licensing) — înregistrează nodul on-chain.
- [Recompense și monitorizare](/light-node/rewards-and-monitoring) — cum este creditată și revendicată cota de 3% pentru nodurile light și cum monitorizezi sănătatea nodului.
