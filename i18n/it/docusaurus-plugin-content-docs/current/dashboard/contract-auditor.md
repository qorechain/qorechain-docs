---
slug: /dashboard/contract-auditor
title: Contract Auditor
sidebar_label: Contract Auditor
sidebar_position: 7
---

# Contract Auditor

Il **Contract Auditor** (barra laterale **Build**, voce **AI Audit**) esegue una revisione di sicurezza del codice sorgente di un contratto incollato con **QCAIA**, l'assistente IA di QoreChain, e restituisce un punteggio, un livello di rischio e dei risultati con correzioni consigliate. È pensato per gli sviluppatori che vogliono un secondo sguardo rapido su un contratto prima di testarlo e distribuirlo. Non è un audit formale e non sostituisce la revisione umana.

## Innovazioni {#innovations}

- **Rilevamento automatico della blockchain.** "Auto-detect from code" è l'impostazione predefinita; in alternativa puoi scegliere uno dei 17 ecosistemi.
- **Una percentuale separata di prontezza post-quantistica** accanto al Security Score da 0 a 100, riportata a parte così da non essere inglobata nel punteggio di sicurezza.
- **Un audit gratuito ogni giorno UTC.** Il primo audit di ogni giorno UTC è gratuito. Dopo di esso, sulla testnet ogni audit si paga in QOR di test dopo una finestra "Confirm Security Audit" che mostra l'"Audit Cost"; sulla mainnet, gli audit successivi attendono il giorno UTC seguente.
- **Report privati per impostazione predefinita.** Il proprietario cambia la visibilità; un report pubblico non mostra mai il nome o l'IP del proprietario.
- **Risultati con correzioni, non solo etichette.** Ogni risultato ha una gravità, una posizione, una descrizione e una correzione consigliata, e il report completo aggiunge raccomandazioni, ottimizzazioni del gas, best practice e aspetti positivi.

## Come si usa {#how-to-use}

### Eseguire un audit

1. Accedi (obbligatorio) e apri **AI Audit**.
2. Compila **Blockchain** (predefinito "Auto-detect from code"), **Name (Optional)** e **Contract Source Code**.
3. Seleziona **Run Security Audit**, poi conferma la finestra "Confirm Security Audit".
4. Il **Security Report** compare nella stessa pagina. **Export PDF** lo salva.

**Esempio minimo:** incolla un ERC-20, lascia il rilevamento automatico, **Run Security Audit**, Confirm, **Export PDF**.

### Leggere il report

Il report mostrato nella pagina riporta:

- **Risk Level**, codificato a colori;
- **Security Score** da 0 a 100 e la percentuale di prontezza post-quantistica;
- un **Executive Summary**;
- **Vulnerabilities Found (N Issues)**, con le gravità Critical, High, Medium, Low e Info. Un esito pulito riporta "No vulnerabilities detected".

Ogni risultato elenca gravità, titolo, la posizione nel codice, una descrizione e una correzione consigliata.

La pagina del report completo `/audits/<id>` aggiunge la suddivisione per gravità, **Recommendations**, **Gas optimizations**, **Best practices**, **Positive aspects** e, per il proprietario, l'interruttore di visibilità.

### Audit precedenti e condivisione

- I tuoi report si trovano in **Profile > Audited**.
- L'elenco **All Security Audits** su `/audits` (collegato dalla home page) mostra gli ultimi audit di tutti gli utenti in una tabella con nome del contratto, blockchain, livello di rischio, punteggio e data. Una casella di ricerca filtra per nome, blockchain o livello di rischio. Una riga si apre solo se il report è pubblico o tuo.
- Su un report di tua proprietà, un interruttore in alto riporta "This report is private". Attivalo per rendere il report pubblico così che chiunque abbia il link possa leggerlo (il tuo nome e il tuo IP non vengono mai mostrati), e disattivalo per renderlo di nuovo privato.

:::tip Esegui l'audit prima del deploy
Esegui un audit come ultimo passaggio prima del deploy e ripetilo dopo ogni modifica. Considera i risultati come una guida da verificare, non come una garanzia, e combina il report con i tuoi test sulla [testnet](/getting-started/connecting-to-testnet).
:::

## Come accedere {#how-to-access}

- **URL:** [dashboard.qorechain.io/audit](https://dashboard.qorechain.io/audit), oppure **New Audit** nella home page.
- **Account:** per eseguire un audit è necessario accedere. L'elenco `/audits` e i report pubblici su `/audits/<id>` si aprono senza account.
- **Reti:** funziona su entrambe. La regola dell'audit gratuito giornaliero è la stessa; gli audit extra a pagamento esistono solo sulla testnet.
- **Costo:** il primo audit di ogni giorno UTC è gratuito; gli extra sulla testnet costano QOR di test; gli extra sulla mainnet attendono il giorno successivo.

## Dove è pubblicato {#where-published}

| Superficie | Indirizzo | Account |
| --- | --- | --- |
| Eseguire un audit | `dashboard.qorechain.io/audit` | Accesso obbligatorio |
| All Security Audits | `dashboard.qorechain.io/audits` | Nessuno |
| Un report | `dashboard.qorechain.io/audits/<id>` | Nessuno se pubblico; altrimenti il proprietario |

## Limiti e problemi noti {#limits}

- Esamina solo il sorgente che incolli, senza analisi di compilazione, test o runtime. I risultati possono essere incompleti o errati.
- Un report privato non può essere aperto da nessuno tranne il suo proprietario, nemmeno con il link.

## Correlati

- [Smart Contract Creator](/dashboard/smart-contract-creator) - genera contratti con QCAIA.
- [Post-Quantum Security](/architecture/post-quantum-security) - come QoreChain protegge account e firme.
