

// Version supports for libraries
val sparkVersion = "3.1.2"
val sttpVersion = "2.2.9"
val postgresVersion = "42.2.20"
val scalaLoggingVersion = "3.9.2"
val configVersion = "1.4.0"


//resolvers += Resolver.jcenterRepo

val sparkLibs = Seq(
  "org.apache.spark" %% "spark-core" % sparkVersion % "provided",
  "org.apache.spark" %% "spark-sql" % sparkVersion % "provided",
  "org.apache.spark" %% "spark-mllib" % sparkVersion % "provided"
)

// STTP - HTTP client

libraryDependencies ++= List(
  "com.softwaremill.sttp.client3" %% "circe" % "3.2.3",
  "com.softwaremill.sttp.client3" %% "core" % "3.2.3"
)

libraryDependencies += "com.typesafe.scala-logging" %% "scala-logging" % scalaLoggingVersion
//Config loader with HOCON support
libraryDependencies += "com.typesafe" % "config" % configVersion
//Postgresql driver
libraryDependencies += "org.postgresql" % "postgresql" % postgresVersion

libraryDependencies += "org.scala-lang" % "scala-compiler" % scalaVersion.value

// circe support
val circeVersion = "0.13.0"
libraryDependencies ++= Seq(
  "io.circe" %% "circe-core",
  "io.circe" %% "circe-generic",
  "io.circe" %% "circe-parser",
  "io.circe" %% "circe-optics",
  "io.circe" %% "circe-literal"
).map(_ % circeVersion)

// iforest

//libraryDependencies += "com.linkedin.isolation-forest" %% "isolation-forest_2.4.3" % "1.0.0"

//libraryDependencies += "com.github.mrpowers" %% "spark-daria" % "1.0.0"
libraryDependencies += "com.github.mrpowers" % "spark-daria_2.12" % "1.0.0"

// Renjin
//resolvers += "BeDataDriven" at "https://nexus.bedatadriven.com/content/groups/public"
//updateOptions := updateOptions.value.withGigahorse(false)
//libraryDependencies += "org.renjin" % "renjin-script-engine" % "3.5-beta72"


/*
// s3a support
libraryDependencies += "org.apache.hadoop" % "hadoop-aws" % "2.7.7" % "provided"
libraryDependencies += "org.apache.hadoop" % "hadoop-common" % "2.7.7" % "provided"
libraryDependencies += "com.amazonaws" % "aws-java-sdk" % "1.7.4" % "provided"
libraryDependencies += "org.apache.hadoop" % "hadoop-client" % "2.7.7" % "provided"
*/

// cosmoDB support (Azure)
//libraryDependencies += "com.microsoft.azure" % "azure-cosmosdb-spark_2.4.0_2.11" % "2.1.5" exclude("com.fasterxml.jackson.core", "jackson-databind")

// spark NLP -- no 2.12 support yet
//libraryDependencies += "com.johnsnowlabs.nlp" %% "spark-nlp" % "2.4.5" % "provided"

lazy val commonSettings = Seq(
  organization := "com.tibco.labs",
  scalaVersion := "2.12.12",
  version := "3.16.0",
  libraryDependencies ++= sparkLibs
)

// compiler options
scalacOptions ++= Seq("-deprecation", "-feature")
javacOptions ++= Seq("-source", "11", "-target", "11")
// Settings
val domain = "public.ecr.aws/tibcolabs"

// For building the FAT jar
lazy val assemblySettings = Seq(
  assembly / assemblyOption := (assemblyOption in assembly).value.copy(includeScala = false),
  assembly / assemblyOutputPath := baseDirectory.value / "output" / s"$domain-${name.value}.jar"
)
//https://github.com/pathikrit/better-files
libraryDependencies += "com.github.pathikrit" % "better-files_2.12" % "3.9.1"

// connection pool
libraryDependencies += "com.zaxxer" % "HikariCP" % "4.0.3"

val targetDockerJarPath =  "/opt/spark/jars"

// For building the docker image

lazy val dockerSettings = Seq(
  imageNames in docker := Seq(
    //ImageName(s"$domain/${name.value}:latest"),
    ImageName(s"$domain/${name.value}:${version.value}")
  ),
  buildOptions in docker := BuildOptions(
    cache = false,
    removeIntermediateContainers = BuildOptions.Remove.Always,
    pullBaseImage = BuildOptions.Pull.Always
  ),
  dockerfile in docker := {
    // The assembly task generates a fat JAR file
    val artifact: File = assembly.value
    val artifactTargetPath = s"$targetDockerJarPath/$domain-${name.value}.jar"
    new Dockerfile {
      from(s"public.ecr.aws/tibcolabs/labs-discover-spark-runner:3.1.2")
    }.add(artifact, artifactTargetPath)
  }
)


// Include "provided" dependencies back to default run task
lazy val runLocalSettings = Seq(
  // https://stackoverflow.com/questions/18838944/how-to-add-provided-dependencies-back-to-run-test-tasks-classpath/21803413#21803413
  Compile / run := Defaults
    .runTask(
      fullClasspath in Compile,
      mainClass in (Compile, run),
      runner in (Compile, run)
    )
    .evaluated
)

lazy val root = (project in file("."))
  .enablePlugins(sbtdocker.DockerPlugin)
  .enablePlugins(AshScriptPlugin)
  .settings(
    commonSettings,
    assemblySettings,
    dockerSettings,
    runLocalSettings,
    name := "labs-discover-spark-pm",
    Compile / mainClass := Some("com.tibco.labs.main"),
    Compile / resourceGenerators += createImporterHelmChart.taskValue,
    Compile / resourceGenerators += createSparkApplicationYAML.taskValue
  )

// Task to create helm chart
lazy val createImporterHelmChart: Def.Initialize[Task[Seq[File]]] = Def.task {
  val chartFile: File = baseDirectory.value / "helm" / "Chart.yaml"
  val valuesFile = baseDirectory.value / "helm" / "values.yaml"

  val chartContents =
    s"""# Generated by build.sbt. Please don't manually update
       |apiVersion: v1
       |name: $domain-${name.value}
       |version: ${version.value}
       |appVersion: ${version.value}
       |description: Process Mining job
       |home: https://github.com/tibco/labs-processmining-backend
       |sources:
       |  - https://github.com/tibco/labs-processmining-backend
       |maintainers:
       |  - name: Florent Cenedese
       |    email: fcenedes@tibco.com
       |    url: https://www.tibco.com
       |""".stripMargin

  val valuesContents =
    s"""# Generated by build.sbt. Please don't manually update
       |version: ${version.value}
       |sparkVersion: $sparkVersion
       |image: $domain/${name.value}:${version.value}
       |imageRegistry:
       |jar: local://$targetDockerJarPath/$domain-${name.value}.jar
       |mainClass: ${(Compile / run / mainClass).value.getOrElse("__MAIN_CLASS__")}
       |fileDependencies: []
       |""".stripMargin

  IO.write(chartFile, chartContents)
  IO.write(valuesFile, valuesContents)
  Seq(chartFile, valuesFile)
}
// Task to create helm chart
lazy val createSparkApplicationYAML: Def.Initialize[Task[Seq[File]]] = Def.task {
  val k8sFile = baseDirectory.value / "k8s" / s"${name.value}.yaml"

  val k8sContents =
    s"""# Generated by build.sbt. Please don't manually update, or do it at your own risks ;-)
       |apiVersion: "sparkoperator.k8s.io/v1beta2"
       |kind: SparkApplication
       |metadata:
       |  name: spark-pm
       |  namespace: spark-operator
       |spec:
       |  type: Scala
       |  mode: cluster
       |  image: $domain/${name.value}:${version.value}
       |  imagePullPolicy: Always
       |  imagePullSecrets:
       |    - regcred
       |  mainClass: ${(Compile / run / mainClass).value.getOrElse("__MAIN_CLASS__")}
       |  mainApplicationFile: "local://$targetDockerJarPath/$domain-${name.value}.jar"
       |  arguments:
       |    - "DIS_000014"
       |    - "discover"
       |  sparkVersion: "$sparkVersion"
       |  batchScheduler: "volcano"
       |  restartPolicy:
       |    type: Never
       |  volumes:
       |    - name: "persistent-storage"
       |      persistentVolumeClaim:
       |        claimName: efs-claim
       |    - name: "spark-local-dir-scratch"
       |      hostPath:
       |        path: "/tmp"
       |        type: Directory
       |    - name: "spark-secrets"
       |      secret:
       |        secretName: "discover-demo-secret"
       |  driver:
       |    envFrom:
       |      - configMapRef:
       |          name: discover-config
       |      - secretRef:
       |          name: discover-secret
       |    cores: 2
       |    memory: "2048m"
       |    labels:
       |      version: $sparkVersion
       |    serviceAccount: spark-operator-spark
       |    volumeMounts:
       |      - name: "persistent-storage"
       |        mountPath: "/data"
       |      - name : "spark-local-dir-scratch"
       |        mountPath: "/tmp"
       |      - name : "spark-secrets"
       |        mountPath: "/opt/config"
       |  executor:
       |    envFrom:
       |      - configMapRef:
       |          name: discover-config
       |      - secretRef:
       |          name: discover-secret
       |    cores: 4
       |    instances: 2
       |    memory: "4096m"
       |    labels:
       |      version: $sparkVersion
       |    volumeMounts:
       |      - name: "persistent-storage"
       |        mountPath: "/data"
       |      - name : "spark-local-dir-scratch"
       |        mountPath: "/tmp"
       |  monitoring:
       |    exposeDriverMetrics: false
       |    exposeExecutorMetrics: false
       |    prometheus:
       |      jmxExporterJar: "/prometheus/jmx_prometheus_javaagent-0.11.0.jar"
       |      port: 8090
       |""".stripMargin

  IO.write(k8sFile, k8sContents)
  Seq(k8sFile)
}

excludeDependencies += "com.google.code.findbugs" % "annotations"



assemblyMergeStrategy in assembly := {
  case "mozilla/public-suffix-list.txt" => MergeStrategy.last
  case "META-INF/io.netty.versions.properties" => MergeStrategy.last
  case PathList("org","renjin","gcc", xs @ _*) => MergeStrategy.first
  case PathList("org","renjin","math", xs @ _*) => MergeStrategy.first
  case PathList("META-INF","org.renjin.gcc.symbols",xs @ _* ) => MergeStrategy.first
  case x =>
    val oldStrategy = (assemblyMergeStrategy in assembly).value
    oldStrategy(x)
}