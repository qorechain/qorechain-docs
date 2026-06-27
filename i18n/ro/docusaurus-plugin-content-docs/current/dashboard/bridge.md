---
slug: /dashboard/bridge
title: Bridge
sidebar_label: Bridge
sidebar_position: 5
---

# Bridge

**Bridge**-ul îți permite să muți active între QoreChain și alte lanțuri dintr-un singur ecran. Fiecare operațiune de bridge este securizată prin criptografie post-cuantică. Pentru designul din spatele transferurilor cross-chain, vezi [Arhitectura Bridge](/architecture/bridge-architecture).

:::caution Status calificat
Bridge-ul cross-chain se află în prezent pe testnet și este lansat progresiv — nu este încă un sistem de producție pe mainnet. Tratează rutele disponibile ca fiind în lucru, nu ca o conectivitate live garantată, și începe pe testnet.
:::

Conectează-ți portofelul pentru a folosi Bridge-ul — vezi [Prezentare generală și primii pași](/dashboard/overview#connect-your-wallet).

## Cum faci bridge unui activ

1. Alege lanțul **sursă** și tokenul în selectorul de sus. Selectorul afișează tokenul, rețeaua sa și soldul tău.
2. Alege lanțul **destinație** și tokenul în selectorul de jos.
3. Introdu suma de transferat. Suma pe care o vei primi este afișată pentru partea de destinație.
4. Pentru a trimite activele către o altă adresă decât a ta, activează **Send to another** și introdu destinatarul.
5. Verifică **comisionul** și **timpul estimat** până la decontare, afișate în partea de jos.
6. Confirmă transferul în portofelul tău.

Un control de schimbare între cele două selectoare îți permite să inversezi sursa și destinația dintr-o singură atingere.

## Sfaturi

- Confirmă ambele lanțuri și adresa de destinație înainte de a trimite — transferurile cross-chain nu pot fi anulate.
- Timpul de decontare variază în funcție de rută; estimarea se actualizează pe măsură ce modifici lanțurile și sumele.
- Pentru context despre modul în care transferurile sunt validate între lanțuri, vezi [Transferul activelor (bridging)](/user-guide/bridging-assets) și [Arhitectura Bridge](/architecture/bridge-architecture).
