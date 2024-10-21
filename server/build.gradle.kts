import java.io.ByteArrayOutputStream

plugins {
    id("cpp-application")
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
        fileTree("${project.projectDir}/cobol_converted"),
    )

    commandLine("sh", "-c", """
        mkdir -p ${project.projectDir}/cobol_converted &&
        ${project.projectDir}/compiler_bin/bin/cobj -info-json-dir=${project.projectDir}/cobol_converted -C *.cbl &&
        mv *.java ${project.projectDir}/cobol_converted &&
        CLASSPATH=:${project.projectDir}/compiler_bin/lib/opensourcecobol4j/libcobj.jar ${project.projectDir}/compiler_bin/bin/cobj-api --output-dir=${project.projectDir}/cobol_converted ${project.projectDir}/cobol_converted/*.json
    """)
}

tasks.named("build").configure {
    dependsOn("buildCobol")
}