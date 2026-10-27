---
slug: /developer-tools/wallet-adapter
title: Wallet Adapter
sidebar_label: Wallet adapter
sidebar_position: 2
---

# Wallet adapter (`@qorechain/wallet-adapter`)

`@qorechain/wallet-adapter` adaugă QoreChain în portofelele Cosmos care expun `signDirect` (Keplr, Leap, Cosmostation) și construiește tranzacțiile pe care le cere lanțul: o tranzacție pe lane-ul nativ trebuie să poarte o semnătură ML-DSA-87 (FIPS 204) alături de semnătura secp256k1 clasică a contului, iar un portofel obișnuit nu o poate produce pe cea ML-DSA-87. Adaptorul o produce, o plasează în corpul tranzacției și apoi cere portofelului nemodificat o semnătură obișnuită. Este destinat dezvoltatorilor de dApp-uri și de portofele, precum și constructorilor de unelte care au nevoie în JavaScript de portofele QoreChain unificate, de mesaje pentru fereastra de autorizare EVM sau de mesaje pentru chei legate (autentificatori). Versiunea curentă este 0.4.0.

Dacă aveți nevoie doar ca un dApp să trimită o tranzacție din portofelul QoreX al unui utilizator, cea mai scurtă cale este [`qorexSignAndBroadcast`](#qorex) din acest pachet sau pachetele QoreX listate în indexul [Pachete pentru dezvoltatori](/developer-tools/overview#group-qorex). Dacă scrieți un portofel și vreți o bibliotecă completă de semnare în cinci limbaje, citiți mai întâi [QoreSign](/qoresign/overview).

## Inovații {#innovations}

- **Portofelul semnează un corp obișnuit.** Adaptorul construiește corpul fără extensie, semnează stratul ML-DSA-87 peste sign-bytes, îl pune în corp ca opțiune de extensie `/qorechain.pqc.v1.PQCHybridSignature` (id de algoritm 1) și abia apoi apelează `wallet.signDirect` pe `SignDoc`-ul finalizat. Portofelul produce o semnătură standard `SIGN_MODE_DIRECT` și nu are nevoie de cod specific QoreChain. Rezultatul este obișnuitul `TxRaw`.
- **Selector de sign-bytes per rețea.** Cheia ML-DSA-87 semnează una dintre două forme de octeți, iar o rețea o verifică exact pe una la orice înălțime. Cu `signBytesVersion: "auto"` (implicit), semnatarul întreabă nodul `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` pentru `v3.2.0` și apoi `v3.1.98`, semnează forma v2 (eticheta de domeniu `qorechain-pqc-hybrid-v2` plus ID-ul lanțului) dacă oricare dintre înălțimi este peste zero, păstrează răspunsul în cache 60 de secunde per URL REST și ID de lanț și aruncă o eroare în loc să ghicească atunci când nu poate întreba. Verificat pe 27 octombrie 2026 pe nodurile live: mainnet și testnet se rezolvă ambele la `v2`, iar un apel pentru `qorechain-vladi` fără `rest` aruncă eroare. `refreshSignBytesVersion()` ocolește cache-ul, iar `isHybridSignBytesRejection()` recunoaște refuzul `pqc` cod 21, astfel încât un apelant poate rezolva din nou și poate reîncerca o dată când o rețea se actualizează cât timp un portofel este deschis.
- **O cheie ML-DSA-87 per frază mnemonică, partajată între unelte.** `walletFromMnemonic` derivă cheia ca `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, dată generării de chei ML-DSA-87. Este legată de adresa contului și este aceeași derivare folosită de SDK, `@qorechain/chain-bridge`, QoreX și comanda `qorechaind tx pqc recover-key`, deci o singură frază mnemonică dă o singură cheie, indiferent de unealta care semnează. Vedeți [Derivare deterministă a cheilor și recuperare](/developer-guide/post-quantum-signing#key-derivation).
- **Un cont, trei forme de adresă, o singură cheie de semnare.** `generateQoreWallet` și `walletFromMnemonic` returnează împreună formele `qor1`, `0x` (EIP-55) și SVM base58 ale aceleiași identități de 20 de octeți, plus perechea de chei ML-DSA-87. `signClassicalEth` și `signHybridEth` semnează tranzacții pe lane-ul Cosmos cu acea cheie eth-native (`eth_secp256k1`), deci aceeași cheie semnează și tranzacții EVM în alte părți.
- **Coduri de recuperare PQC.** `generatePqcRecoveryCode` returnează un secret aleator de 256 de biți formatat `QRC1-` plus Crockford base32 cu o sumă de control de 24 de biți. `pqcKeyFromRecoveryCode(code, address)` derivă din el cheia ML-DSA-87, legată de adresă. Un caracter greșit tastat este refuzat cu un mesaj, în loc să derive în tăcere o cheie care nu corespunde la nimic, iar codul nu este, în mod deliberat, o frază seed.
- **QoreX ca semnatar.** `qorexSignAndBroadcast` trimite mesaje codificate protobuf (1 până la 32 per apel, memo până la 256 de octeți, limită de gaz între 100.000 și 5.000.000) către portofelul QoreX al utilizatorului, care le afișează decodate, adaugă stratul ML-DSA-87 pe care îl poate produce doar portofelul, semnează și transmite. Adaptorul verifică local limitele și refuză mesajele de gestionare a cheilor PQC (`MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`, `MsgMigratePQCKey`, `MsgRotatePQCKey`), inclusiv în interiorul unui `MsgExec` authz la orice adâncime. Un `MsgExec` pe care nu îl poate decoda este refuzat.
- **Blocuri de construcție pentru fereastra de autorizare EVM, niciodată una automată.** `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow`, `parseEvmWindow` și `isEvmWindowRejection` acoperă fereastra care trebuie să fie deschisă înainte de o trimitere EVM. Fiecare limită (`blocks` de la 1 la 17.280, `maxTxs` de la 1 la 1.000, `maxValue` peste zero) este obligatorie și verificată pe partea clientului, fără valoare implicită, câmpurile de stare ale ferestrei sunt BigInt, iar pachetul nu deschide niciodată singur o fereastră: utilizatorul trebuie să vadă un pas explicit de autorizare.
- **Mesaje pentru chei legate (autentificatori) cu rezumate exacte ca pe lanț.** `registerAuthenticatorMsg`, `registerEthAuthenticatorMsg`, `buildPhantomExecuteEvm`, `buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm` și `buildMetaMaskExecuteCosmos` construiesc mesajele care permit unei chei Phantom sau MetaMask să cheltuiască dintr-un cont QoreChain sub un set de permisiuni și o regulă de cheltuieli. `evmAuthSignBytesV2` este rezumatul din lanțul v3.2.3, care leagă și limita de gaz a apelului (aceasta trebuie să fie nenulă). Nonce-ul este secvența de autentificator a cheii legate, nu nonce-ul EVM al contului. Vedeți [Autentificatori și cheltuieli delegate](/sdk/guides/authenticators).
- **Rotație sigură a cheii.** `rotateFromLegacyWalletKey` construiește un `MsgRotatePQCKey` de la o cheie creată prin derivarea retrasă din semnătura portofelului și refuză dacă cheia pe care o rederivă nu este egală cu cea înregistrată. `rotatePqcKeyMsgFromMnemonic` mută o cheie veche `SHAKE-256(mnemonic)` la cheia canonică legată de adresă și refuză derivarea veche drept cheie nouă.

## Cum se folosește {#how-to-use}

Instalați adaptorul împreună cu cele două dependențe peer cosmjs (versiunea 0.32):

```bash
npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing
```

Pachetul este un modul ES de JavaScript simplu, cu tipuri TypeScript. Manifestul nu are un quickstart testat pentru el. Fragmentele de mai jos provin din tipurile și sursa pachetului; pe 27 octombrie 2026, generarea portofelului, resolverul de sign-bytes, citirea stării ferestrei EVM, `openEvmWindowMsg` și eroarea funcției retrase au fost rulate pe pachetul publicat 0.4.0 și pe endpoint-urile REST live de testnet și mainnet, iar cele 102 teste proprii ale pachetului trec. Fragmentele de semnare și cele QoreX nu au fost rulate cap-coadă.

### Generați un portofel unificat {#unified-wallet}

```js
import { generateQoreWallet, walletFromMnemonic } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();           // random 24-word mnemonic
// const w = await walletFromMnemonic(mnemonic); // or recover one
console.log(w.cosmos); // qor1...   (bech32)
console.log(w.evm);    // 0x...     (EIP-55)
console.log(w.svm);    // base58 form of the same 20 bytes
// w.privateKey, w.pubkey, w.pqc = { publicKey (2592 bytes), secretKey }
```

`walletFromSeed(seed32)` construiește același portofel din 32 de octeți secreți: seed-ul devine cheia privată secp256k1, deci trebuie să provină dintr-o sursă aleatorie sigură sau dintr-o funcție de derivare a cheilor aplicată unui material pe care îl deține doar utilizatorul. Nu îl derivați niciodată dintr-o semnătură pe care un site web poate cere unui portofel să o producă.

### Înregistrați lanțul în portofelele utilizatorului {#register-chain}

```js
import { qoreChainInfo, addQoreEvmToWallet } from "@qorechain/wallet-adapter";

// Keplr and other Cosmos wallets. chainId defaults to the testnet, so pass it for mainnet.
await window.keplr.experimentalSuggestChain(
  qoreChainInfo({ chainId: "qorechain-vladi", rpc: "https://rpc.qore.host", rest: "https://api.qore.host" }),
);
await window.keplr.enable("qorechain-vladi");

// MetaMask and other EIP-1193 wallets (18-decimal native currency on the EVM lane).
await addQoreEvmToWallet(window.ethereum, {
  evmChainId: 9801, testnet: false, rpcUrl: "https://evm.qore.host",
});
```

`qoreChainInfo` folosește coin type 118, prefixul bech32 `qor`, denom `uqor` cu 6 zecimale și un pas al prețului gazului de 0,1, 0,15 și 0,25 uqor per gaz, ceea ce respectă pragul minim de comision de 0,1 uqor per gaz. `addQoreEvmToWallet` are nevoie de `rpcUrl`.

### Semnați o tranzacție hibridă cu un portofel Cosmos {#sign-hybrid}

```js
import { QoreChainSigner, pqcKeyFromRecoveryCode } from "@qorechain/wallet-adapter";

const signer = window.keplr.getOfflineSigner("qorechain-vladi");
const [account] = await signer.getAccounts();

// The account's ML-DSA-87 keypair, from a recovery code. Use this in a wallet or tool that
// legitimately owns the key; a web page should send its messages to QoreX instead (see below).
const pqc = await pqcKeyFromRecoveryCode(userRecoveryCode, account.address);

const adapter = new QoreChainSigner({
  wallet: window.keplr,
  chainId: "qorechain-vladi",
  address: account.address,
  pubkeySecp256k1: account.pubkey,
  accountNumber,                 // from GET /cosmos/auth/v1beta1/accounts/{address}
  pqc,
  rest: "https://api.qore.host", // lets the signer pick the sign-bytes form this network verifies
});

const txRaw = await adapter.signHybrid({ messages, fee, sequence }); // TxRaw bytes, with .signBytesVersion
// broadcast txRaw yourself (RPC broadcast_tx_sync or REST /cosmos/tx/v1beta1/txs)
```

De știut:

- Adaptorul semnează; dumneavoastră transmiteți. Nu construiește mesajul de înregistrare a cheii. Înregistrați o singură dată cheia ML-DSA-87 a contului cu [QoreSign](/qoresign/quickstart) (`buildRegisterPqKeyMessage`), cu SDK-ul sau cu CLI-ul (vedeți [Înregistrarea cheii](/developer-guide/post-quantum-signing#pqc-key-registration)); acea primă tranzacție este cea care poate fi semnată clasic.
- O pagină web care deține cheia ML-DSA-87 a contului este un design de evitat. `derivePqcKeyFromWallet`, care obișnuia să o deriveze dintr-o semnătură a portofelului, a fost retrasă în 0.3.0 și aruncă mereu o eroare. Un dApp ar trebui să trimită mesajele către QoreX (mai jos) și să lase portofelul să semneze.
- Dacă o transmisie este refuzată cu `pqc` cod 21 și ați folosit `"auto"`, apelați `adapter.refreshSignBytesVersion()` și semnați încă o dată; nu reîncercați dacă ați transmis explicit `"v1"` sau `"v2"`. Vedeți [Depanarea codului 21](/developer-guide/post-quantum-signing#code-21).

### Trimiteți prin QoreX {#qorex}

```js
import {
  hasQorexSignAndBroadcast, qorexSignAndBroadcast, isQorexRejection,
} from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

if (!hasQorexSignAndBroadcast()) throw new Error("Install or update QoreX");

try {
  const { txHash, code } = await qorexSignAndBroadcast({
    chainId: "qorechain-vladi",   // must equal the wallet's active network
    messages: [{
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress, amount })).finish(),
    }],
    gasLimit: 300_000,            // optional, 100,000 to 5,000,000
  });
  if (code !== 0) throw new Error(`rejected by the chain with code ${code}`);
} catch (err) {
  if (isQorexRejection(err)) return; // the user declined; not a failure
  throw err;
}
```

`value` este protobuf în octeți (un `Uint8Array`, un array de numere sau base64), semnat exact așa cum este dat. Un dApp nu poate schimba rețeaua portofelului. Are nevoie de extensia QoreX 0.3.5 sau de aplicația 1.1.5 ori mai nouă; testați cu `hasQorexSignAndBroadcast()` în loc de o verificare de versiune. Contractul la nivel de protocol este în [Extensia de Browser QoreX](/qorex/browser-extension#sign-and-broadcast).

### Construiți un mesaj pentru fereastra EVM {#evm-window}

```js
import { openEvmWindowMsg, fetchEvmWindow } from "@qorechain/wallet-adapter";

const status = await fetchEvmWindow({ rest: "https://api.qore.host", address: qor1 });
if (!status.live) {
  const msg = openEvmWindowMsg({
    sender: qor1,
    blocks: 300,        // 1 to 17280
    maxTxs: 3,          // 1 to 1000
    maxValue: "250000", // uqor: value plus the maximum fee of each admitted transaction
  });
  // sign it with signHybrid (or signHybridEth) and broadcast: it is an ordinary Cosmos-lane message
}
```

Ordinea contează: deschideți fereastra, apoi citiți nonce-ul EVM, apoi semnați tranzacția EVM, deoarece deschiderea unei ferestre avansează secvența contului, care este și nonce-ul său EVM. `openEvmWindowMsg` construiește doar forma fără domeniu a ferestrei; o fereastră cu domeniu (`native_only`, `allowed_targets`) are nevoie de SDK. Context: [Fereastra de autorizare EVM](/sdk/guides/evm#evm-window) și [Prima tranzacție](/getting-started/first-transaction#evm-window).

### Alte puncte de intrare

| Sarcină | Funcții |
|---|---|
| Recuperarea sau rotirea unei chei PQC | `generatePqcRecoveryCode`, `pqcKeyFromRecoveryCode`, `isValidRecoveryCode`, `rotatePqcKeyMsgFromMnemonic`, `rotateFromLegacyWalletKey`, `rotatePqcKeyMsg` |
| Semnarea cu cheia eth-native | `signClassicalEth` (înregistrarea clasică a cheii), `signHybridEth` |
| Ajutoare pentru sign-bytes | `hybridSignBytes(version, chainId, body, authInfo)`, `resolveSignBytesVersion`, `signBytesVersionFor`, `SIGN_BYTES_V2_UPGRADES` |
| Legarea și cheltuirea cu o cheie externă | `registerAuthenticatorMsg`, `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`, funcțiile `buildPhantom*` și `buildMetaMask*` |

## Cum se accesează {#how-to-access}

- **Rețele:** mainnet `qorechain-vladi` și testnet `qorechain-diana`. Transmiteți `chainId` și URL-ul `rest` corespunzător ([endpoint-uri](/developer-tools/overview#how-to-access)).
- **Portofele:** Keplr este portofelul folosit de ghidul QoreSign și de exemple ([portofele compatibile Keplr](/qoresign/guides/keplr-compatible-wallets)). Leap și Cosmostation expun aceeași interfață `signDirect`, iar pachetul este scris pentru orice astfel de portofel; nu a fost verificat cu ele pentru această pagină. MetaMask folosește lane-ul EVM, nu semnatarul adaptorului, și are nevoie de o fereastră EVM deschisă pentru fiecare trimitere ([Pachete pentru dezvoltatori](/developer-tools/overview#how-to-access)). Phantom se leagă ca autentificator.
- **Cont și cheie:** un cont alimentat cu QOR pentru comision și cheia ML-DSA-87 a contului înregistrată pe lanț înainte de prima tranzacție hibridă.
- **Cerințe preliminare:** Node.js cu module ES sau un bundler pentru browser. Dependențe peer `@cosmjs/stargate` și `@cosmjs/proto-signing` `^0.32`. Dependențe de runtime: `@qorechain/pqc` `^0.2.1`, `cosmjs-types` `^0.9.0`, `@cosmjs/crypto` și `@cosmjs/encoding` `^0.32`.
- **Cost:** pachetul este gratuit; tranzacțiile plătesc comisionul de rețea de 0,1 uqor per gaz sau mai mult. Înregistrarea unei chei folosește o limită de gaz mare, deoarece cheia publică ML-DSA-87 are 2.592 de octeți.

## Unde este publicat {#where-published}

| Registru | Pachet | Versiune | Link |
|---|---|---|---|
| npm | `@qorechain/wallet-adapter` | 0.4.0 (publicat pe 20 octombrie 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/wallet-adapter) |

Sursa: [github.com/qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter) (publică, tag `v0.4.0`, Apache-2.0). Nu este publicat pe PyPI, crates.io, Maven Central sau proxy-ul Go. Pagini conexe: [Pachete pentru dezvoltatori](/developer-tools/overview), [QoreSign](/qoresign/overview), [Semnare post-cuantică](/developer-guide/post-quantum-signing), [Integrare Exchange](/developer-guide/exchange-integration).

## Limite și probleme cunoscute {#limits}

- **Semnează; nu transmite, nu înregistrează chei și nu deschide ferestre.** Nu există nicio funcție care să înregistreze cheia ML-DSA-87 și nimic nu deschide o fereastră EVM în locul dumneavoastră.
- **Fără dovadă de posesie.** O înregistrare de cheie făcută cu unelte care folosesc doar acest pachet nu poartă una. Lanțul o acceptă oricum și verifică dovada atunci când este prezentă ([Dovadă de posesie](/developer-guide/post-quantum-signing#proof-of-possession)).
- **`derivePqcKeyFromWallet` este retrasă** (0.3.0) și aruncă mereu o eroare. Conturile care au înregistrat o cheie cu ea ar trebui să o rotească cu `rotateFromLegacyWalletKey`.
- **Doar ferestre fără domeniu.** `openEvmWindowMsg` nu are câmpuri de domeniu.
- **`qoreChainInfo` folosește implicit testnet-ul.** Transmiteți mereu `chainId` pentru mainnet.
- **Nonce-urile autentificatorilor.** Nicio interogare nu expune încă secvența de autentificator a cheii legate, deci trebuie să o urmăriți dumneavoastră; lanțul răspunde cu `abstractaccount` cod 11 când valoarea este greșită. Modulul de autentificatori este activat pe testnet și dezactivat pe mainnet (vedeți [Prezentarea generală a SDK-ului](/sdk/overview)).
- **Dependențe peer cosmjs 0.32.** SDK-ul folosește cosmjs 0.39; instalarea ambelor într-un singur proiect dă o eroare `ERESOLVE`, așa că țineți-le separate sau folosiți `--legacy-peer-deps`.
- **Nu copiați din README-ul pachetului.** Încă spune că mainnet verifică prima formă de sign-bytes și că o trimitere MetaMask nu are nevoie de niciun pas suplimentar. Ambele sunt depășite: ambele rețele verifică v2, iar o trimitere EVM are nevoie de o cheie înregistrată și de o fereastră deschisă.
- **Niciun quickstart testat** nu este înregistrat pentru acest pachet, iar calea QoreX necesită portofelul instalat, deci nu poate rula într-un script.
