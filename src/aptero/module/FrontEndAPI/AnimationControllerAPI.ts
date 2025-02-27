import {networkService} from "../HubsBridge/service/NetworkService";
import {TriggerAnimationAction} from "./FrontEndCommandAPI";
import * as THREE from "three"; 
import { v4 as uuidv4 } from 'uuid';

const event = "animation";
const mySenderId = uuidv4();

export class AnimationControllerAPI {
    constructor() {
    }

    

/*

networkService.onMessage ???

! The Animations are not being networked (both button and the new loop-animation), I may have broken or forgot to implement something, I'll investigate
-> I am in fact networking, I just have to fix the way I do it



! The Bone attachment system is working better and better, but upon further testing, it apparently breaks when the models are scaled (The system calculates the gimbal using position and rotations, I have to implement scale now). 

*/

    init() {
        networkService.onMessage(event, ({body}) => {
            this.triggerAnimation(body.animName, body.action, body.triggerData, body.senderId, body.transmit);
        });
    }

    findElement(name: string, parentBoneName: string | null = null) {
        const element = document.querySelector(`[uuid="${name}"]`);
        if (!element) {
            throw new Error(`Element with UUID ${name} not found`);
        }
    
        if (parentBoneName) {
            const parentModel = (element as any).object3D.parent;
            const parentBone = parentModel?.getObjectByName(parentBoneName);
            if (!parentBone) {
                throw new Error(`Bone ${parentBoneName} not found on parent model.`);
            }
            return parentBone;
        }
    
        return element;
    }
  


    private findAnimation(animName: string, mixerEl: Element, localMode = false) {
        let mixer = null;
        if (localMode) {
          mixer = (mixerEl as any).object3D.mixer;
        } else {
          mixer = mixerEl && (mixerEl as any).components["animation-mixer"].mixer;
        }
        let actionAnimation = mixer.clipAction(animName);
        if (actionAnimation) return actionAnimation;
        for (const animation of (mixerEl as any).object3D.animations) {
            if (animation.name.includes(animName)) {
                return mixer.clipAction(animation.name);
            }
        }
        return null;
    }

    public listAnimation(elementUuid: string | null = null): string[] {

        let mixerEl: Element | null = null;
        if (elementUuid) {
          // Local method
          mixerEl = document.querySelector(`[uuid="${elementUuid}"]`);
          if (!mixerEl) {
              throw new Error(`Element with UUID ${elementUuid} not found`);
          }
          mixerEl = mixerEl as any;

          const animations: any[] = (mixerEl as any).object3D?.animations || [];
          const animName = animations.map((anim) => anim.name);
          return animName;
        } else {
           // Default method
          let mixerEl = document.querySelector('#environment-scene').children[0] as any;
          const animations: any[] = mixerEl.object3D?.animations || [];
          const animName = animations.map((anim) => anim.name);
          return animName;
        }
    }

    public triggerAnimation(animName: string, action: TriggerAnimationAction = {}, triggerData: any = {}, senderId = null, transmit = true) {
        if (senderId === null) {
            if (transmit) {
                networkService.sendMessage(event, { animName, action, triggerData, senderId:mySenderId, transmit: false });
            }
        }

        if (senderId === mySenderId) {
            return;
        }
        
        let elementUuid = null;
        let mixerEl: Element | null = null;
        const animType = triggerData?.type;
        let targetBone: THREE.Object3D | null = null;
      
        if (triggerData?.elementUuid) {
          elementUuid = triggerData.elementUuid.replace(/.*_/, "");
        }

        if (elementUuid) {
            // Find the element by UUID
            mixerEl = document.querySelector(`[uuid="${elementUuid}"]`);
            if (!mixerEl) {
                //throw new Error(`Element with UUID ${elementUuid} not found`);
                return;
            }
        } else {
            // Default to the first child of the environment scene
            mixerEl = document.querySelector('#environment-scene')?.children[0] || null;
        }

        let actionAnimation = this.findAnimation(animName, mixerEl, !!elementUuid);
        if (!actionAnimation) {
            throw new Error(`Animation ${animName} not found`);
        }

        const repeat = action.repeat || 1;
        const onEnd = action.onEnd || 0;

        if (action.speed === undefined) {
            // Legacy support
            actionAnimation.setEffectiveTimeScale(1);
            actionAnimation.play();
            actionAnimation.reset();
            actionAnimation.originalTimeScale = 1;
        } else {
            if (action.mainclick !== undefined) {
                /*
                  New Button handling method
                */

                // ---->Main click
                let actionTrigger = action.mainclick.valueOf() as number;

                // [?] Is not moving or is paused
                if ((!actionAnimation.isRunning() || actionAnimation.getEffectiveTimeScale() === 0)
                // [?] First animation, or last one was different
                || (actionAnimation.lastAnimation !== animName)
                // [?] reclick functionality is undefined (for some reason)
                || action.reclick === undefined) {
                    //console.log("[Main click]")
                } else {
                    actionTrigger = action.reclick.valueOf() as number;

                    //console.log("[Re-click]")
                    if (actionTrigger === 0) {
                        actionTrigger = 4; // Pause
                    }
                }

                switch (actionTrigger) {
                    case 0: // Play or resume
                    case 1: // Reset and play again
                        if (actionTrigger === 0) {
                            //console.log("[Play/Resume]")
                        } else {
                            //console.log("[Reset and Play again]")
                        }

                        if (action.loop) {// Infinite loop
                            actionAnimation.setLoop(THREE.LoopRepeat);
                        } else if (action.repeat !== undefined) {
                            actionAnimation.setLoop(THREE.LoopRepeat, repeat);
                        }

                        actionAnimation.onEnd = onEnd.valueOf() as number;
                        let effectiveSpeed = action.speed.valueOf() as number;
                        if (actionAnimation.time === actionAnimation.getClip().duration && effectiveSpeed > 0) {
                            effectiveSpeed = -action.speed;
                            actionAnimation.onEnd = -1; // Force reset
                            actionAnimation.setLoop(THREE.LoopOnce);
                        }
                        this.setupOnEnd(actionAnimation, actionAnimation.onEnd);
                        
                        if (actionAnimation.lastAnimation !== animName
                            || ((!actionAnimation.isRunning()) && actionAnimation.getEffectiveTimeScale() !== 0)
                            || actionTrigger === 1) {
                            actionAnimation.reset();
                        }
                        setTimeout(() => {
                            //Wait a bit so "isRunning()" doesn't retroactively return true
                            actionAnimation.play();
                        }, 1);

                        actionAnimation.setEffectiveTimeScale(effectiveSpeed);
                        actionAnimation.originalTimeScale = effectiveSpeed;
                        actionAnimation.lastAnimation = animName;
                        
                        break;
                    case 2: // Stop and reset
                        actionAnimation.stop();
                        actionAnimation.reset();
                        actionAnimation.setEffectiveTimeScale(action.speed);
                        actionAnimation.originalTimeScale = 1;
                        actionAnimation.lastAnimation = undefined;
                        //actionAnimation.time
                        break;
                    case 3: // Do nothing
                        //console.log("[Do nothing]")
                        break;
                    case 4: // Pause
                        actionAnimation.setEffectiveTimeScale(0);
                        //console.log("[Pause]");
                        break;
                    case 5: // Lock to 1 animation or Force reverse if equal
                        if (animType && animType == "unhover") {
                            // If the last animation was the same as this one, force reverse from our current position, then reset+stop at the end
                            let effectiveSpeed = action.speed.valueOf() as number;
          
                            if (actionAnimation.lastAnimation === animName) {
                                actionAnimation.reset();
                                actionAnimation.time = actionAnimation.getClip().duration - 0.01;
                                // Play in reverse
                                //const effectiveSpeed = actionAnimation.getEffectiveTimeScale();
                                actionAnimation.setEffectiveTimeScale(-effectiveSpeed)
                                actionAnimation.play();
                                this.setupOnEnd(actionAnimation, 0); // Set up listener for resetting after loop back
                                actionAnimation.setLoop(THREE.LoopOnce)

                            } else {
                                actionAnimation.stop();
                                actionAnimation.reset();
                                actionAnimation.setEffectiveTimeScale(1);
                            }
                        } else {
                            // Stop+reset ALL other animations, and play this one from the start

                            // Stop any running animations on the same element
                            const mixer = (mixerEl as any).components["animation-mixer"]?.mixer;

                            // Local mixer only
                            if (mixer && elementUuid) {
                                mixer.stopAllAction();
                            }

                            // Reset and play the selected animation from the beginning
                            actionAnimation.reset();
                            actionAnimation.play();
                            actionAnimation.setEffectiveTimeScale(action.speed);
                            actionAnimation.setLoop(THREE.LoopOnce);

                            // Pause at the end
                            actionAnimation.onEnd = 1;
                            this.setupOnEnd(actionAnimation, 1);
                        }

                    actionAnimation.lastAnimation = animName;
                    break;
                }

                // Define this animation as the last one
                //actionAnimation.lastAnimation = animData;
                
            } else {
                /*
                  All this section is for the old way of handling animations
                */
                if (action.speed !== 0) {
                    if (action.loop) {// Infinite loop
                        actionAnimation.setLoop(THREE.LoopRepeat);
                    } else if (action.repeat !== undefined) {
                        actionAnimation.setLoop(THREE.LoopRepeat, repeat);
                    } else {
                        // Legacy support
                        actionAnimation.setLoop(THREE.LoopOnce);
                    }
                }


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
                    const animData = [{}, action.mainclick, action.speed, action.reclick, action.loop, action.repeat];

                    // Is not moving AND is unpaused
                    if ((!actionAnimation.isRunning() && actionAnimation.getEffectiveTimeScale() !== 0)
                        // First animation, or last one was different
                        || (actionAnimation.lastAnimation !== undefined
                            && JSON.stringify(actionAnimation.lastAnimation) !== JSON.stringify(animData))
                        // reclick functionality is undefined
                        || action.reclick === undefined) {
                        // This animation is NEW
                        actionAnimation.setEffectiveTimeScale(action.speed);
                        setTimeout(() => {
                            //Wait a bit so "isRunning()" doesn't retroactively return true
                            actionAnimation.play();
                        }, 1);
                        actionAnimation.reset();
                        actionAnimation.originalTimeScale = action.speed;
                        actionAnimation.lastAnimation = animData;
                        actionAnimation.onEnd = onEnd; // Set onEnd behavior
                        this.setupOnEnd(actionAnimation, onEnd);
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
    }

    private animationListeners: Map<any, Function> = new Map();

    private setupOnEnd(actionAnimation: any, onEnd: number) {
        const listener = (event) => {
            if (event.action === actionAnimation) {
                switch (onEnd) {
                    case -1: // Force reset
                    case 0: // Reset
                        actionAnimation.reset();
                        //actionAnimation.setEffectiveTimeScale(1);
                        actionAnimation.setEffectiveTimeScale(0);
                        actionAnimation.time = 0;
                        //actionAnimation.stop();
                        break;
                    case 1: // Pause
                        actionAnimation.reset();
                        actionAnimation.setEffectiveTimeScale(0);
                        // Set at the last frame
                        actionAnimation.time = actionAnimation.getClip().duration;
                        //actionAnimation.play();
                        break;
                    case 2: // Loop back
                        if (actionAnimation.getEffectiveTimeScale() > 0) {
                            actionAnimation.reset();
                            actionAnimation.time = actionAnimation.getClip().duration - 0.01;
                            // Play in reverse
                            const effectiveSpeed = actionAnimation.getEffectiveTimeScale();
                            actionAnimation.setEffectiveTimeScale(-effectiveSpeed)
                            actionAnimation.play();
                            this.setupOnEnd(actionAnimation, 0); // Set up listener for resetting after loop back
                            actionAnimation.setLoop(THREE.LoopOnce);
                        }
                        break;
                }
            }
        };

        // Remove any previous listener for this animation
        const previousListener = this.animationListeners.get(actionAnimation);
        if (previousListener) {
            actionAnimation.getMixer().removeEventListener('finished', previousListener);
        }

        // Store the new listener in the Map
        this.animationListeners.set(actionAnimation, listener);

        // Add the new listener
        actionAnimation.getMixer().addEventListener('finished', listener);
    }
}
