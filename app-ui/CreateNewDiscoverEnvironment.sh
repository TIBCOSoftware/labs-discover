# Note the service Account will be used to install a new environment
# The service account needs to be added to this environment
# He needs; LiveApps & Spotfire
# LiveApps Role: Team administrator, Administrator,Application Developer
# Spotfire Role: Analyst

MASTER_ACCOUNT="Discover MVP DEV"

# Download tcli (from NPM labs)
# TODO: Disabled npm install -g @tibco-tcstk/cloud-cli --registry http://npm.labs.tibcocloud.com/

# Create new cloud properties file
PROPERTY_FILE="./Temp/create-discover-environment-tibco-cloud.properties"
tcli --createCP -p "$PROPERTY_FILE"

# Create token for the right tenants (The provided token will be used and should have all the rights)
# tcli add-or-update-property -a "DEFAULT:CloudLogin.OAUTH_Generate_For_Tenants:none:TSC,BPM,SPOTFIRE" -p "$PROPERTY_FILE"
# Rotate this token (to get the proper rights)
# tcli rotate-oauth-token -p "$PROPERTY_FILE"

# Show if the token has all the rights
tcli show-oauth-tokens -p "$PROPERTY_FILE"

# Show if the login details were correct
tcli show-cloud -p "$PROPERTY_FILE"

# Confirmation step; show login details are correct and are you sure you want to install to environment.
read -p "Do you want to install Project Discover to the above environment (y/n)? " -n 1 -r
echo # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]; then

  # Generate Key on the Master Account
  MASTER_PROP_FILE="master-account.properties"
  tcli add-or-update-property -a "DEFAULT:CloudLogin.OAUTH_Generate_Token_Name:none:DiscoverInstallToken_1" -p "$MASTER_PROP_FILE"
  tcli add-or-update-property -a "DEFAULT:CloudLogin.OAUTH_Generate_For_Tenants:none:TSC,BPM,SPOTFIRE" -p "$MASTER_PROP_FILE"
  tcli generate-oauth-token -a "YES" -p "$MASTER_PROP_FILE"
  tcli add-or-update-property -a "$PROPERTY_FILE:Master_Account_Token:none:@{CloudLogin.OAUTH_Token}" -p "$MASTER_PROP_FILE"

  # STEP 1: Org folders and Assets
  echo 'STEP 1: Create Org folder and Upload Assets...'
  tcli create-org-folder -a "discoverapp_assets" -p "$PROPERTY_FILE"
  # tcli create-org-folder -a "discoverapp_datasources" -p "$PROPERTY_FILE"
  tcli show-org-folders -a "NONE" -p "$PROPERTY_FILE"
  # tcli upload-file-to-org-folder -a "discoverapp_datasources:test/CallcenterExample.csv:SAME" -p "$PROPERTY_FILE"
  tcli upload-file-to-org-folder -a "discoverapp_assets:src/assets/init/images/ProcessMiningsmall.jpg:SAME" -p "$PROPERTY_FILE"
  tcli upload-file-to-org-folder -a "discoverapp_assets:src/assets/init/images/ic-documentation.svg:SAME" -p "$PROPERTY_FILE"
  tcli upload-file-to-org-folder -a "discoverapp_assets:src/assets/init/images/ic-community.svg:ic-community.svg:SAME" -p "$PROPERTY_FILE"
  tcli upload-file-to-org-folder -a "discoverapp_assets:src/assets/init/images/ic-graph.svg:ic-graph.svg:SAME" -p "$PROPERTY_FILE"
  # tcli show-org-folders -a "discoverapp_datasources" -p "$PROPERTY_FILE"
  tcli show-org-folders -a "discoverapp_assets" -p "$PROPERTY_FILE"

  # STEP 2: Create LiveApps Groups
  echo 'STEP 2: Create LiveApps Groups...'
  tcli create-live-apps-group -a "Discover Administrators:Discover Administrators" -p "$PROPERTY_FILE"
  tcli create-live-apps-group -a "Discover Analysts:Group for Analysts; provides access to the dashboards" -p "$PROPERTY_FILE"
  tcli create-live-apps-group -a "Discover Case Resolvers:Discover Case Resolvers" -p "$PROPERTY_FILE"
  tcli create-live-apps-group -a "Discover Users:Discover Process Mining Users" -p "$PROPERTY_FILE"

  # STEP 3: Copy the LiveApps Applications
  echo 'STEP 3: Copying the LiveApps Applications...'
  tcli add-or-update-property -a "DEFAULT:TARGET_ORGANIZATION:none:~{ORGANIZATION}" -p "$PROPERTY_FILE"
  # tcli change-cloud-organization -a "$MASTER_ACCOUNT" -p "$PROPERTY_FILE"
  tcli copy-live-apps-between-organizations -a "Discover compliance:NO" -p "$PROPERTY_FILE"
  tcli copy-live-apps-between-organizations -a "Discover improvement:NO" -p "$PROPERTY_FILE"
  tcli copy-live-apps-between-organizations -a "Discover Review:NO" -p "$PROPERTY_FILE"
  # tcli change-cloud-organization  -a "@{TARGET_ORGANIZATION}" -p "$PROPERTY_FILE"

  # STEP 4: Configure Spotfire
  echo 'STEP 4: Configuring Spotfire...'
  # Create spotfire folders in the USER Account
  tcli create-spotfire-library-folder -a "/Teams/~{ORGANIZATION}:Discover:Folder for discover assets" -p "$PROPERTY_FILE"
  tcli create-spotfire-library-folder -a "/Teams/~{ORGANIZATION}/Discover:main:main process mining analysis folder" -p "$PROPERTY_FILE"
  tcli create-spotfire-library-folder -a "/Teams/~{ORGANIZATION}/Discover:preview:folder for the preview analysis" -p "$PROPERTY_FILE"
  tcli create-spotfire-library-folder -a "/Teams/~{ORGANIZATION}/Discover:user_defined:Folder for user defined discover analysis" -p "$PROPERTY_FILE"
  # Set the library base (to none to be safe...)
  tcli add-or-update-property -a "DEFAULT:Spotfire_Library_Base:none:" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Spotfire_Library_Base:none:" -p "$MASTER_PROP_FILE"
  # 1. Under the MASTER Account, create a share folder
  tcli create-spotfire-library-folder -a "/Users/Service Account Discover:ShareDXP:Temporary folder for sharing" -p "$MASTER_PROP_FILE"
  # 2. Under the MASTER account, copy an item to this share folder
  tcli copy-spotfire-library-item -a "Spotfire Reports:/Teams/~{ORGANIZATION}/Discover/main/project_discover_latest:/Users/Service Account Discover/ShareDXP" -p "$MASTER_PROP_FILE"
  tcli copy-spotfire-library-item -a "Spotfire Reports:/Teams/~{ORGANIZATION}/Discover/preview/project_discover_preview_latest:/Users/Service Account Discover/ShareDXP" -p "$MASTER_PROP_FILE"
  # 3. Store the email of the target account in the master-account.properties file
  tcli add-or-update-property -a "$MASTER_PROP_FILE:Target_Account_Email:none:@{CloudLogin.email}" -p "$PROPERTY_FILE"
  # 4. Under the MASTER account, share the folder with the user account
  tcli share-spotfire-library-folder -a "/Users/Service Account Discover/ShareDXP:@{Target_Account_Email}" -p "$MASTER_PROP_FILE"
  # 5. Under the USER account, copy the shared item to the new folder.
  tcli copy-spotfire-library-item -a "Spotfire Reports:SHARED_WITH_ME/ShareDXP/project_discover_latest:/Teams/~{ORGANIZATION}/Discover/main" -p "$PROPERTY_FILE"
  tcli copy-spotfire-library-item -a "Spotfire Reports:SHARED_WITH_ME/ShareDXP/project_discover_preview_latest:/Teams/~{ORGANIZATION}/Discover/preview" -p "$PROPERTY_FILE"
  # 6. Under the MASTER account delete the shared folder
  tcli delete-spotfire-library-item -a "Library Folders:/Users/Service Account Discover/ShareDXP:YES" -p "$MASTER_PROP_FILE"

  #tcli copy-spotfire-library-item  -a "Spotfire Reports:/Teams/$MASTER_ACCOUNT/Discover/main/project_discover_latest:/Teams/~{ORGANIZATION}/Discover/main" -p "$PROPERTY_FILE"
  #tcli copy-spotfire-library-item  -a "Spotfire Reports:/Teams/$MASTER_ACCOUNT/Discover/preview/project_discover_preview_latest:/Teams/~{ORGANIZATION}/Discover/preview" -p "$PROPERTY_FILE"


  # STEP 5: Configure Backend
  echo 'STEP 5: Configuring The backend database'
  touch ./Temp/orgId.properties
  tcli add-or-update-property -a "default:Org_ID:none:special:Organization_ID"  -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "./Temp/orgId.properties:Org_ID:none:\"@{Org_ID}\""  -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "default:Org_Name:none:special:organization_name"  -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "./Temp/orgId.properties:Org_Name:none:\"@{Org_Name}\""  -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "./Temp/orgId.properties:Backend_Pass:none:\"@{Backend_Pass}\"" -p "$MASTER_PROP_FILE"

  while read line; do
    echo $line
    eval $line
    export Org_ID
  done <./Temp/orgId.properties

  # Create database backend
  curl -X POST -u "admin:$Backend_Pass" -H "Content-Type: application/json" \
    -d "{\"Organization\": \"$Org_ID\"}" \
    https://discover.labs.tibcocloud.com/internal/database >>./forDataPlan/forDataPlan_db_$Org_Name.json

  # STEP 6: Configure Backend
  echo 'STEP 6: Configuring backend TDV'
  # Config TDV Folders
  # Creating TDV groups
  # Create TDV users
  # Assets to copy (TDV)
  # TDV: Create views
  # TDV: Create key
  # TDV: Create Data connection
  curl -X POST -u "admin:$Backend_Pass" -H "Content-Type: application/json" \
    -d "{\"Organization\": \"$Org_ID\"}" \
    https://discover.labs.tibcocloud.com/internal/tdv >>./forDataPlan/forDataPlan_tdv_$Org_Name.json

  # TODO: The DXP needs to be manually replaced (Data Connection)

  # STEP 7: Build and Deploy the UI
  echo 'STEP 7: Build and Deploy the UI'
  # tcli deploy -p "$PROPERTY_FILE"
  tcli build-deploy -p "$PROPERTY_FILE"

  # STEP 8: Create and Configure Shared State
  echo 'STEP 8: Create and Configure Shared State'
  tcli add-or-update-property -a "DEFAULT:Shared_State_Type:none:SHARED" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Shared_State_Filter:none:discoverapp" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Shared_State_Folder:none:./Shared_State_Temp/" -p "$PROPERTY_FILE"
  tcli create-shared-state-entry -a "discoverapp.discover.config.client.context" -p "$PROPERTY_FILE"
  tcli export-shared-state -a "YES" -p "$PROPERTY_FILE"
  # TODO: Set the right user-rights to the shared state
  # tcli add-or-update-property -a "DEFAULT:Replace_PATTERN:none:./Shared_State_Temp/discoverapp.discover.config.client.context.SHARED.json" -p "$PROPERTY_FILE"
  #tcli add-or-update-property -a "DEFAULT:Replace_FROM:none:\"roles\": []," -p "$PROPERTY_FILE"
  #tcli add-or-update-property -a "DEFAULT:Replace_TO:none:\"roles\":[{\"entityId\": \"<EntityID>\",\"role\": \"OWNER\",\"entityName\": \"Discover Users\",\"entityType\": \"SubscriptionDefined\"}]," -p "$PROPERTY_FILE"
  #tcli replace-string-in-file -p "$PROPERTY_FILE"

  cp ./discoverapp_template.json ./Shared_State_Temp/CONTENT/discoverapp.discover.config.client.context.SHARED.CONTENT.json
  tcli add-or-update-property -a "DEFAULT:Replace_PATTERN:none:./Shared_State_Temp/CONTENT/discoverapp.discover.config.client.context.SHARED.CONTENT.json" -p "$PROPERTY_FILE"

  # Replace AppId and Creator ID of Compliance
  tcli add-or-update-property -a "DEFAULT:Compliance_App_Id:none:SPECIAL:LiveApps_AppID:Discovercompliance" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Replace_FROM:none:%%Compliance_App_Id%%" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Replace_TO:none:@{Compliance_App_Id}" -p "$PROPERTY_FILE"
  tcli replace-string-in-file -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Compliance_Creator_Id:none:SPECIAL:LiveApps_ActionID:Discovercompliance:Raise compliance issue" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Replace_FROM:none:%%Compliance_Creator_Id%%" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Replace_TO:none:@{Compliance_Creator_Id}" -p "$PROPERTY_FILE"
  tcli replace-string-in-file -p "$PROPERTY_FILE"

  # Replace AppId and Creator ID of Improvement
  tcli add-or-update-property -a "DEFAULT:Improvement_App_Id:none:SPECIAL:LiveApps_AppID:Discoverimprovement" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Replace_FROM:none:%%Improvement_App_Id%%" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Replace_TO:none:@{Improvement_App_Id}" -p "$PROPERTY_FILE"
  tcli replace-string-in-file -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Improvement_Creator_Id:none:SPECIAL:LiveApps_ActionID:Discoverimprovement:Create Improvement" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Replace_FROM:none:%%Improvement_Creator_Id%%" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Replace_TO:none:@{Improvement_Creator_Id}" -p "$PROPERTY_FILE"
  tcli replace-string-in-file -p "$PROPERTY_FILE"

  # Replace AppId and Creator ID of Review
  tcli add-or-update-property -a "DEFAULT:Review_App_Id:none:SPECIAL:LiveApps_AppID:DiscoverReview" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Replace_FROM:none:%%Review_App_Id%%" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Replace_TO:none:@{Review_App_Id}" -p "$PROPERTY_FILE"
  tcli replace-string-in-file -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Review_Creator_Id:none:SPECIAL:LiveApps_ActionID:DiscoverReview:Create Review" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Replace_FROM:none:%%Review_Creator_Id%%" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Replace_TO:none:@{Review_Creator_Id}" -p "$PROPERTY_FILE"
  tcli replace-string-in-file -p "$PROPERTY_FILE"

  # Replace the FolderId for Spotfire
  tcli add-or-update-property -a "DEFAULT:Discover_Spotfire_Path::SPECIAL:Spotfire_FolderPath:/Teams/~{ORGANIZATION}/Discover" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Replace_FROM:none:%%Discover_Spotfire_Path%%" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Replace_TO:none:@{Discover_Spotfire_Path}" -p "$PROPERTY_FILE"
  tcli replace-string-in-file -p "$PROPERTY_FILE"

  # Replace the Id of the shared state entry
  tcli add-or-update-property -a "DEFAULT:SS_ID:none:SPECIAL:Shared_StateID:discoverapp.discover.config.client.context.SHARED" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Replace_FROM:none:%%SS_ID%%" -p "$PROPERTY_FILE"
  tcli add-or-update-property -a "DEFAULT:Replace_TO:none:@{SS_ID}" -p "$PROPERTY_FILE"
  tcli replace-string-in-file -p "$PROPERTY_FILE"

  tcli import-shared-state -a "discoverapp.discover.config.client.context.SHARED.json" -p "$PROPERTY_FILE"

  # Revoke the generated token for the master account
  tcli show-oauth-tokens -p "$MASTER_PROP_FILE"
  tcli revoke-oauth-token -a "DiscoverInstallToken_1" -p "$MASTER_PROP_FILE"

  # VALIDATIONS

  # Validate the Org Folders
  tcli validate -a "Org_Folder_exist:discoverapp_assets" -p "$PROPERTY_FILE"

  # Validate the Org Folder Content
  tcli validate -a "Org_Folder_And_File_exist:discoverapp_assets:ProcessMiningsmall.jpg+ic-documentation.svg+ic-community.svg+ic-graph.svg" -p "$PROPERTY_FILE"

  # Validate the Live Apps Groups Exist
  tcli validate -a "Live_Apps_group_exist:Discover Administrators" -p "$PROPERTY_FILE"
  tcli validate -a "Live_Apps_group_exist:Discover Analysts" -p "$PROPERTY_FILE"
  tcli validate -a "Live_Apps_group_exist:Discover Case Resolvers" -p "$PROPERTY_FILE"
  tcli validate -a "Live_Apps_group_exist:Discover Users" -p "$PROPERTY_FILE"

  # Validate that the LiveApps Applications exists
  tcli validate -a "LiveApps_app_exist:Discovercompliance" -p "$PROPERTY_FILE"
  tcli validate -a "LiveApps_app_exist:Discoverimprovement" -p "$PROPERTY_FILE"
  tcli validate -a "LiveApps_app_exist:DiscoverReview" -p "$PROPERTY_FILE"

  # Validate that the UI App exists
  tcli validate -a "Cloud_Starter_exist:discover-app" -p "$PROPERTY_FILE"

  # TODO: Validate the shared state entry

  # Validate the spotfire folders
  tcli validate -a "Spotfire_Library_Item_exists:Library Folders:/Teams/~{ORGANIZATION}/Discover" -p "$PROPERTY_FILE"
  tcli validate -a "Spotfire_Library_Item_exists:Library Folders:/Teams/~{ORGANIZATION}/Discover/main" -p "$PROPERTY_FILE"
  tcli validate -a "Spotfire_Library_Item_exists:Library Folders:/Teams/~{ORGANIZATION}/Discover/preview" -p "$PROPERTY_FILE"
  tcli validate -a "Spotfire_Library_Item_exists:Library Folders:/Teams/~{ORGANIZATION}/Discover/user_defined" -p "$PROPERTY_FILE"

  # Validate the spotfire library items
  tcli validate -a "Spotfire_Library_Item_exists:Spotfire Reports:/Teams/~{ORGANIZATION}/Discover/main/project_discover_latest" -p "$PROPERTY_FILE"
  tcli validate -a "Spotfire_Library_Item_exists:Spotfire Reports:/Teams/~{ORGANIZATION}/Discover/preview/project_discover_preview_latest" -p "$PROPERTY_FILE"

  # Add the provisioning user to the LA Groups
  tcli add-user-to-group -a "Discover Users:@{CloudLogin.email}" -p "$PROPERTY_FILE"
  tcli add-user-to-group -a "Discover Analysts:@{CloudLogin.email}" -p "$PROPERTY_FILE"
  tcli add-user-to-group -a "Discover Case Resolvers:@{CloudLogin.email}" -p "$PROPERTY_FILE"
  tcli add-user-to-group -a "Discover Administrators:@{CloudLogin.email}" -p "$PROPERTY_FILE"

  echo "Installed Discover !!!"
  echo "To add users to the created LiveApps groups run: tcli add-user-to-group -p "$PROPERTY_FILE""
fi
