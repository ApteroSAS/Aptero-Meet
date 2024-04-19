import { customActionRegister } from "./CustomActionRegister";
import { findAncestorWithComponent } from "../../../../utils/scene-graph";
import { networkService } from "../../HubsBridge/service/NetworkService";

export class ActionAnimationController{
    constructor() {
        this.animations = {}; // Store references to animations and their states
    }

    init(){
        networkService.onMessage("animation_play", ({  body }) => {
            let actionid = body.id;
            let action = customActionRegister.actions[actionid];
            if (action) {
                action.callback();
            }
        });
    }

    setup(htmlElement,action,actionid){
        const mixerEl = findAncestorWithComponent(htmlElement, "animation-mixer");
        let mixer = mixerEl && mixerEl.components["animation-mixer"].mixer;
        let actionAnimation = mixer.clipAction(action.data);
        // Add uuid to the action data
        if (actionAnimation) {
            const repeat = action.repeat || 1;

            // This is the callback that will be called when the action is triggered
            customActionRegister.actions[actionid] =
                {
                    action: action,
                    callback: () => {
                        if (action.speed !== 0) { // Pause buttons should not affect loops
                          if (action.loop) {// Infinite loop
                              actionAnimation.setLoop(THREE.LoopRepeat);
                          } else if (action.repeat !== undefined) {
                              actionAnimation.setLoop(THREE.LoopRepeat, repeat);
                          } else {
                            // Legacy support
                              actionAnimation.setLoop(THREE.LoopOnce);
                          }
                        }
                        

                        if (action.speed === undefined) {
                            // Legacy support
                            actionAnimation.setEffectiveTimeScale(1);
                            actionAnimation.play();
                            actionAnimation.reset();
                            actionAnimation.originalTimeScale = 1;
                        } else {
                            if (action.speed === 0) {
                                // Toggle between pause and resume
                                if (typeof actionAnimation.originalTimeScale === 'undefined') {
                                    // Store the original time scale the first time the animation is played
                                    actionAnimation.originalTimeScale = actionAnimation.getEffectiveTimeScale();
                                }
                        
                                if (actionAnimation.getEffectiveTimeScale() !== 0) {
                                    // Pause the animation by setting its time scale to 0
                                    actionAnimation.setEffectiveTimeScale(0);
                                } else {
                                    // Resume the animation by restoring its original time scale
                                    actionAnimation.setEffectiveTimeScale(actionAnimation.originalTimeScale);
                                }
                            } else if (action.speed === -1) {
                                // Stop and reset the animation
                                actionAnimation.stop();
                                actionAnimation.reset();
                                actionAnimation.setEffectiveTimeScale(1);
                                actionAnimation.originalTimeScale = 1;
                            } else { // Click / Reclick functionality
                                // Play or change speed
                                const animData = [action.data, action.speed, action.reclick, action.loop, action.repeat];

                                // Is not moving AND is unpaused 
                                if ((!actionAnimation.isRunning() && actionAnimation.getEffectiveTimeScale() !== 0)
                                // First animation, or last one was different
                                || (actionAnimation.lastAnimation !== undefined 
                                && JSON.stringify(actionAnimation.lastAnimation) !== JSON.stringify(animData))
                                // reclick functionality is undefined
                                || action.reclick === undefined ) {
                                    // This animation is NEW
                                    actionAnimation.setEffectiveTimeScale(action.speed);
                                    setTimeout(() => {
                                        //Wait a bit so "isRunning()" doesn't retroactively return true
                                        actionAnimation.play();
                                    }, 10);
                                    actionAnimation.reset();
                                    actionAnimation.originalTimeScale = action.speed;
                                    actionAnimation.lastAnimation = animData;
                                } else {
                                    // This animation is already playing
                                    // Depends on config
                                    if (action.reclick === 0) {
                                        // Pause and resume
                                        if (actionAnimation.getEffectiveTimeScale() !== 0) {
                                            // Pause the animation by setting its time scale to 0
                                            actionAnimation.setEffectiveTimeScale(0);
                                        } else {
                                            // Resume the animation by restoring its original time scale
                                            actionAnimation.setEffectiveTimeScale(actionAnimation.originalTimeScale);
                                        }
                                    } else if (action.reclick === 1) {
                                        // Reset and play again
                                        actionAnimation.play();
                                        actionAnimation.reset();
                                    } else if (action.reclick === 2) {
                                        // Stop and reset the animation
                                        actionAnimation.stop();
                                        actionAnimation.reset();
                                    } // else do nothing
                                }
                            }
                        }
                    }
                };
        } else {
            console.warn("invalid extension data on animation " + action.data + " not found on mesh");
        }
    }
}