---
slug: /developer-tools/asset-kit
title: QoreChain Asset Kit
sidebar_label: Asset Kit
sidebar_position: 35
---

# QoreChain Asset Kit

QoreChain Asset Kit è uno strumento open source per emettere e gestire token con permessi (permissioned) che rappresentano asset del mondo reale su QoreChain. Ha due parti con stato diverso. Una parte è un insieme di contratti EVM che oggi girano sul QoreChain EVM Engine: adapter per due standard di token aperti per asset regolamentati (ERC-3643 e CMTAT), vault con quote ristrette e un controllo specifico di QoreChain che richiede a ogni detentore di avere una chiave ML-DSA-87 registrata. L'altra parte è una **proposta** di moduli nativi della chain, pubblicata come interfacce protobuf con client in quattro linguaggi e un mock in memoria, così che le applicazioni possano essere progettate e testate rispetto alle regole proposte.

È pensato per emittenti, transfer agent, amministratori di fondi, team di compliance e legali, e integratori che vogliono prototipare un token regolamentato sulla testnet di QoreChain. Versione **0.1.0**, Apache-2.0 (con le eccezioni di licenza elencate in [Dove è pubblicato](#where-published)), mantenuto dalla QoreChain Association. È pre-1.0 e **non sottoposto ad audit**.

:::caution Che cosa è attivo e che cosa no
- **Funziona oggi, solo su testnet:** i contratti EVM, gli script di deploy Foundry e la console dell'emittente, su `qorechain-diana` (EVM chain ID 9800). Il controllo del detentore legge il precompile `pqcKeyStatus` a `0x0A02`, che è attivo sulla testnet e **non è attivo sulla mainnet**.
- **Mainnet (`qorechain-vladi`, EVM chain ID 9801):** il controllo del detentore **fallisce in modo chiuso (fail closed)**. Ogni indirizzo che non è esplicitamente esente conta come non idoneo, quindi un token protetto dal guard non può passare tra detentori ordinari. Gli script di deploy si rifiutano di girare sulla chain 9801.
- **Una proposta, non attiva da nessuna parte:** i moduli nativi `x/asset`, `x/identity`, `x/compliance`, `x/settlement` e `x/attest` non esistono su nessuna rete QoreChain e non è previsto alcun upgrade che li aggiunga. I client per essi possono parlare solo con un mock in memoria.
- **I template legali** nel repository sono bozze non riviste, da discutere con un consulente legale. Non sono consulenza legale.
:::

## Innovazioni {#innovations}

- **Un controllo del detentore post-quantistico in aggiunta ai controlli propri dello standard.** Il guard legge `pqcKeyStatus(address)` a `0x0A02` e accetta un indirizzo solo se restituisce `registered`, algorithm id 1 (ML-DSA-87) e `possessionProven`. Una chiave registrata senza prova di possesso potrebbe appartenere a qualcun altro, quindi non conta. Ogni controllo dello standard upstream (registro delle identità, claim topic, freeze, pausa, trasferimento forzato) continua ad applicarsi; il controllo si aggiunge a essi.
- **Fail closed, con decodifica rigorosa.** Il guard chiama il precompile con una quantità fissa di gas e decodifica la risposta in modo rigoroso. Una risposta nel vecchio layout a tre campi, una risposta malformata o nessuna risposta viene trattata come "nessuna chiave". Dove il precompile non è attivo, ogni indirizzo non esente è non idoneo.
- **Lo stesso guard dietro tre adapter.** `QoreChainHybridHolderRule` si inserisce in un token CMTAT v3 come `ruleEngine` (oppure come regola dentro un RuleEngine CMTA) con i codici di restrizione 60, 61 e 62; `QoreChainHybridHolderModule` si inserisce nella modular compliance di ERC-3643 come modulo plug-and-play; i vault accettano qualsiasi policy `IHolderEligibility`, guard incluso.
- **Quote di vault che non possono riciclare un token ristretto.** `QoreChainRwaVault` (ERC-4626) e `QoreChainRwaAsyncVault` (ERC-7540, richieste liquidate in batch da un operatore con `FULFILLER_ROLE`) controllano il lato ricevente di ogni movimento di quote: `maxDeposit` e `maxMint` restituiscono zero per un ricevente non idoneo. I rimborsi non vengono mai rifiutati.
- **Contratti upstream usati senza modifiche.** T-REX 4.1.6, ONCHAINID 2.2.1, CMTAT 3.2.0 e OpenZeppelin sono git submodule, non copie.
- **Una proposta che si può testare prima che esista.** Ogni chiamata sul `ChainClient` fallisce con `ChainUpgradeRequired` (codice `CHAIN_UPGRADE_REQUIRED`, più il nome del modulo) senza inviare alcuna richiesta di rete. Un `MockChain` implementa in memoria le regole proposte e rifiuta con `MockChainError`, che porta il nome del codice di errore proposto, per esempio `ERROR_CODE_ADDRESS_FROZEN`. Un'applicazione può essere scritta contro il mock mantenendo collegato il client reale, così un upgrade mancante viene segnalato con chiarezza invece di fallire in silenzio.
- **Una console senza backend.** La console dell'emittente è una pagina React che non fa alcuna richiesta di rete per conto proprio; la build di produzione imposta una Content-Security-Policy con `connect-src 'none'`, e tutto passa dal wallet connesso.
- **Test che girano offline.** 33 test Foundry girano senza rete, usando un test double del precompile.

## Che cosa fa {#what-it-does}

**Funziona oggi su QoreChain EVM (testnet):**

- **`QoreChainHybridHolderGuard`.** Indica se un indirizzo ha una chiave ML-DSA-87 registrata con prova di possesso (`isHybridHolder`, `isEligible`, `requireHybridHolder`, `keyStatus`, `precompileActive`). Esenzioni gestite dal proprietario per contratti come vault ed escrow (`setExempt`, evento `ExemptionSet` con un motivo). La proprietà si trasferisce in due passaggi (`Ownable2Step` di OpenZeppelin).
- **`QoreChainHybridHolderRule`.** Una regola di trasferimento CMTAT v3 collegata al guard. Codici di restrizione 60 (mittente), 61 (ricevente) e 62 (spender) tramite `detectTransferRestriction`, `detectTransferRestrictionFrom` e `messageForTransferRestriction`.
- **`QoreChainHybridHolderModule`.** Un modulo di modular compliance ERC-3643 (T-REX v4) collegato al guard. `moduleCheck` controlla mittente e ricevente. Nessuna configurazione per singola compliance.
- **`QoreChainRwaVault` e `QoreChainRwaAsyncVault`.** Descritti sopra.
- **`IERC7518`.** Una bozza di interfaccia per le partizioni ERC-7518, senza implementazione; il suo id ERC-165 `0x5a264a5d` è verificato da un test.
- **Script di deploy (Foundry).** `script/DeployCmtat.s.sol`, `script/erc3643/DeployErc3643.s.sol` e `script/DeployVaults.s.sol`, con un preflight condiviso (`script/QoreChainTestnet.sol`) che indica se il precompile risponde e lo stato della chiave del deployer, e rifiuta la chain 9801.
- **Console dell'emittente** (`packages/issuer-console`). Si connette a qualsiasi wallet EIP-6963, aggiunge o passa a QoreChain Testnet, crea un token CMTAT protetto dal guard (guard, regola e token, come in `DeployCmtat.s.sol`), apre token CMTAT o ERC-3643 esistenti, esegue azioni da agente (mint, burn, freeze, unfreeze, trasferimento forzato, pausa, ripresa) e mostra i detentori e un log di audit costruito dagli eventi della chain.

**Proposta (non sulla chain):**

- Interfacce protobuf in `proto/` per `x/asset`, `x/identity`, `x/compliance`, `x/settlement` e `x/attest`, e la loro semantica in `docs/proposal.md`.
- Client in TypeScript, Python, Go e Java: tipi generati, il `ChainClient` e il `MockChain`.

**Documenti di riferimento nel repository:**

- `docs/evm-adapters.md`: i contratti, le licenze upstream, il deploy su testnet.
- `docs/technology-standards.md`: una bozza che descrive le reti come le dovrebbe vedere un emittente o un auditor (affidabilità, governance, autorità di upgrade, ordinamento delle transazioni, osservabilità, gestione degli incidenti, gestione delle chiavi), con ogni fatto etichettato Verified, Documented, Not measured o Not published.
- `legal/`: tre template da discutere (vedi [Limiti](#limits)).

## Casi d'uso {#use-cases}

1. **Un emittente prototipa un token con permessi sulla testnet.** L'emittente distribuisce un token CMTAT con `DeployCmtat.s.sol` (o dalla console dell'emittente), oppure una suite ERC-3643 completa con `DeployErc3643.s.sol`, e prova freeze, pausa, trasferimento forzato e il controllo del detentore su `qorechain-diana` prima di qualsiasi decisione su un'emissione reale.
2. **Un amministratore di fondi gestisce sottoscrizioni e rimborsi tramite vault con quote ristrette.** Gli investitori richiedono depositi su `QoreChainRwaAsyncVault`; l'amministratore li elabora in batch con `fulfillDeposit` e `fulfillRedeem`; le quote possono essere ricevute solo da indirizzi idonei, mentre i rimborsi restano aperti a chiunque detenga quote.
3. **Un team di compliance richiede la registrazione di una chiave post-quantistica per ogni detentore.** Aggiungere `QoreChainHybridHolderRule` (CMTAT) o `QoreChainHybridHolderModule` (ERC-3643) significa che un token può essere coniato o trasferito solo a indirizzi con una chiave ML-DSA-87 registrata e con possesso dimostrato, in aggiunta ai controlli di identità e allowlist dello standard.
4. **Un integratore costruisce contro i moduli nativi proposti.** Un wallet, un registro o un back office scrive il codice contro `MockChain` in TypeScript, Python, Go o Java, verifica con asserzioni i suoi eventi e codici di errore, e mantiene collegato `ChainClient`.
5. **Un team di prodotto progetta flussi di consegna contro pagamento (delivery-versus-payment) e di attestazione.** Il proposto `x/settlement` (istruzioni con affermazione bilaterale, tutte le gambe o nessuna) e `x/attest` (dichiarazioni con un periodo di validità e obsolescenza) si possono esercitare in `MockChain` per progettare i flussi utente, sapendo che nessuno dei due esiste sulla chain.
6. **Un team legale avvia la documentazione con un consulente.** I template per un titolo svizzero basato su registro (ledger-based security), i termini di token del Liechtenstein secondo il TVTG e un incarico secondo l'EU DLT Pilot Regime offrono una struttura e una sezione di mappatura tecnica da compilare. Un consulente qualificato della giurisdizione rivede tutto prima di qualsiasi uso.
7. **Un revisore di due diligence legge i fatti della rete.** `docs/technology-standards.md` elenca che cosa si può verificare sulle reti live e che cosa non è misurato o non è pubblicato, con le fonti.

## Come funziona {#how-it-works}

### Il controllo del detentore su EVM {#holder-check}

Il precompile a `0x0A02` risponde a `pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey, bool possessionProven)`. Il guard richiede `registered && algorithmId == 1 && possessionProven`. Questo fa sì che il guard fallisca in modo chiuso: dove il precompile non è attivo, ogni indirizzo che non è esplicitamente esente è non idoneo. Vedi [Precompile EVM](/developer-guide/evm-precompiles) per il precompile stesso e il suo stato di rete.

```
                 CMTAT v3 token  -- ruleEngine -->  QoreChainHybridHolderRule --+
                                                                                +--> QoreChainHybridHolderGuard --> 0x0A02 pqcKeyStatus
ERC-3643 token -> ModularCompliance - module -->  QoreChainHybridHolderModule --+         (exemptions for contracts)
                                                                                |
       ERC-4626 / ERC-7540 vault shares ----------- IHolderEligibility ---------+
```

Il controllo è additivo. Ogni controllo dello standard upstream continua ad applicarsi: registro delle identità ERC-3643 (ONCHAINID), claim topic, trusted issuer, freeze, freeze parziale, pausa, trasferimento forzato e recupero; freeze, freeze parziale, pausa, trasferimento forzato, documenti e snapshot di CMTAT.

### Che cosa copre il controllo {#coverage}

Conta la ricezione: un mint o un trasferimento verso un indirizzo senza chiave viene rifiutato. La regola CMTAT controlla anche il mittente e, per `transferFrom`, lo spender. Il modulo ERC-3643 controlla mittente e ricevente; ERC-3643 non passa lo spender ai moduli di compliance, quindi uno spender di `transferFrom` lì non viene controllato. I burn non vengono mai rifiutati (in ERC-3643, `burn` non consulta affatto i moduli di compliance), quindi un detentore che ha perso l'idoneità può comunque essere rimborsato.

### Vault {#vaults}

Entrambi i vault controllano il lato ricevente di ogni movimento di quote; i rimborsi non vengono mai rifiutati. Nel vault ERC-7540 le richieste sono aggregate per controller (request id 0). Il fulfiller converte i depositi in sospeso in quote al rapporto asset per quota del vault stesso al momento dell'evasione, senza alcun input di valutazione esterno; i controller poi reclamano con `deposit` o `mint`, oppure `redeem` o `withdraw`. Il contratto del vault stesso deve poter detenere il token sottostante: registrato nel registro delle identità ERC-3643 o nell'allowlist CMTAT, ed esente nel guard (`DeployVaults.s.sol` imposta le esenzioni del guard).

### Inviare una transazione EVM su QoreChain {#native-prerequisites}

Ogni transazione EVM su QoreChain è ammessa solo se il mittente ha:

1. una chiave ML-DSA-87 registrata, registrata con `MsgRegisterPQCKeyV2` e una prova di possesso, e
2. una finestra di autorizzazione EVM aperta, aperta da `/qorechain.pqc.v1.MsgOpenEVMWindow` in una transazione del rail nativo con firma ibrida (secp256k1 più ML-DSA-87).

Per i deploy la finestra richiede `allowed_targets` **vuoto** (una finestra limitata a dei target rifiuta la creazione di contratti), `max_txs` almeno pari al numero di transazioni, `max_value` che copra il valore più la commissione massima di ogni transazione, `blocks` abbastanza lungo (al massimo 17,280) e `native_only` falso. Aprire la finestra fa avanzare la sequenza dell'account, che è anche il nonce EVM: apri prima la finestra, poi esegui lo script. Le chiamate e la stima del gas non richiedono alcuna finestra. Approfondimenti: [Firma post-quantistica](/developer-guide/post-quantum-signing) e [Sviluppo EVM](/developer-guide/evm-development#evm-window).

### La proposta {#proposal}

Sei flag fissati alla creazione o modificabili solo in senso restrittivo (`require_auth`, `freezable`, `pausable`, `non_transferable`, `supply_cap`, `require_hybrid_signature`); ruoli (emittente, agenti, auditor, agenti di identità, emittenti di claim, attestatori); controlli di trasferimento ordinati; freeze, freeze parziale, clawback e trasferimento forzato con un motivo registrato; identità con claim ma senza dati personali sulla chain; un registro di moduli di compliance versionati (`identity-verified`, `country-allowlist`, `country-blocklist`, `max-holders`, `max-balance`, `attestation-fresh`); istruzioni di regolamento con affermazioni; attestazioni con stato `FRESH`, `STALE` o `MISSING`. La specifica è `docs/proposal.md` nel repository. Dove il testo e il mock non concordano, il testo è il comportamento previsto. Tutto questo è un progetto: nulla di tutto ciò esiste su una rete QoreChain.

## Come si usa {#how-to-use}

### Installazione {#install}

| Parte | Installazione | Piattaforma minima |
|---|---|---|
| Contratti Solidity (da GitHub) | `git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit` (tag `v0.1.0`), oppure come dipendenza Foundry: `forge install qorechain/qorechain-asset-kit@v0.1.0` | Foundry; solc 0.8.28 (i file di T-REX e ONCHAINID usano 0.8.17); `evm_version = "cancun"` |
| Java | `implementation("io.github.qorechain:asset-kit:0.1.0")` (Maven `io.github.qorechain:asset-kit:0.1.0`) | Java 17 |
| Go | `go get github.com/qorechain/qorechain-asset-kit/clients/go@v0.1.0` (pacchetto `assetkit`) | Go 1.23 |
| Python | **In arrivo** su PyPI come `qorechain-asset-kit`; non ancora pubblicato. Oggi, da un clone: `cd clients/python && python -m pip install .` (import `qorechain_asset_kit`) | Python 3.10 |
| TypeScript | **In arrivo** su npm come `@qorechain/asset-kit`; non ancora pubblicato. Oggi, da un clone: `pnpm install && pnpm -r build` | Node.js 22.12 |
| Console dell'emittente | Da un clone: `pnpm install`, poi `pnpm --filter @qorechain/issuer-console dev` (non pubblicata come pacchetto) | Un browser con un wallet EIP-6963 |

Il README del repository e il README del client TypeScript importano da `@qorechain/asset-kit` come se fosse installato. Questo funziona solo da un clone, fino alla release su npm.

Con `forge install`, i contratti si trovano in `lib/qorechain-asset-kit/contracts/` e le loro dipendenze in `lib/qorechain-asset-kit/contracts/lib/`. Remapping che compilano il guard, la regola CMTAT e i vault:

```
qorechain-asset-kit/=lib/qorechain-asset-kit/contracts/src/
@openzeppelin/contracts/=lib/qorechain-asset-kit/contracts/lib/openzeppelin-contracts/contracts/
CMTAT/=lib/qorechain-asset-kit/contracts/lib/CMTAT/contracts/
```

### Quickstart 1: compilare e testare i contratti (offline) {#quickstart-build}

Dal README del repository. Nessuna rete, nessun account.

```bash
git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit
cd qorechain-asset-kit/contracts
forge build && forge test
```

L'output osservato termina con `33 tests passed, 0 failed, 0 skipped (33 total tests)`.

### Quickstart 2: dry run di un deploy contro la testnet {#quickstart-dry-run}

Senza `--broadcast`, Foundry simula contro lo stato della testnet e non invia nulla. Per un dry run va bene qualsiasi indirizzo come `--sender`.

```bash
forge script script/DeployCmtat.s.sol --rpc-url qorechain_testnet --sender <deployer>
```

`qorechain_testnet` è definito in `foundry.toml` come `https://evm-testnet.qore.host`. Il preflight stampa il chain ID (9800), `pqcKeyStatus precompile: active` e lo stato della chiave del deployer. Per un indirizzo senza chiave aggiunge `Broadcasting would fail: register an ML-DSA-87 key and open an EVM window first.` Poi stampa gli indirizzi che avrebbero il guard, la regola e il token. Lo stesso comando contro la mainnet si ferma con `QoreChain mainnet: the hybrid-holder guard is testnet only`. `script/erc3643/DeployErc3643.s.sol` e `script/DeployVaults.s.sol` si eseguono allo stesso modo. Variabili d'ambiente opzionali: `CMTAT_ADMIN`, `CMTAT_NAME`, `CMTAT_SYMBOL`, `CMTAT_TOKEN_ID`, `CMTAT_TERMS_URI`, `TREX_AGENT`, `TREX_SALT`, `VAULT_ASSET`, `VAULT_GUARD`.

### Prima di trasmettere sulla testnet {#before-broadcast}

1. Usa un account di testnet che controlli, con un po' di QOR di testnet (vedi il [Faucet](/dashboard/faucet)). Non usare mai una mnemonica di mainnet e non finanziare mai la frase di test pubblica usata negli esempi.
2. Registra la sua chiave ML-DSA-87 con prova di possesso (l'esempio `examples/register-and-send` di [QoreSign](/qoresign/overview) ne registra una).
3. Apri una finestra di autorizzazione EVM con le impostazioni di [Inviare una transazione EVM](#native-prerequisites), con `allowed_targets` vuoto. L'[SDK QoreChain](/sdk/overview) costruisce il messaggio (`openEvmWindow` nel gruppo di messaggi `pqc` in TypeScript, `qorsdk.msg.pqc.open_evm_window` in Python) e rilegge la finestra (`fetchEvmWindow`, `get_evm_window`).
4. Esegui lo script con `--broadcast` e la configurazione del tuo wallet.
5. Esenta ogni contratto che deve detenere il token (vault, escrow) con `guard.setExempt`, registra i detentori nella compliance propria del token e controlla ogni detentore con `guard.isHybridHolder(address)` prima di coniare.

### Quickstart 3: console dell'emittente (testnet) {#quickstart-console}

```bash
pnpm install
pnpm --filter @qorechain/issuer-console dev
```

Connetti un wallet EIP-6963, passa a QoreChain Testnet, poi crea un token CMTAT oppure aprine uno esistente tramite indirizzo. Sulla chain 9801 la console mostra un avviso e disabilita la creazione di token. La console non registra chiavi né apre finestre; esegui prima i passaggi 2 e 3 qui sopra.

### Quickstart 4: costruire contro i moduli proposti con MockChain (Python, offline) {#quickstart-python}

Dal README del client Python. Fino alla release su PyPI, installa da un clone (vedi [Installazione](#install)).

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

Output osservato: `ERROR_CODE_ADDRESS_FROZEN`. La stessa chiamata su `ChainClient()` genera `ChainUpgradeRequired` con `module == "x/asset"` e `code == "CHAIN_UPGRADE_REQUIRED"`.

### Quickstart 5: lo stesso in Go (module proxy v0.1.0) {#quickstart-go}

Dal README del client Go, racchiuso in un pacchetto `main`.

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

Output osservato: `mock mint error: <nil>` poi `true x/asset`. Il README del client Java contiene l'esempio equivalente con `MockChain`, `MsgCreateAsset.newBuilder()` e `MockChainError.code()`.

:::note
I README Go e TypeScript nel repository contengono piccoli errori nei loro snippet, da correggere nella 0.1.1. L'esempio Go qui sopra è la versione corretta.
:::

## API principali {#main-api}

### Contratti {#api-contracts}

| Nome | Che cosa fa |
|---|---|
| `QoreChainHybridHolderGuard(initialOwner)` | Guard su `0x0A02`: `isHybridHolder`, `isEligible`, `requireHybridHolder` (annulla con `HybridKeyRequired`), `keyStatus`, `decodeKeyStatus`, `precompileActive`, `setExempt`, `exempt` |
| `QoreChainHybridHolderRule(guard)` | Regola CMTAT: `detectTransferRestriction`, `detectTransferRestrictionFrom`, `canTransfer`, `canTransferFrom`, `messageForTransferRestriction`, `canReturnTransferRestrictionCode`; codici `CODE_FROM_NOT_HYBRID` (60), `CODE_TO_NOT_HYBRID` (61), `CODE_SPENDER_NOT_HYBRID` (62) |
| `QoreChainHybridHolderModule(guard)` | Modulo ERC-3643: `moduleCheck`, `bindCompliance`, `unbindCompliance`, `isComplianceBound`, `isPlugAndPlay`, `name` |
| `QoreChainRwaVault(asset, name, symbol, eligibility)` | Vault ERC-4626 con quote ristrette |
| `QoreChainRwaAsyncVault(asset, name, symbol, eligibility, admin)` | Vault ERC-7540: `requestDeposit`, `fulfillDeposit`, `requestRedeem`, `fulfillRedeem`, `pendingDepositRequest`, `claimableDepositRequest`, `pendingRedeemRequest`, `claimableRedeemRequest`, `setOperator`, e `deposit`, `mint`, `redeem`, `withdraw` con un controller; `FULFILLER_ROLE`; le preview annullano per scelta progettuale |
| `IHolderEligibility` | `isEligible(address)`: inserisci un'altra policy di idoneità per i vault |
| `IERC7518` | Bozza di interfaccia per le partizioni |
| `forge script script/DeployCmtat.s.sol` | Guard, regola e token CMTAT |
| `forge script script/erc3643/DeployErc3643.s.sol` | Infrastruttura T-REX, guard, modulo e una suite di token |
| `forge script script/DeployVaults.s.sol` | Entrambi i vault su un token ristretto, con le esenzioni del guard |

### Client (proposta) {#api-clients}

Sono mostrati i nomi TypeScript e Java; Python usa snake_case (`create_asset`), e Go usa la capitalizzazione Go dietro accessor (`chain.Asset().CreateAsset(ctx, msg)`).

| Nome | Che cosa fa |
|---|---|
| `ChainClient` (Go `NewChainClient()`) | Ogni chiamata fallisce con `ChainUpgradeRequired`; nessuna richiesta di rete |
| `MockChain` (Go `NewMockChain()`) | Le regole proposte in memoria; i rifiuti generano `MockChainError` |
| `asset` | `createAsset`, `updateFlags`, `setRole`, `proposeIssuer`, `acceptIssuer`, `authorizeHolder`, `mint`, `burn`, `transfer`, `freeze`, `freezePartial`, `pause`, `clawback`, `forceTransfer`, `setTerms`, `retire`; query `asset`, `assets`, `holder`, `holders`, `roles`, `canTransfer`, `params` |
| `identity` | `registerIdentity`, `updateCountry`, `bindAddress`, `unbindAddress`, `addClaim`, `revokeClaim`, `removeIdentity`, `setClaimIssuer`; query `identity`, `identityByAddress`, `claimIssuers`, `isVerified` |
| `compliance` | `registerModule`, `setModuleStatus`, `bindModule`, `unbindModule`, `migrateBinding`; query `modules`, `module`, `bindings`, `check` |
| `settlement` | `createVenue`, `createInstruction`, `affirm`, `withdrawAffirmation`, `executeInstruction`, `cancelInstruction`; query `instruction`, `instructionsByParty`, `venue` |
| `attest` | `setAttester`, `submit`, `revoke`; query `latest`, `history`, `attesters` |
| Helper del mock | `setHybridKey`, `fundBank`, `bankBalance`, `advance(blocks, seconds)`, `events(type)`, `defineModuleLogic(moduleId, fn)` (Python anche `has_hybrid_key`, `height`, `time`) |

## Come accedere {#how-to-access}

| | Testnet `qorechain-diana` | Mainnet `qorechain-vladi` |
|---|---|---|
| EVM chain ID | 9800 | 9801 |
| RPC EVM | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| Precompile `pqcKeyStatus` `0x0A02` | Attivo | Non attivo (`eth_call` restituisce dati vuoti); l'attivazione richiederebbe una decisione di governance, nessuna presa |
| Guard, regola e modulo del detentore ibrido | Funzionano | Fail closed: ogni indirizzo non esente è non idoneo, quindi i token non possono passare tra detentori ordinari |
| Script di deploy | Dry run e broadcast | Si rifiutano di girare |
| Console dell'emittente | Completa | Avviso; creazione di token disabilitata |
| Moduli nativi (`x/asset` e altri) | Non esistono | Non esistono |

Requisiti per qualsiasi cosa che invii una transazione EVM: un account con una chiave ML-DSA-87 registrata (con prova di possesso) e una finestra di autorizzazione EVM aperta, entrambe impostate sul rail nativo con una transazione a firma ibrida. Le letture (`eth_call`, log, stima del gas, dry run) non richiedono né l'una né l'altra. Il `MockChain` e i test Foundry non richiedono alcuna rete. Altri endpoint e il faucet: [Connessione alla testnet](/getting-started/connecting-to-testnet) e [Connessione alla mainnet](/getting-started/connecting-to-mainnet).

Comportamento della rete da tenere presente: `PREVRANDAO` è una costante (nessun contratto del kit lo usa); le transazioni blob (tipo 3) sono rifiutate, mentre i tipi 0, 1, 2 e 4 sono accettati; le delegazioni EIP-7702 richiedono il consenso post-quantistico dell'authority stessa (`MsgAuthorizeEVMDelegation`).

## Dove è pubblicato {#where-published}

Verificato dal vivo il 28 ottobre 2026 (la release GitHub, Maven Central e il proxy Go servono la 0.1.0; PyPI e npm restituiscono 404).

| Registro | Pacchetto | Versione | Link |
|---|---|---|---|
| Maven Central | `io.github.qorechain:asset-kit` | 0.1.0 | https://central.sonatype.com/artifact/io.github.qorechain/asset-kit |
| Proxy dei moduli Go | `github.com/qorechain/qorechain-asset-kit/clients/go` | v0.1.0 (tag `clients/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-asset-kit/clients/go |
| PyPI | `qorechain-asset-kit` | **In arrivo** (non ancora su PyPI) | |
| npm | `@qorechain/asset-kit` | **In arrivo** (non pubblicato) | |
| GitHub (contratti Solidity, console dell'emittente, proto, documentazione, template legali) | `qorechain/qorechain-asset-kit` | release v0.1.0 | https://github.com/qorechain/qorechain-asset-kit/releases/tag/v0.1.0 |

Repository: https://github.com/qorechain/qorechain-asset-kit. Manutentore: QoreChain Association.

**Licenze.** Il codice è Apache-2.0, tranne `contracts/script/erc3643/` e `contracts/test/erc3643/`, che si compilano insieme all'implementazione di riferimento ERC-3643 e sono GPL-3.0-or-later. La documentazione in `docs/` e `legal/` è Apache-2.0. Le dipendenze mantengono le proprie licenze e sono usate senza modifiche come git submodule: T-REX e ONCHAINID (GPL-3.0), CMTAT (MPL-2.0), OpenZeppelin (MIT). Un token ERC-3643 distribuito è codice T-REX sotto la sua licenza; un token CMTAT distribuito è sotto MPL-2.0. Il file `NOTICE` elenca ogni dipendenza.

## Limiti e problemi noti {#limits}

- **I moduli nativi non esistono.** `x/asset`, `x/identity`, `x/compliance`, `x/settlement` e `x/attest` sono una proposta. Non è previsto alcun upgrade che li aggiunga. `ChainClient` non può mai riuscire nella 0.1.0; `MockChain` è uno strumento di sviluppo, non una chain.
- **Il controllo del detentore è solo per testnet.** Sulla mainnet il guard fallisce in modo chiuso; un deploy su mainnet non può contare su di esso.
- **I poteri degli agenti aggirano il controllo del detentore.** In entrambi gli standard, il trasferimento forzato e il recupero del wallet da parte di un agente non consultano la regola o il modulo: `forcedTransfer` di CMTAT e `forcedTransfer` e `recoveryAddress` di ERC-3643 possono collocare token su un indirizzo che non ha chiave. Limita chi detiene i ruoli di agente.
- **Gli spender di `transferFrom` in ERC-3643 non sono controllati** dal modulo, perché ERC-3643 non passa lo spender alla compliance. La regola CMTAT controlla invece lo spender.
- **Burn e rimborsi restano aperti** ai detentori che hanno perso l'idoneità, per scelta progettuale, in entrambi gli standard di token e in entrambi i vault.
- **Le richieste ERC-7540 in sospeso non si possono annullare** nella 0.1.0. Se un agente sposta asset fuori dal vault asincrono, `totalAssets` legge zero e i claim che richiedono gli asset mancanti falliscono finché l'emittente non ripristina il saldo.
- **Nessun input di valutazione esterno** nel vault ERC-7540; la conversione usa il saldo del vault stesso per quota.
- **Nessuna consegna contro pagamento e nessuna attestazione su EVM.** Esistono solo come i proposti `x/settlement` e `x/attest`.
- **ERC-7518 è una bozza di interfaccia**, non un'implementazione. Le partizioni si possono modellare oggi con un token per classe o tranche che condivide un registro delle identità o una regola.
- **CMTA RuleEngine v3** è ancora pubblicato come release candidate; la regola funziona direttamente come `ruleEngine` di un token e dichiara entrambi gli id di interfaccia delle regole (`0x2497d6cb`, `0xb1a69752`).
- **La console dell'emittente** non registra chiavi, non apre finestre, non distribuisce suite ERC-3643 o vault, né gestisce ruoli CMTAT, freeze parziali, documenti o snapshot.
- **Python e TypeScript non sono sui loro registri.** Usa un clone fino alle release su PyPI e npm; questa pagina non dà alcun comando di installazione da registro per essi.
- **Errori nei README.** Gli snippet Go e TypeScript nei README del repository hanno piccoli errori, da correggere nella 0.1.1. Usa i quickstart di questa pagina.
- **Template legali.** `legal/` contiene tre bozze da discutere: un titolo svizzero basato su registro (art. da 973d a 973i del Codice delle obbligazioni), termini di token del Liechtenstein secondo il TVTG (approccio "token container") e uno schema di incarico per un operatore secondo l'EU DLT Pilot Regime (Regolamento (UE) 2022/858). Non sono state riviste da un consulente legale, non sono consulenza legale e devono essere riviste da un consulente qualificato della giurisdizione competente prima di qualsiasi uso. Usarle, o usare il kit, non dice nulla sul fatto che una data emissione soddisfi alcun requisito di legge. La QoreChain Association non agisce come emittente, registro, custode, sede di negoziazione o consulente legale per alcun asset.
- **Pre-1.0.** I proto proposti possono cambiare in qualsiasi versione minore.

## Note di sicurezza {#security}

- **Non sottoposto ad audit.** I contratti non hanno avuto alcuna revisione indipendente. Non usarli per detenere valore reale senza una.
- Le chiavi restano ai loro proprietari: il guard legge lo stato pubblico della chiave dalla chain e non gestisce mai una chiave privata. Le chiavi di deployer, proprietario e agente sono normali account EVM con chiavi ML-DSA-87 registrate; tieni i ruoli di emittente, proprietario del guard e agente su account separati e ben protetti.
- Il proprietario del guard controlla le esenzioni. Un'esenzione rende idoneo un indirizzo senza chiave; concedila ai contratti che detengono l'asset per progetto e tieni d'occhio gli eventi `ExemptionSet`.
- I ruoli di agente possono aggirare il controllo del detentore (trasferimento forzato, recupero). Trattali come i ruoli più sensibili del token.
- Il guard fallisce in modo chiuso e decodifica la risposta del precompile in modo rigoroso; non tratta mai come valida una chiave senza prova di possesso.
- La build di produzione della console dell'emittente imposta una Content-Security-Policy con `connect-src 'none'`: la pagina non fa alcuna richiesta di rete per conto proprio, e tutto passa dal wallet.
- `MockChain` si fida dei campi firmatario dei messaggi (non ci sono firme); non è un confine di sicurezza.
- I problemi in CMTAT, nell'implementazione di riferimento ERC-3643, in ONCHAINID o in OpenZeppelin vanno segnalati anche ai loro manutentori.
- Segnala le vulnerabilità del kit in privato a security@qore.network.

## Pagine correlate {#related}

- [SDK QoreChain](/sdk/overview): registrare una chiave ML-DSA-87 e aprire una finestra di autorizzazione EVM (`openEvmWindow`, `fetchEvmWindow`, `get_evm_window`).
- [QoreSign](/qoresign/overview): firma ibrida per le transazioni del rail nativo che registrano chiavi e aprono finestre.
- [Firma post-quantistica](/developer-guide/post-quantum-signing) e [account e firma PQC](/sdk/concepts/accounts-pqc): registrazione delle chiavi e firma ibrida.
- [Sviluppo EVM](/developer-guide/evm-development#evm-window): la finestra di autorizzazione EVM.
- [Precompile EVM](/developer-guide/evm-precompiles): `0x0A01` e `0x0A02`, attivi solo sulla testnet.
- [Chain developer kit](/developer-tools/chain-dev-sdk): template Foundry, Hardhat e viem e helper per le finestre (SDK 0.11.0, in arrivo).
- [Custody kit](/developer-tools/custody-kit) e [QoreScan](/developer-tools/qorescan): kit vicini per i custodi e per gli inventari crittografici.
- [Pacchetti per sviluppatori](/developer-tools/overview): ogni pacchetto e il suo stato nel registro.
- Standard upstream: ERC-3643, CMTAT, ERC-4626, ERC-7540, ERC-7518.
