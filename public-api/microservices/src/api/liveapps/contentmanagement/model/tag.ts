/**
 * Web Resource Provisioner Service
 * The TIBCO Cloud(TM) Live Apps Web Resource Provisioner Service manages Applications and related resources in the TIBCO(R) Live Apps subscription.   Applications, in the context of the Web Resource Provisioner Service, are user interface applications that are served to a browser client to provide end-user functionality. Note that:  * Applications must consist entirely of static resources (such as HTML, CSS, Javascript, XML and JSON) which are served to the browser that hosts the Application. Applications must not include servlets or client-side executables, such as applets or .NET libraries.  * Applications are _not_ the applications that Users create in Live Apps Designer, manage in Live Apps Application Manager and use in Live Apps Case Manager. Those applications cannot be accessed or managed using the Web Resource Provisioner Service.  There are four different types of Application:  * __Applications__: These are customer-developed applications that provide custom functionality and solutions to specific business requirements.     * __System Applications__: These are TIBCO-developed applications that provide standard functionality available as part of a Live Apps subscription. For example, Live Apps Designer, Live Apps Application Manager and Live Apps Case Manager are System Applications.        * __Case Folders__: These are used to store Artifacts - such as document and image files - which are part of a Case.  * __Org Folders__: These are used to store Artifacts - such as document and images files - which can be accessed from within the subscription (for example, from another customer-developed Application).  Other resources managed by the Web Resource Provisioner Service are:  * __ApplicationVersions__: The ApplicationVersion (also referred to as simply Version) is a snapshot of the state of the Application and the Artifacts that it contains. Whenever a change is made to an Application, a new version is created and the Application\'s latestVersion property is incremented. The Application\'s publishedVersion property defines the version that is currently available to all Users in the subscription.  * __Artifacts__: Artifacts are the files and folders that make up an Application or System Application. Case Folders only include files.   __Application Lifecycle and Management__  Web Resource Provisioner Service methods allow you to manage Applications in your subscription. You can:  * Create a new Application, in several ways:   * Create an empty Application.   * Upload an archive file of an externally created application.   * Copy an existing Application.   * Copy an existing System Application that has been defined as a template.   * Export an Application to an external archive, for subsequent upload.  * Modify and test Application content:   * Upload new or updated Artifacts, either individually or from an archive.   * Rename or delete existing Artifacts.   * Revert an Application to a different version.      You can access and test the latestVersion of an Application by prefixing the Application\'s name in the URI with two underscore characters, followed by TEST, followed by two underscore characters, followed by a forward slash character.     * Publish an Application so that it is available to Users:    * Publish the Application when you create it.    * Publish the latestversion of the Application at any time.    The publishedVersion of an Application is available to every User in a subscription via its URI.     * Delete an Application, or a specific ApplicationVersion, that is no longer required.  __Application Descriptor File__  Applications and System Applications can include a descriptor file, containing name/value pairs that can be used to provide any desired custom information about the Application. For example: * to associate an image with the Application. * to define the Application\'s home page. * to define the location of a configuration file for the Application.  The descriptor file name must be {appName}.app.desc.json. The file must reside in the Application\'s top-level folder. The contents of the descriptor file can be accessed using the Application\'s \'descriptor\' property.  Case Folders do not have descriptor files.   __Access Permissions__  Access to the methods listed below is restricted. The call must be made using the credentials of a User who is a member of either the ADMINISTRATOR or APPLICATION_DEVELOPER subscription Group. A call made using any other credentials will fail with a \"WR_AUTHERROR\" error:  * The GET /applications/{appName}/export method * All POST, PUT, PATCH and DELETE methods, except for the following methods - access to these is not restricted:    * POST /caseFolders/{folderName}/artifacts/{artifactName}/upload   * DELETE /caseFolders/{folderName}/artifacts/{artifactName}   * POST /orgFolders/{folderName}/artifacts/{artifactName}/upload   * DELETE /orgFolders/{folderName}/artifacts/{artifactName}   __Case Folder Management__  A Case Folder is created automatically when a Case is created: * A Case Folder\'s name is the Case reference of the Case. * A Case Folder only has a single version. This never changes. * Multiple Artifacts, and multiple versions of an Artifact, can be stored in a Case Folder.    Web Resource Provisioner Service methods allow you to manage the content of a Case Folder, by: * uploading new Artifacts or new versions of existing Artifacts. * deleting the latest version of an Artifact.   __Org Folder Management__  Web Resource Provisioner Service methods allow you to manage Org Folders and their contents in your subscription. You can: * create a new Org folder. * upload new Artifacts or new versions of existing Artifacts. * delete the latest version of an Artifact. * delete an Org Folder that is no longer required.  Note that: * An Org Folder\'s name must be unique in the subscription. * An Org Folder only has a single version. This never changes. * Multiple Artifacts, and multiple versions of an Artifact, can be stored in an Org Folder.   __Subscription Limits on Applications__  The following Live Apps subscription Parameters enforce limits on the maximum number and size of Applications allowed in a subscription:  * __webAppStorage__: The maximum total size (in bytes) of all Applications in the subscription. The default value is 0 (meaning unlimited). An Application\'s size is calculated as the total size of each unique Artifact in all Versions of the Application. Multiple uploads of the same Artifact do not increase the size. * __webAppLimit__: The maximum number of Applications permitted in the subscription. The default value is  10 * __webAppArchiveSize__: The maximum size (in bytes) of a single, exploded archive. The default value is 300000000. If you want to use an Application that exceeds the webAppArchiveSize, you must split it into different archives and upload each one separately.  NOTE: These limits apply only to customer-developed Applications. System Applications and Case Folders are not counted.  You can use the GET /parameters method from the Authorization Service to find the values of these Parameters defined for your subscription.  __Subscription Limit on Artifacts in Case Folders and Org Folders__  The following Live Apps subscription Parameter enforces a limit on the maximum total size of Artifacts allowed in a subscription:  * __documentStorage__: The maximum total size (in bytes) of all Artifacts in Case Folders and Org Folders. The total size is calculated as the total size of all the versions of each Artifact stored.   __Application Resource Endpoints__  The publishedVersion of a customer-developed Application, or a component file within that Application, can be served to a web browser using the endpoint: .../webresource/apps/{appName}/{artifactName}. For example, my-test-system/webresource/apps/myUserApp/index.html.  Note that:       * To serve the latestVersion of an Application, prefix the Application\'s name in the URI with two underscore characters, followed by TEST, followed by two underscore characters, followed by a forward slash character.  * You cannot serve System Applications or their component files using this endpoint format.   __Case Folder and Org Folder Resource Endpoints__  A file Artifact in a Case Folder or an Org Folder can be served to a web browser via the following endpoints:  * For a Case Folder, use: .../webresource/folders/{folderName}/{sandbox}/{artifactName}?$version={versionNumber}.    * For an Org Folder, use: .../webresource/orgFolders/{folderName}/{artifactName}?$version={versionNumber}.    If $version is omitted the latest version is served.     __Default and Maximum Values for the $top Parameter__  If $top is not specified a default of 20 is used.   The maximum allowed size for $top is 200. 
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: liveapps@tibco.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { RequestFile } from './models';

/**
* The definition of a Tag, which can  be used to categorize different types of customer-developed Application or System Application.
*/
export class Tag {
    /**
    * The internal id of the Tag (used by the Web Resource Provisioner Service).
    */
    'id'?: string;
    /**
    * The name (and unique identifier) of the Tag.
    */
    'name'?: string;
    /**
    * The id of the subscription to which the Tag belongs.
    */
    'ownerSub'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "id",
            "baseName": "id",
            "type": "string"
        },
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "ownerSub",
            "baseName": "ownerSub",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return Tag.attributeTypeMap;
    }
}

