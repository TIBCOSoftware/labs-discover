package com.tibco.labs.orchestrator.models

class TdvFormatMsgPayload {

  case class payload(soapMessage: String, soapAction: String)

  def BeginSessionPayload(): payload = {
    val msg: String =
      """<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ses="http://www.compositesw.com/services/system/util/session">
        |   <soapenv:Header/>
        |   <soapenv:Body>
        |      <ses:beginSession>
        |      </ses:beginSession>
        |   </soapenv:Body>
        |</soapenv:Envelope>""".stripMargin
    payload(msg, "beginSession")
  }

  def BeginTransactionPayload(): payload = {
    val msg: String =
      """<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ses="http://www.compositesw.com/services/system/util/session"
        |xmlns:security="http://www.compositesw.com/services/system/util/security">
        |    <soapenv:Body>
        |        <ses:beginTransaction>
        |            <!--Optional:-->
        |            <ses:transactionMode>BEST_EFFORT</ses:transactionMode>
        |        </ses:beginTransaction>
        |    </soapenv:Body>
        |</soapenv:Envelope>""".stripMargin
    payload(msg, "beginTransaction")
  }

  def ClearIntrospectionCachePayload(orgid: String): payload = {
    val msg: String =
      s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://www.compositesw.com/services/system/admin/resource">
         |   <soapenv:Header/>
         |   <soapenv:Body>
         |      <res:clearIntrospectableResourceIdCache>
         |         <res:path>/shared/org_${orgid}/CSV</res:path>
         |      </res:clearIntrospectableResourceIdCache>
         |   </soapenv:Body>
         |</soapenv:Envelope>""".stripMargin
    payload(msg, "clearIntrospectableResourceIdCache")
  }

  def ClearIntrospectionCachePayloadDiscover(): payload = {
    val msg: String =
      s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://www.compositesw.com/services/system/admin/resource">
         |   <soapenv:Header/>
         |   <soapenv:Body>
         |      <res:clearIntrospectableResourceIdCache>
         |         <res:path>/shared/discover/discover_cic</res:path>
         |      </res:clearIntrospectableResourceIdCache>
         |   </soapenv:Body>
         |</soapenv:Envelope>""".stripMargin
    payload(msg, "clearIntrospectableResourceIdCache")
  }

  def GetIntrospectableTaskPayload(orgid: String): payload = {

    val msg: String =
      s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://www.compositesw.com/services/system/admin/resource" xmlns:com="http://www.compositesw.com/services/system/util/common">
         |   <soapenv:Header/>
         |   <soapenv:Body>
         |      <res:getIntrospectableResourceIdsTask>
         |         <res:path>/shared/org_${orgid}/CSV</res:path>
         |      </res:getIntrospectableResourceIdsTask>
         |   </soapenv:Body>
         |</soapenv:Envelope>""".stripMargin
    payload(msg, "getIntrospectableResourceIdsTask")
  }

  def GetIntrospectableTaskDiscoverPayload(): payload = {

    val msg: String =
      s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://www.compositesw.com/services/system/admin/resource" xmlns:com="http://www.compositesw.com/services/system/util/common">
         |   <soapenv:Header/>
         |   <soapenv:Body>
         |      <res:getIntrospectableResourceIdsTask>
         |         <res:path>/shared/discover/discover_cic</res:path>
         |      </res:getIntrospectableResourceIdsTask>
         |   </soapenv:Body>
         |</soapenv:Envelope>""".stripMargin
    payload(msg, "getIntrospectableResourceIdsTask")
  }

  def IntrospectableTaskResultPayload(taskid: String): payload = {
    val msg =
      s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://www.compositesw.com/services/system/admin/resource" xmlns:com="http://www.compositesw.com/services/system/util/common">
         |   <soapenv:Header/>
         |   <soapenv:Body>
         |      <res:getIntrospectableResourceIdsResult>
         |         <com:taskId>${taskid}</com:taskId>
         |      </res:getIntrospectableResourceIdsResult>
         |   </soapenv:Body>
         |</soapenv:Envelope>""".stripMargin

    payload(msg, "getIntrospectableResourceIdsResult")
  }

  def IntrospectRssTask(orgid: String, dataFileName: String, config: tdvJob, action: String): payload = {
    val msg =
      s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://www.compositesw.com/services/system/admin/resource" xmlns:com="http://www.compositesw.com/services/system/util/common">
         |   <soapenv:Header/>
         |   <soapenv:Body>
         |      <res:introspectResourcesTask>
         |         <res:path>/shared/org_${orgid}/CSV</res:path>
         |         <res:plan>
         |            <!--Optional:-->
         |            <res:updateAllIntrospectedResources>true</res:updateAllIntrospectedResources>
         |            <!--Optional:-->
         |            <res:failFast>false</res:failFast>
         |            <!--Optional:-->
         |            <res:commitOnFailure>false</res:commitOnFailure>
         |            <!--Optional:-->
         |            <res:autoRollback>false</res:autoRollback>
         |            <!--Optional:-->
         |            <res:scanForNewResourcesToAutoAdd>true</res:scanForNewResourcesToAutoAdd>
         |            <!--Optional:-->
         |            <res:entries>
         |               <!--Zero or more repetitions:-->
         |               <res:entry>
         |                  <res:resourceId>
         |                     <res:path>${dataFileName}</res:path>
         |                     <res:type>TABLE</res:type>
         |                     <res:subtype>DELIMITED_FILE_TABLE</res:subtype>
         |                  </res:resourceId>
         |                  <res:action>${action}</res:action>
         |                  <!--Optional:-->
         |                  <res:attributes>
         |                     <!--Zero or more repetitions:-->
         |                     <com:attribute>
         |                        <com:name>charset</com:name>
         |                        <com:type>STRING</com:type>
         |                        <com:value>${config.DatasetSource.Encoding.getOrElse("utf-8")}</com:value>
         |                     </com:attribute>
         |                     <com:attribute>
         |                        <com:name>csvCommentChar</com:name>
         |                        <com:type>STRING</com:type>
         |                        <com:value>${config.DatasetSource.CommentsChar.getOrElse("#")}</com:value>
         |                     </com:attribute>
         |                     <com:attribute>
         |                        <com:name>csvEscapeChar</com:name>
         |                        <com:type>STRING</com:type>
         |                        <com:value>${config.DatasetSource.EscapeChar.getOrElse("\\")}</com:value>
         |                     </com:attribute>
         |                     <com:attribute>
         |                        <com:name>delimiter</com:name>
         |                        <com:type>STRING</com:type>
         |                        <com:value>${config.DatasetSource.Separator.getOrElse(",")}</com:value>
         |                     </com:attribute>
         |                     <com:attribute>
         |                        <com:name>qualifier</com:name>
         |                        <com:type>STRING</com:type>
         |                        <com:value>${config.DatasetSource.QuoteChar.getOrElse("\"")}</com:value>
         |                     </com:attribute>
         |                     <com:attribute>
         |                        <com:name>hasHeaders</com:name>
         |                        <com:type>BOOLEAN</com:type>
         |                        <com:value>true</com:value>
         |                     </com:attribute>
         |                     <com:attribute>
         |                        <com:name>inferSchema</com:name>
         |                        <com:type>BOOLEAN</com:type>
         |                        <com:value>true</com:value>
         |                     </com:attribute>
         |                  </res:attributes>
         |               </res:entry>
         |            </res:entries>
         |         </res:plan>
         |         <res:runInBackgroundTransaction>false</res:runInBackgroundTransaction>
         |      </res:introspectResourcesTask>
         |   </soapenv:Body>
         |</soapenv:Envelope>""".stripMargin

    payload(msg, "introspectResourcesTask")
  }

  def IntrospectRssDiscoverTask(orgid: String): payload = {
    val msg =
      s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://www.compositesw.com/services/system/admin/resource" xmlns:com="http://www.compositesw.com/services/system/util/common">
         |   <soapenv:Header/>
         |   <soapenv:Body>
         |      <res:introspectResourcesTask>
         |         <res:path>/shared/discover/discover_cic</res:path>
         |         <res:plan>
         |            <!--Optional:-->
         |            <res:updateAllIntrospectedResources>true</res:updateAllIntrospectedResources>
         |            <!--Optional:-->
         |            <res:failFast>false</res:failFast>
         |            <!--Optional:-->
         |            <res:commitOnFailure>false</res:commitOnFailure>
         |            <!--Optional:-->
         |            <res:autoRollback>false</res:autoRollback>
         |            <!--Optional:-->
         |            <res:scanForNewResourcesToAutoAdd>true</res:scanForNewResourcesToAutoAdd>
         |            <!--Optional:-->
         |            <res:entries>
         |               <!--Zero or more repetitions:-->
         |               <res:entry>
         |                  <res:resourceId>
         |                     <res:path>org_${orgid}</res:path>
         |                     <res:type>CONTAINER</res:type>
         |                     <res:subtype>SCHEMA_CONTAINER</res:subtype>
         |                  </res:resourceId>
         |                  <res:action>ADD_OR_UPDATE</res:action>
         |               </res:entry>
         |               <res:entry>
         |                  <res:resourceId>
         |                     <res:path>org_${orgid}/activities</res:path>
         |                     <res:type>TABLE</res:type>
         |                     <res:subtype>DATABASE_TABLE</res:subtype>
         |                  </res:resourceId>
         |                  <res:action>ADD_OR_UPDATE</res:action>
         |               </res:entry>
         |               <res:entry>
         |                  <res:resourceId>
         |                     <res:path>org_${orgid}/attributes_binary</res:path>
         |                     <res:type>TABLE</res:type>
         |                     <res:subtype>DATABASE_TABLE</res:subtype>
         |                  </res:resourceId>
         |                  <res:action>ADD_OR_UPDATE</res:action>
         |               </res:entry>
         |               <res:entry>
         |                  <res:resourceId>
         |                     <res:path>org_${orgid}/cases</res:path>
         |                     <res:type>TABLE</res:type>
         |                     <res:subtype>DATABASE_TABLE</res:subtype>
         |                  </res:resourceId>
         |                  <res:action>ADD_OR_UPDATE</res:action>
         |               </res:entry>
         |               <res:entry>
         |                  <res:resourceId>
         |                     <res:path>org_${orgid}/datasets</res:path>
         |                     <res:type>TABLE</res:type>
         |                     <res:subtype>DATABASE_TABLE</res:subtype>
         |                  </res:resourceId>
         |                  <res:action>ADD_OR_UPDATE</res:action>
         |               </res:entry>
         |               <res:entry>
         |                  <res:resourceId>
         |                     <res:path>org_${orgid}/events</res:path>
         |                     <res:type>TABLE</res:type>
         |                     <res:subtype>DATABASE_TABLE</res:subtype>
         |                  </res:resourceId>
         |                  <res:action>ADD_OR_UPDATE</res:action>
         |               </res:entry>
         |               <res:entry>
         |                  <res:resourceId>
         |                     <res:path>org_${orgid}/metrics</res:path>
         |                     <res:type>TABLE</res:type>
         |                     <res:subtype>DATABASE_TABLE</res:subtype>
         |                  </res:resourceId>
         |                  <res:action>ADD_OR_UPDATE</res:action>
         |               </res:entry>
         |               <res:entry>
         |                  <res:resourceId>
         |                     <res:path>org_${orgid}/variants</res:path>
         |                     <res:type>TABLE</res:type>
         |                     <res:subtype>DATABASE_TABLE</res:subtype>
         |                  </res:resourceId>
         |                  <res:action>ADD_OR_UPDATE</res:action>
         |               </res:entry>
         |               <res:entry>
         |                  <res:resourceId>
         |                     <res:path>org_${orgid}/variants_status</res:path>
         |                     <res:type>TABLE</res:type>
         |                     <res:subtype>DATABASE_TABLE</res:subtype>
         |                  </res:resourceId>
         |                  <res:action>ADD_OR_UPDATE</res:action>
         |               </res:entry>
         |            </res:entries>
         |         </res:plan>
         |         <res:runInBackgroundTransaction>false</res:runInBackgroundTransaction>
         |      </res:introspectResourcesTask>
         |   </soapenv:Body>
         |</soapenv:Envelope>""".stripMargin

    payload(msg, "introspectResourcesTask")
  }

  def IntrospectRssTaskRemove(orgid: String, dataFileName: String): payload = {
    val msg =
      s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://www.compositesw.com/services/system/admin/resource" xmlns:com="http://www.compositesw.com/services/system/util/common">
         |   <soapenv:Header/>
         |   <soapenv:Body>
         |      <res:introspectResourcesTask>
         |         <res:path>/shared/org_${orgid}/CSV</res:path>
         |         <res:plan>
         |            <!--Optional:-->
         |            <res:updateAllIntrospectedResources>true</res:updateAllIntrospectedResources>
         |            <!--Optional:-->
         |            <res:failFast>false</res:failFast>
         |            <!--Optional:-->
         |            <res:commitOnFailure>false</res:commitOnFailure>
         |            <!--Optional:-->
         |            <res:autoRollback>false</res:autoRollback>
         |            <!--Optional:-->
         |            <res:scanForNewResourcesToAutoAdd>true</res:scanForNewResourcesToAutoAdd>
         |            <!--Optional:-->
         |            <res:entries>
         |               <!--Zero or more repetitions:-->
         |               <res:entry>
         |                  <res:resourceId>
         |                     <res:path>${dataFileName}</res:path>
         |                     <res:type>TABLE</res:type>
         |                     <res:subtype>DELIMITED_FILE_TABLE</res:subtype>
         |                  </res:resourceId>
         |                  <res:action>REMOVE</res:action>
         |                  <!--Optional:-->
         |               </res:entry>
         |            </res:entries>
         |         </res:plan>
         |         <res:runInBackgroundTransaction>false</res:runInBackgroundTransaction>
         |      </res:introspectResourcesTask>
         |   </soapenv:Body>
         |</soapenv:Envelope>""".stripMargin

    payload(msg, "introspectResourcesTask")
  }

  def IntrospectResultRessTask(id: String): payload = {

    val msg =
      s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://www.compositesw.com/services/system/admin/resource" xmlns:com="http://www.compositesw.com/services/system/util/common">
         |   <soapenv:Header/>
         |   <soapenv:Body>
         |      <res:introspectResourcesResult>
         |         <com:taskId>${id}</com:taskId>
         |         <res:detail>SUMMARY</res:detail>
         |      </res:introspectResourcesResult>
         |   </soapenv:Body>
         |</soapenv:Envelope>""".stripMargin

    payload(msg, "introspectResourcesResult")

  }

  def CloseTransaction(): payload = {
    val msg =
      """<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ses="http://www.compositesw.com/services/system/util/session" xmlns:security="http://www.compositesw.com/services/system/util/security">
        |<soapenv:Header/>
        |   <soapenv:Body>
        |      <ses:closeTransaction>
        |         <ses:action>COMMIT</ses:action>
        |      </ses:closeTransaction>
        |   </soapenv:Body>
        |</soapenv:Envelope>""".stripMargin

    payload(msg, "closeTransaction")
  }

  def CloseSession(): payload = {
    val msg =
      """<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ses="http://www.compositesw.com/services/system/util/session" xmlns:security="http://www.compositesw.com/services/system/util/security">
        |<soapenv:Header/>
        |   <soapenv:Body>
        |      <ses:closeSession/>
        |   </soapenv:Body>
        |</soapenv:Envelope>""".stripMargin

    payload(msg, "closeSession")
  }


  def DeleteRessource(orgid: String, dataFileName: String): payload = {

    val msg =
      s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://www.compositesw.com/services/system/admin/resource">
         |   <soapenv:Header/>
         |   <soapenv:Body>
         |      <res:destroyResource>
         |         <res:path>/shared/org_${orgid}/CSV/${dataFileName}</res:path>
         |         <res:type>TABLE</res:type>
         |         <res:subtype>DELIMITED_FILE_TABLE</res:subtype>
         |         <res:force>true</res:force>
         |      </res:destroyResource>
         |   </soapenv:Body>
         |</soapenv:Envelope>""".stripMargin

    payload(msg, "destroyResource")
  }

  def DeleteDataView(orgid: String, dataSourceName: String): payload = {
    val msg = s"""["/shared/org_${orgid}/dataviews/datasets/\\"${dataSourceName}\\""]"""
    payload(msg, "")
  }

  def DeletePublishedView(orgid: String, dataSourceName: String): payload = {
    val msg =
      s"""[
                     {
                         "path": "/services/databases/org_${orgid}/datasets/\\"${dataSourceName}\\"",
                         "isTable": true
                     }
                 ]"""
    payload(msg, "")
  }

  def CreateFolder(parentPath: String, folderName: String): payload = {
    val msg =
      s"""[
                    {
                        "parentPath":"${parentPath}",
                        "name" : "${folderName}",
                        "ifNotExists": true,
                        "annotation": "Project Discover -- do not delete"
                    }
                ]"""
    payload(msg, "")
  }

  def CreateBaseVirtualDB(orgId: String): payload = {
    val msg = s"""["CREATE VIRTUAL DATABASE 'org_${orgId}' SET ANNOTATION 'Project Discover -- do not delete'"]"""
    payload(msg, "")
  }

  def CreateBaseVirtualSchemas(schemaName: String, orgId: String): payload = {
    val msg =
      s"""[
            {
              "path":"/services/databases/org_${orgId}/${schemaName}",
              "ifNotExists": true,
              "annotation": "Project Discover -- do not delete"
            }
         ]
         """
    payload(msg, "")
  }

  def CreateRessource(config: tdvJob): payload = {
    val msg =
      s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://www.compositesw.com/services/system/admin/resource" xmlns:com="http://www.compositesw.com/services/system/util/common">
         |   <soapenv:Header/>
         |   <soapenv:Body>
         |      <res:createDataSource>
         |         <res:path>/shared/org_${config.Organization}</res:path>
         |         <res:name>CSV</res:name>
         |         <res:detail>SIMPLE</res:detail>
         |         <res:dataSourceType>Amazon S3</res:dataSourceType>
         |         <res:attributes>
         |               <com:attribute>
         |	               <com:name>uri</com:name>
         |	               <com:type>STRING</com:type>
         |	               <com:value>s3a://${config.DatasetSource.FilePath.split("/")(2)}/${config.Organization}</com:value>
         |	          </com:attribute>
         |               <com:attribute>
         |	               <com:name>endPointRegion</com:name>
         |	               <com:type>STRING</com:type>
         |	               <com:value>Europe (Ireland)</com:value>
         |	          </com:attribute>
         |         </res:attributes>
         |      </res:createDataSource>
         |   </soapenv:Body>
         |</soapenv:Envelope>
         |""".stripMargin

    payload(msg, "createDataSource")
  }

  def getInstrospectionResult(taskid: String): payload = {
    val msg =
      s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://www.compositesw.com/services/system/admin/resource" xmlns:com="http://www.compositesw.com/services/system/util/common">
         |   <soapenv:Header/>
         |   <soapenv:Body>
         |      <res:introspectResourcesResult>
         |         <com:taskId>${taskid}</com:taskId>
         |         <res:detail>SIMPLE</res:detail>
         |      </res:introspectResourcesResult>
         |   </soapenv:Body>
         |</soapenv:Envelope>""".stripMargin
    payload(msg, "introspectResourcesResult")
  }

  def getIntrospectableResult(taskid: String): payload = {
    val msg =
      s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://www.compositesw.com/services/system/admin/resource" xmlns:com="http://www.compositesw.com/services/system/util/common">
         |   <soapenv:Header/>
         |   <soapenv:Body>
         |      <res:getIntrospectableResourceIdsResult>
         |         <com:taskId>${taskid}</com:taskId>
         |      </res:getIntrospectableResourceIdsResult>
         |   </soapenv:Body>
         |</soapenv:Envelope>""".stripMargin
    payload(msg, "getIntrospectableResourceIdsResult")
  }

  def createGroupPayload(domainName: String, groupName: String): payload = {
    val msg =
      s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:user="http://www.compositesw.com/services/system/admin/user">
         |  <soapenv:Header/>
         |  <soapenv:Body>
         |    <user:createGroup>
         |      <user:domainName>${domainName}</user:domainName>
         |      <user:groupName>${groupName}</user:groupName>
         |    </user:createGroup>
         |  </soapenv:Body>
         |</soapenv:Envelope>""".stripMargin
    payload(msg, "createGroup")
  }

  def createUserPayload(domainName: String, userName: String, password: String): payload = {
    val msg =
      s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:user="http://www.compositesw.com/services/system/admin/user">
         |  <soapenv:Header/>
         |  <soapenv:Body>
         |    <user:createUser>
         |      <user:domainName>${domainName}</user:domainName>
         |      <user:userName>${userName}</user:userName>
         |      <user:password>${password}</user:password>
         |    </user:createUser>
         |  </soapenv:Body>
         |</soapenv:Envelope>""".stripMargin
    payload(msg, "createUser")
  }

  def defaultSchemaViews(orgId: String, tableName: String, procName: String): payload = {
    val msg =
      s"""[
                "CREATE DATA VIEW IF NOT EXISTS /shared/org_${orgId}/dataviews/analysis/${tableName} DEFINE AS SELECT *, { DECLARE token_decl VARCHAR(255) } Expr1, { DECLARE analysisId_decl VARCHAR(255) } Expr2 FROM /shared/discover/discover_procedures/\\"com.tibco.cis.labs.proc.${procName}\\"('/shared/discover/discover_cic/org_${orgId}/${tableName}', token_decl, analysisId_decl) com_tibco_cis_labs_proc_${procName};"
                ]"""
    payload(msg, "")
  }

  def defaultPreviewSchemaViews(orgId: String, tableName: String, procName: String): payload = {
    val msg =
      s"""[
                "CREATE DATA VIEW IF NOT EXISTS /shared/org_${orgId}/dataviews/preview/${tableName} DEFINE AS SELECT *, { DECLARE token_decl VARCHAR(255) } Expr1, { DECLARE analysisId_decl VARCHAR(255) } Expr2 FROM /shared/discover/discover_procedures/\\"com.tibco.cis.labs.proc.${procName}\\"('/shared/discover/discover_cic/org_${orgId}/${tableName}', token_decl, analysisId_decl) com_tibco_cis_labs_proc_${procName};"
                ]"""
    payload(msg, "")
  }

  def defaultSchemaSpecificViews(orgId: String, tableName: String, procName: String): payload = {
    val msg =
      s"""[
                  "CREATE DATA VIEW IF NOT EXISTS /shared/org_${orgId}/dataviews/analysis/variants_status DEFINE AS SELECT *, { DECLARE token_decl VARCHAR(255) } Expr1, { DECLARE analysisId_decl VARCHAR(255) } Expr2, { DECLARE refreshToken_decl VARCHAR(255) } Expr3 FROM /shared/discover/discover_procedures/\\"com.tibco.cis.labs.proc.GetVariantsStatus\\"('/shared/discover/discover_cic/org_${orgId}/variants_status', token_decl, analysisId_decl, refreshToken_decl) com_tibco_cis_labs_proc_GetVariantsStatus;"
                  ]"""
    payload(msg, "")
  }


  def addUserToGroups(domainName: String, userName: String, groupNames: Array[String]): payload = {
    var msg =
      s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:user="http://www.compositesw.com/services/system/admin/user">
         |  <soapenv:Header/>
         |    <soapenv:Body>
         |      <user:addUserToGroups>
         |      <user:domainName>${domainName}</user:domainName>
         |      <user:userName>${userName}</user:userName>
         |      <user:groupNames>""".stripMargin

    for (groupName <- groupNames) {
      msg = msg +
        s"""   <user:entry>
           |      <user:name>${groupName}</user:name>
           |    </user:entry>""".stripMargin
    }

    msg = msg +
      s"""   </user:groupNames>
         |   </user:addUserToGroups>
         | </soapenv:Body>
         |</soapenv:Envelope>
         |""".stripMargin

    payload(msg, "addUserToGroups")
  }

  def updateResourcePrivileges(privilegeEntries: Array[PrivilegeEntry], updateRecursively: Boolean): payload = {
    var msg =
      s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://www.compositesw.com/services/system/admin/resource">
         |   <soapenv:Header/>
         |   <soapenv:Body>
         |      <res:updateResourcePrivileges>
         |         <res:updateRecursively>${updateRecursively}</res:updateRecursively>
         |         <!--Optional:-->
         |         <res:updateDependenciesRecursively>false</res:updateDependenciesRecursively>
         |         <!--Optional:-->
         |         <res:updateDependentsRecursively>false</res:updateDependentsRecursively>
         |         <res:privilegeEntries>
         |            <!--Zero or more repetitions:-->""".stripMargin

    for (privilegeEntry <- privilegeEntries) {
      msg +=
        s"""<res:privilegeEntry>
           |               <res:path>${privilegeEntry.Resource.Path}</res:path>
           |               <res:type>${privilegeEntry.Resource.Type}</res:type>
           |               <res:privileges>
           |                  <!--Zero or more repetitions:-->""".stripMargin

      for (privilege <- privilegeEntry.Privileges) {
        msg +=
          s"""        <res:privilege>
             |                   <res:domain>${privilege.Domain}</res:domain>
             |                   <res:name>${privilege.Name}</res:name>
             |                   <res:nameType>${privilege.Type}</res:nameType>
             |                   <res:privs>${privilege.Privileges}</res:privs>
             |                </res:privilege>""".stripMargin
      }

      msg +=
        s"""       </res:privileges>
           |</res:privilegeEntry>""".stripMargin
    }


    msg +=
      s"""
         |         </res:privilegeEntries>
         |         <!--Optional:-->
         |         <res:mode>OVERWRITE_APPEND</res:mode>
         |      </res:updateResourcePrivileges>
         |   </soapenv:Body>
         |</soapenv:Envelope>""".stripMargin

    payload(msg, "updateResourcePrivileges")
  }

  def createViewPayload(orgId: String, dataSourcePath: String, dataSourceName: String): String = {
    val msg =
      s"""[
               {
               "parentPath": "/shared/org_${orgId}/dataviews/datasets",
               "name": "${dataSourceName}",
               "sql": "SELECT * from /shared/org_${orgId}/CSV/\\"${dataSourcePath}\\"",
               "annotation": "dataview for ${dataSourceName}",
               "ifNotExists": "true"
               }
               ]"""
    msg
  }

  def publishViewPayload(orgId: String, dataSourceName: String): String = {
    val msg = s"""["CREATE VIRTUAL TABLE IF NOT EXISTS /services/databases/org_${orgId}/datasets/\\"${dataSourceName}\\" SET TARGET /shared/org_${orgId}/dataviews/datasets/\\"${dataSourceName}\\" SET ANNOTATION 'Type:CSV'"]"""
    msg
  }

  def publishDBViewPayload(orgId: String, dataSourceName: String): String = {
    val msg = s"""["CREATE VIRTUAL TABLE IF NOT EXISTS /services/databases/org_${orgId}/\\"${dataSourceName}\\" SET TARGET /shared/org_${orgId}/dataviews/analysis/\\"${dataSourceName}\\" SET ANNOTATION 'Discover -- DO NOT DELETE'"]"""
    msg
  }

  def publishDBPreViewPayload(orgId: String, dataSourceName: String): String = {
    val msg = s"""["CREATE VIRTUAL TABLE IF NOT EXISTS /services/databases/org_${orgId}/preview/\\"${dataSourceName}\\" SET TARGET /shared/org_${orgId}/dataviews/preview/\\"${dataSourceName}\\" SET ANNOTATION 'Discover -- DO NOT DELETE'"]"""
    msg
  }

  def queryViewPayload(orgId: String, dataSourceName: String): String = {
    val msg =
      s"""{
         |    "query":"SELECT {OPTION MAX_ROWS_LIMIT=100} * FROM /services/databases/org_${orgId}/datasets/\\"${dataSourceName}\\"",
         |    "standardSQL":false
         |}""".stripMargin
    msg
  }


  def queryColsPayload(orgId: String, dataSourceName: String): String = {
    val msg =
      s"""{
         |    "query":"SELECT COLUMN_NAME, DATA_TYPE, ORDINAL_POSITION, JDBC_DATA_TYPE FROM model.ALL_COLUMNS props WHERE table_id = (SELECT table_id FROM model.ALL_TABLES where table_name = '${dataSourceName}' and parent_path='/services/databases/org_${orgId}/datasets')",
         |    "standardSQL":true
         |}
         |""".stripMargin
    msg
  }

  def getUnmanagedPublishedView(orgId: String): String = {
    val msg =
      s"""{
         |    "query":"SELECT TABLE_NAME, ANNOTATION, concat (parent_path, CONCAT ('/', TABLE_NAME) ), TABLE_CREATION_TIMESTAMP, TABLE_MODIFICATION_TIMESTAMP FROM model.ALL_TABLES where parent_path='/services/databases/org_${orgId}/unmanaged'",
         |    "standardSQL":true
         |}
         |""".stripMargin
    msg
  }

  def copyLink(orgId: String, fromDsName: String, toDSName: String): payload = {
    val msg = s"""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://www.compositesw.com/services/system/admin/resource">
                 |   <soapenv:Header/>
                 |   <soapenv:Body>
                 |      <res:copyResource>
                 |         <res:path>/services/databases/org_${orgId}/unmanaged/${fromDsName}</res:path>
                 |         <res:type>LINK</res:type>
                 |         <res:targetContainerPath>/services/databases/org_${orgId}/datasets/</res:targetContainerPath>
                 |         <res:newName>${toDSName}</res:newName>
                 |         <res:copyMode>OVERWRITE_REPLACE_IF_EXISTS</res:copyMode>
                 |      </res:copyResource>
                 |   </soapenv:Body>
                 |</soapenv:Envelope>""".stripMargin
    payload(msg, "copyResource")
  }

}
