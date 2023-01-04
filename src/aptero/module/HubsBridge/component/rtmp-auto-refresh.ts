import HLS from "hls.js";
import axios from "axios";
import { propertiesService } from "../../properties/propertiesService";
//https://github.com/video-dev/hls.js/blob/master/docs/API.md#error-recovery-sample-code

declare const NAF;
declare const AFRAME;
export {};

AFRAME.registerComponent("rtmp-auto-refresh", {
  init() {
    let host = propertiesService.WOWZA_SERVICE_HOST ||"https://api2.aptero.co";
    this.errCallback = null;
    this.nominalCallback = null;
    this.waitMode = false;
    this.lastHls = null;
    this.interval = setInterval(() => {
      if (this.targetEl) {
        const components = this.targetEl.components;
        if (components["media-video"] && components["media-video"].videoTexture && components["media-video"].videoTexture.hls) {
          //In this par we manage error management when the stream has already been started in the room then interrupted
          const hls = components["media-video"].videoTexture.hls;
          if (hls !== this.lastHls) {
            console.log("RTMP setup hls wait stream listener");
            this.lastHls = hls;
            if (this.errCallback) {
              this.lastHls.off(HLS.Events.ERROR, this.errCallback);
            }
            if (this.nominalCallback) {
              this.lastHls.off(HLS.Events.FRAG_LOADED, this.nominalCallback);
            }
            this.errCallback = (event, data) => {
              this.waitMode = true;
              if (data.fatal) {
                switch (data.type) {
                  case HLS.ErrorTypes.NETWORK_ERROR:  //case Hls.ErrorTypes.NETWORK_ERROR:
                    console.log("fatal network error encountered, try to recover");
                    hls.startLoad();
                    break;
                  case HLS.ErrorTypes.MEDIA_ERROR: //case Hls.ErrorTypes.MEDIA_ERROR:
                    /*console.log("fatal media error encountered, try to recover");
                    hls.recoverMediaError();*/
                    /* ignore will be treated by HLS wait*/
                    break;
                  default:
                    hls.destroy();
                    break;
                }
              }
            };
            this.nominalCallback = () => {
              this.waitMode = false;
            };
            hls.on(HLS.Events.ERROR, this.errCallback);
            hls.on(HLS.Events.FRAG_LOADED, this.nominalCallback);
          }
          if (this.waitMode) {
            console.log("HLS wait");
            hls.recoverMediaError();
            //components["media-loader"].update(components["media-loader"].data, true);
          } else {
            //console.log("HLS nominal");
            /*nothing*/
          }
        } else if (components["media-loader"]) {
          this.targetEl.setAttribute("visible", false);
          //In this par we manage error management when the stream has never been started in the room
          //https://api2.aptero.co/service/wowza/ping?url=https://cdn3.wowza.com/1/MGJtWTJCNmlMYlo0/VXBMK3c3/hls/live/playlist.m3u8
          try {
            // Otherwise fall back to hard resolve-level refresh which should work for any media
            let streamUrl = components["media-loader"].data.src;
            if(streamUrl.indexOf("wowza") !== -1) {
              axios.get(host + "/service/wowza/ping?url=" + streamUrl).then((resp) => {
                console.log("RTMP polling :" + resp.data);
                if (resp.data === true) {
                  this.targetEl.setAttribute("visible", true);
                  components["media-loader"].update(components["media-loader"].data, true);
                }
              }).catch(() => {
                /*ignore*/
              });
            }else{
              axios.get(streamUrl).then((resp) => {
                if(resp.status === 200) {
                  this.targetEl.setAttribute("visible", true);
                  components["media-loader"].update(components["media-loader"].data, true);
                }
              }).catch(() => {
                /*ignore*/
              });
            }
          } catch (e) {
            /*ignore*/
          }
        }
      } else {
        console.log("RTMP grab network");
        //const c = this.el.components;
        //c["media-loader"].refresh();
        NAF.utils
          .getNetworkedEntity(this.el)
          .then(networkedEl => (this.targetEl = networkedEl));
      }
    }, 4000);
  },

  remove() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (this.lastHls) {
      this.lastHls.off(HLS.Events.ERROR, this.errCallback);
      this.lastHls.off(HLS.Events.FRAG_LOADED, this.nominalCallback);
    }
  }

});
