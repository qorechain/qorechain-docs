---
slug: /qoresign/guides/evm-quantum-ready
title: "EVM cüzdanları: yetkilendirme penceresi"
sidebar_label: EVM yetkilendirme penceresi
sidebar_position: 3
---

# EVM cüzdanları: yetkilendirme penceresi

Ethereum işlemlerinde ikinci bir imzanın taşınabileceği bir alan yoktur ve ağ,
PQC ayarını hat başına değil zincir genelinde uygular. Bu nedenle QoreChain'in
EVM hattında gönderilen bir işlem yalnızca secp256k1 ile imzalanır ve QoreSign
hibrit bir EVM imzası sunmaz (`assertHybridLane("evm")` çağrısı
`LANE_NOT_AVAILABLE` hatası fırlatır).

Bunun yerine ağ, bir EVM işlemini yalnızca göndericisinin kayıtlı bir ML-DSA-87
anahtarı ve işlemi kapsayan etkin bir **EVM yetkilendirme penceresi** varsa kabul
eder. Pencere, yerel hattan hibrit imzalı bir işlemle açılır; böylece kuantum
sonrası anahtar EVM etkinliğini önceden yetkilendirir. EVM işleminin kendisi yalnızca secp256k1 ile imzalanır.
Her iki herkese açık ağ da bunu uygular (protokol özelliği
`evm-pqc-authorisation-window`; [QoreChain SDK](/sdk/overview) içindeki
`fetchProtocolFeatures` ile veya `/qorechain/pqc/v1/protocol_features`
adresinden okunabilir).

## Bir EVM hesabı için adımlar {#steps}

1. Hesap için yerel hatta bir ML-DSA-87 anahtarı kaydedin
   (`buildRegisterPqKeyMessage`, bkz.
   [Kayıt](/qoresign/spec/hybrid-signing-v1#registration)). Bir
   `eth_secp256k1` hesabında aynı 20 adres baytının bir `qor1` biçimi vardır;
   bunu `sender` olarak kullanın.
2. Hibrit imzalı bir yerel hat işlemiyle bir pencere açın: bir bitiş yüksekliği,
   en fazla EVM işlem sayısı, en fazla değer ve isteğe bağlı olarak çağırabileceği
   kontratlar. QoreChain SDK'sında pencere mesajları için oluşturucular vardır.
3. Pencere açıkken herhangi bir EIP-1193 cüzdanından EVM işlemleri gönderin.
   Pencere dışında veya sınırlarının ötesinde ağ bunları reddeder; dolayısıyla
   yalnızca secp256k1 anahtarı EVM hattında değer taşıyamaz.

Ağ, EVM hattı için hat başına PQC desteği eklediğinde QoreSign, yeni bir minör
sürümde hibrit bir EVM modu ekleyecektir.

## MetaMask ve diğer EIP-1193 cüzdanları {#eip-1193-wallets}

MetaMask ve diğer EIP-1193 cüzdanları `eth_sendTransaction` işlemine bir
ML-DSA-87 imzası ekleyemez; bunlar için ML-DSA-87 anahtarını tutan bir cüzdandan
açılan pencere, kullanılabilir yoldur.
