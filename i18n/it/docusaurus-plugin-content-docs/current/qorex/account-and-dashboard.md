---
slug: /qorex/account-and-dashboard
title: Account e Dashboard
sidebar_label: Account e Dashboard
sidebar_position: 6
---

# Account e Dashboard

QoreX funziona **completamente senza un account** — le tue chiavi non dipendono mai da uno. L'accesso aggiunge solo comodità come gli @handle, le richieste di pagamento e l'associazione con la Dashboard.

## Accesso {#sign-in}

Puoi accedere da **Sign in** nella tab Home, oppure durante l'onboarding. Metodi disponibili:

- **Codice via email** — inserisci la tua email e ricevi un codice monouso. Dopo questo accesso, QoreX propone di aggiungere una **passkey** per accessi futuri istantanei (Face ID / Touch ID / PIN). Si tratta di una passkey *dell'account* — non tocca mai le chiavi del tuo wallet.
- **Passkey** — se ne hai registrata una in precedenza.
- **Continue with Google** — un singolo passaggio nativo tramite la schermata di autenticazione di sistema (l'app non esce mai verso un browser).
- **Continue with QORECHAIN Dashboard** — accedi con un account Dashboard esistente (incluso il suo login Google) e importa il tuo profilo.

:::note
La proposta della passkey compare solo dopo l'accesso con **codice via email**. Quando accedi con un identity provider (Google o Dashboard), è quel provider a gestire la propria autenticazione, quindi non è possibile associare una passkey a quegli account.
:::

## Più account da una sola frase {#accounts}

Impostazioni → **Your accounts** ti permette di creare, cambiare e rinominare fino a **20 account**, tutti derivati dalla stessa frase di recupero di 24 parole (non c'è nient'altro da salvare come backup). Ogni account è un indirizzo `qor1…` distinto con il proprio saldo e — poiché un handle è legato a un **indirizzo**, non al wallet nel suo insieme — con il proprio @handle opzionale. L'account attivo in un dato momento è quello usato da Send, Receive, Staking e dal browser dApp. A partire dalla **0.2.2**, anche l'estensione per browser ha questa funzionalità — vedi [Più account da una sola frase](/qorex/browser-extension#wallet).

## @handle {#handle}

Rivendica un nome univoco (ad esempio `@liviu`) associato al tuo indirizzo tramite **doppia firma** (una firma ed25519 del registro + la tua firma secp256k1). Chiunque può quindi inviarti fondi al tuo @handle. La risoluzione avviene con logica **verify-then-pin** (trust-on-first-use): se la chiave di un handle viene mai modificata silenziosamente, QoreX lo segnala.

Poiché un handle è legato a un indirizzo e non al tuo wallet, rivendicarne uno è un'operazione **per singolo indirizzo** — se hai [più account](#accounts), ciascuno può avere il proprio @handle, e rivendicarne uno per un account non assegna automaticamente un nome agli altri. Anche l'estensione per browser può rivendicare un handle per il proprio unico indirizzo, direttamente dal popup.

Se il registro degli handle è temporaneamente irraggiungibile, la schermata passa alla modalità **"Handles coming soon"** e tutto il resto continua a funzionare; gli handle tornano automaticamente attivi quando il registro torna disponibile.

:::note Rivendicare un handle rispetto a collegarsi alla Dashboard
Si tratta di due azioni separate e indipendenti. Rivendicare un @handle permette **ad altre persone di inviarti fondi usando il tuo nome** — non fa nient'altro oltre a questo. Collegarsi alla Dashboard (di seguito) connette il tuo wallet a un account Dashboard in modo che i due mostrino gli stessi dati. Puoi fare l'una senza l'altra.
:::

## Account collegato {#linked-account}

**Impostazioni → Linked account** collega il tuo wallet QoreX e il tuo account Dashboard in entrambe le direzioni:

1. Inserisci il codice di 8 caratteri mostrato dalla Dashboard, **oppure** genera un codice in QoreX (valido 10 minuti) e digitalo nella Dashboard.
2. Una volta collegati, il tuo @handle e gli indirizzi connessi compaiono su entrambi.
3. Puoi scollegare in qualsiasi momento.

Accedere *tramite* **Continue with Dashboard** collega implicitamente i due — non c'è nient'altro da fare.

## Integrazione con la Dashboard {#dashboard}

Con la Dashboard collegata:

- **Connect with QoreX** sulla Dashboard la associa al tuo wallet tramite un deep link `qorex://connect` più una prova di proprietà firmata.
- **I trasferimenti avviati dalla Dashboard** arrivano su QoreX come richieste `qorex://tx`. Vengono decodificati, mostrati per intero e firmati **solo nell'app** dopo approvazione biometrica — e solo dall'indirizzo derivato dell'app stessa. Poiché un indirizzo `qor1…` è ugualmente valido su mainnet e testnet, ogni richiesta avviata dalla Dashboard indica quale rete sta prendendo di mira, e QoreX rifiuta di eseguirla se questa non corrisponde alla rete a cui sei attualmente connesso — non cambia mai rete per conto proprio in base a una richiesta.
- Se arriva una richiesta di Connect o di trasferimento mentre **non hai effettuato l'accesso**, QoreX propone un passaggio inline **"Sign in to Dashboard"** così puoi continuare senza trovarti in un vicolo cieco.
- **Your addresses (Settings)** — elenca ogni account derivato da questo wallet, oltre agli indirizzi **di sola lettura** che hai collegato da altri wallet (Keplr / MetaMask / Phantom). Le voci di sola lettura sono etichettate con il wallet che le ha create; se provi a inviare da una di esse, ti viene spiegato che devi inviare dal wallet che l'ha creata.

## Prossimi passi

- [Security & Recovery](/qorex/security-and-recovery) — i firmatari collegati e i limiti di spesa si basano su questo abbinamento.
- [dApp Browser](/qorex/dapp-browser) — connettiti alle app dall'interno di QoreX.
