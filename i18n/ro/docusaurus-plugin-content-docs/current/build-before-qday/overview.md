---
slug: /build-before-qday/overview
title: Build Before Q-Day
sidebar_label: Prezentare
sidebar_position: 1
---

# Build Before Q-Day

**Build Before Q-Day** este fest-ul pentru dezvoltatori al QoreChain, desfășurat online pe [build.qorechain.io](https://build.qorechain.io), cu hashtagul #BuildBeforeQDay. Participanții aleg un nivel, construiesc pe testnet-ul QoreChain cu kiturile open source, își prezintă munca în public și își susțin proiectul în fața unui juriu și a comunității. Pe lângă fest, există un workshop tehnic pe săptămână. Fiecare workshop are în această secțiune un ghid complet, pas cu pas, de la prima comandă până la ultima, ca să poți face totul în ritmul tău, pe calculatorul tău, chiar dacă ești la început în dezvoltare. Aplicațiile de exemplu sunt adunate în depozitul public [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## Inovații {#innovations}

Fiecare workshop din această secțiune este construit în jurul funcțiilor care fac QoreChain diferit:

- **Semnare hibridă.** O tranzacție este semnată de două ori: o dată cu o cheie clasică secp256k1 și o dată cu o cheie post-cuantică ML-DSA-87. Cine fură doar cheia clasică nu poate produce a doua semnătură.
- **Verificată pe lanț.** Validatorii verifică ambele semnături. Tranzacția poartă o extensie `PQCHybridSignature`, iar lanțul emite un eveniment `pqc_hybrid_verify` cu statusul `verified`. Poți citi ambele de la punctul final REST public și vezi rezultatul în explorer.
- **Instrumente obișnuite.** Păstrezi Hardhat, Foundry sau limbajul tău preferat. Kiturile se ocupă pentru tine de cheia post-cuantică și de fereastra de autorizare.

## Cum funcționează {#how-it-works}

1. **Înscrie-te** pe [build.qorechain.io](https://build.qorechain.io): autentifică-te cu GitHub, alege nivelul, conectează X și QoreX.
2. **Construiește** pe testnet cu kiturile, workshopurile săptămânale și provocările de la mijlocul hackathonului. Commiturile și actualizările apar în fluxul public.
3. **Trimite proiectul** înainte de termen, cu un depozit public, un video de cel mult 3 minute și adresa de testnet pe care o folosește proiectul tău.

Participarea este gratuită: construiești pe testnet, unde QOR de test vine de la [faucet](/dashboard/faucet). Regulile complete de eligibilitate, trimitere și jurizare sunt pe pagina Rules a site-ului fest-ului. Fondul de premii este de 20,000 USD în total, cu granturi ulterioare în QOR din ianuarie 2027; împărțirea este pe site-ul fest-ului.

## Niveluri {#levels}

Alegi un nivel când te înscrii și îl poți schimba mai târziu.

| Nivel | Pentru cine este |
| --- | --- |
| Quantum Pass | Ești nou în QoreChain sau în web3. Construiești o aplicație mică ce trimite o tranzacție hibridă post-cuantică și o citește înapoi de pe lanț. |
| Intermediate | Ai livrat deja un dApp. Construiești o aplicație completă cu SDK-ul QoreChain și QoreX. |
| Advanced | Trei trasee: A, agenți; B, aplicații criptate cu QoreSeal; C, aplicații cross-VM care acoperă lane-urile EVM și Native. |
| Expert | Infrastructură de protocol: rollup-uri cu RDK, IBC cu QORel, custodie și instrumente pentru dezvoltatori. |

Workshop 1 acoperă exact ce cere nivelul Quantum Pass: o tranzacție semnată hibrid, verificată pe lanț.

## Calendar {#timeline}

Toate orele sunt în UTC.

| Când | Ce |
| --- | --- |
| 4 noiembrie 2026 | Se deschid înscrierile și construcția |
| În fiecare săptămână | Un workshop (4 în total), cu ghidul lui pas cu pas aici |
| 18 noiembrie 2026 | Încep provocările de la mijlocul hackathonului |
| 2 decembrie 2026, 23:59 | Termenul de trimitere |
| 3 până la 5 decembrie | Verificarea proiectelor trimise |
| 6 până la 15 decembrie | Jurizare și votul People's Choice |
| 16 decembrie | Câștigătorii și show-ul de demo live |
| 17 până la 22 decembrie | Plata premiilor |
| Ianuarie 2027 | Granturi ulterioare |

Calendarul este pe site-ul fest-ului.

## Pentru cine este {#who}

Nu trebuie să știi blockchain sau criptografie post-cuantică. Dacă poți deschide un terminal și lipi o comandă, poți urma fiecare ghid de aici. Fiecare ghid explică în cuvinte simple ce face fiecare comandă și ce înseamnă fiecare parte din ea, apoi arată ce ar trebui să vezi pe ecran. Când un ghid spune că o comandă poate dura puțin, așteaptă să se termine înainte de a rula următoarea.

## Alege un tutorial {#choose}

Fă mai întâi **ghidul Workshop 1**. Este drumul complet, de la un calculator gol până la o tranzacție semnată cu două chei și verificată pe lanț. Apoi alege oricare dintre aplicațiile de mai jos. Ele arată aceeași idee în limbaje și instrumente diferite.

Duratele se referă la pașii de după instalarea instrumentelor. Instalarea instrumentelor prima dată adaugă cam 20 până la 40 de minute: vezi [Înainte de a începe](/build-before-qday/prerequisites).

| Tutorial | Nivel | Limbaj | Durată | Ce vei avea la final |
| --- | --- | --- | --- | --- |
| [Ghidul Workshop 1](/build-before-qday/workshop-1) | Începător | TypeScript, Solidity | 30 de minute | Un proiect generat, testat și implementat de tine pe testnet și o tranzacție semnată hibrid, verificată pe lanț. |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | Începător | TypeScript, Solidity | 25 de minute | Un contract contor pe testnet, pe care îl crești printr-un flux semnat hibrid. |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | Intermediar | TypeScript, Solidity, React | 45 de minute | Propria ta carte de oaspeți pe lanț, cu o pagină web în care semnezi din portofelul QoreX. |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | Începător | TypeScript, React | 25 de minute | O pagină web care trimite QOR din QoreX și arată ambele semnături și verdictul lanțului. |
| [Rust, qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Intermediar | Rust | 25 de minute | O aplicație în linie de comandă care plătește cu semnătură hibridă și o verifică pe lanț. |
| [Java, Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Intermediar | Java 21 | 25 de minute | Un backend care trimite bacșișuri și acceptă doar plăți semnate post-cuantic. |
| [Python, Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Începător | Python | 20 de minute | O tranzacție care plătește mai multe adrese, semnată cu ambele chei și verificată pe lanț. |

Ce înseamnă nivelurile aici:

- **Începător:** câteva comenzi pe care le lipești în ordine. Nu ai de scris cod.
- **Intermediar:** la fel, plus un al doilea instrument, cum ar fi o pagină web, o extensie de portofel sau un set de instrumente pentru un limbaj pe care poate nu l-ai mai folosit.

Fiecare tutorial are aceeași structură: **Înainte de a începe**, pași numerotați (fiecare comandă cu ce face și ce înseamnă fiecare parte), **Ce ar trebui să vezi**, cum **verifici** tranzacția pe lanț și un tabel de **Depanare**.

## Înainte de a începe {#before-you-start}

Citește o singură dată [Înainte de a începe: instrumente și un portofel de testnet](/build-before-qday/prerequisites). Pagina acoperă:

- Instalarea Node.js, pnpm, Git, Rust, Java, Maven, Python și jq pe macOS, Windows și Linux, cu câte o comandă de verificare pentru fiecare.
- Configurarea portofelului QoreX pe testnet.
- Obținerea de QOR de test de la faucet (100 QOR la fiecare 24 de ore, per cont).
- QOR și uqor: 1 QOR înseamnă 1,000,000 uqor.
- Cum să păstrezi în siguranță o cheie de testnet de unică folosință. Folosește doar conturi de test, niciodată un portofel cu fonduri reale.

## De unde începi {#where-to-start}

1. Citește [Înainte de a începe](/build-before-qday/prerequisites) și instalează instrumentele pentru primul tău tutorial.
2. Urmează [ghidul Workshop 1](/build-before-qday/workshop-1) pe testnet.
3. Încearcă una dintre aplicațiile de exemplu din tabelul de mai sus.
4. Dacă nu ai mai implementat niciodată pe QoreChain, [Implementare în 5 minute](/getting-started/deploy-in-5-minutes) explică ideea în profunzime. Kiturile din spatele aplicațiilor sunt pe pagina [Kituri](/build-before-qday/workshop-1/kits).

## Codul {#code}

Toate aplicațiile de exemplu sunt într-un singur depozit public, în folderul `workshop-1`: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday). Fiecare tutorial îți spune ce folder să deschizi. Obține codul o singură dată cu:

```bash
git clone https://github.com/qorechain/build-before-qday
```

| Parte | Ce face |
| --- | --- |
| `git clone` | Descarcă pe calculatorul tău o copie completă a unui depozit de cod. |
| `https://github.com/qorechain/build-before-qday` | Adresa depozitului de copiat. |

**Ce ar trebui să vezi:** un folder nou numit `build-before-qday` în folderul în care ai rulat comanda.
