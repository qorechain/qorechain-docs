---
slug: /dashboard/explorer
title: Explorer
sidebar_label: Explorer
sidebar_position: 2
---

# Explorer

**Explorer**-ul este fereastra doar pentru citire către lanț: caută blocuri, tranzacții, adrese și validatori și urmărește activitatea rețelei. Este pentru oricine vrea să verifice un transfer, să inspecteze un cont, să vadă ce semnătură a protejat o tranzacție sau să se uite la setul de validatori. Există două explorere: cel din interiorul Dashboard-ului, la `dashboard.qorechain.io/explorer`, și o aplicație publică separată la [explore.qore.network](https://explore.qore.network), care nu necesită cont. Sunt aplicații diferite și nu aplică aceleași reguli de etichetare, așa că această pagină le acoperă pe ambele.

## Inovații {#innovations}

- **O etichetă de semnătură doar când lanțul a verificat-o.** În Explorer-ul din Dashboard, o tranzacție nativă afișează cardul **PQC Verified** doar dacă a reușit (cod 0) **și** lanțul a emis un eveniment `pqc_hybrid_verify` cu starea verificat. O tranzacție eșuată nu primește nicio afirmație post-cuantică.
- **Tranzacțiile EVM arată fereastra care le-a autorizat.** De la înălțimea de activare (testnet 5,920,000; mainnet 2,981,742), o tranzacție EVM afișează „Authorised by a PQC window", cu un link „Window opened by" către tranzacția nativă, semnată ML-DSA-87, care a deschis-o. Fereastra afișată este ultima deschidere de fereastră a expeditorului, la sau sub înălțimea tranzacției, care nu a expirat și nu a fost închisă între timp. O tranzacție EVM nu este niciodată etichetată „PQC Verified": poartă o semnătură secp256k1 obișnuită. Vezi [Fereastra de autorizare EVM](/developer-guide/evm-development#evm-window).
- **Nicio etichetă post-cuantică per bloc.** Blocurile sunt semnate cu chei de consens, așa că protecția este afișată per tranzacție, niciodată per bloc.
- **Starea post-cuantică a validatorului, din lanț.** Pagina de adresă a unui validator are un câmp „Post-Quantum Crypto" (Enabled, Disabled sau N/A). Enabled înseamnă că operatorul are o cheie ML-DSA-87 înregistrată. Dovada de posesie este opțională pe lanț.
- **Un cont, trei rail-uri.** Un istoric `qor1...` reunește activitatea nativă, EVM și SVM, iar pagina adresei arată suma încă aflată în vesting și data următoarei deblocări.
- **Fapte despre rețea și endpoint-uri într-un singur panou.** Chain ID, EVM chain ID, token, zecimale, prefix de adresă, coin type, prețul minim al gazului și endpoint-uri publice copiabile, cu un panou „Add QoreChain to your wallet".
- **Explorer-ul independent este construit doar pe endpoint-urile publice.** [explore.qore.network](https://explore.qore.network) citește endpoint-urile publice ale lanțului și nu necesită cont. Pagina sa de adresă arată formele `qor1`, `0x` și SVM ale unui singur cont, cu o verificare de paritate live (wei = uqor x 10^12; lamports = uqor x 1000), iar rutele sale funcționează ca deep link-uri pentru portofele.

## Cum folosești {#how-to-use}

### Prezentare generală

Deschide **Explorer** din bara laterală. Prezentarea generală arată:

- starea rețelei, cu un chip „Post-Quantum Secured" (o etichetă la nivel de rețea; afirmația per tranzacție se află pe pagina tranzacției);
- **Latest Block**, **Block Time** și **Blocks Today**;
- **Total Bonded**, **Bonded Ratio** și **Circulating**;
- **Transactions**, **Real Txs**, **Active Set** și **Total Addresses**;
- **Latest Blocks** și **Latest Transactions**, cu butoane de reîmprospătare și reîmprospătare automată.

Apasă pe un rând de bloc sau de tranzacție pentru a-i deschide pagina.

### Căutare

Caseta de căutare (placeholder „Search QoreChain (Address, Tx, Block)...") te direcționează după ce tastezi:

- `qor...` deschide pagina adresei.
- `0x...` sau un șir de 64 de caractere deschide pagina tranzacției.
- Cifrele deschid pagina blocului.

:::note O adresă 0x ajunge la „Transaction Not Found"
Căutarea din Dashboard tratează intrarea `0x...` drept hash de tranzacție. Pentru a căuta o adresă EVM, caut-o în forma ei `qor1...` (o adresă `0x` are aceiași 20 de octeți ca forma ei `qor1`) sau folosește [explore.qore.network](https://explore.qore.network), a cărui pagină de adresă le acceptă pe amândouă.
:::

### Pagina tranzacției

Pagina tranzacției arată hash-ul (cu copiere), starea și tipul, Block Height, Interactions (From și To), Value & Fees, Memo, Gas Consumed, un rând cross-chain când există unul și **Raw Data**. Arată și ce a protejat tranzacția și face doar afirmații pe care lanțul le susține:

- **PQC Verified.** O tranzacție de pe lane-ul nativ care a reușit și a cărei semnătură hibridă (inclusiv partea ML-DSA-87) a fost verificată de lanțul însuși. O tranzacție eșuată sau una fără o semnătură hibridă verificată afișează în schimb securitate standard.
- **Authorised by a PQC window.** O tranzacție EVM trimisă cât timp expeditorul avea deschisă o [fereastră de autorizare EVM](/developer-guide/evm-development#evm-window), cu link-ul **Window opened by**.

### Pagina blocului

Săgețile anterior și următor parcurg lanțul. **Core Information** conține înălțimea, hash-ul, proponentul, numărul de semnături și Gas Used; urmează **Technical Hashes** și **Block Transactions**. Blocurile nu poartă nicio etichetă post-cuantică.

### Pagina adresei

O adresă QoreChain este un singur cont cu trei codificări, Native (`qor1...`), EVM (`0x...`) și SVM (base58), iar pagina adresei reunește activitatea din toate trei.

- **Copy address** și **Show QR Code** (un popover; nu există descărcare).
- **Total Balance** și **Available**, plus o linie pentru suma încă aflată în vesting cu data următoarei deblocări.
- **Total Activity** și istoricul combinat (metode precum Transfer, Faucet Claim și Cross-Chain Swap).
- Pe pagina de adresă a unui validator (`/explorer/address/qorvaloper1...`), câmpul **Post-Quantum Crypto**.

### Validatori {#validators}

`/explorer/validators` listează validatorii rețelei. Cardurile rezumative arată **Active Validators**, **Bonded Tokens** și **Consensus Health** (o etichetă de stare, nu o valoare măsurată). Tabelul are Rank, Validator, Voting Power, Commission, Status și PQC (coloana PQC din tabel este estompată pentru fiecare rând; folosește pagina de adresă a validatorului pentru starea reală). Caseta de căutare scrie „Search validator...". Lista urmează rețeaua selectată în antet. Pentru a delega, vezi [Staking și Validatori](/dashboard/staking-and-validators); pentru o comparație mai largă, cu randament și autentificare, vezi [Validators](/dashboard/validators).

### Fapte despre rețea și adăugarea în portofel

Prezentarea generală conține faptele despre lanț și endpoint-urile publice, fiecare copiabil, precum și același panou **Add QoreChain to your wallet** ca pagina Wallet (vezi [Adaugă QoreChain în portofelul tău](/dashboard/wallet#add-network)).

### Explorer independent {#standalone-explorer}

[explore.qore.network](https://explore.qore.network) este o aplicație web separată, doar pentru explorer. Se deschide pe **mainnet** și are în antet un comutator **Testnet / Mainnet**. Rute:

| Rută | Ce arată |
| --- | --- |
| `/` | Înălțime live, stare, ofertă, stake bonded, ultimele blocuri și tranzacții, fapte despre lanț, endpoint-uri publice și linkuri către ghiduri. |
| `/blocks`, `/block/{height}` | Lista de blocuri și un bloc cu tranzacțiile sale. |
| `/txs`, `/tx/{hash}` | Lista de tranzacții și o tranzacție cu stare, comision, gaz, mesaje și răspunsul brut. |
| `/address/{qor1... or 0x...}` | Pagina unificată de identitate, cu cele trei codificări și verificarea de paritate. `/account/*` redirecționează către `/address/*`. |
| `/validators`, `/validator/{address}` | Setul de validatori cu puterea de vot și comisionul, și un validator. |
| `/tokens`, `/token/{denom}`, `/assets` | Liste de tokenuri și active. |
| `/contracts`, `/nfts`, `/collections` | Contracte, NFT-uri și colecții. |

Căutarea acceptă o înălțime de bloc, un hash de 64 de caractere hex (cu sau fără `0x`), o adresă `qor1...` sau `0x...` ori o adresă `qorvaloper1...`. O căutare `qorvaloper1...` deschide lista de validatori, nu pagina acelui validator. O secțiune **Add to wallet** oferă suggestChain (Keplr, Leap, Cosmostation), EIP-3085 (MetaMask și alte portofele EVM), instrucțiuni de custom-RPC pentru SVM și asocierea WalletConnect v2.

Rutele `/tx/`, `/block/` și `/address/` funcționează cu linkurile de block-explorer EIP-3085, astfel încât portofelele care deschid un URL de explorer ajung pe pagina potrivită.

:::caution Nu folosi /api/lcd al explorer-ului din cod
Explorer-ul independent are un proxy doar pentru citire la `/api/lcd/...`, care servește propriile pagini și răspunde în funcție de cookie-ul de rețea al browserului. Nu este un API public: se poate schimba, nu este dimensionat pentru utilizare programatică și returnează rețeaua pe care o numește cookie-ul. Pentru scripturi, servicii și portofele folosește în schimb endpoint-urile REST publice: `https://api.qore.host` (mainnet) și `https://api-testnet.qore.host` (testnet). Vezi [Endpoint-uri REST și gRPC](/api-reference/rest-grpc-endpoints).
:::

:::note Explorer-ul independent nu aplică încă regulile de etichetare PQC ale Dashboard-ului
Regulile din [Inovații](#innovations) (o etichetă post-cuantică doar după verificarea de către lanț și cardul „Authorised by a PQC window" pentru tranzacțiile EVM) sunt live în Explorer-ul din Dashboard. Explorer-ul independent de la explore.qore.network nu a fost actualizat pentru ele: pagina sa de tranzacție afișează un marcaj de semnătură hibridă care nu distinge încă o tranzacție eșuată și etichetează tranzacțiile EVM cu formularea sa mai veche. Consideră etichetele Explorer-ului din Dashboard drept referință.
:::

## Cum accesezi {#how-to-access}

- **Explorer-ul din Dashboard:** [dashboard.qorechain.io/explorer](https://dashboard.qorechain.io/explorer). Alege rețeaua în antet. **Prezentarea generală** pe mainnet necesită autentificare și [confirmarea unică](/dashboard/overview#risk-acknowledgement); prezentarea generală pe testnet și **toate paginile de detaliu** (tranzacție, bloc, adresă, validatori) pe ambele rețele se deschid fără cont.
- **Explorer-ul independent:** [explore.qore.network](https://explore.qore.network). Fără cont, fără portofel. Folosește comutatorul din antet pentru testnet.
- **Cost:** gratuit. Nu este nevoie de conectarea unui portofel pentru a citi ceva.

## Unde este publicat {#where-published}

| Suprafață | Adresă | Rețele | Cont |
| --- | --- | --- | --- |
| Explorer în Dashboard | `dashboard.qorechain.io/explorer` (`/explorer/tx/<hash>`, `/explorer/block/<height>`, `/explorer/address/<address>`, `/explorer/validators`) | Mainnet și testnet, comutator în antet | Doar prezentarea generală pe mainnet |
| Explorer independent | `explore.qore.network` | Mainnet (implicit) și comutator pentru testnet | Niciunul |
| Date de lanț | `api.qore.host`, `api-testnet.qore.host` (REST), `rpc.qore.host`, `rpc-testnet.qore.host` (RPC) | Mainnet și testnet | Niciunul |

## Limite și probleme cunoscute {#limits}

- **O adresă `0x` tastată în căutarea din Dashboard** ajunge la „Transaction Not Found". Folosește forma `qor1...`.
- **Coloana PQC** din tabelul de validatori al Dashboard-ului este mereu estompată. Starea reală a unui validator se află pe pagina sa de adresă.
- **Nu se afișează:** un contor de utilizare a ferestrei per tranzacție, demonstrații post-cuantice pentru blocuri și un indicator post-cuantic per validator în tabelul de validatori.
- **Explorer-ul independent** nu a adoptat încă regulile de etichetare ale Dashboard-ului (vezi mai sus), iar o căutare `qorvaloper1...` deschide lista de validatori.
- **/api/lcd al explorer-ului independent** este pentru site-ul însuși, nu pentru programe.
- **Rețeaua urmează antetul** în Explorer-ul din Dashboard: un hash din cealaltă rețea afișează „not found".
