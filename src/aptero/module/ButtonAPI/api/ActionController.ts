import { customActionRegister } from "./CustomActionRegister";

declare global {
    interface Window {
        syncAnimationsActive?: boolean;
        testVariable?: number;
    }
}
import { networkService } from "../../HubsBridge/service/NetworkService";
import { CustomURL } from "../../customURL/CustomURL"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Vector3, Euler, AnimationMixer, LoopOnce, AnimationClip, MathUtils } from 'three';
import { Action } from "./Action";

export class ActionController {

    process(jsonData, id, sceneuuid, meshuuid, meshName, masterindex) {
        if(!jsonData){
            return;
        }

        if (typeof jsonData === "string" && jsonData.startsWith("\"") && jsonData.endsWith("\"")) {
            jsonData = jsonData.substring(1, jsonData.length - 1);
        }
        if (typeof jsonData === "string" ) {
            if(jsonData.replaceAll) {
                jsonData = jsonData.replaceAll("\\\"", "\"");
            }
            jsonData = JSON.parse(jsonData);
        }
        jsonData.forEach(async (entry, index) => {
            const version = entry.version || 1;
            await this.processEntry(entry, id, sceneuuid, meshuuid, meshName, index, masterindex,version);
        });
    }

    async processEntry(entry, elid, sceneuuid, meshuuid, meshName, pairIndex, masterindex,version) {
        const jquery = (await import('jquery')).default;
        let element = jquery("#" + elid);
        let htmlElement = element.get()[0];
        let networkId = await networkService.getElementNetworkId(htmlElement) || "local";
        let actionIds = [];
        entry.actions.forEach((action, index) => {
            //console.log("[A]------->action.data", action.data)
            let actionid = networkId + "_" + meshName + "_" + masterindex + "_" + pairIndex + "_" + index + "_" + (action.data || "");
            let differentiator = 0;
            while (customActionRegister.actionExist(actionid+ "_"+ differentiator)){
                differentiator++;
            }
            actionid = actionid + "_"+ differentiator;
            actionIds.push(actionid);
            customActionRegister.setup(htmlElement, action, actionid);
        });
        entry.triggers.forEach((trigger, index) => {
            let triggerId = networkId + "_" + meshName + "_" + masterindex + "_" + pairIndex + "_" + index;
            customActionRegister.triggers[triggerId]=trigger;
            //console.log("TRIGGER", trigger)
            //console.log("ENTRY", entry)
            if (trigger.type === "btn") {
                if(!trigger.position){
                    trigger.position=new THREE.Vector3(0,0,0);
                }
                if(!trigger.rotation){
                    trigger.rotation=new THREE.Vector3(0,0,0);
                }
                this.createButtonOnElement(trigger.type, triggerId, actionIds, element, trigger.position, trigger.rotation, trigger.text, trigger.size, trigger.textWidth, trigger.style,version, true, trigger.customModelProperties);
            } else {
                throw new Error("invalid btn type");
            }
        });

    }

    // [!] DevNote: We use *4 size to scale the button to the correct size

    createButtonOnElement(type, triggerId, actionsIds, element, position, rotationDeg, text, size, textWidth, style, version = 1, addReverse = true, customModelProperties = null) {
      
        if (addReverse) {
            this.createButtonOnElement(type, triggerId, actionsIds, element, position, rotationDeg, text, size, textWidth, style,version, false, customModelProperties);
            rotationDeg.y += 180;
            return;
        }

        const mixerEl = document.querySelector('#environment-scene')?.children[0] as any || null;
        //const parentObject = element[0]?.object3D?.parent.children[0];

        // If the button has a custom model, but is NOT attached to a bone, load the custom model
        if (customModelProperties && customModelProperties.url && customModelProperties.url !== "") {
    
            const loader = new GLTFLoader();
            loader.load(customModelProperties.url, (gltf) => {
                const model = gltf.scene;
    
                // Apply position and scale (relative to the parent element's position)
                const modelPosition = customModelProperties.position || { x: 0, y: 0, z: 0 };
                const modelScale = customModelProperties.scale || { x: 1, y: 1, z: 1 };
                
                model.position.set(modelPosition.x, modelPosition.y, modelPosition.z);
                //model.scale.set(modelScale.x, modelScale.y, modelScale.z);
    
                // Create an A-Frame entity to wrap the model
                const customEntity = document.createElement('a-entity');
                element.append(customEntity);

                customEntity.setAttribute('mixin', 'custom-button');
                // Force model after applying the mixin (So we can have the Hover + Unhover triggers)
                customEntity.addEventListener('loaded', () => {
                    (customEntity as any).setObject3D('mesh', model);
                });

                
                // Apply the necessary A-Frame interaction components to the custom entity
                customEntity.setAttribute('is-remote-hover-target', '');
                customEntity.setAttribute('class', 'interactable');
                customEntity.setAttribute('tags', 'singleActionButton:true');

                // Apply the model as part of the A-Frame entity
                (customEntity as any).setObject3D('mesh', model);

                let positionUpdated = new THREE.Vector3(position.x,position.y,position.z);

                let useBoneAnimation = false;

                // Check if the button should sync with a bone
                if (customModelProperties.attachToParentBone && customModelProperties.parentBoneName) {

                    const parentObject = element[0]?.object3D?.parent?.children[0];

                    if (parentObject && parentObject.traverse) {
                        // Deep search for the specified bone
                        let bone = null;
                        parentObject.traverse((object) => {
                            if (object.isBone && (object.name === customModelProperties.parentBoneName || object.name.startsWith(customModelProperties.parentBoneName + "_"))) {
                                bone = object;
                            }
                        });

                        const mixer = mixerEl && mixerEl.components["animation-mixer"].mixer as AnimationMixer;

                        // Inside the bone detection block
                        if (bone && mixer) {
                            // Reset animation to get the bone's initial position
                            const mixerTime = mixer.time;
                            mixer.setTime(0);
                            mixer.time = 0;
                        
                            // Get initial bone world matrix
                            bone.updateWorldMatrix(true, true);
                            const boneMatrixInitial = bone.matrixWorld.clone();
                            const inverseBoneMatrixInitial = new THREE.Matrix4().copy(boneMatrixInitial).invert();
                        
                            // Get button's DESIRED world position (element position + offset)
                            const elementWorldPos = new THREE.Vector3();
                            element[0].object3D.getWorldPosition(elementWorldPos);
                            const buttonWorldPosition = new THREE.Vector3(position.x, position.y, position.z)
                                .add(elementWorldPos);
                        
                            // Convert to bone's LOCAL space using INITIAL bone matrix
                            const localPosition = new THREE.Vector3()
                                .copy(buttonWorldPosition)
                                .applyMatrix4(inverseBoneMatrixInitial);
                        
                            // Get button's DESIRED world rotation
                            const buttonRotation = new THREE.Euler(
                                THREE.MathUtils.degToRad(rotationDeg.x),
                                THREE.MathUtils.degToRad(rotationDeg.y),
                                THREE.MathUtils.degToRad(rotationDeg.z),
                                'XYZ'
                            );
                            const buttonWorldQuat = new THREE.Quaternion()
                                .setFromEuler(buttonRotation);

                                
                            // Compute the button's initial WORLD rotation based on its parent (element)
                            const elementWorldRotation = new THREE.Quaternion();
                            element[0].object3D.getWorldQuaternion(elementWorldRotation).invert();
                            
                            // Apply elementWorldRotation to elementWorldPos
                            elementWorldPos.applyQuaternion(elementWorldRotation);

                            if (!window.syncAnimationsActive) {
                                window.syncAnimationsActive = true;
                            } 
                        
                            // Convert to bone's LOCAL rotation using INITIAL bone rotation
                            const boneInitialQuat = new THREE.Quaternion()
                                .setFromRotationMatrix(boneMatrixInitial);
                            const localQuaternion = boneInitialQuat.clone()
                                .invert()
                                .multiply(buttonWorldQuat);


                            // Retrieve the bone's current world scale.
                            const boneWorldScale = new THREE.Vector3();
                            bone.getWorldScale(boneWorldScale);

                            



                            // Capture initial element and bone matrices
                            element[0].object3D.updateMatrixWorld(true);
                            const elementWorldMatrixInitial = element[0].object3D.matrixWorld.clone();

                            bone.updateMatrixWorld(true);

                            // Compute initial bone local matrix relative to element
                            const inverseElementWorldMatrixInitial = new THREE.Matrix4().copy(elementWorldMatrixInitial).invert();
                            const boneLocalMatrixInitial = new THREE.Matrix4().multiplyMatrices(inverseElementWorldMatrixInitial, boneMatrixInitial);
                            
                            // Decompose initial local matrix to get position and rotation
                            const initialPosition = new THREE.Vector3();
                            const initialRotation = new THREE.Quaternion();
                            const initialScale = new THREE.Vector3();
                            boneLocalMatrixInitial.decompose(initialPosition, initialRotation, initialScale)
                            const updateButtonTransform = () => {

                                bone.updateMatrixWorld(true);
                                const currentBoneMatrix = bone.matrixWorld.clone();                            

                                // Rotate currentBoneMatrix by elementWorldRotation
                                const elementWorldQuat = new THREE.Quaternion()
                                    .copy(elementWorldRotation);

                                // Apply elementWorldRotation to currentBoneMatrix
                                currentBoneMatrix.premultiply(new THREE.Matrix4().makeRotationFromQuaternion(elementWorldQuat));
                        

                                // Apply CURRENT bone transform to INITIAL local position/rotation
                                const worldPosition = new THREE.Vector3()
                                    .copy(localPosition)
                                    .applyMatrix4(currentBoneMatrix);
                        
                                const boneCurrentQuat = new THREE.Quaternion()
                                    .setFromRotationMatrix(currentBoneMatrix);
                                const worldQuaternion = boneCurrentQuat
                                    .clone()
                                    .multiply(localQuaternion);

                        
                                // Convert to Euler for AFRAME
                                const euler = new THREE.Euler()
                                    .setFromQuaternion(worldQuaternion, 'XYZ');

                                

                                // Move worldPosition to the correct position
                                worldPosition.sub(elementWorldPos);

                                // Divide by scale
                                worldPosition.divide(boneWorldScale);


                                //const eulerRotOnly = euler.clone();

                                // Apply elementWorldRotation to the final rotation calculation
                                euler.setFromQuaternion(worldQuaternion.multiply(elementWorldQuat.clone().invert()), 'XYZ');





                                // Get current element and bone world matrices
                                element[0].object3D.updateMatrixWorld(true);
                                const elementWorldMatrixCurrent = element[0].object3D.matrixWorld.clone();

                                const boneMatrixCurrent = bone.matrixWorld.clone();

                                // Compute current bone local matrix relative to element
                                const inverseElementWorldMatrixCurrent = new THREE.Matrix4().copy(elementWorldMatrixCurrent).invert();
                                const boneLocalMatrixCurrent = new THREE.Matrix4().multiplyMatrices(inverseElementWorldMatrixCurrent, boneMatrixCurrent);

                                // Decompose current local matrix
                                const currentPosition = new THREE.Vector3();
                                const currentRotation = new THREE.Quaternion();
                                const currentScale = new THREE.Vector3();
                                boneLocalMatrixCurrent.decompose(currentPosition, currentRotation, currentScale);

                                // Calculate rotation difference: currentRotation * inverse(initialRotation)
                                const rotationDiff = currentRotation.clone().multiply(initialRotation.clone().invert());

                                // Convert to Euler angles
                                const eulerB = new THREE.Euler().setFromQuaternion(rotationDiff, 'XYZ');

                                // Apply rotation to model
                                model.rotation.set(eulerB.x, eulerB.y, eulerB.z);
                                model.updateMatrix();



                                customEntity.setAttribute('position', `${worldPosition.x} ${worldPosition.y} ${worldPosition.z}`);
                            };
                            

                            if (!(mixer as any).syncAnimations) {
                                (mixer as any).syncAnimations = [];
                            }

                            (mixer as any).syncAnimations.push({
                                element: customEntity,
                                update: updateButtonTransform
                            });

                            // Reset the animation to the original time
                            mixer.setTime(mixerTime);
                            mixer.time = mixerTime;
                        }
                    }
                }

                if (!useBoneAnimation) {
                    // Set the default position and rotation if not attached to a bone
                    customEntity.setAttribute('position', `${positionUpdated.x} ${positionUpdated.y} ${positionUpdated.z}`);
                    customEntity.setAttribute('rotation', `${rotationDeg.x} ${rotationDeg.y} ${rotationDeg.z}`);
                }

                // Set the correct scale on the A-Frame entity itself
                customEntity.setAttribute('scale', `${size} ${size} ${size}`);
                customEntity.setAttribute('geometry', 'primitive: box');
                customEntity.setAttribute('raycaster-target', '');

                let hoverActionsIds = [];

                // Register local animation action for the custom model
                if (gltf.animations && gltf.animations.length > 0) {
                    // Add a mixer to the custom entity
                    const mixer = new THREE.AnimationMixer(model);
                    (customEntity as any).object3D.mixer = mixer;

                    const clock = new THREE.Clock();

                    // Generate or retrieve a UUID for the object
                    let objectUuid = customEntity.getAttribute('uuid');
                    if (!objectUuid) {
                        objectUuid = THREE.MathUtils.generateUUID();
                        customEntity.setAttribute('uuid', objectUuid);
                    }

                    // Rename animations and add them to the mixer
                    gltf.animations.forEach((animationClip: AnimationClip) => {
                      // Rename the animation if it doesn't already follow the custom format
                      if (!animationClip.name.startsWith("ApteroANIM_")) {
                          animationClip.name = `ApteroANIM_${animationClip.name}_${objectUuid}`;
                      }
                    });

                    if (customModelProperties.clickAnimation) {
                        if (!customModelProperties.clickAnimation.startsWith("ApteroANIM_")) {
                            customModelProperties.clickAnimation = `ApteroANIM_${customModelProperties.clickAnimation}_${objectUuid}`;
                        }
                    }

                    if (customModelProperties.hoverAnimation) {
                        if (!customModelProperties.hoverAnimation.startsWith("ApteroANIM_")) {
                            customModelProperties.hoverAnimation = `ApteroANIM_${customModelProperties.hoverAnimation}_${objectUuid}`;
                        }
                    }

                    const clickClip = gltf.animations.find((clip: AnimationClip) => clip.name === customModelProperties.clickAnimation);
                    if (customModelProperties.clickAnimation && clickClip) {
                        // Create and register an Action for this animation
                        const animationAction: Action = {
                            type: 'local_animation',
                            data: customModelProperties.clickAnimation,
                            speed: customModelProperties.speed === undefined ? 1 : customModelProperties.speed,
                            mainclick: 5, // Lock to 1 animation or Force reverse if equal
                            reclick: 1,  // Reset and play again on reclick
                            onEnd: 0, // Reset at the end
                            loop: false,
                            repeat: 1
                        };

                        // Create a unique ID for this action
                        const animationActionId = customModelProperties.clickAnimation; 
                        customActionRegister.setup(customEntity, animationAction, animationActionId);
                        actionsIds.push(animationActionId);
                        model.animations.push(clickClip);
                    }

                    const hoverClip = gltf.animations.find((clip: AnimationClip) => clip.name === customModelProperties.hoverAnimation);
                    if (customModelProperties.hoverAnimation && hoverClip) {
                        // Create and register an Action for this animation
                        const animationAction: Action = {
                            type: 'local_animation',
                            data: customModelProperties.hoverAnimation,
                            speed: customModelProperties.speed === undefined ? 1 : customModelProperties.speed,
                            mainclick: 5, // Lock to 1 animation or Force reverse if equal
                            reclick: 1,  // Reset and play again on reclick
                            onEnd: 1, // Pause at the end
                            loop: false,
                            repeat: 1
                        };

                        // Create a unique ID for this action
                        const animationActionId = customModelProperties.hoverAnimation; 
                        customActionRegister.setup(customEntity, animationAction, animationActionId);
                        hoverActionsIds.push(animationActionId);
                        model.animations.push(hoverClip);
                    }

                    // Add a tick function so we can animate the model
                    function animate() {
                        const delta = clock.getDelta(); // Get time elapsed since last frame
                        if (mixer) mixer.update(delta);

                        // Remove if the element is removed
                        if (!customEntity.parentNode || !mixer) {
                            mixer.stopAllAction();
                            return;
                        }

                        requestAnimationFrame(animate);
                    }
                    animate();
                }
                customEntity.setAttribute(
                    'custom-controller-action',
                    `actionIds:${actionsIds.join('+')};
                    triggerId:${triggerId};
                    type:${type};
                    hoverActionIds:${hoverActionsIds.join('+')}`
                );
            }, undefined, (error) => {
                console.error('Error loading custom model:', error);
            });

            return;  // We return because the custom model has been handled, and there's no need to process default button logic
        }

        //1) apply transform to button
        let positionUpdated = new THREE.Vector3(position.x,position.y,position.z);
        element.append(
            "   <a-entity\n" +
            //"       mixin=\"rounded-text-action-button\"\n" +
            "       mixin=\"" + (style || "rounded-button") + "\"\n" +
            "       is-remote-hover-target\n" +
            "       class='interactable'\n" +
            "       custom-controller-action=\"actionIds:" + actionsIds.join("+") + ";triggerId:" + triggerId + ";type:" + type + "\"\n" +
            "       tags=\"singleActionButton:true\"\n" +
            "       scale=\"" + (size*4 || "4") + " " + (size*4 || "4") + " " + (size*4 || "4") + "\" \n" +
            "       rotation=\"" + (rotationDeg ? (rotationDeg.x + " " + rotationDeg.y + " " + rotationDeg.z) : "0 0 0") + "\"\n" +
            "       position=\"" + positionUpdated.x + " " + positionUpdated.y + " " + positionUpdated.z + "\">\n" +
            "       <a-entity\n" +
            "           visible=\"true\"\n" +
            "           text=\" value:" + (text || "click") + "; width:" + (textWidth || "1.75") + "; align:center;\"\n" +
            "           text-raycast-hack\n" +
            "           position=\"0 0 0.01\">\n" +
            "       </a-entity>\n" +
            "   </a-entity>");
    }
}
