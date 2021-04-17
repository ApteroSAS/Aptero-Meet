import { filterServer } from "./twilio";

class MinimumQualityService {

    /* 
    check udp connexion
    check mic activities
    check fps activities
    */

    globalIssueDetected = {
        "fps-issue":false,
        "turn-udp-issue":false,
        "turn-tcp-issue":false,
        "mic-activity-issue":false,
        "has-reloaded-issue":false,
    };

    constructor(){
        this.notifyMicChanged();//for default mic
    }

    getCheckStatus(){
        return this.globalIssueDetected;
    }

    getErrorDetected(){
        let issue = false;
        Object.keys(this.globalIssueDetected).forEach(key => {
            if(this.globalIssueDetected[key]){
                issue = true;
            }
        });
        return issue;
    }

    async checkTurnServerAndSwitchToTCP(iceServer){
        let filterServer1 = filterServer(iceServer,false);
        let udpOk = await this.checkTurnServer(filterServer1);
        if(!udpOk){
            this.globalIssueDetected["turn-udp-issue"]=true;
            console.warn("turn-udp-issue detected");
            let filterServer1 = filterServer(iceServer,true);
            let tcpOk = await this.checkTurnServer(filterServer1);
            if(!tcpOk){
                this.globalIssueDetected["turn-tcp-issue"]=true;
                console.warn("turn-tcp-issue detected");
            }
            //troubleshoot
            //if tcp is ok we restart the page in tcp mode
            if(!udpOk && tcpOk){
                console.warn("switching to TCP mode");
                const url = new URL(window.location.toString());
                if(!url.searchParams.get("force_tcp")) {
                    url.searchParams.set("force_tcp", true);
                    window.location.href = url.toString();
                }
            }
        }else{
            /* everythings good*/
        }
    }

    async checkTurnServer(iceServers, timeout) {
        return new Promise((resolve, reject) => {
            let promiseResolved = false;
            setTimeout( () => {
                if (promiseResolved) return;
                resolve(false);
                promiseResolved = true;
            }, timeout || 3000);

            let myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection   //compatibility for firefox and chrome
            let pc = new myPeerConnection({ iceServers: iceServers })
            let noop = function () { };
            pc.createDataChannel("");    //create a bogus data channel
            pc.createOffer(function (sdp) {
                if (sdp.sdp.indexOf('typ relay') > -1) { // sometimes sdp contains the ice candidates...
                    promiseResolved = true;
                    resolve(true);
                }
                pc.setLocalDescription(sdp, noop, noop);
            }, noop);    // create offer and set local description
            pc.onicecandidate = (ice) => {  //listen for candidate events
                if (promiseResolved || !ice || !ice.candidate || !ice.candidate.candidate || !(ice.candidate.candidate.indexOf('typ relay') > -1)) return;
                promiseResolved = true;
                resolve(true);
            };
        });
    }

    MIN_VOLUME_THRESHOLD = 0.0075;
    notifyMicLevel(micLevel) {
        if(micLevel>this.MIN_VOLUME_THRESHOLD){
            console.log(micLevel);
            this.globalIssueDetected["mic-activity-issue"]=false;
        }
    }

    notifyMicChanged() {
        this.globalIssueDetected["mic-activity-issue"]=true;
    }
}

export const minimumQualityService = new MinimumQualityService();