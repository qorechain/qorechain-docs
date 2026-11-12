---
slug: /developer-guide/account-abstraction
title: Abstractizarea Contului
sidebar_label: Abstractizarea Contului
sidebar_position: 7
---

# Abstractizarea Contului

QoreChain oferă **abstractizare de cont la nivel de protocol** prin modulul `x/abstractaccount`. Modulul înregistrează conturi abstracte cu reguli de cheltuieli și permite proprietarului contului să conecteze chei externe (**autentificatori**) care pot cheltui din cont în limitele permisiunilor și ale plafoanelor de cheltuieli, fără infrastructură externă de contracte inteligente.

:::danger Neactivat pe mainnet; activat pe testnet
Modulul de conturi abstracte este **oprit pe mainnet-ul `qorechain-vladi`** la momentul redactării (verificat la 27 octombrie 2026): `qorechaind query abstractaccount config` (și `GET /qorechain/abstractaccount/v1/config`) raportează `enabled: false`. Pe **testnet-ul `qorechain-diana`** a fost pornit printr-o decizie de guvernanță (propunerea 18, adoptată pe 27 octombrie 2026) și raportează `enabled: true`. Începând cu chain v3.2.0, indicatorul este aplicat pe fiecare cale: acolo unde este `false`, chain-ul refuză crearea de conturi, înregistrarea autentificatorilor și ambele lane-uri de execuție (`MsgExecuteEVM`, `MsgExecuteCosmos`) cu mesajul `abstract accounts are disabled on this chain`. Nicio tranzacție obișnuită nu poate porni modulul; setarea se schimbă doar printr-o decizie de guvernanță. Nicio tranzacție de cont abstract nu a fost vreodată inclusă pe mainnet. Tot ce urmează descrie interfețele modulului; încercați-l pe testnet și nu construiți un flux de cheie conectată sau de cheltuieli delegate pentru mainnet până când modulul nu este activat acolo. Verificați întotdeauna mai întâi indicatorul.
:::

:::note
Comenzile de mai jos folosesc mainnet-ul **`qorechain-vladi`** (activ din 7 iunie 2026), care rulează versiunea de nod **v3.2.6** (aplicată la înălțimea 4,020,000 pe 4 noiembrie 2026, propunerea de guvernanță 15; v3.2.5 a fost aplicată la înălțimea 3,906,833 pe 29 octombrie 2026, propunerea 14, iar v3.2.4 la înălțimea 3,742,566 pe 23 octombrie 2026). Înlocuiți cu `--chain-id qorechain-diana` pentru testnet, care rulează v3.2.8 (din 12 noiembrie 2026; v3.2.4 din 19 octombrie 2026).
:::

:::caution Fiecare tranzacție pe lane-ul Cosmos necesită cosemnătura hibridă post-cuantică
Exemplele `qorechaind tx` de pe această pagină arată doar flag-urile de taxă. Pe rețelele live, fiecare tranzacție pe lane-ul Cosmos trebuie să poarte și cosemnătura hibridă ML-DSA-87, așa că construiți tranzacția cu `--generate-only` și semnați-o cu `qorechaind tx pqc cosign` (sau folosiți QoreX ori SDK-ul, care fac acest lucru pentru dvs.). Build-ul comunitar al `qorechaind` nu poate produce acea semnătură; folosiți binarul de release din [manifestul de descărcare](/developer-guide/running-a-node#fetch-the-manifest). Pragul minim al taxei este **0.1 uqor per unitate de gaz**, deci `--gas 400000` necesită cel puțin `--fees 40000uqor`. Consultați [Semnarea Post-Cuantică](/developer-guide/post-quantum-signing).
:::

## Prezentare Generală

Conturile blockchain tradiționale sunt controlate de o singură cheie privată. Abstractizarea contului decuplează conceptul de „cine poate autoriza o tranzacție” de o singură cheie criptografică. Modulul `x/abstractaccount` oferă:

* **Conturi abstracte** cu un tip de cont și un proprietar înregistrate
* **Reguli de cheltuieli** (limite per tranzacție și zilnice, denominări permise) care limitează cât pot cheltui cheile conectate (autentificatori și chei de sesiune); nu limitează cheia proprie a titularului
* **Autentificatori**: chei externe (o cheie Phantom ed25519 sau o adresă MetaMask secp256k1) pe care proprietarul le conectează cu permisiuni limitate și o expirare și pe care le poate revoca oricând

*Un flux cu cheie conectată (autentificator): cheia conectată semnează o autorizare, un releu o trimite, modulul verifică permisiunile, expirarea și regulile de cheltuieli, apoi execută din contul proprietarului.*

```mermaid
flowchart TD
    A["Proprietarul conectează o cheie externă<br/>(permisiuni limitate + expirare)"] --> B["Cheia conectată semnează<br/>o autorizare"]
    B --> C["Releul trimite și plătește<br/>tranzacția"]
    C --> D{"Validare autentificator"}
    D -- "permisiune acordată?<br/>neexpirat?<br/>nonce proaspăt?" --> E{"Validare regulă de cheltuieli"}
    D -- "eșuează" --> R["Respinge tranzacția"]
    E -- "limită per tx + zilnică<br/>denominare permisă" --> F["Execută din contul proprietarului"]
    E -- "depășește limita" --> R
    F --> G["Autentificatorul expiră<br/>sau proprietarul îl revocă"]
```

## Tipuri de Cont

`create` înregistrează unul dintre trei tipuri de cont. Tipul este stocat în cont și face parte din modul în care se derivă adresa acestuia; modulul nu are tranzacții proprii de multisig, chei de sesiune sau recuperare (serviciul de tranzacții este `create`, `update-rules`, `register-authenticator`, `revoke-authenticator`, `execute-cosmos`, `execute-evm`).

| Tip                | Utilizare prevăzută                |
| ------------------ | ---------------------------------- |
| `multisig`         | Trezorerii DAO, portofele partajate |
| `social_recovery`  | Portofele pentru consumatori, onboarding |
| `session_based`    | Sesiuni dApp, portofele mobile     |

## Crearea unui Cont Abstract

`create` primește tipul de cont ca argument pozițional (`multisig`, `social_recovery` sau `session_based`):

```bash
qorechaind tx abstractaccount create session_based \
  --from mykey \
  --gas 400000 --fees 40000uqor
```

Comanda nu are flag-uri pentru semnatari, praguri sau gardieni.

## Autentificatori (chei conectate)

Mecanismul de chei delegate al modulului este **autentificatorul**, descris mai jos în [Autentificatori de Portofel Conectat](#authenticators): proprietarul conectează o cheie externă (ed25519 sau secp256k1) cu un set de permisiuni și o expirare și o revocă oricând:

```bash
qorechaind tx abstractaccount register-authenticator <account-address> <scheme> <pubkey-base64> <permissions-csv> <expiry-unix> <label> \
  --from mykey --gas 400000 --fees 40000uqor
qorechaind tx abstractaccount revoke-authenticator <account-address> <scheme> <pubkey-base64> \
  --from mykey --gas 400000 --fees 40000uqor
```

`scheme` este `ed25519` (de exemplu Phantom) sau `secp256k1` (de exemplu MetaMask). Nu există comenzile `grant-session`, `revoke-session` sau `query abstractaccount sessions`.

## Reguli de Cheltuieli

Regulile de cheltuieli adaugă limite de siguranță financiară pentru autentificatorii și cheile de sesiune conectate la un cont abstract. Regulile de cheltuieli leagă doar autentificatorii și cheile de sesiune, nu cheia proprie a titularului; cheia titularului este limitată, pe banda EVM, de [fereastra de autorizare EVM](/getting-started/first-transaction#evm-window).

Câmpurile regulii:

| Regulă            | Descriere                                                         |
| ------------------ | ------------------------------------------------------------------ |
| `daily_limit`      | Cheltuiala totală maximă pe zi calendaristică UTC                  |
| `per_tx_limit`     | Cheltuiala maximă per execuție individuală autorizată              |
| `allowed_denoms`   | Restricționează denominările de token care pot fi cheltuite (un ERC-20 este listat ca `erc20/<EIP-55 0x address>`, scrierea proprie a regulii de cheltuieli, cu bară oblică; lanțul compară adresa în forma ei EIP-55, deci majusculele pe care le tastați nu creează un alt token. Aceasta nu este denominația bank a unei perechi de tokenuri înregistrate, care se scrie `erc20:<EIP-55 0x address>` cu două puncte și este sensibilă la majuscule, vezi [Dezvoltare EVM](/developer-guide/evm-development#fest-tokens)) |
| `denom_limits`     | Limite per denominare ca șiruri zecimale (v3.2.2): `{"denom","per_tx_limit","daily_limit"}`; înlocuiesc `per_tx_limit` și `daily_limit` pentru denominările pe care le numesc, astfel încât un token cu 18 zecimale poate fi plafonat |
| `allowed_evm_calls` | Apeluri EVM pe care o cheie legată de regulă le poate face **cu date de apel** (v3.2.2), ca `0x<target>` (orice funcție a acelui contract) sau `0x<target>/0x<selector>` (doar acea funcție). Fără o intrare, o cheie legată de regulă poate doar să trimită valoare, să desfășoare contracte (cu permisiunea `deploy`) și să mute tokenii ERC-20 listați în `allowed_denoms`. Listarea unei ținte presupune încredere în fiecare argument al apelurilor făcute către ea, destinatarii incluși |

### Setarea Regulilor de Cheltuieli

`update-rules` înlocuiește regulile contului cu un array JSON de obiecte `SpendingRule` (JSON inline, nu un fișier și nu flag-uri):

```bash
qorechaind tx abstractaccount update-rules <account-address> \
  '[{"id":"daily","enabled":true,"daily_limit":1000000000,"per_tx_limit":100000000,"allowed_denoms":["uqor"]}]' \
  --from mykey --gas 400000 --fees 40000uqor
```

Limitele sunt exprimate în unitatea de bază (`uqor`) și se contorizează per execuție autorizată; limita zilnică plafonează totalul pe zi calendaristică UTC. Regulile înlocuiesc în bloc regulile stocate, deci un câmp omis este eliminat. Începând cu v3.2.2, lane-ul EVM măsoară ce mută efectiv un apel (valoarea nativă, scăderea soldului nativ al contului, monedele bancare cheltuite și modificarea soldului sau a alocației fiecărui ERC-20 listat) în loc de doar `msg.value`, iar crearea de contracte necesită permisiunea separată `deploy`. Un exemplu mai bogat (ERC-20 afișat este tokenul de test fUSD de pe testnet; folosiți adresa contractului propriului token și rețineți bara oblică din `erc20/<address>` într-o regulă față de cele două puncte din denominația bank `erc20:<address>`):

```bash
qorechaind tx abstractaccount update-rules <account-address> \
  '[{"id":"daily","enabled":true,"daily_limit":5000000,"allowed_denoms":["uqor","erc20/0x97143B771D34ddb9130b807b135Ae675A5a963CA"],"allowed_evm_calls":["0xROUTER/0x38ed1739"],"denom_limits":[{"denom":"erc20/0x97143B771D34ddb9130b807b135Ae675A5a963CA","per_tx_limit":"100000000000000000000","daily_limit":"500000000000000000000"}]}]' \
  --from mykey --gas 400000 --fees 40000uqor
```

### Interogarea Regulilor Curente

Înregistrarea contului include regulile sale și numărul de chei conectate:

```bash
qorechaind query abstractaccount account <account-address>
```

Începând cu v3.2.8 (doar pe testnet până la un upgrade ulterior de mainnet), o cheie cu permisiuni de valoare este refuzată la înregistrare și la execuție dacă nu este limitată de o regulă, deci „nicio limită” nu se mai aplică unor astfel de chei.

:::caution O regulă limitează o cheie doar dacă există una
Chain-ul determină limita în această ordine: regula proprie a autentificatorului, dacă este setată și `enabled`; altfel prima regulă `enabled` de pe cont; altfel **nu există nicio limită**. O regulă stocată cu `enabled: false` înseamnă lipsa limitei, nu o limită zero. `MsgRegisterAuthenticator` nu poartă nicio regulă, deci o cheie conectată doar prin acel mesaj este limitată numai de o regulă la nivel de cont. Setați o regulă în mod deliberat cu `update-rules` și înregistrați doar permisiunile de care cheia are nevoie. O limită restrânge paguba pe care o poate face o cheie conectată; nu înlocuiește revocarea cheii.
:::

## Autentificatori de Portofel Conectat — Cheltuieli Delegate {#authenticators}

Designul autentificatorilor a fost introdus în versiunea de chain **v3.1.85** (bazat pe modelul de permisiuni v3.1.84). **Nu poate fi folosit pe mainnet cât timp modulul este dezactivat acolo**, și este disponibil pe testnet, unde modulul este activat (vezi caseta de stare de la începutul acestei pagini). O **cheie de portofel extern conectată** — o cheie Phantom (ed25519) sau un cont MetaMask (secp256k1) — poate **cheltui din contul canonic post-cuantic** în condiții de privilegiu minim, cu limite de cheltuieli și revocabile. Cheia externă nu produce niciodată o semnătură ML-DSA; un **releu (relayer)** trimite și plătește plicul tranzacției (semnătura hibridă PQC proprie a releului satisface cerințele de semnare ale chain-ului), în timp ce semnătura autentificatorului asupra **octeților de semnare separați pe domeniu, legați de protecția anti-replay** reprezintă autorizarea.

### Înregistrarea unui autentificator {#register-authenticator}

Proprietarul contului înregistrează cheia externă cu `MsgRegisterAuthenticator` (o tranzacție obișnuită cu cheia rădăcină), acordându-i o schemă, permisiuni, o expirare și limite de cheltuieli opționale:

```js
import { registerEthAuthenticatorMsg } from "@qorechain/wallet-adapter";

// Link a MetaMask account by its 20-byte address (EIP-191 verification):
const msg = registerEthAuthenticatorMsg({
  owner: "qor1owner...",              // the canonical account (signs this message)
  ethAddress: "0xAbC...123",          // the MetaMask address to link
  permissions: ["evm"],               // least privilege — see the taxonomy below
  expiryUnix: Math.floor(Date.now() / 1000) + 30 * 24 * 3600, // absolute Unix seconds, ≤ 30 days recommended
  label: "metamask",
});
// Limits are a separate message (MsgUpdateSpendingRules), see "Spending Rules" above.
// Sign & broadcast this msg with the OWNER's normal hybrid-PQC signer.
```

**Începând cu release-ul v3.2.8 (doar pe testnet până la un upgrade ulterior de mainnet), înregistrarea necesită încă două lucruri.**

1. **O dovadă de posesie.** `MsgRegisterAuthenticator` are un câmp obligatoriu `possession_proof` (câmpul 8): o semnătură a cheii care se conectează, care dovedește că este de acord cu legătura. Cheia semnează acest text simplu în propria schemă, astfel încât un portofel de browser arată utilizatorului ce semnează (Phantom `signMessage`, MetaMask `personal_sign`); o cheie secp256k1 de 33 de octeți semnează SHA-256 al textului:

   ```text
   QoreChain authenticator link v1
   chain: <chain-id>
   account: <bech32 account>
   scheme: <scheme>
   key: <lowercase hex of the public key, or of the 20-byte address>
   ```

   Textul numește chain-ul, contul, schema și cheia, deci o dovadă nu poate fi reutilizată pentru alt chain, cont sau cheie. O înregistrare fără o dovadă validă este refuzată.
2. **O regulă de cheltuieli pentru cheile de valoare.** O cheie ale cărei permisiuni pot muta valoare (`send`, `evm`, `svm`, `deploy`, `all`) are nevoie de o regulă de cheltuieli care limitează fiecare denominație pe care o poate cheltui, setată cu `MsgUpdateSpendingRules` înainte de legare sau odată cu ea. Aceeași regulă este aplicată la execuție pentru cheile conectate înainte de upgrade, deci adăugați reguli și pentru ele.

Din cod, SDK 0.14.0 are helperele pentru ambele (TypeScript: `signAuthenticatorLinkPhantom`, `signAuthenticatorLinkMetaMask`, `signAuthenticatorLinkEd25519`, `signAuthenticatorLinkSecp256k1`, `signAuthenticatorLinkEip191` pentru dovadă; `linkAuthenticatorMsgs` pentru regula de cheltuieli și legare într-o singură tranzacție semnată de proprietar), iar `@qorechain/wallet-adapter` 0.6.0 are `phantomPossessionProof`, `metaMaskPossessionProof` și `linkAuthenticatorMsgs`. Vedeți [Legarea de la lanțul v3.2.8](/sdk/guides/authenticators#link-v328). Pentru cazul unei execuții eșuate, `assertAuthenticatorExecutionsSucceeded` aruncă o eroare la `success=false`. `linkAuthenticatorMsgs`, `metaMaskPossessionProof` și `revokeAuthenticatorMsg` au fost rulate pe testnet (vedeți [Ce a fost verificat](#link-example-checks)); helperele Phantom și ed25519 nu au fost rulate.

O cheie Phantom este înregistrată în același mod, cu schema `ed25519` și cheia publică Phantom (`register-authenticator` în CLI). Revocarea este instantanee prin `MsgRevokeAuthenticator`.

**O execuție poate eșua în interiorul unei tranzacții reușite.** Începând cu v3.2.8 (doar pe testnet până la un upgrade ulterior de mainnet), un `MsgExecuteEVM` sau `MsgExecuteCosmos` eșuat returnează `success=false` în răspunsul său cu codul de tranzacție 0, emite evenimentul `abstractaccount_execution_failed` cu motivul și consumă totuși nonce-ul autentificatorului. Un client care verifică doar codul tranzacției va raporta un astfel de apel ca fiind reușit: citiți răspunsul sau evenimentul.

### Taxonomia permisiunilor {#permission-taxonomy}

Unsprezece permisiuni canonice controlează ce poate face un autentificator înregistrat. Maparea este **fail-closed** (implicit blocată): un tip de mesaj fără mapare este refuzat.

| Permisiune | Acordă |
| --- | --- |
| `send` | Transferuri bancare pe lane-ul nativ |
| `delegate` / `withdraw` / `vote` | Staking, retragerea recompenselor, guvernanță |
| `evm` / `wasm` / `svm` | Execuție pe lane-ul VM respectiv |
| `amm` / `ibc` / `deploy` | Operațiuni AMM, transferuri IBC, desfășurare de contracte |
| `all` | Orice mesaj *delegabil* |

**Mesajele de gestionare a cheilor nu sunt niciodată delegabile** — `MsgRegisterAuthenticator`, `MsgRevokeAuthenticator`, înregistrarea/migrarea cheii PQC și `MsgRotatePQCKey` necesită întotdeauna cheia rădăcină, astfel încât o cheie conectată nu își poate escalada niciodată propriile privilegii. Schema (`schema_version` 2) listează și `lane_rules`: crearea unui contract de la adresa contului, un apel care avansează nonce-ul EVM al contului și un apel către contul însuși atunci când codul său este o delegare EIP-7702 necesită fiecare permisiunea `deploy` sau `all`. Începând cu v3.2.3, înregistrarea refuză șirurile de permisiuni necunoscute și cheile secp256k1 de 65 de octeți care nu s-ar putea verifica niciodată.

Citiți taxonomia live (cu `schema_version` pentru detectarea derivei) în loc să o codificați static:

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/permission_schema | jq
# or: qorechaind query abstractaccount permission-schema
```

### Cheltuirea printr-o cheie conectată {#execute-messages}

Două mesaje transportă acțiuni autorizate de autentificator. În ambele cazuri, releul este semnatarul/plătitorul de taxe al tranzacției; semnătura autentificatorului călătorește în interiorul mesajului.

**`MsgExecuteEVM`** — un apel sau transfer EVM **de la adresa `0x…` a contului canonic**. Autentificatorul semnează `sha256("qorechain-evm-auth-v1" ‖ chainId ‖ account ‖ pubkey ‖ to ‖ value ‖ data ‖ nonce)` (toate câmpurile prefixate cu lungime). Începând cu v3.2.3 (funcția `abstractaccount-hardening`), chain-ul cere **digest-ul v2**, `sha256("qorechain-evm-auth-v2" ‖ … ‖ nonce ‖ gasLimit)`, care leagă și limita de gaz a apelului (8 octeți big-endian), astfel încât un releu nu poate reda semnătura cu o altă limită; niciun bloc nu acceptă ambele forme. `qorechaind query abstractaccount auth-sign-evm` primește `--gas-limit` pentru aceasta, iar aceeași valoare o transmiteți și lui `execute-evm`. Protecția anti-replay este nonce-ul EVM propriu al contului.

**`MsgExecuteCosmos`** — un transfer bancar pe lane-ul nativ din contul canonic. Autentificatorul semnează `sha256("qorechain-cosmos-auth-v1" ‖ chainId ‖ account ‖ pubkey ‖ to ‖ amount ‖ nonce)`. Protecția anti-replay este o **secvență per-autentificator** păstrată de modul (un transfer bancar nu incrementează nonce-ul contului). Auto-trimiterile sunt respinse.

:::caution Reguli privind nonce-ul
* `MsgExecuteEVM.nonce` = nonce-ul EVM **curent** al contului (`eth_getTransactionCount(account0x, "latest")`). În producție releul este un cont *diferit*, deci **nu** adăugați +1. Semnarea unui nonce învechit returnează codul `11`.
* `MsgExecuteCosmos.nonce` = secvența per-autentificator (interogați starea autentificatorului contului), **nu** secvența Cosmos a contului. Începând cu v3.2.4 (testnet din 19 octombrie 2026, mainnet din 23 octombrie 2026), `GET /qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` returnează direct această secvență (`nonce`, `linked`).
:::

**Exemplu Phantom** (browser: Phantom semnează, backend-ul dvs. transmite):

```js
import { buildPhantomExecuteCosmos } from "@qorechain/wallet-adapter";

// In the dApp: Phantom signs the digest with ed25519 signMessage.
const msg = await buildPhantomExecuteCosmos({
  wallet: window.solana,              // Phantom: { publicKey, signMessage }
  relayer: "qor1relayer...",          // submits the tx and pays the fee (a different account)
  chainId: "qorechain-vladi",
  account: "qor1owner...",            // canonical account being spent from
  to: "qor1recipient...",
  amount: "900000uqor",               // single-coin string
  nonce: authSequence,                // per-authenticator sequence
});
// Send `msg` to your relayer; the relayer wraps it in a tx it signs
// (hybrid PQC) and broadcasts. The transfer moves the OWNER's funds.
```

**Exemplu MetaMask** (EIP-191 `personal_sign` de la adresa de 20 de octeți conectată):

```js
import { buildMetaMaskExecuteEvm } from "@qorechain/wallet-adapter";

const msg = await buildMetaMaskExecuteEvm({
  provider: window.ethereum,          // MetaMask (EIP-1193)
  address: ethAddress,                // the linked 20-byte address
  relayer: "qor1relayer...",
  chainId: "qorechain-vladi",
  account: "qor1owner...",
  to: "0xRecipient...",
  value: (10n ** 16n).toString(),     // 0.01 QOR in wei (18-decimal EVM view), as a decimal string
  gasLimit: 100000,
  nonce: currentEvmNonce,             // eth_getTransactionCount(owner0x, "latest")
});
// Relay as above. The chain verifies the signature via EIP-191 + ecrecover
// against the registered 20-byte address.
```

Aceleași funcții constructor există în [SDK-ul QoreChain](/sdk/guides/authenticators) pentru toate cele cinci limbaje, plus echivalente CLI:

```bash
# Generate an ed25519 authenticator key: the seed goes to a new 0600 file, only the public key is printed
qorechaind query abstractaccount auth-keygen --out authenticator.seed

# Sign the exact bytes the chain verifies (seed from --seed-file, "-" for stdin, QORE_AUTH_SEED, or a prompt)
qorechaind query abstractaccount auth-sign-cosmos <chain-id> <account> <to> <amount> <nonce> --seed-file authenticator.seed
qorechaind query abstractaccount auth-sign-evm <chain-id> <account> <to-0xhex> <value-wei> <data-hex> <nonce> --seed-file authenticator.seed

# Relay a pre-signed authorization (the relayer's --from key pays; cosign the envelope with `tx pqc cosign`)
qorechaind tx abstractaccount execute-cosmos <account> <to> <amount> <scheme> <pubkey-base64> <signature-base64> <nonce> --from relayer --generate-only > tx.json
qorechaind tx abstractaccount execute-evm <account> <to-0xhex> <value-wei> <data-hex> <gas-limit> <scheme> <pubkey-base64> <signature-base64> <nonce> --from relayer --generate-only > tx.json
```

Cheile și semnăturile din aceste comenzi sunt în base64. Funcțiile ajutătoare `auth-sign-*` citesc seed-ul dintr-un fișier, de la stdin sau din mediu, nu dintr-un argument din linia de comandă (versiunea de nod v3.2.1 și ulterioare), astfel încât acesta nu apare în istoricul shell-ului. Flag-urile de gestionare a seed-ului (`--out`, `--seed-file`) există doar în binarele v3.2.1 și ulterioare.

### Coduri de eroare {#authenticator-errors}

Eșecurile de aplicare a regulilor returnează coduri distincte (codespace `abstractaccount`) astfel încât portofelele să poată afișa mesajul corect:

| Cod | Semnificație | UX Portofel |
| --- | --- | --- |
| `5` | Limită de cheltuieli depășită (per tranzacție sau zilnică) | Afișați alocarea rămasă |
| `6` | Autentificator expirat | „Expirat — reconectați portofelul” |
| `9` | Modul dezactivat (starea curentă pe mainnet) | „Portofelele conectate nu sunt încă disponibile” |
| `10` | Permisiune refuzată (domeniu sau mesaj nedelegabil) | Afișați permisiunea lipsă |
| `11` | Replay respins (nonce/secvență învechită) | Reinterogați nonce-ul și resemnați |

(Codespace `pqc` cod `21` = verificarea semnăturii hibride a eșuat — o problemă de semnare pe partea releului, nu una de autorizare.)

### Interogări REST {#abstractaccount-rest}

Interogările de citire ale modulului sunt servite prin REST (începând cu **v3.1.85**):

```
GET /qorechain/abstractaccount/v1/config      # {"config":{"enabled":false,...}} on mainnet today; enabled: true on the testnet
GET /qorechain/abstractaccount/v1/accounts
GET /qorechain/abstractaccount/v1/accounts/{address}
GET /qorechain/abstractaccount/v1/permission_schema
```

## Legarea unei chei în v3.2.8: exemplu lucrat {#link-example-v328}

Această secțiune parcurge o legare completă pe testnet-ul **`qorechain-diana`**, care rulează v3.2.8 din 12 noiembrie 2026. Mainnet-ul nu rulează încă v3.2.8, iar modulul său abstract-account este oprit, deci nimic din toate acestea nu se aplică acolo astăzi. Pe scurt: cheia pe care o legați trebuie să semneze un text scurt prin care arată că este de acord să fie legată, o cheie care poate muta valoare are nevoie de o regulă de cheltuieli pe cont, iar când o cheie legată cheltuiește ulterior, o cheltuială eșuată este raportată în interiorul unei tranzacții reușite.

De ce contează: din v3.2.8, deținătorul cheii participă la legare, deci o cheie poate fi legată doar de cineva care o deține cu adevărat, iar o cheie care poate muta valoare este întotdeauna limitată de o limită pe cont.

:::note Ce puteți rula astăzi
Textul de legare și cele trei scheme de semnare de mai jos funcționează cu `node:crypto` și `@noble` simplu, așa cum se arată. Pachetele publicate (SDK 0.13.0 și wallet-adapter 0.5.0) nu pot încă pune dovada în `MsgRegisterAuthenticator`: `registerAuthenticator` și `registerEthAuthenticatorMsg` ale lor construiesc mesajul fără câmpul dovezii, pe care testnet-ul v3.2.8 îl refuză. O versiune ulterioară a SDK-ului și a wallet-adapter adaugă helpere care construiesc textul de legare, cer portofelului să îl semneze și atașează dovada; până atunci folosiți linia de comandă (pasul 3) sau mesajul brut. Aici `qorechaind` înseamnă CLI-ul de nod pentru Linux; nu există un binar macOS împachetat.
:::

### 1. Textul de legare și cum îl semnează fiecare schemă {#link-text}

Textul are cinci linii, unite printr-un singur newline, fără newline la final:

```text
QoreChain authenticator link v1
chain: qorechain-diana
account: qor1youraccount...
scheme: secp256k1
key: b31c9bca95fa18bc6bf5cbf748f73925e0e05913
```

`chain` este chain id-ul, `account` este contul bech32 la care este legată cheia, `scheme` este schema pe care o transmiteți lui `register-authenticator`, iar `key` este hex-ul cu litere mici al cheii publice (32 de octeți pentru ed25519, 33 de octeți pentru o cheie secp256k1 comprimată) sau, pentru un cont MetaMask, al adresei Ethereum de 20 de octeți. Octeții pe care îi verifică lanțul sunt exact aceste caractere, deci un chain id, un cont sau o cheie diferite dau o dovadă care nu se verifică.

| Cheie legată | `scheme` | Ce conține `key` | Ce se semnează | Dimensiunea dovezii |
| --- | --- | --- | --- | --- |
| Phantom (ed25519) | `ed25519` | cheie publică de 32 de octeți | octeții UTF-8 ai textului (`signMessage` al portofelului) | 64 de octeți |
| Cheie secp256k1 comprimată | `secp256k1` | cheie publică de 33 de octeți | SHA-256 al textului, `r` compact apoi `s` | 64 de octeți |
| Adresă Ethereum (MetaMask) | `secp256k1` | adresă de 20 de octeți | EIP-191 `personal_sign` al textului | 65 de octeți (`r`, `s`, `v` = 27 sau 28) |

Acest TypeScript construiește textul și îl semnează cu trei chei de unică folosință, folosind `node:crypto`, `@noble/curves` 2.x și `@noble/hashes` 1.8 (rulați pe Node 20 sau mai nou; nu folosiți niciodată aceste chei pentru altceva):

```ts
import { generateKeyPairSync, sign } from "node:crypto";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { keccak_256 } from "@noble/hashes/sha3.js";
import { bytesToHex, utf8ToBytes, concatBytes } from "@noble/hashes/utils.js";

const chainId = "qorechain-diana";
const account = "qor1youraccount..."; // the account the key is linked to

function linkText(scheme: string, key: Uint8Array): string {
  return [
    "QoreChain authenticator link v1",
    `chain: ${chainId}`,
    `account: ${account}`,
    `scheme: ${scheme}`,
    `key: ${bytesToHex(key)}`, // lowercase hex
  ].join("\n");
}

// ed25519 (what Phantom signMessage does): sign the text bytes.
const ed = generateKeyPairSync("ed25519");
const edPub = ed.publicKey.export({ format: "der", type: "spki" }).subarray(-32);
const edProof = sign(null, utf8ToBytes(linkText("ed25519", edPub)), ed.privateKey);

// 33-byte secp256k1 key: sign sha256(text), 64-byte r||s.
const sk = secp256k1.utils.randomSecretKey();
const pub33 = secp256k1.getPublicKey(sk, true);
const cosmosProof = secp256k1.sign(sha256(utf8ToBytes(linkText("secp256k1", pub33))), sk, { prehash: false });

// Ethereum address: EIP-191 personal_sign, key = the 20-byte address.
const ethSk = secp256k1.utils.randomSecretKey();
const addr = keccak_256(secp256k1.getPublicKey(ethSk, false).subarray(1)).subarray(-20);
const text = utf8ToBytes(linkText("secp256k1", addr));
const digest = keccak_256(concatBytes(utf8ToBytes(`\x19Ethereum Signed Message:\n${text.length}`), text));
const rec = secp256k1.sign(digest, ethSk, { prehash: false, format: "recovered" }); // recovery byte first
const ethProof = concatBytes(rec.subarray(1), Uint8Array.of(rec[0] + 27));          // r || s || v

// The CLI takes the proof as base64:
console.log(Buffer.from(edProof).toString("base64"));
```

Într-un dApp de browser nu dețineți cheia: transmiteți același text portofelului (Phantom `signMessage` cu octeții UTF-8, MetaMask `personal_sign` cu textul) și codificați base64 ce se întoarce. Portofelul îi arată utilizatorului cele cinci linii, ceea ce este scopul folosirii textului simplu.

### 2. Regula de cheltuieli {#link-spending-rule}

O cheie ale cărei permisiuni pot muta valoare (`send`, `evm`, `svm`, `deploy`, `all`) este refuzată la înregistrare dacă contul nu are deja o regulă activă care limitează fiecare denominație pe care o poate cheltui cheia. Setați mai întâi regula, sau în aceeași tranzacție cu legarea. Lanțul aplică **prima regulă activă** a contului unei chei care nu are una proprie. `update-rules` înlocuiește toate regulile, deci includeți fiecare regulă pe care contul trebuie să o păstreze. Din linia de comandă:

```bash
qorechaind tx abstractaccount update-rules <account-address> \
  '[{"id":"linked","enabled":true,"daily_limit":5000000,"per_tx_limit":1000000,"allowed_denoms":["uqor"]}]' \
  --chain-id qorechain-diana --from mykey --generate-only --gas 400000 --fees 40000uqor > rules.json
# cosign with `qorechaind tx pqc cosign`, then broadcast (see the caution at the top of this page)
```

În TypeScript, cu SDK 0.13.0 publicat, composer-ul este `msg.abstractaccount.updateSpendingRules`, care verifică și local regula și refuză o regulă activă care nu limitează nimic:

```ts
import { msg } from "@qorechain/sdk";

const rules = msg.abstractaccount.updateSpendingRules({
  owner: "qor1owner...",
  accountAddress: "qor1youraccount...",
  rules: [
    { id: "linked", enabled: true, dailyLimit: "5000000", perTxLimit: "1000000", allowedDenoms: ["uqor"] },
  ],
});
// Sign with the owner's hybrid signer and broadcast (see the SDK guide on authenticators).
```

O cheie cu doar permisiuni fără valoare (`vote`, `delegate`, `withdraw`, `amm`, `ibc`, `wasm`) nu are nevoie de o regulă pentru a fi legată. Cheile legate înainte de upgrade, cu permisiuni de valoare, sunt ținute la aceeași regulă când execută, deci adăugați o regulă și pentru ele.

### 3. Legare, apoi revocare {#link-revoke}

Afișați textul pentru cheia pe care o legați (nu citește nimic din lanț; chain id-ul vine din `--chain-id`), semnați-l ca la pasul 1, apoi înregistrați cu dovada:

```bash
# Print the exact text the key must sign. The key argument is base64 (for an Ethereum address: the 20 address bytes).
qorechaind tx abstractaccount link-message <account-address> ed25519 <pubkey-base64> --chain-id qorechain-diana

# Register the key with its proof (base64 of the signature):
qorechaind tx abstractaccount register-authenticator <account-address> ed25519 <pubkey-base64> send <expiry-unix> phantom \
  --possession-proof <proof-base64> \
  --chain-id qorechain-diana --from mykey --generate-only --gas 400000 --fees 40000uqor > link.json
# cosign with `qorechaind tx pqc cosign`, then broadcast

# Check the result:
curl -s https://api-testnet.qore.host/qorechain/abstractaccount/v1/accounts/<account-address>/authenticators

# Revoke the key (no proof is needed; only the owner can revoke):
qorechaind tx abstractaccount revoke-authenticator <account-address> ed25519 <pubkey-base64> \
  --chain-id qorechain-diana --from mykey --generate-only --gas 400000 --fees 40000uqor > revoke.json
```

Dovada este flag-ul `--possession-proof` al lui `register-authenticator`, deci argumentele poziționale sunt aceleași ca înainte. Înregistrarea și revocarea trebuie să fie mesaje proprii ale proprietarului, de nivel superior și semnate; nu pot fi învelite într-un grant authz și nu pot fi trimise de cheia legată. Ruta authenticators listează cheia cu `revoked: true` după ce revocarea este inclusă.

### 4. Citirea rezultatului unei execuții {#link-execution-result}

Când o cheie legată cheltuiește prin `MsgExecuteEVM` sau `MsgExecuteCosmos`, un eșec după ce semnătura a fost acceptată (de exemplu o limită depășită sau un apel care face revert) nu mai face să eșueze întreaga tranzacție. Tranzacția este inclusă cu codul `0`, răspunsul poartă `success=false`, nonce-ul cheii este consumat, iar tranzacția emite un eveniment:

| Eveniment | Atribut | Semnificație |
| --- | --- | --- |
| `abstractaccount_execution_failed` | `account` | contul din care cheltuia cheia |
| | `lane` | lane-ul care a fost încercat (valorile exacte nu sunt listate în documentația nodului) |
| | `nonce` | nonce-ul care a fost consumat |
| | `reason` | de ce a eșuat execuția |

Citiți-l din REST după hash-ul tranzacției și uitați-vă la evenimentele din `tx_response`:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<txhash> \
  | jq '.tx_response | {code, events: [.events[] | select(.type=="abstractaccount_execution_failed")]}'
```

Pentru a găsi execuții eșuate fără un hash, căutați după eveniment (ruta răspunde `200`; un rezultat gol este `"total":"0"`):

```bash
curl -s -g "https://api-testnet.qore.host/cosmos/tx/v1beta1/txs?query=abstractaccount_execution_failed.account%3D%27<account-address>%27&limit=10"
```

Un client care verifică doar `code === 0` raportează un astfel de apel ca reușit. Verificați evenimentul (sau decodați `success` din răspunsul mesajului) înainte de a-i spune unui utilizator că o cheltuială a trecut. Deoarece nonce-ul este consumat, citiți următoarea valoare din `GET /qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` înainte de a semna din nou.

### 5. Erori {#link-errors}

| Unde | Ce vedeți | Semnificație și ce faceți |
| --- | --- | --- |
| Înregistrare | refuzată fără o dovadă de deținere validă | Dovada lipsește, are dimensiunea greșită sau nu se verifică pentru acest chain, cont, schemă și cheie. Reconstruiți textul din cele cinci linii exacte și semnați din nou. Testat pe testnet la 12 noiembrie 2026 (SDK 0.13.0, cheie legată fără dovadă, după ce regula a fost setată; SDK 0.14.0 cu dovada din `metaMaskPossessionProof` a legat cheia cu codul 0): codespace `abstractaccount`, cod 10, `possession_proof is required: a signature by the linked key over the link message` |
| Înregistrare | refuzată pentru o permisiune de valoare fără regulă | Setați mai întâi o regulă care limitează fiecare denominație (pasul 2). Testat pe testnet la 12 noiembrie 2026: codespace `abstractaccount`, cod 8, `a linked key with the send, evm, deploy, svm or all permission needs a spending rule on the account that bounds every denom it admits (a per_tx_limit or daily_limit, or an allowed_denoms list whose every denom has a denom_limits amount)` |
| Revocare (client) | `revokeAuthenticatorMsg` eșuează sau construiește un mesaj greșit | Primește cheia publică ca octeți. Pentru o adresă Ethereum transmiteți `Uint8Array.from(Buffer.from(pubkey_hex, "hex"))`, nu un șir `0x`. Rulat pe testnet la 12 noiembrie 2026: revocarea a reușit cu 194.244 de gaz folosit |
| Înregistrare | refuzată pentru un șir de permisiune necunoscut sau o cheie secp256k1 de 65 de octeți | Folosiți doar cele unsprezece permisiuni din [taxonomie](#permission-taxonomy) și o cheie de 33 de octeți sau o adresă de 20 de octeți |
| Înregistrare sau actualizare | codespace `abstractaccount` cod `8`, regulă de cheltuieli invalidă | O regulă activă care nu limitează nimic, o denominație care nu poate fi parsată sau prea multe intrări. Corectați JSON-ul regulii și retrimiteți |
| Înregistrare, revocare, execuție | cod `9`, modul dezactivat | Modulul este oprit pe această rețea (este oprit astăzi pe mainnet) |
| Execuție | cod `10`, permisiune refuzată | Cheii îi lipsește permisiunea pentru acest mesaj, sau mesajul este unul de gestionare a cheilor pe care o cheie legată nu îl poate trimite niciodată |
| Execuție | cod `6`, autentificator expirat | Legați din nou cheia cu o expirare ulterioară |
| Execuție | cod `11`, replay respins | Nonce vechi: interogați `auth_nonce` (sau nonce-ul EVM al contului pe lane-ul EVM) și semnați din nou |
| Execuție | cod `5`, limita de cheltuieli depășită | Peste limita per tranzacție sau zilnică; așteptați următoarea zi UTC sau ridicați regula |
| Execuție | cod `0` cu `success=false` și evenimentul `abstractaccount_execution_failed` | A eșuat după ce semnătura a fost acceptată; nonce-ul este consumat. Citiți `reason` (secțiunea 4) |
| Plic relayer | codespace `pqc` cod `21` | Semnătura hibridă proprie a relayer-ului a eșuat; fără legătură cu cheia legată |

### Ce a fost verificat {#link-example-checks}

Pe testnet la 12 noiembrie 2026 (versiunea v3.2.8, SDK 0.13.0, semnare hibridă): `MsgUpdateSpendingRules` cu o regulă (limită zilnică 1.000.000 uqor, limită per tranzacție 100.000 uqor, doar `uqor`) a reușit cu codul 0 și 186.319 de gaz folosit. Un `MsgRegisterAuthenticator` pentru permisiunea `evm` trimis înainte ca regula să existe a fost refuzat cu codul 8, iar trimis după regulă dar fără dovadă de deținere a fost refuzat cu codul 10, cu mesajele din tabelul de erori. SDK 0.13.0 nu are câmp pentru dovada de deținere în composer-ele sale de înregistrare, deci legarea reușită a fost rulată ulterior cu pachete mai noi, așa cum se descrie în continuare.

**Rulat de autorul documentației pe testnet la 12 noiembrie 2026, cu SDK 0.14.0 și wallet-adapter 0.6.0 (toate cu codul 0):**

* `linkAuthenticatorMsgs` a construit regula de cheltuieli (`MsgUpdateSpendingRules`) și `MsgRegisterAuthenticator` pentru o adresă Ethereum, cu dovada de deținere din `metaMaskPossessionProof` (semnată aici de o cheie de unică folosință printr-un provider care răspunde la `personal_sign`). Ambele mesaje au mers într-o SINGURĂ tranzacție semnată de proprietar: 220.973 de gaz folosit sub o limită de 600.000.
* `GET /qorechain/abstractaccount/v1/accounts/{address}` a arătat apoi `authenticators_count` 1, iar `GET .../authenticators` a listat cheia: schema `secp256k1`, `pubkey_hex` adresa de 20 de octeți, permisiuni `evm`, `revoked` false.
* `revokeAuthenticatorMsg` a reușit apoi cu 194.244 de gaz folosit, iar lista a arătat `revoked` true. `revokeAuthenticatorMsg` primește cheia publică ca octeți, deci pentru o adresă Ethereum transmiteți `Uint8Array.from(Buffer.from(pubkey_hex, "hex"))`, nu un șir `0x`.

Helperele Phantom și ed25519 și builder-ele Python, Go, Rust și Java nu au fost rulate.

Codul de semnare din pasul 1 a fost rulat cu chei de unică folosință: dovezile ed25519 și secp256k1 comprimată se verifică față de cheile lor publice, iar dovada EIP-191 recuperează adresa de 20 de octeți pentru care a fost făcută. Rutele de citire `config`, `params`, `accounts`, `accounts/{address}`, `accounts/{address}/spending_rules`, `accounts/{address}/authenticators`, `permission_schema`, `auth_nonce/{address}/{pubkey_hex}` și o căutare de tranzacție după hash au răspuns toate pe testnet (căutarea unui hash necunoscut răspunde `404`). Formele comenzilor `link-message` și `--possession-proof` sunt luate din codul sursă al nodului v3.2.8 și nu au fost rulate aici. Codul de semnare a fost rulat cu chei de unică folosință; un eveniment real `abstractaccount_execution_failed` nu este arătat.

Vedeți și: [Semnarea post-cuantică](/developer-guide/post-quantum-signing), [Endpoint-uri REST și gRPC](/api-reference/rest-grpc-endpoints), [Autentificatori în SDK](/sdk/guides/authenticators), [Fereastra de autorizare EVM](/developer-guide/evm-window-reference).

## Interogarea Conturilor Abstracte

### CLI

```bash
# Module configuration (enabled flag and limits)
qorechaind query abstractaccount config

# Get full account configuration
qorechaind query abstractaccount account <address>

# List all abstract accounts (paginated)
qorechaind query abstractaccount accounts --page-limit 10
```

Pe mainnet lista de conturi este goală. Testnet-ul listează câteva conturi (patru la 27 octombrie 2026), unele create înainte ca indicatorul de activare să fie aplicat pe fiecare cale.

### JSON-RPC

> **Încă nu este servit:** niciun build de nod lansat nu servește namespace-ul JSON-RPC `qor_`, deci `qor_getAbstractAccount` returnează `-32601` (metodă negăsită) pe fiecare endpoint public în prezent. Folosiți rutele REST de mai sus sau CLI-ul. Consultați [namespace-ul `qor_`](/api-reference/json-rpc-qor_-namespace).

### Exemplu de Răspuns pentru Cont

Structura unei înregistrări de cont abstract (valori ilustrative):

```json
{
  "address": "qor1myaccount...",
  "account_type": "session_based",
  "owner": "qor1owner...",
  "spending_rules": [
    {
      "id": "daily",
      "enabled": true,
      "daily_limit": "1000000000",
      "per_tx_limit": "100000000",
      "allowed_denoms": ["uqor"]
    }
  ]
}
```

## Recuperare Socială

`social_recovery` este un tip de cont, dar modulul nu are tranzacții de recuperare: nu există comenzile `initiate-recovery` sau `approve-recovery` și niciun mesaj de recuperare în serviciul de tranzacții al modulului. Recuperarea cheii unui cont QoreChain se face rederivând cheia post-cuantică a contului din mnemonic (`tx pqc recover-key`) și, dacă este nevoie, rotind-o (`tx pqc rotate-key`); consultați [Semnarea Post-Cuantică](/developer-guide/post-quantum-signing).

## Integrare cu dApp-uri

Când modulul este activat, autorizarea prin chei conectate este destinată unor fluxuri precum:

* Portofele mobile unde solicitările biometrice repetate sunt deranjante
* dApp-uri de gaming care necesită semnarea rapidă a tranzacțiilor în limitele unei alocări
* Utilizatori Phantom sau MetaMask care cheltuiesc din contul lor QoreChain printr-un releu

Backend-ul unui dApp acționează ca releu: primește autorizarea semnată a cheii conectate, o încapsulează într-o tranzacție pe care o semnează el însuși și o transmite. Cheia conectată poate fi revocată sau poate expira oricând. Până când modulul este activat pe rețeaua țintă, folosiți semnarea obișnuită prin [QoreX sau SDK](/sdk/overview).

## Pașii Următori

* [Rularea unui Validator](/developer-guide/running-a-validator) — Configurați și operați un nod validator
* [Dezvoltare EVM](/developer-guide/evm-development) — Instrumente EVM, conturi și fereastra de autorizare EVM
* [Interoperabilitate Cross-VM](/developer-guide/cross-vm-interoperability) — Mesagerie cross-VM
