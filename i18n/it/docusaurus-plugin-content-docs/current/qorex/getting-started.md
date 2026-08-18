---
slug: /qorex/getting-started
title: Introduzione a QoreX
sidebar_label: Introduzione
sidebar_position: 2
---

# Introduzione a QoreX

Questa pagina illustra l'installazione dell'**app mobile** e la creazione, il ripristino o il collegamento del tuo wallet. Per il wallet desktop, consulta l'[Estensione per browser](/qorex/browser-extension), disponibile su Chrome, Firefox e Safari.

:::note Disponibilità mobile
L'app mobile QoreX è attualmente in fase di test pubblico:

- **Android** — disponibile per il **test pubblico** su Google Play.
- **iOS** — disponibile per il test tramite **TestFlight** se desideri provarla.

Trova i link aggiornati su [qorechain.io](https://qorechain.io).
:::

## Prima di iniziare: proteggi il tuo dispositivo

Un wallet QoreX può essere creato o importato solo quando il tuo dispositivo dispone di un **forte fattore di sblocco** configurato. È questo a proteggere le tue chiavi nel vault hardware. Qualsiasi delle seguenti opzioni è valida:

- **iOS** — Face ID o Touch ID.
- **Android** — un dato biometrico di Classe 3 (impronta digitale, iride o sblocco facciale 3D) **oppure** un blocco schermo del dispositivo (PIN, sequenza o password).

:::note Sblocco facciale 2D su Android
Lo sblocco facciale 2D basato su fotocamera (presente su alcuni dispositivi, ad esempio certi modelli Samsung) è considerato un dato biometrico *debole*. Se è tutto ciò di cui disponi, QoreX si affida al **PIN / sequenza** che vi sta dietro — e il pannello di sistema lo propone automaticamente, quindi sei comunque protetto.
:::

Se nessun fattore forte è registrato, i pulsanti di creazione/importazione restano disabilitati e la schermata spiega cosa attivare. Configura Face ID, un'impronta digitale o un blocco schermo nelle impostazioni di sistema, quindi torna a QoreX.

## Primo avvio

L'app si apre sulla schermata di onboarding **solo quando non esiste alcun wallet sul dispositivo**. Una volta che hai un wallet, ogni avvio successivo va direttamente alla scheda Home (Wallet). La visualizzazione dei saldi non richiede alcun dato biometrico; **la firma di una transazione lo richiede sempre**.

Hai tre modi per configurare:

### 1. Crea un nuovo wallet

1. Tocca **Crea un nuovo wallet**.
2. QoreX genera una **frase di recupero di 24 parole** sul tuo dispositivo (entropia a 256 bit) e deriva la tua identità QoreChain — coin type 118, un indirizzo `qor1…` (i tuoi account ETH e SOL provengono dallo stesso seed).
3. **Annota le 24 parole** e conservale offline. Questa frase è l'**unico** modo per recuperare il tuo wallet se perdi il dispositivo.
4. Conferma la frase; QoreX la sigilla nel vault protetto dall'hardware e vincolato al dato biometrico.

:::caution La tua frase di recupero è tutto
Chiunque abbia le tue 24 parole controlla i tuoi fondi, e nessuno — inclusa la QoreChain Association — può recuperarli per te. Non digitare mai la tua frase in un sito web, non condividerla e non conservarla in uno screenshot o in una nota sul cloud.
:::

### 2. Ripristina un wallet esistente

1. Tocca **Ripristina wallet esistente**.
2. Digita le tue 24 parole in ordine.
3. QoreX ri-deriva gli stessi indirizzi — il tuo wallet appare identico su qualsiasi dispositivo.

### 3. Collega da un altro dispositivo

Se hai già QoreX su un altro telefono o tablet, puoi spostare il wallet **senza server e senza digitazione** — consulta [Collega un nuovo dispositivo](/qorex/security-and-recovery#link-device). Scegli **Collega da un altro dispositivo** sul nuovo dispositivo per iniziare.

## Facoltativo: richiedi un @handle

Dopo la creazione del tuo wallet puoi richiedere un **@handle** univoco (per esempio `@liviu`) affinché le persone possano inviarti fondi per nome anziché tramite un indirizzo `qor1…`. Questo è facoltativo e ignorabile — il tuo wallet non dipende mai da esso. Consulta [Account e Dashboard](/qorex/account-and-dashboard#handle).

## Prossimi passi

- [Invia e Ricevi](/qorex/send-and-receive) — effettua il tuo primo trasferimento a prova di quantum.
- [Sicurezza e Recupero](/qorex/security-and-recovery) — configura il recupero sociale per non restare mai bloccato fuori.
- [Portafoglio e Staking](/qorex/portfolio-and-staking) — monitora gli asset e ottieni ricompense di staking.
