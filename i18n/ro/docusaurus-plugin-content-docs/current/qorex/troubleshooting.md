---
slug: /qorex/troubleshooting
title: Depanare QoreX
sidebar_label: Depanare
sidebar_position: 9
---

# Depanare

Întrebări frecvente și remedieri rapide pentru aplicația și extensia QoreX.

| Simptom | Cauză / remediere |
|---|---|
| **„Securizează-ți mai întâi dispozitivul”** la configurarea inițială | Configurează Face ID / o amprentă **sau o blocare a ecranului (PIN / pattern)** în setările sistemului, apoi revino. Un portofel poate fi creat doar pe un dispozitiv cu un factor de deblocare puternic. Pe Android, deblocarea facială 2D singură este un factor biometric *slab* — PIN-ul din spatele ei este cel care se califică. |
| **Fișa de autentificare s-a închis** / „Acea încercare de autentificare a expirat” | O încercare anterioară a fost abandonată — pur și simplu apasă din nou pe autentificare. |
| **„Adaugă o cheie de acces” lipsește** după autentificarea cu Google / Dashboard | Este de așteptat: cheile de acces se atașează doar conturilor cu cod pe email (vezi nota din [Cont și Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **„Handle-uri în curând”** | Registrul de @handle este temporar inaccesibil. Portofelul tău nu este afectat; handle-urile se activează automat când revine. |
| **„Cod greșit sau QR deteriorat”** în timpul asocierii dispozitivului | Reverifică codul de 10 caractere (alfabetul omite caracterele care se aseamănă: fără 0/O/1/I/L) și scanează din nou. Ambele artefacte sunt de unică folosință. |
| **Ecranul camerei spune că este necesară permisiunea** | iOS: Settings → QoreX → Camera. Android: App info → Permissions → Camera. |
| **Extensie: „Încă niciun portofel”** | Extensia se asociază cu un portofel creat în aplicația mobilă QoreX — creează mai întâi unul acolo. |
| **Trimiterea de la o adresă doar-citire este refuzată** | Acea adresă aparține altui portofel (eticheta arată căruia). QoreX poate semna doar pentru propriile conturi derivate — trimite din portofelul care o deține. |
| **Se afișează insigna testnet** | Settings → **„Folosește testnet (dezvoltatori)”** este activat. Dezactivează-l pentru a reveni la mainnet. |
| **Butonul Swap este dezactivat** | De așteptat deocamdată — Swap se activează automat odată ce lichiditatea pool-ului este disponibilă; nu este necesară nicio actualizare a aplicației. |

## Tot blocat?

- Consultă pagina [Securitate și recuperare](/qorex/security-and-recovery) pentru gardieni și asocierea dispozitivelor.
- Pentru întrebări despre QoreChain în sine, vezi [documentația principală](/introduction/what-is-qorechain) sau canalele comunității listate pe [qorechain.io](https://qorechain.io).
