---
slug: /qorel/overview
title: Panoramica di QORel
sidebar_label: Panoramica
sidebar_position: 1
---

# QORel

QORel è il relayer IBC di QoreChain. Un relayer è il programma che trasporta pacchetti IBC, prove e aggiornamenti dei client tra due chain; senza un relayer in esecuzione, un trasferimento su un canale IBC resta in sospeso. QORel è pensato per operatori, validatori e team che vogliono eseguire il relay per un canale QoreChain, e per chiunque abbia bisogno di un relayer capace di inviare transazioni a QoreChain.

QoreChain richiede una firma ibrida post-quantistica (secp256k1 più ML-DSA-87, FIPS 204) su ogni transazione della corsia nativa, e un relayer standard non la produce, quindi QoreChain rifiuta le sue transazioni. QORel aggiunge questa firma per QoreChain e firma ogni altra chain Cosmos SDK nel modo standard. È un unico binario, `qorel`, rilasciato con licenza Apache-2.0. È un fork di [Hermes](https://github.com/informalsystems/hermes) 1.13.3, il relayer IBC scritto da Informal Systems (Apache-2.0); il merito del motore del relayer è loro, e QORel mantiene i comandi e la configurazione di Hermes per ogni chain che non richiede la firma aggiuntiva.

QORel 0.1.0 è **solo per testnet**. Ha fatto da relay tra la testnet di QoreChain `qorechain-diana` e la testnet pubblica di Cosmos Hub (chain ID `provider`). L'IBC su mainnet non è ancora aperto; il supporto alla mainnet arriverà più avanti, quando vi sarà aperto un canale.

## Innovazioni {#innovations}

- **Modalità di firma per chain.** Ogni chain nella configurazione ha `signing`. `'qorechain-hybrid'` aggiunge la firma ML-DSA-87 che QoreChain verifica. Il valore predefinito, `'standard'`, produce transazioni identiche byte per byte a quelle di Hermes, così lo stesso processo QORel fa da relay a QoreChain e a Cosmos Hub fianco a fianco.
- **Un livello di firma modulare.** Il crate `qorel-signer` definisce come componenti separati una primitiva post-quantistica, le regole dei sign-bytes di una chain e un firmatario dell'estensione di transazione. Il relayer lo richiama dopo che l'auth info è definitiva e prima che venga costruito il documento di firma classico, e la simulazione del gas passa per lo stesso percorso. Una chain con una diversa firma aggiuntiva richiede un nuovo framer in quel crate, non una modifica al relayer. Vedi [Firmare da qualsiasi linguaggio](/qorel/signing-from-any-language) per il contratto.
- **Gestione delle chiavi post-quantistiche nei comandi delle chiavi.** `qorel keys add` deriva la chiave ML-DSA-87 dalla stessa mnemonica dell'account, con la derivazione del wallet QoreChain, così la chiave del relayer corrisponde a quella che deriverebbero QoreX o l'SDK. `qorel keys register-pqc` registra la chiave pubblica una sola volta, con una prova di possesso. `qorel keys pqc-status` indica se la chiave è pronta.
- **Un controllo prima di ogni invio.** Prima di ogni transazione verso una chain ibrida, QORel verifica che la chiave post-quantistica sia registrata on-chain e coincida con quella che detiene in locale, e legge dalla chain la versione dei sign-bytes. Se qualcosa non va, non invia nulla, così non si spende alcuna commissione per una transazione che la chain rifiuterebbe.
- **Prezzo del gas dal fee market di QoreChain.** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` legge la base fee della chain (minimo 0,1 uqor per gas) invece di usare una stima fissa.
- **Rilevamento del misbehaviour sulle chain ibc-go v10.** ibc-go v10 non inserisce più l'header negli eventi `update_client`, e Hermes 1.13 standard disattiva il rilevamento del misbehaviour su quelle chain. QORel invece legge l'header dalla transazione `MsgUpdateClient`, così il rilevamento continua a funzionare.
- **Resilienza agli endpoint con limiti di frequenza.** I worker dei pacchetti restano attivi e riprovano a ogni intervallo di clearing mentre un tentativo di relay o di clearing è fallito, per esempio dopo che un endpoint pubblico risponde brevemente `429`. Si fermano per inattività solo dopo che un ciclo di clearing ha successo.
- **File delle chiavi leggibili solo dal proprietario.** I file delle chiavi, incluso il seed post-quantistico memorizzato, sono scritti con modalità 0600.
- **Provato su una rete reale.** Il primo canale IBC sulla testnet di QoreChain, `transfer/channel-0` su `qorechain-diana` verso `channel-600` sulla testnet pubblica di Cosmos Hub, è gestito da QORel. I trasferimenti sono stati testati in entrambe le direzioni, così come la restituzione di un token trasferito e il rimborso automatico di un trasferimento scaduto. Vedi [Il canale di test](/user-guide/bridging-assets#ibc-test-channel).

L'elenco completo per ogni release è nella pagina [Novità](/qorel/whats-new).

## La connessione live alla testnet {#testnet-connection}

| | `qorechain-diana` | Testnet pubblica di Cosmos Hub (`provider`) |
|---|---|---|
| Client leggero | `07-tendermint-0` | `07-tendermint-466` |
| Connessione | `connection-0` | `connection-315` |
| Canale | `transfer/channel-0` (`STATE_OPEN`, non ordinato, versione `ics20-1`) | `transfer/channel-600` |

Su questa connessione esistono due tracce di token. ATOM sulla testnet di QoreChain è `ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2` (traccia `transfer/channel-0/uatom`). QOR sulla testnet dell'Hub è `ibc/BB4D5A9372637A885CC895F775B38B127354A31F3E20D8F6FB3997E34BF4AA4A` (traccia `transfer/channel-600/uqor`). Una pull request al chain-registry che aggiunge questo percorso ([cosmos/chain-registry#8086](https://github.com/cosmos/chain-registry/pull/8086)) è aperta e non ancora unita. La mainnet non ha alcun canale IBC.

Che cosa è stato testato: trasferimenti in entrambe le direzioni (1 QOR in uscita, 0,1 ATOM in entrata, 0,4 QOR restituiti) e il rimborso automatico di un trasferimento con timeout di 1 secondo, inoltrato come messaggio di timeout. Tutte le 13 transazioni del relayer su `qorechain-diana` sono riuscite (code 0).

### Che cosa serve a un relayer di terze parti {#third-party}

La testnet accetta solo il tipo di client leggero `07-tendermint` (`/ibc/core/client/v1/params` elenca `allowed_clients = ["07-tendermint"]`); oggi non si può creare alcun client `08-wasm`. Per aprire un canale verso QoreChain, un relayer richiede:

- un client `07-tendermint` su ciascun lato;
- sul lato QoreChain, ogni transazione firmata in modo ibrido da un account relayer la cui chiave ML-DSA-87 sia registrata. QORel lo fa; Hermes standard, il relayer Go (`rly`) e ts-relayer vengono rifiutati;
- un canale di trasferimento ICS-20 con versione `ics20-1`.

Non esiste alcuna allowlist di relayer nemmeno per la configurazione del client IBC v2 (`/ibc/core/client/v2/config/07-tendermint-0` risponde `allowed_relayers: []`). I pacchetti IBC v2 usano timeout assoluti in secondi Unix. QORel non fa ancora da relay per IBC v2.

## qorel-signer {#qorel-signer}

Il firmatario è un crate separato, `qorel-signer`, nel repository di QORel in `crates/qorel-signer`. Non è su crates.io; usalo come dipendenza git. Che cosa garantisce:

- **Co-firmatario modulare.** La firma aggiuntiva di una chain viene aggiunta da un co-firmatario, e le chain con firma standard non ne usano alcuno, quindi le loro transazioni restano invariate.
- **Byte protobuf grezzi.** Lavora su byte codificati e non dipende da alcun tipo IBC o del relayer.
- **Una policy sul body.** Rifiuta i body che la chain respingerebbe: un'opzione di estensione critica già presente, il flag `unordered` o campi sconosciuti.
- **Nessuna ipotesi sulla versione.** Non ripiega mai sui sign-bytes v1 sulle reti QoreChain prima che la versione dei sign-bytes sia nota.
- **Firme autoverificate.** Ogni firma viene verificata prima dell'uso.
- **Segreti gestiti.** I segreti vengono azzerati e oscurati nell'output di `Debug`.
- **Test byte per byte.** I test ricostruiscono, byte per byte, transazioni di relay che l'ante handler della chain ha accettato.

Un esempio d'uso si trova in `crates/qorel-signer/README.md` nel repository; vedi anche [Firmare da qualsiasi linguaggio](/qorel/signing-from-any-language#signer-layer). Lo stesso hook del firmatario è proposto a monte in Hermes come [informalsystems/hermes#4435](https://github.com/informalsystems/hermes/pull/4435) (aperta, non unita).

## Come si usa {#how-to-use}

Installa il binario, scrivi una configurazione con una voce per chain, aggiungi una chiave per ogni chain, registra la chiave post-quantistica su QoreChain, verifica che tutto sia pronto, poi avvia il relayer:

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana    # ready_to_relay must be true
qorel health-check
qorel start
```

Le pagine di questa sezione:

| Pagina | Che cosa tratta |
|---|---|
| [Novità](/qorel/whats-new) | Che cosa aggiunge la 0.1.0 rispetto a Hermes |
| [Installazione](/qorel/install) | Tarball, `.deb`, `.rpm`, Homebrew, container, da sorgente e come verificare ciascuno |
| [Avvio rapido](/qorel/quickstart) | Dall'installazione al primo trasferimento sulla testnet |
| [Configurazione](/qorel/configuration) | La voce della chain QoreChain, le chiavi, il gas e i controlli di sicurezza |
| [Eseguire QORel accanto a un validatore](/qorel/running-next-to-a-validator) | Configurazioni con systemd, Docker Compose e Kubernetes |
| [Monitoraggio](/qorel/monitoring) | Telemetria, su che cosa impostare gli alert |
| [Firmare da qualsiasi linguaggio](/qorel/signing-from-any-language) | Il contratto della firma ibrida e le librerie per cinque linguaggi |
| [Risoluzione dei problemi](/qorel/troubleshooting) | Domande e soluzioni |

## Come accedere {#how-to-access}

- **Rete.** Solo la testnet `qorechain-diana` (la testnet esegue la v3.2.6). La mainnet `qorechain-vladi` non ha alcun canale IBC aperto; vedi [Bridging Assets](/user-guide/bridging-assets#ibc-testnet-v326) per che cosa ha ciascuna rete.
- **Controparte.** La testnet pubblica di Cosmos Hub, chain ID `provider`, tramite `channel-600`. Qualsiasi altra chain Cosmos SDK funziona allo stesso modo della voce `provider` nella configurazione di esempio.
- **Endpoint.** QORel richiede per ogni chain un RPC di consenso, un WebSocket e un endpoint gRPC. La testnet di QoreChain ha un RPC pubblico (`https://rpc-testnet.qore.host`) e un REST pubblico (`https://api-testnet.qore.host`), ma oggi nessun endpoint gRPC pubblico, e non ne è promesso alcuno, quindi un relayer di terze parti per `qorechain-diana` richiede un proprio nodo testnet ([Eseguire un nodo](/developer-guide/running-a-node), [Connessione alla testnet](/getting-started/connecting-to-testnet)). Gli endpoint pubblici che limitano la frequenza dei relayer possono servire per una breve prova, ma non per un relay continuo.
- **Account.** Un account relayer dedicato su ciascuna chain, con un piccolo saldo per le commissioni. I QOR di testnet provengono dal [Faucet della dashboard](/dashboard/faucet); non hanno alcun valore. Non usare mai la chiave operatore di un validatore.
- **Costo.** QORel è gratuito. Su QoreChain una transazione costa gas per prezzo, con un minimo di 0,1 uqor per gas, e l'intera commissione viene addebitata senza rimborso.
- **Piattaforme.** Linux x86_64 e arm64 (glibc 2.28 o successiva), macOS Apple Silicon e Intel, e un'immagine container per tutto il resto. Windows non è supportato; usa il container sotto WSL2.

## Dove è pubblicato {#where-published}

| Dove | Che cosa | Versione |
|---|---|---|
| [GitHub: qorechain/QORel](https://github.com/qorechain/QORel) | Codice sorgente, issue e la pagina delle release con tarball, `.deb`, `.rpm`, `SHA256SUMS` e attestazioni di build | 0.1.0 |
| Homebrew | `brew install qorechain/tap/qorel` | 0.1.0 |
| `ghcr.io/qorechain/qorel` | Immagine container (amd64 e arm64, distroless, non-root, firmata con cosign) | 0.1.0 |
| Crate `qorel-signer` | Il livello di firma, nel repository in `crates/qorel-signer`; usa una dipendenza git | Non su crates.io |

Licenza: Apache-2.0. QORel deriva da Hermes, copyright Informal Systems Inc. e gli autori di Hermes, anch'esso Apache-2.0; il file `NOTICE` del repository riporta l'attribuzione. Vedi [Installazione](/qorel/install) per i comandi e per come verificare un download.

Per gli altri pacchetti per sviluppatori vedi [Pacchetti per sviluppatori](/developer-tools/overview). Per come l'IBC si inserisce nella chain vedi [Architettura del bridge](/architecture/bridge-architecture#ibc-relayer).

## Limiti e problemi noti {#limits}

- **Solo testnet.** QORel è stato eseguito su `qorechain-diana` e sulla testnet pubblica di Cosmos Hub. Non ha mai fatto da relay su mainnet, e non è aperto alcun canale IBC su mainnet.
- **Solo IBC v1 (classico).** Il relay IBC v2 non è ancora implementato in QORel; è la fase successiva. Il relay Ethereum (Eureka) non è stato avviato.
- **Versione della chain.** La modalità ibrida segue la versione dei sign-bytes che la chain riporta. Entrambe le reti QoreChain verificano oggi la forma attuale (versione 2).
- **Nessun relayer ospitato.** Questo manuale non offre un servizio di relayer. Se per un canale non è in esecuzione alcun relayer, un trasferimento resta in sospeso finché non ne parte uno.
- **Endpoint pubblici.** Il lato QoreChain richiede gRPC, che non è pubblico. Gli endpoint pubblici di terze parti per altre chain spesso limitano la frequenza dei relayer.
- **Non è un wallet.** QORel firma solo le transazioni che invia come relayer. Per la firma da wallet vedi [QoreSign](/qoresign/overview).
- **Nessuna build per Windows.** Usa il container sotto WSL2.
- **Stato della release.** QORel è una release 0.x. I comandi e le impostazioni identici a quelli di Hermes mantengono il comportamento di Hermes; le impostazioni specifiche di QoreChain potrebbero ancora cambiare prima della 1.0.
