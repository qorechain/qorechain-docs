---
slug: /developer-guide/evm-development
title: Dezvoltare EVM
sidebar_label: Dezvoltare EVM
sidebar_position: 2
---

# Dezvoltare EVM

QoreChain rulează un mediu de execuție complet compatibil cu EVM pe QoreChain EVM Engine, permițându-vă să implementați și să interacționați cu contracte inteligente Solidity folosind uneltele obișnuite. Modulul EVM expune o interfață JSON-RPC pe **portul 8545** (WebSocket pe **8546**) care suportă fluxurile de lucru standard de dezvoltare Ethereum.

:::note
Exemplele de mai jos vizează rețeaua mainnet **`qorechain-vladi`** (chain ID EVM **9801**), activă din 7 iunie 2026, care rulează versiunea de nod **v3.2.4** la momentul scrierii (aplicată prin propunerea de guvernanță 13 la înălțimea 3.742.566, pe 23 octombrie 2026; v3.2.3 fusese aplicată la înălțimea 3.662.051, pe 20 octombrie 2026; propunerea de guvernanță 14 de pe mainnet ar aplica v3.2.5 la înălțimea 3.906.833, iar ce schimbă acea versiune este documentat după ce este aplicată). Testnet-ul **`qorechain-diana`** rulează **v3.2.6** (v3.2.4 de la înălțimea 8.337.253, pe 19 octombrie 2026, v3.2.5 la înălțimea 8.890.800, pe 26 octombrie, v3.2.6 la înălțimea 8.970.638, pe 27 octombrie); folosiți acolo chain ID EVM **9800**. Acolo unde această pagină descrie ceva care diferă între rețele (precompilatele testnet-ului, tokenurile de test Fest), spune acest lucru. Exemplele de cod folosesc `http://localhost:8545` pentru un nod pe care îl rulați singuri; endpointul public de mainnet este `https://evm.qore.host`, iar cel de testnet este `https://evm-testnet.qore.host`.
:::

:::caution O tranzacție EVM necesită o cheie PQC înregistrată și o fereastră de autorizare deschisă
Începând cu upgrade-ul v3.2.0 (înălțimea mainnet 2.981.742, înălțimea testnet 5.920.000), lane-ul EVM admite o tranzacție doar de la un cont care are **(1) o cheie post-cuantică ML-DSA-87 înregistrată** și **(2) o fereastră de autorizare EVM deschisă** care mai are loc pentru ea. Semnați cu unelte obișnuite (MetaMask, ethers.js, Hardhat, Foundry), dar fără o cheie înregistrată și o fereastră deschisă, `eth_sendRawTransaction` este respins (codespace `pqc`, codurile 26, 27 sau 28). Citirile, `eth_call` și estimarea de gas nu au nevoie de niciuna. Vedeți [Fereastra de autorizare EVM](#evm-window) mai jos și ghidul pas cu pas din [Prima ta tranzacție](/getting-started/first-transaction#evm-window).

Încă două reguli se aplică pe mainnet începând cu v3.2.2: **tranzacțiile neprotejate (pre-EIP-155) sunt respinse**, atât de mempool-ul nodului, cât și la execuția blocului, așa că semnați cu un chain id (orice portofel și bibliotecă actuală o face); iar **conturile de modul nu pot fi revendicate prin EVM**.
:::

---

## Endpoint JSON-RPC

| Proprietate                | Valoare                                    |
| --------------------------- | ------------------------------------------ |
| URL implicit                | `http://localhost:8545`                    |
| URL WebSocket                | `ws://localhost:8546`                      |
| Spații de nume suportate    | `eth_`, `web3_`, `net_`, `txpool_`          |
| Chain ID (mainnet)          | `9801` (`qorechain-vladi`)                 |
| Chain ID (testnet)          | `9800` (`qorechain-diana`)                 |
| Simbol monedă               | `QOR`                                      |

Citirile specifice QoreChain sunt servite prin REST (`api.qore.host`); spațiul de nume JSON-RPC `qor_` descris [mai jos](#custom-qor_-namespace) **nu este activat** pe endpointurile publice și nici în configurația implicită a nodului. Lista implicită `api` a unui nod inițializat de curând (v3.2.3 și ulterior) este `eth,net,web3`; `txpool` este opțional (opt-in), deoarece publică tranzacțiile în așteptare ale nodului.

Începând cu versiunea de nod v3.2.4 (mainnet din 23 octombrie 2026, testnet din 19 octombrie 2026), un nod își limitează propriul server JSON-RPC: corpurile de cerere de peste 256 KiB sunt refuzate (HTTP 413), nu se servesc mai mult de 256 de cereri simultan (HTTP 503 peste această limită), iar un filtru `eth_getLogs` sau `eth_newFilter` cu mai mult de 4 poziții de topic, 1000 de alternative într-o singură poziție sau 1000 de adrese este refuzat. Limitele sunt setări locale ale nodului, în secțiunea `[json-rpc]` din `app.toml`; vezi [Rularea unui nod](/developer-guide/running-a-node#exposing-endpoints-for-integration).

---

## Configurare portofel (MetaMask)

Adăugați QoreChain ca rețea personalizată în MetaMask:

| Câmp                | Valoare Mainnet             | Valoare Testnet           |
| -------------------- | ---------------------------- | -------------------------- |
| Nume rețea           | QoreChain (qorechain-vladi)  | QoreChain Diana            |
| URL RPC              | `https://evm.qore.host`      | `https://evm-testnet.qore.host` |
| Chain ID             | `9801`                       | `9800`                     |
| Simbol monedă        | `QOR`                        | `QOR`                      |
| URL explorator blocuri | `https://explore.qore.network` | *(opțional)* |

Trimiterea din MetaMask necesită, în plus, o cheie PQC înregistrată și o [fereastră de autorizare EVM](#evm-window) deschisă pe cont.

---

## Hardhat

Instalați Hardhat și configurați fișierul `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    qorechain: {
      url: "http://localhost:8545",
      accounts: ["0xYOUR_PRIVATE_KEY_HEX"],
      chainId: 9801, // mainnet qorechain-vladi (use 9800 for qorechain-diana testnet)
    },
  },
};
```

Implementați un contract (contul care face implementarea are nevoie de o cheie PQC înregistrată și de o [fereastră de autorizare](#evm-window) deschisă; o implementare contează ca o tranzacție EVM în fereastră):

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

Rulați teste pe EVM-ul QoreChain:

```bash
npx hardhat test --network qorechain
```

---

## Foundry

Creați și implementați un contract cu Foundry:

```bash
# Create a new project
forge init my-project && cd my-project

# Build
forge build

# Deploy
forge create --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX \
  src/MyContract.sol:MyContract

# Interact
cast call <contract-address> "myFunction()" --rpc-url http://localhost:8545
cast send <contract-address> "setValue(uint256)" 42 \
  --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX
```

---

## Ethers.js

```javascript
import { ethers } from "ethers";

// Connect to QoreChain EVM
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get chain info
const network = await provider.getNetwork();
console.log("Chain ID:", network.chainId); // 9801n on mainnet (9800n on testnet)

// Read balance
const balance = await provider.getBalance("0xYourAddress");
console.log("Balance:", ethers.formatEther(balance), "QOR");

// Send transaction
const wallet = new ethers.Wallet("0xYOUR_PRIVATE_KEY_HEX", provider);
const tx = await wallet.sendTransaction({
  to: "0xRecipientAddress",
  value: ethers.parseEther("1.0"),
});
await tx.wait();
```

---

## Modelul de gas

QoreChain folosește un model de **taxă de bază dinamică EIP-1559** pentru tranzacțiile EVM:

* Taxa de bază se ajustează per bloc, în funcție de gradul de utilizare
* Utilizatorii pot seta `maxFeePerGas` și `maxPriorityFeePerGas`
* Taxele de prioritate merg către propunătorul blocului

### Puntea de denominare

Tokenul nativ QOR are **6 zecimale** (`uqor`), în timp ce EVM-ul așteaptă **18 zecimale**. Modulul `x/precisebank` gestionează conversia fără probleme:

| Context       | Denominare | Zecimale | Exemplu                |
| -------------- | ---------- | -------- | ----------------------- |
| Chain nativ    | `uqor`     | 6        | `1000000 uqor = 1 QOR` |
| EVM            | wei        | 18       | `1e18 wei = 1 QOR`      |

Această conversie este transparentă — când verificați un sold prin `eth_getBalance`, răspunsul este denominat în wei cu 18 zecimale. Când același cont este interogat prin modulul nativ de bank, soldul apare în `uqor` cu 6 zecimale.

---

## Perechi de tokenuri ERC-20 {#erc20-token-pairs}

Modulul `x/erc20` oferă **perechi de tokenuri** între denominările native Cosmos SDK și contractele ERC-20:

* Tokenurile native pot fi folosite în cadrul contractelor EVM ca ERC-20
* Tokenurile ERC-20 implementate pe EVM pot fi convertite în denominări native
* Conversia este bidirecțională și gestionată la nivel de protocol

```bash
# Register a native ERC-20 contract as a token pair (permissioned: `permissionless_registration` is false)
qorechaind tx erc20 register-erc20 <contract-addr> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey --gas 400000 --fees 40000uqor

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey --gas 400000 --fees 40000uqor
```

Acestea sunt tranzacții din lane-ul Cosmos: pe rețelele live necesită și co-semnătura post-cuantică hibridă (construiți cu `--generate-only`, apoi `qorechaind tx pqc cosign`; vedeți [Semnarea post-cuantică](/developer-guide/post-quantum-signing)). Comanda simplă `convert-erc20` de mai sus este refuzată în versiunea de nod v3.2.6, deoarece CLI-ul scrie un expeditor `0x`; vedeți [Conversia între cele două forme](#fest-convert) pentru forma care funcționează. Perechile de tokenuri se înregistrează sub o politică cu permisiuni (le înregistrează guvernanța). Pe mainnet nu există niciuna la momentul scrierii; testnet-ul are tokenurile de test Fest în [secțiunea următoare](#fest-tokens).

## Tokenuri de test Fest și conversia ERC20 {#fest-tokens}

:::note Doar pe testnet, fără valoare
Tokenurile din această secțiune există doar pe testnet-ul `qorechain-diana` (chain ID EVM 9800). Sunt tokenuri de test pentru builderi și nu au valoare. Mainnet-ul nu are nicio pereche de tokenuri ERC-20 (verificat la 27 octombrie 2026), deci niciuna dintre denominările de mai jos nu există acolo.
:::

La 27 octombrie 2026, guvernanța testnet-ului (propunerea 26) a înregistrat trei contracte ERC-20 ca perechi de tokenuri. Ele oferă builderilor un al doilea token de asociat cu QOR într-un [pool AMM](/api-reference/rest-grpc-endpoints#amm-module):

| Token | Contract ERC-20 (EIP-55) | Zecimale | Denom bank |
| ----- | ------------------------ | -------- | ---------- |
| fUSD (FestUSD) | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | 6  | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH (FestETH) | `0x02292293c13880a26242690eb70a0e42B8E91c28` | 18 | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC (FestBTC) | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | 8  | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

* **Denom-ul bank este `erc20:<address>` cu două puncte, iar adresa trebuie să fie în exact scrierea EIP-55 cu majuscule și minuscule mixte arătată.** Denom-urile sunt sensibile la majuscule: `erc20:0x97143b771d34...` (cu minuscule) este un alt șir, iar o interogare pentru el răspunde `404`. Copiați denom-ul de la `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata`, care listează cele trei tokenuri cu `symbol` (`fUSD`, `fETH`, `fBTC`), numele `display` (`FestUSD`, `FestETH`, `FestBTC`) și zecimalele.
* **Faucet-ul plătește în monede bank.** Pentru a folosi un token Fest din EVM (MetaMask, Solidity), convertiți mai întâi moneda bank în forma ei ERC-20 cu `MsgConvertCoin`; pentru a readuce un sold ERC-20 în forma bank (de exemplu pentru a-l asocia în AMM), folosiți `MsgConvertERC20`. Ambele sunt descrise mai jos.
* **Tokenurile există în două forme.** Un sold ERC-20 se citește cu `balanceOf` al contractului prin EVM JSON-RPC; soldul convertit este o monedă bank, citită cu `GET /cosmos/bank/v1beta1/balances/{address}`. Doar forma de monedă bank poate fi asociată în AMM. Conversia mută valoare între cele două forme; nu o creează.
* **Sumele folosesc zecimalele proprii ale tokenului** (6, 18 și 8 pentru fUSD, fETH și fBTC), nu cele 6 zecimale ale `uqor`.

```bash
curl -s https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs
curl -s "https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs/0x97143B771D34ddb9130b807b135Ae675A5a963CA"
```

### Conversia între cele două forme {#fest-convert}

Ambele mesaje de conversie sunt tranzacții din lane-ul Cosmos: necesită cheia dumneavoastră post-cuantică înregistrată și co-semnătura hibridă, ca orice altă tranzacție nativă (construiți, apoi `qorechaind tx pqc cosign`; vedeți [Semnarea post-cuantică](/developer-guide/post-quantum-signing)). Taxele trebuie să fie de cel puțin gas × 0,1 uqor.

:::note Ce a fost rulat
Citirile REST de pe această pagină (`token_pairs`, `denoms_metadata`) au fost rulate pe testnet la 27 octombrie 2026. Cele două comenzi de conversie de mai jos **nu** au fost rulate de la un capăt la altul pentru această pagină: formele mesajelor și regula expeditorului provin din sursa nodului v3.2.6 și din referința echipei lanțului. Tratați-le ca forma documentată și confirmați mai întâi cu o sumă mică.
:::

**Monedă bank în ERC-20: `MsgConvertCoin`.** `coin` este denom-ul bank exact, sensibil la majuscule (`erc20:<EIP-55 address>`), `sender` este adresa dumneavoastră `qor1...` (semnatarul), iar `receiver` este o adresă `0x...` care va deține ERC-20. Consumă aproximativ 432.000 de gas; setați o limită de gas de 600.000.

```bash
# Write the message by hand (not run for this page)
cat > convert-coin.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertCoin",
      "coin": { "denom": "erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA", "amount": "1000000" },
      "receiver": "0xYOUR_EVM_ADDRESS",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-coin.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**ERC-20 în monedă bank: `MsgConvertERC20`.** Câmpul său `sender` trebuie să fie, de asemenea, adresa bech32 `qor1...` a contului. Un expeditor `0x` este refuzat cu `decoding bech32 failed`. În versiunea de nod v3.2.6, comanda CLI `qorechaind tx erc20 convert-erc20` (exemplul simplu din [Perechi de tokenuri ERC-20](#erc20-token-pairs)) scrie expeditorul în forma `0x`, deci este refuzată din acest motiv: nu o folosiți. Construiți mesajul singuri, cu adresa `qor1` ca expeditor, în același mod ca mai sus:

```bash
# Workaround: write the message with a qor1 sender (not run for this page)
cat > convert-erc20.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertERC20",
      "contract_address": "0x97143B771D34ddb9130b807b135Ae675A5a963CA",
      "amount": "1000000",
      "receiver": "qor1youraddr...",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-erc20.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Aici `receiver` este contul `qor1...` care primește moneda bank (modulul acceptă forma bech32 pentru destinatarul unei conversii în monedă bank). Suma este în unitățile de bază ale tokenului (6, 18 sau 8 zecimale). Copiați denom-ul pentru `MsgConvertCoin` doar din `denoms_metadata`; forma cu minuscule este refuzată cu `token pair not found`.

---

## Compatibilitate PQC și EVM

Tranzacțiile EVM sunt semnate cu **ECDSA clasic (secp256k1)**, așa că MetaMask, Hardhat, Foundry, ethers.js și alte unelte standard le construiesc și le semnează fără modificări. Ce s-a schimbat în **v3.2.0** este *admiterea*: o tranzacție este acceptată doar dacă expeditorul ei deține o cheie post-cuantică înregistrată și o fereastră de autorizare activă (secțiunea următoare). Înregistrarea unei chei și deschiderea unei ferestre sunt tranzacții din lane-ul Cosmos și necesită semnătura hibridă (ML-DSA-87 + secp256k1).

Pentru securitate post-cuantică în cadrul contractelor:

* **Precompilatul PQC Verify** (`0x0000...0A01`) verifică pe chain semnături ML-DSA-87 din Solidity. Este **activ pe testnet** (activat prin propunerea de guvernanță 21, aprobată la 27 octombrie 2026) și **neactiv pe mainnet** la momentul scrierii. Vedeți [Precompilate EVM: starea rețelelor](/developer-guide/evm-precompiles#network-status).
* **Mesajele cross-VM** de la EVM către QoreChain Native sau SVM sunt tranzacții din lane-ul Cosmos și poartă semnătura hibridă ca oricare altele; vedeți [Interoperabilitate Cross-VM](/developer-guide/cross-vm-interoperability) pentru disponibilitatea lor curentă.

---

## Fereastra de autorizare EVM {#evm-window}

O semnătură post-cuantică nu poate călători *împreună* cu o tranzacție Ethereum (portofele precum MetaMask nu pot atașa o a doua semnătură), așa că ea călătorește *înaintea* ei. Contul deschide o fereastră delimitată cu mesajul din lane-ul Cosmos `MsgOpenEVMWindow`; lane-ul EVM admite apoi doar tranzacțiile acoperite de o fereastră activă. O cheie clasică furată nu poate deschide singură o fereastră, deci poate muta doar ceea ce permite o fereastră deja deschisă.

| Limită      | Interval           | Semnificație |
| ----------- | ------------------ | ------- |
| `blocks`    | 1 – 17.280         | Cât timp rămâne deschisă fereastra, numărat în blocuri începând cu blocul care o deschide |
| `max-txs`   | 1 – 1.000          | Câte tranzacții EVM admite |
| `max-value` | peste 0, în `uqor` | Ieșirea totală pe care o admite: valoarea transferată **plus** taxa maximă pe care ar putea-o plăti fiecare tranzacție (limita de gas × taxa maximă per gas), convertită în `uqor` și rotunjită în sus |

Limita care se epuizează prima închide fereastra. Toate cele trei limite sunt obligatorii; deschiderea unei ferestre o înlocuiește pe cea existentă; o tranzacție care este admisă și apoi eșuează își consumă totuși slotul și bugetul de valoare; implementările de contracte contează ca orice altă tranzacție. `blocks` este un număr de blocuri, nu o durată: 17.280 de blocuri înseamnă aproximativ 15 ore pe mainnet (circa 3,1 s per bloc) și aproximativ 6 ore pe testnet (circa 1,3 s per bloc la 27 octombrie 2026; timpul de bloc al testnet-ului variază).

**Limita de valoare numără doar QOR nativ.** Un transfer de token, o aprobare sau orice alt apel de contract poartă valoarea zero, deci nu se socotește la `max-value` (se socotește doar taxa sa maximă). Pentru a le limita și pe acestea, restrângeți **domeniul de aplicare** (scope) al ferestrei (mainnet v3.2.3 și ulterior):

| Opțiune de domeniu (flag CLI) | Câmp de mesaj | Ce admite fereastra |
| ----------------------- | ------------- | ---------------------- |
| `--native-only`         | `native_only` | Doar transferuri simple de QOR nativ: fără calldata, fără creare de contract, fără destinatar care poartă cod, fără autorizare EIP-7702 |
| `--allowed-targets 0xA,0xB` | `allowed_targets` | Doar tranzacțiile al căror destinatar este una dintre adresele de 20 de octeți listate; crearea de contract este respinsă |

O fereastră deschisă fără domeniu de aplicare se comportă exact ca înainte. O tranzacție în afara domeniului este respinsă cu codul 27 (mesajul spune că fereastra „does not admit this transaction"). `GET /qorechain/pqc/v1/evm_window/{address}` și `qorechaind query pqc evm-window` raportează `native_only` și `allowed_targets`, iar evenimentul `pqc_evm_window_opened` le poartă atunci când sunt setate.

**Pași** (ghidul complet este în [Prima ta tranzacție](/getting-started/first-transaction#evm-window)):

1. Înregistrați o singură dată cheia ML-DSA-87 (`tx pqc register-key-v2` sau `register-key`, cu `--gas 600000 --fees 60000uqor`; această tranzacție este scutită de cerința hibridă, astfel încât un cont nou să poată face bootstrap). Vedeți [Semnarea post-cuantică](/developer-guide/post-quantum-signing#pqc-key-registration).
2. Deschideți o fereastră. Este o tranzacție din lane-ul Cosmos, deci produceți-o nesemnată și co-semnați-o cu cheia ML-DSA (`max-value` acceptă `uqor` sau `qor`; `1000qor` înseamnă 1.000 QOR):

   ```bash
   qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi

   # the same window narrowed to plain QOR transfers (mainnet v3.2.3 and later):
   qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   ```

3. Verificați ce a rămas: `qorechaind query pqc evm-window <address>` sau `GET /qorechain/pqc/v1/evm_window/{address}` (răspunde `found: false` când nu există nicio fereastră).
4. Trimiteți tranzacțiile EVM ca de obicei. Deschiderea unei ferestre este o tranzacție din lane-ul Cosmos și avansează secvența contului, care este totodată nonce-ul său EVM, așa că citiți nonce-ul **după** ce fereastra este deschisă și semnați abia atunci.

Închideți o fereastră mai devreme cu `qorechaind tx pqc close-evm-window` (același tipar `--generate-only` și `cosign`), de exemplu dacă bănuiți că cheia clasică este expusă: tot ce mai admitea fereastra este respins începând cu blocul următor.

### Delegări EIP-7702 {#eip-7702}

O delegare EIP-7702 a contului vostru (o tranzacție de tip 4) intră în vigoare doar cu consimțământul post-cuantic propriu al contului, începând cu v3.2.2. Înregistrați mai întâi consimțământul cu mesajul din lane-ul Cosmos semnat hibrid `MsgAuthorizeEVMDelegation` (`qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>`); este de unică folosință, expiră după numărul de blocuri dat și este revocat de `close-evm-window`. Valoarea care părăsește un cont delegat este imputată ferestrei **acelui** cont, o tranzacție de tip 4 eșuată își păstrează autorizările pe care le-a aplicat, iar `qorechaind tx pqc clear-evm-delegation` elimină o delegare. O delegare respinsă răspunde cu codurile 60 până la 63. Citiți consimțământul cu `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.

| Respingere (codespace `pqc`) | Semnificație |
| ------------------------- | ------- |
| code 26 | Nu există nicio fereastră deschisă pentru expeditor sau expeditorul nu are o cheie PQC înregistrată |
| code 27 | Fereastra a expirat sau este epuizată (mesajul arată care limită) sau tranzacția este în afara domeniului ferestrei |
| code 28 | Limite invalide la deschiderea unei ferestre sau nicio cheie înregistrată în acel moment |

Cu SDK-ul TypeScript (0.8.2 și ulterior): `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow({ rest, address })` și `classifyEvmWindowRejection(err)` (`"no-pqc-key" | "no-window" | "exhausted" | "invalid"`). SDK 0.9.0 adaugă opțiunile de domeniu (`nativeOnly`, `allowedTargets`) la `openEvmWindowMsg` și constructorii de consimțământ EIP-7702 (`authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`); versiunile anterioare lui 0.9.0 construiesc doar fereastra fără domeniu, așa că folosiți `qorechaind` pentru restul (vedeți [ghidul SDK pentru EVM](/sdk/guides/evm#evm-window-scope)).

---

## Spațiul de nume personalizat `qor_` {#custom-qor_-namespace}

QoreChain extinde JSON-RPC cu un spațiu de nume `qor_` pentru interogări specifice chain-ului:

:::warning Încă nu este servit
Niciun build de nod publicat nu servește încă spațiul de nume `qor_`: `rpc_modules` de pe endpointurile publice listează doar `eth`, `net`, `rpc`, `txpool` și `web3`, iar fiecare metodă de mai jos returnează `-32601` (metodă negăsită) pe mainnet, testnet și pe nodurile rulate de voi cu configurația implicită (`eth`, `net`, `web3`). Vedeți [spațiul de nume `qor_`](/api-reference/json-rpc-qor_-namespace) pentru stare și pentru alternativele REST (de exemplu `GET /qorechain/pqc/v1/account/{address}` pentru starea cheii PQC).
:::

| Metodă                        | Descriere                                                            |
| ------------------------------ | ---------------------------------------------------------------------- |
| `qor_getPQCKeyStatus`         | Verifică dacă un cont are o cheie publică PQC înregistrată            |
| `qor_getAIStats`              | Recuperează statistici ale motorului AI (număr de anomalii, distribuția riscului) |
| `qor_getCrossVMMessage`       | Interoghează starea unui mesaj cross-VM după ID                       |
| `qor_getPoolClassification`   | Obține clasificarea pool-ului de validatori (RPoS/DPoS/PoS)          |
| `qor_getReputationScore`      | Interoghează scorul de reputație al unui validator                    |
| `qor_getAbstractAccount`      | Recuperează configurația contului abstract                            |

Exemplu cu `curl`:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPQCKeyStatus",
    "params": ["0xYourAddress"],
    "id": 1
  }'
```

---

## Pașii următori

* [Precompilate EVM](/developer-guide/evm-precompiles) — Referință pentru interfețele de precompilate QoreChain (trei active pe testnet, niciuna pe mainnet)
* [Interoperabilitate Cross-VM](/developer-guide/cross-vm-interoperability) — Apeluri cross-VM și disponibilitatea lor curentă
* [Abstractizarea contului](/developer-guide/account-abstraction) — Autentificatoare pentru portofele conectate și reguli de cheltuire (activat pe testnet, dezactivat pe mainnet)
