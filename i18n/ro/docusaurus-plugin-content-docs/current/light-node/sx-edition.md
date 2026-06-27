---
slug: /light-node/sx-edition
title: Ediția SX (Daemon de server)
sidebar_label: Ediția SX
sidebar_position: 2
---

# Ediția SX — Daemon de server

Ediția **SX (Server eXperience)** este nodul light fără interfață: un daemon plus un CLI complet de management, construit pentru servere și automatizare. Binarul este `lightnode-sx`. Aceasta este linia **v3.1.1** a nodului light (versiunea sa proprie, separată de versiunea chain-ului).

## Instalare

Poți construi binarul din sursă sau îl poți rula cu Docker.

### Construire din sursă

Nodul light necesită **Go 1.26.1** și se construiește cu CGO activat, deoarece criptografia post-cuantică folosește o bibliotecă nativă (`libqorepqc`).

```bash
CGO_ENABLED=1 go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Aceasta produce `build/lightnode-sx`. Rulează-l direct sau copiază-l în `PATH`-ul tău.

### Docker

Este furnizată o configurație Docker. Serviciul SX se construiește din `Dockerfile.sx`:

```bash
docker compose up lightnode-sx
```

Containerul SX își păstrează datele într-un volum denumit montat la `/root/.qorechain-lightnode` și citește adresa RPC a chain-ului din variabila de mediu `QORECHAIN_RPC_ADDR`.

## Configurare

Nodul light citește un fișier de configurare TOML. În mod implicit, caută `config.toml` în directorul home (`~/.qorechain-lightnode/config.toml`). De obicei nu scrii acest fișier manual — [asistentul `onboard`](#first-run-onboard) îl creează pentru tine — dar este util să înțelegi opțiunile.

Două flag-uri persistente se aplică fiecărei comenzi:

- `--config <path>` — indică un fișier de configurare aflat într-o locație non-implicită.
- `--home <dir>` — suprascrie directorul home folosit pentru date și chei (implicit `~/.qorechain-lightnode`).

Cele mai relevante opțiuni de configurare, la nivel de utilizare:

| Opțiune | Ce controlează |
| --- | --- |
| `chain_id` | Identificatorul rețelei (de exemplu `qorechain-diana` pe testnet, `qorechain-vladi` pe mainnet). |
| `rpc_addr` | Endpoint-ul RPC al chain-ului la care se conectează daemon-ul. Lasă gol pentru a rula în **modul local-only**. |
| `primary_addr` / `witness_addrs` | Endpoint-urile RPC primar și martor folosite de light client-ul cu sărituri (skipping). |
| `trust_period` / `max_clock_drift` | Fereastra de încredere a light client-ului (de exemplu `168h`) și deriva de ceas permisă. |
| `data_dir` | Unde stochează nodul baza de date și header-ele. |
| `keyring_backend` / `key_name` | Backend-ul keyring (`file` sau `os`) și numele cheii de operator. |
| `[delegation]` | Auto-compunere pornit/oprit, intervalul de compunere, recompensa minimă de revendicat, setul de validatori, ponderile de împărțire, reechilibrarea și reputația minimă. |
| `[telemetry]` | Dacă telemetria este activată și intervalele de reîmprospătare pentru validatori, rețea, bridge și tokenomics. |
| `log_level` / `log_format` | Nivelul de detaliu al jurnalizării (`debug`, `info`, `warn`, `error`) și formatul (`text` sau `json`). |

Valorile implicite pentru delegare activează auto-compunerea la un interval de `1h` și reechilibrarea conștientă de reputație — vezi [Recompense și monitorizare](/light-node/rewards-and-monitoring) pentru ce fac acestea.

## Prima rulare: `onboard` {#first-run-onboard}

La prima lansare, `start` se va opri și te va îndruma către asistentul de onboarding dacă nu există încă niciun fișier de configurare. Rulează asistentul:

```bash
build/lightnode-sx onboard
```

`onboard` te ghidează prin configurare în patru pași:

1. **Self-test PQC** — rulează roundtrip-ul complet Dilithium-5 (aceleași verificări ca [`selftest`](#verify-the-pqc-stack-selftest)). Dacă stiva PQC eșuează, asistentul refuză să continue.
2. **Endpoint RPC al chain-ului** — lipește URL-ul tău RPC QoreChain sau lasă-l gol pentru a rula în **modul local-only** cât timp nu este necesară nicio conexiune la chain. Dacă furnizezi un URL, asistentul testează accesibilitatea în direct.
3. **Cheia privată a validatorului** — lipește o cheie privată Dilithium-5 codificată hex sau tastează `g` (sau `generate`) pentru a genera o nouă pereche de chei pe acest nod.
4. **Salvare** — scrie `config.toml` și stochează cheia în keyring.

:::note Modul local-only
Dacă lași endpoint-ul gol, daemon-ul pornește în modul local-only: stiva PQC este exersată complet, dar nodul nu sincronizează niciun chain. Rulează din nou `onboard` odată ce endpoint-ul tău de chain este pregătit, pentru a direcționa nodul către acesta.
:::

`onboard` suprascrie întotdeauna configurarea activă. Folosește `--config` pentru a scrie într-o cale non-implicită sau `--non-interactive` pentru a eșua rapid în loc să afișeze prompturi (util în CI).

## Rulare: `start`

Odată ce onboarding-ul a scris o configurație, pornește daemon-ul:

```bash
build/lightnode-sx start
```

Daemon-ul sincronizează header-ele, urmărește delegările și servește telemetrie până când este întrerupt. Dacă vrei intenționat să pornești fără un fișier de configurare (local-only, fără RPC de chain), folosește `--skip-onboarding-check`.

## Verificarea stivei PQC: `selftest` {#verify-the-pqc-stack-selftest}

În orice moment poți confirma că stiva post-cuantică este funcțională:

```bash
lightnode-sx selftest
```

`selftest` rulează cinci verificări împotriva Dilithium-5 (ML-DSA-87) și se finalizează în mai puțin de o secundă:

1. **Keygen** — generează o nouă pereche de chei.
2. **Sign** — semnează un mesaj de test.
3. **Verify (semnătură validă)** — confirmă că semnătura se verifică cu cheia publică corespunzătoare.
4. **Respingerea semnăturii modificate** — inversează un octet al semnăturii; verificarea trebuie să o respingă.
5. **Respingerea mesajului modificat** — inversează un octet al mesajului; verificarea trebuie să-l respingă.

Dacă vreo verificare eșuează, binarul iese cu cod diferit de zero, cu ieșire de diagnostic. Acesta este același test pe care asistentul de onboarding îl rulează ca prim pas și este util pentru verificarea înainte de deployment și pentru diagnosticele de suport.

## Comenzi de management

CLI-ul SX include comenzi pentru inspectarea stării nodului și gestionarea cheilor:

| Comandă | Scop |
| --- | --- |
| `status` | Afișează starea de sincronizare a nodului și a light client-ului (ID-ul chain-ului, ultima înălțime, starea de recuperare). |
| `keys create <name>` | Creează o nouă cheie Dilithium-5. |
| `keys list` | Listează cheile din keyring. |
| `keys import <name> <hex-privkey>` | Importă o cheie privată codificată hex. |
| `keys export <name>` | Exportă o cheie privată în hex. |
| `register` | Afișează comanda de înregistrare on-chain pentru acest nod — vezi [Înregistrare și licențiere](/light-node/registration-and-licensing). |
| `validators` | Listează validatorii legați (bonded). |
| `delegation` | Afișează delegările curente din baza de date locală. |
| `rewards` | Afișează recompensele de staking în așteptare. |
| `network` | Afișează telemetria de rețea (header-ele sincronizate recent) din baza de date locală. |
| `version` | Afișează versiunea binarului. |

Pentru detalii despre staking, recompense și monitorizare, vezi [Recompense și monitorizare](/light-node/rewards-and-monitoring). Pentru înregistrarea on-chain, vezi [Înregistrare și licențiere](/light-node/registration-and-licensing).
