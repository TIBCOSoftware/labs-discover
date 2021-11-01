package com.tibco.labs.config

case class analysisMetrics(
                            numEvents: Double,
                            numCases: Double,
                            numActivities: Double,
                            avgTime: Double,
                            medianTime: Double,
                            minTime: Double,
                            maxTime: Double,
                            numVariants: Double,
                            maxActivities: Double,
                            minActivities: Double,
                            avgActivities: Double,
                            numResources: Double,
                            avgResourcesPerCase: Double,
                            maxResourcesPerCase: Double,
                            minResourcesPerCase: Double,
                            minTimestamp: String,
                            maxTimestamp: String//,
                            //analysis_id: String
                          )
