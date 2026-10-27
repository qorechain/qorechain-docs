---
slug: /developer-tools/qorescan
title: QoreScan Community
sidebar_label: QoreScan
sidebar_position: 33
---

# QoreScan Community

QoreScan Community este un instrument de linie de comandă care inventariază criptografia unei implementări QoreChain și scrie rezultatul ca un CBOM CycloneDX 1.6 (cryptographic bill of materials, listă a materialelor criptografice). Citește un director home de nod, starea live a rețelei, endpointuri TLS și surse Solidity și înregistrează fiecare algoritm, protocol, certificat și cheie pe care le găsește, cu fișierul și linia sau endpointul unde au fost găsite.

Este destinat operatorilor de validatori și de noduri, echipelor de conformitate și de risc, auditorilor care pregătesc un pachet de dovezi și echipelor Solidity care vor să știe de ce scheme de semnătură depind contractele lor. Din CBOM scrie rapoarte Markdown mapate pe FINMA Guidance 05/2026, pe foaia de parcurs post-cuantică a Grupului de Cooperare NIS al UE și pe RTS DORA privind gestionarea riscului ICT (articolul 6), cu o stare pentru fiecare algoritm față de FIPS 203, 204 și 205 și NIST IR 8547.

Versiunea **0.1.0**, publicată la 27 octombrie 2026, Apache-2.0. Citește mainnet-ul (`qorechain-vladi`) și testnet-ul (`qorechain-diana`) prin endpointurile lor REST publice, sau orice endpoint REST spre care îl îndrepți.

QoreScan este un ajutor de inventariere. Nu este o certificare, un audit sau o opinie juridică și nu stabilește conformitatea cu vreo reglementare sau standard. Tot ce scanarea nu poate stabili rămâne „To be completed".

## Inovații {#innovations}

- **Un CBOM într-un format standard.** Fiecare constatare este o componentă CycloneDX 1.6 `cryptographic-asset` cu `cryptoProperties` (tipul activului, primitiva, setul de parametri, curba, nivelul de securitate clasic, categoria de securitate cuantică NIST, OID) și `evidence.occurrences` (fișier și linie, sau endpoint). Certificatele trimit către algoritmul lor de semnătură și cheia publică, protocoalele către algoritmii pe care îi folosesc, bibliotecile către algoritmii pe care îi oferă. Fiecare CBOM scris în testele proiectului este validat față de schema JSON oficială CycloneDX 1.6, iar fiecare `bom-ref` folosit este verificat să fie definit, așa că rezultatul se încarcă în orice consumator CycloneDX 1.6.
- **Surse care cunosc lanțul.** Pe lângă fișiere și TLS, citește QoreChain însuși: parametrii PQC, comutatoarele de protocol legate de PQC, tipurile de chei de consens ale setului activ de validatori și precompilările EVM active, iar pentru fiecare cont pe care îl numești, dacă are o cheie PQC înregistrată, algoritmul ei, tipul cheii (hibrid, doar PQC, doar clasic) și dimensiunea cheii publice.
- **Schimbul hibrid de chei este vizibil.** Un handshake TLS pe endpoint înregistrează versiunea, suita de cifrare, grupul de schimb de chei (inclusiv grupuri hibride ML-KEM precum `X25519MLKEM768`), ALPN, SNI și fiecare certificat trimis de server.
- **Valorile cheilor private nu sunt citite niciodată.** Fișierele de chei sunt decodate în structuri care nu au câmp pentru cheia privată, așa că acei octeți nu sunt niciodată decodați, stocați, logați sau scriși. Un test eșuează dacă acele structuri primesc un câmp care ar putea purta date private, iar un alt test scanează un home de nod cu chei proaspăt generate și verifică că nicio codificare a lor nu apare în vreun rezultat.
- **Fiecare algoritm primește o clasificare și o stare de tranziție.** `post-quantum`, `hybrid`, `quantum-vulnerable` sau `symmetric`, cu categoria sa de securitate cuantică NIST acolo unde este definită, și starea față de FIPS 203, 204, 205 și calendarul NIST IR 8547.
- **Rezultat reproductibil.** Marcajul de timp al CBOM este ora curentă sau `SOURCE_DATE_EPOCH`, când este setat. Numărul de serie este derivat din conținut, așa că aceeași intrare la aceeași oră dă același document.
- **Wrappere care verifică ce rulează.** Pachetele npm și PyPI descarcă la cerere binarul de release pentru platforma ta și îi compară SHA-256 cu digest-uri livrate în interiorul pachetului. Refuză un binar care nu se potrivește, atât după descărcare, cât și la fiecare rulare ulterioară a copiei din cache. Niciun script de instalare nu rulează la `npm install`.
- **Fără cod terț în binar.** Binarul `qorescan` folosește biblioteca standard Go pentru scanare (validatorul de schemă JSON este folosit de testele sale). Nu refolosește cod din proiectele PQCA CBOMkit; rezultatul său se încarcă în vizualizatorul CBOMkit.

## Cazuri de utilizare {#use-cases}

1. **Echipă de conformitate care produce un CBOM pentru un supervizor.** O instituție financiară elvețiană care rulează un nod QoreChain trebuie să arate un inventar al metodelor criptografice din sistemele sale ICT, inclusiv tehnologia registrelor distribuite (FINMA Guidance 05/2026, secțiunea 3.2). Rulează `qorescan scan --node-home ... --network mainnet`, atașează CBOM-ul și `qorescan report --framework finma` la analiza sa de risc și completează manual secțiunile organizaționale.
2. **Validator care își auditează propriul nod.** Un operator vrea să confirme ce tip de cheie de consens folosește validatorul, dacă fișierele de chei pot fi citite de alți utilizatori, dacă listenerele RPC sau EVM JSON-RPC sunt expuse fără TLS și dacă este configurat un semnatar la distanță. `qorescan scan --node-home ~/.qorechain` înregistrează toate acestea fără a deschide valorile cheilor private.
3. **Verificarea conturilor înainte de a te baza pe ele.** Un birou de custodie sau o echipă de integrare cu o bursă vrea să știe dacă adresele de trezorerie sau de hot wallet au o cheie ML-DSA-87 înregistrată și dacă este hibridă. `qorescan scan --network mainnet --address qor1... --address qor1...` scrie în CBOM starea cheii PQC a fiecărui cont. Vezi [custody kit](/developer-tools/custody-kit).
4. **Echipă Solidity care portează contracte.** O echipă care mută contracte din Ethereum vrea o listă cu fiecare loc care depinde de `ecrecover`, OpenZeppelin `ECDSA`, P-256 sau RSA și cu fiecare loc care apelează deja precompilările PQC QoreChain. `qorescan solidity ./contracts` listează fiecare utilizare cu fișier și linie.
5. **Revizuirea endpointurilor.** O echipă de platformă vrea să știe dacă endpointurile sale publice RPC, REST sau de wallet API negociază un schimb de chei post-cuantic hibrid cu clienții moderni. `qorescan tls api.example.org:443` înregistrează grupul negociat, suita de cifrare și lanțul de certificate.
6. **Poartă CI la fiecare pull request.** Un depozit de dApp adaugă GitHub Action-ul QoreScan, astfel încât fiecare modificare produce un CBOM proaspăt și un raport DORA sau FINMA ca artefacte de build, iar revizorii pot vedea când o nouă schemă de semnătură sau un nou hash intră în codebase.
7. **Due diligence pentru furnizori.** O firmă reglementată trimite unui furnizor de servicii rezultatul `qorescan template questionnaire`, pre-completat cu ceea ce scanarea endpointurilor acelui furnizor arată deja, astfel încât furnizorul răspunde doar la punctele rămase deschise.
8. **Entități UE care se pregătesc pentru foaia de parcurs NIS și DORA.** O entitate folosește `qorescan report --framework nis` și `--framework dora` pentru a arăta unde inventarul ei alimentează pasul de gestionare a activelor criptografice și articolul 6 din RTS DORA.

## Cum funcționează {#how-it-works}

### Surse {#sources}

- **Home de nod** (`--node-home DIR`). Citește `config/config.toml`, `config/app.toml`, `config/genesis.json`, `priv_validator_key.json`, `node_key.json` și orice fișiere de certificat pe care acestea le numesc. Înregistrează transportul P2P și algoritmii lui, certificatele TLS RPC și EVM JSON-RPC, listenerele pe adrese non-loopback fără TLS, un semnatar la distanță, tipurile de chei de validator și de nod și cheile publice, permisiunile fișierelor de chei, parametrii modulului `pqc` din genesis, registrul de algoritmi on-chain la genesis și tipurile de chei de consens ale validatorilor.
- **Rețea** (`--network mainnet|testnet` sau `--rest URL`). Citește prin REST comutatoarele de protocol legate de PQC, parametrii `pqc`, tipurile de chei de consens ale setului activ de validatori și precompilările EVM active.
- **Conturi** (`--address ADDR`, repetabil). Citește prin REST cheia PQC înregistrată a fiecărui cont.
- **TLS** (`--tls HOST:PORT`, repetabil). Un handshake pe endpoint.
- **Solidity** (`--solidity PATH`, repetabil). Detectare bazată pe text a `ecrecover`, a apelurilor către precompilările ecrecover (`0x01`), pqcVerify (`0x0A01`), pqcKeyStatus (`0x0A02`) și P-256 (`0x100`), a `keccak256`, `sha256`, `ripemd160` și a importurilor bibliotecilor de semnătură OpenZeppelin, Solady și `IQorePQC.sol`. Precompilările pqcVerify și pqcKeyStatus sunt active doar pe testnet; niciuna nu este activă pe mainnet. Vezi [precompilările EVM](/developer-guide/evm-precompiles).

### Citiri din rețea {#network-reads}

Fiecare cerere către rețea este un HTTP GET. Rutele citite sunt ruta cu informații despre nod, `/qorechain/pqc/v1/protocol_features`, `/qorechain/pqc/v1/params`, ruta ultimului set de validatori, `/cosmos/evm/vm/v1/params` și `/qorechain/pqc/v1/account/{address}`. O rută pe care un nod nu o servește devine o notă în CBOM, nu o eroare.

### Clasificare {#classification}

ML-KEM (FIPS 203), ML-DSA (FIPS 204), SLH-DSA (FIPS 205) și LMS/XMSS sunt `post-quantum`. Un schimb de chei clasic combinat cu ML-KEM este `hybrid`. RSA, ECDSA, EdDSA, Diffie-Hellman pe câmp finit și pe curbe eliptice și semnăturile bazate pe pairing sunt `quantum-vulnerable`, cu calendarul NIST IR 8547 „deprecated after 2030, disallowed after 2035". Cifrurile bloc, AEAD-urile, hash-urile, XOF-urile și KDF-urile sunt `symmetric`. QoreScan aplică calendarul IR 8547 fiecărei curbe din familiile ECDSA, EdDSA și ECDH, inclusiv secp256k1 și X25519, deoarece expunerea cuantică este aceeași. Acestea sunt clasificări de inventar, nu afirmații despre aprobarea NIST.

### Rezultat {#output}

QoreScan adaugă câteva proprietăți `qorescan:*` (clasificare, tranziție NIST IR 8547, standard, sursă) și înregistrează în metadatele CBOM faptele scanate, notele și o proprietate de disclaimer. Căile dovezilor sunt relative la directorul scanat.

Un raport conține tabelul de mapare pe cadrul de reglementare, un sumar pe clasificări, fiecare algoritm cu categoria lui NIST, starea față de FIPS 203, 204, 205 și NIST IR 8547 și dovezile lui, apoi protocoale, certificate, chei, biblioteci, fapte scanate, note de scanare și sursele citate. Punctele organizaționale apar ca „To be completed".

### Maparea pe cadre de reglementare {#frameworks}

| Cadru | Sursa | Unde inventarul servește drept intrare |
|---|---|---|
| `finma` | FINMA Guidance 05/2026 „Quantum computing", 9 iulie 2026, secțiunea 3 | 3.2 inventar (CBOM-ul); 3.3 date critice (schimbul de chei al transporturilor scanate, modul de semnătură hibridă de pe lane-ul nativ); 3.4 crypto-agility (registrul de algoritmi, perioada de migrare, comutatoarele de protocol); 3.5 furnizori (emitenții de certificate, chestionarul). 3.1 strategia este organizațională. |
| `nis` | Grupul de Cooperare NIS, „A Coordinated Implementation Roadmap for the Transition to Post-Quantum Cryptography", Partea 1, v1.1, 11 iunie 2025 | Gestionarea activelor criptografice (CBOM-ul); reperele 2030 și 2035 (lista algoritmilor quantum-vulnerable); agilitate. |
| `dora` | Regulamentul delegat (UE) 2024/1774 al Comisiei, articolul 6 | 6(2)(a) și (c) evidențe de transport și listenere fără TLS; 6(2)(d) evidențe de chei (tipuri și chei publice); 6(3) fiecare algoritm față de FIPS și NIST IR 8547; 6(4) registru, perioadă de migrare, comutatoare. 6(1) și 6(5) sunt organizaționale. |

## Cum se utilizează {#how-to-use}

### Instalare {#install}

| Canal | Comandă de instalare | Platformă minimă |
|---|---|---|
| Binar de release | Descarcă `qorescan_0.1.0_<os>_<arch>` (sau `.tar.gz` ori `.zip`; binarele Windows se termină în `.exe`) din [release-ul GitHub](https://github.com/qorechain/qorescan/releases/tag/v0.1.0) și verifică-l cu `qorescan_0.1.0_checksums.txt` | macOS, Linux sau Windows pe amd64 sau arm64 |
| Go | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | Go 1.26 |
| npm | `npx @qorechain/qorescan scan ...` | Node.js 18 sau mai nou |
| PyPI | `pipx run qorescan scan ...` (sau `pip install qorescan`) | Python 3.9 sau mai nou |
| Docker | `docker build -t qorescan .` din depozit (nu se publică nicio imagine prefabricată) | Docker; imaginea este distroless și rulează ca utilizatorul 65532 |
| GitHub Action | `uses: qorechain/qorescan@<commit sha>` | Runner găzduit de GitHub sau self-hosted; action-ul construiește QoreScan din propria sursă cu `actions/setup-go` |

Variabile de mediu pentru ambele wrappere:

| Variabilă | Efect |
|---|---|
| `QORESCAN_CACHE_DIR` | Unde se păstrează în cache binarul (implicit: directorul de cache al utilizatorului). |
| `QORESCAN_DOWNLOAD_BASE` | Descarcă dintr-o oglindă în loc de GitHub. Verificarea digest-ului se aplică în continuare. |

### Pornire rapidă {#quickstart}

QoreScan trimite cereri GET și un handshake TLS pe endpoint, nu semnează nimic și nu are nevoie de nicio cheie. Comenzile de mai jos au fost rulate la 27 octombrie 2026 pe testnet-ul public, cu un binar construit din sursa v0.1.0.

**1. Scanează starea testnet-ului, un cont, TLS-ul endpointului REST public de testnet și un folder cu surse Solidity:**

```bash
qorescan scan --network testnet \
  --address qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08 \
  --tls api-testnet.qore.host:443 \
  --solidity ./contracts \
  --name my-deployment \
  --out cbom.json
```

A ieșit cu codul 0. CBOM-ul a înregistrat, printre altele, id-ul lanțului `qorechain-diana`, modul de semnătură hibridă de pe lane-ul nativ `required`, cheia PQC hibridă a contului (contul faucet-ului de testnet), cheile de consens Ed25519 ale setului de validatori, TLS 1.3 cu grupul hibrid `X25519MLKEM768` și algoritmii găsiți în sursele Solidity.

O a doua rulare, doar pe părțile de rețea și TLS, făcută în timp ce se scria această pagină, a produs un CBOM de 21 de componente, printre care ML-DSA-87, `X25519MLKEM768`, o intrare de protocol TLS 1.3 pentru `api-testnet.qore.host:443`, lanțul său de certificate și cheile Ed25519 ale setului de validatori.

**2. Scrie un raport FINMA din CBOM:**

```bash
qorescan report --framework finma --cbom cbom.json --out finma.md
```

Raportul începe cu disclaimerul, apoi tabelul de mapare (secțiunile 3.1 la 3.5), un sumar pe clasificări și câte un rând pentru fiecare algoritm, cu starea lui FIPS și NIST IR 8547 și dovezile lui. O scanare a unui singur fișier Solidity care folosește `ecrecover` a produs un CBOM CycloneDX 1.6 cu o singură componentă (`ECDSA secp256k1`) și același antet de raport. Un nume de cadru necunoscut iese cu codul 2 și un mesaj care listează `finma`, `nis` și `dora`.

**3. Pre-completează chestionarul pentru furnizori și declarația de agilitate:**

```bash
qorescan template questionnaire --cbom cbom.json --out vendor-questionnaire.md
qorescan template agility       --cbom cbom.json --out agility-statement.md
```

**4. Scanează propriul nod.** Accesul de citire la home-ul nodului este suficient:

```bash
qorescan scan --node-home ~/.qorechain --network mainnet --out node-cbom.json
```

Cu Docker, montează home-ul nodului în modul doar-citire, ca să nu-l poată modifica containerul:

```bash
docker run --rm -v "$HOME/.qorechain:/scan/home:ro" qorescan scan --node-home /scan/home > cbom.json
```

**5. Prin wrappere, comenzile sunt aceleași:**

```bash
npx @qorechain/qorescan scan --network mainnet --out cbom.json
pipx run qorescan report --framework dora --cbom cbom.json
```

**6. În GitHub Actions.** Fixează action-ul și fiecare alt action după commit:

```yaml
permissions:
  contents: read
steps:
  - uses: actions/checkout@<sha>
  - id: qorescan
    uses: qorechain/qorescan@<commit sha>
    with:
      solidity: contracts
      network: mainnet
      addresses: qor1...
      out: qorescan.cbom.json
      framework: finma
  - uses: actions/upload-artifact@<sha>
    with:
      name: cbom
      path: |
        ${{ steps.qorescan.outputs.cbom }}
        ${{ steps.qorescan.outputs.report }}
```

Intrările action-ului: `node-home`, `network`, `rest`, `addresses`, `tls`, `solidity` (liste separate prin spații sau linii noi), `out` (implicit `qorescan.cbom.json`) și `framework`. Ieșiri: `cbom` și `report`. Action-ul construiește QoreScan din propria sursă la commitul fixat, deci nu se descarcă niciun binar.

Ce a fost rulat pentru această pagină: scanarea testnet-ului, scanarea Solidity, raportul FINMA și eroarea de cadru necunoscut, cu un binar construit din sursa v0.1.0. Binarele de release, wrapperele npm și PyPI (dincolo de citirea conținutului pachetelor și a intrărilor din registre), imaginea Docker și GitHub Action-ul nu au fost executate.

### Comenzi și opțiuni {#commands}

```
qorescan scan [--node-home DIR] [--network mainnet|testnet | --rest URL] [--address ADDR]...
              [--tls HOST:PORT]... [--solidity DIR]... [--out FILE]
qorescan tls HOST:PORT... [--out FILE]
qorescan solidity DIR... [--out FILE]
qorescan report --framework finma|nis|dora --cbom FILE [--out FILE]
qorescan template agility|questionnaire --cbom FILE [--out FILE]
qorescan version
```

Opțiunile pot veni înaintea sau după argumentele poziționale. `--out -` (implicit) scrie la ieșirea standard. `qorescan <command> -h` afișează opțiunile unei comenzi.

| Comandă | Opțiune | Ce face |
|---|---|---|
| `scan` | `--node-home DIR` | Directorul home al nodului (cel care conține `config/`). |
| `scan` | `--network mainnet\|testnet` | Citește starea live de la `https://api.qore.host` sau `https://api-testnet.qore.host`. |
| `scan` | `--rest URL` | Folosește în schimb orice endpoint REST, de exemplu propriul nod (`http://127.0.0.1:1317`) sau un releu care redirecționează cereri GET. Suprascrie `--network`. |
| `scan` | `--address ADDR` | Contul a cărui stare a cheii PQC se citește. Repetabil. Necesită `--network` sau `--rest`. |
| `scan` | `--tls HOST:PORT` | Endpoint TLS cu care se face handshake. Repetabil. Portul 443 când lipsește. |
| `scan` | `--solidity PATH` | Director sau fișier `.sol`. Repetabil. |
| `scan`, `solidity` | `--include-deps` | Scanează și `node_modules`, `lib`, `out`, `cache`, `artifacts` și `typechain-types`, care sunt omise implicit. |
| `scan` | `--name NAME` | Numele implementării scanate, în metadatele CBOM. |
| `scan` | `--timeout D` | Timeout de rețea pe cerere (implicit `20s`). |
| `tls` | `--servername NAME` | Numele serverului SNI (implicit: gazda). |
| `tls` | `--timeout D` | Timeout pentru handshake (implicit `15s`). |
| toate scanările | `--verbose` | Loghează la ieșirea de eroare standard fiecare fișier citit și fiecare cerere. |
| toate | `--out FILE` | Fișierul de ieșire, `-` pentru ieșirea standard. |
| `report` | `--framework finma\|nis\|dora` | Cadrul pe care se face maparea. Obligatoriu. |
| `report`, `template` | `--cbom FILE` | CBOM-ul de citit, `-` pentru intrarea standard. Obligatoriu. |
| `template` | `agility` sau `questionnaire` | Ce șablon se scrie. |

Alte comenzi: `qorescan tls` este o scanare TLS de sine stătătoare, `qorescan solidity` este o scanare Solidity de sine stătătoare, `qorescan template agility` scrie o declarație de crypto-agility pre-completată din faptele scanate, `qorescan template questionnaire` scrie un chestionar de cinci întrebări pentru furnizori, care urmează cele cinci măsuri din FINMA Guidance 05/2026 secțiunea 3, iar `qorescan report` acceptă și un CBOM CycloneDX 1.6 scris de alt instrument (clasificarea se face atunci după numele algoritmului).

Coduri de ieșire: `0` succes, `1` o eroare de scanare sau de I/O, `2` o eroare de utilizare.

## Cum se accesează {#how-to-access}

| | Mainnet | Testnet |
|---|---|---|
| Id de lanț | `qorechain-vladi` | `qorechain-diana` |
| REST folosit de `--network` | `https://api.qore.host` | `https://api-testnet.qore.host` |

- Nu sunt necesare chei, conturi sau fonduri. QoreScan nu semnează și nu trimite niciodată o tranzacție și nu scrie nimic în afară de fișierul de ieșire pe care îl numești.
- Unele rute nu sunt servite de fiecare nod. La 27 octombrie 2026, endpointul REST public de mainnet nu servea `/qorechain/pqc/v1/params`; scanarea înregistrează atunci o notă și continuă. Îndreaptă `--rest` spre propriul nod pentru o imagine mai completă.
- Registrul de algoritmi on-chain nu este expus prin REST. QoreScan îl citește din `genesis.json` când se scanează un home de nod.
- Scanarea reflectă versiunea de lanț a nodului pe care îl citește. Comutatoarele de protocol și precompilările active diferă între mainnet și testnet; CBOM-ul înregistrează ce raportează nodul interogat.
- Dacă mașina ta nu poate ajunge la endpointurile publice, folosește `--rest` cu un nod pe care îl rulezi tu sau cu un releu care redirecționează cereri GET.
- Dependențe: wrapperele npm și PyPI folosesc doar modulele încorporate ale limbajului lor.

## Note de securitate {#security}

- **Valorile cheilor private nu sunt citite niciodată.** Din `priv_validator_key.json` QoreScan ia adresa, cheia publică și numele tipurilor de chei. Din `node_key.json` ia doar tipul cheii; ID-ul nodului nu este derivat, deoarece ar necesita cheia privată. Bufferul brut al fișierului este suprascris după decodare, iar erorile de decodare, care ar putea cita intrarea, nu sunt returnate niciodată.
- Directoarele keyring (`keyring-*`) și fișierele de chei numite de `tls_key_file` și `tls.key-path` nu sunt deschise. QoreScan înregistrează doar că există sau sunt configurate. Alte blocuri PEM dintr-un fișier de certificat sunt omise fără a fi decodate.
- Fiecare cerere către rețea este un HTTP GET. Nu se scrie nimic în afară de fișierul de ieșire.
- Wrapperele npm și PyPI verifică SHA-256 al binarului înainte de fiecare rulare și refuză o nepotrivire, inclusiv când se folosește o oglindă. Pentru release-ul 0.1.0, digest-urile din pachetul npm se potrivesc cu fișierul de sume de control al release-ului.
- Imaginea Docker este distroless și rulează ca utilizator non-root. Montează home-ul nodului cu `:ro`.
- Raportează vulnerabilitățile în privat la security@qore.network.

## Unde este publicat {#where-published}

Versiunile au fost citite din fiecare registru la 27 octombrie 2026.

| Registru | Pachet | Versiune | Link |
|---|---|---|---|
| Release GitHub | `qorechain/qorescan` | v0.1.0 (publicat la 27 octombrie 2026), binare pentru darwin, linux și windows pe amd64 și arm64, plus `qorescan_0.1.0_checksums.txt` | https://github.com/qorechain/qorescan/releases/tag/v0.1.0 |
| npm | `@qorechain/qorescan` (comanda `qorescan`) | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorescan |
| PyPI | `qorescan` (Python 3.9 sau mai nou) | 0.1.0 | https://pypi.org/project/qorescan/ |
| Go module proxy | `github.com/qorechain/qorescan` | v0.1.0 | https://pkg.go.dev/github.com/qorechain/qorescan |

Sursa: https://github.com/qorechain/qorescan (Apache-2.0, copyright 2026 QoreChain Association). Nu există pachet crates.io sau Maven și nici imagine Docker prefabricată; construiește imaginea din depozit. Depozitul documentează fiecare opțiune în `docs/usage.md`, ce se citește și ce nu se citește niciodată în `docs/scanned-data.md`, maparea pe cadre și sursele ei în `docs/frameworks.md`, iar limitele în `docs/limitations.md`.

## Limite și probleme cunoscute {#limits}

- **Un ajutor de inventariere.** Nu certifică, nu auditează și nu oferă consultanță juridică, iar rapoartele sale nu stabilesc conformitatea cu vreo reglementare sau standard. Măsurile organizaționale (strategie, foaie de parcurs, clasificarea datelor, responsabilități) rămân „To be completed".
- **Domeniu.** QoreScan scanează doar sursele spre care îl îndrepți. Datele stocate, backup-urile, HSM-urile, sistemele de gestionare a cheilor, configurația sistemului de operare și a bibliotecilor, portofelele, bridge-urile și serviciile off-chain sunt în afara scanării, dacă nu adaugi endpointurile lor TLS cu `--tls`. Nu scanează bridge-uri.
- **Stare live.** Registrul de algoritmi provine din `genesis.json` și reflectă rețeaua la genesis, nu modificările ulterioare de guvernanță. Cheile de consens ale validatorilor sunt citite pentru ultimul set de validatori.
- **TLS.** Un handshake cu preferințele implicite ale clientului Go arată ce negociază serverul cu un client modern, nu fiecare versiune, suită sau grup pe care le acceptă. Un endpoint din spatele unui load balancer poate răspunde diferit pe o altă conexiune.
- **Semnatari la distanță.** Cu `priv_validator_laddr` setat, cheia validatorului se află în altă parte, iar tipul ei nu este vizibil din home-ul nodului.
- **Solidity.** Detectarea este textuală. Nu rezolvă importuri, nu urmărește moștenirea și nu calculează adrese la rulare. O adresă de precompilare asamblată la rulare este ratată, iar o variabilă numită ca un tipar poate fi raportată. Dependențele sunt omise, dacă nu transmiți `--include-deps`.
- **CBOM-uri ale altor instrumente.** Rapoartele clasifică CBOM-urile altor instrumente doar după numele algoritmului.
- **Date.** Categoriile NIST și tranzițiile IR 8547 sunt preluate din documentele citate, la situația din octombrie 2026. Ghidurile specifice unei aplicații pot stabili date mai devreme.
- **Șirul de versiune.** Un binar construit din sursă fără o opțiune de versiune afișează `qorescan dev`. Folosește binarul de release sau instalarea Go a versiunii etichetate când ai nevoie ca versiunea să fie înregistrată.

## Pagini conexe {#related}

- [Semnarea post-cuantică](/developer-guide/post-quantum-signing): secp256k1 hibrid plus ML-DSA-87 pe lane-ul nativ și fereastra de autorizare EVM.
- [Custody kit](/developer-tools/custody-kit): ghid de integrare și cod de referință pentru custozi și burse.
- [QoreSign](/qoresign/overview): biblioteci de semnare și verificare hibridă.
- [Rularea unui nod](/developer-guide/running-a-node) și [rularea unui validator](/developer-guide/running-a-validator): structura home-ului nodului, semnatari la distanță și fișiere de chei.
- [Precompilările EVM](/developer-guide/evm-precompiles): precompilările PQC `0x0A01` și `0x0A02`.
- [Biblioteca post-cuantică (qorechain-pqc)](/developer-tools/pqc-library): ML-DSA-87 în șase limbaje.
- [Conectarea la mainnet](/getting-started/connecting-to-mainnet) și [conectarea la testnet](/getting-started/connecting-to-testnet): endpointuri publice.
