import {
    pinEntity,
    spawnMedia, spawnMediaInfrontOfPlayer,
    unpinEntity
} from "../HubsBridge/utils/Media";
import {MediaOptions, SpawnAttachConfig} from "./FrontEndCommandAPI";

declare let NAF: any;

export class SpawnHelperAPI {

    private getMediaOptionSetting(config: {
        audio?: MediaOptions}): MediaOptions {
        if (config && config.audio) {
            return {
                distanceModel: config.audio.distanceModel,
                rolloffFactor: config.audio.rolloffFactor,
                refDistance: config.audio.refDistance,
                maxDistance: config.audio.maxDistance,
                coneInnerAngle: config.audio.coneInnerAngle,
                coneOuterAngle: config.audio.coneOuterAngle,
                coneOuterGain: config.audio.coneOuterGain
            };
        } else {
            return null;
        }
    }

    private async convertToNetEntity(entity) {
        return new Promise(async (resolve) => {
            NAF.utils.getNetworkedEntity(entity).then(networkedEl => {
                if (!NAF.utils.isMine(networkedEl)) {
                    NAF.utils.takeOwnership(networkedEl);
                }
                resolve(networkedEl);
            });
        });
    }

    private onReady(entity, callback) {
        //if (entity.getObject3D("mesh") && entity.getObject3D("mesh").scale) {
        //  callback();
        //} else {
        let promises = [];
        promises.push(new Promise((resolve) => {
            entity.addEventListener("media-loaded", resolve);
        }));
        if (entity.components["media-video"]) {
            promises.push(new Promise((resolve) => {
                entity.addEventListener("video-loaded", resolve);
            }));
        }
        const timeout = new Promise((resolve) => {
            setTimeout(resolve, 3000);
        });
        Promise.race([Promise.all(promises), timeout]).then(() => {
            callback();
        });
        //}
    }

    private spawn(url:string, mediaOptions?:MediaOptions) {
        //1 = URL is the origin of the content
        return spawnMedia(url, 1, mediaOptions) as any;
    }

    public spawnMediaInfrontOfPlayer(url:string, mediaOptions?:MediaOptions) {
        //1 = URL is the origin of the content
        return spawnMediaInfrontOfPlayer(url, 1, mediaOptions) as any;
    }

    public async spawnAttach(
        mediaFrameName: string,
        url: string,
        config: SpawnAttachConfig = {}) {
        //let mediaFrame = await this.findMediaFrameByName(actionData.action.mediaFrame);
        let mediaFrame: any = document.querySelector("." + mediaFrameName)

        if (mediaFrame) {
            //let mediaFrameComponent = mediaFrame;

            const mfvWorldPos = new THREE.Vector3();
            mediaFrame.object3D.getWorldPosition(mfvWorldPos);

            let mediaFrameComponent = mediaFrame;

            await this.removeOldMediaFrameEntity(mediaFrame);

            let entity: any = await new Promise(async (resolve, reject) => {
                try {
                    const mediaOptions = this.getMediaOptionSetting(config)
                    let {entity, orientation} = this.spawn(url, mediaOptions);//1 = URL is the origin of the content
                    entity.object3D.position.copy(mfvWorldPos);
                    setTimeout(() => {
                        //NOTE: THIS is a hack. We have seen that in case there is a lot of lags the screen can be misplaced initialy. so we set the position again after some time as a fail safe
                        const worldQuat = new THREE.Quaternion();
                        if (mediaFrameComponent.object3D) {
                            entity.object3D.position.copy(mfvWorldPos);
                            mediaFrameComponent.object3D.getWorldQuaternion(worldQuat);
                            entity.object3D.setRotationFromQuaternion(worldQuat);
                            entity.object3D.updateWorldMatrix(true);
                        }
                    }, 1000);
                    orientation.then(() => {
                        const worldQuat = new THREE.Quaternion();
                        if (mediaFrameComponent.object3D) {//TODO is this a bug? in which case this is undefined?
                            entity.object3D.position.copy(mfvWorldPos);
                            mediaFrameComponent.object3D.getWorldQuaternion(worldQuat);
                            entity.object3D.setRotationFromQuaternion(worldQuat);
                            entity.object3D.updateWorldMatrix(true);
                        }
                    });
                    entity = await this.convertToNetEntity(entity);
                    resolve(entity);
                } catch (e) {
                    reject(e);
                }
            });

            entity.setAttribute("release-media-frame-on-destroy", {target: mediaFrameName});

            if (config.attribute) {
                Object.keys(config.attribute).forEach(att => {// eg "forbidden-to-move"
                    entity.setAttribute(att, config.attribute[att]);
                })
            }

            this.onReady(entity, async () => {
                setTimeout(async () => {
                    //apply scale to disable mediaframe old scale?
                    /*capturableEntity.object3D.scale.setScalar(
                      scaleForAspectFit(this.data.bounds, capturableEntity.getObject3D("mesh").scale)
                    );*/

                    // THE MEDIAFRAME NETWORK COMPONENT WAS REMOVED
                    //await this.waitForNetworkEl(mediaFrameComponent);

                    //NAF.entities.completeSync(NAF.clientId,true);
                    if (mediaFrameComponent.capture) {
                        mediaFrameComponent.capture(entity);
                    }
                    if (config.pin) {
                        await pinEntity(entity);
                    }
                    if (!mediaFrameComponent.data) {
                        mediaFrameComponent.data = {};
                    }
                    mediaFrameComponent.data.targetId = entity.id;

                    //applyPersistentSync(entity.components["networked"].data.networkId);//TODO usefull?
                    //applyPersistentSync(mediaFrame.components["networked"].data.networkId);//TODO usefull?
                }, 0);
            });
        } else {
            throw new Error(`invalid media frame target ${mediaFrameName}`);
        }
    }

    private async removeOldMediaFrameEntity(mediaFrame: any): Promise<void> {
        if (!mediaFrame) {
            // List all media-frames and console log them
            Object.keys(NAF.entities.entities).forEach(key => {
                let frame = NAF.entities.entities[key];
            });
            throw new Error(`Invalid media frame target: ${mediaFrame}`);
        }

        let mediaFrameComponent = mediaFrame;
        let capturedEl:any = document.getElementById(mediaFrameComponent.data?.targetId);

        // Release the element just in case
        if (mediaFrameComponent.data?.targetId && mediaFrameComponent.data.targetId !== "empty") {
            mediaFrameComponent.data.targetId = "empty";
        }

        if (!capturedEl) {
            return;
        }

        try {
            // Stop sharing
            const scene = capturedEl.sceneEl;
            if (capturedEl.components["media-video"] && capturedEl.components["media-video"].data.src.startsWith("hubs://")) {
                // hubs:// is the protocol for screen sharing and webcam media
                scene.emit("action_end_video_sharing");
            }

            const networkedEl = await NAF.utils.getNetworkedEntity(capturedEl);

            if (!NAF.utils.isMine(networkedEl)) {
                NAF.utils.takeOwnership(networkedEl);
            }

            // Unpin
            if (!capturedEl.components["media-video"].data.src.startsWith("hubs://")) {
                await unpinEntity(networkedEl);
            }

            // Start remove animation
            networkedEl.setAttribute("animation__remove", {
                property: "scale",
                dur: 200,
                to: {x: 0.01, y: 0.01, z: 0.01},
                easing: "easeInQuad"
            } as any);

            await Promise.race([
                new Promise<void>(resolve => {
                    networkedEl.addEventListener("animationcomplete", () => {
                        if (networkedEl.parentNode) {
                            networkedEl.parentNode.removeChild(networkedEl);
                        }
                        resolve();
                    });
                }),
                new Promise<void>(resolve => setTimeout(resolve, 1000))
            ]);
        } catch (error) {
            if (capturedEl.parentNode) {
                capturedEl.parentNode.removeChild(capturedEl);
            } else {
                capturedEl.remove();
            }
        }
    }

    private async findMediaFrameByName(name: string) {
        return new Promise((resolve) => {
            let mediaFrame = null;
            Object.keys(NAF.entities.entities).forEach(key => {
                let frame = NAF.entities.entities[key];
                if (frame.className === name) {
                    mediaFrame = frame;
                }
            });
            resolve(mediaFrame);
        });
    }

    public async removeFromMediaFrame(mediaFrameName: string) {
        let mediaFrame = await this.findMediaFrameByName(mediaFrameName);
        await this.removeOldMediaFrameEntity(mediaFrame);
    }
}
