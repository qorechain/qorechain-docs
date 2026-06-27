---
slug: /light-node/overview
title: Prezentare generală a nodului light
sidebar_label: Prezentare generală
sidebar_position: 1
---

# Prezentare generală a nodului light

**QoreChain Light Node** este un client ușor care urmărește rețeaua QoreChain fără a rula un validator complet sau un nod de arhivă. În loc să reia fiecare tranzacție, verifică criptografic anteturile de bloc, urmărește delegările și recompensele și transmite în flux telemetria de rețea în timp real — totul dintr-un binar mic, autonom.

Rularea unui nod light vă permite să participați la economia rețelei și să observați starea acesteia fără costurile de stocare, lățime de bandă și operaționale ale unui nod complet.

## Propria sa linie de versiune

Nodul light este livrat pe **propria sa linie de versiune — în prezent v3.1.1** — care este **distinctă de versiunea de lansare a lanțului** (lanțul se află pe o pistă separată `v3.x`). Linia v3.1.1 a nodului light este aliniată cu `qorechain-core`: adaugă o suită de regresie pentru criptografie post-cuantică (PQC) (keygen, sign, verify și detectarea modificărilor) care protejează comportamentul de verificare a semnăturilor al nucleului și o rulează în integrare continuă.

Când citiți documentația sau notele de lansare, tratați versiunea nodului light (v3.1.1) și versiunea lanțului ca două numere separate care se întâmplă să împartă o serie majoră.

## De ce să rulați un nod light

- **Câștigați o parte din recompensele de bloc.** Nodurile light active și înregistrate sunt eligibile pentru **partea de 3% din recompense pentru nodurile light** descrisă mai jos.
- **Verificați singur lanțul.** Nodul efectuează verificarea anteturilor cu un client light cu sărire, astfel încât obțineți asigurare criptografică a stării lanțului fără a avea încredere într-un API la distanță.
- **Delegați și auto-compuneți.** Gestionați miza delegată între mai mulți validatori, împărțită după pondere, și compuneți recompensele automat.
- **Urmăriți rețeaua în direct.** Telemetria în timp real acoperă validatorii, consensul, puntea și tokenomica.
- **Post-cuantic din prima zi.** Cheile și semnăturile folosesc Dilithium-5 (ML-DSA-87).

## Două ediții: SX și UX

Nodul light vine în două ediții construite din aceeași bază de cod. Alegeți-o pe cea care corespunde modului în care doriți să operați nodul.

| Ediție | Binar | Construit pentru | Interfață |
| --- | --- | --- | --- |
| **SX — Server eXperience** | `lightnode-sx` | Implementări de server fără interfață grafică | CLI complet (daemon + comenzi de gestionare) |
| **UX — User eXperience** | `lightnode-ux` | Utilizare desktop și de operator | Tablou de bord web încorporat |

- **Ediția SX** este un daemon fără interfață grafică cu un CLI complet de gestionare. Este alegerea potrivită pentru servere, automatizare și operatori care trăiesc pe linia de comandă. Vezi [Ediția SX](/light-node/sx-edition).
- **Ediția UX** rulează același daemon, dar adaugă un tablou de bord web încorporat, astfel încât să puteți urmări telemetria, delegările și recompensele într-un browser. Vezi [Ediția UX](/light-node/ux-edition).

Ambele ediții citesc același `config.toml`, stochează datele în același director home (`~/.qorechain-lightnode` în mod implicit) și folosesc același keyring Dilithium-5.

## Partea de 3% din recompense pentru nodurile light

Distribuția taxelor QoreChain alocă o **parte fixă de 3% nodurilor light** pentru servirea datelor de rețea. Acest lucru este aplicat pe lanț ca parte a împărțirii recompenselor protocolului și este același canal documentat în economia proiectului — vezi [Tokenomică](/architecture/tokenomics) pentru defalcarea completă 37% / 30% / 20% / 10% / 3% (validatori, ars, trezorerie, staker-i, noduri light).

Pentru a fi eligibil pentru această parte, un nod light trebuie să fie **înregistrat pe lanț și să dovedească activ starea de funcționare** prin dovezi de heartbeat. Înregistrarea și licențierea sunt acoperite în [Înregistrare și licențiere](/light-node/registration-and-licensing); modul în care partea este câștigată, compusă și monitorizată este acoperit în [Recompense și monitorizare](/light-node/rewards-and-monitoring).

## Caracteristici de bază dintr-o privire

- **Client light cu sărire** — verifică anteturile fără a descărca blocuri complete, sincronizându-se rapid chiar și de la o pornire la rece.
- **Staking delegat** — mizați între mai mulți validatori cu ponderi de împărțire configurabile.
- **Auto-compunerea recompenselor** — revendicați și redelegați recompensele la un interval configurabil.
- **Reechilibrare conștientă de reputație** — mutați delegarea automat către validatorii cu reputație mai mare.
- **Telemetrie în timp real** — validatori, consens, punte și tokenomică, reîmprospătate la intervale independente.
- **Înregistrare pe lanț** — cu dovezi de funcționare prin heartbeat care păstrează nodul eligibil pentru recompense.
- **Criptografie post-cuantică** — chei și semnături Dilithium-5 (ML-DSA-87) peste tot.
- **Mod exclusiv local** — exersați întreaga stivă PQC și rulați nodul de sine stătător înainte de a-l îndrepta spre un lanț activ.

Nodul light este lansat sub licența **Apache 2.0**.

## Unde să mergeți mai departe

- [Ediția SX](/light-node/sx-edition) — instalați, configurați și rulați daemonul de server.
- [Ediția UX](/light-node/ux-edition) — rulați ediția cu tablou de bord web.
- [Înregistrare și licențiere](/light-node/registration-and-licensing) — înregistrați-vă pe lanț și obțineți o licență.
- [Recompense și monitorizare](/light-node/rewards-and-monitoring) — câștigați partea de 3% și păstrați nodul sănătos.
- [Ediția SX](/light-node/sx-edition) și [Ediția UX](/light-node/ux-edition) sunt cele două moduri de a rula un nod light.
- [Tokenomică](/architecture/tokenomics) — cum se încadrează partea de recompense pentru nodurile light în economia mai largă.
