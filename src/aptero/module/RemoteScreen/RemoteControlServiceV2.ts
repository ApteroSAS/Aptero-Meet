import { propertiesService } from "../properties/propertiesService";
import axios from "axios";

export const IN_APP_WEB_BROWSER_PROTOCOL = "web-browser:";
export const IN_APP_WEB_BROWSER_TRAIL = "/web-browser.mp4";

declare const NAF;
declare const THREE;
declare const window;

export const processWebBrowserEntity = (entity, mediaOptions) => {
    let objJsonStr = JSON.stringify({
        sessionID:mediaOptions.webBrowser.sessionID,
        startUrl:"https://google.com",
        width:1024,
        height:512,
    });
    //let metaData = Buffer.from(objJsonStr).toString("base64");
    let encoded = btoa(objJsonStr);
    entity.setAttribute("media-loader", { src: IN_APP_WEB_BROWSER_PROTOCOL + encoded + IN_APP_WEB_BROWSER_TRAIL });
};

/*export const proxyURL = (url) => {
    if (url.startsWith("hubs:")) return url;
    if (url.startsWith("https:")) return url;
    if (url.startsWith(IN_APP_WEB_BROWSER_PROTOCOL)) return url;
    return null;
};*/

export const remoteWebBrowser = async (screenElement,texture,mediaData) => {
    let screenSRC = mediaData.src;
    screenSRC = screenSRC.replace(IN_APP_WEB_BROWSER_PROTOCOL,"");
    screenSRC = screenSRC.replace(IN_APP_WEB_BROWSER_TRAIL,"");
    let metaData = JSON.parse(atob(screenSRC));
    let remoteScreenSessionId = metaData.sessionID;


    let screenId = await new Promise((resolve) => {
        NAF.utils.getNetworkedEntity(screenElement).then(networkedEl => {
            //hovered
            //unhovered
            delete screenElement.components["hover-menu__video"];
            let screenId = networkedEl.components.networked.data.networkId;
            //singleActionButton:true;
            //remoteControlService.registerEventOnElement(screenElement);
            screenElement.setAttribute("tags","singleActionButton: true;");
            resolve(screenId);
        });
    });
    let connexionInfo = {
        localSessionID: screenId,
        remoteScreenSessionId: remoteScreenSessionId,
        screenSizeX:metaData.width,
        screenSizeY:metaData.height,
        metaData:metaData
    };
    let rfb:any = await remoteControlServiceV2.getScreen(screenElement,connexionInfo);
    remoteControlServiceV2.registerEventOnElement(screenElement);

    // Setup a POT canvas
    let canvas = rfb._canvas;
    canvas.width = metaData.width || 1024;
    canvas.height = metaData.height || 512;
    texture = new THREE.Texture(canvas);

    texture.isVideoTexture = true;
    texture.image.duration = Infinity;
    texture.image.play = () => { return Promise.resolve(true)};
    texture.update = ()=>{
        texture.needsUpdate = true;
    };
    return texture;
};

export class RemoteControlServiceV2 {

    remoteScreenSessionIdMap = {};
    remoteScreenSessionRfbMap = {};
    lastMoveTime = 0;
    screenSize={};
    lastX=0;
    lastY=0;
    lastSessionID = "";

    async start(){
        setInterval(()=>{
            try {
                //send all heart beat
                Object.keys(this.remoteScreenSessionRfbMap).forEach(async sid => {
                    await axios.get(propertiesService.PROTOCOL + propertiesService.REMOTE_VM_SERVICE.url + "/service/remote/orchestrator/heart/beat/"+sid);
                });
            }catch (e) {
                console.warn(e);
                /* do not throw error for heart beat log only*/
            }
        },5*60*1000);
    }

    getNewRemoteSessionID() {
        return window.APP.store.credentialsAccountId?window.APP.store.credentialsAccountId:("anonymous"+Math.floor(Math.random()*10000000));
    }

    async generateFallBackUrl(urlToProxy,userId){
        urlToProxy = urlToProxy || window.location.href;
        let theURL= new URL('https://meet.aptero.co/service/remote/orchestrator/static/app/embed-app-v2.html');
        theURL.searchParams.set("q",btoa(urlToProxy));
        theURL.searchParams.set("u",userId || this.getNewRemoteSessionID());
        return theURL.toString();
    }

    async getScreen(screenElement,data){
        /*let data = {
            localSessionID: NAFscreenID,
            remoteScreenSessionId: remoteScreenSessionId,
            screenSizeX:width,
            screenSizeY:height,
            metaData:metaData
        }*/
        let password = null;
        try {
            password = data.metaData.imageParams.PASSWORD;
        }catch (er){ /* ignore error */ }
        this.screenSize[data.remoteScreenSessionId]={
            width:data.screenSizeX,
            height:data.screenSizeY
        };
        this.remoteScreenSessionIdMap[data.localSessionID]=data.remoteScreenSessionId;
        return new Promise((resolve, reject) => {
            axios.post(propertiesService.PROTOCOL + propertiesService.REMOTE_VM_SERVICE.url + "/service/remote/orchestrator/create", data).then(async (resp:any) => {
                resp=resp.data;
                resp.url = "wss://" + propertiesService.REMOTE_VM_SERVICE.url+"/reverse/"+resp.ip+"/"+resp.port+"/websockify";
                const rfb = await this.createRBF(screenElement.children[0],resp.url,{ credentials: { password: password } });
                this.remoteScreenSessionRfbMap[data.remoteScreenSessionId] = rfb;
                resolve(rfb);
            }).catch(reason => {
                reject(reason);
            });
        })
    }

    async createRBF(el,url,options){
        let RFB = (await import('@novnc/novnc/core/rfb')).default;
        let rfb = new RFB(el, url,options);
        await new Promise((resolve, reject) => {
            let desktopName="ERROR";
            rfb.addEventListener("connect",  ()=>{
                console.log("Connected to " + desktopName);
                resolve(desktopName);
            });
            rfb.addEventListener("disconnect", (e) => {
                if (e.detail.clean) {
                    console.log("Disconnected");
                    //connection lost but url still here try to reconnect
                } else {
                    reject("Something went wrong");
                    console.error("Something went wrong, connection is closed",e);
                }
            });
            rfb.addEventListener("credentialsrequired", () => {
                const password = prompt("Password Required:");
                rfb.sendCredentials({ password: password });
            });
            rfb.addEventListener("desktopname", (e) => {
                desktopName = e.detail.name;
            });
        });
        return rfb;
    }

    registerEventOnElement(el) {
        el.object3D.addEventListener("interact", this.onInteract);
        el.object3D.addEventListener("hovered", ()=>{console.log("hovered")});
        el.object3D.addEventListener("unhovered", ()=>{console.log("unhovered")});
    }

    onInteract = () => {
        //https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
        this.remoteScreenSessionRfbMap[this.lastSessionID]._handleMouseButton(this.lastX, this.lastY, true, 1);
        this.remoteScreenSessionRfbMap[this.lastSessionID]._handleMouseButton(this.lastX, this.lastY, false, 1);
    };

    updateCursorPosition(remoteScreenSessionId, mouseRatioX, mouseRatioY) {
        this.lastSessionID = remoteScreenSessionId;
        if(this.remoteScreenSessionRfbMap[remoteScreenSessionId]) {
            let mouseX = this.screenSize[remoteScreenSessionId].width * mouseRatioX;
            let mouseY = this.screenSize[remoteScreenSessionId].height * (mouseRatioY - 1) * -1;
            this.lastX = mouseX;
            this.lastY = mouseY;
            this.remoteScreenSessionRfbMap[remoteScreenSessionId]._handleMouseMove(mouseX, mouseY);
        }
    }

    tryCaptureCursor(intersection) {
        return;
        //NOTE modification needed to make it work code deprecated
        /*if (intersection) {
            if (intersection?.object?.el?.components["media-video"]?.el === intersection?.object?.el) { // check type of object
                NAF.utils
                    .getNetworkedEntity(intersection.object.el)
                    .then(networkedEl => {
                        let screenId = networkedEl.components.networked.data.networkId; // id screen
                        if (this.remoteScreenSessionIdMap[screenId]) {
                            if (new Date().getTime() - this.lastMoveTime < 50) {
                                return;
                            }
                            this.lastMoveTime = new Date().getTime();
                            let mouseRatioX = intersection?.uv?.x;
                            let mouseRatioY = intersection?.uv?.y;
                            this.updateCursorPosition(this.remoteScreenSessionIdMap[screenId], mouseRatioX, mouseRatioY);
                        }
                    });
            }
        }*/
    }
}

export const remoteControlServiceV2 = new RemoteControlServiceV2();


