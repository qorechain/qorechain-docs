---
slug: /qorex/browser-extension
title: Extensie de browser
sidebar_label: Extensie de browser
sidebar_position: 8
---

# Extensie de browser

**Extensia de browser** QoreX (Chrome și Firefox; o versiune Safari este în pregătire, cu funcționalitate identică) este **conectorul pentru dApp-uri** pe desktop. Le permite site-urilor să îți descopere portofelul și transformă fiecare cerere într-o aprobare explicită. Se împerechează conceptual cu aplicația mobilă și **nu** include funcții de staking, portofoliu sau cont — acestea se află în aplicație.

## Configurare

Extensia se împerechează cu un portofel creat în **aplicația mobilă QoreX**. Dacă deschizi fereastra pop-up înainte de împerechere, aceasta afișează **"No wallet yet — create one in the QoreX app."**

## Deblocare

Fereastra pop-up îți cere **parola seifului** (sau o cheie de acces acolo unde browserul acceptă chei derivate din passkey). Seiful este criptat cu AES-256-GCM în stocarea extensiei, se blochează automat, iar fiecare deblocare este explicită.

## Conectarea la dApp-uri

Site-urile descoperă QoreX prin **EIP-6963** (standardul multi-portofel) și contractul de conectare QoreChain. QoreX **nu suprascrie niciodată** `window.ethereum` sau `window.keplr` — apare **alături** de alte portofele, iar tu alegi ce portofel să folosești pentru fiecare site.

1. Un site solicită o conexiune; fereastra pop-up de aprobare afișează **originea**.
2. Aprobarea dezvăluie doar **adresa ta publică** acelei origini.
3. Aprobările sunt **per-origine**, persistă între repornirile browserului, iar aprobarea unui site nu acordă nimic altuia.

## Semnare

Fiecare cerere de semnătură deschide o fereastră de aprobare care afișează **conținutul decodat** — destinatarul, suma, rețeaua — niciodată un hash simplu.

- Pentru tranzacțiile QoreChain pe lane-ul Native, extensia menționează că **dApp-ul furnizează stratul post-cuantic** (portofelul semnează jumătatea clasică — același model pe care îl folosesc portofelele consacrate).
- Dacă o cerere este **doar clasică**, fereastra pop-up afișează un avertisment explicit: **"⚠ This request is a classical signature — the app did not add a quantum-safe layer."**
- **Reject** este întotdeauna la un singur clic, iar cererile expiră de la sine.

## Trimitere pe rețele externe

Din fereastra pop-up poți trimite **ETH / BNB / POL / ARB / SOL** și tokenuri **ERC-20 / SPL** (aceleași derivări de seed ca în aplicație). Trebuie să confirmi nota privind semnătura clasică înainte de trimitere; un link cu rezultatul deschide exploratorul de blocuri.

## Rețele și postură de securitate

- **Rețea activă** — QoreChain **mainnet** în mod implicit (lanțul `0x2649` pe lane-ul EVM). Testnet-ul rămâne acceptat pentru dApp-urile care îl solicită, iar cererile de semnătură între rețele sunt refuzate.
- **Permisiuni** — extensia solicită **doar `storage`**. Scriptul de conținut injectează doar API-urile furnizorului; nu citește conținutul paginii dincolo de cererile portofelului și nu există analize și nici cod la distanță.
