---
slug: /qorex/troubleshooting
title: Depanare QoreX
sidebar_label: Depanare
sidebar_position: 9
---

# Depanare

Întrebări frecvente și remedii rapide pentru aplicația și extensia QoreX.

| Simptom | Cauză / remediu |
|---|---|
| **„Securizează-ți mai întâi dispozitivul"** la configurare | Configurează Face ID / o amprentă **sau o blocare a ecranului (PIN / model)** în setările sistemului, apoi revino. Un portofel poate fi creat doar pe un dispozitiv cu un factor de deblocare puternic. Pe Android, deblocarea facială 2D singură este o biometrie *slabă* — PIN-ul din spatele ei este ceea ce se califică. |
| **Foaia de conectare s-a închis** / „Acea încercare de conectare a expirat" | O încercare anterioară a fost abandonată — pur și simplu apasă din nou pe conectare. |
| **„Adaugă o cheie de acces" lipsește** după conectarea cu Google / Dashboard | Comportament așteptat: cheile de acces se atașează doar conturilor cu cod pe email (vezi nota din [Cont și Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **„Handle-urile vin în curând"** | Registrul de @handle este temporar inaccesibil. Portofelul tău nu este afectat; handle-urile se activează automat la revenirea acestuia. |
| **„Cod greșit sau QR deteriorat"** în timpul asocierii dispozitivului | Verifică din nou codul de 10 caractere (alfabetul omite caracterele care se confundă ușor: fără 0/O/1/I/L) și scanează din nou. Ambele artefacte sunt de unică folosință. |
| **Ecranul camerei spune că este necesară permisiunea** | iOS: Setări → QoreX → Cameră. Android: Informații aplicație → Permisiuni → Cameră. |
| **Extensie: niciun portofel la prima deschidere** | Extensia este un portofel **de sine stătător** — deschide fereastra pop-up și alege **Creează portofel** sau **Importă portofel**. Nu necesită aplicația mobilă. |
| **Trimiterea de la o adresă doar-citire este refuzată** | Acea adresă aparține altui portofel (eticheta arată căruia). QoreX poate semna doar pentru propriile conturi derivate — trimite din portofelul care o deține. |
| **Se afișează insigna testnet** | Setări → **„Folosește testnet (dezvoltatori)"** este activat. Dezactivează-l pentru a reveni la mainnet. |
| **Butonul de Swap este dezactivat** | Comportament așteptat deocamdată — Swap se activează automat odată ce lichiditatea din pool este disponibilă; nu este necesară nicio actualizare a aplicației. |

## Tot blocat?

- Consultă pagina [Securitate și Recuperare](/qorex/security-and-recovery) pentru gardieni și asocierea dispozitivelor.
- Pentru întrebări despre QoreChain în sine, vezi [documentația principală](/introduction/what-is-qorechain) sau canalele comunității conectate pe [qorechain.io](https://qorechain.io).
