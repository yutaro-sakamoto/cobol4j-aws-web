import java.io.ByteArrayOutputStream

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
    workingDir = file("${project.projectDir}/opensourcecobol4j/")

    // 入力ファイルと出力ファイルを指定
    inputs.files(getGitManagedFiles(file("${project.projectDir}/opensourcecobol4j/")))
    outputs.files(
        file("${project.projectDir}/compiler_bin/lib/opensourcecobol4j/libcobj.jar"),
        file("${project.projectDir}/compiler_bin/bin/cobj"),
        file("${project.projectDir}/compiler_bin/bin/cobj-api"),
    )

    // 実行コマンドを指定
    commandLine("sh", "-c", """
        mkdir -p ${project.projectDir}/compiler_bin &&
        ./configure --prefix=${project.projectDir}/compiler_bin &&
        make &&
        make install
    """.trimIndent())
}

tasks.register<Exec>("buildCobol") {
    dependsOn("buildCompiler")

    group = "build"
    description = "Build COBOL source files"

    // 作業ディレクトリを指定
    workingDir = file("${project.projectDir}/cobol/")

    inputs.files(
        file("${project.projectDir}/compiler_bin/lib/opensourcecobol4j/libcobj.jar"),
        file("${project.projectDir}/compiler_bin/bin/cobj"),
        file("${project.projectDir}/compiler_bin/bin/cobj-api"),
        fileTree("${project.projectDir}/cobol"),
    )

    outputs.files(
        file("${project.projectDir}/app/src/main/java/cobol4j/aws/web/sample.java"),
        file("${project.projectDir}/app/src/main/java/cobol4j/aws/web/sampleController.java"),
        file("${project.projectDir}/app/src/main/java/cobol4j/aws/web/sampleRecord.java"),
    )

    commandLine("sh", "-c", """
        ${project.projectDir}/compiler_bin/bin/cobj -info-json-dir=${project.projectDir}/app/src/main/java/cobol4j/aws/web/ -C *.cbl &&
        mv *.java ${project.projectDir}/app/src/main/java/cobol4j/aws/web/ &&
        CLASSPATH=:${project.projectDir}/compiler_bin/lib/opensourcecobol4j/libcobj.jar ${project.projectDir}/compiler_bin/bin/cobj-api --output-dir=${project.projectDir}/app/src/main/java/cobol4j/aws/web/ ${project.projectDir}/app/src/main/java/cobol4j/aws/web//info_sample.json &&
        rm ${project.projectDir}/app/src/main/java/cobol4j/aws/web/info_sample.json
    """)
}

// buildタスクを明示的に定義
tasks.register("build") {
    group = "build"
    description = "Builds the project"
    dependsOn("buildCobol")
}