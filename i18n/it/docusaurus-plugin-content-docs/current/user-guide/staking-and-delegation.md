---
slug: /user-guide/staking-and-delegation
title: Staking e Delega
sidebar_label: Staking e Delega
sidebar_position: 2
---

# Staking e Delega

Questa guida illustra come delegare token QOR ai validatori, ridelegare tra validatori, effettuare l'unbonding dello stake, riscuotere le ricompense e capire quali parti del design di staking di QoreChain sono attive oggi.

:::note
I comandi seguenti utilizzano la testnet **`qorechain-diana`** (chain ID EVM **9800**). La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) è live dal 7 giugno 2026 ed esegue la release **v3.2.4** (applicata il 23 ottobre 2026); la testnet esegue la v3.2.4 dal 19 ottobre 2026. Sostituisci il chain ID e gli endpoint della mainnet indicati nella pagina **Connessione alla Mainnet** quando esegui lo staking su mainnet.
:::

:::caution Firma con `tx pqc cosign`
Mainnet e testnet richiedono una firma post-quantistica ibrida su ogni transazione della corsia Cosmos, quindi i comandi di questa pagina non vengono trasmessi così come sono scritti. Aggiungi `--generate-only > tx.json` a un comando, poi esegui `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`. Vedi [Firma ibrida](/cli-reference/transaction-commands#hybrid-signing). [QoreX](/qorex/portfolio-and-staking) e la [Dashboard](/dashboard/staking-and-validators) eseguono questa firma per te.
:::

## C'è un periodo di vincolo? {#lock-in-period}

**Per la delega ordinaria**, no — non c'è una durata da scegliere, perché qui lo staking non viene offerto in periodi fissi come spesso accade su un exchange. La delega resta attiva con le ricompense che iniziano a maturare dal blocco successivo, per tutto il tempo che desideri, finché non decidi di annullarla; non c'è nulla che scada e nulla da rinnovare. Il **periodo di unbonding di 21 giorni** citato in tutta questa guida non è un vincolo che accetti in anticipo — inizia soltanto quando *richiedi* l'unbonding, e si applica solo al QOR che stai ritirando. Spostare una delega tra validatori (ridelega) evita del tutto questa attesa, poiché lo stake non lascia mai il pool bonded. Il termine di "fedeltà" della [curva di bonding](#bonding-curve) più avanti fa parte del design di QoreChain ma **non viene applicato oggi dalla chain attiva**, quindi per quanto tempo resti delegato non modifica il tuo tasso di ricompensa. Una forma facoltativa di staking con blocco temporale è disponibile sulla mainnet dalla v3.2.4 (23 ottobre 2026) e sulla testnet dal 19 ottobre 2026; ottieni un blocco solo se ne crei uno. Vedi [Staking con blocco temporale (v3.2.4)](#time-locked-staking).

Questo descrive il comportamento attuale della mainnet, non una garanzia permanente — un periodo minimo di staking è un parametro che la governance potrebbe introdurre in futuro, allo stesso modo in cui qualsiasi altro parametro di staking descritto in questa pagina può cambiare tramite voto. Se ciò dovesse accadere, il wallet mostrerà l'attesa risultante (l'eventuale minimo più i 21 giorni di unbonding) prima di confermare una delega, e questa pagina verrà aggiornata di conseguenza.

---

## Delegare Token

Delega QOR a un validatore per partecipare alla sicurezza della rete. I delegatori ricevono una quota delle ricompense che il validatore guadagna, al netto della commissione del validatore:

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Esempio:** Delega 100 QOR a un validatore:

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

---

## Ridelegare

Sposta la tua delega da un validatore a un altro senza attendere il periodo di unbonding:

```bash
qorechaind tx staking redelegate <source_validator> <destination_validator> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Esempio:**

```bash
qorechaind tx staking redelegate qorvaloper1src... qorvaloper1dst... 50000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

La ridelega non ha **né penalità né un proprio periodo di blocco** — lo stake non lascia mai il pool bonded, non smette mai di generare ricompense e ha effetto immediato. Non è affatto soggetta al periodo di unbonding di 21 giorni; quello si applica solo a `unbond`. Si applica una regola di staking standard: lo stake che hai appena spostato **verso** un validatore non può essere ridelegato di nuovo **da** quel validatore finché il primo spostamento non è giunto a maturazione (21 giorni); nel frattempo puoi comunque eseguire `unbond` su di esso o ridelegare il resto del tuo stake.

:::caution Il vero limite è un conteggio, non un raffreddamento
Un delegatore può avere al massimo **7 voci di ridelega simultanee in corso** per la stessa identica rotta (delegatore, validatore di origine, validatore di destinazione) — ogni voce si estingue autonomamente al suo completamento, liberando uno slot. Si tratta di un limite che un uso normale praticamente non raggiunge mai, non di una regola generale "attendi prima di poter ridelegare di nuovo".
:::

---

## Unbonding

Ritira i token delegati da un validatore. L'unbonding richiede **21 giorni** per essere completato; durante questo periodo i token non generano ricompense e non possono essere trasferiti.

```bash
qorechaind tx staking unbond <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Esempio:**

```bash
qorechaind tx staking unbond qorvaloper1abc...xyz 25000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Al termine del periodo di unbonding di 21 giorni (1.814.400 secondi), i token vengono restituiti automaticamente al tuo account. Un delegatore può avere al massimo 7 voci di unbonding simultanee per validatore.

---

## Riscuotere le Ricompense

Ritira tutte le ricompense di staking accumulate da ogni validatore a cui hai delegato:

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Per ritirare le ricompense da un singolo validatore:

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Le ricompense di staking sono finanziate da due fonti: il budget di emissione limitato del protocollo (vedi [Tokenomics](/architecture/tokenomics#staking-reward-schedule) per l'importo attuale per epoca e per il tetto, entrambi fissati dalla governance — da ultimo con la proposta 10 del 19 ottobre 2026) e la quota destinata agli staker su ogni commissione di transazione (pagata come normale ricompensa di staking dall'aggiornamento v3.2.0; vedi [la quota degli staker bloccata](/architecture/tokenomics#stranded-and-reserve)). Le ricompense dipendono dalla commissione del validatore e dall'attività della rete, e non sono garantite.

---

## Staking con blocco temporale (v3.2.4) {#time-locked-staking}

:::note Quando si applica
La release v3.2.4 aggiunge un modulo facoltativo di staking con blocco temporale, `x/stakingtier`. È attivo sulla **testnet `qorechain-diana`** dal 19 ottobre 2026 e sulla **mainnet** dal 23 ottobre 2026 (applicato all'altezza 3.742.566 dalla proposta di governance 13). Il blocco è disponibile come opzione e la delega ordinaria resta senza blocco (vedi [sopra](#lock-in-period)). Il meccanismo descritto sotto è stato verificato rispetto ai parametri live della mainnet e della testnet il 23 ottobre 2026.
:::

Un delegatore può vincolare una parte di una delega esistente a un validatore per un termine fisso di 3, 6 o 12 mesi. Termini e importi sono parametri della chain; leggi quelli attuali da `GET /qorechain/stakingtier/v1/params` anziché da questa pagina.

* **Il blocco è facoltativo.** La normale delega, ridelega e unbonding funzionano esattamente come descritto in questa pagina. Solo l'importo bloccato è limitato: finché un blocco è aperto non può essere annullato (undelegate) né ridelegato, e questo vale per ogni percorso (transazione, authz, gruppo, contratto, governance).
* **Blocco minimo** di 10 QOR, e al massimo 16 blocchi aperti per delegatore.
* **Lo sblocco anticipato** è consentito: pone fine al blocco, fa perdere quanto della ricompensa del blocco non è stato pagato e brucia una penale prelevata dall'importo bloccato (5% nei parametri attuali, registrata sotto la fonte di burn `staking_tier_penalty`); il resto resta delegato e sbloccato.
* **Lo slashing** si applica a una delega bloccata come a qualsiasi altra; il blocco si riduce insieme alla delega.
* **Riscossione.** Un blocco guadagna una componente di ricompensa aggiuntiva per epoca, stabilita dai parametri del modulo; viene pagata quando la riscuoti, non automaticamente. Questa pagina non riporta tassi: leggi `params` per le impostazioni live.
* **Alla scadenza** il blocco viene rilasciato e la delega prosegue come una delega ordinaria.

I comandi sono disponibili tramite la riga di comando e le route REST `GET /qorechain/stakingtier/v1/params`, `/locks/{holder}` e `/pool`; l'importo è un numero intero di `uqor` (1 QOR = 1.000.000 uqor).

```bash
qorechaind tx stakingtier lock <validator_address> <amount_in_uqor> <months> --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind tx stakingtier unlock-early <lock_id> --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind tx stakingtier claim --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind query stakingtier locks <holder_address>
```

L'ID di chain qui sopra è quello della testnet; usa `qorechain-vladi` sulla mainnet. Come nel resto di questa pagina, firma ogni transazione generata con `tx pqc cosign`.

---

## Classificazione Triple-Pool (stato del design)

Il design di QoreChain include un modello **Triple-Pool** che classificherebbe i validatori in tre pool in base alla loro reputazione e al livello di delega, con una quota ponderata delle ricompense di blocco per ciascun pool:

| Pool                                   | Criteri di Ammissione                                             | Peso della Ricompensa (design) |
| -------------------------------------- | ----------------------------------------------------------------- | ------------------------------ |
| **RPoS** (Reputation Proof of Stake)   | Punteggio di reputazione >= 70° percentile **E** stake >= mediana | 40%                            |
| **DPoS** (Delegated Proof of Stake)    | Delega totale >= 10.000 QOR                                       | 35%                            |
| **PoS** (Proof of Stake)               | Tutti i validatori rimanenti                                      | 25%                            |

:::note Non attivo sulle reti live
La classificazione dei pool, la selezione del proposer ponderata per pool e i pesi di ricompensa dei pool sono implementati nel modulo `x/qca` e i loro parametri sono on-chain (`qorechaind query qca config`), ma **non sono ancora collegati alla produzione dei blocchi né alla distribuzione delle ricompense**. Oggi la proposta dei blocchi ruota in base allo stake nel modo standard e le ricompense vengono suddivise in proporzione allo stake bonded, al netto della commissione di ciascun validatore. Il pool a cui un validatore "appartiene" non cambia ciò che ricevi.
:::

---

## Ricompense a Curva di Bonding {#bonding-curve}

Il design di QoreChain definisce anche una formula di ricompensa a curva di bonding:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variabile | Descrizione                                                                        |
| --------- | ---------------------------------------------------------------------------------- |
| `R`       | Importo della ricompensa per il periodo                                            |
| `beta`    | Tasso di ricompensa base (parametro del protocollo)                                |
| `S`       | Importo in stake                                                                   |
| `alpha`   | Coefficiente di fedeltà (parametro del protocollo)                                 |
| `L`       | Durata dello staking in epoche                                                     |
| `Q(r)`    | Moltiplicatore di qualità derivato dal punteggio di reputazione `r` del validatore |
| `P(t)`    | Moltiplicatore di pool al tempo `t` (40%, 35% o 25% a seconda del pool)            |

:::note Non attivo sulle reti live
Il calcolo a curva di bonding, come la classificazione dei pool qui sopra, **non viene richiamato dalla chain attiva**: le ricompense non sono calcolate con questa formula, e né la durata dello staking né la reputazione del validatore le modificano oggi. I parametri (`bonding_alpha`, `bonding_beta`) esistono on-chain ma non hanno alcun effetto.
:::

---

## Slashing e Jailing

Lo slashing su QoreChain segue il modulo di slashing standard del Cosmos SDK con questi parametri attivi (`qorechaind query slashing params`):

| Evento       | Regola                                                                                                          | Conseguenza                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Downtime     | Firmare meno del 5% degli ultimi 10.000 blocchi (circa 8,9 ore con i blocchi da circa 3,2 secondi della mainnet) | Jailed per 600 secondi; 1% dello stake sottoposto a slashing |
| Doppia firma | Firmare due blocchi diversi alla stessa altezza                                                                 | 5% dello stake sottoposto a slashing                         |

Lo slashing si applica allo stake bonded totale di un validatore, quindi i delegatori sostengono la propria quota proporzionale. Può raggiungere anche lo stake già in fase di unbonding da un validatore sottoposto a slashing, ed è per questo che il periodo di unbonding è una misura di sicurezza e non solo un tempo di attesa.

---

## Interrogare le Informazioni sui Validatori

Consulta i dettagli di qualsiasi validatore:

```bash
qorechaind query staking validator <validator_operator_address>
```

**Esempio:**

```bash
qorechaind query staking validator qorvaloper1abc...xyz
```

Elenca tutti i validatori attivi:

```bash
qorechaind query staking validators --status BOND_STATUS_BONDED
```

Interroga le tue delegazioni attuali:

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* Valuta la commissione, l'uptime e lo storico di un validatore prima di delegare; il pool o la reputazione di un validatore non cambiano attualmente le ricompense che ricevi.
* La ridelega ha effetto immediato, senza penalità e senza blocco. I limiti sono il tetto di 7 voci per le ridelegazioni simultanee lungo la stessa identica rotta e la regola per cui lo stake appena ridelegato non può essere spostato di nuovo dal validatore di destinazione finché non è giunto a maturazione.
* Il periodo di unbonding di 21 giorni è una misura di sicurezza. Durante questo periodo, gli eventi di slashing possono comunque intaccare i tuoi token.

:::
