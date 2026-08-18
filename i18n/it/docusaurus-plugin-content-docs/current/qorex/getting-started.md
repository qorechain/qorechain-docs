---
slug: /qorex/getting-started
title: Iniziare con QoreX
sidebar_label: Iniziare
sidebar_position: 2
---

# Iniziare con QoreX

Questa pagina illustra l'installazione dell'**app mobile** e la creazione, il ripristino o il collegamento del tuo wallet. Per il wallet desktop, consulta l'[Estensione per browser](/qorex/browser-extension), disponibile su Chrome, Firefox e Safari.

:::note Disponibilità su mobile
- **Android** — disponibile su Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — disponibile per il test tramite **TestFlight** se desideri provarla; la pubblicazione su App Store è ancora in revisione. Trovi il link di invito aggiornato su [qorechain.io](https://qorechain.io).
:::

## Prima di iniziare: metti in sicurezza il tuo dispositivo

Un wallet QoreX può essere creato o importato solo quando il tuo dispositivo dispone di un **fattore di sblocco forte** configurato. È questo a proteggere le tue chiavi nella cassaforte hardware. È sufficiente uno qualsiasi dei seguenti:

- **iOS** — Face ID o Touch ID.
- **Android** — un dato biometrico di Classe 3 (impronta digitale, iride o sblocco con volto 3D) **oppure** un blocco schermo del dispositivo (PIN, sequenza o password).

:::note Sblocco con volto 2D su Android
Lo sblocco con volto 2D basato sulla fotocamera (presente su alcuni dispositivi, ad esempio certi modelli Samsung) è considerato un dato biometrico *debole*. Se è l'unico di cui disponi, QoreX si affida al **PIN / sequenza** che lo protegge — e il pannello di sistema lo propone automaticamente, quindi sei comunque coperto.
:::

Se non è registrato alcun fattore forte, i pulsanti di creazione/importazione restano disattivati e la schermata spiega cosa attivare. Configura Face ID, un'impronta digitale o un blocco schermo nelle impostazioni di sistema, quindi torna in QoreX.

## Primo avvio

L'app si apre sulla schermata di onboarding **solo quando sul dispositivo non esiste alcun wallet**. Una volta che hai un wallet, ogni avvio successivo porta direttamente alla scheda Home (Wallet). Per visualizzare i saldi non serve alcun dato biometrico; **per firmare una transazione serve sempre**.

Hai tre modi per iniziare:

### 1. Crea un nuovo wallet

1. Tocca **Crea un nuovo wallet**.
2. QoreX genera una **frase di recupero di 24 parole** sul tuo dispositivo (entropia a 256 bit) e deriva la tua identità QoreChain — coin type 118, un indirizzo `qor1…` (i tuoi account ETH e SOL derivano dallo stesso seed).
3. **Annota le 24 parole** e conservale offline. Questa frase è l'**unico** modo per recuperare il tuo wallet se perdi il dispositivo.
4. Conferma la frase; QoreX la sigilla nella cassaforte protetta dall'hardware e presidiata dalla biometria.

:::caution La tua frase di recupero è tutto
Chiunque possieda le tue 24 parole controlla i tuoi fondi, e nessuno — inclusa QoreChain Association — può recuperarli per te. Non digitare mai la tua frase in un sito web, non condividerla e non conservarla in uno screenshot o in una nota sul cloud.
:::

### 2. Ripristina un wallet esistente

1. Tocca **Ripristina un wallet esistente**.
2. Digita le tue 24 parole nell'ordine corretto.
3. QoreX deriva nuovamente gli stessi indirizzi — il tuo wallet appare identico su qualsiasi dispositivo.

### 3. Collega da un altro dispositivo

Se hai già QoreX su un altro telefono o tablet, puoi trasferire il wallet **senza alcun server e senza digitare nulla** — vedi [Collegare un nuovo dispositivo](/qorex/security-and-recovery#link-device). Scegli **Collega da un altro dispositivo** sul nuovo dispositivo per iniziare.

## Facoltativo: richiedi un @handle

Dopo aver creato il tuo wallet puoi richiedere un **@handle** univoco (ad esempio `@liviu`) così che le persone possano inviarti fondi tramite un nome invece che tramite un indirizzo `qor1…`. È facoltativo e si può saltare — il tuo wallet non ne dipende mai. Vedi [Account e Dashboard](/qorex/account-and-dashboard#handle).

## Passi successivi

- [Invia e ricevi](/qorex/send-and-receive) — effettua il tuo primo trasferimento a prova di quantistica.
- [Sicurezza e recupero](/qorex/security-and-recovery) — configura il recupero sociale per non restare mai escluso.
- [Portafoglio e staking](/qorex/portfolio-and-staking) — monitora gli asset e ottieni ricompense di staking.
