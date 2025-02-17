import { findAncestorWithComponent } from "../utils/scene-graph";
import { roomApi } from "../aptero/module/FrontEndAPI/RoomApi";

/**
 * Loops the given clip using this entity's animation mixer
 * @component loop-animation
 */
AFRAME.registerComponent("loop-animation", {
  schema: {
    paused: { type: "boolean", default: false },
    /* DEPRECATED: Use activeClipIndex instead since animation names are not unique */
    clip: { type: "string", default: "" },
    activeClipIndex: { type: "int", default: 0 },
    startOffset: { type: "number", default: 0 },
    timeScale: { type: "number", default: 1 },
    activeClipIndices: { type: "array" }
  },

  init() {
    this.mixerEl = findAncestorWithComponent(this.el, "animation-mixer");
    this.currentActions = [];

    if (!this.mixerEl) {
      console.warn("loop-animation component could not find an animation-mixer in its ancestors.");
      return;
    }
  },

  update(oldData) {
    if (this.mixerEl) {
      if (oldData.clip !== this.data.clip || oldData.activeClipIndex !== this.data.activeClipIndex) {
        this.updateClip();
      }

      if (oldData.paused !== this.data.paused) {
        for (let i = 0; i < this.currentActions.length; i++) {
          this.currentActions[i].paused = this.data.paused;
        }
      }
    }
  },

  updateClip() {
    const { mixer, animations } = this.mixerEl.components["animation-mixer"];
    const { clip: clipName, activeClipIndex } = this.data;
    const { activeClipIndices } = this.data;

    if (animations.length === 0) {
      return;
    }

    let clips = [];
    if (activeClipIndices && activeClipIndices.length > 0) {
      // Support for Spoke->Hubs activeClipIndices struct
      clips = activeClipIndices.map(index => animations[index]);
    } else {
      // Support for old Spoke->Hubs { clipName, activeClipIndex } struct. Still used for Blender imports.
      if (clipName !== "") {
        const clipNames = clipName.split(",");
        for (let i = 0; i < clipNames.length; i++) {
          const n = clipNames[i];
          const a = animations.find(({ name }) => name === n);
          if (a) {
            clips.push(a);
          } else {
            console.warn(`Could not find animation named '${n}' in ${this.el.className}`);
          }
        }
      } else {
        // Remove all animations whose name starts with "ApteroANIM"
        let clipFilter = [animations[activeClipIndex]];
        if (activeClipIndex === 0) {
          clipFilter = animations.filter(clip => !clip.name.startsWith("ApteroANIM"));
        }
        clips = clipFilter;
      }
    }

    if (!(clips && clips.length)) return;

    this.currentActions.length = 0;

    // Loop animation now uses our custom TriggerAnimation API
    // to ensure consistency with other animation triggers

    for (let i = 0; i < clips.length; i++) {
      let animName = clips[i].name;
      // Remove "ApteroANIM" prefix
      animName = animName.replace("ApteroANIM_", "");

      const triggerData = {
        elementUuid: this.el.getAttribute("uuid"),
        startOffset: this.data.startOffset,
        timeScale: this.data.timeScale,
        loop: true
      };

      const actionDef = {
        type: "animation",
        data: animName,
        loop: true,
        speed: this.data.timeScale,
        mainclick: 0,
        reclick: 0,
        onEnd: 0,
        lastAnimation: animName,
      };

      // Use the new TriggerAnimation method to trigger this clip.
      roomApi.triggerAnimation(animName, actionDef, triggerData, false);


      // OLD DEPRECATED CODE
      const action = mixer.clipAction(clips[i], this.el.object3D);
      action.enabled = false; // Changed to false to disable
      action.time = this.data.startOffset;
      action.timeScale = this.data.timeScale;
      action.setLoop(THREE.LoopRepeat, Infinity).play();
      this.currentActions.push(action);
    }
  },

  destroy() {
    for (let i = 0; i < this.currentActions.length; i++) {
      this.currentActions[i].enabled = false;
      this.currentActions[i].stop();
    }
    this.currentActions.length = 0;
  }
});
