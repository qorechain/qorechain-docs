---
slug: /developer-tools/chain-bridge
title: Chain Bridge și Handles
sidebar_label: Chain bridge și handles
sidebar_position: 3
---

# Chain bridge și handles

Această pagină acoperă două pachete mici, pentru partea de server.

**`@qorechain/chain-bridge`** (0.2.3) este o bibliotecă Node.js pentru backend-uri care acționează pe QoreChain fără o persoană la tastatură: trimite QOR, înregistrează cheia ML-DSA-87 a unui cont, înregistrează light node-uri, implementează contracte și, pentru deținătorul cheii de autoritate de licențiere a lanțului, acordă și revocă licențe. Se ocupă de cele două lucruri pe care un backend simplu nu le poate face singur: semnătura hibridă ML-DSA-87 de care au nevoie tranzacțiile pe lane-ul nativ și codificarea protobuf exactă a mesajelor personalizate ale QoreChain. Este destinat lucrătorilor de tip hot wallet, backend-urilor de plăți și de dashboard și serviciilor similare.

**`@qorechain/handles`** (0.1.0) rezolvă un `@handle` QoreX într-o adresă și verifică criptografic răspunsul înainte de a-l returna. Este destinat portofelelor și serviciilor care permit unei persoane să scrie `@alice` în loc de o adresă `qor1...`.

Niciunul dintre pachete nu listează un repository sursă în metadatele din registru. Puteți citi codul publicat pe npm.

## Inovații {#innovations}

### Chain bridge {#innovations-chain-bridge}

- **O frază mnemonică, o cheie ML-DSA-87 canonică.** Cheia este derivată ca `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` și apoi prin generarea de chei ML-DSA-87, aceeași derivare ca la [wallet adapter](/developer-tools/wallet-adapter), SDK și QoreX, deci cheia poate fi recuperată cu `qorechaind tx pqc recover-key`. Conturile înregistrate de unelte mai vechi cu `SHAKE-256(mnemonic)` își păstrează cheia veche: când o semnătură canonică este refuzată cu o eroare de verificare, bridge-ul reîncearcă o dată cu cheia veche.
- **Forma sign-bytes citită de pe lanț.** Cu `cosmosRest` setat, bridge-ul întreabă nodul pentru planurile de actualizare aplicate (`v3.2.0` și `v3.1.98`) și semnează forma v2 când oricare dintre ele este aplicat, așa cum este descris pe [pagina wallet adapter](/developer-tools/wallet-adapter#innovations). Dacă lanțul refuză cu `pqc` cod 21, rezolvă din nou o dată și semnează iar. Pe rețelele live `cosmosRest` este obligatoriu; fără el, un apel hibrid aruncă o eroare în loc să ghicească.
- **Înregistrează cheia la prima utilizare, dar verifică întâi lanțul.** Când o tranzacție hibridă este refuzată pentru lipsa unei chei PQC, bridge-ul trimite `MsgRegisterPQCKeyV2` (o tranzacție clasică, pe care lanțul o permite pentru o primă înregistrare) și reîncearcă. Deoarece acel mesaj își costă comisionul chiar și atunci când este refuzat, citește mai întâi `GET /qorechain/pqc/v1/account/{address}`: dacă contul deține deja o cheie care nu este nici cheia canonică, nici cea veche a frazei dumneavoastră mnemonice, aruncă `pqc_key_mismatch` și nu trimite nimic. Cu `cosmosRest`, o înregistrare poartă și dovada de posesie după ce rețeaua a aplicat v3.2.3 (mainnet și testnet o au ambele).
- **ID-uri de funcționalități pentru licențe din nume simple.** `featureIdsFor({ type, chains })` mapează o descriere de produs la ID-urile de funcționalități ale lanțului (`validator_operator` plus `validator_<chain>`, `lightnode_operator`, `qcb_bridge` plus `bridge_<chain>`), normalizează numele de lanț în text liber precum „Solana” sau „BNB Chain” și elimină un lanț necunoscut în loc să construiască un ID pe care lanțul l-ar respinge. Verificat pe 27 octombrie 2026: `featureIdsFor({ type: "validator", chains: ["Solana", "Ethereum", "Foo"] })` a returnat `validator_operator`, `validator_solana`, `validator_ethereum` și a eliminat `Foo`.
- **JavaScript pur, fără add-on-uri native.** Este un modul ES pentru Node.js 18 sau mai nou, deci rulează în workeri serverless. Pe lângă intrarea principală exportă `@qorechain/chain-bridge/proto` (encoderele de protocol) și `@qorechain/chain-bridge/features` (maparea funcționalităților).

### Handles {#innovations-handles}

- **O rezolvare este verificată de două ori înainte de a fi returnată.** Înregistrarea trebuie să poarte semnătura ed25519 a registrului, verificată cu o cheie publică a registrului pe care o fixați (pin) în client, și propria semnătură secp256k1 a proprietarului peste revendicare, a cărei cheie publică trebuie să dea prin hash adresa `qor1` a înregistrării. O înregistrare care pică oricare dintre verificări nu este niciodată returnată.
- **Magazia de pin-uri este a dumneavoastră.** `resolve` returnează `pin.status` ca `new`, `match` sau `CHANGED`, comparând înregistrarea cu un pin pe care îl dețineți, și nu fixează niciodată singur. Fixați după ce utilizatorul a văzut adresa și a continuat. Scopul unui pin este să observe că registrul a început să spună altceva, deci trebuie păstrat de altcineva decât partea verificată, de exemplu pe dispozitivul utilizatorului.
- **Pentru o rețea sunt returnate doar adresele semnate de proprietar.** `addressForNetwork(record, caip2)` returnează adresa `qor1` pentru rețelele QoreChain și adresa `0x` pentru ID-urile de lanț 9800 și 9801 când înregistrarea este un cont unificat. Adresele de pe alte lanțuri pe care registrul doar le atestă nu sunt returnate pentru trimitere.
- **Căutare inversă doar pentru afișare.** `reverse(address)` returnează un handle pentru afișare în istoric. Rezultatul său nu trebuie să devină niciodată destinația unei trimiteri.
- **Revendicarea și ștergerea folosesc domenii de semnare separate.** `signClaim` și `signDelete` semnează mesaje diferite, deci o semnătură de ștergere nu poate fi reluată ca revendicare.

## Cum se folosește {#how-to-use}

### Chain bridge {#use-chain-bridge}

```bash
npm install @qorechain/chain-bridge
```

Aduce `@qorechain/wallet-adapter` (^0.4.0), `@qorechain/pqc` (^0.2.1), cosmjs 0.32 și ethers 6. Nu există un quickstart testat pentru el; fragmentul de mai jos urmează tipurile pachetului și [ghidul de integrare Exchange](/developer-guide/exchange-integration#chain-bridge). Pe 27 octombrie 2026, constructorul, `featureIdsFor` și lista de metode au fost verificate pe pachetul publicat 0.2.3; nu a fost trimisă nicio tranzacție.

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc-testnet.qore.host",
  cosmosRest: "https://api-testnet.qore.host", // picks the sign-bytes form; required on both live networks
  chainId: "qorechain-diana",
  signerMnemonic: process.env.WORKER_MNEMONIC, // from your secrets manager, never in source code
});

// Once per account (the bridge also does it on first use if the chain reports no key).
await bridge.registerPqc({ mnemonic: process.env.WORKER_MNEMONIC });

// Amounts are in uqor (6 decimals): 1 QOR = 1000000.
const { txHash, code } = await bridge.sendTokens({ to: "qor1...", amountUqor: "1000000" });
```

Metodele principale:

| Metodă | Ce face | Cheia folosită |
|---|---|---|
| `sendTokens({ to, amountUqor })` | bank `MsgSend`, semnat hibrid | semnatar |
| `registerPqc({ mnemonic })` | `MsgRegisterPQCKeyV2`, clasic | acel cont |
| `registerLightNode({ operatorMnemonic, nodeType, version, capabilities })` | înregistrarea unui light node, semnată hibrid | operator |
| `grantLicense`, `grantLicenseSet`, `revokeLicense`, `suspendLicense`, `resumeLicense` | mesaje ale modulului de licențe | cheia de autoritate de licențiere a lanțului |
| `deployEvm({ bytecode, abi, args })` | o implementare în stil Ethereum prin `eth_sendRawTransaction` | cheia de implementare |
| `deploySvm({ bytecode })` | implementarea unui program SVM | semnatar |
| `createVestingAccount`, `createPeriodicVestingAccount` | crearea de conturi cu vesting | semnatar |
| `featureIdsFor`, `normalizeChain` | ajutoare locale | niciuna |

Fiecare apel returnează `{ txHash, code, height, gasUsed }`, iar un apel hibrid raportează și `signBytesVersion`. Prețul implicit al gazului este 0,1 uqor per gaz, adică pragul minim al rețelei (un `sendTokens` de 300.000 de gaz costă 30.000 uqor la acest preț, iar limita implicită de 6.000.000 de gaz pentru o înregistrare de cheie costă 600.000 uqor, pe care o plătiți o singură dată per cont). Lane-ul EVM folosește 18 zecimale: `value` din `deployEvm` este în wei. Setați `keyType: "eth_secp256k1"` în configurație pentru a semna cu cheia unificată eth-native (o identitate ca `qor1`, `0x` și SVM) în loc de cheia implicită coin-type-118; această opțiune este în sursă și în README-ul wallet adapter, dar nu în tipuri.

### Handles {#handles}

```bash
npm install @qorechain/handles
```

Singurele sale dependențe de runtime sunt `@noble/curves`, `@noble/hashes` și `bech32`. Nu există un quickstart testat pentru el. Fragmentul urmează README-ul și tipurile pachetului; pe 27 octombrie 2026, `isHandleInput`, `normalizeHandle` și lista de exporturi au fost verificate pe pachetul publicat 0.1.0, iar niciun registru nu a fost contactat.

```ts
import { HandleClient, type PinStore } from "@qorechain/handles";

const client = new HandleClient({ baseUrl: registryUrl, registryPubkeyHex });

// You supply the pin store, ideally on the user's device.
const pins: PinStore = { get: (handle) => load(handle), put: (pin) => save(pin) };

const { record, pin } = await client.resolve("@alice", pins);

if (pin.status === "CHANGED") {
  // Stop. Show both addresses in full and require explicit confirmation.
  // Never update the pin silently.
}

// Show record.qorAddress to the user. When they proceed (and only then):
await client.pin(record, pins, Date.now());
```

`resolve` aruncă o eroare când handle-ul este necunoscut, registrul nu poate fi contactat sau răspunsul nu trece verificarea. `isHandleInput(text)` deosebește un handle de o adresă (un handle are 3 până la 20 de caractere din `a-z`, `0-9` și `_`, sau începe cu `@`; un șir `qor1...` sau `0x...` nu este niciodată un handle). Alte exporturi: `claimSignBytes`, `signClaim`, `deleteSignBytes`, `signDelete`, `verifyResolution`, `checkPin`, `QorexError`. Despre cum folosește QoreX handle-urile, vedeți [Trimite către un @handle](/qorex/browser-extension#handle-send) și [Cont și Dashboard](/qorex/account-and-dashboard).

## Cum se accesează {#how-to-access}

- **Rețele:** chain bridge rulează pe mainnet `qorechain-vladi` sau testnet `qorechain-diana`, cu endpoint-urile listate în pagina [Pachete pentru dezvoltatori](/developer-tools/overview#how-to-access) (RPC-ul EVM și ID-ul de lanț 9800 sau 9801 pentru `deployEvm`).
- **Cerințe pentru chain bridge:** Node.js 18 sau mai nou; un cont alimentat a cărui frază mnemonică o deține worker-ul dumneavoastră (păstrați-o într-un manager de secrete); și URL-ul REST al rețelei. Cheia ML-DSA-87 este derivată din fraza mnemonică și înregistrată la prima utilizare, deci contul trebuie să dețină suficient QOR pentru comisionul acelei înregistrări.
- **Apelurile de licențiere** reușesc doar când sunt semnate cu cheia cu care a fost configurat lanțul drept autoritate de licențiere. Un dezvoltator din exterior nu o deține, deci aceste metode sunt pentru operatorul acelei chei. Pentru licențe și înregistrarea light node-urilor ca utilizator, vedeți [Înregistrare și licențiere](/light-node/registration-and-licensing).
- **Cerințe pentru handles:** URL-ul de bază al registrului și cheia sa publică ed25519 (hex), un pin store pe care îl implementați și `fetch`. Citirile nu necesită cont.
- **Cost:** ambele pachete sunt gratuite. Tranzacțiile chain bridge plătesc comisionul de rețea.

## Unde este publicat {#where-published}

| Registru | Pachet | Versiune | Link |
|---|---|---|---|
| npm | `@qorechain/chain-bridge` | 0.2.3 (publicat pe 20 octombrie 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/chain-bridge) |
| npm | `@qorechain/handles` | 0.1.0 (publicat în august 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/handles) |

Ambele sunt Apache-2.0 și publicate doar pe npm (nu pe PyPI, crates.io, Maven Central sau proxy-ul Go). Niciunul nu listează un repository sursă în metadatele din registru, deci nu există o pagină sursă publică de legat; codul se află în arhiva publicată. Pentru a citi versiunile live, vedeți [Cum obții versiunile live](/developer-tools/overview#live-versions).

## Limite și probleme cunoscute {#limits}

### Chain bridge {#limits-chain-bridge}

- **Implementările EVM au nevoie de o fereastră deschisă.** `deployEvm` trimite o tranzacție Ethereum standard. De la lanțul v3.2.0, lane-ul EVM admite o tranzacție doar de la un cont cu o cheie ML-DSA-87 înregistrată și o fereastră de autorizare EVM deschisă, iar bridge-ul nu are nicio metodă care să deschidă una. Deschideți fereastra cu alte unelte ([wallet adapter](/developer-tools/wallet-adapter#evm-window), SDK-ul sau QoreX) înainte de a-l apela, altfel tranzacția este refuzată (codespace `pqc`, cod 26, 27 sau 28). Aceasta urmează regulile lanțului și sursa pachetului; nu a fost încercată pe o rețea live pentru această pagină. README-ul pachetului încă numește lane-ul EVM scutit, ceea ce este depășit.
- **`deploySvm`** vizează lane-ul SVM, care nu acceptă încă tranzacții pe nicio rețea.
- **Metodele de încărcare a contractelor există, dar nu sunt documentate.** Sursa mai are `storeWasm`, `instantiateWasm` și `deployWasm` pentru contractele QoreChain Native, care nu apar în tipuri sau în README. Încărcarea este doar prin guvernanță pentru conturile obișnuite pe rețelele live, deci așteptați-vă la un refuz pentru un cont obișnuit.
- **Cheia este derivată pe server.** Fraza mnemonică rămâne în procesul dumneavoastră. Păstrați-o în afara jurnalelor și a controlului versiunilor și nu o refolosiți ca portofel personal.
- **O înregistrare nu este gratuită.** Bridge-ul înregistrează singur cheia la prima utilizare; un flux care mută fonduri ar trebui să se înregistreze în avans și să confirme rezultatul cu `GET /qorechain/pqc/v1/account/{address}` înainte de prima retragere.
- **cosmjs 0.32.** Nu îl instalați lângă SDK (cosmjs 0.39) într-un singur proiect; npm raportează `ERESOLVE`.
- **Părți depășite din README.** README-ul spune că mainnet rămâne pe prima formă de sign-bytes; ambele rețele verifică v2 (vedeți [Securitate post-cuantică](/architecture/post-quantum-security)).
- **Niciun quickstart testat, niciun repository sursă public.**

### Handles {#limits-handles}

- **Adresa registrului și cheia publică nu sunt publicate** în pachet sau în acest manual. QoreX și dashboard-ul le au încorporate, deci un integrator poate folosi pachetul doar dacă i se dau aceste două valori.
- **Handle-urile nu sunt nume pe lanț.** Registrul este un serviciu off-chain operat pentru QoreX; pachetul îi verifică răspunsurile, dar nu îl poate face disponibil. Dacă registrul este inaccesibil, `resolve` aruncă o eroare `NETWORK_UNAVAILABLE`, iar `isReachable()` este o sondă rapidă pe care o interfață o poate folosi pentru a ascunde funcțiile de handle.
- **Nu fixează nimic în locul dumneavoastră.** Dacă nu apelați niciodată `pin`, fiecare rezolvare raportează `new`. Apelantul este responsabil pentru stocarea sigură a pin-urilor.
- **Pentru trimitere se folosesc doar adresele semnate de proprietar.** Adresele de pe alte lanțuri pe care registrul le atestă nu sunt returnate de `addressForNetwork`.
- **Apelurile de scriere au nevoie de mai mult decât pachetul.** `claim`, `deleteHandle` și `bySub` comunică cu endpoint-urile de scriere ale registrului și au nevoie de o semnătură a proprietarului (`signClaim`, `signDelete`) sau de un token de cont; sunt destinate aplicațiilor de portofel.
- **Niciun quickstart testat, niciun repository sursă public.**
