---
slug: /dashboard/quests
title: Misiuni
sidebar_label: Misiuni
sidebar_position: 10
---

# Misiuni

**Misiunile** sunt sarcini ghidate care te conduc prin utilizarea QoreChain pe măsură ce le finalizezi. O misiune grupează unul sau mai mulți pași, precum alimentarea unui portofel, efectuarea unui transfer sau conectarea unui cont, și te recompensează la finalizare. Această pagină acoperă și celelalte pagini din grupul **Earn** al barei laterale și arcade-ul: **Leaderboard**, **Badges** și **Games**. Toate sunt pentru membrii comunității care vor o modalitate practică de a învăța rețeaua și de a-și aduna progresul.

## Inovații {#innovations}

- **Finalizare verificată, nu autoraportată.** O misiune se contorizează când verificarea ei trece. Eigenstate 2 precizează tipul de verificare la fiecare misiune: **cont conectat**, **portofel conectat**, **link de dovadă**, **revizuire de echipă** sau **quiz**.
- **Misiunile sociale se contorizează doar pentru conturi verificate.** O misiune care implică X, Telegram sau Discord (iar, pentru verificările de cont conectat din Eigenstate 2, și YouTube și GitHub) se contorizează abia după ce ai conectat contul în **Profil** și conexiunea este verificată. Până atunci pagina afișează *Connect Social Accounts* cu un link **Go to Profile**.
- **Condițiile prealabile sunt impuse.** O misiune blocată spune ce trebuie finalizat mai întâi ("Complete "..." first").
- **Statusuri clare.** Started, Pending Verification, Pending Review, Failed și Completed, astfel încât o misiune care așteaptă o revizuire umană nu este afișată ca eșuată.
- **Două sezoane într-o singură pagină.** Filele **Eigenstate 1** și **Eigenstate 2** au seturi proprii de misiuni și categorii proprii.

## Cum se folosește {#how-to-use}

### Răsfoiește misiunile

Deschide **Quests** (bara laterală **Earn**). Un rezumat arată câte misiuni sunt disponibile, în desfășurare și finalizate. **Filele de categorii** filtrează lista:

- Eigenstate 1: Onboarding, Trading, Social, Community, Learning, Daily și Weekly.
- Eigenstate 2: Social, Exchanges, Developer, Educational, Korea/Asia, On-Chain și Other.

O categorie goală afișează "No quests in this category yet." Fiecare card de misiune arată o pictogramă, un titlu și o scurtă descriere, o insignă de **dificultate**, un timp estimat, **recompensa** (în QOR sau în puncte eigenvalue, λ) și un status (finalizată, în desfășurare, începută sau blocată).

### Finalizează o misiune Eigenstate 1

1. Deschide o misiune și selectează **Start Quest** (ulterior **Continue Quest**).
2. Parcurge sarcinile. O sarcină oferă **Go to Action** (către pagina relevantă din Dashboard) și **Complete** (pentru a confirma un pas, astfel încât să poată fi verificat).
3. O bară de progres urmărește sarcinile finalizate.
4. Când toate sarcinile sunt gata, selectează **Check Completion** pentru a verifica misiunea și a primi recompensa.

Misiunile zilnice și săptămânale se resetează după un program; pagina de detalii afișează cadența de resetare și seria ta curentă. O solicitare la [Faucet](/dashboard/faucet) se contorizează pentru misiunile faucet.

### Finalizează o misiune Eigenstate 2

1. Deschide misiunea și citește tipul ei de verificare.
2. Folosește butonul pe care îl oferă misiunea. Care apare depinde de tipul de verificare și de statusul curent: **Verify**, **Submit**, **Resubmit**, **Retry verification** sau **Re-check status**.
3. Urmărește cum statusul trece prin Started, Pending Verification sau Pending Review, apoi Completed (sau Failed).

### Leaderboard {#leaderboard}

`/leaderboard` clasifică oamenii după punctele eigenvalue (λ), cu un top trei, statistici ale comunității și o casetă de căutare. Este un clasament off-chain.

### Badges {#badges}

`/badges` este un catalog de 12 serii de insigne. **Check Badges** reevaluează progresul tău. Un **Badge Widget** îți oferă un fragment iframe, BBCode sau Markdown cu **Copy Code** pentru a afișa o insignă în altă parte. O serie Bridge apare în listă deși puntea nu este activă.

### Games {#games}

`/games` este **QoreChain Arcade**, cu 12 jocuri: Quantum Space Miner, Quantum Runner, Chain Breaker, Token Rush, Block Defense, Node Puzzle, Quantum Stack, Hash Breaker, Qubit Bounce, Consensus Race, Quantum Maze și Wave Coder. Selectează **Play Now** pe un card; scorul tău (Photons, γ) este trimis când jocul se termină. Scorurile sunt păstrate off-chain.

## Cum se accesează {#how-to-access}

- **URL-uri:** [dashboard.qorechain.io/quests](https://dashboard.qorechain.io/quests), `/leaderboard`, `/badges`, `/games`.
- **Autentificare:** necesară pentru toate. `/quests` redirecționează către autentificare când nu ești autentificat; Leaderboard, Badges și Games afișează un ecran "Authentication Required".
- **Rețea:** niciuna nu urmează comutatorul de rețea.
- **Portofel:** nu este necesar niciunul, dar misiunile care implică tranzacții au nevoie de un portofel de testnet alimentat (vezi [Wallet](/dashboard/wallet#testnet) și [Faucet](/dashboard/faucet)); misiunile sociale au nevoie de conturi conectate.
- **Cost:** gratuit.

## Unde este publicat {#where-published}

| Pagină | Adresă | Cont |
| --- | --- | --- |
| Quests (Eigenstate 1 și 2) | `dashboard.qorechain.io/quests` | Autentificare |
| Leaderboard | `dashboard.qorechain.io/leaderboard` | Autentificare |
| Badges | `dashboard.qorechain.io/badges` | Autentificare |
| Games | `dashboard.qorechain.io/games` | Autentificare |

## Limite și probleme cunoscute {#limits}

- **Seturile de misiuni se schimbă.** Fila unui sezon poate fi goală sau poate arăta mai puține misiuni atunci când misiunile ei nu sunt active; verifică fila în loc să te bazezi pe această pagină pentru lista curentă.
- **Totul aici este off-chain:** punctele, clasamentele, insignele și scorurile jocurilor sunt înregistrate de Dashboard, nu pe QoreChain. Photonii nu sunt on-chain.
- **Sumele recompenselor** sunt afișate la fiecare misiune și se pot schimba.
- **Autentificarea** și, pentru misiunile sociale, conturile conectate verificate sunt necesare.
- **Public Sale** (`/public-sale`) este o pagină separată pentru participanții existenți (alocare, calendar de vesting, claim); toate rundele anterioare sunt închise, iar pagina nu este descrisă mai departe aici.
- **FAQ** (`/faq`) este o scurtă pagină de ajutor din aplicație; acest manual este referința.

## Înrudite

- [Prezentare generală și primii pași](/dashboard/overview) - autentifică-te și conectează-ți portofelul înainte de a începe misiunile.
- [Faucet](/dashboard/faucet) - alimentează un portofel de testnet pentru misiunile care implică tranzacții.
