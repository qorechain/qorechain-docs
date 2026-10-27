---
slug: /qorex/overview
title: Portofelul QoreX
sidebar_label: Prezentare generală
sidebar_position: 1
---

# Portofelul QoreX

**QoreX** este portofelul oficial **non-custodial** pentru **QoreChain** (mainnet `qorechain-vladi`). Este pentru oricine vrea să dețină, să trimită, să facă staking și să primească QOR, să plătească persoane după @handle, să dețină active pe alte rețele din aceeași frază de recuperare și să aprobe ce cer site-urile portofelului lor să semneze. Cheile tale private sunt generate și păstrate **doar pe dispozitivul tău**. QoreChain Association nu are niciodată acces la fondurile tale, iar aplicațiile nu au **nicio analiză, nicio raportare de erori și niciun SDK de urmărire**. Cheile, fraza de recuperare, seiful și aprobările nu părăsesc niciodată dispozitivul tău (vezi [Ce trimite QoreX prin rețea](#data-and-privacy)). Fiecare transfer nativ de QOR este semnat de două ori: cu o cheie clasică și cu ML-DSA-87 (FIPS 204).

QoreX este o familie de patru versiuni care funcționează împreună:

- **Aplicația mobilă** (Android și iOS): portofelul complet, cu recuperare, staking, portofoliu, un browser de dApp-uri integrat și Q-Day Scanner. Vezi [Primii pași](/qorex/getting-started) și [Browserul de dApp-uri](/qorex/dapp-browser).
- **Extensia de browser** (Chrome și browsere Chromium, Firefox): un portofel desktop de sine stătător și conectorul care permite oricărui site să descopere QoreX și transformă fiecare cerere într-o aprobare explicită. Vezi [Extensia de browser](/qorex/browser-extension).
- **Extensia Safari**: aceeași extensie, împachetată în aplicația macOS **QoreX Wallet** din Mac App Store.
- **Kitul pentru dezvoltatori**: șase pachete npm publice pentru aplicațiile care se integrează cu QoreX. Vezi [Pentru dezvoltatori](#developers).

:::caution Fă backup frazei de recuperare imediat ce creezi un portofel
QoreX este non-custodial: QoreChain Association nu poate recupera, reseta sau restaura pentru tine un portofel pierdut. **Dezinstalarea aplicației, resetarea telefonului sau eliminarea extensiei șterge cheile tale de pe acel dispozitiv.** Notează-ți fraza de recuperare de 24 de cuvinte (aplicația mobilă nu o afișează în timp ce creează portofelul, așa că o poți dezvălui din **Setări → Securitate → Dezvăluie fraza de recuperare**; extensia o afișează o singură dată, la creare) și, dacă poți, configurează [recuperarea socială](/qorex/security-and-recovery#social-recovery). Vezi [Fă backup acum](/qorex/security-and-recovery#back-up-now).
:::

## Inovații {#innovations}

- **Lane nativ semnat hibrid.** Fiecare transfer nativ de QOR este semnat de două ori: cu o cheie clasică secp256k1 și cu ML-DSA-87 (FIPS 204). Lanțul le verifică pe amândouă. Orice se află pe o rețea externă este doar clasic, iar QoreX îl marchează ca atare înainte să confirmi.
- **O singură frază de recuperare, o singură cheie ML-DSA-87, fără al doilea backup.** Cheia ML-DSA-87 este derivată determinist din aceleași 24 de cuvinte: `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`. Derivarea este publicată în [QoreSign](/qoresign/overview), așa că orice portofel compatibil derivă aceeași cheie.
- **Înregistrată automat, apoi verificată.** Cheia ML-DSA-87 este înregistrată pe lanț odată cu prima ta tranzacție (cu o dovadă de posesie pe lanț începând cu v3.2.3). După fiecare transmitere, portofelul verifică dacă tranzacția comisă poartă stratul ML-DSA-87 și te avertizează dacă nu îl poartă.
- **Aprobări care refuză ce nu pot citi.** Fiecare mesaj, comisionul, limitele de cheltuire și expirarea sunt decodate înainte să semnezi. O cerere pe care QoreX nu o poate decoda, sau ai cărei octeți pot fi citiți în două moduri, este refuzată.
- **`signAndBroadcast` pentru dApp-uri.** Un site trimite mesajele; portofelul le arată decodate, adaugă stratul ML-DSA-87 pe care îl poate crea doar portofelul și transmite tranzacția. O pagină nu poate produce acel strat.
- **Ferestre de acces EVM.** Peste chain v3.2.0, o tranzacție EVM este admisă doar cât timp contul are o fereastră deschisă: un `MsgOpenEVMWindow` semnat hibrid, limitat prin numărul de tranzacții, valoare și expirare. QoreX o deschide, o afișează și o închide.
- **Handle-uri cu fixare.** Un @handle este legat de o adresă `qor1…` printr-o atestare ed25519 a registrului plus propria semnătură secp256k1 a proprietarului. QoreX fixează adresa pe care a rezolvat-o prima dată și semnalează o schimbare făcută pe tăcute.
- **Recuperare care nu are nevoie de nicio companie.** Recuperarea socială împarte seed-ul în cote criptate, sigilate cu ML-KEM (2 din 3 garanți), cu un blocaj temporal de 48 de ore care te alertează; Legacy este un întrerupător de tip „dead-man's switch" peste garanții tăi; asocierea dispozitivelor mută un portofel cu un cod de unică folosință și un QR care singur este inutil. Vezi [Securitate și recuperare](/qorex/security-and-recovery).
- **Amprentă mică.** Extensia cere browserului o singură permisiune API, `storage`, și nu include niciun cod de analiză sau de urmărire. Notificările push comunică serverului doar adresele tale publice, iar notificarea spune doar „QOR received".

## Cum se folosește {#how-to-use}

1. Instalează QoreX dintr-o listare oficială de magazin (vezi [Cum accesezi](#how-to-access)).
2. Creează un portofel sau restaurează unul: [Primii pași](/qorex/getting-started) pentru aplicația mobilă, [Extensia de browser](/qorex/browser-extension#wallet) pentru extensie.
3. Notează cele 24 de cuvinte, apoi trimite și primește QOR: [Trimite și primește](/qorex/send-and-receive).
4. Fă staking: [Portofoliu și staking](/qorex/portfolio-and-staking). Configurează-ți plasa de siguranță: [Securitate și recuperare](/qorex/security-and-recovery).
5. Ca să folosești un site cu QoreX, deschide-l în extensie (desktop) sau în [Browserul de dApp-uri](/qorex/dapp-browser) al aplicației. Fiecare conectare și fiecare semnătură este o aprobare pe care o dai tu.

## Cum accesezi {#how-to-access}

- **Rețele:** mainnet `qorechain-vladi` (implicit) și testnet `qorechain-diana`. Pe mobil, testnet-ul se activează din **Setări → Folosește testnet (dezvoltatori)**.
- **Cont necesar:** niciunul. Autentificarea (e-mail, Apple sau Google) este opțională și necesară doar pentru a revendica un @handle, pentru a te asocia cu Dashboard și pentru a folosi cererile de plată.
- **Cerințe preliminare:** pe mobil, o deblocare a dispozitivului (Face ID sau Touch ID pe iOS; o biometrie de clasa 3 sau un PIN de blocare a ecranului pe Android), altfel butoanele de creare și import rămân dezactivate. În extensie, o parolă.
- **Cost:** QoreX este gratuit. Trimiterea, staking-ul și deschiderea unei ferestre EVM plătesc comisionul normal al rețelei (pragul minim al rețelei este 0.1 uqor per gaz).
- **Instalează întotdeauna dintr-o listare oficială:**

| Versiune | Unde | Minim |
|---|---|---|
| Aplicația iOS | [App Store, QoreX](https://apps.apple.com/us/app/qorex-wallet/id6791256626) | iOS 15.1 |
| Aplicația Android | [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex) | Android 7.0 |
| Chrome, Brave, Edge, Arc, Opera | [Chrome Web Store](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) | un browser Chromium |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/qorex/) | Firefox 140 |
| Safari | [Mac App Store, QoreX Wallet](https://apps.apple.com/us/app/qorex-wallet/id6794132220) | macOS 12 |

## Unde este publicat {#where-published}

| Versiune | Listare și nume de pachet | Versiunea curentă (27 oct. 2026) | Link |
|---|---|---|---|
| Aplicația iOS | App Store, **QoreX** (id 6791256626) | 1.1.8 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| Aplicația Android | Google Play, `network.qore.qorex` | 1.1.9 | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |
| Extensia Chrome | Chrome Web Store, **QoreX** | 0.3.8 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Extensia Firefox | Firefox Add-ons, `qorex` | 0.3.9 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Extensia Safari | Mac App Store, **QoreX Wallet** (id 6794132220) | aplicația 1.7.8, extensia 0.3.8 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |
| Kitul pentru dezvoltatori | șase pachete npm, vezi [Pentru dezvoltatori](#developers) | 0.1.0 | [Integrări QoreX](/developer-tools/qorex-integrations) |

Revizuirea din magazine se desfășoară după propriul program, astfel încât un magazin poate servi o versiune mai veche decât altul; vezi [Ce versiune este disponibilă unde](#versions). Codul sursă QoreX nu este public.

## Limite și probleme cunoscute {#limits}

- **Nicio promisiune dincolo de ceea ce este semnat.** Semnătura hibridă acoperă tranzacțiile din lane-ul nativ. Tranzacțiile EVM poartă doar o semnătură secp256k1 și sunt admise doar cât timp o fereastră de acces EVM este deschisă. Transferurile SVM și cele către rețele externe sunt doar clasice.
- **Providerul EVM al extensiei răspunde doar la interogări despre cont și rețea.** Încă nu semnează tranzacții sau mesaje EVM. Semnarea de mesaje (`signArbitrary`) nu este livrată.
- **Doar pe mobil:** Portofoliu, Q-Day Scanner, recuperare socială, Legacy, cereri de plată, autentificare și asocierea dispozitivelor.
- **Swap nu este disponibil.** Rămâne dezactivat până când există lichiditate în pool și nu apare pe iOS.
- **Semnatarii asociați** (Phantom sau MetaMask ca cheie asociată, cu limite de cheltuire) nu sunt încă disponibili în QoreX.
- **Rotația cheii** ML-DSA-87 nu este încă disponibilă în QoreX.
- **Dacă serviciul de handle-uri este căzut,** portofelul revine la adrese simple; tot restul continuă să funcționeze.
- Un portofel pierdut, fără frază notată și fără recuperare socială, nu poate fi recuperat de nimeni.

## Disponibilitate pe platforme {#platform-availability}

| Funcționalitate | Aplicația mobilă (Android și iOS) | Extensia de browser |
|---|---|---|
| Creare / import de portofel | ✅ (aplicația nu afișează fraza când creează portofelul - dezvăluie-o din Setări → Securitate) | ✅ (de sine stătător; fraza este afișată o singură dată, la creare) |
| Mai multe portofele, fiecare cu propria frază de recuperare | ✅ (Setări → Portofele) | ✅ (**Portofele**, o singură parolă pentru toate) |
| Mai multe conturi dintr-o singură frază de recuperare | ✅ (până la 20 per portofel) | ✅ |
| Cont în stil Ethereum (coin 60), adăugat manual | ✅ | ✅ |
| Trimitere și primire de QOR (lane nativ semnat hibrid) | ✅ | ✅ (Trimite; Primește cu QR) |
| Primire pe orice rețea suportată | ✅ | ✅ |
| Plată către un @handle | ✅ | ✅ |
| Revendicare @handle | ✅ (necesită un cont autentificat) | - (extensia te trimite la aplicație) |
| Staking: delegare, retragere din delegare, mutare stake, revendicare, revendicare și re-stake | ✅ | ✅ |
| Rețele externe (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokenuri) | ✅ | ✅ (trimitere din popup) |
| Adăugare token prin contract (rețele EVM) | ✅ | ✅ |
| Fereastră de acces EVM | ✅ | ✅ |
| Limba interfeței (10 limbi) | ✅ (urmează limba telefonului) | ✅ (urmează limba browserului) |
| Portofoliu, Q-Day Scanner, Recuperare socială, Legacy | ✅ | - |
| Căutare, tur la prima rulare, widget pe ecranul principal, notificări push | ✅ | - |
| Conexiuni cu dApp-uri | ✅ (browser integrat, limitat la sesiune) | ✅ (orice site; **Site-uri conectate** cu Revocare) |
| Swap | Doar Android, dezactivat până la existența lichidității în pool (nu apare pe iOS) | - |
| Autentificare în cont și cereri de plată | ✅ | - |
| Asociere pe mai multe dispozitive | ✅ | - |
| Împerechere cu Dashboard | ✅ | ✅ (conectare + transferuri propuse, incl. staking) |

## Primii pași

- Ești nou pe QoreX? Începe cu [Primii pași](/qorex/getting-started) pentru a-ți crea sau restaura portofelul.
- Apoi învață să [trimiți și să primești](/qorex/send-and-receive) QOR pe lane-ul nativ semnat hibrid.
- Configurează-ți plasa de siguranță în [Securitate și recuperare](/qorex/security-and-recovery).
- Pe desktop, instalează [Extensia de browser](/qorex/browser-extension).

## Descărcare și disponibilitate {#availability}

Instalează din listările oficiale de la [Cum accesezi](#how-to-access). Aplicația Android necesită Android 7.0 sau mai nou, aplicația iOS iOS 15.1 sau mai nou, extensia Firefox Firefox 140 sau mai nou, iar extensia Safari macOS 12 sau mai nou.

## Ce versiune este disponibilă unde {#versions}

Revizuirea din magazine se desfășoară după propriul program, astfel încât un magazin poate servi pentru o vreme o versiune mai veche decât altul. Aceasta este versiunea curentă **din fiecare magazin** la **27 octombrie 2026**:

| Magazin | Versiune curentă | Notă |
|---|---|---|
| Apple App Store (iOS) | 1.1.8 | lansată pe 21 octombrie |
| Google Play (Android) | 1.1.9 | |
| Chrome Web Store | 0.3.8 | |
| Firefox Add-ons | 0.3.9 | |
| Safari (Mac App Store) | 1.7.8, cu extensia 0.3.8 | Mac App Store folosește propria numerotare `1.x` |

Magazinele afișează întotdeauna versiunea lor curentă, iar un magazin care încă servește o versiune mai veche se va actualiza automat. Versiunile pe care un magazin nu le-a lansat încă nu sunt descrise în acest manual ca fiind disponibile.

Ce adaugă versiunile 1.1.9 / 0.3.9 (astăzi Android 1.1.9 și extensia Firefox 0.3.9; iOS, Chrome și Safari le primesc de îndată ce magazinele lor servesc acele versiuni):

- **Blocări de staking.** Blochează o parte din stake pentru 3, 6 sau 12 luni. Bonusul afișat este bonusul pe care îl câștigă blocarea astăzi, sub plafonul rețelei. Deblocarea anticipată stă în spatele unei a doua confirmări care numește costul, iar **Retragere din delegare** și **Mutare stake** sunt limitate la partea deblocată. Tabelul nivelurilor este etichetat „până la", cu cifra de astăzi alături. Vezi [Portofoliu și staking](/qorex/portfolio-and-staking#staking-locks).
- **Memo-uri de transfer IBC în cuvinte simple** pe ecranele de aprobare.
- **Staking din conturi importate din MetaMask (coin 60)** în extensie.

Ce au schimbat pentru tine versiunile 1.1.8 / 0.3.8:

- **MetaMask pe QoreChain, de la prima pagină.** Deschide, verifică și închide fereastra de acces EVM de care are nevoie MetaMask și vezi ce mai are la dispoziție.
- **Verificări mai puternice ale semnăturilor.** QoreX verifică semnătura ML-DSA-87 a unei aplicații în raport cu cheia înregistrată a contului tău și spune clar dacă acea cheie a fost înregistrată de alt portofel.
- **Remedieri pentru probleme de securitate raportate.**

Ce au schimbat pentru tine versiunile 1.1.7 / 0.3.7 (incluse în 1.1.8 / 0.3.8):

- **Aprobările refuză o cerere ai cărei octeți pot fi citiți în două moduri.** Dacă același câmp apare de două ori într-o cerere, un ecran și lanțul ar putea să nu cadă de acord asupra a ceea ce se semnează - de exemplu un comision sau o sumă afișată diferit de cea executată. QoreX refuză acum o astfel de cerere, în loc să arate o singură interpretare a ei. Vezi [Ce arată fereastra de aprobare](/qorex/security-and-recovery#approvals).
- **Expirarea unei permisiuni este afișată la secundă**, iar voturile de guvernanță sunt decodate și afișate pe ecranul de aprobare.
- **Site-urile sunt identificate prin originea pe care o atestă browserul însuși**, nu prin ceea ce afirmă o cerere despre sine.
- **Căutările de @handle funcționează din nou în extensie.**
- **Revendicarea unui @handle necesită un cont autentificat și se face în aplicație**; extensia te trimite acolo.
- **Numele QoreChain care imită proiectul sunt rezervate**, astfel încât un handle nou nu poate imita proiectul sau personalul său.

Noutăți principale față de 1.0.9 / 0.2.6:

- **Mai multe portofele** pe același telefon sau browser, fiecare cu propria frază de recuperare, cu comutare dintr-o atingere - vezi [Mai multe portofele](/qorex/getting-started#several-wallets).
- **Cont în stil Ethereum (coin 60)**, adăugat manual, pentru fraze folosite inițial în MetaMask sau pe Dashboard - vezi [Restaurează o frază din MetaMask sau Dashboard](/qorex/getting-started#restore-dashboard).
- **Adăugare token prin contract**, **Primire pe orice rețea**, **căutare** globală, un **tur** la prima rulare, un **widget pe ecranul principal** și **notificări push** când ajunge QOR (mobil) - vezi [Trimite și primește](/qorex/send-and-receive).
- **Revendicare și re-stake**, o verificare a comisionului înainte de revendicare, o listă **Unstaking în curs** și avertismente înainte să faci stake într-o măsură care te-ar împiedica să mai poți retrage - vezi [Portofoliu și staking](/qorex/portfolio-and-staking).
- Ecrane de aprobare care arată fiecare mesaj, comisionul, limitele de cheltuire și expirarea, și refuză ceea ce QoreX nu poate afișa; **`signAndBroadcast`** pentru dApp-uri; **Site-uri conectate** cu Revocare (extensia); **fereastra de acces EVM** - vezi [Securitate și recuperare](/qorex/security-and-recovery) și [Extensia de browser](/qorex/browser-extension).
- Remedieri: un cont alimentat putea dispărea momentan din „Conturile tale" (1.0.9); butonul hardware Înapoi de pe Android revine acum cu un ecran (1.1.1); fraza de recuperare este ascunsă serviciilor care nu sunt de accesibilitate pe Android 14 și versiunile ulterioare (1.1.6).

QoreX funcționează pe mainnet `qorechain-vladi` (activ din 7 iunie 2026), care rulează chain **v3.2.4** din 23 octombrie 2026. Formatul de semnare, adresele, zecimalele, memo-urile și comisioanele nu se schimbă în aceste actualizări, așa că nu este necesară nicio actualizare QoreX pentru ele.

## Pentru dezvoltatori {#developers}

Ca să te integrezi cu QoreX din propria aplicație, folosește kitul pentru dezvoltatori QoreX: șase pachete npm, publicate la versiunea 0.1.0. Comenzile lor de instalare, exemplele și limitele se află la [Integrări QoreX](/developer-tools/qorex-integrations). Pentru descoperirea portofelelor și semnarea într-o aplicație web, vezi și [adaptorul de portofel](/developer-tools/wallet-adapter) și, pentru providerul de browser pe care îl injectează QoreX, [Extensia de browser](/qorex/browser-extension#standards).

## Ce trimite QoreX prin rețea {#data-and-privacy}

QoreX nu are **nicio analiză, nicio raportare de erori și niciun SDK de urmărire**. Cheile tale, fraza de recuperare, seiful și aprobările tale **nu părăsesc niciodată dispozitivul**. Aplicațiile comunică totuși cu rețeaua, așa cum trebuie să o facă orice portofel; aceasta este lista completă.

**Întotdeauna (necesar pentru a afișa solduri și a trimite):**

- **Punctele finale publice QoreChain** (`api`, `rpc`, `evm` și `svm` pe `qore.host`, plus echivalentele `-testnet`) pentru solduri, istoric și transmitere. Aceste cereri conțin adresa ta **publică** `qor1…`.
- **Căutarea prețului** - o singură cerere pentru prețul QOR, care **nu conține nicio adresă**.
- **Rețelele externe pe care le deții sau le vizualizezi** - servicii RPC/REST publice ale unor terți pentru acea rețea, care conțin adresa ta **publică** pe acea rețea.
- **Registrul de @handle-uri** - conține handle-ul pe care îl cauți sau o adresă publică.

**Doar dacă le activezi:**

- **Notificări push** (mobil) - dezactivate până când le activezi. Serverul primește apoi token-ul dispozitivului tău și adresele publice `qor1…` ale portofelului în uz (până la 10). Un dispozitiv de la care serverul nu a mai primit semnale timp de 90 de zile este uitat.
- **Recuperare socială** - releul stochează **doar text cifrat**.
- **Autentificare** (e-mail, sau Apple ori Google) - necesară pentru a revendica un @handle, pentru a te asocia cu Dashboard și pentru a folosi cererile de plată.
- **Conectarea la Dashboard și adresele asociate** - trimite o dovadă semnată că deții adresa.
- **Cereri de plată** - trimit handle-ul expeditorului, handle-ul destinatarului, suma și o notă opțională.

**Widget-ul de pe ecranul principal** nu face nicio cerere proprie către serverele QoreChain: aplicația îi transmite local adresa, soldul și indicatorul de confidențialitate, iar widget-ul reîmprospătează soldul de la punctul final REST public QoreChain.

În niciuna dintre aplicații nu există **nici chat AI, nici serviciu QCAI**.
