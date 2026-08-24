---
slug: /qorex/troubleshooting
title: Risoluzione dei problemi di QoreX
sidebar_label: Risoluzione dei problemi
sidebar_position: 9
---

# Risoluzione dei problemi

Domande comuni e soluzioni rapide per l'app e l'estensione QoreX.

| Sintomo | Causa / soluzione |
|---|---|
| **"Metti prima in sicurezza il tuo dispositivo"** durante l'onboarding | Configura Face ID / un'impronta digitale **oppure un blocco schermo (PIN / sequenza)** nelle impostazioni di sistema, poi torna indietro. Un wallet può essere creato solo su un dispositivo con un fattore di sblocco forte. Su Android, lo sblocco facciale 2D da solo è una biometria *debole* — è il PIN dietro di esso a soddisfare il requisito. |
| **Finestra di accesso chiusa** / "Tentativo di accesso scaduto" | Un tentativo precedente è stato abbandonato — tocca di nuovo su accedi. |
| **"Aggiungi una passkey" mancante** dopo l'accesso con Google / Dashboard | Comportamento previsto: le passkey si collegano solo agli account con codice via email (vedi la nota in [Account e Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **"Handle in arrivo a breve"** | Il registro degli @handle è temporaneamente irraggiungibile. Il tuo wallet non è interessato; gli handle si attivano automaticamente al ripristino. |
| **QoreX avvisa che l'indirizzo di un handle è cambiato** | Comportamento di sicurezza previsto, non un bug — QoreX ricorda l'indirizzo a cui un handle si è risolto la prima volta che lo hai pagato, e segnala un cambiamento successivo invece di fidarsi silenziosamente. Conferma il nuovo indirizzo fuori banda con il destinatario prima di procedere. |
| **Invio rifiutato per "importo superiore al saldo disponibile"** su un account con vesting | Parte del tuo saldo è ancora bloccata da un piano di vesting. Può essere inviata solo la porzione **disponibile** (mostrata su Home, Invia e nel dettaglio dell'Asset); il resto si sblocca gradualmente. |
| **Una richiesta del wallet dice che è "per testnet/mainnet, ma il tuo wallet è su…"** | La richiesta (ad esempio dalla Dashboard) è destinata a una rete diversa da quella a cui sei attualmente connesso. Cambia rete tu stesso per primo se è quello che intendevi fare — QoreX non cambierà rete al posto tuo. |
| **"Codice errato o QR danneggiato"** durante il collegamento del dispositivo | Ricontrolla il codice a 10 caratteri (l'alfabeto omette i caratteri simili: niente 0/O/1/I/L) e riesegui la scansione. Entrambi gli elementi sono monouso. |
| **La schermata della fotocamera indica che serve un permesso** | iOS: Impostazioni → QoreX → Fotocamera. Android: Info app → Autorizzazioni → Fotocamera. |
| **Estensione: nessun wallet alla prima apertura** | L'estensione è un wallet **autonomo** — apri il popup e scegli **Crea wallet** o **Importa wallet**. Non richiede l'app mobile. |
| **Invio da un indirizzo di sola lettura rifiutato** | Quell'indirizzo appartiene a un altro wallet (l'etichetta indica quale). QoreX può firmare solo per i propri account derivati — invia dal wallet che lo possiede. |
| **Badge testnet visibile** | In Impostazioni, **"Usa testnet (sviluppatori)"** è attivo. Disattivalo per tornare alla mainnet. |
| **Il pulsante Swap è disabilitato** | Previsto per ora — Swap si attiva automaticamente non appena è disponibile liquidità nel pool; non è necessario alcun aggiornamento dell'app. |
| **Ho disinstallato l'app / rimosso l'estensione e ora non vedo alcun wallet** | Il vault esisteva solo su quel dispositivo o in quel browser. Se avevi eseguito il backup della tua frase di 24 parole, ripristina con quella. Se avevi configurato il [recupero sociale](/qorex/security-and-recovery#social-recovery), avvia un recupero con i tuoi guardiani. Senza uno dei due, il wallet non può essere recuperato — vedi [Esegui subito il backup](/qorex/security-and-recovery#back-up-now) per proteggere immediatamente qualsiasi nuovo wallet. |

## Ancora bloccato?

- Consulta la pagina [Sicurezza e recupero](/qorex/security-and-recovery) per guardiani e collegamento dei dispositivi.
- Per domande su QoreChain in generale, consulta la [documentazione principale](/introduction/what-is-qorechain) o i canali della community collegati su [qorechain.io](https://qorechain.io).
