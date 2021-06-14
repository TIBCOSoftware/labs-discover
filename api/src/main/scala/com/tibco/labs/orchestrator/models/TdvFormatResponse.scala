package com.tibco.labs.orchestrator.models

import com.lucidchart.open.xtract.{XmlReader, __}
import com.lucidchart.open.xtract.XmlReader._


/*
<?xml version="1.0" encoding="utf-8"?>
<soap-env:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
  <soap-env:Body>
      <resource:getIntrospectableResourceIdsTaskResponse xmlns:resource="http://www.compositesw.com/services/system/admin/resource" xmlns:common="http://www.compositesw.com/services/system/util/common">
          <common:taskId>3001</common:taskId>
      </resource:getIntrospectableResourceIdsTaskResponse>
  </soap-env:Body>
</soap-env:Envelope>
 */


case class getIntrospectableResourceIdsTaskResponseFmt(taskId: Option[String])

object getIntrospectableResourceIdsTaskResponseFmt {
  implicit val reader: XmlReader[getIntrospectableResourceIdsTaskResponseFmt] = (
    (__ \ "Body" \ "getIntrospectableResourceIdsTaskResponse" \ "taskId").read[String].optional
    ).map(apply _)
}


/*
<?xml version="1.0" encoding="utf-8"?>
<soap-env:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
    <soap-env:Body>
        <resource:introspectResourcesTaskResponse xmlns:resource="http://www.compositesw.com/services/system/admin/resource" xmlns:common="http://www.compositesw.com/services/system/util/common">
            <common:taskId>3002</common:taskId>
        </resource:introspectResourcesTaskResponse>
    </soap-env:Body>
</soap-env:Envelope>
 */

case class introspectResourcesTaskResponseFmt(taskId: Option[String])

object introspectResourcesTaskResponseFmt {
  implicit val reader: XmlReader[introspectResourcesTaskResponseFmt] = (
    (__ \ "Body" \ "introspectResourcesTaskResponse" \ "taskId").read[String].optional
    ).map(apply _)
}


/*
<?xml version="1.0" encoding="utf-8"?>
<soap-env:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
    <soap-env:Body>
        <resource:getIntrospectableResourceIdsResultResponse xmlns:resource="http://www.compositesw.com/services/system/admin/resource" xmlns:common="http://www.compositesw.com/services/system/util/common">
            <common:taskId>3068</common:taskId>
            <common:totalResults>8</common:totalResults>
            <common:completed>true</common:completed>
            <resource:lastUpdate>2021-03-01T21:09:33.550Z</resource:lastUpdate>
            <resource:resourceIdentifiers></resource:resourceIdentifiers>
        </resource:getIntrospectableResourceIdsResultResponse>
    </soap-env:Body>
</soap-env:Envelope>
 */

case class getIntrospectableResourceIdsResultResponseFmt(completed: Option[String])

object getIntrospectableResourceIdsResultResponseFmt {
  implicit val reader: XmlReader[getIntrospectableResourceIdsResultResponseFmt] = (
    (__ \ "Body" \ "getIntrospectableResourceIdsResultResponse" \ "completed").read[String].optional
    ).map(apply _)
}

/*
<?xml version="1.0" encoding="utf-8"?>
<soap-env:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
    <soap-env:Body>
        <resource:introspectResourcesResultResponse xmlns:resource="http://www.compositesw.com/services/system/admin/resource" xmlns:common="http://www.compositesw.com/services/system/util/common">
            <common:taskId>3069</common:taskId>
            <common:totalResults>4</common:totalResults>
            <common:completed>true</common:completed>
            <resource:status>
                <resource:status>SUCCESS</resource:status>
                <resource:introspectorVersion>2</resource:introspectorVersion>
                <resource:startTime>2021-03-01T21:11:31.871Z</resource:startTime>
                <resource:endTime>2021-03-01T21:11:32.264Z</resource:endTime>
                <resource:addedCount>3</resource:addedCount>
                <resource:removedCount>0</resource:removedCount>
                <resource:updatedCount>0</resource:updatedCount>
                <resource:skippedCount>1</resource:skippedCount>
                <resource:totalCompletedCount>4</resource:totalCompletedCount>
                <resource:toBeAddedCount>3</resource:toBeAddedCount>
                <resource:toBeRemovedCount>0</resource:toBeRemovedCount>
                <resource:toBeUpdatedCount>1</resource:toBeUpdatedCount>
                <resource:totalToBeCompletedCount>4</resource:totalToBeCompletedCount>
                <resource:warningCount>0</resource:warningCount>
                <resource:errorCount>0</resource:errorCount>
            </resource:status>
        </resource:introspectResourcesResultResponse>
    </soap-env:Body>
</soap-env:Envelope>
 */

case class introspectResourcesResultResponseFmt(completed: Option[String])

object introspectResourcesResultResponseFmt {
  implicit val reader: XmlReader[introspectResourcesResultResponseFmt] = (
    (__ \ "Body" \ "introspectResourcesResultResponse" \ "completed").read[String].optional
    ).map(apply _)
}