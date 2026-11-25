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
- **Ferestre de acces EVM, mai sigure implicit.** Peste chain v3.2.0, o tranzacție EVM este admisă doar cât timp contul are o fereastră deschisă: un `MsgOpenEVMWindow` semnat hibrid, limitat prin numărul de tranzacții, valoare și expirare. QoreX o deschide, o afișează și o închide. O fereastră pe care o deschizi tu este limitată la **doar transferuri de QOR** dacă nu alegi **Orice contract**, care vine cu propriul avertisment; o fereastră deschisă spune exact ce admite; iar o aprobare care deschide o fereastră pentru un site numește fiecare contract pe care fereastra îl permite și spune când o înlocuiește pe cea deschisă. Vezi [Securitate și recuperare](/qorex/security-and-recovery#evm-window).
- **Handle-uri cu fixare.** Un @handle este legat de o adresă `qor1…` printr-o atestare ed25519 a registrului plus propria semnătură secp256k1 a proprietarului. QoreX fixează adresa pe care a rezolvat-o prima dată și semnalează o schimbare făcută pe tăcute.
- **Recuperare care nu are nevoie de nicio companie.** Recuperarea socială împarte seed-ul în cote criptate, sigilate cu ML-KEM (2 din 3 garanți), cu un blocaj temporal de 48 de ore care te alertează; Legacy este un întrerupător de tip „dead-man's switch" peste garanții tăi; asocierea dispozitivelor mută un portofel cu un cod de unică folosință și un QR care singur este inutil. Vezi [Securitate și recuperare](/qorex/security-and-recovery).
- **Prima rulare cu un scop.** După scurtul tur, QoreX întreabă **Ce vrei să faci mai întâi?** (să primești bani, să trimiți bani sau să-ți păstrezi criptomonedele în siguranță) și te ghidează până acolo, încheind cu o scurtă verificare a backupului. Vezi [Prima rulare](/qorex/getting-started#first-run).
- **Cereri de plată cu linkuri semnate.** Ceri o sumă, iar QoreX creează un link semnat cu cheia propriului tău cont, așa că un destinatar sau o sumă modificată este detectată. QoreX-ul plătitorului verifică semnătura, rețeaua și orice @handle, apoi arată verificarea obișnuită. O cerere este marcată drept plătită doar când lanțul arată plata. Vezi [Trimite și primește](/qorex/send-and-receive).
- **Contacte și favorite.** Nume pentru adresele pe care le plătești, păstrate doar pe dispozitiv. Favoritele sunt chip-uri de o singură atingere pe formularul de trimitere, **Repetă plata** completează din nou formularul (tot tu îl verifici), iar o adresă care doar seamănă cu una salvată este semnalată.
- **Protecția banilor mei.** Un singur ecran care verifică, în timp real, dacă backupul tău a fost verificat, dacă recuperarea ta a fost testată, gardienii tăi (aplicație), site-urile și aplicațiile conectate la tine, permisiunile pe care contul tău le-a dat în rețea și aprobările ERC-20 de pe EVM-ul QoreChain (fiecare cu Revocă), precum și ce semnături sunt post-cuantice pe care lane. Vezi [Securitate și recuperare](/qorex/security-and-recovery).
- **Un istoric clar.** Fiecare tranzacție apare ca în așteptare, confirmată sau eșuată, citită din lanț, per cont, cu export în CSV care se deschide în siguranță într-o foaie de calcul.
- **Un banner de stare a rețelei.** Dacă blocurile nu mai sosesc, QoreX spune acest lucru, folosind orele de bloc ale lanțului însuși. Nu spune nimic cât timp rețeaua este în regulă.
- **Îngrijirea cheii post-cuantice.** Dacă înregistrarea cheii post-cuantice a unui cont nu mai poate semna, QoreX îți propune să o înregistrezi din nou (niciodată automat, două apăsări). Poți, de asemenea, să rotești cheia ML-DSA-87 din fraza de recuperare și să creezi, să co-semnezi și să trimiți dintr-un cont **multisig** post-cuantic.
- **Mod dezvoltator.** Un comutator (dezactivat implicit) care adaugă 17 unelte: inspectoare, un simulator de tranzacții, verificarea contractelor și a implementărilor, profiluri de rollup, semnare offline și multisig și un loc în care agenții AI pot propune tranzacții pe care le aprobi tu. Nimic din el nu schimbă vreo regulă de semnare. Vezi [Modul dezvoltator](/qorex/developer-mode).
- **Funcții de rețea doar pe testnet.** Trimiterea pe alt lanț prin IBC, un ecran QoreChain Bridge și Solana pe QoreChain există doar pe testnet. Vezi [Funcții de testnet](/qorex/testnet-features).
- **Amprentă mică.** Extensia cere browserului o singură permisiune API, `storage`, și nu include niciun cod de analiză sau de urmărire. Notificările push comunică serverului doar adresele tale publice, iar notificarea spune doar „QOR received".

## Cum se folosește {#how-to-use}

1. Instalează QoreX dintr-o listare oficială de magazin (vezi [Cum accesezi](#how-to-access)).
2. Creează un portofel sau restaurează unul: [Primii pași](/qorex/getting-started) pentru aplicația mobilă, [Extensia de browser](/qorex/browser-extension#wallet) pentru extensie.
3. Notează cele 24 de cuvinte, apoi alege **Ce vrei să faci mai întâi?** (primire, trimitere sau păstrarea criptomonedelor în siguranță) și urmează pașii: [Prima rulare](/qorex/getting-started#first-run). Apoi trimite și primește QOR: [Trimite și primește](/qorex/send-and-receive).
4. Fă staking: [Portofoliu și staking](/qorex/portfolio-and-staking). Configurează-ți plasa de siguranță: [Securitate și recuperare](/qorex/security-and-recovery).
5. Ca să folosești un site cu QoreX, deschide-l în extensie (desktop) sau în [Browserul de dApp-uri](/qorex/dapp-browser) al aplicației. Fiecare conectare și fiecare semnătură este o aprobare pe care o dai tu.

## Cum accesezi {#how-to-access}

- **Rețele:** mainnet `qorechain-vladi` (implicit) și testnet `qorechain-diana`. Pe mobil, testnet-ul se activează din **Setări → Folosește testnet (dezvoltatori)**. În extensie, activează mai întâi modul dezvoltator (atinge de șapte ori numărul versiunii din partea de jos a popupului), apoi alege **Comută pe testnet (diana)**. Cât ești pe testnet, pe fiecare ecran apare un banner galben **TESTNET**.
- **Cont necesar:** niciunul. Autentificarea (e-mail, Apple sau Google) este opțională și necesară doar pentru a revendica un @handle, pentru a te asocia cu Dashboard și pentru a folosi în aplicație cererile de plată bazate pe cont. Linkurile de plată semnate nu au nevoie de cont.
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

| Versiune | Listare și nume de pachet | Versiunea curentă | Link |
|---|---|---|---|
| Aplicația iOS | App Store, **QoreX** (id 6791256626) | 1.2.5 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| Aplicația Android | Google Play, `network.qore.qorex` | 1.2.5 | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |
| Extensia Chrome | Chrome Web Store, **QoreX** | 0.4.5 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Extensia Firefox | Firefox Add-ons, `qorex` | 0.4.5 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Extensia Safari | Mac App Store, **QoreX Wallet** (id 6794132220) | aplicația 1.8.2, extensia 0.4.5 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |
| Kitul pentru dezvoltatori | șase pachete npm, vezi [Pentru dezvoltatori](#developers) | 0.1.0 | [Integrări QoreX](/developer-tools/qorex-integrations) |

Revizuirea din magazine se desfășoară după propriul program, astfel încât un magazin poate servi o versiune mai veche decât altul; vezi [Ce versiune este disponibilă unde](#versions). Codul sursă QoreX nu este public.

## Limite și probleme cunoscute {#limits}

- **Nicio promisiune dincolo de ceea ce este semnat.** Semnătura hibridă acoperă tranzacțiile din lane-ul nativ. Tranzacțiile EVM poartă doar o semnătură secp256k1 și sunt admise doar cât timp o fereastră de acces EVM este deschisă (doar conturile adăugate cu **Adaugă un cont Ethereum (coin 60)** pot trimite pe acel lane). Transferurile SVM și cele către rețele externe sunt doar clasice.
- **Doar pe mobil:** Portofoliu, Scaner Q-Day, recuperare socială, Legacy, autentificare, revendicarea unui @handle și asocierea dispozitivelor.
- **Swap nu este disponibil.** Rămâne dezactivat până când există lichiditate în pool și nu apare pe iOS.
- **Semnatarii asociați** (Phantom sau MetaMask ca cheie asociată, cu limite de cheltuire) nu sunt încă disponibili în QoreX.
- **Doar testnet:** trimiterea pe alt lanț prin IBC, ecranul QoreChain Bridge și Solana pe QoreChain. Niciuna nu este oferită pe mainnet. Vezi [Funcții de testnet](/qorex/testnet-features).
- **Agenții AI** (modul dezvoltator) nu pot semna: pot doar să propună o tranzacție pe care o aprobi tu. În extensie au nevoie de un program companion pe computer care nu este încă publicat și nu sunt disponibili în Safari. În aplicație lipești o propunere sau deschizi un link de propunere. Vezi [Modul dezvoltator](/qorex/developer-mode).
- **Dacă serviciul de handle-uri este căzut,** portofelul revine la adrese simple; tot restul continuă să funcționeze.
- Un portofel pierdut, fără frază notată și fără recuperare socială, nu poate fi recuperat de nimeni.

## Disponibilitate pe platforme {#platform-availability}

| Funcționalitate | Aplicația mobilă (Android și iOS) | Extensia de browser |
|---|---|---|
| Creare / import de portofel | ✅ (aplicația nu afișează fraza când creează portofelul - dezvăluie-o din Setări → Securitate) | ✅ (de sine stătător; fraza este afișată o singură dată, la creare, apoi o scurtă verificare a backupului) |
| Prima rulare: **Ce vrei să faci mai întâi?** | ✅ (după tur; se redeschide din Setări) | ✅ (după creare sau import; se redeschide din popup) |
| Verificarea backupului (un test cu trei cuvinte din frază) | ✅ | ✅ |
| Mai multe portofele, fiecare cu propria frază de recuperare | ✅ (Setări → Portofele) | ✅ (**Portofele**, o singură parolă pentru toate) |
| Mai multe conturi dintr-o singură frază de recuperare | ✅ (până la 20 per portofel) | ✅ |
| Cont în stil Ethereum (coin 60), adăugat manual | ✅ | ✅ |
| Trimitere și primire de QOR (lane nativ semnat hibrid) | ✅ | ✅ (Trimite cu pas de verificare; Primește începe cu moneda) |
| Primire pe orice rețea suportată | ✅ | ✅ |
| Plată către un @handle | ✅ | ✅ |
| Revendicare @handle | ✅ (necesită un cont autentificat) | - (extensia te trimite la aplicație) |
| Cereri de plată cu linkuri semnate și plata unei cereri | ✅ | ✅ |
| Contacte, favorite și **Repetă plata** | ✅ | ✅ |
| Istoric per cont (în așteptare, confirmate, eșuate) și export CSV | ✅ (Activitate) | ✅ (**Istoric**) |
| **Protecția banilor mei** | ✅ | ✅ |
| **Asistență** (canale oficiale) | ✅ | ✅ |
| Banner de stare a rețelei | ✅ | ✅ |
| Blocare automată (implicit 15 minute) | ✅ (cere din nou biometria sau PIN-ul) | ✅ (cere din nou parola) |
| Staking: delegare, retragere, mutare de stake, revendicare, revendicare și re-stake, blocări, alegerea destinației recompenselor | ✅ | ✅ (câte un ecran pentru fiecare) |
| Repararea și rotirea cheii post-cuantice | ✅ | ✅ |
| Conturi multisig post-cuantice | ✅ | ✅ |
| Rețele externe (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokenuri) | ✅ | ✅ (trimitere din popup) |
| Adăugare token prin contract (rețele EVM) | ✅ | ✅ |
| Fereastră de acces EVM | ✅ | ✅ |
| Limba interfeței (10 limbi) | ✅ (urmează limba telefonului) | ✅ (urmează limba browserului) |
| Portofoliu, Q-Day Scanner, Recuperare socială, Legacy | ✅ | - |
| Căutare, tur la prima rulare, widget pe ecranul principal, notificări push | ✅ | - |
| Conexiuni cu dApp-uri | ✅ (browser integrat, revocabil per site, site-uri favorite și recente) | ✅ (orice site; **Site-uri conectate** cu Revocă) |
| Mod dezvoltator (17 unelte) | ✅ (un tab **Dezvoltator** în bara de jos) | ✅ (un singur buton **Unelte pentru dezvoltatori**) |
| Agenți AI care propun tranzacții (modul dezvoltator) | ✅ (lipești o propunere sau deschizi un link de propunere) | necesită program companion (încă nepublicat); nu și în Safari |
| Trimitere pe alt lanț (IBC), ecranul QoreChain Bridge, Solana pe QoreChain | doar testnet | doar testnet |
| Swap | Doar Android, dezactivat până la existența lichidității în pool (nu apare pe iOS) | - |
| Autentificare în cont | ✅ | - |
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

:::note
Versiuni verificate pe 25 noiembrie 2026. Aplicația 1.2.5, extensia 0.4.5 și Safari 1.8.2 trec acum prin verificarea magazinelor: funcțiile pe care acest manual le descrie pentru ele ajung la tine când magazinul tău oferă actualizarea. Firefox oferă deja 0.4.4, care are toate aceste funcții; 0.4.5 aduce doar corecții mici. Pagina web a linkurilor de plată distribuite intră online odată cu 1.2.5.
:::

Revizuirea din magazine se desfășoară după propriul program, astfel încât un magazin poate servi pentru o vreme o versiune mai veche decât altul. Aceasta este versiunea curentă din fiecare magazin:

| Magazin | Versiune curentă | Notă |
|---|---|---|
| Apple App Store (iOS) | 1.2.4 | |
| Google Play (Android) | 1.2.4 | |
| Chrome Web Store | 0.4.3 | |
| Firefox Add-ons | 0.4.4 | |
| Safari (Mac App Store) | 1.8.1, cu extensia 0.4.3 | Mac App Store folosește propria numerotare `1.x` |

Magazinele afișează întotdeauna versiunea lor curentă, iar un magazin care încă servește o versiune mai veche se va actualiza automat.

### Ce adaugă versiunile 1.2.5 / 0.4.5 {#whats-new-125}

Pentru utilizarea de zi cu zi (aplicație și extensie, mainnet și testnet dacă nu se specifică altfel):

- **Prima rulare cu un scop.** După tur, **Ce vrei să faci mai întâi?** te ghidează spre primire, trimitere sau păstrarea criptomonedelor în siguranță, cu o scurtă verificare a backupului. Se poate sări peste și redeschide. Vezi [Prima rulare](/qorex/getting-started#first-run).
- **Cereri de plată cu linkuri semnate** și plata uneia dintr-un link. O cerere este marcată drept plătită când lanțul o arată.
- **Contacte și favorite**, cu **Repetă plata** și un avertisment pentru adrese asemănătoare.
- **Un istoric mai clar**: în așteptare, confirmat sau eșuat, per cont, cu export CSV.
- **Protecția banilor mei**: backup, test de recuperare, gardieni (aplicație), site-uri conectate, permisiuni și aprobări de tokeni cu Revocă și o explicație simplă despre ce semnături sunt post-cuantice pe care lane.
- **Ferestre de acces EVM mai sigure.** O fereastră pe care o deschizi tu are implicit **doar transferuri de QOR**; permiterea oricărui contract este o alegere separată, cu avertisment. Aprobările numesc fiecare contract permis de o fereastră și spun când o fereastră nouă o înlocuiește pe cea deschisă. Când un nod nu poate verifica ce face un apel cu tokenii tăi, QoreX spune acest lucru și cere o a doua apăsare.
- **Ajutor în aplicație** (**Asistență**): doar canalele oficiale, plus un memento că personalul QoreX nu îți cere niciodată fraza.
- **Un banner de stare a rețelei** când blocurile nu mai sosesc, iar **perioada de staking** (timpul până când QOR retras redevine al tău de mutat) se citește din rețea în loc să fie un număr fix.
- **Extensie: cererea de semnare a unui site cât timp QoreX este blocat** deschide ecranul de parolă și numește site-ul; după ce deblochezi, cererea își afișează propria aprobare.
- **Aplicație: site-uri favorite și recente** pe pagina de start a browserului dApp.
- **Îngrijirea cheii post-cuantice**: **Înregistrează din nou cheia** pentru o înregistrare de cheie care nu mai poate semna (niciodată automat, două apăsări), **Rotește cheia post-cuantică** din fraza de recuperare și conturi multisig complete (creare, co-semnare prin fișier sau prin lipire, trimitere).
- **Primește** oferă și tokenurile adăugate prin contract, cu adresa rețelei lor.
- **Primește** pentru Cosmos Hub, Osmosis și Celestia arată adresa cu care semnează trimiterile tale de pe acele rețele.
- **Mod dezvoltator** cu 17 unelte. Vezi [Modul dezvoltator](/qorex/developer-mode).
- **Doar testnet:** trimitere pe alt lanț prin IBC, un ecran QoreChain Bridge și Solana pe QoreChain. Vezi [Funcții de testnet](/qorex/testnet-features).
- **Pentru site-uri:** QoreX refuză acum o permisiune permanentă (un grant authz de `MsgGrant` sau `MsgExec`) care ar lăsa pe altcineva să acționeze ca contul tău, de pe orice site. Vezi [Integrare dApp](/qorex/dapp-integration).

Ce au schimbat pentru tine versiunile 1.2.4 / 0.4.3:

- **Deblocarea extensiei.** Enter deblochează, butonul arată că lucrează, **Parolă greșită.** apare doar pentru o parolă greșită, iar orice altă eroare este numită.
- **Apelurile de contract primesc destul gaz.** Tranzacția CosmWasm sau între VM-uri a unui site este simulată înainte de aprobare, iar un apel pe care contractul l-ar refuza este refuzat înainte să îl vezi.
- **Prețurile gazului urmează rețeaua**, iar o tranzacție peste limita de gaz per tranzacție a rețelei este refuzată înainte să se semneze ceva.
- **Aprobările Solana** marchează drept ilizibilă o instrucțiune pe care QoreX nu o poate decodifica și cer o a doua apăsare; un memo își arată textul.
- **O cheie post-cuantică ce nu mai poate semna este numită ca atare**, în loc de "registered by another wallet".
- **Un site nu mai poate închide fereastra ta EVM sau șterge consimțământul ei**; pe ambele le faci de pe ecranele proprii ale QoreX.
- **Randamentul de staking** se citește din cifra proprie a lanțului, iar **utilizarea ferestrei EVM** apare în Istoric.
- **Firefox:** github.com se încarcă normal cu QoreX instalat.

Ce au schimbat pentru tine versiunile 1.2.3 / 0.4.2:

- **Primirea începe cu moneda.** O listă cu căutare, cu QOR primul, apoi moneda proprie a fiecărei rețele și tokenurile incluse, fiecare cu imaginea ei. Alegând una vezi adresa și codul QR pentru acea rețea, cu un avertisment care numește moneda.
- **Conturile care nu pot folosi o fereastră EVM află ce au de făcut**, cu un buton către **Conturile tale**.
- **Ecranele de staking și de fereastră EVM spun când prima ta tranzacție îți înregistrează și cheia.**

Ce au schimbat pentru tine versiunile 1.2.2 / 0.4.1:

- Pagina QOR listează fiecare tranzacție a contului, primită și trimisă, cu **Arată mai multe**.
- **Trimiterea funcționează pe BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche și Celestia** (și tokenurile lor), la fel ca pe Ethereum, Solana, Cosmos Hub și Osmosis.
- Ecranele de aprobare citesc regulile de cheltuire și datele de apel EVM și oferă mesajul complet. Mesajele care gestionează cheile sau autoritatea unui cont pot fi semnate doar de pe ecranele proprii ale QoreX.
- Verificarea unei prime trimiteri arată comisionul unic de înregistrare a cheii și totalul.

Ce a schimbat pentru tine versiunea 1.2.1 (aplicație): un link poate deschide o pagină în browserul dApp (după solicitarea biometrică obișnuită), foile de aprobare arată memo-ul unei tranzacții, iar aplicația își declară capabilitățile de semnare către site-uri. Linkurile care încep cu `qorex://` oferite de dashboard funcționează din nou.

Ce au schimbat pentru tine versiunile 1.2.0 / 0.4.0:

- **Blocare automată** (1, 5, 15, 30, 60 sau 240 de minute; implicit 15) și un buton **Blochează** în extensie.
- **O verificare înaintea fiecărui transfer** în extensie și un avertisment când o adresă doar seamănă cu una pe care ai plătit-o înainte.
- **Istoric per cont** cu fiecare tip de tranzacție QoreChain.
- **Ecranele de staking** din extensie sunt separate (Staking QOR, Retrage din staking, Mută stake-ul, Revendică, Revendică și restachează, Blochează pentru bonus, Recompensele merg în), **Mută stake-ul** se face în trei pași și prinde mutările pe care rețeaua le-ar refuza, iar tu poți **alege unde ajung recompensele din staking** (alt cont al aceluiași portofel).
- **dApp-urile EVM semnează prin QoreX** (`personal_sign`, date tipizate și tranzacții), cu riscul decodificat al fiecărei cereri și o simulare înainte de semnare.
- **Ultimele valori cunoscute** sunt afișate și etichetate ca atare când rețeaua nu răspunde.
- Un avertisment când comisionul este mai mare decât valoarea pe care o muți.

Ce au adăugat versiunile 1.1.9 / 0.3.9 (incluse în fiecare build curent):

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

QoreX funcționează pe mainnet `qorechain-vladi` (activ din 7 iunie 2026), care rulează chain **v3.2.8** din 18 noiembrie 2026 (v3.2.7 din 12 noiembrie 2026, v3.2.6 din 4 noiembrie 2026, v3.2.5 din 29 octombrie 2026, v3.2.4 din 23 octombrie 2026). Formatul de semnare, adresele, zecimalele și memo-urile nu se schimbă în aceste actualizări. QoreX 1.2.4 / 0.4.3 a adăugat gestionarea regulilor v3.2.8 (domeniul ferestrei EVM, limitele de gaz și prețul gazului din rețea), așa că ține QoreX actualizat.

## Pentru dezvoltatori {#developers}

Ca să conectezi un site web la QoreX (descoperirea portofelului, furnizorul, semnarea, linkurile și erorile), începe cu [Integrare dApp](/qorex/dapp-integration); uneltele pentru constructori incluse în portofel sunt la [Modul dezvoltator](/qorex/developer-mode). Ca să te integrezi cu QoreX din propria aplicație, poți folosi și kitul pentru dezvoltatori QoreX: șase pachete npm, publicate la versiunea 0.1.0. Comenzile lor de instalare, exemplele și limitele se află la [Integrări QoreX](/developer-tools/qorex-integrations). Pentru descoperirea portofelelor și semnarea într-o aplicație web, vezi și [adaptorul de portofel](/developer-tools/wallet-adapter) și, pentru providerul de browser pe care îl injectează QoreX, [Extensia de browser](/qorex/browser-extension#standards).

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
- **Autentificare** (e-mail, sau Apple ori Google) - necesară pentru a revendica un @handle, pentru a te asocia cu Dashboard și pentru a folosi în aplicație cererile de plată bazate pe cont.
- **Conectarea la Dashboard și adresele asociate** - trimite o dovadă semnată că deții adresa.
- **Cereri de plată bazate pe cont** (către un @handle, în aplicație) - trimit handle-ul expeditorului, handle-ul destinatarului, suma și o notă opțională. Un **link de plată semnat** este creat și semnat pe dispozitivul tău; dacă a fost plătit se citește de la endpoint-urile publice QoreChain.
- **Scaner Q-Day pe o adresă Bitcoin** - întreabă un serviciu operat de altcineva, care vede acea adresă și adresa ta IP. QoreX îl numește și scanează doar după ce accepți.

**Widget-ul de pe ecranul principal** nu face nicio cerere proprie către serverele QoreChain: aplicația îi transmite local adresa, soldul și indicatorul de confidențialitate, iar widget-ul reîmprospătează soldul de la punctul final REST public QoreChain.

**Păstrate doar pe dispozitiv:** contactele, site-urile dApp favorite și recente din aplicație (salvate fără query-ul sau fragmentul adresei), exportul de istoric pe care îl faci, precum și testul de recuperare și verificarea backupului (cuvintele pe care le scrii nu sunt păstrate sau trimise). Bannerul de **stare a rețelei** citește ultimul bloc de la endpoint-urile publice QoreChain, nu dintr-un serviciu de stare separat.

În niciuna dintre aplicații nu există **nici chat AI, nici serviciu QCAI**. Unealta **Agenți AI** din modul dezvoltator îi permite unui asistent AI pe care îl rulezi tu să propună tranzacții către QoreX; QoreX nu are în el niciun serviciu AI propriu, iar nimic nu se semnează fără aprobarea ta.
