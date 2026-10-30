---
slug: /developer-tools/qoreseal
title: QoreSeal
sidebar_label: QoreSeal
sidebar_position: 30
---

# QoreSeal (`qoreseal`)

QoreSeal este o bibliotecă open-source care criptează date către conturi QoreChain cu ML-KEM-1024 (FIPS 203). Un cont își publică pe lanț cheia publică ML-KEM-1024; oricine poate apoi cripta o sarcină utilă pe care acel cont, și orice alt destinatar adăugat de expeditor, o poate citi. Este pentru dezvoltatorii de dApp-uri care au nevoie de sarcini utile confidențiale (memo-uri, facturi, documente, oferte), pentru auditori care au nevoie de acces de vizualizare și pentru operatorii de grupuri private și sidechain-uri. Compune primitive standard și nu implementează niciuna proprie. Versiunea **0.1.0**, Apache-2.0, întreținută de QoreChain Association.

Situația la 30 octombrie 2026: criptarea în sine funcționează offline oriunde, fără rețea și fără cont. Criptarea către o adresă citită de pe lanț are nevoie de registrul de chei KEM, care este **live pe testnet** (`qorechain-diana`) și, de când mainnet-ul (`qorechain-vladi`) a aplicat v3.2.5 pe 29 octombrie 2026, **ruta sa de citire răspunde și pe mainnet** (niciun cont nu a publicat acolo o cheie pe care această pagină să o poată găsi). Pachetul este publicat pentru Rust, Go, Python, Swift, Kotlin/JVM și Android. Pachetul TypeScript `@qorechain/qoreseal` **urmează** și nu este încă pe npm. Construcția este o schiță, în așteptarea unei revizuiri externe înainte de 1.0.

QoreSeal protejează conținutul unei sarcini utile, nimic altceva. Adresele, momentul tranzacțiilor, sumele transferurilor, dimensiunile plicurilor și numărul de destinatari rămân publice pe lanț. Nu este o metodă de a face tranzacțiile private.

## Inovații {#innovations}

- **Un plic, de la 1 la 1.024 de destinatari.** Sarcina utilă este criptată o singură dată cu o cheie de date AES-256-GCM aleatoare; cheia de date este înfășurată separat pentru fiecare destinatar, deci adăugarea unui cititor costă aproximativ 1,6 KB, nu o altă copie a sarcinii utile.
- **Hibrid implicit, niciodată retrogradat pe tăcute.** În modul `hybrid`, fiecare intrare de destinatar combină o încapsulare ML-KEM-1024 cu un acord X25519 printr-un combinator SHA3-256, astfel încât datele rămân protejate cât timp ține oricare dintre ele. Modul `mlkem` (doar ML-KEM-1024) trebuie ales explicit; biblioteca nu revine la el niciodată de la sine.
- **Legare de context.** Fiecare plic este legat de un chain id și de un scop prin derivarea cheii (HKDF-SHA-256 cu info `"qorechain-kem-v1|" + chainId + "|" + purpose`) și de datele asociate opționale. Un plic sigilat pentru un scop nu se deschide sub altul.
- **Chei publicate pe lanț, verificate de lanț.** Un cont își înregistrează cheia ML-KEM-1024 cu `MsgRegisterKEMKey`, autentificat de semnătura hibridă a tranzacției. `validateMlkemPublicKey` aplică aceleași verificări pe care le aplică lanțul la înregistrare.
- **Cărți de destinatar.** Registrul conține cheia ML-KEM și nimic altceva. Cheia X25519 pentru modul hibrid călătorește într-o carte pe care contul o semnează cu semnarea de mesaje [QoreSign](/qoresign/overview) și o leagă de cheia sa ML-KEM de pe lanț. Expeditorii verifică cartea față de ambele chei de pe lanț, deci poate veni pe orice canal. O carte falsificată sau veche poate cel mult să reducă un plic la puterea ML-KEM-1024, deoarece partea ML-KEM folosește întotdeauna cheia de pe lanț.
- **Chei de epocă pentru grupuri private.** `EpochKeyManager` creează o nouă cheie de epocă la fiecare schimbare de membri și o sigilează pentru membrii curenți. Un membru eliminat păstrează cheile epocilor din care a făcut parte și nu le poate citi pe cele următoare.
- **Loturi criptate cu angajamente.** Codecul de loturi produce un blob criptat cu un angajament asupra textului cifrat și un angajament sărat asupra textului în clar, gata de ancorat pe QoreChain cu [RDK](/rollups/overview).
- **Aceiași octeți în fiecare limbaj.** TypeScript și Go sunt implementări native; Rust este nucleul de sub Swift, Kotlin și Python. Vectorii de test comuni sunt verificați octet cu octet în fiecare limbaj, iar erorile poartă coduri stabile (de exemplu `NOT_A_RECIPIENT`, `DECRYPTION_FAILED`, `CARD_INVALID`, `RECIPIENT_NEEDS_X25519`, `UNKNOWN_EPOCH`, `MALFORMED_ENVELOPE`).

## Cazuri de utilizare {#use-cases}

1. **Un dApp criptează memo-uri sau mesaje între utilizatori.** Un dApp de chat sau de plăți sigilează fiecare notă către adresa destinatarului cu `sealToAddresses` și stochează textul `qoreseal:` într-un memo, un contract sau propria bază de date. Doar cheia destinatarului îl deschide.
2. **Facturi și documente cu o cheie de auditor (vizualizare).** O firmă sigilează o factură către cumpărător, vânzător și o cheie de auditor într-un singur plic, cu numărul facturii ca date asociate. Cheia de auditor este o pereche de chei QoreSeal obișnuită, ținută în configurație; o cheie pe trimestru (`deriveSealKeys` cu un index nou) îi permite firmei să dea auditorului doar perioadele aflate în verificare.
3. **Oferte sigilate și commit-reveal.** O licitație sigilează ofertele către cheia licitației cu `purpose: "bid:<auction id>"` și adresa ofertantului ca date asociate, stochează plicurile și le deschide după termen.
4. **Consorții sau sidechain-uri private.** Operatorul unui rollup privat folosește `EpochKeyManager` pentru a partaja o cheie de epocă cu membrii, criptează fiecare lot cu `PrivateBatchCodec` și ancorează blobul criptat și angajamentele sale pe QoreChain cu RDK.
5. **Portofele care oferă „primire de date criptate”.** Un portofel derivă cheile QoreSeal din mnemonica contului (index 0), publică cheia ML-KEM cu un `MsgRegisterKEMKey` semnat hibrid și afișează ca text simplu cartea de destinatar pentru semnare.
6. **Destinatari de recuperare sau escrow.** O echipă de custodie sau conformitate adaugă o cheie de recuperare offline la fiecare plic, astfel încât datele supraviețuiesc pierderii cheii unui utilizator.
7. **Backend-uri în Python sau Go.** Un serviciu sigilează rapoarte sau exporturi către o listă de conturi, compatibil octet cu octet cu fiecare alt limbaj.

## Cum funcționează {#how-it-works}

Primitive (QoreSeal nu implementează niciuna): ML-KEM-1024 (FIPS 203; cheie de încapsulare 1.568 octeți, cheie de decapsulare 3.168 octeți, text cifrat 1.568 octeți), X25519 (RFC 7748), un combinator SHA3-256, HKDF-SHA-256 și AES-256-GCM (nonce de 96 de biți, tag de 128 de biți).

**Sigilarea**, pe scurt:

1. Se extrag un salt aleator de 16 octeți și o cheie de date aleatoare de 32 de octeți.
2. Pentru fiecare destinatar, o încapsulare ML-KEM-1024 către cheia destinatarului; în modul hibrid și un acord X25519 efemer cu cheia X25519 a destinatarului, iar cele două secrete sunt combinate cu SHA3-256. O cheie de criptare a cheii este derivată cu HKDF-SHA-256 (salt, info `"qorechain-kem-v1|" + chainId + "|" + purpose`) și înfășoară cheia de date cu AES-256-GCM.
3. Sarcina utilă este criptată o singură dată cu cheia de date, autentificând întregul antet și datele asociate opționale.

**Structura plicului:** magic `QSEL`, versiunea 1, mod, octeți de algoritm, flag-uri, salt, număr de destinatari, o intrare pe destinatar (hint, text cifrat ML-KEM, cheie efemeră X25519 în modul hibrid, cheie de date înfășurată), nonce, text cifrat. Dimensiune: `56 + 1,664 x recipients + plaintext` octeți în modul hibrid și `56 + 1,632 x recipients + plaintext` în modul `mlkem`. Din specificație: 1 destinatar și 1 KB de text în clar înseamnă 2.744 octeți (hibrid); 10 destinatari și 1 KB înseamnă 17.720 octeți.

Chain id-ul și scopul nu sunt scrise în plic: destinatarul trebuie să transmită aceleași valori. Un chain id, un scop sau niște date asociate greșite, ori orice modificare a octeților, dau `DECRYPTION_FAILED`.

**Hint-uri.** Hint-urile sărate permit unui destinatar să-și găsească rapid propria intrare. Cu `anonymous: true`, hint-urile sunt zerorizate, iar destinatarii încearcă fiecare intrare.

**Forma text.** `envelopeToText` și `envelopeFromText` convertesc în și din `"qoreseal:" + base64url`.

**Ce este pe lanț**

- Registrul de chei KEM din modulul `qorechain.pqc.v1`: `MsgRegisterKEMKey` cu `sender`, `algorithm_id = 2` (ML-KEM-1024) și `public_key`, și `MsgRemoveKEMKey` cu `sender`. Type URL-uri: `/qorechain.pqc.v1.MsgRegisterKEMKey` și `/qorechain.pqc.v1.MsgRemoveKEMKey`.
- Interogare: `GET /qorechain/pqc/v1/kem/{address}` (acceptă forma `qor1` sau `0x`), care returnează `found` și, când este găsită, `key` cu `address`, `algorithm_id`, `algorithm_name`, `public_key` și `registered_height`.
- Înregistrarea este autentificată de semnătura hibridă a tranzacției. Expeditorul trebuie să aibă deja o cheie ML-DSA-87 înregistrată, iar tranzacția este semnată cu QoreSign `signHybrid`. O cheie pe cont; o nouă înregistrare o înlocuiește.
- Refuzuri (codespace `pqc`): 250 registrul nu este încă activat pe acest lanț, 251 cheie publică KEM invalidă, 252 nicio cheie KEM publicată pentru acest cont, 253 această cheie este deja publicată pentru acest cont, 254 publicarea unei chei KEM are nevoie de o cheie de semnătură post-cuantică înregistrată. `describeKemRegistryError` le explică.
- Plicurile în sine merg oriunde le pune aplicația (memo-uri, contracte, fișiere, API-uri). Lanțul nu vede niciodată o cheie secretă.

**Cartea de destinatar.** Aproximativ 6,7 KB de JSON, în mare parte semnătura ML-DSA-87. Contul semnează un text fix (`QoreSeal recipient card v1`, chain id, adresă, SHA3-256 al cheii ML-KEM, cheia X25519, momentul emiterii) cu semnarea de mesaje QoreSign. Înregistrarea unei noi chei ML-KEM retrage fiecare carte făcută pentru cea veche.

**Grupuri private.** O sarcină utilă de cheie de epocă (`QSEK`, numărul epocii, cheie de 32 de octeți) este sigilată într-un plic obișnuit către membrii curenți. Un blob de lot (`QSBT`, epocă, indexul lotului, context precum id-ul rollup-ului, nonce, text cifrat AES-256-GCM) are `83 + context length + data length` octeți. Angajamente: `ciphertextCommitment = SHA3-256(blob)` și `plaintextCommitment = SHA3-256("qorechain-qoreseal-batch-v1" || commitSalt || data)`, sărat astfel încât cei din afară să nu poată ghici conținuturi cu entropie scăzută.

Specificația este `spec/qoreseal-v1.md` din repository (stare: schiță, revizuire în curs); vectorii comuni sunt `vectors/qoreseal-v1.json`.

## Cum se folosește {#how-to-use}

### Instalare {#install}

| Limbaj | Instalare | Platformă minimă |
|---|---|---|
| Rust | `cargo add qorechain-qoreseal` (numele bibliotecii `qoreseal`) | Rust stable |
| Go | `go get github.com/qorechain/qoreseal/go@v0.1.0` | Go 1.25 |
| Python | `pip install qorechain-qoreseal` (import `qoreseal`) | Python 3.9 sau mai nou; wheel-uri pentru macOS 11+ (arm64, x86_64) și Linux manylinux2014 (x86_64, aarch64); încă fără wheel pentru Windows |
| Swift | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`, produs `QoreSeal` | iOS 16, macOS 13 |
| Kotlin / JVM | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Java 17; compilator Kotlin 2.3 sau mai nou (compilarea eșuează cu Kotlin 2.1) |
| Android | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | API 24; reguli R8 keep incluse; compilator Kotlin 2.3 sau mai nou |
| TypeScript | **urmează**: `@qorechain/qoreseal` nu este încă pe npm, deci nu există comandă de instalare | |

Sursa TypeScript, exemplele sale și ajutoarele de rețea sunt în repository și rulează de acolo după `pnpm install && pnpm build`. Până la publicarea pachetului npm, tratați repository-ul ca mod de a folosi TypeScript și așteptați-vă la numele de pachet de mai sus.

### Quickstart 1: sigilare și deschidere offline (Python) {#quickstart-python}

Rulat pe 27 octombrie 2026 față de wheel-ul 0.1.0 publicat. Fără rețea, fără cont. Doi destinatari, date asociate și o verificare că un alt scop nu deschide plicul.

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

A afișat `3403 qoreseal:UVNFTAEBAgE b'amount due: 120 QOR'` și apoi `other purpose: DECRYPTION_FAILED`. Lungimea este 56 + 2 x 1.664 + 19 = 3.403 octeți.

### Quickstart 2: sigilare și deschidere offline (Go) {#quickstart-go}

Rulat față de v0.1.0 de pe proxy-ul de module Go.

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

A afișat `3409 120 QOR due on 2026-11-30 <nil>`.

Rust, Swift și Kotlin folosesc aceleași apeluri (`seal`, `open`, `generate_seal_keys` și așa mai departe, cu scrierea specifică limbajului). Exemplele lor nu au fost rulate pentru această pagină.

### Quickstart 3: un grup privat cu epoci (Python, offline) {#quickstart-group}

Urmează exemplul din repository `examples/private-rollup`. Alice și bob pornesc la epoca 1, carol se alătură (epoca 2), bob este eliminat (epoca 3). Bob poate citi epoca 1, dar nu epoca 3.

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

A afișat lotul din epoca 1 a lui bob, apoi `bob, epoch 3: UNKNOWN_EPOCH`, apoi cele două angajamente (aleatoare la fiecare rulare).

Pentru a ancora un lot sigilat cu [RDK](/rollups/overview), blobul criptat este blobul nativ de disponibilitate a datelor, iar SHA-256 al său este `data_hash` al lotului (TypeScript, din ghidul din repository; nerulat pentru această pagină):

```ts
import { buildDaBlob, submitBatchMsg } from "@qorechain/rdk";

const codec = new PrivateBatchCodec("my-rollup", mgr);
const sealed = codec.seal(batchIndex, batchBytes);
const blob = buildDaBlob({ data: sealed.blob, maxBlobSize: params.maxDaBlobSize });
const msg = submitBatchMsg({ sequencer, rollupId: "my-rollup", batchIndex, stateRoot, txCount, dataHash: blob.dataHash });
```

Vedeți [Disponibilitatea datelor](/rollups/data-availability) pentru modul în care sunt postate loturile unui rollup.

### Criptare către o adresă pe testnet {#encrypt-to-address}

Aveți nevoie de un cont `qorechain-diana` pe care îl controlați, cu puțin QOR de testnet și o cheie ML-DSA-87 înregistrată (exemplul QoreSign `register-and-send` înregistrează una). Folosiți o mnemonică de testnet, niciodată una de mainnet, și niciodată fraza de test publică cu fonduri. Acest flux este descris după ghidul din repository și nu a fost rulat pentru această pagină.

1. Derivați cheile din mnemonica contului: `deriveSealKeys({ mnemonic })` (index 0). Mnemonica este și backup-ul lor.
2. Publicați cheia ML-KEM-1024: `buildRegisterKemKeyMessage({ sender: address, mlkemPublicKey: sealKeys.mlkemPublicKey })`, puneți-o într-un corp de tranzacție, semnați-o cu QoreSign `signHybrid`, simulați cu `simulateTx` și trimiteți cu `submitWithSignBytesFallback`. La un refuz, `describeKemRegistryError(res.codespace, res.code)` îl explică.
3. Verificați: `GET https://api-testnet.qore.host/qorechain/pqc/v1/kem/<address>`. Răspunde `{"found":false,"key":null}` pentru un cont care nu a publicat o cheie.
4. Semnați o carte de destinatar: `signRecipientCard({ chainId: "qorechain-diana", address, keys: sealKeys, classicalKey, pqKey })` și publicați-o unde o pot prelua expeditorii.
5. Partea expeditorului: `sealToAddresses({ rest: "https://api-testnet.qore.host", chainId: "qorechain-diana", purpose: "note", recipients: [{ address, card }], plaintext })`. Fără carte, transmiteți `mode: "mlkem"`.
6. Partea destinatarului: `open({ chainId: "qorechain-diana", purpose: "note", envelope, keys: sealKeys })`.

Fluxul complet rulabil este exemplul din repository `examples/register-and-encrypt`. Mainnet-ul a aplicat v3.2.5 pe 29 octombrie 2026; verificați README-ul propriu al exemplului pentru versiunea care ridică restricția sa pentru mainnet. Go oferă aceeași parte de expeditor cu `network.NewClient(rest).SealToAddresses(ctx, network.SealToArgs{...})`. Rust, Swift, Kotlin și Python sunt offline: citiți singuri `/qorechain/pqc/v1/kem/{address}` și `/qorechain/pqc/v1/account/{address}`, verificați cartea (`verify_recipient_card`), apoi sigilați.

### API principal {#api}

Numele sunt în forma TypeScript. Go folosește scrierea Go (`Seal`, `Open`, `NewEpochKeyManager`), Rust și Python folosesc snake_case. În Python, Swift și Kotlin, `seal` și `open` sunt `seal_envelope` / `sealEnvelope` și `open_envelope` / `openEnvelope`.

| Nume | Ce face | Unde |
|---|---|---|
| `generateSealKeys` | pereche de chei aleatoare (ML-KEM-1024 + X25519) | toate |
| `deriveSealKeys` | pereche de chei dintr-o mnemonică BIP-39, parolă opțională și index | toate |
| `sealKeysFromSeed`, `sealSeedFromMnemonic` | restaurare din seed-ul de 32 de octeți; seed dintr-o mnemonică | toate |
| `recipientOf` | destinatar public dintr-o pereche de chei | toate |
| `validateMlkemPublicKey`, `validateX25519PublicKey` | verificări de intrare (lanțul aplică aceeași verificare ML-KEM) | toate |
| `seal` | criptează către 1 până la 1.024 de destinatari (`mode`, `aad`, `anonymous`) | toate |
| `open` | decriptează cu o pereche de chei | toate |
| `parseEnvelope`, `envelopeSize` | inspectează un plic; îi calculează dimensiunea | toate |
| `envelopeToText`, `envelopeFromText` | forma text `qoreseal:` | toate |
| `signRecipientCard`, `verifyRecipientCard` | creează și verifică cartea de destinatar | toate |
| `recipientCardText`, `recipientCardFields`, `assembleRecipientCard` | construiesc o carte când se semnează în altă parte, de exemplu într-o interfață de portofel | toate |
| `buildRegisterKemKeyMessage`, `buildRemoveKemKeyMessage` | mesaje de registru, de semnat hibrid cu QoreSign | toate |
| `describeKemRegistryError` | explică codurile 250 până la 254 din codespace `pqc` | toate |
| `EpochKeyManager` | chei de epocă pentru un grup: `addMember`, `removeMember`, `rotate`, `distribution`, `exportKeys`, `keyFor`, `members`, `epoch` | toate |
| `sealEpochKey`, `openEpochKey` | trimit sau primesc o cheie de epocă (de exemplu istoricul pentru un nou venit) | toate |
| `PrivateBatchCodec`, `sealBatch`, `openBatch`, `parseBatchHeader`, `batchSize` | loturi criptate cu angajamente | toate |
| `fetchKemKey`, `fetchMlkemPublicKey` | citesc din REST cheia ML-KEM a unui cont | TypeScript, pachetul de rețea Go |
| `resolveRecipient` | chei de pe lanț plus cartea, verificate, ca destinatar | TypeScript, pachetul de rețea Go |
| `sealToAddresses` | sigilează către conturi după adresă | TypeScript, pachetul de rețea Go |

Ajutoarele de rețea sunt `@qorechain/qoreseal/network` în TypeScript și `github.com/qorechain/qoreseal/go/network` în Go. Sunt exportate și blocurile de nivel mai jos (`mlkemEncapsulate`, `mlkemDecapsulate`, `x25519Agree`, `hybridSharedSecret`, `deriveKey`, `kdfInfo`, `recipientHint`). Funcțiile cu nume pentru testare (`sealWithEntropy`, `testing_*`) există pentru a reproduce vectorii de test și nu trebuie folosite niciodată cu date reale.

Erorile Python ridică `QoreSealError.Failure` cu un `code` stabil; erorile Go se compară cu `qoreseal.IsCode`.

## Cum se accesează {#how-to-access}

| | Mainnet `qorechain-vladi` | Testnet `qorechain-diana` |
|---|---|---|
| Registrul de chei KEM | live din v3.2.5 (aplicată pe 29 octombrie 2026, înălțimea 3,906,833); ruta de citire verificată, vezi mai jos | live |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` (chain ID 9801) | `https://evm-testnet.qore.host` (chain ID 9800) |

Pe 30 octombrie 2026, interogarea registrului a răspuns `{"found":false,"key":null}` pentru un cont fără cheie pe ambele rețele (pe 27 octombrie mainnet-ul încă răspundea „Not Implemented”). O căutare în tranzacțiile mainnet-ului din 30 octombrie nu a găsit încă niciun `MsgRegisterKEMKey`, deci publicarea unei chei pe mainnet nu a fost exersată cap-coadă de această pagină.

- Sigilarea și deschiderea offline, inclusiv cheile de auditor transmise direct, grupurile private și loturile, nu au nevoie de rețea și nici de cont.
- Criptarea către o adresă cere ca destinatarul să fi publicat în registru o cheie ML-KEM-1024 și, pentru modul hibrid, o carte de destinatar.
- Publicarea unei chei are nevoie de un cont cu QOR de testnet (pe mainnet, QOR), o cheie ML-DSA-87 înregistrată și QoreSign pentru a semna tranzacția hibrid. Pragul minim al comisionului este 0,1 uqor per gas. Obțineți QOR de testnet de la [Faucet](/dashboard/faucet).
- Înregistrarea pe mainnet este acceptată doar de un lanț care are registrul; dacă apare un refuz cu codul 250, registrul nu este activat pe acel lanț.

## Unde este publicat {#where-published}

Verificat pe 27 octombrie 2026 în fiecare registru.

| Registru | Pachet | Versiune | Link |
|---|---|---|---|
| crates.io | `qorechain-qoreseal` | 0.1.0 | [crates.io/crates/qorechain-qoreseal](https://crates.io/crates/qorechain-qoreseal) |
| Go module proxy | `github.com/qorechain/qoreseal/go` | v0.1.0 (tag `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoreseal/go) |
| PyPI | `qorechain-qoreseal` | 0.1.0 (wheel-uri pentru macOS arm64 și x86_64, Linux x86_64 și aarch64, plus sursa) | [pypi.org/project/qorechain-qoreseal](https://pypi.org/project/qorechain-qoreseal/) |
| Swift Package Manager | `QoreSeal` din `github.com/qorechain/qoreseal` | 0.1.0 (binar `QoreSealFFI.xcframework.zip` în release-ul GitHub) | [release v0.1.0](https://github.com/qorechain/qoreseal/releases/tag/v0.1.0) |
| Maven Central | `io.github.qorechain:qoreseal` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) |
| Maven Central | `io.github.qorechain:qoreseal-android` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) |
| npm | `@qorechain/qoreseal` | încă nepublicat (urmează) | |

Proiectele care folosesc oricare dintre artefactele Maven au nevoie de compilatorul Kotlin 2.3 sau mai nou. Artefactul Kotlin/JVM include biblioteci native pentru macOS (arm64, x86_64), Linux (x86_64, arm64) și Windows (x86_64); artefactul Android acoperă arm64-v8a, armeabi-v7a și x86_64.

Sursa: [github.com/qorechain/qoreseal](https://github.com/qorechain/qoreseal) (release v0.1.0). Licență Apache-2.0.

## Limite și probleme cunoscute {#limits}

- **Conținutul sarcinii utile este ceea ce este protejat.** Adresele expeditorului și destinatarului, sumele transferurilor bancare, momentul tranzacțiilor, dimensiunile plicurilor și numărul de destinatari rămân publice pe lanț.
- **Nu sunt tranzacții private.** QoreSeal nu ascunde cine tranzacționează cu cine, nici cât.
- **Fără dovezi zero-knowledge.** Nimic nu dovedește nimic despre datele criptate; într-un sidechain privat, verificatorii din afara grupului nu pot verifica ce se întâmplă în interiorul unui lot.
- **Plicurile nu sunt semnate.** Oricine poate cripta către o adresă, iar orice destinatar al unui plic cu mai mulți destinatari ar putea construi un plic diferit pentru ceilalți. Semnați conținutul sau plicul (QoreSign `signMessage`) când expeditorul trebuie autentificat.
- **Fiecare destinatar citește întreaga sarcină utilă.** Nu există redactare per destinatar; sigilați plicuri separate pentru cititori diferiți.
- **Hint-urile nu înseamnă anonimat.** Oricine cunoaște cheia publică a unui candidat (este pe lanț) poate testa dacă acea cheie este destinatar. `anonymous: true` zerorizează hint-urile; destinatarii încearcă atunci fiecare intrare.
- **Pierderea cheii înseamnă pierderea datelor.** Nu există recuperare pe lanț. Pierderea seed-ului sau a mnemonicii pierde tot ce a fost sigilat către acea cheie.
- **Eliminarea sau rotirea unei chei nu șterge și nu recriptează nimic.** Datele sigilate către o cheie veche rămân lizibile de oricine o deține; păstrați seed-urile sau indexurile vechi.
- **Membrii eliminați din grup** păstrează cheile epocilor din care au făcut parte. Membrii noi citesc începând cu epoca alăturării, cu excepția cazului în care li se sigilează chei mai vechi.
- **Chain id-ul și scopul nu sunt în plic;** destinatarul trebuie să le cunoască.
- **Registrul pe mainnet:** ruta de citire este live din v3.2.5; nicio cheie nu fusese publicată pe mainnet la verificare, iar spațiul de nume EVM JSON-RPC `qor_` nu este expus pe `evm.qore.host` (folosiți ruta REST).
- **Pre-1.0, construcția în așteptarea revizuirii externe.** Versiunile minore pot schimba API-ul. Citiți specificația înainte de a vă baza pe ea.
- **Încă fără pachet npm** și încă fără wheel Python pentru Windows.

## Note de securitate {#security}

- Cheile secrete nu părăsesc niciodată dispozitivul sau serverul pe care rulează QoreSeal. Lanțul stochează doar cheia publică ML-KEM-1024, iar cartea poartă cheia publică X25519.
- Faceți backup mnemonicii contului, unei mnemonice dedicate sau seed-ului de 32 de octeți (`keys.seed`), criptat în repaus. Nu exportați niciodată separat cheia secretă ML-KEM; exportați seed-ul sau mnemonica.
- Rotire: treceți la indexul următor, înregistrați noua cheie ML-KEM, semnați o carte nouă. Cărțile vechi nu mai trec verificarea automat.
- Adăugați un destinatar de recuperare (o cheie offline) la datele care trebuie să supraviețuiască pierderii cheii unui utilizator. Tratați-l ca pe o cheie de auditor, deoarece citește tot ce i se adaugă.
- Pentru grupuri, `exportKeys()` conține fiecare cheie de epocă. Sigilați acel export către propria cheie a operatorului și o cheie de recuperare offline și țineți-l departe de mașina sequencer-ului. Rotiți cheile de epocă după un program.
- Modul `mlkem` trebuie ales explicit; hibridul nu se degradează niciodată pe tăcute.
- Primitivele provin din bindingurile [`qorechain-pqc`](/developer-tools/pqc-library) și din biblioteci consacrate (noble pentru TypeScript, crate-urile RustCrypto, biblioteca standard Go); semnăturile de cont provin de la [QoreSign](/qoresign/overview).
- Raportați vulnerabilitățile în privat la security@qore.network. Faptul că metadatele de pe lanț sunt publice este intenționat și este un subiect de documentație, nu o vulnerabilitate.

## Pagini conexe {#related}

- [QoreSign](/qoresign/overview): semnare hibridă pentru tranzacția de înregistrare și semnare de mesaje în spatele cărților de destinatar și al plicurilor semnate.
- [Prezentare generală RDK](/rollups/overview) și [Disponibilitatea datelor](/rollups/data-availability): ancorarea loturilor criptate ale unui sidechain privat.
- [Biblioteca PQC](/developer-tools/pqc-library): bindingurile ML-KEM-1024 de sub QoreSeal.
- [Securitate post-cuantică](/architecture/post-quantum-security) și [Semnare post-cuantică](/developer-guide/post-quantum-signing): cum funcționează conturile și cheile pe lanț.
- [Prezentare generală a pachetelor pentru dezvoltatori](/developer-tools/overview).
