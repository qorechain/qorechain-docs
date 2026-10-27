---
slug: /dashboard/developers
title: Dezvoltatori
sidebar_label: Dezvoltatori
sidebar_position: 13
---

# Dezvoltatori

Pagina **Developers** (`/developers`, bara laterală **Build**, intrarea **Developers**) este o trusă de unelte publică pentru cei care construiesc pe QoreChain. Are șase tab-uri: **SDKs**, **PQ key status**, **Simulator**, **Signing playground**, **QoreX test wallet** și **AI agents (MCP)**. Poți verifica ce cheie post-cuantică are înregistrată un cont și dacă fereastra sa de autorizare EVM este deschisă, poți rula în simulare (dry-run) o tranzacție semnată, poți exersa semnarea hibridă cu o cheie de unică folosință și poți testa o aplicație dApp cu un portofel QoreX simulat (mock), totul în browser și fără cont. Este destinată dezvoltatorilor de dApp-uri, de portofele și de backend. Pentru SDK-urile în sine vezi [Prezentare generală SDK](/sdk/overview) și [Instalare](/sdk/install).

## Inovații {#innovations}

- **Citește o cheie PQC și fereastra EVM din lanț, pentru orice adresă.** Tab-ul PQ key status caută cheia ML-DSA-87 înregistrată de un cont și fereastra sa de autorizare EVM prin rutele de interogare proprii ale lanțului, pe mainnet sau testnet. Acceptă adrese `qor1...`, `0x...` și `qorvaloper1...`.
- **Un dry-run care nu transmite nimic.** Simulatorul trimite o tranzacție semnată către ruta de simulare a lanțului și raportează gazul folosit, o limită de gas sugerată, precum și modificările de sold și evenimentele pe care tranzacția le-ar produce. Singura rută de scriere pe care Dashboard-ul o expune în acest scop este simularea.
- **Semnare hibridă în browser, cu o cheie care nu îl părăsește niciodată.** Signing playground generează în pagină o frază de unică folosință de 24 de cuvinte, derivă o cheie secp256k1 și o cheie ML-DSA-87 și semnează și verifică mesaje și cereri Sign In With QoreChain cu biblioteca [QoreSign](/qoresign/overview). Cheia există doar în memorie și dispare la reîncărcare.
- **Un QoreX simulat pentru testarea dApp-urilor.** QoreX test wallet instalează `window.qorex` și se anunță prin EIP-6963 drept „QoreX (mock)" în tab-ul curent, cu semnare hibridă reală pe testnet și aprobare sau respingere manuală pentru fiecare cerere.
- **Doar testnet, prin construcție.** Signing playground și test wallet refuză mainnet-ul: semnează doar pentru `qorechain-diana`. Cele două tab-uri doar pentru citire pot indica oricare rețea.

## Cum se folosește {#how-to-use}

Pagina se deschide pe tab-ul **SDKs**. Tab-urile **PQ key status** și **Simulator** afișează un comutator **Network** local paginii, care are ca **valoare implicită Testnet**, indiferent ce arată antetul. (Se folosește un comutator la nivel de pagină pentru ca schimbarea rețelei să nu reîncarce pagina și să nu șteargă cheile din memorie și portofelul de test.)

### PQ key status {#pq-status}

1. Deschide tab-ul **PQ key status** și alege rețeaua.
2. Introdu o **Account address** (`qor1...`, `0x...` sau `qorvaloper1...`). O adresă `0x` reprezintă aceiași 20 de octeți ca forma sa `qor1`; o adresă `qorvaloper` este căutată ca propriul cont al operatorului. Pagina verifică formatul și suma de control.
3. Selectează **Check**.
4. **Registered PQC key** arată dacă o cheie este înregistrată, algoritmul ei (ML-DSA-87), tipul cheii, **Proof of possession** (lanțul o tratează ca opțională) și cheia publică. Dacă nu există niciuna, spune acest lucru.
5. **EVM authorisation window** arată starea (**Open** sau **Closed**), **Blocks left**, **Transactions used** (de exemplu „3 of 20"), **Value used**, înălțimile de deschidere și de expirare, dacă fereastra este **Native QOR transfers only** și eventualele ținte permise. Dacă contul nu a deschis niciodată una, spune „No EVM authorisation window has been opened for this account."

Fereastra se deschide de pe lane-ul nativ cu cheia ML-DSA-87 a contului și se închide când este atinsă limita de blocuri sau limita de tranzacții; vezi [Fereastra de autorizare EVM](/developer-guide/evm-development#evm-window). Acest tab răspunde la întrebarea frecventă „de ce a fost refuzată tranzacția mea EVM?" fără linie de comandă.

### Simulator {#simulator}

1. Deschide tab-ul **Simulator** și alege rețeaua.
2. Lipește un **Signed TxRaw** (base64 sau hex) în casetă. Pagina îți spune dimensiunea decodată și numărul de semnături și avertizează dacă nu există niciuna (lanțul va refuza cel mai probabil să simuleze o tranzacție nesemnată).
3. Selectează **Simulate**. Rezultatul arată **Gas used**, **Suggested gas limit**, **Balance changes** (adresă, denominație, modificare) și **Events**.
4. Dacă lanțul refuză, pagina afișează codul, codespace-ul și log-ul acestuia.

Nu se transmite nimic. Necesită octeți de tranzacție semnați: construiește și semnează mai întâi cu un SDK sau cu `qorechaind` (vezi [Semnare post-cuantică](/developer-guide/post-quantum-signing)). Intrarea este limitată la aproximativ 180 KB.

### Signing playground (doar testnet) {#signing-playground}

1. Deschide tab-ul **Signing playground**. Acesta avertizează: „Throwaway testnet key: never use it for real funds."
2. Selectează **Generate throwaway key**. Pagina afișează adresa, dimensiunea cheii publice secp256k1 și dimensiunile cheii ML-DSA-87. Selectează **New key** pentru alta.
3. **Message:** introdu text și selectează **Sign**. Textul este semnat cu ambele chei pentru lanțul `qorechain-diana`; semnătura apare ca JSON.
4. **Verify:** lipește o semnătură și adresa semnatarului și selectează **Verify**. Raportează „Valid signature" sau „Invalid signature". Deoarece o cheie de unică folosință nu este înregistrată în lanț, verifică în raport cu adresa semnatarului și cheia publică ML-DSA-87 a acestei sesiuni.
5. **Sign In With QoreChain:** selectează **Build message** pentru a crea un mesaj de autentificare pentru acest site cu un nonce aleatoriu, apoi semnează-l și verifică-l așa cum ar face un server. Sunt afișate câmpurile parsate. Vezi [specificația SIWQ](/qoresign/spec/siwq-v1) și [ghidul de autentificare](/qoresign/guides/sign-in).

Cheia este generată în browser, nu este niciodată salvată sau trimisă și nu poate fi recuperată. Vezi [QoreSign](/qoresign/overview) și [Hybrid signing v1](/qoresign/spec/hybrid-signing-v1) pentru formate.

### QoreX test wallet (doar testnet) {#test-wallet}

1. Deschide tab-ul **QoreX test wallet** și citește avertismentul: fiecare pornire generează în memorie o cheie de testnet de unică folosință; nu trimite niciodată fonduri reale către ea.
2. Selectează **Start test wallet**. Folosește pachetul publicat `@qorechain/qorex-wallet-mock`, instalează mock-ul în **acest tab** (înlocuind acolo o extensie QoreX reală până la reîncărcare) și listează **Addresses** pe care le deține: QoreChain Native, EVM și SVM.
3. Conectează-te dintr-un dApp care rulează în același tab sau apelează `window.qorex` din consola browserului.
4. Fiecare cerere te așteaptă la **Waiting for approval**: selectează **Approve** sau **Reject**. Lista **Requests** înregistrează fiecare cerere cu starea de aprobare și rezultatul.
5. Selectează **Stop (reloads the page)** pentru a elimina mock-ul.

Semnează doar pentru testnet și niciodată pentru mainnet. Folosește-l pentru a încerca un flux de conectare dApp înainte de a îndrepta dApp-ul către un QoreX real.

### SDKs și AI agents (MCP)

- **SDKs:** tab-ul afișează în prezent un scurt ghid rapid static și un tabel de pachete. **Este depășit** (descrie încă versiunea 0.1.0 și spune că pachetele nu sunt în registre, ceea ce nu mai este adevărat). Folosește [Instalare SDK](/sdk/install) pentru pachetele și versiunile curente. Un tab SDKs reconstruit, generat din lista testată de pachete, cu comenzi de instalare, ghiduri rapide și versiuni live din registre, este **în curând și încă nu este activ**.
- **AI agents (MCP):** tab-ul verifică în registrul npm serverul MCP QoreChain și, cât timp pachetul nu este publicat, spune **„The QoreChain MCP server is not published yet."** Nu există încă nicio comandă de instalare. Când pachetul va fi publicat, tab-ul va afișa configurația clientului pentru rularea locală prin stdio sau auto-găzduită prin Streamable HTTP.
- **Transaction inspector:** o unealtă pentru decodarea și explicarea oricărei tranzacții este **în curând și încă nu este activă**.

## Cum se accesează {#how-to-access}

- **URL:** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers) sau **Developers** în grupul **Build** din bara laterală (și în meniul mobil).
- **Autentificare:** niciuna. Pagina este deschisă tuturor.
- **Rețea:** PQ key status și Simulator: mainnet sau testnet, prin comutatorul din tab (implicit testnet). Signing playground și QoreX test wallet: doar testnet.
- **Portofel:** niciunul. Uneltele își generează propriile chei de unică folosință.
- **Cost:** gratuit. Nu se trimite nimic către lanț în afară de interogări de citire și apeluri de simulare.
- **Confidențialitate:** cheile de unică folosință există doar în memoria paginii. Nu lipi o frază de recuperare reală în nicio unealtă.

## Unde este publicat {#where-published}

| Suprafață | Adresă | Rețele |
| --- | --- | --- |
| Pagina Developers | `dashboard.qorechain.io/developers` | Unelte de citire pe mainnet și testnet; unelte de semnare doar pe testnet |
| Biblioteca de semnare | npm `@qorechain/qoresign` 0.1.0, sursa `github.com/qorechain/qoresign`, vezi [QoreSign](/qoresign/overview) | n/a |
| Pachetul de portofel de test | npm `@qorechain/qorex-wallet-mock` 0.1.0, sursa `github.com/qorechain/qorex-integrations` | Testnet |
| Server MCP | `@qorechain/mcp`: încă nepublicat | n/a |

Versiunile au fost verificate în registrul npm la 27 octombrie 2026.

## Limite și probleme cunoscute {#limits}

- **Încă nu sunt active:** tab-ul SDKs reconstruit și inspectorul de tranzacții. Serverul MCP nu este publicat, deci nu există nimic de instalat.
- **Tab-ul SDKs curent este depășit;** folosește în schimb [paginile SDK](/sdk/overview).
- **Simulatorul are nevoie de o tranzacție semnată.** Nu poate semna în locul tău și nu transmite.
- **Playground-ul și portofelul de test sunt doar pe testnet** și folosesc chei de unică folosință care dispar la reîncărcare. Nu pot deține sau muta fonduri reale.
- **O extensie QoreX reală din același tab este înlocuită** de portofelul de test până când reîncarci pagina.
- **Citirile trec printr-un proxy doar pentru citire.** Endpoint-urile REST ale lanțului nu trimit anteturi CORS pentru browser, așa că Dashboard-ul retransmite cereri doar pentru citire pe căile `cosmos/`, `cosmwasm/` și `qorechain/` și apelul de simulare. Din propriul cod, apelează direct endpoint-urile publice: `api.qore.host` și `api-testnet.qore.host`.
