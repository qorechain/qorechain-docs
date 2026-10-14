---
slug: /qorex/send-and-receive
title: Trimite și primește
sidebar_label: Trimite și primește
sidebar_position: 3
---

# Trimite și primește

Fila Acasă (Portofel) este punctul tău de plecare. Aceasta afișează un **ecuson de rețea** (MAINNET implicit, sau TESTNET dacă ai activat comutatorul pentru dezvoltatori), **soldul tău total** (atinge pentru a-l ascunde/afișa) și acțiunile principale: **Trimite · Primește · Schimbă · Mizează** (**Schimbă** nu apare pe iOS). Lista ta de active afișează **QOR** (Native + post-cuantic 🛡, un sold unificat în lanele Native/EVM/SVM) și **Toate rețelele** (o vedere unificată pentru ETH, BNB, POL, ARB și celelalte [rețele externe](#external-networks-tokens) suportate de QoreX).

## Trimite QOR sigur cuantic

1. Atinge **Trimite**.
2. Introdu destinatarul ca adresă `qor1…` **sau** ca **@handle**. Un handle este rezolvat și verificat criptografic (semnătura registrului + semnătura proprietarului + fixare bazată pe încredere la prima utilizare); dacă cheia unui handle se schimbă vreodată în tăcere, QoreX afișează un avertisment explicit.
3. Introdu suma. Previzualizarea arată destinatarul, suma, **comisionul de rețea** și starea **Shield** — nivelul de protecție post-cuantică al semnăturii.
4. Confirmă cu aprobare **biometrică**. QoreX semnează transferul cu semnătura hibridă post-cuantică obligatorie (ML-DSA-87 + secp256k1) și îl difuzează pe lana Native.

Pe primul ecran, **Ask QoreX** te lasă să scrii o cerere precum „send 50 QOR to @maria" și completează formularul pentru tine; tot tu verifici și confirmi cu biometrie, ca de obicei. Cererile simple sunt citite pe dispozitivul tău; una pe care nu o poate citi astfel poate fi trimisă către serviciul QCAI al QoreChain pentru a fi transformată într-o schiță. Asistentul nu semnează niciodată și nu îți vede niciodată cheile. Destinatarii recenți apar sub formă de chip-uri.

QoreChain nu îți înregistrează singur cheia post-cuantică — QoreX o face pentru tine în cadrul **primului** tău transfer (un mic comision de rețea, o singură dată), iar starea o poți vedea în [Securitate și recuperare](/qorex/security-and-recovery#pqc-key). Nu este nevoie de niciun pas separat în QoreX.

### Trimite către un @handle, pas cu pas {#handle-send}

1. Deschide **Trimite** și scrie `@` urmat de handle (de exemplu `@liviu`) în câmpul destinatarului, în loc de o adresă.
2. QoreX caută handle-ul și îți arată **adresa `qor1…` rezolvată** înainte să confirmi orice.
3. Verifică adresa rezolvată, introdu suma și confirmă ca de obicei.

QoreX acceptă doar o rezolvare care trece **ambele** verificări pe care le efectuează: o atestare a registrului verificată față de o cheie de încredere fixată în aplicație și semnătura proprie a proprietarului handle-ului asupra revendicării. Eșuarea oricăreia dintre verificări declanșează o eroare, în loc să revină la o adresă neverificată. Prima dată când plătești un anumit handle, QoreX reține adresa la care a rezolvat; dacă adresa acelui handle se schimbă vreodată, QoreX se oprește înainte de semnare și îți arată adresa veche și cea nouă una lângă alta, pentru ca tu să decizi dacă vrei să continui. Această memorie este **per dispozitiv** — plătirea aceluiași handle pentru prima dată de pe un alt telefon sau după o instalare nouă îl arată ca nou și acolo, ceea ce este normal, nu o eroare. Extensia de browser rezolvă și plătește handle-urile în același mod (memoria ei este **per browser**, deci un browser sau un computer diferit îl vede ca nou) — vezi [Trimite către un @handle](/qorex/browser-extension#handle-send).

### Trimiterea QOR blocat (vesting) {#vesting}

Dacă o parte din soldul tău este încă în **vesting** — de exemplu o alocare TGE neeliberată — totalul tău este împărțit în **disponibil acum** și **încă blocat**. Poți trimite doar partea disponibilă; QoreX refuză el însuși o încercare de cheltuire peste sold, în loc să lase rețeaua să o respingă după ce a perceput un comision. Partea blocată devine cheltuibilă treptat, pe măsură ce programul de vesting o deblochează. Această împărțire este afișată oriunde apare soldul tău — Acasă, Trimite și Detalii activ.

## Primește {#receive}

Atinge **Primește**. QoreChain este selectat primul — adresa ta `qor1…` (și @handle-ul tău, dacă ai unul) sub formă de cod QR cu pictograma QoreChain, plus **Copiază** și **Partajează**. Tot ce este trimis către ea ajunge cu protecție rezistentă cuantic.

Pentru a primi pe altă rețea, folosește selectorul **Rețea** de sus: Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis și Celestia afișează fiecare **propria adresă** și avertismentul *„Trimite către această adresă doar \{coin\} sau tokenuri de pe \{network\}. Monedele trimise dintr-o altă rețea se pot pierde."* Toate rețelele EVM au aceeași adresă `0x…`. Adresele tale EVM și Solana sunt derivate din fraza ta de recuperare, așa că QoreX îți cere o confirmare biometrică (**Show the address**) înainte de a le afișa. Celelalte rețele nu pot transporta semnături post-cuantice — vezi [Rețele externe](#external-networks-tokens).

În extensia de browser, **Primește** are același selector de rețea.

## Monede și tokenuri {#coins-and-tokens}

O monedă fără rând nu are o adresă pe care să fie primită. Pentru a vedea o monedă sau un token în **Portofoliu** *înainte* de a deține vreunul, deschide Portofoliu → **+ Coin or token** și activează-l (în extensie: **Coins and tokens**). O monedă fixată la zero deschide **Primește** pe rețeaua ei când este atinsă. Setări → **Coins and networks** listează tot ce poate deține portofelul astăzi.

**Adaugă un token prin contract** (doar rețele EVM):

1. Portofoliu → **+ Coin or token** → **Add a token by contract** (extensie: **Coins and tokens** → *Add a token by contract*).
2. Alege **Rețeaua**, lipește **Adresa contractului (0x…)** și atinge **Check contract**.
3. QoreX citește simbolul și numărul de zecimale chiar din contract și afișează *„Contractul spune: \{symbol\} · \{decimals\} zecimale"*. Oricine poate crea un token și îi poate da orice nume — QoreX nu garantează pentru el, așa că asigură-te că este contractul pe care l-ai vrut.
4. Atinge **Add \{symbol\}**. Este marcat *Added by you* și poate fi trimis ca tokenurile incluse. Îl poți elimina oricând.

QoreX refuză un token care este deja inclus, unul pe care l-ai adăugat deja, o rețea non-EVM, o adresă greșită, un contract care nu răspunde ca token și un contract care folosește numele unui token pe care QoreX îl livrează deja pe acea rețea (probabil o copie).

## Solicită o plată

Atinge **Solicită** (necesită [autentificare](/qorex/account-and-dashboard#sign-in)) pentru a crea o solicitare de plată — o sumă plus un memo opțional — sub formă de cod QR sau link. Oricine îl scanează vede transferul precompletat.

## Rețele și tokenuri externe {#external-networks-tokens}

Din **Toate rețelele** (sau Trimite-extern) poți trimite nativ **ETH, BNB, POL, AVAX și SOL**, plus ETH pe **Arbitrum, Base și OP Mainnet**, și **ATOM, OSMO și TIA** pe Cosmos, plus tokenuri **ERC-20**, **SPL** și **IBC** — USDC și USDT pe lanțurile EVM și pe Solana, DAI pe Ethereum și Noble USDC prin IBC — toate derivate din aceeași frază de recuperare (ETH folosește `m/44'/60'`, SOL folosește calea sa standard, iar SPL folosește conturi de token asociate).

:::caution Lanțurile externe sunt exclusiv clasice
Alte blockchain-uri nu pot transporta semnături post-cuantice. Când trimiți pe o rețea externă, QoreX declară acest lucru explicit (transferul folosește o semnătură clasică, iar **Shield** afișează retrogradarea). **QOR** al tău rămâne întotdeauna pe lana Native protejată. Trimiterile externe bazate pe Cosmos acceptă un memo opțional. Pentru rețelele EVM, QoreX afișează și **comisionul maxim de rețea** înainte de confirmare — „Network fee: at most \{fee\}. Check it before you confirm." — și semnează exact cu acea cifră.
:::

## Schimbă

Fila **Schimbă** este conectată la AMM-ul on-chain al QoreChain, dar rămâne dezactivată — butonul afișează **"Swap — coming with pool liquidity"** — până când lichiditatea și indicatorul de funcționalitate la distanță o activează. Când se întâmplă acest lucru, ea se aprinde automat; **nu este nevoie de nicio actualizare a aplicației**.

:::note iOS
Fila Swap nu apare deloc în build-ul din App Store — Apple tratează schimbul de tokenuri în aplicație ca pe un serviciu reglementat. Swap rămâne disponibil (odată activat) doar pe Android. Extensia de browser nu are ecran de Swap.
:::

## Extra pe ecranul principal {#home-extras}

- **Widget pe ecranul principal** (Android și iPhone) — adaugă **QoreX** din selectorul de widget-uri al telefonului. Afișează soldul tău QOR pentru contul în uz, afișează puncte în loc de sumă cât timp modul de confidențialitate este activ, se reîmprospătează singur aproximativ la fiecare 30 de minute și deschide aplicația când este atins. Oricine îți poate vedea ecranul principal poate vedea widget-ul, așa că activează modul de confidențialitate (atinge soldul) dacă acest lucru contează.
- **Notificări push** (mobil, mainnet) — clopoțelul de pe Acasă → **Notifications** are un comutator **Push notifications**: *„Primește o notificare când ajunge QOR, chiar și cu aplicația închisă. Serverul nostru urmărește doar adresele tale publice; Apple și Google nu văd nicio sumă sau adresă."* Textul notificării este doar „QOR received". Dezactivarea comutatorului îți elimină dispozitivul de pe server. Dacă notificările sunt dezactivate pentru QoreX în setările telefonului, activează-le mai întâi acolo. Livrarea a fost testată cap-coadă pe Android; pe iPhone, consideră-o pe cât posibil (best effort) și continuă să verifici lista **Notifications** din aplicație.
- **Căutare și tur** — vezi [Orientează-te](/qorex/getting-started#find-your-way).

## Pași următori

- [Portofoliu și mizare](/qorex/portfolio-and-staking) — vezi alocarea ta și câștigă recompense.
- [Securitate și recuperare](/qorex/security-and-recovery) — protejează-ți și recuperează-ți portofelul.
