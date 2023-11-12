
import Hyperbeam from "@hyperbeam/web";
import { getCurrentHubId } from "../../../utils/hub-utils";
import apteroCursor from "../../../assets/aptero/apteroCursor.svg";

import {hyperbeamPopup} from "./HyperbeamScripts/HyperbeamPopup"

export const HYPERBEAM_PROTOCOL = "hyperbeam:";
export const HYPERBEAM_TRAIL = "/hyperbeam.mp4";

// Declaring global variables that might be defined elsewhere in the application
declare const NAF;
declare const THREE;
declare const window;

// Function to correct URL protocol
function cleanurl(url) {
  url = url.replace(HYPERBEAM_PROTOCOL, "https:");
  url = url.replace("http://", "https://");
  url = url.replace("https://https://", "https://"); //Avoid duplicates!
  return url;
}


export const hyperbeamBrowser = async (screenElement, texture, mediaData) => {

  // Load the cursor SVG image
  let hbCursor = new Image();
  hbCursor.src = new URL(apteroCursor, window.location.origin).href;

  // Get the Hyperbeam properties from the mediaData
  let userMadeHB = false;
  var hbProperties;
  if (mediaData.customOptions)  {
    hbProperties = JSON.parse(mediaData.customOptions);
  } else {
    userMadeHB = true;
    hbProperties = {
      HBRes: null,
      HBRegion: null,
      HBWebGL: null,
      HBBrowserNav: null,
      HBRestricted: null,
      HBDarkMode: null,
      HBFps: null,
      HBQlty: null,
      HBuBlock: null,
      HBSession: null,
      HBNoCursors: null,
    };
  }

  if (!hbProperties.HBNoCursors) {
    screenElement.acceptsInput = true;
  } else {
    screenElement.acceptsInput = false;
  }


  // Getting the networked entity and setting its attributes
  // We also get rid of the Hover menu component
  let screenId = await new Promise((resolve) => {
    NAF.utils.getNetworkedEntity(screenElement).then(networkedEl => {
      delete screenElement.components["hover-menu__video"];
      let screenId = networkedEl.components.networked.data.networkId;
      screenElement.setAttribute("tags", "singleActionButton: true;");
      resolve(screenId);
    });
  });

  //const aspectRatio = 16 / 9;
  const width = hbProperties.HBRes ? Math.floor(hbProperties.HBRes * 16 / 9) : 1280;
  const height = hbProperties.HBRes ? hbProperties.HBRes : 720;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#A788FD';
  context.beginPath();
  context.roundRect(20, 20, width-40, height-40, 40);
  context.fill();

  context.font = '158px calibri'
  context.fillStyle = 'black'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText('Loading Browser', width / 2, height / 2)

  //Create a canvas to draw the mouse
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = width;
  finalCanvas.height = height;
  const finalContext = finalCanvas.getContext('2d');


  let embedURL = "";

  let mediaLoader = await screenElement.getAttribute("media-video");
  let testUrl = await mediaLoader.hsrc;
  

  if (testUrl) {
    embedURL = testUrl;
  } else {
    const hubId = getCurrentHubId();
    const hb_objid = 'hb_objid_'+hubId+'_'+screenElement.id;
    // If the object doesn't have a defined HB ID, we assign one
    let apteroTimeout = 2000;
    // Try get the Hyperbeam session from Aptero
    while(embedURL === "")
    {
      try {
          embedURL = await processHyperbeamEntity(screenElement,mediaData,hb_objid,hbProperties);
          console.log("Define EmbedURL",screenElement.getAttribute("media-video").hsrc);
      }
          catch (e) {
          console.log("Error getting Aptero Hyperbeam",e);
      }
      
      if (embedURL === "") {
          // Wait an increasing amount of time before trying again
          await new Promise(r => setTimeout(r, apteroTimeout));
          apteroTimeout = Math.min(10000, apteroTimeout + 1000);
      }
    }
  }

  if (embedURL === "") {
    // We can't get a Hyperbeam session, we just display an Error message

    context.fillStyle = '#A788FD';
    context.beginPath();
    context.roundRect(20, 20, canvas.width-40, canvas.height-40, 40);
    context.fill();

    context.font = 'bold 130px Helvetica'
    context.fillStyle = 'black'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('Unable to load VM', canvas.width / 2, canvas.height / 2 -50);
    context.font = '70px Helvetica'
    context.fillText('Hyperbeam was unable to', canvas.width / 2, canvas.height / 2 +60);
    context.fillText('return a valid Session', canvas.width / 2, canvas.height / 2 +130);

    console.log("Hyperbeam not available");
    screenElement.emit("video-loaded", { projection: "flat" });

    
    texture.flipY = false
    texture.image = canvas;
    texture.needsUpdate = true;
    texture.generateMipmaps = false
    return texture;
  }

  /*----------------------------------------------------
                  Initialize Hyperbeam
   ----------------------------------------------------*/

   // Make a local map for the current user cursor
  let localCursorMap = new Map();
  let connectionState = "";

  const hb = await Hyperbeam(screenElement, embedURL, {
    /*
      This section represent the Options object of Hyperbeam, more info here:
      https://docs.hyperbeam.com/client-sdk/javascript/reference#method-parameters
    */
    onConnectionStateChange: ({state}) => {
      connectionState = state;
    },
    
    delegateKeyboard: false,

    // Handle audio from Hyperbeam
    audioTrackCb: (track) => {
      const audioListener = screenElement.sceneEl.audioListener;
      const audio = new THREE.PositionalAudio(audioListener);
      audio.setMediaStreamSource(new MediaStream([track]));
      audio.setRefDistance(0.5);
      screenElement.setObject3D(screenElement.attrName, audio);
    },
    // We use frameCb to get our texture updated with the video stream
    frameCb: (frame) => {
      if (texture.image !== null) {
        //Draw on top of the canvas
        context.drawImage(frame, 0, 0, canvas.width, canvas.height);
        texture.needsUpdate = true;
      }
    },
  });

  // Register a global variable to call Hyperbeam from anywhere
  if (!window.cursorOutBounds) {window.cursorOutBounds = false;}
  if (!window.lockMovement) {window.lockMovement = false;}
  if (!window.hyperbeam_3dx) {window.hyperbeam_3dx = 0;}
  if (!window.hyperbeam_3dy) {window.hyperbeam_3dy = 0;}
  if (!window.hyperbeam_hoverOn) {window.hyperbeam_hoverOn = null;}
  if (!window.hyperbeam_element) {window.hyperbeam_element = null;}
  if (!window.hyperbeam_hb) {window.hyperbeam_hb = null;}
  if (!window.hyperbeam_popup) {window.hyperbeam_popup = null;}

  

  // Tell the loader element that we are ready, so it stop doing the wawawa loading noise
  screenElement.emit("video-loaded", { projection: "flat" });

  
  /*----------------------------------------------------
    We can use hb events to manage events from Hyperbeam
   ----------------------------------------------------*/

  // Mouse events setup

  /*
    Important: We use HbCords to keep track of the coordinates of all the users
    as we receive them, while localCursorMap is used to keep the feeling of smooth movement
    through interpolation
  */

  const HbCords = new Map();
  const dataChannel = 'hbCords_'+screenElement.id;

  let activeclick = false;

  function sendCords(userId: any, x: number, y: number, press = false)
  {
    // Send information
    NAF.connection.broadcastData(dataChannel, {userId: userId, x: x, y: y, press: press});
  }
  
  // Subscribe to global coordinates data channel
  if (!hbProperties.HBNoCursors) {
    NAF.connection.subscribeToDataChannel(dataChannel, handleCords);
  }

  function handleCords(senderId, type, data, targetId) {
    if (type === dataChannel) {
      // Ignore our own coordinates
      if (data.userId === NAF.clientId) {return;}

      // Update the HbCords Map
      HbCords.set(data.userId, {x: data.x, y: data.y, press: data.press});

      // If the user is not in the localCursorMap, we add it
      if (!localCursorMap.has(data.userId)) {
        localCursorMap.set(data.userId, {x: data.x, y: data.y});
      }
    }
  }
  
  // Send coordinates 20 times per second
  let sendCursorSignal = false;
  if (!hbProperties.HBNoCursors) {
    setInterval(() => {
      // Send local coordinates
      if (sendCursorSignal){
        const myX = HbCords.get(NAF.clientId).x;
        const myY = HbCords.get(NAF.clientId).y;
        sendCords(NAF.clientId, myX, myY, activeclick);
        sendCursorSignal = false;
      }
      // If we have more than 10 active cursors we disable smooth mode
      if (localCursorMap.size > 10) {smoothmode = false;}
    }, 50); // 1000ms / 20 = 50ms
  }
  
  // Interpolate coordinates (hbcords to localCursorMap)
  let smoothmode = true;
  function interpolatedCords() {
    // Loop through all the users in the HbCords Map
    HbCords.forEach(function(value, key) {
      if (key !== NAF.clientId) {// <-- Omit our own coordinates (They are updated in Real-Time)
        if (smoothmode && value.x !== -1 && localCursorMap.get(key).x !== -1) {
          const [xs, ys] = [localCursorMap.get(key).x, localCursorMap.get(key).y];
          const [xf, yf] = [xs + (value.x - xs) * 0.1, ys + (value.y - ys) * 0.1];
          localCursorMap.set(key, {x: xf, y: yf, press: value.press});
        } else {
          localCursorMap.set(key, {x: value.x, y: value.y, press: value.press});
        }
      }
    });
    drawCursors();
    requestAnimationFrame(interpolatedCords);
  }

  if (!hbProperties.HBNoCursors) {
    interpolatedCords();
  }
  
  // Remove the user from the HbCords Map when the user left the room
  if (!hbProperties.HBNoCursors) {
    document.body.addEventListener("clientDisconnected", function(event:any) {
      HbCords.delete(event.detail.clientId);
      localCursorMap.delete(event.detail.clientId);
      // Force update without the disconnected user
      NAF.connection.broadcastData(dataChannel, HbCords);
    });
  }
  
  // Function to update the local localCursorMap
  function setCursorMap(key,value) {
    localCursorMap.set(key,value);
    HbCords.set(key,value);
    sendCursorSignal = true;
  }
  
  let confirmToggle = false;
  let confirmToggleBuffer = false;
  let hoverswitch = false;
  const confirmCords = {x: 0, y: 0};

  function onMouseEvent(e) {
    // Ignore all mouse events if the element is not PINNED
    if (screenElement.getAttribute("pinnable")
    && !screenElement.getAttribute("pinnable").pinned) {return;}
    
    // Cancel if the mouse is hovering: Menus, Button or Input
    if (e.target.tagName !== "CANVAS") 
    {return;}

    // Toggle functionality
    /*
      We use a toggle system to only make a change if both mouse down and mouse up
      are triggered in the same way (Both inside or outside the screenElement)
    */

    if (window.hyperbeam_element !== screenElement) {
      activeclick = false;
    }

    if (e.type === "mousedown") {
      const inspecting = screenElement.sceneEl.systems["hubs-systems"].cameraSystem.mode
      if (window.hyperbeam_hoverOn === screenElement && e.button === 0 && !inspecting) 
      {
        // e.button 0 means LEFT click only
        confirmToggle = true;
        confirmToggleBuffer = window.cursorOutBounds;
        confirmCords.x = window.hyperbeam_3dx;
        confirmCords.y = window.hyperbeam_3dy;
        hoverswitch = true;
      }
    } else if (e.type === "mouseup") {
      activeclick = false;
      if (confirmToggle) {
        if (confirmToggleBuffer === window.cursorOutBounds) {
          if (window.cursorOutBounds) {
            //window.lockMovement = false;
            hyperbeamExit();
          } else if (!window.lockMovement) {
            if (
              window.hyperbeam_3dx > confirmCords.x - 0.02 && 
              window.hyperbeam_3dx < confirmCords.x + 0.02 && 
              window.hyperbeam_3dy > confirmCords.y - 0.04 && 
              window.hyperbeam_3dy < confirmCords.y + 0.04) {
              window.lockMovement = true;
              window.hyperbeam_hb = hb;
              window.hyperbeam_element = screenElement;

              // Show popup
              window.hyperbeam_popup.style.animation = "fadein 0.3s ease-in-out";
              setTimeout(() => {
                if (!window.lockMovement) {return;}
                window.hyperbeam_popup.style.opacity = 1;
                window.hyperbeam_popup.style.display = "flex";
              }, 300);
            }
          }
        }
      }
      confirmToggle = false;
    } else if (e.type === "mousemove") {
      // Allow for flawless movement from one screen to another
      if (!confirmToggle // <-- Only if we are not in toggle mode
      && window.lockMovement 
      && !window.cursorOutBounds // Redundant??
      && window.hyperbeam_hoverOn === screenElement)
      {
        hoverswitch = true;
        if (window.hyperbeam_element !== screenElement) {
          window.hyperbeam_element = screenElement;
          window.hyperbeam_hb = hb;
        }
      }
    }

    // Hide cursor locally and globally if we are not using the screen
    if (hoverswitch && (window.cursorOutBounds ||
    window.hyperbeam_hoverOn !== screenElement)) {
      // BroadcastData as "ignore" (-1, -1)
      sendCords(NAF.clientId, -1, -1);
      localCursorMap.set(NAF.clientId, {x: -1, y: -1});
      HbCords.set(NAF.clientId, {x: -1, y: -1});
      hoverswitch = false;
    }

    // Ignore mouse events if we are not using THIS screen
    if (!hoverswitch)
    {return;}


    // Capture mouse events only if we are locked
    if (window.lockMovement && window.hyperbeam_element === screenElement) {
      // Capture mouse X and Y based on where the cursor is pointing at the screenElement
      // This is calculated using a Raycaster
      const m3x = window.hyperbeam_3dx;
      const m3y = window.hyperbeam_3dy;
      
      // Send the event to Hyperbeam
      if (e.type !== "mousemove") {
        if (e.type === "wheel") {
          hb.sendEvent({
            type: "mousemove",
            x: m3x,
            y: m3y,
          });
          hb.sendEvent({
            type: "wheel",
            deltaY: e.deltaY
          });

        } else {
          if (e.type === "mousedown")
          {activeclick = true;}

          hb.sendEvent({
            type: e.type,
            button: e.button,
            x: m3x,
            y: m3y,
          });
        }
      } else {
        if (activeclick) {
          hb.sendEvent({
            type: "mousemove",
            x: m3x,
            y: m3y,
          });
        }
      }

      //Update Local localCursorMap
      sendCursorSignal = true;
      setCursorMap(NAF.clientId, {
        x: m3x,
        y: m3y,
        press: activeclick,
      });
    }
  }
  if (!hbProperties.HBNoCursors) {
    window.addEventListener("mousemove", onMouseEvent);
    window.addEventListener("mousedown", onMouseEvent);
    window.addEventListener("mouseup", onMouseEvent);
    
    //Also the wheel
    window.addEventListener("wheel", onMouseEvent);
  }



  function drawCursors() {
    // Draw the Hyperbeam texture behind the cursors
    // We use a second canvas so the original texture is not altered
    finalContext.drawImage(canvas, 0, 0, width, height);

    // Draw a RED outline if THIS screen is the one being used
    if (window.lockMovement && window.hyperbeam_element === screenElement) {
      finalContext.strokeStyle = 'red';
      finalContext.lineWidth = 10;
      finalContext.beginPath();
      finalContext.roundRect(0, 0, width, height, 10);
      finalContext.stroke();
    }
    
    // Draw the cursors (Unless the screen is not PINNED or it was created from Opal)
    if (screenElement.getAttribute("pinnable")
    && screenElement.getAttribute("pinnable").pinned
    || !screenElement.getAttribute("pinnable") && !userMadeHB) {
      // Draw the cursors based on the cursors Map
      localCursorMap.forEach(function(value, key) {
        if (value.x !== -1) {
          const [x, y] = [value.x, value.y];
          // Ensure the cursor image is loaded (.onload), then draw it

          hbCursor.onload = () => {
            finalContext.drawImage(hbCursor, x * width, y * height, 40, 40);
          };

          // Calculate click indicator size based on the screen resolution
          const csa = height / 60;
          const csb = csa *1.25;

          // Draw the cursor image
          try {
            // Indicator color for pressed or local cursor
            if (value.press) {
              finalContext.strokeStyle = key === NAF.clientId ? "lime" : "red";
              finalContext.lineWidth = csa;
              finalContext.beginPath();
              finalContext.arc(x * width, y * height, csb, 0, 2 * Math.PI);
              finalContext.stroke();
            }

            finalContext.drawImage(hbCursor, x * width, y * height, 40, 40);
          } catch (e) {
            // Draw a red circle if the cursor image is not loaded
            finalContext.fillStyle = 'red';
            finalContext.beginPath();
            finalContext.arc(x * width, y * height, csb, 0, 2 * Math.PI);
            finalContext.fill();
          }
        }
      });
    } else {
      // Show a message asking to PIN the screenElement
      if (connectionState === "playing") {
        // -Shadow
        finalContext.shadowColor = 'rgba(0, 0, 0, 0.5)';
        finalContext.shadowBlur = 20;
        finalContext.shadowOffsetX = 0;
        finalContext.shadowOffsetY = 10; 
        // -Background
        const hcenter = height / 2;
        finalContext.fillStyle = 'black';
        finalContext.beginPath();
        finalContext.roundRect(30, hcenter-160, width-60, 280, 40);
        finalContext.fill();
        finalContext.shadowColor = 'rgba(0, 0, 0, 0)';
        // -Inner Background
        finalContext.fillStyle = '#ffcc00';
        finalContext.beginPath();
        finalContext.roundRect(50, hcenter-140, width-100, 240, 30);
        finalContext.fill();

        // -Text
        finalContext.font = 'bold 130px Helvetica'
        finalContext.fillStyle = 'black'
        finalContext.textAlign = 'center'
        finalContext.textBaseline = 'middle'
        finalContext.fillText('PIN this element', width / 2, hcenter -50);
        finalContext.font = '70px Helvetica'
        finalContext.fillText('to enable input control', width / 2, hcenter +50);
      }
    }

    texture.needsUpdate = true;
  }
  

  // Keyboard events
  function onKeyEvent(e) {

    // Exit Hyperbeam if we press ESC
    if (e.key === "Escape") {
      hyperbeamExit();
      return;
    }

    // Ignore keyboard events if we are on a INPUT element (Like the Chat for example)
    if (e.target.tagName !== "BODY") {return;}

    // CLEAN keyboard events if we are not using THIS screen
    // But got stuck sending a keyboard event
    if (e.type === "keydown" && !window.lockMovement || window.hyperbeam_element !== screenElement) {
      hb.sendEvent({
        type: "keyup",
        key: e.key,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
      });
      return;
    }

    // Ignore keyboard events if we are not using THIS screen
    if (!window.lockMovement || window.hyperbeam_element !== screenElement) {return;}

    // Ignore keyboard events if the screen is not PINNED
    if (screenElement.getAttribute("pinnable")
    && !screenElement.getAttribute("pinnable").pinned) {return;}

    hb.sendEvent({
      type: e.type,
      key: e.key,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
    });

    
  }
  if (!hbProperties.HBNoCursors) {
    window.addEventListener("keydown", onKeyEvent);
    window.addEventListener("keyup", onKeyEvent);
  }

  // Ping Hyperbeam every 20 seconds to keep the connection alive
  setInterval(() => {
    hb.ping();
  }, 20 * 1000);

  /* 
    We can change the Hyperbeam resolution using resize
    NOTE that we have a limit of pixels so we would need a script for that:
    https://docs.hyperbeam.com/guides/resize-browser-window#hb-resize-width-height
  */
  hb.resize(width, height);

  // Display on the screen a popup that shows that we are locked to a Hyperbeam screen
  hyperbeamPopup(hyperbeamExit,hbProperties);

  // Destroy hb when the object is destroyed
  screenElement.addEventListener("componentremoved", (evt) => {
    if (evt.detail.name === "networked") {
      hb.destroy();
      // Remove the listeners
      screenElement.removeEventListener("componentremoved", () => { });
      window.removeEventListener("keydown", onKeyEvent);
      window.removeEventListener("keyup", onKeyEvent);
      window.removeEventListener("mousemove", onMouseEvent);
      window.removeEventListener("mousedown", onMouseEvent);
      window.removeEventListener("mouseup", onMouseEvent);
      screenElement.sceneEl.removeEventListener("clientDisconnected", () => { });

      // Unlock the movement if the object is destroyed
      if (window.lockMovement && window.hyperbeam_element === screenElement) {
        hyperbeamExit();
      }
    }
  });

  function hyperbeamExit() {
    // Unlock the movement
    window.current_3dhyperbeam = null;
    window.lockMovement = false;
    window.hyperbeam_element = null;
    window.hyperbeam_hb = null;

    // Hide cursor
    if (!hbProperties.HBNoCursors){
      sendCords(NAF.clientId, -1, -1);
      HbCords.set(NAF.clientId, {x: -1, y: -1});
      localCursorMap.set(NAF.clientId, {x: -1, y: -1});
      hoverswitch = false;
    }
    // Hide popup (Fade out using using opacity)
    // (Ignore if it was already hidden)
    if (window.hyperbeam_popup.style.display !== "flex") {return;}
    window.hyperbeam_popup.style.animation = "fadeout 0.3s ease-in-out";
    setTimeout(() => {
      if (window.lockMovement) {return;}
      window.hyperbeam_popup.style.opacity = 0;
      window.hyperbeam_popup.style.display = "none";
    }, 300);

  }
  
  if (hbProperties.HBNoCursors) {
    texture.image = canvas;
  } else {
    texture.image = finalCanvas;
  }
  texture.flipY = false
  texture.needsUpdate = true;
  texture.generateMipmaps = false
  return texture;

}


/*
  Thise next section is an adaptation of the system found in
  https://hyperbeam.serverless.aptero.co/source.js
  It is used to get a Hyperbeam VM from the Aptero Hyperbeam service
*/
function readQueryVariable(name, defaultValue) {
  const re = new RegExp('.*[?&]' + name + '=([^&#]*)'),
    match = document.location.href.match(re);

  if (match) {
    return decodeURIComponent(match[1]);
  }

  return defaultValue;
}

export const processHyperbeamEntity = async (entity,mediaData,objIdentifier,hbProperties) => {
  // Get the VM session from Aptero or from the Hyperbeam demo server
  let url = readQueryVariable('url', cleanurl(mediaData.src));

  let fetchfrom = 'https://hyperbeam.serverless.aptero.co/objcomputer';
  // If we are running from localhost, fetch directly using CORS proxy
  if (window.location.hostname === "localhost") {
    /*/
    const proxyURL = 'https://corsproxy.aptero.co/';
    const serverOrigin = 'https://hyperbeam.serverless.aptero.co/';
    fetchfrom = proxyURL+serverOrigin+'objcomputer';
    /*/
    fetchfrom = "http://localhost:8286/objcomputer"
    /**/
  }
  
  /*
    We have 2 ways of requesting a VM:
    - Using the session to get an Existing VM (Defined in Opal)
    - Using a disposable session (No profile defined, So no Load)
  */
  const profile = hbProperties.HBSession ? {
    load: hbProperties.HBSession,
    save: hbProperties.HBSession
  } : null;

  const finalurl = hbProperties.HBSession ? null : url;

  const bodyContent = {
    objid: objIdentifier,
    start_url: finalurl,
    region: hbProperties.HBRegion ? hbProperties.HBRegion : 'NA',
    width: hbProperties.HBRes ? Math.floor(hbProperties.HBRes * 16 / 9) : 1280,
    height: hbProperties.HBRes ? hbProperties.HBRes : 720,
    webgl: hbProperties.HBWebGL ? hbProperties.HBWebGL : false,
    kiosk: hbProperties.HBBrowserNav ? hbProperties.HBBrowserNav : false, // Nav bar
    control_disable_default: hbProperties.HBRestricted ? hbProperties.HBRestricted : false,
    dark: hbProperties.HBDarkMode ? hbProperties.HBDarkMode : false,
    fps: hbProperties.HBFps ? hbProperties.HBFps : 24,
    quality: {
      mode: hbProperties.HBQlty ? hbProperties.HBQlty : "smooth",
    },
    ublock: hbProperties.HBuBlock ? hbProperties.HBuBlock : false,
    
    "hide_cursor": true,
    max_area: 1920 * 1080,

    timeout: {
      "absolute": 18 * 60 * 60, //seconds
      "inactive": 40, //seconds
      "offline": 30, //seconds
    },
    profile: profile,
  }

  const response = await fetch(fetchfrom, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyContent)
  });
  
  if (response) {
    const data = await response.json();
    if (data.embed_url) {
      // Define hsrc for media-video
      entity.setAttribute("media-video", {hsrc: data.embed_url});

      return data.embed_url;
    }
  }
  
  console.log("Aptero Hyperbeam is not available",response);
  
  return "";
}




export class HyperbeamService{
  constructor() {
  }

  
  tryCaptureCursor(intersection) {
    if (!intersection) {
      window.cursorOutBounds = true;
      return;
    }

    if (intersection?.object?.el?.components["media-video"]?.el === intersection?.object?.el) {
      // Ignore intersection if the element doesn't accept mouse input
      if (!intersection?.object?.el?.acceptsInput) {return;}

      NAF.utils
        .getNetworkedEntity(intersection.object.el)
        .then(networkedEl => {
        window.hyperbeam_3dx = intersection?.uv?.x;
        window.hyperbeam_3dy = intersection?.uv?.y;
        window.cursorOutBounds = false;
        window.hyperbeam_hoverOn = networkedEl;
      });
    }
  }

}


export const hyperbeamService = new HyperbeamService();
