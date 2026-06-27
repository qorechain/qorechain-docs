---
slug: /dashboard/tools-hub
title: Centrul de instrumente
sidebar_label: Centrul de instrumente
sidebar_position: 11
---

# Centrul de instrumente

Pagina **Instrumente** adună instrumentele QoreChain pentru operatori și constructori într-un singur loc, organizate în file. De aici poți înregistra infrastructură, implementa un rollup, accesa SDK-ul, aplica pentru a deveni validator și achiziționa licențele pe care le necesită aceste roluri. Fiecare secțiune este rezumată mai jos, cu indicația spre documentația completă.

Conectează-ți portofelul pentru a folosi instrumentele care înregistrează infrastructură sau trimit aplicații — vezi [Prezentare generală și primii pași](/dashboard/overview#connect-your-wallet).

## Light Node

Înregistrează un light node pentru ca acesta să se poată alătura rețelei și să câștige recompense. Secțiunea oferă un formular de înregistrare pentru adresa de operator, moniker și endpoint-ul public și confirmă angajamentul de miză (stake) necesar pentru a participa. Mai întâi este necesară o licență de light node activă; secțiunea trimite către **Buy License** dacă nu ai una. Pentru imaginea completă, vezi [Prezentare generală Light Node](/light-node/overview) și [Înregistrare și licențiere](/light-node/registration-and-licensing).

## Înregistrare nod

Înregistrează un nod de validator. Formularul colectează adresa validatorului, monikerul, rata comisionului, un endpoint public opțional și rețelele pe care dorești să le validezi și confirmă angajamentul de self-stake. Este necesară o licență de validator activă; secțiunea trimite către **Buy License** atunci când este nevoie. Vezi [Rularea unui validator](/developer-guide/running-a-validator) și [Staking și validatori](/dashboard/staking-and-validators).

## Rollup-uri

Implementează propriul rollup alimentat de QoreChain. Formularul de configurare îți permite să denumești rollup-ul și să-i alegi mașina virtuală (EVM, CosmWasm sau SVM), stratul de disponibilitate a datelor, tokenul de gas, modelul de sequencer și ținta de decontare (settlement). După ce trimiți, rollup-ul este provizionat în urma analizei înainte de a deveni activ. Vezi [Prezentare generală Rollup-uri](/rollups/overview) și [Implementarea unui rollup](/rollups/deploying-a-rollup).

## SDK

Un centru de quickstart și referință pentru a construi pe QoreChain în cod. Secțiunea afișează pașii de instalare și fragmente gata de copiat pentru conectare, derivarea conturilor între cele trei runtime-uri, citirea stării, trimiterea de transferuri și semnarea quantum-safe, plus un tabel cu pachetele pe limbaje și legături către depozit, exemple și explorer. Vezi [Prezentare generală QoreChain SDK](/sdk/overview) și [Instalare](/sdk/install).

## Aplicație de validator {#validator-application}

Aplică pentru a deveni Genesis Validator. Formularul colectează datele entității și de contact, nivelul (tier) dorit, regiunea de infrastructură, informațiile hardware și motivația, cu o confirmare de conformitate. După ce trimiți, statusul aplicației este afișat — în analiză, aprobat sau neaprobat cu un motiv — iar odată aprobat poți continua cu achiziționarea unei licențe de validator. Vezi [Rularea unui validator](/developer-guide/running-a-validator).

## Buy License

Achiziționează licențele necesare pentru a rula infrastructura de rețea, inclusiv licențe de light node și de validator, plus suplimente opționale cross-network. Fiecare opțiune arată ce include și rolul pe care îl deblochează; licențele de validator devin disponibile odată ce [Aplicația de validator](#validator-application) este aprobată. Pentru modul în care funcționează licențierea în rețea, vezi [Licențierea lanțului](/architecture/chain-licensing).
