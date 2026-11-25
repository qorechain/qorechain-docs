---
slug: /qorex/send-and-receive
title: Trimite și primește
sidebar_label: Trimite și primește
sidebar_position: 3
---

# Trimite și primește

Această pagină acoperă trimiterea și primirea de QOR, plata către un @handle, cererile de plată, contactele, istoricul tranzacțiilor, deținerea de active pe alte rețele și extra-urile din ecranul Acasă. Este pentru oricine folosește aplicația mobilă QoreX (extensia are aceleași ecrane Trimite și Primește, vezi [Extensia de browser](/qorex/browser-extension)). Acolo unde ceva diferă între aplicație, extensia de browser și extensia Safari, textul spune acest lucru.

## Inovații {#innovations}

- **Cereri de plată semnate.** O cerere este un link semnat cu cheia propriului tău cont. Cine o plătește vede cum QoreX verifică semnătura, rețeaua exactă și orice @handle înainte să apară verificarea obișnuită, așa că o sumă sau un destinatar modificat iese la iveală în loc să treacă neobservat. Vezi [Cereri de plată](#payment-requests).
- **Stare citită din lanț.** Un transfer este *în așteptare*, *confirmat* sau *eșuat* pentru că așa spune rețeaua, iar o cerere de plată este marcată *plătită* doar când lanțul arată o plată care se potrivește. Vezi [Istoric](#history).
- **Semnalarea adreselor asemănătoare.** O adresă care doar seamănă cu una pe care o cunoști deja este semnalată înainte să trimiți. Vezi [Contacte și favorite](#contacts).
- **Avertismente despre comisioane în cuvinte simple.** QoreX îți spune când comisionul este mai mare decât suma trimisă și arată comisionul unic de înregistrare a cheii și totalul la prima ta trimitere.

Fila Acasă (Portofel) este punctul tău de plecare. Aceasta afișează un **ecuson de rețea** (MAINNET implicit, sau TESTNET dacă ai activat comutatorul pentru dezvoltatori), **soldul tău total** (atinge pentru a-l ascunde/afișa) și acțiunile principale: **Trimite · Primește · Schimbă · Mizează** (**Schimbă** nu apare pe iOS). Lista ta de active afișează **QOR** (un sold unificat în lane-urile Native, EVM și SVM, trimis pe lane-ul nativ semnat hibrid) și **Toate rețelele** (o vedere unificată pentru ETH, BNB, POL, ARB și celelalte [rețele externe](#external-networks-tokens) suportate de QoreX).

## Trimite QOR pe lane-ul nativ semnat hibrid

1. Atinge **Trimite**.
2. Introdu destinatarul ca adresă `qor1…` **sau** ca **@handle**. Un handle este rezolvat și verificat criptografic (semnătura registrului + semnătura proprietarului + fixare la prima utilizare); dacă cheia unui handle se schimbă vreodată în tăcere, QoreX afișează un avertisment explicit.
3. Introdu suma. Previzualizarea arată destinatarul, suma, **comisionul de rețea** și starea semnăturii (dacă transferul poartă stratul ML-DSA-87).
4. Confirmă cu aprobare **biometrică**. Fiecare transfer QOR nativ este semnat de două ori: cu o cheie clasică și cu ML-DSA-87 (FIPS 204). QoreX semnează cu acea semnătură hibridă obligatorie și difuzează pe lane-ul nativ. După difuzare, verifică dacă tranzacția confirmată poartă stratul ML-DSA-87 și te avertizează dacă nu îl poartă.

Pe primul ecran, caseta de completare rapidă (**Întreabă QoreX**) te lasă să scrii o cerere simplă, precum "send 50 QOR to @maria", și completează formularul pentru tine. Este un cititor simplu de text care rulează **în întregime pe dispozitivul tău** - nimic din ce scrii acolo nu este trimis nicăieri și nu este un asistent AI (QoreX nu are unul). Tot tu verifici totul și confirmi cu biometrie, ca de obicei; dacă nu poate citi ce ai scris, o spune, iar tu completezi formularul manual. Contactele tale favorite și destinatarii recenți apar sub formă de chip-uri de o singură atingere (vezi [Contacte și favorite](#contacts)).

QoreChain nu îți înregistrează singur cheia ML-DSA-87. QoreX o face pentru tine în cadrul **primului** tău transfer (un mic comision de rețea, o singură dată), iar starea o poți vedea în [Securitate și recuperare](/qorex/security-and-recovery#pqc-key). Nu este nevoie de niciun pas separat în QoreX.

**Verificarea unei prime trimiteri arată costul de la început.** Pe lângă sumă și **Comision de rețea**, verificarea listează *Înregistrare unică a cheii ML-DSA-87* cu comisionul ei și apoi **Total comisioane**, așa că nu există surprize după ce confirmi. Trimiterile ulterioare din același cont arată doar comisionul de rețea.

**Comision mai mare decât suma.** Dacă taxa de rețea este mai mare decât suma pe care o trimiți, verificarea spune acest lucru (*"Taxa de rețea ... e mai mare decât suma trimisă ..."*) ca atenționare. Nu blochează niciodată trimiterea. QoreX o afișează pentru trimiterile native de QOR și pentru moneda proprie a unei rețele externe când comisionul este exprimat în acea monedă. Revendicarea recompenselor din staking primește aceeași verificare, vezi [Portofoliu și staking](/qorex/portfolio-and-staking#claim).

### Trimite către un @handle, pas cu pas {#handle-send}

1. Deschide **Trimite** și scrie `@` urmat de handle (de exemplu `@liviu`) în câmpul destinatarului, în loc de o adresă.
2. QoreX caută handle-ul și îți arată **adresa `qor1…` rezolvată** înainte să confirmi orice. (Revendicarea propriului handle necesită un cont autentificat și se face în aplicație - vezi [@handle](/qorex/account-and-dashboard#handle).)
3. Verifică adresa rezolvată, introdu suma și confirmă ca de obicei.

QoreX acceptă doar o rezolvare care trece **ambele** verificări pe care le efectuează: o atestare a registrului verificată față de o cheie de încredere fixată în aplicație și semnătura proprie a proprietarului handle-ului asupra revendicării. Eșuarea oricăreia dintre verificări declanșează o eroare, în loc să revină la o adresă neverificată. Prima dată când plătești un anumit handle, QoreX reține adresa la care a rezolvat; dacă adresa acelui handle se schimbă vreodată, QoreX se oprește înainte de semnare și îți arată adresa veche și cea nouă una lângă alta, pentru ca tu să decizi dacă vrei să continui. Această memorie este **per dispozitiv** - plătirea aceluiași handle pentru prima dată de pe un alt telefon sau după o instalare nouă îl arată ca nou și acolo, ceea ce este normal, nu o eroare. Extensia de browser rezolvă și plătește handle-urile în același mod (memoria ei este **per browser**, deci un browser sau un computer diferit îl vede ca nou) - vezi [Trimite către un @handle](/qorex/browser-extension#handle-send).

### Trimiterea QOR blocat (vesting) {#vesting}

Dacă o parte din soldul tău este încă în **vesting** - de exemplu o alocare TGE neeliberată - totalul tău este împărțit în **disponibil acum** și **încă blocat**. Poți trimite doar partea disponibilă; QoreX refuză el însuși o încercare de cheltuire peste sold, în loc să lase rețeaua să o respingă după ce a perceput un comision. Partea blocată devine cheltuibilă treptat, pe măsură ce programul de vesting o deblochează. Această împărțire este afișată oriunde apare soldul tău - Acasă, Trimite și Detalii activ.

## Primește {#receive}

Atinge **Primește**. Începe cu moneda: o **listă cu căutare** (*Alege moneda pe care vrei să o primești*, caseta de căutare *Caută monedă sau rețea*) cu **QOR primul**, apoi moneda proprie a fiecărei rețele acceptate și tokenurile incluse, fiecare cu imaginea ei și a rețelei sale. Dacă nimic nu se potrivește cu căutarea ta, lista spune *Nicio monedă nu se potrivește.* Imaginile vin în interiorul QoreX, așa că nu se descarcă nimic de la un terț pentru a desena lista.

- **QOR** arată adresa ta `qor1...` (și @handle-ul tău, dacă ai unul) sub formă de cod QR cu pictograma QoreChain, plus **Copiază** și **Partajează**. Tot ce este trimis către ea ajunge pe lane-ul nativ, unde fiecare transfer poartă o semnătură clasică și una ML-DSA-87.
- **Orice altă monedă sau token** arată adresa proprie a acelei rețele și avertismentul *"Trimite la adresa asta doar \{coin\} sau tokenuri de pe \{network\}. Monedele trimise din altă rețea se pot pierde."* Avertismentul numește moneda pe care ai ales-o. Folosește **Alege altă monedă** pentru a reveni la listă.
- **Rețele acoperite:** Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis și Celestia. Toate rețelele EVM au aceeași adresă `0x...`. Adresele tale EVM și Solana sunt derivate din fraza ta de recuperare, așa că QoreX îți cere o singură confirmare biometrică (**Arată adresa**) înainte de a le afișa. Celelalte rețele nu pot transporta semnături ML-DSA-87. Vezi [Rețele externe](#external-networks-tokens).
- **Și tokenurile personalizate sunt pe listă.** Un token adăugat prin adresa de contract (sau, pe Solana, prin adresa de mint) este oferit pe Primește cu adresa rețelei sale, la fel ca un token inclus. Vezi [Monede și tokenuri](#coins-and-tokens).
- **Adrese Cosmos Hub, Osmosis și Celestia.** Adresa afișată este cea cu care semnează trimiterile tale de pe acea rețea (cheia ta coin-118). Build-urile anterioare puteau afișa o adresă diferită pentru un cont coin-60 sau puteau urma contul activ; acest lucru este remediat, iar trimiterea verifică din nou adresa înainte de semnare.

Extensia și extensia Safari au aceeași listă de monede pe **Primește**.

## Monede și tokenuri {#coins-and-tokens}

O monedă fără rând nu are o adresă pe care să fie primită. Pentru a vedea o monedă sau un token în **Portofoliu** *înainte* de a deține vreunul, deschide Portofoliu → **+ Coin or token** și activează-l (în extensie: **Coins and tokens**). O monedă fixată la zero deschide **Primește** pe rețeaua ei când este atinsă. Setări → **Coins and networks** listează tot ce poate deține portofelul astăzi.

**Adaugă un token prin contract** (doar rețele EVM):

1. Portofoliu → **+ Coin or token** → **Add a token by contract** (extensie: **Coins and tokens** → *Add a token by contract*).
2. Alege **Rețeaua**, lipește **Adresa contractului (0x…)** și atinge **Check contract**.
3. QoreX citește simbolul și numărul de zecimale chiar din contract și afișează *„Contractul spune: \{symbol\} · \{decimals\} zecimale"*. Oricine poate crea un token și îi poate da orice nume - QoreX nu garantează pentru el, așa că asigură-te că este contractul pe care l-ai vrut.
4. Atinge **Add \{symbol\}**. Este marcat *Added by you* și poate fi trimis ca tokenurile incluse. Îl poți elimina oricând.

Odată adăugat, tokenul apare și pe [Primește](#receive).

QoreX refuză un token care este deja inclus, unul pe care l-ai adăugat deja, o rețea non-EVM, o adresă greșită, un contract care nu răspunde ca token și un contract care folosește numele unui token pe care QoreX îl livrează deja pe acea rețea (probabil o copie).

## Cereri de plată {#payment-requests}

Cere cuiva o sumă de QOR cu un link semnat pe care îl distribui sau îl copiezi. Funcționează în aplicație, în extensie și în extensia Safari, pe mainnet și pe testnet, și **nu** are nevoie de autentificare în QoreX.

**Creează o cerere**

1. Deschide **Cereri de plată** (aplicație: Setări; extensie: un buton pe ecranul principal).
2. Atinge **Cerere nouă**, introdu **Sumă (QOR)** și o **Notă** opțională (cel mult 140 de caractere). Dacă ai un @handle, poți bifa *Show my @handle on the request*.
3. Atinge **Creează linkul**. QoreX semnează cererea cu cheia propriului tău cont și arată *"Cererea ta e gata. Oricine o poate plăti, în QoreX sau în alt portofel."*
4. **Distribuie linkul** sau **Copiază linkul**.

Linkul este semnat cu cheia contului tău, așa că o sumă sau o adresă modificată este detectată. Cheia trebuie să aparțină adresei de primire: nimeni altcineva nu poate re-semna în numele tău un link modificat. Semnătura este doar o verificare a integrității linkului; plata însăși este semnată în mod normal de plătitor, cu semnătura hibridă pe lane-ul nativ. Formatul linkului este `qorex://pay?v=1&...` și numește rețeaua exactă (mainnet sau testnet).

Butonul **Cere** de pe Acasă în aplicație cere unui anumit utilizator QoreX prin @handle (are nevoie de [autentificare](/qorex/account-and-dashboard#sign-in) și de propriul tău @handle). Odată creată, cererea respectivă poate fi distribuită și ca link semnat.

**Plătește o cerere**

1. Deschide linkul pe un telefon cu QoreX sau mergi la **Plătește o cerere** și folosește **Lipește un link de plată** (și în extensie), apoi **Deschide**.
2. QoreX verifică semnătura, rețeaua și orice @handle *înainte* de a arăta ceva de plătit. Apoi arată destinatarul, suma, nota și eticheta din memo, după care urmează verificarea obișnuită. Confirmi ca la orice trimitere.
3. Mesajele pe care le poți vedea: *"Semnătură verificată: cererea e neschimbată de când a fost semnată."* sau un refuz precum *"Acest link a fost modificat după ce a fost semnat. Nu îl plăti."*, *"Acest link nu a fost semnat de proprietarul adresei care primește. Nu îl plăti."* sau *"Această cerere este pentru \{network\}. Schimbă rețeaua în QoreX ca să o plătești."*
4. Dacă linkul poartă un @handle, QoreX îl verifică în registrul de handle-uri: verificat, prima plată către el, *indică acum altă adresă decât înainte* (verifică cu persoana respectivă înainte să plătești) sau nu indică această adresă (nu plăti decât dacă ești sigur). Un avertisment de handle cere o a doua confirmare.

Deocamdată, QoreX plătește cererile doar în QOR. O cerere de testnet spune *"Cerere pe testnet. QOR de testnet nu are valoare."*

**Urmărește și refolosește**

**Cererile mele** listează cererile pe care le-ai creat. Fiecare arată **Plătită** sau **Neplătită încă**, citit din lanț: QoreX caută o plată care se potrivește (eticheta din memo de pe transfer), iar cererea este marcată plătită doar când lanțul o arată. Dacă rețeaua nu răspunde, spune *Stare necunoscută*, niciodată o presupunere. **Verifică starea** întreabă din nou. **Refolosește luna viitoare** creează o cerere nouă cu aceleași detalii și un id nou. Cu un @handle vezi și **Cereri către mine** și **Cereri trimise de mine prin @handle**.

## Contacte și favorite {#contacts}

**Contacte** (aplicație: Setări; extensie: un buton pe ecranul principal) sunt nume pentru adresele pe care le plătești. Sunt păstrate **doar pe acest dispozitiv**. Un contact are un nume, cel mult o adresă per rețea (QoreChain, EVM, Solana, Cosmos) și un @handle opțional; lista conține cel mult 200.

- **Favorite.** Bifează *Favorit (apare pe ecranul de trimitere)*, iar contactul apare ca un chip de o singură atingere deasupra câmpului destinatarului. Un chip doar completează formularul: tot tu verifici și confirmi.
- **Repetă plata.** Pe o plată anterioară (aplicație: ecranul ei de detalii; extensie: rândul din istoric), **Repetă plata** completează din nou formularul de trimitere cu același destinatar, aceeași sumă și același memo. Întotdeauna verifici și confirmi înainte să se trimită ceva.
- **Semnalarea adreselor asemănătoare.** Un contact nu este o verificare de siguranță, iar QoreX spune acest lucru. Când o adresă pe care urmează să o plătești doar *seamănă* cu una pe care o cunoști deja (aceleași prime și ultime caractere, un truc folosit de escroci, care plantează adrese asemănătoare în istoricul tău), verificarea avertizează *"Atenție: această adresă doar SEAMĂNĂ cu una pe care o cunoști deja"* și arată adresa cunoscută pentru comparare caracter cu caracter. Cere o a doua apăsare (extensie) sau o confirmare a riscului (aplicație). Semnalarea compară cu contactele salvate, conturile pe care le deții și adresele pe care le-ai plătit.
- **Un contact salvat este numit în verificare** (*Contact salvat: \{name\}*). Un @handle salvat arată și dacă adresa lui este aceeași ca la ultima ta plată, nouă sau **schimbată**.

## Istoric {#history}

Istoricul arată fiecare tranzacție QoreChain a unui cont, nu doar trimiterile: primire, staking, retragere din staking, miză mutată, recompense revendicate, blocări, bonus, ferestre EVM, adresa pentru recompense și înregistrarea cheii ML-DSA-87, cu suma, comisionul și tranzacțiile eșuate marcate *Eșuată (taxa s-a plătit totuși)*. Insigna hibridă apare doar pe o tranzacție pe care lanțul însuși a verificat-o. Rețelele externe nu sunt încă în Istoric.

- **Unde.** Aplicație: **Activitate**, cu un selector de cont și un link **Istoric** pe fiecare cont din **Conturile tale**. Extensie: **Istoric** pe ecranul principal, cu un selector de cont.
- **În așteptare, confirmată, eșuată.** Un transfer pe care tocmai l-ai trimis arată **În așteptare: rețeaua nu a confirmat încă** până când lanțul îl cunoaște. O tranzacție pe care lanțul nu a văzut-o după câteva minute afișează *Negăsită în rețea: este posibil să fi eșuat. Verifică tranzacția înainte să trimiți din nou.* Nu este niciodată afișată ca trimisă pe baza unei presupuneri. **Închide** elimină un astfel de rând.
- **Per cont.** Fiecare cont al portofelului are propriul Istoric.
- **Exportă CSV.** **Exportă CSV** scrie istoricul contului într-un fișier **pe acest dispozitiv**. Conține doar istoricul tău: nicio frază și nicio cheie. Coloanele sunt fixe și în engleză, iar orice celulă pe care o foaie de calcul ar putea-o citi ca formulă (o adresă sau un memo care începe cu `=`, `+`, `-` sau `@`) primește un prefix, ca să se deschidă ca text.
- **Spamul este ascuns.** Transferurile primite sub 0,1 QOR al căror memo conține un link sau un domeniu sunt ascunse din Activitate și din notificări, cu un rând precum *"\{n\} transferuri probabil spam ascunse"* și **Arată-le**. Transferurile de valoare zero sunt ascunse. Un memo cu link poartă un avertisment în detaliile tranzacției: QoreChain și QoreX nu îți cer niciodată să accesezi un link trimis cu un transfer.
- **Noduri pruned.** Dacă un nod nu mai păstrează blocurile vechi, QoreX cere o pagină mai mică până când nodul răspunde și spune când rețeaua nu poate fi accesată. În acest caz nu mai afișează o listă goală.

**Pagina QOR** (atinge QOR pe Acasă) listează fiecare tranzacție a contului, primită sau trimisă, cu **Arată mai multe** în partea de jos.

## Rețele și tokenuri externe {#external-networks-tokens}

Trimiterea este activă pentru fiecare rețea pe care o listează QoreX: Ethereum, BNB Smart Chain, Polygon, Arbitrum One, Base, OP Mainnet, Avalanche C-Chain, Solana, Cosmos Hub, Osmosis și Celestia, cu tokenurile lor. BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche și Celestia funcționează din nou, după ce o vreme au fost doar pentru primire. Trimiterile native pe Arbitrum folosesc estimarea de gaz proprie a rețelei.

Din **Toate rețelele** (sau Trimite-extern) poți trimite nativ **ETH, BNB, POL, AVAX și SOL**, plus ETH pe **Arbitrum, Base și OP Mainnet**, și **ATOM, OSMO și TIA** pe Cosmos, plus tokenuri **ERC-20**, **SPL** și **IBC** - USDC și USDT pe lanțurile EVM și pe Solana, DAI pe Ethereum și Noble USDC prin IBC - toate derivate din aceeași frază de recuperare (ETH folosește `m/44'/60'`, SOL folosește calea sa standard, iar SPL folosește conturi de token asociate).

:::caution Lanțurile externe sunt exclusiv clasice
Alte blockchain-uri nu pot transporta semnături ML-DSA-87. Când trimiți pe o rețea externă, QoreX declară acest lucru explicit (transferul folosește o semnătură clasică, iar linia semnăturii o marchează ca clasică). **QOR** al tău rămâne pe lane-ul nativ semnat hibrid. Trimiterile externe bazate pe Cosmos acceptă un memo opțional. Pentru rețelele EVM, QoreX afișează și **comisionul maxim de rețea** înainte de confirmare - „Network fee: at most \{fee\}. Check it before you confirm." - și semnează exact cu acea cifră.
:::

## Schimbă

Fila **Schimbă** este conectată la AMM-ul on-chain al QoreChain, dar rămâne dezactivată - butonul afișează **"Swap - coming with pool liquidity"** - până când lichiditatea și indicatorul de funcționalitate la distanță o activează. Când se întâmplă acest lucru, ea se aprinde automat; **nu este nevoie de nicio actualizare a aplicației**.

:::note iOS
Fila Swap nu apare deloc în build-ul din App Store - Apple tratează schimbul de tokenuri în aplicație ca pe un serviciu reglementat. Swap rămâne disponibil (odată activat) doar pe Android. Extensia de browser nu are ecran de Swap.
:::

## Extra pe ecranul principal {#home-extras}

- **Widget pe ecranul principal** (Android și iPhone) - adaugă **QoreX** din selectorul de widget-uri al telefonului. Afișează soldul tău QOR pentru contul în uz, afișează puncte în loc de sumă cât timp modul de confidențialitate este activ, se reîmprospătează singur aproximativ la fiecare 30 de minute și deschide aplicația când este atins. Widget-ul nu face nicio cerere proprie către serverele QoreChain: aplicația îi transmite, pe dispozitiv, adresa, soldul și setarea de confidențialitate, iar widget-ul citește soldul din endpoint-ul REST public QoreChain (care vede doar adresa ta publică). Oricine îți poate vedea ecranul principal poate vedea widget-ul, așa că activează modul de confidențialitate (atinge soldul) dacă acest lucru contează.
- **Notificări push** (mobil, mainnet) - clopoțelul de pe Acasă → **Notifications** are un comutator **Push notifications**: *„Primește o notificare când ajunge QOR, chiar și cu aplicația închisă. Serverul nostru urmărește doar adresele tale publice; Apple și Google nu văd nicio sumă sau adresă."* Textul notificării este doar „QOR received". Push este **dezactivat până când îl activezi**. Când este activat, serverul păstrează tokenul dispozitivului tău și adresele publice `qor1…` ale portofelului în uz (până la 10); dezactivarea comutatorului îți elimină dispozitivul de pe server, iar un dispozitiv de la care serverul nu a mai primit semnal de 90 de zile este uitat. Vezi [Ce trimite QoreX prin rețea](/qorex/overview#data-and-privacy). Dacă notificările sunt dezactivate pentru QoreX în setările telefonului, activează-le mai întâi acolo. Livrarea a fost testată cap-coadă pe Android; pe iPhone, consideră-o pe cât posibil (best effort) și continuă să verifici lista **Notifications** din aplicație.
- **Căutare și tur** - vezi [Orientează-te](/qorex/getting-started#find-your-way).

## Pași următori

- [Portofoliu și mizare](/qorex/portfolio-and-staking) - vezi alocarea ta și câștigă recompense.
- [Securitate și recuperare](/qorex/security-and-recovery) - protejează-ți și recuperează-ți portofelul.

## Limite și probleme cunoscute {#limits}

- Transferurile pe rețele externe (EVM, Solana, Cosmos) sunt exclusiv clasice. Transferurile SVM și EVM nu sunt acoperite de semnătura hibridă.
- Swap nu este disponibil: este dezactivat până când există lichiditate în pool-uri și nu apare pe iOS.
- Revendicarea unui @handle necesită un cont autentificat și se face în aplicația mobilă. Conturile de tip Ethereum (coin 60) nu au handle. Dacă serviciul de handle-uri este indisponibil, poți plăti în continuare prin adresa `qor1…`.
- Cererile de plată se plătesc doar în QOR. Cererea prin @handle (pentru a vedea cererile trimise unui handle) are nevoie de un @handle revendicat.
- Istoricul acoperă deocamdată doar QoreChain; alte rețele vor urma.
- Notificările push sunt doar pe mainnet, iar pe iPhone pe cât posibil (best effort).
- QOR aflat în vesting nu poate plăti comisioane; doar partea disponibilă poate fi trimisă.
