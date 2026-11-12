---
slug: /developer-guide/account-abstraction
title: Astrazione dell'Account
sidebar_label: Astrazione dell'Account
sidebar_position: 7
---

# Astrazione dell'Account

QoreChain offre **astrazione dell'account a livello di protocollo** tramite il modulo `x/abstractaccount`. Il modulo registra account astratti con regole di spesa e consente al proprietario dell'account di collegare chiavi esterne (**autenticatori**) che possono spendere dall'account entro i limiti di permessi e di spesa, senza un'infrastruttura di smart contract esterna.

:::danger Non abilitato sulla mainnet; abilitato sulla testnet
Il modulo di account astratti è **disattivato sulla mainnet `qorechain-vladi`** al momento della stesura (verificato il 27 ottobre 2026): `qorechaind query abstractaccount config` (e `GET /qorechain/abstractaccount/v1/config`) riportano `enabled: false`. Sulla **testnet `qorechain-diana`** è stato attivato da una decisione di governance (proposta 18, approvata il 27 ottobre 2026) e riporta `enabled: true`. Dalla versione della chain v3.2.0 il flag viene applicato su ogni percorso: dove è `false` la chain rifiuta la creazione di account, la registrazione degli autenticatori ed entrambe le lane di esecuzione (`MsgExecuteEVM`, `MsgExecuteCosmos`) con `abstract accounts are disabled on this chain`. Nessuna transazione ordinaria può attivare il modulo; l'impostazione cambia solo con una decisione di governance. Nessuna transazione di account astratto è mai stata inclusa sulla mainnet. Tutto ciò che segue descrive le interfacce del modulo; provalo sulla testnet e non costruire un flusso di chiave collegata o di spesa delegata per la mainnet finché il modulo non è abilitato lì. Controlla sempre prima il flag.
:::

:::note
I comandi seguenti usano la mainnet **`qorechain-vladi`** (attiva dal 7 giugno 2026), che esegue la release del nodo **v3.2.6** (applicata all'altezza 4.020.000 il 4 novembre 2026, proposta di governance 15; la v3.2.5 è stata applicata all'altezza 3.906.833 il 29 ottobre 2026, proposta 14, e la v3.2.4 all'altezza 3.742.566 il 23 ottobre 2026). Sostituisci con `--chain-id qorechain-diana` per la testnet, che esegue la v3.2.7 (dal 6 novembre 2026; v3.2.4 dal 19 ottobre 2026).
:::

:::caution Ogni transazione sulla lane Cosmos richiede la co-firma ibrida post-quantistica
Gli esempi `qorechaind tx` in questa pagina mostrano solo i flag delle commissioni. Sulle reti live ogni transazione sulla lane Cosmos deve portare anche la co-firma ibrida ML-DSA-87, quindi costruisci la transazione con `--generate-only` e firmala con `qorechaind tx pqc cosign` (oppure usa QoreX o l'SDK, che lo fanno per te). La build community di `qorechaind` non può produrre quella firma; usa il binario della release dal [manifest di download](/developer-guide/running-a-node#fetch-the-manifest). La soglia minima delle commissioni è di **0,1 uqor per unità di gas**, quindi `--gas 400000` richiede almeno `--fees 40000uqor`. Vedi [Firma post-quantistica](/developer-guide/post-quantum-signing).
:::

## Panoramica

Gli account blockchain tradizionali sono controllati da una singola chiave privata. L'astrazione dell'account disaccoppia il concetto di "chi può autorizzare una transazione" da un'unica chiave crittografica. Il modulo `x/abstractaccount` fornisce:

* **Account astratti** con un tipo di account e un proprietario registrati
* **Regole di spesa** (limiti per transazione e giornalieri, denominazioni consentite) che delimitano ciò che le chiavi collegate (autenticatori e chiavi di sessione) possono spendere; non limitano la chiave del proprietario
* **Autenticatori**: chiavi esterne (una chiave ed25519 Phantom o un indirizzo secp256k1 MetaMask) che il proprietario collega con permessi limitati e una scadenza, e che può revocare in qualsiasi momento

*Un flusso con chiave collegata (autenticatore): la chiave collegata firma un'autorizzazione, un relayer la invia, il modulo verifica permessi, scadenza e regole di spesa, quindi esegue dall'account del proprietario.*

```mermaid
flowchart TD
    A["Il proprietario collega una chiave esterna<br/>(permessi limitati + scadenza)"] --> B["La chiave collegata firma<br/>un'autorizzazione"]
    B --> C["Il relayer invia e paga<br/>la transazione"]
    C --> D{"Valida l'autenticatore"}
    D -- "permesso concesso?<br/>non scaduto?<br/>nonce valido?" --> E{"Valida la regola di spesa"}
    D -- "fallisce" --> R["Rifiuta la transazione"]
    E -- "limite per tx + giornaliero<br/>denominazione consentita" --> F["Esegui dall'account del proprietario"]
    E -- "supera il limite" --> R
    F --> G["L'autenticatore scade<br/>o il proprietario lo revoca"]
```

## Tipi di Account

`create` registra uno dei tre tipi di account. Il tipo è memorizzato sull'account e fa parte del modo in cui ne viene derivato l'indirizzo; il modulo non ha transazioni proprie di multisig, chiavi di sessione o recupero (il servizio di transazioni comprende `create`, `update-rules`, `register-authenticator`, `revoke-authenticator`, `execute-cosmos`, `execute-evm`).

| Tipo              | Uso previsto                    |
| ----------------- | ------------------------------- |
| `multisig`        | Tesorerie DAO, wallet condivisi |
| `social_recovery` | Wallet consumer, onboarding     |
| `session_based`   | Sessioni dApp, wallet mobili    |

## Creazione di un Account Astratto

`create` accetta il tipo di account come argomento posizionale (`multisig`, `social_recovery` o `session_based`):

```bash
qorechaind tx abstractaccount create session_based \
  --from mykey \
  --gas 400000 --fees 40000uqor
```

Il comando non ha flag per firmatari, soglie o guardiani.

## Autenticatori (chiavi collegate)

Il meccanismo di chiave delegata del modulo è l'**autenticatore**, descritto in [Autenticatori di Wallet Collegati](#authenticators) più sotto: il proprietario collega una chiave esterna (ed25519 o secp256k1) con un insieme di permessi e una scadenza, e la revoca in qualsiasi momento:

```bash
qorechaind tx abstractaccount register-authenticator <account-address> <scheme> <pubkey-base64> <permissions-csv> <expiry-unix> <label> \
  --from mykey --gas 400000 --fees 40000uqor
qorechaind tx abstractaccount revoke-authenticator <account-address> <scheme> <pubkey-base64> \
  --from mykey --gas 400000 --fees 40000uqor
```

`scheme` è `ed25519` (ad esempio Phantom) oppure `secp256k1` (ad esempio MetaMask). Non esistono i comandi `grant-session`, `revoke-session` né `query abstractaccount sessions`.

## Regole di Spesa

Le regole di spesa aggiungono limiti finanziari per gli autenticatori e le chiavi di sessione collegati a un account astratto. Le regole di spesa vincolano solo gli autenticatori e le chiavi di sessione, non la chiave del proprietario; la chiave del proprietario è limitata, sulla corsia EVM, dalla [finestra di autorizzazione EVM](/getting-started/first-transaction#evm-window).

I campi della regola:

| Regola           | Descrizione                                           |
| ---------------- | ----------------------------------------------------- |
| `daily_limit`    | Spesa totale massima per giorno di calendario UTC     |
| `per_tx_limit`   | Spesa massima per singola esecuzione autorizzata      |
| `allowed_denoms` | Limita quali denominazioni di token possono essere spese (un ERC-20 è elencato come `erc20/<EIP-55 0x address>`, la grafia propria della regola di spesa con la barra; la chain confronta l'indirizzo nella sua forma EIP-55, quindi le maiuscole e minuscole che digiti non creano un token diverso. Non è la denominazione bank di una coppia di token registrata, che si scrive `erc20:<EIP-55 0x address>` con i due punti e distingue maiuscole e minuscole, vedi [Sviluppo EVM](/developer-guide/evm-development#fest-tokens)) |
| `denom_limits`   | Limiti per denominazione come stringhe decimali (v3.2.2): `{"denom","per_tx_limit","daily_limit"}`; sostituiscono `per_tx_limit` e `daily_limit` per le denominazioni che nominano, così è possibile limitare un token a 18 decimali |
| `allowed_evm_calls` | Chiamate EVM che una chiave vincolata a una regola può effettuare **con call data** (v3.2.2), come `0x<target>` (qualsiasi funzione di quel contratto) oppure `0x<target>/0x<selector>` (solo quella funzione). Senza una voce, una chiave vincolata a una regola può soltanto inviare valore, eseguire il deploy (con il permesso `deploy`) e spostare i token ERC-20 elencati in `allowed_denoms`. Elencare un target significa fidarsi di ogni argomento delle chiamate effettuate verso di esso, destinatari inclusi |

### Impostare le Regole di Spesa

`update-rules` sostituisce le regole dell'account con un array JSON di oggetti `SpendingRule` (JSON inline, non un file e non flag):

```bash
qorechaind tx abstractaccount update-rules <account-address> \
  '[{"id":"daily","enabled":true,"daily_limit":1000000000,"per_tx_limit":100000000,"allowed_denoms":["uqor"]}]' \
  --from mykey --gas 400000 --fees 40000uqor
```

I limiti sono espressi nell'unità base (`uqor`) e contano per esecuzione autorizzata; il limite giornaliero delimita il totale per giorno di calendario UTC. Le regole sostituiscono nel loro insieme quelle memorizzate, quindi un campo omesso viene rimosso. Dalla v3.2.2 la lane EVM misura ciò che una chiamata sposta effettivamente (valore nativo, la diminuzione del saldo nativo dell'account, le coin bank spese e la variazione di saldo o di allowance di ogni ERC-20 elencato) anziché soltanto `msg.value`, e la creazione di contratti richiede il permesso separato `deploy`. Un esempio più ricco (l'ERC-20 mostrato è il token di test fUSD della testnet; usa l'indirizzo del contratto del tuo token, e nota la barra in `erc20/<address>` in una regola rispetto ai due punti nel denom bank `erc20:<address>`):

```bash
qorechaind tx abstractaccount update-rules <account-address> \
  '[{"id":"daily","enabled":true,"daily_limit":5000000,"allowed_denoms":["uqor","erc20/0x97143B771D34ddb9130b807b135Ae675A5a963CA"],"allowed_evm_calls":["0xROUTER/0x38ed1739"],"denom_limits":[{"denom":"erc20/0x97143B771D34ddb9130b807b135Ae675A5a963CA","per_tx_limit":"100000000000000000000","daily_limit":"500000000000000000000"}]}]' \
  --from mykey --gas 400000 --fees 40000uqor
```

### Interrogare le Regole Correnti

Il record dell'account include le sue regole e il numero di chiavi collegate:

```bash
qorechaind query abstractaccount account <account-address>
```

Dalla v3.2.8 (solo testnet fino a un successivo upgrade della mainnet) una chiave con permessi di valore viene rifiutata alla registrazione e all'esecuzione a meno che una regola non la delimiti, quindi "nessun limite" non vale più per tali chiavi.

:::caution Una regola delimita una chiave solo se esiste
La chain risolve il limite in questo ordine: la regola propria dell'autenticatore se impostata e `enabled`; altrimenti la prima regola `enabled` sull'account; altrimenti **non c'è alcun limite**. Una regola memorizzata con `enabled: false` significa nessun limite, non un limite pari a zero. `MsgRegisterAuthenticator` non porta alcuna regola, quindi una chiave collegata con questo solo messaggio è delimitata unicamente da una regola a livello di account. Imposta una regola deliberatamente con `update-rules` e registra solo i permessi di cui la chiave ha bisogno. Un limite circoscrive il danno che una chiave collegata può fare; non sostituisce la revoca della chiave.
:::

## Autenticatori di Wallet Collegati — Spesa Delegata {#authenticators}

Il design degli autenticatori è stato introdotto nella versione della chain **v3.1.85** (basata sul modello di permessi v3.1.84). **Non è utilizzabile sulla mainnet finché il modulo è disattivato lì**, ed è disponibile sulla testnet, dove il modulo è abilitato (vedi il riquadro di stato in cima a questa pagina). Una **chiave di wallet esterno collegata** — una chiave Phantom (ed25519) o un account MetaMask (secp256k1) — può **spendere dall'account post-quantistico canonico** con termini a privilegio minimo, con limite di spesa e revocabili. La chiave esterna non produce mai una firma ML-DSA; un **relayer** invia e paga la busta della transazione (la firma PQC ibrida propria del relayer soddisfa i requisiti di firma della chain), mentre la firma dell'autenticatore sui **byte di firma separati per dominio e vincolati contro il replay** costituisce l'autorizzazione.

### Registrare un autenticatore {#register-authenticator}

Il proprietario dell'account registra la chiave esterna con `MsgRegisterAuthenticator` (una normale transazione con la chiave root), assegnandole uno schema, dei permessi, una scadenza e limiti di spesa opzionali:

```js
import { registerEthAuthenticatorMsg } from "@qorechain/wallet-adapter";

// Link a MetaMask account by its 20-byte address (EIP-191 verification):
const msg = registerEthAuthenticatorMsg({
  owner: "qor1owner...",              // the canonical account (signs this message)
  ethAddress: "0xAbC...123",          // the MetaMask address to link
  permissions: ["evm"],               // least privilege — see the taxonomy below
  expiryUnix: Math.floor(Date.now() / 1000) + 30 * 24 * 3600, // absolute Unix seconds, ≤ 30 days recommended
  label: "metamask",
});
// Limits are a separate message (MsgUpdateSpendingRules), see "Spending Rules" above.
// Sign & broadcast this msg with the OWNER's normal hybrid-PQC signer.
```

**Dalla release v3.2.8 (solo testnet fino a un successivo upgrade della mainnet) la registrazione richiede due cose in più.**

1. **Una prova di possesso.** `MsgRegisterAuthenticator` ha un campo obbligatorio `possession_proof` (campo 8): una firma della chiave che viene collegata, che prova che accetta il collegamento. La chiave firma questo testo semplice con il proprio schema, così un wallet del browser mostra all'utente ciò che firma (Phantom `signMessage`, MetaMask `personal_sign`); una chiave secp256k1 da 33 byte firma lo SHA-256 del testo:

   ```text
   QoreChain authenticator link v1
   chain: <chain-id>
   account: <bech32 account>
   scheme: <scheme>
   key: <lowercase hex of the public key, or of the 20-byte address>
   ```

   Il testo nomina la chain, l'account, lo schema e la chiave, quindi una prova non può essere riutilizzata per un'altra chain, un altro account o un'altra chiave. Una registrazione senza una prova valida viene rifiutata.
2. **Una regola di spesa per le chiavi di valore.** Una chiave i cui permessi possono muovere valore (`send`, `evm`, `svm`, `deploy`, `all`) richiede una regola di spesa che delimiti ogni denominazione che può spendere, impostata con `MsgUpdateSpendingRules` prima del collegamento o insieme ad esso. La stessa regola viene applicata all'esecuzione per le chiavi collegate prima dell'upgrade, quindi aggiungi regole anche per quelle.

Da codice, l'SDK 0.14.0 ha gli helper per entrambe (TypeScript: `signAuthenticatorLinkPhantom`, `signAuthenticatorLinkMetaMask`, `signAuthenticatorLinkEd25519`, `signAuthenticatorLinkSecp256k1`, `signAuthenticatorLinkEip191` per la prova; `linkAuthenticatorMsgs` per la regola di spesa e il collegamento in un'unica transazione firmata dal proprietario), e `@qorechain/wallet-adapter` 0.6.0 ha `phantomPossessionProof`, `metaMaskPossessionProof` e `linkAuthenticatorMsgs`. Vedi [Collegamento dalla chain v3.2.8](/sdk/guides/authenticators#link-v328). Per il caso di esecuzione fallita, `assertAuthenticatorExecutionsSucceeded` lancia un errore su `success=false`. `linkAuthenticatorMsgs`, `metaMaskPossessionProof` e `revokeAuthenticatorMsg` sono stati eseguiti sulla testnet (vedi [Cosa è stato verificato](#link-example-checks)); gli helper Phantom ed ed25519 no.

Una chiave Phantom viene registrata allo stesso modo con lo schema `ed25519` e la chiave pubblica Phantom (`register-authenticator` da CLI). La revoca è istantanea tramite `MsgRevokeAuthenticator`.

**Un'esecuzione può fallire all'interno di una transazione riuscita.** Dalla v3.2.8 (solo testnet fino a un successivo upgrade della mainnet) un `MsgExecuteEVM` o `MsgExecuteCosmos` fallito restituisce `success=false` nella sua risposta con codice di transazione 0, emette l'evento `abstractaccount_execution_failed` con il motivo e consuma comunque il nonce dell'autenticatore. Un client che controlla solo il codice della transazione segnalerà una tale chiamata come riuscita: leggi la risposta o l'evento.

### Tassonomia dei permessi {#permission-taxonomy}

Undici permessi canonici regolano ciò che un autenticatore registrato può fare. La mappatura è **a chiusura predefinita (fail-closed)**: un tipo di messaggio senza mappatura viene negato.

| Permesso | Concede |
| --- | --- |
| `send` | Trasferimenti bancari sulla lane nativa |
| `delegate` / `withdraw` / `vote` | Staking, prelievo delle ricompense, governance |
| `evm` / `wasm` / `svm` | Esecuzione sulla rispettiva lane VM |
| `amm` / `ibc` / `deploy` | Operazioni AMM, trasferimenti IBC, deployment di contratti |
| `all` | Qualsiasi messaggio *delegabile* |

**I messaggi di gestione delle chiavi non sono mai delegabili** — `MsgRegisterAuthenticator`, `MsgRevokeAuthenticator`, la registrazione/migrazione della chiave PQC e `MsgRotatePQCKey` richiedono sempre la chiave root, così una chiave collegata non può mai elevare i propri privilegi. Lo schema (`schema_version` 2) elenca anche `lane_rules`: la creazione di un contratto dall'indirizzo dell'account, una chiamata che fa avanzare il nonce EVM dell'account e una chiamata all'account stesso quando il suo codice è una delega EIP-7702 richiedono ciascuna il permesso `deploy` o `all`. Dalla v3.2.3 la registrazione rifiuta stringhe di permesso sconosciute e chiavi secp256k1 da 65 byte che non potrebbero mai essere verificate.

Leggi la tassonomia live (con `schema_version` per il rilevamento delle deviazioni) invece di codificarla staticamente:

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/permission_schema | jq
# or: qorechaind query abstractaccount permission-schema
```

### Spendere tramite una chiave collegata {#execute-messages}

Due messaggi trasportano azioni autorizzate dall'autenticatore. In entrambi, il relayer è il firmatario/pagatore delle commissioni della transazione; la firma dell'autenticatore viaggia all'interno del messaggio.

**`MsgExecuteEVM`** — una chiamata EVM o un trasferimento **dall'indirizzo `0x…` dell'account canonico**. L'autenticatore firma `sha256("qorechain-evm-auth-v1" ‖ chainId ‖ account ‖ pubkey ‖ to ‖ value ‖ data ‖ nonce)` (tutti i campi con prefisso di lunghezza). Dalla v3.2.3 (la funzionalità `abstractaccount-hardening`) la chain richiede il **digest v2**, `sha256("qorechain-evm-auth-v2" ‖ … ‖ nonce ‖ gasLimit)`, che vincola anche il limite di gas della chiamata (8 byte big-endian) così che un relayer non possa riprodurre la firma con un limite diverso; nessun blocco accetta entrambe le forme. `qorechaind query abstractaccount auth-sign-evm` accetta `--gas-limit` a questo scopo, e lo stesso valore va passato a `execute-evm`. La protezione dal replay è il nonce EVM proprio dell'account.

**`MsgExecuteCosmos`** — un invio bancario sulla lane nativa dall'account canonico. L'autenticatore firma `sha256("qorechain-cosmos-auth-v1" ‖ chainId ‖ account ‖ pubkey ‖ to ‖ amount ‖ nonce)`. La protezione dal replay è una **sequenza per-autenticatore** mantenuta dal modulo (un invio bancario non incrementa il nonce dell'account). Gli auto-invii vengono rifiutati.

:::caution Regole sul nonce
* `MsgExecuteEVM.nonce` = il nonce EVM **corrente** dell'account (`eth_getTransactionCount(account0x, "latest")`). In produzione il relayer è un account *diverso*, quindi **non** aggiungere +1. Firmare un nonce obsoleto restituisce il codice `11`.
* `MsgExecuteCosmos.nonce` = la sequenza per-autenticatore (interroga lo stato dell'autenticatore dell'account), **non** la sequenza Cosmos dell'account. Dalla v3.2.4 (testnet dal 19 ottobre 2026, mainnet dal 23 ottobre 2026), `GET /qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` restituisce direttamente quella sequenza (`nonce`, `linked`).
:::

**Esempio Phantom** (browser: Phantom firma, il tuo backend inoltra):

```js
import { buildPhantomExecuteCosmos } from "@qorechain/wallet-adapter";

// In the dApp: Phantom signs the digest with ed25519 signMessage.
const msg = await buildPhantomExecuteCosmos({
  wallet: window.solana,              // Phantom: { publicKey, signMessage }
  relayer: "qor1relayer...",          // submits the tx and pays the fee (a different account)
  chainId: "qorechain-vladi",
  account: "qor1owner...",            // canonical account being spent from
  to: "qor1recipient...",
  amount: "900000uqor",               // single-coin string
  nonce: authSequence,                // per-authenticator sequence
});
// Send `msg` to your relayer; the relayer wraps it in a tx it signs
// (hybrid PQC) and broadcasts. The transfer moves the OWNER's funds.
```

**Esempio MetaMask** (`personal_sign` EIP-191 dall'indirizzo collegato a 20 byte):

```js
import { buildMetaMaskExecuteEvm } from "@qorechain/wallet-adapter";

const msg = await buildMetaMaskExecuteEvm({
  provider: window.ethereum,          // MetaMask (EIP-1193)
  address: ethAddress,                // the linked 20-byte address
  relayer: "qor1relayer...",
  chainId: "qorechain-vladi",
  account: "qor1owner...",
  to: "0xRecipient...",
  value: (10n ** 16n).toString(),     // 0.01 QOR in wei (18-decimal EVM view), as a decimal string
  gasLimit: 100000,
  nonce: currentEvmNonce,             // eth_getTransactionCount(owner0x, "latest")
});
// Relay as above. The chain verifies the signature via EIP-191 + ecrecover
// against the registered 20-byte address.
```

Gli stessi builder esistono nell'[SDK di QoreChain](/sdk/guides/authenticators) per tutti e cinque i linguaggi, oltre agli equivalenti da riga di comando:

```bash
# Generate an ed25519 authenticator key: the seed goes to a new 0600 file, only the public key is printed
qorechaind query abstractaccount auth-keygen --out authenticator.seed

# Sign the exact bytes the chain verifies (seed from --seed-file, "-" for stdin, QORE_AUTH_SEED, or a prompt)
qorechaind query abstractaccount auth-sign-cosmos <chain-id> <account> <to> <amount> <nonce> --seed-file authenticator.seed
qorechaind query abstractaccount auth-sign-evm <chain-id> <account> <to-0xhex> <value-wei> <data-hex> <nonce> --seed-file authenticator.seed

# Relay a pre-signed authorization (the relayer's --from key pays; cosign the envelope with `tx pqc cosign`)
qorechaind tx abstractaccount execute-cosmos <account> <to> <amount> <scheme> <pubkey-base64> <signature-base64> <nonce> --from relayer --generate-only > tx.json
qorechaind tx abstractaccount execute-evm <account> <to-0xhex> <value-wei> <data-hex> <gas-limit> <scheme> <pubkey-base64> <signature-base64> <nonce> --from relayer --generate-only > tx.json
```

Le chiavi e le firme in questi comandi sono in base64. Gli helper `auth-sign-*` leggono il seed da un file, da stdin o dall'ambiente anziché da un argomento della riga di comando (release del nodo v3.2.1 e successive), così non compare nella cronologia della shell. I flag per la gestione del seed (`--out`, `--seed-file`) esistono solo nei binari v3.2.1 e successivi.

### Codici di errore {#authenticator-errors}

I fallimenti di enforcement restituiscono codici distinti (codespace `abstractaccount`) così i wallet possono mostrare il messaggio corretto:

| Codice | Significato | UX del wallet |
| --- | --- | --- |
| `5` | Limite di spesa superato (per transazione o giornaliero) | Mostra l'allowance residua |
| `6` | Autenticatore scaduto | "Scaduto — ricollega il tuo wallet" |
| `9` | Modulo disattivato (lo stato attuale sulla mainnet) | "I wallet collegati non sono ancora disponibili" |
| `10` | Permesso negato (ambito o messaggio non delegabile) | Mostra il permesso mancante |
| `11` | Replay rifiutato (nonce/sequenza obsoleti) | Interroga di nuovo il nonce e ri-firma |

(Codespace `pqc` codice `21` = verifica della firma ibrida fallita — un problema di firma lato relayer, non di autorizzazione.)

### Query REST {#abstractaccount-rest}

Le query in lettura del modulo sono servite via REST (a partire dalla **v3.1.85**):

```
GET /qorechain/abstractaccount/v1/config      # {"config":{"enabled":false,...}} on mainnet today; enabled: true on the testnet
GET /qorechain/abstractaccount/v1/accounts
GET /qorechain/abstractaccount/v1/accounts/{address}
GET /qorechain/abstractaccount/v1/permission_schema
```

## Collegare una chiave nella v3.2.8: esempio completo {#link-example-v328}

Questa sezione percorre un collegamento completo sulla testnet **`qorechain-diana`**, che esegue la v3.2.8 dal 12 novembre 2026. La mainnet non esegue ancora la v3.2.8 e il suo modulo di astrazione dell'account è spento, quindi nulla di tutto questo vi si applica oggi. In breve: la chiave che colleghi deve firmare un breve testo per mostrare che accetta di essere collegata, una chiave che può muovere valore richiede una regola di spesa sull'account, e quando una chiave collegata in seguito spende, una spesa fallita viene segnalata all'interno di una transazione riuscita.

Perché è importante: dalla v3.2.8 il titolare della chiave partecipa al collegamento, quindi una chiave può essere collegata solo da chi la detiene davvero, e una chiave che può muovere valore è sempre limitata da un tetto sull'account.

:::note Cosa puoi eseguire oggi
Il testo del collegamento e i tre schemi di firma qui sotto funzionano con il semplice `node:crypto` e con `@noble` come mostrato. I pacchetti pubblicati (SDK 0.13.0 e wallet-adapter 0.5.0) non possono ancora inserire la prova in `MsgRegisterAuthenticator`: i loro `registerAuthenticator` e `registerEthAuthenticatorMsg` costruiscono il messaggio senza il campo della prova, che la testnet v3.2.8 rifiuta. Una release successiva di SDK e wallet-adapter aggiunge helper che costruiscono il testo del collegamento, chiedono al wallet di firmarlo e allegano la prova; fino ad allora usa la riga di comando (passo 3) oppure il messaggio grezzo. Qui `qorechaind` indica la CLI del nodo Linux; non esiste un binario macOS pacchettizzato.
:::

### 1. Il testo del collegamento e come lo firma ciascuno schema {#link-text}

Il testo ha cinque righe, unite da un singolo carattere di a capo, senza a capo finale:

```text
QoreChain authenticator link v1
chain: qorechain-diana
account: qor1youraccount...
scheme: secp256k1
key: b31c9bca95fa18bc6bf5cbf748f73925e0e05913
```

`chain` è il chain id, `account` è l'account bech32 a cui la chiave è collegata, `scheme` è lo schema che passi a `register-authenticator`, e `key` è l'esadecimale minuscolo della chiave pubblica (32 byte per ed25519, 33 byte per una chiave secp256k1 compressa) oppure, per un account MetaMask, dell'indirizzo Ethereum di 20 byte. I byte che la chain verifica sono esattamente questi caratteri, quindi un chain id, un account o una chiave diversi producono una prova che non si verifica.

| Chiave collegata | `scheme` | Cosa contiene `key` | Cosa viene firmato | Dimensione della prova |
| --- | --- | --- | --- | --- |
| Phantom (ed25519) | `ed25519` | chiave pubblica di 32 byte | i byte UTF-8 del testo (`signMessage` del wallet) | 64 byte |
| Chiave secp256k1 compressa | `secp256k1` | chiave pubblica di 33 byte | SHA-256 del testo, `r` compatto poi `s` | 64 byte |
| Indirizzo Ethereum (MetaMask) | `secp256k1` | indirizzo di 20 byte | EIP-191 `personal_sign` del testo | 65 byte (`r`, `s`, `v` = 27 o 28) |

Questo TypeScript costruisce il testo e lo firma con tre chiavi usa e getta, usando `node:crypto`, `@noble/curves` 2.x e `@noble/hashes` 1.8 (da eseguire su Node 20 o successivo; non usare mai queste chiavi per altro):

```ts
import { generateKeyPairSync, sign } from "node:crypto";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { keccak_256 } from "@noble/hashes/sha3.js";
import { bytesToHex, utf8ToBytes, concatBytes } from "@noble/hashes/utils.js";

const chainId = "qorechain-diana";
const account = "qor1youraccount..."; // the account the key is linked to

function linkText(scheme: string, key: Uint8Array): string {
  return [
    "QoreChain authenticator link v1",
    `chain: ${chainId}`,
    `account: ${account}`,
    `scheme: ${scheme}`,
    `key: ${bytesToHex(key)}`, // lowercase hex
  ].join("\n");
}

// ed25519 (what Phantom signMessage does): sign the text bytes.
const ed = generateKeyPairSync("ed25519");
const edPub = ed.publicKey.export({ format: "der", type: "spki" }).subarray(-32);
const edProof = sign(null, utf8ToBytes(linkText("ed25519", edPub)), ed.privateKey);

// 33-byte secp256k1 key: sign sha256(text), 64-byte r||s.
const sk = secp256k1.utils.randomSecretKey();
const pub33 = secp256k1.getPublicKey(sk, true);
const cosmosProof = secp256k1.sign(sha256(utf8ToBytes(linkText("secp256k1", pub33))), sk, { prehash: false });

// Ethereum address: EIP-191 personal_sign, key = the 20-byte address.
const ethSk = secp256k1.utils.randomSecretKey();
const addr = keccak_256(secp256k1.getPublicKey(ethSk, false).subarray(1)).subarray(-20);
const text = utf8ToBytes(linkText("secp256k1", addr));
const digest = keccak_256(concatBytes(utf8ToBytes(`\x19Ethereum Signed Message:\n${text.length}`), text));
const rec = secp256k1.sign(digest, ethSk, { prehash: false, format: "recovered" }); // recovery byte first
const ethProof = concatBytes(rec.subarray(1), Uint8Array.of(rec[0] + 27));          // r || s || v

// The CLI takes the proof as base64:
console.log(Buffer.from(edProof).toString("base64"));
```

In una dApp nel browser non detieni la chiave: passa lo stesso testo al wallet (Phantom `signMessage` con i byte UTF-8, MetaMask `personal_sign` con il testo) e converti in base64 ciò che ritorna. Il wallet mostra all'utente le cinque righe, che è il motivo per cui si usa testo semplice.

### 2. La regola di spesa {#link-spending-rule}

Una chiave le cui permission possono muovere valore (`send`, `evm`, `svm`, `deploy`, `all`) viene rifiutata alla registrazione a meno che l'account non abbia già una regola abilitata che limiti ogni denominazione che la chiave può spendere. Imposta prima la regola, oppure nella stessa transazione del collegamento. La chain applica la **prima regola abilitata** dell'account a una chiave che non ne ha una propria. `update-rules` sostituisce tutte le regole, quindi includi ogni regola che l'account deve mantenere. Da riga di comando:

```bash
qorechaind tx abstractaccount update-rules <account-address> \
  '[{"id":"linked","enabled":true,"daily_limit":5000000,"per_tx_limit":1000000,"allowed_denoms":["uqor"]}]' \
  --chain-id qorechain-diana --from mykey --generate-only --gas 400000 --fees 40000uqor > rules.json
# cosign with `qorechaind tx pqc cosign`, then broadcast (see the caution at the top of this page)
```

In TypeScript con l'SDK pubblicato 0.13.0 il composer è `msg.abstractaccount.updateSpendingRules`, che controlla anche la regola in locale e rifiuta una regola abilitata che non limita nulla:

```ts
import { msg } from "@qorechain/sdk";

const rules = msg.abstractaccount.updateSpendingRules({
  owner: "qor1owner...",
  accountAddress: "qor1youraccount...",
  rules: [
    { id: "linked", enabled: true, dailyLimit: "5000000", perTxLimit: "1000000", allowedDenoms: ["uqor"] },
  ],
});
// Sign with the owner's hybrid signer and broadcast (see the SDK guide on authenticators).
```

Una chiave con sole permission che non muovono valore (`vote`, `delegate`, `withdraw`, `amm`, `ibc`, `wasm`) non ha bisogno di una regola per essere collegata. Le chiavi collegate prima dell'upgrade con permission di valore sono soggette alla stessa regola quando eseguono, quindi aggiungi una regola anche per loro.

### 3. Collegare, poi revocare {#link-revoke}

Stampa il testo per la chiave che stai collegando (non legge nulla dalla chain; il chain id viene da `--chain-id`), firmalo come nel passo 1, poi registra con la prova:

```bash
# Print the exact text the key must sign. The key argument is base64 (for an Ethereum address: the 20 address bytes).
qorechaind tx abstractaccount link-message <account-address> ed25519 <pubkey-base64> --chain-id qorechain-diana

# Register the key with its proof (base64 of the signature):
qorechaind tx abstractaccount register-authenticator <account-address> ed25519 <pubkey-base64> send <expiry-unix> phantom \
  --possession-proof <proof-base64> \
  --chain-id qorechain-diana --from mykey --generate-only --gas 400000 --fees 40000uqor > link.json
# cosign with `qorechaind tx pqc cosign`, then broadcast

# Check the result:
curl -s https://api-testnet.qore.host/qorechain/abstractaccount/v1/accounts/<account-address>/authenticators

# Revoke the key (no proof is needed; only the owner can revoke):
qorechaind tx abstractaccount revoke-authenticator <account-address> ed25519 <pubkey-base64> \
  --chain-id qorechain-diana --from mykey --generate-only --gas 400000 --fees 40000uqor > revoke.json
```

La prova è il flag `--possession-proof` di `register-authenticator`, quindi gli argomenti posizionali sono gli stessi di prima. Registrazione e revoca devono essere messaggi firmati, di primo livello, dello stesso proprietario; non possono essere avvolti in un grant authz né inviati dalla chiave collegata. La route degli autenticatori elenca la chiave con `revoked: true` una volta che la revoca è inclusa.

### 4. Leggere il risultato di un'esecuzione {#link-execution-result}

Quando una chiave collegata spende tramite `MsgExecuteEVM` o `MsgExecuteCosmos`, un fallimento dopo che la firma è stata accettata (per esempio un limite superato o una chiamata che va in revert) non fa più fallire l'intera transazione. La transazione viene inclusa con codice `0`, la risposta riporta `success=false`, il nonce della chiave viene consumato e la transazione emette un evento:

| Evento | Attributo | Significato |
| --- | --- | --- |
| `abstractaccount_execution_failed` | `account` | l'account da cui la chiave stava spendendo |
| | `lane` | la lane che è stata tentata (i valori esatti non sono elencati nella documentazione del nodo) |
| | `nonce` | il nonce che è stato consumato |
| | `reason` | perché l'esecuzione è fallita |

Leggilo da REST tramite l'hash della transazione e guarda gli eventi di `tx_response`:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<txhash> \
  | jq '.tx_response | {code, events: [.events[] | select(.type=="abstractaccount_execution_failed")]}'
```

Per trovare le esecuzioni fallite senza un hash, cerca per evento (la route risponde `200`; un risultato vuoto è `"total":"0"`):

```bash
curl -s -g "https://api-testnet.qore.host/cosmos/tx/v1beta1/txs?query=abstractaccount_execution_failed.account%3D%27<account-address>%27&limit=10"
```

Un client che controlla solo `code === 0` segnala una tale chiamata come riuscita. Controlla l'evento (oppure decodifica `success` nella risposta del messaggio) prima di dire a un utente che una spesa è andata a buon fine. Poiché il nonce viene consumato, leggi il valore successivo da `GET /qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` prima di firmare di nuovo.

### 5. Errori {#link-errors}

| Dove | Cosa vedi | Significato e cosa fare |
| --- | --- | --- |
| Registrazione | rifiutata senza una prova di possesso valida | La prova manca, ha la dimensione sbagliata oppure non si verifica per questa chain, account, schema e chiave. Ricostruisci il testo dalle cinque righe esatte e firma di nuovo. Testato sulla testnet il 12 novembre 2026 (SDK 0.13.0, chiave collegata senza prova, dopo che la regola era stata impostata; l'SDK 0.14.0 con la prova di `metaMaskPossessionProof` ha collegato la chiave con codice 0): codespace `abstractaccount`, codice 10, `possession_proof is required: a signature by the linked key over the link message` |
| Registrazione | rifiutata per una permission di valore senza una regola | Imposta prima una regola che limiti ogni denominazione (passo 2). Testato sulla testnet il 12 novembre 2026: codespace `abstractaccount`, codice 8, `a linked key with the send, evm, deploy, svm or all permission needs a spending rule on the account that bounds every denom it admits (a per_tx_limit or daily_limit, or an allowed_denoms list whose every denom has a denom_limits amount)` |
| Revoca (client) | `revokeAuthenticatorMsg` fallisce o costruisce un messaggio sbagliato | Prende la chiave pubblica come byte. Per un indirizzo Ethereum passa `Uint8Array.from(Buffer.from(pubkey_hex, "hex"))`, non una stringa `0x`. Eseguito sulla testnet il 12 novembre 2026: la revoca è riuscita con 194.244 gas usati |
| Registrazione | rifiutata per una stringa di permission sconosciuta, o per una chiave secp256k1 di 65 byte | Usa solo le undici permission della [tassonomia](#permission-taxonomy) e una chiave di 33 byte o un indirizzo di 20 byte |
| Registrazione o aggiornamento | codespace `abstractaccount` codice `8`, regola di spesa non valida | Una regola abilitata che non limita nulla, una denominazione non analizzabile o troppe voci. Correggi il JSON della regola e invia di nuovo |
| Registrazione, revoca, esecuzione | codice `9`, modulo disabilitato | Il modulo è spento su questa rete (oggi è spento sulla mainnet) |
| Esecuzione | codice `10`, permesso negato | La chiave non ha la permission per questo messaggio, oppure il messaggio è un messaggio di gestione delle chiavi che una chiave collegata non può mai inviare |
| Esecuzione | codice `6`, autenticatore scaduto | Collega di nuovo la chiave con una scadenza successiva |
| Esecuzione | codice `11`, replay rifiutato | Nonce obsoleto: interroga `auth_nonce` (o il nonce EVM dell'account sulla lane EVM) e firma di nuovo |
| Esecuzione | codice `5`, limite di spesa superato | Oltre il limite per transazione o giornaliero; attendi il giorno UTC successivo oppure alza la regola |
| Esecuzione | codice `0` con `success=false` e l'evento `abstractaccount_execution_failed` | Fallita dopo che la firma è stata accettata; il nonce è usato. Leggi `reason` (sezione 4) |
| Envelope del relayer | codespace `pqc` codice `21` | La firma ibrida del relayer stesso è fallita; non ha a che fare con la chiave collegata |

### Cosa è stato verificato {#link-example-checks}

Sulla testnet il 12 novembre 2026 (release v3.2.8, SDK 0.13.0, firma ibrida): `MsgUpdateSpendingRules` con una regola (limite giornaliero 1.000.000 uqor, limite per transazione 100.000 uqor, solo `uqor`) è riuscito con codice 0 e 186.319 gas usati. Un `MsgRegisterAuthenticator` per la permission `evm` inviato prima che la regola esistesse è stato rifiutato con codice 8, e inviato dopo la regola ma senza una prova di possesso è stato rifiutato con codice 10, con i messaggi nella tabella degli errori. L'SDK 0.13.0 non ha un campo per la prova di possesso nei suoi composer di registrazione, quindi il collegamento riuscito è stato eseguito poi con pacchetti più recenti, come descritto di seguito.

**Eseguito dall'autore della documentazione sulla testnet il 12 novembre 2026, con SDK 0.14.0 e wallet-adapter 0.6.0 (tutto con codice 0):**

* `linkAuthenticatorMsgs` ha costruito la regola di spesa (`MsgUpdateSpendingRules`) e `MsgRegisterAuthenticator` per un indirizzo Ethereum, con la prova di possesso di `metaMaskPossessionProof` (firmata qui da una chiave usa e getta tramite un provider che risponde a `personal_sign`). Entrambi i messaggi sono andati in UNA sola transazione firmata dal proprietario: 220.973 gas usati con un limite di 600.000.
* `GET /qorechain/abstractaccount/v1/accounts/{address}` ha poi mostrato `authenticators_count` 1, e `GET .../authenticators` ha elencato la chiave: schema `secp256k1`, `pubkey_hex` l'indirizzo di 20 byte, permission `evm`, `revoked` false.
* `revokeAuthenticatorMsg` è poi riuscito con 194.244 gas usati, e l'elenco ha mostrato `revoked` true. `revokeAuthenticatorMsg` prende la chiave pubblica come byte, quindi per un indirizzo Ethereum passa `Uint8Array.from(Buffer.from(pubkey_hex, "hex"))`, non una stringa `0x`.

Gli helper Phantom ed ed25519 e i builder Python, Go, Rust e Java non sono stati eseguiti.

Il codice di firma del passo 1 è stato eseguito con chiavi usa e getta: le prove ed25519 e secp256k1 compressa si verificano rispetto alle loro chiavi pubbliche e la prova EIP-191 recupera l'indirizzo di 20 byte per cui è stata creata. Le route di lettura `config`, `params`, `accounts`, `accounts/{address}`, `accounts/{address}/spending_rules`, `accounts/{address}/authenticators`, `permission_schema`, `auth_nonce/{address}/{pubkey_hex}` e la ricerca di una transazione per hash hanno tutte risposto sulla testnet (la ricerca di un hash sconosciuto risponde `404`). Le forme dei comandi `link-message` e `--possession-proof` sono tratte dal codice sorgente del nodo v3.2.8 e qui non sono state eseguite. Il codice di firma è stato eseguito con chiavi usa e getta; un vero evento `abstractaccount_execution_failed` non è mostrato.

Vedi anche: [Post-Quantum Signing](/developer-guide/post-quantum-signing), [REST and gRPC endpoints](/api-reference/rest-grpc-endpoints), [Authenticators in the SDK](/sdk/guides/authenticators), [EVM authorisation window](/developer-guide/evm-window-reference).

## Interrogare gli Account Astratti

### CLI

```bash
# Module configuration (enabled flag and limits)
qorechaind query abstractaccount config

# Get full account configuration
qorechaind query abstractaccount account <address>

# List all abstract accounts (paginated)
qorechaind query abstractaccount accounts --page-limit 10
```

Sulla mainnet l'elenco degli account è vuoto. La testnet elenca alcuni account (quattro al 27 ottobre 2026), alcuni creati prima che il flag di abilitazione venisse applicato su ogni percorso.

### JSON-RPC

> **Non ancora servito:** nessuna build del nodo rilasciata serve il namespace JSON-RPC `qor_`, quindi `qor_getAbstractAccount` restituisce `-32601` (metodo non trovato) su ogni endpoint pubblico oggi. Usa le route REST qui sopra o la CLI. Vedi [il namespace `qor_`](/api-reference/json-rpc-qor_-namespace).

### Esempio di Risposta dell'Account

La forma di un record di account astratto (valori illustrativi):

```json
{
  "address": "qor1myaccount...",
  "account_type": "session_based",
  "owner": "qor1owner...",
  "spending_rules": [
    {
      "id": "daily",
      "enabled": true,
      "daily_limit": "1000000000",
      "per_tx_limit": "100000000",
      "allowed_denoms": ["uqor"]
    }
  ]
}
```

## Recupero Sociale

`social_recovery` è un tipo di account, ma il modulo non ha transazioni di recupero: non esistono i comandi `initiate-recovery` né `approve-recovery` e nessun messaggio di recupero nel servizio di transazioni del modulo. Il recupero della chiave di un account QoreChain si effettua ri-derivando la chiave post-quantistica dell'account dalla sua mnemonica (`tx pqc recover-key`) e, se necessario, ruotandola (`tx pqc rotate-key`); vedi [Firma post-quantistica](/developer-guide/post-quantum-signing).

## Integrazione con le dApp

Quando il modulo è abilitato, l'autorizzazione tramite chiave collegata è pensata per flussi come:

* Wallet mobili dove le richieste biometriche ripetute sono fastidiose
* dApp di gaming che necessitano di firma rapida delle transazioni entro un'allowance delimitata
* Utenti Phantom o MetaMask che spendono dal proprio account QoreChain tramite un relayer

Il backend di una dApp agisce da relayer: riceve l'autorizzazione firmata della chiave collegata, la racchiude in una transazione che firma esso stesso e la trasmette. La chiave collegata può essere revocata, o può scadere, in qualsiasi momento. Finché il modulo non è abilitato sulla rete che ti interessa, usa la firma ordinaria tramite [QoreX o l'SDK](/sdk/overview).

## Prossimi Passi

* [Gestire un Validatore](/developer-guide/running-a-validator) — Configura e gestisci un nodo validatore
* [Sviluppo EVM](/developer-guide/evm-development) — Strumenti EVM, account e finestra di autorizzazione EVM
* [Interoperabilità Cross-VM](/developer-guide/cross-vm-interoperability) — Messaggistica cross-VM
