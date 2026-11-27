---
slug: /qorex/dapp-integration
title: Integrează un dApp cu QoreX
sidebar_label: Integrare dApp
sidebar_position: 8
---

# Integrează un dApp cu QoreX

Acesta este ghidul complet pentru un dezvoltator care vrea ca o aplicație web să funcționeze cu portofelul QoreX: cum să îl detectezi, să te conectezi, să trimiți tranzacții QoreChain, să semnezi mesaje, să folosești EVM și Solana, să gestionezi refuzurile și să generezi linkuri care deschid QoreX. Acoperă extensia de browser QoreX și browserul dApp integrat în aplicația QoreX și spune unde diferă cele două. Exemplele de cod au fost verificate față de codul propriu al portofelului.

## Inovații {#innovations}

- **Pagina nu deține niciodată cheia post-cuantică.** `signAndBroadcast` primește mesajele tale; QoreX le arată decodificate, adaugă stratul ML-DSA-87 pe care doar portofelul îl poate face și transmite tranzacția. cosmjs, cosmos-kit și Interchain Kit funcționează neschimbate prin `getOfflineSigner`, iar QoreX adaugă același strat când tranzacția nu are niciunul.
- **Detectare după capabilitate, nu după versiune.** `window.qorex.native.capabilities` listează ce face un build, așa că o singură cale de cod funcționează pe orice versiune.
- **Nu preia nimic.** QoreX se anunță prin EIP-6963 și Solana Wallet Standard, nu setează niciodată `window.keplr` și nu suprascrie niciodată `window.ethereum` al altui portofel.
- **Semnare de mesaje cu o jumătate post-cuantică.** `signArbitrary` semnează cu cheia clasică a contului (ADR-36) și cu ML-DSA-87. Un server le verifică pe ambele cu `@qorechain/qoresign` față de cheia înregistrată pe lanț.
- **EVM pe QoreChain, explicat utilizatorului.** `personal_sign`, `eth_signTypedData_v4` și `eth_sendTransaction` sunt decodificate pe dispozitiv, simulate acolo unde nodul permite, iar aprobarea deschide fereastra de autorizare per tranzacție de care are nevoie lane-ul EVM al QoreChain.
- **Fără semnare oarbă și o listă scurtă de lucruri pe care un site nu le poate cere niciodată.** Un mesaj pe care QoreX nu îl poate afișa este refuzat, iar mesajele rezervate portofelului (gestionarea cheilor, reguli de cheltuieli, ferestre, granturi) sunt refuzate de pe orice site.
- **Linkuri pe care le poate genera un serviciu.** Deschide o pagină în aplicație, cere o plată semnată cu cheia proprie a destinatarului sau predă o propunere de la un agent.

## Ce injectează QoreX {#injected}

Pe fiecare pagină, QoreX adaugă un singur obiect, `window.qorex`, cu trei furnizori:

| Furnizor | Ce este |
|---|---|
| `window.qorex.native` | Lane-ul QoreChain (Cosmos). În stil Keplr: `enable`, `getKey`, `signAndBroadcast`, `signDirect`, `signArbitrary`, `verifyArbitrary`, `getOfflineSigner*`, plus o listă `capabilities`. Nu este un înlocuitor direct al Keplr. |
| `window.qorex.evm` | Un furnizor EIP-1193 pentru lane-ul EVM al QoreChain (și, în extensie, Ethereum). Se anunță și prin EIP-6963. |
| `window.qorex.svm` | Un furnizor Solana. În extensie, dApp-urile Solana găsesc în mod normal QoreX prin Wallet Standard. |

Ce nu face QoreX:

- Nu setează niciodată `window.keplr`. Codul care caută Keplr nu va găsi QoreX; detectează `window.qorex`.
- Nu suprascrie niciodată `window.ethereum`. Extensia nu îl setează deloc. Browserul integrat al aplicației setează `window.ethereum` doar când niciun alt portofel nu a făcut-o. Alege QoreX după numele EIP-6963, nu după `window.ethereum`.
- `signAmino` și `sendTx` nu există (vezi [cosmjs](#cosmjs)).

## Detectează QoreX {#detection}

**EVM.** Ascultă anunțurile EIP-6963 și alege-l pe cel al cărui `rdns` este `network.qore.qorex`:

```ts
const wallets = new Map<string, EIP6963ProviderDetail>();
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});
window.dispatchEvent(new Event("eip6963:requestProvider"));

const qorex = wallets.get("network.qore.qorex"); // undefined when QoreX is not there
```

**Lane-ul nativ QoreChain.** Verifică `window.qorex?.native` și citește-i capabilitățile. Verifică-le pe acestea, nu un număr de versiune:

```js
const native = window.qorex?.native;
const can = (name) => native?.capabilities?.includes(name) === true;
```

| Capabilitate | Extensie | Aplicație |
|---|---|---|
| `signAndBroadcast` | 0.3.5 | 1.2.1 (metoda este prezentă din 1.1.5) |
| `signDirectAddsPqcLayer` | 0.4.0 | 1.2.1 (comportamentul din 1.2.0) |
| `signArbitrary` | 0.4.0 | 1.2.1 (metoda este prezentă din 1.2.0) |
| `listAccounts`, `connectProofPicksAccount`, `executeRequest` | 0.3.x | nu sunt în aplicație |

Aplicația 1.2.0 are metodele, dar nu declară nicio capabilitate; ca să o acoperi, folosește ca rezervă `typeof window.qorex?.native?.signArbitrary === "function"`. `executeRequest` este puntea Dashboard, care funcționează doar pentru `dashboard.qorechain.io` (vezi [Puntea Dashboard](/qorex/browser-extension#dashboard-bridge)); celelalte site-uri nu au nevoie de ea. Build-urile 1.2.5 și 0.4.5 declară aceleași capabilități ca înainte.

**Extensie sau aplicație.** O pagină nu poate întreba cu care vorbește și nici nu ar trebui să aibă nevoie. Diferențele care contează sunt în tabelul de mai jos.

| | Extensie (desktop) | Aplicație (browser dApp integrat) |
|---|---|---|
| Lane-ul nativ QoreChain | da | da |
| Semnare EVM pe QoreChain | da | da |
| EVM pe Ethereum (`wallet_switchEthereumChain` către `0x1`, per site) | da | nu, doar rețeaua activă a QoreChain |
| Evenimente EVM (`connect`, `accountsChanged`, `chainChanged`) | toate trei | doar `connect`: browserul este închis pentru a comuta contul sau rețeaua |
| Solana (Wallet Standard) | da | nu, browserul integrat nu semnează tranzacții Solana |
| Puntea Dashboard (`connectProof`, `executeRequest`) | da, doar `dashboard.qorechain.io` | nu |
| Deschiderea unei pagini dintr-un link | nu se aplică | linkuri `browse` (vezi [Linkuri](#links)) |

Vezi [Extensia de browser](/qorex/browser-extension) și [Browserul dApp](/qorex/dapp-browser) pentru partea de utilizator a fiecăreia.

## Conectare {#connect}

Conectarea cere o singură aprobare per site, care dezvăluie doar adresa publică:

```js
await window.qorex.native.enable("qorechain-vladi"); // once per site; mainnet chain id
const key = await window.qorex.native.getKey("qorechain-vladi");
// key.bech32Address is the qor1... address; key.algo is "secp256k1", or "ethsecp256k1" for a coin-60 account
```

EVM:

```js
const [account] = await qorex.provider.request({ method: "eth_requestAccounts" });
```

`eth_accounts` returnează o listă goală până când utilizatorul aprobă site-ul și nu deschide niciodată singură o fereastră. `enable` și `eth_requestAccounts` deschid portofelul când este blocat (vezi [Portofel blocat](#locked)).

Extensia declanșează un eveniment de fereastră, `qorex_keystorechange`, când se schimbă contul, portofelul sau rețeaua. Aprobările sunt păstrate per portofel, iar utilizatorul poate revoca oricând un site la **Site-uri conectate**.

## Trimite o tranzacție QoreChain: `signAndBroadcast` {#sign-and-broadcast}

Fiecare tranzacție QoreChain dintr-un cont cu o cheie post-cuantică înregistrată trebuie să poarte o semnătură hibridă: secp256k1 **și** ML-DSA-87. Doar portofelul deține cheia ML-DSA, așa că o pagină nu poate construi singură această semnătură. Trimite mesajele, iar QoreX face restul:

1. arată utilizatorului mesajele decodificate și comisionul,
2. construiește tranzacția pentru contul selectat de utilizator,
3. adaugă semnătura hibridă (înregistrând mai întâi cheia post-cuantică a contului dacă este prima lui tranzacție),
4. transmite tranzacția și se rezolvă cu rezultatul.

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");              // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                          // must be the wallet's active network
  messages: [
    {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(msgSend).finish(),         // protobuf bytes: Uint8Array,
    },                                                 // number[] or a base64 string
  ],
  memo: "",                                            // optional, at most 256 bytes
  gasLimit: 300000,                                    // optional: 100k to 5M, default 400k
});
// res = { txHash, code, height?, shield }
```

`shield` îți spune dacă tranzacția confirmată poartă stratul hibrid: `shielded` când îl poartă, `downgraded` când a fost confirmată fără el (raportează acest caz) și `pending` sau `classical` în rest.

**Reguli**

- `chainId` trebuie să fie egal cu rețeaua activă a portofelului: `qorechain-vladi` (mainnet) sau `qorechain-diana` când utilizatorul a comutat la testnet. O nepotrivire este refuzată cu un mesaj care le numește pe amândouă. **Un dApp nu poate comuta rețeaua** (vezi [Testnet](#testnet)).
- Între 1 și 32 de mesaje per apel. Octeții mesajelor sunt semnați exact așa cum îi trimiți; portofelul nu îi recodifică.
- Un memo de cel mult 256 de octeți este afișat pe foaia de aprobare; sfârșiturile de linie și caracterele de control din el sunt afișate ca codurile lor.
- Mesajele rezervate portofelului sunt refuzate (vezi [Mesaje pe care un site nu le poate cere niciodată](#wallet-only)).
- QoreX nu va semna un mesaj pe care nu îl poate afișa. O astfel de cerere este refuzată cu `QoreX cannot show what <type> does, so it will not sign it`, inclusiv în interiorul `MsgExec`. Folosește un tip de mesaj pe care QoreX îl poate decodifica.

**Gaz și comision**

- Comisionul este `gasLimit` înmulțit cu prețul gazului din rețea (QoreX urmează minimul curent al rețelei), afișat înainte ca utilizatorul să aprobe.
- `gasLimit` trimis de tine este menținut între 100.000 și 5.000.000; fără valoare, este 400.000.
- O tranzacție care rulează cod CosmWasm sau între VM-uri este simulată mai întâi, înainte de aprobare. QoreX cere cel puțin de 1,3 ori gazul simulat, până la 20.000.000, iar o valoare mai mare trimisă de pagina ta este păstrată. Un apel pe care contractul l-ar respinge este refuzat înainte de aprobare, cu motivul lanțului. Dacă apelul are nevoie de mai mult de 20.000.000, QoreX spune acest lucru și refuză.
- O tranzacție nu poate depăși limita de gaz per tranzacție a rețelei; QoreX refuză una peste ea înainte să se semneze ceva.

Un refuz din partea utilizatorului aruncă `QoreX: signature rejected` cu codul `4001`.

## cosmjs, cosmos-kit și Interchain Kit {#cosmjs}

`getOfflineSigner(chainId)`, `getOfflineSignerOnlyDirect(chainId)` și `getOfflineSignerAuto(chainId)` returnează un `OfflineDirectSigner` cosmjs, așa că `SigningStargateClient` funcționează neschimbat:

```js
const signer = window.qorex.native.getOfflineSigner("qorechain-vladi");
const client = await SigningStargateClient.connectWithSigner(rpc, signer, {
  gasPrice: GasPrice.fromString("0.15uqor"),
});
await client.sendTokens(from, to, [{ denom: "uqor", amount: "1000" }], "auto");
```

**Stratul post-cuantic adăugat de portofel.** Când tranzacția nu poartă niciun strat ML-DSA (pe care o pagină nu îl poate face), QoreX îl adaugă: simulează costul stratului, mărește gazul și comisionul din tranzacție, semnează ML-DSA-87 peste corp și informația de comision mărită și arată utilizatorului comisionul final înainte să aprobe. Comisionul tău `"auto"` revine deci mai mare cu costul stratului, zeci de mii de gaz. Transmite întotdeauna documentul `signed` care revine, nu cel pe care l-ai trimis. Verifică `capabilities.includes("signDirectAddsPqcLayer")` înainte să te bazezi pe acest lucru.

- Contul trebuie să aibă deja cheia post-cuantică înregistrată; ea se înregistrează cu prima lui tranzacție din QoreX. Altfel apelul eșuează cu codul `4100` și motivul `pqc-key-missing`. Cere utilizatorului să trimită mai întâi o tranzacție din QoreX sau folosește `signAndBroadcast`, care înregistrează singur cheia.
- **Amino este refuzat.** `signAmino` și `getOfflineSignerOnlyAmino().signAmino` resping cu codul `4200` și motivul `amino-unsupported`, deoarece JSON-ul Amino nu poate purta semnătura hibridă. Configurează-ți biblioteca pentru semnare directă.
- Conturile importate din MetaMask (coin 60) semnează prin `signAndBroadcast`; extensia refuză `signDirect`, deci și semnatarii cosmjs, pentru ele.
- `getKey` și `getAccounts` returnează contul activ.

Într-o aplicație web, [adaptorul de portofel](/developer-tools/wallet-adapter) și pachetele [Integrări QoreX](/developer-tools/qorex-integrations) (RainbowKit, Interchain Kit, cosmos-kit) învelesc pentru tine această detectare și aceste apeluri.

## `signDirect` {#sign-direct}

`signDirect` semnează un `SignDoc` construit de pagina ta. Dacă corpul poartă deja un strat ML-DSA, QoreX îl verifică față de cheia înregistrată a contului, cum face lanțul, înainte să se deschidă vreo fereastră. Dacă nu poartă niciunul, QoreX îl adaugă așa cum este descris mai sus. Un strat care nu se potrivește cu cheia înregistrată, un mesaj rezervat portofelului, un mesaj pe care QoreX nu îl poate afișa sau mai mult de 1.000 de mesaje sunt refuzate înainte să se deschidă vreo aprobare. Pentru cod nou, `signAndBroadcast` este mai simplu.

## Semnează un mesaj: `signArbitrary` și `verifyArbitrary` {#sign-arbitrary}

```js
const message = "Log in to example.com\nNonce: 1234";
const sig = await window.qorex.native.signArbitrary("qorechain-vladi", address, message);
const ok = await window.qorex.native.verifyArbitrary("qorechain-vladi", address, message, sig);
```

Semnătura urmează [QoreSign message-signing-v1](/qoresign/spec/message-signing-v1): ADR-36 cu cheia clasică a contului (secp256k1, sau eth_secp256k1 pentru un cont coin-60), plus ML-DSA-87 peste `"qorechain-msg-v1|" + chainId + "|" + data`. Poartă și câmpurile `pub_key` și `signature` din Keplr, așa că îl poate citi codul scris pentru Keplr. Utilizatorul vede întregul mesaj. Un mesaj trebuie să aibă între 1 și 4096 de octeți și nu trebuie să înceapă cu alt domeniu de semnare QoreChain.

**Verifică pe serverul tău, niciodată în pagină.** Jumătatea ML-DSA trebuie verificată față de cheia înregistrată pe lanț pentru acea adresă, niciodată față de o cheie trimisă de client. Folosește [`@qorechain/qoresign`](/qoresign/overview):

```ts
import { verifyMessageWithChain } from "@qorechain/qoresign/network";

try {
  await verifyMessageWithChain({
    rest: "https://api.qore.host",     // the network's REST endpoint
    chainId: "qorechain-vladi",
    signer: address,                    // the qor1... address that signed
    data: message,                      // exactly the text you asked the user to sign
    signature: sig,                     // the object signArbitrary returned
  });
  // signed in
} catch (err) {
  // a QoreSignError with a stable code: the signature does not verify
}
```

`verifyMessageWithChain` preia cheia ML-DSA-87 înregistrată a semnatarului și aruncă un `QoreSignError` când ceva nu se verifică. Un cont care nu a trimis niciodată o tranzacție pe acea rețea nu are încă o cheie înregistrată și eșuează cu `KEY_NOT_REGISTERED`: cere utilizatorului să trimită mai întâi o tranzacție din QoreX. Pune în mesaj un nonce de unică folosință și domeniul tău și verifică-le pe ambele pe server, ca o semnătură să nu poată fi refolosită pe alt site. Ghidurile QoreSign acoperă mai în detaliu mesajele de autentificare.

## dApp-uri EVM {#evm}

QoreX răspunde pe EIP-6963 și, prin furnizorul său EIP-1193, semnează `personal_sign`, `eth_signTypedData_v4` și `eth_sendTransaction` pe lane-ul EVM al QoreChain (chain id **9801**, testnet **9800**). În extensie semnează și pe Ethereum după ce site-ul apelează `wallet_switchEthereumChain` către `0x1` (per site). Metodele doar de citire (`eth_call`, `eth_getBalance`, `eth_getLogs` și celelalte citiri standard) merg la nodul rețelei selectate. Orice altă metodă răspunde `4200`, iar `wallet_switchEthereumChain` sau `wallet_addEthereumChain` către orice altceva decât un lanț pentru care QoreX semnează răspunde `4902`. Un site nu poate comuta la cealaltă rețea QoreChain: aceasta răspunde `4100` cu `switch the network in QoreX itself`.

```js
const [from] = await qorex.provider.request({ method: "eth_requestAccounts" });
const hash = await qorex.provider.request({
  method: "eth_sendTransaction",
  params: [{ from, to, value: "0x0", data }],
});
```

**Ce decodifică aprobarea.** Fiecare fereastră spune ce se autorizează, decodificat pe dispozitiv: transferuri, alocări de tokeni (una nelimitată spune UNLIMITED), `setApprovalForAll`, semnături Permit și Permit2 și tranzacții Safe (un DELEGATECALL este marcat risc ridicat). Un apel pe care QoreX nu îl poate decodifica apare ca necunoscut și risc ridicat și cere o a doua apăsare. Delegările EIP-7702 sunt refuzate.

**Simulare.** Înainte de semnare, fereastra arată ce schimbă tranzacția în soldul utilizatorului.

- Cu `eth_simulateV1` (urmărirea transferurilor) pe nod, arată modificările în QOR și tokeni.
- Pe un nod fără `eth_simulateV1`, cum sunt astăzi nodurile EVM ale QoreChain, este disponibil doar `eth_call`, care spune dacă apelul ar fi anulat (revert). Un apel cu date afișează atunci "what it does to your tokens was not checked", iar utilizatorul are nevoie de o a doua apăsare ca să aprobe.
- O tranzacție care ar eșua sau pe care nodul nu o poate simula cere, de asemenea, o a doua apăsare.
- Simularea merge la același nod care ar primi tranzacția; nimic altceva nu este trimis nicăieri.

Proiectează pagina astfel încât această a doua apăsare să nu fie o surpriză: explică și în interfața ta ce face apelul.

**Fereastra de autorizare EVM, per tranzacție.** Pe QoreChain, o tranzacție EVM este admisă doar în interiorul unei ferestre de autorizare deschise de semnătura hibridă ML-DSA-87 a contului pe lane-ul nativ. Când niciuna nu acoperă tranzacția, aceeași aprobare deschide una exact pentru acea tranzacție:

- valoarea plus comisionul maxim ca limită,
- aproximativ zece minute,
- limitată la contractele pe care tranzacția le apelează, acolo unde rețeaua acceptă acest lucru.

Aprobarea numește fiecare contract pe care fereastra l-ar admite (inclusiv contractele care au verificat recent o semnătură pentru același site) și spune că înlocuiește orice fereastră deschisă de utilizator. Dacă rețeaua nu poate limita o fereastră la contracte, QoreX întreabă a doua oară, numind contractele și spunând că fereastra ar admite orice contract, înainte să deschidă una nelimitată; un "nu" nu trimite nimic. Limita de QOR acoperă tot QOR care părăsește contul, inclusiv comisionul maxim, iar un contract pe care fereastra îl lasă pe utilizator să îl apeleze poate totuși acționa pentru cont (tokeni pe care îi deține sau i-a aprobat, ori QOR deținut de alte contracte). Vezi [Fereastra de acces EVM](/qorex/security-and-recovery#evm-window).

**O fereastră deschisă manual de utilizator.** O fereastră pe care utilizatorul o deschide pe ecranul ferestrei are implicit **doar transferuri de QOR**; permiterea oricărui contract este o alegere separată, cu avertisment. Deci o fereastră deschisă mai devreme de utilizator nu va acoperi un apel de token sau de contract. Un dApp care se așteaptă să existe o fereastră ar trebui fie să lase QoreX să deschidă fereastra per tranzacție (calea cea mai simplă și cea mai îngustă), fie să îi spună utilizatorului să aleagă **orice contract** dacă o deschide singur.

**Alte reguli pe acest lane**

- Doar conturile importate din MetaMask (coin type 60) pot trimite pe lane-ul EVM al QoreChain. Alt cont răspunde `4100`, iar mesajul îi spune utilizatorului pașii următori.
- Precompile-urile de staking, distribuție, guvernanță, vesting, bank și IBC sunt refuzate (`4200`): pe QoreChain, acestea merg prin lane-ul nativ.
- Semnăturile pe lane-ul EVM sunt clasice (secp256k1). QoreX nu pretinde mai mult.
- Datele tipizate pentru alt lanț decât cel selectat sunt refuzate cu `-32602`.

## dApp-uri Solana (extensie) {#solana}

Extensia se înregistrează în Solana Wallet Standard pe Solana mainnet (`solana:mainnet`), așa că dApp-urile Solana o găsesc fără cod special. Funcții: connect, disconnect, events, `solana:signMessage`, `solana:signTransaction` și `solana:signAndSendTransaction`, pentru tranzacții legacy și v0. `connect({ silent: true })` este acceptat.

Aprobarea decodifică transferurile System, transferurile SPL Token și Token-2022, aprobările, schimbările de autoritate și închiderile de conturi și arată textul unui memo. O instrucțiune pe care QoreX nu o poate decodifica este marcată pe foaie ca ilizibilă, iar aprobarea cere o a doua apăsare. O tranzacție care nu listează portofelul ca semnatar este refuzată, iar `signMessage` nu va semna octeți care sunt de fapt o tranzacție. Semnăturile sunt clasice și marcate ca atare.

Browserul integrat al aplicației nu semnează tranzacții Solana. Solana pe QoreChain însuși este o funcție separată, doar pe testnet, din interiorul portofelului: vezi [Funcții doar pe testnet](/qorex/testnet-features).

## Când portofelul este blocat {#locked}

Începând cu extensia 0.4.5 și Safari 1.8.2, o cerere de semnare făcută cât timp QoreX este blocat (nativă, EVM sau Solana) deschide portofelul pe ecranul de parolă, numind site-ul. După ce utilizatorul deblochează, fereastra se închide, iar cererea își afișează propria aprobare. Dacă utilizatorul închide în schimb fereastra, cererea este refuzată cu codul `4001`. Înainte, o astfel de cerere eșua imediat cu "wallet is locked".

- `enable`, `getKey`, `eth_requestAccounts` și metodele de semnare trezesc portofelul în acest fel.
- Citirile pe care o pagină le face la încărcare (`eth_accounts`, `eth_chainId`, citiri din lanț) nu deschid niciodată o fereastră: `eth_accounts` returnează pur și simplu o listă goală.
- Nimic nu se semnează fără parolă, iar unei cereri în așteptare i se răspunde "nu" dacă utilizatorul comută portofelul sau blochează din nou.

Tratează `4001` ca pe un rezultat normal, nu ca pe o defecțiune.

## Mesaje pe care un site nu le poate cere niciodată {#wallet-only}

QoreX le refuză de pe orice site, pe orice cale (`signAndBroadcast`, `signDirect`, o propunere de la un agent), deoarece predau o autoritate permanentă asupra contului. Utilizatorul le face de pe ecranele proprii ale QoreX:

- gestionarea cheii post-cuantice: înregistrarea, migrarea și rotirea unei chei, cheia de criptare și înregistrarea multisig PQC;
- autentificatorii și regulile de cheltuieli: înregistrarea sau revocarea unei chei de semnare, regulile de cheltuieli, crearea unui cont abstract;
- deschiderea, închiderea și ștergerea ferestrei EVM (și consimțământul de delegare);
- deschiderea și închiderea ferestrei Solana pe QoreChain și mesajul de releu Solana;
- un grant authz (`MsgGrant`) pentru `MsgGrant` sau `MsgExec`, deoarece un astfel de grant i-ar permite beneficiarului să acționeze ca acel cont.

Refuzul se aplică direct, în interiorul `MsgExec` la orice adâncime și ca grant generic al unuia dintre aceste mesaje. Eroarea spune `QoreX: <type> is managed by the wallet itself, not by a website`.

## Erori și evenimente {#errors}

Erorile poartă un `code` EIP-1193:

| Cod | Semnificație |
|---|---|
| `4001` | Utilizatorul a refuzat sau a închis fereastra (inclusiv fereastra de deblocare). |
| `4100` | Neautorizat: cont necunoscut, nicio cheie post-cuantică înregistrată (`reason: pqc-key-missing`), un cont coin-118 care încearcă lane-ul EVM sau o cerere de comutare a rețelei. |
| `4200` | Neacceptat: Amino (`reason: amino-unsupported`), o metodă EVM pe care QoreX nu o semnează, o delegare EIP-7702, un precompile doar nativ. |
| `4901` | Lanț Solana greșit. |
| `4902` | Lanț necunoscut. |
| `-32602` | Parametri greșiți (de exemplu date tipizate pentru alt lanț). |

Evenimente:

- Furnizorul EVM: `connect`, `accountsChanged` și `chainChanged` în extensie; doar `connect` în aplicație.
- Lane-ul nativ (extensie): evenimentul de fereastră `qorex_keystorechange` când se schimbă contul, portofelul sau rețeaua. cosmos-kit îl ascultă.
- Solana Wallet Standard: `change`.

## Linkuri pe care le poate genera un serviciu {#links}

Trei linkuri deschid QoreX dintr-o altă pagină sau aplicație.

### Deschide o pagină în aplicație: `browse` {#link-browse}

```
https://link.qore.network/browse?url=<encodeURIComponent(https URL)>
qorex://browse?url=<encodeURIComponent(https URL)>
```

Pe un telefon, linkul deschide pagina ta în browserul dApp al QoreX după solicitarea biometrică obișnuită. Pagina trebuie să fie `https://` pe un nume de domeniu. QoreX refuză linkul dacă pagina are:

- un port,
- un nume de utilizator sau o parolă,
- o adresă IP,
- `localhost`,
- un backslash sau spații,
- mai mult de 2048 de caractere.

Linkul nu oferă paginii nimic. Ea cere în continuare să se conecteze, iar fiecare semnătură trece în continuare prin foaia de aprobare. Fără portofel pe telefon, aplicația rămâne la onboarding. Dacă QoreX nu este instalat, forma https afișează o pagină cu un link de unde îl poți obține. Extensia nu are link `browse`.

### Cere o plată: `qorex://pay` {#link-pay}

```
qorex://pay?v=1&net=qorechain-vladi&to=qor1...&amt=1500000&d=uqor&id=pr_...&tag=...&pk=...&sig=...
```

Un link de cerere de plată poartă destinatarul, suma în unități de bază, denominația, un id de cerere și eticheta lui din memo, o notă opțională și un @handle, rețeaua și o semnătură cu cheia proprie a contului destinatarului peste toate acestea. QoreX-ul plătitorului verifică semnătura, că cheia de semnare deține adresa destinatarului, rețeaua exactă și orice @handle, apoi arată verificarea obișnuită înainte de trimitere. O sumă sau un destinatar modificat este detectat, iar cererea este marcată plătită prin citirea lanțului.

**Generează-l cu ecranul de cerere propriu al QoreX** (aplicație, **Cereri de plată**, **Cerere nouă**), nu manual: semnătura se face cu cheia contului, pe care o pagină nu o deține niciodată. Consideră neacceptat un link pe care îl construiești sau îl modifici tu. Aceeași cerere are și o formă web, `https://link.qore.network/pay?v=1&...`, cu aceiași parametri. Pe un iPhone sau un telefon Android cu QoreX 1.2.5 deschide aplicația; în rest afișează [pagina web a cererii de plată](/qorex/send-and-receive#pay-web).

### Predă o propunere de la un agent: `qorex://propose` {#link-propose}

```
qorex://propose?d=<base64url of the proposal JSON>
```

Doar în aplicație. Linkul poartă o tranzacție propusă de un agent AI; QoreX o validează, o simulează și o arată în fereastra normală de aprobare. O propunere nu este niciodată semnată ca atare, iar un link poate purta cel mult 64 KB. Vezi mai jos [modelul agenților AI](#agents).

## Agenți AI {#agents}

Dacă construiești un agent AI care lucrează cu un portofel, modelul este că un agent poate citi ce permite utilizatorul și poate **propune** o tranzacție; nu semnează niciodată. QoreX verifică și simulează fiecare propunere, iar utilizatorul o aprobă sau o respinge în aceeași fereastră de aprobare folosită de o cerere de dApp. O propunere pentru un mesaj rezervat portofelului este refuzată înainte să se deschidă vreo fereastră. În extensie, un agent ajunge la QoreX printr-un program companion de pe computerul utilizatorului care nu este încă publicat; în aplicație, o propunere este lipită sau sosește ca link `qorex://propose`. Despre cum activează utilizatorul acest lucru și ce vede, citește [Modul dezvoltator: agenți AI](/qorex/developer-mode#ai-agents).

## Testnet {#testnet}

**Un dApp nu poate comuta rețeaua.** `chainId` dintr-o cerere trebuie să corespundă rețelei pe care se află portofelul; o nepotrivire este refuzată. Acest lucru protejează utilizatorul de o pagină care l-ar muta pe o rețea unde fondurile arată la fel, dar nu sunt.

Ca să folosească testnetul (`qorechain-diana`, chain id EVM 9800), utilizatorul comută în QoreX:

- **Aplicație:** Setări, apoi **Folosește testnet (dezvoltatori)**.
- **Extensie:** activează modul dezvoltator (atinge de șapte ori numărul versiunii din partea de jos a popupului), apoi **Comută pe testnet (diana)**. **Revino pe mainnet** revine la valoarea implicită.

Apoi pe fiecare ecran apare un banner TESTNET, soldurile de testnet nu au valoare în USD, iar rețeaua se reconfigurează fără repornire. Spune-le utilizatorilor să comute înainte să deschidă pagina ta de testnet. Funcțiile portofelului disponibile doar pe testnet (IBC, ecranul QoreChain Bridge, Solana pe QoreChain) sunt descrise în [Funcții doar pe testnet](/qorex/testnet-features).

## Depanare {#troubleshooting}

| Ce vezi | De ce și ce să faci |
|---|---|
| `window.keplr` este undefined | Intenționat. Folosește `window.qorex.native` sau o bibliotecă cu un conector QoreX. |
| `window.ethereum` nu este QoreX | Intenționat. Selectează portofelul prin EIP-6963 (`rdns` `network.qore.qorex`). |
| `QoreX: chain X does not match the active network Y` | Utilizatorul este pe cealaltă rețea. Cere-i să comute în QoreX; tu nu poți. |
| `4100`, `pqc-key-missing` | Contul nu are încă o cheie post-cuantică în rețea. Cere utilizatorului să trimită o tranzacție din QoreX sau folosește `signAndBroadcast`. |
| `4200`, `amino-unsupported` | Biblioteca ta cere Amino. Configurează semnarea directă. |
| `QoreX: <type> is managed by the wallet itself, not by a website` | Un mesaj rezervat portofelului. Elimină-l; utilizatorul face asta din QoreX. |
| `QoreX cannot show what <type> does, so it will not sign it` | Un mesaj pe care QoreX nu îl poate decodifica. Folosește un tip pe care îl poate afișa. |
| `QoreX: send between 1 and 32 messages` | Împarte cererea. |
| `QoreX: the memo may be at most 256 bytes` | Scurtează memo-ul. |
| `QoreX: a message must be 1 to 4096 bytes` | Scurtează mesajul pe care ceri să fie semnat. |
| `needs about N gas, more than the 20,000,000 QoreX allows` | Apelul de contract este prea greu pentru o singură tranzacție. Împarte-l. |
| `QoreX: EVM method X not yet supported` (`4200`) | QoreX semnează doar `personal_sign`, `eth_signTypedData_v4` și `eth_sendTransaction`. |
| `QoreX: this account uses the QoreChain (coin 118) key and cannot send on QoreChain's EVM lane` | Doar conturile importate din MetaMask (coin 60) trimit pe lane-ul EVM. |
| `QoreX: staking, rewards, IBC and governance on QoreChain go through the native lane` | Pentru acestea apelează lane-ul nativ; precompile-urile EVM sunt refuzate. |
| Un apel EVM cere mereu o a doua apăsare | Nodul nu poate verifica ce face apelul cu tokenii sau apelul nu poate fi decodificat. Explică-l în pagina ta. |
| Un apel de token eșuează deși utilizatorul a deschis o fereastră | O fereastră deschisă manual de utilizator acoperă implicit doar transferurile de QOR. Lasă QoreX să deschidă fereastra per tranzacție sau spune-i utilizatorului să aleagă orice contract. |
| `4001` imediat după ce pagina cere o semnătură | Utilizatorul a refuzat sau a închis fereastra de deblocare pe un portofel blocat. Oferă să încerce din nou. |
| `eth_accounts` returnează `[]` | Site-ul nu este încă conectat. Apelează `eth_requestAccounts`. |
| Un link `browse` nu face nimic | Adresa paginii a încălcat o regulă (port, IP, `localhost`, nu este https, peste 2048 de caractere) sau telefonul nu are încă un portofel. |
| `KEY_NOT_REGISTERED` pe serverul tău | Semnatarul nu a trimis niciodată o tranzacție pe acea rețea. Cere mai întâi una. |

Dacă problema rămâne, utilizatorul poate trimite un jurnal de cereri redactat din [Modul dezvoltator](/qorex/developer-mode), iar tu poți folosi testnetul ca să o reproduci.

## Unde este publicat {#where-published}

| Ce | Unde |
|---|---|
| Extensia de browser QoreX | Chrome Web Store, Firefox Add-ons și Mac App Store (Safari). Vezi [Extensia de browser](/qorex/browser-extension#install). |
| Aplicația QoreX și browserul ei dApp | App Store și Google Play. Vezi [QoreX Wallet](/qorex/overview#how-to-access). |
| Verificarea mesajelor și a tranzacțiilor | `@qorechain/qoresign` (TypeScript și alte limbaje). Vezi [QoreSign](/qoresign/overview). |
| Detectarea portofelului pentru aplicații web | [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) |
| Conectori RainbowKit, Interchain Kit și cosmos-kit, tipuri și un portofel de test | [`@qorechain/qorex-*`](/developer-tools/qorex-integrations) |
| SDK-ul de bază pentru construirea și trimiterea tranzacțiilor | [Unelte pentru dezvoltatori](/developer-tools/overview) |

Codul sursă QoreX nu este public. Versiunea curentă din fiecare magazin este pe pagina de [prezentare generală](/qorex/overview#versions).
