---
slug: /architecture/mev-protection-fairblock
title: Protecție MEV (FairBlock)
sidebar_label: Protecție MEV (FairBlock)
sidebar_position: 10
---

# Protecție MEV (FairBlock)

Modulul `x/fairblock` implementează apărarea QoreChain împotriva atacurilor de tip Maximal Extractable Value (MEV) folosind criptare bazată pe identitate cu prag (threshold). Combinată cu un sistem de prioritizare a tranzacțiilor pe 5 benzi, aceasta creează o arhitectură anti-MEV cuprinzătoare care protejează utilizatorii împotriva front-running-ului, a atacurilor sandwich și a altor forme de extragere de valoare din mempool.

## Problema MEV

MEV apare atunci când propunătorii de blocuri sau observatorii exploatează **asimetria informațională** din mempool-ul de tranzacții. Deoarece tranzacțiile în așteptare sunt vizibile înainte de includere, adversarii pot:

* **Front-run**: Plasează o tranzacție înaintea unei tranzacții profitabile detectate
* **Atac sandwich**: Plasează tranzacții înainte și după tranzacția unei victime pentru a extrage valoare din alunecarea prețului (slippage)
* **Back-run**: Plasează o tranzacție imediat după o oportunitate detectată

Aceste atacuri extrag valoare de la utilizatorii obișnuiți și subminează corectitudinea în DeFi, schimburile de token-uri și emiterea de NFT-uri.

## Cadrul FairBlock tIBE

QoreChain abordează MEV prin **threshold Identity-Based Encryption (tIBE)**, o schemă criptografică în care:

1. **Criptare**: Utilizatorii își criptează tranzacțiile înainte de difuzare. Tranzacțiile criptate sunt **opace** — propunătorii, validatorii și observatorii mempool-ului nu pot citi conținutul tranzacțiilor.
2. **Includere**: Propunătorii includ tranzacțiile criptate în blocuri fără a le cunoaște conținutul. Deoarece datele sunt ilizibile, asimetria informațională este eliminată.
3. **Decriptare**: După ce o tranzacție este comisă într-un bloc, un număr-prag de validatori contribuie cu fragmente de decriptare. Odată atins pragul, tranzacția este decriptată și executată.

Această abordare garantează că nicio parte nu poate decripta o tranzacție înainte ca aceasta să fie comisă ireversibil, eliminând vectorul de atac MEV chiar de la rădăcină.

### Structura tranzacției criptate

Fiecare tranzacție criptată conține:

| Câmp            | Descriere                                      |
| ---------------- | ------------------------------------------------ |
| `encrypted_data` | Sarcina utilă a tranzacției criptată tIBE               |
| `sender`         | Adresa expeditorului tranzacției (vizibilă pentru rutare) |
| `target_height`  | Înălțimea blocului la care ar trebui să aibă loc decriptarea    |
| `submitted_at`   | Marcaj temporal al criptării                          |

### Fragmente de decriptare

Validatorii contribuie cu fragmente de decriptare pentru tranzacțiile comise:

| Câmp        | Descriere                           |
| ------------ | ------------------------------------- |
| `validator`  | Adresa validatorului contribuabil |
| `tx_id`      | ID-ul tranzacției criptate       |
| `share_data` | Fragmentul de cheie de decriptare al validatorului  |
| `height`     | Înălțimea blocului la care a fost trimis fragmentul  |

## Starea implementării

În versiunea curentă de testnet, modulul FairBlock este o **implementare de tip stub**:

* Gestionarul ante `FairBlockDecorator` este integrat în fluxul de procesare a tranzacțiilor, dar **transmite mai departe** toate tranzacțiile fără modificare.
* Când `enabled` este `false` (valoarea implicită), decoratorul deleagă imediat către următorul gestionar din lanț.
* Activarea completă tIBE este planificată pentru o versiune viitoare, în așteptarea unei ceremonii de chei a validatorilor pentru stabilirea parametrilor de criptare cu prag.

### Configurarea FairBlock

| Parametru            | Implicit      | Descriere                                      |
| -------------------- | ------------ | ------------------------------------------------ |
| `enabled`            | `false`      | Comutatorul principal pentru criptarea tIBE                |
| `tibe_threshold`     | 5            | Numărul de fragmente de decriptare ale validatorilor necesare   |
| `decryption_delay`   | 3 blocuri     | Blocuri după includere înainte de începerea decriptării  |
| `max_encrypted_size` | 65,536 octeți | Dimensiunea maximă a unei sarcini utile de tranzacție criptată |

## Prioritizarea tranzacțiilor pe 5 benzi

QoreChain implementează o arhitectură de mempool pe 5 benzi care clasifică tranzacțiile după tip și atribuie fiecărei benzi un nivel de prioritate și o alocare de spațiu în bloc.

### Configurarea benzilor

| Bandă        |      Prioritate | Spațiu în bloc | Tip de tranzacție                                 |
| ----------- | ------------: | ----------: | ------------------------------------------------ |
| **PQC**     | 100 (cea mai mare) |         15% | Tranzacții cu semnături hibride post-cuantice |
| **MEV**     |            90 |         20% | Tranzacții criptate tIBE FairBlock            |
| **AI**      |            80 |         15% | Tranzacții scorate de AI și optimizate ca taxă         |
| **Default** |            50 |         40% | Tranzacții standard                            |
| **Free**    |   10 (cea mai mică) |         10% | Tranzacții cu abstractizare de gaz și sponsorizate        |

### Descrierea benzilor

**Banda PQC** (Prioritate 100, 15% spațiu în bloc)\
Tranzacțiile semnate cu semnături criptografice hibride post-cuantice primesc cea mai mare prioritate. Aceasta stimulează adoptarea semnării tranzacțiilor rezistente cuantic și asigură că operațiunile protejate PQC nu sunt niciodată marginalizate în timpul congestiei.

**Banda MEV** (Prioritate 90, 20% spațiu în bloc)\
Tranzacțiile criptate tIBE primesc a doua cea mai mare prioritate și cea mai mare alocare rezervată. Aceasta asigură că utilizatorii care optează pentru protecția MEV au garantat spațiu în bloc, încurajând adoptarea pe scară largă a schemei de criptare.

**Banda AI** (Prioritate 80, 15% spațiu în bloc)\
Tranzacțiile care au fost scorate sau optimizate de sistemul AI de detecție a anomaliilor primesc o prioritate ridicată. Aceasta include tranzacțiile marcate ca operațiuni legitime de mare valoare sau cele cu structuri de taxe optimizate de AI.

**Banda Default** (Prioritate 50, 40% spațiu în bloc)\
Tranzacții standard fără nicio clasificare specială. Această bandă primește cea mai mare alocare absolută de spațiu în bloc pentru a gestiona traficul normal al rețelei.

**Banda Free** (Prioritate 10, 10% spațiu în bloc)\
Tranzacții cu abstractizare de gaz și sponsorizate. Această bandă permite experiențe de utilizare fără taxe, în care o terță parte (aplicație, protocol sau relayer) sponsorizează costul gazului. Prioritatea redusă și spațiul limitat în bloc previn abuzul, susținând în același timp cazurile de utilizare cu abstractizare de gaz.

### Starea implementării

Configurarea benzilor este **doar la nivel de date** în versiunea curentă de testnet. Definițiile benzilor (prioritate, alocare de spațiu în bloc) sunt înregistrate la inițializarea aplicației, dar reordonarea efectivă a mempool-ului prin `PrepareProposal` și `ProcessProposal` este o etapă viitoare. În prezent, toate tranzacțiile sunt procesate în ordine standard, indiferent de atribuirea benzii.

## Efectul anti-MEV combinat

1. **Stratul 1: Criptare (tIBE)** — Tranzacțiile sunt criptate înainte de a intra în mempool. Propunătorii nu pot citi conținutul, deci nu există informații de extras.
2. **Stratul 2: Prioritizare (Benzi)** — Tranzacțiile criptate din banda MEV primesc 20% spațiu rezervat în bloc. Prioritatea 90 asigură includerea chiar și în timpul congestiei.
3. **Stratul 3: Decriptare cu prag** — Numai după comiterea blocului validatorii dezvăluie fragmentele de decriptare. Cerința de prag împiedică orice validator individual să decripteze prematur.

Rezultat: Asimetria informațională este eliminată în fiecare etapă a ciclului de viață al tranzacției, de la difuzare la execuție.

Această abordare este strict superioară schemelor de decriptare cu întârziere temporală sau celor de commit-reveal cu o singură parte, deoarece cerința de prag distribuie încrederea pe întregul set de validatori.
