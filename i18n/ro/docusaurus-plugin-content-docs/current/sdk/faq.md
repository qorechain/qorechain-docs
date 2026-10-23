---
slug: /sdk/faq
title: Întrebări frecvente și depanare
sidebar_label: Întrebări frecvente
sidebar_position: 8
---

# Întrebări frecvente și depanare

## Este mainnet-ul activ?

Da. Mainnet-ul este **activ** (chain id `qorechain-vladi`, activ din 7 iunie 2026)
și rulează versiunea de chain v3.2.4 (aplicată la înălțimea 3.742.566 pe 23 octombrie 2026, propunerea de guvernanță 13); testnet-ul rulează v3.2.4 din 19 octombrie 2026. Presetul de testnet
(`qorechain-diana`) rămâne de asemenea disponibil. Ambele preseturi vin cu
endpoint-uri implicite pe localhost; selectați rețeaua cu
`createClient({ network: "mainnet" })` și suprascrieți `endpoints` cu URL-urile
nodurilor dvs. Vedeți
[Rețea și endpoint-uri](/sdk/reference/network).

## De ce apelurile mele merg către localhost?

`createClient()` folosește implicit endpoint-uri **localhost**. Pentru a
comunica cu un nod real, transmiteți un obiect `endpoints`:

```ts
const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",
    rpc: "https://rpc-testnet.qore.host",
    evmRpc: "https://evm-testnet.qore.host",
  },
});
```

Calea de semnare (`connectTx`) are nevoie de endpoint-ul de consens **`rpc`**;
citirile QoreChain Native îl folosesc de asemenea. Citirile REST folosesc `rest`;
apelurile EVM folosesc `evmRpc` (la fel și apelurile `qor_`, pe un nod care
servește acel namespace). URL-urile de mainnet se găsesc în
[referința de rețea](/sdk/reference/network#public-endpoints).

## „Cannot find module 'viem'" / „'@solana/web3.js'"

Acestea sunt **peer dependencies** pentru `@qorechain/evm` și respectiv
`@qorechain/svm`. Instalați-le în proiectul dvs.:

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## Un apel de precompile aruncă „returned no data" / „feature not present"

Precompile-urile EVM QoreChain sunt compilate în nod, dar **nu sunt încă active**
pe mainnet sau testnet: răspund doar acolo unde adresele lor sunt listate în
parametrul `active_static_precompiles` al modulului EVM, iar lista aceea este
goală pe ambele rețele. În prezent apelul returnează date goale, așa că viem
raportează `returned no data ("0x")`, iar funcția ajutătoare aruncă o eroare și pe
rețelele publice (vedeți
[Precompile-uri EVM: starea în rețea](/developer-guide/evm-precompiles#network-status)).
Pe un nod EVM obișnuit apelurile eșuează în același mod. Verificați
`GET /cosmos/evm/vm/v1/params` și înveliți fiecare apel de precompile pentru ca
eroarea să fie tratată per apel.

## Apelul meu `client.qor` eșuează cu -32601

`client.qor` apelează namespace-ul JSON-RPC `qor_`, pe care nicio versiune
publicată a nodului nu îl servește; `rpc_modules` pe endpoint-urile EVM publice
listează doar `eth`, `net`, `rpc`, `txpool` și `web3`. Folosiți în schimb o rută
REST, de exemplu `GET /qorechain/pqc/v1/account/{address}` (starea cheii PQC) sau
`GET /qorechain/burn/v1/stats`, prin `client.rest.get(...)`. Vedeți
[namespace-ul `qor_`](/api-reference/json-rpc-qor_-namespace).

## Sumele mele sunt greșite cu un factor de un milion

QOR are unități de bază `uqor` de **10^6**. Folosiți `toBase` / `fromBase` și
faceți toate calculele în unități de bază:

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

Rețineți că runtime-ul EVM reprezintă QOR cu **18** zecimale (convenția EVM),
ceea ce este diferit de baza `uqor` Native de 10^6.

## Ce pachete sunt publicate și unde?

Toate (verificat la 21 octombrie 2026). Nucleul TypeScript (`@qorechain/sdk`, 0.9.0),
kitul React (`@qorechain/react`, 0.9.0), scaffolder-ul `create-qorechain-dapp`
(0.9.0) și adaptoarele EVM/SVM (`@qorechain/evm`, `@qorechain/svm`, 0.8.0) sunt pe
npm; clientul Python este pe PyPI (`pip install qorechain-sdk` la 0.9.0, import
`qorsdk`); clientul Go este pe module proxy
(`go get github.com/qorechain/qorechain-sdk/packages/go@v0.9.0`); clientul Rust este
pe crates.io (`cargo add qorechain-sdk`, 0.9.0); iar clientul Java este pe Maven
Central (`io.github.qorechain:qorechain-sdk:0.9.1`; celelalte limbaje au 0.9.0). Vedeți [Instalare](/sdk/install) pentru comenzile complete
pentru fiecare limbaj.

## Mnemonicul meu este respins

SDK-ul validează atât lista de cuvinte BIP-39, **cât și** suma de control
înainte de a deriva orice cheie, astfel încât o frază cu greșeli de tastare
aruncă o eroare în loc să producă în tăcere contul greșit. Verificați din nou
cuvintele; folosiți `validateMnemonic` pentru a testa o frază.

## Tranzacții hibride (PQC)

Trimiterea hibridă (clasic + ML-DSA-87) este **activă și obligatorie** pe calea
Native — tranzacțiile Native doar clasice sunt respinse on-chain (chain
v3.2.0). Înainte ca o tranzacție hibridă să treacă verificarea PQC, cheia
publică PQC a semnatarului trebuie să fie **înregistrată explicit** cu
`MsgRegisterPQCKeyV2` (o tranzacție semnată clasic, exceptată de la cerința
hibridă); încorporarea cheii publice în extensie
(`includePqcPublicKey: true`) **nu** o înregistrează, iar lanțul nu înregistrează
o cheie la prima utilizare. În TypeScript, dați clientului perechea de chei
(`client.connectTx(signer, { pqcKeypair })`, SDK 0.9.0) și fiecare tranzacție pe
care o trimite este semnată hibrid.
Lanțul acceptă orice semnătură ML-DSA-87 validă conform FIPS-204, hedged sau
deterministă. SDK-ul semnează determinist în mod implicit (începând cu 0.5.1)
pentru ca o tranzacție să aibă mereu aceeași semnătură și același hash de tx.
Dacă o tx hibridă eșuează cu `pqc` cod 21 (`hybrid_verify_failed`), cauza este
versiunea sign-bytes, chain-id-ul, o bibliotecă PQC învechită sau o cheie
neînregistrată ori diferită, niciodată semnarea hedged.
Ambele rețele verifică forma v2 a sign-bytes, așa că folosiți SDK **0.8.1 sau
mai nou** (0.9.0 este cel curent) și transmiteți `rest` (sau `signBytesVersion`):
builder-ele aruncă o eroare pe `qorechain-vladi` / `qorechain-diana` dacă lipsesc
amândouă. Vedeți
[Depanarea codului 21](/developer-guide/post-quantum-signing#code-21) și
[Conturi și semnare PQC](/sdk/concepts/accounts-pqc).

## Tranzacția mea EVM este refuzată cu „no open EVM authorisation window"

Începând cu chain v3.2.0, lane-ul EVM admite o tranzacție doar de la un cont care
are o cheie PQC înregistrată și o fereastră de autorizare deschisă. Înregistrați o
cheie, deschideți o fereastră, apoi trimiteți. Vedeți
[Fereastra de autorizare EVM](/sdk/guides/evm#evm-window). Cu SDK-ul,
`classifyEvmWindowRejection(err)` returnează `"no-pqc-key"`, `"no-window"`,
`"exhausted"` sau `"invalid"`.

## Tranzacțiile mele hibride eșuează la CheckTx cu o eroare de parsare a tranzacției

Actualizați SDK-ul. Versiunile **0.6.0 și anterioare** serializau în JSON
extensia de corp de tranzacție `/qorechain.pqc.v1.PQCHybridSignature`, pe care
decodorul de tranzacții al lanțului o respinge la CheckTx. Începând cu
**0.6.1** extensia este codificată protobuf (valoarea începe cu `0x08`) în
toate cele cinci limbaje — tranzacțiile hibride construite cu versiuni mai
vechi sunt respinse on-chain, pe fiecare cale (inclusiv eth-native).

## Cu ce versiuni de chain funcționează SDK-ul?

SDK **0.9.0** este versiunea de client pentru chain v3.2.2 și v3.2.3: tranzacționează pe
mainnet și pe testnet **v3.2.4** (mainnet din 23 octombrie 2026) și are constructori pentru dovada de
posesie opțională la înregistrare (atașată automat de `ensurePqcRegistered` odată ce
rețeaua a aplicat v3.2.3), pentru ferestrele EVM cu domeniu limitat și pentru mesajele
de consimțământ EIP-7702.
SDK **0.8.1 sau mai nou** tranzacționează de asemenea pe ambele rețele (forma v2 a
sign-bytes hibride, înregistrarea, trimiterile hibride și fereastra EVM funcționează
neschimbat), dar nu are niciunul dintre acei constructori: folosiți CLI-ul pentru ei
(vedeți
[Versiuni anterioare lui 0.9.0](/sdk/install#before-090)). v3.2.4 rulează pe testnet
din 19 octombrie 2026 și pe mainnet din 23 octombrie 2026 (înălțimea 3.742.566, propunerea de guvernanță 13);
SDK-ul nu setează niciun câmp v3.2.4, deci tranzacțiile sale sunt valide înainte și după upgrade.

## Înregistrarea cheii mele PQC a fost refuzată, dar taxa a fost luată

O înregistrare pentru un cont care deține deja o cheie este refuzată de chain după
ce taxa a fost dedusă. `ensurePqcRegistered` din 0.9.0 citește mai întâi
`GET /qorechain/pqc/v1/account/{address}` (transmiteți `rest`), omite înregistrarea
când cheia acestei perechi de chei este înregistrată și aruncă `PqcKeyMismatchError`
când este înregistrată alta. Versiunile anterioare nu verificau mai întâi, decât dacă
transmiteați dvs. `status: { registered: found }`, unde `found` provine din acea rută.
Începând cu v3.2.3, chain-ul refuză de asemenea cheile slabe, degenerate și
refolosite; cheile de la `derivePqcCanonical` sau `tx pqc gen-key` sunt în regulă.

## `create-qorechain-dapp` instalează un SDK care nu poate semna

Doar versiunea 0.8.0 a scaffolder-ului: scria intervale `^0.3.0` pentru
`@qorechain/sdk` și `@qorechain/evm`, iar un interval caret pe o versiune 0.x rămâne
în interiorul lui 0.3. Versiunea 0.9.0 generează proiectul pe SDK-ul curent; dacă ați
folosit 0.8.0, rulați `npm i @qorechain/sdk@latest` (și `@qorechain/evm@latest`) după
generarea proiectului.

## `VERSION` spune 0.8.0, dar am instalat 0.8.3

Constanta exportată `VERSION` din 0.8.3 nu a fost actualizată și raportează `0.8.0`;
începând cu 0.9.0 corespunde pachetului. În versiunile anterioare, citiți versiunea
instalată din `package.json`.

## Cheltuirea mea prin authenticator este respinsă cu `authenticator_replay`

(Modulul `abstractaccount` este dezactivat acum pe ambele rețele; o cheltuire
este refuzată cu `abstract account module is disabled` înainte de verificarea
oricărui nonce. Vedeți [Authenticators și cheltuire delegată](/sdk/guides/authenticators).
Indicațiile de mai jos se aplică după ce modulul este activat.)

Nonce-ul este greșit. Atât `MsgExecuteEVM.nonce`, cât și `MsgExecuteCosmos.nonce`
sunt **secvența de authenticator** a cheii legate pentru `(account, pubkey)`: un
contor pe care chain-ul îl ține pentru fiecare cheie legată, pornind de la 0 și
incrementat la fiecare execuție reușită. **Nu** este nonce-ul EVM al contului și nu
există încă o interogare pentru el, așa că urmăriți-l pentru fiecare cheie legată.
Începând cu v3.2.3, lane-ul EVM semnează și `evmAuthSignBytesV2`, care leagă limita
de gas a apelului (`resolveEvmAuthDigestVersion` alege forma). Folosiți contorul pe
care îl urmăriți pentru acea cheie și semnați din nou.

Alte eșecuri ale authenticator-ului se decodează prin `decodeTxError`: codurile
`abstractaccount` 5 (`spending_limit_exceeded`), 6 (`session_key_expired`) și
10 (`permission_denied`). Vedeți
[Authenticators și cheltuire delegată](/sdk/guides/authenticators).
