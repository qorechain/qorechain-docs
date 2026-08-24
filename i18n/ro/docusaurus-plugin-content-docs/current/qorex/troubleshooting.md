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
| **„Securizează-ți mai întâi dispozitivul”** la onboarding | Configurează Face ID / o amprentă **sau o blocare a ecranului (PIN / model)** în setările sistemului, apoi revino. Un portofel poate fi creat doar pe un dispozitiv cu un factor de deblocare puternic. Pe Android, deblocarea facială 2D, de una singură, este o biometrie *slabă* — PIN-ul din spatele ei este cel care califică. |
| **Fereastra de conectare s-a închis** / „Acea încercare de conectare a expirat” | O încercare anterioară a fost abandonată — apasă din nou pe conectare. |
| **„Adaugă o passkey” lipsește** după conectarea cu Google / Dashboard | Comportament așteptat: passkey-urile se atașează doar conturilor cu cod pe e-mail (vezi nota din [Cont și Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **„Handle-urile vin în curând”** | Registrul de @handle-uri este temporar inaccesibil. Portofelul tău nu este afectat; handle-urile se activează automat la revenirea acestuia. |
| **QoreX avertizează că adresa unui handle s-a schimbat** | Comportament de securitate așteptat, nu o eroare — QoreX reține adresa la care a rezolvat un handle prima dată când l-ai plătit și semnalează o schimbare ulterioară în loc să o accepte în tăcere. Confirmă noua adresă printr-un canal separat cu destinatarul înainte de a continua. |
| **Trimiterea este refuzată pentru „mai mult decât soldul tău disponibil”** pe un cont cu vesting | O parte din soldul tău este încă blocată printr-un program de vesting. Doar partea **disponibilă** (afișată pe Acasă, Trimite și Detalii activ) poate fi trimisă; restul se deblochează treptat. |
| **O cerere din portofel spune că este „pentru testnet/mainnet, dar portofelul tău este pe…”** | Cererea (de exemplu, din Dashboard) vizează o altă rețea decât cea la care ești conectat în prezent. Comută tu însuți rețelele mai întâi, dacă asta ai intenționat — QoreX nu va comuta pentru tine. |
| **„Cod greșit sau QR deteriorat”** în timpul asocierii dispozitivului | Verifică din nou codul de 10 caractere (alfabetul omite caracterele care se confundă ușor: fără 0/O/1/I/L) și scanează din nou. Ambele artefacte sunt de unică folosință. |
| **Ecranul camerei spune că este necesară permisiunea** | iOS: Setări → QoreX → Cameră. Android: Informații aplicație → Permisiuni → Cameră. |
| **Extensie: niciun portofel la prima deschidere** | Extensia este un portofel **de sine stătător** — deschide fereastra pop-up și alege **Creează portofel** sau **Importă portofel**. Nu necesită aplicația mobilă. |
| **Trimiterea de la o adresă doar-citire este refuzată** | Acea adresă aparține altui portofel (eticheta arată căruia). QoreX poate semna doar pentru propriile conturi derivate — trimite din portofelul care o deține. |
| **Se afișează insigna testnet** | Setări → **„Folosește testnet (dezvoltatori)”** este activat. Dezactivează-l pentru a reveni la mainnet. |
| **Butonul de Swap este dezactivat** | Comportament așteptat deocamdată — Swap se activează automat odată ce lichiditatea din pool este disponibilă; nu este necesară nicio actualizare a aplicației. |
| **Am dezinstalat aplicația / am eliminat extensia și acum nu văd niciun portofel** | Seiful a existat doar pe acel dispozitiv sau în acel browser. Dacă ai făcut backup fraza ta de 24 de cuvinte, restaurează cu ea. Dacă ai configurat [recuperarea socială](/qorex/security-and-recovery#social-recovery), pornește o recuperare cu gardienii tăi. Fără niciuna dintre ele, portofelul nu poate fi recuperat — vezi [Fă backup acum](/qorex/security-and-recovery#back-up-now) pentru a proteja imediat orice portofel nou. |

## Tot blocat?

- Consultă pagina [Securitate și Recuperare](/qorex/security-and-recovery) pentru gardieni și asocierea dispozitivelor.
- Pentru întrebări despre QoreChain în sine, vezi [documentația principală](/introduction/what-is-qorechain) sau canalele comunității conectate pe [qorechain.io](https://qorechain.io).
