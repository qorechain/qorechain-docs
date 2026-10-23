---
slug: /developer-guide/post-quantum-signing
title: Firma Post-Quantistica
sidebar_label: Firma Post-Quantistica
sidebar_position: 8
---

# Firma Post-Quantistica

`qorechain-pqc` è la libreria open source di crittografia post-quantistica, **basata esclusivamente sugli standard**, alla base di QoreChain. Fornisce a wallet, integratori e strumenti esattamente le stesse primitive utilizzate dalla chain — in sei linguaggi, con un'unica API coerente, **con compatibilità a livello di byte dimostrata** rispetto a una suite condivisa di vettori di test cross-linguaggio.

La libreria incapsula implementazioni sottoposte ad audit degli **standard NIST definitivi**. **Non** inventa uno schema personalizzato: una variante non standard è esattamente ciò che rompe l'interoperabilità (una firma prodotta in un punto non verrebbe verificata in un altro). Ogni binding è validato rispetto agli stessi vettori, quindi una firma ML-DSA prodotta in un linguaggio viene verificata in tutti gli altri, i segreti condivisi ML-KEM coincidono in tutti e sei e i digest SHAKE-256 sono identici.

* **Repository:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **Licenza:** Apache-2.0

## Primitive

| Primitiva | Standard | Ruolo | Livelli (predefinito in **grassetto**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | firme digitali | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | incapsulamento di chiavi | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | hash a output estendibile | — |

Sono le stesse primitive che QoreChain esegue a livello di protocollo: firme **ML-DSA-87 (Dilithium-5)**, incapsulamento di chiavi **ML-KEM-1024** e **SHAKE-256** come hash applicativo predefinito. Consulta [Sicurezza Post-Quantistica](/architecture/post-quantum-security) per capire come la chain le utilizza.

### Dimensioni (byte)

Scegli il livello di sicurezza in base al tuo budget di dimensione/sicurezza.

| Schema | Sicurezza | Chiave pubblica | Firma / Ciphertext |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> Non è possibile rendere uno standard NIST più piccolo restando conformi allo standard. ML-DSA-87 ha dimensioni fisse di chiavi/firme e byte fissi — "ottimizzarlo" produce una variante non standard che nessun'altra implementazione può verificare. Per ridurre l'ingombro on-chain, usa le leve descritte più sotto invece di modificare lo schema.

## Linguaggi e pacchetti

Ogni linguaggio espone la stessa API, ciascuno basato su un'implementazione diversa sottoposta ad audit. È questo che garantisce la compatibilità a livello di byte — backend indipendenti concordano sullo standard.

| Linguaggio | Pacchetto | Installazione | Basato su |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (import `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (libreria statica + header) | compila dal [repo](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.2.3` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Disponibilità
I binding JavaScript, Rust, Python, Go e Java sono tutti **pubblicati** alla versione **0.2.3** (npm, crates.io, PyPI, il proxy dei moduli Go come `v0.2.3` e Maven Central; verificato il 21 ottobre 2026). Installali con i comandi qui sopra. La distribuzione Python si installa come `qorechain-pqc` ma **si importa come `qorpqc`**. Il pacchetto **Java** è `io.github.qorechain:qorechain-pqc:0.2.3` (backend Bouncy Castle). La versione **0.2.0** ha aggiunto `hybridSignBytes` consapevole della versione (vedi sotto), la **0.2.1** ha corretto il nome dell'upgrade che segna il passaggio a v2 per la mainnet e la **0.2.2** ha corretto la documentazione e i commenti sulla firma hedged rispetto a quella deterministica (la chain accetta entrambe; nel binding JavaScript nel codice è cambiata solo la costante di versione); la **0.2.3** aggiorna le dipendenze crittografiche (Bouncy Castle in Java, `@noble/post-quantum` in JavaScript) con output identico. Usa la 0.2.1 o successiva. Il binding **C** è una libreria statica + header che compili da [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## Firma deterministica (predefinita) {#deterministic-signing}

A partire dalla versione **0.1.1** (e in ogni release successiva), `sign()` produce la variante ML-DSA **deterministica** (FIPS-204 §3.4, in cui la randomness di firma è composta da 32 byte a zero) in **tutti e sei i binding**. La chain accetta qualsiasi firma ML-DSA-87 valida secondo FIPS-204, hedged o deterministica: la verifica è identica per entrambe e un verificatore non può distinguerle senza la chiave segreta. I binding firmano in modo deterministico per default affinché la stessa transazione produca sempre la stessa firma e lo stesso hash di tx, e affinché ogni binding corrisponda ai vettori condivisi.

Fatti chiave:

* L'output deterministico è **identico byte per byte in tutti e sei i binding** per la stessa chiave e lo stesso messaggio, fissato da vettori di test condivisi tra linguaggi.
* La firma hedged resta disponibile come **opt-in esplicito** in ogni binding (ad es. `{hedged: true}` in JavaScript, `sign_hedged` in Rust, `mldsaSignHedged` in Java, `sign(..., hedged=True)` in Python). Le firme hedged sono **accettate dalla chain** come qualsiasi firma FIPS-204 valida; l'unica differenza è che la firma, e quindi l'hash di tx, cambia a ogni firma.
* La versione 0.1.0 del binding JavaScript firmava hedged per default. Anche quelle firme sono valide on-chain; aggiorna alla 0.1.1 se vuoi firme riproducibili che corrispondano ai vettori condivisi.

## Registrare la tua chiave {#pqc-key-registration}

Ogni account registra la propria chiave pubblica ML-DSA-87 **una sola volta, in modo esplicito**. Non esiste alcuna registrazione automatica: una chiave pubblica incorporata in una successiva transazione ibrida (ad esempio l'opzione `includePqcPublicKey` dell'SDK) viene trasportata nell'estensione ma **non** la registra. Una **prima** registrazione è l'unica transazione della lane Cosmos che può essere firmata in modo classico, così un account nuovo di zecca può avviare la propria prima chiave; un account che ha già una chiave deve firmare in modo ibrido ogni messaggio successivo sulla chiave. Eseguila con il `qorechaind` della release (un binario compilato dai sorgenti pubblici non può firmare; vedi [Compilare dai sorgenti](/developer-guide/building-from-source)), con QoreX, oppure con `ensurePqcRegistered` dell'SDK:

```bash
# 1. Create a key. It is stored unencrypted under ~/.qorechaind/pqc/mypqc.dilithium (mode 0600) and the public key hex is printed.
qorechaind tx pqc gen-key mypqc

# 2. Register the public key on your account (classical-signed, because the account has no key yet).
#    --pqc-key mypqc also attaches the optional proof of possession (see below).
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mypqc \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -y

# 3. Verify.
qorechaind query pqc account <address>
```

Imposta `--gas` in modo esplicito: la chiave pubblica da 2.592 byte può superare i 200.000 di gas predefiniti (le registrazioni su mainnet hanno usato circa 220.000–310.000; una registrazione con una prova di possesso trasporta un'ulteriore firma da 4.627 byte, circa 46.000 gas in più), e la fee deve essere almeno gas × 0,1 uqor, quindi `--gas 600000` richiede `--fees 60000uqor` o più. La forma legacy `qorechaind tx pqc register-key <pubkey-hex> hybrid` è equivalente per Dilithium-5. Da quel momento, costruisci ogni transazione della lane Cosmos con `--generate-only` e firmala con `qorechaind tx pqc cosign`. Il file della chiave è la chiave di firma post-quantistica dell'account: chiunque possa leggerlo può cofirmare per l'account insieme alla chiave classica, quindi conservane un backup come per la mnemonic (può essere derivato di nuovo dalla mnemonic, vedi sotto).

Una chiave registrata è anche il primo di due requisiti per inviare transazioni EVM; il secondo è una [finestra di autorizzazione EVM](/developer-guide/evm-development#evm-window) aperta.

### Cosa verifica la chain alla registrazione (mainnet v3.2.3 e successive) {#key-integrity}

Dall'upgrade v3.2.3 (applicato sulla mainnet all'altezza 3.662.051 il 20 ottobre 2026) la chain controlla la chiave stessa, non solo che abbia la lunghezza giusta:

| Regola | Rifiuto (codespace `pqc`) |
| --- | --- |
| `key_type` deve essere `hybrid` o `pqc_only`; `classical_only` non registra alcuna chiave post-quantistica e lascerebbe l'account incapace di firmare di nuovo | codice 230 |
| Una chiave che non offre alcuna protezione post-quantistica (una chiave degenere per la quale nessuno ha bisogno di un segreto) viene rifiutata, sia in registrazione sia in rotazione e migrazione | codice 230 |
| Una chiave che l'account ha già usato in passato non può essere registrata di nuovo né ripristinata con una rotazione (l'account ricorda le chiavi ritirate) | codice 232 |
| La chiave classica nella registrazione deve essere la chiave secp256k1 compressa del firmatario stesso (dalla v3.2.2) | codice 45 |
| Una prova di possesso facoltativa, se presente, deve risultare valida | codice 231 |
| Un account che detiene già una chiave deve firmare in modo ibrido qualsiasi ulteriore messaggio sulla chiave (registrazione, migrazione); solo la riparazione di un record che non contiene alcuna chiave utilizzabile può essere classica | codice 234 |
| Deprecare o disabilitare un algoritmo non può lasciare la chain senza un algoritmo di firma attivo | codice 233 |

Inoltre, dalla v3.2.3, nessuno dei messaggi sulle chiavi (`MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`, `MsgRotatePQCKey`, `MsgMigratePQCKey`) può essere inviato per conto di un account tramite `authz`; una transazione può contenere al massimo **una** estensione di firma ibrida; e un account che **non** ha alcuna chiave registrata non può più allegare un'estensione ibrida che non ha nulla rispetto a cui essere verificata (può passare solo una registrazione, esattamente come senza alcuna estensione).

### Prova di possesso (facoltativa) {#proof-of-possession}

Una registrazione può anche dimostrare che chi la effettua detiene il segreto della nuova chiave. La chiave firma `qorechain-pqc-pop-v1|<chain-id>|<algorithm id>|<address>|<public key hex>` (l'algorithm id è `1` per ML-DSA-87; la chiave pubblica è in esadecimale minuscolo) e la firma va nel campo `proof_of_possession` di `MsgRegisterPQCKeyV2`. Con la CLI, `register-key-v2 ... --pqc-key <name>` la costruisce e la allega. Con l'SDK TypeScript 0.9.0, `ensurePqcRegistered` allega la prova da solo una volta che la rete ha applicato la v3.2.3 (e `signProofOfPossession` / `verifyProofOfPossession` ne costruiscono e ne controllano una a mano); `@qorechain/chain-bridge` 0.2.3 fa lo stesso quando gli viene passato `cosmosRest`. `@qorechain/wallet-adapter` (0.4.0) e le release dell'SDK precedenti alla 0.9.0 non ne allegano alcuna, quindi una registrazione effettuata con essi non ne contiene alcuna, e la chain la accetta comunque. La chain verifica la prova **quando è presente** e rifiuta la registrazione se non risulta valida (codice 231); una registrazione senza prova viene comunque accettata sulla mainnet. Poiché il messaggio nomina la chain, l'algoritmo, l'account e la chiave, una prova creata per uno di essi non dimostra nulla per un altro.

**Flag di possesso e validator del bridge (v3.2.4).** Il record dell'account indica se la chiave attuale dell'account è stata dimostrata: `possession_proven`, in `GET /qorechain/pqc/v1/account/{address}`. È `true` quando la chiave è stata registrata con una prova di possesso verificata, oppure installata da una rotazione (la nuova chiave firma la rotazione, il che la dimostra); resta `false` per un account che si è registrato senza prova. Il flag non cambia nulla su chi può inviare o ricevere. La registrazione di un **validator del bridge** richiede inoltre una prova di possesso della chiave post-quantistica del validator (`proof_of_possession` nella registrazione; la chiave firma `qorechain-pqc-pop-v1|<chain-id>|1|<validator address>|<public key hex>`, con la CLI `--pqc-key`), e due validator del bridge non possono registrare la stessa chiave. Il bridge cross-chain in sé non è in produzione. Entrambe le modifiche sono attive sulla testnet dal 19 ottobre 2026 e sulla mainnet dal 23 ottobre 2026 (v3.2.4, applicata all'altezza 3.742.566 dalla proposta di governance 13).

## Codici di rifiuto (codespace `pqc`) {#pqc-codes}

| Codice | Significato |
| --- | --- |
| 20 | Firma ibrida richiesta: la transazione non contiene alcuna estensione PQC (sono esenti solo una prima registrazione e un unjail da parte di un account senza chiave) |
| 21 | La metà ML-DSA-87 non è stata verificata, vedi [sotto](#code-21) |
| 26, 27, 28 | Lane EVM: nessuna finestra aperta o nessuna chiave / finestra esaurita / limiti della finestra non validi, vedi [Sviluppo EVM](/developer-guide/evm-development#evm-window) |
| 45 | La chiave classica in una registrazione non è la chiave secp256k1 compressa del firmatario stesso |
| 60, 61 | Delega EIP-7702: nessun consenso post-quantistico per questa delega / richiesta di delega non valida |
| 62, 63 | Un account delegato non ha alcuna finestra che copra l'azione / una transazione Ethereum viene eseguita solo sulla lane EVM |
| 230 | Chiave debole o registrazione `classical_only` |
| 231 | La prova di possesso non risulta valida |
| 232 | La chiave è già stata usata da questo account |
| 233 | Non resterebbe alcun algoritmo di firma attivo |
| 234 | La manutenzione delle chiavi da un account con chiave richiede la firma ibrida |

## Risoluzione del codice `pqc` 21 (`hybrid_verify_failed`) {#code-21}

Il codice 21 significa che la metà ML-DSA-87 di una firma ibrida non è stata verificata rispetto alla chiave registrata dell'account. La scelta tra firma hedged e deterministica non ne è **mai** la causa. Controlla, in quest'ordine:

1. **Versione dei sign-bytes.** La firma PQC copre i sign-bytes v1 o v2, e una rete verifica esattamente una forma a ogni altezza: `qorechain-diana` è passata a v2 con l'upgrade `v3.1.98`, `qorechain-vladi` con l'upgrade `v3.2.0`, e le chain nate dopo sono v2 dal genesis. Gli SDK attuali scelgono la forma per rete; un firmatario costruito in proprio deve chiedere al nodo quale upgrade è applicato (vedi [Account e firma PQC](/sdk/concepts/accounts-pqc)).
2. **Chain-id nei sign-bytes v2.** v2 vincola il chain-id, quindi una firma creata per `qorechain-diana` non si verifica su `qorechain-vladi` e viceversa.
3. **Libreria PQC obsoleta.** Le build precedenti allo standard (pre-FIPS-204) producono firme che un verificatore conforme rifiuta. Usa `qorechain-pqc` 0.1.1 o successiva.
4. **Chiave sbagliata.** La chiave pubblica deve essere quella registrata per l'account (`GET /qorechain/pqc/v1/account/{address}`). Una chiave ottenuta con un'altra derivazione (ad esempio la vecchia derivazione del bridge `shake256(mnemonic)` invece di quella legata all'indirizzo) firma in modo valido ma non corrisponde. Vedi [Rotazione della chiave](#key-rotation) per passare alla chiave canonica.

## Derivazione deterministica delle chiavi e recupero {#key-derivation}

La derivazione standard dell'ecosistema vincola la chiave ML-DSA-87 all'account, rendendola **recuperabile con la sola mnemonic dell'account**:

```
seed = SHAKE-256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic)
(publicKey, secretKey) = mldsa.keygen(seed)
```

Ogni strumento pubblicato (`@qorechain/wallet-adapter`, `@qorechain/sdk`, `@qorechain/chain-bridge` ≥0.1.1) deriva questa stessa chiave, quindi una mnemonic produce una sola chiave indipendentemente dagli strumenti utilizzati. Recupera una chiave da CLI (mnemonic su stdin):

```bash
# the mnemonic is read from stdin; keep it out of shell history by redirecting from a file you delete afterwards
qorechaind tx pqc recover-key mykey qor1youraddress... < mnemonic.txt
# legacy tooling derivation (shake256(mnemonic) only, unbound to the address):
qorechaind tx pqc recover-key mykey qor1youraddress... --derivation bridge < mnemonic.txt
```

La chiave privata recuperata viene scritta come hex non cifrato (modalità 0600) in `<home>/pqc/mykey.dilithium` per l'uso con `tx pqc cosign`.

## Rotazione delle chiavi (stesso algoritmo) {#key-rotation}

A partire dalla versione della chain **v3.1.85**, **`MsgRotatePQCKey`** ruota la chiave ML-DSA-87 di un account **all'interno dello stesso algoritmo** — in precedenza la registrazione era un'operazione una tantum e `MigratePQCKey` operava solo tra algoritmi diversi. Usalo per migrare una chiave con derivazione legacy alla derivazione canonica vincolata all'indirizzo, o per ritirare una chiave compromessa.

La rotazione è **a doppia firma**: sia la vecchia sia la nuova chiave firmano il messaggio con separazione di dominio `"qorechain-pqc-rotate-v1|chainId|algorithm|account|oldPubHex|newPubHex"`. Il replay è strutturalmente impossibile — una volta effettuata la rotazione, la vecchia chiave non corrisponde più alla chiave registrata, quindi lo stesso messaggio non può essere riapplicato. La rotazione è un'operazione **riservata alla sola chiave root** (mai delegabile a un [authenticator](/developer-guide/account-abstraction#authenticators)), e la transazione stessa è comunque firmata in modalità ibrida con la *vecchia* chiave, a dimostrazione della titolarità corrente.

CLI in un solo passaggio (mnemonic su stdin; recupera la vecchia chiave, deriva o genera la nuova, appone la doppia firma, trasmette):

```bash
# migrate a legacy-derived key to the canonical derivation (mnemonic on stdin):
qorechaind tx pqc rotate-key --old-derivation bridge --new-derivation adapter \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt

# rotate to a brand-new random key (compromise recovery); --new-key-out is required and is written before anything is sent:
qorechaind tx pqc rotate-key --old-derivation adapter --new-random --new-key-out mykey-new \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt
```

La rotazione trasporta due chiavi da 2.592 byte e tre firme, quindi richiede molto più gas di un trasferimento; mantieni l'esplicito `--gas 600000` e una fee di almeno 60.000 uqor. `--new-random` senza `--new-key-out` viene rifiutato (release del nodo v3.2.1 e successive) in modo che una rotazione non possa mai lasciarti senza la nuova chiave.

In codice, `@qorechain/wallet-adapter` (≥0.1.7) e `@qorechain/sdk` (≥0.7.0) espongono lo stesso flusso (sincrono; restituisce il messaggio più entrambe le coppie di chiavi):

```js
import { rotatePqcKeyMsgFromMnemonic } from "@qorechain/wallet-adapter";

// Builds the dual-signed MsgRotatePQCKey migrating shake256(mnemonic) -> canonical:
const { msg, oldKeypair, newKeypair } = rotatePqcKeyMsgFromMnemonic({
  account: "qor1youraddress...", mnemonic, chainId: "qorechain-vladi",
});
// Sign & broadcast `msg` with the account's normal hybrid signer, using `oldKeypair` for the envelope's PQC signature.
```

Gli helper di rotazione dell'SDK 0.9.0 e di `@qorechain/wallet-adapter` 0.4.0 rifiutano la derivazione legacy come **nuova** chiave (non è vincolata all'account); una chiave legacy può comunque essere la vecchia chiave. Dopo una rotazione andata a buon fine, la nuova chiave firma (code 0) e la vecchia chiave viene rifiutata (`pqc` code 21). Dalla v3.2.3 una rotazione (come una migrazione) rifiuta una nuova chiave che non offre alcuna protezione post-quantistica (codice 230) e una chiave che l'account ha già usato in passato (codice 232), e non può essere inviata tramite `authz`.

## API coerente

Ogni linguaggio fornisce la stessa superficie:

```text
keygen()                              -> (publicKey, secretKey)
sign(secretKey, message)              -> signature
verify(publicKey, message, signature) -> bool

kem.keygen()                          -> (publicKey, secretKey)
kem.encapsulate(publicKey)            -> (cipherText, sharedSecret)
kem.decapsulate(secretKey, cipherText)-> sharedSecret

shake256(data, outLen=32)             -> digest
```

### Avvio rapido (JavaScript / TypeScript)

```js
import { mldsa, mlkem, shake256, pubkeyHash } from '@qorechain/pqc';

// ML-DSA-87 signatures
const { publicKey, secretKey } = mldsa.keygen();
const sig = mldsa.sign(secretKey, message);
mldsa.verify(publicKey, message, sig); // true

// ML-KEM-1024 key encapsulation
const { publicKey: ek, secretKey: dk } = mlkem.keygen();
const { cipherText, sharedSecret } = mlkem.encapsulate(ek);
mlkem.decapsulate(dk, cipherText); // === sharedSecret

// SHAKE-256 + blockchain helpers
shake256(data, 32);        // 32-byte digest
pubkeyHash(publicKey, 20); // pay-to-pubkey-hash
```

Sono disponibili export specifici per livello quando il predefinito non è quello che ti serve: `mldsa44/65/87` e `mlkem512/768/1024` (`mldsa` / `mlkem` sono i predefiniti L5).

I binding **Rust, Go, C, Python e Java** rispecchiano esattamente questa API. Ad esempio:

```rust
// Rust
use qorechain_pqc::mldsa::default as mldsa;
let (pk, sk) = mldsa::keygen()?;
let sig = mldsa::sign(&sk, msg)?;
assert!(mldsa::verify(&pk, msg, &sig));
```

```go
// Go
pk, sk, _ := pqc.MLDSA.Keygen()
sig, _ := pqc.MLDSA.Sign(sk, msg)
pqc.MLDSA.Verify(pk, msg, sig) // true
```

## Helper blockchain

Oltre alle primitive di base, la libreria espone due helper di cui gli integratori hanno bisogno per interagire con gli account e le transazioni QoreChain.

### `pubkeyHash(pk, len=20)`

Un helper di registrazione **pay-to-pubkey-hash**. Produce un hash SHAKE-256 corto (20–32 byte) di una chiave pubblica. Il pattern: memorizza solo il `pubkeyHash` nello stato dell'account e richiedi la chiave pubblica completa nella transazione. Lo stato dell'account resta minuscolo indipendentemente dalla chiave da 1–2.5 KB.

### `hybridSignBytes(version, chainId, bodyWithoutPqcExt, authInfo)`

Il framing dei sign-bytes con **estensione ibrida** di QoreChain, compatibile con i wallet. Produce esattamente i byte che devono essere firmati con ML-DSA-87 (Dilithium-5) per formare la metà PQC di una transazione ibrida. Esistono due forme e una rete ne verifica esattamente una a ogni altezza: **v1** = `BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` e **v2** = `"qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` (`B0` è il body della transazione senza l'estensione PQC, `A` l'auth info). Entrambe le reti pubbliche sono su **v2**. La libreria è pura, quindi è il chiamante a scegliere la forma: chiedi al nodo `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` per **entrambi** i nomi `v3.2.0` (il nome dell'upgrade della mainnet) e `v3.1.98` (il nome precedente della testnet) e usa v2 se una delle due altezze è superiore a 0; `signBytesVersionForApplied` e `signBytesVersionFor(chainId, height)` implementano la regola (usa `@qorechain/pqc` 0.2.1 o successiva; la forma a 2 argomenti delle versioni 0.1.x genera un errore).

Questo è il componente che wallet e integratori usano per produrre la **firma ibrida obbligatoria** sul percorso di transazione cosmos. A partire dalla versione corrente della chain, le firme ibride sono **obbligatorie per impostazione predefinita** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): ogni transazione sul percorso cosmos deve includere una firma Dilithium-5 accanto alla firma classica secp256k1. Consulta [Sicurezza Post-Quantistica](/architecture/post-quantum-security) per il modello di enforcement.

La firma classica secp256k1 viene calcolata sui sign bytes standard (che **escludono** l'estensione PQC), mentre la firma ML-DSA-87 viene calcolata e allegata come estensione `PQCHybridSignature`. Poiché i sign bytes classici escludono l'estensione, la firma classica resta valida indipendentemente dal fatto che un verificatore comprenda o meno la parte PQC.

Ci sono tre modi per produrre questa firma ibrida:

* **La CLI** — `qorechaind tx pqc cosign` allega la cofirma Dilithium-5 a una transazione e la trasmette (dopo `qorechaind tx pqc gen-key` e la registrazione della chiave). Fa parte solo del binario di release. Consulta [Comandi di Transazione](/cli-reference/transaction-commands).
* **L'SDK QoreChain** — `buildHybridTx` / `signAndBroadcastHybrid` (passa `rest` in modo che la forma dei sign-bytes venga risolta) fanno l'equivalente in TypeScript, Python, Go, Rust e Java; in TypeScript, `client.connectTx(signer, { pqcKeypair })` (SDK 0.9.0) firma ogni transazione in modo ibrido. Registra prima la tua chiave (vedi sopra). Consulta [Account SDK e firma PQC](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` direttamente** — usa `hybridSignBytes` per costruire il framing dei sign bytes e `mldsa.sign` per produrre la firma Dilithium-5, quando costruisci strumenti al di fuori dell'SDK in uno dei sei linguaggi supportati.

## Ottimizzare l'ingombro on-chain

Le chiavi e le firme ML-DSA sono grandi rispetto agli standard classici. Poiché i byte di uno standard sono fissi, il modo per mantenere piccolo l'ingombro on-chain è usare queste tre leve — nessuna delle quali altera lo standard:

1. **Scegli il livello di sicurezza in modo deliberato.** Le firme ML-DSA-65 (L3) sono più piccole di circa il 28% rispetto a ML-DSA-87 (L5) e restano molto robuste; i ciphertext ML-KEM-768 sono più piccoli di quelli 1024. Scegli caso per caso.
2. **Pay-to-pubkey-hash.** Memorizza solo `pubkeyHash(pk)` (20–32 byte di SHAKE-256) nello stato dell'account e richiedi la chiave pubblica completa nella transazione. Lo stato dell'account resta minuscolo indipendentemente dalla dimensione della chiave.
3. **Verifica e scarta le firme.** Una firma deve vivere nella transazione (dati del blocco) ma non dovrebbe mai essere scritta nell'albero di stato persistente.

> **Perché niente Falcon?** FN-DSA (Falcon) offrirebbe firme più piccole, ma è intenzionalmente **escluso**: FN-DSA è FIPS-206 in *bozza* (non definitivo), e una libreria basata esclusivamente sugli standard distribuisce solo standard finalizzati. Potrà essere riconsiderato una volta finalizzato FIPS-206.

## Correlati

* [Sicurezza Post-Quantistica](/architecture/post-quantum-security) — come la chain usa queste primitive e impone le firme ibride.
* [Comandi di Transazione](/cli-reference/transaction-commands) — il flusso CLI `tx pqc gen-key` / `tx pqc cosign`.
* [Account SDK e firma PQC](/sdk/concepts/accounts-pqc) — chiavi e firma ibrida dall'SDK QoreChain.
* [Configurazione del Wallet](/getting-started/wallet-setup) — crea e gestisci account con supporto PQC.
