---
slug: /dashboard/bridge
title: Bridge
sidebar_label: Bridge
sidebar_position: 5
---

# Bridge

Il **Bridge** ti consente di spostare asset tra QoreChain e altre chain da un'unica schermata. Ogni operazione di bridge è protetta dalla crittografia post-quantistica. Per il design alla base dei trasferimenti cross-chain, consulta [Bridge Architecture](/architecture/bridge-architecture).

:::caution Stato qualificato
Il bridge cross-chain è attualmente in testnet e viene distribuito in modo progressivo — non è ancora un sistema mainnet di produzione. Considera le rotte disponibili come lavori in corso anziché come connettività garantita e operativa, e inizia sulla testnet.
:::

Connetti il tuo wallet per usare il Bridge — consulta [Panoramica e Guida introduttiva](/dashboard/overview#connect-your-wallet).

## Come effettuare il bridge di un asset

1. Scegli la chain e il token di **origine** nel selettore superiore. Il selettore mostra il token, la sua rete e il tuo saldo.
2. Scegli la chain e il token di **destinazione** nel selettore inferiore.
3. Inserisci l'importo da trasferire. L'importo che riceverai viene mostrato per il lato di destinazione.
4. Per inviare gli asset a un indirizzo diverso dal tuo, attiva **Send to another** e inserisci il destinatario.
5. Esamina la **fee** e il **tempo stimato** di regolamento mostrati in fondo.
6. Conferma il trasferimento nel tuo wallet.

Un controllo di scambio tra i due selettori ti permette di invertire origine e destinazione con un solo tocco.

## Suggerimenti

- Conferma entrambe le chain e l'indirizzo di destinazione prima di inviare — i trasferimenti cross-chain non possono essere annullati.
- Il tempo di regolamento varia in base alla rotta; la stima si aggiorna man mano che cambi chain e importi.
- Per approfondire come i trasferimenti vengono validati tra le chain, consulta [Bridging Assets](/user-guide/bridging-assets) e [Bridge Architecture](/architecture/bridge-architecture).
