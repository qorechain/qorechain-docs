---
slug: /light-node/sx-edition
title: Ediția SX (Daemon Server)
sidebar_label: Ediția SX
sidebar_position: 2
---

# Ediția SX — Daemon Server

Ediția **SX (Server eXperience)** este light node-ul headless: un daemon plus un CLI complet de administrare, construit pentru servere și automatizare. Binarul este `lightnode-sx`. Această pagină descrie light node-ul **3.1.10** (tag-ul sursă `v3.1.10`), care are o linie de versiune proprie, separată de versiunea lanțului.

## Instalare {#install}

Binarele precompilate sunt calea cea mai simplă — clientul light node rulează nativ pe **șase platforme, fără dependențe native**: Linux (amd64, arm64), macOS (Intel, Apple Silicon) și Windows (amd64, arm64) — în total 12 binare, între edițiile SX și UX. Fiecare binar are aproximativ 13 MB — îl descarci și îl rulezi, fără biblioteci separate de instalat. Nodul își semnează singur tranzacțiile pe fiecare dintre aceste platforme, așa că nu este nevoie de nimic altceva (în special, de niciun `qorechaind`) pentru a înregistra și rula un nod.

**Verifică suma de control (checksum) înainte de a-l rula.** Manifestul de release de la `https://download.qore.host/<net>/lightnode/latest.json` conține un `sha256` pentru fiecare binar, un `checksums.url` care indică un fișier `SHA256SUMS` pentru întregul release și `checksums.sha256` al acelui fișier. Verifică ceea ce ai descărcat — aceasta nu este o notă de subsol, ci diferența dintre a rula binarul care a fost efectiv construit și a rula orice a ajuns la acel URL:

```bash
NET=mainnet            # or testnet
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/v3.1.10/$F   # or the artifacts[].url from latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/SHA256SUMS
grep " $F\$" SHA256SUMS | shasum -a 256 -c -    # Linux: sha256sum -c -
chmod +x $F
```

Pe Windows, compară rezultatul `certutil -hashfile lightnode-sx-<platform>.exe SHA256` cu valoarea din manifest. Ambele rețele servesc același build 3.1.10; manifestele acceptă în continuare 3.1.9 (`minCompatible: 3.1.9`). Din 3.1.10, binarele fiecărei versiuni stau sub o cale versionată, `https://download.qore.host/<net>/lightnode/v<version>/<file>`, spre care trimite `artifacts[].url` din manifest; folosește-o în locul copiei neversionate, care poate rămâne în urmă câteva ore. Sursa este publică la `github.com/qorechain/qorechain-lightnode` (Apache 2.0). Un build Android este atașat release-ului GitHub ca previzualizare; nu se înregistrează și nu câștigă recompense.

De asemenea, poți construi binarul din sursă sau îl poți rula cu Docker.

### Construire din sursă

Light node-ul necesită **Go 1.26.1**. Criptografia sa post-cuantică este o implementare pur Go (fără CGO, fără bibliotecă nativă), astfel încât compilarea încrucișată pentru oricare dintre cele șase platforme suportate funcționează la fel ca pentru orice alt binar Go:

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Construiește din tag-ul de release (`git checkout v3.1.10`). Aceasta produce `build/lightnode-sx`. Rulează-l direct sau copiază-l în `PATH`. Înainte de înregistrare, verifică rapid stiva de semnare post-cuantică cu [`selftest`](#verify-the-pqc-stack-selftest).

### Docker {#docker}

Nu există o imagine precompilată într-un registru; o construiești din tag-ul sursă. Folosește tag-ul **`v3.1.10`**. Pentru a actualiza o instalare existentă, reconstruiește din noul tag (`git fetch --tags && git checkout v3.1.10 && docker compose build --no-cache lightnode-sx`); un simplu `docker compose up` sau `restart` refolosește imaginea veche. Cheile, configurația și volumul de date se păstrează.

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.10

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring (node key + operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: the same setup as outside Docker, written into the data volume.
docker compose run --rm lightnode-sx onboard
docker compose run --rm lightnode-sx keys add-operator --recover
docker compose run --rm lightnode-sx register --delegate-to qorvaloper1...

docker compose up -d lightnode-sx
docker compose run --rm lightnode-sx status
```

Păstrează `QORECHAIN_RPC_ADDR` exportat la fiecare comandă `docker compose`: suprascrie `rpc_addr` din configurație, iar valoarea implicită din compose indică `host.docker.internal:26657`. Containerul SX persistă datele, inclusiv keyring-ul, într-un volum numit, montat la `/root/.qorechain-lightnode`.

Nodul semnează nativ în interiorul containerului, deci nu este nevoie de nimic altceva. Imaginea SX conține în continuare și un `qorechaind` publicat oficial (v3.2.0, doar linux/amd64, verificat față de un digest fixat) pentru [alternativa `qorechaind`](/light-node/registration-and-licensing#pqc-cosigned-heartbeat-pipeline): `docker-compose.yml` montează `~/.qorechaind` (sau `QORECHAIND_HOME`) la `/root/.qorechaind` și transmite `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` pentru această cale. Un nod a cărui cheie de operator se află în propriul keyring nu folosește niciuna dintre ele.

## Configurare {#configure}

Light node-ul citește un fișier de configurare TOML. Implicit, caută `config.toml` în directorul home (`~/.qorechain-lightnode/config.toml`). În mod normal nu scrii acest fișier manual — [expertul `onboard`](#first-run-onboard) îl creează pentru tine — dar este util să înțelegi opțiunile.

Doi indicatori (flags) persistenți se aplică fiecărei comenzi:

- `--config <path>` — indică un fișier de configurare într-o locație nestandard.
- `--home <dir>` — suprascrie directorul home folosit pentru date și chei (implicit `~/.qorechain-lightnode`).

Cele mai relevante opțiuni de configurare, la nivel de utilizare:

| Opțiune | Ce controlează |
| --- | --- |
| `chain_id` | Identificatorul rețelei (`qorechain-vladi` pe mainnet, `qorechain-diana` pe testnet). `onboard` îl citește de la endpoint-ul RPC; dacă endpoint-ul nu a putut fi accesat în timpul `onboard`, rămâne valoarea implicită `qorechain-diana` și trebuie să îl setezi tu. Tranzacțiile sunt semnate pentru acest lanț. |
| `rpc_addr` | Endpoint-ul RPC al lanțului la care se conectează daemon-ul. Lasă-l gol pentru a rula în **modul local-only**. |
| `primary_addr` / `witness_addrs` | Endpoint-ul RPC primar și endpoint-urile martor (witness) față de care headerul raportat de acesta este verificat prin corroborare — vezi [De ce să rulezi un light node](/light-node/overview#why-run-a-light-node). Cel puțin un martor distinct și accesibil este ceea ce mută valoarea `assurance` (jurnalizată la nivel debug) din `trusted-single-source` în `corroborated-across-sources`. |
| `trust_period` / `max_clock_drift` | Acceptate pentru compatibilitate, dar nefolosite în prezent. Încrederea în header provine din corroborarea primar/martor descrisă mai sus. |
| `data_dir` | Unde stochează nodul baza de date și headerele. |
| `keyring_backend` / `key_name` | Backend-ul keyring-ului (`file`, `os` sau `test`, doar pentru devneturi locale) și numele cheii post-cuantice cu care semnează nodul. `onboard` setează `key_name` la cheia pe care o creează (`validator`); `keys add-operator` îl schimbă în `operator-pqc` când derivă sau recuperează cheia din cuvintele contului. Backend-ul `file` necesită `QORE_LIGHTNODE_KEYRING_PASSPHRASE` în mediu. |
| `operator_address` | Contul căruia îi aparține acest nod (`qor1...`); validat la încărcare. `keys add-operator` îl completează. Necesar pentru `register`, `status` și heartbeat-uri. Vezi [Portofelul operatorului](#operator-wallet). |
| `api_addr` | Endpoint-ul REST. Dedus din `rpc_addr` când este gol (portul 26657 devine 1317; gazdele `rpc.` devin `api.`), deci este necesar doar pentru endpoint-uri care nu urmează niciuna dintre convenții. |
| `[heartbeat]` | Activ implicit (`enabled`). `interval_blocks` (potrivește-l cu `heartbeat_interval` al lanțului, 1000), `check_interval` (implicit `60s`) și `gas` (implicit `300000`; cu semnarea nativă, taxa este de 0,25 uqor per unitate de gas, adică 75.000 uqor). Folosite doar de alternativa `qorechaind`: `fees` (implicit `50000uqor`), `qorechaind_path` (gol înseamnă `qorechaind` din `PATH`), `qorechaind_home` (gol înseamnă `~/.qorechaind`), `keyring_backend` și `key_name` (cheia `qorechaind` care conține contul de operator; implicit `key_name` de la nivelul superior). |
| `[delegation]` | `auto_claim` (dezactivat implicit: revendică recompensele acumulate ale light node-ului în contul operatorului prin semnatar; nodul nu re-deleagă niciodată de pe server), intervalul de verificare, recompensa minimă de revendicat, `rebalance_enabled` și `min_reputation` (doar alerte de reputație — nodul nu mută niciodată stake). `validators` și `split_weights` sunt acceptate, dar nu sunt folosite în prezent. |
| `[telemetry]` | Dacă telemetria este activată și intervalele de reîmprospătare pentru validatori, rețea, punte (bridge) și tokenomică. |
| `[dashboard]` | API-ul tabloului de bord local. Ediția UX îl servește întotdeauna; ediția SX doar cu `enabled = true`. `bind_addr` (implicit `127.0.0.1:8420`) și `token` (când este setat, fiecare rută `/api` și `/ws` necesită `Authorization: Bearer <token>`). Vezi [Ediția UX](/light-node/ux-edition). |
| `log_level` / `log_format` | Nivelul de detaliere al jurnalizării (`debug`, `info`, `warn`, `error`) și formatul (`text` sau `json`). Chei de nivel superior: pune-le înainte de primul `[table]`. |

### Variabile de mediu {#environment-variables}

| Variabilă | Folosită pentru |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | Parola keyring-ului nodului (`keyring_backend = "file"`), care conține cheia post-cuantică a nodului și cheia contului de operator. Obligatorie pentru fiecare comandă care deschide keyring-ul și pentru `start`; nodul refuză una goală. |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | Doar pentru alternativa `qorechaind`: parola keyring-ului `qorechaind` care conține cheia operatorului; transmisă către `qorechaind` pe stdin, niciodată pe o linie de comandă. |
| `QORECHAIN_RPC_ADDR` | Suprascrie `rpc_addr` (și `primary_addr` când era egal cu `rpc_addr`). Setată de `docker-compose.yml`. |

:::note Endpoint-urile martor sunt validate la pornire
Un martor aflat pe aceeași gazdă cu endpoint-ul primar este refuzat — un endpoint compromis pur și simplu s-ar confirma pe sine, deci nu corroborează nimic. Un martor `http://` necriptat pe o gazdă la distanță este de asemenea refuzat, deoarece un atacator care poate rescrie acea conexiune poate răspunde ca oricare martor deodată; `http://` pe loopback este acceptabil. Îndreaptă martorii către endpoint-uri RPC în care ai motive independente să ai încredere.
:::

Valorile implicite de delegare activează alertele de reechilibrare bazate pe reputație și lasă `auto_claim` dezactivat — vezi [Recompense și Monitorizare](/light-node/rewards-and-monitoring) pentru ce anume fac acestea.

## Prima rulare: `onboard` {#first-run-onboard}

La prima lansare, `start` se va opri și te va îndruma spre expertul de onboarding dacă nu există încă niciun fișier de configurare. Setează mai întâi parola keyring-ului — `onboard` refuză să pornească fără ea, astfel încât nu generează niciodată o cheie pe care nu o poate stoca — apoi rulează expertul:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-sx onboard
```

`onboard` te ghidează prin configurare în patru pași:

1. **Auto-test PQC** — rulează întregul ciclu de test Dilithium-5 (aceleași verificări ca la [`selftest`](#verify-the-pqc-stack-selftest)). Dacă stiva PQC eșuează, expertul refuză să continue.
2. **Endpoint RPC al lanțului** — lipește URL-ul RPC al QoreChain (mainnet `https://rpc.qore.host`, testnet `https://rpc-testnet.qore.host`), sau lasă-l gol pentru a rula în **modul local-only**. Dacă furnizezi un URL, expertul îl testează în timp real și citește din el ID-ul lanțului.
3. **Cheia nodului** — expertul o numește „cheia privată a validatorului”, dar este propria cheie Dilithium-5 a light node-ului, nu o cheie de validator. Lipește o cheie privată Dilithium-5 codificată hex, sau tastează `g` (sau `generate`) pentru a genera o pereche de chei nouă pe acest nod.
4. **Salvare** — scrie `config.toml` (cu endpoint-ul și ID-ul lanțului) și stochează cheia în keyring sub numele `validator` (sau `validator-<hex>` dacă acel nume este ocupat), setând `key_name` la aceasta.

:::note Modul local-only
Dacă lași endpoint-ul gol, daemon-ul pornește în modul local-only: stiva PQC este exercitată complet, dar nodul nu sincronizează niciun lanț. Rerulează `onboard` odată ce endpoint-ul lanțului tău este pregătit, pentru a îndrepta nodul către el.
:::

`onboard` suprascrie întotdeauna configurația activă. Folosește `--config` pentru a scrie într-o cale nestandard, sau `--non-interactive` pentru a eșua rapid în loc să întrebe (util în CI).

:::caution Următorul pas: contul de operator
`onboard` nu știe care cont este al tău. Înainte să rulezi `register`, adaugă contul de operator cu [`keys add-operator`](#operator-wallet). Acesta completează `operator_address` pentru tine. Dacă endpoint-ul nu a putut fi accesat în timpul `onboard`, verifică și că `chain_id` din `config.toml` este `qorechain-vladi` (mainnet) sau `qorechain-diana` (testnet).
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

Cheia Dilithium-5 a nodului **nu** este un portofel. Pe QoreChain, o cheie post-cuantică se atașează unui cont; nu creează unul. De aceea `keys list` nu arată nicio adresă pentru ea. **Adresa operatorului** tău este un cont obișnuit `qor1…` care deține licența și stake-ul, plătește taxele și primește recompensele light node-ului. Trebuie să fie un cont ale cărui cuvinte de recuperare le deții (propriile cuvinte, Keplr sau `qorechaind`); un cont dedicat este cel mai bun. Un portofel custodial din Dashboard nu poate rula un nod decât dacă îi exporți seed-ul. Vezi [Contul operatorului](/light-node/registration-and-licensing#operator-account).

Stochează cheia contului de operator în keyring-ul nodului:

```bash
# The account the licence is for: type its recovery words, then Enter
lightnode-sx keys add-operator --recover

# Or create a new account; its 24 words are shown once
lightnode-sx keys add-operator
```

`keys add-operator`:

- derivă cheia contului din cuvinte exact cum o fac `qorechaind` și Keplr (`m/44'/118'/0'/0/0`), o stochează în keyring ca `operator` și scrie contul în `operator_address` din `config.toml`. Dacă `operator_address` este deja setat la un alt cont, refuză;
- alege cheia post-cuantică cu care semnează nodul, o stochează ca `operator-pqc` și setează `key_name` la aceasta. Dacă contul are deja o cheie post-cuantică — de obicei înregistrată de un portofel din aceleași cuvinte — acea cheie este reconstruită din cuvinte (derivările wallet-adapter și Dashboard, aceleași ca `qorechaind tx pqc recover-key`). Dacă contul nu are niciuna, o cheie este derivată din cuvinte, astfel încât cuvintele restaurează și cheia nodului. Dacă cheia înregistrată a contului este deja cheia curentă a nodului, acea cheie este păstrată. Dacă cheia contului nu poate fi reprodusă din cuvinte, comanda refuză și recomandă un cont dedicat;
- fără `--recover`, creează un cont nou și îi afișează cele 24 de cuvinte o singură dată. Notează-le; sunt singura copie de rezervă. Alimentează contul și cumpără licența pentru adresa lui înainte de înregistrare.

Parola keyring-ului (`QORE_LIGHTNODE_KEYRING_PASSPHRASE`) protejează această cheie, la fel ca pe cheia nodului. Apoi înregistrează:

```bash
lightnode-sx register --delegate-to qorvaloper1...
```

`register` verifică licența, atașează cheia post-cuantică dacă contul nu o are deja, delegă stake-ul lipsă doar dacă numești un validator cu `--delegate-to` și înregistrează nodul; fiecare pas este confirmat într-un bloc înainte de următorul. Vezi [Înregistrare și Licențiere](/light-node/registration-and-licensing) pentru detalii și pentru alternativa `register --print`, destinată operatorilor care păstrează cheia contului într-un keyring `qorechaind`.

## Comenzi de administrare

CLI-ul SX include comenzi pentru inspectarea stării nodului și gestionarea cheilor. Începând cu 3.1.7, binarul UX (`lightnode-ux`) are aceleași comenzi.

| Comandă | Scop |
| --- | --- |
| `onboard` | Expert interactiv pentru prima rulare. |
| `start` | Rulează daemon-ul. |
| `selftest` | Rulează auto-testul PQC. |
| `status` | Afișează starea nodului și a sincronizării clientului light (ID-ul lanțului, ultima înălțime, starea de recuperare/catch-up) plus liniile `Signer` (nativ sau `qorechaind`), `Operator`, `Licence` și `Registration`. |
| `keys create <name>` | Creează o cheie de nod Dilithium-5 nouă și afișează cheia ei publică. |
| `keys list` | Listează cheile din keyring (nume, tip, adresă dacă există, cheie publică). |
| `keys show <name>` | Afișează tipul unei chei și cheia publică completă. |
| `keys import <name> <hex-privkey>` | Importă o cheie privată codificată hex. |
| `keys export <name> [--out <file>]` | Exportă o cheie privată în format hex. `--out` scrie fișierul pe care îl citește `qorechaind --pqc-key` (fără linie nouă la final, mod 0600). |
| `keys add-operator [--recover]` | Stochează cheia contului de operator (nouă sau recuperată din cuvintele sale, citite de la intrarea standard) și alege cheia post-cuantică; completează `operator_address`. Vezi [Portofelul operatorului](#operator-wallet). |
| `register [--delegate-to <qorvaloper>] [--print]` | Înregistrează nodul pe lanț: cheia post-cuantică, stake-ul lipsă, înregistrarea, fiecare confirmată într-un bloc. `--print` afișează în schimb comenzile `qorechaind` — vezi [Înregistrare și Licențiere](/light-node/registration-and-licensing). |
| `validators` | Listează validatorii cu stake activ (bonded). |
| `delegation` | Afișează delegările contului de operator, așa cum sunt reflectate în baza de date locală de daemon-ul în funcțiune. |
| `rewards` | Afișează recompensele de staking în așteptare ale contului de operator (nu recompensele light node-ului; vezi [Recompense și Monitorizare](/light-node/rewards-and-monitoring#how-rewards-work)). |
| `network` | Afișează telemetria rețelei (headere sincronizate recent) din baza de date locală. |
| `version` | Afișează versiunea binarului. |

Pentru detalii despre staking, recompense și monitorizare, vezi [Recompense și Monitorizare](/light-node/rewards-and-monitoring). Pentru înregistrarea on-chain, vezi [Înregistrare și Licențiere](/light-node/registration-and-licensing).
