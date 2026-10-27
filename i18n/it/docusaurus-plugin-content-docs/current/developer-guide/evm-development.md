---
slug: /developer-guide/evm-development
title: Sviluppo EVM
sidebar_label: Sviluppo EVM
sidebar_position: 2
---

# Sviluppo EVM

QoreChain esegue un ambiente di esecuzione completamente compatibile con EVM sul QoreChain EVM Engine, che consente di distribuire e interagire con smart contract Solidity utilizzando strumenti familiari. Il modulo EVM espone un'interfaccia JSON-RPC sulla **porta 8545** (WebSocket sulla **8546**) che supporta i flussi di lavoro di sviluppo Ethereum standard.

:::note
Gli esempi seguenti fanno riferimento alla mainnet **`qorechain-vladi`** (Chain ID EVM **9801**), attiva dal 7 giugno 2026, che al momento della stesura esegue la release di nodo **v3.2.4** (applicata dalla proposta di governance 13 all'altezza 3,742,566 il 23 ottobre 2026; la v3.2.3 era stata applicata all'altezza 3,662,051 il 20 ottobre 2026; la proposta di governance 14 della mainnet applicherebbe la v3.2.5 all'altezza 3,906,833, e ciò che quella release cambia sarà documentato una volta applicata). La testnet **`qorechain-diana`** esegue la **v3.2.6** (la v3.2.4 dall'altezza 8,337,253 il 19 ottobre 2026, la v3.2.5 all'altezza 8,890,800 il 26 ottobre, la v3.2.6 all'altezza 8,970,638 il 27 ottobre); lì usa il Chain ID EVM **9800**. Dove questa pagina descrive qualcosa che differisce tra le reti (i precompile della testnet, i token di test Fest), lo indica. Gli esempi di codice usano `http://localhost:8545` per un nodo gestito da te; l'endpoint pubblico della mainnet è `https://evm.qore.host` e quello della testnet è `https://evm-testnet.qore.host`.
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

**Da ERC-20 a coin bank: `MsgConvertERC20`.** Anche il suo campo `sender` deve essere l'indirizzo bech32 `qor1...` dell'account. Un mittente `0x` viene rifiutato con `decoding bech32 failed`. Nella release di nodo v3.2.6 il comando CLI `qorechaind tx erc20 convert-erc20` (il semplice esempio in [Coppie di token ERC-20](#erc20-token-pairs)) scrive il mittente in forma `0x`, quindi viene rifiutato per questo motivo: non usarlo. Costruisci tu il messaggio con l'indirizzo `qor1` come mittente, nello stesso modo di sopra:

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

---

## Finestra di autorizzazione EVM {#evm-window}

Una firma post-quantistica non può viaggiare *insieme* a una transazione Ethereum (wallet come MetaMask non possono allegare una seconda firma), quindi viaggia *in anticipo*. L'account apre una finestra delimitata con il messaggio della corsia Cosmos `MsgOpenEVMWindow`; la corsia EVM ammette poi solo le transazioni coperte da una finestra attiva. Una chiave classica rubata da sola non può aprire una finestra, quindi può muovere soltanto ciò che una finestra già aperta consente.

| Limite      | Intervallo         | Significato |
| ----------- | ------------------ | ------- |
| `blocks`    | 1 – 17,280         | Per quanto tempo la finestra resta aperta, contato in blocchi a partire dal blocco che la apre |
| `max-txs`   | 1 – 1,000          | Quante transazioni EVM ammette |
| `max-value` | maggiore di 0, in `uqor` | Uscita totale che ammette: valore trasferito **più** la commissione massima che ogni transazione potrebbe pagare (gas limit × max fee per gas), convertita in `uqor` e arrotondata per eccesso |

Il limite che si esaurisce per primo chiude la finestra. Tutti e tre i limiti sono obbligatori; aprire una finestra ne sostituisce una esistente; una transazione ammessa e poi fallita consuma comunque il suo slot e il suo budget di valore; i deploy di contratti contano come qualsiasi altra transazione. `blocks` è un conteggio di blocchi, non una durata: 17,280 blocchi equivalgono a circa 15 ore sulla mainnet (circa 3,2 s per blocco) e a circa 6 ore sulla testnet (circa 1,3 s per blocco il 27 ottobre 2026; il block time della testnet varia).

**Il limite di valore conta solo QOR nativo.** Un trasferimento di token, un'approvazione o qualsiasi altra chiamata a un contratto porta valore zero, quindi non viene conteggiata nel `max-value` (solo la sua commissione massima lo è). Per limitare anche quelle, restringi l'**ambito** (scope) della finestra (mainnet v3.2.3 e successive):

| Opzione di ambito (flag CLI) | Campo del messaggio | Cosa ammette la finestra |
| ----------------------- | ------------- | ---------------------- |
| `--native-only`         | `native_only` | Solo trasferimenti semplici di QOR nativo: nessun calldata, nessuna creazione di contratti, nessun destinatario che contenga codice, nessuna autorizzazione EIP-7702 |
| `--allowed-targets 0xA,0xB` | `allowed_targets` | Solo le transazioni il cui destinatario è uno degli indirizzi a 20 byte elencati; la creazione di contratti viene rifiutata |

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

Chiudi una finestra in anticipo con `qorechaind tx pqc close-evm-window` (stesso schema `--generate-only` e `cosign`), ad esempio se sospetti che la chiave classica sia esposta: tutto ciò che la finestra ammetteva ancora viene rifiutato dal blocco successivo.

### Deleghe EIP-7702 {#eip-7702}

Dalla v3.2.2, una delega EIP-7702 del tuo account (una transazione di tipo 4) ha effetto solo con il consenso post-quantistico dell'account stesso. Registra prima il consenso con il messaggio della corsia Cosmos firmato in modo ibrido `MsgAuthorizeEVMDelegation` (`qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>`); è monouso, scade dopo il numero di blocchi indicato e viene revocato da `close-evm-window`. Il valore che esce da un account delegato viene addebitato alla finestra di **quell'**account, una transazione di tipo 4 fallita conserva le autorizzazioni che ha applicato, e `qorechaind tx pqc clear-evm-delegation` rimuove una delega. Una delega rifiutata risponde con i codici da 60 a 63. Leggi il consenso con `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.

| Rifiuto (codespace `pqc`) | Significato |
| ------------------------- | ------- |
| code 26 | Nessuna finestra aperta per il mittente, oppure il mittente non ha una chiave PQC registrata |
| code 27 | La finestra è scaduta o esaurita (il messaggio indica quale limite), oppure la transazione è fuori dall'ambito della finestra |
| code 28 | Limiti della finestra non validi all'apertura, oppure nessuna chiave registrata in quel momento |

Con l'SDK TypeScript (0.8.2 e successivi): `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow({ rest, address })` e `classifyEvmWindowRejection(err)` (`"no-pqc-key" | "no-window" | "exhausted" | "invalid"`). L'SDK 0.9.0 aggiunge le opzioni di ambito (`nativeOnly`, `allowedTargets`) a `openEvmWindowMsg` e i builder del consenso EIP-7702 (`authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`); le release precedenti alla 0.9.0 costruiscono solo la finestra senza ambito, quindi usa `qorechaind` per il resto (vedi la [guida EVM dell'SDK](/sdk/guides/evm#evm-window-scope)).

---

## Namespace personalizzato `qor_` {#custom-qor_-namespace}

QoreChain estende il JSON-RPC con un namespace `qor_` per le query specifiche della chain:

:::warning Non ancora servito
Nessuna build di nodo rilasciata serve ancora il namespace `qor_`: `rpc_modules` sugli endpoint pubblici elenca solo `eth`, `net`, `rpc`, `txpool` e `web3`, e ogni metodo qui sotto restituisce `-32601` (metodo non trovato) su mainnet, testnet e nodi self-hosted con la configurazione predefinita (`eth`, `net`, `web3`). Vedi [il namespace `qor_`](/api-reference/json-rpc-qor_-namespace) per lo stato e le alternative REST (ad esempio `GET /qorechain/pqc/v1/account/{address}` per lo stato della chiave PQC).
:::

| Metodo                       | Descrizione                                                        |
| ----------------------------- | ------------------------------------------------------------------- |
| `qor_getPQCKeyStatus`         | Verifica se un account ha una chiave pubblica PQC registrata        |
| `qor_getAIStats`              | Recupera le statistiche del motore AI (conteggio anomalie, distribuzione del rischio) |
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
