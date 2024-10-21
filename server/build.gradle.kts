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
tasks.register("buildCobol") {
    group = "build"
    description = "Build opensource COBOL 4J"

    val opensourceCobol4jDir = file("${project.projectDir}/opensourcecobol4j/")

    // Git管理下にあるファイルのみを入力として指定
    inputs.files(getGitManagedFiles(opensourceCobol4jDir)).skipWhenEmpty()

    // 出力ファイルを指定
    outputs.file(file("${project.projectDir}/compiler_bin/lib/opensourcecobol4j/libcobj.jar"))
    outputs.file(file("${project.projectDir}/compiler_bin/bin/cobj"))
    outputs.file(file("${project.projectDir}/compiler_bin/bin/cobj-api"))

    // up-to-dateチェックをカスタマイズ
    outputs.upToDateWhen {
        file("${project.projectDir}/compiler_bin/lib/opensourcecobol4j/libcobj.jar").exists() &&
        file("${project.projectDir}/compiler_bin/bin/cobj").exists() &&
        file("${project.projectDir}/compiler_bin/bin/cobj-api").exists()
    }

    // 実行コマンドを指定
    doLast {
        exec {
            workingDir(opensourceCobol4jDir)
            commandLine("sh", "-c", """
                mkdir -p ${project.projectDir}/compiler_bin &&
                ./configure --prefix=${project.projectDir}/compiler_bin &&
                make &&
                make install
            """.trimIndent())
        }
    }
}

tasks.named("build") {
    dependsOn("buildCobol")
}