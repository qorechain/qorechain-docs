---
slug: /qorel/overview
title: Prezentare generală QORel
sidebar_label: Prezentare generală
sidebar_position: 1
---

# QORel

QORel este relayer-ul IBC al QoreChain. Un relayer este programul care transportă pachete IBC, dovezi și actualizări de client între două lanțuri; fără unul în funcțiune, un transfer printr-un canal IBC rămâne în așteptare. QORel este destinat operatorilor, validatorilor și echipelor care vor să ruleze relay-ul pentru un canal QoreChain, precum și oricui are nevoie de un relayer care poate trimite tranzacții către QoreChain.

QoreChain cere o semnătură hibridă post-cuantică (secp256k1 plus ML-DSA-87, FIPS 204) la fiecare tranzacție de pe lane-ul nativ, iar un relayer standard nu o produce, deci QoreChain îi refuză tranzacțiile. QORel adaugă această semnătură pentru QoreChain și semnează în modul standard orice alt lanț Cosmos SDK. Este un singur binar, `qorel`, publicat sub Apache-2.0. Este un fork al [Hermes](https://github.com/informalsystems/hermes) 1.13.3, relayer-ul IBC scris de Informal Systems (Apache-2.0); meritul pentru motorul relayer-ului le aparține lor, iar QORel păstrează comenzile și configurația Hermes pentru fiecare lanț care nu are nevoie de semnătura suplimentară.

QORel 0.1.0 este **doar pentru testnet**. A făcut relay între testnet-ul QoreChain `qorechain-diana` și testnet-ul public Cosmos Hub (chain ID `provider`). IBC pe mainnet nu este încă deschis; suportul pentru mainnet vine mai târziu, când se deschide acolo un canal.

## Inovații {#innovations}

- **Mod de semnare per lanț.** Fiecare lanț din configurație are `signing`. `'qorechain-hybrid'` adaugă semnătura ML-DSA-87 pe care o verifică QoreChain. Valoarea implicită, `'standard'`, produce tranzacții identice octet cu octet cu Hermes, astfel încât același proces QORel face relay pentru QoreChain și pentru partea Cosmos Hub în paralel.
- **Un strat de semnare conectabil.** Crate-ul `qorel-signer` definește o primitivă post-cuantică, regulile octeților de semnat ai unui lanț și un semnatar de extensie a tranzacției ca piese separate. Relayer-ul îl apelează după ce auth info este finală și înainte ca documentul de semnare clasic să fie construit, iar simularea de gas trece prin aceeași cale. Un lanț cu o altă semnătură suplimentară are nevoie de un framer nou în acel crate, nu de o modificare a relayer-ului. Vezi [Semnarea din orice limbaj](/qorel/signing-from-any-language) pentru contract.
- **Gestionarea cheilor post-cuantice în comenzile pentru chei.** `qorel keys add` derivă cheia ML-DSA-87 din același mnemonic ca și contul, cu derivarea de portofel QoreChain, astfel încât cheia relayer-ului se potrivește cu ce ar deriva QoreX sau SDK-ul. `qorel keys register-pqc` înregistrează cheia publică o singură dată, cu o dovadă de posesie. `qorel keys pqc-status` raportează dacă cheia este pregătită.
- **O verificare înainte de fiecare trimitere.** Înainte de fiecare tranzacție către un lanț hibrid, QORel confirmă că cheia post-cuantică este înregistrată în lanț și este aceeași cheie pe care o deține local, și citește din lanț versiunea octeților de semnat. Dacă ceva nu este în regulă, nu trimite nimic, deci nu se cheltuiește nicio taxă pe o tranzacție pe care lanțul ar refuza-o.
- **Prețul de gas din piața de taxe a QoreChain.** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` citește taxa de bază a lanțului (minim 0.1 uqor per gas) în loc să folosească o estimare fixă.
- **Detectarea comportamentelor necorespunzătoare (misbehaviour) pe lanțurile ibc-go v10.** ibc-go v10 nu mai pune header-ul în evenimentele `update_client`, iar Hermes 1.13 standard dezactivează detectarea pe aceste lanțuri. QORel citește în schimb header-ul din tranzacția `MsgUpdateClient`, astfel încât detectarea continuă să ruleze.
- **Reziliență la endpoint-uri cu limitare de rată.** Worker-ii de pachete rămân activi și reîncearcă la fiecare interval de golire cât timp o încercare de relay sau de golire a eșuat, de exemplu după ce un endpoint public răspunde scurt cu `429`. Se opresc din inactivitate doar după ce o rundă de golire reușește.
- **Fișiere de chei doar pentru proprietar.** Fișierele de chei, inclusiv seed-ul post-cuantic stocat, sunt scrise cu modul 0600.
- **Testat pe o rețea reală.** Primul canal IBC de pe testnet-ul QoreChain, `transfer/channel-0` pe `qorechain-diana` către `channel-600` pe testnet-ul public Cosmos Hub, este transmis de QORel. Transferurile au fost testate în ambele direcții, la fel ca returnarea unui token transferat și rambursarea automată a unui transfer expirat. Vezi [Canalul de test](/user-guide/bridging-assets#ibc-test-channel).

Lista completă pentru fiecare versiune este la [Noutăți](/qorel/whats-new).

## Conexiunea live de testnet {#testnet-connection}

| | `qorechain-diana` | Testnet-ul public Cosmos Hub (`provider`) |
|---|---|---|
| Client light | `07-tendermint-0` | `07-tendermint-466` |
| Conexiune | `connection-0` | `connection-315` |
| Canal | `transfer/channel-0` (`STATE_OPEN`, neordonat, versiune `ics20-1`) | `transfer/channel-600` |

Pe această conexiune există două trasee de token. ATOM pe testnet-ul QoreChain este `ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2` (traseu `transfer/channel-0/uatom`). QOR pe testnet-ul Hub este `ibc/BB4D5A9372637A885CC895F775B38B127354A31F3E20D8F6FB3997E34BF4AA4A` (traseu `transfer/channel-600/uqor`). Un pull request în chain-registry care adaugă această cale ([cosmos/chain-registry#8086](https://github.com/cosmos/chain-registry/pull/8086)) este deschis și nefuzionat. Mainnet-ul nu are niciun canal IBC.

Ce a fost testat: transferuri în ambele direcții (1 QOR trimis, 0.1 ATOM primit, 0.4 QOR returnat) și rambursarea automată a unui transfer cu timeout de 1 secundă, transmis ca mesaj de timeout. Toate cele 13 tranzacții ale relayer-ului pe `qorechain-diana` au reușit (cod 0).

### Ce are nevoie un relayer terț {#third-party}

Testnet-ul acceptă doar tipul de client light `07-tendermint` (`/ibc/core/client/v1/params` listează `allowed_clients = ["07-tendermint"]`); astăzi nu se poate crea niciun client `08-wasm`. Pentru a deschide un canal către QoreChain, un relayer are nevoie de:

- un client `07-tendermint` pe fiecare parte;
- pe partea QoreChain, fiecare tranzacție semnată hibrid de un cont de relayer a cărui cheie ML-DSA-87 este înregistrată. QORel face acest lucru; Hermes standard, relayer-ul Go (`rly`) și ts-relayer sunt respinse;
- un canal de transfer ICS-20 cu versiunea `ics20-1`.

Nu există nici o listă de relayeri permiși pentru configurația clientului IBC v2 (`/ibc/core/client/v2/config/07-tendermint-0` răspunde `allowed_relayers: []`). Pachetele IBC v2 folosesc timeout-uri absolute în secunde Unix. QORel nu face încă relay pentru IBC v2.

## qorel-signer {#qorel-signer}

Semnatarul este un crate separat, `qorel-signer`, în depozitul QORel la `crates/qorel-signer`. Nu este pe crates.io; folosiți-l ca dependență git. Ce garantează:

- **Co-semnatar conectabil.** Semnătura suplimentară a unui lanț este adăugată de un co-semnatar, iar lanțurile cu semnare standard nu folosesc niciunul, deci tranzacțiile lor rămân neschimbate.
- **Octeți protobuf bruți.** Lucrează pe octeți codificați și nu depinde de niciun tip IBC sau de relayer.
- **O politică pentru corp.** Refuză corpurile pe care lanțul le-ar respinge: o opțiune de extensie critică existentă, flag-ul `unordered` sau câmpuri necunoscute.
- **Fără presupuneri despre versiune.** Nu revine niciodată la octeți de semnat v1 pe rețelele QoreChain înainte ca versiunea octeților de semnat să fie cunoscută.
- **Semnături autoverificate.** Fiecare semnătură este verificată înainte de utilizare.
- **Secrete tratate corect.** Secretele sunt zeroizate și mascate în ieșirea `Debug`.
- **Teste octet cu octet.** Testele reconstruiesc, octet cu octet, tranzacții de relay pe care ante handler-ul lanțului le-a acceptat.

Un exemplu de utilizare se află în `crates/qorel-signer/README.md` din depozit; vezi și [Semnarea din orice limbaj](/qorel/signing-from-any-language#signer-layer). Același hook de semnare este propus în amonte, în Hermes, ca [informalsystems/hermes#4435](https://github.com/informalsystems/hermes/pull/4435) (deschis, nefuzionat).

## Cum se folosește {#how-to-use}

Instalați binarul, scrieți o configurație cu câte o intrare pentru fiecare lanț, adăugați o cheie pentru fiecare lanț, înregistrați cheia post-cuantică pe QoreChain, verificați starea, apoi porniți relayer-ul:

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana    # ready_to_relay must be true
qorel health-check
qorel start
```

Paginile din această secțiune:

| Pagină | Ce acoperă |
|---|---|
| [Noutăți](/qorel/whats-new) | Ce adaugă 0.1.0 peste Hermes |
| [Instalare](/qorel/install) | Tarball, `.deb`, `.rpm`, Homebrew, container, din sursă și cum se verifică fiecare |
| [Pornire rapidă](/qorel/quickstart) | De la instalare la un prim transfer pe testnet |
| [Configurare](/qorel/configuration) | Intrarea pentru lanțul QoreChain, cheile, gas-ul și verificările de siguranță |
| [Rularea alături de un validator](/qorel/running-next-to-a-validator) | Aranjamente systemd, Docker Compose și Kubernetes |
| [Monitorizare](/qorel/monitoring) | Telemetrie, pentru ce să configurați alerte |
| [Semnarea din orice limbaj](/qorel/signing-from-any-language) | Contractul semnăturii hibride și bibliotecile pentru cinci limbaje |
| [Depanare](/qorel/troubleshooting) | Întrebări și remedii |

## Cum se accesează {#how-to-access}

- **Rețea.** Doar testnet-ul `qorechain-diana` (testnet-ul rulează v3.2.6). Mainnet-ul `qorechain-vladi` nu are niciun canal IBC deschis; vezi [Punți pentru active](/user-guide/bridging-assets#ibc-testnet-v326) pentru ce are fiecare rețea.
- **Contraparte.** Testnet-ul public Cosmos Hub, chain ID `provider`, prin `channel-600`. Orice alt lanț Cosmos SDK funcționează în același mod ca intrarea `provider` din configurația exemplu.
- **Endpoint-uri.** QORel are nevoie de un RPC de consens, un WebSocket și un endpoint gRPC pentru fiecare lanț. Testnet-ul QoreChain are RPC public (`https://rpc-testnet.qore.host`) și REST public (`https://api-testnet.qore.host`), dar astăzi nu are un endpoint gRPC public și nu se promite unul, deci un relayer terț pentru `qorechain-diana` are nevoie de propriul nod de testnet ([Rularea unui nod](/developer-guide/running-a-node), [Conectarea la Testnet](/getting-started/connecting-to-testnet)). Endpoint-urile publice care limitează rata relayer-ilor pot fi folosite pentru un test scurt, dar nu pentru un relay constant.
- **Conturi.** Un cont de relayer dedicat pe fiecare lanț, cu un sold mic pentru taxe. QOR de testnet vine de la [Faucet-ul din Dashboard](/dashboard/faucet); nu are valoare. Nu folosiți niciodată cheia operatorului unui validator.
- **Cost.** QORel este gratuit. Pe QoreChain o tranzacție costă gas înmulțit cu prețul, cu un minim de 0.1 uqor per gas, iar întreaga taxă este percepută fără rambursare.
- **Platforme.** Linux x86_64 și arm64 (glibc 2.28 sau mai nou), macOS Apple Silicon și Intel, și o imagine de container pentru orice altceva. Windows nu este suportat; folosiți containerul sub WSL2.

## Unde este publicat {#where-published}

| Unde | Ce | Versiune |
|---|---|---|
| [GitHub: qorechain/QORel](https://github.com/qorechain/QORel) | Sursă, issue-uri și pagina de release cu tarball-uri, `.deb`, `.rpm`, `SHA256SUMS` și atestări de build | 0.1.0 |
| Homebrew | `brew install qorechain/tap/qorel` | 0.1.0 |
| `ghcr.io/qorechain/qorel` | Imagine de container (amd64 și arm64, distroless, non-root, semnată cu cosign) | 0.1.0 |
| Crate-ul `qorel-signer` | Stratul de semnare, în depozit la `crates/qorel-signer`; folosiți o dependență git | Nu este pe crates.io |

Licență: Apache-2.0. QORel este derivat din Hermes, copyright Informal Systems Inc. și autorii Hermes, tot sub Apache-2.0; fișierul `NOTICE` al depozitului conține atribuirea. Vezi [Instalare](/qorel/install) pentru comenzi și pentru cum se verifică o descărcare.

Pentru celelalte pachete pentru dezvoltatori vezi [Pachete pentru dezvoltatori](/developer-tools/overview). Pentru felul în care IBC se încadrează în lanț vezi [Arhitectura punții](/architecture/bridge-architecture#ibc-relayer).

## Limite și probleme cunoscute {#limits}

- **Doar testnet.** QORel a fost rulat pe `qorechain-diana` și pe testnet-ul public Cosmos Hub. Nu a făcut relay pe mainnet și nu este deschis niciun canal IBC de mainnet.
- **Doar IBC v1 (clasic).** Relay-ul pentru IBC v2 nu este încă implementat în QORel; este faza următoare. Relay-ul pentru Ethereum (Eureka) nu a fost început.
- **Versiunea lanțului.** Modul hibrid urmează versiunea octeților de semnat raportată de lanț. Ambele rețele QoreChain verifică astăzi forma curentă (versiunea 2).
- **Fără relayer găzduit.** Acest manual nu oferă un serviciu de relayer. Dacă niciun relayer nu rulează pentru un canal, un transfer rămâne în așteptare până când pornește unul.
- **Endpoint-uri publice.** Partea QoreChain are nevoie de gRPC, care nu este public. Endpoint-urile publice ale terților pentru alte lanțuri limitează adesea rata relayer-ilor.
- **Nu este un portofel.** QORel semnează doar tranzacțiile pe care le trimite ca relayer. Pentru semnarea în portofel vezi [QoreSign](/qoresign/overview).
- **Fără build pentru Windows.** Folosiți containerul sub WSL2.
- **Starea versiunii.** QORel este o versiune 0.x. Comenzile și setările identice cu cele din Hermes păstrează comportamentul Hermes; setările specifice QoreChain se pot schimba încă înainte de 1.0.
