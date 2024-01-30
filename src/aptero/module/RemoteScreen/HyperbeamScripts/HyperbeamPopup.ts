
import { virtualKeyboard } from "./VirtualKeyboard"
import { hb_popup_style } from "./hb_popup_style";

declare const window;
declare const AFRAME;

// This way of adding the popup is questionable, but it works

export function hyperbeamPopup(hyperbeamExit,hbProperties,hb) {
  if (!window.hyperbeam_popup) { // Ensure we only add ONE popup
    // Create the popup
    const hbPopup = window.hyperbeam_popup = document.createElement("div");
    document.body.appendChild(hbPopup);
    hbPopup.className = "hyperbeam-popup";
    hbPopup.innerHTML = '<p>Screen active: You can click <span class="nowrap">inside and use it</span></p>';

    // Apply style from hb_popup_style.ts
    const hbPopupStyle = document.createElement("style");
    hbPopupStyle.innerHTML = hb_popup_style;
    document.head.appendChild(hbPopupStyle);

    const hbButtons = document.createElement("div");
    hbButtons.className = "hyperbeam-buttons";
    hbPopup.appendChild(hbButtons);
    // Add a Button to open a Sidebar inside a div
    const hbPopupButton2 = document.createElement("button");
    hbPopupButton2.innerHTML = "Fullscreen";
    hbButtons.appendChild(hbPopupButton2);
    hbPopupButton2.addEventListener("click", async () => {
      // Make sure the source is properly defined
      const hb_source = window.hyperbeam_element;
      if (hb_source && hb_source.getAttribute("media-video") 
      && hb_source.getAttribute("media-video").hsrc) {
        const obj = {
          url : hb_source.getAttribute("media-video").hsrc,
          type : "sidebar_iframe",
          title: "3D Web Browser",
        }
        // Exit Hyperbeam 3D mode first
        hyperbeamExit();
        // Open the sidebar
        hb_source.sceneEl.emit("action_toggle_custom_sidebar");
        setTimeout(()=>{hb_source.sceneEl.emit("action_toggle_custom_sidebar_info",obj)},10);
        // Make it fullscreen
        hb_source.sceneEl.emit("action_toggle_custom_sidebar_fullscreen");
        // Mute audio
        const audio = hb_source.getObject3D(hb_source.attrName);
        if (audio) {audio.setVolume(0);}
        console.log("MUTE AUDIO");
        window.mutedHBElement = hb_source;
      }
    });

    // Add a Button to reconnect (hb.reconnect)
    const hbPopupButton3 = document.createElement("button");
    hbPopupButton3.innerHTML = "Reconnect";
    hbButtons.appendChild(hbPopupButton3);
    hbPopupButton3.addEventListener("click", () => {
      hb.reconnect();
    });
    
    // Check if the device is mobile
    if (AFRAME.utils.device.isMobile()) {
      /*
        This section is used to create a virtual Text Input that the user can write in:

        We don't really need the text content, just the last character, or a smaller string
        (Which would mean a backspace was pressed)
        
        This is a workaround to input keys and the Backspace from mobile soft keyboards, with
        the reason being that with empty/short text, the Backspace key is not registered
      */
      
      virtualKeyboard(hbButtons,hyperbeamExit,hbProperties);
    }

    // Add a Button to exit Hyperbeam
    const hbPopupButton = document.createElement("button");
    hbPopupButton.innerHTML = "Exit";
    hbButtons.appendChild(hbPopupButton);
    hbPopupButton.addEventListener("click", () => {
      hyperbeamExit();
    });
    

    

  }
}