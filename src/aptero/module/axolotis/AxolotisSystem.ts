import { createWorld } from "@aptero/axolotis-player";

let world;
export function getWorld(){
  return world;
}

export async function initAxolotisPlayer(){
  world = await createWorld({
    version:"2.0",
    entities:[
      {components:[/* empty room*/ ]}
    ]
  },(progress, total) => {
    console.log("Axolotis player : [" + progress + "/" + total + "]");
  });
  console.log("Axolotis player : loaded");
}