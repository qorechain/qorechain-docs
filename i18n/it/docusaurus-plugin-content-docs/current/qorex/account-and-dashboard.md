---
slug: /qorex/account-and-dashboard
title: Account e Dashboard
sidebar_label: Account e Dashboard
sidebar_position: 6
---

# Account e Dashboard

QoreX funziona **completamente senza un account** — le tue chiavi non dipendono mai da uno. L'accesso aggiunge comodità come le richieste di pagamento e l'associazione con la Dashboard, ed è **necessario per rivendicare un @handle**. L'accesso avviene tramite email, oppure tramite Apple o Google — vedi sotto.

## Accesso {#sign-in}

Puoi accedere da **Sign in** nella tab Home, oppure durante l'onboarding. Metodi disponibili:

- **Codice via email** — inserisci la tua email e ricevi un codice monouso. Dopo questo accesso, QoreX propone di aggiungere una **passkey** per accessi futuri istantanei (Face ID / Touch ID / PIN). Si tratta di una passkey *dell'account* — non tocca mai le chiavi del tuo wallet.
- **Passkey** — se ne hai registrata una in precedenza.
- **Sign in with Apple** *(solo iOS)* — Apple condivide solo il tuo nome e la tua email, e ti consente di nascondere il tuo indirizzo reale dietro uno di private relay.
- **Continue with Google** — un singolo passaggio nativo tramite la schermata di autenticazione di sistema (l'app non esce mai verso un browser).
- **Continue with QORECHAIN Dashboard** — accedi con un account Dashboard esistente (incluso il suo login Google) e importa il tuo profilo.

:::note
La proposta della passkey compare solo dopo l'accesso con **codice via email**. Quando accedi con un identity provider (Apple, Google o Dashboard), è quel provider a gestire la propria autenticazione, quindi non è possibile associare una passkey a quegli account.
:::

## Più account da una sola frase {#accounts}

Impostazioni → **Your accounts** ti permette di creare e passare da uno all'altro fino a **20 account** per wallet, tutti derivati dalla stessa frase di recupero di 24 parole (non c'è nient'altro da salvare come backup). Ogni account ha il proprio indirizzo `qor1…` con il proprio saldo, il proprio @handle opzionale (un handle è legato a un **indirizzo**, non al wallet) e — dopo il suo primo invio — la propria chiave post-quantistica. Tocca un account per renderlo quello in uso. L'account attivo è quello usato da Send, Receive, Staking e dal browser dApp — cambiare account sposta tutto insieme a esso, e l'app mostra su quale account ti trovi ogni volta che ne esiste più di uno. Gli account sono numerati *Account 1, 2, …*; non possono essere rinominati. L'estensione per browser ha la stessa schermata — vedi [Più account da una sola frase](/qorex/browser-extension#wallet).

- **Add an account** aggiunge l'account successivo sulla stessa frase. Un nuovo account registra la propria chiave quantum-safe al primo invio, cosa che comporta una piccola commissione di rete una tantum.
- **Add an Ethereum account (coin 60)** serve per una frase di recupero usata per la prima volta in MetaMask o sulla Dashboard di QoreChain — è lì che si trovano i suoi fondi. Usa il percorso Ethereum `m/44'/60'` ed è etichettato *Ethereum · coin 60*; il suo indirizzo `0x…` è lo stesso su ogni rete EVM ed è la stessa chiave di quell'account QoreChain. Vedi [Ripristinare una frase da MetaMask o dalla Dashboard](/qorex/getting-started#restore-dashboard).
- **Ripristinare** una frase su un nuovo dispositivo riporta solo **Account 1**; usa **Add an account** (e **Add an Ethereum account (coin 60)**) per riportare gli altri. La schermata Addresses (**Settings → Your addresses**) è separata: elenca ogni account di questo wallet più gli indirizzi di sola lettura collegati da altri wallet.

## @handle {#handle}

Rivendica un nome univoco (ad esempio `@liviu`) associato al tuo indirizzo tramite **doppia firma** (una firma ed25519 del registro + la tua firma secp256k1). Chiunque può quindi inviarti fondi al tuo @handle. La risoluzione avviene con logica **verify-then-pin** (trust-on-first-use): se la chiave di un handle viene mai modificata silenziosamente, QoreX lo segnala.

Poiché un handle è legato a un indirizzo e non al tuo wallet, rivendicarne uno è un'operazione **per singolo indirizzo** — se hai [più account](#accounts), ciascuno può avere il proprio @handle, e rivendicarne uno per un account non assegna automaticamente un nome agli altri. Per rivendicarlo serve un account con accesso effettuato e avviene **nell'app mobile**. Nell'estensione per browser puoi pagare un handle (le ricerche funzionano dall'estensione 0.3.7 in poi) ma non rivendicarne uno — l'estensione ti indirizza all'app. Gli account in stile Ethereum (coin 60) non hanno un handle. I nomi QoreChain che imitano quelli ufficiali sono riservati: un nuovo handle che imita il progetto (i suoi nomi di marchio, o parole di fiducia come *official*, *support*, *airdrop* o *treasury*, comprese le grafie simili) viene rifiutato. I titolari esistenti possono comunque eliminare il proprio handle.

Se il registro degli handle è temporaneamente irraggiungibile, la schermata passa alla modalità **"Handles coming soon"** e tutto il resto continua a funzionare; gli handle tornano automaticamente attivi quando il registro torna disponibile.

:::note Rivendicare un handle rispetto a collegarsi alla Dashboard
Si tratta di due azioni separate e indipendenti. Rivendicare un @handle permette **ad altre persone di inviarti fondi usando il tuo nome** — non fa nient'altro oltre a questo. Collegarsi alla Dashboard (di seguito) connette il tuo wallet a un account Dashboard in modo che i due mostrino gli stessi dati. Puoi fare l'una senza l'altra.
:::

## Account collegato {#linked-account}

**Impostazioni → Linked account** collega il tuo wallet QoreX e il tuo account Dashboard in entrambe le direzioni:

1. Inserisci il codice di 8 caratteri mostrato dalla Dashboard, **oppure** genera un codice in QoreX (valido 10 minuti) e digitalo nella Dashboard.
2. Se hai [più account](#accounts), la finestra di approvazione di QoreX stessa ti permette di scegliere **quale** collegare — non presume che sia quello attualmente attivo.
3. Una volta collegati, il tuo @handle e gli indirizzi connessi compaiono su entrambi.
4. Puoi scollegare in qualsiasi momento.

Accedere *tramite* **Continue with Dashboard** collega implicitamente i due — non c'è nient'altro da fare.

## Integrazione con la Dashboard {#dashboard}

Con la Dashboard collegata:

- **Connect with QoreX** sulla Dashboard la associa al tuo wallet tramite un deep link `qorex://connect` più una prova di proprietà firmata.
- **I trasferimenti avviati dalla Dashboard** arrivano su QoreX come richieste `qorex://tx`. Vengono decodificati, mostrati per intero e firmati **solo nell'app** dopo approvazione biometrica — e solo dall'indirizzo derivato dell'app stessa. Poiché un indirizzo `qor1…` è ugualmente valido su mainnet e testnet, ogni richiesta avviata dalla Dashboard indica quale rete sta prendendo di mira, e QoreX rifiuta di eseguirla se questa non corrisponde alla rete a cui sei attualmente connesso — non cambia mai rete per conto proprio in base a una richiesta.
- Se arriva una richiesta di Connect o di trasferimento mentre **non hai effettuato l'accesso**, QoreX propone un passaggio inline **"Sign in to Dashboard"** così puoi continuare senza trovarti in un vicolo cieco.
- **Your addresses (Settings)** — elenca ogni account derivato da questo wallet, oltre agli indirizzi **di sola lettura** che hai collegato da altri wallet (Keplr / MetaMask / Phantom). Le voci di sola lettura sono etichettate con il wallet che le ha create; se provi a inviare da una di esse, ti viene spiegato che devi inviare dal wallet che l'ha creata.

## Eliminare il tuo account {#delete-account}

Impostazioni → **Delete account** (la voce rossa in fondo). Dopo una conferma e uno sblocco biometrico, QoreX cancella definitivamente: il wallet e le chiavi private di questo dispositivo; il tuo @handle nel registro di QoreX (se presente); il tuo account Dashboard di QoreChain (se hai effettuato l'accesso); e la tua configurazione di recupero sociale (se impostata). L'operazione non può essere annullata. Poiché QoreX è non-custodial, **se non hai fatto il backup della tua frase di recupero perderai l'accesso a qualsiasi fondo** — fai prima il backup. Le rimozioni lato server sono eseguite con il massimo impegno possibile; la cancellazione sul dispositivo si completa sempre e riporta l'app alla schermata del primo avvio.

## Prossimi passi

- [Security & Recovery](/qorex/security-and-recovery) — backup, recupero e finestra di accesso EVM.
- [dApp Browser](/qorex/dapp-browser) — connettiti alle app dall'interno di QoreX.
