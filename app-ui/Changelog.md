# Changelog

Changes
- Make Cancel edit work on menu title
- Make edit popup look nice
- Add Icons in (not yet editing)
- Move Reset to bottom (and make work)
- Create Add Button (and make work)
- Add the delete button (and make work)
- Deep copy for reset
- On open reset the menu item
- Look at edit before add
- Add and edit popups, close and open each other

Changes:
- Make Cancel edit work on menu title
- Make edit popup look nice
- Add Icons in (not yet editing)
- Move Reset to bottom (and make work)
- Create Add Button (and make work)
- Add the delete button (and make work)

Changes
-  Make Icon work custom template
-  Scroll-bar on template editing
-  Add id into the route
-  Create id-generator
-  Get templates again from SS for select template screen
-  Make copy template buttons work
-  Copy the DXP
-  Fix bug Cannot read property 'id' of undefined
-  Fix editing on the card
-  Changing copy from copies from the whole Template
-  Fix select Template
-  Get the Tabs from SF

Changes:
- Connect the menu
- Fix redirect on Analytics
- Add edit
- Connect the Menu Options
- Get DXP Preview
- Added update to template service (using routing like this: /discover/edit-analysis/PAM-000001)

Changes (11-3-2021):
- Fix up the confirmation screen
- Set scrolling level for templates on right level
- Make sure Spotfire DXP Does not already exists
- Check if a template name does not already exist
- Fix refresh in templates
- Do not show next on last page
- Force a reload of templates after saving
- Don't show disabled menu items
- Don't show child menu item
- Cascade disabling
- Use disable in Analytics page
- Fix changing from on SF Report to another.
- Global copy menu config function, and strip disabled items
- Change to edit - term on top of page
- In edit mode don't say template exists on own name
- Scrolling for menu item / page

Changes (12-3-2021):
- Fixed icons in settings
- Move item does not reflect in spotfire
- Vertical cards should not be editable/deletable
- Edit directly editable
- Z-index of popup
- Implement an Icon Grid
- Remove icon code from model and data
- Connect clicking the menu items to SF
- Fixed BUG: Add menu item does not work
- Fixed BUG: Only change the label of a menu item when it is not set yet.
- Implement the confirmation page
- Implement the flow (finish button)

Changes (16-3-2021):
- Create & Save, should go back to template overview
- Save DXP, not working
- Save, button not showing
- Implement the advanced options
- Link to the spotfire report
- Use the right disabled icon
Fixed BUG: On Preview: The table named 'uncompliantVariants' does not exist in the data table collection
- Remove Id from Template (prep for API)
On Switch Template page:
- Label Selected should not show select
- Pen should stay and show template
- Implement the delete button

Changes (29-3-2021):
-  Edit does not work
-  In edit mode don't look at yourself
-  Delete Menu items does not update the preview
-  Changing template name, does not update the template; Made Name readonly on editing.
-  After create templates need to refresh automatically (maybe a small delay...)
-  Reload after edit, so that the change reflects in the Analytics page
-  Edit Menu item up
-  Edit Menu item is behind bottom line
-  Validation failed should not bring the screen back
-  Create button should only enable after SF validates
-  Move healthcare DXP To right environment; investigate why healthcare copy does not work
-  No page option for menu item
-  Look at bar; LiveApps when small
-  Look at bar; Add Region, Organization and Capabilities
-  Show Date correctly in Process Analysis
-  Show Correct Validation for Template Name already exits
-  Do not Reload SF Report if not Changed.
-  Add the Analytics Tab
-  Styling on the filters (UX Advice)
-  Cut off the DXP folder
-  Cut off the DXP name from folder
-  Add DXP Location
-  Dropdown list to choose existing DXP's from
-  Validate (warning, if dxp does not exists)
-  Advanced window; dropdown on available reports
-  Look at copy in Dev
   Rejected: When using create, select the first template in the list
-  Do not delete if template is used
-  Bug do change Spotfire Report when Process Analytic changes
-  Don't have a link to the DXP on Create Template
-  Add icon to open the DXP
-  Make the link/location of the DXP show the new DXP Location
-  Padding on Template Description field
-  Look at notes coming faster
-  Add icon selection on home page
-  Move Additional options to right
-  When in the US, remove the EU part (on clicking the Spotfire report)
-  BUG; DXP Always invalidates (Confirmation Screen)
-  Hide settings menu item.
-  Fixed news banner messages disappearing quickly

Changes (8-4-2021):

-  Highlight selected icon for template
-  JSON Escape the characters (on Investigation in AnalyticsDashboard)
-  Add analysisID and OauthToken at the template through config
-  Get SFLink Dynamically
-  Create and Use a default Menu Item (with a V-sign)
-  Have option for a default page
-  Fixed bug; ExpressionChangedAfterItHasBeenCheckedError: 'There are no cases selected...'
-  Changes in marking are directly shown in the popup
-  Show default page in summary page
-  Show filter panel
-  Could not delete file, maybe file does not exist ?... (undefined) (file size grows)
-  Fixed blinking effect when loading an analysis. The loading of the DXP goes directly to the default page.
-  Move SF Report one level up
-  Generate a dropdown for Variant and Case Investigations
-  When too many menu items reset all is half way.

Changes (21-4-2021):
 - Fix scrolling on welcome screen
 - Fix bug on screen going white on changing templates
 - Added collapsing to the Preview of SF in Templates
 - Added collapsing to the Data Prep
 - Added collapsing to the Analytics Page
 - Added collapsing to the Investigations Page
 - Added collapsing to the Admin Page
 - Easy Test setup for menu
 - Add grey area above menu, add icon and text
 - Make grey area switch
 - Get mapping to the grey, and add into switch
 - Remove Show Mapping
 - Listen to UXPL Event on Collapse
 - Select Summary Menu Item directly
 - PreLoad the Spotfire
 - Get Spotfire Document Property on Mapping (start and end activities)
 - Fix bug; template null
 - Add start and Stop to Summary page
 - Get the Applied filters from Spotfire
 - Add filters to the Summary Page
 - Fixed Mappings not displaying
 - Fixed double collapse menu

Changes (6-5-2021):
 - Add config to the UI for SF Report on Preview
 - Add config to the UI for Alt SF Server (hidden)
 - Remove Icons from UI
 - Fix bug on add menu item
 - Clean up shared state (template)
 - Hide two initial icons
 - don't give error on same name template.
 - Add auto refresh after adding a template
 - Make message less then 1 minute...
 - Save templates directly
 - Add menu items at the bottom
 - Change word purge to delete
 - Add all menu items
 - Change template only in ready and view analytics and template is selected already
 - Move the advanced input
 - Only add items that do not exist.
 - Add a clear all
 - Generate unique id's for menu items
 - Radio buttons horizontal on templates
 - Remove UIiD on save
 - Default icon on copy template
 - Add template name next to edit
 - Look at token not being passed
 - Look at analysisID being wrong
 - Do not allow saving of templates with the same name or dxp
 - Don't show numbers on editing process analysis
 - Remove numbering on editing a Process Analysis
 - PAW - Prevent clicking twice on the finish button.
 - Create scrolling for menu in analytics
 - Layout issue for mapping
 - Remove the numbers from the tabs
 - Replace y by yy and yyyy (validate)
