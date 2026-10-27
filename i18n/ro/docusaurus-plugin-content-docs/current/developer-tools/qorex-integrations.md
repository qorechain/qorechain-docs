---
slug: /developer-tools/qorex-integrations
title: Integrări QoreX
sidebar_label: Integrări QoreX
sidebar_position: 22
---

# Integrări QoreX (`@qorechain/qorex-*`)

Integrările QoreX sunt șase pachete npm mici, pentru dezvoltatorii de dApp-uri care vor ca [portofelul QoreX](/qorex/overview) să funcționeze într-un front end EVM, Cosmos sau Solana, și pentru echipele care testează aceste front end-uri. Trei sunt conectori de portofel pentru biblioteci populare (RainbowKit, Interchain Kit, cosmos-kit), unul conține tipurile comune și ajutoarele de detecție, iar două sunt unelte de testare (un portofel mock și fixture-uri Playwright). Toate șase sunt în versiunea **0.1.0**, publicate pe 27 octombrie 2026, Apache-2.0.

Ce nu fac: nu dețin chei și nu transformă QoreX în mai mult decât este astăzi. Citiți [Limite și probleme cunoscute](#limits) înainte de a construi pe ele: build-urile QoreX live din magazine acceptă o parte din ceea ce aceste pachete pot fi conectate să facă, iar limitele sunt precizate acolo.

## Inovații {#innovations}

* **Descoperire care nu poate alege portofelul greșit.** QoreX se anunță prin EIP-6963 cu numele reverse-DNS `network.qore.qorex` și nu scrie niciodată `window.ethereum`. `@qorechain/qorex-types` selectează providerul doar după acest nume, iar portofelul RainbowKit fixează conectorul pe providerul anunțat și nu revine niciodată la `window.ethereum`.
* **Portofelul construiește semnătura hibridă, pagina nu deține niciodată cheia post-cuantică.** Lane-ul nativ al QoreChain are nevoie de o semnătură secp256k1 plus o semnătură ML-DSA-87 (FIPS 204). Pe providerul nativ (`window.qorex.native`), apelul `signAndBroadcast` predă mesajele către QoreX, care construiește tranzacția, o semnează cu ambele chei și o transmite. Rezultatul este `txHash`, `code`, `height` și `shield`, unde `shield` este `shielded` atunci când tranzacția confirmată poartă stratul hibrid.
* **Verificări de capabilități în loc de verificări de versiune.** Pachetele citesc lista `capabilities` a portofelului (`hasCapability`), astfel încât o funcție precum `signAndBroadcast` este detectată, nu ghicită dintr-un număr de versiune.
* **Refuzurile sunt explicite, cu coduri stabile.** Semnarea Amino este refuzată prin design, deoarece Amino JSON nu poate purta semnătura hibridă; conectorii aruncă `QorexIntegrationError` cu coduri precum `QOREX_AMINO_REFUSED`, `QOREX_USE_SIGN_AND_BROADCAST` și `QOREX_NOT_SUPPORTED_YET`, iar `isQorexIntegrationError(err, code)` le testează.
* **Un dublu de test care semnează cu adevărat.** `@qorechain/qorex-wallet-mock` injectează aceleași obiecte pe care le injectează QoreX (`window.qorex = { evm, native, svm }`), înregistrează un portofel Solana și semnează cu algoritmii reali (ML-DSA-87 hibrid prin QoreSign pe lane-ul nativ, secp256k1 pe EVM, ed25519 pe Solana) pornind de la fraza de test publică, implicit pe testnet. Se anunță ca `network.qore.qorex.mock`, astfel încât codul care selectează strict QoreX nu îl poate confunda cu portofelul.
* **Două profiluri de comportament.** Profilul `current` al mock-ului se comportă ca QoreX-ul live astăzi; `planned` adaugă ce a anunțat echipa QoreX, astfel încât puteți construi în avans fără ca mock-ul să pretindă ceva ce portofelul nu face încă.
* **Fixture-uri Playwright în stilul Synpress v4** (`qorexMockFixtures`) injectează mock-ul înainte de navigare, așa că un test cap-coadă nu are nevoie de nicio extensie de browser.
* **Conturi conduse de portofel, fără evenimente.** Deoarece QoreX nu emite încă `accountsChanged` sau `chainChanged`, portofelul RainbowKit are un `pollAccountsOnFocus` opt-in, care recitește `eth_accounts` și `eth_chainId` când pagina recapătă focusul.

## Cum se folosește {#how-to-use}

Blocurile de cod de mai jos sunt quickstart-urile din hub-ul pentru dezvoltatori. Fiecare a fost verificat de tip cu `tsc` și rulat pe 27 octombrie 2026, după instalarea din registrul npm public (Node 26; jsdom 30 și `react-dom/client` pentru codul de browser; Playwright 1.64 cu Chromium pentru fixture) și a trecut. Niciunul nu trimite o tranzacție și niciunul nu are nevoie de o cheie alimentată. Rezultatul observat este dat la fiecare. Comportamentul de partea portofelului (un QoreX real într-un browser real) nu a fost testat pentru această pagină.

### `@qorechain/qorex-types`: detectați QoreX {#types}

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

Observat sub mock: `QoreX EVM provider not announced`, apoi `native account: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`. Prima linie este de așteptat sub mock, vedeți [avertismentul EIP-6963](#limits). Pachetul nu are dependențe de runtime și exportă și pictograma QoreX ca data URI din `@qorechain/qorex-types/icon`. Alte exporturi: tipurile de provider, `isQorexInstalled`, `qorexSignAndBroadcast` și ajutoare pentru clasificarea refuzurilor QoreX EVM.

### `@qorechain/qorex-rainbowkit`: QoreX în RainbowKit și wagmi {#rainbowkit}

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

Observat: `[ '9801 QoreChain', '9800 QoreChain Testnet' ] 2 connectors`. `QOREX_CHAINS` conține definițiile de chain viem pentru lane-ul EVM (RPC `https://evm.qore.host` și `https://evm-testnet.qore.host`, moneda nativă QOR cu 18 zecimale, explorer `https://explore.qore.network`). `projectId` este un id de proiect WalletConnect pe care îl creați singuri la WalletConnect. Dependențe peer: `viem` ^2, `wagmi` ^2.9, `@rainbow-me/rainbowkit` ^2.2.11. Pentru a prelua schimbările de cont și de rețea făcute în portofel, folosiți `wallets: [() => qorexWallet({ pollAccountsOnFocus: true })]`.

### `@qorechain/qorex-interchain-kit`: dApp-uri Cosmos (recomandat pentru lucrări noi) {#interchain-kit}

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

Observat: componenta s-a montat în jsdom cu intrarea chain-registry a testnet-ului QoreChain (`@interchain-kit/react` 0.11.1). Dependență peer: `@interchain-kit/core` ^0.11. Trimiteți o tranzacție QoreChain cu `qorexSignAndBroadcast`:

```ts
import { qorexSignAndBroadcast } from "@qorechain/qorex-interchain-kit";

const { txHash, code, height, shield } = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],
  memo: "",
});
```

Apelul acceptă de la 1 la 32 de mesaje și un memo de cel mult 256 de octeți, iar QoreX îi cere utilizatorului să îl aprobe. Fragmentul provine din README-ul pachetului și nu a fost rulat pentru această pagină.

### `@qorechain/qorex-cosmos-kit`: dApp-uri Cosmos pe cosmos-kit {#cosmos-kit}

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

Observat: montat în jsdom cu intrarea testnet-ului QoreChain (`@cosmos-kit/react` 2.24.1). **`throwErrors={false}` este necesar pentru ca codul să treacă verificarea de tip:** `@cosmos-kit/react` 2.24 tipizează `throwErrors` ca proprietate obligatorie, iar exemplul din README-ul pachetului o omite. Dependență peer: `@cosmos-kit/core` ^2.18.1. README-ul pachetului recomandă Interchain Kit pentru dApp-urile noi. Exportă și `qorexSignAndBroadcast`.

### `@qorechain/qorex-wallet-mock`: dublu de test pentru QoreX {#wallet-mock}

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

Observat: `0x9858EfFD232B4033E47d90003D41EC34EcaEda94 0x2648 { native: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h, evm: 0x9858..., svm: HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk }`. Conturile se derivă așa cum le derivă QoreX (`m/44'/118'/0'/0/i` cu cheia ML-DSA-87 canonică a acelei adrese `qor1`, `m/44'/60'/0'/0/i` pentru EVM, `m/44'/501'/i'/0'` pentru Solana). Opțiunile includ `profile`, `mnemonic`, `accountIndex`, `chainId` (implicit `qorechain-diana`), `autoApprove` și `allowMainnet`; pagina primește și `window.__qorexMock` cu `approveNext()`, `rejectNext()`, `requests` și `switchAccount(i)`. În Playwright, injectați `mock.initScript()` cu `page.addInitScript` (Node 20.16 sau mai nou).

### `@qorechain/qorex-synpress`: fixture-uri Playwright {#synpress}

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

Observat: `1 passed`, față de o pagină locală al cărei buton Connect apelează `eth_requestAccounts` (Playwright 1.64, Chromium). Pentru a combina fixture-urile cu Synpress, instalați `@synthetixio/synpress@4.1.2` și învelițile în `testWithSynpress`. Fixture-ul `qorex` expune `addresses`, `approveNext()`, `rejectNext()`, `requests()`, `switchAccount(i)` și `disconnect()`. Dependență peer: `@playwright/test` 1.48 sau mai nou. Starea trăiește în pagină, deci fiecare navigare pornește un mock proaspăt.

## Cum se accesează {#how-to-access}

* **Un portofel QoreX pentru utilizare reală.** Conectorii comunică cu extensia de browser sau aplicația QoreX pe care utilizatorul le-a instalat; vedeți pagina [Extensia de browser QoreX](/qorex/browser-extension) pentru instalări și versiunile din magazine. Pachetele de testare nu au nevoie de niciun portofel.
* **Rețele.** Mainnet `qorechain-vladi` (EVM chain id 9801) și testnet `qorechain-diana` (EVM chain id 9800). QoreX servește doar aceste două chain id-uri QoreChain și le respinge pe celelalte cu „QoreX: unsupported chain”. Mock-ul folosește implicit testnet-ul și refuză să semneze pentru mainnet dacă nu transmiteți `allowMainnet: true`.
* **Chei și fonduri.** Pachetele nu dețin nicio cheie. Mock-ul folosește fraza de test BIP-39 publică (`abandon` repetat de 11 ori, apoi `about`), care derivă `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`; nu o alimentați niciodată. Pentru un test care transmite tranzacții, dați mock-ului propria dvs. mnemonică de testnet.
* **Alte conturi.** RainbowKit cu WalletConnect are nevoie de un id de proiect WalletConnect de la WalletConnect.
* **Cerințe preliminare.** Node.js (scriptul dintr-un singur fișier al mock-ului are nevoie de 20.16 sau mai nou), o aplicație React pentru cei trei conectori și pachetele peer listate la fiecare quickstart. Utilizatorii TypeScript primesc tipurile din `@qorechain/qorex-types`.
* **Costuri.** Pachetele sunt gratuite. O tranzacție trimisă prin QoreX plătește comisionul obișnuit (prag minim 0,1 uqor per gas).

## Unde este publicat {#where-published}

| Registru | Pachet | Versiune | Link |
| --- | --- | --- | --- |
| npm | `@qorechain/qorex-types` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-types |
| npm | `@qorechain/qorex-rainbowkit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| npm | `@qorechain/qorex-interchain-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-interchain-kit |
| npm | `@qorechain/qorex-cosmos-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit |
| npm | `@qorechain/qorex-wallet-mock` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-wallet-mock |
| npm | `@qorechain/qorex-synpress` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-synpress |

Sursa: https://github.com/qorechain/qorex-integrations (tag `v0.1.0`, foldere sub `packages/`; conține și un dApp demonstrativ, exemple și fișiere cu intrări chain-registry). Versiunile au fost citite din registrul npm pe 27 octombrie 2026. Ele înlocuiesc `@qorechain/connect`, care este depreciat pe npm: folosiți `qorex-types` pentru a detecta QoreX, `qorex-rainbowkit` pentru dApp-uri EVM, `qorex-interchain-kit` (sau `qorex-cosmos-kit`) pentru dApp-uri Cosmos și [QoreSign](/qoresign/overview) pentru semnare hibridă în propriul portofel sau backend.

## Limite și probleme cunoscute {#limits}

**Ce acceptă astăzi build-urile QoreX.** Build-urile din magazine care sunt live (aplicația mobilă QoreX 1.1.8; extensia de browser 0.3.8, și 0.3.9 pe Firefox) nu acceptă încă `getOfflineSigner` cu un strat ML-DSA adăugat de portofel și nu acceptă `signArbitrary`. Prin cosmos-kit și Interchain Kit, semnarea cu `getOfflineSigner` funcționează doar dacă pagina însăși atașează stratul post-cuantic, lucru pe care o pagină nu îl poate face în mod normal, deoarece nu deține cheia. Modul acceptat de a trimite astăzi o tranzacție pe lane-ul nativ este `window.qorex.native.signAndBroadcast`, pe care `qorexSignAndBroadcast` îl învelește. Nu considerați conectorii un portofel cosmos-kit sau Interchain Kit complet cu build-urile din magazine de astăzi, dincolo de ceea ce precizează README-ul fiecărui pachet. Conectorii sunt scriși astfel încât o versiune QoreX ulterioară să poată adăuga stratul în `signDirect` (declarat printr-o capabilitate `signDirectAddsPqcLayer`) fără nicio schimbare în codul dvs.

**La ce răspunde QoreX astăzi** (din README-urile pachetelor):

* **EVM:** `eth_chainId`, `eth_accounts`, `eth_requestAccounts` și `wallet_switchEthereumChain` pentru rețeaua selectată în QoreX (un chain necunoscut respinge cu codul 4902). Metodele de semnare (`personal_sign`, `eth_signTypedData_v4`, `eth_sendTransaction`) și `wallet_addEthereumChain` nu sunt încă acceptate și respinge cu „QoreX: EVM method ... not yet supported”. Încă nu există evenimente `accountsChanged` sau `chainChanged`. Listate de echipa QoreX ca planificate, nu live: evenimente, coduri de eroare la fiecare refuz, apoi metodele de semnare și de tranzacție.
* **Tranzacții EVM în general.** Pe QoreChain, o tranzacție EVM este acceptată doar de la un cont cu o cheie ML-DSA-87 înregistrată și o fereastră de autorizare EVM deschisă, ambele configurate de pe lane-ul nativ (vedeți [Dezvoltare EVM](/developer-guide/evm-development#evm-window)). `eth_sendTransaction` planificat al mock-ului nu deschide acea fereastră.
* **Nativ:** `enable`, `getKey`, `signDirect`, `signAndBroadcast`, `listAccounts` și `experimentalSuggestChain`, doar pentru `qorechain-vladi` și `qorechain-diana`. Pe QoreChain, `signDirect` are nevoie ca stratul hibrid să fie deja prezent, lucru pe care o pagină nu îl poate construi, așa că folosiți `signAndBroadcast`. `signArbitrary`, semnarea Amino și `sendTx` nu sunt disponibile; în conectori, `signArbitrary` aruncă `QOREX_NOT_SUPPORTED_YET`, iar Amino aruncă `QOREX_AMINO_REFUSED`.
* **Solana:** Wallet Standard pe `solana:mainnet` cu connect, disconnect, evenimente, `signAndSendTransaction`, `signTransaction` și `signMessage`; fără `solana:signIn`. Lane-ul SVM al chain-ului nu acceptă încă tranzacții, deci suportul Solana de aici este doar de partea portofelului.

**Avertismente găsite la testarea quickstart-urilor:**

* **cosmos-kit are nevoie de `throwErrors`.** Exemplul din README omite `throwErrors`, pe care `@cosmos-kit/react` 2.24 îl cere în tipurile sale, așa că nu trece verificarea de tip așa cum este scris. Transmiteți `throwErrors={false}` (sau propria valoare).
* **TypeScript strict și mock-ul.** `window.qorex.evm.request(...)` returnează `unknown`, deci linia din README care destructurează rezultatul său eșuează sub TypeScript strict. Faceți un cast al rezultatului, de exemplu `as string[]` pentru `eth_requestAccounts`.
* **Mock-ul are propriul id EIP-6963.** Se anunță ca `network.qore.qorex.mock`, nu `network.qore.qorex`. Codul de descoperire care selectează QoreX strict după `network.qore.qorex` (inclusiv `discoverQorexEip1193` din `qorex-types`) nu găsește deci niciun provider EVM sub mock, prin design, în timp ce `window.qorex.evm` și providerul nativ sunt prezente. Dacă codul dvs. selectează providerul prin descoperire, faceți-l să accepte rdns-ul mock-ului (exportat ca `QOREX_MOCK_RDNS`) în teste.
* **RainbowKit ține Node în viață.** În Node, construirea configurației RainbowKit pornește timere WalletConnect, iar procesul nu se închide singur după aceea. Aceasta este de așteptat într-o pagină. Într-un script sau un test, ieșiți explicit (de exemplu `process.exit(0)`) după ce ați citit ce aveți nevoie.
* **Modul de extensie Synpress nu funcționează încă.** `qorexExtensionFixtures` este modul planificat de a controla extensia reală și aruncă astăzi `QorexExtensionModeUnavailableError`, deoarece are nevoie de selectori de test stabili în ferestrele de aprobare QoreX, care nu au fost livrați. Folosiți modul mock.

**Diferențe între mock și portofel:** fără ecran de blocare sau fereastră de aprobare (aprobările se fac cu `approveNext`, `rejectNext` sau `autoApprove`); `signDirect` raportează un tip de cheie secp256k1 simplu; `signAndSendTransaction` Solana este refuzat; mesajele care încep cu „QoreX (mock):” sunt ale mock-ului însuși. Rezultatele testelor făcute cu mock-ul arată cum se comportă pagina dvs. față de interfața descrisă, nu că un build QoreX real se comportă la fel.

**Altele:** toate cele șase pachete sunt o versiune inițială (0.1.0), așa că așteptați-vă ca interfețele lor să crească odată cu QoreX. Niciun quickstart testat nu acoperă `qorexSignAndBroadcast` față de o rețea live sau un portofel real.
