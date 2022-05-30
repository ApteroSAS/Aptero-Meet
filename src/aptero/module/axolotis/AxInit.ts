import { createWorldSync, WorldEntity } from "@aptero/axolotis-player";
import { registerComponent } from "./StaticComponentDeclaration";

function initAxolotisPlayer(){
  if(!world) {
    world = createWorldSync();
    registerComponent(world);
    console.log("Axolotis player : loaded");
  }
}
export let world:WorldEntity =null;
initAxolotisPlayer();