---
slug: /build-before-qday/key-binding
title: Come la tua chiave post-quantistica viene legata al tuo account
sidebar_label: Legame della chiave
sidebar_position: 3
---

# Come la tua chiave post-quantistica viene legata al tuo account

Ogni tutorial di questa sezione usa una **chiave post-quantistica** accanto alla normale chiave del tuo account. Questa pagina spiega, con parole semplici, da dove viene quella chiave, come la catena scopre che appartiene al tuo account e come puoi verificarlo da solo. Per leggerla non devi eseguire nulla. I controlli in [Verifica da solo](#check) richiedono circa 5 minuti.

## L'idea in un'immagine {#picture}

```text
frase di recupero (o codice di recupero)
        |
        v
derivare entrambe le chiavi
  - chiave classica (secp256k1)
  - chiave post-quantistica (ML-DSA-87), legata all'indirizzo del tuo account
        |
        v
registrare una sola volta, con una prova di possesso
        |
        v
ogni transazione è firmata in modo ibrido (con entrambe le chiavi)
        |
        v
i validatori verificano entrambe le firme
```

## Parole usate in questa pagina {#words}

| Parola | Cosa significa |
| --- | --- |
| Chiave classica | La normale chiave del tuo account (secp256k1). Firma ogni transazione su ogni blockchain di questo tipo. |
| Chiave ML-DSA-87 | La chiave di firma post-quantistica. Non ci si aspetta che un futuro computer quantistico riesca a romperla. |
| Frase di recupero (mnemonica) | Le 12 o 24 parole che ripristinano un account. |
| Codice di recupero | Una riga che inizia con `QRC1`. Sostituisce la frase di recupero per la chiave post-quantistica quando il tuo account nasce da una chiave privata grezza. |
| Registrazione | Una transazione che dice alla catena quale chiave ML-DSA-87 appartiene al tuo account. |
| Prova di possesso | Una firma che dimostra che possiedi davvero la metà segreta della chiave che registri. |
| Firma ibrida | Entrambe le firme sulla stessa transazione. |

## 1. Derivare, non generare {#derive}

La chiave post-quantistica non viene scelta a caso e conservata in un file che potresti perdere. Viene **derivata**: lo stesso input dà sempre la stessa chiave.

- **Con una frase di recupero.** La chiave ML-DSA-87 nasce dalla **stessa frase di recupero** della chiave classica, insieme all'indirizzo del tuo account. La chiave classica e quella post-quantistica si ricostruiscono entrambe dalla frase, quindi **un solo backup ripristina entrambe**. È quello che fanno QoreX e l'account unificato dell'SDK.
- **Con una chiave privata grezza.** Una chiave privata da sola non può dare una seconda chiave. La chiave post-quantistica viene quindi creata da un **codice di recupero** separato che inizia con `QRC1`. Nel progetto del Workshop 1 lo crei con `pnpm window recovery-code`. Nell'SDK è `generatePqcRecoveryCode()`.

Tre regole per un codice di recupero:

1. Tienilo **separato** dalla chiave privata. Se stanno nello stesso posto, un solo furto porta via entrambi.
2. Riusa sempre lo **stesso** codice per lo stesso account.
3. Un **codice diverso dà una chiave diversa**. La catena vede allora una chiave che non corrisponde a quella che hai registrato.

:::caution Un codice di recupero non si può ricostruire
Non c'è modo di recuperare un codice di recupero perso. Scrivilo su carta quando lo crei. Fanno eccezione gli account testnet usa e getta: puoi crearne uno nuovo in un minuto.
:::

## 2. Legare una volta sola, con una prova di possesso {#bind}

Legare significa una transazione, inviata una volta per account, chiamata `MsgRegisterPQCKeyV2`. Contiene:

- la tua **chiave pubblica** ML-DSA-87 (2.592 byte), e
- una **prova di possesso**: la chiave firma un breve testo che nomina la catena e il tuo account. Nessuno può legare una chiave che non possiede, e nessuno può copiare un legame da un'altra catena.

Questo è l'unico messaggio che la catena accetta con la **sola firma classica**. Il motivo è semplice: prima di questo, la catena non ha alcuna chiave post-quantistica registrata per il tuo account, quindi non c'è nulla rispetto a cui controllare una seconda firma.

Come si fa:

| Dove | Come |
| --- | --- |
| QoreX | Automatico al tuo primo invio. Costa una commissione una tantum di circa 0,09 QOR. |
| Workshop 1 e app di esempio | `pnpm window register` (passaggio 5 della [guida del Workshop 1](/build-before-qday/workshop-1#step-5)). |
| Il tuo codice | `ensurePqcRegistered` dell'SDK. |

`ensurePqcRegistered` si può richiamare senza rischi. Legge prima il tuo account. Se la tua chiave è già legata, non invia nulla. Se è legata una chiave **diversa**, si ferma con `PqcKeyMismatchError` e non invia nulla. Se invii a mano una seconda registrazione, la catena la rifiuta e **prende comunque la commissione**, quindi lascia fare il controllo all'helper.

:::note Cosa richiede oggi la catena
La catena controlla una prova di possesso ogni volta che ce n'è una, e rifiuta la registrazione se non risulta valida. L'SDK e QoreX ne allegano una da soli. Sulla mainnet una registrazione senza prova viene ancora accettata. Sulla testnet, dalla release v3.2.8, la prima transazione di un nuovo account deve essere questa registrazione. Dettagli: [Firma post-quantistica](/developer-guide/post-quantum-signing#proof-of-possession).
:::

## 3. Dopo il legame, tutto è ibrido {#hybrid}

Da quel momento, ogni transazione nativa porta due firme:

- la firma classica secp256k1 (64 byte), e
- la firma ML-DSA-87 (4.627 byte) in un'estensione chiamata `PQCHybridSignature`.

I validatori verificano **entrambe**. Quando lo fanno, la catena registra un evento `pqc_hybrid_verify` con lo stato `verified`.

Senza una chiave registrata, una transazione viene rifiutata con `account has no PQC key and classical fallback is disabled`.

Le transazioni sulla corsia EVM (per esempio il deploy di un contratto) richiedono una cosa in più: una finestra di autorizzazione EVM, aperta da un messaggio firmato in modo ibrido. Vedi il [riferimento sulla finestra EVM](/developer-guide/evm-window-reference).

## Verifica da solo {#check}

Ti serve `curl`. `jq` è facoltativo. Entrambi sono trattati in [Prima di iniziare](/build-before-qday/prerequisites#curl-jq).

### La mia chiave è registrata? {#check-account}

1. Sostituisci `qor1...` con il tuo indirizzo ed esegui:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/account/qor1...
```

Cosa fa: chiede al server pubblico della testnet il record della chiave del tuo account.

Parametri:

- `curl`: un programma che scarica un indirizzo web.
- `-s`: silenzioso, quindi nasconde la barra di avanzamento e mostra solo la risposta.
- `https://api-testnet.qore.host/qorechain/pqc/v1/account/qor1...`: l'indirizzo REST della testnet, seguito dal tuo account.

**Cosa dovresti vedere:** per un account registrato, una risposta come questa (sono mostrati dei segnaposto, la tua ha valori reali):

```json
{
  "found": true,
  "account": {
    "address": "qor1...",
    "public_key": "<base64 ML-DSA-87 public key>",
    "algorithm_id": 1,
    "algorithm_name": "dilithium5",
    "ecdsa_pubkey": "<your classical public key>",
    "key_type": "hybrid",
    "created_at_height": "<block height>",
    "migration_public_key": null,
    "migration_algorithm_id": 0,
    "classical_key_source": "auth_account",
    "possession_proven": true
  }
}
```

`found` è `true` quando una chiave è legata e `false` quando non lo è. `possession_proven` è `true` quando la chiave è stata registrata con una prova di possesso verificata.

### La mia transazione è stata firmata in modo ibrido? {#check-tx}

Il controllo del Workshop 1, passaggio 6.

1. Sostituisci `<HASH>` con l'hash di una tua transazione (senza `<` e `>`) ed esegui:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Cosa fa: chiede al server pubblico della testnet il record completo della tua transazione.

**Cosa dovresti vedere:** un lungo blocco di testo. Cerca tre cose:

1. `"code": 0` dentro `tx_response`. Il codice 0 significa successo.
2. L'estensione `PQCHybridSignature`, che contiene la firma ML-DSA-87: **4.627 byte**, accanto alla firma secp256k1 da 64 byte.
3. In `events`, un evento di tipo `pqc_hybrid_verify` con l'attributo `status` impostato su `verified`.

2. Per stampare solo quell'evento (serve `jq`):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Cosa fa: scarica lo stesso record e lo passa a `jq`, che tiene solo l'evento di verifica.

**Cosa dovresti vedere:** un evento il cui attributo `status` è `verified`.

## Chiavi e modifiche correlate {#related}

- **Chiavi di cifratura.** Le chiavi ML-KEM-1024, usate da [QoreSeal](/developer-tools/qoreseal) per cifrare dati verso un account, stanno in un **registro separato**. Ne pubblichi una con `MsgRegisterKEMKey`, in una transazione firmata in modo ibrido, quindi l'account deve avere già la sua chiave ML-DSA-87.
- **Cambiare la chiave di firma.** `MsgRotatePQCKey` sostituisce la chiave ML-DSA-87 con una nuova dello stesso tipo, per esempio per ritirare una chiave compromessa. `MsgMigratePQCKey` passa da un algoritmo a un altro. Entrambi richiedono firme della chiave vecchia e di quella nuova, e la catena rifiuta una chiave che l'account ha già usato in passato. Entrambi sono attivi su mainnet e testnet. Regole complete: [Firma post-quantistica](/developer-guide/post-quantum-signing).

## Risoluzione dei problemi {#troubleshooting}

| Cosa vedi | Perché | Cosa fare |
| --- | --- | --- |
| `account has no PQC key and classical fallback is disabled` | L'account non ha ancora registrato la sua chiave ML-DSA-87. | Registrala prima (`pnpm window register`, il primo invio in QoreX o `ensurePqcRegistered`), poi invia di nuovo. Controlla con la query sull'account qui sopra. |
| `PqcKeyMismatchError`, oppure `registered, but NOT this key` in `pnpm window status` | È già legata una chiave diversa. Hai usato un codice o una frase di recupero diversi dalla prima volta. | Rimetti il codice o la frase di recupero originali. Per un account usa e getta, ricomincia con un nuovo account. |
| Registrazione rifiutata perché già registrata | L'account ha già una chiave. Una seconda registrazione grezza prende comunque la commissione. | Non fare nulla. Leggi l'account con la query qui sopra, oppure usa `ensurePqcRegistered`, che controlla prima. |
| Hai perso il tuo codice di recupero | Non si può ricostruire dalla chiave privata. | Se l'account nasce da una frase di recupero, usa la stessa frase: dà la stessa chiave. Altrimenti usa un nuovo account. Sulla testnet non costa nulla. |
| La registrazione fallisce con un messaggio su commissione o saldo | L'account ha troppo pochi QOR per la commissione (circa 0,09 QOR) oppure la commissione è sotto il minimo della rete di 0,1 uqor per unità di gas. | Prendi dei QOR dal [faucet](https://dashboard.qorechain.io/faucet), imposta il gas a circa 600.000 per una registrazione manuale e riprova. |
| `found` è `false` anche se hai registrato | Stai interrogando la rete sbagliata, o l'indirizzo sbagliato. | Controlla di usare `api-testnet.qore.host` per la testnet e il tuo indirizzo `qor1...`. Un wallet può mostrare una rete diversa da quella del tuo progetto. |
| L'account risponde `found: true` ma le tue transazioni falliscono | La chiave sulla catena non è quella che deriva il tuo progetto. | Esegui `pnpm window status` e confrontala con il codice di recupero in `.env`. |

## Prossimo passo {#next}

Torna alla [guida del Workshop 1](/build-before-qday/workshop-1#step-5) e registra la tua chiave, oppure leggi la [panoramica](/build-before-qday/overview).
