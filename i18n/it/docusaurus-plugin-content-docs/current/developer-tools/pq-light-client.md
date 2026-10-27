---
slug: /developer-tools/pq-light-client
title: Light client PQ
sidebar_label: Light client PQ
sidebar_position: 31
---

# Light client PQ (`qorechain-pq-light-client`)

`qorechain-pq-light-client` è una specifica in bozza e un verificatore di riferimento per checkpoint firmati con ML-DSA-87 (FIPS 204). Nel design proposto, i validator firmano un breve checkpoint alla fine di ogni epoca con una chiave di checkpoint ML-DSA-87 separata, e un light client segue la catena di checkpoint verificando quelle firme e nient'altro. È pensato per ricercatori di protocollo, sviluppatori di relayer e bridge, e team di altre chain che vogliono rivedere il design e provarlo. Versione **0.1.0**, Apache-2.0, mantenuto dalla QoreChain Association.

**La chain non supporta questi checkpoint e nulla è in programma.** QoreChain non produce i checkpoint che questo pacchetto verifica, né sulla mainnet (`qorechain-vladi`) né sulla testnet (`qorechain-diana`). Nessuna versione della chain li supporta e non sono previsti aggiornamenti né date. Le chiavi di consenso dei validator sono oggi ed25519, non post-quantistiche. Il pacchetto non può seguire una rete live: funziona su insiemi di validator simulati e sui vettori di test condivisi. Non rende post-quantistica alcuna route, bridge o canale IBC di QoreChain.

## Innovazioni {#innovations}

- **Checkpoint invece di firme per blocco.** I validator firmerebbero un checkpoint per epoca (chain id, epoca, altezza, tempo, hash dell'header, app hash, l'hash dell'insieme firmatario e l'hash dell'insieme successivo). Le firme viaggerebbero in transazioni ordinarie, quindi la produzione dei blocchi non le aspetta mai, e il volume di dati resta ben al di sotto di quello necessario per firmare ogni blocco. La specifica (sezione 12) ne spiega il ragionamento.
- **Una chiave di checkpoint separata con una prova di possesso.** Ogni validator registrerebbe una chiave di checkpoint ML-DSA-87, separata dalla sua chiave di consenso e da qualsiasi chiave di account, con una prova di possesso su `"qorechain-pqlc-key-pop-v1|" || chain_id || operator address || consensus address || public key`.
- **Passaggio dell'insieme da parte dell'insieme uscente.** Un checkpoint è accettato quando i validator che detengono strettamente più di due terzi della potenza dell'insieme indicato dall'ultimo checkpoint fidato lo hanno firmato, quindi le modifiche dell'insieme dei validator sono sempre firmate dall'insieme uscente. Esattamente due terzi non è un quorum, e la firma di un non membro invalida il checkpoint invece di essere ignorata.
- **Una codifica per oggetto.** Checkpoint, insieme di validator e checkpoint firmato hanno codifiche canoniche, e i decoder accettano esattamente una codifica per ciascuno. Un relayer inoltra i byte canonici senza modificarli.
- **Ordine fisso dei controlli.** `verifyCheckpoint` esegue i controlli in un ordine specificato, così TypeScript, Rust e Go restituiscono lo stesso codice di errore per lo stesso input.
- **Prove di comportamento scorretto.** Due checkpoint diversi per la stessa epoca, ciascuno con un quorum, costituiscono un comportamento scorretto. `detectMisbehaviour` restituisce entrambi i checkpoint in un ordine canonico, i firmatari doppi e la loro potenza.
- **Tre linguaggi, un solo insieme di vettori.** I vettori condivisi (`vectors/pq-light-client-v1.json`) provengono da un simulatore deterministico e coprono catene di checkpoint da 4 e 21 validator, rotazioni dell'insieme, ogni rifiuto che il verificatore può produrre, checkpoint in conflitto e casi del decoder. Go, Rust e TypeScript li superano tutti, così una quarta implementazione può dimostrare di coincidere byte per byte.

## Casi d'uso {#use-cases}

1. **Gli sviluppatori di relayer prototipano un percorso di aggiornamento post-quantistico.** Un relayer Rust mantiene uno stato fidato per rete, decodifica e verifica ogni checkpoint firmato, inoltra gli stessi byte alla destinazione e si ferma su `CONFLICTING_CHECKPOINT`. Oggi funziona sui vettori o su una chain simulata personalizzata; la guida al relayer nel repository mostra il ciclo.
2. **I team IBC e bridge valutano il design.** La sezione 14 della specifica mappa i checkpoint su un tipo di light client IBC (stato del client, stato di consenso, comportamento scorretto, prove di appartenenza alle altezze dei checkpoint). I team possono rivedere la mappatura e i suoi compromessi prima che esista qualcosa on-chain. È una nota di design; non esiste codice per essa.
3. **I team su chain EVM o Solana confrontano i design dei verificatori.** La sezione 15 confronta la verifica ML-DSA-87 on-chain, una prova STARK della verifica e un insieme di attestatori, indicando quali scelte mantengono la proprietà post-quantistica e quali la perdono. Anche queste sono solo note di design. Per riferimento, l'EVM di QoreChain ha un precompile di verifica ML-DSA (`pqcVerify`, 0x0A01) attivo solo sulla testnet; vedi [Precompile EVM](/developer-guide/evm-precompiles).
4. **Revisori di sicurezza e ricercatori controllano le regole.** L'ordine dei controlli, la regola del quorum, il passaggio dell'insieme, il periodo di fiducia e le prove di comportamento scorretto sono specificati e testabili in tre linguaggi.
5. **I team che parlano di route formulano correttamente le proprie affermazioni.** La pagina di posizione nel repository definisce quando una route può essere chiamata post-quantistica (vedi [Limiti](#limits)).
6. **Implementatori in altri linguaggi.** I vettori permettono a una nuova implementazione di dimostrare di coincidere con il riferimento.

## Come funziona {#how-it-works}

Tutto in questa sezione è il design proposto, e tutto richiede un supporto della chain che non è in programma.

1. Ogni validator registra una chiave di checkpoint ML-DSA-87 con una prova di possesso (sopra).
2. Alla fine di ogni epoca, i validator firmano un checkpoint: chain id, epoca (strettamente crescente), altezza, tempo, hash dell'header, app hash, l'hash dell'insieme che firma questo checkpoint e l'hash dell'insieme che firma il successivo.
3. Un light client accetta un checkpoint firmato da più di due terzi della potenza dell'insieme indicato dal suo ultimo checkpoint fidato.
4. Due checkpoint diversi per la stessa epoca, ciascuno con un quorum, costituiscono un comportamento scorretto; la prova indica i firmatari doppi.

Il consenso per blocco resterebbe invariato. Le altezze all'interno di un'epoca restano classiche fino al checkpoint successivo; un client che ha bisogno della garanzia post-quantistica usa le altezze dei checkpoint e accetta fino a un'epoca di latenza.

**Formati** (tutti gli interi in big-endian, byte di versione `0x01`):

| Oggetto | Struttura | Dimensione |
|---|---|---|
| Checkpoint | versione, lunghezza e byte del chain id, epoca, altezza, tempo, hash dell'header, app hash, hash dell'insieme di validator, hash dell'insieme di validator successivo | `154 + len(chain_id)` byte (169 per `qorechain-vladi`) |
| Insieme di validator | versione, conteggio (da 1 a 256), poi per ogni validator: indirizzo di 20 byte, potenza di 8 byte, chiave ML-DSA-87 di 2.592 byte, ordinati per indirizzo | `3 + 2,620 x validators` byte |
| Checkpoint firmato | versione, checkpoint, numero di firme, per ogni firmatario un indirizzo di 20 byte e una firma di 4.627 byte (ordinati per indirizzo), flag dell'insieme successivo, insieme successivo quando l'insieme cambia | `173 + 4,647 x signers` byte per `qorechain-vladi`, più l'insieme successivo quando presente |

**Firma e hash.** ML-DSA-87, modalità pura FIPS 204, contesto vuoto, su `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)`. La firma deterministica e quella hedged sono entrambe valide. L'hash è SHAKE-256 con output di 32 byte; l'hash dell'insieme di validator usa il prefisso `qorechain-pqlc-valset-v1|`.

**Ordine di verifica** (`verifyCheckpoint`): struttura, chain id, scadenza della fiducia, deriva dell'orologio, gestione della stessa epoca (identico dà `NOT_NEWER`; diverso con un quorum dà `CONFLICTING_CHECKPOINT`), avanzamento di epoca, altezza e tempo, l'insieme firmatario coincide con l'insieme successivo fidato, l'insieme successivo trasportato corrisponde al suo hash, quorum. Un errore lascia invariato lo stato fidato. Un'epoca successiva può essere accettata direttamente finché l'insieme firmatario non cambia; dopo una rotazione, ogni checkpoint dalla rotazione in poi deve essere verificato.

**Fiducia.** Un client parte da una radice di fiducia scelta al di fuori del protocollo, come con qualsiasi light client proof-of-stake. Il periodo di fiducia deve essere più breve del periodo durante il quale un validator può ancora essere penalizzato; dopo di esso, il client deve essere reinizializzato.

La specifica è `spec/pq-light-client-v1.md` nel repository (stato: bozza, aperta alla revisione). La sezione 10 (chiavi di checkpoint, firma, epoche, penalità on-chain) è un design da rivedere, non un impegno.

## Come si usa {#how-to-use}

### Installazione {#install}

| Linguaggio | Installazione | Piattaforma minima |
|---|---|---|
| TypeScript | `npm install @qorechain/pq-light-client` | Node.js 20.19 o successivo, e browser. Dipende da `@qorechain/pqc` 0.2.3 |
| Rust | `cargo add qorechain-pq-light-client` (libreria `qorechain_pq_light_client`) | Rust stable; dipende da `qorechain-pqc` 0.2.3; nessun `unsafe`, nessun I/O |
| Go | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` (pacchetto `pqlightclient`) | Go 1.25; dipende da `github.com/qorechain/qorechain-pqc/go` v0.2.3 |

Non esiste un pacchetto PyPI, e non ne è previsto uno.

### Quickstart (offline, TypeScript) {#quickstart}

Nulla tocca una rete QoreChain. Lo script segue la catena di checkpoint simulata da 21 validator dei vettori condivisi (chain id `qorechain-sim-21`, inclusa una rotazione dell'insieme all'epoca 2), poi mostra che la sorgente live non è disponibile. Le chiavi dei vettori sono chiavi di test pubbliche.

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

Eseguito il 27 ottobre 2026 sul pacchetto npm 0.1.0 pubblicato e sui vettori al tag v0.1.0, `node follow.mjs` ha stampato:

```
trusted epoch 1 at height 11000
trusted epoch 2 at height 12000
trusted epoch 3 at height 13000
live source: REQUIRES_CHAIN_SUPPORT
```

Il file dei vettori pesa circa 2,4 MB. L'originale Rust è `rust/examples/relayer.rs` nel repository (`cargo run --example relayer`); non è stato eseguito per questa pagina.

Gestione degli errori in TypeScript (dal README del pacchetto):

```ts
try {
  trusted = verifyCheckpoint(trusted, decodeSignedCheckpoint(bytes), BigInt(Math.floor(Date.now() / 1000)));
} catch (e) {
  if (e instanceof PqLightClientError && e.code === "CONFLICTING_CHECKPOINT") {
    report(e.misbehaviour);
  }
}
```

Lo stesso in Go:

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

### API principale {#api}

L'API è la stessa in tutti e tre i linguaggi (camelCase in TypeScript, PascalCase in Go, snake_case in Rust). I campi a 64 bit sono `bigint` in TypeScript.

| Nome | Cosa fa |
|---|---|
| `Checkpoint`, `ValidatorSet`, `SignedCheckpoint`, `TrustedState`, `Misbehaviour` | tipi di dati |
| `encodeCheckpoint`, `decodeCheckpoint` | codifica canonica del checkpoint; decoder rigoroso |
| `encodeValidatorSet`, `decodeValidatorSet`, `hashValidatorSet` | codifica dell'insieme di validator e hash SHAKE-256 |
| `encodeSignedCheckpoint`, `decodeSignedCheckpoint` | i byte che un relayer trasporta |
| `encodeCheckpointSignBytes` | i sign-bytes, `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)` |
| `newTrustedState` | dalla radice di fiducia allo stato fidato (controlla che entrambi gli insiemi producano gli hash presenti nel checkpoint; non verifica le firme) |
| `verifyCheckpoint(trusted, signed, now)` | verifica completa; restituisce il nuovo stato fidato o un errore tipizzato |
| `detectMisbehaviour(set, a, b)` | prova per checkpoint in conflitto, oppure nulla |
| `signCheckpoint` | firma un checkpoint con una chiave segreta ML-DSA-87 (simulatori e test) |
| `CheckpointSource`, `fetchCheckpoint`, `chainCheckpointSource` (TypeScript) o `ChainCheckpointSource` (Rust, Go) | interfacce per una futura API del nodo; oggi falliscono sempre con `REQUIRES_CHAIN_SUPPORT` e non fanno alcuna richiesta |
| `PqLightClientError` (TypeScript), `*Error` con `ErrInsufficientPower` e simili (Go, usa `errors.Is`), `Error` con `code()` (Rust) | errori tipizzati con codici stabili |

Codici di errore, condivisi da tutti e tre i linguaggi, e cosa dovrebbe fare un relayer (dalla guida al relayer):

| Errore | Azione |
|---|---|
| `MALFORMED` | scarta i byte; la sorgente è difettosa |
| `CHAIN_ID_MISMATCH` | errore di configurazione |
| `TRUST_EXPIRED` | fermati; reinizializza da una nuova radice di fiducia |
| `FUTURE_CHECKPOINT` | controlla l'orologio locale; riprova più tardi |
| `NOT_NEWER` | niente di nuovo; attendi |
| `SET_MISMATCH` | manca un checkpoint con una rotazione dell'insieme; recupera le epoche intermedie |
| `UNKNOWN_VALIDATOR`, `BAD_SIGNATURE` | scarta il checkpoint |
| `INSUFFICIENT_POWER` | attendi altre firme |
| `CONFLICTING_CHECKPOINT` | smetti di inoltrare e segnala la prova |
| `REQUIRES_CHAIN_SUPPORT` | atteso oggi |

## Come accedere {#how-to-access}

- **Mainnet `qorechain-vladi` e testnet `qorechain-diana`:** non vengono prodotti checkpoint, quindi i verificatori non possono seguire nessuna delle due reti. Nessuna versione della chain li supporta e nessuna è in programma.
- Cosa fanno le reti oggi: le chiavi di consenso dei validator sono ed25519, le vote extension sono disattivate e IBC usa il tipo di light client standard 07.
- **Per eseguire il pacchetto** non serve nulla oltre al runtime del linguaggio. Nessun account, nessuna chiave, nessun endpoint, nessun costo. I vettori usano chiavi di test pubbliche e i chain id `qorechain-sim` e `qorechain-sim-21`.
- Solo per riferimento (questo pacchetto non li usa): REST `https://api.qore.host` e `https://api-testnet.qore.host`, RPC `https://rpc.qore.host` e `https://rpc-testnet.qore.host`.

## Dove è pubblicato {#where-published}

Verificato il 27 ottobre 2026 su ciascun registry.

| Registry | Pacchetto | Versione | Link |
|---|---|---|---|
| npm | `@qorechain/pq-light-client` | 0.1.0 (`latest`) | [npmjs.com](https://www.npmjs.com/package/@qorechain/pq-light-client) |
| crates.io | `qorechain-pq-light-client` | 0.1.0 | [crates.io](https://crates.io/crates/qorechain-pq-light-client) |
| Go module proxy | `github.com/qorechain/qorechain-pq-light-client/go` | v0.1.0 (tag `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) |

Sorgente: [github.com/qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client) (release v0.1.0, codice sorgente, nessun binario). Licenza Apache-2.0.

## Limiti e problemi noti {#limits}

- **Non rende post-quantistica QoreChain, alcun canale IBC, bridge o relayer.** Le chiavi di consenso dei validator oggi non sono post-quantistiche, e non è in programma alcun aggiornamento per cambiarlo.
- **Non può seguire una rete live.** `fetchCheckpoint` fallisce sempre con `REQUIRES_CHAIN_SUPPORT`. Funziona su insiemi di validator simulati e sui vettori condivisi.
- **La specifica è una bozza, aperta alla revisione.** Nulla in essa è un impegno.
- **Note di design senza codice:** il tipo di client IBC (sezione 14) e i verificatori EVM e Solana (sezione 15).
- **Le altezze all'interno di un'epoca restano classiche.** Anche con i checkpoint, la verifica post-quantistica si applicherebbe alle altezze dei checkpoint.
- **Cosa può essere chiamato route post-quantistica.** Una route può essere chiamata post-quantistica quando entrambe le estremità verificano lo stato firmato post-quantisticamente dell'altra, in entrambe le direzioni, senza alcun passaggio classico: nessun light client classico a nessuna delle due estremità, nessun wrapper SNARK basato su pairing, nessun comitato di attestatori classico. Le sole firme di account post-quantistiche non rendono post-quantistica una route. Gli account QoreChain firmano con ML-DSA-87 e secp256k1; descrivilo come "firme di account post-quantistiche", non come route post-quantistica.
- **Le radici di fiducia sono soggettive.** Il protocollo non può proteggere un client che parte da una radice sbagliata.
- **Pre-1.0.** Le versioni minori possono cambiare l'API.

Formulazione suggerita dalla pagina di posizione del repository:

| Situazione | Formulazione |
|---|---|
| Gli account firmano con ML-DSA-87 | "firme di account post-quantistiche" |
| Un'estremità verifica checkpoint post-quantistici, l'altra no | "verifica post-quantistica dello stato di QoreChain sulla chain X; il percorso di ritorno è classico" |
| Entrambe le estremità verificano lo stato firmato post-quantisticamente, senza alcun passaggio classico | "route post-quantistica" |

Finché entrambe le estremità non soddisfano la regola, descrivi una route per ciò che verifica realmente, ad esempio "protetta dal light client classico della controparte".

## Note di sicurezza {#security}

- Il pacchetto non detiene chiavi e non fa I/O. Rust non ha codice `unsafe`; in TypeScript e Go, `fetchCheckpoint` non fa alcuna richiesta.
- I decoder sono rigorosi: una codifica per oggetto, e qualsiasi altra lunghezza di firma o chiave viene rifiutata. I relayer devono inoltrare i byte canonici senza modificarli, mai una ricodifica.
- Le firme di validator esterni all'insieme invalidano un checkpoint invece di essere ignorate, il che mantiene tutte le implementazioni sullo stesso risultato.
- Mantieni sincronizzato l'orologio del verificatore: un orologio in anticipo fa scadere la fiducia troppo presto, e uno in ritardo rifiuta i nuovi checkpoint come `FUTURE_CHECKPOINT`.
- Il design presuppone che i validator che detengono più di due terzi della potenza di ciascun insieme di checkpoint non firmino nulla se non checkpoint che il loro nodo ha committato.
- I domini di firma proposti (`qorechain-pqlc-checkpoint-v1|`, `qorechain-pqlc-key-pop-v1|`) sono proposte; oggi non sono riservati on-chain.
- Le chiavi dei vettori sono chiavi di test pubbliche; non usarle mai per altro.
- Segnala le vulnerabilità in privato a security@qore.network.

## Pagine correlate {#related}

- [Libreria PQC](/developer-tools/pqc-library): i binding ML-DSA-87 e SHAKE-256 sotto i verificatori.
- [QoreSign](/qoresign/overview): firme ML-DSA-87 a livello di account, che sono una cosa diversa dai checkpoint dei validator.
- [Sicurezza post-quantistica](/architecture/post-quantum-security): il modello post-quantistico della chain oggi.
- [Architettura del bridge](/architecture/bridge-architecture) e [Bridging degli asset](/user-guide/bridging-assets): oggi le route cross-chain usano il light client classico standard.
- [QoreSeal](/developer-tools/qoreseal): l'altro kit post-quantistico 0.1.0 pubblicato il 27 ottobre 2026.
- [Panoramica dei pacchetti per sviluppatori](/developer-tools/overview).
