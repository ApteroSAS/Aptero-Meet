/**
 * API to be used inside an iframe
 * 2 ways of acces the API:
 * 1. window.ROOM_API.test()
 * 2. using a post message
 */
import {SpawnHelperAPI} from "./SpawnHelperAPI";
import {AnimationControllerAPI} from "./AnimationControllerAPI";


export class FrontEndAPIIframe {
    private sendCommandToParent(command: string, data: any) {
        //window.parent.postMessage({ command:"ping", data:"ph" }, '*');
        window.parent.postMessage({ command, data }, '*');
    }

    echo(data: string) {
        this.sendCommandToParent('echo', data);
    }

    /** eg with parameter '#WayPoint3' in opal it must have the Waypoint3 name **/
    moveToWaypoint(waypoint: string) {
        this.sendCommandToParent('moveToWaypoint', waypoint);
    }

    spawnAttach(mediaFrameName: string, url: string, config: any) {
        this.sendCommandToParent('spawnAttach', { mediaFrameName, url, config });
    }

    spawn(url: string, mediaOptions: any) {
        this.sendCommandToParent('spawn', { url, mediaOptions });
    }

    removeFromMediaFrame(mediaFrameName: string) {
        this.sendCommandToParent('removeFromMediaFrame', mediaFrameName);
    }

    triggerAnimation(elName: string, animName: string, action: any) {
        this.sendCommandToParent('triggerAnimation', { elName, animName, action });
    }

}

export class FrontEndAPI{
    spawnHelperAPI = new SpawnHelperAPI();
    animationControllerAPI = new AnimationControllerAPI();

    attachToWindow(){
        //this define the API that can be used by the parent window
        const listMapping = {
            echo: (data:string) => {this.echo(data);},
            moveToWaypoint: (waypoint:string) => {this.moveToWaypoint(waypoint);},
            spawnAttach: (data:any) => {this.spawnAttach(data.mediaFrameName, data.url, data.config);},
            spawn: (data:any) => {this.spawn(data.url, data.mediaOptions);},
            removeFromMediaFrame: (mediaFrameName:string) => {this.removeFromMediaFrame(mediaFrameName);},
            triggerAnimation: (data:any) => {this.triggerAnimation(data.elName, data.animName, data.action);},
        };

        (window as any).ROOM_API = {
            ...listMapping,
        }

        window.addEventListener('message', event => {
            const cmd = event.data.command;
            if (listMapping[cmd]) {
                listMapping[cmd](event.data.data);
            }
        });
    }

    echo(data:string){
        console.log(":"+data);
    }

    moveToWaypoint(waypoint:string){
        window.history.pushState(null,null,waypoint);
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
        config: {
            audio?: {
                distanceModel: string;
                rolloffFactor: number;
                refDistance: number;
                maxDistance: number;
                coneInnerAngle: number;
                coneOuterAngle: number;
                coneOuterGain: number
            },
            pin?:boolean,
            attribute?:any
        }){
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
    spawn(url:string, mediaOptions?:{
        distanceModel?: string;
        rolloffFactor?: number;
        refDistance?: number;
        maxDistance?: number;
        coneInnerAngle?: number;
        coneOuterAngle?: number;
        coneOuterGain?: number
    }){
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
    triggerAnimation(elName:string,animName:string,action:{
        speed?: number,
        reclick?: number,
        loop?: boolean,
        repeat?: number,
        data?: any
    } = {}){
        if(!elName || !animName){
            console.error("elName and animName are required");
            return;
        }
        this.animationControllerAPI.triggerAnimation(elName,animName,action);
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