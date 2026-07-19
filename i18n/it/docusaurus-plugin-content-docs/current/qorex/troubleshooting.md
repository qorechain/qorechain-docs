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
| **"Secure your device first"** durante l'onboarding | Registra Face ID / un'impronta digitale nelle impostazioni di sistema, poi torna all'app. Un wallet può essere creato solo su un dispositivo protetto da biometria. |
| **Foglio di accesso chiuso** / "That sign-in attempt expired" | Un tentativo precedente è stato abbandonato: tocca semplicemente di nuovo l'accesso. |
| **"Add a passkey" mancante** dopo l'accesso con Google / Dashboard | Comportamento previsto: le passkey si collegano solo agli account con codice via email (vedi la nota in [Account e Dashboard](/qorex/account-and-dashboard#sign-in)). |
| **"Handles coming soon"** | Il registro degli @handle è temporaneamente irraggiungibile. Il tuo wallet non è interessato; gli handle si attivano automaticamente al ripristino. |
| **"Wrong code or damaged QR"** durante il collegamento del dispositivo | Ricontrolla il codice di 10 caratteri (l'alfabeto esclude i caratteri simili: nessuno 0/O/1/I/L) e riesegui la scansione. Entrambi gli elementi sono monouso. |
| **La schermata della fotocamera richiede l'autorizzazione** | iOS: Impostazioni → QoreX → Fotocamera. Android: Info app → Autorizzazioni → Fotocamera. |
| **Estensione: "No wallet yet"** | L'estensione si abbina a un wallet creato nell'app mobile QoreX: creane prima uno lì. |
| **Invio da un indirizzo di sola lettura rifiutato** | Quell'indirizzo appartiene a un altro wallet (l'etichetta indica quale). QoreX può firmare solo per i propri account derivati: invia dal wallet a cui appartiene. |
| **Badge Testnet visibile** | Impostazioni → **"Use testnet (developers)"** è attivo. Disattivalo per tornare alla mainnet. |
| **Il pulsante Swap è disattivato** | Comportamento previsto per ora: lo Swap si attiva automaticamente non appena è disponibile la liquidità del pool; non è necessario alcun aggiornamento dell'app. |

## Ancora bloccato?

- Consulta la pagina [Sicurezza e recupero](/qorex/security-and-recovery) per i guardiani e il collegamento dei dispositivi.
- Per domande su QoreChain in sé, consulta la [documentazione principale](/introduction/what-is-qorechain) o i canali della community indicati su [qorechain.io](https://qorechain.io).
