---
slug: /developer-guide/building-from-source
title: Compilare din sursă
sidebar_label: Compilare din sursă
sidebar_position: 1
---

# Compilare din sursă

Acest ghid te conduce prin procesul de compilare a binarului `qorechaind` din sursă, acoperind atât build-ul comunitar (open-core), cât și build-ul proprietar complet.

## Cerințe prealabile

| Dependență         | Versiune minimă           | Note                                              |
| ------------------ | ------------------------- | ------------------------------------------------- |
| **Go**             | 1.26+                     | Necesar pentru toate build-urile                  |
| **CGO**            | Activat (`CGO_ENABLED=1`) | Necesar pentru punțile FFI PQC și SVM             |
| **Toolchain Rust** | Cea mai recentă versiune stabilă | Necesar pentru a compila `libqorepqc` și `libqoresvm` |
| **Make**           | 3.81+                     | Automatizarea build-ului                          |
| **Git**            | 2.x                       | Descărcarea sursei                                |

Verifică-ți mediul:

```bash
go version        # go1.26.x or later
rustc --version   # stable toolchain
cargo --version
echo $CGO_ENABLED # must be 1
```

:::danger
Fiecare invocare `go build`, `go test` și `go run` **trebuie** să aibă setat `CGO_ENABLED=1`. Modulele PQC și SVM folosesc punți FFI care necesită cgo.
:::

## Biblioteci native

QoreChain depinde de două biblioteci native compilate în Rust, care sunt încărcate în timpul rulării.

### libqorepqc (criptografie post-cuantică)

Biblioteca PQC oferă generarea de chei, semnarea și verificarea ML-DSA-87 (Dilithium-5) printr-o interfață FFI compatibilă cu C.

```bash
cd rust/qorepqc
cargo build --release
```

Biblioteca compilată este plasată în `lib/{os}_{arch}/`:

| Platformă   | Fișier bibliotecă  | Director            |
| ----------- | ------------------ | ------------------- |
| macOS arm64 | `libqorepqc.dylib` | `lib/darwin_arm64/` |
| Linux amd64 | `libqorepqc.so`    | `lib/linux_amd64/`  |
| Linux arm64 | `libqorepqc.so`    | `lib/linux_arm64/`  |

### libqoresvm (runtime SVM)

Biblioteca SVM oferă mediul de execuție a programelor BPF pentru modulul x/svm.

```bash
cd rust/qoresvm
cargo build --release
```

Rezultatul respectă aceeași convenție `lib/{os}_{arch}/` ca mai sus (`libqoresvm.dylib` pe macOS, `libqoresvm.so` pe Linux).

### Setarea căii bibliotecilor

Bibliotecile native trebuie să poată fi descoperite în timpul rulării. Setează variabila de mediu corespunzătoare platformei tale:

**macOS:**

```bash
export DYLD_LIBRARY_PATH=$(pwd)/lib/darwin_arm64:$DYLD_LIBRARY_PATH
```

**Linux:**

```bash
export LD_LIBRARY_PATH=$(pwd)/lib/linux_amd64:$LD_LIBRARY_PATH
```

:::info
Sfat: Adaugă exportul în profilul shell-ului tău (`~/.bashrc`, `~/.zshrc`) ca să persiste între sesiuni.
:::

## Arhitectura open-core

QoreChain urmează un model **open-core**:

* **Build comunitar** — Conține interfețele complete ale modulelor, comenzile CLI, definițiile protobuf și tipurile de mesaje pentru fiecare modul QoreChain (x/pqc, x/ai, x/reputation, x/qca, x/svm, x/crossvm etc.). Keeper-ele pentru modulele proprietare folosesc **implementări stub** care returnează valori implicite sigure sau răspunsuri no-op. Acest lucru permite uneltelor terțe, portofelelor și indexatoarelor să se integreze cu toate API-urile QoreChain fără a necesita cod proprietar.
* **Build complet (proprietar)** — Activează implementările complete ale keeper-elor în spatele tag-ului de build `proprietary`. Acesta include logica reală de detectare a anomaliilor prin AI, reglarea parametrilor de consens PRISM, scorul avansat de reputație și toate funcțiile de nivel de producție.

Ambele build-uri produc același nume de binar `qorechaind` și expun comenzi CLI și endpoint-uri gRPC/REST identice. Diferența constă în comportamentul la rulare al logicii keeper-elor din spatele acestor interfețe.

## Build comunitar

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Acesta compilează toate interfețele publice de module cu keeper-e stub pentru funcțiile proprietare. Binarul rezultat este complet funcțional pentru:

* Rularea unui nod validator
* Trimiterea și interogarea tranzacțiilor
* Interacțiunea cu VM-urile EVM, CosmWasm și SVM
* Construirea de integrări și unelte terțe
* Dezvoltare și testare locală

## Build complet (proprietar)

```bash
CGO_ENABLED=1 go build -tags proprietary -o qorechaind ./cmd/qorechaind/
```

Indicatorul `-tags proprietary` activează implementările complete ale keeper-elor, care nu fac parte din arborele de surse public.

## Rularea testelor

```bash
CGO_ENABLED=1 go test ./... -count=1
```

Indicatorul `-count=1` dezactivează cache-ul de teste, asigurând o rulare curată de fiecare dată. Testele individuale ale pachetelor pot fi rulate cu:

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/ai/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

Rulează separat testele bibliotecilor Rust:

```bash
cd rust/qorepqc && cargo test
cd rust/qoresvm && cargo test
```

## Verificarea build-ului

După un build reușit, verifică binarul:

```bash
./qorechaind version
./qorechaind init test-node --chain-id qorechain-diana
```

Comanda `init` ar trebui să creeze un fișier genesis și configurația nodului în `~/.qorechaind/` fără erori. Exemplul de mai sus inițializează în raport cu testnet-ul **`qorechain-diana`** — pentru mainnet, înlocuiește cu `--chain-id qorechain-vladi`, rețeaua activă care rulează versiunea de lanț **v3.1.77**.

## Build Docker

Pentru build-uri containerizate, este furnizat un Dockerfile în rădăcina depozitului:

```bash
docker build -t qorechaind:latest .
```

Imaginea Docker gestionează automat toată compilarea bibliotecilor native și configurarea căilor. Vezi ghidul [Quickstart](/getting-started/quickstart) pentru rularea unui nod cu Docker Compose.

## Depanare

<details>

<summary>cgo: C compiler not found</summary>

Instalează uneltele CLI Xcode (macOS) sau `build-essential` (Linux)

</details>

<details>

<summary>cannot find -lqorepqc</summary>

Compilează mai întâi bibliotecile Rust și setează `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH`

</details>

<details>

<summary>undefined: sonic.*</summary>

Asigură-te că `go.sum` este actualizat: `go mod tidy`

</details>

<details>

<summary>signal: killed during build</summary>

Mărește memoria disponibilă (frecvent în Docker cu limite mici)

</details>

<details>

<summary>PQC tests fail with size mismatch</summary>

Verifică faptul că folosești `pqcrypto v0.5.0+` (ML-DSA-87: pubkey=2592, privkey=4896, sig=4627 bytes)

</details>
