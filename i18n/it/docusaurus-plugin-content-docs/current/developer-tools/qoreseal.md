---
slug: /developer-tools/qoreseal
title: QoreSeal
sidebar_label: QoreSeal
sidebar_position: 30
---

# QoreSeal (`qoreseal`)

QoreSeal è una libreria open source che cifra i dati verso gli account QoreChain con ML-KEM-1024 (FIPS 203). Un account pubblica on-chain la propria chiave pubblica ML-KEM-1024; chiunque può quindi cifrare un payload che quell'account, e ogni altro destinatario aggiunto dal mittente, può leggere. È pensata per gli sviluppatori di dApp che hanno bisogno di payload riservati (memo, fatture, documenti, offerte), per i revisori che hanno bisogno di un accesso in sola lettura e per chi gestisce gruppi privati e sidechain. Compone primitive standard e non ne implementa nessuna di proprie. Versione **0.1.0**, Apache-2.0, mantenuta dalla QoreChain Association.

Stato al 30 ottobre 2026: la cifratura in sé funziona offline ovunque, senza rete e senza account. Cifrare verso un indirizzo letto dalla chain richiede il registro delle chiavi KEM, che è **live sulla testnet** (`qorechain-diana`) e, da quando la mainnet (`qorechain-vladi`) ha applicato la v3.2.5 il 29 ottobre 2026, **la sua route di lettura risponde anche sulla mainnet** (nessun account vi ha ancora pubblicato una chiave che questa pagina abbia potuto trovare). Il pacchetto è pubblicato per Rust, Go, Python, Swift, Kotlin/JVM e Android. Il pacchetto TypeScript `@qorechain/qoreseal` è **in arrivo** e non è ancora su npm. La costruzione è una bozza in attesa di una revisione esterna prima della 1.0.

QoreSeal protegge il contenuto di un payload, nient'altro. Indirizzi, tempi delle transazioni, importi dei trasferimenti, dimensioni delle envelope e numero di destinatari restano pubblici on-chain. Non è un modo per rendere private le transazioni.

## Innovazioni {#innovations}

- **Una envelope, da 1 a 1.024 destinatari.** Il payload è cifrato una sola volta con una chiave dati AES-256-GCM casuale; la chiave dati è incapsulata separatamente per ogni destinatario, quindi aggiungere un lettore costa circa 1,6 KB, non un'altra copia del payload.
- **Ibrida per default, mai declassata in silenzio.** In modalità `hybrid` ogni voce di destinatario combina un'incapsulazione ML-KEM-1024 con un accordo X25519 tramite un combinatore SHA3-256, così i dati restano protetti finché regge almeno uno dei due. La modalità `mlkem` (solo ML-KEM-1024) deve essere scelta esplicitamente; la libreria non vi ripiega mai da sola.
- **Vincolo di contesto.** Ogni envelope è legata a un chain id e a uno scopo (purpose) tramite la derivazione della chiave (HKDF-SHA-256 con info `"qorechain-kem-v1|" + chainId + "|" + purpose`) e ai dati associati opzionali. Un'envelope sigillata per uno scopo non si apre con un altro.
- **Chiavi pubblicate on-chain, verificate dalla chain.** Un account registra la propria chiave ML-KEM-1024 con `MsgRegisterKEMKey`, autenticata dalla firma ibrida della transazione. `validateMlkemPublicKey` applica gli stessi controlli che la chain applica alla registrazione.
- **Schede del destinatario.** Il registro contiene la chiave ML-KEM e nient'altro. La chiave X25519 per la modalità ibrida viaggia in una scheda che l'account firma con la firma di messaggi di [QoreSign](/qoresign/overview) e lega alla propria chiave ML-KEM on-chain. I mittenti verificano la scheda rispetto a entrambe le chiavi on-chain, quindi può arrivare da qualsiasi canale. Una scheda falsificata o obsoleta può al massimo ridurre un'envelope alla robustezza di ML-KEM-1024, perché la parte ML-KEM usa sempre la chiave on-chain.
- **Chiavi di epoca per i gruppi privati.** `EpochKeyManager` crea una nuova chiave di epoca a ogni cambio di appartenenza e la sigilla per i membri attuali. Un membro rimosso conserva le chiavi delle epoche a cui apparteneva e non può leggere quelle successive.
- **Batch cifrati con impegni (commitment).** Il codec dei batch produce un blob cifrato con un commitment del testo cifrato e un commitment salato del testo in chiaro, pronto per essere ancorato su QoreChain con l'[RDK](/rollups/overview).
- **Gli stessi byte in ogni linguaggio.** TypeScript e Go sono implementazioni native; Rust è il nucleo sotto Swift, Kotlin e Python. I vettori di test condivisi sono verificati byte per byte in ogni linguaggio, e gli errori portano codici stabili (ad esempio `NOT_A_RECIPIENT`, `DECRYPTION_FAILED`, `CARD_INVALID`, `RECIPIENT_NEEDS_X25519`, `UNKNOWN_EPOCH`, `MALFORMED_ENVELOPE`).

## Casi d'uso {#use-cases}

1. **Una dApp cifra memo o messaggi tra utenti.** Una dApp di chat o pagamenti sigilla ogni nota per l'indirizzo del destinatario con `sealToAddresses` e conserva il testo `qoreseal:` in un memo, in un contratto o nel proprio database. Solo la chiave del destinatario la apre.
2. **Fatture e documenti con una chiave di revisione (sola lettura).** Un'azienda sigilla una fattura per l'acquirente, il venditore e una chiave del revisore in un'unica envelope, con il numero di fattura come dati associati. La chiave del revisore è una normale coppia di chiavi QoreSeal tenuta nella configurazione; una chiave per trimestre (`deriveSealKeys` con un nuovo indice) permette all'azienda di consegnare al revisore soltanto i periodi in esame.
3. **Offerte sigillate e commit-reveal.** Un'asta sigilla le offerte per la chiave dell'asta con `purpose: "bid:<auction id>"` e l'indirizzo dell'offerente come dati associati, conserva le envelope e le apre dopo la scadenza.
4. **Sidechain private o di consorzio.** L'operatore di un rollup privato usa `EpochKeyManager` per condividere una chiave di epoca con i membri, cifra ogni batch con `PrivateBatchCodec` e ancora il blob cifrato e i suoi commitment su QoreChain con l'RDK.
5. **Wallet che offrono "ricevi dati cifrati".** Un wallet deriva le chiavi QoreSeal dalla mnemonica dell'account (indice 0), pubblica la chiave ML-KEM con un `MsgRegisterKEMKey` firmato in modo ibrido e mostra come testo semplice la scheda del destinatario da firmare.
6. **Destinatari di recupero o di deposito fiduciario (escrow).** Un team di custodia o compliance aggiunge una chiave di recupero offline a ogni envelope, così i dati sopravvivono alla perdita della chiave di un utente.
7. **Backend in Python o Go.** Un servizio sigilla report o esportazioni per un elenco di account, in modo byte-compatibile con ogni altro linguaggio.

## Come funziona {#how-it-works}

Primitive (QoreSeal non ne implementa nessuna): ML-KEM-1024 (FIPS 203; chiave di incapsulazione 1.568 byte, chiave di decapsulazione 3.168 byte, testo cifrato 1.568 byte), X25519 (RFC 7748), un combinatore SHA3-256, HKDF-SHA-256 e AES-256-GCM (nonce a 96 bit, tag a 128 bit).

**Sigillare**, in breve:

1. Si estraggono un salt casuale di 16 byte e una chiave dati casuale di 32 byte.
2. Per ogni destinatario, un'incapsulazione ML-KEM-1024 verso la sua chiave; in modalità ibrida anche un accordo X25519 effimero con la chiave X25519 del destinatario, e i due segreti vengono combinati con SHA3-256. Una chiave di cifratura della chiave è derivata con HKDF-SHA-256 (salt, info `"qorechain-kem-v1|" + chainId + "|" + purpose`) e incapsula la chiave dati con AES-256-GCM.
3. Il payload è cifrato una sola volta con la chiave dati, autenticando l'intera intestazione e gli eventuali dati associati.

**Struttura dell'envelope:** magic `QSEL`, versione 1, modalità, byte dell'algoritmo, flag, salt, numero di destinatari, una voce per destinatario (hint, testo cifrato ML-KEM, chiave effimera X25519 in modalità ibrida, chiave dati incapsulata), nonce, testo cifrato. Dimensione: `56 + 1.664 x destinatari + testo in chiaro` byte in modalità ibrida e `56 + 1.632 x destinatari + testo in chiaro` in modalità `mlkem`. Dalla specifica: 1 destinatario e 1 KB di testo in chiaro sono 2.744 byte (ibrida); 10 destinatari e 1 KB sono 17.720 byte.

Chain id e purpose non sono scritti nell'envelope: il destinatario deve passare gli stessi valori. Un chain id, uno scopo o dati associati sbagliati, o qualsiasi modifica ai byte, danno `DECRYPTION_FAILED`.

**Hint.** Gli hint salati permettono al destinatario di trovare rapidamente la propria voce. Con `anonymous: true` gli hint sono azzerati e i destinatari provano ogni voce.

**Forma testuale.** `envelopeToText` e `envelopeFromText` convertono da e verso `"qoreseal:" + base64url`.

**Cosa c'è on-chain**

- Il registro delle chiavi KEM nel modulo `qorechain.pqc.v1`: `MsgRegisterKEMKey` con `sender`, `algorithm_id = 2` (ML-KEM-1024) e `public_key`, e `MsgRemoveKEMKey` con `sender`. Type URL: `/qorechain.pqc.v1.MsgRegisterKEMKey` e `/qorechain.pqc.v1.MsgRemoveKEMKey`.
- Query: `GET /qorechain/pqc/v1/kem/{address}` (accetta la forma `qor1` o `0x`), che restituisce `found` e, se trovata, `key` con `address`, `algorithm_id`, `algorithm_name`, `public_key` e `registered_height`.
- La registrazione è autenticata dalla firma ibrida della transazione. Il mittente deve avere già una chiave ML-DSA-87 registrata, e la transazione è firmata con `signHybrid` di QoreSign. Una chiave per account; registrare di nuovo la sostituisce.
- Rifiuti (codespace `pqc`): 250 registro non ancora abilitato su questa chain, 251 chiave pubblica KEM non valida, 252 nessuna chiave KEM pubblicata per questo account, 253 questa chiave è già pubblicata per questo account, 254 pubblicare una chiave KEM richiede una chiave di firma post-quantistica registrata. `describeKemRegistryError` li spiega.
- Le envelope vanno dove le mette l'applicazione (memo, contratti, file, API). La chain non vede mai una chiave segreta.

**Scheda del destinatario.** Circa 6,7 KB di JSON, per lo più la firma ML-DSA-87. L'account firma un testo fisso (`QoreSeal recipient card v1`, chain id, indirizzo, SHA3-256 della chiave ML-KEM, chiave X25519, momento di emissione) con la firma di messaggi di QoreSign. Registrare una nuova chiave ML-KEM ritira ogni scheda creata per la vecchia.

**Gruppi privati.** Un payload di chiave di epoca (`QSEK`, numero di epoca, chiave di 32 byte) è sigillato in un'envelope ordinaria per i membri attuali. Un blob di batch (`QSBT`, epoca, indice del batch, contesto come l'id del rollup, nonce, testo cifrato AES-256-GCM) è di `83 + lunghezza del contesto + lunghezza dei dati` byte. Commitment: `ciphertextCommitment = SHA3-256(blob)` e `plaintextCommitment = SHA3-256("qorechain-qoreseal-batch-v1" || commitSalt || data)`, salato perché gli estranei non possano indovinare contenuti a bassa entropia.

La specifica è `spec/qoreseal-v1.md` nel repository (stato: bozza, revisione in corso); i vettori condivisi sono `vectors/qoreseal-v1.json`.

## Come usarla {#how-to-use}

### Installazione {#install}

| Linguaggio | Installazione | Piattaforma minima |
|---|---|---|
| Rust | `cargo add qorechain-qoreseal` (nome della libreria `qoreseal`) | Rust stable |
| Go | `go get github.com/qorechain/qoreseal/go@v0.1.0` | Go 1.25 |
| Python | `pip install qorechain-qoreseal` (import `qoreseal`) | Python 3.9 o successivo; wheel per macOS 11+ (arm64, x86_64) e Linux manylinux2014 (x86_64, aarch64); nessuna wheel per Windows per ora |
| Swift | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`, prodotto `QoreSeal` | iOS 16, macOS 13 |
| Kotlin / JVM | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Java 17; compilatore Kotlin 2.3 o successivo (la compilazione fallisce con Kotlin 2.1) |
| Android | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | API 24; regole keep di R8 incluse; compilatore Kotlin 2.3 o successivo |
| TypeScript | **in arrivo**: `@qorechain/qoreseal` non è ancora su npm, quindi non c'è un comando di installazione | |

Il sorgente TypeScript, i suoi esempi e gli helper di rete sono nel repository e si eseguono da lì dopo `pnpm install && pnpm build`. Finché il pacchetto npm non è pubblicato, considera il repository come il modo di usare TypeScript, e aspettati il nome di pacchetto indicato sopra.

### Quickstart 1: sigillare e aprire offline (Python) {#quickstart-python}

Eseguito il 27 ottobre 2026 sulla wheel 0.1.0 pubblicata. Nessuna rete, nessun account. Due destinatari, dati associati e una verifica che un altro scopo non apra l'envelope.

```python
import qoreseal as qs

alice = qs.generate_seal_keys()
bob = qs.generate_seal_keys()

envelope = qs.seal_envelope(
    "qorechain-diana", "invoice",
    [qs.recipient_of(alice), qs.recipient_of(bob)],
    b"amount due: 120 QOR",
    aad=b"invoice-42",
)
text = qs.envelope_to_text(envelope)  # "qoreseal:..."

plaintext = qs.open_envelope("qorechain-diana", "invoice", envelope, bob, aad=b"invoice-42")
assert plaintext == b"amount due: 120 QOR"
print(len(envelope), text[:20], plaintext)

# A different purpose never opens the envelope.
try:
    qs.open_envelope("qorechain-diana", "chat", envelope, bob, aad=b"invoice-42")
except qs.QoreSealError.Failure as e:
    print("other purpose:", e.code)
```

Ha stampato `3403 qoreseal:UVNFTAEBAgE b'amount due: 120 QOR'` e poi `other purpose: DECRYPTION_FAILED`. La lunghezza è 56 + 2 x 1.664 + 19 = 3.403 byte.

### Quickstart 2: sigillare e aprire offline (Go) {#quickstart-go}

Eseguito sulla v0.1.0 dal proxy dei moduli Go.

```go
package main

import (
	"fmt"

	qoreseal "github.com/qorechain/qoreseal/go"
)

func main() {
	alice, _ := qoreseal.GenerateSealKeys()
	auditor, _ := qoreseal.GenerateSealKeys()

	envelope, err := qoreseal.Seal(qoreseal.SealArgs{
		ChainID:    "qorechain-diana",
		Purpose:    "invoice",
		Recipients: []qoreseal.SealRecipient{qoreseal.RecipientOf(alice), qoreseal.RecipientOf(auditor)},
		Plaintext:  []byte("120 QOR due on 2026-11-30"),
		AAD:        []byte("invoice-42"),
	})
	if err != nil {
		panic(err)
	}
	plaintext, err := qoreseal.Open(qoreseal.OpenArgs{
		ChainID: "qorechain-diana", Purpose: "invoice", Envelope: envelope, Keys: auditor, AAD: []byte("invoice-42"),
	})
	fmt.Println(len(envelope), string(plaintext), err)
}
```

Ha stampato `3409 120 QOR due on 2026-11-30 <nil>`.

Rust, Swift e Kotlin usano le stesse chiamate (`seal`, `open`, `generate_seal_keys` e così via, con la scrittura tipica del linguaggio). I loro esempi non sono stati eseguiti per questa pagina.

### Quickstart 3: un gruppo privato con epoche (Python, offline) {#quickstart-group}

Segue l'esempio del repository `examples/private-rollup`. Alice e bob partono all'epoca 1, carol entra (epoca 2), bob viene rimosso (epoca 3). Bob può leggere l'epoca 1 ma non l'epoca 3.

```python
import qoreseal as qs

chain_id, rollup_id = "qorechain-diana", "demo-private-rollup"
purpose = f"epoch-key:{rollup_id}"
alice, bob, carol = qs.generate_seal_keys(), qs.generate_seal_keys(), qs.generate_seal_keys()

mgr = qs.EpochKeyManager(chain_id, purpose, [
    qs.GroupMember(id="alice", recipient=qs.recipient_of(alice)),
    qs.GroupMember(id="bob", recipient=qs.recipient_of(bob)),
])
bob_keys = [qs.open_epoch_key(chain_id, purpose, mgr.distribution(), bob)]  # epoch 1

b1 = mgr.seal_batch(rollup_id, 1, b'{"txs":["alice pays bob 5"]}')
mgr.add_member("carol", qs.recipient_of(carol))   # epoch 2
mgr.remove_member("bob")                          # epoch 3
b3 = mgr.seal_batch(rollup_id, 3, b'{"txs":["alice pays carol 1"]}')

print(qs.open_batch(b1.blob, bob_keys).data)      # bob read epoch 1
try:
    qs.open_batch(b3.blob, bob_keys)              # bob was removed before epoch 3
except qs.QoreSealError.Failure as e:
    print("bob, epoch 3:", e.code)
print(b3.ciphertext_commitment.hex(), b3.plaintext_commitment.hex())
```

Ha stampato il batch dell'epoca 1 di bob, poi `bob, epoch 3: UNKNOWN_EPOCH`, poi i due commitment (casuali a ogni esecuzione).

Per ancorare un batch sigillato con l'[RDK](/rollups/overview), il blob cifrato è il blob nativo di disponibilità dei dati e il suo SHA-256 è il `data_hash` del batch (TypeScript, dalla guida del repository; non eseguito per questa pagina):

```ts
import { buildDaBlob, submitBatchMsg } from "@qorechain/rdk";

const codec = new PrivateBatchCodec("my-rollup", mgr);
const sealed = codec.seal(batchIndex, batchBytes);
const blob = buildDaBlob({ data: sealed.blob, maxBlobSize: params.maxDaBlobSize });
const msg = submitBatchMsg({ sequencer, rollupId: "my-rollup", batchIndex, stateRoot, txCount, dataHash: blob.dataHash });
```

Vedi [Disponibilità dei dati](/rollups/data-availability) per come vengono pubblicati i batch del rollup.

### Cifrare verso un indirizzo sulla testnet {#encrypt-to-address}

Ti serve un account `qorechain-diana` sotto il tuo controllo con un po' di QOR di testnet e una chiave ML-DSA-87 registrata (l'esempio QoreSign `register-and-send` ne registra una). Usa una mnemonica di testnet, mai una di mainnet, e mai la frase di test pubblica con dei fondi. Questo flusso è descritto dalla guida del repository e non è stato eseguito per questa pagina.

1. Deriva le chiavi dalla mnemonica dell'account: `deriveSealKeys({ mnemonic })` (indice 0). La mnemonica è anche il loro backup.
2. Pubblica la chiave ML-KEM-1024: `buildRegisterKemKeyMessage({ sender: address, mlkemPublicKey: sealKeys.mlkemPublicKey })`, mettila nel corpo di una transazione, firmala con `signHybrid` di QoreSign, simula con `simulateTx` e invia con `submitWithSignBytesFallback`. In caso di rifiuto, `describeKemRegistryError(res.codespace, res.code)` lo spiega.
3. Verificala: `GET https://api-testnet.qore.host/qorechain/pqc/v1/kem/<address>`. Risponde `{"found":false,"key":null}` per un account che non ha pubblicato una chiave.
4. Firma una scheda del destinatario: `signRecipientCard({ chainId: "qorechain-diana", address, keys: sealKeys, classicalKey, pqKey })`, e pubblicala dove i mittenti possano recuperarla.
5. Lato mittente: `sealToAddresses({ rest: "https://api-testnet.qore.host", chainId: "qorechain-diana", purpose: "note", recipients: [{ address, card }], plaintext })`. Senza una scheda, passa `mode: "mlkem"`.
6. Lato destinatario: `open({ chainId: "qorechain-diana", purpose: "note", envelope, keys: sealKeys })`.

Il flusso completo eseguibile è l'esempio del repository `examples/register-and-encrypt`. La mainnet ha applicato la v3.2.5 il 29 ottobre 2026; consulta il README dell'esempio per la release che rimuove il suo blocco sulla mainnet. Go offre lo stesso lato mittente con `network.NewClient(rest).SealToAddresses(ctx, network.SealToArgs{...})`. Rust, Swift, Kotlin e Python sono offline: leggi tu stesso `/qorechain/pqc/v1/kem/{address}` e `/qorechain/pqc/v1/account/{address}`, verifica la scheda (`verify_recipient_card`), poi sigilla.

### API principale {#api}

I nomi sono nella forma TypeScript. Go usa la scrittura di Go (`Seal`, `Open`, `NewEpochKeyManager`), Rust e Python usano snake_case. In Python, Swift e Kotlin, `seal` e `open` sono `seal_envelope` / `sealEnvelope` e `open_envelope` / `openEnvelope`.

| Nome | Cosa fa | Dove |
|---|---|---|
| `generateSealKeys` | coppia di chiavi casuale (ML-KEM-1024 + X25519) | tutti |
| `deriveSealKeys` | coppia di chiavi da una mnemonica BIP-39, con passphrase e indice opzionali | tutti |
| `sealKeysFromSeed`, `sealSeedFromMnemonic` | ripristina dal seed di 32 byte; seed da una mnemonica | tutti |
| `recipientOf` | destinatario pubblico da una coppia di chiavi | tutti |
| `validateMlkemPublicKey`, `validateX25519PublicKey` | controlli sugli input (la chain applica lo stesso controllo ML-KEM) | tutti |
| `seal` | cifra verso da 1 a 1.024 destinatari (`mode`, `aad`, `anonymous`) | tutti |
| `open` | decifra con una coppia di chiavi | tutti |
| `parseEnvelope`, `envelopeSize` | ispeziona un'envelope; ne calcola la dimensione | tutti |
| `envelopeToText`, `envelopeFromText` | forma testuale `qoreseal:` | tutti |
| `signRecipientCard`, `verifyRecipientCard` | creano e verificano la scheda del destinatario | tutti |
| `recipientCardText`, `recipientCardFields`, `assembleRecipientCard` | costruiscono una scheda quando si firma altrove, ad esempio in un'interfaccia di wallet | tutti |
| `buildRegisterKemKeyMessage`, `buildRemoveKemKeyMessage` | messaggi del registro, da firmare in modo ibrido con QoreSign | tutti |
| `describeKemRegistryError` | spiega i codici 250-254 del codespace `pqc` | tutti |
| `EpochKeyManager` | chiavi di epoca per un gruppo: `addMember`, `removeMember`, `rotate`, `distribution`, `exportKeys`, `keyFor`, `members`, `epoch` | tutti |
| `sealEpochKey`, `openEpochKey` | inviano o ricevono una chiave di epoca (ad esempio la cronologia per un nuovo arrivato) | tutti |
| `PrivateBatchCodec`, `sealBatch`, `openBatch`, `parseBatchHeader`, `batchSize` | batch cifrati con commitment | tutti |
| `fetchKemKey`, `fetchMlkemPublicKey` | leggono da REST la chiave ML-KEM di un account | TypeScript, pacchetto network di Go |
| `resolveRecipient` | chiavi on-chain più scheda, verificate, come destinatario | TypeScript, pacchetto network di Go |
| `sealToAddresses` | sigilla verso account tramite indirizzo | TypeScript, pacchetto network di Go |

Gli helper di rete sono `@qorechain/qoreseal/network` in TypeScript e `github.com/qorechain/qoreseal/go/network` in Go. Sono esportati anche i blocchi di costruzione di livello più basso (`mlkemEncapsulate`, `mlkemDecapsulate`, `x25519Agree`, `hybridSharedSecret`, `deriveKey`, `kdfInfo`, `recipientHint`). Le funzioni con nome legato ai test (`sealWithEntropy`, `testing_*`) esistono per riprodurre i vettori di test e non vanno mai usate con dati reali.

Gli errori Python sollevano `QoreSealError.Failure` con un `code` stabile; gli errori Go si confrontano con `qoreseal.IsCode`.

## Come accedere {#how-to-access}

| | Mainnet `qorechain-vladi` | Testnet `qorechain-diana` |
|---|---|---|
| Registro delle chiavi KEM | live dalla v3.2.5 (applicata il 29 ottobre 2026, altezza 3.906.833); route di lettura verificata, vedi sotto | live |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` (chain ID 9801) | `https://evm-testnet.qore.host` (chain ID 9800) |

Il 30 ottobre 2026 la query del registro ha risposto `{"found":false,"key":null}` per un account senza chiave su entrambe le reti (il 27 ottobre la mainnet rispondeva ancora "Not Implemented"). Una ricerca nelle transazioni della mainnet il 30 ottobre non ha trovato ancora alcun `MsgRegisterKEMKey`, quindi la pubblicazione di una chiave sulla mainnet non è stata ancora provata end to end da questa pagina.

- Sigillare e aprire offline, incluse le chiavi del revisore passate direttamente, i gruppi privati e i batch, non richiede rete né account.
- Cifrare verso un indirizzo richiede che il destinatario abbia pubblicato una chiave ML-KEM-1024 nel registro e, per la modalità ibrida, una scheda del destinatario.
- Pubblicare una chiave richiede un account con QOR di testnet (su mainnet, QOR), una chiave ML-DSA-87 registrata e QoreSign per firmare la transazione in modo ibrido. La soglia minima della commissione è 0,1 uqor per gas. Ottieni QOR di testnet dal [Faucet](/dashboard/faucet).
- La registrazione sulla mainnet è accettata solo da una chain che dispone del registro; se compare un rifiuto con codice 250, il registro non è abilitato su quella chain.

## Dove è pubblicata {#where-published}

Verificato il 27 ottobre 2026 su ciascun registry.

| Registry | Pacchetto | Versione | Link |
|---|---|---|---|
| crates.io | `qorechain-qoreseal` | 0.1.0 | [crates.io/crates/qorechain-qoreseal](https://crates.io/crates/qorechain-qoreseal) |
| Proxy dei moduli Go | `github.com/qorechain/qoreseal/go` | v0.1.0 (tag `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoreseal/go) |
| PyPI | `qorechain-qoreseal` | 0.1.0 (wheel per macOS arm64 e x86_64, Linux x86_64 e aarch64, più sorgente) | [pypi.org/project/qorechain-qoreseal](https://pypi.org/project/qorechain-qoreseal/) |
| Swift Package Manager | `QoreSeal` da `github.com/qorechain/qoreseal` | 0.1.0 (binario `QoreSealFFI.xcframework.zip` nella release GitHub) | [release v0.1.0](https://github.com/qorechain/qoreseal/releases/tag/v0.1.0) |
| Maven Central | `io.github.qorechain:qoreseal` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) |
| Maven Central | `io.github.qorechain:qoreseal-android` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) |
| npm | `@qorechain/qoreseal` | non ancora pubblicato (in arrivo) | |

I progetti che usano uno qualsiasi dei due artefatti Maven richiedono il compilatore Kotlin 2.3 o successivo. L'artefatto Kotlin/JVM include librerie native per macOS (arm64, x86_64), Linux (x86_64, arm64) e Windows (x86_64); l'artefatto Android copre arm64-v8a, armeabi-v7a e x86_64.

Sorgente: [github.com/qorechain/qoreseal](https://github.com/qorechain/qoreseal) (release v0.1.0). Licenza Apache-2.0.

## Limiti e problemi noti {#limits}

- **Ciò che è protetto è il contenuto del payload.** Gli indirizzi di mittente e destinatario, gli importi dei trasferimenti bancari, i tempi delle transazioni, le dimensioni delle envelope e il numero di destinatari restano pubblici on-chain.
- **Non sono transazioni private.** QoreSeal non nasconde chi transige con chi, né quanto.
- **Nessuna prova a conoscenza zero.** Nulla dimostra alcunché sui dati cifrati; in una sidechain privata, i verificatori esterni al gruppo non possono controllare cosa accade dentro un batch.
- **Le envelope non sono firmate.** Chiunque può cifrare verso un indirizzo, e qualsiasi destinatario di un'envelope con più destinatari potrebbe costruire per gli altri un'envelope diversa. Firma il contenuto o l'envelope (`signMessage` di QoreSign) quando il mittente deve essere autenticato.
- **Ogni destinatario legge l'intero payload.** Non c'è oscuramento per singolo destinatario; sigilla envelope separate per lettori diversi.
- **Gli hint non sono anonimato.** Chiunque conosca la chiave pubblica di un candidato (è on-chain) può verificare se quella chiave è un destinatario. `anonymous: true` azzera gli hint; i destinatari provano allora ogni voce.
- **Perdere la chiave significa perdere i dati.** Non esiste recupero on-chain. Perdere il seed o la mnemonica fa perdere tutto ciò che è stato sigillato per quella chiave.
- **Rimuovere o ruotare una chiave non cancella né ricifra nulla.** I dati sigillati per una vecchia chiave restano leggibili da chi la detiene; conserva i vecchi seed o indici.
- **I membri rimossi dal gruppo** conservano le chiavi delle epoche a cui appartenevano. I nuovi membri leggono dall'epoca in cui entrano, a meno che le chiavi più vecchie non siano sigillate per loro.
- **Chain id e purpose non sono nell'envelope;** il destinatario deve conoscerli.
- **Registro su mainnet:** la route di lettura è live dalla v3.2.5; al momento della verifica nessuna chiave era stata pubblicata sulla mainnet, e il namespace JSON-RPC EVM `qor_` non è esposto su `evm.qore.host` (usa la route REST).
- **Pre-1.0, costruzione in attesa di revisione esterna.** Le versioni minori possono cambiare l'API. Leggi la specifica prima di farvi affidamento.
- **Ancora nessun pacchetto npm** e nessuna wheel Python per Windows.

## Note di sicurezza {#security}

- Le chiavi segrete non lasciano mai il dispositivo o il server su cui gira QoreSeal. La chain conserva solo la chiave pubblica ML-KEM-1024, e la scheda porta la chiave pubblica X25519.
- Fai il backup della mnemonica dell'account, di una mnemonica dedicata o del seed di 32 byte (`keys.seed`), cifrato a riposo. Non esportare mai da sola la chiave segreta ML-KEM; esporta il seed o la mnemonica.
- Rotazione: passa all'indice successivo, registra la nuova chiave ML-KEM, firma una nuova scheda. Le vecchie schede smettono di verificarsi automaticamente.
- Aggiungi un destinatario di recupero (una chiave offline) ai dati che devono sopravvivere alla perdita della chiave di un utente. Trattalo come una chiave del revisore, dato che legge tutto ciò a cui viene aggiunto.
- Per i gruppi, `exportKeys()` contiene ogni chiave di epoca. Sigilla quell'esportazione per la chiave dell'operatore e per una chiave di recupero offline, e tienila fuori dalla macchina del sequencer. Ruota le chiavi di epoca con una cadenza prestabilita.
- La modalità `mlkem` deve essere scelta esplicitamente; l'ibrida non si degrada mai in silenzio.
- Le primitive provengono dai binding [`qorechain-pqc`](/developer-tools/pqc-library) e da librerie consolidate (noble per TypeScript, crate RustCrypto, la libreria standard di Go); le firme degli account provengono da [QoreSign](/qoresign/overview).
- Segnala le vulnerabilità in privato a security@qore.network. Che i metadati on-chain siano pubblici è voluto ed è un tema di documentazione, non una vulnerabilità.

## Pagine correlate {#related}

- [QoreSign](/qoresign/overview): firma ibrida per la transazione di registrazione, e firma di messaggi alla base delle schede del destinatario e delle envelope firmate.
- [Panoramica RDK](/rollups/overview) e [Disponibilità dei dati](/rollups/data-availability): ancoraggio dei batch cifrati di una sidechain privata.
- [Libreria PQC](/developer-tools/pqc-library): i binding ML-KEM-1024 sotto QoreSeal.
- [Sicurezza post-quantistica](/architecture/post-quantum-security) e [Firma post-quantistica](/developer-guide/post-quantum-signing): come funzionano account e chiavi on-chain.
- [Panoramica dei pacchetti per sviluppatori](/developer-tools/overview).
