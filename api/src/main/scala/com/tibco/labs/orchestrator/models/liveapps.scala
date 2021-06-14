package com.tibco.labs.orchestrator.models

case class Groups(
                   id: String,
                   `type`: String
                 )

case class Sandboxes(
                      id: String,
                      `type`: String,
                      groups: List[Groups]
                    )

case class LiveAppsClaims(
                           subscriptionId: String,
                           firstName: String,
                           lastName: String,
                           username: String,
                           email: String,
                           globalSubcriptionId: String,
                           region: String,
                           guid: String,
                           sandboxes: List[Sandboxes],
                           id: String
                         )

case class GroupsDetails(
                          name: String,
                          description: Option[String],
                          `type`: String,
                          id: String
                        )

case class LoginCredentials(
                             credentials: String
                           )