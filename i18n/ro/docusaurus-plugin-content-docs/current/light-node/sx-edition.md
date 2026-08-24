---
slug: /light-node/sx-edition
title: Ediția SX (Daemon Server)
sidebar_label: Ediția SX
sidebar_position: 2
---

# Ediția SX — Daemon Server

Ediția **SX (Server eXperience)** este light node-ul headless: un daemon plus un CLI complet de administrare, construit pentru servere și automatizare. Binarul este `lightnode-sx`. Aceasta este linia **v3.1.1** a light node-ului (versiune proprie, separată de versiunea lanțului).

## Instalare

Binarele precompilate sunt calea cea mai simplă — clientul light node rulează nativ pe **cinci platforme, fără dependențe native**: Linux (amd64, arm64), macOS (Intel, Apple Silicon) și Windows (amd64, arm64). Fiecare binar are aproximativ 16 MB — îl descarci și îl rulezi, fără biblioteci separate de instalat.

De asemenea, poți construi binarul din sursă sau îl poți rula cu Docker.

### Construire din sursă

Light node-ul necesită **Go 1.26.1**. Criptografia sa post-cuantică este o implementare pur Go (fără CGO, fără bibliotecă nativă), astfel încât compilarea încrucișată pentru oricare dintre cele cinci platforme suportate funcționează la fel ca pentru orice alt binar Go:

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Aceasta produce `build/lightnode-sx`. Rulează-l direct sau copiază-l în `PATH`. Înainte de înregistrare, verifică rapid stiva de semnare post-cuantică cu [`selftest`](#verify-the-pqc-stack-selftest).

### Docker

Este furnizată o configurație Docker. Serviciul SX se construiește din `Dockerfile.sx`:

```bash
docker compose up lightnode-sx
```

Containerul SX persistă datele într-un volum numit, montat la `/root/.qorechain-lightnode`, și citește adresa RPC a lanțului din variabila de mediu `QORECHAIN_RPC_ADDR`.

## Configurare

Light node-ul citește un fișier de configurare TOML. Implicit, caută `config.toml` în directorul home (`~/.qorechain-lightnode/config.toml`). În mod normal nu scrii acest fișier manual — [expertul `onboard`](#first-run-onboard) îl creează pentru tine — dar este util să înțelegi opțiunile.

Doi indicatori (flags) persistenți se aplică fiecărei comenzi:

- `--config <cale>` — indică un fișier de configurare într-o locație nestandard.
- `--home <director>` — suprascrie directorul home folosit pentru date și chei (implicit `~/.qorechain-lightnode`).

Cele mai relevante opțiuni de configurare, la nivel de utilizare:

| Opțiune | Ce controlează |
| --- | --- |
| `chain_id` | Identificatorul rețelei (de exemplu `qorechain-diana` pe testnet, `qorechain-vladi` pe mainnet). |
| `rpc_addr` | Endpoint-ul RPC al lanțului la care se conectează daemon-ul. Lasă-l gol pentru a rula în **modul local-only**. |
| `primary_addr` / `witness_addrs` | Endpoint-urile RPC primar și martor folosite de clientul light care sare peste headere (skipping light client). |
| `trust_period` / `max_clock_drift` | Fereastra de încredere a clientului light (de exemplu `168h`) și deriva de ceas permisă. |
| `data_dir` | Unde stochează nodul baza de date și headerele. |
| `keyring_backend` / `key_name` | Backend-ul keyring-ului (`file` sau `os`) și numele cheii operatorului. |
| `[delegation]` | Auto-compunere activă/inactivă, interval de compunere, recompensa minimă de revendicat, setul de validatori, ponderile de împărțire, reechilibrarea și reputația minimă. |
| `[telemetry]` | Dacă telemetria este activată și intervalele de reîmprospătare pentru validatori, rețea, punte (bridge) și tokenomică. |
| `log_level` / `log_format` | Nivelul de detaliere al jurnalizării (`debug`, `info`, `warn`, `error`) și formatul (`text` sau `json`). |

Valorile implicite de delegare activează auto-compunerea la un interval de `1h` și reechilibrarea bazată pe reputație — vezi [Recompense și Monitorizare](/light-node/rewards-and-monitoring) pentru ce anume fac acestea.

## Prima rulare: `onboard` {#first-run-onboard}

La prima lansare, `start` se va opri și te va îndruma spre expertul de onboarding dacă nu există încă niciun fișier de configurare. Rulează expertul:

```bash
build/lightnode-sx onboard
```

`onboard` te ghidează prin configurare în patru pași:

1. **Auto-test PQC** — rulează întregul ciclu de test Dilithium-5 (aceleași verificări ca la [`selftest`](#verify-the-pqc-stack-selftest)). Dacă stiva PQC eșuează, expertul refuză să continue.
2. **Endpoint RPC al lanțului** — lipește URL-ul RPC al QoreChain, sau lasă-l gol pentru a rula în **modul local-only** atâta timp cât nu este nevoie de o conexiune la lanț. Dacă furnizezi un URL, expertul testează accesibilitatea în timp real.
3. **Cheia privată a validatorului** — lipește o cheie privată Dilithium-5 codificată hex, sau tastează `g` (sau `generate`) pentru a genera o pereche de chei nouă pe acest nod.
4. **Salvare** — scrie `config.toml` și stochează cheia în keyring.

:::note Modul local-only
Dacă lași endpoint-ul gol, daemon-ul pornește în modul local-only: stiva PQC este exercitată complet, dar nodul nu sincronizează niciun lanț. Rerulează `onboard` odată ce endpoint-ul lanțului tău este pregătit, pentru a îndrepta nodul către el.
:::

`onboard` suprascrie întotdeauna configurația activă. Folosește `--config` pentru a scrie într-o cale nestandard, sau `--non-interactive` pentru a eșua rapid în loc să întrebe (util în CI).

## Rulare: `start`

Odată ce onboarding-ul a scris o configurație, pornește daemon-ul:

```bash
build/lightnode-sx start
```

Daemon-ul sincronizează headerele, urmărește delegările și servește telemetrie până este întrerupt. Dacă vrei intenționat să pornești fără un fișier de configurare (local-only, fără RPC de lanț), transmite `--skip-onboarding-check`.

## Verificarea stivei PQC: `selftest` {#verify-the-pqc-stack-selftest}

În orice moment poți confirma că stiva post-cuantică este funcțională:

```bash
lightnode-sx selftest
```

`selftest` rulează cinci verificări față de Dilithium-5 (ML-DSA-87) și se finalizează în mai puțin de o secundă:

1. **Generare chei** — generează o pereche de chei nouă.
2. **Semnare** — semnează un mesaj de test.
3. **Verificare (semnătură validă)** — confirmă că semnătura se verifică cu cheia publică corespunzătoare.
4. **Respinge semnătura alterată** — inversează un octet din semnătură; verificarea trebuie să o respingă.
5. **Respinge mesajul alterat** — inversează un octet din mesaj; verificarea trebuie să îl respingă.

Dacă vreo verificare eșuează, binarul iese cu cod diferit de zero și afișează informații de diagnostic. Acesta este exact testul pe care îl rulează expertul de onboarding ca prim pas, și este util pentru verificarea pre-implementare și pentru diagnosticele de suport.

## Comenzi de administrare

CLI-ul SX include comenzi pentru inspectarea stării nodului și gestionarea cheilor:

| Comandă | Scop |
| --- | --- |
| `status` | Afișează starea nodului și a sincronizării clientului light (ID-ul lanțului, ultima înălțime, starea de recuperare/catch-up). |
| `keys create <name>` | Creează o cheie Dilithium-5 nouă. |
| `keys list` | Listează cheile din keyring. |
| `keys import <name> <hex-privkey>` | Importă o cheie privată codificată hex. |
| `keys export <name>` | Exportă o cheie privată în format hex. |
| `register` | Afișează comanda de înregistrare on-chain pentru acest nod — vezi [Înregistrare și Licențiere](/light-node/registration-and-licensing). |
| `validators` | Listează validatorii cu stake activ (bonded). |
| `delegation` | Afișează delegările curente din baza de date locală. |
| `rewards` | Afișează recompensele de staking în așteptare. |
| `network` | Afișează telemetria rețelei (headere sincronizate recent) din baza de date locală. |
| `version` | Afișează versiunea binarului. |

Pentru detalii despre staking, recompense și monitorizare, vezi [Recompense și Monitorizare](/light-node/rewards-and-monitoring). Pentru înregistrarea on-chain, vezi [Înregistrare și Licențiere](/light-node/registration-and-licensing).
