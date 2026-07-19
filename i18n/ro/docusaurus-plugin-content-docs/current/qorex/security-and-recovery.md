---
slug: /qorex/security-and-recovery
title: Securitate și recuperare
sidebar_label: Securitate și recuperare
sidebar_position: 5
---

# Securitate și recuperare

Tot ce ține de protejarea și recuperarea portofelului tău se află în **Setări → Panoul de securitate**. Fila Home afișează de asemenea un card **Starea backupului** care continuă să avertizeze până când recuperarea socială este configurată.

## Cheia post-cuantică {#pqc-key}

Panoul de securitate afișează starea live, on-chain, a cheii tale post-cuantice: **„Se înregistrează la primul tău transfer”** → **„Înregistrată on-chain ✓”**. Algoritmul este **ML-DSA-87** (determinist, hibrid cu secp256k1).

**Rotația cheii** — rotirea cheii tale post-cuantice (o operațiune on-chain `MsgRotatePQCKey`) necesită o ceremonie biometrică nouă și **nu este niciodată automatizată**. Vezi [Rotația cheii](/developer-guide/post-quantum-signing#key-rotation) pentru mecanismul de bază.

## Recuperare socială {#social-recovery}

Recuperarea socială permite unor **gardieni** de încredere să te ajute să îți restaurezi portofelul fără a vedea vreodată fraza ta de recuperare.

- Seed-ul tău este împărțit în **fragmente sigilate cu ML-KEM** distribuite gardienilor ca o schemă cu **prag** (t-din-n): oricare *t* dintre cei *n* gardieni ai tăi te pot ajuta să recuperezi, dar mai puțini nu pot.
- Fiecare gardian primește o credențială. Configurarea nu scrie nimic lizibil pe releu — doar plicuri opace, sigilate.
- O recuperare necesită aprobarea pragului de gardieni, apoi rulează un **blocaj temporal de 48 de ore** și îți trimite o **alertă de anulare**, astfel încât o tentativă rău intenționată poate fi oprită.

**Configureaz-o:** Panoul de securitate → Recuperare socială → alege-ți gardienii și pragul. Avertismentul privind starea backupului dispare odată ce acest lucru este făcut.

**Aprobă recuperarea altcuiva:** dacă ești gardian pentru cineva, folosește **Ajută la recuperare** din fila Home pentru a-i aproba cererea.

## Legacy Protocol {#legacy}

**Legacy Protocol** este moștenire rezistentă la calcul cuantic: un mecanism dead-man's switch suprapus peste gardienii tăi, astfel încât activele tale să poată trece la beneficiarii aleși de tine dacă devii de necontactat. Este opțional și se configurează din Panoul de securitate.

## Conectează un dispozitiv nou {#link-device}

Mută-ți portofelul pe un al doilea telefon sau tabletă **fără server și fără a tasta** cele 24 de cuvinte:

1. **Dispozitivul nou** → onboarding → **Conectează de la alt dispozitiv**. Afișează un **cod de 10 caractere** de unică folosință și deschide camera.
2. **Dispozitivul vechi** → Setări → Securitate → **Conectează un dispozitiv nou** → tastează acel cod → confirmă cu biometrie. Apare un **cod QR** (seed-ul tău sigilat cu o cheie derivată din cod: scrypt N=2¹⁷ → AES-256-GCM).
3. **Dispozitivul nou** scanează codul QR → se decriptează local → același portofel, aceleași adrese.

**De ce este sigur:** codul și codul QR nu apar niciodată pe același ecran. O fotografie doar a codului QR este text cifrat protejat de o funcție de derivare a cheii cu utilizare intensivă a memoriei, iar ambele artefacte sunt de unică folosință și dispar odată cu ecranele. Un cod greșit dă o eroare clară — pur și simplu reîncearcă.

:::note
Conectarea dispozitivelor este o **facilitate de confort**, nu o metodă de recuperare. Fraza ta de 24 de cuvinte și recuperarea socială sunt adevăratele tale plase de siguranță.
:::

## dApp-uri conectate {#connected-dapps}

Conexiunile dApp sunt **per-origine** și **limitate la sesiune**: închiderea browserului dApp din aplicație revocă fiecare conexiune. Poți examina și deconecta conexiunile active din Panoul de securitate.

## Semnatari conectați și limite de cheltuire {#linked-signers}

Când conectezi chei externe (Phantom / MetaMask) prin [Dashboard](/qorex/account-and-dashboard#dashboard), fiecare primește **permisiuni delimitate** și o **SpendingRule** care este aplicată **on-chain**, nu doar în interfață. Gestionarea cheilor nu poate fi niciodată delegată unei chei conectate. Vezi [Autentificatori de portofele conectate](/developer-guide/account-abstraction#authenticators) pentru modelul on-chain. Dashboardul afișează întotdeauna adevărul on-chain curent.

## Q-Day Scanner {#q-day-scanner}

**Q-Day Scanner** îți permite să introduci orice adresă — a ta sau a oricui — și să obții un raport de expunere cuantică: care fonduri stau pe chei exclusiv clasice și care sunt deja protejate post-cuantic. Îl accesezi din butoanele rapide ale filei Home.

## Modelul de securitate, pe scurt

1. **Non-custodial** — cheile sunt generate pe dispozitiv, stau în seifuri susținute hardware (mobil) sau într-un seif criptat (extensie) și nu părăsesc niciodată dispozitivul.
2. **Nimic fără consimțământ** — fiecare conexiune este per-origine, fiecare semnătură este aprobată individual (biometric pe mobil), iar payload-urile sunt întotdeauna decodate înainte de semnare.
3. **Rezistent la calcul cuantic în mod implicit** — transferurile QOR pe lane-ul Native poartă întotdeauna ML-DSA-87 + secp256k1; orice element clasic este etichetat, niciodată silențios.
4. **Fără colectare de date** — fără analize, urmărire sau reclame. Autentificarea opțională în cont este acoperită de [politica de confidențialitate QoreChain](https://qorechain.io/privacy).
5. **Căi de recuperare** — frază de 24 de cuvinte (întotdeauna), recuperare socială cu gardieni + blocaj temporal de 48h (opțional), moștenire Legacy (opțional), conectarea dispozitivelor (confort).
