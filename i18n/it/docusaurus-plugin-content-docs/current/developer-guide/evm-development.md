---
slug: /developer-guide/evm-development
title: Sviluppo EVM
sidebar_label: Sviluppo EVM
sidebar_position: 2
---

# Sviluppo EVM

QoreChain esegue un ambiente di esecuzione completamente compatibile con EVM sul QoreChain EVM Engine, che consente di distribuire e interagire con smart contract Solidity utilizzando strumenti familiari. Il modulo EVM espone un'interfaccia JSON-RPC sulla **porta 8545** (WebSocket sulla **8546**) che supporta i flussi di lavoro di sviluppo Ethereum standard.

:::note
Gli esempi seguenti fanno riferimento alla mainnet **`qorechain-vladi`** (Chain ID EVM **9801**), attiva dal 7 giugno 2026, che al momento della stesura esegue la release di nodo **v3.2.6** (applicata dalla proposta di governance 15 all'altezza 4,020,000 il 4 novembre 2026; la v3.2.5 era stata applicata all'altezza 3,906,833 il 29 ottobre 2026, la v3.2.4 all'altezza 3,742,566 il 23 ottobre 2026 e la v3.2.3 all'altezza 3,662,051 il 20 ottobre 2026). La testnet **`qorechain-diana`** esegue la **v3.2.8** dal 12 novembre 2026 (la v3.2.4 dall'altezza 8,337,253 il 19 ottobre 2026, la v3.2.5 all'altezza 8,890,800 il 26 ottobre, la v3.2.6 all'altezza 8,970,638 il 27 ottobre, la v3.2.7 all'altezza 9,594,600 il 6 novembre, la v3.2.8 all'altezza 9,929,500 il 12 novembre); lì usa il Chain ID EVM **9800**. Dove questa pagina descrive qualcosa che differisce tra le reti (i precompile della testnet, i token di test Fest), lo indica. Gli esempi di codice usano `http://localhost:8545` per un nodo gestito da te; l'endpoint pubblico della mainnet è `https://evm.qore.host` e quello della testnet è `https://evm-testnet.qore.host`.
:::

:::caution Una transazione EVM richiede una chiave PQC registrata e una finestra di autorizzazione aperta
A partire dall'upgrade v3.2.0 (altezza 2,981,742 sulla mainnet, altezza 5,920,000 sulla testnet) la corsia EVM ammette una transazione solo da un account che abbia **(1) una chiave post-quantistica ML-DSA-87 registrata** e **(2) una finestra di autorizzazione EVM aperta** che abbia ancora spazio per essa. Firmi con strumenti ordinari (MetaMask, ethers.js, Hardhat, Foundry), ma senza una chiave registrata e una finestra aperta `eth_sendRawTransaction` viene rifiutato (codespace `pqc`, codici 26, 27 o 28). Le letture, `eth_call` e la stima del gas non richiedono né l'una né l'altra. Vedi [Finestra di autorizzazione EVM](#evm-window) qui sotto e la guida passo passo in [La tua prima transazione](/getting-started/first-transaction#evm-window).

Sulla mainnet, dalla v3.2.2, valgono altre due regole: **le transazioni non protette (pre-EIP-155) vengono rifiutate**, sia dal mempool del nodo sia nell'esecuzione del blocco, quindi firma con un chain id (lo fanno tutti i wallet e le librerie attuali); e **gli account di modulo non possono essere rivendicati tramite l'EVM**.
:::

---

## Endpoint JSON-RPC

| Proprietà                | Valore                                     |
| ------------------------ | ------------------------------------------ |
| URL predefinito           | `http://localhost:8545`                    |
| URL WebSocket             | `ws://localhost:8546`                      |
| Namespace supportati      | `eth_`, `web3_`, `net_`, `txpool_`          |
| Chain ID (mainnet)        | `9801` (`qorechain-vladi`)                 |
| Chain ID (testnet)        | `9800` (`qorechain-diana`)                 |
| Simbolo della valuta      | `QOR`                                      |

Le letture specifiche di QoreChain sono servite tramite REST (`api.qore.host`); il namespace JSON-RPC `qor_` descritto [più sotto](#custom-qor_-namespace) **non è abilitato** sugli endpoint pubblici né nella configurazione predefinita del nodo. L'elenco `api` predefinito di un nodo appena inizializzato (v3.2.3 e successive) è `eth,net,web3`; `txpool` è opt-in, perché pubblica le transazioni in sospeso del nodo.

Dalla release di nodo v3.2.4 (mainnet dal 23 ottobre 2026, testnet dal 19 ottobre 2026) un nodo limita il proprio server JSON-RPC: i corpi delle richieste oltre 256 KiB vengono rifiutati (HTTP 413), non più di 256 richieste vengono servite contemporaneamente (oltre, HTTP 503), e un filtro `eth_getLogs` o `eth_newFilter` con più di 4 posizioni di topic, 1000 alternative in una posizione o 1000 indirizzi viene rifiutato. I limiti sono impostazioni locali al nodo nella sezione `[json-rpc]` di `app.toml`; vedi [Esecuzione di un nodo](/developer-guide/running-a-node#exposing-endpoints-for-integration).

---

## Configurazione del wallet (MetaMask)

Aggiungi QoreChain come rete personalizzata in MetaMask:

| Campo                    | Valore Mainnet               | Valore Testnet           |
| ------------------------ | ----------------------------- | ------------------------- |
| Nome rete                | QoreChain (qorechain-vladi)  | QoreChain Diana           |
| URL RPC                  | `https://evm.qore.host`       | `https://evm-testnet.qore.host` |
| Chain ID                 | `9801`                        | `9800`                    |
| Simbolo valuta           | `QOR`                         | `QOR`                     |
| URL Block Explorer       | `https://explore.qore.network` | *(facoltativo)* |

L'invio da MetaMask richiede inoltre una chiave PQC registrata e una [finestra di autorizzazione EVM](#evm-window) aperta sull'account.

---

## Hardhat

Installa Hardhat e configura il tuo `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    qorechain: {
      url: "http://localhost:8545",
      accounts: ["0xYOUR_PRIVATE_KEY_HEX"],
      chainId: 9801, // mainnet qorechain-vladi (use 9800 for qorechain-diana testnet)
    },
  },
};
```

Distribuisci un contratto (l'account che effettua il deploy richiede una chiave PQC registrata e una [finestra di autorizzazione](#evm-window) aperta; un deploy conta come una transazione EVM nella finestra):

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

Esegui i test sull'EVM di QoreChain:

```bash
npx hardhat test --network qorechain
```

---

## Foundry

Crea e distribuisci un contratto con Foundry:

```bash
# Create a new project
forge init my-project && cd my-project

# Build
forge build

# Deploy
forge create --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX \
  src/MyContract.sol:MyContract

# Interact
cast call <contract-address> "myFunction()" --rpc-url http://localhost:8545
cast send <contract-address> "setValue(uint256)" 42 \
  --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX
```

---

## Ethers.js

```javascript
import { ethers } from "ethers";

// Connect to QoreChain EVM
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get chain info
const network = await provider.getNetwork();
console.log("Chain ID:", network.chainId); // 9801n on mainnet (9800n on testnet)

// Read balance
const balance = await provider.getBalance("0xYourAddress");
console.log("Balance:", ethers.formatEther(balance), "QOR");

// Send transaction
const wallet = new ethers.Wallet("0xYOUR_PRIVATE_KEY_HEX", provider);
const tx = await wallet.sendTransaction({
  to: "0xRecipientAddress",
  value: ethers.parseEther("1.0"),
});
await tx.wait();
```

---

## Modello del gas

QoreChain utilizza un modello a **base fee dinamica EIP-1559** per le transazioni EVM:

* La base fee si adegua per ogni blocco in base all'utilizzo
* Gli utenti possono impostare `maxFeePerGas` e `maxPriorityFeePerGas`
* Le priority fee vanno al proponente del blocco

### Limiti di gas {#gas-limits}

Dalla release v3.2.8 (solo testnet fino a un successivo upgrade della mainnet) una singola transazione EVM può impostare un gas limit di al massimo **30.000.000**, e le esecuzioni EVM avviate da un messaggio Cosmos (una chiamata cross-VM, una conversione ERC-20, il trasferimento di un pacchetto IBC in arrivo) condividono lo stesso budget. Una transazione oltre il limite viene rifiutata prima di essere eseguita. Leggi i valori in vigore da `GET /qorechain/pqc/v1/evm_limits` (gRPC `EVMLimitsQuery/EVMLimits`) e limita il gas che i tuoi strumenti inviano, in particolare il gas che una dApp passa al tuo wallet senza controllo. Una transazione Cosmos ha un proprio limite di 50.000.000 di gas. I trasferimenti semplici (21.000 gas) e le normali chiamate a token sono ben al di sotto di entrambi.

### Ponte di denominazione

Il token nativo QOR ha **6 cifre decimali** (`uqor`), mentre l'EVM prevede **18 cifre decimali**. Il modulo `x/precisebank` gestisce la conversione in modo trasparente:

| Contesto        | Denominazione | Decimali | Esempio                |
| ---------------- | ------------- | -------- | ----------------------- |
| Chain nativa      | `uqor`        | 6        | `1000000 uqor = 1 QOR` |
| EVM               | wei           | 18       | `1e18 wei = 1 QOR`      |

Questa conversione è trasparente: quando controlli un saldo tramite `eth_getBalance`, la risposta è denominata in wei a 18 decimali. Quando lo stesso account viene interrogato tramite il modulo bank nativo, il saldo appare in `uqor` a 6 decimali.

---

## Coppie di token ERC-20 {#erc20-token-pairs}

Il modulo `x/erc20` fornisce **coppie di token** tra le denominazioni native Cosmos SDK e i contratti ERC-20:

* I token nativi possono essere usati all'interno dei contratti EVM come ERC-20
* I token ERC-20 distribuiti sull'EVM possono essere convertiti in denominazioni native
* La conversione è bidirezionale e viene gestita a livello di protocollo

```bash
# Register a native ERC-20 contract as a token pair (permissioned: `permissionless_registration` is false)
qorechaind tx erc20 register-erc20 <contract-addr> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey --gas 400000 --fees 40000uqor

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey --gas 400000 --fees 40000uqor
```

Queste sono transazioni della corsia Cosmos: sulle reti live richiedono anche la cofirma post-quantistica ibrida (costruisci con `--generate-only`, poi `qorechaind tx pqc cosign`; vedi [Firma post-quantistica](/developer-guide/post-quantum-signing)). Il semplice comando `convert-erc20` qui sopra viene rifiutato nella release di nodo v3.2.6 perché la CLI scrive un mittente `0x`; vedi [Conversione tra le due forme](#fest-convert) per la forma che funziona. Le coppie di token vengono registrate secondo una policy con permessi (le registra la governance). Al momento della stesura sulla mainnet non ne esiste nessuna; la testnet ha i token di test Fest nella [sezione successiva](#fest-tokens).

## Token di test Fest e conversione ERC20 {#fest-tokens}

:::note Solo testnet, senza valore
I token di questa sezione esistono solo sulla testnet `qorechain-diana` (EVM chain ID 9800). Sono token di test per i builder e non hanno valore. La mainnet non ha alcuna coppia di token ERC-20 (verificato il 27 ottobre 2026), quindi nessuno dei denom qui sotto esiste lì.
:::

Il 27 ottobre 2026 la governance della testnet (proposta 26) ha registrato tre contratti ERC-20 come coppie di token. Danno ai builder un secondo token da abbinare a QOR in un [pool AMM](/api-reference/rest-grpc-endpoints#amm-module):

| Token | Contratto ERC-20 (EIP-55) | Decimali | Denom bank |
| ----- | ------------------------- | -------- | ---------- |
| fUSD (FestUSD) | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | 6  | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH (FestETH) | `0x02292293c13880a26242690eb70a0e42B8E91c28` | 18 | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC (FestBTC) | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | 8  | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

* **Il denom bank è `erc20:<address>` con i due punti, e l'indirizzo deve essere nell'esatta grafia EIP-55 con maiuscole e minuscole miste mostrata.** I denom distinguono maiuscole e minuscole: `erc20:0x97143b771d34...` (minuscolo) è una stringa diversa, e una query per essa risponde `404`. Copia il denom da `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata`, che elenca i tre token con il loro `symbol` (`fUSD`, `fETH`, `fBTC`), il nome `display` (`FestUSD`, `FestETH`, `FestBTC`) e i decimali.
* **Il faucet paga in coin bank.** Per usare un token Fest da EVM (MetaMask, Solidity), converti prima il coin bank nella sua forma ERC-20 con `MsgConvertCoin`; per riportare un saldo ERC-20 in forma bank (ad esempio per abbinarlo nell'AMM), usa `MsgConvertERC20`. Entrambi sono descritti di seguito.
* **I token esistono in due forme.** Un saldo ERC-20 si legge con `balanceOf` del contratto tramite JSON-RPC EVM; il saldo convertito è un coin bank, che si legge con `GET /cosmos/bank/v1beta1/balances/{address}`. Solo la forma coin bank può essere abbinata nell'AMM. La conversione sposta valore tra le due forme; non lo crea.
* **Gli importi usano i decimali propri del token** (6, 18 e 8 per fUSD, fETH e fBTC), non i 6 decimali di `uqor`.

```bash
curl -s https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs
curl -s "https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs/0x97143B771D34ddb9130b807b135Ae675A5a963CA"
```

### Conversione tra le due forme {#fest-convert}

Entrambi i messaggi di conversione sono transazioni della corsia Cosmos: richiedono la tua chiave post-quantistica registrata e la cofirma ibrida, come qualsiasi altra transazione nativa (costruisci, poi `qorechaind tx pqc cosign`; vedi [Firma post-quantistica](/developer-guide/post-quantum-signing)). Le fee devono essere almeno gas × 0.1 uqor.

:::note Che cosa è stato eseguito
Le letture REST di questa pagina (`token_pairs`, `denoms_metadata`) sono state eseguite sulla testnet il 27 ottobre 2026. I due comandi di conversione qui sotto **non** sono stati eseguiti da capo a fondo per questa pagina: le forme dei messaggi e la regola sul mittente provengono dal sorgente del nodo v3.2.6 e dal riferimento del team della chain. Considerali la forma documentata e conferma prima con un importo piccolo.
:::

**Da coin bank a ERC-20: `MsgConvertCoin`.** Il `coin` è l'esatto denom bank, che distingue maiuscole e minuscole (`erc20:<EIP-55 address>`), il `sender` è il tuo indirizzo `qor1...` (il firmatario) e il `receiver` è un indirizzo `0x...` che deterrà l'ERC-20. Usa circa 432,000 gas; imposta un limite di gas di 600,000.

```bash
# Write the message by hand (not run for this page)
cat > convert-coin.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertCoin",
      "coin": { "denom": "erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA", "amount": "1000000" },
      "receiver": "0xYOUR_EVM_ADDRESS",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-coin.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**Da ERC-20 a coin bank: `MsgConvertERC20`.** Anche il suo campo `sender` deve essere l'indirizzo bech32 `qor1...` dell'account. Un mittente `0x` viene rifiutato con `decoding bech32 failed`. Nella release di nodo v3.2.6 (oggi la mainnet) il comando CLI `qorechaind tx erc20 convert-erc20` (il semplice esempio in [Coppie di token ERC-20](#erc20-token-pairs)) scrive il mittente in forma `0x`, quindi viene rifiutato per questo motivo: non usarlo lì. Dalla v3.2.7 (testnet dal 6 novembre 2026, non ancora sulla mainnet) il comando scrive il mittente in forma `qor1`. Su entrambe le release puoi costruire tu il messaggio con l'indirizzo `qor1` come mittente, nello stesso modo di sopra:

```bash
# Workaround: write the message with a qor1 sender (not run for this page)
cat > convert-erc20.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertERC20",
      "contract_address": "0x97143B771D34ddb9130b807b135Ae675A5a963CA",
      "amount": "1000000",
      "receiver": "qor1youraddr...",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-erc20.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Qui `receiver` è l'account `qor1...` che riceve il coin bank (il modulo accetta la forma bech32 per il destinatario di una conversione in coin bank). L'importo è nelle unità base del token (6, 18 o 8 decimali). Copia il denom per `MsgConvertCoin` solo da `denoms_metadata`; la forma minuscola viene rifiutata con `token pair not found`.

---

## Compatibilità PQC ed EVM

Le transazioni EVM sono firmate con **ECDSA classico (secp256k1)**, quindi MetaMask, Hardhat, Foundry, ethers.js e gli altri strumenti standard le costruiscono e le firmano senza modifiche. Ciò che è cambiato con la **v3.2.0** è l'*ammissione*: una transazione viene accettata solo se il mittente possiede una chiave post-quantistica registrata e una finestra di autorizzazione attiva (sezione successiva). La registrazione di una chiave e l'apertura di una finestra sono transazioni della corsia Cosmos e richiedono la firma ibrida (ML-DSA-87 + secp256k1).

Per la sicurezza post-quantistica all'interno dei contratti:

* Il **precompilato PQC Verify** (`0x0000...0A01`) verifica on-chain le firme ML-DSA-87 da Solidity. È **attivo sulla testnet** (attivato dalla proposta di governance 21, approvata il 27 ottobre 2026) e **non attivo sulla mainnet** al momento della stesura. Vedi [Precompilati EVM: stato della rete](/developer-guide/evm-precompiles#network-status).
* I **messaggi cross-VM** dall'EVM verso QoreChain Native o SVM sono transazioni della corsia Cosmos e portano la firma ibrida come tutte le altre; vedi [Interoperabilità cross-VM](/developer-guide/cross-vm-interoperability) per la loro disponibilità attuale.

Dalla release di nodo v3.2.7 (testnet dal 6 novembre 2026, non ancora sulla mainnet), `eth_getBlockByNumber`, `eth_getBlockReceipts` e `eth_feeHistory` sono più affidabili, anche per i blocchi che contengono una transazione EVM fallita. Il 7 novembre 2026 i tre metodi hanno risposto normalmente sull'endpoint pubblico della testnet.

---

## Finestra di autorizzazione EVM {#evm-window}

**Tipo di chiave.** La lane EVM e la finestra funzionano solo con una chiave `eth_secp256k1`, il tipo di chiave di Ethereum (coin type 60). Una chiave Cosmos secp256k1 standard (coin type 118, l'account `qor1…` predefinito in QoreX) non può firmare per il proprio indirizzo EVM, quindi una finestra aperta su un account di questo tipo non ottiene nulla. In QoreX usa **Add an Ethereum account (coin 60)** sotto Your accounts; vedi [Ripristinare una frase da MetaMask o dalla Dashboard](/qorex/getting-started#restore-dashboard).

Dalla v3.2.7 (testnet dal 6 novembre 2026, non ancora sulla mainnet) una transazione EVM che consuma la finestra emette l'evento `pqc_evm_window_used`, con un attributo `source` che indica quale percorso l'ha usata.

Una firma post-quantistica non può viaggiare *insieme* a una transazione Ethereum (wallet come MetaMask non possono allegare una seconda firma), quindi viaggia *in anticipo*. L'account apre una finestra delimitata con il messaggio della corsia Cosmos `MsgOpenEVMWindow`; la corsia EVM ammette poi solo le transazioni coperte da una finestra attiva. Una chiave classica rubata da sola non può aprire una finestra, quindi sulla corsia EVM può agire solo entro ciò che una finestra già aperta consente (la finestra non limita gli importi dei token né le approvazioni esistenti).

| Limite      | Intervallo         | Significato |
| ----------- | ------------------ | ------- |
| `blocks`    | 1 – 17,280         | Per quanto tempo la finestra resta aperta, contato in blocchi a partire dal blocco che la apre |
| `max-txs`   | 1 – 1,000          | Quante transazioni EVM ammette |
| `max-value` | maggiore di 0, in `uqor` | Uscita totale che ammette: valore trasferito **più** la commissione massima che ogni transazione potrebbe pagare (gas limit × max fee per gas), convertita in `uqor` e arrotondata per eccesso |

Il limite che si esaurisce per primo chiude la finestra. Tutti e tre i limiti sono obbligatori; aprire una finestra ne sostituisce una esistente; una transazione ammessa e poi fallita consuma comunque il suo slot e il suo budget di valore; i deploy di contratti contano come qualsiasi altra transazione. `blocks` è un conteggio di blocchi, non una durata: 17,280 blocchi equivalgono a circa 15 ore sulla mainnet (circa 3,1 s per blocco) e a circa 6 ore sulla testnet (circa 1,3 s per blocco il 27 ottobre 2026; il block time della testnet varia).

**Il limite di valore conta solo QOR nativo.** Un trasferimento di token, un'approvazione o qualsiasi altra chiamata a un contratto porta valore zero, quindi non viene conteggiata nel `max-value` (solo la sua commissione massima lo è). L'**ambito** (scope) della finestra (mainnet v3.2.3 e successive) restringe quali destinatari ammette, ma non limita gli importi dei token:

| Opzione di ambito (flag CLI) | Campo del messaggio | Cosa ammette la finestra |
| ----------------------- | ------------- | ---------------------- |
| `--native-only`         | `native_only` | Solo trasferimenti semplici di QOR nativo: nessun calldata, nessuna creazione di contratti, nessun destinatario che contenga codice, nessuna autorizzazione EIP-7702 |
| `--allowed-targets 0xA,0xB` | `allowed_targets` | Solo le transazioni il cui destinatario è uno degli indirizzi a 20 byte elencati; la creazione di contratti viene rifiutata |

`allowed_targets` limita **quali** contratti e token una finestra può toccare, non **quanto**. Un token elencato ammette qualsiasi importo di quel token, incluso `approve`, e un contratto elencato può muovere tutto ciò che il suo codice e le approvazioni esistenti consentono, quindi non elencare contratti forwarder o router generici. Una finestra vincola solo le transazioni sulla lane EVM (firmate in modo classico). I messaggi Cosmos firmati con la firma PQC ibrida ne restano fuori. Prima della v3.2.8 questo includeva le chiamate cross-VM e authz; dalla v3.2.8 (solo testnet fino a un successivo upgrade della mainnet) una chiamata cross-VM verso l'EVM e una conversione ERC-20 inviate con una concessione authz usano la finestra del **granter**, e il precompile bridge `0x0901` richiede una finestra che lo elenchi.

Una finestra aperta senza ambito si comporta esattamente come prima. Una transazione fuori dall'ambito viene rifiutata con il codice 27 (il messaggio dice che la finestra "does not admit this transaction"). `GET /qorechain/pqc/v1/evm_window/{address}` e `qorechaind query pqc evm-window` riportano `native_only` e `allowed_targets`, e l'evento `pqc_evm_window_opened` li include quando sono impostati.

**Passaggi** (la guida completa è in [La tua prima transazione](/getting-started/first-transaction#evm-window)):

1. Registra una volta la tua chiave ML-DSA-87 (`tx pqc register-key-v2` oppure `register-key`, con `--gas 600000 --fees 60000uqor`; questa singola transazione è esentata dal requisito ibrido, così un nuovo account può fare il bootstrap). Vedi [Firma post-quantistica](/developer-guide/post-quantum-signing#pqc-key-registration).
2. Apri una finestra. È una transazione della corsia Cosmos, quindi producila non firmata e cofirmala con la tua chiave ML-DSA (`max-value` accetta `uqor` o `qor`; `1000qor` equivale a 1.000 QOR):

   ```bash
   qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi

   # the same window narrowed to plain QOR transfers (mainnet v3.2.3 and later):
   qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   ```

3. Controlla cosa resta: `qorechaind query pqc evm-window <address>` oppure `GET /qorechain/pqc/v1/evm_window/{address}` (risponde `found: false` quando non ce n'è nessuna).
4. Invia le tue transazioni EVM normalmente. L'apertura di una finestra è una transazione della corsia Cosmos e fa avanzare la sequence dell'account, che è anche il suo nonce EVM, quindi leggi il nonce **dopo** che la finestra è aperta e firma solo allora.

### Opzioni della finestra aggiunte nella v3.2.8 {#evm-window-v328}

Dalla release v3.2.8 (solo testnet fino a un successivo upgrade della mainnet) `MsgOpenEVMWindow` porta tre liste opzionali di al massimo 16 voci ciascuna. Una finestra senza di esse si comporta come prima, tranne che per la regola deny-by-default qui sotto.

| Campo del messaggio | Flag CLI | Cosa nomina |
| ------------- | -------- | ------------- |
| `validators` (7) | `--validators` | Contratti la cui verifica della firma dell'account conta per le sue azioni: un modulo validator chiamato da un contratto wallet, o l'entry point ERC-4337 |
| `staking_validators` (8) | `--staking-validators` | Indirizzi operatore dei validatori (`qorvaloper…`) a cui l'account può delegare o ridelegare tramite la finestra |
| `ibc_receivers` (9) | `--ibc-receivers` | Coppie esatte `<channel>/<receiver>` verso cui può andare un trasferimento IBC di QOR nativo; il canale e il ricevente vengono confrontati byte per byte (`channel-0`, ricevente bech32 in minuscolo) |

**I precompile standard sono deny-by-default.** Per un account che una finestra autorizza, un metodo di un precompile standard (staking, distribution, ICS-20, gov, slashing, precompile dei token ERC-20) viene rifiutato a meno che non sia nella tabella qui sotto e la finestra elenchi il precompile in `allowed_targets`.

| Precompile | Metodo | Ammesso quando |
| ---------- | ------ | ------------- |
| distribution | `claimRewards`, `withdrawDelegatorRewards` | le ricompense sono pagate all'account stesso |
| distribution | `withdrawValidatorCommission` | il validatore è quello dell'account e paga l'account stesso |
| distribution | `depositValidatorRewardsPool` | il validatore è in `staking_validators` e ogni moneta è QOR nativo |
| staking | `delegate`, `redelegate` | il validatore di destinazione è in `staking_validators` |
| ICS-20 | `transfer` | QOR nativo, sulla porta `transfer`, senza memo, verso una coppia in `ibc_receivers` |
| Precompile dei token ERC-20 | `transfer`, `transferFrom`, `approve` | QOR nativo; un altro token solo quando la finestra elenca l'indirizzo di quel token |

I precompile di staking (`0x…0800`) e di distribution (`0x…0801`), come gli altri precompile standard di questa tabella, **non sono attivi al momento né sulla testnet né sulla mainnet**; la governance può attivarli. Una chiamata all'indirizzo di un precompile non attivo raggiunge un indirizzo senza codice: riesce, non fa nulla e paga comunque il gas. I campi di finestra `staking_validators`, `validators` e `ibc_receivers` si applicano una volta che un precompile è attivo. Per lo staking e per riscuotere le ricompense usa i messaggi Cosmos nativi (QoreX, oppure i comandi staking e distribution di qorechaind). Quando un precompile è attivo, i suoi importi sono in `uqor` (6 decimali), non in unità EVM a 18 decimali.

Tutto il resto viene rifiutato tramite una finestra: undelegate, voto e altre azioni di governance, cambio dell'indirizzo di prelievo, creazione o modifica di un validatore, finanziamento del community pool. Invia queste come transazioni Cosmos firmate in modo post-quantistico.

**Le firme verificate on chain richiedono il contratto verificatore nella finestra.** Un permit EIP-2612, un trasferimento Permit2, un ordine EIP-712 o una meta-transazione sono verificati da un contratto con `ecrecover`. Dalla v3.2.8 (entrambe le reti, una volta che una rete la applica) quella verifica riesce per un account che possiede una chiave post-quantistica utilizzabile solo finché la finestra live dell'account stesso ammette il contratto verificatore, cioè il token o Permit2 stesso, non il router che inoltra la chiamata. Elencalo in `allowed_targets` e apri la finestra **prima** che l'utente firmi. Senza quella finestra la firma viene trattata come non valida e il contratto la rifiuta. Un permit o un'approvazione concessi all'interno di una finestra restano dopo la chiusura della finestra, quindi rivedi e revoca le approvazioni al termine della sessione.

**I cambi di chiave chiudono la finestra.** Ruotare, migrare o registrare di nuovo la chiave post-quantistica dell'account elimina la sua finestra aperta e il suo consenso EIP-7702; apri di nuovo la finestra dopo. I messaggi di finestra e di consenso devono essere il messaggio di primo livello dell'account stesso firmato in modo post-quantistico: non possono essere inviati tramite authz né concessi a un altro account.

Chiudi una finestra in anticipo con `qorechaind tx pqc close-evm-window` (stesso schema `--generate-only` e `cosign`), ad esempio se sospetti che la chiave classica sia esposta: tutto ciò che la finestra ammetteva ancora viene rifiutato dal blocco successivo.

### Deleghe EIP-7702 {#eip-7702}

Dalla v3.2.2, una delega EIP-7702 del tuo account (una transazione di tipo 4) ha effetto solo con il consenso post-quantistico dell'account stesso. Registra prima il consenso con il messaggio della corsia Cosmos firmato in modo ibrido `MsgAuthorizeEVMDelegation` (`qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>`); è monouso, scade dopo il numero di blocchi indicato e viene revocato da `close-evm-window`. Il valore che esce da un account delegato viene addebitato alla finestra di **quell'**account, una transazione di tipo 4 fallita conserva le autorizzazioni che ha applicato, e `qorechaind tx pqc clear-evm-delegation` rimuove una delega. Una delega rifiutata risponde con i codici da 60 a 63. Leggi il consenso con `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.

| Rifiuto (codespace `pqc`) | Significato |
| ------------------------- | ------- |
| code 26 | Nessuna finestra aperta per il mittente, oppure il mittente non ha una chiave PQC registrata |
| code 27 | La finestra è scaduta o esaurita (il messaggio indica quale limite), oppure la transazione è fuori dall'ambito della finestra |
| code 28 | Limiti della finestra non validi all'apertura, oppure nessuna chiave registrata in quel momento |

Con l'SDK TypeScript (0.8.2 e successivi): `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow({ rest, address })` e `classifyEvmWindowRejection(err)` (`"no-pqc-key" | "no-window" | "exhausted" | "invalid"`). L'SDK 0.9.0 e successivi (la 0.13.0 è la release attuale) aggiungono le opzioni di ambito (`nativeOnly`, `allowedTargets`) a `openEvmWindowMsg` e i builder del consenso EIP-7702 (`authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`); le release precedenti alla 0.9.0 costruiscono solo la finestra senza ambito, quindi usa `qorechaind` per il resto (vedi la [guida EVM dell'SDK](/sdk/guides/evm#evm-window-scope)).

---

## Namespace personalizzato `qor_` {#custom-qor_-namespace}

QoreChain estende il JSON-RPC con un namespace `qor_` per le query specifiche della chain. I metodi seguenti sono previsti:

:::warning Non ancora servito
I metodi nella tabella qui sotto sono previsti e non serviti: ciascuno restituisce `-32601` (metodo non trovato). L'unico metodo servito del namespace è `qor_getKEMKey`, e solo dove il nodo elenca `qor` nei suoi namespace: osservato il 7 novembre 2026, la testnet elenca `qor` e lo serve, mentre l'endpoint mainnet pubblico elenca solo `eth`, `net`, `rpc`, `txpool` e `web3` e risponde `-32601`. Vedi [il namespace `qor_`](/api-reference/json-rpc-qor_-namespace) per lo stato e le alternative REST (ad esempio `GET /qorechain/pqc/v1/account/{address}` per lo stato della chiave PQC).
:::

| Metodo                       | Descrizione                                                        |
| ----------------------------- | ------------------------------------------------------------------- |
| `qor_getPQCKeyStatus`         | Verifica se un account ha una chiave pubblica PQC registrata        |
| Statistiche AI (previsto)     | Recupera le statistiche del motore AI (conteggio anomalie, distribuzione del rischio); nome del metodo non definitivo |
| `qor_getCrossVMMessage`       | Interroga lo stato di un messaggio cross-VM tramite ID              |
| `qor_getPoolClassification`   | Ottiene la classificazione del pool del validatore (RPoS/DPoS/PoS)  |
| `qor_getReputationScore`      | Interroga il punteggio di reputazione di un validatore              |
| `qor_getAbstractAccount`      | Recupera la configurazione dell'account astratto                    |

Esempio con `curl`:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPQCKeyStatus",
    "params": ["0xYourAddress"],
    "id": 1
  }'
```

---

## Prossimi passi

* [Precompile EVM](/developer-guide/evm-precompiles) — Riferimento per le interfacce precompile di QoreChain (tre attive sulla testnet, nessuna sulla mainnet)
* [Interoperabilità cross-VM](/developer-guide/cross-vm-interoperability) — Chiamate cross-VM e loro disponibilità attuale
* [Account Abstraction](/developer-guide/account-abstraction) — Authenticator dei wallet collegati e regole di spesa (abilitato sulla testnet, disattivato sulla mainnet)
