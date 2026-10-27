---
slug: /qorel/signing-from-any-language
title: Semnarea tranzacțiilor QoreChain din orice limbaj
sidebar_label: Semnare din orice limbaj
sidebar_position: 8
---

# Semnarea tranzacțiilor QoreChain din orice limbaj

QORel semnează în Rust cu crate-ul `qorel-signer`. Alte relayere, boți și unelte pot produce aceeași semnătură hibridă post-cuantică în alte limbaje, cu SDK-ul QoreChain și bibliotecile post-cuantice. Această pagină enunță contractul pe care îl urmează toate și listează biblioteca de folosit pentru Rust, TypeScript, Go, Python și Java. Este destinată dezvoltatorilor care construiesc un relayer, un bot sau un backend ce trimite tranzacții către QoreChain.

## Inovații {#innovations}

- **Un contract, un singur set de vectori de test.** Fiecare limbaj construiește aceiași octeți de semnat și aceeași extensie. Depozitul QORel publică vectori reconstruiți octet cu octet din tranzacții acceptate de lanț, astfel încât puteți verifica o implementare înainte să atingă o rețea.
- **Extensia este singura adăugare.** Semnătura post-cuantică călătorește într-o singură opțiune de extensie a corpului tranzacției; mesajele, taxele și semnătura clasică își păstrează forma obișnuită.
- **Punctul de cuplare este îngust.** Semnătura este adăugată după ce auth info este finală și înainte ca documentul de semnare clasic să fie construit. Un relayer are nevoie de o singură modificare în acel punct, nu de o rescriere.
- **Aceeași cheie peste tot.** Cheia ML-DSA-87 este derivată din mnemonicul contului cu derivarea de portofel QoreChain, deci orice portofel sau relayer care importă mnemonicul obține aceeași cheie post-cuantică.

## Cum se folosește {#how-to-use}

### Contractul {#contract}

QoreChain acceptă o tranzacție de pe lane-ul nativ doar dacă poartă ambele semnături:

- **Semnătura clasică secp256k1**, în forma obișnuită `SIGN_MODE_DIRECT`. Acoperă corpul final, extensia inclusă.
- **O semnătură ML-DSA-87 (FIPS 204)** într-o opțiune de extensie a corpului, de tipul `/qorechain.pqc.v1.PQCHybridSignature`, cu `algorithm_id = 1`, `pqc_signature` (4,627 de octeți) și un `pqc_public_key` opțional (2,592 de octeți). Trebuie să fie singura opțiune de extensie critică (în `extension_options`) a tranzacției.

Semnătura ML-DSA acoperă octeții de semnat (versiunea 2, curentă pe ambele rețele):

```
"qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id
                          || BE32(len(B0)) || B0
                          || BE32(len(A))  || A
```

- `B0` este `TxBody` fără extensia PQC, recodat canonic.
- `A` sunt octeții `AuthInfo`, neschimbați.

Ordinea operațiunilor:

1. Construiți corpul și auth info.
2. Semnați octeții de semnat cu ML-DSA-87.
3. Adăugați extensia la corp.
4. Semnați corpul final cu secp256k1.
5. Difuzați.

Reguli ușor de greșit:

- `B0` trebuie să fie canonic, deoarece lanțul îl rederivă decodând corpul, eliminând opțiunea hibridă și recodând. Nu trimiteți corpuri cu propriile opțiuni de extensie, cu flagul `unordered`, cu câmpuri necunoscute sau cu o codificare necanonică.
- Un refuz cu codespace `pqc` code 21 înseamnă că semnătura hibridă nu s-a verificat. Recitiți versiunea octeților de semnat și înregistrarea contului înainte de a reîncerca; vezi [Semnarea post-cuantică](/developer-guide/post-quantum-signing#code-21).
- Gas: verificarea costă 2,000 de unități de gas per semnatar cu cheie, plus costul de dimensiune al aproximativ 4.7 KB de extensie. Simulați prin aceeași cale pentru ca ambele să fie numărate.

### Înregistrarea și derivarea cheii {#keys}

Contul își înregistrează o singură dată cheia publică ML-DSA cu `MsgRegisterPQCKeyV2`, incluzând o dovadă de posesie. Aceasta este singura tranzacție pe care QoreChain o acceptă doar cu semnătura clasică. Vezi [Semnarea post-cuantică](/developer-guide/post-quantum-signing#pqc-key-registration).

Cheia ML-DSA este derivată din același mnemonic ca și contul:

```
seed = SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)[:32]
```

apoi `ML-DSA-87.KeyGen_internal(seed)`. Secretele sunt zeroizate și nu sunt afișate niciodată. Aceeași derivare este descrisă la [Derivarea cheilor](/qoresign/guides/key-derivation).

### Stratul de semnare din QORel {#signer-layer}

Crate-ul `qorel-signer` împarte munca în trei interfețe:

- `PqSigner`: o primitivă post-cuantică (`algorithm_id`, `public_key`, `sign`). `MlDsa87Signer` este oferit, cu semnare hedged implicit și semnare deterministă pentru vectorii de test; fiecare semnătură este verificată înainte de utilizare.
- `SignBytesFramer`: regulile unui lanț (`check_body`, `frame`, `pack`).
- `TxExtensionSigner`: ce apelează relayer-ul. `PqExtensionSigner` combină o primitivă și un framer.

Relayer-ul construiește o tranzacție în această ordine: codifică corpul fără nicio extensie de co-semnatar (`B0`); codifică auth info finală (`A`); cere co-semnatarului opțiunile de extensie de adăugat; recodifică corpul cu ele; face semnătura clasică peste documentul de semnare al corpului final. Pentru a folosi crate-ul din Rust, depindeți de el din depozit (nu este pe crates.io):

```toml
[dependencies]
qorel-signer = { git = "https://github.com/qorechain/QORel", tag = "qorel-v0.1.0" }
```

Un apel complet, care construiește semnatarul hibrid pentru un lanț și îi cere opțiunile de extensie, se află în `crates/qorel-signer/README.md` din depozit. Crate-ul lucrează pe octeți protobuf bruți, refuză corpurile pe care lanțul le-ar respinge (o opțiune de extensie critică existentă, `unordered`, câmpuri necunoscute), nu revine niciodată la octeți de semnat v1 pe rețelele QoreChain înainte ca versiunea să fie cunoscută, verifică fiecare semnătură pe care o face și zeroizează secretele și le maschează în ieșirea `Debug`. Testele sale reconstruiesc, octet cu octet, tranzacții pe care ante handler-ul lanțului le-a acceptat. Vezi și [qorel-signer în prezentarea generală](/qorel/overview#qorel-signer).

Un lanț care are nevoie de o altă semnătură suplimentară implementează un framer, și o primitivă nouă dacă algoritmul diferă; nimic altceva din relayer nu se schimbă.

### Biblioteci {#libraries}

| Limbaj | Pachet | Semnare hibridă |
|---|---|---|
| Rust | `qorechain-sdk` (crates.io), sau `qorel-signer` din [depozitul QORel](https://github.com/qorechain/QORel) (`crates/qorel-signer`) | `qorel_signer::qorechain::qorechain_hybrid_signer` cu `PqExtensionSigner`; `qorechain::tx::build_hybrid_tx` |
| TypeScript și JavaScript | `npm install @qorechain/sdk` | `TxClient` semnează hibrid cu un `pqcKeypair`; `ensurePqcRegistered` |
| Go | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | `qorechain/tx` (construire și semnare hibridă), `qorechain/signbytes`, `qorechain/pqcdx` |
| Python | `pip install qorechain-sdk` | `build_hybrid_tx`, `build_hybrid_signature_extension` |
| Java și Kotlin | `io.github.qorechain:qorechain-sdk` (Maven Central) | `PqcDx` (înregistrare, calea de trimitere hibridă) și constructorul de tranzacții hibride |
| C și altele | [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) | Binding-uri ML-DSA-87 pentru generare de chei, semnare și verificare; încadrați octeții de semnat ca mai sus |

Vezi [Pachete pentru dezvoltatori](/developer-tools/overview) pentru versiunea curentă a fiecărui pachet și [QoreSign](/qoresign/overview) pentru semnarea într-un portofel sau backend. Clienții doar clasici din unele pachete nu pot trimite tranzacții pe lane-ul nativ; verificați pagina pachetului înainte de a-l folosi pentru scrieri.

### Vectori de test {#test-vectors}

`crates/qorel-signer/tests/vectors/` din depozitul QORel conține:

- un fișier de răspunsuri cunoscute pentru octeții de semnat;
- vectori de tranzacții de relay: corpul fără extensie, octeții de semnat, octeții extensiei și tranzacția completă semnată, reconstruite octet cu octet din tranzacții acceptate de lanț;
- vectorul de derivare a cheii între SDK-uri.

Rulați-i în limbajul dumneavoastră înainte de a trimite ceva către o rețea live. Vectorii QoreSign sunt la [Vectori de test](/qoresign/vectors).

### Adăugarea semnării post-cuantice la un alt relayer {#other-relayers}

Punctul de cuplare este „după ce auth info este finală și înainte ca documentul de semnare clasic să fie construit". Conectați extensia acolo:

- În relayerele bazate pe Hermes, acesta este `crates/relayer/src/chain/cosmos/encode.rs::sign_tx`. Modificarea QORel de acolo este generică: orice `TxExtensionSigner` poate adăuga opțiuni de extensie.
- În relayerele Go construite pe pachetul Cosmos SDK `client/tx`, înfășurați `TxBuilder` înainte de `SetSignatures`.

## Cum se accesează {#how-to-access}

- **Rețea.** Contractul este același pe ambele rețele QoreChain; QORel în sine este testat doar pe testnet.
- **Cheie și cont.** Un cont alimentat cu o cheie ML-DSA-87 înregistrată; QOR de testnet de la [Faucet-ul din Dashboard](/dashboard/faucet).
- **Cost.** Bibliotecile sunt gratuite (Apache-2.0). Tranzacțiile plătesc gas la un minim de 0.1 uqor per gas.

## Unde este publicat {#where-published}

| Pachet | Registru | Sursă |
|---|---|---|
| `qorel-signer` | În depozit (`crates/qorel-signer`); nu este pe crates.io, folosiți dependența git de mai sus | [qorechain/QORel](https://github.com/qorechain/QORel) |
| `qorechain-sdk`, `@qorechain/sdk`, modulul Go, artefactul Maven | crates.io, npm, Go proxy, Maven Central, PyPI | [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk) |
| `qorechain-pqc` | npm, PyPI, crates.io, Go, Maven | [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc) |

## Limite și probleme cunoscute {#limits}

- **Doar ML-DSA-87 (algorithm id 1).** Acesta este singurul algoritm cu care semnează QORel și bibliotecile de mai sus.
- **Versiunea octeților de semnat.** Această pagină documentează versiunea 2, pe care o verifică ambele rețele. O unealtă trebuie totuși să citească versiunea din lanț (înregistrările de upgrade aplicate) în loc să o presupună; QORel o face.
- **Semnarea este locală.** Niciuna dintre aceste biblioteci nu păstrează o cheie în locul dumneavoastră și nu semnează printr-un portofel hardware.
- **Exemplele pe limbaje nu sunt repetate aici.** Folosiți pornirea rapidă a fiecărui pachet; acest manual nu afirmă că fiecare limbaj a fost rulat pe vectorii de test QORel.
