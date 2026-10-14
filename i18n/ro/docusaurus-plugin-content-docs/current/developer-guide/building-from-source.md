---
slug: /developer-guide/building-from-source
title: Compilare din sursă
sidebar_label: Compilare din sursă
sidebar_position: 1
---

# Compilare din sursă

Acest ghid vă parcurge procesul de compilare a binarului comunitar `qorechaind` din sursa publică și explică pentru ce este și pentru ce nu este destinat acest binar.

:::caution Un build din sursă nu se poate alătura mainnetului sau testnetului
Repository-ul public conține interfețele modulelor cu **keeperi stub**; implementările keeperilor critice pentru consens și semnatarul post-cuantic nu se află în arborele public de surse. Un binar compilat din el nu poate reproduce starea de consens a rețelelor și nu poate crea semnătura hibridă post-cuantică pe care o cere fiecare tranzacție de pe lane-ul Cosmos. Pentru a rula un nod sau un validator pe mainnet sau testnet, instalați **binarul de release** indicat în manifestul live (`https://download.qore.host/mainnet/latest.json` sau `.../testnet/latest.json`); consultați [Running a Node](/developer-guide/running-a-node) și [Running a Validator](/developer-guide/running-a-validator).
:::

## Cerințe preliminare

| Dependință          | Versiune minimă           | Note                                              |
| ------------------- | -------------------------- | -------------------------------------------------- |
| **Go**              | 1.26+                      | Necesar pentru toate build-urile                   |
| **CGO**             | Activat (`CGO_ENABLED=1`)  | Necesar pentru punțile FFI PQC și SVM              |
| **Make**            | 3.81+                      | Automatizarea build-ului                           |
| **Git**             | 2.x                        | Preluarea (checkout) sursei                        |

Verificați mediul de lucru:

```bash
go version        # go1.26.x or later
echo $CGO_ENABLED # must be 1
```

:::danger
Fiecare invocare `go build`, `go test` și `go run` **trebuie** să aibă `CGO_ENABLED=1` setat. Nodul leagă biblioteci native (runtime-ul CosmWasm și, în build-ul de release, bibliotecile PQC și SVM) prin cgo.
:::

## Biblioteci native

### libqorepqc și libqoresvm

Bibliotecile post-cuantică (`libqorepqc`) și SVM (`libqoresvm`) sunt construite din surse Rust care **nu fac parte din repository-ul public** (nu există un director `rust/` în `qorechain-core`). Build-ul comunitar nu are nevoie de ele. Arhivele de release pentru rețele includ bibliotecile compilate (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`) într-un director `lib/` alături de `qorechaind`; plasați-le în `lib/{os}_{arch}/` sau indicați-le loader-ului așa cum se arată mai jos.

### Setarea căii bibliotecii

Când folosiți binarul de release, bibliotecile sale partajate trebuie să poată fi găsite la runtime. Setați variabila de mediu corespunzătoare platformei dvs.:

**macOS:**

```bash
export DYLD_LIBRARY_PATH=$(pwd)/lib/darwin_arm64:$DYLD_LIBRARY_PATH
```

**Linux:**

```bash
export LD_LIBRARY_PATH=$(pwd)/lib/linux_amd64:$LD_LIBRARY_PATH
```

:::info
Sfat: Adăugați exportul în profilul shell-ului (`~/.bashrc`, `~/.zshrc`) pentru ca acesta să persiste între sesiuni.
:::

## Arhitectura Open-Core

QoreChain urmează un model **open-core**:

* **Build-ul comunitar** — Conține interfețele complete ale modulelor, comenzile CLI, definițiile protobuf și tipurile de mesaje pentru fiecare modul QoreChain (x/pqc, x/ai, x/reputation, x/qca, x/svm, x/crossvm etc.). Keeperii pentru modulele proprietare folosesc **implementări stub** care returnează valori implicite sigure sau răspunsuri no-op. Acest lucru permite instrumentelor terțe, portofelelor și indexatoarelor să se integreze cu toate API-urile QoreChain fără a necesita cod proprietar.
* **Build-ul complet** — Conține implementările complete ale keeperilor (logica reală a modulelor critice pentru consens și semnatarul post-cuantic). Este distribuit sub forma binarelor de release publicate la [download.qore.host](https://download.qore.host); nu este compilat din arborele public de surse.

Ambele build-uri produc același nume de binar `qorechaind` și expun aceleași comenzi CLI. Diferența constă în comportamentul la runtime al logicii keeperilor din spatele acestor interfețe.

## Build-ul Comunitar

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Aceasta compilează toate interfețele publice ale modulelor cu keeperi stub pentru funcționalitățile proprietare. Binarul rezultat este destinat pentru:

* Dezvoltare și testare locală (de exemplu un devnet cu un singur nod)
* Interogarea unei rețele (comenzile `query ...` funcționează pe orice nod)
* Construirea de integrări și instrumente terțe pe baza interfețelor modulelor

Nu este o modalitate de a vă alătura mainnetului sau testnetului ca validator sau de a tranzacționa acolo: nu are semnatar post-cuantic (`tx pqc gen-key` și `tx pqc cosign` returnează o eroare), iar keeperii săi stub nu reproduc regulile de consens ale rețelelor.

## Build-ul Complet (binar de release)

Implementările complete ale keeperilor și semnatarul din spatele `tx pqc gen-key` și `tx pqc cosign` nu se află în arborele public de surse, deci nu pot fi compilate din el. Binarele publicate la [download.qore.host](https://download.qore.host) reprezintă build-ul complet; folosiți-le pentru mainnet și testnet.

## Rularea Testelor

```bash
CGO_ENABLED=1 go test ./... -count=1
```

Flag-ul `-count=1` dezactivează cache-ul testelor, asigurând o rulare curată de fiecare dată. Testele pentru pachete individuale pot fi rulate cu:

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

Testele care folosesc bibliotecile native sau keeperii proprietari sunt compilate doar în build-ul complet și nu fac parte din suita publică.

## Verificarea Build-ului

După o compilare reușită, verificați binarul:

```bash
./qorechaind version
./qorechaind init test-node --chain-id qorechain-diana
```

Comanda `init` ar trebui să creeze un fișier genesis și o configurație de nod în `~/.qorechaind/` fără erori. Exemplul de mai sus inițializează pe testnet-ul **`qorechain-diana`** — pentru mainnet, înlocuiți cu `--chain-id qorechain-vladi`, rețeaua live (versiunea de nod **v3.2.1**).

## Build Docker

Un Dockerfile este furnizat la rădăcina repository-ului:

```bash
docker build -t qorechaind:community .
```

Acesta compilează binarul **comunitar** (propriul comentariu spune „Public build — no PQC library”), deci imaginea este pentru dezvoltare locală și unelte, nu pentru a urmări mainnetul sau testnetul. Pentru a rula un nod de rețea în Docker, învelește în schimb binarul de release; consultați [Running a Node](/developer-guide/running-a-node#docker-compose).

## Depanare

<details>

<summary>cgo: compilatorul C nu a fost găsit</summary>

Instalați Xcode CLI tools (macOS) sau `build-essential` (Linux)

</details>

<details>

<summary>nu se găsește -lqorepqc</summary>

Legați un build care se așteaptă la bibliotecile native. Folosiți build-ul comunitar (nu are nevoie de ele) sau arhiva de release, care le include, și setați `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH` către directorul ei `lib/`

</details>

<details>

<summary>nedefinit: sonic.*</summary>

Asigurați-vă că `go.sum` este actualizat: `go mod tidy`

</details>

<details>

<summary>signal: killed în timpul build-ului</summary>

Măriți memoria disponibilă (frecvent în Docker cu limite reduse)

</details>

<details>

<summary>Testele PQC eșuează cu nepotrivire de dimensiuni</summary>

Dimensiunile ML-DSA-87 sunt: cheie publică 2.592 de octeți, cheie secretă 4.896 de octeți și semnătură 4.627 de octeți. Orice altă dimensiune înseamnă un alt algoritm sau o valoare trunchiată.

</details>
