---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

L'Hybrid Inspector è una piccola pagina React che mostra che aspetto ha una firma ibrida di QoreChain sulla testnet `qorechain-diana`. Colleghi il wallet QoreX, invii una transazione che QoreX firma sia con secp256k1 sia con ML-DSA-87, e la pagina la apre mostrandone le parti: la firma classica, la firma post-quantistica e il verdetto della catena stessa. Puoi anche incollare l'hash di qualsiasi transazione testnet.

## Cosa mostra {#what-it-shows}

- **Firma ibrida ML-DSA-87 + secp256k1 da una pagina web.** La pagina passa a QoreX un messaggio codificato con `qorexSignAndBroadcast`. QoreX firma con entrambe le chiavi e trasmette.
- **Una transazione firmata in modo ibrido, verificata on chain.** La pagina legge l'evento `pqc_hybrid_verify` della catena per la transazione. Quell'evento è la catena che dichiara di aver controllato la firma post-quantistica.
- **Le dimensioni sono visibili.** La firma classica è di 64 byte. La firma ML-DSA-87 (FIPS 204) è di 4.627 byte e viaggia nell'estensione `PQCHybridSignature` della transazione.

## Passo dopo passo {#steps}

### 1. Installa gli strumenti

Ti servono un browser basato su Chromium (Chrome, Edge, Brave), Git, Node.js 20 o più recente e pnpm.

- Git: https://git-scm.com/downloads
- Node.js 20+: https://nodejs.org (va bene la versione LTS)
- pnpm: `npm install -g pnpm`

Controlla le versioni:

```sh
git --version
node --version     # v20.0.0 or higher
pnpm --version     # 9 or higher
```

### 2. Installa l'estensione QoreX per il browser

Installa QoreX dallo store del tuo browser. Per i dettagli vedi [QoreX Integrations](/developer-tools/qorex-integrations) e il [browser per dApp](/qorex/dapp-browser).

### 3. Crea in QoreX un account testnet usa e getta

Questo workshop non ha mai bisogno del tuo wallet reale. In QoreX crea un **nuovo** account (un nuovo profilo o un nuovo wallet) usato solo per questo esercizio e passalo alla testnet `qorechain-diana`. Per il cambio di rete vedi [Deploy in 5 minuti](/getting-started/deploy-in-5-minutes#step-testnet). QoreX mostra una frase di recupero quando crea l'account: scrivila su carta, tienila privata e non riutilizzarla mai sulla mainnet. L'account non ha alcun valore al di fuori di questo esercizio.

Copia l'indirizzo dell'account (inizia con `qor1...`).

### 4. Ricevi QOR di testnet dal faucet

1. Apri https://dashboard.qorechain.io/faucet e accedi.
2. Incolla il tuo indirizzo `qor1...` e richiedi. Una richiesta eroga 100 QOR, una volta ogni 24 ore per account.

### 5. Ottieni il codice

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

### 6. Installa le dipendenze

```sh
pnpm install
```

### 7. Controlla che compili

```sh
pnpm build
```

Il comando controlla i tipi del progetto e lo compila. Termina con `built in` e un tempo.

### 8. Avvia la pagina

```sh
pnpm dev
```

Apri http://localhost:5173 nel browser in cui è installato QoreX. Aggiungi `?tx=<HASH>` all'indirizzo (`http://localhost:5173?tx=<HASH>`) per ispezionare direttamente una transazione. Se la porta 5173 è occupata, Vite stampa la porta che usa al suo posto.

Le chiamate REST passano dal proxy Vite `/lcd` verso `https://api-testnet.qore.host`, perché l'endpoint REST pubblico non invia intestazioni CORS. La pagina funziona solo sulla testnet e non serve alcun file `.env`.

### 9. Collega, invia e verifica

1. Fai clic su **Connect QoreX**. La pagina mostra il tuo indirizzo (`qor1...`), il tuo saldo testnet e se una chiave ML-DSA-87 è registrata. QoreX registra la chiave al tuo primo invio.
2. **Invia** una piccola quantità di QOR con un memo. QoreX mostra ciò che firmi e chiede l'approvazione.
3. La pagina ispeziona automaticamente la transazione. Puoi anche incollare l'hash di qualsiasi transazione testnet di 64 caratteri.

## Il codice {#code}

Collegare e inviare:

```ts
import { getQorexNative, qorexSignAndBroadcast } from "@qorechain/qorex-types";

const native = getQorexNative();
await native.enable("qorechain-diana");
const key = await native.getKey("qorechain-diana");      // key.bech32Address

const r = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes(from, to, uqor) }],
  memo,
});                                                       // r.txHash, r.code, r.shield
```

Leggere la prova dalla catena:

```ts
const res = await fetch(`/lcd/cosmos/tx/v1beta1/txs/${hash}`).then((r) => r.json());
const tx = res.tx;
const ext = [...(tx.body.extension_options ?? []), ...(tx.body.non_critical_extension_options ?? [])];
const hyb = ext.find((x) => String(x["@type"]).includes("PQCHybridSignature"));
const verify = (res.tx_response.events ?? []).filter((e) => e.type === "pqc_hybrid_verify");
// classical signature: atob(tx.signatures[0]).length  -> 64
// ML-DSA-87 signature: atob(hyb.pqc_signature).length -> 4627
```

`msgSendBytes` è un piccolo encoder protobuf in `src/App.tsx` per il messaggio bancario `MsgSend`, perché QoreX riceve il messaggio già codificato. La pagina contrassegna una transazione come verificata in modo ibrido quando il suo codice è 0, un evento `pqc_hybrid_verify` ha stato `verified` e la firma post-quantistica è di 4.627 byte.

## Cosa dovresti vedere {#result}

- L'intestazione mostra `qorechain-diana (testnet)` e un'altezza di blocco che continua a salire.
- Dopo il collegamento: il tuo indirizzo, il saldo e lo stato della chiave.
- Dopo l'invio: l'hash della transazione e il codice di esito, poi la scheda di ispezione con il memo, il tipo di messaggio, la firma classica da 64 byte, la firma ML-DSA-87 da 4.627 byte con i primi byte in esadecimale, il nome dell'algoritmo `ML-DSA-87 (FIPS 204)` e il verdetto `pqc_hybrid_verify`.
- Nell'explorer: apri https://explore.qore.network, impostalo su **Testnet** e cerca l'hash della tua transazione.

## Pacchetti usati {#packages}

| Pacchetto | Versione | Usato per |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0 (fissata) | `getQorexNative`, `qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | Elencato come dipendenza; la pagina stessa usa semplici chiamate REST |
| `react`, `react-dom` | ^18.3.1 | Interfaccia |
| `@vitejs/plugin-react` | ^4.3.0 | Plugin React per Vite |
| `vite` | ^5.4.0 | Server di sviluppo e build |
| `typescript` | ^5.6.3 | Controllo dei tipi |

## Codice sorgente {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
