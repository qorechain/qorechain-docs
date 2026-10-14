---
slug: /light-node/sx-edition
title: Ediția SX (Daemon Server)
sidebar_label: Ediția SX
sidebar_position: 2
---

# Ediția SX — Daemon Server

Ediția **SX (Server eXperience)** este light node-ul headless: un daemon plus un CLI complet de administrare, construit pentru servere și automatizare. Binarul este `lightnode-sx`. Aceasta este linia **v3.1.3** a light node-ului pentru binarele precompilate (tag-ul sursă `v3.1.4` pentru build-urile Docker), cu versiune proprie, separată de versiunea lanțului.

## Instalare {#install}

Binarele precompilate sunt calea cea mai simplă — clientul light node rulează nativ pe **șase platforme, fără dependențe native**: Linux (amd64, arm64), macOS (Intel, Apple Silicon) și Windows (amd64, arm64) — în total 12 binare, între edițiile SX și UX. Fiecare binar are aproximativ 11–12 MB — îl descarci și îl rulezi, fără biblioteci separate de instalat.

**Verifică suma de control (checksum) înainte de a-l rula.** Manifestul de release de la `https://download.qore.host/<net>/lightnode/latest.json` conține un `sha256` pentru fiecare binar, un `checksums.url` care indică un fișier `SHA256SUMS` pentru întregul release și `checksums.sha256` al acelui fișier. Verifică ceea ce ai descărcat — aceasta nu este o notă de subsol, ci diferența dintre a rula binarul care a fost efectiv construit și a rula orice a ajuns la acel URL:

```bash
NET=mainnet            # or testnet
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/SHA256SUMS
grep " $F\$" SHA256SUMS | shasum -a 256 -c -    # Linux: sha256sum -c -
chmod +x $F
```

Pe Windows, compară rezultatul `certutil -hashfile lightnode-sx-<platform>.exe SHA256` cu valoarea din manifest. Ambele rețele servesc în prezent același build v3.1.3. Sursa este publică la `github.com/qorechain/qorechain-lightnode` (Apache 2.0).

De asemenea, poți construi binarul din sursă sau îl poți rula cu Docker.

### Construire din sursă

Light node-ul necesită **Go 1.26.1**. Criptografia sa post-cuantică este o implementare pur Go (fără CGO, fără bibliotecă nativă), astfel încât compilarea încrucișată pentru oricare dintre cele șase platforme suportate funcționează la fel ca pentru orice alt binar Go:

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Aceasta produce `build/lightnode-sx`. Rulează-l direct sau copiază-l în `PATH`. Înainte de înregistrare, verifică rapid stiva de semnare post-cuantică cu [`selftest`](#verify-the-pqc-stack-selftest).

### Docker {#docker}

Nu există o imagine precompilată într-un registru; o construiești din tag-ul sursă. Folosește tag-ul **`v3.1.4` sau mai nou**: imaginea construită din `v3.1.3` include un semnatar `qorechaind` mai vechi, pe care lanțul îl refuză acum, astfel că heartbeat-urile și revendicările de recompense eșuează. Pentru a actualiza o instalare existentă, reconstruiește din noul tag (`git fetch --tags && git checkout v3.1.4 && docker compose build --no-cache lightnode-sx`); un simplu pull nu face nimic.

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.4

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring
export QORE_LIGHTNODE_QORECHAIND_PASSPHRASE='...'   # qorechaind keyring (operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: write config.toml and the node key into the data volume.
docker compose run --rm lightnode-sx onboard
# Then set chain_id, key_name, operator_address and [heartbeat] key_name in
# /root/.qorechain-lightnode/config.toml inside the volume (see "First run").

docker compose up -d lightnode-sx
```

Păstrează `QORECHAIN_RPC_ADDR` exportat la fiecare comandă `docker compose`: suprascrie `rpc_addr` din configurație, iar valoarea implicită din compose indică `host.docker.internal:26657`. Containerul SX persistă datele într-un volum numit, montat la `/root/.qorechain-lightnode`.

Imaginea conține și un `qorechaind` publicat oficial (v3.2.0, linux/amd64, descărcat din canalul de release la momentul build-ului și verificat față de un digest fixat). Daemon-ul îl folosește pentru a semna heartbeat-urile și revendicările de recompense, astfel încât un nod în container poate rămâne activ pe lanț fără o a doua instalare. Dacă ulterior o rețea trece la o versiune care refuză semnatarul inclus, indică `[heartbeat] qorechaind_path` către `qorechaind`-ul mai nou listat în manifestul acelei rețele (`https://download.qore.host/<net>/latest.json`). Pe o gazdă arm64 (de exemplu Apple Silicon), build-ul nu are semnatar; construiește cu `DOCKER_DEFAULT_PLATFORM=linux/amd64` dacă ai nevoie de unul. Semnatarul are nevoie de portofelul operatorului: montează home-ul tău `qorechaind` (keyring-ul care conține cheia operatorului, plus cheia nodului exportată sub `pqc/<key_name>.dilithium`) la `/root/.qorechaind`; `docker-compose.yml` montează implicit `~/.qorechaind`, sau setează `QORECHAIND_HOME`. Cele două parole (passphrase) sunt cea a keyring-ului nodului și cea a keyring-ului `qorechaind`; a doua este transmisă către `qorechaind` pe stdin și nu apare niciodată pe o linie de comandă. Vezi [Portofelul operatorului](#operator-wallet).

## Configurare

Light node-ul citește un fișier de configurare TOML. Implicit, caută `config.toml` în directorul home (`~/.qorechain-lightnode/config.toml`). În mod normal nu scrii acest fișier manual — [expertul `onboard`](#first-run-onboard) îl creează pentru tine — dar este util să înțelegi opțiunile.

Doi indicatori (flags) persistenți se aplică fiecărei comenzi:

- `--config <cale>` — indică un fișier de configurare într-o locație nestandard.
- `--home <director>` — suprascrie directorul home folosit pentru date și chei (implicit `~/.qorechain-lightnode`).

Cele mai relevante opțiuni de configurare, la nivel de utilizare:

| Opțiune | Ce controlează |
| --- | --- |
| `chain_id` | Identificatorul rețelei (de exemplu `qorechain-diana` pe testnet, `qorechain-vladi` pe mainnet). Setează-l tu după `onboard`, care lasă `qorechain-diana`; semnatarul îl folosește. |
| `rpc_addr` | Endpoint-ul RPC al lanțului la care se conectează daemon-ul. Lasă-l gol pentru a rula în **modul local-only**. |
| `primary_addr` / `witness_addrs` | Endpoint-ul RPC primar și endpoint-urile martor (witness) față de care headerul raportat de acesta este verificat prin corroborare — vezi [De ce să rulezi un light node](/light-node/overview#why-run-a-light-node). Cel puțin un martor distinct și accesibil este ceea ce mută valoarea `assurance` (jurnalizată la nivel debug) din `trusted-single-source` în `corroborated-across-sources`. |
| `trust_period` / `max_clock_drift` | Acceptate pentru compatibilitate, dar nefolosite în prezent. Încrederea în header provine din corroborarea primar/martor descrisă mai sus. |
| `data_dir` | Unde stochează nodul baza de date și headerele. |
| `keyring_backend` / `key_name` | Backend-ul keyring-ului (`file`, `os` sau `test`, doar pentru devneturi locale) și numele cheii post-cuantice a nodului. Backend-ul `file` necesită `QORE_LIGHTNODE_KEYRING_PASSPHRASE` în mediu. |
| `operator_address` | Contul căruia îi aparține acest nod (`qor1...`); validat la încărcare. Necesar pentru `register`, `status` și heartbeat-uri. Vezi [Portofelul operatorului](#operator-wallet). |
| `api_addr` | Endpoint-ul REST. Dedus din `rpc_addr` când este gol (portul 26657 devine 1317; gazdele `rpc.` devin `api.`), deci este necesar doar pentru endpoint-uri care nu urmează niciuna dintre convenții. |
| `[heartbeat]` | Activ implicit. `qorechaind_path` (gol înseamnă `qorechaind` din `PATH`; imaginea Docker îl include), `qorechaind_home` (gol înseamnă `~/.qorechaind`), `key_name` (cheia de cont `qorechaind`; implicit `key_name` de la nivelul superior), `interval_blocks` (potrivește-l cu `heartbeat_interval` al lanțului, 1000), `check_interval` (implicit `60s`), `fees` (implicit `50000uqor`) și `gas` (implicit `300000`). |
| `[delegation]` | `auto_claim` (dezactivat implicit: revendică recompensele acumulate ale light node-ului în portofelul operatorului prin semnatar; nodul nu re-deleagă niciodată de pe server), intervalul de verificare, recompensa minimă de revendicat, `rebalance_enabled` și `min_reputation` (doar alerte de reputație — nodul nu mută niciodată stake). `validators` și `split_weights` sunt acceptate, dar nu sunt folosite în prezent. |
| `[telemetry]` | Dacă telemetria este activată și intervalele de reîmprospătare pentru validatori, rețea, punte (bridge) și tokenomică. |
| `log_level` / `log_format` | Nivelul de detaliere al jurnalizării (`debug`, `info`, `warn`, `error`) și formatul (`text` sau `json`). |

### Variabile de mediu {#environment-variables}

| Variabilă | Folosită pentru |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | Parola keyring-ului nodului (`keyring_backend = "file"`). Obligatorie; nodul refuză una goală. |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | Parola keyring-ului `qorechaind` care conține cheia operatorului; transmisă către `qorechaind` pe stdin, niciodată pe o linie de comandă. |
| `QORECHAIN_RPC_ADDR` | Suprascrie `rpc_addr` (și `primary_addr` când era egal cu `rpc_addr`). Setată de `docker-compose.yml`. |

:::note Endpoint-urile martor sunt validate la pornire
Un martor aflat pe aceeași gazdă cu endpoint-ul primar este refuzat — un endpoint compromis pur și simplu s-ar confirma pe sine, deci nu corroborează nimic. Un martor `http://` necriptat pe o gazdă la distanță este de asemenea refuzat, deoarece un atacator care poate rescrie acea conexiune poate răspunde ca oricare martor deodată; `http://` pe loopback este acceptabil. Îndreaptă martorii către endpoint-uri RPC în care ai motive independente să ai încredere.
:::

Valorile implicite de delegare activează alertele de reechilibrare bazate pe reputație și lasă `auto_claim` dezactivat — vezi [Recompense și Monitorizare](/light-node/rewards-and-monitoring) pentru ce anume fac acestea.

## Prima rulare: `onboard` {#first-run-onboard}

La prima lansare, `start` se va opri și te va îndruma spre expertul de onboarding dacă nu există încă niciun fișier de configurare. Rulează expertul:

```bash
build/lightnode-sx onboard
```

`onboard` te ghidează prin configurare în patru pași:

1. **Auto-test PQC** — rulează întregul ciclu de test Dilithium-5 (aceleași verificări ca la [`selftest`](#verify-the-pqc-stack-selftest)). Dacă stiva PQC eșuează, expertul refuză să continue.
2. **Endpoint RPC al lanțului** — lipește URL-ul RPC al QoreChain, sau lasă-l gol pentru a rula în **modul local-only** atâta timp cât nu este nevoie de o conexiune la lanț. Dacă furnizezi un URL, expertul testează accesibilitatea în timp real.
3. **Cheia nodului** — expertul o numește „cheia privată a validatorului”, dar este propria cheie Dilithium-5 a light node-ului, nu o cheie de validator. Lipește o cheie privată Dilithium-5 codificată hex, sau tastează `g` (sau `generate`) pentru a genera o pereche de chei nouă pe acest nod.
4. **Salvare** — scrie `config.toml` și stochează cheia în keyring sub numele `validator` (sau `validator-<hex>` dacă acel nume este ocupat). Keyring-ul de tip fișier necesită `QORE_LIGHTNODE_KEYRING_PASSPHRASE` setată în mediu pentru acest pas și pentru fiecare comandă ulterioară care îl deschide.

:::note Modul local-only
Dacă lași endpoint-ul gol, daemon-ul pornește în modul local-only: stiva PQC este exercitată complet, dar nodul nu sincronizează niciun lanț. Rerulează `onboard` odată ce endpoint-ul lanțului tău este pregătit, pentru a îndrepta nodul către el.
:::

`onboard` suprascrie întotdeauna configurația activă. Folosește `--config` pentru a scrie într-o cale nestandard, sau `--non-interactive` pentru a eșua rapid în loc să întrebe (util în CI).

:::caution Finalizează configurația după onboarding
`onboard` nu știe la ce rețea te alături și care cont este al tău. Înainte să rulezi `register` sau să te bazezi pe heartbeat-uri, editează `config.toml`:

```toml
chain_id         = "qorechain-vladi"   # mainnet; testnet is "qorechain-diana". onboard leaves "qorechain-diana".
key_name         = "validator"         # the key onboard created; see `lightnode-sx keys list`
operator_address = "qor1..."           # your funded operator account

[heartbeat]
key_name = "operator"                  # the qorechaind key that holds operator_address
```

`key_name` de la nivelul superior este cheia post-cuantică a nodului (fișierul ei este `pqc/<key_name>.dilithium` în home-ul `qorechaind`); `[heartbeat] key_name` este cheia de cont `qorechaind` care plătește taxa. Dacă lași `key_name = "operator"` în timp ce cheia se numește `validator`, `register` se oprește cu `node key "operator" not found`.
:::

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

## Portofelul operatorului {#operator-wallet}

Cheia Dilithium-5 a nodului **nu** este un portofel. Pe QoreChain, o cheie post-cuantică se atașează unui cont; nu creează unul. De aceea `keys list` nu arată nicio adresă pentru ea. **Adresa operatorului** tău este un cont obișnuit `qor1…`, alimentat cu fonduri și creat cu `qorechaind`, din care este înregistrat nodul și care primește recompensele light node-ului. Cheia nodului devine cheia post-cuantică a acelui cont.

Configurează-l o singură dată:

```bash
# 1. Create and fund the operator account (any Cosmos wallet works; qorechaind shown)
qorechaind keys add operator
qorechaind keys show operator -a          # -> qor1..., fund it with a little QOR for fees

# 2. Tell the node which account it belongs to
#    config.toml:  operator_address = "qor1..."

# 3. Let the node print the two chain commands (attach the key, register the node)
lightnode-sx register
```

`register` afișează, completate cu valorile tale: comanda `qorechaind tx pqc register-key-v2 dilithium5 … hybrid` care atașează cheia nodului la cont (o singură dată), și perechea `tx lightnode register … --generate-only` plus `tx pqc cosign` care înregistrează nodul. Lanțul cere co-semnătura post-cuantică pe fiecare tranzacție, motiv pentru care înregistrarea înseamnă două comenzi, nu una. Înregistrarea necesită, de asemenea, o licență `lightnode_operator` activă pe adresa operatorului; fără ea, lanțul refuză tranzacția. Înregistrarea nu este încă deschisă: vezi [Starea programului de recompense](/light-node/overview#reward-program-status).

## Comenzi de administrare

CLI-ul SX include comenzi pentru inspectarea stării nodului și gestionarea cheilor:

| Comandă | Scop |
| --- | --- |
| `onboard` | Expert interactiv pentru prima rulare. |
| `start` | Rulează daemon-ul. |
| `selftest` | Rulează auto-testul PQC. |
| `status` | Afișează starea nodului și a sincronizării clientului light (ID-ul lanțului, ultima înălțime, starea de recuperare/catch-up) plus liniile `Signer`, `Operator`, `Licence` și `Registration`. |
| `keys create <name>` | Creează o cheie de nod Dilithium-5 nouă și afișează cheia ei publică. |
| `keys list` | Listează cheile din keyring (nume, tip, adresă dacă există, cheie publică). |
| `keys show <name>` | Afișează tipul unei chei și cheia publică completă. |
| `keys import <name> <hex-privkey>` | Importă o cheie privată codificată hex. |
| `keys export <name>` | Exportă o cheie privată în format hex (același format pe care `qorechaind` îl citește din `~/.qorechaind/pqc/`). |
| `register` | Afișează comenzile de lanț care atașează cheia nodului la contul tău de operator și înregistrează nodul — vezi [Înregistrare și Licențiere](/light-node/registration-and-licensing). |
| `validators` | Listează validatorii cu stake activ (bonded). |
| `delegation` | Afișează delegările curente din baza de date locală (vezi limitarea cunoscută din [Recompense și Monitorizare](/light-node/rewards-and-monitoring#how-rewards-work)). |
| `rewards` | Afișează recompensele de staking în așteptare (aceeași limitare). |
| `network` | Afișează telemetria rețelei (headere sincronizate recent) din baza de date locală. |
| `version` | Afișează versiunea binarului. |

Pentru detalii despre staking, recompense și monitorizare, vezi [Recompense și Monitorizare](/light-node/rewards-and-monitoring). Pentru înregistrarea on-chain, vezi [Înregistrare și Licențiere](/light-node/registration-and-licensing).
