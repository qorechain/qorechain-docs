---
slug: /architecture/post-quantum-security
title: Sicurezza Post-Quantistica
sidebar_label: Sicurezza Post-Quantistica
sidebar_position: 3
---

# Sicurezza Post-Quantistica

QoreChain è costruita con la **crittografia post-quantistica (PQC) sin dal genesis** — non aggiunta successivamente come aggiornamento. Il modulo `x/pqc` fornisce firme digitali basate su reticoli e incapsulamento di chiavi come primitive crittografiche principali, con un framework di agilità degli algoritmi controllato dalla governance per una resilienza a lungo termine.

La baseline PQC completa — **Dilithium-5 (firme) + ML-KEM-1024 (KEM) + SHAKE-256 (hash)** — è ora completa ed è il valore predefinito della rete. Sulle reti in produzione (v3.2.x), le firme ibride sono **richieste per impostazione predefinita** sul percorso delle transazioni cosmos: `hybrid_signature_mode = required` e `allow_classical_fallback = false`. Ogni transazione del percorso cosmos deve recare una firma Dilithium-5 accanto alla sua firma classica secp256k1; le transazioni solo classiche da un account PQC vengono rifiutate e il percorso di downgrade classico è chiuso. La mainnet esegue la v3.2.4 e la testnet la v3.2.6 (verificato il 27 ottobre 2026); ciò che le release v3.2.2 e v3.2.3 hanno aggiunto alle regole post-quantistiche (integrità delle chiavi, prova di possesso facoltativa, finestre EVM con ambito, consenso EIP-7702) è descritto in [Regole di integrità delle chiavi](#key-integrity), [Prova di possesso](#proof-of-possession) e [Delegazioni EIP-7702](#eip-7702).

## Principi di progettazione

* **PQC richiesta per impostazione predefinita**: Le firme post-quantistiche sono obbligatorie sul percorso cosmos. Le sole firme classiche secp256k1 non sono più sufficienti — `allow_classical_fallback = false`.
* **Ibrida per impostazione predefinita**: Le transazioni cosmos recano simultaneamente sia una firma classica secp256k1 sia una firma PQC Dilithium-5. Il fallback solo classico è chiuso.
* **Agilità degli algoritmi**: Il registro degli algoritmi crittografici è controllato dalla governance, consentendo alla rete di adottare nuovi algoritmi o di deprecare quelli compromessi senza hard fork.
* **Verifica deterministica**: Tutta la verifica delle firme è deterministica e riproducibile su tutti i nodi validatori.

## Algoritmi supportati

| Algoritmo       | Standard             | Categoria                | Livello NIST | Chiave pubblica | Chiave privata | Firma / Ciphertext | Segreto condiviso |
| --------------- | -------------------- | ------------------------ | ------------ | --------------- | -------------- | ------------------ | ----------------- |
| **Dilithium-5** | ML-DSA-87 (FIPS 204) | Firma                    | 5            | 2.592 byte      | 4.896 byte     | 4.627 byte         | --                |
| **ML-KEM-1024** | FIPS 203             | Incapsulamento di chiavi | 5            | 1.568 byte      | 3.168 byte     | 1.568 byte         | 32 byte           |

Entrambi gli algoritmi operano al **NIST Security Level 5**, la più alta categoria di sicurezza standardizzata, fornendo una protezione equivalente ad AES-256 contro avversari sia classici che quantistici.

## Backend crittografico

Le operazioni PQC sono implementate in un backend crittografico ad alte prestazioni e memory-safe che espone la firma, la verifica e l'incapsulamento di chiavi basati su reticoli al runtime di QoreChain. Il backend fornisce:

Operazioni specifiche per algoritmo:

* Generazione di chiavi, firma e verifica Dilithium-5
* Generazione di chiavi, incapsulamento e decapsulamento ML-KEM-1024
* Generazione deterministica del beacon casuale (`seed`, `epoch`)

Operazioni consapevoli dell'algoritmo:

* `Keygen(algorithmID)` — Genera una coppia di chiavi per qualsiasi algoritmo registrato
* `Sign(algorithmID, privkey, message)` — Crea una firma
* `Verify(algorithmID, pubkey, message, signature)` — Verifica una firma
* `AlgorithmInfo(algorithmID)` — Interroga le dimensioni di chiave/output
* `ListAlgorithms()` — Enumera tutti gli algoritmi supportati

Tutte le operazioni di firma e verifica sono deterministiche e producono risultati identici su ogni nodo validatore e piattaforma supportata.

Queste stesse primitive — ML-DSA (FIPS-204), ML-KEM (FIPS-203) e SHAKE-256 (FIPS-202) — sono disponibili per wallet e integratori attraverso la libreria open-source [**qorechain-pqc**](https://github.com/qorechain/qorechain-pqc), che fornisce un'unica API coerente e byte-compatibile in sei linguaggi (JavaScript/TypeScript, Rust, Go, C, Python, Java). Vedi [Firma Post-Quantistica](/developer-guide/post-quantum-signing).

## Registrazione delle chiavi {#key-registration}

Gli account registrano le chiavi PQC esplicitamente tramite `MsgRegisterPQCKey` (legacy, predefinito Dilithium-5) o `MsgRegisterPQCKeyV2` (consapevole dell'algoritmo); la chain non registra mai una chiave di propria iniziativa, e il flusso CLI è `qorechaind tx pqc gen-key <name>` seguito da `qorechaind tx pqc register-key <public_key_hex> hybrid --from <key>` (vedi [Prima transazione](/getting-started/first-transaction#register-pqc-key)). Ogni messaggio include:

* **Sender**: L'indirizzo dell'account che registra la chiave.
* **PublicKey**: I byte della chiave pubblica PQC.
* **AlgorithmID**: L'identificatore dell'algoritmo PQC (solo v2).
* **ProofOfPossession**: Firma facoltativa della nuova chiave (solo v2, dalla v3.2.3); vedi [Prova di possesso](#proof-of-possession).
* **KeyType**: Uno tra `hybrid` o `pqc_only` (un terzo valore, `classical_only`, esiste ancora nello schema ma è rifiutato dalla v3.2.3):

| Tipo di chiave   | Descrizione                                                                                                                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hybrid`         | Sia chiavi classiche (ECDSA) che PQC. Le transazioni recano doppie firme.                                                                                                                                                             |
| `pqc_only`       | Registrata come `hybrid`: la firma classica secp256k1 viene comunque verificata dai controlli di firma standard, e anche la firma PQC è richiesta.                                                                                    |
| `classical_only` | **Rifiutato dalla v3.2.3.** Una registrazione con questo tipo di chiave non registra alcuna chiave post-quantistica utilizzabile e lascerebbe l'account incapace di firmare, quindi la chain la rifiuta.                              |

### Regole di integrità delle chiavi (v3.2.3) {#key-integrity}

Dall'aggiornamento v3.2.3 (altezza mainnet 3.662.051, 20 ottobre 2026; altezza testnet 8.003.746) la chain applica queste regole alle chiavi post-quantistiche. Al di sotto di quell'altezza nessuna di esse veniva applicata.

| Regola | Comportamento |
| --- | --- |
| Nessuna chiave debole | Una registrazione viene rifiutata se il tipo di chiave è `classical_only`, la chiave è vuota o la chiave è degenere: una chiave della lunghezza giusta la cui struttura non offre alcuna protezione post-quantistica. Genera le chiavi con `tx pqc gen-key` o con la libreria `qorechain-pqc` e registra ciò che stampano |
| Nessun riutilizzo delle chiavi | Una rotazione o una migrazione viene rifiutata se la nuova chiave è una che l'account ha già usato in precedenza. La chain ricorda un hash di ogni chiave da cui un account ha effettuato una rotazione o una migrazione |
| Gli account con chiave richiedono la firma ibrida | Un account che possiede già una chiave utilizzabile deve recare la propria firma ibrida anche su una transazione di registrazione o di migrazione. L'esenzione solo classica ora copre soltanto un account **senza** alcuna chiave registrata, oppure uno il cui record memorizzato non contiene alcuna chiave utilizzabile (che `MsgRegisterPQCKeyV2` può quindi sostituire) |
| Nessuna estensione senza chiave | In modalità `required`, un account senza chiave registrata non può passare allegando un'estensione ibrida che nulla è in grado di verificare; solo una registrazione può passare senza di essa |
| Un'unica estensione | Una transazione reca al massimo un'estensione di firma ibrida |
| Nessun messaggio di chiave tramite authz | `MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`, `MsgRotatePQCKey` e `MsgMigratePQCKey` non possono essere eseguiti per conto di un account tramite `x/authz`; è richiesta la firma dell'account stesso |
| Protezioni di governance sugli algoritmi | Deprecare o disabilitare un algoritmo non può lasciare la chain senza un algoritmo di firma attivo, e l'algoritmo sostitutivo deve essere in grado di firmare |

La v3.2.2 ha aggiunto un controllo correlato: una registrazione convalida la `ecdsa_pubkey` classica che reca e la lega all'account firmatario, così un account non può registrare una chiave classica che non è la propria.

Anche i nodi filtrano questi casi nel mempool, così una transazione che può solo fallire non viene ritrasmessa e non costa alcuna commissione.

### Prova di possesso (facoltativa) {#proof-of-possession}

`MsgRegisterPQCKeyV2` ha un campo facoltativo `proof_of_possession`. Quando è presente, la chain la verifica; quando è assente, la registrazione procede come prima (la prova **non è richiesta**). La prova è una firma della chiave da registrare su

```text
qorechain-pqc-pop-v1|<chain-id>|<algorithm-id>|<account-address>|<hex(public-key)>
```

così una prova prodotta per un account o una chain non dimostra nulla su un'altra. La CLI la costruisce per te quando indichi il file della chiave locale:

```bash
qorechaind tx pqc register-key-v2 dilithium5 <pubkey-hex> hybrid \
  --pqc-key mypqc --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor
```

La registrazione è esente dal requisito ibrido solo per un account senza chiave, quindi questa transazione è firmata con la sola chiave classica dell'account. Una prova malformata viene rifiutata con `ErrInvalidProofOfPossession` (codice 231 nel modulo `pqc`).

**Dalla v3.2.4 (mainnet dal 23 ottobre 2026, testnet dal 19 ottobre 2026):** il record dell'account acquisisce un booleano `possession_proven`, restituito da `GET /qorechain/pqc/v1/account/{address}`. È `true` quando la chiave attuale è stata registrata con una prova valida, oppure è arrivata tramite una rotazione o una migrazione (entrambe verificano una firma della nuova chiave su byte che nominano la chain, l'account e la chiave); una registrazione senza prova registra `false`, e una chiave che cambia senza prova azzera il flag. La prova rimane facoltativa per le chiavi degli account con la v3.2.4.

## Firme ibride {#hybrid-signatures}

Il sistema di firme ibride richiede che le transazioni del percorso cosmos rechino **sia** una firma classica sia una firma PQC simultaneamente. Ciò fornisce una difesa in profondità: anche se uno schema viene violato, l'altro protegge la transazione.

Con il valore predefinito della rete `hybrid_signature_mode = required`, ogni transazione del percorso cosmos deve includere l'estensione Dilithium-5 accanto alla firma secp256k1. Le uniche esenzioni (per il bootstrap) sono i **gentx di genesis (altezza 0)**, la **registrazione di una chiave PQC** (`MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`) da un account che non ha alcuna chiave registrata (o il cui record non contiene alcuna chiave utilizzabile), a cui è consentito essere solo classica affinché l'account possa registrare la sua prima chiave PQC, e un unjail da un account operatore che non ha alcuna chiave registrata. Dalla v3.2.3 una registrazione o una migrazione da un account che possiede già una chiave utilizzabile richiede la firma ibrida come qualsiasi altra transazione (vedi [Regole di integrità delle chiavi](#key-integrity)).

**Il percorso EVM è invece protetto da una finestra di autorizzazione.** Una transazione EVM non può recare una seconda firma (ML-DSA) — i wallet standard producono una sola firma secp256k1 su una transazione Ethereum e non offrono alcun modo per allegarne un'altra. L'autorizzazione post-quantistica viaggia quindi *prima* della transazione: l'account apre una **finestra di autorizzazione EVM** delimitata con un messaggio del percorso Cosmos (`MsgOpenEVMWindow`), che reca la normale firma ibrida, e il percorso EVM ammette poi solo le transazioni coperte da una finestra attiva. Dalla v3.2.0 una transazione EVM viene rifiutata a meno che il suo mittente (1) abbia una chiave post-quantistica registrata e (2) abbia una finestra attiva con blocchi, transazioni e valore residui. All'interno di una finestra una normale transazione MetaMask/ethers/Hardhat funziona senza modifiche, perché il controllo legge lo stato della chain, non la transazione. Vedi [Finestra di autorizzazione EVM](/getting-started/first-transaction#evm-window).

Dalla v3.2.3 una finestra può anche avere un **ambito** quando viene aperta: `--native-only` la limita ai semplici trasferimenti di QOR nativo (nessun calldata, nessuna creazione di contratti, nessun destinatario che contenga codice, nessuna autorizzazione EIP-7702), e `--allowed-targets 0x…,0x…` ammette solo i destinatari elencati e rifiuta la creazione di contratti. Una finestra aperta senza ambito ammette ciò che ammetteva da sempre. L'ambito fa parte di `MsgOpenEVMWindow` (`native_only`, `allowed_targets`).

### Delegazioni EIP-7702 {#eip-7702}

Una tupla di autorizzazione EIP-7702 installa codice sull'account che l'ha firmata, e quella firma è una firma classica secp256k1 che chiunque può trasportare in una transazione di tipo 4. Dalla v3.2.2 (altezza mainnet 3.556.788) il percorso EVM ammette quindi una transazione di tipo 4 solo se **ogni autorità la cui tupla avrebbe effetto** possiede una chiave post-quantistica registrata e ha **acconsentito**, con un messaggio del percorso Cosmos firmato in modo ibrido, esattamente alla delegazione che la tupla installa.

| Voce | Dettaglio |
| --- | --- |
| Dare il consenso | `qorechaind tx pqc authorize-evm-delegation <delegate-0x-address> <blocks>` (`MsgAuthorizeEVMDelegation`): indica l'indirizzo del delegato che la tupla deve recare e per quanto tempo il consenso rimane utilizzabile (al massimo 17.280 blocchi, lo stesso limite di una finestra) |
| Cancellare una delegazione | L'indirizzo zero come delegato acconsente alla cancellazione. `tx pqc clear-evm-delegation` (`MsgClearEVMDelegation`) cancella una delegazione esistente senza alcuna transazione EVM |
| Uso singolo | Un consenso viene consumato dalla transazione che installa la delegazione, sostituisce qualsiasi consenso precedente per l'account, ed è revocato da `MsgCloseEVMWindow` |
| Leggerlo | `qorechaind query pqc evm-delegation-consent <address>`, oppure `GET /qorechain/pqc/v1/evm_delegation_consent/{address}` (campi `live`, `delegate`, `granted_height`, `expiry_height`, `current_delegate`, `nonce`) |
| Limiti | Al massimo 8 autorizzazioni per transazione di tipo 4. Il valore che esce da un account delegato è addebitato alla sua finestra. Una transazione di tipo 4 fallita mantiene le autorizzazioni che ha applicato |
| Delegazione sponsorizzata | Funziona ancora: lo sponsor paga dalla propria finestra, e l'autorità acconsente solo in anticipo |

### Flusso di cofirma

Per produrre una transazione cosmos conforme, la firma classica secp256k1 viene calcolata sui sign bytes standard (che escludono l'estensione PQC), e una firma Dilithium-5 viene calcolata sui byte firmati v2 (vedi [Byte firmati (v2)](#sign-bytes-v2) più sotto) e allegata come estensione `PQCHybridSignature`. Il tooling standard CosmJS / relayer deve produrre questa estensione per transare sul percorso cosmos. Oggi ciò viene fatto tramite:

* `qorechaind tx pqc gen-key <name>` — genera una chiave Dilithium-5.
* `qorechaind tx pqc cosign <unsigned_tx_file> --from <key> --pqc-key <name>` — allega la cofirma Dilithium-5 a una transazione costruita con `--generate-only`.
* La firma ibrida del QoreChain SDK — `buildHybridTx`. La chiave dell'account deve essere già registrata con `MsgRegisterPQCKey`.
* [QoreX](/qorex/overview), che fa entrambe le cose per te.

*Una transazione firmata con secp256k1 (ECDSA) più ML-DSA-87 (Dilithium-5), verificata dall'ante handler nella modalità di applicazione a livello di chain.*

```mermaid
flowchart TD
    A["Transaction<br/>secp256k1 (ECDSA) signature<br/>+ ML-DSA-87 (Dilithium-5) extension"] --> B["PQCHybridVerifyDecorator"]
    B --> C{"Account has<br/>registered PQC key?"}
    C -- "Yes, extension present" --> D["Verify PQC signature<br/>against registered key"]
    C -- "No extension" --> F{"Hybrid mode"}
    F -- "Disabled / Optional" --> G["Allow classical-only tx"]
    F -- "Required" --> H["Reject transaction"]
    D --> I["Accept"]
    G --> I
```

### Byte firmati (v2) {#sign-bytes-v2}

La firma ML-DSA copre byte con tag di dominio e legati alla chain. Dalla v3.2.0 la chain verifica **solo** questa forma:

```text
"qorechain-pqc-hybrid-v2" ‖ BE64(len(chainID)) ‖ chainID ‖
BE32(len(B0)) ‖ B0 ‖ BE32(len(authInfo)) ‖ authInfo
```

dove `B0` è il corpo della transazione serializzato **senza** l'estensione PQC e `authInfo` sono i byte AuthInfo così come sono (`‖` è la concatenazione, le lunghezze sono big-endian). Il tag di dominio impedisce che una firma prodotta in un altro contesto (una sfida di login, una richiesta di firma di messaggio) sia valida come firma di transazione, e il legame con il chain ID rende la firma post-quantistica stessa non valida su qualsiasi altra rete. La prima forma (`BE32(len(B0)) ‖ B0 ‖ BE32(len(authInfo)) ‖ authInfo`) veniva verificata solo al di sotto dell'altezza di aggiornamento; nessun blocco accetta entrambe. I payload di migrazione delle chiavi e di attestazione del bridge sono passati allo stesso schema con tag di dominio e legato alla chain.

**Quale forma verifica la mia rete?** Chiedi al nodo se l'aggiornamento è stato applicato:

```bash
curl -s https://api.qore.host/cosmos/upgrade/v1beta1/applied_plan/v3.2.0         # height 2981742 on mainnet
curl -s https://api-testnet.qore.host/cosmos/upgrade/v1beta1/applied_plan/v3.2.0 # height 5920000 on testnet
```

(`"height":"0"` significa non applicato.) Entrambe le reti hanno applicato la modifica da tempo, quindi un client attuale firma ovunque la forma v2; il controllo conta quando si riproducono o si verificano blocchi vecchi. La CLI lo fa con `--sign-bytes auto`, e le release attuali di SDK e wallet-adapter fanno lo stesso. Un client sulla forma sbagliata produce un digest che la chain rifiuta — fallisce in modo chiuso (fail closed).

### Formato dell'estensione TX

Le firme PQC vengono allegate alle transazioni come **estensione TX** con il type URL `/qorechain.pqc.v1.PQCHybridSignature`:

```text
{
  "algorithm_id": 1,
  "pqc_signature": "<4627 bytes for Dilithium-5>",
  "pqc_public_key": "<2592 bytes, optional>"
}
```

Il campo `pqc_public_key` è opzionale e informativo; le chiavi vengono registrate solo tramite un messaggio di registrazione esplicito (vedi [Registrazione delle chiavi](#key-registration)).

### PQCHybridVerifyDecorator

L'ante handler `PQCHybridVerifyDecorator` elabora le firme ibride con una logica di verifica a tre vie:

| Scenario | L'account ha una chiave PQC | Estensione presente | Chiave pubblica nell'estensione | Risultato                                                    |
| -------- | --------------------------- | ------------------- | ------------------------------- | ------------------------------------------------------------ |
| Path 1   | Sì                          | Sì                  | --                              | Verifica la firma PQC rispetto alla chiave registrata        |
| Path 3a  | No                          | No                  | --                              | **Modalità Optional**: Consente la transazione solo classica |
| Path 3b  | No                          | No                  | --                              | **Modalità Required**: Rifiuta la transazione                |
| Path 4   | Sì                          | No                  | --                              | Gestito dal PQCVerifyDecorator standard                      |

Una chiave deve essere registrata con `MsgRegisterPQCKey` / `MsgRegisterPQCKeyV2` prima che l'account invii transazioni firmate in modo ibrido; il campo `pqc_public_key` dell'estensione non registra nulla.

### Modalità delle firme ibride

Il livello di applicazione ibrida a livello di chain è configurabile dalla governance. Il **valore predefinito attuale della rete è `required`**:

| Modalità     | ID | Predefinito | Comportamento                                                                                                                                 |
| ------------ | -- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Disabled** | 0  | No          | Solo firme classiche. Le estensioni PQC vengono ignorate.                                                                                     |
| **Optional** | 1  | No          | Le estensioni PQC vengono verificate se presenti. Gli account senza chiavi PQC possono transare con sole firme classiche.                     |
| **Required** | 2  | **Sì**      | Tutte le transazioni del percorso cosmos devono recare sia firme classiche che PQC. Le transazioni senza un'estensione PQC vengono rifiutate. |

La rete ha completato la sua migrazione: **Optional** (genesis) → **Required** (il valore predefinito attuale dalla v3.1.71, con `allow_classical_fallback = false`). Le tre modalità rimangono controllate dalla governance e possono essere modificate tramite proposta.

## Framework di agilità degli algoritmi

Il framework di agilità degli algoritmi fornisce un registro controllato dalla governance per gli algoritmi PQC, consentendo alla rete di aggiungere nuovi algoritmi, deprecare quelli vulnerabili e migrare gli account — il tutto senza hard fork.

### Ciclo di vita dell'algoritmo

Ogni algoritmo registrato ha uno stato del ciclo di vita:

```
active --> migrating --> deprecated --> disabled
```

| Stato          | Descrizione                                                                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Active**     | Pienamente operativo. Vengono accettate nuove registrazioni di chiavi e verifiche.                                                                          |
| **Migrating**  | Il periodo di doppia firma è attivo. Gli account sono incoraggiati a migrare all'algoritmo sostitutivo. Vengono accettate sia le vecchie che le nuove firme. |
| **Deprecated** | Le firme esistenti possono ancora essere verificate, ma non vengono accettate nuove registrazioni di chiavi.                                                |
| **Disabled**   | Kill switch di emergenza. L'algoritmo non può verificare alcuna firma. Utilizzato quando viene scoperta una vulnerabilità.                                  |

### Migrazione a doppia firma

Quando un algoritmo viene deprecato, inizia un **periodo di migrazione** (predefinito: 1.000.000 blocchi — circa 36 giorni con l'attuale tempo di blocco della mainnet di ≈3,1 s). Durante questo periodo:

1. Gli account con chiavi che utilizzano l'algoritmo deprecato devono migrare al sostitutivo.
2. La migrazione richiede doppie firme (`MsgMigratePQCKey`): una dalla vecchia chiave e una dalla nuova chiave, a dimostrazione del possesso di entrambe.
3. Entrambi gli algoritmi vengono accettati per la verifica per tutta la durata del periodo di migrazione.

### Messaggi

| Messaggio                                             | Descrizione                                                                                                                                                                              |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MsgRegisterPQCKey` / `MsgRegisterPQCKeyV2`           | Registra la chiave PQC di un account (vedi [Registrazione delle chiavi](#key-registration)). Può essere firmato in modo classico affinché un nuovo account possa fare il bootstrap.       |
| `MsgMigratePQCKey`                                    | Migrazione a doppia firma dalla chiave di un algoritmo a quella di un altro durante un periodo di migrazione. Rifiuta una chiave che l'account ha già usato in precedenza (v3.2.3).       |
| `MsgRotatePQCKey`                                     | Ruota la chiave ML-DSA-87 dell'account all'interno dello stesso algoritmo (doppia firma della vecchia e della nuova chiave; `tx pqc rotate-key`). Rifiuta una chiave che l'account ha già usato in precedenza (v3.2.3). |
| `MsgOpenEVMWindow` / `MsgCloseEVMWindow`              | Apre o chiude la finestra di autorizzazione EVM (v3.2.0; ambito facoltativo dalla v3.2.3); vedi [Finestra di autorizzazione EVM](/getting-started/first-transaction#evm-window).          |
| `MsgAuthorizeEVMDelegation` / `MsgClearEVMDelegation` | Acconsente a, o cancella, una delegazione EIP-7702 dell'account del mittente (v3.2.2); vedi [Delegazioni EIP-7702](#eip-7702).                                                           |
| `MsgDeprecateAlgorithm`                               | Messaggio di governance: avvia il processo di deprecazione di un algoritmo. Specifica l'algoritmo sostitutivo e il periodo di migrazione in blocchi.                                     |
| `MsgDisableAlgorithm`                                 | Messaggio di governance: disabilita immediatamente un algoritmo in emergenza. Richiede una stringa di motivazione. Utilizzato quando viene scoperta una vulnerabilità crittografica.     |

`MsgDeprecateAlgorithm` e `MsgDisableAlgorithm` sono attualmente disattivati sulla mainnet dal circuit breaker (vedi [Parametri della chain](/appendix/chain-parameters#circuit-breaker)); sulla testnet non sono disattivati. Su entrambe le reti, dalla v3.2.3, si applicano le protezioni di governance sugli algoritmi descritte in [Regole di integrità delle chiavi](#key-integrity).

### Estensibilità

L'aggiunta di un algoritmo richiede una release software che lo implementi dietro l'interfaccia unificata di firma e verifica; il registro e il ciclo di vita di deprecazione/disabilitazione sono controllati dalla governance.

## Hash SHAKE-256

A partire dalla v3.1.73, **SHAKE-256** (funzione a output estendibile SHA-3) è l'**hash applicativo predefinito** in tutta QoreChain — fornito dal package `qorehash` — completando la baseline crittografica accanto alle firme Dilithium-5 e all'incapsulamento di chiavi ML-KEM-1024. Il modulo `x/pqc` fornisce utilità SHAKE-256 in puro Go:

| Funzione                           | Descrizione                            | Output               |
| ---------------------------------- | -------------------------------------- | -------------------- |
| `SHAKE256Hash(data, outputLen)`    | Digest SHAKE-256 a lunghezza variabile | Lunghezza arbitraria |
| `SHAKE256Hash32(data)`             | Digest SHAKE-256 standard a 256 bit    | 32 byte              |
| `SHAKE256ConcatHash(left, right)`  | Hash di input concatenati              | 32 byte              |
| `SHAKE256DomainHash(domain, data)` | Hash separato per dominio              | 32 byte              |

Queste utilità supportano l'hash applicativo predefinito e vengono utilizzate per:

* Hashing dei nodi dell'albero Merkle
* Hash commitment nelle attestazioni cross-layer
* Separazione per dominio per diversi contesti di hash (ad es. `"leaf:"` vs `"node:"`)

## Bridge PQC

Le attestazioni del bridge sono progettate per usare firme **Dilithium-5** (ML-DSA-87), in modo che la sicurezza cross-chain non venga degradata dalla crittografia classica nell'infrastruttura del bridge. Questa è un'intenzione di progetto: descrive come i validatori del bridge dovrebbero attestare, non un comportamento che si possa esercitare oggi su una rete live. Nessuna rotta del bridge è attiva (vedi [Architettura del bridge](/architecture/bridge-architecture#current-status)); dalla v3.2.4 (mainnet dal 23 ottobre 2026, testnet dal 19 ottobre 2026), la registrazione di un validatore del bridge richiede anche una prova di possesso della sua chiave PQC.

## Parametri del modulo

| Parametro                  | Tipo                | Predefinito       | Descrizione                                                           |
| -------------------------- | ------------------- | ----------------- | --------------------------------------------------------------------- |
| `pqc_primary`              | bool                | `true`            | PQC è lo schema di firma principale                                   |
| `allow_classical_fallback` | bool                | `false`           | Il fallback solo classico è chiuso; le tx cosmos devono essere ibride |
| `min_security_level`       | int32               | `5`               | Livello di sicurezza NIST minimo per gli algoritmi accettati          |
| `default_migration_blocks` | int64               | `1,000,000`       | Periodo di migrazione a doppia firma predefinito in blocchi           |
| `default_signature_algo`   | AlgorithmID         | `1` (Dilithium-5) | Algoritmo di firma predefinito per le nuove registrazioni di chiavi   |
| `hybrid_signature_mode`    | HybridSignatureMode | `2` (Required)    | Livello di applicazione delle firme ibride a livello di chain         |

La testnet restituisce questi stessi valori (verificato il 27 ottobre 2026). Dalla v3.2.6 la testnet li serve anche via REST su `GET /qorechain/pqc/v1/params`; sulla mainnet quella route risponde 501 (non implementata) e i parametri si leggono con `qorechaind query pqc params`.

## Correlati

* [Firma Post-Quantistica](/developer-guide/post-quantum-signing) — la libreria open-source `qorechain-pqc` (sei linguaggi) per queste primitive e la firma ibrida.
* [Configurazione del wallet](/getting-started/wallet-setup) — creare e gestire account protetti da PQC.
* [Account SDK e firma PQC](/sdk/concepts/accounts-pqc) — chiavi e firma post-quantistica dal codice.
* [Parametri della chain](/appendix/chain-parameters) — algoritmi predefiniti e impostazioni di migrazione.
* [Architettura del bridge](/architecture/bridge-architecture) — verifica PQC sui pacchetti cross-chain.
