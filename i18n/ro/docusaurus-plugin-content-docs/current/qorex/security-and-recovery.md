---
slug: /qorex/security-and-recovery
title: Securitate și recuperare
sidebar_label: Securitate și recuperare
sidebar_position: 5
---

# Securitate și recuperare

Tot ce ține de protejarea și recuperarea portofelului tău se află în **Settings → Security dashboard**. Tab-ul Home afișează și un card **Backup health**, care continuă să avertizeze până când configurezi recuperarea socială.

## Fă backup acum — nimeni nu îți poate recupera un portofel pierdut {#back-up-now}

:::danger Citește asta înainte să alimentezi portofelul
QoreX este **non-custodial**: cheile tale există doar pe propriul dispozitiv, iar QoreChain Association nu deține nicio copie a lor, nicio cheie master și nicio modalitate de a reseta sau restaura portofelul tău. **Nu există un flux „am uitat parola", niciun tichet de suport și nicio intervenție din partea serviciului clienți** — dacă pierzi accesul la chei fără să ai un backup pregătit, fondurile sunt pierdute, permanent și ireversibil. Acest lucru este valabil pentru orice portofel non-custodial, nu e o limitare specifică QoreX, dar merită spus clar.

**Fă cel puțin unul dintre următoarele — imediat după ce îți creezi portofelul, nu mai târziu:**

1. **Notează-ți fraza de recuperare din 24 de cuvinte** și păstreaz-o undeva offline și durabil (nu o captură de ecran, nu o notiță sincronizată în cloud, nu un mesaj trimis ție însuți). Este singurul lucru care îți poate restaura portofelul pe orice dispozitiv, oricând.
2. **Configurează [recuperarea socială](#social-recovery)** cu gardieni în care ai încredere. Astfel îți poți recupera portofelul chiar dacă pierzi fraza, fără ca vreun gardian, singur, să poată accesa vreodată fondurile tale.

Cel mai sigur este să faci ambele — fraza te acoperă dacă schimbi dispozitivul sau aplicația este indisponibilă; gardienii te acoperă dacă pierzi chiar fraza.

**Dezinstalarea aplicației îți șterge cheile de pe acel dispozitiv.** Seiful aplicației mobile și seiful extensiei de browser există fiecare doar pe dispozitivul care l-a creat. Dezinstalarea aplicației, resetarea telefonului sau eliminarea/ștergerea extensiei șterge acea copie — fără backup și fără un dispozitiv conectat, portofelul tău nu mai poate fi recuperat de nimeni, inclusiv de QoreChain.
:::

## Cheia post-cuantică {#pqc-key}

Panoul Security afișează starea live, on-chain, a cheii tale post-cuantice: **„Se înregistrează la primul transfer"** → **„Înregistrată on-chain ✓"**. Algoritmul este **ML-DSA-87** (determinist, hibrid cu secp256k1).

**Rotația cheii** — rotirea cheii tale post-cuantice (o operațiune on-chain `MsgRotatePQCKey`) necesită un nou ceremonial biometric și nu este **niciodată automatizată**. Vezi [Rotația cheii](/developer-guide/post-quantum-signing#key-rotation) pentru mecanismul care stă la bază.

## Recuperare socială {#social-recovery}

Recuperarea socială le permite unor **gardieni** de încredere să te ajute să îți restaurezi portofelul fără să vadă vreodată fraza ta de recuperare.

- Seed-ul tău este împărțit în **fragmente sigilate ML-KEM** distribuite gardienilor printr-o schemă de **prag** (t-din-n): oricare *t* din cei *n* gardieni te pot ajuta să recuperezi portofelul, dar mai puțini nu pot.
- Fiecare gardian primește o acreditare. Configurarea nu scrie nimic lizibil pe releu — doar plicuri opace, sigilate.
- O recuperare necesită aprobarea pragului de gardieni, apoi rulează un **timelock de 48 de ore** și îți trimite o **alertă de anulare**, astfel încât o încercare rău-intenționată poate fi oprită.

**Configurare:** Security dashboard → Social recovery → alege-ți gardienii și pragul. Avertismentul Backup health dispare odată ce ai făcut asta.

**Aprobă recuperarea altcuiva:** dacă ești gardian pentru cineva, folosește **Help recover** din tab-ul Home pentru a-i aproba cererea.

## Legacy Protocol {#legacy}

**Legacy Protocol** este o soluție de moștenire rezistentă cuantic: un „dead-man's switch" suprapus peste gardienii tăi, astfel încât activele tale pot trece la beneficiarii aleși de tine dacă devii inaccesibil. Este opțional și se configurează din panoul Security.

## Conectează un dispozitiv nou {#link-device}

Mută-ți portofelul pe un al doilea telefon sau tabletă **fără server și fără a tasta** cele 24 de cuvinte:

1. **Dispozitivul nou** → onboarding → **Link from another device**. Acesta afișează un cod unic de **10 caractere** și deschide camera.
2. **Dispozitivul vechi** → Settings → Security → **Link a new device** → tastează acel cod → confirmă cu biometria. Apare un **cod QR** (seed-ul tău sigilat cu o cheie derivată din cod: scrypt N=2¹⁷ → AES-256-GCM).
3. **Dispozitivul nou** scanează codul QR → îl decriptează local → același portofel, aceleași adrese.

**De ce este sigur:** codul și codul QR nu apar niciodată pe același ecran. O fotografie doar a codului QR este text cifrat protejat printr-o funcție de derivare a cheii dificilă din punct de vedere al memoriei, iar ambele elemente sunt unice și dispar odată cu ecranele. Un cod greșit produce o eroare clară — pur și simplu reîncearcă.

:::note
Conectarea dispozitivelor este o **facilitate**, nu o metodă de recuperare. Fraza ta din 24 de cuvinte și recuperarea socială sunt adevăratele tale plase de siguranță.
:::

## dApp-uri conectate {#connected-dapps}

Conexiunile la dApp-uri sunt **per-origine** și **limitate la sesiune**: închiderea browserului dApp din aplicație revocă toate conexiunile. Poți revizui și deconecta conexiunile active din panoul Security.

## Semnatari conectați și limite de cheltuieli {#linked-signers}

Când conectezi chei externe (Phantom / MetaMask) prin [Dashboard](/qorex/account-and-dashboard#dashboard), fiecare primește **permisiuni limitate** și o **SpendingRule** aplicată **on-chain**, nu doar în interfață. Gestionarea cheilor nu poate fi niciodată delegată către o cheie conectată. Vezi [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators) pentru modelul on-chain. Dashboard-ul afișează întotdeauna adevărul curent on-chain.

## Q-Day Scanner {#q-day-scanner}

**Q-Day Scanner** îți permite să introduci orice adresă — a ta sau a altcuiva — și să obții un raport de expunere cuantică: ce fonduri se află pe chei doar clasice și care sunt deja protejate post-cuantic. Îl găsești din butoanele rapide ale tab-ului Home.

## Modelul de securitate, pe scurt

1. **Non-custodial** — cheile sunt generate pe dispozitiv, trăiesc în seifuri protejate hardware (mobil) sau într-un seif criptat (extensie), și nu părăsesc niciodată dispozitivul.
2. **Nimic fără consimțământ** — fiecare conexiune este per-origine, fiecare semnătură este aprobată individual (biometric pe mobil), iar payload-urile sunt întotdeauna decodate înainte de semnare.
3. **Rezistent cuantic implicit** — transferurile QOR pe lane-ul Native poartă întotdeauna ML-DSA-87 + secp256k1; orice este clasic este etichetat, niciodată tăcut.
4. **Fără colectare de date** — fără analytics, tracking sau reclame. Autentificarea opțională prin cont este acoperită de [politica de confidențialitate QoreChain](https://qorechain.io/privacy).
5. **Căi de recuperare** — fraza din 24 de cuvinte (întotdeauna), recuperare socială cu gardieni + timelock de 48h (opțional), moștenire Legacy (opțional), conectarea dispozitivelor (facilitate).
