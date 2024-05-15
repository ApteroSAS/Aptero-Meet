/**
 * API to be used inside an iframe
 * 2 ways of acces the API:
 * 1. window.ROOM_API.test()
 * 2. using a post message
 */
import {SpawnHelperAPI} from "./SpawnHelperAPI";
import {AnimationControllerAPI} from "./AnimationControllerAPI";
import {MediaOptions, SpawnAttachConfig, TriggerAnimationAction} from "./FrontEndCommandAPI";

export class FrontEndAPI{
    spawnHelperAPI = new SpawnHelperAPI();
    animationControllerAPI = new AnimationControllerAPI();

    attachToWindow(){
        //this define the API that can be used by the parent window
        const listMapping = {
            echo: (data:string) => {return this.echo(data);},
            moveToWaypoint: (waypoint:string) => {return this.moveToWaypoint(waypoint);},
            spawnAttach: (data:any) => {return this.spawnAttach(data.mediaFrameName, data.url, data.config);},
            spawn: (data:any) => {return this.spawn(data.url, data.mediaOptions);},
            removeFromMediaFrame: (mediaFrameName:string) => {return this.removeFromMediaFrame(mediaFrameName);},
            triggerAnimation: (data:any) => {return this.triggerAnimation(data.animName, data.action);},
            describe: () => {return this.describe();}
        };

        (window as any).ROOM_API = {
            ...listMapping,
        }

        window.addEventListener('message', event => {
            const cmd = event.data?.command;
            if(cmd) {
                console.log("function message received",event.data)
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

    describe(){
        const objects = Array.from(document.querySelector('#environment-scene').querySelectorAll("a-entity"));
        const avatars = Array.from(document.querySelectorAll('#avatar-rig'))
        let result = [];
        const filterName = ["Floor_Plan","Ground_Plane","Skybox","scene-preview-camera"]
        const filterComponent = ["environment-settings","directional-light",'shape-helper__heightfield','nav-mesh']
        for (let objectEl of [...avatars,...objects]){
            const object = objectEl as any;
            const object3D = object.object3D;
            let name = object3D && object3D.name;
            if(object.components["player-info"]){
                name = "player"
            }
            if(name){
                const components = Object.keys(object3D.el?.components || {}) || [];
                if(filterName.includes(object3D.name)) continue;
                if(components.some((component) => filterComponent.includes(component))) continue;
                const q = object3D.getWorldDirection(new THREE.Vector3());
                const s = object3D.getWorldScale(new THREE.Vector3());
                const p = object3D.getWorldPosition(new THREE.Vector3());
                result.push({
                    name,
                    position: {x:p.x, y:p.y, z:p.z},
                    direction: {x:q.x, y:q.y, z:q.z},
                    scale: {x:s.x, y:s.y, z:s.z},
                    components
                });
            }
        }
        return {
            room:{
                id: window.APP.hub.hub_id,
                name: (window.APP?.hub as any)?.name
            },
            player:{
                name: window.APP?.store?.state?.profile?.displayName
            },
            objects:result,
            animation: this.animationControllerAPI.listAnimation()
        };
    }

    echo(data:string){
        console.log(":"+data);
        return data;
    }

    moveToWaypoint(waypoint:string){
        if(waypoint.startsWith("#")){
            waypoint = waypoint.slice(1);
        }
        window.history.pushState(null,null,`#${waypoint}`);
    }

    /**
     * ROOM_API.spawnAttach({url:"https://alphahub.aptero.co/files/820ed4a0-5f3f-440c-91eb-c61700da0c5c.jpg?token=04b56c3b8256db79559179732b1bf491",mediaFrameName:"MF1"});
     * @param mediaFrameName
     * @param url
     * @param config
     */
    spawnAttach(
        mediaFrameName:string,
        url:string,
        config: SpawnAttachConfig){
        this.spawnHelperAPI.spawnAttach(
            mediaFrameName,
            url,
            config
        ).catch((e) => {
            console.error(e);
        });
    }

    removeFromMediaFrame(mediaFrameName:string){
        this.spawnHelperAPI.removeFromMediaFrame(mediaFrameName).catch((e) => {
            console.error(e);
        });
    }

    /**
     * Spawn a media in front of the player
     * Usage example ROOM_API.spawn({url:"https://alphahub.aptero.co/files/820ed4a0-5f3f-440c-91eb-c61700da0c5c.jpg?token=04b56c3b8256db79559179732b1bf491"});
     * @param url
     * @param mediaOptions
     */
    spawn(url:string, mediaOptions?:MediaOptions){
        if(!url){
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
    triggerAnimation(animName:string,action:TriggerAnimationAction = {}){
        if(!animName){
            console.error("animName are required");
            return;
        }
        this.animationControllerAPI.triggerAnimation(animName,action);
    }

    /*openNewTab(url){
        window.open(url, "_blank");
    }

    openSidePanel(url){
        window.open(url, "_blank");
    }

    changeRoom(roomSID){

    }
    */

}