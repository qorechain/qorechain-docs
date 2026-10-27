---
slug: /developer-tools/pq-light-client
title: Client ușor PQ
sidebar_label: Client ușor PQ
sidebar_position: 31
---

# Clientul ușor PQ (`qorechain-pq-light-client`)

`qorechain-pq-light-client` este o specificație în formă de schiță și un verificator de referință pentru checkpoint-uri semnate cu ML-DSA-87 (FIPS 204). În designul propus, validatorii semnează un checkpoint scurt la sfârșitul fiecărei epoci cu o cheie de checkpoint ML-DSA-87 separată, iar un client ușor urmărește lanțul de checkpoint-uri verificând aceste semnături și nimic altceva. Este destinat cercetătorilor de protocol, dezvoltatorilor de relayere și punți și echipelor de pe alte lanțuri care vor să revizuiască designul și să testeze cu el. Versiunea **0.1.0**, Apache-2.0, întreținută de Asociația QoreChain.

**Lanțul nu acceptă aceste checkpoint-uri și nimic nu este programat.** QoreChain nu produce checkpoint-urile pe care le verifică acest pachet, nici pe mainnet (`qorechain-vladi`), nici pe testnet (`qorechain-diana`). Nicio versiune de lanț nu le acceptă și nu este planificată nicio actualizare sau dată. Cheile de consens ale validatorilor sunt astăzi ed25519, nu post-cuantice. Pachetul nu poate urmări o rețea live: rulează pe seturi de validatori simulate și pe vectorii de test partajați. Nu face post-cuantică nicio rută, punte sau canal IBC QoreChain.

## Inovații {#innovations}

- **Checkpoint-uri în loc de semnături pe fiecare bloc.** Validatorii ar semna un checkpoint pe epocă (ID-ul lanțului, epoca, înălțimea, timpul, hash-ul antetului, hash-ul aplicației, hash-ul setului care semnează și hash-ul setului următor). Semnăturile ar circula în tranzacții obișnuite, deci producția de blocuri nu le așteaptă niciodată, iar volumul de date rămâne mult sub cel al semnării fiecărui bloc. Specificația (secțiunea 12) dă raționamentul.
- **O cheie de checkpoint separată, cu dovadă de posesie.** Fiecare validator ar înregistra o cheie de checkpoint ML-DSA-87, separată de cheia lui de consens și de orice cheie de cont, cu o dovadă de posesie peste `"qorechain-pqlc-key-pop-v1|" || chain_id || operator address || consensus address || public key`.
- **Predarea setului de către setul care iese.** Un checkpoint este acceptat atunci când validatorii care dețin strict mai mult de două treimi din puterea setului numit de ultimul checkpoint de încredere l-au semnat, deci schimbările setului de validatori sunt întotdeauna semnate de setul care iese. Exact două treimi nu înseamnă cvorum, iar o semnătură de la un non-membru invalidează checkpoint-ul în loc să fie ignorată.
- **O singură codificare per obiect.** Checkpoint-ul, setul de validatori și checkpoint-ul semnat au codificări canonice, iar decodoarele acceptă exact o codificare pentru fiecare. Un relayer transmite octeții canonici neschimbați.
- **Ordine fixă a verificărilor.** `verifyCheckpoint` rulează verificările într-o ordine specificată, astfel încât TypeScript, Rust și Go returnează același cod de eroare pentru aceeași intrare.
- **Dovezi de comportament necorespunzător.** Două checkpoint-uri diferite pentru aceeași epocă, fiecare cu cvorum, reprezintă comportament necorespunzător. `detectMisbehaviour` returnează ambele checkpoint-uri într-o ordine canonică, dublii semnatari și puterea lor.
- **Trei limbaje, un singur set de vectori.** Vectorii partajați (`vectors/pq-light-client-v1.json`) provin dintr-un simulator determinist și acoperă lanțuri de checkpoint-uri cu 4 și 21 de validatori, rotații de set, fiecare respingere pe care o poate produce verificatorul, checkpoint-uri conflictuale și cazuri de decodor. Go, Rust și TypeScript le trec pe toate, deci o a patra implementare poate dovedi că se potrivește octet cu octet.

## Cazuri de utilizare {#use-cases}

1. **Dezvoltatorii de relayere prototipează o cale de actualizare post-cuantică.** Un relayer Rust păstrează o stare de încredere per rețea, decodează și verifică fiecare checkpoint semnat, transmite aceiași octeți către destinație și se oprește la `CONFLICTING_CHECKPOINT`. Astăzi rulează pe vectori sau pe un lanț simulat personalizat; ghidul pentru relayere din repository arată bucla.
2. **Echipele IBC și de punți evaluează designul.** Secțiunea 14 a specificației asociază checkpoint-urile cu un tip de client ușor IBC (starea clientului, starea de consens, comportament necorespunzător, dovezi de apartenență la înălțimile checkpoint-urilor). Echipele pot revizui asocierea și compromisurile ei înainte să existe ceva pe lanț. Este o notă de design; nu există cod pentru ea.
3. **Echipele de pe lanțuri EVM sau Solana compară designuri de verificator.** Secțiunea 15 compară verificarea ML-DSA-87 pe lanț, o dovadă STARK a verificării și un set de atestatori, inclusiv care alegeri păstrează proprietatea post-cuantică și care o abandonează. De asemenea doar note de design. Pentru referință, EVM-ul propriu al QoreChain are un precompile de verificare ML-DSA (`pqcVerify`, 0x0A01) care este activ doar pe testnet; vezi [Precompile-uri EVM](/developer-guide/evm-precompiles).
4. **Revizorii de securitate și cercetătorii verifică regulile.** Ordinea verificărilor, regula cvorumului, predarea setului, perioada de încredere și dovezile de comportament necorespunzător sunt specificate și testabile în trei limbaje.
5. **Echipele care vorbesc despre rute își formulează corect afirmațiile.** Pagina de poziție din repository definește când o rută poate fi numită post-cuantică (vezi [Limite](#limits)).
6. **Implementatori în alte limbaje.** Vectorii permit unei implementări noi să dovedească că se potrivește cu referința.

## Cum funcționează {#how-it-works}

Tot ce se află în această secțiune este designul propus și tot necesită suport de lanț care nu este programat.

1. Fiecare validator înregistrează o cheie de checkpoint ML-DSA-87 cu o dovadă de posesie (mai sus).
2. La sfârșitul fiecărei epoci, validatorii semnează un checkpoint: ID-ul lanțului, epoca (strict crescătoare), înălțimea, timpul, hash-ul antetului, hash-ul aplicației, hash-ul setului care semnează acest checkpoint și hash-ul setului care îl semnează pe următorul.
3. Un client ușor acceptă un checkpoint semnat de mai mult de două treimi din puterea setului numit de ultimul său checkpoint de încredere.
4. Două checkpoint-uri diferite pentru aceeași epocă, fiecare cu cvorum, reprezintă comportament necorespunzător; dovada numește dublii semnatari.

Consensul pe fiecare bloc ar rămâne neschimbat. Înălțimile din interiorul unei epoci rămân clasice până la următorul checkpoint; un client care are nevoie de garanția post-cuantică folosește înălțimile checkpoint-urilor și acceptă până la o epocă de latență.

**Formate** (toate numerele întregi big-endian, octet de versiune `0x01`):

| Obiect | Structură | Dimensiune |
|---|---|---|
| Checkpoint | versiune, lungimea și octeții ID-ului lanțului, epocă, înălțime, timp, hash antet, hash aplicație, hash set de validatori, hash set următor de validatori | `154 + len(chain_id)` octeți (169 pentru `qorechain-vladi`) |
| Set de validatori | versiune, număr (1 până la 256), apoi per validator: adresă de 20 de octeți, putere de 8 octeți, cheie ML-DSA-87 de 2.592 de octeți, sortate după adresă | `3 + 2,620 x validators` octeți |
| Checkpoint semnat | versiune, checkpoint, număr de semnături, per semnatar o adresă de 20 de octeți și o semnătură de 4.627 de octeți (sortate după adresă), indicator de set următor, setul următor când setul se schimbă | `173 + 4,647 x signers` octeți pentru `qorechain-vladi`, plus setul următor când este prezent |

**Semnătură și hash.** ML-DSA-87, modul pur FIPS 204, context gol, peste `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)`. Semnarea deterministă și cea hedged sunt ambele valide. Hash-ul este SHAKE-256 cu ieșire de 32 de octeți; hash-ul setului de validatori folosește prefixul `qorechain-pqlc-valset-v1|`.

**Ordinea verificării** (`verifyCheckpoint`): structură, ID de lanț, expirarea încrederii, deriva ceasului, tratarea aceleiași epoci (identic dă `NOT_NEWER`; diferit cu cvorum dă `CONFLICTING_CHECKPOINT`), progresul epocii, al înălțimii și al timpului, setul care semnează este egal cu setul următor de încredere, setul următor transportat se potrivește cu hash-ul lui, cvorum. Un eșec lasă neschimbată starea de încredere. O epocă ulterioară poate fi acceptată direct cât timp setul care semnează nu s-a schimbat; după o rotație, fiecare checkpoint de la rotație încolo trebuie verificat.

**Încredere.** Un client pornește de la o rădăcină de încredere aleasă în afara protocolului, ca orice client ușor proof-of-stake. Perioada de încredere trebuie să fie mai scurtă decât perioada în care un validator mai poate fi penalizat; după ea, clientul trebuie reinițializat.

Specificația este `spec/pq-light-client-v1.md` din repository (stare: schiță, deschisă pentru revizuire). Secțiunea 10 (chei de checkpoint, semnare, epoci, penalizări pe lanț) este un design pentru revizuire, nu un angajament.

## Cum se folosește {#how-to-use}

### Instalare {#install}

| Limbaj | Instalare | Platformă minimă |
|---|---|---|
| TypeScript | `npm install @qorechain/pq-light-client` | Node.js 20.19 sau mai nou, și browsere. Depinde de `@qorechain/pqc` 0.2.3 |
| Rust | `cargo add qorechain-pq-light-client` (biblioteca `qorechain_pq_light_client`) | Rust stable; depinde de `qorechain-pqc` 0.2.3; fără `unsafe`, fără I/O |
| Go | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` (pachetul `pqlightclient`) | Go 1.25; depinde de `github.com/qorechain/qorechain-pqc/go` v0.2.3 |

Nu există pachet PyPI și niciunul nu este planificat.

### Quickstart (offline, TypeScript) {#quickstart}

Nimic nu atinge o rețea QoreChain. Scriptul urmărește lanțul simulat de checkpoint-uri cu 21 de validatori din vectorii partajați (ID de lanț `qorechain-sim-21`, inclusiv o rotație de set la epoca 2), apoi arată că sursa live nu este disponibilă. Cheile din vectori sunt chei de test publice.

```bash
mkdir pqlc && cd pqlc && npm init -y && npm pkg set type=module
npm install @qorechain/pq-light-client
curl -sLO https://raw.githubusercontent.com/qorechain/qorechain-pq-light-client/v0.1.0/vectors/pq-light-client-v1.json
```

```js
// follow.mjs: a TypeScript port of the repository's Rust relayer example.
import { readFileSync } from "node:fs";
import {
  PqLightClientError,
  decodeSignedCheckpoint,
  decodeValidatorSet,
  fetchCheckpoint,
  newTrustedState,
  verifyCheckpoint,
} from "@qorechain/pq-light-client";

const v = JSON.parse(readFileSync("pq-light-client-v1.json", "utf8"));
const hex = (s) => Uint8Array.from(Buffer.from(s, "hex"));

const root = decodeSignedCheckpoint(hex(v.signedCheckpoints["c21-e0-root"].encoded));
const set = decodeValidatorSet(hex(v.validatorSets.C21.encoded));
let state = newTrustedState({
  checkpoint: root.checkpoint,
  signatures: root.signatures,
  validatorSet: set,
  nextValidatorSet: set,
  trustingPeriod: 1_209_600n, // 14 days
  maxClockDrift: 10n,
});

for (const id of ["c21-e1", "c21-e2-rotate", "c21-e3"]) {
  const signed = decodeSignedCheckpoint(hex(v.signedCheckpoints[id].encoded));
  state = verifyCheckpoint(state, signed, signed.checkpoint.time + 5n);
  console.log(`trusted epoch ${state.checkpoint.epoch} at height ${state.checkpoint.height}`);
}

try {
  await fetchCheckpoint("https://rpc.example.invalid", state.checkpoint.chainId, 4n);
} catch (e) {
  if (e instanceof PqLightClientError) console.log("live source:", e.code);
}
```

Rulat pe 27 octombrie 2026 cu pachetul npm 0.1.0 publicat și cu vectorii de la eticheta v0.1.0, `node follow.mjs` a afișat:

```
trusted epoch 1 at height 11000
trusted epoch 2 at height 12000
trusted epoch 3 at height 13000
live source: REQUIRES_CHAIN_SUPPORT
```

Fișierul de vectori are aproximativ 2,4 MB. Originalul în Rust este `rust/examples/relayer.rs` din repository (`cargo run --example relayer`); nu a fost rulat pentru această pagină.

Tratarea erorilor în TypeScript (din README-ul pachetului):

```ts
try {
  trusted = verifyCheckpoint(trusted, decodeSignedCheckpoint(bytes), BigInt(Math.floor(Date.now() / 1000)));
} catch (e) {
  if (e instanceof PqLightClientError && e.code === "CONFLICTING_CHECKPOINT") {
    report(e.misbehaviour);
  }
}
```

Același lucru în Go:

```go
signed, err := pqlightclient.DecodeSignedCheckpoint(b)
if err != nil {
	return err
}
next, err := pqlightclient.VerifyCheckpoint(trusted, signed, uint64(time.Now().Unix()))
if errors.Is(err, pqlightclient.ErrConflictingCheckpoint) {
	// err.(*pqlightclient.Error).Misbehaviour holds the evidence
}
```

### API principal {#api}

API-ul este același în toate cele trei limbaje (camelCase în TypeScript, PascalCase în Go, snake_case în Rust). Câmpurile pe 64 de biți sunt `bigint` în TypeScript.

| Nume | Ce face |
|---|---|
| `Checkpoint`, `ValidatorSet`, `SignedCheckpoint`, `TrustedState`, `Misbehaviour` | tipuri de date |
| `encodeCheckpoint`, `decodeCheckpoint` | codificarea canonică a checkpoint-ului; decodor strict |
| `encodeValidatorSet`, `decodeValidatorSet`, `hashValidatorSet` | codificarea setului de validatori și hash-ul lui SHAKE-256 |
| `encodeSignedCheckpoint`, `decodeSignedCheckpoint` | octeții pe care îi transportă un relayer |
| `encodeCheckpointSignBytes` | sign-bytes, `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)` |
| `newTrustedState` | de la rădăcina de încredere la starea de încredere (verifică dacă ambele seturi dau hash-urile din checkpoint; nu verifică semnăturile) |
| `verifyCheckpoint(trusted, signed, now)` | verificare completă; returnează noua stare de încredere sau o eroare tipizată |
| `detectMisbehaviour(set, a, b)` | dovada pentru checkpoint-uri conflictuale, sau nimic |
| `signCheckpoint` | semnează un checkpoint cu o cheie secretă ML-DSA-87 (simulatoare și teste) |
| `CheckpointSource`, `fetchCheckpoint`, `chainCheckpointSource` (TypeScript) sau `ChainCheckpointSource` (Rust, Go) | interfețe pentru un viitor API de nod; astăzi eșuează mereu cu `REQUIRES_CHAIN_SUPPORT` și nu fac nicio cerere |
| `PqLightClientError` (TypeScript), `*Error` cu `ErrInsufficientPower` și similare (Go, folosiți `errors.Is`), `Error` cu `code()` (Rust) | erori tipizate cu coduri stabile |

Codurile de eroare, comune celor trei limbaje, și ce ar trebui să facă un relayer (din ghidul pentru relayere):

| Eroare | Acțiune |
|---|---|
| `MALFORMED` | renunțați la octeți; sursa este defectă |
| `CHAIN_ID_MISMATCH` | eroare de configurare |
| `TRUST_EXPIRED` | opriți-vă; reinițializați dintr-o rădăcină de încredere nouă |
| `FUTURE_CHECKPOINT` | verificați ceasul local; reîncercați mai târziu |
| `NOT_NEWER` | nimic nou; așteptați |
| `SET_MISMATCH` | lipsește un checkpoint cu rotație de set; aduceți epocile dintre ele |
| `UNKNOWN_VALIDATOR`, `BAD_SIGNATURE` | renunțați la checkpoint |
| `INSUFFICIENT_POWER` | așteptați mai multe semnături |
| `CONFLICTING_CHECKPOINT` | opriți transmiterea și raportați dovada |
| `REQUIRES_CHAIN_SUPPORT` | așteptat astăzi |

## Cum se accesează {#how-to-access}

- **Mainnet `qorechain-vladi` și testnet `qorechain-diana`:** nu se produc checkpoint-uri, deci verificatoarele nu pot urmări niciuna dintre rețele. Nicio versiune de lanț nu le acceptă și niciuna nu este programată.
- Ce fac rețelele astăzi: cheile de consens ale validatorilor sunt ed25519, extensiile de vot sunt oprite, iar IBC folosește tipul standard de client ușor 07.
- **Pentru a rula pachetul** nu aveți nevoie de nimic în afară de runtime-ul limbajului. Fără cont, fără chei, fără endpoint, fără cost. Vectorii folosesc chei de test publice și ID-urile de lanț `qorechain-sim` și `qorechain-sim-21`.
- Doar pentru referință (acest pachet nu le folosește): REST `https://api.qore.host` și `https://api-testnet.qore.host`, RPC `https://rpc.qore.host` și `https://rpc-testnet.qore.host`.

## Unde este publicat {#where-published}

Verificat pe 27 octombrie 2026 în fiecare registru.

| Registru | Pachet | Versiune | Link |
|---|---|---|---|
| npm | `@qorechain/pq-light-client` | 0.1.0 (`latest`) | [npmjs.com](https://www.npmjs.com/package/@qorechain/pq-light-client) |
| crates.io | `qorechain-pq-light-client` | 0.1.0 | [crates.io](https://crates.io/crates/qorechain-pq-light-client) |
| Go module proxy | `github.com/qorechain/qorechain-pq-light-client/go` | v0.1.0 (eticheta `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) |

Sursă: [github.com/qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client) (lansarea v0.1.0, cod sursă, fără binare). Licență Apache-2.0.

## Limite și probleme cunoscute {#limits}

- **Nu face post-cuantic QoreChain, niciun canal IBC, nicio punte și niciun relayer.** Cheile de consens ale validatorilor nu sunt post-cuantice astăzi și nu este programată nicio actualizare care să schimbe asta.
- **Nu poate urmări o rețea live.** `fetchCheckpoint` eșuează mereu cu `REQUIRES_CHAIN_SUPPORT`. Funcționează pe seturi de validatori simulate și pe vectorii partajați.
- **Specificația este o schiță, deschisă pentru revizuire.** Nimic din ea nu este un angajament.
- **Note de design fără cod:** tipul de client IBC (secțiunea 14) și verificatoarele EVM și Solana (secțiunea 15).
- **Înălțimile din interiorul unei epoci rămân clasice.** Chiar și cu checkpoint-uri, verificarea post-cuantică s-ar aplica la înălțimile checkpoint-urilor.
- **Ce poate fi numit rută post-cuantică.** O rută poate fi numită post-cuantică atunci când ambele capete verifică starea semnată post-cuantic a celuilalt capăt, în ambele direcții, fără niciun pas clasic: fără client ușor clasic la niciun capăt, fără înveliș SNARK bazat pe perechi, fără comitet clasic de atestatori. Semnăturile post-cuantice de cont, singure, nu fac o rută post-cuantică. Conturile QoreChain semnează cu ML-DSA-87 și secp256k1; descrieți asta ca „semnături post-cuantice de cont", nu ca rută post-cuantică.
- **Rădăcinile de încredere sunt subiective.** Protocolul nu poate proteja un client care pornește de la una greșită.
- **Pre-1.0.** Versiunile minore pot schimba API-ul.

Formulare sugerată de pagina de poziție din repository:

| Situație | Formulare |
|---|---|
| Conturile semnează cu ML-DSA-87 | „semnături post-cuantice de cont" |
| Un capăt verifică checkpoint-uri post-cuantice, celălalt nu | „verificare post-cuantică a stării QoreChain pe lanțul X; calea de întoarcere este clasică" |
| Ambele capete verifică stare semnată post-cuantic, fără niciun pas clasic | „rută post-cuantică" |

Până când ambele capete îndeplinesc regula, descrieți o rută prin ce verifică ea de fapt, de exemplu „securizată de clientul ușor clasic al contrapărții".

## Note de securitate {#security}

- Pachetul nu deține chei și nu face I/O. Rust nu are cod `unsafe`; în TypeScript și Go, `fetchCheckpoint` nu face nicio cerere.
- Decodoarele sunt stricte: o singură codificare per obiect, iar orice altă lungime de semnătură sau de cheie este respinsă. Relayerele trebuie să transmită octeții canonici neschimbați, niciodată o recodificare.
- Semnăturile de la validatori din afara setului invalidează un checkpoint în loc să fie ignorate, ceea ce ține toate implementările pe același rezultat.
- Păstrați ceasul verificatorului sincronizat: un ceas rapid expiră încrederea prea devreme, iar unul lent respinge checkpoint-urile noi ca `FUTURE_CHECKPOINT`.
- Designul presupune că validatorii care dețin mai mult de două treimi din puterea fiecărui set de checkpoint nu semnează nimic în afară de checkpoint-urile pe care le-a comis propriul lor nod.
- Domeniile de semnare propuse (`qorechain-pqlc-checkpoint-v1|`, `qorechain-pqlc-key-pop-v1|`) sunt propuneri; astăzi nu sunt rezervate pe lanț.
- Cheile vectorilor sunt chei de test publice; nu le folosiți niciodată pentru altceva.
- Raportați vulnerabilitățile în privat la security@qore.network.

## Pagini conexe {#related}

- [Biblioteca PQC](/developer-tools/pqc-library): binding-urile ML-DSA-87 și SHAKE-256 de sub verificatoare.
- [QoreSign](/qoresign/overview): semnături ML-DSA-87 la nivel de cont, care sunt altceva decât checkpoint-urile validatorilor.
- [Securitate post-cuantică](/architecture/post-quantum-security): modelul post-cuantic al lanțului astăzi.
- [Arhitectura punții](/architecture/bridge-architecture) și [Transferul activelor prin punte](/user-guide/bridging-assets): rutele cross-chain de astăzi folosesc clientul ușor clasic standard.
- [QoreSeal](/developer-tools/qoreseal): celălalt kit post-cuantic 0.1.0 publicat pe 27 octombrie 2026.
- [Prezentare generală a pachetelor pentru dezvoltatori](/developer-tools/overview).
