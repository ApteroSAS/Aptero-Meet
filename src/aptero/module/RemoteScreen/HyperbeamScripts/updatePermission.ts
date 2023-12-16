/**
 * Update usage permission whenever Room permissions are updated
 * 
 * @param hbProperties - The properties of the Hyperbeam module.
 * @param screenElement - The screen element to be updated.
 * 
 */


declare const window;
export function updatePermission(hbProperties,screenElement) {
  let allowInput = false;
    for (const [key, value] of Object.entries(hbProperties.HBPermissions)) {
      if (value && window.APP.hubChannel.can(key)) {
        allowInput = true;
        break;
      }
    }

    window.APP.hubChannel.addEventListener("permissions_updated", () => {
      const allowInputNew = updatePermission(hbProperties,screenElement);
      screenElement.acceptsInput = allowInputNew;
    });
  
    return allowInput;
}