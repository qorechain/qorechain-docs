---
slug: /light-node/overview
title: Prezentare generală a nodului light
sidebar_label: Prezentare generală
sidebar_position: 1
---

# Prezentare generală a nodului light

**QoreChain Light Node** este un client ușor care urmărește rețeaua QoreChain fără a rula un validator complet sau un nod de arhivă. În loc să reia fiecare tranzacție, verifică prin coroborare anteturile de bloc pe mai multe puncte finale RPC, reflectă din lanț delegările și recompensele contului operatorului și transmite în flux telemetria de rețea în timp real — totul dintr-un binar mic, autonom.

Rularea unui nod light vă permite să observați starea rețelei fără costurile de stocare, lățime de bandă și operaționale ale unui nod complet. Participarea la partea din recompense destinată nodurilor light este un pas separat, condiționat de licență, care **nu este încă deschis** — vezi [Starea programului de recompense](#reward-program-status).

## Propria sa linie de versiune

Nodul light este livrat pe **propria sa linie de versiune — în prezent v3.1.3** pentru binarele precompilate — care este **distinctă de versiunea de lansare a lanțului** (lanțul se află pe o pistă separată `v3.x`). Binarele pentru fiecare rețea sunt publicate cu un **manifest de sumă de control SHA-256** la `https://download.qore.host/<net>/lightnode/latest.json` (`<net>` este `mainnet` sau `testnet`; ambele canale conțin în prezent aceeași versiune v3.1.3). Vezi [Ediția SX](/light-node/sx-edition#install) pentru pașii de descărcare și verificare. Eticheta sursă `v3.1.4` diferă de v3.1.3 doar prin semnatarul inclus în imaginea Docker; vezi [Docker](/light-node/sx-edition#docker).

Când citiți documentația sau notele de lansare, tratați versiunea nodului light (v3.1.3) și versiunea lanțului ca două numere separate care se întâmplă să împartă o serie majoră.

## De ce să rulați un nod light {#why-run-a-light-node}

- **Participați la partea din recompense destinată nodurilor light.** Nodurile light înregistrate și active care respectă regulile de miză și de timp de funcționare sunt eligibile pentru **alocarea de 3% pentru nodurile light** descrisă mai jos. Înregistrarea pentru programul de recompense **nu este încă deschisă** — vezi [Starea programului de recompense](#reward-program-status). Rularea și sincronizarea unui nod nu necesită licență și funcționează astăzi.
- **Verificați prin coroborare starea lanțului care vi se arată.** Nodul preia cea mai recentă înălțime de la punctul său final RPC principal și de la fiecare punct final martor configurat, în paralel, și stochează un antet doar atunci când acestea sunt de acord asupra hash-ului blocului — ridicând ștacheta de la a avea încredere într-un singur punct final la a necesita compromiterea simultană a fiecărui punct final configurat. Aceasta este coroborare între surse independente, **nu verificare criptografică completă de consens** (nu se verifică setul de validatori sau semnăturile de commit). Nodul dvs. înregistrează modul în care rulează ca valoarea `assurance` pe fiecare linie `synced header` din jurnalul său de depanare (setați `log_level = "debug"`); aceasta nu este afișată pe tabloul de bord al nodului sau în `status`, iar niciun serviciu central QoreChain nu o poate vedea, deoarece alegerile RPC ale nodului dvs. sunt locale configurației dvs. **`trusted-single-source`** este ceea ce obțineți fără martori configurați — nodul înregistrează la pornire un avertisment în acest sens, deoarece un singur punct final rulat cinstit raportează aceeași valoare ca unul compromis. Adăugați un martor operat independent pentru a trece la `corroborated-across-sources`.
- **Țineți un ochi pe miza dvs.** Nodul reflectă din lanț delegările contului operatorului și avertizează când un validator căruia i-ați delegat scade sub un scor de reputație configurabil. Nu mută niciodată el însuși miza — modificările de delegare se fac din propriul dvs. portofel.
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

## Partea de 3% din recompense pentru nodurile light {#the-3-light-node-reward-share}

Distribuția taxelor QoreChain alocă o **parte fixă de 3% nodurilor light** (parametrul `reward_share`, `0.03`). Vezi [Tokenomică](/architecture/tokenomics) pentru defalcarea completă 37% / 30% / 20% / 10% / 3% (validatori, ars, trezorerie, staker-i, noduri light).

Aceste 3% reprezintă suma plătită în contul de modul al nodurilor light; nu este un drept per nod. La fiecare 100 de blocuri, lanțul creditează fiecărui nod eligibil partea sa ponderată după miză din ceea ce s-a acumulat de la decontarea anterioară, **limitată per nod** de `max_reward_per_block_per_node` (în prezent `1713` uqor pe bloc, scalat după timpul de funcționare al nodului). Limita este un plafon, nu o sumă promisă. Tot ce rămâne necâștigat este mutat într-o rezervă pe care o poate elibera doar un vot de guvernanță, astfel încât nu se acumulează niciun fond pentru cine se înregistrează primul. Puteți inspecta împărțirea actuală cu `GET /qorechain/lightnode/v1/reward_pool`.

Pentru a fi eligibil pentru recompense, un nod light trebuie să fie **înregistrat pe lanț, activ** (dovedind starea de funcționare prin heartbeat-uri), să dețină cel puțin miza minimă blocată și să își mențină timpul de funcționare la sau peste minim. Înregistrarea și licențierea sunt acoperite în [Înregistrare și licențiere](/light-node/registration-and-licensing); modul în care recompensele sunt creditate, revendicate și monitorizate este acoperit în [Recompense și monitorizare](/light-node/rewards-and-monitoring).

## Starea programului de recompense {#reward-program-status}

:::note Înregistrarea în programul de recompense nu este încă deschisă
La momentul redactării (15 octombrie 2026), nicio licență `lightnode_operator` nu a fost acordată în niciuna dintre rețele și niciun nod light nu este înregistrat (`GET /qorechain/lightnode/v1/stats` raportează `total_registered: "0"` pe rețeaua principală și pe rețeaua de test). Lanțul refuză o înregistrare fără acea licență, deci nimeni nu se poate înscrie încă. Contabilitatea recompenselor în sine este deja activă în ambele rețele de la actualizarea v3.2.0. Rularea și sincronizarea unui nod nu necesită licență și funcționează astăzi, dar timpul de funcționare este numărat **de la blocul în care nodul dvs. este înregistrat**, deci rularea unui nod înainte nu aduce credit.

Manifestul de lansare (`https://download.qore.host/<net>/lightnode/latest.json`) conține semnalul oficial în câmpul `registration.open`. Puteți verifica și `GET /qorechain/license/v1/holders/lightnode_operator` și `GET /qorechain/lightnode/v1/stats` la `https://api.qore.host` (rețeaua principală) sau `https://api-testnet.qore.host` (rețeaua de test).
:::

## Caracteristici de bază dintr-o privire

- **Coroborarea anteturilor din surse multiple** — verifică prin coroborare cel mai recent hash de bloc cu fiecare punct final martor configurat înainte de a-l considera de încredere, fără a descărca blocuri complete, sincronizându-se rapid chiar și de la o pornire la rece.
- **Urmărirea delegărilor** — reflectă din lanț delegările contului operatorului (doar citire).
- **Revendicare automată opțională** — revendică recompensele acumulate ale nodului light în contul operatorului la un interval configurabil. Dezactivată implicit; nu redelegă niciodată.
- **Alerte de reputație** — avertizează când un validator căruia i-ați delegat scade sub un scor de reputație configurabil; nu mută miza.
- **Telemetrie în timp real** — validatori, consens, punte și tokenomică, reîmprospătate la intervale independente.
- **Înregistrare pe lanț** — cu dovezi de funcționare prin heartbeat care păstrează nodul eligibil pentru recompense. Înregistrarea este condiționată de licență.
- **Criptografie post-cuantică** — chei și semnături Dilithium-5 (ML-DSA-87) peste tot.
- **Mod exclusiv local** — exersați întreaga stivă PQC și rulați nodul de sine stătător înainte de a-l îndrepta spre un lanț activ.

Nodul light este lansat sub licența **Apache 2.0**.

## Unde să mergeți mai departe

- [Ediția SX](/light-node/sx-edition) — instalați, configurați și rulați daemonul de server.
- [Ediția UX](/light-node/ux-edition) — rulați ediția cu tablou de bord web.
- [Înregistrare și licențiere](/light-node/registration-and-licensing) — înregistrați-vă pe lanț și obțineți o licență.
- [Recompense și monitorizare](/light-node/rewards-and-monitoring) — cum este creditată și revendicată partea de 3% și cum păstrați nodul sănătos.
- [Tokenomică](/architecture/tokenomics) — cum se încadrează partea de recompense pentru nodurile light în economia mai largă.
