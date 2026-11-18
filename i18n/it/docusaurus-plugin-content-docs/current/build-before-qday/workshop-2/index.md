---
slug: /build-before-qday/workshop-2
title: "Workshop 2: Proteggi i fondi con una chiave post-quantistica"
sidebar_label: "Workshop 2"
sidebar_position: 3
date: 2026-11-18
---

# Workshop 2: Proteggi i fondi con una chiave post-quantistica

Il Workshop 1 ha inviato una transazione firmata con due chiavi. Il Workshop 2 usa la chiave post-quantistica per **proteggere i fondi**: prima uno smart contract che paga solo quando firma una chiave post-quantistica, poi un agente AI i cui limiti di spesa sono imposti dalla catena, poi un modo per chiedere alla catena come è stata protetta ogni transazione.

Non devi essere un esperto di sicurezza. Ogni comando qui sotto dice che cosa fa e che cosa dovresti vedere. Le tre app di esempio sono pubbliche: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), cartella `workshop-2`.

**Quanto tempo serve:** circa 40 minuti per il vault, 25 per l'agente, 10 per le domande alla catena. Puoi fare le parti in qualsiasi ordine, ma ognuna richiede il proprio account di prova.

## Cosa costruiamo {#what-we-built}

| Parte | App | Cosa dimostra |
| --- | --- | --- |
| 1 | **QDayVault** (Solidity e TypeScript) | Un vault che paga solo con una firma ML-DSA-87, verificata on-chain dal precompile `pqcVerify`. Una chiave in stile Ethereum rubata non basta per prendere i fondi. |
| 2 | **Agente che paga le bollette** (Node.js) | Un agente con una chiave propria. La catena impone i suoi limiti: solo invii, 1 QOR per pagamento, 3 QOR al giorno, 24 ore. |
| 3 | **Chiedi alla catena** (MCP e `qore-cli`) | Domande in sola lettura: questa transazione è stata firmata in modo post-quantistico, e qual è lo stato della chiave di questo account? |

Le innovazioni dietro queste app:

- **Verifica post-quantistica dentro un contratto.** La catena ha contratti integrati (precompile) a indirizzi fissi che controllano le firme ML-DSA-87 e riportano la chiave registrata di un account. Il tuo codice Solidity li chiama come qualsiasi altro contratto.
- **Limiti che vivono on-chain.** I permessi e le regole di spesa di un agente fanno parte dell'account, quindi un bug o un server rubato non può toglierli.
- **Etichette oneste.** La catena può dirti quali transazioni portavano una firma post-quantistica e quali no.

## Parole usate in questa guida {#words}

| Parola | Significato in parole semplici |
| --- | --- |
| Precompile | Un contratto integrato a un indirizzo fisso, eseguito nativamente dalla catena. `pqcVerify` è a `0x0000000000000000000000000000000000000a01` e `pqcKeyStatus` a `0x0000000000000000000000000000000000000a02`. Scrivi gli indirizzi in minuscolo: il compilatore Solidity rifiuta la scrittura con maiuscole e minuscole miste |
| ML-DSA-87 | Lo schema di firma post-quantistico (NIST FIPS 204) usato da QoreChain |
| Finestra EVM | Un permesso breve e limitato per inviare transazioni in stile Ethereum da un account. Aprirla richiede una transazione firmata con entrambe le chiavi, quindi una sola chiave Ethereum non può mai aprirne una |
| Guardiano | L'account la cui chiave post-quantistica deve firmare ogni prelievo dal vault |
| Authenticator | Una chiave collegata al tuo account con regole imposte dalla catena, come quella usata dall'agente nella parte 2 |
| Account usa e getta | Una chiave creata per questo esercizio che contiene solo QOR di prova |

:::caution Solo account testnet usa e getta
Usa chiavi create per questo workshop, che contengano QOR di prova senza valore. Non inserire mai in un file `.env` o in un comando la chiave o il codice di recupero di un account che contiene denaro vero.
:::

## Prima di iniziare {#prerequisites}

Ti servono gli strumenti di [Prima di iniziare](/build-before-qday/prerequisites) (un terminale, Node.js 22 o successivo e Git) e un browser web. Controlla Node.js:

```bash
node -v
```

Deve stampare `v22` o un numero più alto. La parte 1 richiede anche **pnpm** e **Foundry**:

```bash
npm install -g pnpm
```

Installa pnpm, lo strumento per i pacchetti usato dal vault. Controllalo con `pnpm -v`.

Foundry compila, testa e distribuisce Solidity. Installalo da [getfoundry.sh](https://getfoundry.sh): la pagina dà un comando per il tuo sistema, poi esegui:

```bash
foundryup
```

Scarica gli strumenti di Foundry. Controlla con `forge --version` e `cast --version`.

Scarica il codice di esempio:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-2
```

La prima riga scarica gli esempi in una cartella chiamata `build-before-qday`. La seconda entra nella cartella `workshop-2`, che contiene le tre app.

Per i QOR di prova usi il [faucet](/dashboard/faucet) della dashboard. Tutte e tre le app funzionano solo sulla testnet di QoreChain `qorechain-diana`.

## Parte 1: QDayVault, un vault che sopravvive a una chiave rubata {#part-1}

Codice: [workshop-2/01-qday-vault](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/01-qday-vault). Una normale chiave di wallet (la chiave secp256k1 che usa MetaMask) un giorno potrebbe essere violata da un computer quantistico. Questo vault è costruito in modo che una chiave rubata di quel tipo non basti: i fondi escono solo quando il **guardiano** firma il prelievo con una chiave post-quantistica, e il contratto controlla da sé quella firma, on-chain. Chiunque può inviare il prelievo firmato. Conta la firma, non chi lo invia.

```bash
cd 01-qday-vault
```

Entra nella cartella del vault.

### Come funziona il contratto {#vault-how}

Apri `src/QDayVault.sol`. La funzione importante è `withdraw`:

```solidity
(bool registered,, bytes memory pubkey, bool proven) = PQC_KEYS.pqcKeyStatus(guardian);
if (!registered || pubkey.length == 0) revert GuardianKeyNotRegistered();
if (!proven) revert GuardianKeyNotProven();

uint256 n = nonce;
if (!PQC_VERIFY.pqcVerify(pubkey, mldsaSignature, withdrawalMessage(to, amount, n))) revert BadPqcSignature();

nonce = n + 1;
emit Withdrawn(to, amount, n);
(bool ok,) = to.call{value: amount}("");
if (!ok) revert TransferFailed();
```

1. **Legge la chiave del guardiano dalla catena.** La chiave è di 2.592 byte, quindi il contratto non la memorizza. Se il guardiano ruota la chiave on-chain, il vault la segue.
2. **Rifiuta una chiave mai dimostrata.** "Dimostrata" significa che l'account ha firmato una prova di possesso quando ha registrato la chiave. Senza questo controllo qualcuno potrebbe registrare una chiave che non possiede.
3. **Verifica la firma su un messaggio esatto.** Il messaggio lega un tag fisso, l'id della catena, l'indirizzo del vault, il destinatario, l'importo e il nonce, quindi una firma vale per un solo prelievo, su un solo vault, su una sola catena, una sola volta.
4. **Aumenta il nonce prima di inviare i fondi.** La stessa firma non può essere usata due volte, e lo stato cambia prima della chiamata esterna, il che protegge dalla rientranza.
5. **Controlla che il trasferimento sia riuscito.** Se è fallito, l'intera transazione viene annullata.

### Passaggio 1: esegui i test (non serve un account) {#vault-tests}

```bash
pnpm install
```

Scarica i pacchetti JavaScript elencati in `package.json` (l'SDK di QoreChain, viem, tsx).

```bash
pnpm forge-std
```

Scarica `forge-std`, la libreria standard di Foundry, in `lib/`. I test e lo script di deploy la importano. Lo fai una sola volta.

```bash
forge test
```

Compila il contratto ed esegue gli 8 test in `test/QDayVault.t.sol`. Dovresti vedere `8 passed; 0 failed`. La catena di test locale non ha i precompile di QoreChain, quindi i test mettono piccoli contratti sostitutivi ai due indirizzi dei precompile con `vm.etch`. Controllano la logica: una firma valida paga, una non valida viene rifiutata, una firma vale una volta sola, una chiave non dimostrata viene rifiutata. I veri precompile entrano in gioco nei passaggi successivi.

### Passaggio 2: crea un account solo testnet {#vault-account}

```bash
cast wallet new
```

Stampa un nuovo indirizzo e una nuova chiave privata. Usali solo per la testnet.

Su macOS e Linux:

```bash
cp .env.example .env
```

Su Windows PowerShell usa `Copy-Item .env.example .env`. Crea il tuo file di impostazioni. `.env` è ignorato da Git, quindi non viene mai committato. Apri `.env` e imposta `PRIVATE_KEY` con la chiave privata di `cast wallet new`.

```bash
pnpm window recovery-code
```

Stampa un codice di recupero che inizia con `QRC1-`. Da esso nasce la tua chiave post-quantistica. Mettilo in `.env` come `QORE_PQC_RECOVERY_CODE` e tieni una copia in un posto sicuro, separata dalla chiave privata. Usa sempre lo stesso codice: un codice diverso significa una chiave post-quantistica diversa.

### Passaggio 3: finanzia l'account {#vault-fund}

```bash
pnpm window status
```

Stampa il tuo account in due forme, `0x...` e `qor1...`. Sono lo stesso account. Incolla l'indirizzo `qor1...` nel [faucet](/dashboard/faucet).

### Passaggio 4: registra la tua chiave post-quantistica, una sola volta {#vault-register}

```bash
pnpm window register
```

Mette la tua chiave pubblica ML-DSA-87 on-chain, con una prova che ne sei il proprietario. Lo fai una sola volta per account. Dopo, `pnpm window status` mostra `PQC key: registered`. È l'unica transazione che la catena accetta con la sola chiave classica, perché la catena non conosce ancora la tua chiave post-quantistica. Per ciò che la registrazione lega davvero, vedi [Come la tua chiave post-quantistica viene legata al tuo account](/build-before-qday/key-binding).

### Passaggio 5: apri una finestra EVM limitata {#vault-window}

```bash
pnpm window:scoped
```

Invia una transazione firmata con entrambe le chiavi che apre una finestra EVM di **600 blocchi (circa 15 minuti), 3 transazioni e 2 QOR** di valore più commissioni. Basta per il deploy e un prelievo, e niente di più. Se la tua chiave classica viene rubata mentre la finestra è aperta, il danno è limitato a quel budget; quando la finestra finisce, la corsia in stile Ethereum si chiude di nuovo.

**Aspetta circa 10 secondi** prima del passaggio successivo. Aprire la finestra ha usato un nonce del tuo account, e il blocco successivo deve includerlo per primo.

### Passaggio 6: distribuisci il vault {#vault-deploy}

```bash
pnpm deploy:testnet
```

Esegue lo script Foundry `script/QDayVault.s.sol`: distribuisce il vault con un deposito di 1 QOR e rende **te** il guardiano. Cerca `QDayVault 0x...` nell'output. Nell'output di Foundry "ETH" significa QOR.

```bash
pnpm vault status
```

Mostra l'indirizzo del vault, il suo saldo (1 QOR), il guardiano (tu) e il nonce (0).

### Passaggio 7: l'attacco, come simulazione {#vault-attack}

```bash
pnpm vault attack 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

Interpreta un attaccante che ha la tua chiave classica ma non la tua chiave post-quantistica. Firma il prelievo con una chiave ML-DSA-87 casuale e chiede alla catena che cosa succederebbe. Dovresti vedere `BLOCKED by the vault: BadPqcSignature`. È solo una simulazione, quindi non costa nulla e non usa la tua finestra. Come destinatario va bene qualsiasi indirizzo.

### Passaggio 8: il prelievo vero {#vault-withdraw}

```bash
pnpm vault withdraw 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

Firma il prelievo con **la tua** chiave ML-DSA-87 (un messaggio di 157 byte, una firma di 4.627 byte) e lo invia. Il vault la controlla con `pqcVerify` e paga. Dovresti vedere `WITHDRAWN tx 0x...` e un link all'explorer.

```bash
pnpm window status
```

Mostra che cosa resta della finestra: 1 transazione, esattamente il budget che le hai dato.

### Se qualcosa va storto {#vault-troubleshooting}

| Cosa vedi | Che cosa significa | Che cosa fare |
| --- | --- | --- |
| `REFUSED: Missing or invalid parameters` nel deploy o nel prelievo | Non c'è una finestra EVM attiva: è scaduta o è stata esaurita | Esegui `pnpm window status`, poi `pnpm window:scoped`, aspetta 10 secondi e riprova |
| `does not exist on chain yet` | L'account non ha ancora QOR | Usa il faucet (passaggio 3) |
| `PQC key: not registered` | Il passaggio 4 è stato saltato | Esegui `pnpm window register` |
| `GuardianKeyNotRegistered` | Il guardiano non ha una chiave ML-DSA-87 on-chain | Registrala (passaggio 4) |
| `No vault yet` | Da questa cartella non è stato distribuito nulla | Esegui il passaggio 6, oppure imposta `VAULT_ADDRESS` in `.env` |

### Fai l'audit del contratto prima di distribuirlo {#vault-audit}

La cartella `audit/` contiene la prima bozza del contratto, con bug veri, e la versione corretta. Mostra un flusso in due fasi con il [Contract Auditor](/dashboard/contract-auditor) della dashboard: fai l'audit della bozza, correggi ogni risultato con un test, fai l'audit del contratto finale e conserva entrambi i report. Un audit automatico non sostituisce un audit umano prima della mainnet. Per Solidity la valutazione di prontezza quantistica mostra "Not scored", ed è normale: sull'EVM il controllo post-quantistico lo fa la catena tramite il precompile. Vedi `audit/README.md` nella cartella e la pagina [Precompile EVM](/developer-guide/evm-precompiles) per gli indirizzi dei precompile e il gas.

## Parte 2: un agente che paga le bollette con limiti imposti dalla catena {#part-2}

Codice: [workshop-2/02-pq-agent](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/02-pq-agent). Se dai a un bot la tua chiave privata, i suoi limiti di spesa vivono nel suo stesso codice. Un bug, una prompt injection o un server rubato, e i limiti spariscono. Su QoreChain i limiti vivono **on-chain**: l'agente riceve una chiave propria, collegata al tuo account con regole che la catena controlla a ogni pagamento.

Torna indietro di una cartella ed entra in quella dell'agente:

```bash
cd ../02-pq-agent
```

### Tre chiavi, tre ruoli {#agent-keys}

| Chiave | Chi la tiene | Che cosa può fare |
| --- | --- | --- |
| **Proprietario** | Tu | Il tuo account, firmato con entrambe le chiavi. Custodisce i fondi, collega l'agente e scrive le regole |
| **Chiave dell'agente** | L'agente | Una chiave ed25519. Può chiedere di spendere dall'account del proprietario, solo entro le regole. Non custodisce fondi |
| **Wallet del gas** | L'agente | Un piccolo account separato che invia le richieste dell'agente e paga le commissioni. Non custodisce mai i fondi del proprietario |

Le regole di questo esempio: l'agente può solo **inviare QOR**, al massimo **1 QOR per pagamento** e **3 QOR al giorno**, e il collegamento **scade dopo 24 ore**. Apri `agent.mjs` e guarda il comando `pay`: non contiene nessun controllo dei limiti. L'agente prova semplicemente a pagare. Ogni limite che vedrai viene dalla catena.

### Passaggio 1: installa e crea le chiavi {#agent-keys-create}

```bash
npm install
```

Scarica i pacchetti in `package.json`: l'SDK di QoreChain, CosmJS e `@noble/curves` per la chiave ed25519.

```bash
node agent.mjs init
```

Crea la chiave ed25519 dell'agente e il suo wallet del gas e li salva in `~/.config/qday/agent.env`, leggibile solo da te. Stampa l'indirizzo `qor1...` del wallet del gas.

```bash
node agent.mjs owner-init
```

Crea un account proprietario usa e getta per la testnet e lo salva in `~/.config/qday/owner.env`. Per usare un account che hai già, metti invece `QORE_MNEMONIC="..."` in quel file. Le chiavi non lasciano mai il tuo computer, non vengono mai stampate e non devono mai finire in un repository.

```bash
node agent.mjs whoami
```

Stampa i tre indirizzi: proprietario, chiave dell'agente e wallet del gas.

### Passaggio 2: finanzia il proprietario e il wallet del gas {#agent-fund}

Incolla ogni indirizzo `qor1...` nel [faucet](/dashboard/faucet). Il proprietario ha bisogno di qualche QOR per le bollette, il wallet del gas di circa 3 QOR per le commissioni.

```bash
node agent.mjs balance
```

Controlla che entrambi abbiano QOR.

### Passaggio 3: registra le chiavi post-quantistiche, una sola volta {#agent-register}

```bash
node agent.mjs register owner
node agent.mjs register gas
```

Ogni account mette la propria chiave pubblica ML-DSA-87 on-chain con una prova di possesso. Da quel momento entrambi firmano ogni transazione con due chiavi.

### Passaggio 4: collega l'agente, con limiti {#agent-link}

```bash
node agent.mjs link 1 3
```

Il proprietario invia **una** transazione, firmata con entrambe le chiavi, che collega la chiave ed25519 dell'agente all'account del proprietario (la chiave dell'agente firma una prova di consenso, così nessuno può collegare una chiave che non possiede), le dà un permesso (`send`), scrive una regola di spesa (1 QOR per pagamento, 3 QOR al giorno, solo `uqor`) e imposta una scadenza di 24 ore. Aggiungi un terzo numero per un numero diverso di ore, al massimo 30 giorni. Dovresti vedere `agent linked` e `hybrid ML-DSA-87: verified`.

```bash
node agent.mjs rules
```

Rilegge dalla catena ciò che impone: la regola, il permesso, la scadenza e quanti pagamenti ha fatto l'agente. Per come funziona il collegamento, vedi [Authenticator](/sdk/guides/authenticators).

### Passaggio 5: lascia che l'agente paghi le bollette {#agent-run}

```bash
node agent.mjs run bills.json
```

L'agente prova a pagare le cinque bollette in `bills.json`, 8,2 QOR in totale. Per ognuna firma una richiesta con la sua chiave ed25519 e il wallet del gas la invia. Dovresti vedere:

| Bolletta | Importo | Risultato | Perché |
| --- | --- | --- | --- |
| Server hosting | 0.8 | PAID | |
| Domain renewal | 0.5 | PAID | |
| Invoice from an unknown sender | 5 | REFUSED BY THE CHAIN | Oltre il limite di 1 QOR per pagamento |
| API credits | 1 | PAID | |
| Monitoring | 0.9 | REFUSED BY THE CHAIN | Oltre il limite giornaliero di 3 QOR: 2,3 spesi, 0,7 rimasti |

I rifiuti vengono dalla catena, non dal codice dell'agente. Un dettaglio nell'explorer: un pagamento rifiutato appare comunque come una transazione con codice 0. La transazione in sé è stata accettata in un blocco, ma il pagamento al suo interno è stato rifiutato. `agent.mjs` legge il risultato del pagamento interno, ed è quello che stampa.

### Passaggio 6: revoca l'agente {#agent-revoke}

```bash
node agent.mjs revoke
```

Una transazione del proprietario disattiva la chiave dell'agente.

```bash
node agent.mjs pay qor1s90l5nnwfjznf4cdj3p4pf2p7uk32axf8800yu 0.1 "after revoke"
```

Prova un altro pagamento. Dovresti vedere `REFUSED BY THE CHAIN: linked key is unbound or revoked`. Quindi, se un agente viene compromesso, al massimo puoi perdere il suo limite giornaliero, e una sola transazione lo ferma.

Per rieseguire la demo, sposta `~/.config/qday/agent.env` altrove (dopo aver spostato fuori i QOR del wallet del gas) ed esegui di nuovo `node agent.mjs init`.

Tutti i comandi: `init`, `owner-init`, `whoami`, `register owner|gas`, `link <perTxQOR> <dailyQOR> [hours]`, `rules`, `pay <to> <QOR> [memo]`, `run <bills.json>`, `revoke`, `balance`. Puoi cambiare `QORE_REST`, `QORE_RPC` (il tuo nodo) e `QDAY_DIR` (dove stanno i file delle chiavi) con variabili d'ambiente.

## Parte 3: chiedi alla catena, con MCP e qore-cli {#part-3}

Codice: [workshop-2/03-mcp](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/03-mcp). MCP (Model Context Protocol) è un modo standard con cui assistenti di programmazione e altri strumenti AI usano strumenti esterni. Il server MCP di QoreChain, `@qorechain/mcp`, dà loro **accesso in lettura** alla catena: blocchi, transazioni, account, lo stato della chiave post-quantistica di un account, stime delle commissioni e simulazioni. Ha 14 strumenti. **Non firma mai, non custodisce chiavi e non trasmette mai**: se chiedi un trasferimento, ti dà un documento non firmato e lo firmi nel tuo wallet.

### Aggiungilo al tuo client MCP {#mcp-config}

Funziona qualsiasi client MCP. La maggior parte usa una configurazione come questa:

```json
{
  "mcpServers": {
    "qorechain": {
      "command": "npx",
      "args": ["-y", "@qorechain/mcp"]
    }
  }
}
```

`npx -y` scarica il server la prima volta e lo avvia. Il client poi elenca i suoi strumenti, per esempio `get_pq_status`, `get_transaction`, `get_address_info`, `read_contract`, `estimate_fee`, `simulate_tx` e `prepare_transfer`.

### Le stesse domande dal terminale {#mcp-cli}

`qore-cli` dà le stesse risposte senza un client AI. Fai tre domande su ciò che hai costruito:

```bash
npx -y @qorechain/qore-cli pq status <hash of an agent payment>
```

Il pagamento dell'agente è stato firmato in modo post-quantistico? Atteso: `tier: pqc`, `verified: true`. È una transazione nativa, firmata con entrambe le chiavi e controllata dalla catena.

```bash
npx -y @qorechain/qore-cli pq status <hash of the vault withdrawal>
```

E il prelievo dal vault? Atteso: `tier: classical`, `reason: evm_lane`. È una risposta onesta: le transazioni in stile Ethereum non portano una firma post-quantistica. Sono protette dalla finestra EVM e, qui, dal contratto del vault, che controlla da sé una firma ML-DSA-87.

```bash
npx -y @qorechain/qore-cli pq status <your 0x or qor1 address>
```

E l'account? Atteso: `registered: true`, `possession_proven: true`, e la finestra EVM con ciò che ne resta.

### Un client visuale (facoltativo) {#mcp-inspector}

Per esplorare gli strumenti con i clic, senza un assistente AI:

```bash
npx -y @modelcontextprotocol/inspector npx -y @qorechain/mcp
```

Poi scegli **Connect**, **Tools**, **List Tools**, scegli `get_pq_status`, metti un indirizzo o un hash in `target` e scegli **Run Tool**.

## Che cosa hai ora {#done}

Un contratto che paga solo contro una firma post-quantistica, un agente i cui limiti sono imposti dalla catena e gli strumenti per controllare come è stata protetta qualsiasi transazione. Usa uno qualsiasi di essi come base per la tua consegna: vedi [Build Before Q-Day](/build-before-qday/overview) per i livelli e le regole.
