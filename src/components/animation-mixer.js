/**
 * Instantiates and updates a THREE.AnimationMixer on an entity.
 * @component animation-mixer
 */

const components = [];
export class AnimationMixerSystem {
  tick(dt) {
    for (let i = 0; i < components.length; i++) {
      const cmp = components[i];
      if (cmp.mixer) {
        cmp.mixer.update(dt / 1000);

        // Aptero
        if (window.syncAnimationsActive) {

          /*
            We use a custom Sync Animation system, to process post-animation updates

            This is useful for animations that are not directly controlled by the AnimationMixer

            For example, the Bone-attached Buttons
          */

          const hasActiveAnimations = cmp.mixer._actions.some(action => action.isRunning());
                              
          if (hasActiveAnimations || cmp.mixer.needsFinalUpdate) {
            if (cmp.mixer.syncAnimations) {
              for (let j = 0; j < cmp.mixer.syncAnimations.length; j++) {
                const syncAnim = cmp.mixer.syncAnimations[j];
    
                if (syncAnim && syncAnim.update && typeof syncAnim.update === "function") {
                  syncAnim.update();
                }
              }
            }
            cmp.mixer.needsFinalUpdate = hasActiveAnimations ? 2 : (cmp.mixer.needsFinalUpdate - 1);
          }
        }
      }
    }
  }
}

AFRAME.registerComponent("animation-mixer", {
  initMixer(animations) {
    this.mixer = new THREE.AnimationMixer(this.el.object3D);
    this.el.object3D.animations = animations;
    this.animations = animations;
  },
  play() {
    components.push(this);
  },
  pause() {
    components.splice(components.indexOf(this), 1);
  }
});
