/**
 * API to be used inside an iframe
 * 2 ways of acces the API:
 * 1. window.ROOM_API.test()
 * 2. using a post message
 */
import {SpawnHelperAPI} from "./SpawnHelperAPI";
import {AnimationControllerAPI} from "./AnimationControllerAPI";
import {MediaOptions, SpawnAttachConfig, TriggerAnimationAction} from "./FrontEndCommandAPI";
import {propertiesService} from "../properties/propertiesService";
import axios from "axios";

export class FrontEndAPI {
    spawnHelperAPI = new SpawnHelperAPI();
    animationControllerAPI = new AnimationControllerAPI();

    describe() {
        const objects = Array.from(document.querySelector('#environment-scene').querySelectorAll("a-entity"));
        const avatars = Array.from(document.querySelectorAll('#avatar-rig'))
        let result = [];
        const filterName = ["Floor_Plan", "Ground_Plane", "Skybox", "scene-preview-camera"]
        const filterComponent = ["environment-settings", "directional-light", 'shape-helper__heightfield', 'nav-mesh']
        for (let objectEl of [...avatars, ...objects]) {
            const object = objectEl as any;
            const object3D = object.object3D;
            let name = object3D && object3D.name;
            if (object.components["player-info"]) {
                name = "player"
            }
            if (name) {
                const components = Object.keys(object3D.el?.components || {}) || [];
                if (filterName.includes(object3D.name)) continue;
                if (components.some((component) => filterComponent.includes(component))) continue;
                const q = object3D.getWorldDirection(new THREE.Vector3());
                const s = object3D.getWorldScale(new THREE.Vector3());
                const p = object3D.getWorldPosition(new THREE.Vector3());
                result.push({
                    name,
                    position: {x: p.x, y: p.y, z: p.z},
                    direction: {x: q.x, y: q.y, z: q.z},
                    scale: {x: s.x, y: s.y, z: s.z},
                    components
                });
            }
        }
        return {
            room: {
                id: window.APP.hub.hub_id,
                name: (window.APP?.hub as any)?.name
            },
            player: {
                name: window.APP?.store?.state?.profile?.displayName
            },
            objects: result,
            animation: this.animationControllerAPI.listAnimation()
        };
    }

    echo(data: string) {
        console.log(":" + data);
        return data;
    }

    moveToWaypoint(waypoint: string) {
        if (waypoint.startsWith("#")) {
            waypoint = waypoint.slice(1);
        }
        window.history.pushState(null, null, `#${waypoint}`);
    }

    /**
     * ROOM_API.spawnAttach({url:"https://alphahub.aptero.co/files/820ed4a0-5f3f-440c-91eb-c61700da0c5c.jpg?token=04b56c3b8256db79559179732b1bf491",mediaFrameName:"MF1"});
     * @param mediaFrameName
     * @param url
     * @param config
     */
    async spawnAttach(
        mediaFrameName: string,
        url: string,
        config: SpawnAttachConfig) {
        return this.spawnHelperAPI.spawnAttach(
            mediaFrameName,
            url,
            config
        ).catch((e) => {
            console.error(e);
        });
    }

    async removeFromMediaFrame(mediaFrameName: string) {
        return this.spawnHelperAPI.removeFromMediaFrame(mediaFrameName).catch((e) => {
            console.error(e);
        });
    }

    /**
     * Spawn a media in front of the player
     * Usage example ROOM_API.spawn({url:"https://alphahub.aptero.co/files/820ed4a0-5f3f-440c-91eb-c61700da0c5c.jpg?token=04b56c3b8256db79559179732b1bf491"});
     * @param url
     * @param mediaOptions
     */
    spawn(url: string, mediaOptions?: MediaOptions) {
        if (!url) {
            console.error("url is required");
            return;
        }
        this.spawnHelperAPI.spawnMediaInfrontOfPlayer(url, mediaOptions);
    }

    /**
     * ROOM_API.triggerAnimation({elName:"AptAnim",animName:"apAnim"})
     * @param elName
     * @param animName
     * @param action
     */
    triggerAnimation(animName: string, action: TriggerAnimationAction = {}) {
        if (!animName) {
            console.error("animName are required");
            return;
        }
        this.animationControllerAPI.triggerAnimation(animName, action);
    }

    async notifyUserActionToAi(actionDescription: string, triggerAI: boolean = true,context:any) {
        console.log("notifyUserActionToAi", actionDescription,context);
        const payload = {
            roomid: window.APP.hub.hub_id,
            description: actionDescription,
            reaction: triggerAI,
            context:context
        };
        //await axios.post("https://meet.aptero.co/service/chatgpt/api/notifyRoomAction", payload)
        await axios.post("http://localhost:3000/service/chatgpt/api/notifyRoomAction", payload)//TODO: remove this line
        if (triggerAI) {
            const iframes = Array.from(document.querySelectorAll<HTMLIFrameElement>('iframe'));
            for (const iframe of iframes) {
                iframe.contentWindow?.postMessage({
                    command: "externalTrigger",
                    message: null,
                }, "*");
            }
        }
    }

}

export const roomApi = new FrontEndAPI();

export function attachRoomAPIToWindow() {
    //this define the API that can be used by the parent window
    const listMapping = {
        echo: (data: string) => {
            return roomApi.echo(data);
        },
        moveToWaypoint: (waypoint: string) => {
            return roomApi.moveToWaypoint(waypoint);
        },
        spawnAttach: (data: any) => {
            return roomApi.spawnAttach(data.mediaFrameName, data.url, data.config);
        },
        spawn: (data: any) => {
            return roomApi.spawn(data.url, data.mediaOptions);
        },
        removeFromMediaFrame: (mediaFrameName: string) => {
            return roomApi.removeFromMediaFrame(mediaFrameName);
        },
        triggerAnimation: (data: any) => {
            return roomApi.triggerAnimation(data.animName, data.action);
        },
        describe: () => {
            return roomApi.describe();
        }
    };

    (window as any).ROOM_API = {
        ...listMapping,
    }

    window.addEventListener('message', event => {
        const cmd = event.data?.command;
        if (cmd) {
            console.log("function message received", event.data)
            if (listMapping[cmd]) {
                const ret = listMapping[cmd](event.data.data);
                // Sending the response back to the parent window
                event.source.postMessage({
                    id: event.data.id,
                    response: ret
                }, {
                    targetOrigin: event.origin
                }); // Ensure to use event.origin for security
            } else {
                // Optionally handle the case where the command is not found
                event.source.postMessage({
                    id: event.data.id,
                    error: 'Command not found'
                }, {
                    targetOrigin: event.origin
                });
            }
        }
    });
}