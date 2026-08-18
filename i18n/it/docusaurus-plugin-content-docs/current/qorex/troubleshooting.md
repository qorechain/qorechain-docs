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
| **"Proteggi prima il tuo dispositivo"** durante l'onboarding | Configura Face ID / un'impronta digitale **oppure un blocco schermo (PIN / sequenza)** nelle impostazioni di sistema, poi torna. Un wallet può essere creato solo su un dispositivo con un fattore di sblocco affidabile. Su Android, lo sblocco con volto 2D da solo è un fattore biometrico *debole* — è il PIN dietro di esso che lo rende valido. |
| **Foglio di accesso chiuso** / "Quel tentativo di accesso è scaduto" | Un tentativo precedente è stato abbandonato — tocca semplicemente di nuovo per accedere. |
| **"Aggiungi una passkey" mancante** dopo l'accesso con Google / Dashboard | Comportamento previsto: le passkey si collegano solo agli account con codice via email (vedi la nota in [Account e Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **"Handle in arrivo"** | Il registro degli @handle è temporaneamente irraggiungibile. Il tuo wallet non è interessato; gli handle si attivano automaticamente al ripristino del servizio. |
| **"Codice errato o QR danneggiato"** durante il collegamento del dispositivo | Ricontrolla il codice di 10 caratteri (l'alfabeto esclude i caratteri simili: niente 0/O/1/I/L) e riesegui la scansione. Entrambi gli elementi sono monouso. |
| **La schermata della fotocamera chiede l'autorizzazione** | iOS: Impostazioni → QoreX → Fotocamera. Android: Info app → Autorizzazioni → Fotocamera. |
| **Estensione: nessun wallet alla prima apertura** | L'estensione è un wallet **autonomo** — apri il popup e scegli **Crea wallet** o **Importa wallet**. Non richiede l'app mobile. |
| **Invio da un indirizzo di sola lettura rifiutato** | Quell'indirizzo appartiene a un altro wallet (l'etichetta indica quale). QoreX può firmare solo per i propri account derivati — invia dal wallet che lo possiede. |
| **Badge testnet visualizzato** | In Impostazioni → **"Usa testnet (sviluppatori)"** è attivo. Disattivalo per tornare alla mainnet. |
| **Il pulsante Swap è disabilitato** | Comportamento previsto per ora — Swap si attiva automaticamente non appena è disponibile la liquidità del pool; non è necessario aggiornare l'app. |

## Ancora bloccato?

- Consulta la pagina [Sicurezza e recupero](/qorex/security-and-recovery) per i guardiani e il collegamento dei dispositivi.
- Per domande su QoreChain stesso, consulta la [documentazione principale](/introduction/what-is-qorechain) o i canali della community indicati su [qorechain.io](https://qorechain.io).
