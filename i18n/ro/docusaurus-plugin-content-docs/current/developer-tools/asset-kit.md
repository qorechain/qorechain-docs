---
slug: /developer-tools/asset-kit
title: QoreChain Asset Kit
sidebar_label: Asset Kit
sidebar_position: 35
---

# QoreChain Asset Kit

QoreChain Asset Kit este un set de unelte open-source pentru emiterea și administrarea de token-uri permisionate care reprezintă active din lumea reală pe QoreChain. Are două părți cu stări diferite. O parte este un set de contracte EVM care rulează astăzi pe QoreChain EVM Engine: adaptoare pentru două standarde deschise de token-uri pentru active reglementate (ERC-3643 și CMTAT), vault-uri cu cote restricționate și un control specific QoreChain care cere ca fiecare deținător să aibă o cheie ML-DSA-87 înregistrată. Cealaltă parte este o **propunere** pentru module native ale lanțului, publicată ca interfețe protobuf cu clienți în patru limbaje și un mock în memorie, astfel încât aplicațiile să poată fi proiectate și testate față de regulile propuse.

Este pentru emitenți, agenți de transfer, administratori de fonduri, echipe de conformitate și juridice și integratori care vor să prototipeze un token reglementat pe testnet-ul QoreChain. Versiunea **0.1.0**, Apache-2.0 (cu excepțiile de licență enumerate la [Unde este publicat](#where-published)), întreținută de QoreChain Association. Este pre-1.0 și **neauditată**.

:::caution Ce este live și ce nu
- **Funcționează astăzi, doar pe testnet:** contractele EVM, scripturile de implementare Foundry și consola pentru emitenți, pe `qorechain-diana` (EVM chain ID 9800). Verificarea deținătorului citește precompilarea `pqcKeyStatus` de la `0x0A02`, care este activă pe testnet și **nu este activă pe mainnet**.
- **Mainnet (`qorechain-vladi`, EVM chain ID 9801):** verificarea deținătorului **eșuează închis** (fail closed). Orice adresă care nu este exceptată explicit contează ca neeligibilă, așa că un token protejat de guard nu se poate muta între deținători obișnuiți. Scripturile de implementare refuză să ruleze pe lanțul 9801.
- **O propunere, nu este live nicăieri:** modulele native `x/asset`, `x/identity`, `x/compliance`, `x/settlement` și `x/attest` nu există pe nicio rețea QoreChain și nu este programat niciun upgrade care să le adauge. Clienții pentru ele pot comunica doar cu un mock în memorie.
- **Șabloanele juridice** din repository sunt ciorne nerevizuite, pentru discuții cu un consilier juridic. Nu reprezintă consultanță juridică.
:::

## Inovații {#innovations}

- **O verificare post-cuantică a deținătorului, peste controalele proprii ale standardului.** Guard-ul citește `pqcKeyStatus(address)` la `0x0A02` și acceptă o adresă doar dacă returnează `registered`, id de algoritm 1 (ML-DSA-87) și `possessionProven`. O cheie înregistrată fără dovadă de posesie ar putea aparține altcuiva, așa că nu contează. Fiecare control al standardului din amonte (registrul de identitate, claim topics, freeze, pause, transfer forțat) se aplică în continuare; verificarea se adaugă peste ele.
- **Fail closed, cu decodare strictă.** Guard-ul apelează precompilarea cu o alocare fixă de gas și decodează răspunsul strict. Un răspuns în vechiul format cu trei câmpuri, un răspuns malformat sau lipsa oricărui răspuns este tratată ca „fără cheie". Unde precompilarea nu este activă, orice adresă neexceptată este neeligibilă.
- **Același guard în spatele a trei adaptoare.** `QoreChainHybridHolderRule` se conectează la un token CMTAT v3 ca `ruleEngine` (sau ca regulă într-un CMTA RuleEngine) cu codurile de restricție 60, 61 și 62; `QoreChainHybridHolderModule` se conectează la conformitatea modulară ERC-3643 ca modul plug-and-play; vault-urile acceptă orice politică `IHolderEligibility`, inclusiv guard-ul.
- **Cote de vault care nu pot spăla un token restricționat.** `QoreChainRwaVault` (ERC-4626) și `QoreChainRwaAsyncVault` (ERC-7540, cereri decontate în loturi de un operator cu `FULFILLER_ROLE`) verifică partea care primește la fiecare mișcare de cote: `maxDeposit` și `maxMint` returnează zero pentru un destinatar neeligibil. Răscumpărările nu sunt niciodată refuzate.
- **Contracte din amonte folosite nemodificate.** T-REX 4.1.6, ONCHAINID 2.2.1, CMTAT 3.2.0 și OpenZeppelin sunt submodule git, nu copii.
- **O propunere care poate fi testată înainte să existe.** Fiecare apel pe `ChainClient` eșuează cu `ChainUpgradeRequired` (codul `CHAIN_UPGRADE_REQUIRED`, plus numele modulului) fără a trimite vreo cerere în rețea. Un `MockChain` implementează în memorie regulile propuse și refuză cu `MockChainError`, care poartă numele propus al codului de eroare, de exemplu `ERROR_CODE_ADDRESS_FROZEN`. O aplicație poate fi scrisă față de mock și poate păstra clientul real conectat, astfel încât un upgrade lipsă este raportat clar în loc să eșueze în tăcere.
- **O consolă fără backend.** Consola pentru emitenți este o pagină React care nu face nicio cerere de rețea proprie; build-ul de producție setează o Content-Security-Policy cu `connect-src 'none'`, iar totul trece prin portofelul conectat.
- **Teste care rulează offline.** 33 de teste Foundry rulează fără rețea, folosind un test double al precompilării.

## Ce face {#what-it-does}

**Funcționează astăzi pe QoreChain EVM (testnet):**

- **`QoreChainHybridHolderGuard`.** Raportează dacă o adresă are o cheie ML-DSA-87 înregistrată cu dovadă de posesie (`isHybridHolder`, `isEligible`, `requireHybridHolder`, `keyStatus`, `precompileActive`). Excepții gestionate de proprietar pentru contracte precum vault-urile și escrow-urile (`setExempt`, evenimentul `ExemptionSet` cu un motiv). Proprietatea se transferă în doi pași (OpenZeppelin `Ownable2Step`).
- **`QoreChainHybridHolderRule`.** O regulă de transfer CMTAT v3 mapată la guard. Codurile de restricție 60 (expeditor), 61 (destinatar) și 62 (spender) prin `detectTransferRestriction`, `detectTransferRestrictionFrom` și `messageForTransferRestriction`.
- **`QoreChainHybridHolderModule`.** Un modul de conformitate modulară ERC-3643 (T-REX v4) mapat la guard. `moduleCheck` verifică expeditorul și destinatarul. Fără configurare per conformitate.
- **`QoreChainRwaVault` și `QoreChainRwaAsyncVault`.** Descrise mai sus.
- **`IERC7518`.** O schiță de interfață pentru partițiile ERC-7518, fără implementare; id-ul său ERC-165 `0x5a264a5d` este verificat de un test.
- **Scripturi de implementare (Foundry).** `script/DeployCmtat.s.sol`, `script/erc3643/DeployErc3643.s.sol` și `script/DeployVaults.s.sol`, cu un preflight comun (`script/QoreChainTestnet.sol`) care raportează dacă precompilarea răspunde și starea cheii implementatorului, și care refuză lanțul 9801.
- **Consola pentru emitenți** (`packages/issuer-console`). Se conectează la orice portofel EIP-6963, adaugă sau comută la QoreChain Testnet, creează un token CMTAT protejat de guard (guard, regulă și token, ca în `DeployCmtat.s.sol`), deschide token-uri CMTAT sau ERC-3643 existente, rulează acțiuni de agent (mint, burn, freeze, unfreeze, transfer forțat, pause, unpause) și arată deținătorii și un jurnal de audit construit din evenimentele lanțului.

**Propunere (nu este pe lanț):**

- Interfețe protobuf în `proto/` pentru `x/asset`, `x/identity`, `x/compliance`, `x/settlement` și `x/attest`, iar semantica lor în `docs/proposal.md`.
- Clienți în TypeScript, Python, Go și Java: tipuri generate, `ChainClient` și `MockChain`.

**Documente de referință în repository:**

- `docs/evm-adapters.md`: contractele, licențele din amonte, implementarea pe testnet.
- `docs/technology-standards.md`: o ciornă care descrie rețelele așa cum ar trebui să le vadă un emitent sau un auditor (fiabilitate, guvernanță, autoritatea de upgrade, ordonarea tranzacțiilor, observabilitate, gestionarea incidentelor, gestionarea cheilor), fiecare fapt fiind marcat cu eticheta Verified, Documented, Not measured sau Not published.
- `legal/`: trei șabloane pentru discuție (vezi [Limite](#limits)).

## Cazuri de utilizare {#use-cases}

1. **Un emitent prototipează un token permisionat pe testnet.** Emitentul implementează un token CMTAT cu `DeployCmtat.s.sol` (sau din consola pentru emitenți), ori o suită ERC-3643 completă cu `DeployErc3643.s.sol`, și încearcă freeze, pause, transferul forțat și verificarea deținătorului pe `qorechain-diana`, înainte de orice decizie privind o emisiune reală.
2. **Un administrator de fond rulează subscrieri și răscumpărări prin vault-uri cu cote restricționate.** Investitorii cer depuneri pe `QoreChainRwaAsyncVault`; administratorul le procesează în loturi cu `fulfillDeposit` și `fulfillRedeem`; cotele pot fi primite doar de adrese eligibile, în timp ce răscumpărările rămân deschise tuturor celor care dețin cote.
3. **O echipă de conformitate cere înregistrarea unei chei post-cuantice pentru fiecare deținător.** Adăugarea `QoreChainHybridHolderRule` (CMTAT) sau a `QoreChainHybridHolderModule` (ERC-3643) înseamnă că un token poate fi emis sau transferat doar către adrese cu o cheie ML-DSA-87 înregistrată și cu posesie dovedită, peste controalele de identitate și allowlist ale standardului.
4. **Un integrator construiește față de modulele native propuse.** Un portofel, un registru sau un back office scrie cod față de `MockChain` în TypeScript, Python, Go sau Java, verifică evenimentele și codurile de eroare ale acestuia și păstrează `ChainClient` conectat.
5. **O echipă de produs proiectează fluxuri de livrare contra plată și de atestare.** Propusele `x/settlement` (instrucțiuni cu afirmare bilaterală, toate picioarele sau niciunul) și `x/attest` (declarații cu perioadă de valabilitate și învechire) pot fi exersate în `MockChain` pentru a proiecta fluxuri de utilizator, știind că niciunul nu există pe lanț.
6. **O echipă juridică începe actele împreună cu un consilier.** Șabloanele pentru un titlu bazat pe registru în Elveția, termenii de token TVTG din Liechtenstein și o înțelegere de angajare în cadrul EU DLT Pilot Regime oferă o structură și o secțiune de mapare tehnică de completat. Un consilier calificat din jurisdicția relevantă revizuiește totul înainte de orice utilizare.
7. **Un evaluator de due diligence citește faptele despre rețele.** `docs/technology-standards.md` enumeră ce poate fi verificat pe rețelele live și ce nu este măsurat sau publicat, cu surse.

## Cum funcționează {#how-it-works}

### Verificarea deținătorului pe EVM {#holder-check}

Precompilarea de la `0x0A02` răspunde la `pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey, bool possessionProven)`. Guard-ul cere `registered && algorithmId == 1 && possessionProven`. Aceasta face ca guard-ul să eșueze închis: unde precompilarea nu este activă, orice adresă care nu este exceptată explicit este neeligibilă. Vezi [Precompilările EVM](/developer-guide/evm-precompiles) pentru precompilarea în sine și starea ei pe rețele.

```
                 CMTAT v3 token  -- ruleEngine -->  QoreChainHybridHolderRule --+
                                                                                +--> QoreChainHybridHolderGuard --> 0x0A02 pqcKeyStatus
ERC-3643 token -> ModularCompliance - module -->  QoreChainHybridHolderModule --+         (exemptions for contracts)
                                                                                |
       ERC-4626 / ERC-7540 vault shares ----------- IHolderEligibility ---------+
```

Verificarea este aditivă. Fiecare control al standardului din amonte se aplică în continuare: registrul de identitate ERC-3643 (ONCHAINID), claim topics, emitenți de încredere, freeze, freeze parțial, pause, transfer forțat și recuperare; la CMTAT freeze, freeze parțial, pause, transfer forțat, documente și snapshot-uri.

### Ce acoperă verificarea {#coverage}

Contează primirea: un mint sau un transfer către o adresă fără cheie este refuzat. Regula CMTAT verifică și expeditorul și, pentru `transferFrom`, spender-ul. Modulul ERC-3643 verifică expeditorul și destinatarul; ERC-3643 nu transmite spender-ul modulelor de conformitate, deci spender-ul unui `transferFrom` nu este verificat acolo. Burn-urile nu sunt niciodată refuzate (în ERC-3643, `burn` nu consultă deloc modulele de conformitate), astfel încât un deținător care și-a pierdut eligibilitatea poate fi totuși răscumpărat.

### Vault-uri {#vaults}

Ambele vault-uri verifică partea care primește la fiecare mișcare de cote; răscumpărările nu sunt niciodată refuzate. În vault-ul ERC-7540, cererile sunt agregate per controler (id de cerere 0). Cel care onorează cererile (fulfiller) convertește depunerile în așteptare în cote la raportul propriu al vault-ului active-per-cotă din momentul onorării, fără nicio intrare de evaluare externă; controlerii revendică apoi cu `deposit` sau `mint`, ori cu `redeem` sau `withdraw`. Contractul vault-ului în sine trebuie să aibă voie să dețină token-ul subiacent: înregistrat în registrul de identitate ERC-3643 sau în allowlist-ul CMTAT, și exceptat în guard (`DeployVaults.s.sol` setează excepțiile guard-ului).

### Trimiterea unei tranzacții EVM pe QoreChain {#native-prerequisites}

Orice tranzacție EVM pe QoreChain este admisă doar dacă expeditorul are:

1. o cheie ML-DSA-87 înregistrată, cu `MsgRegisterPQCKeyV2` și o dovadă de posesie, și
2. o fereastră de autorizare EVM deschisă, deschisă prin `/qorechain.pqc.v1.MsgOpenEVMWindow` într-o tranzacție de pe traseul native semnată hibrid (secp256k1 plus ML-DSA-87).

Pentru implementări, fereastra are nevoie de `allowed_targets` **gol** (o fereastră restricționată la ținte refuză crearea de contracte), `max_txs` cel puțin egal cu numărul de tranzacții, `max_value` care acoperă valoarea plus taxa maximă a fiecărei tranzacții, `blocks` suficient de mare (cel mult 17,280) și `native_only` false. Deschiderea ferestrei avansează secvența contului, care este și nonce-ul EVM: deschide mai întâi fereastra, apoi rulează scriptul. Apelurile și estimarea gas-ului nu au nevoie de fereastră. Context: [Semnare post-cuantică](/developer-guide/post-quantum-signing) și [Dezvoltare EVM](/developer-guide/evm-development#evm-window).

### Propunerea {#proposal}

Șase flaguri fixate sau doar relaxabile la creare (`require_auth`, `freezable`, `pausable`, `non_transferable`, `supply_cap`, `require_hybrid_signature`); roluri (emitent, agenți, auditori, agenți de identitate, emitenți de claim-uri, atestatori); verificări de transfer ordonate; freeze, freeze parțial, clawback și transfer forțat cu un motiv înregistrat; identități cu claim-uri, dar fără date personale pe lanț; un registru de module de conformitate versionate (`identity-verified`, `country-allowlist`, `country-blocklist`, `max-holders`, `max-balance`, `attestation-fresh`); instrucțiuni de decontare cu afirmări; atestări cu starea `FRESH`, `STALE` sau `MISSING`. Specificația este `docs/proposal.md` din repository. Unde textul și mock-ul nu coincid, textul reprezintă comportamentul intenționat. Toate acestea sunt un design: nimic din ele nu există pe o rețea QoreChain.

## Cum se utilizează {#how-to-use}

### Instalare {#install}

| Parte | Instalare | Platformă minimă |
|---|---|---|
| Contracte Solidity (din GitHub) | `git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit` (tag `v0.1.0`), sau ca dependență Foundry: `forge install qorechain/qorechain-asset-kit@v0.1.0` | Foundry; solc 0.8.28 (fișierele T-REX și ONCHAINID folosesc 0.8.17); `evm_version = "cancun"` |
| Java | `implementation("io.github.qorechain:asset-kit:0.1.0")` (Maven `io.github.qorechain:asset-kit:0.1.0`) | Java 17 |
| Go | `go get github.com/qorechain/qorechain-asset-kit/clients/go@v0.1.0` (pachetul `assetkit`) | Go 1.23 |
| Python | **În curând** pe PyPI ca `qorechain-asset-kit`; încă nepublicat. Astăzi, dintr-o clonă: `cd clients/python && python -m pip install .` (import `qorechain_asset_kit`) | Python 3.10 |
| TypeScript | **În curând** pe npm ca `@qorechain/asset-kit`; încă nepublicat. Astăzi, dintr-o clonă: `pnpm install && pnpm -r build` | Node.js 22.12 |
| Consola pentru emitenți | Dintr-o clonă: `pnpm install`, apoi `pnpm --filter @qorechain/issuer-console dev` (nepublicată ca pachet) | Un browser cu un portofel EIP-6963 |

README-ul repository-ului și README-ul clientului TypeScript importă din `@qorechain/asset-kit` ca și cum ar fi instalat. Aceasta funcționează doar dintr-o clonă, până la release-ul npm.

Cu `forge install`, contractele se află sub `lib/qorechain-asset-kit/contracts/`, iar dependențele lor sub `lib/qorechain-asset-kit/contracts/lib/`. Remapările care compilează guard-ul, regula CMTAT și vault-urile:

```
qorechain-asset-kit/=lib/qorechain-asset-kit/contracts/src/
@openzeppelin/contracts/=lib/qorechain-asset-kit/contracts/lib/openzeppelin-contracts/contracts/
CMTAT/=lib/qorechain-asset-kit/contracts/lib/CMTAT/contracts/
```

### Quickstart 1: construiește și testează contractele (offline) {#quickstart-build}

Din README-ul repository-ului. Fără rețea, fără cont.

```bash
git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit
cd qorechain-asset-kit/contracts
forge build && forge test
```

Rezultatul observat se termină cu `33 tests passed, 0 failed, 0 skipped (33 total tests)`.

### Quickstart 2: rulează o implementare de probă (dry run) pe testnet {#quickstart-dry-run}

Fără `--broadcast`, Foundry simulează față de starea testnet-ului și nu trimite nimic. Orice adresă funcționează ca `--sender` pentru un dry run.

```bash
forge script script/DeployCmtat.s.sol --rpc-url qorechain_testnet --sender <deployer>
```

`qorechain_testnet` este definit în `foundry.toml` ca `https://evm-testnet.qore.host`. Preflight-ul afișează chain ID-ul (9800), `pqcKeyStatus precompile: active` și starea cheii implementatorului. Pentru o adresă fără cheie adaugă `Broadcasting would fail: register an ML-DSA-87 key and open an EVM window first.` Apoi afișează adresele pe care le-ar avea guard-ul, regula și token-ul. Aceeași comandă față de mainnet se oprește cu `QoreChain mainnet: the hybrid-holder guard is testnet only`. `script/erc3643/DeployErc3643.s.sol` și `script/DeployVaults.s.sol` rulează la fel. Variabile de mediu opționale: `CMTAT_ADMIN`, `CMTAT_NAME`, `CMTAT_SYMBOL`, `CMTAT_TOKEN_ID`, `CMTAT_TERMS_URI`, `TREX_AGENT`, `TREX_SALT`, `VAULT_ASSET`, `VAULT_GUARD`.

### Înainte de a transmite pe testnet {#before-broadcast}

1. Folosește un cont de testnet pe care îl controlezi, cu puțin QOR de testnet (vezi [Faucet](/dashboard/faucet)). Nu folosi niciodată o mnemonică de mainnet și nu alimenta niciodată fraza publică de test folosită în exemple.
2. Înregistrează-i cheia ML-DSA-87 cu dovadă de posesie (exemplul `examples/register-and-send` din [QoreSign](/qoresign/overview) înregistrează una).
3. Deschide o fereastră de autorizare EVM cu setările din [Trimiterea unei tranzacții EVM](#native-prerequisites), cu `allowed_targets` gol. [QoreChain SDK](/sdk/overview) construiește mesajul (`openEvmWindow` în grupul de mesaje `pqc` în TypeScript, `qorsdk.msg.pqc.open_evm_window` în Python) și citește înapoi fereastra (`fetchEvmWindow`, `get_evm_window`).
4. Rulează scriptul cu `--broadcast` și configurația portofelului tău.
5. Exceptează fiecare contract care trebuie să dețină token-ul (vault-uri, escrow-uri) cu `guard.setExempt`, înregistrează deținătorii în conformitatea proprie a token-ului și verifică fiecare deținător cu `guard.isHybridHolder(address)` înainte de mint.

### Quickstart 3: consola pentru emitenți (testnet) {#quickstart-console}

```bash
pnpm install
pnpm --filter @qorechain/issuer-console dev
```

Conectează un portofel EIP-6963, comută la QoreChain Testnet, apoi creează un token CMTAT sau deschide unul existent după adresă. Pe lanțul 9801 consola afișează un avertisment și dezactivează crearea de token-uri. Consola nu înregistrează chei și nu deschide ferestre; fă mai întâi pașii 2 și 3 de mai sus.

### Quickstart 4: construiește față de modulele propuse cu MockChain (Python, offline) {#quickstart-python}

Din README-ul clientului Python. Până la release-ul PyPI, instalează dintr-o clonă (vezi [Instalare](#install)).

```python
from qorechain_asset_kit import MockChain, MockChainError, asset

chain = MockChain()
chain.asset.create_asset(issuer="qor1issuer", asset_id="bond-2030", flags={"freezable": True})
chain.asset.mint(agent="qor1issuer", asset_id="bond-2030", to="qor1alice", amount="100")
chain.asset.freeze(agent="qor1issuer", asset_id="bond-2030", holder="qor1alice", frozen=True)
try:
    chain.asset.transfer(from_="qor1alice", asset_id="bond-2030", to="qor1bob", amount="1")
except MockChainError as e:
    print(e.code)  # ERROR_CODE_ADDRESS_FROZEN
```

Rezultat observat: `ERROR_CODE_ADDRESS_FROZEN`. Același apel pe `ChainClient()` ridică `ChainUpgradeRequired` cu `module == "x/asset"` și `code == "CHAIN_UPGRADE_REQUIRED"`.

### Quickstart 5: același lucru în Go (proxy de module v0.1.0) {#quickstart-go}

Din README-ul clientului Go, împachetat într-un pachet `main`.

```go
package main

import (
	"context"
	"errors"
	"fmt"

	assetkit "github.com/qorechain/qorechain-asset-kit/clients/go"
	assetv1 "github.com/qorechain/qorechain-asset-kit/clients/go/gen/qorechain/asset/v1"
)

func main() {
	ctx := context.Background()
	chain := assetkit.NewMockChain()
	_, err := chain.Asset().CreateAsset(ctx, &assetv1.MsgCreateAsset{
		Issuer: "qor1issuer", AssetId: "bond-2030", Flags: &assetv1.RwaFlagsV0{Freezable: true},
	})
	_, err = chain.Asset().Mint(ctx, &assetv1.MsgMint{Agent: "qor1issuer", AssetId: "bond-2030", To: "qor1alice", Amount: "100"})
	fmt.Println("mock mint error:", err)

	_, err = assetkit.NewChainClient().Asset().Mint(ctx, &assetv1.MsgMint{})
	var upgrade *assetkit.ChainUpgradeRequired
	fmt.Println(errors.As(err, &upgrade), upgrade.Module)
}
```

Rezultat observat: `mock mint error: <nil>`, apoi `true x/asset`. README-ul clientului Java are exemplul echivalent cu `MockChain`, `MsgCreateAsset.newBuilder()` și `MockChainError.code()`.

:::note
README-urile Go și TypeScript din repository conțin mici erori în fragmentele lor, care vor fi corectate în 0.1.1. Exemplul Go de mai sus este varianta corectată.
:::

## API principal {#main-api}

### Contracte {#api-contracts}

| Nume | Ce face |
|---|---|
| `QoreChainHybridHolderGuard(initialOwner)` | Guard peste `0x0A02`: `isHybridHolder`, `isEligible`, `requireHybridHolder` (revert `HybridKeyRequired`), `keyStatus`, `decodeKeyStatus`, `precompileActive`, `setExempt`, `exempt` |
| `QoreChainHybridHolderRule(guard)` | Regulă CMTAT: `detectTransferRestriction`, `detectTransferRestrictionFrom`, `canTransfer`, `canTransferFrom`, `messageForTransferRestriction`, `canReturnTransferRestrictionCode`; codurile `CODE_FROM_NOT_HYBRID` (60), `CODE_TO_NOT_HYBRID` (61), `CODE_SPENDER_NOT_HYBRID` (62) |
| `QoreChainHybridHolderModule(guard)` | Modul ERC-3643: `moduleCheck`, `bindCompliance`, `unbindCompliance`, `isComplianceBound`, `isPlugAndPlay`, `name` |
| `QoreChainRwaVault(asset, name, symbol, eligibility)` | Vault ERC-4626 cu cote restricționate |
| `QoreChainRwaAsyncVault(asset, name, symbol, eligibility, admin)` | Vault ERC-7540: `requestDeposit`, `fulfillDeposit`, `requestRedeem`, `fulfillRedeem`, `pendingDepositRequest`, `claimableDepositRequest`, `pendingRedeemRequest`, `claimableRedeemRequest`, `setOperator`, și `deposit`, `mint`, `redeem`, `withdraw` cu un controler; `FULFILLER_ROLE`; previzualizările dau revert prin design |
| `IHolderEligibility` | `isEligible(address)`: conectează o altă politică de eligibilitate pentru vault-uri |
| `IERC7518` | Schiță de interfață pentru partiții |
| `forge script script/DeployCmtat.s.sol` | Guard, regulă și token CMTAT |
| `forge script script/erc3643/DeployErc3643.s.sol` | Infrastructură T-REX, guard, modul și o suită de token |
| `forge script script/DeployVaults.s.sol` | Ambele vault-uri peste un token restricționat, cu excepții în guard |

### Clienți (propunere) {#api-clients}

Sunt afișate numele din TypeScript și Java; Python folosește snake_case (`create_asset`), iar Go folosește capitalizarea Go în spatele unor accesori (`chain.Asset().CreateAsset(ctx, msg)`).

| Nume | Ce face |
|---|---|
| `ChainClient` (în Go `NewChainClient()`) | Fiecare apel eșuează cu `ChainUpgradeRequired`; nicio cerere în rețea |
| `MockChain` (în Go `NewMockChain()`) | Regulile propuse în memorie; refuzurile aruncă `MockChainError` |
| `asset` | `createAsset`, `updateFlags`, `setRole`, `proposeIssuer`, `acceptIssuer`, `authorizeHolder`, `mint`, `burn`, `transfer`, `freeze`, `freezePartial`, `pause`, `clawback`, `forceTransfer`, `setTerms`, `retire`; interogări `asset`, `assets`, `holder`, `holders`, `roles`, `canTransfer`, `params` |
| `identity` | `registerIdentity`, `updateCountry`, `bindAddress`, `unbindAddress`, `addClaim`, `revokeClaim`, `removeIdentity`, `setClaimIssuer`; interogări `identity`, `identityByAddress`, `claimIssuers`, `isVerified` |
| `compliance` | `registerModule`, `setModuleStatus`, `bindModule`, `unbindModule`, `migrateBinding`; interogări `modules`, `module`, `bindings`, `check` |
| `settlement` | `createVenue`, `createInstruction`, `affirm`, `withdrawAffirmation`, `executeInstruction`, `cancelInstruction`; interogări `instruction`, `instructionsByParty`, `venue` |
| `attest` | `setAttester`, `submit`, `revoke`; interogări `latest`, `history`, `attesters` |
| Helper-e mock | `setHybridKey`, `fundBank`, `bankBalance`, `advance(blocks, seconds)`, `events(type)`, `defineModuleLogic(moduleId, fn)` (Python are și `has_hybrid_key`, `height`, `time`) |

## Cum se accesează {#how-to-access}

| | Testnet `qorechain-diana` | Mainnet `qorechain-vladi` |
|---|---|---|
| EVM chain ID | 9800 | 9801 |
| EVM RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| Precompilarea `pqcKeyStatus` `0x0A02` | Activă | Neactivă (`eth_call` returnează date goale); activarea ar necesita o decizie de guvernanță, niciuna luată |
| Guard, regulă, modul pentru deținătorul hibrid | Funcționează | Fail closed: orice adresă neexceptată este neeligibilă, deci token-urile nu se pot muta între deținători obișnuiți |
| Scripturi de implementare | Dry run și broadcast | Refuză să ruleze |
| Consola pentru emitenți | Completă | Avertisment; crearea de token-uri dezactivată |
| Module native (`x/asset` și celelalte) | Nu există | Nu există |

Cerințe pentru orice trimite o tranzacție EVM: un cont cu o cheie ML-DSA-87 înregistrată (cu dovadă de posesie) și o fereastră de autorizare EVM deschisă, ambele configurate pe traseul native cu o tranzacție semnată hibrid. Citirile (`eth_call`, loguri, estimarea gas-ului, dry run-urile) nu au nevoie de niciuna. `MockChain` și testele Foundry nu au nevoie deloc de rețea. Alte endpoint-uri și faucet-ul: [Conectarea la testnet](/getting-started/connecting-to-testnet) și [Conectarea la mainnet](/getting-started/connecting-to-mainnet).

Comportamente ale rețelei de ținut minte: `PREVRANDAO` este o constantă (niciun contract din kit nu îl folosește); tranzacțiile blob (tip 3) sunt refuzate, iar tipurile 0, 1, 2 și 4 sunt acceptate; delegările EIP-7702 necesită propriul consimțământ post-cuantic al autorității (`MsgAuthorizeEVMDelegation`).

## Unde este publicat {#where-published}

Verificat live la 28 octombrie 2026 (release-ul GitHub, Maven Central și proxy-ul Go servesc 0.1.0; PyPI și npm returnează 404).

| Registru | Pachet | Versiune | Link |
|---|---|---|---|
| Maven Central | `io.github.qorechain:asset-kit` | 0.1.0 | https://central.sonatype.com/artifact/io.github.qorechain/asset-kit |
| Proxy-ul de module Go | `github.com/qorechain/qorechain-asset-kit/clients/go` | v0.1.0 (tag `clients/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-asset-kit/clients/go |
| PyPI | `qorechain-asset-kit` | **În curând** (încă nu este pe PyPI) | |
| npm | `@qorechain/asset-kit` | **În curând** (nepublicat) | |
| GitHub (contracte Solidity, consolă pentru emitenți, protos, documentație, șabloane juridice) | `qorechain/qorechain-asset-kit` | release v0.1.0 | https://github.com/qorechain/qorechain-asset-kit/releases/tag/v0.1.0 |

Repository: https://github.com/qorechain/qorechain-asset-kit. Întreținător: QoreChain Association.

**Licențe.** Codul este Apache-2.0, cu excepția `contracts/script/erc3643/` și `contracts/test/erc3643/`, care se compilează împreună cu implementarea de referință ERC-3643 și sunt GPL-3.0-or-later. Documentația din `docs/` și `legal/` este Apache-2.0. Dependențele își păstrează propriile licențe și sunt folosite nemodificate ca submodule git: T-REX și ONCHAINID (GPL-3.0), CMTAT (MPL-2.0), OpenZeppelin (MIT). Un token ERC-3643 implementat este cod T-REX sub licența lui; un token CMTAT implementat este sub MPL-2.0. Fișierul `NOTICE` enumeră fiecare dependență.

## Limite și probleme cunoscute {#limits}

- **Modulele native nu există.** `x/asset`, `x/identity`, `x/compliance`, `x/settlement` și `x/attest` sunt o propunere. Nu este programat niciun upgrade care să le adauge. `ChainClient` nu poate reuși niciodată în 0.1.0; `MockChain` este o unealtă de dezvoltare, nu un lanț.
- **Verificarea deținătorului este doar pe testnet.** Pe mainnet guard-ul eșuează închis; o implementare pe mainnet nu se poate baza pe el.
- **Puterile agenților ocolesc verificarea deținătorului.** În ambele standarde, transferul forțat și recuperarea portofelului de către un agent nu consultă regula sau modulul: `forcedTransfer` din CMTAT și `forcedTransfer` și `recoveryAddress` din ERC-3643 pot plasa token-uri pe o adresă care nu are cheie. Restricționează cine deține rolurile de agent.
- **Spender-ii `transferFrom` din ERC-3643 nu sunt verificați** de modul, deoarece ERC-3643 nu transmite spender-ul către conformitate. Regula CMTAT verifică spender-ul.
- **Burn-urile și răscumpărările rămân deschise** deținătorilor care și-au pierdut eligibilitatea, prin design, în ambele standarde de token și în ambele vault-uri.
- **Cererile ERC-7540 în așteptare nu pot fi anulate** în 0.1.0. Dacă un agent mută active din afara vault-ului asincron, `totalAssets` arată zero, iar revendicările care au nevoie de activele lipsă eșuează până când emitentul restabilește soldul.
- **Fără intrare de evaluare externă** în vault-ul ERC-7540; conversia folosește soldul propriu al vault-ului per cotă.
- **Fără livrare contra plată și fără atestări pe EVM.** Acestea există doar ca propusele `x/settlement` și `x/attest`.
- **ERC-7518 este o schiță de interfață**, nu o implementare. Partițiile pot fi modelate astăzi cu câte un token pe clasă sau tranșă, care partajează același registru de identitate sau aceeași regulă.
- **CMTA RuleEngine v3** este încă publicat ca release candidates; regula funcționează direct ca `ruleEngine` al unui token și anunță ambele id-uri de interfață de regulă (`0x2497d6cb`, `0xb1a69752`).
- **Consola pentru emitenți** nu înregistrează chei, nu deschide ferestre, nu implementează suite ERC-3643 sau vault-uri și nu gestionează roluri CMTAT, freeze-uri parțiale, documente sau snapshot-uri.
- **Python și TypeScript nu sunt în registrele lor.** Folosește o clonă până la release-urile PyPI și npm; această pagină nu oferă nicio comandă de instalare din registru pentru ele.
- **Erori în README.** Fragmentele Go și TypeScript din README-urile repository-ului au mici erori, care vor fi corectate în 0.1.1. Folosește quickstart-urile de pe această pagină.
- **Șabloane juridice.** `legal/` conține trei ciorne pentru discuție: un titlu bazat pe registru în Elveția (art. 973d până la 973i din Codul obligațiilor), termeni de token din Liechtenstein conform TVTG (abordarea „token container") și un contur de angajare pentru un operator în cadrul EU DLT Pilot Regime (Regulamentul (UE) 2022/858). Ele nu au fost revizuite de un consilier juridic, nu reprezintă consultanță juridică și trebuie revizuite de un consilier calificat din jurisdicția relevantă înainte de orice utilizare. Folosirea lor sau a kitului nu spune nimic despre dacă o anumită emisiune îndeplinește vreo cerință legală. QoreChain Association nu acționează ca emitent, registrator, custode, loc de tranzacționare sau consilier juridic pentru niciun activ.
- **Pre-1.0.** Fișierele proto propuse se pot schimba în orice versiune minoră.

## Note de securitate {#security}

- **Neauditat.** Contractele nu au avut nicio revizuire independentă. Nu le folosi pentru a deține valoare reală fără una.
- Cheile rămân la proprietarii lor: guard-ul citește din lanț starea cheii publice și nu manipulează niciodată o cheie privată. Cheile implementatorului, ale proprietarului și ale agenților sunt conturi EVM obișnuite cu chei ML-DSA-87 înregistrate; păstrează rolurile de emitent, proprietar al guard-ului și agent pe conturi separate, bine protejate.
- Proprietarul guard-ului controlează excepțiile. O excepție face o adresă eligibilă fără cheie; acordă-o contractelor care dețin activul prin design și urmărește evenimentele `ExemptionSet`.
- Rolurile de agent pot ocoli verificarea deținătorului (transfer forțat, recuperare). Tratează-le drept cele mai sensibile roluri ale token-ului.
- Guard-ul eșuează închis și decodează strict răspunsul precompilării; nu tratează niciodată o cheie fără dovadă de posesie ca validă.
- Build-ul de producție al consolei pentru emitenți setează o Content-Security-Policy cu `connect-src 'none'`: pagina nu face nicio cerere de rețea proprie, iar totul trece prin portofel.
- `MockChain` are încredere în câmpurile de semnatar ale mesajelor (nu există semnături); nu este o graniță de securitate.
- Problemele din CMTAT, implementarea de referință ERC-3643, ONCHAINID sau OpenZeppelin ar trebui raportate și întreținătorilor lor.
- Raportează vulnerabilitățile kitului în privat la security@qore.network.

## Pagini conexe {#related}

- [QoreChain SDK](/sdk/overview): înregistrarea unei chei ML-DSA-87 și deschiderea unei ferestre de autorizare EVM (`openEvmWindow`, `fetchEvmWindow`, `get_evm_window`).
- [QoreSign](/qoresign/overview): semnare hibridă pentru tranzacțiile de pe traseul native care înregistrează chei și deschid ferestre.
- [Semnare post-cuantică](/developer-guide/post-quantum-signing) și [conturi și semnare PQC](/sdk/concepts/accounts-pqc): înregistrarea cheilor și semnătura hibridă.
- [Dezvoltare EVM](/developer-guide/evm-development#evm-window): fereastra de autorizare EVM.
- [Precompilările EVM](/developer-guide/evm-precompiles): `0x0A01` și `0x0A02`, active doar pe testnet.
- [Chain developer kit](/developer-tools/chain-dev-sdk): șabloane Foundry, Hardhat și viem și helper-e pentru ferestre (SDK 0.11.0, în curând).
- [Custody kit](/developer-tools/custody-kit) și [QoreScan](/developer-tools/qorescan): kituri învecinate pentru custozi și pentru inventare de criptografie.
- [Pachete pentru dezvoltatori](/developer-tools/overview): fiecare pachet și starea lui în registru.
- Standarde din amonte: ERC-3643, CMTAT, ERC-4626, ERC-7540, ERC-7518.
