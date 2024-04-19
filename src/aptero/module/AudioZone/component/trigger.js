import { addMedia } from "../../../../utils/media-utils";
import { CustomURL } from "../../customURL/CustomURL"

const sizeVec = new THREE.Vector3();
const boundingBoxWorldPositionVec = new THREE.Vector3();
const colliderWorldPositionVec = new THREE.Vector3();


function startPFrame(data,objid) {
  console.log("startPFrame",data,objid);
  // Create iframe
  const iframe = document.createElement("iframe");

  let triggerSrc = data.linkSource;
  if (data.audioMode) {
    let baseURL = data.linkSource;

    const sceneEl = document.querySelector('a-scene');
    const sceneClass = 
      (sceneEl.className !== undefined && sceneEl.className !== "") ? 
      sceneEl.className.split(' ')[1] : "";


    if (data.universalAudio) {
      baseURL += (sceneClass !== "") ? sceneClass : "{ROOM_NAME}";
      baseURL += "_";
    } else {
      baseURL += "{ROOM_ID}_"
    }
    
    if (data.audioChannel !== undefined) {
      baseURL += data.audioChannel;
    } else {
      baseURL += objid;
    }


    if (data.customTitle) {
      const cleanTitle = decodeURIComponent(data.customTitle);
      if (data.customTitle !== "") {
        baseURL += "?room_name=" + cleanTitle;
      }
    }
  

    const customURL = new CustomURL();
    triggerSrc = customURL.processURL(baseURL);

  }

  iframe.src = triggerSrc;
  iframe.width = "20%";
  iframe.height = "20%";
  iframe.allow = "camera; microphone; display-capture; fullscreen; vr; xr; xr-spatial-tracking;";
  iframe.style.position = "absolute";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.border = "0";
  iframe.style.zIndex = "1";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  window.PERSISTENTIFRAME = iframe;
  window.PFrameProps = {
    name: data.sidebarName,
    icon: data.buttonIcon,
  };

  const obj = {
    url : "psidebar",
    type : "sidebar_iframe",
    title: data.sidebarName,
    icon: data.buttonIcon,
  }

  const sceneEl = document.querySelector("a-scene");
  sceneEl.emit("togglePFrameButtonVisibility"); // Toggle Button
  sceneEl.emit("action_toggle_custom_psidebar"); // Toggle Persistent Sidebar
  setTimeout(()=>{sceneEl.emit("action_toggle_custom_sidebar_info",obj)},10);
  
}



AFRAME.registerComponent("trigger", {
  schema: {
    colliders: { type: "selectorAll" },
    size: { type: "vec3", default: { x: 1, y: 1, z: 1 } },
    target: { type: "selector" },
    sidebarName: { type: "string" },
    linkSource: { type: "string" },
    buttonIcon: { type: "string" },
    audioMode: { type: "boolean" },
    universalAudio: { type: "boolean" },
    audioChannel: { type: "number" },
    triggerModels: { type: "string"},
    // legacy properties
    enterComponent: { type: "string" },
    enterProperty: { type: "string" },
    enterValue: {
      default: "",
      parse: v => (typeof v !== "object" ? v : JSON.parse(v)),
      stringify: JSON.stringify
    },
    leaveComponent: { type: "string" },
    leaveProperty: { type: "string" },
    leaveValue: {
      default: "",
      parse: v => (typeof v!== "object" ? v : JSON.parse(v)),
      stringify: JSON.stringify
    }
  },
  init() {
    console.log("------trigger init------")
    this.boundingBox = new THREE.Box3();
    this.collidingLastFrame = {};
    this.wip = false;

    if (this.data && this.data.triggerModels) {
      const modelsData = JSON.parse(this.data.triggerModels);
      // Access the models data here
      const barrierCore = modelsData.barrierCore;
      const logoCore = modelsData.logoCore;
    
      // Spawn models
      const sceneEl = document.querySelector("a-scene");
      for (let key in modelsData) {
        const modelData = modelsData[key];
        //const { src, position, scale } = modelData;
        
        // Load the model
        const { entity, orientation } = addMedia(
          modelData.src, // Source URL
          '#static-media', // The template ID for the entity
          undefined, // contentOrigin
          null, // contentSubtype
          true, // resolve URLs to get the actual file URL
          false, // fitToBox
          true, // animate
          {}, // mediaOptions
          false // networked
        );

        // Set the position and scale of the entity
        entity.setAttribute('position', modelData.position);
        entity.setAttribute('scale', modelData.scale);
      }
    }
  },
  update() {
    this.el.object3D.getWorldPosition(boundingBoxWorldPositionVec);
    sizeVec.copy(this.data.size);
    this.boundingBox.setFromCenterAndSize(boundingBoxWorldPositionVec, sizeVec);
  },

  async tick() {
    if (this.wip){return;}
    this.wip = true;

    if (!window.fullyInRoom) {
      this.wip = false;
      return;
    }

    const colliders = this.data.colliders;
    if (colliders.length === 0) {
      this.wip = false;
      return;
    }

    for (let i = 0; i < colliders.length; i++) {
      const collider = colliders[i];
      const object3D = collider.object3D;

      object3D.getWorldPosition(colliderWorldPositionVec);
      const isColliding = this.boundingBox.containsPoint(colliderWorldPositionVec);
      const collidingLastFrame = this.collidingLastFrame[object3D.id];

      // We FIRST check if the user has selected their avatar + microphone
      if (isColliding && !collidingLastFrame) {
        console.log("entering zone");
        if (!window.PERSISTENTIFRAME) {
          startPFrame(this.data,object3D.id);
        }
      } else if (!isColliding && collidingLastFrame && window.PERSISTENTIFRAME) {
        console.log("leaving zone");
        window.PERSISTENTIFRAME.remove();
        window.PERSISTENTIFRAME = null;
        const sceneEl = document.querySelector("a-scene");
        sceneEl.emit("togglePFrameButtonVisibility");
        sceneEl.emit("action_toggle_custom_psidebar");
      }
      this.collidingLastFrame[object3D.id] = isColliding;
    }
  

    this.wip = false;
  },

  remove() {
    if (window.PERSISTENTIFRAME) {
      window.PERSISTENTIFRAME.remove();
      window.PERSISTENTIFRAME = null;
      const sceneEl = document.querySelector("a-scene");
      sceneEl.emit("togglePFrameButtonVisibility");
      sceneEl.emit("action_toggle_custom_psidebar");
    }
  }
});
