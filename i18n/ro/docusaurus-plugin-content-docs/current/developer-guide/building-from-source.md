---
slug: /developer-guide/building-from-source
title: Compilare din sursă
sidebar_label: Compilare din sursă
sidebar_position: 1
---

# Compilare din sursă

Acest ghid vă parcurge procesul de compilare a binarului `qorechaind` din sursă, acoperind atât build-ul comunitar (open-core), cât și build-ul proprietar complet.

## Cerințe preliminare

| Dependință          | Versiune minimă           | Note                                              |
| ------------------- | -------------------------- | -------------------------------------------------- |
| **Go**              | 1.26+                      | Necesar pentru toate build-urile                   |
| **CGO**             | Activat (`CGO_ENABLED=1`)  | Necesar pentru punțile FFI PQC și SVM              |
| **Toolchain Rust**  | Ultima versiune stabilă    | Necesar pentru compilarea `libqorepqc` și `libqoresvm` |
| **Make**            | 3.81+                      | Automatizarea build-ului                           |
| **Git**             | 2.x                        | Preluarea (checkout) sursei                        |

Verificați mediul de lucru:

```bash
go version        # go1.26.x or later
rustc --version   # stable toolchain
cargo --version
echo $CGO_ENABLED # must be 1
```

:::danger
Fiecare invocare `go build`, `go test` și `go run` **trebuie** să aibă `CGO_ENABLED=1` setat. Modulele PQC și SVM folosesc punți FFI care necesită cgo.
:::

## Biblioteci native

QoreChain depinde de două biblioteci native construite în Rust, care sunt încărcate la runtime.

### libqorepqc (Criptografie Post-Cuantică)

Biblioteca PQC oferă generare de chei, semnare și verificare ML-DSA-87 (Dilithium-5) printr-o interfață FFI compatibilă C.

```bash
cd rust/qorepqc
cargo build --release
```

Biblioteca compilată este plasată în `lib/{os}_{arch}/`:

| Platformă    | Fișier bibliotecă  | Director             |
| ------------ | ------------------- | --------------------- |
| macOS arm64  | `libqorepqc.dylib`  | `lib/darwin_arm64/`   |
| Linux amd64  | `libqorepqc.so`     | `lib/linux_amd64/`    |
| Linux arm64  | `libqorepqc.so`     | `lib/linux_arm64/`    |

### libqoresvm (Runtime SVM)

Biblioteca SVM oferă mediul de execuție a programelor BPF pentru modulul x/svm.

```bash
cd rust/qoresvm
cargo build --release
```

Rezultatul urmează aceeași convenție `lib/{os}_{arch}/` ca mai sus (`libqoresvm.dylib` pe macOS, `libqoresvm.so` pe Linux).

### Setarea căii bibliotecii

Bibliotecile native trebuie să poată fi găsite la runtime. Setați variabila de mediu corespunzătoare platformei dvs.:

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
* **Build-ul complet (proprietar)** — Activează implementările complete ale keeperilor din spatele tag-ului de build `proprietary`. Acesta include logica reală de detectare a anomaliilor prin AI, ajustarea parametrilor de consens PRISM, scorarea avansată a reputației și toate funcționalitățile de nivel producție.

Ambele build-uri produc același nume de binar `qorechaind` și expun comenzi CLI și endpoint-uri gRPC/REST identice. Diferența constă în comportamentul la runtime al logicii keeperilor din spatele acestor interfețe.

## Build-ul Comunitar

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Aceasta compilează toate interfețele publice ale modulelor cu keeperi stub pentru funcționalitățile proprietare. Binarul rezultat este complet funcțional pentru:

* Rularea unui nod validator
* Trimiterea și interogarea tranzacțiilor
* Interacțiunea cu VM-urile EVM, CosmWasm și SVM
* Construirea integrărilor și instrumentelor terțe
* Dezvoltare și testare locală

## Build-ul Complet (Proprietar)

```bash
CGO_ENABLED=1 go build -tags proprietary -o qorechaind ./cmd/qorechaind/
```

Flag-ul `-tags proprietary` activează implementările complete ale keeperilor, care nu fac parte din arborele de surse public.

## Rularea Testelor

```bash
CGO_ENABLED=1 go test ./... -count=1
```

Flag-ul `-count=1` dezactivează cache-ul testelor, asigurând o rulare curată de fiecare dată. Testele pentru pachete individuale pot fi rulate cu:

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/ai/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

Rulați separat testele bibliotecilor Rust:

```bash
cd rust/qorepqc && cargo test
cd rust/qoresvm && cargo test
```

## Verificarea Build-ului

După o compilare reușită, verificați binarul:

```bash
./qorechaind version
./qorechaind init test-node --chain-id qorechain-diana
```

Comanda `init` ar trebui să creeze un fișier genesis și o configurație de nod în `~/.qorechaind/` fără erori. Exemplul de mai sus inițializează pe testnet-ul **`qorechain-diana`** — pentru mainnet, înlocuiți cu `--chain-id qorechain-vladi`, rețeaua live care rulează versiunea de chain **v3.1.92**.

## Build Docker

Pentru build-uri containerizate, un Dockerfile este furnizat la rădăcina repository-ului:

```bash
docker build -t qorechaind:latest .
```

Imaginea Docker gestionează automat compilarea tuturor bibliotecilor native și configurarea căilor. Consultați ghidul [Quickstart](/getting-started/quickstart) pentru rularea unui nod cu Docker Compose.

## Depanare

<details>

<summary>cgo: compilatorul C nu a fost găsit</summary>

Instalați Xcode CLI tools (macOS) sau `build-essential` (Linux)

</details>

<details>

<summary>nu se găsește -lqorepqc</summary>

Compilați mai întâi bibliotecile Rust și setați `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH`

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

Verificați că folosiți `pqcrypto v0.5.0+` (ML-DSA-87: pubkey=2592, privkey=4896, sig=4627 bytes)

</details>
