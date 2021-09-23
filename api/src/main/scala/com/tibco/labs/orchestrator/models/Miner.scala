package com.tibco.labs.orchestrator.models

case class VariantsTable(variant: Option[String] = None, variantId: Option[Long] = None, frequency: Option[Long] = None, occurencesPercent: Option[Double] = None, analysisId: Option[String] = None, bucketedfrequency: Option[Double] = None, bucketedfrequencyLabel: Option[String] = None)
case class ActivitiesTable(analysisId: Option[String] = None, activityName: Option[String] = None, id: Option[Long] = None, totalOccurrences: Option[Long] = None, totalFirst: Option[Long] = None, totalLast: Option[Long] = None, isend: Option[Int] = None, isstart: Option[Int] = None)
case class AnalysisList(analysisId: Option[String])
