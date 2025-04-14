/*
 * This file was generated by the Gradle 'init' task.
 *
 * This generated file contains a sample Java application project to get you started.
 * For more details on building Java & JVM projects, please refer to https://docs.gradle.org/8.2.1/userguide/building_java_projects.html in the Gradle documentation.
 */

import java.io.ByteArrayOutputStream

val compilerBinDir = "${project.projectDir}/compiler_bin"
val libcobjJar = "${compilerBinDir}/lib/opensourcecobol4j/libcobj.jar"
val cobj = "${compilerBinDir}/bin/cobj"
val cobjApi = "${compilerBinDir}/bin/cobj-api"
val javaDir = "${project.projectDir}/src/main/java/cobol4j/aws/web/"
val libDir = "${project.projectDir}/lib"
val libLibcobjJar = "${libDir}/libcobj.jar"
val javaPackage = "cobol4j.aws.web"
val dockerImageTag = "cobol4j-aws-web:latest"
val dockerImageTarball = "cobol4j-aws-web.tar"

plugins {
    // Apply the application plugin to add support for building a CLI application in Java.
    application
    id("org.springframework.boot") version("3.3.4")
}

repositories {
    // Use Maven Central for resolving dependencies.
    mavenCentral()
}

dependencies {
    implementation(platform("org.springframework.boot:spring-boot-dependencies:3.4.4"))
    implementation("org.springframework.boot:spring-boot-starter-web") {
        exclude(group = "org.springframework.boot", module = "spring-boot-starter-logging")
    }
    implementation(files("lib/libcobj.jar"))

    // Use JUnit Jupiter for testing.
    testImplementation("org.junit.jupiter:junit-jupiter:5.12.2")

    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

    // This dependency is used by the application.
    implementation("com.google.guava:guava:33.4.6-jre")
}

// Apply a specific Java toolchain to ease working on different environments.
java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
    }
}

application {
    // Define the main class for the application.
    mainClass.set("cobol4j.aws.web.App")
}

tasks.named<Test>("test") {
    // Use JUnit Platform for unit tests.
    useJUnitPlatform()
}

// Git管理下にあるファイルを取得する関数
fun getGitManagedFiles(dir: File): FileTree {
    val output = ByteArrayOutputStream()
    project.exec {
        workingDir = dir
        commandLine("git", "ls-files", "-z")
        standardOutput = output
    }
    val gitFiles = output.toString().split("\u0000")
    return fileTree(dir) {
        include(gitFiles)
    }
}

// opensource COBOL 4J のビルドタスクを追加
tasks.register<Exec>("buildCompiler") {
    group = "build"
    description = "Build opensource COBOL 4J"

    // 作業ディレクトリを指定
    val opensourcecobol4jDir = file("${project.projectDir}/opensourcecobol4j/")

    workingDir = opensourcecobol4jDir

    // 入力ファイルを指定
    inputs.files(getGitManagedFiles(opensourcecobol4jDir))

    // 出力ファイルを指定
    outputs.files(
        file(libcobjJar),
        file(cobj),
        file(cobjApi),
    )

    // 実行コマンドを指定
    commandLine("sh", "-c", """
        mkdir -p ${compilerBinDir} &&
        ./configure --prefix=${compilerBinDir} &&
        make &&
        make install
    """.trimIndent())
}

tasks.register<Exec>("moveLibcobjJar") {
    dependsOn("buildCompiler")

    group = "build"
    description = "Move libcobj.jar to lib directory"

    // 入力ファイルを指定
    inputs.files(file(libcobjJar))

    // 出力ファイルを指定
    outputs.files(file(libLibcobjJar))

    // 実行コマンドを指定
    commandLine("sh", "-c", """
        mkdir -p ${libDir} &&
        cp ${libcobjJar} ${libLibcobjJar}
    """.trimIndent())
}

tasks.register<Exec>("buildCobol") {
    dependsOn("buildCompiler")

    group = "build"
    description = "Build COBOL source files"

    val cobolDir = "${project.projectDir}/cobol/"
    val jsonDir = "${project.projectDir}/json"

    // 作業ディレクトリを指定
    workingDir = file(cobolDir)

    // 入力ファイルと出力ファイルを指定
    inputs.files(
        file(libcobjJar),
        file(cobj),
        file(cobjApi),
        fileTree(cobolDir),
    )

    // 出力ファイルを指定
    outputs.files(
        file("${javaDir}/sample.java"),
        file("${javaDir}/sampleController.java"),
        file("${javaDir}/sampleRecord.java"),
        file("${jsonDir}/info_sample.json"),
    )

    commandLine("sh", "-c", """
        mkdir -p ${jsonDir} &&
        ${cobj} -info-json-dir=${jsonDir} -C -java-package=${javaPackage} *.cbl &&
        mv *.java ${javaDir} &&
        CLASSPATH=:${libcobjJar} ${cobjApi} --output-dir=${javaDir} -java-package=${javaPackage} ${jsonDir}/info_sample.json
    """)
}


tasks.named("compileJava") {
    dependsOn("buildCobol")
    dependsOn("moveLibcobjJar")
}

tasks.named("bootJar") {
    dependsOn("compileJava")
}

tasks.register<Exec>("buildDockerImage") {
    dependsOn("bootJar")

    inputs.files(
        file("Dockerfile"),
    )

    commandLine("sh", "-c", "docker build -t ${dockerImageTag} .")
}

tasks.register<Exec>("buildDockerImageTarball") {
    dependsOn("buildDockerImage")

    outputs.files(
        file(dockerImageTarball),
    )

    commandLine("sh", "-c", "docker save -o ${dockerImageTarball} ${dockerImageTag}")
}