# 個人用AWS CDKテンプレート

AWS CDKプロジェクトを始めるにあたってのテンプレートである。
CDKの設定だけでなく、GitHub Actionsの設定も含まれている。

# 前提条件

- AWSアカウントとAWS CDK(Typescript)が使用可能なこと
  - [AWS CDKの開始方法](https://docs.aws.amazon.com/ja_jp/cdk/v2/guide/getting_started.html)
- Gitがインストールされていること
- GitHubアカウントがあること

# 初期設定

このテンプレートを使って新しいCDKプロジェクトを始めるには、以下の手順に従うこと。

## cdk bootstrapの実行

[公式ドキュメント](https://docs.aws.amazon.com/ja_jp/cdk/v2/guide/bootstrapping-env.html)を参考に、`cdk bootstrap`を実行する。
ただし、この操作はAWSアカウントごとに一度だけ実行すればよいので、他のCDKプロジェクトの開始時に実行済みであれば、この手順は不要である。

## 新しい空のGitHubリポジトリを作成する

WebブラウザまたはGitHub CLIを使って新しい空のプロジェクトを作成する。
基本的にはプライベートリポジトリを作成することをお勧めする。

## Open ID Connectの設定

> [!CAUTION]
> この手順にミスが有ると、不正なユーザがAWSリソースにアクセスできる可能性がある。
> 信頼ポリシーの設定に誤字がないか、慎重に設定すること。

下記のような信頼ポリシーのIAMロールを作成する。
IAMポリシーはPowerUserAccessなどの適当な権限を持つポリシーを指定すること。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<AWSアカウントID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:<GitHubのユーザ名>/<GitHubリポジトリ名>:*"
        }
      }
    }
  ]
}
```

## シークレットの設定

下記の秘密情報をGitHub ActionsのSecretsに設定する。
Secretsの設定方法は[公式ドキュメント](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository)を参照せよ。

| シークレット名 | 説明                                      |
| -------------- | ----------------------------------------- |
| AWS_ID         | デプロイ先のAWSアカウントのID             |
| ROLE_NAME      | Open ID Connectの設定時に作成したロール名 |

## このリポジトリをクローンし、空のリポジトリにプッシュする

以下のコマンドを実行して、このリポジトリをクローンし、新しいリポジトリにプッシュする。

```bash
git clone https://github.com/yutaro-sakamoto/start-cdk.git
cd start-cdk
rm -rf .git LICENSE
git init
git remote add origin <新しいリポジトリのURL>
git br -m main
git add .
git commit -m "Initial commit"
git push origin main
```

これにより、空のスタックがAWSにデプロイされる。

# その他の設定(任意)

その他おすすめの設定を以下に示す。

## .git/hooks/pre-commitの追加

コミット前にtsファイルのフォーマットを自動で行うために、pre-commitフックを追加する。

```bash
echo "#!/bin/bash" > .git/hooks/pre-commit
echo "npx prettier . --write" >> .git/hooks/pre-commit
echo "git add -u" >> .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## mainブランチの保護

[公式ドキュメント](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)を参考に、mainブランチを保護する。

## スタックのリネーム

このテンプレートでは、スタック名は`StartCdkStack`である。
`bin/start-cdk.ts`や`lib/start-cdk-stack.ts`を編集して、適切なスタック名に変更する。

# 開発フロー

このリポジトリでは以下の開発フローを推奨する。

- **main以外のブランチで開発を行う**
  - main以外のブランチにコミットをプッシュすると、GitHub Actionsで下記の処理が実行される
    - actionlintによるワークフロー全体の確認
    - tsファイルがPrettierによってフォーマット済みかの確認
    - ESLintによる静的解析
    - テストの実行
    - typedocでドキュメント生成し、その際にエラーや警告がないかの確認
    - cdk synth(合成)の実行
- **mainブランチにマージするよう、Pull Requestを作成する**
  - このとき、mainブランチ以外のブランチへのpush時と同様の処理が実行される
  - これに加えて、cdk diffコマンドが実行され、その結果をPull Requestのコメントとして自動で投稿する。
- **Pull Requestに問題がなければ、mainブランチにマージする**
  - マージ後、GitHub Actionsでcdk deployが実行され、スタックがデプロイされる。

# その他

## cdk-nag

デフォルトで[cdk-nag](https://github.com/cdklabs/cdk-nag)による検証が有効になっている。
無効にするには、bin/start-cdk.tsの下記の行を削除すること。

```typescript
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
```

cdk-nagのエラーや警告を抑制するには、lib/stack-cdk.tsのaddCdkNagSuppressions関数に抑制したいルールを追加すること。
具体的な抑制方法は[公式ドキュメント](https://github.com/cdklabs/cdk-nag?tab=readme-ov-file#suppressing-a-rule)を参照せよ。

## dependabot

[dependabot](https://docs.github.com/en/code-security/getting-started/dependabot-quickstart-guide)が有効になっているため、定期的に依存パッケージのアップデートを促すPull Requestが作成される。詳細設定は.github/dependabot.ymlを参照せよ。

## PULL_REQUEST_TEMPLATE

デフォルトのPull Requestテンプレートが設定されている。
必要に応じて.github/PULL_REQUEST_TEMPLATE.mdを編集すること。
