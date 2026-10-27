---
slug: /qoresign/guides/evm-quantum-ready
title: "EVM ウォレット: 量子対応モード"
sidebar_label: EVM 量子対応モード
sidebar_position: 3
---

# EVM ウォレット: 量子対応モード

Ethereum トランザクションには 2 つ目の署名を載せられるフィールドがなく、
ネットワークは PQC の設定をレーンごとではなくチェーン全体に適用します。そのため、
QoreChain の EVM レーンで送信されるトランザクションは secp256k1 のみで署名され、
QoreSign は EVM のハイブリッド署名を提供しません（`assertHybridLane("evm")` は
`LANE_NOT_AVAILABLE` をスローします）。

代わりに、ネットワークは、送信者が登録済みの ML-DSA-87 鍵と、そのトランザクション
をカバーする有効な **EVM 認可ウィンドウ** を持つ場合にのみ、EVM トランザクション
を受け付けます。このウィンドウは、ハイブリッド署名されたトランザクションによって
ネイティブレーンから開かれるため、耐量子鍵があらかじめ EVM のアクティビティを
認可することになります（「量子対応モード」）。
両方の公開ネットワークがこれを強制しています（プロトコル機能
`evm-pqc-authorisation-window`。[QoreChain SDK](/sdk/overview) の
`fetchProtocolFeatures`、または `/qorechain/pqc/v1/protocol_features` で確認できます）。

## EVM アカウントの手順 {#steps}

1. ネイティブレーンで、アカウントの ML-DSA-87 鍵を登録します
   （`buildRegisterPqKeyMessage`。詳しくは
   [登録](/qoresign/spec/hybrid-signing-v1#registration)を参照）。
   `eth_secp256k1` アカウントの場合、同じ 20 バイトのアドレスに `qor1` 形式が
   あります。それを `sender` として使用してください。
2. ハイブリッド署名されたネイティブレーンのトランザクションでウィンドウを開きます。
   有効期限の高さ、EVM トランザクションの最大数、最大値、そして必要に応じて呼び出し
   可能なコントラクトを指定します。QoreChain SDK にはウィンドウ用メッセージの
   コンポーザーが用意されています。
3. ウィンドウが開いている間は、任意の EIP-1193 ウォレットから EVM トランザクション
   を送信できます。ウィンドウの外、またはその上限を超える場合、ネットワークは
   それらを拒否します。そのため、secp256k1 鍵だけでは EVM レーン上で価値を移動
   できません。

ネットワークが EVM レーン向けのレーンごとの PQC を追加した時点で、QoreSign は
新しいマイナーバージョンでハイブリッド EVM モードを追加します。

## MetaMask とその他の EIP-1193 ウォレット {#eip-1193-wallets}

MetaMask などの EIP-1193 ウォレットは、`eth_sendTransaction` に ML-DSA-87 署名を
追加できません。これらのウォレットでは、ML-DSA-87 鍵を保持するウォレットから開かれる
ウィンドウが利用可能な手段です。
