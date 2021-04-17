import { networkService } from "../NetworkService";
import { customActionRegister } from "./CustomActionRegister";

export class ActionAnimationController{

    init(){
        networkService.onMessage("animation_play", ({ session_id, type, body, from }) => {
            let actionid = body.id;
            let action = customActionRegister.actions[actionid];
            if (action) {
                action.callback();
            }
        });
    }

    setup(htmlElement,action,actionid){

        let mixer = htmlElement.components["animation-mixer"].mixer;
        let actionAnimation = mixer.clipAction(action.data);
        if (actionAnimation) {
            customActionRegister.actions[actionid] =
                {
                    action: action,
                    callback: () => {
                        actionAnimation.reset();
                        actionAnimation.play();
                        actionAnimation.setLoop(THREE.LoopRepeat, 1);
                    }
                };
        } else {
            console.warn("invalid extension data on animation " + action.data + " not found on mesh");
        }
    }
}