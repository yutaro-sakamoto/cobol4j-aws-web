# ベースイメージを指定
FROM openjdk:17-jdk-alpine

# 作業ディレクトリを作成
WORKDIR /app

# 依存関係のコピー
COPY lib /app/lib

# アプリケーションのJARファイルをコピー
ARG JAR_FILE=build/libs/app.jar
COPY ${JAR_FILE} app.jar

# アプリケーションを実行
ENTRYPOINT ["java", "-cp", "app.jar:lib/*", "org.springframework.boot.loader.JarLauncher"]