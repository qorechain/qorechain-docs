---
slug: /sdk/faq
title: Întrebări frecvente și depanare
sidebar_label: Întrebări frecvente
sidebar_position: 8
---

# Întrebări frecvente și depanare

## Este mainnet-ul activ?

Da. Mainnet-ul este **activ** (chain id `qorechain-vladi`). Presetul de testnet
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
citirile CosmWasm îl folosesc de asemenea. Citirile REST folosesc `rest`;
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

Toate. Nucleul TypeScript (`@qorechain/sdk`, 0.8.3), adaptoarele EVM/SVM
(`@qorechain/evm`, `@qorechain/svm`, 0.8.0), kitul React (`@qorechain/react`,
0.8.3) și scaffolder-ul `create-qorechain-dapp` (0.8.0) sunt pe npm; clientul
Python este pe PyPI (`pip install qorechain-sdk` la 0.8.3, import `qorsdk`);
clientul Go este pe module proxy
(`go get github.com/qorechain/qorechain-sdk/packages/go/...`, tag
`packages/go/v0.8.4`); clientul Rust este pe crates.io (`cargo add qorechain-sdk`,
0.8.3); iar clientul Java este pe Maven Central
(`io.github.qorechain:qorechain-sdk:0.8.3`). Vedeți [Instalare](/sdk/install)
pentru comenzile complete pentru fiecare limbaj.

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
o cheie la prima utilizare.
Lanțul acceptă orice semnătură ML-DSA-87 validă conform FIPS-204, hedged sau
deterministă. SDK-ul semnează determinist în mod implicit (începând cu 0.5.1)
pentru ca o tranzacție să aibă mereu aceeași semnătură și același hash de tx.
Dacă o tx hibridă eșuează cu `pqc` cod 21 (`hybrid_verify_failed`), cauza este
versiunea sign-bytes, chain-id-ul, o bibliotecă PQC învechită sau o cheie
neînregistrată, niciodată semnarea hedged.
Ambele rețele verifică forma v2 a sign-bytes, așa că folosiți SDK **0.8.1 sau
mai nou** și transmiteți `rest` (sau `signBytesVersion`): builder-ele aruncă o
eroare pe `qorechain-vladi` / `qorechain-diana` dacă lipsesc amândouă. Vedeți
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

## Cheltuirea mea prin authenticator este respinsă cu `authenticator_replay`

(Modulul `abstractaccount` este dezactivat acum pe ambele rețele; o cheltuire
este refuzată cu `abstract account module is disabled` înainte de verificarea
oricărui nonce. Vedeți [Authenticators și cheltuire delegată](/sdk/guides/authenticators).
Indicațiile de mai jos se aplică după ce modulul este activat.)

Nonce-ul este greșit. `MsgExecuteEVM.nonce` trebuie să fie nonce-ul EVM
**curent** al contului (relayer-ul este un cont diferit, deci **nu** adăugați
1); `MsgExecuteCosmos.nonce` este **secvența per-authenticator** pentru
`(account, pubkey)`, un contor de stocare separat. Reobțineți valoarea și
semnați din nou. Alte eșecuri ale authenticator-ului se decodează prin
`decodeTxError`: codurile `abstractaccount` 5 (`spending_limit_exceeded`),
6 (`session_key_expired`) și 10 (`permission_denied`). Vedeți
[Authenticators și cheltuire delegată](/sdk/guides/authenticators).
