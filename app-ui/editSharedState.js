console.log('Updating Shared State');
const storeOptions = {spaces: 2, EOL: '\r\n'};
const jsonfile = require('jsonfile');
const sharedStateFileName = './Shared_State (Discover MVP DEV)/CONTENT/discoverapp.discover.config.client.context.SHARED.CONTENT.json';
const sharedStateEntry = require(sharedStateFileName);
if (sharedStateEntry.analyticTemplates) {
  for (let aTemplate of sharedStateEntry.analyticTemplates) {
    if (aTemplate) {
      let setToDefault = false;
      for (let menuItem of aTemplate.menuConfig) {
        if(!setToDefault){
          menuItem.isDefault = true;
          setToDefault = true;
        } else {
          menuItem.isDefault = false;
        }
        if (menuItem.child) {
          for (let mChild of menuItem.child) {
            mChild.isDefault = false;
          }
        }
      }
    }
  }
}
//console.log(sharedStateCases);
jsonfile.writeFileSync(sharedStateFileName, sharedStateEntry, storeOptions);
console.log('Shared State file Updated...');




