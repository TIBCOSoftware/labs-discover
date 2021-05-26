// Deploy fat JARs. Restart processes: https://github.com/sbt/sbt-assembly
addSbtPlugin("com.eed3si9n" % "sbt-assembly" % "0.14.10")

// Dynamic versioning: https://github.com/dwijnand/sbt-dynver
addSbtPlugin("com.dwijnand" % "sbt-dynver" % "4.0.0")

// sbt plugin for dockerization: https://github.com/sbt/sbt-native-packager
addSbtPlugin("com.typesafe.sbt" % "sbt-native-packager" % "1.7.0")

// sbt plugin to build Docker Images: https://github.com/marcuslonnberg/sbt-docker
addSbtPlugin("se.marcuslonnberg" % "sbt-docker" % "1.8.0")

