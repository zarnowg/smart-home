import com.github.gradle.node.npm.task.NpmTask

plugins {
    java
    id("org.springframework.boot") version "4.1.2"
    id("io.spring.dependency-management") version "1.1.7"
    id("com.github.node-gradle.node") version "7.1.0"
}

group = "com.greg.zarnowski"
version = "0.0.1-SNAPSHOT"
description = "smart-home"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation("org.springframework.boot:spring-boot-starter-jdbc")
    runtimeOnly("org.postgresql:postgresql")
    testRuntimeOnly("com.h2database:h2")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

val frontendDir = layout.projectDirectory.dir("../frontend")
val skipFrontend = providers.gradleProperty("skipFrontend").isPresent

node {
    download = true
    version = "24.22.2"
    npmInstallCommand = "ci"
    nodeProjectDir = frontendDir
}

val frontendBuild by tasks.registering(NpmTask::class) {
    group = "frontend"
    description = "Builds the React frontend."
    dependsOn(tasks.npmInstall)
    args = listOf("run", "build")
    inputs.dir(frontendDir.dir("src"))
    inputs.dir(frontendDir.dir("public"))
    inputs.files(frontendDir.files(
            "index.html", "package.json", "package-lock.json", "vite.config.ts",
            "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json"))
    outputs.dir(frontendDir.dir("dist"))
}

val frontendTest by tasks.registering(NpmTask::class) {
    group = "frontend"
    description = "Runs the React frontend tests."
    dependsOn(tasks.npmInstall)
    args = listOf("test")
}

if (!skipFrontend) {
    tasks.processResources {
        from(frontendBuild) {
            into("static")
        }
    }
    tasks.check {
        dependsOn(frontendTest)
    }
}
