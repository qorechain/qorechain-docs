---
slug: /qorel/signing-from-any-language
title: Firmare le transazioni QoreChain da qualsiasi linguaggio
sidebar_label: Firmare da qualsiasi linguaggio
sidebar_position: 8
---

# Firmare le transazioni QoreChain da qualsiasi linguaggio

QORel firma in Rust con il crate `qorel-signer`. Altri relayer, bot e strumenti possono produrre la stessa firma ibrida post-quantistica in altri linguaggi con l'SDK di QoreChain e le librerie post-quantistiche. Questa pagina enuncia il contratto che tutti seguono ed elenca la libreria da usare per Rust, TypeScript, Go, Python e Java. È pensata per gli sviluppatori che costruiscono un relayer, un bot o un backend che invia transazioni a QoreChain.

## Innovazioni {#innovations}

- **Un contratto, un insieme di vettori di test.** Ogni linguaggio costruisce gli stessi sign bytes e la stessa estensione. Il repository di QORel pubblica vettori ricostruiti byte per byte da transazioni che la chain ha accettato, così puoi verificare un'implementazione prima che tocchi una rete.
- **L'estensione è l'unica aggiunta.** La firma post-quantistica viaggia in un'unica opzione di estensione del corpo della transazione; messaggi, commissioni e firma classica mantengono la loro forma abituale.
- **Il punto di aggancio è ristretto.** La firma viene aggiunta dopo che l'auth info è definitiva e prima che venga costruito il documento di firma classico. A un relayer serve una sola modifica in quel punto, non una riscrittura.
- **Stessa chiave ovunque.** La chiave ML-DSA-87 è derivata dalla mnemonica dell'account con la derivazione del wallet QoreChain, quindi qualsiasi wallet o relayer che importa la mnemonica ottiene la stessa chiave post-quantistica.

## Come si usa {#how-to-use}

### Il contratto {#contract}

QoreChain accetta una transazione della corsia nativa solo se porta entrambe le firme:

- **La firma classica secp256k1**, nella consueta forma `SIGN_MODE_DIRECT`. Copre il corpo finale, estensione inclusa.
- **Una firma ML-DSA-87 (FIPS 204)** in un'opzione di estensione del corpo, di tipo `/qorechain.pqc.v1.PQCHybridSignature`, con `algorithm_id = 1`, `pqc_signature` (4.627 byte) e un `pqc_public_key` opzionale (2.592 byte). Deve essere l'unica opzione di estensione critica (in `extension_options`) della transazione.

La firma ML-DSA copre i sign bytes (versione 2, attuale su entrambe le reti):

```
"qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id
                          || BE32(len(B0)) || B0
                          || BE32(len(A))  || A
```

- `B0` è il `TxBody` senza l'estensione PQC, ricodificato in forma canonica.
- `A` sono i byte di `AuthInfo`, invariati.

Ordine delle operazioni:

1. Costruisci il corpo e l'auth info.
2. Firma i sign bytes con ML-DSA-87.
3. Aggiungi l'estensione al corpo.
4. Firma il corpo finale con secp256k1.
5. Trasmetti.

Regole facili da sbagliare:

- `B0` deve essere canonico, perché la chain lo ricava decodificando il corpo, eliminando l'opzione ibrida e ricodificando. Non inviare corpi con proprie opzioni di estensione, con il flag `unordered`, con campi sconosciuti o con una codifica non canonica.
- Un rifiuto con codespace `pqc` codice 21 significa che la firma ibrida non è stata verificata. Rileggi la versione dei sign-bytes e la registrazione dell'account prima di riprovare; vedi [Firma post-quantistica](/developer-guide/post-quantum-signing#code-21).
- Gas: la verifica costa 2.000 gas per ogni firmatario con chiave, più il costo di dimensione di circa 4,7 KB di estensione. Simula attraverso lo stesso percorso, così che entrambi vengano conteggiati.

### Registrare e derivare la chiave {#keys}

L'account registra una sola volta la propria chiave pubblica ML-DSA con `MsgRegisterPQCKeyV2`, includendo una prova di possesso. È l'unica transazione che QoreChain accetta con la sola firma classica. Vedi [Firma post-quantistica](/developer-guide/post-quantum-signing#pqc-key-registration).

La chiave ML-DSA è derivata dalla stessa mnemonica dell'account:

```
seed = SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)[:32]
```

poi `ML-DSA-87.KeyGen_internal(seed)`. I segreti vengono azzerati e non vengono mai stampati. La stessa derivazione è descritta in [Derivazione delle chiavi](/qoresign/guides/key-derivation).

### Il livello di firma in QORel {#signer-layer}

Il crate `qorel-signer` suddivide il lavoro in tre interfacce:

- `PqSigner`: una primitiva post-quantistica (`algorithm_id`, `public_key`, `sign`). È fornito `MlDsa87Signer`, con firma hedged per impostazione predefinita e firma deterministica per i vettori di test; ogni firma viene verificata prima dell'uso.
- `SignBytesFramer`: le regole di una chain (`check_body`, `frame`, `pack`).
- `TxExtensionSigner`: ciò che il relayer richiama. `PqExtensionSigner` combina una primitiva e un framer.

Il relayer costruisce una transazione in quest'ordine: codifica il corpo senza alcuna estensione del co-firmatario (`B0`); codifica l'auth info finale (`A`); chiede al co-firmatario le opzioni di estensione da aggiungere; ricodifica il corpo con esse; produce la firma classica sul documento di firma del corpo finale. Per usare il crate da Rust, dipendi da esso dal repository (non è su crates.io):

```toml
[dependencies]
qorel-signer = { git = "https://github.com/qorechain/QORel", tag = "qorel-v0.1.0" }
```

Una chiamata completa, che costruisce il firmatario ibrido per una chain e gli chiede le opzioni di estensione, si trova in `crates/qorel-signer/README.md` nel repository. Il crate lavora su byte protobuf grezzi, rifiuta i corpi che la chain respingerebbe (un'opzione di estensione critica già presente, `unordered`, campi sconosciuti), non ripiega mai sui sign bytes v1 sulle reti QoreChain prima che la versione sia nota, verifica ogni firma che produce, e azzera i segreti oscurandoli nell'output di `Debug`. I suoi test ricostruiscono, byte per byte, transazioni che l'ante handler della chain ha accettato. Vedi anche [qorel-signer nella panoramica](/qorel/overview#qorel-signer).

Una chain che richiede una diversa firma aggiuntiva implementa un framer, e una nuova primitiva se l'algoritmo è diverso; nient'altro nel relayer cambia.

### Librerie {#libraries}

| Linguaggio | Pacchetto | Firma ibrida |
|---|---|---|
| Rust | `qorechain-sdk` (crates.io), oppure `qorel-signer` dal [repository di QORel](https://github.com/qorechain/QORel) (`crates/qorel-signer`) | `qorel_signer::qorechain::qorechain_hybrid_signer` con `PqExtensionSigner`; `qorechain::tx::build_hybrid_tx` |
| TypeScript e JavaScript | `npm install @qorechain/sdk` | `TxClient` firma in modo ibrido con un `pqcKeypair`; `ensurePqcRegistered` |
| Go | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | `qorechain/tx` (costruzione e firma ibrida), `qorechain/signbytes`, `qorechain/pqcdx` |
| Python | `pip install qorechain-sdk` | `build_hybrid_tx`, `build_hybrid_signature_extension` |
| Java e Kotlin | `io.github.qorechain:qorechain-sdk` (Maven Central) | `PqcDx` (registrazione, percorso di invio ibrido) e il builder di transazioni ibride |
| C e altri | [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) | Binding per generazione chiavi, firma e verifica ML-DSA-87; struttura i sign bytes come sopra |

Vedi [Pacchetti per sviluppatori](/developer-tools/overview) per la versione attuale di ciascun pacchetto e [QoreSign](/qoresign/overview) per firmare in un wallet o in un backend. I client solo classici di alcuni pacchetti non possono inviare transazioni della corsia nativa; controlla la pagina del pacchetto prima di usarne uno per le scritture.

### Vettori di test {#test-vectors}

`crates/qorel-signer/tests/vectors/` nel repository di QORel contiene:

- un file known-answer dei sign bytes;
- vettori di transazioni di relay: il corpo senza l'estensione, i sign bytes, i byte dell'estensione e la transazione firmata completa, ricostruiti byte per byte da transazioni che la chain ha accettato;
- il vettore di derivazione delle chiavi cross-SDK.

Eseguili nel tuo linguaggio prima di inviare qualsiasi cosa a una rete reale. I vettori di QoreSign sono in [Vettori di test](/qoresign/vectors).

### Aggiungere la firma post-quantistica a un altro relayer {#other-relayers}

Il punto di aggancio è "dopo che l'auth info è definitiva e prima che venga costruito il documento di firma classico". Inserisci lì l'estensione:

- Nei relayer basati su Hermes, è `crates/relayer/src/chain/cosmos/encode.rs::sign_tx`. La modifica di QORel in quel punto è generica: qualsiasi `TxExtensionSigner` può aggiungere opzioni di estensione.
- Nei relayer Go costruiti sul pacchetto `client/tx` del Cosmos SDK, incapsula il `TxBuilder` prima di `SetSignatures`.

## Come accedere {#how-to-access}

- **Rete.** Il contratto è lo stesso su entrambe le reti QoreChain; QORel stesso è testato solo sulla testnet.
- **Chiave e account.** Un account con fondi con una chiave ML-DSA-87 registrata; i QOR di testnet dal [Faucet della dashboard](/dashboard/faucet).
- **Costo.** Le librerie sono gratuite (Apache-2.0). Le transazioni pagano il gas con un minimo di 0,1 uqor per gas.

## Dove è pubblicato {#where-published}

| Pacchetto | Registro | Sorgente |
|---|---|---|
| `qorel-signer` | Nel repository (`crates/qorel-signer`); non su crates.io, usa la dipendenza git indicata sopra | [qorechain/QORel](https://github.com/qorechain/QORel) |
| `qorechain-sdk`, `@qorechain/sdk`, modulo Go, artefatto Maven | crates.io, npm, Go proxy, Maven Central, PyPI | [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk) |
| `qorechain-pqc` | npm, PyPI, crates.io, Go, Maven | [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc) |

## Limiti e problemi noti {#limits}

- **Solo ML-DSA-87 (algorithm id 1).** È l'unico algoritmo con cui firmano QORel e le librerie qui sopra.
- **Versione dei sign-bytes.** Questa pagina documenta la versione 2, che entrambe le reti verificano. Uno strumento deve comunque leggere la versione dalla chain (i record di upgrade applicati) anziché darla per scontata; QORel lo fa.
- **La firma è locale.** Nessuna di queste librerie custodisce una chiave per te né firma tramite un hardware wallet.
- **Gli esempi per linguaggio non sono ripetuti qui.** Usa l'avvio rapido di ciascun pacchetto; questo manuale non afferma che ogni linguaggio sia stato eseguito rispetto ai vettori di test di QORel.
