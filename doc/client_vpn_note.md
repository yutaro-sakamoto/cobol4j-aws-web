# 準備

## AWS Client VPNの設定(管理者向け)

### 証明書の生成

詳細は[公式ドキュメント](https://docs.aws.amazon.com/ja_jp/vpn/latest/clientvpn-admin/client-auth-mutual-enable.html)に従い、
LinuxでOpenVPN easy-rsaを使用して証明書を作成する。
下記のコマンドを実行すれば良い。途中で入力を促された場合はyesを入力する

```sh
git clone https://github.com/OpenVPN/easy-rsa.git
cd easy-rsa/easyrsa3
./easyrsa init-pki
./easyrsa build-ca nopass
./easyrsa --san=DNS:server build-server-full server nopass
./easyrsa build-client-full client1.domain.tld nopass
mkdir ~/cobol4jweb/
cp pki/ca.crt ~/cobol4jweb/
cp pki/issued/server.crt ~/cobol4jweb/
cp pki/private/server.key ~/cobol4jweb/
cp pki/issued/client1.domain.tld.crt ~/cobol4jweb
cp pki/private/client1.domain.tld.key ~/cobol4jweb/
cd ~/cobol4jweb/
aws acm import-certificate --certificate fileb://server.crt --private-key fileb://server.key --certificate-chain fileb://ca.crt
aws acm import-certificate --certificate fileb://client1.domain.tld.crt --private-key fileb://client1.domain.tld.key --certificate-chain fileb://ca.crt
```

下から2番目のawsコマンドで表示されたARNをメモしておく。

### 環境変数への登録

```sh
export AWS_CLIENT_VPN_CERTIFICATE_ARN='メモしたARN'
```

### GitHub Actionsのシークレットの設定

GitHub ActionsのシークレットAWS_CLIENT_VPN_CERTIFICATE_ARNにメモしたARNを設定する。

### ClientVPNクライアント向け設定ファイルを入手する

`infrastructure`ディレクトリで`npx cdk deploy`コマンドを実行するか、GitHub ActionまたはでCDKスタックをデプロイする。
その後、マネジメントコンソールの[Client VPN Endpoint一覧](https://ap-northeast-1.console.aws.amazon.com/vpcconsole/home?region=ap-northeast-1#ClientVPNEndpoints)
から作成したClient VPN Endpointを選択し、「Download client configuration」からクライアント設定ファイルをダウンロードする。

### クライアント設定ファイルの編集

クライアント設定ファイルをテキストエディタで開き、
~/cobo4jweb/以下にある`client1.domain.tld.crt`、`client1.domain.tld.key`の内容をそれぞれ`<cert>`、`<key>`タグの中に転記する。

```
client
dev tun
proto udp
remote cvpn-endpoint-0e003bccdf09d37c4.prod.clientvpn.ap-northeast-1.amazonaws.com 443
remote-random-hostname
resolv-retry infinite
nobind
remote-cert-tls server
cipher AES-256-GCM
verb 3
<ca>
-----BEGIN CERTIFICATE-----
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
-----END CERTIFICATE-----

</ca>

<cert>
-----BEGIN CERTIFICATE-----
Contents of ~/.cobol4jweb/client1.domain.tld.crt
-----END CERTIFICATE-----
</cert>

<key>
-----BEGIN PRIVATE KEY-----
Contents of ~/.cobol4jweb/client1.domain.tld.key
-----END PRIVATE KEY-----
</key>

reneg-sec 0

verify-x509-name server name
```

## AWS Client VPNの設定(ユーザ向け)

### クライアント設定ファイルの配布

管理者は、上記までの手順で作成したクライアント設定ファイルをユーザに配布する。

### AWS Client VPNをインストール

[公式サイト](https://aws.amazon.com/jp/vpn/client-vpn-download/)からAWS Client VPNクライアントのインストーラをダウンロードし、インストールする。

### AWS Client VPNクライアントの設定

Windows版の手順を説明する。

- `ファイル` > `プロファイルを管理` を選択する
- 新しく出現したウィンドウで`プロファイルを追加`を選択する
- 更に新しく出現したウィンドウに`表示名`には`cobol4jweb`等の適当な名前を入力し、`VPN設定ファイル`には先ほど配布されたクライアント設定ファイルを指定する。
- `プロファイル`を選択してウィンドウを閉じる
- `完了`を選択してウィンドウを閉じる
- ドロップダウンリストから`cobol4jweb`を選択し、`接続`を選択する

以上で、VPCに接続される。
切断後に再度接続するには、ドロップダウンリストから`cobol4jweb`を選択し`接続`を選択する。