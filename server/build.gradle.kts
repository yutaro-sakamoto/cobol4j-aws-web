plugins {
    id("cpp-application")
}


// opensource COBOL 4J のビルドタスクを追加
tasks.register<Exec>("buildCompiler") {
    group = "build"
    description = "Build opensource COBOL 4J"

    //// 作業ディレクトリを指定
    workingDir = file("${project.projectDir}/opensourcecobol4j/")

    // 入力ファイルと出力ファイルを指定
    inputs.files(fileTree("${project.projectDir}/opensourcecobol4j"))
    outputs.file("${project.projectDir}/compiler_bin/lib/opensourcecobol4j/libcobj.jar")

    // 実行コマンドを指定
    commandLine("sh", "-c", """
        mkdir -p ${project.projectDir}/compiler_bin &&
        ./configure --prefix=${project.projectDir}/compiler_bin &&
        make &&
        make install
    """.trimIndent())
}

tasks.named("build").configure {
    dependsOn("buildCompiler")
}