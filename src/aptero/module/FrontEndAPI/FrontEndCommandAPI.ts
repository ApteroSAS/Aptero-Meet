export interface TriggerAnimationAction {
    speed?: number, /** speed of the animation default to 1**/
    mainclick?: 0 | 1 | 2 | 3, /** 0: play or resume, 1: reset and play again, 2: stop and reset the animation, 3: do nothing **/
    reclick?: 0 | 1 | 2 | 3, /** 0: pause, 1: reset and play again, 2: stop and reset the animation, 3 do nothing **/
    loop?: boolean, /** loop the animation infinite amount of time default to false**/
    repeat?: number,/** number of time the animation should be repeated default to 1**/
}

export interface MediaOptions {
    distanceModel?: string; /** "linear", "inverse", "exponential" default to "linear"**/
    rolloffFactor?: number;
    refDistance?: number;
    maxDistance?: number;
    coneInnerAngle?: number;
    coneOuterAngle?: number;
    coneOuterGain?: number
}

export interface SpawnAttachConfig {
    audio?: MediaOptions,
    pin?: boolean,
    attribute?: any
}

export class FrontEndCommandAPI {
    private sendCommandToParent(command: string, data: any) {
        window.parent.postMessage({command, data}, '*');
    }

    /** display a message in the console (used for debug) **/
    echo(data: string) {
        this.sendCommandToParent('echo', data);
    }

    /** eg with parameter '#WayPoint3' in opal it must have the Waypoint3 name **/
    moveToWaypoint(waypoint: string) {
        this.sendCommandToParent('moveToWaypoint', waypoint);
    }

    /**
     * Spawn a media (image, video, audio) ant attach it to the designated a media frame
     * @param mediaFrameName the name of the media frame in Opal
     * @param url the url of the media (eg https://domain.com/files/820ed4a0-5f3f-440c-91eb-c61700da0c5c.jpg)
     * @param config
     */
    spawnAttach(mediaFrameName: string, url: string, config: SpawnAttachConfig) {
        this.sendCommandToParent('spawnAttach', {mediaFrameName, url, config});
    }

    /**
     * Spawn a media in front of the player
     * @param url the url of the media (eg https://domain.com/files/820ed4a0-5f3f-440c-91eb-c61700da0c5c.jpg)
     * @param mediaOptions audio media options (only used in case the spawned media has an audio)
     */
    spawn(url: string, mediaOptions: MediaOptions) {
        this.sendCommandToParent('spawn', {url, mediaOptions});
    }

    /**
     * Remove a media from a media frame
     * @param mediaFrameName the name of the media frame in Opal
     */
    removeFromMediaFrame(mediaFrameName: string) {
        this.sendCommandToParent('removeFromMediaFrame', mediaFrameName);
    }

    /** trigger an animation on an element the element is the name given in Opal
     * and the animation name must exist in the glb with the given name
     * @param elName the name of the element in Opal
     * @param animName the name of the animation in the glb
     * @param action the action to be performed on the animation
     * **/
    triggerAnimation(elName: string, animName: string, action: TriggerAnimationAction) {
        this.sendCommandToParent('triggerAnimation', {elName, animName, action});
    }

}