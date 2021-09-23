
ThisBuild / organization  := "com.tibco.labs.orchestrator"

name := "labs-processmining-api"

scalaVersion := "2.12.14"
lazy val akkaHttpVersion = "10.2.5"
lazy val akkaVersion = "2.6.15"
lazy val akkaManagementVersion = "1.0.9"
lazy val postgresVersion = "42.2.23"
lazy val alpakkaVersion = "3.0.2"

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
  //, "-Ymacro-annotations" // replace paradise macro plugins
)

scalacOptions := commonScalacOptions
addCompilerPlugin("org.scalamacros" % "paradise" % "2.1.1" cross CrossVersion.full)

classLoaderLayeringStrategy := ClassLoaderLayeringStrategy.AllLibraryJars
run / fork := true
Compile / run / fork := true

Compile /  run / mainClass := Some("com.tibco.labs.orchestrator.Server")

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
    "de.heikoseeberger" %% "akka-http-circe" % "1.37.0",
    "com.lightbend.akka" %% "akka-stream-alpakka-s3" % alpakkaVersion,
    "ch.qos.logback" % "logback-classic" % "1.2.5",
    "com.lightbend.akka" %% "akka-stream-alpakka-csv" % alpakkaVersion,
    "com.lightbend.akka" %% "akka-stream-alpakka-text" % alpakkaVersion,
    //"com.lightbend.akka.discovery" %% "akka-discovery-kubernetes-api" % akkaManagementVersion,
    //"com.lightbend.akka.management" %% "akka-management-cluster-bootstrap" % akkaManagementVersion,
    //"com.lightbend.akka.management" %% "akka-management-cluster-http" % akkaManagementVersion,
    "com.typesafe.akka" %% "akka-testkit" % akkaVersion % "test",
    "com.typesafe.akka" %% "akka-actor-testkit-typed" % akkaVersion % Test,
    "com.typesafe.akka" %% "akka-stream-testkit" % akkaVersion % Test,
    "com.typesafe.akka" %% "akka-http-testkit"   % akkaHttpVersion % Test,
    "org.scalatest"     %% "scalatest"           % "3.2.9"         % Test)
}
dependencyOverrides ++= Seq(
  "org.typelevel" %% "cats-core" % "2.6.1",
  "org.scala-lang.modules" %% "scala-xml" % "2.0.1",
  "org.typelevel" %% "cats-kernel" % "2.6.1"
)
//AWS SDK 2
libraryDependencies += "software.amazon.awssdk" % "sts" % "2.17.4"
libraryDependencies += "software.amazon.awssdk" % "s3" % "2.17.4"
val shadePackage = "com.tibco.labs.shaded"
libraryDependencies += "org.json" % "json" % "20210307"
 //ThisBuild / assemblyShadeRules := Seq(
 //   ShadeRule.rename("shapeless.**" -> s"$shadePackage.shapeless.@1").inAll,
 //   ShadeRule.rename("cats.kernel.**" -> s"$shadePackage.cats.kernel.@1").inAll
 //)

//AWS SDK 1
// https://github.com/aws/aws-sdk-java-v2/issues/859
libraryDependencies += "com.amazonaws" % "aws-java-sdk-s3" % "1.12.32"
libraryDependencies += "com.amazonaws" % "aws-java-sdk-sts" % "1.12.32"

// circe support - https://github.com/circe/circe
val circeVersion = "0.14.1"
libraryDependencies ++= Seq(
  "io.circe" %% "circe-core" % circeVersion,
  "io.circe" %% "circe-generic" % circeVersion,
  "io.circe" %% "circe-generic-extras" % circeVersion,
  "io.circe" %% "circe-parser" % circeVersion,
  "io.circe" %% "circe-optics" % circeVersion,
  "io.circe" %% "circe-literal" % circeVersion
)
// doobie

libraryDependencies ++= Seq(

  // Start with this one
  "org.tpolecat" %% "doobie-core"      % "0.13.4",
 "io.monix" %% "monix" % "3.4.0",
  // And add any of these as needed
  "org.tpolecat" %% "doobie-hikari"    % "0.13.4",          // HikariCP transactor.
  "org.tpolecat" %% "doobie-postgres"  % "0.13.4"          // Postgres driver 42.2.19 + type mappings.
)

libraryDependencies += "io.circe" %% "circe-yaml" % "0.14.0"
libraryDependencies += "org.gnieh" %% f"diffson-circe" % "4.1.1"

//https://github.com/pathikrit/better-files
libraryDependencies += "com.github.pathikrit" % "better-files_2.12" % "3.9.1"

// STTP - HTTP client

libraryDependencies ++= List(
  "com.softwaremill.sttp.client3" %% "okhttp-backend" % "3.3.11",
  "com.softwaremill.sttp.client3" %% "circe" % "3.3.11",
  "com.softwaremill.sttp.client3" %% "core" % "3.3.11"
)

libraryDependencies += "com.squareup.okhttp3" % "logging-interceptor" % "4.9.1"
//JDBC

libraryDependencies ++= Seq(
  "org.postgresql" % "postgresql" % postgresVersion
)
//swagger
val swaggerVersion = "2.1.10"
libraryDependencies ++= Seq(
  "javax.ws.rs" % "javax.ws.rs-api" % "2.1.1",
  "com.github.swagger-akka-http" %% "swagger-akka-http" % "2.4.2",
  "com.github.swagger-akka-http" %% "swagger-scala-module" % "2.3.1",
  "com.github.swagger-akka-http" %% "swagger-enumeratum-module" % "2.1.1",
  "pl.iterators" %% "kebs-spray-json" % "1.9.2",
  "io.swagger.core.v3" % "swagger-core" % swaggerVersion,
  "io.swagger.core.v3" % "swagger-annotations" % swaggerVersion,
  "io.swagger.core.v3" % "swagger-models" % swaggerVersion,
  "io.swagger.core.v3" % "swagger-jaxrs2" % swaggerVersion,
  "ch.megard" %% "akka-http-cors" % "1.1.1"
)

libraryDependencies ++= Seq(
  "com.lucidchart" %% "xtract" % "2.2.1"
)

// K8S

libraryDependencies += "io.kubernetes" % "client-java-extended" % "13.0.0"

val slickVersion = "3.3.3"

libraryDependencies ++= Seq(
  "com.typesafe.slick" %% "slick" % slickVersion,
  "com.typesafe.slick" %% "slick-codegen" % slickVersion,
  "org.slf4j" % "slf4j-nop" % "1.7.32",
  "com.github.tminglei" %% "slick-pg" % "0.19.7",
  "com.github.tminglei" %% "slick-pg_circe-json" % "0.19.7"
)

libraryDependencies += "redis.clients" % "jedis" % "3.6.3"


