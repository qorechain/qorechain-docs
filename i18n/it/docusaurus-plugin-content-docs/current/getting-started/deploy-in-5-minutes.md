---
slug: /getting-started/deploy-in-5-minutes
title: Distribuisci su QoreChain in 5 minuti
sidebar_label: Distribuisci in 5 minuti
sidebar_position: 6
---

# Distribuisci su QoreChain in 5 minuti

Questa pagina è per uno sviluppatore Solidity che non ha mai usato QoreChain. Continui a usare Foundry o Hardhat e la stessa frase di recupero che usi per MetaMask. L'unica novità è una breve **finestra di autorizzazione**: QoreChain protegge ogni account con una chiave post-quantistica, una transazione Ethereum non può portarne una, quindi prima apri una finestra limitata e le tue normali transazioni EVM vengono ammesse finché è aperta. I passaggi seguenti usano la **testnet** (`qorechain-diana`, EVM chain ID 9800), dove nulla costa denaro reale.

:::note
Questo percorso è stato eseguito sulla testnet: una finestra aperta in QoreX, poi un contratto creato e chiamato con Foundry `cast` dalla stessa frase di recupero. `forge create` e Hardhat inviano lo stesso tipo di transazione EVM, ma non facevano parte di quell'esecuzione. Anche una finestra aperta dalla riga di comando `qorechaind` è confermata; vedi [Alternativa: la riga di comando](#cli).
:::

## Cosa ti serve {#what-you-need}

- La frase di recupero dell'account da cui vuoi distribuire. QoreX non può importare una chiave privata grezza. Se hai solo una chiave privata, usa invece la [riga di comando](#cli).
- [QoreX](/qorex/overview), il wallet di QoreChain (app o estensione per browser).
- Foundry o Hardhat già installato.

## 1. Aggiungi un account coin 60 a QoreX {#step-import}

La lane EVM funziona solo con una chiave `eth_secp256k1` (coin type 60). Una chiave Cosmos secp256k1 standard (coin type 118, l'impostazione predefinita di QoreX) non può firmare per il proprio indirizzo EVM, quindi una finestra aperta su un account coin 118 è inutile per gli strumenti EVM. Ti serve un **account Ethereum (coin 60)**. In QoreX apri **Your accounts** e tocca **Add an Ethereum account (coin 60)**. QoreX lo deriva dalla **frase di recupero propria** del wallet con il percorso Ethereum `m/44'/60'`. Il suo indirizzo `0x…` è uguale a quello di MetaMask o Foundry solo se usano quella stessa frase (per Foundry, percorso di derivazione `m/44'/60'/0'/0/0`, indice 0). Se il tuo account MetaMask proviene da un'altra frase, QoreX mostra un indirizzo diverso, e una finestra aperta lì non copre la chiave con cui distribuisci. L'indirizzo `0x…` è la stessa chiave di un indirizzo `qor1…` su QoreChain.

L'account ha un proprio indirizzo, quindi finanzialo e selezionalo in QoreX prima dei passaggi successivi. Vedi [Ripristinare una frase da MetaMask o dalla Dashboard](/qorex/getting-started#restore-dashboard).

:::caution Non incollare mai una frase di produzione negli strumenti di sviluppo
Usa una frase di recupero creata per i test, con solo QOR di test. Non digitare in Foundry, Hardhat o in uno script la frase di un account che contiene fondi reali.
:::

## 2. Passa QoreX alla testnet {#step-testnet}

- **App:** Impostazioni → **Use testnet (developers)**.
- **Estensione per browser:** sbloccala, tocca sette volte il numero di versione in basso, poi scegli **Switch to testnet (diana)**.

Il badge di rete nella Home diventa TESTNET.

## 3. Ottieni QOR di testnet {#step-faucet}

Richiedi QOR di testnet per il tuo indirizzo `0x…` o `qor1…` dal [Faucet della Dashboard](/dashboard/faucet). Il saldo è lo stesso su entrambe le forme dell'indirizzo.

## 4. Apri la finestra EVM in QoreX {#step-window}

- **Estensione e app:** la scheda intitolata **MetaMask on QoreChain** (con un marchio **0x**) nel popup principale o nella Home. Apre la schermata **Finestra di accesso EVM**.
- **App:** anche Impostazioni → Sicurezza → **Finestra di accesso EVM**.

Se questo account non ha ancora una chiave post-quantistica, QoreX la registra per te in questo passaggio. La registrazione costa 0,09 QOR, una sola volta per account, e la transazione della finestra paga la propria commissione di rete in aggiunta. Poi scegli tre limiti:

| Campo | Intervallo | Predefinito di QoreX |
|---|---|---|
| Blocchi (per quanto tempo la finestra resta aperta) | da 1 a 17,280 | 300 |
| Transazioni massime | da 1 a 1,000 | 5 |
| Tetto di spesa, in QOR | maggiore di 0 | 1 |

Il tetto di spesa conta il valore di ogni transazione **più la sua commissione massima** (limite di gas per tetto della commissione), non solo ciò che trasferisce. Una distribuzione di contratto non sposta QOR ma conta comunque la sua commissione massima: una distribuzione da 3,000,000 di gas inviata da Hardhat conta circa 0,64 QOR.

Per una sessione di distribuzione i valori predefiniti sono troppo piccoli. Una scelta ragionevole è 3,000 blocchi (circa un'ora sulla testnet), 20 transazioni e un tetto di 10 QOR. Tienili il più piccoli possibile per la tua sessione e chiudi la finestra quando hai finito.

:::caution Apri prima la finestra
L'apertura di una finestra fa avanzare il nonce dell'account. Aprila **prima** di distribuire: una transazione firmata prima viene rifiutata con "nonce too low".
:::

## 5. Distribuisci con Foundry o Hardhat {#step-deploy}

Usa la chiave dello **stesso account coin 60 finanziato**. QoreX non può fare da firmatario per Foundry, quindi dai a Foundry o Hardhat la chiave della stessa frase di recupero, ad esempio `--mnemonic` con indice 0 in Foundry. Le impostazioni di rete:

| Impostazione | Valore |
|---|---|
| URL RPC | `https://evm-testnet.qore.host` |
| Chain ID | `9800` |
| Valuta | QOR, 18 decimali |

**Foundry**

```bash
export ETH_RPC_URL=https://evm-testnet.qore.host

forge create src/Counter.sol:Counter --private-key $DEPLOYER_KEY --broadcast
cast send <contract> "increment()" --private-key $DEPLOYER_KEY
cast call <contract> "number()(uint256)"
```

**Hardhat**

```js
// hardhat.config.js
module.exports = {
  solidity: "0.8.24",
  networks: {
    diana: {
      url: "https://evm-testnet.qore.host",
      chainId: 9800,
      accounts: [process.env.DEPLOYER_KEY],
    },
  },
};
```

```bash
DEPLOYER_KEY=0x... npx hardhat run scripts/deploy.js --network diana
```

Ogni transazione che invii (distribuzione o chiamata) usa una delle transazioni della finestra. Le letture (`cast call`, funzioni view, stima del gas) non richiedono alcuna finestra e non ne consumano nulla.

## Controlla la finestra e gestisci la scadenza {#check-and-expiry}

Una finestra **scade**: quando i suoi blocchi, le sue transazioni o il suo tetto di spesa si esauriscono, la lane EVM rifiuta la tua transazione successiva con `no open EVM authorisation window` o `EVM authorisation window exhausted`. Aprine una nuova in QoreX; una nuova finestra sostituisce la precedente.

Per vederne lo stato, usa la scheda **PQ key status** di [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers) (vedi [Sviluppatori](/dashboard/developers)), oppure la route REST:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

`live: true` con `remaining_blocks`, `remaining_txs` e `remaining_value` (in `uqor`) significa che è aperta.

## Alternativa: la riga di comando {#cli}

Con il binario di release `qorechaind` puoi importare una chiave privata grezza, registrarne la chiave post-quantistica e aprire la finestra senza QoreX. Questa è la strada per uno sviluppatore che ha solo una chiave privata. `gen-key` e `cosign` non sono in una build della community, quindi serve il binario di release. Le regole della finestra sono nella sezione [Finestra di autorizzazione EVM](/developer-guide/evm-development#evm-window) di [Sviluppo EVM](/developer-guide/evm-development). Una finestra aperta in questo modo, seguita da una transazione inviata con `cast`, è confermata sulla testnet.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# import the private key as an eth_secp256k1 key: the qor1... and 0x... addresses are one account
qorechaind keys import-hex deployer <private-key-hex-without-0x> --key-type eth_secp256k1

# register a post-quantum key once per account (back up the .dilithium file)
qorechaind tx pqc gen-key deployer-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --pqc-key deployer-mldsa \
  --from deployer --chain-id $QCHAIN --node $QNODE --gas auto --gas-adjustment 1.3 --gas-prices 0.2uqor

# open the window

qorechaind tx pqc open-evm-window 3000 20 10qor --from deployer \
  --chain-id $QCHAIN --node $QNODE --gas 400000 --fees 80000uqor --generate-only > window.json
qorechaind tx pqc cosign window.json --from deployer --pqc-key deployer-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Non restringere una finestra di distribuzione con `--native-only` o `--allowed-targets`: entrambi rifiutano la creazione di contratti. Servono per le sessioni successive, quando il contratto esiste già.

## Cosa cambia sulla testnet {#diana-notes}

- **CosmWasm** sulla testnet accetta solo codici approvati dalla governance, quindi non puoi caricare lì un tuo contratto. Solidity è il percorso aperto.
- **SVM** non è disponibile.
- La mainnet funziona allo stesso modo con chain ID 9801 e `https://evm.qore.host`, ma inizia dalla testnet.

## Errori comuni {#errors}

| Messaggio | Causa | Soluzione |
|---|---|---|
| `account ... has no registered post-quantum key` | l'account non ha una chiave ML-DSA-87 | apri una finestra in QoreX, che la registra, oppure registrala dalla riga di comando |
| `no open EVM authorisation window` | nessuna finestra, oppure è scaduta | apri una finestra |
| `EVM authorisation window exhausted` | transazioni o tetto di spesa esauriti | apri una nuova finestra con limiti più ampi |
| `nonce too low` | la finestra è stata aperta dopo che hai firmato | apri prima la finestra, poi invia |
| `only replay-protected (EIP-155) Ethereum transactions are accepted` | una transazione firmata senza chain ID | imposta `chainId` nella configurazione di rete |

Prossimi passi: [Sviluppo EVM](/developer-guide/evm-development), [Sicurezza e recupero di QoreX](/qorex/security-and-recovery#evm-window), [Sviluppatori](/dashboard/developers).
