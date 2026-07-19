---
slug: /qorex/getting-started
title: Iniziare con QoreX
sidebar_label: Iniziare
sidebar_position: 2
---

# Iniziare con QoreX

Questa pagina illustra come installare l'app mobile e creare, ripristinare o collegare il tuo wallet.

## Prima di iniziare: proteggi il tuo dispositivo

Un wallet QoreX può essere creato o importato solo quando il tuo dispositivo ha la **protezione biometrica** abilitata — Face ID / Touch ID su iOS, oppure un'impronta digitale / un fattore forte equivalente su Android. È questo che protegge le tue chiavi nel vault hardware.

Se non è abilitata alcuna biometria, i pulsanti di creazione/importazione restano disabilitati e la schermata spiega cosa attivare. Abilita Face ID o un'impronta digitale nelle impostazioni di sistema, quindi torna a QoreX.

## Primo avvio

L'app si apre sulla schermata di onboarding **solo quando non esiste alcun wallet sul dispositivo**. Una volta che possiedi un wallet, ogni avvio successivo va direttamente alla scheda Home (Wallet). Visualizzare i saldi non richiede alcuna biometria; **firmare una transazione la richiede sempre**.

Hai tre modi per configurarlo:

### 1. Crea un nuovo wallet

1. Tocca **Create a new wallet**.
2. QoreX genera una **frase di recupero di 24 parole** sul tuo dispositivo (entropia a 256 bit) e deriva la tua identità QoreChain — coin type 118, un indirizzo `qor1…` (i tuoi account ETH e SOL provengono dallo stesso seed).
3. **Scrivi le 24 parole** e conservale offline. Questa frase è l'**unico** modo per recuperare il tuo wallet se perdi il dispositivo.
4. Conferma la frase; QoreX la sigilla nel vault protetto da hardware e con accesso biometrico.

:::caution La tua frase di recupero è tutto
Chiunque abbia le tue 24 parole controlla i tuoi fondi, e nessuno — inclusa QoreChain Association — può recuperarli per te. Non digitare mai la tua frase in un sito web, non condividerla e non conservarla in uno screenshot o in una nota sul cloud.
:::

### 2. Ripristina un wallet esistente

1. Tocca **Restore existing wallet**.
2. Digita le tue 24 parole nell'ordine corretto.
3. QoreX ri-deriva gli stessi indirizzi — il tuo wallet appare identico su qualsiasi dispositivo.

### 3. Collega da un altro dispositivo

Se hai già QoreX su un altro telefono o tablet, puoi trasferire il wallet **senza server e senza digitazione** — vedi [Collega un nuovo dispositivo](/qorex/security-and-recovery#link-device). Scegli **Link from another device** sul nuovo dispositivo per iniziare.

## Opzionale: rivendica un @handle

Dopo che il tuo wallet è stato creato, puoi rivendicare un **@handle** univoco (ad esempio `@liviu`) affinché le persone possano inviarti fondi per nome invece che a un indirizzo `qor1…`. Questo è opzionale e ignorabile — il tuo wallet non ne dipende mai. Vedi [Account e Dashboard](/qorex/account-and-dashboard#handle).

## Passaggi successivi

- [Invia e Ricevi](/qorex/send-and-receive) — effettua il tuo primo trasferimento quantum-safe.
- [Sicurezza e Recupero](/qorex/security-and-recovery) — configura il recupero sociale per non rimanere mai bloccato fuori.
- [Portafoglio e Staking](/qorex/portfolio-and-staking) — monitora gli asset e guadagna ricompense di staking.
