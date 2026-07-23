---
slug: /qorex/getting-started
title: Guida introduttiva a QoreX
sidebar_label: Guida introduttiva
sidebar_position: 2
---

# Guida introduttiva a QoreX

Questa pagina illustra come installare l'app mobile e come creare, ripristinare o collegare il tuo wallet.

## Prima di iniziare: proteggi il tuo dispositivo

Un wallet QoreX può essere creato o importato solo quando il tuo dispositivo ha configurato un **fattore di sblocco forte**. È questo che protegge le tue chiavi nella cassaforte hardware. È valido uno qualsiasi dei seguenti:

- **iOS** — Face ID o Touch ID.
- **Android** — un biometrico Class-3 (impronta digitale, iride o sblocco facciale 3D) **oppure** un blocco schermo del dispositivo (PIN, pattern o password).

:::note Sblocco facciale 2D di Android
Lo sblocco facciale 2D basato su fotocamera (presente su alcuni dispositivi, ad esempio certi modelli Samsung) è considerato un biometrico *debole*. Se è tutto ciò di cui disponi, QoreX si affida al **PIN / pattern** che vi sta dietro — e la scheda di sistema lo propone automaticamente, quindi sei comunque coperto.
:::

Se non è configurato alcun fattore forte, i pulsanti di creazione/importazione restano disabilitati e la schermata spiega cosa attivare. Configura Face ID, un'impronta digitale o un blocco schermo nelle impostazioni di sistema, poi torna a QoreX.

## Primo avvio

L'app si apre sulla schermata di onboarding **solo quando sul dispositivo non esiste alcun wallet**. Una volta che hai un wallet, ogni avvio successivo va direttamente alla scheda Home (Wallet). Per visualizzare i saldi non serve alcun dato biometrico; **per firmare una transazione serve sempre**.

Hai tre modi per configurarlo:

### 1. Crea un nuovo wallet

1. Tocca **Create a new wallet**.
2. QoreX genera una **frase di recupero di 24 parole** sul tuo dispositivo (entropia a 256 bit) e deriva la tua identità QoreChain — coin type 118, un indirizzo `qor1…` (i tuoi account ETH e SOL provengono dallo stesso seed).
3. **Trascrivi le 24 parole** e conservale offline. Questa frase è l'**unico** modo per recuperare il tuo wallet se perdi il dispositivo.
4. Conferma la frase; QoreX la sigilla nella cassaforte protetta da hardware e con gate biometrico.

:::caution La tua frase di recupero è tutto
Chiunque abbia le tue 24 parole controlla i tuoi fondi, e nessuno — inclusa la QoreChain Association — può recuperarli per te. Non digitare mai la tua frase in un sito web, non condividerla e non conservarla in uno screenshot o in una nota sul cloud.
:::

### 2. Ripristina un wallet esistente

1. Tocca **Restore existing wallet**.
2. Digita le tue 24 parole in ordine.
3. QoreX ri-deriva gli stessi indirizzi — il tuo wallet appare identico su qualsiasi dispositivo.

### 3. Collega da un altro dispositivo

Se hai già QoreX su un altro telefono o tablet, puoi trasferire il wallet **senza server e senza digitare** — vedi [Collega un nuovo dispositivo](/qorex/security-and-recovery#link-device). Scegli **Link from another device** sul nuovo dispositivo per iniziare.

## Facoltativo: rivendica un @handle

Dopo aver creato il tuo wallet puoi rivendicare un **@handle** univoco (ad esempio `@liviu`) affinché le persone possano inviarti fondi tramite nome anziché tramite un indirizzo `qor1…`. Questo è facoltativo e saltabile — il tuo wallet non dipende mai da esso. Vedi [Account e Dashboard](/qorex/account-and-dashboard#handle).

## Passaggi successivi

- [Invia e ricevi](/qorex/send-and-receive) — effettua il tuo primo trasferimento quantum-safe.
- [Sicurezza e recupero](/qorex/security-and-recovery) — configura il recupero sociale per non restare mai bloccato fuori.
- [Portafoglio e staking](/qorex/portfolio-and-staking) — monitora gli asset e guadagna ricompense di staking.
