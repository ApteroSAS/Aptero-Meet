import {networkService} from "../HubsBridge/service/NetworkService";
import {TriggerAnimationAction} from "./FrontEndCommandAPI";

const event = "animation_play";

export class AnimationControllerAPI {
    private currentAnimationListener: any = null;

    constructor() {
    }

    init() {
        networkService.onMessage(event, ({body}) => {
            this.triggerAnimation(body.animName, body.action);
        });
    }

    findElement(name: string) {
        return document.querySelector(`.${name}`)
    }


    private findAnimation(animName: string, mixerEl: Element) {
        let mixer = mixerEl && (mixerEl as any).components["animation-mixer"].mixer;
        let actionAnimation = mixer.clipAction(animName);
        if (actionAnimation) return actionAnimation;
        for (const animation of (mixerEl as any).object3D.animations) {
            if (animation.name.includes(animName)) {
                return mixer.clipAction(animation.name);
            }
        }
        return null;
    }

    public listAnimation(): string[] {
        let mixerEl = document.querySelector('#environment-scene').children[0] as any;
        const animations: any[] = mixerEl.object3D?.animations || [];
        const animName = animations.map((anim) => anim.name);
        return animName;
    }

    public triggerAnimation(animName: string, action: TriggerAnimationAction = {}) {
        let mixerEl = document.querySelector('#environment-scene').children[0];
        let actionAnimation = this.findAnimation(animName, mixerEl);
        if (!actionAnimation) {
            throw new Error(`Animation ${animName} not found`);
        }
        networkService.sendMessage(event, { animName, action }); // plays on other instances

        const repeat = action.repeat || 1;
        const onEnd = action.onEnd || 0;

        if (this.currentAnimationListener) {
            actionAnimation.getMixer().removeEventListener('finished', this.currentAnimationListener);
            this.currentAnimationListener = null;
        }

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
                    console.log("[Main click]")
                } else {
                    actionTrigger = action.reclick.valueOf() as number;

                    console.log("[Re-click]")
                    if (actionTrigger === 0) {
                        actionTrigger = 4; // Pause
                    }
                }

                switch (actionTrigger) {
                    case 0: // Play or resume
                    case 1: // Reset and play again
                        if (actionTrigger === 0) {
                            console.log("[Play/Resume]")
                            console.log("[Properties] Speed: ", action.speed, "Loop: ", action.loop, "Repeat: ", action.repeat, "OnEnd: ", onEnd)
                        } else {
                            console.log("[Reset and Play again]")
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
                            console.log("[Force reset]")
                        }
                        this.setupOnEnd(actionAnimation, actionAnimation.onEnd);
                        
                        if (actionAnimation.lastAnimation !== animName
                            || ((!actionAnimation.isRunning()) && actionAnimation.getEffectiveTimeScale() !== 0)
                            || actionTrigger === 1) {
                            console.log("ANIMATION CHANGE / FRESH START")
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
                        console.log("[Stop and Reset]")
                        actionAnimation.stop();
                        actionAnimation.reset();
                        actionAnimation.setEffectiveTimeScale(action.speed);
                        actionAnimation.originalTimeScale = 1;
                        actionAnimation.lastAnimation = undefined;
                        actionAnimation.time
                        break;
                    case 3: // Do nothing
                        console.log("[Do nothing]")
                        break;
                    case 4: // Pause
                        actionAnimation.setEffectiveTimeScale(0);
                        console.log("[Pause]");
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

    private setupOnEnd(actionAnimation: any, onEnd: number) {
        const listener = (event) => {
            console.log("[Animation finished]",onEnd)
            if (event.action === actionAnimation) {
                switch (onEnd) {
                    case -1: // Force reset
                    case 0: // Reset
                        actionAnimation.reset();
                        actionAnimation.setEffectiveTimeScale(1);
                        actionAnimation.time = 0;
                        actionAnimation.stop();
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
                            console.log("[Loop back]");
                        }
                        break;
                }
                //actionAnimation.getMixer().removeEventListener('finished', listener);
            }
        };

        // Remove the current listener if it exists to prevent stacking
        if (this.currentAnimationListener) {
          actionAnimation.getMixer().removeEventListener('finished', this.currentAnimationListener);
        }
        this.currentAnimationListener = listener;
        actionAnimation.getMixer().addEventListener('finished', this.currentAnimationListener);
    }
}
