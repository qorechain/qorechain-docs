---
slug: /qorex/getting-started
title: Guida introduttiva a QoreX
sidebar_label: Guida introduttiva
sidebar_position: 2
---

# Guida introduttiva a QoreX

Questa pagina illustra l'installazione dell'**app mobile** e la creazione, il ripristino o il collegamento del tuo wallet. Per il wallet desktop, consulta [Estensione del browser](/qorex/browser-extension), disponibile su Chrome, Firefox e Safari.

:::note Disponibilità mobile
- **Android** — disponibile in produzione su Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — disponibile sull'App Store: https://apps.apple.com/us/app/qorex-wallet/id6791256626
:::

## Prima di iniziare: proteggi il tuo dispositivo

Un wallet QoreX può essere creato o importato solo quando il dispositivo ha configurato un **fattore di sblocco forte**. Questo è ciò che protegge le tue chiavi nel vault hardware. È valido uno qualsiasi dei seguenti:

- **iOS** — Face ID o Touch ID.
- **Android** — un dato biometrico di Classe 3 (impronta digitale, iride o sblocco facciale 3D) **oppure** un blocco schermo del dispositivo (PIN, sequenza o password).

:::note Sblocco facciale 2D su Android
Lo sblocco facciale 2D basato su fotocamera (presente su alcuni dispositivi, ad esempio certi modelli Samsung) è considerato un dato biometrico *debole*. Se è l'unico disponibile, QoreX si affida al **PIN / sequenza** sottostante — e il pannello di sistema lo propone automaticamente, quindi resti comunque coperto.
:::

Se non è registrato alcun fattore forte, i pulsanti di creazione/importazione restano disattivati e la schermata spiega cosa attivare. Configura Face ID, un'impronta digitale o un blocco schermo nelle impostazioni di sistema, quindi torna a QoreX.

## Primo avvio

L'app si apre sulla schermata di onboarding **solo quando sul dispositivo non esiste alcun wallet**. Una volta creato un wallet, ogni avvio successivo va direttamente alla scheda Home (Wallet). La visualizzazione dei saldi non richiede alcun dato biometrico; **firmare una transazione lo richiede sempre**.

Hai tre modi per configurare il wallet:

### 1. Crea un nuovo wallet

1. Tocca **Crea un nuovo wallet**.
2. QoreX genera una **frase di recupero di 24 parole** sul tuo dispositivo (entropia a 256 bit) e deriva la tua identità QoreChain — coin type 118, un indirizzo `qor1…` (i tuoi account ETH e SOL derivano dallo stesso seed).
3. **Scrivi le 24 parole** e conservale offline. Questa frase è l'**unico** modo per recuperare il tuo wallet se perdi il dispositivo.
4. Conferma la frase; QoreX la sigilla nel vault protetto dall'hardware e vincolato ai dati biometrici.

:::caution La tua frase di recupero è tutto
Chiunque possieda le tue 24 parole controlla i tuoi fondi, e nessuno — inclusa QoreChain Association — può recuperarli per te. Non digitare mai la tua frase su un sito web, non condividerla e non conservarla in uno screenshot o in una nota su cloud. **Disinstallare QoreX elimina le chiavi memorizzate su quel dispositivo** — senza la tua frase scritta (o il [recupero sociale](/qorex/security-and-recovery#social-recovery) configurato in anticipo), una disinstallazione significa perdita permanente dell'accesso. Esegui il backup prima di finanziare il wallet, non dopo.
:::

### 2. Ripristina un wallet esistente

1. Tocca **Ripristina wallet esistente**.
2. Digita le tue 24 parole in ordine.
3. QoreX ri-deriva gli stessi indirizzi — il tuo wallet appare identico su qualsiasi dispositivo.

### 3. Collega da un altro dispositivo

Se hai già QoreX su un altro telefono o tablet, puoi trasferire il wallet **senza server e senza digitare nulla** — vedi [Collega un nuovo dispositivo](/qorex/security-and-recovery#link-device). Scegli **Collega da un altro dispositivo** sul nuovo dispositivo per iniziare.

## Facoltativo: rivendica un @handle

Dopo la creazione del wallet puoi rivendicare un **@handle** univoco (ad esempio `@liviu`) in modo che le persone possano inviarti fondi usando il tuo nome invece di un indirizzo `qor1…`. Questo è facoltativo e può essere saltato — il tuo wallet non dipende mai da esso. Un handle è associato a un indirizzo specifico piuttosto che al wallet nel suo insieme, il che diventa rilevante quando hai più di un account — vedi [Più account da una sola frase](/qorex/account-and-dashboard#accounts) e [@handle](/qorex/account-and-dashboard#handle).

## Lingua

QoreX è disponibile in dieci lingue — inglese, rumeno, tedesco, spagnolo, francese, italiano, turco, arabo, giapponese e coreano — e segue automaticamente la lingua del telefono, ripiegando sull'inglese per tutto il resto. Puoi sostituire la lingua rilevata in qualsiasi momento da **Impostazioni → Lingua**; scegliendo l'arabo l'interfaccia passa anche alla modalità da destra a sinistra.

## Prossimi passi

- [Invia e ricevi](/qorex/send-and-receive) — effettua il tuo primo trasferimento quantum-safe.
- [Sicurezza e recupero](/qorex/security-and-recovery) — configura il recupero sociale per non restare mai bloccato fuori dal wallet.
- [Portfolio e staking](/qorex/portfolio-and-staking) — monitora gli asset e guadagna ricompense di staking.
