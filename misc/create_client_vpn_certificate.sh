#!/bin/bash

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
