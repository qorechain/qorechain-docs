---
slug: /build-before-qday/workshop-2
title: "Workshop 2: Protejează bani cu o cheie post-cuantică"
sidebar_label: "Workshop 2"
sidebar_position: 3
date: 2026-11-18
---

# Workshop 2: Protejează bani cu o cheie post-cuantică

Workshop 1 a trimis o tranzacție semnată cu două chei. Workshop 2 folosește cheia post-cuantică ca să **protejeze bani**: mai întâi un contract inteligent care plătește doar atunci când semnează o cheie post-cuantică, apoi un agent AI ale cărui limite de cheltuială sunt impuse de lanț, apoi o metodă de a întreba lanțul cum a fost protejată fiecare tranzacție.

Nu trebuie să fii expert în securitate. Fiecare comandă de mai jos spune ce face și ce ar trebui să vezi. Cele trei aplicații de exemplu sunt publice: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), folderul `workshop-2`.

**Cât durează:** circa 40 de minute pentru seif, 25 pentru agent, 10 pentru întrebările către lanț. Poți face părțile în orice ordine, dar fiecare parte are nevoie de propriul cont de test.

## Ce construim {#what-we-built}

| Parte | Aplicație | Ce demonstrează |
| --- | --- | --- |
| 1 | **QDayVault** (Solidity și TypeScript) | Un seif care plătește doar cu o semnătură ML-DSA-87, verificată pe lanț de precompile-ul `pqcVerify`. O cheie în stil Ethereum furată nu ajunge ca să iei banii. |
| 2 | **Agent care plătește facturi** (Node.js) | Un agent cu propria cheie. Lanțul îi impune limitele: doar trimitere, 1 QOR pe plată, 3 QOR pe zi, 24 de ore. |
| 3 | **Întreabă lanțul** (MCP și `qore-cli`) | Întrebări doar de citire: a fost această tranzacție semnată post-cuantic și care este starea cheii acestui cont? |

Inovațiile din spatele lor:

- **Verificare post-cuantică în interiorul unui contract.** Lanțul are contracte încorporate (precompile-uri) la adrese fixe, care verifică semnături ML-DSA-87 și raportează cheia înregistrată a unui cont. Codul tău Solidity le apelează ca pe orice alt contract.
- **Limite care trăiesc pe lanț.** Permisiunile și regulile de cheltuială ale unui agent fac parte din cont, deci o greșeală sau un server furat nu le poate ridica.
- **Etichete sincere.** Lanțul îți poate spune care tranzacții au purtat o semnătură post-cuantică și care nu.

## Cuvinte folosite în acest ghid {#words}

| Cuvânt | Sens simplu |
| --- | --- |
| Precompile | Un contract încorporat, la o adresă fixă, pe care lanțul îl rulează nativ. `pqcVerify` este la `0x0000000000000000000000000000000000000a01`, iar `pqcKeyStatus` la `0x0000000000000000000000000000000000000a02`. Scrie adresele cu litere mici: compilatorul Solidity respinge scrierea cu litere mari și mici amestecate |
| ML-DSA-87 | Schema de semnătură post-cuantică (NIST FIPS 204) folosită de QoreChain |
| Fereastră EVM | O permisiune scurtă și limitată de a trimite tranzacții în stil Ethereum dintr-un cont. Deschiderea ei cere o tranzacție semnată cu ambele chei, deci o cheie Ethereum singură nu poate deschide niciodată una |
| Guardian | Contul a cărui cheie post-cuantică trebuie să semneze fiecare retragere din seif |
| Authenticator | O cheie legată de contul tău, cu reguli pe care lanțul le impune, ca cea folosită de agent în partea 2 |
| Cont de unică folosință | O cheie făcută pentru acest exercițiu, care conține doar QOR de test |

:::caution Doar conturi testnet de unică folosință
Folosește chei făcute pentru acest workshop, care conțin QOR de test fără valoare. Nu pune niciodată într-un fișier `.env` sau într-o comandă cheia ori codul de recuperare ale unui cont care conține bani reali.
:::

## Înainte să începi {#prerequisites}

Ai nevoie de uneltele de la [Înainte de a începe](/build-before-qday/prerequisites) (un terminal, Node.js 22 sau mai nou și Git), plus un browser web. Verifică Node.js:

```bash
node -v
```

Trebuie să afișeze `v22` sau mai mare. Partea 1 are nevoie și de **pnpm** și **Foundry**:

```bash
npm install -g pnpm
```

Instalează pnpm, unealta de pachete folosită de seif. Verifică cu `pnpm -v`.

Foundry compilează, testează și implementează Solidity. Instalează-l de la [getfoundry.sh](https://getfoundry.sh): pagina dă o singură comandă pentru sistemul tău, apoi rulezi:

```bash
foundryup
```

Descarcă uneltele Foundry. Verifică cu `forge --version` și `cast --version`.

Ia codul de exemplu:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-2
```

Prima linie descarcă exemplele într-un folder numit `build-before-qday`. A doua intră în folderul `workshop-2`, care conține cele trei aplicații.

Pentru QOR de test folosești [faucetul](/dashboard/faucet) din dashboard. Toate cele trei aplicații rulează doar pe testnetul QoreChain `qorechain-diana`.

## Partea 1: QDayVault, un seif care supraviețuiește unei chei scurse {#part-1}

Cod: [workshop-2/01-qday-vault](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/01-qday-vault). O cheie obișnuită de portofel (cheia secp256k1 pe care o folosește MetaMask) ar putea fi spartă într-o zi de un calculator cuantic. Acest seif este construit astfel încât o cheie furată de acest fel să nu ajungă: banii pleacă doar când **guardianul** semnează retragerea cu o cheie post-cuantică, iar contractul verifică singur semnătura, pe lanț. Oricine poate trimite retragerea semnată. Contează semnătura, nu cine o trimite.

```bash
cd 01-qday-vault
```

Intră în folderul seifului.

### Cum funcționează contractul {#vault-how}

Deschide `src/QDayVault.sol`. Funcția importantă este `withdraw`:

```solidity
(bool registered,, bytes memory pubkey, bool proven) = PQC_KEYS.pqcKeyStatus(guardian);
if (!registered || pubkey.length == 0) revert GuardianKeyNotRegistered();
if (!proven) revert GuardianKeyNotProven();

uint256 n = nonce;
if (!PQC_VERIFY.pqcVerify(pubkey, mldsaSignature, withdrawalMessage(to, amount, n))) revert BadPqcSignature();

nonce = n + 1;
emit Withdrawn(to, amount, n);
(bool ok,) = to.call{value: amount}("");
if (!ok) revert TransferFailed();
```

1. **Citește cheia guardianului de pe lanț.** Cheia are 2.592 de octeți, deci contractul nu o stochează. Dacă guardianul schimbă cheia pe lanț, seiful o urmează.
2. **Refuză o cheie care nu a fost dovedită.** „Dovedită" înseamnă că contul a semnat o dovadă de proprietate când a înregistrat cheia. Fără această verificare, cineva ar putea înregistra o cheie care nu este a lui.
3. **Verifică semnătura peste un mesaj exact.** Mesajul leagă o etichetă fixă, ID-ul lanțului, adresa seifului, destinatarul, suma și nonce-ul, deci o semnătură e valabilă pentru o retragere, pe un seif, pe un lanț, o singură dată.
4. **Crește nonce-ul înainte de a trimite bani.** Aceeași semnătură nu poate fi folosită de două ori, iar starea se schimbă înainte de apelul extern, ceea ce protejează împotriva reentranței.
5. **Verifică dacă transferul a reușit.** Dacă a eșuat, toată tranzacția este anulată.

### Pasul 1: rulează testele (nu ai nevoie de cont) {#vault-tests}

```bash
pnpm install
```

Descarcă pachetele JavaScript din `package.json` (SDK-ul QoreChain, viem, tsx).

```bash
pnpm forge-std
```

Descarcă `forge-std`, biblioteca standard a Foundry, în `lib/`. Testele și scriptul de implementare o importă. Faci asta o singură dată.

```bash
forge test
```

Compilează contractul și rulează cele 8 teste din `test/QDayVault.t.sol`. Ar trebui să vezi `8 passed; 0 failed`. Lanțul de test local nu are precompile-urile QoreChain, așa că testele pun mici contracte înlocuitoare la cele două adrese de precompile cu `vm.etch`. Ele verifică logica: o semnătură bună plătește, una proastă este refuzată, o semnătură funcționează o singură dată, o cheie nedovedită este refuzată. Precompile-urile reale rulează în pașii următori.

### Pasul 2: creează un cont doar pentru testnet {#vault-account}

```bash
cast wallet new
```

Afișează o adresă nouă și o cheie privată. Folosește-le doar pe testnet.

Pe macOS și Linux:

```bash
cp .env.example .env
```

Pe Windows PowerShell folosește `Copy-Item .env.example .env`. Asta creează propriul tău fișier de setări. `.env` este ignorat de Git, deci nu este niciodată comis. Deschide `.env` și setează `PRIVATE_KEY` la cheia privată de la `cast wallet new`.

```bash
pnpm window recovery-code
```

Afișează un cod de recuperare care începe cu `QRC1-`. Cheia ta post-cuantică se face din el. Pune-l în `.env` ca `QORE_PQC_RECOVERY_CODE` și păstrează o copie într-un loc sigur, separat de cheia privată. Folosește mereu același cod: un alt cod înseamnă o altă cheie post-cuantică.

### Pasul 3: alimentează contul {#vault-fund}

```bash
pnpm window status
```

Afișează contul tău în două forme, `0x...` și `qor1...`. Sunt același cont. Lipește adresa `qor1...` în [faucet](/dashboard/faucet).

### Pasul 4: înregistrează-ți cheia post-cuantică, o singură dată {#vault-register}

```bash
pnpm window register
```

Pune pe lanț cheia ta publică ML-DSA-87, cu o dovadă că îți aparține. Faci asta o singură dată pentru fiecare cont. După aceea `pnpm window status` arată `PQC key: registered`. Aceasta este singura tranzacție pe care lanțul o acceptă doar cu cheia clasică, pentru că lanțul nu îți cunoaște încă cheia post-cuantică. Despre ce leagă de fapt înregistrarea, vezi [Cum este legată cheia ta post-cuantică de contul tău](/build-before-qday/key-binding).

### Pasul 5: deschide o fereastră EVM limitată {#vault-window}

```bash
pnpm window:scoped
```

Trimite o tranzacție semnată cu ambele chei, care deschide o fereastră EVM de **600 de blocuri (circa 15 minute), 3 tranzacții și 2 QOR** valoare plus taxe. Este suficient pentru implementare și o retragere, nimic mai mult. Dacă cheia ta clasică se scurge cât timp fereastra este deschisă, paguba este plafonată la acel buget; când fereastra se încheie, lane-ul în stil Ethereum se închide din nou.

**Așteaptă circa 10 secunde** înainte de pasul următor. Deschiderea ferestrei a folosit un nonce al contului tău, iar următorul bloc trebuie să-l includă primul.

### Pasul 6: implementează seiful {#vault-deploy}

```bash
pnpm deploy:testnet
```

Rulează scriptul Foundry `script/QDayVault.s.sol`: implementează seiful cu un depozit de 1 QOR și te face pe **tine** guardian. Caută `QDayVault 0x...` în rezultat. În rezultatul Foundry, „ETH" înseamnă QOR.

```bash
pnpm vault status
```

Arată adresa seifului, soldul lui (1 QOR), guardianul (tu) și nonce-ul (0).

### Pasul 7: atacul, ca simulare {#vault-attack}

```bash
pnpm vault attack 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

Joacă rolul unui atacator care are cheia ta clasică, dar nu cheia ta post-cuantică. Semnează retragerea cu o cheie ML-DSA-87 aleatoare și întreabă lanțul ce s-ar întâmpla. Ar trebui să vezi `BLOCKED by the vault: BadPqcSignature`. Este doar o simulare, deci nu costă nimic și nu consumă fereastra ta. Orice adresă merge ca destinatar.

### Pasul 8: retragerea reală {#vault-withdraw}

```bash
pnpm vault withdraw 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

Semnează retragerea cu **propria** ta cheie ML-DSA-87 (un mesaj de 157 de octeți, o semnătură de 4.627 de octeți) și o trimite. Seiful o verifică cu `pqcVerify` și plătește. Ar trebui să vezi `WITHDRAWN tx 0x...` și un link către explorer.

```bash
pnpm window status
```

Arată ce a mai rămas din fereastră: 1 tranzacție, exact bugetul pe care i l-ai dat.

### Dacă ceva nu merge {#vault-troubleshooting}

| Ce vezi | Ce înseamnă | Ce faci |
| --- | --- | --- |
| `REFUSED: Missing or invalid parameters` la implementare sau retragere | Nu există o fereastră EVM activă: a expirat sau a fost consumată | Rulează `pnpm window status`, apoi `pnpm window:scoped`, așteaptă 10 secunde și încearcă din nou |
| `does not exist on chain yet` | Contul nu are încă QOR | Folosește faucetul (pasul 3) |
| `PQC key: not registered` | Pasul 4 a fost sărit | Rulează `pnpm window register` |
| `GuardianKeyNotRegistered` | Guardianul nu are nicio cheie ML-DSA-87 pe lanț | Înregistrează-o (pasul 4) |
| `No vault yet` | Nu s-a implementat nimic din acest folder | Fă pasul 6 sau setează `VAULT_ADDRESS` în `.env` |

### Auditează contractul înainte să-l implementezi {#vault-audit}

Folderul `audit/` conține prima ciornă a contractului, cu greșeli reale, și versiunea corectată. Arată un flux în două etape cu [Contract Auditor](/dashboard/contract-auditor) din dashboard: auditează ciorna, repară fiecare constatare cu un test, auditează contractul final și păstrează ambele rapoarte. Un audit automat nu înlocuiește un audit uman înainte de mainnet. Pentru Solidity, nota de pregătire cuantică arată „Not scored", ceea ce este de așteptat: pe EVM verificarea post-cuantică o face lanțul prin precompile. Vezi `audit/README.md` din folder și pagina [Precompile-uri EVM](/developer-guide/evm-precompiles) pentru adresele precompile-urilor și gaz.

## Partea 2: un agent care plătește facturi, cu limite impuse de lanț {#part-2}

Cod: [workshop-2/02-pq-agent](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/02-pq-agent). Dacă îi dai unui bot cheia ta privată, limitele lui de cheltuială stau în propriul lui cod. O greșeală, o injecție de prompt sau un server furat, și limitele dispar. Pe QoreChain limitele trăiesc **pe lanț**: agentul primește propria cheie, legată de contul tău prin reguli pe care lanțul le verifică la fiecare plată.

Întoarce-te un folder înapoi și intră în agent:

```bash
cd ../02-pq-agent
```

### Trei chei, trei roluri {#agent-keys}

| Cheie | Cine o deține | Ce poate face |
| --- | --- | --- |
| **Owner** | Tu | Contul tău, semnat cu ambele chei. Deține banii, leagă agentul și scrie regulile |
| **Cheia agentului** | Agentul | O cheie ed25519. Poate cere să cheltuiască din contul ownerului, doar în limita regulilor. Nu deține bani |
| **Portofel de gaz** | Agentul | Un mic cont separat care trimite cererile agentului și plătește taxele. Nu deține niciodată banii ownerului |

Regulile din acest exemplu: agentul poate doar să **trimită QOR**, cel mult **1 QOR pe plată** și **3 QOR pe zi**, iar legătura **expiră după 24 de ore**. Deschide `agent.mjs` și uită-te la comanda `pay`: nu are nicio verificare de limită. Agentul doar încearcă să plătească. Fiecare limită pe care o vei vedea vine de la lanț.

### Pasul 1: instalează și creează cheile {#agent-keys-create}

```bash
npm install
```

Descarcă pachetele din `package.json`: SDK-ul QoreChain, CosmJS și `@noble/curves` pentru cheia ed25519.

```bash
node agent.mjs init
```

Creează cheia ed25519 a agentului și portofelul lui de gaz și le salvează în `~/.config/qday/agent.env`, care poate fi citit doar de tine. Afișează adresa `qor1...` a portofelului de gaz.

```bash
node agent.mjs owner-init
```

Creează un cont owner de unică folosință pentru testnet și îl salvează în `~/.config/qday/owner.env`. Ca să folosești un cont pe care îl ai deja, pune în schimb `QORE_MNEMONIC="..."` în acel fișier. Cheile nu părăsesc niciodată calculatorul tău, nu sunt afișate niciodată și nu au ce căuta într-un depozit.

```bash
node agent.mjs whoami
```

Afișează cele trei adrese: owner, cheia agentului și portofelul de gaz.

### Pasul 2: alimentează ownerul și portofelul de gaz {#agent-fund}

Lipește fiecare adresă `qor1...` în [faucet](/dashboard/faucet). Ownerul are nevoie de câțiva QOR pentru facturi, portofelul de gaz de circa 3 QOR pentru taxe.

```bash
node agent.mjs balance
```

Verifică dacă ambele au QOR.

### Pasul 3: înregistrează cheile post-cuantice, o singură dată {#agent-register}

```bash
node agent.mjs register owner
node agent.mjs register gas
```

Fiecare cont pune pe lanț cheia lui publică ML-DSA-87, cu o dovadă de proprietate. De atunci ambele semnează fiecare tranzacție cu două chei.

### Pasul 4: leagă agentul, cu limite {#agent-link}

```bash
node agent.mjs link 1 3
```

Ownerul trimite **o** tranzacție, semnată cu ambele chei, care leagă cheia ed25519 a agentului de contul ownerului (cheia agentului semnează o dovadă că este de acord, deci nimeni nu poate lega o cheie care nu-i aparține), îi dă o permisiune (`send`), scrie o regulă de cheltuială (1 QOR pe plată, 3 QOR pe zi, doar `uqor`) și setează o expirare de 24 de ore. Adaugă un al treilea număr pentru alt număr de ore, cel mult 30 de zile. Ar trebui să vezi `agent linked` și `hybrid ML-DSA-87: verified`.

```bash
node agent.mjs rules
```

Citește de pe lanț ce impune acesta: regula, permisiunea, expirarea și câte plăți a făcut agentul. Despre cum funcționează legarea, vezi [Authenticators](/sdk/guides/authenticators).

### Pasul 5: lasă agentul să plătească facturile {#agent-run}

```bash
node agent.mjs run bills.json
```

Agentul încearcă să plătească cele cinci facturi din `bills.json`, 8,2 QOR în total. Pentru fiecare semnează o cerere cu cheia lui ed25519, iar portofelul de gaz o trimite. Ar trebui să vezi:

| Factură | Sumă | Rezultat | De ce |
| --- | --- | --- | --- |
| Server hosting | 0.8 | PAID | |
| Domain renewal | 0.5 | PAID | |
| Invoice from an unknown sender | 5 | REFUSED BY THE CHAIN | Peste limita de 1 QOR pe plată |
| API credits | 1 | PAID | |
| Monitoring | 0.9 | REFUSED BY THE CHAIN | Peste limita zilnică de 3 QOR: 2,3 cheltuiți, 0,7 rămași |

Refuzurile vin de la lanț, nu din codul agentului. Un detaliu în explorer: o plată refuzată apare totuși ca o tranzacție cu codul 0. Tranzacția în sine a fost acceptată într-un bloc, dar plata din interiorul ei a fost refuzată. `agent.mjs` citește rezultatul plății din interior, iar acela este ce afișează.

### Pasul 6: revocă agentul {#agent-revoke}

```bash
node agent.mjs revoke
```

O tranzacție de la owner oprește cheia agentului.

```bash
node agent.mjs pay qor1s90l5nnwfjznf4cdj3p4pf2p7uk32axf8800yu 0.1 "after revoke"
```

Încearcă încă o plată. Ar trebui să vezi `REFUSED BY THE CHAIN: linked key is unbound or revoked`. Așadar, dacă un agent este vreodată compromis, cel mult pierzi limita lui zilnică, iar o singură tranzacție îl oprește.

Ca să rulezi din nou demonstrația, mută `~/.config/qday/agent.env` în altă parte (după ce muți QOR-ul din portofelul de gaz) și rulează din nou `node agent.mjs init`.

Toate comenzile: `init`, `owner-init`, `whoami`, `register owner|gas`, `link <perTxQOR> <dailyQOR> [hours]`, `rules`, `pay <to> <QOR> [memo]`, `run <bills.json>`, `revoke`, `balance`. Poți schimba `QORE_REST`, `QORE_RPC` (propriul tău nod) și `QDAY_DIR` (unde stau fișierele cu chei) prin variabile de mediu.

## Partea 3: întreabă lanțul, cu MCP și qore-cli {#part-3}

Cod: [workshop-2/03-mcp](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/03-mcp). MCP (Model Context Protocol) este un mod standard prin care asistenții de programare și alte unelte AI folosesc unelte din exterior. Serverul MCP QoreChain, `@qorechain/mcp`, le dă **acces de citire** la lanț: blocuri, tranzacții, conturi, starea cheii post-cuantice a unui cont, estimări de taxe și simulări. Are 14 unelte. **Nu semnează niciodată, nu deține chei și nu transmite nimic pe lanț**: dacă ceri un transfer, îți dă un document nesemnat, pe care îl semnezi în propriul portofel.

### Adaugă-l în clientul tău MCP {#mcp-config}

Orice client MCP merge. Cele mai multe folosesc o configurație ca aceasta:

```json
{
  "mcpServers": {
    "qorechain": {
      "command": "npx",
      "args": ["-y", "@qorechain/mcp"]
    }
  }
}
```

`npx -y` descarcă serverul prima dată și îl pornește. Clientul listează apoi uneltele lui, de exemplu `get_pq_status`, `get_transaction`, `get_address_info`, `read_contract`, `estimate_fee`, `simulate_tx` și `prepare_transfer`.

### Aceleași întrebări din terminal {#mcp-cli}

`qore-cli` dă aceleași răspunsuri fără un client AI. Pune trei întrebări despre ce ai construit:

```bash
npx -y @qorechain/qore-cli pq status <hash of an agent payment>
```

A fost plata agentului semnată post-cuantic? Așteptat: `tier: pqc`, `verified: true`. Este o tranzacție nativă, semnată cu ambele chei și verificată de lanț.

```bash
npx -y @qorechain/qore-cli pq status <hash of the vault withdrawal>
```

Dar retragerea din seif? Așteptat: `tier: classical`, `reason: evm_lane`. Este un răspuns sincer: tranzacțiile în stil Ethereum nu poartă o semnătură post-cuantică. Sunt protejate de fereastra EVM și, aici, de contractul seifului, care verifică singur o semnătură ML-DSA-87.

```bash
npx -y @qorechain/qore-cli pq status <your 0x or qor1 address>
```

Dar contul? Așteptat: `registered: true`, `possession_proven: true` și fereastra EVM cu ce a mai rămas din ea.

### Un client vizual (opțional) {#mcp-inspector}

Ca să parcurgi uneltele cu clicuri, fără un asistent AI:

```bash
npx -y @modelcontextprotocol/inspector npx -y @qorechain/mcp
```

Apoi alege **Connect**, **Tools**, **List Tools**, selectează `get_pq_status`, pune o adresă sau un hash în `target` și alege **Run Tool**.

## Ce ai acum {#done}

Un contract care plătește doar împotriva unei semnături post-cuantice, un agent ale cărui limite le impune lanțul și uneltele ca să verifici cum a fost protejată orice tranzacție. Folosește oricare dintre ele ca bază pentru trimiterea ta: vezi [Build Before Q-Day](/build-before-qday/overview) pentru niveluri și reguli.
