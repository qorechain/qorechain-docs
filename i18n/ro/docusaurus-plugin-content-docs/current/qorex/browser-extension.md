---
slug: /qorex/browser-extension
title: Extensie de browser
sidebar_label: Extensie de browser
sidebar_position: 8
---

# Extensie de browser

**Extensia de browser** QoreX este **conectorul dApp** pentru desktop. Rulează pe **Chrome și Firefox**, iar un build pentru **Safari** este livrat din aceeași bază de cod (împachetat cu wrapper-ul Apple pentru extensii web Safari — pe Safari, aprobările se deschid într-o filă de browser în loc de o fereastră popup). Le permite site-urilor web să îți descopere portofelul și transformă fiecare cerere într-o aprobare explicită. Se împerechează conceptual cu aplicația mobilă și **nu** include funcții de staking, portofoliu sau cont — acestea sunt în aplicație.

## Configurare

Extensia se împerechează cu un portofel creat în **aplicația mobilă QoreX**. Dacă deschizi popup-ul înainte de împerechere, acesta afișează **„No wallet yet — create one in the QoreX app.”**

## Deblocare

Popup-ul îți cere **parola de vault** (sau o passkey acolo unde browserul acceptă chei derivate din passkey). Vault-ul este criptat AES-256-GCM în stocarea extensiei, se blochează automat, iar fiecare deblocare este explicită.

## Conectarea la dApp-uri

Site-urile web descoperă QoreX prin **EIP-6963** (standardul multi-wallet) și contractul de conectare QoreChain. QoreX **nu suprascrie niciodată** `window.ethereum` sau `window.keplr` — apare **alături** de alte portofele, iar tu alegi ce portofel să folosești pentru fiecare site.

1. Un site solicită o conexiune; popup-ul de aprobare afișează **originea**.
2. Aprobarea dezvăluie doar **adresa ta publică** acelei origini.
3. Aprobările sunt **per-origine**, persistă între repornirile browserului, iar aprobarea unui site nu acordă nimic altuia.

## Semnare

Fiecare cerere de semnătură deschide o fereastră de aprobare care afișează **payload-ul decodat** — destinatar, sumă, rețea — niciodată un hash brut.

- Pentru tranzacțiile QoreChain pe lane-ul Native, extensia notează că **dApp-ul furnizează stratul post-cuantic** (portofelul semnează jumătatea clasică — același model folosit de portofelele consacrate).
- Dacă o cerere este **doar clasică**, popup-ul afișează un avertisment explicit: **„⚠ This request is a classical signature — the app did not add a quantum-safe layer.”**
- **Reject** este întotdeauna la un singur clic, iar cererile expiră de la sine.

## Trimitere pe rețele externe

Din popup poți trimite **ETH / BNB / POL / ARB / SOL** și tokenuri **ERC-20 / SPL** (aceleași derivări de seed ca în aplicație). Trebuie să confirmi nota privind semnătura clasică înainte de trimitere; un link cu rezultatul deschide exploratorul de blocuri.

## Rețele și postură de securitate

- **Rețea activă** — QoreChain **mainnet** în mod implicit (chain `0x2649` pe lane-ul EVM). Testnet rămâne acceptat pentru dApp-urile care îl solicită, iar cererile de semnătură între rețele sunt refuzate.
- **Permisiuni** — extensia solicită **doar `storage`**. Scriptul de conținut injectează doar API-urile de provider; nu citește conținutul paginii dincolo de cererile portofelului și nu există nici analytics, nici cod la distanță.
