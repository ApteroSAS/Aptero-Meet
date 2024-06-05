interface SpawnAttachAction {
    type: "spawn_attach";
    url: string;
    mediaFrame: string;
    attributes?: string;
}

interface RemoveFromMediaFrameAction {
    type: "remove_from_media_frame";
    mediaFrame: string;
}

interface SpawnAction {
    type: "spawn";
    url: string;
}

interface AnimationAction {
    type: "animation";
    data: string; /** name of the animation to trigger**/
    speed?: number, /** speed of the animation default to 1**/
    mainclick?: 0 | 1 | 2 | 3, /** 0: play or resume, 1: reset and play again, 2: stop and reset the animation, 3: do nothing **/
    reclick?: 0 | 1 | 2 | 3, /** 0: pause and resume, 1: reset and play again, 2: stop and reset the animation, 3 do nothing **/
    onEnd?: 0 | 1 | 2 /** (On animation end) 0: Reset, 1: Pause, Loop back **/
    loop?: boolean, /** loop the animation infinite amount of time default to false**/
    repeat?: number,/** number of time the animation should be repeated default to 1**/
}

interface UrlAction {
    type: "url";
    url: string;
    mode?: string | null;
    data?: string;
    config?: object;
}

interface SidebarIframeAction {
    type: "sidebar_iframe";
    url: string;
    title?: string;
}

interface AiAction {
    type: "ai_action";
    description: string;
    triggerReaction?: boolean;
}

export type Action =
    | SpawnAttachAction
    | RemoveFromMediaFrameAction
    | SpawnAction
    | AnimationAction
    | UrlAction
    | SidebarIframeAction
    | AiAction
    ;