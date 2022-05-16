import { Component, createWorld, Services, WorldEntity } from "@aptero/axolotis-player";
import { registerComponent } from "./StaticComponentDeclaration";
export * from "./ModuleDeclaration";

let world:WorldEntity = new WorldEntity();
export function getWorld(){
  return world;
}

export async function getService<T extends Component>(name:string):Promise<T>{
  return world.getFirstComponentByType<Services>(Services.name).getService<T>(name);
}

export async function initAxolotisPlayer(){
  await createWorld({
    version:"2.0",
    entities:[
      {components:[/* empty room*/ ]}
    ]
  },(progress, total) => {
    console.log("Axolotis player : [" + progress + "/" + total + "]");
  },null,world);
  registerComponent(world);
  console.log("Axolotis player : loaded");
}