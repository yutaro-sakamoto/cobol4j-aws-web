# ベースイメージを指定
FROM openjdk:17-jdk-alpine

# 作業ディレクトリを作成
WORKDIR /app

# 依存関係のコピー
COPY lib /app

# アプリケーションのJARファイルをコピー
ARG JAR_FILE=build/libs/app.jar
COPY ${JAR_FILE} app.jar

RUN apk update && apk add --no-cache bash

# アプリケーションを実行
ENTRYPOINT ["java", "-jar", "app.jar"]
