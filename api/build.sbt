organization in ThisBuild := "com.tibco.labs.orchestrator"

name := "labs-processmining-api"

scalaVersion := "2.12.13"
lazy val akkaHttpVersion = "10.2.4"
lazy val akkaVersion = "2.6.14"
lazy val akkaManagementVersion = "1.0.9"
lazy val postgresVersion = "42.2.16"

// make version compatible with docker for publishing
ThisBuild / dynverSeparator := "-"

lazy val commonScalacOptions = Seq(
  "-feature" // Emit warning and location for usages of features that should be imported explicitly.
  , "-deprecation" // Emit warning and location for usages of deprecated APIs.
  , "-unchecked" // Enable additional warnings where generated code depends on assumptions.
  , "-encoding" // Specify encoding of source files
  , "UTF-8"
  // , "-Xfatal-warnings"
  , "-language:_"
  , "-Ywarn-adapted-args" // Warn if an argument list is modified to match the receiver
  , "-Ywarn-dead-code" // Warn when dead code is identified.
  , "-Ywarn-inaccessible" // Warn about inaccessible types in method signatures.
  , "-Ywarn-infer-any" // Warn when a type argument is inferred to be `Any`.
  , "-Ywarn-nullary-override" // Warn when non-nullary `def f()' overrides nullary `def f'
  , "-Ywarn-nullary-unit" // Warn when nullary methods return Unit.
  , "-Ywarn-numeric-widen" // Warn when numerics are widened.
  , "-Ywarn-unused" // Warn when local and private vals, vars, defs, and types are unused.
  , "-Ywarn-unused-import" // Warn when imports are unused.
)

scalacOptions := commonScalacOptions
addCompilerPlugin("org.scalamacros" % "paradise" % "2.1.1" cross CrossVersion.full)

classLoaderLayeringStrategy := ClassLoaderLayeringStrategy.AllLibraryJars
fork in run := true
Compile / run / fork := true

mainClass in (Compile, run) := Some("com.tibco.labs.orchestrator.Server")

enablePlugins(JavaServerAppPackaging, DockerPlugin)

dockerExposedPorts := Seq(8080, 8558, 25520)
dockerUpdateLatest := true
dockerUsername := Some("tibcosoftware")
//dockerRepository := sys.props.get("docker.registry")
dockerBaseImage := "fcenedes/javaeks:latest"

bashScriptExtraDefines ++= IO.readLines(baseDirectory.value / "kubernetes" / "ExtractTempKeys.sh")


libraryDependencies ++= {
  Seq(
    "com.typesafe.akka" %% "akka-http" % akkaHttpVersion,
    "com.typesafe.akka" %% "akka-http-spray-json" % akkaHttpVersion,
    //"com.typesafe.akka" %% "akka-cluster-typed" % akkaVersion,
    //"com.typesafe.akka" %% "akka-cluster-sharding-typed" % akkaVersion,
    "com.typesafe.akka" %% "akka-stream-typed" % akkaVersion,
    "com.typesafe.akka" %% "akka-actor-typed" % akkaVersion,
    //"com.typesafe.akka" %% "akka-discovery" % akkaVersion,
    "com.typesafe.akka" %% "akka-stream" % akkaVersion,
    "com.typesafe.akka" %% "akka-http-xml" % akkaHttpVersion,
    "com.typesafe.akka" %% "akka-http-caching" % akkaHttpVersion,
    "de.heikoseeberger" %% "akka-http-circe" % "1.31.0",
    "com.lightbend.akka" %% "akka-stream-alpakka-s3" % "2.0.2",
    "ch.qos.logback" % "logback-classic" % "1.2.3",
    "com.lightbend.akka" %% "akka-stream-alpakka-csv" % "2.0.2",
    "com.lightbend.akka" %% "akka-stream-alpakka-text" % "2.0.2",
    //"com.lightbend.akka.discovery" %% "akka-discovery-kubernetes-api" % akkaManagementVersion,
    //"com.lightbend.akka.management" %% "akka-management-cluster-bootstrap" % akkaManagementVersion,
    //"com.lightbend.akka.management" %% "akka-management-cluster-http" % akkaManagementVersion,
    "com.typesafe.akka" %% "akka-testkit" % akkaVersion % "test",
    "com.typesafe.akka" %% "akka-actor-testkit-typed" % akkaVersion % Test,
    "com.typesafe.akka" %% "akka-stream-testkit" % akkaVersion % Test,
    "com.typesafe.akka" %% "akka-http-testkit"   % akkaHttpVersion % Test,
    "org.scalatest"     %% "scalatest"           % "3.1.4"         % Test)
}

//AWS SDK 2
libraryDependencies += "software.amazon.awssdk" % "sts" % "2.16.59"
libraryDependencies += "software.amazon.awssdk" % "s3" % "2.16.59"

libraryDependencies += "org.json" % "json" % "20210307"

//AWS SDK 1
// https://github.com/aws/aws-sdk-java-v2/issues/859
libraryDependencies += "com.amazonaws" % "aws-java-sdk-s3" % "1.11.1015"
libraryDependencies += "com.amazonaws" % "aws-java-sdk-sts" % "1.11.1015"

// circe support - https://github.com/circe/circe
val circeVersion = "0.13.0"
libraryDependencies ++= Seq(
  "io.circe" %% "circe-core",
  "io.circe" %% "circe-generic",
  "io.circe" %% "circe-generic-extras",
  "io.circe" %% "circe-parser",
  "io.circe" %% "circe-optics",
  "io.circe" %% "circe-literal"
).map(_ % circeVersion)

libraryDependencies += "io.circe" %% "circe-yaml" % circeVersion
libraryDependencies += "org.gnieh" %% f"diffson-circe" % "4.0.3"

//https://github.com/pathikrit/better-files
libraryDependencies += "com.github.pathikrit" % "better-files_2.12" % "3.9.1"

// STTP - HTTP client

libraryDependencies ++= List(
  "com.softwaremill.sttp.client3" %% "okhttp-backend" % "3.2.3",
  "com.softwaremill.sttp.client3" %% "circe" % "3.2.3",
  "com.softwaremill.sttp.client3" %% "core" % "3.2.3"
)

libraryDependencies += "com.squareup.okhttp3" % "logging-interceptor" % "4.9.0"
//JDBC

libraryDependencies ++= Seq(
  "org.postgresql" % "postgresql" % postgresVersion
)
//swagger
val swaggerVersion = "2.1.7"
libraryDependencies ++= Seq(
  "javax.ws.rs" % "javax.ws.rs-api" % "2.0.1",
  "com.github.swagger-akka-http" %% "swagger-akka-http" % "2.4.0",
  "com.github.swagger-akka-http" %% "swagger-scala-module" % "2.3.0",
  "com.github.swagger-akka-http" %% "swagger-enumeratum-module" % "2.1.0",
  "pl.iterators" %% "kebs-spray-json" % "1.9.0",
  "io.swagger.core.v3" % "swagger-core" % swaggerVersion,
  "io.swagger.core.v3" % "swagger-annotations" % swaggerVersion,
  "io.swagger.core.v3" % "swagger-models" % swaggerVersion,
  "io.swagger.core.v3" % "swagger-jaxrs2" % swaggerVersion,
  "ch.megard" %% "akka-http-cors" % "1.1.1"
)

libraryDependencies ++= Seq(
  "org.scala-lang.modules" %% "scala-xml" % "2.0.0-M5",
  "com.lucidchart" %% "xtract" % "2.2.1"
)

// K8S

libraryDependencies += "io.kubernetes" % "client-java-extended" % "11.0.0"

val slickVersion = "3.3.3"

libraryDependencies ++= Seq(
  "com.typesafe.slick" %% "slick" % slickVersion,
  "com.typesafe.slick" %% "slick-codegen" % slickVersion,
  "org.slf4j" % "slf4j-nop" % "1.7.19",
  "com.github.tminglei" %% "slick-pg" % "0.19.5",
  "com.github.tminglei" %% "slick-pg_circe-json" % "0.19.5"
)

libraryDependencies += "redis.clients" % "jedis" % "3.5.2"

//sourceGenerators in Compile += slick.taskValue // Automatic code generation on build

lazy val slick = taskKey[Seq[File]]("Generate Tables.scala")
slick := {
  val dir = (sourceManaged in Compile) value
  val outputDir = dir
  val url = "jdbc:postgresql://localhost:5432/model?currentSchema=newSchema" // connection info
  val jdbcDriver = "org.postgresql.Driver"
  val slickDriver = "slick.jdbc.PostgresProfile"
  val pkg = "com.tibco.labs.orchestrator.db.model"
  val user = "*****"
  val password = "*****"


  val cp = (dependencyClasspath in Compile) value
  val s = streams value

  runner.value.run("slick.codegen.SourceCodeGenerator",
    cp.files,
    Array(slickDriver, jdbcDriver, url, outputDir.getPath, pkg, user, password),
    s.log).failed foreach (sys error _.getMessage)

  val file = outputDir / pkg / "Tables.scala"

  Seq(file)

}

