import { propertiesService } from "../properties/propertiesService";
import axios from "axios";

export class RemoteControlServiceV2 {

    remoteScreenSessionIdMap = {};
    remoteScreenSessionRfbMap = {};
    lastMoveTime = 0;
    screenSize={};
    lastX=0;
    lastY=0;
    lastSessionID = "";

    getNewRemoteSessionID() {
        return window.APP.store.credentialsAccountId?window.APP.store.credentialsAccountId:("anonymous"+Math.floor(Math.random()*10000000));
    }

    async generateFallBackUrl(urlToProxy,userId){
        urlToProxy = urlToProxy || window.location.href
        let tutoURL = "https://meet.aptero.co/service/remote/orchestrator/static/tutoRedirect.html?url="+urlToProxy;
        let resp = await axios.post(propertiesService.PROTOCOL + propertiesService.REMOTE_VM_SERVICE.url + "/service/remote/orchestrator/getStreamApp", {
            "userId":userId || this.getNewRemoteSessionID(),
            "sessionContext":tutoURL
        });
        resp=resp.data;
        let streamingURLBase64 = resp.StreamingURLBase64;
        return "https://meet.aptero.co/service/remote/orchestrator/static/embed-app.html?q="+streamingURLBase64;
    }

    async getScreen(screenElement,data){
        /*let data = {
            localSessionID: NAFscreenID,
            remoteScreenSessionId: remoteScreenSessionId,
            screenSizeX:width,
            screenSizeY:height,
            startUrl:startUrl
        }*/

        this.screenSize[data.remoteScreenSessionId]={
            width:data.screenSizeX,
            height:data.screenSizeY
        };
        this.remoteScreenSessionIdMap[data.localSessionID]=data.remoteScreenSessionId;
        return new Promise((resolve, reject) => {
            axios.post(propertiesService.PROTOCOL + propertiesService.REMOTE_VM_SERVICE.url + "/service/remote/orchestrator/create", data).then(async resp => {
                resp=resp.data;
                resp.url = "wss://" + propertiesService.REMOTE_VM_SERVICE.url+"/reverse/"+resp.ip+"/"+resp.port+"/websockify";
                let RFB = (await import('@novnc/novnc/core/rfb')).default
                let rfb = new RFB( screenElement.children[0], resp.url);
                this.remoteScreenSessionRfbMap[data.remoteScreenSessionId] = rfb;
                await new Promise((resolve, reject) => {
                    let desktopName="ERROR";
                    rfb.addEventListener("connect",  ()=>{
                        console.log("Connected to " + desktopName)
                        resolve(desktopName);
                    });
                    rfb.addEventListener("disconnect", (e) => {
                        if (e.detail.clean) {
                            console.log("Disconnected");
                        } else {
                            reject("Something went wrong");
                            console.error("Something went wrong, connection is closed",e);
                        }
                    });
                    rfb.addEventListener("credentialsrequired", (e) => {
                        const password = prompt("Password Required:");
                        rfb.sendCredentials({ password: password });
                    });
                    rfb.addEventListener("desktopname", (e) => {
                        desktopName = e.detail.name;
                    });
                });
                resolve(rfb);
            }).catch(reason => {
                reject(reason);
            });
        })
    }

    registerEventOnElement(el) {
        el.object3D.addEventListener("interact", this.onInteract);
        el.object3D.addEventListener("hovered", ()=>{console.log("hovered")});
        el.object3D.addEventListener("unhovered", ()=>{console.log("unhovered")});
    }

    onInteract = (e) => {
        //https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
        this.remoteScreenSessionRfbMap[this.lastSessionID]._handleMouseButton(this.lastX, this.lastY, true, 1);
        this.remoteScreenSessionRfbMap[this.lastSessionID]._handleMouseButton(this.lastX, this.lastY, false, 1);
    };

    updateCursorPosition(remoteScreenSessionId, mouseRatioX, mouseRatioY) {
        this.lastSessionID = remoteScreenSessionId;
        let mouseX = this.screenSize[remoteScreenSessionId].width * mouseRatioX;
        let mouseY = this.screenSize[remoteScreenSessionId].height * (mouseRatioY-1)*-1;
        this.lastX =mouseX;
        this.lastY =mouseY;
        this.remoteScreenSessionRfbMap[remoteScreenSessionId]._handleMouseMove(mouseX,mouseY);
    }

    tryCaptureCursor(intersection) {
        if (intersection) {
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
        }
    }
}

export const remoteControlServiceV2 = new RemoteControlServiceV2();


