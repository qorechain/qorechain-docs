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
| **"Secure your device first"** la configurarea inițială | Înrolează Face ID / o amprentă în setările sistemului, apoi revino în aplicație. Un portofel poate fi creat doar pe un dispozitiv protejat biometric. |
| **Fila de autentificare s-a închis** / "That sign-in attempt expired" | O încercare anterioară a fost abandonată — atinge din nou autentificarea. |
| **"Add a passkey" lipsește** după autentificarea cu Google / Dashboard | De așteptat: cheile de acces (passkeys) se atașează doar conturilor cu cod pe email (vezi nota din [Cont și Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **"Handles coming soon"** | Registrul de @handle este temporar inaccesibil. Portofelul tău nu este afectat; handle-urile se activează automat când registrul revine. |
| **"Wrong code or damaged QR"** în timpul asocierii dispozitivului | Verifică din nou codul de 10 caractere (alfabetul omite caracterele care se confundă: fără 0/O/1/I/L) și scanează din nou. Ambele artefacte sunt de unică folosință. |
| **Ecranul camerei cere permisiune** | iOS: Settings → QoreX → Camera. Android: App info → Permissions → Camera. |
| **Extensia: "No wallet yet"** | Extensia se împerechează cu un portofel creat în aplicația mobilă QoreX — creează mai întâi unul acolo. |
| **Trimiterea de la o adresă read-only este refuzată** | Acea adresă aparține altui portofel (eticheta arată căruia). QoreX poate semna doar pentru propriile conturi derivate — trimite din portofelul care o deține. |
| **Se afișează insigna testnet** | Settings → **"Use testnet (developers)"** este activat. Dezactivează-l pentru a reveni la mainnet. |
| **Butonul Swap este dezactivat** | De așteptat deocamdată — Swap se activează automat de îndată ce este disponibilă lichiditatea pool-ului; nu este necesară nicio actualizare a aplicației. |

## Tot blocat?

- Consultă pagina [Securitate și recuperare](/qorex/security-and-recovery) pentru gardieni și asocierea dispozitivelor.
- Pentru întrebări despre QoreChain în sine, vezi [documentația principală](/introduction/what-is-qorechain) sau canalele comunității listate pe [qorechain.io](https://qorechain.io).
