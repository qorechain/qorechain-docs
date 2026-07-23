---
slug: /qorex/troubleshooting
title: Risoluzione dei problemi di QoreX
sidebar_label: Risoluzione dei problemi
sidebar_position: 9
---

# Risoluzione dei problemi

Domande frequenti e soluzioni rapide per l'app e l'estensione QoreX.

| Sintomo | Causa / soluzione |
|---|---|
| **"Proteggi prima il tuo dispositivo"** durante l'onboarding | Configura Face ID / un'impronta digitale **oppure un blocco schermo (PIN / pattern)** nelle impostazioni di sistema, poi torna indietro. Un wallet può essere creato solo su un dispositivo con un fattore di sblocco forte. Su Android, lo sblocco con volto 2D da solo è un dato biometrico *debole* — è il PIN dietro di esso a soddisfare il requisito. |
| **Foglio di accesso chiuso** / "Quel tentativo di accesso è scaduto" | Un tentativo precedente è stato abbandonato — tocca semplicemente di nuovo l'accesso. |
| **"Aggiungi una passkey" mancante** dopo l'accesso con Google / Dashboard | Previsto: le passkey si collegano solo agli account con codice via email (vedi la nota in [Account e Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **"Handle in arrivo"** | Il registro degli @handle è temporaneamente irraggiungibile. Il tuo wallet non è interessato; gli handle si attivano automaticamente al suo ritorno. |
| **"Codice errato o QR danneggiato"** durante il collegamento del dispositivo | Ricontrolla il codice di 10 caratteri (l'alfabeto omette i caratteri simili: niente 0/O/1/I/L) e riesegui la scansione. Entrambi gli elementi sono monouso. |
| **La schermata della fotocamera indica che serve l'autorizzazione** | iOS: Impostazioni → QoreX → Fotocamera. Android: Info app → Autorizzazioni → Fotocamera. |
| **Estensione: "Nessun wallet ancora"** | L'estensione si abbina a un wallet creato nell'app mobile QoreX — creane prima uno lì. |
| **Invio da un indirizzo di sola lettura rifiutato** | Quell'indirizzo appartiene a un altro wallet (l'etichetta mostra quale). QoreX può firmare solo per i propri account derivati — effettua l'invio dal wallet che lo possiede. |
| **Badge testnet visualizzato** | Impostazioni → **"Usa testnet (sviluppatori)"** è attivo. Disattivalo per tornare alla mainnet. |
| **Il pulsante Swap è disabilitato** | Previsto per ora — lo Swap si attiva automaticamente non appena è disponibile la liquidità del pool; non è necessario alcun aggiornamento dell'app. |

## Ancora bloccato?

- Consulta la pagina [Sicurezza e recupero](/qorex/security-and-recovery) per i guardiani e il collegamento dei dispositivi.
- Per domande su QoreChain stessa, consulta la [documentazione principale](/introduction/what-is-qorechain) o i canali della community collegati su [qorechain.io](https://qorechain.io).
