---
slug: /developer-tools/qorex-integrations
title: Integrazioni QoreX
sidebar_label: Integrazioni QoreX
sidebar_position: 22
---

# Integrazioni QoreX (`@qorechain/qorex-*`)

Le integrazioni QoreX sono sei piccoli pacchetti npm per gli sviluppatori di dApp che vogliono far funzionare il [wallet QoreX](/qorex/overview) in un front end EVM, Cosmos o Solana, e per i team che testano quei front end. Tre sono connettori wallet per librerie diffuse (RainbowKit, Interchain Kit, cosmos-kit), uno contiene i tipi condivisi e gli helper di rilevamento, e due sono strumenti di test (un wallet mock e fixture Playwright). Tutti e sei sono alla versione **0.1.0**, pubblicati il 27 ottobre 2026, Apache-2.0.

Ciò che non fanno: non custodiscono chiavi e non rendono QoreX più di quanto sia oggi. Leggete [Limiti e problemi noti](#limits) prima di costruirci sopra: le build di QoreX attualmente negli store supportano solo una parte di ciò a cui questi pacchetti possono essere collegati, e i limiti sono indicati lì.

## Innovazioni {#innovations}

* **Un rilevamento che non può scegliere il wallet sbagliato.** QoreX si annuncia tramite EIP-6963 con il nome in reverse-DNS `network.qore.qorex` e non scrive mai `window.ethereum`. `@qorechain/qorex-types` seleziona il provider solo in base a quel nome, e il wallet RainbowKit vincola il connettore al provider annunciato e non ripiega mai su `window.ethereum`.
* **Il wallet costruisce la firma ibrida, la pagina non detiene mai la chiave post-quantistica.** Il lane nativo di QoreChain richiede una firma secp256k1 più una firma ML-DSA-87 (FIPS 204). Sul provider nativo (`window.qorex.native`) la chiamata `signAndBroadcast` consegna i messaggi a QoreX, che costruisce la transazione, la firma con entrambe le chiavi e la trasmette. Il risultato è `txHash`, `code`, `height` e `shield`, dove `shield` vale `shielded` quando la transazione confermata porta il livello ibrido.
* **Controlli di capacità invece di controlli di versione.** I pacchetti leggono l'elenco `capabilities` del wallet (`hasCapability`), quindi una funzione come `signAndBroadcast` viene rilevata, non dedotta da un numero di versione.
* **I rifiuti sono espliciti, con codici stabili.** La firma Amino è rifiutata per design, perché Amino JSON non può portare la firma ibrida; i connettori lanciano `QorexIntegrationError` con codici come `QOREX_AMINO_REFUSED`, `QOREX_USE_SIGN_AND_BROADCAST` e `QOREX_NOT_SUPPORTED_YET`, e `isQorexIntegrationError(err, code)` li verifica.
* **Un test double che firma davvero.** `@qorechain/qorex-wallet-mock` inietta gli stessi oggetti che inietta QoreX (`window.qorex = { evm, native, svm }`), registra un wallet Solana e firma con gli algoritmi reali (ML-DSA-87 ibrido tramite QoreSign sul lane nativo, secp256k1 su EVM, ed25519 su Solana) a partire dalla mnemonica di test pubblica, per default sulla testnet. Si annuncia come `network.qore.qorex.mock`, così il codice che seleziona QoreX in modo rigoroso non può scambiarlo per il wallet.
* **Due profili di comportamento.** Il profilo `current` del mock si comporta come il QoreX attualmente live; `planned` aggiunge ciò che il team QoreX ha annunciato, così potete costruire in anticipo senza che il mock dichiari qualcosa che il wallet non fa ancora.
* **Fixture Playwright nello stile di Synpress v4** (`qorexMockFixtures`) iniettano il mock prima della navigazione, quindi un test end-to-end non richiede alcuna estensione del browser.
* **Account guidati dal wallet senza eventi.** Poiché QoreX non emette ancora `accountsChanged` né `chainChanged`, il wallet RainbowKit ha un'opzione opt-in `pollAccountsOnFocus` che rilegge `eth_accounts` e `eth_chainId` quando la pagina riprende il focus.

## Come usarle {#how-to-use}

I blocchi di codice qui sotto sono i quickstart dell'hub per sviluppatori. Ciascuno è stato controllato con `tsc` ed eseguito il 27 ottobre 2026 dopo l'installazione dal registro npm pubblico (Node 26; jsdom 30 e `react-dom/client` per il codice del browser; Playwright 1.64 con Chromium per la fixture) ed è passato. Nessuno invia una transazione né richiede una chiave con fondi. Il risultato osservato è riportato con ciascuno. Il comportamento lato wallet (un vero QoreX in un vero browser) non è stato testato per questa pagina.

### `@qorechain/qorex-types`: rilevare QoreX {#types}

```bash
npm install @qorechain/qorex-types
```

```ts
import { discoverQorexEip1193, getQorexNative, hasCapability } from "@qorechain/qorex-types";

// EVM: EIP-6963 discovery by rdns "network.qore.qorex" (QoreX never writes window.ethereum).
const evm = await discoverQorexEip1193({ timeoutMs: 500 });
console.log(evm ? "QoreX EVM provider found" : "QoreX EVM provider not announced");

// QoreChain native lane: window.qorex.native.
const native = getQorexNative();
if (native && hasCapability(native, "signAndBroadcast")) {
  const key = await native.getKey("qorechain-diana");
  console.log("native account:", key.bech32Address);
}
```

Osservato con il mock: `QoreX EVM provider not announced`, poi `native account: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`. La prima riga è attesa con il mock, vedi [l'avvertenza su EIP-6963](#limits). Il pacchetto non ha dipendenze a runtime ed esporta anche l'icona di QoreX come data URI da `@qorechain/qorex-types/icon`. Altri export: tipi di provider, `isQorexInstalled`, `qorexSignAndBroadcast` e helper per classificare i rifiuti EVM di QoreX.

### `@qorechain/qorex-rainbowkit`: QoreX in RainbowKit e wagmi {#rainbowkit}

```bash
npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

```ts
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { QOREX_CHAINS, qorechain, qorechainTestnet, qorexWallet } from "@qorechain/qorex-rainbowkit";

const connectors = connectorsForWallets(
  [{ groupName: "Recommended", wallets: [qorexWallet, metaMaskWallet] }],
  { appName: "My dApp", projectId: "<walletconnect project id>" },
);

export const config = createConfig({
  chains: QOREX_CHAINS, // QoreChain mainnet (9801) and testnet (9800)
  connectors,
  transports: { [qorechain.id]: http(), [qorechainTestnet.id]: http() },
});
console.log(config.chains.map((c) => `${c.id} ${c.name}`), connectors.length, "connectors");
```

Osservato: `[ '9801 QoreChain', '9800 QoreChain Testnet' ] 2 connectors`. `QOREX_CHAINS` contiene le definizioni di chain viem per il lane EVM (RPC `https://evm.qore.host` e `https://evm-testnet.qore.host`, valuta nativa QOR con 18 decimali, explorer `https://explore.qore.network`). Il `projectId` è un project id WalletConnect che create voi stessi con WalletConnect. Dipendenze peer: `viem` ^2, `wagmi` ^2.9, `@rainbow-me/rainbowkit` ^2.2.11. Per recepire le modifiche di account e rete fatte nel wallet, usate `wallets: [() => qorexWallet({ pollAccountsOnFocus: true })]`.

### `@qorechain/qorex-interchain-kit`: dApp Cosmos (consigliato per i nuovi lavori) {#interchain-kit}

```bash
npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react
```

```tsx
import type { ComponentProps, ReactNode } from "react";
import { ChainProvider } from "@interchain-kit/react";
import { qorexWallet } from "@qorechain/qorex-interchain-kit";

type Props = Pick<ComponentProps<typeof ChainProvider>, "chains" | "assetLists"> & { children: ReactNode };

// chains / assetLists: your chain-registry entries, including QoreChain.
export function Providers({ chains, assetLists, children }: Props) {
  return (
    <ChainProvider chains={chains} assetLists={assetLists} wallets={[qorexWallet]}>
      {children}
    </ChainProvider>
  );
}
```

Osservato: il componente è stato montato in jsdom con la voce chain-registry della testnet QoreChain (`@interchain-kit/react` 0.11.1). Dipendenza peer: `@interchain-kit/core` ^0.11. Inviate una transazione QoreChain con `qorexSignAndBroadcast`:

```ts
import { qorexSignAndBroadcast } from "@qorechain/qorex-interchain-kit";

const { txHash, code, height, shield } = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],
  memo: "",
});
```

La chiamata accetta da 1 a 32 messaggi e un memo fino a 256 byte, e QoreX chiede all'utente di approvarla. Lo snippet proviene dal README del pacchetto e non è stato eseguito per questa pagina.

### `@qorechain/qorex-cosmos-kit`: dApp Cosmos su cosmos-kit {#cosmos-kit}

```bash
npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react
```

```tsx
import type { ComponentProps, ReactNode } from "react";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as qorexWallets } from "@qorechain/qorex-cosmos-kit";

type Props = Pick<ComponentProps<typeof ChainProvider>, "chains" | "assetLists"> & { children: ReactNode };

// chains / assetLists: your chain-registry entries, including QoreChain.
export function Providers({ chains, assetLists, children }: Props) {
  return (
    <ChainProvider chains={chains} assetLists={assetLists} wallets={[...qorexWallets]} throwErrors={false}>
      {children}
    </ChainProvider>
  );
}
```

Osservato: montato in jsdom con la voce della testnet QoreChain (`@cosmos-kit/react` 2.24.1). **`throwErrors={false}` è necessario perché il codice superi il controllo dei tipi:** `@cosmos-kit/react` 2.24 tipizza `throwErrors` come proprietà obbligatoria, e l'esempio nel README del pacchetto la omette. Dipendenza peer: `@cosmos-kit/core` ^2.18.1. Il README del pacchetto raccomanda Interchain Kit per le nuove dApp. Esporta anche `qorexSignAndBroadcast`.

### `@qorechain/qorex-wallet-mock`: test double per QoreX {#wallet-mock}

```bash
npm install -D @qorechain/qorex-wallet-mock
```

```ts
import { createQorexMock } from "@qorechain/qorex-wallet-mock";

// jsdom / Vitest: install a QoreX test double into window (public test phrase, testnet only).
const mock = createQorexMock({ profile: "current" });
mock.install(window);

const [account] = (await window.qorex!.evm.request({ method: "eth_requestAccounts" })) as string[];
const chainId = await window.qorex!.evm.request({ method: "eth_chainId" });
console.log(account, chainId, mock.addresses());
```

Osservato: `0x9858EfFD232B4033E47d90003D41EC34EcaEda94 0x2648 { native: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h, evm: 0x9858..., svm: HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk }`. Gli account sono derivati come li deriva QoreX (`m/44'/118'/0'/0/i` con la chiave ML-DSA-87 canonica di quell'indirizzo `qor1`, `m/44'/60'/0'/0/i` per EVM, `m/44'/501'/i'/0'` per Solana). Le opzioni includono `profile`, `mnemonic`, `accountIndex`, `chainId` (predefinito `qorechain-diana`), `autoApprove` e `allowMainnet`; la pagina riceve anche `window.__qorexMock` con `approveNext()`, `rejectNext()`, `requests` e `switchAccount(i)`. In Playwright, iniettate `mock.initScript()` con `page.addInitScript` (Node 20.16 o successivo).

### `@qorechain/qorex-synpress`: fixture Playwright {#synpress}

```bash
npm install -D @qorechain/qorex-synpress @playwright/test
```

```ts
import { qorexMockFixtures } from "@qorechain/qorex-synpress";

// A Playwright test with the QoreX mock injected before navigation (no Synpress needed).
const test = qorexMockFixtures({ profile: "current" });
const { expect } = test;

test("connects", async ({ page, qorex }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connect" }).click();
  await expect(page.getByTestId("account")).toHaveText(qorex.addresses.evm);
});
```

Osservato: `1 passed`, rispetto a una pagina locale il cui pulsante Connect chiama `eth_requestAccounts` (Playwright 1.64, Chromium). Per combinare le fixture con Synpress, installate `@synthetixio/synpress@4.1.2` e avvolgetele in `testWithSynpress`. La fixture `qorex` espone `addresses`, `approveNext()`, `rejectNext()`, `requests()`, `switchAccount(i)` e `disconnect()`. Dipendenza peer: `@playwright/test` 1.48 o successivo. Lo stato vive nella pagina, quindi ogni navigazione parte con un mock nuovo.

## Come accedere {#how-to-access}

* **Un wallet QoreX per l'uso reale.** I connettori comunicano con l'estensione browser o l'app QoreX che un utente ha installato; consultate la pagina [Estensione Browser QoreX](/qorex/browser-extension) per le installazioni e le versioni negli store. I pacchetti di test non richiedono alcun wallet.
* **Reti.** Mainnet `qorechain-vladi` (chain id EVM 9801) e testnet `qorechain-diana` (chain id EVM 9800). QoreX serve solo questi due chain id di QoreChain e rifiuta gli altri con "QoreX: unsupported chain". Il mock usa per default la testnet e rifiuta di firmare per la mainnet a meno che non passiate `allowMainnet: true`.
* **Chiavi e fondi.** I pacchetti non detengono alcuna chiave. Il mock usa la frase di test BIP-39 pubblica (`abandon` ripetuto 11 volte, poi `about`) che deriva `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`; non finanziatela mai. Per un test che trasmette, date al mock la vostra mnemonica di testnet.
* **Altri account.** RainbowKit con WalletConnect richiede un project id WalletConnect da WalletConnect.
* **Prerequisiti.** Node.js (lo script a file singolo del mock richiede la 20.16 o successiva), un'app React per i tre connettori e i pacchetti peer elencati sotto ciascun quickstart. Gli utenti TypeScript ottengono i tipi da `@qorechain/qorex-types`.
* **Costi.** I pacchetti sono gratuiti. Una transazione inviata tramite QoreX paga la commissione consueta (soglia minima 0,1 uqor per gas).

## Dove è pubblicato {#where-published}

| Registry | Pacchetto | Versione | Link |
| --- | --- | --- | --- |
| npm | `@qorechain/qorex-types` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-types |
| npm | `@qorechain/qorex-rainbowkit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| npm | `@qorechain/qorex-interchain-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-interchain-kit |
| npm | `@qorechain/qorex-cosmos-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit |
| npm | `@qorechain/qorex-wallet-mock` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-wallet-mock |
| npm | `@qorechain/qorex-synpress` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-synpress |

Sorgente: https://github.com/qorechain/qorex-integrations (tag `v0.1.0`, cartelle sotto `packages/`; contiene anche una dApp demo, esempi e file di voci chain-registry). Versioni lette dal registro npm il 27 ottobre 2026. Sostituiscono `@qorechain/connect`, che è deprecato su npm: usate `qorex-types` per rilevare QoreX, `qorex-rainbowkit` per le dApp EVM, `qorex-interchain-kit` (o `qorex-cosmos-kit`) per le dApp Cosmos, e [QoreSign](/qoresign/overview) per la firma ibrida nel vostro wallet o backend.

## Limiti e problemi noti {#limits}

**Cosa supportano oggi le build di QoreX.** Le build negli store attualmente live (l'app mobile QoreX 1.1.8; l'estensione browser 0.3.8, e 0.3.9 su Firefox) non supportano ancora `getOfflineSigner` con un livello ML-DSA aggiunto dal wallet e non supportano `signArbitrary`. Tramite cosmos-kit e Interchain Kit, la firma con `getOfflineSigner` funziona solo se è la pagina stessa ad allegare il livello post-quantistico, cosa che una pagina normalmente non può fare perché non detiene la chiave. Il modo supportato oggi per inviare una transazione sul lane nativo è `window.qorex.native.signAndBroadcast`, che `qorexSignAndBroadcast` incapsula. Non interpretate i connettori come un wallet completo per cosmos-kit o Interchain Kit con le build attuali degli store, oltre quanto dichiara il README di ciascun pacchetto. I connettori sono scritti in modo che una futura release di QoreX possa aggiungere il livello in `signDirect` (dichiarato tramite una capacità `signDirectAddsPqcLayer`) senza alcuna modifica nel vostro codice.

**Cosa risponde oggi QoreX** (dai README dei pacchetti):

* **EVM:** `eth_chainId`, `eth_accounts`, `eth_requestAccounts` e `wallet_switchEthereumChain` per la rete selezionata in QoreX (una chain sconosciuta rifiuta con codice 4902). I metodi di firma (`personal_sign`, `eth_signTypedData_v4`, `eth_sendTransaction`) e `wallet_addEthereumChain` non sono ancora supportati e rifiutano con "QoreX: EVM method ... not yet supported". Nessun evento `accountsChanged` o `chainChanged` per ora. Indicati dal team QoreX come pianificati, non live: eventi, codici di errore su ogni rifiuto, poi i metodi di firma e di transazione.
* **Transazioni EVM in generale.** Su QoreChain una transazione EVM è accettata solo da un account con una chiave ML-DSA-87 registrata e una finestra di autorizzazione EVM aperta, entrambe impostate dal lane nativo (consultate [Sviluppo EVM](/developer-guide/evm-development#evm-window)). L'`eth_sendTransaction` pianificato del mock non apre quella finestra.
* **Nativo:** `enable`, `getKey`, `signDirect`, `signAndBroadcast`, `listAccounts` e `experimentalSuggestChain`, solo per `qorechain-vladi` e `qorechain-diana`. Su QoreChain `signDirect` richiede che il livello ibrido sia già presente, cosa che una pagina non può costruire, quindi usate `signAndBroadcast`. `signArbitrary`, la firma Amino e `sendTx` non sono disponibili; nei connettori `signArbitrary` lancia `QOREX_NOT_SUPPORTED_YET` e Amino lancia `QOREX_AMINO_REFUSED`.
* **Solana:** Wallet Standard su `solana:mainnet` con connect, disconnect, eventi, `signAndSendTransaction`, `signTransaction` e `signMessage`; nessun `solana:signIn`. Il lane SVM della chain non accetta ancora transazioni, quindi il supporto Solana qui è solo lato wallet.

**Avvertenze emerse durante il test dei quickstart:**

* **cosmos-kit richiede `throwErrors`.** L'esempio del README omette `throwErrors`, che `@cosmos-kit/react` 2.24 richiede nei suoi tipi, quindi così com'è non supera il controllo dei tipi. Passate `throwErrors={false}` (o un vostro valore).
* **TypeScript strict e il mock.** `window.qorex.evm.request(...)` restituisce `unknown`, quindi la riga del README che destruttura il suo risultato fallisce con TypeScript strict. Eseguite un cast del risultato, ad esempio `as string[]` per `eth_requestAccounts`.
* **Il mock ha un proprio id EIP-6963.** Si annuncia come `network.qore.qorex.mock`, non `network.qore.qorex`. Il codice di rilevamento che seleziona QoreX rigorosamente tramite `network.qore.qorex` (incluso `discoverQorexEip1193` in `qorex-types`) quindi non trova alcun provider EVM con il mock, per design, mentre `window.qorex.evm` e il provider nativo sono presenti. Se il vostro codice seleziona il provider tramite il rilevamento, fategli accettare nei test il rdns del mock (esportato come `QOREX_MOCK_RDNS`).
* **RainbowKit tiene vivo Node.** In Node, costruire la configurazione di RainbowKit avvia timer di WalletConnect, e il processo poi non termina da solo. In una pagina è atteso. In uno script o in un test, terminate esplicitamente (ad esempio `process.exit(0)`) una volta letto ciò che serve.
* **La modalità estensione di Synpress non funziona ancora.** `qorexExtensionFixtures` è il modo pianificato per pilotare l'estensione reale e oggi lancia `QorexExtensionModeUnavailableError`, perché richiede selettori di test stabili nelle finestre di approvazione di QoreX che non sono ancora stati rilasciati. Usate la modalità mock.

**Differenze tra il mock e il wallet:** nessuna schermata di blocco né finestra di approvazione (le approvazioni sono `approveNext`, `rejectNext` o `autoApprove`); `signDirect` riporta un semplice tipo di chiave secp256k1; `signAndSendTransaction` di Solana è rifiutato; i messaggi che iniziano con "QoreX (mock):" sono propri del mock. I risultati dei test con il mock mostrano come si comporta la vostra pagina rispetto all'interfaccia descritta, non che una vera build di QoreX si comporti allo stesso modo.

**Altro:** tutti e sei i pacchetti sono una release iniziale (0.1.0), quindi aspettatevi che le loro interfacce crescano insieme a QoreX. Nessun quickstart testato copre `qorexSignAndBroadcast` rispetto a una rete live o a un wallet reale.
