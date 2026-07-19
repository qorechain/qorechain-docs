---
slug: /qorex/account-and-dashboard
title: Account e Dashboard
sidebar_label: Account e Dashboard
sidebar_position: 6
---

# Account e Dashboard

QoreX funziona **completamente senza account** — le tue chiavi non dipendono mai da uno. L'accesso aggiunge solo comodità come @handle, richieste di pagamento e abbinamento con Dashboard.

## Accesso {#sign-in}

Puoi accedere da **Sign in** nella scheda Home, oppure durante l'onboarding. Metodi:

- **Codice via email** — inserisci la tua email e ricevi un codice monouso. Dopo questo accesso, QoreX propone di aggiungere una **passkey** per accessi futuri istantanei (Face ID / Touch ID / PIN). È una passkey di *account* — non tocca mai le chiavi del tuo wallet.
- **Passkey** — se ne hai registrata una in precedenza.
- **Continua con Google** — un unico passaggio nativo attraverso il foglio di autenticazione del sistema (l'app non rimbalza mai verso un browser).
- **Continua con QORECHAIN Dashboard** — accedi con un account Dashboard esistente (incluso il suo login Google) e importa il tuo profilo.

:::note
La proposta della passkey compare solo dopo l'accesso con **codice via email**. Quando accedi con un identity provider (Google o Dashboard), quel provider gestisce la propria autenticazione, quindi non è possibile associare una passkey a quegli account.
:::

## @handle {#handle}

Rivendica un nome univoco (per esempio `@liviu`) legato al tuo indirizzo tramite **doppia firma** (una firma ed25519 del registro + la tua firma secp256k1). Chiunque può quindi inviare al tuo @handle. La risoluzione è **verify-then-pin** (trust-on-first-use), quindi se la chiave di un handle viene mai modificata silenziosamente, QoreX lo segnala.

Se il registro degli handle è temporaneamente irraggiungibile, la schermata si riduce a **"Handles coming soon"** e tutto il resto continua a funzionare; gli handle si riattivano automaticamente quando il registro ritorna disponibile.

## Account collegato {#linked-account}

**Settings → Linked account** collega il tuo wallet QoreX e il tuo account Dashboard in entrambe le direzioni:

1. Inserisci il codice a 8 caratteri mostrato dalla Dashboard, **oppure** generane uno in QoreX (valido 10 minuti) e digitalo nella Dashboard.
2. Una volta collegati, il tuo @handle e gli indirizzi connessi compaiono su entrambi.
3. Scollega in qualsiasi momento.

Accedere *tramite* **Continua con Dashboard** collega i due implicitamente — non c'è nulla di aggiuntivo da fare.

## Integrazione con Dashboard {#dashboard}

Con la Dashboard collegata:

- **Connect with QoreX** sulla Dashboard la abbina al tuo wallet tramite un deep link `qorex://connect` più una prova di proprietà firmata.
- **I trasferimenti avviati sulla Dashboard** arrivano in QoreX come richieste `qorex://tx`. Vengono decodificati, mostrati per intero e firmati **solo nell'app** dopo l'approvazione biometrica — e solo dall'indirizzo derivato dall'app stessa.
- **I tuoi indirizzi (Settings)** — elenca ogni account derivato da questo wallet, più gli indirizzi in **sola lettura** che hai collegato da altri wallet (Keplr / MetaMask / Phantom). Le voci in sola lettura sono etichettate con il wallet che le ha create; se provi a inviare da una di esse, viene spiegato che devi inviare dal wallet che l'ha creata.

## Passaggi successivi

- [Sicurezza e Recupero](/qorex/security-and-recovery) — i firmatari collegati e i limiti di spesa si basano su questo abbinamento.
- [Browser dApp](/qorex/dapp-browser) — connettiti alle app dall'interno di QoreX.
